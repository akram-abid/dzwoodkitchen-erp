// =============================================================

// services/ledgerService.js — TABLE-PER-TYPE (v3.2: material purchases now write stock movements)

//

// 3 real treasury entry sources, no unified "entries" model in schema:

//   • workersPayments                → worker payments

//   • material_purchases (+ items)   → orders from suppliers

//   • other_expenses                 → other expenses

//

// v3.2 change: MATERIAL_PURCHASE create/update/delete now keep

// material_stock_movements in sync, since stock = SUM(IN) - SUM(OUT)

// is computed on read (see schema.prisma comment on that model).

// Movements are tagged via `note: "Purchase #<id>"` so update/delete

// can find and replace/remove exactly the rows a given purchase owns.

// NOTE: material_stock_movements has no purchase_id column, so this

// tagging is a pragmatic stand-in — see the comment near

// STOCK_MOVEMENT_NOTE_PREFIX below for a more robust alternative.

// =============================================================

import { prisma } from "../../lib/prisma";

// =============================================================

// TYPE TAG — single source of truth

// =============================================================

const TYPE = {
  INCOME: "INCOME",
  WORKER_PAYMENT: "WORKER_PAYMENT",
  MATERIAL_PURCHASE: "MATERIAL_PURCHASE",
  OTHER_EXPENSE: "OTHER_EXPENSE",
};

const TABLE_BY_TYPE = {
  INCOME: "incomes",
  WORKER_PAYMENT: "workersPayments",
  MATERIAL_PURCHASE: "material_purchases",
  OTHER_EXPENSE: "other_expenses",
};

// Tag used in material_stock_movements.note to identify which movements
// belong to a given purchase, since there's no purchase_id column on that
// table. If you can spare a migration, adding a nullable `purchase_id Int?`
// (+ relation) to material_stock_movements would make this exact and let
// you drop the note-matching entirely — recommended follow-up.
const STOCK_MOVEMENT_NOTE_PREFIX = "Purchase #";
const stockMovementNoteFor = (purchaseId) =>
  `${STOCK_MOVEMENT_NOTE_PREFIX}${purchaseId}`;

// =============================================================

// HELPERS

// =============================================================

function toDate(d) {
  if (!d) return new Date();

  if (d instanceof Date) return d;

  return new Date(d);
}

function toDateString(d) {
  if (!d) return null;

  if (d instanceof Date) return d.toISOString().slice(0, 10);

  return new Date(d).toISOString().slice(0, 10);
}

function buildDateRange(month, year) {
  if (month == null && year == null) return null;

  const m = month != null ? Number(month) : null;

  const y = year != null ? Number(year) : null;

  if (m == null && y == null) return null;

  let start, end;

  if (m != null && y != null) {
    start = new Date(y, m, 1);

    end = new Date(y, m + 1, 0, 23, 59, 59, 999);
  } else if (y != null) {
    start = new Date(y, 0, 1);

    end = new Date(y, 11, 31, 23, 59, 59, 999);
  } else {
    return null;
  }

  return { date: { gte: start, lte: end } };
}

function buildSearchFilter(search) {
  const empty = { income: {}, worker: {}, material: {}, other: {} };
  if (!search) return empty;
  const q = String(search).trim();
  if (!q) return empty;

  return {
    income: { note: { contains: q, mode: "insensitive" } },
    worker: { note: { contains: q, mode: "insensitive" } },
    material: { note: { contains: q, mode: "insensitive" } },
    other: { note: { contains: q, mode: "insensitive" } },
  };
}

// Builds the material_stock_movements rows for a purchase's items.
// Only items resolved to a real catalog material (materialId set) get a
// movement — free-text/one-off items with no material_id don't affect
// tracked stock, same as they don't show up in MaterialsClient today.
function buildStockMovements(purchase) {
  return (purchase.items || [])
    .filter((it) => it.material_id != null)
    .map((it) => ({
      material_id: it.material_id,
      type: "IN",
      quantity: it.quantity,
      date: purchase.date,
      note: stockMovementNoteFor(purchase.id),
    }));
}

