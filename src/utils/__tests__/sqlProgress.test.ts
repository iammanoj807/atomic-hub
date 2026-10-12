import { describe, it, expect } from 'vitest';
import { allSqlTopics } from '../../data/sql';
import {
    checksPassed,
    isTopicConfident,
    confidentCount,
    nextTopic,
    topicsInProgress,
} from '../sqlProgress';
import type { SqlProgress } from '../../services/firebaseService';

const EMPTY: SqlProgress = { checks: {} };
const ALL_FOUR = { explain: true, write: true, predict: true, edge: true };

describe('SQL progress', () => {
    const [first, second, third] = allSqlTopics;

    it('only counts a topic as confident when all four checks pass', () => {
        const three: SqlProgress = { checks: { [first.id]: { explain: true, write: true, predict: true, edge: false } } };
        expect(checksPassed(three, first.id)).toBe(3);
        expect(isTopicConfident(three, first.id)).toBe(false);

        const four: SqlProgress = { checks: { [first.id]: ALL_FOUR } };
        expect(isTopicConfident(four, first.id)).toBe(true);
        expect(confidentCount(four, allSqlTopics)).toBe(1);
    });

    it('treats a topic with no saved checks as zero passed', () => {
        expect(checksPassed(EMPTY, first.id)).toBe(0);
        expect(confidentCount(EMPTY, allSqlTopics)).toBe(0);
    });

    it('points at the first topic in order that is not yet confident', () => {
        expect(nextTopic(EMPTY)?.id).toBe(first.id);

        // Skipping ahead does not move "next": the roadmap is taken in order.
        const skipped: SqlProgress = { checks: { [first.id]: ALL_FOUR, [third.id]: ALL_FOUR } };
        expect(nextTopic(skipped)?.id).toBe(second.id);

        const everything: SqlProgress = {
            checks: Object.fromEntries(allSqlTopics.map(t => [t.id, ALL_FOUR])),
        };
        expect(nextTopic(everything)).toBeNull();
    });

    it('lists topics that are started but not finished', () => {
        const progress: SqlProgress = {
            checks: { [first.id]: ALL_FOUR, [second.id]: { write: true }, [third.id]: { explain: false } },
        };
        expect(topicsInProgress(progress).map(t => t.id)).toEqual([second.id]);
    });
});
