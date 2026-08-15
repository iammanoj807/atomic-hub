// Derivations over the 26-week study plan.
//
// Kept separate from the components so the date maths and the pace arithmetic
// can be tested — those are the two things that would go wrong silently.

import {
    planWeeks,
    dailyRoutine,
    PLAN_START_DATE,
    PLAN_WEEKS,
    type PlanWeek,
    type RoutineSlot,
} from '../data/studyPlan';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Parses YYYY-MM-DD at UTC midnight, so no timezone can shift the day. */
const parseISO = (dateISO: string): number => Date.parse(`${dateISO}T00:00:00Z`);

/** 1-26 while the plan is running, null before it starts and after it ends. */
export const getPlanWeekNumber = (dateISO: string): number | null => {
    const day = parseISO(dateISO);
    const start = parseISO(PLAN_START_DATE);
    if (Number.isNaN(day) || day < start) return null;

    const week = Math.floor((day - start) / (7 * MS_PER_DAY)) + 1;
    return week <= PLAN_WEEKS ? week : null;
};

export const getPlanWeek = (dateISO: string): PlanWeek | null => {
    const week = getPlanWeekNumber(dateISO);
    return week === null ? null : planWeeks[week - 1];
};

/** Negative once the plan has started. Used for the "starts in N days" state. */
export const daysUntilPlanStart = (dateISO: string): number =>
    Math.round((parseISO(PLAN_START_DATE) - parseISO(dateISO)) / MS_PER_DAY);

export type PlanPhase = 'before' | 'during' | 'after';

export const getPlanPhase = (dateISO: string): PlanPhase => {
    if (daysUntilPlanStart(dateISO) > 0) return 'before';
    return getPlanWeekNumber(dateISO) === null ? 'after' : 'during';
};

/**
 * The routine slots for one weekday, in order.
 * Matched case-insensitively because the sheet shouts FRIDAY.
 */
export const getRoutineForDay = (dayName: string): RoutineSlot[] =>
    dailyRoutine.filter(slot => slot.day.toLowerCase() === dayName.toLowerCase());

/** What one week of the routine adds up to — 24 hours, and it should stay that way. */
export const routineWeeklyHours = (): number =>
    dailyRoutine.reduce((total, slot) => total + (slot.hours ?? 0), 0);

// ============ Hours Log ============

/** Only the fields the arithmetic needs, so tests don't have to build Firestore docs. */
export interface WeekLogInput {
    actualHours?: number | null;
    dsaProblems?: number | null;
}

export interface HoursSummary {
    /** Every target hour in the plan: 540. */
    targetTotal: number;
    /** Target for weeks 1..currentWeek — what you should have done by now. */
    targetToDate: number;
    actualTotal: number;
    /** Actual minus targetToDate. Negative means behind. */
    diffToDate: number;
    weeksLogged: number;
    dsaProblems: number;
}

/**
 * @param logs      Keyed by week number.
 * @param upToWeek  The week you are currently in, or null before the plan starts.
 */
export const summariseHours = (
    logs: Record<number, WeekLogInput>,
    upToWeek: number | null
): HoursSummary => {
    const targetTotal = planWeeks.reduce((sum, w) => sum + w.targetHours, 0);

    const targetToDate = upToWeek === null
        ? 0
        : planWeeks
            .filter(w => w.week <= upToWeek)
            .reduce((sum, w) => sum + w.targetHours, 0);

    let actualTotal = 0;
    let weeksLogged = 0;
    let dsaProblems = 0;

    for (const log of Object.values(logs)) {
        // A week counts as logged once it has hours against it — a note alone
        // isn't a week of work, and shouldn't drag the average down either.
        if (typeof log.actualHours === 'number') {
            actualTotal += log.actualHours;
            weeksLogged += 1;
        }
        if (typeof log.dsaProblems === 'number') {
            dsaProblems += log.dsaProblems;
        }
    }

    return {
        targetTotal,
        targetToDate,
        actualTotal,
        diffToDate: actualTotal - targetToDate,
        weeksLogged,
        dsaProblems,
    };
};

/** Below this for three weeks running and the plan says to cut Sunday, then Saturday. */
export const UNDER_PACE_HOURS = 16;
export const UNDER_PACE_WEEKS = 3;

/**
 * How many of the most recent consecutive logged weeks came in under 16 hours.
 * Walks backwards from the current week and stops at the first week that is
 * either fine or missing — an unlogged week breaks the run rather than
 * silently counting as a zero.
 */
export const getUnderPaceStreak = (
    logs: Record<number, WeekLogInput>,
    upToWeek: number | null
): number => {
    if (upToWeek === null) return 0;

    let streak = 0;
    for (let week = upToWeek; week >= 1; week--) {
        const hours = logs[week]?.actualHours;
        if (typeof hours !== 'number' || hours >= UNDER_PACE_HOURS) break;
        streak += 1;
    }
    return streak;
};

export const isUnderPace = (
    logs: Record<number, WeekLogInput>,
    upToWeek: number | null
): boolean => getUnderPaceStreak(logs, upToWeek) >= UNDER_PACE_WEEKS;
