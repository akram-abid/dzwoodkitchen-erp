import { prisma } from "../../lib/prisma";

export async function getAllOrders({ state, client_id, worker_id, page = 1, pageSize = 20 } = {}) {
  const where = {
    ...(state && { state }),
    ...(client_id && { client_id }),
    ...(worker_id && { worker_id }),
  }

  const whereClause = Object.keys(where).length > 0 ? where : undefined

  const [orders, total] = await Promise.all([
    prisma.orders.findMany({
      where: whereClause,
      include: {
        clients: true,
        workers: true,
      },
      orderBy: { created_at: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.orders.count(whereClause ? { where: whereClause } : undefined),
  ])

  return {
    data: orders,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  }
}

export async function createOrder(data) {
  return prisma.orders.create({ data })
}

export async function getOrderById(id) {
  return prisma.orders.findUnique({
    where: { id: Number(id) },
    include: {
      clients: true,
      workers: true,
    },
  })
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
      const fullName = WORKER_NAME_MAP[worker] || worker;
      const w = await tx.workers.findFirst({ where: { full_name: fullName } });
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
    if (technical && (technical.truckDistance || technical.floor || technical.fee)) {
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