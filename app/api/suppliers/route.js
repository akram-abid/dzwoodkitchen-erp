import { NextResponse } from "next/server";
import { getAllSuppliers, createSupplier } from "../../services/supplierService";


export async function GET() {
  try {
    const suppliers = await getAllSuppliers();
    return NextResponse.json(suppliers);
  } catch (err) {
    console.error("GET /api/suppliers failed:", err);
    return NextResponse.json(
      { error: "Failed to load suppliers" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const created = await createSupplier(body);
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    if (err.status) {
      return NextResponse.json(
        { error: err.message, fields: err.fields },
        { status: err.status },
      );
    }
    console.error("POST /api/suppliers failed:", err);
    return NextResponse.json(
      { error: "Failed to create supplier" },
      { status: 500 },
    );
  }
}
