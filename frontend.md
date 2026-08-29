# MedGram App — Frontend Screen Architecture
**Scope:** MedGram App only — patients and healthcare professionals operating in-app. Excludes MedGram OS (Workspace), Developer Platform, and Administration Platform.
**Purpose:** Screen-by-screen inventory for UI/UX design and frontend build — Figma file structure, navigation architecture, user flow mapping, and MVP sequencing.

---

## How to use this document
Each screen has an ID (`MODULE-##`) for referencing in Figma pages/frames, tickets, and QA. Screens marked **[Pro]** only appear when the logged-in user has verified professional status — same account, same app, elevated by role. Cross-cutting states (empty/loading/error/consent modals) are listed once near the end rather than repeated per screen. A full architecture critique and long-term roadmap follow the screen inventory.

---

## Architectural Domains

Every screen in this app belongs to exactly one of these domains. Organization and Administration are included for completeness but are almost entirely out of scope for this app — they belong to MedGram OS and the Admin Platform respectively; the App only touches their edges (invitations, org switching).

| Domain | Owns |
|---|---|
| Identity | MedGram ID, verification, recovery, emergency identity |
| Healthcare | Records, appointments, consultations, prescriptions, labs, insurance, care plans |
| Communication | Messaging, chat, calls, broadcasts, notifications |
| Finance | Wallet, payments, funding, receipts |
| Community | Feed, groups, pages, spaces, events, learning |
| Marketplace | Discovery, booking, commerce |
| AI | Embedded assistance across every other domain — not a destination of its own |
| Organization *(edge only)* | Invitations, workspace switching |
| Administration *(out of scope)* | Lives entirely in the Admin Platform |

---

## 0. Global App Shell — `SHL`

| ID | Screen |
|---|---|
| `SHL-01` | Splash screen |
| `SHL-02` | Bottom navigation — **Home · Health · Community · Marketplace · Me** |
| `SHL-03` | Global search — doctors, hospitals, patients (Professional Mode), medicines, medical records, community posts, groups, pages, marketplace products, appointments, organizations |
| `SHL-04` | Global "+" quick action sheet — Book appointment / Message / Request refill / Log symptom / Activate Emergency Mode |
| `SHL-05` | AI Assistant entry point (persistent floating action) |
| `SHL-06` | Patient/Professional mode switcher |
| `SHL-07` | Search results screen — tabbed by content type |
| `SHL-08` | Messages quick-access icon (top bar) — opens the Communication Center (`MSG-01`) |
| `SHL-09` | Offline status banner + cached-data indicator (shows when the device has no connectivity; surfaces which screens are running on cached data) |
| `SHL-10` | Command palette / global quick-action launcher (keyboard/search-driven; highest value in Professional Mode on tablet/web) |

---

## 1. Onboarding & Authentication — `ONB`

1. `ONB-01` Splash / language selection
2. `ONB-02` Welcome / value proposition carousel
3. `ONB-03` Sign-up method selection — Google / Apple / Email / Phone
4. `ONB-04` Basic information (name, DOB, gender, country, preferred language) — auto-filled from Google/Apple where available
5. `ONB-05` Phone verification (SMS OTP)
6. `ONB-06` Email verification (Email OTP) — skipped if already verified via social sign-in
7. `ONB-07` Security setup — password, biometric (Fingerprint/Face ID); Passkeys and Authenticator App support flagged for later (see Strategic Recommendations)
8. `ONB-08` Health Basics — quick capture of blood group, known allergies, chronic conditions (seeds the Emergency Profile at `ID-03`)
9. `ONB-09` MedGram ID generation & reveal
10. `ONB-10` Onboarding tour (guided walkthrough of Home / Health / Community / Marketplace / Me)
11. `ONB-11` Hand-off to Home (`HOME-01`)
12. `ONB-12` Login screen — supports MedGram ID, email, or phone as the identifier
13. `ONB-13` Account/credential recovery flow (method select → verify → reset)
14. `ONB-14` Activation flow for organization-assisted registrations (deep link from SMS/email → claim identity → set own credentials)
15. `ONB-15` **Duplicate account detected** — if phone/email matches an existing hospital-created record during signup, offer claim/merge instead of creating a second identity
16. `ONB-16` Professional verification application (profession category → license/certificate upload → academic docs → gov ID → review)
17. `ONB-17` Professional verification status (pending / additional info required / approved)

