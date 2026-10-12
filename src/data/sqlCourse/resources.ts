import type { SqlResource } from '../sql';

// The free resources the SQL lessons point to. Links go to stable pages (a
// site's front page or a long-lived docs page); the title names the exact
// lesson, so it can be found even if a link moves.

export const sqlBolt = (lesson: string): SqlResource => ({
    kind: 'practice',
    title: `SQLBolt — ${lesson}`,
    source: 'interactive exercises in the browser, free',
    url: 'https://sqlbolt.com/',
});

export const w3 = (page: string, title: string): SqlResource => ({
    kind: 'read',
    title: `W3Schools — ${title}`,
    source: 'short page with a try-it editor, free',
    url: `https://www.w3schools.com/sql/${page}`,
});

export const modeTutorial = (lesson: string): SqlResource => ({
    kind: 'read',
    title: `Mode SQL Tutorial — ${lesson}`,
    source: 'Mode, free',
    url: 'https://mode.com/sql-tutorial/',
});

export const postgresDocs = (page: string, title: string): SqlResource => ({
    kind: 'read',
    title: `PostgreSQL docs — ${title}`,
    source: 'official documentation, free',
    url: `https://www.postgresql.org/docs/current/${page}`,
});

export const sqliteDocs = (page: string, title: string): SqlResource => ({
    kind: 'read',
    title: `SQLite docs — ${title}`,
    source: 'official documentation, free',
    url: `https://www.sqlite.org/${page}`,
});

export const watch = (query: string, title: string): SqlResource => ({
    kind: 'watch',
    title,
    source: 'YouTube search, free',
    url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`,
});

export const cs50Sql = (lecture: string): SqlResource => ({
    kind: 'watch',
    title: `CS50's Introduction to Databases with SQL — ${lecture}`,
    source: 'Harvard, free',
    url: 'https://cs50.harvard.edu/sql/',
});

export const selectStarSql: SqlResource = {
    kind: 'read',
    title: 'Select Star SQL',
    source: 'a free interactive book',
    url: 'https://selectstarsql.com/',
};

export const sqlZoo = (section: string): SqlResource => ({
    kind: 'practice',
    title: `SQLZoo — ${section}`,
    source: 'free exercises',
    url: 'https://sqlzoo.net/',
});

export const pgExercises = (section: string): SqlResource => ({
    kind: 'practice',
    title: `PostgreSQL Exercises — ${section}`,
    source: 'pgexercises.com, free',
    url: 'https://pgexercises.com/',
});

export const leetCodeSql50: SqlResource = {
    kind: 'practice',
    title: 'LeetCode — Top SQL 50 study plan',
    source: 'free account',
    url: 'https://leetcode.com/studyplan/top-sql-50/',
};

export const dataLemur = (title: string): SqlResource => ({
    kind: 'practice',
    title: `DataLemur — ${title}`,
    source: 'real interview questions, many free',
    url: 'https://datalemur.com/questions',
});

export const useTheIndexLuke: SqlResource = {
    kind: 'read',
    title: 'Use The Index, Luke — a guide to database performance for developers',
    source: 'Markus Winand, free',
    url: 'https://use-the-index-luke.com/',
};
