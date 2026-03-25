# Roadmap: HustleHub

## Milestones

- ✅ **v1.0 MVP** — Phases 1-7 (shipped 2026-03-25)
- ⏭️ **v1.1 Fix, Verify & Enhance** — Phases 8-10 (superseded by v2.0)
- 🚧 **v2.0 Complete Redesign & Feature Overhaul** — Phases 11-17 (active)

## Phases

<details>
<summary>✅ v1.0 MVP (Phases 1-7) — SHIPPED 2026-03-25</summary>

- [x] Phase 1: Foundation (3/3 plans) — completed 2026-03-24
- [x] Phase 2: Onboarding (1/1 plans) — completed 2026-03-25
- [x] Phase 3: Core Business Data (3/3 plans) — completed 2026-03-25
- [x] Phase 4: Gamification Engine (3/3 plans) — completed 2026-03-25
- [x] Phase 5: Payments and Dashboard (3/3 plans) — completed 2026-03-25
- [x] Phase 6: Tools and Discovery (3/3 plans) — completed 2026-03-25
- [x] Phase 7: Integration Verification (2/2 plans) — completed 2026-03-25

</details>

### ⏭️ v1.1 Fix, Verify & Enhance (Superseded by v2.0)

**Milestone Goal:** Fix broken web/device preview, verify the entire codebase end-to-end, add window washing hustle type, and establish comprehensive test coverage.

- [ ] **Phase 8: Fix & Testability** — Root-cause white screen, fix it, verify all screens load and stores hydrate
- [ ] **Phase 9: Full Codebase Verification** — Verify every store, screen, and flow works correctly end-to-end
- [ ] **Phase 10: Window Washing Hustle Type** — Add new hustle type with all supporting content across the app

### 🚧 v2.0 Complete Redesign & Feature Overhaul (Active)

**Milestone Goal:** Complete visual overhaul with The Outsiders-inspired dark design language (red/white/dark palette), AI-powered business card & flyer generators with print/export, streamlined 6-step onboarding, feature removals, and professional icon system replacing all emojis.

- [ ] **Phase 11: Design System Foundation + Cleanup** — New color palette, typography, spacing, icon system, feature removals, and tab bar redesign
- [ ] **Phase 12: Component Library Redesign** — Shared components rebuilt with glass-morphism aesthetic and red accent system
- [ ] **Phase 13: Home, Jobs & Job Photos** — Dashboard and jobs list redesigned with hero stats; job photo upload feature added
- [ ] **Phase 14: Clients & Earnings Redesign** — Professional contact list and dark-background earnings chart with payment breakdown
- [ ] **Phase 15: Profile & Toolkit Redesign** — Profile stats/badge gallery refined, toolkit grid cleaned up with 4 tools
- [ ] **Phase 16: Generator Overhaul** — AI multi-option business card and flyer generators with print, export, and share
- [ ] **Phase 17: Onboarding Flow Redesign** — 6-step onboarding with integrated card and flyer generation

## Phase Details

### Phase 8: Fix & Testability
**Goal**: The app renders and is fully navigable on web preview with working data persistence
**Depends on**: Phase 7 (v1.0 complete)
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04, TEST-05
**Success Criteria** (what must be TRUE):
  1. User opens web preview and sees the app rendered (no white screen, no blank page)
  2. User can tap each of the 5 bottom tabs and each screen loads without errors
  3. User can complete onboarding from welcome screen through hustle selection, business setup, and land on the home tab
  4. User can navigate to any nested screen (add job, add client, toolkit items) and back without crashes
  5. User can refresh the browser and see their previously entered data still present (stores hydrated from persistence)
**Plans**: 2 plans

Plans:
- [ ] 08-01-PLAN.md — Fix white screen: add error boundary, fix web-incompatible imports (confetti, haptics, sharing, print, view-shot)
- [ ] 08-02-PLAN.md — Verify all screens, onboarding flow, tab navigation, and store persistence on web

### Phase 9: Full Codebase Verification
**Goal**: Every feature built in v1.0 works correctly — CRUD operations, gamification, toolkit, and profile all function as designed
**Depends on**: Phase 8 (app is renderable and navigable)
**Requirements**: VERIFY-01, VERIFY-02, VERIFY-03, VERIFY-04, VERIFY-05, VERIFY-06, VERIFY-07, VERIFY-08, VERIFY-09, VERIFY-10, VERIFY-11, VERIFY-12
**Success Criteria** (what must be TRUE):
  1. User can create, view, edit, delete, and complete jobs (including recurring), and create/view/edit/delete clients, with all changes persisted
  2. User can log payments with any of the 5 methods and see earnings dashboard update with correct totals, averages, and bar chart
  3. User earns XP for all 9 granting actions, sees level-up celebrations at thresholds, and unlocks badges with progress tracked accurately
  4. User can access all 6 toolkit screens (flyers, cards, name gen, pricing calc, ideas browser, toolkit hub) and each produces correct output
  5. User can view profile with accurate lifetime stats and badge gallery, and reset all data to return cleanly to onboarding
