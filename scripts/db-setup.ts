/**
 * scripts/db-setup.ts
 *
 * Creates the database tables required for Nischal Legal Service.
 * Run with: npm run db:setup
 *
 * Tables created (IF NOT EXISTS):
 *   site_content          — stores the full site content as JSONB (single row, id=1)
 *   messages              — stores contact form submissions
 *   admin_users           — stores admin user authentication & lock state
 *   site_content_backups  — stores content history backups
 */

import * as dotenv from "dotenv";
import { resolve } from "path";
import bcrypt from "bcryptjs";

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

  await sql`
    CREATE TABLE IF NOT EXISTS admin_users (
      id              SERIAL PRIMARY KEY,
      username        TEXT UNIQUE NOT NULL,
      password_hash   TEXT NOT NULL,
      must_change     BOOLEAN NOT NULL DEFAULT true,
      failed_attempts INT NOT NULL DEFAULT 0,
      locked_until    TIMESTAMPTZ,
      updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("[db:setup] ✓ Table admin_users ready");

  await sql`
    CREATE TABLE IF NOT EXISTS site_content_backups (
      id          SERIAL PRIMARY KEY,
      data        JSONB NOT NULL,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  console.log("[db:setup] ✓ Table site_content_backups ready");

  // Check if admin_users is empty, if so insert default admin
  const existingAdmins = await sql`SELECT id FROM admin_users LIMIT 1`;
  if (existingAdmins.length === 0) {
    const defaultUsername = "admin";
    const defaultPassword = "nischal2026";
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    await sql`
      INSERT INTO admin_users (username, password_hash, must_change, failed_attempts, updated_at)
      VALUES (${defaultUsername}, ${passwordHash}, true, 0, now())
    `;
    console.log("--------------------------------------------------");
    console.log("[db:setup] Created initial admin credentials:");
    console.log(`  Username: ${defaultUsername}`);
    console.log(`  Password: ${defaultPassword}`);
    console.log("--------------------------------------------------");
  } else {
    console.log("[db:setup] admin_users already contains users; skipping initial seed.");
  }

  console.log("[db:setup] Done — all tables and initial admin ready.");
}

setup().catch((err) => {
  console.error("[db:setup] FATAL:", err);
  process.exit(1);
});