---

## 2. Home / Dashboard — `HOME`

`HOME-01` is a personalized daily-brief dashboard, not a feed. It should answer: *"what's the most important thing I need to know or do today?"*

Widgets/cards:
- AI Summary (`AI-05`)
- Upcoming Consultations (`CNS-10`)
- Upcoming Appointments (`APT-01`)
- Medication Reminders (`RX-07`)
- Health Alerts (abnormal results, overdue vaccinations, care plan flags)
- Continue Consultation (resume an in-progress async/chat consultation)
- Pending Payments (`PAY-01` outstanding items)
- Quick Actions (`SHL-04`)
- Wallet shortcut (`PAY-01`)
- Marketplace Recommendations (`MKT-01` excerpt)
- Community Highlights (`COM-01` excerpt)
- Recent Activity (`SET-13` excerpt)

Other screens:
- `HOME-02` First-time / empty-state home (onboarding checklist instead of history)
- `HOME-03` **[Pro]** Professional home — today's schedule, pending consultation requests, patients awaiting follow-up

---

## 3. Identity & Recovery — `ID`

1. `ID-01` My Digital Health Identity (QR code + ID number + digital card — this doubles as the Emergency Card view)
2. `ID-02` Request physical health card flow
3. `ID-03` Emergency medical profile setup (blood group, genotype, allergies, chronic conditions, medications, implants, emergency contacts)
4. `ID-04` Emergency privacy settings — per-field: *Public / Verified-professional-only / Never disclose*
5. `ID-05` Emergency access audit log (who accessed, when, why)
6. `ID-06` Public Emergency Profile view (bystander scan result — minimal, read-only, cached for offline access)
7. `ID-07` **[Pro]** Scan patient ID/QR (verified emergency access, justification prompt, audit-logged)
8. `ID-08` MedGram Passport — compiles vaccination certificates, chronic condition summary, and emergency profile into a portable, travel/border-ready credential
9. `ID-09` Recover MedGram ID (lost or disputed identity number)
10. `ID-10` Replace Digital/Physical Card
11. `ID-11` Suspend Identity (suspected fraud, stolen device)
12. `ID-12` Reissue Identity (post-suspension or major life change)
13. `ID-13` Identity Verification & Change History
14. `ID-14` **Identity & Account Recovery Center** — single hub linking `ONB-13`, `ID-09`–`ID-12`, so users don't need to already know which specific flow they need
15. `ID-15` **Merge Duplicate Accounts** — self-service flow for a user who discovers they have two identities later (verification → confirm → merge)
16. `ID-16` Identity Confidence Indicator — patient-facing status badge/explainer shown when an account has unresolved verification steps
17. `ID-17` Device Transfer — move an active MedGram ID session to a new device

*`ID-01`, `ID-03`, and `ID-08` are reachable as shortcut cards from both the Health hub and the Me tab — same screens, two entry points, never duplicated builds.*

---

## 4. Consent Center — `CON`

Single control panel for every data-sharing relationship the patient has granted — replaces what would otherwise be a scattered set of per-module "who can see this" screens.

1. `CON-01` Consent Center — full list of active consents (organizations, professionals, Care Circle members, researchers, insurers, third-party apps), grantable/revocable in one place
2. `CON-02` Grant/Revoke Consent detail (scope, duration, data categories covered)

*Per-context access logs (`PHR-04`, `ID-05`, `ID-13`, `CARE-06`) remain domain-scoped and feed into this center as read receipts — they are not replaced by it.*

---

## 5. Document Vault — `VLT`

For unstructured documents that aren't tied to a clinical encounter — distinct from the Unified Health Record, which only contains structured, provider-issued entries.

1. `VLT-01` Document Vault — upload/store scanned paper records, ID documents, insurance cards, old records from before MedGram
2. `VLT-02` Document detail/viewer (reuses the `PHR-06` viewer component)

---

## 6. Health Hub — `HLT`

The Health tab's landing point and the permanent home for all clinical information. Built as **categorized sections, not a flat list** — at 15+ sub-features, a flat list would itself become a scalability problem.

