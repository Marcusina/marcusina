import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { InvalidReferenceError, WishlistItemNotFoundError, addToWishlist, getWishlist, removeFromWishlist } from "./wishlist.service";

const router = Router();

router.get("/wishlist/user", requireAuth, async (req, res, next) => {
  try {
    res.json(await getWishlist(req.db!, req.user!.id));
  } catch (err) {
    next(err);
  }
});

const addSchema = z.object({
  medication_id: z.string().uuid(),
  inventory_id: z.string().uuid().nullable().optional(),
});

router.post("/wishlist/add", requireAuth, async (req, res, next) => {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const item = await addToWishlist(req.db!, req.user!.id, parsed.data.medication_id, parsed.data.inventory_id ?? null);
    res.status(201).json(item);
  } catch (err) {
    if (err instanceof InvalidReferenceError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

router.delete("/wishlist/item/:itemId", requireAuth, async (req, res, next) => {
  try {
    await removeFromWishlist(req.db!, req.user!.id, req.params.itemId);
    res.json({ data: { removed: true } });
  } catch (err) {
    if (err instanceof WishlistItemNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

export default router;
