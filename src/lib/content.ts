import { cacheTag } from "next/cache";
import seedJson from "../../content/seed.json";

// Derive the SiteContent type directly from the seed JSON shape
// so it stays in sync automatically with the seed file.
export type SiteContent = typeof seedJson;

// The local seed is always available as a reliable fallback.
const localSeed: SiteContent = seedJson as SiteContent;

/**
 * getContent() — reads site_content row id=1 from Postgres and returns it.
 *
 * Caching: uses Next.js 16 "use cache" + cacheTag so the result is cached
 * for 300 s and can be invalidated on-demand with revalidateTag("content").
 */
export async function getContent(): Promise<SiteContent> {
  "use cache";
  cacheTag("content");

  const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!dbUrl) {
    console.warn("[content] No DATABASE_URL — using local seed.json fallback.");
    return localSeed;
  }

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(dbUrl);
    const rows = await sql`SELECT data FROM site_content WHERE id = 1 LIMIT 1`;
    if (!rows || rows.length === 0) {
      console.warn(
        "[content] site_content row id=1 not found — using local seed.json fallback."
      );
      return localSeed;
    }
    return rows[0].data as SiteContent;
  } catch (err) {
    console.warn(
      "[content] DB query failed — using local seed.json fallback.",
      String(err)
    );
    return localSeed;
  }
}

/**
 * getUncachedContent() — uncached read from database for admin pages and mutations.
 * Bypasses Next.js 16 "use cache" so admin pages ALWAYS render current DB data.
 */
export async function getUncachedContent(): Promise<SiteContent> {
  const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (!dbUrl) {
    return localSeed;
  }

  try {
    const { neon } = await import("@neondatabase/serverless");
    const sql = neon(dbUrl);
    const rows = await sql`SELECT data FROM site_content WHERE id = 1 LIMIT 1`;
    if (!rows || rows.length === 0) {
      return localSeed;
    }
    return rows[0].data as SiteContent;
  } catch (err) {
    console.warn("[getUncachedContent] DB query failed — fallback:", String(err));
    return localSeed;
  }
}

// Keep a synchronous default export of the local seed for any module
// that still needs it at import time (e.g. scripts).
export default localSeed;
