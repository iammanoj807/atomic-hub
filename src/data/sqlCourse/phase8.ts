import type { SqlPhase } from '../sql';
import { code } from './code';
import { dataLemur, leetCodeSql50, modeTutorial, pgExercises, postgresDocs, watch } from './resources';

export const sqlPhase8: SqlPhase = {
    id: 'interview-problems',
    number: 8,
    short: 'Interview problems',
    title: 'SQL interview problems, from easy to hard',
    accent: '#f06292',
    goal: 'Solve the classic SQL interview questions from a blank page, explain your approach while you write, and name the edge cases before the interviewer does.',
    bigPicture: 'Most SQL interview questions are one of about a dozen patterns: Nth highest, top N per group, rows with no match, duplicates, comparisons with a group average, period-over-period change, first event per user, streaks, retention. Learn to spot the pattern from the wording, and the query almost writes itself.',
    topics: [
        {
            id: 'sql8-t1',
            kind: 'lesson',
            name: 'How to answer any SQL interview question',
            priority: 'must',
            definition: 'A repeatable method: restate the question, look at the tables and their grain, ask about edge cases, plan the steps out loud, write the query as small CTEs, then check the result against a few rows you can work out by hand.',
            problem: 'Under pressure, people jump straight into typing, write one giant query, and miss the NULLs or ties the interviewer planted. Interviewers grade the process as much as the answer: do you clarify, structure, and verify?',
            idea: 'Step 1, clarify: say the question back in your own words, and ask about ties, NULLs, duplicates and what "per" means. Step 2, look at the data: what is one row of each table (the grain), what are the keys, how do they join? Step 3, plan out loud: "First I\'ll get delivered orders, then total them per customer, then join the city." Step 4, write it as CTEs, one step each, running each one if you can. Step 5, check: does the row count make sense? Does a total match a number you can work out by hand? Then say the edge cases and how your query handles them.',
            analogy: 'A pilot\'s checklist. Experienced pilots still run it every flight — not because they forget how to fly, but because the checklist catches the one thing that pressure makes you skip.',
            breaks: 'A checklist is the same every flight. Interviews vary: if the question is simple, go through the steps quickly; don\'t spend five minutes clarifying "count the rows".',
            syntax: code`
                -- 1 clarify  2 look at the grain  3 plan out loud
                WITH step_one AS (...),   -- 4 one CTE per step
                     step_two AS (...)
                SELECT ... FROM step_two; -- 5 check against rows you know
            `,
            howItWorks: [
                'Question: "Which city brings in the most delivered revenue?"',
                'Clarify: delivered orders only? Customers with no city — drop them or show them as unknown? Ties?',
                'Grain: one row of orders is one order; customers holds the city; join on customer_id.',
                'Sanity-check the data first: 10 orders, 4 customers who ordered, 1 order with no amount.',
                'Plan and write: a CTE of delivered orders → join customers → group by city → sort. Check: London = Priya 275 + Lena 60 = 335.',
            ],
            diagram: {
                code: 'flowchart LR\n  A["1 clarify<br/>ties? NULLs? per what?"] --> B["2 look at tables<br/>grain, keys, joins"] --> C["3 plan out loud"] --> D["4 write CTEs<br/>one step each"] --> E["5 check<br/>row counts, a known total,<br/>edge cases"]',
                caption: 'Five steps, every time. The talking in steps 1, 3 and 5 is what the interviewer is grading; the CTEs in step 4 make your thinking easy to follow.',
            },
            examples: [
                {
                    title: 'Step 2: look at the data before you write the answer',
                    sql: code`
                        SELECT COUNT(*) AS orders,
                               COUNT(DISTINCT customer_id) AS customers_who_ordered,
                               SUM(CASE WHEN amount IS NULL THEN 1 ELSE 0 END) AS missing_amounts
                        FROM orders;
                    `,
                    result: { columns: ['orders', 'customers_who_ordered', 'missing_amounts'], rows: [[10, 4, 1]] },
                    note: 'Thirty seconds of this tells you there are missing amounts to mention, and how many rows to expect.',
                },
                {
                    title: 'Steps 4 and 5: write it in steps, then check a number',
                    sql: code`
                        WITH delivered AS (
                          SELECT customer_id, amount
                          FROM orders
                          WHERE status = 'delivered'
                        )
                        SELECT COALESCE(c.city, 'unknown') AS city,
                               SUM(d.amount) AS delivered_revenue
                        FROM delivered d
                        JOIN customers c ON c.customer_id = d.customer_id
                        GROUP BY COALESCE(c.city, 'unknown')
                        ORDER BY delivered_revenue DESC;
                    `,
                    result: { columns: ['city', 'delivered_revenue'], rows: [['London', 335], ['Leeds', 275]] },
                    note: 'Check by hand: London is Priya\'s 275 delivered plus Lena\'s 60. Zoe (no city) has no delivered order, so "unknown" doesn\'t appear.',
                },
            ],
            keyPoints: [
                'Clarify first: ties, NULLs, duplicates, date ranges, and what "per" means.',
                'Know each table\'s grain and keys before joining.',
                'Think out loud — the interviewer is grading your reasoning.',
                'Write CTEs, one step each, named after what they hold.',
                'Verify: a row count, one total worked out by hand, and the edge cases said out loud.',
            ],
            mistakes: [
                'Typing straight away and writing one huge nested query.',
                'Not asking about ties, then using LIMIT 1 when two rows tie.',
                'Stopping when the query runs, without checking that the answer is right.',
            ],
            dialects: [
                'If the interviewer doesn\'t name a database, say "I\'ll write PostgreSQL" — it is the most common choice, and it means DATE_TRUNC, ::date casts and FILTER are all available.',
            ],
            interviewAnswer: 'I start by restating the question and asking about edge cases — ties, NULLs, duplicates, the time window. Then I look at the tables to understand the grain and how they join, explain my plan in steps, and write it as a chain of CTEs so each step is readable and testable. Finally I sanity-check the output — row counts and one number I can verify by hand — and walk through how the query handles the edge cases.',
            followUps: [
                { q: 'What do you do if you don\'t know the exact function name in their database?', a: 'Say so, write the closest version you know (for example DATE_TRUNC), and explain what it does. Interviewers care about the logic, not the exact spelling.' },
                { q: 'How do you check a query when you can\'t run it?', a: 'Walk two or three rows through each step by hand, especially a NULL row and a tie.' },
            ],
            practice: {
                explain: 'Say the five steps from memory, with one sentence on why each matters.',
                write: 'Use the five steps on: "Which product category had the most units sold in February?" Write your clarifying questions first.',
                predict: 'Before running the city query, predict its result if cancelled orders were included too.',
                edge: 'List three edge cases you would raise for "What is the average order value per customer?" and how each changes the query.',
            },
            resources: [
                leetCodeSql50,
                dataLemur('SQL interview questions'),
                watch('how to approach sql interview questions', 'How to approach SQL interview questions (video)'),
            ],
        },
        {
            id: 'sql8-t2',
            kind: 'lesson',
            name: 'Quick-fire SQL theory questions',
            priority: 'must',
            definition: 'Short "what is the difference between…" questions that open many SQL interviews; each is best answered with a one-line definition of both sides, the key difference, and when you would use each.',
            problem: 'These questions take thirty seconds each but set the tone for the interview. A crisp answer shows you really understand the tool; a vague one makes the interviewer dig deeper. They are collected here so you can revise them in one place.',
            idea: 'Use the same three-part shape every time. One: define both things in a sentence each. Two: state the difference that matters. Three: say when you would choose each, ideally with an example. Keep it under thirty seconds, then stop — let them ask for more. Open the follow-up questions below and answer each one out loud before showing the answer.',
            analogy: 'Penalty practice. You don\'t learn penalties by thinking about them; you take the same kick again and again until it is automatic, so it holds up under pressure.',
            breaks: 'A penalty is the same every time. Interviewers rephrase questions, so learn the idea behind each answer, not just the words.',
            howItWorks: [
                'Define both sides: "WHERE filters rows; HAVING filters groups."',
                'Give the difference that matters: "WHERE runs before grouping, so it can\'t use aggregates."',
                'Say when to use each: "Row conditions in WHERE, aggregate conditions in HAVING."',
                'Offer a tiny example if it helps, then stop talking.',
            ],
            diagram: {
                code: 'flowchart LR\n  Q["a difference-between<br/>question"] --> D["1 define both"] --> K["2 the key difference"] --> W["3 when to use each<br/>plus a tiny example"]',
                caption: 'One shape for every theory question: define both, give the difference that matters, say when you would use each — in under thirty seconds.',
            },
            examples: [
                {
                    title: 'Four classic answers, checked in one query',
                    sql: code`
                        SELECT (SELECT COUNT(*) FROM employees) AS count_star,
                               (SELECT COUNT(manager_id) FROM employees) AS count_column,
                               (SELECT COUNT(*) FROM (SELECT location FROM departments
                                                      UNION SELECT city FROM customers) AS u) AS union_rows,
                               (SELECT COUNT(*) FROM (SELECT location FROM departments
                                                      UNION ALL SELECT city FROM customers) AS ua) AS union_all_rows;
                    `,
                    result: { columns: ['count_star', 'count_column', 'union_rows', 'union_all_rows'], rows: [[8, 7, 5, 10]] },
                    note: '`COUNT(*)` counts rows, `COUNT(column)` skips NULLs; UNION removes duplicates, UNION ALL keeps them.',
                },
            ],
            keyPoints: [
                'Shape: define both, the key difference, when to use each.',
                'Keep it under thirty seconds, then stop.',
                'Use a tiny example from tables you know, like employees and orders.',
                'Revise the follow-up questions below out loud until each answer is automatic.',
            ],
            mistakes: [
                'Rambling for two minutes on a thirty-second question.',
                'Giving only one side ("HAVING is for groups") without the contrast.',
                'Memorising words without the reason, then freezing when the question is rephrased.',
            ],
            interviewAnswer: 'For any "what\'s the difference" question I give a one-line definition of each, the difference that matters in practice, and when I would choose each. For example: WHERE filters rows before grouping and can\'t use aggregates; HAVING filters groups after GROUP BY and can — so row conditions go in WHERE and aggregate conditions in HAVING.',
            followUps: [
                { q: 'WHERE vs HAVING?', a: 'WHERE filters rows before grouping and can\'t use aggregates; HAVING filters groups after GROUP BY and can.' },
                { q: 'INNER JOIN vs LEFT JOIN?', a: 'INNER keeps only rows that match on both sides; LEFT keeps every left row and fills NULLs where the right has no match.' },
                { q: 'UNION vs UNION ALL?', a: 'UNION removes duplicate rows; UNION ALL keeps every row and is faster.' },
                { q: 'DELETE vs TRUNCATE vs DROP?', a: 'DELETE removes chosen rows (WHERE, logged, can roll back); TRUNCATE empties the whole table fast; DROP removes the table itself.' },
                { q: 'Primary key vs unique key?', a: 'Both forbid duplicates. One primary key per table and never NULL; many unique keys allowed, and they usually allow NULLs.' },
                { q: 'RANK vs DENSE_RANK vs ROW_NUMBER?', a: 'ROW_NUMBER: 1, 2, 3, 4. RANK: ties share, then a gap (1, 2, 2, 4). DENSE_RANK: ties share, no gap (1, 2, 2, 3).' },
                { q: '`COUNT(*)` vs `COUNT(column)`?', a: '`COUNT(*)` counts rows; `COUNT(column)` counts rows where that column isn\'t NULL.' },
                { q: 'What does NULL = NULL return?', a: 'NULL (unknown), not true. Use IS NULL.' },
                { q: 'Subquery vs CTE?', a: 'Both are queries inside a query. A CTE is named, defined at the top, reusable within the statement, can be recursive, and reads top to bottom.' },
                { q: 'Correlated vs non-correlated subquery?', a: 'A non-correlated subquery runs once on its own; a correlated one uses columns from the outer row, so logically it runs once per outer row.' },
                { q: 'Clustered vs non-clustered index?', a: 'A clustered index is the table itself stored in key order (one per table); a non-clustered index is a separate sorted structure pointing to rows.' },
                { q: 'Why not index every column?', a: 'Each index slows down every insert, update and delete and uses space; index the columns you filter, join and sort by.' },
                { q: 'What is normalisation?', a: 'Designing tables so each fact is stored once (usually to 3NF), which prevents update anomalies, at the cost of more joins.' },
                { q: 'What does ACID stand for?', a: 'Atomicity, Consistency, Isolation, Durability — the guarantees of a database transaction.' },
                { q: 'View vs materialised view?', a: 'A view is a saved query, always fresh, no stored data; a materialised view stores the result, fast to read, stale until refreshed.' },
                { q: 'OLTP vs OLAP?', a: 'OLTP systems handle many small, fast reads and writes (an app\'s database, normalised); OLAP systems handle big analytical queries over lots of history (a data warehouse, often denormalised).' },
            ],
            practice: {
                explain: 'Answer five follow-up questions below out loud, without opening the answers, each in under thirty seconds.',
                write: 'Write one query that shows the difference between INNER JOIN and LEFT JOIN on departments and employees, as two counts in one row.',
                predict: 'What does `SELECT COUNT(DISTINCT city), COUNT(city), COUNT(*) FROM customers;` return?',
                edge: 'Explain why `SELECT DISTINCT` and `GROUP BY` can give the same rows, and when they don\'t.',
            },
            resources: [
                leetCodeSql50,
                modeTutorial('The SQL Tutorial for Data Analysis'),
                watch('top sql interview questions and answers', 'Top SQL interview questions (video)'),
            ],
        },
        {
            id: 'sql8-p1',
            kind: 'problem',
            name: 'The second highest salary (and the Nth)',
            priority: 'must',
            difficulty: 'easy',
            definition: 'Return the second highest salary from employees. If there is no second highest salary, return NULL.',
            problem: 'Whether you think about ties and about "no answer". LIMIT 1 OFFSET 1 is wrong when two people share the top salary, and many answers return no row at all instead of NULL.',
            pattern: 'Nth highest value',
            spot: 'The words "second highest", "Nth largest", "third most recent". The answer is a value, not a person, so ties must collapse: think DENSE_RANK or DISTINCT.',
            tables: ['employees'],
            approach: [
                'Ask: if two people tie for the highest salary, is the "second highest" the next different amount? (Usually yes.)',
                'Rank the distinct salaries from highest down, so ties share a rank and no number is skipped.',
                'Keep the salary ranked 2.',
                'Wrap it so that "no such salary" gives one row containing NULL, not an empty result — an aggregate like MAX does this.',
            ],
            diagram: {
                code: 'flowchart LR\n  S["salaries high to low<br/>95000 · 80000 · 70000 · 70000 · 60000 …"] --> R["DENSE_RANK<br/>1 · 2 · 3 · 3 · 4 …"]\n  R --> K["keep rank 2<br/>80000"]',
                caption: 'DENSE_RANK gives tied salaries the same rank without leaving gaps, so "rank 2" is always the second-highest different amount.',
            },
            solution: {
                title: 'Solution: DENSE_RANK, wrapped in MAX',
                sql: code`
                    WITH ranked AS (
                      SELECT salary,
                             DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
                      FROM employees
                    )
                    SELECT MAX(salary) AS second_highest
                    FROM ranked
                    WHERE rnk = 2;
                `,
                result: { columns: ['second_highest'], rows: [[80000]] },
                note: 'MAX over no rows returns NULL, so if there were no second salary you would still get one row with NULL. Change 2 to N for the Nth highest.',
            },
            alternatives: [
                {
                    title: 'Without window functions: the highest below the highest',
                    sql: code`
                        SELECT MAX(salary) AS second_highest
                        FROM employees
                        WHERE salary < (SELECT MAX(salary) FROM employees);
                    `,
                    result: { columns: ['second_highest'], rows: [[80000]] },
                    note: 'Short and clear for "second", but it doesn\'t generalise neatly to the Nth.',
                },
                {
                    title: 'DISTINCT with LIMIT and OFFSET, inside a scalar subquery',
                    sql: code`
                        SELECT (
                          SELECT DISTINCT salary
                          FROM employees
                          ORDER BY salary DESC
                          LIMIT 1 OFFSET 1
                        ) AS second_highest;
                    `,
                    result: { columns: ['second_highest'], rows: [[80000]] },
                    note: 'DISTINCT makes ties collapse; the outer SELECT turns "no row" into NULL.',
                },
            ],
            edgeCases: [
                'Ties for first: two people on 95000 — the answer is still the next different salary, 80000.',
                'Fewer than two different salaries: return NULL, not an empty result.',
                'NULL salaries: ignored by ranking and MAX, which is usually what you want — say so.',
            ],
            mistakes: [
                '`ORDER BY salary DESC LIMIT 1 OFFSET 1` without DISTINCT: returns the top salary again when two people tie for first.',
                'Using RANK: after a tie for first, there is no rank 2.',
                'Returning an empty result when the question asked for NULL.',
            ],
            interviewAnswer: 'I first confirm that ties should collapse, so the second highest is the second different amount. Then I rank salaries with DENSE_RANK in descending order — dense so a tie doesn\'t skip a number — and take rank 2. I wrap it in MAX so that if there is no second salary I return a single NULL instead of no rows, and for the Nth highest I just change the 2.',
            followUps: [
                { q: 'How would you return the employees who earn the second highest salary?', a: 'Keep the DENSE_RANK CTE with names in it and select every row `WHERE rnk = 2`.' },
                { q: 'Why DENSE_RANK and not RANK?', a: 'With RANK, a tie at the top makes the next rank 3, so rank 2 would not exist.' },
            ],
            practice: {
                explain: 'Explain why LIMIT 1 OFFSET 1 can give the wrong answer here, using a tie example.',
                write: 'Return the third highest salary, and then the second highest salary within each department.',
                predict: 'If Hana\'s salary were changed to 95000, what would the solution return?',
                edge: 'What does your query return on an empty employees table? Make sure it is one row with NULL.',
            },
            resources: [
                leetCodeSql50,
                dataLemur('second highest salary'),
            ],
        },
        {
            id: 'sql8-p2',
            kind: 'problem',
            name: 'Employees who earn more than their manager',
            priority: 'must',
            difficulty: 'easy',
            definition: 'Find every employee who earns more than their own manager. Show the employee\'s name and salary, and the manager\'s name and salary.',
            problem: 'Whether you can treat one table as two — a self join — and read a self-referencing key the right way round.',
            pattern: 'Self join',
            spot: '"Their manager", "their parent", "the person who referred them" — a column pointing at another row of the same table.',
            tables: ['employees'],
            approach: [
                'Notice that manager_id points to another row of employees.',
                'Use the table twice: e for the employee, m for the manager.',
                'Join with `m.emp_id = e.manager_id` (m is e\'s manager).',
                'Keep rows where e.salary > m.salary. An inner join is fine here: people with no manager can\'t earn more than one.',
            ],
            diagram: {
                code: 'flowchart LR\n  H["e: Hana · 80000<br/>manager_id 2"] -->|"m.emp_id = e.manager_id"| B["m: Ben · 70000"]\n  B --> C{"80000 more than 70000?"}\n  C -->|"yes"| K["keep Hana"]',
                caption: 'Each employee row is paired with its manager\'s row from the same table, and the two salaries are compared side by side.',
            },
            solution: {
                title: 'Solution: a self join',
                sql: code`
                    SELECT e.name AS employee, e.salary,
                           m.name AS manager, m.salary AS manager_salary
                    FROM employees e
                    JOIN employees m ON m.emp_id = e.manager_id
                    WHERE e.salary > m.salary
                    ORDER BY e.name;
                `,
                result: { columns: ['employee', 'salary', 'manager', 'manager_salary'], rows: [['Hana', 80000, 'Ben', 70000]] },
            },
            alternatives: [
                {
                    title: 'A correlated subquery',
                    sql: code`
                        SELECT e.name AS employee
                        FROM employees e
                        WHERE e.salary > (
                          SELECT m.salary
                          FROM employees m
                          WHERE m.emp_id = e.manager_id
                        )
                        ORDER BY e.name;
                    `,
                    result: { columns: ['employee'], rows: [['Hana']] },
                    note: 'Works, but can\'t show the manager\'s name without another subquery. The self join is clearer.',
                },
            ],
            edgeCases: [
                'Employees with no manager (Asha): the inner join drops them, which is correct here.',
                'Equal salaries: "more than" means strictly greater, so a tie is not included — confirm with the interviewer.',
                'A manager_id that points to a deleted employee: the inner join drops the row; a foreign key should prevent it.',
            ],
            mistakes: [
                'Joining the wrong way round (`e.emp_id = m.manager_id`), which compares people with their reports.',
                'Leaving columns unprefixed, so name and salary are ambiguous.',
            ],
            interviewAnswer: 'manager_id references the same table, so I self-join employees as e and m, matching the manager alias\'s emp_id to the employee\'s manager_id, and filter where the employee\'s salary is greater than the manager\'s. An inner join is right here because someone without a manager can\'t out-earn one.',
            followUps: [
                { q: 'How would you include the manager\'s manager?', a: 'Join employees a third time: `JOIN employees mm ON mm.emp_id = m.manager_id`, as a LEFT JOIN if the chain can end.' },
                { q: 'How would you count, per manager, how many reports earn more than them?', a: 'Same self join and filter, then GROUP BY m.emp_id, m.name with `COUNT(*)`.' },
            ],
            practice: {
                explain: 'Explain what each alias stands for and why the join condition is written that way round.',
                write: 'Find employees who were hired before their manager.',
                predict: 'If Eli\'s salary rose to 61000, which rows would the solution return?',
                edge: 'Change the solution to also list employees with no manager, showing NULL for the manager columns.',
            },
            resources: [
                leetCodeSql50,
                pgExercises('Joins and Subqueries'),
            ],
        },
        {
            id: 'sql8-p3',
            kind: 'problem',
            name: 'Customers who have never had an order delivered',
            priority: 'must',
            difficulty: 'easy',
            definition: 'List every customer who has never had an order delivered — including customers who have never ordered at all.',
            problem: 'Anti-joins, and the classic trap of putting a condition on the right-hand table in WHERE after a LEFT JOIN, which silently removes the customers you are looking for.',
            pattern: 'Rows with no match (anti-join)',
            spot: '"Never", "no", "without", "haven\'t" — you are looking for something that isn\'t there.',
            tables: ['customers', 'orders'],
            approach: [
                'Start from customers, because every customer must be considered — including ones with no orders.',
                'Look for a delivered order belonging to each customer.',
                'Keep the customers for whom none exists: NOT EXISTS, or a LEFT JOIN with the status test inside ON and `WHERE o.order_id IS NULL`.',
                'Check: Omar and the second Tom never ordered; Zoe only has a pending order.',
            ],
            diagram: {
                code: 'flowchart LR\n  C["every customer"] --> Q{"any delivered order<br/>for this customer?"}\n  Q -->|"yes: Priya, Tom, Lena"| X["dropped"]\n  Q -->|"no: Omar, Zoe, Tom 6"| K["kept"]',
                caption: 'For each customer, ask one question: does a delivered order exist? Keep the customers where the answer is no.',
            },
            solution: {
                title: 'Solution: NOT EXISTS',
                sql: code`
                    SELECT c.customer_id, c.name
                    FROM customers c
                    WHERE NOT EXISTS (
                      SELECT 1
                      FROM orders o
                      WHERE o.customer_id = c.customer_id
                        AND o.status = 'delivered'
                    )
                    ORDER BY c.customer_id;
                `,
                result: { columns: ['customer_id', 'name'], rows: [[4, 'Omar'], [5, 'Zoe'], [6, 'Tom']] },
            },
            alternatives: [
                {
                    title: 'LEFT JOIN with the condition in ON',
                    sql: code`
                        SELECT c.customer_id, c.name
                        FROM customers c
                        LEFT JOIN orders o
                          ON o.customer_id = c.customer_id
                         AND o.status = 'delivered'
                        WHERE o.order_id IS NULL
                        ORDER BY c.customer_id;
                    `,
                    result: { columns: ['customer_id', 'name'], rows: [[4, 'Omar'], [5, 'Zoe'], [6, 'Tom']] },
                    note: 'The status test must be in ON. In WHERE, `o.status = \'delivered\' AND o.order_id IS NULL` could never both be true, and the query would return nothing.',
                },
            ],
            edgeCases: [
                'Customers with no orders at all: must be included — that is why we start from customers.',
                'Customers whose only orders are cancelled or pending (Zoe): included.',
                'Orders with a NULL status: they are not delivered, so they don\'t count — NOT EXISTS handles this correctly.',
            ],
            mistakes: [
                '`LEFT JOIN … WHERE o.status <> \'delivered\'`: drops customers with no orders and keeps customers who also have delivered orders.',
                '`WHERE customer_id NOT IN (SELECT customer_id FROM orders WHERE status = \'delivered\')` is fine here only because customer_id is NOT NULL in orders — say that out loud.',
                'Starting from orders, which can never return customers who have no orders.',
            ],
            interviewAnswer: 'This is an anti-join. I drive it from customers so customers with no orders are included, and keep those for which NOT EXISTS finds a delivered order. Equivalently, a LEFT JOIN with the status filter inside the ON clause and WHERE the order id IS NULL. The trap is putting the status filter in WHERE, which turns the left join into an inner join.',
            followUps: [
                { q: 'Why not NOT IN?', a: 'If the subquery could return a NULL, NOT IN returns nothing. NOT EXISTS is always safe.' },
                { q: 'How would you also show how many orders each of these customers has?', a: 'LEFT JOIN orders (all statuses) and `COUNT(o.order_id)`, grouped by customer, keeping the anti-join as a filter.' },
            ],
            practice: {
                explain: 'Explain why the status condition must go in ON, not WHERE, in the LEFT JOIN version.',
                write: 'List products that have never been part of a delivered order.',
                predict: 'What does the LEFT JOIN version return if you move the status test into WHERE?',
                edge: 'What should happen to a customer whose only order has a NULL status? Does your query do that?',
            },
            resources: [
                leetCodeSql50,
                dataLemur('anti-join questions'),
            ],
        },
        {
            id: 'sql8-p4',
            kind: 'problem',
            name: 'Find duplicate emails, then remove the duplicates',
            priority: 'must',
            difficulty: 'easy',
            definition: 'Find every email that belongs to more than one customer, with how many sign-ups it has. Then delete the duplicates, keeping the row with the lowest customer_id.',
            problem: 'GROUP BY with HAVING, the ROW_NUMBER pattern for picking one row per group, and writing a safe DELETE.',
            pattern: 'Duplicates (GROUP BY … HAVING COUNT(*) > 1)',
            spot: '"Duplicate", "appears more than once", "keep only one", "de-duplicate".',
            tables: ['customers'],
            approach: [
                'Group by the column that should be unique (email).',
                'Keep groups with more than one row: HAVING `COUNT(*) > 1`.',
                'To see the extra rows themselves, number the rows in each email group by customer_id and keep row numbers above 1.',
                'To delete them, keep the `MIN(customer_id)` per email and delete everything else. Run it as a SELECT first.',
            ],
            diagram: {
                code: 'flowchart LR\n  A["customers grouped by email"] --> T["tom@mail.com<br/>id 2 · id 6"]\n  A --> O["other emails<br/>one row each"]\n  T -->|"COUNT is 2"| D["duplicate:<br/>keep id 2, remove id 6"]',
                caption: 'Grouping by email puts both of Tom\'s sign-ups in one group. A group of two is a duplicate; keep the lowest id and remove the rest.',
            },
            solution: {
                title: 'Solution: find them with GROUP BY and HAVING',
                sql: code`
                    SELECT email, COUNT(*) AS sign_ups
                    FROM customers
                    GROUP BY email
                    HAVING COUNT(*) > 1
                    ORDER BY email;
                `,
                result: { columns: ['email', 'sign_ups'], rows: [['tom@mail.com', 2]] },
            },
            alternatives: [
                {
                    title: 'Show the extra rows with ROW_NUMBER',
                    sql: code`
                        WITH numbered AS (
                          SELECT customer_id, name, email,
                                 ROW_NUMBER() OVER (PARTITION BY email ORDER BY customer_id) AS rn
                          FROM customers
                        )
                        SELECT customer_id, name, email
                        FROM numbered
                        WHERE rn > 1
                        ORDER BY customer_id;
                    `,
                    result: { columns: ['customer_id', 'name', 'email'], rows: [[6, 'Tom', 'tom@mail.com']] },
                    note: 'These are the rows to remove: every row except the first in its email group.',
                },
                {
                    title: 'Delete the duplicates, keeping the lowest id',
                    sql: code`
                        DELETE FROM customers
                        WHERE customer_id NOT IN (
                          SELECT MIN(customer_id)
                          FROM customers
                          GROUP BY email
                        );
                        SELECT customer_id, name, email
                        FROM customers
                        ORDER BY customer_id;
                    `,
                    result: {
                        columns: ['customer_id', 'name', 'email'],
                        rows: [[1, 'Priya', 'priya@mail.com'], [2, 'Tom', 'tom@mail.com'], [3, 'Lena', 'lena@mail.com'], [4, 'Omar', 'omar@mail.com'], [5, 'Zoe', 'zoe@mail.com']],
                    },
                    note: 'NOT IN is safe here because `MIN(customer_id)` is never NULL. Then add a UNIQUE constraint on email so it can\'t happen again.',
                },
            ],
            edgeCases: [
                'Case and spaces: \'Tom@mail.com \' and \'tom@mail.com\' are different strings — normalise with `LOWER(TRIM(email))` if they should match.',
                'NULL emails group together in GROUP BY: decide whether they count as duplicates.',
                'If the duplicate rows have orders, the foreign key blocks the delete — re-point those orders to the kept id first.',
            ],
            mistakes: [
                'Using WHERE `COUNT(*) > 1` instead of HAVING.',
                'Deleting without checking the rows first with a SELECT.',
                'Fixing the data but not adding a UNIQUE constraint, so duplicates come straight back.',
            ],
            dialects: [
                'MySQL can\'t delete from a table while selecting from it in a subquery; wrap the subquery in another SELECT or use a DELETE … JOIN.',
            ],
            interviewAnswer: 'To find duplicates I group by the column that should be unique and keep groups with HAVING COUNT star greater than one. To remove them I number the rows within each group with ROW_NUMBER — or take the minimum id per group — and delete every row that isn\'t the keeper, checking it as a SELECT first. Then I\'d add a unique constraint, and I\'d ask whether emails need normalising for case and spaces before comparing.',
            followUps: [
                { q: 'How would you keep the most recent sign-up instead?', a: 'Order the ROW_NUMBER by signup_date DESC (with customer_id as a tiebreaker), or keep `MAX(customer_id)` if ids grow over time.' },
                { q: 'What if the duplicate customer has orders?', a: 'Update those orders to point at the kept customer_id first, in the same transaction, then delete.' },
            ],
            practice: {
                explain: 'Explain why HAVING and not WHERE is used to find duplicates.',
                write: 'Find customers who share the same name and city, and how many rows each pair has.',
                predict: 'What would the first query return if Zoe\'s email were changed to \'priya@mail.com\'?',
                edge: 'Rewrite the duplicate check so \'TOM@mail.com\' and \'tom@mail.com\' count as the same email.',
            },
            resources: [
                leetCodeSql50,
                dataLemur('duplicate rows questions'),
            ],
        },
        {
            id: 'sql8-p5',
            kind: 'problem',
            name: 'The highest-paid employee in each department',
            priority: 'must',
            difficulty: 'medium',
            definition: 'For each department, return the employee (or employees, if tied) with the highest salary. Show the department name, the employee\'s name and their salary.',
            problem: 'The most common window-function question: top N per group, including how to handle ties and how to filter on a window function.',
            pattern: 'Top N per group',
            spot: '"In each", "per", "for every" together with "highest", "top 3", "most recent", "first".',
            tables: ['employees', 'departments'],
            approach: [
                'Ask: if two people tie for top salary in a department, show both? (Yes here.)',
                'Rank employees within each department by salary, highest first: `RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)`.',
                'RANK keeps ties together; ROW_NUMBER would pick one at random.',
                'Do the ranking in a CTE, then keep rank 1 outside it, and join departments for the name.',
            ],
            diagram: {
                code: 'flowchart LR\n  E["employees"] --> P["PARTITION BY dept_id<br/>ORDER BY salary DESC"]\n  P --> D1["Engineering: Asha 1, Hana 2, Ben 3, Chen 3"]\n  P --> D2["Sales: Dara 1, Eli 2"]\n  P --> D3["Marketing: Fatima 1"]\n  D1 --> K["keep rank 1 in each"]\n  D2 --> K\n  D3 --> K',
                caption: 'Rank inside each department separately, then keep the rows ranked 1. Every department gets its own number one.',
            },
            solution: {
                title: 'Solution: RANK in a CTE, filter outside',
                sql: code`
                    WITH ranked AS (
                      SELECT d.dept_name, e.name, e.salary,
                             RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rnk
                      FROM employees e
                      JOIN departments d ON d.dept_id = e.dept_id
                    )
                    SELECT dept_name, name, salary
                    FROM ranked
                    WHERE rnk = 1
                    ORDER BY dept_name;
                `,
                result: { columns: ['dept_name', 'name', 'salary'], rows: [['Engineering', 'Asha', 95000], ['Marketing', 'Fatima', 52000], ['Sales', 'Dara', 60000]] },
            },
            alternatives: [
                {
                    title: 'Without window functions: match the department maximum',
                    sql: code`
                        SELECT d.dept_name, e.name, e.salary
                        FROM employees e
                        JOIN departments d ON d.dept_id = e.dept_id
                        WHERE e.salary = (
                          SELECT MAX(e2.salary)
                          FROM employees e2
                          WHERE e2.dept_id = e.dept_id
                        )
                        ORDER BY d.dept_name;
                    `,
                    result: { columns: ['dept_name', 'name', 'salary'], rows: [['Engineering', 'Asha', 95000], ['Marketing', 'Fatima', 52000], ['Sales', 'Dara', 60000]] },
                    note: 'Also keeps ties. Harder to extend to "top 3" than the window version.',
                },
            ],
            edgeCases: [
                'Ties for the top: RANK (or DENSE_RANK) returns all of them; ROW_NUMBER returns one.',
                'Departments with no employees (HR): not in the result. Ask whether they should appear with NULLs (then LEFT JOIN from departments).',
                'Employees with no department (Gus): dropped by the inner join to departments.',
            ],
            mistakes: [
                'Putting the window function in WHERE.',
                '`GROUP BY dept_id` with `MAX(salary)` and `name` in SELECT — the name isn\'t guaranteed to belong to the max.',
                'Using ROW_NUMBER when ties should all be returned.',
            ],
            interviewAnswer: 'This is top-N-per-group. I rank employees within each department with RANK partitioned by department and ordered by salary descending, in a CTE, then filter to rank one outside — window functions can\'t go in WHERE. I use RANK so tied top earners are all returned; if they wanted exactly one per department I\'d switch to ROW_NUMBER with a tiebreaker. For "top three salaries" I\'d use DENSE_RANK less than or equal to three.',
            followUps: [
                { q: 'How would you return the top 3 salaries in each department?', a: '`DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) <= 3`, so that three different salary amounts are covered, with ties.' },
                { q: 'Why not GROUP BY dept_id with `MAX(salary)`?', a: 'That gives the top amount per department, but not who earns it. You would have to join back, and that is the alternative solution.' },
            ],
            practice: {
                explain: 'Explain why the rank must be computed in a CTE and filtered outside.',
                write: 'Return the two highest-paid employees in each department, including ties.',
                predict: 'What does the solution return if Hana\'s salary becomes 95000?',
                edge: 'Change the query so HR appears with NULL name and salary.',
            },
            resources: [
                leetCodeSql50,
                dataLemur('top N per group questions'),
                modeTutorial('SQL Window Functions'),
            ],
        },
        {
            id: 'sql8-p6',
            kind: 'problem',
            name: 'Employees paid above their department\'s average',
            priority: 'should',
            difficulty: 'medium',
            definition: 'List employees whose salary is above the average salary of their own department, showing that average next to them.',
            problem: 'Comparing a row with an aggregate of its own group — three valid ways (window function, join to a grouped subquery, correlated subquery) and knowing when each fits.',
            pattern: 'Compare a row with its group',
            spot: '"Above the average for their…", "more than their team\'s…", "compared with others in the same…".',
            tables: ['employees'],
            approach: [
                'Work out each department\'s average salary.',
                'Put that average next to each employee — a window function does both in one step.',
                'Keep rows where salary > the department average, filtering outside the CTE.',
                'Decide what to do with Gus, who has no department.',
            ],
            diagram: {
                code: 'flowchart LR\n  E["each employee"] --> A["AVG(salary) OVER<br/>(PARTITION BY dept_id)"]\n  A --> C{"salary above<br/>dept average?"}\n  C -->|"yes"| K["Asha, Hana, Dara"]',
                caption: 'Every employee gets their own department\'s average beside them; then a simple comparison picks those above it.',
            },
            solution: {
                title: 'Solution: a window average, filtered outside',
                sql: code`
                    WITH with_avg AS (
                      SELECT name, dept_id, salary,
                             AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
                      FROM employees
                    )
                    SELECT name, dept_id, salary, dept_avg
                    FROM with_avg
                    WHERE salary > dept_avg
                    ORDER BY dept_id, salary DESC;
                `,
                result: { columns: ['name', 'dept_id', 'salary', 'dept_avg'], rows: [['Asha', 1, 95000, 78750], ['Hana', 1, 80000, 78750], ['Dara', 2, 60000, 52500]] },
                note: 'Fatima is alone in Marketing, so she equals her own average. Gus forms a NULL group of one and also equals his average.',
            },
            alternatives: [
                {
                    title: 'Join to a grouped subquery',
                    sql: code`
                        SELECT e.name, e.dept_id, e.salary, a.dept_avg
                        FROM employees e
                        JOIN (
                          SELECT dept_id, AVG(salary) AS dept_avg
                          FROM employees
                          GROUP BY dept_id
                        ) AS a ON a.dept_id = e.dept_id
                        WHERE e.salary > a.dept_avg
                        ORDER BY e.dept_id, e.salary DESC;
                    `,
                    result: { columns: ['name', 'dept_id', 'salary', 'dept_avg'], rows: [['Asha', 1, 95000, 78750], ['Hana', 1, 80000, 78750], ['Dara', 2, 60000, 52500]] },
                    note: 'Works in any database, even without window functions. Gus drops out here because NULL = NULL is not true in the join.',
                },
            ],
            edgeCases: [
                'An employee with no department: the window version groups NULLs together; the join version drops them. Ask which is wanted.',
                'A department of one person can never be above its own average.',
                '"Above" means strictly greater; say so.',
            ],
            mistakes: [
                '`WHERE salary > AVG(salary)` — an aggregate in WHERE is not allowed, and it would be the company average anyway.',
                'Comparing with the company average when the question says "their department".',
                'Filtering on the window function in the same SELECT\'s WHERE.',
            ],
            interviewAnswer: 'I need each employee\'s department average next to their row, so I compute AVG of salary over a window partitioned by department in a CTE, and keep rows where salary exceeds it. An equivalent approach joins employees to a grouped subquery of averages per department. I\'d mention the NULL-department case, since the two approaches treat it differently.',
            followUps: [
                { q: 'How would you show how far above the average each person is, as a percentage?', a: '`ROUND(100.0 * (salary - dept_avg) / dept_avg, 1)` in the outer query.' },
                { q: 'Which approach is fastest?', a: 'Usually the window function, because it reads the table once. The optimiser often makes them similar; check the plan.' },
            ],
            practice: {
                explain: 'Explain the three ways to compare a row with its group\'s average.',
                write: 'List orders whose amount is above that customer\'s average order amount.',
                predict: 'If Chen\'s salary rose to 90000, who would the solution return?',
                edge: 'Make the solution exclude employees with no department, and explain why the join version already does.',
            },
            resources: [
                dataLemur('window function questions'),
                postgresDocs('tutorial-window.html', 'Window Functions (tutorial)'),
            ],
        },
        {
            id: 'sql8-p7',
            kind: 'problem',
            name: 'Month-over-month revenue growth',
            priority: 'must',
            difficulty: 'medium',
            definition: 'For each month, show the revenue and the percentage change from the previous month, rounded to one decimal place.',
            problem: 'Aggregating to the right grain first, then LAG, then safe percentage maths — integer division and division by zero included.',
            pattern: 'Period-over-period change',
            spot: '"Growth", "change from the previous", "month over month", "compared with last week".',
            tables: ['orders'],
            approach: [
                'Aggregate orders to one row per month first (a CTE).',
                'Use `LAG(revenue) OVER (ORDER BY month)` to bring last month\'s revenue onto each row.',
                'Growth % = 100.0 × (this − last) ÷ last. Use 100.0 to avoid integer division and `NULLIF(last, 0)` to avoid dividing by zero.',
                'The first month has no previous month, so its growth is NULL.',
            ],
            diagram: {
                code: 'flowchart LR\n  O["orders"] --> M["monthly revenue<br/>Jan 445 · Feb 210 · Mar 138"]\n  M --> L["LAG brings the month before<br/>Feb sees 445 · Mar sees 210"]\n  L --> G["growth %<br/>Feb −52.8 · Mar −34.3"]',
                caption: 'First shrink orders to one row per month, then let each month look back at the one before it with LAG, then do the percentage maths.',
            },
            solution: {
                title: 'Solution: monthly CTE, then LAG',
                sql: code`
                    WITH monthly AS (
                      SELECT strftime('%Y-%m', order_date) AS month,
                             SUM(amount) AS revenue
                      FROM orders
                      GROUP BY strftime('%Y-%m', order_date)
                    )
                    SELECT month, revenue,
                           ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
                                 / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
                    FROM monthly
                    ORDER BY month;
                `,
                result: { columns: ['month', 'revenue', 'growth_pct'], rows: [['2024-01', 445, null], ['2024-02', 210, -52.8], ['2024-03', 138, -34.3]] },
            },
            alternatives: [
                {
                    title: 'A named window, and a guard against dividing by zero',
                    sql: code`
                        WITH monthly AS (
                          SELECT strftime('%Y-%m', order_date) AS month,
                                 SUM(amount) AS revenue
                          FROM orders
                          GROUP BY strftime('%Y-%m', order_date)
                        )
                        SELECT month, revenue,
                               ROUND(100.0 * (revenue - LAG(revenue) OVER w)
                                     / NULLIF(LAG(revenue) OVER w, 0), 1) AS growth_pct
                        FROM monthly
                        WINDOW w AS (ORDER BY month)
                        ORDER BY month;
                    `,
                    result: { columns: ['month', 'revenue', 'growth_pct'], rows: [['2024-01', 445, null], ['2024-02', 210, -52.8], ['2024-03', 138, -34.3]] },
                    note: 'WINDOW w AS (…) names the window once. NULLIF turns a previous revenue of 0 into NULL, so the growth is NULL instead of an error.',
                },
            ],
            edgeCases: [
                'The first month: no previous month, so NULL.',
                'A previous month with 0 revenue: divide by `NULLIF(…, 0)`.',
                'A month with no orders at all has no row, so LAG would compare with two months ago — build a month list and LEFT JOIN if that matters.',
            ],
            mistakes: [
                'Using LAG on the order rows instead of the monthly totals.',
                '`(revenue - prev) / prev * 100` with whole numbers: integer division gives 0 or -1.',
                'Grouping by order_date instead of the month.',
            ],
            dialects: [
                'PostgreSQL: `DATE_TRUNC(\'month\', order_date)` for the month. MySQL: `DATE_FORMAT(order_date, \'%Y-%m\')`. SQL Server: `FORMAT(order_date, \'yyyy-MM\')` or `DATEFROMPARTS(YEAR(d), MONTH(d), 1)`.',
            ],
            interviewAnswer: 'I aggregate to one row per month in a CTE, then use LAG over month order to bring the previous month\'s revenue alongside, and compute 100.0 times the difference divided by the previous value, rounded. I guard the division with NULLIF for zero months, note that the first month is NULL, and would fill in missing months with a calendar join if gaps are possible.',
            followUps: [
                { q: 'How would you do year-over-year growth on monthly data?', a: '`LAG(revenue, 12) OVER (ORDER BY month)` — twelve rows back — assuming every month is present.' },
                { q: 'How would you compute it per product category?', a: 'Group by category and month, then `LAG(revenue) OVER (PARTITION BY category ORDER BY month)`.' },
            ],
            practice: {
                explain: 'Explain why you aggregate to months before using LAG.',
                write: 'Compute month-over-month growth in the number of orders, not revenue.',
                predict: 'What would growth_pct be for March if March revenue were 315?',
                edge: 'Show what goes wrong if you remove the 100.0 and use whole-number maths, then fix it.',
            },
            resources: [
                dataLemur('month-over-month growth questions'),
                modeTutorial('SQL Window Functions: LAG and LEAD'),
            ],
        },
        {
            id: 'sql8-p8',
            kind: 'problem',
            name: 'Each customer\'s first order',
            priority: 'must',
            difficulty: 'medium',
            definition: 'For each customer who has ordered, show their first order — its id, date and amount — and how many days after signing up they placed it.',
            problem: 'Picking exactly one row per group (the first event per user) with ROW_NUMBER, and joining back for extra columns. Used for activation, onboarding and funnel questions.',
            pattern: 'First (or latest) row per group',
            spot: '"First purchase", "most recent login", "latest status", "earliest", one per user.',
            tables: ['orders', 'customers'],
            approach: [
                'Number each customer\'s orders by date: `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id)`.',
                'Add order_id as a tiebreaker in case two orders share a date.',
                'Keep row number 1 in an outer query.',
                'Join customers for the name and sign-up date, and work out the days between.',
            ],
            diagram: {
                code: 'flowchart LR\n  O["Priya\'s orders by date<br/>101 · 102 · 103 · 105 · 109"] --> R["ROW_NUMBER<br/>1 · 2 · 3 · 4 · 5"]\n  R --> K["keep 1:<br/>order 101 on 2024-01-06"]',
                caption: 'Number each customer\'s orders from oldest to newest, then keep number 1. The same pattern with DESC gives the latest order.',
            },
            solution: {
                title: 'Solution: ROW_NUMBER = 1',
                sql: code`
                    WITH numbered AS (
                      SELECT customer_id, order_id, order_date, amount,
                             ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn
                      FROM orders
                    )
                    SELECT c.name, n.order_id, n.order_date, n.amount,
                           julianday(n.order_date) - julianday(c.signup_date) AS days_to_first_order
                    FROM numbered n
                    JOIN customers c ON c.customer_id = n.customer_id
                    WHERE n.rn = 1
                    ORDER BY c.customer_id;
                `,
                result: {
                    columns: ['name', 'order_id', 'order_date', 'amount', 'days_to_first_order'],
                    rows: [['Priya', 101, '2024-01-06', 120, 4], ['Tom', 104, '2024-01-21', 200, 1], ['Lena', 106, '2024-02-12', null, 13], ['Zoe', 110, '2024-03-16', 33, 6]],
                },
                note: 'Lena\'s first order is the cancelled one with no amount. Ask whether "first order" should mean first delivered order.',
            },
            alternatives: [
                {
                    title: 'MIN date, then match it',
                    sql: code`
                        SELECT c.name, o.order_id, o.order_date, o.amount
                        FROM orders o
                        JOIN customers c ON c.customer_id = o.customer_id
                        WHERE o.order_date = (
                          SELECT MIN(o2.order_date)
                          FROM orders o2
                          WHERE o2.customer_id = o.customer_id
                        )
                        ORDER BY c.customer_id;
                    `,
                    result: { columns: ['name', 'order_id', 'order_date', 'amount'], rows: [['Priya', 101, '2024-01-06', 120], ['Tom', 104, '2024-01-21', 200], ['Lena', 106, '2024-02-12', null], ['Zoe', 110, '2024-03-16', 33]] },
                    note: 'Returns two rows for a customer with two orders on their first day. ROW_NUMBER with a tiebreaker guarantees one.',
                },
            ],
            edgeCases: [
                'Two orders on the same first day: the tiebreaker (order_id) decides; say which one you keep.',
                'Cancelled first orders: confirm whether they count.',
                'Customers with no orders: not in the result — LEFT JOIN from customers if they should appear.',
            ],
            mistakes: [
                '`GROUP BY customer_id` with `MIN(order_date)` and `amount` in SELECT — the amount isn\'t tied to the first order.',
                'Forgetting PARTITION BY, so only one order in the whole table gets number 1.',
                'No tiebreaker in ROW_NUMBER, so the answer can change between runs.',
            ],
            dialects: [
                'PostgreSQL has a shortcut: `SELECT DISTINCT ON (customer_id) * FROM orders ORDER BY customer_id, order_date, order_id`.',
                'Days between: PostgreSQL `order_date - signup_date` for DATE columns; MySQL `DATEDIFF(order_date, signup_date)`.',
            ],
            interviewAnswer: 'For first-per-group I number rows with ROW_NUMBER partitioned by customer and ordered by date with the order id as a tiebreaker, keep row number one in an outer query, and join customers for the sign-up date to compute days to first order. I\'d confirm whether cancelled orders count, and mention that a MIN-date join can return duplicates on ties while ROW_NUMBER always returns exactly one.',
            followUps: [
                { q: 'How would you get each customer\'s latest order instead?', a: 'Order the ROW_NUMBER by order_date DESC, order_id DESC and keep row 1.' },
                { q: 'How would you find each customer\'s first delivered order?', a: 'Add `WHERE status = \'delivered\'` inside the CTE, before numbering.' },
            ],
            practice: {
                explain: 'Explain why ROW_NUMBER needs a tiebreaker here, with an example.',
                write: 'For each customer, show their latest order and its status.',
                predict: 'What would the solution return for Lena if the CTE only numbered delivered orders?',
                edge: 'Change the solution so customers with no orders appear with NULLs.',
            },
            resources: [
                leetCodeSql50,
                dataLemur('first purchase questions'),
            ],
        },
        {
            id: 'sql8-p9',
            kind: 'problem',
            name: 'Streaks: orders on consecutive days (gaps and islands)',
            priority: 'should',
            difficulty: 'hard',
            definition: 'Find every streak where a customer ordered on two or more consecutive days. Show the customer, the first and last day of the streak, and its length in days.',
            problem: 'The "gaps and islands" technique, which turns consecutive runs into groups — a favourite hard question for login streaks, consecutive wins and uninterrupted sessions.',
            pattern: 'Gaps and islands',
            spot: '"Consecutive", "in a row", "streak", "uninterrupted", "longest run".',
            tables: ['orders', 'customers'],
            approach: [
                'Reduce to one row per customer per day (DISTINCT), so two orders on one day don\'t break the count.',
                'Number each customer\'s days in order with ROW_NUMBER.',
                'Subtract the row number from the date (as a day number). Consecutive days give the same result — that value labels the island.',
                'Group by customer and that label: MIN date, MAX date and COUNT give the streak. Keep streaks of 2 or more.',
            ],
            diagram: {
                code: 'flowchart LR\n  D["Priya\'s days<br/>01-06 · 01-07 · 01-08 · 02-02 · 03-10"] --> N["minus row number<br/>1 · 2 · 3 · 4 · 5"]\n  N --> G["labels<br/>01-05 · 01-05 · 01-05 · 01-29 · 03-05"]\n  G --> I["same label = one streak<br/>01-06 to 01-08: 3 days"]',
                caption: 'Day by day the date goes up by 1 and so does the row number, so their difference stays the same across a run. A gap breaks the run and changes the label.',
            },
            solution: {
                title: 'Solution: date minus row number',
                sql: code`
                    WITH days AS (
                      SELECT DISTINCT customer_id, order_date
                      FROM orders
                    ),
                    labelled AS (
                      SELECT customer_id, order_date,
                             julianday(order_date)
                               - ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS island
                      FROM days
                    )
                    SELECT c.name, MIN(l.order_date) AS streak_start, MAX(l.order_date) AS streak_end,
                           COUNT(*) AS days_in_a_row
                    FROM labelled l
                    JOIN customers c ON c.customer_id = l.customer_id
                    GROUP BY l.customer_id, c.name, l.island
                    HAVING COUNT(*) >= 2
                    ORDER BY days_in_a_row DESC, c.name;
                `,
                result: { columns: ['name', 'streak_start', 'streak_end', 'days_in_a_row'], rows: [['Priya', '2024-01-06', '2024-01-08', 3]] },
            },
            alternatives: [
                {
                    title: 'Flag each new streak with LAG, then number the streaks',
                    sql: code`
                        WITH days AS (
                          SELECT DISTINCT customer_id, order_date
                          FROM orders
                        ),
                        flagged AS (
                          SELECT customer_id, order_date,
                                 CASE WHEN julianday(order_date)
                                         - julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)) = 1
                                      THEN 0 ELSE 1 END AS starts_streak
                          FROM days
                        ),
                        numbered AS (
                          SELECT customer_id, order_date,
                                 SUM(starts_streak) OVER (PARTITION BY customer_id ORDER BY order_date) AS streak_id
                          FROM flagged
                        )
                        SELECT customer_id, MIN(order_date) AS streak_start, MAX(order_date) AS streak_end,
                               COUNT(*) AS days_in_a_row
                        FROM numbered
                        GROUP BY customer_id, streak_id
                        HAVING COUNT(*) >= 2
                        ORDER BY days_in_a_row DESC;
                    `,
                    result: { columns: ['customer_id', 'streak_start', 'streak_end', 'days_in_a_row'], rows: [[1, '2024-01-06', '2024-01-08', 3]] },
                    note: 'Longer, but easy to explain: a row starts a new streak when yesterday is missing, and a running SUM of those starts numbers the streaks.',
                },
            ],
            edgeCases: [
                'Several orders on one day: DISTINCT first, or the row numbers jump and break the streak.',
                'Streaks that cross a month or year: day numbers (julianday, or date arithmetic) handle that; string tricks don\'t.',
                '"Longest streak per customer": wrap the result and keep the max length per customer, deciding how to break ties.',
            ],
            mistakes: [
                'Forgetting DISTINCT on (customer, day).',
                'Subtracting the row number from a date string instead of a day number.',
                'Using LAG alone, which finds pairs of consecutive days but not whole streaks.',
            ],
            dialects: [
                'PostgreSQL: `order_date - (ROW_NUMBER() OVER (…))::int` works directly on DATE values. SQL Server: `DATEADD(day, -ROW_NUMBER() OVER (…), order_date)`.',
            ],
            interviewAnswer: 'This is gaps and islands. I first reduce to distinct customer-days, number each customer\'s days with ROW_NUMBER, and subtract that number from the date: within a run of consecutive days both go up by one, so the difference is constant and labels the island. Grouping by customer and that label gives each streak\'s start, end and length, and HAVING keeps the ones of two days or more.',
            followUps: [
                { q: 'How would you find each customer\'s longest streak?', a: 'Wrap the streak query and use `ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY days_in_a_row DESC) = 1`, or MAX per customer.' },
                { q: 'How would you find gaps — periods with no orders?', a: 'Use `LEAD(order_date)` to get the next date, and keep rows where the next date is more than one day later; the gap runs between them.' },
            ],
            practice: {
                explain: 'Explain, with Priya\'s dates, why date minus row number is constant inside a streak.',
                write: 'Find the longest run of consecutive order days across all customers combined.',
                predict: 'If Priya also ordered on 2024-01-09, what would the solution return?',
                edge: 'Add a second order for Priya on 2024-01-07 and show that the solution still gives a 3-day streak. Then remove DISTINCT and see what breaks.',
            },
            resources: [
                dataLemur('consecutive days questions'),
                leetCodeSql50,
                watch('sql gaps and islands problem', 'SQL gaps and islands (video)'),
            ],
        },
        {
            id: 'sql8-p10',
            kind: 'problem',
            name: 'Products bought together',
            priority: 'should',
            difficulty: 'medium',
            definition: 'Find every pair of different products that appear in the same order, and count how many orders contain each pair. List each pair once.',
            problem: 'A self join on a link table, and the trick for listing each pair once — the basis of "customers who bought this also bought…".',
            pattern: 'Pairs within a group (self join with a < b)',
            spot: '"Bought together", "pairs", "in the same order / session / team", "co-occurrence".',
            tables: ['order_items', 'products'],
            approach: [
                'Join order_items to itself on the same order_id: every product paired with every other product in that order.',
                'Keep only pairs where the first product\'s name is less than the second\'s — this removes self-pairs and mirrored duplicates (A–B and B–A).',
                'Join products twice to get both names.',
                'Group by the pair and count the orders.',
            ],
            diagram: {
                code: 'flowchart LR\n  O["order 102<br/>Desk lamp, Backpack"] --> P["self join on order_id<br/>Backpack–Desk lamp<br/>Desk lamp–Backpack<br/>Backpack–Backpack …"]\n  P -->|"keep name a less than name b"| K["Backpack–Desk lamp<br/>once"]',
                caption: 'Joining an order\'s items to themselves makes every combination, including each item with itself and each pair twice. "a < b" keeps exactly one copy of each real pair.',
            },
            solution: {
                title: 'Solution: self join with a < b',
                sql: code`
                    SELECT p1.product_name AS product_a, p2.product_name AS product_b,
                           COUNT(*) AS orders_together
                    FROM order_items a
                    JOIN order_items b ON b.order_id = a.order_id
                    JOIN products p1   ON p1.product_id = a.product_id
                    JOIN products p2   ON p2.product_id = b.product_id
                    WHERE p1.product_name < p2.product_name
                    GROUP BY p1.product_name, p2.product_name
                    ORDER BY orders_together DESC, product_a, product_b;
                `,
                result: {
                    columns: ['product_a', 'product_b', 'orders_together'],
                    rows: [['Backpack', 'Desk lamp', 1], ['Backpack', 'Headphones', 1], ['Desk lamp', 'Mug', 1], ['Mug', 'Notebook', 1], ['Notebook', 'Pen', 1]],
                },
                note: 'Each pair appears in one order in this small data set. On real data you would sort by orders_together and take the top pairs.',
            },
            edgeCases: [
                'The same product twice in one order: order_items has one row per product per order, so it can\'t pair with itself here — but say how you would handle it.',
                'Big orders make many pairs (n items → n × (n − 1) / 2 pairs), so this can get expensive on real data.',
                'Pairs vs. lift: "bought together most" favours popular products; analysts often normalise by each product\'s own popularity.',
            ],
            mistakes: [
                'Using `<>` instead of `<`, which lists every pair twice.',
                'Joining on product_id instead of order_id, which pairs a product with itself across orders.',
                'Counting rows when an order could contain a pair more than once — use `COUNT(DISTINCT a.order_id)` if so.',
            ],
            interviewAnswer: 'I self-join the order items table on order_id so every product is paired with every other product in the same order, filter with product a less than product b to drop self-pairs and mirrored duplicates, join product names, and count orders per pair. I\'d note that the number of pairs grows quadratically with basket size, so on big data I might limit to recent orders or popular products.',
            followUps: [
                { q: 'Why `<` and not `<>`?', a: '`<>` removes self-pairs but keeps both A–B and B–A. `<` keeps exactly one ordering of each pair.' },
                { q: 'How would you find triples bought together?', a: 'Join order_items three times on order_id with a < b < c, then group by all three.' },
            ],
            practice: {
                explain: 'Explain what the self join produces before the WHERE, for order 102.',
                write: 'For each product, list how many different products it has ever been bought with.',
                predict: 'How many rows does the self join `order_items a JOIN order_items b ON b.order_id = a.order_id` produce before any WHERE?',
                edge: 'If an order could contain the same product on two rows, how would you stop it pairing with itself and double-counting?',
            },
            resources: [
                dataLemur('frequently bought together questions'),
                pgExercises('Joins and Subqueries'),
            ],
        },
        {
            id: 'sql8-p11',
            kind: 'problem',
            name: 'Which products make up 80% of revenue? (share of total)',
            priority: 'should',
            difficulty: 'medium',
            definition: 'Show each product\'s revenue, its percentage of total revenue, and the running (cumulative) percentage from the best seller down. Then list the products that bring in the first 80% of revenue.',
            problem: 'Window aggregates over the whole result (share of total), a running total with an explicit ROWS frame, and turning a cumulative share into a filter — the classic Pareto analysis.',
            pattern: 'Share of total and cumulative share',
            spot: '"Percentage of total", "share", "contribution", "cumulative", "top products making up X%".',
            tables: ['order_items', 'products'],
            approach: [
                'Total revenue per product in a CTE: `SUM(quantity × price)`.',
                'Share of total: revenue ÷ `SUM(revenue) OVER ()`, times 100.0.',
                'Cumulative share: a running SUM ordered by revenue descending, with ROWS UNBOUNDED PRECEDING, divided by the total.',
                'For "the first 80%": keep products whose revenue before them is still under 80% of the total.',
            ],
            diagram: {
                code: 'xychart-beta\n  title "Cumulative share of revenue"\n  x-axis ["Headphones", "Desk lamp", "Backpack", "Mug", "Notebook", "Pen"]\n  y-axis "Cumulative %" 0 --> 100\n  bar [55.5, 74.4, 89.5, 95.6, 98.7, 100]',
                caption: 'Sorted from best seller down, the running share climbs fast and then flattens. The first three products already pass 80% — that is the Pareto pattern.',
            },
            solution: {
                title: 'Solution: share and running share with window functions',
                sql: code`
                    WITH product_revenue AS (
                      SELECT p.product_name, SUM(oi.quantity * p.price) AS revenue
                      FROM order_items oi
                      JOIN products p ON p.product_id = oi.product_id
                      GROUP BY p.product_name
                    )
                    SELECT product_name, revenue,
                           ROUND(100.0 * revenue / SUM(revenue) OVER (), 1) AS pct_of_total,
                           ROUND(100.0 * SUM(revenue) OVER (ORDER BY revenue DESC ROWS UNBOUNDED PRECEDING)
                                 / SUM(revenue) OVER (), 1) AS cumulative_pct
                    FROM product_revenue
                    ORDER BY revenue DESC;
                `,
                result: {
                    columns: ['product_name', 'revenue', 'pct_of_total', 'cumulative_pct'],
                    rows: [['Headphones', 440, 55.5, 55.5], ['Desk lamp', 150, 18.9, 74.4], ['Backpack', 120, 15.1, 89.5], ['Mug', 48, 6.1, 95.6], ['Notebook', 25, 3.2, 98.7], ['Pen', 10, 1.3, 100]],
                },
            },
            alternatives: [
                {
                    title: 'The products that make up the first 80%',
                    sql: code`
                        WITH product_revenue AS (
                          SELECT p.product_name, SUM(oi.quantity * p.price) AS revenue
                          FROM order_items oi
                          JOIN products p ON p.product_id = oi.product_id
                          GROUP BY p.product_name
                        ),
                        running AS (
                          SELECT product_name, revenue,
                                 SUM(revenue) OVER (ORDER BY revenue DESC ROWS UNBOUNDED PRECEDING) - revenue AS revenue_before
                          FROM product_revenue
                        )
                        SELECT product_name, revenue
                        FROM running
                        WHERE revenue_before < 0.8 * (SELECT SUM(revenue) FROM product_revenue)
                        ORDER BY revenue DESC;
                    `,
                    result: { columns: ['product_name', 'revenue'], rows: [['Headphones', 440], ['Desk lamp', 150], ['Backpack', 120]] },
                    note: 'A product is in the first 80% if the revenue before it hadn\'t reached 80% yet. Backpack starts at 74.4%, so it is the one that crosses the line.',
                },
            ],
            edgeCases: [
                'Ties in revenue: the running total needs a tiebreaker (e.g. product name), or tied products share a RANGE frame.',
                'Products that never sold (the phone case) don\'t appear; LEFT JOIN from products if they should show 0%.',
                'Rounding: the rounded percentages may not add up to exactly 100.',
            ],
            mistakes: [
                'Integer division: `revenue / SUM(revenue) OVER ()` is 0 without the 100.0.',
                'Leaving the frame as the default RANGE, so tied revenues get the same cumulative value.',
                'Filtering `cumulative_pct <= 80`, which drops the product that crosses 80% — usually it should be included.',
            ],
            interviewAnswer: 'I total revenue per product in a CTE, then divide each by SUM over an empty window for the share of total, and use a running SUM ordered by revenue descending with an explicit ROWS frame for the cumulative share. To list the products making up the first 80%, I keep those whose revenue before them is still under 80% of the total, which includes the product that crosses the line.',
            followUps: [
                { q: 'How would you show each product\'s share within its own category?', a: 'Divide by `SUM(revenue) OVER (PARTITION BY category)` instead of `OVER ()`.' },
                { q: 'Why ROWS UNBOUNDED PRECEDING rather than the default?', a: 'The default RANGE frame lumps tied values together; ROWS adds one product at a time.' },
            ],
            practice: {
                explain: 'Explain the difference between the pct_of_total and cumulative_pct columns.',
                write: 'Do the same analysis for customers: each customer\'s share of total spend and the cumulative share.',
                predict: 'Which products would be in "the first 90% of revenue"?',
                edge: 'Make the phone case appear with 0 revenue and 0%, without breaking the cumulative column.',
            },
            resources: [
                dataLemur('percentage of total questions'),
                modeTutorial('SQL Window Functions'),
            ],
        },
        {
            id: 'sql8-p12',
            kind: 'problem',
            name: 'Retention: who came back within 30 days?',
            priority: 'bonus',
            difficulty: 'hard',
            definition: 'Of the customers who placed an order, what percentage placed another order within 30 days of their first one?',
            problem: 'Cohort-style thinking: anchor each user on their first event, look for a later event within a window, and compute a rate — the core of product and growth analytics interviews.',
            pattern: 'Retention (first event, then a later event within N days)',
            spot: '"Retention", "came back", "returned within", "repeat purchase rate", "day-7 / day-30".',
            tables: ['orders'],
            approach: [
                'Find each customer\'s first order date (MIN per customer).',
                'For each customer, check whether any later order falls within 30 days of that first date.',
                'Turn that into 1 or 0 per customer (MAX of a CASE).',
                'Rate = 100.0 × customers who came back ÷ customers who ordered.',
            ],
            diagram: {
                code: 'flowchart LR\n  F["first order per customer"] --> P["Priya: next order after 1 day"]\n  F --> T["Tom: after 40 days"]\n  F --> L["Lena: after 8 days"]\n  F --> Z["Zoe: no second order"]\n  P --> R["came back within 30 days:<br/>Priya, Lena<br/>2 of 4 = 50%"]\n  L --> R',
                caption: 'Anchor each customer on their first order, then ask one yes-or-no question: was there another order within 30 days? The share of yeses is the retention rate.',
            },
            solution: {
                title: 'Solution: first date, then a flag per customer',
                sql: code`
                    WITH firsts AS (
                      SELECT customer_id, MIN(order_date) AS first_date
                      FROM orders
                      GROUP BY customer_id
                    ),
                    flags AS (
                      SELECT f.customer_id,
                             MAX(CASE WHEN o.order_date > f.first_date
                                       AND julianday(o.order_date) - julianday(f.first_date) <= 30
                                      THEN 1 ELSE 0 END) AS came_back
                      FROM firsts f
                      JOIN orders o ON o.customer_id = f.customer_id
                      GROUP BY f.customer_id
                    )
                    SELECT COUNT(*) AS customers,
                           SUM(came_back) AS came_back_within_30_days,
                           ROUND(100.0 * SUM(came_back) / COUNT(*), 1) AS retention_pct
                    FROM flags;
                `,
                result: { columns: ['customers', 'came_back_within_30_days', 'retention_pct'], rows: [[4, 2, 50]] },
            },
            alternatives: [
                {
                    title: 'See it per customer with LEAD',
                    sql: code`
                        WITH numbered AS (
                          SELECT customer_id, order_date,
                                 ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS rn,
                                 LEAD(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS next_date
                          FROM orders
                        )
                        SELECT c.name, n.order_date AS first_order, n.next_date AS second_order,
                               julianday(n.next_date) - julianday(n.order_date) AS gap_days
                        FROM numbered n
                        JOIN customers c ON c.customer_id = n.customer_id
                        WHERE n.rn = 1
                        ORDER BY c.customer_id;
                    `,
                    result: {
                        columns: ['name', 'first_order', 'second_order', 'gap_days'],
                        rows: [['Priya', '2024-01-06', '2024-01-07', 1], ['Tom', '2024-01-21', '2024-03-01', 40], ['Lena', '2024-02-12', '2024-02-20', 8], ['Zoe', '2024-03-16', null, null]],
                    },
                    note: 'The gap to the second order shows the answer at a glance: 1 and 8 days are within 30; 40 isn\'t; Zoe never came back.',
                },
            ],
            edgeCases: [
                'A second order on the same day as the first: does it count as "coming back"? The solution says no (`>`); ask.',
                'Customers whose first order is less than 30 days before the end of the data haven\'t had a full 30 days yet — exclude them from the denominator for a fair rate.',
                'Should cancelled orders count as activity? Filter by status if not.',
            ],
            mistakes: [
                'Counting any second order, regardless of how long after.',
                'Dividing whole numbers and getting 0.',
                'Measuring from sign-up date when the question says first order (or the other way round).',
            ],
            interviewAnswer: 'I anchor each customer on their first order with MIN per customer, join back to their orders, and flag whether any later order falls within 30 days, taking MAX of a CASE so each customer is one or zero. The retention rate is the sum of flags over the number of customers, times 100.0. I\'d raise two definitional points: whether a same-day second order counts, and excluding customers who haven\'t had a full 30 days yet.',
            followUps: [
                { q: 'How would you compute retention by sign-up month (a cohort table)?', a: 'Add the first-order month to the firsts CTE, group the flags by that month, and compute the rate per cohort.' },
                { q: 'Why exclude recent customers from the denominator?', a: 'Someone who ordered yesterday hasn\'t had 30 days to come back; counting them as "not retained" makes the rate look worse than it is.' },
            ],
            practice: {
                explain: 'Explain why each customer is reduced to a single 1 or 0 before the rate is calculated.',
                write: 'Compute the share of customers who came back within 7 days.',
                predict: 'What would retention_pct be with a 45-day window?',
                edge: 'Change the solution so only delivered orders count as activity. Who changes?',
            },
            resources: [
                dataLemur('retention questions'),
                watch('sql retention cohort analysis', 'Retention and cohort analysis in SQL (video)'),
            ],
        },
        {
            id: 'sql8-p13',
            kind: 'problem',
            name: 'The median salary',
            priority: 'bonus',
            difficulty: 'hard',
            definition: 'Find the median salary of all employees, and then the median salary in each department.',
            problem: 'Whether you can build a statistic that SQL doesn\'t always provide, using row numbers and counts — and handle both odd and even group sizes.',
            pattern: 'Median with ROW_NUMBER and COUNT',
            spot: '"Median", "middle value", "50th percentile".',
            tables: ['employees'],
            approach: [
                'Sort the salaries and number them 1 to n with ROW_NUMBER; get n with `COUNT(*) OVER ()`.',
                'The middle positions are (n + 1) / 2 and (n + 2) / 2 using whole-number division: the same row when n is odd, the two middle rows when n is even.',
                'Average the salaries at those positions.',
                'For each department, add PARTITION BY dept_id to both window functions and GROUP BY dept_id.',
            ],
            diagram: {
                code: 'flowchart LR\n  S["8 salaries sorted<br/>38k 45k 52k 60k 70k 70k 80k 95k"] --> M["middle positions<br/>(8+1)/2 = 4 and (8+2)/2 = 5"]\n  M --> A["average of 60000 and 70000<br/>= 65000"]',
                caption: 'With an even number of rows there are two middle values, and the median is their average. With an odd number, both formulas point at the same single row.',
            },
            solution: {
                title: 'Solution: row numbers and a count',
                sql: code`
                    WITH ordered AS (
                      SELECT salary,
                             ROW_NUMBER() OVER (ORDER BY salary) AS rn,
                             COUNT(*) OVER () AS n
                      FROM employees
                    )
                    SELECT AVG(salary) AS median_salary
                    FROM ordered
                    WHERE rn IN ((n + 1) / 2, (n + 2) / 2);
                `,
                result: { columns: ['median_salary'], rows: [[65000]] },
                note: 'n = 8, so positions 4 and 5: 60000 and 70000, averaging 65000. The average salary is 63750 — the median and the mean are different things.',
            },
            alternatives: [
                {
                    title: 'The median in each department',
                    sql: code`
                        WITH ordered AS (
                          SELECT dept_id, salary,
                                 ROW_NUMBER() OVER (PARTITION BY dept_id ORDER BY salary) AS rn,
                                 COUNT(*) OVER (PARTITION BY dept_id) AS n
                          FROM employees
                          WHERE dept_id IS NOT NULL
                        )
                        SELECT dept_id, AVG(salary) AS median_salary
                        FROM ordered
                        WHERE rn IN ((n + 1) / 2, (n + 2) / 2)
                        GROUP BY dept_id
                        ORDER BY dept_id;
                    `,
                    result: { columns: ['dept_id', 'median_salary'], rows: [[1, 75000], [2, 52500], [3, 52000]] },
                    note: 'Engineering has 4 people (70000, 70000, 80000, 95000): the middle two average 75000.',
                },
            ],
            edgeCases: [
                'Even vs odd counts: the two-position trick covers both.',
                'NULL salaries: filter them out before numbering, or they shift the positions.',
                'Ties in salary don\'t matter: whichever tied row gets which number, the values at the middle positions are the same.',
            ],
            mistakes: [
                'Using AVG — that is the mean, not the median.',
                'Taking only position n / 2, which is wrong for odd counts and only half the answer for even counts.',
                'Decimal division in the position maths ((n + 1) / 2.0), which gives 4.5 and matches no row.',
            ],
            dialects: [
                'PostgreSQL and Oracle: `PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY salary)` gives the median directly; SQL Server has PERCENTILE_CONT as a window function. MySQL and SQLite have no built-in median, so use this pattern.',
            ],
            interviewAnswer: 'If the database has PERCENTILE_CONT, the median is PERCENTILE_CONT 0.5 within group ordered by salary. Otherwise I number the sorted values with ROW_NUMBER, get the count with COUNT over the same window, and average the values at positions n plus one over two and n plus two over two with integer division — that\'s the single middle row for odd n and the two middle rows for even n. Partitioning both window functions gives a median per group.',
            followUps: [
                { q: 'Median or mean — when does the difference matter?', a: 'When the data is skewed: one very high salary pulls the mean up but barely moves the median.' },
                { q: 'How would you get the 90th percentile?', a: '`PERCENTILE_CONT(0.9) WITHIN GROUP (ORDER BY salary)` where available; otherwise the row at position `CEIL(0.9 × n)` with the same ROW_NUMBER pattern.' },
            ],
            practice: {
                explain: 'Explain why positions (n + 1) / 2 and (n + 2) / 2 work for both odd and even n.',
                write: 'Find the median order amount, ignoring the order with no amount.',
                predict: 'What is the median salary if Asha leaves (7 employees)?',
                edge: 'What happens to the median calculation if one salary is NULL and you don\'t filter it out?',
            },
            resources: [
                postgresDocs('functions-aggregate.html#FUNCTIONS-ORDEREDSET-TABLE', 'Ordered-Set Aggregate Functions (PERCENTILE_CONT)'),
                dataLemur('median questions'),
            ],
        },
        {
            id: 'sql8-p14',
            kind: 'problem',
            name: 'Customers who bought every product in a category',
            priority: 'bonus',
            difficulty: 'hard',
            definition: 'Find the customers who have bought every product in the Stationery category.',
            problem: '"Every" questions — relational division — which can\'t be answered with a plain join. They test counting distinct matches against a total, or thinking in double negatives.',
            pattern: '"All of" (relational division)',
            spot: '"Every", "all of the", "each one of", "the complete set".',
            tables: ['customers', 'orders', 'order_items', 'products'],
            approach: [
                'Count how many products the category has (here 2: Pen and Notebook).',
                'For each customer, count the different products from that category they have bought.',
                'Keep customers whose count equals the category\'s total: GROUP BY with HAVING `COUNT(DISTINCT …)` = (subquery).',
                'Or say it as a double negative: there is no Stationery product this customer has not bought.',
            ],
            diagram: {
                code: 'flowchart LR\n  C["Stationery has 2 products<br/>Pen, Notebook"] --> Q{"customer bought<br/>2 different ones?"}\n  Q -->|"Priya: Notebook and Pen"| K["kept"]\n  Q -->|"everyone else: 0"| X["dropped"]',
                caption: 'Count the distinct category products each customer bought and compare with the size of the category. Equal means they bought every one.',
            },
            solution: {
                title: 'Solution: count distinct matches and compare with the total',
                sql: code`
                    SELECT c.name
                    FROM customers c
                    JOIN orders o       ON o.customer_id = c.customer_id
                    JOIN order_items oi ON oi.order_id = o.order_id
                    JOIN products p     ON p.product_id = oi.product_id
                    WHERE p.category = 'Stationery'
                    GROUP BY c.customer_id, c.name
                    HAVING COUNT(DISTINCT p.product_id) = (
                      SELECT COUNT(*) FROM products WHERE category = 'Stationery'
                    )
                    ORDER BY c.name;
                `,
                result: { columns: ['name'], rows: [['Priya']] },
                note: 'Priya bought notebooks in two orders and pens in one; DISTINCT stops the repeat notebook counting twice.',
            },
            alternatives: [
                {
                    title: 'The double negative: no product they haven\'t bought',
                    sql: code`
                        SELECT c.name
                        FROM customers c
                        WHERE NOT EXISTS (
                          SELECT 1
                          FROM products p
                          WHERE p.category = 'Stationery'
                            AND NOT EXISTS (
                              SELECT 1
                              FROM orders o
                              JOIN order_items oi ON oi.order_id = o.order_id
                              WHERE o.customer_id = c.customer_id
                                AND oi.product_id = p.product_id
                            )
                        )
                        ORDER BY c.name;
                    `,
                    result: { columns: ['name'], rows: [['Priya']] },
                    note: 'Read it as: keep the customer if there is no Stationery product that this customer has not bought.',
                },
            ],
            edgeCases: [
                'An empty category: the counting version returns nobody, while the double-negative version returns every customer ("bought all of nothing"). Ask which is wanted.',
                'Buying the same product twice must not count twice: use `COUNT(DISTINCT)`.',
                'Products added to the category later change the answer for past customers — that is usually intended.',
            ],
            mistakes: [
                '`COUNT(*)` instead of `COUNT(DISTINCT product_id)`, so two notebooks look like two different products.',
                'Hard-coding the total (= 2) instead of counting the category.',
                'Using IN (\'Pen\', \'Notebook\'), which finds customers who bought any of them, not all.',
            ],
            interviewAnswer: 'This is relational division — "bought all of". I join each customer to the category\'s products they bought, group by customer, and keep those whose count of distinct products equals the category\'s product count from a subquery. An equivalent formulation is a double NOT EXISTS: there\'s no product in the category that the customer hasn\'t bought. I\'d mention the empty-category case, where the two versions disagree.',
            followUps: [
                { q: 'How would you find customers who bought at least 2 of the 3 products in a category?', a: 'Same query, with HAVING `COUNT(DISTINCT p.product_id) >= 2`.' },
                { q: 'How would you find customers who bought exactly the Stationery products and nothing else?', a: 'Count distinct stationery products = category size, and also count of non-stationery products = 0 (conditional aggregation over all their items).' },
            ],
            practice: {
                explain: 'Explain the double NOT EXISTS version in plain words.',
                write: 'Find customers who bought every product in the Electronics category. (Who bought the phone case?)',
                predict: 'If Tom had also bought a pen and a notebook, what would the solution return?',
                edge: 'Show what each version returns for a category with no products, and explain why they differ.',
            },
            resources: [
                pgExercises('Aggregation'),
                dataLemur('relational division questions'),
            ],
        },
    ],
};
