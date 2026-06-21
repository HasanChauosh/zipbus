import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

import { Worker, Job } from "bullmq"
import { connection } from "../lib/queue"
import { prisma } from "../lib/prisma"
import { sendBoardingReminderEmail } from "../lib/resend"
import twilio from "twilio"

// ─────────────────────────────────────────
// TWILIO — Voice Call
// ─────────────────────────────────────────
async function sendVoiceCall(phone: string, message: string) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )

  const call = await client.calls.create({
    twiml: `<Response><Say voice="alice" language="en-IN">${message}</Say></Response>`,
    to: `+91${phone.slice(-10)}`,
    from: process.env.TWILIO_PHONE_NUMBER!,
  })

  console.log("✅ Twilio call SID:", call.sid)
  return call
}

// ─────────────────────────────────────────
// MSG91 — SMS (keep as fallback)
// ─────────────────────────────────────────
async function sendSMS(phone: string, message: string) {
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID!,
    process.env.TWILIO_AUTH_TOKEN!
  )

  const msg = await client.messages.create({
    body: message,
    to: `+91${phone.slice(-10)}`,
    from: process.env.TWILIO_PHONE_NUMBER!,
  })

  console.log("✅ Twilio SMS SID:", msg.sid)
  return msg
}

// ─────────────────────────────────────────
// WORKER
// ─────────────────────────────────────────
const worker = new Worker(
  "reminders",
  async (job: Job) => {
    const { reminderId } = job.data

    const reminder = await prisma.reminderLog.findUnique({
      where: { id: reminderId },
      include: {
        booking: {
          include: {
            passenger: true,
            bus: {
              include: {
                route:    true,
                operator: true,
              },
            },
          },
        },
      },
    })

    if (!reminder) throw new Error(`Reminder ${reminderId} not found`)
    if (reminder.status === "SENT") {
      console.log(`Reminder ${reminderId} already sent, skipping`)
      return
    }

    const { passenger, bus } = reminder.booking
    const minutesBefore = reminder.type === "T_MINUS_30" ? 30 : 15

    const message = `Hello ${passenger!.name}, your ${bus.operator.name} bus from ${bus.route.source} to ${bus.route.destination} departs in ${minutesBefore} minutes. Please be at your boarding point now.`

    try {
      if (reminder.channel === "VOICE") {
        await sendVoiceCall(passenger!.phone, message)
      } else {
        await sendSMS(passenger!.phone, message)
      }

      // Always send email as backup
      try {
        await sendBoardingReminderEmail({
          to:            passenger!.email,
          passengerName: passenger!.name,
          operatorName:  bus.operator.name,
          source:        bus.route.source,
          destination:   bus.route.destination,
          boardingPoint: "Your boarding point",
          minutesBefore,
        })
        console.log("📧 Reminder email sent")
      } catch (err) {
        console.warn("Email reminder failed (non-blocking):", err)
      }

      // Mark as SENT
      await prisma.reminderLog.update({
        where: { id: reminderId },
        data:  { status: "SENT", sentAt: new Date() },
      })

      console.log(`✅ Reminder sent: ${reminder.type} for booking ${reminder.bookingId}`)

    } catch (err: any) {
      await prisma.reminderLog.update({
        where: { id: reminderId },
        data:  { status: "FAILED" },
      })
      throw err
    }
  },
  {
    connection,
    concurrency: 5,
  }
)

worker.on("completed", (job) => console.log(`✅ Job ${job.id} completed`))
worker.on("failed", (job, err) => console.error(`❌ Job ${job?.id} failed:`, err?.message))

console.log("🚀 Reminder worker started — Twilio voice calls active")

export default worker
