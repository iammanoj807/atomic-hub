// Built-in interview answers live in Firestore once seeded, so editing
// defaultTasks.ts alone changes nothing on screen. This works out which
// stored documents are behind CONTENT_VERSION and what to write to them.
//
// Matching is by title + category (the same key the duplicate cleanup uses),
// with PREVIOUS_TITLES covering questions that were renamed. Questions you
// added yourself never match, so they are left alone; a built-in question
// with no stored match is skipped rather than re-added, in case you deleted
// it on purpose.

import type { DefaultTask } from '../data/defaultTasks';

export interface StoredTask {
    id: string;
    title: string;
    category: string;
    description?: string;
    memoryPoints?: string[];
    contentVersion?: number;
    previousDescription?: string;
}

export interface ContentUpdate {
    docId: string;
    title: string;
    description: string;
    memoryPoints: string[];
    /** null means the question no longer belongs to a core story. */
    coreStoryId: string | null;
    contentVersion: number;
    /**
     * The text being replaced, kept on the document so nothing is lost. Only
     * set by the first sync, so the backup is always your original answer.
     */
    previousDescription?: string;
    previousMemoryPoints?: string[];
}

const key = (title: string, category: string) =>
    `${title.trim().toLowerCase()}::${category.trim().toLowerCase()}`;

export const planContentSync = (
    stored: StoredTask[],
    defaults: DefaultTask[],
    version: number,
    previousTitles: Record<string, string[]> = {}
): ContentUpdate[] => {
    const byKey = new Map<string, StoredTask>();
    for (const task of stored) {
        const k = key(task.title || '', task.category || '');
        if (!byKey.has(k)) byKey.set(k, task);
    }

    const updates: ContentUpdate[] = [];
    for (const def of defaults) {
        const titles = [def.title, ...(previousTitles[def.id] ?? [])];
        const match = titles
            .map(title => byKey.get(key(title, def.category)))
            .find(Boolean);
        if (!match || (match.contentVersion ?? 0) >= version) continue;

        updates.push({
            docId: match.id,
            title: def.title,
            description: def.description,
            memoryPoints: def.memoryPoints ?? [],
            coreStoryId: def.coreStoryId ?? null,
            contentVersion: version,
            ...(match.previousDescription === undefined && {
                previousDescription: match.description ?? '',
                previousMemoryPoints: match.memoryPoints ?? [],
            }),
        });
    }
    return updates;
};
