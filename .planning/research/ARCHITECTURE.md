# Architecture Patterns

**Project:** HustleHub
**Domain:** Gamified mobile business management app (iOS-first, React Native Expo)
**Researched:** 2026-03-24

---

## Recommended Architecture

HustleHub should follow a **feature-oriented, layered architecture** with a strict separation between the UI layer, business logic layer, and persistence layer. State is managed through domain-scoped Zustand stores that persist to AsyncStorage via the `persist` middleware. Expo Router provides file-based navigation with thin route files that import from feature folders.

```
┌─────────────────────────────────────────────────────────────┐
│                        UI LAYER                             │
│   Expo Router (app/)  ←  Feature Screens (features/)       │
│   Theme System (lib/theme/)  ←  UI Primitives (components/) │
└───────────────────────────┬─────────────────────────────────┘
                            │ reads/writes via hooks
┌───────────────────────────▼─────────────────────────────────┐
│                   STATE / LOGIC LAYER                        │
│   Zustand stores per domain (features/*/use-*-store.tsx)    │
│   Gamification Engine (lib/gamification/)                    │
│   Business logic utilities (lib/utils/)                      │
└───────────────────────────┬─────────────────────────────────┘
                            │ persist middleware
┌───────────────────────────▼─────────────────────────────────┐
│                   PERSISTENCE LAYER                          │
│   AsyncStorage via @react-native-async-storage              │
│   Zustand persist + createJSONStorage wrapper               │
│   Namespaced key schema: @hustlehub/[domain]                │
└─────────────────────────────────────────────────────────────┘
```

---

## Component Boundaries

### 1. Routing Shell (`app/`)

**Responsibility:** File-based navigation only. Every file in `app/` is a thin wrapper that imports and renders a screen from `features/`. No business logic, no state reads here.

**Communicates with:** Feature screens (import only, one-way).

**Key structure:**
```
app/
  _layout.tsx              ← Root layout: ThemeProvider, safe area, fonts
  (onboarding)/
    _layout.tsx
    index.tsx              ← re-exports features/onboarding/onboarding-screen
    hustle-select.tsx
    profile-setup.tsx
  (tabs)/
    _layout.tsx            ← Bottom tab bar definition
    index.tsx              ← Home dashboard
    jobs.tsx
    clients.tsx
    earnings.tsx
    profile.tsx
  jobs/
    [id].tsx               ← Job detail (dynamic route)
    new.tsx
  clients/
    [id].tsx
    new.tsx
  tools/
    flyer-generator.tsx
    business-card.tsx
    pricing-calculator.tsx
    business-ideas.tsx
    name-generator.tsx
```

### 2. Feature Modules (`features/`)

**Responsibility:** Each feature owns its screens, feature-specific sub-components, and its Zustand store slice. Features are isolated — no feature imports from another feature's internals.

**Communicates with:** `lib/` (shared utilities, gamification engine), `components/` (shared UI primitives).

**Key features:**
```
features/
  onboarding/              ← First-run hustle type + profile setup
  dashboard/               ← Home screen: quick stats, upcoming jobs, XP bar
  jobs/                    ← Job list, job detail, new job form, recurring job logic
  clients/                 ← Client list, client detail, new client form
  earnings/                ← Payment logging, earnings totals, charts
  gamification/            ← XP bar display, badge gallery, level progression UI
  tools/                   ← Flyer generator, business card, pricing calc, ideas engine
  profile/                 ← Level display, badge showcase, stats summary
```

Each feature follows this internal pattern:
```
features/[feature-name]/
  [feature]-screen.tsx     ← Main screen component (composition only)
  components/              ← Sub-components used only within this feature
  use-[feature]-store.tsx  ← Zustand store slice with AsyncStorage persistence
  types.ts                 ← Feature-local TypeScript types
```

### 3. Shared UI Primitives (`components/`)

