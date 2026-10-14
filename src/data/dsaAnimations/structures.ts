import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import { C, arrow, circle, frame, line, path, rect, text, tint, type Part } from '../../components/learning/anim/kit';
import { PLAIN, buildTree, drawTree, label, py, treeNodes, type Look, type TreeNode } from './common';

// Linked List, Trees, Heap / Priority Queue, Backtracking and Tries. As in
// arrays.ts, every animation runs the algorithm on the lesson's traced inputs.

const LOOK_AT: Look = [C.amber, 0.5];

/** A list node: a box with its value. */
const nodeBox = (id: string, x: number, y: number, value: string, look: Look, w = 44): Shape => {
    const [color, strength] = look;
    return rect(id, x, y, w, 34, {
        rx: 8, fill: tint(color, strength), stroke: strength <= 0.08 ? C.faint : color, sw: 2,
        text: value, textColor: strength <= 0.08 ? C.dim : C.ink, size: 13, weight: 700, mono: true,
    });
};

/** A name under (or over) a node, with a short arrow to it. */
const tag = (id: string, cx: number, y: number, name: string, color: string, above = false): Shape[] =>
    above
        ? [arrow(`${id}-a`, cx, y - 15, cx, y - 2, { stroke: color, sw: 2 }), text(`${id}-t`, cx, y - 23, name, { size: 12, fill: color, weight: 800, mono: true })]
        : [arrow(`${id}-a`, cx, y + 15, cx, y + 2, { stroke: color, sw: 2 }), text(`${id}-t`, cx, y + 23, name, { size: 12, fill: color, weight: 800, mono: true })];

// ============ Linked List ============

const runReverse = (values: number[]) => {
    // next[i] = index of the node after i, or -1 for None.
    const next = values.map((_, i) => (i + 1 < values.length ? i + 1 : -1));
    let prev = -1;
    let curr = 0;
    const steps: { curr: number; nxt: number; next: number[] }[] = [];
    while (curr !== -1) {
        const nxt = next[curr];
        next[curr] = prev;
        steps.push({ curr, nxt, next: [...next] });
        prev = curr;
        curr = nxt;
    }
    // Walk from the new head to read the result.
    const out: number[] = [];
    for (let at = prev; at !== -1; at = next[at]) out.push(values[at]);
    return { steps, result: out };
};

const runRemoveNth = (values: number[], n: number) => {
    // Index 0 is the dummy; nodes are 1..len; len + 1 stands for None.
    const none = values.length + 1;
    let slow = 0;
    let fast = 0;
    const steps: { slow: number; fast: number; what: string }[] = [{ slow, fast, what: 'start' }];
    for (let k = 0; k < n + 1; k++) fast++;
    steps.push({ slow, fast, what: 'gap' });
    while (fast !== none) {
        slow++;
        fast++;
        steps.push({ slow, fast, what: 'both' });
    }
    const removed = slow + 1;
    const result = values.filter((_, i) => i + 1 !== removed);
    return { steps, removed, result };
};

