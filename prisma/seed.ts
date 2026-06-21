import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // ─────────────────────────────────────────
  // OPERATORS
  // ─────────────────────────────────────────
  const greenline = await prisma.operator.upsert({
    where: { id: "op_greenline" },
    update: {},
    create: {
      id: "op_greenline",
      name: "Greenline Travels",
      logoUrl: "https://placehold.co/100x100?text=GL",
      rating: 4.3,
      contactPhone: "9876543210",
    },
  })

  const vrl = await prisma.operator.upsert({
    where: { id: "op_vrl" },
    update: {},
    create: {
      id: "op_vrl",
      name: "VRL Travels",
      logoUrl: "https://placehold.co/100x100?text=VRL",
      rating: 4.5,
      contactPhone: "9876543211",
    },
  })

  const pooja = await prisma.operator.upsert({
    where: { id: "op_pooja" },
    update: {},
    create: {
      id: "op_pooja",
      name: "Pooja Travels",
      logoUrl: "https://placehold.co/100x100?text=PT",
      rating: 4.1,
      contactPhone: "9876543212",
    },
  })

  const ksrtc = await prisma.operator.upsert({
    where: { id: "op_ksrtc" },
    update: {},
    create: {
      id: "op_ksrtc",
      name: "KSRTC Karnataka",
      logoUrl: "https://placehold.co/100x100?text=KSRTC",
      rating: 3.9,
      contactPhone: "9876543213",
    },
  })

  console.log("✅ Operators created")

  // ─────────────────────────────────────────
  // ROUTES
  // ─────────────────────────────────────────
  const koppalBangalore = await prisma.route.upsert({
    where: { id: "route_koppal_blr" },
    update: {},
    create: {
      id: "route_koppal_blr",
      source: "Koppal",
      destination: "Bangalore",
      distanceKm: 340,
    },
  })

  const hubbaliBangalore = await prisma.route.upsert({
    where: { id: "route_hubli_blr" },
    update: {},
    create: {
      id: "route_hubli_blr",
      source: "Hubli",
      destination: "Bangalore",
      distanceKm: 418,
    },
  })

  const bangaloreHubli = await prisma.route.upsert({
    where: { id: "route_blr_hubli" },
    update: {},
    create: {
      id: "route_blr_hubli",
      source: "Bangalore",
      destination: "Hubli",
      distanceKm: 418,
    },
  })

  const hospetBangalore = await prisma.route.upsert({
    where: { id: "route_hospet_blr" },
    update: {},
    create: {
      id: "route_hospet_blr",
      source: "Hospet",
      destination: "Bangalore",
      distanceKm: 348,
    },
  })

  const bangaloreMysore = await prisma.route.upsert({
    where: { id: "route_blr_mysore" },
    update: {},
    create: {
      id: "route_blr_mysore",
      source: "Bangalore",
      destination: "Mysore",
      distanceKm: 143,
    },
  })

  console.log("✅ Routes created")

  // ─────────────────────────────────────────
  // BUSES — multiple per route, different operators
  // Departure dates set to near future for demo
  // ─────────────────────────────────────────

  // Helper: build a date with specific hour/minute
  const makeDate = (daysFromNow: number, hour: number, minute = 0) => {
    const d = new Date()
    d.setDate(d.getDate() + daysFromNow)
    d.setHours(hour, minute, 0, 0)
    return d
  }

  // Generate a unique suffix so reseeding never overwrites old bookings
  const todayStamp = new Date().toISOString().split("T")[0].replace(/-/g, "")

  // Koppal → Bangalore buses
  const bus1 = await prisma.bus.create({
    data: {
      id: `bus_kop_blr_1_${todayStamp}`,
      operatorId: greenline.id,
      routeId: koppalBangalore.id,
      departureTime: makeDate(7, 22, 0),
      arrivalTime: makeDate(8, 5, 30),
      busType: "AC_SLEEPER",
      totalSeats: 40,
      isActive: true,
    },
  })

  const bus2 = await prisma.bus.create({
    data: {
      id: `bus_kop_blr_2_${todayStamp}`,
      operatorId: vrl.id,
      routeId: koppalBangalore.id,
      departureTime: makeDate(7, 21, 30),
      arrivalTime: makeDate(8, 5, 0),
      busType: "AC_SLEEPER",
      totalSeats: 40,
      isActive: true,
    },
  })

  const bus3 = await prisma.bus.create({
    data: {
      id: `bus_kop_blr_3_${todayStamp}`,
      operatorId: ksrtc.id,
      routeId: koppalBangalore.id,
      departureTime: makeDate(7, 20, 0),
      arrivalTime: makeDate(8, 4, 30),
      busType: "NON_AC_SEATER",
      totalSeats: 50,
      isActive: true,
    },
  })

  // Hubli → Bangalore buses
  const bus4 = await prisma.bus.create({
    data: {
      id: `bus_hubli_blr_1_${todayStamp}`,
      operatorId: pooja.id,
      routeId: hubbaliBangalore.id,
      departureTime: makeDate(7, 22, 45),
      arrivalTime: makeDate(8, 6, 30),
      busType: "AC_SLEEPER",
      totalSeats: 36,
      isActive: true,
    },
  })

  const bus5 = await prisma.bus.create({
    data: {
      id: `bus_hubli_blr_2_${todayStamp}`,
      operatorId: greenline.id,
      routeId: hubbaliBangalore.id,
      departureTime: makeDate(8, 21, 0),
      arrivalTime: makeDate(9, 5, 0),
      busType: "AC_SEATER",
      totalSeats: 44,
      isActive: true,
    },
  })

  // Hospet → Bangalore
  const bus6 = await prisma.bus.create({
    data: {
      id: `bus_hospet_blr_1_${todayStamp}`,
      operatorId: vrl.id,
      routeId: hospetBangalore.id,
      departureTime: makeDate(7, 21, 0),
      arrivalTime: makeDate(8, 4, 45),
      busType: "AC_SLEEPER",
      totalSeats: 40,
      isActive: true,
    },
  })

  console.log("✅ Buses created")

  // ─────────────────────────────────────────
  // SEATS — generate for each bus
  // AC Sleeper: Upper (₹900) + Lower (₹1100)
  // Non-AC Seater: all same price (₹500)
  // ─────────────────────────────────────────

  async function generateSeats(
    busId: string,
    busType: string,
    totalSeats: number
  ) {
    // NEW — delete in correct order
    const existingSeats = await prisma.seat.findMany({
      where: { busId },
      select: { id: true }
    })
    const existingSeatIds = existingSeats.map(s => s.id)

    // Delete booking_seats first, then seats
    await prisma.bookingSeat.deleteMany({
      where: { seatId: { in: existingSeatIds } }
    })
    await prisma.seat.deleteMany({ where: { busId } })

    const seats = []

    if (busType === "AC_SLEEPER") {
      const halfSeats = totalSeats / 2
      for (let i = 1; i <= halfSeats; i++) {
        // Upper berth
        seats.push({
          busId,
          seatNumber: `U${i}`,
          tier: "UPPER",
          price: 900,
          genderPref: i % 8 === 0 ? "FEMALE_ONLY" : "ANY", // every 8th upper is ladies
          isAvailable: Math.random() > 0.3, // 70% available for realism
        })
        // Lower berth
        seats.push({
          busId,
          seatNumber: `L${i}`,
          tier: "LOWER",
          price: 1100,
          genderPref: i % 8 === 0 ? "FEMALE_ONLY" : "ANY",
          isAvailable: Math.random() > 0.3,
        })
      }
    } else if (busType === "AC_SEATER") {
      for (let i = 1; i <= totalSeats; i++) {
        seats.push({
          busId,
          seatNumber: `S${i}`,
          tier: "LOWER",
          price: 700,
          genderPref: "ANY",
          isAvailable: Math.random() > 0.3,
        })
      }
    } else {
      // NON_AC_SEATER
      for (let i = 1; i <= totalSeats; i++) {
        seats.push({
          busId,
          seatNumber: `S${i}`,
          tier: "LOWER",
          price: 500,
          genderPref: "ANY",
          isAvailable: Math.random() > 0.25,
        })
      }
    }

    await prisma.seat.createMany({ data: seats })
    console.log(`   → ${seats.length} seats created for bus ${busId}`)
  }

  await generateSeats(bus1.id, bus1.busType, bus1.totalSeats)
  await generateSeats(bus2.id, bus2.busType, bus2.totalSeats)
  await generateSeats(bus3.id, bus3.busType, bus3.totalSeats)
  await generateSeats(bus4.id, bus4.busType, bus4.totalSeats)
  await generateSeats(bus5.id, bus5.busType, bus5.totalSeats)
  await generateSeats(bus6.id, bus6.busType, bus6.totalSeats)

  console.log("✅ Seats created")
  // ─────────────────────────────────────────
  // COUPONS
  // ─────────────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "FIRST100" },
    update: {},
    create: {
      code: "FIRST100",
      description: "₹100 off on your first booking",
      discountType: "FLAT",
      discountValue: 100,
      minAmount: 300,
      isActive: true,
    },
  })

  await prisma.coupon.upsert({
    where: { code: "WEEKEND50" },
    update: {},
    create: {
      code: "WEEKEND50",
      description: "₹50 off on weekend travel",
      discountType: "FLAT",
      discountValue: 50,
      minAmount: 200,
      isActive: true,
    },
  })

  await prisma.coupon.upsert({
    where: { code: "RETURN150" },
    update: {},
    create: {
      code: "RETURN150",
      description: "₹150 off on return tickets",
      discountType: "FLAT",
      discountValue: 150,
      minAmount: 500,
      isActive: true,
    },
  })

  console.log("✅ Coupons created")
  console.log("🎉 Seeding complete!")
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// ─────────────────────────────────────────
// COUPONS
// ─────────────────────────────────────────
