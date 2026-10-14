import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import { C, arrow, frame, line, path, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import { DIM, PLAIN, cellRow, cellX, indexRow, label, py, type Look } from './common';

// 1-D and 2-D Dynamic Programming, Greedy, Intervals, Math & Geometry and Bit
// Manipulation. As in arrays.ts, every animation runs the algorithm on the
// lesson's traced inputs.

const HIT: Look = [C.green, 0.5];
const LOOK_AT: Look = [C.amber, 0.5];
const DONE: Look = [C.green, 0.22];

/** A curved arrow from the top of one cell to the top of another, rising `lift` above them. */
const hop = (id: string, x1: number, x2: number, y: number, lift: number, color: string): Shape =>
    path(id, [[x1, y], [x1 + (x2 - x1) * 0.2, y - lift], [x1 + (x2 - x1) * 0.8, y - lift], [x2, y - 2]], { stroke: color, sw: 2, arrow: true });

// ============ 1-D Dynamic Programming ============

const runClimb = (n: number) => {
    const dp = [1, 1];
    for (let i = 2; i <= n; i++) dp.push(dp[i - 1] + dp[i - 2]);
    return { dp, result: dp[n] };
};

const runRob = (nums: number[]) => {
    const best: number[] = [];
    const steps: { skip: number; rob: number; best: number }[] = [];
    nums.forEach((money, i) => {
        const skip = i >= 1 ? best[i - 1] : 0;
        const rob = (i >= 2 ? best[i - 2] : 0) + money;
        best.push(Math.max(skip, rob));
        steps.push({ skip, rob, best: best[i] });
    });
    // Walk back to see which houses the best total robbed.
    const robbed: number[] = [];
    for (let i = nums.length - 1; i >= 0;) {
        if ((i >= 1 ? best[i - 1] : 0) === best[i]) i -= 1;
        else {
            robbed.push(i);
            i -= 2;
        }
    }
    return { steps, best, robbed: robbed.reverse(), result: best[best.length - 1] };
};

const oneD = (): AnimationSpec => {
    const n = 5;
    const climb = runClimb(n);
    const x0 = 34;
    const cell = { w: 46, h: 40, gap: 10, size: 15 };
    const row = (upTo: number, at: number | null) =>
        cellRow('dp', x0, 110, climb.dp.map((v, i) => (i <= upTo ? v : '?')), i => (i === at ? LOOK_AT : i <= upTo ? DONE : DIM), cell);
    const head: Part[] = [
        indexRow('ix', x0, 166, n + 1, cell),
        label('ix-t', 14, 186, 'step i:  dp[i] = number of ways to reach step i', C.grey, { size: 11, mono: false }),
    ];
    const easy: Frame[] = [
        frame('How many ways to climb 5 steps, taking 1 or 2 at a time? Your last move onto step i came from step i − 1 or step i − 2 — so ways(i) = ways(i − 1) + ways(i − 2).', [row(-1, null), head]),
        frame('Base cases: there is 1 way to stand at step 0 (do nothing) and 1 way to reach step 1 (one small step).', [row(1, null), head]),
    ];
    for (let i = 2; i <= n; i++) {
        easy.push(frame(`dp[${i}] = dp[${i - 1}] + dp[${i - 2}] = ${climb.dp[i - 1]} + ${climb.dp[i - 2]} = ${climb.dp[i]}. Both answers were already saved, so this costs one addition.`, [
            row(i, i), head,
            hop('h1', cellX(x0, i - 1, cell), cellX(x0, i, cell) - 6, 106, 26, C.cyan),
            hop('h2', cellX(x0, i - 2, cell), cellX(x0, i, cell) + 6, 106, 52, C.violet),
            label('sum', 200, 34, `${climb.dp[i - 1]} + ${climb.dp[i - 2]} = ${climb.dp[i]}`, C.amber, { size: 15, anchor: 'middle' }),
        ]));
    }
    easy.push(frame(`Answer: ${climb.result} ways. Each step is worked out once from saved answers: O(n), instead of the O(2ⁿ) of plain recursion that keeps re-solving the same steps.`, [
        row(n, null), head, label('sum', 200, 34, `dp[${n}] = ${climb.result}`, C.green, { size: 15, anchor: 'middle' }),
    ]));

    // House Robber
    const nums = [2, 7, 9, 3, 1];
    const rob = runRob(nums);
    const hx = 30;
    const hcell = { w: 56, h: 36, gap: 14, size: 14 };
    const houses = (at: number | null, robbed: number[] = []) => [
        label('h-t', 14, 30, 'money in each house', C.grey, { size: 11, mono: false }),
        cellRow('house', hx, 40, nums.map(v => `£${v}`), i => (robbed.includes(i) ? HIT : i === at ? LOOK_AT : PLAIN), hcell),
    ];
    const bestRow = (upTo: number, at: number | null) => [
        label('b-t', 14, 126, 'best total up to here', C.grey, { size: 11, mono: false }),
        cellRow('best', hx, 136, rob.best.map((v, i) => (i <= upTo ? v : '?')), i => (i === at ? LOOK_AT : i <= upTo ? DONE : DIM), hcell),
    ];
    const medium: Frame[] = [
        frame('Rob houses for the most money, but never two next door. At each house there are only two choices: skip it, or rob it and give up the one before.', [houses(null), bestRow(-1, null)]),
    ];
    rob.steps.forEach((s, i) => {
        const robWins = s.rob > s.skip;
        medium.push(frame(`House ${i} (£${nums[i]}). Skip: keep ${s.skip}. Rob: ${i >= 2 ? `best two back (${rob.best[i - 2]})` : '0'} + ${nums[i]} = ${s.rob}. Keep the bigger: ${s.best}.`, [
            houses(i), bestRow(i, i),
            label('skip', 30, 196, `skip: ${s.skip}`, robWins ? C.grey : C.green, { size: 14 }),
            label('rob', 200, 196, `rob: ${s.rob}`, robWins ? C.green : C.grey, { size: 14 }),
        ]));
    });
    medium.push(frame(`Answer: £${rob.result}, from houses ${rob.robbed.join(', ')} (${rob.robbed.map(i => nums[i]).join(' + ')}). Each house looked back only two places, so O(n) time — and O(1) space if you keep just two numbers.`, [
        houses(null, rob.robbed), bestRow(nums.length - 1, null),
    ]));

    return {
        title: '1-D DP: each answer is built from answers already saved',
        variants: [
            { label: 'Climbing Stairs', frames: easy },
            { label: 'House Robber', frames: medium },
        ],
    };
};

// ============ 2-D Dynamic Programming ============

const runUniquePaths = (m: number, n: number) => {
    const dp = Array.from({ length: m }, () => new Array<number>(n).fill(1));
    const order: [number, number][] = [];
    for (let r = 1; r < m; r++) {
        for (let c = 1; c < n; c++) {
            dp[r][c] = dp[r - 1][c] + dp[r][c - 1];
            order.push([r, c]);
        }
    }
    return { dp, order, result: dp[m - 1][n - 1] };
};

const runLcs = (a: string, b: string) => {
    const dp = Array.from({ length: a.length + 1 }, () => new Array<number>(b.length + 1).fill(0));
    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
        }
    }
    // The matched letters, read back from the corner.
    const matches: [number, number][] = [];
    for (let i = a.length, j = b.length; i > 0 && j > 0;) {
        if (a[i - 1] === b[j - 1]) {
            matches.push([i, j]);
            i--;
            j--;
        } else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
        else j--;
    }
    return { dp, matches: matches.reverse(), result: dp[a.length][b.length] };
};

