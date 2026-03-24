# Technology Stack

**Project:** HustleHub — Gamified Teen Business Management iOS App
**Researched:** 2026-03-24
**Overall confidence:** HIGH (all major recommendations verified against current official docs or npm)

---

## Recommended Stack

### Core Platform

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Expo SDK | 55.x | Managed workflow platform | Latest stable (Feb 2026). New Architecture mandatory (RN 0.83, React 19.2). Managed workflow eliminates native code maintenance. Expo Go + dev builds cover all testing needs. |
| React Native | 0.83 | Mobile runtime | Bundled with Expo SDK 55. New Architecture (Fabric + JSI) is now mandatory — no legacy bridge. Required for MMKV v4 and Reanimated v4. |
| React | 19.2 | UI layer | Bundled with Expo SDK 55. React 19 concurrent features improve animation scheduling. |
| TypeScript | ~5.8 | Type safety | Expo SDK 55 ships with TypeScript 5.x. First-class support across entire stack. Required for Drizzle ORM schema type inference. |
| EAS Build | latest | iOS builds + TestFlight | Free tier available. Managed workflow — no Xcode required for CI. `npx testflight` command ships directly to TestFlight. |

**Confidence:** HIGH — Expo SDK 55 release notes verified at expo.dev/changelog/sdk-55

---

### Navigation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Expo Router | ~55.x | File-based navigation | Ships with Expo SDK 55 as Expo Router v7 (version aligned to SDK). File-system routing eliminates manual navigator configuration. Tab + stack layouts built-in. Deep linking automatic. Type-safe routing included. |

**Do NOT use:** React Navigation standalone. Expo Router is built on React Navigation internally but adds file-based routing, automatic deep linking, and typed routes. Starting from scratch with standalone React Navigation adds manual wiring with zero benefit.

**Confidence:** HIGH — confirmed in Expo SDK 55 changelog ("Expo Router v7")

---

### State Management

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| Zustand | ^5.0.12 | Global app state (XP, levels, HustleBucks, game state) | v5 drops deprecated APIs, native `useSyncExternalStore`, 2KB bundle. Zero boilerplate — define a store in 10 lines. Selective re-renders prevent unnecessary UI updates during XP animations. `persist` middleware bridges to MMKV storage with one line of config. |

**Pattern for HustleHub:** One Zustand store per domain — `useGameStore` (XP, level, HustleBucks, badges), `useBusinessStore` (profile, hustle type), `useJobStore` (jobs, schedule), `useClientStore` (contacts). Persist all stores to MMKV.

**Do NOT use:** Redux Toolkit — 20KB overhead, complex setup, no benefit for a local-only app. Context API alone — causes cascading re-renders on every state change, catastrophic for animated XP bars.

**Confidence:** HIGH — npm verified (5.0.12 current), official Zustand docs confirm React 18+ requirement met.

---

### Persistence / Local Storage

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| expo-sqlite | ~55.x | Primary structured data store | Built into Expo SDK 55. Full SQLite with typed API, FTS5, transactions, prepared statements. Drizzle integration provides TypeScript schema and migrations. `useLiveQuery` hook auto-updates UI when data changes — perfect for live dashboard numbers. Built-in DevTools inspector in SDK 55. |
| Drizzle ORM | ^0.40.x | Type-safe SQLite queries + schema migrations | The current standard for typed Expo SQLite. Schema definitions generate TS types automatically. Declarative migrations (`drizzle-kit`) bundled into the app. `drizzle-studio-expo` dev plugin for database inspection. Replaces raw SQL strings entirely. |
| react-native-mmkv | ^4.3.0 | Fast key-value store for Zustand persistence | v4 is pure C++ JSI module, ~30x faster than AsyncStorage. Fully synchronous reads — no async/await needed for loading state at app launch. Used exclusively as the Zustand persist storage adapter, not as the primary data store. Requires New Architecture (satisfied by Expo SDK 55). |

