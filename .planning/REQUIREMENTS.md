# Requirements: HustleHub

**Defined:** 2026-03-24
**Core Value:** Teens can manage every aspect of their service business from one app while staying motivated through gamification that rewards real business activity.

## v1 Requirements

### Onboarding

- [x] **ONBD-01**: User can view a welcome screen that communicates the app's value proposition
- [x] **ONBD-02**: User can select their hustle type from 6 visual cards (lawn care, power washing, dog walking, tutoring, car detailing, snow removal)
- [x] **ONBD-03**: User can set up their business profile (business name, owner name)
- [x] **ONBD-04**: User can generate AI-style business name suggestions based on their hustle type
- [x] **ONBD-05**: User sees a preview of their business identity before launching into the app

### Clients

- [x] **CLNT-01**: User can add a client with name, phone, email, address, and notes
- [x] **CLNT-02**: User can view a searchable list of all clients
- [x] **CLNT-03**: User can edit an existing client's information
- [x] **CLNT-04**: User can delete a client with confirmation
- [x] **CLNT-05**: User can tap a client to see their full details

### Jobs

- [x] **JOBS-01**: User can create a job with title, client, date, time, duration, price, address, and notes
- [x] **JOBS-02**: User can view jobs filtered by status (upcoming, completed, all)
- [x] **JOBS-03**: User can mark a job as completed
- [x] **JOBS-04**: User can set a job as recurring (weekly, biweekly, monthly)
- [x] **JOBS-05**: User can edit an existing job
- [x] **JOBS-06**: User can delete a job with confirmation
- [x] **JOBS-07**: User can view full details of a single job

### Payments

- [ ] **PYMT-01**: User can log a payment with amount, client name, payment method, date, and notes
- [ ] **PYMT-02**: User can select payment method from: Cash, Venmo, Zelle, PayPal, Other
- [ ] **PYMT-03**: User can view payment history with client name, amount, method, and date

### Earnings

- [ ] **EARN-01**: User can see total earnings displayed prominently
- [ ] **EARN-02**: User can filter earnings by time period (this week, this month, all time)
- [ ] **EARN-03**: User can see earnings visualized in a bar chart
- [ ] **EARN-04**: User can see summary stats (total, average per job, payment count)

### Gamification

- [x] **GAME-01**: User earns XP for completing jobs, logging payments, adding clients, and using tools
- [x] **GAME-02**: User can see their current level and level title (10 levels: Rookie Hustler to CEO)
- [x] **GAME-03**: User can see an XP progress bar showing progress toward next level
- [x] **GAME-04**: User can see their HustleBucks balance (earned at 50% of XP rate)
- [x] **GAME-05**: User can view and collect badges for milestones (10 badges)
- [x] **GAME-06**: User can see a streak counter for consecutive days of activity
- [x] **GAME-07**: User receives visual feedback (animation/celebration) when leveling up or earning a badge

### Dashboard

- [ ] **DASH-01**: User sees a home screen with greeting, business name, and quick stats
- [ ] **DASH-02**: User sees their XP bar and current level on the home screen
- [ ] **DASH-03**: User sees upcoming jobs on the home screen (next 3)
- [ ] **DASH-04**: User can access quick actions from the home screen (add job, add client, log payment, toolkit)
- [ ] **DASH-05**: User sees HustleBucks balance on the home screen

### Profile

- [x] **PROF-01**: User can view their profile with level, XP, badges, and business stats
- [x] **PROF-02**: User can see all earned and locked badges in a collection view
- [x] **PROF-03**: User can see a leaderboard teaser with simulated local rankings
- [x] **PROF-04**: User can see lifetime stats (total earned, jobs done, clients, days active)
- [x] **PROF-05**: User can reset all data (with confirmation)

### Marketing Tools

- [ ] **TOOL-01**: User can access a toolkit screen with available business tools
- [ ] **TOOL-02**: User can generate a flyer from 4 template styles populated with their business info
- [ ] **TOOL-03**: User can generate a business card from 3 style options with their business info
- [ ] **TOOL-04**: User can generate business name suggestions from a curated word bank per hustle type
- [ ] **TOOL-05**: User can calculate pricing with inputs for time, cost, rate, and jobs/week
- [ ] **TOOL-06**: User can share/export generated flyers and business cards

### Business Ideas

- [ ] **IDEA-01**: User can browse all 6 hustle types with startup cost, earning potential, and difficulty
- [ ] **IDEA-02**: User can expand a hustle type to see getting-started checklist, pro tips, and equipment needed
- [ ] **IDEA-03**: User can switch their hustle type from the ideas screen

### Design & UX

- [x] **DSGN-01**: App uses dark mode first with iOS native feel
- [x] **DSGN-02**: App uses consistent color system (green for money, purple for XP, amber for HustleBucks)
- [x] **DSGN-03**: All touch targets are minimum 44x44px
- [x] **DSGN-04**: App has 5-tab bottom navigation (Home, Jobs, Clients, Earnings, Profile)
- [x] **DSGN-05**: All data persists locally across app sessions

