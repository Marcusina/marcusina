import { Router } from "express";
import { z } from "zod";
import { requireAuth } from "../../middleware/auth";
import { loginRateLimiter } from "../../middleware/rateLimit";
import { getDeviceFingerprint } from "../../lib/deviceFingerprint";
import { GoogleAuthNotConfiguredError, InvalidGoogleTokenError, verifyGoogleIdToken } from "../../lib/googleIdToken";
import {
  findUserById,
  insertUserRole,
  listCurrencyHistory,
  insertCurrencyHistory,
  listOrganizations,
  setActiveCurrency,
} from "./auth.repository";
import { isUniqueViolation } from "../../lib/pgErrors";
import {
  InvalidOtpError as PhoneInvalidOtpError,
  NoPhoneOnFileError,
  PhoneAlreadyInUseError,
  ResendTooSoonError as PhoneResendTooSoonError,
  TooManyAttemptsError as PhoneTooManyAttemptsError,
  addPhone,
  confirmPhoneOtp,
  requestPhoneVerification,
} from "./phoneVerification.service";
import { AccountLinkConflictError, GoogleEmailNotVerifiedError, loginOrRegisterWithGoogle } from "./googleAuth.service";
import {
  AccountAlreadyDeactivatedError,
  InvalidLifecycleTokenError,
  confirmDeactivation,
  confirmReactivation,
  requestDeactivation,
} from "./accountLifecycle.service";
import {
  InvalidRefreshTokenError,
  RefreshTokenReuseDetectedError,
  clearRefreshCookie,
  getRefreshCookie,
  issueNewSession,
  revokeSession,
  rotateSession,
  setRefreshCookie,
} from "./session.service";
import {
  AccountNotActiveError,
  DeviceVerificationRequiredError,
  EmailAlreadyRegisteredError,
  EmailNotVerifiedError,
  IncorrectCurrentPasswordError,
  InvalidCredentialsError,
  changePassword,
  loginUser,
  registerProfessional,
  registerUser,
} from "./auth.service";
import {
  AlreadyVerifiedError,
  InvalidOtpError,
  ResendTooSoonError,
  TooManyAttemptsError,
  UserNotFoundError,
  confirmEmailOtp,
  confirmEmailVerificationLink,
  getVerificationStatus,
  resendEmailVerificationCode,
} from "./emailVerification.service";
import {
  InvalidOtpError as DeviceInvalidOtpError,
  NoPendingVerificationError,
  ResendTooSoonError as DeviceResendTooSoonError,
  TooManyAttemptsError as DeviceTooManyAttemptsError,
  UserNotFoundError as DeviceUserNotFoundError,
  confirmDeviceOtp,
  resendDeviceVerificationCode,
} from "./deviceVerification.service";
import { InvalidResetTokenError, requestPasswordReset, resetPasswordWithToken } from "./passwordReset.service";
import { buildDeepLink, sendEmail } from "../../lib/mailer";

const router = Router();

// SMS still has no real provider wired up (see phoneVerification.service.ts
// callers below) - only email actually sends now. Outside production, the
// OTP/token is still echoed back in the response too (debug_otp /
// debug_*_token) so the flow is testable without reading email; that must
// never ship to a production build (already gated on NODE_ENV below).
function deliverVerificationCode(email: string, code: string) {
  void sendEmail(email, "Confirm this device to sign in to Medgram", `Your device verification code is: ${code}\n\nEnter this in the app to continue signing in. It expires in 10 minutes.`);
}

function deliverEmailVerification(email: string, otp: string, linkToken: string) {
  void sendEmail(
    email,
    "Verify your Medgram email",
    `Your verification code is: ${otp}\n\nOr tap this link on your device to verify automatically:\n${buildDeepLink("verify-email", linkToken)}\n\nThis expires in 10 minutes.`,
  );
}

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

router.post("/auth/register", async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const { user, verification } = await registerUser(req.db!, parsed.data);
    deliverEmailVerification(parsed.data.email, verification.otp, verification.linkToken);
    res.status(201).json({
      data: {
        id: user.id,
        email: user.email,
        medgram_id: user.medgram_id,
        ...(process.env.NODE_ENV !== "production"
          ? { debug_otp: verification.otp, debug_verify_link_token: verification.linkToken }
          : {}),
      },
    });
  } catch (err) {
    if (err instanceof EmailAlreadyRegisteredError) {
      return res.status(409).json({ error: { code: "EMAIL_TAKEN", message: err.message } });
    }
    next(err);
  }
});