1. `HLT-01` **Health Hub** — grouped into: *Records* (`PHR`, `LAB`, `VLT`) · *Care* (`APT`, `CNS`, `RX`, `REF`, `CRP`) · *Identity & Coverage* (`ID-01`, `ID-08`, `INS-01`) · *Insights* (`AI-05`, `HLT-02`)
2. `HLT-02` Health Timeline — single chronological feed of every clinical event (appointments, consultations, diagnoses, prescriptions, lab/radiology results, vaccinations, admissions, surgeries, emergency visits), with in-page search/filter
3. `HLT-03` Generate Health Report — assemble selected record types into a shareable/downloadable PDF summary (referrals, travel, insurance claims, second opinions)

*Future, not yet designed — flagged as placeholders on `HLT-01`: Wearable Device connection, Health Goals. The Timeline's underlying data model should accept arbitrary event types now, even before these ship, to avoid a schema migration later.*

---

## 7. Personal Health Record — `PHR`

1. `PHR-01` Health Record home — tabbed: Overview / Diagnoses / Allergies / Medications / Immunizations / Labs / Imaging / Surgical History / Vitals / Family History
2. `PHR-02` Record entry detail (source org, date, provider, notes)
3. `PHR-03` Add self-reported info (allergies, lifestyle, family history — marked "patient-reported" vs. clinical)
4. `PHR-04` Consent & access log for the record (feeds `CON-01`)
5. `PHR-05` Share Health Record (consent-governed) — scoped, time-limited link, deep-linked from `CON-01`
6. `PHR-06` Document/report viewer (supports offline caching for Download Center)
7. `PHR-07` Vaccination record & certificate (feeds `ID-08` Passport)

---

## 8. Consultations — `CNS`

**End-to-end patient journey:**

```
Marketplace (MKT-11 Find Doctor)
   → Doctor Profile (CNS-02)
   → Book Consultation (CNS-04, CNS-05 payment)
   → Appointment Created (APT-03)
   → Health Hub (HLT-01) → Upcoming Consultation (CNS-10)
   → Join Consultation (CNS-06 waiting room → CNS-07/08 live)
   → Diagnosis + Prescription (CNS-09 summary → RX-09 [Pro])
   → Laboratory / Radiology Request (LAB-07 [Pro])
   → Timeline Updated (HLT-02)
```

Discovery and booking (`CNS-01`–`05`) are entry-linked from Marketplace, not a standalone nav item. `CNS-06` onward live in Health once a consultation is booked, since it's now part of the clinical record.

1. `CNS-01` Find a professional/organization — filters: specialty, fee, rating, language, availability, consult type, AI-personalized ranking
2. `CNS-02` Professional profile
3. `CNS-03` Organization profile
4. `CNS-04` Consultation type selector (physical / video / audio / secure chat / follow-up)
5. `CNS-05` Booking confirmation & payment
6. `CNS-06` Pre-consultation waiting room
7. `CNS-07` Live video/audio consultation UI
8. `CNS-08` Async chat-based consultation UI
9. `CNS-09` Post-visit consultation summary
10. `CNS-10` Consultation history list
11. `CNS-11` Rate & review professional
12. `CNS-12` Instant/emergency consultation ("connect me now")
13. `CNS-13` **[Pro]** Incoming consultation requests queue
14. `CNS-14` **[Pro]** Availability manager (recurring rules)
15. `CNS-15` **[Pro]** In-consultation clinical documentation panel (AI-assisted note drafting)
16. `CNS-16` **[Pro]** Quick patient chart view during live consult

*Multi-professional / second-opinion consultations and pediatric consults involving a managed dependent were reviewed: the latter is already handled by the existing dependent-profile switch (`CARE-04`) with no new screens needed; the former is deferred — see Strategic Recommendations.*

---

## 9. Appointments — `APT`

1. `APT-01` My appointments (Upcoming / Past)
2. `APT-02` Book appointment — calendar/slot picker
3. `APT-03` Appointment detail (location, provider, prep instructions, estimated total care time)
4. `APT-04` Reschedule / cancel flow
5. `APT-05` Check-in (QR scan / ID number / confirmation code)
6. `APT-06` Live queue position tracker
7. `APT-07` Reminder settings for a specific appointment
8. `APT-08` **[Pro]** Today's Agenda / Manage Appointments

