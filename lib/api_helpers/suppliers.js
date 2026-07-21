// lib/api/suppliers.js

// Client-side fetchers — same shape as your orders.js:

//   import {

//     fetchSuppliers, fetchSupplierDetail,

//     fetchOrder, createOrderApi, updateOrderApi, deleteOrderApi,

//   } from "@/lib/api/suppliers";

function buildQuery(params) {
  const sp = new URLSearchParams();

  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;

    sp.set(k, String(v));
  }

  return sp.toString();
}

const jsonFetch = async (url, init = {}) => {
  const res = await fetch(url, {
    cache: "no-store",

    credentials: "include",

    ...init,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    throw new Error(`${init.method || "GET"} ${url} → ${res.status} ${body}`);
  }

  return res.json();
};

// ─── list + stats + recent, all in one call (matches /api/suppliers) ───

export async function fetchSuppliers(filters = {}) {
  const { page = 1, pageSize = 50, search = "", status, ...rest } = filters;

  const qs = buildQuery({ page, pageSize, search, status, ...rest });

  return jsonFetch(`/api/suppliers${qs ? `?${qs}` : ""}`);

  // → { items, total, page, pageSize, stats, recent }
}

// ─── modal: profile + optional drill-down (month invoices | year purchases) ───

export async function fetchSupplierDetail(id, { include } = {}) {
  const qs = include ? buildQuery({ include }) : "";

  return jsonFetch(`/api/suppliers/${id}${qs ? `?${qs}` : ""}`);

  // → { supplier, invoices?, purchases? }
}

// ─── single order (with items) — used to open the form in edit mode ───

export async function fetchOrder(id) {
  return jsonFetch(`/api/suppliers/orders/${id}`);
}

// ─── create / update / delete orders ───

export async function createOrderApi(data) {
  return jsonFetch("/api/suppliers/orders", {
    method: "POST",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(data),
  });
}

export async function updateOrderApi(id, data) {
  return jsonFetch(`/api/suppliers/orders/${id}`, {
    method: "PUT",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(data),
  });
}

export async function deleteOrderApi(id) {
  return jsonFetch(`/api/suppliers/orders/${id}`, { method: "DELETE" });
}
