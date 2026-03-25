# Phase 4: Gamification Engine - Research

**Researched:** 2026-03-24
**Domain:** React Native gamification systems (XP, levels, badges, celebrations, streaks)
**Confidence:** HIGH

## Summary

Phase 4 transforms the existing skeleton gamification components (XPBar, BadgeIcon, HustleBucksDisplay, gameStore) into a fully wired game engine. The core store logic (addXP with level calculation, updateStreak, earnBadge) already exists and is battle-tested from Phase 3. The primary new work falls into three categories: (1) wiring XP awards + streak updates + badge checks into every qualifying action, (2) building celebration UI (confetti, bottom sheet, floating toast), and (3) constructing the badge gallery and home screen gamification widgets with live data from gameStore.

The project already has `react-native-reanimated` v4.2.3 and `expo-haptics` installed. For confetti, `react-native-confetti-cannon` (v1.5.2) is the recommended library: zero dependencies, pure Animated API, Expo-compatible, trivial API surface. The XP toast is a custom `Animated.View` overlay (no library needed). The badge unlock bottom sheet uses a standard React Native `Modal` with slide animation, matching the existing modal pattern in job-detail.tsx.

**Primary recommendation:** Build a `checkBadges()` utility that runs after every XP-granting/streak-updating action, and a `CelebrationProvider` context at the root that manages a queue of celebrations (level-up confetti modal, badge unlock bottom sheet, XP toast). This keeps celebration logic centralized and prevents multiple overlays from fighting each other.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Log a payment awards 20 XP (proportional to job complete at 25 XP)
- Use a tool awards 10 XP (encourages exploration without inflating economy)
- Keep existing LEVELS XP curve (0-10000 over 10 levels) -- models to ~4-5 months active use to reach level 8-9, CEO is aspirational
- Badge criteria evaluated on every XP-granting action -- check all unearned badges after addXP/updateStreak calls for immediate unlock
- Level-up: full-screen modal overlay with confetti burst, new level title + emoji icon, auto-dismiss after 3s or tap to dismiss
- Badge unlock: bottom sheet slide-up showing badge emoji large, name, description, "Nice!" dismiss button, haptic feedback
- XP gain: floating "+25 XP" toast appears near XP bar, fades after 1.5s, purple accent color
- Haptic feedback: medium impact on badge unlock and level-up via expo-haptics
- Badge gallery is a dedicated section on Profile tab (scrollable grid within profile, not a separate screen)
- 2-column grid, 5 rows -- earned badges are vibrant with glow border, locked are dimmed with lock visual
- Tap a badge to expand inline showing name, description, requirement, and progress toward it
- Locked badges show progress indicators ("3/5 clients" style) to motivate users
- XP bar displays on Home tab (prominent) and Profile tab (detailed view)
- Streak counter on Home tab as a "fire 5 day streak" badge -- small, visible, motivating
- HustleBucks balance on Home tab next to XP bar area with amber accent, visible but secondary to XP
- No retroactive badge earning -- badge checks start when the engine is built, clean start

### Claude's Discretion
- Exact confetti animation implementation (particle count, colors, duration)
- Bottom sheet slide-up animation timing and spring physics
- Toast positioning and fade animation easing
- Badge glow border effect implementation
- Exact layout proportions of gamification widgets on Home tab