const twoD = (): AnimationSpec => {
    const up = runUniquePaths(3, 3);
    const size = 52;
    const gx = 40;
    const gy = 36;
    const at = (r: number, c: number) => ({ x: gx + c * (size + 6), y: gy + r * (size + 6) });
    const grid = (filled: Set<string>, current: [number, number] | null, showBase = true): Part[] =>
        up.dp.map((rowValues, r) => rowValues.map((v, c) => {
            const key = `${r},${c}`;
            const isCur = current && current[0] === r && current[1] === c;
            const base = showBase && (r === 0 || c === 0);
            const [color, strength]: Look = isCur ? LOOK_AT : filled.has(key) || base ? (r === 2 && c === 2 && filled.has(key) ? HIT : DONE) : DIM;
            const { x, y } = at(r, c);
            return rect(`u${key}`, x, y, size, size, {
                rx: 7, fill: tint(color, strength), stroke: strength <= 0.08 ? C.faint : color, sw: 2,
                text: filled.has(key) || base || isCur ? String(v) : '?', textColor: C.ink, size: 16, weight: 800, mono: true,
            });
        }));
    const corners: Part = [
        label('start', at(0, 0).x + size / 2, gy - 12, 'start', C.cyan, { size: 11, anchor: 'middle', mono: false }),
        label('end', at(2, 2).x + size / 2, at(2, 2).y + size + 14, 'finish', C.pink, { size: 11, anchor: 'middle', mono: false }),
    ];
    const filled = new Set<string>();
    const easy: Frame[] = [
        frame('Count the paths from the top-left to the bottom-right of a 3 × 3 grid, moving only right or down. Each cell will hold the number of paths that reach it.', [grid(filled, null, false), corners]),
        frame('The top row and the left column can each be reached only one way (straight along the edge): 1.', [grid(filled, null), corners]),
    ];
    up.order.forEach(([r, c]) => {
        filled.add(`${r},${c}`);
        const fromUp = up.dp[r - 1][c];
        const fromLeft = up.dp[r][c - 1];
        const cell = at(r, c);
        const paths = (k: number) => `${k} ${k === 1 ? 'path' : 'paths'}`;
        easy.push(frame(`Cell (${r},${c}): you arrive from above (${paths(fromUp)}) or from the left (${paths(fromLeft)}): ${fromUp} + ${fromLeft} = ${up.dp[r][c]}.`, [
            grid(new Set(filled), [r, c]), corners,
            arrow('fromUp', cell.x + size / 2, cell.y - 18, cell.x + size / 2, cell.y + 10, { stroke: C.cyan, sw: 3 }),
            arrow('fromLeft', cell.x - 18, cell.y + size / 2, cell.x + 10, cell.y + size / 2, { stroke: C.violet, sw: 3 }),
            label('calc', 238, 80, `${fromUp} + ${fromLeft} = ${up.dp[r][c]}`, C.amber, { size: 16 }),
        ]));
    });
    easy.push(frame(`Answer: ${up.result} paths. Each cell is filled once from two saved neighbours: O(m × n).`, [grid(filled, null), corners, label('calc', 238, 80, `paths = ${up.result}`, C.green, { size: 16 })]));

    // Longest Common Subsequence
    const A = 'abcde';
    const B = 'ace';
    const lcs = runLcs(A, B);
    const cw = 34;
    const ch = 28;
    const tx = 64;
    const ty = 40;
    const cellPos = (i: number, j: number) => ({ x: tx + j * cw, y: ty + i * ch });
    const table = (rowsDone: number, litRow: number | null, path: [number, number][] = []): Part[] => [
        // Column headings: '' then the letters of B; row headings: '' then the letters of A.
        ['', ...B].map((letter, j) => text(`hb${j}`, tx + j * cw + cw / 2, ty - 12, letter ? `'${letter}'` : '""', { size: 11, fill: C.pink, weight: 700, mono: true })),
        ['', ...A].map((letter, i) => text(`ha${i}`, tx - 18, ty + i * ch + ch / 2, letter ? `'${letter}'` : '""', { size: 11, fill: C.cyan, weight: 700, mono: true })),
        lcs.dp.map((rowValues, i) => rowValues.map((v, j) => {
            const shown = i === 0 || j === 0 || i <= rowsDone;
            const match = i > 0 && j > 0 && A[i - 1] === B[j - 1];
            const onPath = path.some(([pi, pj]) => pi === i && pj === j);
            const [color, strength]: Look = onPath ? HIT : i === litRow && match ? HIT : i === litRow ? LOOK_AT : shown ? [C.blue, 0.14] : DIM;
            const { x, y } = cellPos(i, j);
            return rect(`l${i}-${j}`, x, y, cw - 3, ch - 3, {
                rx: 4, fill: tint(color, strength), stroke: strength <= 0.08 ? C.faint : color, sw: 1.2,
                text: shown ? String(v) : '', size: 12, weight: 700, mono: true,
            });
        })),
    ];
    const note = (lines: string[], color: string = C.ink): Part[] => lines.map((value, k) => label(`note${k}`, 214, 60 + k * 22, value, k === 0 ? color : C.grey, { size: 12, mono: k !== 0 ? false : true }));
    const medium: Frame[] = [
        frame('Longest common subsequence of \'abcde\' and \'ace\'. Cell (i, j) holds the answer for the first i letters of one and the first j of the other. Row and column 0 are empty strings: 0.', [
            table(0, null), note(['dp[i][j]', 'letters equal → diagonal + 1', 'different → max(up, left)']),
        ]),
    ];
    for (let i = 1; i <= A.length; i++) {
        const matches = [...B].flatMap((letter, j) => (letter === A[i - 1] ? [j + 1] : []));
        const caption = matches.length
            ? `Row '${A[i - 1]}': it matches '${B[matches[0] - 1]}', so that cell is the diagonal (up-left) + 1 = ${lcs.dp[i][matches[0]]}. Every other cell copies the bigger of up and left.`
            : `Row '${A[i - 1]}': it matches no letter of 'ace', so every cell copies the bigger of up and left. Nothing new is gained.`;
        medium.push(frame(caption, [
            table(i, i),
            matches.length > 0 && rect('diag', cellPos(i - 1, matches[0] - 1).x - 3, cellPos(i - 1, matches[0] - 1).y - 3, cw + 3, ch + 3, { rx: 6, fill: 'none', stroke: C.green, sw: 2.5, dash: '4 3' }),
            note(matches.length ? [`'${A[i - 1]}' = '${B[matches[0] - 1]}' → ${lcs.dp[i - 1][matches[0] - 1]} + 1`, 'dashed = answer without', 'both letters; add 1'] : [`'${A[i - 1]}' matches nothing`, 'each cell = max(up, left)'], matches.length ? C.green : C.amber),
        ]));
    }
    medium.push(frame(`Answer: the corner, ${lcs.result}. Reading back along the diagonal steps gives the letters: '${lcs.matches.map(([i]) => A[i - 1]).join('')}'. O(m × n) cells, each filled once.`, [
        table(A.length, null, lcs.matches), note([`LCS = ${lcs.result}  ('${lcs.matches.map(([i]) => A[i - 1]).join('')}')`], C.green),
    ]));

    return {
        title: '2-D DP: fill a table where each cell uses cells already filled',
        width: 400,
        height: 240,
        variants: [
            { label: 'Unique Paths', frames: easy },
            { label: 'Longest Common Subsequence', frames: medium },
        ],
    };
};

