# HustleHub

## What This Is

A gamified iOS mobile app where teenagers can start, run, and grow their service-based side hustles — lawn care, power washing, dog walking, tutoring, car detailing, and snow removal. It combines business management tools (scheduling, client tracking, payment logging, flyer/logo generation) with a game layer (XP, levels, badges, HustleBucks currency) to make entrepreneurship engaging and accessible for teens.

## Core Value

Teens can manage every aspect of their service business from one app — schedule jobs, track clients, log earnings, and generate marketing materials — while staying motivated through gamification that rewards real business activity.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Onboarding flow with hustle type selection (lawn care, power washing, dog walking, tutoring, car detailing, snow removal)
- [ ] Business profile setup (business name, owner name, hustle type)
- [ ] Job scheduling with date, time, duration, price, client assignment
- [ ] Recurring job support (weekly, biweekly, monthly)
- [ ] Client contact management (name, phone, email, address, notes)
- [ ] Payment logging with method tracking (cash, Venmo, Zelle, PayPal)
- [ ] Earnings dashboard with totals, averages, and visual charts
- [ ] XP system — earn points for completing jobs, logging payments, adding clients, using tools
- [ ] Level progression (10 levels: Rookie Hustler → CEO)
- [ ] HustleBucks in-game currency earned through activity
- [ ] Badges and achievements (10 unlockable badges)
- [ ] Flyer generator with multiple templates
- [ ] Business card generator with style options
- [ ] Business name generator with AI-style suggestions per hustle type
- [ ] Pricing calculator with earnings projections
- [ ] Business ideas engine with startup costs, earning potential, difficulty ratings
- [ ] Home dashboard with quick stats, upcoming jobs, XP bar, quick actions
- [ ] Profile screen with level display, badges, stats, leaderboard teaser
- [ ] Email reminders for upcoming appointments (stub for v1)
- [ ] Dark mode first iOS-native design

### Out of Scope

- Social/online leaderboards — complexity of user accounts, moderation; local teaser only for v1
- Parental controls — defer to v2 after core is solid
- Real payment processing (Stripe, etc.) — teens just log payments they receive directly
- Website builder — too complex for v1, defer
- AI chat coach — stub the concept, don't build full AI integration in v1
- Android support — iOS first, React Native enables Android later
- Push notifications — defer to v2, use email stubs for v1

## Context

- Target audience: teenagers (13-18) running neighborhood service businesses
- Design inspiration: Stake iOS app on Mobbin (dark fintech aesthetic, bold typography, card layouts)
- Design tone: "Robinhood meets Duolingo" — clean data presentation with gamified progression
- Dark mode first with green (#00E676) for money/growth, purple (#B388FF) for XP/levels, amber (#FFD740) for HustleBucks
- Existing codebase has a first-pass React Native Expo implementation with TypeScript that can be referenced for patterns
- Focus on 6 hustle types: lawn care, power washing, dog walking, tutoring, car detailing, snow removal
- UI/UX Pro Max skill available for design intelligence (67 styles, 96 palettes, React Native stack guidelines)
- Design Inspiration skill available with Mobbin references (dashboards, onboarding flows, mobile interfaces)

## Constraints

- **Tech Stack**: React Native with Expo (TypeScript) — cross-platform but iOS-first
- **Storage**: AsyncStorage for v1 (no backend/database) — local-only data
- **Design**: Dark mode first, iOS native feel, must reference Stake/Mobbin aesthetic
- **Scope**: 6 service-based hustle types only — not too broad, not too narrow
- **No Backend**: All data stored locally on device for v1
- **Accessibility**: Minimum 44x44px touch targets, 4.5:1 contrast ratios per UI/UX Pro Max guidelines

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native + Expo over native Swift | Cross-platform potential, faster iteration, Expo Go for instant testing | — Pending |
| AsyncStorage over backend DB | v1 is local-first, no user accounts needed, ship faster | — Pending |
| 6 hustle types (not unlimited) | Focused UX > generic. Teens running service businesses is the niche | — Pending |
| Dark mode first | Matches target aesthetic (Stake/Robinhood), appeals to teen demographic | — Pending |
| Local leaderboard teaser (not real) | Avoids backend complexity, still feels gamified | — Pending |
| HustleBucks cosmetic-only | No real money value, avoids regulatory complexity for teens | — Pending |

---
*Last updated: 2026-03-24 after initialization*
