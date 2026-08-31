import { randomInt } from "node:crypto";
import bcrypt from "bcryptjs";

// Lower cost factor than password.ts's hashPassword: these are short-lived
// (10 min), rate-limited by attempts, and only 10^6 possible values, so
// bcrypt's slow-hash property matters far less than for a permanent
// password. Still hashed, never stored or logged in plaintext in the DB.
const OTP_SALT_ROUNDS = 8;

export function generateOtp(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, OTP_SALT_ROUNDS);
}

export function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}
