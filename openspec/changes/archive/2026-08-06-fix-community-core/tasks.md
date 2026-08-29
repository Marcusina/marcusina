## 1. API layer

- [x] 1.1 Add `getFeed(params)`, `createPost(payload)`, `getPost(postId)` to `api/community.api.js`, matching the existing token/`apiClient` pattern

## 2. Feed and detail screens

- [x] 2.1 Build `CommunityFeedScreen` (chronological list of posts) — new `screens/CommunityScreens.js`, real `getFeed` call with honest loading/error/empty states (no mock feed data), per design's non-goal on backend schema
- [x] 2.2 Build `PostDetailScreen` for standard (non-short-video) posts, with comments — comments are read-only (rendered from `getPost`'s response), no comment-composer added since it's outside the design's listed API surface (`getFeed`/`createPost`/`getPost` only)
- [x] 2.3 Wire feed item taps: short-video posts → existing `PostScreen`, other types → new `PostDetailScreen` — branches on `post.type === "reel"`

## 3. Publishing

- [x] 3.1 Wire `CreatePostScreen`'s Post/Article submit action to `createPost` — the single top-bar "Post" button now calls `createPost` with `type` set from the active tab; previously had no `onPress` at all
- [x] 3.2 Wire the Poll tab's existing fields into `createPost` with `type: "poll"` — **design.md assumed poll-composer fields already existed in the file; they did not** (the Post/Reel/Poll/Article tabs were purely cosmetic, no conditional rendering anywhere). Added minimal poll option inputs (2 free-text options, extendable) shown only when the Poll tab is active, submitted as `poll_options`. Flagging this as a design.md correction, not just an implementation detail.
- [x] 3.3 Resolve the Reel tab: wire to real video upload if a capability exists, otherwise disable with a clear "coming soon" state (not a silent no-op) — no video-upload capability exists (expo-video is playback-only); Reel tab now shows an explicit "coming soon" notice and the Post button is disabled/no-ops with a toast instead of silently doing nothing
- [x] 3.4 Confirm a newly published post appears in `CommunityFeedScreen` — on success, `createPost`'s mutation invalidates the `["communityFeed"]` query key so the feed refetches; not confirmed against a live backend (see task 6)

## 4. Navigation restructure

- [x] 4.1 Update `navigation/stacks/CommunityStack.js`: make `CommunityFeedScreen` the root route; re-register `GroupsScreen` as `GroupsDirectory`
- [x] 4.2 Update `GroupsScreenWrapper`'s `onBackHome` (and any other reference assuming `Groups` is root) to point at the feed instead — also fixed `navigation/stacks/HomeStack.js`'s `onOpenGroups` (`{ screen: "Groups" }` → `{ screen: "GroupsDirectory" }`), found via a repo-wide grep for `"Groups"` route references
- [x] 4.3 Add a "Groups" entry point from the feed to `GroupsDirectory` — a "Groups" button in `CommunityFeedScreen`'s header

## 5. Groups FAB

- [x] 5.1 Wire `GroupsScreen`'s FAB to a real create-group flow calling `createCommunity`, replacing the current "coming soon" toast — added a minimal inline create-group overlay (name field + Create/Cancel), invalidates the communities queries on success

## 6. Verify

- [x] 6.1-6.4 Manual walkthroughs — **not performed as live interactive click-throughs**, same constraint noted throughout this change set: no browser-automation tool in this sandbox, and no test credentials for the live Render-hosted backend (no local backend exists in this repo). What was verified instead: (a) all touched/added files pass a Babel syntax check against the project's own `babel-preset-expo` config, (b) a full `expo export --platform web` bundled successfully with zero errors, confirming every new/changed screen's imports/exports resolve (including the navigation route renames — `Groups` → `GroupsDirectory`, new root `CommunityFeed`) and nothing else in the app broke. Flagging for the user rather than assuming a pass.
