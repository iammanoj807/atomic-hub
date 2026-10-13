import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import {
    C,
    arrow,
    axes,
    axisLines,
    bars,
    box,
    chips,
    circle,
    dot,
    fnPath,
    frame,
    gaussian,
    line,
    lineInBox,
    lit,
    mean,
    path,
    polyfit,
    polyval,
    pt,
    px,
    py,
    range,
    rect,
    round,
    seeded,
    text,
    tint,
    type Part,
} from '../../components/learning/anim/kit';
import { label, panel } from './common';

// Phase 2 · Classical ML. Every fit, split, cluster and score shown here is
// computed by running the algorithm on the data drawn.


// ============ f2-t1 · The ML setup: train, validation, test ============

const setup = (): AnimationSpec => {
    const n = 20;
    const rand = seeded(3);
    const order = Array.from({ length: n }, (_, i) => i).sort(() => rand() - 0.5);
    const rowColor = (i: number) => [C.cyan, C.violet, C.amber, C.pink, C.green][i % 5];
    const row = (i: number, x: number, y: number, o: { dim?: boolean; locked?: boolean } = {}) =>
        rect(`r${i}`, x, y, 15, 15, { rx: 3, fill: tint(rowColor(i), o.dim ? 0.2 : 0.75), stroke: o.locked ? C.red : rowColor(i), sw: o.locked ? 2 : 1 });
    const inLine = (ids: number[]) => ids.map((id, k) => row(id, 20 + k * 18, 40));
    const bucket = (id: string, x: number, w: number, title: string, color: string, on = false) => {
        const b = box(id, x, 90, w, 96, '', color, { textColor: C.ink });
        return [on ? lit(b, color) : b, label(`${id}-t`, x + w / 2, 104, title, color, { anchor: 'middle', size: 12, mono: false })];
    };
    const placed = (o: { dimTrain?: boolean; lockTest?: boolean } = {}) => order.map((id, k) => {
        if (k < 14) return row(id, 22 + (k % 7) * 22, 122 + Math.floor(k / 7) * 22, { dim: o.dimTrain });
        if (k < 17) return row(id, 194 + (k - 14) * 22, 130);
        return row(id, 296 + (k - 17) * 22, 130, { locked: o.lockTest });
    });
    const buckets = (on: number | null) => [
        bucket('tr', 12, 166, 'train 70%', C.cyan, on === 0),
        bucket('va', 186, 92, 'validation 15%', C.amber, on === 1),
        bucket('te', 286, 104, 'test 15%', C.green, on === 2),
    ];
    return {
        title: 'Train, validation and test: three jobs for three slices of data',
        variants: [{
            label: 'Splitting the data',
            frames: [
                frame('20 rows of data, each with its features and its label. First, shuffle, so each slice is a fair mix.', [inLine(Array.from({ length: n }, (_, i) => i))]),
                frame('Shuffled. Now cut it into three parts that never share a row.', [inLine(order)]),
                frame('Training set (70%): the model learns its weights from these rows only.', [buckets(0), placed()]),
                frame('Validation set (15%): compare models and settings — learning rate, depth, k — and keep the best. The model never trains on it.', [buckets(1), placed({ dimTrain: true })]),
                frame('Test set (15%): locked away. Use it exactly once, at the very end, for the honest final score. Tuning on it would make that score a lie.', [buckets(2), placed({ dimTrain: true, lockTest: true }), label('lock', 338, 168, '🔒 once', C.red, { anchor: 'middle', size: 12, mono: false })]),
            ],
        }],
    };
};

// ============ f2-t2 · Linear regression ============

