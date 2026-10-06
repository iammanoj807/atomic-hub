import { describe, it, expect } from 'vitest';
import {
    foundationPhases,
    allFoundationTopics,
    allMiniBuilds,
    CHECK_KEYS,
    RESOURCE_KIND_ORDER,
} from '../../data/foundations';
import {
    checksPassed,
    isTopicConfident,
    confidentCount,
    buildsDone,
    nextTopic,
    topicsInProgress,
} from '../foundationsProgress';
import type { FoundationsProgress } from '../../services/firebaseService';

const EMPTY: FoundationsProgress = { checks: {}, builds: {} };
const ALL_FOUR = { explain: true, derive: true, build: true, break: true };

describe('foundations content', () => {
    it('gives every topic a note, its own resources and all four exercises', () => {
        const problems: string[] = [];
        for (const topic of allFoundationTopics) {
            if (!topic.name.trim()) problems.push(`${topic.id}: no name`);
            for (const field of ['idea', 'analogy', 'breaks'] as const) {
                if (!topic.note[field].trim()) problems.push(`${topic.id}: empty ${field}`);
            }
            if (!topic.note.example && !topic.note.code) problems.push(`${topic.id}: no example or code`);
            if (!topic.diagram.code.trim() || !topic.diagram.caption.trim()) problems.push(`${topic.id}: missing diagram or caption`);
            for (const key of CHECK_KEYS) {
                if (!topic.practice[key]?.trim()) problems.push(`${topic.id}: no ${key} exercise`);
            }
            // Papers are optional for now, so every topic needs something else to learn from.
            if (!topic.resources.some(r => r.kind !== 'paper')) problems.push(`${topic.id}: no non-paper resource`);
            for (const r of topic.resources) {
                if (!RESOURCE_KIND_ORDER.includes(r.kind)) problems.push(`${topic.id}: unknown kind ${r.kind}`);
                if (!r.title.trim() || !r.source.trim()) problems.push(`${topic.id}: resource missing title or source`);
                if (r.url && !/^https?:\/\//.test(r.url)) problems.push(`${topic.id}: bad url ${r.url}`);
            }
        }
        expect(problems).toEqual([]);
    });

    it('keeps ids unique, because they are the Firestore keys', () => {
        const topicIds = allFoundationTopics.map(topic => topic.id);
        const buildIds = allMiniBuilds.map(build => build.id);
        expect(new Set(topicIds).size).toBe(topicIds.length);
        expect(new Set(buildIds).size).toBe(buildIds.length);
    });

    it('has the full roadmap: 8 phases, 98 topics, 30 mini-builds', () => {
        expect(foundationPhases).toHaveLength(8);
        expect(allFoundationTopics).toHaveLength(98);
        expect(allMiniBuilds).toHaveLength(30);
        foundationPhases.forEach((phase, index) => {
            expect(phase.number).toBe(index);
            expect(phase.main.length).toBeGreaterThan(0);
            expect(phase.ready.length).toBeGreaterThan(0);
        });
    });
});

describe('foundations progress', () => {
    const [first, second, third] = allFoundationTopics;

    it('only counts a topic as confident when all four checks pass', () => {
        const three: FoundationsProgress = { checks: { [first.id]: { explain: true, derive: true, build: true, break: false } }, builds: {} };
        expect(checksPassed(three, first.id)).toBe(3);
        expect(isTopicConfident(three, first.id)).toBe(false);

        const four: FoundationsProgress = { checks: { [first.id]: ALL_FOUR }, builds: {} };
        expect(isTopicConfident(four, first.id)).toBe(true);
        expect(confidentCount(four, allFoundationTopics)).toBe(1);
    });

    it('counts only ticked mini-builds', () => {
        const progress: FoundationsProgress = {
            checks: {},
            builds: { [allMiniBuilds[0].id]: true, [allMiniBuilds[1].id]: false },
        };
        expect(buildsDone(progress, foundationPhases)).toBe(1);
    });

    it('points at the first topic in order that is not yet confident', () => {
        expect(nextTopic(EMPTY)?.id).toBe(first.id);

        // Skipping ahead does not move "next": the roadmap is taken in order.
        const skipped: FoundationsProgress = { checks: { [first.id]: ALL_FOUR, [third.id]: ALL_FOUR }, builds: {} };
        expect(nextTopic(skipped)?.id).toBe(second.id);

        const everything: FoundationsProgress = {
            checks: Object.fromEntries(allFoundationTopics.map(t => [t.id, ALL_FOUR])),
            builds: {},
        };
        expect(nextTopic(everything)).toBeNull();
    });

    it('lists topics that are started but not finished', () => {
        const progress: FoundationsProgress = {
            checks: { [first.id]: ALL_FOUR, [second.id]: { explain: true }, [third.id]: { explain: false } },
            builds: {},
        };
        expect(topicsInProgress(progress).map(t => t.id)).toEqual([second.id]);
    });
});
