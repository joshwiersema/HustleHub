# Requirements: HustleHub

**Defined:** 2026-03-25
**Core Value:** Teens can manage every aspect of their service business from one app while staying motivated through gamification that rewards real business activity.

## v1.1 Requirements

Requirements for v1.1 milestone. Each maps to roadmap phases.

### Testability & Fix

- [ ] **TEST-01**: App renders and is interactive on web preview (no white screen)
- [ ] **TEST-02**: All 5 tab screens load without runtime errors on web
- [ ] **TEST-03**: Onboarding flow completes successfully (welcome → pick hustle → setup → tabs)
- [ ] **TEST-04**: Navigation between all screens works without crashes
- [ ] **TEST-05**: Zustand stores hydrate correctly and persist data across page refresh

### Codebase Verification

- [ ] **VERIFY-01**: All Zustand stores (profile, clients, jobs, payments, game) read/write correctly
- [ ] **VERIFY-02**: Job CRUD works end-to-end (create, read, update, delete, complete, recurring)
- [ ] **VERIFY-03**: Client CRUD works end-to-end (create, read, update, delete)
- [ ] **VERIFY-04**: Payment logging works with all 5 payment methods
- [ ] **VERIFY-05**: Earnings dashboard calculates totals, averages, and bar chart correctly
- [ ] **VERIFY-06**: XP awards fire for all 9 granting actions
- [ ] **VERIFY-07**: Level progression triggers level-up celebrations
- [ ] **VERIFY-08**: Badge unlock detection works for all 10 badges
- [ ] **VERIFY-09**: Streak tracking increments on consecutive days and resets on gaps
- [ ] **VERIFY-10**: All 6 toolkit screens function (flyers, cards, name gen, pricing calc, ideas, toolkit hub)
- [ ] **VERIFY-11**: Profile screen shows accurate lifetime stats and badge gallery
- [ ] **VERIFY-12**: Data reset clears all stores and returns to onboarding

### New Hustle Type

- [ ] **HUSTLE-01**: Window washing added as 7th hustle type with icon, emoji, description, earnings, cost, difficulty
- [ ] **HUSTLE-02**: Window washing available in onboarding pick-hustle screen
- [ ] **HUSTLE-03**: Window washing has business name suggestions in setup-business screen
- [ ] **HUSTLE-04**: Window washing appears in business ideas browser with expandable details
- [ ] **HUSTLE-05**: Window washing has pricing calculator data

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Notifications

- **NOTIF-01**: User receives push notifications for upcoming job reminders
- **NOTIF-02**: User receives email reminders for appointments

### Social

- **SOCIAL-01**: Real social leaderboards with other users
- **SOCIAL-02**: HustleBucks shop for cosmetic items

### Platform

- **PLAT-01**: Android support and testing
- **PLAT-02**: Invoice generation tool

## Out of Scope

| Feature | Reason |
|---------|--------|
| Parental controls | Defer to v2 after core is solid |
| Real payment processing (Stripe) | Teens just log payments they receive directly |
| Website builder | Too complex, defer |
| AI chat coach | Defer full AI integration |
| Expense tracking / P&L | Revenue focus is more motivating for teens |
| Backend / user accounts | Local-only for v1.x |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 8 | Pending |
| TEST-02 | Phase 8 | Pending |
| TEST-03 | Phase 8 | Pending |
| TEST-04 | Phase 8 | Pending |
| TEST-05 | Phase 8 | Pending |
| VERIFY-01 | Phase 9 | Pending |
| VERIFY-02 | Phase 9 | Pending |
| VERIFY-03 | Phase 9 | Pending |
| VERIFY-04 | Phase 9 | Pending |
| VERIFY-05 | Phase 9 | Pending |
| VERIFY-06 | Phase 9 | Pending |
| VERIFY-07 | Phase 9 | Pending |
| VERIFY-08 | Phase 9 | Pending |
| VERIFY-09 | Phase 9 | Pending |
| VERIFY-10 | Phase 9 | Pending |
| VERIFY-11 | Phase 9 | Pending |
| VERIFY-12 | Phase 9 | Pending |
| HUSTLE-01 | Phase 10 | Pending |
| HUSTLE-02 | Phase 10 | Pending |
| HUSTLE-03 | Phase 10 | Pending |
| HUSTLE-04 | Phase 10 | Pending |
| HUSTLE-05 | Phase 10 | Pending |

**Coverage:**
- v1.1 requirements: 22 total
- Mapped to phases: 22
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after initial definition*
