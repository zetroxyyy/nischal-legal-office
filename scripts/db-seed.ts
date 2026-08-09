/**
 * scripts/db-seed.ts
 *
 * Reads content/seed.json and writes it into site_content id=1.
 * Run with: npm run db:seed
 * Force overwrite: npm run db:seed -- --force
 *
 * Guarded: If row 1 already exists, refuses to overwrite without --force.
 * When --force is supplied, creates a backup in site_content_backups before overwriting.
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
  const isForce = process.argv.includes("--force");

  // Check if row 1 already exists
  const existing = (await sql`
    SELECT data FROM site_content WHERE id = 1 LIMIT 1
  `) as Record<string, any>[];

  if (existing.length > 0 && !isForce) {
    console.error(
      "site_content already has data — refusing to overwrite. Run with --force to overwrite (THIS DESTROYS ALL CLIENT EDITS)."
    );
    process.exit(1);
  }

  if (existing.length > 0 && isForce) {
    console.log("[db:seed] --force specified. Backing up existing content into site_content_backups …");
    await sql`
      INSERT INTO site_content_backups (data, created_at)
      VALUES (${JSON.stringify(existing[0].data)}::jsonb, now())
    `;
    console.log("[db:seed] ✓ Backup created successfully.");
  }

  console.log("[db:seed] Reading content/seed.json …");

  const seedPath = resolve(process.cwd(), "content", "seed.json");
  const raw = readFileSync(seedPath, "utf-8");
  const data = JSON.parse(raw) as Record<string, unknown>;

  const topLevelKeys = Object.keys(data);
  console.log("[db:seed] Top-level keys:", topLevelKeys.join(", "));

  console.log("[db:seed] Writing into site_content id=1 …");
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
