// app/api/resources/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { requireAdmin, requireAuth } from '@/lib/auth-helpers'
import { resourceSchema } from '@/lib/validators'

// GET /api/resources — any logged-in user
export async function GET(request: Request) {
  const auth = await requireAuth()
  if (!auth.ok) return auth.response

  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.trim() || ''
  const type = searchParams.get('type')?.trim() || ''

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

  return NextResponse.json(resources)
}

// POST /api/resources — admin only
export async function POST(request: Request) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth.response

  try {
    const body = await request.json()
    const parsed = resourceSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const data = parsed.data
    const resource = await prisma.resource.create({
      data: {
        name: data.name.trim(),
        type: data.type.trim(),
        description: data.description?.trim() || null,
        capacity: data.capacity ?? null,
        location: data.location?.trim() || null,
      },
    })

    return NextResponse.json(resource, { status: 201 })
  } catch (error) {
    console.error('[RESOURCES POST]', error)
    return NextResponse.json(
      { error: 'Failed to create resource' },
      { status: 500 }
    )
  }
}