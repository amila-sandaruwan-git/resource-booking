// components/ResourceForm.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type ResourceInput = {
  id?: string
  name: string
  type: string
  description: string
  capacity: string
  location: string
}

export default function ResourceForm({
  initial,
  mode,
}: {
  initial?: Partial<ResourceInput>
  mode: 'create' | 'edit'
}) {
  const router = useRouter()
  const [form, setForm] = useState<ResourceInput>({
    id: initial?.id,
    name: initial?.name ?? '',
    type: initial?.type ?? 'Meeting Room',
    description: initial?.description ?? '',
    capacity: initial?.capacity ?? '',
    location: initial?.location ?? '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    type ResourcePayload = {
      name: string
      type: string
      description?: string
      capacity?: number
      location?: string
    }

    const payload: ResourcePayload = {
      name: form.name.trim(),
      type: form.type.trim(),
      description: form.description.trim() || undefined,
      location: form.location.trim() || undefined,
    }
    if (form.capacity.trim()) {
      payload.capacity = Number(form.capacity)
    }

    const url =
      mode === 'create'
        ? '/api/resources'
        : `/api/resources/${form.id}`
    const method = mode === 'create' ? 'POST' : 'PATCH'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || 'Failed to save')
      return
    }

    router.push('/admin/resources')
    router.refresh()
  }

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 max-w-xl"
    >
      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Type *
        </label>
        <select
          required
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option>Meeting Room</option>
          <option>Event Space</option>
          <option>Equipment</option>
          <option>Vehicle</option>
          <option>Other</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Capacity
          </label>
          <input
            type="number"
            min="1"
            value={form.capacity}
            onChange={(e) => setForm({ ...form, capacity: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-4 py-2 rounded-lg transition"
        >
          {loading
            ? 'Saving...'
            : mode === 'create'
            ? 'Create resource'
            : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="text-gray-600 hover:text-gray-900 px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}