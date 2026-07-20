import { z } from "zod";

// ↓ from app/api/orders/route.js (paste the exact block from the grep above)
export const listOrdersQuerySchema = z.object({
  // ... your existing schema ...
});

// ↓ new
export const updateOrderSchema = z.object({
  client: z.string().min(1, "Client is required"),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  project: z.string().min(1, "Project is required"),
  amount: z.number().nonnegative(),
  dueDate: z.string().optional().nullable(),
  stage: z.enum([
    "APPOINTMENT",
    "CONTRACT",
    "IN_PRODUCTION",
    "READY_TO_DELIVER",
    "COMPLETED",
  ]),
  worker: z.string().optional().nullable(),
  items: z.array(z.object({
    name: z.string().min(1),
    qty: z.number().int().nonnegative(),
    unit: z.string(),
    l: z.number().nonnegative().optional().default(0),
    w: z.number().nonnegative().optional().default(0),
    h: z.number().nonnegative().optional().default(0),
  })).optional().default([]),
  payments: z.array(z.object({
    date: z.string(),
    amount: z.number().nonnegative(),
  })).optional().default([]),
  missingItems: z.array(z.object({
    name: z.string().min(1),
    qty: z.number().int().nonnegative().optional().default(1),
    unit: z.string().optional().default("pcs"),
    notes: z.string().optional().nullable(),
  })).optional().default([]),
  technical: z.object({
    truckDistance: z.union([z.number(), z.string()]).optional().nullable(),
    floor: z.union([z.number(), z.string()]).optional().nullable(),
    fee: z.union([z.number(), z.string()]).optional().nullable(),
  }).optional().default({}),
});

// lib/validation/order.js (append)

export const patchOrderSchema = z.object({
  client: z.string().min(1).optional(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  project: z.string().min(1).optional(),
  amount: z.number().nonnegative().optional(),
  dueDate: z.string().optional().nullable(),
  stage: z.enum([
    "APPOINTMENT", "CONTRACT", "IN_PRODUCTION", "READY_TO_DELIVER", "COMPLETED",
  ]).optional(),
  worker: z.string().optional().nullable(),

  items: z.array(z.object({
    name: z.string().min(1),
    qty: z.number().int().nonnegative(),
    unit: z.string(),
    l: z.number().nonnegative().optional().default(0),
    w: z.number().nonnegative().optional().default(0),
    h: z.number().nonnegative().optional().default(0),
  })).optional(),

  payments: z.array(z.object({
    date: z.string(),
    amount: z.number().nonnegative(),
  })).optional(),

  missingItems: z.array(z.object({
    name: z.string().min(1),
    qty: z.number().int().nonnegative().optional().default(1),
    unit: z.string().optional().default("pcs"),
    notes: z.string().optional().nullable(),
  })).optional(),

  technical: z.object({
    truckDistance: z.union([z.number(), z.string()]).optional().nullable(),
    floor: z.union([z.number(), z.string()]).optional().nullable(),
    fee: z.union([z.number(), z.string()]).optional().nullable(),
  }).optional(),
}).strict();

// Same shape as update for now — split them later if create rules diverge
export const createOrderSchema = updateOrderSchema;
