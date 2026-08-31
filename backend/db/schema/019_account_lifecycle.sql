-- Backs PUT /user/account/deactivate/request, PUT /user/account/deactivate,
-- and PUT /user/account/reactivate in auth.api.js. Same opaque-link-token
-- shape as password_reset_tokens (018) - purpose distinguishes the two
-- flows sharing this table rather than duplicating an identical schema
-- twice for what's structurally the same primitive.
--
-- There's no "request reactivation" endpoint in auth.api.js -
-- reactivateAccount(token) only ever consumes a token, never requests one.
-- The only self-consistent reading is that a reactivation token is issued
-- automatically the moment deactivation completes (see accountLifecycle
-- .service.ts's confirmDeactivation), not on-demand - this is an inference
-- from the given frontend contract, not something it states explicitly.
CREATE TABLE account_lifecycle_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  purpose TEXT NOT NULL CHECK (purpose IN ('deactivate', 'reactivate')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_account_lifecycle_tokens_active
  ON account_lifecycle_tokens(user_id, purpose, created_at DESC)
  WHERE consumed_at IS NULL;