---

## 10. Electronic Prescriptions — `RX`

1. `RX-01` My prescriptions (Active / Expired / All)
2. `RX-02` Prescription detail
3. `RX-03` Prescription QR/verification code view
4. `RX-04` Find pharmacy with stock (map + list, price comparison where permitted)
5. `RX-05` Reserve/order medication → Marketplace checkout
6. `RX-06` Refill request flow
7. `RX-07` Medication reminder setup
8. `RX-08` Medication history / adherence timeline
9. `RX-09` **[Pro]** Create prescription
10. `RX-10` **[Pro]** Drug interaction / allergy alert modal

---

## 11. Laboratory & Diagnostics — `LAB`

1. `LAB-01` My lab & imaging orders (Pending / Completed)
2. `LAB-02` Order status tracker
3. `LAB-03` Select preferred lab/diagnostic center
4. `LAB-04` Result viewer — includes radiology results
5. `LAB-05` Result trend chart
6. `LAB-06` Share result with a professional
7. `LAB-07` **[Pro]** Order lab/radiology test for a patient

*Radiology booking as a service lives in Marketplace (`MKT-15`); radiology records live here.*

---

## 12. Insurance — `INS`

1. `INS-01` My Insurance Plans & Coverage
2. `INS-02` Claims History

*Purchasing a new plan happens via Marketplace Products (`MKT-20`); this module manages an existing plan as a funding source, cross-referenced from `PAY-03`.*

---

## 13. Care Plans — `CRP`

1. `CRP-01` My Care Plans (chronic disease management, wellness programs)
2. `CRP-02` Care Plan Detail & Task Tracker

---

## 14. Referrals — `REF`

1. `REF-01` My referrals with status tracker (Created → Sent → Accepted → Scheduled → Closed)
2. `REF-02` Referral detail
3. `REF-03` Referral consent/approval screen
4. `REF-04` Referral feedback view

---

## 15. Emergency Mode — `EMG`

1. `EMG-01` Activate Emergency Mode — one-tap action that broadcasts location and the Emergency Profile (`ID-03`) to Care Circle and nearest verified responders; functions on cached data when offline (see `SHL-09`)

---

## 16. Unified Calendar — `CAL`

1. `CAL-01` Unified calendar view — auto-synchronizes appointments, consultations, medication reminders, vaccination due dates, lab bookings, community events/Spaces, and follow-ups
2. `CAL-02` Calendar sync settings — Google Calendar, Apple Calendar, Outlook

---

## 17. Community — `COM`

1. `COM-01` Community Feed
2. `COM-02` Post detail / comments
3. `COM-03` Create post composer (includes poll as a post type)
4. `COM-04` Groups directory
5. `COM-05` Group home
6. `COM-06` Health Campaigns & Events list
7. `COM-07` Campaign/event detail
8. `COM-08` Learning Hub library (articles/videos/courses)
9. `COM-09` Learning content detail/player
10. `COM-10` Public profile view (follow a professional or organization)
11. `COM-11` Verification badge info modal
12. `COM-12` Report content / moderation flow
13. `COM-13` Pages directory
14. `COM-14` Page home
15. `COM-15` Spaces list
16. `COM-16` **Space — live room UI**: audio, video, screen sharing, live chat, raise hand, moderator controls, AI transcription, AI captions, recording, live Q&A
17. `COM-17` Space replay viewer
18. `COM-18` Expert Articles hub
19. `COM-19` Patient Stories hub (moderated)
20. `COM-20` Story detail
21. `COM-21` Q&A hub
22. `COM-22` Question detail / answer thread
23. `COM-23` Ask a Question composer
24. `COM-24` Poll results view
25. `COM-25` Campaign detail with registration/participation tracking
26. `COM-26` Trust Level legend/reference

**Who can host Spaces:** Verified Professionals, Verified Organizations, Government Agencies, Page owners, Group admins. Patients participate per the host's permissions.

**Trust model** (badge shown consistently across Feed, Groups, Pages, Spaces, comments):

| Trust Level | Verified Via |
|---|---|
| Government Agency | Public-sector partnership |
| Verified Healthcare Organization | Organization onboarding |
| Verified Healthcare Professional | Professional verification (`ONB-16`/`17`) |
| Verified NGO | NGO verification track |
| Patient | Default account — no special badge |

