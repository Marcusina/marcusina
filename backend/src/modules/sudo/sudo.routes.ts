import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { findUserById } from "../auth/auth.repository";
import { sendEmail } from "../../lib/mailer";
import {
  InvalidOtpError,
  NoPendingSudoRequestError,
  TooManyAttemptsError,
  getSudoStatus,
  requestSudo,
  verifySudo,
} from "./sudo.service";

const router = Router();

// actionName: camelCase - matches sudoRequest(actionName) in auth.api.js
// exactly, unlike almost everything else in this API.
const requestSchema = z.object({ actionName: z.string().default("") });

router.post("/sudo/request", requireAuth, async (req, res, next) => {
  const parsed = requestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const otp = await requestSudo(req.db!, req.user!.id, parsed.data.actionName);
    const user = await findUserById(req.db!, req.user!.id);
    if (user?.email) {
      void sendEmail(
        user.email,
        "Your Medgram security code",
        `Your security verification code is: ${otp}\n\nEnter this in the app to continue. It expires in 10 minutes.`,
      );
    }
    res.json({ data: { sent: true, ...(process.env.NODE_ENV !== "production" ? { debug_otp: otp } : {}) } });
  } catch (err) {
    next(err);
  }
});

const verifySchema = z.object({ otp: z.string().length(6) });

router.post("/sudo/verify", requireAuth, async (req, res, next) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    await verifySudo(req.db!, req.user!.id, parsed.data.otp);
    res.json({ data: { verified: true } });
  } catch (err) {
    if (err instanceof NoPendingSudoRequestError) return res.status(400).json({ error: { code: "NO_PENDING_REQUEST", message: err.message } });
    if (err instanceof TooManyAttemptsError) return res.status(429).json({ error: { code: "TOO_MANY_ATTEMPTS", message: err.message } });
    if (err instanceof InvalidOtpError) return res.status(400).json({ error: { code: "INVALID_OTP", message: err.message } });
    next(err);
  }
});

router.get("/sudo/status", requireAuth, async (req, res, next) => {
  try {
    res.json({ data: await getSudoStatus(req.db!, req.user!.id) });
  } catch (err) {
    next(err);
  }
});

export default router;
