import type { PoolClient } from "pg";

export interface PatientRosterRow {
  id: string;
  medgram_id: string;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  most_recent_appointment: string;
}

// No explicit RLS-duplicating filter needed beyond WHERE a.professional_id =
// $1 - appointments' RLS already restricts visible rows to this caller's
// own appointments, this just picks the distinct patients out of them.
export function listMyPatients(db: PoolClient, professionalId: string) {
  return db
    .query<PatientRosterRow>(
      `SELECT DISTINCT ON (u.id) u.id, u.medgram_id, u.email, p.first_name, p.last_name,
              a.scheduled_start_time AS most_recent_appointment
       FROM appointments a
       JOIN users u ON u.id = a.patient_id
       LEFT JOIN profiles p ON p.user_id = u.id
       WHERE a.professional_id = $1
       ORDER BY u.id, a.scheduled_start_time DESC`,
      [professionalId],
    )
    .then((r) => r.rows);
}

/**
 * Mirrors the relationship condition baked into 900_rls.sql's
 * *_treating_professional_read policies EXACTLY (same status <> 'cancelled'
 * exclusion) - this is not itself the security boundary (RLS is), it's what
 * lets the route return a clear 403 instead of a confusing 200 with
 * mostly-empty data when the two would otherwise disagree.
 */
export function hasActiveRelationship(db: PoolClient, professionalId: string, patientId: string) {
  return db
    .query(
      `SELECT 1 FROM appointments
       WHERE professional_id = $1 AND patient_id = $2 AND status <> 'cancelled'
       LIMIT 1`,
      [professionalId, patientId],
    )
    .then((r) => (r.rowCount ?? 0) > 0);
}

export function getPatientProfileForChart(db: PoolClient, patientId: string) {
  return db
    .query(
      `SELECT p.first_name, p.last_name, p.date_of_birth, p.gender,
              pp.blood_group, pp.height_cm, pp.weight_kg, pp.known_allergies, pp.chronic_conditions
       FROM users u
       LEFT JOIN profiles p ON p.user_id = u.id
       LEFT JOIN patient_profiles pp ON pp.user_id = u.id
       WHERE u.id = $1`,
      [patientId],
    )
    .then((r) => r.rows[0] ?? null);
}

// These three deliberately have NO explicit professional_id/patient_id
// caller filter beyond patient_id = $1 - the point of the
// *_treating_professional_read RLS policies is that they already scope the
// result to whatever this caller is allowed to see (their own authored
// records, plus any OTHER treating professional's, per the chart-scope
// decision), without the repository needing to know which case applies.
export function getPatientPrescriptions(db: PoolClient, patientId: string) {
  return db
    .query("SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY created_at DESC", [patientId])
    .then((r) => r.rows);
}

export function getPatientLabOrders(db: PoolClient, patientId: string) {
  return db
    .query("SELECT * FROM lab_orders WHERE patient_id = $1 ORDER BY created_at DESC", [patientId])
    .then((r) => r.rows);
}

export function getPatientClinicalNotes(db: PoolClient, patientId: string) {
  return db
    .query("SELECT * FROM clinical_notes WHERE patient_id = $1 ORDER BY created_at DESC", [patientId])
    .then((r) => r.rows);
}

export function getAppointmentHistoryWithPatient(db: PoolClient, professionalId: string, patientId: string) {
  return db
    .query(
      "SELECT * FROM appointments WHERE professional_id = $1 AND patient_id = $2 ORDER BY scheduled_start_time DESC",
      [professionalId, patientId],
    )
    .then((r) => r.rows);
}

export function listNotesAuthoredBy(db: PoolClient, professionalId: string) {
  return db
    .query("SELECT * FROM clinical_notes WHERE professional_id = $1 ORDER BY created_at DESC", [professionalId])
    .then((r) => r.rows);
}

export function insertClinicalNote(
  db: PoolClient,
  args: { professionalId: string; patientId: string; appointmentId: string | null; content: string },
) {
  return db
    .query(
      `INSERT INTO clinical_notes (professional_id, patient_id, appointment_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [args.professionalId, args.patientId, args.appointmentId, args.content],
    )
    .then((r) => r.rows[0]);
}

export interface AnalyticsRow {
  total_patients: string;
  total_appointments: string;
  upcoming_appointments: string;
  notes_written: string;
}

// Real aggregates from data this backend actually has, not placeholder
// numbers - there's no dedicated analytics table/pipeline, so this computes
// straight from appointments/clinical_notes each call.
export function getAnalytics(db: PoolClient, professionalId: string) {
  return db
    .query<AnalyticsRow>(
      `SELECT
         (SELECT count(DISTINCT patient_id) FROM appointments WHERE professional_id = $1) AS total_patients,
         (SELECT count(*) FROM appointments WHERE professional_id = $1) AS total_appointments,
         (SELECT count(*) FROM appointments WHERE professional_id = $1 AND status = 'scheduled' AND scheduled_start_time > now()) AS upcoming_appointments,
         (SELECT count(*) FROM clinical_notes WHERE professional_id = $1) AS notes_written`,
      [professionalId],
    )
    .then((r) => r.rows[0]);
}
