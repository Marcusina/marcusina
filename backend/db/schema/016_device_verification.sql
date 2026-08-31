-- Backs the "new/unrecognized device" login step-up: POST /auth/verify-device
-- and POST /auth/verify-device/resend in auth.api.js. auth.api.js's
-- verifyIdentityByOtp and verifyDeviceByOtp both call this exact same
-- endpoint - one backend flow behind two frontend names.
--
-- Device identity here is a hash of the X-Device-Id request header when the
-- client sends one, falling back to a hash of User-Agent otherwise (see
-- lib/deviceFingerprint.ts) - the frontend today sends neither a device id
-- nor any identifier at all to /auth/login or /auth/verify-device, so
-- User-Agent is the only signal available without a frontend change.
-- User-Agent alone is a WEAK fingerprint: many users on the same browser/OS
-- version are indistinguishable by it, so this under-flags shared devices as
-- "new" less than it should and, more importantly, doesn't actually
-- distinguish two different attacker devices with the same UA string from
-- each other. The concrete fix is on the frontend: the app already depends
-- on expo-secure-store (see package.json) - generate a random UUID once,
-- persist it there, and send it as X-Device-Id on every request. This
-- schema and the fingerprint helper already prefer that header the moment
-- it shows up.
CREATE TABLE trusted_devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fingerprint_hash TEXT NOT NULL,
  first_trusted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, fingerprint_hash)
);

CREATE TABLE device_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  -- The fingerprint pending trust, captured from the /auth/login request
  -- that triggered this challenge - not necessarily the same request that
  -- later completes /auth/verify-device (checking email on a different
  -- device than the one being verified is a normal, expected pattern).
  fingerprint_hash TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_device_verification_codes_active ON device_verification_codes(user_id, created_at DESC)
  WHERE consumed_at IS NULL;
