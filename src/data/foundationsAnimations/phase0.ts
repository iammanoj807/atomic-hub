import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import {
    C,
    arrow,
    axes,
    axisLines,
    box,
    cellAt,
    cells,
    chips,
    circle,
    dot,
    frame,
    growPath,
    line,
    lineInBox,
    lit,
    path,
    pt,
    px,
    py,
    range,
    rect,
    seeded,
    text,
    tint,
    type Part,
} from '../../components/learning/anim/kit';

// Phase 0 · Toolkit. Every number shown was produced by running the lesson's
// own code (see the topic notes in foundationsCourse/phase0.ts).

const fmt = (n: number) => Math.round(n).toLocaleString('en-GB');

// ============ f0-t6 · Meet machine learning: the learning loop ============

const learningLoop = (): AnimationSpec => {
    const a = axes(48, 22, 205, 170, 0, 140, 0, 450);
    const X = [50, 80, 120];
    const Y = [150, 240, 360];
    const loopBoxes = (on: 0 | 1 | 2 | null): Shape[] => {
        const spec: [string, string, string][] = [['predict', '1 · Predict', C.cyan], ['loss', '2 · Loss', C.pink], ['adjust', '3 · Adjust', C.amber]];
        return spec.map(([id, label, color], index) => {
            const shape = box(`loop-${id}`, 286, 26 + index * 46, 104, 32, label, color);
            return (on === index ? lit(shape, color) : shape) as Shape;
        });
    };
    const loopArrows = [
        arrow('loop-a1', 338, 58, 338, 70, { stroke: C.grey, sw: 2 }),
        arrow('loop-a2', 338, 104, 338, 116, { stroke: C.grey, sw: 2 }),
        path('loop-back', [[286, 132], [276, 132], [276, 42], [284, 42]], { stroke: C.grey, sw: 2, arrow: true }),
    ];
    const base: Part[] = [
        axisLines('ax', a, 'size (m²)', 'price (£1,000s)'),
        [40, 80].map(v => text(`xt${v}`, px(a, v), a.y + a.h + 14, String(v), { size: 11, fill: C.dim })),
        [150, 300].map(v => text(`yt${v}`, a.x - 6, py(a, v), String(v), { size: 11, fill: C.dim, anchor: 'end' })),
        X.map((x, i) => dot(`house${i}`, ...pt(a, x, Y[i]), C.amber, 7)),
    ];
    const model = (w: number, b: number, errors: boolean): Part[] => [
        lineInBox('model', a, w, b, { stroke: C.cyan, sw: 3 }),
        X.map((x, i) => {
            const raw = w * x + b;
            const pred = Math.max(a.yMin, Math.min(a.yMax, raw));
            // A prediction far off the chart has no dot; its red gap runs to the edge.
            const onChart = raw >= a.yMin && raw <= a.yMax;
            return [
                errors && line(`err${i}`, ...pt(a, x, pred), ...pt(a, x, Y[i]), { stroke: C.red, sw: 3, dash: '4 3' }),
                onChart && circle(`pred${i}`, ...pt(a, x, pred), 5, { fill: C.bg, stroke: C.cyan, sw: 2.5 }),
            ];
        }),
    ];
    const readout = (w: string, loss: string): Part[] => [
        text('w', 338, 182, `w = ${w}`, { mono: true, size: 14, fill: C.cyan, weight: 700 }),
        text('loss', 338, 204, `loss = ${loss}`, { mono: true, size: 14, fill: C.pink, weight: 700 }),
    ];

    // From running the loop with lr = 0.0001: w after each step, and the loss at that w.
    const steps: [number, number, number][] = [
        [4.66, 0.05, 21416], [2.0806, 0.0223, 6561], [3.5083, 0.0376, 2010], [2.7181, 0.0292, 616],
        [3.1555, 0.0339, 189], [2.9134, 0.0313, 58], [3.0474, 0.0327, 18],
    ];
    const stepCaptions = [
        '3 · Adjust. The gradient says "tilt the line up". One step moves w to 4.66: too far. Now the model guesses too high.',
        'Loop again: predict, measure, adjust. w = 2.08 is now too low, but the loss has already fallen to 6,561.',
        'w = 3.51. Each swing overshoots by less than the one before.',
        'w = 2.72, loss 616.',
        'w = 3.16, loss 189.',
        'w = 2.91, loss 58.',
        'w = 3.05, loss 18. Closing in.',
    ];
    const good: Frame[] = [
        frame('Three houses. Size is the feature; price is the label — the right answer the model has to learn to predict.', [base, loopBoxes(null), loopArrows]),
        frame('1 · Predict. The model is ŷ = w·size + b. It starts knowing nothing (w = 0), so it predicts £0 for every house.', [base, model(0, 0, false), loopBoxes(0), loopArrows, readout('0.00', '?')]),
        frame('2 · Loss: how wrong is it? Each red gap is one error. Square the gaps and take the average: loss = 69,900.', [base, model(0, 0, true), loopBoxes(1), loopArrows, readout('0.00', '69,900')]),
        ...steps.map(([w, b, loss], i) =>
            frame(stepCaptions[i], [base, model(w, b, true), loopBoxes(i === 0 ? 2 : (i % 3) as 0 | 1 | 2), loopArrows, readout(w.toFixed(2), fmt(loss))], i >= 2 ? 2000 : undefined),
        ),
        frame('After 1,000 loops: w ≈ 3.00 and the loss is almost 0. The model has learned that each m² adds about £3,000.', [base, model(3.0, 0.03, true), loopBoxes(null), loopArrows, readout('3.00', '≈ 0')]),
        frame('Now test it on a house it has never seen: 100 m² → about £300k. If it does well on new data, deploy it.', [
            base, model(3.0, 0.03, false), loopBoxes(null), loopArrows, readout('3.00', '≈ 0'),
            dot('new', ...pt(a, 100, 300), C.green, 8),
            text('new-l', px(a, 100) - 8, py(a, 300) - 18, 'new house', { size: 12, fill: C.green, anchor: 'end', weight: 700 }),
        ]),
    ];

    const big: Frame[] = [
        good[0],
        good[1],
        good[2],
        frame('Same loop, learning rate 10 times bigger (0.001). One step sends w to 46.6: a near-vertical line. Loss: 14.8 million.', [base, model(46.6, 0.5, true), loopBoxes(2), loopArrows, readout('46.6', '14.8 m')]),
        frame('The next step overshoots the other way, even further: w = −630.7. The line points straight down, off the chart. Loss: 3.1 billion.', [
            base, model(-630.74, -6.77, false), loopBoxes(2), loopArrows, readout('−630.7', '3.1 bn'),
            text('off', px(a, 98), py(a, 70), 'line is off the chart ↓', { size: 13, fill: C.red, weight: 700 }),
        ]),
        frame('Three steps later w is 1.9 million and the loss is about 3 × 10¹⁶. Every step lands further from the answer than the last. Too big a step never settles: make it smaller.', [
            base, loopBoxes(null), loopArrows, readout('1.9 m', '3×10¹⁶'),
            text('off', px(a, 98), py(a, 70), 'loss exploding ↑↑', { size: 14, fill: C.red, weight: 800 }),
        ]),
    ];

    return {
        title: 'The learning loop: predict, measure the loss, adjust, repeat',
        variants: [
            { label: 'Learning rate 0.0001 (works)', frames: good },
            { label: 'Learning rate 0.001 (too big)', frames: big },
        ],
    };
};

