import { NextRequest } from "next/server"
import { stripe } from "@/lib/stripe"
import { prisma } from "@/lib/prisma"
import { reminderQueue } from "@/lib/queue"
import Redis from "ioredis"
import { sendBookingConfirmationEmail } from "@/lib/resend"

const redis = new Redis(process.env.REDIS_URL!)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get("stripe-signature")!

  let event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Stripe webhook verification failed:", err)
    return new Response("Invalid signature", { status: 400 })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any
    const bookingId = session.metadata?.bookingId

    if (!bookingId) {
      return new Response("No bookingId in metadata", { status: 400 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        bookingSeats: { include: { seat: true } },
        bus: { include: { route: true, operator: true } },
        passenger: true,
      },
    })

    if (!booking) {
      return new Response("Booking not found", { status: 404 })
    }

    // Idempotency: skip if already confirmed
    if (booking.status === "CONFIRMED") {
      console.log(`Booking ${bookingId} already confirmed, skipping`) 
      // still try to cleanup locks and schedule if needed
    }

    // Transaction — confirm booking + mark seats + create reminder logs
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({ where: { id: bookingId }, data: { status: "CONFIRMED" } })

      const seatIds = booking.bookingSeats.map((bs) => bs.seatId)
      await tx.seat.updateMany({ where: { id: { in: seatIds } }, data: { isAvailable: false } })

      const departureTime = booking.bus.departureTime

// NOTE: Using 3min and 6min before booking for demo purposes
// Production values: T-30 and T-15 before departure
const t30 = new Date(Date.now() + 3 * 60 * 1000)  // 3 minutes from now
const t15 = new Date(Date.now() + 6 * 60 * 1000)  // 6 minutes from now

      await tx.reminderLog.createMany({
        data: [
          { bookingId, type: "T_MINUS_30", scheduledAt: t30, channel: "VOICE", status: "PENDING" },
          { bookingId, type: "T_MINUS_15", scheduledAt: t15, channel: "SMS", status: "PENDING" },
        ],
      })
    })

    // Release Redis locks
    for (const bs of booking.bookingSeats) {
      await redis.del(`seat_lock:${booking.busId}:${bs.seatId}`)
    }

    // Schedule BullMQ jobs with delays
    const reminders = await prisma.reminderLog.findMany({ where: { bookingId } })

    for (const reminder of reminders) {
      const delay = reminder.scheduledAt.getTime() - Date.now()

      if (delay > 0) {
        await reminderQueue.add(
          "send-reminder",
          { reminderId: reminder.id },
          { delay }
        )
        console.log(`📅 Scheduled ${reminder.type} in ${Math.round(delay / 60000)} minutes`)
      } else {
        console.log(`⚠️ ${reminder.type} time already passed, skipping`)
      }
    }

    console.log(`✅ Booking confirmed: ${bookingId}`)

    // Send confirmation email (non-blocking for Stripe webhook)
    try {
      const seatNumbers = booking.bookingSeats.map((bs) => bs.seat.seatNumber)
      await sendBookingConfirmationEmail({
        to: booking.passenger!.email,
        passengerName: booking.passenger!.name,
        operatorName: booking.bus.operator.name,
        source: booking.bus.route.source,
        destination: booking.bus.route.destination,
        departureTime: booking.bus.departureTime,
        seatNumbers,
        bookingId,
        totalAmount: booking.totalAmount,
      })
      console.log("📧 Confirmation email sent")
    } catch (err) {
      console.error("Failed to send confirmation email:", err)
    }
  }

  return new Response("OK", { status: 200 })
}