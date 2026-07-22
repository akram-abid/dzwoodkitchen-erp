import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import {
  createOrderSchema,
  listOrdersQuerySchema,
} from "../../../lib/validation/order";
import { ZodError } from "zod";
import { getAllOrders, createOrder } from "../../services/ordersServices";

// GET /api/orders?state=in_production&client_id=3&page=1&pageSize=20
export async function GET(req) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const filters = listOrdersQuerySchema.parse(params);

    const result = await getAllOrders(filters);
    console.log("Fetched orders:", result);

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: err.errors },
        { status: 400 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}

// POST /api/orders
export async function POST(req) {
  try {
    const body = await req.json();

    const data = createOrderSchema.parse(body);

    const created = await createOrder(data);

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch (err) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid order data", details: err.errors },

        { status: 400 },
      );
    }

    console.error("[POST /api/orders] failed:", err);

    return NextResponse.json(
      { error: "Failed to create order", details: err.message },

      { status: 500 },
    );
  }
}
