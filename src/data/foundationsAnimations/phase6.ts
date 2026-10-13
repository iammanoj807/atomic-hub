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
    chips,
    circle,
    frame,
    gaussian,
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

// Phase 6 · Systems and scale. Byte counts, softened probabilities and the
// like are computed here; hardware speeds are round, illustrative numbers and
// are labelled as such.

// ============ f6-t1 · How a GPU works ============

const gpu = (): AnimationSpec => {
    const cores = (busy: number) => cells('core', 220, 40, 6, 8, 18, () => '', (r, c) => ((r * 8 + c) / 48 < busy ? C.green : '#253040'), { gap: 3 });
    const kitchen = (busy: number, packets: number, caption: string, op: string) => frame(caption, [
        box('hbm', 14, 60, 110, 110, 'GPU memory\n(HBM)\nlarge, slower', C.blue, { size: 11 }),
        rect('bus', 124, 104, 90, 22, { fill: tint(C.amber, 0.25), stroke: C.amber, sw: 1.5 }),
        Array.from({ length: packets }, (_, i) => rect(`pk${i}`, 130 + i * 16, 109, 10, 12, { rx: 2, fill: C.amber })),
        label('bw', 169, 142, 'bandwidth', C.amber, { anchor: 'middle', size: 10, mono: false }),
        cores(busy),
        label('cl', 299, 30, 'thousands of cores', C.green, { anchor: 'middle', size: 10, mono: false }),
        label('op', 200, 210, op, C.ink, { anchor: 'middle', size: 12 }),
    ]);
    const roofline = axes(56, 20, 320, 170, 0, 4, 0, 3);
    // Illustrative GPU: 1 TB/s memory bandwidth, 100 TFLOP/s peak, so the ridge is at 100 FLOPs per byte.
    const perf = (logI: number) => Math.min(logI + 0, 2) + 1; // log10 of TFLOP/s-ish: slope then flat
    const ops: [string, number, string][] = [['vector add', 0.9, C.red], ['softmax', 1.3, C.amber], ['big matmul', 3.2, C.green]];
    const roof = (shown: number, caption: string) => frame(caption, [
        axisLines('ax', roofline, '', 'speed (FLOP/s)'),
        text('xl', roofline.x + roofline.w / 2, roofline.y + roofline.h + 14, 'arithmetic intensity: FLOPs per byte moved (log)', { size: 10.5, fill: C.grey }),
        path('roof', [0, 1, 2, 3, 4].map(v => pt(roofline, v, perf(v))), { stroke: C.cyan, sw: 3 }),
        label('mem', px(roofline, 0.6), py(roofline, 2.3), 'memory-bound', C.cyan, { size: 11, mono: false }),
        label('cmp', px(roofline, 2.05), py(roofline, 3) + 16, 'compute-bound', C.cyan, { size: 11, mono: false }),
        ops.slice(0, shown).map(([name, x, color], i) => [circle(`o${i}`, ...pt(roofline, x, perf(x)), 6, { fill: color }), label(`ol${i}`, px(roofline, x) + (x > 3 ? -8 : 8), py(roofline, perf(x)) + (x > 3 ? 34 : 14), name, color, { size: 11, mono: false, anchor: x > 3 ? 'end' : 'start' })]),
    ]);
    return {
        title: 'Thousands of fast cores, one narrow road to memory',
        variants: [
            {
                label: 'The narrow door',
                frames: [
                    kitchen(0, 0, 'A GPU has thousands of simple cores that do the same operation on lots of numbers at once. The numbers live in GPU memory and must travel to the cores.', ''),
                    kitchen(0.15, 4, 'Adding two vectors: load 2 numbers, do 1 addition, store 1. The cores finish instantly and then wait for the next numbers. Most of the GPU sits idle: memory-bound.', 'c = a + b'),
                    kitchen(1, 2, 'A big matrix multiply reuses every number loaded many times, so the cores stay busy while data trickles in: compute-bound. This is what GPUs are built for.', 'C = A @ B'),
                ],
            },
            {
                label: 'Roofline',
                frames: [
                    roof(0, 'Illustration: a roofline. Low arithmetic intensity (few FLOPs per byte) is limited by memory bandwidth, so speed rises with intensity…'),
                    roof(1, '…until the flat roof: past the ridge point, the GPU\'s maths is the limit. Vector add sits far down the slope.'),
                    roof(3, 'Softmax is still memory-bound; a big matmul reaches the compute roof. Speed-ups come from moving fewer bytes (fusion, lower precision) or doing more maths per byte.'),
                ],
            },
        ],
    };
};

