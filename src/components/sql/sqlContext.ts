import { createContext, useContext } from 'react';
import type { SqlQueriesStore } from '../../hooks/useSqlQueries';

// Shared by the SQL page's run boxes (SqlParts.tsx). The components live in
// the .tsx file; the contexts live here.

/** The saved-queries store, given by the SQL page. Without it, a run box still runs but saves nothing. */
export const SqlQueriesContext = createContext<SqlQueriesStore | null>(null);
export const useSqlQueriesStore = () => useContext(SqlQueriesContext);

/** The topic whose card a run box sits in, so a saved query says where it was run. */
export const SqlTopicContext = createContext<{ topicId: string; topicName: string } | null>(null);
export const useSqlTopic = () => useContext(SqlTopicContext);
