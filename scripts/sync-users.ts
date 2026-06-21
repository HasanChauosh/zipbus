import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })
import { PrismaClient } from "@prisma/client"
import { clerkClient } from "@clerk/nextjs/server"

const prisma = new PrismaClient()

async function main() {
  // Fetch users from Clerk
  const client = await clerkClient()
  const users: any = await client.users.getUserList({ limit: 100 })
  const userList: any[] = Array.isArray(users) ? users : users?.data ?? users?.results ?? users?.users ?? []

  for (const user of userList) {
    const email = user.emailAddresses?.[0]?.emailAddress
    const name = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim()

    await prisma.user.upsert({
      where: { clerkUserId: user.id },
      update: {
        email,
        name: name || "ZipBus User",
      },
      create: {
        clerkUserId: user.id,
        email,
        name: name || "ZipBus User",
      },
    })

    console.log(`✅ Synced: ${email}`)
  }
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
