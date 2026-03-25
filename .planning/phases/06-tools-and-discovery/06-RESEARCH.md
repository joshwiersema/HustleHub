# Phase 6: Tools and Discovery - Research

**Researched:** 2026-03-24
**Domain:** Storage migration (storage.ts -> Zustand), view capture/sharing (expo-sharing + react-native-view-shot/expo-print), gamification orchestration, business ideas browser
**Confidence:** HIGH

## Summary

Phase 6 is a **refactor-and-wire phase**, not a build-from-scratch phase. All 6 screens (toolkit, flyer generator, business card, name generator, pricing calculator, ideas) already exist with functional UI and business logic. The work is threefold: (1) replace all `storage.ts` imports with Zustand store hooks, (2) wire gamification orchestration (addXP + updateStreak + checkBadges + showXPToast) at the screen level following the established Phase 4/5 pattern, and (3) implement real share/export for flyers and business cards via `react-native-view-shot` + `expo-sharing`, with `expo-print` (HTML-to-PDF) as fallback.

The project already has `expo-sharing@55.0.14` installed. `react-native-view-shot` is NOT currently installed and must be added. `expo-print` is NOT currently installed and must be added as fallback. The gamification orchestration pattern is well-established across 4 screens (clients, jobs, earnings, job-detail) and must be replicated identically on each tool screen.

**Primary recommendation:** Treat each screen as an isolated refactor task -- swap storage imports to Zustand hooks, add gamification orchestration with session-scoped XP gating (useState flag), and implement view-shot sharing for flyer/card screens. The toolkit screen and home screen quick action route are trivial wiring tasks.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions
- Toolkit Screen (TOOL-01): Refactor `app/toolkit.tsx` imports from storage.ts to Zustand profileStore. Keep existing TOOLS array and card grid layout. Update navigation routes. Wire "Toolkit" quick action on Home screen to router.push('/toolkit').
- Flyer Generator (TOOL-02, TOOL-06): Refactor `app/flyer-generator.tsx` from storage.ts to Zustand profileStore. Add sharing via expo-sharing + react-native-view-shot (capture flyer View as image, then share). Fallback to expo-print (HTML to PDF share) if view-shot has Expo Go issues. Award 10 XP on first generation per session. Full gamification orchestration: addXP(10) + updateStreak + checkBadges + showXPToast.
- Business Card Generator (TOOL-03, TOOL-06): Refactor `app/business-card.tsx` from storage.ts to Zustand profileStore. Same sharing approach as flyer generator. Award 10 XP on first generation. Same gamification orchestration pattern.
- Name Generator (TOOL-04): Refactor `app/name-generator.tsx` from storage.ts to Zustand profileStore. Keep hardcoded name suggestions. Award 10 XP on name generation. Same gamification orchestration pattern.
- Pricing Calculator (TOOL-05): Refactor `app/pricing-calculator.tsx` from storage.ts to Zustand profileStore. Keep existing calculation logic. Award 10 XP on first calculation per session. Same gamification orchestration pattern.
- Business Ideas Browser (IDEA-01, IDEA-02, IDEA-03): Refactor `app/ideas.tsx` from storage.ts to Zustand profileStore. Add "Switch to this hustle" button that updates profileStore.hustleType. Award 10 XP on first expansion per session.
- Cross-Cutting Storage Migration: Replace ALL storage.ts imports with Zustand store hooks. `getProfile()` -> `useProfileStore((s) => s.profile)`. `addXP()` from storage.ts -> full gamification orchestration. Ensure all screens use SafeAreaView, ScreenHeader, and theme constants consistently.

### Claude's Discretion
- Exact view-shot capture implementation details
- Share sheet presentation options
- XP "first generation per session" tracking mechanism (simple useState flag)
- Any animation or layout refinements to existing screens

