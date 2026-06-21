import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
) {
  const { busId } = await params

  const bus = await prisma.bus.findUnique({
    where: { id: busId },
    include: {
      operator: {
        select: { id: true, name: true, logoUrl: true, rating: true },
      },
      route: {
        select: { source: true, destination: true, distanceKm: true },
      },
      seats: {
        orderBy: [{ tier: "asc" }, { seatNumber: "asc" }],
      },
    },
  })

  if (!bus) {
    return Response.json({ error: "Bus not found" }, { status: 404 })
  }

  const upper = bus.seats.filter((s) => s.tier === "UPPER")
  const lower = bus.seats.filter((s) => s.tier === "LOWER")

  const totalAvailable = bus.seats.filter((s) => s.isAvailable).length
  const totalBooked = bus.seats.filter((s) => !s.isAvailable).length
  const prices = [...new Set(bus.seats.map((s) => s.price))].sort(
    (a, b) => a - b
  )

  return Response.json({
    bus: {
      id: bus.id,
      operator: bus.operator,
      route: bus.route,
      departureTime: bus.departureTime,
      arrivalTime: bus.arrivalTime,
      busType: bus.busType,
      totalSeats: bus.totalSeats,
    },
    seats: {
      upper,
      lower,
    },
    summary: {
      totalAvailable,
      totalBooked,
      prices,
    },
  })
}