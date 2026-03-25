# Requirements: HustleHub

**Defined:** 2026-03-25
**Core Value:** Teens can manage every aspect of their service business from one app while staying motivated through gamification that rewards real business activity.

## v2.0 Requirements

Requirements for v2.0 Complete Redesign & Feature Overhaul milestone. Each maps to roadmap phases.

### Cleanup

- [x] **CLN-01**: Name generator screen (/app/name-generator.tsx) and all references removed from toolkit, onboarding, and gamification
- [x] **CLN-02**: Invoice template stub and toolkit entry removed
- [x] **CLN-03**: Rankings/leaderboard UI and data structures removed from profile and any other screens
- [x] **CLN-04**: All emojis replaced with professional icons from @expo/vector-icons throughout the entire app

### Theme & Design System

- [x] **THM-01**: Color palette updated in theme.ts — primary red (#DC2626), white text/cards, dark backgrounds (#0C0C0F, #141418, #1A1A22), secondary grays (#8A8A96, #6B6B78), success green (#22C55E)
- [x] **THM-02**: All screens, components, and gradients use new colors with zero green/purple remnants
- [x] **THM-03**: Typography hierarchy established with large hero numbers (40-48px) for key stats as visual focal points
- [x] **THM-04**: Consistent spacing with generous padding and 8px-based grid system throughout
- [x] **THM-05**: Consistent card border radius in 12-16px range across all card-like elements
- [x] **THM-06**: All interactive elements have minimum 44x44 point touch targets

### Navigation

- [x] **NAV-01**: Bottom tab bar redesigned with clean icons, red (#DC2626) accent for active tab, muted gray for inactive
- [x] **NAV-02**: Consistent single icon family used across entire app (all Ionicons or all Feather — no mixing)
- [x] **NAV-03**: 5 tabs maintained: Home, Jobs, Clients, Earnings, Profile

### Onboarding

- [x] **ONB-01**: Step 1 — Clean professional welcome screen with bold typographic layout, brief tagline, no emojis or animations
- [x] **ONB-02**: Step 2 — Pick hustle with redesigned cards using proper icons, hustle name + one-line description only (no difficulty/earnings badges)
- [x] **ONB-03**: Step 3 — Business info with name + business name inputs only, clean form design, no AI name suggestions
- [x] **ONB-04**: Step 4 — Business card generator generates 3-4 AI design variations with different layouts/typography/colors in red/white/dark palette, user picks one, can export as image/PDF or skip
- [x] **ONB-05**: Step 5 — Flyer generator generates multiple AI design variations based on hustle type and business info, user picks one, can export as image/PDF or skip
- [x] **ONB-06**: Step 6 — Summary card showing user profile, then launch into main app

### Generators

- [x] **GEN-01**: Business card generator produces 3-4 AI-generated design variations with different layouts, typography, and color arrangements
- [x] **GEN-02**: Flyer generator produces multiple AI-generated design variations tailored to hustle type
- [x] **GEN-03**: Generators pre-fill with saved business info when accessed from toolkit (post-onboarding)
- [x] **GEN-04**: Export as image (PNG) option available for both cards and flyers
- [x] **GEN-05**: Export as PDF option available for both cards and flyers
- [x] **GEN-06**: Print via system print dialog available for both cards and flyers
- [x] **GEN-07**: Share via native share sheet available for both cards and flyers

### Jobs

- [x] **JOB-01**: Optional photo upload field on job completion flow using expo-image-picker (camera or gallery)
- [x] **JOB-02**: Photo URI stored with job record in jobs store
- [x] **JOB-03**: Photo displayed in job detail view (/app/job-detail.tsx)

### Screen Redesign

- [x] **SCR-01**: Dashboard/Home — big hero stat at top (total earnings or streak), clean card grid with key stats, subtle quick action buttons, recent activity feed
- [x] **SCR-02**: Jobs — clean list view with status indicators, styled filter tabs (upcoming/completed), job cards show client/service/date/price without emojis
- [x] **SCR-03**: Clients — professional contact list with name/phone/last job, search/filter capability
- [x] **SCR-04**: Earnings — dark background chart/graph at top with colored line, payment method breakdown, time period filters
- [x] **SCR-05**: Profile — stats overview at top, badge gallery with proper icons (not emojis), refined level progress bar, settings section with reset/start-over option
- [x] **SCR-06**: Toolkit — clean grid of 4 tools: Business Card, Flyer, Pricing Calculator, Business Ideas — icons + labels only, no emojis or "coming soon" badges

### Components

- [x] **CMP-01**: All shared components (Card, StatCard, EmptyState, ScreenHeader) redesigned to match The Outsiders glass-morphism aesthetic
- [x] **CMP-02**: GradientButton updated from green to red-based gradient styling
- [x] **CMP-03**: Badge icons redesigned with proper vector icons replacing emoji representations
- [x] **CMP-04**: Empty states redesigned with professional icons and clean typography
- [x] **CMP-05**: XP bar, streak badge, and level indicators refined with subtle, professional appearance (less gamey)

## v2.1 Requirements

Deferred to next release. Tracked but not in current roadmap.

### Notifications

- **NOTIF-01**: User receives push notifications for upcoming job reminders
- **NOTIF-02**: User receives email reminders for appointments

### Social & Economy

- **SOCIAL-01**: Real social leaderboards with other users
- **SOCIAL-02**: HustleBucks shop for cosmetic items

### Platform

- **PLAT-01**: Android-specific testing and optimization
- **PLAT-02**: Backend/user accounts for cross-device sync

## Out of Scope

| Feature | Reason |
|---------|--------|
| Parental controls | Defer to later version |
| Real payment processing (Stripe) | Teens just log payments they receive directly |
| Website builder | Too complex, defer |
| AI chat coach | Defer full AI integration |
| Expense tracking / P&L | Revenue focus is more motivating for teens |
| Backend / user accounts | Local-only for v2.0 |
| Name generator | Removed — users type business name directly |
| Invoice generation | Removed from v2.0 scope |
| Rankings/leaderboard | Removed from v2.0 scope |
| Window washing hustle type | Deferred from v1.1 — not in v2.0 scope |
| Custom fonts | System font stack (San Francisco/Roboto) sufficient |
| Real-time AI generation | "AI-generated" variations use algorithmic layout generation, not LLM calls |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CLN-01 | Phase 11 | Complete |
| CLN-02 | Phase 11 | Complete |
| CLN-03 | Phase 11 | Complete |
| CLN-04 | Phase 11 | Complete |
| THM-01 | Phase 11 | Complete |
| THM-02 | Phase 11 | Complete |
| THM-03 | Phase 11 | Complete |
| THM-04 | Phase 11 | Complete |
| THM-05 | Phase 11 | Complete |
| THM-06 | Phase 11 | Complete |
| NAV-01 | Phase 11 | Complete |
| NAV-02 | Phase 11 | Complete |
| NAV-03 | Phase 11 | Complete |
| CMP-01 | Phase 12 | Complete |
| CMP-02 | Phase 12 | Complete |
| CMP-03 | Phase 12 | Complete |
| CMP-04 | Phase 12 | Complete |
| CMP-05 | Phase 12 | Complete |
| SCR-01 | Phase 13 | Complete |
| SCR-02 | Phase 13 | Complete |
| JOB-01 | Phase 13 | Complete |
| JOB-02 | Phase 13 | Complete |
| JOB-03 | Phase 13 | Complete |
| SCR-03 | Phase 14 | Complete |
| SCR-04 | Phase 14 | Complete |
| SCR-05 | Phase 15 | Complete |
| SCR-06 | Phase 15 | Complete |
| GEN-01 | Phase 16 | Complete |
| GEN-02 | Phase 16 | Complete |
| GEN-03 | Phase 16 | Complete |
| GEN-04 | Phase 16 | Complete |
| GEN-05 | Phase 16 | Complete |
| GEN-06 | Phase 16 | Complete |
| GEN-07 | Phase 16 | Complete |
| ONB-01 | Phase 17 | Complete |
| ONB-02 | Phase 17 | Complete |
| ONB-03 | Phase 17 | Complete |
| ONB-04 | Phase 17 | Complete |
| ONB-05 | Phase 17 | Complete |
| ONB-06 | Phase 17 | Complete |

**Coverage:**
- v2.0 requirements: 40 total
- Mapped to phases: 40/40
- Unmapped: 0

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after v2.0 milestone completion — 40/40 requirements verified*
