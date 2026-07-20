import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createPaymentSchema } from '../../../../../lib/validation/payment'
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
    const payments = await prisma.payments.findMany({
      where: { order_id: orderId },
      orderBy: { payment_date: 'desc' },
    })
    return NextResponse.json({ data: payments })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 })
  }
}

export async function POST(req, { params }) {
  const { id: idParam } = await params
  const orderId = parseId(idParam)
  if (!orderId) return NextResponse.json({ error: 'Invalid order id' }, { status: 400 })

  try {
    const body = await req.json()
    const data = createPaymentSchema.parse(body)

    const order = await prisma.orders.findUnique({ where: { id: orderId } })
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 })

    const payment = await prisma.payments.create({
      data: { ...data, order_id: orderId },
    })

    return NextResponse.json({ data: payment }, { status: 201 })
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json({ error: 'Invalid payment data', details: err.errors }, { status: 400 })
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to create payment' }, { status: 500 })
  }
}