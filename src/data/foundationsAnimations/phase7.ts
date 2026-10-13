import type { AnimationSpec, Frame } from '../../components/learning/anim/scene';
import { lerpColor } from '../../components/learning/anim/scene';
import {
    C,
    arrow,
    axes,
    axisLines,
    bars,
    box,
    circle,
    dot,
    fnPath,
    frame,
    gaussian,
    line,
    pt,
    px,
    rect,
    round,
    seeded,
    tint,
} from '../../components/learning/anim/kit';
import { label, panel } from './common';

// Phase 7 · Generative models and reinforcement learning. The grid-world
// values come from running value iteration here; the diffusion picture uses
// the real forward-noising formula on a 2-D spiral.

// ============ f7-t1 · Autoencoders and VAEs ============

const vae = (): AnimationSpec => {
    const a = axes(250, 40, 140, 140, -3, 3, -3, 3);
    const rand = seeded(15);
    const centres: [number, number, string][] = [[-1.6, 1.2, C.cyan], [1.4, 1.5, C.pink], [0.2, -1.6, C.amber], [-1.5, -1.0, C.green], [1.6, -0.6, C.violet]];
    const codes = (spread: number, tidy: boolean) => centres.flatMap(([cx, cy, color], k) => Array.from({ length: 10 }, (_, i) => {
        const sx = tidy ? cx * 0.7 : cx * 1.25 + (k % 2 ? 0.5 : -0.4);
        const sy = tidy ? cy * 0.7 : cy * 1.3;
        return dot(`z${k}-${i}`, ...pt(a, Math.max(-2.9, Math.min(2.9, sx + gaussian(rand) * spread)), Math.max(-2.9, Math.min(2.9, sy + gaussian(rand) * spread))), color, 3);
    }));
    const pipeline = (on: string) => [
        box('x', 10, 90, 44, 44, '✍︎ 3', C.grey, { size: 13 }),
        box('enc', 64, 84, 60, 56, 'encoder', C.blue, on === 'enc' ? { fill: tint(C.blue, 0.55) } : { size: 11 }),
        box('z', 134, 84, 44, 56, on === 'z' ? 'μ, σ\n→ z' : 'z', C.yellow, on === 'z' ? { fill: tint(C.yellow, 0.45), size: 10 } : { size: 12 }),
        box('dec', 188, 84, 52, 56, 'decoder', C.green, on === 'dec' ? { fill: tint(C.green, 0.55) } : { size: 11 }),
        arrow('a1', 54, 112, 62, 112, { stroke: C.grey }), arrow('a2', 124, 112, 132, 112, { stroke: C.grey }), arrow('a3', 178, 112, 186, 112, { stroke: C.grey }),
        label('ls', 320, 28, 'latent space (2-D)', C.grey, { anchor: 'middle', size: 10, mono: false }),
        rect('lsb', a.x, a.y, a.w, a.h, { fill: 'none', stroke: C.faint, sw: 1 }),
    ];
    const frames: Frame[] = [
        frame('An autoencoder squeezes an input (a handwritten digit) through a small code z, then rebuilds it. Training minimises the reconstruction error.', [pipeline('enc'), codes(0.25, false)]),
        frame('A plain autoencoder\'s codes (one colour per digit) can scatter anywhere, with gaps between them. Decode a random point in a gap and you get nonsense, so you can\'t generate new digits.', [pipeline('dec'), codes(0.25, false)]),
        frame('A VAE\'s encoder outputs a mean μ and a spread σ, and z is sampled: z = μ + σ·ε with ε ~ N(0, 1). This "reparameterisation trick" lets gradients flow through the sampling.', [pipeline('z'), codes(0.35, false)]),
        frame('The ELBO adds a KL term that pulls every code towards a standard bell curve N(0, I). The codes become a tidy, gap-free cloud around the centre.', [pipeline('z'), codes(0.45, true), circle('prior', ...pt(a, 0, 0), 64, { fill: 'none', stroke: C.yellow, sw: 1.5, dash: '4 4' })]),
        frame('Now generating is easy: sample any z from N(0, I) and decode it into a new, plausible digit. The price of the noise: VAE samples are often a little blurry.', [pipeline('dec'), codes(0.45, true), circle('prior', ...pt(a, 0, 0), 64, { fill: 'none', stroke: C.yellow, sw: 1.5, dash: '4 4' }), circle('sample', ...pt(a, 0.5, 0.3), 6, { fill: C.yellow, stroke: C.bg, sw: 2 })]),
    ];
    return {
        title: 'Variational autoencoders: a tidy latent space you can sample from',
        variants: [{ label: 'Encoder, code, decoder', frames }],
    };
};

