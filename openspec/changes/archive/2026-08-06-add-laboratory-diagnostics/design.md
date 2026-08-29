## Context

There is no lab/diagnostics code anywhere in this repo. The nearest analogues are `screens/AppointmentsListScreen.js` and `screens/PrescriptionsListScreen.js` (list + status, real API, non-interactive items) and `screens/HealthRecordScreens.js` (which already has a `PHR-06` document/report viewer that supports offline caching, per `frontend.md`'s cross-reference for the Download Center). `frontend.md` explicitly says radiology *booking* lives in Marketplace (`MKT-15`) while radiology *records* live in this module — this change only covers the records side.

`screens/ConsentScreen.js` today only supports viewing and revoking consents (`getMyConsents`/`revokeConsent` from `api/consent.api.js`) — there is no grant/share flow yet. `LAB-06` ("share result with a professional") depends on a grant action that doesn't exist.

## Goals / Non-Goals

**Goals:**
- A patient can see pending/completed lab and imaging orders, track a specific order's status, choose a preferred lab, view a result (including radiology), see a trend chart for repeat values, and initiate sharing a result with a professional.
- A professional can order a lab/radiology test for a patient.
- New module surfaces from `HealthHubScreen`'s existing Records group.

**Non-Goals:**
- Radiology/lab *booking as a service* (`MKT-15`) — out of scope per the spec's own module boundary; this change only reads/tracks orders that already exist against a patient.
- Building the consent grant flow from scratch — if `CON-02` (grant/revoke detail) doesn't exist yet when this change is applied, `LAB-06` implements the minimal grant action itself (scoped to just this result) rather than blocking on a separate Consent Center change, but should be reconciled/de-duplicated if a consent-grant change lands separately.
- Trend charting infrastructure beyond a simple line/bar chart for one value over time — no new charting library if a lightweight approach (e.g. `react-native-svg`, already a dependency) can render it.

## Decisions

- **New module lives in `screens/LabScreens.js`**, following the app's one-file-per-module convention.
- **New `api/labs.api.js`** with `getLabOrders()`, `getLabOrderById(id)`, `getLabResultById(id)`, and (Pro-only) `createLabOrder(patientId, data)` — mirrors the shape of `api/appointments.api.js`/`api/meds.api.js`.
- **`LAB-05` trend chart uses `react-native-svg`** (already a project dependency) for a minimal line chart rather than adding a charting library, keeping this change's footprint small.
- **`LAB-06` share action reuses `api/consent.api.js`'s pattern**: if a `grantConsent`-equivalent function exists by the time this is implemented, use it; otherwise add the minimal `grantConsent(payload)` function needed to scope-share a single lab result with a named professional, and flag it in `tasks.md` as something to reconcile with any parallel Consent Center work.
- **Pro-gating for `LAB-07` follows the established `profile.role !== "patient"` pattern**, consistent with `add-appointment-management` and `add-prescription-management`.

## Risks / Trade-offs

- [No backend endpoints exist yet for labs at all] → Task list confirms/creates the endpoint contract; ships with explicit error/empty states rather than mocked data, consistent with how other new-module changes in this set are scoped.
- [`LAB-06` may duplicate a future/parallel Consent Center grant flow] → Explicitly scoped as "minimal, single-result grant," documented as reconcile-later, not a general-purpose consent UI.
- [Result trend chart needs at least two data points of the same test type to be meaningful] → Empty/insufficient-data state required, not just an empty chart.

## Migration Plan

1. Add `api/labs.api.js`.
2. Build `screens/LabScreens.js`: orders list, status tracker, lab-center selector, result viewer, trend chart, share-to-professional, Pro order-creation.
3. Add a "Laboratory & Diagnostics" NavCard to `HealthHubScreen`'s Records group.
4. Register routes in navigation.
5. Manual smoke test: orders list → order detail/tracker → result viewer → trend chart → share; separately, Pro order creation.