// ============ f0-t1 · NumPy arrays, shapes and indexing ============

const arrays = (): AnimationSpec => {
    const values = Array.from({ length: 12 }, (_, i) => i);
    const plain = tint(C.blue, 0.2);
    const hot = tint(C.amber, 0.75);
    const code = (id: string, value: string) => text(id, 200, 16, value, { mono: true, size: 13, fill: C.ink, weight: 700 });
    const result = (value: string, color: string = C.amber) => text('result', 200, 222, value, { mono: true, size: 14, fill: color, weight: 700 });

    // The 12 numbers in one row: shape (12,).
    const row = values.map(v => rect(`n${v}`, 27 + v * 29, 100, 26, 26, { rx: 4, fill: plain, stroke: C.faint, sw: 1, text: String(v), size: 12, mono: true, weight: 600 }));

    // The same numbers as a 3 × 4 grid. `pick` decides which cells light up.
    const G = { x: 118, y: 54, size: 40 };
    const grid = (pick: (r: number, c: number) => boolean) => [
        ...cells('g', G.x, G.y, 3, 4, G.size, (r, c) => String(r * 4 + c), (r, c) => (pick(r, c) ? hot : plain), { gap: 4 })
            .map(cell => {
                const [, r, c] = cell.id.split('-').map(Number);
                return { ...cell, id: `n${r * 4 + c}` };
            }),
        [0, 1, 2, 3].map(c => text(`col${c}`, cellAt(G.x, G.y, G.size, 0, c, 4).cx, G.y - 12, String(c), { size: 11, fill: C.grey })),
        [0, 1, 2].map(r => text(`row${r}`, G.x - 14, cellAt(G.x, G.y, G.size, r, 0, 4).cy, String(r), { size: 11, fill: C.grey })),
        text('lab-c', G.x + 190, G.y - 12, '← column', { size: 11, fill: C.dim, anchor: 'start' }),
        text('lab-r', G.x - 14, G.y + 150, 'row ↑', { size: 11, fill: C.dim }),
    ];
    // Transposed: 4 rows × 3 columns. Number v moves from (r, c) to (c, r).
    const T = { x: 142, y: 40, size: 34 };
    const transposed = cells('t', T.x, T.y, 4, 3, T.size, (r, c) => String(c * 4 + r), () => tint(C.violet, 0.35), { gap: 4 })
        .map(cell => {
            const [, r, c] = cell.id.split('-').map(Number);
            return { ...cell, id: `n${c * 4 + r}` };
        });

    return {
        title: 'One grid of numbers, many ways to look at it',
        variants: [{
            label: 'Indexing',
            frames: [
                frame('np.arange(12) makes the numbers 0 to 11 in one row. One direction, 12 long: shape (12,).', [code('code', 'a = np.arange(12)'), row, result('a.shape → (12,)', C.cyan)]),
                frame('reshape(3, 4) folds the same 12 numbers into 3 rows of 4. Nothing is copied or changed; only the shape is new: (3, 4).', [code('code', 'A = a.reshape(3, 4)'), grid(() => false), result('A.shape → (3, 4)', C.cyan)]),
                frame('A[1, 2] means row 1, column 2. Counting starts at 0, so that is the second row and third column: 6.', [code('code', 'A[1, 2]'), grid((r, c) => r === 1 && c === 2), result('→ 6')]),
                frame('A[:, 0]: the colon means "every row". So this is column 0 of every row: [0, 4, 8], shape (3,).', [code('code', 'A[:, 0]'), grid((_, c) => c === 0), result('→ array([0, 4, 8])')]),
                frame('A[1] with one index picks a whole row: [4, 5, 6, 7]. Missing indexes mean "all of that direction".', [code('code', 'A[1]'), grid(r => r === 1), result('→ array([4, 5, 6, 7])')]),
                frame('A[A > 6] keeps only the cells where the test is True. This is a boolean mask, and the result is always flat.', [code('code', 'A[A > 6]'), grid((r, c) => r * 4 + c > 6), result('→ array([7, 8, 9, 10, 11])')]),
                frame('A.T (transpose) swaps rows and columns: the 3 × 4 grid becomes 4 × 3. Row 0 [0, 1, 2, 3] is now column 0.', [code('code', 'A.T'), transposed, result('A.T.shape → (4, 3)', C.violet)]),
            ],
        }],
    };
};

