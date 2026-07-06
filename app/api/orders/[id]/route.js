import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateOrderSchema } from '@/lib/validation/order'
import { ZodError } from 'zod'

function parseId(idParam) {
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

// GET /api/orders/:id — full order detail with all related data
export async function GET(_req, { params }) {
  const { id: idParam } = await params
  const id = parseId(idParam)
  if (!id) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })

  try {
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        clients: true,
        workers: true,
        order_photos: true,
        payments: { orderBy: { payment_date: 'desc' } },
        checklist_items: true,
        vehicle_trips: { include: { vehicles: true } },
        delivery_notes: true,
      },
    })

    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    return NextResponse.json({ data: order })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

// PATCH /api/orders/:id
export async function PATCH(req, { params }) {
  const { id: idParam } = await params
  const id = parseId(idParam)
  if (!id) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })

  try {
    const body = await req.json()
    const data = updateOrderSchema.parse(body)

    const order = await prisma.orders.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: order })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid order data', details: err.errors }, { status: 400 })
    }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

// DELETE /api/orders/:id
export async function DELETE(_req, { params }) {
  const { id: idParam } = await params
  const id = parseId(idParam)
  if (!id) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })

  try {
    await prisma.orders.delete({ where: { id } })
    return NextResponse.json({ data: { id } })
  } catch (err) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete order' }, { status: 500 })
  }
}