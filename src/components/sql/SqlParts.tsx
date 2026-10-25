import { useState, type KeyboardEvent } from 'react';
import { Box, Button, CircularProgress, Stack, TextField, Typography } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { TAP, px, useTextSize } from '../learning/learning';
import { CodeBlock } from '../learning/LearningParts';
import { ProseText } from '../learning/GlossaryText';
import type { Prose } from '../learning/glossaryContext';
import { MermaidDiagram } from '../learning/MermaidDiagram';
import { practiceDbDiagram, practiceTables, type SqlCell } from '../../data/sqlPracticeDb';
import type { SqlExample, SqlResultTable } from '../../data/sql';
import { loadSqlEngine } from '../../utils/sqlEngine';
import { runOnPracticeDb, type QueryResult } from '../../utils/sqlRunner';

// The SQL page's own pieces: result tables, the box that runs a query on the
// practice database, worked examples, and the practice database itself.

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const NULL_COLOUR = '#90a4ae';
const ERROR = '#ef9a9a';

const cellText = (cell: SqlCell) => (cell === null ? 'NULL' : String(cell));

/** A query's result as a small table. NULL is shown as a grey NULL, never as an empty cell. */
export const ResultTable = ({
    result,
    keys,
    showCount = true,
}: {
    result: SqlResultTable;
    /** Marks key columns in the header (the practice database view). */
    keys?: Record<string, 'PK' | 'FK' | undefined>;
    showCount?: boolean;
}) => {
    const t = useTextSize();
    const count = result.rows.length;
    return (
        <Box>
            {/* As wide as its columns need (a narrow result stays narrow), scrolling sideways past the page width. */}
            <Box sx={{ display: 'inline-block', maxWidth: '100%', verticalAlign: 'top', overflowX: 'auto', borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', bgcolor: 'rgba(0,0,0,0.25)' }}>
                <Box
                    component="table"
                    sx={{ borderCollapse: 'collapse', fontFamily: MONO, fontSize: px(t.code), lineHeight: 1.5 }}
                >
                    <thead>
                        <tr>
                            {result.columns.map(column => (
                                <Box
                                    component="th"
                                    key={column}
                                    scope="col"
                                    sx={{ textAlign: 'left', px: 1.5, py: 0.75, whiteSpace: 'nowrap', fontWeight: 700, color: 'text.primary', bgcolor: 'rgba(255,255,255,0.06)' }}
                                >
                                    {column}
                                    {keys?.[column] && (
                                        <Box component="span" sx={{ ml: 0.75, fontSize: '0.75em', fontWeight: 800, color: keys[column] === 'PK' ? '#ffca28' : '#4dd0e1' }}>
                                            {keys[column]}
                                        </Box>
                                    )}
                                </Box>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {result.rows.map((row, rowIndex) => (
                            <tr key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <Box
                                        component="td"
                                        key={cellIndex}
                                        sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            whiteSpace: 'nowrap',
                                            textAlign: typeof cell === 'number' ? 'right' : 'left',
                                            fontVariantNumeric: 'tabular-nums',
                                            color: cell === null ? NULL_COLOUR : 'text.primary',
                                            fontStyle: cell === null ? 'italic' : 'normal',
                                            borderTop: '1px solid rgba(255,255,255,0.06)',
                                        }}
                                    >
                                        {cellText(cell)}
                                    </Box>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </Box>
            </Box>
            {showCount && (
                <Typography color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: px(t.small) }}>
                    {count === 0 ? 'No rows.' : count === 1 ? '1 row' : `${count} rows`}
                </Typography>
            )}
        </Box>
    );
};

type RunState =
    | { status: 'idle' }
    | { status: 'running' }
    | { status: 'done'; result: QueryResult }
    | { status: 'failed'; message: string };

/** A plain-English hint for the database errors beginners meet most. */
const errorHint = (message: string) => {
    if (/no such column/i.test(message)) return 'Check the spelling, and that the column is in a table you named in FROM or JOIN. Open "The practice database" to see every column.';
    if (/no such table/i.test(message)) return 'The six tables are departments, employees, customers, orders, products and order_items.';
    if (/ambiguous column/i.test(message)) return 'Two joined tables have a column with this name. Put the table (or its alias) in front: e.dept_id.';
    if (/syntax error/i.test(message)) return 'Look just before the word shown: often a missing comma, a missing quote, or a clause in the wrong order.';
    if (/misuse of aggregate/i.test(message)) return 'An aggregate like SUM or COUNT can\'t go in WHERE. Filter groups with HAVING instead.';
    if (/GROUP BY/i.test(message)) return 'Every column in SELECT must be in GROUP BY or inside an aggregate.';
    return null;
};

/**
 * Edit a query and run it on a fresh copy of the practice database. The SQLite
 * engine loads the first time Run is pressed; every run starts from clean tables.
 */
export const SqlRunBox = ({ initialSql, accent, label = 'Try it: edit the query, then run it' }: { initialSql: string; accent: string; label?: string }) => {
    const t = useTextSize();
    const [query, setQuery] = useState(initialSql);
    const [state, setState] = useState<RunState>({ status: 'idle' });

    const run = async () => {
        setState({ status: 'running' });
        try {
            const engine = await loadSqlEngine();
            setState({ status: 'done', result: runOnPracticeDb(engine, query) });
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setState({ status: 'failed', message });
        }
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void run();
        }
    };

    return (
        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, border: '1px dashed', borderColor: `${accent}66`, bgcolor: 'rgba(255,255,255,0.02)' }}>
            <Typography variant="caption" sx={{ display: 'block', color: accent, fontWeight: 800, letterSpacing: 0.8, mb: 1 }}>
                {label.toUpperCase()}
            </Typography>
            <TextField
                multiline
                fullWidth
                minRows={3}
                value={query}
                onChange={event => setQuery(event.target.value)}
                onKeyDown={onKeyDown}
                slotProps={{
                    htmlInput: {
                        spellCheck: false,
                        autoCapitalize: 'off',
                        autoCorrect: 'off',
                        'aria-label': 'SQL query',
                        style: { fontFamily: MONO, fontSize: px(t.code), lineHeight: 1.55 },
                    },
                }}
                sx={{ '& .MuiInputBase-root': { bgcolor: '#000' } }}
            />
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Button
                    variant="contained"
                    onClick={() => void run()}
                    disabled={state.status === 'running'}
                    startIcon={state.status === 'running' ? <CircularProgress size={16} color="inherit" /> : <PlayArrowRoundedIcon />}
                    sx={{ minHeight: TAP, px: 2, textTransform: 'none', fontWeight: 700 }}
                >
                    Run
                </Button>
                <Button
                    onClick={() => {
                        setQuery(initialSql);
                        setState({ status: 'idle' });
                    }}
                    startIcon={<RestartAltRoundedIcon />}
                    sx={{ minHeight: TAP, px: 1.5, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                >
                    Reset
                </Button>
                <Typography color="text.secondary" sx={{ fontSize: px(t.small), display: { xs: 'none', sm: 'block' } }}>
                    Ctrl or ⌘ + Enter runs it
                </Typography>
            </Stack>
            <Box aria-live="polite" sx={{ mt: state.status === 'idle' ? 0 : 1.5 }}>
                {state.status === 'running' && (
                    <Typography color="text.secondary" sx={{ fontSize: px(t.small) }}>Running…</Typography>
                )}
                {state.status === 'done' && (
                    state.result.columns.length > 0 ? (
                        <ResultTable result={state.result} />
                    ) : (
                        <Typography color="text.secondary" sx={{ fontSize: px(t.small) }}>
                            Done. {state.result.changed} {state.result.changed === 1 ? 'row' : 'rows'} changed. Add a SELECT after it to see the table. (Every run starts again from the original data.)
                        </Typography>
                    )
                )}
                {state.status === 'failed' && <ErrorBox message={state.message} hint={errorHint(state.message)} />}
            </Box>
        </Box>
    );
};

/** The error box for a query the database refuses. */
const ErrorBox = ({ message, hint }: { message: string; hint?: string | null }) => {
    const t = useTextSize();
    return (
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(239,154,154,0.08)', border: '1px solid rgba(239,154,154,0.3)' }}>
            <Typography sx={{ color: ERROR, fontFamily: MONO, fontSize: px(t.code), overflowWrap: 'anywhere' }}>
                {message}
            </Typography>
            {hint && (
                <Typography color="text.secondary" sx={{ mt: 0.5, fontSize: px(t.small) }}>
                    {hint}
                </Typography>
            )}
        </Box>
    );
};

/** What an example gives back: its rows, or — for one that is meant to fail — the database's error. */
export const ExampleOutcome = ({ example }: { example: Pick<SqlExample, 'result' | 'error'> }) => (
    <>
        <Typography variant="caption" sx={{ display: 'block', color: example.error ? ERROR : 'text.secondary', fontWeight: 800, letterSpacing: 0.8, mt: 1.5, mb: 0.75 }}>
            {example.error ? 'RESULT: THE DATABASE REFUSES IT' : 'RESULT'}
        </Typography>
        {example.error ? <ErrorBox message={example.error} /> : example.result && <ResultTable result={example.result} />}
    </>
);

/** A worked example: the query, the rows it returns, what to notice, and a box to try it yourself. */
export const ExampleBlock = ({
    example,
    number,
    accent,
    note,
}: {
    example: SqlExample;
    number?: number;
    accent: string;
    /** The note, with its glossary words marked. */
    note?: Prose;
}) => (
    <Box>
        <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1 }}>
            {number !== undefined && (
                <Box component="span" sx={{ color: accent, mr: 1 }}>Example {number}.</Box>
            )}
            {example.title}
        </Typography>
        <CodeBlock code={example.sql} language="sql" />
        <ExampleOutcome example={example} />
        {example.note && (
            <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
                <ProseText value={note ?? example.note} />
            </Typography>
        )}
        <TryIt sql={example.sql} accent={accent} />
    </Box>
);

/** A button that opens the query in a run box, to change it and run it. */
const TryIt = ({ sql, accent }: { sql: string; accent: string }) => {
    const t = useTextSize();
    const [trying, setTrying] = useState(false);
    return trying ? (
        <Box sx={{ mt: 1.5 }}>
            <SqlRunBox initialSql={sql} accent={accent} />
        </Box>
    ) : (
        <Button
            size="small"
            onClick={() => setTrying(true)}
            startIcon={<PlayArrowRoundedIcon />}
            sx={{ minHeight: TAP, mt: 0.5, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: accent, fontSize: px(t.small) }}
        >
            Try it yourself
        </Button>
    );
};

/** A practice answer's query: the SQL, the rows it returns, and a box to try it. */
export const AnswerQuery = ({ query, accent }: { query: Pick<SqlExample, 'sql' | 'result' | 'error'>; accent: string }) => (
    <Box>
        <CodeBlock code={query.sql} language="sql" />
        <ExampleOutcome example={query} />
        <TryIt sql={query.sql} accent={accent} />
    </Box>
);

/** The six practice tables: how they connect, every row, and a box to run any query. */
export const PracticeDatabase = ({ accent }: { accent: string }) => {
    const t = useTextSize();
    return (
        <Stack spacing={3}>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                Every example in this course runs on these six tables. They are small on purpose: get to know the rows,
                and you can check any answer by eye. Grey <Box component="span" sx={{ color: NULL_COLOUR, fontStyle: 'italic', fontFamily: MONO }}>NULL</Box> means
                no value. <Box component="span" sx={{ color: '#ffca28', fontWeight: 800 }}>PK</Box> marks a primary key
                and <Box component="span" sx={{ color: '#4dd0e1', fontWeight: 800 }}>FK</Box> a foreign key.
            </Typography>
            <MermaidDiagram code={practiceDbDiagram.code} caption={practiceDbDiagram.caption} title="The practice database" />
            {practiceTables.map(table => (
                <Box key={table.name}>
                    <Typography sx={{ fontFamily: MONO, fontWeight: 800, color: accent, fontSize: px(t.body1) }}>
                        {table.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {table.about}
                    </Typography>
                    <ResultTable
                        result={{ columns: table.columns.map(column => column.name), rows: table.rows }}
                        keys={Object.fromEntries(table.columns.map(column => [column.name, column.key]))}
                    />
                </Box>
            ))}
            <SqlRunBox
                initialSql={'SELECT *\nFROM employees\nORDER BY emp_id;'}
                accent={accent}
                label="Run any query on the practice database"
            />
        </Stack>
    );
};
