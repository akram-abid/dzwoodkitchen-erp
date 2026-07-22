// Server-side material-purchase queries / mutations.
//
// All four exported functions return plain JS objects (no Decimal
// instances leaking out). Errors carry an HTTP `status` and an optional
// `fields` map for field-level validation messages.
//
// Style mirrors `app/services/supplierService.js` — same httpError
// helper, same Decimal-to-Number coercion, same field map.

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
   Serialise a `material_purchases` row + items to a plain JS object
   matching the shape produced by `getSupplierPurchases` so the client
   has a single canonical purchase shape.
───────────────────────────────────────────────────────────────── */
function serializePurchase(p) {
  const total = Number(p.amount ?? 0);
  const items = (p.items || []).map((it) => {
    const qty = Number(it.quantity ?? 0);
    const price = Number(it.unit_price ?? 0);
    return {
      id: it.id,
      material_id: it.material_id ?? null,
      material_name: it.material_name,
      quantity: qty,
      unit: it.unit,
      unit_price: price,
      line_total: qty * price,
    };
  });
  return {
    id: p.id,
    supplier_id: p.supplier_id,
    date: p.date,
    reference: p.reference ?? "",
    note: p.note ?? "",
    total,
    created_at: p.created_at,
    updated_at: p.updated_at,
    items,
  };
}

/* ─────────────────────────────────────────────────────────────────
   Field-level validation for a single item.
   Returns a { field: message } map. Empty map = valid.
───────────────────────────────────────────────────────────────── */
function validateItemFields(item, { isUpdate = false } = {}) {
  const errors = {};

  // material_name
  if (!isUpdate || item.material_name !== undefined) {
    const name = (item.material_name ?? "").toString().trim();
    if (!name) {
      errors.material_name = "Material name is required.";
    } else if (name.length > 150) {
      errors.material_name = "Material name must be 150 characters or fewer.";
    }
  }

  // quantity
  if (!isUpdate || item.quantity !== undefined) {
    const q = Number(item.quantity);
    if (item.quantity === undefined || item.quantity === null || Number.isNaN(q)) {
      errors.quantity = "Quantity is required.";
    } else if (q <= 0) {
      errors.quantity = "Quantity must be greater than 0.";
    }
  }

  // unit
  if (!isUpdate || item.unit !== undefined) {
    const u = (item.unit ?? "").toString().trim();
    if (!u) {
      errors.unit = "Unit is required.";
    } else if (u.length > 20) {
      errors.unit = "Unit must be 20 characters or fewer.";
    }
  }

  // unit_price
  if (!isUpdate || item.unit_price !== undefined) {
    const p = Number(item.unit_price);
    if (item.unit_price === undefined || item.unit_price === null || Number.isNaN(p)) {
      errors.unit_price = "Unit price is required.";
    } else if (p < 0) {
      errors.unit_price = "Unit price must be 0 or more.";
    }
  }

  return errors;
}

/* ─────────────────────────────────────────────────────────────────
   Coerce a raw item payload into a Prisma-shaped object. Trims
   strings, normalises empty strings to null, and Decimal-coerces
   the numeric columns so we never write JS numbers directly.
───────────────────────────────────────────────────────────────── */
function normalizeItem(item) {
  const pick = (k) => (k in item ? item[k] : undefined);
  const text = (v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const t = String(v).trim();
    return t === "" ? null : t;
  };
  const decimal = (v) => {
    if (v === undefined) return undefined;
    if (v === null) return null;
    const n = Number(v);
    if (Number.isNaN(n)) return null;
    return n;
  };
  const out = {};
  if (pick("material_id") !== undefined)
    out.material_id = pick("material_id") === null ? null : Number(pick("material_id"));
  if (pick("material_name") !== undefined) out.material_name = text(pick("material_name"));
  if (pick("quantity") !== undefined) out.quantity = decimal(pick("quantity"));
  if (pick("unit") !== undefined) out.unit = text(pick("unit"));
  if (pick("unit_price") !== undefined) out.unit_price = decimal(pick("unit_price"));
  return out;
}

/**
 * Update an existing material purchase (header + items in one call).
 *
 * Body (any subset):
 *   {
 *     date?,         // ISO string or Date — must be parseable
 *     reference?,    // string, ≤100 chars
 *     note?,         // string | null
 *     supplier_id?,  // int, must exist
 *     items?: [      // full replacement list — items sync semantics
 *       {
 *         id?,           // present → update existing, absent → create
 *         material_id?,  // optional FK to material_catalog
 *         material_name, // required, ≤150
 *         quantity,      // >0
 *         unit,          // ≤20
 *         unit_price,    // ≥0
 *       }
 *     ]
 *   }
 *
 * Item sync:
 *   • ids in the new list that already exist  → updated
 *   • new items without an id                 → created
 *   • rows in the DB missing from the new list → deleted
 *
 * After item sync, `material_purchases.amount` is recomputed as
 * Σ (quantity * unit_price) and `updated_at` is bumped.
 *
 * Throws:
 *   400 — invalid fields (with .fields = { field: message })
 *   404 — purchase not found
 */
