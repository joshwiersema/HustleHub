# Project Research Summary

**Project:** HustleHub — Gamified Teen Business Management iOS App
**Domain:** Mobile field service management + gamification (local-first, iOS)
**Researched:** 2026-03-24
**Confidence:** HIGH

## Executive Summary

HustleHub is a local-first iOS app that fuses two well-understood domains — field service management (Jobber/Housecall Pro patterns) and gamification (Duolingo mechanics) — into a product aimed at teens running neighborhood service businesses. The recommended approach is to build on Expo SDK 55 (managed workflow) with Expo Router v7 for navigation, Zustand v5 for state, expo-sqlite + Drizzle ORM for structured data, and MMKV for fast key-value persistence. The stack is fully validated against current official sources and mandates React Native New Architecture — all library choices must be New Architecture compatible or they will not run. The dark-first UI (NativeWind v4 + custom color palette) and animation-first game feel (Reanimated v4, Lottie, react-native-fast-confetti, expo-haptics) are non-negotiable for the teen demographic.

The feature set follows a clear dependency chain: onboarding gates everything else; clients must exist before jobs; jobs must exist before payments; payments must exist before the earnings dashboard. The gamification layer (XP, levels, badges, HustleBucks) sits orthogonally across all of these and should be built as an event-driven engine in a shared `lib/gamification/` module that every feature store dispatches to — never mutated directly from UI. Marketing tools (flyer generator, business card, pricing calculator) and discovery features (business ideas engine, name generator) are the most isolated and can be built last. Anti-features to avoid in v1 are clearly defined: no real payment processing, no backend, no social leaderboards, no Android, no invoicing, no expense tracking.

The most dangerous pitfalls cluster around two areas: data architecture and gamification balance. The AsyncStorage all-in-one key anti-pattern (and its related CursorWindow data-wipe bug) can cause total data loss for active users and must be addressed in Phase 1 with a shard-first repository layer. The gamification XP inflation problem — where rewards are set arbitrarily during development without modeling the full 10-level arc — kills the primary retention hook within the first week and is expensive to fix post-launch. Both risks have clear preventions documented in research and must be explicitly addressed before any feature work begins.

---

## Key Findings

### Recommended Stack

Expo SDK 55 mandates the New Architecture (no opt-out), which sets hard version floors for all dependencies: Reanimated v4, MMKV v4, FlashList v2. The managed workflow eliminates native code maintenance — EAS Build handles TestFlight delivery without Xcode. Expo Router v7 (file-based, typed routes, automatic deep linking) is the correct navigation choice; standalone React Navigation adds zero benefit in managed Expo. The storage architecture is two-tier: expo-sqlite + Drizzle ORM for all relational business data (jobs, clients, payments), and MMKV as the Zustand persist storage adapter for fast synchronous reads of game state at app launch. AsyncStorage is explicitly NOT recommended despite being mentioned in PROJECT.md — the community has moved on, and MMKV + expo-sqlite has no meaningful added complexity.

**Core technologies:**
- Expo SDK 55 + React Native 0.83 + React 19.2: platform, New Architecture mandatory, managed workflow
- Expo Router v7: file-based navigation, typed routes, automatic deep linking — no standalone React Navigation
- Zustand v5: global game/business state, domain-scoped stores, MMKV persist adapter, 2KB bundle
- expo-sqlite + Drizzle ORM 0.40.x: typed schema, migrations, `useLiveQuery` for live dashboard numbers
- react-native-mmkv v4: synchronous key-value store, Zustand persist adapter, 30x faster than AsyncStorage
- Reanimated v4: UI-thread animations for XP bar, level-up transitions, 120fps capable
- Lottie v7 + react-native-fast-confetti: badge unlock celebrations, level-up confetti (Skia-based)
- NativeWind v4: Tailwind utility classes in React Native, dark-first with `dark:` prefix support
- React Hook Form v7 + Zod v3: zero-rerender forms, shared schema types via drizzle-zod
- react-native-gifted-charts v1.4.x: bar/line/donut charts for earnings dashboard, SVG-based (no Skia dep)
- expo-haptics: tactile feedback for game events — essential for "game feel" at zero native code cost
- @shopify/flash-list v2: FlatList replacement, New Architecture v2, 10x better performance on long lists