**Plans**: TBD

Plans:
- [ ] 09-01: TBD
- [ ] 09-02: TBD
- [ ] 09-03: TBD

### Phase 10: Window Washing Hustle Type
**Goal**: Window washing is a fully integrated 7th hustle type available everywhere other hustle types appear
**Depends on**: Phase 9 (codebase verified working)
**Requirements**: HUSTLE-01, HUSTLE-02, HUSTLE-03, HUSTLE-04, HUSTLE-05
**Success Criteria** (what must be TRUE):
  1. User sees window washing as a selectable option during onboarding with its own icon, emoji, description, earnings range, startup cost, and difficulty rating
  2. User who selects window washing gets relevant business name suggestions during business setup
  3. User can find window washing in the business ideas browser with expandable details matching the format of existing hustle types
  4. User can use the pricing calculator with window washing data that produces accurate monthly earnings projections
**Plans**: TBD

Plans:
- [ ] 10-01: TBD

### Phase 11: Design System Foundation + Cleanup
**Goal**: The app's entire visual foundation is replaced with The Outsiders design language, dead features are removed, and every icon is professional — establishing the base that all subsequent redesign phases build on
**Depends on**: Phase 7 (v1.0 complete) — v1.1 superseded by v2.0
**Requirements**: THM-01, THM-02, THM-03, THM-04, THM-05, THM-06, CLN-01, CLN-02, CLN-03, CLN-04, NAV-01, NAV-02, NAV-03
**Success Criteria** (what must be TRUE):
  1. User sees red/white/dark color scheme on every screen with zero green or purple remnants from v1.0
  2. User sees large hero numbers (40-48px) for key stats on dashboard and earnings screens, with consistent typography hierarchy throughout
  3. User sees professional vector icons everywhere — no emojis remain anywhere in the app
  4. User navigates via a bottom tab bar with red accent on the active tab, consistent icon family, and muted gray inactive tabs
  5. User cannot find name generator, invoice template, or rankings/leaderboard anywhere in the app — those features are fully removed
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 11-01: TBD
- [ ] 11-02: TBD
- [ ] 11-03: TBD

### Phase 12: Component Library Redesign
**Goal**: Every shared component matches The Outsiders glass-morphism aesthetic so that screen redesigns in subsequent phases compose correctly
**Depends on**: Phase 11 (design system and theme in place)
**Requirements**: CMP-01, CMP-02, CMP-03, CMP-04, CMP-05
**Success Criteria** (what must be TRUE):
  1. User sees glass-morphism styled cards (Card, StatCard) with consistent border radius (12-16px), subtle transparency, and dark background depth throughout the app
  2. User sees red-gradient action buttons replacing all green-gradient buttons
  3. User sees professional vector icons on all badges instead of emoji representations
  4. User sees clean, typographic empty states with professional icons when lists are empty (no jobs, no clients, no payments)
  5. User sees refined XP bar, streak badge, and level indicators that feel professional and understated rather than gamey
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 12-01: TBD
- [ ] 12-02: TBD

### Phase 13: Home, Jobs & Job Photos
**Goal**: The two most-visited screens (dashboard and jobs) are fully redesigned, and users can attach photos when completing jobs
**Depends on**: Phase 12 (shared components redesigned)
**Requirements**: SCR-01, SCR-02, JOB-01, JOB-02, JOB-03
**Success Criteria** (what must be TRUE):
  1. User sees a bold hero stat at the top of the dashboard (total earnings or streak count), a clean card grid of key stats, and a recent activity feed
  2. User sees the jobs list with styled filter tabs (upcoming/completed), clean job cards showing client, service, date, and price without any emojis
  3. User can optionally attach a photo from camera or gallery when completing a job
  4. User can view the attached photo in the job detail screen after completion
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 13-01: TBD
- [ ] 13-02: TBD

