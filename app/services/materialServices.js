import { prisma } from "../../lib/prisma";

const computeStatus = (stock, minStock, maxStock, override) => {
  if (override === "ORDERED") return "ORDERED";
  if (stock <= 0) return "OUT_OF_STOCK";
  if (stock <= minStock) return "LOW_STOCK";
  return "IN_STOCK";
};

const sumStock = (movements) =>
  movements.reduce(
    (sum, m) =>
      sum + (m.type === "IN" ? Number(m.quantity) : -Number(m.quantity)),
    0,
  );

const formatDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "—");

const shapeMaterial = (m) => {
  const stock = sumStock(m.stock_movements ?? []);
  const minStock = Number(m.min_stock);
  const maxStock = Number(m.max_stock);
  const status = computeStatus(stock, minStock, maxStock, m.status_override);
  const outs = (m.stock_movements ?? []).filter((mv) => mv.type === "OUT");
  const lastUsed =
    outs.length > 0
      ? outs.reduce(
          (latest, mv) => (mv.date > latest ? mv.date : latest),
          outs[0].date,
        )
      : null;
  const leftoverCount = (m.leftovers ?? []).reduce((s, l) => s + l.quantity, 0);
  return {
    id: m.code,
    name: m.name,
    category: m.category?.name ?? "Uncategorized",
    categoryId: m.category_id ?? null,
    unit: m.default_unit ?? "",
    stock,
    minStock,
    maxStock,
    supplier: m.supplier?.name ?? "",
    supplierId: m.supplier_id ?? null,
    price: Number(m.unit_price),
    location: m.location ?? "",
    lastUsed: formatDate(lastUsed),
    status,
    leftoverCount,
  };
};

const FULL_INCLUDE = {
  category: true,
  supplier: true,
  stock_movements: { select: { type: true, quantity: true, date: true } },
  leftovers: { select: { quantity: true } },
};

export async function getAllMaterials() {
  const rows = await prisma.material_catalog.findMany({
    orderBy: { created_at: "desc" },
    include: FULL_INCLUDE,
  });
  return rows.map(shapeMaterial);
}

export async function getMaterialByCode(code) {
  const m = await prisma.material_catalog.findUnique({
    where: { code },
    include: {
      category: true,
      supplier: true,
      leftovers: { orderBy: { date: "desc" } },
      stock_movements: {
        orderBy: { date: "desc" },
        take: 50,
        include: {
          order: { select: { project_name: true, id: true } },
          worker: { select: { full_name: true } },
        },
      },
    },
  });
  if (!m) return null;
  const base = shapeMaterial({ ...m, stock_movements: m.stock_movements });
  base.leftovers = m.leftovers.map((l) => ({
    id: `L-${l.id}`,
    dbId: l.id,
    description: l.description,
    dimensions: l.dimensions ?? "",
    qty: l.quantity,
    date: formatDate(l.date),
    source: l.source_order_id
      ? `#${l.source_order_id}${m.order ? ` · ${m.order.project_name ?? ""}` : ""}`
      : "Manual",
  }));
  base.usage = m.stock_movements.map((mv) => ({
    id: mv.id,
    date: formatDate(mv.date),
    order: mv.order
      ? `#${mv.order.id}${mv.order.project_name ? ` · ${mv.order.project_name}` : ""}`
      : (mv.note ?? "Manual"),
    worker: mv.worker?.full_name ?? "—",
    qty: Number(mv.quantity),
    type: mv.type === "IN" ? "in" : "out",
  }));
  return base;
}

async function nextMaterialCode() {
  const last = await prisma.material_catalog.findFirst({
    orderBy: { id: "desc" },
    select: { code: true },
  });
  const n = last?.code?.match(/MAT-(\d+)/)
    ? parseInt(last.code.match(/MAT-(\d+)/)[1], 10) + 1
    : 1;
  return `MAT-${String(n).padStart(3, "0")}`;
}

export async function createMaterial(data) {
  const code = await nextMaterialCode();
  const created = await prisma.material_catalog.create({
    data: {
      code,
      name: data.name.trim(),
      category_id: data.categoryId ?? null,
      default_unit: data.unit ?? null,
      min_stock: data.minStock ?? 0,
      max_stock: data.maxStock ?? 0,
      unit_price: data.price ?? 0,
      location: data.location ?? null,
      supplier_id: data.supplierId ?? null,
    },
  });
  if (data.stock && Number(data.stock) > 0) {
    await prisma.material_stock_movements.create({
      data: {
        material_id: created.id,
        type: "IN",
        quantity: Number(data.stock),
        note: "Initial stock",
      },
    });
  }
  return getMaterialByCode(code);
}

