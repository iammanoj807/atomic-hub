import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import { C, frame, line, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import { DIM, PLAIN, cellRow, cellX, indexRow, label, pile, pointer, py, type Look } from './common';

// Arrays & Hashing, Two Pointers, Sliding Window, Stack and Binary Search.
// Each animation runs the algorithm on the lesson's own traced inputs
// (dsaPatterns.ts); `arraysResults` hands the answers to a test, which checks
// them against the traces.

const HIT: Look = [C.green, 0.5];
const LOOK_AT: Look = [C.amber, 0.45];

// ============ Arrays & Hashing ============

const runTwoSum = (nums: number[], target: number) => {
    const seen = new Map<number, number>();
    const steps: { i: number; need: number; hit: boolean; seen: [number, number][] }[] = [];
    for (let i = 0; i < nums.length; i++) {
        const need = target - nums[i];
        const hit = seen.has(need);
        steps.push({ i, need, hit, seen: [...seen] });
        if (hit) return { steps, result: [seen.get(need)!, i] };
        seen.set(nums[i], i);
    }
    return { steps, result: [] as number[] };
};

const runLongestConsecutive = (nums: number[]) => {
    const set = new Set(nums);
    let best = 0;
    const steps: { n: number; start: boolean; run: number[]; best: number }[] = [];
    for (const n of set) {
        if (set.has(n - 1)) {
            steps.push({ n, start: false, run: [], best });
            continue;
        }
        const run = [n];
        while (set.has(n + run.length)) run.push(n + run.length);
        best = Math.max(best, run.length);
        steps.push({ n, start: true, run, best });
    }
    return { steps, result: best };
};

const arraysHashing = (): AnimationSpec => {
    // Two Sum
    const nums = [2, 7, 11, 15];
    const target = 9;
    const { steps, result } = runTwoSum(nums, target);
    const cx = 16;
    const cell = { w: 40, h: 32, gap: 6 };
    const mapPanel = (rows: [number, number][], lit: number | null): Part[] => [
        rect('map', 232, 44, 156, 150, { rx: 10, fill: tint(C.violet, 0.08), stroke: C.violet, sw: 1.5 }),
        text('map-t', 310, 60, 'map: value → index', { size: 12, fill: C.violet, weight: 700 }),
        rows.map(([value, index]) =>
            rect(`m${value}`, 250, 74 + rows.findIndex(r => r[0] === value) * 30, 120, 24, {
                rx: 6, fill: tint(lit === value ? C.green : C.violet, lit === value ? 0.55 : 0.25), stroke: lit === value ? C.green : C.violet, sw: 1.5,
                text: `${value} → ${index}`, size: 13, weight: 700, mono: true,
            })),
    ];
    const base = (look: (i: number) => Look = () => PLAIN): Part[] => [
        label('tgt', cx, 22, `target = ${target}`, C.amber),
        indexRow('ix', cx, 50, nums.length, cell),
        cellRow('n', cx, 60, nums, look, cell),
    ];
    const easy: Frame[] = [
        frame('Find two numbers that add up to 9. Instead of trying every pair, walk the array once and keep a hash map of what you have seen.', [base(), mapPanel([], null)]),
    ];
    steps.forEach(step => {
        const x = nums[step.i];
        const at = (i: number): Look => (i === step.i ? LOOK_AT : i < step.i ? DIM : PLAIN);
        const readout: Part[] = [
            pointer('i', cellX(cx, step.i, cell), 92, 'i', C.amber),
            label('need', cx, 150, `need = ${target} − ${x} = ${step.need}`, C.ink, { size: 14 }),
        ];
        if (!step.hit) {
            easy.push(frame(`i = ${step.i}: x = ${x}, so it needs ${step.need}. Ask the map: is ${step.need} there? No — one step, no second loop.`, [
                base(at), mapPanel(step.seen, null), readout, label('ask', cx, 176, `${step.need} in map? no`, C.red, { size: 14 }),
            ]));
            easy.push(frame(`Now remember ${x}: store ${x} → ${step.i}. Store after asking, so a number can never pair with itself.`, [
                base(at), mapPanel([...step.seen, [x, step.i]], null), readout, label('ask', cx, 176, `store ${x} → ${step.i}`, C.violet, { size: 14 }),
            ]));
        } else {
            const [a, b] = result;
            easy.push(frame(`i = ${step.i}: x = ${x}, so it needs ${step.need}. Is ${step.need} in the map? Yes, at index ${a}.`, [
                base(at), mapPanel(step.seen, step.need), readout, label('ask', cx, 176, `${step.need} in map? yes → index ${a}`, C.green, { size: 14 }),
            ]));
            easy.push(frame(`Answer: ${py(result)}. One pass and one map lookup per number: O(n) time, O(n) space, instead of O(n²) for every pair.`, [
                base(i => (i === a || i === b ? HIT : DIM)), mapPanel(step.seen, step.need),
                label('need', cx, 150, `${nums[a]} + ${nums[b]} = ${target}`, C.green, { size: 14 }),
                label('ask', cx, 176, `return ${py(result)}`, C.green, { size: 15 }),
            ]));
        }
    });

    // Longest Consecutive Sequence
    const input = [100, 4, 200, 1, 3, 2];
    const lc = runLongestConsecutive(input);
    const sorted = [...new Set(input)].sort((p, q) => p - q);
    // The set, laid out in order so runs are easy to see; the gap marks the jump.
    const setX = (n: number) => {
        const k = sorted.indexOf(n);
        return 40 + k * 52 + (n >= 100 ? 24 : 0);
    };
    const setChips = (look: (n: number) => Look): Shape[] =>
        sorted.map(n => {
            const [color, strength] = look(n);
            return rect(`s${n}`, setX(n) - 22, 134, 44, 30, { rx: 15, fill: tint(color, strength), stroke: color, sw: 1.5, text: String(n), size: 13, weight: 700, mono: true });
        });
    const inputRow = (k: number | null) => cellRow('in', 52, 44, input, i => (i === k ? LOOK_AT : k !== null && i < k ? DIM : PLAIN), { w: 44, h: 30, gap: 6 });
    const medBase = (k: number | null, best: number): Part[] => [
        label('in-t', 10, 59, 'nums', C.grey, { size: 12 }),
        inputRow(k),
        label('set-t', 10, 120, 'the set, drawn in order:', C.grey, { size: 12, mono: false }),
        label('best', 300, 206, `best = ${best}`, C.green, { size: 15 }),
    ];
    const medium: Frame[] = [
        frame('Put every number in a set: "is n in it?" now takes one step. The set has no order — it is drawn in order here only so runs are easy to see.', [medBase(null, 0), setChips(() => PLAIN)]),
    ];
    lc.steps.forEach(step => {
        const k = input.indexOf(step.n);
        if (!step.start) {
            medium.push(frame(`${step.n}: is ${step.n - 1} in the set? Yes, so ${step.n} is not the start of a run. Skip it — its run is counted from the start.`, [
                medBase(k, step.best),
                setChips(n => (n === step.n ? LOOK_AT : n === step.n - 1 ? [C.grey, 0.35] : PLAIN)),
                label('note', 10, 206, `${step.n - 1} in set → skip`, C.grey, { size: 14 }),
            ]));
        } else {
            medium.push(frame(`${step.n}: ${step.n - 1} is not in the set, so ${step.n} starts a run. Count up: ${step.run.join(', ')} → length ${step.run.length}.`, [
                medBase(k, step.best),
                setChips(n => (step.run.includes(n) ? HIT : PLAIN)),
                step.run.length > 1 && line('run', setX(step.run[0]), 178, setX(step.run[step.run.length - 1]), 178, { stroke: C.green, sw: 4 }),
                label('note', 10, 206, `start → length ${step.run.length}`, C.green, { size: 14 }),
            ]));
        }
    });
    medium.push(frame(`Answer: ${lc.result}. Counting only from starts means each number is looked at a handful of times, so the whole thing is O(n) — no sorting needed.`, [
        medBase(null, lc.result), setChips(n => (n <= 4 ? HIT : DIM)),
    ]));

    return {
        title: 'A hash map answers "have I seen it?" in one step',
        variants: [
            { label: 'Two Sum', frames: easy },
            { label: 'Longest Consecutive', frames: medium },
        ],
    };
};

// ============ Two Pointers ============

const runTwoSumSorted = (numbers: number[], target: number) => {
    let left = 0;
    let right = numbers.length - 1;
    const steps: { left: number; right: number; sum: number }[] = [];
    while (left < right) {
        const sum = numbers[left] + numbers[right];
        steps.push({ left, right, sum });
        if (sum === target) return { steps, result: [left + 1, right + 1] };
        if (sum < target) left++;
        else right--;
    }
    return { steps, result: [] as number[] };
};

const runMaxArea = (height: number[]) => {
    let left = 0;
    let right = height.length - 1;
    let best = 0;
    const steps: { left: number; right: number; area: number; best: number }[] = [];
    while (left < right) {
        const area = Math.min(height[left], height[right]) * (right - left);
        best = Math.max(best, area);
        steps.push({ left, right, area, best });
        if (height[left] < height[right]) left++;
        else right--;
    }
    return { steps, result: best };
};

const twoPointers = (): AnimationSpec => {
    const numbers = [1, 2, 4, 6, 8, 11];
    const target = 10;
    const { steps, result } = runTwoSumSorted(numbers, target);
    const x0 = 64;
    const cell = { w: 42, h: 34, gap: 8 };
    const ptrs = (l: number, r: number) => [
        pointer('L', cellX(x0, l, cell), 96, 'L', C.cyan),
        pointer('R', cellX(x0, r, cell), 96, 'R', C.pink),
    ];
    const look = (l: number, r: number, done = false) => (i: number): Look =>
        i === l || i === r ? (done ? HIT : LOOK_AT) : i < l || i > r ? DIM : PLAIN;
    const head = [label('tgt', 20, 24, `sorted, target = ${target}`, C.amber), indexRow('ix', x0, 52, numbers.length, cell)];
    const easy: Frame[] = [
        frame('The array is sorted. Put L on the smallest number and R on the largest.', [head, cellRow('n', x0, 62, numbers, look(0, numbers.length - 1), cell), ptrs(0, numbers.length - 1)]),
    ];
    steps.forEach((s, k) => {
        const a = numbers[s.left];
        const b = numbers[s.right];
        const found = s.sum === target;
        const verdict = found ? 'found it' : s.sum > target ? 'too big → move R left' : 'too small → move L right';
        const why = found
            ? `${a} + ${b} = ${target}. Answer (1-indexed): ${py(result)}. Each step threw away a number that could never be in the answer, so it is one pass and O(1) space.`
            : s.sum > target
                ? `${a} + ${b} = ${s.sum}: too big. L already holds the smallest number left, so ${b} is too big with every partner. Drop it: move R left.`
                : `${a} + ${b} = ${s.sum}: too small. R already holds the largest number left, so ${a} is too small with every partner. Drop it: move L right.`;
        easy.push(frame(why, [
            head,
            cellRow('n', x0, 62, numbers, look(s.left, s.right, found), cell),
            ptrs(s.left, s.right),
            label('sum', 200, 160, `${a} + ${b} = ${s.sum}`, found ? C.green : C.ink, { size: 15, anchor: 'middle' }),
            label('verdict', 200, 186, verdict, found ? C.green : C.amber, { size: 14, anchor: 'middle' }),
        ], k === steps.length - 1 ? 6000 : undefined));
    });

    // Container With Most Water
    const height = [1, 8, 6, 2, 5, 4, 8, 3, 7];
    const run = runMaxArea(height);
    const unit = 15;
    const floor = 186;
    const slot = 40;
    const barX = (i: number) => 26 + i * slot;
    const bars = (l: number, r: number): Shape[] =>
        height.map((h, i) => rect(`b${i}`, barX(i) + 8, floor - h * unit, slot - 16, h * unit, {
            rx: 3, fill: i === l ? C.cyan : i === r ? C.pink : tint(C.grey, i > l && i < r ? 0.5 : 0.2), stroke: 'none',
        }));
    const water = (l: number, r: number): Shape => {
        const h = Math.min(height[l], height[r]);
        return rect('water', barX(l) + slot / 2, floor - h * unit, (r - l) * slot, h * unit, { fill: tint(C.blue, 0.3), stroke: C.blue, sw: 1.5 });
    };
    const ground: Part[] = [
        line('ground', 20, floor, 386, floor, { stroke: C.dim, sw: 1.5 }),
        height.map((h, i) => text(`h${i}`, barX(i) + slot / 2, floor + 12, String(h), { size: 11, fill: C.dim, mono: true })),
    ];
    const marks = (l: number, r: number): Part[] => [
        text('L', barX(l) + slot / 2, floor + 28, 'L', { size: 13, fill: C.cyan, weight: 800, mono: true }),
        text('R', barX(r) + slot / 2, floor + 28, 'R', { size: 13, fill: C.pink, weight: 800, mono: true }),
    ];
    const medium: Frame[] = [
        frame('Each number is a wall. Water between two walls is as high as the SHORTER wall, times the distance between them. Start with the widest pair.', [ground, bars(0, height.length - 1), marks(0, height.length - 1)]),
    ];
    run.steps.forEach((s, k) => {
        const hl = height[s.left];
        const hr = height[s.right];
        const moveL = hl < hr;
        const caption = k === 0
            ? `min(${hl}, ${hr}) × ${s.right - s.left} = ${s.area}. The left wall (${hl}) is shorter, so it limits every container it is in. Moving the taller wall can never help: move L.`
            : k === 1
                ? `min(${hl}, ${hr}) × ${s.right - s.left} = ${s.area}: the best so far. Now the right wall is shorter (or equal): move R.`
                : `min(${hl}, ${hr}) × ${s.right - s.left} = ${s.area}. Best is still ${s.best}. Move the shorter wall: ${moveL ? 'L' : 'R'}.`;
        medium.push(frame(caption, [
            water(s.left, s.right), ground, bars(s.left, s.right), marks(s.left, s.right),
            label('area', 22, 22, `area = ${s.area}`, C.blue, { size: 14 }),
            label('best', 386, 22, `best = ${s.best}`, C.green, { size: 14, anchor: 'end' }),
        ], k > 2 ? 2600 : undefined));
    });
    medium.push(frame(`L and R have met, so every pair worth checking has been checked. The best was walls 8 and 7, shown here: answer ${run.result}. One pass, because every move dropped a wall that could not be in a bigger container.`, [
        water(1, 8), ground, bars(1, 8),
        label('area', 22, 22, `answer = ${run.result}`, C.green, { size: 15 }),
    ]));

    return {
        title: 'Two pointers: start at both ends, and each step rules out an answer',
        variants: [
            { label: 'Two Sum II (sorted)', frames: easy },
            { label: 'Container With Most Water', frames: medium },
        ],
    };
};

// ============ Sliding Window ============

const runMaxProfit = (prices: number[]) => {
    let left = 0;
    let best = 0;
    /** buy: the buy day this sale was measured against (L before any move). */
    const steps: { buy: number; right: number; profit: number; moved: boolean; best: number }[] = [];
    for (let right = 1; right < prices.length; right++) {
        const buy = left;
        const profit = prices[right] - prices[buy];
        const moved = prices[right] < prices[buy];
        if (moved) left = right;
        else best = Math.max(best, profit);
        steps.push({ buy, right, profit, moved, best });
    }
    return { steps, result: best };
};

const runLongestUnique = (s: string) => {
    const seen = new Set<string>();
    let left = 0;
    let best = 0;
    const steps: { right: number; before: number; dropped: string[]; left: number; best: number }[] = [];
    for (let right = 0; right < s.length; right++) {
        const before = left;
        const dropped: string[] = [];
        while (seen.has(s[right])) {
            seen.delete(s[left]);
            dropped.push(s[left]);
            left++;
        }
        seen.add(s[right]);
        best = Math.max(best, right - left + 1);
        steps.push({ right, before, dropped, left, best });
    }
    return { steps, result: best };
};

const slidingWindow = (): AnimationSpec => {
    const prices = [7, 1, 5, 3, 6, 4];
    const profit = runMaxProfit(prices);
    const unit = 18;
    const floor = 180;
    const slot = 56;
    const barX = (i: number) => 32 + i * slot;
    const priceBars = (l: number, r: number | null): Part[] => [
        line('ground', 24, floor, 376, floor, { stroke: C.dim, sw: 1.5 }),
        prices.map((p, i) => rect(`p${i}`, barX(i) + 10, floor - p * unit, slot - 20, p * unit, {
            rx: 3, fill: i === l ? C.green : i === r ? C.amber : tint(C.grey, i < l ? 0.12 : 0.3), stroke: 'none',
        })),
        prices.map((p, i) => text(`pv${i}`, barX(i) + slot / 2, floor - p * unit - 9, `£${p}`, { size: 12, fill: C.ink, mono: true, weight: 700 })),
        prices.map((_, i) => text(`d${i}`, barX(i) + slot / 2, floor + 13, `day ${i}`, { size: 11, fill: C.dim })),
        text('buy', barX(l) + slot / 2, floor + 30, 'buy (L)', { size: 12, fill: C.green, weight: 800 }),
        r !== null && text('sell', barX(r) + slot / 2, floor + 30, 'sell (R)', { size: 12, fill: C.amber, weight: 800 }),
    ];
    const easy: Frame[] = [
        frame('Buy on one day, sell on a later day. L is the buy day, R the sell day. Both edges only ever move right.', [priceBars(0, 1), label('best', 386, 22, 'best = 0', C.green, { size: 14, anchor: 'end' })]),
    ];
    profit.steps.forEach(s => {
        const caption = s.moved
            ? `Day ${s.right} costs £${prices[s.right]}, cheaper than buying on day ${s.buy} (£${prices[s.buy]}). Any later sale does better from here, so move L to day ${s.right}.`
            : `Sell on day ${s.right}: £${prices[s.right]} − £${prices[s.buy]} = £${s.profit}. Best so far: £${s.best}.`;
        easy.push(frame(caption, [
            priceBars(s.buy, s.right),
            label('best', 386, 22, `best = ${s.best}`, C.green, { size: 14, anchor: 'end' }),
            label('profit', 14, 22, `profit = ${s.profit}`, s.profit > 0 ? C.amber : C.red, { size: 14 }),
        ]));
        if (s.moved) {
            easy.push(frame(`L jumps to day ${s.right}: the new cheapest buy day.`, [
                priceBars(s.right, null),
                label('best', 386, 22, `best = ${s.best}`, C.green, { size: 14, anchor: 'end' }),
            ]));
        }
    });
    easy.push(frame(`Answer: £${profit.result} (buy at £1 on day 1, sell at £6 on day 4). One pass, O(n).`, [
        priceBars(1, 4), label('best', 386, 22, `best = ${profit.result}`, C.green, { size: 15, anchor: 'end' }),
    ]));

    // Longest Substring Without Repeating Characters
    const s = 'abcabcbb';
    const run = runLongestUnique(s);
    const x0 = 40;
    const cell = { w: 36, h: 34, gap: 4 };
    const windowBox = (l: number, r: number, color: string) =>
        rect('win', x0 + l * 40 - 4, 52, (r - l + 1) * 40 + 4, 42, { rx: 9, fill: 'none', stroke: color, sw: 3 });
    const chars = (look: (i: number) => Look) => cellRow('c', x0, 56, [...s], look, cell);
    const readout = (window: string, best: number): Part[] => [
        label('set', 20, 150, `set = {${[...window].map(ch => `'${ch}'`).join(', ')}}`, C.violet, { size: 13 }),
        label('len', 20, 176, `window = '${window}'  (length ${window.length})`, C.ink, { size: 13 }),
        label('best', 380, 206, `best = ${best}`, C.green, { size: 15, anchor: 'end' }),
    ];
    const medium: Frame[] = [
        frame('Find the longest stretch with no repeated letter. The window [L, R] only ever holds letters that are all different.', [chars(() => PLAIN), indexRow('ix', x0, 44, s.length, cell), readout('', 0)]),
    ];
    run.steps.forEach(step => {
        const ch = s[step.right];
        const inside = (l: number, r: number) => (i: number): Look => (i >= l && i <= r ? (i === step.right ? LOOK_AT : [C.cyan, 0.3]) : i < l ? DIM : PLAIN);
        const ptrs = (l: number) => [pointer('L', cellX(x0, l, cell), 94, 'L', C.cyan), pointer('R', cellX(x0, step.right, cell) + (l === step.right ? 12 : 0), 94, 'R', C.amber)];
        if (step.dropped.length === 0) {
            medium.push(frame(`Add '${ch}': no repeat, so the window grows to '${s.slice(step.left, step.right + 1)}'.`, [
                indexRow('ix', x0, 44, s.length, cell), chars(inside(step.left, step.right)), windowBox(step.left, step.right, C.cyan), ptrs(step.left),
                readout(s.slice(step.left, step.right + 1), step.best),
            ], 2600));
        } else {
            const clash = (i: number): Look => (i === step.right || (i >= step.before && i < step.left && s[i] === ch) ? [C.red, 0.45] : inside(step.before, step.right)(i));
            medium.push(frame(`Add '${ch}': but '${ch}' is already in the window. The window breaks the rule — shrink it from the left.`, [
                indexRow('ix', x0, 44, s.length, cell), chars(clash), windowBox(step.before, step.right, C.red), ptrs(step.before),
                readout(s.slice(step.before, step.right), step.best),
            ]));
            medium.push(frame(`Drop ${step.dropped.map(d => `'${d}'`).join(' and ')} from the left until '${ch}' is no longer repeated. Window: '${s.slice(step.left, step.right + 1)}'. Best stays ${step.best}.`, [
                indexRow('ix', x0, 44, s.length, cell), chars(inside(step.left, step.right)), windowBox(step.left, step.right, C.cyan), ptrs(step.left),
                readout(s.slice(step.left, step.right + 1), step.best),
            ]));
        }
    });
    medium.push(frame(`Answer: ${run.result}. Each letter enters the window once and leaves at most once, so it is O(n), not O(n²).`, [
        indexRow('ix', x0, 44, s.length, cell), chars(i => (i < 3 ? HIT : DIM)), windowBox(0, 2, C.green), readout('abc', run.result),
    ]));

    return {
        title: 'Sliding window: grow the right edge, shrink the left while the rule breaks',
        variants: [
            { label: 'Best Time to Buy and Sell', frames: easy },
            { label: 'Longest Substring', frames: medium },
        ],
    };
};

// ============ Stack ============

const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' };

const runValidParentheses = (s: string) => {
    const stack: { ch: string; at: number }[] = [];
    const steps: { at: number; action: 'push' | 'pop' | 'fail'; stack: { ch: string; at: number }[] }[] = [];
    for (let at = 0; at < s.length; at++) {
        const ch = s[at];
        if (!(ch in PAIRS)) {
            stack.push({ ch, at });
            steps.push({ at, action: 'push', stack: [...stack] });
        } else if (stack.length && stack[stack.length - 1].ch === PAIRS[ch]) {
            stack.pop();
            steps.push({ at, action: 'pop', stack: [...stack] });
        } else {
            steps.push({ at, action: 'fail', stack: [...stack] });
            return { steps, result: false };
        }
    }
    return { steps, result: stack.length === 0 };
};

const runDailyTemperatures = (temps: number[]) => {
    const answer = new Array<number>(temps.length).fill(0);
    const stack: number[] = [];
    const steps: { day: number; popped: number[]; stack: number[]; answer: number[] }[] = [];
    temps.forEach((t, day) => {
        const popped: number[] = [];
        while (stack.length && temps[stack[stack.length - 1]] < t) {
            const prev = stack.pop()!;
            answer[prev] = day - prev;
            popped.push(prev);
        }
        stack.push(day);
        steps.push({ day, popped, stack: [...stack], answer: [...answer] });
    });
    return { steps, result: answer };
};

const stack = (): AnimationSpec => {
    const s = '([]{})';
    const run = runValidParentheses(s);
    const x0 = 24;
    const cell = { w: 36, h: 36, gap: 6, size: 16 };
    const colorOf = (ch: string) => ({ '(': C.cyan, ')': C.cyan, '[': C.amber, ']': C.amber, '{': C.pink, '}': C.pink })[ch] ?? C.grey;
    const chars = (at: number | null) => cellRow('c', x0, 70, [...s], i => (i === at ? [colorOf(s[i]), 0.55] : at !== null && i < at ? DIM : [colorOf(s[i]), 0.18]), cell);
    const stackOf = (items: { ch: string; at: number }[]) => pile('stack', 300, 200, items.map(item => ({ id: `st${item.at}`, label: item.ch, color: colorOf(item.ch) })), { w: 64, capacity: 4 });
    const easy: Frame[] = [
        frame('Every closing bracket must match the most recent opening bracket that is still open. "Most recent first" is exactly what a stack gives you.', [chars(null), stackOf([])]),
    ];
    run.steps.forEach(step => {
        const ch = s[step.at];
        const caption = step.action === 'push'
            ? `'${ch}' opens something: push it on the stack. It waits for its match.`
            : `'${ch}' closes something. The top of the stack is '${PAIRS[ch]}' — a match, so pop it.`;
        easy.push(frame(caption, [chars(step.at), pointer('i', cellX(x0, step.at, cell), 106, 'i', C.ink), stackOf(step.stack)], 2600));
    });
    easy.push(frame(`End of the string and the stack is empty: every bracket was matched in the right order. Answer: ${py(run.result)}. (A leftover item, or a mismatch on top, would mean False.)`, [
        chars(null), stackOf([]), label('ans', 24, 160, `return ${py(run.result)}`, C.green, { size: 15 }),
    ]));

    // Daily Temperatures: a monotonic stack
    const temps = [73, 74, 75, 71, 69, 72, 76, 73];
    const daily = runDailyTemperatures(temps);
    const dx = 14;
    const dcell = { w: 32, h: 30, gap: 4, size: 12 };
    const tempRow = (day: number | null, popped: number[] = []) =>
        cellRow('t', dx, 50, temps, i => (i === day ? LOOK_AT : popped.includes(i) ? HIT : PLAIN), dcell);
    const answerRow = (answer: number[], filled: Set<number>, fresh: number[] = []) =>
        cellRow('a', dx, 124, answer.map((a, i) => (filled.has(i) ? a : '?')), i => (fresh.includes(i) ? HIT : filled.has(i) ? [C.green, 0.2] : DIM), dcell);
    const stackOfDays = (days: number[]) => pile('stack', 314, 204, days.map(d => ({ id: `sd${d}`, label: `${d}(${temps[d]})`, color: C.violet })), { w: 72, capacity: 4 });
    const heads: Part[] = [
        indexRow('ix', dx, 40, temps.length, dcell),
        label('tt', dx, 104, 'days to wait for a warmer day:', C.grey, { size: 12, mono: false }),
    ];
    const filled = new Set<number>();
    const medium: Frame[] = [
        frame('For each day, how many days until it is warmer? Keep a stack of days still waiting. Their temperatures always go down from bottom to top.', [heads, tempRow(null), answerRow(daily.result, filled), stackOfDays([])]),
    ];
    daily.steps.forEach(step => {
        step.popped.forEach(p => filled.add(p));
        const t = temps[step.day];
        const caption = step.day === 0
            ? `Day 0 (${t}°): the stack is empty, so there is nobody to answer. Push it — it waits for a warmer day. Each item is shown as day(temperature).`
            : step.popped.length === 0
            ? `Day ${step.day} (${t}°) is not warmer than the day on top, so it answers nobody. Push it: it waits too.`
            : `Day ${step.day} (${t}°) is warmer than ${step.popped.map(p => `day ${p} (${temps[p]}°)`).join(' and ')}. Pop ${step.popped.length > 1 ? 'them' : 'it'} — answered: ${step.popped.map(p => `${step.day} − ${p} = ${step.day - p}`).join(', ')}. Then push day ${step.day}.`;
        medium.push(frame(caption, [heads, tempRow(step.day, step.popped), answerRow(step.answer, new Set(filled), step.popped), stackOfDays(step.stack)], step.popped.length > 1 ? 7000 : undefined));
    });
    const all = new Set(temps.map((_, i) => i));
    medium.push(frame(`Days still on the stack never get a warmer day: they stay 0. Answer: ${py(daily.result)}. Each day is pushed once and popped at most once, so it is O(n).`, [
        heads, tempRow(null), answerRow(daily.result, all), stackOfDays(daily.steps[daily.steps.length - 1].stack),
    ]));

    return {
        title: 'A stack: the most recent unfinished thing is resolved first',
        variants: [
            { label: 'Valid Parentheses', frames: easy },
            { label: 'Daily Temperatures', frames: medium },
        ],
    };
};

// ============ Binary Search ============

const runBinarySearch = (nums: number[], target: number) => {
    let lo = 0;
    let hi = nums.length - 1;
    const steps: { lo: number; hi: number; mid: number }[] = [];
    while (lo <= hi) {
        const mid = Math.floor((lo + hi) / 2);
        steps.push({ lo, hi, mid });
        if (nums[mid] === target) return { steps, result: mid };
        if (nums[mid] < target) lo = mid + 1;
        else hi = mid - 1;
    }
    return { steps, result: -1 };
};

const hoursAt = (piles: number[], k: number) => piles.reduce((sum, p) => sum + Math.ceil(p / k), 0);

const runKoko = (piles: number[], h: number) => {
    let lo = 1;
    let hi = Math.max(...piles);
    const steps: { lo: number; hi: number; k: number; hours: number }[] = [];
    while (lo < hi) {
        const k = Math.floor((lo + hi) / 2);
        const hours = hoursAt(piles, k);
        steps.push({ lo, hi, k, hours });
        if (hours <= h) hi = k;
        else lo = k + 1;
    }
    return { steps, result: lo };
};

const binarySearch = (): AnimationSpec => {
    const nums = [-1, 0, 3, 5, 9, 12];
    const target = 9;
    const run = runBinarySearch(nums, target);
    const x0 = 64;
    const cell = { w: 42, h: 34, gap: 8 };
    const row = (lo: number, hi: number, mid: number | null, found = false) =>
        cellRow('n', x0, 70, nums, i => (i === mid ? (found ? HIT : LOOK_AT) : i < lo || i > hi ? DIM : PLAIN), cell);
    const ptrs = (lo: number, hi: number, mid: number | null): Part[] => [
        pointer('lo', cellX(x0, lo, cell), 104, 'lo', C.cyan),
        pointer('hi', cellX(x0, hi, cell), 104, 'hi', C.pink),
        mid !== null && pointer('mid', cellX(x0, mid, cell), 50, 'mid', C.amber, { above: true }),
    ];
    const head = [label('tgt', 20, 200, `sorted, target = ${target}`, C.amber), indexRow('ix', x0, 60, nums.length, cell)];
    const easy: Frame[] = [
        frame('The array is sorted. Keep a range [lo, hi] that must contain the target, and look at the middle.', [head, row(0, nums.length - 1, null), ptrs(0, nums.length - 1, null)]),
    ];
    run.steps.forEach(step => {
        const v = nums[step.mid];
        if (v === target) {
            easy.push(frame(`mid = (${step.lo} + ${step.hi}) // 2 = ${step.mid}, value ${v}. Found it: answer ${run.result}.`, [head, row(step.lo, step.hi, step.mid, true), ptrs(step.lo, step.hi, step.mid)]));
        } else {
            easy.push(frame(`mid = (${step.lo} + ${step.hi}) // 2 = ${step.mid}, value ${v}. ${v} < ${target}, and the array is sorted, so everything left of mid is too small as well.`, [head, row(step.lo, step.hi, step.mid), ptrs(step.lo, step.hi, step.mid)]));
            easy.push(frame(`Throw away the whole left half in one step: lo = mid + 1 = ${step.mid + 1}. Half the array gone with one comparison.`, [head, row(step.mid + 1, step.hi, null), ptrs(step.mid + 1, step.hi, null)]));
        }
    });
    easy.push(frame('Two looks instead of five. Each look halves the range, so n items take about log₂ n looks: a million items, about 20.', [head, row(3, 5, 4, true), ptrs(3, 5, 4)]));

    // Koko Eating Bananas: binary search on the answer
    const piles = [3, 6, 7, 11];
    const h = 8;
    const koko = runKoko(piles, h);
    const speeds = Array.from({ length: Math.max(...piles) }, (_, i) => i + 1);
    const kx = 18;
    const kcell = { w: 28, h: 28, gap: 4, size: 12 };
    const speedRow = (lo: number, hi: number, k: number | null, done = false) =>
        cellRow('k', kx, 62, speeds, i => (speeds[i] === k ? (done ? HIT : LOOK_AT) : speeds[i] < lo || speeds[i] > hi ? DIM : PLAIN), kcell);
    const kPtrs = (lo: number, hi: number, k: number | null): Part[] => [
        lo === hi
            ? pointer('lo', cellX(kx, lo - 1, kcell), 90, 'lo=hi', C.green)
            : [pointer('lo', cellX(kx, lo - 1, kcell), 90, 'lo', C.cyan), pointer('hi', cellX(kx, hi - 1, kcell), 90, 'hi', C.pink)],
        k !== null && pointer('kp', cellX(kx, k - 1, kcell), 62, 'k', C.amber, { above: true }),
    ];
    const pileRow = (k: number | null): Part[] => piles.map((p, i) => [
        rect(`pile${i}`, 30 + i * 72, 150, 60, 28, { rx: 6, fill: tint(C.yellow, 0.18), stroke: C.yellow, sw: 1.5, text: `${p} 🍌`, size: 12, weight: 700, mono: true }),
        k !== null && text(`ph${i}`, 60 + i * 72, 192, `${Math.ceil(p / k)}h`, { size: 13, fill: C.amber, weight: 700, mono: true }),
    ]);
    const kHead = label('kt', 14, 22, `speed k (bananas per hour), must finish in h = ${h} hours`, C.grey, { size: 12, mono: false });
    const medium: Frame[] = [
        frame('Koko needs a speed k. Too slow and she runs out of time; any faster speed also works. So the speeds 1–11 are "sorted" by yes/no — search them by halving.', [kHead, speedRow(1, 11, null), kPtrs(1, 11, null), pileRow(null)]),
    ];
    koko.steps.forEach(step => {
        const ok = step.hours <= h;
        medium.push(frame(`Try k = ${step.k}: ${piles.map(p => Math.ceil(p / step.k)).join(' + ')} = ${step.hours} hours. ${ok ? `Fast enough — but maybe slower also works: hi = ${step.k}.` : `Too slow — need faster: lo = ${step.k + 1}.`}`, [
            kHead, speedRow(step.lo, step.hi, step.k), kPtrs(step.lo, step.hi, step.k), pileRow(step.k),
            label('hours', 386, 214, `${step.hours} h ${ok ? '≤' : '>'} ${h}`, ok ? C.green : C.red, { size: 14, anchor: 'end' }),
        ]));
    });
    medium.push(frame(`lo and hi meet at ${koko.result}: the slowest speed that still finishes in ${h} hours. Answer: ${koko.result}. Four checks instead of trying all eleven speeds.`, [
        kHead, speedRow(koko.result, koko.result, koko.result, true), kPtrs(koko.result, koko.result, null), pileRow(koko.result),
        label('hours', 386, 214, `${hoursAt(piles, koko.result)} h ≤ ${h}`, C.green, { size: 14, anchor: 'end' }),
    ]));

    return {
        title: 'Binary search: each look throws away half of what is left',
        variants: [
            { label: 'Binary Search', frames: easy },
            { label: 'Koko (search the answer)', frames: medium },
        ],
    };
};

export const arraysAnimations: Record<string, () => AnimationSpec> = {
    'arrays-hashing': arraysHashing,
    'two-pointers': twoPointers,
    'sliding-window': slidingWindow,
    stack,
    'binary-search': binarySearch,
};

/** Each worked example's answer, printed like Python, for the test to check against the traces. */
export const arraysResults: Record<string, { easy: () => string; medium: () => string }> = {
    'arrays-hashing': { easy: () => py(runTwoSum([2, 7, 11, 15], 9).result), medium: () => py(runLongestConsecutive([100, 4, 200, 1, 3, 2]).result) },
    'two-pointers': { easy: () => py(runTwoSumSorted([1, 2, 4, 6, 8, 11], 10).result), medium: () => py(runMaxArea([1, 8, 6, 2, 5, 4, 8, 3, 7]).result) },
    'sliding-window': { easy: () => py(runMaxProfit([7, 1, 5, 3, 6, 4]).result), medium: () => py(runLongestUnique('abcabcbb').result) },
    stack: { easy: () => py(runValidParentheses('([]{})').result), medium: () => py(runDailyTemperatures([73, 74, 75, 71, 69, 72, 76, 73]).result) },
    'binary-search': { easy: () => py(runBinarySearch([-1, 0, 3, 5, 9, 12], 9).result), medium: () => py(runKoko([3, 6, 7, 11], 8).result) },
};
