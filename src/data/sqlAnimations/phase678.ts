import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import { C, arrow, box, frame, line, path, rect, text, tint } from '../../components/learning/anim/kit';
import {
    DROP, FOCUS, GONE, KEEP, PLAIN, compare, customers, employees, label, orderItems, orders, products, rowMid, sqlBlock, table,
    type Column, type Look, type ResultRows, type Row,
} from './kit';
import type { SqlCell } from '../sqlPracticeDb';

// Phase 6 (changing data), Phase 7 (indexes and performance) and the
// interview method from Phase 8. As before, `phase678Checks` lets a test
// compare each animation's final rows with its lesson's worked example.

const sum = (values: SqlCell[]) => values.reduce<number>((s, v) => s + (typeof v === 'number' ? v : 0), 0);
const short = (date: SqlCell) => (date as string).slice(5);

// ============ sql6-t1 · CREATE TABLE and ALTER TABLE ============

const suppliersRows = () => [[1, 'PaperCo', 'UK'], [2, 'SoundWorks', 'Germany']];
const inStockRows = () => products().filter(p => p.category === 'Electronics').sort((a, b) => compare(a.product_name, b.product_name)).map(p => [p.product_name, p.price, 1]);

const createAlter = (): AnimationSpec => {
    const cols: Column[] = [{ key: 'supplier_id', w: 96 }, { key: 'name', w: 96 }, { key: 'country', w: 84 }];
    const rules = (on: boolean) => [
        ['PRIMARY KEY', C.amber], ['NOT NULL', C.violet], ["DEFAULT 'UK'", C.cyan],
    ].map(([r, color], i) => rect(`rule${i}`, 60 + cols.slice(0, i).reduce((s, c) => s + c.w, 0), 128, cols[i].w - 6, 20, { rx: 10, fill: tint(color, on ? 0.3 : 0.1), stroke: color, sw: 1.5, text: r, size: 9, weight: 700, mono: true }));
    const rows = suppliersRows();
    const supTable = (n: number, hotDefault: boolean) => table('sup', 60, 64, cols, rows.slice(0, n).map(([id, name, country]) => ({
        id: `s${id}`, values: { supplier_id: id, name, country }, look: KEEP, cells: hotDefault && id === 1 ? { country: C.amber } : undefined,
    })), { title: 'suppliers', rowH: 20 });
    const create: Frame[] = [
        frame('CREATE TABLE defines the shape: a name, columns, a type for each, and rules (constraints). It creates no rows.', [
            sqlBlock(['CREATE TABLE suppliers (supplier_id INTEGER PRIMARY KEY,', "  name TEXT NOT NULL, country TEXT DEFAULT 'UK');"]), supTable(0, false), rules(true),
        ]),
        frame("INSERT (1, 'PaperCo') leaves country out, so the DEFAULT fills it in: 'UK'.", [
            sqlBlock(['INSERT INTO suppliers (supplier_id, name)', "VALUES (1, 'PaperCo');"]), supTable(1, true),
            label('val', 60, 132, "country left out → DEFAULT 'UK'", C.amber, { size: 11 }),
        ]),
        frame("INSERT (2, 'SoundWorks', 'Germany') gives every value, so no default is needed.", [sqlBlock(['INSERT INTO suppliers', "VALUES (2, 'SoundWorks', 'Germany');"]), supTable(2, false)]),
    ];
    const prods = products();
    const pTable = (withCol: boolean, filter: boolean) => table('p', 60, 54, [{ key: 'product_name', w: 110 }, { key: 'price', w: 60 }, ...(withCol ? [{ key: 'in_stock', w: 80 }] : [])],
        prods.map(p => ({ id: `p${p.product_id}`, values: { ...p, in_stock: 1 }, look: (filter ? (p.category === 'Electronics' ? KEEP : GONE) : PLAIN) as Look, cells: withCol ? { in_stock: C.green } : undefined })), { title: 'products', rowH: 20 });
    const alter: Frame[] = [
        frame('ALTER TABLE changes a table that already holds data. products has 7 rows.', [sqlBlock(['ALTER TABLE products ADD COLUMN in_stock INTEGER', '  NOT NULL DEFAULT 1;']), pTable(false, false)]),
        frame('ADD COLUMN adds in_stock to every existing row at once, each filled with the default, 1. CREATE and ALTER change the structure (DDL), not the rows themselves.', [sqlBlock(['ALTER TABLE products ADD COLUMN in_stock INTEGER', '  NOT NULL DEFAULT 1;']), pTable(true, false)]),
        frame(`A SELECT afterwards shows the new column like any other: ${inStockRows().map(([n]) => n).join(' and ')} in Electronics, both in stock.`, [sqlBlock(["SELECT product_name, price, in_stock FROM products", "WHERE category = 'Electronics';"]), pTable(true, true)]),
    ];
    return { title: 'CREATE TABLE sets the shape; ALTER TABLE changes it later', variants: [{ label: 'CREATE TABLE', frames: create }, { label: 'ALTER TABLE', frames: alter }] };
};

// ============ sql6-t2 · Constraints ============

const subscribersRows = () => [['priya@mail.com', 'pro'], ['tom@mail.com', 'free']];

