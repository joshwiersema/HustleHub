# Phase 5: Payments and Dashboard - Research

**Researched:** 2026-03-24
**Domain:** Payment logging, earnings visualization, home dashboard composition, profile lifetime stats, data reset
**Confidence:** HIGH

## Summary

Phase 5 is the largest phase by requirement count (17 requirements) but is architecturally the simplest because it builds entirely on established patterns. Every screen being modified already exists. The paymentsStore is already implemented with full CRUD. The gamification orchestration pattern (addXP -> updateStreak -> checkBadges -> earnBadge -> showXPToast) has been executed identically in clients.tsx and jobs.tsx. The bar chart is explicitly hand-rolled with plain Views (no chart library). All UI components needed (Card, StatCard, GradientButton, EmptyState, FAB, modal forms) have been built and battle-tested across Phases 3-4.

The primary technical concern is the earnings data migration: Home screen and Profile screen currently derive total earnings from `getTotalEarningsFromJobs()` (sum of completed job prices). Phase 5 replaces this with `paymentsStore` as the single source of truth. This is a clean swap -- the proxy function was explicitly marked as "Phase 4 proxy" in the codebase comments.

**Primary recommendation:** Split into 3 plans: (1) Earnings tab with payment logging + chart + history, (2) Home dashboard extensions + quick actions, (3) Profile lifetime stats + data reset. Plan 1 is the heaviest; plans 2 and 3 are incremental extensions of existing screens.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Payment form as full-screen modal (same pattern as add-client and add-job modals)
- Fields: amount (numeric input, required), client name (picker from existing clients or manual text), payment method (pill selector from PAYMENT_METHODS), date (text input MM/DD/YYYY, defaults to today), notes (optional text)
- Log payment awards 20 XP + updateStreak + checkBadges (same orchestration pattern)
- Payment history as FlatList on Earnings tab, sorted newest-first -- each row shows client name, amount (bold green), method emoji, date
- FAB on earnings tab opens add-payment modal
- Payments use paymentsStore (already exists with addPayment, deletePayment, getPaymentsByClient)
- Total earnings now derived from paymentsStore (replaces Phase 4 getTotalEarningsFromJobs proxy)
- Earnings tab layout: large total at top (bold green, large font), time filter pills (This Week / This Month / All Time), bar chart below, summary stats row, then payment history list
- Bar chart built with plain React Native Views (no chart library) -- 7 bars for week view, ~4 bars for month view, 12 bars for all-time (monthly)
- Time filter toggles which payments are included in total, chart, and stats
- Summary stats row: total earnings, average per payment, payment count -- shown as 3 StatCards
- Extend existing Home screen with upcoming jobs section (next 3) and quick action buttons row (Add Job, Add Client, Log Payment, Toolkit)
- Earnings StatCard on Home reads from paymentsStore (real payments) instead of getTotalEarningsFromJobs proxy
- Extend existing Profile screen with lifetime stats section (4 StatCards: total earned, jobs completed, total clients, days active)
- Leaderboard teaser -- static card showing "Local Rankings Coming Soon" with 3 fake entries + user's position
- Data reset button at bottom -- red outlined button, Alert.alert confirmation, reset all stores then router.replace('/onboarding')
- Earned/locked badges already visible (from Phase 4 BadgeGallery)

### Claude's Discretion
- Bar chart animation (simple or none -- Views already render at correct height)
- Quick action button icon and layout proportions
- Upcoming jobs card design details
- Leaderboard teaser styling
- Exact time filter date boundary logic

