const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

// GET /api/orders
export async function fetchOrders(params = {}) {
  const query = new URLSearchParams()
  if (params.state) query.set('state', params.state)
  if (params.client_id) query.set('client_id', params.client_id)
  if (params.worker_id) query.set('worker_id', params.worker_id)
  if (params.page) query.set('page', String(params.page))
  if (params.pageSize) query.set('pageSize', String(params.pageSize))

  const res = await fetch(`${API_URL}/api/orders?${query.toString()}`)
  if (!res.ok) throw new Error('Failed to fetch orders')
  return res.json()
}

// POST /api/orders
export async function createOrder(data) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to create order')
  return res.json()
}