import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import { C, frame, line, rect, text, tint } from '../../components/learning/anim/kit';
import {
    DROP, FOCUS, GONE, KEEP, PLAIN, compare, customers, departments, employees, label, orderItems, orders, products, rowMid, sqlBlock, table,
    type Column, type Look, type ResultRows, type Row, type TRow,
} from './kit';
import type { SqlCell } from '../sqlPracticeDb';

// Phase 2 (summarising) and Phase 3 (joins). As in phase01.ts, the rows are
// the practice data and `phase23Checks` lets a test compare each animation's
// final rows with its lesson's worked example.

const round = (value: number, places: number) => Math.round(value * 10 ** places) / 10 ** places;
const sum = (values: SqlCell[]) => values.reduce<number>((s, v) => s + (typeof v === 'number' ? v : 0), 0);
const avg = (values: SqlCell[]) => {
    const known = values.filter((v): v is number => typeof v === 'number');
    return known.length ? sum(known) / known.length : null;
};
const groupBy = <T>(items: T[], key: (item: T) => SqlCell) => {
    const groups = new Map<SqlCell, T[]>();
    for (const item of items) groups.set(key(item), [...(groups.get(key(item)) ?? []), item]);
    return [...groups.entries()].sort((a, b) => compare(a[0], b[0]));
};
const GROUP_COLORS = [C.grey, C.cyan, C.violet, C.pink, C.amber, C.teal];
const empRow = (r: Row, look?: Look, cells?: Record<string, string>): TRow => ({ id: `e${r.emp_id}`, values: r, look, cells });
const ordRow = (r: Row, look?: Look, extra: Record<string, SqlCell | string> = {}, cells?: Record<string, string>): TRow => ({ id: `o${r.order_id}`, values: { ...r, ...extra }, look, cells });

/** Slots that stack groups with half a row of space between them. */
const groupedSlots = (groups: [SqlCell, Row[]][], id: (r: Row) => string) => {
    const slots: Record<string, number> = {};
    let at = 0;
    groups.forEach(([, members]) => {
        members.forEach(r => { slots[id(r)] = at++; });
        at += 0.5;
    });
    return slots;
};

// ============ sql2-t1 · Aggregate functions ============

const aggregateSummary = () => {
    const amounts = orders().map(r => r.amount);
    const total = sum(amounts);
    const known = amounts.filter(v => v !== null).length;
    return [[amounts.length, known, total, round(total / known, 2), round(total / amounts.length, 2)]];
};

const aggregates = (): AnimationSpec => {
    const ord = orders();
    const [[all, known, total, avgKnown, avgAll]] = aggregateSummary();
    const tbl = (look: (r: Row) => Look) => table('ord', 14, 40, [{ key: 'order_id', w: 70 }, { key: 'amount', w: 64 }], ord.map(r => ordRow(r, look(r))), { title: 'orders', rowH: 17, size: 10 });
    const out = (lines: [string, string, string][]) => lines.map(([name, value, color], i) => [
        label(`k${i}`, 182, 62 + i * 30, name, C.grey, { size: 12 }),
        label(`v${i}`, 392, 62 + i * 30, value, color, { size: 14, anchor: 'end' }),
    ]);
    const is106 = (r: Row) => r.amount === null;
    const frames: Frame[] = [
        frame('An aggregate turns many rows into one value. With no GROUP BY, the whole table (after WHERE) becomes one row.', [tbl(() => PLAIN)]),
        frame(`COUNT(*) counts rows, whatever is in them: ${all}.`, [tbl(() => KEEP), out([['COUNT(*)', String(all), C.green]])]),
        frame(`COUNT(amount) counts only rows where amount is not NULL: ${known}. Order 106 has no amount, so it is skipped.`, [tbl(r => (is106(r) ? DROP : KEEP)), out([['COUNT(*)', String(all), C.ink], ['COUNT(amount)', String(known), C.green]])]),
        frame(`SUM(amount) adds the ${known} known amounts: ${total}. AVG skips the NULL too, so it is ${total} ÷ ${known} = ${avgKnown} — not ÷ ${all}.`, [
            tbl(r => (is106(r) ? DROP : KEEP)), out([['COUNT(*)', String(all), C.ink], ['COUNT(amount)', String(known), C.ink], ['SUM(amount)', String(total), C.green], ['AVG(amount)', String(avgKnown), C.green]]),
        ]),
        frame(`If the question means "per order, counting the missing one as zero", divide by COUNT(*) yourself: ${total} ÷ ${all} = ${avgAll}. Same data, different question, different answer.`, [
            tbl(r => (is106(r) ? FOCUS : KEEP)), out([['COUNT(*)', String(all), C.ink], ['COUNT(amount)', String(known), C.ink], ['SUM(amount)', String(total), C.ink], ['AVG(amount)', String(avgKnown), C.ink], ['SUM ÷ COUNT(*)', String(avgAll), C.amber]]),
        ]),
    ];
    return { title: 'Aggregates: many rows in, one value out — and NULLs are skipped', variants: [{ label: 'COUNT, SUM, AVG', frames }] };
};

// ============ sql2-t2 · GROUP BY ============

const headcountByDept = () => groupBy(employees(), r => r.dept_id).map(([dept, members]) => [dept, members.length, avg(members.map(m => m.salary))]);