const linkedList = (): AnimationSpec => {
    const values = [1, 2, 3, 4];
    const rev = runReverse(values);
    const nx = (i: number) => 66 + i * 74;
    const y = 80;
    const NONE_L = 8;
    const NONE_R = 352;
    const nodes = (done: number): Part[] => [
        nodeBox('noneL', NONE_L, y, 'None', [C.grey, 0.12], 42),
        nodeBox('noneR', NONE_R, y, 'None', [C.grey, 0.12], 42),
        values.map((v, i) => nodeBox(`n${i}`, nx(i), y, String(v), i < done ? [C.violet, 0.35] : PLAIN)),
    ];
    /** The arrow out of node i: right to i + 1 at first, left to i − 1 once flipped. */
    const links = (next: number[], flipping: number | null = null): Shape[] =>
        next.map((to, i) => {
            const flipped = to === -1 ? i === 0 : to < i;
            const o = { stroke: i === flipping ? C.amber : flipped ? C.violet : C.grey, sw: 2.5 };
            // The reversed head points at None on the left; the original tail at None on the right.
            if (to === -1 && i === 0) return arrow(`l${i}`, nx(i), y + 17, NONE_L + 44, y + 17, o);
            if (to === -1) return arrow(`l${i}`, nx(i) + 44, y + 17, NONE_R - 2, y + 17, o);
            if (to > i) return arrow(`l${i}`, nx(i) + 44, y + 17, nx(to) - 2, y + 17, o);
            return arrow(`l${i}`, nx(i), y + 17, nx(to) + 46, y + 17, o);
        });
    const cx = (i: number) => (i === -1 ? NONE_L + 21 : i === values.length ? NONE_R + 21 : nx(i) + 22);
    const tags = (prev: number, curr: number, nxt: number | null): Part[] => [
        tag('prev', cx(prev), y + 34, 'prev', C.violet),
        tag('curr', cx(curr), y + 34, 'curr', C.amber),
        nxt !== null && tag('nxt', cx(nxt), y, 'nxt', C.grey, true),
    ];
    const listText = (order: number[]) => (order.length ? order.map(i => values[i]).join(' → ') + ' → None' : 'None');
    const readout = (done: number): Part[] => {
        const reversed = Array.from({ length: done }, (_, k) => done - 1 - k);
        const todo = Array.from({ length: values.length - done }, (_, k) => done + k);
        return [
            label('rev', 14, 176, `reversed: ${listText(reversed)}`, C.violet, { size: 13 }),
            label('todo', 14, 200, `still to do: ${listText(todo)}`, C.grey, { size: 13 }),
        ];
    };
    const original = values.map((_, i) => (i + 1 < values.length ? i + 1 : -1));
    const easy: Frame[] = [
        frame('Each node only knows the node after it. To reverse the list, walk it once and flip each arrow to point backwards. prev starts at None, curr at the head.', [nodes(0), links(original), tags(-1, 0, null), readout(0)]),
    ];
    rev.steps.forEach((step, k) => {
        const before = k === 0 ? original : rev.steps[k - 1].next;
        const v = values[step.curr];
        const nxtAt = step.nxt === -1 ? values.length : step.nxt;
        const prevAt = k === 0 ? -1 : rev.steps[k - 1].curr;
        easy.push(frame(`Save nxt = curr.next (${step.nxt === -1 ? 'None' : values[step.nxt]}) first — otherwise flipping the arrow would lose the rest of the list.`, [
            nodes(k), links(before), tags(prevAt, step.curr, nxtAt), readout(k),
        ], 2800));
        easy.push(frame(`curr.next = prev: ${v} now points back to ${prevAt === -1 ? 'None' : values[prevAt]}. Then step forward: prev = ${v}, curr = ${step.nxt === -1 ? 'None' : values[step.nxt]}.`, [
            nodes(k + 1), links(step.next, step.curr), tags(step.curr, nxtAt, null), readout(k + 1),
        ]));
    });
    easy.push(frame(`curr is None: done. prev is the new head. Answer: ${py(rev.result)}. One pass, O(n) time, and only three extra pointers, O(1) space.`, [
        nodes(values.length), links(rev.steps[rev.steps.length - 1].next), tags(values.length - 1, values.length, null), readout(values.length),
    ]));

    // Remove Nth Node From End
    const list = [1, 2, 3, 4, 5];
    const n = 2;
    const rm = runRemoveNth(list, n);
    const labels = ['D', ...list.map(String), 'None'];
    const bx = (i: number) => 12 + i * 55;
    const by = 84;
    const chain = (removed: number | null, slow: number, fast: number): Part[] => [
        labels.map((name, i) => nodeBox(`m${i}`, bx(i), by, name, i === removed ? [C.red, 0.4] : i === 0 || i === labels.length - 1 ? [C.grey, 0.12] : PLAIN, i === labels.length - 1 ? 46 : 38)),
        labels.slice(0, -1).map((_, i) => {
            if (removed !== null && i === removed - 1) return path(`k${i}`, [[bx(i) + 30, by], [bx(i) + 30, by - 22], [bx(i + 2) + 8, by - 22], [bx(i + 2) + 8, by - 2]], { stroke: C.green, sw: 2.5, arrow: true });
            if (removed !== null && i === removed) return arrow(`k${i}`, bx(i) + 38, by + 17, bx(i + 1) - 1, by + 17, { stroke: C.faint, sw: 2 });
            return path(`k${i}`, [[bx(i) + 38, by + 17], [bx(i) + 46, by + 17], [bx(i + 1) - 1, by + 17], [bx(i + 1) - 1, by + 17]], { stroke: C.grey, sw: 2, arrow: true });
        }),
        tag('slow', bx(slow) + 19, by + 34, 'slow', C.cyan),
        tag('fast', bx(fast) + (fast === labels.length - 1 ? 23 : 19), by, 'fast', C.pink, true),
    ];
    const gapNote = (slow: number, fast: number) => label('gap', 200, 188, `gap = ${fast - slow} nodes`, C.amber, { size: 13, anchor: 'middle' });
    const medium: Frame[] = [];
    rm.steps.forEach(step => {
        if (step.what === 'start') {
            medium.push(frame(`Remove the ${n}nd node from the end. Add a dummy node D before the head, so even the head could be removed the same way. Both pointers start at D.`, [chain(null, 0, 0)]));
        } else if (step.what === 'gap') {
            medium.push(frame(`Move fast n + 1 = ${n + 1} steps ahead. Now the gap between them is ${n + 1}, and it never changes.`, [chain(null, step.slow, step.fast), gapNote(step.slow, step.fast)]));
        } else {
            const fastName = labels[step.fast];
            medium.push(frame(fastName === 'None'
                ? `Move both one step: fast falls off the end (None). Because the gap is ${n + 1}, slow is now exactly one node BEFORE the one to remove.`
                : `Move both one step: slow → ${labels[step.slow]}, fast → ${fastName}. The gap stays ${n + 1}.`, [chain(null, step.slow, step.fast), gapNote(step.slow, step.fast)]));
        }
    });
    const last = rm.steps[rm.steps.length - 1];
    medium.push(frame(`slow.next = slow.next.next: ${labels[last.slow]} now points past ${labels[rm.removed]} to ${labels[rm.removed + 1]}. Answer: ${py(rm.result)}. One pass, no counting the length first.`, [
        chain(rm.removed, last.slow, last.fast),
        label('ans', 200, 188, `return ${py(rm.result)}`, C.green, { size: 14, anchor: 'middle' }),
    ]));

    return {
        title: 'Linked lists: rewire the arrows, and keep a pointer to what you would lose',
        variants: [
            { label: 'Reverse a list', frames: easy },
            { label: 'Remove Nth from end', frames: medium },
        ],
    };
};

// ============ Trees ============

const TREE = [3, 9, 20, null, null, 15, 7];

const runMaxDepth = (root: TreeNode | null) => {
    const returns: { node: TreeNode; left: number; right: number; depth: number }[] = [];
    const depth = (node: TreeNode | null): number => {
        if (!node) return 0;
        const left = depth(node.left);
        const right = depth(node.right);
        const d = 1 + Math.max(left, right);
        returns.push({ node, left, right, depth: d });
        return d;
    };
    return { returns, result: depth(root) };
};

const runLevelOrder = (root: TreeNode | null) => {
    const levels: { queue: number[]; level: number[]; after: number[] }[] = [];
    const result: number[][] = [];
    let queue: TreeNode[] = root ? [root] : [];
    while (queue.length) {
        const level = queue.map(n => n.value);
        const next = queue.flatMap(n => [n.left, n.right].filter((c): c is TreeNode => c !== null));
        levels.push({ queue: level, level, after: next.map(n => n.value) });
        result.push(level);
        queue = next;
    }
    return { levels, result };
};

