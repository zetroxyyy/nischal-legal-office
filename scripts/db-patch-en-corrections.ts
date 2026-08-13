/**
 * scripts/db-patch-en-corrections.ts
 *
 * Applies three client-confirmed English text corrections to the live database
 * (site_content id=1). Nepali text is left unchanged. Backs up before any change.
 *
 * Run with: npm run db:patch-en
 *
 * Corrections:
 *  1. services.categories[1].groups[0].items[0].en: "plaints/replies/depositions/petitions" → "plaintiff paper/rejoinder/..."
 *  2. services.categories[1].note.en: old → "Free legal service for the helpless and economically weak person."
 *  3. services.categories[0].groups[0].items[2].en: "statutes, memoranda of association and rules" → "...MA and AA, etc."
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error("[db:patch-en] ERROR: DATABASE_URL (or POSTGRES_URL) is not set in .env.local");
  process.exit(1);
}

const sql = neon(dbUrl);

async function patch() {
  const rows = (await sql`
    SELECT data FROM site_content WHERE id = 1 LIMIT 1
  `) as Record<string, any>[];

  if (!rows || rows.length === 0) {
    console.error("[db:patch-en] ERROR: site_content row id=1 not found.");
    process.exit(1);
  }

  const data = rows[0].data;

  // Backup first
  console.log("[db:patch-en] Backing up current content …");
  await sql`
    INSERT INTO site_content_backups (data, created_at)
    VALUES (${JSON.stringify(data)}::jsonb, now())
  `;
  await sql`
    DELETE FROM site_content_backups
    WHERE id NOT IN (
      SELECT id FROM site_content_backups
      ORDER BY id DESC
      LIMIT 20
    )
  `;
  console.log("[db:patch-en] ✓ Backup created.");

  let changed = 0;

  // --- Correction 1: categories[1].groups[0].items[0].en ---
  const OLD_1 = "Preparation of plaints, written replies, witness depositions and appeal petitions";
  const NEW_1 = "Preparation of plaintiff paper, rejoinder paper, witness deposition and appeal paper";
  const item1 = data.services?.categories?.[1]?.groups?.[0]?.items?.[0];
  if (item1 && item1.en === OLD_1) {
    item1.en = NEW_1;
    console.log("[db:patch-en] ✓ Correction 1 applied: plaints → plaintiff paper");
    changed++;
  } else if (item1?.en === NEW_1) {
    console.log("[db:patch-en] Correction 1 already applied, skipping.");
  } else {
    console.warn("[db:patch-en] ⚠ Correction 1: text not found at expected path — manual review needed.");
    console.warn("   Found:", item1?.en?.slice(0, 80));
  }

  // --- Correction 2: categories[1].note.en ---
  const OLD_2 = "Free legal service is available for destitute and economically weak persons.";
  const NEW_2 = "Free legal service for the helpless and economically weak person.";
  const note1 = data.services?.categories?.[1]?.note;
  if (note1 && note1.en === OLD_2) {
    note1.en = NEW_2;
    console.log("[db:patch-en] ✓ Correction 2 applied: destitute → helpless");
    changed++;
  } else if (note1?.en === NEW_2) {
    console.log("[db:patch-en] Correction 2 already applied, skipping.");
  } else {
    console.warn("[db:patch-en] ⚠ Correction 2: text not found at expected path — manual review needed.");
    console.warn("   Found:", note1?.en?.slice(0, 80));
  }

  // --- Correction 3: categories[0].groups[0].items[2].en ---
  const OLD_3 = "Applications, court documents, agreements, contracts, statutes, memoranda of association and rules";
  const NEW_3 = "Applications, court documents, agreements, contracts, statutes, Memorandum of Association (MA) and Memorandum of Articles (AA), etc.";
  const item3 = data.services?.categories?.[0]?.groups?.[0]?.items?.[2];
  if (item3 && item3.en === OLD_3) {
    item3.en = NEW_3;
    console.log("[db:patch-en] ✓ Correction 3 applied: memoranda → MA and AA");
    changed++;
  } else if (item3?.en === NEW_3) {
    console.log("[db:patch-en] Correction 3 already applied, skipping.");
  } else {
    console.warn("[db:patch-en] ⚠ Correction 3: text not found at expected path — manual review needed.");
    console.warn("   Found:", item3?.en?.slice(0, 80));
  }

  if (changed === 0) {
    console.log("[db:patch-en] All corrections already applied. No changes written.");
    process.exit(0);
  }

  // Write back
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET
      data = excluded.data,
      updated_at = now()
  `;

  console.log(`[db:patch-en] ✓ ${changed} correction(s) saved to database.`);
}

patch().catch((err) => {
  console.error("[db:patch-en] FATAL:", err);
  process.exit(1);
});