### Expected Features

**Must have (table stakes):**
- Onboarding: hustle type selection (6 types, visual cards) + business name (2 steps max, no more)
- Business profile: name, owner, hustle type — establishes identity and drives per-hustle context
- Client contact management: add, view, edit, delete with search
- Job scheduling: date, time, price, client link — the primary daily loop
- Recurring jobs: weekly/biweekly/monthly — lawn care and dog walking are inherently recurring
- Payment logging: cash, Venmo, Zelle, PayPal — record-only, no processing
- Earnings dashboard: totals with bar/line charts — proof of progress
- Home dashboard: upcoming jobs, XP bar, quick stats — most-used screen
- XP system + level progression (10 levels, named Rookie → CEO)
- Visual XP bar on home screen — must be prominent every session
- Badges/achievements (10 for v1) — with unlock animation
- HustleBucks currency display — parallel reward signal, cosmetic-only

**Should have (competitive differentiators):**
- Business name generator — reduces onboarding friction, rule-based per hustle type
- Flyer generator with hustle-specific templates — teens need marketing tools, no design skills required
- Business card generator — professional artifact, auto-populated from profile
- Pricing calculator with earnings projections — "3 lawns/week at $40 = $480/month" is genuinely novel for teens
- Business ideas engine — discovery/pre-acquisition feature, static data per hustle type
- Profile screen with stats and badge showcase — shareable identity screen, teens want to show this off
- Activity streak tracker — 60% engagement lift (Duolingo data), tie to job logging not app opens
- Job completion celebration animations — haptic + visual burst on level-up is high-impact for teens
- Dark mode-first design with brand color palette — non-negotiable for the demographic

**Defer (v2+):**
- HustleBucks cosmetic shop (v1 shows locked items to build anticipation, no real shop)
- Weekly XP challenge / target — nice-to-have engagement mechanic
- Activity streak freeze mechanic
- Local leaderboard teaser (mock data)
- Push notifications — requires local notification infrastructure
- Parental controls / parent dashboard — second persona, dilutes teen-first focus
- Android support — iOS-first; React Native enables Android later at low migration cost

**Explicit anti-features (never build):**
- Real payment processing (Stripe/PayPal API) — regulatory nightmare for minors
- Social leaderboards with real accounts — requires backend, COPPA compliance
- AI chat coach (real LLM) — API costs, content safety for minors
- Invoicing system — teens text clients, formal invoices unused
- Expense tracking / profit/loss — adds accounting complexity teens don't need
- GPS / route optimization — adult FSM feature, teen neighborhoods are small

### Architecture Approach

HustleHub follows a feature-oriented, layered architecture with strict separation between UI (Expo Router thin route files + feature screens), state/logic (domain-scoped Zustand stores + shared gamification engine), and persistence (expo-sqlite + Drizzle for business data, MMKV for game state). The most critical structural rule: route files in `app/` contain exactly one export line redirecting to `features/`; all business logic lives in `features/*/` or `lib/`. The gamification engine in `lib/gamification/` is event-driven and stateless — features dispatch semantic XP events (`JOB_COMPLETED`, `CLIENT_ADDED`, etc.) and the engine handles XP calculation, level-up detection, badge unlocking, and duplicate-award prevention. No feature directly mutates gamification state.

**Major components:**
1. `app/` (Routing Shell) — thin file-based navigation wrappers only, one-line exports to features
2. `features/` (Feature Modules) — each owns its screen, sub-components, Zustand store slice, and types; no cross-feature imports
3. `components/` (Shared UI Primitives) — design system atoms (Button, Card, ProgressBar, BadgeTile, StatCard), purely presentational
4. `lib/gamification/` (Gamification Engine) — event-driven, stateless XP/level/badge processor; the most critical boundary to enforce
5. `lib/theme/` (Theme System) — semantic color tokens only, never raw hex in components; dark-first with three accent tracks (green/earnings, purple/XP, amber/HustleBucks)
6. `lib/storage/` (Persistence Layer) — repository abstraction over expo-sqlite + MMKV; namespaced, shard-first; UI never calls storage directly
7. `lib/utils/` + `lib/hooks/` — shared business logic (recurring date generation, earnings projections, hustle config)