const linearRegression = (): AnimationSpec => {
    const a = axes(44, 14, 300, 186, 0, 10, 0, 12);
    const rand = seeded(8);
    const xs = range(0.6, 9.4, 10);
    const ys = xs.map(x => 2 + 0.8 * x + gaussian(rand) * 0.9);
    const [b0, b1] = polyfit(xs, ys, 1);
    const mse = (w: number, b: number) => mean(xs.map((x, i) => (w * x + b - ys[i]) ** 2));
    const base: Part[] = [axisLines('ax', a, 'x', 'y'), xs.map((x, i) => dot(`p${i}`, ...pt(a, x, ys[i]), C.amber, 5.5))];
    const fit = (w: number, b: number, squares: boolean, color: string): Part[] => [
        lineInBox('line', a, w, b, { stroke: color, sw: 3 }),
        xs.map((x, i) => {
            const pred = w * x + b;
            const top = Math.max(pred, ys[i]);
            const size = Math.abs(py(a, pred) - py(a, ys[i]));
            return [
                line(`res${i}`, ...pt(a, x, pred), ...pt(a, x, ys[i]), { stroke: C.red, sw: 2 }),
                squares && rect(`sq${i}`, px(a, x), py(a, top), size, size, { fill: tint(C.red, 0.18), stroke: C.red, sw: 1 }),
            ];
        }),
    ];
    const readout = (w: number, b: number, color: string) => panel([[`ŷ = ${round(w, 2)}x + ${round(b, 2)}`, color], [`MSE = ${round(mse(w, b), 2)}`, C.red]], 236, 154, 152);
    const squares: Frame[] = [
        frame('Ten data points. We want the straight line ŷ = wx + b that sits as close as possible to all of them.', [base]),
        frame(`A flat guess, ŷ = ${round(mean(ys), 1)}. Each red line is an error. Least squares turns each error into a square and adds up their areas.`, [base, fit(0, mean(ys), true, C.grey), readout(0, mean(ys), C.grey)]),
        frame('Tilting the line shrinks most of the squares.', [base, fit(0.5, 3.5, true, C.violet), readout(0.5, 3.5, C.violet)]),
        frame(`The best line makes the total area of the squares as small as possible. The normal equation finds it in one step: ŷ = ${round(b1, 2)}x + ${round(b0, 2)}.`, [base, fit(b1, b0, true, C.green), readout(b1, b0, C.green)]),
    ];
    // Gradient descent from w = b = 0, on the same data.
    let w = 0;
    let b = 0;
    const lr = 0.012;
    const snapshots: [number, number, number][] = [[0, w, b]];
    for (let step = 1; step <= 4000; step++) {
        const gw = mean(xs.map((x, i) => 2 * (w * x + b - ys[i]) * x));
        const gb = mean(xs.map((x, i) => 2 * (w * x + b - ys[i])));
        w -= lr * gw;
        b -= lr * gb;
        if ([1, 3, 10, 100, 4000].includes(step)) snapshots.push([step, w, b]);
    }
    const gd: Frame[] = snapshots.map(([step, sw, sb], k) => frame(
        k === 0 ? 'Gradient descent starts from w = 0, b = 0 and improves the line a little at a time.'
            : k === snapshots.length - 1 ? `After ${step} steps it has reached the same line the normal equation found in one go: ŷ = ${round(sw, 2)}x + ${round(sb, 2)}.`
                : `Step ${step}: ŷ = ${round(sw, 2)}x + ${round(sb, 2)}, MSE ${round(mse(sw, sb), 2)}.`,
        [base, fit(sw, sb, false, C.cyan), readout(sw, sb, C.cyan)],
        k === 0 ? undefined : 2400,
    ));
    return {
        title: 'Least squares: the line with the smallest total squared error',
        variants: [
            { label: 'The squares', frames: squares },
            { label: 'Gradient descent', frames: gd },
        ],
    };
};

// ============ f2-t3 · Logistic regression ============

