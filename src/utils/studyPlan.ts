// Derivations over the 26-week study plan.
//
// Kept separate from the components so the date maths and the pace arithmetic
// can be tested — those are the two things that would go wrong silently.

import {
    planWeeks,
    PLAN_START_DATE,
    PLAN_WEEKS,
    type PlanWeek,
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
    // PLAN_WEEKS can run ahead of the weeks actually written, so this has to
    // cope with a week number the content does not reach yet rather than
    // handing back undefined dressed up as a PlanWeek.
    return week === null ? null : planWeeks[week - 1] ?? null;
};

/** Negative once the plan has started. Used for the "starts in N days" state. */
export const daysUntilPlanStart = (dateISO: string): number =>
    Math.round((parseISO(PLAN_START_DATE) - parseISO(dateISO)) / MS_PER_DAY);

export type PlanPhase = 'before' | 'during' | 'after';

export const getPlanPhase = (dateISO: string): PlanPhase => {
    if (daysUntilPlanStart(dateISO) > 0) return 'before';
    return getPlanWeekNumber(dateISO) === null ? 'after' : 'during';
};

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

/** Below this and the week did not go the way it was meant to. */
export const UNDER_PACE_HOURS = 19;
/** Two weeks is worth saying out loud. */
export const UNDER_PACE_NOTICE_WEEKS = 2;
/** Three is where the plan itself says something has to give. */
export const UNDER_PACE_WEEKS = 3;

/**
 * How many of the most recent consecutive logged weeks came in under the
 * threshold. Walks backwards from the current week and stops at the first week
 * that is either fine or missing — an unlogged week breaks the run rather than
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

/**
 * 'notice' after two weeks, 'act' after three.
 *
 * Waiting for three consecutive weeks meant roughly five weeks of drift before
 * anything was said, by which point the answer is an apology rather than a
 * decision. Two weeks states the fact and stops; three names the cut, because
 * by then the choice is which session goes, not whether one does.
 */
export type PaceState = 'ok' | 'notice' | 'act';

export const getPaceState = (
    logs: Record<number, WeekLogInput>,
    upToWeek: number | null
): PaceState => {
    const streak = getUnderPaceStreak(logs, upToWeek);
    if (streak >= UNDER_PACE_WEEKS) return 'act';
    if (streak >= UNDER_PACE_NOTICE_WEEKS) return 'notice';
    return 'ok';
};
