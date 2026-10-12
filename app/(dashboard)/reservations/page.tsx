import { prisma } from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import ReservationList from '@/components/ReservationList'

export const instant = false

export default async function ReservationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.userId },
    include: {
      resource: {
        select: { id: true, name: true, type: true, location: true },
      },
    },
    orderBy: { startTime: 'desc' },
  })

  const now = new Date()
  const upcoming = reservations.filter(
    (r) => r.status === 'CONFIRMED' && r.endTime >= now
  )
  const past = reservations.filter(
    (r) => r.status === 'CANCELLED' || r.endTime < now
  )

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Reservations</h1>
        <p className="text-gray-600 mt-1">
          View and manage your resource bookings.
        </p>
      </div>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Upcoming ({upcoming.length})
        </h2>
        <ReservationList
          reservations={upcoming.map((r) => ({
            id: r.id,
            startTime: r.startTime.toISOString(),
            endTime: r.endTime.toISOString(),
            purpose: r.purpose,
            status: r.status,
            resource: r.resource,
          }))}
          canCancel
        />
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Past & Cancelled ({past.length})
        </h2>
        <ReservationList
          reservations={past.map((r) => ({
            id: r.id,
            startTime: r.startTime.toISOString(),
            endTime: r.endTime.toISOString(),
            purpose: r.purpose,
            status: r.status,
            resource: r.resource,
          }))}
          canCancel={false}
        />
      </section>
    </div>
  )
}