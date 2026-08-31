import type { PoolClient } from "pg";
import {
  findGeneralProfile,
  findPatientProfile,
  upsertGeneralProfile as upsertGeneralProfileRepo,
  upsertPatientProfile as upsertPatientProfileRepo,
  type GeneralProfileFields,
  type PatientProfileFields,
} from "./profiles.repository";

export class ProfileNotFoundError extends Error {
  constructor() {
    super("Profile not found");
  }
}

export class UnsupportedRoleError extends Error {
  constructor(role: string) {
    super(`Unsupported role: ${role}`);
  }
}

// Matches getRoleSpecificProfile's own normalization in auth.api.js exactly:
// role.toLowerCase().replace(/[^a-z]/g, "").
export function normalizeRole(role: string): string {
  return role.toLowerCase().replace(/[^a-z]/g, "");
}

export async function getGeneralProfile(db: PoolClient, userId: string) {
  const profile = await findGeneralProfile(db, userId);
  if (!profile) throw new ProfileNotFoundError();
  return profile;
}

export function upsertGeneralProfile(db: PoolClient, userId: string, fields: GeneralProfileFields) {
  return upsertGeneralProfileRepo(db, userId, fields);
}

export async function getPatientProfile(db: PoolClient, userId: string) {
  const profile = await findPatientProfile(db, userId);
  if (!profile) throw new ProfileNotFoundError();
  return profile;
}

export function upsertPatientProfile(db: PoolClient, userId: string, fields: PatientProfileFields) {
  return upsertPatientProfileRepo(db, userId, fields);
}

/**
 * 'patient' has a dedicated clinical table (patient_profiles).
 * 'professional' and 'admin' don't - there's no professional_profiles/
 * admin_profiles table in this schema, so both fall back to the same
 * generic profiles table patient's non-clinical info also lives in. This is
 * a bounded interpretation given what the schema actually supports, not a
 * claim that professionals and admins have no distinct data model needs in
 * the real product.
 */
export async function getRoleSpecificProfile(db: PoolClient, role: string, userId: string) {
  const normalized = normalizeRole(role);
  if (normalized === "patient") return getPatientProfile(db, userId);
  if (normalized === "professional" || normalized === "admin") return getGeneralProfile(db, userId);
  throw new UnsupportedRoleError(role);
}
