import type { PoolClient } from "pg";
import { hasActiveRelationship } from "../professional/professional.repository";
import {
  findPrescriptionById,
  insertPrescription,
  listPrescriptionsForPatient,
  markPrescriptionRefillRequested,
  setPrescriptionReminder,
} from "./meds.repository";

export class PrescriptionNotFoundError extends Error {
  constructor() {
    super("Prescription not found");
  }
}

export class InvalidPrescriptionStateError extends Error {
  constructor() {
    super("This prescription isn't active, so a refill can't be requested");
  }
}

export class NoAuthorizedRelationshipError extends Error {
  constructor() {
    super("You don't have an authorized relationship with this patient");
  }
}

/**
 * uploadPrescription in meds.api.js documents that this same endpoint also
 * backs a patient uploading their OWN external prescription (photo/scan),
 * not just a professional authoring one - but prescriptions.professional_id
 * is NOT NULL in this schema, with no home for a patient-self-uploaded
 * record that has no authoring professional. Rather than redesign that
 * table and its already-tested RLS policies mid-stream, this implementation
 * only supports the professional-authors-for-a-patient path (same
 * relationship-checked shape as labs.service.ts's createLabOrder). A
 * patient calling this for themselves fails the relationship check the same
 * way an unrelated professional would - a real product limitation, not a
 * bug, flagged here rather than silently pretended away.
 */
export async function uploadPrescription(
  db: PoolClient,
  args: {
    patientId: string;
    professionalId: string;
    medicationId: string | null;
    dosage: string | null;
    instructions: string | null;
  },
) {
  const authorized = await hasActiveRelationship(db, args.professionalId, args.patientId);
  if (!authorized) throw new NoAuthorizedRelationshipError();
  return insertPrescription(db, args);
}

export function getUserPrescriptions(db: PoolClient, patientId: string) {
  return listPrescriptionsForPatient(db, patientId);
}

export async function getPrescriptionById(db: PoolClient, id: string) {
  const prescription = await findPrescriptionById(db, id);
  if (!prescription) throw new PrescriptionNotFoundError();
  return prescription;
}

export async function requestRefill(db: PoolClient, id: string) {
  const existing = await findPrescriptionById(db, id);
  if (!existing) throw new PrescriptionNotFoundError();
  const updated = await markPrescriptionRefillRequested(db, id);
  if (!updated) throw new InvalidPrescriptionStateError();
  return updated;
}

export async function updatePrescriptionReminder(db: PoolClient, id: string, reminderSchedule: unknown) {
  const existing = await findPrescriptionById(db, id);
  if (!existing) throw new PrescriptionNotFoundError();
  // No status guard needed - reminders are a scheduling convenience, not
  // gated by the prescription's clinical lifecycle state. RLS's
  // prescriptions_patient_write already confines this to the owning
  // patient.
  const updated = await setPrescriptionReminder(db, id, reminderSchedule);
  if (!updated) throw new PrescriptionNotFoundError();
  return updated;
}
