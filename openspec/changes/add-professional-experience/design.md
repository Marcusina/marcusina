## Context

`CNS-16`'s `PatientChartQuickViewScreen` (in `ConsultationScreens.js`) already renders a `MOCK_PATIENT_CHART` (name, age, blood type, allergies, medications, vitals) during a live consult, with a "View Full Chart" button that currently just toasts "coming soon." That's the natural entry point into `PRO-02`. Pro-mode gating everywhere else in the app (`ProfileScreen.js` line 365) uses `profile.role && profile.role !== "patient"` — a plain conditional, no separate mode-switch state — `frontend.md`'s own note that "these screens appear only in Professional Mode (`SHL-06`)" should be read as "gated by role," matching how the rest of the codebase actually implements Pro-only screens (there is no `SHL-06` mode switcher built yet either).

## Goals / Non-Goals

**Goals:**
- A professional can see their patient roster, open a patient's full authorized chart, browse their own clinical notes, and view their own analytics.
- Patient-chart access is authorization-gated: only patients with an actual care relationship (past/upcoming consultation) to that professional are visible.

**Non-Goals:**
- Building a new authorization/consent backend model from scratch — this change assumes the backend can answer "which patients does professional X have an authorized relationship with," and if that endpoint doesn't exist, the roster ships as a clearly-labeled placeholder pending backend support rather than fabricating patient data (real PHI must never be mocked visibly as if real).
- `SHL-06` Patient/Professional mode switcher UI — out of scope; this change gates on role, not on a mode-switch flag, consistent with how the rest of the app already does it.
- Radiologist/lab-scientist bulk workflows — `frontend.md` explicitly places those in MedGram OS, not here.

## Decisions

- **New screens live in `screens/ProfessionalScreens.js`**, one file per module per the app's convention.
- **`PRO-02` Patient Chart reuses `CNS-16`'s data shape** (allergies, medications, vitals, plus whatever the full authorized record adds — diagnoses, visit history) rather than inventing a parallel patient-data model; `CNS-16`'s "View Full Chart" button navigates here with the same patient identifier already in its route params.
- **`PRO-03` Clinical Notes library reads from the same notes created via `CNS-15`**'s in-consultation documentation panel (already built) — this change is the "library" view over that existing data, not a new authoring surface.
- **Authorization check happens server-side, not just hidden in the UI** — the roster/chart fetch functions must be scoped by the backend to only the requesting professional's authorized patients; this is called out explicitly because patient chart data is sensitive PHI and a client-side-only filter would be a real security gap, not just a UX nicety.
- **Gating uses the existing `profile.role !== "patient"` conditional**, applied at the navigation-entry-point level (e.g. hidden nav card/tab), not a route guard that still lets a direct deep-link through — matches how `ProfileScreen.js` already does it, and keeps this change's footprint to "add screens + gate their entry points," not "build a new auth layer."

## Risks / Trade-offs

- [No backend endpoint yet for "patients authorized to professional X"] → Confirmed by reading `Telemedicine-nodejs-backend/src/domains/**` directly: no "professional"/"patients"/"clinicalNotes" domain exists at all. `api/professional.api.js` documents the intended contract; every screen shows an explicit "pending backend support" empty state on failure, never fabricated patient data.
- [Patient chart is sensitive data — client-side-only gating would be insufficient] → `PatientChartScreen` distinguishes a `403`/"forbidden" response (real denial, shown as "Access denied") from any other failure (treated as "not connected yet"), so it's ready for server-side authorization the moment the backend adds it - but enforcement itself must land on the backend; the frontend cannot substitute for it.
- [Clinical notes library duplicating `CNS-15`'s data model if the shapes drift] → Reading `ClinicalDocumentationScreen` (`CNS-15`) directly found its "Save Note" button was itself a `toast.success` no-op with no persistence at all - there was no real schema to match. Rewired it to call the same `createClinicalNote` function `ClinicalNotesLibraryScreen` reads from, so both ends of the seam share one (currently not-yet-backed) contract instead of one being fake and the other guessing at its shape.

## Migration Plan

1. Add `api/professional.api.js` with `getMyPatients()`, `getPatientChart(patientId)`, `getMyClinicalNotes()`, `getMyAnalytics()`.
2. Build `screens/ProfessionalScreens.js`: `MyPatientsScreen`, `PatientChartScreen`, `ClinicalNotesLibraryScreen`, `ProfessionalAnalyticsScreen`.
3. Rewire `PatientChartQuickViewScreen`'s "View Full Chart" button to `navigate("PatientChart", { patientId })`.
4. Register routes, gated by `profile.role !== "patient"` at each entry point.
5. Manual smoke test with a professional-role account: My Patients → patient chart → clinical notes library → analytics; confirm a patient-role account cannot reach any of it.
