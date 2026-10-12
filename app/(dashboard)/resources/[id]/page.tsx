import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import BookingForm from '@/components/BookingForm'

export const instant = false

export default async function ResourceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const resource = await prisma.resource.findUnique({
    where: { id },
    include: {
      reservations: {
        where: {
          status: 'CONFIRMED',
          endTime: { gte: new Date() },
        },
        select: {
          id: true,
          startTime: true,
          endTime: true,
          user: { select: { name: true } },
        },
        orderBy: { startTime: 'asc' },
        take: 10,
      },
    },
  })

  if (!resource || !resource.isActive) notFound()

  return (
    <div className="space-y-6">
      <Link href="/resources" className="text-sm text-blue-600 hover:underline">
        ← Back to resources
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left — details + upcoming bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {resource.name}
                </h1>
                <span className="inline-block mt-1 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                  {resource.type}
                </span>
              </div>
            </div>

            {resource.description && (
              <p className="text-gray-700 mb-4">{resource.description}</p>
            )}

            <dl className="grid grid-cols-2 gap-4 text-sm">
              {resource.location && (
                <div>
                  <dt className="text-gray-500">Location</dt>
                  <dd className="font-medium text-gray-900">{resource.location}</dd>
                </div>
              )}
              {resource.capacity && (
                <div>
                  <dt className="text-gray-500">Capacity</dt>
                  <dd className="font-medium text-gray-900">{resource.capacity}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Upcoming reservations */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">
              Upcoming reservations
            </h2>
            {resource.reservations.length === 0 ? (
              <p className="text-sm text-gray-500">No upcoming reservations.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {resource.reservations.map((r) => (
                  <li key={r.id} className="py-3 text-sm flex justify-between">
                    <span className="text-gray-700">
                      {new Date(r.startTime).toLocaleString()}
                    </span>
                    <span className="text-gray-500">
                      → {new Date(r.endTime).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right — booking form */}
        <div>
          <BookingForm resourceId={resource.id} resourceName={resource.name} />
        </div>
      </div>
    </div>
  )
}