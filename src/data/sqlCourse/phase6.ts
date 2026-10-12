import type { SqlPhase } from '../sql';
import { code } from './code';
import { cs50Sql, postgresDocs, sqlBolt, sqliteDocs, w3, watch } from './resources';

export const sqlPhase6: SqlPhase = {
    id: 'changing-data',
    number: 6,
    short: 'Building & changing',
    title: 'Building tables and changing data',
    accent: '#4fc3f7',
    goal: 'Create tables with the right rules, add, change and remove rows safely, group changes into transactions, and design tables that don\'t contradict themselves.',
    bigPicture: 'So far you have only read data. Real systems also write it — and writing is where data gets damaged. Constraints stop bad rows getting in, transactions stop half-finished changes, and normalisation stops the same fact being stored twice and drifting apart.',
    topics: [
        {
            id: 'sql6-t1',
            kind: 'lesson',
            name: 'CREATE TABLE and ALTER TABLE',
            priority: 'must',
            definition: 'CREATE TABLE defines a new table — its name, its columns, their types and rules — and ALTER TABLE changes an existing table, for example by adding a column.',
            problem: 'Before data can be stored, the database needs to know its shape. Choosing the columns, types and keys well at the start saves painful fixes later, when the table holds millions of rows.',
            idea: 'CREATE TABLE lists each column with its type and any rules (constraints): `name TEXT NOT NULL`. One column, or a group of columns, is the PRIMARY KEY. DEFAULT gives a value to use when an INSERT doesn\'t mention the column. ALTER TABLE changes the table afterwards: ADD COLUMN, RENAME COLUMN, DROP COLUMN. These commands change the structure (the schema), not the rows, and they belong to the part of SQL called DDL.',
            analogy: 'Designing a paper form before printing it: you decide the boxes (columns), what may be written in each (types), which ones must be filled in (NOT NULL), and which are pre-filled (DEFAULT). ALTER TABLE is printing a new version of the form with an extra box.',
            breaks: 'A reprinted form doesn\'t change the forms already filled in. ALTER TABLE does: adding a column adds it to every existing row (with its default or NULL), and on a huge table that can take a long time or lock it.',
            syntax: code`
                CREATE TABLE table_name (
                  id     INTEGER PRIMARY KEY,
                  column TYPE NOT NULL,
                  other  TYPE DEFAULT value
                );
                ALTER TABLE table_name ADD COLUMN new_column TYPE;
            `,
            howItWorks: [
                'CREATE TABLE suppliers makes an empty table with three columns.',
                'supplier_id is the primary key: unique and never NULL.',
                'country has DEFAULT \'UK\', so an INSERT that leaves it out gets \'UK\'.',
                'ALTER TABLE products ADD COLUMN in_stock … DEFAULT 1 adds the column to all 7 existing rows, each with 1.',
                'Neither command returns rows; a SELECT afterwards shows the effect.',
            ],
            diagram: {
                code: 'flowchart LR\n  C["CREATE TABLE<br/>new, empty table<br/>with columns and rules"] --> I["INSERT rows"]\n  I --> A["ALTER TABLE<br/>add a column:<br/>every row gets the default"]',
                caption: 'CREATE TABLE sets up the shape, INSERT fills it, and ALTER TABLE reshapes it later — the new column is added to every row that already exists.',
            },
            examples: [
                {
                    title: 'Create a table and use its default',
                    sql: code`
                        CREATE TABLE suppliers (
                          supplier_id INTEGER PRIMARY KEY,
                          name        TEXT NOT NULL,
                          country     TEXT DEFAULT 'UK'
                        );
                        INSERT INTO suppliers (supplier_id, name) VALUES (1, 'PaperCo');
                        INSERT INTO suppliers VALUES (2, 'SoundWorks', 'Germany');
                        SELECT * FROM suppliers ORDER BY supplier_id;
                    `,
                    result: { columns: ['supplier_id', 'name', 'country'], rows: [[1, 'PaperCo', 'UK'], [2, 'SoundWorks', 'Germany']] },
                    note: 'The first INSERT names only two columns, so country takes its default.',
                },
                {
                    title: 'Add a column to an existing table',
                    sql: code`
                        ALTER TABLE products ADD COLUMN in_stock INTEGER NOT NULL DEFAULT 1;
                        SELECT product_name, price, in_stock
                        FROM products
                        WHERE category = 'Electronics'
                        ORDER BY product_name;
                    `,
                    result: { columns: ['product_name', 'price', 'in_stock'], rows: [['Headphones', 40, 1], ['Phone case', 15, 1]] },
                    note: 'Every existing product gets in_stock = 1. A NOT NULL column added to a table with rows needs a DEFAULT.',
                },
            ],
            keyPoints: [
                'CREATE TABLE: name, then each column with its type and rules, separated by commas.',
                'Give every table a primary key.',
                'DEFAULT fills a column when an INSERT leaves it out.',
                'ALTER TABLE ADD / RENAME / DROP COLUMN changes the structure of an existing table.',
                'CREATE, ALTER and DROP are DDL: they change the schema, not the data.',
            ],
            mistakes: [
                'No primary key, so duplicate rows can\'t be told apart or removed cleanly.',
                'Adding a NOT NULL column without a DEFAULT to a table that already has rows — most databases refuse.',
                'Storing several values in one column (\'Pen, Mug\'). Each column should hold one value — see normalisation.',
            ],
            dialects: [
                'Auto-numbered ids: PostgreSQL `id INTEGER GENERATED ALWAYS AS IDENTITY` (or SERIAL); MySQL `AUTO_INCREMENT`; SQL Server `IDENTITY(1,1)`; SQLite `INTEGER PRIMARY KEY` does it automatically.',
                'SQLite\'s ALTER TABLE is limited (add, rename and drop column only). PostgreSQL can also change a column\'s type with `ALTER COLUMN … TYPE`.',
            ],
            interviewAnswer: 'CREATE TABLE defines a table\'s columns, data types and constraints — a primary key, NOT NULL, defaults, foreign keys — and ALTER TABLE evolves it later, such as adding a column. I always give tables a primary key, choose types deliberately — DECIMAL for money, proper DATE types for dates — and treat schema changes on big tables carefully, because adding or changing columns can rewrite or lock the table.',
            followUps: [
                { q: 'What is a schema?', a: 'The structure of the database: its tables, columns, types and constraints. Also, in PostgreSQL, a named group of tables inside a database.' },
                { q: 'How do you add a NOT NULL column to a table that already has data?', a: 'Give it a DEFAULT, or add it as nullable, fill in the values with UPDATE, then add the NOT NULL rule.' },
            ],
            practice: {
                explain: 'Explain what each part of the suppliers CREATE TABLE does.',
                write: 'Create a table reviews with a review id, a product_id that references products, a rating from 1 to 5, and a created date, then insert two rows and select them.',
                predict: 'After `INSERT INTO suppliers (supplier_id, name) VALUES (3, \'MugMakers\');`, what country does MugMakers have?',
                edge: 'What happens if you insert a supplier without a name? Try it, and explain the error.',
            },
            resources: [
                sqlBolt('Lesson 16: Creating tables'),
                w3('sql_create_table.asp', 'SQL CREATE TABLE'),
                cs50Sql('Lecture 2: Designing'),
            ],
        },
        {
            id: 'sql6-t2',
            kind: 'lesson',
            name: 'Constraints: the rules that keep bad data out',
            priority: 'must',
            definition: 'Constraints are rules the database enforces on every write — PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL, CHECK and DEFAULT — so that rows which break them are refused instead of stored.',
            problem: 'Application code has bugs, and data arrives from many places. Tom could sign up twice because nothing said emails must be unique. A rule in the database is checked on every insert and update, from every program, every time.',
            idea: 'NOT NULL: a value is required. UNIQUE: no two rows may share the value. PRIMARY KEY: unique and not NULL — the row\'s identity. FOREIGN KEY (REFERENCES): the value must exist in another table\'s key, and you choose what happens when that row is deleted (refuse, ON DELETE CASCADE, or ON DELETE SET NULL). CHECK: any condition, such as `price > 0` or `plan IN (\'free\', \'pro\')`. If a write breaks a rule, the whole statement fails with an error and nothing is changed.',
            analogy: 'The rules at a passport desk. No photo, no passport (NOT NULL). One passport number per person (UNIQUE). The country you list must be a real country (FOREIGN KEY). Your age can\'t be negative (CHECK). The officer refuses the form; they don\'t "fix it later".',
            breaks: 'An officer might let a small mistake through. A constraint never does — which is the point, but it also means a bulk load can fail on row 9,999,999. Clean or check the data before loading, or load into a staging table first.',
            syntax: code`
                email   TEXT NOT NULL UNIQUE,
                price   INTEGER CHECK (price > 0),
                dept_id INTEGER REFERENCES departments(dept_id) ON DELETE SET NULL
            `,
            howItWorks: [
                'Every INSERT and UPDATE is checked against every constraint on the table.',
                'subscribers.email is the primary key, so a second row with the same email is a conflict.',
                '`ON CONFLICT (email) DO NOTHING` tells the database to skip that row quietly instead of failing.',
                'Inserting an order for customer 99, who doesn\'t exist, breaks the foreign key: refused.',
                'Inserting a department with an existing dept_id breaks the primary key: refused.',
            ],
            diagram: {
                code: 'flowchart LR\n  W["INSERT or UPDATE"] --> N{"NOT NULL?"}\n  N -->|"ok"| U{"UNIQUE / PRIMARY KEY?"}\n  U -->|"ok"| F{"FOREIGN KEY exists?"}\n  F -->|"ok"| K{"CHECK true?"}\n  K -->|"ok"| S["row saved"]\n  N -->|"broken"| X["refused with an error:<br/>nothing changes"]\n  U -->|"broken"| X\n  F -->|"broken"| X\n  K -->|"broken"| X',
                caption: 'Each write passes every rule on the table. If any rule fails, the statement is refused and the table is left exactly as it was.',
            },
            examples: [
                {
                    title: 'UNIQUE and CHECK, and skipping duplicates on purpose',
                    sql: code`
                        CREATE TABLE subscribers (
                          email TEXT PRIMARY KEY,
                          plan  TEXT NOT NULL CHECK (plan IN ('free', 'pro'))
                        );
                        INSERT INTO subscribers VALUES ('priya@mail.com', 'pro');
                        INSERT INTO subscribers VALUES ('tom@mail.com', 'free');
                        INSERT INTO subscribers VALUES ('tom@mail.com', 'pro')
                          ON CONFLICT (email) DO NOTHING;
                        SELECT * FROM subscribers ORDER BY email;
                    `,
                    result: { columns: ['email', 'plan'], rows: [['priya@mail.com', 'pro'], ['tom@mail.com', 'free']] },
                    note: 'Tom\'s second sign-up is skipped. Try it yourself with plan \'gold\' and watch the CHECK refuse it.',
                },
                {
                    title: 'A foreign key refuses an order for a customer who doesn\'t exist',
                    sql: code`
                        INSERT INTO orders (order_id, customer_id, order_date, amount, status)
                        VALUES (111, 99, '2024-03-20', 10, 'pending');
                    `,
                    error: 'FOREIGN KEY constraint failed',
                    note: 'There is no customer 99, so the row is never stored.',
                },
                {
                    title: 'A primary key refuses a duplicate id',
                    sql: code`
                        INSERT INTO departments VALUES (1, 'Legal', 'York');
                    `,
                    error: 'UNIQUE constraint failed: departments.dept_id',
                    note: 'Department 1 already exists. A primary key is a UNIQUE rule plus NOT NULL.',
                },
            ],
            keyPoints: [
                'NOT NULL, UNIQUE, PRIMARY KEY, FOREIGN KEY, CHECK and DEFAULT are the six to know.',
                'PRIMARY KEY = UNIQUE + NOT NULL, one per table.',
                'Foreign key delete options: refuse (default), ON DELETE CASCADE, ON DELETE SET NULL.',
                'A failed constraint fails the whole statement; nothing is half-written.',
                'Put rules in the database, not only in the app — the database sees every write.',
            ],
            mistakes: [
                'Relying on the app alone to prevent duplicates (that is how Tom signed up twice).',
                'Using ON DELETE CASCADE without thinking: deleting one customer silently deletes all their orders.',
                'Expecting UNIQUE to stop two NULLs. In most databases it doesn\'t — NULL isn\'t equal to NULL.',
            ],
            dialects: [
                'SQLite checks foreign keys only after `PRAGMA foreign_keys = ON;`. MySQL ignored CHECK constraints before version 8.0.16.',
                'Upsert syntax: PostgreSQL and SQLite `ON CONFLICT … DO NOTHING / DO UPDATE`; MySQL `ON DUPLICATE KEY UPDATE`; SQL Server `MERGE`.',
            ],
            interviewAnswer: 'Constraints let the database enforce integrity on every write: NOT NULL for required values, UNIQUE and PRIMARY KEY for identity, FOREIGN KEY for valid references with a chosen delete behaviour, and CHECK for any rule on a row. I put these rules in the schema rather than only in application code, because the database sees every writer, and a violation fails the statement atomically instead of leaving bad data behind.',
            followUps: [
                { q: 'Can a UNIQUE column hold NULLs?', a: 'Yes, in most databases, and usually more than one NULL, because NULLs aren\'t equal to each other. (SQL Server allows only one by default.)' },
                { q: 'What does ON DELETE CASCADE do?', a: 'Deleting the parent row also deletes the child rows that reference it — handy for order_items when an order is deleted, dangerous elsewhere.' },
                { q: 'Why not just validate in the application?', a: 'Several apps, scripts and people write to the same database, and app checks can race. Constraints are checked by the database itself, atomically.' },
            ],
            practice: {
                explain: 'Explain each of the six constraints with one example from the practice tables.',
                write: 'Create a table with an email that must be unique and a price that must be positive, then insert one valid row and one row of each kind that fails.',
                predict: 'Will `UPDATE employees SET dept_id = 9 WHERE emp_id = 7;` succeed? Why or why not?',
                edge: 'Can you insert two subscribers whose email is NULL into a table where email is UNIQUE but not the primary key? Try it.',
            },
            resources: [
                w3('sql_constraints.asp', 'SQL Constraints'),
                postgresDocs('ddl-constraints.html', 'Constraints'),
                sqliteDocs('foreignkeys.html', 'Foreign Key Support'),
            ],
        },
        {
            id: 'sql6-t3',
            kind: 'lesson',
            name: 'INSERT, UPDATE and DELETE',
            priority: 'must',
            definition: 'INSERT adds new rows, UPDATE changes values in existing rows, and DELETE removes rows — and both UPDATE and DELETE act on every row their WHERE matches, or on every row of the table if there is no WHERE.',
            problem: 'A database is only useful if it can be kept up to date: new customers, price changes, cancelled orders. These three statements do all of that — and one missing WHERE can change or wipe every row, so they deserve care.',
            idea: '`INSERT INTO table (columns) VALUES (…)` adds a row; list the columns so the order is clear. `INSERT … SELECT` copies rows from a query. `UPDATE table SET column = value WHERE condition` changes matching rows, and the new value can use the old one (`salary = salary + 5000`). `DELETE FROM table WHERE condition` removes matching rows. An upsert — `INSERT … ON CONFLICT DO UPDATE` — inserts a row, or updates it if the key already exists.',
            analogy: 'Editing a spreadsheet. INSERT adds a new line at the bottom. UPDATE is find-and-replace — and WHERE is the "only in this selection" box. DELETE removes lines. Forgetting WHERE is "replace all" across the whole sheet.',
            breaks: 'A spreadsheet has Undo. The database doesn\'t: once a change is committed, it is permanent. That is why you run the WHERE as a SELECT first, and use transactions (next lesson) so you can roll back.',
            syntax: code`
                INSERT INTO t (col1, col2) VALUES (v1, v2);
                UPDATE t SET col1 = new_value WHERE condition;
                DELETE FROM t WHERE condition;
            `,
            howItWorks: [
                'INSERT adds Ravi as customer 7. The constraints are checked first.',
                '`UPDATE employees SET salary = salary + 5000 WHERE dept_id = 2`: Dara and Eli get the raise, nobody else.',
                '`DELETE FROM customers WHERE customer_id = 6` removes Tom\'s duplicate sign-up (he has no orders, so the foreign key allows it).',
                'Upsert: inserting product 7 again hits the primary key, so DO UPDATE changes its price instead.',
                'Safe habit: write `SELECT * FROM t WHERE …` first, check the rows, then turn it into the UPDATE or DELETE.',
            ],
            diagram: {
                code: 'flowchart LR\n  T["a table"] --> I["INSERT<br/>adds rows"]\n  T --> U["UPDATE … WHERE<br/>changes matching rows"]\n  T --> D["DELETE … WHERE<br/>removes matching rows"]\n  U -.->|"no WHERE"| ALL["every row changed"]\n  D -.->|"no WHERE"| ALL2["every row removed"]',
                caption: 'UPDATE and DELETE act on whatever their WHERE matches. Leave the WHERE out and they act on every row in the table.',
            },
            examples: [
                {
                    title: 'INSERT a new customer',
                    sql: code`
                        INSERT INTO customers (customer_id, name, email, city, signup_date)
                        VALUES (7, 'Ravi', 'ravi@mail.com', 'Leeds', '2024-03-25');
                        SELECT customer_id, name, city
                        FROM customers
                        WHERE city = 'Leeds'
                        ORDER BY customer_id;
                    `,
                    result: { columns: ['customer_id', 'name', 'city'], rows: [[2, 'Tom', 'Leeds'], [6, 'Tom', 'Leeds'], [7, 'Ravi', 'Leeds']] },
                },
                {
                    title: 'UPDATE using the old value',
                    sql: code`
                        UPDATE employees
                        SET salary = salary + 5000
                        WHERE dept_id = 2;
                        SELECT name, salary
                        FROM employees
                        WHERE dept_id = 2
                        ORDER BY name;
                    `,
                    result: { columns: ['name', 'salary'], rows: [['Dara', 65000], ['Eli', 50000]] },
                },
                {
                    title: 'DELETE one row',
                    sql: code`
                        DELETE FROM customers
                        WHERE customer_id = 6;
                        SELECT customer_id, name
                        FROM customers
                        ORDER BY customer_id;
                    `,
                    result: { columns: ['customer_id', 'name'], rows: [[1, 'Priya'], [2, 'Tom'], [3, 'Lena'], [4, 'Omar'], [5, 'Zoe']] },
                    note: 'Every run on this page starts from the original data, so this delete doesn\'t affect other examples.',
                },
                {
                    title: 'Upsert: insert, or update if it already exists',
                    sql: code`
                        INSERT INTO products (product_id, product_name, category, price)
                        VALUES (7, 'Phone case', 'Electronics', 12)
                        ON CONFLICT (product_id) DO UPDATE SET price = excluded.price;
                        SELECT product_id, product_name, price
                        FROM products
                        WHERE category = 'Electronics'
                        ORDER BY product_id;
                    `,
                    result: { columns: ['product_id', 'product_name', 'price'], rows: [[6, 'Headphones', 40], [7, 'Phone case', 12]] },
                    note: '`excluded` means "the row you tried to insert". The phone case already existed, so its price was updated from 15 to 12.',
                },
            ],
            keyPoints: [
                'Always list the columns in INSERT; don\'t rely on the table\'s column order.',
                'UPDATE and DELETE without WHERE change every row.',
                'Run the WHERE as a SELECT first, and check how many rows it hits.',
                '`INSERT INTO t (…) SELECT …` copies rows from a query.',
                'An upsert inserts or updates in one atomic statement.',
            ],
            mistakes: [
                'Forgetting WHERE on an UPDATE or DELETE.',
                'Deleting parent rows that child rows still reference — the foreign key refuses, or cascades if set to.',
                'Updating with a value computed from another table without checking the join returns one row per target row.',
            ],
            dialects: [
                'PostgreSQL and SQLite support `RETURNING` to see the rows you changed: `DELETE FROM t WHERE … RETURNING *`. SQL Server uses `OUTPUT`.',
                'UPDATE with a join: PostgreSQL `UPDATE t SET … FROM other WHERE …`; MySQL `UPDATE t JOIN other ON … SET …`; SQL Server `UPDATE t SET … FROM t JOIN other …`.',
            ],
            interviewAnswer: 'INSERT adds rows, ideally with an explicit column list; UPDATE changes columns in rows matched by WHERE, and DELETE removes matched rows. My safety habits are to run the WHERE as a SELECT first, wrap risky changes in a transaction so I can roll back, and use an upsert — insert on conflict do update — when a row may or may not exist, so it is a single atomic statement rather than a check-then-write race.',
            followUps: [
                { q: 'How would you safely delete a lot of rows?', a: 'Check the count with SELECT first, do it inside a transaction, and on very large tables delete in batches to avoid long locks.' },
                { q: 'Why is "check if it exists, then insert" a problem?', a: 'Two requests can both check, both see nothing, and both insert. An upsert or a UNIQUE constraint makes it atomic.' },
            ],
            practice: {
                explain: 'Explain why you should run the WHERE as a SELECT before an UPDATE or DELETE.',
                write: 'Give everyone in Engineering a 10% raise (whole pounds), then show their names and new salaries.',
                predict: 'How many rows does `DELETE FROM order_items WHERE quantity >= 3;` remove?',
                edge: 'Try `DELETE FROM customers WHERE customer_id = 1;`. What happens and why? What would ON DELETE CASCADE have done?',
            },
            resources: [
                sqlBolt('Lesson 13: Inserting rows'),
                w3('sql_update.asp', 'SQL UPDATE Statement'),
                cs50Sql('Lecture 3: Writing'),
            ],
        },
        {
            id: 'sql6-t4',
            kind: 'lesson',
            name: 'Transactions and ACID',
            priority: 'must',
            definition: 'A transaction groups several statements into one all-or-nothing unit — BEGIN, then the changes, then COMMIT to keep them or ROLLBACK to undo them — and ACID names the four guarantees it gives: Atomic, Consistent, Isolated, Durable.',
            problem: 'Moving money means taking £100 from one account and adding it to another. If the system crashes between the two, £100 vanishes. Transactions make sure either both changes happen or neither does — and that two people working at once don\'t corrupt each other\'s changes.',
            idea: 'BEGIN starts a transaction. Changes made inside are visible to you but not yet permanent. COMMIT makes them all permanent at once; ROLLBACK throws them all away. ACID: Atomic — all or nothing. Consistent — the data moves from one valid state to another, never breaking a constraint. Isolated — transactions running at the same time don\'t see each other\'s half-finished work (how strictly depends on the isolation level). Durable — once committed, it survives a crash.',
            analogy: 'A bank transfer slip that only counts when it is stamped. You can fill in both lines — take from here, add to there — but nothing happens until the stamp (COMMIT). Tear up the slip (ROLLBACK) and it is as if you never started.',
            breaks: 'A torn-up slip leaves no trace. Inside a database, a long open transaction holds locks that can make other people wait. Keep transactions short: never wait for user input inside one.',
            syntax: code`
                BEGIN;
                UPDATE ... ;
                UPDATE ... ;
                COMMIT;      -- or ROLLBACK;
            `,
            howItWorks: [
                'BEGIN opens the transaction.',
                'Two UPDATEs move Gus into HR and give him a raise. Only this transaction can see the changes so far.',
                'COMMIT makes both changes permanent together. A crash before COMMIT would undo both.',
                'In the second example, DELETE removes every item — then ROLLBACK undoes it, and all 14 rows are back.',
                'If any statement fails, you roll back, and the data is exactly as it was before BEGIN.',
            ],
            diagram: {
                code: 'flowchart LR\n  B["BEGIN"] --> S1["change 1"] --> S2["change 2"]\n  S2 --> C["COMMIT<br/>both kept, permanently"]\n  S2 --> R["ROLLBACK or a crash<br/>both undone"]',
                caption: 'Everything between BEGIN and COMMIT is one unit. It is either kept completely or thrown away completely — never half done.',
            },
            examples: [
                {
                    title: 'Two changes, committed together',
                    sql: code`
                        BEGIN;
                        UPDATE employees SET dept_id = 4 WHERE name = 'Gus';
                        UPDATE employees SET salary = salary + 2000 WHERE name = 'Gus';
                        COMMIT;
                        SELECT name, dept_id, salary FROM employees WHERE name = 'Gus';
                    `,
                    result: { columns: ['name', 'dept_id', 'salary'], rows: [['Gus', 4, 40000]] },
                },
                {
                    title: 'ROLLBACK undoes everything since BEGIN',
                    sql: code`
                        BEGIN;
                        DELETE FROM order_items;
                        ROLLBACK;
                        SELECT COUNT(*) AS items_after_rollback FROM order_items;
                    `,
                    result: { columns: ['items_after_rollback'], rows: [[14]] },
                    note: 'All 14 rows were deleted inside the transaction, then restored. Try adding a SELECT `COUNT(*)` before ROLLBACK to see 0.',
                },
            ],
            keyPoints: [
                'BEGIN … COMMIT makes several statements one all-or-nothing unit; ROLLBACK cancels it.',
                'Atomic: all or nothing. Consistent: constraints always hold. Isolated: concurrent transactions don\'t interfere. Durable: committed means saved.',
                'Isolation levels trade safety for speed: READ COMMITTED, REPEATABLE READ, SERIALIZABLE.',
                'Anomalies the levels prevent: dirty reads, non-repeatable reads, phantom reads.',
                'Keep transactions short; long ones hold locks and block others.',
                'Locks, write skew and transactions that span several services (sagas) are in the System Design tab, Phases 3 and 4.',
            ],
            mistakes: [
                'Running related changes without a transaction, so a failure halfway leaves the data inconsistent.',
                'Leaving a transaction open (forgetting COMMIT), which holds locks.',
                'Assuming the default isolation level prevents every race. Two transactions can still both read a balance and both write it.',
            ],
            dialects: [
                'Default isolation: PostgreSQL, SQL Server and Oracle use READ COMMITTED; MySQL InnoDB uses REPEATABLE READ; SQLite is effectively SERIALIZABLE.',
                'Most databases run each statement in its own transaction automatically (autocommit) unless you BEGIN one.',
            ],
            interviewAnswer: 'A transaction groups statements into an atomic unit — BEGIN, changes, then COMMIT or ROLLBACK. ACID means atomicity, all or nothing; consistency, constraints hold before and after; isolation, concurrent transactions don\'t see each other\'s uncommitted work; and durability, committed changes survive crashes. Isolation is tunable — read committed, repeatable read, serializable — trading anomalies like non-repeatable or phantom reads against concurrency, so for something like a balance update I lock the row with SELECT FOR UPDATE or use serializable.',
            followUps: [
                { q: 'What is a dirty read?', a: 'Reading another transaction\'s changes before it commits. If it then rolls back, you read data that never existed. READ COMMITTED prevents it.' },
                { q: 'What is a phantom read?', a: 'Running the same query twice in one transaction and getting new rows the second time because someone inserted them. SERIALIZABLE prevents it.' },
                { q: 'How do you stop two transfers overdrawing an account at the same time?', a: 'Lock the row while you check and update it (`SELECT … FOR UPDATE`), use SERIALIZABLE, or update with a condition: `UPDATE accounts SET balance = balance - 100 WHERE id = 1 AND balance >= 100`.' },
            ],
            practice: {
                explain: 'Explain each letter of ACID with the bank-transfer example.',
                write: 'In one transaction, move Eli to Marketing and give him a £3000 raise, then show his row.',
                predict: 'What does the second example return if you remove the ROLLBACK line?',
                edge: 'Two people run "read the stock, subtract 1, write it back" at the same moment on a product with 1 left. What can go wrong, and how do you prevent it?',
            },
            resources: [
                postgresDocs('tutorial-transactions.html', 'Transactions (tutorial)'),
                postgresDocs('transaction-iso.html', 'Transaction Isolation'),
                watch('ACID transactions explained database', 'ACID transactions explained (video)'),
            ],
        },
        {
            id: 'sql6-t5',
            kind: 'lesson',
            name: 'Normalisation: designing tables that don\'t contradict themselves',
            priority: 'must',
            definition: 'Normalisation is designing tables so each fact is stored in exactly one place — usually to third normal form (3NF): one value per cell, and every column depends on the key, the whole key, and nothing but the key.',
            problem: 'If every order row stored the customer\'s email, changing Priya\'s email means updating five rows — miss one and the database says two different things. That is an update anomaly. Normalisation designs it out, and it is a favourite interview question.',
            idea: 'First normal form (1NF): one value per cell, no lists like \'Pen, Mug\', and no repeating columns like item1, item2. Second (2NF): in a table with a composite key, every column must depend on the whole key — the product name depends only on product_id, so it belongs in products, not in order_items. Third (3NF): no column depends on another non-key column — a customer\'s city name shouldn\'t carry the city\'s country too; that belongs in a cities table. The practice database is already normalised: customers, orders, order_items and products each hold one kind of fact. Denormalisation is copying data back on purpose, for read speed, accepting the risk.',
            analogy: 'A school keeping each pupil\'s address in one office file, instead of writing it on every exercise book. When a family moves, one change updates everything — and no book can show an old address.',
            breaks: 'In a school, looking up the office file is quick. In a database, every split costs a join at read time. That is why analytics warehouses often denormalise on purpose: reads there matter more than updates.',
            howItWorks: [
                'Start with one wide "flat" table: order, customer name, email, product, price, quantity.',
                'Priya\'s email appears on every line she bought — 9 times. Changing it means 9 updates.',
                '1NF: one product per row, not \'Headphones, Backpack\' in one cell.',
                '2NF: product_name and price depend only on product_id, so they move to products; customer details move to customers.',
                '3NF: nothing depends on a non-key column. What is left is the practice database: each fact once, joined back when needed.',
            ],
            diagram: {
                code: 'flowchart LR\n  F["one flat table<br/>order, customer name, email,<br/>product, price, quantity"] -->|"normalise"| C["customers<br/>id, name, email"]\n  F --> O["orders<br/>id, customer_id, date"]\n  F --> OI["order_items<br/>order_id, product_id, quantity"]\n  F --> P["products<br/>id, name, price"]',
                caption: 'Normalising splits a wide table so each fact lives in one place. Joins put the flat view back together when you need it — the next example does exactly that.',
            },
            examples: [
                {
                    title: 'What one flat table would look like (built with joins)',
                    sql: code`
                        SELECT o.order_id, c.name, c.email, p.product_name, p.price, oi.quantity
                        FROM order_items oi
                        JOIN orders o    ON o.order_id = oi.order_id
                        JOIN customers c ON c.customer_id = o.customer_id
                        JOIN products p  ON p.product_id = oi.product_id
                        WHERE o.customer_id = 1
                        ORDER BY o.order_id, p.product_name;
                    `,
                    result: {
                        columns: ['order_id', 'name', 'email', 'product_name', 'price', 'quantity'],
                        rows: [
                            [101, 'Priya', 'priya@mail.com', 'Headphones', 40, 3],
                            [102, 'Priya', 'priya@mail.com', 'Backpack', 30, 1],
                            [102, 'Priya', 'priya@mail.com', 'Desk lamp', 25, 2],
                            [103, 'Priya', 'priya@mail.com', 'Mug', 8, 5],
                            [103, 'Priya', 'priya@mail.com', 'Notebook', 5, 1],
                            [105, 'Priya', 'priya@mail.com', 'Backpack', 30, 1],
                            [105, 'Priya', 'priya@mail.com', 'Headphones', 40, 3],
                            [109, 'Priya', 'priya@mail.com', 'Notebook', 5, 4],
                            [109, 'Priya', 'priya@mail.com', 'Pen', 2, 5],
                        ],
                    },
                    note: 'Priya\'s email is repeated 9 times and each price several times. Stored like this, one missed update would make them disagree. Normalised, each is stored once.',
                },
            ],
            keyPoints: [
                '1NF: one value per cell; no lists, no repeating column groups.',
                '2NF: 1NF, and no column depends on just part of a composite key.',
                '3NF: 2NF, and no column depends on another non-key column.',
                'Normalised data avoids update, insert and delete anomalies; the cost is more joins.',
                'Denormalise on purpose (reporting tables, caches) when reads matter more than keeping one copy.',
            ],
            mistakes: [
                'Storing comma-separated lists in a column.',
                'Copying a value (like a price) into another table without deciding whether it should change when the source changes.',
                'Normalising so far that simple questions need eight joins. 3NF is usually the right stop.',
            ],
            dialects: [
                'Real order systems often store unit_price in order_items on purpose: the price paid at the time must not change when the product\'s price changes later. That isn\'t a 2NF violation — it is a different fact.',
            ],
            interviewAnswer: 'Normalisation organises tables so each fact is stored once, which prevents update, insert and delete anomalies. First normal form means atomic values with no repeating groups; second, no partial dependency on part of a composite key; third, no transitive dependency through a non-key column — every column depends on the key, the whole key and nothing but the key. I normalise transactional systems to about 3NF and denormalise deliberately for analytics or read-heavy paths.',
            followUps: [
                { q: 'What is an update anomaly?', a: 'When the same fact is stored in several rows and an update changes some but not all of them, so the data contradicts itself.' },
                { q: 'When would you denormalise?', a: 'For read-heavy reporting or performance — for example a star schema in a data warehouse — accepting extra storage and the work of keeping copies in sync.' },
                { q: 'What is BCNF?', a: 'Boyce–Codd normal form, a slightly stricter 3NF: every determinant must be a candidate key. It rarely comes up beyond the definition.' },
            ],
            practice: {
                explain: 'Explain 1NF, 2NF and 3NF in one sentence each, using the shop tables.',
                write: 'Write the query that rebuilds the flat view for Tom (customer 2), and count how many times his email appears.',
                predict: 'If products also stored the category\'s manager name, which normal form would that break, and why?',
                edge: 'Should order_items store the price at the time of the order? Argue both sides.',
            },
            resources: [
                watch('database normalization 1NF 2NF 3NF explained', 'Database normalisation: 1NF, 2NF, 3NF (video)'),
                cs50Sql('Lecture 2: Designing'),
                w3('sql_foreignkey.asp', 'SQL FOREIGN KEY (linking normalised tables)'),
            ],
        },
        {
            id: 'sql6-t6',
            kind: 'lesson',
            name: 'Views: saved queries you can use like tables',
            priority: 'should',
            definition: 'A view is a named, saved SELECT that you query like a table; it stores no data of its own, so it always shows the current data, while a materialised view stores the result and must be refreshed.',
            problem: 'The same "customer totals" query gets copied into ten reports, and when the rule changes, nine get fixed. A view keeps one definition in the database that everyone uses. Views can also hide columns people shouldn\'t see.',
            idea: '`CREATE VIEW customer_totals AS SELECT …` saves the query under a name. `SELECT * FROM customer_totals` runs it. Because the view is only a query, a new order shows up the next time you read it. A materialised view (PostgreSQL, Oracle) is different: it saves the rows, so reading is fast, but the data is only as fresh as the last REFRESH.',
            analogy: 'A saved search in your email: "unread from my manager". It doesn\'t copy any emails; it runs the search every time you open it. A materialised view is a printed list of those emails — fast to read, but out of date as soon as a new one arrives.',
            breaks: 'A saved search is free to run. A view over a big, complex query costs the full query every time you read it — a view makes queries shorter to write, not faster to run.',
            syntax: code`
                CREATE VIEW view_name AS
                SELECT ...;

                SELECT * FROM view_name WHERE ...;
            `,
            howItWorks: [
                'CREATE VIEW stores the query text under the name customer_totals.',
                'Selecting from the view runs that query and then applies your WHERE and ORDER BY.',
                'Insert a new order for Omar, read the view again, and his total is already there.',
                'A materialised view would still show his old total until it is refreshed.',
            ],
            diagram: {
                code: 'flowchart LR\n  T["orders + customers<br/>(real tables)"] -->|"view runs its query<br/>every time"| V["customer_totals<br/>(view: no data stored)"]\n  V --> Q["your SELECT"]\n  T -.->|"copied at refresh"| M["materialised view<br/>(stored rows)"]',
                caption: 'A view is a window onto the tables: it runs its query each time, so it is always current. A materialised view is a stored copy — fast, but only as fresh as its last refresh.',
            },
            examples: [
                {
                    title: 'Create a view and query it like a table',
                    sql: code`
                        CREATE VIEW customer_totals AS
                        SELECT c.customer_id, c.name,
                               COUNT(o.order_id) AS orders,
                               COALESCE(SUM(o.amount), 0) AS total_spent
                        FROM customers c
                        LEFT JOIN orders o ON o.customer_id = c.customer_id
                        GROUP BY c.customer_id, c.name;

                        SELECT name, total_spent
                        FROM customer_totals
                        WHERE total_spent > 50
                        ORDER BY total_spent DESC;
                    `,
                    result: { columns: ['name', 'total_spent'], rows: [['Priya', 425], ['Tom', 275], ['Lena', 60]] },
                },
                {
                    title: 'A view is always up to date',
                    sql: code`
                        CREATE VIEW customer_totals AS
                        SELECT c.customer_id, c.name, COALESCE(SUM(o.amount), 0) AS total_spent
                        FROM customers c
                        LEFT JOIN orders o ON o.customer_id = c.customer_id
                        GROUP BY c.customer_id, c.name;

                        INSERT INTO orders VALUES (111, 4, '2024-03-25', 90, 'pending');

                        SELECT name, total_spent FROM customer_totals WHERE customer_id = 4;
                    `,
                    result: { columns: ['name', 'total_spent'], rows: [['Omar', 90]] },
                    note: 'Omar had spent 0. The new order appears straight away, because the view re-runs its query.',
                },
            ],
            keyPoints: [
                'A view is a saved query, used like a table. It stores no rows.',
                'Views give one shared definition of a metric, and can hide sensitive columns.',
                'A view is as fast as its underlying query — it doesn\'t speed things up.',
                'A materialised view stores the result: fast reads, stale until refreshed.',
            ],
            mistakes: [
                'Expecting a normal view to make a slow query fast.',
                'Stacking views on views until no one can tell what a query really does.',
                'Forgetting to refresh a materialised view and reporting old numbers.',
            ],
            dialects: [
                'Materialised views: PostgreSQL `CREATE MATERIALIZED VIEW` + `REFRESH MATERIALIZED VIEW`; Oracle has them; SQL Server uses "indexed views"; MySQL and SQLite have none.',
            ],
            interviewAnswer: 'A view is a stored query that behaves like a virtual table: it holds no data, so it is always current, and it is useful for sharing one definition of a metric or for restricting which columns people see. It doesn\'t make queries faster. When the query is expensive and slight staleness is fine, I use a materialised view, which stores the result and is refreshed on a schedule.',
            followUps: [
                { q: 'View or materialised view?', a: 'A view runs its query on every read and is always fresh. A materialised view stores the result: fast to read, stale until refreshed.' },
                { q: 'Can you INSERT into a view?', a: 'Into simple views over one table, often yes. Views with joins or aggregates generally can\'t be written to without extra rules or triggers.' },
            ],
            practice: {
                explain: 'Explain the difference between a view and a materialised view.',
                write: 'Create a view product_sales with each product and the total quantity sold (0 if none), then select the top 3 from it.',
                predict: 'If you UPDATE an order amount, does SELECT from customer_totals show the new total? Would a materialised view?',
                edge: 'Your view uses `SELECT *` from a table, and someone adds a column to that table. What might happen? Why is it safer to list columns?',
            },
            resources: [
                w3('sql_view.asp', 'SQL Views'),
                postgresDocs('rules-materializedviews.html', 'Materialized Views'),
                sqliteDocs('lang_createview.html', 'CREATE VIEW'),
            ],
        },
        {
            id: 'sql6-t7',
            kind: 'lesson',
            name: 'DDL, DML, DCL, TCL — and DELETE versus TRUNCATE versus DROP',
            priority: 'should',
            definition: 'SQL commands fall into four families — DDL changes structure (CREATE, ALTER, DROP), DML changes data (INSERT, UPDATE, DELETE), DCL controls access (GRANT, REVOKE) and TCL controls transactions (COMMIT, ROLLBACK) — and DELETE, TRUNCATE and DROP remove rows, all rows, or the whole table.',
            problem: '"What is the difference between DELETE, TRUNCATE and DROP?" is one of the most asked SQL theory questions. Knowing the four families answers it neatly, because the three belong to different families.',
            idea: 'DDL (Data Definition Language) defines the shape: CREATE, ALTER, DROP, TRUNCATE. DML (Data Manipulation Language) works on rows: SELECT, INSERT, UPDATE, DELETE. DCL (Data Control Language) gives and takes permissions: GRANT, REVOKE. TCL (Transaction Control Language): BEGIN, COMMIT, ROLLBACK, SAVEPOINT. DELETE is DML: it removes rows one by one, can have a WHERE, fires triggers, and can be rolled back. TRUNCATE is DDL-like: it empties the whole table at once, very fast, with no WHERE. DROP removes the table itself — rows, structure, indexes and all.',
            analogy: 'A filing cabinet. DELETE takes out chosen files one at a time. TRUNCATE tips the whole drawer into the bin. DROP throws away the cabinet.',
            breaks: 'Bins can be searched afterwards. Whether TRUNCATE can be undone depends on the database: PostgreSQL and SQL Server can roll it back inside a transaction; MySQL and Oracle commit it immediately.',
            syntax: code`
                DELETE FROM t WHERE condition;   -- DML: chosen rows
                TRUNCATE TABLE t;                -- DDL: all rows, fast
                DROP TABLE t;                    -- DDL: the table itself
            `,
            howItWorks: [
                '`DELETE FROM order_items WHERE order_id = 110` removes 2 of the 14 rows; 12 remain.',
                'TRUNCATE would remove all 14 rows instantly and keep the empty table (SQLite has no TRUNCATE; DELETE without WHERE does the same job).',
                'DROP TABLE order_items removes the table completely: querying it afterwards is an error.',
                'The catalog (the database\'s list of its own tables) shows the table is gone.',
            ],
            diagram: {
                code: 'flowchart LR\n  D["DELETE … WHERE<br/>DML · chosen rows<br/>can roll back"] --> T["TRUNCATE<br/>all rows, fast<br/>table stays"] --> X["DROP<br/>table, rows,<br/>indexes: all gone"]',
                caption: 'From least to most destructive: DELETE removes the rows you choose, TRUNCATE empties the table but keeps it, and DROP removes the table itself.',
            },
            examples: [
                {
                    title: 'DELETE with a WHERE removes only some rows',
                    sql: code`
                        DELETE FROM order_items WHERE order_id = 110;
                        SELECT COUNT(*) AS items_left FROM order_items;
                    `,
                    result: { columns: ['items_left'], rows: [[12]] },
                },
                {
                    title: 'DROP removes the table itself',
                    sql: code`
                        DROP TABLE order_items;
                        SELECT name
                        FROM sqlite_master
                        WHERE type = 'table'
                        ORDER BY name;
                    `,
                    result: { columns: ['name'], rows: [['customers'], ['departments'], ['employees'], ['orders'], ['products']] },
                    note: 'sqlite_master is SQLite\'s list of its own tables; PostgreSQL and MySQL use information_schema.tables.',
                },
            ],
            keyPoints: [
                'DDL: CREATE, ALTER, DROP, TRUNCATE. DML: SELECT, INSERT, UPDATE, DELETE. DCL: GRANT, REVOKE. TCL: COMMIT, ROLLBACK, SAVEPOINT.',
                'DELETE: chosen rows, WHERE allowed, row by row, fires triggers, can be rolled back.',
                'TRUNCATE: every row, no WHERE, very fast, usually resets auto-numbering.',
                'DROP: the table and everything about it.',
                'TRUNCATE and DROP are refused if other tables\' foreign keys point at the table (unless you CASCADE).',
            ],
            mistakes: [
                'Using TRUNCATE when you meant to keep some rows — it has no WHERE.',
                'Assuming TRUNCATE can always be rolled back — not in MySQL or Oracle.',
                'Dropping a table that views or foreign keys still depend on.',
            ],
            dialects: [
                'SQLite has no TRUNCATE; `DELETE FROM t;` without WHERE is optimised to do the same thing.',
                'PostgreSQL: `TRUNCATE … RESTART IDENTITY CASCADE` resets numbering and empties referencing tables too.',
            ],
            interviewAnswer: 'SQL commands split into DDL for structure, DML for data, DCL for permissions and TCL for transactions. DELETE is DML: it removes rows matching a WHERE, logs each row, fires triggers and can be rolled back. TRUNCATE removes all rows at once — much faster, no WHERE, often resets identity counters, and in some databases can\'t be rolled back. DROP removes the table definition along with its data, indexes and permissions.',
            followUps: [
                { q: 'Which is faster for emptying a big table, DELETE or TRUNCATE?', a: 'TRUNCATE: it deallocates the data in one step instead of deleting and logging each row.' },
                { q: 'Is SELECT DML or something else?', a: 'Usually counted as DML; some books call it DQL (Data Query Language).' },
            ],
            practice: {
                explain: 'Explain DELETE, TRUNCATE and DROP with the filing-cabinet analogy, then technically.',
                write: 'Delete all cancelled orders and their items (items first, because of the foreign key), then count what is left in both tables.',
                predict: 'After `DELETE FROM products;`, how many rows are in products — and does the statement succeed? (Think about order_items.)',
                edge: 'Which family does each belong to: GRANT, SAVEPOINT, ALTER, SELECT, TRUNCATE?',
            },
            resources: [
                w3('sql_delete.asp', 'SQL DELETE Statement'),
                postgresDocs('sql-truncate.html', 'TRUNCATE'),
                sqlBolt('Lesson 18: Dropping tables'),
            ],
        },
    ],
};
