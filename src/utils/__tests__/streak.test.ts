import { describe, it, expect } from 'vitest';
import { calculateStreak, previousDay } from '../streak';
import type { DailyLogData } from '../../services/firebaseService';

const HABIT = 'habit-1';

/** Builds a history where the given dates are completed. */
const historyFor = (dates: string[]): { [date: string]: DailyLogData } => {
    const history: { [date: string]: DailyLogData } = {};
    for (const date of dates) {
        history[date] = { habits: { [HABIT]: { completed: true, note: '' } } };
    }
    return history;
};

describe('previousDay', () => {
    it('steps back one day', () => {
        expect(previousDay('2026-08-07')).toBe('2026-08-06');
    });

    it('crosses a month boundary', () => {
        expect(previousDay('2026-08-01')).toBe('2026-07-31');
    });

    it('crosses a year boundary', () => {
        expect(previousDay('2026-01-01')).toBe('2025-12-31');
    });

    it('handles a leap day', () => {
        expect(previousDay('2028-03-01')).toBe('2028-02-29');
    });
});

describe('calculateStreak', () => {
    it('counts consecutive completed days ending today', () => {
        const history = historyFor(['2026-08-05', '2026-08-06', '2026-08-07']);
        expect(calculateStreak(history, HABIT, '2026-08-07')).toBe(3);
    });

    it('holds the streak when today is not done yet', () => {
        // This is the one that matters: not done YET is not the same as missed.
        const history = historyFor(['2026-08-05', '2026-08-06']);
        expect(calculateStreak(history, HABIT, '2026-08-07')).toBe(2);
    });

    it('breaks once a full day has genuinely been missed', () => {
        // Nothing on the 6th or 7th.
        const history = historyFor(['2026-08-04', '2026-08-05']);
        expect(calculateStreak(history, HABIT, '2026-08-07')).toBe(0);
    });

    it('stops at the first gap rather than counting all completed days', () => {
        const history = historyFor(['2026-08-01', '2026-08-02', '2026-08-06', '2026-08-07']);
        expect(calculateStreak(history, HABIT, '2026-08-07')).toBe(2);
    });

    it('returns 0 for an empty history', () => {
        expect(calculateStreak({}, HABIT, '2026-08-07')).toBe(0);
    });

    it('ignores other habits in the same log', () => {
        const history: { [date: string]: DailyLogData } = {
            '2026-08-07': { habits: { 'other-habit': { completed: true, note: '' } } },
            '2026-08-06': { habits: { 'other-habit': { completed: true, note: '' } } },
        };
        expect(calculateStreak(history, HABIT, '2026-08-07')).toBe(0);
    });

    it('does not count a day logged but left incomplete', () => {
        const history: { [date: string]: DailyLogData } = {
            '2026-08-07': { habits: { [HABIT]: { completed: false, note: 'started' } } },
            '2026-08-06': { habits: { [HABIT]: { completed: true, note: '' } } },
        };
        expect(calculateStreak(history, HABIT, '2026-08-07')).toBe(1);
    });

    it('counts a streak that crosses a month boundary', () => {
        const history = historyFor(['2026-07-30', '2026-07-31', '2026-08-01']);
        expect(calculateStreak(history, HABIT, '2026-08-01')).toBe(3);
    });
});
