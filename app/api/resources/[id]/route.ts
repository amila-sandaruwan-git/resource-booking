import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin, requireAuth } from '@/lib/auth-helpers'
import { resourceSchema } from '@/lib/validators'

// GET /api/resources/:id — any logged-in user
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const { id } = await params
  const resource = await prisma.resource.findUnique({ where: { id } })

  if (!resource) {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  }
  return NextResponse.json(resource)
}

// PATCH /api/resources/:id — admin only
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    const body = await request.json()
    const parsed = resourceSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name.trim() }),
        ...(data.type !== undefined && { type: data.type.trim() }),
        ...(data.description !== undefined && {
          description: data.description?.trim() || null,
        }),
        ...(data.capacity !== undefined && { capacity: data.capacity ?? null }),
        ...(data.location !== undefined && {
          location: data.location?.trim() || null,
        }),
      },
    })
    return NextResponse.json(resource)
  } catch (error) {
    console.error('[RESOURCES PATCH]', error)
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    )
  }
}

// DELETE /api/resources/:id — admin only (soft delete)
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  const { id } = await params
  try {
    await prisma.resource.update({
      where: { id },
      data: { isActive: false },
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[RESOURCES DELETE]', error)
    return NextResponse.json(
      { error: 'Failed to delete resource' },
      { status: 500 }
    )
  }
}