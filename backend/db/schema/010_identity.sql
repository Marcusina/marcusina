-- Organizations: clinics, insurers, employers, pharmacies, lab networks.
-- Owns roles, communities, inventories, lab centers -- never owns PHI directly.
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  org_type TEXT NOT NULL CHECK (org_type IN ('clinic','insurer','employer','pharmacy','lab_network')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- The account. account_status drives auth.api.js suspend/deactivate/reactivate.
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE,
  phone_number TEXT UNIQUE,
  password_hash TEXT,
  google_id TEXT UNIQUE,
  medgram_id TEXT UNIQUE NOT NULL,
  account_status TEXT NOT NULL DEFAULT 'pending_verification'
    CHECK (account_status IN ('pending_verification','active','suspended','deactivated','reactivation_pending')),
  email_verified_at TIMESTAMPTZ,
  phone_verified_at TIMESTAMPTZ,
  active_currency_code TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT users_has_identifier CHECK (email IS NOT NULL OR phone_number IS NOT NULL)
);
CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE currency_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  currency_code TEXT NOT NULL,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_currency_history_user ON currency_history(user_id, changed_at DESC);

-- A user can hold multiple roles across multiple orgs (e.g. patient globally,
-- professional at one clinic). organization_id NULL matches
-- createRole(role_type, organization_id || null) in auth.api.js.
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK (role_type IN ('patient','professional','admin')),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role_type, organization_id)
);
CREATE INDEX idx_user_roles_user ON user_roles(user_id);
CREATE INDEX idx_user_roles_org ON user_roles(organization_id) WHERE organization_id IS NOT NULL;
-- The UNIQUE(user_id, role_type, organization_id) constraint above does NOT
-- stop duplicate global roles: Postgres treats every NULL as distinct, so
-- two (user_id, 'patient', NULL) rows would not violate it. This closes that
-- gap for the organization_id IS NULL case specifically.
CREATE UNIQUE INDEX idx_user_roles_global_unique ON user_roles(user_id, role_type)
  WHERE organization_id IS NULL;

-- General profile (profiles/update, profiles/create).
CREATE TABLE profiles (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  bio TEXT,
  gender TEXT,
  date_of_birth DATE,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  timezone TEXT NOT NULL DEFAULT 'UTC',
  location_address TEXT,
  location_country TEXT,
  location_state TEXT,
  location_city TEXT,
  postal_code TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Patient clinical profile (profiles/patient/:userId). PHI.
CREATE TABLE patient_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  blood_group TEXT,
  height_cm NUMERIC(5,2),
  weight_kg NUMERIC(5,2),
  known_allergies TEXT[],
  chronic_conditions TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_patient_profiles_updated_at BEFORE UPDATE ON patient_profiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Queued identity actions: identity.api.js documents that recover,
-- replace-card, merge, and device-transfer are never auto-completed --
-- they land here with status 'pending' for manual/async resolution.
-- suspend/reissue are immediate and only touch users.account_status.
CREATE TABLE identity_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_type TEXT NOT NULL CHECK (request_type IN ('recover','replace_card','merge','device_transfer')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','completed')),
  payload JSONB NOT NULL DEFAULT '{}',
  resolved_by UUID REFERENCES users(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_identity_requests_user ON identity_requests(user_id, status);
CREATE INDEX idx_identity_requests_pending ON identity_requests(status) WHERE status = 'pending';

-- Backs identity/scan and identity/verification-history.
CREATE TABLE identity_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  method TEXT NOT NULL,
  result TEXT NOT NULL CHECK (result IN ('success','failure')),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_identity_verifications_user ON identity_verifications(user_id, created_at DESC);

-- Step-up auth for sensitive actions (sudo/request, sudo/verify, sudo/status).
CREATE TABLE sudo_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action_name TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  verified_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_sudo_requests_user_active ON sudo_requests(user_id) WHERE verified_at IS NULL;
