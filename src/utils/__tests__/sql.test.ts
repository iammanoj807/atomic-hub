import { beforeAll, describe, it, expect } from 'vitest';
import initSqlJs, { type SqlJsStatic } from 'sql.js';
import {
    sqlPhases,
    allSqlTopics,
    SQL_CHECK_KEYS,
    SQL_PRIORITY_LABELS,
    SQL_RESOURCE_KIND_ORDER,
    sqlCheatSheet,
    sqlHowToStudy,
    type SqlExample,
    type SqlTopic,
} from '../../data/sql';
import { practiceTables } from '../../data/sqlPracticeDb';
import { runOnPracticeDb } from '../sqlRunner';
import { sqlTopicProse } from '../sqlGlossary';

let SQL: SqlJsStatic;
beforeAll(async () => {
    SQL = await initSqlJs();
});

/** Every query shown on a card, with where it is, so a failure says which one. */
const examplesOf = (topic: SqlTopic): [string, SqlExample][] =>
    topic.kind === 'lesson'
        ? topic.examples.map((example, index) => [`${topic.id} example ${index + 1} (${example.title})`, example])
        : [
            [`${topic.id} solution`, topic.solution],
            ...(topic.alternatives ?? []).map((example, index): [string, SqlExample] => [`${topic.id} alternative ${index + 1}`, example]),
        ];

const allExamples = allSqlTopics.flatMap(examplesOf);

describe('the practice database', () => {
    it('loads, and every order total equals the sum of its items', () => {
        const mismatched = runOnPracticeDb(
            SQL,
            `SELECT o.order_id
             FROM orders o
             JOIN order_items oi ON oi.order_id = o.order_id
             JOIN products p ON p.product_id = oi.product_id
             GROUP BY o.order_id, o.amount
             HAVING SUM(oi.quantity * p.price) <> o.amount`
        );
        expect(mismatched.rows).toEqual([]);
        for (const table of practiceTables) {
            const count = runOnPracticeDb(SQL, `SELECT COUNT(*) FROM ${table.name}`);
            expect(count.rows[0][0]).toBe(table.rows.length);
        }
    });
});

