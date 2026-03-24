# Requirements: HustleHub

**Defined:** 2026-03-24
**Core Value:** Teens can manage every aspect of their service business from one app while staying motivated through gamification that rewards real business activity.

## v1 Requirements

### Onboarding

- [ ] **ONBD-01**: User can view a welcome screen that communicates the app's value proposition
- [ ] **ONBD-02**: User can select their hustle type from 6 visual cards (lawn care, power washing, dog walking, tutoring, car detailing, snow removal)
- [ ] **ONBD-03**: User can set up their business profile (business name, owner name)
- [ ] **ONBD-04**: User can generate AI-style business name suggestions based on their hustle type
- [ ] **ONBD-05**: User sees a preview of their business identity before launching into the app

### Clients

- [ ] **CLNT-01**: User can add a client with name, phone, email, address, and notes
- [ ] **CLNT-02**: User can view a searchable list of all clients
- [ ] **CLNT-03**: User can edit an existing client's information
- [ ] **CLNT-04**: User can delete a client with confirmation
- [ ] **CLNT-05**: User can tap a client to see their full details

### Jobs

- [ ] **JOBS-01**: User can create a job with title, client, date, time, duration, price, address, and notes
- [ ] **JOBS-02**: User can view jobs filtered by status (upcoming, completed, all)
- [ ] **JOBS-03**: User can mark a job as completed
- [ ] **JOBS-04**: User can set a job as recurring (weekly, biweekly, monthly)
- [ ] **JOBS-05**: User can edit an existing job
- [ ] **JOBS-06**: User can delete a job with confirmation
- [ ] **JOBS-07**: User can view full details of a single job

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

- [ ] **GAME-01**: User earns XP for completing jobs, logging payments, adding clients, and using tools
- [ ] **GAME-02**: User can see their current level and level title (10 levels: Rookie Hustler to CEO)
- [ ] **GAME-03**: User can see an XP progress bar showing progress toward next level
- [ ] **GAME-04**: User can see their HustleBucks balance (earned at 50% of XP rate)
- [ ] **GAME-05**: User can view and collect badges for milestones (10 badges)
- [ ] **GAME-06**: User can see a streak counter for consecutive days of activity
- [ ] **GAME-07**: User receives visual feedback (animation/celebration) when leveling up or earning a badge

### Dashboard

- [ ] **DASH-01**: User sees a home screen with greeting, business name, and quick stats
- [ ] **DASH-02**: User sees their XP bar and current level on the home screen
- [ ] **DASH-03**: User sees upcoming jobs on the home screen (next 3)
- [ ] **DASH-04**: User can access quick actions from the home screen (add job, add client, log payment, toolkit)
- [ ] **DASH-05**: User sees HustleBucks balance on the home screen

### Profile

- [ ] **PROF-01**: User can view their profile with level, XP, badges, and business stats
- [ ] **PROF-02**: User can see all earned and locked badges in a collection view
- [ ] **PROF-03**: User can see a leaderboard teaser with simulated local rankings
- [ ] **PROF-04**: User can see lifetime stats (total earned, jobs done, clients, days active)
- [ ] **PROF-05**: User can reset all data (with confirmation)

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

- [ ] **DSGN-01**: App uses dark mode first with iOS native feel
- [ ] **DSGN-02**: App uses consistent color system (green for money, purple for XP, amber for HustleBucks)
- [ ] **DSGN-03**: All touch targets are minimum 44x44px
- [ ] **DSGN-04**: App has 5-tab bottom navigation (Home, Jobs, Clients, Earnings, Profile)
- [ ] **DSGN-05**: All data persists locally across app sessions

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
| ONBD-01 | — | Pending |
| ONBD-02 | — | Pending |
| ONBD-03 | — | Pending |
| ONBD-04 | — | Pending |
| ONBD-05 | — | Pending |
| CLNT-01 | — | Pending |
| CLNT-02 | — | Pending |
| CLNT-03 | — | Pending |
| CLNT-04 | — | Pending |
| CLNT-05 | — | Pending |
| JOBS-01 | — | Pending |
| JOBS-02 | — | Pending |
| JOBS-03 | — | Pending |
| JOBS-04 | — | Pending |
| JOBS-05 | — | Pending |
| JOBS-06 | — | Pending |
| JOBS-07 | — | Pending |
| PYMT-01 | — | Pending |
| PYMT-02 | — | Pending |
| PYMT-03 | — | Pending |
| EARN-01 | — | Pending |
| EARN-02 | — | Pending |
| EARN-03 | — | Pending |
| EARN-04 | — | Pending |
| GAME-01 | — | Pending |
| GAME-02 | — | Pending |
| GAME-03 | — | Pending |
| GAME-04 | — | Pending |
| GAME-05 | — | Pending |
| GAME-06 | — | Pending |
| GAME-07 | — | Pending |
| DASH-01 | — | Pending |
| DASH-02 | — | Pending |
| DASH-03 | — | Pending |
| DASH-04 | — | Pending |
| DASH-05 | — | Pending |
| PROF-01 | — | Pending |
| PROF-02 | — | Pending |
| PROF-03 | — | Pending |
| PROF-04 | — | Pending |
| PROF-05 | — | Pending |
| TOOL-01 | — | Pending |
| TOOL-02 | — | Pending |
| TOOL-03 | — | Pending |
| TOOL-04 | — | Pending |
| TOOL-05 | — | Pending |
| TOOL-06 | — | Pending |
| IDEA-01 | — | Pending |
| IDEA-02 | — | Pending |
| IDEA-03 | — | Pending |
| DSGN-01 | — | Pending |
| DSGN-02 | — | Pending |
| DSGN-03 | — | Pending |
| DSGN-04 | — | Pending |
| DSGN-05 | — | Pending |

**Coverage:**
- v1 requirements: 50 total
- Mapped to phases: 0
- Unmapped: 50

---
*Requirements defined: 2026-03-24*
*Last updated: 2026-03-24 after initial definition*
