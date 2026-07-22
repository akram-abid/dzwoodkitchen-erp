// Server-side supplier queries.
// All functions return plain JS objects (no Decimal instances leaking out).

import { prisma } from "@/lib/prisma";

/* ─────────────────────────────────────────────────────────────────
   Error helper — attaches a status code so the route handler can
   surface the right HTTP code without try/catch + instanceof dance.
───────────────────────────────────────────────────────────────── */
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/* ─────────────────────────────────────────────────────────────────
   Field-level validation, shared by create + update.
   Returns a { field: message } map. Empty map = valid.
───────────────────────────────────────────────────────────────── */
function validateSupplierFields(fields, { isUpdate = false } = {}) {
  const errors = {};

  if (!isUpdate || fields.name !== undefined) {
    const name = (fields.name ?? "").trim();
    if (!name) {
      errors.name = "Name is required.";
    } else if (name.length > 150) {
      errors.name = "Name must be 150 characters or fewer.";
    }
  }

  if (
    fields.phone !== undefined &&
    fields.phone !== null &&
    fields.phone.length > 30
  ) {
    errors.phone = "Phone must be 30 characters or fewer.";
  }
  if (
    fields.address !== undefined &&
    fields.address !== null &&
    fields.address.length > 255
  ) {
    errors.address = "Address must be 255 characters or fewer.";
  }
  if (
    fields.nif !== undefined &&
    fields.nif !== null &&
    fields.nif.length > 20
  ) {
    errors.nif = "NIF must be 20 characters or fewer.";
  }
  if (fields.rc !== undefined && fields.rc !== null && fields.rc.length > 30) {
    errors.rc = "RC must be 30 characters or fewer.";
  }

  if (
    fields.status !== undefined &&
    !["ACTIVE", "INACTIVE"].includes(fields.status)
  ) {
    errors.status = "Status must be ACTIVE or INACTIVE.";
  }

  return errors;
}

/* ─────────────────────────────────────────────────────────────────
   Coerce a possibly-undefined payload into a clean Prisma data object.
   Strips unknown keys, normalises empty strings to null, trims strings.
───────────────────────────────────────────────────────────────── */
function normalizeSupplierFields(raw = {}) {
  const pick = (k) => (k in raw ? raw[k] : undefined);
  const text = (v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const t = String(v).trim();
    return t === "" ? null : t;
  };

  const data = {};
  if (pick("name") !== undefined) data.name = text(pick("name"));
  if (pick("phone") !== undefined) data.phone = text(pick("phone"));
  if (pick("address") !== undefined) data.address = text(pick("address"));
  if (pick("nif") !== undefined) data.nif = text(pick("nif"));
  if (pick("rc") !== undefined) data.rc = text(pick("rc"));
  if (pick("status") !== undefined) {
    data.status = pick("status") === "INACTIVE" ? "INACTIVE" : "ACTIVE";
  }
  return data;
}

/**
 * List all suppliers with aggregated stats (from `material_purchases`).
 *
 *   ordersCount — number of material_purchases for the supplier
 *   totalSpent  — sum of material_purchases.amount for the supplier
 *
 * Sorted by created_at desc (newest first).
 */
export async function getAllSuppliers() {
  const rows = await prisma.suppliers.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: {
        select: { material_purchases: true },
      },
      material_purchases: {
        select: { amount: true },
      },
    },
  });

  return rows.map((s) => ({
    id: s.id,
    name: s.name,
    phone: s.phone ?? "",
    address: s.address ?? "",
    nif: s.nif ?? "",
    rc: s.rc ?? "",
    status: s.status,
    created_at: s.created_at,
    ordersCount: s._count.material_purchases,
    totalSpent: s.material_purchases.reduce(
      (sum, mp) => sum + Number(mp.amount ?? 0),
      0,
    ),
  }));
}

/**
 * Create a new supplier.
 *
 * Throws:
 *   400 — missing/invalid fields (with .fields = {field: message})
 *   409 — duplicate name (the schema's @unique on name)
 */
