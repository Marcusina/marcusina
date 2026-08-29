## Why

`frontend.md`'s Community module (`COM`) defines `COM-01` as a chronological feed — the tab's actual landing screen. Today, `CommunityStack.js` routes the Community tab straight to `GroupsScreen.js`, a groups directory, not a feed; there is no `COM-01` at all. `PostScreen.js` (950 lines, a TikTok-style vertical Shorts viewer) is registered in navigation but has zero reachable `navigate("Post")` call sites anywhere in the app — dead code. `CreatePostScreen.js` has cosmetic Post/Reel/Poll/Article tabs that render identical content regardless of selection, and its post-submission action has no `onPress` at all, so nothing can actually be published. This leaves the entire Community tab — one of the app's five bottom-nav destinations — without a working core loop (view a feed, open a post, publish a post).

## What Changes

- Add a real `COM-01` Community Feed as the Community tab's landing screen (chronological, not the groups directory).
- Make the Community tab's landing route `CommunityFeed` instead of `Groups`; move Groups to its own directory entry point (`COM-04`) reachable from the feed/hub, not the tab root.
- Fix `PostScreen.js`'s reachability: wire real `navigate("Post", { postId })` call sites from the new feed (tapping a post opens detail/comments, matching `COM-02`), and reconcile its current Shorts-viewer UI against whether it should represent `COM-02` (post detail/comments) or a distinct short-video surface — resolved in design.md.
- Fix `CreatePostScreen.js`'s submit action so posts are actually published (calls a real API, appears in the feed) rather than being a silent no-op; keep or drop the Reel/Poll/Article tab cosmetics based on whether they render meaningfully different UI once wired (poll composer already partially exists elsewhere per `frontend.md`'s `COM-03` "includes poll as a post type").
- Wire `GroupsScreen`'s FAB to a real create-group flow, or explicitly route it to the same create-post composer if creating a group post is the intent — currently a "coming soon" toast.

## Capabilities

### New Capabilities
- `community-feed`: Chronological feed of community posts, reachable as the Community tab's landing screen, with working post detail/comments and a working publish action.

### Modified Capabilities
(none — no existing specs yet for this repo's Community module)

## Impact

- `screens/GroupsScreen.js` — no longer the tab's landing screen; its FAB gets a real action.
- `screens/PostScreen.js` — reachability fixed; role clarified (feed post detail vs. standalone Shorts).
- `screens/CreatePostScreen.js` — submit action wired to a real publish call.
- `navigation/stacks/CommunityStack.js` — landing route changed to the new feed screen; `Groups` becomes a secondary route.
- New/extended `api/community.api.js` — add a feed-fetch function and a real create-post function if neither already covers this (existing file only has group-related calls per current usage in `GroupsScreen.js`).
