import { NextRequest } from "next/server"
import { auth } from "@clerk/nextjs/server"
import Redis from "ioredis"

const redis = new Redis(process.env.REDIS_URL!)

const LOCK_TTL_SECONDS = 600

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { busId } = await params
  const { seatId } = await req.json()

  if (!seatId) {
    return Response.json({ error: "seatId is required" }, { status: 400 })
  }

  const lockKey = `seat_lock:${busId}:${seatId}`
  const existingLock = await redis.get(lockKey)

  if (existingLock && existingLock !== userId) {
    return Response.json(
      { error: "Seat is temporarily held by another user" },
      { status: 409 }
    )
  }

  await redis.setex(lockKey, LOCK_TTL_SECONDS, userId)

  return Response.json({
    locked: true,
    seatId,
    expiresIn: LOCK_TTL_SECONDS,
  })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ busId: string }> }
) {
  const { userId } = await auth()
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { busId } = await params
  const { seatId } = await req.json()

  const lockKey = `seat_lock:${busId}:${seatId}`
  const existingLock = await redis.get(lockKey)

  if (existingLock === userId) {
    await redis.del(lockKey)
  }

  return Response.json({ unlocked: true, seatId })
}