// The practice database every SQL lesson runs on: six small tables from two
// worlds you already know — a company (departments, employees) and a shop
// (customers, orders, products, order_items).
//
// It is small on purpose, so every result fits on a phone and can be worked
// out by hand. The awkward cases are planted on purpose too, because each one
// is a lesson:
//   - Asha has no manager, and Gus has no department (NULL keys)
//   - HR has no employees, Omar has no orders, the phone case never sold
//   - Ben and Chen earn the same (ties, for RANK vs DENSE_RANK)
//   - Hana earns more than her manager
//   - Tom signed up twice with the same email (duplicates)
//   - order 106 has no amount (NULL in SUM, AVG and COUNT)
//   - Priya ordered three days in a row (streaks)
//
// Every order's amount equals the sum of its items (quantity × price); a
// test checks it. Dates are text in YYYY-MM-DD form, which sorts correctly.

export type SqlCell = string | number | null;

export interface PracticeColumn {
    name: string;
    /** The type and constraints, as written in CREATE TABLE. */
    definition: string;
    /** What the column holds, in plain words. */
    about: string;
    key?: 'PK' | 'FK';
    /** For a foreign key: the table it points to. */
    references?: string;
}

export interface PracticeTable {
    name: string;
    about: string;
    columns: PracticeColumn[];
    /** Constraints that cover more than one column. */
    tableConstraints?: string[];
    rows: SqlCell[][];
}

