import type { PoolClient } from "pg";

export type LifecycleTokenPurpose = "deactivate" | "reactivate";

export interface AccountLifecycleTokenRow {
  id: string;
  user_id: string;
  purpose: LifecycleTokenPurpose;
  token_hash: string;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
}

export function insertAccountLifecycleToken(
  db: PoolClient,
  args: { userId: string; purpose: LifecycleTokenPurpose; tokenHash: string; expiresAt: string },
) {
  return db
    .query<AccountLifecycleTokenRow>(
      `INSERT INTO account_lifecycle_tokens (user_id, purpose, token_hash, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [args.userId, args.purpose, args.tokenHash, args.expiresAt],
    )
    .then((r) => r.rows[0]);
}

export function findAccountLifecycleTokenByHash(db: PoolClient, tokenHash: string) {
  return db
    .query<AccountLifecycleTokenRow>("SELECT * FROM account_lifecycle_tokens WHERE token_hash = $1", [tokenHash])
    .then((r) => r.rows[0] ?? null);
}

// Matches idx_account_lifecycle_tokens_active in 019_account_lifecycle.sql -
// used for the deactivation-request cooldown.
export function findActiveAccountLifecycleToken(db: PoolClient, userId: string, purpose: LifecycleTokenPurpose) {
  return db
    .query<AccountLifecycleTokenRow>(
      `SELECT * FROM account_lifecycle_tokens
       WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId, purpose],
    )
    .then((r) => r.rows[0] ?? null);
}

export function markAccountLifecycleTokenConsumed(db: PoolClient, id: string) {
  return db.query("UPDATE account_lifecycle_tokens SET consumed_at = now() WHERE id = $1", [id]);
}

export function invalidateActiveAccountLifecycleTokens(
  db: PoolClient,
  userId: string,
  purpose: LifecycleTokenPurpose,
) {
  return db.query(
    "UPDATE account_lifecycle_tokens SET consumed_at = now() WHERE user_id = $1 AND purpose = $2 AND consumed_at IS NULL",
    [userId, purpose],
  );
}
