import { describe, it, expect } from 'vitest';
import { mistakesCoveredByGuide, mergedMistakes } from '../../data/dsaMistakeOverlaps';
import { getTopicContent } from '../../data/dsaContent';
import { getPatternGuide } from '../../data/dsaPatterns';

describe('merging old and new common mistakes', () => {
    it('only hides old mistakes that exist, each matched exactly once', () => {
        for (const [topicId, starts] of Object.entries(mistakesCoveredByGuide)) {
            const old = getTopicContent(topicId)?.commonMistakes ?? [];
            for (const start of starts) {
                expect(old.filter(mistake => mistake.startsWith(start)), `${topicId}: ${start}`).toHaveLength(1);
            }
        }
    });

    it('keeps every guide mistake and every old one the guide does not cover', () => {
        const guide = getPatternGuide('stack')!.mistakes;
        const old = getTopicContent('stack')!.commonMistakes!;
        expect(mergedMistakes('stack', guide, old)).toEqual(guide);
        const math = getTopicContent('math-geometry')!.commonMistakes!;
        expect(mergedMistakes('math-geometry', ['a'], math)).toEqual(['a', ...math]);
    });
});
