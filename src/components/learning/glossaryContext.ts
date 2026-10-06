import { createContext, useContext } from 'react';
import type { GlossarySource, TextSegment } from '../../utils/glossaryEngine';

// Shared by the tap-to-explain words (GlossaryText.tsx). The components live
// in the .tsx file; the contexts and helpers live here.

/**
 * What the components need from a page's glossary: everything except the two
 * functions that take the page's own topic type, so any page's glossary fits.
 */
export type PageGlossary = Omit<GlossarySource, 'termsInTopic' | 'newWordsForTopic'>;

/** How a word's explanation was opened: a mouse hovering, or a tap, click or key press. */
export type GlossaryOpenHow = 'hover' | 'press';

export interface GlossaryActions {
    /** The page's words: what they mean, where they appear and which topic teaches them. */
    source: PageGlossary;
    /** Show a word's explanation next to the word. */
    show: (anchor: HTMLElement, termId: string, topicId: string | undefined, how: GlossaryOpenHow) => void;
    /** The mouse left the word: close the hover explanation soon, unless it moves onto it. */
    leave: () => void;
    /** Open the topic that teaches a word in depth. */
    openTopic: (topicId: string) => void;
}

export const GlossaryActionsContext = createContext<GlossaryActions | null>(null);
export const useGlossaryActions = () => useContext(GlossaryActionsContext);

/** The topic being read, so "Learn it fully" isn't offered for the topic you're already in. */
export const GlossaryTopicContext = createContext<string | undefined>(undefined);
export const useGlossaryTopic = () => useContext(GlossaryTopicContext);

/** A text that may have its glossary words marked. */
export type Prose = string | TextSegment[];

/**
 * Mark the first mention of each word across a whole card. The sections are
 * given in display order; ask for a section by its key to get its slice of the
 * result (an empty list for a section the card doesn't have).
 */
export const segmentSections = <K extends string>(source: PageGlossary, sections: [K, string[]][]) => {
    const segmented = source.segmentFirstMentions(sections.flatMap(([, texts]) => texts));
    const slices = new Map<K, TextSegment[][]>();
    let at = 0;
    for (const [key, texts] of sections) {
        slices.set(key, segmented.slice(at, at + texts.length));
        at += texts.length;
    }
    return (key: K): TextSegment[][] => slices.get(key) ?? [];
};

/** Drop the first `count` characters of a marked text, keeping the marks on what is left. */
export const dropLeadingChars = (segments: TextSegment[], count: number): TextSegment[] => {
    const result: TextSegment[] = [];
    let left = count;
    for (const segment of segments) {
        if (left >= segment.text.length) {
            left -= segment.text.length;
            continue;
        }
        result.push(left > 0 ? { text: segment.text.slice(left) } : segment);
        left = 0;
    }
    return result;
};

export const proseText = (value: Prose) => (typeof value === 'string' ? value : value.map(segment => segment.text).join(''));
