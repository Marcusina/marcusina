import type { PoolClient } from "pg";
import { hasActiveRelationship } from "../professional/professional.repository";
import {
  findLabOrderById,
  findLabResultByOrderId,
  insertLabOrder,
  listMyLabOrders,
  setLabOrderCenter,
} from "./labs.repository";

export class LabOrderNotFoundError extends Error {
  constructor() {
    super("Lab order not found");
  }
}

export class LabResultNotFoundError extends Error {
  constructor() {
    super("Lab result not available yet");
  }
}

export class InvalidLabOrderStateError extends Error {
  constructor() {
    super("This lab order isn't awaiting a center selection");
  }
}

export class NoAuthorizedRelationshipError extends Error {
  constructor() {
    super("You don't have an authorized relationship with this patient");
  }
}

export function getLabOrders(db: PoolClient) {
  return listMyLabOrders(db);
}

export async function getLabOrderById(db: PoolClient, id: string) {
  const order = await findLabOrderById(db, id);
  if (!order) throw new LabOrderNotFoundError();
  return order;
}

export async function getLabResultById(db: PoolClient, orderId: string) {
  const order = await findLabOrderById(db, orderId);
  if (!order) throw new LabOrderNotFoundError();
  const result = await findLabResultByOrderId(db, orderId);
  if (!result) throw new LabResultNotFoundError();
  return result;
}

export async function selectLabCenter(db: PoolClient, orderId: string, centerId: string) {
  const existing = await findLabOrderById(db, orderId);
  if (!existing) throw new LabOrderNotFoundError();
  const updated = await setLabOrderCenter(db, orderId, centerId);
  if (!updated) throw new InvalidLabOrderStateError();
  return updated;
}

export async function createLabOrder(
  db: PoolClient,
  args: { patientId: string; orderingProfessionalId: string; orderType: string; centerId: string | null },
) {
  // App-layer check for a clean 403 (reusing the professional module's
  // relationship helper rather than duplicating it) - the same requirement
  // is also enforced at the database layer by lab_orders_orderer_write's
  // WITH CHECK, so this can't be bypassed even if this check were skipped.
  const authorized = await hasActiveRelationship(db, args.orderingProfessionalId, args.patientId);
  if (!authorized) throw new NoAuthorizedRelationshipError();
  return insertLabOrder(db, args);
}
