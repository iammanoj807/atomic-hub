import type { SqlTopicAnswers } from '../sql';
import { code } from '../sqlCourse/code';

// Phase 1 · Reading data. One good answer for each practice exercise.

export const sqlPhase1Answers: Record<string, SqlTopicAnswers> = {
    'sql1-t1': {
        explain: {
            answer: 'FROM says which table to read: `FROM employees` means "look at the employees sheet".\n\nSELECT says which columns to give back, and in what order: `SELECT name, salary` returns just those two, even though the table has six. It can also work things out, such as `salary + 5000`.\n\nAS gives a column a new name in the result: `salary + 5000 AS after_raise`. Without it, the column would be called "salary + 5000". AS only renames the result; the table itself does not change.',
        },
        write: {
            answer: 'Work out the new column in SELECT and name it with AS. Every product comes back, because there is no WHERE.',
            query: {
                sql: code`
                    SELECT product_name, price, price * 3 AS price_for_three
                    FROM products
                    ORDER BY product_id;
                `,
                result: { columns: ['product_name', 'price', 'price_for_three'], rows: [['Pen', 2, 6], ['Notebook', 5, 15], ['Mug', 8, 24], ['Desk lamp', 25, 75], ['Backpack', 30, 90], ['Headphones', 40, 120], ['Phone case', 15, 45]] },
            },
        },
        predict: {
            answer: '8 rows and 2 columns. There is no WHERE, so you get one row per employee. SELECT returns exactly what you list, and you listed name twice, so both columns are the same name. Asking for a column twice is allowed; it is just pointless.',
            query: {
                sql: code`
                    SELECT name, name
                    FROM employees
                    ORDER BY emp_id;
                `,
                result: { columns: ['name', 'name'], rows: [['Asha', 'Asha'], ['Ben', 'Ben'], ['Chen', 'Chen'], ['Dara', 'Dara'], ['Eli', 'Eli'], ['Fatima', 'Fatima'], ['Gus', 'Gus'], ['Hana', 'Hana']] },
            },
        },
        edge: {
            answer: 'NULL. NULL means "unknown", and unknown plus 5000 is still unknown. There is no error and no 5000: the NULL quietly spreads through the sum.\n\nIf a missing salary should count as 0, say so: `COALESCE(salary, 0) + 5000`.',
            query: {
                sql: code`
                    SELECT NULL + 5000;
                `,
                result: { columns: ['NULL + 5000'], rows: [[null]] },
            },
        },
    },
    'sql1-t2': {
        explain: {
            answer: 'AND needs both conditions to be true. OR needs at least one.\n\n`WHERE status = \'delivered\' AND amount > 100` returns orders that are both delivered and over £100: just 101 and 104.\n\n`WHERE status = \'delivered\' OR amount > 100` returns orders that are either: all 7 delivered orders, plus 105, which is only shipped but is over £100. That makes 8.\n\nSo AND makes the result smaller, and OR makes it bigger.',
        },
        write: {
            answer: '"At least £75" includes £75, so use `>=`. Order 108 is exactly £75; with `>` it would be missed.',
            query: {
                sql: code`
                    SELECT order_id, amount
                    FROM orders
                    WHERE status = 'delivered' AND amount >= 75
                    ORDER BY order_id;
                `,
                result: { columns: ['order_id', 'amount'], rows: [[101, 120], [102, 80], [104, 200], [108, 75]] },
            },
        },
        predict: {
            answer: 'Dara, Eli and Fatima. Gus is not in the list.\n\nGus\'s dept_id is NULL. `dept_id = 1` is unknown for him, and NOT unknown is still unknown, not true. WHERE keeps only true rows, so he is dropped. To include him, add `OR dept_id IS NULL`.',
            query: {
                sql: code`
                    SELECT name
                    FROM employees
                    WHERE NOT dept_id = 1
                    ORDER BY name;
                `,
                result: { columns: ['name'], rows: [['Dara'], ['Eli'], ['Fatima']] },
            },
        },
        edge: {
            answer: 'Add brackets around the OR: `WHERE (status = \'shipped\' OR status = \'pending\') AND amount > 40`.\n\nAND is worked out before OR, so the original really meant "shipped (any amount), or pending and over £40".\n\nHere both versions return only order 105. That is luck: the only shipped order is £150, and the only pending one (110) is £33. If a shipped order were £20, the original would wrongly include it. The brackets make the query say what you mean, whatever the data.',
            query: {
                sql: code`
                    SELECT order_id, status, amount
                    FROM orders
                    WHERE (status = 'shipped' OR status = 'pending') AND amount > 40
                    ORDER BY order_id;
                `,
                result: { columns: ['order_id', 'status', 'amount'], rows: [[105, 'shipped', 150]] },
            },
        },
    },
    'sql1-t3': {
        explain: {
            answer: '% means "any number of characters, including none". `LIKE \'P%\'` matches anything starting with P: Pen and Phone case.\n\n_ means "exactly one character". `LIKE \'_en\'` matches three-letter words ending in "en": Pen, but not "Phone case" or "en".\n\nWithout % or _, LIKE is just an exact match. In SQLite, LIKE ignores upper and lower case for plain English letters; in PostgreSQL it doesn\'t (use ILIKE there).',
            query: {
                sql: code`
                    SELECT product_name
                    FROM products
                    WHERE product_name LIKE '_en' OR product_name LIKE 'P%'
                    ORDER BY product_name;
                `,
                result: { columns: ['product_name'], rows: [['Pen'], ['Phone case']] },
            },
        },
        write: {
            answer: 'BETWEEN includes both ends, so run from the first day of 2020 to the last day of 2021. Dates stored as YYYY-MM-DD text compare correctly as text.',
            query: {
                sql: code`
                    SELECT name, hire_date
                    FROM employees
                    WHERE hire_date BETWEEN '2020-01-01' AND '2021-12-31'
                    ORDER BY hire_date;
                `,
                result: { columns: ['name', 'hire_date'], rows: [['Dara', '2020-02-20'], ['Ben', '2020-06-15'], ['Chen', '2021-01-10'], ['Fatima', '2021-09-12']] },
            },
        },
        predict: {
            answer: 'Headphones, Notebook and Phone case: every name with an "o" anywhere in it. %o% means "anything, then an o, then anything". Pen, Mug, Desk lamp and Backpack have no o.',
            query: {
                sql: code`
                    SELECT product_name
                    FROM products
                    WHERE product_name LIKE '%o%'
                    ORDER BY product_name;
                `,
                result: { columns: ['product_name'], rows: [['Headphones'], ['Notebook'], ['Phone case']] },
            },
        },
        edge: {
            answer: 'Neither returns it.\n\n`NULL BETWEEN 0 AND 1000` is unknown, because you can\'t say whether an unknown number is in the range. `NOT BETWEEN` is NOT unknown, which is still unknown. WHERE keeps only rows where the condition is true, so order 106 falls through both.\n\nThat means "in range" plus "not in range" does not add up to every row when there are NULLs. The query below shows both tests for customer 3\'s orders.',
            query: {
                sql: code`
                    SELECT order_id, amount,
                           amount BETWEEN 0 AND 1000 AS in_range,
                           amount NOT BETWEEN 0 AND 1000 AS out_of_range
                    FROM orders
                    WHERE customer_id = 3
                    ORDER BY order_id;
                `,
                result: { columns: ['order_id', 'amount', 'in_range', 'out_of_range'], rows: [[106, null, null, null], [107, 60, 1, 0]] },
            },
        },
    },
    'sql1-t4': {
        explain: {
            answer: 'In SQL a condition can be true, false or unknown. That is three-valued logic. Any comparison with NULL is unknown, because you can\'t compare against a value nobody knows.\n\n`WHERE manager_id = NULL` asks "is manager_id equal to unknown?" for each row. The answer is unknown every time, even for Asha, whose manager_id really is NULL. WHERE keeps only rows that are true, so no rows come back.\n\nTo find missing values, ask a different question: `WHERE manager_id IS NULL`. IS NULL is always true or false, never unknown.',
        },
        write: {
            answer: 'Use IS NULL, never `= NULL`. Only Zoe has no city.',
            query: {
                sql: code`
                    SELECT name, city
                    FROM customers
                    WHERE city IS NULL;
                `,
                result: { columns: ['name', 'city'], rows: [['Zoe', null]] },
            },
        },
        predict: {
            answer: 'NULL, 1 (true), NULL, 7.\n\n• `NULL = NULL`: two unknowns can\'t be called equal, so it is unknown: NULL.\n• `NULL IS NULL`: true, which SQLite shows as 1.\n• `5 + NULL`: any sum with NULL is NULL.\n• `COALESCE(NULL, NULL, 7)`: the first value that is not NULL, which is 7.',
            query: {
                sql: code`
                    SELECT NULL = NULL, NULL IS NULL, 5 + NULL, COALESCE(NULL, NULL, 7);
                `,
                result: { columns: ['NULL = NULL', 'NULL IS NULL', '5 + NULL', 'COALESCE(NULL, NULL, 7)'], rows: [[null, 1, null, 7]] },
            },
        },
        edge: {
            answer: '`dept_id <> 1` alone misses Gus, because `NULL <> 1` is unknown. Add the NULL case on purpose with `OR dept_id IS NULL`.\n\nOther ways that also work: `COALESCE(dept_id, 0) <> 1`, or `dept_id IS NOT 1` in SQLite (`IS DISTINCT FROM 1` in PostgreSQL).',
            query: {
                sql: code`
                    SELECT name, dept_id
                    FROM employees
                    WHERE dept_id <> 1 OR dept_id IS NULL
                    ORDER BY name;
                `,
                result: { columns: ['name', 'dept_id'], rows: [['Dara', 2], ['Eli', 2], ['Fatima', 3], ['Gus', null]] },
            },
        },
    },
    'sql1-t5': {
        explain: {
            answer: 'Because of a tie. Asha (95,000) and Hana (80,000) are first and second, and Ben and Chen both earn 70,000, so they share third place.\n\n`ORDER BY salary DESC LIMIT 3` must cut one of them, and which one depends on the tie-breaker. With no tie-breaker it is whichever the database happens to return first. Either way you leave out someone who is just as highly paid.\n\nSo first ask: should ties be included? If yes, the answer has 4 people. Use RANK or DENSE_RANK (Phase 5), or `WHERE salary >= ` the third-highest salary. If no, say how you break the tie, for example `ORDER BY salary DESC, name`.',
        },
        write: {
            answer: 'Sort from most expensive and keep 2. The next product is the £25 desk lamp, so there is no tie to worry about here (but always check for one).',
            query: {
                sql: code`
                    SELECT product_name, price
                    FROM products
                    ORDER BY price DESC
                    LIMIT 2;
                `,
                result: { columns: ['product_name', 'price'], rows: [['Headphones', 40], ['Backpack', 30]] },
            },
        },
        predict: {
            answer: 'Gus, then Hana: the two most recent hires. DESC puts the latest date first. Gus joined on 2023-04-03 and Hana on 2022-11-30. Dates in YYYY-MM-DD form sort correctly even though they are text.',
            query: {
                sql: code`
                    SELECT name, hire_date
                    FROM employees
                    ORDER BY hire_date DESC
                    LIMIT 2;
                `,
                result: { columns: ['name', 'hire_date'], rows: [['Gus', '2023-04-03'], ['Hana', '2022-11-30']] },
            },
        },
        edge: {
            answer: 'SQLite puts NULLs first when sorting A to Z, so Zoe would come first. Sort by "is the city missing?" first: `city IS NULL` is 0 for a real city and 1 for NULL, so the missing one goes last.\n\nSQLite and PostgreSQL also accept `ORDER BY city NULLS LAST, name`, which gives the same rows. The `IS NULL` trick also works in MySQL, which has no NULLS LAST.',
            query: {
                sql: code`
                    SELECT name, city
                    FROM customers
                    ORDER BY city IS NULL, city, name;
                `,
                result: { columns: ['name', 'city'], rows: [['Omar', 'Bristol'], ['Tom', 'Leeds'], ['Tom', 'Leeds'], ['Lena', 'London'], ['Priya', 'London'], ['Zoe', null]] },
            },
        },
    },
    'sql1-t6': {
        explain: {
            answer: 'DISTINCT removes a row only when every selected column matches another row. Tom has two sign-ups, with customer_id 2 and 6. So the rows are (2, Tom) and (6, Tom): the names match, but the ids don\'t, so they are different rows and both stay.\n\nDrop customer_id and select just name, and the two Toms become one.',
        },
        write: {
            answer: 'orders has one row per order, so customer 1 appears five times. DISTINCT keeps each id once. Customers 4 (Omar) and 6 (the second Tom) never ordered, so they are not in orders at all.',
            query: {
                sql: code`
                    SELECT DISTINCT customer_id
                    FROM orders
                    ORDER BY customer_id;
                `,
                result: { columns: ['customer_id'], rows: [[1], [2], [3], [5]] },
            },
        },
        predict: {
            answer: '4 rows: cancelled, delivered, pending and shipped. There are 10 orders but only four different statuses. (ORDER BY is added below so the order is fixed.)',
            query: {
                sql: code`
                    SELECT DISTINCT status
                    FROM orders
                    ORDER BY status;
                `,
                result: { columns: ['status'], rows: [['cancelled'], ['delivered'], ['pending'], ['shipped']] },
            },
        },
        edge: {
            answer: '4 rows: 1, 2, 3 and NULL. Yes, the NULL counts.\n\nDISTINCT treats all NULLs as one group, even though `NULL = NULL` is not true in a WHERE. Gus\'s missing department gives one NULL row. Department 4 (HR) is not in the list, because nobody works there.',
            query: {
                sql: code`
                    SELECT DISTINCT dept_id
                    FROM employees
                    ORDER BY dept_id;
                `,
                result: { columns: ['dept_id'], rows: [[null], [1], [2], [3]] },
            },
        },
    },
    'sql1-t7': {
        explain: {
            answer: 'CASE checks the WHEN lines from top to bottom and stops at the first one that is true. So the most specific test must come first.\n\nThe right order is `WHEN salary >= 80000 THEN \'high\'`, then `WHEN salary >= 50000 THEN \'medium\'`, then ELSE \'low\'.\n\nSwap the first two lines and Asha (95,000) meets `>= 50000` first. That is true, so she becomes \'medium\', and the \'high\' line is never reached for anyone. The query below has the lines swapped: nobody is high.',
            query: {
                sql: code`
                    SELECT name, salary,
                           CASE
                             WHEN salary >= 50000 THEN 'medium'
                             WHEN salary >= 80000 THEN 'high'
                             ELSE 'low'
                           END AS band
                    FROM employees
                    ORDER BY salary DESC, name;
                `,
                result: { columns: ['name', 'salary', 'band'], rows: [['Asha', 95000, 'medium'], ['Hana', 80000, 'medium'], ['Ben', 70000, 'medium'], ['Chen', 70000, 'medium'], ['Dara', 60000, 'medium'], ['Fatima', 52000, 'medium'], ['Eli', 45000, 'low'], ['Gus', 38000, 'low']] },
            },
        },
        write: {
            answer: 'Test the cheapest band first; then each line only needs an upper limit. "Under £10" is `< 10`, and "£10 to £29" is `< 30` once the first line has taken the cheap ones.',
            query: {
                sql: code`
                    SELECT product_name, price,
                           CASE
                             WHEN price < 10 THEN 'cheap'
                             WHEN price < 30 THEN 'mid'
                             ELSE 'premium'
                           END AS price_band
                    FROM products
                    ORDER BY price;
                `,
                result: { columns: ['product_name', 'price', 'price_band'], rows: [['Pen', 2, 'cheap'], ['Notebook', 5, 'cheap'], ['Mug', 8, 'cheap'], ['Phone case', 15, 'mid'], ['Desk lamp', 25, 'mid'], ['Backpack', 30, 'premium'], ['Headphones', 40, 'premium']] },
            },
        },
        predict: {
            answer: 'Tom (customer 2) has two orders, 104 and 108. Both are delivered, so both are \'closed\'.',
            query: {
                sql: code`
                    SELECT order_id, status,
                           CASE status
                             WHEN 'delivered' THEN 'closed'
                             WHEN 'cancelled' THEN 'closed'
                             ELSE 'open'
                           END AS state
                    FROM orders
                    WHERE customer_id = 2
                    ORDER BY order_id;
                `,
                result: { columns: ['order_id', 'status', 'state'], rows: [[104, 'delivered', 'closed'], [108, 'delivered', 'closed']] },
            },
        },
        edge: {
            answer: 'Test for NULL first. If you don\'t, `NULL > 100` is unknown, not true, so order 106 falls through to ELSE and is wrongly labelled \'small\'.',
            query: {
                sql: code`
                    SELECT order_id, amount,
                           CASE
                             WHEN amount IS NULL THEN 'unknown'
                             WHEN amount > 100 THEN 'big'
                             ELSE 'small'
                           END AS size
                    FROM orders
                    ORDER BY order_id;
                `,
                result: { columns: ['order_id', 'amount', 'size'], rows: [[101, 120, 'big'], [102, 80, 'small'], [103, 45, 'small'], [104, 200, 'big'], [105, 150, 'big'], [106, null, 'unknown'], [107, 60, 'small'], [108, 75, 'small'], [109, 30, 'small'], [110, 33, 'small']] },
            },
        },
    },
    'sql1-t8': {
        explain: {
            answer: 'A row function such as UPPER works on one value from one row and gives one value back. 8 employees in, 8 rows out, each with its own upper-case name.\n\nAn aggregate such as SUM reads a whole column across many rows and gives back one value for the group. 8 salaries in, one total out. The rows collapse.\n\nThat is why you can write `SELECT name, UPPER(name)`, but not `SELECT name, SUM(salary)` without GROUP BY: one name per row can\'t sit next to one total for all rows.',
        },
        write: {
            answer: '`INSTR(email, \'@\')` finds where the @ is. Take the characters from position 1 up to one before it. For priya@mail.com the @ is at position 6, so take 5 characters.',
            query: {
                sql: code`
                    SELECT name, email, SUBSTR(email, 1, INSTR(email, '@') - 1) AS username
                    FROM customers
                    ORDER BY customer_id;
                `,
                result: { columns: ['name', 'email', 'username'], rows: [['Priya', 'priya@mail.com', 'priya'], ['Tom', 'tom@mail.com', 'tom'], ['Lena', 'lena@mail.com', 'lena'], ['Omar', 'omar@mail.com', 'omar'], ['Zoe', 'zoe@mail.com', 'zoe'], ['Tom', 'tom@mail.com', 'tom']] },
            },
        },
        predict: {
            answer: '\'phone\', 3 and 2.7.\n\n• `SUBSTR(\'Headphones\', 5, 5)`: start at character 5 (counting from 1: H-e-a-d-p, so it starts at the p) and take 5 characters: "phone".\n• `TRIM` removes the spaces at both ends, leaving "Pen", which has 3 letters.\n• `ROUND(2.675, 1)` keeps one decimal place: 2.7.',
            query: {
                sql: code`
                    SELECT SUBSTR('Headphones', 5, 5), LENGTH(TRIM('  Pen  ')), ROUND(2.675, 1);
                `,
                result: { columns: ['SUBSTR(\'Headphones\', 5, 5)', 'LENGTH(TRIM(\'  Pen  \'))', 'ROUND(2.675, 1)'], rows: [['phone', 3, 2.7]] },
            },
        },
        edge: {
            answer: 'Subtract the julianday numbers: each date becomes a count of days, so the difference is days between. Asha had been there 1,767 days by 1 January 2024.\n\nIf either date is NULL, julianday gives NULL, and the subtraction gives NULL for that row. There is no error, just a blank. Decide what you want: drop those rows with `WHERE hire_date IS NOT NULL`, or show a default with COALESCE. (In SQLite, `SELECT julianday(\'2024-01-01\') - julianday(NULL);` returns NULL.)',
            query: {
                sql: code`
                    SELECT name, hire_date,
                           julianday('2024-01-01') - julianday(hire_date) AS days_to_2024
                    FROM employees
                    ORDER BY emp_id;
                `,
                result: { columns: ['name', 'hire_date', 'days_to_2024'], rows: [['Asha', '2019-03-01', 1767], ['Ben', '2020-06-15', 1295], ['Chen', '2021-01-10', 1086], ['Dara', '2020-02-20', 1411], ['Eli', '2022-07-01', 549], ['Fatima', '2021-09-12', 841], ['Gus', '2023-04-03', 273], ['Hana', '2022-11-30', 397]] },
            },
        },
    },
};