### Critical Pitfalls

1. **AsyncStorage all-in-one key + CursorWindow data wipe** — Storing all data under one key causes total silent data loss when size approaches 4-6 MB (Android CursorWindow bug). Prevention: shard-first repository layer from day one with separate keys per entity type. Address in Phase 1 before any feature work. (Note: stack research recommends MMKV + expo-sqlite over AsyncStorage entirely, which sidesteps this issue.)

2. **XP inflation destroying the retention hook** — Setting XP rewards arbitrarily during development without modeling the full 10-level curve means users hit level cap in one week and the XP bar goes dead. Prevention: build a `GAMIFICATION_CONFIG` spreadsheet model (level 1→10 = 3-6 months of active use) before writing any XP constants. Address in Phase 4.

3. **Onboarding back-navigation leak** — `router.push()` stacks onboarding screens; pressing back re-triggers "first launch" XP events and corrupts profile state. Prevention: use `CommonActions.reset()` or `router.replace()` throughout onboarding; explicit `useOnboarded()` gate in root `_layout.tsx`. Address in Phase 2.

4. **Dark mode white flash on cold launch** — Native container flashes white before JS mounts if `backgroundColor` in `app.json` is not set to the dark hex. Prevention: set `backgroundColor` and `splash.backgroundColor` to `#0A0A0A` in `app.json` before writing any screens. Address in Phase 1.

5. **Badge unlock firing multiple times** — Badge animations re-trigger on re-mount or store re-read if "already awarded" state is not persisted. Prevention: store all badge unlock state with a permanent `awarded: true` flag; separate "check eligibility" from "award once"; never merge these operations. Address in Phase 4.

---

## Implications for Roadmap

Based on the dependency chain from FEATURES.md and the build order from ARCHITECTURE.md, six phases emerge naturally. The first two phases are setup/infrastructure — skipping them or rushing them causes the most expensive rework.

### Phase 1: Foundation and Infrastructure
**Rationale:** Every other phase depends on this. Theme tokens, storage layer, navigation shell, and shared UI primitives must exist before any feature screen is built. Getting storage architecture wrong here causes data loss at scale (Pitfall 1 and 6). Getting the dark mode setup wrong here means global visual rework (Pitfall 3).
**Delivers:** Working app shell with tab navigation, dark theme with no launch flash, shard-first storage layer, shared Button/Card/ProgressBar primitives, explicit `app/index.tsx` route redirect
**Addresses:** Hustle-specific color palette, dark-first design constraint
**Avoids:** AsyncStorage all-in-one key, dark mode white flash, wrong initial route, `expo-system-ui` Android dark mode miss

### Phase 2: Onboarding and Profile
**Rationale:** The onboarding gate must function before any other screen is reachable in a real-device flow. Hustle type selected here drives per-hustle context (badge names, template defaults, pricing suggestions) throughout the entire app. Profile store is the root data entity everything else references.
**Delivers:** 2-step onboarding (hustle type + business name), `useOnboarded()` gate, `profileStore`, profile screen (read-only for now), business name generator
**Addresses:** Fast onboarding (table stakes), personalization, name generator (differentiator)
**Avoids:** Back-navigation leak, overloaded onboarding (2 steps max), wrong initial route

### Phase 3: Core Business Data (Clients and Jobs)
**Rationale:** Clients and jobs are the primary data that earnings, gamification, and the home dashboard all aggregate. This is the highest-complexity feature area (recurring job logic, status transitions) and must be solid before dependent features are built.
**Delivers:** `clientsStore` + client CRUD screens, `jobsStore` + job CRUD screens (including recurring), FlashList-powered lists, React Hook Form + Zod validated forms
**Addresses:** Client contact management (table stakes), job scheduling (table stakes), recurring jobs (table stakes)
**Avoids:** FlatList re-render cascade (use FlashList + useCallback), modal placement bug (modals in `app/(modals)/` not inside `(tabs)/`)