const logistic = (): AnimationSpec => {
    const a = axes(44, 18, 320, 176, 0, 10, -0.25, 1.25);
    const hours = [0.8, 1.5, 2.2, 2.9, 3.4, 4.1, 4.6, 5.2, 5.7, 6.3, 7.0, 7.8, 8.6, 9.3];
    const passed = [0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 1, 1];
    // Fit by gradient descent on the cross-entropy, from w = b = 0.
    let w = 0;
    let b = 0;
    for (let i = 0; i < 6000; i++) {
        const ps = hours.map(h => 1 / (1 + Math.exp(-(w * h + b))));
        w -= 0.05 * mean(hours.map((h, k) => (ps[k] - passed[k]) * h));
        b -= 0.05 * mean(hours.map((_, k) => ps[k] - passed[k]));
    }
    const sig = (h: number) => 1 / (1 + Math.exp(-(w * h + b)));
    const boundary = -b / w;
    const [lb0, lb1] = polyfit(hours, passed, 1);
    const base: Part[] = [
        axisLines('ax', a, 'hours studied', ''),
        [0, 0.5, 1].map(v => [line(`g${v}`, a.x, py(a, v), a.x + a.w, py(a, v), { stroke: C.faint, sw: 1, dash: v === 0.5 ? '4 4' : undefined }), text(`yt${v}`, a.x - 6, py(a, v), String(v), { size: 11, fill: C.dim, anchor: 'end' })]),
        hours.map((h, i) => dot(`s${i}`, ...pt(a, h, passed[i]), passed[i] ? C.green : C.red, 6)),
        label('pass', a.x + 4, py(a, 1) - 12, 'passed = 1', C.green, { size: 11, mono: false }),
        label('fail', a.x + 4, py(a, 0) + 12, 'failed = 0', C.red, { size: 11, mono: false }),
    ];
    return {
        title: 'Logistic regression: squash a score into a probability',
        variants: [{
            label: 'Pass or fail',
            frames: [
                frame('Did a student pass (1) or fail (0), given hours studied? We want P(pass) for any number of hours.', [base]),
                frame('A straight line (linear regression) gives a score, but it runs below 0 and above 1. That can\'t be a probability.', [base, lineInBox('line', a, lb1, lb0, { stroke: C.violet, sw: 3 }), label('bad', 300, py(a, 1.15), 'above 1?!', C.violet, { size: 12, mono: false })]),
                frame('The sigmoid σ(z) = 1 / (1 + e⁻ᶻ) squashes the score z = wx + b into the range 0 to 1: an S-shaped curve, fitted by minimising cross-entropy.', [base, fnPath('line', a, sig, { stroke: C.cyan, sw: 3 })]),
                frame(`Read off a probability: after ${round(boundary + 2, 1)} hours, P(pass) = ${round(sig(boundary + 2), 2)}. Far from the middle the curve flattens near 0 or 1: confident.`, [base, fnPath('line', a, sig, { stroke: C.cyan, sw: 3 }), line('read', px(a, boundary + 2), py(a, -0.25), px(a, boundary + 2), py(a, sig(boundary + 2)), { stroke: C.yellow, dash: '4 3' }), dot('rd', ...pt(a, boundary + 2, sig(boundary + 2)), C.yellow, 6)]),
                frame(`Predict "pass" when P > 0.5. That happens where z = 0, at ${round(boundary, 1)} hours: the decision boundary. Points on the wrong side are the model's mistakes.`, [base, fnPath('line', a, sig, { stroke: C.cyan, sw: 3 }), line('bound', px(a, boundary), a.y, px(a, boundary), a.y + a.h, { stroke: C.yellow, sw: 2.5 }), label('bl', px(a, boundary) + 6, a.y + 10, 'boundary', C.yellow, { size: 12, mono: false })]),
            ],
        }],
    };
};

// ============ f2-t4 · Regularisation: L1 and L2 ============

const regularisation = (): AnimationSpec => {
    const w0 = [3, -2.2, 1.6, 0.9, -0.6, 0.35, -0.2, 0.1];
    const a = axes(40, 30, 340, 170, 0, 8, -3.2, 3.2);
    const names = w0.map((_, i) => `w${i + 1}`);
    // With uncorrelated, unit-scaled features: ridge divides by (1 + λ); lasso soft-thresholds at λ/2.
    const l2 = (lam: number) => w0.map(w => w / (1 + lam));
    const l1 = (lam: number) => w0.map(w => Math.sign(w) * Math.max(0, Math.abs(w) - lam / 2));
    const chart = (ws: number[], lam: number, color: string) => [
        line('zero', a.x, py(a, 0), a.x + a.w, py(a, 0), { stroke: C.dim, sw: 1.5 }),
        bars('w', a, ws, ws.map(v => (Math.abs(v) < 1e-9 ? C.grey : v > 0 ? color : C.pink)), names, { showValues: false }),
        ws.map((v, i) => label(`v${i}`, a.x + (a.w / 8) * (i + 0.5), v >= 0 ? py(a, v) - 8 : py(a, v) + 9, Math.abs(v) < 1e-9 ? '0' : String(round(v, 2)), Math.abs(v) < 1e-9 ? C.yellow : C.ink, { anchor: 'middle', size: 10 })),
        panel([[`λ = ${lam}`, color]], 302, 4, 90),
    ];
    const zeros = (ws: number[]) => ws.filter(v => Math.abs(v) < 1e-9).length;
    return {
        title: 'Penalising big weights: L2 shrinks, L1 switches off',
        variants: [
            {
                label: 'L2 (ridge)',
                frames: [0, 0.5, 1.5, 4].map((lam, k) => frame([
                    'Eight weights from an ordinary fit, with no penalty (λ = 0).',
                    'Add an L2 penalty, λ·Σw². Every weight shrinks by the same factor, 1 / (1 + λ).',
                    'Bigger λ, smaller weights. The big ones shrink the most in absolute terms, because the penalty grows with w².',
                    'Even at λ = 4, no weight reaches exactly 0. L2 makes everything small, but keeps every feature in play.',
                ][k], [chart(l2(lam), lam, C.cyan)])),
            },
            {
                label: 'L1 (lasso)',
                frames: [0, 0.5, 1.5, 4].map((lam, k) => frame([
                    'The same eight weights, no penalty.',
                    `Add an L1 penalty, λ·Σ|w|. Each weight is pulled towards 0 by the same fixed amount, so the smallest ones hit exactly 0: ${zeros(l1(0.5))} already.`,
                    `λ = 1.5: ${zeros(l1(1.5))} weights are exactly 0. Those features have been switched off.`,
                    `λ = 4: only ${8 - zeros(l1(4))} features survive. L1 gives sparse models, which also act as automatic feature selection.`,
                ][k], [chart(l1(lam), lam, C.green)])),
            },
        ],
    };
};

