## 1. API layer

- [x] 1.1 Create `api/labs.api.js` with `getLabOrders()`, `getLabOrderById(id)`, `getLabResultById(id)` — also added `selectLabCenter(orderId, centerId)`, needed to satisfy the `lab-orders` spec's "system persists that selection against the order" requirement for task 2.3 (not explicitly named in design.md, but implied by it)
- [x] 1.2 Add `createLabOrder(patientId, data)` to `api/labs.api.js` for Pro use
- [x] 1.3 Confirm whether `api/consent.api.js` has (or needs) a grant-consent function for `LAB-06`; add a minimal scoped version if not, flagged for reconciliation with any parallel Consent Center work — confirmed no grant function existed (only `getMyConsents`/`revokeConsent`); added minimal `grantConsent(payload)`

## 2. Orders

- [x] 2.1 Create `screens/LabScreens.js` with `LabOrdersListScreen` (Pending/Completed)
- [x] 2.2 Add `LabOrderStatusScreen` (tracker)
- [x] 2.3 Add lab/diagnostic-center selection flow for pending orders — mock center directory (no directory endpoint exists), selection persisted via `selectLabCenter`

## 3. Results

- [x] 3.1 Add `LabResultViewerScreen`, including radiology display
- [x] 3.2 Add trend chart using `react-native-svg`, with an insufficient-data empty state
- [x] 3.3 Add "share with a professional" action that records a scoped consent grant

## 4. Professional ordering

- [x] 4.1 Add `CreateLabOrderScreen`, gated by `profile.role !== "patient"`

## 5. Navigation and entry point

- [x] 5.1 Add a "Laboratory & Diagnostics" NavCard to `HealthHubScreen`'s Records group, linking to `LabOrdersListScreen` — also fixed `AIHandoffScreen`'s "Order Lab Test" `toast.info("...coming soon")` stub to navigate to `LabOrdersList` (relabeled "View Lab Orders" since ordering itself is Pro-only, per `LAB-07`), and added an "Order Lab Test" Pro entry point on `PatientChartQuickViewScreen` alongside the prescribing button added by `add-prescription-management`
- [x] 5.2 Register all new routes in `navigation/MainStack.js`

## 6. Verify

- [x] 6.1-6.3 Manual walkthroughs — **not performed as live interactive click-throughs**, same constraint noted in `fix-consultation-booking-flow` and `add-prescription-management`: no browser-automation tool in this sandbox, and no test credentials for the live Render-hosted backend (no local backend exists in this repo). What was verified instead: (a) all touched/added files pass a Babel syntax check against the project's own `babel-preset-expo` config, (b) a full `expo export --platform web` bundled successfully with zero errors, confirming every new screen's imports/exports resolve (including the new `react-native-svg` usage in the trend chart) and nothing else in the app broke. Flagging for the user rather than assuming a pass.
