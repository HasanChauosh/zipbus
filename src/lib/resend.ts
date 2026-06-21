import { Resend } from "resend"

export const resend = new Resend(process.env.RESEND_API_KEY!)

export async function sendBookingConfirmationEmail({
  to,
  passengerName,
  operatorName,
  source,
  destination,
  departureTime,
  seatNumbers,
  bookingId,
  totalAmount,
}: {
  to: string
  passengerName: string
  operatorName: string
  source: string
  destination: string
  departureTime: Date
  seatNumbers: string[]
  bookingId: string
  totalAmount: number
}) {
  await resend.emails.send({
    from: "ZipBus <onboarding@resend.dev>",
    to,
    subject: `Your ZipBus ticket confirmed — ${source} to ${destination}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f97316;">🚌 ZipBus — Booking Confirmed!</h2>

        <div style="background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Passenger:</strong> ${passengerName}</p>
          <p><strong>Operator:</strong> ${operatorName}</p>
          <p><strong>Route:</strong> ${source} → ${destination}</p>
          <p><strong>Departure:</strong> ${new Date(departureTime).toLocaleString("en-IN")}</p>
          <p><strong>Seats:</strong> ${seatNumbers.join(", ")}</p>
          <p><strong>Amount Paid:</strong> ₹${totalAmount}</p>
          <p><strong>Booking ID:</strong> ${bookingId}</p>
        </div>

        <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #f97316;">
          <p><strong>📞 Automated Reminder:</strong> You will receive an automated call and message 30 minutes and 15 minutes before departure. No need to worry — ZipBus has you covered!</p>
        </div>

        <p style="color: #666; font-size: 12px;">Thank you for choosing ZipBus. Have a safe journey!</p>
      </div>
    `,
  })
}

export async function sendBoardingReminderEmail({
  to,
  passengerName,
  operatorName,
  source,
  destination,
  boardingPoint,
  minutesBefore,
}: {
  to: string
  passengerName: string
  operatorName: string
  source: string
  destination: string
  boardingPoint: string
  minutesBefore: number
}) {
  await resend.emails.send({
    from: "ZipBus <onboarding@resend.dev>",
    to,
    subject: `⏰ Your bus departs in ${minutesBefore} minutes — ZipBus`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #ef4444;">⏰ ${minutesBefore} Minutes to Departure!</h2>

        <div style="background: #fef2f2; padding: 20px; border-radius: 8px; border-left: 4px solid #ef4444;">
          <p>Hello <strong>${passengerName}</strong>,</p>
          <p>Your <strong>${operatorName}</strong> bus from <strong>${source}</strong> to <strong>${destination}</strong> departs in <strong>${minutesBefore} minutes</strong>.</p>
          <p><strong>📍 Please be at:</strong> ${boardingPoint}</p>
        </div>

        <p style="color: #666;">This is an automated reminder from ZipBus. Please do not reply to this email.</p>
      </div>
    `,
  })
}

export default resend
