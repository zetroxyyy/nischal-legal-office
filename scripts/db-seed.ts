/**
 * scripts/db-seed.ts
 *
 * Reads content/seed.json and upserts it into site_content id=1.
 * Run with: npm run db:seed
 *
 * Safe to run multiple times — uses INSERT ... ON CONFLICT ... DO UPDATE.
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";

// Load .env.local from the project root
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error(
    "[db:seed] ERROR: DATABASE_URL (or POSTGRES_URL) is not set in .env.local"
  );
  process.exit(1);
}

const sql = neon(dbUrl);

async function seed() {
  console.log("[db:seed] Reading content/seed.json …");

  const seedPath = resolve(process.cwd(), "content", "seed.json");
  const raw = readFileSync(seedPath, "utf-8");
  const data = JSON.parse(raw) as Record<string, unknown>;

  const topLevelKeys = Object.keys(data);
  console.log("[db:seed] Top-level keys:", topLevelKeys.join(", "));

  console.log("[db:seed] Upserting into site_content id=1 …");
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id)
    DO UPDATE SET
      data       = excluded.data,
      updated_at = now()
  `;

  console.log(
    `[db:seed] ✓ site_content id=1 written with ${topLevelKeys.length} top-level keys: ${topLevelKeys.join(", ")}`
  );
}

seed().catch((err) => {
  console.error("[db:seed] FATAL:", err);
  process.exit(1);
});
