import { describe, it, expect } from 'vitest';
import {
    addDays,
    allDrillProblems,
    buildSession,
    choicesFor,
    drillSummary,
    dueCards,
    isCorrectChoice,
    reviewCard,
    topicAccuracy,
    type DrillState,
} from '../patternDrill';

const TODAY = '2026-10-06';

describe('dates', () => {
    it('adds days across month and year ends', () => {
        expect(addDays('2026-10-06', 1)).toBe('2026-10-07');
        expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
        expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    });
});

describe('reviewing cards (Leitner boxes)', () => {
    it('moves a right answer up a box and spaces it out: 1, 3, 7, 14, 30 days', () => {
        let state: DrillState = {};
        const expected = [
            [1, '2026-10-07'],
            [2, '2026-10-09'],
            [3, '2026-10-13'],
            [4, '2026-10-20'],
            [5, '2026-11-05'],
            [5, '2026-11-05'],
        ];
        for (const [box, due] of expected) {
            state = reviewCard(state, 'two-sum', true, TODAY);
            expect(state['two-sum'].box).toBe(box);
            expect(state['two-sum'].due).toBe(due);
        }
        expect(state['two-sum'].reviews).toBe(6);
        expect(state['two-sum'].correct).toBe(6);
    });

    it('sends a wrong answer back to box 1, due tomorrow, without changing the old state', () => {
        const before: DrillState = { 'two-sum': { box: 4, due: TODAY, reviews: 4, correct: 4 } };
        const after = reviewCard(before, 'two-sum', false, TODAY);
        expect(after['two-sum']).toEqual({ box: 1, due: '2026-10-07', reviews: 5, correct: 4 });
        expect(before['two-sum'].box).toBe(4);
    });
});

describe('building a session', () => {
    it('starts with new cards in curriculum order', () => {
        expect(buildSession({}, TODAY)).toEqual(allDrillProblems.slice(0, 5).map(p => p.id));
    });

    it('puts due reviews first, oldest first, and never goes over the maximum', () => {
        const state: DrillState = {
            '3sum': { box: 2, due: '2026-10-05', reviews: 2, correct: 1 },
            'two-sum': { box: 1, due: '2026-10-01', reviews: 1, correct: 0 },
            'lru-cache': { box: 3, due: '2026-10-20', reviews: 3, correct: 3 },
        };
        expect(dueCards(state, TODAY)).toEqual(['two-sum', '3sum']);
        const session = buildSession(state, TODAY, { max: 4, newCards: 5 });
        expect(session.slice(0, 2)).toEqual(['two-sum', '3sum']);
        expect(session).toHaveLength(4);
        expect(session).not.toContain('lru-cache');
    });

    it('can limit the session to topics already studied', () => {
        const session = buildSession({}, TODAY, { topicIds: ['stack'], newCards: 10 });
        expect(session.length).toBe(6);
        expect(session.every(id => allDrillProblems.find(p => p.id === id)?.topicId === 'stack')).toBe(true);
    });
});

describe('answer options', () => {
    it('gives 4 different options with exactly one correct, and the same ones every time', () => {
        for (const problem of allDrillProblems) {
            const options = choicesFor(problem.id);
            expect(new Set(options).size).toBe(4);
            expect(options.filter(id => isCorrectChoice(problem.id, id))).toHaveLength(1);
            expect(choicesFor(problem.id)).toEqual(options);
        }
    });

    it('accepts listed alternatives as correct', () => {
        expect(isCorrectChoice('merge-k-sorted-lists', 'linked-list')).toBe(true);
        expect(isCorrectChoice('merge-k-sorted-lists', 'heap-priority-queue')).toBe(true);
        expect(isCorrectChoice('merge-k-sorted-lists', 'trees')).toBe(false);
    });
});

describe('progress summaries', () => {
    it('counts boxes, unseen and mastered cards, and accuracy per topic', () => {
        let state: DrillState = {};
        state = reviewCard(state, 'two-sum', true, TODAY);
        state = reviewCard(state, 'valid-parentheses', false, TODAY);
        const summary = drillSummary(state);
        expect(summary.boxes).toEqual([2, 0, 0, 0, 0]);
        expect(summary.unseen).toBe(148);
        expect(summary.mastered).toBe(0);
        expect(topicAccuracy(state)).toEqual({
            'arrays-hashing': { reviews: 1, correct: 1 },
            stack: { reviews: 1, correct: 0 },
        });
    });
});