// ============ f0-t2 · Broadcasting and vectorisation ============

const broadcasting = (): AnimationSpec => {
    const S = 32;
    const gap = 3;
    const gridAt = (x0: number, y0: number, r: number, c: number) => cellAt(x0, y0, S, r, c, gap);
    const cell = (id: string, x0: number, y0: number, r: number, c: number, value: string, color: string, o: { ghost?: boolean; hot?: boolean; from?: [number, number] } = {}) => {
        const at = gridAt(x0, y0, o.from ? o.from[0] : r, o.from ? o.from[1] : c);
        return rect(id, at.x, at.y, S, S, {
            rx: 4,
            fill: tint(color, o.hot ? 0.8 : o.ghost ? 0.14 : 0.35),
            stroke: o.hot ? C.ink : color,
            sw: o.hot ? 2 : 1,
            dash: o.ghost ? '3 3' : undefined,
            text: value,
            size: 12,
            mono: true,
            weight: 700,
            opacity: o.from ? 0 : 1,
        });
    };
    const A = { x: 18, y: 72 };
    const B = { x: 150, y: 72 };
    const R = { x: 282, y: 72 };
    const titles = (left: string, mid: string, right?: string): Part[] => [
        text('tA', A.x + 51, 52, left, { size: 12, fill: C.cyan, mono: true, weight: 700 }),
        text('tB', B.x + 51, 52, mid, { size: 12, fill: C.pink, mono: true, weight: 700 }),
        right !== undefined && text('tR', R.x + 51, 52, right, { size: 12, fill: C.green, mono: true, weight: 700 }),
        text('plus', 134, 123, '+', { size: 22, fill: C.ink, weight: 800 }),
        right !== undefined && text('eq', 266, 123, '=', { size: 22, fill: C.ink, weight: 800 }),
    ];

    // Example 1: scores (3, 1) + bonus (1, 3).
    const sc = [70, 80, 90];
    const bo = [0, 5, 10];
    const scoresCol = sc.map((v, r) => cell(`a-${r}-0`, A.x, A.y, r, 0, String(v), C.cyan));
    const bonusRow = bo.map((v, c) => cell(`b-0-${c}`, B.x, B.y, 0, c, String(v), C.pink));
    const scoresCopies = (out: boolean) => sc.flatMap((v, r) => [1, 2].map(c => cell(`a-${r}-${c}`, A.x, A.y, r, c, String(v), C.cyan, { ghost: true, from: out ? undefined : [r, 0] })));
    const bonusCopies = (out: boolean) => bo.flatMap((v, c) => [1, 2].map(r => cell(`b-${r}-${c}`, B.x, B.y, r, c, String(v), C.pink, { ghost: true, from: out ? undefined : [0, c] })));
    const result = (hot?: [number, number]) => sc.flatMap((s, r) => bo.map((b, c) => cell(`r-${r}-${c}`, R.x, R.y, r, c, String(s + b), C.green, { hot: hot && hot[0] === r && hot[1] === c })));
    const rule = (value: string, color: string = C.ink) => text('rule', 200, 210, value, { size: 13, fill: color, weight: 700, mono: true });

    const fits: Frame[] = [
        frame('scores is one column, shape (3, 1). bonus is one row, shape (1, 3). We want every score plus every bonus.', [titles('scores (3,1)', 'bonus (1,3)'), scoresCol, bonusRow]),
        frame('NumPy lines the shapes up from the right and compares each pair. Two sizes fit if they are equal, or if one of them is 1.', [titles('scores (3,1)', 'bonus (1,3)'), scoresCol, bonusRow, scoresCopies(false), bonusCopies(false), rule('(3, 1) vs (1, 3): 1↔3 ✓  3↔1 ✓', C.green)]),
        frame('A size of 1 stretches to match. scores is stretched across into 3 columns. No memory is copied: NumPy just re-reads the same column.', [titles('scores (3,1)', 'bonus (1,3)'), scoresCol, scoresCopies(true), bonusRow, bonusCopies(false), rule('stretch scores → (3, 3)', C.cyan)]),
        frame('bonus is stretched down into 3 rows. Now both are (3, 3).', [titles('scores (3,1)', 'bonus (1,3)'), scoresCol, scoresCopies(true), bonusRow, bonusCopies(true), rule('stretch bonus → (3, 3)', C.pink)]),
        frame('Add cell by cell. Nine additions, one line of code, no Python loop: that is vectorisation.', [titles('scores (3,1)', 'bonus (1,3)', 'result (3,3)'), scoresCol, scoresCopies(true), bonusRow, bonusCopies(true), result(), rule('scores + bonus', C.green)]),
        frame('Each cell is one score plus one bonus. Bottom right: 90 + 10 = 100.', [
            titles('scores (3,1)', 'bonus (1,3)', 'result (3,3)'),
            scoresCol, scoresCopies(true).map(s => (s.id === 'a-2-2' ? { ...s, fill: tint(C.cyan, 0.8), stroke: C.ink, sw: 2, dash: undefined } : s)),
            bonusRow, bonusCopies(true).map(s => (s.id === 'b-2-2' ? { ...s, fill: tint(C.pink, 0.8), stroke: C.ink, sw: 2, dash: undefined } : s)),
            result([2, 2]), rule('90 + 10 = 100', C.green),
        ]),
    ];

    // Example 2: the silent bug, (3,) + (3, 1).
    const av = [1, 2, 3];
    const bv = [10, 20, 30];
    const aRow = av.map((v, c) => cell(`a-0-${c}`, A.x, A.y, 0, c, String(v), C.cyan));
    const bCol = bv.map((v, r) => cell(`b-${r}-0`, B.x, B.y, r, 0, String(v), C.pink));
    const aCopies = (out: boolean) => av.flatMap((v, c) => [1, 2].map(r => cell(`a-${r}-${c}`, A.x, A.y, r, c, String(v), C.cyan, { ghost: true, from: out ? undefined : [0, c] })));
    const bCopies = (out: boolean) => bv.flatMap((v, r) => [1, 2].map(c => cell(`b-${r}-${c}`, B.x, B.y, r, c, String(v), C.pink, { ghost: true, from: out ? undefined : [r, 0] })));
    const bug = av.flatMap((x, c) => bv.map((y, r) => cell(`r-${r}-${c}`, R.x, R.y, r, c, String(x + y), C.red)));
    const silent: Frame[] = [
        frame('You meant to add two lists of 3 numbers pairwise: [1, 2, 3] + [10, 20, 30] → [11, 22, 33]. But b is a column, shape (3, 1).', [titles('a (3,)', 'b (3,1)'), aRow, bCol]),
        frame('A 1-D array of shape (3,) lines up with the last direction, so it acts like a row, (1, 3). Row + column: both stretch.', [titles('a (3,)', 'b (3,1)'), aRow, aCopies(true), bCol, bCopies(true), rule('(1, 3) vs (3, 1) → (3, 3)', C.amber)]),
        frame('No error, but you get 9 numbers instead of 3. Every later step can now be silently wrong.', [titles('a (3,)', 'b (3,1)', 'oops (3,3)'), aRow, aCopies(true), bCol, bCopies(true), bug, rule('result.shape == (3, 3)  ✗', C.red)]),
        frame('Fix: make the shapes match on purpose (b.ravel() gives shape (3,)). Then assert the shape you expect, so a test catches it.', [
            titles('a (3,)', 'b.ravel() (3,)', 'result (3,)'),
            aRow, bv.map((v, c) => cell(`b-0-${c}`, B.x, B.y, 0, c, String(v), C.pink)),
            av.map((x, c) => cell(`r-0-${c}`, R.x, R.y, 0, c, String(x + bv[c]), C.green)),
            rule('assert result.shape == (3,)  ✓', C.green),
        ]),
    ];

    return {
        title: 'Broadcasting: stretching size-1 directions so shapes fit',
        variants: [
            { label: '(3, 1) + (1, 3)', frames: fits },
            { label: 'The silent bug', frames: silent },
        ],
    };
};

