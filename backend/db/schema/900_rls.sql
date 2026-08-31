-- Row-Level Security for PHI tables only.
--
-- Deliberately NOT org_id-based: org membership does not imply authorization
-- to view a patient's PHI (HIPAA minimum-necessary standard). Access is
-- relationship-based -- a professional sees a patient's PHI only through an
-- actual appointment, or an explicit consent grant -- mirroring
-- assertAuthorizedRelationship in the existing backend's
-- professional.service.js. Non-PHI, org-owned tables (communities,
-- inventories, lab_centers, medications) are scoped by plain app-layer
-- queries instead; blanket org_id RLS on those is unnecessary at this scale.
--
-- Every request handler must run, inside the same transaction as the query:
--   SET LOCAL app.current_user_id = '<uuid>';
-- A background/admin worker uses the medgram_admin role (BYPASSRLS) instead
-- of impersonating a user id, so a bug in current_user_id can never leak
-- cross-patient data to an ordinary request handler.
--
-- IMPORTANT: a table's OWNER bypasses RLS by default, regardless of policies
-- -- ENABLE ROW LEVEL SECURITY alone is not enough if the app connects as
-- the same role that ran these migrations. Two things close that gap here:
-- (1) the app must connect as medgram_app, a role distinct from whichever
--     role owns these tables (e.g. medgram_migrator), and
-- (2) FORCE ROW LEVEL SECURITY on every PHI table below, so even a future
--     connection-pool misconfiguration that reuses the owner role still
--     gets enforced.

-- Table-level GRANT and row-level RLS are two separate gates: GRANT decides
-- whether medgram_app can touch a table AT ALL, RLS (below) decides WHICH
-- ROWS it sees once it can. medgram_app needs broad table-level access
-- (users, profiles, medications, carts, ... none of which have RLS) --
-- the PHI tables are exactly the ones where RLS then narrows it further.
CREATE ROLE medgram_admin BYPASSRLS;
CREATE ROLE medgram_app NOBYPASSRLS;
GRANT USAGE ON SCHEMA public TO medgram_app, medgram_admin;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO medgram_app, medgram_admin;
-- Covers tables created by later migrations too, so this grant doesn't have
-- to be remembered and re-run by hand every time a new table is added.
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO medgram_app, medgram_admin;

ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles FORCE ROW LEVEL SECURITY;
-- Split read from write: the patient can read/write their own row. A
-- professional with an active appointment gets READ ONLY access -- they
-- need blood group/allergies to prescribe safely, but must never overwrite
-- a patient's own clinical profile. Multiple permissive SELECT policies
-- combine with OR, so both grants apply to SELECT while only the first
-- applies to INSERT/UPDATE/DELETE.
CREATE POLICY patient_profiles_self_write ON patient_profiles
  FOR ALL
  USING (user_id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (user_id = current_setting('app.current_user_id')::uuid);
-- status <> 'cancelled': a cancelled appointment means the visit never
-- happened, so it shouldn't grant an ongoing treating relationship - without
-- this, a patient cancelling their only appointment with a professional
-- would still leave that professional with indefinite chart-read access.
CREATE POLICY patient_profiles_professional_read ON patient_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = patient_profiles.user_id
        AND a.professional_id = current_setting('app.current_user_id')::uuid
        AND a.status <> 'cancelled'
    )
  );

ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments FORCE ROW LEVEL SECURITY;
CREATE POLICY appointments_participant ON appointments
  USING (
    patient_id = current_setting('app.current_user_id')::uuid
    OR professional_id = current_setting('app.current_user_id')::uuid
  );

-- Write restricted to the authoring professional (fixes a real gap in the
-- original combined policy: without a FOR clause, USING doubled as WITH
-- CHECK, and "patient_id = caller" alone was enough to satisfy an INSERT --
-- a patient could have written a fake prescription row naming themselves as
-- patient_id before this was ever exercised by real code). Read is broadened
-- to any professional with an active appointment relationship to the
-- patient, same as patient_profiles -- continuity of care: a chart must not
-- silently omit another provider's active prescription. See the
-- "professional module" chart-scope decision this was built against.
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions FORCE ROW LEVEL SECURITY;
-- WITH CHECK additionally requires an active relationship with the PATIENT,
-- not just "the row claims to be authored by me" - without this, a
-- professional could write a prescription for a patient they've never
-- treated. USING (for existing-row SELECT/UPDATE/DELETE) stays
-- relationship-free deliberately: a prescription's author should still be
-- able to see/manage it later even if the underlying appointment is later
-- cancelled or the relationship otherwise lapses.
CREATE POLICY prescriptions_author_write ON prescriptions
  FOR ALL
  USING (professional_id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (
    professional_id = current_setting('app.current_user_id')::uuid
    AND EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = prescriptions.patient_id
        AND a.professional_id = current_setting('app.current_user_id')::uuid
        AND a.status <> 'cancelled'
    )
  );
CREATE POLICY prescriptions_patient_read ON prescriptions
  FOR SELECT
  USING (patient_id = current_setting('app.current_user_id')::uuid);
-- Needed for POST /prescriptions/:id/refill and PATCH
-- /prescriptions/:id/reminder (requestRefill, updatePrescriptionReminder in
-- meds.api.js): the patient must be able to update their own prescription's
-- status/reminder_schedule. Same RLS-can't-restrict-columns situation as
-- lab_orders_patient_write - the app layer (meds.service.ts) is responsible
-- for only ever setting those two columns.
CREATE POLICY prescriptions_patient_write ON prescriptions
  FOR UPDATE
  USING (patient_id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (patient_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY prescriptions_treating_professional_read ON prescriptions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = prescriptions.patient_id
        AND a.professional_id = current_setting('app.current_user_id')::uuid
        AND a.status <> 'cancelled'
    )
  );

