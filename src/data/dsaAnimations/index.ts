import type { AnimationRegistry } from '../../components/learning/anim/useTopicAnimation';
import { arraysAnimations, arraysResults } from './arrays';
import { graphsAnimations, graphsResults } from './graphs';
import { sequencesAnimations, sequencesResults } from './sequences';
import { structuresAnimations, structuresResults } from './structures';

// One animation per DSA topic, keyed by topic id. Each plays the topic's two
// worked examples (easy and medium) by running the algorithm on them.

export const dsaAnimations: AnimationRegistry = {
    ...arraysAnimations,
    ...structuresAnimations,
    ...graphsAnimations,
    ...sequencesAnimations,
};

/** The answer each animation reaches, printed like Python, so a test can check it against the lesson's trace. */
export const dsaAnimationResults: Record<string, { easy: () => string; medium: () => string }> = {
    ...arraysResults,
    ...structuresResults,
    ...graphsResults,
    ...sequencesResults,
};
