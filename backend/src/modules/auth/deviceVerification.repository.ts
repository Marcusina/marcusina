import type { PoolClient } from "pg";

export interface DeviceVerificationCodeRow {
  id: string;
  user_id: string;
  fingerprint_hash: string;
  code_hash: string;
  expires_at: string;
  consumed_at: string | null;
  attempts: number;
  created_at: string;
}

export function insertDeviceVerificationCode(
  db: PoolClient,
  args: { userId: string; fingerprintHash: string; codeHash: string; expiresAt: string },
) {
  return db
    .query<DeviceVerificationCodeRow>(
      `INSERT INTO device_verification_codes (user_id, fingerprint_hash, code_hash, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [args.userId, args.fingerprintHash, args.codeHash, args.expiresAt],
    )
    .then((r) => r.rows[0]);
}

// Matches idx_device_verification_codes_active in 016_device_verification.sql.
export function findActiveDeviceCodeForUser(db: PoolClient, userId: string) {
  return db
    .query<DeviceVerificationCodeRow>(
      `SELECT * FROM device_verification_codes
       WHERE user_id = $1 AND consumed_at IS NULL
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    )
    .then((r) => r.rows[0] ?? null);
}

export function markDeviceCodeConsumed(db: PoolClient, codeId: string) {
  return db.query("UPDATE device_verification_codes SET consumed_at = now() WHERE id = $1", [codeId]);
}

export function incrementDeviceCodeAttempts(db: PoolClient, codeId: string) {
  return db.query("UPDATE device_verification_codes SET attempts = attempts + 1 WHERE id = $1", [codeId]);
}

export function invalidateActiveDeviceCodes(db: PoolClient, userId: string) {
  return db.query(
    "UPDATE device_verification_codes SET consumed_at = now() WHERE user_id = $1 AND consumed_at IS NULL",
    [userId],
  );
}
