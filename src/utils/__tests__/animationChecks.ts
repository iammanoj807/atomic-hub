import { DEFAULT_HEIGHT, DEFAULT_WIDTH, isColor, type Shape } from '../../components/learning/anim/scene';
import type { AnimationRegistry } from '../../components/learning/anim/useTopicAnimation';

// Checks every study page's animations share: each frame is valid data and
// fits the picture. Returns a list of problems, so a test can show them all.

const numbersIn = (shape: Shape): number[] => {
    const values: number[] = [];
    for (const value of Object.values(shape)) {
        if (typeof value === 'number') values.push(value);
        if (Array.isArray(value)) value.forEach(p => values.push(...p));
    }
    return values;
};

/** Roughly how wide a line of text is drawn: wide enough to catch labels that spill, not exact. */
const textWidth = (value: string, size: number, mono = false) => {
    const longest = Math.max(...value.split('\n').map(row => [...row].length));
    return longest * size * (mono ? 0.6 : 0.55);
};

const textHeight = (value: string, size: number) => value.split('\n').length * size * 1.15;

/** The points a shape covers, for the "inside the picture" check. With `textFit`, text counts at its drawn size. */
const extent = (shape: Shape, textFit: boolean): [number, number][] => {
    switch (shape.kind) {
        case 'rect': return [[shape.x, shape.y], [shape.x + shape.w, shape.y + shape.h]];
        case 'circle': return [[shape.x - shape.r, shape.y - shape.r], [shape.x + shape.r, shape.y + shape.r]];
        case 'line': return [[shape.x1, shape.y1], [shape.x2, shape.y2]];
        case 'path': return shape.points;
        case 'text': {
            if (!textFit) return [[shape.x, shape.y]];
            const size = shape.size ?? 13;
            const w = textWidth(shape.text, size, shape.mono);
            const h = textHeight(shape.text, size);
            const anchor = shape.anchor ?? 'middle';
            const left = anchor === 'start' ? shape.x : anchor === 'end' ? shape.x - w : shape.x - w / 2;
            return [[left, shape.y - h / 2], [left + w, shape.y + h / 2]];
        }
    }
};

/** A label inside a rect or circle that is too big for it. */
const labelOverflow = (shape: Shape): string | null => {
    if ((shape.kind !== 'rect' && shape.kind !== 'circle') || !shape.text) return null;
    const size = shape.size ?? (shape.kind === 'rect' ? 13 : 12);
    const w = textWidth(shape.text, size, shape.mono);
    const h = textHeight(shape.text, size);
    const [boxW, boxH] = shape.kind === 'rect' ? [shape.w, shape.h] : [2 * shape.r, 2 * shape.r];
    // Labels can sit right up to the edge; a few units of slack for the estimate.
    if (w > boxW + 6 || h > boxH + 6) return `label "${shape.text}" (${Math.round(w)}×${Math.round(h)}) does not fit its ${Math.round(boxW)}×${Math.round(boxH)} box`;
    return null;
};

export interface AnimationCheckOptions {
    /** Also check that text, at its drawn size, stays inside the picture and inside its box. */
    textFit?: boolean;
}

export const animationProblems = (registry: AnimationRegistry, o: AnimationCheckOptions = {}): string[] => {
    const { textFit = false } = o;
    const problems: string[] = [];
    for (const [topicId, build] of Object.entries(registry)) {
        const spec = build();
        const w = spec.width ?? DEFAULT_WIDTH;
        const h = spec.height ?? DEFAULT_HEIGHT;
        if (!spec.title.trim()) problems.push(`${topicId}: no title`);
        if (spec.variants.length === 0) problems.push(`${topicId}: no variants`);
        const labels = spec.variants.map(v => v.label);
        if (new Set(labels).size !== labels.length) problems.push(`${topicId}: repeated variant label`);
        for (const variant of spec.variants) {
            if (variant.frames.length < 2) problems.push(`${topicId}/${variant.label}: fewer than 2 frames`);
            if (variant.frames.length > 16) problems.push(`${topicId}/${variant.label}: more than 16 frames`);
            variant.frames.forEach((frame, index) => {
                const where = `${topicId}/${variant.label}#${index}`;
                if (!frame.caption.trim()) problems.push(`${where}: no caption`);
                const ids = frame.shapes.map(s => s.id);
                const repeated = ids.filter((id, i) => ids.indexOf(id) !== i);
                if (repeated.length) problems.push(`${where}: repeated ids ${repeated.join(', ')}`);
                for (const shape of frame.shapes) {
                    if (numbersIn(shape).some(n => !Number.isFinite(n))) problems.push(`${where}: ${shape.id} has a non-finite number`);
                    for (const key of ['fill', 'stroke', 'textColor'] as const) {
                        const value = (shape as unknown as Record<string, unknown>)[key];
                        if (typeof value === 'string' && !isColor(value)) problems.push(`${where}: ${shape.id} bad ${key} ${value}`);
                    }
                    if ((shape.opacity ?? 1) <= 0.01) continue;
                    // A little slack for strokes and arrowheads at the edge.
                    if (extent(shape, textFit).some(([x, y]) => x < -4 || y < -4 || x > w + 4 || y > h + 4)) problems.push(`${where}: ${shape.id} is outside the ${w}×${h} picture`);
                    if (textFit) {
                        const overflow = labelOverflow(shape);
                        if (overflow) problems.push(`${where}: ${shape.id} ${overflow}`);
                    }
                }
            });
        }
    }
    return problems;
};
