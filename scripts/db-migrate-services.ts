/**
 * scripts/db-migrate-services.ts
 *
 * Phase 5A migration: restructures services into three categories
 * (Notary / Advocacy / Mediation) without touching any other data.
 *
 * Run with: npm run db:migrate-services
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import { readFileSync } from "fs";

// Load .env.local from project root
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error(
    "[db:migrate-services] ERROR: DATABASE_URL (or POSTGRES_URL) is not set in .env.local"
  );
  process.exit(1);
}

const sql = neon(dbUrl);

async function migrate() {
  console.log("[db:migrate-services] Connecting to Neon Postgres …");

  // 1. Read the new services object from seed.json
  const seedPath = resolve(process.cwd(), "content", "seed.json");
  const rawSeed = readFileSync(seedPath, "utf-8");
  const seedData = JSON.parse(rawSeed) as Record<string, any>;

  const newServices = seedData.services as Record<string, any>;
  const newMobile2 = (seedData.settings as Record<string, any>)?.mobile2 as
    | string
    | undefined;

  // 2. Read current DB row
  const rows = (await sql`SELECT data FROM site_content WHERE id = 1 LIMIT 1`) as Record<
    string,
    any
  >[];

  if (!rows || rows.length === 0) {
    console.error(
      "[db:migrate-services] ERROR: site_content row id=1 not found. Run db:seed first."
    );
    process.exit(1);
  }

  const currentDbData: Record<string, any> = rows[0].data;

  // 3. INSERT backup FIRST
  await sql`
    INSERT INTO site_content_backups (data, created_at)
    VALUES (${JSON.stringify(currentDbData)}::jsonb, now())
  `;
  console.log(
    "[db:migrate-services] ✓ Backup created in site_content_backups"
  );

  // 4. Patch the data in memory — only services + optional mobile2
  const patchedData: Record<string, any> = JSON.parse(
    JSON.stringify(currentDbData)
  );

  // Replace services subtree entirely
  patchedData.services = newServices;

  // Add mobile2 only if absent (never overwrite existing value)
  if (
    newMobile2 &&
    (patchedData.settings?.mobile2 === undefined ||
      patchedData.settings?.mobile2 === null ||
      patchedData.settings?.mobile2 === "")
  ) {
    patchedData.settings = { ...patchedData.settings, mobile2: newMobile2 };
    console.log(
      `[db:migrate-services] ✓ settings.mobile2 added: "${newMobile2}"`
    );
  } else if (patchedData.settings?.mobile2) {
    console.log(
      `[db:migrate-services] ℹ  settings.mobile2 already present ("${patchedData.settings.mobile2}") — not overwritten`
    );
  }

  // 5. Count what we wrote
  const categories: any[] = newServices.categories ?? [];
  const categoryCount = categories.length;
  const groupCount = categories.reduce(
    (sum: number, cat: any) => sum + (cat.groups?.length ?? 0),
    0
  );
  const itemCount = categories.reduce(
    (sum: number, cat: any) =>
      sum +
      (cat.groups ?? []).reduce(
        (s2: number, g: any) => s2 + (g.items?.length ?? 0),
        0
      ),
    0
  );

  // 6. Identify untouched top-level keys
  const touchedKeys = new Set(["services", "settings"]);
  const untouchedKeys = Object.keys(currentDbData).filter(
    (k) => !touchedKeys.has(k)
  );

  // 7. Write back
  await sql`
    UPDATE site_content
    SET data = ${JSON.stringify(patchedData)}::jsonb,
        updated_at = now()
    WHERE id = 1
  `;

  console.log("");
  console.log("═══════════════════════════════════════════════════════════");
  console.log("  Phase 5A migration — db:migrate-services");
  console.log("═══════════════════════════════════════════════════════════");
  console.log(`  Categories written : ${categoryCount}`);
  console.log(`  Groups written     : ${groupCount}`);
  console.log(`  Items written      : ${itemCount}`);
  console.log(`  Untouched keys     : ${untouchedKeys.join(", ")}`);
  console.log("═══════════════════════════════════════════════════════════");
  console.log("[db:migrate-services] ✓ site_content id=1 updated.");
}

migrate().catch((err) => {
  console.error("[db:migrate-services] FATAL:", err);
  process.exit(1);
});