// ============ f0-t3 · Plotting results with Matplotlib ============

const lossCurves = (): AnimationSpec => {
    const a = axes(52, 18, 318, 168, 0, 100, 0, 2.5);
    const n = 60;
    const ts = range(0, 100, n);
    const axisBits = (yTicks: [number, string][] = [[0, '0'], [1, '1'], [2, '2']]): Part[] => [
        axisLines('ax', a, 'training step', 'loss'),
        yTicks.map(([v, label]) => text(`yt-${label}`, a.x - 8, py(a, v), label, { size: 11, fill: C.dim, anchor: 'end' })),
    ];
    const pts = (f: (t: number) => number, ax = a) => ts.map(t => pt(ax, t, Math.min(ax.yMax, Math.max(ax.yMin, f(t)))));
    const label = (id: string, x: number, y: number, value: string, color: string) => text(id, x, y, value, { size: 12, fill: color, weight: 700, anchor: 'start' });

    const healthy = pts(t => 0.4 + 1.9 * Math.exp(-t / 16));
    const healthyFrames: Frame[] = [
        frame('Plot the loss after every training step. Step on the x-axis, loss on the y-axis.', [axisBits(), growPath('train', healthy, 0, { stroke: C.cyan })]),
        frame('Early on, the loss drops fast: the model picks up the easy patterns first.', [axisBits(), growPath('train', healthy, 0.3, { stroke: C.cyan })]),
        frame('Then the curve bends and flattens. Each step still helps, but only a little.', [axisBits(), growPath('train', healthy, 0.7, { stroke: C.cyan })]),
        frame('A healthy loss curve: a fast fall, then a slow, steady level. If it is still sloping down at the end, train for longer.', [axisBits(), growPath('train', healthy, 1, { stroke: C.cyan }), label('lab', 290, py(a, 0.62), 'healthy', C.cyan)]),
    ];

    const train = pts(t => 0.12 + 2.0 * Math.exp(-t / 18));
    const valFn = (t: number) => 0.62 + 1.6 * Math.exp(-t / 14) + 0.012 * Math.max(0, t - 30);
    const val = pts(valFn);
    let best = 0;
    ts.forEach((t, i) => { if (valFn(t) < valFn(ts[best])) best = i; });
    const overfitFrames: Frame[] = [
        frame('Now plot two curves: loss on the training data (blue) and on held-out validation data (pink).', [axisBits(), growPath('train', train, 0, { stroke: C.cyan }), growPath('val', val, 0, { stroke: C.pink })]),
        frame('At first both fall together: the model is learning patterns that work on new data too.', [axisBits(), growPath('train', train, 0.35, { stroke: C.cyan }), growPath('val', val, 0.35, { stroke: C.pink })]),
        frame('Then they split. Training loss keeps falling while validation loss climbs: the model is memorising the training set. That is overfitting.', [axisBits(), growPath('train', train, 1, { stroke: C.cyan }), growPath('val', val, 1, { stroke: C.pink }), label('l1', 300, py(a, 0.32), 'train', C.cyan), label('l2', 300, py(a, 1.55), 'validation', C.pink)]),
        frame('Keep the model from the lowest point of the validation curve. Stopping there is called early stopping.', [
            axisBits(), growPath('train', train, 1, { stroke: C.cyan }), growPath('val', val, 1, { stroke: C.pink }),
            label('l1', 300, py(a, 0.32), 'train', C.cyan), label('l2', 300, py(a, 1.55), 'validation', C.pink),
            line('best', val[best][0], a.y, val[best][0], a.y + a.h, { stroke: C.green, dash: '5 4', sw: 2 }),
            dot('bestdot', val[best][0], val[best][1], C.green, 7),
            text('bestl', val[best][0] + 6, a.y + 8, 'stop here', { size: 12, fill: C.green, anchor: 'start', weight: 800 }),
        ]),
    ];

    const rand = seeded(7);
    const spiky = pts(t => 1.3 + 0.5 * Math.sin(t * 0.7) * (0.6 + rand()) + 0.008 * t);
    const tooHighFrames: Frame[] = [
        frame('With the learning rate set too high, each step jumps over the bottom of the valley.', [axisBits(), growPath('train', spiky, 0, { stroke: C.amber })]),
        frame('The loss bounces up and down instead of falling. Spikes like these are the warning sign.', [axisBits(), growPath('train', spiky, 0.6, { stroke: C.amber })]),
        frame('Often it climbs and finally turns into NaN ("not a number"). The fix: divide the learning rate by 3 to 10 and try again.', [
            axisBits(), growPath('train', spiky, 1, { stroke: C.amber }),
            text('nan', 352, a.y + 10, 'NaN!', { size: 16, fill: C.red, weight: 800 }),
        ]),
    ];

    // A loss falling from 1,000 to 0.01, shown on a normal axis and then on a log axis.
    const lin = axes(52, 18, 318, 168, 0, 100, 0, 1000);
    const lg = axes(52, 18, 318, 168, 0, 100, -2, 3);
    const decay = (t: number) => 1000 * 10 ** (-5 * t / 100);
    const linPts = pts(decay, lin);
    const logPts = ts.map(t => pt(lg, t, Math.log10(decay(t))));
    const logFrames: Frame[] = [
        frame('This loss falls from 1,000 to 0.01. On a normal y-axis, everything after step 20 looks like zero, so the late progress is hidden.', [
            axisLines('ax', lin, 'training step', 'loss'),
            [[0, '0'], [500, '500'], [1000, '1000']].map(([v, l]) => text(`yt-${l}`, lin.x - 8, py(lin, Number(v)), String(l), { size: 11, fill: C.dim, anchor: 'end' })),
            path('curve', linPts, { stroke: C.violet }),
        ]),
        frame('The same numbers on a log scale: each gridline is 10 times smaller than the one above. The loss is still improving steadily all the way.', [
            axisLines('ax', lg, 'training step', 'loss (log)'),
            [[3, '1000'], [1, '10'], [-1, '0.1']].map(([v, l]) => text(`yl-${l}`, lg.x - 8, py(lg, Number(v)), String(l), { size: 11, fill: C.dim, anchor: 'end' })),
            [3, 2, 1, 0, -1, -2].map(v => line(`grid${v}`, lg.x, py(lg, v), lg.x + lg.w, py(lg, v), { stroke: C.faint, sw: 1 })),
            path('curve', logPts, { stroke: C.violet }),
        ]),
        frame('That is why loss curves are usually drawn with plt.yscale("log"): small changes late in training become visible.', [
            axisLines('ax', lg, 'training step', 'loss (log)'),
            [[3, '1000'], [1, '10'], [-1, '0.1']].map(([v, l]) => text(`yl-${l}`, lg.x - 8, py(lg, Number(v)), String(l), { size: 11, fill: C.dim, anchor: 'end' })),
            [3, 2, 1, 0, -1, -2].map(v => line(`grid${v}`, lg.x, py(lg, v), lg.x + lg.w, py(lg, v), { stroke: C.faint, sw: 1 })),
            path('curve', logPts, { stroke: C.violet, sw: 3.5 }),
            text('code', 220, 206, 'plt.yscale("log")', { mono: true, size: 13, fill: C.violet, weight: 700 }),
        ]),
    ];

    return {
        title: 'Reading loss curves: what healthy and broken training look like',
        height: 230,
        variants: [
            { label: 'Healthy', frames: healthyFrames },
            { label: 'Overfitting', frames: overfitFrames },
            { label: 'Learning rate too high', frames: tooHighFrames },
            { label: 'Why log scale', frames: logFrames },
        ],
    };
};

