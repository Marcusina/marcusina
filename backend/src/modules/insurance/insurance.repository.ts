import type { PoolClient } from "pg";

export interface InsurancePlanRow {
  id: string;
  patient_profile_id: string;
  provider_name: string;
  policy_number: string;
  coverage_details: unknown;
  status: string;
  created_at: string;
}

// RLS-scoped via insurance_owner in 900_rls.sql - a caller who isn't the
// owning patient simply gets an empty array back, not an error. That
// matches insurance.api.js's getMyInsurance, which already treats a 403 as
// "no records" on the frontend side; returning [] here is the same outcome
// without needing that translation at all.
export function listInsuranceForPatientProfile(db: PoolClient, patientProfileId: string) {
  return db
    .query<InsurancePlanRow>(
      "SELECT * FROM insurance_plans WHERE patient_profile_id = $1 ORDER BY created_at DESC",
      [patientProfileId],
    )
    .then((r) => r.rows);
}
