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
