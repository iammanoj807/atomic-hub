import type { SqlPhase } from '../sql';
import { code } from './code';
import { cs50Sql, leetCodeSql50, modeTutorial, pgExercises, postgresDocs, sqlBolt, sqlZoo, w3 } from './resources';

export const sqlPhase3: SqlPhase = {
    id: 'joins',
    number: 3,
    short: 'Joins',
    title: 'Joins: combining tables',
    accent: '#81c784',
    goal: 'Put rows from two or more tables side by side, keep or drop the rows that have no match on purpose, and spot the joins that quietly double your totals.',
    bigPicture: 'Data is split across tables so each fact is stored once. Joins put it back together. Nearly every real query and most interview questions use at least one join — and most wrong answers come from choosing the wrong kind.',
    topics: [
        {
            id: 'sql3-t1',
            kind: 'lesson',
            name: 'Joins, and INNER JOIN',
            priority: 'must',
            definition: 'A JOIN combines rows from two tables wherever a condition (usually matching keys) is true, and INNER JOIN keeps only the rows that found a match on both sides.',
            problem: 'The employees table knows Ben is in department 1, but not that department 1 is called Engineering. That lives in departments. To show "Ben — Engineering" you need columns from both tables in one row. That is a join.',
            idea: 'You name two tables and a join condition after ON: `employees e JOIN departments d ON d.dept_id = e.dept_id`. The database pairs every employee with every department whose dept_id matches, and each pair becomes one result row holding the columns of both. INNER JOIN (plain JOIN means the same thing) keeps only pairs that matched. So Gus, whose dept_id is NULL, matches nothing and disappears — and HR, which no employee points to, disappears too. The short names e and d are table aliases; they save typing and say which table each column comes from.',
            analogy: 'Matching odd socks from two baskets by colour. A red sock from basket A is paired with a red sock from basket B. INNER JOIN only keeps the pairs; any sock without a partner stays in its basket.',
            breaks: 'Socks pair one-to-one. Joins don\'t have to: if one department matches four employees, the department\'s row is repeated four times — once per partner. That repetition is normal, but it is also where double-counting comes from (see Join traps).',
            syntax: code`
                SELECT a.column, b.column
                FROM table_a AS a
                INNER JOIN table_b AS b ON b.key = a.key;
            `,
            howItWorks: [
                '`FROM employees AS e`: take every employee and call the table e.',
                '`JOIN departments AS d ON d.dept_id = e.dept_id`: for each employee, find departments with the same dept_id.',
                'Ben (dept_id 1) matches Engineering, so one row: Ben, Engineering.',
                'Gus (dept_id NULL) matches nothing, because NULL never equals anything — so INNER JOIN drops him.',
                'HR (dept_id 4) is never matched by any employee, so it doesn\'t appear either.',
                'SELECT picks e.name and d.dept_name from each matched pair.',
            ],
            diagram: {
                code: 'flowchart LR\n  subgraph E["employees"]\n    Ben["Ben · dept 1"]\n    Dara["Dara · dept 2"]\n    Gus["Gus · dept NULL"]\n  end\n  subgraph D["departments"]\n    D1["1 · Engineering"]\n    D2["2 · Sales"]\n    D4["4 · HR"]\n  end\n  Ben -->|"match"| D1\n  Dara -->|"match"| D2\n  Gus -.->|"no match: dropped"| X["not in result"]\n  D4 -.->|"no match: dropped"| X',
                caption: 'INNER JOIN keeps only pairs that match on the key. Gus (NULL department) and HR (no employees) have no partner, so neither appears in the result.',
            },
            examples: [
                {
                    title: 'Employees with their department name',
                    sql: code`
                        SELECT e.name, d.dept_name
                        FROM employees AS e
                        INNER JOIN departments AS d ON d.dept_id = e.dept_id
                        ORDER BY e.name;
                    `,
                    result: {
                        columns: ['name', 'dept_name'],
                        rows: [['Asha', 'Engineering'], ['Ben', 'Engineering'], ['Chen', 'Engineering'], ['Dara', 'Sales'], ['Eli', 'Sales'], ['Fatima', 'Marketing'], ['Hana', 'Engineering']],
                    },
                    note: '7 rows, not 8: Gus is gone. HR is gone too. INNER JOIN shows only matches.',
                },
                {
                    title: 'Orders with the customer\'s name',
                    sql: code`
                        SELECT o.order_id, c.name, o.amount
                        FROM orders o
                        JOIN customers c ON c.customer_id = o.customer_id
                        WHERE o.order_date < '2024-02-01'
                        ORDER BY o.order_id;
                    `,
                    result: {
                        columns: ['order_id', 'name', 'amount'],
                        rows: [[101, 'Priya', 120], [102, 'Priya', 80], [103, 'Priya', 45], [104, 'Tom', 200]],
                    },
                    note: 'JOIN on its own means INNER JOIN, and AS is optional for table aliases. Priya\'s name repeats once per order — that is one-to-many at work.',
                },
                {
                    title: 'Join, then group: revenue per city',
                    sql: code`
                        SELECT c.city, SUM(o.amount) AS revenue
                        FROM orders o
                        JOIN customers c ON c.customer_id = o.customer_id
                        GROUP BY c.city
                        ORDER BY revenue DESC;
                    `,
                    result: {
                        columns: ['city', 'revenue'],
                        rows: [['London', 485], ['Leeds', 275], [null, 33]],
                    },
                    note: 'The join brings the city onto each order; GROUP BY then adds them up. Zoe\'s order lands in the NULL city group.',
                },
            ],
            keyPoints: [
                'A join pairs rows from two tables where the ON condition is true; each pair is one result row.',
                'INNER JOIN (or just JOIN) keeps only matched rows — unmatched rows on either side vanish.',
                'NULL keys never match, so rows with a NULL key always drop out of an INNER JOIN.',
                'Table aliases (e, d) keep queries short. Always prefix columns with them once there is more than one table.',
                'One-to-many joins repeat the "one" side once per match. That is expected.',
            ],
            mistakes: [
                'Forgetting the ON condition, which pairs every row with every row (a cross join): 8 × 4 = 32 rows.',
                'Leaving out the prefix on a column both tables have (dept_id), which gives an "ambiguous column" error.',
                'Using INNER JOIN when the question says "all customers" or "every department" — the ones with no match disappear.',
            ],
            dialects: [
                'Old-style joins list tables with commas and put the condition in WHERE: `FROM employees e, departments d WHERE d.dept_id = e.dept_id`. It works everywhere, but explicit JOIN … ON is clearer and is what interviewers expect.',
            ],
            interviewAnswer: 'A join combines rows from two tables based on a condition, normally a foreign key matching a primary key. INNER JOIN returns only rows that match on both sides, so rows with no partner — or a NULL key — are excluded. In a one-to-many join the one side repeats for each match, which is correct but means I have to be careful when summing columns from the one side.',
            followUps: [
                { q: 'Is JOIN the same as INNER JOIN?', a: 'Yes. JOIN on its own is an inner join.' },
                { q: 'Does a join need a foreign key to exist?', a: 'No. Any condition works, even `ON a.x > b.y`. Foreign keys just make the matching column reliable.' },
                { q: 'Why did my join return fewer rows than the table has?', a: 'Rows without a match — or with a NULL key — are dropped by an inner join. Use a LEFT JOIN to keep them.' },
            ],
            practice: {
                explain: 'Explain what INNER JOIN does with Gus and with HR, and why.',
                write: 'Write a query listing each order_items row with the product name and the quantity, for order 105.',
                predict: 'How many rows does `SELECT * FROM orders o JOIN customers c ON c.customer_id = o.customer_id;` return?',
                edge: 'Which employees vanish from `SELECT e.name, m.name FROM employees e JOIN employees m ON m.emp_id = e.manager_id;`? Why?',
            },
            resources: [
                sqlBolt('Lesson 6: Multi-table queries with JOINs'),
                w3('sql_join_inner.asp', 'SQL INNER JOIN'),
                cs50Sql('Lecture 1: Relating'),
            ],
        },
        {
            id: 'sql3-t2',
            kind: 'lesson',
            name: 'LEFT JOIN: keep every row from one side',
            priority: 'must',
            definition: 'A LEFT JOIN keeps every row from the left (first) table, joins matching rows from the right table, and fills the right-hand columns with NULL where there is no match.',
            problem: '"Show every department with its headcount" must include HR with 0. "Every customer and what they spent" must include Omar, who spent nothing. An INNER JOIN silently drops them. LEFT JOIN keeps them.',
            idea: 'In `departments d LEFT JOIN employees e`, departments is the left table and every department is kept. Where employees match, you get one row per match, as with INNER JOIN. Where none match — HR — you still get one row, with NULL in every employees column. Count with `COUNT(e.emp_id)`, not `COUNT(*)`, so HR\'s NULL row counts as 0. RIGHT JOIN is the mirror image (keep every row of the right table); people almost always swap the tables and write a LEFT JOIN instead.',
            analogy: 'A class register. Every pupil\'s name is on it (the left table). Next to each name you write the homework they handed in (the right table). A pupil who handed nothing in stays on the register with a blank next to their name.',
            breaks: 'A blank on a register is just empty. In SQL the blank is NULL, and NULL behaves strangely: `COUNT(*)` still counts that row as 1, and a WHERE on a right-hand column can throw the row away again.',
            syntax: code`
                SELECT a.column, b.column
                FROM table_a AS a
                LEFT JOIN table_b AS b ON b.key = a.key;
            `,
            howItWorks: [
                'Start with every row of the left table, departments: Engineering, Sales, Marketing, HR.',
                'For each, find matching employees. Engineering has 4, so it appears 4 times.',
                'HR has no matching employees, so it appears once, with NULL for the employee columns.',
                '`COUNT(e.emp_id)` counts only non-NULL ids: 4, 2, 1 and 0 for HR.',
                '`COUNT(*)` would wrongly give HR 1, because there is one (NULL-filled) row.',
            ],
            diagram: {
                code: 'flowchart LR\n  subgraph L["departments (left): all kept"]\n    D1["Engineering"]\n    D2["Sales"]\n    D4["HR"]\n  end\n  D1 --> R1["Engineering · Asha<br/>Engineering · Ben<br/>…"]\n  D2 --> R2["Sales · Dara<br/>Sales · Eli"]\n  D4 --> R4["HR · NULL<br/>kept, with NULLs"]',
                caption: 'Every row of the left table survives. Matches are filled in as usual; a row with no match (HR) is kept once, with NULL in all the right-hand columns.',
            },
            examples: [
                {
                    title: 'Every department, with its people',
                    sql: code`
                        SELECT d.dept_name, e.name
                        FROM departments d
                        LEFT JOIN employees e ON e.dept_id = d.dept_id
                        ORDER BY d.dept_id, e.name;
                    `,
                    result: {
                        columns: ['dept_name', 'name'],
                        rows: [['Engineering', 'Asha'], ['Engineering', 'Ben'], ['Engineering', 'Chen'], ['Engineering', 'Hana'], ['Sales', 'Dara'], ['Sales', 'Eli'], ['Marketing', 'Fatima'], ['HR', null]],
                    },
                    note: 'HR is kept with a NULL name. Gus still isn\'t here: departments is the side being kept, and he matches no department.',
                },
                {
                    title: 'Headcount, with zeros',
                    sql: code`
                        SELECT d.dept_name, COUNT(e.emp_id) AS headcount
                        FROM departments d
                        LEFT JOIN employees e ON e.dept_id = d.dept_id
                        GROUP BY d.dept_id, d.dept_name
                        ORDER BY d.dept_id;
                    `,
                    result: {
                        columns: ['dept_name', 'headcount'],
                        rows: [['Engineering', 4], ['Sales', 2], ['Marketing', 1], ['HR', 0]],
                    },
                    note: '`COUNT(e.emp_id)` skips the NULL, so HR shows 0. With `COUNT(*)`, HR would show 1.',
                },
                {
                    title: 'Every customer and what they spent',
                    sql: code`
                        SELECT c.customer_id, c.name,
                               COUNT(o.order_id) AS orders,
                               COALESCE(SUM(o.amount), 0) AS total_spent
                        FROM customers c
                        LEFT JOIN orders o ON o.customer_id = c.customer_id
                        GROUP BY c.customer_id, c.name
                        ORDER BY c.customer_id;
                    `,
                    result: {
                        columns: ['customer_id', 'name', 'orders', 'total_spent'],
                        rows: [[1, 'Priya', 5, 425], [2, 'Tom', 2, 275], [3, 'Lena', 2, 60], [4, 'Omar', 0, 0], [5, 'Zoe', 1, 33], [6, 'Tom', 0, 0]],
                    },
                    note: 'Omar and the second Tom are kept with 0 orders. SUM over their NULL row is NULL, so COALESCE turns it into 0.',
                },
            ],
            keyPoints: [
                'LEFT JOIN keeps every row of the left table; unmatched rows get NULLs on the right.',
                'Put the table you want to keep in full first ("every customer" → customers first).',
                'Count the right side with `COUNT(right.column)`, not `COUNT(*)`, to get 0 for no matches.',
                'Wrap sums of the right side in `COALESCE(…, 0)`.',
                'RIGHT JOIN is LEFT JOIN with the tables swapped; prefer LEFT JOIN for readability.',
            ],
            mistakes: [
                'Using `COUNT(*)` after a LEFT JOIN and getting 1 instead of 0 for rows with no match.',
                'Adding `WHERE right_table.column = …`, which throws the NULL rows away and turns the LEFT JOIN back into an INNER JOIN (see Join traps).',
                'Putting the tables the wrong way round, so the side you wanted to keep is on the right.',
            ],
            dialects: [
                'LEFT JOIN and LEFT OUTER JOIN are the same thing everywhere. RIGHT JOIN only arrived in SQLite in version 3.39 (2022); it has always worked in the other databases.',
            ],
            interviewAnswer: 'A LEFT JOIN returns every row from the left table and the matching rows from the right; where there is no match, the right-hand columns are NULL. I use it whenever the question says "all" or "every" — every customer, including those with no orders. After a LEFT JOIN I count a right-hand column rather than COUNT star, so unmatched rows give zero, and I COALESCE sums to zero.',
            followUps: [
                { q: 'LEFT JOIN or INNER JOIN — how do you choose?', a: 'Ask whether rows without a match should appear. "Every customer" means LEFT JOIN; "customers who ordered" means INNER JOIN.' },
                { q: 'Can a LEFT JOIN return more rows than the left table has?', a: 'Yes. A left row that matches three right rows appears three times. It returns at least as many rows as the left table.' },
            ],
            practice: {
                explain: 'Explain why HR appears in a LEFT JOIN from departments but not in an INNER JOIN.',
                write: 'Write a query listing every product with the total quantity sold, showing 0 for products never sold.',
                predict: 'How many rows does `SELECT * FROM customers c LEFT JOIN orders o ON o.customer_id = c.customer_id;` return?',
                edge: 'In the headcount example, change `COUNT(e.emp_id)` to `COUNT(*)`. Which number changes, and why?',
            },
            resources: [
                sqlBolt('Lesson 7: OUTER JOINs'),
                w3('sql_join_left.asp', 'SQL LEFT JOIN'),
                modeTutorial('SQL LEFT JOIN'),
            ],
        },
        {
            id: 'sql3-t3',
            kind: 'lesson',
            name: 'Finding what is missing: anti-joins',
            priority: 'must',
            definition: 'An anti-join returns rows from one table that have no match in another — written as `LEFT JOIN … WHERE right.key IS NULL`, or as `WHERE NOT EXISTS (…)`.',
            problem: '"Customers who never ordered", "products that never sold", "employees with no manager on file" — finding what is absent is one of the most common interview questions and real tasks. You can\'t find it with WHERE alone, because the missing rows aren\'t there to filter.',
            idea: 'Do a LEFT JOIN, so every left row is kept and unmatched ones get NULL on the right. Then keep only the unmatched ones: `WHERE o.order_id IS NULL`. Test a column that can never be NULL in a real match — the right table\'s primary key is perfect. NOT EXISTS says the same thing more directly: "keep the customer if no order exists for them". Its opposite, the semi-join, keeps rows that do have a match, each only once: `WHERE EXISTS (…)` or `WHERE id IN (…)`.',
            analogy: 'Checking a guest list against the sign-in sheet. Hold the list (left table) next to the sheet (right table); the names with an empty space next to them on the sheet are the people who didn\'t come.',
            breaks: 'With a list you just look for blanks. In SQL you must test the right column for the blank: test a column that might legitimately be NULL (like amount) and you will wrongly report customers whose real order just has no amount.',
            syntax: code`
                SELECT a.*
                FROM table_a a
                LEFT JOIN table_b b ON b.key = a.key
                WHERE b.key IS NULL;
            `,
            howItWorks: [
                'customers LEFT JOIN orders keeps all 6 customers; Omar and the second Tom get NULLs for every order column.',
                '`WHERE o.order_id IS NULL` keeps only those NULL rows: the customers with no orders.',
                'order_id is the orders primary key, so it is NULL only when there was no match — never in a real order.',
                'NOT EXISTS version: for each customer, look for any order with their id; keep the customer if there is none.',
                'Avoid NOT IN for this when the inner list can hold a NULL — it returns nothing (Phase 4 shows why).',
            ],
            diagram: {
                code: 'flowchart LR\n  C["all 6 customers"] -->|"LEFT JOIN orders"| J["4 with orders: matched<br/>Omar, Tom 6: NULL orders"]\n  J -->|"WHERE order_id IS NULL"| R["Omar, Tom 6<br/>never ordered"]',
                caption: 'Keep everyone with a LEFT JOIN, then keep only the rows where the join found nothing. What is left is exactly the missing set.',
            },
            examples: [
                {
                    title: 'Customers who never ordered: LEFT JOIN … IS NULL',
                    sql: code`
                        SELECT c.customer_id, c.name
                        FROM customers c
                        LEFT JOIN orders o ON o.customer_id = c.customer_id
                        WHERE o.order_id IS NULL
                        ORDER BY c.customer_id;
                    `,
                    result: { columns: ['customer_id', 'name'], rows: [[4, 'Omar'], [6, 'Tom']] },
                },
                {
                    title: 'Products never sold: NOT EXISTS',
                    sql: code`
                        SELECT p.product_name
                        FROM products p
                        WHERE NOT EXISTS (
                          SELECT 1
                          FROM order_items oi
                          WHERE oi.product_id = p.product_id
                        )
                        ORDER BY p.product_name;
                    `,
                    result: { columns: ['product_name'], rows: [['Phone case']] },
                    note: 'For each product, the inner query looks for any order line with that product. NOT EXISTS keeps the product when it finds none. Phase 4 explains EXISTS fully.',
                },
                {
                    title: 'The opposite, a semi-join: rows that do have a match',
                    sql: code`
                        SELECT dept_name
                        FROM departments
                        WHERE dept_id IN (SELECT dept_id FROM employees)
                        ORDER BY dept_name;
                    `,
                    result: { columns: ['dept_name'], rows: [['Engineering'], ['Marketing'], ['Sales']] },
                    note: 'Each department appears once, however many employees it has. A JOIN would repeat Engineering four times.',
                },
            ],
            keyPoints: [
                'Anti-join = rows with no match: `LEFT JOIN … WHERE right.pk IS NULL`, or `NOT EXISTS`.',
                'Semi-join = rows with at least one match, each once: `EXISTS` or `IN`.',
                'In the IS NULL test, use a column that is never NULL in a real match — the right table\'s primary key or join key.',
                'NOT EXISTS is the safest anti-join: it handles NULLs correctly, and optimisers run it efficiently.',
                'Don\'t use `NOT IN (subquery)` if the subquery can return NULL.',
            ],
            mistakes: [
                'Testing a nullable column (`WHERE o.amount IS NULL`), which also returns Lena because order 106 has no amount.',
                'Using INNER JOIN and wondering why the missing rows never appear.',
                'Using `NOT IN (SELECT dept_id FROM employees)`: Gus\'s NULL dept_id makes it return no rows at all.',
            ],
            dialects: [
                'Every database supports both forms. Some (SQL Server, Oracle) also have EXCEPT / MINUS for "ids in A but not in B".',
            ],
            interviewAnswer: 'To find rows with no match I use an anti-join: either a LEFT JOIN with WHERE the right table\'s key IS NULL, or NOT EXISTS with a correlated subquery. I prefer NOT EXISTS because it states the intent directly and is NULL-safe, and I avoid NOT IN against a subquery, since a single NULL in that list makes the whole condition unknown and returns nothing.',
            followUps: [
                { q: 'Why not use NOT IN to find customers without orders?', a: 'If the subquery returns any NULL, `x NOT IN (…)` is never true, so you get no rows. NOT EXISTS has no such problem.' },
                { q: 'Which column should you test for IS NULL after the LEFT JOIN?', a: 'One that is never NULL in a real matched row — the right table\'s primary key or the join column.' },
            ],
            practice: {
                explain: 'Explain the two ways to write an anti-join and why the IS NULL column choice matters.',
                write: 'Write a query for departments with no employees, using LEFT JOIN … IS NULL.',
                predict: 'What does the first example return if you change `WHERE o.order_id IS NULL` to `WHERE o.amount IS NULL`?',
                edge: 'Run `SELECT dept_name FROM departments WHERE dept_id NOT IN (SELECT dept_id FROM employees);`. Explain the result, then fix it.',
            },
            resources: [
                pgExercises('Joins and Subqueries'),
                leetCodeSql50,
                modeTutorial('SQL Joins with Comparison Operators'),
            ],
        },
        {
            id: 'sql3-t4',
            kind: 'lesson',
            name: 'Self joins: a table joined to itself',
            priority: 'must',
            definition: 'A self join joins a table to itself under two different aliases, so a row can be compared with another row of the same table — such as an employee with their manager.',
            problem: 'manager_id points into the same employees table. To show "Hana reports to Ben", you need Hana\'s row and Ben\'s row side by side. There is only one table, so you use it twice.',
            idea: 'Give the table two aliases and treat them as two copies: e for the employee, m for the manager. Join on `m.emp_id = e.manager_id`, meaning "the manager copy\'s id equals the employee copy\'s manager_id". Now each result row has the employee\'s columns and their manager\'s columns. Use a LEFT JOIN if you want to keep Asha, who has no manager. Self joins also compare rows with each other — pairs in the same department, or rows on consecutive days.',
            analogy: 'Two photocopies of the staff list on your desk. On the left copy you find Hana and read "manager: 2". On the right copy you find person 2 — Ben — and write his name next to hers.',
            breaks: 'The photocopies are real copies. SQL doesn\'t copy anything: the aliases are just two names for the same table, which is why you must prefix every column (e.name, m.name) — otherwise "name" is ambiguous.',
            syntax: code`
                SELECT e.name AS employee, m.name AS manager
                FROM employees e
                LEFT JOIN employees m ON m.emp_id = e.manager_id;
            `,
            howItWorks: [
                'e and m are both the employees table.',
                'For Hana (manager_id 2), find the m row with emp_id 2: Ben.',
                'The result row holds e.name = Hana and m.name = Ben.',
                'Asha\'s manager_id is NULL, so she has no match; LEFT JOIN keeps her with a NULL manager.',
                'To compare rows, add a condition: `a.emp_id < b.emp_id` makes each pair appear once and stops a row pairing with itself.',
            ],
            diagram: {
                code: 'flowchart LR\n  subgraph E["employees as e"]\n    H["Hana · manager_id 2"]\n    B1["Ben · manager_id 1"]\n  end\n  subgraph M["employees as m"]\n    B2["2 · Ben"]\n    A["1 · Asha"]\n  end\n  H -->|"m.emp_id = e.manager_id"| B2\n  B1 --> A',
                caption: 'The same table plays two parts. Each employee row (e) is matched with the row of its manager (m) by comparing m.emp_id with e.manager_id.',
            },
            examples: [
                {
                    title: 'Each employee and their manager',
                    sql: code`
                        SELECT e.name AS employee, m.name AS manager
                        FROM employees e
                        LEFT JOIN employees m ON m.emp_id = e.manager_id
                        ORDER BY e.emp_id;
                    `,
                    result: {
                        columns: ['employee', 'manager'],
                        rows: [['Asha', null], ['Ben', 'Asha'], ['Chen', 'Asha'], ['Dara', 'Asha'], ['Eli', 'Dara'], ['Fatima', 'Asha'], ['Gus', 'Dara'], ['Hana', 'Ben']],
                    },
                },
                {
                    title: 'Pairs of colleagues in the same department',
                    sql: code`
                        SELECT a.name AS first, b.name AS second, a.dept_id
                        FROM employees a
                        JOIN employees b ON b.dept_id = a.dept_id AND a.emp_id < b.emp_id
                        ORDER BY a.dept_id, a.name, b.name;
                    `,
                    result: {
                        columns: ['first', 'second', 'dept_id'],
                        rows: [
                            ['Asha', 'Ben', 1], ['Asha', 'Chen', 1], ['Asha', 'Hana', 1], ['Ben', 'Chen', 1],
                            ['Ben', 'Hana', 1], ['Chen', 'Hana', 1], ['Dara', 'Eli', 2],
                        ],
                    },
                    note: '`a.emp_id < b.emp_id` keeps each pair once (Asha–Ben, never also Ben–Asha) and never pairs someone with themselves.',
                },
                {
                    title: 'How many people report to each manager',
                    sql: code`
                        SELECT m.name AS manager, COUNT(*) AS direct_reports
                        FROM employees e
                        JOIN employees m ON m.emp_id = e.manager_id
                        GROUP BY m.emp_id, m.name
                        ORDER BY direct_reports DESC, manager;
                    `,
                    result: {
                        columns: ['manager', 'direct_reports'],
                        rows: [['Asha', 4], ['Dara', 2], ['Ben', 1]],
                    },
                },
            ],
            keyPoints: [
                'A self join uses the same table twice with two aliases.',
                'Read the ON condition carefully: `m.emp_id = e.manager_id` means "m is e\'s manager".',
                'Use LEFT JOIN to keep rows whose pointer is NULL (the top of the tree).',
                '`a.id < b.id` gives each pair once; `a.id <> b.id` gives each pair twice.',
                'A self join reaches one level. For a whole chain of managers, use a recursive CTE (Phase 4).',
            ],
            mistakes: [
                'Swapping the condition (`e.emp_id = m.manager_id`), which lists each person\'s reports instead of their manager.',
                'Forgetting prefixes, so `name` is ambiguous.',
                'Using INNER JOIN and losing the CEO.',
            ],
            interviewAnswer: 'A self join joins a table to itself with two aliases so I can compare rows within it — the classic case is employees and managers through a self-referencing manager_id. I join the manager alias\'s primary key to the employee alias\'s manager_id, use a LEFT JOIN if the top of the hierarchy must appear, and for pair comparisons I add id less-than id to avoid self-pairs and mirrored duplicates.',
            followUps: [
                { q: 'How would you find employees who earn more than their manager?', a: 'Self join e to m on `m.emp_id = e.manager_id`, then `WHERE e.salary > m.salary`. Here it returns Hana.' },
                { q: 'How do you get the whole chain of managers, not just one level?', a: 'A recursive CTE that starts from the employee and repeatedly joins to the manager until manager_id is NULL.' },
            ],
            practice: {
                explain: 'Explain what `m.emp_id = e.manager_id` means in plain words.',
                write: 'Write a query showing each employee, their manager, and their manager\'s manager (two self joins).',
                predict: 'How many rows does the first example return if LEFT JOIN becomes JOIN? Who is missing?',
                edge: 'Find employees hired before their manager. Who has no manager, and what does your query do with them?',
            },
            resources: [
                w3('sql_join_self.asp', 'SQL Self Join'),
                sqlZoo('Self join'),
                pgExercises('Joins and Subqueries'),
            ],
        },
        {
            id: 'sql3-t5',
            kind: 'lesson',
            name: 'Joining three or more tables',
            priority: 'must',
            definition: 'You join more than two tables by adding one JOIN … ON per table, walking along the keys — orders to customers, orders to order_items, order_items to products — so each row can hold columns from all of them.',
            problem: '"What did each customer buy?" needs the customer\'s name (customers), the order (orders), the line items (order_items) and the product names (products). That is four tables. Many-to-many relationships always need at least three.',
            idea: 'Each JOIN adds one table to the rows you have so far, so a chain of joins follows the arrows in the database diagram. Start from the table whose grain you want in the result — here, one row per item bought, so order_items — or from the table you must keep in full. Each new JOIN needs its own ON condition linking it to a table already in the query. GROUP BY afterwards sums across all of them, for example revenue per category = `SUM(quantity × price)`.',
            analogy: 'Following a paper trail. A receipt line says "product 6, quantity 3, order 101". You look up order 101 to find the customer, then customer 1 to find the name, then product 6 to find "Headphones". Each lookup is one join.',
            breaks: 'On paper you choose which lookups to do. SQL does every join for every row, and an INNER JOIN anywhere in the chain drops rows that fail to match at that step — like order 106, which has no items.',
            syntax: code`
                SELECT ...
                FROM orders o
                JOIN customers c    ON c.customer_id = o.customer_id
                JOIN order_items oi ON oi.order_id   = o.order_id
                JOIN products p     ON p.product_id  = oi.product_id;
            `,
            howItWorks: [
                'FROM orders o: one row per order.',
                'JOIN customers c: each order gains its customer\'s columns. Still one row per order.',
                'JOIN order_items oi: an order with 2 items becomes 2 rows. The grain is now one row per item.',
                'JOIN products p: each item row gains the product name and price.',
                'Order 106 has no items, so the INNER JOIN to order_items drops it. Use LEFT JOINs if it must stay.',
            ],
            diagram: {
                code: 'flowchart LR\n  C["customers"] ---|"customer_id"| O["orders"]\n  O ---|"order_id"| OI["order_items"]\n  OI ---|"product_id"| P["products"]',
                caption: 'Each JOIN walks one step along a key. To get from a customer to a product name you must pass through orders and order_items, the link table.',
            },
            examples: [
                {
                    title: 'What each order contained',
                    sql: code`
                        SELECT o.order_id, c.name AS customer, p.product_name, oi.quantity
                        FROM orders o
                        JOIN customers c    ON c.customer_id = o.customer_id
                        JOIN order_items oi ON oi.order_id = o.order_id
                        JOIN products p     ON p.product_id = oi.product_id
                        WHERE o.order_date < '2024-01-22'
                        ORDER BY o.order_id, p.product_name;
                    `,
                    result: {
                        columns: ['order_id', 'customer', 'product_name', 'quantity'],
                        rows: [[101, 'Priya', 'Headphones', 3], [102, 'Priya', 'Backpack', 1], [102, 'Priya', 'Desk lamp', 2], [103, 'Priya', 'Mug', 5], [103, 'Priya', 'Notebook', 1], [104, 'Tom', 'Headphones', 5]],
                    },
                    note: 'Orders 102 and 103 each appear twice — one row per item. The grain changed when order_items joined in.',
                },
                {
                    title: 'Revenue per category',
                    sql: code`
                        SELECT p.category, SUM(oi.quantity * p.price) AS revenue
                        FROM order_items oi
                        JOIN products p ON p.product_id = oi.product_id
                        GROUP BY p.category
                        ORDER BY revenue DESC;
                    `,
                    result: {
                        columns: ['category', 'revenue'],
                        rows: [['Electronics', 440], ['Home', 150], ['Bags', 120], ['Kitchen', 48], ['Stationery', 35]],
                    },
                    note: 'quantity × price is worked out per item row, then summed per category. The five add up to 793, the same as all order amounts.',
                },
                {
                    title: 'Customers who bought headphones',
                    sql: code`
                        SELECT DISTINCT c.name
                        FROM customers c
                        JOIN orders o       ON o.customer_id = c.customer_id
                        JOIN order_items oi ON oi.order_id = o.order_id
                        JOIN products p     ON p.product_id = oi.product_id
                        WHERE p.product_name = 'Headphones'
                        ORDER BY c.name;
                    `,
                    result: { columns: ['name'], rows: [['Priya'], ['Tom']] },
                    note: 'Priya bought headphones in two orders, so without DISTINCT her name would appear twice.',
                },
            ],
            keyPoints: [
                'One JOIN … ON per extra table; each ON links the new table to one already joined.',
                'Follow the keys in the diagram. Many-to-many goes through the link table.',
                'Know the grain after every join: joining a "many" table multiplies rows.',
                'One INNER JOIN in a chain can drop rows; switch to LEFT JOIN where rows must survive.',
                'Use clear aliases (c, o, oi, p) and line the ON conditions up so the chain is easy to read.',
            ],
            mistakes: [
                'Joining two tables on the wrong pair of columns (`oi.product_id = o.order_id`) — it runs but returns nonsense.',
                'Mixing LEFT and INNER joins so that a later INNER JOIN removes the rows the LEFT JOIN kept.',
                'Summing an order-level column (o.amount) after joining item rows, which counts it once per item (see Join traps).',
            ],
            interviewAnswer: 'For multi-table queries I follow the foreign keys one hop at a time, adding a JOIN with its own ON condition per table, and I keep track of the grain after each join — joining a child table like order_items turns one row per order into one row per item. For many-to-many I go through the junction table, and I use LEFT JOINs wherever rows without a match must survive.',
            followUps: [
                { q: 'Does the order of INNER JOINs matter?', a: 'Not for the result — inner joins can be reordered freely, and the optimiser picks its own order. With LEFT JOINs, order does matter.' },
                { q: 'How do you get from customers to products?', a: 'customers → orders (customer_id) → order_items (order_id) → products (product_id).' },
            ],
            practice: {
                explain: 'Explain what happens to the number of rows after each join in the first example.',
                write: 'Write a query for the total quantity of each product bought by Priya, with product names, sorted by quantity.',
                predict: 'How many rows do you get from joining orders to order_items (all orders, INNER JOIN)? Which order is missing?',
                edge: 'Rewrite the first example (without the date filter) so order 106, which has no items, still appears.',
            },
            resources: [
                sqlZoo('More JOIN operations'),
                cs50Sql('Lecture 1: Relating'),
                postgresDocs('tutorial-join.html', 'Joins Between Tables'),
            ],
        },
        {
            id: 'sql3-t6',
            kind: 'lesson',
            name: 'FULL OUTER JOIN and CROSS JOIN',
            priority: 'should',
            definition: 'A FULL OUTER JOIN keeps every row from both tables, with NULLs wherever either side has no match; a CROSS JOIN pairs every row of one table with every row of the other.',
            problem: 'Comparing two lists — "which employees have no department, and which departments have no employees?" — needs the unmatched rows from both sides at once. Building a report grid — every customer × every month, zeros included — needs every combination. These two joins do those jobs.',
            idea: 'FULL OUTER JOIN = a LEFT JOIN and a RIGHT JOIN together: matches as usual, plus the unmatched left rows (right columns NULL) and the unmatched right rows (left columns NULL). It is mainly for reconciling two sources. CROSS JOIN has no ON at all: 6 customers × 3 months = 18 rows. On its own that is rarely what you want, but it is the standard way to build a complete grid, which you then LEFT JOIN the real data onto so gaps show as zero.',
            analogy: 'FULL OUTER JOIN is comparing two class registers after a merger: you list everyone who is on both, plus the names that are only on one register. CROSS JOIN is a timetable grid: every class against every period, whether or not anything is scheduled there.',
            breaks: 'A timetable grid is small. A cross join of two big tables is enormous — a million rows × a million rows is a trillion — so it is only safe when at least one side is tiny.',
            syntax: code`
                SELECT ...
                FROM a FULL OUTER JOIN b ON b.key = a.key;

                SELECT ...
                FROM a CROSS JOIN b;
            `,
            howItWorks: [
                'FULL OUTER JOIN employees and departments: the 7 matched pairs, plus Gus (no department), plus HR (no employees).',
                'Gus\'s row has NULL department columns; HR\'s row has NULL employee columns.',
                'CROSS JOIN customers and months: each customer row is paired with each month row, with no condition.',
                'LEFT JOIN the orders onto that grid on customer and month: cells with no orders get NULL.',
                '`COALESCE(SUM(amount), 0)` turns those NULLs into zeros, so the report has no gaps.',
            ],
            diagram: {
                code: 'flowchart TD\n  subgraph F["FULL OUTER JOIN"]\n    F1["matched pairs"]\n    F2["left rows with no match"]\n    F3["right rows with no match"]\n  end\n  subgraph X["CROSS JOIN: 2 customers × 3 months"]\n    X1["Tom · Jan"] --- X2["Tom · Feb"] --- X3["Tom · Mar"]\n    X4["Lena · Jan"] --- X5["Lena · Feb"] --- X6["Lena · Mar"]\n  end',
                caption: 'FULL OUTER JOIN keeps matches plus the leftovers from both sides. CROSS JOIN makes every combination — 2 customers × 3 months is 6 rows — ready to have real data joined onto it.',
            },
            examples: [
                {
                    title: 'FULL OUTER JOIN: the unmatched from both sides',
                    sql: code`
                        SELECT e.name, d.dept_name
                        FROM employees e
                        FULL OUTER JOIN departments d ON d.dept_id = e.dept_id
                        ORDER BY d.dept_id, e.name;
                    `,
                    result: {
                        columns: ['name', 'dept_name'],
                        rows: [['Gus', null], ['Asha', 'Engineering'], ['Ben', 'Engineering'], ['Chen', 'Engineering'], ['Hana', 'Engineering'], ['Dara', 'Sales'], ['Eli', 'Sales'], ['Fatima', 'Marketing'], [null, 'HR']],
                    },
                    note: 'Gus (no department) and HR (no employees) both appear. Neither an INNER nor a LEFT JOIN shows both.',
                },
                {
                    title: 'CROSS JOIN: every combination',
                    sql: code`
                        SELECT p.product_name, d.dept_name
                        FROM products p
                        CROSS JOIN departments d
                        WHERE p.category = 'Stationery'
                        ORDER BY p.product_name, d.dept_id;
                    `,
                    result: {
                        columns: ['product_name', 'dept_name'],
                        rows: [['Notebook', 'Engineering'], ['Notebook', 'Sales'], ['Notebook', 'Marketing'], ['Notebook', 'HR'], ['Pen', 'Engineering'], ['Pen', 'Sales'], ['Pen', 'Marketing'], ['Pen', 'HR']],
                    },
                    note: 'A supply sheet: every stationery item for every department. 2 products × 4 departments = 8 rows.',
                },
                {
                    title: 'A complete grid with zeros: CROSS JOIN, then LEFT JOIN',
                    sql: code`
                        SELECT c.name, m.month, COALESCE(SUM(o.amount), 0) AS spent
                        FROM customers c
                        CROSS JOIN (SELECT DISTINCT strftime('%Y-%m', order_date) AS month FROM orders) AS m
                        LEFT JOIN orders o
                          ON o.customer_id = c.customer_id
                         AND strftime('%Y-%m', o.order_date) = m.month
                        WHERE c.customer_id IN (2, 3)
                        GROUP BY c.customer_id, c.name, m.month
                        ORDER BY c.customer_id, m.month;
                    `,
                    result: {
                        columns: ['name', 'month', 'spent'],
                        rows: [['Tom', '2024-01', 200], ['Tom', '2024-02', 0], ['Tom', '2024-03', 75], ['Lena', '2024-01', 0], ['Lena', '2024-02', 60], ['Lena', '2024-03', 0]],
                    },
                    note: 'Without the grid, Tom\'s February and Lena\'s January would be missing rows instead of zeros — which breaks charts and month-on-month maths.',
                },
            ],
            keyPoints: [
                'FULL OUTER JOIN = matches + unmatched left rows + unmatched right rows.',
                'CROSS JOIN has no ON and returns rows(a) × rows(b).',
                'Grid pattern: CROSS JOIN the dimensions, LEFT JOIN the facts, COALESCE to 0.',
                'A join with a missing or always-true ON condition is an accidental cross join.',
            ],
            mistakes: [
                'Running a CROSS JOIN between two large tables.',
                'Forgetting an ON condition and getting a cross join by accident — the row count explodes.',
                'Using WHERE on one side after a FULL OUTER JOIN, which removes the other side\'s unmatched rows.',
            ],
            dialects: [
                'MySQL has no FULL OUTER JOIN: write a LEFT JOIN, then UNION it with the unmatched rows of a RIGHT JOIN. SQLite added FULL OUTER JOIN in 3.39.',
                'PostgreSQL can build date grids directly with `generate_series(\'2024-01-01\', \'2024-03-01\', interval \'1 month\')`.',
            ],
            interviewAnswer: 'A FULL OUTER JOIN returns matched rows plus the unmatched rows from both sides, with NULLs filling the gaps — useful for reconciling two sources. A CROSS JOIN is the Cartesian product, every row paired with every row; I mostly use it to build a complete grid such as every customer by every month, then LEFT JOIN the facts onto it so missing combinations show as zero instead of disappearing.',
            followUps: [
                { q: 'How many rows does a CROSS JOIN of 6 and 4 rows return?', a: '24 — every row of one with every row of the other.' },
                { q: 'How do you do a FULL OUTER JOIN in MySQL?', a: 'LEFT JOIN UNION the RIGHT JOIN rows where the left side is NULL (UNION ALL with that filter avoids duplicates).' },
            ],
            practice: {
                explain: 'Explain when you would use FULL OUTER JOIN instead of LEFT JOIN.',
                write: 'Build a grid of every product category × every order status, with the number of items sold in each cell (0 where none).',
                predict: 'How many rows does `SELECT * FROM customers CROSS JOIN departments;` return?',
                edge: 'In the FULL OUTER JOIN example, add `WHERE e.salary > 40000`. Which rows disappear, and why does HR go too?',
            },
            resources: [
                w3('sql_join_full.asp', 'SQL FULL OUTER JOIN'),
                modeTutorial('SQL FULL OUTER JOIN'),
                sqlBolt('Lesson 7: OUTER JOINs'),
            ],
        },
        {
            id: 'sql3-t7',
            kind: 'lesson',
            name: 'Join traps: double counting, and ON versus WHERE',
            priority: 'must',
            definition: 'The two classic join bugs are fan-out — joining a "many" table repeats the "one" side, so its numbers get summed several times — and putting a right-table filter in WHERE, which silently turns a LEFT JOIN into an INNER JOIN.',
            problem: 'Both bugs return a result with no error, and the numbers look believable. The total revenue comes out as 1131 instead of 793; customers with no delivered orders quietly vanish from an "all customers" report. Interviewers test for exactly these.',
            idea: 'Fan-out: after orders JOIN order_items, an order with 2 items appears on 2 rows, each carrying the full order amount. `SUM(o.amount)` now counts it twice. The fix is to sum at the right grain: aggregate the many side first (in a subquery or CTE), then join one row per order. ON versus WHERE with a LEFT JOIN: a condition in ON decides which right rows match, and left rows are kept regardless. A condition in WHERE runs after the join, on the finished rows — and for unmatched rows the right columns are NULL, so `WHERE o.status = \'delivered\'` is unknown and the row is thrown away.',
            analogy: 'Fan-out is like counting a family\'s income once for each child in the family: join families to children and sum family income, and a family with three children is counted three times. ON versus WHERE is the difference between "invite every pupil, and note which ones brought a permission slip" and "invite only the pupils who brought one".',
            breaks: 'With a family you would notice the triple count. SQL can\'t: it has no idea which column belongs to which grain. Checking the row count after each join is the habit that catches it.',
            syntax: code`
                -- keep all left rows, filter which right rows match:
                LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'

                -- aggregate the many side first, then join:
                JOIN (SELECT order_id, COUNT(*) AS items FROM order_items GROUP BY order_id) i
                  ON i.order_id = o.order_id
            `,
            howItWorks: [
                'orders has 10 rows. Joined to order_items it has 14 rows, because 5 orders have 2 items each (and order 106 has none).',
                'Each of those rows carries its order\'s full amount, so summing amount adds 102, 103, 105, 109 and 110 twice: 1131.',
                'Fix: sum o.amount on orders alone, or pre-aggregate order_items to one row per order before joining.',
                'LEFT JOIN with `AND o.status = \'delivered\'` in ON: all 6 customers are kept; only delivered orders are attached.',
                'The same condition in WHERE: customers with no delivered order have NULL status, so they are removed — 3 customers vanish.',
            ],
            diagram: {
                code: 'flowchart LR\n  O["order 102<br/>amount 80"] --> I1["item: Desk lamp<br/>amount 80"]\n  O --> I2["item: Backpack<br/>amount 80"]\n  I1 --> S["SUM(amount) = 160<br/>counted twice"]\n  I2 --> S',
                caption: 'Fan-out: joining one order to its two items copies the order\'s amount onto both rows. Summing after the join counts it twice. Sum at the order level, or aggregate the items first.',
            },
            examples: [
                {
                    title: 'Fan-out: the total that is too big',
                    sql: code`
                        SELECT SUM(o.amount) AS total_after_join,
                               (SELECT SUM(amount) FROM orders) AS true_total
                        FROM orders o
                        JOIN order_items oi ON oi.order_id = o.order_id;
                    `,
                    result: { columns: ['total_after_join', 'true_total'], rows: [[1131, 793]] },
                    note: 'Orders with two items are counted twice. Nothing errors — the number is just wrong.',
                },
                {
                    title: 'The fix: aggregate the many side first',
                    sql: code`
                        SELECT o.order_id, o.amount, i.item_lines
                        FROM orders o
                        JOIN (
                          SELECT order_id, COUNT(*) AS item_lines
                          FROM order_items
                          GROUP BY order_id
                        ) AS i ON i.order_id = o.order_id
                        WHERE o.customer_id = 1
                        ORDER BY o.order_id;
                    `,
                    result: {
                        columns: ['order_id', 'amount', 'item_lines'],
                        rows: [[101, 120, 1], [102, 80, 2], [103, 45, 2], [105, 150, 2], [109, 30, 2]],
                    },
                    note: 'The subquery shrinks order_items to one row per order before the join, so each order — and its amount — appears once.',
                },
                {
                    title: 'WHERE turns a LEFT JOIN into an INNER JOIN',
                    sql: code`
                        SELECT c.name, o.order_id
                        FROM customers c
                        LEFT JOIN orders o ON o.customer_id = c.customer_id
                        WHERE o.status = 'delivered'
                        ORDER BY c.customer_id, o.order_id;
                    `,
                    result: {
                        columns: ['name', 'order_id'],
                        rows: [['Priya', 101], ['Priya', 102], ['Priya', 103], ['Priya', 109], ['Tom', 104], ['Tom', 108], ['Lena', 107]],
                    },
                    note: 'Omar, Zoe and the second Tom have vanished, even though this is a LEFT JOIN.',
                },
                {
                    title: 'Move the condition into ON to keep everyone',
                    sql: code`
                        SELECT c.name, o.order_id
                        FROM customers c
                        LEFT JOIN orders o ON o.customer_id = c.customer_id AND o.status = 'delivered'
                        ORDER BY c.customer_id, o.order_id;
                    `,
                    result: {
                        columns: ['name', 'order_id'],
                        rows: [['Priya', 101], ['Priya', 102], ['Priya', 103], ['Priya', 109], ['Tom', 104], ['Tom', 108], ['Lena', 107], ['Omar', null], ['Zoe', null], ['Tom', null]],
                    },
                    note: 'Now every customer is kept, and only delivered orders are attached. Zoe\'s pending order isn\'t shown, but Zoe is.',
                },
            ],
            keyPoints: [
                'After every join, ask: what does one row mean now? Did the row count grow?',
                'Never sum a "one"-side column after joining a "many" table. Sum first, or pre-aggregate the many side.',
                'Using DISTINCT to hide fan-out hides the bug, not fixes it — sums can still be wrong.',
                'With a LEFT JOIN, conditions on the right table go in ON; conditions on the left table go in WHERE.',
                'With an INNER JOIN, ON and WHERE give the same result.',
            ],
            mistakes: [
                '`SUM(order.amount)` after joining order_items.',
                '`COUNT(*)` after a fan-out join, counting items instead of orders. Use `COUNT(DISTINCT o.order_id)`.',
                '`LEFT JOIN … WHERE right.col = x` in an "all customers" report.',
            ],
            interviewAnswer: 'The two join bugs I always check for are fan-out and misplaced filters. Fan-out happens when a one-to-many join repeats the parent row, so summing a parent column double-counts — I fix it by aggregating the child table to the parent\'s grain before joining. And with a LEFT JOIN, a filter on the right table belongs in the ON clause; in WHERE it discards the NULL-extended rows and silently becomes an inner join.',
            followUps: [
                { q: 'How do you detect fan-out?', a: 'Compare `COUNT(*)` with `COUNT(DISTINCT parent_id)` after the join, or check the total against the parent table alone.' },
                { q: 'Is there any difference between ON and WHERE for an INNER JOIN?', a: 'No difference in the result. It only matters for outer joins.' },
                { q: 'Can I fix fan-out with DISTINCT?', a: 'It may fix a list of names, but `SUM(DISTINCT amount)` is wrong too — two different orders of £80 would be counted once. Fix the grain instead.' },
            ],
            practice: {
                explain: 'Explain fan-out using order 102, and the two ways to avoid it.',
                write: 'Write a query that returns, for each customer, the number of orders and the number of item lines — both correct, in one query.',
                predict: 'What does `SELECT COUNT(*), COUNT(DISTINCT o.order_id) FROM orders o JOIN order_items oi ON oi.order_id = o.order_id;` return?',
                edge: 'Write "every department and how many employees earn over 60000", keeping departments with 0. Where must the salary condition go?',
            },
            resources: [
                modeTutorial('SQL Joins with Comparison Operators'),
                pgExercises('Joins and Subqueries'),
                sqlBolt('Lesson 7: OUTER JOINs'),
            ],
        },
    ],
};