const constraints = (): AnimationSpec => {
    const stored = subscribersRows();
    const gate = (state: 'idle' | 'ok' | 'skip' | 'fail', rule: string) => {
        const color = state === 'ok' ? C.green : state === 'skip' ? C.amber : state === 'fail' ? C.red : C.violet;
        return [
            box('gate', 150, 74, 100, 70, `rules\n${rule}`, color, { size: 10 }),
            text('gate-r', 200, 160, state === 'ok' ? 'passes ✓' : state === 'skip' ? 'skipped quietly' : state === 'fail' ? 'refused ✗' : '', { size: 12, fill: color, weight: 800 }),
        ];
    };
    /** The row being written: passing through the gate, or bounced back below it. */
    const incoming = (value: string, at: 'pass' | 'bounce', color: string = C.cyan) => at === 'pass'
        ? [
            rect('row', 8, 98, 132, 22, { rx: 6, fill: tint(color, 0.3), stroke: color, sw: 1.5, text: value, size: 9, weight: 700, mono: true }),
            arrow('in', 140, 109, 148, 109, { stroke: C.green, sw: 2 }),
            arrow('out', 252, 109, 260, 100, { stroke: C.green, sw: 2 }),
        ]
        : [rect('row', 8, 190, 132, 22, { rx: 6, fill: tint(color, 0.3), stroke: color, sw: 1.5, text: value, size: 9, weight: 700, mono: true })];
    const subs = (n: number) => table('subs', 262, 64, [{ key: 'email', w: 96 }, { key: 'plan', w: 40 }], stored.slice(0, n).map(([e, p]) => ({ id: e as string, values: { email: (e as string).replace('@mail.com', '@…'), plan: p }, look: KEEP })), { title: 'subscribers', rowH: 20, size: 10 });
    const q = (line: string) => sqlBlock([line]);
    const frames: Frame[] = [
        frame('subscribers: email is the PRIMARY KEY (unique, never NULL), and a CHECK allows only plan = \'free\' or \'pro\'. Every INSERT is checked against every rule.', [q("email PRIMARY KEY, plan CHECK (plan IN ('free', 'pro'))"), gate('idle', 'PK + CHECK'), subs(0)]),
        frame("('priya@mail.com', 'pro'): a new email, an allowed plan. It passes, and is stored.", [q("INSERT INTO subscribers VALUES ('priya@…', 'pro');"), incoming("priya@… · pro", 'pass'), gate('ok', 'PK + CHECK'), subs(1)]),
        frame("('tom@mail.com', 'free'): passes too.", [q("INSERT INTO subscribers VALUES ('tom@…', 'free');"), incoming("tom@… · free", 'pass'), gate('ok', 'PK + CHECK'), subs(2)]),
        frame("('tom@mail.com', 'pro') breaks the primary key: that email already exists. ON CONFLICT (email) DO NOTHING says: skip it quietly instead of failing. Tom stays on 'free'.", [sqlBlock(["INSERT … VALUES ('tom@…', 'pro')", 'ON CONFLICT (email) DO NOTHING;']), incoming("tom@… · pro", 'bounce', C.amber), gate('skip', 'PK clash'), subs(2)]),
        frame('Elsewhere: an order for customer 99, who does not exist, breaks the FOREIGN KEY on orders.customer_id. Refused with an error — nothing is changed.', [q('INSERT INTO orders VALUES (111, 99, …);'), incoming('order 111 · customer 99', 'bounce', C.red), gate('fail', 'FOREIGN KEY'), subs(2)]),
        frame('And a department with dept_id 1, which is taken, breaks the PRIMARY KEY on departments. Refused. The rules keep bad data out at the door, not after the fact.', [q("INSERT INTO departments VALUES (1, 'Legal', 'York');"), incoming("dept 1 · Legal", 'bounce', C.red), gate('fail', 'PRIMARY KEY'), subs(2)]),
    ];
    return { title: 'Constraints check every write, and refuse the ones that break a rule', variants: [{ label: 'Writes at the gate', frames }] };
};

// ============ sql6-t3 · INSERT, UPDATE and DELETE ============

const leedsAfterInsert = () => [...customers(), { customer_id: 7, name: 'Ravi', city: 'Leeds' } as Row].filter(c => c.city === 'Leeds').map(c => [c.customer_id, c.name, c.city]);
const raisedDept2 = () => employees().filter(e => e.dept_id === 2).sort((a, b) => compare(a.name, b.name)).map(e => [e.name, (e.salary as number) + 5000]);
const afterDelete = () => customers().filter(c => c.customer_id !== 6).map(c => [c.customer_id, c.name]);

const writes = (): AnimationSpec => {
    const emp = employees();
    const empTable = (raised: boolean, look: (r: Row) => Look) => table('emp', 60, 60, [{ key: 'name', w: 70 }, { key: 'dept_id', w: 70 }, { key: 'salary', w: 80 }],
        emp.map(r => ({ id: `e${r.emp_id}`, values: { ...r, salary: raised && r.dept_id === 2 ? (r.salary as number) + 5000 : r.salary }, look: look(r), cells: raised && r.dept_id === 2 ? { salary: C.green } : undefined })), { title: 'employees' });
    const isD2 = (r: Row) => r.dept_id === 2;
    const update: Frame[] = [
        frame('Safe habit: run the WHERE as a SELECT first and look at the rows it picks. Here: Dara and Eli.', [sqlBlock(['SELECT * FROM employees WHERE dept_id = 2;'], 4, C.green), empTable(false, r => (isD2(r) ? FOCUS : PLAIN))]),
        frame('Then turn it into the UPDATE. SET salary = salary + 5000 uses each row\'s OLD value to work out the new one.', [sqlBlock(['UPDATE employees SET salary = salary + 5000', 'WHERE dept_id = 2;']), empTable(false, r => (isD2(r) ? FOCUS : PLAIN))]),
        frame(`Only the matching rows change: ${raisedDept2().map(([n, s]) => `${n} ${s}`).join(', ')}. Without the WHERE, every row in the table would get the raise.`, [sqlBlock(['UPDATE employees SET salary = salary + 5000', 'WHERE dept_id = 2;']), empTable(true, r => (isD2(r) ? KEEP : PLAIN))]),
    ];
    const cust = customers();
    const custTable = (look: (r: Row) => Look, keep: (r: Row) => boolean = () => true, extra: Row[] = []) => table('cu', 80, 60, [{ key: 'customer_id', w: 96 }, { key: 'name', w: 70 }, { key: 'city', w: 80 }],
        [...cust.filter(keep), ...extra].map(r => ({ id: `c${r.customer_id}`, values: r, look: look(r) })), { title: 'customers' });
    const del: Frame[] = [
        frame('DELETE removes the rows its WHERE matches. Tom signed up twice; customer 6 is the duplicate and has no orders.', [sqlBlock(['DELETE FROM customers WHERE customer_id = 6;']), custTable(r => (r.customer_id === 6 ? DROP : PLAIN))]),
        frame('The row is gone. Because no order points at customer 6, the foreign key allows it; deleting Priya (customer 1) would be refused while her orders exist.', [sqlBlock(['DELETE FROM customers WHERE customer_id = 6;']), custTable(() => PLAIN, r => r.customer_id !== 6)]),
    ];
    const ravi = { customer_id: 7, name: 'Ravi', city: 'Leeds' } as Row;
    const ins: Frame[] = [
        frame('INSERT adds a new row. List the columns, so it is clear which value goes where. The constraints are checked first.', [sqlBlock(['INSERT INTO customers (customer_id, name, email, city…)', "VALUES (7, 'Ravi', 'ravi@mail.com', 'Leeds', …);"]), custTable(() => PLAIN)]),
        frame(`Ravi is customer 7. In Leeds there are now: ${leedsAfterInsert().map(([, n]) => n).join(', ')}.`, [sqlBlock(['INSERT INTO customers (customer_id, name, email, city…)', "VALUES (7, 'Ravi', 'ravi@mail.com', 'Leeds', …);"]), custTable(r => (r.city === 'Leeds' ? (r.customer_id === 7 ? KEEP : FOCUS) : GONE), () => true, [ravi])]),
    ];
    return { title: 'INSERT adds rows, UPDATE changes them, DELETE removes them', variants: [{ label: 'UPDATE', frames: update }, { label: 'DELETE', frames: del }, { label: 'INSERT', frames: ins }] };
};

