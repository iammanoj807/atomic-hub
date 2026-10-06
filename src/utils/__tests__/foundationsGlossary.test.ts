import { describe, it, expect } from 'vitest';
import { foundationsGlossaryTerms } from '../../data/foundationsGlossary';
import { allFoundationTopics } from '../../data/foundations';
import { foundationsGlossary as g } from '../foundationsGlossary';

const topic = (id: string) => {
    const found = g.findTopic(id);
    if (!found) throw new Error(`missing topic ${id}`);
    return found;
};
const ids = (text: string) => g.segmentText(text).map(s => s.termId).filter(Boolean);

describe('ML glossary data', () => {
    it('has unique ids, a definition and spellings for every word', () => {
        const termIds = foundationsGlossaryTerms.map(t => t.id);
        expect(new Set(termIds).size).toBe(termIds.length);
        for (const term of foundationsGlossaryTerms) {
            expect(term.definition.trim().length).toBeGreaterThan(10);
            expect(term.matches.length).toBeGreaterThan(0);
        }
    });

    it('only points "taught in" at topics that exist', () => {
        const topicIds = new Set(allFoundationTopics.map(t => t.id));
        expect(foundationsGlossaryTerms.filter(t => t.taughtIn && !topicIds.has(t.taughtIn)).map(t => t.id)).toEqual([]);
    });
});

describe('finding ML words', () => {
    it('prefers the longest match', () => {
        expect(ids('use gradient descent here')).toEqual(['gradient-descent']);
        expect(ids('the cross-entropy loss')).toEqual(['cross-entropy', 'loss']);
    });

    it('does not mistake everyday words for jargon', () => {
        expect(ids('7 heads in 10 flips')).not.toContain('multi-head-attention');
        expect(ids('Write a StandardScaler class')).not.toContain('classification');
        expect(ids('save snapshots of your project')).not.toContain('projection');
        expect(ids('build search that returns the top 5')).not.toContain('reward');
        expect(ids('two students')).not.toContain('distillation');
        expect(ids('add a metadata filter')).not.toContain('convolution');
    });

    it('matches acronyms only in capitals', () => {
        expect(ids('ML from scratch')).toContain('ml');
        expect(ids('the html file')).not.toContain('ml');
    });
});

describe('new words per topic', () => {
    it('starts with the big-picture topic, which introduces the core words', () => {
        expect(allFoundationTopics[0].id).toBe('f0-t6');
        const words = g.newWordsForTopic(topic('f0-t6')).map(t => t.id);
        expect(words).toEqual(expect.arrayContaining(['feature', 'label', 'gradient-descent']));
    });

    it('never lists the word a topic itself teaches, and finds words in every topic', () => {
        for (const t of allFoundationTopics) {
            expect(g.newWordsForTopic(t).some(term => term.taughtIn === t.id)).toBe(false);
            expect(g.termsInTopic(t).length).toBeGreaterThan(0);
        }
    });

    it('looks topics up by id', () => {
        expect(g.newWordsForTopicId('f0-t6').length).toBeGreaterThan(0);
        expect(g.newWordsForTopicId('nope')).toEqual([]);
        expect(g.search('softmax').map(t => t.id)).toContain('softmax');
    });
});
