import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import { lerpColor } from '../../components/learning/anim/scene';
import {
    C,
    arrow,
    axes,
    axisLines,
    bars,
    box,
    cells,
    chipWidth,
    chips,
    circle,
    dot,
    fnPath,
    frame,
    line,
    lit,
    path,
    pt,
    px,
    py,
    rect,
    round,
    seeded,
    text,
    tint,
    type Part,
} from '../../components/learning/anim/kit';
import { label, panel } from './common';

// Phase 4 · Transformers and LLMs. Merges, probabilities, masks and counts
// are computed here; attention patterns that stand for a trained model are
// labelled as illustrations in their captions.

const softmax = (z: number[]) => {
    const m = Math.max(...z);
    const e = z.map(v => Math.exp(v - m));
    const s = e.reduce((a, b) => a + b, 0);
    return e.map(v => v / s);
};

// ============ f4-t1 · Tokenisation and BPE ============

const bpe = (): AnimationSpec => {
    let words = ['low', 'lower', 'lowest'].map(w => w.split(''));
    const states: { words: string[][]; merged: string | null; pair: [string, string] | null; count: number }[] = [{ words, merged: null, pair: null, count: 0 }];
    for (let m = 0; m < 4; m++) {
        const counts = new Map<string, number>();
        const order: string[] = [];
        words.forEach(w => w.slice(0, -1).forEach((t, i) => {
            const key = `${t}\u0000${w[i + 1]}`;
            if (!counts.has(key)) order.push(key);
            counts.set(key, (counts.get(key) ?? 0) + 1);
        }));
        const best = order.reduce((b, k) => ((counts.get(k) ?? 0) > (counts.get(b) ?? 0) ? k : b), order[0]);
        const [l, r] = best.split('\u0000');
        words = words.map(w => {
            const out: string[] = [];
            for (let i = 0; i < w.length; i++) {
                if (i < w.length - 1 && w[i] === l && w[i + 1] === r) { out.push(l + r); i++; } else out.push(w[i]);
            }
            return out;
        });
        states.push({ words, merged: l + r, pair: [l, r], count: counts.get(best) ?? 0 });
    }
    const palette = [C.cyan, C.pink, C.amber, C.green, C.violet, C.blue, C.orange];
    const colorOf = (tok: string) => palette[[...tok].reduce((s, ch) => s + ch.charCodeAt(0), 0) % palette.length];
    const draw = (k: number, caption: string) => {
        const st = states[k];
        const vocab = states.slice(1, k + 1).map(s => s.merged as string);
        return frame(caption, [
            st.words.map((w, wi) => [
                label(`wl${wi}`, 30, 50 + wi * 44, ['low', 'lower', 'lowest'][wi], C.grey, { size: 11, mono: false }),
                chips(`w${wi}`, 90, 37 + wi * 44, w, w.map(colorOf), { ids: w.map((_, i) => `w${wi}-${i}`) }),
            ]),
            st.pair && label('merge', 90, 190, `merge "${st.pair[0]}" + "${st.pair[1]}" → "${st.merged}"  (seen ${st.count}×)`, C.yellow, { size: 12 }),
            label('vocab', 90, 216, `new tokens: ${vocab.length ? vocab.join(', ') : '—'}`, C.green, { size: 12 }),
        ]);
    };
    return {
        title: 'Byte-pair encoding: merge the most common pair, again and again',
        variants: [{
            label: 'low · lower · lowest',
            frames: [
                draw(0, 'Start with single characters. "low", "lower" and "lowest" are 3, 5 and 6 tokens long.'),
                draw(1, 'Count every neighbouring pair. "l"+"o" appears 3 times (tied with "o"+"w", so the first one wins). Merge it into one new token, "lo".'),
                draw(2, 'Count again. Now "lo"+"w" is most common: merge into "low". The vocabulary grows by one token per merge.'),
                draw(3, '"low"+"e" appears twice: merge into "lowe". Common pieces become single tokens.'),
                draw(4, 'One more merge gives "lower". Real tokenizers do tens of thousands of merges on huge text, so common words become one token and rare words split into pieces.'),
            ],
        }],
    };
};

// ============ f4-t2 · Embeddings and positions ============

