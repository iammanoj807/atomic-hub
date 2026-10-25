// SQL — from your first SELECT to interview-ready, in small steps.
//
// Nine phases. Every lesson has:
//   - a one-line definition, the problem it solves, the idea in plain words,
//     an analogy and where it breaks, the syntax, and how it works step by step,
//   - a diagram, and worked examples on the practice database (sqlPracticeDb.ts)
//     with the exact rows they return — a test runs every one and checks them,
//   - must-know points, common mistakes, and where MySQL, PostgreSQL and
//     SQL Server differ from the SQLite used here,
//   - a spoken interview answer and follow-up questions WITH answers,
//   - one practice exercise for each of the four checks, each with one good
//     answer (sqlAnswers/) that stays hidden until asked for — a test runs every
//     answer query and checks the rows it shows — and free resources.
// The last phase is interview problems: the question, how to spot its pattern,
// the approach, then a hidden solution.
//
// Every technical word is explained in sqlGlossary.ts. In the prose, `backticks`
// mark inline SQL; it is shown in a code font and never underlined.
//
// Fixed content only. Ticked checks live in Firestore under study_progress/sql.

import type { SqlCell } from './sqlPracticeDb';
import { sqlPhase0 } from './sqlCourse/phase0';
import { sqlPhase1 } from './sqlCourse/phase1';
import { sqlPhase2 } from './sqlCourse/phase2';
import { sqlPhase3 } from './sqlCourse/phase3';
import { sqlPhase4 } from './sqlCourse/phase4';
import { sqlPhase5 } from './sqlCourse/phase5';
import { sqlPhase6 } from './sqlCourse/phase6';
import { sqlPhase7 } from './sqlCourse/phase7';
import { sqlPhase8 } from './sqlCourse/phase8';

export type { SqlCell };

export type SqlCheckKey = 'explain' | 'write' | 'predict' | 'edge';

/** The order the checks are shown, practised and ticked in. */
export const SQL_CHECK_KEYS: SqlCheckKey[] = ['explain', 'write', 'predict', 'edge'];

export const SQL_CHECK_LABELS: Record<SqlCheckKey, string> = {
    explain: 'Explain',
    write: 'Write',
    predict: 'Predict',
    edge: 'Edge cases',
};

export const SQL_CHECK_MEANINGS: Record<SqlCheckKey, string> = {
    explain: 'Say what it does and when to use it, in plain words, with no notes.',
    write: 'Write the query from a blank page, then run it to check.',
    predict: 'Read a query and say which rows it returns before you run it.',
    edge: 'Say what happens with NULLs, ties, duplicates or no rows at all, and fix it.',
};

export const SQL_CONFIDENT_RULE =
    'A topic is finished when you pass all four checks, not when you have read it. ' +
    'Be strict: if you had to look at the notes, it is not ticked yet.';

export type SqlPriority = 'must' | 'should' | 'bonus';

export const SQL_PRIORITY_LABELS: Record<SqlPriority, string> = {
    must: 'Must know',
    should: 'Should know',
    bonus: 'Bonus',
};

export type SqlDifficulty = 'easy' | 'medium' | 'hard';

export const SQL_DIFFICULTY_LABELS: Record<SqlDifficulty, string> = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard',
};

/** Suggested way through the course. */
export const sqlHowToStudy: string[] = [
    'Go in order. Each phase uses the ones before it, and the practice database stays the same all the way through.',
    'Open "The practice database" once and look at the six tables. Every example uses them, so you will soon know the rows by heart — that is what lets you check answers by eye.',
    'Type every example yourself before you look at the result. Press "Try it", change something small, and run it again. Reading SQL is not the same as writing it.',
    'Before you run any query, say out loud what you expect it to return. That is the Predict check, and it is the fastest way to find gaps.',
    'The notes on every topic are enough on their own. The free resources are a second explanation and extra practice.',
    'Phases 0–3 are the core: most real work and most interview questions use only these. Phases 4–5 (subqueries, CTEs, window functions) are what separates a pass from a strong pass.',
    'Interview soon? Learn every "Must know" topic, then do Phase 8 twice: once with the hints, once from a blank page. Use Revise mode the night before.',
];

export type SqlResourceKind = 'watch' | 'read' | 'practice';

export const SQL_RESOURCE_KIND_ORDER: SqlResourceKind[] = ['watch', 'read', 'practice'];

export interface SqlResource {
    kind: SqlResourceKind;
    /** The exact title, so it stays findable even if a link moves. */
    title: string;
    source: string;
    /** A stable link, or a search link where the exact page is likely to move. Every resource is free. */
    url?: string;
}

/** A picture of the idea, in Mermaid syntax, and a sentence on how to read it. */
export interface SqlDiagram {
    code: string;
    caption: string;
}

export interface SqlFollowUp {
    q: string;
    a: string;
}

export interface SqlResultTable {
    columns: string[];
    rows: SqlCell[][];
}

/**
 * A query run on the practice database, with the exact rows it returns — or,
 * for a query the database must refuse, the error it gives. A test checks every one.
 */
export interface SqlExample {
    /** What this example shows, in a few words. */
    title: string;
    sql: string;
    /** The rows it returns. Every example has this or `error`, never both. */
    result?: SqlResultTable;
    /** Part of the database's error message, for an example that is meant to fail. */
    error?: string;
    /** What to notice in the result. */
    note?: string;
}