// ============ Greedy ============

const runKadane = (nums: number[]) => {
    let running = 0;
    let best = -Infinity;
    let start = 0;
    let bestRange: [number, number] = [0, 0];
    const steps: { restart: boolean; running: number; best: number; start: number }[] = [];
    nums.forEach((x, i) => {
        const restart = i > 0 && running < 0;
        if (i === 0 || restart) {
            running = x;
            start = i;
        } else running += x;
        if (running > best) {
            best = running;
            bestRange = [start, i];
        }
        steps.push({ restart, running, best, start });
    });
    return { steps, bestRange, result: best };
};

const runJump = (nums: number[]) => {
    let farthest = 0;
    const steps: { i: number; farthest: number; stuck: boolean }[] = [];
    for (let i = 0; i < nums.length; i++) {
        if (i > farthest) {
            steps.push({ i, farthest, stuck: true });
            return { steps, result: false };
        }
        farthest = Math.max(farthest, i + nums[i]);
        steps.push({ i, farthest, stuck: false });
    }
    return { steps, result: true };
};

const greedy = (): AnimationSpec => {
    const nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4];
    const kad = runKadane(nums);
    const slot = 40;
    const bx = (i: number) => 22 + i * slot;
    const base = 112;
    const unit = 13;
    const barsOf = (at: number | null, range: [number, number] | null, best = false): Part[] => [
        line('zero', 16, base, 384, base, { stroke: C.dim, sw: 1.5 }),
        nums.map((x, i) => {
            const inRun = range && i >= range[0] && i <= range[1];
            const color = i === at ? C.amber : inRun ? (best ? C.green : C.cyan) : x >= 0 ? C.grey : C.grey;
            return rect(`k${i}`, bx(i) + 6, x >= 0 ? base - x * unit : base, slot - 12, Math.max(2, Math.abs(x) * unit), { rx: 3, fill: tint(color, inRun || i === at ? 0.75 : 0.3), stroke: 'none' });
        }),
        nums.map((x, i) => text(`kv${i}`, bx(i) + slot / 2, x >= 0 ? base + 12 : base - 10, String(x), { size: 12, fill: C.ink, weight: 700, mono: true })),
        range && rect('run', bx(range[0]) + 2, 182, (range[1] - range[0] + 1) * slot - 4, 6, { rx: 3, fill: best ? C.green : C.cyan }),
    ];
    const easy: Frame[] = [
        frame('Find the contiguous stretch with the biggest sum. Walk once, keeping a running sum of the current stretch.', [barsOf(null, null)]),
    ];
    kad.steps.forEach((s, i) => {
        const x = nums[i];
        const caption = i === 0
            ? `Start with ${x}: running = ${x}, best = ${s.best}.`
            : s.restart
                ? `The running sum before ${x} was negative — carrying it can only drag ${x} down. Drop it and start fresh at ${x}: running = ${s.running}.${s.best === s.running ? ` New best: ${s.best}.` : ''}`
                : `Add ${x}: running = ${s.running}. ${s.running === s.best && s.best > kad.steps[i - 1].best ? `New best: ${s.best}.` : `Best stays ${s.best}.`}`;
        easy.push(frame(caption, [
            barsOf(i, [s.start, i]),
            label('running', 16, 210, `running = ${s.running}`, C.cyan, { size: 14 }),
            label('best', 384, 210, `best = ${s.best}`, C.green, { size: 14, anchor: 'end' }),
        ], i >= 4 ? 2600 : undefined));
    });
    easy.push(frame(`Answer: ${kad.result}, from ${py(nums.slice(kad.bestRange[0], kad.bestRange[1] + 1))}. The greedy rule — "a negative running sum never helps, drop it" — gives O(n) instead of checking every stretch.`, [
        barsOf(null, kad.bestRange, true), label('best', 384, 210, `best = ${kad.result}`, C.green, { size: 15, anchor: 'end' }),
    ]));

    // Jump Game
    const jumps = [3, 2, 1, 0, 4];
    const jump = runJump(jumps);
    const jx = 40;
    const jcell = { w: 52, h: 40, gap: 16, size: 15 };
    const jumpRow = (at: number | null, farthest: number, stuck = false) =>
        cellRow('j', jx, 120, jumps, i => (i === at ? (stuck ? [C.red, 0.5] : LOOK_AT) : i <= farthest ? [C.green, 0.2] : DIM), jcell);
    const reach = (farthest: number, color: string): Part[] => [
        rect('reach', jx - 4, 186, cellX(jx, farthest, jcell) + jcell.w / 2 - jx + 8, 8, { rx: 4, fill: color }),
        label('reach-t', jx - 4, 210, `can reach up to index ${farthest}`, color, { size: 12 }),
    ];
    const medium: Frame[] = [
        frame('Each number is the longest jump from that spot. Can you reach the last index? Greedy: just track the farthest index you can reach so far.', [jumpRow(null, 0), indexRow('ix', jx, 172, jumps.length, jcell), reach(0, C.green)]),
    ];
    jump.steps.forEach(s => {
        if (s.stuck) {
            medium.push(frame(`Index ${s.i} is past the farthest reach (${s.farthest}). Every route gets stuck on the 0 at index 3. Answer: ${py(jump.result)}.`, [
                jumpRow(s.i, s.farthest, true), indexRow('ix', jx, 172, jumps.length, jcell), reach(s.farthest, C.red),
            ]));
            return;
        }
        const x = jumps[s.i];
        medium.push(frame(`Index ${s.i} can jump up to ${x}, reaching index ${s.i + x}. Farthest = max(${s.i === 0 ? 0 : jump.steps[s.i - 1].farthest}, ${s.i + x}) = ${s.farthest}.`, [
            jumpRow(s.i, s.farthest), indexRow('ix', jx, 172, jumps.length, jcell), reach(s.farthest, C.green),
            x > 0 && hop('jump', cellX(jx, s.i, jcell), cellX(jx, s.i + x, jcell), 116, 46, C.amber),
        ]));
    });
    medium.push(frame('No need to try every route: one pass, O(n). If the farthest reach ever gets to the last index, the answer is True instead.', [
        jumpRow(null, 3), indexRow('ix', jx, 172, jumps.length, jcell), reach(3, C.red),
    ]));

    return {
        title: 'Greedy: make the locally best choice, and know why it is safe',
        variants: [
            { label: 'Maximum Subarray (Kadane)', frames: easy },
            { label: 'Jump Game', frames: medium },
        ],
    };
};

