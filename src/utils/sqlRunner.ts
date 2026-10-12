import type { SqlJsStatic } from 'sql.js';
import { practiceDbSql, type SqlCell } from '../data/sqlPracticeDb';

// Runs SQL on a fresh copy of the practice database. The engine is passed in,
// so the page (which loads it lazily in the browser) and the tests (which load
// it in Node) share this one function.

export interface QueryResult {
    columns: string[];
    rows: SqlCell[][];
    /** Rows changed by the last INSERT, UPDATE or DELETE, when nothing was selected. */
    changed: number;
}

const toCell = (value: unknown): SqlCell =>
    value === null || typeof value === 'number' || typeof value === 'string' ? value : String(value);

/**
 * Run one or more statements on a new copy of the practice database and
 * return the last result set. Every run starts clean, so a DELETE in one
 * example can never break the next. Throws the database's own error message.
 */
export const runOnPracticeDb = (SQL: SqlJsStatic, query: string, options: { reverseUnordered?: boolean } = {}): QueryResult => {
    const db = new SQL.Database();
    try {
        db.run(practiceDbSql);
        // Test-only: makes rows without an ORDER BY come out in a different order.
        if (options.reverseUnordered) db.run('PRAGMA reverse_unordered_selects = ON;');
        // Statement by statement, so a SELECT that finds nothing still reports its columns.
        let last: { columns: string[]; rows: SqlCell[][] } | null = null;
        for (const statement of db.iterateStatements(query)) {
            const columns = statement.getColumnNames();
            const rows: SqlCell[][] = [];
            while (statement.step()) rows.push(statement.get().map(toCell));
            statement.free();
            if (columns.length > 0) last = { columns, rows };
        }
        return last ? { ...last, changed: 0 } : { columns: [], rows: [], changed: db.getRowsModified() };
    } finally {
        db.close();
    }
};
