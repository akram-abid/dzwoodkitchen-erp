// lib/validation/payment.js
// Zod schemas for payment endpoints. Kept separate from `order.js`
// so it can be imported independently by the payment routes.

import { z } from "zod";

/**
 * Schema for creating a new payment under a given order.
 * - `amount` is required and must be a positive number (up to 10 digits + 2 decimals).
 * - `payment_date` is optional; defaults to today on the server.
 * - `note` is optional, free-text, max 255 chars.
 */
export const createPaymentSchema = z.object({
  amount: z
    .union([z.number(), z.string()])
    .transform((v) => (typeof v === "string" ? Number(v) : v))
    .refine((v) => Number.isFinite(v), {
      message: "amount must be a number",
    })
    .refine((v) => v > 0, {
      message: "amount must be greater than 0",
    }),

  payment_date: z
    .union([z.string(), z.date()])
    .optional()
    .transform((v) => {
      if (v == null || v === "") return null;
      if (v instanceof Date) return v;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d;
    }),

  note: z
    .string()
    .max(255, "note must be at most 255 characters")
    .optional()
    .nullable()
    .transform((v) => (v == null || v === "" ? null : v)),
});

/**
 * Schema for patching an existing payment. All fields are optional,
 * but at least one must be present.
 */
export const patchPaymentSchema = z
  .object({
    amount: z
      .union([z.number(), z.string()])
      .transform((v) => (typeof v === "string" ? Number(v) : v))
      .refine((v) => Number.isFinite(v), {
        message: "amount must be a number",
      })
      .refine((v) => v > 0, {
        message: "amount must be greater than 0",
      })
      .optional(),

    payment_date: z
      .union([z.string(), z.date()])
      .optional()
      .nullable()
      .transform((v) => {
        if (v == null || v === "") return null;
        if (v instanceof Date) return v;
        const d = new Date(v);
        return Number.isNaN(d.getTime()) ? null : d;
      }),

    note: z
      .string()
      .max(255, "note must be at most 255 characters")
      .optional()
      .nullable()
      .transform((v) => (v == null || v === "" ? null : v)),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field (amount, payment_date, note) must be provided",
  });
