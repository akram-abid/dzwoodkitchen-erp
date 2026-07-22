import { prisma } from "../../lib/prisma";

export async function getAllOrders({
  state,
  client_id,
  worker_id,
  page = 1,
  pageSize = 20,
} = {}) {
  const where = {
    ...(state && { state }),
    ...(client_id && { client_id }),
    ...(worker_id && { worker_id }),
  };

  const whereClause = Object.keys(where).length > 0 ? where : undefined;

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where: whereClause,
      include: {
        clients: true,
        workers: true,
        order_items: true,
        payments: { orderBy: { payment_date: "asc" } },
        checklist_items: { where: { is_resolved: false } },
        delivery_notes: { orderBy: { id: "asc" }, take: 1 },
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.orders.count(whereClause ? { where: whereClause } : undefined),
  ]);

  return {
    data: orders,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
}

export async function getOrderById(id) {
  return prisma.orders.findUnique({
    where: { id: Number(id) },
    include: {
      clients: true,
      workers: true,
    },
  });
}
const STAGE_TO_STATE = {
  APPOINTMENT: "appointment",
  CONTRACT: "contract",
  IN_PRODUCTION: "in_production",
  READY_TO_DELIVER: "ready_to_delivery",
  COMPLETED: "completed",
};

function parseOrderId(id) {
  if (typeof id === "number") return id;
  const s = String(id);
  return s.startsWith("#") ? parseInt(s.slice(1), 10) : parseInt(s, 10);
}

export async function updateOrder(id, data) {
  const orderId = parseOrderId(id);
  if (!orderId || Number.isNaN(orderId)) {
    throw new Error("Invalid order id");
  }

  const {
    client,
    phone,
    address,
    project,
    amount,
    dueDate,
    stage,
    worker,
    items = [],
    payments = [],
    missingItems = [],
    technical = {},
  } = data;

  return prisma.$transaction(async (tx) => {
    // 1) Find or create the client
    let clientId;
    const existingClient = await tx.clients.findFirst({
      where: { full_name: client },
    });

    if (existingClient) {
      clientId = existingClient.id;
      if (phone !== undefined && phone !== existingClient.phone) {
        await tx.clients.update({
          where: { id: clientId },
          data: { phone: phone || null },
        });
      }
    } else {
      const created = await tx.clients.create({
        data: { full_name: client, phone: phone || null },
      });
      clientId = created.id;
    }

    // 2) Resolve worker
    let workerId = null;
    if (worker && worker !== "Unassigned") {
      const w = await tx.workers.findFirst({ where: { full_name: worker } });
      if (w) workerId = w.id;
    }

    // 3) Update the order row
    const state = STAGE_TO_STATE[stage] || "appointment";

    await tx.orders.update({
      where: { id: orderId },
      data: {
        client_id: clientId,
        worker_id: workerId,
        project_name: project,
        total_amount: amount,
        due_date: dueDate ? new Date(dueDate) : null,
        state,
        address: address || null,
        is_fully_completed: state === "completed",
        updated_at: new Date(),
      },
    });

    // 4) Replace order_items
    await tx.order_items.deleteMany({ where: { order_id: orderId } });
    if (items.length > 0) {
      await tx.order_items.createMany({
        data: items
          .filter((i) => i.name)
          .map((i) => ({
            order_id: orderId,
            name: i.name,
            quantity: i.qty,
            unit: i.unit,
            length_cm: i.l || null,
            width_cm: i.w || null,
            height_cm: i.h || null,
          })),
      });
    }

    // 5) Replace payments
    await tx.payments.deleteMany({ where: { order_id: orderId } });
    if (payments.length > 0) {
      await tx.payments.createMany({
        data: payments.map((p) => ({
          order_id: orderId,
          amount: p.amount,
          payment_date: p.date ? new Date(p.date) : new Date(),
          note: null,
        })),
      });
    }

    // 6) Replace checklist_items (missing parts)
    await tx.checklist_items.deleteMany({ where: { order_id: orderId } });
    if (missingItems.length > 0) {
      await tx.checklist_items.createMany({
        data: missingItems.map((m) => ({
          order_id: orderId,
          description: m.name,
          quantity: m.qty || 1,
          unit: m.unit || "pcs",
          notes: m.notes || null,
          is_resolved: false,
        })),
      });
    }

    // 7) Replace delivery_notes (technical file)
    await tx.delivery_notes.deleteMany({ where: { order_id: orderId } });
    if (
      technical &&
      (technical.truckDistance || technical.floor || technical.fee)
    ) {
      await tx.delivery_notes.create({
        data: {
          order_id: orderId,
          truck_distance_km:
            technical.truckDistance === "" || technical.truckDistance == null
              ? null
              : Number(technical.truckDistance),
          floor:
            technical.floor === "" || technical.floor == null
              ? null
              : Number(technical.floor),
          lift_cost: Number(technical.fee) || 0,
          remaining_amount: 0,
        },
      });
    }

    // 8) Return the fresh order with all relations
    return tx.orders.findUnique({
      where: { id: orderId },
      include: {
        clients: true,
        workers: true,
        order_items: true,
        payments: { orderBy: { payment_date: "asc" } },
        checklist_items: { where: { is_resolved: false } },
        delivery_notes: { orderBy: { id: "asc" }, take: 1 },
      },
    });
  });
}