**Storage architecture:**
- `expo-sqlite + Drizzle` → all business data (jobs, clients, payments, profile)
- `react-native-mmkv` → Zustand state persistence (XP totals, level, settings, UI preferences)
- Do NOT use `@react-native-async-storage/async-storage` → deprecated by this stack, inferior performance, async API creates loading state complexity

**Why NOT AsyncStorage alone:** It is async-only (requires loading states everywhere), slow (backed by SQLite or filesystem with no pooling), and has no schema support. The PROJECT.md constraint allows AsyncStorage for v1, but MMKV + expo-sqlite is the current community standard with no meaningful added complexity.

**Confidence:** HIGH for expo-sqlite (Expo first-party). HIGH for Drizzle (official Expo blog dedicated post). MEDIUM for MMKV v4 (confirmed v4 on npm, New Architecture requirement confirmed, but minor Expo compatibility issues documented in open issues — use `npx expo install react-native-mmkv react-native-nitro-modules` to resolve).

---

### Animations

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-native-reanimated | ^4.2.3 | All performance-critical animations | v4 is the SDK 55 standard (v3 not compatible). Runs on UI thread via JSI worklets — 120fps capable. Required for XP bar fill animations, level-up transitions, badge unlock reveals, and progress ring on home dashboard. Also a peer dependency for Gesture Handler, Victory Native XL, and react-native-fast-confetti. |
| lottie-react-native | ^7.x | Pre-built animation playback | Badge unlock celebrations, achievement bursts, onboarding character animations. Renders After Effects JSON at native speed. LottieFiles free library has hundreds of gamification-ready animations. Expo managed workflow compatible via config plugin. |
| react-native-fast-confetti | ^1.x | Achievement/level-up confetti | Built on Skia Atlas API + Reanimated. Highest performance confetti available for React Native. Trivially triggered on level-up and badge unlock events. Peer deps (Skia + Reanimated) already in the stack. |

**Do NOT use:** React Native's built-in `Animated` API for complex sequences — single-threaded, janky on mid-range devices. Moti is a thin Reanimated wrapper that adds convenience but reduces control needed for custom XP bar physics.

**Confidence:** HIGH for Reanimated v4 (confirmed in SDK 55 upgrade guide). MEDIUM for lottie-react-native (Expo docs show it at SDK 53, SDK 55 New Architecture compatibility confirmed via Legacy Interop bridge). HIGH for react-native-fast-confetti (actively maintained, Skia-based).

---

### Charts & Data Visualization

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| react-native-gifted-charts | ^1.4.x | Earnings dashboard — bar, line, area charts | Best out-of-the-box visual quality for React Native in 2026. SVG-based (react-native-svg peer dep). Supports animated bar charts for weekly/monthly earnings, line charts for income trends, and donut charts for payment method breakdown. Much simpler API than Victory Native XL. Does not require Skia. |
| react-native-svg | ^15.x | SVG rendering (gifted-charts peer dep) | Required by react-native-gifted-charts. Already common in Expo projects. |

**Do NOT use:** Victory Native XL — requires Skia as a peer dep, adding ~10MB to bundle and a complex setup. Overkill for an earnings dashboard with simple chart types. recharts — web-only, not React Native compatible.

**Confidence:** MEDIUM — gifted-charts is community-maintained (not backed by a large org), but actively maintained as of April 2025 with recent version updates. If it stalls, Victory Native XL is a drop-in replacement for bar/line charts (with the added Skia dep).

---

### UI & Styling

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| NativeWind | ^4.1.x | Utility-first styling with dark mode | Tailwind CSS class names in React Native. Dark mode via `dark:` prefix — perfect for the dark-first design requirement. Style compiler runs at build time (lightningcss), minimal runtime cost. v4 is production-stable; v5 is in preview (not yet production-ready). |
| expo-linear-gradient | ~55.x | Gradient backgrounds, card accents | First-party Expo package. Used for dark card backgrounds, XP bar gradient fills, and level badge gradients. Zero setup in managed workflow. |
| react-native-safe-area-context | ^5.7.x | Safe area insets for notch/Dynamic Island | Required by Expo Router. Prevents content from being obscured on iPhone 14 Pro and newer. |
| expo-haptics | ~55.x | Tactile feedback for game events | First-party Expo package. `impactAsync(Heavy)` on badge unlock, `notificationAsync(Success)` on level-up, `selectionAsync()` on button taps. Essential for "game feel" — cost is zero lines of native code. |

