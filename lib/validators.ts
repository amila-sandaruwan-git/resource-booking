import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export const resourceSchema = z.object({
  name: z.string().min(2).max(100),
  type: z.string().min(2).max(50),
  description: z.string().max(500).optional().or(z.literal('')),
  capacity: z.coerce.number().int().positive().optional(),
  location: z.string().max(100).optional().or(z.literal('')),
})

export const reservationSchema = z
  .object({
    resourceId: z.string().min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    purpose: z.string().max(300).optional().or(z.literal('')),
  })
  .refine((data) => new Date(data.startTime) < new Date(data.endTime), {
    message: 'End time must be after start time',
    path: ['endTime'],
  })