### Deferred Ideas (OUT OF SCOPE)
- Real payment processing (Stripe, etc.) -- v2, regulatory complexity
- Expense tracking / profit-loss -- v2, accounting complexity
- Push notifications for payment reminders -- v2 notification system
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| PYMT-01 | User can log a payment with amount, client name, payment method, date, and notes | Existing paymentsStore.addPayment + full-screen modal pattern from clients.tsx/jobs.tsx; Payment type already defined in types/index.ts |
| PYMT-02 | User can select payment method from: Cash, Venmo, Zelle, PayPal, Other | PAYMENT_METHODS array already in types/index.ts with id, label, icon, emoji; pill selector pattern from jobs.tsx duration pills |
| PYMT-03 | User can view payment history with client name, amount, method, and date | FlatList pattern from clients.tsx; payments sorted newest-first; method emoji from PAYMENT_METHODS lookup |
| EARN-01 | User can see total earnings displayed prominently | Sum all filtered payments from paymentsStore; display with FontSize.hero or mega + Colors.primary |
| EARN-02 | User can filter earnings by time period (this week, this month, all time) | Pill selector UI pattern exists; date filtering uses plain JS Date arithmetic (same pattern as Phase 3 dateHelpers) |
| EARN-03 | User can see earnings visualized in a bar chart | Plain View bars with height proportional to max value; no chart library per locked decision |
| EARN-04 | User can see summary stats (total, average per job, payment count) | 3 StatCards in a row (existing component); derived from filtered payments array |
| DASH-01 | User sees a home screen with greeting, business name, and quick stats | Already implemented in index.tsx; earnings StatCard swap from jobs proxy to paymentsStore |
| DASH-02 | User sees their XP bar and current level on the home screen | Already implemented in index.tsx with XPBar component |
| DASH-03 | User sees upcoming jobs on the home screen (next 3) | Filter jobs where status === 'upcoming', sort by parseDateString ascending, take first 3 |
| DASH-04 | User can access quick actions from the home screen | 4 Pressable buttons with Ionicons + labels; router.push to respective screens/tabs |
| DASH-05 | User sees HustleBucks balance on the home screen | Already implemented in index.tsx with HustleBucksDisplay component |
| PROF-01 | User can view their profile with level, XP, badges, and business stats | Already partially implemented in profile.tsx; extend with lifetime stats section |
| PROF-02 | User can see all earned and locked badges in a collection view | Already implemented in profile.tsx with BadgeGallery component |
| PROF-03 | User can see a leaderboard teaser with simulated local rankings | Static Card with fake data; no backend integration; purely motivational |
| PROF-04 | User can see lifetime stats (total earned, jobs done, clients, days active) | 4 StatCards; days active calculated from profile.joinedDate (ISO string) to today |
| PROF-05 | User can reset all data (with confirmation) | Reset all 4 stores (profile, clients, jobs, payments, game) + router.replace('/onboarding') |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| react-native | 0.83.2 | UI framework | Installed |
| expo-router | 55.0.7 | Navigation/routing | Installed |
| zustand | 5.0.12 | State management | Installed |
| @react-native-async-storage/async-storage | 3.0.1 | Persistence | Installed |
| expo-linear-gradient | 55.0.9 | Gradient backgrounds (FAB, buttons) | Installed |
| @expo/vector-icons (Ionicons) | 15.1.1 | Icons throughout UI | Installed |
| react-native-safe-area-context | 5.7.0 | Safe area insets | Installed |
| react-native-reanimated | 4.2.3 | Animations (optional bar chart entry) | Installed |

### No New Dependencies Required
Phase 5 requires zero new npm packages. The bar chart is hand-rolled with Views. All stores, types, and components already exist.

## Architecture Patterns

### Existing Screen Extension Pattern
All three screens being extended follow the same structure:
```
SafeAreaView (edges=['top'])
  ScrollView (showsVerticalScrollIndicator=false)
    ScreenHeader
    [content sections]
    bottomSpacer (height: Spacing.huge)
```

### Full-Screen Modal Form Pattern (for Add Payment)
Exact pattern from clients.tsx and jobs.tsx:
```typescript
// State: modalVisible, form fields as individual useState hooks
// Open: setModalVisible(true), clear/populate form in useEffect
// Save: validate required fields, construct Payment object, call store action
// Close: setModalVisible(false)

<Modal
  visible={modalVisible}
  animationType="slide"
  presentationStyle="pageSheet"
>
  <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <SafeAreaView edges={['top']}>
      {/* Header with close + title + save */}
      <FlatList
        data={[]} // empty -- using ListHeaderComponent for scrollable form
        ListHeaderComponent={/* all form fields */}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  </KeyboardAvoidingView>
</Modal>
```

### FAB Pattern (for Earnings tab)
```typescript
// Positioned absolute bottom-right
<Pressable onPress={handleOpenAdd} style={styles.fab}>
  <LinearGradient colors={Colors.gradientGreen} style={styles.fabGradient}>
    <Ionicons name="add" size={28} color={Colors.textInverse} />
  </LinearGradient>
</Pressable>

// Styles:
fab: { position: 'absolute', bottom: 24, right: 20, zIndex: 10, ...Shadows.elevated }
fabGradient: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' }
```

