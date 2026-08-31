import nodemailer, { type Transporter } from "nodemailer";
import { env } from "../config/env";

// medgram:// is app.json's registered scheme; App.js's deep-link handlers
// already match on these path substrings (verify-email, reset-password,
// reactivate, deactivate) with a ?token= param, both for native deep links
// and the web fallback (window.location matched against the same
// substrings). Keep new email links consistent with that existing matching,
// not path-exact.
export function buildDeepLink(path: string, token: string): string {
  return `medgram://${path}?token=${encodeURIComponent(token)}`;
}

let transporter: Transporter | null | undefined;

// undefined = not yet resolved, null = intentionally unconfigured (dev
// fallback). Distinct from getGoogleClient()'s throw-if-unconfigured
// pattern: a missing mailer shouldn't fail the request, since the
// OTP/token is already persisted regardless of whether the email sends.
function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter;
  if (!env.EMAIL_HOST || !env.EMAIL_HOST_USERNAME || !env.EMAIL_HOST_PASSWORD) {
    transporter = null;
    return transporter;
  }
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: env.EMAIL_PORT ?? 587,
    secure: env.EMAIL_HOST_SECURE,
    auth: { user: env.EMAIL_HOST_USERNAME, pass: env.EMAIL_HOST_PASSWORD },
  });
  return transporter;
}

/**
 * Never throws - a broken/unconfigured mail provider must not fail the
 * request that triggered it (registration, login, password reset, ...),
 * since the OTP/token this email carries is already stored in the DB
 * either way. Errors are logged, not swallowed silently.
 */
export async function sendEmail(to: string, subject: string, text: string): Promise<void> {
  console.log(`[email] ${subject} -> ${to}`);
  const t = getTransporter();
  if (!t) {
    console.warn("[email] EMAIL_HOST/EMAIL_HOST_USERNAME/EMAIL_HOST_PASSWORD not fully set - skipping actual send (dev fallback)");
    return;
  }
  try {
    await t.sendMail({ from: env.EMAIL_HOST_USERNAME, to, subject, text });
  } catch (err) {
    console.error(`[email] failed to send "${subject}" to ${to}:`, err);
  }
}