### Deferred Ideas (OUT OF SCOPE)
- HustleBucks shop (cosmetic items) -- v2 feature per REQUIREMENTS.md
- Social leaderboards -- v2, requires backend
- Push notification for streak about to break -- v2 notification system
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| GAME-01 | User earns XP for completing jobs, logging payments, adding clients, and using tools | gameStore.addXP() already handles XP + level calc + HustleBucks. Need to wire payment logging (20 XP) and tool use (10 XP) actions. Job complete (25 XP) and client add (15 XP) already wired in Phase 3. Badge checking must follow every addXP call. |
| GAME-02 | User can see their current level and level title (10 levels: Rookie Hustler to CEO) | LEVELS constant already defined in types/index.ts with all 10 levels. XPBar component already renders level + title. Need to wire gameStore state into Home and Profile screens (currently hardcoded to level 1). |
| GAME-03 | User can see an XP progress bar showing progress toward next level | XPBar component exists with animated fill. Need to compute xpForCurrentLevel and xpForNextLevel from LEVELS table and pass live data from gameStore. |
| GAME-04 | User can see their HustleBucks balance (earned at 50% of XP rate) | HustleBucksDisplay component exists. gameStore.addXP already calculates HustleBucks at 50%. Need to wire live balance into Home screen (currently hardcoded "0"). |
| GAME-05 | User can view and collect badges for milestones (10 badges) | BADGES constant defined with 10 badges. BadgeIcon component exists. Need badge gallery UI (2-col grid on Profile), checkBadges() utility, progress tracking per badge, and badge unlock celebration. |
| GAME-06 | User can see a streak counter for consecutive days of activity | gameStore.updateStreak() already implemented. Need to call it on every business action and wire streak value into Home screen display widget. |
| GAME-07 | User receives visual feedback (animation/celebration) when leveling up or earning a badge | Need confetti modal (level-up), bottom sheet (badge unlock), floating toast (+XP), and haptic feedback. react-native-confetti-cannon for confetti, expo-haptics for haptics, custom Animated components for toast and bottom sheet. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.12 | Game state (XP, level, streak, badges) | Already used for all stores in project |
| react-native-reanimated | 4.2.3 | Badge glow animation, toast fade | Already installed, high-perf native animations |
| expo-haptics | 55.0.9 | Haptic feedback on level-up and badge unlock | Already in dependencies, official Expo SDK |
| expo-linear-gradient | 55.0.9 | XP bar gradient, confetti modal gradient overlay | Already used throughout project |

### New Dependencies
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-confetti-cannon | 1.5.2 | Confetti burst on level-up celebration | Zero deps, pure RN Animated API, Expo compatible |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-confetti-cannon | Custom reanimated confetti (Shopify pattern) | Shopify approach is 200+ lines of custom code for 100 particles with 3D rotation. Confetti-cannon is 1 import, 1 component, well-tested. Use the library. |
| react-native-confetti-cannon | react-native-fast-confetti | Requires @shopify/react-native-skia as additional peer dep -- too heavy for one effect |
| Custom toast overlay | react-native-toast-message | Toast library is overkill for a single "+XP" floating text. 15 lines of Animated.View handles it. |
| Custom bottom sheet | @gorhom/bottom-sheet | Adding a full bottom sheet library for one badge unlock UI. A Modal with `animationType="slide"` already matches the project pattern (job-detail.tsx edit modal). |

**Installation:**
```bash
npx expo install react-native-confetti-cannon
```

## Architecture Patterns

### Recommended Project Structure
```
src/
  components/
    XPBar.tsx              # (exists) Wire to gameStore
    BadgeIcon.tsx           # (exists) Add glow border for unlocked
    HustleBucksDisplay.tsx  # (exists) Already wired
    StatCard.tsx            # (exists)
    BadgeGallery.tsx        # NEW: 2-col grid with expandable badges
    StreakBadge.tsx          # NEW: Fire emoji + day count widget
    XPToast.tsx             # NEW: Floating "+N XP" animated overlay
    CelebrationProvider.tsx # NEW: Root context managing celebration queue
    LevelUpModal.tsx        # NEW: Full-screen confetti + level info
    BadgeUnlockSheet.tsx    # NEW: Bottom slide-up for badge earned
  utils/
    gamification.ts         # NEW: checkBadges(), getBadgeProgress(), getXPForLevel()
  store/
    gameStore.ts            # (exists) No changes to store itself
```

### Pattern 1: Screen-Level Orchestration for XP Actions
**What:** Every screen that triggers an XP-earning action calls a sequence: (1) the business action, (2) addXP(), (3) updateStreak(), (4) checkBadges(). This matches the existing pattern from Phase 3.
**When to use:** Every place that awards XP (job complete, client add, payment log, tool use).
**Example:**
```typescript
// In screen handler (e.g., after marking job complete)
const gameState = useGameStore.getState();
gameState.addXP(25);
gameState.updateStreak();

// Check badges after state update
const updatedState = useGameStore.getState();
const newBadges = checkBadges(updatedState, {
  totalClients: useClientsStore.getState().clients.length,
  completedJobs: useJobsStore.getState().jobs.filter(j => j.status === 'completed').length,
});
newBadges.forEach(id => gameState.earnBadge(id));
```

