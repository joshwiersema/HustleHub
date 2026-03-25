# HustleHub

## What This Is

A gamified iOS mobile app where teenagers can start, run, and grow their service-based side hustles — lawn care, power washing, dog walking, tutoring, car detailing, and snow removal. It combines business management tools (scheduling, client tracking, payment logging, flyer/card generation, pricing calculator) with a game layer (XP, levels, badges, HustleBucks currency, celebrations) to make entrepreneurship engaging and accessible for teens.

## Core Value

Teens can manage every aspect of their service business from one app — schedule jobs, track clients, log earnings, and generate marketing materials — while staying motivated through gamification that rewards real business activity.

## Current Milestone: v2.0 Complete Redesign & Feature Overhaul

**Goal:** Complete visual overhaul with The Outsiders-inspired dark design language (red/white/dark palette), AI-powered business card & flyer generators, streamlined 6-step onboarding, feature removals, and professional icon system replacing all emojis.

**Target features:**
- New color scheme: red (#DC2626) + white + rich dark grays (#0C0C0F, #141418, #1A1A22)
- Remove name generator, invoice template, rankings/leaderboard
- Replace ALL emojis with professional @expo/vector-icons throughout
- AI multi-option business card generator with print/export (3-4 variations)
- AI multi-option flyer generator with print/export (multiple variations)
- Business card & flyer generation integrated into onboarding (steps 4-5)
- 6-step onboarding: Welcome → Pick Hustle → Business Info → Card Gen → Flyer Gen → Ready
- Optional photo upload on job completion (expo-image-picker)
- Every screen redesigned: The Outsiders design language (big bold stats, glass-morphism cards, generous padding)
- Refined bottom tab bar with red accent active state
- Typography hierarchy with large hero numbers for key stats

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
- ✓ Flyer generator with 4 designs and native sharing/print/PDF — v2.0
- ✓ Business card generator with 4 designs and native sharing/print/PDF — v2.0
- ✓ ~~Business name generator~~ removed in v2.0 — users type name directly
- ✓ Pricing calculator with monthly earnings projections — v1.0
- ✓ Business ideas browser with 6 hustle types, expandable details, hustle switching — v1.0
- ✓ Home dashboard with quick stats, upcoming jobs, XP bar, streak, quick actions — v1.0
- ✓ Profile screen with level, badges, lifetime stats, data reset — v2.0 (leaderboard removed)
- ✓ Dark mode first with The Outsiders design language — red/white/dark palette — v2.0
- ✓ 5-tab bottom navigation (Home, Jobs, Clients, Earnings, Profile) — v1.0
- ✓ Consecutive-day streak tracking tied to meaningful actions — v1.0

- ✓ Complete color scheme: red (#DC2626) + white + dark grays — v2.0
- ✓ Professional Ionicons replacing all emojis — v2.0
- ✓ 4-design business card generator with share/print/PDF — v2.0
- ✓ 4-design flyer generator with share/print/PDF — v2.0
- ✓ 6-step onboarding with card & flyer generation — v2.0
- ✓ Optional photo upload on job completion (expo-image-picker) — v2.0
- ✓ Every screen redesigned with The Outsiders design language — v2.0
- ✓ Bottom tab bar with red accent, labels, Ionicons — v2.0

### Active

(None — all v2.0 requirements shipped)

### Out of Scope

- Parental controls — defer to later version
- Real payment processing (Stripe, etc.) — teens just log payments they receive directly
- Website builder — too complex, defer
- AI chat coach — defer full AI integration
- Expense tracking / profit-loss accounting — revenue focus is more motivating for teens
- Push notifications — defer to v2.1
- Email reminders — defer to v2.1
- Real social leaderboards — removed in v2.0 scope
- HustleBucks shop — defer to v2.1
- Name generator — removed, replaced by direct business name input
- Invoice generation — removed from v2.0 scope
- Rankings/leaderboard — removed from v2.0 scope

## Context

- Target audience: teenagers (13-18) running neighborhood service businesses
- Design inspiration: The Outsiders iOS app on Mobbin (dark athlete tracker, big bold stats, glass-morphism cards, 8px grid)
- Design tone: Professional, serious — NOT a toy app. Clean data presentation with refined gamification
- Dark mode first with red (#DC2626) for primary actions/accents, white for text/cards, dark grays (#0C0C0F, #141418, #1A1A22) for depth, muted grays (#8A8A96, #6B6B78) for secondary text, muted green (#22C55E) for success
- All data stored locally via Zustand + AsyncStorage — no backend, no user accounts
- 5 Zustand stores: profileStore, clientsStore, jobsStore, paymentsStore, gameStore
- CelebrationProvider at root layout manages XP toasts, level-up modals, badge unlock sheets
- 9 XP-granting actions across 8 screens with consistent orchestration pattern

## Constraints

- **Tech Stack**: React Native with Expo SDK 55 (TypeScript) — cross-platform but iOS-first
- **Storage**: Zustand v5 + AsyncStorage persist for v1 — local-only data
- **Design**: Dark mode first, The Outsiders aesthetic — red/white/dark, no emojis, professional icons only
- **Scope**: 6 service-based hustle types (lawn care, power washing, dog walking, tutoring, car detailing, snow removal)
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

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

| Red/white/dark palette over green/purple | The Outsiders design language, professional serious tone, not gamey | — Pending |
| Remove name generator, invoice, rankings | Streamline features, focus on core business tools | — Pending |
| AI multi-option generators over static templates | More engaging, unique outputs per user, better onboarding experience | — Pending |
| 6-step onboarding with integrated generators | First-time experience includes marketing materials creation | — Pending |
| expo-image-picker for job photos | Lightweight, optional enhancement for job completion | — Pending |

---
*Last updated: 2026-03-25 after v2.0 milestone start*
