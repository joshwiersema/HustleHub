# Phase 3: Core Business Data - Research

**Researched:** 2026-03-24
**Domain:** React Native CRUD screens (FlatList, Modals, Zustand store integration, recurring job logic)
**Confidence:** HIGH

## Summary

Phase 3 is the largest feature phase in HustleHub: 12 requirements (CLNT-01..05, JOBS-01..07) covering full client and job management. The existing codebase provides strong foundations -- Zustand stores with full CRUD are already built (`clientsStore.ts`, `jobsStore.ts`), shared UI components exist (Card, GradientButton, EmptyState, ScreenHeader, StatCard), and the theme system is established. The primary work is building four interactive screens (clients list, jobs list, add/edit modals, job detail) and wiring them to Zustand stores while removing all `storage.ts` dependencies.

The recurring job logic is the single most complex piece in this phase. The CONTEXT.md decision is "auto-generate next occurrence when a recurring job is marked complete." This requires a reliable date-shifting function that handles weekly/biweekly/monthly edge cases (month boundaries, varying month lengths). No date library is currently installed -- plain JavaScript Date arithmetic is sufficient for these three patterns and avoids adding a dependency.

The existing `app/job-detail.tsx` (957 lines) is a first-pass implementation that imports from the deprecated `src/store/storage.ts`. It has good UI patterns (card layout, edit modal, status badges, duration pills, toggle) that should be preserved during the Zustand refactor, but its async loading pattern must be replaced with synchronous Zustand selectors.

**Primary recommendation:** Build screens in dependency order -- client list with add/edit modal first (jobs depend on client picker), then jobs list with tab filter and add modal, then job detail with mark-complete + recurring generation. Extract shared form patterns (input styles, modal header, duration pills, toggle) into reusable helpers early.

<user_constraints>

## User Constraints (from CONTEXT.md)

