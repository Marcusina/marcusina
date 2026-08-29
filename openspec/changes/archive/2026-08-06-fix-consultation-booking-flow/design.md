## Context

Discovery today (`FindProfessionalScreen`, `ProfessionalProfileScreen` in `ConsultationScreens.js`) is real: it renders `MOCK_PROFESSIONALS`/`MOCK_ORGANIZATIONS` and lets the user pick a consult type inline on the profile screen (`consultType` state, line ~216). But the "Book Consultation" button (line 290) calls `navigation.navigate("ConsultBooking")` with **no params**, and `ConsultBookingScreen`/`ConsultConfirmScreen` live in a completely separate file, `ConsultScreens.js`, with their own hardcoded `doctors` array and no props wired to receive route params at all (`navigation/MainStack.js` wrappers `ConsultBookingScreenWrapper`/`ConsultConfirmScreenWrapper` pass nothing through either). The result: whatever the user selected on the profile screen is discarded, and the confirmation screen always shows "Dr. Sarah" / June 19 / $25.

Separately, `WaitingRoomScreen` (CNS-06), `LiveConsultScreen` (CNS-07), and `ChatConsultScreen` (CNS-08) are fully built in `ConsultationScreens.js` and registered in `MainStack.js`, but the only code path that reaches `WaitingRoom` is `InstantConsultScreen` (CNS-12), which itself has no navigate-to call site anywhere in the app. A normal scheduled booking never produces a route into this chain.

`api/appointments.api.js` currently only exports `getAppointments()` (GET `/appointments/all`). There is no create/book function yet.

## Goals / Non-Goals

**Goals:**
- One continuous data flow: professional + consult type selected on `CNS-02` → booking/scheduling on `CNS-04`/`05` → a real appointment created via the backend → summary/history reflects it → live-consult chain reachable once the appointment's scheduled time arrives (or immediately, for chat-type consults).
- Delete the disconnected, hardcoded `ConsultScreens.js` pair rather than patch it — `ConsultationScreens.js` already owns the correct discovery data model (`MOCK_PROFESSIONALS`, `getProfessional`, `initials`) that booking needs to reuse.

**Non-Goals:**
- Real backend/API implementation is out of this repo's control beyond adding the client call in `api/appointments.api.js`; if no `POST /appointments` endpoint exists yet, this change specifies the client contract the backend must satisfy, and the task list flags it as an open dependency rather than silently mocking it.
- Full `APT-02`–`08` appointment management (reschedule, check-in, queue, reminders) — covered by a separate change.
- Payment processing detail (`PAY` integration) beyond passing a fee amount through — wallet/payment wiring is a separate concern.

## Decisions

- **Merge booking into `ConsultationScreens.js`, delete `ConsultScreens.js`.** Two files owning the same flow is the root cause of the state loss. Rather than pass data between files, the booking screen (renamed `ConsultBookingScreen`, re-implemented in `ConsultationScreens.js`) becomes a sibling of `ProfessionalProfileScreen` and reads the same `MOCK_PROFESSIONALS` lookup by `proId`. Alternative considered: keep two files and thread params through — rejected because it preserves an arbitrary file boundary with no other reasoning behind it and doubles the surface area for the next person to accidentally edit the wrong copy.
- **Navigate with `route.params`, not shared/global state.** `navigation.navigate("ConsultBooking", { proId, consultType })` from `CNS-02`, then `navigation.navigate("ConsultConfirm", { proId, consultType, date, slot })` from `CNS-04/05`. Matches the existing pattern already used elsewhere in this file (e.g. `ProfessionalProfileScreen` reads `route?.params?.proId`, `WaitingRoomScreen` reads `route.params` for `proName`/`consultType`). No new state-management library needed.
- **Confirmation triggers a real appointment create call.** Add `createAppointment(payload)` to `api/appointments.api.js` (POST `/appointments`, mirroring the existing `apiClient` usage in `getAppointments`). `ConsultConfirmScreen` calls it on mount/on confirm, shows a loading state, and only shows "Booking Confirmed" on success (with an error state on failure — using the existing `toast` from `context/ToastContext`, same pattern used elsewhere in this file).
- **Route the confirmed appointment into the live-consult chain.** `ConsultSummaryScreen`/`ConsultationHistoryScreen` (CNS-09/10) already exist and take `proName`/`consultId` params — extend the appointment list item / history item's `onPress` to `navigation.navigate("WaitingRoom", { proName, consultType, appointmentId })` when the appointment's status is "ready to join," instead of only reaching a summary. `AppointmentsListScreen` (which currently has no `onPress` on its list items per the earlier audit) gets a minimal tap handler that does the same for consultation-type appointments — this is the one small piece of `APT` territory this change must touch to close the loop, kept intentionally minimal.
- **Keep `InstantConsultScreen` (CNS-12) as-is.** It's a separate, already-complete flow into `WaitingRoom`; this change doesn't need to touch it, just confirms the route name it uses (`WaitingRoom`) is the same one the new scheduled-booking path targets.

## Risks / Trade-offs

- [No backend `POST /appointments` endpoint may exist yet] → Task list includes verifying/adding the endpoint contract; if backend work is out of reach in this repo, `createAppointment` ships behind a clearly-logged "backend not yet available" error path rather than silently faking success, so the UI never lies about persistence.
- [Removing `ConsultScreens.js` could break an import we didn't find] → A repo-wide grep for `ConsultScreens` / `ConsultBookingScreen` / `ConsultConfirmScreen` is a required first task before deletion.
- [Consult-type-specific routing (chat vs video vs physical) into the live-consult chain adds branching] → Reuse the existing `consultType` branch already present in `WaitingRoomScreen` (lines ~387-389: `ChatConsult` vs `LiveConsult` replace) rather than inventing a new dispatch mechanism.

## Migration Plan

1. Add `createAppointment` to `api/appointments.api.js`.
2. Rebuild booking screens inside `ConsultationScreens.js`, threaded via route params from `ProfessionalProfileScreen`.
3. Update `MainStack.js`: remove the `ConsultScreens` import and its two wrapper components/registrations; register the new booking screens from `ConsultationScreens.js` instead (route names `ConsultBooking`/`ConsultConfirm` stay the same so any other deep links still resolve).
4. Delete `screens/ConsultScreens.js`.
5. Wire `ConsultSummaryScreen`/`ConsultationHistoryScreen`/`AppointmentsListScreen` tap handlers into `WaitingRoom`.
6. Manual smoke test: Find Doctor → pick doctor + type → book a slot → confirm → appears in history → tap through to waiting room.

No rollback complexity beyond standard revert — no data migration involved, this is UI/routing plus one new API client function.
