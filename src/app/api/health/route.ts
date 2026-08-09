import { NextResponse } from "next/server";

export async function GET() {
  const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

  if (!dbUrl) {
    return NextResponse.json({
      ok: true,
      contentSource: "fallback",
      updatedAt: null,
    });
  }

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(dbUrl);
    const rows = await sql`SELECT updated_at FROM site_content WHERE id = 1 LIMIT 1`;

    if (!rows || rows.length === 0) {
      return NextResponse.json({
        ok: true,
        contentSource: "fallback",
        updatedAt: null,
      });
    }

    return NextResponse.json({
      ok: true,
      contentSource: "db",
      updatedAt: rows[0].updated_at ?? null,
    });
  } catch {
    return NextResponse.json({
      ok: true,
      contentSource: "fallback",
      updatedAt: null,
    });
  }
}
