// The tap-to-explain glossary, independent of any one page. Each learning page
// (System Design, ML Foundations) creates its own glossary from its words,
// its topics in reading order, and a function that lists a topic's prose.

export interface GlossaryTerm {
    id: string;
    term: string;
    definition: string;
    /** The topic that teaches this word in depth, if there is one. */
    taughtIn?: string;
    /** Exact spellings to look for (plurals and capitalised forms included). */
    matches: string[];
}

/** A piece of text. `termId` is set when the piece is a glossary word. */
export interface TextSegment {
    text: string;
    termId?: string;
}

export interface GlossaryTopicRef {
    id: string;
    name: string;
}

/** Everything a page's tap-to-explain components need from its glossary. */
export interface GlossarySource<T extends GlossaryTopicRef = GlossaryTopicRef> {
    terms: GlossaryTerm[];
    getTerm: (id: string) => GlossaryTerm | undefined;
    /** Split text into plain pieces and glossary words, in order. */
    segmentText: (text: string) => TextSegment[];
    /** Like segmentText over several texts read together, marking only each word's first mention. */
    segmentFirstMentions: (texts: string[], alreadyMarked?: ReadonlySet<string>) => TextSegment[][];
    termsInText: (text: string) => string[];
    termsInTopic: (topic: T) => string[];
    /** Words appearing for the first time in this topic (reading in order), except the word it teaches. */
    newWordsForTopic: (topic: T) => GlossaryTerm[];
    newWordsForTopicId: (topicId: string) => GlossaryTerm[];
    findTopic: (id: string) => T | undefined;
    /** Search by word or definition, alphabetical. */
    search: (query: string) => GlossaryTerm[];
}

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const createGlossary = <T extends GlossaryTopicRef>(
    terms: GlossaryTerm[],
    topicsInOrder: T[],
    proseOf: (topic: T) => string[]
): GlossarySource<T> => {
    const termsById = new Map(terms.map(term => [term.id, term]));
    const termIdBySpelling = new Map<string, string>();
    for (const term of terms) {
        for (const spelling of term.matches) {
            if (!termIdBySpelling.has(spelling)) termIdBySpelling.set(spelling, term.id);
        }
    }

    // Longest spellings first, so "load balancer" wins over "load" and "network partition"
    // over "partition". The look-arounds stop matches inside longer words and identifiers
    // ("server" inside "observer", "manifest" in "manifest_url"). Case-sensitive on purpose.
    const pattern = new RegExp(
        `(?<![A-Za-z0-9_])(?:${[...termIdBySpelling.keys()]
            .sort((a, b) => b.length - a.length)
            .map(escapeRegExp)
            .join('|')})(?![A-Za-z0-9_])`,
        'g'
    );

    const segmentText = (text: string): TextSegment[] => {
        const segments: TextSegment[] = [];
        let last = 0;
        for (const match of text.matchAll(pattern)) {
            const start = match.index ?? 0;
            if (start > last) segments.push({ text: text.slice(last, start) });
            segments.push({ text: match[0], termId: termIdBySpelling.get(match[0]) });
            last = start + match[0].length;
        }
        if (last < text.length) segments.push({ text: text.slice(last) });
        return segments;
    };

    const segmentFirstMentions = (texts: string[], alreadyMarked: ReadonlySet<string> = new Set()): TextSegment[][] => {
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

    const termsInText = (text: string): string[] => {
        const ids: string[] = [];
        for (const segment of segmentText(text)) {
            if (segment.termId && !ids.includes(segment.termId)) ids.push(segment.termId);
        }
        return ids;
    };

    const termsInTopic = (topic: T): string[] => {
        const ids: string[] = [];
        for (const text of proseOf(topic)) {
            for (const id of termsInText(text)) if (!ids.includes(id)) ids.push(id);
        }
        return ids;
    };

    const firstTopicForTerm = new Map<string, string>();
    for (const topic of topicsInOrder) {
        for (const id of termsInTopic(topic)) {
            if (!firstTopicForTerm.has(id)) firstTopicForTerm.set(id, topic.id);
        }
    }

    const newWordsForTopic = (topic: T): GlossaryTerm[] =>
        termsInTopic(topic)
            .filter(id => firstTopicForTerm.get(id) === topic.id && termsById.get(id)?.taughtIn !== topic.id)
            .map(id => termsById.get(id))
            .filter((term): term is GlossaryTerm => term !== undefined);

    const findTopic = (id: string) => topicsInOrder.find(topic => topic.id === id);

    const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term, undefined, { sensitivity: 'base' }));
    const search = (query: string): GlossaryTerm[] => {
        const q = query.trim().toLowerCase();
        if (!q) return sorted;
        return sorted.filter(term => term.term.toLowerCase().includes(q) || term.definition.toLowerCase().includes(q));
    };

    return {
        terms,
        getTerm: id => termsById.get(id),
        segmentText,
        segmentFirstMentions,
        termsInText,
        termsInTopic,
        newWordsForTopic,
        newWordsForTopicId: id => {
            const topic = findTopic(id);
            return topic ? newWordsForTopic(topic) : [];
        },
        findTopic,
        search,
    };
};