// ============ sql6-t4 · Transactions ============

const gusAfterCommit = () => employees().filter(e => e.name === 'Gus').map(e => [e.name, 4, (e.salary as number) + 2000]);

const transactions = (): AnimationSpec => {
    const gus = employees().find(e => e.name === 'Gus')!;
    const steps = ['BEGIN', 'UPDATE dept_id', 'UPDATE salary', 'COMMIT'];
    const chips = (on: number, labels = steps, color: string = C.green) => labels.map((s, i) => rect(`st${i}`, 8 + i * 97, 6, 92, 24, {
        rx: 6, fill: tint(i === on ? C.amber : i < on ? color : C.grey, i === on ? 0.5 : i < on ? 0.25 : 0.08), stroke: i === on ? C.amber : C.faint, sw: 1.5, text: s, size: 10, weight: 700, mono: true,
    }));
    const panel = (id: string, x: number, title: string, dept: SqlCell, salary: SqlCell, pending: boolean) => [
        label(`${id}-t`, x, 56, title, C.grey, { size: 11, mono: false }),
        table(id, x, 66, [{ key: 'name', w: 56 }, { key: 'dept_id', w: 60 }, { key: 'salary', w: 60 }], [{ id: 'gus', values: { name: 'Gus', dept_id: dept, salary }, look: pending ? FOCUS : PLAIN }], { rowH: 22 }),
    ];
    const [[, newDept, newSalary]] = gusAfterCommit();
    const commit: Frame[] = [
        frame('BEGIN opens a transaction: the following statements become one all-or-nothing unit.', [chips(0), panel('me', 10, 'what you see', gus.dept_id, gus.salary, false), panel('db', 210, 'what everyone else sees', gus.dept_id, gus.salary, false)]),
        frame('Move Gus into HR. You can see the change, but it is not permanent yet, and other sessions still see the old row.', [chips(1), panel('me', 10, 'what you see', newDept, gus.salary, true), panel('db', 210, 'what everyone else sees', gus.dept_id, gus.salary, false)]),
        frame('Give him a raise. Two pending changes now — a crash at this moment would undo both.', [chips(2), panel('me', 10, 'what you see', newDept, newSalary, true), panel('db', 210, 'what everyone else sees', gus.dept_id, gus.salary, false)]),
        frame('COMMIT makes both changes permanent together (Atomic), and once committed they survive a crash (Durable).', [chips(3), panel('me', 10, 'what you see', newDept, newSalary, false), panel('db', 210, 'what everyone else sees', newDept, newSalary, false), label('acid', 10, 170, 'Atomic · Consistent · Isolated · Durable', C.green, { size: 12 })]),
    ];
    const items = orderItems().length;
    const rb = ['BEGIN', 'DELETE items', 'ROLLBACK', 'COUNT(*)'];
    const pile = (n: number, color: string) => Array.from({ length: items }, (_, i) => rect(`it${i}`, 60 + (i % 7) * 40, 80 + Math.floor(i / 7) * 34, 32, 26, {
        rx: 5, fill: tint(color, i < n ? 0.35 : 0.04), stroke: i < n ? color : C.faint, sw: 1.5, text: i < n ? String(i + 1) : '', size: 10, weight: 700, mono: true,
    }));
    const count = (n: number, color: string) => label('cnt', 200, 170, `order_items: ${n} rows`, color, { size: 14, anchor: 'middle' });
    const rollback: Frame[] = [
        frame(`BEGIN, then look: order_items has ${items} rows.`, [chips(0, rb, C.cyan), pile(items, C.blue), count(items, C.ink)]),
        frame('DELETE FROM order_items — no WHERE, so every row goes. Inside the transaction the table now looks empty.', [chips(1, rb, C.cyan), pile(0, C.red), count(0, C.red)]),
        frame('ROLLBACK throws away everything since BEGIN. All the rows are back, exactly as they were.', [chips(2, rb, C.cyan), pile(items, C.green), count(items, C.green)]),
        frame(`SELECT COUNT(*) confirms it: ${items}. A transaction is your undo button — as long as you have not committed.`, [chips(3, rb, C.cyan), pile(items, C.blue), count(items, C.green)]),
    ];
    return { title: 'A transaction is all or nothing: COMMIT keeps it, ROLLBACK undoes it', variants: [{ label: 'COMMIT', frames: commit }, { label: 'ROLLBACK', frames: rollback }] };
};

// ============ sql6-t5 · Normalisation ============

const flatPriya = () => {
    const priya = customers().find(c => c.customer_id === 1)!;
    return orders().filter(o => o.customer_id === 1).flatMap(o => orderItems().filter(i => i.order_id === o.order_id).map(i => {
        const p = products().find(x => x.product_id === i.product_id)!;
        return [o.order_id, priya.name, priya.email, p.product_name, p.price, i.quantity];
    })).sort((a, b) => compare(a[0], b[0]) || compare(a[3], b[3]));
};

