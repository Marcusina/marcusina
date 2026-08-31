import type { PoolClient } from "pg";
import { generateMedGramId } from "../../lib/medgramId";
import { hashPassword, verifyPassword } from "../../lib/password";
import { isUniqueViolation } from "../../lib/pgErrors";
import {
  findUserByEmail,
  findUserById,
  insertUser,
  insertUserRole,
  updateUserPassword,
  type UserRow,
} from "./auth.repository";
import { issueEmailVerificationCode, type IssuedEmailVerification } from "./emailVerification.service";
import { issueDeviceVerificationCode } from "./deviceVerification.service";
import { isDeviceTrusted } from "./trustedDevices.repository";
import { revokeAllSessions } from "./session.service";

export class EmailAlreadyRegisteredError extends Error {
  constructor() {
    super("An account with this email already exists");
  }
}

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
  }
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super("Verify your email before logging in");
  }
}

export class DeviceVerificationRequiredError extends Error {
  constructor(public verificationCode: string) {
    super("This device isn't recognized - verify with the code sent to your email");
  }
}

export class IncorrectCurrentPasswordError extends Error {
  constructor() {
    super("Current password is incorrect");
  }
}

const NON_LOGINABLE_STATUSES = new Set(["deactivated", "suspended", "reactivation_pending"]);

export class AccountNotActiveError extends Error {
  constructor(public accountStatus: string) {
    super(`This account is ${accountStatus.replace(/_/g, " ")} and cannot log in`);
  }
}

// Shared with googleAuth.service.ts's loginOrRegisterWithGoogle - a
// deactivated/suspended account must not be logged into by ANY method, not
// just password login.
export function assertAccountIsLoginable(accountStatus: string): void {
  if (NON_LOGINABLE_STATUSES.has(accountStatus)) {
    throw new AccountNotActiveError(accountStatus);
  }
}

// medgram_id collisions are astronomically unlikely (33^8 keyspace) but the
// column is UNIQUE, so handle it rather than assume it away. Shared between
// the password-registration path here and googleAuth.service.ts's
// account-creation path - both need "insert a user row, retry with a fresh
// medgram_id if (and only if) that's what collided."
export async function insertUserWithUniqueMedGramId<T>(insert: (medgramId: string) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return await insert(generateMedGramId());
    } catch (err) {
      if (isUniqueViolation(err, "users_medgram_id_key")) continue;
      throw err;
    }
  }
  throw new Error("Failed to generate a unique MedGram ID after 3 attempts");
}

export async function registerUser(
  db: PoolClient,
  args: { email: string; password: string },
): Promise<{ user: UserRow; verification: IssuedEmailVerification }> {
  const passwordHash = await hashPassword(args.password);

  let user: UserRow;
  try {
    user = await insertUserWithUniqueMedGramId((medgramId) =>
      insertUser(db, { email: args.email, passwordHash, medgramId }),
    );
  } catch (err) {
    if (isUniqueViolation(err, "users_email_key")) throw new EmailAlreadyRegisteredError();
    throw err;
  }

  // Issued in the same request-scoped transaction as the INSERT (see
  // requestScopedDb) - if code generation ever failed, the user row rolls
  // back with it rather than leaving an account with no way to verify.
  const verification = await issueEmailVerificationCode(db, user.id);
  return { user, verification };
}

/**
 * registerDoctor in auth.api.js takes an opaque doctorData payload; the
 * real product (per frontend.md's ONB-16) collects license/certificate
 * uploads and a full verification application, none of which has a schema
 * home here - that's a materially bigger feature than "add the missing
 * stub." This narrows to what the current schema actually supports: the
 * same account-creation path as registerUser, tagged with a 'professional'
 * user_roles row (unverified/pending in the product sense, but there's no
 * professional-verification-status column to reflect that distinctly yet).
 */
export async function registerProfessional(
  db: PoolClient,
  args: { email: string; password: string },
): Promise<{ user: UserRow; verification: IssuedEmailVerification }> {
  const { user, verification } = await registerUser(db, args);
  await insertUserRole(db, { userId: user.id, roleType: "professional", organizationId: null });
  return { user, verification };
}

/**
 * Verifies credentials, email-verification status, and device trust, and
 * returns the user - it does NOT issue tokens itself. Token issuance
 * (access + refresh) needs a Response to set the refresh cookie on, so
 * that's the route's job via session.service.ts's issueNewSession. Keeping
 * this function DB-only makes it identical in shape to confirmDeviceOtp,
 * which the route composes with the same session-issuing step.
 */
export async function loginUser(
  db: PoolClient,
  args: { email: string; password: string; deviceFingerprintHash: string },
): Promise<UserRow> {
  const user = await findUserByEmail(db, args.email);
  if (!user || !user.password_hash) throw new InvalidCredentialsError();

  const valid = await verifyPassword(args.password, user.password_hash);
  if (!valid) throw new InvalidCredentialsError();

  // Checked right after the password, before anything else: a deactivated
  // or suspended account must not be able to log in regardless of email-
  // verification or device-trust state. pending_verification is
  // deliberately NOT in this set - that case is already caught by the
  // email_verified_at check below with a more specific, actionable error.
  assertAccountIsLoginable(user.account_status);

  // Checked after the password, not before: a wrong password always looks
  // like INVALID_CREDENTIALS, never leaking whether the account is
  // unverified to someone who doesn't already know the password.
  if (!user.email_verified_at) throw new EmailNotVerifiedError();

  // Same ordering logic for device trust: only reached once credentials and
  // email verification already passed, so an attacker with a stolen
  // password still can't tell "wrong password" from "right password, new
  // device" from the response alone.
  const trusted = await isDeviceTrusted(db, user.id, args.deviceFingerprintHash);
  if (!trusted) {
    const code = await issueDeviceVerificationCode(db, user.id, args.deviceFingerprintHash);
    throw new DeviceVerificationRequiredError(code);
  }

  return user;
}

/**
 * Revokes every session on success, including the one making this request -
 * not a deliberate "log out everywhere except here" choice, but a
 * consequence of the refresh cookie being scoped to path /auth/refresh (see
 * session.service.ts): this route never receives it, so there's no way to
 * identify "the current session" to spare it. The caller will need to log
 * in again with the new password, same as after a forgot-password reset.
 */
export async function changePassword(
  db: PoolClient,
  userId: string,
  args: { oldPassword: string; newPassword: string },
): Promise<void> {
  const user = await findUserById(db, userId);
  if (!user || !user.password_hash) throw new IncorrectCurrentPasswordError();

  const valid = await verifyPassword(args.oldPassword, user.password_hash);
  if (!valid) throw new IncorrectCurrentPasswordError();

  const newHash = await hashPassword(args.newPassword);
  await updateUserPassword(db, userId, newHash);
  await revokeAllSessions(db, userId);
}