### Locked Decisions
- Client list: FlatList with client cards (avatar circle with first letter, name, phone, truncated address)
- Search bar at top filters by name, phone, email, address
- Tap client card to expand inline showing full details
- Expanded state shows Edit and Delete action buttons
- FAB (floating action button) green gradient circle, bottom-right, opens add modal
- Add/Edit modal: full-screen Modal with name (required), phone, email, address, notes
- Delete: Alert confirmation before removing
- Award 15 XP when first client added (via gameStore.addXP)
- Empty state: EmptyState component with "No clients yet" message and "Add Client" action
- Jobs screen has tab filter bar: "Upcoming" | "Completed" | "All"
- Job cards show: title, client name, date/time, duration, price (bold green), status badge
- Status badge colors: upcoming = blue (#40C4FF), completed = green (#00E676), cancelled = red (#FF5252)
- FAB opens add-job modal
- Add Job modal fields: client picker, job title, date (TextInput MM/DD/YYYY), time, duration selector (30min/1hr/1.5hr/2hr as pill buttons), price, address, recurring toggle with frequency, notes
- Duration pills: horizontal row, active = green border
- Upcoming jobs sorted by nearest date first
- Mark job complete: inline button on job card OR from detail screen. Awards 25 XP.
- Recurring: store recurrence info on Job record, auto-generate next on complete
- Frequency options: weekly, biweekly, monthly
- Recurring badge/icon shown on job cards
- Job detail: full-screen route at app/job-detail.tsx
- Detail shows: title, status badge, large price, schedule card, client card, location card, notes card
- "Mark as Complete" green gradient button (+25 XP)
- Edit button opens edit modal (same as add modal, pre-populated)
- Delete with Alert confirmation
- All CRUD through Zustand stores (clientsStore, jobsStore)
- ID generation: Date.now().toString(36) + Math.random().toString(36).substr(2)
- XP awards go through gameStore.addXP()

### Claude's Discretion
- Exact animation for FAB press
- Client picker dropdown implementation (simple filtered list vs sheet)
- Date input handling (text format vs date picker component)
- Keyboard avoiding behavior in modals

### Deferred Ideas (OUT OF SCOPE)
None -- discussion stayed within phase scope

</user_constraints>

<phase_requirements>

## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CLNT-01 | User can add a client with name, phone, email, address, and notes | Zustand `addClient` exists; need add-client modal with form validation |
| CLNT-02 | User can view a searchable list of all clients | FlatList + search bar filtering pattern; `useClientsStore` selector |
| CLNT-03 | User can edit an existing client's information | Zustand `updateClient` exists; reuse add modal in edit mode |
| CLNT-04 | User can delete a client with confirmation | Zustand `deleteClient` exists; Alert.alert confirmation pattern |
| CLNT-05 | User can tap a client to see their full details | Inline expand pattern with useState tracking expandedId |
| JOBS-01 | User can create a job with title, client, date, time, duration, price, address, notes | Zustand `addJob` exists; add-job modal with client picker |
| JOBS-02 | User can view jobs filtered by status (upcoming, completed, all) | Tab filter bar with useMemo-filtered job arrays |
| JOBS-03 | User can mark a job as completed | Zustand `completeJob` exists; needs recurring auto-generation wired in |
| JOBS-04 | User can set a job as recurring (weekly, biweekly, monthly) | Recurring toggle + frequency pills in add/edit modal; date generation on complete |
| JOBS-05 | User can edit an existing job | Zustand `updateJob` exists; reuse add modal in edit mode |
| JOBS-06 | User can delete a job with confirmation | Zustand `deleteJob` exists; Alert.alert confirmation pattern |
| JOBS-07 | User can view full details of a single job | Refactor existing job-detail.tsx from storage.ts to Zustand |

</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| zustand | 5.0.12 | State management + persistence | Already the project standard; stores pre-built |
| expo-router | 55.0.7 | File-based navigation | Already configured with tabs + stack |
| react-native (FlatList) | 0.83.2 | Performant list rendering | Built-in, no extra dependency needed |
| react-native (Modal) | 0.83.2 | Full-screen add/edit forms | Built-in Modal component per CONTEXT decision |
| react-native (Alert) | 0.83.2 | Delete confirmations | Built-in, cross-platform |
| expo-linear-gradient | 55.0.9 | FAB gradient, complete button gradient | Already used for GradientButton |
| @expo/vector-icons (Ionicons) | 15.1.1 | All icons | Already the project standard |

### Supporting (Already Installed)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| react-native-safe-area-context | 5.7.0 | SafeAreaView for screen containers | Every screen top edge |
| expo-haptics | 55.0.9 | Tactile feedback on mark-complete | Optional satisfying feedback |

### No New Dependencies Needed
This phase requires zero new npm installations. All UI patterns (FlatList, Modal, Alert, TextInput, Pressable, KeyboardAvoidingView) are React Native built-ins. Date arithmetic for recurring jobs uses native JavaScript Date. The client picker is a filtered list rendered inline -- no third-party picker or dropdown library needed.

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Plain JS Date math | date-fns | Adds 35KB for 3 simple operations; not worth it for weekly/biweekly/monthly |
| React Native Modal | @gorhom/bottom-sheet | More polished, but adds dependency + native module; RN Modal is the CONTEXT decision |
| TextInput for date | @react-native-community/datetimepicker | Native picker but adds dependency + inconsistent UX; text input is the CONTEXT decision |
| Custom FlatList | FlashList by Shopify | Better perf for 1000+ items; overkill for <100 clients/jobs in v1 |

## Architecture Patterns

### Screen Structure
```
app/
  (tabs)/
    clients.tsx      -- Full rebuild: FlatList, search, expand, FAB
    jobs.tsx          -- Full rebuild: tab filter, FlatList, FAB
  job-detail.tsx      -- Refactor: storage.ts -> Zustand stores

No new route files needed. All add/edit uses inline React Native Modal (not new routes).
```

### Pattern 1: Zustand Synchronous Selectors (Replace Async Loading)
**What:** The existing job-detail.tsx uses async `getJobs()` + `getClients()` from storage.ts with loading states. Zustand stores are synchronous after hydration (already handled in root layout).
**When to use:** Every screen that reads from stores.
**Example:**
```typescript
// WRONG (old pattern from job-detail.tsx)
const [job, setJob] = useState<Job | null>(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  const loadData = async () => {
    const jobs = await getJobs(); // async storage read
    setJob(jobs.find(j => j.id === jobId));
    setLoading(false);
  };
  loadData();
}, []);

// CORRECT (Zustand pattern)
const job = useJobsStore((s) => s.jobs.find((j) => j.id === jobId));
const client = useClientsStore((s) => s.clients.find((c) => c.id === job?.clientId));
// No loading state needed -- data is synchronous after hydration
```

### Pattern 2: Inline Expand for Client List (CLNT-05)
**What:** Track which client card is expanded using local state. Only one expanded at a time.
**When to use:** Client list screen.
**Example:**
```typescript
const [expandedId, setExpandedId] = useState<string | null>(null);

const handlePress = (clientId: string) => {
  setExpandedId((prev) => prev === clientId ? null : clientId);
};

// In renderItem:
const isExpanded = item.id === expandedId;
// Render extra detail rows + Edit/Delete buttons when isExpanded
```

### Pattern 3: Tab Filter for Jobs (JOBS-02)
**What:** Local state tracks active filter tab. useMemo derives filtered list.
**When to use:** Jobs screen.
**Example:**
```typescript
type FilterTab = 'upcoming' | 'completed' | 'all';
const [activeTab, setActiveTab] = useState<FilterTab>('upcoming');
const jobs = useJobsStore((s) => s.jobs);

const filteredJobs = useMemo(() => {
  if (activeTab === 'all') return jobs;
  return jobs.filter((j) => j.status === activeTab);
}, [jobs, activeTab]);

// Sort upcoming by nearest date first
const sortedJobs = useMemo(() => {
  return [...filteredJobs].sort((a, b) => {
    // Parse MM/DD/YYYY date strings for comparison
    const dateA = parseDateString(a.date);
    const dateB = parseDateString(b.date);
    return dateA.getTime() - dateB.getTime();
  });
}, [filteredJobs]);
```

### Pattern 4: Shared Modal Form (Add/Edit)
**What:** Single modal component handles both add and edit modes. Pass `editingItem` prop -- when null it's add mode, when populated it's edit mode with pre-filled fields.
**When to use:** Client add/edit modal, Job add/edit modal.
**Example:**
```typescript
interface ModalProps {
  visible: boolean;
  onClose: () => void;
  editingClient?: Client; // undefined = add mode, defined = edit mode
}

// Initialize form state from editingClient or empty defaults
useEffect(() => {
  if (editingClient) {
    setName(editingClient.name);
    // ... populate all fields
  } else {
    setName('');
    // ... clear all fields
  }
}, [editingClient, visible]);
```

### Pattern 5: Floating Action Button (FAB)
**What:** Absolute-positioned pressable circle in bottom-right corner, above tab bar.
**When to use:** Clients screen FAB, Jobs screen FAB.
**Example:**
```typescript
<Pressable
  style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
  onPress={onPress}
>
  <LinearGradient
    colors={Colors.gradientGreen}
    style={styles.fabGradient}
  >
    <Ionicons name="add" size={28} color={Colors.textInverse} />
  </LinearGradient>
</Pressable>

// Styles:
fab: {
  position: 'absolute',
  bottom: 24,
  right: 20,
  zIndex: 10,
  ...Shadows.elevated,
},
fabGradient: {
  width: 56,
  height: 56,
  borderRadius: 28,
  justifyContent: 'center',
  alignItems: 'center',
},
fabPressed: {
  transform: [{ scale: 0.92 }],
  opacity: 0.9,
},
```

### Pattern 6: Client Picker in Job Form (Claude's Discretion)
**What:** Pressable field that toggles a filtered list of clients inline in the modal scroll. User taps a client name to select.
**Recommendation:** Simple filtered list approach. When the picker field is tapped, show a search input + scrollable list of client names below it. Tap to select, list collapses. This avoids third-party picker libraries and keeps everything within the existing Modal.
**Example:**
```typescript
const [showClientPicker, setShowClientPicker] = useState(false);
const [clientSearch, setClientSearch] = useState('');
const clients = useClientsStore((s) => s.clients);

const filteredClients = useMemo(() =>
  clients.filter((c) =>
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  ),
  [clients, clientSearch]
);

// Render: Pressable that shows selected client name
// When tapped: show TextInput + FlatList of matching clients
// On select: set clientId + clientName, collapse picker
```

### Pattern 7: Recurring Job Auto-Generation
**What:** When `completeJob` is called on a recurring job, automatically create the next occurrence with the date shifted forward by the recurrence frequency.
**When to use:** Inside the `completeJob` action in `jobsStore.ts` (or as a wrapper in the screen).
**Critical:** The current `completeJob` in jobsStore only sets `status: 'completed'`. It needs to be enhanced to also call `addJob` with a new job when `job.recurring === true`.

### Anti-Patterns to Avoid
- **Importing from storage.ts in new code:** All new code uses Zustand stores exclusively. The job-detail.tsx refactor must remove all storage.ts imports.
- **Async loading patterns for store data:** Zustand data is synchronous after hydration. No `useState(null) + useEffect + setLoading` pattern for store reads.
- **Inline renderItem functions:** Define renderItem with useCallback or as a stable component reference to prevent FlatList re-render cascades.
- **Fat screen files:** The existing job-detail.tsx is 957 lines. Extract modal forms and reusable card patterns into separate components.
- **Hardcoded color hex values:** Use theme constants (`Colors.info`, `Colors.success`, `Colors.error`) not inline hex strings.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ID generation | UUID library calls | `Date.now().toString(36) + Math.random().toString(36).substr(2)` | CONTEXT decision; simple, unique enough for local-only |
| Delete confirmation | Custom confirmation modal | `Alert.alert(title, message, buttons)` | CONTEXT decision; native platform dialog, zero code |
| Form validation | Zod/Yup schema | Simple field-level checks (`if (!name.trim())`) | Only 1 required field (name) per form; schema validation is overkill |
| Date shifting | date-fns or moment | Plain JS Date arithmetic (see Code Examples) | Only 3 patterns needed; self-contained utility function |
| List virtualization | Custom scroll handler | FlatList `keyExtractor` + `React.memo` on items | Built-in, battle-tested, handles <100 items effortlessly |

**Key insight:** This phase is CRUD screens with local state. Every React Native built-in (FlatList, Modal, Alert, TextInput, Pressable, KeyboardAvoidingView) is purpose-built for exactly these patterns. Adding libraries creates upgrade debt without solving real problems.

## Common Pitfalls

### Pitfall 1: Recurring Job Date Edge Cases
**What goes wrong:** "Monthly" recurrence on Jan 31 shifts to Feb 31 (invalid), which JavaScript Date silently rolls to Mar 3. A job scheduled for the 31st drifts to the 3rd of the next month, then stays on the 3rd forever.
**Why it happens:** `new Date(date.setMonth(date.getMonth() + 1))` does not clamp to valid day-of-month.
**How to avoid:** After shifting, clamp the day to the last day of the target month. Use the "set day 0 of next month" trick to get the last day of any month. See Code Examples section.
**Warning signs:** Jobs originally on the 29th, 30th, or 31st shifting to unexpected dates after a few complete cycles.

### Pitfall 2: FlatList Re-render on Unrelated State Changes (PITFALLS.md #12)
**What goes wrong:** Completing a job triggers gameStore.addXP, which causes the jobs FlatList to re-render all items because renderItem is an inline function.
**Why it happens:** Inline arrow functions create new references on every render. FlatList detects the new renderItem reference and re-renders all items.
**How to avoid:** (1) Define `renderItem` via `useCallback` with stable dependencies. (2) Wrap list item components in `React.memo`. (3) Select only the specific store slice needed via fine-grained Zustand selectors (`useJobsStore(s => s.jobs)` not `useJobsStore()`).
**Warning signs:** Scrolling jank when XP changes, or React DevTools showing list item highlights during unrelated actions.

### Pitfall 3: Job-Detail storage.ts Import Breaks After Refactor
**What goes wrong:** The existing job-detail.tsx imports `getJobs, saveJob, deleteJob, getClients, addXP` from `storage.ts`. If storage.ts is removed or modified in a later phase, job-detail breaks silently.
**Why it happens:** storage.ts is a deprecated layer that duplicates what Zustand stores already provide. The first-pass job-detail.tsx was written before stores existed.
**How to avoid:** Replace all storage.ts imports with Zustand hooks in the job-detail refactor. Verify zero remaining imports from storage.ts in any Phase 3 file.
**Warning signs:** Async loading patterns in screens that should use synchronous store access.

### Pitfall 4: Client Deletion Orphans Jobs
**What goes wrong:** User deletes a client, but their jobs still reference the deleted clientId. Job cards show blank client names or crash on lookup.
**Why it happens:** No cascading delete or orphan handling between clientsStore and jobsStore.
**How to avoid:** When deleting a client, either (a) also delete all their jobs (strict cascade), or (b) keep jobs but gracefully handle missing client data. Recommendation: option (b) -- keep jobs, display clientName (already denormalized on the Job record), show a fallback if the client record is missing.
**Warning signs:** Jobs with `clientId` that returns `undefined` from `getClient()`.

### Pitfall 5: Keyboard Covers Input Fields in Modal
**What goes wrong:** On iOS, the keyboard slides up and covers the currently focused TextInput. The user types blind, especially in "Notes" and "Address" fields at the bottom of the form.
**Why it happens:** React Native Modal content does not automatically adjust for keyboard. KeyboardAvoidingView must wrap the modal content with the correct `behavior` prop.
**How to avoid:** Wrap modal content in `<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>` and put form fields inside a `<ScrollView keyboardShouldPersistTaps="handled">`. The existing job-detail.tsx already demonstrates this pattern correctly -- preserve it.
**Warning signs:** Any TextInput in the lower half of the modal being covered when keyboard opens.

### Pitfall 6: Search/Filter Creates New Array References on Every Keystroke
**What goes wrong:** Search filter runs on every keystroke, creating a new filtered array. If this array is passed to FlatList's `data` prop without memoization, every keystroke triggers a full list re-render.
**Why it happens:** `clients.filter(...)` always returns a new array reference, even if the content hasn't changed.
**How to avoid:** Wrap the filter computation in `useMemo` keyed on `[clients, searchQuery]`. The filter runs on every keystroke (which is fine -- it's fast for <100 items), but the array reference stays stable when results don't change.

## Code Examples

### Recurring Job Date Generation (Critical)
```typescript
// Source: JavaScript Date API (MDN Web Docs)
// Handles weekly, biweekly, monthly with month-end clamping

function getNextOccurrenceDate(
  dateStr: string, // "MM/DD/YYYY"
  frequency: 'weekly' | 'biweekly' | 'monthly'
): string {
  const [month, day, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day); // month is 0-indexed

  switch (frequency) {
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'biweekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly': {
      // Move to next month, clamp day to last day of target month
      const targetMonth = date.getMonth() + 1;
      const targetYear = targetMonth > 11 ? date.getFullYear() + 1 : date.getFullYear();
      const normalizedMonth = targetMonth % 12;
      // Get last day of target month (day 0 of month+1)
      const lastDay = new Date(targetYear, normalizedMonth + 1, 0).getDate();
      const clampedDay = Math.min(day, lastDay);
      date.setFullYear(targetYear, normalizedMonth, clampedDay);
      break;
    }
  }

  // Format back to MM/DD/YYYY
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${mm}/${dd}/${yyyy}`;
}
```

### Enhanced completeJob with Auto-Recurrence
```typescript
// In jobsStore.ts or as a screen-level handler

const handleCompleteJob = (jobId: string) => {
  const { jobs, addJob } = useJobsStore.getState();
  const job = jobs.find((j) => j.id === jobId);
  if (!job) return;

  // Mark current job complete
  useJobsStore.getState().completeJob(jobId);

  // Award XP
  useGameStore.getState().addXP(25);

  // Auto-generate next occurrence for recurring jobs
  if (job.recurring && job.recurringFrequency) {
    const nextDate = getNextOccurrenceDate(job.date, job.recurringFrequency);
    const newId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const nextJob: Job = {
      ...job,
      id: newId,
      date: nextDate,
      status: 'upcoming',
    };
    useJobsStore.getState().addJob(nextJob);
  }
};
```

### ID Generation Helper
```typescript
// Source: CONTEXT.md decision
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
```

### Memoized FlatList Item Component
```typescript
// Source: React Native FlatList optimization docs

interface ClientCardProps {
  client: Client;
  isExpanded: boolean;
  onPress: (id: string) => void;
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
}

const ClientCard = React.memo(function ClientCard({
  client,
  isExpanded,
  onPress,
  onEdit,
  onDelete,
}: ClientCardProps) {
  return (
    <Card onPress={() => onPress(client.id)}>
      {/* Avatar + name + phone row */}
      {/* Expanded: full details + Edit/Delete buttons */}
    </Card>
  );
});

// In the screen:
const renderClient = useCallback(
  ({ item }: { item: Client }) => (
    <ClientCard
      client={item}
      isExpanded={item.id === expandedId}
      onPress={handlePress}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ),
  [expandedId, handlePress, handleEdit, handleDelete]
);
```

### Date String Parsing for Sort
```typescript
// Parse "MM/DD/YYYY" to Date for comparison
function parseDateString(dateStr: string): Date {
  if (!dateStr) return new Date(0); // fallback for empty dates
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}
```

### Modal Form Pattern (KeyboardAvoidingView)
```typescript
// Source: existing job-detail.tsx pattern (verified working)
<Modal
  visible={modalVisible}
  animationType="slide"
  presentationStyle="pageSheet"
  onRequestClose={() => setModalVisible(false)}
>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={{ flex: 1, backgroundColor: Colors.bg }}
  >
    <SafeAreaView style={{ flex: 1 }} edges={['top']}>
      {/* Header: Cancel | Title | Save */}
      <ScrollView keyboardShouldPersistTaps="handled">
        {/* Form fields */}
      </ScrollView>
    </SafeAreaView>
  </KeyboardAvoidingView>
</Modal>
```

### Search Filter Pattern
```typescript
const [searchQuery, setSearchQuery] = useState('');
const clients = useClientsStore((s) => s.clients);

const filteredClients = useMemo(() => {
  if (!searchQuery.trim()) return clients;
  const q = searchQuery.toLowerCase();
  return clients.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q)
  );
}, [clients, searchQuery]);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| storage.ts async CRUD | Zustand sync stores | Phase 1 (already done) | All screens use sync selectors, no loading states for store data |
| Separate async reads per screen | Zustand hydration gate in root layout | Phase 1 (already done) | Data guaranteed available once screens mount |
| Class components for lists | FlatList + React.memo + useCallback | RN 0.60+ (years ago) | Standard optimization pattern |
| Custom navigation state | expo-router file-based | Already configured | No manual navigation wiring needed |

