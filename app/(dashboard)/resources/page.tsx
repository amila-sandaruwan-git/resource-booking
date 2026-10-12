// app/(dashboard)/resources/page.tsx

import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import ResourceCard from '@/components/ResourceCard'

export const instant = false

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; type?: string }>
}) {
  const { search = '', type = '' } = await searchParams

  const where: Prisma.ResourceWhereInput = { isActive: true }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { location: { contains: search, mode: 'insensitive' } },
    ]
  }
  if (type) where.type = type

  const resources = await prisma.resource.findMany({
    where,
    orderBy: { name: 'asc' },
  })

  // Distinct types for filter dropdown
  const allTypes = await prisma.resource.findMany({
    where: { isActive: true },
    select: { type: true },
    distinct: ['type'],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-600 mt-1">
          {resources.length} resource{resources.length !== 1 ? 's' : ''} available
        </p>
      </div>

      {/* Search + filter bar */}
      <form className="flex flex-wrap gap-3" method="GET">
        <input
          type="text"
          name="search"
          defaultValue={search}
          placeholder="Search by name, location..."
          className="flex-1 min-w-50 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          name="type"
          defaultValue={type}
          className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All types</option>
          {allTypes.map((t) => (
            <option key={t.type} value={t.type}>
              {t.type}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
        >
          Search
        </button>
      </form>

      {/* Grid */}
      {resources.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No resources found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  )
}