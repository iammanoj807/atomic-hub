import { useState, useEffect } from 'react';
import {
    subscribeToPracticeRecords,
    savePracticeRecord,
} from '../services/firebaseService';
import type { PracticeRecord } from '../services/firebaseService';
import { getLondonDateString } from '../utils/date';

/**
 * Practice tracking.
 */
export const usePractice = () => {
    const [practiceRecords, setPracticeRecords] = useState<Record<string, PracticeRecord>>({});

    useEffect(() => {
        const unsubscribe = subscribeToPracticeRecords(setPracticeRecords);
        return () => unsubscribe();
    }, []);

    const recordPractice = async (questionId: string, confidence: 1 | 2 | 3) => {
        const existing = practiceRecords[questionId];

        await savePracticeRecord({
            questionId,
            reps: (existing?.reps ?? 0) + 1,
            lastPractisedAt: getLondonDateString(),
            confidence,
        });
    };

    return {
        practiceRecords,
        recordPractice,
    };
};