**Responsibility:** Design system tokens, reusable atoms (Button, Card, Badge, ProgressBar, Icon), and layout helpers. These have no business logic and no state dependencies.

**Communicates with:** Nothing — purely presentational, receives props only.

```
components/
  ui/
    Button.tsx
    Card.tsx
    ProgressBar.tsx        ← XP bar, level bar
    BadgeTile.tsx
    StatCard.tsx
    EmptyState.tsx
    Avatar.tsx
  charts/
    EarningsBarChart.tsx   ← Victory Native wrapper
    WeeklyActivityChart.tsx
  forms/
    TextInput.tsx
    DatePicker.tsx
    CurrencyInput.tsx
    SelectField.tsx
```

### 4. Core Library (`lib/`)

**Responsibility:** App-wide shared logic that is not UI. This is the most critical layer — gamification engine, theme system, storage abstraction, and utility functions all live here.

**Communicates with:** All feature stores consume from `lib/`. Feature stores write events to `lib/gamification/`. `lib/` has no dependency on any `features/` code.

```
lib/
  theme/
    colors.ts              ← Semantic color tokens (dark-first)
    typography.ts
    spacing.ts
    useTheme.ts            ← useColorScheme hook wrapper
  gamification/
    engine.ts              ← XP award, level calculation, badge unlock logic
    rules.ts               ← Event → XP mapping table, badge trigger conditions
    types.ts               ← XPEvent, Badge, Level, HustleBucks types
  storage/
    storage.ts             ← createJSONStorage wrapper for AsyncStorage
    keys.ts                ← Namespaced key constants (@hustlehub/*)
  utils/
    currency.ts            ← Format $, calculate earnings averages
    dates.ts               ← Recurring job date generation (weekly/biweekly/monthly)
    hustle-config.ts       ← Per-hustle-type metadata (name, icon, color, tips)
    pricing.ts             ← Earnings projection calculations
  hooks/
    useOnboarded.ts        ← Guards onboarding gate
    useUpcomingJobs.ts     ← Derived selector: next N jobs sorted by date
```

### 5. Gamification Engine (`lib/gamification/`)

This is the single most important boundary to enforce. The gamification engine must be **event-driven and stateless** — features do not directly mutate gamification state. Instead, features emit XP events, and the engine processes them.

```
Feature action → dispatch XPEvent → engine.processEvent(event)
                                        ↓
                                 award XP to profile
                                 check level thresholds → emit level-up
                                 check badge conditions → emit badge-unlock
                                        ↓
                              profileStore updates (persisted)
```

**XP Event types:**
- `JOB_COMPLETED` → 50 XP + HustleBucks
- `PAYMENT_LOGGED` → 25 XP
- `CLIENT_ADDED` → 30 XP
- `RECURRING_JOB_CREATED` → 40 XP
- `FLYER_GENERATED` → 20 XP
- `BUSINESS_CARD_GENERATED` → 20 XP
- `FIRST_JOB_SCHEDULED` → 60 XP (one-time)
- `FIRST_CLIENT_ADDED` → 50 XP (one-time)
- `APP_OPENED_7_DAYS_STREAK` → 100 XP (streak trigger)

### 6. Theme System (`lib/theme/`)

Dark-mode-first with three accent tracks:
- Green `#00E676` → money, earnings, growth indicators
- Purple `#B388FF` → XP, levels, gamification elements
- Amber `#FFD740` → HustleBucks, currency rewards

The theme system exposes semantic tokens, not raw hex values. Components consume tokens (`colors.xpPrimary`, `colors.earningsPrimary`), never raw hex strings.

```
colors.ts exports:
  background.primary   = '#0A0A0A'
  background.surface   = '#141414'
  background.card      = '#1E1E1E'
  text.primary         = '#FFFFFF'
  text.secondary       = '#A0A0A0'
  accent.earnings      = '#00E676'
  accent.xp            = '#B388FF'
  accent.hustleBucks   = '#FFD740'
  accent.danger        = '#FF5252'
  border.default       = '#2A2A2A'
```

