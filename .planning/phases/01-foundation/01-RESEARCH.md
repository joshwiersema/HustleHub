# Phase 1: Foundation - Research

**Researched:** 2026-03-24
**Domain:** React Native Expo dark-themed app shell, navigation, state persistence, UI primitives
**Confidence:** HIGH

## Summary

Phase 1 delivers the foundational app shell that every future feature builds upon: dark theme with no launch flash, 5-tab bottom navigation via Expo Router v7, Zustand v5 stores persisted via AsyncStorage, and 8 shared UI primitive components. The existing codebase already has significant code from a first pass -- a full theme system (`src/constants/theme.ts`), all TypeScript types (`src/types/index.ts`), 8 UI components, complete tab screens with business logic, onboarding screens, and an AsyncStorage CRUD layer. The primary task is NOT building from scratch but refactoring the existing code to use Zustand stores (replacing direct AsyncStorage calls), fixing the root layout to use the modern `Stack.Protected` pattern (replacing the current conditional rendering approach), ensuring the `app.json` dark mode config is correct (it already is), and validating that all shared components meet quality standards.

The CONTEXT.md locked decision to use Zustand v5 + AsyncStorage persist (NOT expo-sqlite, NOT MMKV) simplifies Phase 1 significantly. The existing `@react-native-async-storage/async-storage` v3.0.1 is already installed. Zustand v5.0.12 needs to be added. The existing `src/store/storage.ts` direct AsyncStorage CRUD helpers will be replaced by Zustand stores with persist middleware.

