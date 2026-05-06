import { NextResponse } from "next/server";

export function middleware(req) {
  const { pathname } = req.nextUrl;

  // 🛑 Protected routes
  const protectedRoutes = ["/dashboard"];

  // Example: check cookie (set this after login)
  const userToken = req.cookies.get("user-token")?.value;

  const isProtected = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // 🚫 If no token and trying to access protected route
  if (isProtected && !userToken) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

// Apply middleware only to specific routes
export const config = {
  matcher: ["/dashboard/:path*"],
};