# Domain Pitfalls

**Domain:** Gamified React Native Expo mobile app (teen business management, local-first)
**Project:** HustleHub
**Researched:** 2026-03-24

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or production app failures.

---

### Pitfall 1: AsyncStorage Data Wipe at 4-6 MB (Android CursorWindow Bug)

**What goes wrong:** When the total data stored in AsyncStorage approaches 4-6 MB, closing and reopening the app causes a silent total wipe of all stored data. The error "Row too big to fit into CursorWindow" appears in logs but is not surfaced to users or caught by standard error handling.

**Why it happens:** AsyncStorage on Android uses SQLite under the hood. Android's CursorWindow has a 2 MB row size limit. When any single key's value exceeds this, the database becomes unreadable on next open, and the library's error handling silently wipes the corrupted store rather than recovering.

**Consequences:** A teen who has logged months of jobs, clients, XP, and earnings loses everything permanently with no warning. This is a fatal trust-breaking event — they stop using the app.

**Prevention:**
- Never store all app data in a single AsyncStorage key. Shard by entity type: `hustlehub_jobs`, `hustlehub_clients`, `hustlehub_profile`, `hustlehub_gamification` — each a separate key.
- Cap individual key sizes. Jobs and clients grow over time; implement pagination or archiving after 100 records per collection.
- Expose a "backup data" export (JSON) visible in Settings so users can screenshot or copy their data as a manual escape hatch.
- Add a data size monitor in dev mode that logs total bytes stored so you catch growth before shipping.

**Detection (warning signs):**
- Total clients + jobs JSON serialized exceeds 500 KB — audit and shard.
- Any single AsyncStorage key value exceeds 1 MB.

**Phase:** Address in Phase 1 (data modeling). The schema must be shard-first from day one — retrofitting is painful.

---

### Pitfall 2: Onboarding Back-Navigation Leak (Expo Router)

**What goes wrong:** After a user completes onboarding (selects hustle type, sets up business profile), pressing the hardware back button or swiping back on iOS drops them back into onboarding step 1. This breaks the illusion of progression and can corrupt the profile state if they change their hustle type mid-flow.

**Why it happens:** Expo Router's file-based routing adds every visited screen to the navigation stack by default. `router.push()` stacks; it does not replace. There is no built-in "onboarding done, lock history" mechanism in Expo Router v3/v4 — you must dispatch `CommonActions.reset()` via the underlying React Navigation API.

**Consequences:** The gamification "first launch" event fires multiple times, XP and badge triggers fire again, and the business name they set gets overwritten. Teens test back-navigation aggressively.

**Prevention:**
- On onboarding completion, use `useRootNavigation` + `CommonActions.reset()` to replace the full navigation stack with a single `/(tabs)/home` route — no history entries for onboarding screens remain.
- Alternatively, use `router.replace()` for each onboarding step so only the final step is in history, then replace to home.
- Store an `onboardingComplete` flag in AsyncStorage and check it in the root `_layout.tsx` to redirect to home before rendering the onboarding route.

**Detection (warning signs):**
- Back gesture from the home screen does anything other than dismissing the app (iOS) or doing nothing (Android).

**Phase:** Address in Phase 1 (onboarding flow). This must be correct before building any gamification triggers.

---

### Pitfall 3: Dark Mode White Flash on App Launch

**What goes wrong:** On cold launch, the app briefly flashes white (or a light background) before the dark theme renders. Even if `userInterfaceStyle: "dark"` is set in `app.json`, there is a moment between the native splash screen hiding and the React root mounting where the background defaults to white.

**Why it happens:** The React Native JavaScript layer mounts asynchronously after the native shell. If the native background color (in `app.json` `backgroundColor`) is not explicitly set to the dark theme hex, the native container shows white. Additionally, `useColorScheme` can briefly return `null` before the OS reports its value, causing a theme-undefined flicker.

**Consequences:** Even a 100ms flash reads as "this app is broken" to teen users who expect apps to feel polished. It is immediately visible in user testing.

**Prevention:**
- Set `"backgroundColor": "#0D0D0D"` in `app.json` (or your exact dark background color) — this colors the native container before JS loads.
- Also set `"splash.backgroundColor"` to the same value.
- In NavigationContainer, set `theme.colors.background` to the dark color.
- Do not conditionally render the root `ThemeProvider` — always mount it with the dark default immediately, then optionally follow system setting.
- If supporting system-auto theme in future: gate the theme read behind a `useEffect` that falls back to dark until the scheme resolves, never to light.