// ============ f2-t5 · Bias–variance ============

const biasVariance = (): AnimationSpec => {
    const rand = seeded(12);
    const truth = (x: number) => Math.sin(Math.PI * x);
    const xs = range(-0.95, 0.95, 12).map(x => x + (rand() - 0.5) * 0.08);
    const ys = xs.map(x => truth(x) + gaussian(rand) * 0.25);
    const vx = range(-0.9, 0.9, 40);
    const vy = vx.map(x => truth(x) + gaussian(rand) * 0.25);
    const a = axes(40, 14, 330, 176, -1.05, 1.05, -2, 2);
    const errors = (deg: number) => {
        const c = polyfit(xs, ys, deg);
        return { c, train: mean(xs.map((x, i) => (polyval(c, x) - ys[i]) ** 2)), val: mean(vx.map((x, i) => (polyval(c, x) - vy[i]) ** 2)) };
    };
    const base: Part[] = [
        axisLines('ax', a, 'x', 'y'),
        fnPath('truth', a, truth, { stroke: C.grey, sw: 1.5, dash: '5 4' }),
        xs.map((x, i) => dot(`p${i}`, ...pt(a, x, ys[i]), C.amber, 5)),
    ];
    const fitFrame = (deg: number, caption: (e: ReturnType<typeof errors>) => string, color: string) => {
        const e = errors(deg);
        return frame(caption(e), [base, fnPath('fit', a, x => polyval(e.c, x), { stroke: color, sw: 3, n: 160 }), panel([[`degree ${deg}`, color], [`train ${round(e.train, 3)}`, C.cyan], [`validation ${round(e.val, 3)}`, C.pink]], 230, 150, 150)]);
    };
    const degs = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const errs = degs.map(errors);
    const b = axes(48, 18, 320, 172, 0.5, 9.5, 0, Math.min(1.2, Math.max(...errs.map(e => e.val)) * 1.1));
    const best = degs[errs.reduce((bi, e, i) => (e.val < errs[bi].val ? i : bi), 0)];
    const curve = (key: 'train' | 'val', color: string) => path(key, degs.map((d, i) => pt(b, d, Math.min(b.yMax, errs[i][key]))), { stroke: color, sw: 3 });
    return {
        title: 'Too simple, just right, too wiggly',
        variants: [
            {
                label: 'Three fits',
                frames: [
                    frame('12 noisy points from a smooth curve (dashed). Fit polynomials of growing degree and compare.', [base]),
                    fitFrame(1, e => `Degree 1, a straight line: too simple to follow the curve. High bias — it misses on training data too (train error ${round(e.train, 2)}).`, C.violet),
                    fitFrame(3, e => `Degree 3: follows the real shape. Training error ${round(e.train, 2)}, validation error ${round(e.val, 2)}: both low.`, C.green),
                    fitFrame(9, e => `Degree 9: bends to pass close to every training point (train error ${round(e.train, 3)}), but swings wildly in between. High variance: validation error ${round(e.val, 2)}.`, C.red),
                ],
            },
            {
                label: 'Error vs complexity',
                frames: [
                    frame('Now fit every degree from 1 to 9 and plot both errors.', [axisLines('ax', b, '', 'error'), degs.map(d => text(`xt${d}`, px(b, d), b.y + b.h + 14, String(d), { size: 11, fill: C.dim }))]),
                    frame('Training error (blue) only ever goes down: more flexibility always fits the training points better.', [axisLines('ax', b, '', 'error'), degs.map(d => text(`xt${d}`, px(b, d), b.y + b.h + 14, String(d), { size: 11, fill: C.dim })), curve('train', C.cyan)]),
                    frame(`Validation error (pink) falls, then rises again. The bottom of that U, degree ${best}, is the sweet spot. To the left: underfitting (bias). To the right: overfitting (variance).`, [axisLines('ax', b, '', 'error'), degs.map(d => text(`xt${d}`, px(b, d), b.y + b.h + 14, String(d), { size: 11, fill: C.dim })), curve('train', C.cyan), curve('val', C.pink), line('best', px(b, best), b.y, px(b, best), b.y + b.h, { stroke: C.green, dash: '5 4', sw: 2 }), label('bl', px(b, best) + 6, b.y + 8, 'best', C.green, { size: 12, mono: false })]),
                ],
            },
        ],
    };
};

