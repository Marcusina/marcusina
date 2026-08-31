import type { PoolClient } from "pg";
import {
  getAnalytics,
  getAppointmentHistoryWithPatient,
  getPatientClinicalNotes,
  getPatientLabOrders,
  getPatientPrescriptions,
  getPatientProfileForChart,
  hasActiveRelationship,
  insertClinicalNote,
  listMyPatients,
  listNotesAuthoredBy,
} from "./professional.repository";

export class NoAuthorizedRelationshipError extends Error {
  constructor() {
    super("You don't have an authorized relationship with this patient");
  }
}

export function getMyPatients(db: PoolClient, professionalId: string) {
  return listMyPatients(db, professionalId);
}

export function getMyClinicalNotes(db: PoolClient, professionalId: string) {
  return listNotesAuthoredBy(db, professionalId);
}

/**
 * The explicit relationship check here is about API correctness, not
 * security - RLS already restricts every one of the parallel queries below
 * to what this caller may see. Without it, querying an unrelated patient
 * would just come back as a 200 with every field empty, which is a
 * confusing way to say "you're not authorized for this patient" versus
 * "this patient genuinely has no records yet."
 */
export async function getPatientChart(db: PoolClient, professionalId: string, patientId: string) {
  const authorized = await hasActiveRelationship(db, professionalId, patientId);
  if (!authorized) throw new NoAuthorizedRelationshipError();

  const [profile, prescriptions, labOrders, clinicalNotes, appointmentHistory] = await Promise.all([
    getPatientProfileForChart(db, patientId),
    getPatientPrescriptions(db, patientId),
    getPatientLabOrders(db, patientId),
    getPatientClinicalNotes(db, patientId),
    getAppointmentHistoryWithPatient(db, professionalId, patientId),
  ]);

  return { profile, prescriptions, labOrders, clinicalNotes, appointmentHistory };
}

export async function createClinicalNote(
  db: PoolClient,
  args: { professionalId: string; patientId: string; appointmentId: string | null; content: string },
) {
  // Same defense-in-depth as the check above: 900_rls.sql's
  // clinical_notes_author_write WITH CHECK enforces this same relationship
  // requirement at the database layer regardless, but failing fast here
  // gives a clear NoAuthorizedRelationshipError instead of a raw RLS policy
  // violation bubbling up as an opaque database error.
  const authorized = await hasActiveRelationship(db, args.professionalId, args.patientId);
  if (!authorized) throw new NoAuthorizedRelationshipError();

  return insertClinicalNote(db, args);
}

export function getMyAnalytics(db: PoolClient, professionalId: string) {
  return getAnalytics(db, professionalId);
}
