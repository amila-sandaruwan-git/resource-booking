import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import ResourceForm from '@/components/ResourceForm'

export const instant = false

export default async function NewResourcePage() {
  const session = await getSession()
  if (!session) redirect('/login')
  if (session.role !== 'ADMIN') redirect('/dashboard')

  return (
    <div className="space-y-6">
      <a
        href="/admin/resources"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to resources
      </a>
      <h1 className="text-2xl font-bold text-gray-900">Add resource</h1>
      <ResourceForm mode="create" />
    </div>
  )
}