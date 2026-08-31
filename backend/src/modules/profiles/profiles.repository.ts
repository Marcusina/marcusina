import type { PoolClient } from "pg";

export interface ProfileRow {
  user_id: string;
  first_name: string;
  last_name: string;
  bio: string | null;
  gender: string | null;
  date_of_birth: string | null;
  preferred_language: string;
  timezone: string;
  location_address: string | null;
  location_country: string | null;
  location_state: string | null;
  location_city: string | null;
  postal_code: string | null;
  updated_at: string;
}

export interface GeneralProfileFields {
  firstName: string;
  lastName: string;
  bio: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  preferredLanguage: string;
  timezone: string;
  locationAddress: string | null;
  locationCountry: string | null;
  locationState: string | null;
  locationCity: string | null;
  postalCode: string | null;
}

// profiles has no RLS (general info, not clinical) - callers filter by
// user_id explicitly.
export function findGeneralProfile(db: PoolClient, userId: string) {
  return db.query<ProfileRow>("SELECT * FROM profiles WHERE user_id = $1", [userId]).then((r) => r.rows[0] ?? null);
}

export function upsertGeneralProfile(db: PoolClient, userId: string, f: GeneralProfileFields) {
  return db
    .query<ProfileRow>(
      `INSERT INTO profiles (
         user_id, first_name, last_name, bio, gender, date_of_birth,
         preferred_language, timezone, location_address, location_country,
         location_state, location_city, postal_code
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       ON CONFLICT (user_id) DO UPDATE SET
         first_name = excluded.first_name,
         last_name = excluded.last_name,
         bio = excluded.bio,
         gender = excluded.gender,
         date_of_birth = excluded.date_of_birth,
         preferred_language = excluded.preferred_language,
         timezone = excluded.timezone,
         location_address = excluded.location_address,
         location_country = excluded.location_country,
         location_state = excluded.location_state,
         location_city = excluded.location_city,
         postal_code = excluded.postal_code
       RETURNING *`,
      [
        userId,
        f.firstName,
        f.lastName,
        f.bio,
        f.gender,
        f.dateOfBirth,
        f.preferredLanguage,
        f.timezone,
        f.locationAddress,
        f.locationCountry,
        f.locationState,
        f.locationCity,
        f.postalCode,
      ],
    )
    .then((r) => r.rows[0]);
}

export interface PatientProfileRow {
  id: string;
  user_id: string;
  blood_group: string | null;
  height_cm: string | null;
  weight_kg: string | null;
  known_allergies: string[] | null;
  chronic_conditions: string[] | null;
  updated_at: string;
}

export interface PatientProfileFields {
  bloodGroup: string | null;
  heightCm: number | null;
  weightKg: number | null;
  knownAllergies: string[] | null;
  chronicConditions: string[] | null;
}

// patient_profiles IS RLS-protected (patient_profiles_self_write in
// 900_rls.sql) - both the INSERT and the ON CONFLICT DO UPDATE arm of this
// upsert are subject to that policy, which requires user_id = caller for
// both, so this can never write a different patient's row even if the
// caller argument were wrong.
export function findPatientProfile(db: PoolClient, userId: string) {
  return db
    .query<PatientProfileRow>("SELECT * FROM patient_profiles WHERE user_id = $1", [userId])
    .then((r) => r.rows[0] ?? null);
}

export function upsertPatientProfile(db: PoolClient, userId: string, f: PatientProfileFields) {
  return db
    .query<PatientProfileRow>(
      `INSERT INTO patient_profiles (user_id, blood_group, height_cm, weight_kg, known_allergies, chronic_conditions)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_id) DO UPDATE SET
         blood_group = excluded.blood_group,
         height_cm = excluded.height_cm,
         weight_kg = excluded.weight_kg,
         known_allergies = excluded.known_allergies,
         chronic_conditions = excluded.chronic_conditions
       RETURNING *`,
      [userId, f.bloodGroup, f.heightCm, f.weightKg, f.knownAllergies, f.chronicConditions],
    )
    .then((r) => r.rows[0]);
}
