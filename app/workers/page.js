export const dynamic = "force-dynamic";
import WorkersClient from '../_components/WorkersClient';
import { getAllOrders } from '../services/ordersServices';

import { getAllWorkers } from '../services/workersServices';

export const metadata = {
  title: 'Workers — DZ Wood Kitchen',
  description: 'Worker management, daily attendance, and skill tracking',
};

// Prisma Decimal instances (decimal.js) aren't plain objects, so Next.js
// refuses to pass them from a Server Component to a Client Component.
// Walk the data and convert any Decimal-shaped value to a plain Number.
function serializeDecimals(value) {
  if (value === null || value === undefined) return value;
  if (typeof value?.toNumber === "function") return value.toNumber(); // Decimal
  if (value instanceof Date) return value;
  if (Array.isArray(value)) return value.map(serializeDecimals);
  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, serializeDecimals(v)]),
    );
  }
  return value;
}

export default async function WorkersPage() {

  const workers = await getAllWorkers()

  const ordersResult = await getAllOrders();
  const orders = serializeDecimals(ordersResult.data);

  return <WorkersClient workersData={workers} orders={orders} />;
}
