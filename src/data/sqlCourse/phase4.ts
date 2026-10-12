import type { SqlPhase } from '../sql';
import { code } from './code';
import { cs50Sql, modeTutorial, pgExercises, postgresDocs, sqliteDocs, sqlZoo, w3 } from './resources';

export const sqlPhase4: SqlPhase = {
    id: 'subqueries',
    number: 4,
    short: 'Subqueries & CTEs',
    title: 'Subqueries, CTEs and set operations',
    accent: '#ba68c8',
    goal: 'Use the result of one query inside another, break hard questions into named steps with WITH, walk trees with recursion, and stack results with UNION.',
    bigPicture: 'A query\'s result is a table, so it can feed another query. That one idea turns hard questions ("customers who spend more than the average customer") into a chain of easy ones — and CTEs let you write that chain top to bottom, the way you would explain it.',
    topics: [
        {
            id: 'sql4-t1',
            kind: 'lesson',
            name: 'Subqueries: a query inside a query',
            priority: 'must',
            definition: 'A subquery is a SELECT inside another query, in brackets: it can return one value (to compare with), a list (for IN), or a whole table (to select FROM).',
            problem: '"Who earns more than the average?" needs the average first, then a comparison. "What is the average customer\'s total spend?" needs a total per customer first, then an average of those. Each needs two steps, and a subquery puts both steps into one query.',
            idea: 'The database runs the inner query and uses its result in the outer one. There are three shapes. A scalar subquery returns one value — `(SELECT AVG(salary) FROM employees)` — and goes anywhere a single value can. A list subquery returns one column of many rows and goes after IN. A table subquery (a derived table) goes in FROM, needs an alias, and is used like any other table — which is how you aggregate an aggregate.',
            analogy: 'Asking a friend to look something up while you wait. "What is the average salary?" — they come back with 63750 — "OK, then show me everyone above that." The inner question is answered first and its answer is slotted into the outer one.',
            breaks: 'Your friend answers once. A correlated subquery (next lesson) is different: it is asked again for every outer row, with that row\'s values plugged in.',
            syntax: code`
                WHERE column > (SELECT one_value FROM ...)
                WHERE column IN (SELECT one_column FROM ...)
                FROM (SELECT ... ) AS alias
            `,
            howItWorks: [
                'The inner query `SELECT AVG(salary) FROM employees` runs first and returns 63750.',
                'The outer query becomes, in effect, `WHERE salary > 63750`.',
                'Asha, Hana, Ben and Chen pass; the rest don\'t.',
                'For IN, the inner query returns a list of customer ids (2, 1, 5), and the outer query keeps customers whose id is in the list.',
                'For a derived table, the inner query makes a small table (one total per customer) that the outer query averages.',
            ],
            diagram: {
                code: 'flowchart LR\n  I["inner query<br/>SELECT AVG(salary)"] -->|"63750"| O["outer query<br/>WHERE salary over 63750"]\n  O --> R["Asha, Hana, Ben, Chen"]',
                caption: 'The inner query runs first and hands its answer to the outer one. Here it hands over a single number; it can also hand over a list (for IN) or a whole table (for FROM).',
            },
            examples: [
                {
                    title: 'One value: above the average salary',
                    sql: code`
                        SELECT name, salary
                        FROM employees
                        WHERE salary > (SELECT AVG(salary) FROM employees)
                        ORDER BY salary DESC, name;
                    `,
                    result: {
                        columns: ['name', 'salary'],
                        rows: [['Asha', 95000], ['Hana', 80000], ['Ben', 70000], ['Chen', 70000]],
                    },
                },
                {
                    title: 'A list: customers who ordered in March',
                    sql: code`
                        SELECT name
                        FROM customers
                        WHERE customer_id IN (
                          SELECT customer_id
                          FROM orders
                          WHERE order_date >= '2024-03-01'
                        )
                        ORDER BY name;
                    `,
                    result: { columns: ['name'], rows: [['Priya'], ['Tom'], ['Zoe']] },
                    note: 'Only the first Tom (customer 2) ordered in March. Each customer appears once, even with several March orders.',
                },
                {
                    title: 'A table: the average of totals',
                    sql: code`
                        SELECT ROUND(AVG(total), 2) AS avg_customer_spend
                        FROM (
                          SELECT customer_id, SUM(amount) AS total
                          FROM orders
                          GROUP BY customer_id
                        ) AS per_customer;
                    `,
                    result: { columns: ['avg_customer_spend'], rows: [[198.25]] },
                    note: 'You can\'t write `AVG(SUM(amount))`. Make the totals first (425, 275, 60, 33), then average them.',
                },
            ],
            keyPoints: [
                'A subquery is a query in brackets, run to feed the outer query.',
                'Scalar subquery: exactly one value. If it returns more than one row, the query fails.',
                'IN subquery: one column, any number of rows.',
                'Derived table in FROM: give it an alias. Use it to aggregate an aggregate or to filter on a calculated column.',
                'Most subqueries can also be written as a join or a CTE; pick whichever reads most clearly.',
            ],
            mistakes: [
                'A scalar subquery that returns several rows ("more than one row returned by a subquery").',
                'Forgetting the alias on a derived table (required in PostgreSQL before version 16, MySQL and SQL Server).',
                'Nesting subqueries three deep. Rewrite it with CTEs so it reads top to bottom.',
            ],
            interviewAnswer: 'A subquery is a nested SELECT whose result the outer query uses: as a single value for comparison, as a list for IN, or as a derived table in FROM. I use derived tables when I need to aggregate in two stages — like averaging per-customer totals — and once nesting gets deeper than one level I switch to CTEs so the logic reads top to bottom.',
            followUps: [
                { q: 'Subquery or join — which is faster?', a: 'Usually the same: modern optimisers rewrite IN and EXISTS subqueries as joins. Choose for clarity, then check the plan if it is slow.' },
                { q: 'What happens if a scalar subquery returns no rows?', a: 'It returns NULL, so a comparison with it is unknown and filters everything out.' },
            ],
            practice: {
                explain: 'Explain the three shapes of subquery and where each one can go.',
                write: 'Write a query for products that cost more than the average product price.',
                predict: 'What does the March example return if the date becomes \'2024-03-05\'?',
                edge: 'Write a scalar subquery that would fail because it returns more than one row. Then fix it two different ways.',
            },
            resources: [
                modeTutorial('Writing Subqueries in SQL'),
                sqlZoo('Nested SELECT'),
                w3('sql_any_all.asp', 'SQL ANY and ALL Operators'),
            ],
        },
        {
            id: 'sql4-t2',
            kind: 'lesson',
            name: 'Correlated subqueries, EXISTS, and the NOT IN trap',
            priority: 'must',
            definition: 'A correlated subquery refers to a column of the outer row, so it is worked out once per outer row; EXISTS asks "does the subquery return any row at all?", which makes it the safe way to test for a match.',
            problem: '"Each customer\'s latest order", "employees paid above their own department\'s average", "customers with at least one delivered order" — the comparison changes for every row. And the obvious way to find "no match", NOT IN, has a trap that returns nothing at all when NULLs are around.',
            idea: 'In `WHERE o.order_date = (SELECT MAX(o2.order_date) FROM orders o2 WHERE o2.customer_id = o.customer_id)`, the inner query uses o.customer_id from the outer row, so it is re-run (in effect) for each order. EXISTS (subquery) is true if the subquery finds at least one row; what it selects doesn\'t matter, so people write `SELECT 1`. NOT EXISTS is true when it finds none. The NOT IN trap: `x NOT IN (1, 2, NULL)` means `x <> 1 AND x <> 2 AND x <> NULL`, and the last part is always unknown — so the whole test is never true.',
            analogy: 'A correlated subquery is a teacher checking each pupil\'s mark against that pupil\'s own previous best, not one class-wide number. EXISTS is calling out "is anyone here from Leeds?" — one hand up is enough, and nobody has to say their name.',
            breaks: 'A teacher really does check each pupil one at a time. A database usually doesn\'t: the optimiser rewrites most correlated subqueries into a join that does all the rows at once. Think of it as row by row; don\'t assume it is slow.',
            syntax: code`
                WHERE EXISTS (
                  SELECT 1 FROM other o
                  WHERE o.key = outer_table.key
                )
            `,
            howItWorks: [
                'Outer row: order 101 of customer 1. Inner query: the latest order_date for customer 1 is 2024-03-10. 101\'s date is 2024-01-06, so it fails.',
                'Order 109 of customer 1 has date 2024-03-10, which equals the latest, so it is kept.',
                'This repeats for every order, so each customer\'s latest order is kept.',
                'EXISTS: for customer Omar, the inner query finds no delivered orders, so EXISTS is false and Omar is dropped.',
                'NOT IN with a list containing NULL is never true, so `dept_id NOT IN (SELECT dept_id FROM employees)` returns no rows — because Gus\'s dept_id is NULL.',
            ],
            diagram: {
                code: 'flowchart TD\n  A["outer row: customer Priya"] --> B["inner query uses Priya\'s id:<br/>any delivered order?"]\n  B -->|"found one"| K["EXISTS is true: keep Priya"]\n  C["outer row: customer Omar"] --> D["inner query uses Omar\'s id:<br/>any delivered order?"]\n  D -->|"none"| X["EXISTS is false: drop Omar"]',
                caption: 'A correlated subquery is asked again for each outer row, using that row\'s values. EXISTS only needs to know whether at least one row comes back.',
            },
            examples: [
                {
                    title: 'Each customer\'s latest order (correlated)',
                    sql: code`
                        SELECT o.customer_id, o.order_id, o.order_date
                        FROM orders o
                        WHERE o.order_date = (
                          SELECT MAX(o2.order_date)
                          FROM orders o2
                          WHERE o2.customer_id = o.customer_id
                        )
                        ORDER BY o.customer_id;
                    `,
                    result: {
                        columns: ['customer_id', 'order_id', 'order_date'],
                        rows: [[1, 109, '2024-03-10'], [2, 108, '2024-03-01'], [3, 107, '2024-02-20'], [5, 110, '2024-03-16']],
                    },
                    note: '`o2.customer_id = o.customer_id` is the link to the outer row. If a customer had two orders on their latest day, both would appear.',
                },
                {
                    title: 'EXISTS: customers with a delivered order',
                    sql: code`
                        SELECT c.name
                        FROM customers c
                        WHERE EXISTS (
                          SELECT 1
                          FROM orders o
                          WHERE o.customer_id = c.customer_id AND o.status = 'delivered'
                        )
                        ORDER BY c.customer_id;
                    `,
                    result: { columns: ['name'], rows: [['Priya'], ['Tom'], ['Lena']] },
                },
                {
                    title: 'The NOT IN trap',
                    sql: code`
                        SELECT dept_name
                        FROM departments
                        WHERE dept_id NOT IN (SELECT dept_id FROM employees);
                    `,
                    result: { columns: ['dept_name'], rows: [] },
                    note: 'HR has no employees, yet nothing comes back. The list contains Gus\'s NULL, so "not in the list" is never true.',
                },
                {
                    title: 'NOT EXISTS gets it right',
                    sql: code`
                        SELECT d.dept_name
                        FROM departments d
                        WHERE NOT EXISTS (
                          SELECT 1
                          FROM employees e
                          WHERE e.dept_id = d.dept_id
                        );
                    `,
                    result: { columns: ['dept_name'], rows: [['HR']] },
                },
            ],
            keyPoints: [
                'A correlated subquery uses outer-row columns; logically it runs once per outer row.',
                'EXISTS is true when the subquery returns at least one row; `SELECT 1` inside is a convention.',
                'NOT EXISTS is the NULL-safe "no match" test. Prefer it to NOT IN.',
                '`x NOT IN (… NULL …)` is never true. `x IN (… NULL …)` still works for the values that match.',
                'Correlated subqueries are clear for "compare with my own group"; window functions (Phase 5) often do the same faster.',
            ],
            mistakes: [
                'Using NOT IN against a column that can be NULL.',
                'Forgetting the correlation (`WHERE o2.customer_id = o.customer_id`), which compares every row with the overall maximum instead.',
                'Thinking EXISTS cares what the subquery selects. It only checks whether a row exists.',
            ],
            dialects: [
                'All major databases support EXISTS, NOT EXISTS and correlated subqueries the same way. If you must use NOT IN, add `WHERE dept_id IS NOT NULL` inside the subquery.',
            ],
            interviewAnswer: 'A correlated subquery references the outer query\'s row, so logically it is evaluated per row — useful for comparisons against a row\'s own group, like each customer\'s latest order. EXISTS tests whether a subquery returns any row, and NOT EXISTS is my default anti-join, because NOT IN returns nothing if the subquery yields a single NULL: x not in a list containing NULL can never be true.',
            followUps: [
                { q: 'Why is NOT IN dangerous?', a: '`x NOT IN (a, NULL)` means `x <> a AND x <> NULL`. The second part is unknown, so the whole condition is never true and no rows return.' },
                { q: 'EXISTS or IN — which is better?', a: 'For "has a match" they are equivalent and usually optimised the same. For "has no match", use NOT EXISTS because of NULLs.' },
                { q: 'Are correlated subqueries slow?', a: 'Not necessarily: optimisers often turn them into joins. On big data, a window function or a pre-aggregated join is usually faster and clearer.' },
            ],
            practice: {
                explain: 'Explain, with the HR example, why NOT IN returned nothing.',
                write: 'Using EXISTS, write a query for products that appear in at least one order of Priya\'s.',
                predict: 'What does `SELECT name FROM employees e WHERE NOT EXISTS (SELECT 1 FROM employees r WHERE r.manager_id = e.emp_id) ORDER BY name;` return?',
                edge: 'Make the NOT IN version of the HR query return HR, by changing only the subquery.',
            },
            resources: [
                postgresDocs('functions-subquery.html', 'Subquery Expressions (EXISTS, IN, NOT IN)'),
                pgExercises('Joins and Subqueries'),
                w3('sql_exists.asp', 'SQL EXISTS Operator'),
            ],
        },
        {
            id: 'sql4-t3',
            kind: 'lesson',
            name: 'CTEs: naming each step with WITH',
            priority: 'must',
            definition: 'A CTE (common table expression) is a named, temporary result written at the top of a query with WITH name AS (…), which later parts of the query can use like a table.',
            problem: 'Subqueries inside subqueries read inside-out and quickly become unreadable. In an interview, the person watching needs to follow your thinking. CTEs let you write a hard query as a list of small, named steps, in the order you would explain them.',
            idea: '`WITH per_customer AS (SELECT …)` defines a step and gives it a name. The main query after it can use per_customer like a table — even more than once. You can chain several CTEs, separated by commas, and each one can use the ones above it. A CTE exists only for that one query. It is mostly about readability: the database runs it much like the equivalent subquery.',
            analogy: 'A recipe that says "first make the sauce; set it aside" before the main steps. Later steps just say "add the sauce". You name the sub-result once and refer to it by name.',
            breaks: 'Sauce made once is used everywhere it is needed. A database may compute a CTE once or re-run it each time it is used — that is up to the optimiser — so don\'t use CTEs as a speed trick.',
            syntax: code`
                WITH step_one AS (
                  SELECT ...
                ),
                step_two AS (
                  SELECT ... FROM step_one ...
                )
                SELECT ...
                FROM step_two;
            `,
            howItWorks: [
                'per_customer: one row per customer with their total spend (425, 275, 60, 33).',
                'The main query joins per_customer to customers to get names.',
                'The WHERE uses per_customer a second time to work out the average total (198.25).',
                'Customers above that average are kept: Priya and Tom.',
                'Each step can be tested alone: select from it while you build the query.',
            ],
            diagram: {
                code: 'flowchart LR\n  O["orders"] --> A["CTE per_customer<br/>total per customer"]\n  A --> M["main query:<br/>join names,<br/>keep totals above average"]\n  A -->|"used again"| AV["average of the totals"]\n  AV --> M\n  C["customers"] --> M',
                caption: 'Each CTE is a named step. The main query reads them like tables — and can use one step twice, here both for the rows and for their average.',
            },
            examples: [
                {
                    title: 'Customers who spend more than the average customer',
                    sql: code`
                        WITH per_customer AS (
                          SELECT customer_id, SUM(amount) AS total
                          FROM orders
                          GROUP BY customer_id
                        )
                        SELECT c.name, p.total
                        FROM per_customer p
                        JOIN customers c ON c.customer_id = p.customer_id
                        WHERE p.total > (SELECT AVG(total) FROM per_customer)
                        ORDER BY p.total DESC;
                    `,
                    result: { columns: ['name', 'total'], rows: [['Priya', 425], ['Tom', 275]] },
                },
                {
                    title: 'Several steps, read top to bottom',
                    sql: code`
                        WITH delivered AS (
                          SELECT customer_id, amount
                          FROM orders
                          WHERE status = 'delivered'
                        ),
                        totals AS (
                          SELECT customer_id, COUNT(*) AS delivered_orders, SUM(amount) AS delivered_total
                          FROM delivered
                          GROUP BY customer_id
                        )
                        SELECT c.name, t.delivered_orders, t.delivered_total,
                               CASE WHEN t.delivered_total >= 200 THEN 'gold' ELSE 'standard' END AS tier
                        FROM totals t
                        JOIN customers c ON c.customer_id = t.customer_id
                        ORDER BY t.delivered_total DESC, c.name;
                    `,
                    result: {
                        columns: ['name', 'delivered_orders', 'delivered_total', 'tier'],
                        rows: [['Priya', 4, 275, 'gold'], ['Tom', 2, 275, 'gold'], ['Lena', 1, 60, 'standard']],
                    },
                    note: 'Filter, then total, then label: three small steps instead of one tangle.',
                },
            ],
            keyPoints: [
                'WITH name AS (query) defines a CTE; separate several with commas, and use WITH only once.',
                'A CTE can use the CTEs defined above it, and the main query can use any of them, more than once.',
                'A CTE lasts for one statement only.',
                'Use CTEs to make the steps of a hard query readable — interviewers love seeing this.',
                'Build and test one CTE at a time.',
            ],
            mistakes: [
                'Writing WITH before every CTE. It is `WITH a AS (…), b AS (…)`.',
                'A comma after the last CTE, before the main SELECT.',
                'Expecting a CTE to exist in the next query. It is gone after the statement ends.',
            ],
            dialects: [
                'PostgreSQL before version 12 always computed a CTE separately (an "optimisation fence"); since 12 it can fold it into the main query, and you can force either with MATERIALIZED / NOT MATERIALIZED.',
                'MySQL supports CTEs from version 8.0.',
            ],
            interviewAnswer: 'A CTE is a named subquery defined with WITH at the top of a statement, which the rest of the query can reference like a table, even multiple times. I use CTEs to break a hard problem into steps — filter, aggregate, rank, then select — which makes the query easy to read and to debug one step at a time. Performance is usually the same as the equivalent subquery.',
            followUps: [
                { q: 'CTE or subquery — what is the difference?', a: 'Mostly readability: a CTE is named, defined once, can be reused within the query, and reads top to bottom. CTEs can also be recursive.' },
                { q: 'CTE or temporary table?', a: 'A CTE lasts one statement and isn\'t stored. A temporary table lasts the session, can be indexed, and suits large intermediate results reused by several queries.' },
            ],
            practice: {
                explain: 'Explain why a CTE makes a query easier to read than nested subqueries.',
                write: 'Using two CTEs, find the product category with the highest revenue.',
                predict: 'In the first example, what changes if `>` becomes `<`?',
                edge: 'Customer 3 has an order with a NULL amount. Does it affect per_customer\'s total for Lena, or the average? Explain.',
            },
            resources: [
                postgresDocs('queries-with.html', 'WITH Queries (Common Table Expressions)'),
                cs50Sql('Lecture 3: Writing'),
                modeTutorial('Writing Subqueries in SQL'),
            ],
        },
        {
            id: 'sql4-t4',
            kind: 'lesson',
            name: 'Recursive CTEs: walking trees and filling in dates',
            priority: 'should',
            definition: 'A recursive CTE refers to itself: an anchor query gives the starting rows, and a recursive part, joined with UNION ALL, keeps adding rows from the previous round until no new rows appear.',
            problem: 'An org chart can be any number of levels deep, so a fixed number of self joins can\'t walk it. The same goes for folder trees, category trees and "every day in this range, including days with no orders". Recursion handles any depth.',
            idea: 'The anchor runs once: for the org chart, "the person with no manager" (Asha, level 0). Then the recursive part runs on the rows found in the previous round: "employees whose manager is in the previous round" (Ben, Chen, Dara, Fatima, level 1), then their reports (Eli, Gus, Hana, level 2), and so on. When a round finds nothing, it stops. Always give it a way to stop — a WHERE that eventually fails — or it runs forever.',
            analogy: 'Passing a message down a phone tree. The boss calls her direct reports, each of them calls theirs, and the calling stops when someone has nobody left to call.',
            breaks: 'A phone tree stops on its own. Data can loop — if A manages B and B manages A — and a recursive CTE would go round forever. Put a limit on the depth when the data might not be a clean tree.',
            syntax: code`
                WITH RECURSIVE tree AS (
                  SELECT ... FROM t WHERE <start>            -- anchor
                  UNION ALL
                  SELECT ... FROM t JOIN tree ON <next step>  -- recursive part
                )
                SELECT * FROM tree;
            `,
            howItWorks: [
                'Anchor: `WHERE manager_id IS NULL` finds Asha, level 0.',
                'Round 1: employees whose manager_id is Asha\'s id get level 0 + 1 = 1.',
                'Round 2: employees managed by anyone found in round 1 get level 2: Eli and Gus (Dara), Hana (Ben).',
                'Round 3 finds nobody managed by Eli, Gus or Hana, so the recursion stops.',
                'For a date range, the anchor is the first day and each round adds one day until the last day.',
            ],
            diagram: {
                code: 'flowchart TD\n  A["anchor · level 0<br/>Asha"] --> B["round 1 · level 1<br/>Ben, Chen, Dara, Fatima"]\n  B --> C["round 2 · level 2<br/>Hana (under Ben)<br/>Eli, Gus (under Dara)"]\n  C --> D["round 3: nobody new<br/>stop"]',
                caption: 'Each round finds the people who report to someone found in the round before. When a round finds nobody new, the recursion stops.',
            },
            examples: [
                {
                    title: 'The simplest: count to 5',
                    sql: code`
                        WITH RECURSIVE numbers(n) AS (
                          SELECT 1
                          UNION ALL
                          SELECT n + 1 FROM numbers WHERE n < 5
                        )
                        SELECT n
                        FROM numbers
                        ORDER BY n;
                    `,
                    result: { columns: ['n'], rows: [[1], [2], [3], [4], [5]] },
                    note: 'Start at 1; each round adds 1; `WHERE n < 5` is the stop rule.',
                },
                {
                    title: 'The whole org chart, with levels',
                    sql: code`
                        WITH RECURSIVE chart AS (
                          SELECT emp_id, name, 0 AS level
                          FROM employees
                          WHERE manager_id IS NULL
                          UNION ALL
                          SELECT e.emp_id, e.name, chart.level + 1
                          FROM employees e
                          JOIN chart ON e.manager_id = chart.emp_id
                        )
                        SELECT name, level
                        FROM chart
                        ORDER BY level, name;
                    `,
                    result: {
                        columns: ['name', 'level'],
                        rows: [['Asha', 0], ['Ben', 1], ['Chen', 1], ['Dara', 1], ['Fatima', 1], ['Eli', 2], ['Gus', 2], ['Hana', 2]],
                    },
                },
                {
                    title: 'Every day in a range, even days with no orders',
                    sql: code`
                        WITH RECURSIVE days(day) AS (
                          SELECT '2024-01-05'
                          UNION ALL
                          SELECT date(day, '+1 day') FROM days WHERE day < '2024-01-09'
                        )
                        SELECT d.day, COUNT(o.order_id) AS orders
                        FROM days d
                        LEFT JOIN orders o ON o.order_date = d.day
                        GROUP BY d.day
                        ORDER BY d.day;
                    `,
                    result: {
                        columns: ['day', 'orders'],
                        rows: [['2024-01-05', 0], ['2024-01-06', 1], ['2024-01-07', 1], ['2024-01-08', 1], ['2024-01-09', 0]],
                    },
                    note: 'The CTE makes the calendar; the LEFT JOIN brings in orders, so the empty days show 0.',
                },
            ],
            keyPoints: [
                'Shape: WITH RECURSIVE name AS (anchor UNION ALL recursive part).',
                'The recursive part joins the table to the CTE itself, using only the rows found in the previous round.',
                'There must be a stop rule — a WHERE that eventually returns no new rows.',
                'Carry extra columns (level, a path string) to know how deep each row is.',
                'Common uses: org charts, category or folder trees, bill of materials, and generating number or date series.',
            ],
            mistakes: [
                'No stop rule, so it runs until the database gives up.',
                'Using UNION instead of UNION ALL by habit. UNION ALL is the normal choice; UNION removes duplicates and can stop cycles, but costs more.',
                'Joining the wrong way round (`chart.manager_id = e.emp_id`), which walks up the tree instead of down.',
            ],
            dialects: [
                'PostgreSQL, MySQL 8+ and SQLite need the word RECURSIVE. SQL Server and Oracle use plain WITH.',
                'PostgreSQL makes date series easier with `generate_series`. SQL Server limits recursion to 100 rounds unless you add `OPTION (MAXRECURSION n)`.',
            ],
            interviewAnswer: 'A recursive CTE has an anchor member that produces the starting rows and a recursive member, unioned with UNION ALL, that joins back to the CTE to produce the next level, repeating until no new rows appear. I use it for hierarchies of unknown depth, like an org chart with a level column, and for generating date series to fill gaps — always with a clear termination condition, and a depth limit if the data might contain cycles.',
            followUps: [
                { q: 'How does a recursive CTE know when to stop?', a: 'When the recursive part returns no new rows. A WHERE condition (like n < 5, or reaching people with no reports) makes that happen.' },
                { q: 'How do you protect against cycles in the data?', a: 'Carry a level or a path column and stop at a maximum depth, or stop when the next id is already in the path.' },
            ],
            practice: {
                explain: 'Explain what the anchor and the recursive part each do, using the org chart.',
                write: 'Write a recursive CTE that shows Hana\'s chain of managers as one string: \'Hana → Ben → Asha\'.',
                predict: 'In the org-chart example, what level does each person get if the anchor is `WHERE name = \'Dara\'`?',
                edge: 'What would happen if Asha\'s manager_id were set to 8 (Hana), making a loop? How would you stop the query running forever?',
            },
            resources: [
                postgresDocs('queries-with.html#QUERIES-WITH-RECURSIVE', 'Recursive Queries'),
                sqliteDocs('lang_with.html', 'The WITH Clause'),
                pgExercises('Recursive Queries'),
            ],
        },
        {
            id: 'sql4-t5',
            kind: 'lesson',
            name: 'UNION, UNION ALL, INTERSECT and EXCEPT',
            priority: 'should',
            definition: 'Set operators stack the results of two queries: UNION ALL keeps every row, UNION removes duplicates, INTERSECT keeps rows found in both, and EXCEPT keeps rows in the first but not the second.',
            problem: 'Sometimes the rows you need come from two places: every city mentioned by departments or customers; cities that have both a department and a customer. Joins put tables side by side; set operators put results on top of each other.',
            idea: 'Write two SELECTs with the same number of columns, of matching types, and put a set operator between them. The column names come from the first SELECT. UNION ALL simply stacks the rows — fast, and keeps duplicates. UNION stacks them and removes duplicate rows — which costs a sort or hash. INTERSECT keeps rows in both results; EXCEPT keeps rows of the first that are not in the second. A single ORDER BY at the very end sorts the combined result.',
            analogy: 'Two class lists. UNION ALL staples them together. UNION staples them and crosses out anyone listed twice. INTERSECT is pupils on both lists. EXCEPT is pupils on the first list but not on the second.',
            breaks: 'Pupils are matched by name. Set operators match whole rows, column by column — so adding a column that differs (like a source label) stops rows from counting as duplicates.',
            syntax: code`
                SELECT col_a, col_b FROM table_one
                UNION ALL
                SELECT col_x, col_y FROM table_two
                ORDER BY col_a;
            `,
            howItWorks: [
                'Both SELECTs return one column: department locations and customer cities.',
                'UNION stacks them (10 rows) and removes duplicate rows, leaving 5 different cities, including NULL.',
                'UNION ALL keeps all of them; a source column shows where each row came from.',
                'INTERSECT keeps only cities in both lists: Leeds and London.',
                'EXCEPT keeps department cities with no customer: Manchester.',
            ],
            diagram: {
                code: 'flowchart LR\n  A["query 1 rows"] --> U["UNION ALL: all rows"]\n  B["query 2 rows"] --> U\n  A --> UD["UNION: all rows, duplicates removed"]\n  B --> UD\n  A --> I["INTERSECT: rows in both"]\n  B --> I\n  A --> E["EXCEPT: rows in query 1 only"]',
                caption: 'Set operators combine two results vertically. Both queries must return the same number of columns, with matching types; the names come from the first query.',
            },
            examples: [
                {
                    title: 'UNION: every city, once',
                    sql: code`
                        SELECT location AS city FROM departments
                        UNION
                        SELECT city FROM customers
                        ORDER BY city;
                    `,
                    result: { columns: ['city'], rows: [[null], ['Bristol'], ['Leeds'], ['London'], ['Manchester']] },
                    note: 'Duplicates are removed, and the NULLs collapse into one row too.',
                },
                {
                    title: 'UNION ALL: keep everything, with a label',
                    sql: code`
                        SELECT 'department' AS source, location AS city FROM departments
                        UNION ALL
                        SELECT 'customer', city FROM customers WHERE city IS NOT NULL
                        ORDER BY city, source;
                    `,
                    result: {
                        columns: ['source', 'city'],
                        rows: [['customer', 'Bristol'], ['customer', 'Leeds'], ['customer', 'Leeds'], ['department', 'Leeds'], ['customer', 'London'], ['customer', 'London'], ['department', 'London'], ['department', 'London'], ['department', 'Manchester']],
                    },
                },
                {
                    title: 'INTERSECT: in both',
                    sql: code`
                        SELECT city FROM customers
                        INTERSECT
                        SELECT location FROM departments
                        ORDER BY city;
                    `,
                    result: { columns: ['city'], rows: [['Leeds'], ['London']] },
                },
                {
                    title: 'EXCEPT: in the first, not the second',
                    sql: code`
                        SELECT location FROM departments
                        EXCEPT
                        SELECT city FROM customers
                        ORDER BY location;
                    `,
                    result: { columns: ['location'], rows: [['Manchester']] },
                },
            ],
            keyPoints: [
                'Both queries need the same number of columns, in the same order, with compatible types.',
                'UNION ALL keeps duplicates and is faster; UNION removes them.',
                'Use UNION ALL unless you really need duplicates removed.',
                'INTERSECT and EXCEPT also remove duplicates from their result.',
                'One ORDER BY, at the end, sorts the combined result; column names come from the first query.',
            ],
            mistakes: [
                'Using UNION when the two sets can\'t overlap — paying for duplicate removal you don\'t need.',
                'Putting ORDER BY on the first query instead of at the end.',
                'Lining columns up in a different order in the second query: they are matched by position, not by name.',
            ],
            dialects: [
                'Oracle calls EXCEPT `MINUS`. MySQL only added INTERSECT and EXCEPT in version 8.0.31.',
            ],
            interviewAnswer: 'Set operators combine two result sets vertically, matching columns by position. UNION ALL appends everything; UNION also removes duplicate rows, which costs a sort or hash, so I default to UNION ALL unless duplicates must go. INTERSECT returns rows present in both results and EXCEPT returns rows in the first but not the second — a neat alternative to an anti-join when comparing id lists.',
            followUps: [
                { q: 'UNION vs UNION ALL?', a: 'UNION removes duplicate rows; UNION ALL keeps them all and is faster because it skips that step.' },
                { q: 'JOIN vs UNION?', a: 'A join adds columns by matching rows side by side; a union adds rows by stacking results on top of each other.' },
            ],
            practice: {
                explain: 'Explain the difference between UNION and UNION ALL, and when each is right.',
                write: 'Write one query that lists every person\'s name from both employees and customers, with a column saying which table they came from.',
                predict: 'How many rows does `SELECT city FROM customers UNION ALL SELECT location FROM departments;` return?',
                edge: 'Does UNION treat two NULL cities as duplicates? Check with the first example, and explain how that differs from `=`.',
            },
            resources: [
                w3('sql_union.asp', 'SQL UNION Operator'),
                modeTutorial('SQL UNION'),
                sqlZoo('UNION and set operations'),
            ],
        },
    ],
};
