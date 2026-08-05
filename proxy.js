import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function proxy(req) {

  const path = req.nextUrl.pathname;

  // public routes
  if (path.startsWith("/api/login") || path.startsWith("/api/setup")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    const isWorker = !payload.role || payload.role === "WORKER";

    if (isWorker && !path.startsWith("/api/workers")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.next();
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }
}

export const config = {
  matcher: ["/api/:path*"],
};
