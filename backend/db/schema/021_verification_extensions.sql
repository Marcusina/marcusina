-- Backs three things added when finishing the remaining auth.api.js stubs:
--
-- 1. GET /verify-email?token=... (verifyEmail) is a DIFFERENT shape than
--    POST /verify-email-otp: it carries only a token, no email - meaning
--    the backend must find the pending verification by the token alone,
--    with no lookup-by-email step first. A 6-digit OTP isn't safe to look
--    up that way (many users could coincidentally share a code at once).
--    So this adds a second, high-entropy opaque token to the SAME pending
--    row an email_verification_codes OTP already represents - the emailed
--    message can carry a clickable link with this token AND the typed
--    code side by side, and whichever the user completes first consumes
--    the row. Reuses the existing expiry/attempts state machine rather
--    than duplicating a parallel table.
ALTER TABLE email_verification_codes ADD COLUMN link_token_hash TEXT UNIQUE;

-- 2. Phone verification (sms/verify-phone, sms/confirm-phone) - the exact
--    same shape as email_verification_codes, just for phone_number instead
--    of email (users.phone_verified_at already exists from 010_identity.sql).
CREATE TABLE phone_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_phone_verification_codes_active ON phone_verification_codes(user_id, created_at DESC)
  WHERE consumed_at IS NULL;

-- 3. sudo_requests (010_identity.sql) shipped without an attempts counter,
--    unlike every other OTP table added later this session - bringing it
--    up to the same lockout bar rather than leaving step-up auth as the one
--    brute-forceable OTP flow in the system.
ALTER TABLE sudo_requests ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
