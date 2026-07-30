import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createUser({ name, email, password, role_id, worker_id }) {
  const password_hash = await bcrypt.hash(password, 10);
  return prisma.users.create({
    data: { name, email, password_hash, role_id, worker_id: worker_id ?? null },
  });
}

export async function listUsers() {
  return prisma.users.findMany({
    include: { role: true, worker: true },
    orderBy: { created_at: "desc" },
  });
}

export async function updateUser(id, data) {
  const patch = { ...data };
  if (patch.password) {
    patch.password_hash = await bcrypt.hash(patch.password, 10);
    delete patch.password;
  }
  return prisma.users.update({ where: { id }, data: patch });
}

export async function deleteUser(id) {
  return prisma.users.delete({ where: { id } });
}

export async function assignRole(userId, role_id) {
  return prisma.users.update({ where: { id: userId }, data: { role_id } });
}