### 7. Persistence Schema (`lib/storage/`)

AsyncStorage stores JSON arrays keyed by namespace. No relational joins — denormalize aggressively for read performance.

**Key schema:**
```
@hustlehub/profile         → UserProfile (single object: name, hustle type, created date)
@hustlehub/gamification    → GamificationState (XP, level, HustleBucks, badges, awarded events)
@hustlehub/clients         → Client[] (array of client objects with uuid)
@hustlehub/jobs            → Job[] (array of job objects with clientId FK)
@hustlehub/payments        → Payment[] (array with jobId FK)
@hustlehub/settings        → AppSettings (theme override, notifications stub)
```

**Data types:**
```typescript
type Client = {
  id: string;          // uuid
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  notes?: string;
  hustleType: HustleType;
  createdAt: string;   // ISO date string
}

type Job = {
  id: string;
  clientId: string;    // FK to Client.id (denormalized clientName for display)
  clientName: string;
  title: string;
  hustleType: HustleType;
  scheduledAt: string; // ISO datetime
  durationMinutes: number;
  price: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  isRecurring: boolean;
  recurrencePattern?: 'weekly' | 'biweekly' | 'monthly';
  recurrenceGroupId?: string; // links recurring instances
  notes?: string;
  createdAt: string;
}

type Payment = {
  id: string;
  jobId: string;
  clientId: string;
  amount: number;
  method: 'cash' | 'venmo' | 'zelle' | 'paypal' | 'other';
  loggedAt: string;
  notes?: string;
}

type GamificationState = {
  xp: number;
  level: number;           // 1-10
  hustleBucks: number;
  badges: string[];        // badge IDs earned
  awardedEvents: string[]; // event IDs already rewarded (prevent double-award)
  lastOpened: string;      // ISO date for streak tracking
  openStreak: number;
}
```

---

## Data Flow

### Primary Write Path (Job Completion Example)

```
User taps "Mark Complete" on JobDetailScreen
  │
  ▼
jobsStore.completeJob(jobId)
  │
  ├──► Update Job.status = 'completed' in @hustlehub/jobs (AsyncStorage write)
  │
  └──► gamificationEngine.processEvent({ type: 'JOB_COMPLETED', jobId, amount })
         │
         ├──► Calculate XP delta (50 XP base + bonus for high-value jobs)
         ├──► Calculate HustleBucks delta
         ├──► Check level threshold → trigger level-up if crossed
         ├──► Check badge unlock conditions
         └──► profileStore.applyRewards({ xp, hustleBucks, newBadges, newLevel })
                │
                └──► Persist @hustlehub/gamification (AsyncStorage write)
                     Trigger reward animation (toast + confetti)
```

### Primary Read Path (Dashboard)

```
Dashboard mounts
  │
  ▼
useUpcomingJobs() hook
  │
  ├──► Read jobsStore.jobs (Zustand in-memory, already hydrated from AsyncStorage)
  └──► Filter + sort → return next 5 scheduled jobs

useGamificationStore()
  │
  └──► Read gamificationStore.xp, level, hustleBucks (in-memory, hydrated)

All data is synchronous after hydration — no async waterfall on render
```

### Onboarding Gate

```
App launches → _layout.tsx checks useOnboarded()
  │
  ├── false → Navigate to (onboarding)/ group
  │              User selects hustle type → sets profileStore.hustleType
  │              User enters name, business name → sets profileStore.*
  │              On complete → profileStore.markOnboarded()
  │                            → Navigate to (tabs)/
  │
  └── true → Navigate directly to (tabs)/
```

### Flyer/Business Card Generation Flow