const positions = (): AnimationSpec => {
    const vec: Record<string, number[]> = { dog: [0.8, -0.3, 0.5, 0.1], bites: [-0.6, 0.9, 0.2, -0.4], man: [0.3, 0.2, -0.8, 0.7] };
    const pos = [0, 1, 2].map(p => [0, 1, 2, 3].map(d => (d % 2 === 0 ? Math.sin(p / 10 ** (d / 4)) : Math.cos(p / 10 ** ((d - 1) / 4))) * 0.6));
    const heat = (v: number) => (v >= 0 ? lerpColor('#1b1f27', C.amber, Math.min(1, v)) : lerpColor('#1b1f27', C.violet, Math.min(1, -v)));
    const column = (id: string, x: number, y: number, values: number[]) => values.map((v, i) => rect(`${id}-${i}`, x, y + i * 14, 34, 12, { rx: 3, fill: heat(v) }));
    const sentence = (id: string, y: number, words: string[], withPos: boolean) => words.map((w, i) => [
        chips(`${id}c${i}`, 40 + i * 52, y, [w], C.cyan, { size: 12 }),
        column(`${id}v${i}`, 44 + i * 52, y + 32, withPos ? vec[w].map((v, d) => v + pos[i][d]) : vec[w]),
    ]);
    const embed: Frame[] = [
        frame('Each token id becomes a vector (shown as a column of colours). "dog" always gets the same vector, wherever it appears.', [label('a', 230, 30, 'dog bites man', C.ink, { size: 13, mono: false }), sentence('a', 50, ['dog', 'bites', 'man'], false)]),
        frame('"man bites dog" uses exactly the same three vectors. Attention on its own treats the input as a bag of vectors, so it can\'t tell these two sentences apart.', [label('a', 230, 30, 'dog bites man', C.ink, { size: 13, mono: false }), sentence('a', 50, ['dog', 'bites', 'man'], false), label('b', 230, 130, 'man bites dog', C.ink, { size: 13, mono: false }), sentence('b', 146, ['man', 'bites', 'dog'], false)]),
        frame('Add a position vector for seat 0, 1, 2. Now "dog" in seat 0 and "dog" in seat 2 look different, and word order is part of the input.', [label('a', 230, 30, 'dog bites man', C.ink, { size: 13, mono: false }), sentence('a', 50, ['dog', 'bites', 'man'], true), label('b', 230, 130, 'man bites dog', C.ink, { size: 13, mono: false }), sentence('b', 146, ['man', 'bites', 'dog'], true)]),
    ];
    const P = 16;
    const D = 16;
    const sinus = (p: number, d: number) => (d % 2 === 0 ? Math.sin(p / 10000 ** (d / D)) : Math.cos(p / 10000 ** ((d - 1) / D)));
    const grid = (upTo: number) => cells('pe', 60, 20, P, D, 11, () => '', (p, d) => (p < upTo ? heat(sinus(p, d)) : '#11161d'), { gap: 1 });
    const waves: Frame[] = [
        frame('Sinusoidal position encoding: one row per position (top to bottom), one column per dimension.', [grid(1), label('pl', 260, 26, 'position 0', C.grey, { size: 11 })]),
        frame('Each column is a wave. The first columns change quickly from row to row; later columns change slowly.', [grid(8), label('pl', 260, 26, 'positions 0–7', C.grey, { size: 11 })]),
        frame('Together the waves give every position a unique pattern, like a binary clock with smooth hands, and nearby positions get similar patterns. Many modern models use RoPE instead, which rotates queries and keys by an angle that depends on position.', [grid(16), label('pl', 260, 26, 'positions 0–15', C.grey, { size: 11 })]),
    ];
    return {
        title: 'Token embeddings plus positions',
        variants: [
            { label: 'Why positions', frames: embed },
            { label: 'Sine-wave positions', frames: waves },
        ],
    };
};

// ============ f4-t3 · Self-attention ============

const attention = (): AnimationSpec => {
    const tokens = ['the', 'animal', 'was', 'tired', 'so', 'it', 'slept'];
    const query = 5;
    // Illustrative query·key scores for "it" (a trained model would learn these).
    const scores = [0.1, 2.6, 0.3, 1.2, 0.2, 0.9, 0.4];
    const w = softmax(scores);
    // Chips laid out by their real widths; xc gives each chip's centre.
    const widths = tokens.map(t => chipWidth(t, 11));
    const gap = (380 - widths.reduce((acc, v) => acc + v, 0)) / (tokens.length - 1);
    const lefts = widths.map((_, i) => 10 + widths.slice(0, i).reduce((acc, v) => acc + v, 0) + gap * i);
    const xc = (i: number) => lefts[i] + widths[i] / 2;
    const row = (y: number, highlight: number | null) => tokens.map((t, i) => chips(`t${i}`, lefts[i], y, [t], i === highlight ? C.yellow : C.cyan, { size: 11 }));
    const arcs = (scale: (i: number) => number) => tokens.map((_, i) => path(`arc${i}`, [[xc(query), 104], [(xc(query) + xc(i)) / 2, 104 - 24 - 50 * scale(i)], [xc(i), 104]], { stroke: C.pink, sw: 0.5 + 9 * scale(i), opacity: 0.3 + 0.7 * scale(i) }));
    const weightBars = (show: boolean) => show && [
        tokens.map((_, i) => rect(`wb${i}`, xc(i) - 12, 222 - 70 * w[i], 24, 70 * w[i], { rx: 3, fill: i === 1 ? C.pink : tint(C.pink, 0.6) })),
        tokens.map((_, i) => text(`wv${i}`, xc(i), 214 - 70 * w[i], String(round(w[i], 2)), { size: 10, fill: C.ink })),
        line('wbase', 10, 222, 390, 222, { stroke: C.dim, sw: 1 }),
        label('wl', 10, 232, 'attention weights (they sum to 1)', C.grey, { size: 10, mono: false }),
    ];
    const scoreText = (show: boolean) => show && tokens.map((_, i) => text(`s${i}`, xc(i), 152, String(scores[i]), { size: 12, fill: C.amber, mono: true }));
    return {
        title: 'Self-attention: each word gathers information from the words it needs',
        variants: [{
            label: 'What does "it" look at?',
            frames: [
                frame('A sentence. To understand "it", the model needs to know what "it" refers to.', [row(110, query)]),
                frame('"it" makes a query (what am I looking for?). Every word makes a key (what do I contain?). Score = query · key / √d for each word. (Scores here are an illustration of what a trained model learns.)', [row(110, query), scoreText(true)]),
                frame(`Softmax turns the scores into weights that add up to 1. "animal" gets ${round(w[1], 2)}, the biggest share.`, [row(110, query), weightBars(true)]),
                frame('Drawn as lines: thicker means more attention. "it" looks mostly at "animal", a little at "tired".', [arcs(i => w[i] / Math.max(...w)), row(110, query), weightBars(true)]),
                frame('The output for "it" is the weighted average of every word\'s value vector, so "it" now carries information about the animal. Every word does this at the same time, in parallel: one matrix multiply, Q·Kᵀ, then softmax, then times V.', [arcs(i => w[i] / Math.max(...w)), row(110, query), label('out', 200, 180, 'out(it) = Σ weightᵢ × valueᵢ', C.yellow, { anchor: 'middle', size: 13 })]),
            ],
        }],
    };
};

// ============ f4-t4 · Multi-head attention and the block ============

