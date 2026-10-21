import { describe, it, expect } from 'vitest';
import { allFoundationTopics, foundationPhases, CHECK_KEYS } from '../../data/foundations';
import { foundationAnswers } from '../../data/foundationsAnswers';
import { foundationAnimations } from '../../data/foundationsAnimations';
import { tweenShapes, type Shape } from '../../components/learning/anim/scene';
import { animationProblems } from './animationChecks';

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

    it('gives every practice exercise one good answer, and none to topics that do not exist', () => {
        const ids = new Set(allFoundationTopics.map(t => t.id));
        const missing = allFoundationTopics.flatMap(topic =>
            CHECK_KEYS.filter(key => !foundationAnswers[topic.id]?.[key]?.answer.trim()).map(key => `${topic.id}: no ${key} answer`)
        );
        expect(missing).toEqual([]);
        expect(Object.keys(foundationAnswers).filter(id => !ids.has(id))).toEqual([]);
    });

    it('answers every phase question it asks', () => {
        for (const phase of foundationPhases) {
            for (const item of phase.ready) {
                expect(item.q.trim(), phase.id).not.toBe('');
                expect(item.a.trim().length, `${phase.id}: ${item.q}`).toBeGreaterThan(40);
            }
        }
    });

    it('marks at most one extra per topic as worth it, always with a reason', () => {
        for (const topic of allFoundationTopics) {
            const worth = topic.resources.filter(r => r.recommended !== undefined);
            expect(worth.length, topic.id).toBeLessThanOrEqual(1);
            for (const r of worth) expect(r.recommended!.trim().length, topic.id).toBeGreaterThan(20);
        }
    });
});

describe('foundations animations', () => {
    it('gives every lesson an animation, and none to topics that do not exist', () => {
        const ids = new Set(allFoundationTopics.map(t => t.id));
        expect(lessons.filter(t => !foundationAnimations[t.id]).map(t => t.id)).toEqual([]);
        expect(Object.keys(foundationAnimations).filter(id => !ids.has(id))).toEqual([]);
    });

    it('builds every frame from valid shapes that fit the picture', () => {
        expect(animationProblems(foundationAnimations)).toEqual([]);
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
