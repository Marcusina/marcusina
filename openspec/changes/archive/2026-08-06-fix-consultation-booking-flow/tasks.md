## 1. Safety check before deletion

- [x] 1.1 Grep the repo for `ConsultScreens`, `ConsultBookingScreen`, and `ConsultConfirmScreen` to confirm the only usages are the ones identified in `navigation/MainStack.js` — confirmed: only `navigation/MainStack.js` (import + 2 wrappers + 2 registrations) and `screens/ConsultScreens.js` itself reference these; no other call sites.
- [x] 1.2 Confirm whether a `POST /appointments` (or equivalent create) backend endpoint exists; if not, note it as a blocking backend dependency in this task list before proceeding — this repo contains no backend code (API_BASE_URL in `utils/config.js` points to an external service), so existence can't be confirmed statically. Proceeding per design.md: `createAppointment` is implemented against the REST convention already used by `getAppointments` (`/appointments/...`), and the confirm screen treats a failed request as a real error (no faked success) rather than assuming the endpoint works.

## 2. API client

- [x] 2.1 Add `createAppointment(payload)` to `api/appointments.api.js` following the existing `getAppointments` pattern (POST via `apiClient`)

## 3. Unify the booking flow

- [x] 3.1 Implement `ConsultBookingScreen` inside `screens/ConsultationScreens.js`, reading `proId` and `consultType` from `route.params`, reusing `getProfessional`/`initials` and the existing design language (`ScreenHeader`, `SectionLabel`, theme tokens) already used elsewhere in the file
- [x] 3.2 Implement `ConsultConfirmScreen` inside `screens/ConsultationScreens.js`, reading `proId`, `consultType`, `date`, `slot` from `route.params`, calling `createAppointment` on confirm, showing a loading state during the call, and an error state (via `toast`) on failure
- [x] 3.3 Update `ProfessionalProfileScreen`'s "Book Consultation" button to `navigation.navigate("ConsultBooking", { proId: pro.id, consultType })`
- [x] 3.4 Update the booking screen's "Confirm Booking" action to `navigation.navigate("ConsultConfirm", { proId, consultType, date, slot })`

## 4. Wire navigation

- [x] 4.1 Remove the `ConsultScreens` import and the `ConsultBookingScreenWrapper`/`ConsultConfirmScreenWrapper` wrapper components from `navigation/MainStack.js`
- [x] 4.2 Register the new `ConsultBookingScreen`/`ConsultConfirmScreen` (from `ConsultationScreens.js`) under the same `ConsultBooking`/`ConsultConfirm` route names in `navigation/MainStack.js`
- [x] 4.3 Delete `screens/ConsultScreens.js`

## 5. Close the loop into live-consult

- [x] 5.1 Add an `onPress` handler to appointment list items in `screens/AppointmentsListScreen.js` that navigates consultation-type appointments to `WaitingRoom` with the appropriate params
- [x] 5.2 Update `ConsultationHistoryScreen`'s item tap handler so scheduled (not-completed) consultations navigate to `WaitingRoom` instead of only `ConsultSummary`
- [x] 5.3 Verify `WaitingRoomScreen`'s existing chat-vs-video routing branch (lines ~387-389) correctly receives `consultType` from both new entry points — verified, and hardened the `"Chat"` string comparison to be case-insensitive since real appointment data's `appointment_type` casing isn't guaranteed to match the mock's exact "Chat"/"Video" labels

## 6. Verify

- [x] 6.1 Manual walkthrough: Find Doctor → profile → select type → book a slot → confirm → item appears in consultation history and appointment list → tap through to waiting room → correct live-session screen opens — **partially verified, not a full interactive click-through**: (a) all touched files pass a Babel syntax check against the project's own `babel-preset-expo` config, (b) a full `expo export --platform web` succeeded with 1,244 modules and zero errors, confirming no broken imports anywhere in the app (including the deleted `ConsultScreens.js`), (c) the web dev server boots and serves both the HTML shell and JS bundle with HTTP 200. Could not click through the live UI: this sandbox has no pre-installed browser-automation tool (no `chromium-cli`/cached Playwright browsers), and reaching the booking flow requires an authenticated session past onboarding, which requires either a local backend (none exists in this repo — it's frontend-only) or the live Render-hosted backend referenced in `.env` (`marcusina-backend.onrender.com`), for which no test credentials were available; creating a throwaway account or a real appointment against that live external service wasn't done without explicit sign-off. Flagged for the user rather than assumed.
- [x] 6.2 Confirm no remaining references to the deleted `ConsultScreens.js` file (re-run the grep from 1.1) — confirmed: only this change's own `openspec/changes/fix-consultation-booking-flow/*.md` planning docs mention it (as historical context), no application code references remain