// ============ Intervals ============

const runMeetingRooms = (intervals: [number, number][]) => {
    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
    for (let i = 1; i < sorted.length; i++) {
        if (sorted[i][0] < sorted[i - 1][1]) return { sorted, clash: [i - 1, i] as [number, number], result: false };
    }
    return { sorted, clash: null, result: true };
};

const runMerge = (intervals: [number, number][]) => {
    const sorted = [...intervals].sort((a, b) => a[0] - b[0]);
    const merged: [number, number][] = [];
    const steps: { at: number; overlap: boolean; merged: [number, number][] }[] = [];
    sorted.forEach(([s, e], at) => {
        const last = merged[merged.length - 1];
        const overlap = last !== undefined && s <= last[1];
        if (overlap) last[1] = Math.max(last[1], e);
        else merged.push([s, e]);
        steps.push({ at, overlap, merged: merged.map(m => [...m] as [number, number]) });
    });
    return { sorted, steps, result: merged };
};

const intervals = (): AnimationSpec => {
    const meetings: [number, number][] = [[0, 30], [5, 10], [15, 20]];
    const mr = runMeetingRooms(meetings);
    const scale = (max: number) => (t: number) => 30 + (t / max) * 340;
    const tx = scale(30);
    const axis = (id: string, max: number, ticks: number[], y: number, sx: (t: number) => number): Part[] => [
        line(`${id}-axis`, sx(0), y, sx(max), y, { stroke: C.dim, sw: 1.5 }),
        ticks.map(t => text(`${id}-t${t}`, sx(t), y + 12, String(t), { size: 11, fill: C.dim, mono: true })),
    ];
    /** A bar from start to end; its label goes inside when it fits, otherwise just after it. */
    const meetingBar = (id: string, [s, e]: [number, number], y: number, color: string, sx: (t: number) => number, strength = 0.4): Part[] => {
        const name = `[${s}, ${e}]`;
        const w = sx(e) - sx(s);
        const fits = name.length * 12 * 0.6 + 8 <= w;
        return [
            rect(id, sx(s), y, w, 24, { rx: 6, fill: tint(color, strength), stroke: color, sw: 1.5, ...(fits ? { text: name, size: 12, weight: 700, mono: true } : {}) }),
            !fits && text(`${id}-l`, sx(e) + 5, y + 12, name, { size: 12, fill: C.ink, weight: 700, mono: true, anchor: 'start' }),
        ];
    };
    const idOf = (m: [number, number]) => `m${meetings.findIndex(x => x[0] === m[0] && x[1] === m[1])}`;
    const easy: Frame[] = [
        frame('Can one person attend every meeting? Only if no two meetings overlap.', [axis('a', 30, [0, 5, 10, 15, 20, 25, 30], 190, tx), meetings.map((m, i) => meetingBar(`m${i}`, m, 50 + i * 40, C.blue, tx))]),
        frame('Sort by start time. Then any clash must be between neighbours in the sorted order, so one pass of neighbour checks is enough.', [axis('a', 30, [0, 5, 10, 15, 20, 25, 30], 190, tx), mr.sorted.map((m, i) => meetingBar(idOf(m), m, 50 + i * 40, C.blue, tx))]),
    ];
    if (mr.clash) {
        const [a, b] = mr.clash;
        const [, endA] = mr.sorted[a];
        const [startB] = mr.sorted[b];
        easy.push(frame(`[${mr.sorted[a].join(', ')}] then [${mr.sorted[b].join(', ')}]: the second starts at ${startB}, before the first ends at ${endA} (${startB} < ${endA}). A clash: answer False.`, [
            axis('a', 30, [0, 5, 10, 15, 20, 25, 30], 190, tx),
            mr.sorted.map((m, i) => meetingBar(idOf(m), m, 50 + i * 40, i === a || i === b ? C.red : C.blue, tx, i === a || i === b ? 0.5 : 0.2)),
            rect('overlap', tx(startB), 44, tx(Math.min(endA, mr.sorted[b][1])) - tx(startB), 76, { rx: 4, fill: tint(C.red, 0.25), stroke: C.red, sw: 1.5, dash: '4 3' }),
        ]));
    }
    easy.push(frame(`Answer: ${py(mr.result)}. Sorting costs O(n log n); the check after it is one pass.`, [
        axis('a', 30, [0, 5, 10, 15, 20, 25, 30], 190, tx), mr.sorted.map((m, i) => meetingBar(idOf(m), m, 50 + i * 40, i < 2 ? C.red : C.blue, tx, 0.3)),
        label('ans', 370, 170, `return ${py(mr.result)}`, C.red, { size: 14, anchor: 'end' }),
    ]));

    // Merge Intervals
    const input: [number, number][] = [[1, 3], [8, 10], [2, 6], [15, 18]];
    const mg = runMerge(input);
    const sx = scale(20);
    const ticks = [0, 5, 10, 15, 20];
    const inId = (m: [number, number]) => `i${input.findIndex(x => x[0] === m[0] && x[1] === m[1])}`;
    const sortedBars = (at: number | null, done: number) => mg.sorted.map((m, i) => meetingBar(inId(m), m, 38 + i * 30, i === at ? C.amber : C.blue, sx, i === at ? 0.55 : i < done ? 0.12 : 0.35));
    const mergedBars = (merged: [number, number][], fresh: number | null) => [
        label('m-t', 30, 172, 'merged', C.green, { size: 12, mono: false }),
        merged.map((m, i) => meetingBar(`out${i}`, m, 180, C.green, sx, i === fresh ? 0.6 : 0.3)),
    ];
    const medium: Frame[] = [
        frame('Merge overlapping intervals. They arrive in no particular order.', [axis('b', 20, ticks, 222, sx), input.map((m, i) => meetingBar(`i${i}`, m, 38 + i * 30, C.blue, sx))]),
        frame('Sort by start. Now an interval can only overlap the one just before it (or the merged block that one joined).', [axis('b', 20, ticks, 222, sx), sortedBars(null, 0), mergedBars([], null)]),
    ];
    mg.steps.forEach(step => {
        const [s, e] = mg.sorted[step.at];
        const last = step.merged[step.merged.length - 1];
        const prevEnd = step.at > 0 ? mg.steps[step.at - 1].merged[mg.steps[step.at - 1].merged.length - 1][1] : null;
        const caption = step.at === 0
            ? `[${s}, ${e}] is the first: start the merged list with it.`
            : step.overlap
                ? `[${s}, ${e}] starts at ${s} ≤ ${prevEnd}, the end of the last merged block: they overlap. Stretch that block's end to max(${prevEnd}, ${e}) = ${last[1]}.`
                : `[${s}, ${e}] starts at ${s} > ${prevEnd}: no overlap. Add it as a new block.`;
        medium.push(frame(caption, [axis('b', 20, ticks, 222, sx), sortedBars(step.at, step.at), mergedBars(step.merged, step.merged.length - 1)]));
    });
    medium.push(frame(`Answer: ${py(mg.result)}. Sort, then one pass comparing each interval with the last merged block: O(n log n).`, [axis('b', 20, ticks, 222, sx), sortedBars(null, 4), mergedBars(mg.result, null)]));

    return {
        title: 'Intervals: sort by start, then only neighbours can overlap',
        variants: [
            { label: 'Meeting Rooms', frames: easy },
            { label: 'Merge Intervals', frames: medium },
        ],
    };
};