// ============ f6-t2 · Mixed precision ============

const precision = (): AnimationSpec => {
    const layout = (id: string, y: number, name: string, exp: number, man: number, on: boolean) => {
        const total = 1 + exp + man;
        const w = 10;
        return [
            text(`${id}n`, 14, y + 8, name, { size: 12, fill: on ? C.ink : C.dim, anchor: 'start', weight: 700 }),
            Array.from({ length: total }, (_, i) => rect(`${id}b${i}`, 60 + i * w, y, w - 1.5, 16, {
                rx: 1.5,
                fill: !on ? '#1c232c' : i === 0 ? C.pink : i <= exp ? C.amber : C.cyan,
            })),
        ];
    };
    const key = [
        rect('k1', 60, 196, 12, 12, { rx: 2, fill: C.pink }), text('k1t', 76, 202, 'sign', { size: 11, fill: C.grey, anchor: 'start' }),
        rect('k2', 120, 196, 12, 12, { rx: 2, fill: C.amber }), text('k2t', 136, 202, 'exponent = range', { size: 11, fill: C.grey, anchor: 'start' }),
        rect('k3', 250, 196, 12, 12, { rx: 2, fill: C.cyan }), text('k3t', 266, 202, 'mantissa = precision', { size: 11, fill: C.grey, anchor: 'start' }),
    ];
    const all = (on: [boolean, boolean, boolean]) => [layout('f32', 40, 'fp32', 8, 23, on[0]), layout('f16', 90, 'fp16', 5, 10, on[1]), layout('b16', 140, 'bf16', 8, 7, on[2]), key];
    return {
        title: 'fp32, fp16 and bf16: the same number in fewer bits',
        variants: [{
            label: 'Bit layouts',
            frames: [
                frame('fp32 uses 32 bits: 1 sign bit, 8 exponent bits (how big or small the number can be) and 23 mantissa bits (how many significant digits).', [all([true, false, false])]),
                frame('fp16 halves the memory: 5 exponent bits, 10 mantissa bits. Good precision, but its largest value is only about 65,504, so big gradients overflow to inf and tiny ones underflow to 0.', [all([true, true, false])]),
                frame('bf16 keeps fp32\'s 8 exponent bits (range up to about 3.4 × 10³⁸) and keeps only 7 mantissa bits. Overflow is rare; the cost is coarse precision: in bf16, 1 + 0.001 rounds back to 1.', [all([true, true, true])]),
                frame('Mixed precision does the heavy matrix maths in 16-bit (half the memory traffic, much faster on tensor cores) but keeps a 32-bit master copy of the weights and does the optimiser update in fp32, so small updates aren\'t rounded away. bf16 is the usual choice today.', [all([true, true, true])]),
            ],
        }],
    };
};

// ============ f6-t3 · Training memory ============

