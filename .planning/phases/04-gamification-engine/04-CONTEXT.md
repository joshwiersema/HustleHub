# Phase 4: Gamification Engine - Context

**Gathered:** 2026-03-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Every meaningful business action automatically awards XP and HustleBucks, levels are earned over a modeled 3-6 month arc, badges unlock with celebration animations, and the game layer is visually prominent throughout the app. Delivers GAME-01 through GAME-07.

</domain>

<decisions>
## Implementation Decisions

### XP Economy & Balancing
- Log a payment awards 20 XP (proportional to job complete at 25 XP)
- Use a tool awards 10 XP (encourages exploration without inflating economy)
- Keep existing LEVELS XP curve (0→10000 over 10 levels) — models to ~4-5 months active use to reach level 8-9, CEO is aspirational
- Badge criteria evaluated on every XP-granting action — check all unearned badges after addXP/updateStreak calls for immediate unlock

### Celebration & Feedback Design
- Level-up: full-screen modal overlay with confetti burst, new level title + emoji icon, auto-dismiss after 3s or tap to dismiss
- Badge unlock: bottom sheet slide-up showing badge emoji large, name, description, "Nice!" dismiss button, haptic feedback
- XP gain: floating "+25 XP" toast appears near XP bar, fades after 1.5s, purple accent color
- Haptic feedback: medium impact on badge unlock and level-up via expo-haptics

### Badge Gallery Layout
- Badge gallery is a dedicated section on Profile tab (scrollable grid within profile, not a separate screen)
- 2-column grid, 5 rows — earned badges are vibrant with glow border, locked are dimmed with lock visual
- Tap a badge to expand inline showing name, description, requirement, and progress toward it
- Locked badges show progress indicators ("3/5 clients" style) to motivate users

### Gamification Integration Points
- XP bar displays on Home tab (prominent) and Profile tab (detailed view)
- Streak counter on Home tab as a "🔥 5 day streak" badge — small, visible, motivating
- HustleBucks balance on Home tab next to XP bar area with amber accent, visible but secondary to XP
- No retroactive badge earning — badge checks start when the engine is built, clean start

### Claude's Discretion
- Exact confetti animation implementation (particle count, colors, duration)
- Bottom sheet slide-up animation timing and spring physics
- Toast positioning and fade animation easing
- Badge glow border effect implementation
- Exact layout proportions of gamification widgets on Home tab

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/store/gameStore.ts` — Full game state: addXP (with level calc + HustleBucks at 50%), updateStreak, earnBadge, reset. Persists to AsyncStorage.
- `src/components/XPBar.tsx` — Animated purple gradient progress bar with level badge, title, XP counts
- `src/components/BadgeIcon.tsx` — Badge circle with emoji, supports unlocked/locked states with opacity
- `src/components/HustleBucksDisplay.tsx` — HustleBucks balance display component
- `src/components/StatCard.tsx` — Reusable stat display card
- `src/types/index.ts` — LEVELS (10 levels with XP thresholds), BADGES (10 badges with requirements), Badge/LevelInfo types

### Established Patterns
- Zustand stores with AsyncStorage persist for all state management
- StyleSheet API with centralized theme constants (Colors, Spacing, etc.)
- expo-linear-gradient for gradient effects (purple for XP, green for actions)
- Ionicons from @expo/vector-icons for all icons
- Card-based layouts with dark background (#141419), borders (#2A2A35), 12px radius

### Integration Points
- `src/store/gameStore.ts` — addXP already called from job complete (25 XP) and client add (15 XP) in Phase 3
- `app/(tabs)/index.tsx` — Home tab where XP bar, streak, HustleBucks will display
- `app/(tabs)/profile.tsx` — Profile tab where badge gallery and detailed stats will live
- `src/store/clientsStore.ts` and `src/store/jobsStore.ts` — Need to hook badge checking into existing actions

</code_context>

<specifics>
## Specific Ideas

- The level-up moment should feel like a real achievement — confetti, big number, satisfying haptic
- Badge gallery should feel like a trophy case — earned badges glowing, locked ones teasing you to unlock them
- The streak counter should create daily FOMO — "don't break the streak" motivation like Duolingo
- XP toast should be quick and non-blocking — reward acknowledgment without interrupting workflow
- Everything should reinforce the "Robinhood meets Duolingo" aesthetic — clean data + game feel

</specifics>

<deferred>
## Deferred Ideas

- HustleBucks shop (cosmetic items) — v2 feature per REQUIREMENTS.md
- Social leaderboards — v2, requires backend
- Push notification for streak about to break — v2 notification system

</deferred>

---

*Phase: 04-gamification-engine*
*Context gathered: 2026-03-24*
