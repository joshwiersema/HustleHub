# Phase 5: Payments and Dashboard - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Payment logging, earnings visualization, home dashboard composition with all prior outputs, profile screen with lifetime stats, and data reset. Delivers PYMT-01 through PYMT-03, EARN-01 through EARN-04, DASH-01 through DASH-05, PROF-01 through PROF-05.

</domain>

<decisions>
## Implementation Decisions

### Payment Logging (PYMT-01, PYMT-02, PYMT-03)
- Payment form as full-screen modal (same pattern as add-client and add-job modals)
- Fields: amount (numeric input, required), client name (picker from existing clients or manual text), payment method (pill selector from PAYMENT_METHODS in types/index.ts — Cash, Venmo, Zelle, PayPal, Other), date (text input MM/DD/YYYY, defaults to today), notes (optional text)
- Log payment awards 20 XP + updateStreak + checkBadges (same orchestration pattern as job-complete and client-add)
- Payment history as FlatList on Earnings tab, sorted newest-first — each row shows client name, amount (bold green), method emoji, date
- FAB on earnings tab opens add-payment modal
- Payments use paymentsStore (already exists with addPayment, deletePayment, getPaymentsByClient)
- Total earnings now derived from paymentsStore (replaces Phase 4 getTotalEarningsFromJobs proxy)

### Earnings Visualization (EARN-01, EARN-02, EARN-03, EARN-04)
- Earnings tab layout: large total at top (bold green, large font), time filter pills (This Week / This Month / All Time), bar chart below, summary stats row, then payment history list
- Bar chart built with plain React Native Views (no chart library) — 7 bars for week view, ~4 bars for month view, 12 bars for all-time (monthly). Each bar is a green View with height proportional to max value. Labels below.
- Time filter toggles which payments are included in total, chart, and stats
- Summary stats row: total earnings, average per payment, payment count — shown as 3 StatCards
- Earnings tab replaces the old placeholder

### Home Dashboard (DASH-01, DASH-02, DASH-03, DASH-04, DASH-05)
- Extend existing Home screen (already has ScreenHeader with greeting, StatCards, XP bar, streak, HustleBucks)
- Add: upcoming jobs section (next 3 upcoming jobs as compact cards with date, time, client, price)
- Add: quick action buttons row — 4 icon buttons (Add Job, Add Client, Log Payment, Toolkit) with labels, using router.push to respective screens/modals
- Earnings StatCard now reads from paymentsStore (real payments) instead of getTotalEarningsFromJobs proxy
- HustleBucks balance already on home (from Phase 4)
- Greeting already uses business name (from Phase 4)

### Profile & Data Reset (PROF-01, PROF-02, PROF-03, PROF-04, PROF-05)
- Extend existing Profile screen (already has level, XP bar, badge gallery from Phase 4)
- Add: lifetime stats section — 4 StatCards: total earned (from payments), jobs completed, total clients, days active (calculated from joinedDate)
- Add: leaderboard teaser — static card showing "Local Rankings Coming Soon" with 3 fake entries + user's position (motivational, not real data)
- Add: data reset button at bottom — red outlined button, taps shows Alert.alert confirmation, on confirm: reset all stores (profileStore, clientsStore, jobsStore, paymentsStore, gameStore) then router.replace('/onboarding')
- Earned/locked badges already visible (from Phase 4 BadgeGallery)

### Claude's Discretion
- Bar chart animation (simple or none — Views already render at correct height)
- Quick action button icon and layout proportions
- Upcoming jobs card design details
- Leaderboard teaser styling
- Exact time filter date boundary logic

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/store/paymentsStore.ts` — Full CRUD: addPayment, deletePayment, getPaymentsByClient. Already persists to AsyncStorage.
- `src/types/index.ts` — Payment type, PAYMENT_METHODS array with ids, labels, icons, emojis
- `src/components/StatCard.tsx` — Stat display card (used on Home and Profile)
- `src/components/Card.tsx` — Base card component
- `src/components/GradientButton.tsx` — Green gradient button
- `src/components/XPBar.tsx` — Animated XP progress bar
- `src/components/BadgeGallery.tsx` — Badge collection grid
- `src/components/StreakBadge.tsx` — Fire emoji streak widget
- `src/components/HustleBucksDisplay.tsx` — HustleBucks balance
- `src/utils/gamification.ts` — checkBadges, getBadgeProgress, getXPForLevel, getTotalEarningsFromJobs

### Established Patterns
- Full-screen Modal for add/edit forms (from clients.tsx, jobs.tsx)
- FlatList with ListHeaderComponent for scrollable form content
- FAB (floating action button) to open modals
- Screen-level gamification orchestration: addXP → updateStreak → checkBadges → earnBadge → showXPToast
- Granular Zustand selectors to minimize re-renders
- Pill selector pattern (duration pills in job form)

### Integration Points
- `app/(tabs)/index.tsx` — Home screen to extend with upcoming jobs + quick actions
- `app/(tabs)/profile.tsx` — Profile to extend with lifetime stats + reset
- `app/(tabs)/earnings.tsx` — Earnings tab (currently placeholder) to rebuild entirely
- `src/store/paymentsStore.ts` — Payment data source
- `src/utils/gamification.ts` — getTotalEarningsFromJobs needs replacement with paymentsStore total

</code_context>

<specifics>
## Specific Ideas

- The earnings total should be THE most prominent number in the app — giant, bold, green, impossible to miss
- Bar chart should feel clean and modern (Robinhood-style) — not Excel-looking
- Quick action buttons should feel like a launcher — large icons, satisfying tap targets
- Upcoming jobs on Home should feel like "what's next" — compact but informative
- Data reset should be scary enough that accidental taps don't destroy data — double confirmation

</specifics>

<deferred>
## Deferred Ideas

- Real payment processing (Stripe, etc.) — v2, regulatory complexity
- Expense tracking / profit-loss — v2, accounting complexity
- Push notifications for payment reminders — v2 notification system

</deferred>

---

*Phase: 05-payments-and-dashboard*
*Context gathered: 2026-03-25*