export async function createSupplier(rawInput) {
  const input = normalizeSupplierFields(rawInput);
  const errors = validateSupplierFields(input);
  if (Object.keys(errors).length > 0) {
    const err = httpError(400, "Invalid supplier data");
    err.fields = errors;
    throw err;
  }

  if (!input.name) {
    const err = httpError(400, "Name is required");
    err.fields = { name: "Name is required." };
    throw err;
  }

  try {
    const created = await prisma.suppliers.create({
      data: {
        name: input.name,
        phone: input.phone ?? null,
        address: input.address ?? null,
        nif: input.nif ?? null,
        rc: input.rc ?? null,
        status: input.status ?? "ACTIVE",
      },
      include: {
        _count: { select: { material_purchases: true } },
        material_purchases: { select: { amount: true } },
      },
    });

    return {
      id: created.id,
      name: created.name,
      phone: created.phone ?? "",
      address: created.address ?? "",
      nif: created.nif ?? "",
      rc: created.rc ?? "",
      status: created.status,
      created_at: created.created_at,
      ordersCount: created._count.material_purchases,
      totalSpent: created.material_purchases.reduce(
        (sum, mp) => sum + Number(mp.amount ?? 0),
        0,
      ),
    };
  } catch (e) {
    // Prisma unique-constraint violation on `name`
    if (e?.code === "P2002") {
      const err = httpError(409, "A supplier with this name already exists.");
      err.fields = { name: "A supplier with this name already exists." };
      throw err;
    }
    throw e;
  }
}

/**
 * Update an existing supplier. Only the fields present in the payload
 * are changed. Empty / missing fields are left untouched.
 *
 * Throws:
 *   400 — invalid fields / nothing to update
 *   404 — supplier does not exist
 *   409 — duplicate name (if renaming to one that already exists)
 */
export async function updateSupplier(id, rawInput) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw httpError(400, "Invalid supplier id");
  }

  const data = normalizeSupplierFields(rawInput);
  if (Object.keys(data).length === 0) {
    throw httpError(400, "No fields to update");
  }

  const errors = validateSupplierFields(data, { isUpdate: true });
  if (Object.keys(errors).length > 0) {
    const err = httpError(400, "Invalid supplier data");
    err.fields = errors;
    throw err;
  }

  try {
    const updated = await prisma.suppliers.update({
      where: { id: numericId },
      data,
      include: {
        _count: { select: { material_purchases: true } },
        material_purchases: { select: { amount: true } },
      },
    });

    return {
      id: updated.id,
      name: updated.name,
      phone: updated.phone ?? "",
      address: updated.address ?? "",
      nif: updated.nif ?? "",
      rc: updated.rc ?? "",
      status: updated.status,
      created_at: updated.created_at,
      ordersCount: updated._count.material_purchases,
      totalSpent: updated.material_purchases.reduce(
        (sum, mp) => sum + Number(mp.amount ?? 0),
        0,
      ),
    };
  } catch (e) {
    // Prisma "record not found"
    if (e?.code === "P2025") {
      throw httpError(404, "Supplier not found");
    }
    // Prisma unique-constraint violation on `name`
    if (e?.code === "P2002") {
      const err = httpError(409, "A supplier with this name already exists.");
      err.fields = { name: "A supplier with this name already exists." };
      throw err;
    }
    throw e;
  }
}

/**
 * Hard-delete a supplier.
 *
 * The schema declares `onDelete: NoAction` on `material_purchases`,
 * so a delete against a supplier with purchase history would fail at
 * the DB with a foreign-key violation. We pre-check and surface a
 * clear 409 instead, so the client can show a useful message.
 */
export async function deleteSupplier(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw httpError(400, "Invalid supplier id");
  }

  const existing = await prisma.suppliers.findUnique({
    where: { id: numericId },
    select: {
      id: true,
      _count: {
        select: {
          material_purchases: true,
        },
      },
    },
  });

  if (!existing) {
    throw httpError(404, "Supplier not found");
  }

  const mpCount = existing._count.material_purchases;

  if (mpCount > 0) {
    throw httpError(
      409,
      `Cannot delete: supplier has ${mpCount} material purchase(s). Reassign or archive them first.`,
    );
  }

  await prisma.suppliers.delete({ where: { id: numericId } });
  return { id: numericId, deleted: true };
}

/* ═══════════════════════════════════════════════════════════════════
   PURCHASE HISTORY  (for the supplier popup)

   The "buying operations" for a supplier live in `material_purchases`
   (the ledger of actual material purchases, each with line items in
   `material_purchase_items`).  The popup is driven from this single
   table — not from `purchase_orders`, which is the formal-PO layer
   above it.
═══════════════════════════════════════════════════════════════════ */

/**
 * Build a JS Date range covering a full calendar year (Jan 1 → Dec 31,
 * interpreted in the local server timezone).  The `date` column on
 * `material_purchases` is `@db.Date` so we work in plain Dates.
 */