const normalisation = (): AnimationSpec => {
    const flat = flatPriya();
    const cols: Column[] = [{ key: 'order_id', w: 60 }, { key: 'email', w: 108 }, { key: 'product', w: 86 }, { key: 'price', w: 44 }, { key: 'qty', w: 34 }];
    const flatTable = (look: (k: number) => Look, emailColor?: string) => table('flat', 30, 40, cols,
        flat.map(([id, , email, prod, price, qty], k) => ({ id: `f${k}`, values: { order_id: id, email, product: prod, price, qty }, look: look(k), cells: emailColor ? { email: emailColor } : undefined })), { title: 'one wide table: Priya\'s purchases', rowH: 18, size: 10 });
    const small = (id: string, x: number, y: number, title: string, colsOf: Column[], rows: Record<string, SqlCell>[], color: string) =>
        table(id, x, y, colsOf, rows.map((values, k) => ({ id: `${id}${k}`, values, look: [color, 0.25] as Look })), { title, rowH: 16, size: 9, titleColor: color });
    const prodRows = [...new Map(flat.map(r => [r[3], { product: r[3], price: r[4] }])).values()];
    const frames: Frame[] = [
        frame('Imagine storing everything in one wide table: one row per item Priya bought, with her email and the product\'s price copied onto each.', [flatTable(() => PLAIN)]),
        frame(`Priya's email is stored ${flat.length} times. Changing it means ${flat.length} updates — miss one and the table contradicts itself.`, [flatTable(() => FOCUS, C.amber)]),
        frame('The same goes for prices: Headphones\' price is copied on every line that sold them. Each fact should live in exactly one place.', [flatTable(k => (flat[k][3] === 'Headphones' ? FOCUS : PLAIN))]),
        frame('Normalised: customer facts in customers, product facts in products, and order_items keeps only the keys and the quantity. Joins put the wide view back together when you need it.', [
            small('nc', 8, 44, 'customers', [{ key: 'name', w: 44 }, { key: 'email', w: 104 }], [{ name: 'Priya', email: flat[0][2] }], C.cyan),
            small('np', 8, 104, 'products', [{ key: 'product', w: 80 }, { key: 'price', w: 40 }], prodRows, C.violet),
            small('ni', 220, 44, 'order_items', [{ key: 'order_id', w: 60 }, { key: 'product', w: 80 }, { key: 'qty', w: 34 }], flat.map(r => ({ order_id: r[0], product: r[3], qty: r[5] })), C.green),
        ]),
    ];
    return { title: 'Normalisation: store each fact once', variants: [{ label: 'One wide table vs four', frames }] };
};

// ============ sql6-t6 · Views ============

const viewTotals = () => customers().map(c => [c.name, sum(orders().filter(o => o.customer_id === c.customer_id).map(o => o.amount))])
    .filter(([, t]) => (t as number) > 50).sort((a, b) => (b[1] as number) - (a[1] as number));

const views = (): AnimationSpec => {
    const cust = customers();
    const totalsWith = (extra: number) => cust.map(c => ({ c, t: sum(orders().filter(o => o.customer_id === c.customer_id).map(o => o.amount)) + (c.customer_id === 4 ? extra : 0) }));
    const viewBox = (on: boolean) => [
        rect('view', 8, 60, 150, 96, { rx: 10, fill: tint(C.violet, on ? 0.2 : 0.08), stroke: C.violet, sw: 2, dash: '6 4' }),
        text('view-t', 83, 76, 'VIEW customer_totals', { size: 10, fill: C.violet, weight: 800, mono: true }),
        text('view-q', 83, 112, 'a saved query:\ncustomers LEFT JOIN orders\nGROUP BY customer', { size: 9, fill: C.ink, mono: true }),
        text('view-n', 83, 146, 'stores no rows', { size: 10, fill: C.grey }),
    ];
    const res = (extra: number, filterOver50: boolean, hot = false) => table('vt', 196, 60, [{ key: 'name', w: 70 }, { key: 'total_spent', w: 110 }],
        totalsWith(extra).filter(({ t }) => !filterOver50 || t > 50).sort((a, b) => b.t - a.t).map(({ c, t }) => ({ id: `c${c.customer_id}`, values: { name: c.name, total_spent: t }, look: (hot && c.customer_id === 4 ? KEEP : PLAIN) as Look })), { title: 'reading the view', rowH: 19 });
    const frames: Frame[] = [
        frame('CREATE VIEW saves a query under a name. It stores no data of its own — only the query text.', [sqlBlock(['CREATE VIEW customer_totals AS SELECT … ;']), viewBox(true)]),
        frame(`SELECT from the view runs the saved query on the live tables, then applies your WHERE: ${viewTotals().map(([n, t]) => `${n} ${t}`).join(', ')}.`, [sqlBlock(['SELECT name, total_spent FROM customer_totals', 'WHERE total_spent > 50;']), viewBox(false), res(0, true)]),
        frame('Now a new order arrives for Omar: £90.', [sqlBlock(['INSERT INTO orders VALUES (111, 4, …, 90, …);']), viewBox(false),
            rect('new', 196, 120, 180, 26, { rx: 6, fill: tint(C.amber, 0.35), stroke: C.amber, sw: 1.5, text: 'orders + (111, Omar, £90)', size: 10, weight: 700, mono: true })]),
        frame('Read the view again: Omar\'s total is already 90, because the query runs every time. A materialised view would still show his old total until it is refreshed.', [sqlBlock(['SELECT name, total_spent FROM customer_totals;']), viewBox(false), res(90, false, true)]),
    ];
    return { title: 'A view is a saved query: always current, stores nothing', variants: [{ label: 'A live view', frames }] };
};

// ============ sql6-t7 · DELETE vs TRUNCATE vs DROP ============

const itemsLeft = () => [[orderItems().filter(i => i.order_id !== 110).length]];
const tablesAfterDrop = () => ['customers', 'departments', 'employees', 'orders', 'products'].map(n => [n]);

