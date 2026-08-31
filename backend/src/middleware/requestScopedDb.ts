import type { NextFunction, Request, Response } from "express";
import { pool } from "../db/pool";

/**
 * Checks out one pool connection per request, wraps it in a transaction, and
 * -- when the request is authenticated -- binds app.current_user_id for that
 * transaction via set_config (parameterized, never string-interpolated into
 * SQL). Every RLS policy in backend/db/schema/900_rls.sql reads that setting
 * to decide what the request can see.
 *
 * Commit/rollback is decided by req.dbRollbackRequested (set by
 * errorHandler), NOT by res.statusCode < 400. A deliberate 4xx a route
 * handler returns on purpose - wrong OTP, invalid credentials, a rejected
 * validation - is a normal outcome whose side effects (e.g. an incremented
 * attempt counter) must still be committed. Rollback is reserved for an
 * actually unexpected error reaching errorHandler. Using status code as the
 * signal was tried first and is exactly backwards: it silently discarded
 * every OTP failed-attempt increment, so a 5-attempt lockout could never
 * trigger - caught by an actual end-to-end lockout test, not by inspection.
 *
 * A public route that never touches an RLS-protected table works fine
 * without a user. A route that touches one *does* need req.user set first,
 * or Postgres raises "unrecognized configuration parameter" - that's
 * deliberate fail-closed behavior, not a bug: it means a PHI query can never
 * silently run without a tenant/user context.
 *
 * Tradeoff worth knowing: this holds one pool connection per in-flight
 * request for the whole request lifetime, not just for the query. Fine at
 * the ~150 QPS peak this schema was sized for with a max-20 pool; revisit
 * (e.g. move to per-query connections plus an app-level current-user column
 * check) if concurrency grows well past that.
 */
export async function requestScopedDb(req: Request, res: Response, next: NextFunction) {
  const client = await pool.connect();
  let finalized = false;

  const finalize = async (commit: boolean) => {
    if (finalized) return;
    finalized = true;
    try {
      await client.query(commit ? "COMMIT" : "ROLLBACK");
    } catch (err) {
      console.error("[db] failed to finalize request transaction", err);
    } finally {
      client.release();
    }
  };

  try {
    await client.query("BEGIN");
    if (req.user?.id) {
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [req.user.id]);
    }
  } catch (err) {
    await finalize(false);
    return next(err);
  }

  req.db = client;
  res.once("finish", () => {
    void finalize(!req.dbRollbackRequested);
  });
  res.once("close", () => {
    void finalize(false);
  });

  next();
}
