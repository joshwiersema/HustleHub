import { Badge, Job, LEVELS, BADGES } from '../types';

interface GameStateForBadges {
  earnedBadges: string[];
  streak: number;
}

interface StatsForBadges {
  totalClients: number;
  completedJobs: number;
  totalEarnings: number;
}

interface StatsForProgress {
  clients: number;
  completedJobs: number;
  totalEarnings: number;
  streak: number;
}

interface BadgeProgress {
  badgeId: string;
  current: number;
  target: number;
  label: string;
}

interface XPLevelInfo {
  xpIntoLevel: number;
  xpForNextLevel: number;
  progress: number;
}

/**
 * Evaluates all 10 badges against current app state and returns
 * newly earned badge IDs (not already in earnedBadges).
 */
export function checkBadges(
  gameState: GameStateForBadges,
  stats: StatsForBadges
): string[] {
  const { earnedBadges, streak } = gameState;
  const { totalClients, completedJobs, totalEarnings } = stats;

  const criteria: Record<string, boolean> = {
    first_client: totalClients >= 1,
    five_clients: totalClients >= 5,
    first_job: completedJobs >= 1,
    ten_jobs: completedJobs >= 10,
    twenty_jobs: completedJobs >= 20,
    first_100: totalEarnings >= 100,
    earn_500: totalEarnings >= 500,
    earn_1000: totalEarnings >= 1000,
    streak_7: streak >= 7,
    streak_30: streak >= 30,
  };

  return BADGES.filter(
    (badge) => criteria[badge.id] && !earnedBadges.includes(badge.id)
  ).map((badge) => badge.id);
}

/**
 * Returns current/target/label progress for a given badge based on stats.
 */
export function getBadgeProgress(
  badge: Badge,
  stats: StatsForProgress
): BadgeProgress {
  const { clients, completedJobs, totalEarnings, streak } = stats;

  let current = 0;
  let target = 1;
  let label = '';

  switch (badge.id) {
    case 'first_client':
      current = Math.min(clients, 1);
      target = 1;
      label = `${current}/${target} client`;
      break;
    case 'five_clients':
      current = Math.min(clients, 5);
      target = 5;
      label = `${current}/${target} clients`;
      break;
    case 'first_job':
      current = Math.min(completedJobs, 1);
      target = 1;
      label = `${current}/${target} job`;
      break;
    case 'ten_jobs':
      current = Math.min(completedJobs, 10);
      target = 10;
      label = `${current}/${target} jobs`;
      break;
    case 'twenty_jobs':
      current = Math.min(completedJobs, 20);
      target = 20;
      label = `${current}/${target} jobs`;
      break;
    case 'first_100':
      current = Math.min(totalEarnings, 100);
      target = 100;
      label = `$${current}/$${target}`;
      break;
    case 'earn_500':
      current = Math.min(totalEarnings, 500);
      target = 500;
      label = `$${current}/$${target}`;
      break;
    case 'earn_1000':
      current = Math.min(totalEarnings, 1000);
      target = 1000;
      label = `$${current}/$${target}`;
      break;
    case 'streak_7':
      current = Math.min(streak, 7);
      target = 7;
      label = `${current}/${target} days`;
      break;
    case 'streak_30':
      current = Math.min(streak, 30);
      target = 30;
      label = `${current}/${target} days`;
      break;
    default:
      label = `${current}/${target}`;
      break;
  }

  return { badgeId: badge.id, current, target, label };
}

/**
 * Returns XP progress within the current level.
 * For max level (10), returns progress = 1.
 */
export function getXPForLevel(level: number, totalXP: number): XPLevelInfo {
  const currentLevelInfo = LEVELS.find((l) => l.level === level);
  const nextLevelInfo = LEVELS.find((l) => l.level === level + 1);

  const currentThreshold = currentLevelInfo?.xpRequired ?? 0;

  // Max level -- fully complete
  if (!nextLevelInfo) {
    return {
      xpIntoLevel: totalXP - currentThreshold,
      xpForNextLevel: 1, // Avoid division by zero
      progress: 1,
    };
  }

  const nextThreshold = nextLevelInfo.xpRequired;
  const xpIntoLevel = totalXP - currentThreshold;
  const xpForNextLevel = nextThreshold - currentThreshold;
  const progress = Math.max(0, Math.min(1, xpIntoLevel / xpForNextLevel));

  return { xpIntoLevel, xpForNextLevel, progress };
}

/**
 * Phase 4 proxy for total earnings: sums price of all completed jobs.
 * Will be replaced by Phase 5 payment system.
 */
export function getTotalEarningsFromJobs(jobs: Job[]): number {
  return jobs
    .filter((job) => job.status === 'completed')
    .reduce((sum, job) => sum + job.price, 0);
}
