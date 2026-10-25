import type { QueryResult } from './sqlRunner';

// The queries you run on the SQL page: which part of a box to run, and how
// each run is saved so you can find it again, with the topic and step it was
// run in. Stored in study_progress/sql_queries (see firebaseService.ts).

/** One query you wrote (or changed) and ran. */
export interface SavedSqlQuery {
    sql: string;
    /** The box it was run in, such as "sql1-t2/practice", so each box can list its own queries. */
    box: string;
    /** Where on the page, in words: "Step 3 · Practice box". */
    place: string;
    /** The topic the box belongs to. Missing for the practice database box. */
    topicId?: string;
    topicName?: string;
    /** When it was last run, in milliseconds since 1970. */
    ranAt: number;
    /** "3 rows", "2 rows changed", or the database's error. */
    outcome: string;
    ok: boolean;
}

export type SavedSqlQueries = Record<string, SavedSqlQuery>;

/** A saved query with its id, for lists. */
export type SavedSqlQueryEntry = SavedSqlQuery & { id: string };

/** The newest this many are kept; one Firestore document holds them all (1 MB limit). */
export const MAX_SAVED_QUERIES = 300;
export const MAX_SAVED_SQL_LENGTH = 2000;

/** The box id for the practice database panel, which belongs to no topic. */
export const DATABASE_BOX = 'practice-database';

/**
 * The part of a box to run: the selected text if something is selected,
 * otherwise everything. `partial` is true when only part of it runs.
 */
export const sqlToRun = (text: string, selectionStart: number, selectionEnd: number) => {
    const selected = text.slice(Math.min(selectionStart, selectionEnd), Math.max(selectionStart, selectionEnd));
    if (!selected.trim()) return { sql: text, partial: false };
    return { sql: selected, partial: selected.trim() !== text.trim() };
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? '' : 's'}`;

/** A run's result in a few words, for the saved list. */
export const outcomeOf = (result: QueryResult) =>
    result.columns.length > 0 ? plural(result.rows.length, 'row') : `${plural(result.changed, 'row')} changed`;

/** A new id. Not crypto.randomUUID, which only exists on https and localhost. */
export const newQueryId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;

/**
 * What to write for a new run. The same query run again in the same box
 * updates its entry instead of adding a copy; past the limit, the oldest are
 * removed; a very long query is cut short. Firestore refuses undefined values,
 * so empty fields are left out.
 */
export const planSave = (existing: SavedSqlQueries, run: SavedSqlQuery, newId: string, max = MAX_SAVED_QUERIES) => {
    const sql = run.sql.slice(0, MAX_SAVED_SQL_LENGTH);
    const same = Object.entries(existing).find(([, saved]) => saved.box === run.box && saved.sql.trim() === sql.trim());
    const id = same ? same[0] : newId;
    const entry = Object.fromEntries(
        Object.entries({ ...run, sql }).filter(([, value]) => value !== undefined)
    ) as unknown as SavedSqlQuery;
    const remove = Object.entries(existing)
        .filter(([key]) => key !== id)
        .sort(([, a], [, b]) => b.ranAt - a.ranAt)
        .slice(max - 1)
        .map(([key]) => key);
    return { id, entry, remove };
};

/** Saved queries, newest first, optionally only those from one box. */
export const savedNewestFirst = (queries: SavedSqlQueries, box?: string): SavedSqlQueryEntry[] =>
    Object.entries(queries)
        .filter(([, saved]) => box === undefined || saved.box === box)
        .map(([id, saved]) => ({ id, ...saved }))
        .sort((a, b) => b.ranAt - a.ranAt);

/**
 * What you typed in a box, kept on this device so it survives closing the
 * topic even if you never ran it. Storage can be missing or blocked (a private
 * window), so this never throws.
 */
export const readSqlDraft = (box: string): string | null => {
    try {
        return localStorage.getItem(`sql-draft:${box}`);
    } catch {
        return null;
    }
};

/** Keep a box's text, or forget it with null. */
export const writeSqlDraft = (box: string, text: string | null) => {
    try {
        if (text === null) localStorage.removeItem(`sql-draft:${box}`);
        else localStorage.setItem(`sql-draft:${box}`, text);
    } catch {
        // Not stored on this device; the query still runs and is still saved when run.
    }
};

/** Saved queries grouped by topic (the practice database is its own group), the most recently used group first. */
export const groupByTopic = (queries: SavedSqlQueries) => {
    const groups = new Map<string, { topicId?: string; title: string; entries: SavedSqlQueryEntry[] }>();
    for (const entry of savedNewestFirst(queries)) {
        const key = entry.topicId ?? DATABASE_BOX;
        if (!groups.has(key)) groups.set(key, { topicId: entry.topicId, title: entry.topicName ?? 'The practice database', entries: [] });
        groups.get(key)!.entries.push(entry);
    }
    return [...groups.values()];
};