// registerDoctor(doctorData) in auth.api.js - narrowed to what this schema
// actually supports (account + a professional user_roles tag), not the full
// license/certificate verification application frontend.md's ONB-16
// describes. See registerProfessional's comment in auth.service.ts.
router.post("/doctors/register", async (req, res, next) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const { user, verification } = await registerProfessional(req.db!, parsed.data);
    deliverEmailVerification(parsed.data.email, verification.otp, verification.linkToken);
    res.status(201).json({
      data: {
        id: user.id,
        email: user.email,
        medgram_id: user.medgram_id,
        ...(process.env.NODE_ENV !== "production"
          ? { debug_otp: verification.otp, debug_verify_link_token: verification.linkToken }
          : {}),
      },
    });
  } catch (err) {
    if (err instanceof EmailAlreadyRegisteredError) {
      return res.status(409).json({ error: { code: "EMAIL_TAKEN", message: err.message } });
    }
    next(err);
  }
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post("/auth/login", loginRateLimiter, async (req, res, next) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const deviceFingerprintHash = getDeviceFingerprint(req);
    const user = await loginUser(req.db!, { ...parsed.data, deviceFingerprintHash });
    const { accessToken, refreshToken } = await issueNewSession(req.db!, user.id);
    setRefreshCookie(res, refreshToken);
    res.json({ data: { token: accessToken, user: { id: user.id, email: user.email, medgram_id: user.medgram_id } } });
  } catch (err) {
    if (err instanceof InvalidCredentialsError) {
      return res.status(401).json({ error: { code: "INVALID_CREDENTIALS", message: err.message } });
    }
    if (err instanceof EmailNotVerifiedError) {
      return res.status(403).json({ error: { code: "EMAIL_NOT_VERIFIED", message: err.message } });
    }
    if (err instanceof AccountNotActiveError) {
      return res.status(403).json({ error: { code: "ACCOUNT_NOT_ACTIVE", message: err.message, account_status: err.accountStatus } });
    }
    if (err instanceof DeviceVerificationRequiredError) {
      deliverVerificationCode(parsed.data.email, err.verificationCode);
      return res.status(403).json({
        error: {
          code: "DEVICE_VERIFICATION_REQUIRED",
          message: err.message,
          ...(process.env.NODE_ENV !== "production" ? { debug_otp: err.verificationCode } : {}),
        },
      });
    }
    next(err);
  }
});

const googleLoginSchema = z.object({ id_token: z.string().min(1) });

router.post("/auth/google", async (req, res, next) => {
  const parsed = googleLoginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }

  // Split into two try/catches on purpose: token verification (can't be
  // exercised in tests without a real Google-signed token) is fully
  // separate from account orchestration (which can, and is - see
  // googleAuth.service.ts).
  let profile;
  try {
    profile = await verifyGoogleIdToken(parsed.data.id_token);
  } catch (err) {
    if (err instanceof GoogleAuthNotConfiguredError) {
      return res.status(503).json({ error: { code: "GOOGLE_AUTH_NOT_CONFIGURED", message: err.message } });
    }
    if (err instanceof InvalidGoogleTokenError) {
      return res.status(401).json({ error: { code: "INVALID_GOOGLE_TOKEN", message: err.message } });
    }
    return next(err);
  }

  try {
    const deviceFingerprintHash = getDeviceFingerprint(req);
    const user = await loginOrRegisterWithGoogle(req.db!, profile, deviceFingerprintHash);
    const { accessToken, refreshToken } = await issueNewSession(req.db!, user.id);
    setRefreshCookie(res, refreshToken);
    res.json({ data: { token: accessToken, user: { id: user.id, email: user.email, medgram_id: user.medgram_id } } });
  } catch (err) {
    if (err instanceof GoogleEmailNotVerifiedError) {
      return res.status(403).json({ error: { code: "GOOGLE_EMAIL_NOT_VERIFIED", message: err.message } });
    }
    if (err instanceof AccountNotActiveError) {
      return res.status(403).json({ error: { code: "ACCOUNT_NOT_ACTIVE", message: err.message, account_status: err.accountStatus } });
    }
    if (err instanceof AccountLinkConflictError) {
      return res.status(409).json({ error: { code: "ACCOUNT_LINK_CONFLICT", message: err.message } });
    }
    if (err instanceof DeviceVerificationRequiredError) {
      deliverVerificationCode(profile.email, err.verificationCode);
      return res.status(403).json({
        error: {
          code: "DEVICE_VERIFICATION_REQUIRED",
          message: err.message,
          ...(process.env.NODE_ENV !== "production" ? { debug_otp: err.verificationCode } : {}),
        },
      });
    }
    next(err);
  }
});

const verifyOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

router.post("/verify-email-otp", async (req, res, next) => {
  const parsed = verifyOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    await confirmEmailOtp(req.db!, parsed.data);
    res.json({ data: { email_verified: true } });
  } catch (err) {
    if (err instanceof UserNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof AlreadyVerifiedError) return res.status(409).json({ error: { code: "ALREADY_VERIFIED", message: err.message } });
    if (err instanceof TooManyAttemptsError) return res.status(429).json({ error: { code: "TOO_MANY_ATTEMPTS", message: err.message } });
    if (err instanceof InvalidOtpError) return res.status(400).json({ error: { code: "INVALID_OTP", message: err.message } });
    next(err);
  }
});

const resendSchema = z.object({ email: z.string().email() });

router.post("/resend-verification", async (req, res, next) => {
  const parsed = resendSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const verification = await resendEmailVerificationCode(req.db!, parsed.data.email);
    deliverEmailVerification(parsed.data.email, verification.otp, verification.linkToken);
    res.json({
      data: {
        sent: true,
        ...(process.env.NODE_ENV !== "production"
          ? { debug_otp: verification.otp, debug_verify_link_token: verification.linkToken }
          : {}),
      },
    });
  } catch (err) {
    if (err instanceof UserNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof AlreadyVerifiedError) return res.status(409).json({ error: { code: "ALREADY_VERIFIED", message: err.message } });
    if (err instanceof ResendTooSoonError) {
      res.set("Retry-After", String(err.retryAfterSeconds));
      return res.status(429).json({ error: { code: "RESEND_TOO_SOON", message: err.message, retry_after_seconds: err.retryAfterSeconds } });
    }
    next(err);
  }
});

router.get("/check-verification-status", async (req, res, next) => {
  const email = typeof req.query.email === "string" ? req.query.email : undefined;
  if (!email) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "email query param is required" } });
  }
  try {
    const status = await getVerificationStatus(req.db!, email);
    res.json({ data: status });
  } catch (err) {
    if (err instanceof UserNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    next(err);
  }
});

// The link-click counterpart to /verify-email-otp - a token with no email,
// looked up directly (see emailVerification.repository.ts's
// findActiveCodeByLinkTokenHash).
router.get("/verify-email", async (req, res, next) => {
  const token = typeof req.query.token === "string" ? req.query.token : undefined;
  if (!token) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "token query parameter is required" } });
  }
  try {
    await confirmEmailVerificationLink(req.db!, token);
    res.json({ data: { email_verified: true } });
  } catch (err) {
    if (err instanceof InvalidOtpError) return res.status(400).json({ error: { code: "INVALID_TOKEN", message: err.message } });
    next(err);
  }
});

const deviceOtpSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
});

// Backs both verifyIdentityByOtp and verifyDeviceByOtp in auth.api.js - same
// endpoint, two frontend names. Completes the login /auth/login deferred:
// returns the same { token, user } shape login does, since this is the
// second half of that interrupted request, not a separate action.
router.post("/auth/verify-device", async (req, res, next) => {
  const parsed = deviceOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const user = await confirmDeviceOtp(req.db!, parsed.data);
    const { accessToken, refreshToken } = await issueNewSession(req.db!, user.id);
    setRefreshCookie(res, refreshToken);
    res.json({ data: { token: accessToken, user: { id: user.id, email: user.email, medgram_id: user.medgram_id } } });
  } catch (err) {
    if (err instanceof DeviceUserNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof NoPendingVerificationError) return res.status(400).json({ error: { code: "NO_PENDING_VERIFICATION", message: err.message } });
    if (err instanceof DeviceTooManyAttemptsError) return res.status(429).json({ error: { code: "TOO_MANY_ATTEMPTS", message: err.message } });
    if (err instanceof DeviceInvalidOtpError) return res.status(400).json({ error: { code: "INVALID_OTP", message: err.message } });
    next(err);
  }
});

