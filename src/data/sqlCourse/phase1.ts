import type { SqlPhase } from '../sql';
import { code } from './code';
import { cs50Sql, modeTutorial, postgresDocs, selectStarSql, sqlBolt, sqliteDocs, sqlZoo, w3 } from './resources';

export const sqlPhase1: SqlPhase = {
    id: 'reading-data',
    number: 1,
    short: 'Reading data',
    title: 'Reading data: SELECT, WHERE and sorting',
    accent: '#4dd0e1',
    goal: 'Pick the columns you want, keep only the rows you want, sort them, and handle the missing values that trip everyone up.',
    bigPicture: 'Most queries you will ever write are a SELECT with a WHERE and an ORDER BY. Get these, plus NULL, completely solid, and the rest of SQL is built on top of them.',
    topics: [
        {
            id: 'sql1-t1',
            kind: 'lesson',
            name: 'SELECT and FROM: choosing columns',
            priority: 'must',
            definition: 'SELECT lists the columns (or calculations) you want in the result, and FROM names the table they come from.',
            problem: 'A table can have dozens of columns, and you usually need two or three. You also often need values that are not stored at all — a salary after a raise, a name and city joined into one label. SELECT lets you choose and calculate exactly the columns you need.',
            idea: 'After SELECT you write a list, separated by commas. Each item can be a column name (`salary`), a calculation (`salary + 5000`), or a fixed value (`\'hello\'`). AS gives an item a new name in the result, called an alias. `SELECT *` means every column, in table order. The rows come from the table named after FROM, and every row of that table is used, because there is no filter yet.',
            analogy: 'Ordering a set menu but saying "just the starter and the dessert, please". FROM is the menu you are ordering from; SELECT is the courses you want on your plate, in the order you name them.',
            breaks: 'A waiter can only bring what is on the menu. SELECT can also bring things that don\'t exist in the table, because it can calculate new values from the columns on the fly.',
            syntax: code`
                SELECT column, expression AS new_name
                FROM table_name;
            `,
            howItWorks: [
                'The database reads FROM first: it takes every row of employees.',
                'For each row, it works out every item in the SELECT list: name, salary, and salary + 5000.',
                'AS after_raise names the calculated column; without it, the column would be called "salary + 5000".',
                'The result has one row for every row of the table, with just these columns.',
                'Nothing is saved. The calculated column exists only in this result.',
            ],
            diagram: {
                code: 'flowchart LR\n  T["employees<br/>emp_id, name, dept_id,<br/>manager_id, salary, hire_date"] -->|"FROM: every row"| S["SELECT name, salary,<br/>salary + 5000 AS after_raise"]\n  S --> R["result<br/>name, salary, after_raise"]',
                caption: 'FROM supplies all six columns of every row; SELECT keeps two of them and calculates a third. The result has the same number of rows but only the columns you asked for.',
            },
            examples: [
                {
                    title: 'Choose columns and calculate a new one',
                    sql: code`
                        SELECT name, salary, salary + 5000 AS after_raise
                        FROM employees
                        ORDER BY emp_id;
                    `,
                    result: {
                        columns: ['name', 'salary', 'after_raise'],
                        rows: [
                            ['Asha', 95000, 100000],
                            ['Ben', 70000, 75000],
                            ['Chen', 70000, 75000],
                            ['Dara', 60000, 65000],
                            ['Eli', 45000, 50000],
                            ['Fatima', 52000, 57000],
                            ['Gus', 38000, 43000],
                            ['Hana', 80000, 85000],
                        ],
                    },
                    note: 'after_raise is calculated for every row and named with AS. The employees table itself is unchanged.',
                },
                {
                    title: 'Join text together with ||',
                    sql: code`
                        SELECT dept_name || ' in ' || location AS where_it_is
                        FROM departments
                        ORDER BY dept_id;
                    `,
                    result: {
                        columns: ['where_it_is'],
                        rows: [['Engineering in London'], ['Sales in Manchester'], ['Marketing in London'], ['HR in Leeds']],
                    },
                    note: '`||` glues strings together. The text in single quotes, \' in \', is a fixed value added to every row.',
                },
            ],
            keyPoints: [
                'SELECT chooses and calculates columns; FROM says which table the rows come from.',
                'Separate items with commas — and no comma after the last one.',
                'AS gives a column an alias. Use one for every calculated column, so the result has a readable name.',
                '`SELECT *` is fine for looking at a table, but in real queries name the columns you need: it is clearer, and faster on wide tables.',
                'Without a WHERE, every row of the table is in the result.',
            ],
            mistakes: [
                'A trailing comma before FROM: `SELECT name, salary, FROM employees` is a syntax error.',
                'Using double quotes for text. \'London\' is text; "London" means a column called London in PostgreSQL.',
                'Using an alias in WHERE in the same query. WHERE runs before SELECT, so the alias doesn\'t exist yet (Phase 2 explains why).',
            ],
            dialects: [
                'Joining text: PostgreSQL and SQLite use `||`; MySQL uses `CONCAT(a, b)`; SQL Server uses `+` or `CONCAT`. `CONCAT` works almost everywhere.',
                'AS is optional for column aliases in every major database (`salary + 5000 after_raise` works), but writing AS is clearer.',
            ],
            interviewAnswer: 'SELECT defines the columns of the result — stored columns, expressions, or constants — and FROM names the source table. I alias every calculated column with AS so the output is readable, and I avoid SELECT star in production queries: naming columns is clearer, it reads less data, and the query doesn\'t silently change when someone adds a column.',
            followUps: [
                { q: 'Why avoid SELECT * in production code?', a: 'It reads columns you don\'t need, can stop the database using a covering index, and the result changes shape when a column is added — which can break the code that reads it.' },
                { q: 'Can you SELECT without FROM?', a: 'Yes in SQLite, PostgreSQL, MySQL and SQL Server: `SELECT 2 + 3;` returns 5. Oracle needs `FROM dual`.' },
            ],
            practice: {
                explain: 'Explain what SELECT and FROM each do, and what AS is for, using the employees table.',
                write: 'Write a query that returns each product\'s name, its price, and the price of 3 of them, called price_for_three.',
                predict: 'How many rows and columns does `SELECT name, name FROM employees;` return?',
                edge: 'What does `salary + 5000` give for a row where salary is NULL? (No employee here has one — reason it out, then test it with `SELECT NULL + 5000;`.)',
            },
            resources: [
                sqlBolt('Lesson 1: SELECT queries 101'),
                w3('sql_select.asp', 'SQL SELECT Statement'),
                cs50Sql('Lecture 0: Querying'),
            ],
        },
        {
            id: 'sql1-t2',
            kind: 'lesson',
            name: 'WHERE: keeping only the rows you want',
            priority: 'must',
            definition: 'WHERE keeps only the rows for which a condition is true, using comparisons such as =, <>, <, > and the words AND, OR and NOT.',
            problem: 'Tables hold every row ever stored, and you almost always want a slice: one department, orders over £100, everyone hired this year. WHERE is how you say which rows count.',
            idea: 'A condition is a statement about a row that is either true or false, like `salary > 60000`. The database checks it against every row and keeps the rows where it is true. You can combine conditions: AND needs both to be true, OR needs at least one, and NOT flips true and false. Comparisons are `=`, `<>` (not equal; `!=` also works), `<`, `<=`, `>` and `>=`. Text values go in single quotes.',
            analogy: 'A bouncer with a list of rules. Every row walks up to the door; if it passes the rules, it gets in. "Over 18 AND on the guest list" is stricter than "over 18 OR on the guest list".',
            breaks: 'A bouncer answers yes or no. SQL has a third answer, unknown, which comes from NULL — and WHERE treats unknown the same as no. The NULL lesson next in this phase shows why that matters.',
            syntax: code`
                SELECT columns
                FROM table_name
                WHERE condition AND (other OR another);
            `,
            howItWorks: [
                'FROM takes every row of employees.',
                'WHERE checks the condition `dept_id = 1 AND salary < 90000` on each row.',
                'Asha: department 1 is true, but 95000 < 90000 is false. Both must be true for AND, so Asha is dropped.',
                'Ben, Chen and Hana pass both tests, so they are kept. Everyone outside department 1 fails the first test.',
                'SELECT then picks the columns from the rows that are left.',
                'AND is worked out before OR, just as × comes before + in maths. Use brackets whenever you mix them.',
            ],
            diagram: {
                code: 'flowchart LR\n  R["every row of employees"] --> C{"dept_id = 1<br/>AND salary under 90000?"}\n  C -->|"true"| K["kept:<br/>Ben, Chen, Hana"]\n  C -->|"false or unknown"| D["dropped:<br/>Asha and the rest"]',
                caption: 'WHERE is a filter: each row is tested one at a time. Only rows where the condition is true go through. False and unknown are both dropped.',
            },
            examples: [
                {
                    title: 'Two conditions with AND',
                    sql: code`
                        SELECT name, salary
                        FROM employees
                        WHERE dept_id = 1 AND salary < 90000
                        ORDER BY name;
                    `,
                    result: {
                        columns: ['name', 'salary'],
                        rows: [['Ben', 70000], ['Chen', 70000], ['Hana', 80000]],
                    },
                    note: 'Asha is in department 1 but fails the salary test, and AND needs both tests to pass.',
                },
                {
                    title: 'OR inside brackets',
                    sql: code`
                        SELECT name, dept_id, salary
                        FROM employees
                        WHERE (dept_id = 2 OR dept_id = 3) AND salary > 50000
                        ORDER BY name;
                    `,
                    result: {
                        columns: ['name', 'dept_id', 'salary'],
                        rows: [['Dara', 2, 60000], ['Fatima', 3, 52000]],
                    },
                    note: 'Read it as: in department 2 or 3, and also earning over 50000. Eli is in department 2 but earns 45000.',
                },
                {
                    title: 'The same query without brackets — a different answer',
                    sql: code`
                        SELECT name, dept_id, salary
                        FROM employees
                        WHERE dept_id = 2 OR dept_id = 3 AND salary > 50000
                        ORDER BY name;
                    `,
                    result: {
                        columns: ['name', 'dept_id', 'salary'],
                        rows: [['Dara', 2, 60000], ['Eli', 2, 45000], ['Fatima', 3, 52000]],
                    },
                    note: 'AND is worked out first, so this means: department 2 (any salary), or department 3 with a salary over 50000. Eli sneaks in. Brackets remove the doubt.',
                },
            ],
            keyPoints: [
                'WHERE runs on each row, before any grouping, and keeps only rows where the condition is true.',
                'Comparisons: =, <> (or !=), <, <=, >, >=. One = sign, not two.',
                'AND needs both sides true; OR needs at least one; NOT flips the answer.',
                'AND binds tighter than OR. Put brackets around every OR that is mixed with AND.',
                'Text goes in single quotes and must match exactly: \'Sales\' is not \'sales\' in most databases.',
            ],
            mistakes: [
                'Mixing AND and OR without brackets, and getting extra rows.',
                'Writing `==`. SQL uses a single `=` for comparing.',
                'Writing `WHERE dept_id = 2 OR 3`. Each side of OR must be a full condition: `dept_id = 2 OR dept_id = 3`, or better, `dept_id IN (2, 3)`.',
            ],
            dialects: [
                'Text comparison: PostgreSQL is case-sensitive (\'Sales\' ≠ \'sales\'); MySQL and SQL Server usually are not, depending on settings; in SQLite `=` is case-sensitive but LIKE is not.',
            ],
            interviewAnswer: 'WHERE filters rows before any grouping: the database evaluates the condition for each row and keeps only those where it is true — false and unknown are both dropped. I combine conditions with AND, OR and NOT, and because AND has higher precedence than OR, I always bracket OR conditions when mixing them, so the query says exactly what I mean.',
            followUps: [
                { q: 'Which is evaluated first, AND or OR?', a: 'AND. `a OR b AND c` means `a OR (b AND c)`. Brackets make it explicit.' },
                { q: 'Can WHERE use a column alias from SELECT?', a: 'No in standard SQL, because WHERE runs before SELECT. Repeat the expression, or wrap the query in a subquery or CTE. (SQLite and MySQL are lenient about this; don\'t rely on it.)' },
            ],
            practice: {
                explain: 'Explain the difference between AND and OR with an example from the orders table.',
                write: 'Write a query for orders that are delivered and worth at least £75, showing order_id and amount, sorted by order_id.',
                predict: 'Which names does `SELECT name FROM employees WHERE NOT dept_id = 1 ORDER BY name;` return? Is Gus in the list?',
                edge: 'Rewrite `WHERE status = \'shipped\' OR status = \'pending\' AND amount > 40` so it means "shipped or pending, and over £40". What did the original return?',
            },
            resources: [
                sqlBolt('Lesson 2: Queries with constraints (Pt. 1)'),
                w3('sql_where.asp', 'SQL WHERE Clause'),
                modeTutorial('SQL WHERE, SQL Comparison Operators, SQL AND, SQL OR'),
            ],
        },
        {
            id: 'sql1-t3',
            kind: 'lesson',
            name: 'IN, BETWEEN and LIKE: shorter conditions',
            priority: 'must',
            definition: 'IN checks a value against a list, BETWEEN checks a range (both ends included), and LIKE matches text against a pattern with % (any number of characters) and _ (exactly one).',
            problem: '`status = \'shipped\' OR status = \'pending\' OR status = \'cancelled\'` is long and easy to get wrong. Questions like "names starting with P" or "orders in February" come up all the time. These three words make such conditions short and readable.',
            idea: 'IN: `status IN (\'shipped\', \'pending\')` is true when status equals any value in the list. BETWEEN: `amount BETWEEN 50 AND 100` means `amount >= 50 AND amount <= 100`, ends included. LIKE: `product_name LIKE \'P%\'` matches text starting with P; `%` stands for any number of characters (even none) and `_` for exactly one. Put NOT in front of any of them to flip it: NOT IN, NOT BETWEEN, NOT LIKE.',
            analogy: 'IN is a guest list: is your name on it? BETWEEN is a height limit at a fair ride: between 1.2 m and 1.9 m, both ends allowed. LIKE is a crossword clue with blanks: "P _ _" fits Pen.',
            breaks: 'A guest list doesn\'t care about missing names, but SQL does: if the list after NOT IN contains a NULL, nothing matches at all. Phase 4 shows this trap.',
            syntax: code`
                WHERE column IN (value1, value2)
                WHERE column BETWEEN low AND high
                WHERE text_column LIKE 'pattern%'
            `,
            howItWorks: [
                '`status IN (\'shipped\', \'pending\')` is checked against each order: shipped matches, pending matches, delivered doesn\'t.',
                '`order_date BETWEEN \'2024-02-01\' AND \'2024-02-29\'` keeps every date from the 1st to the 29th of February, both days included.',
                '`product_name LIKE \'P%\'` keeps Pen and Phone case: P, then anything.',
                '`LIKE \'%s\'` keeps names ending in s: Headphones.',
                '`LIKE \'_en\'` means exactly one character, then "en": Pen matches, but Phone case doesn\'t.',
            ],
            diagram: {
                code: 'flowchart TD\n  V["a value in a row"] --> I["IN (a, b, c)<br/>equal to any one of them?"]\n  V --> B["BETWEEN low AND high<br/>low or more, and high or less?"]\n  V --> L["LIKE pattern<br/>% any run of characters<br/>_ exactly one character"]',
                caption: 'Three shortcuts for common conditions: IN for a list of values, BETWEEN for a range with both ends included, and LIKE for a text pattern.',
            },
            examples: [
                {
                    title: 'IN: one of a list',
                    sql: code`
                        SELECT order_id, status
                        FROM orders
                        WHERE status IN ('shipped', 'pending')
                        ORDER BY order_id;
                    `,
                    result: {
                        columns: ['order_id', 'status'],
                        rows: [[105, 'shipped'], [110, 'pending']],
                    },
                    note: 'The same as `status = \'shipped\' OR status = \'pending\'`, but shorter and harder to get wrong.',
                },
                {
                    title: 'BETWEEN: a range of dates',
                    sql: code`
                        SELECT order_id, order_date, amount
                        FROM orders
                        WHERE order_date BETWEEN '2024-02-01' AND '2024-02-29'
                        ORDER BY order_date;
                    `,
                    result: {
                        columns: ['order_id', 'order_date', 'amount'],
                        rows: [[105, '2024-02-02', 150], [106, '2024-02-12', null], [107, '2024-02-20', 60]],
                    },
                    note: 'Both ends are included. This works because the dates are YYYY-MM-DD text; with real timestamps, see the mistakes below.',
                },
                {
                    title: 'LIKE: text patterns',
                    sql: code`
                        SELECT product_name
                        FROM products
                        WHERE product_name LIKE 'P%' OR product_name LIKE '%s'
                        ORDER BY product_name;
                    `,
                    result: {
                        columns: ['product_name'],
                        rows: [['Headphones'], ['Pen'], ['Phone case']],
                    },
                    note: '\'P%\' finds names starting with P; \'%s\' finds names ending in s.',
                },
            ],
            keyPoints: [
                '`x IN (a, b)` means `x = a OR x = b`.',
                '`x BETWEEN a AND b` means `x >= a AND x <= b` — both ends included, and a must be the smaller value.',
                'LIKE wildcards: `%` is any number of characters (including none); `_` is exactly one character.',
                'NOT IN, NOT BETWEEN and NOT LIKE flip each test.',
                'A LIKE pattern that starts with % (\'%son\') can\'t use a normal index, so it is slow on big tables.',
            ],
            mistakes: [
                'Using BETWEEN on timestamps: `BETWEEN \'2024-02-01\' AND \'2024-02-29\'` misses everything after midnight on the 29th. Use `>= \'2024-02-01\' AND < \'2024-03-01\'` instead.',
                'Writing BETWEEN with the bigger value first: `BETWEEN 100 AND 50` returns nothing.',
                'Forgetting the % in LIKE: `LIKE \'P\'` only matches the exact text P.',
            ],
            dialects: [
                'Case: LIKE ignores case in SQLite and usually in MySQL and SQL Server, but is case-sensitive in PostgreSQL, which has ILIKE for case-insensitive matching.',
                'SQL Server also allows `[abc]` sets in LIKE patterns; PostgreSQL has full regular expressions with `~`.',
            ],
            interviewAnswer: 'IN tests membership in a list and is shorthand for several ORs; BETWEEN tests an inclusive range; LIKE matches text patterns, where percent is any sequence of characters and underscore is exactly one. Two cautions: for timestamps I use a half-open range — greater-or-equal the start and less-than the next day — rather than BETWEEN, and a leading-wildcard LIKE can\'t use a B-tree index.',
            followUps: [
                { q: 'Is BETWEEN inclusive?', a: 'Yes, at both ends. `BETWEEN 1 AND 5` includes 1 and 5.' },
                { q: 'How would you find names containing an actual % sign?', a: 'Escape it: `LIKE \'%!%%\' ESCAPE \'!\'`. The ESCAPE character says the next % is a real percent sign.' },
                { q: 'Why is `LIKE \'%term%\'` slow?', a: 'An index is sorted from the first character, so a pattern that can start anywhere forces a scan of every row. Full-text search indexes solve that.' },
            ],
            practice: {
                explain: 'Explain what % and _ mean in a LIKE pattern, with one example of each.',
                write: 'Write a query for employees hired in 2020 or 2021, using BETWEEN, showing name and hire_date, sorted by hire_date.',
                predict: 'Which product names match `LIKE \'%o%\'`? List them before you run it.',
                edge: 'Order 106 has a NULL amount. Is it returned by `WHERE amount BETWEEN 0 AND 1000`? By `WHERE amount NOT BETWEEN 0 AND 1000`? Why?',
            },
            resources: [
                sqlBolt('Lesson 3: Queries with constraints (Pt. 2)'),
                w3('sql_like.asp', 'SQL LIKE Operator'),
                w3('sql_between.asp', 'SQL BETWEEN Operator'),
            ],
        },
        {
            id: 'sql1-t4',
            kind: 'lesson',
            name: 'NULL: the missing value',
            priority: 'must',
            definition: 'NULL means "no value" or "unknown"; any comparison with it — even `NULL = NULL` — is unknown rather than true, so you test for it with IS NULL and replace it with COALESCE.',
            problem: 'Real data has gaps: an employee with no manager, an order with no amount. NULL causes more wrong answers than anything else in SQL, because it doesn\'t behave like a normal value. Rows quietly vanish from filters, and sums and averages change, without any error message.',
            idea: 'NULL is not zero and not empty text; it means "we don\'t know". So SQL uses three-valued logic: a condition can be true, false or unknown. `manager_id = NULL` is unknown for every row — even a NULL one, because "is this unknown thing equal to that unknown thing?" is itself unknown. WHERE keeps only true, so the query returns nothing. To test for NULL, use IS NULL or IS NOT NULL. Any arithmetic with NULL gives NULL (`10 + NULL` is NULL). `COALESCE(a, b, …)` returns the first value that isn\'t NULL, which is how you put in a default.',
            analogy: 'A form with a blank box for "age". Is a blank age over 30? You can\'t say yes, and you can\'t say no — you just don\'t know. Are two blank ages equal? You don\'t know that either.',
            breaks: 'A person looking at two blank boxes might say "they\'re both blank, so they match". SQL never does that with `=`. Only IS NULL, IS NOT DISTINCT FROM, and grouping (GROUP BY puts all NULLs together) treat NULLs as alike.',
            syntax: code`
                WHERE column IS NULL
                WHERE column IS NOT NULL
                COALESCE(column, default_value)
            `,
            howItWorks: [
                '`WHERE manager_id = NULL`: for Asha, NULL = NULL is unknown; for everyone else, 1 = NULL is unknown. Nothing is true, so no rows come back.',
                '`WHERE manager_id IS NULL`: true for Asha only. IS NULL is a real test that answers yes or no.',
                '`WHERE dept_id <> 1`: for Gus, NULL <> 1 is unknown, so Gus is dropped — even though he is clearly not in department 1.',
                'To keep him, say so: `WHERE dept_id <> 1 OR dept_id IS NULL`.',
                '`COALESCE(amount, 0)` turns order 106\'s NULL into 0 and leaves the other amounts alone.',
            ],
            diagram: {
                code: 'flowchart LR\n  C["a condition<br/>on one row"] --> T["true"]\n  C --> F["false"]\n  C --> U["unknown<br/>anything compared with NULL"]\n  T -->|"WHERE keeps"| K["kept"]\n  F -->|"WHERE drops"| D["dropped"]\n  U -->|"WHERE drops"| D',
                caption: 'SQL has three answers, not two. Any comparison with NULL is unknown, and WHERE only keeps rows whose answer is true — so rows with NULLs quietly disappear.',
            },
            examples: [
                {
                    title: '= NULL never matches',
                    sql: code`
                        SELECT name
                        FROM employees
                        WHERE manager_id = NULL;
                    `,
                    result: { columns: ['name'], rows: [] },
                    note: 'No error, and no rows — the most dangerous kind of bug. Asha has a NULL manager_id, but NULL = NULL is unknown, not true.',
                },
                {
                    title: 'IS NULL is the right test',
                    sql: code`
                        SELECT name, manager_id
                        FROM employees
                        WHERE manager_id IS NULL;
                    `,
                    result: { columns: ['name', 'manager_id'], rows: [['Asha', null]] },
                },
                {
                    title: 'NULL quietly drops a row from "not equal"',
                    sql: code`
                        SELECT name, dept_id
                        FROM employees
                        WHERE dept_id <> 1
                        ORDER BY name;
                    `,
                    result: {
                        columns: ['name', 'dept_id'],
                        rows: [['Dara', 2], ['Eli', 2], ['Fatima', 3]],
                    },
                    note: 'Gus is missing. His department is unknown, so "not 1" is unknown, and WHERE drops him. Add `OR dept_id IS NULL` to keep him.',
                },
                {
                    title: 'COALESCE puts in a default',
                    sql: code`
                        SELECT order_id, amount, COALESCE(amount, 0) AS amount_or_zero
                        FROM orders
                        WHERE customer_id = 3
                        ORDER BY order_id;
                    `,
                    result: {
                        columns: ['order_id', 'amount', 'amount_or_zero'],
                        rows: [[106, null, 0], [107, 60, 60]],
                    },
                    note: 'COALESCE returns its first argument that isn\'t NULL. Choose the default carefully: 0 is right for "nothing paid", but wrong if it means "we don\'t know".',
                },
            ],
            keyPoints: [
                'NULL means unknown or missing. It is not 0 and not \'\'.',
                'Never write `= NULL` or `<> NULL`. Use IS NULL and IS NOT NULL.',
                'Any comparison with NULL is unknown, and WHERE drops unknown rows — including from `<>` and NOT IN.',
                'Arithmetic with NULL gives NULL: `10 + NULL` is NULL.',
                '`COALESCE(a, b, c)` returns the first non-NULL value. `NULLIF(a, b)` returns NULL when a = b — handy to avoid dividing by zero.',
                'Aggregates (SUM, AVG, COUNT of a column) skip NULLs — Phase 2 covers this.',
            ],
            mistakes: [
                'Writing `WHERE manager_id = NULL` and getting no rows, with no error.',
                'Forgetting that `<>` drops NULL rows: "everyone not in Sales" silently loses people with no department.',
                'Replacing NULL with 0 in an average, which changes the answer. Decide what the gap really means first.',
            ],
            dialects: [
                'NULL-safe equality: PostgreSQL and SQLite have `a IS NOT DISTINCT FROM b` (true when both are NULL); MySQL has `a <=> b`.',
                'COALESCE works everywhere. MySQL also has `IFNULL(a, b)`, SQL Server has `ISNULL(a, b)`, and Oracle has `NVL(a, b)` — all for two arguments.',
                'In Oracle, empty text \'\' is treated as NULL. No other major database does this.',
            ],
            interviewAnswer: 'NULL represents a missing or unknown value, and SQL uses three-valued logic: comparisons with NULL return unknown, and WHERE keeps only rows that are true. So I never compare with equals NULL — I use IS NULL or IS NOT NULL — and I watch for filters like not-equal or NOT IN silently dropping NULL rows. When I need a default I use COALESCE, but only after deciding whether the gap really means zero.',
            followUps: [
                { q: 'What does NULL = NULL return?', a: 'NULL (unknown), not true. Use IS NULL, or IS NOT DISTINCT FROM to compare two values that might both be NULL.' },
                { q: 'Does `COUNT(*)` count NULLs?', a: '`COUNT(*)` counts rows, so yes. `COUNT(column)` counts only the rows where that column is not NULL.' },
                { q: 'How do you avoid dividing by zero?', a: 'Wrap the divisor in NULLIF: `a / NULLIF(b, 0)` returns NULL instead of an error when b is 0.' },
            ],
            practice: {
                explain: 'Explain three-valued logic, and why `WHERE manager_id = NULL` returns no rows.',
                write: 'Write a query for customers with no city on record, showing name and city.',
                predict: 'What do `SELECT NULL = NULL, NULL IS NULL, 5 + NULL, COALESCE(NULL, NULL, 7);` return? Say all four.',
                edge: 'Write "every employee not in department 1", making sure Gus is included.',
            },
            resources: [
                sqlBolt('Lesson 8: A short note on NULLs'),
                w3('sql_null_values.asp', 'SQL NULL Values'),
                selectStarSql,
            ],
        },
        {
            id: 'sql1-t5',
            kind: 'lesson',
            name: 'ORDER BY, LIMIT and OFFSET: sorting and top N',
            priority: 'must',
            definition: 'ORDER BY sorts the result by one or more columns (ASC for smallest first, DESC for largest first), and LIMIT keeps only the first n rows, with OFFSET to skip some first.',
            problem: '"The 3 highest salaries", "the newest orders first", "page 2 of the results" — order matters to people. And without ORDER BY, the database may return rows in any order it likes, which can change from one run to the next.',
            idea: 'ORDER BY salary DESC sorts biggest first. Add more columns to break ties: `ORDER BY salary DESC, name` sorts by salary, and people with the same salary by name. ASC (smallest first) is the default. LIMIT 3 keeps the first 3 rows after sorting. OFFSET 3 skips 3 rows first, which is how page 2 works when there are 3 rows per page. Without an ORDER BY, LIMIT just takes whichever rows come first — an arbitrary choice.',
            analogy: 'A race. ORDER BY lines the runners up by finishing time; LIMIT 3 hands out gold, silver and bronze. OFFSET 3 LIMIT 3 is "who came 4th, 5th and 6th?".',
            breaks: 'In a race, two runners on the same time share a place. LIMIT doesn\'t: it cuts at exactly n rows, so if 3rd and 4th place tie, one of them is dropped without warning. Phase 5 (RANK) handles ties properly.',
            syntax: code`
                SELECT columns
                FROM table_name
                ORDER BY column1 DESC, column2 ASC
                LIMIT n OFFSET skip;
            `,
            howItWorks: [
                'The database finds all the rows first (FROM, then WHERE).',
                'ORDER BY salary DESC puts the highest salary first: Asha 95000, Hana 80000, then Ben and Chen on 70000…',
                'Ben and Chen tie on salary, so the second sort column, name, decides: Ben before Chen.',
                'LIMIT 3 keeps the first three rows: Asha, Hana, Ben. Chen is cut off even though he earns the same as Ben.',
                'OFFSET 3 LIMIT 3 would skip those three and return the next three.',
            ],
            diagram: {
                code: 'flowchart LR\n  A["rows in any order"] -->|"ORDER BY salary DESC, name"| B["1 Asha 95000<br/>2 Hana 80000<br/>3 Ben 70000<br/>4 Chen 70000<br/>5 Dara 60000 …"]\n  B -->|"LIMIT 3"| C["Asha, Hana, Ben"]',
                caption: 'First sort, then cut. Ben and Chen tie on 70000, so the second sort column decides who comes first — and LIMIT 3 silently drops Chen.',
            },
            examples: [
                {
                    title: 'Sort by salary, then by name',
                    sql: code`
                        SELECT name, salary
                        FROM employees
                        ORDER BY salary DESC, name;
                    `,
                    result: {
                        columns: ['name', 'salary'],
                        rows: [
                            ['Asha', 95000], ['Hana', 80000], ['Ben', 70000], ['Chen', 70000],
                            ['Dara', 60000], ['Fatima', 52000], ['Eli', 45000], ['Gus', 38000],
                        ],
                    },
                    note: 'DESC applies only to salary. name has no direction, so it is ASC (A to Z).',
                },
                {
                    title: 'Top 3 with LIMIT — and the tie it hides',
                    sql: code`
                        SELECT name, salary
                        FROM employees
                        ORDER BY salary DESC, name
                        LIMIT 3;
                    `,
                    result: {
                        columns: ['name', 'salary'],
                        rows: [['Asha', 95000], ['Hana', 80000], ['Ben', 70000]],
                    },
                    note: 'Chen earns the same as Ben but is cut off. If the question is "the top 3 salaries", say the tie out loud in an interview.',
                },
                {
                    title: 'Page 2, three rows per page',
                    sql: code`
                        SELECT order_id, order_date
                        FROM orders
                        ORDER BY order_date
                        LIMIT 3 OFFSET 3;
                    `,
                    result: {
                        columns: ['order_id', 'order_date'],
                        rows: [[104, '2024-01-21'], [105, '2024-02-02'], [106, '2024-02-12']],
                    },
                    note: 'OFFSET 3 skips the first page (orders 101–103). For page n, use OFFSET (n − 1) × page size.',
                },
                {
                    title: 'Where do NULLs go?',
                    sql: code`
                        SELECT name, city
                        FROM customers
                        ORDER BY city, name;
                    `,
                    result: {
                        columns: ['name', 'city'],
                        rows: [['Zoe', null], ['Omar', 'Bristol'], ['Tom', 'Leeds'], ['Tom', 'Leeds'], ['Lena', 'London'], ['Priya', 'London']],
                    },
                    note: 'SQLite and MySQL put NULLs first when sorting A to Z; PostgreSQL puts them last. Write NULLS FIRST or NULLS LAST to be sure.',
                },
            ],
            keyPoints: [
                'Without ORDER BY, row order is not guaranteed — even if it looks sorted today.',
                'ASC (default) is smallest first; DESC is largest first. Each column gets its own direction.',
                'Add a second sort column to break ties, so the order is the same every time.',
                'LIMIT cuts after sorting. It ignores ties.',
                'OFFSET skips rows; it is fine for small pages but slow for deep pages, because the skipped rows are still read.',
            ],
            mistakes: [
                'Using LIMIT without ORDER BY and expecting the "top" rows.',
                'Writing `ORDER BY salary, name DESC` and expecting both to be descending. DESC applies only to the column right before it.',
                'Answering "top 3 salaries" with LIMIT 3 when there are ties.',
            ],
            dialects: [
                'SQL Server uses `SELECT TOP 3 …`, or `OFFSET 3 ROWS FETCH NEXT 3 ROWS ONLY`. Oracle and the SQL standard use `FETCH FIRST 3 ROWS ONLY`. PostgreSQL, MySQL and SQLite use LIMIT.',
                'NULL position: PostgreSQL and Oracle put NULLs last for ASC; SQLite, MySQL and SQL Server put them first. PostgreSQL and SQLite accept NULLS FIRST / NULLS LAST.',
            ],
            interviewAnswer: 'ORDER BY sorts the final result, with ASC or DESC per column, and I always add a tiebreaker column so the order is deterministic. LIMIT and OFFSET then cut the sorted result. I point out two caveats: LIMIT ignores ties, so "top 3" may need RANK instead; and large OFFSETs are slow, so for deep pagination I use keyset pagination — WHERE id greater than the last id seen.',
            followUps: [
                { q: 'Is the order of rows guaranteed without ORDER BY?', a: 'No. The database returns rows in whatever order is cheapest, and it can change with indexes, data or version.' },
                { q: 'What is keyset pagination?', a: 'Instead of OFFSET, remember the last value you showed and ask for `WHERE order_id > 106 ORDER BY order_id LIMIT 3`. It uses the index, so page 1000 is as fast as page 1.' },
                { q: 'Can you ORDER BY a column you didn\'t SELECT?', a: 'Yes, in most cases. The exception is with DISTINCT, where you can only sort by selected columns.' },
            ],
            practice: {
                explain: 'Explain why "the 3 highest-paid employees" with LIMIT 3 can be a wrong answer here.',
                write: 'Write a query for the 2 most expensive products, showing product_name and price.',
                predict: 'What does `SELECT name FROM employees ORDER BY hire_date DESC LIMIT 2;` return?',
                edge: 'Write a query that lists customers by city, with the customer who has no city at the end, not the start.',
            },
            resources: [
                sqlBolt('Lesson 4: Filtering and sorting Query results'),
                w3('sql_orderby.asp', 'SQL ORDER BY Keyword'),
                postgresDocs('queries-limit.html', 'LIMIT and OFFSET'),
            ],
        },
        {
            id: 'sql1-t6',
            kind: 'lesson',
            name: 'DISTINCT: removing duplicate rows',
            priority: 'must',
            definition: 'SELECT DISTINCT removes duplicate rows from the result, where two rows are duplicates only if every selected column is the same.',
            problem: '"Which cities do our departments sit in?" lists London twice. "Which customers ordered in January?" lists Priya three times. DISTINCT gives each answer once.',
            idea: 'DISTINCT goes straight after SELECT and applies to the whole row you selected, not to one column. `SELECT DISTINCT location` compares only location, so London appears once. `SELECT DISTINCT name, customer_id` compares both, so two Toms with different ids are both kept. For DISTINCT, NULLs count as equal to each other, so many NULLs become one.',
            analogy: 'Collecting football stickers: when you sort your pile, you keep one of each and put the swaps aside. Two stickers count as the same only if they are completely identical.',
            breaks: 'With stickers you can choose which copy to keep. DISTINCT can\'t: it keeps one row of each and throws the rest away, without remembering how many there were. If you need the count, use GROUP BY.',
            syntax: code`
                SELECT DISTINCT column1, column2
                FROM table_name;
            `,
            howItWorks: [
                'The database builds the rows with just the selected columns.',
                'It compares whole rows: two rows are duplicates only if every selected column matches.',
                'It keeps one copy of each distinct row.',
                'ORDER BY then sorts what is left.',
            ],
            diagram: {
                code: 'flowchart LR\n  A["London<br/>Manchester<br/>London<br/>Leeds"] -->|"DISTINCT"| B["Leeds<br/>London<br/>Manchester"]',
                caption: 'DISTINCT collapses identical rows into one. Here the second London disappears, and ORDER BY sorts what is left.',
            },
            examples: [
                {
                    title: 'One column',
                    sql: code`
                        SELECT DISTINCT location
                        FROM departments
                        ORDER BY location;
                    `,
                    result: { columns: ['location'], rows: [['Leeds'], ['London'], ['Manchester']] },
                    note: 'Engineering and Marketing are both in London, but London appears once.',
                },
                {
                    title: 'Several columns: the whole row must match',
                    sql: code`
                        SELECT DISTINCT name, email
                        FROM customers
                        ORDER BY name;
                    `,
                    result: {
                        columns: ['name', 'email'],
                        rows: [['Lena', 'lena@mail.com'], ['Omar', 'omar@mail.com'], ['Priya', 'priya@mail.com'], ['Tom', 'tom@mail.com'], ['Zoe', 'zoe@mail.com']],
                    },
                    note: 'Tom\'s two sign-ups have the same name and email, so they collapse into one row.',
                },
                {
                    title: 'Add a column that differs, and the duplicates come back',
                    sql: code`
                        SELECT DISTINCT customer_id, name
                        FROM customers
                        ORDER BY customer_id;
                    `,
                    result: {
                        columns: ['customer_id', 'name'],
                        rows: [[1, 'Priya'], [2, 'Tom'], [3, 'Lena'], [4, 'Omar'], [5, 'Zoe'], [6, 'Tom']],
                    },
                    note: 'The ids differ, so both Toms stay. DISTINCT works on the row, not on one column.',
                },
            ],
            keyPoints: [
                'DISTINCT applies to the whole selected row, never to just one column.',
                'Adding a unique column (like an id) to a DISTINCT query makes it do nothing.',
                'NULLs count as equal for DISTINCT: many NULLs become one.',
                '`COUNT(DISTINCT column)` counts the different values — Phase 2.',
                'DISTINCT has to compare every row, which costs time on big results.',
            ],
            mistakes: [
                'Writing `SELECT DISTINCT(name), email` and thinking only name is distinct. The brackets do nothing; the whole row is compared.',
                'Using DISTINCT to hide duplicates caused by a wrong join. Fix the join instead (Phase 3).',
                'Using DISTINCT when you actually need a count per value. That is GROUP BY.',
            ],
            dialects: [
                'PostgreSQL has `DISTINCT ON (column)`, which keeps the first row for each value of that column — handy for "latest order per customer". Elsewhere, use ROW_NUMBER (Phase 5).',
            ],
            interviewAnswer: 'SELECT DISTINCT removes duplicate rows from the result, comparing all the selected columns together, with NULLs treated as equal. I use it for lists of unique values, but if I find myself adding DISTINCT to fix unexpected duplicates, I go back and check the join, because DISTINCT can hide a fan-out that also breaks sums and counts.',
            followUps: [
                { q: 'DISTINCT or GROUP BY?', a: 'For a plain list of unique values they give the same result. Use GROUP BY when you also need aggregates per value, such as counts.' },
                { q: 'Does DISTINCT apply to one column or the whole row?', a: 'The whole row of selected columns, always.' },
            ],
            practice: {
                explain: 'Explain why `SELECT DISTINCT customer_id, name FROM customers` still shows Tom twice.',
                write: 'Write a query for the list of customer ids who have placed at least one order, each id once, sorted.',
                predict: 'How many rows does `SELECT DISTINCT status FROM orders;` return?',
                edge: 'How many rows does `SELECT DISTINCT dept_id FROM employees;` return, and does the NULL count as a row?',
            },
            resources: [
                w3('sql_distinct.asp', 'SQL SELECT DISTINCT'),
                modeTutorial('SQL DISTINCT'),
                sqlBolt('Lesson 4: Filtering and sorting Query results'),
            ],
        },
        {
            id: 'sql1-t7',
            kind: 'lesson',
            name: 'CASE WHEN: if-then logic inside a query',
            priority: 'must',
            definition: 'CASE WHEN condition THEN value … ELSE value END returns a value chosen by the first condition that is true, so a query can label, group or tidy values row by row.',
            problem: 'Data often needs sorting into buckets — salary bands, "open" or "closed" orders, "new" or "returning" customers — and those labels aren\'t stored anywhere. CASE builds them inside the query. It is also the key to counting several things in one pass (Phase 2) and to pivoting.',
            idea: 'CASE is SQL\'s if-else. For each row, it checks the WHEN conditions from top to bottom and returns the THEN value of the first one that is true. If none is true, it returns the ELSE value — or NULL if there is no ELSE. CASE is an expression, so it can go anywhere a value can: in SELECT, WHERE, ORDER BY, GROUP BY, or inside SUM and COUNT. The short form, `CASE status WHEN \'shipped\' THEN …`, compares one column with several values.',
            analogy: 'Sorting post into pigeonholes. You read the address, check the first rule ("London?"), then the next ("Leeds?"), and drop the letter into the first hole that fits. Anything that fits no rule goes into "other" — that is ELSE.',
            breaks: 'A postal worker can put one letter in two holes by mistake. CASE never does: it stops at the first true WHEN, so the order of the WHENs matters. Put the strictest test first.',
            syntax: code`
                CASE
                  WHEN condition1 THEN value1
                  WHEN condition2 THEN value2
                  ELSE other_value
                END AS new_column
            `,
            howItWorks: [
                'For Asha (95000): `salary >= 80000` is true, so the band is \'high\', and CASE stops.',
                'For Ben (70000): the first test is false; `salary >= 50000` is true, so \'medium\'.',
                'For Eli (45000): both tests are false, so ELSE gives \'low\'.',
                'If the tests were in the other order (>= 50000 first), Asha would wrongly get \'medium\'. Order matters.',
                'END closes the CASE, and AS names the new column.',
            ],
            diagram: {
                code: 'flowchart TD\n  R["one row: salary"] --> A{"salary 80000 or more?"}\n  A -->|"yes"| H["high"]\n  A -->|"no"| B{"salary 50000 or more?"}\n  B -->|"yes"| M["medium"]\n  B -->|"no"| L["ELSE: low"]',
                caption: 'CASE checks its WHEN conditions in order and returns the first match. A row that matches nothing gets the ELSE value — or NULL if there is no ELSE.',
            },
            examples: [
                {
                    title: 'Salary bands',
                    sql: code`
                        SELECT name, salary,
                               CASE
                                 WHEN salary >= 80000 THEN 'high'
                                 WHEN salary >= 50000 THEN 'medium'
                                 ELSE 'low'
                               END AS band
                        FROM employees
                        ORDER BY salary DESC, name;
                    `,
                    result: {
                        columns: ['name', 'salary', 'band'],
                        rows: [
                            ['Asha', 95000, 'high'], ['Hana', 80000, 'high'], ['Ben', 70000, 'medium'], ['Chen', 70000, 'medium'],
                            ['Dara', 60000, 'medium'], ['Fatima', 52000, 'medium'], ['Eli', 45000, 'low'], ['Gus', 38000, 'low'],
                        ],
                    },
                },
                {
                    title: 'The short form: compare one column',
                    sql: code`
                        SELECT order_id, status,
                               CASE status
                                 WHEN 'delivered' THEN 'closed'
                                 WHEN 'cancelled' THEN 'closed'
                                 ELSE 'open'
                               END AS state
                        FROM orders
                        WHERE customer_id = 1
                        ORDER BY order_id;
                    `,
                    result: {
                        columns: ['order_id', 'status', 'state'],
                        rows: [[101, 'delivered', 'closed'], [102, 'delivered', 'closed'], [103, 'delivered', 'closed'], [105, 'shipped', 'open'], [109, 'delivered', 'closed']],
                    },
                },
                {
                    title: 'No ELSE means NULL',
                    sql: code`
                        SELECT name, CASE WHEN dept_id = 1 THEN 'engineering' END AS team
                        FROM employees
                        WHERE salary <= 70000
                        ORDER BY name;
                    `,
                    result: {
                        columns: ['name', 'team'],
                        rows: [['Ben', 'engineering'], ['Chen', 'engineering'], ['Dara', null], ['Eli', null], ['Fatima', null], ['Gus', null]],
                    },
                    note: 'Rows that match no WHEN get NULL. Add an ELSE whenever NULL isn\'t what you want.',
                },
            ],
            keyPoints: [
                'CASE returns the THEN value of the first true WHEN, then stops.',
                'No ELSE means NULL for rows that match nothing.',
                'Always finish with END, and name the result with AS.',
                'CASE is an expression: it works in SELECT, WHERE, ORDER BY, GROUP BY and inside aggregates.',
                'Every THEN should return the same type — all text, or all numbers.',
            ],
            mistakes: [
                'Putting the loose condition first (`>= 50000` before `>= 80000`), so the strict one is never reached.',
                'Forgetting END, which gives a syntax error.',
                'Writing `CASE status WHEN NULL THEN …`. The short form uses =, so it never matches NULL. Use `CASE WHEN status IS NULL THEN …`.',
            ],
            dialects: [
                'MySQL and SQLite also have `IF(condition, a, b)` / `IIF(condition, a, b)`, and SQL Server has IIF. CASE works everywhere, so learn CASE.',
            ],
            interviewAnswer: 'CASE is SQL\'s conditional expression: it evaluates WHEN conditions in order and returns the first matching THEN value, or the ELSE value, or NULL if there is no ELSE. Because it is an expression it works anywhere — I use it to bucket values, to sort in a custom order, and most of all inside aggregates, like SUM of CASE WHEN status equals delivered THEN 1, to count several categories in a single pass.',
            followUps: [
                { q: 'What happens when no WHEN matches and there is no ELSE?', a: 'CASE returns NULL.' },
                { q: 'How would you sort orders with pending first, then shipped, then the rest?', a: '`ORDER BY CASE status WHEN \'pending\' THEN 1 WHEN \'shipped\' THEN 2 ELSE 3 END`.' },
            ],
            practice: {
                explain: 'Explain why the order of the WHEN lines matters, using the salary bands.',
                write: 'Write a query that labels each product as \'cheap\' (under £10), \'mid\' (£10 to £29) or \'premium\' (£30 and up), sorted by price.',
                predict: 'What `state` does each of Tom\'s orders get in the short-form example? (Change customer_id to 2 in your head.)',
                edge: 'Order 106 has a NULL amount. Write a CASE that labels orders \'big\' (over £100), \'small\', or \'unknown\' when the amount is missing.',
            },
            resources: [
                w3('sql_case.asp', 'SQL CASE Expression'),
                modeTutorial('SQL CASE'),
                postgresDocs('functions-conditional.html', 'Conditional Expressions'),
            ],
        },
        {
            id: 'sql1-t8',
            kind: 'lesson',
            name: 'Built-in functions for text, numbers and dates',
            priority: 'should',
            definition: 'Functions such as UPPER, LENGTH, SUBSTR, ROUND and the date functions transform a value inside a query — one value in, one value out, for each row.',
            problem: 'Data rarely arrives in the shape you need: names in mixed case, prices that need rounding, dates you want as "2024-03" or as "how many days ago". Functions do these small transformations inside the query.',
            idea: 'A function takes values in brackets and returns one value. Text: UPPER and LOWER change case, LENGTH counts characters, `SUBSTR(text, start, length)` cuts out a piece (counting from 1), TRIM removes spaces at the ends, and REPLACE swaps text. Numbers: `ROUND(x, 2)` rounds to 2 decimal places, ABS removes the minus sign. Dates are where databases differ most: SQLite uses strftime and julianday; PostgreSQL uses DATE_TRUNC, EXTRACT and date subtraction. These run once per row — unlike aggregate functions, which turn many rows into one (Phase 2).',
            analogy: 'Kitchen tools. A peeler (TRIM), a slicer (SUBSTR), a measuring spoon (ROUND). Each one takes one ingredient and gives back a changed version of it.',
            breaks: 'Kitchen tools are the same in every kitchen. Date functions are not the same in every database — so in an interview, say which database you are assuming, and the interviewer will usually accept any reasonable syntax.',
            syntax: code`
                UPPER(text)   LENGTH(text)   SUBSTR(text, start, length)
                ROUND(number, places)
                strftime('%Y-%m', date)   -- SQLite: the year and month
            `,
            howItWorks: [
                '`UPPER(\'Dara\')` is \'DARA\'; `LENGTH(\'Dara\')` is 4; `SUBSTR(\'Dara\', 1, 3)` is \'Dar\' (start at character 1, take 3).',
                'salary / 12.0 gives a long decimal; `ROUND(…, 2)` keeps 2 decimal places.',
                '`strftime(\'%Y-%m\', \'2024-01-21\')` is \'2024-01\': the year and month, ready to group by.',
                'julianday turns a date into a day number, so subtracting two of them gives the days between.',
                'Functions can be nested: `UPPER(SUBSTR(name, 1, 1))` is the first letter in capitals.',
            ],
            diagram: {
                code: 'flowchart LR\n  A["one value per row<br/>Dara · 52000 · 2024-01-21"] --> F["a function<br/>UPPER · ROUND · strftime"] --> B["one new value per row<br/>DARA · 4333.33 · 2024-01"]',
                caption: 'A row function changes each value on its own: one value in, one value out, for every row. Aggregate functions in Phase 2 do the opposite and squash many rows into one.',
            },
            examples: [
                {
                    title: 'Text functions',
                    sql: code`
                        SELECT name, UPPER(name) AS shout, LENGTH(name) AS letters, SUBSTR(name, 1, 3) AS first_three
                        FROM employees
                        WHERE dept_id = 2
                        ORDER BY name;
                    `,
                    result: {
                        columns: ['name', 'shout', 'letters', 'first_three'],
                        rows: [['Dara', 'DARA', 4, 'Dar'], ['Eli', 'ELI', 3, 'Eli']],
                    },
                },
                {
                    title: 'Rounding',
                    sql: code`
                        SELECT name, salary, ROUND(salary / 12.0, 2) AS monthly
                        FROM employees
                        WHERE dept_id = 3 OR dept_id IS NULL
                        ORDER BY name;
                    `,
                    result: {
                        columns: ['name', 'salary', 'monthly'],
                        rows: [['Fatima', 52000, 4333.33], ['Gus', 38000, 3166.67]],
                    },
                    note: 'Dividing by 12.0, not 12, avoids integer division. ROUND then keeps two decimal places.',
                },
                {
                    title: 'Dates: the month, and days between',
                    sql: code`
                        SELECT order_id, order_date,
                               strftime('%Y-%m', order_date) AS month,
                               julianday('2024-03-31') - julianday(order_date) AS days_before_end_of_march
                        FROM orders
                        WHERE customer_id = 2
                        ORDER BY order_id;
                    `,
                    result: {
                        columns: ['order_id', 'order_date', 'month', 'days_before_end_of_march'],
                        rows: [[104, '2024-01-21', '2024-01', 70], [108, '2024-03-01', '2024-03', 30]],
                    },
                    note: 'This is SQLite\'s way. The notes below give the PostgreSQL, MySQL and SQL Server versions.',
                },
            ],
            keyPoints: [
                'A row function runs once per row and returns one value; an aggregate function squashes many rows into one.',
                'Text positions start at 1, not 0: `SUBSTR(\'Dara\', 1, 3)` is \'Dar\'.',
                '`ROUND(x, 2)` for display; divide by a decimal (12.0) to avoid integer division first.',
                'Date functions differ the most between databases. Know your target database\'s month-truncation and date-difference functions.',
                'Wrapping a column in a function inside WHERE (`WHERE UPPER(name) = …`) stops a normal index on that column being used.',
            ],
            mistakes: [
                'Counting text positions from 0, as in Python.',
                'Rounding before summing, which adds up rounding errors. Sum first, round at the end.',
                'Comparing dates stored as \'06/01/2024\' text — they compare as text, not as dates.',
            ],
            dialects: [
                'Month of a date: PostgreSQL `DATE_TRUNC(\'month\', d)` or `TO_CHAR(d, \'YYYY-MM\')`; MySQL `DATE_FORMAT(d, \'%Y-%m\')`; SQL Server `FORMAT(d, \'yyyy-MM\')`; SQLite `strftime(\'%Y-%m\', d)`.',
                'Days between: PostgreSQL `d2 - d1` (dates); MySQL `DATEDIFF(d2, d1)`; SQL Server `DATEDIFF(day, d1, d2)`; SQLite `julianday(d2) - julianday(d1)`.',
                'Year of a date: `EXTRACT(YEAR FROM d)` in PostgreSQL and MySQL; `YEAR(d)` in MySQL and SQL Server; `strftime(\'%Y\', d)` in SQLite.',
                'Text length is `LENGTH` in most databases but `LEN` in SQL Server.',
            ],
            interviewAnswer: 'Scalar functions transform one value per row: string functions like UPPER, SUBSTRING and TRIM, numeric ones like ROUND, and date functions for truncating to a month or finding the days between two dates. Date syntax is the least portable part of SQL, so in an interview I name the dialect I am assuming — usually PostgreSQL, with DATE_TRUNC and date subtraction — and I avoid wrapping indexed columns in functions inside WHERE, because that blocks the index.',
            followUps: [
                { q: 'What is the difference between a scalar function and an aggregate function?', a: 'A scalar function returns one value per row (UPPER, ROUND). An aggregate returns one value per group of rows (SUM, COUNT).' },
                { q: 'How do you group orders by month in PostgreSQL?', a: '`GROUP BY DATE_TRUNC(\'month\', order_date)`, which turns every date into the first day of its month.' },
            ],
            practice: {
                explain: 'Explain the difference between a row function like UPPER and an aggregate like SUM.',
                write: 'Write a query that shows each customer\'s name and the part of their email before the @. (Hint: `INSTR(email, \'@\')` gives the position of the @.)',
                predict: 'What does `SELECT SUBSTR(\'Headphones\', 5, 5), LENGTH(TRIM(\'  Pen  \')), ROUND(2.675, 1);` return?',
                edge: 'How many days passed between each employee\'s hire_date and \'2024-01-01\'? What happens if one of the dates is NULL?',
            },
            resources: [
                sqliteDocs('lang_datefunc.html', 'Date And Time Functions'),
                postgresDocs('functions-datetime.html', 'Date/Time Functions and Operators'),
                sqlZoo('SELECT from WORLD: string functions'),
            ],
        },
    ],
};