**Deprecated/outdated:**
- `src/store/storage.ts`: The entire file is a deprecated first-pass. All its functionality is now in Zustand stores. New Phase 3 code must NOT import from storage.ts. The job-detail.tsx refactor will remove the last screen-level dependency on it.

## Open Questions

1. **Should deleting a client cascade to their jobs?**
   - What we know: Jobs store `clientName` denormalized alongside `clientId`. Jobs can survive without a valid client record.
   - What's unclear: User expectation -- does deleting "Mrs. Smith" also delete her 10 jobs?
   - Recommendation: Do NOT cascade. Keep orphaned jobs with their denormalized clientName. Show a subtle "(deleted)" indicator if client lookup returns undefined. This prevents accidental data loss and is simpler to implement.

2. **Should the completeJob recurring logic live in the store or the screen?**
   - What we know: The current `completeJob` action only sets `status: 'completed'`. Adding auto-recurrence logic to the store keeps it centralized. But it requires the store to call `addXP` on `gameStore`, creating a cross-store dependency.
   - What's unclear: Whether cross-store calls in a Zustand action are acceptable for this project.
   - Recommendation: Keep the orchestration in a screen-level handler function (not in the store). The screen calls `completeJob()`, then `addXP()`, then creates the next job via `addJob()`. This keeps stores simple and dependency-free. The handler can be a shared utility if both the jobs list and job-detail screen need it.

