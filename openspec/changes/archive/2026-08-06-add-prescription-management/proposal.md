## Why

`screens/PrescriptionsListScreen.js` is real and API-backed (`getUserPrescriptions`), but it is the only prescription screen that exists: list items are non-interactive, and there is no detail view, no QR/verification code, no pharmacy-stock finder, no refill request, no reminder setup, no adherence history, and no professional-side prescribing or interaction-alert screens. This is `frontend.md` module 10 (`RX`), a Tier-1 MVP module, currently at 1 of 10 screens — meaning a patient can see that a prescription exists but cannot act on it at all.

## What Changes

- Add prescription detail (`RX-02`): full view of a single prescription (medications, dosage, instructions, prescribing provider, status).
- Add a QR/verification code view (`RX-03`) for pharmacy redemption.
- Add "find pharmacy with stock" (`RX-04`): map/list of pharmacies with the medication, price comparison where permitted.
- Add reserve/order flow (`RX-05`) that hands off to Marketplace checkout.
- Add refill request flow (`RX-06`).
- Add medication reminder setup (`RX-07`).
- Add medication history / adherence timeline (`RX-08`).
- Add professional prescribing (`RX-09`) and a drug-interaction/allergy-alert modal (`RX-10`), gated the same way other `[Pro]` screens in this app are.
- Make `PrescriptionsListScreen` list items tappable into the new detail screen.

## Capabilities

### New Capabilities
- `prescription-detail`: Viewing a single prescription's full detail plus its QR/verification code.
- `prescription-fulfillment`: Finding pharmacy stock, reserving/ordering a medication, and requesting a refill.
- `medication-tracking`: Reminder setup and adherence history for a patient's medications.
- `professional-prescribing`: Creating a prescription and surfacing drug-interaction/allergy alerts, for verified professional users.

### Modified Capabilities
(none)

## Impact

- `screens/PrescriptionsListScreen.js` — add `onPress` per item, wire into detail.
- New screens for detail, QR view, pharmacy finder, refill request, reminders, adherence history, Pro create, and interaction-alert modal.
- `navigation/stacks/HealthStack.js` and/or `navigation/MainStack.js` — register the new routes.
- `api/meds.api.js` / `api/auth.api.js` — add functions for prescription detail fetch, refill request, and reminder persistence; `uploadPrescription` already exists in `api/meds.api.js` and can back `RX-09`.
- Hand-off point into Marketplace checkout (`MKT-06`/`07`) for `RX-05` — Marketplace itself is out of scope; this change only needs the navigation hand-off contract, not Marketplace's own build-out.
