import { Router, type NextFunction, type Response } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { createAppointment, listMyAppointments } from "./appointments.repository";
import {
  AppointmentNotFoundError,
  InvalidAppointmentStateError,
  NotCheckedInError,
  cancelAppointment,
  checkInAppointment,
  getQueuePosition,
  rescheduleAppointment,
} from "./appointments.service";

const router = Router();
// requireAuth is applied per-route below, never via router.use() - this
// router is mounted at app root with no path prefix (app.use(router), not
// app.use('/appointments', router)), so a blanket router.use(requireAuth)
// here would run for every request that reaches this router in the app's
// middleware chain, not just ones matching an appointments route. That bug
// was caught live: it 401'd /medications/all and even unmatched paths
// (masking Express's default 404) once appointmentsRoutes was mounted ahead
// of them in app.ts.

router.get("/appointments/all", requireAuth, async (req, res, next) => {
  try {
    const appointments = await listMyAppointments(req.db!);
    res.json(appointments);
  } catch (err) {
    next(err);
  }
});

const createSchema = z.object({
  professional_id: z.string().uuid(),
  organization_id: z.string().uuid().nullable().optional(),
  scheduled_start_time: z.string().datetime(),
  scheduled_end_time: z.string().datetime(),
});

router.post("/appointments/create", requireAuth, async (req, res, next) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const appointment = await createAppointment(req.db!, {
      patientId: req.user!.id,
      professionalId: parsed.data.professional_id,
      organizationId: parsed.data.organization_id ?? null,
      scheduledStartTime: parsed.data.scheduled_start_time,
      scheduledEndTime: parsed.data.scheduled_end_time,
    });
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
});

function handleAppointmentServiceError(err: unknown, res: Response, next: NextFunction) {
  if (err instanceof AppointmentNotFoundError) {
    return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
  }
  if (err instanceof InvalidAppointmentStateError) {
    return res.status(409).json({ error: { code: "INVALID_STATE", message: err.message } });
  }
  if (err instanceof NotCheckedInError) {
    return res.status(409).json({ error: { code: "NOT_CHECKED_IN", message: err.message } });
  }
  next(err);
}

const cancelSchema = z.object({ cancellation_reason: z.string().optional() });

router.put("/appointments/:id/cancel", requireAuth, async (req, res, next) => {
  const parsed = cancelSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const appointment = await cancelAppointment(req.db!, req.params.id, parsed.data.cancellation_reason ?? null);
    res.json(appointment);
  } catch (err) {
    handleAppointmentServiceError(err, res, next);
  }
});

// scheduled_end_time is optional on purpose - rescheduleAppointment in
// api/appointments.api.js documents that the backend preserves the original
// duration when it's omitted (see appointments.service.ts).
const rescheduleSchema = z.object({
  scheduled_start_time: z.string().datetime(),
  scheduled_end_time: z.string().datetime().optional(),
});

router.put("/appointments/:id/reschedule", requireAuth, async (req, res, next) => {
  const parsed = rescheduleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const appointment = await rescheduleAppointment(req.db!, req.params.id, {
      scheduledStartTime: parsed.data.scheduled_start_time,
      scheduledEndTime: parsed.data.scheduled_end_time,
    });
    res.json(appointment);
  } catch (err) {
    handleAppointmentServiceError(err, res, next);
  }
});

// method/value are accepted but not verified against anything server-side -
// matches checkInAppointment's documented contract in
// api/appointments.api.js: there's no real scannable MedGram ID/QR system
// to check them against yet.
const checkinSchema = z.object({
  method: z.string().optional(),
  value: z.string().optional(),
});

router.post("/appointments/:id/checkin", requireAuth, async (req, res, next) => {
  const parsed = checkinSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const appointment = await checkInAppointment(req.db!, req.params.id, {
      method: parsed.data.method ?? null,
      value: parsed.data.value ?? null,
    });
    res.json(appointment);
  } catch (err) {
    handleAppointmentServiceError(err, res, next);
  }
});

router.get("/appointments/:id/queue-position", requireAuth, async (req, res, next) => {
  try {
    const result = await getQueuePosition(req.db!, req.params.id);
    res.json(result);
  } catch (err) {
    handleAppointmentServiceError(err, res, next);
  }
});

export default router;
