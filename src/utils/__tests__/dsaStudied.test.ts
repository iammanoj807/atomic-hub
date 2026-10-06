import { describe, it, expect } from 'vitest';
import { studiedTopicIds, todaysDrill } from '../dsaStudied';
import { allDrillProblems } from '../patternDrill';

describe('studied topics for the pattern drill', () => {
    it('counts a topic once it has a solved problem from the curriculum', () => {
        expect(studiedTopicIds({})).toEqual([]);
        expect(studiedTopicIds({ 'two-pointers': { completedProblems: ['valid-palindrome'] } })).toEqual(['two-pointers']);
    });

    it('ignores solved ids that are no longer in the curriculum', () => {
        expect(studiedTopicIds({ 'two-pointers': { completedProblems: ['not-a-problem'] } })).toEqual([]);
    });

    it("builds today's drill from studied topics only, unless asked for all", () => {
        const progress = { 'two-pointers': { completedProblems: ['valid-palindrome'] } };
        const studied = todaysDrill({}, progress, '2026-10-06');
        const topicOf = (id: string) => allDrillProblems.find(p => p.id === id)?.topicId;
        expect(studied.length).toBeGreaterThan(0);
        expect(studied.every(id => topicOf(id) === 'two-pointers')).toBe(true);
        expect(todaysDrill({}, {}, '2026-10-06')).toEqual([]);
        expect(todaysDrill({}, {}, '2026-10-06', false).length).toBeGreaterThan(0);
    });
});