const trees = (): AnimationSpec => {
    const root = buildTree(TREE, 118, 46, 150, 62);
    const run = runMaxDepth(root);
    const returned = (upTo: number) => new Map(run.returns.slice(0, upTo).map(r => [r.node.index, r.depth]));
    const badges = (done: Map<number, number>): Shape[] =>
        treeNodes(root).filter(n => done.has(n.index)).map(n =>
            rect(`d${n.index}`, n.x + 13, n.y - 28, 30, 18, { rx: 9, fill: tint(C.green, 0.3), stroke: C.green, sw: 1.5, text: `↑${done.get(n.index)}`, size: 11, weight: 700, mono: true }));
    const look = (done: Map<number, number>, at: number | null) => (n: TreeNode): Look => (n.index === at ? LOOK_AT : done.has(n.index) ? [C.green, 0.25] : PLAIN);
    const easy: Frame[] = [
        frame('How deep is the tree? Ask each node: "how deep is the tree below you?" A node waits for both children to answer, then returns 1 + the bigger answer. An empty child returns 0.', [drawTree('t', root, () => PLAIN)]),
    ];
    run.returns.forEach((r, k) => {
        const done = returned(k + 1);
        const leaf = r.left === 0 && r.right === 0;
        easy.push(frame(leaf
            ? `${r.node.value} is a leaf: both children are empty (0). It returns 1 + max(0, 0) = 1.`
            : `${r.node.value} has heard from both children: left ${r.left}, right ${r.right}. It returns 1 + max(${r.left}, ${r.right}) = ${r.depth}.`, [
            drawTree('t', root, look(done, r.node.index)), badges(done),
            label('calc', 270, 40, `1 + max(${r.left}, ${r.right})`, C.ink, { size: 13 }),
            label('calc2', 270, 64, `= ${r.depth}`, C.green, { size: 15 }),
        ]));
    });
    easy.push(frame(`The root returns ${run.result}: the answer. Children answer before parents (post-order), and each node is visited once: O(n).`, [
        drawTree('t', root, () => [C.green, 0.3]), badges(returned(run.returns.length)),
        label('calc', 270, 40, `max depth = ${run.result}`, C.green, { size: 15 }),
    ]));

    // Level order (BFS)
    const bfs = runLevelOrder(root);
    const queueRow = (values: number[], color: string): Shape[] => [
        label('q-t', 262, 40, 'queue', C.grey, { size: 12, mono: false }),
        rect('q-box', 258, 50, 132, 36, { rx: 8, fill: tint(C.violet, 0.06), stroke: C.violet, sw: 1.5 }),
        ...values.map((v, i) => rect(`q${v}`, 264 + i * 40, 55, 34, 26, { rx: 6, fill: tint(color, 0.35), stroke: color, sw: 1.5, text: String(v), size: 12, weight: 700, mono: true })),
    ];
    const output = (levels: number[][]): Part[] => [
        label('o-t', 262, 112, 'result', C.grey, { size: 12, mono: false }),
        levels.map((lv, i) => label(`o${i}`, 262, 136 + i * 22, py(lv), C.green, { size: 13 })),
    ];
    const depthOf = new Map(treeNodes(root).map(n => [n.value, n.depth]));
    const medium: Frame[] = [
        frame('Breadth-first: visit the tree one level at a time, using a queue (first in, first out). Start with just the root in the queue.', [drawTree('t', root, () => PLAIN), queueRow([3], C.violet), output([])]),
    ];
    bfs.levels.forEach((lv, k) => {
        const levelDepth = depthOf.get(lv.level[0])!;
        const look = (n: TreeNode): Look => (n.depth === levelDepth ? LOOK_AT : n.depth < levelDepth ? [C.green, 0.25] : PLAIN);
        medium.push(frame(`The queue holds exactly one level: ${py(lv.queue)}. Note its size (${lv.queue.length}) — that is how many to take out for this level.`, [
            drawTree('t', root, look), queueRow(lv.queue, C.amber), output(bfs.result.slice(0, k)),
        ]));
        medium.push(frame(lv.after.length
            ? `Take out those ${lv.queue.length}, add them to the result as one list, and put their children in the queue: ${py(lv.after)}.`
            : `Take out ${py(lv.level)}. They have no children, so the queue is empty: done.`, [
            drawTree('t', root, n => (n.depth <= levelDepth ? [C.green, 0.25] : PLAIN)), queueRow(lv.after, C.violet), output(bfs.result.slice(0, k + 1)),
        ]));
    });
    medium.push(frame(`Answer: ${py(bfs.result)}. Every node goes into the queue once and out once: O(n). Swap the queue for a stack and you get depth-first order instead.`, [
        drawTree('t', root, () => [C.green, 0.25]), queueRow([], C.violet), output(bfs.result),
    ]));

    return {
        title: 'Trees: let each node ask its children, or visit level by level',
        variants: [
            { label: 'Max depth (DFS)', frames: easy },
            { label: 'Level order (BFS)', frames: medium },
        ],
    };
};

// ============ Heap / Priority Queue ============

/** Python's heapq, step for step, on items compared by `key`, so the tree matches what the lesson's code builds. */
interface Item { id: string; value: number }
const heapq = (key: (item: Item) => number) => {
    const less = (a: Item, b: Item) => key(a) < key(b);
    const siftDown = (heap: Item[], start: number, pos: number) => {
        const item = heap[pos];
        while (pos > start) {
            const parentPos = (pos - 1) >> 1;
            const parent = heap[parentPos];
            if (less(item, parent)) {
                heap[pos] = parent;
                pos = parentPos;
                continue;
            }
            break;
        }
        heap[pos] = item;
    };
    const siftUp = (heap: Item[], pos: number) => {
        const end = heap.length;
        const start = pos;
        const item = heap[pos];
        let child = 2 * pos + 1;
        while (child < end) {
            const right = child + 1;
            if (right < end && !less(heap[child], heap[right])) child = right;
            heap[pos] = heap[child];
            pos = child;
            child = 2 * pos + 1;
        }
        heap[pos] = item;
        siftDown(heap, start, pos);
    };
    return {
        push: (heap: Item[], item: Item) => {
            heap.push(item);
            siftDown(heap, 0, heap.length - 1);
        },
        pop: (heap: Item[]): Item => {
            const last = heap.pop()!;
            if (!heap.length) return last;
            const top = heap[0];
            heap[0] = last;
            siftUp(heap, 0);
            return top;
        },
        heapify: (heap: Item[]) => {
            for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) siftUp(heap, i);
        },
    };
};