### Pattern 2: CelebrationProvider Context
**What:** A React context provider wrapping the root layout that exposes methods to show celebrations. Maintains an internal queue so level-up confetti plays before badge unlock sheet if both happen on the same action.
**When to use:** Wraps the entire app at `_layout.tsx` level. Screens call `showXPToast(amount)`, and the provider auto-detects level-ups and badge unlocks via Zustand subscribe.
**Example:**
```typescript
// CelebrationProvider manages:
// 1. XP Toast -- triggered explicitly by screens after addXP
// 2. Level-Up Modal -- triggered by Zustand subscribe detecting level change
// 3. Badge Unlock Sheet -- triggered by Zustand subscribe detecting new earnedBadges

interface CelebrationContextType {
  showXPToast: (amount: number) => void;
  // Level-up and badge unlock are auto-detected via subscribe
}

// Inside the provider:
useEffect(() => {
  const unsub = useGameStore.subscribe(
    (state) => ({ level: state.level, badges: state.earnedBadges }),
    (curr, prev) => {
      if (curr.level > prev.level) {
        queueCelebration({ type: 'level-up', level: curr.level });
      }
      if (curr.badges.length > prev.badges.length) {
        const newBadge = curr.badges.find(b => !prev.badges.includes(b));
        if (newBadge) queueCelebration({ type: 'badge', badgeId: newBadge });
      }
    }
  );
  return unsub;
}, []);
```

**Note:** The `subscribe` call with selector requires the `subscribeWithSelector` middleware on the store. The project's Zustand v5.0.12 exports this from `zustand/middleware`. Add it to gameStore.ts's middleware chain (wrapping persist).

### Pattern 3: Badge Progress Computation
**What:** A pure utility function that computes progress for each badge given the current app state. Used by the badge gallery to show "3/5 clients" style progress.
**When to use:** In the BadgeGallery component to render progress bars/text for locked badges.
**Example:**
```typescript
// src/utils/gamification.ts
interface BadgeProgress {
  badgeId: string;
  current: number;
  target: number;
  label: string; // "3/5 clients"
}

function getBadgeProgress(
  badge: Badge,
  stats: { clients: number; completedJobs: number; totalEarnings: number; streak: number }
): BadgeProgress {
  switch (badge.id) {
    case 'first_client': return { badgeId: badge.id, current: Math.min(stats.clients, 1), target: 1, label: `${Math.min(stats.clients, 1)}/1 client` };
    case 'five_clients': return { badgeId: badge.id, current: Math.min(stats.clients, 5), target: 5, label: `${Math.min(stats.clients, 5)}/5 clients` };
    case 'first_job': return { badgeId: badge.id, current: Math.min(stats.completedJobs, 1), target: 1, label: `${Math.min(stats.completedJobs, 1)}/1 job` };
    case 'ten_jobs': return { badgeId: badge.id, current: Math.min(stats.completedJobs, 10), target: 10, label: `${Math.min(stats.completedJobs, 10)}/10 jobs` };
    case 'twenty_jobs': return { badgeId: badge.id, current: Math.min(stats.completedJobs, 20), target: 20, label: `${Math.min(stats.completedJobs, 20)}/20 jobs` };
    case 'first_100': return { badgeId: badge.id, current: Math.min(stats.totalEarnings, 100), target: 100, label: `$${Math.min(stats.totalEarnings, 100).toFixed(0)}/$100` };
    case 'earn_500': return { badgeId: badge.id, current: Math.min(stats.totalEarnings, 500), target: 500, label: `$${Math.min(stats.totalEarnings, 500).toFixed(0)}/$500` };
    case 'earn_1000': return { badgeId: badge.id, current: Math.min(stats.totalEarnings, 1000), target: 1000, label: `$${Math.min(stats.totalEarnings, 1000).toFixed(0)}/$1,000` };
    case 'streak_7': return { badgeId: badge.id, current: Math.min(stats.streak, 7), target: 7, label: `${Math.min(stats.streak, 7)}/7 days` };
    case 'streak_30': return { badgeId: badge.id, current: Math.min(stats.streak, 30), target: 30, label: `${Math.min(stats.streak, 30)}/30 days` };
    default: return { badgeId: badge.id, current: 0, target: 1, label: '0/1' };
  }
}
```

