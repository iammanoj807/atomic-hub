import { describe, it, expect } from 'vitest';
import { buildWeekSchedule, weekdayOf, getDaySchedule } from '../studySchedule';
import type { Weekday, SessionKind } from '../../data/studyPlan';

/** The session kinds on a given day, for readable assertions. */
const kindsOn = (daysOff: Weekday[], day: Weekday): SessionKind[] => {
    const schedule = buildWeekSchedule(daysOff);
    return getDaySchedule(schedule, day)!.sessions.map(session => session.kind);
};

describe('buildWeekSchedule with Friday off', () => {
    // This is the arrangement the original spreadsheet hard-coded, so it is the
    // case that proves the generator did not change the plan, only freed it.
    const schedule = buildWeekSchedule(['Fri']);

    it('puts deep work on the Friday and stops after it', () => {
        expect(kindsOn(['Fri'], 'Fri')).toEqual(['deep', 'rest']);
    });

    it('gives Monday to Thursday theory and DSA', () => {
        for (const day of ['Mon', 'Tue', 'Wed', 'Thu'] as Weekday[]) {
            expect(kindsOn(['Fri'], day)).toEqual(['theory', 'dsa']);
        }
    });

    it('puts AI engineering on Saturday and papers on Sunday', () => {
        expect(kindsOn(['Fri'], 'Sat')).toEqual(['aieng', 'dsa']);
        expect(kindsOn(['Fri'], 'Sun')).toEqual(['papers', 'dsa']);
    });

    it('adds up to the 24-hour week the plan asks for', () => {
        expect(schedule.totalHours).toBe(24);
    });

    it('knows which day is the anchor', () => {
        expect(schedule.deepWorkDay).toBe('Fri');
        expect(schedule.needsDayOff).toBe(false);
    });
});

describe('buildWeekSchedule when the day off moves', () => {
    it('moves deep work to Thursday', () => {
        expect(kindsOn(['Thu'], 'Thu')).toEqual(['deep', 'rest']);
        expect(kindsOn(['Thu'], 'Fri')).toEqual(['theory', 'dsa']);
    });

    it('keeps the same 24 hours wherever the day off lands', () => {
        for (const day of ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as Weekday[]) {
            expect(buildWeekSchedule([day]).totalHours).toBe(24);
        }
    });

    it('still closes the week with papers when Sunday is the day off', () => {
        const schedule = buildWeekSchedule(['Sun']);
        expect(kindsOn(['Sun'], 'Sun')).toEqual(['deep', 'rest']);
        // Papers slides to the last day that is left.
        expect(kindsOn(['Sun'], 'Sat')).toEqual(['papers', 'dsa']);
        expect(schedule.deepWorkDay).toBe('Sun');
    });
});

describe('buildWeekSchedule with two days off', () => {
    const schedule = buildWeekSchedule(['Thu', 'Fri']);

    it('anchors deep work on the first of them', () => {
        expect(kindsOn(['Thu', 'Fri'], 'Thu')).toEqual(['deep', 'rest']);
    });

    it('gives the second day off to AI engineering', () => {
        expect(kindsOn(['Thu', 'Fri'], 'Fri')).toEqual(['aieng', 'dsa']);
    });

    it('does not care which order the days were marked in', () => {
        expect(buildWeekSchedule(['Fri', 'Thu'])).toEqual(schedule);
    });

    it('marks both days as off', () => {
        expect(schedule.days.filter(day => day.isOff).map(day => day.day)).toEqual(['Thu', 'Fri']);
    });

    it('leaves Saturday free for theory once AI engineering has a home', () => {
        expect(kindsOn(['Thu', 'Fri'], 'Sat')).toEqual(['theory', 'dsa']);
    });

    it('keeps the week review at the end of the week even when that day is off', () => {
        // Thursday and Sunday off: papers still closes the week on Sunday
        // rather than being displaced by AI engineering, because reviewing the
        // week and planning the next one only works at the end of it.
        expect(kindsOn(['Thu', 'Sun'], 'Sun')).toEqual(['papers', 'dsa']);
        expect(kindsOn(['Thu', 'Sun'], 'Sat')).toEqual(['aieng', 'dsa']);
        expect(buildWeekSchedule(['Thu', 'Sun']).totalHours).toBe(24);
    });
});

describe('buildWeekSchedule edge cases', () => {
    it('asks for a day off when none is marked', () => {
        const schedule = buildWeekSchedule([]);
        expect(schedule.needsDayOff).toBe(true);
        expect(schedule.deepWorkDay).toBeNull();
        // Everything else still stands up: the five hours of deep work are lost,
        // and that day becomes an ordinary theory morning with DSA in the evening.
        // 5 theory (10h) + AI eng (3.5) + papers (3) + 7 DSA (5.25) = 21.75.
        expect(schedule.totalHours).toBe(21.75);
        expect(schedule.days.every(day => day.sessions.some(s => s.kind === 'dsa'))).toBe(true);
    });

    it('turns a third day off into an ordinary theory day', () => {
        const kinds = kindsOn(['Mon', 'Tue', 'Wed'], 'Wed');
        expect(kinds).toEqual(['theory', 'dsa']);
    });

    it('keeps DSA on every day except the deep work day', () => {
        const schedule = buildWeekSchedule(['Wed']);
        const withDsa = schedule.days.filter(day =>
            day.sessions.some(session => session.kind === 'dsa')
        );
        expect(withDsa).toHaveLength(6);
        expect(withDsa.some(day => day.day === 'Wed')).toBe(false);
    });
});

describe('weekdayOf', () => {
    it('reads the plan start as a Monday', () => {
        expect(weekdayOf('2026-08-17')).toBe('Mon');
    });

    it('reads the plan end as a Sunday', () => {
        expect(weekdayOf('2027-02-14')).toBe('Sun');
    });

    it('is not shifted by the local timezone', () => {
        expect(weekdayOf('2026-08-15')).toBe('Sat');
    });
});
