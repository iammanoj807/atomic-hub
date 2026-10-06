import { foundationsGlossaryTerms } from '../data/foundationsGlossary';
import { allFoundationTopics, CHECK_KEYS, type FoundationTopic } from '../data/foundations';
import { createGlossary } from './glossaryEngine';

// The ML Foundations glossary: the same tap-to-explain engine as System Design,
// fed with the ML words and the Foundations topics in reading order.

/** Every piece of prose in a topic, in reading order (no code, diagrams or resource titles). */
export const foundationProse = (topic: FoundationTopic): string[] => [
    topic.note.idea,
    topic.note.analogy,
    topic.note.breaks,
    ...(topic.note.example ? [topic.note.example] : []),
    ...CHECK_KEYS.map(key => topic.practice[key]),
];

export const foundationsGlossary = createGlossary(foundationsGlossaryTerms, allFoundationTopics, foundationProse);
