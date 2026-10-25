import { describe, it, expect } from 'vitest';
import {
    MAX_SAVED_SQL_LENGTH,
    groupByTopic,
    newQueryId,
    outcomeOf,
    planSave,
    readSqlDraft,
    writeSqlDraft,
    savedNewestFirst,
    sqlToRun,
    type SavedSqlQueries,
    type SavedSqlQuery,
} from '../sqlQueries';

const run = (overrides: Partial<SavedSqlQuery> = {}): SavedSqlQuery => ({
    sql: 'SELECT 1;',
    box: 'sql1-t1/practice',
    place: 'Step 3 · Practice box',
    topicId: 'sql1-t1',
    topicName: 'SELECT and FROM',
    ranAt: 1000,
    outcome: '1 row',
    ok: true,
    ...overrides,
});

describe('which part of the box runs', () => {
    const text = 'SELECT * FROM orders;\nSELECT name FROM employees;';

    it('runs everything when nothing is selected', () => {
        expect(sqlToRun(text, 5, 5)).toEqual({ sql: text, partial: false });
    });

    it('runs only the selection', () => {
        expect(sqlToRun(text, 0, 21)).toEqual({ sql: 'SELECT * FROM orders;', partial: true });
    });

    it('works whichever way the selection was made', () => {
        expect(sqlToRun(text, 21, 0).sql).toBe('SELECT * FROM orders;');
    });

    it('runs everything when only spaces are selected', () => {
        expect(sqlToRun('SELECT 1;   \n', 9, 13)).toEqual({ sql: 'SELECT 1;   \n', partial: false });
    });

    it('does not call a selection of the whole box partial', () => {
        expect(sqlToRun(text, 0, text.length).partial).toBe(false);
    });
});

describe('saving a run', () => {
    it('adds a new entry, leaving out empty fields', () => {
        const plan = planSave({}, run({ topicId: undefined, topicName: undefined, box: 'practice-database' }), 'new');
        expect(plan.id).toBe('new');
        expect(plan.remove).toEqual([]);
        expect('topicId' in plan.entry).toBe(false);
        expect('topicName' in plan.entry).toBe(false);
    });

    it('updates the same query in the same box instead of copying it', () => {
        const existing: SavedSqlQueries = { a: run(), b: run({ box: 'sql1-t1/example-1' }) };
        const plan = planSave(existing, run({ sql: '  SELECT 1;  ', ranAt: 2000 }), 'new');
        expect(plan.id).toBe('a');
        expect(plan.entry.ranAt).toBe(2000);
    });

    it('keeps the same query from a different box as its own entry', () => {
        const plan = planSave({ a: run() }, run({ box: 'sql1-t1/your-turn' }), 'new');
        expect(plan.id).toBe('new');
    });

    it('removes the oldest entries past the limit', () => {
        const existing: SavedSqlQueries = {
            old: run({ sql: 'SELECT 1;', ranAt: 1 }),
            mid: run({ sql: 'SELECT 2;', ranAt: 2 }),
            recent: run({ sql: 'SELECT 3;', ranAt: 3 }),
        };
        expect(planSave(existing, run({ sql: 'SELECT 4;', ranAt: 4 }), 'new', 3).remove).toEqual(['old']);
        expect(planSave(existing, run({ sql: 'SELECT 1;', ranAt: 4 }), 'new', 3).remove).toEqual([]);
    });

    it('cuts a very long query short', () => {
        const plan = planSave({}, run({ sql: 'x'.repeat(MAX_SAVED_SQL_LENGTH + 50) }), 'new');
        expect(plan.entry.sql).toHaveLength(MAX_SAVED_SQL_LENGTH);
    });

    it('makes ids Firestore can use as keys', () => {
        const ids = new Set(Array.from({ length: 200 }, newQueryId));
        expect(ids.size).toBe(200);
        for (const id of ids) expect(id).toMatch(/^[a-z0-9]+$/);
    });
});

describe('listing saved queries', () => {
    const queries: SavedSqlQueries = {
        a: run({ ranAt: 1 }),
        b: run({ ranAt: 3, box: 'practice-database', topicId: undefined, topicName: undefined }),
        c: run({ ranAt: 2, sql: 'SELECT 2;' }),
    };

    it('puts the newest first, and can keep only one box', () => {
        expect(savedNewestFirst(queries).map(entry => entry.id)).toEqual(['b', 'c', 'a']);
        expect(savedNewestFirst(queries, 'sql1-t1/practice').map(entry => entry.id)).toEqual(['c', 'a']);
    });

    it('groups by topic, the most recently used first', () => {
        const groups = groupByTopic(queries);
        expect(groups.map(group => group.title)).toEqual(['The practice database', 'SELECT and FROM']);
        expect(groups[1].entries.map(entry => entry.id)).toEqual(['c', 'a']);
    });

    it('never throws when this device has no storage', () => {
        expect(() => writeSqlDraft('sql1-t1/practice', 'SELECT 1;')).not.toThrow();
        expect(() => readSqlDraft('sql1-t1/practice')).not.toThrow();
    });

    it('describes a result in a few words', () => {
        expect(outcomeOf({ columns: ['n'], rows: [[1]], changed: 0 })).toBe('1 row');
        expect(outcomeOf({ columns: ['n'], rows: [], changed: 0 })).toBe('0 rows');
        expect(outcomeOf({ columns: [], rows: [], changed: 2 })).toBe('2 rows changed');
    });
});
