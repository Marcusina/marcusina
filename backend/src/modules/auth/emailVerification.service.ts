import type { PoolClient } from "pg";
import { generateOtp, hashOtp, verifyOtp } from "../../lib/otp";
import { generateOpaqueToken, hashOpaqueToken } from "../../lib/opaqueToken";
import { findUserByEmail, markEmailVerified } from "./auth.repository";
import {
  findActiveCodeByLinkTokenHash,
  findActiveCodeForUser,
  incrementCodeAttempts,
  insertVerificationCode,
  invalidateActiveCodes,
  markCodeConsumed,
} from "./emailVerification.repository";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export class UserNotFoundError extends Error {
  constructor() {
    super("No account with this email");
  }
}
export class AlreadyVerifiedError extends Error {
  constructor() {
    super("Email is already verified");
  }
}
export class InvalidOtpError extends Error {
  constructor() {
    super("Incorrect or expired code");
  }
}
export class TooManyAttemptsError extends Error {
  constructor() {
    super("Too many incorrect attempts - request a new code");
  }
}
export class ResendTooSoonError extends Error {
  constructor(public retryAfterSeconds: number) {
    super("A code was already sent recently - try again shortly");
  }
}

export interface IssuedEmailVerification {
  otp: string;
  linkToken: string;
}

/**
 * Generates BOTH a typed OTP and a link token for the same pending row -
 * either one completes verification (see confirmEmailOtp vs
 * confirmEmailVerificationLink). Matches auth.api.js having two separate
 * verification entry points (verifyEmailOtp and verifyEmail) that must both
 * work against whatever was just issued. Returns the plaintext values so
 * the caller can hand them to a real delivery channel; neither is ever
 * persisted anywhere.
 */
export async function issueEmailVerificationCode(db: PoolClient, userId: string): Promise<IssuedEmailVerification> {
  const otp = generateOtp();
  const codeHash = await hashOtp(otp);
  const linkToken = generateOpaqueToken();
  const linkTokenHash = hashOpaqueToken(linkToken);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();
  await insertVerificationCode(db, { userId, codeHash, linkTokenHash, expiresAt });
  return { otp, linkToken };
}

export async function confirmEmailOtp(db: PoolClient, args: { email: string; otp: string }): Promise<void> {
  const user = await findUserByEmail(db, args.email);
  if (!user) throw new UserNotFoundError();
  if (user.email_verified_at) throw new AlreadyVerifiedError();

  const code = await findActiveCodeForUser(db, user.id);
  if (!code) throw new InvalidOtpError(); // no outstanding code - caller must resend
  if (new Date(code.expires_at).getTime() < Date.now()) throw new InvalidOtpError();
  if (code.attempts >= MAX_ATTEMPTS) throw new TooManyAttemptsError();

  const valid = await verifyOtp(args.otp, code.code_hash);
  if (!valid) {
    await incrementCodeAttempts(db, code.id);
    throw new InvalidOtpError();
  }

  await markCodeConsumed(db, code.id);
  await markEmailVerified(db, user.id);
}

/**
 * Invalidates any outstanding code and issues a fresh one, subject to a
 * cooldown against the *previous* code's issue time (checked before
 * invalidating it) so a resend spam-click can't bypass rate limiting by
 * racing the invalidate-then-reissue sequence.
 */
export async function resendEmailVerificationCode(db: PoolClient, email: string): Promise<IssuedEmailVerification> {
  const user = await findUserByEmail(db, email);
  if (!user) throw new UserNotFoundError();
  if (user.email_verified_at) throw new AlreadyVerifiedError();

  const previous = await findActiveCodeForUser(db, user.id);
  if (previous) {
    const elapsedSeconds = (Date.now() - new Date(previous.created_at).getTime()) / 1000;
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      throw new ResendTooSoonError(Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds));
    }
  }

  await invalidateActiveCodes(db, user.id);
  return issueEmailVerificationCode(db, user.id);
}

export async function getVerificationStatus(db: PoolClient, email: string): Promise<{ email_verified: boolean }> {
  const user = await findUserByEmail(db, email);
  if (!user) throw new UserNotFoundError();
  return { email_verified: Boolean(user.email_verified_at) };
}

/**
 * The link-click counterpart to confirmEmailOtp. No attempts/lockout check
 * here - a link token isn't something a human "guesses" in a UI the way an
 * OTP is, so there's no brute-force surface to rate-limit; a wrong or
 * expired token just fails outright.
 */
export async function confirmEmailVerificationLink(db: PoolClient, token: string): Promise<void> {
  const code = await findActiveCodeByLinkTokenHash(db, hashOpaqueToken(token));
  if (!code) throw new InvalidOtpError();
  if (new Date(code.expires_at).getTime() < Date.now()) throw new InvalidOtpError();

  await markCodeConsumed(db, code.id);
  await markEmailVerified(db, code.user_id);
}
