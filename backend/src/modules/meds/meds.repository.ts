import type { PoolClient } from "pg";

export interface MedicationRow {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  price_cents: number;
  currency_code: string;
}

// medications is a public catalog table with no RLS (see 020_healthcare.sql)
// - unlike appointments, there's no per-caller row filtering to rely on here.
export function searchMedications(db: PoolClient, args: { search?: string; category?: string }) {
  const clauses: string[] = [];
  const params: unknown[] = [];

  if (args.search) {
    // Matches idx_medications_search in 020_healthcare.sql - a plain ILIKE
    // here would silently skip that index and full-scan the table.
    params.push(args.search);
    clauses.push(`to_tsvector('english', name || ' ' || COALESCE(category, '')) @@ plainto_tsquery('english', $${params.length})`);
  }
  if (args.category) {
    params.push(args.category);
    clauses.push(`category = $${params.length}`);
  }

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  return db
    .query<MedicationRow>(`SELECT * FROM medications ${where} ORDER BY name ASC LIMIT 100`, params)
    .then((r) => r.rows);
}

export interface PrescriptionRow {
  id: string;
  patient_id: string;
  professional_id: string;
  appointment_id: string | null;
  medication_id: string | null;
  dosage: string | null;
  instructions: string | null;
  status: string;
  reminder_schedule: unknown;
  created_at: string;
  updated_at: string;
}

export function insertPrescription(
  db: PoolClient,
  args: {
    patientId: string;
    professionalId: string;
    medicationId: string | null;
    dosage: string | null;
    instructions: string | null;
  },
) {
  return db
    .query<PrescriptionRow>(
      `INSERT INTO prescriptions (patient_id, professional_id, medication_id, dosage, instructions)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [args.patientId, args.professionalId, args.medicationId, args.dosage, args.instructions],
    )
    .then((r) => r.rows[0]);
}

// RLS-scoped like appointments/lab_orders repositories - no explicit caller
// filter needed, prescriptions_patient_read/prescriptions_treating_
// professional_read/prescriptions_author_write already restrict visible rows.
export function listPrescriptionsForPatient(db: PoolClient, patientId: string) {
  return db
    .query<PrescriptionRow>("SELECT * FROM prescriptions WHERE patient_id = $1 ORDER BY created_at DESC", [
      patientId,
    ])
    .then((r) => r.rows);
}

export function findPrescriptionById(db: PoolClient, id: string) {
  return db.query<PrescriptionRow>("SELECT * FROM prescriptions WHERE id = $1", [id]).then((r) => r.rows[0] ?? null);
}

// Only ever sets status - relies on prescriptions_patient_write in
// 900_rls.sql, which grants row-level UPDATE access to the whole row (RLS
// can't restrict individual columns); this column list is the actual
// enforcement that a patient can only request a refill, not rewrite dosage.
export function markPrescriptionRefillRequested(db: PoolClient, id: string) {
  return db
    .query<PrescriptionRow>(
      "UPDATE prescriptions SET status = 'refill_requested' WHERE id = $1 AND status = 'active' RETURNING *",
      [id],
    )
    .then((r) => r.rows[0] ?? null);
}

// Only ever sets reminder_schedule - same column-scoping note as above.
export function setPrescriptionReminder(db: PoolClient, id: string, reminderSchedule: unknown) {
  return db
    .query<PrescriptionRow>("UPDATE prescriptions SET reminder_schedule = $2 WHERE id = $1 RETURNING *", [
      id,
      JSON.stringify(reminderSchedule),
    ])
    .then((r) => r.rows[0] ?? null);
}
