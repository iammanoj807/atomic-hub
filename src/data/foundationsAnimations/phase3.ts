import type { AnimationSpec, Frame, Shape } from '../../components/learning/anim/scene';
import { lerpColor } from '../../components/learning/anim/scene';
import {
    C,
    arrow,
    axes,
    axisLines,
    bars,
    box,
    cellAt,
    cells,
    chips,
    circle,
    dot,
    fnPath,
    frame,
    gaussian,
    layerEdges,
    layerPositions,
    line,
    lit,
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

// Phase 3 · Deep learning. Forward values, gradients, activations and
// optimiser paths are all computed here, from the formulas in the lessons.

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));
const relu = (z: number) => Math.max(0, z);

// ============ f3-t1 · The neuron and the MLP ============

const neuron = (): AnimationSpec => {
    const xs = [0.5, -1.0, 2.0];
    const ws = [0.8, -0.4, 0.6];
    const b = -0.5;
    const products = xs.map((x, i) => x * ws[i]);
    const z = products.reduce((s, v) => s + v, 0) + b;
    const out = relu(z);
    const inY = [56, 120, 184];
    const inputs = (on: boolean) => xs.map((x, i) => circle(`x${i}`, 50, inY[i], 22, { fill: tint(C.cyan, on ? 0.55 : 0.3), stroke: C.cyan, sw: 2, text: `x${i + 1}=${x}`, size: 11 }));
    const edges = (show: 'w' | 'p' | 'none') => xs.map((_, i) => [
        line(`e${i}`, 72, inY[i], 178, 120, { stroke: ws[i] > 0 ? C.green : C.pink, sw: 1.5 + Math.abs(ws[i]) * 3 }),
        show !== 'none' && label(`el${i}`, 118, (inY[i] + 120) / 2 - 10, show === 'w' ? `w=${ws[i]}` : `${round(products[i], 2)}`, ws[i] > 0 ? C.green : C.pink, { anchor: 'middle', size: 11 }),
    ]);
    const sum = (value: string, on: boolean) => {
        const s = circle('sum', 200, 120, 26, { fill: tint(C.violet, on ? 0.6 : 0.3), stroke: C.violet, sw: 2, text: value, size: 12 });
        return s;
    };
    const act = (on: boolean) => box('act', 252, 100, 64, 40, 'ReLU', C.amber, on ? { fill: tint(C.amber, 0.6) } : {});
    const output = (value: string) => circle('out', 360, 120, 22, { fill: tint(C.green, 0.6), stroke: C.green, sw: 2, text: value, size: 12 });
    const links = [arrow('l1', 226, 120, 250, 120, { stroke: C.grey }), arrow('l2', 316, 120, 336, 120, { stroke: C.grey })];
    const one: Frame[] = [
        frame('One neuron. Three inputs arrive (features, or the outputs of the layer before).', [inputs(true), edges('none'), sum('Σ', false), act(false), links, output('?')]),
        frame('Each input has its own weight. Green weights push the output up, pink ones push it down; thicker means bigger.', [inputs(false), edges('w'), sum('Σ', false), act(false), links, output('?')]),
        frame(`Multiply each input by its weight: ${products.map(p => round(p, 2)).join(', ')}.`, [inputs(false), edges('p'), sum('Σ', false), act(false), links, output('?')]),
        frame(`Add them up, plus the bias (${b}): z = w·x + b = ${round(z, 2)}.`, [inputs(false), edges('p'), sum(`z=${round(z, 2)}`, true), act(false), links, output('?')]),
        frame(`Apply the activation: ReLU(z) = max(0, ${round(z, 2)}) = ${round(out, 2)}. That one number is the neuron's output. Logistic regression is exactly this, with a sigmoid instead of ReLU.`, [inputs(false), edges('p'), sum(`z=${round(z, 2)}`, false), act(true), links, output(String(round(out, 2)))]),
    ];
    // A small MLP forward pass with seeded weights.
    const sizes = [3, 4, 4, 2];
    const rand = seeded(2);
    const W = sizes.slice(0, -1).map((n, l) => Array.from({ length: n }, () => Array.from({ length: sizes[l + 1] }, () => gaussian(rand) * 0.8)));
    const acts: number[][] = [[0.9, -0.3, 0.6]];
    for (let l = 0; l < W.length; l++) {
        const prev = acts[l];
        const next = Array.from({ length: sizes[l + 1] }, (_, j) => prev.reduce((s, v, i) => s + v * W[l][i][j], 0));
        acts.push(l < W.length - 1 ? next.map(relu) : next);
    }
    const pos = layerPositions(sizes, 50, 350, 118, 46);
    const mlpFrame = (upTo: number, caption: string) => frame(caption, [
        layerEdges('w', pos, (l, i, j) => (l < upTo ? { stroke: W[l][i][j] > 0 ? C.green : C.pink, sw: 1 + Math.abs(W[l][i][j]) * 1.6, opacity: 0.85 } : { opacity: 0.35 })),
        pos.map((layer, l) => layer.map((p, i) => circle(`n${l}-${i}`, p.x, p.y, 15, {
            fill: l <= upTo ? lerpColor(C.panel, l === sizes.length - 1 ? C.amber : C.cyan, Math.min(1, Math.abs(acts[l][i]) / 1.5)) : C.panel,
            stroke: l <= upTo ? (l === sizes.length - 1 ? C.amber : C.cyan) : C.faint,
            sw: 2,
            text: l <= upTo ? String(round(acts[l][i], 1)) : '',
            size: 10,
        }))),
        ['input', 'hidden 1', 'hidden 2', 'output'].map((name, l) => text(`t${l}`, pos[l][0].x, 222, name, { size: 11, fill: C.grey })),
    ]);
    const mlp: Frame[] = [
        mlpFrame(0, 'A multi-layer perceptron (MLP): layers of neurons, each fully connected to the next. The input layer holds the features.'),
        mlpFrame(1, 'Hidden layer 1: every neuron does w·x + b and a ReLU, all at once. In code that is one matrix multiply: h = relu(x @ W1 + b1).'),
        mlpFrame(2, 'Hidden layer 2 takes layer 1\'s outputs as its inputs, and does the same.'),
        mlpFrame(3, 'The output layer gives one score per class (no ReLU here). This left-to-right pass is the forward pass. Training will adjust every weight on every line.'),
    ];
    return {
        title: 'A neuron, and many neurons stacked in layers',
        variants: [
            { label: 'One neuron', frames: one },
            { label: 'Forward pass through an MLP', frames: mlp },
        ],
    };
};

// ============ f3-t2 · Activation functions ============

