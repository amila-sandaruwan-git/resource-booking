import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const instant = false

export default async function AdminPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'ADMIN') redirect('/dashboard')

  const [resourceCount, reservationCount, activeReservations] =
    await Promise.all([
      prisma.resource.count({ where: { isActive: true } }),
      prisma.reservation.count(),
      prisma.reservation.count({
        where: { status: 'CONFIRMED', endTime: { gte: new Date() } },
      }),
    ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-1">
          Manage resources and oversee all reservations.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Active Resources</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {resourceCount}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Upcoming Reservations</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {activeReservations}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <p className="text-sm text-gray-500">Total Reservations</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {reservationCount}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <a
          href="/admin/resources"
          className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition"
        >
          <h2 className="font-semibold text-gray-900">Manage Resources</h2>
          <p className="text-sm text-gray-600 mt-1">
            Add, edit, or deactivate resources.
          </p>
        </a>
        <a
          href="/admin/reservations"
          className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition"
        >
          <h2 className="font-semibold text-gray-900">All Reservations</h2>
          <p className="text-sm text-gray-600 mt-1">
            View every reservation across all users.
          </p>
        </a>
      </div>
    </div>
  )
}