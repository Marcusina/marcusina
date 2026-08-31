-- Catalog data: not PHI, readable by anyone (medications/all is unauthenticated
-- in meds.api.js).
CREATE TABLE medications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  currency_code TEXT NOT NULL DEFAULT 'USD',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_medications_search
  ON medications USING GIN (to_tsvector('english', name || ' ' || COALESCE(category, '')));

CREATE TABLE lab_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Source of truth for "does this professional have an authorized relationship
-- with this patient" -- referenced by the RLS policies in 900_rls.sql and
-- mirrors assertAuthorizedRelationship in the existing backend's
-- professional.service.js.
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'scheduled'
    CHECK (status IN ('scheduled', 'checked_in', 'completed', 'cancelled')),
  scheduled_start_time TIMESTAMPTZ NOT NULL,
  scheduled_end_time TIMESTAMPTZ NOT NULL,
  cancellation_reason TEXT,
  checkin_method TEXT,
  checkin_value TEXT,
  checked_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (scheduled_end_time > scheduled_start_time)
);
CREATE TRIGGER trg_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_appointments_patient ON appointments(patient_id, scheduled_start_time DESC);
CREATE INDEX idx_appointments_professional ON appointments(professional_id, scheduled_start_time DESC);
-- Powers getQueuePosition: checked-in appointments for the same provider/day.
CREATE INDEX idx_appointments_queue ON appointments(professional_id, checked_in_at)
  WHERE status = 'checked_in';

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES users(id),
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  medication_id UUID REFERENCES medications(id),
  dosage TEXT,
  instructions TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'refill_requested', 'fulfilled', 'expired')),
  reminder_schedule JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_prescriptions_patient ON prescriptions(patient_id, created_at DESC);

CREATE TABLE lab_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ordering_professional_id UUID NOT NULL REFERENCES users(id),
  center_id UUID REFERENCES lab_centers(id),
  order_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'center_selected', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_lab_orders_updated_at BEFORE UPDATE ON lab_orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE INDEX idx_lab_orders_patient ON lab_orders(patient_id, created_at DESC);

-- Kept separate from lab_orders (1:1, created once) so async result ingestion
-- from an external lab feed/webhook never partially-writes the order row.
CREATE TABLE lab_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lab_order_id UUID NOT NULL UNIQUE REFERENCES lab_orders(id) ON DELETE CASCADE,
  result_data JSONB NOT NULL,
  released_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE insurance_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_profile_id UUID NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  policy_number TEXT NOT NULL,
  coverage_details JSONB NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_insurance_patient_profile ON insurance_plans(patient_profile_id);

-- Scoped, revocable grant of access to one specific PHI resource (e.g. "share
-- this lab result with Dr. X"). Distinct from the appointment relationship,
-- which grants broad clinical access -- a consent grant is narrow and
-- resource-specific, matching grantConsent's payload in consent.api.js.
CREATE TABLE consents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  granting_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  grantee_user_id UUID REFERENCES users(id),
  resource_type TEXT NOT NULL,
  resource_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);
CREATE INDEX idx_consents_user ON consents(granting_user_id, status);
CREATE INDEX idx_consents_resource ON consents(resource_type, resource_id);

CREATE TABLE clinical_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES users(id),
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_clinical_notes_patient ON clinical_notes(patient_id, created_at DESC);
CREATE INDEX idx_clinical_notes_professional ON clinical_notes(professional_id, created_at DESC);