const trainingMemory = (): AnimationSpec => {
    const parts: [string, number, string][] = [
        ['weights (bf16)', 2, C.cyan], ['gradients (bf16)', 2, C.violet], ['master weights (fp32)', 4, C.blue], ['Adam m (fp32)', 4, C.amber], ['Adam v (fp32)', 4, C.orange],
    ];
    const unit = 9;
    const stack = (n: number, act: boolean) => {
        let y = 210;
        const segs = parts.slice(0, n).map(([name, bytes, color], i) => {
            const h = bytes * unit;
            y -= h;
            return [rect(`s${i}`, 60, y, 90, h, { fill: tint(color, 0.7), stroke: C.bg, sw: 1, text: `${bytes} B`, size: 11 }), label(`sl${i}`, 160, y + h / 2, name, color, { size: 11, mono: false })];
        });
        const top = y;
        return [
            segs,
            act && [rect('act', 60, top - 40, 90, 40, { fill: tint(C.pink, 0.4), stroke: C.pink, sw: 1.5, dash: '4 3', text: '+ activations', size: 10 }), label('actl', 160, top - 20, 'grows with batch × sequence length', C.pink, { size: 11, mono: false })],
            line('base', 50, 210, 160, 210, { stroke: C.dim }),
        ];
    };
    const total = (n: number) => parts.slice(0, n).reduce((s, p) => s + p[1], 0);
    return {
        title: 'Where training memory goes: about 16 bytes per parameter',
        variants: [{
            label: 'Per parameter',
            frames: [
                frame('Inference only needs the weights: 2 bytes per parameter in bf16. A 1-billion-parameter model needs about 2 GB.', [stack(1, false), panel([[`${total(1)} bytes / param`, C.cyan], ['1B params → 2 GB', C.ink]], 250, 20, 140)]),
                frame('Training also stores a gradient for every weight: 2 more bytes.', [stack(2, false), panel([[`${total(2)} bytes / param`, C.violet]], 250, 20, 140)]),
                frame('Mixed precision keeps an fp32 master copy of the weights, so tiny updates aren\'t rounded away: 4 more.', [stack(3, false), panel([[`${total(3)} bytes / param`, C.blue]], 250, 20, 140)]),
                frame('Adam keeps two running averages per weight, each in fp32: 8 more. Total about 16 bytes per parameter, so 1B parameters need about 16 GB before activations.', [stack(5, false), panel([[`${total(5)} bytes / param`, C.amber], ['1B params → 16 GB', C.ink]], 250, 20, 140)]),
                frame('On top come the activations saved for backprop, which grow with batch size and sequence length. Gradient checkpointing, smaller batches with gradient accumulation, and sharding (ZeRO/FSDP) are the usual fixes.', [stack(5, true), panel([[`${total(5)} B + activations`, C.pink]], 250, 208, 140)]),
            ],
        }],
    };
};

// ============ f6-t4 · Parallelism ============