### Pattern 4: XP Helper Utilities
**What:** Pure functions to calculate XP progress within the current level for the XP bar component.
**When to use:** When passing props to XPBar from either Home or Profile screen.
**Example:**
```typescript
// src/utils/gamification.ts
function getXPForLevel(level: number): { xpIntoLevel: number; xpNeededForLevel: number } {
  const currentLevelInfo = LEVELS.find(l => l.level === level);
  const nextLevelInfo = LEVELS.find(l => l.level === level + 1);

  const currentThreshold = currentLevelInfo?.xpRequired ?? 0;
  const nextThreshold = nextLevelInfo?.xpRequired ?? currentThreshold;

  return {
    xpIntoLevel: currentThreshold,       // XP at start of current level
    xpNeededForLevel: nextThreshold,      // XP needed to reach next level
  };
}
```

### Anti-Patterns to Avoid
- **Cross-store direct calls inside store actions:** Do NOT put badge checking inside gameStore.addXP(). Keep stores simple; orchestrate at screen level or via subscribe listeners. This is an established project pattern.
- **Multiple simultaneous celebration overlays:** Do NOT render LevelUpModal and BadgeUnlockSheet simultaneously. Queue them in CelebrationProvider.
- **Inline anonymous functions for badge checking:** Extract checkBadges() to a utility file. It needs access to multiple store states (clients count, jobs count, earnings) which stores should not know about.
- **Re-rendering entire screens on XP change:** Use granular Zustand selectors (`useGameStore(s => s.xp)` not `useGameStore()`) to prevent the jobs list from re-rendering when XP updates.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Confetti animation | Custom particle system with reanimated | react-native-confetti-cannon | 200+ lines of physics code vs. 1 component import. Cleanup, performance, and edge cases handled. |
| Haptic feedback | Vibration API directly | expo-haptics `Haptics.impactAsync(ImpactFeedbackStyle.Medium)` | Cross-platform abstraction, proper iOS Taptic Engine mapping, no permissions needed on iOS |
| XP bar animation | Manual setInterval width updates | Existing XPBar with `Animated.timing` | Already built and tested in Phase 1 |
| Level calculation | Custom level lookup | Existing `calculateLevel()` in gameStore.ts | Already iterates LEVELS table correctly |

**Key insight:** The gameStore already handles the hard math (XP accumulation, level calculation from thresholds, HustleBucks at 50%, streak date comparison). Phase 4 is primarily a UI/wiring phase, not a state logic phase.

## Common Pitfalls

### Pitfall 1: Badge Check Race Condition
**What goes wrong:** Calling `checkBadges()` immediately after `addXP()` reads stale state because Zustand's `set()` is synchronous but the component hasn't re-rendered yet.
**Why it happens:** `useGameStore.getState()` returns the LATEST state synchronously after `set()`. But if you cache a selector value before the action, it's stale.
**How to avoid:** Always use `useGameStore.getState()` AFTER the addXP/updateStreak calls, not before. The Zustand `getState()` call reads the current store value, which is updated synchronously by `set()`.
**Warning signs:** Badges that should unlock don't unlock until the next action.

### Pitfall 2: Payment XP Without Payment Store Integration
**What goes wrong:** GAME-01 requires XP for logging payments, but the paymentsStore exists but has no actions wired to XP yet. Phase 5 builds the payment UI (PYMT-01 through PYMT-03). If Phase 4 tries to wire payment XP, there's no payment flow to wire it into.
**Why it happens:** Phase ordering -- payments are Phase 5, gamification is Phase 4.
**How to avoid:** Phase 4 should prepare the XP award logic and add it to the payment logging flow when it exists. Since Phase 5 will build the payment UI, Phase 4 should document that payment log must call `addXP(20)` and defer the actual wiring. However, GAME-01 says "logging payments" earns XP. The planner should note this as a forward-dependency: the payment screen (Phase 5) must include the `addXP(20)` call.
**Warning signs:** GAME-01 appears "incomplete" without payment flow, but it's architecturally correct to defer.

### Pitfall 3: Earnings-Based Badges Without Earnings Tracking
**What goes wrong:** Badges like `first_100`, `earn_500`, `earn_1000` require total earnings data. But there's no `totalEarnings` field in gameStore or any store currently.
**Why it happens:** Earnings aggregation is a Phase 5 concern (EARN-01 through EARN-04). Payments haven't been built yet.
**How to avoid:** Option A: Add a `totalEarnings` field to gameStore that increments when a payment is logged. Option B: Compute earnings from job prices when jobs are marked complete. Since "Earn $100 total" aligns with logging payments (Phase 5), earning-based badges should be checkable but won't fire until Phase 5 payment data exists. The checkBadges function should gracefully handle `totalEarnings: 0` when no earnings data is available yet.
**Warning signs:** Earnings badges never unlock. Solution: track earnings from job completions in Phase 4 (job.price on complete), then Phase 5 can add payment-based tracking.

