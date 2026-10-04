import { createContext, useContext, useMemo, useState } from 'react';
import { createTheme, type Theme } from '@mui/material';

// Shared by the study pages (ML Foundations, System Design): colours, sizes
// and the text-size preference. The components that use these live in
// LearningParts.tsx.

export const CONFIDENT = '#66bb6a';
export const CYAN = '#4dd0e1';
/** Every tappable thing on these pages is at least this tall, so it works on a phone. */
export const TAP = 44;

// ============ TEXT SIZE ============
//
// One table drives every font size on a study page. The Typography variants
// get it through a nested theme; the few sizes set directly in sx (chips,
// code, small print) read the same table through TextSizeContext, so nothing
// on the page is sized by hand.

export type TextSize = 'normal' | 'large' | 'xl';

export interface TextSizes {
    /** Main reading text. */
    body1: number;
    /** Exercise text, resource notes, builds, questions. */
    body2: number;
    /** Sources, hints and other small print. */
    small: number;
    /** Section labels and chips. */
    label: number;
    code: number;
    /** Headings grow by this factor. */
    heading: number;
}

export const TEXT_SIZES: Record<TextSize, TextSizes> = {
    normal: { body1: 17.6, body2: 14, small: 13, label: 12, code: 13.6, heading: 1 },
    large: { body1: 19, body2: 17, small: 15, label: 13.5, code: 15, heading: 1.15 },
    xl: { body1: 21, body2: 19, small: 17, label: 15, code: 17, heading: 1.3 },
};

export const TEXT_SIZE_LABELS: Record<TextSize, string> = { normal: 'Normal', large: 'Large', xl: 'Extra large' };
/** One preference for every study page. */
const TEXT_SIZE_KEY = 'learning-text-size';
/** Where ML Foundations kept it before the pages shared one, read once so the old choice carries over. */
const LEGACY_TEXT_SIZE_KEY = 'foundations-text-size';
const DEFAULT_TEXT_SIZE: TextSize = 'large';
const LINE_HEIGHT = 1.7;

export const px = (value: number) => `${value / 16}rem`;

const isTextSize = (value: string | null): value is TextSize =>
    value === 'normal' || value === 'large' || value === 'xl';

const readTextSize = (): TextSize => {
    try {
        const stored = localStorage.getItem(TEXT_SIZE_KEY);
        if (isTextSize(stored)) return stored;
        const legacy = localStorage.getItem(LEGACY_TEXT_SIZE_KEY);
        if (isTextSize(legacy)) return legacy;
    } catch {
        // Private mode or blocked storage: fall back to the default.
    }
    return DEFAULT_TEXT_SIZE;
};

const writeTextSize = (size: TextSize) => {
    try {
        localStorage.setItem(TEXT_SIZE_KEY, size);
    } catch {
        // Not remembered, but the page still changes size for this visit.
    }
};

export const TextSizeContext = createContext<TextSizes>(TEXT_SIZES[DEFAULT_TEXT_SIZE]);
export const useTextSize = () => useContext(TextSizeContext);

/** The app theme with a study page's text sizes laid over it. */
const pageTheme = (t: TextSizes) => (outer: Theme) =>
    createTheme(outer, {
        typography: {
            body1: { fontSize: px(t.body1), lineHeight: LINE_HEIGHT },
            body2: { fontSize: px(t.body2), lineHeight: LINE_HEIGHT },
            caption: { fontSize: px(t.label), lineHeight: 1.5 },
            button: { fontSize: px(t.small) },
            h3: { fontSize: `${3 * t.heading}rem` },
            h4: { fontSize: `${1.75 * t.heading}rem` },
            h5: { fontSize: `${1.5 * t.heading}rem` },
            h6: { fontSize: `${1.25 * t.heading}rem` },
        },
    });

/** The remembered text size, its sizes table and theme, and a setter that remembers the change. */
export const useTextSizeChoice = () => {
    const [textSize, setTextSize] = useState<TextSize>(readTextSize);
    const t = TEXT_SIZES[textSize];
    const theme = useMemo(() => pageTheme(t), [t]);
    const changeTextSize = (size: TextSize | null) => {
        if (!size) return;
        setTextSize(size);
        writeTextSize(size);
    };
    return { textSize, t, theme, changeTextSize };
};

// ============ SMALL HELPERS ============

export const scrollToId = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

export const stepId = (topicId: string, step: number) => `topic-${topicId}-step-${step}`;

/** One step in the bar across the top of an open topic card. */
export interface LearningStep {
    title: string;
    /** A short line under the title, such as how long it takes. */
    time?: string;
    /** The section heading for this step inside the card. */
    label: string;
}

/** The shape every study resource shares, whatever its kinds are called. */
export interface LearningResource<K extends string = string> {
    kind: K;
    title: string;
    source: string;
    url?: string;
}
