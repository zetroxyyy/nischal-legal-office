/**
 * scripts/db-merge-keys.ts
 *
 * Reads site_content row 1, backs it up into site_content_backups,
 * and deep-merges ONLY missing keys from content/seed.json into the DB row.
 * Existing database values always take precedence.
 *
 * Run with: npm run db:merge
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";

// Load .env.local from project root
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error("[db:merge] ERROR: DATABASE_URL (or POSTGRES_URL) is not set in .env.local");
  process.exit(1);
}

const sql = neon(dbUrl);

function isObject(val: any): val is Record<string, any> {
  return val !== null && typeof val === "object" && !Array.isArray(val);
}

function deepMergeMissing(target: Record<string, any>, source: Record<string, any>, path = ""): string[] {
  const addedKeys: string[] = [];

  for (const key of Object.keys(source)) {
    const currentPath = path ? `${path}.${key}` : key;
    if (!(key in target) || target[key] === undefined) {
      target[key] = JSON.parse(JSON.stringify(source[key]));
      addedKeys.push(currentPath);
    } else if (isObject(target[key]) && isObject(source[key])) {
      const nestedAdded = deepMergeMissing(target[key], source[key], currentPath);
      addedKeys.push(...nestedAdded);
    }
  }

  return addedKeys;
}

async function merge() {
  console.log("[db:merge] Connecting to Neon Postgres …");

  const seedPath = resolve(process.cwd(), "content", "seed.json");
  const rawSeed = readFileSync(seedPath, "utf-8");
  const seedData = JSON.parse(rawSeed) as Record<string, any>;

  const rows = (await sql`SELECT data FROM site_content WHERE id = 1 LIMIT 1`) as Record<string, any>[];

  if (!rows || rows.length === 0) {
    console.log("[db:merge] site_content row id=1 not found. Inserting complete seed.json …");
    await sql`
      INSERT INTO site_content (id, data, updated_at)
      VALUES (1, ${JSON.stringify(seedData)}::jsonb, now())
    `;
    console.log("[db:merge] ✓ Inserted initial seed content into site_content id=1");
    return;
  }

  const currentDbData = rows[0].data;

  // 1. Back up current content
  await sql`
    INSERT INTO site_content_backups (data, created_at)
    VALUES (${JSON.stringify(currentDbData)}::jsonb, now())
  `;
  console.log("[db:merge] ✓ Backed up current site_content into site_content_backups");

  // 2. Deep merge missing keys
  const mergedData = JSON.parse(JSON.stringify(currentDbData));
  const addedKeys = deepMergeMissing(mergedData, seedData);

  if (addedKeys.length === 0) {
    console.log("[db:merge] No missing keys found. Database content is already up-to-date.");
    return;
  }

  console.log(`[db:merge] Found and added ${addedKeys.length} new key(s):`);
  for (const k of addedKeys) {
    console.log(`  + ${k}`);
  }

  // 3. Write back to database
  await sql`
    UPDATE site_content
    SET data = ${JSON.stringify(mergedData)}::jsonb,
        updated_at = now()
    WHERE id = 1
  `;

  console.log("[db:merge] ✓ site_content id=1 updated successfully with merged keys");
}

merge().catch((err) => {
  console.error("[db:merge] FATAL:", err);
  process.exit(1);
});
