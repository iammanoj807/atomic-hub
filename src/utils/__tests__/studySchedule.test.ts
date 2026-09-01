import { describe, it, expect } from 'vitest';
import {
    getRoutineForWeek,
    getRoutineForDay,
    routineWeeklyHours,
    hoursOnDay,
    latestEndTime,
    endsTooLate,
    hasLightDay,
    isLightDay,
    minutesInto,
    weekdayOf,
    isWeekday,
    DEFAULT_DEEP_WORK_DAY,
} from '../studySchedule';
import {
    WEEKDAYS,
    FULL_WEEK_TARGET_HOURS,
    LATEST_END_TIME,
    type Weekday,
} from '../../data/studyPlan';

/** The slot kinds on a given day, for readable assertions. */
const kindsOn = (day: Weekday, deepWorkDay?: Weekday): string[] =>
    getRoutineForWeek(deepWorkDay)[day].map(slot => slot.kind);

describe('routineWeeklyHours', () => {
    it('comes to 27.13 hours on the default rota', () => {
        // Twenty-minute slots are thirds of an hour, so the total is not a
        // round number and the tolerance is doing real work here.
        expect(routineWeeklyHours()).toBeCloseTo(27.13, 2);
    });

    it('OPEN: the routine asks for more than the constant it logs against', () => {
        // FULL_WEEK_TARGET_HOURS is 24; the routine measures 27.13. Shortening
        // the mornings and merging the two book slots closed 3.3h of a 4.45h
        // gap without closing it. Which number is wrong is still the owner's
        // call, so this records what is left rather than hiding it.
        expect(routineWeeklyHours() - FULL_WEEK_TARGET_HOURS).toBeCloseTo(3.13, 2);
    });

    it('OPEN: the total still moves with the deep work day', () => {
        // Thursday holds only the three habits, so taking it for the build
        // costs the week nothing. Every other day gives up a full shift-day
        // shape that Friday already runs and so cannot absorb.
        for (const day of ['Thu', 'Sat', 'Sun'] as Weekday[]) {
            expect(routineWeeklyHours(day)).toBeCloseTo(27.13, 2);
        }
        for (const day of ['Mon', 'Tue', 'Wed', 'Fri'] as Weekday[]) {
            expect(routineWeeklyHours(day)).toBeCloseTo(24.80, 2);
        }
    });

    it('splits into the days the rota actually gives', () => {
        for (const day of ['Mon', 'Tue', 'Wed', 'Fri'] as Weekday[]) {
            expect(hoursOnDay(day)).toBeCloseTo(2.91, 2);
        }
        expect(hoursOnDay('Thu')).toBeCloseTo(7.33, 2);  // the day off, carrying the build
        expect(hoursOnDay('Sat')).toBeCloseTo(4.58, 2);  // the weekend shift ends at 14:00
        expect(hoursOnDay('Sun')).toBeCloseTo(3.58, 2);
    });
});

