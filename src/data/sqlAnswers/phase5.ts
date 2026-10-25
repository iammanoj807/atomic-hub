import type { SqlTopicAnswers } from '../sql';
import { code } from '../sqlCourse/code';

// Phase 5 · Window functions. One good answer for each practice exercise.

export const sqlPhase5Answers: Record<string, SqlTopicAnswers> = {
    'sql5-t1': {
        explain: {
            answer: '`AVG(salary) … GROUP BY dept_id` squashes each department into one row: 8 employees in, 4 rows out (one per department, Gus\'s NULL included). The names are gone.\n\n`AVG(salary) OVER (PARTITION BY dept_id)` works out the same averages but keeps all 8 rows. Each employee gets their department\'s average written next to them, so you can compare: "Ben earns 70,000; his department averages 78,750".\n\nUse GROUP BY when you want one row per group, and a window function when you want every row plus a group figure.',
            query: {
                sql: code`
                    SELECT dept_id, AVG(salary) AS dept_avg
                    FROM employees
                    GROUP BY dept_id
                    ORDER BY dept_id;
                `,
                result: { columns: ['dept_id', 'dept_avg'], rows: [[null, 38000], [1, 78750], [2, 52500], [3, 52000]] },
            },
        },
        write: {
            answer: 'PARTITION BY customer_id makes one window per customer, and SUM adds up that customer\'s amounts. Every order keeps its own row. Order 106\'s NULL is skipped, so Lena\'s total is 60.',
            query: {
                sql: code`
                    SELECT order_id, customer_id, amount,
                           SUM(amount) OVER (PARTITION BY customer_id) AS customer_total
                    FROM orders
                    ORDER BY order_id;
                `,
                result: { columns: ['order_id', 'customer_id', 'amount', 'customer_total'], rows: [[101, 1, 120, 425], [102, 1, 80, 425], [103, 1, 45, 425], [104, 2, 200, 275], [105, 1, 150, 425], [106, 3, null, 60], [107, 3, 60, 60], [108, 2, 75, 275], [109, 1, 30, 425], [110, 5, 33, 33]] },
            },
        },
        predict: {
            answer: '8 rows, one per employee, each with 95,000 next to the name.\n\n`OVER ()` is an empty window: no PARTITION BY, so the window is the whole table, and the highest salary in the whole table is Asha\'s 95,000. A window function never removes rows. (The query has no ORDER BY, so add one if you want the names in a fixed order.)',
            query: {
                sql: code`
                    SELECT name, MAX(salary) OVER ()
                    FROM employees
                    ORDER BY emp_id;
                `,
                result: { columns: ['name', 'MAX(salary) OVER ()'], rows: [['Asha', 95000], ['Ben', 95000], ['Chen', 95000], ['Dara', 95000], ['Eli', 95000], ['Fatima', 95000], ['Gus', 95000], ['Hana', 95000]] },
            },
        },
        edge: {
            answer: '38,000: his own salary.\n\nPARTITION BY, like GROUP BY, puts all NULLs into one group. Gus is the only employee with a NULL dept_id, so he is alone in his window and the average of one salary is that salary.\n\nThat is technically right but can mislead: "no department" is not a real department. That is why the example filtered him out with `WHERE dept_id IS NOT NULL`.',
            query: {
                sql: code`
                    SELECT name, dept_id, salary,
                           AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg
                    FROM employees
                    ORDER BY dept_id, name;
                `,
                result: { columns: ['name', 'dept_id', 'salary', 'dept_avg'], rows: [['Gus', null, 38000, 38000], ['Asha', 1, 95000, 78750], ['Ben', 1, 70000, 78750], ['Chen', 1, 70000, 78750], ['Hana', 1, 80000, 78750], ['Dara', 2, 60000, 52500], ['Eli', 2, 45000, 52500], ['Fatima', 3, 52000, 52000]] },
            },
        },
    },
    'sql5-t2': {
        explain: {
            answer: 'Sorted by salary, highest first: Asha 95,000 (1st), Hana 80,000 (2nd), then Ben and Chen tie on 70,000, then Dara on 60,000.\n\nBoth functions give Ben and Chen the same number, 3. The difference is what comes next:\n• RANK skips: two people took places 3 and 4, so Dara is 5. Like a race: two runners share third, and the next one finishes fifth.\n• DENSE_RANK doesn\'t skip: Dara is 4, the next different salary.\n\nSo "the third-highest salary" is DENSE_RANK = 3, while "the person in fourth place" may not exist with RANK.',
        },
        write: {
            answer: 'Number the products inside each category from most to least expensive, then keep number 1. The CTE is needed because WHERE runs before window functions, so you can\'t filter on rn in the same query.\n\nROW_NUMBER always picks exactly one product, even if two tie on price. product_name is added to the ORDER BY so that pick is fixed, not random. To keep every tied product, use RANK instead.',
            query: {
                sql: code`
                    WITH ranked AS (
                      SELECT category, product_name, price,
                             ROW_NUMBER() OVER (PARTITION BY category ORDER BY price DESC, product_name) AS rn
                      FROM products
                    )
                    SELECT category, product_name, price
                    FROM ranked
                    WHERE rn = 1
                    ORDER BY category;
                `,
                result: { columns: ['category', 'product_name', 'price'], rows: [['Bags', 'Backpack', 30], ['Electronics', 'Headphones', 40], ['Home', 'Desk lamp', 25], ['Kitchen', 'Mug', 8], ['Stationery', 'Notebook', 5]] },
            },
        },
        predict: {
            answer: 'Rank 3: Ben and Chen, who tie on 70,000.\n\nRank 4: nobody. The tie used up places 3 and 4, so RANK jumps straight to 5 for Dara.',
            query: {
                sql: code`
                    SELECT name, salary, RANK() OVER (ORDER BY salary DESC) AS rank_num
                    FROM employees
                    ORDER BY salary DESC, name;
                `,
                result: { columns: ['name', 'salary', 'rank_num'], rows: [['Asha', 95000, 1], ['Hana', 80000, 2], ['Ben', 70000, 3], ['Chen', 70000, 3], ['Dara', 60000, 5], ['Fatima', 52000, 6], ['Eli', 45000, 7], ['Gus', 38000, 8]] },
            },
        },
        edge: {
            answer: 'Use ROW_NUMBER, which never gives two rows the same number, and add a tie-breaker to its ORDER BY so you decide which one wins: `ORDER BY order_date DESC, order_id DESC`. Here, if two orders shared the latest date, the one with the higher order_id (the one created later) comes back.\n\nWithout the tie-breaker, ROW_NUMBER still returns one row, but which one could change from run to run. RANK or DENSE_RANK would return both.\n\n(No customer here has two orders on the same day, so the tie-breaker changes nothing yet; it is there for when one does.)',
            query: {
                sql: code`
                    WITH numbered AS (
                      SELECT customer_id, order_id, order_date,
                             ROW_NUMBER() OVER (
                               PARTITION BY customer_id
                               ORDER BY order_date DESC, order_id DESC
                             ) AS rn
                      FROM orders
                    )
                    SELECT customer_id, order_id, order_date
                    FROM numbered
                    WHERE rn = 1
                    ORDER BY customer_id;
                `,
                result: { columns: ['customer_id', 'order_id', 'order_date'], rows: [[1, 109, '2024-03-10'], [2, 108, '2024-03-01'], [3, 107, '2024-02-20'], [5, 110, '2024-03-16']] },
            },
        },
    },
    'sql5-t3': {
        explain: {
            answer: 'NULL. LAG looks one row back inside the same partition, in the order given by OVER (… ORDER BY …). The first row of a partition has no row before it, so there is nothing to return. LAG never reaches into another partition: the first order of customer 2 doesn\'t see customer 1\'s last order.\n\nIf you want something else there, give a default as the third argument: `LAG(amount, 1, 0)` returns 0 for the first row.',
        },
        write: {
            answer: 'Keep Priya\'s orders, then take each amount minus LAG(amount) in date order. Her first order has nothing to compare with, so its change is NULL.\n\nThe WHERE runs before the window function, so LAG only ever sees Priya\'s orders. That is exactly what you want here.',
            query: {
                sql: code`
                    SELECT order_id, order_date, amount,
                           amount - LAG(amount) OVER (ORDER BY order_date) AS change_from_previous
                    FROM orders
                    WHERE customer_id = 1
                    ORDER BY order_date;
                `,
                result: { columns: ['order_id', 'order_date', 'amount', 'change_from_previous'], rows: [[101, '2024-01-06', 120, null], [102, '2024-01-07', 80, -40], [103, '2024-01-08', 45, -35], [105, '2024-02-02', 150, 105], [109, '2024-03-10', 30, -120]] },
            },
        },
        predict: {
            answer: 'Each month gets the next month\'s revenue: January 210 (February\'s), February 138 (March\'s), and March NULL, because there is no month after it. LEAD is LAG looking forward.',
            query: {
                sql: code`
                    WITH monthly AS (
                      SELECT strftime('%Y-%m', order_date) AS month, SUM(amount) AS revenue
                      FROM orders
                      GROUP BY strftime('%Y-%m', order_date)
                    )
                    SELECT month, revenue,
                           LEAD(revenue) OVER (ORDER BY month) AS next_revenue
                    FROM monthly
                    ORDER BY month;
                `,
                result: { columns: ['month', 'revenue', 'next_revenue'], rows: [['2024-01', 445, 210], ['2024-02', 210, 138], ['2024-03', 138, null]] },
            },
        },
        edge: {
            answer: 'January\'s revenue, 445. With no February orders, the monthly CTE has no February row at all. LAG just takes the row before, which is now January, so March is compared with January but labelled "previous month". No error, just a wrong comparison.\n\nFix it by making the list of months complete before using LAG. Generate every month (a recursive CTE, or a calendar table), LEFT JOIN the orders onto it, and COALESCE empty months to 0. Then February exists with 0, and March is compared with it.\n\nBelow, the two DELETEs remove February (its item lines first, because of the foreign key), and the fixed query still shows February.',
            query: {
                sql: code`
                    DELETE FROM order_items WHERE order_id IN (105, 107);
                    DELETE FROM orders WHERE order_date LIKE '2024-02%';

                    WITH RECURSIVE months(month) AS (
                      SELECT '2024-01'
                      UNION ALL
                      SELECT strftime('%Y-%m', date(month || '-01', '+1 month'))
                      FROM months
                      WHERE month < '2024-03'
                    ),
                    monthly AS (
                      SELECT m.month, COALESCE(SUM(o.amount), 0) AS revenue
                      FROM months m
                      LEFT JOIN orders o ON strftime('%Y-%m', o.order_date) = m.month
                      GROUP BY m.month
                    )
                    SELECT month, revenue,
                           LAG(revenue) OVER (ORDER BY month) AS prev_revenue
                    FROM monthly
                    ORDER BY month;
                `,
                result: { columns: ['month', 'revenue', 'prev_revenue'], rows: [['2024-01', 445, null], ['2024-02', 0, 445], ['2024-03', 138, 0]] },
            },
        },
    },
    'sql5-t4': {
        explain: {
            answer: 'When OVER has an ORDER BY but no frame, the default frame is RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW. RANGE works on values, not rows: it means "every row whose ORDER BY value is up to and including mine", and that includes rows that tie with me (my peers).\n\nBen and Chen both earn 70,000, so they are peers. For Ben, the frame already contains Chen, and for Chen it contains Ben. Both get the same total, 315,000 (95 + 80 + 70 + 70 thousand), instead of 245,000 then 315,000.\n\nTo count strictly one row at a time, say ROWS (`ROWS UNBOUNDED PRECEDING`) and add a tie-breaker to the ORDER BY, so the order of the tied rows is fixed.',
        },
        write: {
            answer: '`COUNT(*) OVER (ORDER BY hire_date)` counts the rows from the start up to this one. No two people were hired on the same day, so the RANGE default is fine here. If two could share a date, use ROW_NUMBER (or ROWS with a tie-breaker), or both would get the same count.',
            query: {
                sql: code`
                    SELECT name, hire_date,
                           COUNT(*) OVER (ORDER BY hire_date) AS hires_so_far
                    FROM employees
                    ORDER BY hire_date;
                `,
                result: { columns: ['name', 'hire_date', 'hires_so_far'], rows: [['Asha', '2019-03-01', 1], ['Dara', '2020-02-20', 2], ['Ben', '2020-06-15', 3], ['Chen', '2021-01-10', 4], ['Fatima', '2021-09-12', 5], ['Eli', '2022-07-01', 6], ['Hana', '2022-11-30', 7], ['Gus', '2023-04-03', 8]] },
            },
        },
        predict: {
            answer: '81.7. The frame is the row before, this row and the row after: 120 (6 Jan), 80 (7 Jan) and 45 (8 Jan). (120 + 80 + 45) ÷ 3 = 81.67, rounded to 81.7. This is a centred average rather than a trailing one.\n\nNote 2024-02-12, order 106: its amount is NULL, and AVG skips it, so that row averages only its two neighbours: (150 + 60) ÷ 2 = 105.',
            query: {
                sql: code`
                    SELECT order_date, amount,
                           ROUND(AVG(amount) OVER (
                             ORDER BY order_date ROWS BETWEEN 1 PRECEDING AND 1 FOLLOWING
                           ), 1) AS centred_avg_3
                    FROM orders
                    ORDER BY order_date;
                `,
                result: { columns: ['order_date', 'amount', 'centred_avg_3'], rows: [['2024-01-06', 120, 100], ['2024-01-07', 80, 81.7], ['2024-01-08', 45, 108.3], ['2024-01-21', 200, 131.7], ['2024-02-02', 150, 175], ['2024-02-12', null, 105], ['2024-02-20', 60, 67.5], ['2024-03-01', 75, 55], ['2024-03-10', 30, 46], ['2024-03-16', 33, 31.5]] },
            },
        },
        edge: {
            answer: 'Lena\'s first order (106) has a NULL amount, and a SUM over nothing but a NULL is NULL. The COALESCE goes around the whole window function, outside the OVER: `COALESCE(SUM(amount) OVER (…), 0)`. It only steps in when the running total itself is NULL.\n\n`SUM(COALESCE(amount, 0)) OVER (…)` also works here. It turns each missing amount into 0 before adding. The difference shows only in meaning: the first says "no total yet, show 0"; the second says "a missing amount counts as £0".\n\nPutting a COALESCE inside the OVER brackets wouldn\'t help: what is in there only decides which rows are in each window and in what order, not the values that are added up.',
            query: {
                sql: code`
                    SELECT customer_id, order_date, amount,
                           COALESCE(SUM(amount) OVER (PARTITION BY customer_id ORDER BY order_date), 0) AS customer_running_total
                    FROM orders
                    WHERE customer_id IN (1, 3)
                    ORDER BY customer_id, order_date;
                `,
                result: { columns: ['customer_id', 'order_date', 'amount', 'customer_running_total'], rows: [[1, '2024-01-06', 120, 120], [1, '2024-01-07', 80, 200], [1, '2024-01-08', 45, 245], [1, '2024-02-02', 150, 395], [1, '2024-03-10', 30, 425], [3, '2024-02-12', null, 0], [3, '2024-02-20', 60, 60]] },
            },
        },
    },
    'sql5-t5': {
        explain: {
            answer: '`OVER ()` is an empty window. There is no PARTITION BY, so every row is in one big window: the whole result. There is no ORDER BY, so there is no running frame: the window is always all of it. SUM of the same rows is the same number, so every row gets the grand total.\n\nThat is exactly what share of total needs: each row divided by the same grand total.',
        },
        write: {
            answer: 'First add up each customer (the CTE), then divide each total by the sum of all totals. Multiply by 100.0, not 100, so the division keeps its decimals.\n\nThe rounded shares add up to 100.1, not 100. That is normal when you round each part.',
            query: {
                sql: code`
                    WITH per_customer AS (
                      SELECT customer_id, SUM(amount) AS total
                      FROM orders
                      GROUP BY customer_id
                    )
                    SELECT c.name, p.total,
                           ROUND(100.0 * p.total / SUM(p.total) OVER (), 1) AS pct_of_all
                    FROM per_customer p
                    JOIN customers c ON c.customer_id = p.customer_id
                    ORDER BY p.total DESC;
                `,
                result: { columns: ['name', 'total', 'pct_of_all'], rows: [['Priya', 425, 53.6], ['Tom', 275, 34.7], ['Lena', 60, 7.6], ['Zoe', 33, 4.2]] },
            },
        },
        predict: {
            answer: '8 rows into 3 buckets don\'t divide evenly, so the first buckets get the extra rows: sizes 3, 3 and 2.\n\n• Bucket 1: Asha, Hana, Ben.\n• Bucket 2: Chen, Dara, Fatima.\n• Bucket 3: Eli, Gus.\n\nNotice Ben and Chen earn the same but land in different buckets. NTILE cuts by position, not by value; the name in the ORDER BY decides which side of the cut each one lands on.',
            query: {
                sql: code`
                    SELECT name, salary, NTILE(3) OVER (ORDER BY salary DESC, name) AS bucket
                    FROM employees
                    ORDER BY salary DESC, name;
                `,
                result: { columns: ['name', 'salary', 'bucket'], rows: [['Asha', 95000, 1], ['Hana', 80000, 1], ['Ben', 70000, 1], ['Chen', 70000, 2], ['Dara', 60000, 2], ['Fatima', 52000, 2], ['Eli', 45000, 3], ['Gus', 38000, 3]] },
            },
        },
        edge: {
            answer: 'Sort each department from highest to lowest salary, so the lowest earner is the last row. Then set the frame to the whole partition: `ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING`.\n\nWithout that frame, the default ends at the current row, so on each row "the last row of the window" is the current row: every person is named as their own lowest earner.\n\nIn department 1, Ben and Chen tie for lowest. The name in the ORDER BY makes Chen the last row, so the tie is broken the same way every time.',
            query: {
                sql: code`
                    SELECT dept_id, name, salary,
                           LAST_VALUE(name) OVER (
                             PARTITION BY dept_id
                             ORDER BY salary DESC, name
                             ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING
                           ) AS lowest_earner
                    FROM employees
                    WHERE dept_id IS NOT NULL
                    ORDER BY dept_id, salary DESC, name;
                `,
                result: { columns: ['dept_id', 'name', 'salary', 'lowest_earner'], rows: [[1, 'Asha', 95000, 'Chen'], [1, 'Hana', 80000, 'Chen'], [1, 'Ben', 70000, 'Chen'], [1, 'Chen', 70000, 'Chen'], [2, 'Dara', 60000, 'Eli'], [2, 'Eli', 45000, 'Eli'], [3, 'Fatima', 52000, 'Fatima']] },
            },
        },
    },
};
