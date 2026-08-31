import type { PoolClient } from "pg";
import { generateOpaqueToken, hashOpaqueToken } from "../../lib/opaqueToken";
import { findUserById, setAccountStatus } from "./auth.repository";
import {
  findActiveAccountLifecycleToken,
  findAccountLifecycleTokenByHash,
  insertAccountLifecycleToken,
  invalidateActiveAccountLifecycleTokens,
  markAccountLifecycleTokenConsumed,
} from "./accountLifecycle.repository";
import { revokeAllSessions } from "./session.service";

const DEACTIVATE_TOKEN_TTL_HOURS = 24;
const REACTIVATE_TOKEN_TTL_DAYS = 30;
const REQUEST_COOLDOWN_SECONDS = 60;

export class InvalidLifecycleTokenError extends Error {
  constructor() {
    super("This link is invalid or has expired");
  }
}

export class AccountAlreadyDeactivatedError extends Error {
  constructor() {
    super("This account is already deactivated");
  }
}

/**
 * Unlike forgot-password, this is authenticated (userId comes from
 * req.user, not a submitted email) - there's no user-enumeration concern
 * for an endpoint that only ever acts on the caller's own account, so this
 * can return null (rate-limited, no-op) or throw directly rather than
 * needing forgot-password's "always respond identically" trick.
 */
export async function requestDeactivation(db: PoolClient, userId: string): Promise<string | null> {
  const user = await findUserById(db, userId);
  if (!user) throw new Error("Authenticated user not found");
  if (user.account_status === "deactivated") throw new AccountAlreadyDeactivatedError();

  const previous = await findActiveAccountLifecycleToken(db, userId, "deactivate");
  if (previous) {
    const elapsedSeconds = (Date.now() - new Date(previous.created_at).getTime()) / 1000;
    if (elapsedSeconds < REQUEST_COOLDOWN_SECONDS) return null;
  }

  await invalidateActiveAccountLifecycleTokens(db, userId, "deactivate");

  const token = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + DEACTIVATE_TOKEN_TTL_HOURS * 60 * 60 * 1000).toISOString();
  await insertAccountLifecycleToken(db, { userId, purpose: "deactivate", tokenHash: hashOpaqueToken(token), expiresAt });
  return token;
}

/**
 * On success: deactivates the account, revokes every session (a deactivated
 * account shouldn't keep any live token working), and immediately issues a
 * reactivation token - see 019_account_lifecycle.sql's comment on why that
 * has to happen here rather than behind a separate "request reactivation"
 * endpoint that doesn't exist in the frontend contract.
 */
export async function confirmDeactivation(
  db: PoolClient,
  token: string,
): Promise<{ userId: string; reactivationToken: string }> {
  const row = await findAccountLifecycleTokenByHash(db, hashOpaqueToken(token));
  if (!row || row.purpose !== "deactivate" || row.consumed_at || new Date(row.expires_at).getTime() < Date.now()) {
    throw new InvalidLifecycleTokenError();
  }

  await markAccountLifecycleTokenConsumed(db, row.id);
  await setAccountStatus(db, row.user_id, "deactivated");
  await revokeAllSessions(db, row.user_id);

  const reactivationToken = generateOpaqueToken();
  const expiresAt = new Date(Date.now() + REACTIVATE_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
  await insertAccountLifecycleToken(db, {
    userId: row.user_id,
    purpose: "reactivate",
    tokenHash: hashOpaqueToken(reactivationToken),
    expiresAt,
  });

  return { userId: row.user_id, reactivationToken };
}

/**
 * Reactivates the account and consumes the token - does NOT log the user
 * in. Sessions were already revoked at deactivation time and
 * reactivateAccount() in auth.api.js never receives a token/session back,
 * so the expected flow is: reactivate, then log in fresh.
 */
export async function confirmReactivation(db: PoolClient, token: string): Promise<void> {
  const row = await findAccountLifecycleTokenByHash(db, hashOpaqueToken(token));
  if (!row || row.purpose !== "reactivate" || row.consumed_at || new Date(row.expires_at).getTime() < Date.now()) {
    throw new InvalidLifecycleTokenError();
  }

  await markAccountLifecycleTokenConsumed(db, row.id);
  await setAccountStatus(db, row.user_id, "active");
}
