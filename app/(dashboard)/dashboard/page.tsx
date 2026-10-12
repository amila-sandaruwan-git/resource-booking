import Link from 'next/link'
import { getSession } from '@/lib/session'

export const instant = false

export default async function DashboardPage() {
  const session = await getSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {session?.email}
        </h1>
        <p className="text-gray-600 mt-1">
          Manage shared resources and your reservations from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/resources"
          className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition"
        >
          <h2 className="font-semibold text-gray-900">Browse Resources</h2>
          <p className="text-sm text-gray-600 mt-1">
            View all bookable rooms and equipment.
          </p>
        </Link>

        <Link
          href="/reservations"
          className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition"
        >
          <h2 className="font-semibold text-gray-900">My Reservations</h2>
          <p className="text-sm text-gray-600 mt-1">
            See and manage your bookings.
          </p>
        </Link>

        {session?.role === 'ADMIN' && (
          <Link
            href="/admin"
            className="block bg-white p-6 rounded-xl border border-gray-200 hover:border-blue-500 transition"
          >
            <h2 className="font-semibold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-600 mt-1">
              Manage resources and all bookings.
            </p>
          </Link>
        )}
      </div>
    </div>
  )
}