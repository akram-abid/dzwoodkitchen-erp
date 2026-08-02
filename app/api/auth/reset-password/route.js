import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/tokens";

export async function POST(req) {
  const { token, password } = await req.json();
  const hashed = hashToken(token);

  const record = await prisma.passwordResetToken.findFirst({
    where: { token: hashed, expiresAt: { gt: new Date() } },
  });

  if (!record) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.update({
    where: { id: record.userId },
    data: { password: passwordHash },
  });

  await prisma.passwordResetToken.delete({ where: { id: record.id } });

  return NextResponse.json({ message: "Password updated." });
}