const parallelism = (): AnimationSpec => {
    const gpus = (n: number, x0: number) => Array.from({ length: n }, (_, i) => rect(`g${i}`, x0 + i * 92, 50, 84, 120, { rx: 10, fill: '#11161d', stroke: C.faint, sw: 1.5 }));
    const gl = (n: number, x0: number) => Array.from({ length: n }, (_, i) => text(`gl${i}`, x0 + i * 92 + 42, 40, `GPU ${i}`, { size: 11, fill: C.grey }));
    const model = (i: number, x: number, color: string, name = 'full model') => box(`m${i}`, x + 8, 64, 68, 50, name, color, { size: 10 });
    const data = (i: number, x: number) => chips(`d${i}`, x + 14, 128, [`batch ${i + 1}`], C.amber, { size: 10 });
    const dp = (stage: number) => [
        gl(4, 18), gpus(4, 18),
        Array.from({ length: 4 }, (_, i) => [model(i, 18 + i * 92, C.cyan), stage >= 1 && data(i, 18 + i * 92)]),
        stage >= 2 && [rect('ar', 18, 182, 360, 26, { rx: 8, fill: tint(C.green, 0.3), stroke: C.green, sw: 1.5, text: 'all-reduce: average the 4 gradients', size: 11 }), Array.from({ length: 4 }, (_, i) => line(`ar${i}`, 60 + i * 92, 170, 60 + i * 92, 182, { stroke: C.green, sw: 2 }))],
    ];
    const tp = (stage: number) => [
        gl(2, 70), gpus(2, 70),
        box('wl', 78, 64, 68, 90, 'W\nleft\nhalf', C.violet, { size: 11 }),
        box('wr', 170, 64, 68, 90, 'W\nright\nhalf', C.violet, { size: 11 }),
        stage >= 1 && [chips('x0', 92, 128 + 30, ['x'], C.amber, { size: 10 }), chips('x1', 184, 128 + 30, ['x'], C.amber, { size: 10 })],
        stage >= 2 && rect('cat', 70, 182, 176, 26, { rx: 8, fill: tint(C.green, 0.3), stroke: C.green, sw: 1.5, text: 'join the two half-outputs', size: 11 }),
    ];
    const pipelineStage = (k: number) => {
        const out: Part[] = [gl(4, 18), gpus(4, 18), Array.from({ length: 4 }, (_, i) => box(`L${i}`, 26 + i * 92, 64, 68, 40, `layers\n${i * 6 + 1}–${i * 6 + 6}`, C.pink, { size: 10 }))];
        // Micro-batches move one GPU to the right each tick.
        const mbs = [0, 1, 2, 3].map(m => k - m).filter(p => p >= 0 && p < 4);
        out.push(mbs.map(p => chips(`mb${k - p}`, 34 + p * 92, 120, [`mb ${k - p + 1}`], C.amber, { size: 10, ids: [`mb${k - p}`] })));
        return out;
    };
    return {
        title: 'Splitting training across GPUs three ways',
        variants: [
            {
                label: 'Data parallel',
                frames: [
                    frame('Data parallel: every GPU holds a full copy of the model.', [dp(0)]),
                    frame('Each GPU gets a different slice of the batch and computes its own gradients.', [dp(1)]),
                    frame('An all-reduce averages the gradients across GPUs, so every copy takes the same update and stays identical. Simple and fast, as long as the model fits on one GPU. FSDP/ZeRO go further and shard the weights, gradients and optimiser states.', [dp(2)]),
                ],
            },
            {
                label: 'Tensor parallel',
                frames: [
                    frame('Tensor parallel: one layer\'s weight matrix is split across GPUs, here into a left and a right half.', [tp(0)]),
                    frame('Each GPU multiplies the same input by its half of the matrix.', [tp(1)]),
                    frame('The half-results are joined. This needs very fast links between GPUs, because they must talk inside every layer, so it is used within one machine.', [tp(2)]),
                ],
            },
            {
                label: 'Pipeline parallel',
                frames: [
                    frame('Pipeline parallel: different layers live on different GPUs, like stations on an assembly line. Micro-batch 1 enters GPU 0.', [pipelineStage(0)]),
                    frame('It moves to GPU 1, and micro-batch 2 enters GPU 0. Splitting the batch into micro-batches keeps more stations busy.', [pipelineStage(1)]),
                    frame('Now 3 GPUs are busy at once.', [pipelineStage(2)]),
                    frame('Full pipeline: all 4 stations work at the same time. At the start and end some stations sit idle (the "bubble"), which is the cost of this method.', [pipelineStage(3)]),
                ],
            },
        ],
    };
};

// ============ f6-t5 · Inference speed: quantisation and FlashAttention ============

