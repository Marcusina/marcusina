import type { PoolClient } from "pg";

export interface LabOrderRow {
  id: string;
  patient_id: string;
  ordering_professional_id: string;
  center_id: string | null;
  order_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

// RLS-scoped like appointments.repository.ts - no explicit caller filter
// needed, lab_orders_patient_read/lab_orders_treating_professional_read/
// lab_orders_orderer_write already restrict visible rows.
export function listMyLabOrders(db: PoolClient) {
  return db.query<LabOrderRow>("SELECT * FROM lab_orders ORDER BY created_at DESC").then((r) => r.rows);
}

export function findLabOrderById(db: PoolClient, id: string) {
  return db.query<LabOrderRow>("SELECT * FROM lab_orders WHERE id = $1", [id]).then((r) => r.rows[0] ?? null);
}

export interface LabResultRow {
  id: string;
  lab_order_id: string;
  result_data: unknown;
  released_at: string;
}

export function findLabResultByOrderId(db: PoolClient, orderId: string) {
  return db
    .query<LabResultRow>("SELECT * FROM lab_results WHERE lab_order_id = $1", [orderId])
    .then((r) => r.rows[0] ?? null);
}

// Only ever sets center_id/status - lab_orders_patient_write in
// 900_rls.sql grants row-level UPDATE access to the whole row (RLS can't
// restrict individual columns), so this specific column list is the actual
// enforcement of "a patient can only pick a center, not rewrite anything
// else about their own order."
export function setLabOrderCenter(db: PoolClient, orderId: string, centerId: string) {
  return db
    .query<LabOrderRow>(
      `UPDATE lab_orders SET center_id = $2, status = 'center_selected'
       WHERE id = $1 AND status = 'pending'
       RETURNING *`,
      [orderId, centerId],
    )
    .then((r) => r.rows[0] ?? null);
}

export function insertLabOrder(
  db: PoolClient,
  args: { patientId: string; orderingProfessionalId: string; orderType: string; centerId: string | null },
) {
  // Status computed in code, not SQL: reusing $4 both as the center_id
  // value and inside a CASE WHEN $4 IS NULL made Postgres unable to
  // determine that parameter's type ("could not determine data type of
  // parameter $4") - caught by actually running this, not by reading it.
  const status = args.centerId === null ? "pending" : "center_selected";
  return db
    .query<LabOrderRow>(
      `INSERT INTO lab_orders (patient_id, ordering_professional_id, order_type, center_id, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [args.patientId, args.orderingProfessionalId, args.orderType, args.centerId, status],
    )
    .then((r) => r.rows[0]);
}
