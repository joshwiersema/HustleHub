# Phase 1: Foundation - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

A working app shell with the correct dark theme (no launch flash), shard-first storage, 5-tab Expo Router navigation, and shared UI primitives. Every future feature can be built on top without rework. This phase delivers DSGN-01 through DSGN-05.

</domain>

<decisions>
## Implementation Decisions

### Storage Architecture
- Use Zustand v5 with AsyncStorage persist middleware for state management
- AsyncStorage is sufficient for v1 — data volume is <100 records per domain (clients, jobs, payments)
- Key namespacing: `@hustlehub/[domain]` pattern for AsyncStorage keys
- Separate Zustand stores per domain: profile, clients, jobs, payments, gamification
- Do NOT use expo-sqlite or Drizzle in v1 — added complexity without v1 benefit. Defer to v2 if data grows
- MMKV considered but requires dev build (no Expo Go) — defer unless perf issues arise

### Styling Approach
- Use React Native StyleSheet API (not NativeWind)
- Existing codebase already uses StyleSheet — keep consistent, avoid migration cost
- Centralized theme constants in `src/constants/theme.ts`
- Dark mode colors applied via theme imports, not Tailwind classes
- app.json `userInterfaceStyle: "dark"` and `backgroundColor: "#0A0A0F"` to prevent white flash

### Navigation Shell
- Expo Router v7 (file-based routing) with `app/` directory
- 5-tab bottom navigation: Home, Jobs, Clients, Earnings, Profile
- Tab bar: dark background (#141419), green active tint (#00E676), muted inactive (#5A5A66), icons only
- Stack screens for non-tab routes (onboarding, toolkit, job detail, etc.)
- Onboarding gate: root layout checks AsyncStorage flag, redirects accordingly

### UI Primitive Set
- Build these shared components in Phase 1: Card, GradientButton, XPBar, StatCard, HustleBucksDisplay, BadgeIcon, EmptyState, ScreenHeader
- All components consume theme from `src/constants/theme.ts`
- Minimum 44x44px touch targets on all pressable elements
- Use expo-linear-gradient for gradient buttons and accent bars
- Use Ionicons from @expo/vector-icons for all icons
- Each tab gets a placeholder screen showing the color system (green/purple/amber)

### State Management
- Zustand v5 for global state with typed store slices
- Each store slice persists via zustand/middleware `persist` + AsyncStorage
- Store structure: useProfileStore, useClientsStore, useJobsStore, usePaymentsStore, useGameStore
- Actions co-located with store (Zustand pattern) — no separate action files

### Claude's Discretion
- Exact animation easing curves for progress bars
- Loading spinner vs skeleton screen choice
- Precise spacing between tab bar and content area
- Error boundary implementation details

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Vision, core value, constraints, key decisions
- `.planning/REQUIREMENTS.md` — DSGN-01 through DSGN-05 define Phase 1 requirements
- `.planning/research/STACK.md` — Recommended stack with versions and rationale
- `.planning/research/ARCHITECTURE.md` — Component boundaries, data flow, folder structure
- `.planning/research/PITFALLS.md` — Dark mode white flash fix, AsyncStorage limits, Expo Router gotchas

### Design References
- Stake iOS app on Mobbin — dark fintech aesthetic, bold typography, card layouts
- "Robinhood meets Duolingo" — clean data presentation with gamified progression

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/constants/theme.ts` — Full color system, spacing, border radius, font sizes, shadows already defined
- `src/types/index.ts` — All TypeScript types, hustle type definitions, levels, badges, payment methods
- `src/store/storage.ts` — AsyncStorage CRUD helpers (will be replaced by Zustand stores but patterns are useful)
- `src/components/` — 8 components exist from first pass (Card, GradientButton, XPBar, etc.) — rebuild with Zustand integration

### Established Patterns
- TypeScript strict mode enabled
- expo-linear-gradient for gradient effects
- Ionicons for iconography
- Card-based layouts with `#141419` background, `#2A2A35` borders, 12px border radius

### Integration Points
- `app.json` — needs `userInterfaceStyle: "dark"`, scheme, splash backgroundColor
- `app/_layout.tsx` — root layout with onboarding gate
- `app/(tabs)/_layout.tsx` — bottom tab configuration
- `package.json` — main entry is `expo-router/entry`

</code_context>

<specifics>
## Specific Ideas

- Design inspired by Stake iOS app on Mobbin — bold typography, card-based layouts, strong data hierarchy, clean dark fintech aesthetic made youthful and energetic
- Heavy use of gradients, bold accent colors (greens #00E676, purples #B388FF), large numbers, satisfying progress bars
- Every screen should feel like it's part of a game, not a boring business app
- Reference design-inspiration skill images: Linear dashboards (dark, clean), Stripe (bold typography), Vercel (card-based), Shopify onboarding (split layout)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-24*
