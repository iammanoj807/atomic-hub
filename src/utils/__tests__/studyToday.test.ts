import { describe, it, expect } from 'vitest';
import {
    resolveSlotFocus,
    slotState,
    buildSentence,
    patternForWeek,
    theoryWeeksLeft,
    isTheoryTrackWeek,
} from '../studyToday';
import { getRoutineForDay, DEFAULT_DEEP_WORK_DAY } from '../studySchedule';
import {
    planWeeks,
    DAY_TITLES,
    WEEKDAYS,
    LIGHT_DAY_NOTE,
    THEORY_TRACK_LAST_WEEK,
} from '../../data/studyPlan';

const week1 = planWeeks[0];

describe('buildSentence', () => {
    it('lifts the BUILD half out of a theory line', () => {
        expect(buildSentence("WATCH 3B1B. READ Ch 2. BUILD: matrix ops by hand."))
            .toBe('BUILD: matrix ops by hand.');
    });

    it('keeps the whole line when there is no BUILD in it', () => {
        // Consolidation weeks are review, not build.
        const line = 'No new theory. Review weeks 1-3.';
        expect(buildSentence(line)).toBe(line);
    });
});

describe('resolveSlotFocus', () => {
    it('sends Monday theory to the week\'s watch resource, and nothing else', () => {
        const focus = resolveSlotFocus('Mon', 'theory', week1);
        expect(focus.resource?.kind).toBe('watch');
        expect(focus.resource?.title).toContain('Essence of Linear Algebra');
        // The theory line names all three days' jobs, so it stays off these two.
        expect(focus.text).toBeUndefined();
    });

    it('sends Tuesday theory to the week\'s read resource, and nothing else', () => {
        const focus = resolveSlotFocus('Tue', 'theory', week1);
        expect(focus.resource?.kind).toBe('read');
        expect(focus.text).toBeUndefined();
    });

    it('gives Wednesday the BUILD sentence and no resource', () => {
        const focus = resolveSlotFocus('Wed', 'theory', week1);
        expect(focus.text?.startsWith('BUILD:')).toBe(true);
        expect(focus.resource).toBeUndefined();
    });

    it('falls back to the whole theory line when theory is displaced elsewhere', () => {
        // Friday only ever holds theory because the build pushed it there.
        expect(resolveSlotFocus('Fri', 'theory', week1).text).toBe(week1.theory);
    });

    it('pairs the build slot with the week\'s deep work text and build resource', () => {
        const focus = resolveSlotFocus('Thu', 'build', week1);
        expect(focus.text).toBe(week1.deepWork);
        expect(focus.resource?.kind).toBe('build');
    });

    it('opens the week log from the review slot, and from nothing else', () => {
        expect(resolveSlotFocus('Thu', 'review', week1).opensWeekLog).toBe(true);
        for (const kind of ['theory', 'aieng', 'dsa', 'job', 'papers', 'light', 'build'] as const) {
            expect(resolveSlotFocus('Thu', kind, week1).opensWeekLog).toBeUndefined();
        }
    });

    it('pairs AI engineering with the week\'s aieng resource on Friday and Saturday', () => {
        for (const day of ['Fri', 'Sat'] as const) {
            const focus = resolveSlotFocus(day, 'aieng', week1);
            expect(focus.text).toBe(week1.aiEng);
            expect(focus.resource?.kind).toBe('aieng');
        }
    });

    it('points papers at the logbook and DSA at the hub', () => {
        expect(resolveSlotFocus('Sat', 'papers', week1).link?.to).toBe('/study/logbook?tab=papers');
        const dsa = resolveSlotFocus('Mon', 'dsa', week1);
        expect(dsa.text).toBe(week1.dsa);
        expect(dsa.link?.to).toBe('/dsa');
    });

    it('gives Sunday the light day note', () => {
        expect(resolveSlotFocus('Sun', 'light', week1).text).toBe(LIGHT_DAY_NOTE);
    });

    it('says what applications are, on every day that carries them', () => {
        expect(resolveSlotFocus('Sun', 'job', week1).text).toContain('Thirty minutes');
    });

    it('resolves something for every slot the routine actually produces', () => {
        // No day may render a slot the page cannot explain.
        for (const day of WEEKDAYS) {
            for (const slot of getRoutineForDay(day, DEFAULT_DEEP_WORK_DAY)) {
                const focus = resolveSlotFocus(day, slot.kind, week1);
                expect(focus.text ?? focus.resource).toBeTruthy();
            }
        }
    });
});

describe('slotState', () => {
    it('marks the slot the clock is inside as now', () => {
        expect(slotState('06:00', '08:30', '07:15')).toBe('now');
    });

    it('counts the start minute as started and the end minute as finished', () => {
        expect(slotState('06:00', '08:30', '06:00')).toBe('now');
        expect(slotState('06:00', '08:30', '08:30')).toBe('done');
    });

    it('marks what has not begun as later', () => {
        expect(slotState('19:30', '20:15', '09:00')).toBe('later');
    });
});

describe('the day names', () => {
    it('names all seven days', () => {
        for (const day of WEEKDAYS) {
            expect(DAY_TITLES[day]).toBeTruthy();
        }
    });

    it('calls Thursday the deep work day, matching where the build sits', () => {
        expect(DAY_TITLES[DEFAULT_DEEP_WORK_DAY]).toBe('Deep work day');
    });
});

describe('patternForWeek', () => {
    it('finds a pattern spanning several weeks', () => {
        expect(patternForWeek(1)?.name).toBe('Arrays & Hashing');
        expect(patternForWeek(2)?.name).toBe('Arrays & Hashing');
    });

    it('finds a pattern pinned to one week', () => {
        expect(patternForWeek(3)?.name).toBe('Two Pointers');
    });

    it('covers every week of the plan', () => {
        for (const week of planWeeks) {
            expect(patternForWeek(week.week)).toBeDefined();
        }
    });
});

describe('the theory track', () => {
    it('runs the whole plan now — nothing takes the mornings back', () => {
        expect(THEORY_TRACK_LAST_WEEK).toBe(52);
        expect(isTheoryTrackWeek(52)).toBe(true);
        expect(isTheoryTrackWeek(53)).toBe(false);
    });

    it('counts 45 real theory weeks, not 52', () => {
        // The seven consolidation weeks are review, not new material.
        expect(theoryWeeksLeft(1)).toBe(45);
    });

    it('counts down as the weeks go, this week included', () => {
        expect(theoryWeeksLeft(2)).toBe(44);
        expect(theoryWeeksLeft(52)).toBe(1);
    });

    it('does not count the consolidation weeks it passes', () => {
        // Week 7 is the first consolidation week, so it does not count itself.
        expect(theoryWeeksLeft(7)).toBe(theoryWeeksLeft(8));
    });

    it('reaches zero past the end of the plan', () => {
        expect(theoryWeeksLeft(53)).toBe(0);
    });

    it('agrees with the weeks the plan actually marks as theory', () => {
        const realTheoryWeeks = planWeeks.filter(
            w => w.week <= THEORY_TRACK_LAST_WEEK && w.phaseKey !== 'consolidation'
        ).length;
        expect(theoryWeeksLeft(1)).toBe(realTheoryWeeks);
    });
});