export async function updateMaterialPurchase(id, rawInput) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw httpError(400, "Invalid purchase id");
  }

  const input = rawInput ?? {};
  const fieldErrors = {};

  /* ── header fields ── */
  const headerData = {};

  if ("date" in input) {
    if (input.date === null || input.date === "") {
      fieldErrors.date = "Date is required.";
    } else {
      const d = new Date(input.date);
      if (Number.isNaN(d.getTime())) {
        fieldErrors.date = "Date is invalid.";
      } else {
        headerData.date = d;
      }
    }
  }

  if ("reference" in input) {
    if (input.reference === null) {
      headerData.reference = null;
    } else {
      const r = String(input.reference).trim();
      if (r.length > 100) {
        fieldErrors.reference = "Reference must be 100 characters or fewer.";
      } else {
        headerData.reference = r === "" ? null : r;
      }
    }
  }

  if ("note" in input) {
    if (input.note === null) {
      headerData.note = null;
    } else {
      const n = String(input.note);
      headerData.note = n === "" ? null : n;
    }
  }

  if ("supplier_id" in input) {
    const sid = Number(input.supplier_id);
    if (!Number.isInteger(sid) || sid <= 0) {
      fieldErrors.supplier_id = "Supplier is required.";
    } else {
      const exists = await prisma.suppliers.findUnique({
        where: { id: sid },
        select: { id: true },
      });
      if (!exists) {
        fieldErrors.supplier_id = "Selected supplier does not exist.";
      } else {
        headerData.supplier_id = sid;
      }
    }
  }

  /* ── item fields ── */
  let itemOperations = null; // null = items not being synced
  if ("items" in input) {
    if (!Array.isArray(input.items)) {
      fieldErrors.items = "Items must be an array.";
    } else {
      const itemFieldErrors = [];
      const normalised = [];
      input.items.forEach((rawItem, idx) => {
        const norm = normalizeItem(rawItem ?? {});
        const itemErrs = validateItemFields(norm);
        if (Object.keys(itemErrs).length > 0) {
          itemFieldErrors.push({ index: idx, ...itemErrs });
        }
        normalised.push({ ...norm, __id: rawItem?.id });
      });
      if (itemFieldErrors.length > 0) {
        fieldErrors.items = itemFieldErrors;
      } else {
        itemOperations = normalised;
      }
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    const err = httpError(400, "Invalid purchase data");
    err.fields = fieldErrors;
    throw err;
  }

  /* ── load existing row for id-resolution / existence check ── */
  const existing = await prisma.material_purchases.findUnique({
    where: { id: numericId },
    select: { id: true },
  });
  if (!existing) {
    throw httpError(404, "Material purchase not found");
  }

  /* ── item sync (in its own transaction) ── */
  let newTotal = null;
  await prisma.$transaction(async (tx) => {
    if (itemOperations !== null) {
      // 1. collect ids the client wants to keep
      const keepIds = new Set();
      for (const it of itemOperations) {
        if (it.__id !== undefined && it.__id !== null && it.__id !== "") {
          keepIds.add(Number(it.__id));
        }
      }

      // 2. delete orphans (rows in DB that are NOT in keepIds)
      const currentItems = await tx.material_purchase_items.findMany({
        where: { purchase_id: numericId },
        select: { id: true },
      });
      const orphanIds = currentItems
        .map((r) => r.id)
        .filter((id) => !keepIds.has(id));
      if (orphanIds.length > 0) {
        await tx.material_purchase_items.deleteMany({
          where: { id: { in: orphanIds } },
        });
      }

      // 3. update existing + create new
      for (const it of itemOperations) {
        const hasId =
          it.__id !== undefined && it.__id !== null && it.__id !== "";
        if (hasId) {
          const updateId = Number(it.__id);
          // only send the columns that were actually present
          const data = {};
          if ("material_id" in it) data.material_id = it.material_id;
          if ("material_name" in it) data.material_name = it.material_name;
          if ("quantity" in it) data.quantity = it.quantity;
          if ("unit" in it) data.unit = it.unit;
          if ("unit_price" in it) data.unit_price = it.unit_price;
          await tx.material_purchase_items.update({
            where: { id: updateId },
            data,
          });
        } else {
          // create new item row
          await tx.material_purchase_items.create({
            data: {
              purchase_id: numericId,
              material_id:
                "material_id" in it ? it.material_id ?? null : null,
              material_name: it.material_name,
              quantity: it.quantity,
              unit: it.unit,
              unit_price: it.unit_price,
            },
          });
        }
      }

      // 4. recompute total from the now-current children
      const all = await tx.material_purchase_items.findMany({
        where: { purchase_id: numericId },
        select: { quantity: true, unit_price: true },
      });
      newTotal = all.reduce(
        (sum, r) => sum + Number(r.quantity ?? 0) * Number(r.unit_price ?? 0),
        0,
      );
    }

    // Apply header updates + (recomputed) amount + bumped updated_at
    const updatePayload = { ...headerData, updated_at: new Date() };
    if (newTotal !== null) updatePayload.amount = newTotal;
    if (Object.keys(updatePayload).length > 1 || "updated_at" in updatePayload) {
      await tx.material_purchases.update({
        where: { id: numericId },
        data: updatePayload,
      });
    }
  });

  /* ── re-read and return the canonical shape ── */
  const fresh = await prisma.material_purchases.findUnique({
    where: { id: numericId },
    include: {
      items: {
        orderBy: { id: "asc" },
        select: {
          id: true,
          material_id: true,
          material_name: true,
          quantity: true,
          unit: true,
          unit_price: true,
        },
      },
    },
  });

  return serializePurchase(fresh);
}

