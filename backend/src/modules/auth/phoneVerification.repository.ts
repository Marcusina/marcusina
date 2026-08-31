import type { PoolClient } from "pg";

export interface PhoneVerificationCodeRow {
  id: string;
  user_id: string;
  code_hash: string;
  expires_at: string;
  consumed_at: string | null;
  attempts: number;
  created_at: string;
}

export function insertPhoneVerificationCode(
  db: PoolClient,
  args: { userId: string; codeHash: string; expiresAt: string },
) {
  return db
    .query<PhoneVerificationCodeRow>(
      `INSERT INTO phone_verification_codes (user_id, code_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [args.userId, args.codeHash, args.expiresAt],
    )
    .then((r) => r.rows[0]);
}

export function findActivePhoneCodeForUser(db: PoolClient, userId: string) {
  return db
    .query<PhoneVerificationCodeRow>(
      `SELECT * FROM phone_verification_codes
       WHERE user_id = $1 AND consumed_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    )
    .then((r) => r.rows[0] ?? null);
}

export function markPhoneCodeConsumed(db: PoolClient, id: string) {
  return db.query("UPDATE phone_verification_codes SET consumed_at = now() WHERE id = $1", [id]);
}

export function incrementPhoneCodeAttempts(db: PoolClient, id: string) {
  return db.query("UPDATE phone_verification_codes SET attempts = attempts + 1 WHERE id = $1", [id]);
}

export function invalidateActivePhoneCodes(db: PoolClient, userId: string) {
  return db.query(
    "UPDATE phone_verification_codes SET consumed_at = now() WHERE user_id = $1 AND consumed_at IS NULL",
    [userId],
  );
}
