import type { SqlPhase } from '../sql';
import { code } from './code';
import { cs50Sql, dataLemur, modeTutorial, postgresDocs, sqlBolt, sqlZoo, w3 } from './resources';

export const sqlPhase2: SqlPhase = {
    id: 'summarising',
    number: 2,
    short: 'Summarising',
    title: 'Summarising data: aggregates, GROUP BY and HAVING',
    accent: '#ffb74d',
    goal: 'Turn many rows into answers — totals, averages, counts per group — and know exactly which rows each number is built from.',
    bigPicture: 'Questions like "how many orders per customer?" or "average salary per department?" are the heart of analytics and of SQL interviews. They all use the same three tools: an aggregate function, GROUP BY to make the groups, and HAVING to filter them.',
    topics: [
        {
            id: 'sql2-t1',
            kind: 'lesson',
            name: 'Aggregate functions: COUNT, SUM, AVG, MIN and MAX',
            priority: 'must',
            definition: 'An aggregate function turns many rows into one value — COUNT counts, SUM adds, AVG averages, MIN and MAX find the smallest and largest — and every one except `COUNT(*)` skips NULLs.',
            problem: 'Nobody wants to read 10 million orders. They want "how many?", "how much in total?", "what is the average?". Aggregates answer those in one line — but the NULL rules quietly change the answers if you don\'t know them.',
            idea: 'Without GROUP BY, an aggregate squashes the whole table (after WHERE) into one row. `COUNT(*)` counts rows. `COUNT(column)` counts rows where that column is not NULL. `COUNT(DISTINCT column)` counts the different non-NULL values. SUM and AVG add and average the non-NULL values. MIN and MAX work on numbers, text (alphabetical) and dates. Because AVG skips NULLs, the average of order amounts is the total divided by 9 orders, not 10.',
            analogy: 'A cashier at the end of the day. They don\'t list every sale; they count the receipts (COUNT), add up the takings (SUM), and note the biggest and smallest sale (MAX, MIN). A receipt with the amount torn off still counts as a receipt, but it adds nothing to the takings.',
            breaks: 'A cashier would notice the torn receipt and ask about it. SQL doesn\'t: it silently leaves NULLs out of SUM and AVG, so you have to decide yourself whether a missing value should count as zero.',
            syntax: code`
                SELECT COUNT(*), COUNT(column), COUNT(DISTINCT column),
                       SUM(column), AVG(column), MIN(column), MAX(column)
                FROM table_name;
            `,
            howItWorks: [
                'FROM and WHERE decide which rows are in play — here all 10 orders.',
                '`COUNT(*)` counts the rows: 10.',
                '`COUNT(amount)` counts rows whose amount is not NULL: 9, because order 106 has none.',
                '`SUM(amount)` adds the 9 amounts: 793. `AVG(amount)` is 793 ÷ 9 = 88.11, not 793 ÷ 10.',
                'If the question means "average per order, counting the missing one as zero", divide SUM by `COUNT(*)` instead: 79.3.',
            ],
            diagram: {
                code: 'flowchart LR\n  A["10 order rows<br/>120, 80, 45, 200, 150,<br/>NULL, 60, 75, 30, 33"] --> C["COUNT(*) = 10"]\n  A --> N["COUNT(amount) = 9<br/>NULL skipped"]\n  A --> S["SUM(amount) = 793"]\n  A --> V["AVG(amount) = 793 / 9"]',
                caption: 'Many rows go in and one number comes out. COUNT(*) counts every row; COUNT, SUM and AVG of a column skip the NULL — so AVG divides by 9, not 10.',
            },
            examples: [
                {
                    title: 'One summary row for the whole table',
                    sql: code`
                        SELECT COUNT(*) AS employees,
                               SUM(salary) AS total_pay,
                               AVG(salary) AS average_pay,
                               MIN(salary) AS lowest,
                               MAX(salary) AS highest
                        FROM employees;
                    `,
                    result: {
                        columns: ['employees', 'total_pay', 'average_pay', 'lowest', 'highest'],
                        rows: [[8, 510000, 63750, 38000, 95000]],
                    },
                },
                {
                    title: 'Three different counts',
                    sql: code`
                        SELECT COUNT(*) AS all_rows,
                               COUNT(dept_id) AS with_a_department,
                               COUNT(DISTINCT dept_id) AS different_departments
                        FROM employees;
                    `,
                    result: {
                        columns: ['all_rows', 'with_a_department', 'different_departments'],
                        rows: [[8, 7, 3]],
                    },
                    note: 'Gus has no department, so `COUNT(dept_id)` is 7. The 7 non-NULL values are only 1, 2 and 3, so `COUNT(DISTINCT dept_id)` is 3.',
                },
                {
                    title: 'How NULL changes an average',
                    sql: code`
                        SELECT COUNT(*) AS orders,
                               COUNT(amount) AS with_amount,
                               SUM(amount) AS total,
                               ROUND(AVG(amount), 2) AS avg_of_known,
                               ROUND(SUM(amount) * 1.0 / COUNT(*), 2) AS avg_over_all
                        FROM orders;
                    `,
                    result: {
                        columns: ['orders', 'with_amount', 'total', 'avg_of_known', 'avg_over_all'],
                        rows: [[10, 9, 793, 88.11, 79.3]],
                    },
                    note: 'Both averages are "right" — they answer different questions. Say which one you mean.',
                },
            ],
            keyPoints: [
                '`COUNT(*)` counts rows; `COUNT(col)` counts non-NULL values; `COUNT(DISTINCT col)` counts different non-NULL values.',
                'SUM, AVG, MIN and MAX ignore NULLs.',
                'SUM of no rows (or only NULLs) is NULL, not 0. Wrap it: `COALESCE(SUM(x), 0)`.',
                'Without GROUP BY, an aggregate query returns exactly one row — even from an empty table.',
                'MIN and MAX work on text and dates too.',
            ],
            mistakes: [
                'Using `COUNT(column)` when you mean "how many rows", and getting a smaller number because of NULLs.',
                'Mixing a plain column with an aggregate without GROUP BY: `SELECT name, MAX(salary) FROM employees` is an error in most databases (SQLite allows it but the name is unreliable).',
                'Putting an aggregate in WHERE: `WHERE SUM(amount) > 100` is an error. That is HAVING\'s job.',
            ],
            dialects: [
                'AVG of whole numbers: PostgreSQL and SQLite return a decimal; SQL Server returns a whole number (AVG of 1 and 2 is 1). Use `AVG(x * 1.0)` there.',
            ],
            interviewAnswer: 'Aggregate functions collapse a set of rows into one value: COUNT, SUM, AVG, MIN and MAX. The detail interviewers probe is NULL handling — COUNT star counts rows, COUNT of a column skips NULLs, and SUM and AVG ignore NULLs, so an average is over the known values only. I also remember that SUM over no rows is NULL, so I COALESCE it to zero when the result feeds a report.',
            followUps: [
                { q: 'What is the difference between `COUNT(*)`, `COUNT(1)` and `COUNT(column)`?', a: '`COUNT(*)` and `COUNT(1)` both count rows, at the same speed. `COUNT(column)` counts only rows where that column is not NULL.' },
                { q: 'What does SUM return when there are no rows?', a: 'NULL. COUNT returns 0. Use `COALESCE(SUM(x), 0)` when you need 0.' },
                { q: 'Can you use an aggregate in WHERE?', a: 'No — WHERE runs before rows are grouped. Filter on aggregates with HAVING, or in an outer query.' },
            ],
            practice: {
                explain: 'Explain why `AVG(amount)` on orders is 88.11 and not 79.3.',
                write: 'Write one query that returns the number of products, the cheapest price, the dearest price and the average price.',
                predict: 'What do `COUNT(*)`, `COUNT(city)` and `COUNT(DISTINCT city)` return on the customers table?',
                edge: 'What does `SELECT SUM(amount), COUNT(*) FROM orders WHERE status = \'refunded\';` return? Why isn\'t it 0 and 0?',
            },
            resources: [
                sqlBolt('Lesson 10: Queries with aggregates (Pt. 1)'),
                w3('sql_count.asp', 'SQL COUNT() Function'),
                modeTutorial('SQL Aggregate Functions, COUNT, SUM, MIN/MAX, AVG'),
            ],
        },
        {
            id: 'sql2-t2',
            kind: 'lesson',
            name: 'GROUP BY: one result row per group',
            priority: 'must',
            definition: 'GROUP BY splits the rows into groups that share the same value in the listed columns, and the aggregates then return one row per group.',
            problem: 'One total is rarely enough. Managers ask for "revenue per month", "headcount per department", "orders per customer". GROUP BY gives you a total for every group in one query, instead of one query per group.',
            idea: 'GROUP BY dept_id puts all rows with the same dept_id into one pile. Each pile becomes one result row, and every aggregate in SELECT is worked out separately for each pile. The golden rule: every column in SELECT must either be in GROUP BY or be inside an aggregate — because a group of 4 employees has 4 names, and the database can\'t pick one for you. All NULLs fall into one group of their own.',
            analogy: 'Sorting a bag of coins into piles by type — all the 10p together, all the £1 together — and then counting each pile. GROUP BY makes the piles; COUNT and SUM count them.',
            breaks: 'With coins you can still see each coin in its pile. After GROUP BY, the separate rows are gone from the result: you only see one row per pile, so you can\'t ask for "the name" of a group unless you aggregate it.',
            syntax: code`
                SELECT group_column, COUNT(*), SUM(column)
                FROM table_name
                GROUP BY group_column;
            `,
            howItWorks: [
                'FROM takes all 8 employees.',
                'GROUP BY dept_id makes piles: department 1 (Asha, Ben, Chen, Hana), department 2 (Dara, Eli), department 3 (Fatima), and a NULL pile (Gus).',
                'For each pile, `COUNT(*)` and `AVG(salary)` are worked out: department 1 has 4 people averaging 78750.',
                'SELECT returns one row per pile: dept_id, plus the aggregates.',
                'Department 4 (HR) has no employees, so there is no pile and no row for it. Getting zero rows to show needs a join (Phase 3).',
            ],
            diagram: {
                code: 'flowchart LR\n  E["8 employee rows"] --> G1["dept 1: Asha, Ben, Chen, Hana"]\n  E --> G2["dept 2: Dara, Eli"]\n  E --> G3["dept 3: Fatima"]\n  E --> G0["dept NULL: Gus"]\n  G1 --> R1["1 · 4 people · avg 78750"]\n  G2 --> R2["2 · 2 people · avg 52500"]\n  G3 --> R3["3 · 1 person · avg 52000"]\n  G0 --> R0["NULL · 1 person · avg 38000"]',
                caption: 'GROUP BY makes one pile per department, and each pile becomes one result row with its own count and average. NULLs form a pile of their own. HR has nobody, so it gets no pile at all.',
            },
            examples: [
                {
                    title: 'Headcount and average salary per department',
                    sql: code`
                        SELECT dept_id, COUNT(*) AS headcount, AVG(salary) AS avg_salary
                        FROM employees
                        GROUP BY dept_id
                        ORDER BY dept_id;
                    `,
                    result: {
                        columns: ['dept_id', 'headcount', 'avg_salary'],
                        rows: [[null, 1, 38000], [1, 4, 78750], [2, 2, 52500], [3, 1, 52000]],
                    },
                    note: 'Gus forms the NULL group. HR (department 4) is missing because no rows belong to it.',
                },
                {
                    title: 'Revenue per month',
                    sql: code`
                        SELECT strftime('%Y-%m', order_date) AS month,
                               COUNT(*) AS orders,
                               SUM(amount) AS revenue
                        FROM orders
                        GROUP BY strftime('%Y-%m', order_date)
                        ORDER BY month;
                    `,
                    result: {
                        columns: ['month', 'orders', 'revenue'],
                        rows: [['2024-01', 4, 445], ['2024-02', 3, 210], ['2024-03', 3, 138]],
                    },
                    note: 'You can group by a calculation, not just a column. February has 3 orders but only 2 amounts, because order 106 is NULL.',
                },
                {
                    title: 'Group by two columns',
                    sql: code`
                        SELECT customer_id, status, COUNT(*) AS orders
                        FROM orders
                        GROUP BY customer_id, status
                        ORDER BY customer_id, status;
                    `,
                    result: {
                        columns: ['customer_id', 'status', 'orders'],
                        rows: [[1, 'delivered', 4], [1, 'shipped', 1], [2, 'delivered', 2], [3, 'cancelled', 1], [3, 'delivered', 1], [5, 'pending', 1]],
                    },
                    note: 'One row per pair of customer and status that actually appears in the data.',
                },
            ],
            keyPoints: [
                'GROUP BY makes one result row per distinct combination of the grouping columns.',
                'Every column in SELECT must be in GROUP BY or inside an aggregate.',
                'All NULLs in a grouping column form one group.',
                'Groups with no rows don\'t appear at all. To show zeros (like HR with 0 people), start from the full list and LEFT JOIN (Phase 3).',
                'Grouped results come back in no particular order. Add ORDER BY.',
            ],
            mistakes: [
                'Selecting a column that is neither grouped nor aggregated, like `SELECT dept_id, name, COUNT(*) … GROUP BY dept_id`.',
                'Expecting groups with zero rows to appear with a count of 0.',
                'Grouping by too many columns (such as the id), so every group has one row and nothing is summarised.',
            ],
            dialects: [
                'SQLite and older MySQL let you select a column that isn\'t grouped and silently pick a value. PostgreSQL, SQL Server and modern MySQL reject it. Write it the strict way.',
                'GROUP BY an alias (`GROUP BY month`) works in PostgreSQL, MySQL and SQLite, but not in SQL Server — repeat the expression there.',
            ],
            interviewAnswer: 'GROUP BY partitions the filtered rows into groups by the grouping columns, and aggregates are computed once per group, giving one output row per group. The rule is that every selected column must be grouped or aggregated. Two details I mention: NULLs form a single group, and groups with no rows simply don\'t appear — so to report zeros I drive the query from the complete dimension table with a LEFT JOIN.',
            followUps: [
                { q: 'Why must non-aggregated columns be in GROUP BY?', a: 'Each group becomes one row. A column that isn\'t grouped could have many values in the group, and SQL won\'t guess which one to show.' },
                { q: 'How do you show departments with zero employees?', a: '`SELECT d.dept_name, COUNT(e.emp_id) FROM departments d LEFT JOIN employees e ON e.dept_id = d.dept_id GROUP BY d.dept_name` — COUNT of a column gives 0 when nothing matched.' },
            ],
            practice: {
                explain: 'Explain the golden rule of GROUP BY, using the employees table.',
                write: 'Write a query for the number of products and the average price in each category, sorted by category.',
                predict: 'How many rows does `SELECT city, COUNT(*) FROM customers GROUP BY city;` return, and what is the count for Leeds?',
                edge: 'Write a query that returns each customer_id with their total spend, where a customer whose only orders have NULL amounts shows 0, not NULL.',
            },
            resources: [
                sqlBolt('Lesson 11: Queries with aggregates (Pt. 2)'),
                w3('sql_groupby.asp', 'SQL GROUP BY Statement'),
                sqlZoo('SUM and COUNT'),
            ],
        },
        {
            id: 'sql2-t3',
            kind: 'lesson',
            name: 'HAVING: filtering groups, and how it differs from WHERE',
            priority: 'must',
            definition: 'HAVING filters groups after GROUP BY, using aggregates such as `COUNT(*) > 1`, while WHERE filters single rows before any grouping happens.',
            problem: '"Customers with more than one order", "departments whose average salary is over 55000". You can\'t test those in WHERE, because the counts and averages don\'t exist until the rows are grouped. HAVING is the filter that runs after grouping.',
            idea: 'Think of two sieves. WHERE is the first sieve: it removes rows before they are put into groups. HAVING is the second: it removes whole groups after they are counted. A query can use both: WHERE keeps only delivered orders, GROUP BY makes a group per customer, then HAVING keeps customers whose delivered total is at least £100. If a condition is about one row (status, date), put it in WHERE — it is cheaper, because fewer rows get grouped.',
            analogy: 'Picking a football team. WHERE is the trial: players under 16 are sent home before teams are formed. HAVING comes after the teams are formed: any team with fewer than 11 players is dropped from the tournament.',
            breaks: 'In football you could also drop a team for one bad player. HAVING can\'t look at individual rows any more — only at things that describe the whole group, such as counts, sums and the grouping columns.',
            syntax: code`
                SELECT group_column, COUNT(*)
                FROM table_name
                WHERE row_condition
                GROUP BY group_column
                HAVING group_condition;
            `,
            howItWorks: [
                'FROM: all 10 orders.',
                '`WHERE status = \'delivered\'`: 7 rows are left.',
                'GROUP BY customer_id: customer 1 has 4 delivered orders (275), customer 2 has 2 (275), customer 3 has 1 (60).',
                'HAVING `SUM(amount) >= 100`: customer 3\'s group fails and is removed.',
                'SELECT returns customers 1 and 2 with their totals.',
            ],
            diagram: {
                code: 'flowchart LR\n  A["10 orders"] -->|"WHERE status = delivered<br/>filters rows"| B["7 rows"]\n  B -->|"GROUP BY customer_id"| C["3 groups<br/>1: 275 · 2: 275 · 3: 60"]\n  C -->|"HAVING SUM over 100<br/>filters groups"| D["2 groups<br/>customers 1 and 2"]',
                caption: 'Two sieves at two different moments. WHERE removes single rows before grouping; HAVING removes whole groups after their totals are known.',
            },
            examples: [
                {
                    title: 'Departments with more than one person',
                    sql: code`
                        SELECT dept_id, COUNT(*) AS headcount
                        FROM employees
                        GROUP BY dept_id
                        HAVING COUNT(*) > 1
                        ORDER BY dept_id;
                    `,
                    result: { columns: ['dept_id', 'headcount'], rows: [[1, 4], [2, 2]] },
                },
                {
                    title: 'WHERE and HAVING together',
                    sql: code`
                        SELECT customer_id, SUM(amount) AS delivered_total
                        FROM orders
                        WHERE status = 'delivered'
                        GROUP BY customer_id
                        HAVING SUM(amount) >= 100
                        ORDER BY customer_id;
                    `,
                    result: { columns: ['customer_id', 'delivered_total'], rows: [[1, 275], [2, 275]] },
                    note: 'Priya\'s shipped order (150) isn\'t counted: WHERE removed it before the sum. Lena\'s delivered total is only 60.',
                },
            ],
            keyPoints: [
                'WHERE filters rows, before GROUP BY. HAVING filters groups, after GROUP BY.',
                'Aggregates can be used in HAVING but not in WHERE.',
                'A row-level condition belongs in WHERE: it is clearer and faster.',
                'HAVING can test an aggregate that isn\'t in SELECT, such as `HAVING MAX(salary) > 60000`.',
            ],
            mistakes: [
                'Writing `WHERE COUNT(*) > 1` — an error, because counts don\'t exist yet when WHERE runs.',
                'Putting a plain row condition in HAVING (`HAVING status = \'delivered\'`): it either fails or does something unexpected.',
                'Using a SELECT alias in HAVING (`HAVING headcount > 1`). Some databases allow it; standard SQL and SQL Server don\'t. Repeat the aggregate.',
            ],
            interviewAnswer: 'WHERE and HAVING are both filters but run at different stages. WHERE filters individual rows before grouping, so it can\'t use aggregates. HAVING filters groups after GROUP BY, so it can. If a condition doesn\'t need an aggregate I put it in WHERE, because filtering early means less data to group.',
            followUps: [
                { q: 'Can you use HAVING without GROUP BY?', a: 'Yes. The whole result is treated as one group: `SELECT COUNT(*) FROM orders HAVING COUNT(*) > 5` returns one row or none.' },
                { q: 'Which is faster for a row condition, WHERE or HAVING?', a: 'WHERE, because rows are removed before the work of grouping. Many optimisers move such conditions anyway, but write them in WHERE.' },
            ],
            practice: {
                explain: 'Explain WHERE versus HAVING using the football-trial analogy, then using the orders table.',
                write: 'Write a query for customers who placed at least 2 orders, showing customer_id and the number of orders.',
                predict: 'Which dept_ids does `SELECT dept_id FROM employees GROUP BY dept_id HAVING AVG(salary) > 55000;` return?',
                edge: 'Customer 3 has one NULL amount. Does `HAVING SUM(amount) > 50` keep them? Does `HAVING COUNT(amount) = COUNT(*)`? Explain.',
            },
            resources: [
                w3('sql_having.asp', 'SQL HAVING Clause'),
                modeTutorial('SQL HAVING'),
                sqlBolt('Lesson 11: Queries with aggregates (Pt. 2)'),
            ],
        },
        {
            id: 'sql2-t4',
            kind: 'lesson',
            name: 'Conditional aggregation: counting several things at once',
            priority: 'must',
            definition: 'Putting CASE inside an aggregate — `SUM(CASE WHEN status = \'delivered\' THEN 1 ELSE 0 END)` — counts or sums only the rows that match, so one query can produce several different totals, or turn rows into columns (a pivot).',
            problem: '"For each customer, how many orders were delivered and how many weren\'t?" Running two queries and gluing them together is slow and messy. Interviewers love this pattern because it shows you understand that aggregates work on whatever values you give them.',
            idea: 'An aggregate adds up whatever expression you hand it. Hand SUM a CASE that gives 1 for the rows you care about and 0 for the rest, and it counts just those rows. Hand it `CASE WHEN … THEN amount END` and it sums just those amounts. Do this several times in one SELECT, with different conditions, and you get several columns from one pass over the data. Use it with months as the conditions and the rows become columns — that is a pivot. For a percentage, divide one conditional count by `COUNT(*)`, using 100.0 to avoid integer division.',
            analogy: 'Counting a class with tally marks on a sheet with several columns: as each pupil walks past, you add a mark under "walked", "cycled" or "came by bus". One walk-past fills in every column at once.',
            breaks: 'With tally marks a pupil can only go in one column. Conditional aggregation has no such rule: one row can count towards several columns if several conditions are true, so make your conditions not overlap when they should add up to the total.',
            syntax: code`
                SELECT group_column,
                       SUM(CASE WHEN condition THEN 1 ELSE 0 END) AS how_many,
                       SUM(CASE WHEN condition THEN value END)    AS how_much
                FROM table_name
                GROUP BY group_column;
            `,
            howItWorks: [
                'GROUP BY customer_id makes one group per customer.',
                'For each row, the CASE gives 1 if the order is delivered and 0 if not.',
                'SUM adds those 1s and 0s, which is the number of delivered orders in the group.',
                'A second SUM with the opposite condition counts the rest. `COUNT(*)` gives the total.',
                'For a pivot, each column\'s CASE picks one month: `CASE WHEN order_date LIKE \'2024-01%\' THEN amount ELSE 0 END`.',
            ],
            diagram: {
                code: 'flowchart LR\n  R["Priya\'s orders<br/>delivered, delivered,<br/>delivered, shipped, delivered"] --> C["CASE gives<br/>1, 1, 1, 0, 1"]\n  C --> S["SUM = 4 delivered"]\n  R --> T["COUNT(*) = 5 orders"]',
                caption: 'CASE turns each row into a 1 or a 0, and SUM adds them up — a count of just the matching rows, worked out next to the other totals in the same pass.',
            },
            examples: [
                {
                    title: 'Several counts in one query',
                    sql: code`
                        SELECT customer_id,
                               COUNT(*) AS orders,
                               SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS delivered,
                               SUM(CASE WHEN status <> 'delivered' THEN 1 ELSE 0 END) AS not_delivered
                        FROM orders
                        GROUP BY customer_id
                        ORDER BY customer_id;
                    `,
                    result: {
                        columns: ['customer_id', 'orders', 'delivered', 'not_delivered'],
                        rows: [[1, 5, 4, 1], [2, 2, 2, 0], [3, 2, 1, 1], [5, 1, 0, 1]],
                    },
                },
                {
                    title: 'A pivot: one column per month',
                    sql: code`
                        SELECT customer_id,
                               SUM(CASE WHEN order_date LIKE '2024-01%' THEN amount ELSE 0 END) AS jan,
                               SUM(CASE WHEN order_date LIKE '2024-02%' THEN amount ELSE 0 END) AS feb,
                               SUM(CASE WHEN order_date LIKE '2024-03%' THEN amount ELSE 0 END) AS mar
                        FROM orders
                        GROUP BY customer_id
                        ORDER BY customer_id;
                    `,
                    result: {
                        columns: ['customer_id', 'jan', 'feb', 'mar'],
                        rows: [[1, 245, 150, 30], [2, 200, 0, 75], [3, 0, 60, 0], [5, 0, 0, 33]],
                    },
                    note: 'Rows became columns. Lena\'s February is 60: order 106\'s NULL amount is skipped by SUM.',
                },
                {
                    title: 'A percentage',
                    sql: code`
                        SELECT ROUND(100.0 * SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_delivered,
                               AVG(CASE WHEN status = 'delivered' THEN 1.0 ELSE 0 END) AS share_delivered
                        FROM orders;
                    `,
                    result: { columns: ['pct_delivered', 'share_delivered'], rows: [[70, 0.7]] },
                    note: '7 of 10 orders were delivered. 100.0 (not 100) stops integer division. The AVG of 1s and 0s is a neat shortcut for a share.',
                },
            ],
            keyPoints: [
                '`SUM(CASE WHEN cond THEN 1 ELSE 0 END)` counts matching rows; `COUNT(CASE WHEN cond THEN 1 END)` does the same, because COUNT skips the NULLs.',
                '`SUM(CASE WHEN cond THEN amount END)` sums only matching amounts.',
                'One pass over the data gives many totals — faster and simpler than several queries.',
                'A pivot is conditional aggregation with one column per value.',
                'For percentages, multiply by 100.0 before dividing.',
            ],
            mistakes: [
                'Writing `COUNT(CASE WHEN cond THEN 1 ELSE 0 END)`. COUNT counts the 0s too, because 0 is not NULL. Use SUM, or drop the ELSE.',
                'Computing a percentage with whole numbers: `100 * 7 / 10` is fine but `7 / 10 * 100` is 0.',
                'Conditions that overlap when the columns should add up to the total.',
            ],
            dialects: [
                'PostgreSQL and SQLite support a FILTER clause: `COUNT(*) FILTER (WHERE status = \'delivered\')`. It is the same idea with neater syntax.',
                'SQL Server and Oracle have a PIVOT operator, but CASE works everywhere and interviewers accept it.',
            ],
            interviewAnswer: 'Conditional aggregation puts a CASE expression inside an aggregate, like SUM of CASE WHEN status is delivered THEN 1 ELSE 0, so I can compute several metrics per group in a single pass — counts by status, revenue by month as columns, or a ratio. For ratios I multiply by 100.0 first to avoid integer division, and I make sure SUM rather than COUNT wraps a CASE that returns zero.',
            followUps: [
                { q: 'Why is `COUNT(CASE WHEN x THEN 1 ELSE 0 END)` wrong?', a: 'COUNT counts every non-NULL value, and 0 is not NULL, so it counts all rows. Use SUM, or remove the ELSE so non-matches become NULL.' },
                { q: 'How do you pivot rows into columns in SQL?', a: 'GROUP BY the row label and write one `SUM(CASE WHEN column = value THEN amount END)` per output column.' },
            ],
            practice: {
                explain: 'Explain how `SUM(CASE WHEN … THEN 1 ELSE 0 END)` counts rows.',
                write: 'For each department, show the number of employees earning 60000 or more and the number earning less, in one query.',
                predict: 'What does `SELECT COUNT(CASE WHEN status = \'delivered\' THEN 1 ELSE 0 END) FROM orders;` return, and why is it not 7?',
                edge: 'Write the share of orders that are cancelled, as a percentage with one decimal place, and check it is 10.0.',
            },
            resources: [
                modeTutorial('SQL CASE (Using CASE with aggregate functions)'),
                postgresDocs('sql-expressions.html#SYNTAX-AGGREGATES', 'Aggregate Expressions (FILTER)'),
                dataLemur('conditional aggregation questions'),
            ],
        },
        {
            id: 'sql2-t5',
            kind: 'lesson',
            name: 'The order a query really runs in',
            priority: 'must',
            definition: 'A query is written SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT, but the database works it out in a different order — FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT — and that order explains most "why doesn\'t this work?" errors.',
            problem: 'Why can\'t WHERE use the alias you made in SELECT? Why can ORDER BY use it? Why can\'t WHERE use COUNT? Without the run order these look like random rules. With it, they are obvious — and interviewers ask about it directly.',
            idea: 'Each step works on the output of the step before. FROM (and JOIN) builds the rows. WHERE removes rows. GROUP BY makes groups. HAVING removes groups. SELECT works out the output columns and their aliases (window functions run here too). DISTINCT removes duplicate rows. ORDER BY sorts. LIMIT cuts. So: WHERE runs before SELECT, and can\'t see its aliases. ORDER BY runs after SELECT, so it can. WHERE runs before GROUP BY, so it can\'t use aggregates — HAVING runs after, so it can.',
            analogy: 'Making a sandwich. You write the order as "sandwich: cheese and tomato, on brown bread, cut in half". But you actually get the bread first (FROM), pick the fillings (WHERE), assemble it (GROUP BY and SELECT), and cut it last (ORDER BY, LIMIT). You can\'t cut what you haven\'t made yet.',
            breaks: 'A cook really does work in that order. A database only has to behave as if it does: the optimiser may reorder the real work — for example, use an index to sort early — as long as the answer is the same.',
            syntax: code`
                -- written order        -- run order
                SELECT    ...           -- 5
                FROM      ...           -- 1
                WHERE     ...           -- 2
                GROUP BY  ...           -- 3
                HAVING    ...           -- 4
                ORDER BY  ...           -- 6
                LIMIT     ...;          -- 7
            `,
            howItWorks: [
                'FROM employees: all 8 rows.',
                '`WHERE salary > 40000`: Gus (38000) is removed, so 7 rows are left.',
                'GROUP BY dept_id: department 1 has 4 rows, department 2 has 2 (Dara, Eli), department 3 has 1 (Fatima).',
                'HAVING `COUNT(*) >= 2`: department 3 is removed.',
                'SELECT works out dept_id and `AVG(salary)` AS avg_salary for the 2 groups left.',
                'ORDER BY avg_salary DESC can use the alias, because SELECT has already run.',
            ],
            diagram: {
                code: 'flowchart LR\n  F["1 FROM<br/>and JOIN"] --> W["2 WHERE"] --> G["3 GROUP BY"] --> H["4 HAVING"] --> S["5 SELECT<br/>aliases made here"] --> D["6 DISTINCT"] --> O["7 ORDER BY<br/>can use aliases"] --> L["8 LIMIT"]',
                caption: 'The order the database works in. Anything a step needs must already exist: WHERE can\'t use SELECT\'s aliases (made at step 5), but ORDER BY at step 7 can.',
            },
            examples: [
                {
                    title: 'Every clause in one query',
                    sql: code`
                        SELECT dept_id, AVG(salary) AS avg_salary
                        FROM employees
                        WHERE salary > 40000
                        GROUP BY dept_id
                        HAVING COUNT(*) >= 2
                        ORDER BY avg_salary DESC;
                    `,
                    result: { columns: ['dept_id', 'avg_salary'], rows: [[1, 78750], [2, 52500]] },
                    note: 'Follow the steps above: WHERE drops Gus, HAVING drops department 3, and ORDER BY uses the alias made in SELECT.',
                },
                {
                    title: 'Filtering on an alias: wrap the query',
                    sql: code`
                        SELECT name, bonus
                        FROM (
                          SELECT name, salary / 10 AS bonus
                          FROM employees
                        ) AS with_bonus
                        WHERE bonus > 7000
                        ORDER BY bonus DESC;
                    `,
                    result: { columns: ['name', 'bonus'], rows: [['Asha', 9500], ['Hana', 8000]] },
                    note: '`WHERE bonus > 7000` fails in a single query in strict databases, because WHERE runs before SELECT makes bonus. The inner query makes it first; Phase 4 covers this properly.',
                },
            ],
            keyPoints: [
                'Run order: FROM → WHERE → GROUP BY → HAVING → SELECT → DISTINCT → ORDER BY → LIMIT.',
                'WHERE can\'t use SELECT aliases or aggregates; HAVING can use aggregates; ORDER BY can use aliases.',
                'Window functions are worked out at the SELECT step, so you can\'t filter on them in WHERE — wrap the query instead.',
                'To filter on a calculated column, repeat the expression in WHERE or wrap the query in a subquery or CTE.',
            ],
            mistakes: [
                'Using a SELECT alias in WHERE and getting "no such column".',
                'Expecting LIMIT to run before ORDER BY ("take 3 rows, then sort them").',
                'Filtering on `ROW_NUMBER()` in WHERE — it doesn\'t exist yet at that step.',
            ],
            dialects: [
                'MySQL and SQLite are lenient and let HAVING (and sometimes WHERE) use SELECT aliases. PostgreSQL and SQL Server follow the strict order. Write it the strict way and it runs everywhere.',
            ],
            interviewAnswer: 'SQL is written SELECT first, but logically processed as FROM and JOINs, then WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY and finally LIMIT. That explains the common rules: WHERE can\'t reference SELECT aliases or aggregates because they don\'t exist yet, HAVING can use aggregates, and ORDER BY can use aliases. To filter on a computed column or a window function, I wrap the query in a CTE and filter outside.',
            followUps: [
                { q: 'Why can ORDER BY use a column alias but WHERE can\'t?', a: 'ORDER BY runs after SELECT, when the alias exists. WHERE runs before SELECT.' },
                { q: 'Where do window functions fit in the order?', a: 'At the SELECT step, after WHERE, GROUP BY and HAVING. That is why you filter on them in an outer query.' },
            ],
            practice: {
                explain: 'Recite the run order from memory, and use it to explain why `WHERE COUNT(*) > 1` fails.',
                write: 'Write a query for categories whose average product price is above £10, sorted by that average from high to low, using an alias in ORDER BY.',
                predict: 'In the "every clause" example, what would change if WHERE were `salary > 50000`? Work it out step by step, then run it.',
                edge: 'You want employees whose salary is above the company average. Why does `WHERE salary > AVG(salary)` fail, and what would you do instead?',
            },
            resources: [
                sqlBolt('Lesson 12: Order of execution of a Query'),
                cs50Sql('Lecture 0: Querying'),
                postgresDocs('sql-select.html', 'SELECT (how a query is processed)'),
            ],
        },
    ],
};
