import { z } from 'zod'

// Matches the order_state enum in the database
export const orderStateEnum = z.enum([
  'appointment',
  'contract',
  'in_production',
  'ready_to_delivery',
  'completed',
])

// Used for creating a new order
export const createOrderSchema = z.object({
  client_id: z.number().int().positive(),
  worker_id: z.number().int().positive().optional().nullable(),
  state: orderStateEnum.optional().default('appointment'),
  address: z.string().max(255).optional(),
  address_notes: z.string().optional(),
  longitude: z.number().optional().nullable(),
  latitude: z.number().optional().nullable(),
  lift_cost: z.number().nonnegative().optional().default(0),
})

// Used for updating an existing order — everything optional
export const updateOrderSchema = z.object({
  client_id: z.number().int().positive().optional(),
  worker_id: z.number().int().positive().nullable().optional(),
  state: orderStateEnum.optional(),
  address: z.string().max(255).optional(),
  address_notes: z.string().optional(),
  longitude: z.number().nullable().optional(),
  latitude: z.number().nullable().optional(),
  lift_cost: z.number().nonnegative().optional(),
  is_fully_completed: z.boolean().optional(),
})

// Query params for GET /api/orders
export const listOrdersQuerySchema = z.object({
  state: orderStateEnum.optional(),
  client_id: z.coerce.number().int().positive().optional(),
  worker_id: z.coerce.number().int().positive().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  pageSize: z.coerce.number().int().positive().max(100).optional().default(20),
})

export const createPaymentSchema = z.object({
  amount: z.number().positive(),
  payment_date: z.coerce.date().optional(),
  note: z.string().max(255).optional(),
})

export const createPhotoSchema = z.object({
  photo_url: z.string().url(),
  description: z.string().max(255).optional(),
})

export const createChecklistItemSchema = z.object({
  description: z.string().min(1).max(255),
})

export const updateChecklistItemSchema = z.object({
  is_resolved: z.boolean(),
})
