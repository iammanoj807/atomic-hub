// Laying the week's sessions onto whichever days are actually free.
//
// The plan was written assuming Friday is always off. It isn't: sometimes it is
// Thursday, sometimes Friday, sometimes two days, and it is not known in
// advance. So nothing here is tied to a named day. You mark the days you are
// off and the same week of work gets dealt onto them, in this order:
//
//   1. the first day off      -> DEEP WORK (5h), then stop
//   2. the last day of the week that is left -> PAPERS + REVIEW (3h)
//   3. a second day off, or else the latest day still free -> AI ENGINEERING
//   4. everything else        -> THEORY before work
//   5. every day except the deep work day -> DSA in the evening
//
// With Friday off this reproduces the original plan exactly, which is the test
// that matters most.

import {
    WEEKDAYS,
    sessionTemplates,
    type Weekday,
    type SessionKind,
    type SessionTemplate,
} from '../data/studyPlan';

export interface DaySchedule {
    day: Weekday;
    isOff: boolean;
    sessions: SessionTemplate[];
    hours: number;
}

export interface WeekSchedule {
    days: DaySchedule[];
    totalHours: number;
    /** No day off marked — the deep work block has nowhere to go. */
    needsDayOff: boolean;
    deepWorkDay: Weekday | null;
}

/** Week order, so "first day off" means first in the week and not first tapped. */
const inWeekOrder = (days: Weekday[]): Weekday[] =>
    WEEKDAYS.filter(day => days.includes(day));

export const buildWeekSchedule = (daysOff: Weekday[]): WeekSchedule => {
    const off = inWeekOrder(daysOff);
    const assignment = new Map<Weekday, SessionKind[]>();

    // 1. Deep work goes on the first day off. Without one there is no anchor,
    //    and the caller is expected to ask for the days off.
    const deepWorkDay = off[0] ?? null;
    if (deepWorkDay) assignment.set(deepWorkDay, ['deep', 'rest']);

    const free = WEEKDAYS.filter(day => day !== deepWorkDay);

    // 2. Papers and review close the week — the last free day, usually Sunday.
    const papersDay = free[free.length - 1];
    if (papersDay) assignment.set(papersDay, ['papers']);

    // 3. AI engineering prefers a second day off; otherwise the latest day
    //    still free, which is the short shift day.
    const secondOff = off.find(day => day !== deepWorkDay && day !== papersDay);
    const aiEngDay = secondOff
        ?? [...free].reverse().find(day => !assignment.has(day));
    if (aiEngDay) assignment.set(aiEngDay, ['aieng']);

    // 4. Everything left is a theory morning.
    for (const day of free) {
        if (!assignment.has(day)) assignment.set(day, ['theory']);
    }

    // 5. DSA every day except the deep work day, which is already five hours of
    //    the hardest thing in the week and ends in a full stop.
    const days: DaySchedule[] = WEEKDAYS.map(day => {
        const kinds = [...(assignment.get(day) ?? [])];
        if (day !== deepWorkDay) kinds.push('dsa');

        const sessions = kinds.map(kind => sessionTemplates[kind]);

        return {
            day,
            isOff: off.includes(day),
            sessions,
            hours: sessions.reduce((sum, session) => sum + session.hours, 0),
        };
    });

    return {
        days,
        totalHours: days.reduce((sum, day) => sum + day.hours, 0),
        needsDayOff: deepWorkDay === null,
        deepWorkDay,
    };
};

/** The schedule for one day, for the "what am I doing today" card. */
export const getDaySchedule = (
    schedule: WeekSchedule,
    day: Weekday
): DaySchedule | null => schedule.days.find(d => d.day === day) ?? null;

const JS_DAY_TO_WEEKDAY: Weekday[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Weekday of a YYYY-MM-DD date, read at UTC so no timezone can shift it. */
export const weekdayOf = (dateISO: string): Weekday =>
    JS_DAY_TO_WEEKDAY[new Date(`${dateISO}T00:00:00Z`).getUTCDay()];

/**
 * What the plan assumed before the days off stopped being fixed. Used as the
 * suggestion when a week has nothing marked yet — never silently applied.
 */
export const DEFAULT_DAYS_OFF: Weekday[] = ['Fri'];
