import { Pool } from "pg";
import { env } from "../config/env";

// Render's managed Postgres requires SSL; local Postgres doesn't have a
// cert to offer. Gate on the host instead of NODE_ENV so a prod-configured
// box can still be pointed at a local db (e.g. during the Render cutover)
// without the connection breaking.
const isLocalDb = /^(localhost|127\.0\.0\.1)$/.test(new URL(env.APP_DATABASE_URL).hostname);

// One pool for the whole process. Sized for the ~50-150 QPS peak estimated
// for year one (see the backend grill) - revisit if p99 latency climbs under
// load before assuming it's a query problem.
export const pool = new Pool({
  connectionString: env.APP_DATABASE_URL,
  ssl: isLocalDb ? undefined : { rejectUnauthorized: false },
  max: 20,
});

pool.on("error", (err) => {
  console.error("[db] unexpected error on idle client", err);
});
