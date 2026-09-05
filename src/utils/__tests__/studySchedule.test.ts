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
    it('comes to 34.13 hours on the default rota', () => {
        // Twenty-minute slots are thirds of an hour, so the total is not a
        // round number and the tolerance is doing real work here.
        expect(routineWeeklyHours()).toBeCloseTo(34.13, 2);
    });

    it('OPEN: the routine asks for more than the constant it logs against', () => {
        // FULL_WEEK_TARGET_HOURS is 34; the routine measures 34.13. The two
        // fixed days off carry about eight hours each, which is what finally
        // made the constant and the timetable agree to within a rounding of
        // twenty-minute slots. Ten minutes is the whole remaining gap.
        expect(routineWeeklyHours() - FULL_WEEK_TARGET_HOURS).toBeCloseTo(0.13, 2);
    });

    it('holds the same total whichever day carries the build, bar Saturday', () => {
        // The build only pushes aside what it would physically sit on top of,
        // so the 05:30 mornings and the evening habits survive a day off and
        // the week comes to the same total wherever the build lands.
        for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sun'] as Weekday[]) {
            expect(routineWeeklyHours(day)).toBeCloseTo(34.13, 2);
        }
        // Saturday is the one real exception: its applied ML blocks run
        // 09:00-15:00, exactly where the build goes, so they cannot both happen.
        expect(routineWeeklyHours('Sat')).toBeCloseTo(29.13, 2);
    });

    it('splits into the days the rota actually gives', () => {
        for (const day of ['Mon', 'Tue', 'Wed', 'Fri'] as Weekday[]) {
            expect(hoursOnDay(day)).toBeCloseTo(2.91, 2);
        }
        // The two days off carry the week; the shift days are deliberately short.
        expect(hoursOnDay('Thu')).toBeCloseTo(9.33, 2);  // build, then the ML course
        expect(hoursOnDay('Sat')).toBeCloseTo(9.58, 2);  // ML, messy data, project, papers
        expect(hoursOnDay('Sun')).toBeCloseTo(3.58, 2);  // still a 10:00-14:00 shift
    });
});

describe('getRoutineForDay', () => {
    it('gives Thursday the build, the ML course and the habits, because it is off', () => {
        expect(kindsOn('Thu')).toEqual(['build', 'review', 'mlcourse', 'read', 'dsa', 'job']);
        expect(getRoutineForDay('Thursday')).toHaveLength(6);
    });

    it('gives Saturday the long applied block, now that it is a day off too', () => {
        expect(kindsOn('Sat')).toEqual(
            ['mlcourse', 'applied', 'aieng', 'papers', 'read', 'dsa', 'job']
        );
        expect(getRoutineForDay('Saturday')[0].start).toBe('09:00');
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

    it('keeps the ML course on Thursday even when the build is elsewhere', () => {
        // It is on a day off because it needs a long block; pushing it onto a
        // shift day would put two hours of course work after an eight-hour day.
        expect(kindsOn('Thu', 'Fri')).toEqual(['mlcourse', 'read', 'dsa', 'job']);
        expect(getRoutineForDay('Thursday', 'Fri')[0].kind).toBe('mlcourse');
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
        expect(routineWeeklyHours()).toBeCloseTo(34.13, 2);
    });

    it('moves the build when a different day is set', () => {
        expect(kindsOn('Wed', 'Wed')).toContain('build');
        expect(kindsOn('Fri', 'Wed')).not.toContain('build');
    });

    it('keeps everything the build does not sit on top of', () => {
        // The morning stage is 05:30-07:30 and the build 09:00-15:00. They
        // never overlapped, so a Wednesday day off keeps its morning instead
        // of losing it to a rule that assumed they did.
        expect(kindsOn('Wed')).toEqual(['theory', 'read', 'dsa', 'book']);
        expect(kindsOn('Wed', 'Wed')).toEqual(['theory', 'build', 'review', 'read', 'dsa', 'book']);
    });

    it('drops only what genuinely clashes, and moves nothing to Friday', () => {
        // Friday is a full shift day now; there is nowhere to relocate a
        // daytime block to, so nothing is pretended into its timetable.
        expect(kindsOn('Fri', 'Wed')).toEqual(['theory', 'read', 'dsa', 'book']);
        expect(kindsOn('Fri', 'Sat')).toEqual(['theory', 'read', 'dsa', 'book']);
        // Saturday's ML blocks sit exactly under the build, so they go.
        expect(kindsOn('Sat', 'Sat')).not.toContain('mlcourse');
        expect(kindsOn('Sat', 'Sat')).not.toContain('applied');
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

    it('never calls a day other than Sunday the light day', () => {
        // Nothing relocates any more, so the light hour cannot turn up on
        // Friday at all - but the guard is cheap and the rule is Sunday only.
        for (const deepWorkDay of WEEKDAYS) {
            expect(isLightDay('Fri', deepWorkDay)).toBe(false);
            expect(kindsOn('Fri', deepWorkDay)).not.toContain('light');
        }
    });

    it('keeps the light day even when Sunday carries the build', () => {
        // The build finishes at 15:15 and Sunday's afternoon runs 16:30-19:30,
        // so the light hour survives it. Under the old rule the whole day was
        // stripped and Sunday silently lost its light day.
        expect(hasLightDay()).toBe(true);
        expect(hasLightDay('Sun')).toBe(true);
        // Sunday's afternoon theory and the light hour run 16:30-19:30, which
        // is after the build finishes, so they survive it - the day is simply
        // very long rather than stripped.
        expect(kindsOn('Sun', 'Sun')).toEqual(
            ['build', 'review', 'theory', 'light', 'read', 'dsa']
        );
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