### Gamification Orchestration Pattern (for Log Payment)
Screen-level orchestration, NOT in stores (avoids cross-store coupling):
```typescript
// 1. Perform the business action
usePaymentsStore.getState().addPayment(newPayment);

// 2. Award XP (20 for payment)
const gameState = useGameStore.getState();
gameState.addXP(20);

// 3. Update streak
gameState.updateStreak();

// 4. Check badges (with updated counts from all stores)
const updated = useGameStore.getState();
const newBadges = checkBadges(
  { earnedBadges: updated.earnedBadges, streak: updated.streak },
  {
    totalClients: useClientsStore.getState().clients.length,
    completedJobs: useJobsStore.getState().jobs.filter(j => j.status === 'completed').length,
    totalEarnings: /* sum from paymentsStore */,
  }
);
newBadges.forEach(id => useGameStore.getState().earnBadge(id));

// 5. Show XP toast
showXPToast(20);
```

### Pill Selector Pattern (for Time Filters + Payment Methods)
From jobs.tsx DURATION_OPTIONS and FREQUENCY_OPTIONS:
```typescript
const TIME_FILTERS = [
  { key: 'week', label: 'This Week' },
  { key: 'month', label: 'This Month' },
  { key: 'all', label: 'All Time' },
];

// Render as row of Pressable pills with active state styling
<View style={styles.pillRow}>
  {TIME_FILTERS.map((filter) => (
    <Pressable
      key={filter.key}
      onPress={() => setActiveFilter(filter.key)}
      style={[styles.pill, activeFilter === filter.key && styles.pillActive]}
    >
      <Text style={[styles.pillText, activeFilter === filter.key && styles.pillTextActive]}>
        {filter.label}
      </Text>
    </Pressable>
  ))}
</View>
```

### Data Reset Pattern (for Profile)
```typescript
// All stores have reset() methods that restore initialState:
// - useProfileStore.getState().reset()
// - useClientsStore.getState().reset()
// - useJobsStore.getState().reset()
// - usePaymentsStore.getState().reset()
// - useGameStore.getState().reset()
// Then: router.replace('/onboarding')
```

### Upcoming Jobs Query Pattern
```typescript
const upcomingJobs = useMemo(() => {
  return jobs
    .filter((j) => j.status === 'upcoming')
    .sort((a, b) => parseDateString(a.date).getTime() - parseDateString(b.date).getTime())
    .slice(0, 3);
}, [jobs]);
```

### Recommended Structure (No new files in src/)
```
app/(tabs)/
  earnings.tsx     # REWRITE: full earnings tab with payment form, chart, history
  index.tsx        # EXTEND: add upcoming jobs section + quick action buttons
  profile.tsx      # EXTEND: add lifetime stats + leaderboard teaser + data reset
```

No new component files needed -- all UI is screen-specific or uses existing components. The bar chart is inline to earnings.tsx (not a reusable component, per the "Robinhood-style" specificity).

### Anti-Patterns to Avoid
- **Cross-store calls in stores:** Gamification orchestration must stay at screen level. Never import gameStore inside paymentsStore.
- **Chart libraries for simple bars:** The decision explicitly says "plain React Native Views." Do not install victory-native, react-native-chart-kit, or similar.
- **Separate modal screen for payment form:** Use inline Modal component in earnings.tsx, same as clients.tsx and jobs.tsx. Do not create a new route.
- **Computed store selectors for filtered earnings:** Keep filtering logic in the screen component with useMemo. Stores stay simple CRUD.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Date filtering (week/month) | Custom date library | Plain JS Date arithmetic | dateHelpers.ts already uses this pattern; parseDateString already exists |
| Unique IDs | UUID library | Date.now().toString(36) + Math.random().toString(36).substr(2) | Established pattern from clients.tsx; uuid package exists but isn't used for this pattern |
| Gradient buttons | Custom gradient wrapper | GradientButton component | Already built with size variants (sm/md/lg) |
| Card containers | Custom styled views | Card component | Already handles press states, shadows, borders |
| Empty states | Custom empty UI | EmptyState component | Already built with icon, title, subtitle, optional action |
| XP/level display | Custom progress bar | XPBar component | Already built with animation |
| Badge display | Custom badge grid | BadgeGallery component | Already built with expand/collapse, progress bars |

**Key insight:** This phase should create zero new reusable components. Everything is either screen-specific UI or an existing component.

## Common Pitfalls

### Pitfall 1: Badge Earnings Check Uses Wrong Total
**What goes wrong:** The `checkBadges` function checks `totalEarnings` thresholds ($100, $500, $1000). If earnings are still derived from `getTotalEarningsFromJobs` (completed job prices) instead of payment totals, badge thresholds use the wrong data source.
**Why it happens:** Two sources of truth during migration.
**How to avoid:** When implementing gamification orchestration for payment logging, pass the paymentsStore total to `checkBadges`, not the jobs proxy. Also update Home and Profile screens in the same wave to avoid inconsistency.
**Warning signs:** Badges like "Benjamin" ($100) unlock at wrong thresholds.

