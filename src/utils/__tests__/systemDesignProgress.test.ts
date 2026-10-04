import { describe, it, expect } from 'vitest';
import { allSystemDesignTopics } from '../../data/systemDesign';
import {
    checksPassed,
    isTopicConfident,
    confidentCount,
    nextTopic,
    topicsInProgress,
} from '../systemDesignProgress';
import type { SystemDesignProgress } from '../../services/firebaseService';

const EMPTY: SystemDesignProgress = { checks: {} };
const ALL_FOUR = { explain: true, draw: true, apply: true, tradeoffs: true };

describe('system design progress', () => {
    const [first, second, third] = allSystemDesignTopics;

    it('only counts a topic as confident when all four checks pass', () => {
        const three: SystemDesignProgress = { checks: { [first.id]: { explain: true, draw: true, apply: true, tradeoffs: false } } };
        expect(checksPassed(three, first.id)).toBe(3);
        expect(isTopicConfident(three, first.id)).toBe(false);

        const four: SystemDesignProgress = { checks: { [first.id]: ALL_FOUR } };
        expect(isTopicConfident(four, first.id)).toBe(true);
        expect(confidentCount(four, allSystemDesignTopics)).toBe(1);
    });

    it('treats a topic with no saved checks as zero passed', () => {
        expect(checksPassed(EMPTY, first.id)).toBe(0);
        expect(confidentCount(EMPTY, allSystemDesignTopics)).toBe(0);
    });

    it('points at the first topic in order that is not yet confident', () => {
        expect(nextTopic(EMPTY)?.id).toBe(first.id);

        // Skipping ahead does not move "next": the roadmap is taken in order.
        const skipped: SystemDesignProgress = { checks: { [first.id]: ALL_FOUR, [third.id]: ALL_FOUR } };
        expect(nextTopic(skipped)?.id).toBe(second.id);

        const everything: SystemDesignProgress = {
            checks: Object.fromEntries(allSystemDesignTopics.map(t => [t.id, ALL_FOUR])),
        };
        expect(nextTopic(everything)).toBeNull();
    });

    it('lists topics that are started but not finished', () => {
        const progress: SystemDesignProgress = {
            checks: { [first.id]: ALL_FOUR, [second.id]: { draw: true }, [third.id]: { explain: false } },
        };
        expect(topicsInProgress(progress).map(t => t.id)).toEqual([second.id]);
    });
});
