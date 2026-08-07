// Streak calculation, extracted from TaskContext so it can be tested.
//
// The rule that matters: today not being done yet does NOT break the streak.
// You might simply not have done it yet, and a counter that resets at midnight
// would punish you for the hours before you get to it.

import type { DailyLogData } from '../services/firebaseService';

/** Previous calendar day for a YYYY-MM-DD string, in UTC to avoid drift. */
export const previousDay = (date: string): string => {
    const parsed = new Date(`${date}T00:00:00Z`);
    parsed.setUTCDate(parsed.getUTCDate() - 1);
    return parsed.toISOString().split('T')[0];
};

/**
 * Consecutive days a habit was completed, counting back from `today`.
 *
 * If today isn't done, counting starts at yesterday — so the streak holds all
 * day and only breaks once a full day has genuinely been missed.
 */
export const calculateStreak = (
    history: { [date: string]: DailyLogData },
    habitId: string,
    today: string
): number => {
    const wasCompleted = (date: string): boolean =>
        history[date]?.habits?.[habitId]?.completed === true;

    let cursor = today;

    // Today not done yet is not a broken streak — start from yesterday.
    if (!wasCompleted(cursor)) {
        cursor = previousDay(cursor);
        if (!wasCompleted(cursor)) return 0;
    }

    let streak = 0;
    while (wasCompleted(cursor)) {
        streak++;
        cursor = previousDay(cursor);
    }

    return streak;
};
