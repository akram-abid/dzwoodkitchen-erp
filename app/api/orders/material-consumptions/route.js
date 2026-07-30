import { NextResponse } from "next/server";
import {
  getAllMaterialConsumptions,
  createMaterialConsumption,
} from "../../../services/materialconsumptionsServices";

// GET /api/orders/material-consumptions?order_id=24&material_id=3&page=1&pageSize=20
export async function GET(req) {
  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const filters = {
      order_id: params.order_id ? Number(params.order_id) : undefined,
      material_id: params.material_id ? Number(params.material_id) : undefined,
      page: params.page ? Number(params.page) : 1,
      pageSize: params.pageSize ? Number(params.pageSize) : 20,
    };

    const result = await getAllMaterialConsumptions(filters);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[GET /api/orders/material-consumptions] failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch material consumptions" },
      { status: 500 },
    );
  }
}

// POST /api/orders/material-consumptions
export async function POST(req) {
  try {
    const body = await req.json();
    
    const created = await createMaterialConsumption(body);
    return NextResponse.json(
      { success: true, data: created },
      { status: 201 },
    );
  } catch (err) {
    console.error("[POST /api/orders/material-consumptions] failed:", err);
    return NextResponse.json(
      {
        error: "Failed to create material consumption",
        details: err.message,
      },
      { status: 400 },
    );
  }
}