router.post("/auth/verify-device/resend", async (req, res, next) => {
  const parsed = resendSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const code = await resendDeviceVerificationCode(req.db!, parsed.data.email);
    deliverVerificationCode(parsed.data.email, code);
    res.json({ data: { sent: true, ...(process.env.NODE_ENV !== "production" ? { debug_otp: code } : {}) } });
  } catch (err) {
    if (err instanceof DeviceUserNotFoundError) return res.status(404).json({ error: { code: "NOT_FOUND", message: err.message } });
    if (err instanceof NoPendingVerificationError) return res.status(400).json({ error: { code: "NO_PENDING_VERIFICATION", message: err.message } });
    if (err instanceof DeviceResendTooSoonError) {
      res.set("Retry-After", String(err.retryAfterSeconds));
      return res.status(429).json({ error: { code: "RESEND_TOO_SOON", message: err.message, retry_after_seconds: err.retryAfterSeconds } });
    }
    next(err);
  }
});

router.post("/auth/forgot-password", async (req, res, next) => {
  const parsed = resendSchema.safeParse(req.body); // same shape: { email }
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    const token = await requestPasswordReset(req.db!, parsed.data.email);
    if (token) {
      void sendEmail(
        parsed.data.email,
        "Reset your Medgram password",
        `Tap this link on your device to reset your password:\n${buildDeepLink("reset-password", token)}\n\nThis link expires in 60 minutes. If you didn't request this, you can ignore this email.`,
      );
    }
    // Same response whether the account exists, the request was rate-limited,
    // or a token was actually issued - see requestPasswordReset's comment on
    // why this endpoint must never let those cases be distinguished.
    res.json({
      data: {
        message: "If an account with that email exists, a reset link has been sent.",
        ...(process.env.NODE_ENV !== "production" && token ? { debug_reset_token: token } : {}),
      },
    });
  } catch (err) {
    next(err);
  }
});

// newPassword, not new_password: matches resetPassword's body in
// auth.api.js exactly - the one field in this API that isn't snake_case.
const resetPasswordSchema = z.object({ newPassword: z.string().min(8) });

router.post("/auth/reset-password", async (req, res, next) => {
  const token = typeof req.query.token === "string" ? req.query.token : undefined;
  if (!token) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "token query parameter is required" } });
  }
  const parsed = resetPasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    await resetPasswordWithToken(req.db!, { token, newPassword: parsed.data.newPassword });
    res.json({ data: { password_reset: true } });
  } catch (err) {
    if (err instanceof InvalidResetTokenError) {
      return res.status(400).json({ error: { code: "INVALID_RESET_TOKEN", message: err.message } });
    }
    next(err);
  }
});

// old_password / new_password: snake_case, unlike reset-password's
// newPassword - matches changePassword's body in auth.api.js exactly.
const changePasswordSchema = z.object({
  old_password: z.string().min(1),
  new_password: z.string().min(8),
});

router.post("/auth/change-password", loginRateLimiter, requireAuth, async (req, res, next) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    await changePassword(req.db!, req.user!.id, {
      oldPassword: parsed.data.old_password,
      newPassword: parsed.data.new_password,
    });
    // Every session (including this one's underlying refresh token, which
    // this route never sees - see changePassword's comment) is now revoked;
    // the access token used for this very request keeps working until it
    // expires (access-token revocation isn't implemented - a known gap
    // noted since the refresh-rotation work).
    res.json({ data: { password_changed: true } });
  } catch (err) {
    if (err instanceof IncorrectCurrentPasswordError) {
      return res.status(401).json({ error: { code: "INCORRECT_CURRENT_PASSWORD", message: err.message } });
    }
    next(err);
  }
});

// Authenticated: acts on the caller's own account, no email/enumeration
// concern the way forgot-password has.
router.put("/user/account/deactivate/request", requireAuth, async (req, res, next) => {
  try {
    const token = await requestDeactivation(req.db!, req.user!.id);
    if (token) {
      const user = await findUserById(req.db!, req.user!.id);
      if (user?.email) {
        void sendEmail(
          user.email,
          "Confirm Medgram account deactivation",
          `Tap this link on your device to confirm deactivating your account:\n${buildDeepLink("deactivate-account", token)}\n\nThis link expires in 24 hours. If you didn't request this, you can ignore this email.`,
        );
      }
    }
    res.json({
      data: {
        message: token
          ? "Check your email to confirm account deactivation."
          : "A confirmation link was already sent recently.",
        ...(process.env.NODE_ENV !== "production" && token ? { debug_deactivate_token: token } : {}),
      },
    });
  } catch (err) {
    if (err instanceof AccountAlreadyDeactivatedError) {
      return res.status(409).json({ error: { code: "ALREADY_DEACTIVATED", message: err.message } });
    }
    next(err);
  }
});

