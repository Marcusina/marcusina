import type { PoolClient } from "pg";
import { insertConsent, listConsentsGrantedBy, revokeConsentById } from "./consent.repository";

export class ForbiddenError extends Error {
  constructor() {
    super("You can only view your own consents");
  }
}

export class ConsentNotFoundError extends Error {
  constructor() {
    super("Consent not found or already revoked");
  }
}

// getMyConsents(userId) in consent.api.js takes a :userId path param rather
// than always meaning "the caller" - explicitly rejecting a mismatch here
// instead of silently scoping to req.user.id either way, so a caller can't
// probe someone else's id and get a confusingly-empty (rather than
// forbidden) response.
export function getMyConsents(db: PoolClient, callerId: string, requestedUserId: string) {
  if (callerId !== requestedUserId) throw new ForbiddenError();
  return listConsentsGrantedBy(db, callerId);
}

export function grantConsent(
  db: PoolClient,
  args: { grantingUserId: string; granteeUserId: string | null; resourceType: string; resourceId: string },
) {
  return insertConsent(db, args);
}

export async function revokeConsent(db: PoolClient, id: string) {
  const revoked = await revokeConsentById(db, id);
  if (!revoked) throw new ConsentNotFoundError();
  return revoked;
}