3. **First-client XP award -- trigger mechanism**
   - What we know: CONTEXT says "Award 15 XP when first client added." This is a one-time award.
   - What's unclear: How to prevent duplicate awards on subsequent adds.
   - Recommendation: Check `clients.length === 0` before adding. If true, fire `gameStore.addXP(15)` after the add. Simple, no extra state needed.

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | None currently installed |
| Config file | none -- see Wave 0 |
| Quick run command | N/A |
| Full suite command | N/A |

### Phase Requirements -> Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| CLNT-01 | Add client with all fields | manual | Visual verification in Expo Go | N/A |
| CLNT-02 | Search filters by name/phone/email/address | manual | Visual verification in Expo Go | N/A |
| CLNT-03 | Edit client populates form and saves | manual | Visual verification in Expo Go | N/A |
| CLNT-04 | Delete client shows Alert, removes from list | manual | Visual verification in Expo Go | N/A |
| CLNT-05 | Tap client expands inline details | manual | Visual verification in Expo Go | N/A |
| JOBS-01 | Create job with all fields + client picker | manual | Visual verification in Expo Go | N/A |
| JOBS-02 | Tab filter shows correct subset | manual | Visual verification in Expo Go | N/A |
| JOBS-03 | Mark complete changes status + awards XP | manual | Visual verification in Expo Go | N/A |
| JOBS-04 | Recurring job generates next on complete | manual | Visual verification in Expo Go | N/A |
| JOBS-05 | Edit job pre-populates and saves | manual | Visual verification in Expo Go | N/A |
| JOBS-06 | Delete job shows Alert, removes from list | manual | Visual verification in Expo Go | N/A |
| JOBS-07 | Job detail displays all fields correctly | manual | Visual verification in Expo Go | N/A |

