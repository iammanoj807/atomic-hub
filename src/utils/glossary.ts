import { glossaryTerms, type GlossaryTerm } from '../data/systemDesignGlossary';
import { allSystemDesignTopics, SD_CHECK_KEYS, type SDTopic } from '../data/systemDesign';

/** A piece of text. `termId` is set when the piece is a glossary word. */
export interface TextSegment {
    text: string;
    termId?: string;
}

const termsById = new Map<string, GlossaryTerm>(glossaryTerms.map(term => [term.id, term]));

const termIdBySpelling = new Map<string, string>();
for (const term of glossaryTerms) {
    for (const spelling of term.matches) {
        if (!termIdBySpelling.has(spelling)) termIdBySpelling.set(spelling, term.id);
    }
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Longest spellings first, so "load balancer" wins over "load" and "network partition"
// wins over "partition". The look-arounds stop matches inside longer words and
// identifiers ("server" inside "observer", "manifest" in "manifest_url").
// Case-sensitive on purpose: see the glossary file.
const TERM_PATTERN = new RegExp(
    `(?<![A-Za-z0-9_])(?:${[...termIdBySpelling.keys()]
        .sort((a, b) => b.length - a.length)
        .map(escapeRegExp)
        .join('|')})(?![A-Za-z0-9_])`,
    'g'
);

export const getGlossaryTerm = (id: string): GlossaryTerm | undefined => termsById.get(id);

/** Split text into plain pieces and glossary words, in order. */
export const segmentText = (text: string): TextSegment[] => {
    const segments: TextSegment[] = [];
    let last = 0;
    for (const match of text.matchAll(TERM_PATTERN)) {
        const start = match.index ?? 0;
        if (start > last) segments.push({ text: text.slice(last, start) });
        segments.push({ text: match[0], termId: termIdBySpelling.get(match[0]) });
        last = start + match[0].length;
    }
    if (last < text.length) segments.push({ text: text.slice(last) });
    return segments;
};

/**
 * Segment several texts that are read together (one card section, or one whole card),
 * marking only the FIRST mention of each word, so the page isn't covered in underlines.
 * Pass `alreadyMarked` to carry the "seen" words over from an earlier section.
 */
export const segmentFirstMentions = (
    texts: string[],
    alreadyMarked: ReadonlySet<string> = new Set()
): TextSegment[][] => {
    const seen = new Set(alreadyMarked);
    return texts.map(text =>
        segmentText(text).map(segment => {
            if (!segment.termId) return segment;
            if (seen.has(segment.termId)) return { text: segment.text };
            seen.add(segment.termId);
            return segment;
        })
    );
};

/** The glossary words in a text, each once, in order of appearance. */
export const termsInText = (text: string): string[] => {
    const ids: string[] = [];
    for (const segment of segmentText(text)) {
        if (segment.termId && !ids.includes(segment.termId)) ids.push(segment.termId);
    }
    return ids;
};

/** Every piece of prose in a topic, in reading order (no code, API lines or diagrams). */
export const topicProse = (topic: SDTopic): string[] => {
    const tail = [
        ...topic.mistakes,
        topic.interviewAnswer,
        ...topic.followUps.flatMap(followUp => [followUp.q, followUp.a]),
        ...SD_CHECK_KEYS.map(key => topic.practice[key]),
    ];
    if (topic.kind === 'concept') {
        return [
            topic.definition, topic.problem, topic.idea, ...topic.howItWorks,
            topic.analogy, topic.breaks, topic.example, ...topic.keyPoints,
            ...(topic.tradeOffs ?? []), ...tail,
        ];
    }
    return [
        topic.definition, topic.problem, ...topic.functional, ...topic.nonFunctional,
        ...(topic.estimates ?? []), ...(topic.dataModel ?? []), ...(topic.classes ?? []),
        ...(topic.patterns ?? []), ...topic.evolution, ...topic.design, ...topic.deepDives, ...tail,
    ];
};

export const termsInTopic = (topic: SDTopic): string[] => {
    const ids: string[] = [];
    for (const text of topicProse(topic)) {
        for (const id of termsInText(text)) if (!ids.includes(id)) ids.push(id);
    }
    return ids;
};

// Where each word first appears when the topics are read in order.
const firstTopicForTerm = new Map<string, string>();
for (const topic of allSystemDesignTopics) {
    for (const id of termsInTopic(topic)) {
        if (!firstTopicForTerm.has(id)) firstTopicForTerm.set(id, topic.id);
    }
}

/**
 * The words this topic introduces: words that appear here for the first time
 * (reading the topics in order), except the word the topic itself teaches.
 */
export const newWordsForTopic = (topic: SDTopic): GlossaryTerm[] =>
    termsInTopic(topic)
        .filter(id => firstTopicForTerm.get(id) === topic.id && termsById.get(id)?.taughtIn !== topic.id)
        .map(id => termsById.get(id))
        .filter((term): term is GlossaryTerm => term !== undefined);

export const findSystemDesignTopic = (id: string): SDTopic | undefined =>
    allSystemDesignTopics.find(topic => topic.id === id);

/** Glossary search by word or definition, alphabetical. */
export const searchGlossary = (query: string): GlossaryTerm[] => {
    const q = query.trim().toLowerCase();
    if (!q) return glossaryTerms;
    return glossaryTerms.filter(term =>
        term.term.toLowerCase().includes(q) || term.definition.toLowerCase().includes(q)
    );
};
