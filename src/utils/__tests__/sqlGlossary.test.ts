import { describe, it, expect } from 'vitest';
import { sqlGlossaryTerms } from '../../data/sqlGlossary';
import { allSqlTopics } from '../../data/sql';
import { sqlGlossary as g } from '../sqlGlossary';

const topic = (id: string) => {
    const found = g.findTopic(id);
    if (!found) throw new Error(`missing topic ${id}`);
    return found;
};
const ids = (text: string) => g.segmentText(text).map(s => s.termId).filter(Boolean);

describe('SQL glossary data', () => {
    it('has unique ids, a definition and spellings for every word', () => {
        const termIds = sqlGlossaryTerms.map(t => t.id);
        expect(new Set(termIds).size).toBe(termIds.length);
        for (const term of sqlGlossaryTerms) {
            expect(term.definition.trim().length).toBeGreaterThan(10);
            expect(term.matches.length).toBeGreaterThan(0);
            // Definitions are shown as plain text, so inline-code backticks would show literally.
            expect(term.definition).not.toContain('`');
        }
    });

    it('only points "taught in" at topics that exist', () => {
        const topicIds = new Set(allSqlTopics.map(t => t.id));
        expect(sqlGlossaryTerms.filter(t => t.taughtIn && !topicIds.has(t.taughtIn)).map(t => t.id)).toEqual([]);
    });

    it('never gives one spelling to two different words', () => {
        const seen = new Map<string, string>();
        const clashes: string[] = [];
        for (const term of sqlGlossaryTerms) {
            for (const spelling of term.matches) {
                const owner = seen.get(spelling);
                if (owner && owner !== term.id) clashes.push(`${spelling}: ${owner} and ${term.id}`);
                seen.set(spelling, term.id);
            }
        }
        expect(clashes).toEqual([]);
    });
});

describe('finding SQL words', () => {
    it('matches keywords only in capitals, so everyday words stay plain', () => {
        expect(ids('sort them in order')).not.toContain('order-by');
        expect(ids('a group of friends')).not.toContain('group-by');
        expect(ids('the orders table')).not.toContain('order-by');
        expect(ids('in case of doubt')).not.toContain('case');
        expect(ids('ORDER BY salary')).toContain('order-by');
        expect(ids('GROUP BY dept_id')).toContain('group-by');
    });

    it('prefers the longest match', () => {
        expect(ids('use a LEFT JOIN here')).toEqual(['left-join']);
        expect(ids('the column is NOT NULL')).toEqual(['column', 'not-null']);
        expect(ids('prefer NOT EXISTS')).toEqual(['exists']);
        // Lower-case "and" is English, not the AND keyword.
        expect(ids('SQL Server and PostgreSQL')).toEqual(['sql-server', 'postgresql']);
    });

    it('never marks words inside `inline code`', () => {
        expect(ids('write `GROUP BY dept_id` then')).toEqual([]);
        expect(ids('GROUP BY, as in `GROUP BY dept_id`')).toEqual(['group-by']);
    });

    it('marks only the first mention across texts read together', () => {
        const [first, second] = g.segmentFirstMentions(['a JOIN here', 'another JOIN there']);
        expect(first.filter(s => s.termId === 'join')).toHaveLength(1);
        expect(second.filter(s => s.termId === 'join')).toHaveLength(0);
    });
});

describe('new words per topic', () => {
    it('explains words taught later the first time they appear', () => {
        expect(allSqlTopics[0].id).toBe('sql0-t1');
        const firstWords = g.newWordsForTopic(topic('sql0-t1')).map(t => t.id);
        // The first lesson mentions the query planner and indexes, taught in Phase 7.
        expect(firstWords).toContain('query-planner');
        expect(firstWords).toContain('index');
        // …and teaches "table" itself, so it isn't listed as a new word there.
        expect(firstWords).not.toContain('table');
    });

    it('never lists the word a topic itself teaches', () => {
        for (const t of allSqlTopics) {
            expect(g.newWordsForTopic(t).some(term => term.taughtIn === t.id)).toBe(false);
        }
    });

    it('finds glossary words in every topic', () => {
        const without = allSqlTopics.filter(t => g.termsInTopic(t).length === 0).map(t => t.id);
        expect(without).toEqual([]);
    });

    it('uses every word that has a lesson somewhere in the course', () => {
        const used = new Set(allSqlTopics.flatMap(t => g.termsInTopic(t)));
        expect(sqlGlossaryTerms.filter(t => !used.has(t.id)).map(t => t.id)).toEqual([]);
    });

    it('searches by word or definition', () => {
        expect(g.search('window').map(t => t.id)).toContain('window-function');
        expect(g.search('')).toHaveLength(sqlGlossaryTerms.length);
    });
});