describe('getRoutineForDay', () => {
    it('gives Thursday the build and the three habits, because Thursday is off', () => {
        expect(kindsOn('Thu')).toEqual(['build', 'review', 'read', 'dsa', 'job']);
        expect(getRoutineForDay('Thursday')).toHaveLength(5);
    });

    it('runs Friday as an ordinary shift day', () => {
        // Friday used to be empty and was where displaced study landed. It now
        // runs the same shape as Monday, which is why nothing moves onto it.
        expect(kindsOn('Fri')).toEqual(['theory', 'read', 'dsa', 'book']);
        expect(getRoutineForDay('Friday')[0].start).toBe('05:30');
        expect(getRoutineForDay('Friday')[0].end).toBe('07:30');
    });

    it('does not print a block twice on Friday when the build takes a shift day', () => {
        // Tuesday's displaced morning is the same 05:30-07:30 theory Friday
        // already runs, so it is dropped rather than drawn on top of itself.
        const friday = kindsOn('Fri', 'Tue');
        expect(friday).toEqual(['theory', 'read', 'dsa', 'book']);
        expect(friday.filter(kind => kind === 'theory')).toHaveLength(1);
    });

    it('gives Sunday the afternoon block, the light hour and the habits', () => {
        expect(getRoutineForDay('Sunday')).toHaveLength(4);
        expect(kindsOn('Sun')).toEqual(['theory', 'light', 'read', 'dsa']);
        // The weekend shift ends at 14:00, so this is a real block.
        expect(getRoutineForDay('Sunday')[0].start).toBe('16:30');
    });

    it('leaves Thursday its habits when the build is elsewhere', () => {
        expect(kindsOn('Thu', 'Fri')).toEqual(['read', 'dsa', 'job']);
        expect(getRoutineForDay('Thursday', 'Fri')[0].kind).toBe('read');
    });

    it('starts the shift days on theory, at 05:30', () => {
        for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Friday']) {
            const morning = getRoutineForDay(day)[0];
            expect(morning.track).toBe('A - Theory');
            // The shift starts at 10:00, so finishing at 07:30 leaves real
            // room before it rather than a scramble out of the door.
            expect(morning.start).toBe('05:30');
            expect(morning.end).toBe('07:30');
        }
    });

    it('accepts the short day code as well as the full name', () => {
        expect(getRoutineForDay('Sun')).toEqual(getRoutineForDay('Sunday'));
    });

    it('returns nothing for a day that does not exist', () => {
        expect(getRoutineForDay('Someday')).toEqual([]);
    });
});

describe('the two habits that never move', () => {
    it('puts exactly one DSA slot on every day, for every deep work day', () => {
        for (const deepWorkDay of WEEKDAYS) {
            const week = getRoutineForWeek(deepWorkDay);
            for (const day of WEEKDAYS) {
                expect(week[day].filter(slot => slot.kind === 'dsa')).toHaveLength(1);
            }
        }
    });

    it('puts exactly one reading slot on every day, for every deep work day', () => {
        // Twenty minutes every single day, never skipped and never doubled.
        for (const deepWorkDay of WEEKDAYS) {
            const week = getRoutineForWeek(deepWorkDay);
            for (const day of WEEKDAYS) {
                expect(week[day].filter(slot => slot.kind === 'read')).toHaveLength(1);
            }
        }
    });

    it('puts applications on the two days that have room for them', () => {
        // Applications are no longer daily: the shift-day evenings are spent
        // on Chip Huyen and DDIA instead.
        for (const deepWorkDay of WEEKDAYS) {
            const week = getRoutineForWeek(deepWorkDay);
            const withJob = WEEKDAYS.filter(day => week[day].some(slot => slot.kind === 'job'));
            expect(withJob).toEqual(['Thu', 'Sat']);
        }
    });

    it('runs applications immediately after DSA', () => {
        const week = getRoutineForWeek();
        for (const day of ['Thu', 'Sat'] as Weekday[]) {
            const dsa = week[day].find(slot => slot.kind === 'dsa')!;
            const job = week[day].find(slot => slot.kind === 'job')!;
            expect(job.start).toBe(dsa.end);
        }
    });

    it('runs the reading immediately before DSA', () => {
        for (const day of WEEKDAYS) {
            const slots = getRoutineForWeek()[day];
            const read = slots.find(slot => slot.kind === 'read')!;
            const dsa = slots.find(slot => slot.kind === 'dsa')!;
            expect(dsa.start).toBe(read.end);
        }
    });

    it('keeps applications on Track B', () => {
        expect(getRoutineForDay('Thursday').find(s => s.kind === 'job')!.track)
            .toBe('B - Job');
    });
});

