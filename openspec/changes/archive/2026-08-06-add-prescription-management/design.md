## Context

`PrescriptionsListScreen.js` renders real fields: `_id`, `prescription_number`, `status` (`pending`/`sent_to_pharmacy`/`dispensed`/`partially_dispensed`/`cancelled`/`expired`), `prescription_date`, `expires_at`, `patient_instructions`. `api/meds.api.js` already has `getMedications(params)` (search/category) and `uploadPrescription(patientId, data)` (POST `/patients/:id/prescriptions/create`) — notably `getUserPrescriptions` itself currently lives in `api/auth.api.js`, an inconsistency worth normalizing into `meds.api.js` while touching this area, but not required.

## Goals / Non-Goals

**Goals:**
- A patient can tap a prescription and see full detail, a redeemable QR/code, find pharmacies that stock it, request a refill, set a reminder, and see adherence history.
- A professional can create a prescription and sees an interaction/allergy alert when relevant.

**Non-Goals:**
- Building Marketplace's product/checkout screens (`MKT-06`/`07`) — this change only needs `RX-05` to navigate to wherever Marketplace checkout eventually lives, passing the medication/prescription reference as params. If Marketplace checkout doesn't exist yet, `RX-05` degrades to a "reserved, pharmacy will confirm" state rather than blocking on Marketplace's build-out.
- Real pharmacy inventory integration — `RX-04` renders pharmacy results from whatever `getMedications`/pharmacy-lookup endpoint the backend provides; if no stock-level endpoint exists, it lists pharmacies without live stock counts rather than fabricating numbers.
- Drug-interaction logic itself (`RX-10`) — the alert modal surfaces whatever the backend's prescribing endpoint returns; this change does not implement client-side interaction-checking logic.

## Decisions

- **New screens live in a new `screens/PrescriptionScreens.js`**, following the same one-file-per-module convention as `CareCircleScreens.js`/`ReferralScreens.js`, keeping `PrescriptionsListScreen.js` as the list entry point it already is.
- **QR/verification code (`RX-03`) reuses the same pseudo-QR rendering approach already used in `IdentityScreens.js`'s `DigitalHealthIdScreen`** for visual consistency, rather than introducing a new QR library dependency.
- **Refill request (`RX-06`) is a status-changing action on the existing prescription record** (e.g. sets a `refill_requested` flag/status via an `updatePrescription`-style call), not a new document type — matches how reschedule/cancel is modeled in `add-appointment-management` for appointments.
- **Reminders and adherence history are local, per-prescription data** persisted alongside the prescription record (mirrors the `RX-07`/`RX-08` pairing being tightly coupled to a specific prescription in the spec), not a separate global medication-tracking module.
- **Professional prescribing (`RX-09`) posts through the existing `uploadPrescription(patientId, data)`** in `api/meds.api.js` rather than adding a parallel create function, since it already targets the correct endpoint shape.
- **Pro-gating for `RX-09`/`RX-10` follows the same `profile.role !== "patient"` pattern** used in `ProfileScreen.js` and specified in `add-appointment-management`, for consistency across the app rather than inventing a second gating mechanism.

## Risks / Trade-offs

- [No backend endpoint yet for refill requests, reminders, or pharmacy stock lookup] → Task list flags each as needing backend confirmation; client ships with clear error/empty states rather than mocked success.
- [`getUserPrescriptions` living in `auth.api.js` instead of `meds.api.js` is confusing] → Optional cleanup task to move it, not required for this change's core goal.
- [Interaction-alert modal (`RX-10`) could give false confidence if the backend doesn't actually run interaction checks] → Modal copy must make clear it reflects whatever the backend returned, and task list includes confirming with backend whether this check exists before shipping the UI as if it does.

## Migration Plan

1. Add/confirm API functions in `api/meds.api.js` for detail fetch, refill request, reminder persistence.
2. Build `screens/PrescriptionScreens.js` with detail, QR, pharmacy finder, refill, reminders, adherence, Pro create, interaction-alert modal.
3. Wire `PrescriptionsListScreen` item taps into detail.
4. Register routes in navigation.
5. Manual smoke test of the full chain: list → detail → QR → refill request → reminder → adherence history; separately, Pro create → interaction alert.
