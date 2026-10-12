import type { SqlPhase } from '../sql';
import { code } from './code';
import { dataLemur, modeTutorial, postgresDocs, sqliteDocs, watch } from './resources';

export const sqlPhase5: SqlPhase = {
    id: 'window-functions',
    number: 5,
    short: 'Window functions',
    title: 'Window functions: ranking, running totals and comparing rows',
    accent: '#ff8a65',
    goal: 'Calculate across related rows — rank them, compare each with the one before, keep running totals — without losing the individual rows the way GROUP BY does.',
    bigPicture: 'Window functions are the single most tested "advanced" SQL topic. Top N per group, month-on-month growth, running totals, streaks — all of them become short once you think in windows: for each row, look at a set of related rows, and work something out.',
    topics: [
        {
            id: 'sql5-t1',
            kind: 'lesson',
            name: 'What a window function is: OVER and PARTITION BY',
            priority: 'must',
            definition: 'A window function calculates a value for each row from a set of related rows (its "window"), defined by OVER (PARTITION BY … ORDER BY …), and — unlike GROUP BY — keeps every row in the result.',
            problem: '"Show each employee with their department\'s average salary next to them." GROUP BY gives you the averages but throws away the employees; joining the averages back is clumsy. A window function puts the group\'s number on every row in one step.',
            idea: 'Add OVER (…) after a function and it becomes a window function. OVER () with nothing inside means "the window is every row". PARTITION BY dept_id splits the rows into windows, one per department, like GROUP BY — but the rows stay separate, and each row gets its own window\'s answer. ORDER BY inside OVER sets an order within each window, which ranking and running totals need. Any aggregate (SUM, AVG, COUNT, MIN, MAX) can be used this way, plus special window-only functions such as ROW_NUMBER and LAG.',
            analogy: 'A class photo where each pupil holds a card. GROUP BY would replace each form group with one person holding the group\'s average. A window function keeps every pupil in the photo, and each one\'s card shows their own form group\'s average.',
            breaks: 'In the photo the card is written once. A window function is worked out in the SELECT step, after WHERE and GROUP BY — so WHERE can\'t filter on it. To filter on a window result, wrap the query in a CTE.',
            syntax: code`
                function(...) OVER (
                  PARTITION BY group_column
                  ORDER BY sort_column
                )
            `,
            howItWorks: [
                'FROM and WHERE produce the rows: 7 employees with a department.',
                'PARTITION BY dept_id makes three windows: department 1 (4 people), 2 (2 people), 3 (1 person).',
                '`AVG(salary)` is worked out over each window: 78750, 52500, 52000.',
                'Each row gets the answer for its own window, and no rows are removed.',
                'OVER () with no partition makes one window of all rows: `COUNT(*) OVER ()` is 8 on every row.',
            ],
            diagram: {
                code: 'flowchart LR\n  subgraph W1["window: dept 1 · avg 78750"]\n    A["Asha 95000"]\n    B["Ben 70000"]\n    C["Chen 70000"]\n    H["Hana 80000"]\n  end\n  subgraph W2["window: dept 2 · avg 52500"]\n    D["Dara 60000"]\n    E["Eli 45000"]\n  end\n  W1 --> R["every row kept,<br/>each with its own window\'s average"]\n  W2 --> R',
                caption: 'PARTITION BY draws a box around related rows. The function is worked out inside each box, and the answer is written onto every row in it — no row disappears.',
            },
            examples: [
                {
                    title: 'Each employee next to their department average',
                    sql: code`
                        SELECT name, dept_id, salary,
                               AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
                        FROM employees
                        WHERE dept_id IS NOT NULL
                        ORDER BY dept_id, name;
                    `,
                    result: {
                        columns: ['name', 'dept_id', 'salary', 'dept_avg'],
                        rows: [['Asha', 1, 95000, 78750], ['Ben', 1, 70000, 78750], ['Chen', 1, 70000, 78750], ['Hana', 1, 80000, 78750], ['Dara', 2, 60000, 52500], ['Eli', 2, 45000, 52500], ['Fatima', 3, 52000, 52000]],
                    },
                    note: 'GROUP BY dept_id would give 3 rows. The window keeps all 7.',
                },
                {
                    title: 'Group sizes and the grand total on every row',
                    sql: code`
                        SELECT name, dept_id,
                               COUNT(*) OVER (PARTITION BY dept_id) AS dept_size,
                               COUNT(*) OVER () AS company_size
                        FROM employees
                        ORDER BY emp_id;
                    `,
                    result: {
                        columns: ['name', 'dept_id', 'dept_size', 'company_size'],
                        rows: [['Asha', 1, 4, 8], ['Ben', 1, 4, 8], ['Chen', 1, 4, 8], ['Dara', 2, 2, 8], ['Eli', 2, 2, 8], ['Fatima', 3, 1, 8], ['Gus', null, 1, 8], ['Hana', 1, 4, 8]],
                    },
                    note: 'OVER () is one window holding every row. Gus forms his own NULL partition.',
                },
                {
                    title: 'How far each salary is from the department average',
                    sql: code`
                        SELECT name, salary,
                               salary - AVG(salary) OVER (PARTITION BY dept_id) AS diff_from_avg
                        FROM employees
                        WHERE dept_id = 1
                        ORDER BY salary DESC, name;
                    `,
                    result: {
                        columns: ['name', 'salary', 'diff_from_avg'],
                        rows: [['Asha', 95000, 16250], ['Hana', 80000, 1250], ['Ben', 70000, -8750], ['Chen', 70000, -8750]],
                    },
                },
            ],
            keyPoints: [
                'A window function keeps every row; GROUP BY collapses rows.',
                'PARTITION BY = which rows share a window. No PARTITION BY = one window of all rows.',
                'ORDER BY inside OVER = the order within each window (needed for ranks, LAG and running totals).',
                'Window functions run in the SELECT step: you can\'t use them in WHERE, GROUP BY or HAVING. Wrap in a CTE to filter.',
                'Any aggregate becomes a window function when you add OVER.',
            ],
            mistakes: [
                'Writing `WHERE ROW_NUMBER() OVER (…) = 1` — not allowed. Filter in an outer query.',
                'Adding GROUP BY when you wanted every row kept.',
                'Confusing the ORDER BY inside OVER (order within the window) with the query\'s ORDER BY (order of the output).',
            ],
            dialects: [
                'Window functions work in PostgreSQL, SQL Server, Oracle, MySQL 8+ and SQLite 3.25+. Older MySQL (5.7) has none.',
            ],
            interviewAnswer: 'A window function computes a value over a set of rows related to the current row, defined by the OVER clause — PARTITION BY says which rows share the window and ORDER BY orders them — but unlike GROUP BY it doesn\'t collapse rows, so each row keeps its detail and gains the computed value. Because they are evaluated in the SELECT phase, I filter on them from an outer query or CTE.',
            followUps: [
                { q: 'GROUP BY or a window function — how do you choose?', a: 'If you want one row per group, GROUP BY. If you want every row plus a group value next to it (an average, a rank, a running total), a window function.' },
                { q: 'Why can\'t you use a window function in WHERE?', a: 'WHERE runs before the SELECT step where window functions are computed. Put the window function in a CTE and filter outside.' },
            ],
            practice: {
                explain: 'Explain the difference between `AVG(salary) … GROUP BY dept_id` and `AVG(salary) OVER (PARTITION BY dept_id)`.',
                write: 'For every order, show the order_id, amount, and the customer\'s total spend across all their orders.',
                predict: 'What does `SELECT name, MAX(salary) OVER () FROM employees;` return? How many rows?',
                edge: 'Gus has a NULL dept_id. What dept_avg does he get in the first example if you remove the WHERE?',
            },
            resources: [
                postgresDocs('tutorial-window.html', 'Window Functions (tutorial)'),
                modeTutorial('SQL Window Functions'),
                watch('sql window functions explained', 'SQL window functions explained (video)'),
            ],
        },
        {
            id: 'sql5-t2',
            kind: 'lesson',
            name: 'Ranking: ROW_NUMBER, RANK and DENSE_RANK',
            priority: 'must',
            definition: 'ROW_NUMBER numbers rows 1, 2, 3, 4 with no ties; RANK gives ties the same number and then skips (1, 2, 2, 4); DENSE_RANK gives ties the same number without skipping (1, 2, 2, 3).',
            problem: '"Top 3 per department", "the second-highest salary", "each customer\'s first order" — ranking questions are the most common window-function questions in interviews. The only hard part is ties, and the three functions differ exactly there.',
            idea: 'All three need ORDER BY inside OVER, which decides who comes first. ROW_NUMBER always gives different numbers, so if two rows tie, which one gets 3 and which gets 4 is arbitrary unless you add a tiebreaker column. RANK is like a sports ranking: two people sharing 3rd place means nobody is 4th. DENSE_RANK doesn\'t leave gaps, so "the 2nd highest salary" is simply DENSE_RANK = 2. Add PARTITION BY to restart the numbering in each group.',
            analogy: 'A race with two runners crossing the line together in third. ROW_NUMBER is the finish-line camera that must put one of them first. RANK is the medal table: both get third, and the next runner is fifth. DENSE_RANK is "positions": both third, the next runner fourth.',
            breaks: 'A photo finish has a real answer. ROW_NUMBER\'s choice between tied rows doesn\'t — it can differ between runs — so always add a tiebreaker (like name or id) when you use ROW_NUMBER.',
            syntax: code`
                ROW_NUMBER() OVER (PARTITION BY g ORDER BY x DESC, tiebreaker)
                RANK()       OVER (PARTITION BY g ORDER BY x DESC)
                DENSE_RANK() OVER (PARTITION BY g ORDER BY x DESC)
            `,
            howItWorks: [
                'Sort by salary, highest first: Asha 95000, Hana 80000, then Ben and Chen on 70000, then Dara 60000.',
                'ROW_NUMBER: 1, 2, 3, 4, 5 — Ben and Chen get different numbers; the tiebreaker (name) puts Ben first.',
                'RANK: 1, 2, 3, 3, 5 — they share 3, and 4 is skipped.',
                'DENSE_RANK: 1, 2, 3, 3, 4 — they share 3, and Dara is 4.',
                'To keep only the top rows, compute the rank in a CTE and filter with WHERE outside it.',
            ],
            diagram: {
                code: 'flowchart LR\n  S["salaries, high to low<br/>95000 · 80000 · 70000 · 70000 · 60000"] --> R1["ROW_NUMBER<br/>1 · 2 · 3 · 4 · 5"]\n  S --> R2["RANK<br/>1 · 2 · 3 · 3 · 5"]\n  S --> R3["DENSE_RANK<br/>1 · 2 · 3 · 3 · 4"]',
                caption: 'Same sorted rows, three ways to number them. The only difference is what happens at the tie on 70000: unique numbers, shared with a gap after, or shared with no gap.',
            },
            examples: [
                {
                    title: 'The three side by side',
                    sql: code`
                        SELECT name, salary,
                               ROW_NUMBER() OVER (ORDER BY salary DESC, name) AS row_num,
                               RANK()       OVER (ORDER BY salary DESC) AS rank_num,
                               DENSE_RANK() OVER (ORDER BY salary DESC) AS dense_num
                        FROM employees
                        ORDER BY salary DESC, name;
                    `,
                    result: {
                        columns: ['name', 'salary', 'row_num', 'rank_num', 'dense_num'],
                        rows: [
                            ['Asha', 95000, 1, 1, 1], ['Hana', 80000, 2, 2, 2], ['Ben', 70000, 3, 3, 3], ['Chen', 70000, 4, 3, 3],
                            ['Dara', 60000, 5, 5, 4], ['Fatima', 52000, 6, 6, 5], ['Eli', 45000, 7, 7, 6], ['Gus', 38000, 8, 8, 7],
                        ],
                    },
                    note: 'Look at Ben and Chen, then at Dara: 5 by RANK, 4 by DENSE_RANK.',
                },
                {
                    title: 'Ranking within each department',
                    sql: code`
                        SELECT dept_id, name, salary,
                               DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rank_in_dept
                        FROM employees
                        WHERE dept_id IS NOT NULL
                        ORDER BY dept_id, rank_in_dept, name;
                    `,
                    result: {
                        columns: ['dept_id', 'name', 'salary', 'rank_in_dept'],
                        rows: [[1, 'Asha', 95000, 1], [1, 'Hana', 80000, 2], [1, 'Ben', 70000, 3], [1, 'Chen', 70000, 3], [2, 'Dara', 60000, 1], [2, 'Eli', 45000, 2], [3, 'Fatima', 52000, 1]],
                    },
                    note: 'PARTITION BY restarts the count at 1 for every department.',
                },
                {
                    title: 'Filter on a rank: each customer\'s second order',
                    sql: code`
                        WITH numbered AS (
                          SELECT customer_id, order_id, order_date,
                                 ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date) AS nth_order
                          FROM orders
                        )
                        SELECT customer_id, order_id, order_date
                        FROM numbered
                        WHERE nth_order = 2
                        ORDER BY customer_id;
                    `,
                    result: {
                        columns: ['customer_id', 'order_id', 'order_date'],
                        rows: [[1, 102, '2024-01-07'], [2, 108, '2024-03-01'], [3, 107, '2024-02-20']],
                    },
                    note: 'The number is made in the CTE, then filtered outside. Zoe has only one order, so she has no second.',
                },
            ],
            keyPoints: [
                'ROW_NUMBER: unique 1, 2, 3, 4. Add a tiebreaker so it is the same every run.',
                'RANK: ties share a number, then a gap (1, 2, 2, 4).',
                'DENSE_RANK: ties share a number, no gap (1, 2, 2, 3). Use it for "Nth highest value".',
                'PARTITION BY restarts the numbering per group.',
                'Pattern for top N per group: rank in a CTE, then `WHERE rank <= N` outside.',
            ],
            mistakes: [
                'Using ROW_NUMBER for "top 3 salaries" when ties should all be included — use RANK or DENSE_RANK.',
                'Using RANK for "the 2nd highest salary" — after a tie at 1st, there is no rank 2.',
                'Forgetting the tiebreaker in ROW_NUMBER, so results change from run to run.',
            ],
            dialects: [
                'Naming a column `rank` fails in MySQL 8, where RANK is a reserved word. Use rank_num or rnk.',
            ],
            interviewAnswer: 'All three number rows in the order given by the OVER clause\'s ORDER BY, optionally restarting per PARTITION BY. ROW_NUMBER gives unique sequential numbers, so I add a deterministic tiebreaker; RANK gives tied rows the same rank and leaves gaps; DENSE_RANK gives the same rank without gaps. For "Nth highest distinct value" I use DENSE_RANK, and for "exactly one row per group" I use ROW_NUMBER — always filtering in an outer query.',
            followUps: [
                { q: 'Which would you use for "the second highest salary"?', a: 'DENSE_RANK = 2, so a tie for first doesn\'t leave you with no second.' },
                { q: 'How do you keep exactly one row per customer — their latest order?', a: '`ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date DESC, order_id DESC)`, then keep row number 1.' },
                { q: 'What happens to ROW_NUMBER with ties if there is no tiebreaker?', a: 'Tied rows get different numbers in an arbitrary order, which can change between runs.' },
            ],
            practice: {
                explain: 'Explain the difference between RANK and DENSE_RANK using Ben, Chen and Dara.',
                write: 'Write a query for the most expensive product in each category, using ROW_NUMBER.',
                predict: 'With `RANK() OVER (ORDER BY salary DESC)`, which employees have rank 3? Who has rank 4?',
                edge: 'Rewrite "each customer\'s latest order" so that, if two orders shared the latest date, only one comes back — and say which one.',
            },
            resources: [
                postgresDocs('functions-window.html', 'Window Functions (reference)'),
                modeTutorial('SQL Window Functions: ROW_NUMBER, RANK and DENSE_RANK'),
                dataLemur('ranking window function questions'),
            ],
        },
        {
            id: 'sql5-t3',
            kind: 'lesson',
            name: 'LAG and LEAD: comparing with the previous or next row',
            priority: 'must',
            definition: '`LAG(column)` returns the value from the previous row and `LEAD(column)` the value from the next row, in the order set by OVER (… ORDER BY …), so a row can be compared with its neighbour.',
            problem: '"How much did revenue change since last month?", "how many days between a customer\'s orders?", "did the price go up?" — each compares a row with the one before it. Without LAG, that means a tricky self join on "the previous date". With LAG it is one line.',
            idea: '`LAG(revenue) OVER (ORDER BY month)` looks one row back in month order. The first row has no previous row, so it gets NULL (or a default you give as the third argument: `LAG(revenue, 1, 0)`). LEAD looks forward instead. The second argument says how far: `LAG(revenue, 12)` is the same month last year in monthly data. Add PARTITION BY customer_id and the looking-back stops at each customer\'s boundary, so one customer\'s first order never looks back into another customer\'s orders.',
            analogy: 'Reading a bank statement line by line with your finger on the line above. LAG is that line above; the difference between them is the change.',
            breaks: 'On a statement the line above is always the day before. LAG gives the previous row, not the previous day: if a month has no orders, it has no row, and LAG silently compares March with January. Fill the gaps first when it matters.',
            syntax: code`
                LAG(column, offset, default)  OVER (PARTITION BY g ORDER BY d)
                LEAD(column, offset, default) OVER (PARTITION BY g ORDER BY d)
            `,
            howItWorks: [
                'A CTE makes one row per month: January 445, February 210, March 138.',
                '`LAG(revenue) OVER (ORDER BY month)`: January has no previous row, so NULL; February gets 445; March gets 210.',
                'revenue − `LAG(revenue)` gives the change: NULL, −235, −72.',
                'With PARTITION BY customer_id, each customer\'s first order gets NULL from LAG.',
                'LEAD works the same way, looking forward: the last row gets NULL.',
            ],
            diagram: {
                code: 'flowchart LR\n  J["2024-01<br/>445"] -->|"LAG for Feb"| F["2024-02<br/>210<br/>previous: 445"]\n  F -->|"LAG for Mar"| M["2024-03<br/>138<br/>previous: 210"]',
                caption: 'In month order, LAG hands each row the value from the row before it. The first row has nothing before it, so it gets NULL.',
            },
            examples: [
                {
                    title: 'Change from the previous month',
                    sql: code`
                        WITH monthly AS (
                          SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue
                          FROM orders
                          GROUP BY strftime('%Y-%m', order_date)
                        )
                        SELECT month, revenue,
                               LAG(revenue) OVER (ORDER BY month) AS prev_revenue,
                               revenue - LAG(revenue) OVER (ORDER BY month) AS change
                        FROM monthly
                        ORDER BY month;
                    `,
                    result: {
                        columns: ['month', 'revenue', 'prev_revenue', 'change'],
                        rows: [['2024-01', 445, null, null], ['2024-02', 210, 445, -235], ['2024-03', 138, 210, -72]],
                    },
                },
                {
                    title: 'Days between a customer\'s orders',
                    sql: code`
                        SELECT customer_id, order_id, order_date,
                               LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date) AS previous_order,
                               julianday(order_date)
                                 - julianday(LAG(order_date) OVER (PARTITION BY customer_id ORDER BY order_date)) AS days_since
                        FROM orders
                        WHERE customer_id IN (1, 2)
                        ORDER BY customer_id, order_date;
                    `,
                    result: {
                        columns: ['customer_id', 'order_id', 'order_date', 'previous_order', 'days_since'],
                        rows: [
                            [1, 101, '2024-01-06', null, null], [1, 102, '2024-01-07', '2024-01-06', 1], [1, 103, '2024-01-08', '2024-01-07', 1],
                            [1, 105, '2024-02-02', '2024-01-08', 25], [1, 109, '2024-03-10', '2024-02-02', 37],
                            [2, 104, '2024-01-21', null, null], [2, 108, '2024-03-01', '2024-01-21', 40],
                        ],
                    },
                    note: 'PARTITION BY customer_id stops Tom\'s first order looking back at Priya\'s last one.',
                },
                {
                    title: 'LEAD: who was hired next',
                    sql: code`
                        SELECT name, hire_date,
                               LEAD(name) OVER (ORDER BY hire_date) AS next_hire
                        FROM employees
                        ORDER BY hire_date;
                    `,
                    result: {
                        columns: ['name', 'hire_date', 'next_hire'],
                        rows: [['Asha', '2019-03-01', 'Dara'], ['Dara', '2020-02-20', 'Ben'], ['Ben', '2020-06-15', 'Chen'], ['Chen', '2021-01-10', 'Fatima'], ['Fatima', '2021-09-12', 'Eli'], ['Eli', '2022-07-01', 'Hana'], ['Hana', '2022-11-30', 'Gus'], ['Gus', '2023-04-03', null]],
                    },
                },
            ],
            keyPoints: [
                'LAG = previous row\'s value; LEAD = next row\'s value, in the window\'s ORDER BY.',
                'The first row (LAG) or last row (LEAD) of each partition gets NULL, or the default you pass.',
                '`LAG(x, n)` looks n rows back — 12 for "same month last year" in monthly data.',
                'PARTITION BY keeps each group\'s comparisons inside the group.',
                'LAG looks at the previous row, not the previous date: fill missing dates first if gaps matter.',
            ],
            mistakes: [
                'Forgetting PARTITION BY, so one customer\'s first order is compared with another customer\'s last.',
                'Assuming the previous row is the previous day or month when there are gaps.',
                'Dividing by LAG without guarding against NULL or zero.',
            ],
            dialects: [
                'Date differences: PostgreSQL `order_date - LAG(order_date) OVER (…)` gives days directly for DATE columns; MySQL uses DATEDIFF; SQL Server uses `DATEDIFF(day, …)`.',
            ],
            interviewAnswer: 'LAG and LEAD return a value from a preceding or following row within the window, in the order given by the OVER clause\'s ORDER BY. I use them for period-over-period changes — revenue minus LAG of revenue — and gaps between events per user with PARTITION BY user. I watch out for the first row returning NULL and for missing periods, since LAG goes to the previous row, which isn\'t necessarily the previous calendar month.',
            followUps: [
                { q: 'How would you compute month-over-month growth as a percentage?', a: '`ROUND(100.0 * (revenue - LAG(revenue) OVER w) / LAG(revenue) OVER w, 1)`, guarding with NULLIF in case last month was 0.' },
                { q: 'How do you get a value from two rows back?', a: 'Pass an offset: `LAG(column, 2) OVER (…)`.' },
            ],
            practice: {
                explain: 'Explain what LAG returns for the first row of each partition, and why.',
                write: 'For each of Priya\'s orders, show the amount and the difference from her previous order\'s amount.',
                predict: 'In the first example, what would `LEAD(revenue) OVER (ORDER BY month)` give for each month?',
                edge: 'If February had no orders at all, what would LAG return for March in the first example, and how would you fix it?',
            },
            resources: [
                postgresDocs('functions-window.html', 'Window Functions (LAG and LEAD)'),
                modeTutorial('SQL Window Functions: LAG and LEAD'),
                dataLemur('LAG and LEAD questions'),
            ],
        },
        {
            id: 'sql5-t4',
            kind: 'lesson',
            name: 'Running totals and moving averages: window frames',
            priority: 'must',
            definition: 'With ORDER BY inside OVER, SUM and AVG become running totals; a frame such as `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` limits the window to nearby rows, giving a moving average.',
            problem: '"Cumulative revenue by day", "7-day moving average of sign-ups" — growth charts are built on these. They also hide a classic trap: the default frame treats tied rows as one, which surprises almost everyone.',
            idea: '`SUM(amount) OVER (ORDER BY order_date)` adds up everything from the first row to the current row: a running total. The frame says which rows count: `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` means this row and the two before it — so AVG over it is a 3-row moving average. The trap: when you write ORDER BY without a frame, the default is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW, and RANGE includes every row tied with the current one. So two orders on the same day both show the total after both. Write ROWS explicitly when you want one row at a time.',
            analogy: 'A running total is a savings jar you never empty: each week you add the new amount and read the total. A moving average is a "last three weeks" window you slide along: the oldest week drops out as a new one comes in.',
            breaks: 'Weeks never tie. Rows can: with the default RANGE frame, two rows with the same ORDER BY value are treated as arriving at the same moment, so both see the total including each other.',
            syntax: code`
                SUM(x) OVER (ORDER BY d)                                   -- running total
                AVG(x) OVER (ORDER BY d ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)
                SUM(x) OVER (ORDER BY d ROWS UNBOUNDED PRECEDING)          -- running total, row by row
            `,
            howItWorks: [
                'Order the rows by date. For each row, the frame is "from the first row up to me".',
                'SUM over that frame grows: 120, 200, 245, 445, 595…',
                'Order 106\'s NULL amount adds nothing, so the total stays at 595 on that row.',
                'With `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW`, the frame is at most 3 rows, so AVG gives a 3-order moving average.',
                'Ties: ordering salaries with the default frame, Ben and Chen (both 70000) both show 315000. With ROWS they show 245000 and 315000.',
            ],
            diagram: {
                code: 'flowchart LR\n  R1["row 1<br/>120"] --> R2["row 2<br/>80"] --> R3["row 3<br/>45"] --> R4["row 4<br/>200"]\n  R4 --> F["frame for row 4:<br/>ROWS 2 PRECEDING = rows 2, 3, 4<br/>moving average 108.3"]\n  R4 --> T["frame for row 4:<br/>UNBOUNDED PRECEDING = rows 1 to 4<br/>running total 445"]',
                caption: 'The frame is the part of the window a row can see. "Unbounded preceding" sees everything so far (a running total); "2 preceding" sees only the last three rows (a moving average).',
            },
            examples: [
                {
                    title: 'Running total of revenue',
                    sql: code`
                        SELECT order_date, amount,
                               SUM(amount) OVER (ORDER BY order_date) AS running_total
                        FROM orders
                        ORDER BY order_date;
                    `,
                    result: {
                        columns: ['order_date', 'amount', 'running_total'],
                        rows: [
                            ['2024-01-06', 120, 120], ['2024-01-07', 80, 200], ['2024-01-08', 45, 245], ['2024-01-21', 200, 445], ['2024-02-02', 150, 595],
                            ['2024-02-12', null, 595], ['2024-02-20', 60, 655], ['2024-03-01', 75, 730], ['2024-03-10', 30, 760], ['2024-03-16', 33, 793],
                        ],
                    },
                    note: 'The last row is 793, the grand total. The NULL row adds nothing.',
                },
                {
                    title: 'A running total per customer',
                    sql: code`
                        SELECT customer_id, order_date, amount,
                               SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS customer_running_total
                        FROM orders
                        WHERE customer_id IN (1, 3)
                        ORDER BY customer_id, order_date;
                    `,
                    result: {
                        columns: ['customer_id', 'order_date', 'amount', 'customer_running_total'],
                        rows: [[1, '2024-01-06', 120, 120], [1, '2024-01-07', 80, 200], [1, '2024-01-08', 45, 245], [1, '2024-02-02', 150, 395], [1, '2024-03-10', 30, 425], [3, '2024-02-12', null, null], [3, '2024-02-20', 60, 60]],
                    },
                    note: 'Lena\'s running total starts as NULL: the SUM of nothing but a NULL is NULL. `COALESCE(…, 0)` would show 0.',
                },
                {
                    title: 'A 3-order moving average',
                    sql: code`
                        SELECT order_date, amount,
                               ROUND(AVG(amount) OVER (ORDER BY order_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW), 1) AS moving_avg_3
                        FROM orders
                        ORDER BY order_date;
                    `,
                    result: {
                        columns: ['order_date', 'amount', 'moving_avg_3'],
                        rows: [
                            ['2024-01-06', 120, 120], ['2024-01-07', 80, 100], ['2024-01-08', 45, 81.7], ['2024-01-21', 200, 108.3], ['2024-02-02', 150, 131.7],
                            ['2024-02-12', null, 175], ['2024-02-20', 60, 105], ['2024-03-01', 75, 67.5], ['2024-03-10', 30, 55], ['2024-03-16', 33, 46],
                        ],
                    },
                    note: 'The first two rows average fewer than 3 values. AVG skips the NULL, so 2024-02-12 is the average of 200 and 150.',
                },
                {
                    title: 'The trap: RANGE (the default) versus ROWS',
                    sql: code`
                        SELECT name, salary,
                               SUM(salary) OVER (ORDER BY salary DESC) AS default_range,
                               SUM(salary) OVER (ORDER BY salary DESC, name ROWS UNBOUNDED PRECEDING) AS rows_frame
                        FROM employees
                        ORDER BY salary DESC, name;
                    `,
                    result: {
                        columns: ['name', 'salary', 'default_range', 'rows_frame'],
                        rows: [
                            ['Asha', 95000, 95000, 95000], ['Hana', 80000, 175000, 175000], ['Ben', 70000, 315000, 245000], ['Chen', 70000, 315000, 315000],
                            ['Dara', 60000, 375000, 375000], ['Fatima', 52000, 427000, 427000], ['Eli', 45000, 472000, 472000], ['Gus', 38000, 510000, 510000],
                        ],
                    },
                    note: 'Ben and Chen tie on 70000. The default RANGE frame counts both of them on both rows (315000). ROWS goes one row at a time.',
                },
            ],
            keyPoints: [
                'Aggregate + OVER (ORDER BY …) = a running total (or running count, max…).',
                'The default frame with ORDER BY is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW — tied rows are included together.',
                'Write ROWS explicitly for row-by-row running totals and for moving averages.',
                '`ROWS BETWEEN n PRECEDING AND CURRENT ROW` = the last n + 1 rows.',
                'Without ORDER BY in OVER, the frame is the whole partition, so you get the total, not a running total.',
            ],
            mistakes: [
                'Getting the same running total on tied rows and not knowing why (the RANGE default).',
                'A "7-day" moving average with ROWS 6 PRECEDING when some days are missing — that is 7 rows, not 7 days.',
                'Forgetting PARTITION BY, so one customer\'s running total continues into the next customer\'s.',
            ],
            dialects: [
                'PostgreSQL, SQLite and Oracle also allow RANGE with an offset for real time windows: `RANGE BETWEEN INTERVAL \'6 days\' PRECEDING AND CURRENT ROW` (PostgreSQL).',
                'SQL Server supports ROWS and RANGE frames, but RANGE only with UNBOUNDED or CURRENT ROW.',
            ],
            interviewAnswer: 'Adding ORDER BY to an aggregate\'s OVER clause makes it cumulative, which gives running totals; a frame clause like ROWS BETWEEN 2 PRECEDING AND CURRENT ROW narrows it to a sliding window for moving averages. The subtle point is the default frame, RANGE up to the current row, which lumps tied ORDER BY values together — so I specify ROWS explicitly, with a unique tiebreaker, whenever ties are possible.',
            followUps: [
                { q: 'What is the default window frame?', a: 'With ORDER BY: RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. Without ORDER BY: the whole partition.' },
                { q: 'ROWS or RANGE — what is the difference?', a: 'ROWS counts physical rows. RANGE works on values, so all rows with the same ORDER BY value are in or out together.' },
                { q: 'Why might a LAST_VALUE return the current row instead of the last one?', a: 'Because the default frame ends at the current row. Use ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING.' },
            ],
            practice: {
                explain: 'Explain the RANGE default and why it gives Ben and Chen the same running total.',
                write: 'Write a running count of employees by hire_date (1 for the first hire, 2 for the second…).',
                predict: 'In the moving-average example, what would the frame `ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING` give for 2024-01-07?',
                edge: 'Make Lena\'s running total show 0 instead of NULL on her first order, and explain where the COALESCE goes.',
            },
            resources: [
                sqliteDocs('windowfunctions.html', 'Window Functions (frames)'),
                postgresDocs('sql-expressions.html#SYNTAX-WINDOW-FUNCTIONS', 'Window Function Calls (frame clause)'),
                modeTutorial('SQL Window Functions: running totals'),
            ],
        },
        {
            id: 'sql5-t5',
            kind: 'lesson',
            name: 'Share of total, NTILE and FIRST_VALUE',
            priority: 'should',
            definition: '`x / SUM(x) OVER ()` gives each row\'s share of the total; `NTILE(n)` splits ordered rows into n roughly equal buckets; FIRST_VALUE and LAST_VALUE pull a value from the first or last row of the window.',
            problem: '"What percentage of revenue does each category bring?", "put customers into spending quartiles", "show the top earner\'s name next to everyone in their department" — all common analytics asks that window functions answer in one line.',
            idea: '`SUM(revenue) OVER ()` is the grand total, written on every row, so `100.0 * revenue / SUM(revenue) OVER ()` is the percentage of the total. With PARTITION BY you get the share within each group instead. `NTILE(4) OVER (ORDER BY salary DESC)` deals the sorted rows into 4 buckets, like dealing cards: 1 is the top quarter. `FIRST_VALUE(name) OVER (PARTITION BY dept_id ORDER BY salary DESC)` is the name on the first row of each department\'s window — the top earner.',
            analogy: 'A pie chart, a league split into divisions, and a team captain. Share of total is each slice of the pie; NTILE puts teams into divisions by points; FIRST_VALUE is the captain\'s name printed on every player\'s shirt.',
            breaks: 'Divisions in a league can be unequal by design. NTILE always makes buckets as equal as possible, so tied values can land in different buckets — fine for "roughly top 25%", wrong if ties must stay together.',
            syntax: code`
                100.0 * x / SUM(x) OVER (PARTITION BY g)
                NTILE(4) OVER (ORDER BY x DESC)
                FIRST_VALUE(col) OVER (PARTITION BY g ORDER BY x DESC)
            `,
            howItWorks: [
                'A CTE adds up revenue per category: Electronics 440, Home 150, Bags 120, Kitchen 48, Stationery 35.',
                '`SUM(revenue) OVER ()` is 793 on every row.',
                '100.0 × 440 ÷ 793 = 55.5% for Electronics, and so on.',
                '`NTILE(4)` over 8 employees sorted by salary gives buckets of 2: 1, 1, 2, 2, 3, 3, 4, 4.',
                '`FIRST_VALUE(name)`, ordered by salary DESC within each department, is that department\'s top earner.',
            ],
            diagram: {
                code: 'pie title Share of revenue by category\n  "Electronics" : 440\n  "Home" : 150\n  "Bags" : 120\n  "Kitchen" : 48\n  "Stationery" : 35',
                caption: 'Each slice is one row\'s revenue divided by SUM(revenue) OVER () — the grand total of 793 that the window puts on every row.',
            },
            examples: [
                {
                    title: 'Each category\'s share of revenue',
                    sql: code`
                        WITH by_category AS (
                          SELECT p.category, SUM(oi.quantity * p.price) AS revenue
                          FROM order_items oi
                          JOIN products p ON p.product_id = oi.product_id
                          GROUP BY p.category
                        )
                        SELECT category, revenue,
                               ROUND(100.0 * revenue / SUM(revenue) OVER (), 1) AS pct_of_total
                        FROM by_category
                        ORDER BY revenue DESC;
                    `,
                    result: {
                        columns: ['category', 'revenue', 'pct_of_total'],
                        rows: [['Electronics', 440, 55.5], ['Home', 150, 18.9], ['Bags', 120, 15.1], ['Kitchen', 48, 6.1], ['Stationery', 35, 4.4]],
                    },
                },
                {
                    title: 'NTILE: salary quartiles',
                    sql: code`
                        SELECT name, salary,
                               NTILE(4) OVER (ORDER BY salary DESC, name) AS quartile
                        FROM employees
                        ORDER BY salary DESC, name;
                    `,
                    result: {
                        columns: ['name', 'salary', 'quartile'],
                        rows: [['Asha', 95000, 1], ['Hana', 80000, 1], ['Ben', 70000, 2], ['Chen', 70000, 2], ['Dara', 60000, 3], ['Fatima', 52000, 3], ['Eli', 45000, 4], ['Gus', 38000, 4]],
                    },
                },
                {
                    title: 'FIRST_VALUE: the top earner on every row',
                    sql: code`
                        SELECT dept_id, name, salary,
                               FIRST_VALUE(name) OVER (PARTITION BY dept_id ORDER BY salary DESC) AS top_earner
                        FROM employees
                        WHERE dept_id IS NOT NULL
                        ORDER BY dept_id, salary DESC, name;
                    `,
                    result: {
                        columns: ['dept_id', 'name', 'salary', 'top_earner'],
                        rows: [[1, 'Asha', 95000, 'Asha'], [1, 'Hana', 80000, 'Asha'], [1, 'Ben', 70000, 'Asha'], [1, 'Chen', 70000, 'Asha'], [2, 'Dara', 60000, 'Dara'], [2, 'Eli', 45000, 'Dara'], [3, 'Fatima', 52000, 'Fatima']],
                    },
                },
            ],
            keyPoints: [
                '`SUM(x) OVER ()` = grand total on every row; `SUM(x) OVER (PARTITION BY g)` = group total.',
                'Share of total: `100.0 * x / SUM(x) OVER (…)` — the 100.0 avoids integer division.',
                '`NTILE(n)` makes n buckets as equal in size as possible, in the window\'s order.',
                'FIRST_VALUE is safe with the default frame; LAST_VALUE needs `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.',
                'You can use a window function over an aggregate (`SUM(SUM(x)) OVER ()`) in a GROUP BY query, but a CTE is easier to read.',
            ],
            mistakes: [
                'Integer division in a share: `revenue / SUM(revenue) OVER ()` gives 0 for every row.',
                'Using LAST_VALUE with the default frame and getting the current row\'s value.',
                'Expecting NTILE to keep tied values in the same bucket.',
            ],
            interviewAnswer: 'For share-of-total I divide each row by SUM over an empty or partitioned window, multiplying by 100.0 to avoid integer division. NTILE buckets ordered rows into n near-equal groups for quartiles or deciles, and FIRST_VALUE picks the first row\'s value in each window — for LAST_VALUE I widen the frame to unbounded following, because the default frame stops at the current row.',
            followUps: [
                { q: 'How would you show each product\'s share of revenue within its category?', a: 'Use `SUM(revenue) OVER (PARTITION BY category)` as the divisor.' },
                { q: '`NTILE(4)` on 10 rows — how big are the buckets?', a: '3, 3, 2, 2. The leftover rows go to the first buckets.' },
            ],
            practice: {
                explain: 'Explain why `SUM(revenue) OVER ()` puts the same number on every row.',
                write: 'For each customer, show their total spend and their percentage of all spending, rounded to 1 decimal place.',
                predict: 'What quartile would each employee get with `NTILE(3)` instead of `NTILE(4)`?',
                edge: 'Write `LAST_VALUE(name)` for the lowest earner in each department and make it return the right name on every row.',
            },
            resources: [
                postgresDocs('functions-window.html', 'Window Functions (NTILE, FIRST_VALUE, LAST_VALUE)'),
                modeTutorial('SQL Window Functions: NTILE'),
                dataLemur('percentage of total questions'),
            ],
        },
    ],
};