### Deferred Ideas (OUT OF SCOPE)
- AI-powered name generation -- v2, keep hardcoded suggestions for v1
- Website builder tool -- out of scope per PROJECT.md
- Invoice generator -- v2 advanced tool
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| TOOL-01 | User can access a toolkit screen with available business tools | Toolkit screen already exists (338 lines). Needs only storage migration and route wiring. No new packages needed. |
| TOOL-02 | User can generate a flyer from 4 template styles populated with their business info | Flyer generator already exists (593 lines) with 4 templates. Needs storage migration to Zustand profileStore + gamification wiring. |
| TOOL-03 | User can generate a business card from 3 style options with their business info | Business card screen already exists (515 lines) with 3 styles. Needs storage migration + gamification wiring. |
| TOOL-04 | User can generate business name suggestions from a curated word bank per hustle type | Name generator already exists (474 lines) with per-hustle-type names. Needs storage migration + gamification wiring (fix XP from 5 to 10). |
| TOOL-05 | User can calculate pricing with inputs for time, cost, rate, and jobs/week | Pricing calculator already exists (576 lines). Needs storage migration + gamification wiring. |
| TOOL-06 | User can share/export generated flyers and business cards | Requires react-native-view-shot (new install) + expo-sharing (already installed). Fallback: expo-print for HTML-to-PDF. |
| IDEA-01 | User can browse all 6 hustle types with startup cost, earning potential, and difficulty | Ideas screen already exists (666 lines) with all 6 types, stats row showing avgEarnings, startupCost, difficulty. Needs storage migration. |
| IDEA-02 | User can expand a hustle type to see getting-started checklist, pro tips, and equipment needed | Already implemented in ideas.tsx with expandable accordion (LayoutAnimation) showing checklist, tips, and equipment grid. Needs storage migration only. |
| IDEA-03 | User can switch their hustle type from the ideas screen | Already implemented in ideas.tsx with handleStartHustle function. Needs migration from storage.ts updateProfile to profileStore.updateProfile. |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Status |
|---------|---------|---------|--------|
| zustand | 5.0.12 | State management (profileStore, gameStore) | Installed -- migration target |
| expo-sharing | 55.0.14 | Share files via native share sheet | Installed -- used for flyer/card export |
| expo-linear-gradient | 55.0.9 | Gradient backgrounds on flyer/card templates | Installed -- already in use |
| react-native-reanimated | 4.2.3 | Animations | Installed -- available for transitions |

### New Install Required
| Library | Version | Purpose | Install Command |
|---------|---------|---------|-----------------|
| react-native-view-shot | latest | Capture React Native views as images | `npx expo install react-native-view-shot` |
| expo-print | ~55.x | HTML-to-PDF fallback for share/export | `npx expo install expo-print` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-native-view-shot | expo-print only (HTML-to-PDF) | PDF-only output, no image sharing; heavier implementation |
| expo-sharing | expo-media-library (save to gallery) | Save-only, no share sheet; expo-sharing already installed |

**Installation:**
```bash
npx expo install react-native-view-shot expo-print
```

## Architecture Patterns

### Storage Migration Pattern (Repeatable Across All 6 Screens)

Each screen follows the identical migration pattern:

**Before (deprecated):**
```typescript
import { getProfile, addXP } from '../src/store/storage';

// In component:
const [profile, setProfile] = useState<UserProfile | null>(null);
useEffect(() => { loadProfile(); }, []);
const loadProfile = async () => {
  const p = await getProfile();
  setProfile(p);
};
```

**After (Zustand):**
```typescript
import { useProfileStore } from '../src/store/profileStore';
import { useGameStore } from '../src/store/gameStore';
import { useCelebration } from '../src/components/CelebrationProvider';
import { checkBadges } from '../src/utils/gamification';

// In component:
const profile = useProfileStore((s) => s.profile);
const businessName = profile?.businessName ?? 'My Business';
const hustleType = profile?.hustleType ?? 'lawn_care';
// No useState, no useEffect, no async loading -- Zustand is synchronous
```

### Gamification Orchestration Pattern (Established in Phase 4/5)

This exact pattern is used in `clients.tsx`, `jobs.tsx`, `earnings.tsx`, and `job-detail.tsx`. Replicate it identically:

```typescript
import { useGameStore } from '../src/store/gameStore';
import { useClientsStore } from '../src/store/clientsStore';
import { useJobsStore } from '../src/store/jobsStore';
import { usePaymentsStore } from '../src/store/paymentsStore';
import { useCelebration } from '../src/components/CelebrationProvider';
import { checkBadges } from '../src/utils/gamification';

// In component:
const { showXPToast } = useCelebration();
const [xpAwarded, setXpAwarded] = useState(false); // Session gate

const handleToolAction = () => {
  // ... tool-specific logic ...

  // Gamification orchestration (only first use per session)
  if (!xpAwarded) {
    const gs = useGameStore.getState();

    // 1. Award XP
    gs.addXP(10);

    // 2. Update streak
    gs.updateStreak();

    // 3. Check and award badges
    const clients = useClientsStore.getState().clients;
    const jobs = useJobsStore.getState().jobs;
    const payments = usePaymentsStore.getState().payments;
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    const completedJobs = jobs.filter((j) => j.status === 'completed').length;

    const newBadges = checkBadges(
      { earnedBadges: gs.earnedBadges, streak: gs.streak },
      { totalClients: clients.length, completedJobs, totalEarnings }
    );
    newBadges.forEach((id) => useGameStore.getState().earnBadge(id));

    // 4. Show XP toast
    showXPToast(10);

    setXpAwarded(true);
  }
};
```

