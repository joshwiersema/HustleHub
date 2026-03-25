# Roadmap: HustleHub

## Overview

HustleHub ships in 6 phases that follow the natural dependency chain of the product. The foundation (storage, theme, navigation) must be solid before any feature is built. Onboarding gates everything else. Core business data (clients and jobs) must exist before gamification can consume it. Gamification must be modeled before it is coded. Payments and the home dashboard compose all prior outputs into the daily loop. Marketing tools and discovery are standalone and ship last. Every phase delivers a coherent, independently verifiable capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - App shell with dark theme, storage layer, navigation, and shared UI primitives (completed 2026-03-24)
- [x] **Phase 2: Onboarding** - First-launch flow that gates all other screens and establishes business identity (completed 2026-03-25)
- [ ] **Phase 3: Core Business Data** - Full client and job management (the primary daily workflow)
- [ ] **Phase 4: Gamification Engine** - Event-driven XP, levels, HustleBucks, badges, and celebration feedback
- [ ] **Phase 5: Payments and Dashboard** - Payment logging, earnings charts, and the composed home dashboard
- [ ] **Phase 6: Tools and Discovery** - Marketing tools, pricing calculator, business ideas engine, and profile completion

## Phase Details

### Phase 1: Foundation
**Goal**: A working app shell exists with the correct dark theme, no launch flash, shard-first storage, 5-tab navigation, and shared UI primitives — every future feature can be built on top without rework
**Depends on**: Nothing (first phase)
**Requirements**: DSGN-01, DSGN-02, DSGN-03, DSGN-04, DSGN-05
**Success Criteria** (what must be TRUE):
  1. App launches on iOS with a dark background and no white flash — `backgroundColor` and splash background are both `#0A0A0A`
  2. Five-tab bottom navigation (Home, Jobs, Clients, Earnings, Profile) renders and each tab is reachable
  3. The color system is applied globally: green `#00E676` for money, purple `#B388FF` for XP, amber `#FFD740` for HustleBucks — visible in at least one placeholder screen per accent
  4. All shared UI primitives (Button, Card, ProgressBar, StatCard) render in the design system style with minimum 44x44px touch targets
  5. App data persists across a full close and cold relaunch — storage layer is wired and writes survive sessions
**Plans:** 3/3 plans complete

Plans:
- [x] 01-01-PLAN.md — Install Zustand v5 and create 5 domain stores with AsyncStorage persist
- [x] 01-02-PLAN.md — Refactor navigation shell with Stack.Protected guard and dark mode validation
- [x] 01-03-PLAN.md — Fix touch targets, create placeholder tab screens, and verify in Expo Go

### Phase 2: Onboarding
**Goal**: A first-time user can complete the two-step onboarding flow, establish their business identity, and land on the home tab — and the onboarding never re-triggers on subsequent launches
**Depends on**: Phase 1
**Requirements**: ONBD-01, ONBD-02, ONBD-03, ONBD-04, ONBD-05
**Success Criteria** (what must be TRUE):
  1. A brand-new install shows the welcome screen with the app value proposition before any tab is visible
  2. User can select one of the 6 hustle types from visual cards and advance to the next step
  3. User can enter a business name manually or tap to generate AI-style name suggestions based on their selected hustle type
  4. User sees a preview of their business identity (name, hustle type) before entering the app
  5. On second and subsequent launches the app goes directly to the home tab — onboarding does not re-appear
**Plans:** 1/1 plans complete

Plans:
- [ ] 02-01-PLAN.md — Refactor setup-business.tsx to use Zustand profileStore, fix back button touch targets, and verify onboarding flow

### Phase 3: Core Business Data
**Goal**: Users can add, view, edit, and delete both clients and jobs (including recurring jobs) — the primary daily operational workflow works end-to-end
**Depends on**: Phase 2
**Requirements**: CLNT-01, CLNT-02, CLNT-03, CLNT-04, CLNT-05, JOBS-01, JOBS-02, JOBS-03, JOBS-04, JOBS-05, JOBS-06, JOBS-07
**Success Criteria** (what must be TRUE):
  1. User can add a client with name, phone, email, address, and notes — and the client appears in a searchable list
  2. User can tap any client to view full details, then edit or delete with a confirmation prompt
  3. User can create a job linked to a client with title, date, time, duration, price, address, and notes — and the job appears in the correct status tab (upcoming or completed)
  4. User can mark a job as completed and it moves to the completed filter view
  5. User can set a job as recurring (weekly, biweekly, or monthly) and subsequent occurrences appear in the upcoming jobs list
