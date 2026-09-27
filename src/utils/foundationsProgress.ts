import { CHECK_KEYS, allFoundationTopics, type FoundationPhase, type FoundationTopic } from '../data/foundations';
import type { FoundationsProgress } from '../services/firebaseService';

/** How many of the four checks a topic has passed. */
export const checksPassed = (progress: FoundationsProgress, topicId: string): number => {
    const checks = progress.checks[topicId] ?? {};
    return CHECK_KEYS.filter(key => checks[key] === true).length;
};

/** Confident means all four — three out of four is still a topic in progress. */
export const isTopicConfident = (progress: FoundationsProgress, topicId: string): boolean =>
    checksPassed(progress, topicId) === CHECK_KEYS.length;

export const confidentCount = (progress: FoundationsProgress, topics: FoundationTopic[]): number =>
    topics.filter(topic => isTopicConfident(progress, topic.id)).length;

export const buildsDone = (progress: FoundationsProgress, phases: FoundationPhase[]): number =>
    phases.flatMap(phase => phase.builds).filter(build => progress.builds[build.id] === true).length;

/**
 * The first topic, in roadmap order, that is not yet confident. The roadmap
 * is meant to be taken in order, so this is simply "what to do next".
 */
export const nextTopic = (progress: FoundationsProgress): FoundationTopic | null =>
    allFoundationTopics.find(topic => !isTopicConfident(progress, topic.id)) ?? null;

/** Started but not finished: one to three checks passed. */
export const topicsInProgress = (progress: FoundationsProgress): FoundationTopic[] =>
    allFoundationTopics.filter(topic => {
        const passed = checksPassed(progress, topic.id);
        return passed > 0 && passed < CHECK_KEYS.length;
    });
