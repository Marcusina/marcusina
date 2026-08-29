## Why

The prior codebase audit (comparing `frontend.md` against the built app) surfaced several pieces of confirmed dead code that add confusion and maintenance risk without providing any value: an entirely orphaned duplicate screen file, unreachable registered screens, and props that are threaded through but never invoked. None of this is behavior users can reach — removing it is pure risk reduction, not a feature change.

## What Changes

- Delete `screens/HealthScreens.js` (747 lines) — confirmed via repo-wide search to have zero importers anywhere in the app; it contains a second, competing `HealthHubScreen` export plus mocked `AppointmentsScreen`/`AppointmentDetailScreen` that were never wired into the live build (`screens/HealthHubScreen.js` and `screens/AppointmentsListScreen.js` are the real, live versions).
- Remove the dead `onOpenProfile`, `onConsult`, `onOpenGroups`, `onOpenPlace` props: `navigation/stacks/HomeStack.js` passes them into `HomeScreen`, but `HomeScreen.js` destructures them and never calls any of them — remove the destructuring and the pass-through wiring together, rather than leaving a prop that looks load-bearing but isn't.
- Remove the dead `onBackHome`, `onLogout` props similarly wherever they are passed into `HealthProfileScreen`/`PublicProfileScreen` in `screens/ProfileScreen.js` but never invoked.
- **BREAKING**: none of these are public APIs; this is entirely internal cleanup with no user-facing behavior change.

Explicitly not included here: `PostScreen.js`'s current unreachability is being fixed (made reachable, not deleted) by the separate `fix-community-core` change, since that screen has real, working UI worth keeping — it's a wiring gap, not dead code.

## Capabilities

### New Capabilities
- `dead-code-hygiene`: Verifiable absence of the specific confirmed-dead code identified in this proposal (orphaned files, unreachable registered screens, unused pass-through props) — not a product capability, but stated as a checkable requirement so this cleanup has the same verification rigor as any other change.

### Modified Capabilities
(none)

## Impact

- `screens/HealthScreens.js` — deleted.
- `navigation/stacks/HomeStack.js`, `screens/HomeScreen.js` — dead prop wiring removed.
- `screens/ProfileScreen.js` and its callers — dead prop wiring removed.
