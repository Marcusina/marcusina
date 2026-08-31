import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";
import "dotenv/config";

// Deliberately a hand-rolled runner instead of a migration framework: the
// schema lives as plain, numbered .sql files in backend/db/schema/, applied
// once each and tracked in schema_migrations. Connects with
// MIGRATION_DATABASE_URL (the owner role - CREATE TABLE/ROLE/POLICY
// privileges), never APP_DATABASE_URL, which is intentionally restricted by
// the RLS grants in 900_rls.sql.
const SCHEMA_DIR = join(__dirname, "..", "..", "db", "schema");

async function main() {
  const connectionString = process.env.MIGRATION_DATABASE_URL;
  if (!connectionString) {
    console.error("[migrate] MIGRATION_DATABASE_URL is not set");
    process.exit(1);
  }

  // Same SSL gating as pool.ts - Render Postgres requires it, local doesn't
  // offer a cert.
  const isLocalDb = /^(localhost|127\.0\.0\.1)$/.test(new URL(connectionString).hostname);
  const client = new Client({
    connectionString,
    ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
  });
  await client.connect();

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `);

    const applied = new Set(
      (await client.query<{ filename: string }>("SELECT filename FROM schema_migrations")).rows.map(
        (r) => r.filename,
      ),
    );

    const files = readdirSync(SCHEMA_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      if (applied.has(file)) {
        console.log(`[migrate] skip  ${file} (already applied)`);
        continue;
      }

      const sql = readFileSync(join(SCHEMA_DIR, file), "utf8");
      console.log(`[migrate] apply ${file}`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log("[migrate] done");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("[migrate] failed:", err);
  process.exit(1);
});
