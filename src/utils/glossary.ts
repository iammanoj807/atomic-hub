import { glossaryTerms } from '../data/systemDesignGlossary';
import { allSystemDesignTopics, SD_CHECK_KEYS, type SDTopic } from '../data/systemDesign';
import { createGlossary } from './glossaryEngine';

// The System Design glossary. The named exports below are kept so existing
// imports keep working; new code can use `systemDesignGlossary` directly.

export type { TextSegment } from './glossaryEngine';

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

export const systemDesignGlossary = createGlossary(glossaryTerms, allSystemDesignTopics, topicProse);

export const getGlossaryTerm = systemDesignGlossary.getTerm;
export const segmentText = systemDesignGlossary.segmentText;
export const segmentFirstMentions = systemDesignGlossary.segmentFirstMentions;
export const termsInText = systemDesignGlossary.termsInText;
export const termsInTopic = systemDesignGlossary.termsInTopic;
export const newWordsForTopic = systemDesignGlossary.newWordsForTopic;
export const findSystemDesignTopic = systemDesignGlossary.findTopic;
export const searchGlossary = systemDesignGlossary.search;
