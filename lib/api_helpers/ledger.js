// ----------------------------------------------------------------

// Client-side fetch helpers. The component imports from here.

// Mirrors the pattern of your existing fetchOrders helper.

// ----------------------------------------------------------------

function buildQuery(params) {
  const usp = new URLSearchParams();

  for (const [k, v] of Object.entries(params || {})) {
    if (v === undefined || v === null || v === "") continue;

    if (Array.isArray(v)) {
      v.forEach((x) => usp.append(k, String(x)));
    } else {
      usp.set(k, String(v));
    }
  }

  return usp.toString();
}

async function parseError(res, fallback) {
  const body = await res.text().catch(() => "");

  throw new Error(`${fallback}: ${res.status} ${body}`);
}

// =============================================================

// ENTRIES

// =============================================================


export async function fetchLedgerEntries(filters = {}) {
  const { page = 1, pageSize = 100, type, month, year, search } = filters;

  // type can be a string or an array — collapse to CSV

  const typeParam = Array.isArray(type) ? type.join(",") : type;

  const qs = buildQuery({
    page,
    pageSize,
    type: typeParam,
    month,
    year,
    search,
  });

  const res = await fetch(`/api/ledger${qs ? `?${qs}` : ""}`, {
    cache: "no-store",

    credentials: "include",
  });

  if (!res.ok) await parseError(res, "Failed to fetch ledger entries");

  return res.json();
}

export async function fetchLedgerEntry(id) {
  const res = await fetch(`/api/ledger/${id}`, {
    cache: "no-store",

    credentials: "include",
  });

  if (!res.ok) await parseError(res, `Failed to fetch ledger entry ${id}`);

  return res.json();
}

/**

 * Create a new ledger entry.

 * @param {Object} payload  See ledgerService.createEntry JSDoc for the full shape.

 */

export async function createLedgerEntry(payload) {
  const res = await fetch("/api/ledger", {
    method: "POST",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify(payload),
  });

  if (!res.ok) await parseError(res, "Failed to create ledger entry");

  return res.json();
}

export async function updateLedgerEntry(id, payload) {
  const res = await fetch(`/api/ledger/${id}`, {
    method: "PUT",

    headers: { "Content-Type": "application/json" },

    credentials: "include",

    body: JSON.stringify(payload),
  });

  if (!res.ok) await parseError(res, `Failed to update ledger entry ${id}`);

  return res.json();
}

export async function deleteLedgerEntry(id) {
  const res = await fetch(`/api/ledger/${id}`, {
    method: "DELETE",

    credentials: "include",
  });

  if (!res.ok) await parseError(res, `Failed to delete ledger entry ${id}`);

  return res.json();
}

// =============================================================

// REFERENCE DATA

// =============================================================

/**

 * @returns {Promise<{ workers, suppliers, materialCategories, materialCatalog, otherCategories }>}

 */

export async function fetchLedgerReferenceData() {
  const res = await fetch("/api/ledger/reference-data", {
    cache: "no-store",

    credentials: "include",
  });

  if (!res.ok) await parseError(res, "Failed to fetch ledger reference data");

  return res.json();
}