const inferenceSpeed = (): AnimationSpec => {
    const rand = seeded(6);
    const ws = Array.from({ length: 24 }, () => gaussian(rand) * 0.6);
    const a = axes(30, 40, 340, 110, -0.5, 23.5, -1.6, 1.6);
    const levels = 7; // 3-bit-style grid for the picture
    const maxAbs = Math.max(...ws.map(Math.abs));
    const q = (w: number) => Math.round((w / maxAbs) * ((levels - 1) / 2)) / ((levels - 1) / 2) * maxAbs;
    const plot = (vals: number[], color: string, grid: boolean) => [
        line('zero', a.x, py(a, 0), a.x + a.w, py(a, 0), { stroke: C.dim }),
        grid && Array.from({ length: levels }, (_, i) => {
            const v = (i - (levels - 1) / 2) / ((levels - 1) / 2) * maxAbs;
            return line(`lv${i}`, a.x, py(a, v), a.x + a.w, py(a, v), { stroke: C.faint, sw: 1, dash: '3 3' });
        }),
        vals.map((v, i) => circle(`w${i}`, px(a, i), py(a, v), 4.5, { fill: color })),
    ];
    const mem = (shown: number) => {
        const b = axes(60, 168, 300, 50, -0.5, 2.5, 0, 140);
        return [bars('mb', b, [140, 70, 35].map((v, i) => (i < shown ? v : 0)), [C.cyan, C.amber, C.green], ['bf16', 'int8', '4-bit']), [140, 70, 35].slice(0, shown).map((v, i) => text(`mv${i}`, px(b, i) + 40, py(b, v), `${v} GB`, { size: 11, fill: C.ink, anchor: 'start' }))];
    };
    const quant: Frame[] = [
        frame('Some weights of a layer (dots). In bf16 each takes 2 bytes and can be almost any value.', [plot(ws, C.cyan, false)]),
        frame('Quantisation keeps only a few allowed levels (dashed lines), spread across the range of the weights, plus one scale factor.', [plot(ws, C.cyan, true)]),
        frame('Each weight snaps to its nearest level and is stored as a small integer. Most move only a little, so outputs barely change.', [plot(ws.map(q), C.amber, true)]),
        frame('The payoff for a 70-billion-parameter model: about 140 GB in bf16, 70 GB in int8, 35 GB in 4-bit. Less memory and less data to move per token, so faster generation. Always measure quality: at 4 bits and below it can drop.', [plot(ws.map(q), C.amber, true), mem(3)]),
    ];
    const T = 8;
    const tile = 4;
    const grid = (doneTiles: number, inSram: number | null) => cells('att', 30, 30, T, T, 20, () => '', (r, c) => {
        const t = Math.floor(r / tile) * 2 + Math.floor(c / tile);
        if (inSram === t) return tint(C.green, 0.85);
        return t < doneTiles ? tint(C.green, 0.3) : '#1c232c';
    }, { gap: 2 });
    const sram = (on: boolean) => [box('sram', 240, 40, 140, 60, 'on-chip SRAM\nsmall, very fast', C.green, on ? { fill: tint(C.green, 0.5) } : {}), box('hbm', 240, 140, 140, 60, 'GPU memory (HBM)\nlarge, slower', C.blue, { size: 11 })];
    const flash: Frame[] = [
        frame('Standard attention writes the whole T × T score matrix out to GPU memory, then reads it back for the softmax and again for multiplying by V. For long sequences that is a huge amount of traffic.', [grid(0, null), sram(false), label('n', 30, 210, 'full T × T matrix, written to HBM', C.red, { size: 11, mono: false })]),
        frame('FlashAttention works one tile at a time: load a block of queries, keys and values into the small fast on-chip memory…', [grid(0, 0), sram(true)]),
        frame('…compute that block\'s scores, softmax and output there, keeping running totals for the softmax, and move on.', [grid(1, 1), sram(true)]),
        frame('The full T × T matrix is never written to slow memory. Same exact result, far fewer bytes moved, and memory grows linearly with sequence length instead of quadratically.', [grid(4, null), sram(false), label('n', 30, 210, 'never stored in full', C.green, { size: 11, mono: false })]),
    ];
    return {
        title: 'Faster inference: fewer bits, fewer trips to memory',
        variants: [
            { label: 'Quantisation', frames: quant },
            { label: 'FlashAttention', frames: flash },
        ],
    };
};

// ============ f6-t6 · Profiling ============

