import { describe, it, expect } from 'vitest';
import { glossaryTerms } from '../../data/systemDesignGlossary';
import { allSystemDesignTopics } from '../../data/systemDesign';
import {
    segmentText,
    segmentFirstMentions,
    termsInTopic,
    newWordsForTopic,
    findSystemDesignTopic,
    searchGlossary,
} from '../glossary';

const topic = (id: string) => {
    const found = findSystemDesignTopic(id);
    if (!found) throw new Error(`missing topic ${id}`);
    return found;
};

describe('glossary data', () => {
    it('has unique ids, a definition and spellings for every word', () => {
        const ids = glossaryTerms.map(t => t.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const term of glossaryTerms) {
            expect(term.definition.trim().length).toBeGreaterThan(10);
            expect(term.matches.length).toBeGreaterThan(0);
        }
    });

    it('only points "taught in" at topics that exist', () => {
        const topicIds = new Set(allSystemDesignTopics.map(t => t.id));
        const broken = glossaryTerms.filter(t => t.taughtIn && !topicIds.has(t.taughtIn)).map(t => t.id);
        expect(broken).toEqual([]);
    });
});

describe('finding words in text', () => {
    it('splits text into plain pieces and glossary words', () => {
        expect(segmentText('A load balancer spreads requests.')).toEqual([
            { text: 'A ' },
            { text: 'load balancer', termId: 'load-balancer' },
            { text: ' spreads ' },
            { text: 'requests', termId: 'request' },
            { text: '.' },
        ]);
    });

    it('prefers the longest match', () => {
        const ids = segmentText('a network partition happened').map(s => s.termId).filter(Boolean);
        expect(ids).toEqual(['network-partition']);
    });

    it('matches acronyms only in capitals, and never inside other words', () => {
        expect(segmentText('Rate limiting caps how many requests').some(s => s.termId === 'cap-theorem')).toBe(false);
        expect(segmentText('the CAP theorem').some(s => s.termId === 'cap-theorem')).toBe(true);
        expect(segmentText('an observer').some(s => s.termId === 'server')).toBe(false);
        expect(segmentText('manifest_url').some(s => s.termId === 'manifest')).toBe(false);
    });

    it('marks only the first mention across texts read together', () => {
        const [first, second] = segmentFirstMentions(['the cache is fast', 'a cache miss and the cache again']);
        expect(first.filter(s => s.termId === 'cache')).toHaveLength(1);
        expect(second.filter(s => s.termId === 'cache')).toHaveLength(0);
        expect(second.some(s => s.termId === 'cache-hit')).toBe(true);
    });
});

describe('new words per topic', () => {
    it('introduces the building blocks in the first topic, so later topics can use them', () => {
        const blocks = topic('sd0-t4');
        expect(allSystemDesignTopics[0].id).toBe('sd0-t4');
        expect(newWordsForTopic(blocks).map(t => t.id)).toContain('load-balancer');
        expect(newWordsForTopic(topic('sd0-t1')).map(t => t.id)).not.toContain('load-balancer');
    });

    it('never lists the word a topic itself teaches', () => {
        for (const t of allSystemDesignTopics) {
            expect(newWordsForTopic(t).some(term => term.taughtIn === t.id)).toBe(false);
        }
    });

    it('finds glossary words in every topic', () => {
        for (const t of allSystemDesignTopics) {
            expect(termsInTopic(t).length).toBeGreaterThan(0);
        }
    });

    it('searches by word or definition', () => {
        expect(searchGlossary('balancer').map(t => t.id)).toContain('load-balancer');
        expect(searchGlossary('')).toHaveLength(glossaryTerms.length);
    });
});
