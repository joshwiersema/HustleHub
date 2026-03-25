# Phase 2: Onboarding - Research

**Researched:** 2026-03-24
**Domain:** Expo Router onboarding flow, Zustand profile persistence, React Native animations, keyboard-aware forms
**Confidence:** HIGH

## Summary

Phase 2 refactors the existing first-pass onboarding screens (`app/onboarding/`) to use the Zustand `profileStore` instead of the deprecated `storage.ts` module. The existing code is structurally sound -- all three screens exist with animations, layout, styling, and navigation already implemented. The primary work is: (1) replacing the `saveProfile`/`setOnboardingComplete` imports from `storage.ts` with `useProfileStore` actions, (2) ensuring `router.replace('/(tabs)')` is used on completion so the URL-based back gesture is clean, and (3) verifying the `Stack.Protected` guard in `app/_layout.tsx` properly prevents re-entry after `isOnboarded` flips to `true`.

The existing screens already match the CONTEXT.md decisions closely (welcome with emoji hero, 2-col hustle grid, setup-business with AI name suggestions and preview card). The refactoring is targeted, not a rewrite. The critical risk is the deprecated `storage.ts` import in `setup-business.tsx` (line 27) -- this will crash at runtime since the storage functions write to different AsyncStorage keys than the Zustand persist middleware expects.

