// app/services/paymentServices.js

// Database layer for individual payment operations.

// Uses the same Prisma client as the order service.

import { prisma } from "../../lib/prisma";

/**

 * Parse an order id coming in from a URL — same convention as

 * `ordersServices.parseOrderId` (accepts numeric ids and "#1234" style).

 */

function parseOrderId(id) {
  if (typeof id === "number") return id;

  const s = String(id);

  return s.startsWith("#") ? parseInt(s.slice(1), 10) : parseInt(s, 10);
}

/**

 * Create a new payment for a given order.

 *

 * @param {string|number} orderId  Order id (numeric or "#1234").

 * @param {{amount:number, payment_date?:Date|null, note?:string|null}} data

 * @returns {Promise<object>}  The created payment row.

 */

export async function createPayment(orderId, data) {
  const id = parseOrderId(orderId);

  if (!id || Number.isNaN(id)) {
    throw new Error("Invalid order id");
  }

  // Make sure the order actually exists — we want a clean 404 instead of

  // a Prisma foreign-key error bubbling up.

  const order = await prisma.orders.findUnique({
    where: { id },

    select: { id: true },
  });

  if (!order) {
    const err = new Error("Order not found");

    err.code = "P2025";

    throw err;
  }

  return prisma.payments.create({
    data: {
      order_id: id,

      amount: data.amount,

      payment_date: data.payment_date ?? undefined, // DB default handles null

      note: data.note ?? null,
    },
  });
}

/**

 * Patch a single payment by its primary key. Only the fields provided

 * in `data` are written.

 *

 * @param {number} paymentId

 * @param {{amount?:number, payment_date?:Date|null, note?:string|null}} data

 * @returns {Promise<object>}  The updated payment row.

 */

export async function updatePayment(paymentId, data) {
  const update = {};

  if (data.amount !== undefined) update.amount = data.amount;

  if (data.payment_date !== undefined) update.payment_date = data.payment_date;

  if (data.note !== undefined) update.note = data.note;

  return prisma.payments.update({
    where: { id: Number(paymentId) },

    data: update,
  });
}

/**

 * Delete a single payment by its primary key.

 *

 * @param {number} paymentId

 * @returns {Promise<{success:true}>}

 */

export async function deletePayment(paymentId) {
  await prisma.payments.delete({
    where: { id: Number(paymentId) },
  });

  return { success: true };
}

/**

 * Fetch every payment for an order, oldest first.

 * Useful if the UI needs to refetch the full list after a mutation.

 */

export async function getPaymentsForOrder(orderId) {
  const id = parseOrderId(orderId);

  if (!id || Number.isNaN(id)) {
    throw new Error("Invalid order id");
  }

  return prisma.payments.findMany({
    where: { order_id: id },

    orderBy: { payment_date: "asc" },
  });
}
