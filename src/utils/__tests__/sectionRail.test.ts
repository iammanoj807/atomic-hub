import { describe, it, expect } from 'vitest';
import { currentSection, headingToSentence } from '../../components/learning/learning';

describe('the section rail', () => {
    it('turns a step heading into a sentence', () => {
        expect(headingToSentence('STEP 3 · PRACTISE, IN THIS ORDER')).toBe('Step 3 · Practise, in this order');
        expect(headingToSentence('STEP 2 · GO FURTHER (FREE, OPTIONAL)')).toBe('Step 2 · Go further (free, optional)');
        expect(headingToSentence('STEP 4 · INTERVIEW-READY, THEN PROVE IT')).toBe('Step 4 · Interview-ready, then prove it');
    });

    it('picks the last section whose top has passed the line', () => {
        expect(currentSection([-500, -20, 300, 900], 120)).toBe(1);
        expect(currentSection([-500, -20, 100, 900], 120)).toBe(2);
    });

    it('is above every section at the top of the page', () => {
        expect(currentSection([200, 600], 120)).toBe(-1);
        expect(currentSection([], 120)).toBe(-1);
    });

    it('counts the last section at the bottom of the page, however short it is', () => {
        expect(currentSection([-900, -300, 500], 120, true)).toBe(2);
        expect(currentSection([], 120, true)).toBe(-1);
    });
});
