// ============================================================
// Evidence Log — presentation constants
// The stored shape lives in firebaseService; this file only holds
// how a tag is labelled and coloured, and the example lines shown
// as placeholder text.
// ============================================================

import type { EvidenceTag } from '../services/firebaseService';

export const ALL_EVIDENCE_TAGS: EvidenceTag[] = [
    'applied',
    'built',
    'practised',
    'networked',
    'interview',
    'showed-up',
];

export const EVIDENCE_TAG_LABELS: Record<EvidenceTag, string> = {
    'applied': 'Applied',
    'built': 'Built',
    'practised': 'Practised',
    'networked': 'Networked',
    'interview': 'Interview',
    'showed-up': 'Showed up',
};

/** Same palette as ROLE_COLORS so the dark theme gains no new hues. */
export const EVIDENCE_TAG_COLORS: Record<EvidenceTag, string> = {
    'applied': '#4a90e2',
    'built': '#00e676',
    'practised': '#ff9800',
    'networked': '#7c4dff',
    'interview': '#00e5ff',
    // Deliberately neutral, not dimmer than the rest: a day where all you did
    // was show up still counts as a day you showed up.
    'showed-up': '#b0bec5',
};

/** Real examples, so the empty input suggests the size of thing worth logging. */
const EVIDENCE_PLACEHOLDERS: string[] = [
    'Sent 2 applications',
    'Fixed the README',
    'Did the shift, still sent one follow-up',
    'Held my own for 2 hours with a FTSE 100 panel',
    'Recorded the superpower answer, smoother than last time',
    'Read my whole codebase and made a plan to rebuild it',
];

/**
 * Picks the placeholder from the date so it changes daily but stays put while
 * you are typing — a placeholder that rotates on a timer is just distraction.
 */
export const getPlaceholderForDate = (date: string): string => {
    // Sum the digits of YYYY-MM-DD; enough variation for a 6-item rotation.
    const seed = date.split('-').reduce((total, part) => total + Number(part), 0);
    return EVIDENCE_PLACEHOLDERS[seed % EVIDENCE_PLACEHOLDERS.length];
};
