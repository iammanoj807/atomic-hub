import type { InterviewSet } from './types';

// SQL interview questions that cut across the lessons. The quick-fire
// definitions (WHERE vs HAVING, UNION vs UNION ALL…) are in Phase 8's
// "Quick-fire SQL theory questions", and the classic coding problems are
// Phase 8's interview problems; these are the "why is this wrong?" kind.

export const sqlInterviewSet: InterviewSet = {
    id: 'sql',
    title: 'SQL in interviews',
    blurb: 'Beyond writing a query: why a query is wrong, why it is slow, and how to trust the numbers it gives.',
    questions: [
        {
            id: 'sql-logical-order',
            q: 'In what order does SQL actually run a query, and why does it matter?',
            level: 'beginner',
            kind: 'concept',
            testing: 'Whether you understand SQL well enough to predict errors, instead of memorising rules like "you can\'t use an alias in WHERE".',
            answer: 'We write SELECT first, but the database works in a different order: FROM and the JOINs first, to build the rows; then WHERE filters those rows; then GROUP BY forms the groups; HAVING filters the groups; then SELECT computes the output columns, including window functions; then DISTINCT, ORDER BY, and finally LIMIT.\n\nIt explains several rules at once. You can\'t use a SELECT alias in WHERE, because WHERE runs before SELECT has named it. You can\'t put an aggregate like SUM in WHERE, because the groups don\'t exist yet, which is what HAVING is for. You can\'t filter on a window function in WHERE either, so you wrap the query in a CTE and filter outside. And ORDER BY can use aliases, because it runs after SELECT.',
            analogy: 'Cooking from a recipe card that lists the plating first. The kitchen still has to fetch the ingredients (FROM), throw out the bad ones (WHERE), sort them into dishes (GROUP BY), drop the dishes that don\'t make the cut (HAVING), then plate (SELECT), arrange the plates (ORDER BY) and serve the first few (LIMIT).',
            diagram: {
                code: 'flowchart LR\n  F["FROM + JOIN<br/>build rows"] --> W["WHERE<br/>filter rows"] --> G["GROUP BY<br/>make groups"] --> H["HAVING<br/>filter groups"] --> S["SELECT<br/>columns, windows"] --> D["DISTINCT"] --> O["ORDER BY"] --> L["LIMIT"]',
                caption: 'The logical order. Anything named or computed at a step can only be used by the steps after it.',
            },
            strong: [
                'Gives the order and then uses it to explain real errors.',
                'Mentions window functions run at the SELECT step, so they need a CTE or subquery to filter on.',
                'Notes this is the logical order; the optimiser may physically run things differently with the same result.',
            ],
            traps: [
                'Reciting the order with no example of why it matters.',
                'Claiming the database literally executes in that order: the planner can reorder as long as results match.',
            ],
            followUps: [
                { q: 'Why does `SELECT name, COUNT(*) FROM employees` fail in most databases?', a: 'Without GROUP BY, COUNT(*) collapses everything into one row, but name has a different value on every row, so there is no single name to show. Add GROUP BY name, or drop name. (SQLite and old MySQL allow it and pick an arbitrary name, which is worse.)' },
                { q: 'How do you keep only the top-ranked row per group with ROW_NUMBER?', a: 'Compute ROW_NUMBER() OVER (PARTITION BY group ORDER BY …) in a CTE, then filter WHERE rn = 1 in the outer query, because the window is computed after WHERE in the inner one.' },
            ],
            topicIds: ['sql2-t5', 'sql2-t3', 'sql5-t1'],
        },
        {
            id: 'sql-left-join-lost-rows',
            q: 'Your LEFT JOIN returns fewer rows than the left table has. Why?',
            level: 'intermediate',
            kind: 'scenario',
            testing: 'Whether you understand NULLs from outer joins and the difference between conditions in ON and in WHERE.',
            answer: 'The most common cause is a condition on the right-hand table in the WHERE clause. A LEFT JOIN keeps every left row, filling the right side with NULLs when there is no match. But WHERE runs afterwards, and a condition like WHERE orders.status = \'delivered\' is not true for NULL, so it throws away exactly the unmatched rows the LEFT JOIN kept. The query has quietly become an inner join.\n\nThe fix is to move that condition into the ON clause, so it decides which right rows match, not which final rows survive: LEFT JOIN orders o ON o.customer_id = c.id AND o.status = \'delivered\'. If you really want to filter on the right table, say so explicitly, and allow the NULLs: WHERE o.status = \'delivered\' OR o.id IS NULL.\n\nThe other cause is a later INNER JOIN in the same query that drops rows with no match further down the chain.',
            analogy: 'You list every student and, next to each, their exam score if they sat it (a LEFT JOIN). Then someone says "only show scores above 50". If you apply that to the whole list, the students who never sat the exam disappear too, because "blank" isn\'t above 50. You meant: show every student, and only fill in scores above 50.',
            diagram: {
                code: 'flowchart TD\n  A["customers LEFT JOIN orders<br/>every customer kept,<br/>NULLs where no order"] --> B{"condition on orders<br/>placed where?"}\n  B -->|"in WHERE"| C["NULL rows fail the test:<br/>customers with no orders vanish"]\n  B -->|"in ON"| D["decides which orders match;<br/>every customer still kept"]',
                caption: 'ON decides which right-side rows join; WHERE decides which final rows survive, and NULL never passes an equality test.',
            },
            steps: [
                'Count the left table, then the result: confirm rows really are missing, not duplicated elsewhere.',
                'Look for conditions on the right table in WHERE; move them into ON.',
                'Look for INNER JOINs after the LEFT JOIN, and turn them into LEFT JOINs if the missing rows should stay.',
                'Check with an anti-join which left rows are missing, and confirm they are exactly the ones with no match.',
            ],
            strong: [
                'Names the mechanism: WHERE runs after the join, and NULL comparisons are unknown, not false-but-kept.',
                'Gives both fixes: condition in ON, or an explicit IS NULL.',
                'Mentions later inner joins as a second cause.',
            ],
            traps: [
                'Adding DISTINCT or changing the join type at random.',
                'Saying "LEFT JOIN is broken in this database".',
            ],
            followUps: [
                { q: 'Is a condition on the left table in ON also safe?', a: 'It doesn\'t remove left rows in a LEFT JOIN: every left row is still returned, but rows that fail the condition get NULLs on the right. To filter the left table, put that condition in WHERE.' },
                { q: 'How do you find left rows with no match at all?', a: 'An anti-join: LEFT JOIN and then WHERE right.id IS NULL, or WHERE NOT EXISTS (SELECT 1 FROM right WHERE …).' },
            ],
            topicIds: ['sql3-t2', 'sql3-t7', 'sql3-t3'],
        },
        {
            id: 'sql-double-count',
            q: 'After joining orders to their order items, total revenue came out roughly doubled. What happened, and how do you fix it?',
            level: 'intermediate',
            kind: 'scenario',
            testing: 'Whether you think about the grain of each table (what one row means) before you join and aggregate.',
            answer: 'This is fan-out. An order has several items, so joining orders to order_items repeats each order once per item. If you then sum a column that lives on the order, such as order_total or shipping_fee, each order is counted as many times as it has items. An order with three items is counted three times.\n\nThe fix is to aggregate at the right grain before joining. Either sum the item-level amounts (quantity × price) instead of the order-level total, or first aggregate items per order in a CTE, so there is one row per order, and join that. COUNT(DISTINCT order_id) fixes counts, but not sums.\n\nAnd I\'d check it: the total from the joined query should equal the total from the orders table on its own. When they differ, a join has changed the grain.',
            analogy: 'Counting the money at a party by asking each guest how much the host spent. Ten guests, ten answers of £200: you report £2,000 spent, when it was £200. Each guest row repeated the host\'s total.',
            diagram: {
                code: 'flowchart LR\n  O["orders<br/>1 row per order<br/>total = 30"] --> J["JOIN order_items<br/>3 items → 3 rows"]\n  J --> S["SUM(order.total)<br/>= 90, wrong"]\n  O --> A["aggregate items per order first<br/>1 row per order"] --> R["SUM = 30, right"]',
                caption: 'A one-to-many join multiplies the "one" side. Aggregate to one row per order before joining, or sum item-level amounts.',
            },
            steps: [
                'State the grain of each table: one row per order, one row per order item.',
                'Compare the total after the join with the total from the base table alone.',
                'Sum item-level amounts, or aggregate the child table in a CTE first and join the result.',
                'Add the comparison as a test, so a future join can\'t silently change the grain.',
            ],
            strong: [
                'Uses the word grain, and checks it before writing the query.',
                'Knows COUNT(DISTINCT) fixes counts but not sums.',
                'Verifies with an independent total.',
            ],
            traps: [
                'Slapping DISTINCT on the SUM, which also merges legitimately equal amounts.',
                'Dividing by the number of items as a patch.',
            ],
            followUps: [
                { q: 'You join orders to both items and payments. What happens?', a: 'Two independent one-to-many joins multiply: an order with 3 items and 2 payments becomes 6 rows, so both item and payment sums are inflated. Aggregate each child table to one row per order separately, then join the two results.' },
                { q: 'Why is SUM(DISTINCT amount) dangerous?', a: 'It removes real duplicates too: two different orders that both cost £30 would only be counted once.' },
            ],
            topicIds: ['sql3-t7', 'sql4-t3', 'sql2-t2'],
        },
        {
            id: 'sql-slow-query',
            q: 'A query that used to take 50 milliseconds now takes 30 seconds. How do you investigate?',
            level: 'advanced',
            kind: 'scenario',
            testing: 'A methodical approach with the right tool (the query plan), and knowing the usual causes.',
            answer: 'First, what changed: the data size, the query itself, the parameters, a migration that dropped or changed an index, or the server\'s load. A query that suddenly slows down usually has a plan that changed.\n\nThen I read the plan with EXPLAIN, or EXPLAIN ANALYZE, which actually runs it and shows real row counts and timings. I look for a full table scan where I expected an index lookup, a join method that suits small inputs being used on large ones, and above all estimated rows far from actual rows, which means the statistics are stale and the planner is choosing badly.\n\nCommon fixes: refresh statistics with ANALYZE; add or fix an index, with the right column order for a composite index; and rewrite filters to be sargable, meaning no function on the indexed column, no leading wildcard in LIKE, and no type mismatch that forces a cast. If the plan is fine, I check for locks or contention, and for an application issue such as the same query being run thousands of times.\n\nThen I measure again, and I keep the slow version\'s plan to compare with.',
            analogy: 'A delivery that took 10 minutes now takes an hour. Before buying a faster van, look at the route the driver took: maybe a road closed and the sat-nav, working from an old map, sent them on a detour. EXPLAIN shows you the route; stale statistics are the old map.',
            diagram: {
                code: 'flowchart TD\n  S["Query got slow"] --> C["What changed?<br/>data size, query, params, indexes"]\n  C --> E["EXPLAIN ANALYZE"]\n  E --> Q1{"Scan where an index<br/>was expected?"}\n  Q1 -->|"yes"| I["Missing index, or filter not sargable"]\n  E --> Q2{"Estimated rows ≠<br/>actual rows?"}\n  Q2 -->|"yes"| A["Stale statistics: ANALYZE"]\n  E --> Q3{"Plan looks fine?"}\n  Q3 -->|"yes"| L["Locks, contention,<br/>or called too often"]',
                caption: 'The plan is the evidence. Compare estimates with actuals, and look for scans and join methods that don\'t fit the data size.',
            },
            steps: [
                'Reproduce it and record the exact query, parameters and timing.',
                'Ask what changed: data growth, deploys, migrations, index changes, load.',
                'Run EXPLAIN ANALYZE and compare estimated and actual rows at each step.',
                'Fix the cause: statistics, indexes, sargable filters, join order, or the query shape.',
                'Measure again, and add the query to performance monitoring.',
            ],
            strong: [
                'Starts with "what changed".',
                'Uses estimated versus actual rows, the most telling part of a plan.',
                'Knows sargability and composite index column order.',
                'Considers non-SQL causes: locks, load, application patterns.',
            ],
            traps: [
                'Adding indexes on every column in the query.',
                'Throwing more hardware at it before reading the plan.',
            ],
            followUps: [
                { q: 'Why can `WHERE LOWER(email) = ?` ignore an index on email?', a: 'The index stores email as written, so the database can\'t look up LOWER(email) in it and must compute the function on every row. Store a normalised column, or create an index on the expression LOWER(email).' },
                { q: 'Composite index on (country, city): which queries can use it?', a: 'Queries filtering on country, or on country and city. A filter on city alone usually can\'t use it efficiently, because the index is sorted by country first, like a phone book sorted by surname, then first name.' },
            ],
            topicIds: ['sql7-t2', 'sql7-t3', 'sql7-t1', 'sql7-t4'],
        },
        {
            id: 'sql-index',
            q: 'How does an index make a query faster, and when does it not help?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'A real mental model of a B-tree index, its costs, and its limits.',
            answer: 'An index is a separate, sorted structure, usually a B-tree, that maps column values to the rows that hold them. Instead of reading every row, the database walks down a shallow tree, typically 3 or 4 levels even for millions of rows, to the matching entries, so a lookup costs about log(n) instead of n. Because it is sorted, it also speeds up range filters, ORDER BY, and joins on that column.\n\nIt doesn\'t help, or the planner won\'t use it, when: the filter matches a large share of the table, so a full scan is cheaper than millions of index jumps; the column is wrapped in a function or cast; LIKE starts with a wildcard; the table is tiny; or a composite index is used without its leading column.\n\nAnd it isn\'t free: every insert, update and delete must update every index, and indexes take space. So you index the columns you actually filter, join and sort on, guided by the query plans.',
            analogy: 'The index at the back of a textbook. To find "photosynthesis" you don\'t read every page; you look it up alphabetically and jump to page 212. But if you want every page that mentions "the", the index is useless: you might as well read the book. And every time the book is edited, someone has to update the index too.',
            diagram: {
                code: 'flowchart TD\n  R["root: A–M | N–Z"] --> B1["A–F | G–M"]\n  R --> B2["N–S | T–Z"]\n  B1 --> L1["leaf: Patel → row 7, …"]\n  B1 --> L2["leaf: …"]\n  B2 --> L3["leaf: Shah → row 2, Smith → row 9"]',
                caption: 'A B-tree: a few steps from the root reach the leaf holding the value and a pointer to its row.',
            },
            strong: [
                'Explains the B-tree and log-time lookups.',
                'Names selectivity as the reason a planner sometimes skips the index.',
                'Mentions write and storage costs.',
                'Knows covering indexes and composite column order.',
            ],
            traps: [
                '"Indexes always make queries faster."',
                'Not knowing why a function on a column defeats the index.',
            ],
            followUps: [
                { q: 'What is a covering index?', a: 'One that contains every column a query needs, so the database can answer from the index alone without visiting the table rows.' },
                { q: 'Clustered versus non-clustered?', a: 'A clustered index is the table itself stored in key order, so there is one per table. A non-clustered index is a separate sorted structure pointing to the rows.' },
            ],
            topicIds: ['sql7-t1', 'sql7-t3', 'sql7-t2'],
        },
        {
            id: 'sql-not-in-null',
            q: 'A NOT IN query returns no rows at all, although you know some customers have never ordered. Why?',
            level: 'intermediate',
            kind: 'scenario',
            testing: 'Whether you understand SQL\'s three-valued logic, the most common source of silently wrong results.',
            answer: 'The subquery returns at least one NULL, for example an order whose customer_id is NULL. In SQL, NULL means unknown, so comparisons with it are unknown too, not true or false.\n\nx NOT IN (1, 2, NULL) means x ≠ 1 AND x ≠ 2 AND x ≠ NULL. The last part is unknown for every x, so the whole condition is never true, and every row is filtered out. One NULL in the list makes NOT IN return nothing.\n\nThe fix is NOT EXISTS, which tests "is there a matching row?" and handles NULLs the way you expect: WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.id). Or filter the NULLs out of the subquery. I use NOT EXISTS by default for anti-joins.',
            analogy: 'Checking a guest list for people who weren\'t invited. One name on the invitation list is smudged and unreadable. For every guest you ask "are you definitely not the smudged name?", and the honest answer is always "can\'t tell", so you can\'t declare anyone uninvited.',
            strong: [
                'Explains three-valued logic: TRUE, FALSE and UNKNOWN.',
                'Expands NOT IN into ANDs to show why one NULL ruins it.',
                'Recommends NOT EXISTS as the safe default.',
            ],
            traps: [
                '"NOT IN is just slow; use a join." It is wrong, not just slow.',
                'Not knowing that IN with a NULL still works for the matches it finds.',
            ],
            followUps: [
                { q: 'Does `IN` have the same problem?', a: 'Not in the same way: x IN (1, NULL) is true when x = 1, and unknown otherwise, so matching rows are still found. It is the NOT that turns "unknown" into "drop everything".' },
                { q: 'What does `NULL = NULL` return?', a: 'NULL (unknown), not true. Test for missing values with IS NULL.' },
            ],
            topicIds: ['sql4-t2', 'sql1-t4', 'sql3-t3'],
        },
        {
            id: 'sql-window-vs-groupby',
            q: 'When would you use a window function instead of GROUP BY?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'Whether you understand that window functions keep every row, and can pick the right tool.',
            answer: 'GROUP BY collapses each group into one row: one row per department with its average salary. A window function computes the same kind of value over a group but keeps every row, and adds the result as a new column.\n\nSo I use a window function whenever I need each row next to something about its group or its neighbours: each employee\'s salary next to their department\'s average, a rank within each category, a running total by date, or the change from the previous month with LAG.\n\nFor example: SELECT name, dept, salary, AVG(salary) OVER (PARTITION BY dept) AS dept_avg FROM employees. With GROUP BY you would need a subquery and a join back to get the same thing. And to filter on a window result, such as rank ≤ 3, you wrap it in a CTE, because windows are computed after WHERE.',
            analogy: 'GROUP BY is the class average written on the board: one number per class, and the individual results are gone. A window function is each student\'s report showing their own mark next to the class average and their position in the class: everyone keeps their own line.',
            strong: [
                'Says the key difference: rows are kept.',
                'Gives several uses: comparisons, ranking, running totals, LAG/LEAD.',
                'Knows the filter-in-a-CTE rule.',
            ],
            traps: [
                'Thinking window functions are only for ranking.',
                'Using GROUP BY plus a self-join where one window function would do.',
            ],
            followUps: [
                { q: 'ROW_NUMBER, RANK or DENSE_RANK for "top 3 per category"?', a: 'It depends on ties. ROW_NUMBER gives exactly 3 rows and breaks ties arbitrarily (add a tiebreaker to ORDER BY); RANK and DENSE_RANK keep tied rows, so you may get more than 3. Say which you chose and why.' },
                { q: 'What does the frame clause ROWS BETWEEN 6 PRECEDING AND CURRENT ROW do?', a: 'It limits the window to the current row and the 6 before it, for example for a 7-day moving average.' },
            ],
            topicIds: ['sql5-t1', 'sql5-t2', 'sql5-t4', 'sql2-t2'],
        },
        {
            id: 'sql-acid',
            q: 'Explain transactions and ACID with a bank transfer. What can go wrong without isolation?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'That you understand why transactions exist, not just the acronym, and know the classic concurrency problems.',
            answer: 'Moving £100 from Alice to Bob is two updates: subtract from Alice, add to Bob. A transaction makes them one unit.\n\nAtomicity: both happen or neither does. If the server crashes in between, the first update is rolled back, so money never disappears.\nConsistency: the rules you declared, such as "a balance can\'t be negative", hold before and after.\nIsolation: concurrent transactions don\'t see each other\'s half-finished work.\nDurability: once committed, the change survives a crash, because it is written to the log on disk.\n\nWithout enough isolation, concurrency causes anomalies. A dirty read: seeing another transaction\'s uncommitted change that is later rolled back. A non-repeatable read: reading the same row twice and getting different values. Phantoms: re-running a query and getting new rows. And a lost update: two transfers both read a balance of £500, both subtract £100, and both write £400, so one withdrawal vanishes. Isolation levels, from Read Committed up to Serializable, trade more protection for less concurrency; for a lost update I would use SELECT … FOR UPDATE, an atomic UPDATE balance = balance − 100, or Serializable.',
            analogy: 'Moving furniture between two rooms with the door closed. Either the sofa ends up in the new room or it stays in the old one, never halfway through the door (atomicity). Nobody walks in mid-move and counts a room with no sofa (isolation). Once the door opens, the move is done, even if the lights go out (durability).',
            diagram: {
                code: 'sequenceDiagram\n  participant T1 as Transfer 1\n  participant DB as Balance: £500\n  participant T2 as Transfer 2\n  T1->>DB: read 500\n  T2->>DB: read 500\n  T1->>DB: write 400\n  T2->>DB: write 400\n  Note over DB: one £100 withdrawal is lost',
                caption: 'A lost update: both transactions read the same starting balance, so the second write overwrites the first.',
            },
            strong: [
                'Uses one concrete example for all four letters.',
                'Names the anomalies, and gives a fix for the lost update.',
                'Knows higher isolation costs concurrency and can cause retries.',
            ],
            traps: [
                'Just expanding the acronym.',
                'Assuming the default isolation level protects against everything.',
            ],
            followUps: [
                { q: 'What isolation level do most databases use by default?', a: 'Read Committed in PostgreSQL, Oracle and SQL Server; Repeatable Read in MySQL\'s InnoDB. Neither is fully Serializable.' },
                { q: 'How does `UPDATE accounts SET balance = balance - 100 WHERE id = 1` avoid the lost update?', a: 'The read and the write happen in one statement, which locks the row, so a second transfer waits and then sees the new balance.' },
            ],
            topicIds: ['sql6-t4', 'sql6-t2'],
        },
        {
            id: 'sql-design-shop',
            q: 'How would you design the tables for an online shop? When would you denormalise?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'Data modelling: entities, keys, relationships, normalisation, and judging the trade-offs.',
            answer: 'I start from the entities and how they relate. Customers; products; orders, which belong to one customer; and order_items, one row per product in an order, which resolves the many-to-many between orders and products. Plus payments, and addresses if a customer can have several.\n\nEach table has a primary key, and foreign keys link them: orders.customer_id, order_items.order_id and order_items.product_id. One important detail: order_items stores the price at the time of purchase, not just a link to the product\'s current price, because prices change and an old invoice must not.\n\nThat is normalised, roughly to third normal form: each fact lives in one place, so updates can\'t contradict each other. I would denormalise for read-heavy needs, such as an orders summary table for a dashboard, a cached order total, or a product\'s average rating stored on the product, accepting that the copy must be kept in sync, by a trigger, a job or the application, and could briefly be stale.',
            analogy: 'Normalising is keeping one address book and referring to it, instead of writing a friend\'s address on every letter: when they move, you change it once. Denormalising is writing the address on the envelope anyway, because you post to them every day and don\'t want to look it up each time, knowing you must remember to update the envelopes when they move.',
            diagram: {
                code: 'erDiagram\n  CUSTOMERS ||--o{ ORDERS : places\n  ORDERS ||--|{ ORDER_ITEMS : contains\n  PRODUCTS ||--o{ ORDER_ITEMS : "appears in"\n  ORDERS ||--o{ PAYMENTS : "paid by"\n  ORDER_ITEMS {\n    int order_id\n    int product_id\n    int quantity\n    decimal unit_price "price at purchase"\n  }',
                caption: 'order_items is the junction between orders and products, and keeps the price paid at the time.',
            },
            strong: [
                'Uses a junction table for orders and products.',
                'Stores the price at purchase time.',
                'Explains normalisation by its benefit, then denormalises only with a reason and a sync plan.',
                'Mentions constraints: NOT NULL, UNIQUE, CHECK (quantity > 0).',
            ],
            traps: [
                'A comma-separated list of product ids in the orders table.',
                'Denormalising everything "for speed" with no plan to keep copies in sync.',
            ],
            followUps: [
                { q: 'Why not just store the product\'s current price in order_items via a join?', a: 'Because the product\'s price will change, and every past order would then show a price nobody paid. The order must record the facts as they were.' },
                { q: 'How would you store an order\'s status history?', a: 'A separate order_status_events table (order_id, status, changed_at), keeping the current status on the order if it is read often. That keeps the full history without overwriting it.' },
            ],
            topicIds: ['sql6-t5', 'sql0-t3', 'sql6-t2', 'sql6-t1'],
        },
        {
            id: 'sql-numbers-dont-match',
            q: 'Your dashboard says revenue was £1.20m last month; finance says £1.14m. How do you find out why?',
            level: 'advanced',
            kind: 'scenario',
            testing: 'Analytical rigour: defining metrics, reconciling data, and knowing the usual ways numbers drift apart.',
            answer: 'First I would agree the definition, because most mismatches are about meaning, not bugs: gross or net of refunds, with or without tax and shipping, by order date or by payment date, which currency rate, and whether test or cancelled orders count.\n\nThen I would narrow it down instead of staring at the total: compare day by day to find the days that differ, then pick one day and compare at row level, order by order, against finance\'s source. The first order that differs usually explains the pattern.\n\nThe usual technical causes: time zones and date boundaries (a UTC midnight versus a UK midnight moves orders between days or months); a join that duplicates rows; NULL handling, such as refunds with a NULL amount dropping out of a sum; late-arriving data, such as refunds processed after the dashboard\'s snapshot; and filters that differ, like excluding internal accounts.\n\nI would finish by writing the agreed definition down and adding a reconciliation check that runs every day, so the next difference is caught early.',
            analogy: 'Two people count the money in a till and get different totals. Don\'t argue about the totals: first agree whether the float and the card receipts count, then lay out the notes in the same order and compare them pile by pile until you find the pile that differs.',
            steps: [
                'Agree the exact definition: gross or net, tax, dates, currency, exclusions.',
                'Compare by day to find where the difference appears.',
                'Take one differing day and compare row by row with the other source.',
                'Check the usual causes: time zones, duplicating joins, NULLs, late data, filters.',
                'Document the definition and add a daily reconciliation check.',
            ],
            strong: [
                'Starts with the definition, not the SQL.',
                'Bisects: total, then day, then row.',
                'Names time zones and late-arriving data, the two most common real causes.',
                'Leaves a check behind.',
            ],
            traps: [
                'Assuming finance is wrong.',
                'Hunting for the bug in one big query without narrowing it down.',
            ],
            followUps: [
                { q: 'How do time zones move revenue between months?', a: 'An order placed at 00:30 on 1 March in London is 23:30 on 28 February in some American time zones and 00:30 in UTC (in winter). If one system groups by UTC and the other by local time, orders near midnight land in different days or months.' },
                { q: 'How would you stop this happening again?', a: 'One documented metric definition used by both, ideally computed once in a shared table, and an automated daily comparison with the finance system that alerts when they differ by more than a small tolerance.' },
            ],
            topicIds: ['sql3-t7', 'sql1-t4', 'sql2-t1', 'sql1-t8'],
        },
        {
            id: 'sql-top-n-per-group',
            q: 'How do you get the top 3 products by revenue in each category?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'The most common SQL interview pattern, and whether you think about ties.',
            answer: 'This is "top N per group", and the clean way is a window function in a CTE. First compute revenue per product, then rank within each category, then filter:\n\nWITH revenue AS (SELECT p.category, p.name, SUM(oi.quantity * oi.unit_price) AS revenue FROM order_items oi JOIN products p ON p.id = oi.product_id GROUP BY p.category, p.name), ranked AS (SELECT *, DENSE_RANK() OVER (PARTITION BY category ORDER BY revenue DESC) AS rnk FROM revenue) SELECT * FROM ranked WHERE rnk <= 3;\n\nThe filter has to be outside, because window functions are computed after WHERE. Then I say how I handle ties: DENSE_RANK keeps every product tied for a place, so a category can return more than 3; ROW_NUMBER returns exactly 3 but must break ties with a second ORDER BY column, so the result is deterministic.',
            analogy: 'Picking the top 3 runners in every age group: line each age group up by finishing time, number them 1, 2, 3 within their group, then keep everyone numbered 3 or less. You must decide in advance what happens if two people cross the line together.',
            strong: [
                'Builds it in clear steps with CTEs.',
                'Explains why the filter is in the outer query.',
                'Raises ties unprompted and chooses deliberately.',
            ],
            traps: [
                'ORDER BY revenue LIMIT 3, which gives the top 3 overall, not per category.',
                'ROW_NUMBER with no tiebreaker, giving a different answer on each run.',
            ],
            followUps: [
                { q: 'How would you do it without window functions?', a: 'A correlated subquery: keep a product if fewer than 3 products in the same category have higher revenue. It works, but it is harder to read and usually slower.' },
                { q: 'What if a category has only 2 products?', a: 'The query simply returns 2 for that category. That is usually right, but say it, because the interviewer may be testing whether you noticed.' },
            ],
            topicIds: ['sql5-t2', 'sql4-t3', 'sql8-p5'],
        },
    ],
};
