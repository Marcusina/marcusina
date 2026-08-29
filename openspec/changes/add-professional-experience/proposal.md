## Why

`frontend.md` module 25 (`PRO`, Professional Experience) does not exist: no My Patients list, no Clinical Notes library, no Professional Analytics dashboard anywhere in the codebase. The only tangential coverage is `CNS-16`'s `PatientChartQuickViewScreen`, whose "View Full Chart" button is an explicit `toast.info("Full patient chart is coming soon.")` no-op — the seam this module is meant to fill. Professionals today have booking-request and availability screens (`CNS-13`/`14`) but no way to see their patient roster, review past clinical notes, or view their own analytics — the core value proposition for a verified professional using the app.

## What Changes

- Add `PRO-01` My Patients: list of patients the professional has an authorized relationship with (via past/upcoming consultations).
- Add `PRO-02` Patient Chart: the authorized, full view into a patient's shared record — replaces the current "coming soon" stub reached from `CNS-16`'s quick view.
- Add `PRO-03` Clinical Notes library: browsing notes the professional has authored (feeds from `CNS-15`'s in-consultation documentation panel, which already exists).
- Add `PRO-04` Professional Analytics dashboard.
- Gate all of the above behind the same `profile.role !== "patient"` pattern already used in `ProfileScreen.js`.

## Capabilities

### New Capabilities
- `professional-patient-roster`: Listing patients a professional has an authorized relationship with, and viewing a patient's full authorized chart.
- `professional-clinical-notes`: Browsing a professional's authored clinical notes.
- `professional-analytics`: A professional's own activity/outcomes analytics dashboard.

### Modified Capabilities
(none)

## Impact

- `screens/ConsultationScreens.js` — `PatientChartQuickViewScreen`'s "View Full Chart" button wired to navigate into the new `PRO-02` screen instead of a toast.
- New `screens/ProfessionalScreens.js` for `PRO-01`–`04`.
- `navigation/MainStack.js` and/or `navigation/stacks/MeStack.js` — register new routes, reachable from Professional Mode navigation.
- New `api/professional.api.js` for patient-roster, chart-access, and analytics fetches — no such API client exists today; authorization (only patients with a consent/consultation relationship are visible) is a hard requirement, not an enhancement.
