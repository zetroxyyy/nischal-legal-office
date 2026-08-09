import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * proxy.ts (Next.js 16 — replaces middleware.ts)
 *
 * If a request carries ?lang=ne or ?lang=en, set the "lang" cookie and
 * redirect to the same path/query string WITHOUT the ?lang param.
 * The existing POST /api/lang toggle continues to work independently.
 */
export function proxy(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;
  const langParam = searchParams.get("lang");

  if (langParam === "ne" || langParam === "en") {
    // Build the redirect URL: same path, without the lang param
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

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all paths EXCEPT Next.js internals, static files, and images
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
