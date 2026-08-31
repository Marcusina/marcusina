import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import {
  InvalidLabOrderStateError,
  LabOrderNotFoundError,
  LabResultNotFoundError,
  NoAuthorizedRelationshipError,
  createLabOrder,
  getLabOrderById,
  getLabOrders,
  getLabResultById,
  selectLabCenter,
} from "./labs.service";

const router = Router();

router.get("/labs/orders/all", requireAuth, async (req, res, next) => {
  try {
    res.json(await getLabOrders(req.db!));
  } catch (err) {
    next(err);
  }
});

router.get("/labs/orders/:id", requireAuth, async (req, res, next) => {
  try {
    res.json(await getLabOrderById(req.db!, req.params.id));
  } catch (err) {
    if (err instanceof LabOrderNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

router.get("/labs/orders/:id/result", requireAuth, async (req, res, next) => {
  try {
    res.json(await getLabResultById(req.db!, req.params.id));
  } catch (err) {
    if (err instanceof LabOrderNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof LabResultNotFoundError) return res.status(404).json({ error: { code: "NOT_AVAILABLE", message: err.message } });
    next(err);
  }
});

const selectCenterSchema = z.object({ center_id: z.string().uuid() });

router.patch("/labs/orders/:orderId/center", requireAuth, async (req, res, next) => {
  const parsed = selectCenterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const order = await selectLabCenter(req.db!, req.params.orderId, parsed.data.center_id);
    res.json(order);
  } catch (err) {
    if (err instanceof LabOrderNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof InvalidLabOrderStateError) return res.status(409).json({ error: { code: "INVALID_STATE", message: err.message } });
    next(err);
  }
});

const createOrderSchema = z.object({
  order_type: z.string().min(1),
  center_id: z.string().uuid().nullable().optional(),
});

router.post("/patients/:patientId/labs/orders/create", requireAuth, async (req, res, next) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const order = await createLabOrder(req.db!, {
      patientId: req.params.patientId,
      orderingProfessionalId: req.user!.id,
      orderType: parsed.data.order_type,
      centerId: parsed.data.center_id ?? null,
    });
    res.status(201).json(order);
  } catch (err) {
    if (err instanceof NoAuthorizedRelationshipError) return res.status(403).json({ error: { code: "NO_AUTHORIZED_RELATIONSHIP", message: err.message } });
    next(err);
  }
});

export default router;
