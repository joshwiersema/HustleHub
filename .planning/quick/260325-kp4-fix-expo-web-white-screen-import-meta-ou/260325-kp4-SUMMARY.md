---
phase: quick
plan: 260325-kp4
subsystem: infra
tags: [metro, expo-web, zustand, import-meta, bundler, resolver]

# Dependency graph
requires: []
provides:
  - Metro web resolver configured with react-native condition
  - Expo web preview loads without SyntaxError
affects: [web-preview, expo-web, metro-config]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Metro unstable_conditionsByPlatform for web platform resolution"

key-files:
  created: []
  modified:
    - metro.config.js

key-decisions:
  - "Used Metro resolver conditionsByPlatform instead of babel transform or module script workaround"
  - "Prepended react-native condition before browser for web platform to match CJS builds"

patterns-established:
  - "Metro web condition: always include react-native in web platform conditions for RN-web projects"

requirements-completed: []

# Metrics
duration: 6min
completed: 2026-03-25
---

# Quick Task 260325-kp4: Fix Expo Web White Screen Summary

**Metro resolver fix: added react-native condition to web platform, resolving zustand ESM import.meta SyntaxError**

## Performance

- **Duration:** 6 min
- **Started:** 2026-03-25T20:10:01Z
- **Completed:** 2026-03-25T20:15:35Z
- **Tasks:** 2
- **Files modified:** 1

## Accomplishments
- Fixed the #1 blocker: Expo web white screen caused by `SyntaxError: Cannot use 'import.meta' outside a module`
- Added `react-native` to Metro's `unstable_conditionsByPlatform.web` so zustand (and similar packages) resolve to CJS builds on web
- Verified web bundle compiles successfully at ~4MB (969 modules) with zero `import.meta` in executable code
- Confirmed 3 remaining `import.meta` references are all in JS comments (documentation), not executable code

## Task Commits

Each task was committed atomically:

1. **Task 1: Configure Metro resolver to use react-native condition on web** - `ae647dd` (fix)
2. **Task 2: Verify web bundle compiles clean and app loads** - verification only, no commit needed

## Files Created/Modified
- `metro.config.js` - Added `react-native` to `unstable_conditionsByPlatform.web` resolver config

## Decisions Made
- Used Metro resolver `unstable_conditionsByPlatform` to add `react-native` condition for web platform, rather than alternative approaches like `babel-plugin-transform-import-meta` or custom `web/index.html` with `type="module"`. The resolver fix addresses the root cause at the package resolution level.
- Prepended `react-native` before `browser` in the conditions array, ensuring packages with `react-native` exports (like zustand) resolve to their CJS builds which do not use `import.meta.env`.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered
- Worktree does not have its own `node_modules`, so full Metro bundle verification had to run from the main repo with the fixed config temporarily copied in. Resolution logic was also verified directly via Node.js require() simulation in the worktree.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Web preview should now load without white screen
- The metro.config.js change is compatible with all native platforms (iOS/Android already use react-native condition by default)
- Ready for Phase 8 planned work

## Self-Check: PASSED

- [x] metro.config.js exists with react-native condition
- [x] 260325-kp4-SUMMARY.md created
- [x] Commit ae647dd exists in git log
- [x] Web bundle verified: 4MB, 969 modules, 0 import.meta in executable code

---
*Quick task: 260325-kp4*
*Completed: 2026-03-25*
