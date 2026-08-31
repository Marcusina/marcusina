-- Backs POST /auth/refresh (refreshToken in auth.api.js). apiClient.js sets
-- credentials: "include" and refreshToken() takes no arguments - the refresh
-- token lives in an httpOnly cookie, not a request body (see
-- session.service.ts).
--
-- Rotation with reuse detection (standard practice - see OAuth 2.0 Security
-- Best Current Practice, and Auth0/Okta's public writeups on refresh token
-- rotation): every successful refresh revokes the presented token and
-- issues a new one sharing the same family_id. If a token that's already
-- revoked gets presented again, that's a replay of a token that was already
-- rotated away - a strong signal it was stolen and used out of order - so
-- the entire family is revoked, forcing re-login on every session
-- descended from that chain, not just the one being replayed.
--
-- token_hash is SHA-256, not bcrypt: a refresh token is a 256-bit random
-- value, not a guessable secret like a password or a 6-digit OTP, so
-- bcrypt's slow-hash property (defeating brute force of a small keyspace)
-- doesn't apply - a fast deterministic hash is exactly what direct-lookup-
-- by-hash needs.
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL UNIQUE,
  family_id UUID NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);
-- Powers revokeFamily's UPDATE ... WHERE family_id = $1 AND revoked_at IS NULL.
CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(family_id);

-- No pruning job exists in this scaffold - expired/revoked rows accumulate
-- indefinitely. A periodic DELETE FROM refresh_tokens WHERE expires_at <
-- now() - interval '90 days' is the concrete follow-up before this ships.
