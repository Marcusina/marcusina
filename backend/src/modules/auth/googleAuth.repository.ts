import type { PoolClient } from "pg";
import type { UserRow } from "./auth.repository";

export function findUserByGoogleId(db: PoolClient, googleId: string) {
  return db.query<UserRow>("SELECT * FROM users WHERE google_id = $1", [googleId]).then((r) => r.rows[0] ?? null);
}

export function linkGoogleAccount(db: PoolClient, userId: string, googleId: string) {
  return db.query("UPDATE users SET google_id = $1 WHERE id = $2", [googleId, userId]);
}

// account_status 'active' and email_verified_at set immediately, unlike
// insertUser's password path (which starts 'pending_verification') - a
// verified Google ID token is already proof of email ownership, matching
// frontend.md ONB-06: "Email verification ... skipped if already verified
// via social sign-in."
export function insertGoogleUser(
  db: PoolClient,
  args: { email: string; googleId: string; medgramId: string },
) {
  return db
    .query<UserRow>(
      `INSERT INTO users (email, google_id, medgram_id, account_status, email_verified_at)
       VALUES ($1, $2, $3, 'active', now())
       RETURNING *`,
      [args.email, args.googleId, args.medgramId],
    )
    .then((r) => r.rows[0]);
}
