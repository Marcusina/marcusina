import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { ConsentNotFoundError, ForbiddenError, getMyConsents, grantConsent, revokeConsent } from "./consent.service";

const router = Router();

router.get("/consents/user/:userId", requireAuth, async (req, res, next) => {
  try {
    res.json(await getMyConsents(req.db!, req.user!.id, req.params.userId));
  } catch (err) {
    if (err instanceof ForbiddenError) return res.status(403).json({ error: { code: "FORBIDDEN", message: err.message } });
    next(err);
  }
});

router.put("/consents/:consentId/revoke", requireAuth, async (req, res, next) => {
  try {
    res.json(await revokeConsent(req.db!, req.params.consentId));
  } catch (err) {
    if (err instanceof ConsentNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

const grantSchema = z.object({
  grantee_user_id: z.string().uuid().nullable().optional(),
  resource_type: z.string().min(1),
  resource_id: z.string().uuid(),
});

router.post("/consents/grant", requireAuth, async (req, res, next) => {
  const parsed = grantSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const consent = await grantConsent(req.db!, {
      grantingUserId: req.user!.id,
      granteeUserId: parsed.data.grantee_user_id ?? null,
      resourceType: parsed.data.resource_type,
      resourceId: parsed.data.resource_id,
    });
    res.status(201).json(consent);
  } catch (err) {
    next(err);
  }
});

export default router;
