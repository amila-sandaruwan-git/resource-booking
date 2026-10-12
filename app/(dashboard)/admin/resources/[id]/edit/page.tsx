import { notFound, redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { prisma } from '@/lib/prisma'
import ResourceForm from '@/components/ResourceForm'

export const instant = false

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'ADMIN') redirect('/dashboard')

  const { id } = await params
  const resource = await prisma.resource.findUnique({ where: { id } })
  if (!resource) notFound()

  return (
    <div className="space-y-6">
      <a
        href="/admin/resources"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to resources
      </a>
      <h1 className="text-2xl font-bold text-gray-900">Edit resource</h1>
      <ResourceForm
        mode="edit"
        initial={{
          id: resource.id,
          name: resource.name,
          type: resource.type,
          description: resource.description ?? '',
          capacity: resource.capacity?.toString() ?? '',
          location: resource.location ?? '',
        }}
      />
    </div>
  )
}