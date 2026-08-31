-- Backs POST /auth/forgot-password and POST /auth/reset-password. Unlike
-- the OTP tables (015/016), this is a high-entropy opaque token delivered
-- via a link - auth.api.js's resetPassword reads it from a query string,
-- not a code a human types in - so there's no attempts counter here: brute
-- forcing 256 bits isn't a realistic attack the way guessing a 6-digit code
-- is. See lib/opaqueToken.ts, the same primitive refresh_tokens uses.
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_password_reset_tokens_active ON password_reset_tokens(user_id, created_at DESC)
  WHERE consumed_at IS NULL;
