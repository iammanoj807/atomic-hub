import { useState, useEffect } from 'react';
import {
    subscribeToEvidenceLog,
    saveEvidenceEntry,
    deleteEvidenceEntry,
} from '../services/firebaseService';
import type { EvidenceEntry, EvidenceTag } from '../services/firebaseService';
import { getLondonDateString } from '../utils/date';

/**
 * The Evidence Log: one line per London day.
 *
 * Subscribes independently of the main app-loading gate, because nothing on
 * screen should wait for it.
 */
export const useEvidenceLog = () => {
    const [evidenceEntries, setEvidenceEntries] = useState<EvidenceEntry[]>([]);

    useEffect(() => {
        const unsubscribe = subscribeToEvidenceLog(setEvidenceEntries);
        return () => unsubscribe();
    }, []);

    const todayEvidence =
        evidenceEntries.find(e => e.date === getLondonDateString()) ?? null;

    const saveEvidence = async (text: string, tag?: EvidenceTag, date?: string) => {
        const entryDate = date ?? getLondonDateString();
        const existing = evidenceEntries.find(e => e.date === entryDate);

        await saveEvidenceEntry({
            date: entryDate,
            text: text.trim(),
            tag,
            // Editing a line keeps the moment it was first written.
            createdAt: existing?.createdAt ?? new Date().toISOString(),
        });
    };

    const deleteEvidence = async (date: string) => {
        await deleteEvidenceEntry(date);
    };

    return { evidenceEntries, todayEvidence, saveEvidence, deleteEvidence };
};