const groupByLesson = (): AnimationSpec => {
    const emp = employees();
    const groups = groupBy(emp, r => r.dept_id);
    const colorOf = (dept: SqlCell) => GROUP_COLORS[groups.findIndex(([d]) => d === dept)];
    const cols: Column[] = [{ key: 'name', w: 58 }, { key: 'dept_id', w: 60 }, { key: 'salary', w: 54 }];
    const slots = groupedSlots(groups, r => `e${r.emp_id}`);
    const src = (grouped: boolean) => table('emp', 6, 44, cols, emp.map(r => empRow(r, grouped ? [colorOf(r.dept_id), 0.3] : PLAIN)), { title: 'employees', slots: grouped ? slots : undefined, rowH: 18 });
    const result = headcountByDept();
    const res = table('res', 184, 44, [{ key: 'dept_id', w: 58 }, { key: 'headcount', w: 72 }, { key: 'avg_salary', w: 82 }],
        result.map(([dept, count, mean]) => ({ id: `g${dept}`, values: { dept_id: dept, headcount: count, avg_salary: mean }, look: [colorOf(dept), 0.35] as Look })), { title: 'result: one row per group', titleColor: C.green, rowH: 18 });
    const q = sqlBlock(['SELECT dept_id, COUNT(*), AVG(salary) … GROUP BY dept_id']);
    const frames: Frame[] = [
        frame('Eight employees, in no particular order.', [q, src(false)]),
        frame('GROUP BY dept_id puts rows with the same dept_id into one pile. All the NULLs (just Gus) share a pile of their own.', [q, src(true)]),
        frame('Each pile becomes ONE result row, and COUNT(*) and AVG(salary) are worked out separately for each pile: department 1 has 4 people averaging 78750.', [q, src(true), res]),
        frame('The golden rule: SELECT may only show grouped columns and aggregates. Department 1 has four names — the database cannot pick one for you. And HR has no employees, so no pile and no row.', [q, src(true), res,
            label('rule', 184, 160, 'name? ✗  4 names, 1 row', C.red, { size: 12 })]),
    ];
    return { title: 'GROUP BY: one pile per value, one result row per pile', variants: [{ label: 'Per department', frames }] };
};

// ============ sql2-t3 · HAVING ============

const deliveredTotals = () => groupBy(orders().filter(r => r.status === 'delivered'), r => r.customer_id).map(([c, members]) => [c, sum(members.map(m => m.amount))]);
const havingResult = () => deliveredTotals().filter(([, total]) => (total as number) >= 100);

const having = (): AnimationSpec => {
    const ord = orders();
    const delivered = ord.filter(r => r.status === 'delivered');
    const groups = groupBy(delivered, r => r.customer_id);
    const colorOf = (c: SqlCell) => GROUP_COLORS[1 + groups.findIndex(([g]) => g === c)];
    const cols: Column[] = [{ key: 'order_id', w: 60 }, { key: 'cust', w: 44 }, { key: 'amount', w: 54 }, { key: 'status', w: 74 }];
    const asCols = (r: Row) => ({ ...r, cust: r.customer_id });
    const y = 56;
    const opts = { title: 'orders', rowH: 16, size: 10 };
    const q = sqlBlock(["WHERE status = 'delivered' GROUP BY customer_id", 'HAVING SUM(amount) >= 100']);
    const all = (look: (r: Row) => Look) => table('ord', 6, y, cols, ord.map(r => ({ id: `o${r.order_id}`, values: asCols(r), look: look(r) })), opts);
    const slots = groupedSlots(groups, r => `o${r.order_id}`);
    const grouped = (failing: boolean) => table('ord', 6, y, cols, delivered.map(r => ({ id: `o${r.order_id}`, values: asCols(r), look: (failing && r.customer_id === 3 ? DROP : [colorOf(r.customer_id), 0.3]) as Look })), { ...opts, slots });
    const totals = deliveredTotals();
    const sums = (failing: boolean) => groups.map(([c, members], k) => {
        const first = slots[`o${members[0].order_id}`];
        const last = slots[`o${members[members.length - 1].order_id}`];
        const yMid = (rowMid(y, first, 16) + rowMid(y, last, 16)) / 2;
        const total = totals[k][1] as number;
        const ok = total >= 100;
        return label(`sum${c}`, 248, yMid, `cust ${c}: SUM ${total}${failing ? (ok ? ' ✓' : ' ✗') : ''}`, failing ? (ok ? C.green : C.red) : colorOf(c), { size: 11 });
    });
    const frames: Frame[] = [
        frame('Two sieves. WHERE filters single rows BEFORE grouping; HAVING filters whole groups AFTER they are counted.', [q, all(() => PLAIN)]),
        frame(`WHERE status = 'delivered' runs first, on rows: ${delivered.length} of the 10 orders are left.`, [q, all(r => (r.status === 'delivered' ? KEEP : GONE))]),
        frame('GROUP BY customer_id makes a pile per customer, and SUM(amount) is worked out per pile.', [q, grouped(false), sums(false)]),
        frame(`HAVING SUM(amount) >= 100 removes whole groups: customer 3 (60) fails. Result: ${havingResult().map(([c, t]) => `customer ${c} (${t})`).join(', ')}. A condition about one row belongs in WHERE — it is cheaper.`, [q, grouped(true), sums(true)]),
    ];
    return { title: 'WHERE filters rows before grouping; HAVING filters groups after', variants: [{ label: 'WHERE then HAVING', frames }] };
};

// ============ sql2-t4 · Conditional aggregation ============

const conditionalCounts = () => groupBy(orders(), r => r.customer_id).map(([c, members]) => {
    const delivered = members.filter(m => m.status === 'delivered').length;
    return [c, members.length, delivered, members.length - delivered];
});