**Color system from PROJECT.md (embed in NativeWind theme config):**
- Background: `#0A0A0A` (near-black)
- Surface: `#1A1A1A` (card background)
- Money/Growth: `#00E676` (green — earnings, jobs complete)
- XP/Levels: `#B388FF` (purple — XP bar, level display)
- HustleBucks: `#FFD740` (amber — currency, rewards)
- Danger/Overdue: `#FF5252` (red)
- Text primary: `#FFFFFF`
- Text secondary: `#9E9E9E`

**Do NOT use:** NativeBase — in maintenance mode, replaced by gluestack-ui. React Native Paper — Material Design aesthetic conflicts with the dark fintech/Stake visual direction. Tamagui — powerful but steep learning curve and complex setup for this project scope.

**Confidence:** HIGH for NativeWind v4 (official docs verified, dark mode pattern confirmed). HIGH for expo packages (first-party). MEDIUM for NativeWind v4 specifically — v5 is coming but not production-ready; v4 has known minor issues with some edge cases in complex animations. Mitigate by keeping animated components on `StyleSheet` when NativeWind classes cause conflicts.

---

### Forms & Validation

| Technology | Version | Purpose | Why |
|------------|---------|---------|-----|
| React Hook Form | ^7.54.x | Job creation, client setup, onboarding forms | Zero re-renders on input (uses uncontrolled inputs). Controller component wraps any React Native TextInput. Validation with `zod` resolver is the standard pattern. Minimal bundle size. |
| Zod | ^3.24.x | Schema validation | Validates job forms (price must be positive number), client forms (phone format), and payment amounts. Same schemas used for Drizzle TypeScript types via `drizzle-zod` adapter — define once, use everywhere. |

**Confidence:** HIGH — React Hook Form + Zod is the dominant form pattern across the React Native community in 2025-2026.

---

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| expo-image | ~55.x | Optimized image rendering | Business card previews, flyer thumbnails, onboarding illustrations. Faster than built-in `<Image>`, supports blurhash placeholders. |
| @shopify/flash-list | ^2.x | High-performance lists | Client list, job history, achievements list. FlashList v2 supports New Architecture. Drop-in replacement for FlatList with up to 10x better performance on long lists. |
| expo-file-system | ~55.x | File read/write for generated assets | Saving generated flyer/business card images to device Photos. |
| expo-media-library | ~55.x | Save images to Photos | Saving generated marketing materials to camera roll. |
| expo-sharing | ~55.x | Share generated assets | Share flyer/business card via Messages, AirDrop, etc. |
| date-fns | ^4.x | Date utilities | Job scheduling, recurring job calculations, earnings date ranges. Lightweight, tree-shakeable, no native deps. |

**Confidence:** HIGH for all Expo first-party packages. HIGH for FlashList (Shopify-maintained, New Architecture v2). MEDIUM for date-fns v4 (major version, verify breaking changes from v3).

---

## Alternatives Considered

| Category | Recommended | Alternative | Why Not |
|----------|-------------|-------------|---------|
| State | Zustand v5 | Redux Toolkit | 10x more boilerplate, 20KB overhead, no benefit for local-only app |
| State | Zustand v5 | Jotai | Atom-based model is harder to reason about for game state machines (XP calculations, level thresholds) |
| Storage | expo-sqlite + Drizzle | AsyncStorage only | No schema, no relations, no type safety, async-only causes loading state sprawl |
| Storage | MMKV | WatermelonDB | WatermelonDB is for large-scale sync scenarios; overkill for local-only with no backend |
| Charts | react-native-gifted-charts | Victory Native XL | Victory Native XL requires Skia (~10MB dep), adds complexity; gifted-charts achieves same result via SVG |
| UI | NativeWind v4 | Tamagui | Tamagui's complex setup and JSX-based styling conflicts with the Tailwind mental model most developers know |
| Animation | Reanimated v4 | Moti | Moti wraps Reanimated and limits control; custom XP bar animations need direct worklet access |
| Navigation | Expo Router | React Navigation standalone | Expo Router is React Navigation + file routing + typed routes; zero reason to use standalone in Expo managed |
| Forms | React Hook Form | Formik | Formik causes re-renders on every keystroke; RHF is universally preferred in the RN community since 2023 |

