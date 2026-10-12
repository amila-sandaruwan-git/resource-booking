import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-helpers'

// PATCH /api/reservations/:id — cancel a reservation
export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response
  const { session } = auth

  const { id } = await params

  const reservation = await prisma.reservation.findUnique({ where: { id } })

  if (!reservation) {
    return NextResponse.json(
      { error: 'Reservation not found' },
      { status: 404 }
    )
  }

  // Only the owner or an admin can cancel
  if (
    reservation.userId !== session.userId &&
    session.role !== 'ADMIN'
  ) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (reservation.status !== 'CONFIRMED') {
    return NextResponse.json(
      { error: 'Only confirmed reservations can be cancelled' },
      { status: 400 }
    )
  }

  // Can't cancel a reservation that already ended
  if (reservation.endTime < new Date()) {
    return NextResponse.json(
      { error: 'Cannot cancel a past reservation' },
      { status: 400 }
    )
  }

  const updated = await prisma.reservation.update({
    where: { id },
    data: { status: 'CANCELLED' },
  })

  return NextResponse.json(updated)
}