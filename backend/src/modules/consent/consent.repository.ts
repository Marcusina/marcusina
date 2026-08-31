import type { PoolClient } from "pg";

export interface ConsentRow {
  id: string;
  granting_user_id: string;
  grantee_user_id: string | null;
  resource_type: string;
  resource_id: string;
  status: string;
  granted_at: string;
  revoked_at: string | null;
}

export function listConsentsGrantedBy(db: PoolClient, userId: string) {
  return db
    .query<ConsentRow>("SELECT * FROM consents WHERE granting_user_id = $1 ORDER BY granted_at DESC", [userId])
    .then((r) => r.rows);
}

// consents_owner_write's WITH CHECK (900_rls.sql) already enforces
// granting_user_id = caller at the database layer - grantingUserId here
// must always come from req.user.id, never from request input.
export function insertConsent(
  db: PoolClient,
  args: { grantingUserId: string; granteeUserId: string | null; resourceType: string; resourceId: string },
) {
  return db
    .query<ConsentRow>(
      `INSERT INTO consents (granting_user_id, grantee_user_id, resource_type, resource_id)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [args.grantingUserId, args.granteeUserId, args.resourceType, args.resourceId],
    )
    .then((r) => r.rows[0]);
}

export function revokeConsentById(db: PoolClient, id: string) {
  return db
    .query<ConsentRow>(
      "UPDATE consents SET status = 'revoked', revoked_at = now() WHERE id = $1 AND status = 'active' RETURNING *",
      [id],
    )
    .then((r) => r.rows[0] ?? null);
}