const multiHead = (): AnimationSpec => {
    const tokens = ['Ada', 'paid', 'Bo', '£5', 'on', 'Monday'];
    const x = (i: number) => 34 + i * 58;
    const headPatterns: [string, string, number[][]][] = [
        ['head 1: previous word', C.cyan, tokens.map((_, i) => tokens.map((__, j) => (j === i - 1 ? 1 : 0)))],
        ['head 2: who did what', C.pink, tokens.map((_, i) => tokens.map((__, j) => (i === 1 && (j === 0 || j === 2) ? 0.5 : 0)))],
        ['head 3: money and dates', C.amber, tokens.map((_, i) => tokens.map((__, j) => (i === 1 && (j === 3 || j === 5) ? 0.5 : 0)))],
    ];
    const row = (y: number) => tokens.map((t, i) => chips(`t${i}`, x(i), y, [t], C.grey, { size: 11 }));
    const arcs = (h: number) => {
        const [, color, P] = headPatterns[h];
        const out: Part[] = [];
        P.forEach((rowW, i) => rowW.forEach((wgt, j) => {
            if (wgt > 0) out.push(path(`h${h}-a${i}-${j}`, [[x(i) + 18, 120], [(x(i) + x(j)) / 2 + 18, 120 - 22 - 12 * Math.abs(i - j)], [x(j) + 18, 120]], { stroke: color, sw: 2 + 4 * wgt, arrow: true }));
        }));
        return out;
    };
    const heads: Frame[] = [
        frame('Multi-head attention runs several attentions side by side. (Illustration: real heads learn their own, often messier, patterns.)', [row(126)]),
        ...headPatterns.map(([name, color], h) => frame(`${name}: ${['each word attends to the word just before it.', '"paid" looks at who paid and who was paid.', '"paid" looks at the amount and the day.'][h]}`, [row(126), arcs(h), label('hn', 200, 30, name, color, { anchor: 'middle', size: 13, mono: false })])),
        frame('Each head works in its own smaller space (768 dimensions split into 12 heads of 64 in GPT-2 small). Their outputs are joined back together and mixed by one more matrix.', [row(126), arcs(0), arcs(1), arcs(2)]),
    ];
    const step = (on: number) => {
        const items: [string, number, number, string][] = [['LN', 70, 40, C.grey], ['attention', 130, 80, C.pink], ['+', 236, 24, C.green], ['LN', 278, 40, C.grey], ['MLP', 336, 50, C.violet]];
        const second: [string, number, number, string][] = [];
        return [
            line('stream', 14, 150, 394, 150, { stroke: C.cyan, sw: 6, opacity: 0.6 }),
            label('sl', 20, 172, 'residual stream (one vector per token)', C.cyan, { size: 11, mono: false }),
            items.concat(second).map(([name, bx, w, color], i) => {
                const shape = name === '+' ? circle(`b${i}`, bx + w / 2, 150, 12, { fill: C.bg, stroke: C.green, sw: 2, text: '+', size: 13 }) : box(`b${i}`, bx, 74, w, 36, name, color, { size: 11 });
                return i === on ? lit(shape, color) : shape;
            }),
            line('down1', 90, 110, 90, 150, { stroke: C.faint, sw: 2 }),
            arrow('up1', 170, 110, 170, 140, { stroke: C.faint, sw: 2 }),
            line('down2', 298, 110, 298, 150, { stroke: C.faint, sw: 2 }),
            circle('plus2', 370, 150, 12, { fill: C.bg, stroke: on === 5 ? C.green : C.faint, sw: 2, text: '+', size: 13 }),
            arrow('up2', 361, 110, 366, 140, { stroke: C.faint, sw: 2 }),
        ];
    };
    const block: Frame[] = [
        frame('A transformer block. Each token\'s vector flows along the residual stream (blue), left to right.', [step(-1)]),
        frame('Layer norm, then multi-head attention: tokens exchange information with each other.', [step(1)]),
        frame('The result is added back onto the stream: x = x + attention(LN(x)). A residual connection.', [step(2)]),
        frame('Layer norm again, then an MLP applied to each token on its own (usually 4× wider inside). Attention moves information between tokens; the MLP processes it within each token.', [step(4)]),
        frame('Added back again: x = x + MLP(LN(x)). A model like GPT-2 small stacks 12 of these blocks, all the same shape.', [step(5)]),
    ];
    return {
        title: 'Many heads, one block, stacked many times',
        variants: [
            { label: 'Multi-head attention', frames: heads },
            { label: 'The transformer block', frames: block },
        ],
    };
};

// ============ f4-t5 · GPT and next-token prediction ============

