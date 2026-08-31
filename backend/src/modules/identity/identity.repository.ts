import type { PoolClient } from "pg";

export type IdentityRequestType = "recover" | "replace_card" | "merge" | "device_transfer";

export interface IdentityRequestRow {
  id: string;
  user_id: string;
  request_type: IdentityRequestType;
  status: string;
  payload: unknown;
  created_at: string;
}

export function insertIdentityRequest(
  db: PoolClient,
  args: { userId: string; requestType: IdentityRequestType; payload: unknown },
) {
  return db
    .query<IdentityRequestRow>(
      "INSERT INTO identity_requests (user_id, request_type, payload) VALUES ($1, $2, $3) RETURNING *",
      [args.userId, args.requestType, JSON.stringify(args.payload ?? {})],
    )
    .then((r) => r.rows[0]);
}

export interface IdentityVerificationRow {
  id: string;
  user_id: string;
  method: string;
  result: string;
  metadata: unknown;
  created_at: string;
}

export function insertIdentityVerification(
  db: PoolClient,
  args: { userId: string; method: string; result: string; metadata: unknown },
) {
  return db
    .query<IdentityVerificationRow>(
      "INSERT INTO identity_verifications (user_id, method, result, metadata) VALUES ($1, $2, $3, $4) RETURNING *",
      [args.userId, args.method, args.result, JSON.stringify(args.metadata ?? {})],
    )
    .then((r) => r.rows[0]);
}

// identity_verifications carries NO RLS (it's audit/security log data, not
// clinical PHI) - filtered by user_id explicitly here, same as
// cart/wishlist/notifications.
export function listVerificationHistory(db: PoolClient, userId: string) {
  return db
    .query<IdentityVerificationRow>(
      "SELECT * FROM identity_verifications WHERE user_id = $1 ORDER BY created_at DESC",
      [userId],
    )
    .then((r) => r.rows);
}