function serialize(type, row) {
  if (type === TYPE.INCOME) {
    return {
      id: row.id,

      type,

      date: toDateString(row.date),

      amount: Number(row.amount),

      reference: row.reference,

      note: row.note,
    };
  }

  if (type === TYPE.WORKER_PAYMENT) {
    return {
      id: row.id,

      type,

      date: toDateString(row.date),

      amount: Number(row.amount),

      note: row.note,

      workerId: row.workerId,

      worker: row.worker?.full_name || null,
    };
  }

  if (type === TYPE.MATERIAL_PURCHASE) {
    return {
      id: row.id,

      type,

      date: toDateString(row.date),

      amount: Number(row.amount),

      reference: row.reference,

      note: row.note,

      supplierId: row.supplier_id,

      supplier: row.supplier?.name || null,

      items: (row.items || []).map((it) => ({
        id: it.id,

        materialId: it.material_id,

        materialName: it.material_name,

        quantity: Number(it.quantity),

        unit: it.unit,

        unitPrice: Number(it.unit_price),
      })),
    };
  }

  if (type === TYPE.OTHER_EXPENSE) {
    return {
      id: row.id,

      type,

      date: toDateString(row.date),

      amount: Number(row.amount),

      reference: row.reference,

      note: row.note,

      otherCategoryId: row.other_category_id,

      otherCategory: row.category?.name || null,
    };
  }

  return row;
}

// =============================================================

// PUBLIC API

// =============================================================

export async function getEntries({
  page = 1,

  pageSize = 100,

  type,

  month,

  year,

  search,
} = {}) {
  // Coerce to numbers — query strings come in as strings, Prisma needs ints.

  const numPage = Number(page) > 0 ? Number(page) : 1;

  const numPageSize = Number(pageSize) > 0 ? Number(pageSize) : 100;

  const types = type
    ? String(type)
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean)
    : Object.values(TYPE);

  const dateRange = buildDateRange(month, year);

  const searchFilter = buildSearchFilter(search);

  // Fire 3 (or fewer) parallel queries, each returns tagged rows.

  const [incomeRows, workerRows, materialRows, otherRows] = await Promise.all([
    types.includes(TYPE.INCOME)
      ? prisma.incomes.findMany({
          where: { ...(dateRange || {}), ...(searchFilter.income || {}) },
          orderBy: [{ date: "desc" }, { id: "desc" }],
          skip: (numPage - 1) * numPageSize,
          take: numPageSize,
        })
      : [],

    types.includes(TYPE.WORKER_PAYMENT)
      ? prisma.workersPayments.findMany({
          where: { ...(dateRange || {}), ...(searchFilter.worker || {}) },

          include: { worker: { select: { id: true, full_name: true } } },

          orderBy: [{ date: "desc" }, { id: "desc" }],

          skip: (numPage - 1) * numPageSize,

          take: numPageSize,
        })
      : [],

    types.includes(TYPE.MATERIAL_PURCHASE)
      ? prisma.material_purchases.findMany({
          where: { ...(dateRange || {}), ...(searchFilter.material || {}) },

          include: {
            supplier: { select: { id: true, name: true } },

            items: { orderBy: { id: "asc" } },
          },

          orderBy: [{ date: "desc" }, { id: "desc" }],

          skip: (numPage - 1) * numPageSize,

          take: numPageSize,
        })
      : [],

    types.includes(TYPE.OTHER_EXPENSE)
      ? prisma.other_expenses.findMany({
          where: { ...(dateRange || {}), ...(searchFilter.other || {}) },

          include: { category: { select: { id: true, name: true } } },

          orderBy: [{ date: "desc" }, { id: "desc" }],

          skip: (numPage - 1) * numPageSize,

          take: numPageSize,
        })
      : [],
  ]);

  // Merge + tag + sort by date desc

  const merged = [
    ...incomeRows.map((r) => serialize(TYPE.INCOME, r)),
    ...workerRows.map((r) => serialize(TYPE.WORKER_PAYMENT, r)),
    ...materialRows.map((r) => serialize(TYPE.MATERIAL_PURCHASE, r)),
    ...otherRows.map((r) => serialize(TYPE.OTHER_EXPENSE, r)),
  ].sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);

  const total =
    incomeRows.length +
    workerRows.length +
    materialRows.length +
    otherRows.length;

  return {
    data: merged,

    total,

    page: numPage,

    pageSize: numPageSize,
  };
}

