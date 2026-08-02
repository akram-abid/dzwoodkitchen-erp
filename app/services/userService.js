import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function createUser({
  name,
  email,
  password,
  role_id,
  worker_id,
  phone,
  hire_date,
  payment_type,
  hourlyRate,
  meterRate,
}) {
  const password_hash = await bcrypt.hash(password, 10);

  return prisma.$transaction(async (tx) => {
    let finalWorkerId = worker_id ?? null;

    if (!finalWorkerId && payment_type) {
      const createdWorker = await tx.workers.create({
        data: {
          full_name: name,
          phone: phone ?? null,
          hire_date: hire_date ?? null,
          payment_type,
          hourlyRate: hourlyRate ?? null,
          meterRate: meterRate ?? null,
        },
      });
      finalWorkerId = createdWorker.id;
    }

    return tx.users.create({
      data: { name, email, password_hash, role_id, worker_id: finalWorkerId },
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
