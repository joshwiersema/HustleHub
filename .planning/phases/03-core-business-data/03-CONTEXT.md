# Phase 3: Core Business Data - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Full client and job management — add, view, edit, delete clients and jobs (including recurring). This is the primary daily operational workflow. Delivers CLNT-01 through CLNT-05 and JOBS-01 through JOBS-07.

</domain>

<decisions>
## Implementation Decisions

### Client List (CLNT-01 through CLNT-05)
- Scrollable FlatList with client cards showing: avatar circle (first letter of name), name, phone, truncated address
- Search bar at top — filters by name, phone, email, address
- Tap client card to expand inline showing full details (phone, email, address, notes)
- Expanded state shows Edit and Delete action buttons
- FAB (floating action button) green gradient circle, bottom-right, opens add modal
- Add/Edit modal: full-screen Modal with name (required), phone, email, address, notes inputs
- Delete: Alert confirmation before removing
- Award 15 XP when first client added (via gameStore.addXP)
- Empty state: EmptyState component with "No clients yet" message and "Add Client" action

### Job Scheduling (JOBS-01 through JOBS-07)
- Jobs screen has tab filter bar: "Upcoming" | "Completed" | "All"
- Job cards show: title, client name, date/time, duration, price (bold green), status badge
- Status badge colors: upcoming = blue (#40C4FF), completed = green (#00E676), cancelled = red (#FF5252)
- FAB opens add-job modal
- Add Job modal fields: client picker (dropdown from existing clients), job title, date (TextInput MM/DD/YYYY), time, duration selector (30min/1hr/1.5hr/2hr as pill buttons), price, address, recurring toggle with frequency, notes
- Duration pills: horizontal row, active = green border
- Upcoming jobs sorted by nearest date first
- Mark job complete: inline button on job card OR from detail screen. Awards 25 XP.
- Empty state when no jobs

### Recurring Jobs (JOBS-04)
- Simple approach: when creating a recurring job, store the recurrence info on the Job record
- When a recurring job is marked complete, auto-generate the next occurrence (same time, next week/biweek/month)
- Frequency options: weekly, biweekly, monthly
- Recurring badge/icon shown on job cards
- New instances inherit all fields except date (shifted forward)

### Job Detail Screen (JOBS-07)
- Full-screen route at app/job-detail.tsx
- Shows: title, status badge, large price display, schedule card (date, time, duration, recurring), client card (avatar, name, contact), location card, notes card
- "Mark as Complete" green gradient button for upcoming jobs (+25 XP badge shown)
- Edit button opens edit modal (same as add modal, pre-populated)
- Delete button with Alert confirmation
- Back navigation via router.back()

### Data Integration
- All CRUD operations go through Zustand stores (clientsStore, jobsStore)
- Job references client by clientId — display client name via lookup
- Generate IDs with Date.now().toString(36) + Math.random().toString(36).substr(2)
- XP awards go through gameStore.addXP()

### Claude's Discretion
- Exact animation for FAB press
- Client picker dropdown implementation (simple filtered list vs sheet)
- Date input handling (text format vs date picker component)
- Keyboard avoiding behavior in modals

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Context
- `.planning/PROJECT.md` — Vision, constraints
- `.planning/REQUIREMENTS.md` — CLNT-01..05, JOBS-01..07 define Phase 3 requirements
- `.planning/research/FEATURES.md` — Job scheduling is "highest complexity core feature"
- `.planning/research/PITFALLS.md` — Recurring job date generation edge cases, FlatList memoization
- `.planning/research/ARCHITECTURE.md` — Feature-oriented structure, store patterns

### Prior Phase Decisions
- `.planning/phases/01-foundation/01-CONTEXT.md` — Zustand stores, StyleSheet API, theme, components
- `.planning/phases/02-onboarding/02-CONTEXT.md` — Navigation patterns, Stack.Protected

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `src/store/clientsStore.ts` — Full CRUD: addClient, updateClient, deleteClient, getClientById
- `src/store/jobsStore.ts` — Full CRUD: addJob, updateJob, deleteJob, completeJob with auto-recurrence
- `src/store/gameStore.ts` — addXP action for gamification hooks
- `src/components/Card.tsx` — Pressable card component
- `src/components/GradientButton.tsx` — Green gradient button, 3 sizes
- `src/components/EmptyState.tsx` — Empty state with icon, title, subtitle, action
- `src/components/ScreenHeader.tsx` — Large bold title
- `src/types/index.ts` — Client, Job, HUSTLE_TYPES types

### Existing Screens (First Pass)
- `app/(tabs)/jobs.tsx` — Currently a thin placeholder (63 lines) from Phase 1
- `app/(tabs)/clients.tsx` — Currently a thin placeholder (57 lines) from Phase 1
- `app/job-detail.tsx` — Fat first-pass implementation (957 lines) using deprecated storage.ts
- These need to be rebuilt/refactored to use Zustand stores

### Integration Points
- `app/(tabs)/_layout.tsx` — Jobs and Clients tabs already configured
- `src/store/index.ts` — Barrel exports all store hooks
- `expo-router` — useRouter for navigation, useLocalSearchParams for job detail

</code_context>

<specifics>
## Specific Ideas

- Job cards should feel like appointments in a premium calendar app — clean, scannable
- Price should be the most prominent number on each job card (bold, green)
- The mark-complete action should feel satisfying — it's the core loop of the app
- Client avatars with first-letter circles add personality without needing photo uploads
- Search should be instant (local data, no debounce needed)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-core-business-data*
*Context gathered: 2026-03-25*
