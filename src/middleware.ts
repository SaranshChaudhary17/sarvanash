import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("admin_session")?.value;
  const { pathname } = request.nextUrl;

  const expectedToken = process.env.SESSION_SECRET || "sarvanash-archive-token-2026";

  // If trying to access admin panel without active cookie session
  if (pathname.startsWith("/admin")) {
    if (!sessionToken || sessionToken !== expectedToken) {
      const loginUrl = new URL("/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // If already authenticated and trying to visit login page
  if (pathname.startsWith("/login")) {
    if (sessionToken && sessionToken === expectedToken) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};