describe('SQL content', () => {
    it('gives every topic a definition, a diagram, interview notes, practice and resources', () => {
        const problems: string[] = [];
        for (const t of allSqlTopics) {
            if (!t.name.trim() || !t.definition.trim()) problems.push(`${t.id}: missing name or definition`);
            if (!t.problem.trim()) problems.push(`${t.id}: missing the problem it solves`);
            if (t.mistakes.length < 2) problems.push(`${t.id}: fewer than 2 common mistakes`);
            if (!t.diagram.code.trim() || !t.diagram.caption.trim()) problems.push(`${t.id}: missing diagram or caption`);
            if (!(t.priority in SQL_PRIORITY_LABELS)) problems.push(`${t.id}: bad priority`);
            if (!t.interviewAnswer.trim()) problems.push(`${t.id}: no interview answer`);
            if (t.followUps.length < 2) problems.push(`${t.id}: fewer than 2 follow-up questions`);
            for (const f of t.followUps) {
                if (!f.q.trim() || !f.a.trim()) problems.push(`${t.id}: follow-up missing a question or answer`);
            }
            for (const key of SQL_CHECK_KEYS) {
                if (!t.practice[key]?.trim()) problems.push(`${t.id}: no ${key} exercise`);
            }
            if (t.resources.length < 2) problems.push(`${t.id}: fewer than 2 free resources`);
            for (const r of t.resources) {
                if (!SQL_RESOURCE_KIND_ORDER.includes(r.kind)) problems.push(`${t.id}: unknown resource kind`);
                if (r.url && !/^https:\/\//.test(r.url)) problems.push(`${t.id}: bad url ${r.url}`);
            }
            if (t.kind === 'lesson') {
                for (const field of [t.idea, t.analogy, t.breaks]) {
                    if (!field.trim()) problems.push(`${t.id}: empty explanation field`);
                }
                if (t.keyPoints.length < 3) problems.push(`${t.id}: fewer than 3 key points`);
                if (t.howItWorks.length < 3) problems.push(`${t.id}: fewer than 3 how-it-works steps`);
                if (t.examples.length === 0) problems.push(`${t.id}: no worked example`);
            } else {
                if (t.approach.length < 2) problems.push(`${t.id}: fewer than 2 approach steps`);
                if (t.edgeCases.length === 0) problems.push(`${t.id}: no edge cases`);
                if (t.tables.length === 0) problems.push(`${t.id}: no tables named`);
                if (!t.pattern.trim() || !t.spot.trim()) problems.push(`${t.id}: missing pattern or how to spot it`);
                const tableNames = new Set(practiceTables.map(table => table.name));
                for (const name of t.tables) if (!tableNames.has(name)) problems.push(`${t.id}: unknown table ${name}`);
            }
            // Backticks mark inline code; an odd number would swallow the rest of the text.
            for (const text of sqlTopicProse(t)) {
                if ((text.match(/`/g) ?? []).length % 2 !== 0) problems.push(`${t.id}: unbalanced backticks in "${text.slice(0, 40)}…"`);
            }
        }
        expect(problems).toEqual([]);
    });

    it('keeps backticks out of text shown as plain text, where they would appear literally', () => {
        const plain: [string, string][] = [
            ...sqlHowToStudy.map((line, i): [string, string] => [`how to study ${i + 1}`, line]),
            ...sqlCheatSheet.map((item): [string, string] => [`cheat sheet title`, item.title]),
            ...practiceTables.flatMap(table => [
                [`${table.name} about`, table.about] as [string, string],
                ...table.columns.map((column): [string, string] => [`${table.name}.${column.name} about`, column.about]),
            ]),
            ...sqlPhases.flatMap(phase => [[`${phase.id} goal`, phase.goal], [`${phase.id} big picture`, phase.bigPicture]] as [string, string][]),
            ...allSqlTopics.flatMap(t => [
                [`${t.id} name`, t.name] as [string, string],
                [`${t.id} diagram caption`, t.diagram.caption] as [string, string],
                ...(t.kind === 'problem' ? [[`${t.id} pattern`, t.pattern] as [string, string]] : []),
                ...examplesOf(t).map(([where, example]): [string, string] => [`${where} title`, example.title]),
            ]),
        ];
        expect(plain.filter(([, text]) => text.includes('`')).map(([where]) => where)).toEqual([]);
    });

    it('keeps ids unique, because they are the Firestore keys', () => {
        const ids = allSqlTopics.map(t => t.id);
        expect(new Set(ids).size).toBe(ids.length);
    });

    it('has the full course: 9 phases, 61 topics, 14 of them interview problems', () => {
        expect(sqlPhases).toHaveLength(9);
        expect(allSqlTopics).toHaveLength(61);
        expect(allSqlTopics.filter(t => t.kind === 'problem')).toHaveLength(14);
    });

    it('numbers the phases in order, each with topics', () => {
        sqlPhases.forEach((phase, index) => {
            expect(phase.number).toBe(index);
            expect(phase.topics.length).toBeGreaterThan(0);
        });
    });
});

describe('every example on the practice database', () => {
    it('returns exactly the rows shown on its card', () => {
        const wrong: string[] = [];
        for (const [where, example] of allExamples) {
            if (Boolean(example.result) === Boolean(example.error)) {
                wrong.push(`${where}\n  needs exactly one of result or error`);
                continue;
            }
            if (example.error) {
                try {
                    runOnPracticeDb(SQL, example.sql);
                    wrong.push(`${where}\n  should fail with "${example.error}", but ran`);
                } catch (error) {
                    const message = (error as Error).message;
                    if (!message.includes(example.error)) wrong.push(`${where}\n  shown error: ${example.error}\n  actual: ${message}`);
                }
                continue;
            }
            if (!example.result) continue;
            try {
                const actual = runOnPracticeDb(SQL, example.sql);
                const shown = { columns: example.result.columns, rows: example.result.rows };
                if (JSON.stringify({ columns: actual.columns, rows: actual.rows }) !== JSON.stringify(shown)) {
                    wrong.push(`${where}\n  shown:  ${JSON.stringify(shown)}\n  actual: ${JSON.stringify({ columns: actual.columns, rows: actual.rows })}`);
                }
            } catch (error) {
                wrong.push(`${where}\n  error: ${(error as Error).message}`);
            }
        }
        expect(wrong.join('\n')).toBe('');
    });

    it('never depends on an order the query does not ask for', () => {
        // With this pragma SQLite returns unordered rows in reverse, so a query
        // that only looks sorted (no ORDER BY) gives a different answer.
        const unstable: string[] = [];
        for (const [where, example] of allExamples) {
            if (!example.result || example.result.rows.length < 2) continue;
            try {
                const normal = runOnPracticeDb(SQL, example.sql);
                const reversed = runOnPracticeDb(SQL, example.sql, { reverseUnordered: true });
                if (JSON.stringify(normal.rows) !== JSON.stringify(reversed.rows)) unstable.push(where);
            } catch {
                // Reported by the test above.
            }
        }
        expect(unstable).toEqual([]);
    });

    it('keeps results small enough to read on a phone', () => {
        const tooBig = allExamples
            .filter(([, example]) => example.result && (example.result.rows.length > 14 || example.result.columns.length > 7))
            .map(([where]) => where);
        expect(tooBig).toEqual([]);
    });
});
