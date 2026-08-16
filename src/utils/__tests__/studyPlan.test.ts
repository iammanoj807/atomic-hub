import { describe, it, expect } from 'vitest';
import {
    getPlanWeekNumber,
    getPlanWeek,
    daysUntilPlanStart,
    getPlanPhase,
    summariseHours,
    getUnderPaceStreak,
    isUnderPace,
    type WeekLogInput,
} from '../studyPlan';
import { planWeeks, PLAN_WEEKS } from '../../data/studyPlan';

describe('the plan data itself', () => {
    it('has 26 consecutive weeks', () => {
        expect(planWeeks).toHaveLength(PLAN_WEEKS);
        planWeeks.forEach((week, index) => expect(week.week).toBe(index + 1));
    });

    it('starts each week the day after the previous one ends', () => {
        for (let i = 1; i < planWeeks.length; i++) {
            const previousEnd = Date.parse(`${planWeeks[i - 1].endDate}T00:00:00Z`);
            const thisStart = Date.parse(`${planWeeks[i].startDate}T00:00:00Z`);
            expect(thisStart - previousEnd).toBe(24 * 60 * 60 * 1000);
        }
    });

    it('runs 17 Aug 2026 to 14 Feb 2027', () => {
        expect(planWeeks[0].startDate).toBe('2026-08-17');
        expect(planWeeks[PLAN_WEEKS - 1].endDate).toBe('2027-02-14');
    });
});

describe('getPlanWeekNumber', () => {
    it('returns null before the plan starts', () => {
        expect(getPlanWeekNumber('2026-08-16')).toBeNull();
    });

    it('counts the first Monday as week 1', () => {
        expect(getPlanWeekNumber('2026-08-17')).toBe(1);
    });

    it('keeps the whole first week on week 1', () => {
        expect(getPlanWeekNumber('2026-08-23')).toBe(1);
    });

    it('rolls over on the Monday', () => {
        expect(getPlanWeekNumber('2026-08-24')).toBe(2);
    });

    it('handles the last day of the plan', () => {
        expect(getPlanWeekNumber('2027-02-14')).toBe(26);
    });

    it('returns null after the plan ends', () => {
        expect(getPlanWeekNumber('2027-02-15')).toBeNull();
    });

    it('agrees with every week in the data', () => {
        for (const week of planWeeks) {
            expect(getPlanWeekNumber(week.startDate)).toBe(week.week);
            expect(getPlanWeekNumber(week.endDate)).toBe(week.week);
        }
    });
});

describe('getPlanWeek', () => {
    it('finds the week a date falls in', () => {
        expect(getPlanWeek('2026-11-04')?.week).toBe(12);
        expect(getPlanWeek('2026-11-04')?.milestone).toBe('** THE MOST IMPORTANT WEEK **');
    });

    it('returns null outside the plan', () => {
        expect(getPlanWeek('2025-01-01')).toBeNull();
    });
});

describe('daysUntilPlanStart / getPlanPhase', () => {
    it('counts down to the start', () => {
        expect(daysUntilPlanStart('2026-08-15')).toBe(2);
        expect(getPlanPhase('2026-08-15')).toBe('before');
    });

    it('goes negative once running', () => {
        expect(daysUntilPlanStart('2026-08-20')).toBe(-3);
        expect(getPlanPhase('2026-08-20')).toBe('during');
    });

    it('knows when the plan is over', () => {
        expect(getPlanPhase('2027-03-01')).toBe('after');
    });
});

describe('summariseHours', () => {
    const logs: Record<number, WeekLogInput> = {
        1: { actualHours: 22, dsaProblems: 5 },
        2: { actualHours: 26, dsaProblems: 4 },
        3: { dsaProblems: 7 }, // notes only, no hours yet
    };

    it('totals the whole plan at 540 hours', () => {
        expect(summariseHours({}, null).targetTotal).toBe(540);
    });

    it('targets nothing before the plan starts', () => {
        expect(summariseHours(logs, null).targetToDate).toBe(0);
    });

    it('targets only the weeks up to now', () => {
        // Weeks 1-4: 24 + 24 + 24 + 10 (consolidation).
        expect(summariseHours(logs, 4).targetToDate).toBe(82);
    });

    it('counts a week as logged only once it has hours', () => {
        const summary = summariseHours(logs, 3);
        expect(summary.weeksLogged).toBe(2);
        expect(summary.actualTotal).toBe(48);
        expect(summary.dsaProblems).toBe(16);
    });

    it('reports how far behind you are', () => {
        // 48 done against a 72-hour target for weeks 1-3.
        expect(summariseHours(logs, 3).diffToDate).toBe(-24);
    });
});

describe('under-pace detection', () => {
    it('counts consecutive weeks under 16 hours', () => {
        const logs = { 1: { actualHours: 24 }, 2: { actualHours: 12 }, 3: { actualHours: 9 } };
        expect(getUnderPaceStreak(logs, 3)).toBe(2);
        expect(isUnderPace(logs, 3)).toBe(false);
    });

    it('fires after three bad weeks running', () => {
        const logs = { 1: { actualHours: 15 }, 2: { actualHours: 12 }, 3: { actualHours: 9 } };
        expect(isUnderPace(logs, 3)).toBe(true);
    });

    it('breaks the run on an unlogged week rather than assuming zero', () => {
        const logs = { 1: { actualHours: 10 }, 2: {}, 3: { actualHours: 9 } };
        expect(getUnderPaceStreak(logs, 3)).toBe(1);
    });

    it('is clear before the plan starts', () => {
        expect(getUnderPaceStreak({}, null)).toBe(0);
    });
});
