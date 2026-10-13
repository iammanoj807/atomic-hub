import { describe, it, expect } from 'vitest';
import { allFoundationTopics } from '../../data/foundations';
import { foundationAnimations } from '../../data/foundationsAnimations';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH, isColor, tweenShapes, type Shape } from '../../components/learning/anim/scene';

const lessons = allFoundationTopics;

describe('foundations lessons', () => {
    it('gives every topic the whole lesson', () => {
        const problems: string[] = [];
        for (const topic of lessons) {
            if (!topic.definition.trim()) problems.push(`${topic.id}: no definition`);
            if (!topic.problem.trim()) problems.push(`${topic.id}: no problem`);
            if (topic.howItWorks.length < 4) problems.push(`${topic.id}: fewer than 4 steps`);
            if (topic.keyPoints.length < 4) problems.push(`${topic.id}: fewer than 4 key points`);
            if (topic.mistakes.length < 3) problems.push(`${topic.id}: fewer than 3 mistakes`);
            if (topic.followUps.length < 3) problems.push(`${topic.id}: fewer than 3 questions`);
            for (const item of topic.followUps) {
                if (!item.q.trim() || !item.a.trim()) problems.push(`${topic.id}: question without an answer`);
            }
            if (!topic.note.example?.trim()) problems.push(`${topic.id}: no worked example`);
        }
        expect(problems).toEqual([]);
    });

    it('marks at most one extra per topic as worth it, always with a reason', () => {
        for (const topic of allFoundationTopics) {
            const worth = topic.resources.filter(r => r.recommended !== undefined);
            expect(worth.length, topic.id).toBeLessThanOrEqual(1);
            for (const r of worth) expect(r.recommended!.trim().length, topic.id).toBeGreaterThan(20);
        }
    });
});

const numbersIn = (shape: Shape): number[] => {
    const values: number[] = [];
    for (const value of Object.values(shape)) {
        if (typeof value === 'number') values.push(value);
        if (Array.isArray(value)) value.forEach(p => values.push(...p));
    }
    return values;
};

/** The points a shape covers, for the "inside the picture" check. */
const extent = (shape: Shape): [number, number][] => {
    switch (shape.kind) {
        case 'rect': return [[shape.x, shape.y], [shape.x + shape.w, shape.y + shape.h]];
        case 'circle': return [[shape.x - shape.r, shape.y - shape.r], [shape.x + shape.r, shape.y + shape.r]];
        case 'line': return [[shape.x1, shape.y1], [shape.x2, shape.y2]];
        case 'path': return shape.points;
        case 'text': return [[shape.x, shape.y]];
    }
};

describe('foundations animations', () => {
    it('gives every lesson an animation, and none to topics that do not exist', () => {
        const ids = new Set(allFoundationTopics.map(t => t.id));
        expect(lessons.filter(t => !foundationAnimations[t.id]).map(t => t.id)).toEqual([]);
        expect(Object.keys(foundationAnimations).filter(id => !ids.has(id))).toEqual([]);
    });

    it('builds every frame from valid shapes that fit the picture', () => {
        const problems: string[] = [];
        for (const [topicId, build] of Object.entries(foundationAnimations)) {
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
                        // A little slack for strokes and arrowheads at the edge.
                        if (extent(shape).some(([x, y]) => x < -4 || y < -4 || x > w + 4 || y > h + 4)) problems.push(`${where}: ${shape.id} is outside the ${w}×${h} picture`);
                    }
                });
            }
        }
        expect(problems).toEqual([]);
    });
});

describe('tweening', () => {
    const a: Shape[] = [
        { kind: 'circle', id: 'moves', x: 0, y: 0, r: 10, fill: '#000000' },
        { kind: 'text', id: 'leaves', x: 0, y: 0, text: 'bye' },
    ];
    const b: Shape[] = [
        { kind: 'circle', id: 'moves', x: 100, y: 50, r: 20, fill: '#ffffff' },
        { kind: 'text', id: 'arrives', x: 0, y: 0, text: 'hi' },
    ];

    it('moves shared shapes, fades out leavers and fades in arrivals', () => {
        const half = tweenShapes(a, b, 0.5);
        const moving = half.find(s => s.id === 'moves');
        expect(moving).toMatchObject({ x: 50, y: 25, r: 15, fill: '#808080ff' });
        expect(half.find(s => s.id === 'leaves')?.opacity).toBeCloseTo(0.5);
        expect(half.find(s => s.id === 'arrives')?.opacity).toBeCloseTo(0.5);
    });

    it('lands exactly on the next frame', () => {
        expect(tweenShapes(a, b, 1)).toBe(b);
    });
});