**Detection (warning signs):**
- Record a cold launch on physical device with screen recorder. Any frame that is not dark-themed is a failure.
- Test on physical device, not simulator — simulators mask this issue.

**Phase:** Address in Phase 1 (project setup and theming). Set the native colors before writing any screens.

---

### Pitfall 4: Expo Router Modal Placement Breaking Navigation

**What goes wrong:** Modals (add job, add client, job detail overlays) placed inside the `(tabs)/` folder behave as regular stack screens instead of modals. They push in from the bottom but do not float over the tab bar. Back navigation from within a modal can kill the tab bar entirely in some configurations.

**Why it happens:** Expo Router nests navigators by folder structure. Modals must be defined in a parent stack that wraps the tab navigator — not inside the tab group. The correct structure is an outer stack in `app/_layout.tsx` that contains both `(tabs)` and modal routes at the same level.

**Consequences:** "Add Job" flows that are supposed to be temporary overlays become full navigation pushes. Users lose context of where they were. Tab state resets.

**Prevention:**
- Place modal routes in `app/(modals)/` at the root level, not inside `app/(tabs)/`.
- Define them in `app/_layout.tsx` as `<Stack.Screen name="(modals)/add-job" options={{ presentation: 'modal' }} />`.
- Use `router.push('/(modals)/add-job')` from anywhere in the app.
- Test by opening a modal, dismissing it, and verifying the underlying tab screen state is preserved (e.g., scroll position, form data).

**Detection (warning signs):**
- Tab bar disappears when navigating to an "add" screen.
- Dismissing a modal drops you to the wrong tab or home screen.

**Phase:** Address in Phase 2 (core job/client screens). Establish modal architecture before building forms.

---

### Pitfall 5: Gamification XP Inflation Making Early Progress Worthless

**What goes wrong:** XP rewards are set too generously in early development (e.g., 100 XP per job) without modeling the full 10-level curve. By level 3, the game feels trivially easy. Adjusting XP values mid-user-lifecycle (after launch) either strands existing users or requires a hard reset.

**Why it happens:** Developers set XP values arbitrarily during feature building without simulating a complete user journey. XP for "add first client" = 50 feels right in isolation, but if the level 1→2 threshold is 200 XP, a user levels up in 4 actions and the progression arc collapses in the first session.

**Consequences:** Teens hit the level cap or "feel maxed out" in one week. The XP bar — the primary retention hook — goes dead. Re-engagement drops off a cliff because there is nothing to gain from logging more jobs.

**Prevention:**
- Model the full 10-level curve before writing any XP constants. Use a spreadsheet: define total XP required per level (e.g., exponential scale), then work backward to set per-action rewards.
- Level 1→10 should represent roughly 3-6 months of regular usage for an active teen (2-3 jobs/week).
- Implement XP constants as a single `GAMIFICATION_CONFIG` object imported everywhere — never hardcoded inline. Tuning one file changes all rewards.
- Cap XP per session per action type (e.g., max 3x "add client" XP per day) to prevent power-users from breaking the curve.
- Do NOT auto-apply retroactive XP catchup when you adjust values. Cap at the current user's highest earned XP.

**Detection (warning signs):**
- A user can reach level 5 in under 15 minutes of testing.
- The XP bar fills in a single session more than once.

**Phase:** Address in Phase 2 (gamification layer). Build `GAMIFICATION_CONFIG` before implementing any XP actions.

---

### Pitfall 6: All-in-One AsyncStorage Key Anti-Pattern

**What goes wrong:** The entire app state is serialized into one key: `AsyncStorage.setItem('appState', JSON.stringify(allData))`. Every state change — completing a job, earning XP, viewing a screen — writes the entire app state to storage.

**Why it happens:** It is the intuitive first implementation, especially when using a state manager like Zustand or Redux Persist with a single store.

**Consequences:**
- Performance degrades as data grows. A 500 KB write on every state change is measurable lag on older iPhones used by teens.
- Corruption risk: if the app crashes mid-write, the entire store is corrupted (not just the changed entity).
- Makes the CursorWindow bug (Pitfall 1) far more likely to trigger.
- Makes future migration to a proper database (SQLite, MMKV) a full rewrite.

**Prevention:**
- Design storage as a repository layer from day one. Define separate keys per entity: `jobs`, `clients`, `profile`, `settings`, `gamification`.
- Each repository has its own read/write functions. The UI never calls AsyncStorage directly.
- Writes are scoped: completing a job writes only the `jobs` key, not the entire app state.
- Abstract behind an interface (`IStorage`) so swapping AsyncStorage for MMKV later requires changing only the repository implementations.

