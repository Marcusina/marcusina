-- Backs POST /verify-email-otp, POST /resend-verification, and
-- GET /check-verification-status in auth.api.js. Numbered between identity
-- (010) and healthcare (020) so a fresh database still applies it before
-- 900_rls.sql's schema-wide GRANT/ALTER DEFAULT PRIVILEGES - a database that
-- already applied 010-900 picks this up on its next `npm run migrate` run
-- regardless of the numeric gap, since migrate.ts applies whatever isn't yet
-- in schema_migrations.
CREATE TABLE email_verification_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
-- Powers "find the active code for this user" (verify/resend) without
-- scanning consumed history.
CREATE INDEX idx_email_verification_codes_active ON email_verification_codes(user_id, created_at DESC)
  WHERE consumed_at IS NULL;
