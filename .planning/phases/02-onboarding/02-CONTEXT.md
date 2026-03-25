# Phase 2: Onboarding - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

First-launch onboarding flow that gates all other screens: welcome → pick hustle type → setup business → land on home tab. Onboarding never re-triggers on subsequent launches. Delivers ONBD-01 through ONBD-05.

</domain>

<decisions>
## Implementation Decisions

### Welcome Screen (ONBD-01)
- Energetic, game-like tone — not corporate or boring
- Large animated emoji composition as hero visual (rocket, money bag, fire, star)
- "HustleHub" title with "Hub" in green (#00E676) accent
- Tagline: "Turn your hustle into a business"
- 3 feature pills below tagline: "Track Jobs", "Earn More", "Level Up"
- Single "Get Started" GradientButton (green gradient) at bottom
- Dark background (#0A0A0F) with subtle glow orbs for depth

### Hustle Type Selection (ONBD-02)
- Title: "What's your hustle?" with game character-class flavor
- 2-column card grid showing all 6 HUSTLE_TYPES from src/types/index.ts
- Each card shows: emoji in circle, name, avg earnings (amber text), difficulty badge (green/amber/red)
- Selected card: green border (#00E676), subtle glow overlay, checkmark badge
- Only 1 selection allowed at a time
- Step indicator dots (1 of 2) at bottom
- "Next" button appears/animates in when selection made

### Business Setup (ONBD-03, ONBD-04, ONBD-05)
- Shows selected hustle type badge at top (emoji + name)
- "Your name" text input with person icon
- "Business name" text input with storefront icon
- Green checkmark appears when input is valid (2+ chars)
- "AI Name Ideas" purple gradient button generates 3 hardcoded name suggestions per hustle type
- 18 total names (3 per type) — e.g., lawn care: "GreenMachine", "MowTown", "Blade Runners"
- Tapping a suggestion auto-fills the business name field
- Live preview card appears when both fields valid — shows business emoji, name, user name, starter stats
- "Launch My Hustle" green gradient button at bottom

### Onboarding Completion
- Creates UserProfile in profileStore with: level 1, 0 XP, 50 starter HustleBucks, isOnboarded: true
- Uses router.replace('/(tabs)') — no back navigation to onboarding possible
- Stack.Protected guard in root layout prevents return to onboarding on subsequent launches
- Profile persists to AsyncStorage via Zustand persist middleware

### Navigation
- Stack layout with no header, dark background, slide-from-right transitions
- 3 screens: index (welcome) → pick-hustle → setup-business
- Pass hustleType as route param from pick-hustle to setup-business

### Claude's Discretion
- Exact animation timing and easing for emoji composition
- Stagger timing for card grid entrance animations
- Exact layout of the preview card
- Input validation error messaging style

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Vision, core value, design aesthetic
- `.planning/REQUIREMENTS.md` — ONBD-01 through ONBD-05 define Phase 2 requirements
- `.planning/research/FEATURES.md` — Onboarding table stakes, "first win within 2-3 screens" guidance
- `.planning/research/PITFALLS.md` — Onboarding back-leak prevention, navigation reset patterns

### Phase 1 Decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` — Zustand stores, StyleSheet API, theme constants, Expo Router patterns

### Design References
- Stake iOS app on Mobbin — dark fintech aesthetic
- "Robinhood meets Duolingo" — pick-hustle should feel like choosing a character class

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/components/GradientButton.tsx` — Green gradient button, 3 sizes, already Phase 1 verified
- `src/components/Card.tsx` — Dark card with border, pressable variant
- `src/components/ScreenHeader.tsx` — Large bold title + subtitle
- `src/store/profileStore.ts` — Has saveProfile, isOnboarded flag, Zustand persist
- `src/types/index.ts` — HUSTLE_TYPES array with all 6 types, HustleType type, UserProfile interface
- `src/constants/theme.ts` — Full color system, spacing, typography

### Existing Onboarding (First Pass)
- `app/onboarding/` — 4 files exist from first build (index, pick-hustle, setup-business, _layout)
- These have the right structure but use deprecated storage.ts imports
- Need refactoring to use Zustand profileStore instead
- Animation patterns and layout can be referenced

### Integration Points
- `app/_layout.tsx` — Stack.Protected guard reads profileStore.isOnboarded
- `src/store/profileStore.ts` — saveProfile action sets isOnboarded: true
- `app/onboarding/_layout.tsx` — Stack layout for onboarding screens

</code_context>

<specifics>
## Specific Ideas

- The pick-hustle screen should feel like choosing a character class in an RPG — exciting, not a form
- Welcome screen needs to feel premium and energetic — not a splash page
- Business name AI suggestions should feel magic/fun — not a dropdown
- The moment of "Launch My Hustle" should feel like a game launch — satisfying transition

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-onboarding*
*Context gathered: 2026-03-24*