// ============ Math & Geometry ============

const runPlusOne = (digits: number[]) => {
    const d = [...digits];
    const steps: { i: number; carry: boolean; digits: number[] }[] = [];
    for (let i = d.length - 1; i >= 0; i--) {
        if (d[i] < 9) {
            d[i] += 1;
            steps.push({ i, carry: false, digits: [...d] });
            return { steps, result: d };
        }
        d[i] = 0;
        steps.push({ i, carry: true, digits: [...d] });
    }
    return { steps, result: [1, ...d] };
};

const runRotate = (matrix: number[][]) => {
    const m = matrix.map(r => [...r]);
    const n = m.length;
    const swaps: { a: [number, number]; b: [number, number]; after: number[][] }[] = [];
    for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
            [m[i][j], m[j][i]] = [m[j][i], m[i][j]];
            swaps.push({ a: [i, j], b: [j, i], after: m.map(r => [...r]) });
        }
    }
    const transposed = m.map(r => [...r]);
    const reversals: number[][][] = [];
    for (let i = 0; i < n; i++) {
        m[i].reverse();
        reversals.push(m.map(r => [...r]));
    }
    return { swaps, transposed, reversals, result: m };
};

const mathGeometry = (): AnimationSpec => {
    const digits = [1, 9, 9];
    const plus = runPlusOne(digits);
    const dx = 120;
    const dcell = { w: 48, h: 48, gap: 10, size: 20 };
    const digitRow = (values: number[], at: number | null, changed: number[]) =>
        cellRow('d', dx, 90, values, i => (i === at ? LOOK_AT : changed.includes(i) ? HIT : PLAIN), dcell);
    const easy: Frame[] = [
        frame('Add one to the number 199, stored as a list of digits. Work from the last digit, just like adding by hand.', [digitRow(digits, null, []), label('plus', 200, 50, '199 + 1', C.ink, { size: 16, anchor: 'middle' })]),
    ];
    plus.steps.forEach((s, k) => {
        const changed = plus.steps.slice(0, k + 1).map(t => t.i);
        easy.push(frame(s.carry
            ? `Index ${s.i}: 9 + 1 = 10. Write 0 and carry 1 to the digit on the left.`
            : `Index ${s.i}: ${digits[s.i]} + 1 = ${s.digits[s.i]}. No carry, so stop — the digits further left don't change.`, [
            digitRow(s.digits, s.i, changed),
            s.carry && s.i > 0 && [
                hop('carry', cellX(dx, s.i, dcell), cellX(dx, s.i - 1, dcell), 86, 30, C.amber),
                label('carry-t', cellX(dx, s.i, dcell) - 29, 40, '+1', C.amber, { size: 13, anchor: 'middle' }),
            ],
        ]));
    });
    easy.push(frame(`Answer: ${py(plus.result)}. Only the trailing 9s change. If every digit is 9 (like 999), all become 0 and a 1 goes in front: [1, 0, 0, 0].`, [
        digitRow(plus.result, null, [0, 1, 2]), label('plus', 200, 50, '199 + 1 = 200', C.green, { size: 16, anchor: 'middle' }),
    ]));

    // Rotate Image: transpose, then reverse each row
    const start = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    const rot = runRotate(start);
    const size = 50;
    const mx = 40;
    const my = 40;
    const colorOf = (v: number) => [C.cyan, C.violet, C.pink][Math.floor((v - 1) / 3)];
    /** Each cell keeps its value as its id, so it slides to its new place. */
    const grid = (m: number[][], lit: number[] = []): Shape[] =>
        m.flatMap((row, r) => row.map((v, c) => rect(`v${v}`, mx + c * (size + 6), my + r * (size + 6), size, size, {
            rx: 8, fill: tint(colorOf(v), lit.includes(v) ? 0.65 : 0.3), stroke: lit.includes(v) ? C.amber : colorOf(v), sw: lit.includes(v) ? 3 : 2,
            text: String(v), size: 18, weight: 800, mono: true,
        })));
    const diagonal = line('diag', mx - 6, my - 6, mx + 3 * (size + 6), my + 3 * (size + 6), { stroke: C.amber, sw: 2, dash: '5 4' });
    const side = (lines: string[], color: string = C.ink): Part[] => lines.map((value, k) => label(`side${k}`, 236, 70 + k * 24, value, k === 0 ? color : C.grey, { size: 13, mono: k === 0 }));
    const medium: Frame[] = [
        frame('Rotate the matrix 90° clockwise, in place. Each row is coloured so you can follow it: the top row must end up as the right-hand column.', [grid(start), side(['rotate 90° →', 'in place: no', 'second matrix'])]),
        frame('Step 1: transpose — swap across the main diagonal, so row i becomes column i. Cells on the diagonal (1, 5, 9) stay put.', [diagonal, grid(start, [1, 5, 9]), side(['transpose', 'swap (i, j) ↔ (j, i)'], C.amber)]),
    ];
    rot.swaps.forEach(sw => {
        const va = sw.after[sw.a[0]][sw.a[1]];
        const vb = sw.after[sw.b[0]][sw.b[1]];
        medium.push(frame(`Swap (${sw.a.join(',')}) with (${sw.b.join(',')}): ${vb} and ${va} trade places across the diagonal.`, [diagonal, grid(sw.after, [va, vb]), side(['transpose', `(${sw.a.join(',')}) ↔ (${sw.b.join(',')})`], C.amber)], 2600));
    });
    medium.push(frame('Step 2: reverse each row. The transpose is a mirror image of the rotation; reversing rows flips it the right way round.', [grid(rot.transposed), side(['reverse rows'], C.amber)]));
    rot.reversals.forEach((m, i) => {
        medium.push(frame(`Reverse row ${i}: ${py(rot.transposed[i])} → ${py(m[i])}.`, [grid(m, m[i]), side(['reverse rows', `row ${i}`], C.amber)], 2600));
    });
    medium.push(frame(`Done: ${py(rot.result)}. The old top row (cyan) is now the right column. Every cell moved once or twice, with O(1) extra space.`, [grid(rot.result), side(['rotated ✓'], C.green)]));

    return {
        title: 'Math and geometry: carry digits; rotate by transpose + reverse',
        variants: [
            { label: 'Plus One', frames: easy },
            { label: 'Rotate Image', frames: medium },
        ],
    };
};

