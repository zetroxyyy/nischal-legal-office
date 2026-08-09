import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const lang = formData.get("lang");
  const referer = req.headers.get("referer") ?? "/";

  const validLang = lang === "en" ? "en" : "ne";

  const response = NextResponse.redirect(referer, { status: 303 });
  response.cookies.set("lang", validLang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
    sameSite: "lax",
    httpOnly: false,
  });
  return response;
}
