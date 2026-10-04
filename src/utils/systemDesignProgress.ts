import { SD_CHECK_KEYS, allSystemDesignTopics, type SDTopic } from '../data/systemDesign';
import type { SystemDesignProgress } from '../services/firebaseService';

/** How many of the four checks a topic has passed. */
export const checksPassed = (progress: SystemDesignProgress, topicId: string): number => {
    const checks = progress.checks[topicId] ?? {};
    return SD_CHECK_KEYS.filter(key => checks[key] === true).length;
};

/** Confident means all four — three out of four is still a topic in progress. */
export const isTopicConfident = (progress: SystemDesignProgress, topicId: string): boolean =>
    checksPassed(progress, topicId) === SD_CHECK_KEYS.length;

export const confidentCount = (progress: SystemDesignProgress, topics: SDTopic[]): number =>
    topics.filter(topic => isTopicConfident(progress, topic.id)).length;

/** The first topic, in roadmap order, that is not yet confident. */
export const nextTopic = (progress: SystemDesignProgress): SDTopic | null =>
    allSystemDesignTopics.find(topic => !isTopicConfident(progress, topic.id)) ?? null;

/** Started but not finished: one to three checks passed. */
export const topicsInProgress = (progress: SystemDesignProgress): SDTopic[] =>
    allSystemDesignTopics.filter(topic => {
        const passed = checksPassed(progress, topic.id);
        return passed > 0 && passed < SD_CHECK_KEYS.length;
    });
