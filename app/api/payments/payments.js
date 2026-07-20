// app/api/payments/payments.js

// Client-side wrappers around the payment API routes.

// IMPORTANT: do NOT import prisma here — it would pull pg into the browser bundle.

/**

 * Create a new payment under a given order.

 * @param {string|number} orderId

 * @param {{amount:number, payment_date?:string, note?:string}} data

 */

export async function createPaymentClient(orderId, data) {
  const res = await fetch(`/api/orders/${orderId}/payments`, {
    method: "POST",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    throw new Error(`Failed to create payment: ${res.status} ${body}`);
  }

  return res.json();
}

/**

 * Patch an existing payment.

 * @param {number} paymentId

 * @param {{amount?:number, payment_date?:string, note?:string}} data

 */

export async function patchPaymentClient(paymentId, data) {
  const res = await fetch(`/api/payments/${paymentId}`, {
    method: "PATCH",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    throw new Error(`Failed to update payment: ${res.status} ${body}`);
  }

  return res.json();
}

/**

 * Delete an existing payment.

 * @param {number} paymentId

 */

export async function deletePaymentClient(paymentId) {
  const res = await fetch(`/api/payments/${paymentId}`, {
    method: "DELETE",

    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    throw new Error(`Failed to delete payment: ${res.status} ${body}`);
  }

  return res.json();
}
