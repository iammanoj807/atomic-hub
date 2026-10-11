import { describe, it, expect } from 'vitest';
import { interviewGlossary } from '../interviewGlossary';
import { interviewGlossaryTerms } from '../../data/interviewGlossary';
import { defaultTasks } from '../../data/defaultTasks';

const answer = (id: string) => defaultTasks.find(t => t.id === id)!.description;
const termsIn = (id: string) => interviewGlossary.termsInText(answer(id));

describe('interview glossary', () => {
    it('has unique ids', () => {
        const ids = interviewGlossaryTerms.map(t => t.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('every word is used in at least one built-in answer', () => {
        const used = new Set(defaultTasks.flatMap(t => interviewGlossary.termsInText(t.description)));
        const unused = interviewGlossaryTerms.filter(t => !used.has(t.id)).map(t => t.id);
        expect(unused).toEqual([]);
    });

    it('explains the hard words in the Accenture story', () => {
        expect(termsIn('ta_1')).toEqual(expect.arrayContaining(['p95', 'n-plus-one', 'api', 'spring-boot', 'data-access-layer']));
    });

    it('explains the hard words in the FruitGuard story, even where they are said plainly', () => {
        expect(termsIn('ta_2')).toEqual(
            expect.arrayContaining(['yolo', 'transfer-learning', 'class-imbalance', 'inverse-frequency', 'map', 'precision', 'onnx', 'fps'])
        );
    });

    it('explains the hard words in the Planck AI story', () => {
        expect(termsIn('ta_3')).toEqual(
            expect.arrayContaining(['agent', 'agent-framework', 'agent-loop', 'provider', 'three-providers', 'git', 'rubric'])
        );
    });

    it('prefers the longer phrase, and does not match inside other words', () => {
        const segments = interviewGlossary.segmentText('Our REST APIs and the agent loop live on GitHub.');
        const marked = segments.filter(s => s.termId).map(s => [s.text, s.termId]);
        expect(marked).toEqual([
            ['REST APIs', 'api'],
            ['agent loop', 'agent-loop'],
            ['GitHub', 'github'],
        ]);
    });
});
