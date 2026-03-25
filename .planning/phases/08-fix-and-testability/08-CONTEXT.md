# Phase 8: Fix & Testability - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning
**Mode:** Auto-generated (infrastructure/debugging phase)

<domain>
## Phase Boundary

Root-cause and fix the white screen on web preview. Verify all 5 tab screens load, onboarding completes, navigation works, and Zustand stores hydrate/persist correctly. The app must be testable by the user at http://localhost:8081.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion
All implementation choices are at Claude's discretion — infrastructure/debugging phase. Use ROADMAP success criteria and codebase conventions to guide decisions.

### Known Issues (from prior debugging sessions)
- Bundle compiles and serves correctly (981 modules, 5.6MB dev bundle)
- HTML loads with root div and script tag — server is functional
- expo-font was missing (installed) — required by @expo/vector-icons for Ionicons
- react-native-worklets was missing (installed) — required by react-native-reanimated
- babel.config.js and metro.config.js were missing (created)
- babel-preset-expo was not a dependency (installed as devDependency)
- expo-doctor now passes 17/17 checks
- Node.js v24.14.1 is bleeding edge — may need compatibility workaround
- Expo Go does NOT work with SDK 55 — web preview is the test path
- White screen persists AFTER all these fixes — suggests a runtime JS error in browser

### Diagnostic Strategy
1. Add error boundary at root layout to catch and display React errors
2. Add try-catch around store hydration to surface AsyncStorage issues
3. Check browser console for specific JS errors (may need to add window.onerror handler)
4. Test with a minimal render (no stores, no navigation) to isolate the crash point
5. If React 19 + react-native-web 0.21 has compatibility issues, address those

</decisions>

<code_context>
## Existing Code Insights

### Reusable Assets
- 5 Zustand stores with AsyncStorage persist
- CelebrationProvider wraps root layout
- Expo Router with Stack navigation and tabs layout

### Established Patterns
- useEffect routing guard in _layout.tsx (replaced Stack.Protected for web compat)
- Zustand persist hydration detection via onFinishHydration/hasHydrated
- Screen-level gamification orchestration

### Integration Points
- app/_layout.tsx is the root — all errors here cause white screen
- CelebrationProvider imports LevelUpModal (uses react-native-confetti-cannon)
- react-native-confetti-cannon uses Flow syntax and renderToHardwareTextureAndroid

</code_context>

<specifics>
## Specific Ideas

The white screen is almost certainly a runtime JS error that crashes React before it can render. The error boundary + console capture approach should surface the exact error. react-native-confetti-cannon is a strong suspect — it uses native-only APIs.

</specifics>

<deferred>
## Deferred Ideas

None — debugging phase, staying within scope.

</deferred>
