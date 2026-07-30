import { prisma } from "../../lib/prisma";

function parseId(id) {
  const n = typeof id === "number" ? id : parseInt(String(id), 10);
  return Number.isNaN(n) ? null : n;
}

const CONSUMPTION_INCLUDE = {
  order: {
    select: { id: true, project_name: true, state: true, client_id: true },
  },
  material: {
    select: {
      id: true,
      code: true,
      name: true,
      default_unit: true,
      unit_price: true,
    },
  },
};

export async function getAllMaterialConsumptions({
  order_id,
  material_id,
  page = 1,
  pageSize = 20,
} = {}) {
  const where = {
    ...(order_id && { order_id: Number(order_id) }),
    ...(material_id && { material_id: Number(material_id) }),
  };

  const whereClause = Object.keys(where).length > 0 ? where : undefined;

  const [consumptions, total] = await Promise.all([
    prisma.order_material_consumptions.findMany({
      where: whereClause,
      include: CONSUMPTION_INCLUDE,
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order_material_consumptions.count({ where: whereClause }),
  ]);

  return {
    data: consumptions,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getMaterialConsumptionById(id) {
  const consumptionId = parseId(id);
  if (!consumptionId) throw new Error("Invalid material consumption id");

  return prisma.order_material_consumptions.findUnique({
    where: { id: consumptionId },
    include: CONSUMPTION_INCLUDE,
  });
}

export async function createMaterialConsumption(data) {
  const { order_id, material_id, quantity, unit, note } = data;

  if (!order_id) throw new Error("order_id is required");
  if (!material_id) throw new Error("material_id is required");
  if (quantity === undefined || quantity === null || quantity === "") {
    throw new Error("quantity is required");
  }

  const orderId = Number(order_id);
  const materialId = Number(material_id);
  const qty = Number(quantity);

  if (Number.isNaN(orderId)) throw new Error("Invalid order_id");
  if (Number.isNaN(materialId)) throw new Error("Invalid material_id");
  if (Number.isNaN(qty) || qty <= 0) {
    throw new Error("quantity must be a positive number");
  }

  const [order, material] = await Promise.all([
    prisma.orders.findUnique({ where: { id: orderId } }),
    prisma.material_catalog.findUnique({ where: { id: materialId } }),
  ]);
  if (!order) throw new Error("Order not found");
  if (!material) throw new Error("Material not found");

  return prisma.order_material_consumptions.create({
    data: {
      order_id: orderId,
      material_id: materialId,
      quantity: qty,
      unit: unit || material.default_unit || null,
      note: note || null,
    },
    include: CONSUMPTION_INCLUDE,
  });
}

export async function updateMaterialConsumption(id, data) {
  const consumptionId = parseId(id);
  if (!consumptionId) throw new Error("Invalid material consumption id");

  const existing = await prisma.order_material_consumptions.findUnique({
    where: { id: consumptionId },
  });
  if (!existing) throw new Error("Material consumption not found");

  const updateData = {};

  if (data.material_id !== undefined) {
    const materialId = Number(data.material_id);
    if (Number.isNaN(materialId)) throw new Error("Invalid material_id");
    const material = await prisma.material_catalog.findUnique({
      where: { id: materialId },
    });
    if (!material) throw new Error("Material not found");
    updateData.material_id = materialId;
  }

  if (data.order_id !== undefined) {
    const orderId = Number(data.order_id);
    if (Number.isNaN(orderId)) throw new Error("Invalid order_id");
    const order = await prisma.orders.findUnique({ where: { id: orderId } });
    if (!order) throw new Error("Order not found");
    updateData.order_id = orderId;
  }

  if (data.quantity !== undefined) {
    const qty = Number(data.quantity);
    if (Number.isNaN(qty) || qty <= 0) {
      throw new Error("quantity must be a positive number");
    }
    updateData.quantity = qty;
  }

  if (data.unit !== undefined) updateData.unit = data.unit || null;
  if (data.note !== undefined) updateData.note = data.note || null;

  return prisma.order_material_consumptions.update({
    where: { id: consumptionId },
    data: updateData,
    include: CONSUMPTION_INCLUDE,
  });
}

export async function deleteMaterialConsumption(id) {
  const consumptionId = parseId(id);
  if (!consumptionId) throw new Error("Invalid material consumption id");

  const existing = await prisma.order_material_consumptions.findUnique({
    where: { id: consumptionId },
  });
  if (!existing) throw new Error("Material consumption not found");

  await prisma.order_material_consumptions.delete({
    where: { id: consumptionId },
  });
  return { success: true };
}