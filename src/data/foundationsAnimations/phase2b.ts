import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import { lerpColor } from '../../components/learning/anim/scene';
import {
    C,
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
    mean,
    path,
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

// Phase 2 · Classical ML, second half. As before, every split, fit, cluster
// and curve is computed by running the algorithm on the data drawn.

const gini = (counts: number[]) => {
    const n = counts.reduce((s, c) => s + c, 0);
    return n ? 1 - counts.reduce((s, c) => s + (c / n) ** 2, 0) : 0;
};

// ============ f2-t10 · Decision trees ============

const decisionTree = (): AnimationSpec => {
    const a = axes(26, 14, 200, 200, 0, 5, 0, 4.2);
    const A: [number, number][] = [[0.6, 0.8], [1.2, 1.9], [2.1, 0.5], [2.6, 1.6], [1.6, 1.2], [0.9, 2.1]];
    const B: [number, number][] = [[0.8, 3.4], [1.9, 3.0], [2.5, 3.7], [3.6, 1.0], [4.2, 2.2], [4.8, 0.6], [3.9, 3.3], [4.6, 3.9]];
    const count = (f: (p: [number, number]) => boolean) => [A.filter(f).length, B.filter(f).length];
    const root = count(() => true);
    const left = count(p => p[0] < 3);
    const right = count(p => p[0] >= 3);
    const ll = count(p => p[0] < 3 && p[1] < 2.5);
    const lu = count(p => p[0] < 3 && p[1] >= 2.5);
    const g = (c: number[]) => round(gini(c), 2);
    const points: Part = [A.map((p, i) => dot(`a${i}`, ...pt(a, ...p), C.cyan, 6)), B.map((p, i) => dot(`b${i}`, ...pt(a, ...p), C.pink, 6))];
    const region = (id: string, x0: number, y0: number, x1: number, y1: number, color: string) => rect(id, px(a, x0), py(a, y1), px(a, x1) - px(a, x0), py(a, y0) - py(a, y1), { fill: tint(color, 0.16) });
    const node = (id: string, x: number, y: number, w: number, textValue: string, color: string) => box(id, x, y, w, 40, textValue, color, { size: 11 });
    const edge = (id: string, x1: number, y1: number, x2: number, y2: number) => line(id, x1, y1, x2, y2, { stroke: C.grey, sw: 1.5 });
    const rootNode = (q: string) => node('n0', 262, 14, 120, `${q}\n${root[0]}A ${root[1]}B · Gini ${g(root)}`, C.amber);
    const frames: Frame[] = [
        frame(`14 points, 6 blue (A) and 8 pink (B). Mixed together, Gini impurity is ${g(root)}. A tree asks yes/no questions to make the groups purer.`, [axisLines('ax', a, 'x', 'y'), points, rootNode('all points')]),
        frame(`Try every feature and threshold; keep the one that lowers impurity most. Best first question: x < 3? The right side is all B (Gini ${g(right)}).`, [
            region('rR', 3, 0, 5, 4.2, C.pink), axisLines('ax', a, 'x', 'y'), line('s1', px(a, 3), a.y, px(a, 3), a.y + a.h, { stroke: C.yellow, sw: 2.5 }), points,
            rootNode('x < 3 ?'), edge('e1', 290, 54, 282, 92), edge('e2', 354, 54, 360, 92),
            node('n1', 236, 92, 96, `yes: ${left[0]}A ${left[1]}B\nGini ${g(left)}`, C.violet), node('n2', 338, 92, 56, `no: ${right[1]}B\npure`, C.pink),
        ]),
        frame(`The left side is still mixed (Gini ${g(left)}). Ask again, only there: y < 2.5? Now both parts are pure.`, [
            region('rR', 3, 0, 5, 4.2, C.pink), region('rLU', 0, 2.5, 3, 4.2, C.pink), region('rLL', 0, 0, 3, 2.5, C.cyan), axisLines('ax', a, 'x', 'y'),
            line('s1', px(a, 3), a.y, px(a, 3), a.y + a.h, { stroke: C.yellow, sw: 2.5 }), line('s2', px(a, 0), py(a, 2.5), px(a, 3), py(a, 2.5), { stroke: C.yellow, sw: 2.5 }), points,
            rootNode('x < 3 ?'), edge('e1', 290, 54, 282, 92), edge('e2', 354, 54, 360, 92),
            node('n1', 236, 92, 96, 'y < 2.5 ?', C.violet), node('n2', 338, 92, 56, `no: ${right[1]}B\npure`, C.pink),
            edge('e3', 262, 132, 262, 170), edge('e4', 308, 132, 324, 170),
            node('n3', 228, 170, 72, `${ll[0]}A · pure`, C.cyan), node('n4', 306, 170, 72, `${lu[1]}B · pure`, C.pink),
        ]),
        frame('Done: every leaf is pure, and the tree reads as plain if-statements. The boundary is made of straight, axis-aligned cuts, so a diagonal boundary would need a staircase of many cuts.', [
            region('rR', 3, 0, 5, 4.2, C.pink), region('rLU', 0, 2.5, 3, 4.2, C.pink), region('rLL', 0, 0, 3, 2.5, C.cyan), axisLines('ax', a, 'x', 'y'),
            line('s1', px(a, 3), a.y, px(a, 3), a.y + a.h, { stroke: C.yellow, sw: 2.5 }), line('s2', px(a, 0), py(a, 2.5), px(a, 3), py(a, 2.5), { stroke: C.yellow, sw: 2.5 }), points,
            label('code', 238, 225, 'if x<3 and y<2.5: A else: B', C.yellow, { size: 10 }),
        ]),
    ];
    // Searching thresholds on a 1-D example.
    const xs = [1, 2, 3, 4, 5, 6, 7, 8];
    const ys = [1, 1, 0, 1, 0, 0, 0, 0];
    const b = axes(30, 60, 340, 60, 0.5, 8.5, 0, 1);
    const weighted = (t: number) => {
        const L = [ys.filter((y, i) => xs[i] < t && y === 1).length, ys.filter((y, i) => xs[i] < t && y === 0).length];
        const R = [ys.filter((y, i) => xs[i] >= t && y === 1).length, ys.filter((y, i) => xs[i] >= t && y === 0).length];
        return (gini(L) * (L[0] + L[1]) + gini(R) * (R[0] + R[1])) / xs.length;
    };
    const ts = range(1.5, 7.5, 7);
    const best = ts.reduce((bt, t) => (weighted(t) < weighted(bt) ? t : bt), ts[0]);
    const c = axes(30, 150, 340, 60, 0.5, 8.5, 0, 0.5);
    const search = (upTo: number, caption: string) => frame(caption, [
        xs.map((x, i) => dot(`x${i}`, px(b, x), 90, ys[i] ? C.cyan : C.pink, 9, { text: ys[i] ? 'Y' : 'N', textColor: C.bg, size: 10 })),
        line('cut', px(b, ts[upTo]), 64, px(b, ts[upTo]), 116, { stroke: C.yellow, sw: 2.5 }),
        label('cutl', px(b, ts[upTo]), 50, `x < ${ts[upTo]}?`, C.yellow, { anchor: 'middle', size: 12 }),
        axisLines('cx', c, '', 'weighted Gini'),
        ts.slice(0, upTo + 1).map((t, i) => rect(`gb${i}`, px(c, t) - 12, py(c, weighted(t)), 24, c.y + c.h - py(c, weighted(t)), { rx: 3, fill: t === best && upTo === ts.length - 1 ? C.green : tint(C.amber, 0.8) })),
        ts.slice(0, upTo + 1).map((t, i) => text(`gv${i}`, px(c, t), py(c, weighted(t)) - 8, String(round(weighted(t), 2)), { size: 10, fill: C.ink })),
    ]);
    const thresholds: Frame[] = [
        search(0, 'How does the tree choose x < 3? It tries every threshold. Here: 8 points labelled Y or N. Try x < 1.5 and measure the weighted Gini of the two sides.'),
        search(2, 'Slide the threshold along. Each cut gets a score: the Gini of each side, weighted by how many points it holds.'),
        search(6, `After trying them all, the lowest score wins: x < ${best}. A tree repeats this search at every node, for every feature.`),
    ];
    return {
        title: 'A decision tree asks the question that makes the groups purest',
        variants: [
            { label: 'Growing a tree', frames },
            { label: 'Choosing a threshold', frames: thresholds },
        ],
    };
};

// ============ f2-t11 · Ensembles ============

type Tree1D = (x: number) => number;

/** A tiny regression tree on one feature: split where the squared error drops most, down to `depth`. */
const fitTree = (xs: number[], ys: number[], depth: number): Tree1D => {
    const avg = ys.length ? mean(ys) : 0;
    if (depth === 0 || xs.length < 4) return () => avg;
    const order = xs.map((_, i) => i).sort((i, j) => xs[i] - xs[j]);
    let bestT = Number.NaN;
    let bestErr = Infinity;
    for (let k = 2; k <= order.length - 2; k++) {
        // Bootstrap samples repeat rows: never split between two equal x values.
        if (xs[order[k - 1]] === xs[order[k]]) continue;
        const t = (xs[order[k - 1]] + xs[order[k]]) / 2;
        const L = order.slice(0, k).map(i => ys[i]);
        const R = order.slice(k).map(i => ys[i]);
        const err = L.reduce((s, v) => s + (v - mean(L)) ** 2, 0) + R.reduce((s, v) => s + (v - mean(R)) ** 2, 0);
        if (err < bestErr) { bestErr = err; bestT = t; }
    }
    if (Number.isNaN(bestT)) return () => avg;
    const li = order.filter(i => xs[i] < bestT);
    const ri = order.filter(i => xs[i] >= bestT);
    const lt = fitTree(li.map(i => xs[i]), li.map(i => ys[i]), depth - 1);
    const rt = fitTree(ri.map(i => xs[i]), ri.map(i => ys[i]), depth - 1);
    return x => (x < bestT ? lt(x) : rt(x));
};

const ensembles = (): AnimationSpec => {
    const rand = seeded(19);
    const truth = (x: number) => Math.sin(x) * 1.6 + 0.2 * x;
    const xs = range(0.2, 6, 26).map(x => x + (rand() - 0.5) * 0.15);
    const ys = xs.map(x => truth(x) + gaussian(rand) * 0.45);
    const a = axes(36, 14, 340, 186, 0, 6.2, -2.6, 3.4);
    const base: Part[] = [axisLines('ax', a, 'x', 'y'), xs.map((x, i) => dot(`p${i}`, ...pt(a, x, ys[i]), C.amber, 4.5))];
    const bootstrap = () => {
        const idx = xs.map(() => Math.floor(rand() * xs.length));
        return fitTree(idx.map(i => xs[i]), idx.map(i => ys[i]), 4);
    };
    const trees = Array.from({ length: 30 }, bootstrap);
    const forest = (x: number) => mean(trees.map(t => t(x)));
    const curve = (id: string, f: Tree1D, color: string, sw = 2) => fnPath(id, a, f, { stroke: color, sw, n: 240, from: 0.1, to: 6.1 });
    const mse = (f: Tree1D) => round(mean(xs.map((x, i) => (f(x) - ys[i]) ** 2)), 2);
    const bagging: Frame[] = [
        frame('26 noisy points. A single deep tree is jumpy: it follows the noise in whatever sample it was given.', [base]),
        frame('Tree 1, trained on a bootstrap sample (rows drawn at random, with repeats): a jagged staircase.', [base, curve('t0', trees[0], C.cyan)]),
        frame('Trees 2 and 3, on different random samples, make different mistakes.', [base, curve('t0', trees[0], tint(C.cyan, 0.7)), curve('t1', trees[1], C.violet), curve('t2', trees[2], C.pink)]),
        frame('Average 30 such trees (a random forest also picks random features). The mistakes cancel out and the average (green) is much smoother: lower variance, same low bias.', [base, curve('t0', trees[0], tint(C.cyan, 0.35), 1), curve('t1', trees[1], tint(C.violet, 0.35), 1), curve('t2', trees[2], tint(C.pink, 0.35), 1), curve('avg', forest, C.green, 3.5)]),
    ];
    // Boosting with stumps (depth-1 trees) fitted to what is still wrong.
    const lr = 0.4;
    const stages: Tree1D[] = [];
    const predictAfter = (m: number): Tree1D => x => mean(ys) + stages.slice(0, m).reduce((s, t) => s + lr * t(x), 0);
    for (let m = 0; m < 60; m++) {
        const current = predictAfter(m);
        const residual = ys.map((y, i) => y - current(xs[i]));
        stages.push(fitTree(xs, residual, 1));
    }
    const boostFrame = (m: number, caption: string) => {
        const f = predictAfter(m);
        return frame(caption, [
            base,
            xs.map((x, i) => line(`r${i}`, ...pt(a, x, f(x)), ...pt(a, x, ys[i]), { stroke: C.red, sw: 1.5, opacity: 0.8 })),
            curve('boost', f, C.green, 3),
            panel([[`${m} stump${m === 1 ? '' : 's'}`, C.green], [`MSE ${mse(f)}`, C.red]], 286, 154, 104),
        ]);
    };
    const boosting: Frame[] = [
        boostFrame(0, 'Boosting starts with a flat guess: the average. The red lines are what is still wrong (the residuals).'),
        boostFrame(1, 'Fit one tiny tree (a single split, a "stump") to the residuals, and add a small step of it.'),
        boostFrame(3, 'Each new stump fixes what the ones before still get wrong. 3 stumps.'),
        boostFrame(10, '10 stumps: the residuals shrink.'),
        boostFrame(60, '60 stumps: a close fit built from very simple pieces. Boosting lowers bias; too many steps would start fitting the noise, so watch validation error.'),
    ];
    return {
        title: 'Many trees beat one: averaging (bagging) and correcting (boosting)',
        variants: [
            { label: 'Bagging / random forest', frames: bagging },
            { label: 'Gradient boosting', frames: boosting },
        ],
    };
};

// ============ f2-t12 · Support vector machines ============

const svm = (): AnimationSpec => {
    const a = axes(30, 10, 210, 210, 0, 7, 0, 7);
    const neg: [number, number][] = [[2, 3], [3, 2], [1, 1], [0.6, 3.2], [2.1, 0.6], [1.2, 2.1]];
    const pos: [number, number][] = [[3, 4], [4, 3], [5, 5], [6, 3.6], [4, 6], [5.6, 5.8]];
    const points = (sv: boolean) => [
        neg.map((p, i) => dot(`n${i}`, ...pt(a, ...p), C.pink, 6, sv && p[0] + p[1] === 5 ? { stroke: C.yellow, sw: 3 } : {})),
        pos.map((p, i) => dot(`p${i}`, ...pt(a, ...p), C.cyan, 6, sv && p[0] + p[1] === 7 ? { stroke: C.yellow, sw: 3 } : {})),
    ];
    // A boundary y = slope·x + c with its two margin lines, offset by the given gap.
    const street = (slope: number, c: number, gap: number, color: string) => [
        lineInBox('mid', a, slope, c, { stroke: color, sw: 3 }),
        lineInBox('m1', a, slope, c - gap, { stroke: color, sw: 1.5, dash: '5 4' }),
        lineInBox('m2', a, slope, c + gap, { stroke: color, sw: 1.5, dash: '5 4' }),
    ];
    const frames: Frame[] = [
        frame('Two classes that a straight line can separate. But many lines would work. Which is best?', [axisLines('ax', a, 'x₁', 'x₂'), points(false)]),
        frame('This line separates them, but it passes very close to some points. A slightly different new point could land on the wrong side.', [axisLines('ax', a, 'x₁', 'x₂'), street(-2, 8.4, 0.3, C.amber), points(false), label('w', 260, 40, 'thin margin', C.amber, { size: 13, mono: false })]),
        frame('An SVM picks the line with the widest empty street (the margin) between the classes.', [axisLines('ax', a, 'x₁', 'x₂'), street(-1, 6, 1, C.green), points(false), label('w', 260, 40, 'widest margin', C.green, { size: 13, mono: false })]),
        frame('Only the points touching the edges of the street matter: the support vectors (yellow rings). Move any other point a little and the line doesn\'t change.', [axisLines('ax', a, 'x₁', 'x₂'), street(-1, 6, 1, C.green), points(true), label('w', 260, 40, 'support vectors', C.yellow, { size: 13, mono: false }), label('w2', 260, 62, 'decide everything', C.yellow, { size: 13, mono: false })]),
    ];
    const h = axes(40, 20, 320, 180, -2.5, 3, 0, 3.5);
    const hinge = (s: number) => Math.max(0, 1 - s);
    const probe = (s: number, caption: string) => frame(caption, [
        axisLines('hax', h, 'y · score', 'hinge loss'),
        fnPath('hinge', h, hinge, { stroke: C.pink, sw: 3 }),
        line('one', px(h, 1), h.y, px(h, 1), h.y + h.h, { stroke: C.dim, dash: '4 4' }),
        line('zero', px(h, 0), h.y, px(h, 0), h.y + h.h, { stroke: C.dim, dash: '4 4' }),
        text('onel', px(h, 1), h.y + h.h + 14, '1', { size: 11, fill: C.dim }),
        text('zerol', px(h, 0), h.y + h.h + 14, '0', { size: 11, fill: C.dim }),
        dot('pt', ...pt(h, s, hinge(s)), C.yellow, 7),
        label('v', px(h, s) + 10, py(h, hinge(s)) - 12, `loss ${round(hinge(s), 2)}`, C.yellow, { size: 12 }),
    ]);
    const hingeFrames: Frame[] = [
        probe(2, 'The hinge loss is max(0, 1 − y·score), with labels y = ±1. A point on the right side, past the margin (y·score = 2): loss 0.'),
        probe(0.5, 'Right side but inside the margin (y·score = 0.5): loss 0.5. The SVM still pushes it out.'),
        probe(-1, 'Wrong side (y·score = −1): loss 2, growing in a straight line the further it is. A soft-margin SVM balances these losses against a wide margin, using C.'),
    ];
    return {
        title: 'Support vector machines: the widest street between the classes',
        variants: [
            { label: 'The margin', frames },
            { label: 'Hinge loss', frames: hingeFrames },
        ],
    };
};

// ============ f2-t13 · Naive Bayes ============

const naiveBayes = (): AnimationSpec => {
    const words: [string, number, number][] = [['free', 0.3, 0.02], ['prize', 0.1, 0.005], ['today', 0.05, 0.05]];
    let spam = 0.4;
    let ham = 0.6;
    const steps: { spam: number; ham: number }[] = [{ spam, ham }];
    for (const [, ps, ph] of words) {
        spam *= ps;
        ham *= ph;
        steps.push({ spam, ham });
    }
    const scene = (k: number, caption: string) => {
        const { spam: s, ham: h } = steps[k];
        const share = s / (s + h);
        const w = 340;
        return frame(caption, [
            chips('email', 30, 20, ['email:', ...words.slice(0, k).map(x => x[0])], [C.grey, C.amber, C.amber, C.amber]),
            label('th', 30, 72, 'word', C.grey, { size: 11, mono: false }),
            label('ts', 150, 72, 'P(word | spam)', C.pink, { size: 11, mono: false }),
            label('tm', 270, 72, 'P(word | ham)', C.green, { size: 11, mono: false }),
            words.map(([word, ps, ph], i) => [
                label(`w${i}`, 30, 94 + i * 20, word, i < k ? C.ink : C.dim, { size: 12 }),
                label(`s${i}`, 150, 94 + i * 20, String(ps), i < k ? C.pink : C.dim, { size: 12 }),
                label(`h${i}`, 270, 94 + i * 20, String(ph), i < k ? C.green : C.dim, { size: 12 }),
            ]),
            rect('barS', 30, 170, w * share, 26, { fill: tint(C.pink, 0.8) }),
            rect('barH', 30 + w * share, 170, w * (1 - share), 26, { fill: tint(C.green, 0.8) }),
            label('ps', 36, 183, `spam ${Math.round(share * 1000) / 10}%`, C.ink, { size: 12 }),
            label('ph', 364, 183, `ham ${Math.round((1 - share) * 1000) / 10}%`, C.ink, { size: 12, anchor: 'end' }),
            label('calc', 30, 216, `${round(s, 6)} vs ${round(h, 6)}`, C.grey, { size: 11 }),
        ]);
    };
    return {
        title: 'Naive Bayes: each word adds its own evidence',
        variants: [{
            label: 'Scoring an email',
            frames: [
                scene(0, 'Before reading any words: 40% of all email is spam, so the prior is 40% spam, 60% ham (not spam).'),
                scene(1, '"free" appears in 30% of spam but only 2% of ham. Multiply each side by its probability: 0.4 × 0.3 = 0.12 against 0.6 × 0.02 = 0.012. Now 91% spam.'),
                scene(2, '"prize": 0.1 against 0.005. Multiply again. Treating each word as separate evidence is the "naive" part. Now 99.5% spam.'),
                scene(3, '"today" is equally common in both (0.05), so it changes nothing. Real filters add logs instead of multiplying, so long emails don\'t round to 0.'),
            ],
        }],
    };
};

// ============ f2-t14 · k-means ============

const kMeans = (): AnimationSpec => {
    const rand = seeded(23);
    const centres: [number, number][] = [[1.5, 1.5], [4.5, 1.8], [3, 4.3]];
    const pts: [number, number][] = centres.flatMap(([cx, cy]) => Array.from({ length: 12 }, () => [cx + gaussian(rand) * 0.55, cy + gaussian(rand) * 0.5] as [number, number]));
    const a = axes(30, 10, 300, 220, 0, 6, 0, 5.6);
    const colors = [C.cyan, C.pink, C.amber];
    let C0: [number, number][] = [[0.6, 4.8], [1.2, 4.2], [0.8, 3.6]];
    const nearest = (p: [number, number], cs: [number, number][]) => cs.reduce((bi, c, i) => (Math.hypot(p[0] - c[0], p[1] - c[1]) < Math.hypot(p[0] - cs[bi][0], p[1] - cs[bi][1]) ? i : bi), 0);
    const draw = (cs: [number, number][], labels: number[] | null, caption: string) => frame(caption, [
        axisLines('ax', a),
        pts.map((p, i) => dot(`p${i}`, ...pt(a, ...p), labels ? colors[labels[i]] : C.grey, 5)),
        cs.map((c, j) => circle(`c${j}`, ...pt(a, ...c), 10, { fill: colors[j], stroke: C.ink, sw: 2.5, text: '★', textColor: C.bg, size: 11 })),
    ], 2300);
    const frames: Frame[] = [draw(C0, null, '36 unlabelled points. Choose k = 3 and drop three centres (stars) at poor starting places.')];
    let labels: number[] = [];
    for (let it = 1; it <= 4; it++) {
        labels = pts.map(p => nearest(p, C0));
        frames.push(draw(C0, labels, it === 1 ? 'Assign: each point joins its nearest centre and takes its colour.' : `Round ${it}, assign again: some points switch to a closer centre.`));
        C0 = [0, 1, 2].map(j => {
            const mine = pts.filter((_, i) => labels[i] === j);
            return mine.length ? [mean(mine.map(p => p[0])), mean(mine.map(p => p[1]))] as [number, number] : C0[j];
        });
        frames.push(draw(C0, labels, it === 1 ? 'Move: each centre jumps to the average of its points.' : `Round ${it}, move the centres again.`));
    }
    for (let it = 0; it < 20; it++) {
        labels = pts.map(p => nearest(p, C0));
        C0 = [0, 1, 2].map(j => {
            const mine = pts.filter((_, i) => labels[i] === j);
            return mine.length ? [mean(mine.map(p => p[0])), mean(mine.map(p => p[1]))] as [number, number] : C0[j];
        });
    }
    frames.push(draw(C0, pts.map(p => nearest(p, C0)), 'Repeat until nothing changes. The centres settle in the middle of the three groups. A different start can settle somewhere worse, so run it several times (or use k-means++).'));
    return {
        title: 'k-means: assign to the nearest centre, move the centre, repeat',
        variants: [{ label: 'k = 3', frames }],
    };
};

// ============ f2-t15 · PCA in practice ============

const pcaPractice = (): AnimationSpec => {
    const eig = [4.2, 2.1, 0.9, 0.4, 0.2, 0.1, 0.06, 0.04];
    const total = eig.reduce((s, v) => s + v, 0);
    const share = eig.map(v => v / total);
    const cum = share.map((_, i) => share.slice(0, i + 1).reduce((s, v) => s + v, 0));
    const k95 = cum.findIndex(c => c >= 0.95) + 1;
    const a = axes(40, 20, 330, 180, 0.5, 8.5, 0, 1);
    const scree = (upTo: number, caption: string, showCum: boolean) => frame(caption, [
        axisLines('ax', a, '', 'share of variance'),
        [0.5, 0.95].map(v => text(`yt${v}`, a.x - 6, py(a, v), `${Math.round(v * 100)}%`, { size: 11, fill: C.dim, anchor: 'end' })),
        bars('b', a, share.map((s, i) => (i < upTo ? s : 0)), share.map((_, i) => (i < k95 ? C.cyan : C.grey)), share.map((_, i) => String(i + 1))),
        showCum && line('t95', a.x, py(a, 0.95), a.x + a.w, py(a, 0.95), { stroke: C.yellow, dash: '5 4', sw: 1.5 }),
        showCum && path('cum', cum.map((c, i) => pt(a, i + 1, c)), { stroke: C.green, sw: 3 }),
        showCum && cum.map((c, i) => dot(`cd${i}`, ...pt(a, i + 1, c), C.green, 4)),
    ]);
    const how: Frame[] = [
        scree(1, `Data with 8 features. PCA's first component alone holds ${Math.round(share[0] * 100)}% of the variance.`, false),
        scree(8, 'The rest hold less and less. This is a scree plot: share of variance per component.', false),
        scree(8, `Add them up (green). ${k95} components reach the 95% line, so you can keep ${k95} numbers per sample instead of 8 and lose only 5% of the spread.`, true),
    ];
    const rand = seeded(29);
    const p = axes(30, 14, 340, 200, -5, 5, -3, 3);
    const A = Array.from({ length: 18 }, () => [gaussian(rand) * 2.2, 0.55 + gaussian(rand) * 0.18] as [number, number]);
    const B = Array.from({ length: 18 }, () => [gaussian(rand) * 2.2, -0.55 + gaussian(rand) * 0.18] as [number, number]);
    const hurts: Frame[] = [
        frame('Two classes, blue and pink. They differ only in the up–down direction, which has small spread. Most of the spread is left–right.', [axisLines('ax', p), A.map((q, i) => dot(`a${i}`, ...pt(p, ...q), C.cyan, 5)), B.map((q, i) => dot(`b${i}`, ...pt(p, ...q), C.pink, 5))]),
        frame('PCA ignores the labels and keeps the direction with the most spread: left–right.', [axisLines('ax', p), line('pc1', px(p, -5), py(p, 0), px(p, 5), py(p, 0), { stroke: C.yellow, sw: 3 }), A.map((q, i) => dot(`a${i}`, ...pt(p, ...q), C.cyan, 5)), B.map((q, i) => dot(`b${i}`, ...pt(p, ...q), C.pink, 5))]),
        frame('Squash onto that one component and the two classes land on top of each other. The useful direction was thrown away. PCA keeps spread, not usefulness.', [axisLines('ax', p), line('pc1', px(p, -5), py(p, 0), px(p, 5), py(p, 0), { stroke: C.yellow, sw: 3 }), A.map((q, i) => dot(`a${i}`, ...pt(p, q[0], 0.05), C.cyan, 5)), B.map((q, i) => dot(`b${i}`, ...pt(p, q[0], -0.05), C.pink, 5))]),
    ];
    return {
        title: 'Choosing how many components to keep, and when PCA hurts',
        variants: [
            { label: 'How many components?', frames: how },
            { label: 'When PCA hurts', frames: hurts },
        ],
    };
};

// ============ f2-t16 · Gaussian mixtures and EM ============

const em = (): AnimationSpec => {
    const rand = seeded(31);
    const xs = [
        ...Array.from({ length: 30 }, () => 20 + gaussian(rand) * 3),
        ...Array.from({ length: 20 }, () => 45 + gaussian(rand) * 6),
    ];
    const a = axes(30, 20, 350, 150, 5, 70, 0, 0.09);
    const gauss = (x: number, m: number, s: number) => Math.exp(-((x - m) ** 2) / (2 * s * s)) / (s * Math.sqrt(2 * Math.PI));
    let comp = [{ m: 30, s: 8, w: 0.5 }, { m: 36, s: 8, w: 0.5 }];
    const resp = () => xs.map(x => {
        const p1 = comp[0].w * gauss(x, comp[0].m, comp[0].s);
        const p2 = comp[1].w * gauss(x, comp[1].m, comp[1].s);
        return p1 / (p1 + p2);
    });
    const logLik = () => xs.reduce((s, x) => s + Math.log(comp[0].w * gauss(x, comp[0].m, comp[0].s) + comp[1].w * gauss(x, comp[1].m, comp[1].s)), 0);
    const draw = (r: number[] | null, caption: string) => frame(caption, [
        axisLines('ax', a, '', ''),
        [10, 20, 30, 40, 50, 60].map(v => text(`xt${v}`, px(a, v), a.y + a.h + 14, v === 60 ? '60 min' : String(v), { size: 10, fill: C.dim })),
        fnPath('g1', a, x => comp[0].w * gauss(x, comp[0].m, comp[0].s), { stroke: C.cyan, sw: 3, n: 120 }),
        fnPath('g2', a, x => comp[1].w * gauss(x, comp[1].m, comp[1].s), { stroke: C.pink, sw: 3, n: 120 }),
        xs.map((x, i) => dot(`x${i}`, px(a, x), a.y + a.h - 8 - (i % 5) * 7, r ? lerpColor(C.pink, C.cyan, r[i]) : C.grey, 4)),
        panel([[`μ₁ ${round(comp[0].m, 1)}  μ₂ ${round(comp[1].m, 1)}`, C.ink], [`log-lik ${round(logLik(), 1)}`, C.green]], 214, 4, 176),
    ], 2400);
    const frames: Frame[] = [draw(null, 'Delivery times from two routes, but nobody recorded which route. Start with two bell curves in rough, wrong places.')];
    for (let it = 1; it <= 3; it++) {
        const r = resp();
        frames.push(draw(r, it === 1 ? 'E-step: for each point, how much does each curve explain it? Colour shows the share: blue for curve 1, pink for curve 2, purple for "a bit of both".' : `Round ${it}, E-step: recompute every point's shares.`));
        const n1 = r.reduce((s, v) => s + v, 0);
        const n2 = xs.length - n1;
        const m1 = xs.reduce((s, x, i) => s + r[i] * x, 0) / n1;
        const m2 = xs.reduce((s, x, i) => s + (1 - r[i]) * x, 0) / n2;
        const s1 = Math.sqrt(xs.reduce((s, x, i) => s + r[i] * (x - m1) ** 2, 0) / n1);
        const s2 = Math.sqrt(xs.reduce((s, x, i) => s + (1 - r[i]) * (x - m2) ** 2, 0) / n2);
        comp = [{ m: m1, s: Math.max(1, s1), w: n1 / xs.length }, { m: m2, s: Math.max(1, s2), w: n2 / xs.length }];
        frames.push(draw(r, it === 1 ? 'M-step: refit each curve as a weighted average of the points, using those shares as weights. The log-likelihood goes up.' : `Round ${it}, M-step: the curves move again, and the fit improves again.`));
    }
    for (let it = 0; it < 40; it++) {
        const r = resp();
        const n1 = r.reduce((s, v) => s + v, 0);
        const n2 = xs.length - n1;
        const m1 = xs.reduce((s, x, i) => s + r[i] * x, 0) / n1;
        const m2 = xs.reduce((s, x, i) => s + (1 - r[i]) * x, 0) / n2;
        comp = [
            { m: m1, s: Math.max(1, Math.sqrt(xs.reduce((s, x, i) => s + r[i] * (x - m1) ** 2, 0) / n1)), w: n1 / xs.length },
            { m: m2, s: Math.max(1, Math.sqrt(xs.reduce((s, x, i) => s + (1 - r[i]) * (x - m2) ** 2, 0) / n2)), w: n2 / xs.length },
        ];
    }
    frames.push(draw(resp(), `Converged: one route around ${round(comp[0].m, 0)} minutes (${Math.round(comp[0].w * 100)}% of deliveries), the other around ${round(comp[1].m, 0)} (${Math.round(comp[1].w * 100)}%). Found without ever being told which route a delivery took.`));
    return {
        title: 'EM: guess who belongs where, refit, repeat',
        variants: [{ label: 'Two delivery routes', frames }],
    };
};

// ============ f2-t17 · Generalisation ============

const generalisation = (): AnimationSpec => {
    const a = axes(60, 20, 200, 200, 0, 4, 0, 4);
    const three: [number, number][] = [[1, 1], [3, 1.2], [2, 3]];
    const shatter = (labels: number[], slope: number, c: number, caption: string, ok = true) => frame(caption, [
        axisLines('ax', a),
        three.map((p, i) => dot(`p${i}`, ...pt(a, ...p), labels[i] ? C.cyan : C.pink, 9)),
        lineInBox('line', a, slope, c, { stroke: ok ? C.green : C.red, sw: 3 }),
    ]);
    const four: [number, number][] = [[1, 1], [3, 3], [1, 3], [3, 1]];
    const vc: Frame[] = [
        shatter([1, 1, 1], -0.2, 0.3, 'Capacity: how many points can a model separate in every possible way? Three points, all one colour: any line that leaves them on one side works.'),
        shatter([1, 0, 0], -1.4, 3.6, 'One different from the other two: a line can cut it off.'),
        shatter([0, 1, 0], 2.6, -4.6, 'Any single point can be cut off like this.'),
        shatter([0, 0, 1], 0, 2.2, 'All 8 labellings of 3 points can be separated by some line. Lines "shatter" 3 points.'),
        frame('Four points in the XOR pattern: diagonal pairs share a colour. No straight line can separate them. So the VC dimension of a line in 2-D is 3.', [
            axisLines('ax', a),
            four.map((p, i) => dot(`q${i}`, ...pt(a, ...p), i < 2 ? C.cyan : C.pink, 9)),
            lineInBox('line', a, -1, 4.6, { stroke: C.red, sw: 3 }),
            label('x', 290, 110, 'no line works ✗', C.red, { size: 13, mono: false }),
        ]),
    ];
    const d = axes(44, 20, 330, 180, 0, 1000, 0, 4.5);
    // An illustration of the shape seen in experiments (not a measurement).
    const xsF = [10, 30, 50, 70, 85, 95, 100, 105, 115, 140, 200, 300, 500, 700, 1000];
    const ysF = [1.0, 0.75, 0.6, 0.85, 1.6, 3.0, 4.0, 3.0, 1.6, 1.1, 0.8, 0.68, 0.6, 0.55, 0.5];
    const curve = (upTo: number) => path('dd', xsF.map((x, i) => pt(d, i < upTo ? x : xsF[upTo - 1], i < upTo ? ysF[i] : ysF[upTo - 1])), { stroke: C.violet, sw: 3 });
    const dbl: Frame[] = [
        frame('Illustration: test error as a model gets more features (parameters), trained on 100 points. Classical regime first.', [axisLines('ax', d, '', 'test error'), [100, 500, 1000].map(v => text(`xt${v}`, px(d, v), d.y + d.h + 14, String(v), { size: 11, fill: C.dim })), curve(4)]),
        frame('Classical U-shape: error falls, then rises as the model starts fitting noise. At 100 features (= 100 training points) it can fit them exactly, and error spikes.', [axisLines('ax', d, '', 'test error'), [100, 500, 1000].map(v => text(`xt${v}`, px(d, v), d.y + d.h + 14, String(v), { size: 11, fill: C.dim })), curve(7), line('interp', px(d, 100), d.y, px(d, 100), d.y + d.h, { stroke: C.red, dash: '4 4' })]),
        frame('Keep growing, and test error falls again, below the classical best. This second descent is "double descent", seen in linear models and deep networks alike.', [axisLines('ax', d, '', 'test error'), [100, 500, 1000].map(v => text(`xt${v}`, px(d, v), d.y + d.h + 14, String(v), { size: 11, fill: C.dim })), curve(15), line('interp', px(d, 100), d.y, px(d, 100), d.y + d.h, { stroke: C.red, dash: '4 4' })]),
    ];
    return {
        title: 'Capacity and the surprise of double descent',
        variants: [
            { label: 'Shattering (VC dimension)', frames: vc },
            { label: 'Double descent', frames: dbl },
        ],
    };
};

export const phase2AnimationsB: Record<string, () => AnimationSpec> = {
    'f2-t10': decisionTree,
    'f2-t11': ensembles,
    'f2-t12': svm,
    'f2-t13': naiveBayes,
    'f2-t14': kMeans,
    'f2-t15': pcaPractice,
    'f2-t16': em,
    'f2-t17': generalisation,
};