const activations = (): AnimationSpec => {
    const a = axes(40, 16, 330, 190, -4, 4, -1.4, 4);
    const gelu = (x: number) => 0.5 * x * (1 + Math.tanh(Math.sqrt(2 / Math.PI) * (x + 0.044715 * x ** 3)));
    const base: Part[] = [axisLines('ax', a, 'z', ''), line('y0', a.x, py(a, 0), a.x + a.w, py(a, 0), { stroke: C.faint }), line('x0', px(a, 0), a.y, px(a, 0), a.y + a.h, { stroke: C.faint })];
    const show = (f: (x: number) => number, name: string, color: string, caption: string) => frame(caption, [base, fnPath('act', a, f, { stroke: color, sw: 3.5, n: 120 }), panel([[name, color]], 8, 4, 190)]);
    const shapes: Frame[] = [
        show(relu, 'ReLU(z) = max(0, z)', C.cyan, 'ReLU: zero for negative inputs, the input itself for positive ones. Cheap, and its slope is exactly 1 when active, so gradients pass through. The default choice.'),
        show(sigmoid, 'σ(z) = 1 / (1 + e⁻ᶻ)', C.pink, 'Sigmoid: squashes everything into 0 to 1. Its slope is at most 0.25 and almost 0 at both ends, so deep stacks of sigmoids make gradients vanish. Used for gates and yes/no outputs.'),
        show(Math.tanh, 'tanh(z)', C.violet, 'tanh: like the sigmoid but from −1 to 1, and centred on 0. Used inside RNNs and LSTMs.'),
        show(gelu, 'GELU(z)', C.green, 'GELU: a smooth ReLU that lets small negatives through a little. Transformers use it (or close relatives like SiLU).'),
    ];
    // One bend per ReLU: building a curve from hinges.
    const h = axes(40, 16, 330, 190, 0, 6.3, -1.4, 1.4);
    const target = Math.sin;
    const hinge = (knots: number[]) => {
        const xs = [0, ...knots, 6.3];
        const slopes = xs.slice(0, -1).map((x, i) => (target(xs[i + 1]) - target(x)) / (xs[i + 1] - x));
        return (x: number) => {
            let y = target(0) + slopes[0] * x;
            knots.forEach((k, i) => { y += (slopes[i + 1] - slopes[i]) * relu(x - k); });
            return y;
        };
    };
    const hingeFrame = (knots: number[], caption: string) => frame(caption, [
        axisLines('hx', h, 'x', ''),
        fnPath('target', h, target, { stroke: C.grey, sw: 1.5, dash: '5 4' }),
        fnPath('fit', h, hinge(knots), { stroke: C.cyan, sw: 3, n: 200 }),
        knots.map((k, i) => dot(`k${i}`, ...pt(h, k, hinge(knots)(k)), C.amber, 5)),
        panel([[`${knots.length} ReLU unit${knots.length === 1 ? '' : 's'}`, C.cyan]], 266, 4, 128),
    ]);
    const why: Frame[] = [
        hingeFrame([], 'Why non-linearity? Without it, layer after layer of matrices collapses into one matrix: a straight line can never become the curve (dashed).'),
        hingeFrame([1.6], 'Add one ReLU unit: max(0, x − 1.6) adds a single bend (orange dot). The output is now two straight pieces.'),
        hingeFrame([1.05, 2.1, 3.15, 4.2], 'Four ReLUs, four bends. Each hidden neuron adds one hinge where it switches on.'),
        hingeFrame(range(0.45, 5.85, 13), 'Thirteen ReLUs: almost indistinguishable from the curve. With enough neurons, a network can approximate almost any shape. That is the universal approximation idea.'),
    ];
    return {
        title: 'Activation functions: the bends that let networks learn curves',
        variants: [
            { label: 'The common activations', frames: shapes },
            { label: 'Why non-linearity matters', frames: why },
        ],
    };
};

// ============ f3-t3 · Backpropagation by hand ============

const backprop = (): AnimationSpec => {
    // L = (w·x − y)², x = 2, y = 5, w = 1.
    const x = 2;
    const y = 5;
    const w = 1;
    const yhat = w * x;
    const e = yhat - y;
    const L = e * e;
    const dL_de = 2 * e;
    const dL_dyhat = dL_de;
    const dL_dw = dL_dyhat * x;
    const centres = [62, 150, 238, 326];
    const node = (id: string, cx: number, name: string, value: string | null, grad: string | null, color: string, on: boolean) => {
        const b = box(id, cx - 30, 70, 60, 52, value === null ? name : `${name}\n${value}`, color, { size: 12 });
        return [on ? lit(b, color) : b, grad !== null && label(`${id}-g`, cx, 142, grad, C.pink, { anchor: 'middle', size: 12 })];
    };
    const ops = ['× x', '− y', '( )²'].map((op, i) => label(`o${i}`, centres[i] + 44, 60, op, C.grey, { anchor: 'middle', size: 11 }));
    const arrows = (backward: boolean) => centres.slice(0, 3).map((cx, i) => (backward
        ? arrow(`a${i}`, cx + 56, 108, cx + 32, 108, { stroke: C.pink, sw: 2.5 })
        : arrow(`a${i}`, cx + 32, 88, cx + 56, 88, { stroke: C.cyan, sw: 2.5 })));
    const scene = (stage: number, caption: string) => {
        const forward = stage <= 3;
        const gradAt = (k: number) => !forward && stage - 4 >= 3 - k;
        return frame(caption, [
            node('w', centres[0], 'w', stage >= 0 ? String(w) : null, gradAt(0) ? `dL/dw = ${dL_dw}` : null, C.cyan, stage === 0 || stage === 7),
            node('yh', centres[1], 'ŷ', stage >= 1 ? String(yhat) : null, gradAt(1) ? `${dL_dyhat}` : null, C.violet, stage === 1 || stage === 6),
            node('e', centres[2], 'e', stage >= 2 ? String(e) : null, gradAt(2) ? `${dL_de}` : null, C.amber, stage === 2 || stage === 5),
            node('L', centres[3], 'L', stage >= 3 ? String(L) : null, gradAt(3) ? '1' : null, C.red, stage === 3 || stage === 4),
            ops,
            arrows(!forward),
            label('dir', 200, 30, forward ? 'forward pass: compute values →' : '← backward pass: gradients (pink)', forward ? C.cyan : C.pink, { anchor: 'middle', size: 13, mono: false }),
            !forward && label('rule', 200, 190, 'each step: gradient from the right × local derivative', C.grey, { anchor: 'middle', size: 11, mono: false }),
        ]);
    };
    return {
        title: 'Backpropagation: values go forward, blame flows back',
        variants: [{
            label: 'L = (w·x − y)²',
            frames: [
                scene(0, `Start with weight w = ${w}, input x = ${x} and target y = ${y}.`),
                scene(1, `Forward: ŷ = w·x = ${yhat}.`),
                scene(2, `e = ŷ − y = ${e}.`),
                scene(3, `L = e² = ${L}. Now go backwards to find dL/dw.`),
                scene(4, 'Start at the end: dL/dL = 1.'),
                scene(5, `L = e², so its local derivative is 2e = ${dL_de}. Gradient so far: 1 × ${dL_de} = ${dL_de}.`),
                scene(6, `e = ŷ − y, so de/dŷ = 1. Pass ${dL_de} × 1 = ${dL_dyhat} back to ŷ.`),
                scene(7, `ŷ = w·x, so dŷ/dw = x = ${x}. dL/dw = ${dL_dyhat} × ${x} = ${dL_dw}. Negative, so increasing w lowers the loss. That is all backprop is: local derivatives multiplied from the end backwards.`),
            ],
        }],
    };
};

// ============ f3-t4 · Autograd ============

