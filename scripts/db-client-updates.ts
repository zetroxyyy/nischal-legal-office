/**
 * scripts/db-client-updates.ts
 *
 * Applies client-requested content updates to live database (site_content id=1):
 *  (a) ABOUT BODY: Updates office location sentence to "...भरतपुर, चितवनमा सञ्चालन गर्नुहुन्छ ।" / "...in Bharatpur, Chitwan."
 *  (b) GALLERY: Appends one item reusing the Advocate portrait (about.photo).
 *
 * Run with: npm run db:client-updates
 * Backs up site_content before mutations. Fully idempotent.
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error("[db:client-updates] ERROR: DATABASE_URL (or POSTGRES_URL) is not set in .env.local");
  process.exit(1);
}

const sql = neon(dbUrl);

const TARGET_NE_OLD = "निश्चल कानूनी कार्यालय तथा नेपाल नोटरी पब्लिकको कार्यालय, भरतपुर सञ्चालन गर्नुहुन्छ ।";
const TARGET_NE_NEW = "निश्चल कानूनी कार्यालय तथा नेपाल नोटरी पब्लिकको कार्यालय, भरतपुर, चितवनमा सञ्चालन गर्नुहुन्छ ।";

const TARGET_EN_OLD = "runs Nischal Legal Office and the Office of Nepal Notary Public in Bharatpur.";
const TARGET_EN_NEW = "runs Nischal Legal Office and the Office of Nepal Notary Public in Bharatpur, Chitwan.";

async function runClientUpdates() {
  const rows = (await sql`
    SELECT data FROM site_content WHERE id = 1 LIMIT 1
  `) as Record<string, any>[];

  if (!rows || rows.length === 0) {
    console.error("[db:client-updates] ERROR: site_content row id=1 not found.");
    process.exit(1);
  }

  const data = rows[0].data;

  let neUpdated = false;
  let enUpdated = false;
  let galleryUpdated = false;

  const currentNeBody = data.about?.body?.ne ?? "";
  const currentEnBody = data.about?.body?.en ?? "";
  const aboutPhoto = data.about?.photo;

  // Check if NE about.body needs update
  if (currentNeBody.includes(TARGET_NE_OLD)) {
    neUpdated = true;
  } else if (!currentNeBody.includes(TARGET_NE_NEW)) {
    console.error("[db:client-updates] ABORTING: Target Nepali substring not found in about.body.ne!");
    console.error("Expected to find:", TARGET_NE_OLD);
    console.error("Found:", currentNeBody);
    process.exit(1);
  }

  // Check if EN about.body needs update
  if (currentEnBody.includes(TARGET_EN_OLD)) {
    enUpdated = true;
  } else if (!currentEnBody.includes(TARGET_EN_NEW)) {
    console.error("[db:client-updates] ABORTING: Target English substring not found in about.body.en!");
    console.error("Expected to find:", TARGET_EN_OLD);
    console.error("Found:", currentEnBody);
    process.exit(1);
  }

  // Check if Gallery needs update
  const galleryItems: any[] = data.gallery?.items ?? [];
  const galleryAlreadyHasPhoto = galleryItems.some((item) => item.image === aboutPhoto);
  if (!galleryAlreadyHasPhoto) {
    galleryUpdated = true;
  }

  // Idempotency check
  if (!neUpdated && !enUpdated && !galleryUpdated) {
    console.log("[db:client-updates] All client updates already applied — nothing to do. (Idempotent: safe to re-run)");
    process.exit(0);
  }

  // Backup first
  console.log("[db:client-updates] Backing up current content into site_content_backups …");
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
  console.log("[db:client-updates] ✓ Backup created.");

  // (a) Update About Body
  if (neUpdated) {
    // Print before/after sentence
    const firstParaNe = currentNeBody.split(/\r?\n\r?\n/)[0];
    const sentenceOldNe = firstParaNe.match(/[^।]*निश्चल कानूनी कार्यालय तथा नेपाल नोटरी पब्लिकको कार्यालय, भरतपुर सञ्चालन गर्नुहुन्छ ।/)?.[0] ?? TARGET_NE_OLD;
    const sentenceNewNe = sentenceOldNe.replace(TARGET_NE_OLD, TARGET_NE_NEW);

    console.log("[db:client-updates] --- Nepali About Body Sentence ---");
    console.log("BEFORE:", sentenceOldNe);
    console.log("AFTER: ", sentenceNewNe);

    data.about.body.ne = currentNeBody.replace(TARGET_NE_OLD, TARGET_NE_NEW);
  }

  if (enUpdated) {
    const firstParaEn = currentEnBody.split(/\r?\n\r?\n/)[0];
    const sentenceOldEn = firstParaEn.match(/[^.]*runs Nischal Legal Office and the Office of Nepal Notary Public in Bharatpur\./)?.[0] ?? TARGET_EN_OLD;
    const sentenceNewEn = sentenceOldEn.replace(TARGET_EN_OLD, TARGET_EN_NEW);

    console.log("[db:client-updates] --- English About Body Sentence ---");
    console.log("BEFORE:", sentenceOldEn);
    console.log("AFTER: ", sentenceNewEn);

    data.about.body.en = currentEnBody.replace(TARGET_EN_OLD, TARGET_EN_NEW);
  }

  // (b) Update Gallery
  if (galleryUpdated) {
    const newItem = {
      image: aboutPhoto,
      caption: {
        ne: "अधिवक्ता हरि ब. मैनाली",
        en: "Advocate Hari Bdr. Mainali",
      },
    };
    data.gallery.items.push(newItem);
    console.log(`[db:client-updates] ✓ Appended advocate portrait (${aboutPhoto}) to gallery. (New length: ${data.gallery.items.length})`);
  }

  // Save changes to DB
  await sql`
    INSERT INTO site_content (id, data, updated_at)
    VALUES (1, ${JSON.stringify(data)}::jsonb, now())
    ON CONFLICT (id) DO UPDATE SET
      data = excluded.data,
      updated_at = now()
  `;

  console.log("[db:client-updates] ✓ Saved updated site_content to database.");
  console.log("[db:client-updates] Done.");
}

runClientUpdates().catch((err) => {
  console.error("[db:client-updates] FATAL:", err);
  process.exit(1);
});