export const practiceTables: PracticeTable[] = [
    {
        name: 'departments',
        about: 'One row per department. HR has nobody in it yet.',
        columns: [
            { name: 'dept_id', definition: 'INTEGER PRIMARY KEY', about: 'The department\'s id.', key: 'PK' },
            { name: 'dept_name', definition: 'TEXT NOT NULL', about: 'Its name.' },
            { name: 'location', definition: 'TEXT', about: 'The city it is based in.' },
        ],
        rows: [
            [1, 'Engineering', 'London'],
            [2, 'Sales', 'Manchester'],
            [3, 'Marketing', 'London'],
            [4, 'HR', 'Leeds'],
        ],
    },
    {
        name: 'employees',
        about: 'One row per employee. manager_id points at another row in this same table.',
        columns: [
            { name: 'emp_id', definition: 'INTEGER PRIMARY KEY', about: 'The employee\'s id.', key: 'PK' },
            { name: 'name', definition: 'TEXT NOT NULL', about: 'First name.' },
            { name: 'dept_id', definition: 'INTEGER REFERENCES departments(dept_id)', about: 'Their department. NULL for Gus.', key: 'FK', references: 'departments' },
            { name: 'manager_id', definition: 'INTEGER REFERENCES employees(emp_id)', about: 'The emp_id of their manager. NULL for Asha, who has no manager.', key: 'FK', references: 'employees' },
            { name: 'salary', definition: 'INTEGER NOT NULL', about: 'Yearly salary in pounds.' },
            { name: 'hire_date', definition: 'TEXT NOT NULL', about: 'The day they joined (YYYY-MM-DD).' },
        ],
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
    {
        name: 'customers',
        about: 'One row per sign-up. Tom signed up twice with the same email.',
        columns: [
            { name: 'customer_id', definition: 'INTEGER PRIMARY KEY', about: 'The customer\'s id.', key: 'PK' },
            { name: 'name', definition: 'TEXT NOT NULL', about: 'First name.' },
            { name: 'email', definition: 'TEXT NOT NULL', about: 'Email address. Not unique, so duplicates can get in.' },
            { name: 'city', definition: 'TEXT', about: 'Home city. NULL for Zoe, who didn\'t say.' },
            { name: 'signup_date', definition: 'TEXT NOT NULL', about: 'The day they signed up.' },
        ],
        rows: [
            [1, 'Priya', 'priya@mail.com', 'London', '2024-01-02'],
            [2, 'Tom', 'tom@mail.com', 'Leeds', '2024-01-20'],
            [3, 'Lena', 'lena@mail.com', 'London', '2024-01-30'],
            [4, 'Omar', 'omar@mail.com', 'Bristol', '2024-02-14'],
            [5, 'Zoe', 'zoe@mail.com', null, '2024-03-10'],
            [6, 'Tom', 'tom@mail.com', 'Leeds', '2024-03-20'],
        ],
    },
    {
        name: 'orders',
        about: 'One row per order. Order 106 was cancelled before an amount was recorded.',
        columns: [
            { name: 'order_id', definition: 'INTEGER PRIMARY KEY', about: 'The order\'s id.', key: 'PK' },
            { name: 'customer_id', definition: 'INTEGER NOT NULL REFERENCES customers(customer_id)', about: 'Who placed it.', key: 'FK', references: 'customers' },
            { name: 'order_date', definition: 'TEXT NOT NULL', about: 'The day it was placed.' },
            { name: 'amount', definition: 'INTEGER', about: 'The total in pounds. NULL for order 106.' },
            { name: 'status', definition: 'TEXT NOT NULL', about: 'delivered, shipped, cancelled or pending.' },
        ],
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
    {
        name: 'products',
        about: 'One row per product. Nobody has bought the phone case.',
        columns: [
            { name: 'product_id', definition: 'INTEGER PRIMARY KEY', about: 'The product\'s id.', key: 'PK' },
            { name: 'product_name', definition: 'TEXT NOT NULL', about: 'Its name.' },
            { name: 'category', definition: 'TEXT NOT NULL', about: 'The shop section it belongs to.' },
            { name: 'price', definition: 'INTEGER NOT NULL', about: 'Price in pounds.' },
        ],
        rows: [
            [1, 'Pen', 'Stationery', 2],
            [2, 'Notebook', 'Stationery', 5],
            [3, 'Mug', 'Kitchen', 8],
            [4, 'Desk lamp', 'Home', 25],
            [5, 'Backpack', 'Bags', 30],
            [6, 'Headphones', 'Electronics', 40],
            [7, 'Phone case', 'Electronics', 15],
        ],
    },
    {
        name: 'order_items',
        about: 'Which products are in which order, and how many. It links orders and products (many-to-many). Order 106 has no items.',
        columns: [
            { name: 'order_id', definition: 'INTEGER NOT NULL REFERENCES orders(order_id)', about: 'The order.', key: 'FK', references: 'orders' },
            { name: 'product_id', definition: 'INTEGER NOT NULL REFERENCES products(product_id)', about: 'The product.', key: 'FK', references: 'products' },
            { name: 'quantity', definition: 'INTEGER NOT NULL', about: 'How many were bought.' },
        ],
        tableConstraints: ['PRIMARY KEY (order_id, product_id)'],
        rows: [
            [101, 6, 3],
            [102, 4, 2],
            [102, 5, 1],
            [103, 3, 5],
            [103, 2, 1],
            [104, 6, 5],
            [105, 6, 3],
            [105, 5, 1],
            [107, 5, 2],
            [108, 4, 3],
            [109, 1, 5],
            [109, 2, 4],
            [110, 4, 1],
            [110, 3, 1],
        ],
    },
];

const literal = (value: SqlCell) =>
    value === null ? 'NULL' : typeof value === 'number' ? String(value) : `'${value.replace(/'/g, "''")}'`;

const createTable = (table: PracticeTable) => {
    const lines = [
        ...table.columns.map(column => `${column.name} ${column.definition}`),
        ...(table.tableConstraints ?? []),
    ];
    return `CREATE TABLE ${table.name} (\n  ${lines.join(',\n  ')}\n);`;
};

const insertRows = (table: PracticeTable) =>
    `INSERT INTO ${table.name} VALUES\n  ${table.rows.map(row => `(${row.map(literal).join(', ')})`).join(',\n  ')};`;

/** The CREATE TABLE statements alone, for reading. */
export const practiceSchemaSql = practiceTables.map(createTable).join('\n\n');

/** The whole database as one script: foreign keys switched on, every table created and filled. */
export const practiceDbSql = [
    'PRAGMA foreign_keys = ON;',
    ...practiceTables.flatMap(table => [createTable(table), insertRows(table)]),
].join('\n\n');

/** How the tables connect, as a Mermaid ER diagram. */
export const practiceDbDiagram = {
    code: [
        'erDiagram',
        '  DEPARTMENTS ||--o{ EMPLOYEES : "has"',
        '  EMPLOYEES |o--o{ EMPLOYEES : "manages"',
        '  CUSTOMERS ||--o{ ORDERS : "places"',
        '  ORDERS ||--o{ ORDER_ITEMS : "contains"',
        '  PRODUCTS ||--o{ ORDER_ITEMS : "is in"',
        '  DEPARTMENTS {',
        '    int dept_id PK',
        '    text dept_name',
        '    text location',
        '  }',
        '  EMPLOYEES {',
        '    int emp_id PK',
        '    text name',
        '    int dept_id FK',
        '    int manager_id FK',
        '    int salary',
        '    text hire_date',
        '  }',
        '  CUSTOMERS {',
        '    int customer_id PK',
        '    text name',
        '    text email',
        '    text city',
        '    text signup_date',
        '  }',
        '  ORDERS {',
        '    int order_id PK',
        '    int customer_id FK',
        '    text order_date',
        '    int amount',
        '    text status',
        '  }',
        '  PRODUCTS {',
        '    int product_id PK',
        '    text product_name',
        '    text category',
        '    int price',
        '  }',
        '  ORDER_ITEMS {',
        '    int order_id PK, FK',
        '    int product_id PK, FK',
        '    int quantity',
        '  }',
    ].join('\n'),
    caption: 'Each box is a table; PK marks its primary key and FK a foreign key. Read a line from left to right: one department has many employees, one customer places many orders, and order_items links orders to products, because one order can hold many products and one product can be in many orders. The loop on EMPLOYEES is manager_id pointing back into the same table.',
};