// Public, not requireAuth: authorized purely by the ?token= query param.
// deactivateAccount(token) in auth.api.js also sends this same opaque token
// as an Authorization: Bearer header, which fails JWT verification and is
// silently ignored by attachUserIfPresent (see that middleware's comment) -
// this route never reads req.user.
router.put("/user/account/deactivate", async (req, res, next) => {
  const token = typeof req.query.token === "string" ? req.query.token : undefined;
  if (!token) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "token query parameter is required" } });
  }
  try {
    const { userId, reactivationToken } = await confirmDeactivation(req.db!, token);
    const user = await findUserById(req.db!, userId);
    if (user?.email) {
      void sendEmail(
        user.email,
        "Your Medgram account has been deactivated",
        `Your account has been deactivated. If this wasn't you, or you'd like to reactivate within the next 30 days, tap this link on your device:\n${buildDeepLink("reactivate-account", reactivationToken)}`,
      );
    }
    res.json({
      data: {
        account_deactivated: true,
        ...(process.env.NODE_ENV !== "production" ? { debug_reactivation_token: reactivationToken } : {}),
      },
    });
  } catch (err) {
    if (err instanceof InvalidLifecycleTokenError) {
      return res.status(400).json({ error: { code: "INVALID_TOKEN", message: err.message } });
    }
    next(err);
  }
});

// Public, not requireAuth: reactivateAccount(token) in auth.api.js sends no
// Authorization header at all (a deactivated account has no valid session).
router.put("/user/account/reactivate", async (req, res, next) => {
  const token = typeof req.query.token === "string" ? req.query.token : undefined;
  if (!token) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "token query parameter is required" } });
  }
  try {
    await confirmReactivation(req.db!, token);
    res.json({ data: { account_reactivated: true } });
  } catch (err) {
    if (err instanceof InvalidLifecycleTokenError) {
      return res.status(400).json({ error: { code: "INVALID_TOKEN", message: err.message } });
    }
    next(err);
  }
});

router.get("/get-user", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.db!, req.user!.id);
    if (!user) return res.status(404).json({ error: { code: "NOT_FOUND", message: "User not found" } });
    res.json({ data: { id: user.id, email: user.email, medgram_id: user.medgram_id, account_status: user.account_status } });
  } catch (err) {
    next(err);
  }
});

// refreshToken() in auth.api.js takes no arguments and relies on
// credentials: "include" - the refresh token travels as the httpOnly cookie
// set by login/verify-device, never in the request body. Public (no
// requireAuth): the whole point is to mint a new access token when the old
// one has already expired.
router.post("/auth/refresh", async (req, res, next) => {
  const presented = getRefreshCookie(req);
  if (!presented) {
    return res.status(401).json({ error: { code: "NO_REFRESH_TOKEN", message: "No refresh token cookie present" } });
  }
  try {
    const { accessToken, refreshToken } = await rotateSession(req.db!, presented);
    setRefreshCookie(res, refreshToken);
    res.json({ data: { token: accessToken } });
  } catch (err) {
    if (err instanceof RefreshTokenReuseDetectedError) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: { code: "REFRESH_TOKEN_REUSE_DETECTED", message: err.message } });
    }
    if (err instanceof InvalidRefreshTokenError) {
      clearRefreshCookie(res);
      return res.status(401).json({ error: { code: "INVALID_REFRESH_TOKEN", message: err.message } });
    }
    next(err);
  }
});

// Revokes only the current session's refresh token, not every session this
// user has - logging out on one device shouldn't sign out their others.
router.post("/auth/logout", requireAuth, async (req, res, next) => {
  try {
    const presented = getRefreshCookie(req);
    if (presented) await revokeSession(req.db!, presented);
    clearRefreshCookie(res);
    res.json({ data: { logged_out: true } });
  } catch (err) {
    next(err);
  }
});

// No currency-rates table/service exists - this is static reference data,
// hardcoded rather than invented as a fake "supported currencies" table.
const SUPPORTED_CURRENCIES = ["USD", "EUR", "GBP", "NGN", "KES", "GHS", "ZAR"];

router.get("/users/supported-currencies", (_req, res) => {
  res.json({ data: SUPPORTED_CURRENCIES });
});

router.get("/users/currency", requireAuth, async (req, res, next) => {
  try {
    const user = await findUserById(req.db!, req.user!.id);
    res.json({ data: { currency_code: user?.active_currency_code ?? "USD" } });
  } catch (err) {
    next(err);
  }
});