### Phase 4: Gamification Engine
**Rationale:** The gamification engine is a pure function of events from the business data stores (Phase 3). It has no UI of its own until this phase, but it must be built with a complete `GAMIFICATION_CONFIG` model (full 10-level curve) before any XP constants are written. Wire XP events into existing store actions.
**Delivers:** `lib/gamification/engine.ts` + `rules.ts`, `GAMIFICATION_CONFIG` with modeled level curve, `gamificationStore`, XP bar component, level badge, HustleBucks display, badge gallery with unlock animations (Lottie + confetti), haptic feedback on milestone events
**Addresses:** XP + level progression (table stakes), badges (table stakes), HustleBucks display (table stakes), celebration animations (differentiator)
**Avoids:** XP inflation (model curve first), badge firing twice (persisted award flag), HustleBucks farming (award on completion only, not creation)

### Phase 5: Payments and Dashboard
**Rationale:** Dashboard is the composition of all prior data — upcoming jobs (Phase 3), XP bar (Phase 4), earnings totals (Phase 5). Payments close the job loop and feed the earnings dashboard. Build last in the core loop so all data sources exist when the dashboard renders.
**Delivers:** `paymentsStore` + payment logging UI (from job detail), earnings dashboard with gifted-charts bar/line charts, home dashboard (upcoming jobs, XP bar, quick stats, quick actions), goal setting stub
**Addresses:** Payment logging (table stakes), earnings dashboard (table stakes), home dashboard (table stakes)
**Avoids:** FlatList re-renders (useMemo for chart data), SVG chart Expo incompatibility (use gifted-charts via `npx expo install`)

### Phase 6: Tools and Polish
**Rationale:** Tools (flyer generator, business card, pricing calculator, business ideas engine) depend only on profile data (hustle type) and theme — they are the most isolated features and unblock nothing else. Polish (streak tracker, animation refinement, profile stats screen completion) rounds out the v1 experience.
**Delivers:** Pricing calculator, business ideas engine, flyer generator (react-native-view-shot + expo-sharing), business card generator, profile screen with full stats and badges, activity streak tracker, App Store submission
**Addresses:** Flyer generator (differentiator), business card (differentiator), pricing calculator (differentiator), business ideas engine (differentiator), profile/shareable identity (differentiator)
**Avoids:** COPPA exposure (no analytics SDKs, no data transmission, document in App Store privacy label)

### Phase Ordering Rationale

- Phase 1 → 2 → 3: strict dependency chain (storage before stores, profile before clients, clients before jobs)
- Phase 4 after Phase 3: gamification engine subscribes to business data store actions — those stores must exist first
- Phase 5 after Phase 4: home dashboard is a composition of all prior outputs; building it earlier means repeated rework
- Phase 6 last: tools are standalone after profile data exists; polish belongs at the end, not interspersed
- Pitfalls from PITFALLS.md cluster in Phases 1-4 — all Phase 1 critical pitfalls are setup decisions that cannot be retrofitted cheaply

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 3 (recurring job logic):** Date generation for weekly/biweekly/monthly patterns with edge cases (month-end dates, DST) may need deeper date-fns v4 investigation. `recurrenceGroupId` linking strategy needs explicit design decision before implementation.
- **Phase 4 (XP curve modeling):** The actual `GAMIFICATION_CONFIG` numbers (XP per level, per-action values, daily caps) require a dedicated balancing exercise — research identified the pattern but did not produce final numbers. This is a design task, not a research task, but must happen before any code is written.
- **Phase 6 (flyer generator):** `react-native-view-shot` + `expo-media-library` integration for capturing styled React Native Views as PNG needs a proof-of-concept spike before full implementation.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Foundation):** Expo project setup, NativeWind configuration, and storage scaffolding are well-documented with official guides.
- **Phase 2 (Onboarding):** File-based routing, `router.replace()` pattern, and simple form flows are standard Expo Router patterns.
- **Phase 5 (Charts):** react-native-gifted-charts has straightforward documented API; standard Expo managed workflow integration.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All major library versions verified against current official docs and npm. New Architecture requirements confirmed in Expo SDK 55 changelog. One medium-confidence area: MMKV v4 has minor known Expo compatibility issues in open GitHub issues — install via `npx expo install react-native-mmkv react-native-nitro-modules` to resolve. |
| Features | HIGH | Table stakes validated against Jobber/Housecall Pro feature analysis. Gamification mechanics (XP, streaks, badges) validated against Duolingo case studies with multiple independent sources. Differentiators (flyer generator, pricing calculator) inferred from competitor gap analysis with no direct comparison app found. |
| Architecture | HIGH | Feature-oriented layered architecture is the current community standard for Expo apps (verified via official Expo blog and multiple community guides). Gamification engine event-driven pattern is well-established. AsyncStorage schema design validated against documented pitfalls. |
| Pitfalls | HIGH | CursorWindow bug documented in GitHub issues with 100+ upvotes. Dark mode flash is a known React Native issue. Expo Router navigate() breaking change is documented in Expo changelog. XP inflation pattern is documented in gamification design literature. |

