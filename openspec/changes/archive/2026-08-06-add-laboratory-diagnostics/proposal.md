## Why

`frontend.md` module 11 (`LAB`, Laboratory & Diagnostics) does not exist anywhere in the codebase — zero files, components, or routes. It is a Tier-1 MVP module (`LAB-01/02/04` are explicitly listed in the spec's MVP Sequencing), and its absence is one of the reasons the core "book → attend → get prescribed → get tested" clinical loop cannot be completed today: a professional can prescribe (once `add-prescription-management` lands) but there is no way for a patient to see, track, or view lab/imaging results anywhere in the app, and `HealthHubScreen`'s "Records" group has no entry point for it.

## What Changes

- Add `LAB-01` My lab & imaging orders (Pending / Completed) list.
- Add `LAB-02` order status tracker.
- Add `LAB-03` select preferred lab/diagnostic center.
- Add `LAB-04` result viewer, including radiology results.
- Add `LAB-05` result trend chart (for repeat lab values over time).
- Add `LAB-06` share result with a professional — deep-links into the Consent Center (`CON-01`) per the spec's own architecture principle that sharing always routes through consent, not a bespoke per-module share UI.
- Add `LAB-07` **[Pro]** order lab/radiology test for a patient, gated the same way as other `[Pro]` screens.
- Add a "Laboratory & Diagnostics" entry point to `HealthHubScreen`'s Records group.

## Capabilities

### New Capabilities
- `lab-orders`: Viewing lab/imaging orders, their status, and selecting a preferred lab/diagnostic center.
- `lab-results`: Viewing individual results (including radiology), trend charts across repeat results, and sharing a result with a professional via the Consent Center.
- `professional-lab-ordering`: Verified professionals ordering a lab/radiology test for a patient.

### Modified Capabilities
- `consent-management` (if/when a `CON-01` capability spec exists from a prior change — otherwise this is documented as a dependency, not a modification, since no consent spec exists yet in this repo).

## Impact

- New screens for the full `LAB` module (naming/location decided in design.md).
- `screens/HealthHubScreen.js` — add a NavCard under "Records" linking to the new lab orders list.
- `navigation/stacks/HealthStack.js` and/or `navigation/MainStack.js` — register the new routes.
- New `api/labs.api.js` for order/result fetch — no lab-related API client exists today.
- `screens/ConsentScreen.js` — `LAB-06`'s share action deep-links here rather than building its own share UI, consistent with the spec's Consent Center principle.