function yearRange(year) {
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59, 999);
  return { start, end };
}

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const MONTH_SHORT = MONTH_NAMES.map((m) => m.slice(0, 3));

/**
 * Fetch a supplier's material purchases for a given year, optionally
 * filtered to a single month.
 *
 * Returns:
 *   {
 *     supplier: { id, name, phone, address, nif, rc, status },
 *     year,                     // echoed back
 *     month,                    // 1..12 or null (= whole year)
 *     monthNames: { full:[], short:[] },
 *     operations: [...],        // flat list, sorted desc by date
 *     summary: { count, total },
 *     byMonth: {                // always returned, even for month view
 *       "1":  { month, count, total, operations: [...] },
 *       ...
 *       "12": { ... }
 *     }
 *   }
 */
export async function getSupplierPurchases(supplierId, { year, month } = {}) {
  const numericId = Number(supplierId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw httpError(400, "Invalid supplier id");
  }

  const targetYear = Number.isInteger(Number(year))
    ? Number(year)
    : new Date().getFullYear();

  // month is optional; if provided it must be 1..12
  let targetMonth = null;
  if (month !== undefined && month !== null && month !== "") {
    const m = Number(month);
    if (Number.isInteger(m) && m >= 1 && m <= 12) targetMonth = m;
  }

  // Look up the supplier (404 if missing) — clean failure beats empty list.
  const supplier = await prisma.suppliers.findUnique({
    where: { id: numericId },
    select: {
      id: true,
      name: true,
      phone: true,
      address: true,
      nif: true,
      rc: true,
      status: true,
    },
  });
  if (!supplier) {
    throw httpError(404, "Supplier not found");
  }

  // Fetch the whole year in one round-trip, then bucket in memory.
  // Query is index-friendly via idx_material_purchases_supplier_id
  // and idx_material_purchases_date.
  const { start, end } = yearRange(targetYear);

  const rows = await prisma.material_purchases.findMany({
    where: {
      supplier_id: numericId,
      date: { gte: start, lte: end },
    },
    orderBy: { date: "desc" },
    select: {
      id: true,
      date: true,
      amount: true,
      reference: true,
      note: true,
      created_at: true,
      items: {
        select: {
          id: true,
          material_name: true,
          quantity: true,
          unit: true,
          unit_price: true,
        },
      },
    },
  });

  // Serialize + bucket
  const serialize = (row) => {
    const total = Number(row.amount ?? 0);
    // If the row has no items, fall back to amount/1 so line_total is sane
    // (display layer treats line_total as info-only).
    const items = row.items.map((it) => {
      const qty = Number(it.quantity ?? 0);
      const price = Number(it.unit_price ?? 0);
      return {
        id: it.id,
        material: it.material_name,
        quantity: qty,
        unit: it.unit,
        unit_price: price,
        line_total: qty * price,
      };
    });
    return {
      id: row.id,
      reference: row.reference ?? "",
      date: row.date,
      total,
      note: row.note ?? "",
      itemCount: items.length,
      itemsPreview: items
        .slice(0, 2)
        .map((it) => it.material)
        .filter(Boolean),
      items,
    };
  };

  // Build per-month buckets for the year view
  const byMonth = {};
  for (let m = 1; m <= 12; m++) {
    byMonth[String(m)] = { month: m, count: 0, total: 0, operations: [] };
  }

  const operationsYear = [];
  for (const row of rows) {
    const op = serialize(row);
    operationsYear.push(op);
    // `date` is a Date; getMonth() is 0..11 → +1 to match our 1..12 scheme
    const m = row.date.getMonth() + 1;
    byMonth[String(m)].count += 1;
    byMonth[String(m)].total += op.total;
    byMonth[String(m)].operations.push(op);
  }

  const operations = targetMonth
    ? byMonth[String(targetMonth)].operations
    : operationsYear;

  const summary = operations.reduce(
    (acc, op) => {
      acc.count += 1;
      acc.total += op.total;
      return acc;
    },
    { count: 0, total: 0 },
  );

  return {
    supplier: {
      id: supplier.id,
      name: supplier.name,
      phone: supplier.phone ?? "",
      address: supplier.address ?? "",
      nif: supplier.nif ?? "",
      rc: supplier.rc ?? "",
      status: supplier.status,
    },
    year: targetYear,
    month: targetMonth,
    monthNames: { full: MONTH_NAMES, short: MONTH_SHORT },
    operations,
    summary,
    byMonth,
  };
}
