import { describe, it, expect } from 'vitest';
import type { InterviewSet } from '../../data/interviewPrep/types';
import { genAiInterviewSet } from '../../data/interviewPrep/genai';
import { mlInterviewSet } from '../../data/interviewPrep/ml';
import { sqlInterviewSet } from '../../data/interviewPrep/sql';
import { systemDesignInterviewSet } from '../../data/interviewPrep/systemDesign';
import { dsaInterviewSet } from '../../data/interviewPrep/dsa';
import { allFoundationTopics } from '../../data/foundations';
import { allSqlTopics } from '../../data/sql';
import { allSystemDesignTopics } from '../../data/systemDesign';
import { dsaCurriculum } from '../../data/dsaCurriculum';

// Each set is shown on one study page, so its links must point at that page's lessons.
const dsaTopicIds = dsaCurriculum.flatMap(phase => phase.sections.flatMap(section => section.topics.map(topic => topic.id)));
const pages: [InterviewSet, Set<string>][] = [
    [genAiInterviewSet, new Set(allFoundationTopics.map(t => t.id))],
    [mlInterviewSet, new Set(allFoundationTopics.map(t => t.id))],
    [sqlInterviewSet, new Set(allSqlTopics.map(t => t.id))],
    [systemDesignInterviewSet, new Set(allSystemDesignTopics.map(t => t.id))],
    [dsaInterviewSet, new Set(dsaTopicIds)],
];
const all = pages.flatMap(([set]) => set.questions);

describe('interview questions', () => {
    it('gives every question an id of its own', () => {
        const ids = all.map(q => q.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('answers every question in full: answer, analogy, strong points, traps and follow-ups', () => {
        const problems: string[] = [];
        for (const q of all) {
            if (!q.q.trim()) problems.push(`${q.id}: no question`);
            if (q.answer.trim().length < 200) problems.push(`${q.id}: the spoken answer is too short`);
            if (!q.analogy.trim()) problems.push(`${q.id}: no analogy`);
            if (!q.testing.trim()) problems.push(`${q.id}: no "they are checking"`);
            if (q.strong.length < 2) problems.push(`${q.id}: fewer than 2 strong points`);
            if (q.traps.length < 1) problems.push(`${q.id}: no traps`);
            if (q.followUps.length < 2) problems.push(`${q.id}: fewer than 2 follow-ups`);
            for (const f of q.followUps) if (!f.q.trim() || !f.a.trim()) problems.push(`${q.id}: a follow-up without an answer`);
            if (q.diagram && (!q.diagram.code.trim() || !q.diagram.caption.trim())) problems.push(`${q.id}: diagram without code or caption`);
        }
        expect(problems).toEqual([]);
    });

    it('links every question to lessons that exist on its own page', () => {
        const problems: string[] = [];
        for (const [set, topics] of pages) {
            for (const q of set.questions) {
                if (q.topicIds.length === 0) problems.push(`${q.id}: no lessons linked`);
                for (const id of q.topicIds) if (!topics.has(id)) problems.push(`${q.id}: no lesson ${id} on the ${set.id} page`);
            }
        }
        expect(problems).toEqual([]);
    });

    it('includes the five RAG failure questions', () => {
        const ids = genAiInterviewSet.questions.map(q => q.id);
        for (const id of ['ai-rag-sudden', 'ai-rag-good-docs-bad-answer', 'ai-rag-embeddings-eval', 'ai-rag-five-docs', 'ai-rag-million-docs']) {
            expect(ids).toContain(id);
        }
    });
});