router.get("/users/currency/history", requireAuth, async (req, res, next) => {
  try {
    res.json(await listCurrencyHistory(req.db!, req.user!.id));
  } catch (err) {
    next(err);
  }
});

const updateCurrencySchema = z.object({
  currency_code: z.enum(SUPPORTED_CURRENCIES as [string, ...string[]]),
});

router.post("/users/currency", requireAuth, async (req, res, next) => {
  const parsed = updateCurrencySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    await setActiveCurrency(req.db!, req.user!.id, parsed.data.currency_code);
    await insertCurrencyHistory(req.db!, req.user!.id, parsed.data.currency_code);
    res.json({ data: { currency_code: parsed.data.currency_code } });
  } catch (err) {
    next(err);
  }
});

router.get("/organizations", async (req, res, next) => {
  const limit = Math.min(Number(req.query.limit) || 100, 500);
  try {
    res.json(await listOrganizations(req.db!, limit));
  } catch (err) {
    next(err);
  }
});

const createRoleSchema = z.object({
  role_type: z.enum(["patient", "professional", "admin"]),
  organization_id: z.string().uuid().nullable().optional(),
});

router.post("/roles/create", requireAuth, async (req, res, next) => {
  const parsed = createRoleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    await insertUserRole(req.db!, {
      userId: req.user!.id,
      roleType: parsed.data.role_type,
      organizationId: parsed.data.organization_id ?? null,
    });
    res.status(201).json({ data: { role_type: parsed.data.role_type, organization_id: parsed.data.organization_id ?? null } });
  } catch (err) {
    if (isUniqueViolation(err, "user_roles_user_id_role_type_organization_id_key") || isUniqueViolation(err, "idx_user_roles_global_unique")) {
      return res.status(409).json({ error: { code: "ROLE_ALREADY_EXISTS", message: "You already have this role" } });
    }
    next(err);
  }
});

const addPhoneSchema = z.object({ phone_number: z.string().min(1) });

router.put("/sms/add-phone", requireAuth, async (req, res, next) => {
  const parsed = addPhoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    await addPhone(req.db!, req.user!.id, parsed.data.phone_number);
    res.json({ data: { phone_number: parsed.data.phone_number } });
  } catch (err) {
    if (err instanceof PhoneAlreadyInUseError) return res.status(409).json({ error: { code: "PHONE_TAKEN", message: err.message } });
    next(err);
  }
});

router.post("/sms/verify-phone", requireAuth, async (req, res, next) => {
  try {
    const otp = await requestPhoneVerification(req.db!, req.user!.id);
    console.log(`[sms] phone verification code for user ${req.user!.id}: ${otp}`);
    res.json({ data: { sent: true, ...(process.env.NODE_ENV !== "production" ? { debug_otp: otp } : {}) } });
  } catch (err) {
    if (err instanceof NoPhoneOnFileError) return res.status(400).json({ error: { code: "NO_PHONE_ON_FILE", message: err.message } });
    if (err instanceof PhoneResendTooSoonError) {
      res.set("Retry-After", String(err.retryAfterSeconds));
      return res.status(429).json({ error: { code: "RESEND_TOO_SOON", message: err.message, retry_after_seconds: err.retryAfterSeconds } });
    }
    next(err);
  }
});

const confirmPhoneSchema = z.object({ code: z.string().length(6) });

router.post("/sms/confirm-phone", requireAuth, async (req, res, next) => {
  const parsed = confirmPhoneSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: { code: "VALIDATION_ERROR", message: "Invalid request body", details: parsed.error.issues } });
  }
  try {
    await confirmPhoneOtp(req.db!, req.user!.id, parsed.data.code);
    res.json({ data: { phone_verified: true } });
  } catch (err) {
    if (err instanceof PhoneTooManyAttemptsError) return res.status(429).json({ error: { code: "TOO_MANY_ATTEMPTS", message: err.message } });
    if (err instanceof PhoneInvalidOtpError) return res.status(400).json({ error: { code: "INVALID_OTP", message: err.message } });
    next(err);
  }
});

// GET /communities/my is intentionally NOT registered here even though
// auth.api.js's getUserCommunities calls it - it's the same backend endpoint
// community.api.js's getMyCommunities calls, and is registered once in the
// community module instead of twice.
//
// Every endpoint in api/auth.api.js now has a real handler above - the
// stub-list machinery that used to live here (a table-driven loop of
// notImplemented() placeholders) has been fully replaced.

export default router;