export async function getEntryById(type, id) {
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) return null;

  switch (type) {
    case TYPE.INCOME: {
      const row = await prisma.incomes.findUnique({
        where: { id: numId },
      });

      return row ? serialize(TYPE.INCOME, row) : null;
    }

    case TYPE.WORKER_PAYMENT: {
      const row = await prisma.workersPayments.findUnique({
        where: { id: numId },

        include: { worker: { select: { id: true, full_name: true } } },
      });

      return row ? serialize(TYPE.WORKER_PAYMENT, row) : null;
    }

    case TYPE.MATERIAL_PURCHASE: {
      const row = await prisma.material_purchases.findUnique({
        where: { id: numId },

        include: {
          supplier: { select: { id: true, name: true } },

          items: { orderBy: { id: "asc" } },
        },
      });

      return row ? serialize(TYPE.MATERIAL_PURCHASE, row) : null;
    }

    case TYPE.OTHER_EXPENSE: {
      const row = await prisma.other_expenses.findUnique({
        where: { id: numId },

        include: { category: { select: { id: true, name: true } } },
      });

      return row ? serialize(TYPE.OTHER_EXPENSE, row) : null;
    }

    default:
      return null;
  }
}

export async function createEntry(input) {
  switch (input.type) {
    case TYPE.INCOME: {
      const created = await prisma.incomes.create({
        data: {
          date: toDate(input.date),

          amount: input.amount,

          reference: input.reference ?? null,

          note: input.note ?? null,
        },
      });

      return serialize(TYPE.INCOME, created);
    }

    case TYPE.WORKER_PAYMENT: {
      const created = await prisma.workersPayments.create({
        data: {
          workerId: input.workerId,

          date: toDate(input.date),

          amount: input.amount,

          note: input.note ?? null,
        },

        include: { worker: { select: { id: true, full_name: true } } },
      });

      return serialize(TYPE.WORKER_PAYMENT, created);
    }

    case TYPE.MATERIAL_PURCHASE: {
      const items = input.items || [];

      const total = items.reduce(
        (s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0),

        0,
      );

      const created = await prisma.$transaction(async (tx) => {
        const purchase = await tx.material_purchases.create({
          data: {
            supplier_id: input.supplierId,

            date: toDate(input.date),

            amount: total,

            reference: input.reference ?? null,

            note: input.note ?? null,

            items: items.length
              ? {
                  create: items.map((it) => ({
                    material_id: it.materialId ?? null,

                    material_name: it.materialName,

                    quantity: it.quantity,

                    unit: it.unit,

                    unit_price: it.unitPrice,
                  })),
                }
              : undefined,
          },

          include: {
            supplier: { select: { id: true, name: true } },

            items: { orderBy: { id: "asc" } },
          },
        });

        return purchase;
      });

      return serialize(TYPE.MATERIAL_PURCHASE, created);
    }

    case TYPE.OTHER_EXPENSE: {
      const created = await prisma.other_expenses.create({
        data: {
          other_category_id: input.otherCategoryId,

          date: toDate(input.date),

          amount: input.amount,

          reference: input.reference ?? null,

          note: input.note ?? null,
        },

        include: { category: { select: { id: true, name: true } } },
      });

      return serialize(TYPE.OTHER_EXPENSE, created);
    }

    default:
      throw new Error(`Unknown type: ${input.type}`);
  }
}