// ============ Bit Manipulation ============

const bin = (n: number, width = 3) => n.toString(2).padStart(width, '0');

const runSingleNumber = (nums: number[]) => {
    let acc = 0;
    const steps = nums.map(x => {
        const before = acc;
        acc ^= x;
        return { x, before, after: acc };
    });
    return { steps, result: acc };
};

const runCountingBits = (n: number) => {
    const bits = [0];
    for (let i = 1; i <= n; i++) bits.push(bits[i >> 1] + (i & 1));
    return { bits, result: bits };
};

const bitManipulation = (): AnimationSpec => {
    const nums = [4, 1, 2, 1, 2];
    const xor = runSingleNumber(nums);
    const bx = 150;
    const bcell = { w: 44, h: 40, gap: 8, size: 18 };
    const bitRow = (id: string, y: number, value: number, look: (i: number) => Look) =>
        cellRow(id, bx, y, [...bin(value)], look, bcell);
    const bitLook = (value: number, flipped: number[] = []) => (i: number): Look =>
        flipped.includes(i) ? LOOK_AT : bin(value)[i] === '1' ? [C.cyan, 0.5] : [C.grey, 0.12];
    const inputRow = (at: number | null) => cellRow('in', 120, 14, nums, i => (i === at ? LOOK_AT : at !== null && i < at ? DIM : PLAIN), { w: 30, h: 26, gap: 6, size: 12 });
    const easy: Frame[] = [
        frame('Every number appears twice except one. XOR (^) compares bits: same bits give 0, different give 1. So x ^ x = 0 and x ^ 0 = x — pairs cancel out.', [
            inputRow(null), label('acc-t', 14, 168, 'running XOR', C.grey, { size: 12, mono: false }), bitRow('acc', 148, 0, bitLook(0)), label('accv', 380, 168, '= 0', C.ink, { size: 14, anchor: 'end' }),
        ]),
    ];
    xor.steps.forEach((s, k) => {
        const flipped = [0, 1, 2].filter(i => bin(s.x)[i] === '1');
        easy.push(frame(`${bin(s.before)} ^ ${bin(s.x)} = ${bin(s.after)}. Every 1-bit of ${s.x} flips that bit of the running value.${k >= 3 ? ` ${s.x} appeared before, so this flip undoes the earlier one.` : ''}`, [
            inputRow(k),
            label('x-t', 14, 90, `x = ${s.x}`, C.amber, { size: 12 }), bitRow('x', 70, s.x, i => (bin(s.x)[i] === '1' ? LOOK_AT : [C.grey, 0.08])),
            label('acc-t', 14, 168, 'running XOR', C.grey, { size: 12, mono: false }), bitRow('acc', 148, s.after, bitLook(s.after, flipped)),
            label('accv', 380, 168, `= ${s.after}`, C.ink, { size: 14, anchor: 'end' }),
            label('op', 200, 214, `${bin(s.before)} ^ ${bin(s.x)} = ${bin(s.after)}`, C.ink, { size: 13, anchor: 'middle' }),
        ], 3200));
    });
    easy.push(frame(`The pairs (1 and 1, 2 and 2) cancelled out; only ${xor.result} is left. Answer: ${xor.result}. O(n) time and O(1) space — no hash set needed.`, [
        inputRow(nums.length), label('acc-t', 14, 168, 'running XOR', C.grey, { size: 12, mono: false }), bitRow('acc', 148, xor.result, () => HIT), label('accv', 380, 168, `= ${xor.result}`, C.green, { size: 15, anchor: 'end' }),
    ]));

    // Counting Bits
    const n = 5;
    const cb = runCountingBits(n);
    const rowY = (i: number) => 34 + i * 30;
    const table = (upTo: number, at: number | null): Part[] => [
        ['i', 'binary', 'bits'].map((h, k) => text(`th${k}`, [44, 120, 330][k], 16, h, { size: 12, fill: C.grey, weight: 700 })),
        cb.bits.map((b, i) => {
            const shown = i <= upTo;
            const look: Look = i === at ? LOOK_AT : shown ? DONE : DIM;
            return [
                text(`ti${i}`, 44, rowY(i) + 12, String(i), { size: 13, fill: shown ? C.ink : C.dim, weight: 700, mono: true }),
                rect(`tb${i}`, 92, rowY(i), 56, 24, { rx: 5, fill: tint(look[0], look[1] * 0.6), stroke: C.faint, sw: 1, text: bin(i), textColor: shown ? C.ink : C.dim, size: 13, weight: 700, mono: true }),
                rect(`tc${i}`, 314, rowY(i), 32, 24, { rx: 5, fill: tint(look[0], look[1]), stroke: look[1] <= 0.08 ? C.faint : look[0], sw: 1.5, text: shown ? String(b) : '?', textColor: shown ? C.ink : C.dim, size: 13, weight: 700, mono: true }),
            ];
        }),
    ];
    const medium: Frame[] = [
        frame('Count the 1-bits of every number from 0 to 5. Trick: i >> 1 drops the last bit, and that smaller number is already done. So bits(i) = bits(i >> 1) + (last bit of i).', [table(-1, null)]),
        frame('Base case: 0 has no 1-bits.', [table(0, 0)]),
    ];
    for (let i = 1; i <= n; i++) {
        const half = i >> 1;
        const last = i & 1;
        medium.push(frame(`${i} = ${bin(i)}. Drop the last bit: ${bin(i)} >> 1 = ${bin(half)} = ${half}, which has ${cb.bits[half]}. Add the last bit (${last}): ${cb.bits[half]} + ${last} = ${cb.bits[i]}.`, [
            table(i, i),
            path('look', [[310, rowY(i) + 12], [276, rowY(i) + 12], [276, rowY(half) + 12], [312, rowY(half) + 12]], { stroke: C.cyan, sw: 2, arrow: true }),
            label('rule', 160, rowY(i) + 12, `bits(${half}) + ${last}`, C.amber, { size: 12 }),
        ], 3200));
    }
    medium.push(frame(`Answer: ${py(cb.result)}. Each number reuses an answer already worked out, so it is O(n) — a tiny DP on bits.`, [table(n, null)]));

    return {
        title: 'Bits: XOR cancels pairs; shifting reuses smaller answers',
        variants: [
            { label: 'Single Number (XOR)', frames: easy },
            { label: 'Counting Bits', frames: medium },
        ],
    };
};

