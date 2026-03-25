# Roadmap: HustleHub

## Milestones

- ✅ **v1.0 MVP** — Phases 1-7 (shipped 2026-03-25)
- 🚧 **v1.1 Fix, Verify & Enhance** — Phases 8-10 (in progress)

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

### 🚧 v1.1 Fix, Verify & Enhance (In Progress)

**Milestone Goal:** Fix broken web/device preview, verify the entire codebase end-to-end, add window washing hustle type, and establish comprehensive test coverage.

- [ ] **Phase 8: Fix & Testability** — Root-cause white screen, fix it, verify all screens load and stores hydrate
- [ ] **Phase 9: Full Codebase Verification** — Verify every store, screen, and flow works correctly end-to-end
- [ ] **Phase 10: Window Washing Hustle Type** — Add new hustle type with all supporting content across the app

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

## Progress

**Execution Order:** Phase 8 → Phase 9 → Phase 10

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
