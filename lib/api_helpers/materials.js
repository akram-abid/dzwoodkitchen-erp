const BASE = "/api/materials";

async function request(path, init = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init.headers || {}) },
    ...init,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(
      body.error || `Request failed: ${res.status} ${res.statusText}`,
    );
    if (body.fields) err.fields = body.fields;
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export async function getAllMaterialsClient() {
  return request("");
}
export async function getMaterialByIdClient(code) {
  return request(`/${encodeURIComponent(code)}`);
}
export async function createMaterialClient(data) {
  return request("", { method: "POST", body: JSON.stringify(data) });
}
export async function updateMaterialClient(code, patch) {
  return request(`/${encodeURIComponent(code)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
// export async function deleteMaterialClient(code) {
//   return request(`/${encodeURIComponent(code)}`, { method: "DELETE" });
// }
export async function adjustStockClient(code, { type, quantity, note }) {
  return request(`/${encodeURIComponent(code)}/adjust`, {
    method: "POST",
    body: JSON.stringify({ type, quantity, note }),
  });
}
export async function addLeftoverClient(code, data) {
  return request(`/${encodeURIComponent(code)}/leftovers`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function useLeftoverClient(code, dbId) {
  return request(
    `/${encodeURIComponent(code)}/leftovers/${encodeURIComponent(dbId)}/use`,
    { method: "POST" },
  );
}
export async function deleteLeftoverClient(code, dbId) {
  return request(
    `/${encodeURIComponent(code)}/leftovers/${encodeURIComponent(dbId)}`,
    { method: "DELETE" },
  );
}
export async function getMaterialMovementsClient(code) {
  return request(`/${encodeURIComponent(code)}/movements`);
}

export async function deleteMaterialClient(code) {
  return request(`/${encodeURIComponent(code)}`, { method: "DELETE" });
}

export async function updateLeftoverClient(code, dbId, patch) {
  return request(
    `/${encodeURIComponent(code)}/leftovers/${encodeURIComponent(dbId)}`,
    { method: "PATCH", body: JSON.stringify(patch) },
  );
}
