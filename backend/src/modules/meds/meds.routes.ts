import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { searchMedications } from "./meds.repository";
import {
  InvalidPrescriptionStateError,
  NoAuthorizedRelationshipError,
  PrescriptionNotFoundError,
  getPrescriptionById,
  getUserPrescriptions,
  requestRefill,
  updatePrescriptionReminder,
  uploadPrescription,
} from "./meds.service";

const router = Router();

// Public and unauthenticated in meds.api.js's getMedications - deliberately
// no requireAuth here.
router.get("/medications/all", async (req, res, next) => {
  try {
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const category = typeof req.query.category === "string" ? req.query.category : undefined;
    const medications = await searchMedications(req.db!, { search, category });
    res.json(medications);
  } catch (err) {
    next(err);
  }
});

const uploadPrescriptionSchema = z.object({
  medication_id: z.string().uuid().nullable().optional(),
  dosage: z.string().nullable().optional(),
  instructions: z.string().nullable().optional(),
});

router.post("/patients/:patientId/prescriptions/create", requireAuth, async (req, res, next) => {
  const parsed = uploadPrescriptionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const prescription = await uploadPrescription(req.db!, {
      patientId: req.params.patientId,
      professionalId: req.user!.id,
      medicationId: parsed.data.medication_id ?? null,
      dosage: parsed.data.dosage ?? null,
      instructions: parsed.data.instructions ?? null,
    });
    res.status(201).json(prescription);
  } catch (err) {
    if (err instanceof NoAuthorizedRelationshipError) return res.status(403).json({ error: { code: "NO_AUTHORIZED_RELATIONSHIP", message: err.message } });
    next(err);
  }
});

router.get("/patients/:userId/prescriptions", requireAuth, async (req, res, next) => {
  try {
    res.json(await getUserPrescriptions(req.db!, req.params.userId));
  } catch (err) {
    next(err);
  }
});

router.get("/prescriptions/:id", requireAuth, async (req, res, next) => {
  try {
    res.json(await getPrescriptionById(req.db!, req.params.id));
  } catch (err) {
    if (err instanceof PrescriptionNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

router.post("/prescriptions/:id/refill", requireAuth, async (req, res, next) => {
  try {
    res.json(await requestRefill(req.db!, req.params.id));
  } catch (err) {
    if (err instanceof PrescriptionNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof InvalidPrescriptionStateError) return res.status(409).json({ error: { code: "INVALID_STATE", message: err.message } });
    next(err);
  }
});

const reminderSchema = z.record(z.unknown());

router.patch("/prescriptions/:id/reminder", requireAuth, async (req, res, next) => {
  const parsed = reminderSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    res.json(await updatePrescriptionReminder(req.db!, req.params.id, parsed.data));
  } catch (err) {
    if (err instanceof PrescriptionNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

export default router;