const gpt = (): AnimationSpec => {
    const prompt = ['The', 'cat', 'sat', 'on', 'the'];
    const steps: [string[], number[], string][] = [
        [['mat', 'floor', 'sofa', 'roof', 'moon'], [2.4, 1.6, 1.2, 0.3, -1.0], 'mat'],
        [['.', 'and', 'all', 'while', 'today'], [2.0, 1.4, 0.6, 0.4, 0.1], '.'],
    ];
    const a = axes(220, 60, 160, 120, -0.5, 4.5, 0, 1);
    const scene = (k: number, showProbs: boolean, caption: string) => {
        const text1 = [...prompt, ...steps.slice(0, k).map(s => s[2])];
        const [cands, logits] = steps[Math.min(k, steps.length - 1)];
        const p = softmax(logits);
        return frame(caption, [
            chips('ctx', 16, 24, text1, text1.map((_, i) => (i >= prompt.length ? C.green : C.cyan)), { size: 12, ids: text1.map((_, i) => `c${i}`) }),
            box('model', 20, 80, 150, 70, 'GPT\n(transformer blocks)', C.violet, { size: 12 }),
            arrow('in', 95, 52, 95, 78, { stroke: C.grey }),
            arrow('out', 172, 115, 214, 115, { stroke: C.grey }),
            showProbs && k < steps.length && [bars('p', a, p, p.map((_, i) => (i === 0 ? C.green : C.grey))), cands.map((c, i) => text(`n${i}`, px(a, i), a.y + a.h + 14, c, { size: 11, fill: C.ink })), p.map((v, i) => text(`v${i}`, px(a, i), py(a, v) - 8, String(round(v, 2)), { size: 10, fill: C.ink }))],
        ]);
    };
    const generate: Frame[] = [
        scene(0, false, 'A GPT reads the text so far, "The cat sat on the" …'),
        scene(0, true, '… and outputs a probability for every token in its vocabulary (the top 5 shown). Probabilities here are an illustration.'),
        scene(1, true, 'Pick one (here the likeliest, "mat") and append it. Now the input is one token longer: predict again.'),
        scene(2, false, 'Predict, append, repeat. That is all generation is. Each new token can only look at tokens before it, enforced by the causal mask.'),
    ];
    const T = 6;
    const words = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
    const maskGrid = (upTo: number) => cells('m', 120, 40, T, T, 24, () => '', (r, c) => (r >= upTo ? '#11161d' : c <= r ? tint(C.green, 0.7) : tint(C.red, 0.35)), { gap: 2 });
    const mask: Frame[] = [
        frame('The causal mask: row = the token doing the looking, column = the token being looked at.', [maskGrid(1), words.map((w, i) => text(`r${i}`, 110, 52 + i * 26, w, { size: 11, fill: C.grey, anchor: 'end' })), words.map((w, i) => text(`cc${i}`, 132 + i * 26, 30, w, { size: 10, fill: C.grey }))]),
        frame('Green cells are allowed, red are blocked (set to −∞ before the softmax). Each token sees itself and everything before it, never the future.', [maskGrid(6), words.map((w, i) => text(`r${i}`, 110, 52 + i * 26, w, { size: 11, fill: C.grey, anchor: 'end' })), words.map((w, i) => text(`cc${i}`, 132 + i * 26, 30, w, { size: 10, fill: C.grey }))]),
        frame('This makes training efficient: one pass over "The cat sat on the mat" trains 5 predictions at once: The → cat, The cat → sat, and so on. The targets are the inputs shifted left by one.', [maskGrid(6), words.map((w, i) => text(`r${i}`, 110, 52 + i * 26, w, { size: 11, fill: C.grey, anchor: 'end' })), words.map((w, i) => text(`cc${i}`, 132 + i * 26, 30, w, { size: 10, fill: C.grey })), label('sh', 290, 100, 'input:\nThe cat sat on the\n\ntarget:\ncat sat on the mat', C.yellow, { size: 10 })]),
    ];
    return {
        title: 'GPT: predict the next token, append it, repeat',
        variants: [
            { label: 'Generating text', frames: generate },
            { label: 'The causal mask', frames: mask },
        ],
    };
};

// ============ f4-t6 · Encoders vs decoders ============

const encoderDecoder = (): AnimationSpec => {
    const T = 5;
    const grid = (id: string, x: number, causal: boolean) => cells(id, x, 50, T, T, 26, () => '', (r, c) => (!causal || c <= r ? tint(C.green, 0.7) : tint(C.red, 0.3)), { gap: 2 });
    const tokens = ['Paris', 'is', 'the', '[MASK]', 'of', 'France'];
    const x = (i: number) => 24 + i * 60;
    const arcsTo = (from: number, targets: number[], color: string) => targets.map(j => path(`a${from}-${j}`, [[x(from) + 22, 150], [(x(from) + x(j)) / 2 + 22, 112 - 8 * Math.abs(from - j)], [x(j) + 22, 150]], { stroke: color, sw: 2.5 }));
    const masks: Frame[] = [
        frame('Encoder (BERT): every token can attend to every other token, before and after it. Fully green.', [grid('enc', 40, false), label('el', 107, 32, 'encoder', C.cyan, { anchor: 'middle', size: 13, mono: false })]),
        frame('Decoder (GPT): each token sees only itself and the past. The upper triangle is blocked.', [grid('enc', 40, false), label('el', 107, 32, 'encoder', C.cyan, { anchor: 'middle', size: 13, mono: false }), grid('dec', 226, true), label('dl', 293, 32, 'decoder', C.amber, { anchor: 'middle', size: 13, mono: false })]),
    ];
    const blank: Frame[] = [
        frame('BERT is trained on fill-in-the-blank: some tokens are hidden and it must guess them.', [chips('s', 24, 156, tokens, tokens.map(t => (t === '[MASK]' ? C.yellow : C.cyan)), { size: 11, ids: tokens.map((_, i) => `w${i}`) })]),
        frame('To fill [MASK], it uses words on both sides, including "of France" after the gap. That two-way view makes encoders strong for understanding: classification, search embeddings.', [chips('s', 24, 156, tokens, tokens.map(t => (t === '[MASK]' ? C.yellow : C.cyan)), { size: 11, ids: tokens.map((_, i) => `w${i}`) }), arcsTo(3, [0, 1, 2, 4, 5], C.cyan)]),
        frame('A GPT predicting the word after "Paris is the" may only look left. One-way view, but it can generate text one token at a time. Today most big models are decoders.', [chips('s', 24, 156, tokens.slice(0, 3), C.cyan, { size: 11, ids: [0, 1, 2].map(i => `w${i}`) }), chips('next', 24 + 3 * 60, 156, ['?'], C.amber, { size: 11, ids: ['w3'] }), arcsTo(3, [0, 1, 2], C.amber)]),
    ];
    return {
        title: 'Encoders look both ways; decoders only look back',
        variants: [
            { label: 'Attention masks', frames: masks },
            { label: 'Fill in the blank', frames: blank },
        ],
    };
};

// ============ f4-t13 · Vision transformers and CLIP ============

