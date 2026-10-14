import { describe, it, expect } from 'vitest';
import { dsaCurriculum } from '../../data/dsaCurriculum';
import { dsaPatternGuides } from '../../data/dsaPatterns';
import { dsaAnimationResults, dsaAnimations } from '../../data/dsaAnimations';
import { allSqlTopics } from '../../data/sql';
import { sqlAnimationChecks, sqlAnimations, sqlNoAnimation } from '../../data/sqlAnimations';
import { systemDesignPhases } from '../../data/systemDesign';
import { systemDesignAnimations, systemDesignForbidden, systemDesignNoAnimation } from '../../data/systemDesignAnimations';
import type { AnimationSpec } from '../../components/learning/anim/scene';
import { animationProblems } from './animationChecks';

const dsaTopicIds = dsaCurriculum.flatMap(phase => phase.sections.flatMap(section => section.topics.map(topic => topic.id)));

describe('DSA animations', () => {
    it('gives every topic an animation, and none to topics that do not exist', () => {
        const ids = new Set(dsaTopicIds);
        expect(dsaTopicIds.filter(id => !dsaAnimations[id])).toEqual([]);
        expect(Object.keys(dsaAnimations).filter(id => !ids.has(id))).toEqual([]);
    });

    it('builds every frame from valid shapes that fit the picture', () => {
        expect(animationProblems(dsaAnimations, { textFit: true })).toEqual([]);
    });

    it('reaches the same answer as the lesson\'s traced examples', () => {
        const wrong: string[] = [];
        for (const [id, results] of Object.entries(dsaAnimationResults)) {
            const guide = dsaPatternGuides[id];
            for (const level of ['easy', 'medium'] as const) {
                const got = results[level]();
                if (got !== guide[level].result) wrong.push(`${id} ${level}: animation says ${got}, trace says ${guide[level].result}`);
            }
        }
        expect(Object.keys(dsaAnimationResults).sort()).toEqual(Object.keys(dsaAnimations).sort());
        expect(wrong).toEqual([]);
    });
});

describe('SQL animations', () => {
    it('animates every topic, or says why not — and nothing else', () => {
        const ids = new Set(allSqlTopics.map(t => t.id));
        expect(allSqlTopics.filter(t => !sqlAnimations[t.id] && !sqlNoAnimation[t.id]).map(t => t.id)).toEqual([]);
        expect(Object.keys(sqlAnimations).filter(id => sqlNoAnimation[id])).toEqual([]);
        expect([...Object.keys(sqlAnimations), ...Object.keys(sqlNoAnimation)].filter(id => !ids.has(id))).toEqual([]);
    });

    it('never animates an interview problem, whose solution is hidden', () => {
        expect(allSqlTopics.filter(t => t.kind === 'problem' && sqlAnimations[t.id]).map(t => t.id)).toEqual([]);
    });

    it('builds every frame from valid shapes that fit the picture', () => {
        expect(animationProblems(sqlAnimations, { textFit: true })).toEqual([]);
    });

    it('ends on the same rows as the lesson\'s worked example', () => {
        const wrong: string[] = [];
        for (const [id, checks] of Object.entries(sqlAnimationChecks)) {
            const topic = allSqlTopics.find(t => t.id === id);
            if (!topic || topic.kind !== 'lesson') {
                wrong.push(`${id}: not a lesson`);
                continue;
            }
            for (const { example, rows } of checks()) {
                const expected = topic.examples[example]?.result?.rows;
                if (!expected) wrong.push(`${id}: example ${example} has no result`);
                else if (JSON.stringify(rows) !== JSON.stringify(expected)) wrong.push(`${id} example ${example}: animation ${JSON.stringify(rows)} vs lesson ${JSON.stringify(expected)}`);
            }
        }
        expect(wrong).toEqual([]);
    });
});

/** Every piece of text an animation shows: title, variant names, captions and labels. */
const textsOf = (spec: AnimationSpec): string[] => [
    spec.title,
    ...spec.variants.flatMap(v => [v.label, ...v.frames.flatMap(f => [f.caption, ...f.shapes.flatMap(s => ('text' in s && typeof s.text === 'string' ? [s.text] : []))])]),
];

describe('System Design animations', () => {
    const topics = systemDesignPhases.flatMap(p => p.topics);

    it('animates every topic, or says why not — and nothing else', () => {
        const ids = new Set(topics.map(t => t.id));
        expect(topics.filter(t => !systemDesignAnimations[t.id] && !systemDesignNoAnimation[t.id]).map(t => t.id)).toEqual([]);
        expect(Object.keys(systemDesignAnimations).filter(id => systemDesignNoAnimation[id])).toEqual([]);
        expect([...Object.keys(systemDesignAnimations), ...Object.keys(systemDesignNoAnimation), ...Object.keys(systemDesignForbidden)].filter(id => !ids.has(id))).toEqual([]);
    });

    it('builds every frame from valid shapes that fit the picture', () => {
        expect(animationProblems(systemDesignAnimations, { textFit: true })).toEqual([]);
    });

    it('never shows what a practice question asks the learner to work out', () => {
        const leaks: string[] = [];
        for (const [id, words] of Object.entries(systemDesignForbidden)) {
            const build = systemDesignAnimations[id];
            if (!build) continue;
            const texts = textsOf(build());
            for (const word of words) if (texts.some(t => t.includes(word))) leaks.push(`${id}: shows "${word}"`);
        }
        expect(leaks).toEqual([]);
    });
});