export async function createOrder(data) {
  const {
    client,
    phone,
    address,
    project,
    amount,
    dueDate,
    stage,
    worker,
    items = [],
    payments = [],
    missingItems = [],
    technical = {},
  } = data;

  return prisma.$transaction(async (tx) => {
    // client
    let clientId;
    const existingClient = await tx.clients.findFirst({
      where: { full_name: client },
    });
    if (existingClient) {
      clientId = existingClient.id;
      if (phone !== undefined && phone !== existingClient.phone) {
        await tx.clients.update({
          where: { id: clientId },
          data: { phone: phone || null },
        });
      }
    } else {
      const c = await tx.clients.create({
        data: { full_name: client, phone: phone || null },
      });
      clientId = c.id;
    }

    // worker
    let workerId = null;
    if (worker && worker !== "Unassigned") {
      const w = await tx.workers.findFirst({ where: { full_name: worker } });
      if (w) workerId = w.id;
    }

    const state = STAGE_TO_STATE[stage] || "appointment";

    const order = await tx.orders.create({
      data: {
        client_id: clientId,
        worker_id: workerId,
        project_name: project,
        total_amount: amount,
        due_date: dueDate ? new Date(dueDate) : null,
        state,
        address: address || null,
        is_fully_completed: state === "completed",
      },
    });

    if (items.length > 0) {
      await tx.order_items.createMany({
        data: items
          .filter((i) => i.name)
          .map((i) => ({
            order_id: order.id,
            name: i.name,
            quantity: i.qty,
            unit: i.unit,
            length_cm: i.l || null,
            width_cm: i.w || null,
            height_cm: i.h || null,
          })),
      });
    }
    if (payments.length > 0) {
      await tx.payments.createMany({
        data: payments.map((p) => ({
          order_id: order.id,
          amount: p.amount,
          payment_date: p.date ? new Date(p.date) : new Date(),
          note: null,
        })),
      });
    }
    if (missingItems.length > 0) {
      await tx.checklist_items.createMany({
        data: missingItems.map((m) => ({
          order_id: order.id,
          description: m.name,
          quantity: m.qty || 1,
          unit: m.unit || "pcs",
          notes: m.notes || null,
          is_resolved: false,
        })),
      });
    }
    if (
      technical &&
      (technical.truckDistance || technical.floor || technical.fee)
    ) {
      await tx.delivery_notes.create({
        data: {
          order_id: order.id,
          truck_distance_km: technical.truckDistance
            ? Number(technical.truckDistance)
            : null,
          floor: technical.floor ? Number(technical.floor) : null,
          lift_cost: Number(technical.fee) || 0,
          remaining_amount: 0,
        },
      });
    }

    return tx.orders.findUnique({
      where: { id: order.id },
      include: {
        clients: true,
        workers: true,
        order_items: true,
        payments: { orderBy: { payment_date: "asc" } },
        checklist_items: { where: { is_resolved: false } },
        delivery_notes: { orderBy: { id: "asc" }, take: 1 },
      },
    });
  });
}

export async function deleteOrder(id) {
  const orderId = parseOrderId(id);
  if (!orderId || Number.isNaN(orderId)) throw new Error("Invalid order id");
  await prisma.orders.delete({ where: { id: orderId } });
  return { success: true };
}