### Sampling Rate
- **Per task commit:** Manual visual verification in Expo Go
- **Per wave merge:** Full walkthrough of CRUD flows (add/edit/delete/view for both clients and jobs)
- **Phase gate:** All 12 requirements manually verified with Expo Go test run

### Wave 0 Gaps
No test framework is installed. All Phase 3 requirements are UI-interactive CRUD screens best validated through manual testing in Expo Go. Unit testing the `getNextOccurrenceDate` utility function would be valuable but requires Jest setup (not currently in the project). Recommendation: validate recurring date logic through manual testing of edge cases (Jan 31 monthly, Feb 28 weekly, Dec 31 monthly -> Jan) rather than blocking on test framework installation.

## Sources

### Primary (HIGH confidence)
- Direct code inspection of `src/store/clientsStore.ts`, `src/store/jobsStore.ts`, `src/store/gameStore.ts` -- verified existing CRUD actions and store interfaces
- Direct code inspection of `app/job-detail.tsx` (957 lines) -- confirmed storage.ts dependency, validated UI patterns for reuse
- Direct code inspection of `src/types/index.ts` -- confirmed Client/Job type definitions with all required fields
- Direct code inspection of `app/(tabs)/clients.tsx` and `app/(tabs)/jobs.tsx` -- confirmed placeholder state (57-63 lines each)
- Direct code inspection of shared components (Card, EmptyState, GradientButton, ScreenHeader, StatCard) -- confirmed APIs and props
- Direct code inspection of `src/constants/theme.ts` -- confirmed all color/spacing/typography constants
- Direct code inspection of `package.json` -- confirmed installed dependencies and versions
- MDN Web Docs: JavaScript Date API for month arithmetic edge cases

### Secondary (MEDIUM confidence)
- `.planning/research/PITFALLS.md` -- FlatList re-render cascade (Pitfall #12), documented with React Native docs reference
- `.planning/research/ARCHITECTURE.md` -- Layered architecture pattern, store separation pattern
- `.planning/research/FEATURES.md` -- Job scheduling identified as "highest complexity core feature"
- React Native FlatList optimization documentation (reactnative.dev/docs/optimizing-flatlist-configuration)

### Tertiary (LOW confidence)
- None -- all findings based on direct code inspection and official documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH -- all libraries already installed and verified in package.json; no new dependencies
- Architecture: HIGH -- patterns derived from existing codebase analysis; screens follow established Zustand + StyleSheet patterns
- Pitfalls: HIGH -- recurring date edge cases verified against JS Date behavior; FlatList patterns documented in official React Native docs
- Code examples: HIGH -- based on existing working patterns in the codebase (job-detail.tsx modal, store selectors)

**Research date:** 2026-03-24
**Valid until:** 2026-04-24 (stable -- no fast-moving dependencies)
