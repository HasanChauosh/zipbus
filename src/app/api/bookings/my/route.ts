import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const { userId: clerkUserId } = await auth()
  if (!clerkUserId) return Response.json({ error: "Unauthorized" }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { clerkUserId } })
  if (!user) return Response.json({ bookings: [] })

  const bookings = await prisma.booking.findMany({
    where: { userId: user.id },
    include: {
      bus: {
        include: {
          operator: { select: { name: true } },
          route: { select: { source: true, destination: true } },
        },
      },
      bookingSeats: { include: { seat: { select: { seatNumber: true, tier: true } } } },
      passenger: { select: { name: true, phone: true, email: true } },
    },
    orderBy: { bookedAt: "desc" },
  })

  return Response.json({ bookings })
}