const autograd = (): AnimationSpec => {
    const vals = { a: 2, b: -3, c: 10, f: -2 };
    const e = vals.a * vals.b;
    const d = e + vals.c;
    const L = d * vals.f;
    const grads = { L: 1, d: vals.f, f: d, e: vals.f, c: vals.f, a: vals.f * vals.b, b: vals.f * vals.a };
    const P: Record<string, [number, number]> = { a: [40, 50], b: [40, 130], e: [150, 90], c: [150, 175], d: [255, 130], f: [255, 205], L: [355, 165] };
    const leaves = ['a', 'b', 'c', 'f'];
    const order = ['a', 'b', 'e', 'c', 'd', 'f', 'L'];
    const value = (k: string) => ({ ...vals, e, d, L } as Record<string, number>)[k];
    const edgesOf: [string, string][] = [['a', 'e'], ['b', 'e'], ['e', 'd'], ['c', 'd'], ['d', 'L'], ['f', 'L']];
    const opOf: Record<string, string> = { e: 'a × b', d: 'e + c', L: 'd × f' };
    const scene = (built: number, gradsShown: string[], caption: string) => {
        const shown = order.slice(0, built);
        return frame(caption, [
            edgesOf.filter(([u, v]) => shown.includes(u) && shown.includes(v)).map(([u, v]) => arrow(`e-${u}-${v}`, P[u][0] + 30, P[u][1], P[v][0] - 32, P[v][1], { stroke: gradsShown.includes(u) ? C.pink : C.grey, sw: 2 })),
            shown.map(k => {
                const leaf = leaves.includes(k);
                const color = leaf ? C.cyan : C.violet;
                const hasGrad = gradsShown.includes(k);
                return [
                    rect(`n-${k}`, P[k][0] - 30, P[k][1] - 20, 60, 40, { rx: 8, fill: tint(color, hasGrad ? 0.5 : 0.25), stroke: hasGrad ? C.pink : color, sw: hasGrad ? 3 : 2, text: `${k} = ${value(k)}`, size: 12, mono: true }),
                    !leaf && label(`op-${k}`, P[k][0], P[k][1] - 30, opOf[k], C.grey, { anchor: 'middle', size: 10 }),
                    hasGrad && label(`g-${k}`, P[k][0], P[k][1] + 31, `grad ${(grads as Record<string, number>)[k]}`, C.pink, { anchor: 'middle', size: 11 }),
                ];
            }),
        ]);
    };
    return {
        title: 'Autograd records a graph forwards, then walks it backwards',
        variants: [{
            label: 'L = (a·b + c)·f',
            frames: [
                scene(2, [], 'Two inputs that need gradients: a = 2 and b = −3.'),
                scene(3, [], 'Compute e = a × b. Autograd quietly records the operation and its inputs: a node in the graph.'),
                scene(5, [], 'd = e + c: another node, another edge.'),
                scene(7, [], 'L = d × f = −8. The whole calculation is now a graph. Every value is kept in memory for the backward pass.'),
                scene(7, ['L'], 'loss.backward() starts at L with gradient 1…'),
                scene(7, ['L', 'd', 'f'], '…through ×: d gets f = −2 and f gets d = 4 (each side gets the other side\'s value).'),
                scene(7, ['L', 'd', 'f', 'e', 'c'], 'Through +: the gradient is passed on unchanged, so e and c both get −2.'),
                scene(7, ['L', 'd', 'f', 'e', 'c', 'a', 'b'], 'Through × again: a gets −2 × b = 6, b gets −2 × a = −4. Every .grad is filled in, with no calculus done by hand.'),
            ],
        }],
    };
};

// ============ f3-t5 · Softmax and cross-entropy ============

const softmaxCE = (): AnimationSpec => {
    const z = [2, 1, 0.1];
    const ex = z.map(Math.exp);
    const sum = ex.reduce((s, v) => s + v, 0);
    const p = ex.map(v => v / sum);
    const names = ['cat', 'dog', 'bird'];
    const a = axes(40, 30, 220, 160, 0, 3, -0.5, 8);
    const panelBox = (lines: [string, string][]) => panel(lines, 272, 30, 122);
    const chart = (values: number[], yMax: number, yMin: number, colors: string[], digits = 2) => bars('v', { ...a, yMin, yMax }, values, colors, names, { showValues: true, digits });
    const zero = (yMin: number, yMax: number) => line('zero', a.x, py({ ...a, yMin, yMax }, 0), a.x + a.w, py({ ...a, yMin, yMax }, 0), { stroke: C.dim });
    const cols = [C.green, C.grey, C.grey];
    return {
        title: 'Softmax turns scores into probabilities; cross-entropy scores them',
        variants: [{
            label: 'Logits [2, 1, 0.1]',
            frames: [
                frame('The network\'s last layer gives raw scores, called logits: 2, 1 and 0.1. They are not probabilities: they can be negative and don\'t add up to 1.', [zero(-0.5, 8), chart(z, 8, -0.5, [C.cyan, C.cyan, C.cyan], 1), panelBox([['logits z', C.cyan]])]),
                frame(`Exponentiate each: e² = ${round(ex[0], 2)}, e¹ = ${round(ex[1], 2)}, e⁰·¹ = ${round(ex[2], 2)}. Everything is now positive, and the leader pulls further ahead.`, [zero(-0.5, 8), chart(ex, 8, -0.5, [C.amber, C.amber, C.amber]), panelBox([['exp(z)', C.amber], [`sum ${round(sum, 2)}`, C.ink]])]),
                frame(`Divide by the total (${round(sum, 2)}): ${p.map(v => round(v, 2)).join(', ')}. These are probabilities that add up to 1. That is softmax.`, [zero(0, 1), chart(p, 1, 0, [C.violet, C.violet, C.violet]), panelBox([['softmax', C.violet], ['sums to 1', C.ink]])]),
                frame(`The true answer is "cat". Cross-entropy loss = −log(p_cat) = −log ${round(p[0], 2)} = ${round(-Math.log(p[0]), 2)}.`, [zero(0, 1), chart(p, 1, 0, cols), panelBox([['true: cat', C.green], [`loss ${round(-Math.log(p[0]), 2)}`, C.yellow]])]),
                frame(`And the gradient of the loss with respect to the logits is simply p − y: [${p.map((v, i) => round(v - (i === 0 ? 1 : 0), 2)).join(', ')}]. Push the cat score up, the others down.`, [zero(-0.5, 0.5), chart(p.map((v, i) => v - (i === 0 ? 1 : 0)), 0.5, -0.5, [C.green, C.pink, C.pink]), panelBox([['gradient p − y', C.pink]])]),
            ],
        }],
    };
};

// ============ f3-t6 · Optimisers ============

