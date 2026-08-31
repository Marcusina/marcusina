import type { PoolClient } from "pg";

export interface UserRow {
  id: string;
  email: string | null;
  phone_number: string | null;
  password_hash: string | null;
  google_id: string | null;
  medgram_id: string;
  account_status: string;
  email_verified_at: string | null;
  phone_verified_at: string | null;
  active_currency_code: string;
}

export function findUserByEmail(db: PoolClient, email: string) {
  return db.query<UserRow>("SELECT * FROM users WHERE email = $1", [email]).then((r) => r.rows[0] ?? null);
}

export function findUserById(db: PoolClient, id: string) {
  return db.query<UserRow>("SELECT * FROM users WHERE id = $1", [id]).then((r) => r.rows[0] ?? null);
}

export function insertUser(
  db: PoolClient,
  args: { email: string; passwordHash: string; medgramId: string },
) {
  return db
    .query<UserRow>(
      `INSERT INTO users (email, password_hash, medgram_id, account_status)
       VALUES ($1, $2, $3, 'pending_verification')
       RETURNING *`,
      [args.email, args.passwordHash, args.medgramId],
    )
    .then((r) => r.rows[0]);
}

// Only flips account_status out of pending_verification, never overwrites a
// suspended/deactivated/reactivation_pending status - a stale verification
// code being consumed after e.g. a suspension shouldn't silently reactivate
// the account.
export function markEmailVerified(db: PoolClient, userId: string) {
  return db.query(
    `UPDATE users
     SET email_verified_at = now(),
         account_status = CASE WHEN account_status = 'pending_verification' THEN 'active' ELSE account_status END
     WHERE id = $1`,
    [userId],
  );
}

export function updateUserPassword(db: PoolClient, userId: string, passwordHash: string) {
  return db.query("UPDATE users SET password_hash = $1 WHERE id = $2", [passwordHash, userId]);
}

export function setAccountStatus(db: PoolClient, userId: string, status: "active" | "deactivated" | "suspended") {
  return db.query("UPDATE users SET account_status = $1 WHERE id = $2", [status, userId]);
}

export function setPhoneNumber(db: PoolClient, userId: string, phoneNumber: string) {
  return db.query("UPDATE users SET phone_number = $1, phone_verified_at = NULL WHERE id = $2", [
    phoneNumber,
    userId,
  ]);
}

export function markPhoneVerified(db: PoolClient, userId: string) {
  return db.query("UPDATE users SET phone_verified_at = now() WHERE id = $1", [userId]);
}

export function setActiveCurrency(db: PoolClient, userId: string, currencyCode: string) {
  return db.query("UPDATE users SET active_currency_code = $1 WHERE id = $2", [currencyCode, userId]);
}

export interface CurrencyHistoryRow {
  id: string;
  user_id: string;
  currency_code: string;
  changed_at: string;
}

export function insertCurrencyHistory(db: PoolClient, userId: string, currencyCode: string) {
  return db.query("INSERT INTO currency_history (user_id, currency_code) VALUES ($1, $2)", [userId, currencyCode]);
}

export function listCurrencyHistory(db: PoolClient, userId: string) {
  return db
    .query<CurrencyHistoryRow>("SELECT * FROM currency_history WHERE user_id = $1 ORDER BY changed_at DESC", [
      userId,
    ])
    .then((r) => r.rows);
}

export interface OrganizationRow {
  id: string;
  name: string;
  org_type: string;
  created_at: string;
}

export function listOrganizations(db: PoolClient, limit: number) {
  return db
    .query<OrganizationRow>("SELECT * FROM organizations ORDER BY name ASC LIMIT $1", [limit])
    .then((r) => r.rows);
}

export function insertUserRole(
  db: PoolClient,
  args: { userId: string; roleType: "patient" | "professional" | "admin"; organizationId: string | null },
) {
  return db.query(
    "INSERT INTO user_roles (user_id, role_type, organization_id) VALUES ($1, $2, $3)",
    [args.userId, args.roleType, args.organizationId],
  );
}

