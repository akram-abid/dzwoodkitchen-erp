import { NextResponse } from 'next/server'
import { prisma } from "../../../lib/prisma"
import { createOrderSchema, listOrdersQuerySchema } from '../../../lib/validation/order'
import { ZodError } from 'zod'

// GET /api/orders?state=in_production&client_id=3&page=1&pageSize=20
export async function GET(req) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams)
    const { state, client_id, worker_id, page, pageSize } = listOrdersQuerySchema.parse(params)

    const where = {
      ...(state && { state }),
      ...(client_id && { client_id }),
      ...(worker_id && { worker_id }),
    }

    const [orders, total] = await Promise.all([
      prisma.orders.findMany({
        where,
        include: {
          clients: true, // relation field name — confirm against your generated prisma/schema.prisma
          workers: true,
        },
        orderBy: { created_at: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.orders.count({ where }),
    ])

    return NextResponse.json({
      data: orders,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid query parameters', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

// POST /api/orders
export async function POST(req) {
  try {
    const body = await req.json()
    const data = createOrderSchema.parse(body)

    const order = await prisma.orders.create({ data })

    return NextResponse.json({ data: order }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid order data', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}