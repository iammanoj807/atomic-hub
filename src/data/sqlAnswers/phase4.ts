import type { SqlTopicAnswers } from '../sql';
import { code } from '../sqlCourse/code';

// Phase 4 · Subqueries, CTEs and set operations. One good answer for each practice exercise.

export const sqlPhase4Answers: Record<string, SqlTopicAnswers> = {
    'sql4-t1': {
        explain: {
            answer: '1. One value (a scalar subquery): one row, one column, such as `(SELECT AVG(salary) FROM employees)`. It goes anywhere a single value can: in a WHERE comparison (`salary > (…)`), or as a column in SELECT.\n2. A list: one column, many rows, such as `(SELECT customer_id FROM orders)`. It goes after IN or NOT IN in a WHERE (or inside EXISTS).\n3. A table: many rows and columns. It goes in FROM (or a JOIN), like a table, and needs a name: `FROM (…) AS per_customer`.\n\nThe question to ask: how many rows and columns does my subquery return? That decides where it can go.',
        },
        write: {
            answer: 'A scalar subquery works out the average (125 ÷ 7 = 17.86), and the outer query compares every price with it.',
            query: {
                sql: code`
                    SELECT product_name, price
                    FROM products
                    WHERE price > (SELECT AVG(price) FROM products)
                    ORDER BY price DESC;
                `,
                result: { columns: ['product_name', 'price'], rows: [['Headphones', 40], ['Backpack', 30], ['Desk lamp', 25]] },
            },
        },
        predict: {
            answer: 'Priya and Zoe. Tom drops out.\n\nThe March orders are 108 (Tom, 1 March), 109 (Priya, 10 March) and 110 (Zoe, 16 March). From 5 March only 109 and 110 are left, so the list becomes customers 1 and 5.',
            query: {
                sql: code`
                    SELECT name
                    FROM customers
                    WHERE customer_id IN (
                      SELECT customer_id
                      FROM orders
                      WHERE order_date >= '2024-03-05'
                    )
                    ORDER BY name;
                `,
                result: { columns: ['name'], rows: [['Priya'], ['Zoe']] },
            },
        },
        edge: {
            answer: 'This uses `=`, which expects one value, but the subquery returns a customer_id for every delivered order (7 of them):\n\n`SELECT name FROM customers WHERE customer_id = (SELECT customer_id FROM orders WHERE status = \'delivered\');`\n\nPostgreSQL and SQL Server stop with an error ("more than one row returned by a subquery"). SQLite doesn\'t: it quietly uses the first row and ignores the rest, which is worse, because the result looks fine.\n\nFix 1: you meant "any of them", so use IN. That gives Priya, Tom and Lena (below).\nFix 2: you meant one particular value, so make the subquery return exactly one row: aggregate it, or sort and take one. `WHERE customer_id = (SELECT customer_id FROM orders WHERE status = \'delivered\' ORDER BY amount DESC LIMIT 1)` gives Tom, who placed the biggest delivered order (£200).',
            query: {
                sql: code`
                    SELECT name
                    FROM customers
                    WHERE customer_id IN (
                      SELECT customer_id FROM orders WHERE status = 'delivered'
                    )
                    ORDER BY customer_id;
                `,
                result: { columns: ['name'], rows: [['Priya'], ['Tom'], ['Lena']] },
            },
        },
    },
    'sql4-t2': {
        explain: {
            answer: 'The subquery returns every employee\'s dept_id, and Gus\'s is NULL. So for HR (dept 4) the test is `4 NOT IN (1, 1, 1, 2, 2, 3, NULL, 1)`.\n\nNOT IN means "not equal to each one": 4 <> 1 AND 4 <> 2 AND … AND 4 <> NULL. The last part is unknown, because nobody can say whether 4 equals an unknown value. TRUE AND unknown is unknown, and WHERE only keeps true. So HR is dropped, and so is every other department. One NULL in the list empties the whole result.\n\nNOT EXISTS asks a different question: "is there any employee row with this dept_id?". For HR the answer is plainly no, so it works.',
        },
        write: {
            answer: 'For each product, EXISTS asks: "is there at least one item line for this product, in an order placed by Priya?". It stops at the first one it finds. Only the phone case fails.',
            query: {
                sql: code`
                    SELECT p.product_name
                    FROM products p
                    WHERE EXISTS (
                      SELECT 1
                      FROM order_items oi
                      JOIN orders o    ON o.order_id = oi.order_id
                      JOIN customers c ON c.customer_id = o.customer_id
                      WHERE oi.product_id = p.product_id AND c.name = 'Priya'
                    )
                    ORDER BY p.product_name;
                `,
                result: { columns: ['product_name'], rows: [['Backpack'], ['Desk lamp'], ['Headphones'], ['Mug'], ['Notebook'], ['Pen']] },
            },
        },
        predict: {
            answer: 'Chen, Eli, Fatima, Gus and Hana: everyone who manages nobody.\n\nFor each employee e, the subquery looks for anyone whose manager_id is e. Asha (1), Ben (2) and Dara (4) appear as someone\'s manager, so for them a row exists and they are dropped. Nobody reports to the other five.',
            query: {
                sql: code`
                    SELECT name
                    FROM employees e
                    WHERE NOT EXISTS (
                      SELECT 1 FROM employees r WHERE r.manager_id = e.emp_id
                    )
                    ORDER BY name;
                `,
                result: { columns: ['name'], rows: [['Chen'], ['Eli'], ['Fatima'], ['Gus'], ['Hana']] },
            },
        },
        edge: {
            answer: 'Take the NULL out of the list. With Gus\'s NULL gone, the list is just 1, 2 and 3, and `4 NOT IN (1, 2, 3)` is true.\n\nUse this whenever the column in a NOT IN subquery can be NULL. Or just use NOT EXISTS.',
            query: {
                sql: code`
                    SELECT dept_name
                    FROM departments
                    WHERE dept_id NOT IN (
                      SELECT dept_id FROM employees WHERE dept_id IS NOT NULL
                    );
                `,
                result: { columns: ['dept_name'], rows: [['HR']] },
            },
        },
    },
    'sql4-t3': {
        explain: {
            answer: 'Nested subqueries read inside out: you have to find the innermost bracket first and work outwards, and a step needed twice has to be written twice.\n\nA CTE reads top to bottom, like a recipe. Each step gets a name that says what it is (per_customer, delivered, totals), and later steps use it like a table. In the first example, per_customer is used twice, once to join and once for the average, but written only once. Each step can also be run and checked on its own while you build the query.\n\n(It is about readability. In most databases a CTE is not faster than the same subquery.)',
        },
        write: {
            answer: 'Step 1 (line_revenue): the revenue of each item line, with its category. Step 2 (category_revenue): add those up per category. Then keep the category whose revenue equals the maximum. Electronics wins with £440: 11 headphones at £40.\n\nUsing `= MAX(…)` instead of `ORDER BY … LIMIT 1` keeps both categories if two ever tie.',
            query: {
                sql: code`
                    WITH line_revenue AS (
                      SELECT p.category, oi.quantity * p.price AS revenue
                      FROM order_items oi
                      JOIN products p ON p.product_id = oi.product_id
                    ),
                    category_revenue AS (
                      SELECT category, SUM(revenue) AS revenue
                      FROM line_revenue
                      GROUP BY category
                    )
                    SELECT category, revenue
                    FROM category_revenue
                    WHERE revenue = (SELECT MAX(revenue) FROM category_revenue);
                `,
                result: { columns: ['category', 'revenue'], rows: [['Electronics', 440]] },
            },
        },
        predict: {
            answer: 'You get the customers who spend less than average, instead of more: Lena (£60) and Zoe (£33), instead of Priya (£425) and Tom (£275).\n\nThe per-customer totals are 425, 275, 60 and 33, and their average is 793 ÷ 4 = 198.25. Omar and the second Tom are not in per_customer at all (they have no orders), so they are not below the average either.',
            query: {
                sql: code`
                    WITH per_customer AS (
                      SELECT customer_id, SUM(amount) AS total
                      FROM orders
                      GROUP BY customer_id
                    )
                    SELECT c.name, p.total
                    FROM per_customer p
                    JOIN customers c ON c.customer_id = p.customer_id
                    WHERE p.total < (SELECT AVG(total) FROM per_customer)
                    ORDER BY p.total DESC;
                `,
                result: { columns: ['name', 'total'], rows: [['Lena', 60], ['Zoe', 33]] },
            },
        },
        edge: {
            answer: 'Not here.\n\nSUM skips NULLs, so Lena\'s total is just her £60 order. The NULL is ignored: her total is not NULL and not lower. The average is then taken over the 4 totals (425, 275, 60, 33), so it is 198.25 either way.\n\nIt would matter if all of a customer\'s amounts were NULL. Their total would be NULL, and AVG would skip that customer entirely: the average would be over 3 customers, not 4. If that customer should count as £0, use `COALESCE(SUM(amount), 0)`.',
            query: {
                sql: code`
                    WITH per_customer AS (
                      SELECT customer_id, SUM(amount) AS total,
                             COUNT(*) AS orders, COUNT(amount) AS with_amount
                      FROM orders
                      GROUP BY customer_id
                    )
                    SELECT customer_id, total, orders, with_amount,
                           (SELECT AVG(total) FROM per_customer) AS avg_total
                    FROM per_customer
                    ORDER BY customer_id;
                `,
                result: { columns: ['customer_id', 'total', 'orders', 'with_amount', 'avg_total'], rows: [[1, 425, 5, 5, 198.25], [2, 275, 2, 2, 198.25], [3, 60, 2, 1, 198.25], [5, 33, 1, 1, 198.25]] },
            },
        },
    },
    'sql4-t4': {
        explain: {
            answer: 'The anchor runs once and gives the starting rows. In the org chart that is the person with no manager: Asha, at level 0.\n\nThe recursive part runs again and again. Each time, it takes only the rows found in the round before and finds the people who report to them, adding 1 to the level:\n• round 1: from Asha, it finds Ben, Chen, Dara and Fatima (level 1);\n• round 2: from those four, it finds Hana (under Ben), and Eli and Gus (under Dara) (level 2);\n• round 3: nobody reports to Hana, Eli or Gus. No new rows, so it stops.\n\nUNION ALL stacks all the rounds into one result.',
        },
        write: {
            answer: 'Walk up instead of down. The anchor is Hana\'s row; each round joins to the row of the current person\'s manager and adds " → name" to the path. The top of the chain is the row whose manager_id is NULL, so keep only that one.',
            query: {
                sql: code`
                    WITH RECURSIVE chain(emp_id, manager_id, path) AS (
                      SELECT emp_id, manager_id, name
                      FROM employees
                      WHERE name = 'Hana'
                      UNION ALL
                      SELECT m.emp_id, m.manager_id, chain.path || ' → ' || m.name
                      FROM chain
                      JOIN employees m ON m.emp_id = chain.manager_id
                    )
                    SELECT path
                    FROM chain
                    WHERE manager_id IS NULL;
                `,
                result: { columns: ['path'], rows: [['Hana → Ben → Asha']] },
            },
        },
        predict: {
            answer: 'Dara is level 0, and Eli and Gus are level 1. That is all: nobody reports to Eli or Gus.\n\nThe anchor decides where the walk starts. Starting from Dara, you only see Dara\'s part of the tree; Asha, Ben and the rest are never reached.',
            query: {
                sql: code`
                    WITH RECURSIVE chart AS (
                      SELECT emp_id, name, 0 AS level
                      FROM employees
                      WHERE name = 'Dara'
                      UNION ALL
                      SELECT e.emp_id, e.name, chart.level + 1
                      FROM employees e
                      JOIN chart ON e.manager_id = chart.emp_id
                    )
                    SELECT name, level FROM chart ORDER BY level, name;
                `,
                result: { columns: ['name', 'level'], rows: [['Dara', 0], ['Eli', 1], ['Gus', 1]] },
            },
        },
        edge: {
            answer: 'Two things go wrong.\n\nThe org-chart query as written starts from `manager_id IS NULL`. With the loop nobody has a NULL manager, so the anchor finds nothing, and the result is empty.\n\nStart from Asha by name instead, and it never ends: Asha → Ben → Hana → Asha → … Each round finds "new" rows (the same people, one level deeper), so the recursion never runs out. SQLite runs until it is stopped; SQL Server stops after 100 rounds with an error.\n\nWays to stop it:\n• a depth limit: `WHERE chart.level < 10` in the recursive part;\n• a visited list: carry the ids seen so far and refuse to visit one again (below);\n• PostgreSQL 14+ has a CYCLE clause that does this for you.\n\nBelow, the UPDATE makes the loop, and the visited list stops the walk when it gets back to Asha.',
            query: {
                sql: code`
                    UPDATE employees SET manager_id = 8 WHERE name = 'Asha';

                    WITH RECURSIVE chart AS (
                      SELECT emp_id, name, 0 AS level, ',' || emp_id || ',' AS visited
                      FROM employees
                      WHERE name = 'Asha'
                      UNION ALL
                      SELECT e.emp_id, e.name, chart.level + 1, chart.visited || e.emp_id || ','
                      FROM employees e
                      JOIN chart ON e.manager_id = chart.emp_id
                      WHERE chart.visited NOT LIKE '%,' || e.emp_id || ',%'
                    )
                    SELECT name, level FROM chart ORDER BY level, name;
                `,
                result: { columns: ['name', 'level'], rows: [['Asha', 0], ['Ben', 1], ['Chen', 1], ['Dara', 1], ['Fatima', 1], ['Eli', 2], ['Gus', 2], ['Hana', 2]] },
            },
        },
    },
    'sql4-t5': {
        explain: {
            answer: 'Both stack two results on top of each other. UNION then removes duplicate rows; UNION ALL keeps every row.\n\nUse UNION when you want a list of different values, such as "every city we have a customer or an office in, once each".\n\nUse UNION ALL when every row counts, such as stacking January\'s and February\'s orders before adding them up, or when duplicates can\'t happen anyway (each half has a different label). It is also faster: UNION has to sort or hash everything to find duplicates.\n\nA useful habit: write UNION ALL by default, and use UNION only when you really mean "remove duplicates".',
        },
        write: {
            answer: 'Both halves need the same number of columns, in the same order. The label column is a fixed text value in each half. Column names come from the first half, so the second can skip AS.\n\nTom appears twice because he signed up twice. UNION would merge those two identical rows; whether you want that depends on whether you are listing people or sign-ups.',
            query: {
                sql: code`
                    SELECT name, 'employee' AS source FROM employees
                    UNION ALL
                    SELECT name, 'customer' FROM customers
                    ORDER BY source, name;
                `,
                result: { columns: ['name', 'source'], rows: [['Lena', 'customer'], ['Omar', 'customer'], ['Priya', 'customer'], ['Tom', 'customer'], ['Tom', 'customer'], ['Zoe', 'customer'], ['Asha', 'employee'], ['Ben', 'employee'], ['Chen', 'employee'], ['Dara', 'employee'], ['Eli', 'employee'], ['Fatima', 'employee'], ['Gus', 'employee'], ['Hana', 'employee']] },
            },
        },
        predict: {
            answer: '10 rows: 6 customer cities plus 4 department locations. UNION ALL removes nothing, so the duplicate Londons and Leeds, and Zoe\'s NULL, all stay.',
            query: {
                sql: code`
                    SELECT COUNT(*) AS rows_returned
                    FROM (
                      SELECT city FROM customers
                      UNION ALL
                      SELECT location FROM departments
                    );
                `,
                result: { columns: ['rows_returned'], rows: [[10]] },
            },
        },
        edge: {
            answer: 'Yes. UNION (like DISTINCT and GROUP BY) treats two NULLs as duplicates and keeps one. In the first example only Zoe\'s city is NULL, so add a second NULL to check: below, two NULLs go in and one comes out.\n\nThat differs from `=`, where `NULL = NULL` is unknown, not true. The rule: for comparisons, NULL equals nothing; for removing duplicates and grouping, all NULLs count as the same.',
            query: {
                sql: code`
                    SELECT city FROM customers
                    UNION
                    SELECT NULL
                    ORDER BY city;
                `,
                result: { columns: ['city'], rows: [[null], ['Bristol'], ['Leeds'], ['London']] },
            },
        },
    },
};
