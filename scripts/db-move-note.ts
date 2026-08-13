/**
 * scripts/db-move-note.ts
 *
 * Moves services.note text to services.categories[0].note as a SECOND PARAGRAPH.
 * Run with: npm run db:move-note
 *
 * Behaviour:
 *  - Backs up current site_content into site_content_backups before any change.
 *  - Appends services.note.ne / services.note.en to categories[0].note.ne / .en
 *    using "\n\n" as paragraph separator.
 *  - Sets services.note to {ne:"", en:""}.
 *  - Idempotent: if services.note is already empty, exits with a message and no change.
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error("[db:move-note] ERROR: DATABASE_URL (or POSTGRES_URL) is not set in .env.local");
  process.exit(1);
}

const sql = neon(dbUrl);

async function moveNote() {
  // Read current content
  const rows = (await sql`
    SELECT data FROM site_content WHERE id = 1 LIMIT 1
  `) as Record<string, any>[];

  if (!rows || rows.length === 0) {
    console.error("[db:move-note] ERROR: site_content row id=1 not found. Run db:setup and db:seed first.");
    process.exit(1);
  }

  const data = rows[0].data;
  const globalNote = data.services?.note;

  // Idempotency check: if services.note is already empty, do nothing
  const neText = (globalNote?.ne ?? "").trim();
  const enText = (globalNote?.en ?? "").trim();

  if (!neText && !enText) {
    console.log("[db:move-note] services.note is already empty — nothing to do. (Idempotent: safe to re-run)");
    process.exit(0);
  }

  console.log("[db:move-note] Current services.note.en:", enText.slice(0, 80), "...");
  console.log("[db:move-note] Backing up current content into site_content_backups …");

  // Backup
  await sql`
    INSERT INTO site_content_backups (data, created_at)
    VALUES (${JSON.stringify(data)}::jsonb, now())
  `;
  // Trim backups to newest 20
  await sql`
    DELETE FROM site_content_backups
    WHERE id NOT IN (
      SELECT id FROM site_content_backups
      ORDER BY id DESC
      LIMIT 20
    )
  `;
  console.log("[db:move-note] ✓ Backup created.");

  // Append services.note as second paragraph of categories[0].note
  const cat0Note = data.services.categories[0].note;

  const existingNe = (cat0Note?.ne ?? "").trim();
  const existingEn = (cat0Note?.en ?? "").trim();

  data.services.categories[0].note = {
    ne: existingNe ? `${existingNe}\n\n${neText}` : neText,
    en: existingEn ? `${existingEn}\n\n${enText}` : enText,
  };

  // Clear global note
  data.services.note = { ne: "", en: "" };

  // Save
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET
      data = excluded.data,
      updated_at = now()
  `;

  console.log("[db:move-note] ✓ services.note text appended to categories[0].note as second paragraph.");
  console.log("[db:move-note] ✓ services.note cleared to {ne:\"\", en:\"\"}.");
  console.log("[db:move-note] Done.");
}

moveNote().catch((err) => {
  console.error("[db:move-note] FATAL:", err);
  process.exit(1);
});
