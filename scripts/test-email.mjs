import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

async function main() {
  try {
    const res = await resend.emails.send({
      from: 'ZipBus <onboarding@resend.dev>',
      to: 'hasanchauosh6361@gmail.com',
      subject: 'ZipBus test email',
      html: '<h1>ZipBus email works! 🚌</h1>',
    })
    console.log('✅ Email sent:', res)
  } catch (err) {
    console.error('❌ Email failed:', err)
    process.exitCode = 1
  }
}

main()
