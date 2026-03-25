# HustleHub

## What This Is

A gamified iOS mobile app where teenagers can start, run, and grow their service-based side hustles — lawn care, power washing, dog walking, tutoring, car detailing, and snow removal. It combines business management tools (scheduling, client tracking, payment logging, flyer/card generation, pricing calculator) with a game layer (XP, levels, badges, HustleBucks currency, celebrations) to make entrepreneurship engaging and accessible for teens.

## Core Value

Teens can manage every aspect of their service business from one app — schedule jobs, track clients, log earnings, and generate marketing materials — while staying motivated through gamification that rewards real business activity.

## Current State

**Shipped:** v1.0 MVP (2026-03-25)
**Codebase:** 11,739 LOC TypeScript/TSX across 7 phases, 18 plans
**Tech Stack:** React Native + Expo SDK 55, TypeScript, Zustand v5, AsyncStorage, Expo Router v7

## Requirements

### Validated

- ✓ Onboarding flow with hustle type selection (6 types) — v1.0
- ✓ Business profile setup (business name, owner name, hustle type) — v1.0
- ✓ Job scheduling with date, time, duration, price, client assignment — v1.0
- ✓ Recurring job support (weekly, biweekly, monthly) — v1.0
- ✓ Client contact management (name, phone, email, address, notes) — v1.0
- ✓ Payment logging with method tracking (Cash, Venmo, Zelle, PayPal, Other) — v1.0
- ✓ Earnings dashboard with totals, averages, bar chart, and time filters — v1.0
- ✓ XP system — earn points for completing jobs, logging payments, adding clients, using tools — v1.0
- ✓ Level progression (10 levels: Rookie Hustler → CEO) with celebration animations — v1.0
- ✓ HustleBucks in-game currency earned at 50% of XP rate — v1.0
- ✓ 10 unlockable badges with progress tracking and unlock celebrations — v1.0
- ✓ Flyer generator with 4 templates and native sharing — v1.0
- ✓ Business card generator with 3 styles and native sharing — v1.0
- ✓ Business name generator with curated suggestions per hustle type — v1.0
- ✓ Pricing calculator with monthly earnings projections — v1.0
- ✓ Business ideas browser with 6 hustle types, expandable details, hustle switching — v1.0
- ✓ Home dashboard with quick stats, upcoming jobs, XP bar, streak, quick actions — v1.0
- ✓ Profile screen with level, badges, lifetime stats, leaderboard teaser, data reset — v1.0
- ✓ Dark mode first iOS-native design with Stake/Mobbin aesthetic — v1.0
- ✓ 5-tab bottom navigation (Home, Jobs, Clients, Earnings, Profile) — v1.0
- ✓ Consecutive-day streak tracking tied to meaningful actions — v1.0

### Active

- [ ] Push notifications for job reminders
- [ ] Email reminders for upcoming appointments
- [ ] Real social leaderboards
- [ ] HustleBucks shop for cosmetic items
- [ ] Android support and testing
- [ ] Invoice generation tool

### Out of Scope

- Parental controls — defer to v2 after core is solid
- Real payment processing (Stripe, etc.) — teens just log payments they receive directly
- Website builder — too complex, defer
- AI chat coach — defer full AI integration
- Expense tracking / profit-loss accounting — revenue focus is more motivating for teens

## Context

- Target audience: teenagers (13-18) running neighborhood service businesses
- Design inspiration: Stake iOS app on Mobbin (dark fintech aesthetic, bold typography, card layouts)
- Design tone: "Robinhood meets Duolingo" — clean data presentation with gamified progression
- Dark mode first with green (#00E676) for money/growth, purple (#B388FF) for XP/levels, amber (#FFD740) for HustleBucks
- All data stored locally via Zustand + AsyncStorage — no backend, no user accounts
- 5 Zustand stores: profileStore, clientsStore, jobsStore, paymentsStore, gameStore
- CelebrationProvider at root layout manages XP toasts, level-up modals, badge unlock sheets
- 9 XP-granting actions across 8 screens with consistent orchestration pattern

## Constraints

- **Tech Stack**: React Native with Expo SDK 55 (TypeScript) — cross-platform but iOS-first
- **Storage**: Zustand v5 + AsyncStorage persist for v1 — local-only data
- **Design**: Dark mode first, iOS native feel, Stake/Mobbin aesthetic
- **Scope**: 6 service-based hustle types only
- **No Backend**: All data stored locally on device for v1
- **Accessibility**: Minimum 44x44px touch targets, 4.5:1 contrast ratios

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| React Native + Expo over native Swift | Cross-platform potential, faster iteration, Expo Go for instant testing | ✓ Good — shipped in 2 days |
| Zustand + AsyncStorage over expo-sqlite | Simpler for v1 data volume (<100 records per domain), no migration complexity | ✓ Good — fast, reliable |
| 6 hustle types (not unlimited) | Focused UX > generic. Teens running service businesses is the niche | ✓ Good — type-specific content |
| Dark mode first | Matches target aesthetic (Stake/Robinhood), appeals to teen demographic | ✓ Good — cohesive design |
| Local leaderboard teaser (not real) | Avoids backend complexity, still feels gamified | ✓ Good — motivational without infrastructure |
| HustleBucks cosmetic-only | No real money value, avoids regulatory complexity for teens | ✓ Good — reward without liability |
| Screen-level gamification orchestration | Avoids cross-store coupling, same pattern everywhere | ✓ Good — consistent, maintainable |
| View-based bar chart (no chart library) | Keeps dependencies minimal, sufficient for simple earnings visualization | ✓ Good — zero extra deps |
| react-native-view-shot for sharing | Captures flyer/card Views as images for native share sheet | ✓ Good — works with expo-sharing |

---
*Last updated: 2026-03-25 after v1.0 milestone*
