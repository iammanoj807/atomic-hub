// Joining the shape of the day to the content of the week.
//
// The week's content lives as paragraphs on planWeeks and as structured
// entries in weekResources; the shape of the day lives as slots in
// dailyRoutine. Nothing joined them, so answering "it is Tuesday, what am I
// doing at 06:00" meant reading two screens and holding both in your head.
// This is that join, in one place, so the answer can be rendered rather than
// worked out.

import {
    planWeeks,
    LIGHT_DAY_NOTE,
    THEORY_TRACK_LAST_WEEK,
    type SlotKind,
    type Weekday,
    type PlanWeek,
} from '../data/studyPlan';
import { getWeekResources, type WeekResource } from '../data/studyResources';
import { dsaPatterns, type DSAPatternPlan } from '../data/studyPlan';
import { minutesInto } from './studySchedule';

export interface SlotLink {
    label: string;
    to: string;
}

/** What one slot of today actually asks for. */
export interface SlotFocus {
    /** The sentence from the plan, when the plan has one for this slot. */
    text?: string;
    /** The exact thing to watch, read or build, when a resource backs it. */
    resource?: WeekResource;
    link?: SlotLink;
    /** The Thursday review ritual is the one slot that opens the week log. */
    opensWeekLog?: boolean;
}

const resourceOfKind = (week: number, kind: WeekResource['kind']): WeekResource | undefined =>
    getWeekResources(week).find(r => r.kind === kind);

/**
 * The theory mornings run Monday to Wednesday and each has a different job:
 * watch it, read it, then build it. Any other day only holds theory because
 * the deep work block displaced it there, and then the week's whole theory
 * sentence is the honest answer.
 */
const theoryFocus = (day: Weekday, week: PlanWeek): SlotFocus => {
    // Monday and Tuesday hand over to the resource itself. The week's theory
    // line names all three jobs at once ("WATCH ... READ ... BUILD ..."), so
    // printing it on Read day would describe two days you are not having.
    if (day === 'Mon') return { resource: resourceOfKind(week.week, 'watch') };
    if (day === 'Tue') return { resource: resourceOfKind(week.week, 'read') };
    if (day === 'Wed') return { text: buildSentence(week.theory) };
    return { text: week.theory };
};

/**
 * Wednesday is for the BUILD half of the week's theory line. The sentences are
 * written as "WATCH ... READ ... BUILD ...", so the build instruction can be
 * lifted out; weeks without one (consolidation weeks) keep the whole line.
 */
export const buildSentence = (theory: string): string => {
    const at = theory.indexOf('BUILD:');
    return at === -1 ? theory : theory.slice(at).trim();
};

/**
 * What to show against a slot. Keyed on the slot kind rather than the day,
 * because the deep work day moves and a block keeps its meaning wherever it
 * lands — only theory reads differently depending on which morning it is.
 */
export const resolveSlotFocus = (
    day: Weekday,
    kind: SlotKind,
    week: PlanWeek
): SlotFocus => {
    switch (kind) {
        case 'theory':
            return theoryFocus(day, week);
        case 'aieng':
            return {
                text: week.saturdayFocus ?? week.aiEng,
                resource: resourceOfKind(week.week, 'aieng'),
            };
        case 'book':
            return {
                text: 'Chip Huyen, AI Engineering. Twenty minutes, straight after '
                    + 'the problem. Reading only - no building, no notes to write up.',
            };
        case 'build':
            return { text: week.deepWork, resource: resourceOfKind(week.week, 'build') };
        case 'review':
            return {
                text: 'The weekly review ritual: what you finished, and one thing you understand now that you did not last week.',
                opensWeekLog: true,
            };
        case 'read':
            return { text: 'Twenty minutes of the reading ladder. Every day, never doubled.' };
        case 'systems':
            return { text: 'Designing Data-Intensive Applications. Twenty minutes, straight after the problem.' };
        case 'papers':
            return {
                text: 'Read papers. Write the main idea in your own words or it did not happen.',
                link: { label: 'Papers log', to: '/study/logbook?tab=papers' },
            };
        case 'light':
            return { text: LIGHT_DAY_NOTE };
        case 'dsa':
            return { text: week.dsa, link: { label: 'NeetCode hub', to: '/dsa' } };
        case 'job':
            return { text: 'Applications and outreach. Thirty minutes, every day, straight after DSA.' };
        default:
            return {};
    }
};

export type SlotState = 'done' | 'now' | 'later';

/** Where a slot sits against the clock. 'now' is the one to look at. */
export const slotState = (start: string, end: string, nowHHMM: string): SlotState => {
    const now = minutesInto(nowHHMM);
    if (now >= minutesInto(end)) return 'done';
    if (now >= minutesInto(start)) return 'now';
    return 'later';
};

/**
 * The DSA pattern a week belongs to.
 *
 * The patterns cover the first 26 weeks; the back half of the year is the same
 * ladder again without the videos, so week 27 folds onto week 1 rather than
 * leaving half the plan with no pattern at all.
 */
export const patternForWeek = (week: number): DSAPatternPlan | undefined => {
    const inFirstPass = week > 26 ? week - 26 : week;
    return dsaPatterns.find(pattern => {
        const parts = pattern.weeks.split('-').map(Number);
        return parts.length === 2
            ? inFirstPass >= parts[0] && inFirstPass <= parts[1]
            : parts[0] === inFirstPass;
    });
};

/**
 * How many theory weeks are left, counting this one. Consolidation weeks are
 * review rather than new material, so they do not count — 45 of the 52 are
 * real, and that is the number worth seeing early.
 */
export const theoryWeeksLeft = (currentWeek: number): number =>
    planWeeks.filter(
        w => w.week >= currentWeek
            && w.week <= THEORY_TRACK_LAST_WEEK
            && w.phaseKey !== 'consolidation'
    ).length;

/** Whether the mornings still belong to theory at all. They always do now. */
export const isTheoryTrackWeek = (week: number): boolean =>
    week <= THEORY_TRACK_LAST_WEEK;