const optimisers = (): AnimationSpec => {
    // A long, narrow valley: f(x, y) = 0.5·(x² + 20·y²).
    const a = axes(20, 14, 360, 196, -5.2, 1.2, -1.6, 1.6);
    const grad = (x: number, y: number): [number, number] => [x, 20 * y];
    const start: [number, number] = [-4.8, 1.2];
    const runSGD = () => { const out = [start]; let [x, y] = start; for (let i = 0; i < 40; i++) { const [gx, gy] = grad(x, y); x -= 0.09 * gx; y -= 0.09 * gy; out.push([x, y]); } return out; };
    const runMomentum = () => { const out = [start]; let [x, y] = start; let vx = 0; let vy = 0; for (let i = 0; i < 40; i++) { const [gx, gy] = grad(x, y); vx = 0.85 * vx + gx; vy = 0.85 * vy + gy; x -= 0.02 * vx; y -= 0.02 * vy; out.push([x, y]); } return out; };
    const runAdam = () => {
        const out = [start]; let [x, y] = start; let mx = 0; let my = 0; let vx = 0; let vy = 0;
        for (let t = 1; t <= 40; t++) {
            const [gx, gy] = grad(x, y);
            mx = 0.9 * mx + 0.1 * gx; my = 0.9 * my + 0.1 * gy;
            vx = 0.999 * vx + 0.001 * gx * gx; vy = 0.999 * vy + 0.001 * gy * gy;
            const mxh = mx / (1 - 0.9 ** t); const myh = my / (1 - 0.9 ** t);
            const vxh = vx / (1 - 0.999 ** t); const vyh = vy / (1 - 0.999 ** t);
            x -= 0.25 * mxh / (Math.sqrt(vxh) + 1e-8); y -= 0.25 * myh / (Math.sqrt(vyh) + 1e-8);
            out.push([x, y]);
        }
        return out;
    };
    const runs: [string, [number, number][], string][] = [['SGD', runSGD(), C.red], ['momentum', runMomentum(), C.amber], ['Adam', runAdam(), C.green]];
    const rings = [0.2, 0.8, 2, 4].map((c, i) => path(`r${i}`, range(0, 2 * Math.PI, 72).map(t => pt(a, Math.max(-5.2, Math.min(1.2, Math.sqrt(2 * c) * Math.cos(t))), Math.max(-1.6, Math.min(1.6, Math.sqrt((2 * c) / 20) * Math.sin(t))))), { stroke: '#2f6f7a', sw: 1.2, closed: true }));
    const f = (x: number, y: number) => 0.5 * (x * x + 20 * y * y);
    const race = (steps: number, caption: string) => frame(caption, [
        rings,
        dot('min', ...pt(a, 0, 0), C.yellow, 5),
        runs.map(([name, ps, color]) => [
            path(`p-${name}`, ps.map((q, i) => pt(a, ...(i <= steps ? q : ps[steps]))), { stroke: color, sw: 2.5 }),
            circle(`b-${name}`, ...pt(a, ...ps[steps]), 6, { fill: color, stroke: C.bg, sw: 1.5 }),
        ]),
        panel(runs.map(([name, ps, color]) => [`${name}: f = ${round(f(...ps[steps]), 2)}`, color] as [string, string]), 220, 178, 172),
    ], 2600);
    const raceFrames: Frame[] = [
        race(0, 'A long, narrow valley: steep across, gentle along. All three optimisers start at the same point (left) and aim for the yellow minimum.'),
        race(4, 'SGD (red) bounces across the steep walls, because the gradient points mostly across the valley, not along it.'),
        race(12, 'Momentum (orange) averages its recent steps: the side-to-side parts cancel and speed builds up along the valley.'),
        race(40, 'Adam (green) scales each direction by its typical gradient size, so its path is straighter early on. Here all three end near the bottom, but only because SGD\'s learning rate was set just under the value where it would blow up. Adam works well across many problems with little tuning, which is why AdamW is the usual default.'),
    ];
    const s = axes(46, 20, 330, 180, 0, 1000, 0, 1.1);
    const lr = (t: number) => (t < 100 ? t / 100 : 0.5 * (1 + Math.cos((Math.PI * (t - 100)) / 900)));
    const schedule: Frame[] = [
        frame('A learning-rate schedule changes the step size during training. Plot learning rate (as a share of its peak) against training step.', [axisLines('ax', s, 'step', 'learning rate')]),
        frame('Warm-up: start tiny and ramp up over the first steps, while Adam\'s running averages are still unreliable and the weights are random.', [axisLines('ax', s, 'step', 'learning rate'), fnPath('lr', s, lr, { to: 100, stroke: C.amber, sw: 3 })]),
        frame('Then cosine decay: big steps early to make progress, small steps late to settle into a good minimum. Warm-up then cosine is the standard recipe for transformers.', [axisLines('ax', s, 'step', 'learning rate'), fnPath('lr', s, lr, { stroke: C.amber, sw: 3, n: 160 })]),
    ];
    return {
        title: 'SGD, momentum and Adam racing down a narrow valley',
        variants: [
            { label: 'The race', frames: raceFrames },
            { label: 'Learning-rate schedule', frames: schedule },
        ],
    };
};

// ============ f3-t7 · Initialisation, vanishing and exploding gradients ============

const initialisation = (): AnimationSpec => {
    const width = 48;
    const layers = 16;
    const simulate = (scale: (fanIn: number) => number) => {
        const rand = seeded(13);
        let h = Array.from({ length: 64 }, () => Array.from({ length: width }, () => gaussian(rand)));
        const stds: number[] = [];
        for (let l = 0; l < layers; l++) {
            const s = scale(width);
            const W = Array.from({ length: width }, () => Array.from({ length: width }, () => gaussian(rand) * s));
            h = h.map(row => Array.from({ length: width }, (_, j) => relu(row.reduce((acc, v, i) => acc + v * W[i][j], 0))));
            const flat = h.flat();
            const m = flat.reduce((acc, v) => acc + v, 0) / flat.length;
            stds.push(Math.sqrt(flat.reduce((acc, v) => acc + (v - m) ** 2, 0) / flat.length));
        }
        return stds;
    };
    const a = axes(46, 24, 330, 170, 0, layers, 0, 1);
    const chart = (stds: number[], color: string, caption: string, title: string) => {
        const shown = stds.map(v => Math.log10(Math.max(1e-12, v)));
        const lo = -8;
        const hi = 8;
        const b = { ...a, yMin: lo, yMax: hi };
        return frame(caption, [
            line('mid', b.x, py(b, 0), b.x + b.w, py(b, 0), { stroke: C.yellow, dash: '5 4', sw: 1.5 }),
            text('midl', b.x - 6, py(b, 0), '1', { size: 11, fill: C.yellow, anchor: 'end' }),
            text('hil', b.x - 6, py(b, 6), '10⁶', { size: 11, fill: C.dim, anchor: 'end' }),
            text('lol', b.x - 6, py(b, -6), '10⁻⁶', { size: 11, fill: C.dim, anchor: 'end' }),
            axisLines('ax', b, '', 'activation size (log)'),
            shown.map((v, i) => {
                const clamped = Math.max(lo, Math.min(hi, v));
                return rect(`s${i}`, b.x + 6 + i * (b.w / layers), py(b, clamped), b.w / layers - 6, Math.max(2, py(b, lo) - py(b, clamped)), { rx: 2, fill: color });
            }),
            text('xl', b.x + b.w / 2, b.y + b.h + 14, `layers 1 → ${layers}`, { size: 11, fill: C.grey }),
            panel([[title, color], [`layer ${layers}: ${stds[layers - 1].toExponential(1)}`, C.ink]], 214, 4, 180),
        ]);
    };
    const tiny = simulate(() => 0.01);
    const he = simulate(n => Math.sqrt(2 / n));
    const huge = simulate(() => 1);
    return {
        title: 'Keeping the signal the same size through many layers',
        variants: [
            { label: 'Too small (std 0.01)', frames: [
                chart(tiny.map(() => 1), C.grey, `A ${layers}-layer ReLU network. Each bar will show how big the activations are at that layer, on a log scale; 1 (dashed) is healthy.`, 'before'),
                chart(tiny, C.cyan, `Weights with std 0.01: every layer shrinks the signal. By layer ${layers} it is about ${tiny[layers - 1].toExponential(0)}: it has vanished, and so will the gradients on the way back.`, 'std = 0.01'),
            ] },
            { label: 'He init √(2/fan_in)', frames: [
                chart(he.map(() => 1), C.grey, 'Same network, same input.', 'before'),
                chart(he, C.green, `He initialisation, std = √(2 / ${width}): each layer keeps the signal about the same size, layer after layer. The extra 2 makes up for ReLU zeroing half the values.`, 'He'),
            ] },
            { label: 'Too big (std 1)', frames: [
                chart(huge.map(() => 1), C.grey, 'Same network, same input.', 'before'),
                chart(huge, C.red, `Weights with std 1: every layer multiplies the signal by about √(${width}/2) ≈ ${round(Math.sqrt(width / 2), 1)}. By layer ${layers} it is about ${huge[layers - 1].toExponential(0)}: exploding, and soon inf or NaN.`, 'std = 1'),
            ] },
        ],
    };
};

// ============ f3-t8 · Batch norm and layer norm ============