```
User configures template in tools/flyer-generator
  │
  ▼
FlyerCanvas renders a styled React Native View (off-screen or visible)
  │
  ▼
react-native-view-shot.captureRef(flyerRef) → PNG buffer
  │
  ├──► expo-media-library.saveToLibraryAsync(uri) → save to Camera Roll
  └──► expo-sharing.shareAsync(uri) → native iOS share sheet

Side effect: dispatch XPEvent({ type: 'FLYER_GENERATED' })
```

---

## Suggested Build Order

Dependencies drive the sequence. The persistence layer and theme system must exist before any feature can be built. The gamification engine must exist before features emit XP events.

### Phase 1: Foundation (no dependencies, all other phases depend on this)

1. Theme system (`lib/theme/`) — colors, typography, spacing tokens
2. Persistence layer (`lib/storage/`) — AsyncStorage wrapper, key constants
3. Zustand store scaffolding pattern — establish the `use-*-store.tsx` + `persist` pattern
4. Navigation shell (`app/_layout.tsx`, tab bar structure)
5. Shared UI primitives — Button, Card, TextInput, StatCard (needed by every screen)

**Why first:** Every other component needs the theme tokens and storage pattern before it can be written. Getting this right early prevents global rework.

### Phase 2: Onboarding + Profile (depends on: Phase 1)

1. `profileStore` — hustle type, name, onboarded flag
2. Onboarding screens — hustle-select, profile-setup
3. `useOnboarded()` gate in root layout
4. Profile screen (read-only display of level, badges, stats)

**Why second:** The onboarding gate must work before any other screen is reachable in a real-device flow. Profile data (hustle type) drives per-hustle context throughout the app.

### Phase 3: Core Business Data (depends on: Phase 1, Phase 2)

1. `clientsStore` — CRUD operations, AsyncStorage persistence
2. Client list + detail + new client screens
3. `jobsStore` — CRUD operations, status transitions, recurring job generation
4. Job list + detail + new job screens (including recurring pattern UI)

**Why third:** Jobs and clients are the primary data. Earnings, gamification, and dashboard all depend on this data existing.

### Phase 4: Gamification Engine (depends on: Phase 1, Phase 3)

1. `lib/gamification/rules.ts` — XP event table, badge unlock conditions
2. `lib/gamification/engine.ts` — processEvent, level calculation, badge detection
3. `gamificationStore` — XP, level, HustleBucks, badges, persisted state
4. Wire XP events into jobsStore, clientsStore actions
5. XP bar, level badge, HustleBucks display components

**Why fourth:** The gamification engine is a pure function of events — it has no UI of its own. But it needs the business data stores to exist so it can subscribe to their actions.

### Phase 5: Earnings + Dashboard (depends on: Phase 1-4)

1. `paymentsStore` — log payment, link to job/client, persist
2. Payment logging UI (triggered from job detail)
3. Earnings dashboard screen — totals, Victory Native charts
4. Home dashboard — upcoming jobs, XP bar, quick stats, quick actions

**Why fifth:** Dashboard is a composition of all prior data. Build last so all data sources exist.

### Phase 6: Tools (depends on: Phase 1-2 only, mostly independent)

1. Pricing calculator (pure math, no store dependency)
2. Business name generator (static suggestions per hustle type)
3. Business ideas engine (static data per hustle type)
4. Flyer generator (react-native-view-shot + expo-sharing)
5. Business card generator (same pattern as flyer)

**Why last:** Tools are the most isolated features. They depend on profile (hustle type) and theme but nothing else. Flyer/card generators can be built any time after Phase 2.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Cross-Feature Store Imports

**What goes wrong:** Feature A imports and reads Feature B's Zustand store directly (e.g., `jobsScreen` reads from `clientsStore`).

**Why bad:** Creates hidden coupling. Refactoring one store breaks the other with no TypeScript warning at the module boundary.

**Instead:** Derive shared data in `lib/utils/` hooks, or pass IDs as props and resolve in the leaf component. If two features truly share state, that state belongs in a shared store in `lib/`, not in either feature.

### Anti-Pattern 2: Fat Route Files