**Key insight:** Gamification orchestration happens at the screen level (not in stores) to avoid cross-store coupling. This is the established pattern from Phase 3/4/5.

### View Capture + Share Pattern (For Flyer & Business Card)

```typescript
import { useRef } from 'react';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';
import { PixelRatio, View } from 'react-native';

// In component:
const flyerRef = useRef<View>(null);

const handleShare = async () => {
  // Gamification (first use per session)
  if (!xpAwarded) {
    // ... orchestration pattern above ...
  }

  try {
    // Attempt view-shot capture
    const uri = await captureRef(flyerRef, {
      format: 'png',
      quality: 1,
      // Target ~1080px for social sharing
      width: 1080 / PixelRatio.get(),
    });

    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share your flyer',
    });
  } catch (error) {
    // Fallback to expo-print HTML-to-PDF
    try {
      const { uri } = await Print.printToFileAsync({
        html: buildFlyerHTML(profile, selectedTemplate),
      });
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share your flyer',
      });
    } catch {
      Alert.alert('Share Error', 'Unable to share at this time.');
    }
  }
};

// Wrap the flyer preview in a ref-able View:
<View ref={flyerRef} collapsable={false}>
  {renderFlyerBackground(selectedTemplate, false, renderFlyerContent(selectedTemplate, false))}
</View>
```

**Critical:** The `collapsable={false}` prop is required on Android to prevent the View from being optimized away, which would cause captureRef to fail.

### Profile Update Pattern (For Ideas Screen Hustle Switch)

```typescript
// Before (storage.ts):
await updateProfile({ hustleType: hustle.id });

// After (Zustand -- synchronous):
const updateProfile = useProfileStore((s) => s.updateProfile);
updateProfile({ hustleType: hustle.id });
// No try/catch needed -- Zustand set() is synchronous
```

### Anti-Patterns to Avoid
- **Async profile loading with useState:** Zustand stores are synchronous after hydration. Do NOT use `useState + useEffect + async getProfile()`. Use `useProfileStore((s) => s.profile)` directly.
- **Calling storage.ts addXP:** The old `addXP()` from storage.ts only updates XP on the profile object. The Zustand gameStore.addXP() is the correct replacement, and it must be accompanied by updateStreak + checkBadges + showXPToast.
- **Cross-store coupling in stores:** Never call one store's actions from inside another store. Orchestration always happens at the screen level.
- **Forgetting collapsable={false}:** On Android, Views without native children can be "collapsed" (optimized away). captureRef needs a real native view, so always set `collapsable={false}` on the capture target.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| View-to-image capture | Manual canvas/bitmap export | react-native-view-shot (captureRef) | Handles pixel ratio, format, quality, cross-platform |
| File sharing | Custom Intent/Activity | expo-sharing (shareAsync) | Already installed, handles iOS/Android share sheets |
| HTML-to-PDF | Custom WebView rendering | expo-print (printToFileAsync) | Official Expo module, handles page sizing |
| XP/badge/streak orchestration | Custom orchestrator function | Inline pattern at screen level | Established project convention since Phase 3 |

**Key insight:** The sharing stack (view-shot -> image file -> share sheet) is a 3-line operation with the right libraries. Building custom share flows would require dealing with platform-specific Intent/Activity code.

## Common Pitfalls

### Pitfall 1: Forgetting to Remove All storage.ts Imports
**What goes wrong:** Screen imports both Zustand stores AND storage.ts functions, causing dual writes or stale data.
**Why it happens:** storage.ts has many exports (getProfile, addXP, updateProfile) and it's easy to miss one during migration.
**How to avoid:** After migrating each screen, run a grep for `from.*storage` across the `app/` directory. After Phase 6 is complete, storage.ts should have ZERO active consumers.
**Warning signs:** Any import from `../src/store/storage` remaining in app/ files.

