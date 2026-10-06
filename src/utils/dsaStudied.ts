import { dsaCurriculum } from '../data/dsaCurriculum';
import { buildSession, type DrillState, type SessionOptions } from './patternDrill';

// Which topics count as "studied" for the pattern drill, shared by the DSA hub
// (its "N due today") and the drill page, so both always agree.

/** Solved problems per topic, as saved in dsa_progress. */
export type SolvedByTopic = Record<string, { completedProblems?: string[] } | undefined>;

const topics = dsaCurriculum.flatMap(phase => phase.sections.flatMap(section => section.topics));

/** Topics with at least one solved problem that is still in the curriculum, in curriculum order. */
export const studiedTopicIds = (progress: SolvedByTopic): string[] =>
    topics
        .filter(topic => {
            const solved = progress[topic.id]?.completedProblems ?? [];
            return topic.problems.some(problem => solved.includes(problem.id));
        })
        .map(topic => topic.id);

/** The session options for the drill: only studied topics, unless asked for every topic. */
export const drillSessionOptions = (progress: SolvedByTopic, onlyStudied: boolean): SessionOptions =>
    onlyStudied ? { topicIds: studiedTopicIds(progress) } : {};

/** Today's drill cards, exactly as the drill page builds them by default. */
export const todaysDrill = (state: DrillState, progress: SolvedByTopic, today: string, onlyStudied = true): string[] =>
    buildSession(state, today, drillSessionOptions(progress, onlyStudied));
