import type { Frame, Shape } from '../../components/learning/anim/scene';
import { C, flat, frame, line, rect, text, tint, type Part } from '../../components/learning/anim/kit';

export { label, panel } from '../foundationsAnimations/common';

// System design pictures are mostly the same thing: boxes, arrows between
// them, and a request travelling along the arrows. A flow is that picture as
// data — nodes, edges, and a list of steps saying what is lit and where each
// message is. Any id that does not exist throws, so a typo fails the test
// instead of quietly drawing nothing.

export type NodeKind = 'box' | 'store' | 'queue' | 'client';

export interface FNode {
    id: string;
    x: number;
    y: number;
    w?: number;
    h?: number;
    /** `\n` starts a second line. */
    label: string;
    color?: string;
    kind?: NodeKind;
    size?: number;
}

export interface FEdge {
    from: string;
    to: string;
    label?: string;
    dashed?: boolean;
    /** Draw without an arrowhead (a plain link). */
    plain?: boolean;
}

/** A message on the move: at a node, or partway along an edge (t from 0 to 1). Keep the id to make it travel. */
export interface Packet {
    id: string;
    label: string;
    at: string | [from: string, to: string, t?: number];
    color?: string;
}

export interface Step {
    caption: string;
    /** Draw only these nodes (and the edges between them). Default: every node. */
    show?: string[];
    hide?: string[];
    /** Highlighted in amber: where the action is. */
    lit?: string[];
    /** Green: done, healthy, a hit. */
    ok?: string[];
    /** Red: failed, refused, a miss. */
    bad?: string[];
    /** Faded: not part of this step. */
    dim?: string[];
    /** Highlighted edges, written 'from>to'. */
    hot?: string[];
    packets?: Packet[];
    /** A small tag on a node's bottom-right corner. */
    badges?: Record<string, string>;
    /** Lines of text in the bottom-left corner: [text, colour]. */
    notes?: [string, string?][];
    extra?: Part[];
    hold?: number;
}

export interface FlowOptions {
    height?: number;
}

const W = 96;
const H = 34;

const size = (n: FNode) => ({ w: n.w ?? W, h: n.h ?? H });
const centre = (n: FNode) => {
    const { w, h } = size(n);
    return { x: n.x + w / 2, y: n.y + h / 2, hw: w / 2, hh: h / 2 };
};

/** Where the line from a's centre towards (tx, ty) leaves a's box, with a small gap. */
const border = (n: FNode, tx: number, ty: number, gap = 3): [number, number] => {
    const c = centre(n);
    const dx = tx - c.x;
    const dy = ty - c.y;
    if (dx === 0 && dy === 0) return [c.x, c.y];
    const t = Math.min(dx === 0 ? Infinity : (c.hw + gap) / Math.abs(dx), dy === 0 ? Infinity : (c.hh + gap) / Math.abs(dy));
    return [c.x + dx * t, c.y + dy * t];
};

/** The two ends of an edge, clipped to the boxes it joins. */
const ends = (a: FNode, b: FNode): [number, number, number, number] => {
    const ca = centre(a);
    const cb = centre(b);
    const [x1, y1] = border(a, cb.x, cb.y);
    const [x2, y2] = border(b, ca.x, ca.y, 5);
    return [x1, y1, x2, y2];
};

const chipWidth = (value: string) => Math.max(24, value.length * 5.6 + 10);

