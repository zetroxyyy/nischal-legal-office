import { neon } from "@neondatabase/serverless";

const dbUrl = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;

// Export a lazy sql client. If the env var is missing the variable is
// undefined; any attempt to call sql() will throw a clear error at that point.
let _sql: ReturnType<typeof neon> | undefined;

export function getSql(): ReturnType<typeof neon> {
  if (!_sql) {
    if (!dbUrl) {
      throw new Error(
        "[db] DATABASE_URL (or POSTGRES_URL) is not set. " +
          "Add it to .env.local for local development."
      );
    }
    _sql = neon(dbUrl);
  }
  return _sql;
}

export { neon };
