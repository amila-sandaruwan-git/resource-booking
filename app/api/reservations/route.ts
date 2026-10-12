import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'
import { reservationSchema } from '@/lib/validators'

// POST /api/reservations — create reservation with overlap check
export async function POST(request: Request) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { session } = auth

  try {
    const body = await request.json()
    const parsed = reservationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { resourceId, startTime, endTime, purpose } = parsed.data
    const start = new Date(startTime)
    const end = new Date(endTime)
    const now = new Date()

    // Validation: can't book in the past
    if (start < now) {
      return NextResponse.json(
        { error: 'Cannot book a time in the past' },
        { status: 400 }
      )
    }

    // Validation: check resource exists and is active
    const resource = await prisma.resource.findUnique({
      where: { id: resourceId },
    })
    if (!resource || !resource.isActive) {
      return NextResponse.json(
        { error: 'Resource not found or inactive' },
        { status: 404 }
      )
    }

    // 🔑 THE CORE FEATURE: Overlap detection
    // Two time ranges [a1,a2] and [b1,b2] overlap iff:
    //   a1 < b2 AND a2 > b1
    const conflict = await prisma.reservation.findFirst({
      where: {
        resourceId,
        status: 'CONFIRMED',
        AND: [
          { startTime: { lt: end } },
          { endTime: { gt: start } },
        ],
      },
    })

    if (conflict) {
      return NextResponse.json(
        {
          error:
            'This resource is already booked during that time. Please choose a different slot.',
          conflict: {
            start: conflict.startTime,
            end: conflict.endTime,
          },
        },
        { status: 409 }
      )
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId: session.userId,
        resourceId,
        startTime: start,
        endTime: end,
        purpose: purpose?.trim() || null,
        status: 'CONFIRMED',
      },
      include: {
        resource: { select: { name: true } },
      },
    })

    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    console.error('[RESERVATIONS POST]', error)
    return NextResponse.json(
      { error: 'Failed to create reservation' },
      { status: 500 }
    )
  }
}

// GET /api/reservations — list current user's reservations
export async function GET() {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { session } = auth

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.userId },
    include: {
      resource: {
        select: { id: true, name: true, type: true, location: true },
      },
    },
    orderBy: { startTime: 'desc' },
  })

  return NextResponse.json(reservations)
}