const runLastStone = (stones: number[]) => {
    const h = heapq(item => -item.value);
    const heap = stones.map((value, i) => ({ id: `s${i}`, value }));
    const start = [...heap];
    h.heapify(heap);
    const rounds: { a: Item; b: Item; afterPops: Item[]; back: Item | null; after: Item[] }[] = [];
    let fresh = 0;
    while (heap.length > 1) {
        const a = h.pop(heap);
        const b = h.pop(heap);
        const afterPops = [...heap];
        let back: Item | null = null;
        if (a.value !== b.value) {
            back = { id: `new${fresh++}`, value: a.value - b.value };
            h.push(heap, back);
        }
        rounds.push({ a, b, afterPops, back, after: [...heap] });
    }
    return { start, rounds, result: heap.length ? heap[0].value : 0 };
};

/** The heap right after heapify, for the frame that shows it. */
const heapifyCopy = (stones: number[]) => {
    const heap = stones.map((value, i) => ({ id: `s${i}`, value }));
    heapq(item => -item.value).heapify(heap);
    return heap;
};

const runKthLargest = (nums: number[], k: number) => {
    const h = heapq(item => item.value);
    const heap: Item[] = [];
    const steps: { x: Item; pushed: Item[]; popped: Item | null; after: Item[] }[] = [];
    nums.forEach((value, i) => {
        const x = { id: `x${i}`, value };
        h.push(heap, x);
        const pushed = [...heap];
        const popped = heap.length > k ? h.pop(heap) : null;
        steps.push({ x, pushed, popped, after: [...heap] });
    });
    return { steps, result: heap[0].value };
};

/** Where heap slot i sits when the array is drawn as a tree. */
const slotXY = (i: number, cx: number, top: number, width: number, gap: number) => {
    const depth = Math.floor(Math.log2(i + 1));
    const first = 2 ** depth - 1;
    const slots = 2 ** depth;
    return { x: cx - width / 2 + ((i - first + 0.5) * width) / slots, y: top + depth * gap };
};

const heapTree = (items: Item[], color: string, o: { cx?: number; top?: number; width?: number; gap?: number; lit?: string[] } = {}): Shape[] => {
    const { cx = 130, top = 50, width = 220, gap = 52, lit = [] } = o;
    const at = items.map((_, i) => slotXY(i, cx, top, width, gap));
    const edges = items.slice(1).map((_, k) => {
        const i = k + 1;
        const p = at[(i - 1) >> 1];
        return line(`he${i}`, p.x, p.y + 17, at[i].x, at[i].y - 17, { stroke: C.dim, sw: 2 });
    });
    const nodes = items.map((item, i) => circle(item.id, at[i].x, at[i].y, 17, {
        fill: tint(lit.includes(item.id) ? C.amber : color, lit.includes(item.id) ? 0.55 : i === 0 ? 0.45 : 0.22),
        stroke: lit.includes(item.id) ? C.amber : color, sw: i === 0 ? 3 : 2, text: String(item.value), size: 13, weight: 700, mono: true,
    }));
    return [...edges, ...nodes];
};