describe('the 21:00 rule', () => {
    it('finishes no later than 21:00 whichever day the deep work lands on', () => {
        for (const deepWorkDay of WEEKDAYS) {
            const week = getRoutineForWeek(deepWorkDay);
            for (const day of WEEKDAYS) {
                for (const slot of week[day]) {
                    expect(minutesInto(slot.end)).toBeLessThanOrEqual(minutesInto(LATEST_END_TIME));
                }
            }
            expect(endsTooLate(deepWorkDay)).toBe(false);
        }
    });

    it('actually finishes at 20:35 — a 05:30 start needs the evening back', () => {
        // One book instead of two took ten minutes off the back of the day,
        // which is what makes a 22:30 bedtime reachable.
        expect(latestEndTime()).toBe('20:35');
    });
});

describe('the deep work day', () => {
    it('defaults to Thursday, the day the rota gives off', () => {
        expect(DEFAULT_DEEP_WORK_DAY).toBe('Thu');
        expect(kindsOn('Thu')).toContain('build');
        expect(routineWeeklyHours()).toBeCloseTo(27.13, 2);
    });

    it('moves the build when a different day is set', () => {
        expect(kindsOn('Wed', 'Wed')).toContain('build');
        expect(kindsOn('Fri', 'Wed')).not.toContain('build');
    });

    it('replaces that day\'s study but keeps the three habits', () => {
        // Wednesday's 2.5 hours of theory cannot sit beside a six-hour build,
        // but reading and the problem are twenty minutes each and survive.
        expect(kindsOn('Wed')).toEqual(['theory', 'read', 'dsa', 'book']);
        expect(kindsOn('Wed', 'Wed')).toEqual(['build', 'review', 'read', 'dsa']);
    });

    it('moves displaced study to Friday only when Friday does not already run it', () => {
        // Wednesday's blocks are Friday's blocks, so nothing moves.
        expect(kindsOn('Fri', 'Wed')).toEqual(['theory', 'read', 'dsa', 'book']);
        // Saturday's afternoon is at a time Friday has free, so it does move.
        expect(kindsOn('Fri', 'Sat')).toEqual(expect.arrayContaining(['aieng', 'papers']));
    });

    it('keeps every slot in clock order after the move', () => {
        for (const deepWorkDay of WEEKDAYS) {
            const week = getRoutineForWeek(deepWorkDay);
            for (const day of WEEKDAYS) {
                const starts = week[day].map(slot => minutesInto(slot.start));
                expect([...starts].sort((a, b) => a - b)).toEqual(starts);
            }
        }
    });

    it('never calls Friday a light day just because it holds the review hour', () => {
        // Sunday's hour moves to Friday when the build takes Sunday. Friday is
        // still a working day and must not be drawn as the week's breather.
        expect(kindsOn('Fri', 'Sun')).toContain('light');
        expect(isLightDay('Fri', 'Sun')).toBe(false);
        expect(isLightDay('Sun', 'Fri')).toBe(true);
    });

    it('takes the light day away when Sunday is chosen', () => {
        expect(hasLightDay()).toBe(true);
        expect(hasLightDay('Sun')).toBe(false);
        expect(kindsOn('Sun', 'Sun')).toEqual(['build', 'review', 'read', 'dsa']);
        // The hour of review moves rather than vanishing.
        expect(kindsOn('Fri', 'Sun')).toContain('light');
    });
});

describe('weekdayOf / isWeekday', () => {
    it('reads the plan start as a Monday', () => {
        expect(weekdayOf('2026-08-24')).toBe('Mon');
    });

    it('reads the plan end as a Sunday', () => {
        expect(weekdayOf('2027-02-21')).toBe('Sun');
    });

    it('is not shifted by the local timezone', () => {
        expect(weekdayOf('2026-08-15')).toBe('Sat');
    });

    it('accepts only the seven day codes', () => {
        expect(isWeekday('Fri')).toBe(true);
        expect(isWeekday('Friday')).toBe(false);
        expect(isWeekday(undefined)).toBe(false);
    });
});
