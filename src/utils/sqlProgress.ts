import { SQL_CHECK_KEYS, allSqlTopics, type SqlTopic } from '../data/sql';
import type { SqlProgress } from '../services/firebaseService';

/** How many of the four checks a topic has passed. */
export const checksPassed = (progress: SqlProgress, topicId: string): number => {
    const checks = progress.checks[topicId] ?? {};
    return SQL_CHECK_KEYS.filter(key => checks[key] === true).length;
};

/** Confident means all four — three out of four is still a topic in progress. */
export const isTopicConfident = (progress: SqlProgress, topicId: string): boolean =>
    checksPassed(progress, topicId) === SQL_CHECK_KEYS.length;

export const confidentCount = (progress: SqlProgress, topics: SqlTopic[]): number =>
    topics.filter(topic => isTopicConfident(progress, topic.id)).length;

/** The first topic, in course order, that is not yet confident. */
export const nextTopic = (progress: SqlProgress): SqlTopic | null =>
    allSqlTopics.find(topic => !isTopicConfident(progress, topic.id)) ?? null;

/** Started but not finished: one to three checks passed. */
export const topicsInProgress = (progress: SqlProgress): SqlTopic[] =>
    allSqlTopics.filter(topic => {
        const passed = checksPassed(progress, topic.id);
        return passed > 0 && passed < SQL_CHECK_KEYS.length;
    });
