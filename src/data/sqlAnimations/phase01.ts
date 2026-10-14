import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import { C, arrow, box, frame, line, lit, path, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import {
    DROP, FOCUS, GONE, KEEP, PLAIN, compare, customers, departments, employees, label, orderItems, orders, products, rowMid, sqlBlock, table,
    type Column, type Look, type ResultRows, type Row, type TRow,
} from './kit';
import { practiceTables } from '../sqlPracticeDb';

// Phase 0 (start here) and Phase 1 (reading data). Every table drawn is real
// practice data, and `phase01Checks` hands each animation's final rows to a
// test, which compares them with the lesson's worked example.

const asRows = (data: Row[], keys: string[]): ResultRows => data.map(r => keys.map(k => r[k]));
const byName = (a: Row, b: Row) => compare(a.name, b.name);
const empRow = (r: Row, look?: Look, cells?: Record<string, string>): TRow => ({ id: `e${r.emp_id}`, values: r, look, cells });

// ============ sql0-t1 · What a database, a table and SQL are ============

const firstQueryResult = () => employees().filter(r => r.dept_id === 1).sort(byName);

const databaseBasics = (): AnimationSpec => {
    const emp = employees();
    const cols: Column[] = [{ key: 'name', w: 64 }, { key: 'dept_id', w: 66 }, { key: 'salary', w: 62 }];
    const src = (look?: (r: Row) => Look) => table('emp', 10, 62, cols, emp.map(r => empRow(r, look?.(r))), { title: 'employees (stored)' });
    const result = firstQueryResult();
    const res = table('res', 252, 62, [{ key: 'name', w: 62 }, { key: 'salary', w: 62 }], result.map(r => empRow(r, KEEP)), { title: 'result (temporary)', titleColor: C.green });
    const query = sqlBlock(['SELECT name, salary FROM employees', 'WHERE dept_id = 1 ORDER BY name;']);
    const frames: Frame[] = [
        frame('A table is like one sheet of a spreadsheet. Each row is one thing — one employee. Each column is one fact about it — here, the salary column.', [
            src(),
            rect('col', 138, 60, 66, 176, { rx: 6, fill: 'none', stroke: C.amber, sw: 2, dash: '5 4' }),
            arrow('row-a', 248, 90, 206, 90, { stroke: C.cyan, sw: 2 }),
            label('row-t', 252, 90, 'one row = one employee', C.cyan, { size: 11, mono: false }),
            label('col-t', 214, 140, 'one column = one fact', C.amber, { size: 11, mono: false }),
        ]),
        frame('You never open the files. You write a query in SQL and send it. The database first checks that employees, name, salary and dept_id all exist.', [query, src()]),
        frame('It checks every row: is dept_id = 1? Four rows pass. Gus\'s dept_id is NULL (unknown), so he does not.', [query, src(r => (r.dept_id === 1 ? KEEP : GONE))]),
        frame('It sends back a new, temporary table: only the columns asked for, sorted by name.', [query, src(r => (r.dept_id === 1 ? KEEP : GONE)), res]),
        frame('The stored table has not changed at all. A SELECT only reads, so it is always safe to run.', [query, src(), res]),
    ];
    return { title: 'A query asks the database a question and gets a table back', variants: [{ label: 'Your first query', frames }] };
};

// ============ sql0-t2 · Meet the practice database ============

const practiceTour = (): AnimationSpec => {
    const count = (name: string) => practiceTables.find(t => t.name === name)!.rows.length;
    const at: Record<string, [number, number]> = {
        departments: [14, 34], employees: [14, 132], customers: [146, 34], orders: [146, 132], products: [278, 34], order_items: [278, 132],
    };
    const W = 108;
    const H = 44;
    const tables = (on: string[], color: string) => Object.entries(at).map(([name, [x, y]]) => {
        const b = box(`t-${name}`, x, y, W, H, `${name}\n${count(name)} rows`, on.includes(name) ? color : C.grey, { size: 12 });
        return on.includes(name) ? lit(b, color) : b;
    });
    const links: Part = [
        arrow('l-dept', 68, 132, 68, 80, { stroke: C.grey }), text('l-dept-t', 72, 106, 'dept_id', { size: 10, fill: C.grey, anchor: 'start', mono: true }),
        path('l-mgr', [[122, 146], [136, 146], [136, 166], [124, 166]], { stroke: C.grey, sw: 2, arrow: true }),
        arrow('l-cust', 200, 132, 200, 80, { stroke: C.grey }), text('l-cust-t', 204, 106, 'customer_id', { size: 10, fill: C.grey, anchor: 'start', mono: true }),
        arrow('l-ord', 278, 154, 256, 154, { stroke: C.grey }),
        arrow('l-prod', 332, 132, 332, 80, { stroke: C.grey }), text('l-prod-t', 336, 106, 'product_id', { size: 10, fill: C.grey, anchor: 'start', mono: true }),
    ];
    const note = (a: string, b = '', color: string = C.ink) => [
        label('n1', 14, 200, a, color, { size: 11, mono: false }),
        label('n2', 14, 220, b, C.grey, { size: 11, mono: false }),
    ];
    const frames: Frame[] = [
        frame('Six small tables, from two worlds you already know. Every example and exercise in the course uses them, so it pays to know them by heart.', [tables([], C.grey), links, note('Arrows are foreign keys: each points at the table it refers to.')]),
        frame('The company: departments, and employees. Each employee has a dept_id pointing at a department, and a manager_id pointing at another employee (the loop).', [
            tables(['departments', 'employees'], C.violet), links, note('dept_id → departments; manager_id → another employee'),
        ]),
        frame('Awkward cases are planted on purpose, because real data always has them.', [
            tables(['departments', 'employees'], C.violet), links,
            note('Asha: no manager · Gus: no department · HR: nobody', 'Ben and Chen earn the same · Hana out-earns her manager', C.amber),
        ]),
        frame('The shop: customers place orders; order_items records which products are in each order, and how many.', [
            tables(['customers', 'orders', 'order_items', 'products'], C.cyan), links, note('An order\'s amount = the sum of quantity × price over its items.'),
        ]),
        frame('And the shop\'s planted cases. Each one is a lesson later on — NULLs, duplicates, missing matches, streaks.', [
            tables(['customers', 'orders', 'order_items', 'products'], C.cyan), links,
            note('Tom signed up twice · Omar never ordered · Zoe has no city', 'Order 106: no amount · phone case unsold · Priya: 3 days running', C.amber),
        ]),
    ];
    return { title: 'The practice database: six tables, two worlds', variants: [{ label: 'A tour', frames }] };
};

// ============ sql0-t3 · Keys and relationships ============

const keysOneToMany = () => orders().filter(r => r.customer_id === 1);
const keysManyToMany = () => orderItems().filter(r => r.product_id === 6);

const keys = (): AnimationSpec => {
    const cust = customers();
    const ord = orders();
    const small = { size: 10, rowH: 17 };
    const custCols: Column[] = [{ key: 'customer_id', w: 82 }, { key: 'name', w: 50 }];
    const ordCols: Column[] = [{ key: 'order_id', w: 62 }, { key: 'customer_id', w: 82 }];
    const custTable = (look: (r: Row) => Look = () => PLAIN, cells?: (r: Row) => Record<string, string> | undefined) =>
        table('cust', 10, 30, custCols, cust.map(r => ({ id: `c${r.customer_id}`, values: r, look: look(r), cells: cells?.(r) })), { ...small, title: 'customers' });
    const ordTable = (look: (r: Row) => Look = () => PLAIN) =>
        table('ord', 250, 30, ordCols, ord.map(r => ({ id: `o${r.order_id}`, values: r, look: look(r) })), { ...small, title: 'orders' });
    const fk = (shown: Row[], color: (r: Row) => string) => shown.map(r => {
        const from = ord.findIndex(o => o.order_id === r.order_id);
        const to = cust.findIndex(c => c.customer_id === r.customer_id);
        return arrow(`fk${r.order_id}`, 248, rowMid(30, from, 17), 144, rowMid(30, to, 17), { stroke: color(r), sw: 1.5 });
    });
    const one: Frame[] = [
        frame('customers.customer_id is the primary key: the values 1 to 6, each used once and never empty, so each one points at exactly one customer.', [
            custTable(() => PLAIN, () => ({ customer_id: C.amber })), ordTable(),
        ]),
        frame('orders.customer_id is a foreign key: it holds a customer\'s primary key. Order 101 holds 1, which means "Priya placed this order".', [
            custTable(r => (r.customer_id === 1 ? FOCUS : PLAIN)), ordTable(r => (r.order_id === 101 ? FOCUS : PLAIN)), fk(ord.filter(r => r.order_id === 101), () => C.amber),
        ]),
        frame('Every order points at exactly one customer. Priya is pointed at five times: one customer, many orders. That is one-to-many, and the foreign key sits on the "many" side.', [
            custTable(r => (r.customer_id === 1 ? KEEP : PLAIN)), ordTable(r => (r.customer_id === 1 ? KEEP : PLAIN)), fk(ord, r => (r.customer_id === 1 ? C.green : C.dim)),
        ]),
        frame('Nothing points at Omar or the second Tom: they have no orders yet. The database can refuse an order for a customer who does not exist.', [
            custTable(r => (r.customer_id === 4 || r.customer_id === 6 ? DROP : PLAIN)), ordTable(), fk(ord, () => C.dim),
        ]),
    ];

    // Many-to-many through order_items
    const items = orderItems().filter(r => (r.order_id as number) <= 105);
    const prods = products().filter(p => items.some(i => i.product_id === p.product_id));
    const orderIds = [...new Set(items.map(i => i.order_id as number))];
    const iy = 30;
    const itemTable = (look: (r: Row) => Look) => table('items', 112, iy, [{ key: 'order_id', w: 60 }, { key: 'product_id', w: 70 }, { key: 'quantity', w: 58 }],
        items.map(r => ({ id: `i${r.order_id}-${r.product_id}`, values: r, look: look(r) })), { size: 10, rowH: 19, title: 'order_items (link table)' });
    const ordList = (on: (id: number) => boolean) => table('ol', 8, iy, [{ key: 'order_id', w: 62 }], orderIds.map(id => ({ id: `o${id}`, values: { order_id: id }, look: on(id) ? FOCUS : PLAIN })), { size: 10, rowH: 19, title: 'orders' });
    const prodList = (on: (id: number) => boolean) => table('pl', 318, iy, [{ key: 'product', w: 78 }], prods.map(p => ({ id: `p${p.product_id}`, values: { product: p.product_name }, look: on(p.product_id as number) ? FOCUS : PLAIN })), { size: 10, rowH: 19, title: 'products' });
    const links = (on: (r: Row) => boolean) => items.flatMap((r, k) => {
        const oy = rowMid(iy, orderIds.indexOf(r.order_id as number));
        const py = rowMid(iy, prods.findIndex(p => p.product_id === r.product_id));
        const y = rowMid(iy, k);
        const color = on(r) ? C.amber : C.faint;
        return [line(`lo${k}`, 112, y, 70, oy, { stroke: color, sw: on(r) ? 2 : 1 }), line(`lp${k}`, 300, y, 318, py, { stroke: color, sw: on(r) ? 2 : 1 })];
    });
    const many: Frame[] = [
        frame('An order holds many products, and a product is in many orders. Neither table can hold one id for the other — so a link table, order_items, stores pairs: (order, product, quantity).', [ordList(() => false), itemTable(() => PLAIN), prodList(() => false), links(() => false)]),
        frame('Follow order 102: two rows in order_items, pointing at Desk lamp and Backpack. One order, many products.', [
            ordList(id => id === 102), itemTable(r => (r.order_id === 102 ? FOCUS : PLAIN)), prodList(id => id === 4 || id === 5), links(r => r.order_id === 102),
        ]),
        frame('Now follow product 6, Headphones: rows for orders 101, 104 and 105. One product, many orders. Together that is many-to-many.', [
            ordList(id => [101, 104, 105].includes(id)), itemTable(r => (r.product_id === 6 ? KEEP : PLAIN)), prodList(id => id === 6), links(r => r.product_id === 6),
        ]),
        frame('order_items\' primary key is the pair (order_id, product_id): an order can appear on many rows, and so can a product, but never the same pair twice.', [ordList(() => false), itemTable(() => PLAIN), prodList(() => false), links(() => false),
            rect('pk', 110, iy - 2, 134, items.length * 19 + 23, { rx: 6, fill: 'none', stroke: C.amber, sw: 2, dash: '5 4' })]),
    ];
    return {
        title: 'Keys link tables: one-to-many, and many-to-many through a link table',
        variants: [{ label: 'One-to-many', frames: one }, { label: 'Many-to-many', frames: many }],
    };
};

// ============ sql0-t4 · Data types ============

const typeResults = () => [[Math.trunc(7 / 2), 7 / 2.0, parseInt('42', 10) + 1]];
const hiredSince2022 = () => employees().filter(r => (r.hire_date as string) >= '2022-01-01').sort((a, b) => compare(a.hire_date, b.hire_date));

const dataTypes = (): AnimationSpec => {
    const big = (id: string, y: number, value: string, color: string = C.ink, size = 20) => text(id, 200, y, value, { size, fill: color, weight: 800, mono: true });
    const [[whole, exact, cast]] = typeResults();
    const numbers: Frame[] = [
        frame('Every column has a type, and the type decides how values calculate. Two whole numbers (INTEGER) first.', [big('e1', 70, '7 / 2'), label('t1', 200, 110, 'INTEGER ÷ INTEGER', C.grey, { anchor: 'middle', mono: false, size: 12 })]),
        frame(`An integer divided by an integer gives an integer: ${whole}. The .5 is simply thrown away — not rounded.`, [big('e1', 70, `7 / 2 = ${whole}`, C.amber), label('t1', 200, 110, '3.5 → 3: the part after the point is dropped', C.grey, { anchor: 'middle', mono: false, size: 12 })]),
        frame(`Make one side a decimal and you get the exact answer: 7 / 2.0 = ${exact}. CAST(7 AS REAL) / 2 does the same.`, [big('e1', 70, `7 / 2 = ${whole}`, C.grey, 16), big('e2', 112, `7 / 2.0 = ${exact}`, C.green)]),
        frame(`CAST changes a value's type: the text '42' becomes the number 42, so + 1 gives ${cast}.`, [big('e1', 70, `7 / 2 = ${whole}`, C.grey, 16), big('e2', 112, `7 / 2.0 = ${exact}`, C.green, 16), big('e3', 156, `CAST('42' AS INTEGER) + 1 = ${cast}`, C.cyan, 16)]),
    ];
    const chip = (id: string, x: number, y: number, ch: string, color: string, strength = 0.3) =>
        rect(id, x, y, 30, 34, { rx: 6, fill: tint(color, strength), stroke: color, sw: 1.5, text: ch, size: 16, weight: 800, mono: true });
    const hired = hiredSince2022();
    const emp = employees().sort((a, b) => compare(a.hire_date, b.hire_date));
    const dates = (on: boolean) => table('hd', 120, 44, [{ key: 'name', w: 64 }, { key: 'hire_date', w: 96 }], emp.map(r => empRow(r, on ? ((r.hire_date as string) >= '2022-01-01' ? KEEP : GONE) : PLAIN)), { size: 11 });
    const textDates: Frame[] = [
        frame('Text compares character by character, left to right — like a dictionary, not like numbers.', [
            label('a', 60, 60, "'10'", C.ink, { size: 16 }), chip('a1', 120, 43, '1', C.cyan), chip('a2', 154, 43, '0', C.cyan),
            label('b', 60, 116, "'9'", C.ink, { size: 16 }), chip('b1', 120, 99, '9', C.violet),
        ]),
        frame("The first characters already differ: '1' comes before '9'. So as text, '10' < '9' — the length never gets a look in. Store numbers in number columns.", [
            label('a', 60, 60, "'10'", C.ink, { size: 16 }), chip('a1', 120, 43, '1', C.amber, 0.6), chip('a2', 154, 43, '0', C.cyan, 0.15),
            label('b', 60, 116, "'9'", C.ink, { size: 16 }), chip('b1', 120, 99, '9', C.amber, 0.6),
            label('res', 220, 88, "'10' < '9' as text", C.red, { size: 15 }),
        ]),
        frame('Dates written as YYYY-MM-DD text are the exception that works: the biggest unit, the year, comes first, so text order is date order.', [
            sqlBlock(["WHERE hire_date >= '2022-01-01'"]), dates(false),
        ]),
        frame(`Character by character, '2022-…' beats '2021-…' at the fourth character. ${hired.map(r => r.name).join(', ')} pass, in date order.`, [
            sqlBlock(["WHERE hire_date >= '2022-01-01'"]), dates(true),
        ]),
    ];
    return {
        title: 'Types decide how values divide, compare and sort',
        variants: [{ label: 'Numbers', frames: numbers }, { label: 'Text and dates', frames: textDates }],
    };
};

// ============ sql1-t1 · SELECT and FROM ============

const selectResult = () => employees().map(r => [r.name, r.salary, (r.salary as number) + 5000]);

const selectFrom = (): AnimationSpec => {
    const emp = employees();
    const allCols: Column[] = [{ key: 'emp_id', w: 52 }, { key: 'name', w: 54 }, { key: 'dept_id', w: 56 }, { key: 'salary', w: 54 }, { key: 'hire_date', w: 76 }];
    const picked: Column[] = [{ key: 'name', w: 60 }, { key: 'salary', w: 60 }];
    const withRaise: Column[] = [...picked, { key: 'after_raise', w: 90 }];
    const rowsWith = (raise: boolean, hot: boolean) => emp.map(r => ({
        id: `e${r.emp_id}`,
        values: { ...r, after_raise: raise ? (r.salary as number) + 5000 : '' },
        cells: hot ? { after_raise: C.amber } : undefined,
    }));
    const opts = { size: 10, title: 'employees' };
    const frames: Frame[] = [
        frame('FROM employees runs first: the database takes every row of the table, with all its columns.', [sqlBlock(['SELECT name, salary, salary + 5000 AS after_raise', 'FROM employees;']), table('emp', 10, 58, allCols, rowsWith(false, false), opts)]),
        frame('SELECT name, salary keeps only the columns you list. The others are simply not in the result.', [sqlBlock(['SELECT name, salary, salary + 5000 AS after_raise', 'FROM employees;']), table('emp', 10, 58, picked, rowsWith(false, false), { ...opts, title: 'result' })]),
        frame('salary + 5000 is worked out separately for every row. AS after_raise names the new column; without it, the column would be called "salary + 5000".', [
            sqlBlock(['SELECT name, salary, salary + 5000 AS after_raise', 'FROM employees;']), table('emp', 10, 58, withRaise, rowsWith(true, true), { ...opts, title: 'result' }),
            label('calc', 232, 120, 'e.g. 95000 + 5000', C.amber, { size: 12 }), label('calc2', 232, 140, '= 100000', C.amber, { size: 12 }),
        ]),
        frame('One result row for every table row (8), with just these columns. Nothing is saved: after_raise exists only in this result.', [
            sqlBlock(['SELECT name, salary, salary + 5000 AS after_raise', 'FROM employees;']), table('emp', 10, 58, withRaise, rowsWith(true, false), { ...opts, title: 'result' }),
        ]),
    ];
    return { title: 'SELECT picks and calculates columns; FROM says where the rows come from', variants: [{ label: 'Choose and calculate', frames }] };
};

// ============ sql1-t2 · WHERE ============

const whereAnd = () => employees().filter(r => r.dept_id === 1 && (r.salary as number) < 90000).sort(byName);
const whereBrackets = () => employees().filter(r => (r.dept_id === 2 || r.dept_id === 3) && (r.salary as number) > 50000).sort(byName);
const whereNoBrackets = () => employees().filter(r => r.dept_id === 2 || (r.dept_id === 3 && (r.salary as number) > 50000)).sort(byName);

/** true / false / unknown, the way SQL sees a comparison with NULL. */
type Truth = boolean | null;
const mark = (t: Truth) => (t === null ? '?' : t ? '✓' : '✗');
const markColor = (t: Truth) => (t === null ? C.grey : t ? C.green : C.red);

const where = (): AnimationSpec => {
    const emp = employees();
    const cols: Column[] = [{ key: 'name', w: 60 }, { key: 'dept_id', w: 62 }, { key: 'salary', w: 58 }];
    const y = 44;
    const tests = (header: string, x: number, values: Truth[]): Shape[] => [
        text(`th-${x}`, x, y + 9, header, { size: 10, fill: C.ink, weight: 700, mono: true }),
        ...values.map((t, i) => text(`tv-${x}-${i}`, x, rowMid(y, i), mark(t), { size: 13, fill: markColor(t), weight: 800 })),
    ];
    const isDept1 = emp.map(r => (r.dept_id === null ? null : r.dept_id === 1));
    const lowPay = emp.map(r => (r.salary as number) < 90000);
    const kept = whereAnd();
    const tbl = (look: (r: Row) => Look = () => PLAIN, at = y) => table('emp', 10, at, cols, emp.map(r => empRow(r, look(r))), { title: 'employees' });
    const q = sqlBlock(['WHERE dept_id = 1 AND salary < 90000']);
    const andFrames: Frame[] = [
        frame('WHERE checks a condition against every row and keeps only the rows where it is true.', [q, tbl()]),
        frame('First test, dept_id = 1, on each row. For Gus it is unknown (?): NULL = 1 is neither true nor false.', [q, tbl(), tests('dept_id = 1', 240, isDept1)]),
        frame('Second test, salary < 90000. Asha passes the first test but fails this one.', [q, tbl(), tests('dept_id = 1', 240, isDept1), tests('salary < 90000', 330, lowPay)]),
        frame('AND needs both to be true. Only Ben, Chen and Hana have two ticks. Everyone else is dropped — including Gus, whose "unknown" is not true.', [
            q, tbl(r => (kept.includes(r) ? KEEP : GONE)), tests('dept_id = 1', 240, isDept1), tests('salary < 90000', 330, lowPay),
        ]),
        frame(`The result: ${kept.map(r => r.name).join(', ')}. SELECT and ORDER BY then work only on these rows.`, [
            q, table('emp', 10, y, cols, kept.map(r => empRow(r, KEEP)), { title: 'result', titleColor: C.green }),
        ]),
    ];
    const withB = whereBrackets();
    const noB = whereNoBrackets();
    const look = (set: Row[]) => (r: Row) => (set.includes(r) ? KEEP : GONE);
    const bracketFrames: Frame[] = [
        frame('With brackets: (dept_id = 2 OR dept_id = 3) is worked out first, then AND salary > 50000.', [sqlBlock(['WHERE (dept_id = 2 OR dept_id = 3)', '  AND salary > 50000']), tbl(() => PLAIN, 58)]),
        frame(`Department 2 or 3, AND earning over 50000: ${withB.map(r => r.name).join(' and ')}. Eli is in department 2 but earns 45000, so he is out.`, [sqlBlock(['WHERE (dept_id = 2 OR dept_id = 3)', '  AND salary > 50000']), tbl(look(withB), 58)]),
        frame('Now remove the brackets. AND is worked out before OR — just as × comes before + — so this really means dept_id = 2 OR (dept_id = 3 AND salary > 50000).', [sqlBlock(['WHERE dept_id = 2 OR dept_id = 3', '  AND salary > 50000'], 4, C.amber), tbl(look(withB), 58)]),
        frame(`Anyone in department 2 now passes, whatever they earn: ${noB.map(r => r.name).join(', ')}. Eli is back. Same words, different answer — use brackets whenever you mix AND and OR.`, [sqlBlock(['WHERE dept_id = 2 OR dept_id = 3', '  AND salary > 50000'], 4, C.amber), tbl(r => (noB.includes(r) ? (withB.includes(r) ? KEEP : FOCUS) : GONE), 58)]),
    ];
    return { title: 'WHERE keeps the rows where the condition is true', variants: [{ label: 'AND', frames: andFrames }, { label: 'Brackets matter', frames: bracketFrames }] };
};

// ============ sql1-t3 · IN, BETWEEN and LIKE ============

const inResult = () => orders().filter(r => r.status === 'shipped' || r.status === 'pending');
const betweenResult = () => orders().filter(r => (r.order_date as string) >= '2024-02-01' && (r.order_date as string) <= '2024-02-29');
const likeResult = () => products().filter(p => (p.product_name as string).startsWith('P') || (p.product_name as string).endsWith('s')).sort((a, b) => compare(a.product_name, b.product_name));

const inBetweenLike = (): AnimationSpec => {
    const ord = orders();
    const cols: Column[] = [{ key: 'order_id', w: 66 }, { key: 'status', w: 84 }];
    const inSet = inResult();
    const inFrames: Frame[] = [
        frame("IN checks a value against a list: status IN ('shipped', 'pending') is true when status equals any value in it.", [sqlBlock(["WHERE status IN ('shipped', 'pending')"]), table('o', 10, 44, cols, ord.map(r => ({ id: `o${r.order_id}`, values: r })), { title: 'orders', rowH: 17, size: 10 })]),
        frame(`Each row is compared with the list. Only ${inSet.map(r => r.order_id).join(' and ')} match — the same as status = 'shipped' OR status = 'pending', but shorter.`, [
            sqlBlock(["WHERE status IN ('shipped', 'pending')"]), table('o', 10, 44, cols, ord.map(r => ({ id: `o${r.order_id}`, values: r, look: inSet.includes(r) ? KEEP : GONE })), { title: 'orders', rowH: 17, size: 10 }),
            ['shipped', 'pending'].map((s, i) => rect(`list${i}`, 240, 80 + i * 34, 90, 26, { rx: 13, fill: tint(C.green, 0.3), stroke: C.green, sw: 1.5, text: `'${s}'`, size: 12, weight: 700, mono: true })),
            label('list-t', 240, 66, 'the list', C.green, { size: 11, mono: false }),
        ]),
    ];

    // BETWEEN on a timeline
    const x0 = 30;
    const x1 = 380;
    const day = (d: string) => {
        const [, m, dd] = d.split('-').map(Number);
        const doy = (m === 1 ? 0 : m === 2 ? 31 : 60) + dd;
        return x0 + ((doy - 1) / 90) * (x1 - x0);
    };
    const between = betweenResult();
    const dots = (on: boolean) => ord.map((r, i) => {
        const inside = between.includes(r);
        const x = day(r.order_date as string);
        const y = 110 - (i % 3) * 22;
        return [
            rect(`d${r.order_id}`, x - 15, y - 9, 30, 18, { rx: 9, fill: tint(on ? (inside ? C.green : C.grey) : C.blue, on && !inside ? 0.1 : 0.35), stroke: on ? (inside ? C.green : C.faint) : C.blue, sw: 1.5, text: String(r.order_id), size: 10, weight: 700, mono: true }),
        ];
    });
    const axis: Part = [
        line('axis', x0, 134, x1, 134, { stroke: C.dim, sw: 1.5 }),
        ['Jan', 'Feb', 'Mar'].map((m, i) => text(`m${i}`, x0 + ((i * 30.5 + 15) / 90) * (x1 - x0), 148, m, { size: 11, fill: C.grey })),
    ];
    const bracket = (color: string) => [
        rect('feb', day('2024-02-01') - 2, 64, day('2024-02-29') - day('2024-02-01') + 4, 80, { rx: 6, fill: tint(color, 0.08), stroke: color, sw: 2, dash: '5 4' }),
        text('feb-a', day('2024-02-01'), 172, "'2024-02-01'", { size: 10, fill: color, mono: true }),
        text('feb-b', day('2024-02-29'), 188, "'2024-02-29'", { size: 10, fill: color, mono: true }),
    ];
    const betweenFrames: Frame[] = [
        frame('The 10 orders on a timeline from January to March.', [sqlBlock(["WHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'"]), axis, dots(false)]),
        frame("BETWEEN a AND b means >= a AND <= b: both ends are included. The range is the 1st to the 29th of February.", [sqlBlock(["WHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'"]), axis, dots(false), bracket(C.amber)]),
        frame(`Orders ${between.map(r => r.order_id).join(', ')} fall inside. 106 has no amount, but its date is in range, so it is kept — the filter only looks at order_date.`, [sqlBlock(["WHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'"]), axis, dots(true), bracket(C.green)]),
    ];

    // LIKE patterns
    const prods = products();
    const like = likeResult();
    const nameChips = (hit: (name: string) => [number, number] | null, kept: (name: string) => boolean | null) => prods.map((p, i) => {
        const name = p.product_name as string;
        const y = 44 + i * 26;
        const range = hit(name);
        const k = kept(name);
        return [
            ...[...name].map((ch, j) => {
                const on = range && j >= range[0] && j < range[1];
                return rect(`ch${i}-${j}`, 20 + j * 15, y, 14, 20, { rx: 3, fill: tint(on ? C.amber : C.blue, on ? 0.6 : 0.15), stroke: 'none', text: ch === ' ' ? '·' : ch, size: 11, weight: 700, mono: true });
            }),
            k !== null && text(`k${i}`, 200, y + 10, k ? '✓ kept' : '✗', { size: 12, fill: k ? C.green : C.red, weight: 800, anchor: 'start' }),
        ];
    });
    const legend = (value: string) => label('legend', 240, 70, value, C.amber, { size: 12 });
    const likeFrames: Frame[] = [
        frame("LIKE matches text against a pattern. % stands for any number of characters (even none); _ stands for exactly one.", [sqlBlock(["WHERE product_name LIKE 'P%' OR product_name LIKE '%s'"]), nameChips(() => null, () => null)]),
        frame("'P%': a P, then anything. Pen and Phone case match.", [sqlBlock(["WHERE product_name LIKE 'P%' OR product_name LIKE '%s'"]), nameChips(n => (n.startsWith('P') ? [0, 1] : null), n => (n.startsWith('P') ? true : null)), legend("'P%' → starts with P")]),
        frame("'%s': anything, then an s at the very end. Headphones matches. (Backpack has no s at the end; Notebook neither.)", [sqlBlock(["WHERE product_name LIKE 'P%' OR product_name LIKE '%s'"]), nameChips(n => (n.endsWith('s') ? [n.length - 1, n.length] : null), n => (n.endsWith('s') ? true : n.startsWith('P') ? true : null)), legend("'%s' → ends with s")]),
        frame(`OR keeps a name that matches either pattern: ${like.map(p => p.product_name).join(', ')}. Everything else is dropped.`, [sqlBlock(["WHERE product_name LIKE 'P%' OR product_name LIKE '%s'"]), nameChips(n => (n.startsWith('P') ? [0, 1] : n.endsWith('s') ? [n.length - 1, n.length] : null), n => like.some(p => p.product_name === n))]),
    ];
    return {
        title: 'Shorter conditions: a list, a range, a pattern',
        variants: [{ label: 'IN', frames: inFrames }, { label: 'BETWEEN', frames: betweenFrames }, { label: 'LIKE', frames: likeFrames }],
    };
};

// ============ sql1-t4 · NULL ============

const isNullResult = () => employees().filter(r => r.manager_id === null);
const notOneResult = () => employees().filter(r => r.dept_id !== null && r.dept_id !== 1).sort(byName);
const coalesceResult = () => orders().filter(r => r.customer_id === 3).map(r => [r.order_id, r.amount, r.amount ?? 0]);

const nullLesson = (): AnimationSpec => {
    const emp = employees();
    const y = 44;
    const verdicts = (header: string, values: Truth[], x = 230): Shape[] => [
        text('vh', x, y + 9, header, { size: 11, fill: C.ink, weight: 700, mono: true }),
        ...values.map((t, i) => text(`v${i}`, x, rowMid(y, i), t === null ? 'unknown' : t ? 'true' : 'false', { size: 11, fill: markColor(t), weight: 700, mono: true })),
    ];
    const mgrTable = (look: (r: Row) => Look = () => PLAIN) => table('emp', 10, y, [{ key: 'name', w: 62 }, { key: 'manager_id', w: 84 }], emp.map(r => empRow(r, look(r))), { title: 'employees' });
    const eq: Frame[] = [
        frame('NULL means "unknown". Asha has no manager, so her manager_id is NULL. How do you find her?', [mgrTable()]),
        frame('manager_id = NULL asks "is this equal to unknown?" — and the answer is always unknown, even for Asha (unknown = unknown is still unknown).', [sqlBlock(['WHERE manager_id = NULL']), mgrTable(), verdicts('= NULL', emp.map(() => null))]),
        frame('WHERE keeps only rows where the test is true. Nothing is true, so no rows come back at all — and no error tells you.', [sqlBlock(['WHERE manager_id = NULL']), mgrTable(() => GONE), verdicts('= NULL', emp.map(() => null))]),
        frame(`IS NULL is a real yes/no test. It is true for Asha only: ${isNullResult().map(r => r.name).join(', ')}.`, [sqlBlock(['WHERE manager_id IS NULL'], 4, C.green), mgrTable(r => (r.manager_id === null ? KEEP : GONE)), verdicts('IS NULL', emp.map(r => r.manager_id === null))]),
    ];
    const deptTable = (look: (r: Row) => Look = () => PLAIN) => table('emp', 10, y, [{ key: 'name', w: 62 }, { key: 'dept_id', w: 70 }], emp.map(r => empRow(r, look(r))), { title: 'employees' });
    const notEq = emp.map(r => (r.dept_id === null ? null : r.dept_id !== 1));
    const ne: Frame[] = [
        frame('"Everyone not in department 1." Gus has no department at all — surely he counts?', [sqlBlock(['WHERE dept_id <> 1']), deptTable()]),
        frame('For Gus, NULL <> 1 is unknown — not true. So WHERE quietly drops him, even though he is clearly not in department 1.', [sqlBlock(['WHERE dept_id <> 1']), deptTable(r => (r.dept_id === null ? FOCUS : PLAIN)), verdicts('<> 1', notEq)]),
        frame(`The result is only ${notOneResult().map(r => r.name).join(', ')}. To keep Gus, say so: WHERE dept_id <> 1 OR dept_id IS NULL.`, [sqlBlock(['WHERE dept_id <> 1']), deptTable(r => (notOneResult().includes(r) ? KEEP : r.dept_id === null ? DROP : GONE)), verdicts('<> 1', notEq)]),
    ];
    const lena = coalesceResult();
    const co: Frame[] = [
        frame('Any arithmetic with NULL gives NULL: 10 + NULL is NULL. Order 106 has no amount, which would spoil any sum you build from it.', [
            sqlBlock(['SELECT order_id, amount, COALESCE(amount, 0)', 'FROM orders WHERE customer_id = 3;']),
            table('co', 40, 70, [{ key: 'order_id', w: 76 }, { key: 'amount', w: 70 }], lena.map(([id, amount]) => ({ id: `o${id}`, values: { order_id: id, amount } })), { title: 'orders' }),
        ]),
        frame('COALESCE(a, b, …) returns the first value that is not NULL. For 106 that is the 0; for 107 it is the amount itself, 60.', [
            sqlBlock(['SELECT order_id, amount, COALESCE(amount, 0)', 'FROM orders WHERE customer_id = 3;']),
            table('co', 40, 70, [{ key: 'order_id', w: 76 }, { key: 'amount', w: 70 }, { key: 'amount_or_zero', w: 120 }], lena.map(([id, amount, z]) => ({ id: `o${id}`, values: { order_id: id, amount, amount_or_zero: z }, cells: { amount_or_zero: C.green } })), { title: 'orders' }),
        ]),
    ];
    return {
        title: 'NULL is "unknown": = never matches it, and <> quietly drops it',
        variants: [{ label: '= NULL vs IS NULL', frames: eq }, { label: 'NULL and <>', frames: ne }, { label: 'COALESCE', frames: co }],
    };
};

// ============ sql1-t5 · ORDER BY, LIMIT and OFFSET ============

const bySalaryThenName = (a: Row, b: Row) => (b.salary as number) - (a.salary as number) || compare(a.name, b.name);
const sortedResult = () => [...employees()].sort(bySalaryThenName);
const pageTwo = () => [...orders()].sort((a, b) => compare(a.order_date, b.order_date)).slice(3, 6);

const orderByLimit = (): AnimationSpec => {
    const emp = employees();
    const sorted = sortedResult();
    const cols: Column[] = [{ key: 'name', w: 64 }, { key: 'salary', w: 70 }];
    const slots = (list: Row[]) => Object.fromEntries(list.map((r, i) => [`e${r.emp_id}`, i]));
    const y = 44;
    const tie = (r: Row) => r.salary === 70000;
    const tbl = (order: Row[], look: (r: Row) => Look = () => PLAIN) => table('emp', 110, y, cols, emp.map(r => empRow(r, look(r))), { title: 'employees', slots: slots(order) });
    // A plain sort on salary alone: SQL may put the tied rows either way round; Chen first shows why the tiebreaker matters.
    const salaryOnly = [...emp].sort((a, b) => (b.salary as number) - (a.salary as number) || (b.emp_id as number) - (a.emp_id as number));
    const sortFrames: Frame[] = [
        frame('Without ORDER BY, rows come back in no promised order. Here they happen to be in emp_id order.', [sqlBlock(['ORDER BY salary DESC, name']), tbl(emp)]),
        frame('ORDER BY salary DESC: highest first. Ben and Chen tie on 70000, so their order is not decided yet — either could come first.', [sqlBlock(['ORDER BY salary DESC, name']), tbl(salaryOnly, r => (tie(r) ? FOCUS : PLAIN))]),
        frame('The second sort column, name, breaks the tie: Ben before Chen. Now the order is fully decided.', [sqlBlock(['ORDER BY salary DESC, name']), tbl(sorted, r => (tie(r) ? KEEP : PLAIN))]),
        frame('LIMIT 3 keeps the first three rows after sorting: Asha, Hana, Ben. Chen is cut off — even though he earns exactly what Ben earns. "Top 3" can hide a tie.', [
            sqlBlock(['ORDER BY salary DESC, name LIMIT 3']), tbl(sorted, r => (sorted.indexOf(r) < 3 ? KEEP : r.name === 'Chen' ? DROP : GONE)),
            line('cut', 100, y + 19 * 4, 290, y + 19 * 4, { stroke: C.red, sw: 2, dash: '5 4' }), label('cut-t', 296, y + 19 * 4, 'LIMIT 3', C.red, { size: 11 }),
        ]),
    ];
    const ord = [...orders()].sort((a, b) => compare(a.order_date, b.order_date));
    const page = pageTwo();
    const pageTable = (on: boolean) => table('ord', 80, y, [{ key: 'order_id', w: 76 }, { key: 'order_date', w: 96 }], ord.map(r => ({ id: `o${r.order_id}`, values: r, look: on ? (page.includes(r) ? KEEP : GONE) : PLAIN })), { title: 'orders by date', rowH: 17, size: 10 });
    const pages = (on: boolean): Part => [0, 1, 2].map(p => [
        rect(`pg${p}`, 260, y + 17 * (p * 3 + 1), 10, 17 * 3 - 2, { rx: 3, fill: p === 1 && on ? C.green : C.faint }),
        label(`pgt${p}`, 278, y + 17 * (p * 3 + 1) + 24, `page ${p + 1}`, p === 1 && on ? C.green : C.grey, { size: 11 }),
    ]);
    const pageFrames: Frame[] = [
        frame('Pages of 3, sorted by date. Page 1 is LIMIT 3; page 2 must skip the first 3 rows.', [sqlBlock(['ORDER BY order_date LIMIT 3 OFFSET 3']), pageTable(false), pages(false)]),
        frame(`OFFSET 3 skips three rows, then LIMIT 3 takes the next three: orders ${page.map(r => r.order_id).join(', ')}. Without ORDER BY, "page 2" would be meaningless.`, [sqlBlock(['ORDER BY order_date LIMIT 3 OFFSET 3']), pageTable(true), pages(true)]),
    ];
    return { title: 'ORDER BY sorts; LIMIT and OFFSET cut the sorted list', variants: [{ label: 'Sort and top 3', frames: sortFrames }, { label: 'Page 2', frames: pageFrames }] };
};

// ============ sql1-t6 · DISTINCT ============

const distinctLocations = () => [...new Set(departments().map(r => r.location as string))].sort();
const distinctNameEmail = () => {
    const seen = new Map<string, Row>();
    customers().forEach(r => seen.set(`${r.name}|${r.email}`, r));
    return [...seen.values()].sort(byName);
};

const distinct = (): AnimationSpec => {
    const deps = departments();
    const locs = distinctLocations();
    const y = 50;
    const locTable = (rows: { id: string; location: string; look?: Look }[]) => table('loc', 130, y + 8, [{ key: 'location', w: 110 }], rows.map(r => ({ id: r.id, values: { location: r.location }, look: r.look })), { title: 'result' });
    const one: Frame[] = [
        frame('SELECT location FROM departments gives one row per department: London appears twice.', [sqlBlock(['SELECT DISTINCT location FROM departments']), locTable(deps.map(d => ({ id: `d${d.dept_id}`, location: d.location as string })))]),
        frame('DISTINCT compares whole rows. The two London rows are identical, so they are duplicates.', [sqlBlock(['SELECT DISTINCT location FROM departments']), locTable(deps.map(d => ({ id: `d${d.dept_id}`, location: d.location as string, look: d.location === 'London' ? FOCUS : PLAIN })))]),
        frame(`One copy of each is kept; ORDER BY then sorts what is left: ${locs.join(', ')}.`, [sqlBlock(['SELECT DISTINCT location FROM departments', 'ORDER BY location;']), locTable(locs.map(l => ({ id: `d${deps.find(d => d.location === l)!.dept_id}`, location: l, look: KEEP })))]),
    ];
    const cust = customers();
    const ne = distinctNameEmail();
    const twoCols = (cols: Column[], rows: Row[], look: (r: Row) => Look, title: string) => table('cu', 40, y, cols, rows.map(r => ({ id: `c${r.customer_id}`, values: r, look: look(r) })), { title });
    const nameEmail: Column[] = [{ key: 'name', w: 60 }, { key: 'email', w: 120 }];
    const idName: Column[] = [{ key: 'customer_id', w: 92 }, { key: 'name', w: 60 }];
    const isTom = (r: Row) => r.name === 'Tom';
    const many: Frame[] = [
        frame('Tom signed up twice with the same email. Select name and email: his two rows are identical in every selected column.', [sqlBlock(['SELECT DISTINCT name, email FROM customers']), twoCols(nameEmail, cust, r => (isTom(r) ? FOCUS : PLAIN), 'name, email')]),
        frame(`DISTINCT keeps one: ${ne.length} rows. Both columns matched, so they count as one row.`, [sqlBlock(['SELECT DISTINCT name, email FROM customers']), twoCols(nameEmail, ne, () => KEEP, 'name, email')]),
        frame('Now select customer_id and name. The two Toms have different ids (2 and 6), so the rows differ — and DISTINCT keeps both. It applies to the whole row, never to one column.', [sqlBlock(['SELECT DISTINCT customer_id, name FROM customers']), twoCols(idName, cust, r => (isTom(r) ? KEEP : PLAIN), 'customer_id, name')]),
    ];
    return { title: 'DISTINCT drops rows that match in every selected column', variants: [{ label: 'One column', frames: one }, { label: 'Several columns', frames: many }] };
};

// ============ sql1-t7 · CASE WHEN ============

const band = (salary: number) => (salary >= 80000 ? 'high' : salary >= 50000 ? 'medium' : 'low');
const caseResult = () => [...employees()].sort(bySalaryThenName).map(r => [r.name, r.salary, band(r.salary as number)]);

const caseWhen = (): AnimationSpec => {
    const emp = [...employees()].sort(bySalaryThenName);
    const y = 44;
    const tbl = (upTo: number, at: Row | null) => table('emp', 10, y, [{ key: 'name', w: 60 }, { key: 'salary', w: 58 }, { key: 'band', w: 62 }],
        emp.map((r, i) => ({ id: `e${r.emp_id}`, values: { ...r, band: i <= upTo || r === at ? band(r.salary as number) : '' }, look: r === at ? FOCUS : PLAIN, cells: { band: C.amber } })), { title: 'employees' });
    const ladder = (hit: number | null, tested: number) => [
        ['WHEN salary >= 80000', "THEN 'high'"], ['WHEN salary >= 50000', "THEN 'medium'"], ['ELSE', "'low'"],
    ].map(([when, then], i) => {
        const on = hit === i;
        const checked = i < tested;
        const color = on ? C.green : checked ? C.red : C.grey;
        return rect(`w${i}`, 214, 60 + i * 40, 178, 32, { rx: 7, fill: tint(color, on ? 0.45 : 0.12), stroke: color, sw: on ? 2.5 : 1.5, text: `${when}\n${then}`, size: 10, weight: 700, mono: true });
    });
    const pick = (name: string) => emp.find(r => r.name === name)!;
    const step = (name: string) => {
        const r = pick(name);
        const s = r.salary as number;
        const hit = s >= 80000 ? 0 : s >= 50000 ? 1 : 2;
        return { r, hit };
    };
    const asha = step('Asha');
    const ben = step('Ben');
    const eli = step('Eli');
    const frames: Frame[] = [
        frame('CASE is SQL\'s if-else. For each row it tries the WHEN lines from top to bottom and returns the THEN of the first one that is true.', [tbl(-1, null), ladder(null, 0)]),
        frame('Asha, 95000: salary >= 80000 is true on the first line, so her band is \'high\' and CASE stops looking.', [tbl(-1, asha.r), ladder(asha.hit, asha.hit)]),
        frame('Ben, 70000: the first line is false; salary >= 50000 is true, so \'medium\'.', [tbl(-1, ben.r), ladder(ben.hit, ben.hit)]),
        frame('Eli, 45000: both tests are false, so ELSE gives \'low\'. With no ELSE, he would get NULL.', [tbl(-1, eli.r), ladder(eli.hit, eli.hit)]),
        frame('Every row gets its band. Order matters: if the >= 50000 line came first, Asha would stop there and wrongly get \'medium\'.', [tbl(99, null), ladder(null, 0)]),
    ];
    return { title: 'CASE WHEN: the first true line wins', variants: [{ label: 'Salary bands', frames }] };
};

// ============ sql1-t8 · Built-in functions ============

const functionResult = () => employees().filter(r => r.dept_id === 2).sort(byName).map(r => {
    const n = r.name as string;
    return [n, n.toUpperCase(), n.length, n.slice(0, 3)];
});

const functions = (): AnimationSpec => {
    const rows = functionResult();
    const cols: Column[] = [{ key: 'name', w: 56 }, { key: 'shout', w: 60 }, { key: 'letters', w: 66 }, { key: 'first_three', w: 100 }];
    const y = 70;
    const tbl = (filled: number, hot: string | null) => table('fn', 50, y, cols, rows.map(([name, shout, letters, first]) => ({
        id: String(name),
        values: { name, shout: filled >= 1 ? shout : '', letters: filled >= 2 ? letters : '', first_three: filled >= 3 ? first : '' },
        cells: hot ? { [hot]: C.amber } : undefined,
    })), { title: 'employees in department 2' });
    const q = sqlBlock(['SELECT name, UPPER(name) AS shout,', '       LENGTH(name) AS letters,', '       SUBSTR(name, 1, 3) AS first_three']);
    const flow = (fn: string, input: string, output: string) => [
        rect('in', 60, 150, 80, 28, { rx: 6, fill: tint(C.blue, 0.25), stroke: C.blue, sw: 1.5, text: input, size: 12, weight: 700, mono: true }),
        arrow('a1', 142, 164, 166, 164, { stroke: C.grey }),
        rect('fnbox', 168, 148, 104, 32, { rx: 8, fill: tint(C.violet, 0.3), stroke: C.violet, sw: 2, text: fn, size: 11, weight: 700, mono: true }),
        arrow('a2', 274, 164, 298, 164, { stroke: C.grey }),
        rect('out', 300, 150, 80, 28, { rx: 6, fill: tint(C.amber, 0.3), stroke: C.amber, sw: 1.5, text: output, size: 12, weight: 700, mono: true }),
    ];
    const [dara] = rows;
    const frames: Frame[] = [
        frame('A function takes a value and gives back one value — once for every row. Two rows in department 2: Dara and Eli.', [q, tbl(0, null)]),
        frame(`UPPER('${dara[0]}') = '${dara[1]}'. Worked out for each row separately.`, [q, tbl(1, 'shout'), flow('UPPER', `'${dara[0]}'`, `'${dara[1]}'`)]),
        frame(`LENGTH counts characters: '${dara[0]}' has ${dara[2]}.`, [q, tbl(2, 'letters'), flow('LENGTH', `'${dara[0]}'`, String(dara[2]))]),
        frame(`SUBSTR(name, 1, 3): start at character 1 (SQL counts from 1), take 3: '${dara[3]}'.`, [q, tbl(3, 'first_three'), flow('SUBSTR(…,1,3)', `'${dara[0]}'`, `'${dara[3]}'`)]),
        frame('Two rows in, two rows out. That is the difference from an aggregate like SUM, which turns many rows into one (Phase 2).', [q, tbl(3, null)]),
    ];
    return { title: 'Row functions: one value in, one value out, for every row', variants: [{ label: 'Text functions', frames }] };
};

export const phase01Animations: Record<string, () => AnimationSpec> = {
    'sql0-t1': databaseBasics,
    'sql0-t2': practiceTour,
    'sql0-t3': keys,
    'sql0-t4': dataTypes,
    'sql1-t1': selectFrom,
    'sql1-t2': where,
    'sql1-t3': inBetweenLike,
    'sql1-t4': nullLesson,
    'sql1-t5': orderByLimit,
    'sql1-t6': distinct,
    'sql1-t7': caseWhen,
    'sql1-t8': functions,
};

/** For each animation: which worked examples it shows, and the rows it ends on. */
export const phase01Checks: Record<string, () => { example: number; rows: ResultRows }[]> = {
    'sql0-t1': () => [{ example: 0, rows: asRows(firstQueryResult(), ['name', 'salary']) }],
    'sql0-t3': () => [
        { example: 0, rows: asRows(keysOneToMany(), ['order_id', 'customer_id', 'amount']) },
        { example: 1, rows: asRows(keysManyToMany(), ['order_id', 'product_id', 'quantity']) },
    ],
    'sql0-t4': () => [
        { example: 0, rows: typeResults() },
        { example: 1, rows: asRows(hiredSince2022(), ['name', 'hire_date']) },
    ],
    'sql1-t1': () => [{ example: 0, rows: selectResult() }],
    'sql1-t2': () => [
        { example: 0, rows: asRows(whereAnd(), ['name', 'salary']) },
        { example: 1, rows: asRows(whereBrackets(), ['name', 'dept_id', 'salary']) },
        { example: 2, rows: asRows(whereNoBrackets(), ['name', 'dept_id', 'salary']) },
    ],
    'sql1-t3': () => [
        { example: 0, rows: asRows(inResult(), ['order_id', 'status']) },
        { example: 1, rows: asRows(betweenResult(), ['order_id', 'order_date', 'amount']) },
        { example: 2, rows: asRows(likeResult(), ['product_name']) },
    ],
    'sql1-t4': () => [
        { example: 0, rows: [] },
        { example: 1, rows: asRows(isNullResult(), ['name', 'manager_id']) },
        { example: 2, rows: asRows(notOneResult(), ['name', 'dept_id']) },
        { example: 3, rows: coalesceResult() },
    ],
    'sql1-t5': () => [
        { example: 0, rows: asRows(sortedResult(), ['name', 'salary']) },
        { example: 1, rows: asRows(sortedResult().slice(0, 3), ['name', 'salary']) },
        { example: 2, rows: asRows(pageTwo(), ['order_id', 'order_date']) },
    ],
    'sql1-t6': () => [
        { example: 0, rows: distinctLocations().map(l => [l]) },
        { example: 1, rows: asRows(distinctNameEmail(), ['name', 'email']) },
        { example: 2, rows: asRows(customers(), ['customer_id', 'name']) },
    ],
    'sql1-t7': () => [{ example: 0, rows: caseResult() }],
    'sql1-t8': () => [{ example: 0, rows: functionResult() }],
};
