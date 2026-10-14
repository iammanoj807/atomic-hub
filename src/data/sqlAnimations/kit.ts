import type { Shape } from '../../components/learning/anim/scene';
import { C, rect, text, tint } from '../../components/learning/anim/kit';
import { practiceTables, type SqlCell } from '../sqlPracticeDb';

export { label, panel } from '../foundationsAnimations/common';

// Pieces the SQL animations share. The data always comes from the practice
// database, so every row drawn is a real row, and each animation's final
// table is checked against its lesson's worked example by a test.

export type Row = Record<string, SqlCell>;

const cache = new Map<string, readonly Row[]>();

/**
 * Every row of a practice table, as objects keyed by column name. The row
 * objects are the same on every call, so `rows.includes(row)` works across
 * calls; the array is a fresh copy, so sorting it is safe.
 */
export const rowsOf = (tableName: string): Row[] => {
    if (!cache.has(tableName)) {
        const found = practiceTables.find(t => t.name === tableName);
        if (!found) throw new Error(`No practice table ${tableName}`);
        cache.set(tableName, found.rows.map(values => Object.freeze(Object.fromEntries(found.columns.map((column, i) => [column.name, values[i]])))));
    }
    return [...cache.get(tableName)!];
};

export const employees = () => rowsOf('employees');
export const departments = () => rowsOf('departments');
export const customers = () => rowsOf('customers');
export const orders = () => rowsOf('orders');
export const products = () => rowsOf('products');
export const orderItems = () => rowsOf('order_items');

/** How a value is shown: NULL as NULL, numbers and text as they are. */
export const show = (value: SqlCell | undefined) => (value === null || value === undefined ? 'NULL' : String(value));

/** Sort like SQL's ORDER BY: NULLs first (as SQLite does), then by value. */
export const compare = (a: SqlCell, b: SqlCell) => {
    if (a === b) return 0;
    if (a === null) return -1;
    if (b === null) return 1;
    return a < b ? -1 : 1;
};

/** A row look: its colour and how strongly it is filled. */
export type Look = [color: string, strength: number];
export const PLAIN: Look = [C.blue, 0.1];
export const KEEP: Look = [C.green, 0.35];
export const DROP: Look = [C.red, 0.3];
export const FOCUS: Look = [C.amber, 0.4];
export const GONE: Look = [C.grey, 0.04];

export interface Column {
    key: string;
    /** Heading; defaults to the key. */
    label?: string;
    w: number;
}

export interface TRow {
    /** Stable across frames, so the row moves instead of popping. */
    id: string;
    values: Record<string, SqlCell | string>;
    look?: Look;
    /** Colour single cells, e.g. a computed column as it fills in. */
    cells?: Record<string, string>;
}

export interface TableOptions {
    rowH?: number;
    size?: number;
    title?: string;
    titleColor?: string;
    /** Draw rows in these slots (row id → slot number) instead of in list order: sorting slides them. */
    slots?: Record<string, number>;
    headerColor?: string;
}

/** Total width of a table's columns. */
export const widthOf = (cols: Column[]) => cols.reduce((s, c) => s + c.w, 0);

/**
 * A small table: a heading row, then one row per item. Every shape's id
 * starts with the table id and the row id, so the same row in the next
 * frame tweens to its new place and colour.
 */
export const table = (id: string, x: number, y: number, cols: Column[], data: TRow[], o: TableOptions = {}): Shape[] => {
    const { rowH = 19, size = 11, title, titleColor = C.grey, slots, headerColor = C.violet } = o;
    const w = widthOf(cols);
    const out: Shape[] = [];
    if (title) out.push(text(`${id}-title`, x, y - 9, title, { size: 11, fill: titleColor, weight: 700, anchor: 'start', mono: true }));
    out.push(rect(`${id}-head`, x, y, w, rowH, { rx: 4, fill: tint(headerColor, 0.28), stroke: 'none' }));
    let cx = x;
    for (const col of cols) {
        out.push(text(`${id}-h-${col.key}`, cx + 6, y + rowH / 2, col.label ?? col.key, { size, fill: C.ink, weight: 700, anchor: 'start', mono: true }));
        cx += col.w;
    }
    data.forEach((row, i) => {
        const slot = slots?.[row.id] ?? i;
        const ry = y + rowH * (slot + 1) + 1;
        const [color, strength] = row.look ?? PLAIN;
        const faded = strength <= 0.05;
        out.push(rect(`${id}-r-${row.id}`, x, ry, w, rowH - 2, { rx: 3, fill: tint(color, strength), stroke: faded ? 'none' : tint(color, Math.min(1, strength + 0.35)), sw: 1 }));
        let px = x;
        for (const col of cols) {
            const value = row.values[col.key];
            const isNull = value === null || value === undefined;
            const fill = row.cells?.[col.key] ?? (faded ? C.dim : isNull ? C.grey : C.ink);
            out.push(text(`${id}-c-${row.id}-${col.key}`, px + 6, ry + (rowH - 2) / 2, isNull ? 'NULL' : String(value), { size, fill, weight: isNull ? 500 : 600, anchor: 'start', mono: true }));
            px += col.w;
        }
    });
    return out;
};

/** The y of the middle of a row slot, for arrows and labels beside a table. */
export const rowMid = (y: number, slot: number, rowH = 19) => y + rowH * (slot + 1) + 1 + (rowH - 2) / 2;

/** A few lines of SQL in a dark strip across the top. Its height is 8 + 14 per line. */
export const sqlBlock = (lines: string[], y = 4, color: string = C.cyan, width = 388): Shape[] => {
    // Every frame is built by a test, so a line too long for the strip fails there, not on screen.
    const fits = Math.floor((width - 16) / 6.6);
    const long = lines.find(line => line.length > fits);
    if (long) throw new Error(`SQL line longer than ${fits} characters: ${long}`);
    return sqlStrip(lines, y, color, width);
};

const sqlStrip = (lines: string[], y: number, color: string, width: number): Shape[] => [
    rect('sql-bg', 6, y, width, 8 + lines.length * 14, { rx: 6, fill: '#161c24ff', stroke: C.faint, sw: 1 }),
    // SVG collapses spaces, so indentation is kept with non-breaking ones.
    ...lines.map((line, i) => text(`sql${i}`, 14, y + 11 + i * 14, line.replace(/^ +/, lead => '\u00a0'.repeat(lead.length)), { size: 11, fill: color, weight: 700, anchor: 'start', mono: true })),
];

/** Rows of a lesson example, for the test: the animation's final table, as plain values. */
export type ResultRows = SqlCell[][];
