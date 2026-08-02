import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateResetToken } from "@/lib/tokens";
import { sendResetPasswordEmail } from "@/lib/mailer";

export async function POST(req) {
  const { email } = await req.json();

  const genericResponse = NextResponse.json({
    message: "If that account exists, a reset link has been sent.",
  });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return genericResponse;

  const { rawToken, hashedToken, expiresAt } = generateResetToken();

  await prisma.passwordResetToken.upsert({
    where: { userId: user.id },
    update: { token: hashedToken, expiresAt },
    create: { userId: user.id, token: hashedToken, expiresAt },
  });

  const resetUrl = `${process.env.APP_URL}/reset-password?token=${rawToken}`;
  await sendResetPasswordEmail(user.email, resetUrl);

  return genericResponse;
}
