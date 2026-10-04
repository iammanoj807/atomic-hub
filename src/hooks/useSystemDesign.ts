import { useEffect, useState } from 'react';
import { subscribeToSystemDesign, saveSystemDesignCheck } from '../services/firebaseService';
import type { SystemDesignProgress } from '../services/firebaseService';
import type { SDCheckKey } from '../data/systemDesign';

const EMPTY: SystemDesignProgress = { checks: {} };

/**
 * The moving part of System Design: which checks are ticked.
 * The content itself is static and imported by the page directly.
 */
export const useSystemDesign = () => {
    const [progress, setProgress] = useState<SystemDesignProgress>(EMPTY);

    useEffect(() => subscribeToSystemDesign(setProgress), []);

    const toggleCheck = async (topicId: string, check: SDCheckKey) => {
        const current = progress.checks[topicId]?.[check] === true;
        await saveSystemDesignCheck(topicId, check, !current);
    };

    return { progress, toggleCheck };
};