---

## Installation

```bash
# Create project (if starting fresh)
npx create-expo-app@latest HustleHub --template blank-typescript

# Navigation (included with Expo Router default template in SDK 55)
npx expo install expo-router react-native-safe-area-context react-native-screens

# State management
npm install zustand

# Storage
npx expo install expo-sqlite
npm install drizzle-orm
npm install -D drizzle-kit
npx expo install react-native-mmkv react-native-nitro-modules

# Animations
npx expo install react-native-reanimated
npx expo install react-native-gesture-handler
npx expo install lottie-react-native
npm install react-native-fast-confetti
npx expo install @shopify/react-native-skia  # peer dep for fast-confetti

# Charts
npx expo install react-native-svg
npm install react-native-gifted-charts

# UI & Styling
npm install nativewind
npm install -D tailwindcss
npx expo install expo-linear-gradient
npx expo install expo-haptics

# Forms & Validation
npm install react-hook-form zod @hookform/resolvers

# Lists & Images
npx expo install @shopify/flash-list
npx expo install expo-image
npx expo install expo-file-system expo-media-library expo-sharing

# Utilities
npm install date-fns
```

**Post-install steps:**
1. Configure `tailwind.config.js` with the HustleHub color palette (dark-first theme)
2. Add `babel-plugin-nativewind` to `babel.config.js`
3. Run `npx drizzle-kit generate` to create initial migration
4. Add `react-native-reanimated/plugin` to babel plugins (handled automatically in SDK 55 via `babel-preset-expo`)

---

## New Architecture Notes

Expo SDK 55 mandates the New Architecture. The `newArchEnabled` flag in `app.json` is removed — it is always on. This means:
- MMKV v4 is required (v3 will not work)
- Reanimated v4 is required (v3 is incompatible)
- FlashList v2 is required (v1 has known New Architecture bugs)
- All JSI/TurboModule-dependent libraries must be New Architecture compatible

Any third-party library that has not migrated to New Architecture will not work in this project. Check library GitHub issues before adding any package not listed here.

---

## Sources

- Expo SDK 55 changelog: https://expo.dev/changelog/sdk-55
- Expo Router v55 blog post: https://expo.dev/blog/expo-router-v55-more-native-navigation-more-powerful-web
- React Native Reanimated docs: https://docs.swmansion.com/react-native-reanimated/
- react-native-mmkv GitHub: https://github.com/mrousavy/react-native-mmkv
- Drizzle ORM + Expo SQLite: https://orm.drizzle.team/docs/connect-expo-sqlite
- Zustand v5 announcement: https://pmnd.rs/blog/announcing-zustand-v5
- React Native MMKV benchmark: https://github.com/mrousavy/StorageBenchmark
- NativeWind v4 docs: https://www.nativewind.dev/blog/announcement-nativewind-v4
- NativeWind dark mode: https://www.nativewind.dev/docs/core-concepts/dark-mode
- Expo SQLite docs: https://docs.expo.dev/versions/latest/sdk/sqlite/
- react-native-gifted-charts: https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts
- React Native tech stack 2025: https://galaxies.dev/article/react-native-tech-stack-2025
- Expo haptics docs: https://docs.expo.dev/versions/latest/sdk/haptics/
- lottie-react-native + dotLottie: https://github.com/LottieFiles/dotlottie-react-native
- react-native-fast-confetti: https://github.com/AlirizaHadjar/react-native-fast-confetti
- LogRocket top RN chart libraries 2025: https://blog.logrocket.com/top-react-native-chart-libraries/
