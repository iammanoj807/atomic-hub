import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import { C, box, frame, line, lit, path, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import {
    FOCUS, GONE, KEEP, PLAIN, compare, customers, departments, employees, label, orderItems, orders, products, rowMid, sqlBlock, table,
    type Column, type Look, type ResultRows, type Row,
} from './kit';
import type { SqlCell } from '../sqlPracticeDb';

// Phase 4 (subqueries and CTEs) and Phase 5 (window functions). As before,
// `phase45Checks` lets a test compare each animation's final rows with its
// lesson's worked example. None of them shows the answer to a practice question.

const round = (value: number, places: number) => Math.round(value * 10 ** places) / 10 ** places;
const total = (values: SqlCell[]) => values.reduce<number>((s, v) => s + (typeof v === 'number' ? v : 0), 0);
const mean = (values: SqlCell[]) => {
    const known = values.filter((v): v is number => typeof v === 'number');
    return known.length ? total(known) / known.length : null;
};
const days = (a: string, b: string) => (Date.UTC(+b.slice(0, 4), +b.slice(5, 7) - 1, +b.slice(8, 10)) - Date.UTC(+a.slice(0, 4), +a.slice(5, 7) - 1, +a.slice(8, 10))) / 86400000;
const byName = (a: Row, b: Row) => compare(a.name, b.name);
const bySalaryDesc = (a: Row, b: Row) => (b.salary as number) - (a.salary as number) || compare(a.name, b.name);
const PART_COLORS = [C.cyan, C.violet, C.pink, C.amber, C.teal];
const customerTotals = () => {
    const ids = [...new Set(orders().map(o => o.customer_id as number))].sort((a, b) => a - b);
    return ids.map(id => [id, total(orders().filter(o => o.customer_id === id).map(o => o.amount))]);
};

// ============ sql4-t1 · Subqueries ============

const aboveAverage = () => {
    const avg = mean(employees().map(e => e.salary))!;
    return employees().filter(e => (e.salary as number) > avg).sort(bySalaryDesc).map(e => [e.name, e.salary]);
};
const orderedInMarch = () => {
    const ids = orders().filter(o => (o.order_date as string) >= '2024-03-01').map(o => o.customer_id);
    return customers().filter(c => ids.includes(c.customer_id)).sort(byName).map(c => [c.name]);
};
const averageSpend = () => [[round(mean(customerTotals().map(([, t]) => t))!, 2)]];

const subqueries = (): AnimationSpec => {
    const emp = [...employees()].sort(bySalaryDesc);
    const avg = mean(emp.map(e => e.salary))!;
    const y = 58;
    const tbl = (look: (r: Row) => Look) => table('emp', 30, y, [{ key: 'name', w: 64 }, { key: 'salary', w: 70 }], emp.map(r => ({ id: `e${r.emp_id}`, values: r, look: look(r) })), { title: 'employees' });
    const avgLine = (shown: boolean) => {
        const above = emp.filter(e => (e.salary as number) > avg).length;
        const ly = y + 19 * (above + 1);
        return shown && [line('avg', 24, ly, 250, ly, { stroke: C.amber, sw: 2, dash: '5 4' }), label('avg-t', 254, ly, `AVG = ${avg}`, C.amber, { size: 12 })];
    };
    const inner = (on: boolean) => rect('inner', 186, 4, 208, 22, { rx: 6, fill: tint(C.amber, on ? 0.35 : 0.1), stroke: C.amber, sw: on ? 2 : 1, text: '(SELECT AVG(salary) FROM employees)', size: 9, weight: 700, mono: true });
    const outer = sqlBlock(['WHERE salary >'], 4, C.cyan, 176);
    const one: Frame[] = [
        frame('A subquery is a query in brackets inside another query. The inner one runs first.', [outer, inner(false), tbl(() => PLAIN)]),
        frame(`The inner query averages every salary: ${avg}. It returns one value, so it can go anywhere a single value can.`, [outer, inner(true), tbl(() => PLAIN), avgLine(true)]),
        frame(`The outer query now reads, in effect, WHERE salary > ${avg}. ${aboveAverage().map(([n]) => n).join(', ')} are above the line.`, [outer, inner(true), tbl(r => ((r.salary as number) > avg ? KEEP : GONE)), avgLine(true)]),
    ];
    const marchIds = orders().filter(o => (o.order_date as string) >= '2024-03-01').map(o => o.customer_id as number);
    const cust = customers();
    const listChips = (on: boolean) => [
        label('l-t', 240, 74, 'the inner query returns', C.amber, { size: 11, mono: false }),
        ...marchIds.map((id, i) => rect(`id${i}`, 240 + i * 42, 86, 36, 26, { rx: 13, fill: tint(C.amber, on ? 0.45 : 0.2), stroke: C.amber, sw: 1.5, text: String(id), size: 12, weight: 700, mono: true })),
    ];
    const custTable = (look: (r: Row) => Look) => table('cu', 20, y, [{ key: 'customer_id', w: 92 }, { key: 'name', w: 64 }], cust.map(r => ({ id: `c${r.customer_id}`, values: r, look: look(r) })), { title: 'customers' });
    const q2 = sqlBlock(['WHERE customer_id IN (SELECT customer_id FROM orders', "                      WHERE order_date >= '2024-03-01')"]);
    const list: Frame[] = [
        frame('A subquery after IN returns a list: one column, many rows.', [q2, custTable(() => PLAIN)]),
        frame(`The inner query runs first: the customers who ordered in March are ${marchIds.join(', ')}.`, [q2, custTable(() => PLAIN), listChips(true)]),
        frame(`The outer query keeps customers whose id is in that list: ${orderedInMarch().map(([n]) => n).join(', ')}. The second Tom (id 6) is not in it.`, [q2, custTable(r => (marchIds.includes(r.customer_id as number) ? KEEP : GONE)), listChips(true)]),
    ];
    const totals = customerTotals();
    const derived = (on: boolean) => table('pc', 40, y + 12, [{ key: 'customer_id', w: 92 }, { key: 'total', w: 70 }], totals.map(([c, t]) => ({ id: `c${c}`, values: { customer_id: c, total: t }, look: on ? KEEP : PLAIN })), { title: 'per_customer (made by the inner query)', titleColor: C.amber });
    const [[spend]] = averageSpend();
    const q3 = sqlBlock(['SELECT ROUND(AVG(total), 2) FROM (', '  SELECT customer_id, SUM(amount) AS total …', ') AS per_customer']);
    const tableShape: Frame[] = [
        frame('A subquery in FROM makes a small table on the fly (a derived table). It needs a name: per_customer.', [q3, derived(false)]),
        frame(`The outer query treats it like any table — here it averages the totals: ${spend}. That is how you aggregate an aggregate.`, [q3, derived(true), label('res', 250, 120, `AVG(total) = ${spend}`, C.green, { size: 13 })]),
    ];
    return {
        title: 'Subqueries: one value, a list, or a whole table',
        variants: [{ label: 'One value', frames: one }, { label: 'A list (IN)', frames: list }, { label: 'A table (FROM)', frames: tableShape }],
    };
};

// ============ sql4-t2 · Correlated subqueries, EXISTS and the NOT IN trap ============

const latestPerCustomer = () => {
    const ord = orders();
    return ord.filter(o => o.order_date === ord.filter(x => x.customer_id === o.customer_id).map(x => x.order_date as string).sort().pop())
        .sort((a, b) => compare(a.customer_id, b.customer_id)).map(o => [o.customer_id, o.order_id, o.order_date]);
};
const notInResult = () => {
    const list = employees().map(e => e.dept_id);
    // x NOT IN (list) is true only if x <> v is true for every v; a NULL in the list makes it unknown.
    return departments().filter(d => list.every(v => v !== null && v !== d.dept_id)).map(d => [d.dept_name]);
};
const notExistsResult = () => departments().filter(d => !employees().some(e => e.dept_id === d.dept_id)).map(d => [d.dept_name]);

const correlated = (): AnimationSpec => {
    const ord = orders();
    const y = 56;
    const latest = (c: SqlCell) => ord.filter(o => o.customer_id === c).map(o => o.order_date as string).sort().pop()!;
    const tbl = (look: (r: Row) => Look, extra?: (r: Row) => string) => table('o', 10, y, [{ key: 'order_id', w: 64 }, { key: 'cust', w: 44 }, { key: 'order_date', w: 92 }, { key: 'latest', w: 92 }],
        ord.map(r => ({ id: `o${r.order_id}`, values: { ...r, cust: r.customer_id, latest: extra?.(r) ?? '' }, look: look(r), cells: { latest: C.amber } })), { rowH: 16, size: 10, title: 'orders o' });
    const q = sqlBlock(['WHERE o.order_date = (SELECT MAX(o2.order_date) …', '  WHERE o2.customer_id = o.customer_id)']);
    const kept = latestPerCustomer().map(([, id]) => id);
    const at = (id: number) => (r: Row): Look => (r.order_id === id ? FOCUS : PLAIN);
    const corr: Frame[] = [
        frame('A correlated subquery uses a column of the outer row, so it is worked out again for every outer row.', [q, tbl(() => PLAIN)]),
        frame(`Outer row: order 101, customer 1. The inner query finds customer 1's latest date: ${latest(1)}. 101's date is earlier, so it fails.`, [q, tbl(at(101), r => (r.order_id === 101 ? latest(1) : ''))]),
        frame(`Order 109, also customer 1: its date equals ${latest(1)}, the latest. Kept.`, [q, tbl(at(109), r => (r.order_id === 109 || r.order_id === 101 ? latest(1) : ''))]),
        frame(`Repeat for every order: each customer's latest order survives — ${kept.join(', ')}.`, [q, tbl(r => (kept.includes(r.order_id) ? KEEP : GONE), r => latest(r.customer_id))]),
    ];
    const deps = departments();
    const list = employees().map(e => e.dept_id);
    const chips = list.map((v, i) => rect(`v${i}`, 10 + i * 48, 70, 42, 26, { rx: 13, fill: tint(v === null ? C.red : C.violet, 0.3), stroke: v === null ? C.red : C.violet, sw: 1.5, text: v === null ? 'NULL' : String(v), size: 11, weight: 700, mono: true }));
    const tests = list.map((v, i) => text(`t${i}`, 31 + i * 48, 116, v === null ? '?' : 4 !== v ? '✓' : '✗', { size: 14, fill: v === null ? C.grey : C.green, weight: 800 }));
    const depTable = (look: (r: Row) => Look, title: string) => table('d', 120, 148, [{ key: 'dept_name', w: 120 }], deps.map(r => ({ id: `d${r.dept_id}`, values: r, look: look(r) })), { title, rowH: 18 });
    const trap: Frame[] = [
        frame('The subquery lists every employee\'s dept_id — and Gus\'s is NULL, so the list contains a NULL.', [sqlBlock(['WHERE dept_id NOT IN (SELECT dept_id FROM employees)']), label('l', 10, 56, 'the list', C.violet, { size: 11, mono: false }), chips, depTable(() => PLAIN, 'departments')]),
        frame('HR (4): is 4 NOT IN the list? That means 4 <> 1 AND 4 <> 2 AND … AND 4 <> NULL. The last part is unknown, so the whole AND is unknown — never true.', [sqlBlock(['WHERE dept_id NOT IN (SELECT dept_id FROM employees)']), label('l', 10, 56, 'is 4 different from each?', C.violet, { size: 11, mono: false }), chips, tests, depTable(r => (r.dept_id === 4 ? FOCUS : PLAIN), 'departments')]),
        frame(`So even HR, which nobody works in, is dropped. The query returns no rows${notInResult().length ? '' : ' at all'} — and no error warns you.`, [sqlBlock(['WHERE dept_id NOT IN (SELECT dept_id FROM employees)']), chips, tests, depTable(() => GONE, 'result: nothing')]),
        frame(`NOT EXISTS asks a different question — "is there any employee with this dept_id?" — and NULLs can't spoil it. Result: ${notExistsResult().map(([n]) => n).join(', ')}.`, [sqlBlock(['WHERE NOT EXISTS (SELECT 1 FROM employees e', '                  WHERE e.dept_id = d.dept_id)'], 4, C.green), depTable(r => (r.dept_id === 4 ? KEEP : GONE), 'result')]),
    ];
    return { title: 'Correlated subqueries, and why NOT IN breaks on a NULL', variants: [{ label: 'Correlated', frames: corr }, { label: 'The NOT IN trap', frames: trap }] };
};

// ============ sql4-t3 · CTEs ============

const aboveAverageCustomers = () => {
    const totals = customerTotals();
    const avg = mean(totals.map(([, t]) => t))!;
    return totals.filter(([, t]) => (t as number) > avg).sort((a, b) => (b[1] as number) - (a[1] as number)).map(([c, t]) => [customers().find(x => x.customer_id === c)!.name, t]);
};

const ctes = (): AnimationSpec => {
    const totals = customerTotals();
    const avg = round(mean(totals.map(([, t]) => t))!, 2);
    const result = aboveAverageCustomers();
    const q = sqlBlock(['WITH per_customer AS ( … SUM(amount) AS total … )', 'SELECT c.name, p.total FROM per_customer p JOIN …', 'WHERE p.total > (SELECT AVG(total) FROM per_customer)']);
    const y = 76;
    const pc = (look: (t: number) => Look) => table('pc', 10, y, [{ key: 'customer_id', w: 92 }, { key: 'total', w: 64 }], totals.map(([c, t]) => ({ id: `c${c}`, values: { customer_id: c, total: t }, look: look(t as number) })), { title: 'per_customer', titleColor: C.amber, rowH: 20 });
    const steps = (on: number) => ['1 name a step', '2 join for names', '3 reuse for AVG', '4 keep > AVG'].map((s, i) => rect(`s${i}`, 184 + (i % 2) * 106, 72 + Math.floor(i / 2) * 32, 100, 26, {
        rx: 6, fill: tint(i === on ? C.amber : i < on ? C.green : C.grey, i === on ? 0.45 : i < on ? 0.2 : 0.08), stroke: i === on ? C.amber : C.faint, sw: 1.5, text: s, size: 9, weight: 700, mono: true,
    }));
    const res = table('res', 200, 150, [{ key: 'name', w: 80 }, { key: 'total', w: 70 }], result.map(([n, t]) => ({ id: `r${n}`, values: { name: n, total: t }, look: KEEP })), { title: 'result', titleColor: C.green, rowH: 20 });
    const frames: Frame[] = [
        frame('WITH names a step: per_customer is a small table of each customer\'s total spend, built once at the top of the query.', [q, pc(() => FOCUS), steps(0)]),
        frame('The main query uses per_customer like any table, joining it to customers to get names.', [q, pc(() => PLAIN), steps(1)]),
        frame(`It uses the same CTE a second time, to work out the average total: ${avg}. With a subquery you would have to write it twice.`, [q, pc(() => PLAIN), steps(2), label('avg', 184, 150, `AVG(total) = ${avg}`, C.amber, { size: 12 })]),
        frame(`Keep the customers above the average: ${result.map(([n, t]) => `${n} (${t})`).join(', ')}. Each step can be tested on its own while you build it.`, [q, pc(t => (t > avg ? KEEP : GONE)), steps(3), res]),
    ];
    return { title: 'A CTE names a step, so the query reads top to bottom', variants: [{ label: 'Above-average spenders', frames }] };
};

// ============ sql4-t4 · Recursive CTEs ============

const orgChart = () => {
    const emp = employees();
    const levels: { row: Row; level: number }[] = [];
    let round_ = emp.filter(e => e.manager_id === null);
    let level = 0;
    while (round_.length) {
        round_.forEach(row => levels.push({ row, level }));
        const ids = round_.map(r => r.emp_id);
        round_ = emp.filter(e => ids.includes(e.manager_id));
        level++;
    }
    return levels;
};
const orgChartRows = () => orgChart().sort((a, b) => a.level - b.level || compare(a.row.name, b.row.name)).map(({ row, level }) => [row.name, level]);
const countToFive = () => {
    const out: number[] = [1];
    while (out[out.length - 1] < 5) out.push(out[out.length - 1] + 1);
    return out.map(n => [n]);
};

const recursive = (): AnimationSpec => {
    const chart = orgChart();
    const pos = new Map<string, [number, number]>();
    const levelY = [70, 130, 190];
    const byLevel = [0, 1, 2].map(l => chart.filter(c => c.level === l));
    byLevel[0].forEach(c => pos.set(c.row.name as string, [200, levelY[0]]));
    byLevel[1].forEach((c, i) => pos.set(c.row.name as string, [62 + i * 92, levelY[1]]));
    byLevel[2].forEach(c => {
        const manager = chart.find(m => m.row.emp_id === c.row.manager_id)!;
        const siblings = byLevel[2].filter(s => s.row.manager_id === c.row.manager_id);
        const k = siblings.indexOf(c);
        const [mx] = pos.get(manager.row.name as string)!;
        pos.set(c.row.name as string, [mx + (k - (siblings.length - 1) / 2) * 76, levelY[2]]);
    });
    const tree = (upTo: number, fresh: number | null): Part => chart.filter(c => c.level <= upTo).map(c => {
        const [x, yy] = pos.get(c.row.name as string)!;
        const manager = chart.find(m => m.row.emp_id === c.row.manager_id);
        const color = c.level === fresh ? C.amber : C.green;
        const b = box(`n${c.row.emp_id}`, x - 34, yy - 13, 68, 26, `${c.row.name} · ${c.level}`, color, { size: 11 });
        return [
            manager && line(`l${c.row.emp_id}`, pos.get(manager.row.name as string)![0], levelY[c.level - 1] + 13, x, yy - 13, { stroke: C.dim, sw: 1.5 }),
            c.level === fresh ? lit(b, color) : b,
        ];
    });
    const q = sqlBlock(['anchor:    WHERE manager_id IS NULL → level 0', 'recursive: e.manager_id = chart.emp_id → level + 1']);
    const org: Frame[] = [
        frame('The anchor runs once: the person with no manager. Asha, level 0.', [q, tree(0, 0)]),
        frame(`Round 1: the recursive part finds everyone whose manager was found in the last round — ${byLevel[1].map(c => c.row.name).join(', ')}: level 0 + 1 = 1.`, [q, tree(1, 1)]),
        frame(`Round 2: their reports — ${byLevel[2].map(c => c.row.name).join(', ')}: level 2.`, [q, tree(2, 2)]),
        frame('Round 3 finds nobody managed by Eli, Gus or Hana. A round with no new rows ends the recursion. Without a way to stop, it would run forever.', [q, tree(2, null), label('stop', 200, 222, 'round 3: no new rows → stop', C.red, { size: 12, anchor: 'middle' })]),
    ];
    const nums = countToFive().map(([n]) => n as number);
    const chips = (upTo: number) => nums.slice(0, upTo).map((n, i) => rect(`k${n}`, 40 + i * 64, 100, 50, 40, { rx: 8, fill: tint(i === upTo - 1 ? C.amber : C.green, 0.4), stroke: i === upTo - 1 ? C.amber : C.green, sw: 2, text: String(n), size: 18, weight: 800, mono: true }));
    const q2 = sqlBlock(['SELECT 1 UNION ALL SELECT n + 1 FROM numbers WHERE n < 5']);
    const count: Frame[] = [
        frame('Anchor: SELECT 1. The CTE starts with one row: 1.', [q2, chips(1)]),
        ...nums.slice(1).map((n, i) => frame(`Round ${i + 1}: the last row is ${n - 1}; ${n - 1} < 5 is true, so add ${n - 1} + 1 = ${n}.`, [q2, chips(i + 2)], 2600)),
        frame('Next round: the last row is 5, and 5 < 5 is false — no new row, so it stops. Result: 1 to 5.', [q2, chips(nums.length), label('stop', 200, 180, '5 < 5? no → stop', C.red, { size: 13, anchor: 'middle' })]),
    ];
    return { title: 'A recursive CTE adds rows round by round until a round finds nothing', variants: [{ label: 'Org chart', frames: org }, { label: 'Count to 5', frames: count }] };
};

// ============ sql4-t5 · UNION, INTERSECT, EXCEPT ============

const unionRows = () => {
    const all = [...departments().map(d => d.location), ...customers().map(c => c.city)];
    return [...new Set(all)].sort(compare).map(c => [c]);
};
const intersectRows = () => {
    const locs = new Set(departments().map(d => d.location));
    return [...new Set(customers().map(c => c.city))].filter(c => locs.has(c)).sort(compare).map(c => [c]);
};
const exceptRows = () => {
    const cities = new Set(customers().map(c => c.city));
    return [...new Set(departments().map(d => d.location))].filter(l => !cities.has(l)).sort(compare).map(l => [l]);
};

const setOps = (): AnimationSpec => {
    const locs = departments().map(d => d.location);
    const cities = customers().map(c => c.city);
    const chip = (id: string, x: number, y: number, v: SqlCell, color: string, strength = 0.3, h = 22) =>
        rect(id, x, y, 84, h, { rx: h / 2, fill: tint(color, strength), stroke: color, sw: 1.5, text: v === null ? 'NULL' : String(v), textColor: v === null ? C.grey : C.ink, size: 11, weight: 700, mono: true });
    const sources = (dim = false) => [
        label('a-t', 14, 44, 'departments.location', C.violet, { size: 11 }),
        ...locs.map((v, i) => chip(`a${i}`, 14, 54 + i * 26, v, C.violet, dim ? 0.08 : 0.3)),
        label('b-t', 14, 168, 'customers.city', C.cyan, { size: 11 }),
        ...cities.map((v, i) => chip(`b${i}`, 14 + (i % 3) * 90, 178 + Math.floor(i / 3) * 26, v, C.cyan, dim ? 0.08 : 0.3)),
    ];
    const out = (title: string, values: SqlCell[], color: string) => [
        label('o-t', 286, 44, title, color, { size: 11 }),
        ...values.map((v, i) => chip(`o${String(v)}`, 286, 54 + i * 26, v, color, 0.45)),
    ];
    const union = unionRows().map(([v]) => v);
    const inter = intersectRows().map(([v]) => v);
    const except = exceptRows().map(([v]) => v);
    const frames: Frame[] = [
        frame('Two queries that each return one column of cities. A set operator puts their results together — they need the same number of columns, of matching types.', [sqlBlock(['SELECT location FROM departments ⟨set op⟩ SELECT city …']), sources()]),
        frame('UNION ALL simply stacks the two results, duplicates and all. It is the fast one: no checking.', [sqlBlock(['… UNION ALL …']), sources(true), label('o-t', 286, 44, 'UNION ALL', C.amber, { size: 11 }),
            ...[...locs, ...cities].map((v, i) => chip(`s${i}`, 286, 52 + i * 18, v, C.amber, 0.25, 16))]),
        frame(`UNION stacks them, then removes duplicate rows: ${union.length} different cities are left. Removing duplicates costs a sort or a hash.`, [sqlBlock(['… UNION …']), sources(true), out('UNION', union, C.green)]),
        frame(`INTERSECT keeps the rows found in both results: ${inter.join(' and ')}.`, [sqlBlock(['… INTERSECT …']), sources(true), out('INTERSECT', inter, C.green)]),
        frame(`EXCEPT keeps rows of the first result that are not in the second: ${except.join(', ')} has a department but no customer.`, [sqlBlock(['SELECT location FROM departments EXCEPT SELECT city …']), sources(true), out('EXCEPT', except, C.green)]),
    ];
    return { title: 'Set operators combine two results: stack, dedupe, both, or only the first', variants: [{ label: 'Cities', frames }] };
};

// ============ sql5-t1 · Window functions: OVER and PARTITION BY ============

const deptAverages = () => employees().filter(e => e.dept_id !== null).sort((a, b) => compare(a.dept_id, b.dept_id) || compare(a.name, b.name))
    .map(e => [e.name, e.dept_id, e.salary, mean(employees().filter(x => x.dept_id === e.dept_id).map(x => x.salary))]);

const windows = (): AnimationSpec => {
    const rows = deptAverages();
    const depts = [...new Set(rows.map(r => r[1] as number))];
    const colorOf = (d: number) => PART_COLORS[depts.indexOf(d)];
    const slots: Record<string, number> = {};
    let at = 0;
    depts.forEach(d => {
        rows.filter(r => r[1] === d).forEach(r => { slots[`e${r[0]}`] = at++; });
        at += 0.4;
    });
    const y = 44;
    const cols: Column[] = [{ key: 'name', w: 58 }, { key: 'dept_id', w: 60 }, { key: 'salary', w: 58 }];
    const tbl = (withAvg: boolean, grouped: boolean) => table('w', 6, y, withAvg ? [...cols, { key: 'dept_avg', w: 72 }] : cols,
        rows.map(([n, d, s, a]) => ({ id: `e${n}`, values: { name: n, dept_id: d, salary: s, dept_avg: a }, look: (grouped ? [colorOf(d as number), 0.3] : PLAIN) as Look, cells: withAvg ? { dept_avg: colorOf(d as number) } : undefined })),
        { title: withAvg ? 'result: every row kept' : 'employees (with a department)', slots: grouped ? slots : undefined, titleColor: withAvg ? C.green : C.grey });
    const grouped = table('g', 270, y, [{ key: 'dept_id', w: 56 }, { key: 'avg', w: 66 }], depts.map(d => ({ id: `g${d}`, values: { dept_id: d, avg: mean(rows.filter(r => r[1] === d).map(r => r[2])) }, look: [colorOf(d), 0.3] as Look })), { title: 'GROUP BY: 3 rows', titleColor: C.grey });
    const q = sqlBlock(['AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg']);
    const frames: Frame[] = [
        frame('Seven employees with a department. We want each one next to their department\'s average salary.', [q, tbl(false, false)]),
        frame('PARTITION BY dept_id splits the rows into windows, one per department — like GROUP BY\'s piles. But nothing is squashed.', [q, tbl(false, true)]),
        frame('AVG(salary) is worked out over each window, and every row gets its own window\'s answer. All 7 rows stay.', [q, tbl(true, true)]),
        frame('Compare GROUP BY: one row per department, and the individual names are gone. A window function keeps the detail AND adds the group\'s number.', [q, tbl(true, true), grouped]),
    ];
    return { title: 'A window function adds a group\'s answer to every row, without removing any', variants: [{ label: 'Department average', frames }] };
};

// ============ sql5-t2 · Ranking ============

const rankings = () => {
    const emp = [...employees()].sort(bySalaryDesc);
    return emp.map((e, i) => {
        const rank = emp.findIndex(x => x.salary === e.salary) + 1;
        const dense = [...new Set(emp.map(x => x.salary))].indexOf(e.salary) + 1;
        return [e.name, e.salary, i + 1, rank, dense];
    });
};

const ranking = (): AnimationSpec => {
    const rows = rankings();
    const y = 44;
    const cols: Column[] = [{ key: 'name', w: 58 }, { key: 'salary', w: 58 }, { key: 'row_num', w: 70 }, { key: 'rank', w: 52 }, { key: 'dense', w: 60 }];
    const tie = (s: SqlCell) => s === 70000;
    const after = (s: SqlCell) => s === 60000;
    const tbl = (filled: number, hot: string | null) => table('rk', 40, y, cols, rows.map(([n, s, rn, rk, dn]) => ({
        id: `e${n}`, values: { name: n, salary: s, row_num: filled >= 1 ? rn : '', rank: filled >= 2 ? rk : '', dense: filled >= 3 ? dn : '' },
        look: (tie(s) ? FOCUS : after(s) && hot ? [C.violet, 0.25] : PLAIN) as Look,
        cells: hot ? { [hot]: tie(s) || after(s) ? C.amber : C.ink } : undefined,
    })), { title: 'ORDER BY salary DESC' });
    const frames: Frame[] = [
        frame('Sorted by salary, highest first. Ben and Chen tie on 70000 — the three ranking functions differ only in how they treat a tie.', [tbl(0, null)]),
        frame('ROW_NUMBER: 1, 2, 3, 4… always different. Ben and Chen get 3 and 4; which way round is arbitrary unless you add a tiebreaker (here, name).', [tbl(1, 'row_num')]),
        frame('RANK: ties share a number, then it skips — like sports. Ben and Chen are both 3, so nobody is 4: Dara is 5.', [tbl(2, 'rank')]),
        frame('DENSE_RANK: ties share a number, with no gap. Dara is 4. "The 2nd highest salary" is simply DENSE_RANK = 2.', [tbl(3, 'dense')]),
    ];
    return { title: 'ROW_NUMBER, RANK and DENSE_RANK: three ways to handle a tie', variants: [{ label: 'Side by side', frames }] };
};

// ============ sql5-t3 · LAG and LEAD ============

const monthly = () => {
    const months = [...new Set(orders().map(o => (o.order_date as string).slice(0, 7)))].sort();
    return months.map(m => [m, total(orders().filter(o => (o.order_date as string).startsWith(m)).map(o => o.amount))]);
};
const lagRows = () => monthly().map(([m, r], i, all) => [m, r, i ? all[i - 1][1] : null, i ? (r as number) - (all[i - 1][1] as number) : null]);
const daysBetween = () => {
    const ord = orders().filter(o => o.customer_id === 1 || o.customer_id === 2).sort((a, b) => compare(a.customer_id, b.customer_id) || compare(a.order_date, b.order_date));
    return ord.map((o, i) => {
        const prev = i > 0 && ord[i - 1].customer_id === o.customer_id ? ord[i - 1].order_date as string : null;
        return [o.customer_id, o.order_id, o.order_date, prev, prev ? days(prev, o.order_date as string) : null];
    });
};

const lagLead = (): AnimationSpec => {
    const rows = lagRows();
    const y = 70;
    const cols: Column[] = [{ key: 'month', w: 76 }, { key: 'revenue', w: 70 }, { key: 'prev', w: 64 }, { key: 'change', w: 70 }];
    const tbl = (filled: number) => table('lg', 50, y, cols, rows.map(([m, r, p, c], i) => ({
        id: `m${m}`, values: { month: m, revenue: r, prev: filled >= 1 ? p : '', change: filled >= 2 ? c : '' },
        cells: { prev: C.amber, change: c === null ? C.grey : (c as number) < 0 ? C.red : C.green }, look: (i === 0 && filled >= 1 ? FOCUS : PLAIN) as Look,
    })), { title: 'monthly revenue', rowH: 26 });
    // From each month's revenue down to the next month's prev cell.
    const arrows = rows.slice(1).map((_, k) => path(`a${k}`, [[160, rowMid(y, k, 26) + 3], [194, rowMid(y, k + 1, 26) - 3]], { stroke: C.amber, sw: 2, arrow: true }));
    const q = sqlBlock(['LAG(revenue) OVER (ORDER BY month) AS prev']);
    const monthFrames: Frame[] = [
        frame('One row per month. To compare each month with the one before, a row needs to see its neighbour.', [q, tbl(0)]),
        frame('LAG(revenue) looks one row back, in the order set by OVER (ORDER BY month). January has no row before it, so it gets NULL.', [q, tbl(1), arrows]),
        frame('Now the change is just revenue − prev: February fell by 235, March by 72. January\'s change is NULL, because NULL − anything is NULL.', [q, tbl(2), arrows]),
    ];
    const dr = daysBetween();
    const custColor = (c: SqlCell) => (c === 1 ? C.cyan : C.violet);
    const dtbl = (filled: boolean) => table('dg', 6, 58, [{ key: 'cust', w: 40 }, { key: 'order_date', w: 86 }, { key: 'previous', w: 86 }, { key: 'days', w: 44 }],
        dr.map(([c, id, d, p, n]) => ({ id: `o${id}`, values: { cust: c, order_date: d, previous: filled ? p : '', days: filled ? n : '' }, look: (filled && p === null ? FOCUS : [custColor(c), 0.25]) as Look })), { title: 'orders of customers 1 and 2', rowH: 20 });
    const q2 = sqlBlock(['LAG(order_date) OVER (PARTITION BY customer_id', '                    ORDER BY order_date)']);
    const partFrames: Frame[] = [
        frame('With PARTITION BY customer_id, each customer\'s orders are a separate window.', [q2, dtbl(false)]),
        frame('LAG looks back only within the window: each customer\'s FIRST order gets NULL, instead of borrowing the previous customer\'s last order. Then days = this date − previous date.', [q2, dtbl(true)]),
    ];
    return { title: 'LAG looks at the previous row; PARTITION BY stops it at the group boundary', variants: [{ label: 'Month on month', frames: monthFrames }, { label: 'Per customer', frames: partFrames }] };
};

// ============ sql5-t4 · Running totals and window frames ============

const runningTotals = () => {
    let run = 0;
    let seen = false;
    return [...orders()].sort((a, b) => compare(a.order_date, b.order_date)).map(o => {
        if (o.amount !== null) {
            run += o.amount as number;
            seen = true;
        }
        return [o.order_date, o.amount, seen ? run : null];
    });
};
const movingAverage = () => {
    const ord = [...orders()].sort((a, b) => compare(a.order_date, b.order_date));
    return ord.map((o, i) => [o.order_date, o.amount, round(mean(ord.slice(Math.max(0, i - 2), i + 1).map(x => x.amount))!, 1)]);
};
const rangeVsRows = () => {
    const emp = [...employees()].sort(bySalaryDesc);
    return emp.map((e, i) => [e.name, e.salary, total(emp.filter(x => (x.salary as number) >= (e.salary as number)).map(x => x.salary)), total(emp.slice(0, i + 1).map(x => x.salary))]);
};

const frames_ = (): AnimationSpec => {
    const run = runningTotals();
    const y = 40;
    const rh = 17;
    const tbl = (upTo: number, extraKey: string, extra: (i: number) => SqlCell, title: string) => table('rt', 50, y, [{ key: 'order_date', w: 96 }, { key: 'amount', w: 64 }, { key: extraKey, w: 104 }],
        run.map(([d, a], i) => ({ id: `r${i}`, values: { order_date: d, amount: a, [extraKey]: i <= upTo ? extra(i) : '' }, look: (i === upTo ? FOCUS : PLAIN) as Look, cells: { [extraKey]: C.green } })), { title, rowH: rh, size: 10 });
    const frameBox = (from: number, to: number, color: string) => rect('fb', 44, y + rh * (from + 1) - 1, 276, rh * (to - from + 1) + 1, { rx: 5, fill: 'none', stroke: color, sw: 2, dash: '5 4' });
    const q = sqlBlock(['SUM(amount) OVER (ORDER BY order_date) AS running_total']);
    const running: Frame[] = [
        frame('With ORDER BY inside OVER, SUM becomes a running total: for each row, the frame is "from the first row up to me".', [q, tbl(0, 'running_total', i => run[i][2], 'orders by date'), frameBox(0, 0, C.amber)]),
        ...[1, 3, 5].map(i => frame(i === 5
            ? 'Order 106 has no amount: SUM skips the NULL, so the total stays the same on that row.'
            : `Row ${i + 1}: the frame now covers ${i + 1} rows, so the total is ${run[i][2]}.`, [q, tbl(i, 'running_total', k => run[k][2], 'orders by date'), frameBox(0, i, C.amber)], 2600)),
        frame(`To the last row: ${run[run.length - 1][2]}, the grand total.`, [q, tbl(run.length - 1, 'running_total', k => run[k][2], 'orders by date'), frameBox(0, run.length - 1, C.green)]),
    ];
    const mov = movingAverage();
    const q2 = sqlBlock(['AVG(amount) OVER (ORDER BY order_date', '  ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)']);
    const tbl2 = (upTo: number) => table('rt', 50, 52, [{ key: 'order_date', w: 96 }, { key: 'amount', w: 64 }, { key: 'moving_avg_3', w: 104 }],
        mov.map(([d, a, m], i) => ({ id: `r${i}`, values: { order_date: d, amount: a, moving_avg_3: i <= upTo ? m : '' }, look: (i === upTo ? FOCUS : PLAIN) as Look, cells: { moving_avg_3: C.green } })), { title: 'orders by date', rowH: rh, size: 10 });
    const box2 = (from: number, to: number) => rect('fb', 44, 52 + rh * (from + 1) - 1, 276, rh * (to - from + 1) + 1, { rx: 5, fill: 'none', stroke: C.amber, sw: 2, dash: '5 4' });
    const moving: Frame[] = [
        frame('A frame can be smaller: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW is this row and the two before it — at most 3 rows.', [q2, tbl2(2), box2(0, 2)]),
        ...[3, 4].map(i => frame(`Slide down one row: the frame drops the oldest row and takes the new one. AVG over it: ${mov[i][2]}.`, [q2, tbl2(i), box2(i - 2, i)], 2600)),
        frame('Every row averages its own 3-row window: a 3-order moving average, which smooths out spikes.', [q2, tbl2(mov.length - 1), box2(mov.length - 3, mov.length - 1)]),
    ];
    const rv = rangeVsRows();
    const q3 = sqlBlock(['SUM(salary) OVER (ORDER BY salary DESC) -- RANGE', 'SUM(salary) OVER (ORDER BY salary DESC, name ROWS …)']);
    const tbl3 = (filled: number) => table('rv', 20, 58, [{ key: 'name', w: 58 }, { key: 'salary', w: 60 }, { key: 'default_range', w: 120 }, { key: 'rows_frame', w: 100 }],
        rv.map(([n, s, r, w]) => ({ id: `e${n}`, values: { name: n, salary: s, default_range: filled >= 1 ? r : '', rows_frame: filled >= 2 ? w : '' }, look: (s === 70000 ? FOCUS : PLAIN) as Look, cells: s === 70000 ? { default_range: C.red, rows_frame: C.green } : undefined })), { title: 'employees by salary', rowH: rh + 1, size: 10 });
    const trap: Frame[] = [
        frame('The trap: with ORDER BY and no frame, the default is RANGE, which includes every row tied with the current one.', [q3, tbl3(0)]),
        frame('Ben and Chen tie on 70000, so with RANGE both rows include both salaries: both show 315000.', [q3, tbl3(1)]),
        frame('With ROWS, the frame moves one row at a time (name breaks the tie): Ben 245000, then Chen 315000. Write ROWS when you mean one row at a time.', [q3, tbl3(2)]),
    ];
    return {
        title: 'Window frames: running totals, moving averages, and the RANGE trap',
        variants: [{ label: 'Running total', frames: running }, { label: 'Moving average', frames: moving }, { label: 'RANGE vs ROWS', frames: trap }],
    };
};

// ============ sql5-t5 · Share of total, NTILE and FIRST_VALUE ============

const categoryShare = () => {
    const items = orderItems();
    const prods = products();
    const byCat = new Map<string, number>();
    items.forEach(i => {
        const p = prods.find(x => x.product_id === i.product_id)!;
        byCat.set(p.category as string, (byCat.get(p.category as string) ?? 0) + (i.quantity as number) * (p.price as number));
    });
    const grand = [...byCat.values()].reduce((s, v) => s + v, 0);
    return [...byCat.entries()].sort((a, b) => b[1] - a[1]).map(([c, r]) => [c, r, round((100 * r) / grand, 1)]);
};
const quartiles = () => [...employees()].sort(bySalaryDesc).map((e, i, all) => [e.name, e.salary, Math.floor((i * 4) / all.length) + 1]);

const shares = (): AnimationSpec => {
    const rows = categoryShare();
    const grand = total(rows.map(r => r[1]));
    const maxR = Math.max(...rows.map(r => r[1] as number));
    const bars = (showPct: boolean) => rows.map(([c, r, p], i) => {
        const yy = 60 + i * 32;
        const w = ((r as number) / maxR) * 180;
        return [
            text(`c${i}`, 104, yy + 11, c as string, { size: 11, fill: C.ink, weight: 700, mono: true, anchor: 'end' }),
            rect(`b${i}`, 110, yy, w, 22, { rx: 4, fill: tint(PART_COLORS[i], 0.6), stroke: 'none' }),
            text(`v${i}`, 116 + w, yy + 11, showPct ? `${r} → ${p}%` : String(r), { size: 11, fill: showPct ? C.green : C.ink, weight: 700, mono: true, anchor: 'start' }),
        ];
    });
    const share: Frame[] = [
        frame('Revenue per category, worked out in a CTE first.', [sqlBlock(['100.0 * revenue / SUM(revenue) OVER () AS pct_of_total']), bars(false)]),
        frame(`SUM(revenue) OVER () — an empty OVER — is one window of every row, so the grand total, ${grand}, is written on every row.`, [sqlBlock(['100.0 * revenue / SUM(revenue) OVER () AS pct_of_total']), bars(false), label('g', 110, 228, `SUM(revenue) OVER () = ${grand} on every row`, C.amber, { size: 12 })]),
        frame(`Divide each row by it: Electronics is 100.0 × ${rows[0][1]} ÷ ${grand} = ${rows[0][2]}%. (100.0, not 100, avoids integer division.)`, [sqlBlock(['100.0 * revenue / SUM(revenue) OVER () AS pct_of_total']), bars(true)]),
    ];
    const q = quartiles();
    const bucketColor = (b: number) => PART_COLORS[b - 1];
    const deal = (upTo: number) => q.map(([n, s, b], i) => rect(`e${n}`, 20 + (i < upTo ? ((b as number) - 1) * 94 : i * 46), i < upTo ? 90 + (i % 2) * 36 : 200, i < upTo ? 86 : 42, 30, {
        rx: 6, fill: tint(i < upTo ? bucketColor(b as number) : C.grey, 0.35), stroke: i < upTo ? bucketColor(b as number) : C.faint, sw: 1.5, text: i < upTo ? `${n} ${s}` : String(n).slice(0, 4), size: i < upTo ? 10 : 9, weight: 700, mono: true,
    }));
    const heads = [1, 2, 3, 4].map(b => label(`h${b}`, 63 + (b - 1) * 94, 74, `bucket ${b}`, bucketColor(b), { size: 11, anchor: 'middle' }));
    const ntile: Frame[] = [
        frame('NTILE(4) deals the sorted rows into 4 buckets, like dealing cards. 8 employees, highest salary first.', [sqlBlock(['NTILE(4) OVER (ORDER BY salary DESC, name)']), heads, deal(0)]),
        frame('The top two salaries go into bucket 1: the top quarter.', [sqlBlock(['NTILE(4) OVER (ORDER BY salary DESC, name)']), heads, deal(2)]),
        frame('8 rows ÷ 4 buckets = 2 per bucket. If it did not divide evenly, the first buckets would get one extra.', [sqlBlock(['NTILE(4) OVER (ORDER BY salary DESC, name)']), heads, deal(8)]),
    ];
    return { title: 'Share of the total, and dealing rows into buckets', variants: [{ label: 'Share of total', frames: share }, { label: 'NTILE(4)', frames: ntile }] };
};

export const phase45Animations: Record<string, () => AnimationSpec> = {
    'sql4-t1': subqueries,
    'sql4-t2': correlated,
    'sql4-t3': ctes,
    'sql4-t4': recursive,
    'sql4-t5': setOps,
    'sql5-t1': windows,
    'sql5-t2': ranking,
    'sql5-t3': lagLead,
    'sql5-t4': frames_,
    'sql5-t5': shares,
};

export const phase45Checks: Record<string, () => { example: number; rows: ResultRows }[]> = {
    'sql4-t1': () => [{ example: 0, rows: aboveAverage() }, { example: 1, rows: orderedInMarch() }, { example: 2, rows: averageSpend() }],
    'sql4-t2': () => [{ example: 0, rows: latestPerCustomer() }, { example: 2, rows: notInResult() }, { example: 3, rows: notExistsResult() }],
    'sql4-t3': () => [{ example: 0, rows: aboveAverageCustomers() }],
    'sql4-t4': () => [{ example: 0, rows: countToFive() }, { example: 1, rows: orgChartRows() }],
    'sql4-t5': () => [{ example: 0, rows: unionRows() }, { example: 2, rows: intersectRows() }, { example: 3, rows: exceptRows() }],
    'sql5-t1': () => [{ example: 0, rows: deptAverages() }],
    'sql5-t2': () => [{ example: 0, rows: rankings() }],
    'sql5-t3': () => [{ example: 0, rows: lagRows() }, { example: 1, rows: daysBetween() }],
    'sql5-t4': () => [{ example: 0, rows: runningTotals() }, { example: 2, rows: movingAverage() }, { example: 3, rows: rangeVsRows() }],
    'sql5-t5': () => [{ example: 0, rows: categoryShare() }, { example: 1, rows: quartiles() }],
};