// ============ f0-t4 · Git and GitHub ============

const git = (): AnimationSpec => {
    // The four places a change lives.
    const places: [string, string, string][] = [
        ['work', 'Working\nfolder', C.amber],
        ['stage', 'Staging\narea', C.violet],
        ['local', 'Local\nrepo', C.cyan],
        ['remote', 'GitHub', C.green],
    ];
    const placeBoxes = (on: number | null) => places.map(([id, label, color], i) => {
        const shape = box(`p-${id}`, 10 + i * 98, 40, 86, 64, label, color, { size: 12 });
        return on === i ? lit(shape, color) : shape;
    });
    const placeArrows = [0, 1, 2].map(i => arrow(`pa${i}`, 96 + i * 98, 72, 108 + i * 98, 72, { stroke: C.dim, sw: 2 }));
    const file = (at: number, label: string, color: string) => rect('file', 18 + at * 98, 120, 70, 26, { rx: 6, fill: tint(color, 0.4), stroke: color, sw: 1.5, text: label, size: 11, mono: true, weight: 700 });
    const cmd = (value: string, color: string = C.ink) => text('cmd', 200, 180, value, { mono: true, size: 14, fill: color, weight: 700 });
    const fourPlaces: Frame[] = [
        frame('Your change starts in the working folder: the files you edit. Git sees that model.py changed, but has saved nothing yet.', [placeBoxes(0), placeArrows, file(0, 'model.py ✎', C.amber), cmd('git status → modified: model.py', C.amber)]),
        frame('git add puts the change in the staging area: "this is going into my next snapshot". You choose exactly what to include.', [placeBoxes(1), placeArrows, file(1, 'model.py', C.violet), cmd('git add model.py', C.violet)]),
        frame('git commit saves a snapshot in your local repository, with a message saying why. You can always come back to it.', [placeBoxes(2), placeArrows, file(2, 'commit a1f', C.cyan), cmd('git commit -m "Add training loop"', C.cyan)]),
        frame('git push copies your commits to GitHub: an online backup, and proof of your work that employers can see.', [placeBoxes(3), placeArrows, file(2, 'commit a1f', C.cyan), rect('copy', 18 + 3 * 98, 120, 70, 26, { rx: 6, fill: tint(C.green, 0.4), stroke: C.green, sw: 1.5, text: 'commit a1f', size: 11, mono: true, weight: 700 }), cmd('git push', C.green)]),
    ];

    // Branches.
    const mainY = 160;
    const branchY = 84;
    const commit = (id: string, x: number, y: number, color: string, label: string, labelAbove = false) => [
        circle(id, x, y, 11, { fill: color, stroke: C.bg, sw: 2 }),
        text(`${id}-l`, x, labelAbove ? y - 22 : y + 24, label, { size: 11, fill: C.grey }),
    ];
    const head = (x: number, y: number, lift = 24) => text('head', x, y - lift, 'HEAD ▼', { size: 11, fill: C.yellow, weight: 800 });
    const mainLabel = text('main', 18, mainY, 'main', { size: 12, fill: C.cyan, anchor: 'start', weight: 800 });
    const c1 = commit('c1', 70, mainY, C.cyan, 'start');
    const c2 = commit('c2', 130, mainY, C.cyan, 'notes');
    const e1 = commit('e1', 210, branchY, C.pink, 'try idea', true);
    const m3 = commit('m3', 230, mainY, C.cyan, 'fix typo');
    const merge = commit('m4', 310, mainY, C.green, 'merge');
    const branchLabel = text('exp', 250, branchY, 'experiment', { size: 12, fill: C.pink, anchor: 'start', weight: 800 });
    const branches: Frame[] = [
        frame('Each dot is a commit: a snapshot of the whole project, plus a message. HEAD marks where you are.', [mainLabel, c1, head(70, mainY)]),
        frame('Commits form a line, newest on the right. Each one points back to the one before, so the history is never lost.', [mainLabel, line('l12', 81, mainY, 119, mainY, { stroke: C.cyan, sw: 3 }), c1, c2, head(130, mainY)]),
        frame('git switch -c experiment starts a new branch here. A branch is only a label on a commit, so this is instant and free.', [mainLabel, line('l12', 81, mainY, 119, mainY, { stroke: C.cyan, sw: 3 }), c1, c2, branchLabel, text('cmd', 200, 222, 'git switch -c experiment', { mono: true, size: 13, fill: C.pink, weight: 700 }), head(130, mainY)]),
        frame('Commit on the branch. main has not changed at all, so a risky idea can never break your working code.', [mainLabel, line('l12', 81, mainY, 119, mainY, { stroke: C.cyan, sw: 3 }), path('lb', [[138, mainY - 8], [200, branchY + 6]], { stroke: C.pink, sw: 3 }), c1, c2, e1, branchLabel, head(210, branchY, 42)]),
        frame('Meanwhile main moves on too: a typo fix. The two lines of work now differ.', [mainLabel, line('l12', 81, mainY, 119, mainY, { stroke: C.cyan, sw: 3 }), line('l23', 141, mainY, 219, mainY, { stroke: C.cyan, sw: 3 }), path('lb', [[138, mainY - 8], [200, branchY + 6]], { stroke: C.pink, sw: 3 }), c1, c2, e1, m3, branchLabel, head(230, mainY)]),
        frame('git merge experiment joins them in a merge commit. If both sides changed the same line, Git stops and you choose by hand: a merge conflict.', [
            mainLabel, line('l12', 81, mainY, 119, mainY, { stroke: C.cyan, sw: 3 }), line('l23', 141, mainY, 219, mainY, { stroke: C.cyan, sw: 3 }), line('l34', 241, mainY, 299, mainY, { stroke: C.green, sw: 3 }),
            path('lb', [[138, mainY - 8], [200, branchY + 6]], { stroke: C.pink, sw: 3 }), path('lm', [[220, branchY + 6], [302, mainY - 8]], { stroke: C.green, sw: 3 }),
            c1, c2, e1, m3, merge, branchLabel, head(310, mainY), text('cmd', 200, 222, 'git merge experiment', { mono: true, size: 13, fill: C.green, weight: 700 }),
        ]),
    ];

    return {
        title: 'Git: where your changes live, and how branches work',
        variants: [
            { label: 'add → commit → push', frames: fourPlaces },
            { label: 'Branches and merging', frames: branches },
        ],
    };
};