-- Same write/read split and same reasoning as prescriptions above.
ALTER TABLE lab_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_orders FORCE ROW LEVEL SECURITY;
-- Same relationship-in-WITH-CHECK reasoning as prescriptions above.
CREATE POLICY lab_orders_orderer_write ON lab_orders
  FOR ALL
  USING (ordering_professional_id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (
    ordering_professional_id = current_setting('app.current_user_id')::uuid
    AND EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = lab_orders.patient_id
        AND a.professional_id = current_setting('app.current_user_id')::uuid
        AND a.status <> 'cancelled'
    )
  );
CREATE POLICY lab_orders_patient_read ON lab_orders
  FOR SELECT
  USING (patient_id = current_setting('app.current_user_id')::uuid);
-- Needed for PATCH /labs/orders/:orderId/center (selectLabCenter in
-- labs.api.js): a patient must be able to set their own order's center_id.
-- RLS can't restrict this to "only the center_id and status columns" -
-- column-level restriction isn't a thing RLS does - so the app layer
-- (labs.service.ts) is responsible for only ever setting those two columns
-- in the UPDATE it issues, the same way patient_profiles_self_write already
-- trusts the app layer's UPDATE shape rather than restricting columns here.
CREATE POLICY lab_orders_patient_write ON lab_orders
  FOR UPDATE
  USING (patient_id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (patient_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY lab_orders_treating_professional_read ON lab_orders
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = lab_orders.patient_id
        AND a.professional_id = current_setting('app.current_user_id')::uuid
        AND a.status <> 'cancelled'
    )
  );

-- No write path here at the app layer at all (populated by async result
-- ingestion via the medgram_admin BYPASSRLS role - see
-- 020_healthcare.sql) -- a single combined policy is correct, unlike
-- prescriptions/lab_orders which need author-vs-any-treating-professional
-- write/read separation.
ALTER TABLE lab_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE lab_results FORCE ROW LEVEL SECURITY;
CREATE POLICY lab_results_access ON lab_results
  USING (
    EXISTS (
      SELECT 1 FROM lab_orders o
      WHERE o.id = lab_results.lab_order_id
        AND (
          o.patient_id = current_setting('app.current_user_id')::uuid
          OR o.ordering_professional_id = current_setting('app.current_user_id')::uuid
          OR EXISTS (
            SELECT 1 FROM appointments a
            WHERE a.patient_id = o.patient_id
              AND a.professional_id = current_setting('app.current_user_id')::uuid
              AND a.status <> 'cancelled'
          )
        )
    )
  );

-- Patient-only for now, deliberately -- unlike patient_profiles there's no
-- appointment-based read grant here. Open question: does billing/front-desk
-- staff at the treating org need eligibility/coverage visibility? Decide
-- that explicitly before launch rather than defaulting it open.
ALTER TABLE insurance_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE insurance_plans FORCE ROW LEVEL SECURITY;
CREATE POLICY insurance_owner ON insurance_plans
  USING (
    EXISTS (
      SELECT 1 FROM patient_profiles p
      WHERE p.id = insurance_plans.patient_profile_id
        AND p.user_id = current_setting('app.current_user_id')::uuid
    )
  );

-- Same write/read split as prescriptions/lab_orders. Patient read access is
-- preserved unchanged from the original combined policy (open-notes access
-- for the patient's own record was already intended, not new here).
ALTER TABLE clinical_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_notes FORCE ROW LEVEL SECURITY;
-- Same relationship-in-WITH-CHECK reasoning as prescriptions above.
CREATE POLICY clinical_notes_author_write ON clinical_notes
  FOR ALL
  USING (professional_id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (
    professional_id = current_setting('app.current_user_id')::uuid
    AND EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = clinical_notes.patient_id
        AND a.professional_id = current_setting('app.current_user_id')::uuid
        AND a.status <> 'cancelled'
    )
  );
CREATE POLICY clinical_notes_patient_read ON clinical_notes
  FOR SELECT
  USING (patient_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY clinical_notes_treating_professional_read ON clinical_notes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = clinical_notes.patient_id
        AND a.professional_id = current_setting('app.current_user_id')::uuid
        AND a.status <> 'cancelled'
    )
  );

-- Split write from read: only the GRANTOR can create/update/revoke a
-- consent - a grantee must never be able to write a row granting
-- themselves access. The original combined policy had the same class of
-- bug fixed for prescriptions/lab_orders/clinical_notes above: without a
-- FOR clause, "grantee_user_id = caller" alone satisfied WITH CHECK on
-- INSERT, so a grantee could have inserted a consent row naming any
-- granting_user_id and themselves as grantee, before this was ever
-- exercised by real code.
ALTER TABLE consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE consents FORCE ROW LEVEL SECURITY;
CREATE POLICY consents_owner_write ON consents
  FOR ALL
  USING (granting_user_id = current_setting('app.current_user_id')::uuid)
  WITH CHECK (granting_user_id = current_setting('app.current_user_id')::uuid);
CREATE POLICY consents_grantee_read ON consents
  FOR SELECT
  USING (grantee_user_id = current_setting('app.current_user_id')::uuid);
