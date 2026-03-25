# Phase 6: Tools and Discovery - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Marketing toolkit (flyer generator, business card generator, pricing calculator, name generator) and business ideas browser — tools are functional, shareable, and award XP. Delivers TOOL-01 through TOOL-06, IDEA-01 through IDEA-03. Refactors existing first-pass screens from deprecated storage.ts to Zustand stores with gamification integration.

</domain>

<decisions>
## Implementation Decisions

### Toolkit Screen (TOOL-01)
- Existing `app/toolkit.tsx` (338 lines) has working 2-column grid of tool cards — refactor imports from storage.ts to Zustand profileStore
- Keep the existing TOOLS array and card grid layout — already well-designed
- Update navigation routes to ensure all tool screens load correctly
- Wire "Toolkit" quick action on Home screen to router.push('/toolkit') (currently points to earnings tab as Phase 5 placeholder)

### Flyer Generator (TOOL-02, TOOL-06)
- Existing `app/flyer-generator.tsx` (593 lines) has 4 template styles with business info auto-population — refactor from storage.ts to Zustand profileStore
- Templates already use business name, hustle type, and contact info from profile
- Add sharing via expo-sharing + react-native-view-shot — capture flyer View as image, then share
- If react-native-view-shot has Expo Go issues, fallback to expo-print (HTML to PDF share)
- Award 10 XP when user generates a flyer (first generation per session, not on every preview toggle)
- Full gamification orchestration: addXP(10) + updateStreak + checkBadges + showXPToast

### Business Card Generator (TOOL-03, TOOL-06)
- Existing `app/business-card.tsx` (515 lines) has 3 style options with auto-populated business info — refactor from storage.ts to Zustand profileStore
- Same sharing approach as flyer generator (view-shot + expo-sharing or expo-print fallback)
- Award 10 XP when user generates a card
- Same gamification orchestration pattern

### Name Generator (TOOL-04)
- Existing `app/name-generator.tsx` (474 lines) has curated word bank per hustle type — refactor from storage.ts to Zustand profileStore
- Keep hardcoded name suggestions (not AI-generated) — already working well
- Award 10 XP when user generates names
- Same gamification orchestration pattern

### Pricing Calculator (TOOL-05)
- Existing `app/pricing-calculator.tsx` (576 lines) has time/cost/rate/jobs-per-week inputs with earnings projection — refactor from storage.ts to Zustand profileStore
- Keep existing calculation logic
- Award 10 XP when user calculates (first calculation per session)
- Same gamification orchestration pattern

### Business Ideas Browser (IDEA-01, IDEA-02, IDEA-03)
- Existing `app/ideas.tsx` (666 lines) shows all 6 hustle types with details — refactor from storage.ts to Zustand profileStore
- Each type expands to show getting-started checklist, pro tips, and equipment list
- Add "Switch to this hustle" button that updates profileStore.hustleType (IDEA-03)
- Award 10 XP when user browses ideas (first expansion per session)

### Cross-Cutting: Storage Migration
- All 6 screens import from `src/store/storage.ts` (deprecated) — replace ALL imports with Zustand store hooks
- `getProfile()` → `useProfileStore((s) => s.profile)`
- `addXP()` from storage.ts → full gamification orchestration (addXP + updateStreak + checkBadges + showXPToast via useCelebration)
- Ensure all screens use SafeAreaView, ScreenHeader, and theme constants consistently

### Claude's Discretion
- Exact view-shot capture implementation details
- Share sheet presentation options
- XP "first generation per session" tracking mechanism (simple useState flag)
- Any animation or layout refinements to existing screens

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets (First-Pass Screens)
- `app/toolkit.tsx` (338 lines) — 2-column tool grid, navigation to tool screens
- `app/flyer-generator.tsx` (593 lines) — 4 template styles, preview, business info population
- `app/business-card.tsx` (515 lines) — 3 style options, preview cards
- `app/pricing-calculator.tsx` (576 lines) — Input fields, earnings projection calculation
- `app/name-generator.tsx` (474 lines) — Per-hustle-type name suggestions
- `app/ideas.tsx` (666 lines) — 6 hustle types with expandable details

### Zustand Store APIs
- `useProfileStore` — profile with businessName, name, hustleType
- `useGameStore` — addXP, updateStreak, earnBadge
- `useCelebration()` — showXPToast from CelebrationProvider
- `checkBadges()` from src/utils/gamification.ts

### Integration Points
- `app/(tabs)/index.tsx` — Quick action "Toolkit" button needs route update from earnings to /toolkit
- `src/store/storage.ts` — Deprecated module being replaced; after Phase 6 it should have zero active consumers
- `app/_layout.tsx` — Root Stack already includes toolkit and tool screen routes

</code_context>

<specifics>
## Specific Ideas

- These are mostly refactors of working screens — preserve existing visual design, just swap storage layer
- The flyer/card export should feel premium — "share your hustle" moment
- Each tool use earning XP reinforces the gamification loop — tools aren't just utilities, they're progress
- Business ideas browser is a discovery/inspiration feature — should feel browseable and aspirational

</specifics>

<deferred>
## Deferred Ideas

- AI-powered name generation — v2, keep hardcoded suggestions for v1
- Website builder tool — out of scope per PROJECT.md
- Invoice generator — v2 advanced tool

</deferred>

---

*Phase: 06-tools-and-discovery*
*Context gathered: 2026-03-25*
