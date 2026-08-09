import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as jose from "jose";

function getSecretKey() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  return new TextEncoder().encode(secret);
}

async function isValidAdminSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) return false;

  const secret = getSecretKey();
  if (!secret) return false;

  try {
    const { payload } = await jose.jwtVerify(token, secret, {
      algorithms: ["HS256"],
    });
    return typeof payload.userId === "number" && typeof payload.username === "string";
  } catch {
    return false;
  }
}

/**
 * proxy.ts (Next.js 16)
 *
 * 1. If a request carries ?lang=ne or ?lang=en, set the "lang" cookie and
 *    redirect to the same path/query string WITHOUT the ?lang param.
 * 2. If a request is for /admin/* (except /admin/login), verify admin_session
 *    JWT; if missing or invalid, redirect to /admin/login.
 * 3. If a request is for /admin/login and user has a valid JWT, redirect to /admin.
 */
export async function proxy(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;
  const langParam = searchParams.get("lang");

  // 1. Language query parameter redirect
  if (langParam === "ne" || langParam === "en") {
    const url = request.nextUrl.clone();
    url.searchParams.delete("lang");

    const response = NextResponse.redirect(url, { status: 302 });
    response.cookies.set("lang", langParam, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax",
      httpOnly: false,
    });
    return response;
  }

  // 2. Admin route protection
  if (pathname.startsWith("/admin")) {
    const isAuthenticated = await isValidAdminSession(request);

    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        return NextResponse.redirect(new URL("/admin", request.url));
      }
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths EXCEPT Next.js internals, static files, and images
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
