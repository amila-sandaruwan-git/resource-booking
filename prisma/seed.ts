import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL not set')

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  const adminHash = await bcrypt.hash('admin123', 10)
  const userHash = await bcrypt.hash('user123', 10)

  // Upsert admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: adminHash,
      role: 'ADMIN',
    },
  })
  console.log('✅ Admin:', admin.email)

  // Upsert regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Test User',
      passwordHash: userHash,
      role: 'USER',
    },
  })
  console.log('✅ User:', user.email)

  // Sample resources
  const resources = [
    {
      name: 'Meeting Room Alpha',
      type: 'Meeting Room',
      description: 'Large conference room with projector and whiteboard.',
      capacity: 12,
      location: 'Floor 2, West Wing',
    },
    {
      name: 'Meeting Room Beta',
      type: 'Meeting Room',
      description: 'Small room ideal for interviews or 1:1 meetings.',
      capacity: 4,
      location: 'Floor 2, East Wing',
    },
    {
      name: 'Company Van',
      type: 'Vehicle',
      description: 'Ford Transit van for site visits and deliveries.',
      capacity: 3,
      location: 'Parking Bay 7',
    },
    {
      name: 'Portable Projector',
      type: 'Equipment',
      description: 'Full HD portable projector with HDMI cable.',
      location: 'Storage Room A',
    },
    {
      name: 'Event Hall',
      type: 'Event Space',
      description: 'Large hall suitable for workshops and team events.',
      capacity: 50,
      location: 'Ground Floor',
    },
  ]

  for (const r of resources) {
    const existing = await prisma.resource.findFirst({ where: { name: r.name } })
    if (!existing) {
      await prisma.resource.create({ data: r })
      console.log('✅ Resource:', r.name)
    } else {
      console.log('⏭️  Skipped existing:', r.name)
    }
  }

  console.log('🎉 Seeding complete!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })