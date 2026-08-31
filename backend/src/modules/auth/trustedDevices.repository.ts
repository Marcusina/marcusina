import type { PoolClient } from "pg";

export function isDeviceTrusted(db: PoolClient, userId: string, fingerprintHash: string): Promise<boolean> {
  return db
    .query("SELECT 1 FROM trusted_devices WHERE user_id = $1 AND fingerprint_hash = $2", [userId, fingerprintHash])
    .then((r) => (r.rowCount ?? 0) > 0);
}

export function trustDevice(db: PoolClient, userId: string, fingerprintHash: string) {
  return db.query(
    `INSERT INTO trusted_devices (user_id, fingerprint_hash)
     VALUES ($1, $2)
     ON CONFLICT (user_id, fingerprint_hash) DO UPDATE SET last_seen_at = now()`,
    [userId, fingerprintHash],
  );
}