### Pitfall 2: Time Filter Date Boundary Off-by-One
**What goes wrong:** "This Week" shows payments from 6 days ago instead of 7, or misses today's payments.
**Why it happens:** Midnight boundary calculations using `new Date()` without zeroing out hours/minutes/seconds.
**How to avoid:** For "This Week": calculate start of today minus 6 days (7 total including today), zero out to midnight. For "This Month": first day of current month at midnight. Compare payment dates using `>=` start boundary.
**Warning signs:** A payment logged "today" doesn't appear in "This Week" filter.

### Pitfall 3: Bar Chart Division by Zero
**What goes wrong:** When all payments in a period have $0 amount (or no payments exist), calculating bar height as `amount / maxAmount` divides by zero.
**Why it happens:** Edge case when maxAmount is 0.
**How to avoid:** Guard with `maxAmount > 0 ? (amount / maxAmount) : 0` for height calculation. Show EmptyState when no payments exist for the selected period.
**Warning signs:** NaN heights, bars rendering at incorrect sizes.

### Pitfall 4: Data Reset Doesn't Navigate to Onboarding
**What goes wrong:** After resetting all stores, the app stays on the tabs screen with empty data instead of returning to onboarding.
**Why it happens:** Profile store reset sets `isOnboarded: false`, which should trigger `Stack.Protected guard={isOnboarded}` to redirect. But if `router.replace('/onboarding')` isn't called explicitly, there can be a flash of empty content.
**How to avoid:** Call `router.replace('/onboarding')` immediately after resetting all stores. The root layout's Stack.Protected will handle the guard, but explicit navigation avoids any visual flash.
**Warning signs:** Brief flash of empty Home screen before redirect.

### Pitfall 5: Quick Action Buttons Navigate to Wrong Routes
**What goes wrong:** Quick action buttons on Home try to navigate to routes that don't exist or use wrong path format.
**Why it happens:** Expo Router uses file-system based routing. Tab screens are at `/(tabs)/jobs`, `/(tabs)/clients`, etc.
**How to avoid:** Use `router.push('/(tabs)/jobs')` for tab screens, or use the `Href` type from expo-router. For the "Log Payment" quick action, navigate to `/(tabs)/earnings` and the user taps FAB (or trigger modal state via callback). For toolkit, use `router.push('/toolkit')`.
**Warning signs:** Navigation errors in console, blank screens.

### Pitfall 6: Payment Form Amount Not Properly Parsed
**What goes wrong:** Amount stored as string instead of number, or includes currency symbols, leading to NaN in calculations.
**Why it happens:** TextInput returns strings. If not parsed to float, arithmetic fails silently.
**How to avoid:** Use `keyboardType="numeric"` on the TextInput. Parse with `parseFloat(amount)` on save. Validate `isNaN` before accepting. Strip any non-numeric characters except decimal point.
**Warning signs:** "$NaN" displayed in earnings total.

## Code Examples

### Bar Chart with Plain Views
```typescript
// Source: Established pattern from CONTEXT.md decision

interface BarData {
  label: string;
  value: number;
}

function BarChart({ data }: { data: BarData[] }) {
  const maxValue = Math.max(...data.map(d => d.value), 1); // Guard against 0
  const BAR_MAX_HEIGHT = 120;

  return (
    <View style={barStyles.container}>
      <View style={barStyles.barsRow}>
        {data.map((item, index) => (
          <View key={index} style={barStyles.barColumn}>
            <View
              style={[
                barStyles.bar,
                {
                  height: maxValue > 0
                    ? (item.value / maxValue) * BAR_MAX_HEIGHT
                    : 0,
                },
              ]}
            />
            <Text style={barStyles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// Bar style: backgroundColor: Colors.primary, borderRadius top corners
// Label style: Colors.textMuted, FontSize.xs, centered below bar
```

### Time Filter Logic
```typescript
// Source: Plain JS Date arithmetic (established pattern from dateHelpers.ts)

type TimeFilter = 'week' | 'month' | 'all';

function getFilteredPayments(payments: Payment[], filter: TimeFilter): Payment[] {
  if (filter === 'all') return payments;

  const now = new Date();
  let startDate: Date;

  if (filter === 'week') {
    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6);
  } else {
    // month
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  return payments.filter((p) => {
    const paymentDate = parseDateString(p.date);
    return paymentDate >= startDate;
  });
}
```

### Total Earnings from Payments (Replacing Proxy)
```typescript
// Source: Replaces getTotalEarningsFromJobs from gamification.ts

function getTotalFromPayments(payments: Payment[]): number {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

// Use in Home: const payments = usePaymentsStore(s => s.payments);
// Use in Profile: const payments = usePaymentsStore(s => s.payments);
// Both screens stop importing getTotalEarningsFromJobs
```