const vitClip = (): AnimationSpec => {
    const G = 4;
    const S = 34;
    const colorAt = (r: number, c: number) => [C.blue, C.cyan, C.teal, C.green][(r + c) % 4];
    const patches = (spread: number) => Array.from({ length: G * G }, (_, k) => {
        const r = Math.floor(k / G);
        const c = k % G;
        const gx = 30 + c * (S + 2 + spread);
        const gy = 30 + r * (S + 2 + spread);
        return rect(`p${k}`, gx, gy, S, S, { rx: 3, fill: tint(colorAt(r, c), 0.7), stroke: C.bg, sw: 1, text: spread > 0 ? String(k) : '', size: 10 });
    });
    const asRow = () => Array.from({ length: G * G }, (_, k) => rect(`p${k}`, 12 + k * 23.5, 120, 21, 34, { rx: 3, fill: tint(colorAt(Math.floor(k / G), k % G), 0.7), stroke: C.bg, sw: 1, text: String(k), size: 9 }));
    const vit: Frame[] = [
        frame('A vision transformer starts from an ordinary image.', [patches(0)]),
        frame('Cut it into square patches, for example 16 × 16 pixels each. Here a 4 × 4 grid of patches.', [patches(6)]),
        frame('Lay the patches out in a row, like words in a sentence. Each patch is flattened and turned into a vector by one linear layer: a patch embedding.', [asRow()]),
        frame('Add position embeddings (patch 5 must know it sits at row 1, column 1), then run an ordinary transformer. A 224 × 224 image with 16 × 16 patches gives 196 tokens.', [asRow(), Array.from({ length: G * G }, (_, k) => rect(`pos${k}`, 12 + k * 23.5, 158, 21, 6, { rx: 2, fill: C.amber })), box('tf', 120, 186, 160, 34, 'transformer blocks', C.violet, { size: 12 })]),
    ];
    const N = 4;
    const imgs = ['🐱', '🐶', '🚗', '🌳'];
    const caps = ['a cat', 'a dog', 'a car', 'a tree'];
    const rand = seeded(3);
    const sim = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => (i === j ? 0.82 + rand() * 0.1 : 0.1 + rand() * 0.2)));
    const matrix = (trained: boolean) => cells('s', 130, 40, N, N, 40, (r, c) => String(round(trained ? sim[r][c] : 0.3 + (((r * 7 + c * 3) % 5) - 2) * 0.03, 2)), (r, c) => lerpColor('#1b1f27', C.green, trained ? sim[r][c] : 0.3), { gap: 3, textSize: 11 });
    const clipLabels: Part[] = [
        imgs.map((e, i) => text(`im${i}`, 110, 60 + i * 43, e, { size: 20, anchor: 'end' })),
        caps.map((c, i) => text(`cp${i}`, 150 + i * 43, 30, c, { size: 10, fill: C.grey })),
    ];
    const clip: Frame[] = [
        frame('CLIP has two encoders: one for images, one for text. Each maps its input to a vector in the same space.', [clipLabels, matrix(false)]),
        frame('Each cell is the similarity (dot product) between an image\'s vector and a caption\'s vector. Before training, it is noise.', [clipLabels, matrix(false)]),
        frame('Training pushes each matching pair (the diagonal) together and every mismatch apart, over hundreds of millions of image–caption pairs. (Numbers are an illustration.)', [clipLabels, matrix(true)]),
        frame('Zero-shot classification: embed a new photo, embed the texts "a photo of a cat", "a photo of a dog", …, and pick the closest. No cat-versus-dog training needed.', [clipLabels, matrix(true), rect('hl', 130 - 2, 40 - 2, 4 * 43, 44, { fill: 'none', stroke: C.yellow, sw: 3, rx: 6 })]),
    ];
    return {
        title: 'Images as sequences of patches, and pictures matched to words',
        variants: [
            { label: 'Vision transformer', frames: vit },
            { label: 'CLIP', frames: clip },
        ],
    };
};

// ============ f4-t7 · Sampling ============

const sampling = (): AnimationSpec => {
    const tokens = ['mat', 'floor', 'sofa', 'bed', 'roof', 'moon'];
    const logits = [3.0, 2.2, 1.6, 0.9, 0.4, -0.5];
    const a = axes(40, 30, 330, 160, -0.5, 5.5, 0, 1);
    const chart = (p: number[], kept: boolean[], caption: string, tag: string, color: string) => frame(caption, [
        axisLines('ax', a, '', 'probability'),
        bars('p', a, p, p.map((_, i) => (kept[i] ? color : '#3a434e'))),
        tokens.map((t, i) => text(`t${i}`, px(a, i), a.y + a.h + 14, t, { size: 11, fill: kept[i] ? C.ink : C.dim })),
        p.map((v, i) => text(`v${i}`, px(a, i), py(a, v) - 8, String(round(v, 2)), { size: 10, fill: C.ink })),
        panel([[tag, color]], 230, 4, 164),
    ]);
    const all = tokens.map(() => true);
    const temp = (T: number) => softmax(logits.map(z => z / T));
    const temperature: Frame[] = [
        chart(temp(1), all, `Next-token probabilities at temperature 1: "mat" ${round(temp(1)[0], 2)}, and a long tail of less likely words.`, 'T = 1', C.cyan),
        chart(temp(0.5), all, `Temperature 0.5 divides the logits by 0.5 before softmax: the top choice grows to ${round(temp(0.5)[0], 2)}. Sharper, safer, more repetitive.`, 'T = 0.5', C.green),
        chart(temp(2), all, `Temperature 2: flatter. "mat" falls to ${round(temp(2)[0], 2)} and even "moon" gets ${round(temp(2)[5], 2)}. More creative, more mistakes.`, 'T = 2', C.amber),
        chart(temp(0.05), all, 'Temperature near 0 is greedy decoding: always the single most likely token. Deterministic, but prone to dull loops.', 'T → 0 (greedy)', C.violet),
    ];
    const p1 = temp(1);
    const k = 3;
    const keptK = p1.map((_, i) => i < k);
    const renorm = (kept: boolean[]) => {
        const s = p1.reduce((acc, v, i) => acc + (kept[i] ? v : 0), 0);
        return p1.map((v, i) => (kept[i] ? v / s : 0));
    };
    let cum = 0;
    const keptP = p1.map(v => { const keep = cum < 0.9; cum += v; return keep; });
    const topk: Frame[] = [
        chart(p1, all, 'Start from the full distribution (T = 1).', 'all tokens', C.cyan),
        chart(p1, keptK, `Top-k with k = ${k}: keep only the ${k} most likely tokens and drop the rest.`, `top-k, k = ${k}`, C.pink),
        chart(renorm(keptK), keptK, 'Renormalise the survivors so they add up to 1 again, then sample. Strange low-probability words can never appear.', `top-k, k = ${k}`, C.pink),
        chart(p1, keptP, `Top-p (nucleus) with p = 0.9: keep the smallest set of top tokens whose probabilities add up to at least 0.9 — here ${keptP.filter(Boolean).length} tokens. When the model is sure, the set is small; when it is unsure, it is larger.`, 'top-p, p = 0.9', C.green),
    ];
    return {
        title: 'Choosing the next token: temperature, top-k and top-p',
        variants: [
            { label: 'Temperature', frames: temperature },
            { label: 'Top-k and top-p', frames: topk },
        ],
    };
};

