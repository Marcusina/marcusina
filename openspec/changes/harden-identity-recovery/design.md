## Context

`IdentityScreens.js`'s 7 existing screens are explicitly mocked (`MOCK_EMERGENCY_PROFILE`/`MOCK_AUDIT_LOG`/`MOCK_VACCINATIONS`, a fake pseudo-QR, `setTimeout`-faked submits) with in-code comments admitting they're placeholders until a real API lands. `AuthScreens.js` already has `ForgotPasswordScreen`/`ResetPasswordScreen` (the spec's `ONB-13`) and, notably, a `VerifyDeviceScreen` — worth checking during implementation whether it already covers part of what `ID-17` Device Transfer needs, to avoid building a redundant device-verification UI. `EmergencyAuditLogScreen` already renders a "who accessed, when, why" audit-log pattern that `ID-13` (verification/change history) and `ID-07`'s justification-prompt/audit-logging requirement should reuse for visual and structural consistency.

Given every screen in this module touches account security (suspend, reissue, merge, device transfer), this is one of the few modules in this change set where shipping a UI-only mock is actively worse than shipping nothing — a fake "Identity Suspended" success screen that doesn't actually suspend anything is a security-relevant lie to the user, not a cosmetic gap.

## Goals / Non-Goals

**Goals:**
- Every recovery/repair scenario named in `frontend.md`'s module 3 has a real, reachable screen.
- The recovery center (`ID-14`) is the actual single entry point — other screens (`SET-01`, `ID-01`) link into it rather than each building their own "I lost access" flow.
- Suspend/reissue/merge/device-transfer actions either call a real backend or clearly communicate they're pending backend support — never a silent fake-success `setTimeout`.

**Non-Goals:**
- Rebuilding `ONB-13` credential recovery — reused as-is via the recovery center's linking, per the proposal.
- Passkey/Authenticator App support — explicitly deferred in `frontend.md`'s own Strategic Recommendations, unrelated to this change.
- Real-time cross-device session invalidation infrastructure — `ID-17` Device Transfer's UI and API contract are specified here; the actual session-invalidation mechanism is a backend concern flagged as a dependency.

## Decisions

- **New screens extend `IdentityScreens.js`** rather than a new file — this is more of the same module, not a new domain, keeping the existing `MOCK_*` → real-API migration contained to one file per the earlier audit's own framing.
- **`ID-14` Recovery Center is a simple router/hub screen** — a list of entry points (Recover ID, Replace Card, Suspend, Reissue, Merge Duplicates, Device Transfer, plus a link to `ONB-13`), not a wizard — matches the spec's stated purpose ("so users don't need to already know which specific flow they need").
- **`ID-13` Verification & Change History and `ID-07`'s required audit logging both reuse `EmergencyAuditLogScreen`'s existing list-of-events UI pattern** (who/when/why), rather than building a second audit-log presentation from scratch.
- **Security-sensitive actions (`ID-11` suspend, `ID-12` reissue, `ID-15` merge) require a real backend call before showing success** — if no such endpoint exists at implementation time, the screen ships with the request flow built and an explicit "pending backend support, request submitted for manual review" state, never a `setTimeout`-faked confirmation. This directly reverses the pattern the rest of this module currently uses.
- **`ID-17` Device Transfer first checks whether `AuthScreens.js`'s `VerifyDeviceScreen` already covers the device-verification step** before building a new one — reuse over duplication, consistent with how `fix-consultation-booking-flow` treated its own duplicate-file problem.
- **`ID-07` Pro scan reuses the existing emergency-access-audit pattern** (`EmergencyAuditLogScreen`) for its justification prompt + audit trail, and is gated by the app's standard `profile.role !== "patient"` check used throughout this change set.

## Risks / Trade-offs

- [No backend endpoints exist yet for suspend/reissue/merge/device-transfer — these are exactly the actions where a fake success is most harmful] → Explicit non-goal to fake success; tasks.md requires confirming each endpoint before wiring the "success" state, shipping a "pending manual review" state otherwise.
- [Recovery Center becoming yet another place needing to stay in sync if `ONB-13` changes] → It only links to `ONB-13`, doesn't duplicate its screens, so drift risk is limited to link target changes.
- [Merge Duplicate Accounts (`ID-15`) has no matching duplicate-detection-at-signup counterpart in this change set (`ONB-15` is out of scope here)] → `ID-15` still stands alone as a self-service "I noticed I have two accounts" flow; note in tasks.md that reconciling with `ONB-15` if/when it's built is a follow-up, not a blocker.

## Migration Plan

1. Confirm which of suspend/reissue/merge/device-transfer/recover have real backend endpoints available; document gaps.
2. Build `ID-09` (Recover MedGram ID), `ID-10` (Replace Card), `ID-11` (Suspend), `ID-12` (Reissue) in `IdentityScreens.js`, each either calling a real endpoint or showing an explicit pending-review state.
3. Build `ID-13` (Verification & Change History), reusing `EmergencyAuditLogScreen`'s list pattern.
4. Build `ID-14` (Recovery Center hub), linking to `ID-09`–`12`, `ID-15`, `ID-17`, and `ONB-13`.
5. Build `ID-15` (Merge Duplicate Accounts: verify → confirm → merge).
6. Build `ID-16` (Confidence Indicator badge/explainer).
7. Build `ID-17` (Device Transfer), checking `VerifyDeviceScreen` for reuse first.
8. Build `ID-07` (Pro scan), gated by role, reusing the audit-log pattern.
9. Register all routes; link `SET-01` and `ID-01` into the Recovery Center.
10. Manual smoke test of each flow's entry, action, and (where no backend exists) pending-state messaging.
