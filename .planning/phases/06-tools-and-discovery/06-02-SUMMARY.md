---
phase: 06-tools-and-discovery
plan: 02
subsystem: ui
tags: [react-native-view-shot, expo-sharing, expo-print, zustand, gamification, flyer-generator, business-card]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Zustand stores (profileStore, gameStore, clientsStore, jobsStore, paymentsStore)
  - phase: 04-gamification-engine
    provides: CelebrationProvider, checkBadges, gamification orchestration pattern
provides:
  - Flyer generator with Zustand profile data, gamification orchestration, and native image sharing
  - Business card generator with Zustand profile data, gamification orchestration, and native image sharing
  - buildFlyerHTML and buildCardHTML PDF fallback helpers
  - View capture pattern (captureRef + collapsable={false}) for reuse in other screens
affects: [06-tools-and-discovery, 07-integration-verification]

# Tech tracking
tech-stack:
  added: [react-native-view-shot, expo-sharing, expo-print]
  patterns: [captureRef image export with PDF fallback, gamification orchestration in tool screens]

key-files:
  created: []
  modified:
    - app/flyer-generator.tsx
    - app/business-card.tsx

key-decisions:
  - "buildFlyerHTML/buildCardHTML placed outside component as pure functions for PDF fallback"
  - "View capture ref wraps full preview content with collapsable={false} for Android compatibility"
  - "Profile populated via useEffect on profile change for business-card (fields are editable), direct selector for flyer-generator"

patterns-established:
  - "View capture pattern: useRef<View> + collapsable={false} + captureRef(ref, {format:'png', quality:1, width:1080/PixelRatio.get()})"
  - "Share fallback pattern: try captureRef -> shareAsync PNG, catch -> printToFileAsync HTML -> shareAsync PDF, catch -> Alert"
  - "Tool screen gamification: if (!xpAwarded) { addXP + updateStreak + checkBadges + earnBadge + showXPToast + setXpAwarded(true) }"

requirements-completed: [TOOL-02, TOOL-03, TOOL-06]

# Metrics
duration: 2min
completed: 2026-03-25
---

# Phase 6 Plan 2: Flyer & Business Card Generator Summary

**Flyer and business card generators refactored to Zustand with native image sharing via view-shot, PDF fallback via expo-print, and full gamification orchestration**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-25T04:36:42Z
- **Completed:** 2026-03-25T04:39:13Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Flyer generator migrated from storage.ts to Zustand profileStore with synchronous selector
- Business card generator migrated from storage.ts to Zustand profileStore with useEffect-based field population
- Both screens implement real native sharing via react-native-view-shot captureRef + expo-sharing
- Both screens have expo-print HTML-to-PDF fallback when image capture fails
- Both screens award 10 XP with full gamification orchestration (addXP, updateStreak, checkBadges, earnBadge, showXPToast)
- Zero storage.ts imports remain in either file

## Task Commits

Each task was committed atomically:

1. **Task 1: Refactor flyer-generator.tsx** - `55de1c0` (feat)
2. **Task 2: Refactor business-card.tsx** - `5c7578a` (feat)

## Files Created/Modified
- `app/flyer-generator.tsx` - Flyer generator with Zustand, gamification, captureRef sharing, and PDF fallback
- `app/business-card.tsx` - Business card generator with Zustand, gamification, captureRef sharing, and PDF fallback

## Decisions Made
- buildFlyerHTML and buildCardHTML placed outside component as pure functions for PDF fallback -- keeps component clean and functions testable
- View capture ref wraps full preview content (not individual templates) with collapsable={false} for Android compatibility
- Business card uses useEffect to populate editable fields when profile changes, while flyer generator reads profile directly since fields are not editable

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
None

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Both tool screens now have working native sharing and gamification
- View capture pattern established for reuse in any future screens needing image export
- Ready for 06-03 (toolkit hub and remaining tool screens)

## Self-Check: PASSED

All files exist, all commits verified.

---
*Phase: 06-tools-and-discovery*
*Completed: 2026-03-25*
