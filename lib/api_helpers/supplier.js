/**

 * Client-side wrappers for the suppliers API.

 * `credentials: "include"` is sent on every request so the auth cookie travels.

 */

export async function getSuppliers() {
  const res = await fetch("/api/suppliers", {
    method: "GET",

    credentials: "include",

    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    throw new Error(`Failed to load suppliers: ${res.status} ${body}`);
  }

  return res.json();
}

export async function createSupplierClient(payload) {
  const res = await fetch("/api/suppliers", {
    method: "POST",

    credentials: "include",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // Try to surface server-side field errors verbatim

    const body = await res.json().catch(() => ({}));

    const err = new Error(
      body.error || `Failed to create supplier: ${res.status}`,
    );

    if (body.fields) err.fields = body.fields;

    err.status = res.status;

    throw err;
  }

  return res.json();
}

export async function updateSupplierClient(id, payload) {
  const res = await fetch(`/api/suppliers/${id}`, {
    method: "PATCH",

    credentials: "include",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    const err = new Error(
      body.error || `Failed to update supplier: ${res.status}`,
    );

    if (body.fields) err.fields = body.fields;

    err.status = res.status;

    throw err;
  }

  return res.json();
}

export async function deleteSupplierClient(id) {
  const res = await fetch(`/api/suppliers/${id}`, {
    method: "DELETE",

    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    throw new Error(`Failed to delete supplier: ${res.status} ${body}`);
  }

  return res.json();
}

/**

 * Fetch the purchase history for a single supplier.

 *

 *   year  — full year (e.g. 2026).  Defaults to the current year.

 *   month — 1..12 for a single month, or omit/null for the whole year.

 *

 * Returns the payload from `/api/suppliers/:id/purchases`, which includes

 * the operations list, a per-period summary and a `byMonth` map for the

 * full year so the year-view can render month navigation cheaply.

 */

export async function getSupplierPurchasesClient(
  supplierId,
  { year, month } = {},
) {
  const params = new URLSearchParams();

  if (year) params.set("year", String(year));

  if (month) params.set("month", String(month));

  const qs = params.toString() ? `?${params.toString()}` : "";

  const res = await fetch(`/api/suppliers/${supplierId}/purchases${qs}`, {
    method: "GET",

    credentials: "include",

    cache: "no-store",
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");

    throw new Error(`Failed to load supplier purchases: ${res.status} ${body}`);
  }

  return res.json();
}

export async function updateMaterialPurchaseClient(id, payload) {
  const res = await fetch(`/api/material_purchases/${id}`, {
    method: "PATCH",

    credentials: "include",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    const err = new Error(
      body.error || `Failed to update material purchase: ${res.status}`,
    );

    if (body.fields) err.fields = body.fields;

    err.status = res.status;

    throw err;
  }

  return res.json();
}

export async function deleteMaterialPurchaseClient(id) {
  const res = await fetch(`/api/material_purchases/${id}`, {
    method: "DELETE",

    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    const err = new Error(
      body.error || `Failed to delete material purchase: ${res.status}`,
    );

    if (body.fields) err.fields = body.fields;

    err.status = res.status;

    throw err;
  }

  return res.json();
}

export async function updateMaterialPurchaseItemClient(itemId, payload) {
  const res = await fetch(`/api/material_purchase_items/${itemId}`, {
    method: "PATCH",

    credentials: "include",

    headers: { "Content-Type": "application/json" },

    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    const err = new Error(
      body.error || `Failed to update material purchase item: ${res.status}`,
    );

    if (body.fields) err.fields = body.fields;

    err.status = res.status;

    throw err;
  }

  return res.json();
}

export async function deleteMaterialPurchaseItemClient(itemId) {
  const res = await fetch(`/api/material_purchase_items/${itemId}`, {
    method: "DELETE",

    credentials: "include",
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));

    const err = new Error(
      body.error || `Failed to delete material purchase item: ${res.status}`,
    );

    if (body.fields) err.fields = body.fields;

    err.status = res.status;

    throw err;
  }

  return res.json();
}


