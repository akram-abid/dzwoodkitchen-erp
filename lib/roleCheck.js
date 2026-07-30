import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;

// Wraps a route handler: pass array of roles allowed for that path.
export function withRole(allowedRoles, handler) {
  return async (req, ctx) => {
    const { NextResponse } = await import("next/server");

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    if (!allowedRoles.includes(payload.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return handler(req, ctx);
  };
}