## v2 Requirements

### Notifications
- **NOTF-01**: User receives email reminders for upcoming appointments
- **NOTF-02**: User receives push notifications for job reminders
- **NOTF-03**: User can configure notification preferences

### Social
- **SOCL-01**: User can view real leaderboards with other users
- **SOCL-02**: User can share their profile/stats to social media

### Parental Controls
- **PRNT-01**: Parent can view teen's activity dashboard
- **PRNT-02**: Parent can approve certain actions

### Advanced Tools
- **ADVT-01**: User can create a simple website/link card
- **ADVT-02**: User can chat with an AI business coach
- **ADVT-03**: User can create formal invoices
- **ADVT-04**: User can spend HustleBucks on cosmetic items in a shop

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real payment processing (Stripe, etc.) | Regulatory complexity for minors; teens log payments they receive directly |
| GPS / route optimization | Adult FSM feature; teen neighborhoods are small; unnecessary permissions |
| Expense tracking / profit-loss | Accounting complexity teens don't need; revenue focus is more motivating |
| Unlimited hustle types | Generic = bad UX; 6 opinionated types with type-specific content |
| Complex recurring schedules | Weekly/biweekly/monthly covers 95% of teen use cases |
| Streak tied to app opens | Creates anxiety; streaks tied to meaningful actions only |
| Android in v1 | iOS-first; React Native enables Android later |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| DSGN-01 | Phase 1 | Complete |
| DSGN-02 | Phase 1 | Complete |
| DSGN-03 | Phase 1 | Complete |
| DSGN-04 | Phase 1 | Complete |
| DSGN-05 | Phase 1 | Complete |
| ONBD-01 | Phase 2 | Complete |
| ONBD-02 | Phase 2 | Complete |
| ONBD-03 | Phase 2 | Complete |
| ONBD-04 | Phase 2 | Complete |
| ONBD-05 | Phase 2 | Complete |
| CLNT-01 | Phase 3 | Complete |
| CLNT-02 | Phase 3 | Complete |
| CLNT-03 | Phase 3 | Complete |
| CLNT-04 | Phase 3 | Complete |
| CLNT-05 | Phase 3 | Complete |
| JOBS-01 | Phase 3 | Complete |
| JOBS-02 | Phase 3 | Complete |
| JOBS-03 | Phase 3 | Complete |
| JOBS-04 | Phase 3 | Complete |
| JOBS-05 | Phase 3 | Complete |
| JOBS-06 | Phase 3 | Complete |
| JOBS-07 | Phase 3 | Complete |
| GAME-01 | Phase 4 | Complete |
| GAME-02 | Phase 4 | Complete |
| GAME-03 | Phase 4 | Complete |
| GAME-04 | Phase 4 | Complete |
| GAME-05 | Phase 4 | Complete |
| GAME-06 | Phase 4 | Complete |
| GAME-07 | Phase 4 | Complete |
| PYMT-01 | Phase 5 | Pending |
| PYMT-02 | Phase 5 | Pending |
| PYMT-03 | Phase 5 | Pending |
| EARN-01 | Phase 5 | Pending |
| EARN-02 | Phase 5 | Pending |
| EARN-03 | Phase 5 | Pending |
| EARN-04 | Phase 5 | Pending |
| DASH-01 | Phase 5 | Pending |
| DASH-02 | Phase 5 | Pending |
| DASH-03 | Phase 5 | Pending |
| DASH-04 | Phase 5 | Pending |
| DASH-05 | Phase 5 | Pending |
| PROF-01 | Phase 5 | Complete |
| PROF-02 | Phase 5 | Complete |
| PROF-03 | Phase 5 | Complete |
| PROF-04 | Phase 5 | Complete |
| PROF-05 | Phase 5 | Complete |
| TOOL-01 | Phase 6 | Pending |
| TOOL-02 | Phase 6 | Pending |
| TOOL-03 | Phase 6 | Pending |
| TOOL-04 | Phase 6 | Pending |
| TOOL-05 | Phase 6 | Pending |
| TOOL-06 | Phase 6 | Pending |
| IDEA-01 | Phase 6 | Pending |
| IDEA-02 | Phase 6 | Pending |
| IDEA-03 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0

**Phase Breakdown:**
- Phase 1 (Foundation): DSGN-01 through DSGN-05 — 5 requirements
- Phase 2 (Onboarding): ONBD-01 through ONBD-05 — 5 requirements
- Phase 3 (Core Business Data): CLNT-01..05, JOBS-01..07 — 12 requirements
- Phase 4 (Gamification Engine): GAME-01 through GAME-07 — 7 requirements
- Phase 5 (Payments and Dashboard): PYMT-01..03, EARN-01..04, DASH-01..05, PROF-01..05 — 17 requirements
- Phase 6 (Tools and Discovery): TOOL-01..06, IDEA-01..03 — 9 requirements

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 — phase mappings added after roadmap creation*