const normalisation = (): AnimationSpec => {
    const X = [[4, 1, 2, 3, 0], [2, 5, 1, 2, 1], [6, 3, 3, 1, 2], [0, 7, 2, 2, 1]];
    const norm = (v: number[]) => {
        const m = v.reduce((s, q) => s + q, 0) / v.length;
        const sd = Math.sqrt(v.reduce((s, q) => s + (q - m) ** 2, 0) / v.length + 1e-5);
        return v.map(q => (q - m) / sd);
    };
    const bn = X[0].map((_, j) => norm(X.map(r => r[j])));
    const BN = X.map((r, i) => r.map((_, j) => bn[j][i]));
    const LN = X.map(norm);
    const S = 46;
    const x0 = 120;
    const y0 = 40;
    const heat = (v: number, raw: boolean) => (raw ? lerpColor('#16222e', C.blue, Math.min(1, v / 7)) : v >= 0 ? lerpColor('#1b1f27', C.amber, Math.min(1, v / 1.8)) : lerpColor('#1b1f27', C.violet, Math.min(1, -v / 1.8)));
    const grid = (M: number[][], raw: boolean, hl: { row?: number; col?: number }) => cells('c', x0, y0, 4, 5, S, (r, c) => (raw ? String(M[r][c]) : String(round(M[r][c], 1))), (r, c) => heat(M[r][c], raw), { gap: 4, textSize: 12 }).map(cell => {
        const [, r, c] = cell.id.split('-').map(Number);
        const on = hl.row === r || hl.col === c;
        return on ? { ...cell, stroke: C.yellow, sw: 2.5 } : cell;
    });
    const labels: Part[] = [
        [0, 1, 2, 3].map(r => text(`ex${r}`, x0 - 12, cellAt(x0, y0, S, r, 0, 4).cy, `ex ${r + 1}`, { size: 11, fill: C.grey, anchor: 'end' })),
        [0, 1, 2, 3, 4].map(c => text(`f${c}`, cellAt(x0, y0, S, 0, c, 4).cx, y0 - 12, `f${c + 1}`, { size: 11, fill: C.grey })),
    ];
    const batch: Frame[] = [
        frame('A batch of 4 examples (rows), each with 5 features (columns). Feature 2 is large and feature 5 is small: very different scales.', [labels, grid(X, true, {})]),
        frame('Batch norm works down each column: for one feature, take its mean and spread across the batch.', [labels, grid(X, true, { col: 1 })]),
        frame('Every column now has mean 0 and spread 1 (orange above the mean, purple below). The network then rescales each feature with learned γ and β.', [labels, grid(BN, false, {})]),
        frame('Because the statistics come from the batch, batch norm needs a decent batch size, and at test time it uses running averages saved during training.', [labels, grid(BN, false, { col: 1 })]),
    ];
    const layer: Frame[] = [
        frame('The same batch.', [labels, grid(X, true, {})]),
        frame('Layer norm works across each row: for one example, take the mean and spread over its own features.', [labels, grid(X, true, { row: 0 })]),
        frame('Every row now has mean 0 and spread 1. Each example is normalised on its own, so the batch size doesn\'t matter and training and test behave the same. That is why transformers use layer norm.', [labels, grid(LN, false, {})]),
    ];
    return {
        title: 'Normalising activations: down the batch, or across the features',
        variants: [
            { label: 'Batch norm', frames: batch },
            { label: 'Layer norm', frames: layer },
        ],
    };
};

// ============ f3-t9 · Regularisation: dropout and augmentation ============

const regularisationDL = (): AnimationSpec => {
    const sizes = [4, 6, 6, 2];
    const pos = layerPositions(sizes, 50, 350, 112, 32);
    const rand = seeded(41);
    const masks = Array.from({ length: 3 }, () => sizes.map((n, l) => Array.from({ length: n }, () => (l === 0 || l === sizes.length - 1 ? true : rand() > 0.5))));
    const net = (mask: boolean[][] | null, caption: string) => frame(caption, [
        layerEdges('w', pos, (l, i, j) => ({ stroke: mask && (!mask[l][i] || !mask[l + 1][j]) ? C.faint : C.grey, opacity: mask && (!mask[l][i] || !mask[l + 1][j]) ? 0.15 : 0.6, sw: 1.2 })),
        pos.map((layer, l) => layer.map((p, i) => {
            const on = !mask || mask[l][i];
            return circle(`n${l}-${i}`, p.x, p.y, 11, { fill: on ? tint(C.cyan, 0.7) : C.bg, stroke: on ? C.cyan : C.red, sw: 2, text: on ? (mask && l > 0 && l < sizes.length - 1 ? '×2' : '') : '✕', textColor: on ? C.ink : C.red, size: 9 });
        })),
        label('mode', 200, 222, mask ? 'training: random half of hidden units dropped, survivors × 2' : 'test time: every unit on, no scaling', mask ? C.amber : C.green, { anchor: 'middle', size: 11, mono: false }),
    ]);
    const dropout: Frame[] = [
        net(null, 'A network with two hidden layers.'),
        net(masks[0], 'Training step 1, dropout rate 0.5: a random half of the hidden neurons are switched off (red). The rest are scaled up × 2 so the total signal stays the same size.'),
        net(masks[1], 'Step 2: a different random half. No neuron can rely on any particular partner being there, so each must learn something useful on its own.'),
        net(masks[2], 'Step 3: another random team. In effect, you train a huge number of thinned networks that share weights.'),
        net(null, 'At test time dropout is off: every neuron is used, with no scaling (that is why it was scaled during training). Forgetting model.eval() leaves dropout on, and predictions become random.'),
    ];
    // Augmentation on a tiny picture.
    const art = ['..##....', '.####...', '######..', '.####...', '..##....', '..##....', '..##....', '..##....'];
    const pic = (id: string, x: number, y: number, map: (r: number, c: number) => [number, number] | null, note: string, color: string) => {
        const shapes: Shape[] = [];
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const src = map(r, c);
                const on = src !== null && src[0] >= 0 && src[0] < 8 && src[1] >= 0 && src[1] < 8 && art[src[0]][src[1]] === '#';
                shapes.push(rect(`${id}-${r}-${c}`, x + c * 11, y + r * 11, 10, 10, { rx: 1.5, fill: on ? color : '#1c232c' }));
            }
        }
        return [shapes, text(`${id}-t`, x + 44, y + 102, note, { size: 11, fill: C.grey })];
    };
    const original = pic('o', 20, 50, (r, c) => [r, c], 'original', C.cyan);
    const flips = pic('f', 150, 50, (r, c) => [r, 7 - c], 'flipped', C.green);
    const shift = pic('s', 280, 50, (r, c) => [r - 1, c + 1], 'shifted', C.amber);
    const augmentation: Frame[] = [
        frame('One training image. A model trained on only this exact picture can memorise its pixels.', [original]),
        frame('Data augmentation makes new, still-correct examples: flip it, and it is still the same kind of thing.', [original, flips]),
        frame('Shift or crop it, and it is still the same thing too. Each epoch the model sees a slightly different version, so memorising pixels stops working and it must learn the shape.', [original, flips, shift]),
    ];
    return {
        title: 'Stopping a network from memorising',
        variants: [
            { label: 'Dropout', frames: dropout },
            { label: 'Data augmentation', frames: augmentation },
        ],
    };
};

// ============ f3-t10 · PyTorch training loop ============