**Detection (warning signs):**
- Any call to `AsyncStorage.setItem` that includes more than one domain entity in its value.
- Redux Persist configured with a single root reducer key.

**Phase:** Address in Phase 1 (architecture). This is a schema decision that must be made before any feature work.

---

## Moderate Pitfalls

---

### Pitfall 7: useColorScheme Returns Null / Incorrect Value on iOS Backgrounding

**What goes wrong:** The `useColorScheme()` hook from React Native intermittently fires with an incorrect value when the app returns from background on iOS. Components that key their styles off this value briefly flash between themes.

**Why it happens:** This is a documented React Native bug (GitHub issue #35972). The OS fires a configuration change event when backgrounding even if the user did not change their theme preference. React re-renders affected components with the stale/wrong value.

**Prevention:**
- Do not use `useColorScheme()` directly in component render paths. Wrap it in a ThemeContext that only updates its value after a 100ms debounce.
- For HustleHub's dark-first design: set the default to `'dark'` unconditionally and only deviate if the user has explicitly opted into a light mode (not planned for v1). This completely sidesteps the bug for v1.
- If supporting system-automatic later, test on physical device with rapid foreground/background switching before shipping.

**Detection:** Theme flash visible when switching app from background on physical iPhone.

**Phase:** Address in Phase 1 (theming setup). Decide dark-only vs. system-auto before writing ThemeContext.

---

### Pitfall 8: Missing `expo-system-ui` for Android Dark Mode

**What goes wrong:** `userInterfaceStyle: "dark"` in `app.json` is silently ignored on Android builds without `expo-system-ui` installed. The app renders in light mode on Android devices even though configuration appears correct.

**Why it happens:** This is an Expo-specific requirement for Android only, not clearly surfaced in the main Expo Router docs. The error is a console warning, not a thrown error, so it is easy to miss during iOS-first development.

**Prevention:**
- Install `expo-system-ui` in the initial project setup, even for iOS-first builds.
- `npx expo install expo-system-ui`
- Verify with `npx expo config --type introspect` that `userInterfaceStyle` is respected.

**Detection:** Build for Android; check if system dark mode is respected. Missing `expo-system-ui` = always light.

**Phase:** Address in Phase 1 project setup.

---

### Pitfall 9: Expo Router `router.navigate()` Behavior Change in v4

**What goes wrong:** Code written with the mental model of Expo Router v3's `router.navigate()` (smart back-stack management) breaks in v4, where `navigate()` now always pushes a new screen. Navigating to a tab that is already active adds a duplicate on the stack.

**Why it happens:** Breaking change in Expo Router v4. `router.navigate()` now behaves identically to `router.push()`. The v3 behavior of intelligently popping back to an existing screen is gone.

**Prevention:**
- For tab navigation: use `router.push('/(tabs)/home')` explicitly and understand it always pushes.
- For "go back to this tab" scenarios: use `router.replace()` or restructure so tabs are navigated via the tab bar (which handles state correctly) rather than programmatic navigation.
- Check the Expo Router changelog before upgrading Expo SDK versions. This category of change is documented as breaking.

**Detection:** Opening a tab from a modal or deep link and then pressing back shows an unexpected intermediate screen.

**Phase:** Address in Phase 2 when building navigation between tabs and modals.

---

### Pitfall 10: Badge Unlock Trigger Firing Multiple Times

**What goes wrong:** Achievement badges trigger their unlock animation multiple times — e.g., the "First Job Done" badge pops up every time the user opens the app or navigates to the profile screen.

**Why it happens:** Badge state is checked on component mount without persisting "already awarded" state. Or the async read of badge state races with the render, showing the award animation before confirming the badge was already awarded.

**Prevention:**
- Store all badge unlock state in the persisted `gamification` repository with a `awarded: true` flag per badge ID.
- Award logic runs once, writes immediately, and never re-runs if `awarded === true`.
- Separate "check eligibility" (can run anytime) from "award badge" (runs once, writes to storage, shows animation). Never merge these two operations.
- Queue badge award animations so that if multiple badges unlock simultaneously (first launch scenario), they appear sequentially, not all at once.

**Detection:** Kill and relaunch the app after earning a badge. If the animation fires again, the state is not persisted.

**Phase:** Address in Phase 2 (gamification layer) when implementing badge award system.

---

### Pitfall 11: Overloading Onboarding With Too Much Setup

**What goes wrong:** Onboarding asks for business name, owner name, hustle type, pricing, and profile photo before showing any value. Teen users drop off before completing setup. The first experience is "homework," not "game."

**Why it happens:** Product thinking defaults to "collect everything upfront." But teen users (especially 13-15 year olds) have low tolerance for multi-step forms before they see what the app does.

**Prevention:**
- Minimum viable onboarding: hustle type selection + business name only (2 steps max).
- Owner name, pricing, and preferences should be deferred to the profile screen or prompted contextually on first use.
- First screen after onboarding should show the dashboard with XP bar at 0 and an explicit "Your journey starts here" message — the gamification layer should be visible immediately.
- Show a progress indicator in onboarding so users know it is 2 steps, not 10.

**Detection:** If onboarding takes more than 60 seconds to complete, it is too long.

**Phase:** Address in Phase 1 (onboarding). Fight scope creep on onboarding fields.

---

### Pitfall 12: FlatList Re-render Cascade on State Updates

**What goes wrong:** The jobs list, client list, or earnings history re-renders every item in the list whenever any unrelated state changes (e.g., XP updates, navigation events).

**Why it happens:** `renderItem` is defined inline in JSX as an arrow function, which creates a new function reference on every render. FlatList's `extraData` prop is set to the entire state object. Any parent state change triggers a full list re-render.

**Consequences:** Scrolling feels janky on older iPhones. Charts on the earnings dashboard recompute on every tap elsewhere in the app.

**Prevention:**
- Define `renderItem` as a `useCallback` hook, or as a stable component outside the render function.
- Use `React.memo` on list item components.
- Pass only the specific data slice the list needs via `extraData`, not the entire store.
- For the earnings chart: compute chart data in a `useMemo` keyed only to the payments data array, not to the full app state.

**Detection:** Use React DevTools Profiler. Any highlight on list items when tapping the XP bar is a false re-render.

**Phase:** Address in Phase 3 (earnings dashboard and data lists).

---

## Minor Pitfalls

---

### Pitfall 13: HustleBucks Economy Breaking Under Exploitation

**What goes wrong:** A user discovers they can earn HustleBucks by rapidly creating and deleting fake jobs or clients, farming the currency without doing real business activity.

**Why it happens:** Award logic checks "did this action happen" without checking for legitimacy signals (e.g., minimum duration between creates, no immediate deletes).

**Prevention:**
- Award HustleBucks only on completing a job (not creating one).
- Add a minimum of 1 hour between repeatable awards for the same action type.
- No HustleBucks awarded when a record is deleted — this prevents create-delete farming.
- For v1 (local-only, no backend), this matters less because there is no leaderboard to exploit. Address more carefully if online leaderboards are added in v2.

**Phase:** Address in Phase 2 (gamification). Design economy rules before implementing awards.

---

### Pitfall 14: COPPA Exposure from Collecting Teen Data

**What goes wrong:** The app collects personal information (name, business details) from users under 13 without parental consent mechanisms. The FTC's amended COPPA rule (April 2025) has expanded the definition of "personal information" and increased fines to $43,792 per violation.

**Why it happens:** App targets teens (13-18) but the 13+ boundary means COPPA can apply to under-13 users if the app is "directed to children."

**Prevention:**
- For v1 (local-only, no backend, no user accounts, no data transmission): COPPA exposure is minimal since no data leaves the device. This is the safest posture.
- Do NOT add analytics SDKs (Firebase Analytics, Mixpanel, etc.) to a teen-targeted app without a COPPA compliance review. SDKs often transmit device identifiers.
- If/when adding any backend, user accounts, or analytics: consult legal before shipping. Do not assume "teens are 13+" makes it COPPA-exempt.
- Document the "no data transmitted" posture explicitly in the App Store privacy nutrition label.

**Detection:** Audit every third-party SDK for data transmission before including it.

**Phase:** Awareness across all phases. No-backend v1 is safe; flag for any future backend work.

---

### Pitfall 15: Expo Router Initial Route Picking Wrong Screen

**What goes wrong:** On app launch after onboarding, the router loads `/help` or `/index` instead of `/(tabs)/home` because Expo Router processes files alphabetically and picks the first route it finds.

**Why it happens:** Without an explicit redirect in `app/index.tsx`, the router resolves alphabetically. Any file named `a-something.tsx` will load before `home.tsx`.

**Prevention:**
- Create `app/index.tsx` that reads the `onboardingComplete` flag from AsyncStorage and redirects with `<Redirect href="/(onboarding)/welcome" />` or `<Redirect href="/(tabs)/home" />` accordingly.
- Never rely on alphabetical file ordering for routing logic. Always be explicit.

**Detection:** Delete AsyncStorage and cold-launch. Verify you land on onboarding, not a random screen.

**Phase:** Address in Phase 1 (project structure setup).

---

### Pitfall 16: SVG/Chart Library Expo Compatibility Issues

**What goes wrong:** A chart library that works in bare React Native fails in Expo Go or requires a custom development build. The earnings dashboard charts are blocked until a dev build is configured.

**Why it happens:** Most chart libraries depend on `react-native-svg`. In Expo SDK 50+, `react-native-svg` is included in the Expo managed workflow and works in Expo Go. However, some chart libraries pin to incompatible `react-native-svg` versions or require native modules not included in Expo Go.

**Prevention:**
- Use `victory-native` or `react-native-gifted-charts` — both are tested against current Expo SDK and work in managed workflow.
- Run `npx expo install` (not `npm install`) for all dependencies to get Expo-compatible versions.
- Test chart rendering in Expo Go before committing to a library.

**Detection:** Chart component throws "Cannot read property 'NativeModules'" or renders blank in Expo Go.

**Phase:** Address in Phase 3 (earnings dashboard).

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Project setup | Dark mode white flash | Set `backgroundColor` in `app.json` to dark hex before any screens |
| Phase 1: AsyncStorage schema | All-in-one key anti-pattern | Design shard-first repository layer before first feature |
| Phase 1: Onboarding | Back-navigation leak | Use `CommonActions.reset()` on completion, not `router.push()` |
| Phase 1: Onboarding | Too many setup steps | 2 steps max: hustle type + business name |
| Phase 1: Route structure | Wrong initial route | Explicit `app/index.tsx` redirect based on onboarding flag |
| Phase 2: Gamification | XP inflation | Model full 10-level curve in spreadsheet before writing constants |
| Phase 2: Gamification | Badge firing twice | Separate "check eligibility" from "award once" with persisted flag |
| Phase 2: Gamification | HustleBucks farming | Award on completion only, minimum time between repeated awards |
| Phase 2: Navigation | Modal placement | Modals in `app/(modals)/` at root level, not inside `(tabs)/` |
| Phase 2: Navigation | Router v4 navigate() | Use `router.replace()` for tab switches, not `router.navigate()` |
| Phase 3: Earnings | FlatList re-renders | `useCallback` on renderItem, `useMemo` for chart data |
| Phase 3: Charts | SVG library incompatibility | Use `victory-native`, install via `npx expo install` |
| All phases | COPPA exposure | No analytics SDKs; no data transmission; document in App Store |

---

## Sources

- Expo Router Troubleshooting: https://docs.expo.dev/router/reference/troubleshooting/
- Expo Color Themes documentation: https://docs.expo.dev/develop/user-interface/color-themes/
- AsyncStorage Android CursorWindow bug: https://github.com/react-native-async-storage/async-storage/issues/537
- AsyncStorage data loss issues: https://github.com/react-native-async-storage/async-storage/issues/891
- AsyncStorage parallel write crash: https://github.com/react-native-community/async-storage/issues/125
- Expo Router v4 navigate() breaking change: https://github.com/expo/expo/issues/35212
- useColorScheme iOS backgrounding bug: https://github.com/facebook/react-native/issues/35972
- Best practices for AsyncStorage: https://medium.com/@tusharkumar27864/best-practices-of-using-offline-storage-asyncstorage-sqlite-in-react-native-projects-dae939e28570
- Expo modal navigation patterns: https://medium.com/@coby09/building-seamless-navigation-in-expo-router-tabs-modals-and-stacks-2df1a5522321
- Gamification reward psychology: https://badgeos.org/the-psychology-of-gamification-and-learning-why-points-badges-motivate-users/
- XP level design patterns: https://help.getbraincloud.com/en/articles/9105678-app-design-gamification-xp-levels
- FlatList optimization: https://reactnative.dev/docs/optimizing-flatlist-configuration
- COPPA compliance 2025: https://blog.promise.legal/startup-central/coppa-compliance-in-2025-a-practical-guide-for-tech-edtech-and-kids-apps/
- FTC COPPA enforcement (Genshin Impact): https://foleyhoag.com/news-and-insights/blogs/security-privacy-and-the-law/2025/september/ftc-to-app-developers-your-vendors-coppa-missteps-are-your-own/
- Onboarding drop-off psychology: https://www.appdesignglory.com/blogs/designing-app-onboarding-that-reduces-drop-off-and-improves-retention-2/
- React Native MMKV vs AsyncStorage performance: https://medium.com/@nomanakram1999/stop-using-asyncstorage-in-react-native-mmkv-is-10x-faster-82485a108c25