const deleteTruncateDrop = (): AnimationSpec => {
    const items = orderItems();
    const cabinet = (keep: (i: Row) => boolean, removing: (i: Row) => boolean, exists = true) => [
        rect('cab', 40, 52, 300, 128, { rx: 10, fill: exists ? tint(C.blue, 0.06) : 'none', stroke: exists ? C.blue : C.faint, sw: 2, dash: exists ? undefined : '5 4', opacity: exists ? 1 : 0.4 }),
        text('cab-t', 190, 68, exists ? 'order_items (the table: its columns, keys, indexes)' : 'order_items no longer exists', { size: 10, fill: exists ? C.blue : C.red, weight: 700 }),
        ...items.map((r, i) => {
            const shown = keep(r);
            const gone = removing(r);
            return rect(`i${i}`, 54 + (i % 7) * 40, 82 + Math.floor(i / 7) * 42, 34, 32, {
                rx: 5, fill: tint(gone ? C.red : C.blue, shown ? 0.35 : 0.02), stroke: shown ? (gone ? C.red : C.blue) : C.faint, sw: 1.5,
                text: shown ? String(r.order_id) : '', size: 9, weight: 700, mono: true, opacity: exists ? 1 : 0,
            });
        }),
    ];
    const is110 = (r: Row) => r.order_id === 110;
    const [[left]] = itemsLeft();
    const frames: Frame[] = [
        frame(`order_items: ${items.length} rows in a table, like files in a cabinet.`, [cabinet(() => true, () => false)]),
        frame('DELETE … WHERE removes only matching rows, one by one. It can be rolled back. Order 110 has 2 items.', [sqlBlock(['DELETE FROM order_items WHERE order_id = 110;']), cabinet(() => true, is110)]),
        frame(`${left} rows left. DELETE is DML: it changes data, not structure.`, [sqlBlock(['DELETE FROM order_items WHERE order_id = 110;']), cabinet(r => !is110(r), () => false)]),
        frame('TRUNCATE empties the whole table at once — very fast, no WHERE — but the empty table, with its columns and indexes, stays. (SQLite has no TRUNCATE; DELETE without WHERE does the same job.)', [sqlBlock(['TRUNCATE TABLE order_items;']), cabinet(() => false, () => false)]),
        frame(`DROP removes the table itself — rows, structure and all. Querying it now is an error. The database's own list of tables: ${tablesAfterDrop().map(([n]) => n).join(', ')}.`, [sqlBlock(['DROP TABLE order_items;'], 4, C.red), cabinet(() => false, () => false, false)]),
    ];
    return { title: 'DELETE removes rows, TRUNCATE empties, DROP removes the table', variants: [{ label: 'Three ways to remove', frames }] };
};

// ============ sql7-t1 · Indexes: B-trees ============

/** The B-tree the lesson's index would build: sorted dates in leaves, one separator level above. */
const btree = () => {
    const sorted = [...orders()].sort((a, b) => compare(a.order_date, b.order_date));
    const leaves = [sorted.slice(0, 3), sorted.slice(3, 7), sorted.slice(7)];
    const separators = [leaves[1][0].order_date, leaves[2][0].order_date];
    return { leaves, separators };
};

const indexes = (): AnimationSpec => {
    const ord = orders();
    const target = '2024-02-12';
    const heap = (look: (r: Row) => Look) => table('heap', 262, 40, [{ key: 'order_id', w: 60 }, { key: 'date', w: 66 }],
        ord.map(r => ({ id: `o${r.order_id}`, values: { order_id: r.order_id, date: short(r.order_date) }, look: look(r) })), { title: 'orders (table)', rowH: 18, size: 10 });
    const { leaves, separators } = btree();
    const leafX = [8, 88, 180];
    const leafW = [74, 86, 74];
    const tree = (on: 'none' | 'root' | 'leaf' | 'all', hitLeaf = 1) => [
        box('root', 60, 50, 140, 30, `${short(separators[0])} | ${short(separators[1])}`, on === 'root' ? C.amber : C.violet, { size: 11, ...(on === 'root' ? { fill: tint(C.amber, 0.45), sw: 3 } : {}) }),
        text('root-t', 130, 42, 'root', { size: 10, fill: C.grey }),
        ...leaves.flatMap((leaf, k) => {
            const on2 = (on === 'leaf' || on === 'all') && k === hitLeaf;
            return [
                line(`rl${k}`, 130 + (k - 1) * 50, 80, leafX[k] + leafW[k] / 2, 112, { stroke: on2 || (on === 'root' && k === hitLeaf) ? C.amber : C.dim, sw: 2 }),
                rect(`leaf${k}`, leafX[k], 112, leafW[k], 18 * leaf.length + 8, { rx: 7, fill: tint(on2 ? C.amber : C.cyan, on2 ? 0.25 : 0.1), stroke: on2 ? C.amber : C.cyan, sw: 1.5 }),
                ...leaf.map((r, j) => text(`lk${k}-${j}`, leafX[k] + leafW[k] / 2, 124 + j * 18, short(r.order_date), { size: 10, fill: on2 && r.order_date === target ? C.amber : C.ink, weight: 700, mono: true })),
            ];
        }),
        text('leaf-t', 130, 214, 'leaves: every date, sorted, each pointing at its row', { size: 9, fill: C.grey }),
    ];
    const hitRow = ord.findIndex(r => r.order_date === target);
    // Down the gap between the leaves, under them, then up to the row: it never crosses a leaf.
    const pointer = path('ptr', [[leafX[1] + leafW[1], 124 + 2 * 18], [177, 124 + 2 * 18], [177, 200], [257, 200], [257, rowMid(40, hitRow, 18)], [261, rowMid(40, hitRow, 18)]], { stroke: C.amber, sw: 2, arrow: true });
    const q = sqlBlock([`SELECT * FROM orders WHERE order_date = '${target}';`]);
    const frames: Frame[] = [
        frame('No index on order_date: the plan says SCAN orders. The database reads every row and checks its date.', [q, heap(() => FOCUS), label('read', 20, 100, `read all ${ord.length} rows`, C.red, { size: 13 })]),
        frame('CREATE INDEX builds a separate, sorted copy of the dates, as a shallow tree. The leaves hold every date in order; the root holds signposts.', [q, heap(() => PLAIN), tree('none')]),
        frame(`SEARCH: start at the root. ${short(target)} is between ${short(separators[0])} and ${short(separators[1])}, so take the middle branch.`, [q, heap(() => PLAIN), tree('root')]),
        frame(`In that leaf, find ${short(target)} — it points straight at its row: order 106.`, [q, heap(r => (r.order_date === target ? KEEP : PLAIN)), tree('leaf'), pointer]),
        frame('Three steps instead of reading the whole table. For 100 million rows a B-tree is still only 3–4 levels deep. The cost: every INSERT, UPDATE and DELETE must update the index too.', [q, heap(r => (r.order_date === target ? KEEP : GONE)), tree('all'), pointer]),
    ];
    return { title: 'An index is a sorted copy you can search, instead of reading every row', variants: [{ label: 'SCAN vs SEARCH', frames }] };
};

// ============ sql7-t2 · Reading a query plan ============

