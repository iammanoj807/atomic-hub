import type { SqlTopicAnswers } from '../sql';
import { code } from '../sqlCourse/code';

// Phase 2 · Summarising data. One good answer for each practice exercise.

export const sqlPhase2Answers: Record<string, SqlTopicAnswers> = {
    'sql2-t1': {
        explain: {
            answer: 'AVG skips NULLs. There are 10 orders, but order 106 has no amount, so only 9 amounts are averaged. The 9 known amounts add up to £793, and 793 ÷ 9 = 88.11.\n\n79.3 is 793 ÷ 10: it treats the missing amount as £0. That is a different question ("average per order, counting a missing amount as nothing"). If that is what you want, say so: `SUM(amount) * 1.0 / COUNT(*)`, or `AVG(COALESCE(amount, 0))`.',
            query: {
                sql: code`
                    SELECT COUNT(*) AS orders,
                           COUNT(amount) AS with_amount,
                           SUM(amount) AS total,
                           ROUND(AVG(amount), 2) AS avg_amount
                    FROM orders;
                `,
                result: { columns: ['orders', 'with_amount', 'total', 'avg_amount'], rows: [[10, 9, 793, 88.11]] },
            },
        },
        write: {
            answer: 'Four aggregates in one SELECT, with no GROUP BY, give one summary row for the whole table. ROUND keeps the average readable: 125 ÷ 7 = 17.857…',
            query: {
                sql: code`
                    SELECT COUNT(*) AS products,
                           MIN(price) AS cheapest,
                           MAX(price) AS dearest,
                           ROUND(AVG(price), 2) AS average_price
                    FROM products;
                `,
                result: { columns: ['products', 'cheapest', 'dearest', 'average_price'], rows: [[7, 2, 40, 17.86]] },
            },
        },
        predict: {
            answer: '6, 5 and 3.\n\n• `COUNT(*)` counts rows: 6 sign-ups.\n• `COUNT(city)` counts values that are not NULL: Zoe has no city, so 5.\n• `COUNT(DISTINCT city)` counts different cities: London, Leeds and Bristol, so 3. The NULL is not counted, and the two Londons and two Leeds count once each.',
            query: {
                sql: code`
                    SELECT COUNT(*), COUNT(city), COUNT(DISTINCT city)
                    FROM customers;
                `,
                result: { columns: ['COUNT(*)', 'COUNT(city)', 'COUNT(DISTINCT city)'], rows: [[6, 5, 3]] },
            },
        },
        edge: {
            answer: 'One row: NULL and 0.\n\nNo order is \'refunded\', so the aggregates see no rows. COUNT of nothing is 0. But SUM of nothing is NULL, not 0, because there is nothing to add up. (Without GROUP BY, an aggregate query always returns exactly one row, even when no rows match.)\n\nIf a report should show 0, write `COALESCE(SUM(amount), 0)`.',
            query: {
                sql: code`
                    SELECT SUM(amount), COUNT(*)
                    FROM orders
                    WHERE status = 'refunded';
                `,
                result: { columns: ['SUM(amount)', 'COUNT(*)'], rows: [[null, 0]] },
            },
        },
    },
    'sql2-t2': {
        explain: {
            answer: 'Every column in SELECT must either be in the GROUP BY, or be inside an aggregate.\n\n`SELECT dept_id, COUNT(*) FROM employees GROUP BY dept_id` is fine: one dept_id per group, and one count per group.\n\n`SELECT dept_id, name, COUNT(*) … GROUP BY dept_id` breaks the rule. Department 1 has four people (Asha, Ben, Chen and Hana), but the group has room for only one name. Which one? PostgreSQL, SQL Server and (by default) MySQL refuse the query. SQLite runs it and picks one name, which is worse: it looks like an answer but means nothing.\n\nFix it by grouping by name too, or by aggregating it, for example `MAX(name)` or `GROUP_CONCAT(name)`.',
        },
        write: {
            answer: 'Group by category and aggregate the rest. Electronics averages the £40 headphones and the £15 phone case: 27.5.',
            query: {
                sql: code`
                    SELECT category, COUNT(*) AS products, AVG(price) AS avg_price
                    FROM products
                    GROUP BY category
                    ORDER BY category;
                `,
                result: { columns: ['category', 'products', 'avg_price'], rows: [['Bags', 1, 30], ['Electronics', 2, 27.5], ['Home', 1, 25], ['Kitchen', 1, 8], ['Stationery', 2, 3.5]] },
            },
        },
        predict: {
            answer: '4 rows: Bristol, Leeds, London and one group for NULL. Leeds has 2: both of Tom\'s sign-ups. London also has 2 (Priya and Lena), Bristol 1 (Omar), and the NULL group 1 (Zoe).\n\nGROUP BY puts all the NULLs together in one group. (ORDER BY is added below so the order is fixed.)',
            query: {
                sql: code`
                    SELECT city, COUNT(*)
                    FROM customers
                    GROUP BY city
                    ORDER BY city;
                `,
                result: { columns: ['city', 'COUNT(*)'], rows: [[null, 1], ['Bristol', 1], ['Leeds', 2], ['London', 2]] },
            },
        },
        edge: {
            answer: 'SUM skips NULLs, but if every amount in a group is NULL, there is nothing to add and SUM returns NULL. Wrap it: `COALESCE(SUM(amount), 0)`.\n\nNo customer here has only NULL amounts (customer 3 has one NULL and one £60, so their total is 60). To see the COALESCE work, add `WHERE order_id = 106` and customer 3 shows 0.\n\nNote that Omar, who has no orders at all, is not in the result: he has no rows in orders to group. Showing him needs a LEFT JOIN from customers (Phase 3).',
            query: {
                sql: code`
                    SELECT customer_id, COALESCE(SUM(amount), 0) AS total_spend
                    FROM orders
                    GROUP BY customer_id
                    ORDER BY customer_id;
                `,
                result: { columns: ['customer_id', 'total_spend'], rows: [[1, 425], [2, 275], [3, 60], [5, 33]] },
            },
        },
    },
    'sql2-t3': {
        explain: {
            answer: 'At a football trial, WHERE is the check at the gate: each player is judged on their own (too young? go home) before any teams exist. HAVING comes after the teams are formed: it judges whole teams (fewer than 11 players? out of the tournament).\n\nWith orders: `WHERE status = \'delivered\'` throws out single orders that aren\'t delivered, before grouping. Then GROUP BY customer_id makes one group per customer, and `HAVING SUM(amount) >= 100` drops customers whose delivered total is under £100.\n\nWHERE can\'t use SUM or COUNT, because the groups don\'t exist yet. HAVING can, because it runs after GROUP BY.',
        },
        write: {
            answer: 'Group the orders per customer, count them, and keep the groups with 2 or more. That is a test on a group, so it goes in HAVING.',
            query: {
                sql: code`
                    SELECT customer_id, COUNT(*) AS orders
                    FROM orders
                    GROUP BY customer_id
                    HAVING COUNT(*) >= 2
                    ORDER BY customer_id;
                `,
                result: { columns: ['customer_id', 'orders'], rows: [[1, 5], [2, 2], [3, 2]] },
            },
        },
        predict: {
            answer: 'Only department 1.\n\nThe averages are: department 1, (95,000 + 70,000 + 70,000 + 80,000) ÷ 4 = 78,750; department 2, 52,500; department 3, 52,000; and the NULL group (Gus), 38,000. Only 78,750 is over 55,000.',
            query: {
                sql: code`
                    SELECT dept_id, AVG(salary)
                    FROM employees
                    GROUP BY dept_id
                    HAVING AVG(salary) > 55000;
                `,
                result: { columns: ['dept_id', 'AVG(salary)'], rows: [[1, 78750]] },
            },
        },
        edge: {
            answer: '`HAVING SUM(amount) > 50`: yes, customer 3 is kept. SUM skips the NULL, so their total is 60, and 60 > 50.\n\n`HAVING COUNT(amount) = COUNT(*)`: no, customer 3 is dropped. `COUNT(amount)` skips the NULL and gives 1, while `COUNT(*)` counts both rows and gives 2. 1 ≠ 2. This is a handy test for "every order in the group has an amount".\n\nThe query below shows both tests for every customer, as 1 (true) or 0 (false).',
            query: {
                sql: code`
                    SELECT customer_id,
                           SUM(amount) AS total,
                           COUNT(amount) AS with_amount,
                           COUNT(*) AS orders,
                           SUM(amount) > 50 AS sum_over_50,
                           COUNT(amount) = COUNT(*) AS all_known
                    FROM orders
                    GROUP BY customer_id
                    ORDER BY customer_id;
                `,
                result: { columns: ['customer_id', 'total', 'with_amount', 'orders', 'sum_over_50', 'all_known'], rows: [[1, 425, 5, 5, 1, 1], [2, 275, 2, 2, 1, 1], [3, 60, 1, 2, 1, 0], [5, 33, 1, 1, 0, 1]] },
            },
        },
    },
    'sql2-t4': {
        explain: {
            answer: 'The CASE runs once for every row and turns it into a number: 1 if the row matches, 0 if it doesn\'t. SUM then adds up those 1s and 0s. Every match adds 1 and every other row adds nothing, so the total is the number of matching rows.\n\nBecause each CASE is its own column, one query can count several different things at once, each with its own condition.',
        },
        write: {
            answer: 'Two SUM(CASE …) columns, one per condition, grouped by department. "60000 or more" is `>= 60000`, so Dara (exactly 60,000) counts in the first column.',
            query: {
                sql: code`
                    SELECT dept_id,
                           SUM(CASE WHEN salary >= 60000 THEN 1 ELSE 0 END) AS earn_60k_or_more,
                           SUM(CASE WHEN salary < 60000 THEN 1 ELSE 0 END) AS earn_less
                    FROM employees
                    GROUP BY dept_id
                    ORDER BY dept_id;
                `,
                result: { columns: ['dept_id', 'earn_60k_or_more', 'earn_less'], rows: [[null, 0, 1], [1, 4, 0], [2, 1, 1], [3, 0, 1]] },
            },
        },
        predict: {
            answer: '10, not 7.\n\nCOUNT counts every value that is not NULL. The CASE gives 1 or 0, and 0 is a real value, not NULL, so COUNT counts all 10 rows.\n\nTwo fixes: use SUM, which adds the 1s and 0s; or keep COUNT but drop the ELSE, so non-matching rows become NULL and are skipped. Both give 7.',
            query: {
                sql: code`
                    SELECT COUNT(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS counted,
                           COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS fixed_count,
                           SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) AS fixed_sum
                    FROM orders;
                `,
                result: { columns: ['counted', 'fixed_count', 'fixed_sum'], rows: [[10, 7, 7]] },
            },
        },
        edge: {
            answer: '1 cancelled order out of 10 is 10.0%. Start with 100.0, not 100, so the division is exact. With whole numbers the fraction is cut off: 1 out of 3 would show 33, not 33.3. (SQLite shows 10.0 as 10.)',
            query: {
                sql: code`
                    SELECT ROUND(100.0 * SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(*), 1) AS pct_cancelled
                    FROM orders;
                `,
                result: { columns: ['pct_cancelled'], rows: [[10]] },
            },
        },
    },
    'sql2-t5': {
        explain: {
            answer: 'FROM, WHERE, GROUP BY, HAVING, SELECT, DISTINCT, ORDER BY, LIMIT.\n\nWHERE runs second, straight after FROM, while the rows are still single rows. Groups are only made at step 3, so at the time WHERE runs there is no group for COUNT(*) to count. The database refuses: "misuse of aggregate".\n\nA test on a count belongs in HAVING, which runs after GROUP BY.',
            query: {
                sql: code`
                    SELECT customer_id
                    FROM orders
                    WHERE COUNT(*) > 1
                    GROUP BY customer_id;
                `,
                error: 'misuse of aggregate',
            },
        },
        write: {
            answer: 'HAVING repeats `AVG(price)`, because HAVING runs before SELECT, so the alias doesn\'t exist yet. (SQLite and MySQL let you use the alias there; PostgreSQL and SQL Server don\'t.) ORDER BY runs after SELECT, so the alias avg_price works there everywhere.',
            query: {
                sql: code`
                    SELECT category, AVG(price) AS avg_price
                    FROM products
                    GROUP BY category
                    HAVING AVG(price) > 10
                    ORDER BY avg_price DESC;
                `,
                result: { columns: ['category', 'avg_price'], rows: [['Bags', 30], ['Electronics', 27.5], ['Home', 25]] },
            },
        },
        predict: {
            answer: 'Department 2 disappears, and only department 1 is left, with the same average of 78,750.\n\n1. FROM: all 8 employees.\n2. WHERE salary > 50000: Eli (45,000) and Gus (38,000) are removed. 6 left.\n3. GROUP BY dept_id: department 1 has Asha, Ben, Chen and Hana; department 2 has only Dara; department 3 has only Fatima.\n4. HAVING COUNT(*) >= 2: only department 1 has 2 or more. With the old filter (> 40000), Eli stayed, so department 2 had 2 people and was kept.\n5. SELECT: department 1, average (95,000 + 70,000 + 70,000 + 80,000) ÷ 4 = 78,750.',
            query: {
                sql: code`
                    SELECT dept_id, AVG(salary) AS avg_salary
                    FROM employees
                    WHERE salary > 50000
                    GROUP BY dept_id
                    HAVING COUNT(*) >= 2
                    ORDER BY avg_salary DESC;
                `,
                result: { columns: ['dept_id', 'avg_salary'], rows: [[1, 78750]] },
            },
        },
        edge: {
            answer: 'WHERE runs before any grouping, one row at a time, so it can\'t use an aggregate. AVG needs all the rows at once, and WHERE only sees one. The database refuses with "misuse of aggregate function AVG()".\n\nWork the average out first, in its own query, and compare with that: a subquery. The company average is 510,000 ÷ 8 = 63,750. Four people are above it.',
            query: {
                sql: code`
                    SELECT name, salary
                    FROM employees
                    WHERE salary > (SELECT AVG(salary) FROM employees)
                    ORDER BY salary DESC, name;
                `,
                result: { columns: ['name', 'salary'], rows: [['Asha', 95000], ['Hana', 80000], ['Ben', 70000], ['Chen', 70000]] },
            },
        },
    },
};