const profiling = (): AnimationSpec => {
    const row = (y: number, nameText: string, spans: [number, number, string, string][], ids: string) => [
        text(`${ids}n`, 14, y + 10, nameText, { size: 11, fill: C.grey, anchor: 'start' }),
        spans.map(([s, e, color, t], i) => rect(`${ids}${i}`, 60 + s * 3.2, y, Math.max(2, (e - s) * 3.2), 20, { rx: 3, fill: tint(color, 0.75), text: (e - s) * 3.2 > 40 ? t : '', size: 9 })),
    ];
    const slow = {
        cpu: [[0, 40, C.amber, 'load batch'], [42, 50, C.grey, 'py'], [52, 92, C.amber, 'load batch']] as [number, number, string, string][],
        gpu: [[40, 52, C.green, 'fwd+bwd'], [92, 104, C.green, 'fwd+bwd']] as [number, number, string, string][],
    };
    const fast = {
        cpu: [[0, 10, C.amber, 'load'], [10, 20, C.amber, 'load'], [20, 30, C.amber, 'load'], [30, 40, C.amber, 'load']] as [number, number, string, string][],
        gpu: [[10, 22, C.green, 'fwd+bwd'], [22, 34, C.green, 'fwd+bwd'], [34, 46, C.green, 'fwd+bwd'], [46, 58, C.green, 'fwd+bwd']] as [number, number, string, string][],
    };
    const view = (d: typeof slow, caption: string, note: string, color: string, gaps: boolean) => frame(caption, [
        row(60, 'CPU', d.cpu, 'c'), row(100, 'GPU', d.gpu, 'g'),
        gaps && [rect('gap1', 60, 96, 40 * 3.2, 28, { fill: 'none', stroke: C.red, sw: 2, dash: '4 3' }), rect('gap2', 60 + 52 * 3.2, 96, 40 * 3.2, 28, { fill: 'none', stroke: C.red, sw: 2, dash: '4 3' })],
        label('note', 14, 160, note, color, { size: 12, mono: false }),
        line('axis', 60, 136, 380, 136, { stroke: C.faint }),
        text('tl', 380, 148, 'time →', { size: 10, fill: C.dim, anchor: 'end' }),
    ]);
    return {
        title: 'Profiling: find where the time really goes',
        variants: [{
            label: 'A data-loading bottleneck',
            frames: [
                view(slow, 'A profiler trace of training steps: what the CPU and the GPU are doing over time.', 'two training steps', C.ink, false),
                view(slow, 'The GPU (green) is busy only in short bursts. Most of the time it waits while the CPU loads and prepares the next batch. Buying a faster GPU would change nothing.', 'GPU idle most of the time (red boxes)', C.red, true),
                view(fast, 'Fix the real bottleneck: more DataLoader workers and pinned memory prepare batches in parallel, ahead of time. Now the GPU runs back to back, and 4 steps take less time than 2 did before.', 'GPU busy back to back', C.green, false),
            ],
        }],
    };
};

// ============ f6-t7 · Triton and kernel fusion ============

const fusion = (): AnimationSpec => {
    const hbm = box('hbm', 20, 60, 120, 110, 'GPU memory\n(HBM)\nslow', C.blue, { size: 11 });
    const sram = box('sram', 260, 60, 120, 110, 'on-chip\n(registers, SRAM)\nfast', C.green, { size: 11 });
    const trip = (i: number, dir: 'in' | 'out', note: string, color: string) => [
        dir === 'in' ? arrow(`t${i}`, 142, 72 + i * 20, 258, 72 + i * 20, { stroke: color, sw: 2.5 }) : arrow(`t${i}`, 258, 72 + i * 20, 142, 72 + i * 20, { stroke: color, sw: 2.5 }),
        label(`tn${i}`, 200, 66 + i * 20, note, color, { anchor: 'middle', size: 9.5, mono: false }),
    ];
    const counter = (reads: number, writes: number, color: string) => panel([[`reads of x: ${reads}`, color], [`writes: ${writes}`, color]], 120, 190, 160);
    const frames: Frame[] = [
        frame('Softmax over a row: find the max, exponentiate and sum, then divide. Each step written as a separate operation is a separate kernel.', [hbm, sram, counter(0, 0, C.grey)]),
        frame('Naive version: kernel 1 reads the row from slow memory to find the max.', [hbm, sram, trip(0, 'in', 'read x → max', C.red), counter(1, 0, C.red)]),
        frame('Kernel 2 reads it again to compute exp(x − max) and the sum, and writes the exponentials back.', [hbm, sram, trip(0, 'in', 'read x → max', C.red), trip(1, 'in', 'read x → exp, sum', C.red), trip(2, 'out', 'write exp', C.red), counter(2, 1, C.red)]),
        frame('Kernel 3 reads the exponentials once more and writes the result. Many trips through the narrow road to memory; the maths itself is cheap.', [hbm, sram, trip(0, 'in', 'read x → max', C.red), trip(1, 'in', 'read x → exp, sum', C.red), trip(2, 'out', 'write exp', C.red), trip(3, 'in', 'read exp → divide', C.red), trip(4, 'out', 'write result', C.red), counter(3, 2, C.red)]),
        frame('A fused kernel, written in Triton, loads each row once into fast on-chip memory, does all three steps there, and writes the result once. Same answer, far less memory traffic, so a memory-bound operation runs several times faster.', [hbm, sram, trip(1, 'in', 'read x once', C.green), trip(3, 'out', 'write result once', C.green), counter(1, 1, C.green)]),
    ];
    return {
        title: 'Kernel fusion: one trip to memory instead of many',
        variants: [{ label: 'Fused softmax', frames }],
    };
};