const queryPlan = (): AnimationSpec => {
    const cust = customers();
    const ord = orders();
    const leeds = cust.filter(c => c.city === 'Leeds').map(c => c.customer_id);
    const cTable = (look: (r: Row) => Look, x: number) => table('c', x, 66, [{ key: 'id', w: 30 }, { key: 'name', w: 50 }, { key: 'city', w: 64 }], cust.map(r => ({ id: `c${r.customer_id}`, values: { id: r.customer_id, name: r.name, city: r.city }, look: look(r) })), { title: 'customers c', rowH: 17, size: 10 });
    const oTable = (look: (r: Row) => Look, x: number) => table('o', x, 66, [{ key: 'order_id', w: 60 }, { key: 'cust', w: 40 }], ord.map(r => ({ id: `o${r.order_id}`, values: { order_id: r.order_id, cust: r.customer_id }, look: look(r) })), { title: 'orders o', rowH: 15, size: 10 });
    const plan = (lines: [string, string][]) => lines.map(([value, color], i) => label(`pl${i}`, 230, 200 + i * 16, `plan: ${value}`, color, { size: 11 }));
    const count = (value: string, color: string) => label('ops', 230, 222, value, color, { size: 11 });
    const q = sqlBlock(['SELECT c.name, o.amount FROM customers c', "JOIN orders o ON … WHERE c.city = 'Leeds';"]);
    const frames: Frame[] = [
        frame('EXPLAIN QUERY PLAN shows how the database will run a query. Each plan line is one table, in the order it is read: the first is the outer loop.', [q, cTable(() => PLAIN, 230), oTable(() => PLAIN, 20)]),
        frame('Before indexing orders.customer_id: SCAN o reads all 10 orders, and for each one SEARCHes customers by its primary key, then checks the city.', [q, oTable(() => FOCUS, 20), cTable(r => (leeds.includes(r.customer_id) ? KEEP : PLAIN), 230), plan([['SCAN o', C.red]]), count('10 scanned + 10 lookups', C.red)]),
        frame('After CREATE INDEX on orders(customer_id), the plan flips: SCAN c (only 6 customers, 2 in Leeds), then SEARCH o USING INDEX for each Leeds customer.', [q, cTable(r => (leeds.includes(r.customer_id) ? KEEP : GONE), 230), oTable(r => (leeds.includes(r.customer_id) ? KEEP : GONE), 20), plan([['SCAN c', C.amber]]), count('6 scanned + 2 searches', C.green)]),
        frame('Read plans for three words: SCAN (a whole table — fine if small, a red flag if big), SEARCH … USING INDEX (good), and TEMP B-TREE (a sort or grouping — costly on big data).', [q, cTable(() => PLAIN, 230), oTable(() => PLAIN, 20), label('pl0', 230, 200, 'SCAN · SEARCH · TEMP', C.ink, { size: 11 })]),
    ];
    return { title: 'EXPLAIN shows the plan: which table is scanned and which is searched', variants: [{ label: 'A join, before and after an index', frames }] };
};

// ============ sql7-t3 · Sargable filters and composite indexes ============

const sargable = (): AnimationSpec => {
    const byDate = [...orders()].sort((a, b) => compare(a.order_date, b.order_date));
    const feb = (r: Row) => (r.order_date as string) >= '2024-02-01' && (r.order_date as string) < '2024-03-01';
    const entries = (look: (r: Row) => Look, show: (r: Row) => string) => byDate.map((r, i) => rect(`d${r.order_id}`, 30 + (i % 5) * 70, 72 + Math.floor(i / 5) * 40, 64, 30, {
        rx: 6, fill: tint(look(r)[0], look(r)[1]), stroke: look(r)[1] <= 0.05 ? C.faint : look(r)[0], sw: 1.5, text: show(r), size: 10, weight: 700, mono: true,
    }));
    const fn: Frame[] = [
        frame('An index on order_date keeps the dates sorted. Here they are, in index order.', [sqlBlock(['CREATE INDEX idx_orders_date ON orders(order_date);']), entries(() => PLAIN, r => short(r.order_date))]),
        frame("WHERE strftime('%Y-%m', order_date) = '2024-02': the index is sorted by the raw date, not by strftime(date). The database must work out the function for EVERY entry: SCAN.", [sqlBlock(["WHERE strftime('%Y-%m', order_date) = '2024-02'"], 4, C.red), entries(() => FOCUS, r => (r.order_date as string).slice(0, 7))]),
        frame("Rewrite it so the bare column is compared with values: a range. Now the database jumps to the first February date and reads until March: SEARCH.", [sqlBlock(["WHERE order_date >= '2024-02-01'", "  AND order_date < '2024-03-01'"], 4, C.green), entries(r => (feb(r) ? KEEP : GONE), r => short(r.order_date))]),
    ];
    const comp = [...orders()].sort((a, b) => compare(a.customer_id, b.customer_id) || compare(a.order_date, b.order_date));
    const compEntries = (look: (r: Row) => Look) => comp.map((r, i) => rect(`k${r.order_id}`, 20 + (i % 5) * 74, 76 + Math.floor(i / 5) * 40, 68, 30, {
        rx: 6, fill: tint(look(r)[0], look(r)[1]), stroke: look(r)[1] <= 0.05 ? C.faint : look(r)[0], sw: 1.5, text: `${r.customer_id} · ${short(r.order_date)}`, size: 10, weight: 700, mono: true,
    }));
    const both = (r: Row) => r.customer_id === 1 && (r.order_date as string) >= '2024-02-01';
    const dateOnly = (r: Row) => (r.order_date as string) >= '2024-02-01';
    const composite: Frame[] = [
        frame('A composite index on (customer_id, order_date) is sorted by customer, then by date within each customer — like a phone book: surname, then first name.', [sqlBlock(['CREATE INDEX … ON orders(customer_id, order_date);']), compEntries(r => [[C.cyan, C.violet, C.pink, C.amber][[1, 2, 3, 5].indexOf(r.customer_id as number)], 0.25])]),
        frame("customer_id = 1 AND order_date >= '2024-02-01': the leftmost column is fixed, so the matches sit side by side — one jump, then read: SEARCH.", [sqlBlock(["WHERE customer_id = 1 AND order_date >= '2024-02-01'"], 4, C.green), compEntries(r => (both(r) ? KEEP : GONE))]),
        frame("order_date >= '2024-02-01' alone skips the leftmost column. The matching dates are scattered across every customer, so the index can't be searched: SCAN. That is the leftmost-prefix rule.", [sqlBlock(["WHERE order_date >= '2024-02-01'"], 4, C.red), compEntries(r => (dateOnly(r) ? FOCUS : GONE))]),
    ];
    return { title: 'Index-friendly filters: keep the column bare, and use the leftmost column', variants: [{ label: 'Functions block indexes', frames: fn }, { label: 'Composite index', frames: composite }] };
};

