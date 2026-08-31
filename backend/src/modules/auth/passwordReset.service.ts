import type { PoolClient } from "pg";
import { generateOpaqueToken, hashOpaqueToken } from "../../lib/opaqueToken";
import { hashPassword } from "../../lib/password";
import { findUserByEmail, updateUserPassword } from "./auth.repository";
import {
  findActiveResetTokenForUser,
  findPasswordResetTokenByHash,
  insertPasswordResetToken,
  invalidateActiveResetTokens,
  markPasswordResetTokenConsumed,
} from "./passwordReset.repository";
import { revokeAllSessions } from "./session.service";

const RESET_TOKEN_TTL_MINUTES = 60;
const RESEND_COOLDOWN_SECONDS = 60;

export class InvalidResetTokenError extends Error {
  constructor() {
    super("This reset link is invalid or has expired");
  }
}

/**
 * Returns the plaintext token when one was actually issued, or null when
 * this call was a no-op (no account with that email, or a cooldown is still
 * active). The caller (the route) MUST respond identically either way -
 * OWASP's password-reset guidance is explicit that this endpoint must not
 * let an attacker distinguish "no such account" from "account exists" by
 * probing arbitrary emails. The null/non-null return exists only so
 * dev/testing can see a token was issued (via console log / a debug field),
 * never to drive a different HTTP response.
 */
export async function requestPasswordReset(db: PoolClient, email: string): Promise<string | null> {
  const user = await findUserByEmail(db, email);
  if (!user) return null;

  const previous = await findActiveResetTokenForUser(db, user.id);
  if (previous) {
    const elapsedSeconds = (Date.now() - new Date(previous.created_at).getTime()) / 1000;
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) return null;
  }

  // Only one live link at a time - an earlier still-unexpired link
  // shouldn't keep working once a newer one has been requested.
  await invalidateActiveResetTokens(db, user.id);

  const token = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MINUTES * 60_000).toISOString();
  await insertPasswordResetToken(db, { userId: user.id, tokenHash: hashOpaqueToken(token), expiresAt });
  return token;
}

/**
 * On success: sets the new password, consumes the token, invalidates any
 * other outstanding reset tokens for the account, and revokes every active
 * session (all refresh tokens, every device) - a password reset is a
 * reasonable signal the account may have been compromised or the password
 * was forgotten somewhere untrusted, so every other logged-in session
 * should require re-authentication with the new password.
 */
export async function resetPasswordWithToken(
  db: PoolClient,
  args: { token: string; newPassword: string },
): Promise<void> {
  const row = await findPasswordResetTokenByHash(db, hashOpaqueToken(args.token));
  if (!row || row.consumed_at || new Date(row.expires_at).getTime() < Date.now()) {
    throw new InvalidResetTokenError();
  }

  const passwordHash = await hashPassword(args.newPassword);
  await updateUserPassword(db, row.user_id, passwordHash);
  await markPasswordResetTokenConsumed(db, row.id);
  await invalidateActiveResetTokens(db, row.user_id);
  await revokeAllSessions(db, row.user_id);
}
