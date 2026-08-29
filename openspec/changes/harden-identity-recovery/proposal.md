## Why

`frontend.md` module 3 (`ID`, Identity & Recovery) defines 17 screens; only 7 exist (`DigitalHealthIdScreen`, `RequestPhysicalCardScreen`, `EmergencyProfileScreen`, `EmergencyPrivacyScreen`, `EmergencyAuditLogScreen`, `PublicEmergencyProfileScreen`, `MedGramPassportScreen` in `IdentityScreens.js`), all mocked. Every recovery-adjacent screen is missing: `ID-07` (Pro scan of a patient's ID/QR), `ID-09` (recover a lost/disputed MedGram ID), `ID-10`–`12` (replace card, suspend identity, reissue identity), `ID-13` (verification & change history), `ID-14` (the recovery-center hub the spec calls out specifically so users don't need to already know which flow they need), `ID-15` (self-service merge of duplicate accounts — the spec's own fix for a named real-world problem: a user unknowingly creating a second identity when a hospital already pre-registered them), `ID-16` (confidence indicator), and `ID-17` (device transfer). Without these, a user who loses access to their MedGram ID, suspects fraud, or discovers a duplicate account has no in-app path to resolve it — a hole in exactly the kind of high-stakes moment this product exists to handle well.

## What Changes

- Add `ID-14` Identity & Account Recovery Center as a single hub, linking out to the existing `ONB-13` credential-recovery flow and the new `ID-09`–`12` screens, so users don't need to know which specific flow they need.
- Add `ID-09` Recover MedGram ID.
- Add `ID-10` Replace Digital/Physical Card.
- Add `ID-11` Suspend Identity (suspected fraud/stolen device).
- Add `ID-12` Reissue Identity (post-suspension or major life change).
- Add `ID-13` Identity Verification & Change History.
- Add `ID-15` Merge Duplicate Accounts (self-service verify → confirm → merge).
- Add `ID-16` Identity Confidence Indicator (status badge/explainer for unresolved verification steps).
- Add `ID-17` Device Transfer (move an active session to a new device).
- Add `ID-07` **[Pro]** Scan patient ID/QR for verified emergency access, with justification prompt and audit logging — gated the same way as other `[Pro]` screens.

## Capabilities

### New Capabilities
- `identity-recovery-center`: The hub screen linking every recovery/repair path together.
- `identity-lifecycle-management`: Recovering, replacing, suspending, reissuing identity, and viewing verification/change history.
- `duplicate-account-merge`: Self-service detection-adjacent merge flow for a user who discovers they hold two identities.
- `identity-confidence-status`: Patient-facing badge/explainer for unresolved verification steps.
- `device-transfer`: Moving an active MedGram ID session to a new device.
- `professional-emergency-scan`: Verified professional scanning a patient's ID/QR for emergency access, justification-prompted and audit-logged.

### Modified Capabilities
(none)

## Impact

- `screens/IdentityScreens.js` — extended with the new screens above.
- `navigation/MainStack.js` — register new routes; link `SET-01`/`HOME`/`ID-01` entry points into the new recovery center per the spec's own cross-references.
- New/extended identity API client — no dedicated identity-lifecycle API exists today beyond whatever backs the 7 existing mocked screens (all currently `MOCK_*` data per prior audit); this change specifies the client contract needed, flagging backend dependency explicitly rather than shipping fake success states for security-sensitive actions like suspend/reissue.
- Cross-references `ONB-13` (existing credential recovery flow in `AuthScreens.js`/`OnboardingScreens.js`) — reused, not duplicated.