// ============ f4-t8 · KV cache ============

const kvCache = (): AnimationSpec => {
    const words = ['The', 'cat', 'sat', 'on', 'the', 'mat'];
    const row = (i: number, y: number, fresh: boolean, recomputed: boolean) => [
        text(`w${i}`, 46, y + 9, words[i], { size: 11, fill: C.grey, anchor: 'end' }),
        rect(`k${i}`, 54, y, 70, 18, { rx: 3, fill: tint(fresh ? C.yellow : recomputed ? C.red : C.cyan, 0.6), text: 'K', size: 10 }),
        rect(`v${i}`, 128, y, 70, 18, { rx: 3, fill: tint(fresh ? C.yellow : recomputed ? C.red : C.violet, 0.6), text: 'V', size: 10 }),
    ];
    const scene = (n: number, cached: boolean, work: number, caption: string) => frame(caption, [
        label('title', 54, 22, cached ? 'with a KV cache' : 'without a cache', cached ? C.green : C.red, { size: 13, mono: false }),
        Array.from({ length: n }, (_, i) => row(i, 34 + i * 24, i === n - 1, !cached && i < n - 1)),
        panel([[`token ${n}`, C.ink], [`K,V computed: ${work}`, cached ? C.green : C.red]], 230, 40, 164),
    ]);
    const tri = (n: number) => (n * (n + 1)) / 2;
    const without: Frame[] = [1, 2, 3, 6].map(n => scene(n, false, tri(n), n === 1 ? 'Generating token by token. Each new token\'s attention needs the keys (K) and values (V) of every earlier token.' : n < 6 ? `Without a cache, step ${n} recomputes K and V for all ${n} tokens (red = recomputed, again).` : `After 6 tokens: ${tri(6)} K,V computations, growing with the square of the length. For a long reply that is hopelessly wasteful.`));
    const withCache: Frame[] = [1, 2, 3, 6].map(n => scene(n, true, n, n === 1 ? 'With a KV cache: compute K and V for each token once, and store them.' : n < 6 ? `Step ${n}: only the new token's K and V are computed (yellow); the rest are read from memory.` : 'After 6 tokens: 6 computations instead of 21. The price is memory: 2 × layers × tokens × d_model × bytes. For 32 layers, d_model 4,096, 4,096 tokens in bf16 that is about 2.1 GB per sequence.'));
    return {
        title: 'The KV cache: remember keys and values instead of recomputing them',
        variants: [
            { label: 'Without a cache', frames: without },
            { label: 'With a cache', frames: withCache },
        ],
    };
};

// ============ f4-t9 · Scaling laws ============

const scalingLaws = (): AnimationSpec => {
    // Illustration of a power law: loss falls as a straight line on log-log axes.
    const a = axes(50, 20, 320, 168, 18, 24, 1.8, 4.2);
    const L = (logC: number) => 1.7 + 2.3 * 10 ** (-(logC - 18) * 0.16);
    const models: [string, number][] = [['small', 18.6], ['medium', 20], ['large', 21.4], ['huge', 22.8]];
    const draw = (upTo: number, line_: boolean, caption: string) => frame(caption, [
        axisLines('ax', a, '', 'loss'),
        text('xl', a.x + a.w / 2, a.y + a.h + 30, 'compute used for training (log scale)', { size: 11, fill: C.grey }),
        [18, 20, 22, 24].map(v => text(`xt${v}`, px(a, v), a.y + a.h + 14, `10^${v}`, { size: 10, fill: C.dim })),
        line_ && fnPath('law', a, L, { stroke: C.green, sw: 2.5, dash: '6 4' }),
        models.slice(0, upTo).map(([name, c], i) => [dot(`m${i}`, ...pt(a, c, L(c)), C.amber, 7), text(`ml${i}`, px(a, c) + 10, py(a, L(c)) - 12, name, { size: 11, fill: C.amber, anchor: 'start' })]),
    ]);
    const frames: Frame[] = [
        draw(1, false, 'Illustration. Train a small model and record its final loss and the compute it used.'),
        draw(3, false, 'Train bigger models on more data with more compute. Each one reaches a lower loss.'),
        draw(4, true, 'On log scales the points fall on a smooth curve (a power law). You can fit it on small runs and predict the loss of a run 100 times bigger before paying for it.'),
        draw(4, true, 'Chinchilla\'s finding: for a fixed compute budget, grow parameters and training tokens together — about 20 tokens per parameter. A 1B model "wants" about 20B tokens. Many modern models train far longer, because smaller models are cheaper to serve.'),
    ];
    return {
        title: 'Scaling laws: bigger models, more data, predictably lower loss',
        variants: [{ label: 'Loss vs compute', frames }],
    };
};

// ============ f4-t12 · Mixture of experts ============