const conditional = (): AnimationSpec => {
    const ord = orders();
    const groups = groupBy(ord, r => r.customer_id);
    const colorOf = (c: SqlCell) => GROUP_COLORS[1 + groups.findIndex(([g]) => g === c)];
    const slots = groupedSlots(groups, r => `o${r.order_id}`);
    const y = 40;
    const cols: Column[] = [{ key: 'cust', w: 42 }, { key: 'status', w: 74 }, { key: 'is_deliv', w: 66 }];
    const rows = (withCase: boolean) => ord.map(r => ({
        id: `o${r.order_id}`, values: { cust: r.customer_id, status: r.status, is_deliv: withCase ? (r.status === 'delivered' ? 1 : 0) : '' },
        look: [colorOf(r.customer_id), 0.28] as Look, cells: withCase ? { is_deliv: r.status === 'delivered' ? C.green : C.grey } : undefined,
    }));
    const tbl = (withCase: boolean) => table('ord', 6, y, cols, rows(withCase), { title: 'orders, by customer', rowH: 15, size: 10, slots });
    const result = conditionalCounts();
    const res = table('res', 196, y, [{ key: 'cust', w: 40 }, { key: 'orders', w: 50 }, { key: 'deliv', w: 50 }, { key: 'not', w: 58 }],
        result.map(([c, n, d, nd]) => ({ id: `c${c}`, values: { cust: c, orders: n, deliv: d, not: nd }, look: [colorOf(c), 0.35] as Look })), { title: 'result', titleColor: C.green, rowH: 18, size: 10 });
    const q = sqlBlock(["SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END)"]);
    const frames: Frame[] = [
        frame('One pass over the orders, several different counts per customer. The trick: hand SUM a CASE.', [q, tbl(false)]),
        frame('For each row, the CASE gives 1 if the order is delivered and 0 if not. (Shown here as is_deliv.)', [q, tbl(true)]),
        frame('SUM adds up the 1s and 0s in each group — which is exactly the number of delivered orders. A second SUM with the opposite condition counts the rest; COUNT(*) counts them all.', [q, tbl(true), res]),
        frame('Swap the conditions for months and the rows become columns — that is a pivot. For a percentage, divide a conditional count by COUNT(*), using 100.0 to avoid integer division.', [q, tbl(false), res]),
    ];
    return { title: 'Conditional aggregation: SUM a CASE to count several things at once', variants: [{ label: 'Delivered vs not', frames }] };
};

// ============ sql2-t5 · The order a query runs in ============

const runOrderResult = () => groupBy(employees().filter(r => (r.salary as number) > 40000), r => r.dept_id)
    .filter(([, members]) => members.length >= 2)
    .map(([d, members]) => [d, avg(members.map(m => m.salary))])
    .sort((a, b) => (b[1] as number) - (a[1] as number));