export const flow = (nodes: FNode[], edges: FEdge[], steps: Step[], o: FlowOptions = {}): Frame[] => {
    const height = o.height ?? 240;
    const byId = new Map(nodes.map(n => [n.id, n]));
    const node = (id: string, where: string) => {
        const found = byId.get(id);
        if (!found) throw new Error(`flow: unknown node "${id}" in ${where}`);
        return found;
    };
    const key = (e: FEdge) => `${e.from}>${e.to}`;
    const edgeIds = new Set(edges.map(key));
    edges.forEach(e => {
        node(e.from, `edge ${key(e)}`);
        node(e.to, `edge ${key(e)}`);
    });

    return steps.map((step, index) => {
        const where = `step ${index + 1}`;
        for (const list of [step.show, step.hide, step.lit, step.ok, step.bad, step.dim]) list?.forEach(id => node(id, where));
        step.hot?.forEach(k => {
            if (!edgeIds.has(k)) throw new Error(`flow: unknown edge "${k}" in ${where}`);
        });
        Object.keys(step.badges ?? {}).forEach(id => node(id, where));

        const visible = new Set((step.show ?? nodes.map(n => n.id)).filter(id => !step.hide?.includes(id)));
        const hot = new Set(step.hot ?? []);
        const look = (id: string, base: string): [string, number, number] => {
            if (step.bad?.includes(id)) return [C.red, 0.5, 2.5];
            if (step.ok?.includes(id)) return [C.green, 0.45, 2.5];
            if (step.lit?.includes(id)) return [C.amber, 0.5, 3];
            return [base, 0.2, 1.5];
        };

        const edgeShapes: Shape[] = edges.filter(e => visible.has(e.from) && visible.has(e.to)).flatMap(e => {
            const [x1, y1, x2, y2] = ends(byId.get(e.from)!, byId.get(e.to)!);
            const on = hot.has(key(e));
            const stroke = on ? C.amber : C.dim;
            const shapes: Shape[] = [line(`e-${e.from}-${e.to}`, x1, y1, x2, y2, { stroke, sw: on ? 2.5 : 1.5, arrow: !e.plain, dash: e.dashed ? '5 4' : undefined })];
            if (e.label) {
                const len = Math.hypot(x2 - x1, y2 - y1) || 1;
                shapes.push(text(`el-${e.from}-${e.to}`, (x1 + x2) / 2 + ((y2 - y1) / len) * 9, (y1 + y2) / 2 - ((x2 - x1) / len) * 9, e.label, { size: 9, fill: on ? C.amber : C.grey, weight: 700, mono: true }));
            }
            return shapes;
        });

        const nodeShapes: Shape[] = nodes.filter(n => visible.has(n.id)).flatMap(n => {
            const { w, h } = size(n);
            const base = n.color ?? C.blue;
            const [color, strength, sw] = look(n.id, base);
            const faded = step.dim?.includes(n.id);
            const kind = n.kind ?? 'box';
            const shapes: Shape[] = [rect(`n-${n.id}`, n.x, n.y, w, h, {
                rx: kind === 'client' ? h / 2 : kind === 'store' ? 12 : 7,
                fill: tint(color, strength), stroke: color, sw, opacity: faded ? 0.3 : 1,
                text: n.label, textColor: C.ink, size: n.size ?? 11, weight: 700,
            })];
            // A store has a lid; a queue has slots.
            if (kind === 'store') shapes.push(line(`nl-${n.id}`, n.x + 6, n.y + 7, n.x + w - 6, n.y + 7, { stroke: color, sw: 1, opacity: faded ? 0.3 : 0.8 }));
            if (kind === 'queue') [0.72, 0.8, 0.88].forEach((f, i) => shapes.push(line(`nq-${n.id}-${i}`, n.x + w * f, n.y + 5, n.x + w * f, n.y + h - 5, { stroke: color, sw: 1, opacity: faded ? 0.3 : 0.8 })));
            return shapes;
        });

        const badgeShapes: Shape[] = Object.entries(step.badges ?? {}).filter(([id]) => visible.has(id)).map(([id, value]) => {
            const n = byId.get(id)!;
            const { w, h } = size(n);
            const bw = chipWidth(value);
            // Bottom-right corner, so it never sits under a message resting on top of the box.
            return rect(`b-${id}`, Math.min(n.x + w - bw / 2, 398 - bw), n.y + h - 7, bw, 16, { rx: 8, fill: tint(C.violet, 0.5), stroke: C.violet, sw: 1, text: value, size: 9, weight: 700, mono: true });
        });

        const atNode = new Map<string, number>();
        const packetShapes: Shape[] = (step.packets ?? []).map(p => {
            const color = p.color ?? C.amber;
            const pw = chipWidth(p.label);
            let cx: number;
            let cy: number;
            if (typeof p.at === 'string') {
                const n = node(p.at, `${where} packet ${p.id}`);
                const c = centre(n);
                const k = atNode.get(p.at) ?? 0;
                atNode.set(p.at, k + 1);
                cx = c.x + k * 10;
                cy = n.y - 4 + k * 6;
            } else {
                const [from, to, t = 0.5] = p.at;
                if (!edgeIds.has(`${from}>${to}`) && !edgeIds.has(`${to}>${from}`)) throw new Error(`flow: packet ${p.id} on unknown edge ${from}>${to} in ${where}`);
                const [x1, y1, x2, y2] = ends(node(from, where), node(to, where));
                cx = x1 + (x2 - x1) * t;
                cy = y1 + (y2 - y1) * t;
            }
            return rect(`p-${p.id}`, cx - pw / 2, cy - 9, pw, 18, { rx: 9, fill: tint(color, 0.85), stroke: C.bg, sw: 1.5, text: p.label, textColor: '#0b0f14ff', size: 9, weight: 800, mono: true });
        });

        const notes = step.notes ?? [];
        const noteShapes: Shape[] = notes.map(([value, color], i) => text(`note${i}`, 10, height - 12 - (notes.length - 1 - i) * 16, value, { size: 11, fill: color ?? C.grey, weight: 700, anchor: 'start' }));

        return frame(step.caption, [edgeShapes, nodeShapes, badgeShapes, flat(step.extra ?? []), packetShapes, noteShapes], step.hold);
    });
};