const heapPriorityQueue = (): AnimationSpec => {
    const stones = [2, 7, 4, 1, 8, 1];
    const run = runLastStone(stones);
    const heaviestFirst = (items: Item[]) => py(items.map(s => s.value).sort((p, q) => q - p));
    const smash = (a: Item | null, b: Item | null, note: string, color: string = C.ink): Part[] => [
        label('sm-t', 330, 40, 'smash', C.grey, { size: 12, anchor: 'middle', mono: false }),
        a && circle(a.id, 305, 80, 17, { fill: tint(C.red, 0.4), stroke: C.red, sw: 2, text: String(a.value), size: 13, weight: 700, mono: true }),
        b && circle(b.id, 355, 80, 17, { fill: tint(C.red, 0.4), stroke: C.red, sw: 2, text: String(b.value), size: 13, weight: 700, mono: true }),
        label('sm-n', 330, 120, note, color, { size: 13, anchor: 'middle' }),
    ];
    const left = (items: Item[]) => label('left', 14, 214, `stones left: ${heaviestFirst(items)}`, C.grey, { size: 12 });
    const easy: Frame[] = [
        frame('Each turn, smash the two heaviest stones. A max-heap keeps the heaviest at the top, always. Python\'s heapq is a min-heap, so the code stores −weight.', [
            stones.map((v, i) => circle(`s${i}`, 40 + i * 52, 110, 17, { fill: tint(C.blue, 0.22), stroke: C.blue, sw: 2, text: String(v), size: 13, weight: 700, mono: true })),
            label('raw', 14, 60, 'stones (a plain list)', C.grey, { size: 12, mono: false }),
        ]),
        frame('heapify arranges them as a tree where every parent is heavier than its children — in O(n). The heaviest, 8, is at the top.', [
            heapTree(heapifyCopy(stones), C.blue), left(run.start),
        ]),
    ];
    run.rounds.forEach(r => {
        easy.push(frame(`Pop twice: ${r.a.value} and ${r.b.value}, the two heaviest. After each pop the heap moves the next heaviest to the top, in O(log n).`, [
            heapTree(r.afterPops, C.blue), smash(r.a, r.b, `${r.a.value} vs ${r.b.value}`), left(r.afterPops),
        ]));
        easy.push(frame(r.back
            ? `${r.a.value} − ${r.b.value} = ${r.back.value}: push ${r.back.value} back. It goes in at the bottom and swaps upwards only while it is heavier than its parent: O(log n).`
            : `${r.a.value} and ${r.b.value} are equal: both are destroyed, nothing goes back.`, [
            heapTree(r.after, C.blue, { lit: r.back ? [r.back.id] : [] }),
            smash(null, null, r.back ? `${r.back.value} goes back` : 'both gone', r.back ? C.amber : C.red),
            left(r.after),
        ]));
    });
    easy.push(frame(`One stone left: answer ${run.result}. Each turn costs O(log n) instead of re-sorting the whole pile.`, [
        heapTree(run.rounds[run.rounds.length - 1].after, C.green), label('ans', 330, 80, `return ${run.result}`, C.green, { size: 15, anchor: 'middle' }),
    ]));

    // Kth largest: a min-heap of size k
    const nums = [3, 2, 1, 5, 6, 4];
    const k = 2;
    const kth = runKthLargest(nums, k);
    const incoming = (i: number | null): Part[] => [
        label('in-t', 14, 24, `nums, k = ${k}`, C.grey, { size: 12, mono: false }),
        nums.map((v, j) => rect(`in${j}`, 110 + j * 36, 12, 30, 24, {
            rx: 5, fill: tint(j === i ? C.amber : C.blue, j === i ? 0.5 : j < (i ?? -1) ? 0.05 : 0.2), stroke: j === i ? C.amber : j < (i ?? -1) ? C.faint : C.blue, sw: 1.5,
            text: String(v), textColor: j < (i ?? -1) ? C.dim : C.ink, size: 12, weight: 700, mono: true,
        })),
    ];
    const out = (gone: Item[]): Part[] => [
        label('out-t', 330, 70, 'popped', C.grey, { size: 12, anchor: 'middle', mono: false }),
        gone.map((item, j) => circle(item.id, 300 + (j % 3) * 30, 98 + Math.floor(j / 3) * 34, 13, { fill: tint(C.grey, 0.2), stroke: C.grey, sw: 1.5, text: String(item.value), size: 12, weight: 700, mono: true })),
    ];
    const gone: Item[] = [];
    const tree = (items: Item[], lit: string[] = []) => heapTree(items, C.violet, { cx: 140, top: 82, width: 160, gap: 56, lit });
    const medium: Frame[] = [
        frame(`The ${k}nd largest number. Keep a MIN-heap of the ${k} largest seen so far. Its top is the smallest of them — exactly the ${k}nd largest.`, [incoming(null), tree([]), out([])]),
    ];
    kth.steps.forEach((s, i) => {
        medium.push(frame(s.popped
            ? `Push ${s.x.value}. Now there are ${k + 1} in the heap — one too many.`
            : `Push ${s.x.value}. The heap holds ${s.pushed.length} of the ${k} it is allowed: keep going.`, [incoming(i), tree(s.pushed, [s.x.id]), out(gone)], s.popped ? 2600 : undefined));
        if (s.popped) {
            gone.push(s.popped);
            medium.push(frame(`Pop the smallest (${s.popped.value}): it cannot be among the ${k} largest. The heap is back to ${k}: ${py(s.after.map(it => it.value).sort((p, q) => p - q))}.`, [incoming(i), tree(s.after), out([...gone])]));
        }
    });
    medium.push(frame(`Answer: the top of the heap, ${kth.result}. The heap never holds more than k items, so each step is O(log k) — better than sorting everything when k is small.`, [
        incoming(nums.length), heapTree(kth.steps[kth.steps.length - 1].after, C.green, { cx: 140, top: 82, width: 160, gap: 56 }), out(gone),
    ]));

    return {
        title: 'A heap keeps the biggest (or smallest) item on top',
        variants: [
            { label: 'Last Stone Weight (max-heap)', frames: easy },
            { label: 'Kth Largest (min-heap of k)', frames: medium },
        ],
    };
};

// ============ Backtracking ============

interface SearchNode { path: number[]; total: number; status: 'open' | 'found' | 'over'; children: SearchNode[]; x: number; y: number; order: number }

/** Leaves spread evenly across the width, each parent centred over its children. */
const tidy = (root: SearchNode, left: number, right: number, top: number, gap: number) => {
    const leaves: SearchNode[] = [];
    const collect = (n: SearchNode, depth: number) => {
        n.y = top + depth * gap;
        if (!n.children.length) leaves.push(n);
        n.children.forEach(c => collect(c, depth + 1));
    };
    collect(root, 0);
    const step = leaves.length > 1 ? (right - left) / (leaves.length - 1) : 0;
    leaves.forEach((n, i) => { n.x = leaves.length > 1 ? left + i * step : (left + right) / 2; });
    const place = (n: SearchNode): number => {
        if (n.children.length) n.x = n.children.map(place).reduce((s, x) => s + x, 0) / n.children.length;
        return n.x;
    };
    place(root);
};

const runSubsets = (nums: number[]) => {
    let order = 0;
    const results: number[][] = [];
    const visit = (start: number, path: number[]): SearchNode => {
        results.push([...path]);
        const node: SearchNode = { path: [...path], total: 0, status: 'found', children: [], x: 0, y: 0, order: order++ };
        for (let i = start; i < nums.length; i++) node.children.push(visit(i + 1, [...path, nums[i]]));
        return node;
    };
    const root = visit(0, []);
    return { root, result: results };
};

const runCombinationSum = (candidates: number[], target: number) => {
    let order = 0;
    const results: number[][] = [];
    const visit = (start: number, path: number[], total: number): SearchNode => {
        const node: SearchNode = { path: [...path], total, status: 'open', children: [], x: 0, y: 0, order: order++ };
        if (total === target) {
            node.status = 'found';
            results.push([...path]);
            return node;
        }
        if (total > target) {
            node.status = 'over';
            return node;
        }
        for (let i = start; i < candidates.length; i++) node.children.push(visit(i, [...path, candidates[i]], total + candidates[i]));
        return node;
    };
    const root = visit(0, [], 0);
    return { root, result: results };
};