// ============ f2-t6 · Metrics ============

const metrics = (): AnimationSpec => {
    const rand = seeded(30);
    const neg = Array.from({ length: 60 }, () => Math.min(0.98, Math.max(0.02, 0.32 + gaussian(rand) * 0.14)));
    const pos = Array.from({ length: 20 }, () => Math.min(0.98, Math.max(0.02, 0.68 + gaussian(rand) * 0.14)));
    const a = axes(78, 22, 302, 92, 0, 1, 0, 1);
    const counts = (t: number) => {
        const tp = pos.filter(s => s >= t).length;
        const fn = pos.length - tp;
        const fp = neg.filter(s => s >= t).length;
        const tn = neg.length - fp;
        return { tp, fn, fp, tn };
    };
    const stripes = (t: number): Part[] => [
        line('axis', a.x, 70, a.x + a.w, 70, { stroke: C.dim }),
        neg.map((s, i) => dot(`n${i}`, px(a, s), 54 - (i % 4) * 9, C.grey, 4, { opacity: s >= t ? 1 : 0.45 })),
        pos.map((s, i) => dot(`q${i}`, px(a, s), 86 + (i % 3) * 9, C.green, 4.5, { opacity: s >= t ? 1 : 0.45 })),
        line('t', px(a, t), 18, px(a, t), 116, { stroke: C.yellow, sw: 2.5 }),
        label('tl', t > 0.8 ? px(a, t) - 5 : px(a, t) + 5, 12, t > 1 ? 'threshold above every score' : `threshold ${t}`, C.yellow, { size: 11, mono: false, anchor: t > 0.8 ? 'end' : 'start' }),
        label('negl', 8, 42, 'innocent', C.grey, { size: 11, mono: false }),
        label('posl', 8, 92, 'fraud', C.green, { size: 11, mono: false }),
    ];
    const matrix = (t: number) => {
        const { tp, fn, fp, tn } = counts(t);
        const cell = (id: string, x: number, y: number, name: string, value: number, color: string) => rect(id, x, y, 74, 40, { rx: 6, fill: tint(color, 0.3), stroke: color, sw: 1.5, text: `${name}\n${value}`, size: 12 });
        const precision = tp + fp ? tp / (tp + fp) : 0;
        const recall = tp / (tp + fn);
        return [
            cell('tp', 20, 136, 'TP', tp, C.green), cell('fn', 98, 136, 'FN', fn, C.pink),
            cell('fp', 20, 180, 'FP', fp, C.amber), cell('tn', 98, 180, 'TN', tn, C.grey),
            label('prec', 196, 150, `precision = ${tp}/${tp + fp} = ${round(precision, 2)}`, C.cyan, { size: 12 }),
            label('rec', 196, 172, `recall = ${tp}/${tp + fn} = ${round(recall, 2)}`, C.violet, { size: 12 }),
            label('f1', 196, 194, `F1 = ${round(precision + recall ? (2 * precision * recall) / (precision + recall) : 0, 2)}`, C.ink, { size: 12 }),
            label('acc', 196, 216, `accuracy = ${round((tp + tn) / 80, 2)}`, C.grey, { size: 12 }),
        ];
    };
    const at = (t: number, caption: string) => frame(caption, [stripes(t), matrix(t)]);
    // ROC: sweep the threshold from high to low.
    const r = axes(70, 20, 190, 190, 0, 1, 0, 1);
    const ts = range(1, 0, 41);
    const roc = ts.map(t => { const c = counts(t); return [c.fp / neg.length, c.tp / pos.length] as [number, number]; });
    let auc = 0;
    for (let i = 1; i < roc.length; i++) auc += (roc[i][0] - roc[i - 1][0]) * (roc[i][1] + roc[i - 1][1]) / 2;
    const rocFrame = (share: number, caption: string) => {
        const shown = Math.max(1, Math.round(share * roc.length));
        const points = roc.map((q, i) => pt(r, ...(i < shown ? q : roc[shown - 1])));
        const [fx, fy] = roc[shown - 1];
        return frame(caption, [
            axisLines('rax', r, 'false positive rate', 'true positive rate'),
            line('diag', r.x, r.y + r.h, r.x + r.w, r.y, { stroke: C.dim, dash: '4 4' }),
            path('roc', points, { stroke: C.cyan, sw: 3 }),
            dot('now', ...pt(r, fx, fy), C.yellow, 6),
            share >= 1 && label('auc', 280, 100, `AUC = ${round(auc, 2)}`, C.cyan, { size: 15 }),
            share >= 1 && label('rand', 280, 124, 'random = 0.5', C.dim, { size: 12 }),
        ]);
    };
    return {
        title: 'Precision, recall and the threshold that trades them',
        variants: [
            {
                label: 'Moving the threshold',
                frames: [
                    at(0.5, 'The model gives each transaction a fraud score. Grey dots are innocent, green are real fraud. Everything right of the yellow threshold gets flagged.'),
                    at(0.5, 'The confusion matrix counts the four outcomes. Precision: of what we flagged, how much was fraud? Recall: of all fraud, how much did we catch?'),
                    at(0.3, 'Lower the threshold: we catch more fraud (recall up) but flag more innocent people (precision down).'),
                    at(0.7, 'Raise it: fewer false alarms (precision up), but more fraud slips through (recall down). The right threshold depends on which mistake costs more.'),
                    at(1.01, 'Flag nothing: accuracy is still 75%, because most transactions are innocent. Yet recall is 0. Accuracy alone can hide a useless model.'),
                ],
            },
            {
                label: 'ROC curve',
                frames: [
                    rocFrame(0.05, 'Start with a very high threshold: nothing flagged, so both rates are 0 (bottom left).'),
                    rocFrame(0.4, 'Lower it step by step and plot true positive rate (recall) against false positive rate.'),
                    rocFrame(0.7, 'A good model climbs steeply: it catches fraud before it starts flagging many innocents.'),
                    rocFrame(1, `The area under this curve (AUC) is ${round(auc, 2)}: the chance a random fraud scores higher than a random innocent. 0.5 is guessing (the dashed line); 1.0 is perfect.`),
                ],
            },
        ],
    };
};