// ============ f7-t2 · Diffusion ============

const diffusion = (): AnimationSpec => {
    const a = axes(60, 20, 280, 200, -2.6, 2.6, -2.6, 2.6);
    const rand = seeded(27);
    const x0 = Array.from({ length: 80 }, (_, i) => {
        const t = 0.5 + (i / 80) * 3.4 * Math.PI;
        const r = 0.18 * t;
        return [r * Math.cos(t), r * Math.sin(t)] as [number, number];
    });
    const eps = x0.map(() => [gaussian(rand), gaussian(rand)] as [number, number]);
    // Real forward process: x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε, for a few values of ᾱ_t.
    const at = (abar: number) => x0.map(([x, y], i) => [Math.sqrt(abar) * x + Math.sqrt(1 - abar) * eps[i][0], Math.sqrt(abar) * y + Math.sqrt(1 - abar) * eps[i][1]] as [number, number]);
    const draw = (abar: number, color: string, caption: string, tag: string) => frame(caption, [
        rect('box', a.x, a.y, a.w, a.h, { fill: 'none', stroke: C.faint, sw: 1 }),
        at(abar).map((p, i) => dot(`p${i}`, ...pt(a, Math.max(-2.55, Math.min(2.55, p[0])), Math.max(-2.55, Math.min(2.55, p[1]))), color, 3.5)),
        panel([[tag, color], [`ᾱ = ${round(abar, 2)}`, C.grey]], 8, 8, 130),
    ]);
    const forward: Frame[] = [
        draw(1, C.cyan, 'Training data: 80 points on a spiral (think of each point as one whole image).', 'clean data x₀'),
        draw(0.97, C.cyan, 'The forward process mixes in Gaussian noise: x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε. A little noise first…', 'a little noise'),
        draw(0.6, C.amber, '…then more. The shape blurs.', 'more noise'),
        draw(0.02, C.red, 'At the end it is almost pure noise. Training: pick a random noise level, add noise, and teach a network to predict the noise ε that was added. The loss is plain squared error.', 'almost pure noise'),
    ];
    const reverse: Frame[] = [
        draw(0.02, C.red, 'Generating runs the other way. Start from pure noise.', 'start: noise'),
        draw(0.6, C.amber, 'At each step the network predicts the noise, and a small part of it is removed. (Illustration: these frames retrace the noising path backwards.)', 'denoising'),
        draw(0.97, C.violet, 'Step after step, structure appears.', 'almost there'),
        draw(1, C.green, 'A new sample from the data distribution. Real models take tens to a thousand of these steps, which is why diffusion is slow; faster samplers and distillation cut that down.', 'generated'),
    ];
    return {
        title: 'Diffusion: learn to remove noise, then remove it step by step',
        variants: [
            { label: 'Adding noise (training)', frames: forward },
            { label: 'Removing noise (generating)', frames: reverse },
        ],
    };
};

// ============ f7-t3 · RL basics ============