**Overall confidence:** HIGH

### Gaps to Address

- **XP curve numbers:** Research identified the pattern (exponential scale, 3-6 months to level 10 for active users) but the actual numbers (`GAMIFICATION_CONFIG`) are a design decision requiring a balancing spreadsheet before Phase 4 begins. This is the single most important pre-implementation design task.
- **MMKV v4 Expo compatibility:** Minor open GitHub issues noted. Mitigate by using `npx expo install` and testing early in Phase 1 setup. If persistent issues arise, the fallback is AsyncStorage for Zustand persistence (performance regression but functionally equivalent for game state).
- **react-native-gifted-charts maintenance risk:** Community-maintained library (not a large org). If it stalls, Victory Native XL is a documented drop-in replacement (with added Skia dependency cost). Monitor GitHub activity before and during Phase 5.
- **NativeWind v5 timing:** NativeWind v5 is in preview and not production-ready. Build on v4. If v5 ships as stable during development, evaluate upgrading — it has known improvements for complex animation scenarios where v4 classes occasionally conflict with Reanimated worklets.
- **date-fns v4 breaking changes:** Major version released; verify v3→v4 breaking changes before implementing recurring job date generation in Phase 3.

---

## Sources

### Primary (HIGH confidence)
- Expo SDK 55 changelog: https://expo.dev/changelog/sdk-55
- Expo Router v55 blog: https://expo.dev/blog/expo-router-v55-more-native-navigation-more-powerful-web
- Drizzle ORM + Expo SQLite: https://orm.drizzle.team/docs/connect-expo-sqlite
- Expo SQLite docs: https://docs.expo.dev/versions/latest/sdk/sqlite/
- react-native-mmkv GitHub: https://github.com/mrousavy/react-native-mmkv
- Expo haptics docs: https://docs.expo.dev/versions/latest/sdk/haptics/
- NativeWind v4 docs: https://www.nativewind.dev/blog/announcement-nativewind-v4
- React Native Reanimated docs: https://docs.swmansion.com/react-native-reanimated/
- Housecall Pro vs Jobber Comparison 2026: https://www.fieldpulse.com/resources/blog/housecall-pro-vs-jobber
- Duolingo gamification case study: https://trophy.so/blog/duolingo-gamification-case-study
- AsyncStorage CursorWindow bug: https://github.com/react-native-async-storage/async-storage/issues/537
- Expo Router Troubleshooting: https://docs.expo.dev/router/reference/troubleshooting/
- FlatList optimization: https://reactnative.dev/docs/optimizing-flatlist-configuration

### Secondary (MEDIUM confidence)
- react-native-gifted-charts: https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts — community-maintained, actively updated as of April 2025
- lottie-react-native + dotLottie: https://github.com/LottieFiles/dotlottie-react-native — SDK 55 New Architecture compatibility via Legacy Interop bridge
- Duolingo streak engagement data (+60%): https://www.orizon.co/blog/duolingos-gamification-secrets — multiple independent sources agree
- COPPA compliance 2025: https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/

### Tertiary (LOW confidence / inference)
- Flyer/card generator as teen differentiator — inferred from competitor gap analysis; no direct teen-specific FSM app found to validate against
- Business ideas engine as pre-acquisition feature — strategic inference; no direct comparison app located

---
*Research completed: 2026-03-24*
*Ready for roadmap: yes*