const moe = (): AnimationSpec => {
    const tokens = ['The', 'tax', 'rate', 'rose', 'by', '3%'];
    const nE = 8;
    const rand = seeded(17);
    const choice = tokens.map(() => {
        const a = Math.floor(rand() * nE);
        let b = Math.floor(rand() * nE);
        if (b === a) b = (b + 3) % nE;
        return [a, b];
    });
    const ex = (e: number) => 26 + e * 46;
    const experts = (active: Set<number>) => Array.from({ length: nE }, (_, e) => {
        const b = box(`e${e}`, ex(e), 150, 40, 40, `E${e + 1}`, C.violet, { size: 11 });
        return active.has(e) ? lit(b, C.violet) : b;
    });
    const tokenRow = (on: number) => tokens.map((t, i) => chips(`t${i}`, 26 + i * 60, 20, [t], i === on ? C.yellow : C.cyan, { size: 11 }));
    const router = box('router', 140, 80, 120, 32, 'router', C.amber, { size: 12 });
    const routeFrame = (i: number, caption: string) => frame(caption, [
        tokenRow(i),
        router,
        arrow('tr', 26 + i * 60 + 20, 48, 200, 78, { stroke: C.yellow, sw: 2 }),
        experts(new Set(choice[i])),
        choice[i].map((e, k) => arrow(`r${k}`, 200, 112, ex(e) + 20, 148, { stroke: C.yellow, sw: 3 - k })),
    ]);
    const counts = Array.from({ length: nE }, (_, e) => choice.filter(c => c.includes(e)).length);
    const frames: Frame[] = [
        frame('A mixture-of-experts layer replaces one big MLP with many expert MLPs (8 here) and a small router.', [tokenRow(-1), router, experts(new Set())]),
        routeFrame(0, `The router scores every expert for the token "The" and keeps the top 2: E${choice[0][0] + 1} and E${choice[0][1] + 1}. Only those two run.`),
        routeFrame(1, `"tax" goes to a different pair: E${choice[1][0] + 1} and E${choice[1][1] + 1}. Each token uses only 2 of 8 experts' worth of compute.`),
        frame(`After all 6 tokens, expert usage is ${counts.join(', ')}. A load-balancing loss keeps this even, so no expert is overloaded or starved. Every expert must still sit in memory, used or not.`, [tokenRow(-1), router, experts(new Set()), Array.from({ length: nE }, (_, e) => text(`c${e}`, ex(e) + 20, 206, `${counts[e]}`, { size: 12, fill: C.amber }))]),
    ];
    return {
        title: 'Mixture of experts: many experts, only a few used per token',
        variants: [{ label: 'Top-2 routing', frames }],
    };
};

// ============ f4-t10 · LoRA ============

const lora = (): AnimationSpec => {
    const n = 10;
    const cell = 12;
    const W = cells('W', 30, 40, n, n, cell, () => '', (r, c) => lerpColor('#26303b', '#3b4a5a', ((r * 7 + c * 13) % 10) / 10), { gap: 1 });
    const B = cells('B', 200, 40, n, 2, cell, () => '', (r, c) => tint(C.amber, 0.4 + ((r + c) % 3) * 0.15), { gap: 1 });
    const A = cells('A', 232, 40, 2, n, cell, () => '', (r, c) => tint(C.green, 0.4 + ((r + c) % 3) * 0.15), { gap: 1 });
    const BA = cells('BA', 30, 40, n, n, cell, () => '', (r, c) => tint(C.amber, 0.15 + ((r * 3 + c * 5) % 7) / 40), { gap: 1 });
    const lock = label('lock', 95, 190, '🔒 W frozen', C.grey, { anchor: 'middle', size: 12, mono: false });
    const frames: Frame[] = [
        frame('A pretrained weight matrix W. In a real model it might be 4,096 × 4,096: 16.8 million numbers. Full fine-tuning would update every one.', [W, label('wl', 95, 26, 'W', C.ink, { anchor: 'middle', size: 13 })]),
        frame('LoRA freezes W. Instead it adds two thin matrices: B (tall, r columns) and A (wide, r rows), with a small rank r such as 8.', [W, lock, label('wl', 95, 26, 'W', C.ink, { anchor: 'middle', size: 13 }), B, A, label('bl', 212, 26, 'B', C.amber, { anchor: 'middle', size: 13 }), label('al', 297, 26, 'A', C.green, { anchor: 'middle', size: 13 })]),
        frame('B × A is a full-size matrix, but it is built from far fewer numbers: for 4,096 × 4,096 and r = 8, only 65,536 trainable weights, about 0.4%.', [W, lock, B, A, label('bl', 212, 26, 'B', C.amber, { anchor: 'middle', size: 13 }), label('al', 297, 26, 'A', C.green, { anchor: 'middle', size: 13 }), label('cnt', 232, 120, 'trainable:\n2 × 4,096 × 8 = 65,536', C.yellow, { size: 12 })]),
        frame('The layer uses W + B·A. B starts at zero, so training begins from exactly the pretrained model. Afterwards the small adapter can be saved, swapped or merged into W.', [BA, lock, label('wl', 95, 26, 'W + B·A', C.amber, { anchor: 'middle', size: 13 }), B, A]),
    ];
    return {
        title: 'LoRA: freeze the big matrix, train a tiny low-rank update',
        variants: [{ label: 'W + B·A', frames }],
    };
};

// ============ f4-t11 · Instruction and preference tuning ============