// ============ f0-t5 · Testing numerical code ============

const testing = (): AnimationSpec => {
    // A zoomed-in number line around 0.3.
    const L = { x0: 40, x1: 360, y: 120 };
    const at = (offset: number) => L.x0 + ((offset + 1) / 2) * (L.x1 - L.x0); // offset in units of 1e-16, from −1 to +1
    const numberLine: Part[] = [
        line('nl', L.x0, L.y, L.x1, L.y, { stroke: C.dim, sw: 2 }),
        text('zoom', 200, 168, 'zoomed in: the whole line is 0.0000000000000002 wide', { size: 11, fill: C.dim }),
    ];
    const exact = [line('t03', at(0), L.y - 14, at(0), L.y + 14, { stroke: C.cyan, sw: 3 }), text('t03l', at(0), L.y + 30, '0.3', { mono: true, size: 13, fill: C.cyan, weight: 700 })];
    const sum = [circle('sum', at(0.555), L.y, 7, { fill: C.amber }), text('suml', at(0.555), L.y - 28, '0.1 + 0.2', { mono: true, size: 13, fill: C.amber, weight: 700 })];
    const verdict = (value: string, color: string) => text('verdict', 200, 214, value, { mono: true, size: 15, fill: color, weight: 800 });
    const floats: Frame[] = [
        frame('Computers store decimals in binary, so most of them can only be stored approximately. 0.1 + 0.2 really comes out as 0.30000000000000004.', [text('big', 200, 70, '0.1 + 0.2 → 0.30000000000000004', { mono: true, size: 15, fill: C.amber, weight: 700 }), numberLine, exact, sum]),
        frame('== asks "exactly the same?" The two numbers differ in the 17th decimal place, so the answer is False.', [numberLine, exact, sum, verdict('0.1 + 0.2 == 0.3  →  False', C.red)]),
        frame('np.allclose asks "close enough?" It allows a tiny gap (about 0.000003 near 0.3). This gap is far smaller, so the answer is True.', [
            rect('band', L.x0, L.y - 22, L.x1 - L.x0, 44, { fill: tint(C.green, 0.18), stroke: C.green, sw: 1, dash: '4 3' }),
            text('bandl', 200, L.y - 34, 'allowed gap: the whole line, and far beyond', { size: 11, fill: C.green }),
            numberLine, exact, sum, verdict('np.allclose(0.1 + 0.2, 0.3)  →  True', C.green),
        ]),
    ];

    // A test that catches the softmax overflow bug.
    const row = (id: string, y: number, values: string[], color: string) => chips(id, 200 - (values.length * 64 + 10) / 2, y, values, color, { gap: 5, size: 13, h: 28 }).map((chip, i) => ({ ...chip, x: 200 - 101 + i * 69, w: 64 }));
    const label = (id: string, y: number, value: string, color: string = C.grey) => text(id, 22, y + 14, value, { size: 12, fill: color, anchor: 'start', weight: 700 });
    const softmaxBug: Frame[] = [
        frame('A test runs your code on a case where you already know the right answer. Here: softmax of [1000, 1001, 1002] must give probabilities that sum to 1.', [label('l1', 30, 'input', C.cyan), row('in', 30, ['1000', '1001', '1002'], C.cyan)]),
        frame('Softmax starts with exp(x). But exp(1000) is far bigger than the largest number a float can hold, so it overflows to inf.', [label('l1', 30, 'input', C.cyan), row('in', 30, ['1000', '1001', '1002'], C.cyan), label('l2', 78, 'exp(x)', C.red), row('exp', 78, ['inf', 'inf', 'inf'], C.red)]),
        frame('Dividing inf by inf gives NaN. The test fails, and you found the bug before it reached real training.', [label('l1', 30, 'input', C.cyan), row('in', 30, ['1000', '1001', '1002'], C.cyan), label('l2', 78, 'exp(x)', C.red), row('exp', 78, ['inf', 'inf', 'inf'], C.red), label('l3', 126, '÷ sum', C.red), row('out', 126, ['nan', 'nan', 'nan'], C.red), verdict('test failed ✗', C.red)]),
        frame('The fix: subtract the largest value first. [1000, 1001, 1002] becomes [−2, −1, 0]. The answer is mathematically the same, and nothing overflows.', [label('l1', 30, 'x − max', C.amber), row('in', 30, ['-2', '-1', '0'], C.amber), label('l2', 78, 'exp', C.cyan), row('exp', 78, ['0.135', '0.368', '1.0'], C.cyan)]),
        frame('Divide by the sum (1.503): [0.090, 0.245, 0.665]. They sum to 1, so the test passes. Keep the test, and the bug can never come back.', [label('l1', 30, 'x − max', C.amber), row('in', 30, ['-2', '-1', '0'], C.amber), label('l2', 78, 'exp', C.cyan), row('exp', 78, ['0.135', '0.368', '1.0'], C.cyan), label('l3', 126, '÷ sum', C.green), row('out', 126, ['0.090', '0.245', '0.665'], C.green), verdict('np.allclose(p.sum(), 1) ✓', C.green)]),
    ];

    return {
        title: 'Why tests on decimals need a tolerance, and how a test catches a bug',
        variants: [
            { label: '0.1 + 0.2', frames: floats },
            { label: 'A test catches a bug', frames: softmaxBug },
        ],
    };
};

export const phase0Animations: Record<string, () => AnimationSpec> = {
    'f0-t6': learningLoop,
    'f0-t1': arrays,
    'f0-t2': broadcasting,
    'f0-t3': lossCurves,
    'f0-t4': git,
    'f0-t5': testing,
};
