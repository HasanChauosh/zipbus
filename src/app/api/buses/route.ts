import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)

  const source      = searchParams.get("source")
  const destination = searchParams.get("destination")
  const date        = searchParams.get("date") // format: YYYY-MM-DD

  // Validate required params
  if (!source || !destination || !date) {
    return Response.json(
      { error: "source, destination, and date are required" },
      { status: 400 }
    )
  }

  // Build start and end of the requested date (local calendar day)
  const dateParts = date.split("-").map(Number)
  if (dateParts.length !== 3 || dateParts.some((n) => Number.isNaN(n))) {
    return Response.json({ error: "date must be in YYYY-MM-DD format" }, { status: 400 })
  }

  const [year, month, day] = dateParts
  const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0)
  const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999)

  const buses = await prisma.bus.findMany({
    where: {
      isActive: true,
      departureTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      route: {
        source: {
          equals: source,
          mode: "insensitive", // case-insensitive match
        },
        destination: {
          equals: destination,
          mode: "insensitive",
        },
      },
    },
    include: {
      operator: {
        select: {
          id:    true,
          name:  true,
          logoUrl: true,
          rating: true,
        },
      },
      route: {
        select: {
          source:      true,
          destination: true,
          distanceKm:  true,
        },
      },
      // Count available seats
      seats: {
        where: { isAvailable: true },
        select: { id: true, price: true, tier: true },
      },
    },
    orderBy: {
      departureTime: "asc",
    },
  })

  // Shape the response — don't send raw DB rows to frontend
  const result = buses.map((bus) => {
    const prices = bus.seats.map((s) => s.price)
    const minPrice = prices.length > 0 ? Math.min(...prices) : null

    return {
      id:            bus.id,
      operator:      bus.operator,
      route:         bus.route,
      departureTime: bus.departureTime,
      arrivalTime:   bus.arrivalTime,
      busType:       bus.busType,
      totalSeats:    bus.totalSeats,
      availableSeats: bus.seats.length,
      minPrice,
    }
  })

  return Response.json({ buses: result, count: result.length })
}