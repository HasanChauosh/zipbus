import { Webhook } from "svix"
import { headers } from "next/headers"
import { WebhookEvent } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!WEBHOOK_SECRET) {
    return new Response("Webhook secret missing", { status: 500 })
  }

  // Verify the webhook is actually from Clerk
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 })
  }

  // Use the raw text body for signature verification to avoid
  // JSON reserialization altering the payload and invalidating svix signatures.
  const body = await req.text()

  const wh = new Webhook(WEBHOOK_SECRET)
  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    return new Response("Invalid webhook signature", { status: 400 })
  }

  // Handle user created event
  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name, phone_numbers } =
      evt.data

    const email = email_addresses[0]?.email_address
    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()
    const phone = phone_numbers?.[0]?.phone_number ?? null

    await prisma.user.create({
      data: {
        clerkUserId: id,
        email,
        name: name || "ZipBus User",
        phone,
      },
    })

    console.log(`✅ User created in DB: ${email}`)
  }

  // Handle user updated event
  if (evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name, phone_numbers } =
      evt.data

    const email = email_addresses[0]?.email_address
    const name = `${first_name ?? ""} ${last_name ?? ""}`.trim()
    const phone = phone_numbers?.[0]?.phone_number ?? null

    await prisma.user.update({
      where: { clerkUserId: id },
      data: { email, name, phone },
    })

    console.log(`✅ User updated in DB: ${email}`)
  }

  // Handle user deleted event
  if (evt.type === "user.deleted") {
    const { id } = evt.data
    if (id) {
      await prisma.user.delete({
        where: { clerkUserId: id },
      })
      console.log(`✅ User deleted from DB: ${id}`)
    }
  }

  return new Response("OK", { status: 200 })
}