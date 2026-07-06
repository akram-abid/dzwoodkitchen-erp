import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPhotoSchema } from '@/lib/validation/order'
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
    const photos = await prisma.order_photos.findMany({
      where: { order_id: orderId },
      orderBy: { uploaded_at: 'desc' },
    })
    return NextResponse.json({ data: photos })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  const { id: idParam } = await params
  const orderId = parseId(idParam)
  if (!orderId) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })

  try {
    const body = await req.json()
    const data = createPhotoSchema.parse(body)

    const order = await prisma.orders.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const photo = await prisma.order_photos.create({
      data: { ...data, order_id: orderId },
    })

    return NextResponse.json({ data: photo }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid photo data', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to attach photo' }, { status: 500 })
  }
}