### Pitfall 4: Confetti Rendering Behind Modal
**What goes wrong:** The confetti animation renders behind the level-up modal content because z-index stacking is wrong.
**Why it happens:** React Native's z-index behavior differs from web. `position: 'absolute'` elements in the same parent stack by render order.
**How to avoid:** Render confetti AFTER the modal content in JSX (later = on top), or use `zIndex` explicitly. The LevelUpModal should render: dark overlay -> level info text -> confetti on top.
**Warning signs:** Confetti particles invisible or clipped.

### Pitfall 5: Streak Not Updating on Non-XP Actions
**What goes wrong:** User adds a client (which awards 15 XP only for the FIRST client) and the streak doesn't update because updateStreak() was only called alongside addXP().
**Why it happens:** The decision says streak increments when user "logs business activity on back-to-back days." Adding ANY client is business activity, not just the first one.
**How to avoid:** Call `updateStreak()` on EVERY business action (add client, complete job, log payment, use tool), regardless of whether XP is awarded. Update streak is about daily activity, not just XP-granting activity.
**Warning signs:** User adds 5 clients on different days, streak shows 1 because only the first client triggered addXP+updateStreak.

### Pitfall 6: subscribeWithSelector Not Added to gameStore
**What goes wrong:** The CelebrationProvider tries to use `useGameStore.subscribe(selector, callback)` but gets a type error because the store wasn't created with `subscribeWithSelector` middleware.
**Why it happens:** Zustand v5 requires explicit middleware opt-in for selector-based subscribe.
**How to avoid:** Wrap gameStore's creation with `subscribeWithSelector` middleware: `persist(subscribeWithSelector(...))` or use the simpler `subscribe(callback)` pattern and do the diffing manually inside the callback.
**Warning signs:** TypeScript error on subscribe with 2 args, or subscribe fires on every state change instead of just level/badge changes.

## Code Examples

### Confetti Cannon Usage
```typescript
// Source: react-native-confetti-cannon GitHub README
import ConfettiCannon from 'react-native-confetti-cannon';

// In LevelUpModal:
<ConfettiCannon
  count={150}
  origin={{ x: -10, y: 0 }}
  explosionSpeed={350}
  fallSpeed={3000}
  fadeOut={true}
  colors={['#B388FF', '#7C4DFF', '#00E676', '#FFD740', '#FF5252', '#40C4FF']}
  autoStart={true}
/>
```

### Haptic Feedback
```typescript
// Source: Expo Haptics official docs
import * as Haptics from 'expo-haptics';

// On level-up or badge unlock:
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

// Available styles: Light, Medium (default), Heavy, Rigid, Soft
// Available notification types: Success, Warning, Error
```

### XP Floating Toast with Animated API
```typescript
// Custom lightweight toast -- no library needed
import { Animated, Text, StyleSheet } from 'react-native';

function XPToast({ amount, visible }: { amount: number; visible: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;

  useEffect(() => {
    if (visible) {
      opacity.setValue(0);
      translateY.setValue(10);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start(() => {
        // Fade out after 1.5s
        setTimeout(() => {
          Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
        }, 1500);
      });
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
      <Text style={styles.toastText}>+{amount} XP</Text>
    </Animated.View>
  );
}
```

### Badge Glow Border Effect
```typescript
// Glow effect using shadow properties on iOS + elevated bgColor on Android
const glowStyle = {
  shadowColor: Colors.secondary,     // Purple glow
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: 12,
  elevation: 8,
  borderWidth: 2,
  borderColor: Colors.secondaryBorder,
};
```

### Zustand Subscribe for Level/Badge Detection
```typescript
// Using plain subscribe (no subscribeWithSelector needed):
useEffect(() => {
  let prevLevel = useGameStore.getState().level;
  let prevBadges = [...useGameStore.getState().earnedBadges];

  const unsub = useGameStore.subscribe((state) => {
    if (state.level > prevLevel) {
      // Level up detected
      queueCelebration({ type: 'level-up', level: state.level });
      prevLevel = state.level;
    }
    if (state.earnedBadges.length > prevBadges.length) {
      const newIds = state.earnedBadges.filter(id => !prevBadges.includes(id));
      newIds.forEach(id => queueCelebration({ type: 'badge', badgeId: id }));
      prevBadges = [...state.earnedBadges];
    }
  });
  return unsub;
}, []);
```

