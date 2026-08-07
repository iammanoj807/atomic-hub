import { describe, it, expect } from 'vitest';
import { computeReadiness, daysBetween } from '../practice';
import type { PracticeRecord } from '../../services/firebaseService';

const record = (
    questionId: string,
    reps: number,
    lastPractisedAt: string,
    confidence: 1 | 2 | 3
): PracticeRecord => ({ questionId, reps, lastPractisedAt, confidence });

const TODAY = '2026-08-07';

describe('daysBetween', () => {
    it('counts whole days forward', () => {
        expect(daysBetween('2026-08-01', '2026-08-07')).toBe(6);
    });

    it('is zero for the same day', () => {
        expect(daysBetween(TODAY, TODAY)).toBe(0);
    });

    it('crosses a British Summer Time boundary without drifting', () => {
        // BST ends 25 October 2026. A naive local-time diff loses an hour here
        // and can round to the wrong number of days.
        expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    });

    it('returns 0 rather than NaN for an unparseable date', () => {
        expect(daysBetween('not-a-date', TODAY)).toBe(0);
    });
});

describe('computeReadiness', () => {
    it('reports zeros for an empty question set', () => {
        const result = computeReadiness([], {}, TODAY);
        expect(result).toEqual({
            coverage: 0, freshness: 0, confidence: 0, practisedCount: 0, totalCount: 0,
        });
    });

    it('does not count a question towards coverage if completed is false', () => {
        const records = { a: record('a', 1, TODAY, 3) };
        const result = computeReadiness([{ id: 'a', completed: false }], records, TODAY);

        expect(result.coverage).toBe(0);
        expect(result.practisedCount).toBe(1);
    });

    it('counts a question as covered when marked completed', () => {
        const records = { a: record('a', 2, TODAY, 1) };
        expect(computeReadiness([{ id: 'a', completed: true }], records, TODAY).coverage).toBe(100);
    });

    it('drops freshness once a question passes the 7 day window', () => {
        const fresh = { a: record('a', 2, '2026-08-01', 2) };   // 6 days
        const stale = { a: record('a', 2, '2026-07-30', 2) };   // 8 days

        expect(computeReadiness([{ id: 'a', completed: false }], fresh, TODAY).freshness).toBe(100);
        expect(computeReadiness([{ id: 'a', completed: false }], stale, TODAY).freshness).toBe(0);
    });

    it('averages confidence over practised questions only', () => {
        // Two practised (3 and 1), one never touched. The untouched question
        // must not drag the average down — it has no confidence to report.
        const records = {
            a: record('a', 2, TODAY, 3),
            b: record('b', 2, TODAY, 1),
        };
        const result = computeReadiness([
            { id: 'a', completed: false },
            { id: 'b', completed: false },
            { id: 'c', completed: false }
        ], records, TODAY);

        expect(result.confidence).toBe(2);
        expect(result.practisedCount).toBe(2);
        expect(result.totalCount).toBe(3);
    });

    it('measures coverage against every question, not just practised ones', () => {
        const records = { a: record('a', 5, TODAY, 3) };
        // One of four covered.
        expect(computeReadiness([
            { id: 'a', completed: true },
            { id: 'b', completed: false },
            { id: 'c', completed: false },
            { id: 'd', completed: false }
        ], records, TODAY).coverage).toBe(25);
    });

    it('can go down as questions go stale', () => {
        const records = { a: record('a', 2, '2026-08-07', 2) };

        const onTheDay = computeReadiness([{ id: 'a', completed: true }], records, '2026-08-07');
        const muchLater = computeReadiness([{ id: 'a', completed: true }], records, '2026-09-30');

        expect(onTheDay.freshness).toBe(100);
        expect(muchLater.freshness).toBe(0);
        // Coverage is a lifetime measure, so it holds.
        expect(muchLater.coverage).toBe(100);
    });
});