**Moderation note:** `COM-12` is currently reactive-only (report → review). Recommend adding proactive AI-assisted misinformation flagging — content-integrity scanning across Feed/Groups/Pages that surfaces unverified medical claims for review before they spread, not just after a user reports them. This is an embedded AI capability (see AI Distribution Map below), not a new screen.

---

## 18. Marketplace — `MKT`

`MKT-01` is tabbed **Healthcare Services** / **Healthcare Products**.

1. `MKT-01` Marketplace home
2. `MKT-02` Product listing & filters
3. `MKT-03` Product detail
4. `MKT-04` Service listing
5. `MKT-05` Program detail (chronic disease management, wellness plans, insurance)
6. `MKT-06` Cart
7. `MKT-07` Checkout & payment
8. `MKT-08` Order tracking
9. `MKT-09` Order history — covers both product orders and service bookings (Ambulance, Home Care, etc.)
10. `MKT-10` Vendor/organization storefront view
11. `MKT-11` Healthcare Services hub (Find Doctor entry point → `CNS-01`)
12. `MKT-12` Hospitals directory
13. `MKT-13` Clinics directory
14. `MKT-14` Laboratories directory
15. `MKT-15` Radiology Centers directory
16. `MKT-16` Ambulance request
17. `MKT-17` Home Care booking
18. `MKT-18` Physiotherapy booking
19. `MKT-19` Vaccination Services booking
20. `MKT-20` Healthcare Products hub (Medicines → `RX-04`/`05`, Medical Equipment, Wellness Products, Insurance → `INS-01`)

**Principle:** Marketplace owns discovery, booking, and payment. Health owns the resulting long-term record.

---

## 19. Wallet & Finance — `PAY`

1. `PAY-01` Wallet/Health Funding home (balance + funding-source breakdown)
2. `PAY-02` Fund wallet (card / bank / mobile money)
3. `PAY-03` Manage funding sources (employer benefit, insurance, NGO/charitable program)
4. `PAY-04` Transaction history (with search/filter)
5. `PAY-05` Receipt & Invoice Center
6. `PAY-06` Refund status
7. `PAY-07` Recurring payments / subscription manager (scheduled transfers included)
8. `PAY-08` Payment method management
9. `PAY-09` Family & Care Circle Wallet — shared funding pool across dependents
10. `PAY-10` **[Pro]** Professional Earnings & Payouts
11. `PAY-11` Wallet-to-Wallet Transfer (via MedGram ID)
12. `PAY-12` QR Payment (scan-to-pay at a hospital/pharmacy counter)
13. `PAY-13` Emergency Health Fund — community-fundable wallet for a specific patient's urgent costs
14. `PAY-14` Health Expense Categories & Spend Breakdown
15. `PAY-15` Payment Analytics dashboard

*Organization Wallet and Insurance Wallet are out of scope — those belong to MedGram OS and insurer-side systems respectively.*

---

## 20. Communication Center — `MSG`

Reframed from a flat messaging module into a unified inbox, since Communication is now its own domain spanning multiple existing channel types.

1. `MSG-01` **Unified Inbox** — tabs: Direct Messages, Consultation Chats, Care Circle, Marketplace/Vendor, Broadcasts, AI
2. `MSG-02` Conversation thread (shared component reused across channel types — text, image, voice note, document attachments)
3. `MSG-03` New message composer
4. `MSG-04` Broadcast/announcement viewer (read-only, from verified orgs)
5. `MSG-05` Marketplace/Vendor chat thread — order-specific chat with a pharmacy/lab/vendor
6. `MSG-06` Voice/video call UI — for ad-hoc calls outside a scheduled consultation (e.g., calling a Care Circle member)

*Message search is handled by the global search (`SHL-03`/`07`), not a separate screen. Reached via the persistent top-bar icon (`SHL-08`), not a bottom-nav tab.*

---

## 21. Notifications — `NOT`

1. `NOT-01` Notification center — tabbed: **Health · Community · Marketplace · Professional**
2. `NOT-02` Notification detail with deep-link handling
3. `NOT-03` Notification preferences — per domain (channel, frequency, quiet hours)