**Note:** This simpler pattern avoids needing `subscribeWithSelector` middleware. It uses closure variables to track previous values and detects changes on every subscribe fire. This is the recommended approach since it requires zero changes to the existing gameStore middleware chain.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Lottie JSON for confetti | react-native-confetti-cannon / Reanimated particles | 2023+ | No need to bundle large Lottie JSON files; programmatic control over particle count/colors |
| setTimeout-based streak | Date comparison in Zustand persist | Project Phase 1 | Already correct -- gameStore compares ISO date strings |
| Global event emitter for celebrations | React Context + Zustand subscribe | 2024+ (Zustand v5) | Type-safe, no global side channels, integrates with React lifecycle |

**Deprecated/outdated:**
- `src/store/storage.ts` legacy file: Still imported by `flyer-generator.tsx` and `name-generator.tsx` (which use the old `addXP` from storage.ts). These will need updating but are Phase 6 screens (marketing tools). Phase 4 should NOT touch those files -- flag as tech debt for Phase 6.

## Open Questions

1. **Earnings-based badge tracking before Phase 5**
   - What we know: Badges `first_100`, `earn_500`, `earn_1000` need total earnings. Payments are Phase 5.
   - What's unclear: Should Phase 4 track earnings from job.price on completion, or wait for Phase 5's payment system?
   - Recommendation: Track earnings from job completion (sum of completed job prices) as a proxy. This makes earnings badges achievable in Phase 4. Phase 5 payment logging can refine the total. Add a computed `totalEarnings` derived from jobsStore at badge-check time rather than storing it separately.

2. **Tool use XP for legacy storage.ts screens**
   - What we know: `flyer-generator.tsx` and `name-generator.tsx` already call the legacy `addXP()` from storage.ts. They award 10 XP and 5 XP respectively.
   - What's unclear: Should Phase 4 update these to use gameStore, or defer to Phase 6?
   - Recommendation: Defer to Phase 6 when those screens get rebuilt. Phase 4's GAME-01 can document the tool XP pattern without touching Phase 6 screens. The "use a tool" XP path will become functional when Phase 6 wires it.

3. **Multiple celebrations on single action**
   - What we know: Completing a job could trigger: +25 XP toast + level-up modal + badge unlock (e.g., "first job" badge). All three could fire simultaneously.
   - What's unclear: Exact queue timing.
   - Recommendation: Queue order: XP toast (non-blocking, shows immediately), then level-up modal (blocks for 3s), then badge sheet (blocks until dismissed). XP toast renders above everything and doesn't block the queue.

## Sources

### Primary (HIGH confidence)
- Existing codebase: `src/store/gameStore.ts`, `src/types/index.ts`, `src/components/XPBar.tsx`, `src/components/BadgeIcon.tsx` -- direct source code review
- [Expo Haptics official docs](https://docs.expo.dev/versions/latest/sdk/haptics/) -- API methods, ImpactFeedbackStyle enum
- [react-native-confetti-cannon GitHub](https://github.com/VincentCATILLON/react-native-confetti-cannon) -- API props, zero dependencies confirmed
- [Zustand GitHub](https://github.com/pmndrs/zustand) -- subscribe API, middleware patterns

### Secondary (MEDIUM confidence)
- [Shopify Arrive confetti engineering blog](https://shopify.engineering/building-arrives-confetti-in-react-native-with-reanimated) -- reanimated-based confetti patterns (used to evaluate build-vs-buy decision)

### Tertiary (LOW confidence)
- react-native-confetti-cannon last published 5 years ago -- may have compatibility quirks with RN 0.83. Fallback: build custom confetti with ~50 Animated.View particles if the library fails to render correctly. LOW risk since it uses only RN's built-in Animated API.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all core dependencies already installed, only one new package (confetti-cannon)
- Architecture: HIGH -- patterns derived from existing codebase patterns (screen-level orchestration, Zustand selectors, Modal with slide animation)
- Pitfalls: HIGH -- identified from direct code analysis of existing gameStore, XP wiring, and cross-store patterns
- Celebration UI: MEDIUM -- confetti-cannon is untested with RN 0.83 specifically, but its pure Animated API approach minimizes risk

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable domain, no fast-moving APIs)
