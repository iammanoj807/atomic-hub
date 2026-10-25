import type { SqlTopicAnswers } from '../sql';
import { code } from '../sqlCourse/code';

// Phase 8 · SQL interview problems. One good answer for each practice exercise.

export const sqlPhase8Answers: Record<string, SqlTopicAnswers> = {
    'sql8-t1': {
        explain: {
            answer: '1. Restate the question and clarify it: "So you want delivered revenue per city, highest first?" It catches misunderstandings before you write anything, and shows you listen.\n2. Look at the tables, their grain and the data: one row of orders is one order; the city is in customers; run a quick count. Joins and sums go wrong when you don\'t know what one row means.\n3. Ask about the edge cases: ties, NULLs, duplicates, date ranges, what "per" means. Each answer changes the query, and asking is what interviewers grade.\n4. Plan out loud, then write it as small CTEs, one step each, named after what they hold. Easy to follow, and easy to fix one step.\n5. Check the result: a row count and one number worked out by hand ("London = 275 + 60 = 335"). It catches fan-out, missing rows and integer division before the interviewer does.',
        },
        write: {
            answer: 'Clarifying questions first:\n• Which orders count? I\'ll assume everything except cancelled (shipped and pending were still sold), and say so.\n• "February" means February 2024, by order_date.\n• Units means the quantity in order_items, not the number of orders.\n• What if two categories tie? I\'ll return both, rather than pick one.\n\nGrain: one order_items row is one product in one order; the category is in products; the date and status are in orders.\n\nPlan: February\'s item lines with their category → units per category → keep the maximum. Check by hand: February has orders 105 (3 headphones, 1 backpack) and 107 (2 backpacks); 106 was cancelled and has no items. So Electronics = 3 and Bags = 1 + 2 = 3: a tie, and both come back.',
            query: {
                sql: code`
                    WITH feb_items AS (
                      SELECT p.category, oi.quantity
                      FROM orders o
                      JOIN order_items oi ON oi.order_id = o.order_id
                      JOIN products p     ON p.product_id = oi.product_id
                      WHERE o.order_date >= '2024-02-01' AND o.order_date < '2024-03-01'
                        AND o.status <> 'cancelled'
                    ),
                    by_category AS (
                      SELECT category, SUM(quantity) AS units
                      FROM feb_items
                      GROUP BY category
                    )
                    SELECT category, units
                    FROM by_category
                    WHERE units = (SELECT MAX(units) FROM by_category)
                    ORDER BY category;
                `,
                result: { columns: ['category', 'units'], rows: [['Bags', 3], ['Electronics', 3]] },
            },
        },
        predict: {
            answer: 'Exactly the same: London 335, Leeds 275.\n\nThe only cancelled order is 106 (Lena, London), and its amount is NULL. SUM skips NULLs, so adding it changes nothing. A good prediction checks the data, not just the logic: "include cancelled orders" sounds like a big change, but here it adds one row with nothing to add.',
            query: {
                sql: code`
                    WITH delivered AS (
                      SELECT customer_id, amount
                      FROM orders
                      WHERE status IN ('delivered', 'cancelled')
                    )
                    SELECT COALESCE(c.city, 'unknown') AS city,
                           SUM(d.amount) AS delivered_revenue
                    FROM delivered d
                    JOIN customers c ON c.customer_id = d.customer_id
                    GROUP BY COALESCE(c.city, 'unknown')
                    ORDER BY delivered_revenue DESC;
                `,
                result: { columns: ['city', 'delivered_revenue'], rows: [['London', 335], ['Leeds', 275]] },
            },
        },
        edge: {
            answer: '1. Orders with no amount, or cancelled orders. Order 106 has a NULL amount. AVG skips it (Lena\'s average is 60, from one order); treating it as £0 gives 30. Ask which is meant, then either filter `WHERE status <> \'cancelled\'`, or use `AVG(COALESCE(amount, 0))`.\n\n2. Customers with no orders. Omar has none. Starting from orders, he simply isn\'t there; if the question means "per customer, all of them", start from customers with a LEFT JOIN, and decide whether he shows NULL or 0.\n\n3. Duplicate customers. Tom signed up twice (ids 2 and 6). Grouping by customer_id gives two Toms, one with no orders. If they are one person, group by the email instead (after cleaning it).\n\n(A fourth worth asking: does "average order value per customer" mean each customer\'s own average, or one overall figure, which is total revenue ÷ number of orders?)',
        },
    },
    'sql8-t2': {
        explain: {
            answer: 'Five, each in one breath:\n\n• WHERE vs HAVING: WHERE filters rows before grouping and can\'t use aggregates; HAVING filters groups after GROUP BY, so it can use COUNT and SUM.\n• INNER JOIN vs LEFT JOIN: INNER keeps only rows that match on both sides; LEFT keeps every row of the left table and fills NULLs where the right has no match. Use LEFT for "including the ones with none".\n• UNION vs UNION ALL: both stack two results; UNION removes duplicate rows (extra work), UNION ALL keeps them all and is faster. Default to UNION ALL unless you need distinct rows.\n• DELETE vs TRUNCATE vs DROP: DELETE removes chosen rows and can be rolled back; TRUNCATE empties the whole table fast; DROP removes the table itself.\n• RANK vs DENSE_RANK vs ROW_NUMBER: ROW_NUMBER gives 1, 2, 3, 4 with no ties; RANK lets ties share and then skips (1, 2, 2, 4); DENSE_RANK lets ties share without skipping (1, 2, 2, 3).',
        },
        write: {
            answer: 'Each count is a scalar subquery, so both fit in one row.\n\nThe INNER JOIN gives 7: every employee who has a department (Gus has none, so he isn\'t paired). The LEFT JOIN from departments gives 8: the same 7, plus one row for HR, which has nobody, with NULL employee columns. The difference is exactly the unmatched rows on the left side.',
            query: {
                sql: code`
                    SELECT (SELECT COUNT(*) FROM departments d
                              JOIN employees e ON e.dept_id = d.dept_id) AS inner_join_rows,
                           (SELECT COUNT(*) FROM departments d
                              LEFT JOIN employees e ON e.dept_id = d.dept_id) AS left_join_rows;
                `,
                result: { columns: ['inner_join_rows', 'left_join_rows'], rows: [[7, 8]] },
            },
        },
        predict: {
            answer: '3, 5 and 6.\n\n• `COUNT(DISTINCT city)`: London, Leeds and Bristol. The NULL is not counted.\n• `COUNT(city)`: every city that isn\'t NULL, duplicates included: Zoe is the only one missing, so 5.\n• `COUNT(*)`: every row, 6.',
            query: {
                sql: code`
                    SELECT COUNT(DISTINCT city), COUNT(city), COUNT(*) FROM customers;
                `,
                result: { columns: ['COUNT(DISTINCT city)', 'COUNT(city)', 'COUNT(*)'], rows: [[3, 5, 6]] },
            },
        },
        edge: {
            answer: 'When you select only the grouped columns, they mean the same thing: `SELECT DISTINCT dept_id FROM employees` and `SELECT dept_id FROM employees GROUP BY dept_id` both give one row per department (with one row for NULL). Many databases even run them the same way.\n\nThey differ when:\n• You want something per group. GROUP BY can count, sum or average each group (below); DISTINCT can only remove duplicates.\n• You filter groups. HAVING works with GROUP BY; DISTINCT has nothing like it.\n• DISTINCT applies to every selected column, including calculated ones, and runs after SELECT. GROUP BY groups by what you list, and everything else in SELECT must be aggregated.\n• The output order: neither guarantees one without ORDER BY.',
            query: {
                sql: code`
                    SELECT dept_id, COUNT(*) AS people
                    FROM employees
                    GROUP BY dept_id
                    ORDER BY dept_id;
                `,
                result: { columns: ['dept_id', 'people'], rows: [[null, 1], [1, 4], [2, 2], [3, 1]] },
            },
        },
    },
    'sql8-p1': {
        explain: {
            answer: '`ORDER BY salary DESC LIMIT 1 OFFSET 1` takes the second row, not the second salary. With a tie at the top, the second row has the same salary as the first.\n\nIf Hana\'s salary were 95,000 too, the sorted salaries would be 95,000, 95,000, 70,000… The second row is 95,000: the highest again, not the second highest (which is 70,000). The query below makes that change and shows the wrong answer.\n\nIt has a second problem: when there is no second row, it returns no rows at all, while the question asks for NULL. `SELECT DISTINCT` inside a scalar subquery fixes both, and DENSE_RANK = 2 is clearer still.',
            query: {
                sql: code`
                    UPDATE employees SET salary = 95000 WHERE name = 'Hana';
                    SELECT salary AS not_second_highest
                    FROM employees
                    ORDER BY salary DESC
                    LIMIT 1 OFFSET 1;
                `,
                result: { columns: ['not_second_highest'], rows: [[95000]] },
            },
        },
        write: {
            answer: 'The third highest is the same query with `WHERE rnk = 3`: 70,000 (after 95,000 and 80,000; Ben and Chen share it, and DENSE_RANK counts it once).\n\nPer department, add PARTITION BY dept_id so each department ranks its own salaries. Starting from departments with a LEFT JOIN, and putting `rnk = 2` in the ON, keeps departments with no second salary: Marketing (only Fatima) and HR (nobody) show NULL, as the original question asks.',
            query: {
                sql: code`
                    WITH ranked AS (
                      SELECT dept_id, salary,
                             DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk
                      FROM employees
                      WHERE dept_id IS NOT NULL
                    )
                    SELECT d.dept_name, MAX(r.salary) AS second_highest
                    FROM departments d
                    LEFT JOIN ranked r ON r.dept_id = d.dept_id AND r.rnk = 2
                    GROUP BY d.dept_id, d.dept_name
                    ORDER BY d.dept_id;
                `,
                result: { columns: ['dept_name', 'second_highest'], rows: [['Engineering', 80000], ['Sales', 45000], ['Marketing', null], ['HR', null]] },
            },
        },
        predict: {
            answer: '70,000. Asha and Hana would both be on 95,000, and DENSE_RANK gives them both rank 1. The next different salary, 70,000 (Ben and Chen), gets rank 2.',
            query: {
                sql: code`
                    UPDATE employees SET salary = 95000 WHERE name = 'Hana';
                    WITH ranked AS (
                      SELECT salary,
                             DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
                      FROM employees
                    )
                    SELECT MAX(salary) AS second_highest
                    FROM ranked
                    WHERE rnk = 2;
                `,
                result: { columns: ['second_highest'], rows: [[70000]] },
            },
        },
        edge: {
            answer: 'One row, with NULL. That is why the solution wraps the result in MAX: an aggregate with no GROUP BY always returns exactly one row, even when no rows match, and MAX of nothing is NULL.\n\nWithout the MAX (`SELECT salary FROM ranked WHERE rnk = 2`), an empty table would return no rows at all. Below, every employee is deleted first.',
            query: {
                sql: code`
                    DELETE FROM employees;
                    WITH ranked AS (
                      SELECT salary,
                             DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
                      FROM employees
                    )
                    SELECT MAX(salary) AS second_highest
                    FROM ranked
                    WHERE rnk = 2;
                `,
                result: { columns: ['second_highest'], rows: [[null]] },
            },
        },
    },
    'sql8-p2': {
        explain: {
            answer: 'The table is used twice. e is the employee: the row we are asking about. m is the manager: a second copy of the same table, used to look up the boss.\n\n`m.emp_id = e.manager_id` reads: "find the row in m whose id is the manager_id written on the employee\'s row". For Hana, manager_id is 2, so m is Ben\'s row.\n\nWritten the other way round, `e.emp_id = m.manager_id`, the roles swap: m becomes someone who reports to e. Then `e.salary > m.salary` would find managers who earn more than their reports, which is nearly everyone.',
        },
        write: {
            answer: 'The same self join, comparing hire dates instead of salaries. In this data nobody was hired before their manager: Asha (2019) came before everyone she manages, and so did Dara and Ben (2020). An empty result is the right answer here.',
            query: {
                sql: code`
                    SELECT e.name AS employee, e.hire_date,
                           m.name AS manager, m.hire_date AS manager_hired
                    FROM employees e
                    JOIN employees m ON m.emp_id = e.manager_id
                    WHERE e.hire_date < m.hire_date
                    ORDER BY e.name;
                `,
                result: { columns: ['employee', 'hire_date', 'manager', 'manager_hired'], rows: [] },
            },
        },
        predict: {
            answer: 'Two rows: Eli (61,000) over his manager Dara (60,000), and Hana (80,000) over Ben (70,000), as before. Sorted by name, Eli comes first.',
            query: {
                sql: code`
                    UPDATE employees SET salary = 61000 WHERE name = 'Eli';
                    SELECT e.name AS employee, e.salary,
                           m.name AS manager, m.salary AS manager_salary
                    FROM employees e
                    JOIN employees m ON m.emp_id = e.manager_id
                    WHERE e.salary > m.salary
                    ORDER BY e.name;
                `,
                result: { columns: ['employee', 'salary', 'manager', 'manager_salary'], rows: [['Eli', 61000, 'Dara', 60000], ['Hana', 80000, 'Ben', 70000]] },
            },
        },
        edge: {
            answer: 'Use a LEFT JOIN so employees with no manager keep their row (with NULLs), and let them through the WHERE on purpose: `e.salary > m.salary` is unknown when m is NULL, so add `OR m.emp_id IS NULL`. Asha now appears with NULL manager columns, next to Hana.',
            query: {
                sql: code`
                    SELECT e.name AS employee, e.salary,
                           m.name AS manager, m.salary AS manager_salary
                    FROM employees e
                    LEFT JOIN employees m ON m.emp_id = e.manager_id
                    WHERE e.salary > m.salary OR m.emp_id IS NULL
                    ORDER BY e.name;
                `,
                result: { columns: ['employee', 'salary', 'manager', 'manager_salary'], rows: [['Asha', 95000, null, null], ['Hana', 80000, 'Ben', 70000]] },
            },
        },
    },
    'sql8-p3': {
        explain: {
            answer: 'In the LEFT JOIN version, the ON decides what counts as a match: "an order of this customer that was delivered". A customer with no delivered order finds no match, so they get one row with NULLs, and `WHERE o.order_id IS NULL` keeps exactly those customers.\n\nMove the status test into the WHERE and it runs after the join, on every row. A customer whose orders are all pending gets matched to those orders (not NULL, so `IS NULL` drops them), and a customer with no orders has a NULL status, which fails `o.status = \'delivered\'`. Every row fails one test or the other, so nothing comes back.',
        },
        write: {
            answer: 'For each product, look for any item line in a delivered order. Only the phone case has none: it has never been sold at all. Every other product appears in at least one delivered order.',
            query: {
                sql: code`
                    SELECT p.product_name
                    FROM products p
                    WHERE NOT EXISTS (
                      SELECT 1
                      FROM order_items oi
                      JOIN orders o ON o.order_id = oi.order_id
                      WHERE oi.product_id = p.product_id
                        AND o.status = 'delivered'
                    )
                    ORDER BY p.product_name;
                `,
                result: { columns: ['product_name'], rows: [['Phone case']] },
            },
        },
        predict: {
            answer: 'No rows at all. After the LEFT JOIN, every row either has an order (so order_id is not NULL) or has no order (so status is NULL, and `NULL = \'delivered\'` isn\'t true). A row would need a delivered status and a NULL order_id at once, which is impossible. A filter on the right-hand table in WHERE quietly cancels the LEFT JOIN.',
            query: {
                sql: code`
                    SELECT c.customer_id, c.name
                    FROM customers c
                    LEFT JOIN orders o ON o.customer_id = c.customer_id
                    WHERE o.status = 'delivered' AND o.order_id IS NULL
                    ORDER BY c.customer_id;
                `,
                result: { columns: ['customer_id', 'name'], rows: [] },
            },
        },
        edge: {
            answer: 'They have never had an order delivered, so they should be listed. (In this database status is NOT NULL, so it can\'t happen, but it is worth checking.)\n\nThe NOT EXISTS solution gets it right: inside the subquery, `NULL = \'delivered\'` is not true, so no delivered order is found, NOT EXISTS is true, and the customer is listed. The LEFT JOIN version also lists them, because the ON finds no match.\n\nThe version that gets it wrong flips the logic: "customers who have an order WHERE status <> \'delivered\'". `NULL <> \'delivered\'` is not true either, so that customer would be missed. Whenever you write a negative test, ask what it does with NULL.',
        },
    },
    'sql8-p4': {
        explain: {
            answer: 'A duplicate email is a fact about a group of rows ("this email appears more than once"), not about any single row. Looking at one row on its own, you can\'t tell whether its email is repeated.\n\nWHERE runs before GROUP BY, one row at a time, so `COUNT(*)` doesn\'t exist yet there. GROUP BY email makes one group per email, and HAVING runs after it, so `HAVING COUNT(*) > 1` can keep only the groups with more than one row.',
        },
        write: {
            answer: 'Group by both columns and keep groups with more than one row. Only Tom in Leeds appears twice.\n\nNote: GROUP BY puts NULLs together, so two people with the same name and no city would count as a pair. Usually that is what you want for finding duplicates, but say it out loud.',
            query: {
                sql: code`
                    SELECT name, city, COUNT(*) AS sign_ups
                    FROM customers
                    GROUP BY name, city
                    HAVING COUNT(*) > 1
                    ORDER BY name, city;
                `,
                result: { columns: ['name', 'city', 'sign_ups'], rows: [['Tom', 'Leeds', 2]] },
            },
        },
        predict: {
            answer: 'Two rows: priya@mail.com with 2 sign-ups (Priya and now Zoe), and tom@mail.com with 2, as before. The query doesn\'t care that the names differ; it only groups by email.',
            query: {
                sql: code`
                    UPDATE customers SET email = 'priya@mail.com' WHERE name = 'Zoe';
                    SELECT email, COUNT(*) AS sign_ups
                    FROM customers
                    GROUP BY email
                    HAVING COUNT(*) > 1
                    ORDER BY email;
                `,
                result: { columns: ['email', 'sign_ups'], rows: [['priya@mail.com', 2], ['tom@mail.com', 2]] },
            },
        },
        edge: {
            answer: 'Group by a cleaned-up version of the email: `LOWER(TRIM(email))`. LOWER makes the case the same; TRIM removes stray spaces, another common cause of fake "different" emails. Below, Tom\'s second sign-up is changed to \'TOM@mail.com\' and the two still count as one.\n\nTo stop it happening again, store emails lower-cased, and put a unique index on the lower-cased value (`CREATE UNIQUE INDEX … ON customers (LOWER(email))`, or a COLLATE NOCASE column in SQLite).',
            query: {
                sql: code`
                    UPDATE customers SET email = 'TOM@mail.com' WHERE customer_id = 6;
                    SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS sign_ups
                    FROM customers
                    GROUP BY LOWER(TRIM(email))
                    HAVING COUNT(*) > 1
                    ORDER BY 1;
                `,
                result: { columns: ['email', 'sign_ups'], rows: [['tom@mail.com', 2]] },
            },
        },
    },
    'sql8-p5': {
        explain: {
            answer: 'Because of the order a query runs in. WHERE runs before SELECT, and window functions like RANK are worked out in the SELECT step. So when WHERE runs, the rank doesn\'t exist yet, and `WHERE RANK() OVER (…) = 1` is an error.\n\nThe fix is two steps: a CTE (or subquery) works out the rank for every row, and the outer query, which runs afterwards, filters on it like an ordinary column. (Some databases, such as Snowflake and BigQuery, add QUALIFY to filter on a window function directly.)',
        },
        write: {
            answer: 'Same as the solution, with `rnk <= 2`. RANK keeps ties: if two people shared second place, both would be included. Here Engineering gives Asha and Hana (Ben and Chen tie for third, so they are out), Sales gives Dara and Eli, and Marketing has only Fatima.',
            query: {
                sql: code`
                    WITH ranked AS (
                      SELECT d.dept_name, e.name, e.salary,
                             RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rnk
                      FROM employees e
                      JOIN departments d ON d.dept_id = e.dept_id
                    )
                    SELECT dept_name, name, salary, rnk
                    FROM ranked
                    WHERE rnk <= 2
                    ORDER BY dept_name, rnk, name;
                `,
                result: { columns: ['dept_name', 'name', 'salary', 'rnk'], rows: [['Engineering', 'Asha', 95000, 1], ['Engineering', 'Hana', 80000, 2], ['Marketing', 'Fatima', 52000, 1], ['Sales', 'Dara', 60000, 1], ['Sales', 'Eli', 45000, 2]] },
            },
        },
        predict: {
            answer: 'Engineering now has two rows: Asha and Hana both earn 95,000, so both get rank 1. Marketing (Fatima) and Sales (Dara) are unchanged. 4 rows in all.\n\nThe ORDER BY below adds name, so the two Engineering rows always come out in the same order.',
            query: {
                sql: code`
                    UPDATE employees SET salary = 95000 WHERE name = 'Hana';
                    WITH ranked AS (
                      SELECT d.dept_name, e.name, e.salary,
                             RANK() OVER (PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rnk
                      FROM employees e
                      JOIN departments d ON d.dept_id = e.dept_id
                    )
                    SELECT dept_name, name, salary
                    FROM ranked
                    WHERE rnk = 1
                    ORDER BY dept_name, name;
                `,
                result: { columns: ['dept_name', 'name', 'salary'], rows: [['Engineering', 'Asha', 95000], ['Engineering', 'Hana', 95000], ['Marketing', 'Fatima', 52000], ['Sales', 'Dara', 60000]] },
            },
        },
        edge: {
            answer: 'Start from departments and LEFT JOIN employees, and partition by d.dept_id (not e.dept_id, which is NULL for HR). HR gets one row with NULL name and salary; it is the only row in its partition, so its rank is 1 and it survives the filter.',
            query: {
                sql: code`
                    WITH ranked AS (
                      SELECT d.dept_name, e.name, e.salary,
                             RANK() OVER (PARTITION BY d.dept_id ORDER BY e.salary DESC) AS rnk
                      FROM departments d
                      LEFT JOIN employees e ON e.dept_id = d.dept_id
                    )
                    SELECT dept_name, name, salary
                    FROM ranked
                    WHERE rnk = 1
                    ORDER BY dept_name;
                `,
                result: { columns: ['dept_name', 'name', 'salary'], rows: [['Engineering', 'Asha', 95000], ['HR', null, null], ['Marketing', 'Fatima', 52000], ['Sales', 'Dara', 60000]] },
            },
        },
    },
    'sql8-p6': {
        explain: {
            answer: '1. A window function: `AVG(salary) OVER (PARTITION BY dept_id)` puts the department average on every row; a CTE then filters `salary > dept_avg`. One pass, and the average is right there to show.\n2. Join to a grouped subquery: `SELECT dept_id, AVG(salary) … GROUP BY dept_id` makes one row per department, then you join it to employees on dept_id and compare. Works in every database, even ones without window functions.\n3. A correlated subquery: `WHERE salary > (SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id)`. Reads naturally, but is worked out once per row (good optimisers rewrite it), and the average isn\'t available to display.',
        },
        write: {
            answer: 'Partition the average by customer instead of department. Priya averages 85 (425 ÷ 5), so orders 101 (120) and 105 (150) are above it; Tom averages 137.5, so 104 (200) is. Lena\'s average is 60 (the NULL order is skipped), and her only amount equals it, so nothing of hers is above.',
            query: {
                sql: code`
                    WITH with_avg AS (
                      SELECT order_id, customer_id, amount,
                             AVG(amount) OVER (PARTITION BY customer_id) AS customer_avg
                      FROM orders
                    )
                    SELECT order_id, customer_id, amount, customer_avg
                    FROM with_avg
                    WHERE amount > customer_avg
                    ORDER BY customer_id, order_id;
                `,
                result: { columns: ['order_id', 'customer_id', 'amount', 'customer_avg'], rows: [[101, 1, 120, 85], [105, 1, 150, 85], [104, 2, 200, 137.5]] },
            },
        },
        predict: {
            answer: 'Asha, Chen and Dara. Engineering\'s average rises to (95,000 + 70,000 + 90,000 + 80,000) ÷ 4 = 83,750. Asha (95,000) and Chen (90,000) are above it; Hana (80,000) drops below. Sales is unchanged, so Dara is still above 52,500.',
            query: {
                sql: code`
                    UPDATE employees SET salary = 90000 WHERE name = 'Chen';
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
                result: { columns: ['name', 'dept_id', 'salary', 'dept_avg'], rows: [['Asha', 1, 95000, 83750], ['Chen', 1, 90000, 83750], ['Dara', 2, 60000, 52500]] },
            },
        },
        edge: {
            answer: 'Add `WHERE dept_id IS NOT NULL` inside the CTE, so Gus is never given a "department" of his own. (In the window version, PARTITION BY puts all NULLs in one group, so Gus is compared with himself; he isn\'t above his own average, so he doesn\'t appear today, but only by luck: two employees with no department would be compared with each other.)\n\nThe join version excludes him already: it joins on `a.dept_id = e.dept_id`, and `NULL = NULL` is not true, so Gus\'s row finds no partner and the join drops it.',
            query: {
                sql: code`
                    WITH with_avg AS (
                      SELECT name, dept_id, salary,
                             AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
                      FROM employees
                      WHERE dept_id IS NOT NULL
                    )
                    SELECT name, dept_id, salary, dept_avg
                    FROM with_avg
                    WHERE salary > dept_avg
                    ORDER BY dept_id, salary DESC;
                `,
                result: { columns: ['name', 'dept_id', 'salary', 'dept_avg'], rows: [['Asha', 1, 95000, 78750], ['Hana', 1, 80000, 78750], ['Dara', 2, 60000, 52500]] },
            },
        },
    },
    'sql8-p7': {
        explain: {
            answer: 'LAG returns the previous row, so the rows must be the things you want to compare: months. On the raw orders table, the previous row is the previous order, so "growth" would compare one order with another order.\n\nSo first collapse to one row per month (GROUP BY month, SUM(amount)) in a CTE, and only then use LAG over those monthly rows. The previous row is now the previous month.\n\n(The order of the steps matters for a second reason too: window functions run after GROUP BY, so even in one query, LAG over a SUM is computed on the grouped rows.)',
        },
        write: {
            answer: 'Swap SUM(amount) for COUNT(*). January has 4 orders, February 3 (−25%) and March 3 (0%).\n\nOne question to ask: do cancelled orders count? Order 106 is in February\'s 3. Excluding it would make February 2 and March +50%.',
            query: {
                sql: code`
                    WITH monthly AS (
                      SELECT strftime('%Y-%m', order_date) AS month,
                             COUNT(*) AS orders
                      FROM orders
                      GROUP BY strftime('%Y-%m', order_date)
                    )
                    SELECT month, orders,
                           ROUND(100.0 * (orders - LAG(orders) OVER (ORDER BY month))
                                 / LAG(orders) OVER (ORDER BY month), 1) AS growth_pct
                    FROM monthly
                    ORDER BY month;
                `,
                result: { columns: ['month', 'orders', 'growth_pct'], rows: [['2024-01', 4, null], ['2024-02', 3, -25], ['2024-03', 3, 0]] },
            },
        },
        predict: {
            answer: '+50.0. February\'s revenue is 210, so (315 − 210) ÷ 210 = 105 ÷ 210 = 0.5, which is 50%.\n\nThe query below makes March 315 by adding 177 to order 110 (138 + 177 = 315).',
            query: {
                sql: code`
                    UPDATE orders SET amount = amount + 177 WHERE order_id = 110;
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
                result: { columns: ['month', 'revenue', 'growth_pct'], rows: [['2024-01', 445, null], ['2024-02', 210, -52.8], ['2024-03', 315, 50]] },
            },
        },
        edge: {
            answer: 'Revenue is a whole number, so with whole-number maths the division throws away the fraction. (210 − 445) ÷ 445 is −0.53, which becomes 0, and 0 × 100 = 0: February shows 0% growth instead of −52.8%. March does the same. Nothing errors; the numbers are just wrong.\n\nThe fix is to make one side a decimal before dividing: multiply by 100.0 first, as the solution does. Multiplying by 100 (whole) first would be closer but still cut the decimals off: −52 instead of −52.8.',
            query: {
                sql: code`
                    WITH monthly AS (
                      SELECT strftime('%Y-%m', order_date) AS month,
                             SUM(amount) AS revenue
                      FROM orders
                      GROUP BY strftime('%Y-%m', order_date)
                    )
                    SELECT month, revenue,
                           (revenue - LAG(revenue) OVER (ORDER BY month))
                             / LAG(revenue) OVER (ORDER BY month) * 100 AS whole_number_maths,
                           ROUND(100.0 * (revenue - LAG(revenue) OVER (ORDER BY month))
                                 / LAG(revenue) OVER (ORDER BY month), 1) AS growth_pct
                    FROM monthly
                    ORDER BY month;
                `,
                result: { columns: ['month', 'revenue', 'whole_number_maths', 'growth_pct'], rows: [['2024-01', 445, null, null], ['2024-02', 210, 0, -52.8], ['2024-03', 138, 0, -34.3]] },
            },
        },
    },
    'sql8-p8': {
        explain: {
            answer: 'ROW_NUMBER must give exactly one row number 1 per customer. If two orders share the earliest date, ordering by date alone leaves the tie unbroken, and the database may pick either one, and pick differently on another run or after an index changes. The answer looks fine but isn\'t repeatable.\n\nExample: if Priya had placed orders 101 and 111 both on 2024-01-06, `ORDER BY order_date` could return either as her first order. Adding `order_id` as a second sort key (`ORDER BY order_date, order_id`) makes 101 win every time.',
        },
        write: {
            answer: 'Number each customer\'s orders newest first, with order_id as the tiebreaker, and keep number 1. Zoe\'s latest (and only) order is still pending.',
            query: {
                sql: code`
                    WITH numbered AS (
                      SELECT customer_id, order_id, order_date, status,
                             ROW_NUMBER() OVER (
                               PARTITION BY customer_id
                               ORDER BY order_date DESC, order_id DESC
                             ) AS rn
                      FROM orders
                    )
                    SELECT c.name, n.order_id, n.order_date, n.status
                    FROM numbered n
                    JOIN customers c ON c.customer_id = n.customer_id
                    WHERE n.rn = 1
                    ORDER BY c.customer_id;
                `,
                result: { columns: ['name', 'order_id', 'order_date', 'status'], rows: [['Priya', 109, '2024-03-10', 'delivered'], ['Tom', 108, '2024-03-01', 'delivered'], ['Lena', 107, '2024-02-20', 'delivered'], ['Zoe', 110, '2024-03-16', 'pending']] },
            },
        },
        predict: {
            answer: 'Lena\'s first delivered order is 107 (20 February, £60), not the cancelled 106, so her days to first order become 21 instead of 13 (she signed up on 30 January).\n\nAnd Zoe disappears: her only order is pending, so she has no delivered orders to number.',
            query: {
                sql: code`
                    WITH numbered AS (
                      SELECT customer_id, order_id, order_date, amount,
                             ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn
                      FROM orders
                      WHERE status = 'delivered'
                    )
                    SELECT c.name, n.order_id, n.order_date, n.amount,
                           julianday(n.order_date) - julianday(c.signup_date) AS days_to_first_order
                    FROM numbered n
                    JOIN customers c ON c.customer_id = n.customer_id
                    WHERE n.rn = 1
                    ORDER BY c.customer_id;
                `,
                result: { columns: ['name', 'order_id', 'order_date', 'amount', 'days_to_first_order'], rows: [['Priya', 101, '2024-01-06', 120, 4], ['Tom', 104, '2024-01-21', 200, 1], ['Lena', 107, '2024-02-20', 60, 21]] },
            },
        },
        edge: {
            answer: 'Start from customers and LEFT JOIN the numbered orders. The `n.rn = 1` test must go in the ON: in the WHERE, it would be NULL for customers with no orders and would drop them again. Omar and the second Tom now appear with NULLs.',
            query: {
                sql: code`
                    WITH numbered AS (
                      SELECT customer_id, order_id, order_date, amount,
                             ROW_NUMBER() OVER (PARTITION BY customer_id ORDER BY order_date, order_id) AS rn
                      FROM orders
                    )
                    SELECT c.name, n.order_id, n.order_date, n.amount,
                           julianday(n.order_date) - julianday(c.signup_date) AS days_to_first_order
                    FROM customers c
                    LEFT JOIN numbered n ON n.customer_id = c.customer_id AND n.rn = 1
                    ORDER BY c.customer_id;
                `,
                result: { columns: ['name', 'order_id', 'order_date', 'amount', 'days_to_first_order'], rows: [['Priya', 101, '2024-01-06', 120, 4], ['Tom', 104, '2024-01-21', 200, 1], ['Lena', 106, '2024-02-12', null, 13], ['Omar', null, null, null, null], ['Zoe', 110, '2024-03-16', 33, 6], ['Tom', null, null, null, null]] },
            },
        },
    },
    'sql8-p9': {
        explain: {
            answer: 'Priya ordered on 6, 7 and 8 January, 2 February and 10 March. Number them 1 to 5 in date order, and subtract the number from the date:\n\n• 6 Jan − 1 = 5 Jan\n• 7 Jan − 2 = 5 Jan\n• 8 Jan − 3 = 5 Jan\n• 2 Feb − 4 = 29 Jan\n• 10 Mar − 5 = 5 Mar\n\nInside a streak, the date goes up by one day and the row number goes up by one, so their difference stays the same: 5 January for all three. A gap makes the date jump by more than one while the row number still only goes up by one, so the difference changes. That difference is a label for each island: group by it, and each group is one streak.',
        },
        write: {
            answer: 'Same trick, without PARTITION BY: take every distinct date on which anyone ordered, number them in order, and group by date minus row number. The longest run is 6 to 8 January (3 days, all Priya\'s). Every other order date stands alone.',
            query: {
                sql: code`
                    WITH days AS (
                      SELECT DISTINCT order_date
                      FROM orders
                    ),
                    labelled AS (
                      SELECT order_date,
                             julianday(order_date) - ROW_NUMBER() OVER (ORDER BY order_date) AS island
                      FROM days
                    )
                    SELECT MIN(order_date) AS run_start, MAX(order_date) AS run_end,
                           COUNT(*) AS days_in_a_row
                    FROM labelled
                    GROUP BY island
                    ORDER BY days_in_a_row DESC, run_start
                    LIMIT 1;
                `,
                result: { columns: ['run_start', 'run_end', 'days_in_a_row'], rows: [['2024-01-06', '2024-01-08', 3]] },
            },
        },
        predict: {
            answer: 'One streak for Priya, now 4 days long: 6 to 9 January. 9 January is row 4, and 9 Jan − 4 = 5 Jan, the same label as the other three, so it joins their island.',
            query: {
                sql: code`
                    INSERT INTO orders VALUES (111, 1, '2024-01-09', 10, 'delivered');
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
                result: { columns: ['name', 'streak_start', 'streak_end', 'days_in_a_row'], rows: [['Priya', '2024-01-06', '2024-01-09', 4]] },
            },
        },
        edge: {
            answer: 'With DISTINCT, the second order on 7 January collapses into the same day, so the dates are still 6, 7, 8 and the solution still reports one 3-day streak.\n\nWithout DISTINCT (below), the days are 6, 7, 7, 8 numbered 1 to 4. The labels become 5 Jan, 5 Jan, 4 Jan, 4 Jan: the repeated day pushes the row number ahead of the date, so the streak splits into two "2-day streaks" (6–7 and 7–8), and 7 January is counted twice. DISTINCT matters because the trick assumes one row per day.',
            query: {
                sql: code`
                    INSERT INTO orders VALUES (111, 1, '2024-01-07', 10, 'delivered');
                    WITH days AS (
                      SELECT customer_id, order_date
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
                    ORDER BY streak_start;
                `,
                result: { columns: ['name', 'streak_start', 'streak_end', 'days_in_a_row'], rows: [['Priya', '2024-01-06', '2024-01-07', 2], ['Priya', '2024-01-07', '2024-01-08', 2]] },
            },
        },
    },
    'sql8-p10': {
        explain: {
            answer: 'Order 102 has two item lines: product 4 (desk lamp) and product 5 (backpack). Joining order_items to itself on order_id pairs every line of the order with every line of the same order, 2 × 2 = 4 rows: (lamp, lamp), (lamp, backpack), (backpack, lamp), (backpack, backpack).\n\nTwo of those are a product paired with itself, and the other two are the same pair in both orders. `WHERE p1.product_name < p2.product_name` removes both problems at once: a name is never less than itself, and of (lamp, backpack) and (backpack, lamp) only one has the names in alphabetical order. One row is left: (Backpack, Desk lamp).',
            query: {
                sql: code`
                    SELECT a.order_id, a.product_id AS a_product, b.product_id AS b_product
                    FROM order_items a
                    JOIN order_items b ON b.order_id = a.order_id
                    WHERE a.order_id = 102
                    ORDER BY a.product_id, b.product_id;
                `,
                result: { columns: ['order_id', 'a_product', 'b_product'], rows: [[102, 4, 4], [102, 4, 5], [102, 5, 4], [102, 5, 5]] },
            },
        },
        write: {
            answer: 'Pair each product\'s item lines with the other lines of the same order (`b.product_id <> a.product_id`), and count distinct partners. LEFT JOINs keep the products with no partners: the headphones are often bought alone, and the phone case has never been bought at all.',
            query: {
                sql: code`
                    SELECT p.product_name, COUNT(DISTINCT b.product_id) AS bought_with
                    FROM products p
                    LEFT JOIN order_items a ON a.product_id = p.product_id
                    LEFT JOIN order_items b ON b.order_id = a.order_id AND b.product_id <> a.product_id
                    GROUP BY p.product_id, p.product_name
                    ORDER BY bought_with DESC, p.product_name;
                `,
                result: { columns: ['product_name', 'bought_with'], rows: [['Backpack', 2], ['Desk lamp', 2], ['Mug', 2], ['Notebook', 2], ['Headphones', 1], ['Pen', 1], ['Phone case', 0]] },
            },
        },
        predict: {
            answer: '24. Each order contributes (its number of item lines)², because every line is paired with every line of the same order, itself included. Orders 101, 104, 107 and 108 have 1 line each (1 row each); orders 102, 103, 105, 109 and 110 have 2 lines each (4 rows each). 4 × 1 + 5 × 4 = 24.',
            query: {
                sql: code`
                    SELECT COUNT(*) AS pairs_before_where
                    FROM order_items a
                    JOIN order_items b ON b.order_id = a.order_id;
                `,
                result: { columns: ['pairs_before_where'], rows: [[24]] },
            },
        },
        edge: {
            answer: 'Two separate problems, two fixes:\n\n• Self-pairs: compare product ids, not rows. `a.product_id < b.product_id` can never pair a product with itself, even if it appears on two rows of the order (two lines with the same product have equal ids, so `<` is false).\n• Double counting: the same pair would come out several times for one order (2 lines × 1 line = 2 rows). Count orders, not rows: `COUNT(DISTINCT a.order_id)`. Or remove the duplicates first, in a CTE: `SELECT DISTINCT order_id, product_id FROM order_items`, then self-join that.\n\nIn this database it can\'t happen, because the primary key (order_id, product_id) allows one row per product per order. But many real order tables have no such key.',
        },
    },
    'sql8-p11': {
        explain: {
            answer: 'pct_of_total is each product on its own: its revenue ÷ total revenue. The headphones bring in 440 of 793, so 55.5%. These add up to 100% across all rows.\n\ncumulative_pct is a running total: this product plus every product above it in the list, ÷ total revenue. It only grows as you go down: 55.5% after the headphones, 74.4% once the desk lamp is added, 89.5% after the backpack, and 100% at the last row. It answers "how much of revenue do the top N products bring in?", which is what the 80% question needs.',
        },
        write: {
            answer: 'Same structure, with customers instead of products: total each customer\'s spend, then divide by the grand total (empty OVER) and by the running total (ordered OVER). Priya alone is 53.6% of all spending, and Priya and Tom together are 88.3%.',
            query: {
                sql: code`
                    WITH customer_spend AS (
                      SELECT c.name, SUM(o.amount) AS spend
                      FROM orders o
                      JOIN customers c ON c.customer_id = o.customer_id
                      GROUP BY c.customer_id, c.name
                    )
                    SELECT name, spend,
                           ROUND(100.0 * spend / SUM(spend) OVER (), 1) AS pct_of_total,
                           ROUND(100.0 * SUM(spend) OVER (ORDER BY spend DESC ROWS UNBOUNDED PRECEDING)
                                 / SUM(spend) OVER (), 1) AS cumulative_pct
                    FROM customer_spend
                    ORDER BY spend DESC;
                `,
                result: { columns: ['name', 'spend', 'pct_of_total', 'cumulative_pct'], rows: [['Priya', 425, 53.6, 53.6], ['Tom', 275, 34.7, 88.3], ['Lena', 60, 7.6, 95.8], ['Zoe', 33, 4.2, 100]] },
            },
        },
        predict: {
            answer: 'Headphones, desk lamp, backpack and mug.\n\nThe first three only reach 89.5%, just short of 90%, so you need the mug too (it takes the total to 95.6%). The rule in the alternative query is "keep a product if the revenue before it was still under the target"; with 0.9 instead of 0.8, the mug passes (89.5% before it) and the notebook doesn\'t (95.6% before it).',
            query: {
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
                    WHERE revenue_before < 0.9 * (SELECT SUM(revenue) FROM product_revenue)
                    ORDER BY revenue DESC;
                `,
                result: { columns: ['product_name', 'revenue'], rows: [['Headphones', 440], ['Desk lamp', 150], ['Backpack', 120], ['Mug', 48]] },
            },
        },
        edge: {
            answer: 'Start from products with a LEFT JOIN, so the phone case has a row, and COALESCE its NULL revenue to 0. A zero adds nothing to any sum, so the totals and the running column are unchanged: the phone case sorts last, with 0% and a cumulative 100%.\n\nAdd product_name to both ORDER BYs (the window\'s and the query\'s). That way two products with equal revenue, such as several unsold ones at 0, always come out in the same order, and the running total doesn\'t depend on chance.',
            query: {
                sql: code`
                    WITH product_revenue AS (
                      SELECT p.product_name, COALESCE(SUM(oi.quantity * p.price), 0) AS revenue
                      FROM products p
                      LEFT JOIN order_items oi ON oi.product_id = p.product_id
                      GROUP BY p.product_name
                    )
                    SELECT product_name, revenue,
                           ROUND(100.0 * revenue / SUM(revenue) OVER (), 1) AS pct_of_total,
                           ROUND(100.0 * SUM(revenue) OVER (ORDER BY revenue DESC, product_name ROWS UNBOUNDED PRECEDING)
                                 / SUM(revenue) OVER (), 1) AS cumulative_pct
                    FROM product_revenue
                    ORDER BY revenue DESC, product_name;
                `,
                result: { columns: ['product_name', 'revenue', 'pct_of_total', 'cumulative_pct'], rows: [['Headphones', 440, 55.5, 55.5], ['Desk lamp', 150, 18.9, 74.4], ['Backpack', 120, 15.1, 89.5], ['Mug', 48, 6.1, 95.6], ['Notebook', 25, 3.2, 98.7], ['Pen', 10, 1.3, 100], ['Phone case', 0, 0, 100]] },
            },
        },
    },
    'sql8-p12': {
        explain: {
            answer: 'Because the question is about customers, not orders: "what share of customers came back?". Every customer must count exactly once.\n\nIf you worked on order rows instead, Priya, with 5 orders, would count five times and her habits would swamp everyone else\'s. So each customer is first reduced to one row with a single flag: 1 if they came back within 30 days, 0 if not (MAX over their orders turns "any qualifying order" into one 1). Then the rate is simple: the sum of the flags (customers who came back) ÷ the count of rows (customers).',
        },
        write: {
            answer: 'Change 30 to 7. Only Priya came back within a week (her second order was the next day). Lena\'s came 8 days later and Tom\'s 40 days later, and Zoe has only one order. 1 out of 4 is 25.0%.',
            query: {
                sql: code`
                    WITH firsts AS (
                      SELECT customer_id, MIN(order_date) AS first_date
                      FROM orders
                      GROUP BY customer_id
                    ),
                    flags AS (
                      SELECT f.customer_id,
                             MAX(CASE WHEN o.order_date > f.first_date
                                       AND julianday(o.order_date) - julianday(f.first_date) <= 7
                                      THEN 1 ELSE 0 END) AS came_back
                      FROM firsts f
                      JOIN orders o ON o.customer_id = f.customer_id
                      GROUP BY f.customer_id
                    )
                    SELECT COUNT(*) AS customers,
                           SUM(came_back) AS came_back_within_7_days,
                           ROUND(100.0 * SUM(came_back) / COUNT(*), 1) AS retention_pct
                    FROM flags;
                `,
                result: { columns: ['customers', 'came_back_within_7_days', 'retention_pct'], rows: [[4, 1, 25]] },
            },
        },
        predict: {
            answer: '75.0. Tom now counts as well: his second order (1 March) came 40 days after his first (21 January), inside 45 days but outside 30. With Priya and Lena, that is 3 of the 4 customers. Zoe still has only one order.',
            query: {
                sql: code`
                    WITH firsts AS (
                      SELECT customer_id, MIN(order_date) AS first_date
                      FROM orders
                      GROUP BY customer_id
                    ),
                    flags AS (
                      SELECT f.customer_id,
                             MAX(CASE WHEN o.order_date > f.first_date
                                       AND julianday(o.order_date) - julianday(f.first_date) <= 45
                                      THEN 1 ELSE 0 END) AS came_back
                      FROM firsts f
                      JOIN orders o ON o.customer_id = f.customer_id
                      GROUP BY f.customer_id
                    )
                    SELECT COUNT(*) AS customers,
                           SUM(came_back) AS came_back_within_45_days,
                           ROUND(100.0 * SUM(came_back) / COUNT(*), 1) AS retention_pct
                    FROM flags;
                `,
                result: { columns: ['customers', 'came_back_within_45_days', 'retention_pct'], rows: [[4, 3, 75]] },
            },
        },
        edge: {
            answer: 'Filter to delivered orders once, in a first CTE, and use it in both later steps, so the first order and the return visit are both delivered ones.\n\nWho changes:\n• Lena: her first order (106) was cancelled, so her first delivered order is 107, and she has none after it. She no longer came back.\n• Zoe: her only order is pending, so she has no delivered orders and drops out of the customers counted entirely.\n• Priya (came back) and Tom (didn\'t) are unchanged.\n\nThe rate becomes 1 of 3: 33.3%. The query below shows the flags per customer, to make the change visible.',
            query: {
                sql: code`
                    WITH delivered AS (
                      SELECT customer_id, order_date
                      FROM orders
                      WHERE status = 'delivered'
                    ),
                    firsts AS (
                      SELECT customer_id, MIN(order_date) AS first_date
                      FROM delivered
                      GROUP BY customer_id
                    ),
                    flags AS (
                      SELECT f.customer_id,
                             MAX(CASE WHEN d.order_date > f.first_date
                                       AND julianday(d.order_date) - julianday(f.first_date) <= 30
                                      THEN 1 ELSE 0 END) AS came_back
                      FROM firsts f
                      JOIN delivered d ON d.customer_id = f.customer_id
                      GROUP BY f.customer_id
                    )
                    SELECT c.name, fl.came_back
                    FROM flags fl
                    JOIN customers c ON c.customer_id = fl.customer_id
                    ORDER BY c.customer_id;
                `,
                result: { columns: ['name', 'came_back'], rows: [['Priya', 1], ['Tom', 0], ['Lena', 0]] },
            },
        },
    },
    'sql8-p13': {
        explain: {
            answer: 'Both use whole-number division, which drops the fraction.\n\n• Odd n, say 7: (7 + 1) / 2 = 4 and (7 + 2) / 2 = 9 / 2 = 4. Both point at row 4, the single middle row, and the average of one value is that value.\n• Even n, say 8: (8 + 1) / 2 = 9 / 2 = 4 and (8 + 2) / 2 = 5. They point at rows 4 and 5, the two middle rows, and AVG gives the halfway point between them, which is the median of an even list.\n\nSo one formula covers both cases, with no CASE needed.',
        },
        write: {
            answer: 'Filter the NULL out before numbering, so it neither takes a position nor counts in n. 9 amounts remain: 30, 33, 45, 60, 75, 80, 120, 150, 200. n is 9, so the median is row 5: 75.',
            query: {
                sql: code`
                    WITH ordered AS (
                      SELECT amount,
                             ROW_NUMBER() OVER (ORDER BY amount) AS rn,
                             COUNT(*) OVER () AS n
                      FROM orders
                      WHERE amount IS NOT NULL
                    )
                    SELECT AVG(amount) AS median_amount
                    FROM ordered
                    WHERE rn IN ((n + 1) / 2, (n + 2) / 2);
                `,
                result: { columns: ['median_amount'], rows: [[75]] },
            },
        },
        predict: {
            answer: '60,000. The 7 remaining salaries in order are 38,000, 45,000, 52,000, 60,000, 70,000, 70,000 and 80,000. n is odd, so the median is the 4th: Dara\'s 60,000. (With all 8 it was 65,000, the average of 60,000 and 70,000.)\n\nAsha can\'t simply be deleted below, because other employees\' manager_id points at her, so the query leaves her out with a WHERE instead.',
            query: {
                sql: code`
                    WITH ordered AS (
                      SELECT salary,
                             ROW_NUMBER() OVER (ORDER BY salary) AS rn,
                             COUNT(*) OVER () AS n
                      FROM employees
                      WHERE name <> 'Asha'
                    )
                    SELECT AVG(salary) AS median_salary
                    FROM ordered
                    WHERE rn IN ((n + 1) / 2, (n + 2) / 2);
                `,
                result: { columns: ['median_salary'], rows: [[60000]] },
            },
        },
        edge: {
            answer: 'The median comes out wrong, without any error. The NULL still gets a row number (SQLite sorts NULLs first, so it takes position 1) and is counted in n, so every real value is pushed one place along and the middle is picked at the wrong spot. If the NULL itself lands in the middle, AVG skips it and averages whatever else is there.\n\nThe salary column can\'t be NULL here, so the query below does it with order amounts, which have one NULL. With it, n is 10 and the middle rows are 60 and 75, giving 67.5; the true median of the 9 real amounts is 75. Always filter `WHERE x IS NOT NULL` first, as AVG and COUNT(column) do automatically.',
            query: {
                sql: code`
                    WITH ordered AS (
                      SELECT amount,
                             ROW_NUMBER() OVER (ORDER BY amount) AS rn,
                             COUNT(*) OVER () AS n
                      FROM orders
                    )
                    SELECT AVG(amount) AS median_with_the_null
                    FROM ordered
                    WHERE rn IN ((n + 1) / 2, (n + 2) / 2);
                `,
                result: { columns: ['median_with_the_null'], rows: [[67.5]] },
            },
        },
    },
    'sql8-p14': {
        explain: {
            answer: 'It turns "bought every product" into a double negative: "there is no Stationery product that this customer has not bought".\n\n• The outer NOT EXISTS goes through each Stationery product, looking for one this customer is missing.\n• The inner NOT EXISTS answers, for one product: "has this customer never bought it?" (no item line of theirs has that product).\n• If the search finds no missing product, the customer has bought them all, and they are kept.\n\nIt reads oddly, but it works without counting, and it handles products bought several times naturally.',
        },
        write: {
            answer: 'Change the category in both places. Nobody qualifies: Electronics has two products, the headphones and the phone case, and nobody has ever bought the phone case. Priya and Tom bought headphones, but one product out of two isn\'t "every product". An empty result is the right answer.',
            query: {
                sql: code`
                    SELECT c.name
                    FROM customers c
                    JOIN orders o       ON o.customer_id = c.customer_id
                    JOIN order_items oi ON oi.order_id = o.order_id
                    JOIN products p     ON p.product_id = oi.product_id
                    WHERE p.category = 'Electronics'
                    GROUP BY c.customer_id, c.name
                    HAVING COUNT(DISTINCT p.product_id) = (
                      SELECT COUNT(*) FROM products WHERE category = 'Electronics'
                    )
                    ORDER BY c.name;
                `,
                result: { columns: ['name'], rows: [] },
            },
        },
        predict: {
            answer: 'Priya and Tom. Stationery is the pen and the notebook. Priya already bought both; if Tom also bought one of each, he would have 2 distinct Stationery products too, matching the category\'s 2. Below, they are added to his order 104.',
            query: {
                sql: code`
                    INSERT INTO order_items VALUES (104, 1, 1), (104, 2, 1);
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
                result: { columns: ['name'], rows: [['Priya'], ['Tom']] },
            },
        },
        edge: {
            answer: 'Take a category with no products, such as \'Toys\'.\n\n• The COUNT version returns nobody. Its WHERE keeps only item lines in that category, and there are none, so there are no groups for HAVING to compare with 0.\n• The double NOT EXISTS version returns every customer (below). "Is there a Toys product this customer hasn\'t bought?" can never be yes when there are no Toys products, so every customer passes.\n\nLogically, the NOT EXISTS answer is the correct one: "bought every product in an empty set" is vacuously true, like "all my unicorns are pink". In practice, nobody wants that report, so the honest answer is to ask what the business wants for an empty category, and to handle it on purpose, for example by returning nothing when the category has no products.',
            query: {
                sql: code`
                    SELECT c.name
                    FROM customers c
                    WHERE NOT EXISTS (
                      SELECT 1
                      FROM products p
                      WHERE p.category = 'Toys'
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
                result: { columns: ['name'], rows: [['Lena'], ['Omar'], ['Priya'], ['Tom'], ['Tom'], ['Zoe']] },
            },
        },
    },
};
