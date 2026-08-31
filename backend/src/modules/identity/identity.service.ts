import type { PoolClient } from "pg";
import { findUserById, setAccountStatus } from "../auth/auth.repository";
import { revokeAllSessions } from "../auth/session.service";
import {
  type IdentityRequestType,
  insertIdentityRequest,
  insertIdentityVerification,
  listVerificationHistory,
} from "./identity.repository";

export class AccountAlreadySuspendedError extends Error {
  constructor() {
    super("This account is already suspended");
  }
}

export class AccountNotSuspendedError extends Error {
  constructor() {
    super("This account isn't suspended - nothing to reissue");
  }
}

/**
 * recover/replace-card/merge/device-transfer are inferred to be
 * authenticated self-service actions (user_id = req.user.id), not an
 * unauthenticated "I'm locked out" flow - identity_requests.user_id is
 * NOT NULL and there's no email-lookup path here, and a true cold-start
 * recovery flow is already covered by forgot-password/reset-password. None
 * of these four auto-complete: they land as a queued 'pending' row, exactly
 * as documented in identity.api.js and 010_identity.sql.
 */
export function queueIdentityRequest(
  db: PoolClient,
  userId: string,
  requestType: IdentityRequestType,
  payload: unknown,
) {
  return insertIdentityRequest(db, { userId, requestType, payload });
}

export async function suspendIdentity(db: PoolClient, userId: string) {
  const user = await findUserById(db, userId);
  if (!user) throw new Error("Authenticated user not found");
  if (user.account_status === "suspended") throw new AccountAlreadySuspendedError();

  await setAccountStatus(db, userId, "suspended");
  // A self-suspend (e.g. "I lost my phone, freeze my account now") should
  // kill every active session immediately, same as deactivation.
  await revokeAllSessions(db, userId);
}

/**
 * The un-suspend counterpart to suspendIdentity - not a physical-card
 * reissue (that's replaceIdentityCard, a separate queued request). Only
 * valid from 'suspended', matching a freeze/unfreeze pair rather than a
 * general-purpose status reset.
 */
export async function reissueIdentity(db: PoolClient, userId: string) {
  const user = await findUserById(db, userId);
  if (!user) throw new Error("Authenticated user not found");
  if (user.account_status !== "suspended") throw new AccountNotSuspendedError();

  await setAccountStatus(db, userId, "active");
}

// No real scannable MedGram ID/QR system exists yet (same situation as
// appointments' checkInAppointment) - this logs the attempt as a
// verification record rather than faking a pass/fail check against
// anything.
export function scanPatientId(db: PoolClient, userId: string, metadata: unknown) {
  return insertIdentityVerification(db, { userId, method: "id_scan", result: "success", metadata });
}

export function getVerificationHistory(db: PoolClient, userId: string) {
  return listVerificationHistory(db, userId);
}
