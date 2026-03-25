# Phase 11: Design System Foundation + Cleanup - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning
**Mode:** Auto-generated (user provided exhaustive specification — autonomous execution)

<domain>
## Phase Boundary

Replace the entire visual foundation of HustleHub with The Outsiders-inspired design language. Update theme.ts with new color palette (red/white/dark), establish typography hierarchy with large hero numbers, replace all emojis with professional @expo/vector-icons throughout the app, remove dead features (name generator, invoice template, rankings/leaderboard), and redesign the bottom tab bar. This phase establishes the base that all subsequent redesign phases build on.

</domain>

<decisions>
## Implementation Decisions

### Color Palette
- Primary action color: #DC2626 (red/crimson) for buttons, accents, active states, highlights
- Text and card surfaces: White (#FFFFFF) on dark backgrounds
- Background hierarchy: #0C0C0F (deepest), #141418 (card backgrounds), #1A1A22 (elevated surfaces)
- Secondary text: #8A8A96 (primary muted), #6B6B78 (secondary muted)
- Success/positive indicators: #22C55E (muted green)
- Error/danger: #EF4444
- No other bright accent colors — tight palette: red, white, dark grays only
- Remove ALL green (#00E676), purple (#B388FF), and amber (#FFD740) from the entire theme

### Typography
- Use system font stack (San Francisco on iOS, Roboto on Android) — no custom fonts
- Hero/display numbers: 40-48px, weight 700-900 (for key stats like total earnings, streak count)
- Section headers: 20-24px, weight 600-700
- Body text: 15-16px, weight 400
- Captions/labels: 12-13px, weight 500, uppercase where appropriate, muted gray color
- Letter spacing: tight (-0.02em) for headlines, normal for body

### Spacing & Layout
- 8px base grid system throughout
- Generous padding: 16-24px horizontal screen padding, 12-16px card internal padding
- Card border radius: 12-16px consistently (no 8px or 9999px extremes)
- Section spacing: 24-32px between major sections
- Touch targets: minimum 44x44 points on all interactive elements

### Icon System
- Use Ionicons as primary icon family from @expo/vector-icons (consistent, not mixed)
- Replace every emoji in the app with an appropriate Ionicons icon
- Hustle type icons: lawn_care → leaf, power_washing → water, dog_walking → paw, tutoring → book, car_detailing → car-sport, snow_removal → snow
- Tab bar icons: Home → home, Jobs → briefcase, Clients → people, Earnings → wallet, Profile → person-circle
- Navigation icons: back → chevron-back, close → close, add → add, more → ellipsis-horizontal

### Feature Removal — Name Generator
- Delete /app/name-generator.tsx entirely
- Remove name generator entry from toolkit grid in /app/toolkit.tsx
- Remove AI name suggestions section from /app/onboarding/setup-business.tsx — keep just the name input fields
- Remove NAMES_BY_TYPE data from types or wherever it's defined
- Remove XP award reference for name generation in gamification utils (generateNames action)

### Feature Removal — Invoice Template
- Remove invoice entry from toolkit grid in /app/toolkit.tsx (currently shows as "Coming Soon")
- Delete any invoice-related route if it exists

### Feature Removal — Rankings/Leaderboard
- Remove leaderboard teaser section from /app/(tabs)/profile.tsx
- Remove any ranking-related data structures or UI

### Bottom Tab Bar
- Clean, minimal design matching The Outsiders aesthetic
- Active tab: red (#DC2626) icon + label
- Inactive tabs: muted gray (#6B6B78) icon + label
- Tab bar background: #0C0C0F with subtle top border (#1A1A22)
- All Ionicons — consistent family, no mixing
- 5 tabs: Home, Jobs, Clients, Earnings, Profile

### Claude's Discretion
- Exact gradient definitions for button backgrounds (red-based gradients)
- Animation/transition timing for tab switching
- Exact shadow/elevation values for cards
- Whether to use LinearGradient or solid colors for specific elements

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- src/constants/theme.ts — central theme file, single point of change for colors/typography/spacing
- src/components/GradientButton.tsx — currently uses green gradient, needs red update
- src/components/Card.tsx — base card component, update colors/radius
- app/(tabs)/_layout.tsx — tab bar configuration, update icons/colors
- expo-linear-gradient already installed for gradient effects

### Established Patterns
- Theme tokens imported from src/constants/theme.ts across all files (colors, spacing, typography)
- Ionicons already partially used alongside emojis — need to make consistent
- LinearGradient from expo-linear-gradient used for button backgrounds
- StyleSheet.create pattern for all component styles
- Platform-specific tab bar height (88px iOS, 64px Android)

### Integration Points
- theme.ts is imported by every screen and component — changing it propagates globally
- Tab bar configured in app/(tabs)/_layout.tsx — single file for all tab config
- Emoji usage scattered across: onboarding screens, hustle type definitions, toolkit, profile, badges, stat cards, empty states
- Name generator referenced in: toolkit.tsx, onboarding/setup-business.tsx, types/index.ts (NAMES_BY_TYPE)
- Invoice referenced in: toolkit.tsx only
- Leaderboard teaser in: profile.tsx only

</code_context>

<specifics>
## Specific Ideas

- Design reference: The Outsiders iOS app on Mobbin — dark athlete tracker with big bold numbers, glass-morphism cards, subtle data visualization
- The user specifically said: "This is NOT a toy app" — professional, serious tone
- Zero emojis in the final product — "literally everywhere"
- Keep the dark theme but refine it with "rich near-blacks" for depth
- "Muted category labels with colored accent dots/icons" from The Outsiders
- "Sophisticated spacing, generous padding, no visual clutter"

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>
