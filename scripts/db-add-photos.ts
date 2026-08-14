/**
 * scripts/db-add-photos.ts
 *
 * Appends four new office photos to gallery.items in the live database (site_content id=1).
 * Mirrors the same end state as content/seed.json.
 * Backs up site_content before any change.
 * Idempotent: skips any image path already present and reports what was skipped.
 *
 * Run with: npm run db:add-photos
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error("[db:add-photos] ERROR: DATABASE_URL (or POSTGRES_URL) is not set in .env.local");
  process.exit(1);
}

const sql = neon(dbUrl);

const NEW_PHOTOS = [
  {
    image: "/images/office-work-area.jpg",
    caption: {
      ne: "कार्यालयको कार्यकक्ष",
      en: "Office work area",
    },
  },
  {
    image: "/images/office-entrance-wide.jpg",
    caption: {
      ne: "कार्यालयको प्रवेशद्वार",
      en: "Office entrance",
    },
  },
  {
    image: "/images/office-counter-signboard.jpg",
    caption: {
      ne: "सेवा काउन्टर र कार्यालय बोर्ड",
      en: "Service counter and office board",
    },
  },
  {
    image: "/images/office-waiting-area.jpg",
    caption: {
      ne: "सेवाग्राही प्रतीक्षा कक्ष",
      en: "Client waiting area",
    },
  },
];

async function addPhotos() {
  const rows = (await sql`
    SELECT data FROM site_content WHERE id = 1 LIMIT 1
  `) as Record<string, any>[];

  if (!rows || rows.length === 0) {
    console.error("[db:add-photos] ERROR: site_content row id=1 not found.");
    process.exit(1);
  }

  const data = rows[0].data;
  const currentItems: any[] = data.gallery?.items ?? [];
  const initialLength = currentItems.length;

  const toAdd: typeof NEW_PHOTOS = [];
  const skipped: string[] = [];

  for (const item of NEW_PHOTOS) {
    const exists = currentItems.some((existing) => existing.image === item.image);
    if (exists) {
      skipped.push(item.image);
    } else {
      toAdd.push(item);
    }
  }

  if (skipped.length > 0) {
    console.log(`[db:add-photos] Skipped ${skipped.length} existing photo(s):`, skipped.join(", "));
  }

  if (toAdd.length === 0) {
    console.log("[db:add-photos] All 4 photos are already present in gallery — nothing to do. (Idempotent: safe to re-run)");
    process.exit(0);
  }

  // Backup first
  console.log("[db:add-photos] Backing up current content into site_content_backups …");
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
  console.log("[db:add-photos] ✓ Backup created.");

  // Append new items
  for (const item of toAdd) {
    data.gallery.items.push(item);
    console.log(`[db:add-photos] + Appended ${item.image}`);
  }

  // Save to DB
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET
      data = excluded.data,
      updated_at = now()
  `;

  console.log(`[db:add-photos] ✓ Successfully updated gallery items (grew from ${initialLength} to ${data.gallery.items.length}).`);
  console.log("[db:add-photos] Done.");
}

addPhotos().catch((err) => {
  console.error("[db:add-photos] FATAL:", err);
  process.exit(1);
});