### Pitfall 2: Async Patterns Where Zustand Is Synchronous
**What goes wrong:** Using `useState + useEffect + async loadProfile()` when the profile is already in Zustand.
**Why it happens:** The existing screens were written for AsyncStorage, which required async loading. Zustand persist hydrates once at app startup -- by the time tool screens load, data is already available synchronously.
**How to avoid:** Replace async loading entirely with direct Zustand selectors: `const profile = useProfileStore((s) => s.profile)`.
**Warning signs:** `useState<UserProfile | null>(null)` and `loadProfile` functions in tool screens.

### Pitfall 3: XP Awarded Without Full Orchestration
**What goes wrong:** Only calling `addXP()` without `updateStreak()` + `checkBadges()` + `showXPToast()`.
**Why it happens:** The old storage.ts `addXP()` was a single function. The new pattern requires 4 calls.
**How to avoid:** Copy the exact orchestration pattern from `earnings.tsx` or `clients.tsx`. All 4 calls are required.
**Warning signs:** `addXP` called but no `updateStreak` or `checkBadges` nearby.

### Pitfall 4: captureRef Fails on Android (collapsable)
**What goes wrong:** `captureRef` returns a blank/empty image or throws an error on Android.
**Why it happens:** React Native Android optimizes away View nodes that have no direct native children.
**How to avoid:** Always add `collapsable={false}` to the View wrapping the capture target.
**Warning signs:** Sharing works on iOS but fails or produces blank images on Android.

### Pitfall 5: Name Generator XP Amount Mismatch
**What goes wrong:** Name generator awards 5 XP (old value) instead of 10 XP (CONTEXT.md value).
**Why it happens:** The existing `name-generator.tsx` has `addXP(5)` hardcoded from the pre-GSD implementation.
**How to avoid:** Update to 10 XP per CONTEXT.md which says "Award 10 XP when user generates names."
**Warning signs:** Inconsistent XP awards across tool screens.

### Pitfall 6: Toolkit TOOLS Array Has Out-of-Scope Items
**What goes wrong:** "Logo Ideas" and "Invoice Template" cards navigate to non-existent screens.
**Why it happens:** The existing toolkit.tsx has 6 tools including v2 items (Logo Ideas, Invoice Template).
**How to avoid:** Remove "Logo Ideas" route (no screen exists, not in requirements). Keep "Invoice Template" as `comingSoon: true` (already marked). Or replace Logo Ideas with a link to the Ideas browser.
**Warning signs:** Crash on navigating to `/logo-ideas` which has no screen file.

## Code Examples

### Example 1: Complete Flyer Generator Storage Migration + Gamification

```typescript
// Key imports to ADD:
import { useProfileStore } from '../src/store/profileStore';
import { useGameStore } from '../src/store/gameStore';
import { useClientsStore } from '../src/store/clientsStore';
import { useJobsStore } from '../src/store/jobsStore';
import { usePaymentsStore } from '../src/store/paymentsStore';
import { useCelebration } from '../src/components/CelebrationProvider';
import { checkBadges } from '../src/utils/gamification';

// Key import to REMOVE:
// import { getProfile, addXP } from '../src/store/storage';

// In component -- REPLACE async loading:
const profile = useProfileStore((s) => s.profile);
const { showXPToast } = useCelebration();
const [xpAwarded, setXpAwarded] = useState(false);

// REMOVE: const [profile, setProfile] = useState(null);
// REMOVE: useEffect(() => { loadProfile(); }, []);
// REMOVE: const loadProfile = async () => { ... };

const hustleType = profile?.hustleType ?? 'lawn_care';
const businessName = profile?.businessName ?? 'My Business';
```

### Example 2: Ideas Screen Hustle Switch Migration

```typescript
// Before:
import { getProfile, updateProfile } from '../src/store/storage';

const loadCurrentHustle = async () => {
  const p = await getProfile();
  if (p) setCurrentHustleType(p.hustleType);
};

// After:
import { useProfileStore } from '../src/store/profileStore';

// Direct selector -- no local state needed:
const currentHustleType = useProfileStore((s) => s.profile?.hustleType ?? null);
const updateProfile = useProfileStore((s) => s.updateProfile);

// In handleStartHustle:
updateProfile({ hustleType: hustle.id });
// Zustand triggers re-render automatically -- currentHustleType updates
```

