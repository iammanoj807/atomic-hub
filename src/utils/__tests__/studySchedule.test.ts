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
    it('matches the target the plan logs against', () => {
        // 0.75 and 0.25 hour slots are all multiples of a quarter, so this is
        // exact in practice — the tolerance is here so a future half-hour slot
        // cannot make the suite fail for a reason nobody cares about.
        expect(routineWeeklyHours()).toBeCloseTo(FULL_WEEK_TARGET_HOURS, 5);
    });

    it('comes to 29 hours', () => {
        expect(routineWeeklyHours()).toBeCloseTo(29, 5);
    });

    it('stays at 29 hours whichever day the deep work lands on', () => {
        for (const day of WEEKDAYS) {
            expect(routineWeeklyHours(day)).toBeCloseTo(29, 5);
        }
    });

    it('splits into the days the rota actually gives', () => {
        for (const day of ['Mon', 'Tue', 'Wed'] as Weekday[]) {
            expect(hoursOnDay(day)).toBeCloseTo(3.75, 5);
        }
        expect(hoursOnDay('Thu')).toBeCloseTo(6.5, 5);   // the day off, carrying the build
        expect(hoursOnDay('Fri')).toBeCloseTo(3.75, 5);  // Thursday's displaced morning
        expect(hoursOnDay('Sat')).toBeCloseTo(5.25, 5);
        expect(hoursOnDay('Sun')).toBeCloseTo(2.25, 5);
    });
});

describe('getRoutineForDay', () => {
    it('gives Thursday four slots, because Thursday is the day off', () => {
        expect(kindsOn('Thu')).toEqual(['build', 'review', 'dsa', 'job']);
        expect(getRoutineForDay('Thursday')).toHaveLength(4);
    });

    it('gives Friday the morning Thursday could not keep', () => {
        // Friday is a full shift but has no study of its own, so Thursday's
        // 06:00-08:30 block lands there at exactly the time it would have run.
        const friday = getRoutineForDay('Friday');
        expect(friday.map(s => s.kind)).toEqual(['aieng', 'dsa', 'job']);
        expect(friday[0].start).toBe('06:00');
        expect(friday[0].end).toBe('08:30');
    });

    it('leaves Friday with only the two habits when the build moves elsewhere', () => {
        expect(kindsOn('Fri', 'Tue')).toContain('dsa');
        expect(kindsOn('Fri', 'Tue')).toContain('job');
        expect(kindsOn('Fri', 'Tue')).not.toContain('build');
    });

    it('gives Sunday exactly three slots: DSA, applications, light review', () => {
        expect(getRoutineForDay('Sunday')).toHaveLength(3);
        expect(kindsOn('Sun')).toEqual(['dsa', 'job', 'light']);
    });

    it('keeps Thursday on the AI engineering track when the build is elsewhere', () => {
        const morning = getRoutineForDay('Thursday', 'Fri')[0];
        expect(morning.kind).toBe('aieng');
        expect(morning.track).toBe('B - AI Eng');
    });

    it('starts Monday to Wednesday on theory, at 06:00', () => {
        for (const day of ['Monday', 'Tuesday', 'Wednesday']) {
            const morning = getRoutineForDay(day)[0];
            expect(morning.track).toBe('A - Theory');
            // The shift starts at 10:00, so 06:00 buys the same 2.5 hours as
            // 05:00 did and an hour more sleep.
            expect(morning.start).toBe('06:00');
            expect(morning.end).toBe('08:30');
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

    it('puts exactly one job applications slot on every day, for every deep work day', () => {
        for (const deepWorkDay of WEEKDAYS) {
            const week = getRoutineForWeek(deepWorkDay);
            for (const day of WEEKDAYS) {
                expect(week[day].filter(slot => slot.kind === 'job')).toHaveLength(1);
            }
        }
    });

    it('runs applications immediately after DSA', () => {
        for (const day of WEEKDAYS) {
            const slots = getRoutineForWeek()[day];
            const dsa = slots.find(slot => slot.kind === 'dsa')!;
            const job = slots.find(slot => slot.kind === 'job')!;
            expect(job.start).toBe(dsa.end);
        }
    });

    it('keeps applications on Track B', () => {
        expect(getRoutineForDay('Monday').find(s => s.kind === 'job')!.track)
            .toBe('B - Job applications');
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

    it('actually finishes at 20:45 — a 06:00 start needs the evening back', () => {
        expect(latestEndTime()).toBe('20:45');
    });
});

describe('the deep work day', () => {
    it('defaults to Thursday, the day the rota gives off', () => {
        expect(DEFAULT_DEEP_WORK_DAY).toBe('Thu');
        expect(kindsOn('Thu')).toContain('build');
        expect(routineWeeklyHours()).toBeCloseTo(29, 5);
    });

    it('moves the build when a different day is set', () => {
        expect(kindsOn('Wed', 'Wed')).toContain('build');
        expect(kindsOn('Fri', 'Wed')).not.toContain('build');
    });

    it('replaces that day\'s study but keeps DSA and applications', () => {
        // Wednesday's 2.5 hours of theory cannot sit beside a five-hour build.
        expect(kindsOn('Wed')).toEqual(['theory', 'dsa', 'job']);
        expect(kindsOn('Wed', 'Wed')).toEqual(['build', 'review', 'dsa', 'job']);
    });

    it('moves the displaced study to Friday rather than losing it', () => {
        expect(kindsOn('Fri', 'Wed')).toContain('theory');
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
        expect(kindsOn('Sun', 'Sun')).toEqual(['build', 'review', 'dsa', 'job']);
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
