import type { PoolClient } from "pg";

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  family_id: string;
  expires_at: string;
  revoked_at: string | null;
  created_at: string;
}

export function insertRefreshToken(
  db: PoolClient,
  args: { userId: string; tokenHash: string; familyId: string; expiresAt: string },
) {
  return db
    .query<RefreshTokenRow>(
      `INSERT INTO refresh_tokens (user_id, token_hash, family_id, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [args.userId, args.tokenHash, args.familyId, args.expiresAt],
    )
    .then((r) => r.rows[0]);
}

export function findRefreshTokenByHash(db: PoolClient, tokenHash: string) {
  return db
    .query<RefreshTokenRow>("SELECT * FROM refresh_tokens WHERE token_hash = $1", [tokenHash])
    .then((r) => r.rows[0] ?? null);
}

export function revokeRefreshToken(db: PoolClient, id: string) {
  return db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE id = $1 AND revoked_at IS NULL", [id]);
}

// Called on reuse detection: every still-active token descended from this
// chain is revoked, not just the one that was replayed.
export function revokeFamily(db: PoolClient, familyId: string) {
  return db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = $1 AND revoked_at IS NULL", [
    familyId,
  ]);
}

// Every family, not just one - used by password reset to sign a user out of
// every device, not just one session chain.
export function revokeAllForUser(db: PoolClient, userId: string) {
  return db.query("UPDATE refresh_tokens SET revoked_at = now() WHERE user_id = $1 AND revoked_at IS NULL", [userId]);
}
