## Context

`api/community.api.js` today only covers communities/groups (`getCommunities`, `getMyCommunities`, `joinCommunity`, `leaveCommunity`, `createCommunity`) — there is no post/feed endpoint client at all. `navigation/stacks/CommunityStack.js` routes the Community tab's `"Groups"` entry directly to `GroupsScreen.js`, with `Post` and `CreatePost` registered as siblings but only `Post` reachable via an explicit `initialPostId` param default (`"short-2"`) baked into the wrapper — meaning it only ever renders on manual deep-link, never from user interaction. `PostScreen.js` is a full-screen vertical Shorts-style viewer (swipe-through videos with likes/comments overlay), which is a different interaction model than `frontend.md`'s `COM-02` ("Post detail / comments" — implies a single post view, not an infinite vertical swipe feed).

## Goals / Non-Goals

**Goals:**
- Community tab lands on a real chronological feed (`COM-01`).
- Tapping a post in the feed opens a working detail/comments view.
- Publishing a post from `CreatePostScreen` actually persists and appears in the feed.
- Groups remains reachable, just not as the tab root.

**Non-Goals:**
- Rebuilding `PostScreen.js`'s Shorts-viewer UI from scratch — reuse it, but decide its role (see decision below) rather than throwing away 950 lines of working swipe/video UI.
- The other 23 `COM` screens (campaigns, Learning Hub, Pages, Spaces, Q&A, Expert Articles, Patient Stories, moderation, trust badges) — explicitly out of scope, tracked as future changes.
- Backend schema design for posts — this change specifies the client contract (`getFeed`, `createPost`, `getPost`) the backend must satisfy; if no such endpoints exist yet, ships with clear loading/error/empty states rather than mocked persistence.

## Decisions

- **`PostScreen.js` keeps its Shorts-viewer role for short-video content, and a new, separate `PostDetailScreen` (standard scrollable post + comments) is added for regular feed posts.** Alternative considered: repurpose `PostScreen.js` itself as `COM-02` — rejected because its swipe-through-multiple-videos interaction is fundamentally different from "open one post, see its comments," and forcing text/image posts through a vertical-swipe UI would be a worse experience than building the smaller, standard detail view `frontend.md` actually describes. `PostScreen.js` becomes the detail view specifically for short-video-type posts; text/image/poll posts open `PostDetailScreen`.
- **New `CommunityFeedScreen` becomes the Community tab's landing route**, replacing `Groups` as root in `CommunityStack.js`. `GroupsScreen` moves to route name `GroupsDirectory`, reachable from a "Groups" entry point on the feed (matching `frontend.md`'s own note that `COM-04` Groups directory is a distinct screen from the feed).
- **Extend `api/community.api.js`** (not a new file — posts are still "community" domain) with `getFeed(params)`, `createPost(payload)`, `getPost(postId)`, matching the existing function style (token param, `apiClient` calls).
- **`CreatePostScreen`'s tab cosmetics get resolved per-tab**: Post/Article submit through `createPost` with a `type` field; Poll reuses whatever poll-composer fields already exist in the file (per `frontend.md`, poll is a post type, not a separate composer); Reel submission routes to whatever short-video capture/upload exists, or is disabled with a clear "coming soon" if no video-upload capability exists yet — not silently doing nothing as it does today.
- **`GroupsScreen`'s FAB** gets wired to `createCommunity` (create a new group), since that's what a groups-directory FAB should do — not repurposed into post creation, which already has its own entry point via the global "+" quick-action sheet.

## Risks / Trade-offs

- [No backend feed/post endpoints may exist yet] → Task list confirms/adds the contract; ships with real empty/error states, not mocks, consistent with the rest of this change set.
- [Splitting post detail into two screens (Shorts vs. standard) adds a branch at the feed's tap-handler] → Branch on the tapped post's `type` field (already implied by "poll as a post type" and Reel/Post/Article tabs in `CreatePostScreen`), a single `if` at the point of navigation, not a deep architectural split.
- [Moving `Groups` off the tab root changes an existing entry point] → Confirm no other screen hardcodes navigation assuming `"Groups"` is the Community tab's initial route before making the change (`GroupsScreenWrapper`'s own `onBackHome` currently navigates to `"Groups"` — must be updated too).

## Migration Plan

1. Add `getFeed`, `createPost`, `getPost` to `api/community.api.js`.
2. Build `CommunityFeedScreen`.
3. Build `PostDetailScreen` for standard (non-Shorts) posts.
4. Wire `CreatePostScreen`'s submit action(s) to `createPost`.
5. Update `CommunityStack.js`: `CommunityFeedScreen` becomes root; `GroupsScreen` re-registered as `GroupsDirectory`; fix `onBackHome`/entry points that assumed `Groups` was root.
6. Wire `GroupsScreen`'s FAB to `createCommunity`.
7. Manual smoke test: open Community tab → see feed → tap a post → detail/comments → back → open Groups from feed → create a post from the "+" sheet → confirm it appears in the feed.
