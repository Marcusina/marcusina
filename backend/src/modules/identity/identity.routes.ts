import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import {
  AccountAlreadySuspendedError,
  AccountNotSuspendedError,
  getVerificationHistory,
  queueIdentityRequest,
  reissueIdentity,
  scanPatientId,
  suspendIdentity,
} from "./identity.service";

const router = Router();

// recover/replace-card/merge/device-transfer all land as a queued
// IdentityRequest row (status 'pending'), never complete synchronously -
// see identity_requests in 010_identity.sql and identity.service.ts's
// comment on the authenticated-self-service inference this is built on.
// Body shape is a passthrough in identity.api.js (no fixed fields
// declared), so it's stored as-is in the payload jsonb column rather than
// validated against a specific schema here.
const queueableRequests: Array<{ path: string; requestType: "recover" | "replace_card" | "merge" | "device_transfer" }> = [
  { path: "/identity/recover", requestType: "recover" },
  { path: "/identity/replace-card", requestType: "replace_card" },
  { path: "/identity/merge", requestType: "merge" },
  { path: "/identity/device-transfer", requestType: "device_transfer" },
];

for (const { path, requestType } of queueableRequests) {
  router.post(path, requireAuth, async (req, res, next) => {
    try {
      const request = await queueIdentityRequest(req.db!, req.user!.id, requestType, req.body ?? {});
      res.status(202).json(request);
    } catch (err) {
      next(err);
    }
  });
}

router.post("/identity/suspend", requireAuth, async (req, res, next) => {
  try {
    await suspendIdentity(req.db!, req.user!.id);
    res.json({ data: { account_status: "suspended" } });
  } catch (err) {
    if (err instanceof AccountAlreadySuspendedError) {
      return res.status(409).json({ error: { code: "ALREADY_SUSPENDED", message: err.message } });
    }
    next(err);
  }
});

router.post("/identity/reissue", requireAuth, async (req, res, next) => {
  try {
    await reissueIdentity(req.db!, req.user!.id);
    res.json({ data: { account_status: "active" } });
  } catch (err) {
    if (err instanceof AccountNotSuspendedError) {
      return res.status(409).json({ error: { code: "NOT_SUSPENDED", message: err.message } });
    }
    next(err);
  }
});

const scanSchema = z.record(z.unknown());

router.post("/identity/scan", requireAuth, async (req, res, next) => {
  const parsed = scanSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const verification = await scanPatientId(req.db!, req.user!.id, parsed.data);
    res.status(201).json(verification);
  } catch (err) {
    next(err);
  }
});

router.get("/identity/verification-history", requireAuth, async (req, res, next) => {
  try {
    res.json(await getVerificationHistory(req.db!, req.user!.id));
  } catch (err) {
    next(err);
  }
});

export default router;
