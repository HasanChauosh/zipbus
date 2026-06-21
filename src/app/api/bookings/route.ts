import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { stripe } from "@/lib/stripe"

import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL!)

export async function POST(req: NextRequest) {
  const { userId: clerkUserId } = await auth()

  if (!clerkUserId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { busId, seatIds, passengerDetails,couponCode } = await req.json()

  if (!busId || !seatIds?.length || !passengerDetails) {
    return Response.json({ error: "busId, seatIds and passengerDetails are required" }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { clerkUserId } })

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 })
  }

  const seats = await prisma.seat.findMany({
    where: {
      id: { in: seatIds },
      busId,
      isAvailable: true,
    },
  })

  if (seats.length !== seatIds.length) {
    return Response.json(
      { error: "One or more seats are unavailable or invalid" },
      { status: 409 }
    )
  }

  for (const seat of seats) {
    const lockKey = `seat_lock:${busId}:${seat.id}`
    const lockOwner = await redis.get(lockKey)

    if (!lockOwner) {
      return Response.json(
        { error: `Seat ${seat.seatNumber} is not locked. Please select it again.` },
        { status: 409 }
      )
    }

    if (lockOwner !== clerkUserId) {
      return Response.json(
        { error: `Seat ${seat.seatNumber} is held by another user` },
        { status: 409 }
      )
    }
  }

  const totalAmount = seats.reduce((sum, seat) => sum + seat.price, 0)

  // Apply coupon if provided
let finalAmount = totalAmount
let appliedCoupon = null

if (couponCode) {
  const coupon = await prisma.coupon.findUnique({ where: { code: couponCode.toUpperCase() } })

  if (coupon && coupon.isActive && totalAmount >= coupon.minAmount) {
    let discount = coupon.discountType === "FLAT"
      ? coupon.discountValue
      : (totalAmount * coupon.discountValue) / 100

    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
    discount = Math.min(discount, totalAmount)

    finalAmount = totalAmount - discount
    appliedCoupon = coupon.code

    // Increment usage count
    await prisma.coupon.update({
      where: { id: coupon.id },
      data: { usedCount: { increment: 1 } },
    })
  }
}
  

  const bus = await prisma.bus.findUnique({ where: { id: busId }, include: { route: true, operator: true } })

  if (!bus) {
    return Response.json({ error: "Bus not found" }, { status: 404 })
  }

  const booking = await prisma.$transaction(async (tx) => {
    const newBooking = await tx.booking.create({
      data: {
        userId:      user.id,
        busId,
        totalAmount: finalAmount,
        status:      "PENDING",
        bookingSeats: {
          create: seats.map((seat) => ({ seatId: seat.id, priceAtBooking: seat.price })),
        },
        passenger: {
          create: {
            name:   passengerDetails.name,
            phone:  passengerDetails.phone,
            email:  passengerDetails.email,
            gender: passengerDetails.gender,
          },
        },
      },
    })

    return newBooking
  })

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "inr",
          product_data: {
            name: `${bus.operator.name} — ${bus.route.source} to ${bus.route.destination}`,
            description: `${seats.map((s) => s.seatNumber).join(", ")} | Departure: ${bus.departureTime.toISOString()}`,
          },
          unit_amount: Math.round(finalAmount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id,
      userId:    user.id,
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/booking/${booking.id}?status=success`,
    cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/bus/${busId}/seats?status=cancelled`,
  })

  await prisma.booking.update({ where: { id: booking.id }, data: { stripePaymentId: session.id } })

  return Response.json({ bookingId: booking.id, checkoutUrl: session.url })
}
export async function GET() {
  return Response.json({ ok: true, route: "bookings" });
}