**What goes wrong:** Business logic, state reads, and API calls live inside `app/jobs/new.tsx` instead of `features/jobs/new-job-screen.tsx`.

**Why bad:** Expo Router route files become hard to test, hard to reuse, and impossible to navigate with standard tooling. Mixing routing concerns with business logic is the #1 cause of spaghetti in Expo Router apps.

**Instead:** Route files contain exactly one line: `export { default } from '@/features/jobs/new-job-screen'`.

### Anti-Pattern 3: Inline Hex Colors

**What goes wrong:** A component has `color: '#00E676'` directly in a StyleSheet.

**Why bad:** Dark-mode-first design requires all color decisions to flow through the theme system. Inline hex values make future theme changes require grep-and-replace across hundreds of files.

**Instead:** Always use `colors.accent.earnings`, `colors.text.primary`, etc. from `lib/theme/colors.ts`.

### Anti-Pattern 4: Awarding XP from UI Components

**What goes wrong:** A button's `onPress` calls `gamificationStore.addXP(50)` directly.

**Why bad:** This bypasses the gamification engine's duplicate-prevention logic (`awardedEvents` guard), badge unlock evaluation, and level threshold checking. Users can earn infinite XP by pressing buttons.

**Instead:** UI actions dispatch semantic events (`JOB_COMPLETED`, `CLIENT_ADDED`) to the engine. The engine handles all award calculations and guards.

### Anti-Pattern 5: Storing Large Blobs in AsyncStorage

**What goes wrong:** Generated flyer image data (base64 PNG) is persisted to AsyncStorage.

**Why bad:** AsyncStorage has a ~6MB total limit on iOS. A single high-res flyer can consume the entire budget and corrupt other stored data.

**Instead:** Generated images are transient — capture to a temp URI, save to the device Camera Roll via `expo-media-library`, and discard the buffer. Never persist image data to AsyncStorage.

---

## Scalability Considerations

| Concern | At V1 Launch | At 500 Jobs | At 5,000 Jobs |
|---------|--------------|-------------|---------------|
| AsyncStorage read perf | Instant (small JSON) | Acceptable (~100KB) | Degraded — consider SQLite migration |
| Job queries | Full array filter in JS | Acceptable | Need indexed SQLite |
| Chart data aggregation | Compute on render | Acceptable | Pre-aggregate in store |
| Gamification state | Tiny (~2KB) | Tiny | Tiny (never grows large) |
| Storage limit risk | Low | Low | Medium (monitor total size) |

AsyncStorage is appropriate for V1. If the user reaches ~500 jobs (a very active teen), the app will still feel responsive. The 5,000+ job scenario would require a SQLite migration, but that is a V2 concern.

---

## Sources

- Expo Local-First Architecture Guide: https://docs.expo.dev/guides/local-first/
- Expo App Folder Structure Best Practices: https://expo.dev/blog/expo-app-folder-structure-best-practices
- Obytes React Native Starter Project Structure: https://starter.obytes.com/getting-started/project-structure/
- Zustand React Native Implementation Guide 2025: https://reactnativeexample.com/zustand-react-native-implementation-guide-2025/
- React Native Global State Management 2025: https://reactnativeexample.com/react-native-global-state-management-complete-guide-2025/
- Building Gamified Mobile Experiences with React Native 2025: https://medium.com/@TheblogStacker/building-gamified-mobile-experiences-with-react-native-in-2025-a1f5371685f4
- Gamification in React Native: https://commt.co/blog/gamification-in-react-native
- react-native-view-shot Expo Docs: https://docs.expo.dev/versions/latest/sdk/captureRef/
- Victory Native Charting: https://nearform.com/open-source/victory-native/
- How Production Apps Handle Dark Mode in React Native: https://silverskytechnology.com/how-production-apps-handle-dark-mode-in-react-native/
- AsyncStorage Data Structure Best Practices: https://github.com/react-native-community/async-storage/issues/320
