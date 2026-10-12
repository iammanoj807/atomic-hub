import type { SqlJsStatic } from 'sql.js';

// SQLite compiled to WebAssembly, loaded the first time someone runs a query,
// so it never weighs on the rest of the app.

let engine: Promise<SqlJsStatic> | null = null;

export const loadSqlEngine = (): Promise<SqlJsStatic> => {
    engine ??= Promise.all([import('sql.js'), import('sql.js/dist/sql-wasm.wasm?url')])
        .then(([sqlJs, wasm]) => sqlJs.default({ locateFile: () => wasm.default }))
        .catch(error => {
            // Let the next Run try again, e.g. after the connection comes back.
            engine = null;
            throw error;
        });
    return engine;
};
