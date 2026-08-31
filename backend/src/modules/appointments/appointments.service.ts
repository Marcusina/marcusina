import type { PoolClient } from "pg";
import {
  cancelAppointment as cancelAppointmentRepo,
  checkInAppointment as checkInAppointmentRepo,
  countAheadInQueue,
  findAppointmentById,
  rescheduleAppointment as rescheduleAppointmentRepo,
} from "./appointments.repository";

// Indistinguishable from "exists but belongs to someone else" on purpose -
// findAppointmentById is RLS-scoped, so a caller with no relationship to the
// row sees the same "not found" a truly nonexistent id would produce. Never
// leaking which ids exist to a caller who isn't a participant.
export class AppointmentNotFoundError extends Error {
  constructor() {
    super("Appointment not found");
  }
}

export class InvalidAppointmentStateError extends Error {
  constructor(action: string) {
    super(`Cannot ${action} an appointment that isn't currently scheduled`);
  }
}

export class NotCheckedInError extends Error {
  constructor() {
    super("This appointment hasn't been checked in yet");
  }
}

export async function cancelAppointment(db: PoolClient, id: string, reason: string | null) {
  const existing = await findAppointmentById(db, id);
  if (!existing) throw new AppointmentNotFoundError();

  // The repository's WHERE status = 'scheduled' guard is the actual race
  // protection; this existing/updated split is just to distinguish "doesn't
  // exist or isn't yours" (404) from "exists but isn't cancellable right
  // now" (409) for the caller.
  const updated = await cancelAppointmentRepo(db, id, reason);
  if (!updated) throw new InvalidAppointmentStateError("cancel");
  return updated;
}

export async function rescheduleAppointment(
  db: PoolClient,
  id: string,
  args: { scheduledStartTime: string; scheduledEndTime?: string },
) {
  const existing = await findAppointmentById(db, id);
  if (!existing) throw new AppointmentNotFoundError();

  // Preserves the original duration when scheduled_end_time isn't passed -
  // matches rescheduleAppointment's documented contract in
  // api/appointments.api.js.
  const durationMs =
    new Date(existing.scheduled_end_time).getTime() - new Date(existing.scheduled_start_time).getTime();
  const scheduledEndTime =
    args.scheduledEndTime ?? new Date(new Date(args.scheduledStartTime).getTime() + durationMs).toISOString();

  const updated = await rescheduleAppointmentRepo(db, id, {
    scheduledStartTime: args.scheduledStartTime,
    scheduledEndTime,
  });
  if (!updated) throw new InvalidAppointmentStateError("reschedule");
  return updated;
}

export async function checkInAppointment(
  db: PoolClient,
  id: string,
  args: { method: string | null; value: string | null },
) {
  const existing = await findAppointmentById(db, id);
  if (!existing) throw new AppointmentNotFoundError();

  const updated = await checkInAppointmentRepo(db, id, args);
  if (!updated) throw new InvalidAppointmentStateError("check in");
  return updated;
}

export async function getQueuePosition(db: PoolClient, id: string): Promise<{ position: number }> {
  const appointment = await findAppointmentById(db, id);
  if (!appointment) throw new AppointmentNotFoundError();
  if (appointment.status !== "checked_in" || !appointment.checked_in_at) throw new NotCheckedInError();

  const ahead = await countAheadInQueue(db, appointment.professional_id, appointment.checked_in_at);
  return { position: ahead + 1 };
}
