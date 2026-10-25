import { foundationsGlossaryTerms } from '../data/foundationsGlossary';
import { allFoundationTopics, CHECK_KEYS, type FoundationTopic } from '../data/foundations';
import { createGlossary } from './glossaryEngine';

// The ML Foundations glossary: the same tap-to-explain engine as System Design,
// fed with the ML words and the Foundations topics in reading order.

/** Every piece of prose in a topic, in reading order (no code, diagrams or resource titles). */
const foundationProse = (topic: FoundationTopic): string[] => [
    topic.definition,
    topic.problem,
    topic.note.idea,
    ...topic.howItWorks,
    topic.note.analogy,
    topic.note.breaks,
    ...(topic.note.example ? [topic.note.example] : []),
    ...topic.keyPoints,
    ...topic.mistakes,
    ...CHECK_KEYS.map(key => topic.practice[key]),
    ...topic.followUps.flatMap(item => [item.q, item.a]),
];

export const foundationsGlossary = createGlossary(foundationsGlossaryTerms, allFoundationTopics, foundationProse);