const rlBasics = (): AnimationSpec => {
    const R = 4;
    const Cn = 5;
    const goal = [0, 4];
    const pit = [1, 4];
    const wall = [1, 2];
    const gamma = 0.8;
    const isWall = (r: number, c: number) => r === wall[0] && c === wall[1];
    const terminal = (r: number, c: number) => (r === goal[0] && c === goal[1]) || (r === pit[0] && c === pit[1]);
    const reward = (r: number, c: number) => (r === goal[0] && c === goal[1] ? 1 : r === pit[0] && c === pit[1] ? -1 : 0);
    const moves: [number, number, string][] = [[-1, 0, '↑'], [1, 0, '↓'], [0, -1, '←'], [0, 1, '→']];
    const step = (r: number, c: number, dr: number, dc: number) => {
        const nr = r + dr;
        const nc = c + dc;
        return nr < 0 || nr >= R || nc < 0 || nc >= Cn || isWall(nr, nc) ? [r, c] : [nr, nc];
    };
    // Value iteration with deterministic moves: V(s) = max_a [ r(s') + γ·V(s') ].
    const sweeps: number[][][] = [];
    let V = Array.from({ length: R }, () => new Array<number>(Cn).fill(0));
    for (let k = 0; k < 8; k++) {
        const next = V.map(row => [...row]);
        for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) {
            if (terminal(r, c) || isWall(r, c)) continue;
            next[r][c] = Math.max(...moves.map(([dr, dc]) => {
                const [nr, nc] = step(r, c, dr, dc);
                return reward(nr, nc) + (terminal(nr, nc) ? 0 : gamma * V[nr][nc]);
            }));
        }
        V = next;
        sweeps.push(V);
    }
    const S = 52;
    const X0 = 50;
    const Y0 = 20;
    const policyArrow = (vals: number[][], r: number, c: number) => {
        let best = moves[0];
        let bestV = -Infinity;
        for (const m of moves) {
            const [nr, nc] = step(r, c, m[0], m[1]);
            const v = reward(nr, nc) + (terminal(nr, nc) ? 0 : gamma * vals[nr][nc]);
            if (v > bestV + 1e-9) { bestV = v; best = m; }
        }
        return best[2];
    };
    const grid = (vals: number[][] | null, arrows: boolean) => {
        const out = [];
        for (let r = 0; r < R; r++) for (let c = 0; c < Cn; c++) {
            const x = X0 + c * (S + 3);
            const y = Y0 + r * (S + 3);
            let fill = '#1c232c';
            let txt = '';
            if (isWall(r, c)) { fill = '#3a434e'; txt = 'wall'; }
            else if (r === goal[0] && c === goal[1]) { fill = tint(C.green, 0.8); txt = '+1'; }
            else if (r === pit[0] && c === pit[1]) { fill = tint(C.red, 0.8); txt = '−1'; }
            else if (vals) { fill = lerpColor('#1c232c', C.green, Math.max(0, vals[r][c])); txt = arrows ? `${policyArrow(vals, r, c)}\n${round(vals[r][c], 2)}` : String(round(vals[r][c], 2)); }
            out.push(rect(`c${r}-${c}`, x, y, S, S, { rx: 6, fill, text: txt, size: 11, weight: 700 }));
        }
        return out;
    };
    const agent = (r: number, c: number) => circle('agent', X0 + c * (S + 3) + S / 2, Y0 + r * (S + 3) + S / 2, 10, { fill: C.yellow, stroke: C.bg, sw: 2, text: '🤖', size: 10 });
    const frames: Frame[] = [
        frame('A grid world. The agent (yellow) is in a state (a square) and can take an action: move up, down, left or right. Reaching the green square gives reward +1; the red one gives −1.', [grid(null, false), agent(3, 0)]),
        frame('Nobody tells it the right path. It must learn from rewards, which only arrive at the very end: the credit-assignment problem.', [grid(null, false), agent(2, 3)]),
        frame(`A value function says how much future reward each square leads to. Value iteration, sweep 1: only squares next to the goal know anything yet (discount γ = ${gamma}).`, [grid(sweeps[0], false)]),
        frame('Sweep 2: value spreads one step further from the goal, shrunk by γ at every step.', [grid(sweeps[1], false)]),
        frame('After a few sweeps, every square has a value: how good it is to stand there. Farther from the goal means lower value.', [grid(sweeps[7], false)]),
        frame('The policy (arrows) simply steps towards the highest-value neighbour. Note how it routes around the wall and away from the red pit. Q-learning learns the same kind of values from experience, without knowing the rules in advance.', [grid(sweeps[7], true)]),
    ];
    return {
        title: 'Reinforcement learning: values spread back from rewards',
        variants: [{ label: 'A grid world', frames }],
    };
};

// ============ f7-t4 · Policy gradients and PPO ============

