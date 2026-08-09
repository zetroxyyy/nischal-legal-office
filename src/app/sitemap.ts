import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nischal-legal-office.vercel.app";
  let lastModified = new Date();

  const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (dbUrl) {
    try {
      const { neon } = await import("@neondatabase/serverless");
      const sql = neon(dbUrl);
      const rows = await sql`SELECT updated_at FROM site_content WHERE id = 1 LIMIT 1`;
      if (rows && rows.length > 0 && rows[0].updated_at) {
        lastModified = new Date(rows[0].updated_at);
      }
    } catch {
      // fallback to current date
    }
  }

  const routes = ["", "/services", "/contact"];

  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified,
    changeFrequency: "weekly",
    priority: route === "" ? 1.0 : 0.8,
  }));
}
