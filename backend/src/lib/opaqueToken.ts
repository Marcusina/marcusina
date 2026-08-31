import { createHash, randomBytes } from "node:crypto";

/**
 * A high-entropy, single-use secret (256 bits) - used for refresh tokens and
 * password reset links, anywhere the token itself is the credential rather
 * than something a human types in. Unlike lib/otp.ts's 6-digit codes, there's
 * no attempts/lockout concern here: brute-forcing 2^256 possibilities isn't
 * a realistic attack, so a fast deterministic hash (not bcrypt) is correct
 * for the lookup-by-hash these are stored under.
 */
export function generateOpaqueToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashOpaqueToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