export const sequencesAnimations: Record<string, () => AnimationSpec> = {
    '1-d-dynamic-programming': oneD,
    '2-d-dynamic-programming': twoD,
    greedy,
    intervals,
    'math-geometry': mathGeometry,
    'bit-manipulation': bitManipulation,
};

export const sequencesResults: Record<string, { easy: () => string; medium: () => string }> = {
    '1-d-dynamic-programming': { easy: () => py(runClimb(5).result), medium: () => py(runRob([2, 7, 9, 3, 1]).result) },
    '2-d-dynamic-programming': { easy: () => py(runUniquePaths(3, 3).result), medium: () => py(runLcs('abcde', 'ace').result) },
    greedy: { easy: () => py(runKadane([-2, 1, -3, 4, -1, 2, 1, -5, 4]).result), medium: () => py(runJump([3, 2, 1, 0, 4]).result) },
    intervals: { easy: () => py(runMeetingRooms([[0, 30], [5, 10], [15, 20]]).result), medium: () => py(runMerge([[1, 3], [8, 10], [2, 6], [15, 18]]).result) },
    'math-geometry': { easy: () => py(runPlusOne([1, 9, 9]).result), medium: () => py(runRotate([[1, 2, 3], [4, 5, 6], [7, 8, 9]]).result) },
    'bit-manipulation': { easy: () => py(runSingleNumber([4, 1, 2, 1, 2]).result), medium: () => py(runCountingBits(5).result) },
};
