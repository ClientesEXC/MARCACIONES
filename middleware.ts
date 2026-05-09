import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "./auth.config";
import { isAdminRole, isManagerRole } from "./src/lib/auth/roles";

const { auth } = NextAuth(authConfig);

const protectedPrefixes = [
  "/dashboard",
  "/employees",
  "/attendance",
  "/schedules",
  "/holidays",
  "/permissions",
  "/vacations",
  "/payroll",
  "/reports"
];

function isProtectedPath(pathname: string) {
  return protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export default auth((request) => {
  const { pathname } = request.nextUrl;
  const role = request.auth?.user?.role;

  if (pathname === "/login" && request.auth?.user) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isProtectedPath(pathname)) {
    return NextResponse.next();
  }

  if (!request.auth?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  if (
    (pathname.startsWith("/employees") ||
      pathname.startsWith("/schedules") ||
      pathname.startsWith("/holidays") ||
      pathname.startsWith("/payroll")) &&
    !isAdminRole(role)
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (pathname.startsWith("/reports") && !isManagerRole(role)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"]
};