---

## 22. AI — Distribution Map

Per architectural principle, AI is not a destination — it's embedded infrastructure. There is no dedicated AI tab. `AI-01`–`05` are conversational/dashboard surfaces; everything else below is an embedded component within an existing screen, not a new build.

1. `AI-01` AI chat home
2. `AI-02` Guided symptom-check conversation
3. `AI-03` AI response view — visibly labeled as decision-support, not diagnosis
4. `AI-04` Hand-off screen (AI suggests booking → routes into `CNS`/`LAB`)
5. `AI-05` Health Insights & Analytics Dashboard — proactive risk indicators, trend surfacing

| Where AI shows up | How |
|---|---|
| Health | `AI-05` insights, risk trend flags on `HLT-02` |
| Marketplace | Personalized service/product recommendations, smart booking suggestions on `MKT-11`/`CNS-01` |
| Community | Proactive misinformation flagging (see `COM-12` note) |
| Wallet | Backend fraud/anomaly detection on `PAY` transactions (not user-facing UI) |
| Consultation | AI-assisted note drafting (`CNS-15`) |
| Messages | Smart-reply suggestions, AI channel in `MSG-01` |
| Search | AI-ranked results in `SHL-03`/`07` |
| Professional Mode | Analytics summarization in `PRO-04` |

---

## 23. Me — `SET`

Consolidates identity, wallet, family, and account functions. Does **not** include Groups, Pages, or Community features.

1. `SET-01` My profile
2. `SET-02` **Security Center** — password, MFA, biometrics, active devices/sessions, login alerts, security recommendations
3. `SET-03` Privacy — deep-links into `CON-01`
4. `SET-04` Notification preferences (`NOT-03`)
5. `SET-05` **Language & Accessibility Center** — text size, screen reader support, high-contrast, voice navigation, offline language packs
6. `SET-06` Linked organizations / memberships — includes "Open in MedGram OS" (deep-links to `ORG-02`)
7. `SET-07` **[Pro]** Professional profile management
8. `SET-08` Help & support / contact
9. `SET-09` Legal & About MedGram
10. `SET-10` Logout / deactivate / delete account
11. `SET-11` Saved Items
12. `SET-12` Send Feedback
13. `SET-13` Activity History — user-facing timeline of actions taken (bookings made, posts published, payments sent); distinct from security audit logs and from the clinical-only `HLT-02`
14. `SET-14` Download Center — health record exports, prescriptions, receipts, vaccination certificates, in one place
15. `SET-15` My Drafts — unsent/unfinished posts, messages, clinical notes

**Reached from Me, no separate builds:** MedGram ID (`ID-01`) · Digital Card (`ID-01`) · Passport (`ID-08`) · Wallet (`PAY-01`) · Family Wallet (`PAY-09`) · Care Circle (`CARE-01`) · Dependents (`CARE-04`) · Emergency Contacts (`ID-03`) · Identity Recovery (`ID-14`)

---

## 24. Care Circle & Family Health Management — `CARE`

1. `CARE-01` My Care Circle (member list + roles)
2. `CARE-02` Invite member flow
3. `CARE-03` Granular permission editor
4. `CARE-04` Managed profiles / dependents switcher
5. `CARE-05` Delegation request/approval screen
6. `CARE-06` Care Circle activity & audit log
7. `CARE-07` **Family Dashboard** — aggregate view across all managed dependents: upcoming appointments, medication due, alerts, at a glance

---

## 25. Professional Experience — `PRO`

All healthcare professionals use the same app as patients. These screens appear only in Professional Mode (`SHL-06`).

