import { C, rect, text } from '../../components/learning/anim/kit';

// Small pieces every phase's animations use.

/** Bold text, in a code font unless told otherwise. */
export const label = (id: string, x: number, y: number, value: string, color: string = C.ink, o: { size?: number; anchor?: 'start' | 'middle' | 'end'; mono?: boolean } = {}) =>
    text(id, x, y, value, { size: o.size ?? 13, fill: color, weight: 700, anchor: o.anchor ?? 'start', mono: o.mono ?? true });

/** A dark readout box with one coloured line per entry. */
export const panel = (lines: [string, string][], x = 8, y = 8, w = 170) => [
    rect('panel', x, y, w, 10 + lines.length * 18, { rx: 8, fill: '#0d1117e6', stroke: C.faint, sw: 1 }),
    lines.map(([value, color], i) => label(`pl${i}`, x + 10, y + 14 + i * 18, value, color, { size: 12 })),
];
