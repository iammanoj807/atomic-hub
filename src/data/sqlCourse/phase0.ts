import type { SqlPhase } from '../sql';
import { practiceDbDiagram } from '../sqlPracticeDb';
import { code } from './code';
import { cs50Sql, selectStarSql, sqlBolt, w3, sqliteDocs, postgresDocs } from './resources';

export const sqlPhase0: SqlPhase = {
    id: 'start-here',
    number: 0,
    short: 'Start here',
    title: 'Start here: databases, tables and SQL',
    accent: '#90a4ae',
    goal: 'Know what a database is, what a table, a row and a key are, and the six practice tables you will use in every lesson.',
    bigPicture: 'Almost every app keeps its data in a relational database, and SQL is how you ask it questions. Learn the shape of the data first — tables, rows, keys — and every later topic is just a new way of asking.',
    topics: [
        {
            id: 'sql0-t1',
            kind: 'lesson',
            name: 'What a database, a table and SQL are',
            priority: 'must',
            definition: 'A relational database stores data in tables of rows and columns, and SQL (Structured Query Language) is the language you use to ask it questions and to change what it holds.',
            problem: 'A spreadsheet works for a few hundred rows and one person. An app with thousands of users needs data that many people can read and change at the same time, safely, without losing anything, and fast enough to answer in milliseconds. A database does that job, and SQL is how you talk to it.',
            idea: 'A database is an organised store of data, run by a program called a DBMS (database management system), such as PostgreSQL, MySQL, SQL Server or SQLite. The data lives in tables. A table is like one sheet in a spreadsheet: each row is one thing (one employee, one order) and each column is one fact about it (name, salary). You never open the files yourself. You send the database a query — a request written in SQL — and it sends back rows.',
            analogy: 'A library with a librarian. The shelves are the tables, each book is a row, and the details on its catalogue card (title, author, year) are the columns. You don\'t walk the shelves yourself: you hand the librarian a request slip — "every book by this author, newest first" — and they bring back exactly those books.',
            breaks: 'A librarian fetches books one by one, in the order you asked. SQL is declarative: you describe what you want, not how to get it, and the database picks its own way. That is why the order you write a query in is not the order it runs in.',
            syntax: code`
                SELECT column, other_column
                FROM table_name
                WHERE condition;
            `,
            howItWorks: [
                'You write a query in SQL, for example: give me the name and salary of everyone in department 1.',
                'You send it to the database, from a SQL editor, a Python script, or your app\'s backend.',
                'The database checks the query makes sense: do these tables and columns exist?',
                'Its query planner picks the fastest way to find the rows, for example by using an index.',
                'It runs that plan and returns the result: a new, temporary table of rows and columns.',
                'Reading never changes the stored tables. A SELECT is always safe to run.',
            ],
            diagram: {
                code: 'flowchart LR\n  Y["You or your app"] -->|"1 a SQL query"| P["Database (DBMS)<br/>checks and plans it"]\n  P -->|"2 reads"| T[("Tables<br/>rows and columns")]\n  T --> P\n  P -->|"3 the result: a new table"| Y',
                caption: 'Follow the numbers. You send a query, the database works out how to answer it and reads its tables, and you get back a result — which is itself a small table.',
            },
            examples: [
                {
                    title: 'Your first query',
                    sql: code`
                        SELECT name, salary
                        FROM employees
                        WHERE dept_id = 1
                        ORDER BY name;
                    `,
                    result: {
                        columns: ['name', 'salary'],
                        rows: [['Asha', 95000], ['Ben', 70000], ['Chen', 70000], ['Hana', 80000]],
                    },
                    note: 'Read it like English: select the name and salary, from the employees table, where the department is 1, sorted by name. The answer is a small table of four rows.',
                },
            ],
            keyPoints: [
                'A table holds one kind of thing. A row is one of them; a column is one fact about each.',
                'SQL is declarative: you say what you want, and the database decides how to get it.',
                'The result of a query is itself a table. That is why a query can be put inside another query.',
                'SQL keywords are not case-sensitive (`select` works), but writing them in capitals makes a query easier to read.',
                'Every major database speaks SQL. The core is the same everywhere; small details such as dates and LIMIT differ, and these notes point them out.',
                'How databases scale — SQL versus NoSQL, replication, sharding — is in the System Design tab, Phase 3.',
            ],
            mistakes: [
                'Thinking SQL runs top to bottom like Python. It doesn\'t: the database reads FROM first and SELECT near the end.',
                'Thinking a database is just a big spreadsheet. It also enforces rules, handles many users at once and survives crashes.',
                'Forgetting the semicolon between two statements. One statement on its own usually runs without it.',
            ],
            dialects: [
                'This page runs SQLite, a small database that lives inside one file — here, inside your browser. PostgreSQL, MySQL and SQL Server run as servers, but the SQL you learn here is the same for almost everything you will write.',
            ],
            interviewAnswer: 'A relational database stores data in tables, where each row is one record and each column is one attribute, and the tables are linked through keys. SQL is the declarative language for querying and changing that data: I describe the result I want, and the database\'s optimiser decides how to get it. That separation is why the same query can become much faster just by adding an index.',
            followUps: [
                { q: 'What is the difference between a database and a DBMS?', a: 'The database is the data itself. The DBMS is the software that stores it and answers queries: PostgreSQL, MySQL, SQL Server, SQLite.' },
                { q: 'What does "declarative" mean?', a: 'You describe the result you want, not the steps to get it. The database chooses the steps, which is called its query plan.' },
                { q: 'When would you not use a relational database?', a: 'When the data has no fixed shape, or one simple lookup by key must scale across many machines — a key-value or document store can fit better. For most products, a relational database is the right default.' },
            ],
            practice: {
                explain: 'Explain to a friend who uses Excel what a table, a row, a column and a query are, using the employees table.',
                write: 'Write a query that returns the name and hire_date of every employee in department 2, sorted by name.',
                predict: 'Before running it, say how many rows `SELECT name FROM employees WHERE salary > 60000;` returns, and which names.',
                edge: 'Gus has no department. Will he appear in `SELECT name FROM employees WHERE dept_id = 1;`? Will he appear if there is no WHERE at all?',
            },
            resources: [
                cs50Sql('Lecture 0: Querying'),
                sqlBolt('Lesson 1: SELECT queries 101'),
                selectStarSql,
            ],
        },
        {
            id: 'sql0-t2',
            kind: 'lesson',
            name: 'Meet the practice database',
            priority: 'must',
            definition: 'Six small tables — departments, employees, customers, orders, products and order_items — that every example and exercise in this course uses.',
            problem: 'Learning SQL on a different made-up table in every lesson means learning new data each time. With one small database you get to know the rows by heart, so you can check any result by eye. That habit is what catches wrong queries, at work and in interviews.',
            idea: 'There are two small worlds. The company: departments, and employees who belong to a department and report to a manager. The shop: customers place orders, each order contains products, and order_items records which products are in which order, and how many. A few awkward cases are planted on purpose, because real data always has them: an employee with no department, a customer with no orders, two people on the same salary, and an order with no amount.',
            analogy: 'A training kitchen with a fixed pantry. Every recipe (query) uses the same ingredients, so you learn how each one behaves, and you notice straight away when a dish comes out wrong.',
            breaks: 'Real databases have hundreds of tables and millions of rows, so you can\'t check results by eye there. That is exactly why it pays to practise on data small enough that you can, and to build the habit of testing a query on a few known rows.',
            howItWorks: [
                'departments (4 rows): Engineering, Sales, Marketing and HR. HR has no employees yet.',
                'employees (8 rows): each has a dept_id that points at departments, and a manager_id that points at another employee. Asha runs the company, so her manager_id is NULL. Gus has no department.',
                'customers (6 rows): Tom signed up twice with the same email. Omar has never ordered. Zoe didn\'t give a city.',
                'orders (10 rows), from January to March 2024: each has a customer_id. Order 106 was cancelled and has no amount.',
                'products (7 rows): nobody has bought the phone case.',
                'order_items (14 rows): one row per product in an order, with the quantity. An order\'s amount is the sum of quantity × price over its items.',
            ],
            diagram: practiceDbDiagram,
            examples: [
                {
                    title: 'The departments table',
                    sql: code`
                        SELECT *
                        FROM departments
                        ORDER BY dept_id;
                    `,
                    result: {
                        columns: ['dept_id', 'dept_name', 'location'],
                        rows: [[1, 'Engineering', 'London'], [2, 'Sales', 'Manchester'], [3, 'Marketing', 'London'], [4, 'HR', 'Leeds']],
                    },
                    note: '`SELECT *` means every column. Use it to look at a table; in real queries, name the columns you need.',
                },
                {
                    title: 'The employees table',
                    sql: code`
                        SELECT *
                        FROM employees
                        ORDER BY emp_id;
                    `,
                    result: {
                        columns: ['emp_id', 'name', 'dept_id', 'manager_id', 'salary', 'hire_date'],
                        rows: [
                            [1, 'Asha', 1, null, 95000, '2019-03-01'],
                            [2, 'Ben', 1, 1, 70000, '2020-06-15'],
                            [3, 'Chen', 1, 1, 70000, '2021-01-10'],
                            [4, 'Dara', 2, 1, 60000, '2020-02-20'],
                            [5, 'Eli', 2, 4, 45000, '2022-07-01'],
                            [6, 'Fatima', 3, 1, 52000, '2021-09-12'],
                            [7, 'Gus', null, 4, 38000, '2023-04-03'],
                            [8, 'Hana', 1, 2, 80000, '2022-11-30'],
                        ],
                    },
                    note: 'Spot the planted cases: Asha\'s manager_id is NULL, Gus\'s dept_id is NULL, Ben and Chen both earn 70000, and Hana (80000) earns more than her manager Ben.',
                },
                {
                    title: 'The orders table',
                    sql: code`
                        SELECT *
                        FROM orders
                        ORDER BY order_id;
                    `,
                    result: {
                        columns: ['order_id', 'customer_id', 'order_date', 'amount', 'status'],
                        rows: [
                            [101, 1, '2024-01-06', 120, 'delivered'],
                            [102, 1, '2024-01-07', 80, 'delivered'],
                            [103, 1, '2024-01-08', 45, 'delivered'],
                            [104, 2, '2024-01-21', 200, 'delivered'],
                            [105, 1, '2024-02-02', 150, 'shipped'],
                            [106, 3, '2024-02-12', null, 'cancelled'],
                            [107, 3, '2024-02-20', 60, 'delivered'],
                            [108, 2, '2024-03-01', 75, 'delivered'],
                            [109, 1, '2024-03-10', 30, 'delivered'],
                            [110, 5, '2024-03-16', 33, 'pending'],
                        ],
                    },
                    note: 'Customer 1 (Priya) placed five orders, three of them on consecutive days. Order 106 has no amount.',
                },
            ],
            keyPoints: [
                'employees.dept_id points at departments.dept_id; employees.manager_id points at employees.emp_id — the same table.',
                'orders.customer_id points at customers.customer_id.',
                'order_items links orders and products: one row per product in an order.',
                'Dates are stored as text in YYYY-MM-DD form, so sorting them as text also sorts them by date.',
                'Amounts and prices are whole pounds, to keep the sums easy to check by hand.',
            ],
            mistakes: [
                'Assuming every employee has a department, or every customer has an order. NULLs and missing rows are where most wrong answers come from.',
                'Assuming ids are in date order. Here they happen to be; in real data, always sort by the date column.',
                'Writing a query before knowing the grain of each table — what one row means.',
            ],
            interviewAnswer: 'Before writing any SQL in an interview, I look at the tables: what one row means in each, which columns are keys, and how the tables join. Then I ask about the awkward cases — can this be NULL, can there be duplicates, can a customer have no orders — because those decide whether I need a LEFT JOIN, a DISTINCT or a COALESCE. Two minutes of that saves a wrong answer.',
            followUps: [
                { q: 'Why look at the data before writing the query?', a: 'To learn the grain, the keys, and the awkward cases — NULLs, duplicates, missing matches — that change the answer.' },
                { q: 'What is the grain of a table?', a: 'What one row represents. One row of orders is one order; one row of order_items is one product within one order. Mixing grains is how totals get counted twice.' },
            ],
            practice: {
                explain: 'Without looking, say what one row of order_items means, and how it connects orders to products.',
                write: 'Write a query that shows every column of the customers table, sorted by customer_id.',
                predict: 'How many rows does `SELECT * FROM order_items WHERE order_id = 102;` return, and which products are they?',
                edge: 'List the planted cases from memory: who has no manager, who has no department, who has no orders, which product never sold, and which order has no amount.',
            },
            resources: [
                cs50Sql('Lecture 0: Querying'),
                sqlBolt('Lesson 1: SELECT queries 101'),
            ],
        },
        {
            id: 'sql0-t3',
            kind: 'lesson',
            name: 'Keys and relationships: primary keys, foreign keys, one-to-many, many-to-many',
            priority: 'must',
            definition: 'A primary key is a column whose value identifies exactly one row; a foreign key is a column that holds another table\'s primary key, and those links are how tables relate: one-to-many, many-to-many or one-to-one.',
            problem: 'If every order repeated the customer\'s name, email and city, changing an email would mean editing every one of their orders — and one missed row would leave two different emails. Splitting data into tables linked by keys stores each fact once. Keys are also what joins use to put the rows back together.',
            idea: 'Every table has a primary key: a column, like emp_id, that is never empty and never repeats, so it points at exactly one row. A foreign key is a column in another table that stores those ids, like orders.customer_id: it says "this order belongs to customer 1". The database can enforce it, so you can\'t add an order for a customer who doesn\'t exist. Relationships come in three shapes. One-to-many: one customer, many orders — the foreign key sits on the "many" side. Many-to-many: an order has many products and a product is in many orders, so a link table (order_items) holds pairs of keys. One-to-one: one row matches at most one row, such as a user and their settings.',
            analogy: 'Passport numbers. Your passport number is your primary key: one per person, never shared. When a hotel writes your passport number on its booking, that is a foreign key: the booking doesn\'t copy your whole life story, it just points at you.',
            breaks: 'A passport number means something in the real world. Good primary keys usually mean nothing at all — just a counter like 1, 2, 3, called a surrogate key — because real-world values like emails can change, and a key should never change.',
            syntax: code`
                CREATE TABLE orders (
                  order_id    INTEGER PRIMARY KEY,
                  customer_id INTEGER REFERENCES customers(customer_id)
                );
            `,
            howItWorks: [
                'customers.customer_id is the primary key: the values 1 to 6, each used once.',
                'orders.customer_id is a foreign key: order 101 holds 1, which means "Priya placed this".',
                'One customer can appear in many orders (Priya is in five), but each order points at exactly one customer. That is one-to-many.',
                'order_items has a composite primary key: the pair (order_id, product_id). One order holds many products and one product is in many orders. That is many-to-many, and order_items is the link table.',
                'employees.manager_id is a foreign key into its own table: Ben\'s manager_id is 1, which is Asha\'s emp_id. This is a self-reference, and it is how org charts and folder trees are stored.',
            ],
            diagram: {
                code: 'flowchart LR\n  subgraph C["customers: primary key customer_id"]\n    C1["1 · Priya"]\n    C2["2 · Tom"]\n    C4["4 · Omar"]\n  end\n  subgraph O["orders: foreign key customer_id"]\n    O1["101 · customer 1"]\n    O2["102 · customer 1"]\n    O3["104 · customer 2"]\n  end\n  O1 -->|"points to"| C1\n  O2 --> C1\n  O3 --> C2',
                caption: 'Each order stores only its customer\'s id. Many orders can point at the same customer (one-to-many), each order points at exactly one customer, and a customer like Omar may have no orders at all.',
            },
            examples: [
                {
                    title: 'Follow a foreign key by hand',
                    sql: code`
                        SELECT order_id, customer_id, amount
                        FROM orders
                        WHERE customer_id = 1
                        ORDER BY order_id;
                    `,
                    result: {
                        columns: ['order_id', 'customer_id', 'amount'],
                        rows: [[101, 1, 120], [102, 1, 80], [103, 1, 45], [105, 1, 150], [109, 1, 30]],
                    },
                    note: 'All five orders hold customer_id 1, so all five belong to Priya. In Phase 3, a JOIN will fetch her name for you.',
                },
                {
                    title: 'Many-to-many through the link table',
                    sql: code`
                        SELECT order_id, product_id, quantity
                        FROM order_items
                        WHERE product_id = 6
                        ORDER BY order_id;
                    `,
                    result: {
                        columns: ['order_id', 'product_id', 'quantity'],
                        rows: [[101, 6, 3], [104, 6, 5], [105, 6, 3]],
                    },
                    note: 'Headphones (product 6) appear in three different orders, and order 105 also contains a backpack. Neither column is unique on its own; the pair is.',
                },
            ],
            keyPoints: [
                'A primary key is unique and never NULL. A table has exactly one, though it may span several columns.',
                'A foreign key holds values of another table\'s primary key — or NULL, if the column allows it.',
                'One-to-many: the foreign key goes on the "many" side (orders.customer_id), never a list of ids on the "one" side.',
                'Many-to-many needs a link table with two foreign keys (order_items).',
                'A natural key is a real-world value (an email); a surrogate key is a meaningless counter (customer_id). Prefer surrogate keys as primary keys.',
            ],
            mistakes: [
                'Putting the foreign key on the wrong side, such as a column of order ids stored inside customers.',
                'Using a value that can change, like an email or a phone number, as the primary key.',
                'Thinking a foreign key must always be filled in. It can be NULL unless it is also NOT NULL: employees.dept_id is NULL for Gus.',
            ],
            dialects: [
                'SQLite only checks foreign keys after `PRAGMA foreign_keys = ON;` (the practice database switches it on). PostgreSQL, MySQL (InnoDB) and SQL Server always check them.',
            ],
            interviewAnswer: 'A primary key uniquely identifies each row: it is unique and never NULL, and I usually make it a meaningless surrogate id. A foreign key is a column that references another table\'s primary key; it defines the relationship and lets the database reject links to rows that don\'t exist. One-to-many puts the foreign key on the many side; many-to-many needs a junction table with two foreign keys, usually with the pair as its composite primary key.',
            followUps: [
                { q: 'Primary key or unique key — what is the difference?', a: 'Both forbid duplicates. A table has one primary key, and it can\'t be NULL. It can have many unique constraints, and in most databases a unique column may still hold NULLs.' },
                { q: 'What is a composite key?', a: 'A key made of two or more columns together, like (order_id, product_id) in order_items. Neither column is unique on its own, but the pair is.' },
                { q: 'What happens if you delete a customer who has orders?', a: 'With a foreign key, the database refuses by default. You can choose ON DELETE CASCADE (delete their orders too) or ON DELETE SET NULL instead.' },
            ],
            practice: {
                explain: 'Explain primary key, foreign key and link table, using customers, orders and order_items.',
                write: 'Write a query that lists every order_items row for order 103.',
                predict: 'Which employees have manager_id = 1? Name them before you run `SELECT name FROM employees WHERE manager_id = 1 ORDER BY name;`.',
                edge: 'Can two rows of order_items share an order_id? A product_id? Both at once? Explain each answer using the primary key.',
            },
            resources: [
                cs50Sql('Lecture 1: Relating'),
                w3('sql_primarykey.asp', 'SQL PRIMARY KEY'),
                w3('sql_foreignkey.asp', 'SQL FOREIGN KEY'),
            ],
        },
        {
            id: 'sql0-t4',
            kind: 'lesson',
            name: 'Data types: numbers, text, dates and true/false',
            priority: 'should',
            definition: 'Every column has a data type — such as INTEGER, a decimal number, TEXT, a date or a boolean — which decides what values it can hold and how they compare, sort and calculate.',
            problem: 'The same value acts differently by type. The text \'10\' sorts before \'9\', because text compares letter by letter. Integer 7 divided by integer 2 gives 3, not 3.5. Knowing the types explains a whole class of "why is my answer wrong?" bugs.',
            idea: 'Common types: INTEGER for whole numbers (counts, ids), DECIMAL or NUMERIC for exact money values, REAL or FLOAT for approximate numbers, TEXT or VARCHAR for words, DATE and TIMESTAMP for dates and times, and BOOLEAN for true or false. You can convert between types with CAST. NULL is not a type: it is the marker for "no value", and any column can hold it unless it is declared NOT NULL.',
            analogy: 'Containers in a kitchen. A measuring jug (a number column) lets you add and divide; a label maker (text) lets you join and cut words; a calendar (dates) lets you count days. Put the right thing in the right container, or the tools stop working properly.',
            breaks: 'In a kitchen, a jug simply refuses a label. SQLite is relaxed and lets almost any value into any column, while PostgreSQL rejects the wrong type outright. Don\'t lean on SQLite\'s flexibility — write SQL as if every database were strict.',
            syntax: code`
                CAST(value AS INTEGER)
                CAST(value AS REAL)
                CAST(value AS TEXT)
            `,
            howItWorks: [
                'An integer divided by an integer gives an integer: `7 / 2` is 3. The part after the point is thrown away.',
                'Make one side a decimal and you get the exact answer: `7 / 2.0` or `CAST(7 AS REAL) / 2` is 3.5.',
                'Text compares character by character, so \'10\' < \'9\' as text. Store numbers in number columns.',
                'Dates written as YYYY-MM-DD text sort correctly, because the biggest unit (year) comes first.',
                'A boolean expression such as `salary > 60000` is true or false — or unknown when salary is NULL.',
            ],
            diagram: {
                code: 'flowchart TD\n  V["A value"] --> N["Number<br/>INTEGER, DECIMAL, REAL"]\n  V --> T["Text<br/>TEXT, VARCHAR"]\n  V --> D["Date and time<br/>DATE, TIMESTAMP"]\n  V --> B["True or false<br/>BOOLEAN"]\n  N --> N1["add, divide, SUM, AVG"]\n  T --> T1["join, cut, LIKE"]\n  D --> D1["compare, count days"]\n  B --> B1["WHERE conditions"]',
                caption: 'The type decides what you can do with a value. Numbers calculate, text joins and matches patterns, dates compare and count days, and true/false values drive WHERE.',
            },
            examples: [
                {
                    title: 'Integer division, and how to avoid it',
                    sql: code`
                        SELECT 7 / 2 AS whole_division,
                               7 / 2.0 AS exact_division,
                               CAST('42' AS INTEGER) + 1 AS text_to_number;
                    `,
                    result: {
                        columns: ['whole_division', 'exact_division', 'text_to_number'],
                        rows: [[3, 3.5, 43]],
                    },
                    note: 'This bites in interviews when you compute a percentage: `delivered / total` gives 0. Multiply by 100.0 first.',
                },
                {
                    title: 'Dates as YYYY-MM-DD text compare correctly',
                    sql: code`
                        SELECT name, hire_date
                        FROM employees
                        WHERE hire_date >= '2022-01-01'
                        ORDER BY hire_date;
                    `,
                    result: {
                        columns: ['name', 'hire_date'],
                        rows: [['Eli', '2022-07-01'], ['Hana', '2022-11-30'], ['Gus', '2023-04-03']],
                    },
                    note: 'Text in single quotes is a string; the comparison works because the year comes first.',
                },
            ],
            keyPoints: [
                'INTEGER ÷ INTEGER = INTEGER in SQLite, PostgreSQL and SQL Server. Use 100.0 or CAST to get decimals.',
                'Use DECIMAL or NUMERIC for money: REAL and FLOAT are approximate and can show 0.30000000000000004.',
                'Text values go in single quotes: \'London\'. Double quotes are for names of tables or columns.',
                'Store dates in date columns (or YYYY-MM-DD text), never as \'06/01/2024\', which sorts wrongly.',
                'NULL means "no value" and can appear in any column that isn\'t NOT NULL.',
            ],
            mistakes: [
                'Computing a ratio with two integers and getting 0.',
                'Storing numbers as text and getting \'10\' sorted before \'9\'.',
                'Using double quotes for text values. In PostgreSQL, "London" means a column called London.',
            ],
            dialects: [
                'MySQL is the odd one out: `7 / 2` returns 3.5000, and `DIV` does whole division.',
                'SQLite has no real DATE or BOOLEAN type: dates are text and true/false are 1 and 0. PostgreSQL has DATE, TIMESTAMP and BOOLEAN types.',
                '`VARCHAR(50)` caps text at 50 characters in PostgreSQL, MySQL and SQL Server; SQLite ignores the limit.',
            ],
            interviewAnswer: 'Data types decide how values compare and calculate. The classic traps are integer division — 7 / 2 is 3 in most databases, so for percentages I multiply by 100.0 first — and storing numbers or dates as text, which makes them sort wrongly. For money I use DECIMAL rather than FLOAT, because floating point can\'t represent most decimals exactly.',
            followUps: [
                { q: 'CHAR or VARCHAR?', a: '`CHAR(n)` is fixed length and pads with spaces; `VARCHAR(n)` stores only what you give it, up to n. VARCHAR is the usual choice.' },
                { q: 'Why not FLOAT for money?', a: 'Floating point stores numbers in binary, so 0.1 + 0.2 is not exactly 0.3. DECIMAL stores exact decimal digits.' },
            ],
            practice: {
                explain: 'Explain why `7 / 2` gives 3, and two ways to get 3.5.',
                write: 'Write a query that returns each employee\'s name and their salary divided by 12, as an exact decimal monthly figure.',
                predict: 'What does `SELECT 1 / 3, 1.0 / 3, \'5\' < \'40\';` return? Say all three before running it.',
                edge: 'A column stores prices as text: \'9\', \'10\', \'100\'. What does ORDER BY on it return, and how do you fix it?',
            },
            resources: [
                sqliteDocs('datatype3.html', 'Datatypes in SQLite'),
                postgresDocs('datatype.html', 'Data Types'),
                w3('sql_datatypes.asp', 'SQL Data Types'),
            ],
        },
    ],
};
