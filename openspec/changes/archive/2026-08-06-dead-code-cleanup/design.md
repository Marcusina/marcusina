## Context

Three confirmed instances of dead code, each verified independently:
- `screens/HealthScreens.js` (747 lines): a repo-wide search for `screens/HealthScreens` import paths returns zero matches — nothing imports it. It duplicates the `HealthHubScreen` export name used by the real, live `screens/HealthHubScreen.js`, which is a landmine for a future editor who greps for `HealthHubScreen` and edits the wrong file.
- `navigation/stacks/HomeStack.js` passes `onOpenProfile`, `onConsult`, `onOpenGroups`, `onOpenPlace` into `HomeScreen`; `screens/HomeScreen.js` destructures all four but never calls any of them in its body (confirmed: no `onOpenProfile(`, `onConsult(`, `onOpenGroups(`, or `onOpenPlace(` call sites anywhere in the file).
- `screens/ProfileScreen.js` destructures `onBackHome`/`onLogout` in at least `PublicProfileScreen` without ever invoking them.

This is low-risk, mechanical cleanup — no behavior reachable by a user changes, since none of this code executes today.

## Goals / Non-Goals

**Goals:**
- Remove code proven unreachable or unused, reducing future maintenance confusion (especially the duplicate `HealthHubScreen` export name, which is an active landmine).

**Non-Goals:**
- `PostScreen.js`'s current unreachability — that screen has real, working UI and is being made reachable (not deleted) by `fix-community-core`; explicitly excluded here to avoid the two changes fighting over the same file.
- Any screen that's merely mocked/UI-only but still reachable — mocked-but-reachable is a backend-integration gap, not dead code, and out of scope for this change.

## Decisions

- **Delete `HealthScreens.js` outright** rather than merge any part of it — the earlier audit confirmed the live `HealthHubScreen.js` and `AppointmentsListScreen.js` are the real, API-backed versions; the dead file's `AppointmentsScreen`/`AppointmentDetailScreen` mocks have nothing worth salvaging that isn't already better-represented by `add-appointment-management`'s planned detail screen.
- **Remove dead props at both ends (caller and callee) in the same commit** — leaving a prop removed from the destructuring but still passed by the caller (or vice versa) just moves the confusion rather than resolving it.
- **Grep-verify each removal immediately before deleting**, since this is exactly the kind of change where a stale assumption causes a real regression — re-run the reachability check right before applying each deletion, not just once at proposal time.

## Risks / Trade-offs

- [A prop or file could have a reference this audit's greps missed] → Re-verify with a fresh grep immediately before each deletion (see tasks.md), not just relying on the original audit.

## Migration Plan

1. Re-confirm zero importers of `screens/HealthScreens.js`, then delete it.
2. Remove `onOpenProfile`/`onConsult`/`onOpenGroups`/`onOpenPlace` from both `HomeStack.js`'s pass-through and `HomeScreen.js`'s destructuring.
3. Remove `onBackHome`/`onLogout` from `ProfileScreen.js`'s affected component signatures and their callers.
4. Run the app and confirm Home, Health Hub, and Profile screens still render and navigate correctly.