const allNodes = (root: SearchNode): SearchNode[] => [root, ...root.children.flatMap(allNodes)];

const backtracking = (): AnimationSpec => {
    const sub = runSubsets([1, 2, 3]);
    tidy(sub.root, 50, 350, 34, 50);
    const subNodes = allNodes(sub.root);
    const subTree = (upTo: number, at: number | null): Shape[] => {
        const shown = subNodes.filter(n => n.order <= upTo);
        const edges = shown.flatMap(n => n.children.filter(c => c.order <= upTo).map(c =>
            line(`se${c.order}`, n.x, n.y + 12, c.x, c.y - 12, { stroke: c.order === at ? C.amber : C.dim, sw: 2 })));
        const boxes = shown.map(n => {
            const name = py(n.path);
            const w = Math.max(30, name.length * 7.4 + 12);
            const hot = n.order === at;
            return rect(`sn${n.order}`, n.x - w / 2, n.y - 12, w, 24, { rx: 12, fill: tint(hot ? C.amber : C.green, hot ? 0.55 : 0.25), stroke: hot ? C.amber : C.green, sw: 1.5, text: name, size: 12, weight: 700, mono: true });
        });
        return [...edges, ...boxes];
    };
    const recorded = (upTo: number) => label('rec', 14, 222, `recorded: ${subNodes.filter(n => n.order <= upTo).length} of 8`, C.green, { size: 13 });
    const easy: Frame[] = [];
    subNodes.forEach(n => {
        const next = n.children.map(c => c.path[c.path.length - 1]);
        const caption = n.order === 0
            ? 'Every subset is a list of yes/no choices. Start with the empty path []. Record it — every path is a subset, not just the full ones.'
            : next.length
                ? `Add ${n.path[n.path.length - 1]}: path ${py(n.path)}. Record it. Then try each later number: ${next.join(', ')}.`
                : `Add ${n.path[n.path.length - 1]}: path ${py(n.path)}. Record it. No later numbers to add → undo the last choice and go back up.`;
        easy.push(frame(caption, [subTree(n.order, n.order), recorded(n.order)], n.order > 3 ? 2600 : undefined));
    });
    easy.push(frame(`All ${sub.result.length} subsets: ${py(sub.result)}. Choose, explore, un-choose. Only trying LATER numbers stops [2, 1] repeating [1, 2].`, [subTree(99, null), recorded(99)], 8000));

    // Combination Sum
    const target = 8;
    const comb = runCombinationSum([2, 3, 5], target);
    tidy(comb.root, 22, 378, 24, 40);
    const combNodes = allNodes(comb.root);
    const colorOf = (n: SearchNode) => (n.status === 'found' ? C.green : n.status === 'over' ? C.red : C.cyan);
    const combTree = (upTo: number, from: number): Shape[] => {
        const shown = combNodes.filter(n => n.order <= upTo);
        const edges = shown.flatMap(n => n.children.filter(c => c.order <= upTo).map(c =>
            line(`ce${c.order}`, n.x, n.y + 11, c.x, c.y - 11, { stroke: c.order >= from ? colorOf(c) : C.dim, sw: 2 })));
        const dots = shown.map(n => circle(`cn${n.order}`, n.x, n.y, 11, {
            fill: tint(colorOf(n), n.order >= from ? 0.5 : 0.2), stroke: colorOf(n), sw: n.order >= from ? 2 : 1, text: String(n.total), size: 10, weight: 700, mono: true,
        }));
        return [...edges, ...dots];
    };
    const found = (upTo: number) => comb.result.filter(r => combNodes.find(n => n.status === 'found' && py(n.path) === py(r))!.order <= upTo);
    const foundText = (upTo: number) => label('found', 14, 226, `found: ${found(upTo).map(py).join('  ') || '–'}`, C.green, { size: 12 });
    const orderOf = (p: number[]) => combNodes.find(n => py(n.path) === py(p))!.order;
    // Each frame shows the search up to the end of one stretch of it.
    const chunks: [number[], string][] = [
        [[2, 2, 2, 2], 'Keep choosing 2: totals 2, 4, 6, 8. Total = 8 is a hit: record [2, 2, 2, 2].'],
        [[2, 2, 2, 5], 'Back up to 6 and try 3 (total 9) and 5 (total 11): both over 8. Stop each one at once — that is the pruning.'],
        [[2, 2, 3, 5], 'Back up to 4 and choose 3 (total 7). Adding 3 or 5 overshoots: prune both.'],
        [[2, 2, 5], 'From 4, choose 5: total 9, over. Prune. Everything under [2, 2] is done.'],
        [[2, 3, 3], 'Back to [2], choose 3 (total 5), then 3 again: total 8, a hit. Record [2, 3, 3].'],
        [[2, 5, 5], '[2, 3, 5] is over. Then [2, 5] (total 7) and [2, 5, 5] (total 12): over. Branch [2] is finished.'],
        [[3, 3, 5], 'Branch [3] only tries 3 and 5 — never 2 again, which is what stops [3, 2, 3] repeating [2, 3, 3]. [3, 3] then overshoots both ways.'],
        [[3, 5], '[3, 5]: total 8, a hit. Record it.'],
        [[5, 5], 'Branch [5] can only add 5: total 10, over. The search is complete.'],
    ];
    const medium: Frame[] = [
        frame('Find every combination of 2, 3 and 5 that adds up to 8 (each number can be reused). Each circle is the running total of one path.', [combTree(0, 0), foundText(0)]),
    ];
    let from = 1;
    chunks.forEach(([p, caption]) => {
        const upTo = orderOf(p);
        medium.push(frame(caption, [combTree(upTo, from), foundText(upTo)], 4200));
        from = upTo + 1;
    });
    medium.push(frame(`Answer: ${py(comb.result)}. Green = hit, red = pruned the moment the total passed 8. Pruning early is what keeps backtracking fast enough.`, [combTree(99, 99), foundText(99)], 7000));

    return {
        title: 'Backtracking: choose, explore, un-choose — and prune dead ends',
        variants: [
            { label: 'Subsets', frames: easy },
            { label: 'Combination Sum', frames: medium },
        ],
    };
};