**Primary recommendation:** Refactor `setup-business.tsx` to call `useProfileStore.getState().setProfile(profile)` instead of the deprecated `saveProfile`/`setOnboardingComplete` functions, then verify `router.replace('/(tabs)')` on completion and validate `Stack.Protected` removes onboarding from the back stack.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Welcome Screen (ONBD-01): Energetic game-like tone, large animated emoji composition as hero, "HustleHub" title with "Hub" in green (#00E676), tagline "Turn your hustle into a business", 3 feature pills, single "Get Started" GradientButton, dark bg with subtle glow orbs
- Hustle Type Selection (ONBD-02): Title "What's your hustle?" with game character-class flavor, 2-column card grid with all 6 HUSTLE_TYPES, each card shows emoji/name/avg earnings (amber)/difficulty badge, selected card gets green border + glow + checkmark, single selection, step indicator dots, "Next" button animates in on selection
- Business Setup (ONBD-03, ONBD-04, ONBD-05): Selected hustle badge at top, "Your name" + "Business name" inputs with icons, green checkmark on valid (2+ chars), "AI Name Ideas" purple gradient button with 3 hardcoded names per type (18 total), tapping suggestion auto-fills, live preview card when both fields valid, "Launch My Hustle" green gradient button
- Onboarding Completion: Creates UserProfile with level 1, 0 XP, 50 starter HustleBucks, isOnboarded: true. Uses router.replace('/(tabs)'). Stack.Protected guard prevents return. Persists via Zustand persist middleware.
- Navigation: Stack layout, no header, dark background, slide-from-right, 3 screens: index -> pick-hustle -> setup-business, pass hustleType as route param

### Claude's Discretion
- Exact animation timing and easing for emoji composition
- Stagger timing for card grid entrance animations
- Exact layout of the preview card
- Input validation error messaging style

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| ONBD-01 | User can view a welcome screen that communicates the app's value proposition | Welcome screen already exists at `app/onboarding/index.tsx` with emoji hero, title, tagline, feature pills, and "Get Started" button. No storage.ts dependency -- this screen just navigates forward. Minimal changes needed. |
| ONBD-02 | User can select their hustle type from 6 visual cards | Pick-hustle screen exists at `app/onboarding/pick-hustle.tsx` with 2-col grid, staggered animations, selected state, difficulty badges. No storage.ts dependency -- passes hustleType via route params. Minimal changes needed. |
| ONBD-03 | User can set up their business profile (business name, owner name) | Setup-business screen exists at `app/onboarding/setup-business.tsx` with both inputs, validation, keyboard handling. BUT imports `saveProfile`/`setOnboardingComplete` from deprecated `storage.ts` -- must be replaced with `useProfileStore` actions. |
| ONBD-04 | User can generate AI-style business name suggestions based on hustle type | 18 hardcoded suggestions (3 per type) already exist in `BUSINESS_NAME_SUGGESTIONS` map in `setup-business.tsx`. Purple gradient "AI Name Ideas" button toggles suggestion list. Tap-to-fill works. No changes needed to this feature. |
| ONBD-05 | User sees a preview of their business identity before launching into the app | Preview card already renders when both fields are valid, showing emoji, business name, user name, starter stats (Level 1, 50 HB, 0 XP). No changes needed to this UI -- only the save/launch handler needs refactoring. |
</phase_requirements>

## Standard Stack

### Core (already installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| expo-router | 55.0.7 | File-based routing with Stack.Protected guard | Already handles the onboarding gate via guard prop in root layout |
| zustand | 5.0.12 | State management with AsyncStorage persist | profileStore already has setProfile/markOnboarded actions |
| expo-linear-gradient | 55.0.9 | Gradient buttons and card overlays | Used across all 3 onboarding screens |
| react-native-safe-area-context | 5.7.0 | Safe area insets on all screens | Already used in all 3 onboarding screens |
| @expo/vector-icons (Ionicons) | 15.1.1 | Icons for inputs, buttons, navigation | Already imported in all screens |

### Supporting (already installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native (Animated API) | 0.83.2 | Entrance/exit animations | Already used for all onboarding animations -- keep using it, not Reanimated |
| @react-native-async-storage/async-storage | 3.0.1 | Persistence backend for Zustand | Used implicitly through Zustand persist middleware |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| RN Animated API | react-native-reanimated | Reanimated is more performant for complex/gesture-driven animations, but the existing screens use RN Animated successfully with simple entrance animations. Switching mid-phase adds risk for no user-visible benefit. |

**Installation:**
No new packages needed. All dependencies are already installed.

## Architecture Patterns

### Existing File Structure (no changes needed)
```
app/
  _layout.tsx              # Stack.Protected guard reads isOnboarded
  index.tsx                # Redirect to /(tabs)
  onboarding/
    _layout.tsx            # Stack with no header, dark bg, slide_from_right
    index.tsx              # Welcome screen (ONBD-01)
    pick-hustle.tsx        # Hustle type selection (ONBD-02)
    setup-business.tsx     # Business setup (ONBD-03, ONBD-04, ONBD-05)
  (tabs)/
    _layout.tsx            # Tab navigator
    ...
src/
  store/
    profileStore.ts        # Zustand store -- setProfile is the key action
    storage.ts             # DEPRECATED -- must NOT be imported by onboarding
  types/
    index.ts               # HUSTLE_TYPES, HustleType, UserProfile
  constants/
    theme.ts               # Colors, Spacing, etc.
  components/
    GradientButton.tsx     # Reusable (but screens use inline gradients)
    Card.tsx               # Reusable base card
    ScreenHeader.tsx       # Title + subtitle pattern
```

### Pattern 1: Zustand Store Integration for Onboarding Completion
**What:** Replace deprecated storage.ts calls with Zustand profileStore actions
**When to use:** The setup-business.tsx handleLaunch function
**Example:**
```typescript
// BEFORE (broken -- imports from deprecated storage.ts):
import { saveProfile, setOnboardingComplete } from '../../src/store/storage';
// ...
await saveProfile(profile);
await setOnboardingComplete();

// AFTER (correct -- uses Zustand store):
import { useProfileStore } from '../../src/store/profileStore';
// ...
// Inside the component:
const setProfile = useProfileStore((s) => s.setProfile);
// Inside handleLaunch:
setProfile(profile); // This sets both profile AND isOnboarded: true (see store line 27)
```
Source: `src/store/profileStore.ts` line 27 -- `setProfile: (profile) => set({ profile, isOnboarded: true })`

### Pattern 2: Stack.Protected Navigation Gate
**What:** Expo Router's Stack.Protected automatically prevents back-navigation to guarded screens
**When to use:** Already implemented in `app/_layout.tsx`
**How it works:**
When `isOnboarded` changes from `false` to `true` (via `setProfile`), Stack.Protected with `guard={!isOnboarded}` causes the onboarding group to become inaccessible. Per Expo docs: "When a screen's guard changes from true to false, all of its history entries will be removed from the navigation history." This means the back stack is automatically cleaned -- no `CommonActions.reset()` needed.
Source: [Expo Protected Routes Docs](https://docs.expo.dev/router/advanced/protected/)

### Pattern 3: Route Param Passing Between Onboarding Steps
**What:** Pass hustleType from pick-hustle to setup-business via route params
**When to use:** Already implemented
**Example:**
```typescript
// In pick-hustle.tsx:
router.push({
  pathname: '/onboarding/setup-business',
  params: { hustleType: selected },
});

// In setup-business.tsx:
const params = useLocalSearchParams<{ hustleType: HustleType }>();
const hustleType = params.hustleType || 'lawn_care';
```
Source: [Expo Router URL Parameters](https://docs.expo.dev/router/reference/url-parameters/)

### Pattern 4: router.replace for Final Navigation
**What:** Use `router.replace('/(tabs)')` instead of `router.push` for the final onboarding-to-tabs transition
**When to use:** After saving profile in setup-business.tsx
**Why:** Even though Stack.Protected handles the guard, `router.replace` is belt-and-suspenders -- it prevents a brief moment where the onboarding screen is still visible in the stack before the guard re-evaluates.

### Anti-Patterns to Avoid
- **Importing from storage.ts:** This module writes to different AsyncStorage keys (`hustlehub_profile`, `hustlehub_onboarding_complete`) than the Zustand persist middleware expects (`@hustlehub/profile`). Mixing them causes the Zustand store to never see the saved data. Remove ALL storage.ts imports from onboarding screens.
- **Using router.push() for the final navigation:** Even with Stack.Protected, avoid `router.push('/(tabs)')` for the completion step. Use `router.replace` so the stack transition is clean.
- **Using CommonActions.reset():** Not needed with Stack.Protected. The guard handles history cleanup automatically.
- **Async operations before setProfile:** The Zustand `setProfile` is synchronous (it's a `set()` call). Don't wrap it in try/catch expecting async behavior. The persistence to AsyncStorage happens asynchronously via the middleware, but the state update is immediate.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Onboarding gate / back-nav prevention | Custom navigation reset logic with CommonActions | Stack.Protected guard in root layout | Already implemented in app/_layout.tsx. Guard automatically removes history entries when condition flips. |
| Profile persistence | Manual AsyncStorage read/write | Zustand persist middleware | Already configured in profileStore.ts with @hustlehub/profile key. Automatic serialization/deserialization. |
| ID generation | Custom ID function | `uuid` package (already installed) or keep existing `generateId()` | The existing `generateId()` in setup-business.tsx works fine (Date.now + Math.random). uuid is installed but either approach works for local-only data. |
| Input validation | Custom validation library | Simple `length >= 2` check | Already implemented. For 2 text fields with a minimum length check, no validation library is warranted. |

**Key insight:** The existing onboarding code already handles 90% of the user-facing requirements. The only breaking issue is the storage.ts import in setup-business.tsx. This is a surgical fix, not a rebuild.

## Common Pitfalls

### Pitfall 1: Dual Storage Path (storage.ts vs Zustand)
**What goes wrong:** `setup-business.tsx` imports `saveProfile` from `storage.ts`, which writes to `hustlehub_profile` AsyncStorage key. But the Zustand `profileStore` reads from `@hustlehub/profile`. The profile is saved but never read back -- the app appears to lose the onboarding state on restart.
**Why it happens:** First-pass code predated the Zustand store setup.
**How to avoid:** Remove ALL imports from `../../src/store/storage` in onboarding screens. Use `useProfileStore` exclusively.
**Warning signs:** Onboarding completes but after app restart, user is sent back to onboarding.

### Pitfall 2: Zustand setProfile is Synchronous but Persist is Async
**What goes wrong:** Calling `setProfile(profile)` then immediately calling `router.replace('/(tabs)')` works for the in-memory state, but the AsyncStorage write may not have completed. If the app crashes between the state update and the persist write, the user loses their onboarding data.
**Why it happens:** Zustand persist middleware writes asynchronously to AsyncStorage after the synchronous state update.
**How to avoid:** Keep the existing pattern of a brief `setTimeout` (the current code uses 400ms delay for the launch animation). This gives the persist middleware time to write. For production robustness, the Stack.Protected guard re-reads from the hydrated store on next launch, so even if the persist fails, the user just re-onboards (acceptable for v1).
**Warning signs:** Profile data missing after force-killing app immediately after "Launch My Hustle."

### Pitfall 3: Back Button on pick-hustle Returning to Welcome
**What goes wrong:** The `router.back()` call in pick-hustle.tsx's back button navigates back to the welcome screen, which is fine during onboarding. But some implementations accidentally use `router.back()` on the welcome screen itself, which would exit onboarding or cause undefined behavior.
**Why it happens:** Welcome screen (index.tsx) is the first screen in the stack -- there is no "back" from it.
**How to avoid:** Welcome screen does NOT have a back button (already correct in current code). Only pick-hustle and setup-business have back buttons. Verify this is preserved.
**Warning signs:** Back gesture on welcome screen navigates outside onboarding.

### Pitfall 4: Missing hustleType Route Param
**What goes wrong:** If `useLocalSearchParams<{ hustleType: HustleType }>()` returns undefined (e.g., deep link directly to setup-business), the screen renders with the fallback 'lawn_care' type, which may confuse users.
**Why it happens:** Direct navigation to setup-business without going through pick-hustle.
**How to avoid:** The existing code already has a fallback (`params.hustleType || 'lawn_care'`). With Stack.Protected guarding onboarding screens when `isOnboarded` is true, and the sequential flow enforcing pick-hustle -> setup-business, this is a non-issue in practice. No fix needed.

### Pitfall 5: Keyboard Covering "Launch My Hustle" Button
**What goes wrong:** On smaller iPhones, the keyboard overlaps the bottom-positioned launch button when the user is typing in the business name field.
**Why it happens:** The button is absolutely positioned at the bottom of the screen, and `KeyboardAvoidingView` only shifts the ScrollView content, not the absolute-positioned bottom bar.
**How to avoid:** The existing code already uses `KeyboardAvoidingView` with `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` and `keyboardVerticalOffset={10}`. The `ScrollView` has `keyboardShouldPersistTaps="handled"` and `paddingBottom: 120` on the content container. This should work, but should be tested on a small device (iPhone SE). If issues arise, increase `keyboardVerticalOffset` or add bottom padding to the ScrollView content.

## Code Examples

### Critical Refactor: setup-business.tsx handleLaunch

The single most important code change in this phase:

```typescript
// REMOVE this import (line 27 of current setup-business.tsx):
// import { saveProfile, setOnboardingComplete } from '../../src/store/storage';

// ADD this import:
import { useProfileStore } from '../../src/store/profileStore';

// Inside component, get the action:
const setProfile = useProfileStore((s) => s.setProfile);

// Replace the handleLaunch function body:
const handleLaunch = () => {
  if (!canLaunch || isLaunching) return;
  setIsLaunching(true);

  Animated.timing(launchAnim, {
    toValue: 1,
    duration: 600,
    useNativeDriver: true,
  }).start();

  const profile: UserProfile = {
    id: generateId(),
    name: userName.trim(),
    businessName: businessName.trim(),
    hustleType,
    level: 1,
    xp: 0,
    hustleBucks: 50,
    totalEarnings: 0,
    streak: 0,
    joinedDate: new Date().toISOString(),
    badges: [],
    onboardingComplete: true,
  };

  // Synchronous state update -- Zustand persist writes async in background
  setProfile(profile);

  // Brief delay for animation impact + persist write buffer
  setTimeout(() => {
    router.replace('/(tabs)');
  }, 400);
};
```
Source: `src/store/profileStore.ts` -- `setProfile` action sets both `profile` and `isOnboarded: true`

### Zustand Store API Reference

```typescript
// profileStore.ts exposes these actions relevant to onboarding:
setProfile: (profile: UserProfile) => void  // Sets profile AND isOnboarded = true
markOnboarded: () => void                    // Sets only isOnboarded = true (not needed for onboarding)
reset: () => void                            // Resets to initial state (for testing/profile reset)

// The store selector pattern used in root layout:
const isOnboarded = useProfileStore((s) => s.isOnboarded);
// This automatically re-renders when isOnboarded changes, triggering the Stack.Protected guard
```

### UserProfile Construction

The `UserProfile` interface requires these fields (from `src/types/index.ts`):
```typescript
interface UserProfile {
  id: string;              // generateId() from setup-business.tsx
  name: string;            // From "Your name" input
  businessName: string;    // From "Business name" input
  hustleType: HustleType;  // From route params
  level: number;           // 1 (starter)
  xp: number;              // 0 (starter)
  hustleBucks: number;     // 50 (starter bonus)
  totalEarnings: number;   // 0 (starter)
  streak: number;          // 0 (starter)
  joinedDate: string;      // new Date().toISOString()
  badges: string[];        // [] (empty)
  onboardingComplete: boolean;  // true
}
```

Note: The `UserProfile` type has an `onboardingComplete` field, but the Zustand store uses a separate top-level `isOnboarded` boolean. The `setProfile` action sets `isOnboarded: true` regardless of the `onboardingComplete` field on the profile object. Both should be set to `true` for consistency.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `CommonActions.reset()` for onboarding gate | `Stack.Protected` guard prop | Expo SDK 53 (2025) | No need for imperative navigation reset -- declarative guards handle it |
| Manual AsyncStorage read in root layout | Zustand persist with `onFinishHydration` | Phase 1 implementation | Hydration-aware loading screen prevents flash of wrong state |
| `router.navigate()` for tab switches | `router.replace()` recommended | Expo Router v4 breaking change | `navigate()` now always pushes; use `replace()` for clean stack |

**Deprecated/outdated:**
- `src/store/storage.ts`: Entire module is deprecated. All its functions write to different AsyncStorage keys than Zustand persist expects. Must not be imported by any new code. Should be deleted once all references are removed.

## Open Questions

1. **Should storage.ts be deleted entirely in this phase?**
   - What we know: `setup-business.tsx` imports from it, AND 6 other files outside onboarding also import from it: `app/flyer-generator.tsx`, `app/business-card.tsx`, `app/job-detail.tsx`, `app/pricing-calculator.tsx`, `app/name-generator.tsx`, `app/ideas.tsx`.
   - Resolution: Do NOT delete storage.ts in this phase. Only remove the import from `setup-business.tsx`. The other 6 files are first-pass screens from future phases that will be refactored when those phases are implemented.

2. **Touch target compliance on back button**
   - What we know: The back button in pick-hustle and setup-business is 40x40px (`width: 40, height: 40`). DSGN-03 requires minimum 44x44px.
   - What's unclear: Whether the Pressable hitSlop extends the touch area sufficiently.
   - Recommendation: Increase width/height to 44 and borderRadius to 11 (44/4), or add `hitSlop={4}` to the back button Pressable to meet the 44px minimum.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently configured |
| Config file | None -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| ONBD-01 | Welcome screen renders with title, tagline, feature pills, button | manual-only | Visual inspection in Expo Go | N/A |
| ONBD-02 | Can select hustle type, selection state updates, Next button appears | manual-only | Tap test in Expo Go | N/A |
| ONBD-03 | Can enter name and business name, validation checkmarks appear | manual-only | Tap test in Expo Go | N/A |
| ONBD-04 | AI Name Ideas button shows 3 suggestions for selected type, tap fills field | manual-only | Tap test in Expo Go | N/A |
| ONBD-05 | Preview card shows when both fields valid, Launch saves profile and navigates to tabs | manual-only | Tap test + app restart in Expo Go | N/A |

**Justification for manual-only:** All onboarding requirements are UI-interaction-heavy (animations, visual state, navigation transitions). Unit testing React Native screen components requires significant setup (jest-expo, @testing-library/react-native, mock navigation context). For 3 screens with primarily visual/navigation behavior, manual testing in Expo Go is more cost-effective. The critical behavioral test is: "Complete onboarding, force-quit app, relaunch -- should land on tabs, not onboarding."

### Sampling Rate
- **Per task commit:** Manual test in Expo Go -- complete full onboarding flow
- **Per wave merge:** Full flow test + app restart test
- **Phase gate:** Complete onboarding, force-quit, relaunch, verify tabs load. Also verify back gesture on home screen does NOT return to onboarding.

### Wave 0 Gaps
None -- no test infrastructure is being added for this phase. Testing is manual via Expo Go.

## Sources

### Primary (HIGH confidence)
- `app/onboarding/` source files -- direct code inspection of all 4 files
- `src/store/profileStore.ts` -- verified `setProfile` sets `isOnboarded: true` (line 27)
- `src/types/index.ts` -- verified `HUSTLE_TYPES` array, `UserProfile` interface, `HustleType` type
- `src/store/storage.ts` -- identified deprecated module with incompatible AsyncStorage keys
- `app/_layout.tsx` -- verified `Stack.Protected` guard reads `isOnboarded` from `useProfileStore`
- [Expo Protected Routes Documentation](https://docs.expo.dev/router/advanced/protected/) -- confirmed guard removes history entries on condition flip

### Secondary (MEDIUM confidence)
- [Expo Router Navigation Documentation](https://docs.expo.dev/router/basics/navigation/) -- `router.replace()` vs `router.push()` behavior
- [Expo Router URL Parameters](https://docs.expo.dev/router/reference/url-parameters/) -- `useLocalSearchParams` for route params
- [Expo Blog: Simplifying Auth Flows](https://expo.dev/blog/simplifying-auth-flows-with-protected-routes) -- Stack.Protected pattern guidance

### Tertiary (LOW confidence)
- None -- all findings verified against primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all packages already installed, versions verified from package.json
- Architecture: HIGH -- all 4 onboarding files inspected, Stack.Protected behavior verified from Expo docs
- Pitfalls: HIGH -- the storage.ts/Zustand mismatch is definitively identified from source code, not guessed
- Refactoring scope: HIGH -- the only breaking change is the storage.ts import in setup-business.tsx (line 27)

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (30 days -- stable, no fast-moving dependencies)
