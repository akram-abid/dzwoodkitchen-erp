/**
 * Client-side wrappers for the material-purchase API.
 *
 * `credentials: "include"` is sent on every request so the auth cookie
 * travels. Errors carry the HTTP status, the server message and any
 * field-level validation messages (`err.fields`).
 */

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