// ============ Tries ============

interface TrieNode { id: string; ch: string; word: boolean; children: Map<string, TrieNode> }

const newNode = (id: string, ch: string): TrieNode => ({ id, ch, word: false, children: new Map() });

const insert = (root: TrieNode, word: string) => {
    let node = root;
    const created: string[] = [];
    for (const ch of word) {
        if (!node.children.has(ch)) {
            const child = newNode(`${node.id}${ch}`, ch);
            node.children.set(ch, child);
            created.push(child.id);
        }
        node = node.children.get(ch)!;
    }
    node.word = true;
    return created;
};

const walk = (root: TrieNode, text: string) => {
    let node: TrieNode | undefined = root;
    const path: string[] = [];
    for (const ch of text) {
        node = node.children.get(ch);
        if (!node) return { node: null, path };
        path.push(node.id);
    }
    return { node, path };
};

const cloneTrie = (node: TrieNode): TrieNode => ({ ...node, children: new Map([...node.children].map(([k, v]) => [k, cloneTrie(v)])) });

const runTrie = () => {
    const root = newNode('r', '');
    const snaps: TrieNode[] = [];
    const created: string[][] = [];
    created.push(insert(root, 'app'));
    snaps.push(cloneTrie(root));
    created.push(insert(root, 'apple'));
    snaps.push(cloneTrie(root));
    const lookups: { op: 'search' | 'startsWith'; text: string }[] = [
        { op: 'search', text: 'app' }, { op: 'search', text: 'ap' }, { op: 'startsWith', text: 'ap' }, { op: 'search', text: 'apt' },
    ];
    const answers = lookups.map(({ op, text }) => {
        const { node, path } = walk(root, text);
        const ok = op === 'search' ? node !== null && node.word : node !== null;
        return { op, text, path, ok };
    });
    return { snaps, created, answers, result: answers.map(a => py(a.ok)).join(', ') };
};

/** Wildcard search, recording every node it steps on, in order. */
const runWildcard = () => {
    const root = newNode('r', '');
    ['bad', 'dad', 'mad'].forEach(w => insert(root, w));
    const search = (node: TrieNode, word: string, i: number, trail: string[]): boolean => {
        if (i === word.length) return node.word;
        const ch = word[i];
        if (ch === '.') {
            for (const child of node.children.values()) {
                trail.push(child.id);
                if (search(child, word, i + 1, trail)) return true;
            }
            return false;
        }
        const child = node.children.get(ch);
        if (!child) return false;
        trail.push(child.id);
        return search(child, word, i + 1, trail);
    };
    const searches = ['.ad', 'b..', 'pa.'].map(word => {
        const trail: string[] = [];
        const ok = search(root, word, 0, trail);
        return { word, trail, ok };
    });
    return { root, searches, result: searches.map(s => py(s.ok)).join(', ') };
};

