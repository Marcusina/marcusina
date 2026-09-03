import rateLimit from "express-rate-limit";

/**
 * Password-guessing surfaces (login, change-password) have no DB-level
 * attempt counter the way every OTP flow does (email/device/phone/sudo -
 * see backend/db/schema/021_verification_extensions.sql's comment on
 * bringing sudo_requests "up to the same lockout bar"). bcrypt's cost factor
 * alone isn't a throttle, so this closes that gap with a per-IP limit.
 *
 * Keyed on IP, not email, so a single attacker can't just round-robin
 * accounts to dodge the limit, and one slow/shared IP (e.g. NAT'd office
 * wifi) can't be locked out by someone else's mistyped password forever -
 * 15 attempts in 15 minutes is generous for a real user, punishing for a
 * brute-force loop.
 */
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: { code: "TOO_MANY_ATTEMPTS", message: "Too many login attempts. Try again later." } },
});
