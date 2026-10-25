import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteSqlQuery, saveSqlQuery, subscribeToSqlQueries } from '../services/firebaseService';
import { newQueryId, planSave, type SavedSqlQueries, type SavedSqlQuery } from '../utils/sqlQueries';

/**
 * The queries you have run on the SQL page, kept in Firestore so the phone and
 * the browser see the same list. A failed save is logged, never shown as a
 * failed run: the query has already run.
 */
export const useSqlQueries = () => {
    const [queries, setQueries] = useState<SavedSqlQueries>({});

    useEffect(() => subscribeToSqlQueries(setQueries), []);

    const save = useCallback((run: SavedSqlQuery) => {
        const plan = planSave(queries, run, newQueryId());
        saveSqlQuery(plan.id, plan.entry, plan.remove).catch(error => console.error('❌ Failed to save SQL query:', error));
    }, [queries]);

    const remove = useCallback((id: string) => {
        deleteSqlQuery(id).catch(error => console.error('❌ Failed to delete SQL query:', error));
    }, []);

    return useMemo(() => ({ queries, save, remove }), [queries, save, remove]);
};

export type SqlQueriesStore = ReturnType<typeof useSqlQueries>;