const tries = (): AnimationSpec => {
    const run = runTrie();
    // 'app' and 'apple' share a prefix, so the trie is one chain: root → a → p → p → l → e.
    const chainIds = ['r', 'ra', 'rap', 'rapp', 'rappl', 'rapple'];
    const chainX = (k: number) => 34 + k * 64;
    const cy = 96;
    const chain = (trie: TrieNode | null, lit: string[], color: string = C.amber, fresh: string[] = []): Part[] => {
        const exists = (id: string) => {
            if (!trie) return id === 'r';
            let node: TrieNode | undefined = trie;
            for (const ch of id.slice(1)) node = node?.children.get(ch);
            return node !== undefined;
        };
        const isWord = (id: string) => {
            let node: TrieNode | undefined = trie ?? undefined;
            for (const ch of id.slice(1)) node = node?.children.get(ch);
            return node?.word === true;
        };
        return chainIds.filter(exists).map((id, k) => {
            const on = lit.includes(id);
            const isFresh = fresh.includes(id);
            const c = on ? color : isFresh ? C.cyan : C.violet;
            return [
                k > 0 && arrow(`te${k}`, chainX(k - 1) + 19, cy, chainX(k) - 21, cy, { stroke: on ? color : C.dim, sw: 2 }),
                circle(id, chainX(k), cy, 19, { fill: tint(c, on || isFresh ? 0.5 : 0.2), stroke: c, sw: 2, text: k === 0 ? 'root' : id[id.length - 1], size: k === 0 ? 10 : 15, weight: 700, mono: true }),
                isWord(id) && circle(`${id}-end`, chainX(k), cy, 24, { fill: 'none', stroke: C.green, sw: 2.5 }),
            ];
        });
    };
    const opText = (value: string) => label('op', 14, 26, value, C.ink, { size: 14 });
    const answer = (value: string, ok: boolean) => label('ans', 14, 200, value, ok ? C.green : C.red, { size: 14 });
    const legend = label('legend', 386, 200, '◯ green ring = end of a word', C.green, { size: 11, anchor: 'end', mono: false });
    const easy: Frame[] = [
        frame('A trie stores words letter by letter along paths from the root. Words that share a start share a path. It starts as just the root.', [chain(null, []), opText('empty trie')]),
        frame('insert \'app\': create a → p → p, then mark the last p as the end of a word (green ring).', [chain(run.snaps[0], [], C.amber, run.created[0]), opText('insert \'app\''), legend]),
        frame('insert \'apple\': a → p → p already exist — walk them. Create only l → e, and mark e as a word end.', [chain(run.snaps[1], ['ra', 'rap', 'rapp'], C.amber, run.created[1]), opText('insert \'apple\''), legend]),
    ];
    run.answers.forEach(a => {
        const call = `${a.op}('${a.text}')`;
        const caption = a.op === 'startsWith'
            ? `startsWith('${a.text}'): follow ${[...a.text].join(' → ')}. The path exists, and that is all a prefix check needs: True.`
            : a.path.length < a.text.length
                ? `search('${a.text}'): follow ${[...a.text.slice(0, a.path.length)].join(' → ')}, then look for '${a.text[a.path.length]}'. There is no such child: False. It took ${a.path.length + 1} steps, not a scan of every word.`
                : a.ok
                    ? `search('${a.text}'): follow ${[...a.text].join(' → ')}. The last p has the word-end ring: True.`
                    : `search('${a.text}'): follow ${[...a.text].join(' → ')}. The path exists, but this p has no word-end ring — 'ap' was never inserted: False.`;
        easy.push(frame(caption, [
            chain(run.snaps[1], a.path, a.ok ? C.green : C.amber),
            a.path.length < a.text.length && [
                line('miss', chainX(a.path.length) + 14, cy + 14, chainX(a.path.length) + 40, cy + 54, { stroke: C.red, sw: 2, dash: '4 3' }),
                circle('miss-n', chainX(a.path.length) + 48, cy + 66, 15, { fill: 'none', stroke: C.red, sw: 2, dash: '4 3', text: `${a.text[a.path.length]}?`, textColor: C.red, size: 12, weight: 700, mono: true }),
            ],
            opText(call), answer(`→ ${py(a.ok)}`, a.ok), legend,
        ]));
    });
    easy.push(frame(`Results: ${run.result}. Each lookup costs the length of the word, however many words are stored.`, [chain(run.snaps[1], []), opText('done'), label('ans', 14, 200, run.result, C.ink, { size: 14 }), legend]));

    // Wildcard search
    const wild = runWildcard();
    const pos: Record<string, [number, number]> = { r: [200, 30] };
    ['b', 'd', 'm'].forEach((first, k) => {
        const x = 90 + k * 110;
        pos[`r${first}`] = [x, 82];
        pos[`r${first}a`] = [x, 130];
        pos[`r${first}ad`] = [x, 178];
    });
    const parentOf = (id: string) => id.slice(0, -1);
    const wTrie = (trail: string[], ok: boolean | null): Part[] => Object.entries(pos).map(([id, [x, y]]) => {
        const on = trail.includes(id);
        const color = on ? (ok === false ? C.amber : C.green) : C.violet;
        return [
            id !== 'r' && line(`we-${id}`, pos[parentOf(id)][0], pos[parentOf(id)][1] + 17, x, y - 17, { stroke: on ? color : C.dim, sw: on ? 3 : 2 }),
            circle(`w-${id}`, x, y, 17, { fill: tint(color, on ? 0.5 : 0.2), stroke: color, sw: 2, text: id === 'r' ? 'root' : id[id.length - 1], size: id === 'r' ? 10 : 14, weight: 700, mono: true }),
            id.length === 4 && circle(`w-${id}-end`, x, y, 22, { fill: 'none', stroke: C.green, sw: 2 }),
        ];
    });
    const wOp = (value: string) => label('op', 14, 222, value, C.ink, { size: 14 });
    const medium: Frame[] = [
        frame('The words bad, dad and mad in a trie. A \'.\' in a search matches any one letter, so at a \'.\' the search must try every child.', [wTrie([], null), wOp('words: bad, dad, mad')]),
    ];
    wild.searches.forEach(s => {
        const caption = s.word === '.ad'
            ? '.ad: the first letter is \'.\', so try each child in turn. The first, b, leads to a → d, a word end: True. The search stops at the first success.'
            : s.word === 'b..'
                ? 'b..: follow b. Then \'.\': try each child of b — just a. Then \'.\' again: try a\'s children — just d, a word end: True.'
                : 'pa.: the root has no child \'p\'. A plain letter that is missing ends the search at once: False.';
        const missing = !s.ok && s.trail.length === 0 && [
            line('miss', 217, 32, 252, 40, { stroke: C.red, sw: 2, dash: '4 3' }),
            circle('miss-n', 268, 42, 15, { fill: 'none', stroke: C.red, sw: 2, dash: '4 3', text: `${s.word[0]}?`, textColor: C.red, size: 12, weight: 700, mono: true }),
        ];
        medium.push(frame(caption, [wTrie(['r', ...s.trail], s.ok), missing, wOp(`search('${s.word}') → ${py(s.ok)}`)], 6000));
    });
    medium.push(frame(`Results: ${wild.result}. Plain letters follow one path; each '.' branches out — a small depth-first search inside the trie.`, [wTrie([], null), wOp(wild.result)]));

    return {
        title: 'A trie: words stored letter by letter, sharing their starts',
        variants: [
            { label: 'Insert and search', frames: easy },
            { label: 'Wildcard search', frames: medium },
        ],
    };
};

export const structuresAnimations: Record<string, () => AnimationSpec> = {
    'linked-list': linkedList,
    trees,
    'heap-priority-queue': heapPriorityQueue,
    backtracking,
    tries,
};

export const structuresResults: Record<string, { easy: () => string; medium: () => string }> = {
    'linked-list': { easy: () => py(runReverse([1, 2, 3, 4]).result), medium: () => py(runRemoveNth([1, 2, 3, 4, 5], 2).result) },
    trees: {
        easy: () => py(runMaxDepth(buildTree(TREE, 0, 0, 1, 1)).result),
        medium: () => py(runLevelOrder(buildTree(TREE, 0, 0, 1, 1)).result),
    },
    'heap-priority-queue': { easy: () => py(runLastStone([2, 7, 4, 1, 8, 1]).result), medium: () => py(runKthLargest([3, 2, 1, 5, 6, 4], 2).result) },
    backtracking: { easy: () => py(runSubsets([1, 2, 3]).result), medium: () => py(runCombinationSum([2, 3, 5], 8).result) },
    tries: { easy: () => runTrie().result, medium: () => runWildcard().result },
};