// ============ f2-t7 · Cross-validation and leakage ============

const crossValidation = (): AnimationSpec => {
    const rand = seeded(17);
    const scores = [0.84, 0.81, 0.87, 0.83, 0.86].map(s => round(s + (rand() - 0.5) * 0.01, 2));
    const fold = (round_: number) => Array.from({ length: 5 }, (_, f) => {
        const test = f === round_;
        return box(`f${f}`, 18 + f * 62, 50, 56, 40, test ? 'TEST' : 'train', test ? C.amber : C.cyan, { size: 12, ...(test ? { fill: tint(C.amber, 0.55) } : {}) });
    });
    const scoreRows = (upTo: number) => scores.slice(0, upTo).map((s, i) => label(`s${i}`, 46 + i * 62, 108, String(s), C.amber, { size: 13, anchor: 'middle' }));
    const avg = mean(scores);
    const sd = Math.sqrt(mean(scores.map(s => (s - avg) ** 2)));
    const cv: Frame[] = [
        ...[0, 1, 2, 3, 4].map(k => frame(
            k === 0 ? 'Split the data into 5 equal folds. Round 1: train on folds 2–5, test on fold 1.' : `Round ${k + 1}: a different fold is the test fold. Every row gets tested exactly once over the 5 rounds.`,
            [fold(k), label('round', 18, 30, `round ${k + 1}`, C.amber, { size: 13, mono: false }), scoreRows(k + 1)],
            2600,
        )),
        frame(`Average the five scores: ${round(avg, 3)} ± ${round(sd, 3)}. The spread tells you how much one lucky or unlucky split could have misled you.`, [fold(-1), scoreRows(5), label('sl', 18, 132, 'test score of each round ↑', C.grey, { size: 11, mono: false }), label('avg', 18, 166, `mean ${round(avg, 3)} ± ${round(sd, 3)}`, C.green, { size: 16 })]),
    ];
    const flow = (leak: boolean): Part[] => [
        box('all', 20, 36, 110, 44, 'all rows', C.grey, { size: 12 }),
        box('train', 20, 120, 110, 40, 'train rows', C.cyan, { size: 12 }),
        box('test', 20, 176, 110, 40, 'test rows', C.amber, { size: 12 }),
        box('stats', 196, 100, 150, 50, leak ? 'mean & std\nof ALL rows' : 'mean & std\nof TRAIN rows', leak ? C.red : C.green, { size: 12 }),
        leak ? arrow('a1', 130, 58, 196, 116, { stroke: C.red, sw: 2.5 }) : arrow('a1', 130, 140, 196, 130, { stroke: C.green, sw: 2.5 }),
        leak && arrow('a2', 130, 190, 196, 140, { stroke: C.red, sw: 2.5, dash: '5 4' }),
        label('note', 196, 186, leak ? 'test rows leaked into training ✗' : 'test rows only use them ✓', leak ? C.red : C.green, { size: 12, mono: false }),
    ];
    const leakage: Frame[] = [
        frame('A common leak: scaling with the mean and standard deviation of ALL the data, test rows included. Information about the test set has crept into training.', [flow(true)]),
        frame('The fix: compute the mean and standard deviation from the training rows only, then apply those same numbers to the test rows.', [flow(false)]),
    ];
    return {
        title: 'Cross-validation, and how test data leaks into training',
        variants: [
            { label: '5-fold cross-validation', frames: cv },
            { label: 'Data leakage', frames: leakage },
        ],
    };
};

