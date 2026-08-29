## Context

`AppointmentsListScreen.js` already queries real data via `useQuery`/`getAppointments` and renders fields like `_id`, `provider_id.profile.first_name/last_name`, `status` (`scheduled`/`confirmed`/`in_progress`/`completed`/`cancelled`/`no_show`), `appointment_type`, `scheduled_start_time`, `consultation_reason`. That's a solid data contract to build detail/reschedule/check-in on top of — this change extends the existing model rather than inventing a new one. `api/appointments.api.js` currently only has `getAppointments`.

Pro-mode gating elsewhere in the app (e.g. `screens/ProfileScreen.js`'s `HealthProfileScreen`) uses a simple `profile.role !== "patient"` conditional, not a dedicated mode-switch flag — `APT-08` should follow that same pattern for consistency.

## Goals / Non-Goals

**Goals:**
- A patient can go from the appointment list to a real detail view, and take real actions (reschedule, cancel, check in) that hit the backend and are reflected back in the list.
- A professional user sees a Today's Agenda entry point using the app's existing role-check pattern.

**Non-Goals:**
- Building a new booking UI from scratch — `APT-02` reuses whatever `createAppointment` client call exists (from `fix-consultation-booking-flow` if merged first; otherwise this change adds the minimal version and the two should be reconciled at apply time to avoid duplication).
- Live GPS/geofencing for queue position — the queue tracker starts as a numeric position pulled on a polling interval, not a real-time push channel (that's a reasonable phase-2 upgrade, not required for MVP).
- Full recurring-availability rules for professionals (`CNS-14` territory) — `APT-08` only surfaces today's already-booked agenda, not availability configuration.

## Decisions

- **New screens live in `screens/AppointmentsListScreen.js`'s file** (renamed conceptually to cover the whole `APT` module, or split into a new `screens/AppointmentScreens.js` if the file would otherwise exceed ~400-500 lines — match the app's existing convention where most modules get one `*Screens.js` file, e.g. `CareCircleScreens.js`, `ReferralScreens.js`). Given detail + reschedule + checkin + queue + reminders + booking + agenda is 7 screens, split into a new `screens/AppointmentScreens.js` and keep the existing list screen where it is, importing shared bits as needed.
- **Amended after reading the backend directly** (`Telemedicine-nodejs-backend/src/domains/appointments/*`): there is no generic `updateAppointment(id, patch)` endpoint, no `GET /appointments/:id`, no reschedule endpoint, and no check-in endpoint. Only `GET /appointments/all`, `POST /appointments/create`, and `PUT /appointments/:id/cancel` (body: `cancellation_reason`) exist. The single-generic-PATCH decision below is superseded by:
  - **Cancel calls the real endpoint** (`PUT /appointments/:id/cancel`) — no pending-review fallback needed, it works today.
  - **`getAppointmentById` is a client-side filter over `getAppointments()`** (no wasted new endpoint call, no fake data — real records, just not server-side filtered) rather than a nonexistent `GET /appointments/:id`.
  - **Reschedule and check-in call a documented-but-not-yet-backed endpoint** (`/appointments/:id/reschedule`, `/appointments/:id/checkin`) and use the same non-fake-success "pending manual review" pattern established in `harden-identity-recovery`'s `SecurityActionResult` — so they start working the moment the backend adds the routes, with zero frontend changes, and never lie about success today.
  - **Reminders are genuinely local-only** (device storage via `utils/storage.js`, keyed per appointment id) rather than persisted via a nonexistent backend field — there is no reminder field on the `Appointment` prisma model, so "pending review" would be the wrong framing for a low-stakes preference; local storage is the honest implementation, not a stopgap.
- **Queue tracker polls** via the same `useQuery` + `refetchInterval` pattern already available through `@tanstack/react-query` (already a dependency) rather than introducing WebSockets — smallest change that satisfies "live-ish" without new infrastructure. Since there is no backend queue-position endpoint either, the tracker screen is built against the same documented-but-not-yet-backed pattern as reschedule/check-in.
- ~~Reminders are local-only initially (stored with the appointment record via `updateAppointment`...)~~ — superseded by the bullet above once the backend contract was actually checked; kept here struck through rather than deleted so the reasoning trail is visible.

## Risks / Trade-offs

- [Reschedule/cancel/check-in status semantics may not match backend's actual state machine] → Resolved by reading the backend directly rather than guessing: cancel is real and wired to the real endpoint; reschedule/check-in have no backend support at all yet, so they use the pending-review pattern instead of guessing at status values.
- [Overlap with `fix-consultation-booking-flow`'s `createAppointment`] → Confirmed `createAppointment` already exists in `api/appointments.api.js`; reused as-is, no duplicate added.
- [Pro-mode agenda shown to all users if role data is missing/malformed] → Follow the existing `profile.role !== "patient"` guard exactly as used in `ProfileScreen.js`, defaulting to hidden when role is absent.

## Migration Plan

1. Extend `api/appointments.api.js` with `getAppointmentById`, `updateAppointment`, and `createAppointment` (or confirm it already exists from the booking-flow change).
2. Build `screens/AppointmentScreens.js` with detail, reschedule/cancel, check-in, queue tracker, reminders, booking, and Pro agenda screens.
3. Wire `AppointmentsListScreen` item taps to the detail screen.
4. Register new routes in navigation.
5. Manual smoke test of each new screen's entry and exit points.
