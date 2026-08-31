import type { PoolClient } from "pg";
import { generateOtp, hashOtp, verifyOtp } from "../../lib/otp";
import { isUniqueViolation } from "../../lib/pgErrors";
import { findUserById, markPhoneVerified, setPhoneNumber } from "./auth.repository";
import {
  findActivePhoneCodeForUser,
  incrementPhoneCodeAttempts,
  insertPhoneVerificationCode,
  invalidateActivePhoneCodes,
  markPhoneCodeConsumed,
} from "./phoneVerification.repository";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

export class PhoneAlreadyInUseError extends Error {
  constructor() {
    super("This phone number is already associated with another account");
  }
}

export class NoPhoneOnFileError extends Error {
  constructor() {
    super("Add a phone number before requesting verification");
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

export async function addPhone(db: PoolClient, userId: string, phoneNumber: string): Promise<void> {
  try {
    await setPhoneNumber(db, userId, phoneNumber);
  } catch (err) {
    if (isUniqueViolation(err, "users_phone_number_key")) throw new PhoneAlreadyInUseError();
    throw err;
  }
}

export async function confirmPhoneOtp(db: PoolClient, userId: string, otp: string): Promise<void> {
  const code = await findActivePhoneCodeForUser(db, userId);
  if (!code) throw new InvalidOtpError();
  if (new Date(code.expires_at).getTime() < Date.now()) throw new InvalidOtpError();
  if (code.attempts >= MAX_ATTEMPTS) throw new TooManyAttemptsError();

  const valid = await verifyOtp(otp, code.code_hash);
  if (!valid) {
    await incrementPhoneCodeAttempts(db, code.id);
    throw new InvalidOtpError();
  }

  await markPhoneCodeConsumed(db, code.id);
  await markPhoneVerified(db, userId);
}

// The only phone-code issuance function - there's no separate frontend
// endpoint for "initial request" vs "resend" the way email verification
// has, so /sms/verify-phone always goes through this rate-limited path
// (harmless on a genuine first call, since there's no previous code to
// collide with the cooldown check).
export async function requestPhoneVerification(db: PoolClient, userId: string): Promise<string> {
  const user = await findUserById(db, userId);
  if (!user?.phone_number) throw new NoPhoneOnFileError();

  const previous = await findActivePhoneCodeForUser(db, userId);
  if (previous) {
    const elapsedSeconds = (Date.now() - new Date(previous.created_at).getTime()) / 1000;
    if (elapsedSeconds < RESEND_COOLDOWN_SECONDS) {
      throw new ResendTooSoonError(Math.ceil(RESEND_COOLDOWN_SECONDS - elapsedSeconds));
    }
  }

  await invalidateActivePhoneCodes(db, userId);
  const code = generateOtp();
  const codeHash = await hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();
  await insertPhoneVerificationCode(db, { userId, codeHash, expiresAt });
  return code;
}