// ============ f6-t8 · Pruning and distillation ============

const pruningDistillation = (): AnimationSpec => {
    const n = 8;
    const rand = seeded(12);
    const W = Array.from({ length: n }, () => Array.from({ length: n }, () => gaussian(rand)));
    const mags = W.flat().map(Math.abs).sort((x, y) => x - y);
    const cut = (share: number) => mags[Math.floor(share * mags.length)];
    const grid = (keep: (r: number, c: number) => boolean) => cells('w', 40, 30, n, n, 20, () => '', (r, c) => (keep(r, c) ? lerpColor('#1b1f27', W[r][c] > 0 ? C.cyan : C.pink, Math.min(1, Math.abs(W[r][c]) / 1.8)) : '#0d1117'), { gap: 2 });
    const rowNorm = W.map(r => Math.sqrt(r.reduce((s, v) => s + v * v, 0)));
    const weakRows = rowNorm.map((v, i) => ({ v, i })).sort((x, y) => x.v - y.v).slice(0, 3).map(x => x.i);
    const prune: Frame[] = [
        frame('A layer\'s weights, coloured by size (brighter = bigger magnitude).', [grid(() => true)]),
        frame('Magnitude pruning: set the smallest 50% of weights to zero (black). Accuracy often barely changes, especially after a little retraining.', [grid((r, c) => Math.abs(W[r][c]) >= cut(0.5)), label('p', 230, 100, '50% pruned', C.ink, { size: 13 })]),
        frame('Prune 80% and accuracy usually drops more; retraining recovers some. But scattered zeros rarely make the model faster on normal hardware: the matrix is still the same shape.', [grid((r, c) => Math.abs(W[r][c]) >= cut(0.8)), label('p', 230, 100, '80% pruned', C.ink, { size: 13 })]),
        frame('Structured pruning removes whole rows (neurons), channels or heads instead. The matrix really gets smaller, so it really runs faster.', [grid(r => !weakRows.includes(r)), label('p', 230, 100, '3 whole rows\nremoved', C.ink, { size: 13 })]),
    ];
    const teacher = [0.9, 0.07, 0.03];
    const soften = (T: number) => {
        const z = teacher.map(p => Math.log(p) / T);
        const m = Math.max(...z);
        const e = z.map(v => Math.exp(v - m));
        const s = e.reduce((acc, v) => acc + v, 0);
        return e.map(v => v / s);
    };
    const b = axes(40, 40, 160, 140, -0.5, 2.5, 0, 1);
    const b2 = axes(220, 40, 160, 140, -0.5, 2.5, 0, 1);
    const chart = (id: string, ax: typeof b, vals: number[], color: string, title: string) => [
        bars(id, ax, vals, color, ['2', '7', '3'], { showValues: true, digits: 2 }),
        label(`${id}t`, ax.x + ax.w / 2, 26, title, color, { anchor: 'middle', size: 12, mono: false }),
    ];
    const soft3 = soften(3);
    const distil: Frame[] = [
        frame('Distillation trains a small student to copy a big teacher. The usual label for this picture of a "2" is one-hot: 2 = 1, everything else 0.', [chart('hard', b, [1, 0, 0], C.grey, 'hard label')]),
        frame('The teacher\'s output says more: 2 at 0.90, but 7 at 0.07 and 3 at 0.03. It tells the student that this 2 looks a little like a 7. These soft labels carry extra knowledge.', [chart('hard', b, [1, 0, 0], C.grey, 'hard label'), chart('soft', b2, teacher, C.cyan, 'teacher (T = 1)')]),
        frame(`Dividing the teacher's logits by a temperature T = 3 softens them further: ${soft3.map(v => round(v, 2)).join(', ')}. The student is trained to match these (scaled by T²), usually together with the true labels.`, [chart('hard', b, [1, 0, 0], C.grey, 'hard label'), chart('soft', b2, soft3, C.green, 'teacher (T = 3)')]),
    ];
    return {
        title: 'Smaller models: prune what matters little, distil what matters',
        variants: [
            { label: 'Pruning', frames: prune },
            { label: 'Distillation', frames: distil },
        ],
    };
};

