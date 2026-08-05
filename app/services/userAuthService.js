import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Runs once — creates the first admin account, then locks itself forever.
export async function bootstrapAdmin({ name, email, password }) {
  const existingAdmin = await prisma.users.findFirst({
    where: { role: "ADMIN" },
  });
  if (existingAdmin) throw new Error("Admin already exists — setup locked");

  const password_hash = await bcrypt.hash(password, 10);

  return prisma.users.create({
    data: { name, email, password_hash, role: "ADMIN" },
  });
}

export async function login({ email, password }) {
  const user = await prisma.users.findUnique({
    where: { email },
  });
  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const token = jwt.sign(
    { userId: user.id, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
}
