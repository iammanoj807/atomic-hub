import type { SqlTopicAnswers } from '../sql';
import { code } from '../sqlCourse/code';

// Phase 0 · Start here. One good answer for each practice exercise.

export const sqlPhase0Answers: Record<string, SqlTopicAnswers> = {
    'sql0-t1': {
        explain: {
            answer: 'A table is one sheet in a spreadsheet. The employees table is a sheet with one line per person.\n\nA row is one line: one employee, such as Asha with her id, department, manager, salary and hire date.\n\nA column is one heading, one fact that every row has: name, salary, hire_date.\n\nA query is a question you write down in SQL, such as "give me the name and salary of everyone in department 1". You don\'t scroll and filter by hand like in Excel: you send the question, and the database sends back just the rows and columns you asked for.',
        },
        write: {
            answer: 'Pick the two columns, name the table, keep department 2, and sort. Dara and Eli are the two people in Sales.',
            query: {
                sql: code`
                    SELECT name, hire_date
                    FROM employees
                    WHERE dept_id = 2
                    ORDER BY name;
                `,
                result: { columns: ['name', 'hire_date'], rows: [['Dara', '2020-02-20'], ['Eli', '2022-07-01']] },
            },
        },
        predict: {
            answer: '4 rows: Asha (95,000), Ben (70,000), Chen (70,000) and Hana (80,000).\n\nDara earns exactly 60,000, and `>` means strictly more than, so she is left out. Use `>=` to include her.\n\nThe query has no ORDER BY, so the database may return the 4 names in any order. The query below adds ORDER BY name and the salary, so you can check.',
            query: {
                sql: code`
                    SELECT name, salary
                    FROM employees
                    WHERE salary > 60000
                    ORDER BY name;
                `,
                result: { columns: ['name', 'salary'], rows: [['Asha', 95000], ['Ben', 70000], ['Chen', 70000], ['Hana', 80000]] },
            },
        },
        edge: {
            answer: 'With `WHERE dept_id = 1`: no. Gus\'s dept_id is NULL (unknown), and `NULL = 1` is not true, it is unknown. WHERE keeps only rows where the condition is true, so Gus is dropped.\n\nWith no WHERE at all: yes. Nothing filters the rows, so all 8 employees come back, Gus included.\n\nThe query below shows the test for every row. Gus gets NULL, not 0 (false): that is why he is in neither "department 1" nor "not department 1".',
            query: {
                sql: code`
                    SELECT name, dept_id, dept_id = 1 AS in_dept_1
                    FROM employees
                    ORDER BY emp_id;
                `,
                result: { columns: ['name', 'dept_id', 'in_dept_1'], rows: [['Asha', 1, 1], ['Ben', 1, 1], ['Chen', 1, 1], ['Dara', 2, 0], ['Eli', 2, 0], ['Fatima', 3, 0], ['Gus', null, null], ['Hana', 1, 1]] },
            },
        },
    },
    'sql0-t2': {
        explain: {
            answer: 'One row of order_items is one line on a receipt: "order X contains this many of product Y". For example, (102, 4, 2) means order 102 contains 2 of product 4, the desk lamp.\n\norder_id points to a row in orders (who bought it, when, the total). product_id points to a row in products (its name and price). So order_items is the link between the two: one order can hold many products, and one product can appear in many orders.',
        },
        write: {
            answer: '`SELECT *` means every column. ORDER BY customer_id puts them in id order, so you can see the two Tom rows (2 and 6) and Zoe\'s missing city.',
            query: {
                sql: code`
                    SELECT *
                    FROM customers
                    ORDER BY customer_id;
                `,
                result: { columns: ['customer_id', 'name', 'email', 'city', 'signup_date'], rows: [[1, 'Priya', 'priya@mail.com', 'London', '2024-01-02'], [2, 'Tom', 'tom@mail.com', 'Leeds', '2024-01-20'], [3, 'Lena', 'lena@mail.com', 'London', '2024-01-30'], [4, 'Omar', 'omar@mail.com', 'Bristol', '2024-02-14'], [5, 'Zoe', 'zoe@mail.com', null, '2024-03-10'], [6, 'Tom', 'tom@mail.com', 'Leeds', '2024-03-20']] },
            },
        },
        predict: {
            answer: '2 rows: product 4 (the desk lamp, 2 of them) and product 5 (the backpack, 1).\n\nCheck it against orders: 2 × £25 + 1 × £30 = £80, which is exactly order 102\'s amount. (ORDER BY product_id is added below so the order is fixed.)',
            query: {
                sql: code`
                    SELECT *
                    FROM order_items
                    WHERE order_id = 102
                    ORDER BY product_id;
                `,
                result: { columns: ['order_id', 'product_id', 'quantity'], rows: [[102, 4, 2], [102, 5, 1]] },
            },
        },
        edge: {
            answer: '• No manager: Asha (manager_id is NULL; she is the boss).\n• No department: Gus (dept_id is NULL).\n• No orders: Omar. (The second Tom sign-up, customer 6, has none either; Tom\'s orders are all under id 2.)\n• Never sold: the phone case (product 7).\n• No amount: order 106, which was cancelled.\n\nThe others worth knowing: HR has no employees, Ben and Chen earn the same, Hana earns more than her manager Ben, Tom signed up twice with the same email, Zoe has no city, and Priya ordered three days in a row.',
        },
    },
    'sql0-t3': {
        explain: {
            answer: 'A primary key is the column that names exactly one row. In customers it is customer_id: 1 is Priya and nobody else, ever.\n\nA foreign key is a column that holds another table\'s primary key, to point at that row. orders.customer_id is a foreign key: order 104 has customer_id 2, so it belongs to Tom. One customer can have many orders, so that is one-to-many.\n\nA link table joins two tables that are many-to-many. One order can hold many products, and one product can be in many orders, so neither table can hold the other\'s key. order_items sits in the middle: each row holds one order_id and one product_id.',
        },
        write: {
            answer: 'Order 103 has two lines: 1 notebook (product 2) and 5 mugs (product 3). That is 1 × £5 + 5 × £8 = £45, order 103\'s amount.',
            query: {
                sql: code`
                    SELECT *
                    FROM order_items
                    WHERE order_id = 103
                    ORDER BY product_id;
                `,
                result: { columns: ['order_id', 'product_id', 'quantity'], rows: [[103, 2, 1], [103, 3, 5]] },
            },
        },
        predict: {
            answer: 'Ben, Chen, Dara and Fatima: the four people who report straight to Asha (emp_id 1).\n\nHana is not in the list: her manager is Ben (2). Eli and Gus report to Dara (4). Asha has no manager at all.',
            query: {
                sql: code`
                    SELECT name
                    FROM employees
                    WHERE manager_id = 1
                    ORDER BY name;
                `,
                result: { columns: ['name'], rows: [['Ben'], ['Chen'], ['Dara'], ['Fatima']] },
            },
        },
        edge: {
            answer: 'The primary key of order_items is the pair (order_id, product_id), so only the pair must be unique.\n\n• Same order_id: yes. Order 102 has two rows, one for the lamp and one for the backpack.\n• Same product_id: yes. Product 6, the headphones, is in orders 101, 104 and 105.\n• Both at once: no. That would be the same product listed twice in one order. You change the quantity instead.\n\nTry to add a second desk-lamp row to order 102 and the database refuses:',
            query: {
                sql: code`
                    INSERT INTO order_items VALUES (102, 4, 1);
                `,
                error: 'UNIQUE constraint failed: order_items.order_id, order_items.product_id',
            },
        },
    },
    'sql0-t4': {
        explain: {
            answer: '7 and 2 are both whole numbers (integers), and integer divided by integer gives an integer: the part after the point is thrown away, so 7 / 2 is 3. It is not rounded; it is cut off.\n\nTwo ways to get 3.5:\n• Make one side a decimal: `7 / 2.0` or `7 * 1.0 / 2`.\n• Convert it: `CAST(7 AS REAL) / 2`.\n\nThe same trap hits averages and percentages built by dividing two integer columns.',
        },
        write: {
            answer: 'Divide by 12.0, not 12. One decimal side is enough to make the whole division exact. (To show pounds and pence, wrap it in `ROUND(salary / 12.0, 2)`, from the built-in functions lesson.)',
            query: {
                sql: code`
                    SELECT name, salary, salary / 12.0 AS monthly
                    FROM employees
                    ORDER BY emp_id;
                `,
                result: { columns: ['name', 'salary', 'monthly'], rows: [['Asha', 95000, 7916.666666666667], ['Ben', 70000, 5833.333333333333], ['Chen', 70000, 5833.333333333333], ['Dara', 60000, 5000], ['Eli', 45000, 3750], ['Fatima', 52000, 4333.333333333333], ['Gus', 38000, 3166.6666666666665], ['Hana', 80000, 6666.666666666667]] },
            },
        },
        predict: {
            answer: '0, then 0.333…, then 0 (false).\n\n• `1 / 3`: two integers, so the fraction is cut off: 0.\n• `1.0 / 3`: one decimal, so the answer is exact: 0.3333333333333333.\n• `\'5\' < \'40\'`: these are text, so they compare letter by letter, like words in a dictionary. The first characters are 5 and 4, and 5 comes after 4, so \'5\' is bigger. The answer is false, which SQLite shows as 0.',
            query: {
                sql: code`
                    SELECT 1 / 3, 1.0 / 3, '5' < '40';
                `,
                result: { columns: ['1 / 3', '1.0 / 3', '\'5\' < \'40\''], rows: [[0, 0.3333333333333333, 0]] },
            },
        },
        edge: {
            answer: 'Sorting text compares character by character, so you get \'10\', \'100\', \'9\'. The 1s come before the 9.\n\nThe quick fix is to sort by the number: `ORDER BY CAST(price AS INTEGER)`. The real fix is to store prices in a number column (INTEGER, or DECIMAL for pence), so they sort, compare and add up correctly everywhere.\n\nBelow, WITH just makes a tiny three-row table to test on (you meet it in Phase 4). Change the ORDER BY to plain `price` to see the wrong order.',
            query: {
                sql: code`
                    WITH prices(price) AS (VALUES ('9'), ('10'), ('100'))
                    SELECT price
                    FROM prices
                    ORDER BY CAST(price AS INTEGER);
                `,
                result: { columns: ['price'], rows: [['9'], ['10'], ['100']] },
            },
        },
    },
};
