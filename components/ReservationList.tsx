'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Reservation = {
  id: string
  startTime: string
  endTime: string
  purpose: string | null
  status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED'
  resource: {
    id: string
    name: string
    type: string
    location: string | null
  }
}

export default function ReservationList({
  reservations,
  canCancel,
}: {
  reservations: Reservation[]
  canCancel: boolean
}) {
  const router = useRouter()
  const [busyId, setBusyId] = useState<string | null>(null)

  async function cancel(id: string) {
    if (!confirm('Cancel this reservation?')) return
    setBusyId(id)
    const res = await fetch(`/api/reservations/${id}`, { method: 'PATCH' })
    setBusyId(null)
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      alert(data.error || 'Failed to cancel')
      return
    }
    router.refresh()
  }

  if (reservations.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <p className="text-gray-500 text-sm">Nothing here yet.</p>
      </div>
    )
  }

  return (
    <ul className="space-y-3">
      {reservations.map((r) => (
        <li
          key={r.id}
          className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-gray-900">
                {r.resource.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                {r.resource.type}
              </span>
              {r.status === 'CANCELLED' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Cancelled
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mt-1">
              {new Date(r.startTime).toLocaleString()} —{' '}
              {new Date(r.endTime).toLocaleTimeString()}
            </p>

            {r.resource.location && (
              <p className="text-xs text-gray-500 mt-0.5">
                📍 {r.resource.location}
              </p>
            )}

            {r.purpose && (
              <p className="text-xs text-gray-500 mt-1 italic">
                {r.purpose}
              </p>
            )}
          </div>

          {canCancel && r.status === 'CONFIRMED' && (
            <button
              onClick={() => cancel(r.id)}
              disabled={busyId === r.id}
              className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50 whitespace-nowrap"
            >
              {busyId === r.id ? 'Cancelling...' : 'Cancel'}
            </button>
          )}
        </li>
      ))}
    </ul>
  )
}