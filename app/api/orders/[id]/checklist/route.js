import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createChecklistItemSchema } from '@/lib/validation/order'
import { ZodError } from 'zod'

function parseId(idParam) {
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

export async function GET(_req, { params }) {
  const { id: idParam } = await params
  const orderId = parseId(idParam)
  if (!orderId) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })

  try {
    const items = await prisma.checklist_items.findMany({
      where: { order_id: orderId },
      orderBy: { created_at: 'asc' },
    })
    return NextResponse.json({ data: items })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch checklist items' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  const { id: idParam } = await params
  const orderId = parseId(idParam)
  if (!orderId) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })

  try {
    const body = await req.json()
    const data = createChecklistItemSchema.parse(body)

    const order = await prisma.orders.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const item = await prisma.checklist_items.create({
      data: { ...data, order_id: orderId },
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid checklist item data', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to create checklist item' }, { status: 500 })
  }
}