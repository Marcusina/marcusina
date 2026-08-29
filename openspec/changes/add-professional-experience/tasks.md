## 1. API layer

- [x] 1.1 Confirm/create a backend endpoint answering "which patients does professional X have an authorized relationship with"; if unavailable, plan for an explicit "pending backend support" state
- [x] 1.2 Create `api/professional.api.js` with `getMyPatients()`, `getPatientChart(patientId)`, `getMyClinicalNotes()`, `getMyAnalytics()`
- [x] 1.3 Confirm the notes schema `CNS-15`'s documentation panel already writes, so `getMyClinicalNotes()` reads the same shape

## 2. Screens

- [x] 2.1 Create `screens/ProfessionalScreens.js` with `MyPatientsScreen`
- [x] 2.2 Add `PatientChartScreen`, reusing the data shape from `CNS-16`'s `MOCK_PATIENT_CHART` plus full-record fields
- [x] 2.3 Add `ClinicalNotesLibraryScreen`
- [x] 2.4 Add `ProfessionalAnalyticsScreen`

## 3. Wire the existing seam

- [x] 3.1 Rewire `PatientChartQuickViewScreen`'s "View Full Chart" button in `screens/ConsultationScreens.js` to `navigate("PatientChart", { patientId })` instead of the current `toast.info` no-op

## 4. Navigation and gating

- [x] 4.1 Register all new routes in `navigation/MainStack.js` and/or `navigation/stacks/MeStack.js`
- [x] 4.2 Gate each entry point with `profile.role && profile.role !== "patient"`, matching `screens/ProfileScreen.js`'s existing pattern

## 5. Verify

- [ ] 5.1 Manual walkthrough with a professional-role account: My Patients → patient chart → clinical notes library → analytics
- [ ] 5.2 Confirm a patient-role account cannot see any `PRO` entry points
- [ ] 5.3 Confirm attempting to open a chart for a patient outside the professional's authorized roster is denied

Note on 1.1 and 1.3 (original, now superseded): reading `Telemedicine-nodejs-backend/src/domains/**/*.routes.js` directly found zero backend support for this entire module at the time these screens were built, and found `ClinicalDocumentationScreen`'s existing "Save Note" button was itself a `toast.success` no-op with no real persistence.

**Backend now implemented** (separate work session, same day): added `Telemedicine-nodejs-backend/src/domains/professional/*` (routes/controller/service) and a new `ClinicalNote` Prisma model. "My Patients" and "My Analytics" are computed live from real `Appointment` rows rather than a materialized table (no cache-invalidation problem, no read-volume justification for one yet). Authorization is enforced server-side, not just hidden in the UI: `assertAuthorizedRelationship` requires an actual appointment between the professional and the patient before the chart or notes can be read/written, returning a real 403 otherwise - `PatientChartScreen`'s existing 403-vs-other-failure branching (built speculatively before the backend existed) now exercises a real code path. `ClinicalDocumentationScreen`'s save button was rewired to the same `createClinicalNote` the library reads from, so both ends of that seam share one real contract.

**Verified via a full local run**: local Postgres + migration + `npm run dev`, then drove the full flow with curl using a doctor and a patient account with a real appointment between them - `getMyPatients` correctly lists the patient with a real "last visit" date; `getPatientChart` succeeds for the authorized patient and correctly 403s for a patient with no relationship; `createClinicalNote`/`getMyClinicalNotes` round-trip a real note; `getMyAnalytics` returns real computed counts (`patients_seen`, `upcoming_appointments`, `notes_authored` all matched what was actually in the DB); a patient-role account is correctly 403'd on every `/professional/*` route.

## 6. Verify (added after backend implementation)

- [ ] 6.1 Manual browser/device walkthrough of all screens - not done. The API-level verification above (curl, real DB) confirms the backend contract, authorization boundaries, and response shapes are all correct, but no headless browser was available in this sandbox to actually click through the React Native UI, so this is a different, still-open verification step from 5.1-5.3 above.
