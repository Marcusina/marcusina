import type { PoolClient } from "pg";

export interface SudoRequestRow {
  id: string;
  user_id: string;
  action_name: string;
  otp_hash: string;
  verified_at: string | null;
  expires_at: string;
  attempts: number;
  created_at: string;
}

export function insertSudoRequest(
  db: PoolClient,
  args: { userId: string; actionName: string; otpHash: string; expiresAt: string },
) {
  return db
    .query<SudoRequestRow>(
      "INSERT INTO sudo_requests (user_id, action_name, otp_hash, expires_at) VALUES ($1, $2, $3, $4) RETURNING *",
      [args.userId, args.actionName, args.otpHash, args.expiresAt],
    )
    .then((r) => r.rows[0]);
}

// Matches idx_sudo_requests_user_active in 010_identity.sql.
export function findActiveSudoRequest(db: PoolClient, userId: string) {
  return db
    .query<SudoRequestRow>(
      "SELECT * FROM sudo_requests WHERE user_id = $1 AND verified_at IS NULL ORDER BY created_at DESC LIMIT 1",
      [userId],
    )
    .then((r) => r.rows[0] ?? null);
}

export function markSudoRequestVerified(db: PoolClient, id: string) {
  return db.query("UPDATE sudo_requests SET verified_at = now() WHERE id = $1", [id]);
}

export function incrementSudoAttempts(db: PoolClient, id: string) {
  return db.query("UPDATE sudo_requests SET attempts = attempts + 1 WHERE id = $1", [id]);
}

export function findMostRecentVerifiedSudo(db: PoolClient, userId: string) {
  return db
    .query<SudoRequestRow>(
      "SELECT * FROM sudo_requests WHERE user_id = $1 AND verified_at IS NOT NULL ORDER BY verified_at DESC LIMIT 1",
      [userId],
    )
    .then((r) => r.rows[0] ?? null);
}