const trainingLoop = (): AnimationSpec => {
    const code = ['for xb, yb in loader:', '  out = model(xb)', '  loss = loss_fn(out, yb)', '  opt.zero_grad()', '  loss.backward()', '  opt.step()'];
    const steps: [string, string, string][] = [
        ['loader', 'DataLoader\nnext batch', C.cyan],
        ['fwd', 'forward\nmodel(xb)', C.violet],
        ['loss', 'loss\ncross-entropy', C.pink],
        ['zero', 'zero_grad\nclear old grads', C.grey],
        ['back', 'backward\ncompute grads', C.amber],
        ['step', 'step\nupdate weights', C.green],
    ];
    const ring = (on: number) => steps.map(([id, name, color], i) => {
        const angle = -Math.PI / 2 + (i * 2 * Math.PI) / steps.length;
        const shape = box(`s-${id}`, 106 + 58 * Math.cos(angle) - 44, 118 + 82 * Math.sin(angle) - 19, 88, 38, name, color, { size: 10 });
        return i === on ? lit(shape, color) : shape;
    });
    const codePanel = (on: number) => [
        rect('code-bg', 214, 40, 182, 148, { rx: 8, fill: '#000000', stroke: C.faint, sw: 1 }),
        code.map((lineText, i) => [
            i === on && rect(`hl`, 218, 50 + i * 22, 174, 20, { rx: 4, fill: tint(steps[i][2], 0.3) }),
            text(`c${i}`, 222, 60 + i * 22, lineText, { size: 10, mono: true, fill: i === on ? C.ink : C.dim, anchor: 'start' }),
        ]),
    ];
    const captions = [
        'The DataLoader hands over the next shuffled mini-batch: inputs xb and labels yb.',
        'Forward pass: run the batch through the model to get logits. Autograd records the graph as it goes.',
        'Compute the loss: one number saying how wrong this batch was.',
        'Clear the old gradients. PyTorch adds new gradients to old ones, so skipping this mixes batches together.',
        'Backward pass: autograd fills in .grad for every weight.',
        'The optimiser updates every weight using its gradient. Then back to the top for the next batch — thousands of times.',
    ];
    return {
        title: 'The training loop: the same six steps, every batch',
        variants: [{ label: 'One iteration', frames: captions.map((caption, i) => frame(caption, [ring(i), codePanel(i)], 3200)) }],
    };
};

// ============ f3-t11 · Convolutional networks ============

const convolution = (): AnimationSpec => {
    const img = [
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0],
        [9, 9, 9, 9, 9, 9],
        [9, 9, 9, 9, 9, 9],
        [9, 9, 9, 9, 9, 9],
    ];
    const k = [[-1, -1, -1], [0, 0, 0], [1, 1, 1]];
    const out = Array.from({ length: 4 }, (_, r) => Array.from({ length: 4 }, (_, c) => {
        let s = 0;
        for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) s += img[r + i][c + j] * k[i][j];
        return s;
    }));
    const S = 26;
    const IX = 16;
    const IY = 40;
    const OX = 290;
    const OY = 66;
    const image = cells('i', IX, IY, 6, 6, S, (r, c) => String(img[r][c]), (r, c) => (img[r][c] ? '#5f6b78' : '#11161d'), { gap: 2, textSize: 10 });
    const kernel = cells('k', 196, 66, 3, 3, 22, (r, c) => String(k[r][c]), (r, c) => (k[r][c] > 0 ? tint(C.green, 0.5) : k[r][c] < 0 ? tint(C.pink, 0.5) : '#1c232c'), { gap: 2, textSize: 10 });
    const window = (r: number, c: number) => rect('win', IX + c * (S + 2) - 2, IY + r * (S + 2) - 2, 3 * (S + 2) + 2, 3 * (S + 2) + 2, { fill: 'none', stroke: C.yellow, sw: 3, rx: 4 });
    const output = (filled: number) => cells('o', OX, OY, 4, 4, 22, (r, c) => (r * 4 + c < filled ? String(out[r][c]) : ''), (r, c) => (r * 4 + c < filled ? (out[r][c] > 0 ? tint(C.amber, Math.min(0.9, out[r][c] / 27)) : '#1c232c') : '#11161d'), { gap: 2, textSize: 10 });
    const heads: Part[] = [
        text('ih', IX + 84, 26, 'image 6 × 6', { size: 11, fill: C.grey }),
        text('kh', 230, 50, 'filter 3 × 3', { size: 11, fill: C.grey }),
        text('oh', OX + 47, 50, 'feature map 4 × 4', { size: 11, fill: C.grey }),
    ];
    const slide = (r: number, c: number, filled: number, caption: string) => frame(caption, [heads, image, kernel, window(r, c), output(filled), label('v', 230, 160, `= ${out[r][c]}`, C.yellow, { anchor: 'middle', size: 14 })], 2200);
    const conv: Frame[] = [
        frame('A tiny grey-scale image: dark on top (0), bright below (9). And a 3 × 3 filter that responds to "dark above, bright below": a horizontal edge.', [heads, image, kernel, output(0)]),
        slide(0, 0, 1, 'Place the filter on the top-left 3 × 3 patch, multiply matching numbers and add them up: all dark, so 0.'),
        slide(1, 0, 5, 'Slide across the top row (all 0), then down one row. Now the bottom of the window covers bright pixels: 9 + 9 + 9 = 27. A strong response: an edge!'),
        slide(2, 0, 9, 'One more row down: dark in the top row of the window, bright in the bottom row. Again 27.'),
        slide(3, 3, 16, 'All bright: the −1s and +1s cancel to 0. The finished feature map lights up exactly along the edge.'),
        frame('Output size = (W − K + 2P)/S + 1 = (6 − 3 + 0)/1 + 1 = 4. The same 9 weights were reused at every position, so an edge is found anywhere in the picture. A real layer learns dozens of filters at once.', [heads, image, kernel, output(16)]),
    ];
    // Receptive field.
    const rf = (layer: number, caption: string) => {
        const span = 1 + 2 * layer;
        const centre = 4;
        return frame(caption, [
            cells('g', 60, 20, 9, 9, 20, () => '', (r, c) => (Math.abs(r - centre) <= layer && Math.abs(c - centre) <= layer ? tint(C.cyan, 0.25 + 0.15 * (3 - layer)) : '#11161d'), { gap: 2 }),
            rect('one', 60 + centre * 22 - 2, 20 + centre * 22 - 2, 24, 24, { fill: 'none', stroke: C.amber, sw: 3, rx: 3 }),
            label('rf', 290, 100, `${span} × ${span}`, C.cyan, { anchor: 'middle', size: 22 }),
            label('rf2', 290, 130, layer === 0 ? 'one pixel' : `after ${layer} layer${layer === 1 ? '' : 's'} of 3 × 3`, C.grey, { anchor: 'middle', size: 12, mono: false }),
        ]);
    };
    const field: Frame[] = [
        rf(0, 'The receptive field is how much of the original image one output value can "see".'),
        rf(1, 'After one 3 × 3 convolution, each output sees a 3 × 3 patch: enough for an edge.'),
        rf(2, 'Stack a second 3 × 3 layer: each output now sees 5 × 5, because each of its 9 inputs saw its own 3 × 3.'),
        rf(3, 'Three layers: 7 × 7. Deeper layers see bigger regions, so they can recognise bigger things: edges, then corners, then eyes, then faces. Pooling and stride grow it faster.'),
    ];
    return {
        title: 'Convolution: one small filter slid across the whole image',
        variants: [
            { label: 'Sliding a filter', frames: conv },
            { label: 'Receptive field', frames: field },
        ],
    };
};

// ============ f3-t12 · Residual connections ============

