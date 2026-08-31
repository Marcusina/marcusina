import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import {
  NoAuthorizedRelationshipError,
  createClinicalNote,
  getMyAnalytics,
  getMyClinicalNotes,
  getMyPatients,
  getPatientChart,
} from "./professional.service";

const router = Router();

// A professional's patient roster/chart access is authorization-sensitive
// PHI - see the *_treating_professional_read policies in
// backend/db/schema/900_rls.sql, not a blanket "is a professional" check.
//
// requireAuth is applied per-route, not via router.use() - this router is
// mounted at app root with no path prefix (app.use(router), not
// app.use('/professional', router)), and wishlistRoutes is mounted right
// after it in app.ts. A blanket router.use(requireAuth) here would run for
// every request that reaches this router in the chain - including ones
// meant for wishlistRoutes - exactly the bug already found and fixed in
// appointments.routes.ts and seven other modules earlier this session.

router.get("/professional/patients", requireAuth, async (req, res, next) => {
  try {
    res.json(await getMyPatients(req.db!, req.user!.id));
  } catch (err) {
    next(err);
  }
});

router.get("/professional/patients/:patientId/chart", requireAuth, async (req, res, next) => {
  try {
    const chart = await getPatientChart(req.db!, req.user!.id, req.params.patientId);
    res.json(chart);
  } catch (err) {
    if (err instanceof NoAuthorizedRelationshipError) {
      return res.status(403).json({ error: { code: "NO_AUTHORIZED_RELATIONSHIP", message: err.message } });
    }
    next(err);
  }
});

router.get("/professional/clinical-notes", requireAuth, async (req, res, next) => {
  try {
    res.json(await getMyClinicalNotes(req.db!, req.user!.id));
  } catch (err) {
    next(err);
  }
});

const createNoteSchema = z.object({
  patient_id: z.string().uuid(),
  content: z.string().min(1),
  appointment_id: z.string().uuid().nullable().optional(),
});

router.post("/professional/clinical-notes", requireAuth, async (req, res, next) => {
  const parsed = createNoteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const note = await createClinicalNote(req.db!, {
      professionalId: req.user!.id,
      patientId: parsed.data.patient_id,
      appointmentId: parsed.data.appointment_id ?? null,
      content: parsed.data.content,
    });
    res.status(201).json(note);
  } catch (err) {
    if (err instanceof NoAuthorizedRelationshipError) {
      return res.status(403).json({ error: { code: "NO_AUTHORIZED_RELATIONSHIP", message: err.message } });
    }
    next(err);
  }
});

router.get("/professional/analytics", requireAuth, async (req, res, next) => {
  try {
    res.json(await getMyAnalytics(req.db!, req.user!.id));
  } catch (err) {
    next(err);
  }
});

export default router;
