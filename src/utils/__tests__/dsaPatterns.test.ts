import { describe, it, expect } from 'vitest';
import { dsaCurriculum } from '../../data/dsaCurriculum';
import { dsaPatternGuides } from '../../data/dsaPatterns';
import { dsaProblemCards } from '../../data/dsaProblemCards';
import { lookAlikeTopics, patternFinders, recognitionQuestions } from '../../data/dsaRecognition';

const topics = dsaCurriculum.flatMap(phase => phase.sections.flatMap(section => section.topics));
const problemIds = topics.flatMap(topic => topic.problems.map(problem => problem.id));
const topicIds = topics.map(topic => topic.id);

describe('DSA pattern guides', () => {
    it('has a complete guide for every NeetCode topic', () => {
        expect(Object.keys(dsaPatternGuides).sort()).toEqual([...topicIds].sort());
        for (const guide of Object.values(dsaPatternGuides)) {
            for (const text of [guide.hook, guide.idea, guide.analogy, guide.breaks, guide.gutCheck, guide.template, guide.time, guide.space]) {
                expect(text.trim().length).toBeGreaterThan(0);
            }
            expect(guide.signals.length).toBeGreaterThanOrEqual(3);
            expect(guide.lookAlikes.length).toBeGreaterThanOrEqual(2);
            expect(guide.mistakes.length).toBeGreaterThanOrEqual(2);
            expect(guide.diagram.code.trim()).not.toBe('');
            expect(guide.diagram.caption.trim()).not.toBe('');
        }
    });

    it('has two traced examples per topic, with every row matching its columns', () => {
        for (const guide of Object.values(dsaPatternGuides)) {
            for (const example of [guide.easy, guide.medium]) {
                expect(example.rows.length).toBeGreaterThan(0);
                for (const row of example.rows) expect(row).toHaveLength(example.columns.length);
                expect(example.result.trim()).not.toBe('');
                expect(example.insight.trim()).not.toBe('');
            }
        }
    });
});

describe('DSA problem cards', () => {
    it('has a card for every one of the 150 problems, and no extras', () => {
        expect(problemIds).toHaveLength(150);
        expect(Object.keys(dsaProblemCards).sort()).toEqual([...problemIds].sort());
    });

    it('fills in every field, and only accepts real topics as alternatives', () => {
        for (const card of Object.values(dsaProblemCards)) {
            expect(card.summary.trim()).not.toBe('');
            expect(card.technique.trim()).not.toBe('');
            expect(card.clue.trim()).not.toBe('');
            expect(card.trick.trim()).not.toBe('');
            for (const id of card.alsoAccept ?? []) expect(topicIds).toContain(id);
        }
    });
});

describe('recognition aids', () => {
    it('has the two finder diagrams, the three questions, and look-alikes for every topic', () => {
        expect(patternFinders).toHaveLength(2);
        expect(recognitionQuestions).toHaveLength(3);
        expect(Object.keys(lookAlikeTopics).sort()).toEqual([...topicIds].sort());
        for (const [topic, others] of Object.entries(lookAlikeTopics)) {
            expect(others).not.toContain(topic);
            for (const id of others) expect(topicIds).toContain(id);
        }
    });
});
