// middleware.ts — protects /admin/* routes (runs in Edge Runtime)
import { type NextRequest, NextResponse } from "next/server";
import { verifyAdminToken, COOKIE } from "@/lib/admin/auth";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow login page and API routes through
  if (
    pathname.startsWith("/admin/login") ||
    pathname.startsWith("/api/admin/auth")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};