interface SqlTopicBase {
    /** Stable id, used as the Firestore key. Never renumber: ids need not match display order. */
    id: string;
    name: string;
    priority: SqlPriority;
    /** Lessons: one sentence, say this first in an interview. Problems: the question as it is asked. */
    definition: string;
    /** Lessons: why you need it. Problems: what the question really tests. */
    problem: string;
    diagram: SqlDiagram;
    /** Common mistakes and misunderstandings to avoid. */
    mistakes: string[];
    /** A 20–40 second spoken answer for the interview. */
    interviewAnswer: string;
    /** Likely follow-up questions, with short answers for revision. */
    followUps: SqlFollowUp[];
    practice: Record<SqlCheckKey, string>;
    resources: SqlResource[];
    /** Where MySQL, PostgreSQL or SQL Server differ from the SQLite used here. */
    dialects?: string[];
}

/** A lesson: one idea in SQL, taught from the beginning. */
export interface SqlLesson extends SqlTopicBase {
    kind: 'lesson';
    idea: string;
    analogy: string;
    /** Where the analogy stops being true — the part that stops you learning it wrong. */
    breaks: string;
    /** The general shape. Words in lower case are the parts you fill in. */
    syntax?: string;
    /** How it works, step by step, with a running example. */
    howItWorks: string[];
    examples: SqlExample[];
    /** The must-know facts. Don't skip these. */
    keyPoints: string[];
}

/** An interview problem: the question, the pattern behind it, and a solution kept hidden until asked for. */
export interface SqlProblem extends SqlTopicBase {
    kind: 'problem';
    difficulty: SqlDifficulty;
    /** The pattern the problem is an example of, such as "Top N per group". */
    pattern: string;
    /** The words in a question that point to this pattern. */
    spot: string;
    /** The practice tables the question uses. */
    tables: string[];
    /** How to get to the answer, step by step, without giving the query away. */
    approach: string[];
    solution: SqlExample & { result: SqlResultTable };
    /** Other correct ways, and when you might pick them. */
    alternatives?: SqlExample[];
    /** Cases to mention out loud: ties, NULLs, no rows. */
    edgeCases: string[];
}

export type SqlTopic = SqlLesson | SqlProblem;

/** One good answer to a practice exercise, kept hidden until you have tried it yourself. */
export interface SqlPracticeAnswer {
    /** The answer in plain words. A blank line starts a new paragraph. */
    answer: string;
    /** A query that shows it, with the exact rows it returns (or the error, for one meant to fail). A test runs every one. */
    query?: Pick<SqlExample, 'sql' | 'result' | 'error'>;
}

export type SqlTopicAnswers = Record<SqlCheckKey, SqlPracticeAnswer>;

export interface SqlPhase {
    id: string;
    number: number;
    short: string;
    title: string;
    accent: string;
    goal: string;
    bigPicture: string;
    topics: SqlTopic[];
}

export const sqlPhases: SqlPhase[] = [
    sqlPhase0,
    sqlPhase1,
    sqlPhase2,
    sqlPhase3,
    sqlPhase4,
    sqlPhase5,
    sqlPhase6,
    sqlPhase7,
    sqlPhase8,
];

export const allSqlTopics: SqlTopic[] = sqlPhases.flatMap(phase => phase.topics);

/** One-screen reminders for Revise mode: the shapes worth knowing by heart. */
export const sqlCheatSheet: { title: string; code: string }[] = [
    {
        title: 'The order you write a query in',
        code: 'SELECT    columns, aggregates\nFROM      table\nJOIN      other_table ON key = key\nWHERE     row filter\nGROUP BY  columns\nHAVING    group filter\nORDER BY  columns\nLIMIT     n;',
    },
    {
        title: 'The order the database runs it in',
        code: '1 FROM / JOIN   build the rows\n2 WHERE         keep some rows\n3 GROUP BY      make groups\n4 HAVING        keep some groups\n5 SELECT        work out the columns (and window functions)\n6 DISTINCT      drop duplicate rows\n7 ORDER BY      sort\n8 LIMIT         cut',
    },
    {
        title: 'Joins in one line each',
        code: 'INNER JOIN   only rows that match on both sides\nLEFT JOIN    every left row; NULLs where the right has no match\nFULL JOIN    every row from both sides\nCROSS JOIN   every left row paired with every right row\nanti-join    LEFT JOIN … WHERE right.key IS NULL  (or NOT EXISTS)',
    },
    {
        title: 'NULL rules',
        code: 'x = NULL            never true: use x IS NULL\nNULL + 1            NULL\nCOUNT(*)            counts rows; COUNT(col) skips NULLs\nSUM / AVG / MIN / MAX   skip NULLs\nCOALESCE(x, 0)      first value that is not NULL\nx NOT IN (…, NULL)  returns no rows: use NOT EXISTS',
    },
    {
        title: 'Top N per group',
        code: 'WITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER (\n    PARTITION BY group_col ORDER BY value DESC) AS rn\n  FROM t\n)\nSELECT * FROM ranked WHERE rn <= 3;',
    },
    {
        title: 'Window function shapes',
        code: 'ROW_NUMBER() OVER (PARTITION BY g ORDER BY x)   1,2,3,4\nRANK()       …                                 1,2,2,4\nDENSE_RANK() …                                 1,2,2,3\nLAG(x) OVER (ORDER BY d)                        previous row\nSUM(x) OVER (ORDER BY d)                        running total\nAVG(x) OVER (ORDER BY d ROWS 2 PRECEDING)      3-row moving average',
    },
];