const policyGradient = (): AnimationSpec => {
    const actions = ['left', 'stay', 'right'];
    let logits = [0, 0, 0];
    const soft = (z: number[]) => { const e = z.map(Math.exp); const s = e.reduce((a, b) => a + b, 0); return e.map(v => v / s); };
    const history: { p: number[]; note: string }[] = [{ p: soft(logits), note: 'start: all equally likely' }];
    // A few REINFORCE-style updates: push up the action that earned an above-baseline return.
    const updates: [number, number, string][] = [[2, 1, 'took "right", return above baseline → more likely'], [0, -1, 'took "left", return below baseline → less likely'], [2, 1, '"right" good again → more likely']];
    for (const [act, adv] of updates) {
        const p = soft(logits);
        logits = logits.map((z, i) => z + 0.8 * adv * ((i === act ? 1 : 0) - p[i]));
        history.push({ p: soft(logits), note: updates[history.length - 1][2] });
    }
    const a = axes(60, 30, 280, 150, -0.5, 2.5, 0, 1);
    const pg: Frame[] = history.map((h, k) => frame(
        k === 0 ? 'A policy network outputs a probability for each action. At first it has no preference.'
            : k === 1 ? 'Play an episode. "right" led to a better-than-average return (positive advantage), so nudge its probability up: ∇ log π(a|s) × advantage.'
                : k === 2 ? '"left" led to a worse-than-average return: its probability goes down.'
                    : 'Repeat over many episodes and the policy shifts towards actions that earn more reward. The signal is noisy, which is why a baseline (an average) is subtracted.',
        [bars('pb', a, h.p, [C.pink, C.grey, C.green], actions, { showValues: true, digits: 2 }), label('n', 200, 226, h.note, C.ink, { anchor: 'middle', size: 11, mono: false })],
    ));
    const b = axes(50, 20, 320, 180, 0.4, 1.8, 0.2, 1.6);
    const eps = 0.2;
    const A = 1;
    const unclipped = (r: number) => r * A;
    const clipped = (r: number) => Math.min(r * A, Math.min(Math.max(r, 1 - eps), 1 + eps) * A);
    const ppo: Frame[] = [
        frame('PPO looks at the ratio r = π_new(a|s) / π_old(a|s): how much the update changed this action\'s probability. Here the advantage is positive, so the objective r × A rewards raising it…', [axisLines('ax', b, 'ratio r', 'objective'), fnPath('raw', b, unclipped, { stroke: C.grey, sw: 2.5 }), line('one', px(b, 1), b.y, px(b, 1), b.y + b.h, { stroke: C.faint, dash: '4 4' })]),
        frame('…and without limits, a big step could push r far up and wreck the policy. PPO clips: past r = 1 + ε (ε = 0.2) the objective goes flat, so there is no reward for changing the policy further in one update.', [axisLines('ax', b, 'ratio r', 'objective'), fnPath('raw', b, unclipped, { stroke: C.faint, sw: 2 }), fnPath('clip', b, clipped, { stroke: C.green, sw: 3.5, n: 160 }), line('one', px(b, 1), b.y, px(b, 1), b.y + b.h, { stroke: C.faint, dash: '4 4' }), line('hi', px(b, 1 + eps), b.y, px(b, 1 + eps), b.y + b.h, { stroke: C.amber, dash: '4 4' }), label('hil', px(b, 1 + eps) + 4, b.y + 10, '1 + ε', C.amber, { size: 11 })]),
        frame('So each update stays close to the old policy: small, safe steps that can reuse the same batch of experience several times. This is the algorithm behind classic RLHF for language models.', [axisLines('ax', b, 'ratio r', 'objective'), fnPath('clip', b, clipped, { stroke: C.green, sw: 3.5, n: 160 }), line('hi', px(b, 1 + eps), b.y, px(b, 1 + eps), b.y + b.h, { stroke: C.amber, dash: '4 4' }), label('hil', px(b, 1 + eps) + 4, b.y + 10, '1 + ε', C.amber, { size: 11 })]),
    ];
    return {
        title: 'Policy gradients: make good actions more likely, in small steps',
        variants: [
            { label: 'Policy gradient', frames: pg },
            { label: 'PPO clipping', frames: ppo },
        ],
    };
};

export const phase7Animations: Record<string, () => AnimationSpec> = {
    'f7-t1': vae,
    'f7-t2': diffusion,
    'f7-t3': rlBasics,
    'f7-t4': policyGradient,
};

