import { sqlGlossaryTerms } from '../data/sqlGlossary';
import { allSqlTopics, SQL_CHECK_KEYS, type SqlTopic } from '../data/sql';
import { createGlossary } from './glossaryEngine';

// The SQL glossary: the same tap-to-explain engine as the other study pages,
// except that `inline code` is never marked — a keyword inside a snippet is
// code, not a word to explain.

/** Inline code in the notes, written between backticks. */
export const INLINE_CODE = /`[^`]*`/g;

/** Every piece of prose in a topic, in reading order (no SQL, diagrams or resource titles). */
export const sqlTopicProse = (topic: SqlTopic): string[] => {
    const tail = [
        ...topic.mistakes,
        ...SQL_CHECK_KEYS.map(key => topic.practice[key]),
        topic.interviewAnswer,
        ...topic.followUps.flatMap(followUp => [followUp.q, followUp.a]),
    ];
    if (topic.kind === 'lesson') {
        return [
            topic.definition, topic.problem, topic.idea, ...topic.howItWorks, topic.analogy, topic.breaks,
            ...topic.examples.flatMap(example => [example.title, example.note ?? '']),
            ...topic.keyPoints, ...(topic.dialects ?? []), ...tail,
        ];
    }
    return [
        topic.definition, topic.problem, topic.pattern, topic.spot, ...topic.approach,
        topic.solution.note ?? '', ...(topic.alternatives ?? []).flatMap(example => [example.title, example.note ?? '']),
        ...topic.edgeCases, ...(topic.dialects ?? []), ...tail,
    ];
};

export const sqlGlossary = createGlossary(sqlGlossaryTerms, allSqlTopics, sqlTopicProse, { skip: INLINE_CODE });
