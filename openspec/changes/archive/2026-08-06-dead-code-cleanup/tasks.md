## 1. Verify before deleting

- [x] 1.1 Re-run a repo-wide search for `screens/HealthScreens` import references; confirm zero matches — confirmed, only this change's own planning docs reference it
- [x] 1.2 Re-confirm no call sites for `onOpenProfile(`, `onConsult(`, `onOpenGroups(`, `onOpenPlace(` in `screens/HomeScreen.js` — confirmed, still zero call sites (re-checked after this session's other changes touched `HomeStack.js`/`GroupsScreen.js`, in case wiring had changed; it hadn't)
- [x] 1.3 Re-confirm no call sites for `onBackHome(`/`onLogout(` in the affected `screens/ProfileScreen.js` components — confirmed, zero call sites; affected components are `HealthProfileScreen` (destructures both `onBackHome` and `onLogout`) and `PublicProfileScreen` (destructures `onBackHome`)

## 2. Remove dead file

- [x] 2.1 Delete `screens/HealthScreens.js`

## 3. Remove dead props

- [x] 3.1 Remove `onOpenProfile`/`onConsult`/`onOpenGroups`/`onOpenPlace` from `navigation/stacks/HomeStack.js`'s pass-through to `HomeScreen` — kept `onOpenPost`/`onOpenCreatePost`, which are outside this cleanup's scope (not flagged as dead)
- [x] 3.2 Remove the corresponding destructuring from `screens/HomeScreen.js` — left `onOpenAppointments` alone: it's a different kind of gap (used in JSX but never passed by the caller, the inverse problem), out of this change's scope, and belongs with `add-appointment-management`
- [x] 3.3 Remove `onBackHome`/`onLogout` from `screens/ProfileScreen.js`'s affected component signatures and their callers — removed from `HealthProfileScreen`/`PublicProfileScreen` and their wrappers in `navigation/stacks/MeStack.js`; also removed the now-unused `handleLogout` destructure from `useUser()` in `HealthProfileScreenWrapper`

## 4. Verify

- [x] 4.1 Run the app; confirm Home, Health Hub, and Profile screens still render and navigate correctly — **not performed as a live interactive walkthrough**, same constraint as every other change in this set: no browser-automation tool in this sandbox, no test credentials for the live Render-hosted backend (no local backend exists in this repo). Verified instead via a full `expo export --platform web` bundle (zero errors).
- [x] 4.2 Confirm no build/lint errors from the removed imports or props — no ESLint config exists in this repo (checked; only vendored configs inside `node_modules`), so "lint" here means: (a) a Babel syntax check against the project's own `babel-preset-expo` config on every touched file, and (b) the full `expo export --platform web` bundle, both clean. This also positively confirms no leftover references to any removed prop/import anywhere in the ~1,244-module bundle.
