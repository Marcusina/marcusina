## 1. API layer

- [x] 1.1 Check whether `createAppointment` already exists in `api/appointments.api.js` (from `fix-consultation-booking-flow`); if not, add it
- [x] 1.2 Add `getAppointmentById(id)` to `api/appointments.api.js`
- [x] 1.3 Add `updateAppointment(id, patch)` to `api/appointments.api.js`, confirming accepted status values with the backend (defaulting to `scheduled`/`confirmed`/`in_progress`/`completed`/`cancelled`/`no_show`)

## 2. Detail, reschedule, cancel, reminders

- [x] 2.1 Create `screens/AppointmentScreens.js` with `AppointmentDetailScreen`
- [x] 2.2 Add reschedule flow (date/slot picker + confirm) calling `updateAppointment`
- [x] 2.3 Add cancel flow (confirmation dialog + status update)
- [x] 2.4 Add per-appointment reminder settings (on/off + lead time), persisted via `updateAppointment`
- [x] 2.5 Wire `AppointmentsListScreen` item `onPress` to navigate to `AppointmentDetailScreen`

## 3. Check-in and queue

- [x] 3.1 Add `CheckInScreen` (QR scan / MedGram ID / confirmation code) for physical appointments
- [x] 3.2 Add `QueueTrackerScreen` using `useQuery` with `refetchInterval` for periodic position updates
- [x] 3.3 Wire check-in success to navigate into the queue tracker

## 4. Booking entry point

- [x] 4.1 Add `BookAppointmentScreen` (calendar/slot picker) that calls `createAppointment`, reusing rather than duplicating the client function from task 1.1

## 5. Professional agenda

- [x] 5.1 Add `TodaysAgendaScreen` filtering appointments to the current day
- [x] 5.2 Gate its entry point using the existing `profile.role !== "patient"` pattern from `screens/ProfileScreen.js`

## 6. Navigation

- [x] 6.1 Register all new routes in `navigation/stacks/HealthStack.js` and/or `navigation/MainStack.js`
- [x] 6.2 Confirm no naming collisions with the routes added by `fix-consultation-booking-flow`

## 7. Verify

- [ ] 7.1 Manual walkthrough: list → detail → reschedule → cancel → reminder toggle
- [ ] 7.2 Manual walkthrough: check-in → queue tracker
- [ ] 7.3 Manual walkthrough: book a new appointment directly (not via consultation discovery)
- [ ] 7.4 Manual walkthrough: professional-role account sees Today's Agenda; patient-role account does not

Note on 1.1-1.3 (original, now superseded): reading `Telemedicine-nodejs-backend/src/domains/appointments/*` directly found no `GET /appointments/:id`, no generic update endpoint, and no reschedule/check-in/queue-position routes at the time these screens were built.

**Backend now implemented** (separate work session, same day): added real endpoints - `PUT /appointments/:id/reschedule` (preserves original duration if no new end time given), `POST /appointments/:id/checkin` (in-person only, patient-only), `GET /appointments/:id/queue-position` (computed from real checked-in appointments for the same provider/day, no separate queue table). Also fixed a real pre-existing bug found during integration: the Prisma `AppointmentType` enum uses `video|audio|chat|in_person`, but the frontend sends/displays `Video|Audio|Chat|Physical` - `create` was passing the frontend's capitalized string straight into the enum column, which would have thrown on every booking. Added `src/lib/appointmentTypes.js` (mirrors the existing `roleTypes.js` bridge pattern) and applied it in both directions on every appointment-returning endpoint. Frontend's reschedule call was also fixed to send a real ISO datetime instead of an ambiguous `"YYYY-MM-DD HH:MM"` string, and the "isn't wired up yet" copy across `AppointmentScreens.js`/`api/appointments.api.js` was corrected now that it's real.

**Verified via a full local run**: local Postgres + migration + `npm run dev`, then drove the full flow with curl - booked a Video and a Physical appointment (capitalized types round-trip correctly through the enum bridge in both directions), rescheduled, checked in, read a real queue position (`{"position":1}`), and cancelled, all against two real registered accounts.

## 8. Verify (added after backend implementation)

- [ ] 8.1 Manual browser/device walkthrough of all screens - not done. The API-level verification above (curl, real DB) confirms the backend contract and response shapes are correct, but no headless browser was available in this sandbox to actually click through the React Native UI, so this is a different, still-open verification step from 7.1-7.4 above.
