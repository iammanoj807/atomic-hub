import type { SqlTopicAnswers } from '../sql';
import { code } from '../sqlCourse/code';

// Phase 3 · Joins. One good answer for each practice exercise.

export const sqlPhase3Answers: Record<string, SqlTopicAnswers> = {
    'sql3-t1': {
        explain: {
            answer: 'INNER JOIN pairs each employee with the department whose dept_id matches theirs, and keeps only the pairs where `ON d.dept_id = e.dept_id` is true.\n\nGus: his dept_id is NULL. NULL equals nothing, not even another NULL, so he matches no department and is dropped.\n\nHR: it is department 4, and no employee has dept_id 4. It matches no employee, so it is dropped too.\n\nSo INNER JOIN quietly loses rows from both sides that have no partner. You get 7 rows, not 8 employees or 4 departments. If you need the unmatched rows, use a LEFT (or FULL) JOIN.',
        },
        write: {
            answer: 'Start from order_items, since that is where the quantity is, and join products to swap product_id for a name. Order 105 has 1 backpack and 3 headphones: 30 + 3 × 40 = £150, its amount.',
            query: {
                sql: code`
                    SELECT oi.order_id, p.product_name, oi.quantity
                    FROM order_items oi
                    JOIN products p ON p.product_id = oi.product_id
                    WHERE oi.order_id = 105
                    ORDER BY p.product_name;
                `,
                result: { columns: ['order_id', 'product_name', 'quantity'], rows: [[105, 'Backpack', 1], [105, 'Headphones', 3]] },
            },
        },
        predict: {
            answer: '10 rows, one per order. Every order has exactly one customer: customer_id is NOT NULL and points at a real customer. So each order finds one partner, and none is lost or repeated.\n\nOmar and the second Tom have no orders, so they don\'t appear, but that doesn\'t change the count: you start from orders. (It also returns 10 columns, 5 from each table, so the check below just counts.)',
            query: {
                sql: code`
                    SELECT COUNT(*) AS joined_rows
                    FROM orders o
                    JOIN customers c ON c.customer_id = o.customer_id;
                `,
                result: { columns: ['joined_rows'], rows: [[10]] },
            },
        },
        edge: {
            answer: 'Asha vanishes. 7 rows come back, not 8.\n\nThe join looks for the row m whose emp_id equals e\'s manager_id. Asha\'s manager_id is NULL, so no row matches her, and an INNER JOIN drops rows with no match. To keep her, with NULL as her manager, use LEFT JOIN.\n\n(The aliases employee and manager are added below, because both columns would otherwise be called name.)',
            query: {
                sql: code`
                    SELECT e.name AS employee, m.name AS manager
                    FROM employees e
                    JOIN employees m ON m.emp_id = e.manager_id
                    ORDER BY e.emp_id;
                `,
                result: { columns: ['employee', 'manager'], rows: [['Ben', 'Asha'], ['Chen', 'Asha'], ['Dara', 'Asha'], ['Eli', 'Dara'], ['Fatima', 'Asha'], ['Gus', 'Dara'], ['Hana', 'Ben']] },
            },
        },
    },
    'sql3-t2': {
        explain: {
            answer: 'A LEFT JOIN promises to keep every row of the left table, here departments, whether or not it finds a match. HR has no employees, so it gets one row with NULL in every employee column.\n\nAn INNER JOIN keeps only pairs that match. HR has nobody to pair with, so it is dropped.\n\nThat is why "show every department, even empty ones" needs LEFT JOIN, with departments on the left.',
        },
        write: {
            answer: 'Products on the left, so every product stays. SUM of no rows is NULL, so wrap it in COALESCE to show 0 for the phone case.',
            query: {
                sql: code`
                    SELECT p.product_name, COALESCE(SUM(oi.quantity), 0) AS total_sold
                    FROM products p
                    LEFT JOIN order_items oi ON oi.product_id = p.product_id
                    GROUP BY p.product_id, p.product_name
                    ORDER BY p.product_id;
                `,
                result: { columns: ['product_name', 'total_sold'], rows: [['Pen', 5], ['Notebook', 5], ['Mug', 6], ['Desk lamp', 6], ['Backpack', 4], ['Headphones', 11], ['Phone case', 0]] },
            },
        },
        predict: {
            answer: '12 rows. Each customer appears once per order: Priya 5, Tom (id 2) 2, Lena 2, Zoe 1. That is 10. Customers with no orders still get one row each, with NULLs: Omar and the second Tom (id 6). 10 + 2 = 12.\n\nThe query below shows just three columns so it fits on screen.',
            query: {
                sql: code`
                    SELECT c.customer_id, c.name, o.order_id
                    FROM customers c
                    LEFT JOIN orders o ON o.customer_id = c.customer_id
                    ORDER BY c.customer_id, o.order_id;
                `,
                result: { columns: ['customer_id', 'name', 'order_id'], rows: [[1, 'Priya', 101], [1, 'Priya', 102], [1, 'Priya', 103], [1, 'Priya', 105], [1, 'Priya', 109], [2, 'Tom', 104], [2, 'Tom', 108], [3, 'Lena', 106], [3, 'Lena', 107], [4, 'Omar', null], [5, 'Zoe', 110], [6, 'Tom', null]] },
            },
        },
        edge: {
            answer: 'HR changes from 0 to 1. The other departments stay the same.\n\nThe LEFT JOIN gives HR one row, with NULLs in the employee columns. `COUNT(*)` counts rows, so it counts that row: 1. `COUNT(e.emp_id)` counts only values that are not NULL, and HR\'s emp_id is NULL: 0.\n\nAfter a LEFT JOIN, count a column from the right-hand table (ideally its key), not `*`.',
            query: {
                sql: code`
                    SELECT d.dept_name, COUNT(e.emp_id) AS count_emp_id, COUNT(*) AS count_star
                    FROM departments d
                    LEFT JOIN employees e ON e.dept_id = d.dept_id
                    GROUP BY d.dept_id, d.dept_name
                    ORDER BY d.dept_id;
                `,
                result: { columns: ['dept_name', 'count_emp_id', 'count_star'], rows: [['Engineering', 4, 4], ['Sales', 2, 2], ['Marketing', 1, 1], ['HR', 0, 1]] },
            },
        },
    },
    'sql3-t3': {
        explain: {
            answer: '1. LEFT JOIN, then keep the rows with no match: `LEFT JOIN orders o ON o.customer_id = c.customer_id WHERE o.order_id IS NULL`. Unmatched rows get NULLs in every right-hand column, so you keep just those.\n2. NOT EXISTS: `WHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)`. Keep the row if the subquery finds nothing.\n\nThe IS NULL column matters because NULL can mean two things: "no match" or "matched, but this value is empty". Test a column that is never NULL in a real match: the right table\'s primary key, or the column you joined on. If you test amount instead, Lena\'s order 106 (which has no amount) looks like "no order", and Lena wrongly appears.',
        },
        write: {
            answer: 'Departments on the left. A department with no employees gets NULL in e.emp_id, and emp_id is the primary key, so it is never NULL for a real employee. Only HR is left.',
            query: {
                sql: code`
                    SELECT d.dept_id, d.dept_name
                    FROM departments d
                    LEFT JOIN employees e ON e.dept_id = d.dept_id
                    WHERE e.emp_id IS NULL
                    ORDER BY d.dept_id;
                `,
                result: { columns: ['dept_id', 'dept_name'], rows: [[4, 'HR']] },
            },
        },
        predict: {
            answer: 'Lena, Omar and the second Tom (id 6), instead of just Omar and Tom.\n\nOmar and Tom have no orders, so their order columns are NULL, amount included. Lena does have orders, but one of them, 106, has a NULL amount, so that row passes the test too. A NULL amount can mean "no order" or "an order with no amount", and this test can\'t tell them apart. That is why you test the key.',
            query: {
                sql: code`
                    SELECT c.customer_id, c.name
                    FROM customers c
                    LEFT JOIN orders o ON o.customer_id = c.customer_id
                    WHERE o.amount IS NULL
                    ORDER BY c.customer_id;
                `,
                result: { columns: ['customer_id', 'name'], rows: [[3, 'Lena'], [4, 'Omar'], [6, 'Tom']] },
            },
        },
        edge: {
            answer: 'It returns no rows at all, even though HR has no employees.\n\nThe subquery returns every employee\'s dept_id, and Gus\'s is NULL. So for HR the test is `4 NOT IN (1, 1, 1, 2, 2, 3, NULL, 1)`, which means "4 <> 1 AND … AND 4 <> NULL". `4 <> NULL` is unknown, and anything AND unknown can\'t be true, so HR is not kept. One NULL in the list makes NOT IN fail for every row.\n\nFix it with NOT EXISTS, which doesn\'t have this trap, or keep NOT IN but add `WHERE dept_id IS NOT NULL` inside the subquery.',
            query: {
                sql: code`
                    SELECT dept_name
                    FROM departments d
                    WHERE NOT EXISTS (
                      SELECT 1 FROM employees e WHERE e.dept_id = d.dept_id
                    )
                    ORDER BY dept_name;
                `,
                result: { columns: ['dept_name'], rows: [['HR']] },
            },
        },
    },
    'sql3-t4': {
        explain: {
            answer: 'Read the employees table twice, as two copies: e for the employee, m for the manager. `m.emp_id = e.manager_id` says: "for this employee e, find the row in m whose id is the number written in e\'s manager_id".\n\nFor Hana, manager_id is 2, so the match is the row with emp_id 2: Ben. So m.name is her manager\'s name.',
        },
        write: {
            answer: 'Join once to get the manager (m), then join again from the manager to their manager (mm). Use LEFT JOINs so people at the top still show, with NULLs: Asha has no manager, and the people under Asha have no manager\'s manager.',
            query: {
                sql: code`
                    SELECT e.name AS employee, m.name AS manager, mm.name AS managers_manager
                    FROM employees e
                    LEFT JOIN employees m  ON m.emp_id = e.manager_id
                    LEFT JOIN employees mm ON mm.emp_id = m.manager_id
                    ORDER BY e.emp_id;
                `,
                result: { columns: ['employee', 'manager', 'managers_manager'], rows: [['Asha', null, null], ['Ben', 'Asha', null], ['Chen', 'Asha', null], ['Dara', 'Asha', null], ['Eli', 'Dara', 'Asha'], ['Fatima', 'Asha', null], ['Gus', 'Dara', 'Asha'], ['Hana', 'Ben', 'Asha']] },
            },
        },
        predict: {
            answer: '7 rows instead of 8. Asha is missing: her manager_id is NULL, so she has no matching manager row, and an INNER JOIN drops her.',
            query: {
                sql: code`
                    SELECT e.name AS employee, m.name AS manager
                    FROM employees e
                    JOIN employees m ON m.emp_id = e.manager_id
                    ORDER BY e.emp_id;
                `,
                result: { columns: ['employee', 'manager'], rows: [['Ben', 'Asha'], ['Chen', 'Asha'], ['Dara', 'Asha'], ['Eli', 'Dara'], ['Fatima', 'Asha'], ['Gus', 'Dara'], ['Hana', 'Ben']] },
            },
        },
        edge: {
            answer: 'Join each employee to their manager, then compare the two hire dates: `WHERE e.hire_date < m.hire_date`.\n\nIn this data the answer is nobody: no rows. Every manager joined before the people under them. (Asha joined in 2019, Dara and Ben in 2020, and everyone they manage later.) An empty result is a real answer; don\'t "fix" the query until it returns something.\n\nAsha has no manager. The INNER JOIN drops her before the WHERE runs. With a LEFT JOIN she would reach the WHERE, but `e.hire_date < NULL` is unknown, so she would be dropped anyway. Either way, she is never counted as "hired before her manager", which is right.',
            query: {
                sql: code`
                    SELECT e.name, e.hire_date, m.name AS manager, m.hire_date AS manager_hired
                    FROM employees e
                    JOIN employees m ON m.emp_id = e.manager_id
                    WHERE e.hire_date < m.hire_date
                    ORDER BY e.name;
                `,
                result: { columns: ['name', 'hire_date', 'manager', 'manager_hired'], rows: [] },
            },
        },
    },
    'sql3-t5': {
        explain: {
            answer: 'Count the rows after each step:\n\n1. orders: 10 rows.\n2. JOIN customers: still 10. Each order has exactly one customer, so nothing is added or lost.\n3. JOIN order_items: 14. Each order is repeated once per item line (order 102 has two lines, so it now appears twice), and order 106, which has no items, is dropped.\n4. JOIN products: still 14. Each item line has exactly one product.\n5. WHERE order_date < \'2024-01-22\': 6 rows, the item lines of orders 101 to 104.\n\nThe rule: joining to the "one" side keeps the count; joining to the "many" side multiplies it; an INNER JOIN with no match removes rows.',
            query: {
                sql: code`
                    SELECT (SELECT COUNT(*) FROM orders) AS orders_only,
                           (SELECT COUNT(*) FROM orders o
                              JOIN order_items oi ON oi.order_id = o.order_id) AS with_items,
                           (SELECT COUNT(*) FROM orders o
                              JOIN order_items oi ON oi.order_id = o.order_id
                              WHERE o.order_date < '2024-01-22') AS after_where;
                `,
                result: { columns: ['orders_only', 'with_items', 'after_where'], rows: [[10, 14, 6]] },
            },
        },
        write: {
            answer: 'Walk the keys from customers to orders to order_items to products, keep Priya, then group by product and add up the quantities. Mug, Notebook and Pen tie on 5, so the name breaks the tie.',
            query: {
                sql: code`
                    SELECT p.product_name, SUM(oi.quantity) AS total_quantity
                    FROM customers c
                    JOIN orders o       ON o.customer_id = c.customer_id
                    JOIN order_items oi ON oi.order_id = o.order_id
                    JOIN products p     ON p.product_id = oi.product_id
                    WHERE c.name = 'Priya'
                    GROUP BY p.product_id, p.product_name
                    ORDER BY total_quantity DESC, p.product_name;
                `,
                result: { columns: ['product_name', 'total_quantity'], rows: [['Headphones', 6], ['Mug', 5], ['Notebook', 5], ['Pen', 5], ['Backpack', 2], ['Desk lamp', 2]] },
            },
        },
        predict: {
            answer: '14 rows: one per item line, not one per order. They cover 9 of the 10 orders. Order 106 is missing, because it has no items, so the INNER JOIN finds nothing to pair it with.',
            query: {
                sql: code`
                    SELECT COUNT(*) AS item_rows, COUNT(DISTINCT o.order_id) AS orders
                    FROM orders o
                    JOIN order_items oi ON oi.order_id = o.order_id;
                `,
                result: { columns: ['item_rows', 'orders'], rows: [[14, 9]] },
            },
        },
        edge: {
            answer: 'Make the join to order_items a LEFT JOIN, and the join after it (products) a LEFT JOIN too. If products stayed an INNER JOIN, order 106\'s NULL product_id would match no product, and the row would be dropped again. Once a chain goes LEFT, every join after it must stay LEFT.\n\nThe full query returns 15 rows (14 item lines plus 106). The WHERE below only keeps the result short enough to read; delete it to see all 15.',
            query: {
                sql: code`
                    SELECT o.order_id, c.name AS customer, p.product_name, oi.quantity
                    FROM orders o
                    JOIN customers c         ON c.customer_id = o.customer_id
                    LEFT JOIN order_items oi ON oi.order_id = o.order_id
                    LEFT JOIN products p     ON p.product_id = oi.product_id
                    WHERE o.order_date >= '2024-02-01'
                    ORDER BY o.order_id, p.product_name;
                `,
                result: { columns: ['order_id', 'customer', 'product_name', 'quantity'], rows: [[105, 'Priya', 'Backpack', 1], [105, 'Priya', 'Headphones', 3], [106, 'Lena', null, null], [107, 'Lena', 'Backpack', 2], [108, 'Tom', 'Desk lamp', 3], [109, 'Priya', 'Notebook', 4], [109, 'Priya', 'Pen', 5], [110, 'Zoe', 'Desk lamp', 1], [110, 'Zoe', 'Mug', 1]] },
            },
        },
    },
    'sql3-t6': {
        explain: {
            answer: 'Use LEFT JOIN when one table is the main list and you only care about its unmatched rows: "every department, even empty ones".\n\nUse FULL OUTER JOIN when unmatched rows on both sides matter: "everything in either list, and show me what doesn\'t line up". With employees and departments it shows Gus (no department) and HR (no employees) in the same result. In real work it is for comparing two sources, such as payments against invoices, or yesterday\'s file against today\'s: missing on the left, missing on the right, and matched.\n\n(MySQL has no FULL OUTER JOIN; you write a LEFT JOIN and a RIGHT JOIN and UNION them.)',
        },
        write: {
            answer: 'Make the grid first: every category CROSS JOIN every status. Then LEFT JOIN the real numbers onto it, worked out in a subquery (items sold per category and status), and COALESCE the gaps to 0.\n\nThe full grid is 5 categories × 4 statuses = 20 cells. The WHERE below keeps two categories so the result fits on screen; delete it to see all 20. Every \'cancelled\' cell is 0, because the only cancelled order, 106, has no items.',
            query: {
                sql: code`
                    SELECT cat.category, st.status, COALESCE(s.items, 0) AS items_sold
                    FROM (SELECT DISTINCT category FROM products) AS cat
                    CROSS JOIN (SELECT DISTINCT status FROM orders) AS st
                    LEFT JOIN (
                      SELECT p.category, o.status, SUM(oi.quantity) AS items
                      FROM order_items oi
                      JOIN products p ON p.product_id = oi.product_id
                      JOIN orders o   ON o.order_id = oi.order_id
                      GROUP BY p.category, o.status
                    ) AS s ON s.category = cat.category AND s.status = st.status
                    WHERE cat.category IN ('Electronics', 'Home')
                    ORDER BY cat.category, st.status;
                `,
                result: { columns: ['category', 'status', 'items_sold'], rows: [['Electronics', 'cancelled', 0], ['Electronics', 'delivered', 8], ['Electronics', 'pending', 0], ['Electronics', 'shipped', 3], ['Home', 'cancelled', 0], ['Home', 'delivered', 5], ['Home', 'pending', 1], ['Home', 'shipped', 0]] },
            },
        },
        predict: {
            answer: '24 rows: every one of the 6 customers paired with every one of the 4 departments, 6 × 4. A CROSS JOIN has no ON, so nothing is matched and nothing is dropped. (It also has 8 columns, so the check below just counts.)',
            query: {
                sql: code`
                    SELECT COUNT(*) AS pairs
                    FROM customers
                    CROSS JOIN departments;
                `,
                result: { columns: ['pairs'], rows: [[24]] },
            },
        },
        edge: {
            answer: 'Gus disappears, because he earns 38,000. HR disappears too, even though the filter is about salaries.\n\nHR\'s row has no employee, so e.salary is NULL there. `NULL > 40000` is unknown, and WHERE drops anything that isn\'t true. The same happens to every row a FULL or LEFT JOIN filled with NULLs: a WHERE on the other table\'s columns removes them, and the outer join quietly becomes an inner join.\n\nTo keep HR, filter the employees before the join (in a subquery, or in the ON), or allow the empty side: `WHERE e.salary > 40000 OR e.emp_id IS NULL`.',
            query: {
                sql: code`
                    SELECT e.name, d.dept_name
                    FROM employees e
                    FULL OUTER JOIN departments d ON d.dept_id = e.dept_id
                    WHERE e.salary > 40000
                    ORDER BY d.dept_id, e.name;
                `,
                result: { columns: ['name', 'dept_name'], rows: [['Asha', 'Engineering'], ['Ben', 'Engineering'], ['Chen', 'Engineering'], ['Hana', 'Engineering'], ['Dara', 'Sales'], ['Eli', 'Sales'], ['Fatima', 'Marketing']] },
            },
        },
    },
    'sql3-t7': {
        explain: {
            answer: 'Order 102 is worth £80 and has two item lines (the lamp and the backpack). Join orders to order_items and order 102 becomes two rows, both carrying amount 80. `SUM(o.amount)` then adds £80 twice: £160 for one £80 order. That repeating is fan-out: the "one" side is copied once per row on the "many" side.\n\nTwo ways to avoid it:\n1. Aggregate the many side first, down to one row per order (`GROUP BY order_id` in a subquery), and then join. Now it is one-to-one again.\n2. Don\'t join a table you don\'t need for that number. Sum the amounts from orders alone. Or use the right level: the item lines\' own `quantity * price`. For counts, `COUNT(DISTINCT o.order_id)` also works; for sums it doesn\'t.',
            query: {
                sql: code`
                    SELECT o.order_id, o.amount, oi.product_id
                    FROM orders o
                    JOIN order_items oi ON oi.order_id = o.order_id
                    WHERE o.order_id = 102
                    ORDER BY oi.product_id;
                `,
                result: { columns: ['order_id', 'amount', 'product_id'], rows: [[102, 80, 4], [102, 80, 5]] },
            },
        },
        write: {
            answer: 'After joining items, each order appears once per item line, so `COUNT(o.order_id)` would count item lines. `COUNT(DISTINCT o.order_id)` counts each order once. `COUNT(oi.order_id)` counts item lines, and skips the NULLs from orders with none (106) and customers with none.\n\nLEFT JOINs keep Omar and the second Tom with 0 and 0. Lena has 2 orders but only 1 item line, because 106 is empty.',
            query: {
                sql: code`
                    SELECT c.customer_id, c.name,
                           COUNT(DISTINCT o.order_id) AS orders,
                           COUNT(oi.order_id) AS item_lines
                    FROM customers c
                    LEFT JOIN orders o       ON o.customer_id = c.customer_id
                    LEFT JOIN order_items oi ON oi.order_id = o.order_id
                    GROUP BY c.customer_id, c.name
                    ORDER BY c.customer_id;
                `,
                result: { columns: ['customer_id', 'name', 'orders', 'item_lines'], rows: [[1, 'Priya', 5, 9], [2, 'Tom', 2, 2], [3, 'Lena', 2, 1], [4, 'Omar', 0, 0], [5, 'Zoe', 1, 2], [6, 'Tom', 0, 0]] },
            },
        },
        predict: {
            answer: '14 and 9. The join makes one row per item line (14). Those rows cover 9 different orders: every order except 106, which has no items. The gap between the two numbers is exactly the fan-out.',
            query: {
                sql: code`
                    SELECT COUNT(*), COUNT(DISTINCT o.order_id)
                    FROM orders o
                    JOIN order_items oi ON oi.order_id = o.order_id;
                `,
                result: { columns: ['COUNT(*)', 'COUNT(DISTINCT o.order_id)'], rows: [[14, 9]] },
            },
        },
        edge: {
            answer: 'The salary condition must go in the ON, not the WHERE.\n\nIn the ON, it decides which employees count as a match. Departments with no high earners still keep their row (with NULLs), and `COUNT(e.emp_id)` gives them 0.\n\nIn the WHERE, it runs after the join, and the NULL rows fail `e.salary > 60000`. Sales, Marketing and HR vanish, and you get only Engineering. (Dara earns exactly 60,000, so Sales really is 0.)',
            query: {
                sql: code`
                    SELECT d.dept_name, COUNT(e.emp_id) AS over_60k
                    FROM departments d
                    LEFT JOIN employees e ON e.dept_id = d.dept_id AND e.salary > 60000
                    GROUP BY d.dept_id, d.dept_name
                    ORDER BY d.dept_id;
                `,
                result: { columns: ['dept_name', 'over_60k'], rows: [['Engineering', 4], ['Sales', 0], ['Marketing', 0], ['HR', 0]] },
            },
        },
    },
};