const runOrder = (): AnimationSpec => {
    const emp = employees();
    const steps = ['FROM', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY'];
    const chips = (on: number) => steps.map((s, i) => rect(`step${i}`, 6 + i * 65, 6, 61, 24, {
        rx: 6, fill: tint(i === on ? C.amber : i < on ? C.green : C.grey, i === on ? 0.55 : i < on ? 0.25 : 0.1), stroke: i === on ? C.amber : i < on ? C.green : C.faint, sw: 1.5,
        text: `${i + 1} ${s}`, size: 9, weight: 700, mono: true,
    }));
    const kept = emp.filter(r => (r.salary as number) > 40000);
    const groups = groupBy(kept, r => r.dept_id);
    const colorOf = (d: SqlCell) => GROUP_COLORS[groups.findIndex(([g]) => g === d) + 1];
    const slots = groupedSlots(groups, r => `e${r.emp_id}`);
    const cols: Column[] = [{ key: 'name', w: 58 }, { key: 'dept_id', w: 60 }, { key: 'salary', w: 56 }];
    const y = 54;
    const rowsTable = (list: Row[], look: (r: Row) => Look, grouped = false) => table('emp', 6, y, cols, list.map(r => empRow(r, look(r))), { title: 'rows', rowH: 18, slots: grouped ? slots : undefined });
    const result = runOrderResult();
    const res = (sorted: boolean) => {
        const list = sorted ? result : [...result].sort((a, b) => compare(a[0], b[0]));
        return table('res', 214, y, [{ key: 'dept_id', w: 66 }, { key: 'avg_salary', w: 100 }], list.map(([d, a]) => ({ id: `g${d}`, values: { dept_id: d, avg_salary: a }, look: [colorOf(d), 0.35] as Look })), { title: 'output', titleColor: C.green, rowH: 18 });
    };
    const small = (s: Row[]) => s.length >= 2;
    const groupLook = (failing: boolean) => (r: Row): Look => {
        const members = groups.find(([d]) => d === r.dept_id)![1];
        return failing && !small(members) ? DROP : [colorOf(r.dept_id), 0.3];
    };
    const note = (value: string, color: string = C.grey) => label('note', 214, 190, value, color, { size: 11, mono: false });
    const frames: Frame[] = [
        frame('You write SELECT first, but the database runs FROM first. Each step works on what the step before it left behind.', [chips(0), rowsTable(emp, () => PLAIN), note('FROM employees: all 8 rows')]),
        frame('2 WHERE salary > 40000 removes rows. Gus (38000) goes: 7 left. WHERE runs before SELECT, so it cannot see SELECT\'s aliases.', [chips(1), rowsTable(emp, r => ((r.salary as number) > 40000 ? PLAIN : DROP)), note('WHERE salary > 40000')]),
        frame('3 GROUP BY dept_id makes piles: department 1 has 4 rows, department 2 has 2, department 3 has 1.', [chips(2), rowsTable(kept, groupLook(false), true), note('GROUP BY dept_id')]),
        frame('4 HAVING COUNT(*) >= 2 removes whole piles: department 3 goes. HAVING runs after grouping, so it can use aggregates; WHERE could not.', [chips(3), rowsTable(kept, groupLook(true), true), note('HAVING COUNT(*) >= 2')]),
        frame('5 SELECT works out the output columns, AVG(salary) AS avg_salary, for each pile that is left. The alias is born here.', [chips(4), rowsTable(kept, groupLook(true), true), res(false), note('SELECT dept_id,\nAVG(salary) AS avg_salary', C.ink)]),
        frame('6 ORDER BY avg_salary DESC runs after SELECT, so it CAN use the alias. Then LIMIT, if there were one, would cut.', [chips(5), rowsTable(kept, groupLook(true), true), res(true), note('ORDER BY avg_salary DESC', C.green)]),
    ];
    return { title: 'The order a query really runs in', variants: [{ label: 'Every clause', frames }] };
};

// ============ sql3-t1 · INNER JOIN ============

const innerJoin = () => employees().filter(e => e.dept_id !== null).map(e => [e.name, departments().find(d => d.dept_id === e.dept_id)!.dept_name]).sort((a, b) => compare(a[0], b[0]));

/** Lines from rows of a left table to rows of a right table. */
const joinLines = (pairs: [number, number][], xL: number, xR: number, yL: number, yR: number, color: (k: number) => string, rowH = 19) =>
    pairs.map(([l, r], k) => line(`j${l}-${r}`, xL, rowMid(yL, l, rowH), xR, rowMid(yR, r, rowH), { stroke: color(k), sw: 1.5 }));

const innerJoinLesson = (): AnimationSpec => {
    const emp = employees();
    const deps = departments();
    const y = 56;
    const left = (look: (r: Row) => Look = () => PLAIN) => table('e', 6, y, [{ key: 'name', w: 58 }, { key: 'dept_id', w: 60 }], emp.map(r => empRow(r, look(r))), { title: 'employees e' });
    const right = (look: (r: Row) => Look = () => PLAIN) => table('d', 244, y, [{ key: 'dept_id', w: 58 }, { key: 'dept_name', w: 94 }], deps.map(r => ({ id: `d${r.dept_id}`, values: r, look: look(r) })), { title: 'departments d' });
    const pairs: [number, number][] = emp.flatMap((e, i) => deps.flatMap((d, j) => (e.dept_id !== null && e.dept_id === d.dept_id ? [[i, j] as [number, number]] : [])));
    const ben = emp.findIndex(e => e.name === 'Ben');
    const result = innerJoin();
    const q = sqlBlock(['FROM employees e JOIN departments d', '  ON d.dept_id = e.dept_id']);
    const frames: Frame[] = [
        frame('A join pairs rows from two tables wherever the ON condition is true — here, where the dept_ids match.', [q, left(), right()]),
        frame('Ben has dept_id 1. Engineering has dept_id 1. That pair matches, so it becomes one result row: Ben, Engineering.', [q, left(r => (r.name === 'Ben' ? FOCUS : PLAIN)), right(r => (r.dept_id === 1 ? FOCUS : PLAIN)), joinLines(pairs.filter(([l]) => l === ben), 124, 244, y, y, () => C.amber)]),
        frame('Every employee is matched the same way: 7 pairs. Gus (NULL) matches nothing — NULL never equals anything. And no employee points at HR.', [q, left(r => (r.dept_id === null ? DROP : KEEP)), right(r => (r.dept_id === 4 ? DROP : KEEP)), joinLines(pairs, 124, 244, y, y, () => C.green)]),
        frame(`INNER JOIN keeps only the matched pairs, each with columns from both tables. Gus and HR are simply not there.`, [q,
            table('res', 110, y, [{ key: 'name', w: 70 }, { key: 'dept_name', w: 110 }], result.map(([n, d]) => ({ id: `r${n}`, values: { name: n, dept_name: d }, look: KEEP })), { title: 'result', titleColor: C.green })]),
    ];
    return { title: 'INNER JOIN: keep the pairs that match on both sides', variants: [{ label: 'Employees and departments', frames }] };
};

// ============ sql3-t2 · LEFT JOIN ============

const leftJoinRows = () => departments().flatMap(d => {
    const members = employees().filter(e => e.dept_id === d.dept_id).sort((a, b) => compare(a.name, b.name));
    return members.length ? members.map(e => [d.dept_name, e.name]) : [[d.dept_name, null]];
});
const headcounts = () => departments().map(d => [d.dept_name, employees().filter(e => e.dept_id === d.dept_id).length]);

const leftJoinLesson = (): AnimationSpec => {
    const emp = employees();
    const deps = departments();
    const y = 56;
    const left = (look: (r: Row) => Look = () => PLAIN) => table('d', 6, y, [{ key: 'dept_id', w: 58 }, { key: 'dept_name', w: 94 }], deps.map(r => ({ id: `d${r.dept_id}`, values: r, look: look(r) })), { title: 'departments d (left)' });
    const right = () => table('e', 274, y, [{ key: 'name', w: 60 }, { key: 'dept_id', w: 60 }], emp.map(r => empRow(r)), { title: 'employees e' });
    const pairs: [number, number][] = deps.flatMap((d, i) => emp.flatMap((e, j) => (e.dept_id === d.dept_id ? [[i, j] as [number, number]] : [])));
    const rows = leftJoinRows();
    const counts = headcounts();
    const q = sqlBlock(['FROM departments d LEFT JOIN employees e', '  ON e.dept_id = d.dept_id']);
    const frames: Frame[] = [
        frame('LEFT JOIN keeps every row of the left table — here departments — whether or not it finds a match.', [q, left(), right()]),
        frame('Engineering matches 4 employees, Sales 2, Marketing 1. HR matches nobody.', [q, left(r => (r.dept_id === 4 ? FOCUS : KEEP)), right(), joinLines(pairs, 158, 274, y, y, () => C.green)]),
        frame('Matched departments appear once per match. HR still appears — once — with NULL in every employee column.', [q,
            table('res', 90, y, [{ key: 'dept_name', w: 110 }, { key: 'name', w: 80 }], rows.map(([d, n], k) => ({ id: `r${k}`, values: { dept_name: d, name: n }, look: n === null ? FOCUS : KEEP })), { title: 'result', titleColor: C.green })]),
        frame('Counting per department: COUNT(e.emp_id) skips HR\'s NULL and gives 0. COUNT(*) counts HR\'s one NULL-filled row and wrongly says 1.', [q,
            table('cnt', 50, y, [{ key: 'dept_name', w: 110 }, { key: 'count_emp_id', w: 112 }, { key: 'count_star', w: 86 }],
                counts.map(([d, c]) => ({ id: `c${d}`, values: { dept_name: d, count_emp_id: c, count_star: Math.max(1, c as number) }, look: c === 0 ? FOCUS : PLAIN, cells: c === 0 ? { count_emp_id: C.green, count_star: C.red } : undefined })), { title: 'headcount' })]),
    ];
    return { title: 'LEFT JOIN: keep every row of the left table', variants: [{ label: 'Departments and people', frames }] };
};

// ============ sql3-t3 · Anti-joins ============

const neverOrdered = () => customers().filter(c => !orders().some(o => o.customer_id === c.customer_id)).map(c => [c.customer_id, c.name]);
const neverSold = () => products().filter(p => !orderItems().some(i => i.product_id === p.product_id)).map(p => [p.product_name]);

const antiJoin = (): AnimationSpec => {
    const cust = customers();
    const ord = orders();
    const joined = cust.flatMap(c => {
        const mine = ord.filter(o => o.customer_id === c.customer_id);
        return mine.length ? mine.map(o => ({ c, o })) : [{ c, o: null as Row | null }];
    });
    const y = 44;
    const tbl = (look: (o: Row | null) => Look, keepOnly = false) => table('lj', 90, y + 12, [{ key: 'customer_id', w: 92 }, { key: 'name', w: 60 }, { key: 'order_id', w: 76 }],
        joined.filter(({ o }) => !keepOnly || o === null).map(({ c, o }) => ({ id: `${c.customer_id}-${o?.order_id ?? 'none'}`, values: { customer_id: c.customer_id, name: c.name, order_id: o?.order_id ?? null }, look: look(o) })),
        { title: keepOnly ? 'result' : 'customers LEFT JOIN orders', rowH: 14, size: 10, titleColor: keepOnly ? C.green : C.grey });
    const missing = neverOrdered();
    const q1 = sqlBlock(['FROM customers c LEFT JOIN orders o ON …', 'WHERE o.order_id IS NULL']);
    const leftJoin: Frame[] = [
        frame('Step 1: LEFT JOIN customers to orders. Every customer is kept; those with no orders get one row full of NULLs on the orders side.', [q1, tbl(o => (o === null ? FOCUS : PLAIN))]),
        frame('Step 2: keep only the unmatched rows: WHERE o.order_id IS NULL. order_id is the orders primary key, so it is NULL only when there was no match at all.', [q1, tbl(o => (o === null ? KEEP : GONE))]),
        frame(`The customers who never ordered: ${missing.map(([, n]) => n).join(' and the second ')}. That is an anti-join.`, [q1, tbl(() => KEEP, true)]),
    ];
    const prods = products();
    const items = orderItems();
    const prodTable = (on: number | null, decided: Set<number>) => table('p', 40, y + 14, [{ key: 'product_name', w: 110 }, { key: 'sold_in', w: 130 }],
        prods.map(p => {
            const lines = items.filter(i => i.product_id === p.product_id).map(i => i.order_id);
            const isOn = p.product_id === on;
            const decidedHere = decided.has(p.product_id as number);
            return {
                id: `p${p.product_id}`, values: { product_name: p.product_name, sold_in: decidedHere || isOn ? (lines.length ? lines.join(', ') : 'none') : '' },
                look: (decidedHere || isOn ? (lines.length ? GONE : KEEP) : PLAIN) as Look,
            };
        }), { title: 'products', rowH: 20 });
    const q2 = sqlBlock(['WHERE NOT EXISTS (SELECT 1 FROM order_items oi', '                  WHERE oi.product_id = p.product_id)']);
    const decided = new Set<number>();
    const notExists: Frame[] = [frame('NOT EXISTS says it directly: keep the product if no order_items row exists for it.', [q2, prodTable(null, decided)])];
    prods.forEach(p => {
        decided.add(p.product_id as number);
        if ((p.product_id as number) === 2 || (p.product_id as number) === 7) {
            const sold = items.some(i => i.product_id === p.product_id);
            notExists.push(frame(sold
                ? `${p.product_name}: the inner query finds order_items rows, so EXISTS is true and NOT EXISTS is false. Dropped.`
                : `${p.product_name}: the inner query finds nothing. NOT EXISTS is true: keep it. Result: ${neverSold().map(([n]) => n).join(', ')}.`, [q2, prodTable(null, new Set(decided))]));
        }
    });
    return { title: 'Anti-joins find what is missing', variants: [{ label: 'LEFT JOIN … IS NULL', frames: leftJoin }, { label: 'NOT EXISTS', frames: notExists }] };
};

// ============ sql3-t4 · Self joins ============

const managerPairs = () => employees().map(e => [e.name, employees().find(m => m.emp_id === e.manager_id)?.name ?? null]);

const selfJoin = (): AnimationSpec => {
    const emp = employees();
    const y = 56;
    const eTable = (look: (r: Row) => Look = () => PLAIN) => table('e', 6, y, [{ key: 'name', w: 58 }, { key: 'manager_id', w: 82 }], emp.map(r => empRow(r, look(r))), { title: 'e (employee)' });
    const mTable = (look: (r: Row) => Look = () => PLAIN) => table('m', 262, y, [{ key: 'emp_id', w: 64 }, { key: 'name', w: 68 }], emp.map(r => ({ id: `m${r.emp_id}`, values: r, look: look(r) })), { title: 'm (manager)' });
    const pairs: [number, number][] = emp.flatMap((e, i) => (e.manager_id === null ? [] : [[i, emp.findIndex(m => m.emp_id === e.manager_id)] as [number, number]]));
    const hana = emp.findIndex(e => e.name === 'Hana');
    const result = managerPairs();
    const q = sqlBlock(['FROM employees e LEFT JOIN employees m', '  ON m.emp_id = e.manager_id']);
    const frames: Frame[] = [
        frame('One table, two aliases: e for the employee, m for the manager. Treat them as two copies of employees.', [q, eTable(), mTable()]),
        frame('Hana\'s manager_id is 2. In the m copy, emp_id 2 is Ben. So the result row is Hana → Ben.', [q, eTable(r => (r.name === 'Hana' ? FOCUS : PLAIN)), mTable(r => (r.emp_id === 2 ? FOCUS : PLAIN)), joinLines(pairs.filter(([l]) => l === hana), 146, 262, y, y, () => C.amber)]),
        frame('Every employee is matched to their manager the same way. Asha\'s manager_id is NULL, so she matches nobody; LEFT JOIN keeps her anyway.', [q, eTable(r => (r.manager_id === null ? FOCUS : KEEP)), mTable(), joinLines(pairs, 146, 262, y, y, () => C.green)]),
        frame('The result: each employee beside their manager. With a plain JOIN, Asha would vanish.', [q,
            table('res', 110, y, [{ key: 'employee', w: 90 }, { key: 'manager', w: 90 }], result.map(([e, m]) => ({ id: `r${e}`, values: { employee: e, manager: m }, look: m === null ? FOCUS : KEEP })), { title: 'result', titleColor: C.green })]),
    ];
    return { title: 'A self join compares a table with itself', variants: [{ label: 'Employee and manager', frames }] };
};

// ============ sql3-t5 · Three or more tables ============

const whatEachOrderContained = () => orders().filter(o => (o.order_date as string) < '2024-01-22').flatMap(o => {
    const c = customers().find(x => x.customer_id === o.customer_id)!;
    return orderItems().filter(i => i.order_id === o.order_id).map(i => [o.order_id, c.name, products().find(p => p.product_id === i.product_id)!.product_name, i.quantity]);
}).sort((a, b) => compare(a[0], b[0]) || compare(a[2], b[2]));

const threeTables = (): AnimationSpec => {
    const early = orders().filter(o => (o.order_date as string) < '2024-01-22');
    const cust = customers();
    const result = whatEachOrderContained();
    const y = 52;
    const chain = (on: number) => ['orders', 'customers', 'order_items', 'products'].map((t, i) => rect(`ch${i}`, 8 + i * 97, 6, 90, 22, {
        rx: 6, fill: tint(i <= on ? C.cyan : C.grey, i === on ? 0.5 : i < on ? 0.2 : 0.08), stroke: i === on ? C.cyan : C.faint, sw: 1.5, text: t, size: 10, weight: 700, mono: true,
    }));
    const count = (n: number, note: string) => [label('count', 392, 40, `${n} rows`, C.amber, { size: 12, anchor: 'end' }), label('cnote', 8, 40, note, C.grey, { size: 11, mono: false })];
    const perOrder = (withCustomer: boolean) => table('t', 20, y, [{ key: 'order_id', w: 70 }, ...(withCustomer ? [{ key: 'customer', w: 80 }] : [])],
        early.map(o => ({ id: `o${o.order_id}`, values: { order_id: o.order_id, customer: cust.find(c => c.customer_id === o.customer_id)!.name }, look: withCustomer ? KEEP : PLAIN })), { rowH: 20 });
    const perItem = (withProduct: boolean) => table('t', 20, y, [{ key: 'order_id', w: 70 }, { key: 'customer', w: 80 }, { key: withProduct ? 'product_name' : 'product_id', w: 110 }, { key: 'quantity', w: 76 }],
        result.map(([id, c, p, q]) => ({
            id: `i${id}-${p}`, values: { order_id: id, customer: c, product_name: p, product_id: products().find(x => x.product_name === p)!.product_id, quantity: q },
            look: KEEP, cells: (withProduct ? { product_name: C.green } : { product_id: C.amber }) as Record<string, string>,
        })), { rowH: 20 });
    const frames: Frame[] = [
        frame('FROM orders (only orders before 22 January, to keep it small): one row per order.', [chain(0), count(early.length, 'one row per order'), perOrder(false)]),
        frame('JOIN customers: each order gains its customer\'s name. Each order has exactly one customer, so the row count stays the same.', [chain(1), count(early.length, 'still one row per order'), perOrder(true)]),
        frame('JOIN order_items: an order with two items becomes two rows. The grain is now one row per item bought.', [chain(2), count(result.length, 'now one row per item'), perItem(false)]),
        frame('JOIN products: each item row gains the product\'s name. Each JOIN needs its own ON, linking to a table already in the query.', [chain(3), count(result.length, 'one row per item, with names'), perItem(true)]),
    ];
    return { title: 'Joining three or more tables: follow the keys, and watch the row count', variants: [{ label: 'Orders to products', frames }] };
};

// ============ sql3-t6 · FULL OUTER JOIN and CROSS JOIN ============

const fullOuter = () => {
    const deps = departments();
    const emp = employees();
    const rows: SqlCell[][] = [];
    emp.filter(e => e.dept_id === null).forEach(e => rows.push([e.name, null]));
    deps.forEach(d => {
        const members = emp.filter(e => e.dept_id === d.dept_id).sort((a, b) => compare(a.name, b.name));
        if (members.length) members.forEach(e => rows.push([e.name, d.dept_name]));
        else rows.push([null, d.dept_name]);
    });
    return rows;
};
const crossJoin = () => products().filter(p => p.category === 'Stationery').sort((a, b) => compare(a.product_name, b.product_name))
    .flatMap(p => departments().map(d => [p.product_name, d.dept_name]));

const fullAndCross = (): AnimationSpec => {
    const rows = fullOuter();
    const y = 44;
    const full: Frame[] = [
        frame('FULL OUTER JOIN = LEFT JOIN + RIGHT JOIN: every matched pair, plus unmatched rows from BOTH sides.', [sqlBlock(['FROM employees e FULL OUTER JOIN departments d ON …']),
            table('f', 100, y, [{ key: 'name', w: 80 }, { key: 'dept_name', w: 110 }], rows.map(([n, d], k) => ({ id: `f${k}`, values: { name: n, dept_name: d }, look: PLAIN })), { title: 'result' })]),
        frame('The 7 matched pairs, plus Gus (no department: NULL on the department side) and HR (no employees: NULL on the employee side). It is mostly for reconciling two sources.', [sqlBlock(['FROM employees e FULL OUTER JOIN departments d ON …']),
            table('f', 100, y, [{ key: 'name', w: 80 }, { key: 'dept_name', w: 110 }], rows.map(([n, d], k) => ({ id: `f${k}`, values: { name: n, dept_name: d }, look: n === null || d === null ? FOCUS : KEEP })), { title: 'result' })]),
    ];
    const stationery = products().filter(p => p.category === 'Stationery').sort((a, b) => compare(a.product_name, b.product_name));
    const deps = departments();
    const gx = 100;
    const gy = 80;
    const cw = 72;
    const grid = (upTo: number) => [
        deps.map((d, j) => text(`dh${j}`, gx + j * cw + cw / 2, gy - 12, d.dept_name as string, { size: 10, fill: C.violet, weight: 700, mono: true })),
        stationery.map((p, i) => text(`ph${i}`, gx - 8, gy + i * 40 + 16, p.product_name as string, { size: 11, fill: C.cyan, weight: 700, mono: true, anchor: 'end' })),
        stationery.flatMap((_, i) => deps.map((__, j) => {
            const k = i * deps.length + j;
            const on = k < upTo;
            return rect(`x${i}-${j}`, gx + j * cw + 3, gy + i * 40, cw - 6, 32, { rx: 6, fill: tint(on ? C.green : C.grey, on ? 0.3 : 0.06), stroke: on ? C.green : C.faint, sw: 1.5, text: on ? `row ${k + 1}` : '', size: 10, weight: 700, mono: true });
        })),
    ];
    const n = stationery.length * deps.length;
    const crossSql = sqlBlock(['FROM products p CROSS JOIN departments d', "WHERE p.category = 'Stationery'"]);
    const cross: Frame[] = [
        frame('CROSS JOIN has no ON at all: it pairs every row of one table with every row of the other.', [crossSql, grid(0)]),
        frame(`The first product meets every department: ${deps.length} pairs.`, [crossSql, grid(deps.length)]),
        frame(`Then the second: ${stationery.length} × ${deps.length} = ${n} rows. On its own that is rarely what you want — but it is how you build a complete grid, then LEFT JOIN the real data onto it so gaps show as zero.`, [crossSql, grid(n)]),
    ];
    return { title: 'FULL OUTER JOIN keeps both sides; CROSS JOIN makes every pair', variants: [{ label: 'FULL OUTER JOIN', frames: full }, { label: 'CROSS JOIN', frames: cross }] };
};

// ============ sql3-t7 · Join traps ============

const fanOut = () => {
    const joined = orders().flatMap(o => orderItems().filter(i => i.order_id === o.order_id).map(() => o.amount));
    return [[sum(joined), sum(orders().map(o => o.amount))]];
};
const whereFilter = () => customers().flatMap(c => orders().filter(o => o.customer_id === c.customer_id && o.status === 'delivered').map(o => [c.name, o.order_id]));
const onFilter = () => customers().flatMap(c => {
    const mine = orders().filter(o => o.customer_id === c.customer_id && o.status === 'delivered');
    return mine.length ? mine.map(o => [c.name, o.order_id]) : [[c.name, null]];
});

const joinTraps = (): AnimationSpec => {
    const ord = orders().filter(o => (o.customer_id as number) === 1);
    const items = orderItems();
    const joined = ord.flatMap(o => items.filter(i => i.order_id === o.order_id).map((i, k) => ({ o, k, n: items.filter(x => x.order_id === o.order_id).length, product: i.product_id })));
    const y = 46;
    const before = table('fo', 60, y, [{ key: 'order_id', w: 76 }, { key: 'amount', w: 70 }], ord.map(o => ({ id: `o${o.order_id}-0`, values: o })), { title: "Priya's orders", rowH: 18 });
    const after = (hot: boolean) => table('fo', 60, y, [{ key: 'order_id', w: 76 }, { key: 'amount', w: 70 }, { key: 'product_id', w: 86 }],
        joined.map(({ o, k, n, product }) => ({ id: `o${o.order_id}-${k}`, values: { order_id: o.order_id, amount: o.amount, product_id: product }, look: (hot && n > 1 ? FOCUS : PLAIN) as Look, cells: hot && n > 1 ? { amount: C.amber } : undefined })),
        { title: 'after JOIN order_items', rowH: 18 });
    const priyaTrue = sum(ord.map(o => o.amount));
    const priyaJoined = sum(joined.map(j => j.o.amount));
    const [[wrongTotal, trueTotal]] = fanOut();
    const fan: Frame[] = [
        frame(`Priya's 5 orders, one row each. Their amounts add up to ${priyaTrue}.`, [before, label('t', 312, 70, `SUM = ${priyaTrue}`, C.green, { size: 13 })]),
        frame('Join order_items: an order with 2 items now appears on 2 rows — and each row carries the FULL order amount.', [after(true)]),
        frame(`SUM(o.amount) now counts 102, 103, 105 and 109 twice: ${priyaJoined} instead of ${priyaTrue}. Over all orders it is ${wrongTotal} instead of ${trueTotal}. That is fan-out.`, [after(true), label('t', 318, 80, `SUM = ${priyaJoined}`, C.red, { size: 13 }), label('t2', 318, 100, `true ${priyaTrue}`, C.green, { size: 12 })]),
        frame('The fix: sum at the right grain. Total the amounts on orders alone, or aggregate order_items to one row per order (in a subquery or CTE) before you join.', [before, label('t', 312, 70, `SUM = ${priyaTrue} ✓`, C.green, { size: 13 })]),
    ];
    const wf = whereFilter();
    const of = onFilter();
    const resTable = (rows: SqlCell[][], title: string, color: string) => table('cw', 110, 58, [{ key: 'name', w: 80 }, { key: 'order_id', w: 90 }],
        rows.map(([n, id], k) => ({ id: `${n}-${id ?? `none${k}`}`, values: { name: n, order_id: id }, look: id === null ? FOCUS : KEEP })), { title, titleColor: color, rowH: 16, size: 10 });
    const onWhere: Frame[] = [
        frame("Goal: every customer, with their delivered orders. Put status = 'delivered' in WHERE…", [sqlBlock(['FROM customers c LEFT JOIN orders o ON …', "WHERE o.status = 'delivered'"]), resTable(wf, `WHERE: ${wf.length} rows`, C.red)]),
        frame('…and Omar, Zoe and the second Tom vanish. WHERE runs after the join; their NULL status is not \'delivered\', so the rows are dropped — the LEFT JOIN has become an INNER JOIN.', [sqlBlock(['FROM customers c LEFT JOIN orders o ON …', "WHERE o.status = 'delivered'"]), resTable(wf, `WHERE: ${wf.length} rows`, C.red),
            label('lost', 288, 120, 'Omar, Zoe, Tom ✗', C.red, { size: 11 })]),
        frame('Move the condition into ON. It now decides which orders MATCH; every customer is kept, with NULL where no delivered order exists.', [sqlBlock(['FROM customers c LEFT JOIN orders o', "  ON … AND o.status = 'delivered'"]), resTable(of, `ON: ${of.length} rows`, C.green)]),
    ];
    return { title: 'Two join traps: fan-out, and a WHERE that undoes a LEFT JOIN', variants: [{ label: 'Fan-out', frames: fan }, { label: 'ON versus WHERE', frames: onWhere }] };
};

export const phase23Animations: Record<string, () => AnimationSpec> = {
    'sql2-t1': aggregates,
    'sql2-t2': groupByLesson,
    'sql2-t3': having,
    'sql2-t4': conditional,
    'sql2-t5': runOrder,
    'sql3-t1': innerJoinLesson,
    'sql3-t2': leftJoinLesson,
    'sql3-t3': antiJoin,
    'sql3-t4': selfJoin,
    'sql3-t5': threeTables,
    'sql3-t6': fullAndCross,
    'sql3-t7': joinTraps,
};

export const phase23Checks: Record<string, () => { example: number; rows: ResultRows }[]> = {
    'sql2-t1': () => [{ example: 2, rows: aggregateSummary() }],
    'sql2-t2': () => [{ example: 0, rows: headcountByDept() }],
    'sql2-t3': () => [{ example: 1, rows: havingResult() }],
    'sql2-t4': () => [{ example: 0, rows: conditionalCounts() }],
    'sql2-t5': () => [{ example: 0, rows: runOrderResult() }],
    'sql3-t1': () => [{ example: 0, rows: innerJoin() }],
    'sql3-t2': () => [{ example: 0, rows: leftJoinRows() }, { example: 1, rows: headcounts() }],
    'sql3-t3': () => [{ example: 0, rows: neverOrdered() }, { example: 1, rows: neverSold() }],
    'sql3-t4': () => [{ example: 0, rows: managerPairs() }],
    'sql3-t5': () => [{ example: 0, rows: whatEachOrderContained() }],
    'sql3-t6': () => [{ example: 0, rows: fullOuter() }, { example: 1, rows: crossJoin() }],
    'sql3-t7': () => [{ example: 0, rows: fanOut() }, { example: 2, rows: whereFilter() }, { example: 3, rows: onFilter() }],
};
