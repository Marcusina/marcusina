import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { CartItemNotFoundError, MedicationNotFoundError, addToCart, getCart, removeFromCart, updateCartItem } from "./cart.service";

const router = Router();

router.get("/cart/user", requireAuth, async (req, res, next) => {
  try {
    res.json(await getCart(req.db!, req.user!.id));
  } catch (err) {
    next(err);
  }
});

const addSchema = z.object({
  medication_id: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
});

router.post("/cart/add", requireAuth, async (req, res, next) => {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const item = await addToCart(req.db!, req.user!.id, parsed.data.medication_id, parsed.data.quantity);
    res.status(201).json(item);
  } catch (err) {
    if (err instanceof MedicationNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

const updateSchema = z.object({ quantity: z.number().int().positive() });

router.put("/cart/item/:itemId/update", requireAuth, async (req, res, next) => {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const item = await updateCartItem(req.db!, req.user!.id, req.params.itemId, parsed.data.quantity);
    res.json(item);
  } catch (err) {
    if (err instanceof CartItemNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

router.delete("/cart/item/:itemId/delete", requireAuth, async (req, res, next) => {
  try {
    await removeFromCart(req.db!, req.user!.id, req.params.itemId);
    res.json({ data: { removed: true } });
  } catch (err) {
    if (err instanceof CartItemNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

export default router;
