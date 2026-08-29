## Why

`screens/AppointmentsListScreen.js` is the only appointment screen that exists today: it lists appointments from a real API (`getAppointments`) but list items are plain, non-interactive `View`s with no `onPress` — there is no way to view an appointment's detail, reschedule it, cancel it, check in, track a queue position, set a reminder, or (for professionals) manage a daily agenda. This is `frontend.md` module 9 (`APT`), a Tier-1 MVP module, currently at 1 of 8 screens.

## What Changes

- Add appointment detail (`APT-03`): tap-through from the list to a full view (provider, location/link, prep instructions, status, reason).
- Add reschedule/cancel flow (`APT-04`) from the detail screen.
- Add check-in (`APT-05`): QR/ID/confirmation-code check-in for physical appointments.
- Add live queue position tracker (`APT-06`), shown post check-in.
- Add per-appointment reminder settings (`APT-07`).
- Add a booking entry point (`APT-02`) for appointments not originating from the consultation-discovery flow (e.g. rebooking, direct calendar-slot booking) — reuses the appointment-creation API introduced by `fix-consultation-booking-flow` rather than duplicating it.
- Add a Professional-mode "Today's Agenda" view (`APT-08`), gated the same way other `[Pro]` screens in this app are (role check on the user profile).
- Make `AppointmentsListScreen` list items tappable into the new detail screen.

## Capabilities

### New Capabilities
- `appointment-detail`: Viewing a single appointment's full detail, including reschedule/cancel actions and reminder settings.
- `appointment-checkin`: QR/code check-in for physical appointments and live queue position tracking.
- `professional-agenda`: Professional-mode daily agenda / manage-appointments view.

### Modified Capabilities
- `consultation-booking`: extended so the appointment-creation client function it introduces is reused for non-consultation appointment booking (`APT-02`), not duplicated. (Depends on `fix-consultation-booking-flow` landing first, or on this change adding the same `createAppointment` client function if that change hasn't merged yet — see design.md.)

## Impact

- `screens/AppointmentsListScreen.js` — add `onPress` per item, wire into detail.
- New screens for detail, reschedule/cancel, check-in, queue tracker, reminders, booking, and Pro agenda (naming/location decided in design.md).
- `navigation/stacks/HealthStack.js` and/or `navigation/MainStack.js` — register the new routes.
- `api/appointments.api.js` — add `getAppointmentById`, `updateAppointment` (reschedule/cancel/check-in status transitions), and reuse/add `createAppointment`.
