import { createHash } from "node:crypto";
import type { Request } from "express";

/**
 * Prefers a stable client-supplied device id (X-Device-Id) over User-Agent,
 * which is a weak fingerprint on its own - see the comment in
 * backend/db/schema/016_device_verification.sql for why, and what the
 * concrete frontend follow-up is. Falls back to User-Agent only because
 * nothing else is sent today.
 */
export function getDeviceFingerprint(req: Request): string {
  const deviceId = req.header("x-device-id");
  const raw = deviceId || req.header("user-agent") || "unknown";
  return createHash("sha256").update(raw).digest("hex");
}
