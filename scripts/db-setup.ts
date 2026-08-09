/**
 * scripts/db-setup.ts
 *
 * Creates the database tables required for Nischal Legal Office Phase 2.
 * Run with: npm run db:setup
 *
 * Tables created (IF NOT EXISTS):
 *   site_content  — stores the full site content as JSONB (single row, id=1)
 *   messages      — stores contact form submissions (Phase 3)
 */

import * as dotenv from "dotenv";
import { resolve } from "path";

// Load .env.local from the project root
dotenv.config({ path: resolve(process.cwd(), ".env.local") });

import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
if (!dbUrl) {
  console.error(
    "[db:setup] ERROR: DATABASE_URL (or POSTGRES_URL) is not set in .env.local"
  );
  process.exit(1);
}

const sql = neon(dbUrl);

async function setup() {
  console.log("[db:setup] Connecting to Neon Postgres …");

  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      id          INTEGER PRIMARY KEY,
      data        JSONB NOT NULL,
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("[db:setup] ✓ Table site_content ready");

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL,
      phone       TEXT NOT NULL,
      message     TEXT NOT NULL,
      lang        TEXT NOT NULL DEFAULT 'ne',
      read        BOOLEAN NOT NULL DEFAULT false,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("[db:setup] ✓ Table messages ready");

  console.log("[db:setup] Done — both tables exist.");
}

setup().catch((err) => {
  console.error("[db:setup] FATAL:", err);
  process.exit(1);
});