// ============ sql7-t4 · How a join runs ============

const joinMethods = (): AnimationSpec => {
    const items = orderItems().slice(0, 6);
    const prods = products();
    const outer = (on: number, done: number) => items.map((r, i) => rect(`oi${i}`, 20, 50 + i * 28, 70, 22, {
        rx: 5, fill: tint(i === on ? C.amber : i < done ? C.green : C.blue, i === on ? 0.5 : 0.2), stroke: i === on ? C.amber : C.faint, sw: 1.5, text: `item p${r.product_id}`, size: 10, weight: 700, mono: true,
    }));
    const inner = (hit: number | null) => prods.map((p, j) => rect(`p${p.product_id}`, 250, 50 + j * 24, 120, 20, {
        rx: 5, fill: tint(p.product_id === hit ? C.green : C.violet, p.product_id === hit ? 0.5 : 0.15), stroke: p.product_id === hit ? C.green : C.faint, sw: 1.5, text: `${p.product_id} ${p.product_name}`, size: 10, weight: 700, mono: true,
    }));
    const probe = (i: number) => arrow('probe', 92, 61 + i * 28, 248, 60 + (prods.findIndex(p => p.product_id === items[i].product_id)) * 24, { stroke: C.amber, sw: 2 });
    const nested: Frame[] = [
        frame('Nested loop: for each row of the outer table (order_items), look up its match in the inner table (products) — by index, so each lookup is a quick search.', [label('o-t', 20, 40, 'outer: order_items', C.grey, { size: 11 }), label('i-t', 250, 40, 'products (indexed)', C.grey, { size: 11 }), outer(-1, 0), inner(null)]),
        ...[0, 1, 2].map(i => frame(`Item ${i + 1} needs product ${items[i].product_id}: one index search finds it.`, [label('o-t', 20, 40, 'outer: order_items', C.grey, { size: 11 }), label('i-t', 250, 40, 'products (indexed)', C.grey, { size: 11 }), outer(i, i), inner(items[i].product_id as number), probe(i)], 2400)),
        frame('…and so on for every outer row: about N × log M work. Without an index on the inner side, every lookup would read the whole inner table: N × M.', [label('o-t', 20, 40, 'outer: order_items', C.grey, { size: 11 }), label('i-t', 250, 40, 'products (indexed)', C.grey, { size: 11 }), outer(-1, items.length), inner(null)]),
    ];
    const bucketOf = (id: number) => id % 3;
    const buckets = (lit_: number | null, match: SqlCell = null) => [0, 1, 2].map(b => [
        rect(`b${b}`, 160, 50 + b * 58, 220, 48, { rx: 8, fill: tint(b === lit_ ? C.amber : C.violet, b === lit_ ? 0.3 : 0.1), stroke: b === lit_ ? C.amber : C.violet, sw: 1.5 }),
        text(`bt${b}`, 170, 60 + b * 58, `bucket ${b} (id % 3 = ${b})`, { size: 9, fill: C.grey, anchor: 'start', mono: true }),
        ...prods.filter(p => bucketOf(p.product_id as number) === b).map((p, k) => {
            const hit = p.product_id === match;
            return rect(`hp${p.product_id}`, 168 + k * 50, 68 + b * 58, 44, 22, { rx: 5, fill: tint(hit ? C.green : C.violet, hit ? 0.55 : 0.3), stroke: hit ? C.green : C.violet, sw: hit ? 2 : 1, text: `p${p.product_id}`, size: 10, weight: 700, mono: true });
        }),
    ]);
    const probes = (on: number) => items.slice(0, 4).map((r, i) => rect(`pr${i}`, 14, 50 + i * 30, 110, 24, { rx: 5, fill: tint(i === on ? C.amber : C.blue, i === on ? 0.5 : 0.2), stroke: i === on ? C.amber : C.faint, sw: 1.5, text: `item p${r.product_id} → b${bucketOf(r.product_id as number)}`, size: 9, weight: 700, mono: true }));
    const hash: Frame[] = [
        frame('Hash join, step 1 (build): read the smaller table, products, into a hash table — each row goes into a bucket chosen from its product_id.', [buckets(null), label('h', 160, 40, 'hash table of products', C.violet, { size: 11 })]),
        frame('Step 2 (probe): stream the bigger table past it. Each order_items row works out its bucket and looks only there.', [buckets(bucketOf(items[0].product_id as number), items[0].product_id), probes(0), label('h', 160, 40, 'hash table of products', C.violet, { size: 11 })]),
        frame('One pass to build, one pass to probe: about N + M, with no index needed — but the hash table must fit in memory.', [buckets(bucketOf(items[2].product_id as number), items[2].product_id), probes(2), label('h', 160, 40, 'hash table of products', C.violet, { size: 11 })]),
    ];
    const sortedItems = [...items].sort((a, b) => compare(a.product_id, b.product_id));
    const zipL = (on: number) => sortedItems.map((r, i) => rect(`zl${i}`, 40, 50 + i * 28, 90, 22, { rx: 5, fill: tint(i === on ? C.amber : C.blue, i === on ? 0.5 : 0.2), stroke: i === on ? C.amber : C.faint, sw: 1.5, text: `item p${r.product_id}`, size: 10, weight: 700, mono: true }));
    const zipR = (on: number) => prods.map((p, j) => rect(`zr${j}`, 250, 50 + j * 24, 110, 20, { rx: 5, fill: tint(j === on ? C.amber : C.violet, j === on ? 0.5 : 0.15), stroke: j === on ? C.amber : C.faint, sw: 1.5, text: `${p.product_id} ${p.product_name}`, size: 9, weight: 700, mono: true }));
    const at = (k: number) => prods.findIndex(p => p.product_id === sortedItems[k].product_id);
    const merge: Frame[] = [
        frame('Merge join: both inputs sorted by product_id. Walk them side by side, like closing a zip.', [label('l', 40, 40, 'order_items, sorted', C.grey, { size: 11 }), label('r', 250, 40, 'products, sorted', C.grey, { size: 11 }), zipL(-1), zipR(-1)]),
        ...[0, 2, 4].map(k => frame(`Left is at product ${sortedItems[k].product_id}; move the right pointer forward until it reaches ${sortedItems[k].product_id}: a match. Neither pointer ever moves back.`, [label('l', 40, 40, 'order_items, sorted', C.grey, { size: 11 }), label('r', 250, 40, 'products, sorted', C.grey, { size: 11 }), zipL(k), zipR(at(k)),
            line('zip', 130, 61 + k * 28, 250, 60 + at(k) * 24, { stroke: C.amber, sw: 2 })], 2600)),
        frame('One pass over each input: about N + M — if they are already sorted (by an index, say). Otherwise each must be sorted first.', [label('l', 40, 40, 'order_items, sorted', C.grey, { size: 11 }), label('r', 250, 40, 'products, sorted', C.grey, { size: 11 }), zipL(-1), zipR(-1)]),
    ];
    return { title: 'Three ways a database runs a join', variants: [{ label: 'Nested loop', frames: nested }, { label: 'Hash join', frames: hash }, { label: 'Merge join', frames: merge }] };
};

