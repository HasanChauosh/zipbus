import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const { code, amount } = await req.json()

  if (!code || !amount) {
    return Response.json({ error: "code and amount are required" }, { status: 400 })
  }

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  })

  if (!coupon || !coupon.isActive) {
    return Response.json({ valid: false, error: "Invalid coupon code" }, { status: 404 })
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return Response.json({ valid: false, error: "Coupon has expired" }, { status: 400 })
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return Response.json({ valid: false, error: "Coupon usage limit reached" }, { status: 400 })
  }

  if (amount < coupon.minAmount) {
    return Response.json(
      { valid: false, error: `Minimum order amount is ₹${coupon.minAmount}` },
      { status: 400 }
    )
  }

  let discount = 0
  if (coupon.discountType === "FLAT") {
    discount = coupon.discountValue
  } else {
    discount = (amount * coupon.discountValue) / 100
    if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount)
  }

  discount = Math.min(discount, amount) // never discount more than total

  return Response.json({
    valid: true,
    code: coupon.code,
    discount,
    finalAmount: amount - discount,
    description: coupon.description,
  })
}