export async function patchOrder(id, data) {
  const orderId = parseOrderId(id);
  if (!orderId || Number.isNaN(orderId)) throw new Error("Invalid order id");

  return prisma.$transaction(async (tx) => {
    const updateData = {};

    if (data.stage !== undefined) {
      const state = STAGE_TO_STATE[data.stage] || "appointment";
      updateData.state = state;
      updateData.is_fully_completed = state === "completed";
    }

    if (data.worker !== undefined) {
      if (data.worker && data.worker !== "Unassigned") {
        const w = await tx.workers.findFirst({
          where: { full_name: data.worker },
        });
        updateData.worker_id = w ? w.id : null;
      } else {
        updateData.worker_id = null;
      }
    }

    if (data.client !== undefined) {
      let clientId;
      const existing = await tx.clients.findFirst({
        where: { full_name: data.client },
      });
      if (existing) {
        clientId = existing.id;
        if (data.phone !== undefined && data.phone !== existing.phone) {
          await tx.clients.update({
            where: { id: clientId },
            data: { phone: data.phone || null },
          });
        }
      } else {
        const c = await tx.clients.create({
          data: { full_name: data.client, phone: data.phone || null },
        });
        clientId = c.id;
      }
      updateData.client_id = clientId;
    }

    if (data.project !== undefined) updateData.project_name = data.project;
    if (data.amount !== undefined) updateData.total_amount = data.amount;
    if (data.dueDate !== undefined) {
      updateData.due_date = data.dueDate ? new Date(data.dueDate) : null;
    }
    if (data.address !== undefined) updateData.address = data.address || null;

    // Replace-style child updates (only if provided)
    if (data.missingItems !== undefined) {
      await tx.checklist_items.deleteMany({ where: { order_id: orderId } });
      if (data.missingItems.length > 0) {
        await tx.checklist_items.createMany({
          data: data.missingItems.map((m) => ({
            order_id: orderId,
            description: m.name,
            quantity: m.qty || 1,
            unit: m.unit || "pcs",
            notes: m.notes || null,
            is_resolved: false,
          })),
        });
      }
    }
    if (data.technical !== undefined) {
      await tx.delivery_notes.deleteMany({ where: { order_id: orderId } });
      if (
        data.technical &&
        (data.technical.truckDistance ||
          data.technical.floor ||
          data.technical.fee)
      ) {
        await tx.delivery_notes.create({
          data: {
            order_id: orderId,
            truck_distance_km: data.technical.truckDistance
              ? Number(data.technical.truckDistance)
              : null,
            floor: data.technical.floor ? Number(data.technical.floor) : null,
            lift_cost: Number(data.technical.fee) || 0,
            remaining_amount: 0,
          },
        });
      }
    }
    if (data.payments !== undefined) {
      await tx.payments.deleteMany({ where: { order_id: orderId } });
      if (data.payments.length > 0) {
        await tx.payments.createMany({
          data: data.payments.map((p) => ({
            order_id: orderId,
            amount: p.amount,
            payment_date: p.date ? new Date(p.date) : new Date(),
            note: null,
          })),
        });
      }
    }
    if (data.items !== undefined) {
      await tx.order_items.deleteMany({ where: { order_id: orderId } });
      if (data.items.length > 0) {
        await tx.order_items.createMany({
          data: data.items
            .filter((i) => i.name)
            .map((i) => ({
              order_id: orderId,
              name: i.name,
              quantity: i.qty,
              unit: i.unit,
              length_cm: i.l || null,
              width_cm: i.w || null,
              height_cm: i.h || null,
            })),
        });
      }
    }

    updateData.updated_at = new Date();

    await tx.orders.update({ where: { id: orderId }, data: updateData });

    return tx.orders.findUnique({
      where: { id: orderId },
      include: {
        clients: true,
        workers: true,
        order_items: true,
        payments: { orderBy: { payment_date: "asc" } },
        checklist_items: { where: { is_resolved: false } },
        delivery_notes: { orderBy: { id: "asc" }, take: 1 },
      },
    });
  });
}

export async function getAllWorkers() {
  return prisma.workers.findMany({ orderBy: { full_name: "asc" } });
}
