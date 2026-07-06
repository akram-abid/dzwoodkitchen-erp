import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { updateChecklistItemSchema } from '@/lib/validation/order'
import { ZodError } from 'zod'

function parseId(idParam) {
  const id = Number(idParam)
  if (!Number.isInteger(id) || id <= 0) return null
  return id
}

export async function PATCH(req, { params }) {
  const { id: idParam, itemId: itemIdParam } = await params
  const orderId = parseId(idParam)
  const itemId = parseId(itemIdParam)
  if (!orderId || !itemId) {
    return NextResponse.json({ error: 'Invalid order or item id' }, { status: 400 })
  }

  try {
    const body = await req.json()
    const { is_resolved } = updateChecklistItemSchema.parse(body)

    const item = await prisma.checklist_items.update({
      where: { id: itemId, order_id: orderId },
      data: {
        is_resolved,
        resolved_at: is_resolved ? new Date() : null,
      },
    })

    return NextResponse.json({ data: item })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: err.errors }, { status: 400 })
    }
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to update checklist item' }, { status: 500 })
  }
}

export async function DELETE(_req, { params }) {
  const { id: idParam, itemId: itemIdParam } = await params
  const orderId = parseId(idParam)
  const itemId = parseId(itemIdParam)
  if (!orderId || !itemId) {
    return NextResponse.json({ error: 'Invalid order or item id' }, { status: 400 })
  }

  try {
    await prisma.checklist_items.delete({
      where: { id: itemId, order_id: orderId },
    })
    return NextResponse.json({ data: { id: itemId } })
  } catch (err) {
    if (err?.code === 'P2025') {
      return NextResponse.json({ error: 'Checklist item not found' }, { status: 404 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete checklist item' }, { status: 500 })
  }
}