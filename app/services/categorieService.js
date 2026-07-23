import { prisma } from "../../lib/prisma";

export async function getAllCategories() {
  const rows = await prisma.material_categories.findMany({ orderBy: { name: "asc" } });
  return rows.map((c) => ({ id: c.id, name: c.name }));
}