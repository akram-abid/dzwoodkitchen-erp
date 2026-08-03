import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function createUser({ name, email, password }) {
  const password_hash = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    // Create worker
    const worker = await tx.workers.create({
      data: {
        full_name: name,
      },
    });

    // Create user
    return tx.users.create({
      data: {
        name,
        email,
        password_hash,
        role: UserRole.WORKER,
        worker_id: worker.id,
      },
    });
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


export async function resetUserPassword(id, newPassword) {
  const password_hash = await bcrypt.hash(newPassword, 10);
  await prisma.users.update({
    where: { id },
    data: { password_hash },
  });
  return { id, message: "Password reset successfully" };
}
