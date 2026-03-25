/**
 * Date helper utilities for recurring job scheduling and date sorting.
 *
 * All date strings use "MM/DD/YYYY" format, which matches the Job.date field.
 */

/**
 * Parses a "MM/DD/YYYY" date string into a JavaScript Date object.
 * Returns new Date(0) as a safe fallback for empty/falsy input.
 */
export function parseDateString(dateStr: string): Date {
  if (!dateStr) return new Date(0);
  const [month, day, year] = dateStr.split('/').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Calculates the next occurrence date for a recurring job.
 *
 * - weekly: adds 7 days
 * - biweekly: adds 14 days
 * - monthly: moves to next month with day clamping to handle month-end
 *   edge cases (e.g. Jan 31 -> Feb 28, not Mar 3)
 *
 * @returns Date string in "MM/DD/YYYY" format
 */
export function getNextOccurrenceDate(
  dateStr: string,
  frequency: 'weekly' | 'biweekly' | 'monthly',
): string {
  const [month, day, year] = dateStr.split('/').map(Number);
  const date = new Date(year, month - 1, day);

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
      const targetYear =
        targetMonth > 11 ? date.getFullYear() + 1 : date.getFullYear();
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

/**
 * Formats a duration in minutes to a human-readable string.
 *
 * - 30  -> "30min"
 * - 60  -> "1hr"
 * - 90  -> "1.5hr"
 * - 120 -> "2hr"
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = minutes / 60;
  if (Number.isInteger(hours)) {
    return `${hours}hr`;
  }
  return `${hours}hr`;
}
