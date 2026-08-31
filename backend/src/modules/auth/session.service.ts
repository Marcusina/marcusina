import { randomUUID } from "node:crypto";
import type { Request, Response } from "express";
import type { PoolClient } from "pg";
import { signAccessToken } from "../../lib/jwt";
import { generateOpaqueToken, hashOpaqueToken } from "../../lib/opaqueToken";
import {
  findRefreshTokenByHash,
  insertRefreshToken,
  revokeAllForUser,
  revokeFamily,
  revokeRefreshToken,
} from "./refreshToken.repository";

const REFRESH_TOKEN_TTL_DAYS = 30;
const REFRESH_COOKIE_NAME = "refresh_token";
// Scoped to the one path that ever reads this cookie, so it's never sent on
// unrelated requests - a modest exposure-reduction step, not a security
// boundary on its own (httpOnly + Secure are what actually protects it).
// Must match the route's REAL path including the /api/v1 mount prefix from
// app.ts, or the browser/RN client will never actually send the cookie back
// to it - a mismatch here fails silently (no error, the cookie is just
// absent from the request), not loudly.
const REFRESH_COOKIE_PATH = "/api/v1/auth/refresh";

export class InvalidRefreshTokenError extends Error {
  constructor() {
    super("Refresh token is invalid or expired");
  }
}

export class RefreshTokenReuseDetectedError extends Error {
  constructor() {
    super("This refresh token was already used - all sessions from it have been revoked");
  }
}

export function setRefreshCookie(res: Response, token: string): void {
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export function clearRefreshCookie(res: Response): void {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: REFRESH_COOKIE_PATH });
}

export function getRefreshCookie(req: Request): string | undefined {
  return (req.cookies as Record<string, string> | undefined)?.[REFRESH_COOKIE_NAME];
}

function refreshExpiry(): string {
  return new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000).toISOString();
}

/**
 * Starts a brand-new session (new family) - called on login and on
 * completing device verification. Returns both tokens; the caller is
 * responsible for setting the refresh cookie (this function only touches
 * the database, so it stays testable without a Response object).
 */
export async function issueNewSession(db: PoolClient, userId: string): Promise<{ accessToken: string; refreshToken: string }> {
  const refreshToken = generateOpaqueToken();
  await insertRefreshToken(db, {
    userId,
    tokenHash: hashOpaqueToken(refreshToken),
    familyId: randomUUID(),
    expiresAt: refreshExpiry(),
  });
  return { accessToken: signAccessToken(userId), refreshToken };
}

/**
 * Rotates a presented refresh token: revokes it and issues a new one in the
 * same family. Throws RefreshTokenReuseDetectedError (after revoking the
 * whole family) if the presented token was already revoked - see the
 * comment in 017_refresh_tokens.sql for why that's the correct response to
 * a replay, not just rejecting the one request.
 */
export async function rotateSession(
  db: PoolClient,
  presentedToken: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const row = await findRefreshTokenByHash(db, hashOpaqueToken(presentedToken));
  if (!row) throw new InvalidRefreshTokenError();

  if (row.revoked_at) {
    await revokeFamily(db, row.family_id);
    throw new RefreshTokenReuseDetectedError();
  }
  if (new Date(row.expires_at).getTime() < Date.now()) throw new InvalidRefreshTokenError();

  await revokeRefreshToken(db, row.id);

  const refreshToken = generateOpaqueToken();
  await insertRefreshToken(db, {
    userId: row.user_id,
    tokenHash: hashOpaqueToken(refreshToken),
    familyId: row.family_id,
    expiresAt: refreshExpiry(),
  });

  return { accessToken: signAccessToken(row.user_id), refreshToken };
}

/** Revokes a single session (logout). Not a family-wide revoke - logging out
 * of one device doesn't touch that user's other active sessions. */
export async function revokeSession(db: PoolClient, presentedToken: string): Promise<void> {
  const row = await findRefreshTokenByHash(db, hashOpaqueToken(presentedToken));
  if (row && !row.revoked_at) await revokeRefreshToken(db, row.id);
}

/**
 * Revokes every active session for a user, regardless of family - used by
 * password reset, which should sign the user out everywhere, not just
 * rotate the one session doing the resetting (there usually isn't one; a
 * password reset happens outside any authenticated session in the first
 * place).
 */
export function revokeAllSessions(db: PoolClient, userId: string) {
  return revokeAllForUser(db, userId);
}
