// app/api/orders/orders.js
// Client-side wrapper around the /api/orders route.
// IMPORTANT: do NOT import prisma here — it would pull pg into the browser bundle.

function buildQuery(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value == null || value === "" || value === "All") return;
    params.set(key, String(value));
  });
  return params.toString();
}

export async function fetchOrders(filters = {}) {
  const { page = 1, pageSize = 100, ...rest } = filters;
  const base = {
    page,
    pageSize,
    ...rest,
  };
  const qs = buildQuery(base);
  const res = await fetch(`/api/orders${qs ? `?${qs}` : ""}`, {
    cache: "no-store",
    credentials: "include",
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to fetch orders: ${res.status} ${body}`);
  }
  return res.json();
}

export async function updateOrderClient(id, data) {
  const res = await fetch(`/api/orders/${id}`, {
    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    throw new Error(`Failed to update order: ${res.status} ${body}`);
  }

  return res.json();
}
