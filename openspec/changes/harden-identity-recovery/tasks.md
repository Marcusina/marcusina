## 1. Backend confirmation

- [x] 1.1 Confirm which of recover/replace/suspend/reissue/merge/device-transfer/pro-scan have real backend endpoints available; document gaps before building each screen's success path

## 2. Recovery Center

- [x] 2.1 Build `IdentityRecoveryCenterScreen` (`ID-14`) in `IdentityScreens.js` as a hub linking to `ONB-13` and all screens below
- [x] 2.2 Link `SET-01`/Me tab into the Recovery Center
- [x] 2.3 Link `ID-01` Digital Health ID screen into the Recovery Center

## 3. Lifecycle screens

- [x] 3.1 Build `RecoverMedGramIdScreen` (`ID-09`)
- [x] 3.2 Build `ReplaceCardScreen` (`ID-10`)
- [x] 3.3 Build `SuspendIdentityScreen` (`ID-11`) — real backend call or explicit pending-review state, never a faked success
- [x] 3.4 Build `ReissueIdentityScreen` (`ID-12`) — same non-fake-success rule
- [x] 3.5 Build `VerificationChangeHistoryScreen` (`ID-13`), reusing `EmergencyAuditLogScreen`'s list pattern

## 4. Merge and confidence

- [x] 4.1 Build `MergeDuplicateAccountsScreen` (`ID-15`): verify → confirm → merge
- [x] 4.2 Build the Identity Confidence Indicator (`ID-16`) badge/explainer component, surfaced wherever verification status is relevant

## 5. Device transfer

- [x] 5.1 Check whether `AuthScreens.js`'s `VerifyDeviceScreen` already covers device verification; reuse if so
- [x] 5.2 Build `DeviceTransferScreen` (`ID-17`) — same non-fake-success rule as suspend/reissue

## 6. Professional scan

- [x] 6.1 Build `ScanPatientIdScreen` (`ID-07`) with justification prompt, gated by `profile.role !== "patient"`, reusing the audit-log pattern for logging the access

## 7. Navigation

- [x] 7.1 Register all new routes in `navigation/MainStack.js`

## 8. Verify

- [ ] 8.1 Manual walkthrough: Recovery Center → each linked flow opens correctly
- [ ] 8.2 Manual walkthrough: suspend/reissue/device-transfer show real success or explicit pending-review state, never a fake confirmation
- [ ] 8.3 Manual walkthrough: merge duplicate accounts, including a blocked case where verification is incomplete
- [ ] 8.4 Manual walkthrough: professional-role account can scan and access emergency profile with justification logged; patient-role account cannot

Note on 1.1 (original, now superseded): confirmed by reading `Telemedicine-nodejs-backend/src/domains/**/*.routes.js` directly - zero backend routes existed for any of recover/replace/suspend/reissue/merge/device-transfer/pro-scan at the time this change's screens were built.

**Backend now implemented** (separate work session, same day): added `Telemedicine-nodejs-backend/src/domains/identity/*` (routes/controller/service) plus `IdentityRequest` and `EmergencyAccessLog` Prisma models. Suspend/reissue are real, immediate actions (flip `User.accountStatus`); recover/replace-card/merge/device-transfer are real endpoints that persist a genuinely queued `IdentityRequest` row (`status: "pending"`) rather than completing automatically - none of those four are safely instant-automatable. Professional scan (`POST /identity/scan`) is gated server-side via a new `assertProfessional` helper and does a real, authorized lookup + audit-log write in one atomic call. Frontend was updated to match: `MergeDuplicateAccountsScreen`/`DeviceTransferScreen` now branch on the response's `status` field instead of assuming any non-throwing call means fully completed, and `PublicEmergencyProfileScreen` was fixed to actually render the scanned patient's data (`route.params.scannedPatient`) - previously it only ever showed the current user's own profile regardless of which flow reached it, a real bug caught during this integration pass.

**Verified via a full local run**: started local Postgres (`docker compose up`), ran the new Prisma migration, started the backend (`npm run dev`), and drove every identity endpoint end-to-end with curl using two real registered/logged-in test accounts (see chat transcript) - recover/replace-card/merge/device-transfer all correctly return `status: "pending"`; suspend/reissue correctly return `status: "completed"`; verification-history returns the real chronological list; scan correctly 403s for a patient-role caller and succeeds for a doctor-role caller, returning real (empty, since the test patient has no profile data) fields in the exact shape the frontend reads.

## 9. Verify (added after backend implementation)

- [ ] 9.1 Manual browser/device walkthrough of all screens - not done. The API-level verification above (curl, real DB) confirms the backend contract and response shapes are correct, but no headless browser was available in this sandbox to actually click through the React Native UI, so this is a different, still-open verification step from 8.1-8.4 above.
