import { NextResponse } from "next/server";
import {
  getMaterialConsumptionById,
  updateMaterialConsumption,
  deleteMaterialConsumption,
} from "../../../../services/materialconsumptionsServices";

// GET /api/orders/material-consumptions/:id
export async function GET(req, { params }) {
  try {
    const { id } = await params;
    const found = await getMaterialConsumptionById(id);
    if (!found) {
      return NextResponse.json(
        { error: "Material consumption not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ data: found });
  } catch (err) {
    console.error(
      "[GET /api/orders/material-consumptions/:id] failed:",
      err,
    );
    return NextResponse.json(
      { error: "Failed to fetch material consumption", details: err.message },
      { status: 400 },
    );
  }
}

// PATCH /api/orders/material-consumptions/:id
export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = await updateMaterialConsumption(id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(
      "[PATCH /api/orders/material-consumptions/:id] failed:",
      err,
    );
    return NextResponse.json(
      {
        error: "Failed to update material consumption",
        details: err.message,
      },
      { status: 400 },
    );
  }
}

// DELETE /api/orders/material-consumptions/:id
export async function DELETE(req, { params }) {
  try {
    const { id } = await params;
    const result = await deleteMaterialConsumption(id);
    return NextResponse.json(result);
  } catch (err) {
    console.error(
      "[DELETE /api/orders/material-consumptions/:id] failed:",
      err,
    );
    return NextResponse.json(
      {
        error: "Failed to delete material consumption",
        details: err.message,
      },
      { status: 400 },
    );
  }
}