export async function updateEntry(type, id, input) {
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) {
    throw new Error("Invalid id");
  }

  switch (type) {
    case TYPE.INCOME: {
      const updated = await prisma.incomes.update({
        where: { id: numId },

        data: {
          date: toDate(input.date),

          amount: input.amount,

          reference: input.reference ?? null,

          note: input.note ?? null,
        },
      });

      return serialize(TYPE.INCOME, updated);
    }

    case TYPE.WORKER_PAYMENT: {
      const updated = await prisma.workersPayments.update({
        where: { id: numId },

        data: {
          workerId: input.workerId,

          date: toDate(input.date),

          amount: input.amount,

          note: input.note ?? null,
        },

        include: { worker: { select: { id: true, full_name: true } } },
      });

      return serialize(TYPE.WORKER_PAYMENT, updated);
    }

    case TYPE.MATERIAL_PURCHASE: {
      const items = input.items || [];

      const total = items.reduce(
        (s, it) => s + Number(it.quantity || 0) * Number(it.unitPrice || 0),

        0,
      );

      const updated = await prisma.$transaction(async (tx) => {
        if (items !== undefined) {
          await tx.material_purchase_items.deleteMany({
            where: { purchase_id: numId },
          });
        }

        // Wipe out the stock movements this purchase previously created —
        // they'll be rebuilt below from the new item list. This is where
        // the note-tag matters: it's how we find "this purchase's" rows.
        await tx.material_stock_movements.deleteMany({
          where: { note: stockMovementNoteFor(numId) },
        });

        const purchase = await tx.material_purchases.update({
          where: { id: numId },

          data: {
            supplier_id: input.supplierId,

            date: toDate(input.date),

            amount: total,

            reference: input.reference ?? null,

            note: input.note ?? null,

            ...(items.length
              ? {
                  items: {
                    create: items.map((it) => ({
                      material_id: it.materialId ?? null,

                      material_name: it.materialName,

                      quantity: it.quantity,

                      unit: it.unit,

                      unit_price: it.unitPrice,
                    })),
                  },
                }
              : {}),
          },

          include: {
            supplier: { select: { id: true, name: true } },

            items: { orderBy: { id: "asc" } },
          },
        });

        const movementRows = buildStockMovements(purchase);

        if (movementRows.length) {
          await tx.material_stock_movements.createMany({
            data: movementRows,
          });
        }

        return purchase;
      });

      return serialize(TYPE.MATERIAL_PURCHASE, updated);
    }

    case TYPE.OTHER_EXPENSE: {
      const updated = await prisma.other_expenses.update({
        where: { id: numId },

        data: {
          other_category_id: input.otherCategoryId,

          date: toDate(input.date),

          amount: input.amount,

          reference: input.reference ?? null,

          note: input.note ?? null,
        },

        include: { category: { select: { id: true, name: true } } },
      });

      return serialize(TYPE.OTHER_EXPENSE, updated);
    }

    default:
      throw new Error(`Unknown type: ${type}`);
  }
}

export async function deleteEntry(type, id) {
  const numId = Number(id);

  if (!Number.isInteger(numId) || numId <= 0) {
    throw new Error("Invalid id");
  }

  switch (type) {
    case TYPE.INCOME:
      await prisma.incomes.delete({ where: { id: numId } });
      return { ok: true };

    case TYPE.WORKER_PAYMENT:
      await prisma.workersPayments.delete({ where: { id: numId } });

      return { ok: true };

    case TYPE.MATERIAL_PURCHASE:
      // Reverse the stock this purchase added before removing the purchase
      // itself, so deleting a bad entry doesn't leave phantom stock behind.
      await prisma.$transaction(async (tx) => {
        await tx.material_stock_movements.deleteMany({
          where: { note: stockMovementNoteFor(numId) },
        });

        await tx.material_purchases.delete({ where: { id: numId } });
      });

      return { ok: true };

    case TYPE.OTHER_EXPENSE:
      await prisma.other_expenses.delete({ where: { id: numId } });

      return { ok: true };

    default:
      throw new Error(`Unknown type: ${type}`);
  }
}