// ============ f2-t8 · Feature scaling and encoding ============

const scaling = (): AnimationSpec => {
    // Gradient descent on a loss with very different curvature in two directions, before and after scaling.
    const a = axes(30, 20, 340, 190, -4.4, 4.4, -2.6, 2.6);
    const run = (cx: number, cy: number, lr: number, steps: number) => {
        const out: [number, number][] = [[-4, 2.2]];
        for (let i = 0; i < steps; i++) {
            const [x, y] = out[out.length - 1];
            out.push([x - lr * 2 * cx * x, y - lr * 2 * cy * y]);
        }
        return out;
    };
    const ellipses = (cx: number, cy: number) => [0.5, 2, 4, 6].map((c, i) => path(`e${i}`, range(0, 2 * Math.PI, 72).map(t => pt(a, Math.sqrt(c / cx) * Math.cos(t), Math.max(-2.6, Math.min(2.6, Math.sqrt(c / cy) * Math.sin(t))))), { stroke: '#2f6f7a', sw: 1.5, closed: true }));
    const trail = (pts: [number, number][], color: string) => [path('trail', pts.map(q => pt(a, ...q)), { stroke: color, sw: 2.5 }), pts.map((q, i) => dot(`t${i}`, ...pt(a, ...q), color, 3.5))];
    const before = run(0.6, 6, 0.15, 14);
    const after = run(1, 1, 0.25, 14);
    const gd: Frame[] = [
        frame('One feature is in thousands (size in m²·10), the other in single digits (rooms). The loss surface becomes a long, narrow valley.', [ellipses(0.6, 6)]),
        frame('Gradient descent zig-zags across the steep direction and crawls along the shallow one. One learning rate can\'t suit both.', [ellipses(0.6, 6), trail(before, C.red)]),
        frame('Standardise each feature: (value − mean) / std. The valley becomes round.', [ellipses(1, 1)]),
        frame('Now the gradient points straight at the bottom, and the same number of steps gets much closer.', [ellipses(1, 1), trail(after, C.green)]),
    ];
    const colours: [string, string][] = [['red', C.red], ['green', C.green], ['blue', C.blue]];
    const oneHot: Frame[] = [
        frame('A category, like colour, is not a number. Coding red = 1, green = 2, blue = 3 invents an order and a distance: it says green sits between red and blue.', [
            line('nl', 60, 120, 340, 120, { stroke: C.dim, sw: 2 }),
            colours.map(([name, c], i) => [dot(`c${i}`, 100 + i * 100, 120, c, 10), label(`n${i}`, 100 + i * 100, 146, `${name} = ${i + 1}`, c, { anchor: 'middle', size: 13 })]),
            label('warn', 200, 80, 'blue − red = 2 × (green − red)?!', C.amber, { anchor: 'middle', size: 13, mono: false }),
        ]),
        frame('One-hot encoding gives each category its own column with a single 1. Every pair of colours is now equally far apart, and no order is invented.', [
            label('h', 150, 48, '[is_red, is_green, is_blue]', C.grey, { anchor: 'start', size: 12 }),
            colours.map(([name, c], i) => [
                dot(`c${i}`, 100, 84 + i * 44, c, 10),
                label(`n${i}`, 118, 84 + i * 44, name, c, { size: 13 }),
                chips(`v${i}`, 196, 72 + i * 44, ['0', '0', '0'].map((z, j) => (j === i ? '1' : z)), [0, 1, 2].map(j => (j === i ? c : C.grey)), { gap: 6 }),
            ]),
        ]),
    ];
    return {
        title: 'Scaling features, and turning categories into numbers',
        variants: [
            { label: 'Why scale', frames: gd },
            { label: 'One-hot encoding', frames: oneHot },
        ],
    };
};