### Phase 14: Clients & Earnings Redesign
**Goal**: The clients and earnings screens deliver professional data presentation matching The Outsiders design language
**Depends on**: Phase 12 (shared components redesigned)
**Requirements**: SCR-03, SCR-04
**Success Criteria** (what must be TRUE):
  1. User sees a professional contact list for clients with name, phone, and last job info, plus search/filter capability
  2. User sees a dark-background chart at the top of earnings with a colored line, payment method breakdown below, and time period filter tabs
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 14-01: TBD

### Phase 15: Profile & Toolkit Redesign
**Goal**: The profile and toolkit screens complete the full-app redesign with refined gamification visuals and a streamlined tool grid
**Depends on**: Phase 12 (shared components redesigned)
**Requirements**: SCR-05, SCR-06
**Success Criteria** (what must be TRUE):
  1. User sees a profile screen with stats overview at top, badge gallery using proper vector icons, refined level progress bar, and a settings section with reset/start-over
  2. User sees a toolkit screen with a clean 4-tool grid (Business Card, Flyer, Pricing Calculator, Business Ideas) using icons and labels only — no emojis or "coming soon" badges
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 15-01: TBD

### Phase 16: Generator Overhaul
**Goal**: Users can generate multiple AI design variations for business cards and flyers, then export, print, or share their chosen design
**Depends on**: Phase 15 (toolkit screen redesigned with generator entry points)
**Requirements**: GEN-01, GEN-02, GEN-03, GEN-04, GEN-05, GEN-06, GEN-07
**Success Criteria** (what must be TRUE):
  1. User generates 3-4 business card design variations with different layouts, typography, and color arrangements in the red/white/dark palette
  2. User generates multiple flyer design variations tailored to their hustle type and business info
  3. User accessing generators from toolkit sees their saved business info pre-filled automatically
  4. User can export any generated card or flyer as PNG image or PDF, print via system dialog, or share via the native share sheet
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 16-01: TBD
- [ ] 16-02: TBD

### Phase 17: Onboarding Flow Redesign
**Goal**: New users experience a polished 6-step onboarding that creates their profile, generates their first marketing materials, and launches them into the app
**Depends on**: Phase 16 (generators built — onboarding steps 4-5 use them)
**Requirements**: ONB-01, ONB-02, ONB-03, ONB-04, ONB-05, ONB-06
**Success Criteria** (what must be TRUE):
  1. User sees a clean professional welcome screen with bold typography and a brief tagline — no emojis or animations
  2. User picks a hustle type from redesigned cards with proper icons and hustle name + one-line description only
  3. User enters their name and business name on a clean form — no AI name suggestions
  4. User generates and picks a business card design (or skips), then generates and picks a flyer design (or skips), with export/PDF options available
  5. User sees a summary card showing their profile, then launches into the main app with all data saved
**Plans**: TBD
**UI hint**: yes

Plans:
- [ ] 17-01: TBD
- [ ] 17-02: TBD

## Progress

**Execution Order:** Phase 11 → Phase 12 → Phase 13/14/15 (parallel-eligible) → Phase 16 → Phase 17

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 1. Foundation | v1.0 | 3/3 | Complete | 2026-03-24 |
| 2. Onboarding | v1.0 | 1/1 | Complete | 2026-03-25 |
| 3. Core Business Data | v1.0 | 3/3 | Complete | 2026-03-25 |
| 4. Gamification Engine | v1.0 | 3/3 | Complete | 2026-03-25 |
| 5. Payments and Dashboard | v1.0 | 3/3 | Complete | 2026-03-25 |
| 6. Tools and Discovery | v1.0 | 3/3 | Complete | 2026-03-25 |
| 7. Integration Verification | v1.0 | 2/2 | Complete | 2026-03-25 |
| 8. Fix & Testability | v1.1 | 0/2 | In Progress | - |
| 9. Full Codebase Verification | v1.1 | 0/? | Not started | - |
| 10. Window Washing Hustle Type | v1.1 | 0/? | Not started | - |
| 11. Design System Foundation + Cleanup | v2.0 | 0/? | Not started | - |
| 12. Component Library Redesign | v2.0 | 0/? | Not started | - |
| 13. Home, Jobs & Job Photos | v2.0 | 0/? | Not started | - |
| 14. Clients & Earnings Redesign | v2.0 | 0/? | Not started | - |
| 15. Profile & Toolkit Redesign | v2.0 | 0/? | Not started | - |
| 16. Generator Overhaul | v2.0 | 0/? | Not started | - |
| 17. Onboarding Flow Redesign | v2.0 | 0/? | Not started | - |
