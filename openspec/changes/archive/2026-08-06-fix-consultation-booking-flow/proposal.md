## Why

The consultation booking flow is broken end-to-end: `ConsultScreens.js` and `ConsultationScreens.js` are two disconnected files, so tapping "Book Consultation" hands the user off to a screen with its own hardcoded doctor list, and the confirmation screen ignores whatever was actually picked (always renders "Dr. Sarah", a fixed date, a fixed price). No appointment is ever created or persisted, and the live-consultation join chain (waiting room, video/audio, chat) has zero reachable entry points anywhere in the app. This is the core Tier-1 patient journey the whole product is built around, and it currently cannot be completed even once.

## What Changes

- Remove the duplicate/disconnected booking pair in `ConsultScreens.js` (`ConsultBookingScreen`, `ConsultConfirmScreen`) and consolidate booking into the `ConsultationScreens.js` flow that already owns discovery (`CNS-01`/`02`/`03`).
- Thread selected doctor + consult type + slot as real navigation params from discovery (`CNS-01`/`02`) through type selection (`CNS-04`) into booking confirmation (`CNS-05`) — no more hardcoded confirm screen.
- On confirmation, create a real appointment record via `api/appointments.api.js` instead of only updating local component state.
- Wire the resulting booked appointment into the live-consult chain (`CNS-06` waiting room → `CNS-07`/`CNS-08` live session) so it is reachable from consultation history (`CNS-10`) and from the appointment list/detail once booked — closing the currently-orphaned `navigate()` gap.
- **BREAKING**: `ConsultBookingScreen` and `ConsultConfirmScreen` (in `ConsultScreens.js`) are removed; any existing navigation references to those route names are repointed to the unified flow in `ConsultationScreens.js`.

Out of scope: building the full `APT-02`–`08` appointment management module (reschedule, check-in, queue tracker, reminders, Pro agenda) — this change creates/reads the minimum appointment record needed to support a booked consultation, nothing more.

## Capabilities

### New Capabilities
- `consultation-booking`: End-to-end flow for selecting a professional, choosing a consultation type/slot, confirming and paying, and creating a persisted appointment tied to that consultation.
- `live-consultation-session`: Reachability and state handoff from a booked consultation into the waiting room and live video/audio/chat session screens.

### Modified Capabilities
(none — no existing specs yet in this repo)

## Impact

- `screens/ConsultScreens.js` — booking/confirm screens removed.
- `screens/ConsultationScreens.js` — discovery, type-selector, confirmation, waiting room, and live-session screens updated to share state via navigation params.
- `navigation/MainStack.js` (and any stack registering `ConsultBooking`/`ConsultConfirm`) — route registrations updated to point at the unified screens.
- `api/appointments.api.js` — consumed to create the appointment record on confirmation (may need a create/booking function if one doesn't already exist).
- `screens/AppointmentsListScreen.js`, `CNS-10` history — should reflect newly created appointments once this lands.
