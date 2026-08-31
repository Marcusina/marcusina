import type { PoolClient } from "pg";
import type { GoogleProfile } from "../../lib/googleIdToken";
import { isUniqueViolation } from "../../lib/pgErrors";
import { findUserByEmail, findUserById, markEmailVerified, type UserRow } from "./auth.repository";
import { DeviceVerificationRequiredError, assertAccountIsLoginable, insertUserWithUniqueMedGramId } from "./auth.service";
import { issueDeviceVerificationCode } from "./deviceVerification.service";
import { findUserByGoogleId, insertGoogleUser, linkGoogleAccount } from "./googleAuth.repository";
import { isDeviceTrusted } from "./trustedDevices.repository";

export class GoogleEmailNotVerifiedError extends Error {
  constructor() {
    super("Google reports this email address as unverified");
  }
}

export class AccountLinkConflictError extends Error {
  constructor() {
    super("This email is already linked to a different Google account");
  }
}

/**
 * Takes an already-verified Google profile (see lib/googleIdToken.ts - the
 * signature/audience/issuer check happens before this is ever called) and
 * does the account-orchestration part: find-by-google-id, else
 * find-by-email-and-link, else create. Deliberately DB-only and dependent
 * only on a plain data object, not a real Google token, so this - the part
 * that's actually specific to this app - is testable without hitting
 * Google's servers.
 */
export async function loginOrRegisterWithGoogle(
  db: PoolClient,
  profile: GoogleProfile,
  deviceFingerprintHash: string,
): Promise<UserRow> {
  // Google's own token says this email isn't verified on Google's side -
  // don't treat it as proof of email ownership for linking/creating.
  if (!profile.emailVerified) throw new GoogleEmailNotVerifiedError();

  let user = await findUserByGoogleId(db, profile.googleId);

  if (!user) {
    const existingByEmail = await findUserByEmail(db, profile.email);

    if (existingByEmail) {
      if (existingByEmail.google_id && existingByEmail.google_id !== profile.googleId) {
        // Would mean this email is already linked to a DIFFERENT Google
        // account - don't silently overwrite an existing link.
        throw new AccountLinkConflictError();
      }
      await linkGoogleAccount(db, existingByEmail.id, profile.googleId);
      // A verified Google ID token is itself proof of email ownership - if
      // this account was still pending_verification (e.g. registered by
      // password and never completed the OTP flow), Google's proof
      // satisfies that the same way it does for a brand-new Google signup.
      if (!existingByEmail.email_verified_at) await markEmailVerified(db, existingByEmail.id);
      user = existingByEmail;
    } else {
      try {
        user = await insertUserWithUniqueMedGramId((medgramId) =>
          insertGoogleUser(db, { email: profile.email, googleId: profile.googleId, medgramId }),
        );
      } catch (err) {
        if (!isUniqueViolation(err, "users_email_key")) throw err;
        // Lost a race with a concurrent request that created this exact
        // email between the findUserByEmail check above and this insert -
        // link to what now exists instead of crashing.
        const nowExisting = await findUserByEmail(db, profile.email);
        if (!nowExisting) throw err;
        await linkGoogleAccount(db, nowExisting.id, profile.googleId);
        user = nowExisting;
      }
    }
  }

  // Same account-status and device-trust checks password login goes
  // through - Google sign-in must not be a way to bypass either, or it'd be
  // a strictly weaker login path than the password one. A brand-new Google
  // user is always 'active' so this is a no-op there; it matters for a
  // returning or newly-linked account that's since been deactivated.
  assertAccountIsLoginable(user.account_status);

  const trusted = await isDeviceTrusted(db, user.id, deviceFingerprintHash);
  if (!trusted) {
    const code = await issueDeviceVerificationCode(db, user.id, deviceFingerprintHash);
    throw new DeviceVerificationRequiredError(code);
  }

  // Re-fetch: the link/create paths above may hold a UserRow captured
  // before this function's own mutations (e.g. linkGoogleAccount doesn't
  // return the updated row) - the route needs accurate, current fields.
  return (await findUserById(db, user.id))!;
}
