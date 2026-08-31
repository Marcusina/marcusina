import type { PoolClient } from "pg";

export interface AppointmentRow {
  id: string;
  organization_id: string | null;
  patient_id: string;
  professional_id: string;
  status: string;
  scheduled_start_time: string;
  scheduled_end_time: string;
  cancellation_reason: string | null;
  checkin_method: string | null;
  checkin_value: string | null;
  checked_in_at: string | null;
  created_at: string;
}

// No WHERE patient_id = ... / professional_id = ... here on purpose: the
// appointments_participant RLS policy in 900_rls.sql already restricts every
// row this query can see to ones where the caller (bound via
// requestScopedDb's set_config) is the patient or the professional. That's
// the point of doing authorization at the database layer - this repository
// can't get it wrong by forgetting a filter.
export function listMyAppointments(db: PoolClient) {
  return db
    .query<AppointmentRow>("SELECT * FROM appointments ORDER BY scheduled_start_time DESC")
    .then((r) => r.rows);
}

export function createAppointment(
  db: PoolClient,
  args: {
    patientId: string;
    professionalId: string;
    organizationId: string | null;
    scheduledStartTime: string;
    scheduledEndTime: string;
  },
) {
  return db
    .query<AppointmentRow>(
      `INSERT INTO appointments (patient_id, professional_id, organization_id, scheduled_start_time, scheduled_end_time)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [args.patientId, args.professionalId, args.organizationId, args.scheduledStartTime, args.scheduledEndTime],
    )
    .then((r) => r.rows[0]);
}

// RLS-scoped like the query above - no need to also filter by caller here.
export function findAppointmentById(db: PoolClient, id: string) {
  return db
    .query<AppointmentRow>("SELECT * FROM appointments WHERE id = $1", [id])
    .then((r) => r.rows[0] ?? null);
}

// The status = 'scheduled' guard in the WHERE clause (not just an app-layer
// check beforehand) means a race between two concurrent requests against
// the same appointment can only ever let one of them succeed - the second
// one's UPDATE simply matches zero rows instead of double-cancelling or
// cancelling something already checked in.
export function cancelAppointment(db: PoolClient, id: string, reason: string | null) {
  return db
    .query<AppointmentRow>(
      `UPDATE appointments
       SET status = 'cancelled', cancellation_reason = $2
       WHERE id = $1 AND status = 'scheduled'
       RETURNING *`,
      [id, reason],
    )
    .then((r) => r.rows[0] ?? null);
}

export function rescheduleAppointment(
  db: PoolClient,
  id: string,
  args: { scheduledStartTime: string; scheduledEndTime: string },
) {
  return db
    .query<AppointmentRow>(
      `UPDATE appointments
       SET scheduled_start_time = $2, scheduled_end_time = $3
       WHERE id = $1 AND status = 'scheduled'
       RETURNING *`,
      [id, args.scheduledStartTime, args.scheduledEndTime],
    )
    .then((r) => r.rows[0] ?? null);
}

export function checkInAppointment(
  db: PoolClient,
  id: string,
  args: { method: string | null; value: string | null },
) {
  return db
    .query<AppointmentRow>(
      `UPDATE appointments
       SET status = 'checked_in', checkin_method = $2, checkin_value = $3, checked_in_at = now()
       WHERE id = $1 AND status = 'scheduled'
       RETURNING *`,
      [id, args.method, args.value],
    )
    .then((r) => r.rows[0] ?? null);
}

// Calls the count_checked_in_ahead() SECURITY DEFINER function from
// 901_queue_position_function.sql rather than a plain COUNT(*) - a direct
// query here would be silently filtered by appointments_participant RLS
// before the aggregate ever ran, since a patient can't SELECT another
// patient's row at all. See that migration's comment for the bug this fixed.
export function countAheadInQueue(db: PoolClient, professionalId: string, checkedInAt: string) {
  return db
    .query<{ count: number }>("SELECT count_checked_in_ahead($1, $2) AS count", [professionalId, checkedInAt])
    .then((r) => Number(r.rows[0].count));
}
