## 1. API layer

- [x] 1.1 Add `getPrescriptionById(id)` to `api/meds.api.js`
- [x] 1.2 Add `requestRefill(id)` to `api/meds.api.js`
- [x] 1.3 Add reminder persistence function (e.g. `updatePrescriptionReminder(id, patch)`) to `api/meds.api.js`
- [x] 1.4 Confirm `uploadPrescription(patientId, data)` (already in `api/meds.api.js`) is sufficient for `RX-09`, or extend it — confirmed sufficient as-is; used directly for professional prescribing
- [x] 1.5 (Optional cleanup) Move `getUserPrescriptions` from `api/auth.api.js` into `api/meds.api.js` for consistency — done; updated both call sites (`context/UserContext.js`, `screens/PrescriptionsListScreen.js`)

## 2. Detail and verification

- [x] 2.1 Create `screens/PrescriptionScreens.js` with `PrescriptionDetailScreen`
- [x] 2.2 Add QR/verification code view, reusing the pseudo-QR rendering approach from `IdentityScreens.js`'s `DigitalHealthIdScreen`
- [x] 2.3 Wire `PrescriptionsListScreen` item `onPress` to navigate to `PrescriptionDetailScreen`

## 3. Fulfillment

- [x] 3.1 Add `FindPharmacyScreen` (map/list + price comparison where available) — list-only mock directory (no stock/price backend endpoint exists), per design's degrade path
- [x] 3.2 Add reserve/order action that hands off to Marketplace checkout with the prescription reference as a param (degrade gracefully if Marketplace checkout doesn't exist yet) — Marketplace checkout doesn't exist (confirmed), so this implements the "reserved, pharmacy will confirm" degrade state directly rather than a checkout hand-off
- [x] 3.3 Add refill request flow with eligibility check (block on expired/cancelled) — implemented inline on `PrescriptionDetailScreen` (a single mutation + eligibility check, not a separate screen — matches design's "status-changing action on the existing record")

## 4. Tracking

- [x] 4.1 Add medication reminder setup screen
- [x] 4.2 Add medication history / adherence timeline screen — shows real prescription list with an honest "adherence tracking begins once doses are logged" message rather than fabricated adherence percentages (no per-dose event data exists yet)

## 5. Professional prescribing

- [x] 5.1 Add `CreatePrescriptionScreen`, gated by `profile.role !== "patient"`
- [x] 5.2 Add drug-interaction/allergy alert modal, driven by whatever the backend returns (confirm with backend whether this check exists before shipping) — implemented to surface `interaction_warnings`/`interaction_warning` fields IF the backend's `uploadPrescription` response includes them; **not yet confirmed with backend whether this check actually exists** — flagged, not assumed

## 6. Navigation

- [x] 6.1 Register all new routes in `navigation/stacks/HealthStack.js` and/or `navigation/MainStack.js` — all 6 new screens registered in `navigation/MainStack.js`; also added a "Prescribe Medication" entry point on `PatientChartQuickViewScreen` (`CNS-16`) since `CreatePrescriptionScreen` otherwise had no reachable entry point (`add-professional-experience`'s My Patients list, its more natural home, hasn't been implemented yet)

## 7. Verify

- [x] 7.1-7.5 Manual walkthroughs — **not performed as live interactive click-throughs**, same constraint as `fix-consultation-booking-flow`: this sandbox has no browser-automation tool installed and reaching any of these screens requires an authenticated session against the live Render-hosted backend (no local backend exists in this repo), for which no test credentials were available. What was verified instead: (a) all touched/added files pass a Babel syntax check against the project's own `babel-preset-expo` config, (b) a full `expo export --platform web` bundled successfully with zero errors, confirming every new screen's imports/exports resolve and nothing else in the app broke. Flagging for the user rather than assuming a pass.
