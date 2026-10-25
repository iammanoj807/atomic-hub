import type { SqlTopicAnswers } from '../sql';
import { code } from '../sqlCourse/code';

// Phase 7 · Performance: indexes and query plans. One good answer for each practice exercise.

export const sqlPhase7Answers: Record<string, SqlTopicAnswers> = {
    'sql7-t1': {
        explain: {
            answer: 'An index is like the index at the back of a textbook. To find "photosynthesis" you don\'t read every page; you look the word up in the sorted list and jump to page 214. Without an index, the database has to read the whole table (a full scan), like reading the book cover to cover. With one, it searches a sorted copy of the column (a B-tree) and follows a pointer straight to the matching rows.\n\nWhat it costs:\n• Slower writes: every INSERT, DELETE, and UPDATE of the indexed column must also update the index. A book\'s index is printed once; a database\'s is kept up to date all the time.\n• Space: the index is a second copy of the column, on disk and in memory.\nSo you index the columns your important queries filter, join or sort on, not every column.',
        },
        write: {
            answer: 'Before, the plan is `SCAN employees`: every row is read. Create an index on the filtered column, run the same EXPLAIN QUERY PLAN, and it becomes a SEARCH using the new index.\n\n(With 8 rows a scan is just as fast; the plan matters when the table has millions.)',
            query: {
                sql: code`
                    CREATE INDEX idx_employees_dept ON employees(dept_id);
                    EXPLAIN QUERY PLAN SELECT * FROM employees WHERE dept_id = 1;
                `,
                result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[3, 0, 61, 'SEARCH employees USING INDEX idx_employees_dept (dept_id=?)']] },
            },
        },
        predict: {
            answer: 'Yes. customer_id is the primary key, and a primary key is always indexed: the database needs that to check uniqueness on every insert. In SQLite an INTEGER PRIMARY KEY is the row\'s own id (the rowid), so the plan searches straight to it.',
            query: {
                sql: code`
                    EXPLAIN QUERY PLAN SELECT * FROM customers WHERE customer_id = 3;
                `,
                result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[2, 0, 33, 'SEARCH customers USING INTEGER PRIMARY KEY (rowid=?)']] },
            },
        },
        edge: {
            answer: '`WHERE status = \'delivered\'`: probably not. Half the table matches, so the index would find half a million row pointers (in a million-row table), and fetching each row one by one, jumping around the disk, is slower than simply reading the whole table in order. A good optimiser, with statistics, ignores the index and scans.\n\n`WHERE status = \'pending\'`: yes, if pending orders are rare (say 1%). The index jumps straight to the few matching rows. This is the case where an index on a column with few values can pay off.\n\nThe usual answer for "a rare value of a common column" is a partial index, which only holds the rows you search for: `CREATE INDEX idx_orders_pending ON orders(order_date) WHERE status = \'pending\';`. It is tiny and cheap to maintain.\n\n(SQLite only knows how values are spread after you run ANALYZE. Without it, it will happily use an index on status for \'delivered\' too.)',
        },
    },
    'sql7-t2': {
        explain: {
            answer: 'SCAN means the database reads every row of the table (or of an index) from start to finish. SEARCH means it uses an index to jump straight to the matching rows, like using a book\'s index instead of reading every page.\n\nOn a big table you want SEARCH for selective filters and joins. A SCAN of a million-row table on every request is usually the reason a query is slow. A SCAN is fine when the table is tiny, or when you really need most of its rows (then reading in order beats jumping around).',
        },
        write: {
            answer: 'Before: `SCAN employees`. The index below holds dept_id and name together, so the plan becomes a SEARCH with a COVERING INDEX: the query needs only name, which is already in the index, so the database never reads the table itself.\n\nAn index on dept_id alone would also turn the SCAN into a SEARCH, but each match would then need a second lookup into the table to fetch the name.',
            query: {
                sql: code`
                    CREATE INDEX idx_employees_dept_name ON employees(dept_id, name);
                    EXPLAIN QUERY PLAN SELECT name FROM employees WHERE dept_id = 2;
                `,
                result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[2, 0, 55, 'SEARCH employees USING COVERING INDEX idx_employees_dept_name (dept_id=?)']] },
            },
        },
        predict: {
            answer: 'A SEARCH by the primary key: product_id is an INTEGER PRIMARY KEY, which in SQLite is the rowid, so it goes straight to the one row. No index needs to be created.',
            query: {
                sql: code`
                    EXPLAIN QUERY PLAN SELECT * FROM products WHERE product_id = 3;
                `,
                result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[2, 0, 33, 'SEARCH products USING INTEGER PRIMARY KEY (rowid=?)']] },
            },
        },
        edge: {
            answer: 'Here it disappears. Before the index, the plan is `SCAN orders` plus `USE TEMP B-TREE FOR GROUP BY`: the rows come out in any order, so SQLite builds a temporary sorted structure to group them. With the index, it reads orders through idx_orders_customer, which already returns rows sorted by customer_id, so the groups arrive in order and no sort is needed.\n\nWhy it might still be there:\n• The index doesn\'t cover the query: amount isn\'t in it, so every row needs an extra lookup into the table. On a big table the optimiser may decide a plain scan plus a sort is cheaper, and keep the temp B-tree. An index on (customer_id, amount) covers the query and removes that doubt.\n• With statistics (after ANALYZE), the optimiser might prefer the scan anyway.\n• The ORDER BY or GROUP BY doesn\'t match the index order (a different column, or a different direction).',
            query: {
                sql: code`
                    CREATE INDEX idx_orders_customer ON orders(customer_id);
                    EXPLAIN QUERY PLAN
                    SELECT customer_id, SUM(amount)
                    FROM orders
                    GROUP BY customer_id
                    ORDER BY customer_id;
                `,
                result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[8, 0, 223, 'SCAN orders USING INDEX idx_orders_customer']] },
            },
        },
    },
    'sql7-t3': {
        explain: {
            answer: 'A phone book is sorted by surname, then by first name: an index on (surname, first_name).\n\n• "Smith, John": quick. Find the Smiths, then John among them.\n• All the Smiths: quick. They are all together.\n• Everyone called John: no help at all. The Johns are scattered through every surname, so you would have to read the whole book.\n\nThat is the leftmost-prefix rule. A composite index on (a, b) helps a query that fixes a, or a and b, but not one that only filters on b, because b is only sorted within each value of a.',
        },
        write: {
            answer: 'Wrapping the column in a function (`strftime(\'%Y\', hire_date)`) hides it from the index: the database would have to work out the year for every row, so the plan is a SCAN. Say the same thing as a range on the bare column, and the plan becomes a SEARCH on the index. It finds the same people, Chen and Fatima.',
            query: {
                sql: code`
                    CREATE INDEX idx_employees_hire ON employees(hire_date);
                    EXPLAIN QUERY PLAN
                    SELECT name FROM employees
                    WHERE hire_date >= '2021-01-01' AND hire_date < '2022-01-01';
                `,
                result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[3, 0, 164, 'SEARCH employees USING INDEX idx_employees_hire (hire_date>? AND hire_date<?)']] },
            },
        },
        predict: {
            answer: '`WHERE salary + 0 > 60000` is not sargable: the column is inside a calculation, so the database can\'t look it up in the index and scans (`SCAN employees`). (Adding + 0 is in fact an old trick to stop an index being used on purpose.)\n\n`WHERE salary > 60000 - 0` is sargable: salary stands alone, and the arithmetic is on the constant side, which is worked out once. The plan is a SEARCH.',
            query: {
                sql: code`
                    CREATE INDEX idx_employees_salary ON employees(salary);
                    EXPLAIN QUERY PLAN SELECT name FROM employees WHERE salary > 60000 - 0;
                `,
                result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[3, 0, 203, 'SEARCH employees USING INDEX idx_employees_salary (salary>?)']] },
            },
        },
        edge: {
            answer: 'One composite index on (customer_id, order_date), customer first.\n\n• "Customer 1, newest first": fix customer_id = 1, then read that customer\'s entries backwards. They are already sorted by date, so there is no sort step (no temp B-tree in the plan, below).\n• "Customer 1 in March": fix customer_id = 1, then take a range on the second column: `order_date >= \'2024-03-01\' AND order_date < \'2024-04-01\'`. Its plan is `SEARCH … (customer_id=? AND order_date>? AND order_date<?)`.\n\nThe order matters: (order_date, customer_id) would only help the second query, and badly. Both plans even say COVERING here, because order_id is the rowid, which every SQLite index carries.',
            query: {
                sql: code`
                    CREATE INDEX idx_orders_cust_date ON orders(customer_id, order_date);
                    EXPLAIN QUERY PLAN
                    SELECT order_id, order_date FROM orders
                    WHERE customer_id = 1
                    ORDER BY order_date DESC;
                `,
                result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[3, 0, 55, 'SEARCH orders USING COVERING INDEX idx_orders_cust_date (customer_id=?)']] },
            },
        },
    },
    'sql7-t4': {
        explain: {
            answer: 'Matching wedding guests to their tables:\n\n• Nested loop: take each guest in turn and look their name up in the seating plan. Quick if the seating plan has an index (sorted by name, so each lookup is fast) or if there are only a few guests. Without an index, every guest reads the whole plan: very slow for big lists.\n• Hash join: first make a quick lookup card for every name in the seating plan (a hash table, kept in memory), then let each guest find their card in one step. Great for two big lists with no index; it needs memory for the cards.\n• Merge join: line the guests up alphabetically, line the seating plan up alphabetically, then walk down both lists together, matching as you go. Great when both are already sorted (by an index); otherwise both must be sorted first.\n\nThe optimiser picks one per join, from the sizes, the indexes and the memory available.',
        },
        write: {
            answer: 'The plan reads: SCAN o, then SEARCH c using the primary key. That is a nested loop: for each order (the outer loop), look up its customer by key (the inner step). SQLite only does nested loops; it makes them fast with indexes, and builds a temporary index itself when none exists. PostgreSQL would show "Nested Loop", "Hash Join" or "Merge Join" by name.',
            query: {
                sql: code`
                    EXPLAIN QUERY PLAN
                    SELECT o.order_id, c.name
                    FROM orders o
                    JOIN customers c ON c.customer_id = o.customer_id;
                `,
                result: { columns: ['id', 'parent', 'notused', 'detail'], rows: [[3, 0, 216, 'SCAN o'], [5, 0, 45, 'SEARCH c USING INTEGER PRIMARY KEY (rowid=?)']] },
            },
        },
        predict: {
            answer: 'A nested loop, with the small table outside. Loop over the 10 rows, and for each one search the big table\'s index: 10 index lookups of a few steps each, a few dozen page reads in all.\n\nA hash join would have to read all 10 million rows of the big table (to build or to probe), and a merge join would need it sorted. Neither can compete with 10 index lookups.',
        },
        edge: {
            answer: 'A hash join. A nested loop with no index would compare every row with every row: 100 million × 100 million = 10¹⁶ comparisons, which never finishes. A merge join would first have to sort both 100-million-row tables.\n\nA hash join reads one side (ideally the smaller after filters) and builds a hash table on the join column, then reads the other side once and probes it: about two passes over the data.\n\nThe resource it needs is memory, for the hash table. If it doesn\'t fit, the database splits both sides into batches by hash and writes them to temporary disk space, then joins batch by batch (a "grace" hash join), which is slower but still linear. Big analytical joins are often limited by memory, so the work_mem (PostgreSQL) or join buffer settings matter.',
        },
    },
};
