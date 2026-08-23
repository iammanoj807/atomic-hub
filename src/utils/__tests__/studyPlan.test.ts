import { describe, it, expect } from 'vitest';
import {
    getPlanWeekNumber,
    getPlanWeek,
    daysUntilPlanStart,
    getPlanPhase,
    summariseHours,
    getUnderPaceStreak,
    isUnderPace,
    getPaceState,
    type WeekLogInput,
} from '../studyPlan';
import { planWeeks, PLAN_WEEKS, PLAN_START_DATE } from '../../data/studyPlan';

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

    it('runs 24 Aug 2026 to 21 Feb 2027', () => {
        expect(PLAN_START_DATE).toBe('2026-08-24');
        expect(planWeeks[0].startDate).toBe('2026-08-24');
        expect(planWeeks[PLAN_WEEKS - 1].endDate).toBe('2027-02-21');
    });
});

describe('getPlanWeekNumber', () => {
    it('returns null before the plan starts', () => {
        expect(getPlanWeekNumber('2026-08-16')).toBeNull();
    });

    it('counts the first Monday as week 1', () => {
        expect(getPlanWeekNumber('2026-08-24')).toBe(1);
        expect(getPlanWeekNumber('2026-08-23')).toBeNull();
    });

    it('keeps the whole first week on week 1', () => {
        expect(getPlanWeekNumber('2026-08-30')).toBe(1);
    });

    it('rolls over on the Monday', () => {
        expect(getPlanWeekNumber('2026-08-31')).toBe(2);
    });

    it('handles the last day of the plan', () => {
        expect(getPlanWeekNumber('2027-02-21')).toBe(26);
    });

    it('returns null after the plan ends', () => {
        expect(getPlanWeekNumber('2027-02-22')).toBeNull();
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
        // Week 12 runs 9-15 Nov; the date is taken from the middle of it so a
        // future shift of the start date moves the week, not the assertion.
        expect(getPlanWeek('2026-11-11')?.week).toBe(12);
        expect(getPlanWeek('2026-11-11')?.milestone).toBe('** THE MOST IMPORTANT WEEK **');
    });

    it('returns null outside the plan', () => {
        expect(getPlanWeek('2025-01-01')).toBeNull();
    });
});

describe('daysUntilPlanStart / getPlanPhase', () => {
    it('counts down to the start', () => {
        expect(daysUntilPlanStart('2026-08-15')).toBe(9);
        expect(getPlanPhase('2026-08-15')).toBe('before');
    });

    it('goes negative once running', () => {
        expect(daysUntilPlanStart('2026-08-26')).toBe(-2);
        expect(getPlanPhase('2026-08-26')).toBe('during');
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

    it('totals the whole plan at 640 hours', () => {
        // 20 full weeks at 29 plus 6 lighter weeks at 10.
        expect(summariseHours({}, null).targetTotal).toBeCloseTo(640, 5);
    });

    it('targets nothing before the plan starts', () => {
        expect(summariseHours(logs, null).targetToDate).toBe(0);
    });

    it('targets only the weeks up to now', () => {
        // Weeks 1-4: 29 + 29 + 29 + 10 (consolidation).
        expect(summariseHours(logs, 4).targetToDate).toBeCloseTo(97, 5);
    });

    it('counts a week as logged only once it has hours', () => {
        const summary = summariseHours(logs, 3);
        expect(summary.weeksLogged).toBe(2);
        expect(summary.actualTotal).toBe(48);
        expect(summary.dsaProblems).toBe(16);
    });

    it('reports how far behind you are', () => {
        // 48 done against an 87-hour target for weeks 1-3.
        expect(summariseHours(logs, 3).diffToDate).toBeCloseTo(-39, 5);
    });
});

describe('under-pace detection', () => {
    it('counts consecutive weeks under 19 hours', () => {
        const logs = { 1: { actualHours: 29 }, 2: { actualHours: 12 }, 3: { actualHours: 9 } };
        expect(getUnderPaceStreak(logs, 3)).toBe(2);
        expect(isUnderPace(logs, 3)).toBe(false);
    });

    it('fires after three bad weeks running', () => {
        const logs = { 1: { actualHours: 18 }, 2: { actualHours: 12 }, 3: { actualHours: 9 } };
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

describe('getPaceState', () => {
    it('says nothing about a single bad week', () => {
        // One week under is a week, not a pattern.
        expect(getPaceState({ 1: { actualHours: 12 } }, 1)).toBe('ok');
    });

    it('notices two weeks running', () => {
        expect(getPaceState({ 1: { actualHours: 12 }, 2: { actualHours: 15 } }, 2)).toBe('notice');
    });

    it('escalates on the third', () => {
        const logs = { 1: { actualHours: 18 }, 2: { actualHours: 12 }, 3: { actualHours: 9 } };
        expect(getPaceState(logs, 3)).toBe('act');
    });

    it('agrees with isUnderPace at the three-week mark, so old callers still mean the same thing', () => {
        const logs = { 1: { actualHours: 18 }, 2: { actualHours: 12 }, 3: { actualHours: 9 } };
        expect(isUnderPace(logs, 3)).toBe(true);
        expect(getPaceState(logs, 3)).toBe('act');

        const twoBad = { 1: { actualHours: 12 }, 2: { actualHours: 15 } };
        expect(isUnderPace(twoBad, 2)).toBe(false);
        expect(getPaceState(twoBad, 2)).toBe('notice');
    });

    it('clears once a good week lands', () => {
        const logs = { 1: { actualHours: 12 }, 2: { actualHours: 15 }, 3: { actualHours: 29 } };
        expect(getPaceState(logs, 3)).toBe('ok');
    });

    it('is quiet before the plan starts', () => {
        expect(getPaceState({}, null)).toBe('ok');
    });
});
