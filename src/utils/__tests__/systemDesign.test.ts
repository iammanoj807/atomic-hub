import { describe, it, expect } from 'vitest';
import {
    systemDesignPhases,
    allSystemDesignTopics,
    SD_CHECK_KEYS,
    SD_RESOURCE_KIND_ORDER,
    SD_PRIORITY_LABELS,
} from '../../data/systemDesign';

describe('system design content', () => {
    it('gives every topic a definition, interview notes, practice and resources', () => {
        const problems: string[] = [];
        for (const t of allSystemDesignTopics) {
            if (!t.name.trim() || !t.definition.trim()) problems.push(`${t.id}: missing name or definition`);
            if (!t.problem.trim()) problems.push(`${t.id}: missing the problem it solves`);
            if (t.mistakes.length < 2) problems.push(`${t.id}: fewer than 2 common mistakes`);
            if (!(t.priority in SD_PRIORITY_LABELS)) problems.push(`${t.id}: bad priority`);
            if (!t.interviewAnswer.trim()) problems.push(`${t.id}: no interview answer`);
            if (t.followUps.length === 0) problems.push(`${t.id}: no follow-up questions`);
            for (const f of t.followUps) {
                if (!f.q.trim() || !f.a.trim()) problems.push(`${t.id}: follow-up missing a question or answer`);
            }
            for (const key of SD_CHECK_KEYS) {
                if (!t.practice[key]?.trim()) problems.push(`${t.id}: no ${key} exercise`);
            }
            if (t.resources.filter(r => r.kind !== 'paper').length < 2) problems.push(`${t.id}: fewer than 2 free non-paper resources`);
            for (const r of t.resources) {
                if (!SD_RESOURCE_KIND_ORDER.includes(r.kind)) problems.push(`${t.id}: unknown resource kind`);
                if (r.url && !/^https?:\/\//.test(r.url)) problems.push(`${t.id}: bad url ${r.url}`);
                if (/paid|book you own/i.test(r.source)) problems.push(`${t.id}: non-free resource ${r.title}`);
            }
            if (t.kind === 'concept') {
                for (const field of [t.idea, t.analogy, t.breaks, t.example]) {
                    if (!field.trim()) problems.push(`${t.id}: empty explanation field`);
                }
                if (t.keyPoints.length < 3) problems.push(`${t.id}: fewer than 3 key points`);
                if (t.howItWorks.length < 3) problems.push(`${t.id}: fewer than 3 how-it-works steps`);
            } else {
                if (t.functional.length === 0 || t.nonFunctional.length === 0) problems.push(`${t.id}: missing requirements`);
                if (t.design.length === 0 || t.deepDives.length === 0) problems.push(`${t.id}: missing design or deep dives`);
                if (t.evolution.length < 3) problems.push(`${t.id}: fewer than 3 evolution steps`);
                if (t.designType === 'lld' && !t.classes?.length) problems.push(`${t.id}: LLD design without classes`);
            }
        }
        expect(problems).toEqual([]);
    });

    it('keeps ids unique, because they are the Firestore keys', () => {
        const ids = allSystemDesignTopics.map(t => t.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('has the full roadmap: 10 phases, 71 topics', () => {
        expect(systemDesignPhases).toHaveLength(10);
        expect(allSystemDesignTopics).toHaveLength(71);
        systemDesignPhases.forEach((phase, index) => {
            expect(phase.number).toBe(index);
            expect(phase.topics.length).toBeGreaterThan(0);
        });
    });
});
