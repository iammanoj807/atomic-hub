import type { SqlPhase } from '../sql';
import { code } from './code';
import { postgresDocs, sqliteDocs, useTheIndexLuke, w3, watch } from './resources';

export const sqlPhase7: SqlPhase = {
    id: 'performance',
    number: 7,
    short: 'Performance',
    title: 'Performance: indexes and query plans',
    accent: '#dce775',
    goal: 'Know why a query is slow, read the plan the database chose, and write queries and indexes that let it find rows without reading the whole table.',
    bigPicture: 'On six small tables everything is instant. On a hundred million rows, the difference between reading every row and jumping straight to the right ones is seconds versus milliseconds. Interviewers for backend and data roles always ask how you would make a slow query fast.',
    topics: [
        {
            id: 'sql7-t1',
            kind: 'lesson',
            name: 'Indexes: how a B-tree makes lookups fast',
            priority: 'must',
            definition: 'An index is a separate, sorted copy of one or more columns — usually a B-tree — with pointers back to the rows, so the database can jump to matching rows instead of scanning the whole table.',
            problem: 'Without an index, `WHERE order_date = \'2024-02-12\'` must read every row and check it: a full table scan. On 100 million rows that is slow, and it gets slower as the table grows. An index turns it into a few quick steps.',
            idea: 'A B-tree index keeps the column\'s values in sorted order, in a shallow tree: a root page points to branch pages, which point to leaf pages holding each value and the row it belongs to. To find a value, the database walks from the root down — about 3 or 4 steps even for millions of rows — instead of reading everything. The primary key is indexed automatically. Indexes speed up WHERE, JOIN … ON, ORDER BY and MIN/MAX on the indexed column. The cost: every INSERT, UPDATE and DELETE must also update every index, and indexes take space.',
            analogy: 'The index at the back of a textbook. To find "photosynthesis" you don\'t read every page; you look it up alphabetically and jump to page 214. A full table scan is reading the book cover to cover.',
            breaks: 'A book index never changes once printed. A database index must be updated on every write — so a table with ten indexes is slow to write to. Index what you search by, not everything.',
            syntax: code`
                CREATE INDEX index_name ON table_name (column);
                CREATE UNIQUE INDEX index_name ON table_name (column);
                DROP INDEX index_name;
            `,
            howItWorks: [
                'Without an index on order_date, the plan says SCAN orders: every row is read.',
                'CREATE INDEX idx_orders_date ON orders(order_date) builds a sorted list of dates, each pointing to its row.',
                'Now the plan says SEARCH orders USING INDEX idx_orders_date (order_date=?): the database jumps to the date.',
                'A lookup by the primary key uses the table\'s own key: SEARCH … USING INTEGER PRIMARY KEY.',
                'For 10 rows the difference is invisible; for 100 million it is the difference between a full read and a handful of page reads.',
            ],
            diagram: {
                code: 'flowchart TD\n  R["root page<br/>dates before 2024-02-01 · from 2024-02-01"] --> B1["branch<br/>Jan dates"]\n  R --> B2["branch<br/>Feb and Mar dates"]\n  B2 --> L1["leaf: 2024-02-02 → order 105"]\n  B2 --> L2["leaf: 2024-02-12 → order 106"]\n  B2 --> L3["leaf: 2024-02-20 → order 107"]',
                caption: 'A B-tree index: sorted values in a shallow tree. Finding 2024-02-12 takes one step per level — root, branch, leaf — then one jump to the row, instead of reading every row.',
            },
            examples: [
                {
                    title: 'No index: the database scans every row',
                    sql: code`
                        EXPLAIN QUERY PLAN
                        SELECT * FROM orders WHERE order_date = '2024-02-12';
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[2, 0, 216, 'SCAN orders']] },
                    note: 'EXPLAIN QUERY PLAN shows the plan instead of running the query. Read the detail column: SCAN means every row.',
                },
                {
                    title: 'With an index: the database searches',
                    sql: code`
                        CREATE INDEX idx_orders_date ON orders(order_date);
                        EXPLAIN QUERY PLAN
                        SELECT * FROM orders WHERE order_date = '2024-02-12';
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[3, 0, 62, 'SEARCH orders USING INDEX idx_orders_date (order_date=?)']] },
                    note: 'SEARCH … USING INDEX means it jumps straight to the matching date.',
                },
                {
                    title: 'The primary key is already indexed',
                    sql: code`
                        EXPLAIN QUERY PLAN
                        SELECT * FROM orders WHERE order_id = 105;
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[2, 0, 33, 'SEARCH orders USING INTEGER PRIMARY KEY (rowid=?)']] },
                },
            ],
            keyPoints: [
                'An index is a sorted structure (usually a B-tree) pointing back to the rows.',
                'It helps WHERE, JOIN … ON, ORDER BY and GROUP BY on the indexed columns.',
                'Primary keys and UNIQUE constraints get an index automatically; foreign keys usually don\'t — index them yourself.',
                'Every index slows down writes and uses space. Index the columns you filter and join on.',
                'An index helps most when it narrows the search to a small share of the rows (high selectivity).',
                'B-trees versus LSM trees, and indexing at scale, are in the System Design tab, Phase 3.',
            ],
            mistakes: [
                'Indexing every column "just in case", which slows every write.',
                'Forgetting to index foreign keys, so joins and deletes on the parent table are slow.',
                'Indexing a column with only a few values (like status) and expecting it to help a query that matches half the table.',
            ],
            dialects: [
                'PostgreSQL also has hash, GIN (for arrays, JSON and full-text) and BRIN (for huge, naturally ordered tables) indexes. MySQL InnoDB stores the table itself in primary-key order (a clustered index).',
            ],
            interviewAnswer: 'An index is a separate sorted structure, typically a B-tree, mapping column values to row locations, so the database can find matching rows in logarithmic time instead of scanning the table. I index columns used in selective WHERE filters, join keys — especially foreign keys — and ORDER BY, and I keep in mind the trade-off: every index adds work to inserts, updates and deletes, and uses storage.',
            followUps: [
                { q: 'What is the difference between a clustered and a non-clustered index?', a: 'A clustered index stores the table\'s rows themselves in index order (one per table, often the primary key, as in SQL Server and MySQL InnoDB). A non-clustered index is a separate structure that points to the rows.' },
                { q: 'Why not index every column?', a: 'Each index must be updated on every write and takes space, and the optimiser can only use a few per query anyway.' },
                { q: 'Why might the database ignore your index?', a: 'If the query matches a large share of the rows, a full scan is cheaper than thousands of index jumps. Or the query wraps the column in a function, so the index can\'t be used.' },
            ],
            practice: {
                explain: 'Explain an index using the textbook analogy, and say what it costs.',
                write: 'Create an index that would help `SELECT * FROM employees WHERE dept_id = 1;`, and check the plan before and after.',
                predict: 'Will `SELECT * FROM customers WHERE customer_id = 3` use an index without you creating one? Why?',
                edge: 'A status column has only four values and 50% of rows are \'delivered\'. Would an index on status help `WHERE status = \'delivered\'`? What about `WHERE status = \'pending\'`?',
            },
            resources: [
                useTheIndexLuke,
                w3('sql_create_index.asp', 'SQL CREATE INDEX'),
                watch('how database indexes work b-tree', 'How database indexes work (video)'),
            ],
        },
        {
            id: 'sql7-t2',
            kind: 'lesson',
            name: 'Reading a query plan with EXPLAIN',
            priority: 'should',
            definition: 'EXPLAIN shows the plan the database chose for a query — which tables it scans, which indexes it searches, how it joins and sorts — without (or, with ANALYZE, while) running it.',
            problem: '"This query is slow — what do you do?" The first answer is always: look at the plan. Guessing wastes time; the plan tells you whether the database is scanning a huge table, missing an index, or sorting millions of rows.',
            idea: 'Put EXPLAIN in front of a query (in SQLite, EXPLAIN QUERY PLAN). Read each line as one step. The words to look for: SCAN (reading a whole table — fine if small, a red flag if big), SEARCH … USING INDEX (jumping to rows — good), and TEMP B-TREE or Sort (building a sort or grouping — costly on big data). For a join, each line is one table, in the order the database reads them: it scans one and searches the other for each row. PostgreSQL\'s EXPLAIN ANALYZE also runs the query and shows real times and row counts — compare estimated rows with actual rows to spot bad estimates.',
            analogy: 'A satnav showing the route before you drive. You can see it plans to go through the city centre (a full scan) instead of the bypass (an index), and fix it before you set off.',
            breaks: 'A satnav\'s route is the same every time. A query plan can change as the data grows or statistics update — a plan that is fine on 10 rows may be terrible on 10 million. Always check plans on realistic data.',
            syntax: code`
                EXPLAIN QUERY PLAN SELECT ...;   -- SQLite
                EXPLAIN SELECT ...;              -- PostgreSQL, MySQL: the plan
                EXPLAIN ANALYZE SELECT ...;      -- PostgreSQL: run it, real timings
            `,
            howItWorks: [
                'Before an index on orders.customer_id: SCAN o (read every order), and for each one SEARCH c by primary key.',
                'Add the index: now the plan is SCAN c (only 6 customers), and SEARCH o USING INDEX for each customer.',
                'The order of the lines is the order the tables are read in: the outer table first.',
                'For GROUP BY without a helpful index, you see USE TEMP B-TREE FOR GROUP BY: a temporary sort.',
                'Fixes usually mean: add or change an index, filter earlier, or rewrite a condition so the index can be used.',
            ],
            diagram: {
                code: 'flowchart LR\n  Q["slow query"] --> E["EXPLAIN it"]\n  E --> S{"SCAN on a big table?"}\n  S -->|"yes"| I["add an index on the<br/>filter or join column"]\n  S -->|"no"| T{"big sort or<br/>TEMP B-TREE?"}\n  T -->|"yes"| O["index the ORDER BY<br/>or GROUP BY columns"]\n  I --> E\n  O --> E',
                caption: 'Tuning is a loop: read the plan, find the expensive step (a big scan or a big sort), change the index or the query, and read the plan again.',
            },
            examples: [
                {
                    title: 'A join plan before indexing the foreign key',
                    sql: code`
                        EXPLAIN QUERY PLAN
                        SELECT c.name, o.amount
                        FROM customers c
                        JOIN orders o ON o.customer_id = c.customer_id
                        WHERE c.city = 'Leeds';
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[3, 0, 216, 'SCAN o'], [5, 0, 45, 'SEARCH c USING INTEGER PRIMARY KEY (rowid=?)']] },
                    note: 'Every order is read, and for each one the customer is looked up by its primary key.',
                },
                {
                    title: 'After indexing orders.customer_id',
                    sql: code`
                        CREATE INDEX idx_orders_customer ON orders(customer_id);
                        EXPLAIN QUERY PLAN
                        SELECT c.name, o.amount
                        FROM customers c
                        JOIN orders o ON o.customer_id = c.customer_id
                        WHERE c.city = 'Leeds';
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[4, 0, 216, 'SCAN c'], [8, 0, 61, 'SEARCH o USING INDEX idx_orders_customer (customer_id=?)']] },
                    note: 'The plan flipped: read the few customers in Leeds, then jump to each one\'s orders through the new index.',
                },
                {
                    title: 'A grouping that needs a temporary sort',
                    sql: code`
                        EXPLAIN QUERY PLAN
                        SELECT customer_id, SUM(amount)
                        FROM orders
                        GROUP BY customer_id
                        ORDER BY customer_id;
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[7, 0, 216, 'SCAN orders'], [9, 0, 0, 'USE TEMP B-TREE FOR GROUP BY']] },
                    note: 'With an index on customer_id the rows would already be in order, and the temporary B-tree would disappear.',
                },
            ],
            keyPoints: [
                'EXPLAIN shows the chosen plan; EXPLAIN ANALYZE (PostgreSQL) runs it and shows real times and rows.',
                'SCAN = read everything; SEARCH / Index Scan = jump via an index.',
                'Sorts and temp B-trees for ORDER BY, GROUP BY or DISTINCT are expensive on big data.',
                'In a join plan, the first table is the outer loop; the inner table should be searched by index.',
                'Big gaps between estimated and actual row counts point to stale statistics (run ANALYZE).',
            ],
            mistakes: [
                'Tuning by guesswork instead of reading the plan.',
                'Judging a plan on a tiny test table — the optimiser may choose differently on real data.',
                'Running EXPLAIN ANALYZE on a DELETE or UPDATE in production. It really runs the statement.',
            ],
            dialects: [
                'PostgreSQL plan words: Seq Scan (full scan), Index Scan, Index Only Scan, Bitmap Heap Scan, Nested Loop, Hash Join, Merge Join, Sort.',
                'MySQL: `EXPLAIN` gives a table with a `type` column — ALL is a full scan, ref/range/const use an index. `EXPLAIN ANALYZE` exists from 8.0.18.',
            ],
            interviewAnswer: 'My first step with a slow query is EXPLAIN, or EXPLAIN ANALYZE in PostgreSQL to see real timings and row counts. I look for sequential scans on large tables, expensive sorts, nested loops over big inputs, and estimates that are far from actual counts. Typical fixes are an index on the filter or join columns, rewriting a non-sargable condition, filtering earlier, or refreshing statistics — then I re-check the plan.',
            followUps: [
                { q: 'What is the difference between EXPLAIN and EXPLAIN ANALYZE?', a: 'EXPLAIN shows the plan and estimated costs without running the query. EXPLAIN ANALYZE runs it and adds the actual time and row counts for each step.' },
                { q: 'What does it mean if estimated rows are 10 but actual rows are 1,000,000?', a: 'The optimiser\'s statistics are wrong or stale, so it may pick a bad plan. Run ANALYZE to refresh them.' },
            ],
            practice: {
                explain: 'Explain what SCAN and SEARCH mean in a plan, and which one you want on a big table.',
                write: 'Write EXPLAIN QUERY PLAN for "employees in department 2", then add an index and show the plan changes.',
                predict: 'What plan do you expect for `SELECT * FROM products WHERE product_id = 3`? Check it.',
                edge: 'Add an index on orders(customer_id) and re-run the GROUP BY plan. Does the temporary B-tree disappear? Why might it still be there?',
            },
            resources: [
                sqliteDocs('eqp.html', 'EXPLAIN QUERY PLAN'),
                postgresDocs('using-explain.html', 'Using EXPLAIN'),
                useTheIndexLuke,
            ],
        },
        {
            id: 'sql7-t3',
            kind: 'lesson',
            name: 'Index-friendly queries: sargable filters and composite indexes',
            priority: 'should',
            definition: 'A filter is sargable when the database can use an index for it — the indexed column stands alone on one side of the comparison — and a composite index on (a, b) helps queries that filter on a, or on a and b, but not on b alone.',
            problem: 'An index can exist and still not be used. `WHERE strftime(\'%Y-%m\', order_date) = \'2024-02\'` reads every row even with an index on order_date. Knowing the rules lets you write the same filter in a way that uses the index.',
            idea: 'The index stores the raw column values in order. If you wrap the column in a function (`UPPER(name)`, `strftime(…)`), do maths on it (`salary + 0 > 60000`), or start a LIKE with % (\'%son\'), the database can\'t search the sorted values, so it scans. Rewrite the condition so the bare column is compared with a value: a date range instead of a function. A composite index on (customer_id, order_date) is sorted by customer, then by date within each customer — like a phone book sorted by surname, then first name. It helps `customer_id = 1`, and `customer_id = 1 AND order_date >= …`, but not `order_date >= …` alone: the leftmost-prefix rule. If the index contains every column the query needs, it is a covering index, and the table itself isn\'t touched.',
            analogy: 'A phone book sorted by surname, then first name. Finding "Smith, John" is quick; finding all the Smiths is quick; finding everyone called John is not — you would have to read the whole book.',
            breaks: 'A person might notice that the Johns are easy to find if there are only five surnames. Some databases can do a "skip scan" too, but don\'t count on it — design the column order for the queries you really run.',
            syntax: code`
                -- not sargable: the column is inside a function
                WHERE strftime('%Y-%m', order_date) = '2024-02'
                -- sargable: the bare column, compared with a range
                WHERE order_date >= '2024-02-01' AND order_date < '2024-03-01'

                CREATE INDEX idx ON orders (customer_id, order_date);
            `,
            howItWorks: [
                'With an index on order_date, `strftime(\'%Y-%m\', order_date) = \'2024-02\'` gives SCAN orders: the index can\'t be used.',
                'The same filter as a range on the bare column gives SEARCH … (order_date>? AND order_date<?).',
                'A composite index (customer_id, order_date) is searched for `customer_id = 1 AND order_date >= …`.',
                'For `order_date >= …` alone, it can\'t be used: the dates are only sorted within each customer.',
                'Selecting only customer_id and order_date lets the index answer on its own: a covering index.',
            ],
            diagram: {
                code: 'flowchart LR\n  I["index on (customer_id, order_date)<br/>1: 01-06, 01-07, 01-08, 02-02, 03-10<br/>2: 01-21, 03-01<br/>3: 02-12, 02-20"] --> A["customer_id = 1<br/>uses it"]\n  I --> B["customer_id = 1 AND date from Feb<br/>uses it"]\n  I --> C["date from Feb only<br/>can\'t use it: scan"]',
                caption: 'A composite index is sorted by its first column, then by the second within each value of the first. It helps when the query fixes the leftmost column(s), not when it skips them.',
            },
            examples: [
                {
                    title: 'A function on the column blocks the index',
                    sql: code`
                        CREATE INDEX idx_orders_date ON orders(order_date);
                        EXPLAIN QUERY PLAN
                        SELECT order_id, amount FROM orders
                        WHERE strftime('%Y-%m', order_date) = '2024-02';
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[2, 0, 216, 'SCAN orders']] },
                },
                {
                    title: 'The same filter as a range uses it',
                    sql: code`
                        CREATE INDEX idx_orders_date ON orders(order_date);
                        EXPLAIN QUERY PLAN
                        SELECT order_id, amount FROM orders
                        WHERE order_date >= '2024-02-01' AND order_date < '2024-03-01';
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[3, 0, 165, 'SEARCH orders USING INDEX idx_orders_date (order_date>? AND order_date<?)']] },
                },
                {
                    title: 'Composite index: leftmost column fixed',
                    sql: code`
                        CREATE INDEX idx_orders_cust_date ON orders(customer_id, order_date);
                        EXPLAIN QUERY PLAN
                        SELECT order_id, amount FROM orders
                        WHERE customer_id = 1 AND order_date >= '2024-02-01';
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[3, 0, 51, 'SEARCH orders USING INDEX idx_orders_cust_date (customer_id=? AND order_date>?)']] },
                },
                {
                    title: 'Composite index: leftmost column skipped',
                    sql: code`
                        CREATE INDEX idx_orders_cust_date ON orders(customer_id, order_date);
                        EXPLAIN QUERY PLAN
                        SELECT order_id, amount FROM orders
                        WHERE order_date >= '2024-02-01';
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[2, 0, 216, 'SCAN orders']] },
                    note: 'Dates are only in order within each customer, so the index can\'t help a date-only filter.',
                },
            ],
            keyPoints: [
                'Keep the indexed column bare: no functions, no maths, no leading % in LIKE.',
                'Rewrite "same month" or "same year" filters as half-open ranges: >= start AND < next start.',
                'A composite index (a, b) serves filters on a, or a and b — not b alone (leftmost prefix).',
                'Put the column you test with = first, and the range column after it.',
                'A covering index holds every column a query needs, so the table isn\'t read at all.',
            ],
            mistakes: [
                '`WHERE YEAR(order_date) = 2024` on an indexed date column.',
                'Creating (order_date, customer_id) when the queries filter by customer first.',
                'Comparing a column with a value of another type (a number column with \'42\'), which can force a conversion on every row.',
            ],
            dialects: [
                'PostgreSQL and Oracle support expression indexes, such as `CREATE INDEX ON customers (LOWER(email))`, which make that exact function sargable. MySQL 8 has functional indexes too.',
                'PostgreSQL and SQL Server let you add extra non-key columns to make an index covering: `INCLUDE (amount)`.',
            ],
            interviewAnswer: 'An index can only be used when the predicate is sargable — the indexed column appears bare, compared with a constant or range — so I avoid functions or arithmetic on indexed columns and rewrite things like `YEAR(date) = 2024` as a date range. For composite indexes the leftmost-prefix rule applies: an index on customer_id then order_date serves filters on customer, or customer and date, but not date alone, so I put equality columns first and range columns last, and make the index covering when a hot query only needs a few columns.',
            followUps: [
                { q: 'What does sargable mean?', a: 'Search-ARGument-ABLE: written so the database can use an index to evaluate it.' },
                { q: 'Index (a, b) or (b, a)?', a: 'Match the queries: the column filtered with = in most queries goes first; a column used for ranges or sorting goes after it.' },
                { q: 'How do you make a case-insensitive email lookup fast?', a: 'Store emails lower-cased and index them, or create an expression index on `LOWER(email)` and query with `LOWER(email)` = \'x\'.' },
            ],
            practice: {
                explain: 'Explain the leftmost-prefix rule with the phone-book analogy.',
                write: 'Rewrite `WHERE strftime(\'%Y\', hire_date) = \'2021\'` so an index on hire_date could be used, and check the plan.',
                predict: 'With an index on employees(salary), is `WHERE salary + 0 > 60000` sargable? What about `WHERE salary > 60000 - 0`?',
                edge: 'Design one index that helps both "orders for customer 1, newest first" and "orders for customer 1 in March".',
            },
            resources: [
                useTheIndexLuke,
                postgresDocs('indexes-multicolumn.html', 'Multicolumn Indexes'),
                sqliteDocs('queryplanner.html', 'Query Planning'),
            ],
        },
        {
            id: 'sql7-t4',
            kind: 'lesson',
            name: 'How a database runs a join: nested loop, hash join, merge join',
            priority: 'bonus',
            definition: 'Databases use three main join methods — a nested loop (for each row of one table, look up matches in the other), a hash join (build a hash table of one side, probe it with the other), and a merge join (walk two sorted inputs together) — and the optimiser picks one per join.',
            problem: 'In senior interviews you may be asked why a join is slow or what a plan line like "Hash Join" means. Knowing the three methods tells you which index or memory setting will help.',
            idea: 'Nested loop: for each row of the outer table, find matching rows in the inner table — fast when the outer side is small and the inner side has an index on the join key (that is what SQLite did in the last lesson). Hash join: read the smaller table into a hash table keyed on the join column, then stream the bigger table past it, checking each row — great for big, unindexed equality joins, but it needs memory. Merge join: if both sides are sorted on the key (by an index, or by sorting first), walk them side by side like zipping a zip — good for big inputs already in order.',
            analogy: 'Matching wedding guests to tables. Nested loop: take each guest and look their name up in the seating plan. Hash join: first make a quick lookup card per surname, then let every guest find their card. Merge join: line up the guests alphabetically and the seating list alphabetically, then walk down both together.',
            breaks: 'At a wedding you would pick the method by eye. A database picks it from estimates of how many rows each side has — wrong estimates are the main reason it picks badly.',
            howItWorks: [
                'Nested loop: outer has N rows, and each inner lookup is an index search, so the cost is about N × log(M). Bad if there is no index on the inner side: N × M.',
                'Hash join: build a hash table on the smaller input (one pass), probe it with the larger (one pass): about N + M, using memory.',
                'Merge join: if both inputs are already sorted, one pass over each: about N + M; otherwise a sort first.',
                'Equality joins can use any method; only nested loops handle conditions like `a.x < b.y`.',
                'You influence the choice through indexes, statistics and (in PostgreSQL) memory settings like work_mem.',
            ],
            diagram: {
                code: 'flowchart TD\n  J["a join"] --> NL["nested loop<br/>small outer side + index on inner"]\n  J --> HJ["hash join<br/>big inputs, equality, no useful index"]\n  J --> MJ["merge join<br/>both inputs already sorted on the key"]',
                caption: 'The optimiser chooses a join method per join, based on how many rows it expects on each side, whether indexes exist, and whether the inputs are already sorted.',
            },
            examples: [
                {
                    title: 'A nested loop: scan one side, search the other by key',
                    sql: code`
                        EXPLAIN QUERY PLAN
                        SELECT p.category, SUM(oi.quantity * p.price)
                        FROM order_items oi
                        JOIN products p ON p.product_id = oi.product_id
                        GROUP BY p.category;
                    `,
                    result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[7, 0, 216, 'SCAN oi'], [9, 0, 45, 'SEARCH p USING INTEGER PRIMARY KEY (rowid=?)'], [12, 0, 0, 'USE TEMP B-TREE FOR GROUP BY']] },
                    note: 'SQLite mostly uses nested loops: for each order item, it looks the product up by its primary key. PostgreSQL would likely show a Hash Join here on bigger tables.',
                },
            ],
            keyPoints: [
                'Nested loop: best for a small outer input with an index on the inner join key.',
                'Hash join: best for large, unsorted equality joins; needs memory for the hash table.',
                'Merge join: best when both inputs are already sorted on the join key.',
                'The optimiser chooses using row-count estimates; stale statistics cause bad choices.',
                'Indexing join keys (especially foreign keys) is the single most useful join optimisation.',
            ],
            mistakes: [
                'Thinking an index always makes a join faster: for a hash join over whole tables it may not be used at all.',
                'Ignoring a nested loop over two large tables without an index — it grows as N × M.',
                'Forcing a join method with hints instead of fixing the statistics or indexes.',
            ],
            dialects: [
                'PostgreSQL, SQL Server and Oracle use all three methods. SQLite uses nested loops (with automatic temporary indexes). MySQL added hash joins in 8.0.18.',
            ],
            interviewAnswer: 'There are three main physical join algorithms. Nested loop iterates the outer input and looks up matches in the inner — ideal when the outer side is small and the inner join key is indexed. Hash join builds an in-memory hash table on the smaller input and probes it with the larger — ideal for big equality joins without useful indexes. Merge join walks two inputs sorted on the key. The optimiser chooses based on estimated cardinalities, so bad statistics are a common cause of a poor join plan.',
            followUps: [
                { q: 'Which join method can handle a non-equality condition like a.start < b.end?', a: 'Only a nested loop. Hash and merge joins need an equality condition.' },
                { q: 'When does a hash join go to disk?', a: 'When the hash table doesn\'t fit in the memory allowed (work_mem in PostgreSQL), it spills to disk in batches and slows down.' },
            ],
            practice: {
                explain: 'Explain the three join methods with the wedding-guest analogy.',
                write: 'Write a query joining orders and customers, run EXPLAIN QUERY PLAN, and name the join method SQLite used.',
                predict: 'Joining a 10-row table to a 10-million-row table with an index on the big table\'s join key — which method would you expect?',
                edge: 'Two 100-million-row tables are joined on a column with no index on either side. Which method should the optimiser pick, and what resource does it need?',
            },
            resources: [
                postgresDocs('planner-optimizer.html', 'Planner/Optimizer (join methods)'),
                useTheIndexLuke,
                watch('nested loop hash join merge join explained', 'Nested loop, hash and merge joins (video)'),
            ],
        },
    ],
};