const residual = (): AnimationSpec => {
    const n = 10;
    const a = axes(46, 120, 330, 90, 0, n, 0, 1.05);
    const plain = Array.from({ length: n }, (_, i) => 0.55 ** (n - 1 - i));
    const res = Array.from({ length: n }, (_, i) => 0.9 + 0.1 * Math.cos(i));
    const blocks = (skip: boolean, on: boolean) => [
        Array.from({ length: 5 }, (_, i) => box(`b${i}`, 22 + i * 76, 44, 54, 34, 'F(x)', C.violet, { size: 11 })),
        Array.from({ length: 4 }, (_, i) => arrow(`a${i}`, 76 + i * 76, 61, 98 + i * 76, 61, { stroke: C.grey, sw: 2 })),
        skip && Array.from({ length: 5 }, (_, i) => path(`sk${i}`, [[18 + i * 76, 61], [18 + i * 76, 24], [80 + i * 76, 24], [80 + i * 76, 54]], { stroke: on ? C.green : tint(C.green, 0.8), sw: on ? 3.5 : 2, arrow: true })),
        skip && Array.from({ length: 5 }, (_, i) => text(`plus${i}`, 88 + i * 76, 48, '+', { size: 14, fill: C.green, weight: 800 })),
    ];
    const gradBars = (values: number[], color: string, show: boolean) => show && [
        axisLines('ax', a, '', 'gradient size'),
        bars('g', a, values, color, values.map((_, i) => String(i + 1))),
    ];
    return {
        title: 'Residual connections: a shortcut for the signal and the gradient',
        variants: [{
            label: 'Plain vs residual',
            frames: [
                frame('A plain deep network: each block transforms its input, y = F(x). The gradient has to pass back through every block.', [blocks(false, false)]),
                frame('Illustration: if each block shrinks the gradient to about half on the way back, early layers (left) get almost nothing. They barely learn.', [blocks(false, false), gradBars(plain, C.red, true)]),
                frame('A residual block adds its input back: y = x + F(x). The block only has to learn the change, and an identity "highway" (green) runs past every block.', [blocks(true, true)]),
                frame('The derivative of x + F(x) is 1 + F′(x). That "1" carries the gradient straight back, so early layers still learn. This is what made 50-, 100- and 1,000-layer networks trainable.', [blocks(true, false), gradBars(res, C.green, true)]),
            ],
        }],
    };
};

// ============ f3-t13 · RNNs ============

const rnn = (): AnimationSpec => {
    const tokens = ['t', 'h', 'e', ' ', 'c', 'a', 't'];
    const colors = [C.cyan, C.pink, C.amber, C.grey, C.green, C.violet, C.blue];
    const keep = 0.55;
    const cell = (t: number, upTo: number) => {
        const x = 26 + t * 52;
        const shown = t <= upTo;
        // How much of each earlier token is still in the hidden state.
        const shares = Array.from({ length: t + 1 }, (_, s) => keep ** (t - s));
        const total = shares.reduce((s, v) => s + v, 0);
        let y = 60;
        const stripes = shown ? shares.map((v, s) => {
            const hgt = (v / total) * 56;
            const r = rect(`h${t}-${s}`, x, y, 36, hgt, { fill: colors[s] });
            y += hgt;
            return r;
        }) : [];
        return [
            rect(`hb${t}`, x - 2, 58, 40, 60, { rx: 6, fill: 'none', stroke: shown ? C.ink : C.faint, sw: 1.5 }),
            stripes,
            chips(`tok${t}`, x + 3, 150, [tokens[t] === ' ' ? '␣' : tokens[t]], colors[t], { size: 13 }),
            arrow(`in${t}`, x + 18, 148, x + 18, 122, { stroke: shown ? colors[t] : C.faint, sw: 2 }),
            t > 0 && arrow(`hh${t}`, x - 16, 88, x - 4, 88, { stroke: shown ? C.ink : C.faint, sw: 2 }),
            text(`hl${t}`, x + 18, 44, `h${t + 1}`, { size: 11, fill: shown ? C.grey : C.faint }),
        ];
    };
    const scene = (upTo: number, caption: string) => frame(caption, [Array.from({ length: tokens.length }, (_, t) => cell(t, upTo)), label('key', 20, 206, 'colour = how much of each letter the memory still holds', C.grey, { size: 11, mono: false })]);
    return {
        title: 'An RNN reads one step at a time, with a fading memory',
        variants: [{
            label: 'Reading "the cat"',
            frames: [
                scene(0, 'An RNN reads "the cat" one character at a time. After "t", the hidden state h₁ (its memory) is all about "t".'),
                scene(2, 'Each step mixes the new character into the memory using the same weights: hₜ = tanh(W·hₜ₋₁ + U·xₜ). Older characters take up less and less room.'),
                scene(6, 'By the last "t", the first "t" is a thin sliver. Information from far back fades, because it has been squeezed through the same small memory again and again.'),
                scene(6, 'Training has the same problem in reverse: the gradient to early steps is multiplied by W at every step. If that factor is 0.9, after 100 steps it is 0.9¹⁰⁰ ≈ 0.00003: vanished. LSTMs and then transformers were invented to fix this.'),
            ],
        }],
    };
};

// ============ f3-t14 · Embeddings ============

const embeddings = (): AnimationSpec => {
    const words: [string, number, number, string][] = [
        ['king', 1.8, 2.6, C.amber], ['queen', 3.6, 2.7, C.amber], ['man', 1.6, 0.9, C.cyan], ['woman', 3.4, 1.0, C.cyan],
        ['apple', -2.6, -1.4, C.green], ['banana', -3.4, -2.0, C.green], ['cherry', -2.2, -2.3, C.green],
        ['cat', -2.4, 1.9, C.pink], ['dog', -3.2, 1.4, C.pink],
    ];
    const a = axes(20, 14, 360, 210, -4.5, 4.8, -2.8, 3.4);
    const rand = seeded(7);
    const random = words.map(() => [-4 + rand() * 7, -2.5 + rand() * 5.5] as [number, number]);
    const scatter = (trained: boolean, extra: Part[] = []) => frame('', [
        words.map(([w, x, y, c], i) => {
            const p = trained ? pt(a, x, y) : pt(a, ...random[i]);
            return [dot(`d${i}`, ...p, trained ? c : C.grey, 6), text(`w${i}`, p[0] + 8, p[1] - 10, w, { size: 12, fill: trained ? c : C.grey, anchor: 'start', weight: 600 })];
        }),
        extra,
    ]);
    const withCaption = (f: Frame, caption: string): Frame => ({ ...f, caption });
    const map: Frame[] = [
        withCaption(scatter(false), 'Each word gets a vector, shown here in 2-D. Before training the vectors are random, so the map means nothing.'),
        withCaption(scatter(true), 'Training nudges the vectors so words used in similar ways end up close: fruit near fruit, pets near pets, royalty near people.'),
        withCaption(scatter(true, [
            arrow('man-king', ...pt(a, 1.6, 0.9), ...pt(a, 1.8, 2.6), { stroke: C.yellow, sw: 2 }),
            arrow('woman-queen', ...pt(a, 3.4, 1.0), ...pt(a, 3.6, 2.7), { stroke: C.yellow, sw: 2, dash: '5 4' }),
        ]), 'Directions can carry meaning too: man → king is roughly the same arrow as woman → queen. So king − man + woman lands near queen.'),
    ];
    const vocab = ['the', 'cat', 'sat', 'on', 'mat'];
    const rand2 = seeded(5);
    const table = vocab.map(() => Array.from({ length: 6 }, () => gaussian(rand2)));
    const row = (i: number, on: boolean) => [
        text(`v${i}`, 70, 52 + i * 30, `${i}: ${vocab[i]}`, { size: 12, fill: on ? C.yellow : C.grey, anchor: 'end', mono: true }),
        table[i].map((v, j) => rect(`t${i}-${j}`, 80 + j * 34, 40 + i * 30, 30, 24, { rx: 3, fill: v > 0 ? lerpColor('#1b1f27', C.amber, Math.min(1, v / 1.6)) : lerpColor('#1b1f27', C.violet, Math.min(1, -v / 1.6)), stroke: on ? C.yellow : C.faint, sw: on ? 2 : 1 })),
    ];
    const lookup: Frame[] = [
        frame('An embedding layer is just a table: one row of numbers per item in the vocabulary. Here, 5 words × 6 numbers.', [vocab.map((_, i) => row(i, false))]),
        frame('The word "cat" has id 1. Its embedding is simply row 1 of the table: a lookup, no maths.', [vocab.map((_, i) => row(i, i === 1)), label('id', 300, 82, 'id 1 → row 1', C.yellow, { size: 13 })]),
        frame('The rows are ordinary weights. When a sentence uses "cat", backprop only changes row 1, nudging it to be more useful. Over many sentences, similar words drift close together.', [vocab.map((_, i) => row(i, i === 1)), label('id', 300, 82, 'only this row\nis updated', C.yellow, { size: 12 })]),
    ];
    return {
        title: 'Embeddings: a learned vector for every item',
        variants: [
            { label: 'The lookup table', frames: lookup },
            { label: 'The meaning map', frames: map },
        ],
    };
};

