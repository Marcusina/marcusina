import type { PoolClient } from "pg";
import { generateOtp, hashOtp, verifyOtp } from "../../lib/otp";
import { findUserByEmail, type UserRow } from "./auth.repository";
import { trustDevice } from "./trustedDevices.repository";
import {
  findActiveDeviceCodeForUser,
  incrementDeviceCodeAttempts,
  insertDeviceVerificationCode,
  invalidateActiveDeviceCodes,
  markDeviceCodeConsumed,
} from "./deviceVerification.repository";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export class UserNotFoundError extends Error {
  constructor() {
    super("No account with this email");
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
export class NoPendingVerificationError extends Error {
  constructor() {
    super("No device verification is pending for this account");
  }
}

export async function issueDeviceVerificationCode(
  db: PoolClient,
  userId: string,
  fingerprintHash: string,
): Promise<string> {
  const code = generateOtp();
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();
  await insertDeviceVerificationCode(db, { userId, fingerprintHash, codeHash, expiresAt });
  return code;
}

/**
 * Verifies the code, trusts the fingerprint that was pending on the matched
 * challenge (NOT necessarily the fingerprint of whatever request is calling
 * this - see the comment on device_verification_codes.fingerprint_hash),
 * and returns the now-verified user so the route can issue an access token
 * and complete the interrupted login.
 */
export async function confirmDeviceOtp(db: PoolClient, args: { email: string; otp: string }): Promise<UserRow> {
  const user = await findUserByEmail(db, args.email);
  if (!user) throw new UserNotFoundError();

  const code = await findActiveDeviceCodeForUser(db, user.id);
  if (!code) throw new NoPendingVerificationError();
  if (new Date(code.expires_at).getTime() < Date.now()) throw new InvalidOtpError();
  if (code.attempts >= MAX_ATTEMPTS) throw new TooManyAttemptsError();

  const valid = await verifyOtp(args.otp, code.code_hash);
  if (!valid) {
    await incrementDeviceCodeAttempts(db, code.id);
    throw new InvalidOtpError();
  }

  await markDeviceCodeConsumed(db, code.id);
  await trustDevice(db, user.id, code.fingerprint_hash);
  return user;
}

export async function resendDeviceVerificationCode(db: PoolClient, email: string): Promise<string> {
  const user = await findUserByEmail(db, email);
  if (!user) throw new UserNotFoundError();

  const previous = await findActiveDeviceCodeForUser(db, user.id);
  if (!previous) throw new NoPendingVerificationError();

  const elapsedSeconds = (Date.now() - new Date(previous.created_at).getTime()) / 1000;
  if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
    throw new ResendTooSoonError(Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds));
  }

  await invalidateActiveDeviceCodes(db, user.id);
  // Reuses the pending fingerprint from the original login attempt, not a
  // fingerprint derived from this resend request - resend may legitimately
  // come from a different device/tab than the one being verified.
  return issueDeviceVerificationCode(db, user.id, previous.fingerprint_hash);
}
