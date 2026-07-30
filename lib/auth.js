import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

// Wraps a route handler: verifies JWT, checks role, injects req.user.
// Usage: export const GET = withAuth("admin", async (req, ctx) => {...});
export function withAuth(requiredRole, handler) {
  return async (req, ctx) => {
    try {
      const token = req.headers.get("authorization")?.replace("Bearer ", "");
      if (!token) return NextResponse.json({ error: "No token" }, { status: 401 });

      const payload = jwt.verify(token, JWT_SECRET);
      if (requiredRole && payload.role !== requiredRole) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      req.user = payload;
      return await handler(req, ctx);
    } catch (err) {
      return NextResponse.json({ error: err.message || "Unauthorized" }, { status: 401 });
    }
  };
}
