import type { PoolClient } from "pg";
import { generateOtp, hashOtp, verifyOtp } from "../../lib/otp";
import {
  findActiveSudoRequest,
  findMostRecentVerifiedSudo,
  incrementSudoAttempts,
  insertSudoRequest,
  markSudoRequestVerified,
} from "./sudo.repository";

const OTP_TTL_MINUTES = 10;
const MAX_ATTEMPTS = 5;
// How long a verified step-up grant remains usable before the caller has to
// re-verify - a "you're sudo-authenticated for the next 15 minutes" window,
// same shape as sudo in most security-sensitive apps.
const SUDO_GRANT_TTL_MINUTES = 15;

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

export class NoPendingSudoRequestError extends Error {
  constructor() {
    super("No pending step-up request - request one first");
  }
}

export async function requestSudo(db: PoolClient, userId: string, actionName: string): Promise<string> {
  const otp = generateOtp();
  const otpHash = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000).toISOString();
  await insertSudoRequest(db, { userId, actionName, otpHash, expiresAt });
  return otp;
}

export async function verifySudo(db: PoolClient, userId: string, otp: string): Promise<void> {
  const request = await findActiveSudoRequest(db, userId);
  if (!request) throw new NoPendingSudoRequestError();
  if (new Date(request.expires_at).getTime() < Date.now()) throw new InvalidOtpError();
  if (request.attempts >= MAX_ATTEMPTS) throw new TooManyAttemptsError();

  const valid = await verifyOtp(otp, request.otp_hash);
  if (!valid) {
    await incrementSudoAttempts(db, request.id);
    throw new InvalidOtpError();
  }

  await markSudoRequestVerified(db, request.id);
}

export async function getSudoStatus(
  db: PoolClient,
  userId: string,
): Promise<{ active: boolean; expires_at: string | null }> {
  const verified = await findMostRecentVerifiedSudo(db, userId);
  if (!verified?.verified_at) return { active: false, expires_at: null };

  const grantExpiresAt = new Date(new Date(verified.verified_at).getTime() + SUDO_GRANT_TTL_MINUTES * 60_000);
  const active = grantExpiresAt.getTime() > Date.now();
  return { active, expires_at: active ? grantExpiresAt.toISOString() : null };
}
