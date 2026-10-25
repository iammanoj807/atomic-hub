import type { SqlTopicAnswers } from '../sql';
import { code } from '../sqlCourse/code';

// Phase 6 · Building tables and changing data. One good answer for each practice exercise.

export const sqlPhase6Answers: Record<string, SqlTopicAnswers> = {
    'sql6-t1': {
        explain: {
            answer: '`CREATE TABLE suppliers ( … )` makes a new, empty table called suppliers, with the columns listed in the brackets.\n\n• `supplier_id INTEGER PRIMARY KEY`: a whole-number column that identifies each row. Primary key means it must be unique and can\'t be NULL. (In SQLite, an INTEGER PRIMARY KEY is also numbered automatically if you leave it out.)\n• `name TEXT NOT NULL`: a text column that must always have a value. An INSERT without a name is refused.\n• `country TEXT DEFAULT \'UK\'`: a text column that may be left out; if an INSERT doesn\'t mention it, it gets \'UK\'.\n\nThe statement changes the structure (the schema) and returns no rows. It is DDL.',
        },
        write: {
            answer: 'Each rule from the question becomes a constraint: REFERENCES makes product_id point at a real product, CHECK keeps the rating between 1 and 5, and DEFAULT CURRENT_DATE fills in today\'s date if an insert leaves it out (here both inserts give a date, so the result is fixed).\n\nTry inserting a rating of 9: the database refuses it with "CHECK constraint failed: rating BETWEEN 1 AND 5".',
            query: {
                sql: code`
                    CREATE TABLE reviews (
                      review_id  INTEGER PRIMARY KEY,
                      product_id INTEGER NOT NULL REFERENCES products(product_id),
                      rating     INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
                      created_on TEXT NOT NULL DEFAULT CURRENT_DATE
                    );
                    INSERT INTO reviews (review_id, product_id, rating, created_on) VALUES (1, 6, 5, '2024-03-02');
                    INSERT INTO reviews (review_id, product_id, rating, created_on) VALUES (2, 3, 4, '2024-03-05');
                    SELECT r.review_id, p.product_name, r.rating, r.created_on
                    FROM reviews r
                    JOIN products p ON p.product_id = r.product_id
                    ORDER BY r.review_id;
                `,
                result: { columns: ['review_id', 'product_name', 'rating', 'created_on'], rows: [[1, 'Headphones', 5, '2024-03-02'], [2, 'Mug', 4, '2024-03-05']] },
            },
        },
        predict: {
            answer: '\'UK\'. The INSERT names only supplier_id and name, so country takes its DEFAULT. (Every run starts from the original database, so the query below creates the suppliers table first.)',
            query: {
                sql: code`
                    CREATE TABLE suppliers (
                      supplier_id INTEGER PRIMARY KEY,
                      name        TEXT NOT NULL,
                      country     TEXT DEFAULT 'UK'
                    );
                    INSERT INTO suppliers (supplier_id, name) VALUES (3, 'MugMakers');
                    SELECT * FROM suppliers;
                `,
                result: { columns: ['supplier_id', 'name', 'country'], rows: [[3, 'MugMakers', 'UK']] },
            },
        },
        edge: {
            answer: 'The database refuses the row: "NOT NULL constraint failed: suppliers.name". name has no DEFAULT, so leaving it out would make it NULL, and NOT NULL forbids that. The whole INSERT fails and nothing is stored.\n\nThat is the point of the rule: a supplier without a name is bad data, and the database stops it at the door, whatever program sent it.',
            query: {
                sql: code`
                    CREATE TABLE suppliers (
                      supplier_id INTEGER PRIMARY KEY,
                      name        TEXT NOT NULL,
                      country     TEXT DEFAULT 'UK'
                    );
                    INSERT INTO suppliers (supplier_id, country) VALUES (4, 'France');
                `,
                error: 'NOT NULL constraint failed: suppliers.name',
            },
        },
    },
    'sql6-t2': {
        explain: {
            answer: '• NOT NULL, a value is required: employees.name. Every employee must have a name.\n• UNIQUE, no two rows may share the value: customers.email should have had it. It doesn\'t, which is exactly how Tom signed up twice.\n• PRIMARY KEY, the row\'s identity (unique and not NULL): employees.emp_id, and in order_items the pair (order_id, product_id).\n• FOREIGN KEY, the value must exist in another table: orders.customer_id must be a real customer_id in customers.\n• CHECK, any rule about the row: none here yet, but `price > 0` on products or `status IN (\'delivered\', \'shipped\', \'cancelled\', \'pending\')` on orders would be natural.\n• DEFAULT, the value used when an INSERT leaves the column out: for example `status TEXT NOT NULL DEFAULT \'pending\'` on orders.',
        },
        write: {
            answer: 'The table and the valid row are below. Each of these is refused, and the table stays unchanged:\n\n• A second row with the same email: `INSERT INTO listings VALUES (2, \'shop@mail.com\', 35);` gives "UNIQUE constraint failed: listings.email".\n• A price that isn\'t positive: `INSERT INTO listings VALUES (3, \'other@mail.com\', 0);` gives "CHECK constraint failed: price > 0".\n\nAdd either line after the INSERT and run it to see the error.',
            query: {
                sql: code`
                    CREATE TABLE listings (
                      listing_id INTEGER PRIMARY KEY,
                      email      TEXT NOT NULL UNIQUE,
                      price      INTEGER NOT NULL CHECK (price > 0)
                    );
                    INSERT INTO listings VALUES (1, 'shop@mail.com', 20);
                    SELECT * FROM listings;
                `,
                result: { columns: ['listing_id', 'email', 'price'], rows: [[1, 'shop@mail.com', 20]] },
            },
        },
        predict: {
            answer: 'No. employees.dept_id is a foreign key to departments, and there is no department 9, so the update is refused: "FOREIGN KEY constraint failed". Gus keeps his NULL dept_id.\n\n(NULL itself is allowed in a foreign key column, meaning "no department"; a value that points at nothing is not.)',
            query: {
                sql: code`
                    UPDATE employees SET dept_id = 9 WHERE emp_id = 7;
                `,
                error: 'FOREIGN KEY constraint failed',
            },
        },
        edge: {
            answer: 'Yes, both go in. UNIQUE means "no two equal values", and NULL is not equal to anything, not even another NULL, so two NULLs don\'t clash. PostgreSQL and MySQL behave the same way.\n\nSQL Server is the exception: it allows only one NULL in a UNIQUE column. And PostgreSQL 15+ lets you ask for that with `UNIQUE NULLS NOT DISTINCT`. If an email is really required, the fix is `NOT NULL` as well as UNIQUE.',
            query: {
                sql: code`
                    CREATE TABLE subscribers (
                      id    INTEGER PRIMARY KEY,
                      email TEXT UNIQUE
                    );
                    INSERT INTO subscribers (id, email) VALUES (1, NULL), (2, NULL);
                    SELECT id, email FROM subscribers ORDER BY id;
                `,
                result: { columns: ['id', 'email'], rows: [[1, null], [2, null]] },
            },
        },
    },
    'sql6-t3': {
        explain: {
            answer: 'UPDATE and DELETE act on every row their WHERE matches, and there is no undo once it is committed. A WHERE that is slightly wrong (a typo, `OR` where you meant `AND`, a NULL you forgot) can change far more rows than you meant, or none at all.\n\nRunning the same WHERE as a SELECT first shows you exactly which rows will be hit and how many. If you expected 2 rows and see 2,000, you have just avoided a disaster. Then turn the SELECT into the UPDATE or DELETE, ideally inside a transaction, and check that the number of rows changed matches.',
        },
        write: {
            answer: 'Multiply by 110 and divide by 100. With whole numbers, the division drops any pence, which is what "whole pounds" asks for. The department is found by its name, so the query doesn\'t depend on remembering that Engineering is 1.',
            query: {
                sql: code`
                    UPDATE employees
                    SET salary = salary * 110 / 100
                    WHERE dept_id = (SELECT dept_id FROM departments WHERE dept_name = 'Engineering');
                    SELECT name, salary
                    FROM employees
                    WHERE dept_id = 1
                    ORDER BY name;
                `,
                result: { columns: ['name', 'salary'], rows: [['Asha', 104500], ['Ben', 77000], ['Chen', 77000], ['Hana', 88000]] },
            },
        },
        predict: {
            answer: '7 rows: the item lines with a quantity of 3 or more. They are (101, headphones, 3), (103, mug, 5), (104, headphones, 5), (105, headphones, 3), (108, desk lamp, 3), (109, pen, 5) and (109, notebook, 4). 7 of the 14 remain.\n\nIn SQLite, `changes()` reports how many rows the last statement changed.',
            query: {
                sql: code`
                    DELETE FROM order_items WHERE quantity >= 3;
                    SELECT changes() AS rows_removed, (SELECT COUNT(*) FROM order_items) AS rows_left;
                `,
                result: { columns: ['rows_removed', 'rows_left'], rows: [[7, 7]] },
            },
        },
        edge: {
            answer: 'It fails: "FOREIGN KEY constraint failed". Priya (customer 1) has five orders, and each one\'s customer_id points at her. Deleting her would leave those orders pointing at nobody, so the database refuses, and nothing is deleted.\n\nWith `ON DELETE CASCADE` on orders.customer_id, deleting Priya would also delete her five orders automatically. Those orders have 9 item lines in order_items, so that foreign key would need CASCADE too; otherwise it would still block the delete. One innocent-looking DELETE would remove 15 rows across three tables, which is why CASCADE should be a deliberate choice.',
            query: {
                sql: code`
                    DELETE FROM customers WHERE customer_id = 1;
                `,
                error: 'FOREIGN KEY constraint failed',
            },
        },
    },
    'sql6-t4': {
        explain: {
            answer: 'Moving £100 from account A to account B is two UPDATEs: subtract from A, add to B.\n\n• Atomic: they happen together or not at all. If the server crashes after the first UPDATE, the transaction is rolled back, so £100 can\'t disappear.\n• Consistent: every rule still holds afterwards. If a CHECK says balances can\'t go below zero, a transfer that would overdraw A fails, and nothing changes.\n• Isolated: someone reading the balances while the transfer runs never sees the halfway point (A already £100 down, B not yet £100 up).\n• Durable: once COMMIT returns, the transfer is saved on disk and survives a crash or power cut a second later.',
        },
        write: {
            answer: 'Both changes sit between BEGIN and COMMIT, so they are saved together. Marketing is department 3. Eli\'s salary goes from 45,000 to 48,000.\n\nNotice his manager_id is still 4 (Dara, in Sales). A real move would probably change that too, in the same transaction.',
            query: {
                sql: code`
                    BEGIN;
                    UPDATE employees SET dept_id = 3 WHERE name = 'Eli';
                    UPDATE employees SET salary = salary + 3000 WHERE name = 'Eli';
                    COMMIT;
                    SELECT * FROM employees WHERE name = 'Eli';
                `,
                result: { columns: ['emp_id', 'name', 'dept_id', 'manager_id', 'salary', 'hire_date'], rows: [[5, 'Eli', 3, 4, 48000, '2022-07-01']] },
            },
        },
        predict: {
            answer: '0. Inside the open transaction, the DELETE has already removed all 14 item lines, and the transaction sees its own changes.\n\nThe bigger problem is that the transaction is never finished. Nothing is permanent yet, and it holds locks that block other writers until someone commits, rolls back, or disconnects (which rolls it back). Forgetting to end a transaction is a classic way to freeze an application.',
            query: {
                sql: code`
                    BEGIN;
                    DELETE FROM order_items;
                    SELECT COUNT(*) AS items_after_rollback FROM order_items;
                `,
                result: { columns: ['items_after_rollback'], rows: [[0]] },
            },
        },
        edge: {
            answer: 'Both read stock = 1, both compute 1 − 1 = 0, and both write 0. Both sales go through, so one item has been sold twice: a lost update. The second writer overwrote the first one\'s change without knowing it existed.\n\nPrevent it by making "check and subtract" one atomic step:\n• A conditional update: `UPDATE products SET stock = stock - 1 WHERE product_id = 7 AND stock >= 1`, then check how many rows changed. 0 means sold out.\n• Or lock the row while you read it: `SELECT stock … FOR UPDATE`, then update. The second buyer waits, then reads 0.\n• Plus a `CHECK (stock >= 0)` as a final safety net.\n\nBelow, a stock column is added with 1 left, and two buyers run the conditional update. The second one changes 0 rows, so it knows it must refuse the sale.',
            query: {
                sql: code`
                    ALTER TABLE products ADD COLUMN stock INTEGER NOT NULL DEFAULT 1 CHECK (stock >= 0);
                    UPDATE products SET stock = stock - 1 WHERE product_id = 7 AND stock >= 1;
                    UPDATE products SET stock = stock - 1 WHERE product_id = 7 AND stock >= 1;
                    SELECT product_name, stock, changes() AS second_buyer_got
                    FROM products
                    WHERE product_id = 7;
                `,
                result: { columns: ['product_name', 'stock', 'second_buyer_got'], rows: [['Phone case', 0, 0]] },
            },
        },
    },
    'sql6-t5': {
        explain: {
            answer: '• 1NF, one value per cell: an order can\'t store \'Headphones, Backpack\' in one column; each product gets its own row in order_items.\n• 2NF, every column depends on the whole key: in order_items the key is (order_id, product_id), and quantity depends on both, but a product_name would depend on product_id alone, so names live in products.\n• 3NF, no column depends on another non-key column: orders shouldn\'t hold the customer\'s email, because the email depends on customer_id, not on the order; it lives once, in customers.',
        },
        write: {
            answer: 'The same four-table join as the lesson, for customer 2. Tom has two orders with one item each, so his email appears 2 times. (His second sign-up, customer 6, repeats the same email in customers, but has no orders.)',
            query: {
                sql: code`
                    SELECT o.order_id, c.name, c.email, p.product_name, p.price, oi.quantity
                    FROM order_items oi
                    JOIN orders o    ON o.order_id = oi.order_id
                    JOIN customers c ON c.customer_id = o.customer_id
                    JOIN products p  ON p.product_id = oi.product_id
                    WHERE o.customer_id = 2
                    ORDER BY o.order_id, p.product_name;
                `,
                result: { columns: ['order_id', 'name', 'email', 'product_name', 'price', 'quantity'], rows: [[104, 'Tom', 'tom@mail.com', 'Headphones', 40, 5], [108, 'Tom', 'tom@mail.com', 'Desk lamp', 25, 3]] },
            },
        },
        predict: {
            answer: 'Third normal form. The manager\'s name depends on the category, not on the product: product_id → category → manager. That is a transitive dependency, through a column that isn\'t the key.\n\nThe symptom: the Stationery manager\'s name would be stored on the pen row and the notebook row. Change the manager and miss one row, and the table says two different things. The fix is a categories table (category, manager_name), with products keeping only the category.',
        },
        edge: {
            answer: 'For storing it:\n• The price paid is a different fact from today\'s price. When the headphones go from £40 to £45, last month\'s order must still say £40, for invoices, refunds and revenue reports.\n• Without it, every old order would silently change value whenever a price changes.\n• So it is not a 2NF violation: unit_price in order_items depends on the whole key (this product, in this order), not on product_id alone.\n\nAgainst:\n• If prices truly never change, it is a redundant copy taking space.\n• Two columns called "price" invite mistakes: which one does a report use?\n• An alternative is a price-history table with "valid from" dates, joined on the order date. It is fully normalised, but every read becomes more complex.\n\nIn practice, almost every real order system stores the price at the time of the order.',
        },
    },
    'sql6-t6': {
        explain: {
            answer: 'A view is a saved query with a name. It stores no rows: every time you select from it, it runs its query against the current tables, so it is always up to date, and only as fast as that query.\n\nA materialised view runs the query once and stores the result rows. Reading it is fast (it is like reading a table), but it is a snapshot: new orders don\'t appear until you REFRESH it. Use a view for one shared definition of a query; use a materialised view when the query is expensive and slightly old numbers are fine (such as a dashboard refreshed every hour).',
        },
        write: {
            answer: 'The LEFT JOIN keeps every product, and COALESCE turns the phone case\'s NULL total into 0. The view is then queried like a table.\n\nThe desk lamp and the mug tie on 6 for second place; the name in the ORDER BY decides which comes first, and both make the top 3 here.',
            query: {
                sql: code`
                    CREATE VIEW product_sales AS
                    SELECT p.product_id, p.product_name, COALESCE(SUM(oi.quantity), 0) AS total_sold
                    FROM products p
                    LEFT JOIN order_items oi ON oi.product_id = p.product_id
                    GROUP BY p.product_id, p.product_name;

                    SELECT product_name, total_sold
                    FROM product_sales
                    ORDER BY total_sold DESC, product_name
                    LIMIT 3;
                `,
                result: { columns: ['product_name', 'total_sold'], rows: [['Headphones', 11], ['Desk lamp', 6], ['Mug', 6]] },
            },
        },
        predict: {
            answer: 'Yes. The view stores only its query, so the next SELECT re-runs it against the updated orders table. Below, order 109 goes from £30 to £50, and Priya\'s total goes from 425 to 445 straight away.\n\nA materialised view would not: it would keep showing 425 until someone ran REFRESH MATERIALIZED VIEW.',
            query: {
                sql: code`
                    CREATE VIEW customer_totals AS
                    SELECT c.customer_id, c.name, COALESCE(SUM(o.amount), 0) AS total_spent
                    FROM customers c
                    LEFT JOIN orders o ON o.customer_id = c.customer_id
                    GROUP BY c.customer_id, c.name;

                    UPDATE orders SET amount = 50 WHERE order_id = 109;

                    SELECT name, total_spent FROM customer_totals WHERE customer_id = 1;
                `,
                result: { columns: ['name', 'total_spent'], rows: [['Priya', 445]] },
            },
        },
        edge: {
            answer: 'It depends on the database, and every option is bad.\n\n• SQLite expands the * every time the view is read, so the new column appears in the view by itself. If that column is sensitive, it leaks. Below, a view meant to be safe to share suddenly shows a password_hash.\n• PostgreSQL expands the * once, when the view is created, so the new column never appears, and the view quietly stops matching its table. Dropping a column the view uses, or changing its type, is refused.\n• In SQL Server, the view\'s stored column list can go out of step with the table until it is refreshed, and columns can come back shifted.\n\nListing the columns makes the view\'s shape fixed and visible: nothing new appears by accident, nothing sensitive leaks, and anything that depends on the view keeps getting the same columns.',
            query: {
                sql: code`
                    CREATE VIEW public_customers AS
                    SELECT * FROM customers;

                    ALTER TABLE customers ADD COLUMN password_hash TEXT;
                    UPDATE customers SET password_hash = 'x9f2…' WHERE customer_id = 1;

                    SELECT * FROM public_customers WHERE customer_id = 1;
                `,
                result: { columns: ['customer_id', 'name', 'email', 'city', 'signup_date', 'password_hash'], rows: [[1, 'Priya', 'priya@mail.com', 'London', '2024-01-02', 'x9f2…']] },
            },
        },
    },
    'sql6-t7': {
        explain: {
            answer: 'With a filing cabinet: DELETE takes out the files you choose, one at a time. TRUNCATE tips the whole drawer into the bin but keeps the drawer. DROP throws away the cabinet itself.\n\nTechnically:\n• DELETE is DML. It removes the rows matching a WHERE (or all rows without one), row by row, logging each one and firing triggers. It can be rolled back.\n• TRUNCATE is DDL. It empties the whole table in one fast step, with no WHERE, and usually resets the auto-numbering. Whether it can be rolled back depends on the database (yes in PostgreSQL and SQL Server, no in MySQL and Oracle).\n• DROP is DDL. It removes the table completely: rows, columns, indexes, constraints and permissions. Querying it afterwards is an error.',
        },
        write: {
            answer: 'Delete the children first, then the parents: the foreign key from order_items to orders would refuse it the other way round. Wrapping both in one transaction means you never end up with half the clean-up done.\n\nThe only cancelled order is 106, and it has no items, so 9 orders and all 14 item lines remain.',
            query: {
                sql: code`
                    BEGIN;
                    DELETE FROM order_items
                    WHERE order_id IN (SELECT order_id FROM orders WHERE status = 'cancelled');
                    DELETE FROM orders WHERE status = 'cancelled';
                    COMMIT;
                    SELECT (SELECT COUNT(*) FROM orders) AS orders_left,
                           (SELECT COUNT(*) FROM order_items) AS items_left;
                `,
                result: { columns: ['orders_left', 'items_left'], rows: [[9, 14]] },
            },
        },
        predict: {
            answer: 'It fails, and products still has all 7 rows. order_items points at products 1 to 6, so deleting those products would leave item lines pointing at nothing: "FOREIGN KEY constraint failed". A statement either succeeds completely or not at all, so not even the phone case (which no item uses) is deleted.',
            query: {
                sql: code`
                    DELETE FROM products;
                `,
                error: 'FOREIGN KEY constraint failed',
            },
        },
        edge: {
            answer: '• GRANT: DCL (Data Control Language): it gives a permission.\n• SAVEPOINT: TCL (Transaction Control Language): it marks a point inside a transaction you can roll back to.\n• ALTER: DDL (Data Definition Language): it changes a table\'s structure.\n• SELECT: DML (Data Manipulation Language). Some books give it its own family, DQL (Data Query Language).\n• TRUNCATE: DDL. It removes rows, but it works on the table as a whole, not row by row, which is why it is DDL and not DML.',
        },
    },
};
