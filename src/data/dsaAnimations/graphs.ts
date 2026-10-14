import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import { C, arrow, cellAt, cells, circle, frame, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import { label, py } from './common';

// Graphs and Advanced Graphs. As in arrays.ts, every animation runs the
// algorithm on the lesson's traced inputs.

// ============ Drawing a small graph ============

type Point = [number, number];

/** An edge between two node circles, stopping at their rims, with an optional weight label. */
const edge = (id: string, a: Point, b: Point, o: { color?: string; weight?: string; r?: number; bend?: number; sw?: number; dash?: string } = {}): Shape[] => {
    const { color = C.dim, weight, r = 20, sw = 2, dash } = o;
    const d = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const ux = (b[0] - a[0]) / d;
    const uy = (b[1] - a[1]) / d;
    const out: Shape[] = [arrow(id, a[0] + ux * r, a[1] + uy * r, b[0] - ux * (r + 2), b[1] - uy * (r + 2), { stroke: color, sw, dash })];
    if (weight) {
        // The label sits beside the middle of the edge, on its left-hand side.
        const mx = (a[0] + b[0]) / 2 - uy * 13;
        const my = (a[1] + b[1]) / 2 + ux * 13;
        out.push(text(`${id}-w`, mx, my, weight, { size: 12, fill: color === C.dim ? C.grey : color, weight: 700, mono: true }));
    }
    return out;
};

const node = (id: string, at: Point, name: string, color: string, strength = 0.25): Shape =>
    circle(id, at[0], at[1], 20, { fill: tint(color, strength), stroke: color, sw: 2.5, text: name, size: 14, weight: 800, mono: true });

/** A small badge above-right of a node: a distance, a price or an in-degree. */
const badge = (id: string, at: Point, value: string, color: string, dy = -26): Shape =>
    rect(id, at[0] + 10, at[1] + dy - 9, Math.max(26, value.length * 7.5 + 10), 18, { rx: 9, fill: tint(color, 0.3), stroke: color, sw: 1.5, text: value, size: 11, weight: 700, mono: true });

// ============ Graphs ============

const runIslands = (rows: string[]) => {
    const grid = rows.map(r => [...r]);
    const R = grid.length;
    const Cn = grid[0].length;
    const islands: [number, number][][] = [];
    const sink = (r: number, c: number, into: [number, number][]) => {
        if (r < 0 || r >= R || c < 0 || c >= Cn || grid[r][c] !== '1') return;
        grid[r][c] = '0';
        into.push([r, c]);
        sink(r + 1, c, into);
        sink(r - 1, c, into);
        sink(r, c + 1, into);
        sink(r, c - 1, into);
    };
    for (let r = 0; r < R; r++) {
        for (let c = 0; c < Cn; c++) {
            if (grid[r][c] === '1') {
                const cellsOf: [number, number][] = [];
                sink(r, c, cellsOf);
                islands.push(cellsOf);
            }
        }
    }
    return { islands, result: islands.length };
};

const runCourseSchedule = (num: number, prerequisites: [number, number][]) => {
    const adj: number[][] = Array.from({ length: num }, () => []);
    const indegree = new Array<number>(num).fill(0);
    for (const [course, pre] of prerequisites) {
        adj[pre].push(course);
        indegree[course]++;
    }
    const queue = indegree.flatMap((d, i) => (d === 0 ? [i] : []));
    const steps: { take: number | null; order: number[]; queue: number[]; indegree: number[]; unlocked: number[] }[] = [
        { take: null, order: [], queue: [...queue], indegree: [...indegree], unlocked: [] },
    ];
    const order: number[] = [];
    while (queue.length) {
        const c = queue.shift()!;
        order.push(c);
        const unlocked: number[] = [];
        for (const next of adj[c]) {
            indegree[next]--;
            if (indegree[next] === 0) {
                queue.push(next);
                unlocked.push(next);
            }
        }
        steps.push({ take: c, order: [...order], queue: [...queue], indegree: [...indegree], unlocked });
    }
    const ok = order.length === num;
    return { steps, ok, result: ok ? `True — an order exists: ${py(order)}` : 'False' };
};

const graphs = (): AnimationSpec => {
    const rows = ['11000', '11000', '00100', '00011'];
    const run = runIslands(rows);
    const size = 36;
    const gx = 20;
    const gy = 42;
    const islandColors = [C.green, C.amber, C.pink];
    const islandOf = (r: number, c: number, shown: number[]) => {
        for (let k = 0; k < run.islands.length; k++) {
            const idx = run.islands[k].findIndex(([rr, cc]) => rr === r && cc === c);
            if (idx !== -1 && idx < shown[k]) return { k, idx };
        }
        return null;
    };
    /** shown[k]: how many cells of island k are flooded so far. */
    const grid = (shown: number[], cursor: [number, number] | null): Part[] => [
        cells('g', gx, gy, rows.length, rows[0].length, size,
            (r, c) => {
                const hit = islandOf(r, c, shown);
                return hit ? `#${hit.k + 1}` : rows[r][c] === '1' ? '1' : '';
            },
            (r, c) => {
                const hit = islandOf(r, c, shown);
                if (hit) return tint(islandColors[hit.k], 0.6);
                return rows[r][c] === '1' ? tint(C.yellow, 0.3) : tint(C.blue, 0.12);
            }),
        cursor && rect('cursor', cellAt(gx, gy, size, cursor[0], cursor[1]).x - 3, cellAt(gx, gy, size, cursor[0], cursor[1]).y - 3, size + 6, size + 6, { rx: 7, fill: 'none', stroke: C.ink, sw: 2.5 }),
        label('key', gx, 216, '1 = land not yet counted   blue = water', C.grey, { size: 11, mono: false }),
    ];
    const count = (n: number) => label('count', 244, 60, `islands = ${n}`, C.green, { size: 16 });
    const easy: Frame[] = [
        frame('Count the islands: groups of land (1) joined up, down, left or right. Scan the grid cell by cell, row by row.', [grid([0, 0, 0], null), count(0)]),
    ];
    run.islands.forEach((island, k) => {
        const [r0, c0] = island[0];
        const before = run.islands.map((_, j) => (j < k ? run.islands[j].length : 0));
        const at = (n: number) => before.map((v, j) => (j === k ? n : v));
        easy.push(frame(`The scan reaches land at (${r0},${c0}) that nobody has counted: a new island, number ${k + 1}. Now flood it, so it is never counted again.`, [grid(at(1), [r0, c0]), count(k + 1)]));
        if (island.length > 1) {
            island.slice(1).forEach(([r, c], j) => {
                easy.push(frame(j === 0
                    ? `Depth-first flood: from each flooded cell, try down, up, right, left. (${r},${c}) is land: it joins island #${k + 1}.`
                    : `(${r},${c}) is land too: it joins island #${k + 1}. Water and cells already flooded stop the flood.`, [grid(at(j + 2), [r, c]), count(k + 1)], 2600));
            });
        }
    });
    easy.push(frame(`Scan finished: ${run.result} islands. Flooded land turns to water, so each cell is visited a constant number of times: O(rows × cols).`, [grid(run.islands.map(i => i.length), null), count(run.result)]));

    // Course Schedule: Kahn's topological sort
    const pos: Point[] = [[52, 112], [178, 52], [178, 172], [304, 112]];
    const prereq: [number, number][] = [[1, 0], [2, 0], [3, 1], [3, 2]];
    const course = runCourseSchedule(4, prereq);
    const drawCourses = (step: (typeof course.steps)[number], points: Point[], edges: [number, number][], doneEdges: Set<string>): Part[] => [
        edges.map(([to, from]) => edge(`e${from}${to}`, points[from], points[to], { color: doneEdges.has(`${from}${to}`) ? C.faint : C.grey })),
        points.map((p, i) => {
            const taken = step.order.includes(i);
            const ready = step.queue.includes(i);
            const color = taken ? C.green : ready ? C.amber : C.violet;
            return [
                node(`c${i}`, p, String(i), color, taken ? 0.5 : 0.25),
                !taken && badge(`d${i}`, p, `in ${step.indegree[i]}`, step.indegree[i] === 0 ? C.amber : C.grey),
            ];
        }),
        label('queue', 14, 212, `ready: ${py(step.queue)}`, C.amber, { size: 13 }),
        label('order', 386, 212, `order: ${py(step.order)}`, C.green, { size: 13, anchor: 'end' }),
    ];
    const medium: Frame[] = [];
    const done = new Set<string>();
    course.steps.forEach(step => {
        if (step.take === null) {
            medium.push(frame('An arrow a → b means "take a before b". "in" counts how many prerequisites a course still needs. Courses needing none are ready: put them in a queue.', [drawCourses(step, pos, prereq, done)]));
            return;
        }
        const out = prereq.filter(([, from]) => from === step.take);
        out.forEach(([to, from]) => done.add(`${from}${to}`));
        medium.push(frame(out.length
            ? `Take course ${step.take}. Cross out its arrows: ${out.map(([to]) => to).join(' and ')} each need one fewer. ${step.unlocked.length ? `${step.unlocked.join(' and ')} ${step.unlocked.length > 1 ? 'are' : 'is'} now at 0: ready.` : 'Nothing new is ready yet.'}`
            : `Take course ${step.take}. It unlocks nothing — the queue is empty.`, [drawCourses(step, pos, prereq, done)]));
    });
    medium.push(frame(`All 4 courses were taken, so there is no cycle: ${course.result}. Each course and arrow is handled once: O(V + E).`, [drawCourses(course.steps[course.steps.length - 1], pos, prereq, done)]));

    // The same algorithm on a cycle, to show the False case.
    const cyclePos: Point[] = [[52, 112], [200, 52], [200, 172]];
    const cyclePre: [number, number][] = [[1, 0], [2, 1], [1, 2]];
    const cyc = runCourseSchedule(3, cyclePre);
    const cycDone = new Set<string>();
    const cycle: Frame[] = [];
    cyc.steps.forEach(step => {
        if (step.take === null) {
            cycle.push(frame('Now a broken plan: 1 needs 0 and 2, but 2 needs 1. Only course 0 needs nothing, so only 0 is ready.', [drawCourses(step, cyclePos, cyclePre, cycDone)]));
            return;
        }
        cyclePre.filter(([, from]) => from === step.take).forEach(([to, from]) => cycDone.add(`${from}${to}`));
        cycle.push(frame(`Take ${step.take}. Course 1 now needs one fewer — but it still waits for 2, and 2 waits for 1. Neither will ever reach 0.`, [drawCourses(step, cyclePos, cyclePre, cycDone)]));
    });
    cycle.push(frame(`The queue is empty but only ${cyc.steps[cyc.steps.length - 1].order.length} of 3 courses were taken. Courses stuck above 0 mean a cycle: ${cyc.result}.`, [
        drawCourses(cyc.steps[cyc.steps.length - 1], cyclePos, cyclePre, cycDone),
        label('stuck', 330, 112, 'stuck: 1 ⇄ 2', C.red, { size: 13, anchor: 'middle' }),
    ]));

    return {
        title: 'Graphs: flood what is connected; take what is ready',
        variants: [
            { label: 'Number of Islands', frames: easy },
            { label: 'Course Schedule', frames: medium },
            { label: 'With a cycle', frames: cycle },
        ],
    };
};

// ============ Advanced Graphs ============

const runDijkstra = (times: [number, number, number][], n: number, k: number) => {
    const adj = new Map<number, [number, number][]>();
    for (const [u, v, w] of times) adj.set(u, [...(adj.get(u) ?? []), [v, w]]);
    const dist = new Map<number, number>();
    let heap: [number, number][] = [[0, k]];
    const steps: { popped: [number, number]; stale: boolean; pushed: [number, number][]; heap: [number, number][]; dist: Map<number, number> }[] = [];
    // A sorted list stands in for the heap: it pops in the same order as heapq on (time, node).
    const byTimeThenNode = (a: [number, number], b: [number, number]) => a[0] - b[0] || a[1] - b[1];
    while (heap.length) {
        heap.sort(byTimeThenNode);
        const popped = heap.shift()!;
        const [d, u] = popped;
        if (dist.has(u)) {
            steps.push({ popped, stale: true, pushed: [], heap: [...heap], dist: new Map(dist) });
            continue;
        }
        dist.set(u, d);
        const pushed: [number, number][] = [];
        for (const [v, w] of adj.get(u) ?? []) {
            if (!dist.has(v)) {
                pushed.push([d + w, v]);
                heap.push([d + w, v]);
            }
        }
        heap = [...heap].sort(byTimeThenNode);
        steps.push({ popped, stale: false, pushed, heap: [...heap], dist: new Map(dist) });
    }
    const result = dist.size === n ? Math.max(...dist.values()) : -1;
    return { steps, result };
};

const runCheapestFlights = (n: number, flights: [number, number, number][], src: number, dst: number, k: number) => {
    let prices = new Array<number>(n).fill(Infinity);
    prices[src] = 0;
    const rounds: { used: [number, number, number][]; prices: number[] }[] = [{ used: [], prices: [...prices] }];
    for (let r = 0; r < k + 1; r++) {
        const tmp = [...prices];
        const used: [number, number, number][] = [];
        for (const [u, v, w] of flights) {
            if (prices[u] + w < tmp[v]) {
                tmp[v] = prices[u] + w;
                used.push([u, v, w]);
            }
        }
        prices = tmp;
        rounds.push({ used, prices: [...prices] });
    }
    return { rounds, result: prices[dst] === Infinity ? -1 : prices[dst] };
};

const advancedGraphs = (): AnimationSpec => {
    const times: [number, number, number][] = [[2, 1, 1], [2, 3, 1], [3, 4, 1], [1, 4, 3]];
    const dj = runDijkstra(times, 4, 2);
    const at: Record<number, Point> = { 2: [52, 112], 1: [178, 52], 3: [178, 172], 4: [304, 112] };
    const graph = (step: (typeof dj.steps)[number] | null, lit: [number, number][] = []): Part[] => [
        times.map(([u, v, w]) => edge(`e${u}${v}`, at[u], at[v], { weight: String(w), color: lit.some(([a, b]) => a === u && b === v) ? C.amber : C.dim })),
        [1, 2, 3, 4].map(id => {
            const settled = step?.dist.has(id);
            const current = step && step.popped[1] === id;
            const color = current ? (step.stale ? C.red : C.amber) : settled ? C.green : C.violet;
            return [
                node(`n${id}`, at[id], String(id), color, settled || current ? 0.5 : 0.22),
                settled && badge(`t${id}`, at[id], `t=${step!.dist.get(id)}`, C.green),
            ];
        }),
    ];
    const heapText = (heap: [number, number][]) => label('heap', 14, 222, `heap (time, node): ${heap.map(([d, u]) => `(${d}, ${u})`).join(' ') || 'empty'}`, C.violet, { size: 12 });
    const easy: Frame[] = [
        frame('A signal starts at node 2. How long until every node hears it? Dijkstra: always settle the closest node not yet settled. A heap keeps the closest on top.', [graph(null), heapText([[0, 2]])]),
    ];
    dj.steps.forEach(step => {
        const [d, u] = step.popped;
        const caption = step.stale
            ? `Pop (${d}, ${u}): node ${u} is already settled at a shorter time. This old entry is stale — skip it.`
            : step.pushed.length
                ? `Pop (${d}, ${u}): the closest unsettled node. Its time is final: ${d}. Push its neighbours: ${step.pushed.map(([t, v]) => `${v} at ${d} + ${t - d} = ${t}`).join(', ')}.`
                : `Pop (${d}, ${u}): settle node ${u} at time ${d}. No unsettled neighbours to push.`;
        easy.push(frame(caption, [graph(step, step.pushed.map(([, v]) => [u, v])), heapText(step.heap)]));
    });
    easy.push(frame(`Every node is settled. The last to hear the signal is at time ${dj.result}: the answer. Node 4 was pushed twice (4 via node 1, 2 via node 3) — the heap handed out the cheaper one first.`, [graph({ ...dj.steps[dj.steps.length - 1], popped: [-1, -1] }), heapText([])]));

    // Cheapest Flights Within K Stops: Bellman-Ford, k + 1 rounds
    const flights: [number, number, number][] = [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]];
    const k = 1;
    const bf = runCheapestFlights(4, flights, 0, 3, k);
    const fat: Record<number, Point> = { 0: [52, 112], 1: [178, 46], 2: [178, 178], 3: [324, 112] };
    const priceText = (p: number) => (p === Infinity ? '∞' : `£${p}`);
    const flightGraph = (prices: number[], used: [number, number, number][], extra: Part[] = []): Part[] => [
        flights.map(([u, v, w]) => edge(`f${u}${v}`, fat[u], fat[v], { weight: String(w), color: used.some(([a, b]) => a === u && b === v) ? C.amber : C.dim })),
        [0, 1, 2, 3].map(id => [
            node(`p${id}`, fat[id], String(id), id === 0 ? C.cyan : id === 3 ? C.pink : C.violet, used.some(([, b]) => b === id) ? 0.55 : 0.22),
            badge(`b${id}`, fat[id], priceText(prices[id]), prices[id] === Infinity ? C.grey : C.green),
        ]),
        label('prices', 14, 222, `prices = [${prices.map(priceText).join(', ')}]`, C.green, { size: 13 }),
        extra,
    ];
    const medium: Frame[] = [
        frame(`Cheapest price from 0 to 3 with at most ${k} stop. Round r allows one more flight. Start: only the source is free.`, [flightGraph(bf.rounds[0].prices, [])]),
    ];
    bf.rounds.slice(1).forEach((round, r) => {
        const before = bf.rounds[r].prices;
        medium.push(frame(r === 0
            ? `Round 1 (one flight, 0 stops). Relax every flight using LAST round's prices, written into a copy: 0→1 costs 0 + 100 = £100. 1→2 can't use that £100 yet — it was only found this round.`
            : `Round ${r + 1} (two flights, ${r} stop). From last round's prices: ${round.used.map(([u, v, w]) => `${u}→${v}: ${before[u]} + ${w} = ${before[u] + w}`).join('; ')}.`, [flightGraph(round.prices, round.used)], 7000));
    });
    medium.push(frame(`Stop after k + 1 = ${k + 1} rounds. Answer: £${bf.result} (0 → 1 → 3). The route 0 → 1 → 2 → 3 costs only £400, but it needs 2 stops, which is not allowed.`, [
        flightGraph(bf.rounds[bf.rounds.length - 1].prices, [[0, 1, 100], [1, 3, 600]]),
        label('note', 386, 200, '£400 route needs 2 stops ✗', C.red, { size: 12, anchor: 'end', mono: false }),
    ], 8000));

    return {
        title: 'Weighted graphs: settle the closest first, or relax in rounds',
        variants: [
            { label: 'Network Delay (Dijkstra)', frames: easy },
            { label: 'Cheapest Flights (K stops)', frames: medium },
        ],
    };
};

export const graphsAnimations: Record<string, () => AnimationSpec> = {
    graphs,
    'advanced-graphs': advancedGraphs,
};

export const graphsResults: Record<string, { easy: () => string; medium: () => string }> = {
    graphs: { easy: () => py(runIslands(['11000', '11000', '00100', '00011']).result), medium: () => runCourseSchedule(4, [[1, 0], [2, 0], [3, 1], [3, 2]]).result },
    'advanced-graphs': {
        easy: () => py(runDijkstra([[2, 1, 1], [2, 3, 1], [3, 4, 1], [1, 4, 3]], 4, 2).result),
        medium: () => py(runCheapestFlights(4, [[0, 1, 100], [1, 2, 100], [2, 0, 100], [1, 3, 600], [2, 3, 200]], 0, 3, 1).result),
    },
};