const alignment = (): AnimationSpec => {
    const stages: [string, string, string][] = [
        ['pre', 'Pretrained\nmodel', C.grey],
        ['sft', 'Instruction\ntuning (SFT)', C.cyan],
        ['pref', 'Preference\npairs', C.amber],
        ['rlhf', 'RLHF: reward\nmodel + PPO', C.pink],
        ['dpo', 'DPO: learn\nfrom pairs', C.green],
    ];
    const pos: Record<string, [number, number]> = { pre: [10, 40], sft: [10, 120], pref: [150, 120], rlhf: [290, 80], dpo: [290, 160] };
    const draw = (on: string[], caption: string, extra: Part[] = []) => frame(caption, [
        stages.filter(([id]) => on.includes(id)).map(([id, name, color]) => box(`s-${id}`, pos[id][0], pos[id][1], 100, 50, name, color, { size: 11 })),
        on.includes('sft') && arrow('a1', 60, 92, 60, 118, { stroke: C.grey }),
        on.includes('pref') && arrow('a2', 112, 145, 148, 145, { stroke: C.grey }),
        on.includes('rlhf') && arrow('a3', 252, 135, 288, 108, { stroke: C.pink }),
        on.includes('dpo') && arrow('a4', 252, 155, 288, 182, { stroke: C.green }),
        extra,
    ]);
    const pair = (y: number) => [
        rect('chosen', 150, y, 120, 26, { rx: 6, fill: tint(C.green, 0.35), stroke: C.green, sw: 1.5, text: '✓ clear, correct', size: 11 }),
        rect('rejected', 150, y + 32, 120, 26, { rx: 6, fill: tint(C.red, 0.3), stroke: C.red, sw: 1.5, text: '✗ rambling', size: 11 }),
    ];
    return {
        title: 'From text predictor to helpful assistant',
        variants: [{
            label: 'The pipeline',
            frames: [
                draw(['pre'], 'A pretrained model only continues text. Ask it a question and it might write five more questions.'),
                draw(['pre', 'sft'], 'Instruction tuning (supervised fine-tuning): train on thousands of example conversations, so it learns to answer helpfully in a chat format.'),
                draw(['pre', 'sft', 'pref'], 'Collect preference data: for one prompt, two answers, and a person (or model) marks which is better.', [pair(170)]),
                draw(['pre', 'sft', 'pref', 'rlhf'], 'RLHF: train a reward model to score answers like the human did, then use reinforcement learning (PPO) to make the model produce high-scoring answers, without drifting too far from the original.', [pair(170)]),
                draw(['pre', 'sft', 'pref', 'rlhf', 'dpo'], 'DPO skips the reward model: it adjusts the model directly so the chosen answer becomes more likely than the rejected one. Simpler, and now very common.', [pair(170)]),
            ],
        }],
    };
};

// ============ f4-t14 · Reasoning and test-time compute ============

const reasoning = (): AnimationSpec => {
    const q = 'A shop sells pens at 3 for £2. How much do 12 pens cost?';
    const scene = (steps: string[], answer: string | null, ok: boolean | null, caption: string) => frame(caption, [
        label('q', 16, 22, q, C.ink, { size: 11, mono: false }),
        steps.map((s, i) => rect(`st${i}`, 16, 44 + i * 30, 368, 24, { rx: 6, fill: tint(C.violet, 0.25), stroke: C.violet, sw: 1, text: s, size: 11 })),
        answer ? rect('ans', 16, 44 + steps.length * 30 + 6, 200, 28, { rx: 6, fill: tint(ok ? C.green : C.red, 0.4), stroke: ok ? C.green : C.red, sw: 2, text: answer, size: 12 }) : null,
    ]);
    const cot: Frame[] = [
        scene([], 'Answer: £6 ✗', false, 'Asked to answer at once, a model may pattern-match ("3 … 2 … 12") and blurt out a wrong number.'),
        scene(['12 pens is 12 ÷ 3 = 4 groups of 3 pens.'], null, null, 'A reasoning model first writes out intermediate steps: a chain of thought. Each step is a smaller, easier prediction.'),
        scene(['12 pens is 12 ÷ 3 = 4 groups of 3 pens.', 'Each group costs £2, so 4 × £2 = £8.'], 'Answer: £8 ✓', true, 'With the steps written down, the final answer follows from them. Spending more tokens on thinking is spending more test-time compute.'),
    ];
    const samples = ['£8', '£8', '£6', '£8', '£8', '£12', '£8', '£6', '£8', '£8'];
    const colorFor = (s: string) => (s === '£8' ? C.green : s === '£6' ? C.red : C.amber);
    const tally = (n: number) => {
        const c = new Map<string, number>();
        samples.slice(0, n).forEach(s => c.set(s, (c.get(s) ?? 0) + 1));
        return [...c.entries()].sort((x, y) => y[1] - x[1]);
    };
    const vote = (n: number, caption: string) => frame(caption, [
        label('q', 16, 22, q, C.ink, { size: 11, mono: false }),
        samples.slice(0, n).map((s, i) => rect(`sm${i}`, 16 + (i % 5) * 76, 50 + Math.floor(i / 5) * 40, 68, 30, { rx: 6, fill: tint(colorFor(s), 0.35), stroke: colorFor(s), sw: 1.5, text: s, size: 12 })),
        tally(n).map(([s, k], i) => label(`t${s}`, 30, 150 + i * 22, `${s}: ${'■'.repeat(k)} ${k}`, colorFor(s), { size: 12 })),
    ]);
    const sc: Frame[] = [
        vote(1, 'Self-consistency: sample a full chain of thought several times with some randomness (temperature above 0).'),
        vote(5, 'Different paths sometimes reach different answers. Individual samples can be wrong.'),
        vote(10, `After 10 samples, take a majority vote: ${tally(10)[0][0]} wins with ${tally(10)[0][1]} of 10. Correct reasoning paths tend to agree; wrong ones scatter. The cost is 10 times the tokens.`),
    ];
    return {
        title: 'Thinking longer: chains of thought and majority votes',
        variants: [
            { label: 'Chain of thought', frames: cot },
            { label: 'Self-consistency', frames: sc },
        ],
    };
};

export const phase4Animations: Record<string, () => AnimationSpec> = {
    'f4-t1': bpe,
    'f4-t2': positions,
    'f4-t3': attention,
    'f4-t4': multiHead,
    'f4-t5': gpt,
    'f4-t6': encoderDecoder,
    'f4-t13': vitClip,
    'f4-t7': sampling,
    'f4-t8': kvCache,
    'f4-t9': scalingLaws,
    'f4-t12': moe,
    'f4-t10': lora,
    'f4-t11': alignment,
    'f4-t14': reasoning,
};