// ============ sql8-t1 · How to answer any SQL interview question ============

const dataCheck = () => [[orders().length, new Set(orders().map(o => o.customer_id)).size, orders().filter(o => o.amount === null).length]];
const deliveredByCity = () => {
    const cities = new Map<string, number>();
    orders().filter(o => o.status === 'delivered').forEach(o => {
        const city = (customers().find(c => c.customer_id === o.customer_id)!.city as string | null) ?? 'unknown';
        cities.set(city, (cities.get(city) ?? 0) + (o.amount as number));
    });
    return [...cities.entries()].sort((a, b) => b[1] - a[1]);
};

const interviewMethod = (): AnimationSpec => {
    const steps = ['1 Clarify', '2 Data', '3 Plan', '4 Write', '5 Check'];
    const chips = (on: number) => steps.map((s, i) => rect(`s${i}`, 6 + i * 78, 6, 74, 24, {
        rx: 6, fill: tint(i === on ? C.amber : i < on ? C.green : C.grey, i === on ? 0.5 : i < on ? 0.22 : 0.08), stroke: i === on ? C.amber : C.faint, sw: 1.5, text: s, size: 9, weight: 700, mono: true,
    }));
    const note = (lines: string[], color: string = C.ink) => lines.map((v, i) => label(`n${i}`, 14, 56 + i * 22, v, i === 0 ? color : C.grey, { size: 12, mono: false }));
    const [[n, who, missing]] = dataCheck();
    const result = deliveredByCity();
    const delivered = orders().filter(o => o.status === 'delivered');
    const flow = (stage: number) => [
        box('f1', 14, 140, 82, 40, `orders\n${n} rows`, stage >= 1 ? C.cyan : C.grey, { size: 10 }),
        arrow('fa1', 98, 160, 116, 160, { stroke: C.grey }),
        box('f2', 118, 140, 82, 40, `delivered\n${delivered.length} rows`, stage >= 2 ? C.cyan : C.grey, { size: 10 }),
        arrow('fa2', 202, 160, 220, 160, { stroke: C.grey }),
        box('f3', 222, 140, 82, 40, '+ city\n(join)', stage >= 3 ? C.cyan : C.grey, { size: 10 }),
        arrow('fa3', 306, 160, 324, 160, { stroke: C.grey }),
        box('f4', 326, 140, 66, 40, 'per city', stage >= 4 ? C.green : C.grey, { size: 10 }),
    ];
    const answer = (stage: number) => stage >= 4 && result.map(([city, total], i) => label(`r${i}`, 326, 196 + i * 18, `${city} ${total}`, C.green, { size: 11 }));
    const frames: Frame[] = [
        frame('Question: "Which city brings in the most delivered revenue?" Step 1: say it back and ask — delivered only? Customers with no city? Ties?', [chips(0), note(['"Which city brings in the most delivered revenue?"', 'delivered only?  no city → drop or "unknown"?  ties?'], C.amber)]),
        frame(`Step 2: look at the data before writing the answer — ${n} orders, ${who} customers who ordered, ${missing} order with no amount. Know the grain: one orders row is one order.`, [chips(1), note(['SELECT COUNT(*), COUNT(DISTINCT customer_id),', `       … → ${n} · ${who} · ${missing}`]), flow(1)]),
        frame('Step 3: plan out loud — "first the delivered orders, then join each to its customer\'s city, then total per city, then sort."', [chips(2), note(['delivered → join city → group by city → sort']), flow(3)]),
        frame('Step 4: write it as small CTEs, one step each, running each one as you go.', [chips(3), note(['WITH delivered AS (…)', 'SELECT city, SUM(amount) … GROUP BY city']), flow(4), answer(4)]),
        frame(`Step 5: check a number by hand. London = Priya 275 + Lena 60 = ${result.find(([c]) => c === 'London')?.[1]}. Then say the edge cases and how your query handles them.`, [chips(4), note(['London: Priya 275 + Lena 60 = 335 ✓'], C.green), flow(4), answer(4)]),
    ];
    return { title: 'Five steps for any SQL question', variants: [{ label: 'The city question', frames }] };
};

export const phase678Animations: Record<string, () => AnimationSpec> = {
    'sql6-t1': createAlter,
    'sql6-t2': constraints,
    'sql6-t3': writes,
    'sql6-t4': transactions,
    'sql6-t5': normalisation,
    'sql6-t6': views,
    'sql6-t7': deleteTruncateDrop,
    'sql7-t1': indexes,
    'sql7-t2': queryPlan,
    'sql7-t3': sargable,
    'sql7-t4': joinMethods,
    'sql8-t1': interviewMethod,
};

export const phase678Checks: Record<string, () => { example: number; rows: ResultRows }[]> = {
    'sql6-t1': () => [{ example: 0, rows: suppliersRows() }, { example: 1, rows: inStockRows() }],
    'sql6-t2': () => [{ example: 0, rows: subscribersRows() }],
    'sql6-t3': () => [{ example: 0, rows: leedsAfterInsert() }, { example: 1, rows: raisedDept2() }, { example: 2, rows: afterDelete() }],
    'sql6-t4': () => [{ example: 0, rows: gusAfterCommit() }, { example: 1, rows: [[orderItems().length]] }],
    'sql6-t5': () => [{ example: 0, rows: flatPriya() }],
    'sql6-t6': () => [{ example: 0, rows: viewTotals() }, { example: 1, rows: [['Omar', 90]] }],
    'sql6-t7': () => [{ example: 0, rows: itemsLeft() }, { example: 1, rows: tablesAfterDrop() }],
    'sql8-t1': () => [{ example: 0, rows: dataCheck() }, { example: 1, rows: deliveredByCity() }],
};
