import { describe, it, expect } from 'vitest';
import { planContentSync, type StoredTask } from '../contentSync';
import type { DefaultTask } from '../../data/defaultTasks';
import { defaultTasks, CONTENT_VERSION, PREVIOUS_TITLES } from '../../data/defaultTasks';

const def = (overrides: Partial<DefaultTask> = {}): DefaultTask => ({
    id: 'ta_1',
    title: 'Biggest achievement?',
    description: 'New answer',
    category: 'Tech Achievements',
    memoryPoints: ['new point'],
    coreStoryId: 'performance-fix',
    ...overrides,
});

const stored = (overrides: Partial<StoredTask> = {}): StoredTask => ({
    id: 'doc1',
    title: 'Biggest achievement?',
    category: 'Tech Achievements',
    description: 'Old answer',
    memoryPoints: ['old point'],
    ...overrides,
});

describe('planContentSync', () => {
    it('rewrites a stored built-in answer and keeps the old text', () => {
        const [update] = planContentSync([stored()], [def()], 2);
        expect(update).toMatchObject({
            docId: 'doc1',
            description: 'New answer',
            memoryPoints: ['new point'],
            coreStoryId: 'performance-fix',
            contentVersion: 2,
            previousDescription: 'Old answer',
            previousMemoryPoints: ['old point'],
        });
    });

    it('keeps the first backup when a later version syncs again', () => {
        const [update] = planContentSync(
            [stored({ contentVersion: 2, previousDescription: 'Original answer' })],
            [def()],
            3
        );
        expect(update.description).toBe('New answer');
        expect(update).not.toHaveProperty('previousDescription');
        expect(update).not.toHaveProperty('previousMemoryPoints');
    });

    it('matches title and category ignoring case and spacing', () => {
        const updates = planContentSync(
            [stored({ title: '  biggest ACHIEVEMENT? ', category: 'tech achievements' })],
            [def()],
            2
        );
        expect(updates).toHaveLength(1);
    });

    it('runs only once per version', () => {
        expect(planContentSync([stored({ contentVersion: 2 })], [def()], 2)).toEqual([]);
    });

    it('finds a renamed question under its old title and renames it', () => {
        const [update] = planContentSync(
            [stored({ title: 'Old title?' })],
            [def({ title: 'New title?' })],
            2,
            { ta_1: ['Old title?'] }
        );
        expect(update.docId).toBe('doc1');
        expect(update.title).toBe('New title?');
    });

    it('clears the core story when the new answer has none', () => {
        const [update] = planContentSync([stored()], [def({ coreStoryId: undefined })], 2);
        expect(update.coreStoryId).toBeNull();
    });

    it('leaves your own questions alone and does not re-add deleted ones', () => {
        const updates = planContentSync(
            [stored({ title: 'My own question', category: 'Company Questions' })],
            [def()],
            2
        );
        expect(updates).toEqual([]);
    });
});

describe('the shipped answers', () => {
    it('every renamed question points at a real built-in id', () => {
        const ids = new Set(defaultTasks.map(t => t.id));
        for (const id of Object.keys(PREVIOUS_TITLES)) expect(ids.has(id)).toBe(true);
    });

    it('titles are unique within a category, so matching is unambiguous', () => {
        const keys = defaultTasks.map(t => `${t.title.toLowerCase()}::${t.category}`);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('content version is past the original seed', () => {
        expect(CONTENT_VERSION).toBeGreaterThan(1);
    });
});
