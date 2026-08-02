import crypto from "crypto";

export function generateResetToken() {
  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  return { rawToken, hashedToken, expiresAt };
}

export function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}
