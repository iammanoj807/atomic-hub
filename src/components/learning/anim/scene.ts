// Animated pictures for the study pages, as plain data.
//
// An animation is a list of frames. Each frame is a caption and a set of
// shapes, and every shape has an id. The player moves from one frame to the
// next by tweening each shape that keeps its id (position, size, colour),
// fading in the shapes that arrive and fading out the ones that leave. Because
// a spec is only data, a test can check every one without a browser.

export interface ShapeBase {
    /** Same id in two frames = the same thing, so it moves instead of popping. */
    id: string;
    opacity?: number;
}

/** Text drawn inside a rect or circle, centred. */
interface Labelled {
    text?: string;
    textColor?: string;
    /** Font size in viewBox units. */
    size?: number;
    weight?: number;
    mono?: boolean;
}

export interface RectShape extends ShapeBase, Labelled {
    kind: 'rect';
    x: number;
    y: number;
    w: number;
    h: number;
    rx?: number;
    fill?: string;
    stroke?: string;
    sw?: number;
    dash?: string;
}

export interface CircleShape extends ShapeBase, Labelled {
    kind: 'circle';
    x: number;
    y: number;
    r: number;
    fill?: string;
    stroke?: string;
    sw?: number;
    dash?: string;
}

export interface LineShape extends ShapeBase {
    kind: 'line';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    stroke?: string;
    sw?: number;
    dash?: string;
    /** Draw an arrowhead at (x2, y2). */
    arrow?: boolean;
}

export interface PathShape extends ShapeBase {
    kind: 'path';
    points: [number, number][];
    stroke?: string;
    sw?: number;
    fill?: string;
    closed?: boolean;
    dash?: string;
    /** Draw an arrowhead at the last point. */
    arrow?: boolean;
}

export interface TextShape extends ShapeBase {
    kind: 'text';
    x: number;
    y: number;
    /** `\n` starts a new line. */
    text: string;
    size?: number;
    fill?: string;
    anchor?: 'start' | 'middle' | 'end';
    weight?: number;
    mono?: boolean;
}

export type Shape = RectShape | CircleShape | LineShape | PathShape | TextShape;

export interface Frame {
    /** What to notice in this frame. Shown under the picture. */
    caption: string;
    shapes: Shape[];
    /** How long to stay on this frame when playing, in ms. Defaults to time to read the caption. */
    hold?: number;
}

/** One version of the animation, e.g. "learning rate too big". */
export interface AnimVariant {
    label: string;
    frames: Frame[];
}

export interface AnimationSpec {
    /** Read out to screen readers, and shown above the picture. */
    title: string;
    /** viewBox size. Default 400 × 240. */
    width?: number;
    height?: number;
    variants: AnimVariant[];
}

export const DEFAULT_WIDTH = 400;
export const DEFAULT_HEIGHT = 240;

/** Time on a frame: long enough to read its caption, never shorter than 2.5 s. */
export const holdFor = (frame: Frame) =>
    frame.hold ?? Math.min(9000, Math.max(2500, 1500 + frame.caption.length * 45));

// ============ TWEENING ============

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Smooth start and stop. */
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

const HEX = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i;

export const isColor = (value: string) => value === 'none' || HEX.test(value);

const parse = (color: string): [number, number, number, number] | null => {
    const match = HEX.exec(color);
    if (!match) return null;
    const n = parseInt(match[1], 16);
    const alpha = match[2] ? parseInt(match[2], 16) : 255;
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, alpha];
};

const hex2 = (n: number) => Math.round(Math.min(255, Math.max(0, n))).toString(16).padStart(2, '0');

/** Mix two #rrggbb(aa) colours. Anything else switches halfway. */
export const lerpColor = (a: string, b: string, t: number) => {
    if (a === b) return b;
    const from = parse(a);
    const to = parse(b);
    if (!from || !to) return t < 0.5 ? a : b;
    const mixed = from.map((value, index) => lerp(value, to[index], t));
    return `#${hex2(mixed[0])}${hex2(mixed[1])}${hex2(mixed[2])}${hex2(mixed[3])}`;
};

const COLOR_KEYS = new Set(['fill', 'stroke', 'textColor']);

/** Blend one shape towards another with the same id and kind. */
const blend = (a: Shape, b: Shape, t: number): Shape => {
    const out: Record<string, unknown> = { ...b };
    const from = a as unknown as Record<string, unknown>;
    for (const [key, target] of Object.entries(b)) {
        const start = from[key];
        if (typeof target === 'number' && typeof start === 'number') {
            out[key] = lerp(start, target, t);
        } else if (typeof target === 'string' && typeof start === 'string' && COLOR_KEYS.has(key)) {
            out[key] = lerpColor(start, target, t);
        } else if (key === 'points' && Array.isArray(start) && Array.isArray(target) && start.length === target.length) {
            out[key] = (target as [number, number][]).map(([x, y], index) => {
                const [x0, y0] = (start as [number, number][])[index];
                return [lerp(x0, x, t), lerp(y0, y, t)];
            });
        } else if (start !== undefined && t < 0.5) {
            out[key] = start;
        }
    }
    // A shape that had no opacity set counts as fully visible.
    out.opacity = lerp(a.opacity ?? 1, b.opacity ?? 1, t);
    return out as unknown as Shape;
};

const faded = (shape: Shape, factor: number): Shape => ({ ...shape, opacity: (shape.opacity ?? 1) * factor });

/**
 * The picture partway from `from` to `to` (t from 0 to 1, already eased).
 * Shapes in `to` keep its drawing order; shapes that are leaving are drawn
 * underneath, fading out.
 */
export const tweenShapes = (from: Shape[], to: Shape[], t: number): Shape[] => {
    if (t >= 1) return to;
    const before = new Map(from.map(shape => [shape.id, shape]));
    const after = new Set(to.map(shape => shape.id));
    const leaving = from.filter(shape => !after.has(shape.id)).map(shape => faded(shape, 1 - t));
    const staying = to.map(shape => {
        const start = before.get(shape.id);
        if (!start) return faded(shape, t);
        if (start.kind !== shape.kind) return faded(shape, t);
        return blend(start, shape, t);
    });
    return [...leaving, ...staying];
};
