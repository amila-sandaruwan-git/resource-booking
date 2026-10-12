import Link from 'next/link'

type Resource = {
  id: string
  name: string
  type: string
  description: string | null
  capacity: number | null
  location: string | null
}

const TYPE_COLORS: Record<string, string> = {
  'Meeting Room': 'bg-blue-100 text-blue-700',
  Vehicle: 'bg-green-100 text-green-700',
  Equipment: 'bg-purple-100 text-purple-700',
  'Event Space': 'bg-pink-100 text-pink-700',
}

export default function ResourceCard({ resource }: { resource: Resource }) {
  const colorClass = TYPE_COLORS[resource.type] || 'bg-gray-100 text-gray-700'

  return (
    <Link
      href={`/resources/${resource.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-500 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold text-gray-900 text-lg">{resource.name}</h3>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${colorClass}`}>
          {resource.type}
        </span>
      </div>

      {resource.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {resource.description}
        </p>
      )}

      <div className="flex flex-wrap gap-3 text-xs text-gray-500">
        {resource.location && (
          <span className="flex items-center gap-1">📍 {resource.location}</span>
        )}
        {resource.capacity && (
          <span className="flex items-center gap-1">👥 {resource.capacity}</span>
        )}
      </div>
    </Link>
  )
}