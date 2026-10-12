import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-helpers'

// GET /api/admin/reservations — all reservations (admin only)
export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const reservations = await prisma.reservation.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      resource: {
        select: { id: true, name: true, type: true, location: true },
      },
    },
    orderBy: { startTime: 'desc' },
  })

  return NextResponse.json(reservations)
}