/**
 * Hard-delete a material purchase. Items cascade via Prisma
 * (the schema declares `onDelete: Cascade` on
 * `material_purchase_items.purchase_id`), so we do NOT touch
 * children here.
 *
 * Throws:
 *   400 — invalid id
 *   404 — purchase not found
 */
export async function deleteMaterialPurchase(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw httpError(400, "Invalid purchase id");
  }

  const existing = await prisma.material_purchases.findUnique({
    where: { id: numericId },
    select: { id: true },
  });
  if (!existing) {
    throw httpError(404, "Material purchase not found");
  }

  await prisma.material_purchases.delete({ where: { id: numericId } });
  return { id: numericId, deleted: true };
}

/* ═══════════════════════════════════════════════════════════════════
   PER-ITEM OPERATIONS
═══════════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────────────────────────────────
   Recompute the parent purchase's amount from its current children
   and bump its updated_at.  Returns the new amount (Number).
───────────────────────────────────────────────────────────────── */
async function recomputeParentAmount(tx, purchaseId) {
  const rows = await tx.material_purchase_items.findMany({
    where: { purchase_id: purchaseId },
    select: { quantity: true, unit_price: true },
  });
  const amount = rows.reduce(
    (sum, r) => sum + Number(r.quantity ?? 0) * Number(r.unit_price ?? 0),
    0,
  );
  await tx.material_purchases.update({
    where: { id: purchaseId },
    data: { amount, updated_at: new Date() },
  });
  return amount;
}

/**
 * Update a single material-purchase item, then recompute the
 * parent purchase's `amount` and bump its `updated_at`.
 *
 * Body: { material_id?, material_name?, quantity?, unit?, unit_price? }
 *
 * Returns:
 *   {
 *     item:   { id, material_id, material_name, quantity, unit,
 *               unit_price, line_total, purchase_id },
 *     parent: { id, amount }
 *   }
 *
 * Throws:
 *   400 — invalid fields / nothing to update
 *   404 — item not found
 */
export async function updateMaterialPurchaseItem(itemId, rawInput) {
  const numericId = Number(itemId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw httpError(400, "Invalid item id");
  }

  const input = rawInput ?? {};
  const data = normalizeItem(input);
  if (Object.keys(data).length === 0) {
    throw httpError(400, "No fields to update");
  }

  const errors = validateItemFields(data, { isUpdate: true });
  if (Object.keys(errors).length > 0) {
    const err = httpError(400, "Invalid item data");
    err.fields = errors;
    throw err;
  }

  const existing = await prisma.material_purchase_items.findUnique({
    where: { id: numericId },
    select: { id: true, purchase_id: true },
  });
  if (!existing) {
    throw httpError(404, "Material purchase item not found");
  }

  const purchaseId = existing.purchase_id;

  let updatedRow;
  let newAmount;
  await prisma.$transaction(async (tx) => {
    updatedRow = await tx.material_purchase_items.update({
      where: { id: numericId },
      data,
      select: {
        id: true,
        purchase_id: true,
        material_id: true,
        material_name: true,
        quantity: true,
        unit: true,
        unit_price: true,
      },
    });
    newAmount = await recomputeParentAmount(tx, purchaseId);
  });

  const qty = Number(updatedRow.quantity);
  const price = Number(updatedRow.unit_price);

  return {
    item: {
      id: updatedRow.id,
      material_id: updatedRow.material_id ?? null,
      material_name: updatedRow.material_name,
      quantity: qty,
      unit: updatedRow.unit,
      unit_price: price,
      line_total: qty * price,
      purchase_id: updatedRow.purchase_id,
    },
    parent: { id: purchaseId, amount: newAmount },
  };
}

/**
 * Delete a single material-purchase item, then recompute the
 * parent purchase's `amount` (0 if no items left) and bump its
 * `updated_at`.
 *
 * Returns:
 *   { id, parent: { id, amount } }
 *
 * Throws:
 *   400 — invalid id
 *   404 — item not found
 */
export async function deleteMaterialPurchaseItem(itemId) {
  const numericId = Number(itemId);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw httpError(400, "Invalid item id");
  }

  const existing = await prisma.material_purchase_items.findUnique({
    where: { id: numericId },
    select: { id: true, purchase_id: true },
  });
  if (!existing) {
    throw httpError(404, "Material purchase item not found");
  }

  const purchaseId = existing.purchase_id;
  let newAmount;

  await prisma.$transaction(async (tx) => {
    await tx.material_purchase_items.delete({ where: { id: numericId } });
    newAmount = await recomputeParentAmount(tx, purchaseId);
  });

  return { id: numericId, parent: { id: purchaseId, amount: newAmount } };
}