1. `PRO-01` My Patients
2. `PRO-02` Patient Chart (authorized professional view into a patient's shared record)
3. `PRO-03` Clinical Notes library
4. `PRO-04` Professional Analytics dashboard

**Already covered elsewhere, cross-referenced:** Today's Consultations (`HOME-03`, `CNS-13`) · Prescriptions (`RX-09/10`) · Laboratory Orders (`LAB-07`) · Appointment Management (`APT-08`, `CNS-14`) · Professional Wallet (`PAY-10`) · Verification (`ONB-16/17`) · Service Pricing (`SET-07`) · Availability (`CNS-14`)

*Radiologists and Laboratory Scientists operating within an imaging center or lab's bulk workflow work primarily in MedGram OS, not here — independent/freelance practitioners taking bookings via Marketplace use the same `[Pro]` screens as any other professional.*

---

## 26. Organization Bridge — `ORG`

The connective tissue between the App's person-centric world and MedGram OS's organization-centric world.

1. `ORG-01` Organization/Professional Invitation — accept/decline, review requested permissions before joining a Workspace or being added as staff
2. `ORG-02` Organization Context Switcher — for professionals affiliated with multiple organizations, choose the active org context before entering Professional Mode screens

---

## 27. MedGram App ↔ MedGram OS — Architectural Boundary

| | MedGram App | MedGram OS |
|---|---|---|
| **Orientation** | Person-centric | Organization-centric |
| **Serves** | Patients, independent professionals | Hospitals, clinics, labs, pharmacies, insurers, government agencies |
| **Covers** | Personal healthcare, consultations, community, marketplace, messaging, wallet | Departments, staff, inventory, finance, HR, compliance, audit, analytics, role management, workflow automation |

**Identity model:** One MedGram ID. Multiple organizations. Multiple roles. A professional joining an organization's Workspace transitions seamlessly from App to OS — same credentials, no second account. The bridge points are `ORG-01` (invitation) and `ORG-02`/`SET-06` (context switch and OS launch).

---

## 28. Cross-Cutting States

Designed once as shared components, applied across every module:
- Empty states, loading/skeleton states, offline/error states
- Consent request modal (triggered when a professional/org requests access — resolves through `CON-01`)
- Permission/scope confirmation sheets
- Toast/inline confirmations
- Draft auto-save (posts, messages, clinical notes — surfaced in `SET-15`)

---

## Navigation Architecture

```
Bottom Nav: Home | Health | Community | Marketplace | Me
Top bar (persistent): Search (SHL-03/07) · Messages (SHL-08) · Notifications (NOT-01) · AI (AI-01) · Offline indicator (SHL-09)

Health tab → HLT-01 hub, grouped:
   Records:   PHR · LAB · VLT
   Care:      APT · CNS(06+) · RX · REF · CRP
   Identity:  ID-01, ID-08 · INS-01
   Insights:  AI-05 · HLT-02 · HLT-03
Marketplace tab → MKT-01 → Services (incl. Find Doctor → CNS 01-05) | Products (incl. Insurance → INS)
Me tab → SET-01 → Identity(ID) · Consent(CON) · Wallet(PAY) · Care Circle(CARE) · Security · Downloads · Drafts
Professional Mode (SHL-06) → PRO-01..04 + [Pro]-flagged screens + ORG-02 context switch
```

Every module added during this review slotted into one of the five existing tabs or an existing top-bar icon — none required a sixth nav item. That's the strongest evidence the five-tab structure will hold at scale.

---

## MVP Sequencing

**Tier 1 — core patient journey (register → identity → book care → get treated → get medication):**
`ONB` all · `ID-01–08` · `HLT-01, 02` · `PHR-01, 02, 06` · `CNS-01–11` · `APT-01–07` · `RX-01–08` · `LAB-01, 02, 04` · `MSG-01–04` · `PAY-01, 02, 04, 05` · `NOT-01–03` · `SET-01–06, 08–10` · `CON-01` (minimum viable version)

**Tier 2 — completing the clinical loop:**
`REF` all · `CARE-01–06` · `COM-01–03` · `AI-01–05` · `CNS-12` · `EMG-01` · `SHL-09` · `APT-08`, `LAB-07`, `RX-09/10` · `ID-09–17` · `ORG-01, 02`

**Tier 3 — ecosystem depth:**
`MKT` full (`11–20`) · `COM-04–26` · `PAY-03, 06–15` · `PHR-04, 05, 07` · `INS` · `CRP` · `PRO` module · `VLT` · `CAL` · `CARE-07` · `SET-11–15`

Community Spaces (`COM-16/17`) is the heaviest build in Tier 3 — live audio/video infrastructure — and is worth flagging to engineering early as an independent technical spike.

---

## Architecture Critique

**Navigation flaws (identified and resolved)**
- Messaging had no first-class home in the previous structure. Fixed with the Communication Center (`MSG-01`) plus a persistent top-bar icon (`SHL-08`).
- A flat Health tab risked becoming an unmanageable 17+ item list. Fixed by organizing `HLT-01` into four labeled groups (Records / Care / Identity / Insights) rather than a single flat list.

**UX inconsistencies**
- Emergency information intentionally surfaces from three places (Health, Me, physical card) — this is by design, but only works if the copy and CTAs are byte-for-byte identical across entry points. Flag this explicitly for the design system, not just the flow.

**Feature duplication**
- The previous structure risked a second, competing "share" flow appearing alongside record sharing. Resolved by making the Consent Center (`CON-01`) the single source of truth — `PHR-05` and any future share action deep-link into it rather than each building their own permission UI.

**Poor workflows**
- Registration didn't account for a self-registering user unknowingly creating a second identity when a hospital had already pre-registered them — a scenario the underlying product doc explicitly names as a real-world problem. Fixed with duplicate detection at signup (`ONB-15`) and a later self-service merge path (`ID-15`).

**Scalability issues**
- A fixed five-tab nav with hub-and-spoke sub-navigation (Health, Marketplace, Communication) is the only pattern that scales without periodic nav rewrites. Validated in practice: every module added in this review fit inside an existing tab.

**Accessibility concerns**
- Given the platform's target markets include populations with variable literacy and inconsistent connectivity, Language & Accessibility (`SET-05`) needed to be a first-class "Center," not a buried settings row — and Offline Mode (`SHL-09`) is core infrastructure, not a nice-to-have, especially for the Emergency Card (`ID-06`).

**Healthcare compliance concerns**
- The Consent Center is the natural enforcement point for data-subject rights (access, portability via `SET-14`, revocation) required under regimes like Nigeria's NDPR or GDPR-style frameworks — legal/compliance should review consent language before this gets built, not after.
- Audit logs were deliberately **not** consolidated into one user-facing screen — a single mega-log would be unreadable and stripped of context. Domain-scoped logs (`PHR-04`, `ID-05`, `ID-13`, `CARE-06`) stay as the user-facing pattern. The backend should still maintain a unified audit store for regulators/DPOs even though the UI never surfaces it as one screen — that's a backend requirement, not a missing screen.

**Security concerns**
- Passkeys and Authenticator Apps are correctly deferred, but password + OTP + biometric must be solid at launch.
- Wallet-to-wallet transfer (`PAY-11`) and QR payments (`PAY-12`) introduce new fraud surface — recommend transaction limits and step-up (biometric) re-authentication on high-value transfers as an engineering requirement, not just a UI screen.

**Performance concerns**
- The Health Timeline (`HLT-02`) will aggregate years of clinical events across many organizations. It needs pagination and server-side filtering designed in from day one — retrofitting this after real data volume grows is expensive.

**Future expansion concerns**
- Wearables and Health Goals are correctly deferred, but the Timeline's data model should accept arbitrary event types now, so their eventual launch doesn't require a schema migration.

---

## Strategic Recommendations

Beyond the scope of this document, for the long-term roadmap:

- Wearable device integration (Apple Health, Google Fit, Fitbit ingestion)
- Health Goals with preventive-care nudges
- Multi-professional / second-opinion consultations
- Cross-border health record interoperability (aligned with the platform's Phase 4–5 national/Pan-African roadmap)
- Voice-first interface for low-literacy users
- USSD/SMS fallback channel for users without smartphones — a meaningful access gap in markets with lower smartphone penetration
- Community health worker / agent-assisted mode for patients without personal devices
- Genomics / precision medicine module (long horizon)
- AI-driven population health early-warning integration with government dashboards
- Marketplace financing / installment payment options for healthcare costs
- Employee benefits acceptance flow for corporate/employer-sponsored plans (the employer-facing portal itself belongs to OS; the employee's acceptance and usage of the benefit touches the App)
- Multi-language AI assistant expansion for regional languages as the platform scales beyond its initial market
- Passkeys and Authenticator App support (already flagged in Authentication above)
- Evaluate (not yet endorsed) a cryptographically verifiable audit trail for cross-border record integrity as international interoperability matures


add-appointment-management	
add-prescription-management	
add-laboratory-diagnostics	
fix-community-core		
dead-code-cleanup	