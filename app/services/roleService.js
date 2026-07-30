import { prisma } from "@/lib/prisma";

export async function createRole(name) {
  return prisma.roles.create({ data: { name } });
}

export async function listRoles() {
  return prisma.roles.findMany({ orderBy: { name: "asc" } });
}

export async function deleteRole(id) {
  const inUse = await prisma.users.findFirst({ where: { role_id: id } });
  if (inUse) throw new Error("Role in use — reassign users first");
  return prisma.roles.delete({ where: { id } });
}
