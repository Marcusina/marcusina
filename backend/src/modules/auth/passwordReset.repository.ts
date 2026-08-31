import type { PoolClient } from "pg";

export interface PasswordResetTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: string;
  consumed_at: string | null;
  created_at: string;
}

export function insertPasswordResetToken(
  db: PoolClient,
  args: { userId: string; tokenHash: string; expiresAt: string },
) {
  return db
    .query<PasswordResetTokenRow>(
      `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [args.userId, args.tokenHash, args.expiresAt],
    )
    .then((r) => r.rows[0]);
}

export function findPasswordResetTokenByHash(db: PoolClient, tokenHash: string) {
  return db
    .query<PasswordResetTokenRow>("SELECT * FROM password_reset_tokens WHERE token_hash = $1", [tokenHash])
    .then((r) => r.rows[0] ?? null);
}

// Matches idx_password_reset_tokens_active in 018_password_reset.sql - used
// for the forgot-password resend cooldown.
export function findActiveResetTokenForUser(db: PoolClient, userId: string) {
  return db
    .query<PasswordResetTokenRow>(
      `SELECT * FROM password_reset_tokens
       WHERE user_id = $1 AND consumed_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    )
    .then((r) => r.rows[0] ?? null);
}

export function markPasswordResetTokenConsumed(db: PoolClient, id: string) {
  return db.query("UPDATE password_reset_tokens SET consumed_at = now() WHERE id = $1", [id]);
}

// Called after a successful reset, so an older still-unexpired link can't
// also be used to reset the password again.
export function invalidateActiveResetTokens(db: PoolClient, userId: string) {
  return db.query(
    "UPDATE password_reset_tokens SET consumed_at = now() WHERE user_id = $1 AND consumed_at IS NULL",
    [userId],
  );
}
