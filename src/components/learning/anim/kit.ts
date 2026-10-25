import type { CircleShape, Frame, LineShape, PathShape, RectShape, Shape, TextShape } from './scene';

// Small builders for animation frames, so a spec reads like a description of
// the picture instead of a pile of coordinates. Everything returns plain shapes.

/** The palette: bright on the dark page, and distinct from each other. */
export const C = {
    cyan: '#4dd0e1',
    green: '#66bb6a',
    amber: '#ffb74d',
    pink: '#f06292',
    violet: '#b39ddb',
    blue: '#64b5f6',
    red: '#ef5350',
    yellow: '#fff176',
    teal: '#4db6ac',
    orange: '#ff8a65',
    grey: '#90a4ae',
    ink: '#e6edf3',
    dim: '#6b7785',
    faint: '#2a333e',
    panel: '#161c24',
    bg: '#0d1117',
} as const;

/** The same colour, see-through: for fills behind text. */
export const tint = (color: string, alpha = 0.22) => `${color.slice(0, 7)}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;

type Opts<T> = Partial<Omit<T, 'kind' | 'id'>>;

export const rect = (id: string, x: number, y: number, w: number, h: number, o: Opts<RectShape> = {}): RectShape =>
    ({ kind: 'rect', id, x, y, w, h, ...o });

export const circle = (id: string, x: number, y: number, r: number, o: Opts<CircleShape> = {}): CircleShape =>
    ({ kind: 'circle', id, x, y, r, ...o });

export const line = (id: string, x1: number, y1: number, x2: number, y2: number, o: Opts<LineShape> = {}): LineShape =>
    ({ kind: 'line', id, x1, y1, x2, y2, stroke: C.grey, sw: 2, ...o });

export const arrow = (id: string, x1: number, y1: number, x2: number, y2: number, o: Opts<LineShape> = {}): LineShape =>
    line(id, x1, y1, x2, y2, { arrow: true, ...o });

export const path = (id: string, points: [number, number][], o: Opts<PathShape> = {}): PathShape =>
    ({ kind: 'path', id, points, stroke: C.cyan, sw: 2.5, fill: 'none', ...o });

export const text = (id: string, x: number, y: number, value: string, o: Opts<TextShape> = {}): TextShape =>
    ({ kind: 'text', id, x, y, text: value, size: 13, fill: C.ink, anchor: 'middle', ...o });

/** A rounded, tinted box with a coloured border and a label: the basic block of a flow picture. */
export const box = (id: string, x: number, y: number, w: number, h: number, label: string, color: string, o: Opts<RectShape> = {}): RectShape =>
    rect(id, x, y, w, h, { rx: 8, fill: tint(color), stroke: color, sw: 2, text: label, textColor: C.ink, size: 13, weight: 700, ...o });

/** The same box, lit up: a stronger fill so the eye goes to it. */
export const lit = (shape: RectShape | CircleShape, color: string): RectShape | CircleShape =>
    ({ ...shape, fill: tint(color, 0.55), stroke: color, sw: 3 });

/** A labelled dot. */
export const dot = (id: string, x: number, y: number, color: string, r = 6, o: Opts<CircleShape> = {}): CircleShape =>
    circle(id, x, y, r, { fill: color, stroke: C.bg, sw: 1.5, ...o });

/** A piece of a frame: one shape, a list, or nothing (so parts can be switched on with `&&`). */
export type Part = Shape | Part[] | false | null | undefined;

export const flat = (parts: Part[]): Shape[] => {
    const out: Shape[] = [];
    const walk = (part: Part) => {
        if (!part) return;
        if (Array.isArray(part)) part.forEach(walk);
        else out.push(part);
    };
    parts.forEach(walk);
    return out;
};

export const frame = (caption: string, parts: Part[], hold?: number): Frame =>
    hold === undefined ? { caption, shapes: flat(parts) } : { caption, shapes: flat(parts), hold };

/** Numbers from `from` to `to`, `count` of them, ends included. */
export const range = (from: number, to: number, count: number) =>
    Array.from({ length: count }, (_, index) => (count === 1 ? from : from + ((to - from) * index) / (count - 1)));

export const round = (value: number, places = 2) => {
    const scale = 10 ** places;
    return Math.round(value * scale) / scale;
};

// ============ CHARTS ============

/** A plotting area: a pixel box on the canvas and the data range it shows. */
export interface Axes {
    x: number;
    y: number;
    w: number;
    h: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
}

export const axes = (x: number, y: number, w: number, h: number, xMin: number, xMax: number, yMin: number, yMax: number): Axes =>
    ({ x, y, w, h, xMin, xMax, yMin, yMax });

/** Data → canvas. */
export const px = (a: Axes, x: number) => a.x + ((x - a.xMin) / (a.xMax - a.xMin)) * a.w;
export const py = (a: Axes, y: number) => a.y + a.h - ((y - a.yMin) / (a.yMax - a.yMin)) * a.h;
export const pt = (a: Axes, x: number, y: number): [number, number] => [px(a, x), py(a, y)];

/** The two axis lines with their labels. */
export const axisLines = (id: string, a: Axes, xLabel = '', yLabel = ''): Shape[] => {
    const parts: Shape[] = [
        line(`${id}-x`, a.x, a.y + a.h, a.x + a.w, a.y + a.h, { stroke: C.dim, sw: 1.5 }),
        line(`${id}-y`, a.x, a.y, a.x, a.y + a.h, { stroke: C.dim, sw: 1.5 }),
    ];
    if (xLabel) parts.push(text(`${id}-xl`, a.x + a.w, a.y + a.h + 16, xLabel, { anchor: 'end', size: 12, fill: C.grey }));
    if (yLabel) parts.push(text(`${id}-yl`, a.x + 4, a.y - 6, yLabel, { anchor: 'start', size: 12, fill: C.grey }));
    return parts;
};

/** y = f(x) drawn across the axes, clipped to its y range. */
export const fnPath = (id: string, a: Axes, f: (x: number) => number, o: Opts<PathShape> & { from?: number; to?: number; n?: number } = {}): PathShape => {
    const { from = a.xMin, to = a.xMax, n = 80, ...rest } = o;
    const points = range(from, to, n).map(x => {
        const y = Math.min(a.yMax, Math.max(a.yMin, f(x)));
        return pt(a, x, y);
    });
    return path(id, points, rest);
};

/**
 * The straight line y = slope·x + intercept, cut to the plotting area. Always
 * two points, so it can swing smoothly between frames.
 */
export const lineInBox = (id: string, a: Axes, slope: number, intercept: number, o: Opts<PathShape> = {}): PathShape => {
    const f = (x: number) => slope * x + intercept;
    // Where the line crosses each edge of the data box, kept if it lies on that edge.
    const hits: [number, number][] = [];
    const add = (x: number, y: number) => {
        if (x >= a.xMin - 1e-9 && x <= a.xMax + 1e-9 && y >= a.yMin - 1e-9 && y <= a.yMax + 1e-9) hits.push([x, y]);
    };
    add(a.xMin, f(a.xMin));
    add(a.xMax, f(a.xMax));
    if (slope !== 0) {
        add((a.yMin - intercept) / slope, a.yMin);
        add((a.yMax - intercept) / slope, a.yMax);
    }
    hits.sort((p, q) => p[0] - q[0]);
    const ends = hits.length >= 2 ? [hits[0], hits[hits.length - 1]] : [[a.xMin, a.yMin], [a.xMin, a.yMin]];
    return path(id, ends.map(([x, y]) => pt(a, x, y)), o);
};

/**
 * A curve drawn partway: the first `share` of its points, with the rest
 * bunched on the last drawn point. Every version has the same number of
 * points, so frames can show the line being drawn.
 */
export const growPath = (id: string, points: [number, number][], share: number, o: Opts<PathShape> = {}): PathShape => {
    const shown = Math.max(1, Math.round(points.length * Math.min(1, Math.max(0, share))));
    const last = points[shown - 1];
    return path(id, points.map((point, index) => (index < shown ? point : last)), o);
};

/** Bars from a baseline, one per value, with an optional label under each. */
export const bars = (
    id: string,
    a: Axes,
    values: number[],
    colors: string | string[],
    labels: string[] = [],
    o: { gap?: number; showValues?: boolean; digits?: number } = {},
): Shape[] => {
    const { gap = 0.25, showValues = false, digits = 2 } = o;
    const slot = a.w / values.length;
    const width = slot * (1 - gap);
    const parts: Shape[] = [];
    values.forEach((value, index) => {
        const color = Array.isArray(colors) ? colors[index % colors.length] : colors;
        const top = py(a, Math.max(a.yMin, Math.min(a.yMax, value)));
        const base = py(a, Math.max(a.yMin, 0));
        const x = a.x + slot * index + (slot - width) / 2;
        parts.push(rect(`${id}-${index}`, x, Math.min(top, base), width, Math.max(1, Math.abs(base - top)), { rx: 3, fill: color }));
        if (labels[index] !== undefined) parts.push(text(`${id}-l${index}`, x + width / 2, a.y + a.h + 15, labels[index], { size: 12, fill: C.grey }));
        if (showValues) parts.push(text(`${id}-v${index}`, x + width / 2, Math.min(top, base) - 5, String(round(value, digits)), { size: 11, fill: C.ink }));
    });
    return parts;
};

// ============ GRIDS, TOKENS AND NETWORKS ============

/** A grid of square cells, each with its own label and colour. */
export const cells = (
    id: string,
    x: number,
    y: number,
    rows: number,
    cols: number,
    size: number,
    label: (r: number, c: number) => string,
    color: (r: number, c: number) => string,
    o: { gap?: number; textSize?: number; mono?: boolean } = {},
): RectShape[] => {
    const { gap = 3, textSize = 13, mono = true } = o;
    const out: RectShape[] = [];
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
            const fill = color(r, c);
            out.push(rect(`${id}-${r}-${c}`, x + c * (size + gap), y + r * (size + gap), size, size, {
                rx: 4,
                fill,
                stroke: C.faint,
                sw: 1,
                text: label(r, c),
                textColor: C.ink,
                size: textSize,
                weight: 600,
                mono,
            }));
        }
    }
    return out;
};

/** Where cell (r, c) sits in a `cells` grid. */
export const cellAt = (x: number, y: number, size: number, r: number, c: number, gap = 3) =>
    ({ x: x + c * (size + gap), y: y + r * (size + gap), cx: x + c * (size + gap) + size / 2, cy: y + r * (size + gap) + size / 2 });

/** Width a token chip needs for its text. */
export const chipWidth = (value: string, size = 13) => Math.max(26, value.length * size * 0.62 + 14);

/** A row of word or token chips, left to right from (x, y). */
export const chips = (
    id: string,
    x: number,
    y: number,
    tokens: string[],
    colors: string | string[],
    o: { gap?: number; h?: number; size?: number; ids?: string[] } = {},
): RectShape[] => {
    const { gap = 5, h = 26, size = 13, ids } = o;
    let at = x;
    return tokens.map((token, index) => {
        const color = Array.isArray(colors) ? colors[index % colors.length] : colors;
        const w = chipWidth(token, size);
        const shape = rect(ids ? ids[index] : `${id}-${index}`, at, y, w, h, {
            rx: 6, fill: tint(color, 0.3), stroke: color, sw: 1.5, text: token, textColor: C.ink, size, weight: 600, mono: true,
        });
        at += w + gap;
        return shape;
    });
};

/** Node centres for a layered network: one column per layer, nodes centred vertically. */
export const layerPositions = (sizes: number[], x0: number, x1: number, yMid: number, spacing: number) =>
    sizes.map((count, layer) => {
        const x = sizes.length === 1 ? (x0 + x1) / 2 : x0 + ((x1 - x0) * layer) / (sizes.length - 1);
        return Array.from({ length: count }, (_, index) => ({ x, y: yMid + (index - (count - 1) / 2) * spacing }));
    });

/** Every edge between neighbouring layers. */
export const layerEdges = (
    id: string,
    layers: { x: number; y: number }[][],
    style: (layer: number, from: number, to: number) => Opts<LineShape>,
): LineShape[] => {
    const out: LineShape[] = [];
    layers.slice(0, -1).forEach((left, layer) => {
        left.forEach((a, i) => {
            layers[layer + 1].forEach((b, j) => {
                out.push(line(`${id}-${layer}-${i}-${j}`, a.x, a.y, b.x, b.y, { stroke: C.faint, sw: 1.5, ...style(layer, i, j) }));
            });
        });
    });
    return out;
};

/** Seeded random numbers, so an animation looks the same every time. */
export const seeded = (seed: number) => {
    let s = seed >>> 0;
    return () => {
        s = (s * 1664525 + 1013904223) >>> 0;
        return s / 4294967296;
    };
};

/** A normally distributed sample from a seeded uniform source (Box–Muller). */
export const gaussian = (rand: () => number) => {
    const u = Math.max(1e-9, rand());
    const v = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};

// ============ THE 2-D PLANE (linear algebra) ============

/** A coordinate plane drawn on the canvas: where the origin sits, pixels per unit, and the visible box. */
export interface Plane {
    cx: number;
    cy: number;
    unit: number;
    /** Visible area in canvas pixels: [left, top, right, bottom]. */
    box: [number, number, number, number];
}

export const plane = (cx: number, cy: number, unit: number, box: [number, number, number, number] = [0, 0, 400, 240]): Plane =>
    ({ cx, cy, unit, box });

/** Plane coordinates → canvas pixels (y goes up). */
export const toPx = (p: Plane, x: number, y: number): [number, number] => [p.cx + x * p.unit, p.cy - y * p.unit];

/** A 2 × 2 matrix as [[a, b], [c, d]]: (x, y) → (ax + by, cx + dy). */
export type Mat2 = [[number, number], [number, number]];
export const I2: Mat2 = [[1, 0], [0, 1]];
export const apply = (m: Mat2, x: number, y: number): [number, number] => [m[0][0] * x + m[0][1] * y, m[1][0] * x + m[1][1] * y];
export const matmul = (a: Mat2, b: Mat2): Mat2 => [
    [a[0][0] * b[0][0] + a[0][1] * b[1][0], a[0][0] * b[0][1] + a[0][1] * b[1][1]],
    [a[1][0] * b[0][0] + a[1][1] * b[1][0], a[1][0] * b[0][1] + a[1][1] * b[1][1]],
];

/** Cut a segment to a box (Liang–Barsky). Null when it misses the box entirely. */
const clipSegment = (x1: number, y1: number, x2: number, y2: number, box: [number, number, number, number]): [number, number, number, number] | null => {
    const [left, top, right, bottom] = box;
    let t0 = 0;
    let t1 = 1;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const edges: [number, number][] = [[-dx, x1 - left], [dx, right - x1], [-dy, y1 - top], [dy, bottom - y1]];
    for (const [p, q] of edges) {
        if (p === 0) {
            if (q < 0) return null;
        } else {
            const r = q / p;
            if (p < 0) t0 = Math.max(t0, r);
            else t1 = Math.min(t1, r);
            if (t0 > t1) return null;
        }
    }
    return [x1 + t0 * dx, y1 + t0 * dy, x1 + t1 * dx, y1 + t1 * dy];
};

/** A line in plane coordinates, cut to the visible box. Hidden (not removed) when it is off screen, so it can tween back. */
export const planeLine = (id: string, p: Plane, a: [number, number], b: [number, number], o: Opts<LineShape> = {}): LineShape => {
    const [x1, y1] = toPx(p, ...a);
    const [x2, y2] = toPx(p, ...b);
    const cut = clipSegment(x1, y1, x2, y2, p.box);
    if (!cut) return line(id, p.cx, p.cy, p.cx, p.cy, { ...o, opacity: 0 });
    return line(id, ...cut, o);
};

/**
 * The grid of the plane after the matrix m has moved it: lines stay straight,
 * parallel and evenly spaced. With m = I2 it is the ordinary grid.
 */
export const planeGrid = (id: string, p: Plane, m: Mat2 = I2, o: { extent?: number; color?: string; axisColor?: string } = {}): Shape[] => {
    // Far enough to reach every corner of the visible box, unless told otherwise.
    const [left, top, right, bottom] = p.box;
    const reach = Math.max(...[[left, top], [right, top], [left, bottom], [right, bottom]].map(([x, y]) => Math.hypot(x - p.cx, y - p.cy)));
    const { extent = Math.min(30, Math.ceil(reach / p.unit) + 1), color = '#2b3a4a', axisColor = C.dim } = o;
    const out: Shape[] = [];
    for (let k = -extent; k <= extent; k++) {
        const isAxis = k === 0;
        const style = { stroke: isAxis ? axisColor : color, sw: isAxis ? 2 : 1 };
        out.push(planeLine(`${id}-v${k}`, p, apply(m, k, -extent), apply(m, k, extent), style));
        out.push(planeLine(`${id}-h${k}`, p, apply(m, -extent, k), apply(m, extent, k), style));
    }
    return out;
};

/** An arrow from the origin (or from `from`) to (x, y) in plane coordinates. */
export const vec = (id: string, p: Plane, x: number, y: number, color: string, o: Opts<LineShape> & { from?: [number, number] } = {}): LineShape => {
    const { from = [0, 0], ...rest } = o;
    const [x1, y1] = toPx(p, from[0], from[1]);
    const [x2, y2] = toPx(p, x, y);
    return line(id, x1, y1, x2, y2, { stroke: color, sw: 3.5, arrow: true, ...rest });
};

/** A polygon in plane coordinates, moved by m: for the unit square and its image. */
export const planePoly = (id: string, p: Plane, corners: [number, number][], m: Mat2, o: Opts<PathShape> = {}): PathShape =>
    path(id, corners.map(([x, y]) => toPx(p, ...apply(m, x, y))), { closed: true, ...o });

// ============ SMALL NUMERICS (so animations show what the algorithm really does) ============

/** Solve Ax = b by Gaussian elimination with partial pivoting. */
const solve = (A: number[][], b: number[]): number[] => {
    const n = b.length;
    const m = A.map((row, i) => [...row, b[i]]);
    for (let col = 0; col < n; col++) {
        let pivot = col;
        for (let r = col + 1; r < n; r++) if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
        [m[col], m[pivot]] = [m[pivot], m[col]];
        for (let r = col + 1; r < n; r++) {
            const f = m[r][col] / m[col][col];
            for (let c = col; c <= n; c++) m[r][c] -= f * m[col][c];
        }
    }
    const x = new Array<number>(n).fill(0);
    for (let r = n - 1; r >= 0; r--) {
        let sum = m[r][n];
        for (let c = r + 1; c < n; c++) sum -= m[r][c] * x[c];
        x[r] = sum / m[r][r];
    }
    return x;
};

/** Least-squares polynomial fit: coefficients c₀ + c₁x + … + c_d xᵈ. A tiny ridge keeps high degrees stable. */
export const polyfit = (xs: number[], ys: number[], degree: number, ridge = 1e-9): number[] => {
    const rows = xs.map(x => Array.from({ length: degree + 1 }, (_, k) => x ** k));
    const XtX = Array.from({ length: degree + 1 }, (_, i) => Array.from({ length: degree + 1 }, (_, j) => rows.reduce((s, r) => s + r[i] * r[j], 0) + (i === j ? ridge : 0)));
    const Xty = Array.from({ length: degree + 1 }, (_, i) => rows.reduce((s, r, k) => s + r[i] * ys[k], 0));
    return solve(XtX, Xty);
};

export const polyval = (c: number[], x: number) => c.reduce((s, ck, k) => s + ck * x ** k, 0);

export const mean = (values: number[]) => values.reduce((s, v) => s + v, 0) / values.length;
