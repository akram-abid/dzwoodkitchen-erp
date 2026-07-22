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
    const err = new Error(body.error || `Failed to create supplier: ${res.status}`);
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
    const err = new Error(body.error || `Failed to update supplier: ${res.status}`);
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