**Plans**: TBD

### Phase 4: Gamification Engine
**Goal**: Every meaningful business action automatically awards XP and HustleBucks, levels are earned over a modeled 3-6 month arc, badges unlock with celebration animations, and the game layer is visually prominent throughout the app
**Depends on**: Phase 3
**Requirements**: GAME-01, GAME-02, GAME-03, GAME-04, GAME-05, GAME-06, GAME-07
**Success Criteria** (what must be TRUE):
  1. Completing a job, logging a payment, adding a client, and using a tool each award XP — the XP bar visually updates on the home screen after the action
  2. User can see their current level title (e.g., "Rookie Hustler") and a progress bar showing XP needed for the next level
  3. User can see their HustleBucks balance update after earning activity — displayed on the home screen
  4. User can view all 10 badges as a gallery showing earned (unlocked) and locked states — earning a badge triggers a visible celebration (animation and haptic feedback)
  5. User sees a consecutive-days streak counter that increments when they log business activity on back-to-back days
**Plans**: TBD

### Phase 5: Payments and Dashboard
**Goal**: Users can log payments against jobs, see their earnings visualized with charts and summary stats, and the home dashboard composes all prior outputs into a single high-value daily screen
**Depends on**: Phase 4
**Requirements**: PYMT-01, PYMT-02, PYMT-03, EARN-01, EARN-02, EARN-03, EARN-04, DASH-01, DASH-02, DASH-03, DASH-04, DASH-05, PROF-01, PROF-02, PROF-03, PROF-04, PROF-05
**Success Criteria** (what must be TRUE):
  1. User can log a payment with amount, client name, payment method (Cash, Venmo, Zelle, PayPal, Other), date, and notes — and it appears in payment history
  2. User can view total earnings prominently, filter by this week / this month / all time, and see a bar chart of earnings over time
  3. The home screen greets the user by business name, shows their XP bar and current level, upcoming jobs (next 3), HustleBucks balance, and quick action buttons for add job, add client, log payment, and toolkit
  4. User can view their profile screen showing level, XP, all earned and locked badges, and lifetime stats (total earned, jobs done, clients, days active)
  5. User can reset all app data from the profile screen after confirming the action — app returns to onboarding
**Plans**: TBD

### Phase 6: Tools and Discovery
**Goal**: Users have access to a full marketing toolkit (flyer generator, business card generator, pricing calculator, name generator) and a business ideas browser — tools are functional, shareable, and award XP
**Depends on**: Phase 5
**Requirements**: TOOL-01, TOOL-02, TOOL-03, TOOL-04, TOOL-05, TOOL-06, IDEA-01, IDEA-02, IDEA-03
**Success Criteria** (what must be TRUE):
  1. User can open the toolkit screen and see all available tools listed
  2. User can generate a flyer from 4 template styles auto-populated with their business name, hustle type, and contact info — and share or export the result
  3. User can generate a business card from 3 style options auto-populated with their business info — and share or export the result
  4. User can enter time, cost, rate, and jobs per week into the pricing calculator and see a monthly earnings projection
  5. User can browse all 6 hustle types in the business ideas screen with startup cost, earning potential, difficulty — and expand any to see a getting-started checklist, pro tips, and equipment list
**Plans**: TBD

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete    | 2026-03-24 |
| 2. Onboarding | 0/1 | Complete    | 2026-03-25 |
| 3. Core Business Data | 0/TBD | Not started | - |
| 4. Gamification Engine | 0/TBD | Not started | - |
| 5. Payments and Dashboard | 0/TBD | Not started | - |
| 6. Tools and Discovery | 0/TBD | Not started | - |