// ============ f6-t9 · Speculative decoding ============

const speculative = (): AnimationSpec => {
    const accepted = ['the', 'cat', 'sat'];
    const draftRound = ['the', 'cat', 'sat', 'in'];
    const scene = (stage: number, caption: string) => frame(caption, [
        chips('ctx', 14, 24, ['Once', 'upon', 'a', 'time'], C.grey, { size: 11 }),
        block('draft', 14, 70, 'small draft model', C.violet, stage === 1),
        block('big', 14, 150, 'big target model', C.pink, stage === 2 || stage === 3),
        stage >= 1 && chips('guess', 160, 82, draftRound, draftRound.map((_, i) => (stage >= 2 ? (i < 3 ? C.green : C.red) : C.violet)), { size: 11, ids: draftRound.map((_, i) => `g${i}`) }),
        stage >= 2 && draftRound.map((_, i) => label(`v${i}`, 160 + i * 46 + 18, 122, i < 3 ? '✓' : '✗', i < 3 ? C.green : C.red, { anchor: 'middle', size: 14 })),
        stage >= 3 && chips('out', 160, 162, [...accepted, 'on'], [C.green, C.green, C.green, C.pink], { size: 11 }),
        stage >= 3 && label('n', 160, 206, '4 tokens from 1 pass of the big model', C.yellow, { size: 11, mono: false }),
    ]);
    function block(id: string, x: number, y: number, name: string, color: string, on: boolean) {
        const b = box(id, x, y, 130, 40, name, color, { size: 11 });
        return on ? lit(b, color) : b;
    }
    return {
        title: 'Speculative decoding: a fast drafter, a careful checker',
        variants: [{
            label: 'One round',
            frames: [
                scene(0, 'A big model normally generates one token per slow forward pass.'),
                scene(1, 'A small, fast draft model quickly guesses the next 4 tokens: "the cat sat in".'),
                scene(2, 'The big model checks all 4 guesses in a single pass (it can score every position at once). It agrees with "the cat sat" and disagrees with "in".'),
                scene(3, 'Keep the accepted tokens, and use the big model\'s own choice ("on") at the first disagreement. 4 tokens for one big-model pass instead of 1. The output is exactly what the big model would have produced on its own; the gain depends on how often the draft is right.'),
            ],
        }],
    };
};

export const phase6Animations: Record<string, () => AnimationSpec> = {
    'f6-t1': gpu,
    'f6-t2': precision,
    'f6-t3': trainingMemory,
    'f6-t4': parallelism,
    'f6-t5': inferenceSpeed,
    'f6-t6': profiling,
    'f6-t7': fusion,
    'f6-t8': pruningDistillation,
    'f6-t9': speculative,
};