### Example 3: Home Screen Quick Action Route Fix

```typescript
// Before (Phase 5 placeholder):
const QUICK_ACTIONS = [
  // ...
  { icon: 'construct-outline', label: 'Toolkit', route: '/(tabs)/earnings' },
];

// After:
const QUICK_ACTIONS = [
  // ...
  { icon: 'construct-outline', label: 'Toolkit', route: '/toolkit' },
];
```

### Example 4: expo-print HTML Fallback for Flyer

```typescript
function buildFlyerHTML(profile: UserProfile | null, templateId: string): string {
  const businessName = profile?.businessName ?? 'My Business';
  const hustleType = profile?.hustleType ?? 'lawn_care';
  // Build HTML string with inline styles matching the template
  return `
    <html>
      <body style="margin:0; padding:40px; font-family:system-ui; background:${templateId === 'classic' ? '#fff' : '#1A1A2E'}; color:${templateId === 'classic' ? '#111' : '#fff'};">
        <h1 style="text-align:center;">${businessName}</h1>
        <!-- ... rest of flyer content ... -->
      </body>
    </html>
  `;
}
```

## State of the Art

| Old Approach (in existing screens) | Current Approach (Phase 6 migration) | Impact |
|------------------------------------|--------------------------------------|--------|
| `getProfile()` async from storage.ts | `useProfileStore((s) => s.profile)` sync | Eliminates loading states, no useEffect needed |
| `addXP(n)` from storage.ts (XP only) | Full gamification orchestration (4 calls) | Streak, badges, and XP toast all work |
| `Alert.alert('Sharing Coming Soon!')` | `captureRef + Sharing.shareAsync` | Real sharing via native share sheet |
| `useState<UserProfile | null>(null)` | Direct Zustand selector | No null-state flicker, simpler code |
| `updateProfile({...})` async from storage.ts | `useProfileStore.getState().updateProfile({...})` sync | No try/catch needed, auto re-render |

**Deprecated/outdated:**
- `src/store/storage.ts`: After Phase 6, this file should have ZERO active consumers. It can be deleted or marked deprecated. All 5 remaining consumer screens are in Phase 6 scope.

## Open Questions

1. **Logo Ideas Tool Card**
   - What we know: Toolkit screen has a "Logo Ideas" card with route `/logo-ideas`, but no screen file exists and it's not in requirements.
   - What's unclear: Should it be removed entirely, replaced with Ideas browser link, or kept with comingSoon flag?
   - Recommendation: Remove it from the TOOLS array or mark as `comingSoon: true`. It's not in v1 requirements.

2. **react-native-view-shot in Expo Go**
   - What we know: The CONTEXT.md mentions possible Expo Go issues with react-native-view-shot. Expo docs list it as a supported library.
   - What's unclear: Whether SDK 55 has resolved any prior Expo Go compatibility issues.
   - Recommendation: Install and test. The expo-print fallback is already planned as a safety net.

## Sources

### Primary (HIGH confidence)
- [Expo Sharing docs](https://docs.expo.dev/versions/latest/sdk/sharing/) - shareAsync API, parameters, limitations
- [Expo Print docs](https://docs.expo.dev/versions/latest/sdk/print/) - printToFileAsync API, HTML-to-PDF
- [Expo captureRef docs](https://docs.expo.dev/versions/latest/sdk/captureRef/) - react-native-view-shot usage with Expo
- Codebase analysis: all 6 existing screen files, 5 Zustand stores, gamification utils, CelebrationProvider

### Secondary (MEDIUM confidence)
- [Medium tutorial (Feb 2026)](https://medium.com/@mohammadakilshakirhusain/how-to-capture-share-screenshots-in-react-native-using-viewshot-expo-sharing-d440dcffc7da) - ViewShot + expo-sharing integration pattern
- [expo-print guide (Jan 2026)](https://anytechie.medium.com/how-to-use-expo-print-complete-guide-to-printing-in-react-native-apps-173fa435dadf) - printToFileAsync usage

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - all libraries verified in Expo SDK 55 docs, expo-sharing already installed
- Architecture: HIGH - storage migration and gamification patterns established in 4+ screens across Phases 3-5
- Pitfalls: HIGH - all identified from actual code inspection of existing screens and established project patterns

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable -- refactor phase with established patterns)