**Primary recommendation:** Install Zustand, create 5 domain stores with AsyncStorage persist middleware, refactor the root layout to use `Stack.Protected` guard pattern, validate existing components and theme against DSGN requirements, and deliver placeholder tab screens that prove the color system works end-to-end.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Use Zustand v5 with AsyncStorage persist middleware for state management
- AsyncStorage is sufficient for v1 -- data volume is <100 records per domain (clients, jobs, payments)
- Key namespacing: `@hustlehub/[domain]` pattern for AsyncStorage keys
- Separate Zustand stores per domain: profile, clients, jobs, payments, gamification
- Do NOT use expo-sqlite or Drizzle in v1 -- added complexity without v1 benefit. Defer to v2 if data grows
- MMKV considered but requires dev build (no Expo Go) -- defer unless perf issues arise
- Use React Native StyleSheet API (not NativeWind)
- Existing codebase already uses StyleSheet -- keep consistent, avoid migration cost
- Centralized theme constants in `src/constants/theme.ts`
- Dark mode colors applied via theme imports, not Tailwind classes
- app.json `userInterfaceStyle: "dark"` and `backgroundColor: "#0A0A0F"` to prevent white flash
- Expo Router v7 (file-based routing) with `app/` directory
- 5-tab bottom navigation: Home, Jobs, Clients, Earnings, Profile
- Tab bar: dark background (#141419), green active tint (#00E676), muted inactive (#5A5A66), icons only
- Stack screens for non-tab routes (onboarding, toolkit, job detail, etc.)
- Onboarding gate: root layout checks AsyncStorage flag, redirects accordingly
- Build these shared components in Phase 1: Card, GradientButton, XPBar, StatCard, HustleBucksDisplay, BadgeIcon, EmptyState, ScreenHeader
- All components consume theme from `src/constants/theme.ts`
- Minimum 44x44px touch targets on all pressable elements
- Use expo-linear-gradient for gradient buttons and accent bars
- Use Ionicons from @expo/vector-icons for all icons
- Each tab gets a placeholder screen showing the color system (green/purple/amber)
- Zustand v5 for global state with typed store slices
- Each store slice persists via zustand/middleware `persist` + AsyncStorage
- Store structure: useProfileStore, useClientsStore, useJobsStore, usePaymentsStore, useGameStore
- Actions co-located with store (Zustand pattern) -- no separate action files

### Claude's Discretion
- Exact animation easing curves for progress bars
- Loading spinner vs skeleton screen choice
- Precise spacing between tab bar and content area
- Error boundary implementation details

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| DSGN-01 | App uses dark mode first with iOS native feel | app.json already configured with `userInterfaceStyle: "dark"`, `backgroundColor: "#0A0A0F"`, splash backgroundColor matching. Theme system in `src/constants/theme.ts` provides full dark palette. Install `expo-system-ui` for Android compatibility. |
| DSGN-02 | App uses consistent color system (green for money, purple for XP, amber for HustleBucks) | `src/constants/theme.ts` already defines: primary=#00E676 (green/money), secondary=#B388FF (purple/XP), amber=#FFD740 (HustleBucks). Gradients, background tints, and border variants all exist. Placeholder screens should visually demonstrate all three color tracks. |
| DSGN-03 | All touch targets are minimum 44x44px | Existing components partially comply (GradientButton sm=36px height is below minimum). Audit all Pressable/TouchableOpacity elements. Tab bar icons, buttons, cards, and form controls must all meet 44x44px minimum. |
| DSGN-04 | App has 5-tab bottom navigation (Home, Jobs, Clients, Earnings, Profile) | Tab layout exists at `app/(tabs)/_layout.tsx` with correct 5 tabs, Ionicons, dark styling. Needs validation against locked tab bar colors (#141419 bg, #00E676 active, #5A5A66 inactive). |
| DSGN-05 | All data persists locally across app sessions | Zustand v5 persist middleware with AsyncStorage `createJSONStorage`. 5 separate stores each with their own AsyncStorage key (`@hustlehub/profile`, `@hustlehub/clients`, etc.). Replaces existing direct AsyncStorage CRUD in `src/store/storage.ts`. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| expo | ~55.0.8 | Managed workflow platform | Installed |
| react-native | 0.83.2 | Mobile runtime (New Architecture) | Installed |
| react | 19.2.0 | UI layer | Installed |
| typescript | ~5.9.2 | Type safety | Installed |
| expo-router | ^55.0.7 | File-based navigation (v7) | Installed |
| @react-native-async-storage/async-storage | ^3.0.1 | Persistence backend | Installed |
| expo-linear-gradient | ^55.0.9 | Gradient effects | Installed |
| @expo/vector-icons | ^15.1.1 | Ionicons | Installed |
| react-native-safe-area-context | ^5.7.0 | Safe area insets | Installed |
| react-native-reanimated | ^4.2.3 | Animations (XP bar, transitions) | Installed |
| react-native-gesture-handler | ^2.30.0 | Gesture support | Installed |
| react-native-screens | ^4.24.0 | Native screen containers | Installed |
| expo-status-bar | ~55.0.4 | Status bar control | Installed |

### To Install for Phase 1
| Library | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| zustand | ^5.0.12 | Global state management with persist | `npm install zustand` |
| expo-system-ui | ~55.x | Android dark mode support | `npx expo install expo-system-ui` |
| expo-haptics | ~55.x | Tactile feedback on button presses | `npx expo install expo-haptics` |

### Alternatives Considered (LOCKED -- do not use)
| Instead of | Could Use | Why Not (per CONTEXT.md) |
|------------|-----------|--------------------------|
| AsyncStorage | expo-sqlite + Drizzle | Added complexity without v1 benefit; deferred to v2 |
| AsyncStorage | react-native-mmkv | Requires dev build (no Expo Go); deferred unless perf issues |
| StyleSheet API | NativeWind | Existing codebase uses StyleSheet; avoid migration cost |

**Installation:**
```bash
npm install zustand
npx expo install expo-system-ui expo-haptics
```

**Version verification (confirmed 2026-03-24):**
- zustand: 5.0.12 (current on npm)
- @react-native-async-storage/async-storage: 3.0.1 (current, already in package.json)
- expo-router: 55.0.7 (SDK 55 aligned)

## Architecture Patterns

### Existing Project Structure (What Exists)
```
app/
  _layout.tsx              # Root layout with onboarding gate (needs refactor)
  index.tsx                # Redirect based on onboarding state (needs refactor)
  (tabs)/
    _layout.tsx            # 5-tab bottom nav (good, needs minor fixes)
    index.tsx              # Home dashboard (fully built, fat route file)
    jobs.tsx               # Jobs screen with full CRUD modal (fully built)
    clients.tsx            # Clients screen with full CRUD (fully built)
    earnings.tsx           # Earnings with charts (fully built)
    profile.tsx            # Profile with badges, stats (fully built)
  onboarding/
    _layout.tsx            # Stack layout for onboarding
    index.tsx              # Welcome screen (fully built)
    pick-hustle.tsx        # Hustle type selection
    setup-business.tsx     # Business profile setup
  job-detail.tsx           # Job detail screen
  toolkit.tsx              # Toolkit screen
  flyer-generator.tsx      # Flyer generator
  business-card.tsx        # Business card generator
  name-generator.tsx       # Name generator
  pricing-calculator.tsx   # Pricing calculator
  ideas.tsx                # Business ideas
src/
  constants/
    theme.ts               # Full color system, spacing, typography (KEEP AS-IS)
  types/
    index.ts               # All TypeScript types, hustle types, levels, badges (KEEP AS-IS)
  components/
    Card.tsx               # Dark card with press state (KEEP, minor fixes)
    GradientButton.tsx     # Gradient button with sizes (KEEP, fix sm height)
    XPBar.tsx              # Animated XP progress bar (KEEP, uses RN Animated)
    StatCard.tsx           # Stat display card (KEEP)
    HustleBucksDisplay.tsx # Amber coin display (KEEP)
    BadgeIcon.tsx          # Badge circle with lock state (KEEP)
    EmptyState.tsx         # Empty state with CTA (KEEP)
    ScreenHeader.tsx       # Screen title/subtitle (KEEP)
    index.ts               # Barrel exports (KEEP)
  store/
    storage.ts             # Direct AsyncStorage CRUD (REPLACE with Zustand stores)
  utils/                   # Empty directory
```

### Target Structure for Phase 1 Completion
```
app/
  _layout.tsx              # Root layout using Stack.Protected guard pattern
  index.tsx                # Simple redirect (may not be needed with Protected)
  (tabs)/
    _layout.tsx            # 5-tab bottom nav (validated against DSGN-04)
    index.tsx              # Placeholder home screen showing color system
    jobs.tsx               # Placeholder jobs screen
    clients.tsx            # Placeholder clients screen
    earnings.tsx           # Placeholder earnings screen
    profile.tsx            # Placeholder profile screen
  onboarding/
    _layout.tsx            # Stack layout for onboarding
    index.tsx              # Welcome screen (keep existing)
    pick-hustle.tsx        # Hustle type selection (keep existing)
    setup-business.tsx     # Business profile setup (keep existing)
src/
  constants/
    theme.ts               # UNCHANGED from current
  types/
    index.ts               # UNCHANGED from current
  components/
    Card.tsx               # Validated: 44px touch targets
    GradientButton.tsx     # Fixed: sm size >= 44px height
    XPBar.tsx              # Validated: works with Zustand data
    StatCard.tsx           # Validated
    HustleBucksDisplay.tsx # Validated
    BadgeIcon.tsx          # Validated
    EmptyState.tsx         # Validated
    ScreenHeader.tsx       # Validated
    index.ts               # Barrel exports
  store/
    index.ts               # Barrel exports for all stores
    profileStore.ts        # useProfileStore (Zustand + persist)
    clientsStore.ts        # useClientsStore (Zustand + persist)
    jobsStore.ts           # useJobsStore (Zustand + persist)
    paymentsStore.ts       # usePaymentsStore (Zustand + persist)
    gameStore.ts           # useGameStore (Zustand + persist)
    storage.ts             # DEPRECATED or removed
```

### Pattern 1: Zustand Store with AsyncStorage Persist
**What:** Each domain gets a typed Zustand store that auto-persists to AsyncStorage via the `persist` middleware.
**When to use:** Every store in this app.
**Example:**
```typescript
// Source: Zustand official docs + verified via web search
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';

interface ProfileState {
  profile: UserProfile | null;
  isOnboarded: boolean;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  markOnboarded: () => void;
  reset: () => void;
}

export const useProfileStore = create<ProfileState>()(
  persist(
    (set, get) => ({
      profile: null,
      isOnboarded: false,

      setProfile: (profile) => set({ profile, isOnboarded: true }),
      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null,
        })),
      markOnboarded: () => set({ isOnboarded: true }),
      reset: () => set({ profile: null, isOnboarded: false }),
    }),
    {
      name: '@hustlehub/profile',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Pattern 2: Root Layout with Stack.Protected Guard (Expo Router v7 / SDK 55)
**What:** The modern Expo Router approach to onboarding gating. Replaces conditional rendering with declarative `Stack.Protected` guard.
**When to use:** Root layout for gating onboarding vs main app.
**Example:**
```typescript
// Source: https://docs.expo.dev/router/basics/common-navigation-patterns/
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/theme';
import { useProfileStore } from '../src/store/profileStore';

export default function RootLayout() {
  const isOnboarded = useProfileStore((s) => s.isOnboarded);

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Protected guard={isOnboarded}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>

        <Stack.Protected guard={!isOnboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
    </>
  );
}
```

### Pattern 3: Placeholder Tab Screen (Phase 1 Deliverable)
**What:** Each tab gets a placeholder screen that demonstrates the color system and confirms the navigation shell works. These will be replaced in later phases.
**When to use:** All 5 tabs in Phase 1.
**Example:**
```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing, FontSize, FontWeight } from '../../src/constants/theme';
import { ScreenHeader, Card, StatCard, EmptyState } from '../../src/components';

export default function JobsPlaceholder() {
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="My Jobs" subtitle="0 upcoming" />
      <View style={styles.content}>
        <View style={styles.statsRow}>
          <StatCard label="Upcoming" value="0" icon="calendar-outline" color={Colors.primary} />
          <StatCard label="Completed" value="0" icon="checkmark-done-outline" color={Colors.secondary} />
        </View>
        <EmptyState
          icon="briefcase-outline"
          title="No jobs yet"
          subtitle="Your jobs will appear here"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { flex: 1, paddingHorizontal: Spacing.lg },
  statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
});
```

### Anti-Patterns to Avoid
- **Fat route files:** The existing `app/(tabs)/*.tsx` files contain full business logic (CRUD, modals, charts). Phase 1 replaces these with thin placeholder screens. Full feature screens return in later phases when they integrate with Zustand stores.
- **Direct AsyncStorage calls from UI:** The existing `src/store/storage.ts` has raw AsyncStorage.getItem/setItem called from screens. Phase 1 replaces ALL direct AsyncStorage access with Zustand store reads. Components read from stores, stores persist automatically via middleware.
- **Inline hex colors:** A few existing components use inline hex strings (e.g., `'#141419'` in tab layout). These should reference `Colors.bgCard` from the theme system.
- **Conditional Stack.Screen rendering:** The current `_layout.tsx` conditionally renders `<Stack.Screen>` elements based on onboarding state, which is fragile. Use `Stack.Protected` guard instead.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| State persistence | Manual AsyncStorage read/write per store | Zustand `persist` middleware + `createJSONStorage` | Handles serialization, hydration, error recovery automatically |
| Onboarding gate | Manual conditional rendering in root layout | `Stack.Protected` guard prop | Expo Router handles navigation state, deep links, and edge cases |
| Theme consistency | Passing colors as props through component trees | Direct imports from `src/constants/theme.ts` | StyleSheet API + direct imports is the locked approach. No theme provider needed since it is dark-only. |
| Touch target compliance | Manual padding on each component | Consistent `minHeight: 44` and `minWidth: 44` in component styles | Centralize in component definitions, not per-usage |
| Async hydration loading | Custom loading state per screen | Zustand persist `onRehydrateStorage` callback or `hasHydrated` check | Zustand provides built-in hydration lifecycle |

**Key insight:** The existing codebase already has the hardest parts solved (theme, types, component designs). The Phase 1 refactor is about replacing the imperative storage layer with declarative Zustand stores and cleaning up the navigation pattern.

## Common Pitfalls

### Pitfall 1: Zustand Hydration Flash
**What goes wrong:** On first render, Zustand persist stores return their default values (e.g., `isOnboarded: false`) before AsyncStorage has been read. This causes a brief flash where onboarding is shown even for returning users before the store hydrates.
**Why it happens:** AsyncStorage is async. Zustand persist middleware starts with initial state, then asynchronously reads from storage and merges.
**How to avoid:** Use Zustand's built-in hydration detection. Add a `_hasHydrated` field to stores, set it in `onRehydrateStorage`, and show a loading screen in the root layout until hydration completes. The existing root layout already has a loading spinner pattern that can be adapted.
**Warning signs:** Returning users briefly see the onboarding screen before being redirected to tabs.

### Pitfall 2: Dark Mode White Flash on Launch
**What goes wrong:** Brief white flash between splash screen dismissal and React root mount.
**Why it happens:** Native container defaults to white if `backgroundColor` is not set in app.json.
**How to avoid:** Already mitigated. The existing `app.json` has `backgroundColor: "#0A0A0F"` in splash config and `userInterfaceStyle: "dark"`. Verify by also adding `expo-system-ui` for Android support. Test on physical device with screen recording.
**Warning signs:** Any non-dark frame during cold launch.

### Pitfall 3: AsyncStorage Shard-First Design Violation
**What goes wrong:** Storing all app state in a single AsyncStorage key causes the 4-6MB CursorWindow crash on Android.
**Why it happens:** Using a single Zustand store with one persist key, or forgetting to separate stores.
**How to avoid:** Already mitigated by the locked decision: 5 separate stores, each with its own persist key (`@hustlehub/profile`, `@hustlehub/clients`, etc.). Each domain's data stays well under 1MB individually. Enforce this by never creating a "root store" that combines all state.
**Warning signs:** Any AsyncStorage key containing data from multiple domains.

### Pitfall 4: GradientButton sm Size Below 44px Touch Target
**What goes wrong:** The existing `GradientButton` component has `sm: { height: 36 }` which violates the DSGN-03 requirement of minimum 44x44px touch targets.
**Why it happens:** Design-time decision that did not account for accessibility requirements.
**How to avoid:** Update the `sizeConfig` in GradientButton.tsx to set `sm.height` to at least 44. Audit all Pressable elements across all components for minimum dimensions.
**Warning signs:** Any touch target with height or width below 44.

### Pitfall 5: Onboarding Back-Navigation Leak
**What goes wrong:** After completing onboarding, swiping back on iOS returns to onboarding screens.
**Why it happens:** `router.push()` stacks screens in history; completing onboarding does not clear the stack.
**How to avoid:** The `Stack.Protected` guard pattern handles this automatically -- when `isOnboarded` changes to true, the onboarding routes become inaccessible and the router navigates to tabs. The user cannot navigate back to onboarding. If using the older `Redirect` pattern, use `router.replace()` instead of `router.push()` on onboarding completion.
**Warning signs:** Back gesture from home screen shows onboarding screens.

### Pitfall 6: Tab Bar Inline Color Values
**What goes wrong:** The existing `app/(tabs)/_layout.tsx` has `backgroundColor: '#141419'` hardcoded in the tab bar style instead of using `Colors.bgCard`.
**Why it happens:** First-pass code used literal hex values.
**How to avoid:** Replace all inline hex values with theme constant references. The values happen to match in this case (`Colors.bgCard` is `'#141419'`), but using the constant ensures future theme changes propagate correctly.
**Warning signs:** Any hex string literal in a StyleSheet that matches a theme constant.

## Code Examples

### Zustand Store with Typed Actions (Clients Store)
```typescript
// src/store/clientsStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client } from '../types';

interface ClientsState {
  clients: Client[];
  addClient: (client: Client) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  getClient: (id: string) => Client | undefined;
  reset: () => void;
}

export const useClientsStore = create<ClientsState>()(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (client) =>
        set((state) => ({ clients: [...state.clients, client] })),

      updateClient: (id, updates) =>
        set((state) => ({
          clients: state.clients.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteClient: (id) =>
        set((state) => ({
          clients: state.clients.filter((c) => c.id !== id),
        })),

      getClient: (id) => get().clients.find((c) => c.id === id),

      reset: () => set({ clients: [] }),
    }),
    {
      name: '@hustlehub/clients',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
```

### Hydration-Aware Root Layout
```typescript
// app/_layout.tsx
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../src/constants/theme';
import { useProfileStore } from '../src/store/profileStore';

export default function RootLayout() {
  const isOnboarded = useProfileStore((s) => s.isOnboarded);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist hydration check
    const unsub = useProfileStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (e.g., synchronous storage)
    if (useProfileStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return unsub;
  }, []);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Protected guard={isOnboarded}>
          <Stack.Screen name="(tabs)" />
        </Stack.Protected>
        <Stack.Protected guard={!isOnboarded}>
          <Stack.Screen name="onboarding" />
        </Stack.Protected>
      </Stack>
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

### Onboarding Completion (Writing to Zustand Store)
```typescript
// In onboarding setup-business screen, on complete:
import { useProfileStore } from '../../src/store/profileStore';
import { router } from 'expo-router';

function handleComplete(name: string, businessName: string, hustleType: HustleType) {
  const { setProfile } = useProfileStore.getState();
  setProfile({
    id: generateId(),
    name,
    businessName,
    hustleType,
    level: 1,
    xp: 0,
    hustleBucks: 0,
    totalEarnings: 0,
    streak: 0,
    joinedDate: new Date().toISOString(),
    badges: [],
    onboardingComplete: true,
  });
  // No need to navigate -- Stack.Protected guard will automatically
  // swap to (tabs) when isOnboarded becomes true
}
```

## State of the Art

| Old Approach (Current Codebase) | Current Approach (Phase 1 Target) | Impact |
|--------------------------------|-----------------------------------|--------|
| Direct AsyncStorage CRUD helpers in `src/store/storage.ts` | Zustand stores with `persist` middleware | Eliminates async loading states per screen, enables reactive UI updates, shard-first by default |
| `useFocusEffect` + `loadData()` pattern on every screen | Zustand selectors with auto-rehydration | Screens read synchronously from in-memory stores after hydration; no waterfall of async reads |
| Conditional `<Stack.Screen>` rendering in root layout | `Stack.Protected` guard prop | Official Expo Router pattern; handles deep links, back navigation, and state transitions correctly |
| `router.push()` for onboarding navigation | Store mutation triggers automatic navigation | No manual navigation after onboarding; Protected guard handles the swap |
| RN `Animated` API for XP bar | Keep RN `Animated` for now (simple use case) | Reanimated v4 is installed but RN Animated is adequate for a single progress bar animation; can migrate later if needed |

**Deprecated/outdated patterns in current code:**
- `src/store/storage.ts` -- Will be replaced entirely by Zustand stores. Functions like `getProfile()`, `saveClient()`, `addXP()` become store actions.
- Direct `AsyncStorage.getItem/setItem` calls from screen components -- Violates the persistence abstraction. All access goes through Zustand stores.
- `useFocusEffect` data loading pattern -- Unnecessary when Zustand stores are always in-memory after hydration.

## Open Questions

1. **Existing screen code disposition**
   - What we know: All 5 tab screens have full implementations with business logic, modals, forms, and charts. These are NOT placeholder screens.
   - What's unclear: Should Phase 1 keep the full implementations (fixing them to use Zustand) or replace them with true placeholders and rebuild in later phases?
   - Recommendation: Replace with thin placeholder screens that prove the shell works. The full implementations will be rebuilt properly in Phases 3-5 when their respective feature work is scoped. Keeping the fat screens risks scope creep and bugs in Phase 1. The existing code serves as a reference for later phases.

2. **app/index.tsx necessity with Stack.Protected**
   - What we know: Currently `app/index.tsx` reads onboarding state and redirects. With `Stack.Protected`, the guard handles navigation automatically.
   - What's unclear: Whether `app/index.tsx` is still needed as a file or if it can be removed when Protected handles routing.
   - Recommendation: Keep `app/index.tsx` as a simple redirect to `/(tabs)` for users who land on the root path. The Protected guard handles the onboarding gate, but index.tsx ensures the root path resolves.

3. **Zustand onFinishHydration reliability**
   - What we know: The persist middleware provides `onFinishHydration` callback and `hasHydrated()` check.
   - What's unclear: Edge cases with multiple stores hydrating at different times.
   - Recommendation: Only gate the root layout on the `profileStore` hydration (since that is what determines onboarding state). Other stores can hydrate in the background; screens that depend on them should show their own loading states if data has not arrived yet.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None detected -- no test runner configured |
| Config file | None |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| DSGN-01 | Dark mode first, no white flash | manual-only | Physical device cold launch recording | N/A -- requires device |
| DSGN-02 | Consistent color system | manual-only | Visual inspection of placeholder screens | N/A -- visual |
| DSGN-03 | 44x44px touch targets | unit | Static analysis of component styles | No framework |
| DSGN-04 | 5-tab bottom navigation | smoke | Launch app, verify all 5 tabs render | N/A -- requires device |
| DSGN-05 | Data persists across sessions | smoke | Write to store, kill app, relaunch, verify data | N/A -- requires device |

### Sampling Rate
- **Per task commit:** Visual verification in Expo Go
- **Per wave merge:** Full manual walkthrough of all 5 tabs + onboarding flow
- **Phase gate:** Cold launch on physical device, verify no white flash, verify all tabs, verify persist

### Wave 0 Gaps
- [ ] No test framework installed -- this is acceptable for Phase 1 since all DSGN requirements are visual/manual verification. Test framework can be added in a later phase when unit-testable business logic (gamification engine, CRUD operations) is implemented.
- [ ] Consider adding `jest` + `@testing-library/react-native` in Phase 3 when business logic arrives.

## Sources

### Primary (HIGH confidence)
- Existing codebase analysis -- `app.json`, `package.json`, `src/constants/theme.ts`, `src/types/index.ts`, all component files, all route files (read directly)
- Zustand v5 npm registry: version 5.0.12 confirmed current (verified 2026-03-24)
- AsyncStorage v3.0.1 npm registry: confirmed current (verified 2026-03-24)
- Expo Router Protected routes: https://docs.expo.dev/router/basics/common-navigation-patterns/ (Stack.Protected guard pattern confirmed for SDK 55)
- Expo color themes: https://docs.expo.dev/develop/user-interface/color-themes/ (expo-system-ui requirement for Android confirmed)
- Expo Router auth/onboarding: https://docs.expo.dev/router/advanced/authentication-rewrites/ (Redirect pattern for SDK 52 and earlier)

### Secondary (MEDIUM confidence)
- Zustand persist middleware reference: https://zustand.docs.pmnd.rs/reference/middlewares/persist (createJSONStorage, AsyncStorage adapter pattern)
- Zustand React Native guide 2025: https://reactnativeexample.com/zustand-react-native-implementation-guide-2025/
- Zustand + AsyncStorage discussions: https://github.com/pmndrs/zustand/issues/394, https://github.com/pmndrs/zustand/discussions/2196

### Tertiary (LOW confidence)
- None -- all findings verified against primary or secondary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages verified against npm registry, existing codebase confirms SDK 55 compatibility
- Architecture: HIGH -- patterns verified against Zustand official docs and Expo Router official docs; existing code provides concrete refactoring targets
- Pitfalls: HIGH -- most pitfalls already observed in the existing codebase (AsyncStorage shard pattern, white flash prevention) or documented in project research (PITFALLS.md)

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (30 days -- stable ecosystem, no expected breaking changes)