### Quick Action Button Row
```typescript
// Source: Established Pressable + Ionicons pattern

const QUICK_ACTIONS = [
  { icon: 'add-circle-outline', label: 'Add Job', route: '/(tabs)/jobs' },
  { icon: 'person-add-outline', label: 'Add Client', route: '/(tabs)/clients' },
  { icon: 'cash-outline', label: 'Log Payment', route: '/(tabs)/earnings' },
  { icon: 'construct-outline', label: 'Toolkit', route: '/toolkit' },
];

// Each button:
// - Pressable with centered Ionicons icon in a circular bgElevated container
// - Text label below
// - Row with justifyContent: 'space-around'
// - Minimum 44x44 touch target (per DSGN-03)
```

### Days Active Calculation
```typescript
// Source: Profile joinedDate is ISO string from onboarding

function getDaysActive(joinedDate: string): number {
  const joined = new Date(joinedDate);
  const now = new Date();
  const diffMs = now.getTime() - joined.getTime();
  return Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}
```

### Full Store Reset Sequence
```typescript
// Source: All stores have reset() -> initialState pattern

import { useProfileStore } from '../store/profileStore';
import { useClientsStore } from '../store/clientsStore';
import { useJobsStore } from '../store/jobsStore';
import { usePaymentsStore } from '../store/paymentsStore';
import { useGameStore } from '../store/gameStore';

function handleReset() {
  Alert.alert(
    'Reset All Data',
    'This will permanently delete all your data including clients, jobs, payments, and progress. This cannot be undone.',
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset Everything',
        style: 'destructive',
        onPress: () => {
          useProfileStore.getState().reset();
          useClientsStore.getState().reset();
          useJobsStore.getState().reset();
          usePaymentsStore.getState().reset();
          useGameStore.getState().reset();
          router.replace('/onboarding');
        },
      },
    ],
  );
}
```

## State of the Art

| Old Approach (Phase 4) | Current Approach (Phase 5) | Impact |
|------------------------|---------------------------|--------|
| getTotalEarningsFromJobs (sum completed job prices) | Sum from paymentsStore | Real payment tracking, decoupled from job completion |
| Earnings tab placeholder (EmptyState) | Full earnings tab with chart + history + filters | Major feature delivery |
| Home screen with motivational card | Home screen with upcoming jobs + quick actions | Actionable dashboard |
| Profile with basic stats | Profile with lifetime stats + leaderboard teaser + data reset | Full profile experience |

**Deprecated after Phase 5:**
- `getTotalEarningsFromJobs()` in gamification.ts: Can be removed or left for reference. Home and Profile screens stop calling it.

## Open Questions

1. **Quick Action "Log Payment" routing**
   - What we know: Quick action buttons navigate to their respective screens. "Add Job" and "Add Client" go to their tab screens.
   - What's unclear: "Log Payment" goes to earnings tab, but the user then needs to tap the FAB to open the modal. There's no way to auto-open a modal on navigation with the current pattern.
   - Recommendation: Navigate to earnings tab. The FAB is prominent enough. Alternatively, could use a shared state flag, but that adds complexity for minimal gain. Keep it simple -- navigate to the tab.

2. **Bar chart data aggregation for "All Time" view**
   - What we know: All Time shows 12 bars (monthly). If user has been active less than 12 months, some bars will be zero.
   - What's unclear: Should it show the last 12 calendar months, or only months with data?
   - Recommendation: Show last 12 calendar months (including current). Zero-height bars for months with no payments. This gives consistent layout and shows growth trajectory.

## Sources

### Primary (HIGH confidence)
- **Codebase inspection:** Direct reading of all relevant files -- paymentsStore.ts, types/index.ts, gamification.ts, all tab screens, all components, theme constants, root layout, package.json
- **CONTEXT.md decisions:** All implementation decisions locked by user

### Secondary (MEDIUM confidence)
- **React Native View-based charts:** Standard pattern -- Views with dynamic height are a well-known approach for simple bar charts without library dependencies

### Tertiary (LOW confidence)
- None. All findings verified against actual codebase.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed, no new dependencies
- Architecture: HIGH -- all patterns observed directly in codebase across 4 completed phases
- Pitfalls: HIGH -- derived from actual code patterns and known edge cases in date arithmetic and store state management
- Code examples: HIGH -- modeled directly on existing codebase patterns with verified component APIs

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable -- no external dependencies, all patterns internal)
