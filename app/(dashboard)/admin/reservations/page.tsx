import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'

export const instant = false

export default async function AdminReservationsPage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'ADMIN') redirect('/dashboard')

  const reservations = await prisma.reservation.findMany({
    include: {
      user: { select: { name: true, email: true } },
      resource: { select: { name: true, type: true } },
    },
    orderBy: { startTime: 'desc' },
  })

  const now = new Date()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">All Reservations</h1>
        <p className="text-gray-600 mt-1">
          {reservations.length} reservation{reservations.length !== 1 ? 's' : ''}{' '}
          total
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Resource</th>
                <th className="px-4 py-3 font-medium">Start</th>
                <th className="px-4 py-3 font-medium">End</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reservations.map((r) => {
                const status =
                  r.status === 'CONFIRMED' && r.endTime < now
                    ? 'COMPLETED'
                    : r.status

                return (
                  <tr key={r.id}>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">
                        {r.user.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {r.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-gray-900">{r.resource.name}</div>
                      <div className="text-xs text-gray-500">
                        {r.resource.type}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(r.startTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {new Date(r.endTime).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          status === 'CONFIRMED'
                            ? 'bg-green-100 text-green-700'
                            : status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}