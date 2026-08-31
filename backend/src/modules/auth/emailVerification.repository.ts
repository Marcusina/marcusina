import type { PoolClient } from "pg";

export interface EmailVerificationCodeRow {
  id: string;
  user_id: string;
  code_hash: string;
  link_token_hash: string | null;
  expires_at: string;
  consumed_at: string | null;
  attempts: number;
  created_at: string;
}

export function insertVerificationCode(
  db: PoolClient,
  args: { userId: string; codeHash: string; linkTokenHash: string; expiresAt: string },
) {
  return db
    .query<EmailVerificationCodeRow>(
      `INSERT INTO email_verification_codes (user_id, code_hash, link_token_hash, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [args.userId, args.codeHash, args.linkTokenHash, args.expiresAt],
    )
    .then((r) => r.rows[0]);
}

// Backs GET /verify-email?token=... (verifyEmail in auth.api.js) - a direct
// hash lookup with no user context, unlike findActiveCodeForUser. Safe only
// because link_token_hash is a high-entropy opaque token (see
// lib/opaqueToken.ts), not the low-entropy typed OTP.
export function findActiveCodeByLinkTokenHash(db: PoolClient, linkTokenHash: string) {
  return db
    .query<EmailVerificationCodeRow>(
      "SELECT * FROM email_verification_codes WHERE link_token_hash = $1 AND consumed_at IS NULL",
      [linkTokenHash],
    )
    .then((r) => r.rows[0] ?? null);
}

// Matches idx_email_verification_codes_active in 015_email_verification.sql.
export function findActiveCodeForUser(db: PoolClient, userId: string) {
  return db
    .query<EmailVerificationCodeRow>(
      `SELECT * FROM email_verification_codes
       WHERE user_id = $1 AND consumed_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    )
    .then((r) => r.rows[0] ?? null);
}

export function markCodeConsumed(db: PoolClient, codeId: string) {
  return db.query("UPDATE email_verification_codes SET consumed_at = now() WHERE id = $1", [codeId]);
}

export function incrementCodeAttempts(db: PoolClient, codeId: string) {
  return db.query("UPDATE email_verification_codes SET attempts = attempts + 1 WHERE id = $1", [codeId]);
}

// Called before issuing a fresh code on resend, so a stale code from a
// previous request can never be replayed after a newer one is sent.
export function invalidateActiveCodes(db: PoolClient, userId: string) {
  return db.query(
    "UPDATE email_verification_codes SET consumed_at = now() WHERE user_id = $1 AND consumed_at IS NULL",
    [userId],
  );
}
