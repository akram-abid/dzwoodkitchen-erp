// Server-side supplier queries.
// All functions return plain JS objects (no Decimal instances leaking out).

import { prisma } from "@/lib/prisma";

/* ─────────────────────────────────────────────────────────────────
   Error helper — attaches a status code so the route handler can
   surface the right HTTP code without try/catch + instanceof dance.
──────────────────────────────────────────────────────────────── */
const httpError = (status, message) => {
  const err = new Error(message);
  err.status = status;
  return err;
};

/* ─────────────────────────────────────────────────────────────────
   Field-level validation, shared by create + update.
   Returns a { field: message } map. Empty map = valid.
──────────────────────────────────────────────────────────────── */
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

  if (fields.phone !== undefined && fields.phone !== null && fields.phone.length > 30) {
    errors.phone = "Phone must be 30 characters or fewer.";
  }
  if (fields.address !== undefined && fields.address !== null && fields.address.length > 255) {
    errors.address = "Address must be 255 characters or fewer.";
  }
  if (fields.nif !== undefined && fields.nif !== null && fields.nif.length > 20) {
    errors.nif = "NIF must be 20 characters or fewer.";
  }
  if (fields.rc !== undefined && fields.rc !== null && fields.rc.length > 30) {
    errors.rc = "RC must be 30 characters or fewer.";
  }

  if (fields.status !== undefined && !["ACTIVE", "INACTIVE"].includes(fields.status)) {
    errors.status = "Status must be ACTIVE or INACTIVE.";
  }

  return errors;
}

/* ─────────────────────────────────────────────────────────────────
   Coerce a possibly-undefined payload into a clean Prisma data object.
   Strips unknown keys, normalises empty strings to null, trims strings.
──────────────────────────────────────────────────────────────── */
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
 * List all suppliers with aggregated stats.
 *
 *   ordersCount — number of purchase_orders for the supplier
 *   totalSpent  — sum of purchase_orders.total_amount for the supplier
 *
 * Sorted by created_at desc (newest first).
 */
export async function getAllSuppliers() {
  const rows = await prisma.suppliers.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: {
        select: { purchase_orders: true },
      },
      purchase_orders: {
        select: { total_amount: true },
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
    ordersCount: s._count.purchase_orders,
    totalSpent: s.purchase_orders.reduce(
      (sum, po) => sum + Number(po.total_amount ?? 0),
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
        _count: { select: { purchase_orders: true } },
        purchase_orders: { select: { total_amount: true } },
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
      ordersCount: created._count.purchase_orders,
      totalSpent: created.purchase_orders.reduce(
        (sum, po) => sum + Number(po.total_amount ?? 0),
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
        _count: { select: { purchase_orders: true } },
        purchase_orders: { select: { total_amount: true } },
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
      ordersCount: updated._count.purchase_orders,
      totalSpent: updated.purchase_orders.reduce(
        (sum, po) => sum + Number(po.total_amount ?? 0),
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
 * The schema declares `onDelete: NoAction` on both purchase_orders and
 * material_purchases, so a delete against a supplier with history would
 * fail at the DB with a foreign-key violation. We pre-check and surface
 * a clear 409 instead, so the client can show a useful message.
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
          purchase_orders: true,
          material_purchases: true,
        },
      },
    },
  });

  if (!existing) {
    throw httpError(404, "Supplier not found");
  }

  const { purchase_orders: poCount, material_purchases: mpCount } =
    existing._count;

  if (poCount > 0 || mpCount > 0) {
    throw httpError(
      409,
      `Cannot delete: supplier has ${poCount} purchase order(s) and ${mpCount} material purchase(s). Reassign or archive them first.`,
    );
  }

  await prisma.suppliers.delete({ where: { id: numericId } });
  return { id: numericId, deleted: true };
}