export async function updateMaterial(code, patch) {
  const existing = await prisma.material_catalog.findUnique({
    where: { code },
  });
  if (!existing) {
    const e = new Error(`Material ${code} not found`);
    e.status = 404;
    throw e;
  }
  await prisma.material_catalog.update({
    where: { code },
    data: {
      ...(patch.name !== undefined && { name: patch.name.trim() }),
      ...(patch.categoryId !== undefined && { category_id: patch.categoryId }),
      ...(patch.unit !== undefined && { default_unit: patch.unit }),
      ...(patch.minStock !== undefined && { min_stock: patch.minStock }),
      ...(patch.maxStock !== undefined && { max_stock: patch.maxStock }),
      ...(patch.price !== undefined && { unit_price: patch.price }),
      ...(patch.location !== undefined && { location: patch.location }),
      ...(patch.supplierId !== undefined && { supplier_id: patch.supplierId }),
      ...(patch.statusOverride !== undefined && {
        status_override: patch.statusOverride,
      }),
    },
  });
  return getMaterialByCode(code);
}

export async function deleteMaterial(code) {
  const existing = await prisma.material_catalog.findUnique({
    where: { code },
  });
  if (!existing) {
    const e = new Error(`Material ${code} not found`);
    e.status = 404;
    throw e;
  }
  await prisma.material_catalog.delete({ where: { code } });
  return { code };
}

export async function adjustStock(code, { type, quantity, note }) {
  if (!["IN", "OUT"].includes(type)) {
    const e = new Error("type must be IN or OUT");
    e.status = 400;
    throw e;
  }
  if (!quantity || Number(quantity) <= 0) {
    const e = new Error("quantity must be > 0");
    e.status = 400;
    throw e;
  }
  const material = await prisma.material_catalog.findUnique({
    where: { code },
  });
  if (!material) {
    const e = new Error(`Material ${code} not found`);
    e.status = 404;
    throw e;
  }
  await prisma.material_stock_movements.create({
    data: {
      material_id: material.id,
      type,
      quantity: Number(quantity),
      note: note ?? null,
    },
  });
  return getMaterialByCode(code);
}

export async function addLeftover(code, { description, dimensions, quantity }) {
  const material = await prisma.material_catalog.findUnique({
    where: { code },
  });
  if (!material) {
    const e = new Error(`Material ${code} not found`);
    e.status = 404;
    throw e;
  }
  if (!description || !description.trim()) {
    const e = new Error("description is required");
    e.status = 400;
    throw e;
  }
  const created = await prisma.material_leftovers.create({
    data: {
      material_id: material.id,
      description: description.trim(),
      dimensions: dimensions?.trim() || null,
      quantity: Math.max(1, parseInt(quantity) || 1),
    },
  });
  return {
    id: `L-${created.id}`,
    dbId: created.id,
    description: created.description,
    dimensions: created.dimensions ?? "",
    qty: created.quantity,
    date: formatDate(created.date),
    source: "Manual",
  };
}

export async function useLeftover(code, dbId) {
  const leftover = await prisma.material_leftovers.findUnique({
    where: { id: dbId },
  });
  if (!leftover) {
    const e = new Error("Leftover not found");
    e.status = 404;
    throw e;
  }
  if (leftover.quantity <= 1) {
    await prisma.material_leftovers.delete({ where: { id: dbId } });
    return { deleted: true };
  }
  const updated = await prisma.material_leftovers.update({
    where: { id: dbId },
    data: { quantity: leftover.quantity - 1 },
  });
  return { id: `L-${updated.id}`, dbId: updated.id, qty: updated.quantity };
}

export async function deleteLeftover(code, dbId) {
  const leftover = await prisma.material_leftovers.findUnique({
    where: { id: dbId },
  });
  if (!leftover) {
    const e = new Error("Leftover not found");
    e.status = 404;
    throw e;
  }
  await prisma.material_leftovers.delete({ where: { id: dbId } });
  return { deleted: true, dbId };
}

export async function updateLeftover(code, dbId, patch) {
  const leftover = await prisma.material_leftovers.findUnique({
    where: { id: dbId },
  });
  if (!leftover) {
    const err = new Error("Leftover not found");
    err.status = 404;
    throw err;
  }
  const data = {};
  if (patch.description !== undefined) {
    if (!patch.description || !patch.description.trim()) {
      const err = new Error("description is required");
      err.status = 400;
      throw err;
    }
    data.description = patch.description.trim();
  }
  if (patch.dimensions !== undefined) {
    data.dimensions = patch.dimensions?.trim() || null;
  }
  if (patch.quantity !== undefined) {
    data.quantity = Math.max(1, parseInt(patch.quantity) || 1);
  }

  const updated = await prisma.material_leftovers.update({
    where: { id: dbId },
    data,
  });
  return {
    id: `L-${updated.id}`,
    dbId: updated.id,
    description: updated.description,
    dimensions: updated.dimensions ?? "",
    qty: updated.quantity,
    date: formatDate(updated.date),
    source: updated.source_order_id ? `#${updated.source_order_id}` : "Manual",
  };
}