// ============ f3-t15 · Debugging training ============

const debugging = (): AnimationSpec => {
    const a = axes(46, 22, 330, 176, 0, 100, 0, 3);
    const ts = range(0, 100, 50);
    const curve = (id: string, f: (t: number) => number, color: string, share = 1) => {
        const points = ts.map(t => pt(a, t, Math.min(3, f(t))));
        const shown = Math.max(1, Math.round(points.length * share));
        return path(id, points.map((p, i) => (i < shown ? p : points[shown - 1])), { stroke: color, sw: 3 });
    };
    const ln10 = Math.log(10);
    const checks: Frame[] = [
        frame(`Check 1, before any training: with 10 classes and random weights, every class gets about 1/10, so the loss should be −ln(1/10) = ln 10 ≈ ${round(ln10, 2)}.`, [axisLines('ax', a, 'step', 'loss'), line('exp', a.x, py(a, ln10), a.x + a.w, py(a, ln10), { stroke: C.green, dash: '5 4' }), label('el', a.x + 6, py(a, ln10) - 10, `expected ≈ ${round(ln10, 2)}`, C.green, { size: 12 }), dot('s0', ...pt(a, 0, ln10), C.green, 7)]),
        frame('If step 0 shows something like 15 (far off the top), the outputs are wildly over-confident: bad initialisation, or a softmax/loss bug. Fix it before training.', [axisLines('ax', a, 'step', 'loss'), line('exp', a.x, py(a, ln10), a.x + a.w, py(a, ln10), { stroke: C.green, dash: '5 4' }), label('bad', a.x + 10, a.y + 12, 'loss at step 0 = 15 ↑ bug!', C.red, { size: 13 })]),
        frame('Check 2: train on one small batch only. A working model should drive its loss close to 0 by memorising it.', [axisLines('ax', a, 'step', 'loss'), curve('ok', t => ln10 * Math.exp(-t / 14) + 0.01, C.green)]),
        frame('If it can\'t (the loss stalls, red), there is a bug: labels misaligned, gradients not flowing, or the optimiser not stepping. Only once this works, train on everything.', [axisLines('ax', a, 'step', 'loss'), curve('ok', t => ln10 * Math.exp(-t / 14) + 0.01, C.green), curve('bad', t => 1.4 + 0.9 * Math.exp(-t / 10), C.red)]),
    ];
    return {
        title: 'Two checks that catch most training bugs',
        variants: [{ label: 'Step-0 loss and overfit one batch', frames: checks }],
    };
};

// ============ f3-t16 · LSTMs and GRUs ============

const lstm = (): AnimationSpec => {
    const cPrev = 0.8;
    const f = 0.9;
    const i = 0.5;
    const g = 0.6;
    const o = 0.7;
    const c = f * cPrev + i * g;
    const h = o * Math.tanh(c);
    const belt = (value: string, color: string) => [
        line('belt', 20, 52, 380, 52, { stroke: color, sw: 6 }),
        label('beltv', 30, 34, value, color, { size: 12 }),
    ];
    const gate = (id: string, x: number, name: string, value: string, color: string, on: boolean) => [
        circle(id, x, 130, 22, { fill: tint(color, on ? 0.7 : 0.25), stroke: color, sw: 2, text: name, size: 11 }),
        on && label(`${id}v`, x, 168, value, color, { anchor: 'middle', size: 12 }),
        line(`${id}l`, x, 108, x, 60, { stroke: on ? color : C.faint, sw: 2 }),
    ];
    const ops = (on: number) => [
        circle('mulF', 110, 52, 12, { fill: C.bg, stroke: on === 1 ? C.red : C.grey, sw: 2, text: '×', size: 12 }),
        circle('add', 210, 52, 12, { fill: C.bg, stroke: on === 2 ? C.green : C.grey, sw: 2, text: '+', size: 12 }),
        circle('mulO', 320, 52, 14, { fill: C.bg, stroke: on === 3 ? C.violet : C.grey, sw: 2, text: 'tanh', size: 9 }),
    ];
    const scene = (stage: number, caption: string) => frame(caption, [
        belt(stage >= 2 ? `c = ${round(c, 2)}` : `c_prev = ${cPrev}`, stage >= 2 ? C.green : C.cyan),
        ops(stage),
        gate('gf', 110, 'forget', `f = ${f}`, C.red, stage === 1),
        gate('gi', 176, 'input', `i = ${i}`, C.amber, stage === 2),
        gate('gg', 246, 'new', `g = ${g}`, C.amber, stage === 2),
        gate('go', 320, 'output', `o = ${o}`, C.violet, stage === 3),
        stage >= 3 && label('h', 330, 210, `h = ${round(h, 2)}`, C.violet, { anchor: 'middle', size: 14 }),
        label('cell', 380, 72, 'cell state', C.grey, { anchor: 'end', size: 11, mono: false }),
    ]);
    return {
        title: 'An LSTM cell: a memory belt with three gates',
        variants: [{
            label: 'One step',
            frames: [
                scene(0, `The cell state is a conveyor belt of memory running through time. It arrives holding ${cPrev}.`),
                scene(1, `Forget gate: a number from 0 to 1 decides how much to keep. f = ${f}, so ${cPrev} × ${f} = ${round(f * cPrev, 2)} stays.`),
                scene(2, `Input gate and new content: add i × g = ${i} × ${g} = ${round(i * g, 2)}. The belt now holds ${round(c, 2)}. The memory is updated by adding, not by repeated multiplying, so gradients can travel far back along the belt.`),
                scene(3, `Output gate: what to reveal this step. h = o × tanh(c) = ${o} × ${round(Math.tanh(c), 2)} = ${round(h, 2)}. A GRU does the same job with two gates instead of three.`),
            ],
        }],
    };
};

export const phase3Animations: Record<string, () => AnimationSpec> = {
    'f3-t1': neuron,
    'f3-t2': activations,
    'f3-t3': backprop,
    'f3-t4': autograd,
    'f3-t5': softmaxCE,
    'f3-t6': optimisers,
    'f3-t7': initialisation,
    'f3-t8': normalisation,
    'f3-t9': regularisationDL,
    'f3-t10': trainingLoop,
    'f3-t11': convolution,
    'f3-t12': residual,
    'f3-t13': rnn,
    'f3-t14': embeddings,
    'f3-t15': debugging,
    'f3-t16': lstm,
};
