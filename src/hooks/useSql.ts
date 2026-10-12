import { useEffect, useState } from 'react';
import { subscribeToSql, saveSqlCheck } from '../services/firebaseService';
import type { SqlProgress } from '../services/firebaseService';
import type { SqlCheckKey } from '../data/sql';

const EMPTY: SqlProgress = { checks: {} };

/**
 * The moving part of the SQL course: which checks are ticked.
 * The content itself is static and imported by the page directly.
 */
export const useSql = () => {
    const [progress, setProgress] = useState<SqlProgress>(EMPTY);

    useEffect(() => subscribeToSql(setProgress), []);

    const toggleCheck = async (topicId: string, check: SqlCheckKey) => {
        const current = progress.checks[topicId]?.[check] === true;
        await saveSqlCheck(topicId, check, !current);
    };

    return { progress, toggleCheck };
};
