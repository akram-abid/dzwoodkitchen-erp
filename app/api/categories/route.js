import { NextResponse } from "next/server";
import { getAllCategories } from "../../services/categorieService";

export async function GET() {
  try {
    return NextResponse.json(await getAllCategories());
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Failed to load categories" },
      { status: 500 },
    );
  }
}