// ============ f2-t9 · k-nearest neighbours ============

const knn = (): AnimationSpec => {
    const a = axes(30, 14, 300, 210, 0, 6, 0, 4.2);
    const A: [number, number][] = [[1, 1], [2, 1], [0.6, 2.4], [1.4, 3.2], [2.6, 0.4]];
    const B: [number, number][] = [[3.5, 2], [4, 4], [5, 4], [4.6, 2.8], [5.4, 1.4]];
    const q: [number, number] = [2.5, 2];
    const all = [...A.map(p => ({ p, c: 'A' })), ...B.map(p => ({ p, c: 'B' }))]
        .map(o => ({ ...o, d: Math.hypot(o.p[0] - q[0], o.p[1] - q[1]) }))
        .sort((x, y) => x.d - y.d);
    const unit = a.w / (a.xMax - a.xMin);
    const vote = (k: number) => {
        const votesA = all.slice(0, k).filter(o => o.c === 'A').length;
        return { votesA, verdict: votesA * 2 > k ? 'A' : 'B' };
    };
    const scene = (k: number, caption: string, verdict?: string) => {
        const near = all.slice(0, k);
        const radius = k ? near[k - 1].d * unit + 8 : 0;
        const votesA = near.filter(o => o.c === 'A').length;
        return frame(caption, [
            axisLines('ax', a),
            k > 0 && circle('ring', ...pt(a, ...q), radius, { fill: tint(C.yellow, 0.08), stroke: C.yellow, sw: 1.5 }),
            near.map((o, i) => line(`l${i}`, ...pt(a, ...q), ...pt(a, ...o.p), { stroke: C.yellow, sw: 1.5, dash: '3 3' })),
            A.map((p, i) => dot(`a${i}`, ...pt(a, ...p), C.cyan, 7)),
            B.map((p, i) => dot(`b${i}`, ...pt(a, ...p), C.pink, 7)),
            circle('q', ...pt(a, ...q), 8, { fill: verdict === 'A' ? C.cyan : verdict === 'B' ? C.pink : C.bg, stroke: C.yellow, sw: 3 }),
            label('qa', ...pt(a, q[0] - 0.12, q[1] + 0.28), '?', C.yellow, { anchor: 'end', size: 14 }),
            k > 0 && panel([[`k = ${k} · predict ${verdict}`, verdict === 'A' ? C.cyan : C.pink], [`votes A ${votesA} · B ${k - votesA}`, C.ink]], 250, 186, 144),
        ]);
    };
    return {
        title: 'k-nearest neighbours: let the closest examples vote',
        variants: [{
            label: 'k = 1 vs k = 3',
            frames: [
                scene(0, 'Two classes, A (blue) and B (pink). A new point (?) arrives. There is no training: we just look at the data.'),
                scene(1, `k = 1: the single nearest point is a B, ${round(all[0].d, 2)} away. Prediction: B.`, 'B'),
                scene(3, `k = 3: the three nearest are ${all.slice(0, 3).map(o => o.c).join(', ')}. The majority says ${vote(3).verdict}. The answer depends on k.`, vote(3).verdict),
                scene(5, `k = 5: ${vote(5).votesA} A against ${5 - vote(5).votesA} B, so ${vote(5).verdict}. Small k follows every bump in the data (high variance); large k smooths it out (high bias). Pick k with validation data.`, vote(5).verdict),
            ],
        }],
    };
};

export const phase2AnimationsA: Record<string, () => AnimationSpec> = {
    'f2-t1': setup,
    'f2-t2': linearRegression,
    'f2-t3': logistic,
    'f2-t4': regularisation,
    'f2-t5': biasVariance,
    'f2-t6': metrics,
    'f2-t7': crossValidation,
    'f2-t8': scaling,
    'f2-t9': knn,
};
