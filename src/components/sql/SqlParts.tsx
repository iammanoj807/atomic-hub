import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { Box, Button, CircularProgress, IconButton, Stack, TextField, Typography } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import { format } from 'date-fns';
import { CONFIDENT, TAP, px, useTextSize } from '../learning/learning';
import { CodeBlock } from '../learning/LearningParts';
import { ProseText } from '../learning/GlossaryText';
import type { Prose } from '../learning/glossaryContext';
import { MermaidDiagram } from '../learning/MermaidDiagram';
import { practiceDbDiagram, practiceTables, type SqlCell } from '../../data/sqlPracticeDb';
import type { SqlExample, SqlResultTable } from '../../data/sql';
import { loadSqlEngine } from '../../utils/sqlEngine';
import { runOnPracticeDb, type QueryResult } from '../../utils/sqlRunner';
import {
    DATABASE_BOX,
    MAX_SAVED_QUERIES,
    groupByTopic,
    outcomeOf,
    readSqlDraft,
    savedNewestFirst,
    sqlToRun,
    writeSqlDraft,
    type SavedSqlQueryEntry,
} from '../../utils/sqlQueries';
import { useSqlQueriesStore, useSqlTopic } from './sqlContext';

// The SQL page's own pieces: result tables, the box that runs a query on the
// practice database, worked examples, and the practice database itself.

export const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const NULL_COLOUR = '#90a4ae';
const ERROR = '#ef9a9a';

const cellText = (cell: SqlCell) => (cell === null ? 'NULL' : String(cell));

/** A query's result as a small table. NULL is shown as a grey NULL, never as an empty cell. */
const ResultTable = ({
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
    | { status: 'done'; result: QueryResult; partial: boolean }
    | { status: 'failed'; message: string; partial: boolean };

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

/** Where a run box saves the queries you run in it. */
export interface SqlRunBoxSave {
    /** Unique within the topic: "practice", "your-turn", "example-2", "answer-write". */
    key: string;
    /** Shown next to each saved query, in words: "Step 3 · Practice box". */
    place: string;
    /** Start with the last query you ran here, instead of the starter query. */
    restore?: boolean;
}

/**
 * Edit a query and run it on a fresh copy of the practice database. The SQLite
 * engine loads the first time Run is pressed; every run starts from clean tables.
 * With something selected, only the selection runs. With `saveAs`, every query
 * you wrote or changed is saved when it runs, with the topic and place.
 */
export const SqlRunBox = ({
    initialSql,
    accent,
    label = 'Try it: edit the query, then run it',
    saveAs,
}: {
    initialSql: string;
    accent: string;
    label?: string;
    saveAs?: SqlRunBoxSave;
}) => {
    const t = useTextSize();
    const store = useSqlQueriesStore();
    const topic = useSqlTopic();
    const box = saveAs ? `${topic?.topicId ?? DATABASE_BOX}/${saveAs.key}` : null;
    const history = useMemo(() => (store && box ? savedNewestFirst(store.queries, box) : []), [store, box]);
    // A box that restores shows what you last typed in it on this device, else the last query you ran
    // there (once the list has loaded, so on any device), else the starter query.
    const draftBox = saveAs?.restore ? box : null;
    const [draft, setDraft] = useState<string | null>(() => (draftBox ? readSqlDraft(draftBox) : null));
    const query = draft ?? (saveAs?.restore ? history[0]?.sql : undefined) ?? initialSql;
    const [state, setState] = useState<RunState>({ status: 'idle' });
    const [hasSelection, setHasSelection] = useState(false);
    const [saved, setSaved] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const checkSelection = useCallback(() => {
        const el = inputRef.current;
        setHasSelection(el !== null && sqlToRun(el.value, el.selectionStart, el.selectionEnd).partial);
    }, []);

    // Selections made by touch (dragging the handles on a phone) only show up as selectionchange.
    useEffect(() => {
        const onSelectionChange = () => {
            if (document.activeElement === inputRef.current) checkSelection();
        };
        document.addEventListener('selectionchange', onSelectionChange);
        return () => document.removeEventListener('selectionchange', onSelectionChange);
    }, [checkSelection]);

    const changeText = (sql: string) => {
        setDraft(sql);
        if (draftBox) writeSqlDraft(draftBox, sql);
    };

    const replaceText = (sql: string) => {
        changeText(sql);
        setState({ status: 'idle' });
        setHasSelection(false);
        setSaved(false);
    };

    // Deleting a saved query leaves the box as it is, even when the box was showing that query.
    const removeSaved = (id: string) => {
        if (draft === null) changeText(query);
        store?.remove(id);
    };

    const run = async () => {
        const el = inputRef.current;
        const { sql, partial } = sqlToRun(query, el?.selectionStart ?? 0, el?.selectionEnd ?? 0);
        setState({ status: 'running' });
        setSaved(false);
        let outcome: string;
        let ok: boolean;
        try {
            const engine = await loadSqlEngine();
            const result = runOnPracticeDb(engine, sql);
            setState({ status: 'done', result, partial });
            outcome = outcomeOf(result);
            ok = true;
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            setState({ status: 'failed', message, partial });
            outcome = message;
            ok = false;
        }
        // Only what you wrote or changed is saved: an untouched example isn't yours.
        if (store && box && saveAs && query.trim() !== initialSql.trim()) {
            store.save({ sql, box, place: saveAs.place, topicId: topic?.topicId, topicName: topic?.topicName, ranAt: Date.now(), outcome, ok });
            setSaved(true);
        }
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            event.preventDefault();
            void run();
        }
    };

    const ran = state.status === 'done' || state.status === 'failed';

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
                inputRef={inputRef}
                onChange={event => {
                    changeText(event.target.value);
                    checkSelection();
                }}
                onKeyDown={onKeyDown}
                slotProps={{
                    htmlInput: {
                        spellCheck: false,
                        autoCapitalize: 'off',
                        autoCorrect: 'off',
                        'aria-label': 'SQL query',
                        onSelect: checkSelection,
                        onKeyUp: checkSelection,
                        onMouseUp: checkSelection,
                        onTouchEnd: checkSelection,
                        style: { fontFamily: MONO, fontSize: px(t.code), lineHeight: 1.55 },
                    },
                }}
                sx={{ '& .MuiInputBase-root': { bgcolor: '#000' } }}
            />
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                <Button
                    variant="contained"
                    onClick={() => void run()}
                    // Keep the focus, and so the highlighted selection, in the box.
                    onMouseDown={event => event.preventDefault()}
                    disabled={state.status === 'running'}
                    startIcon={state.status === 'running' ? <CircularProgress size={16} color="inherit" /> : <PlayArrowRoundedIcon />}
                    sx={{ minHeight: TAP, px: 2, textTransform: 'none', fontWeight: 700 }}
                >
                    {hasSelection ? 'Run selection' : 'Run'}
                </Button>
                <Button
                    onClick={() => replaceText(initialSql)}
                    startIcon={<RestartAltRoundedIcon />}
                    sx={{ minHeight: TAP, px: 1.5, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                >
                    Reset
                </Button>
                <Typography color="text.secondary" sx={{ fontSize: px(t.small) }}>
                    Select part of it to run only that part.
                    <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}> Ctrl or ⌘ + Enter runs it.</Box>
                </Typography>
            </Stack>
            <Box aria-live="polite" sx={{ mt: state.status === 'idle' ? 0 : 1.5 }}>
                {ran && state.partial && (
                    <Typography color="text.secondary" sx={{ fontSize: px(t.small), mb: 1 }}>
                        Ran only the part you selected, on a fresh copy of the database: anything you didn't select (a CREATE, an INSERT) didn't run.
                    </Typography>
                )}
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
                {ran && saved && (
                    <Typography color="text.secondary" sx={{ fontSize: px(t.small), mt: 1 }}>
                        Saved, with where you ran it. Find it below, or in "My saved queries" at the top of the page.
                    </Typography>
                )}
            </Box>
            {history.length > 0 && (
                <Box sx={{ mt: 1 }}>
                    <Button
                        size="small"
                        onClick={() => setShowHistory(open => !open)}
                        aria-expanded={showHistory}
                        startIcon={<HistoryRoundedIcon />}
                        sx={{ minHeight: TAP, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: 'text.secondary', fontSize: px(t.small) }}
                    >
                        {showHistory ? 'Hide' : 'Show'} your queries here ({history.length})
                    </Button>
                    {showHistory && (
                        <Stack spacing={1} sx={{ mt: 0.5 }}>
                            {history.map(entry => (
                                <SavedQueryCard key={entry.id} entry={entry} onDelete={() => removeSaved(entry.id)}>
                                    <Button
                                        size="small"
                                        onClick={() => {
                                            replaceText(entry.sql);
                                            inputRef.current?.focus();
                                        }}
                                        sx={{ minHeight: TAP, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: accent, fontSize: px(t.small) }}
                                    >
                                        Put it back in the box
                                    </Button>
                                </SavedQueryCard>
                            ))}
                        </Stack>
                    )}
                </Box>
            )}
        </Box>
    );
};

/** Every saved query, grouped by topic, newest first, with a way back to where it was run. */
export const SavedQueriesPanel = ({ accent, openTopic }: { accent: string; openTopic: (topicId: string) => void }) => {
    const t = useTextSize();
    const store = useSqlQueriesStore();
    const [search, setSearch] = useState('');
    const all = useMemo(() => store?.queries ?? {}, [store]);
    const groups = useMemo(() => {
        const q = search.trim().toLowerCase();
        const matching = Object.fromEntries(
            Object.entries(all).filter(([, saved]) =>
                !q || [saved.sql, saved.place, saved.topicName ?? 'the practice database'].some(text => text.toLowerCase().includes(q))
            )
        );
        return groupByTopic(matching);
    }, [all, search]);

    if (Object.keys(all).length === 0) {
        return (
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                Nothing saved yet. Every query you write (or change) and run, in a topic's boxes or the practice database box,
                is saved here automatically, with the topic and the step you ran it in.
            </Typography>
        );
    }

    return (
        <Stack spacing={2.5}>
            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                Every query you wrote (or changed) and ran is saved here automatically, newest first, with the topic and the step
                you ran it in. Running the same query again in the same place moves it to the top instead of saving a copy.
                The newest {MAX_SAVED_QUERIES} are kept, in your account rather than this browser, so clearing cookies or
                browser data doesn't lose them. Tap × on one to delete it.
            </Typography>
            <TextField
                size="small"
                placeholder="Search your queries"
                value={search}
                onChange={event => setSearch(event.target.value)}
                slotProps={{ htmlInput: { 'aria-label': 'Search your saved queries' } }}
                sx={{ maxWidth: 420 }}
            />
            {groups.length === 0 && (
                <Typography variant="body2" color="text.secondary">No saved queries match.</Typography>
            )}
            {groups.map(group => (
                <Box key={group.topicId ?? DATABASE_BOX}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                        <Typography fontWeight={800} color="text.primary" sx={{ flex: 1, minWidth: 160, overflowWrap: 'anywhere' }}>
                            {group.title}
                        </Typography>
                        {group.topicId && (
                            <Button
                                size="small"
                                onClick={() => openTopic(group.topicId!)}
                                sx={{ minHeight: TAP, px: 1, textTransform: 'none', fontWeight: 700, color: accent, fontSize: px(t.small) }}
                            >
                                Open topic
                            </Button>
                        )}
                    </Stack>
                    <Stack spacing={1}>
                        {group.entries.map(entry => (
                            <SavedQueryCard key={entry.id} entry={entry} showPlace onDelete={() => store?.remove(entry.id)}>
                                <TrySavedQuery sql={entry.sql} accent={accent} />
                            </SavedQueryCard>
                        ))}
                    </Stack>
                </Box>
            ))}
        </Stack>
    );
};

/** Run a saved query again, without saving it a second time. */
const TrySavedQuery = ({ sql, accent }: { sql: string; accent: string }) => {
    const t = useTextSize();
    const [trying, setTrying] = useState(false);
    return trying ? (
        <Box sx={{ mt: 1 }}>
            <SqlRunBox initialSql={sql} accent={accent} />
        </Box>
    ) : (
        <Button
            size="small"
            onClick={() => setTrying(true)}
            startIcon={<PlayArrowRoundedIcon />}
            sx={{ minHeight: TAP, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, fontSize: px(t.small), color: accent }}
        >
            Try it yourself
        </Button>
    );
};

/** One saved query: when and where it ran, what it gave, and the SQL, with a × to delete it. Actions go underneath. */
const SavedQueryCard = ({ entry, showPlace = false, onDelete, children }: { entry: SavedSqlQueryEntry; showPlace?: boolean; onDelete: () => void; children?: ReactNode }) => {
    const t = useTextSize();
    return (
        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.08)', minWidth: 0 }}>
            <Stack direction="row" spacing={1} useFlexGap alignItems="flex-start">
                <Typography color="text.secondary" sx={{ flex: 1, minWidth: 0, fontSize: px(t.small) }}>
                    {showPlace && <Box component="span" sx={{ color: 'text.primary', fontWeight: 700 }}>{entry.place} · </Box>}
                    {format(entry.ranAt, 'd MMM yyyy, HH:mm')} ·{' '}
                    <Box component="span" sx={{ color: entry.ok ? CONFIDENT : ERROR }}>{entry.outcome}</Box>
                </Typography>
                {/* Pulled into the card's padding, so the tap target stays full size without making the row taller. */}
                <IconButton
                    aria-label="Delete this saved query"
                    title="Delete"
                    onClick={onDelete}
                    sx={{ width: TAP, height: TAP, my: -1.25, mr: -1, color: 'text.secondary', '&:hover': { color: ERROR } }}
                >
                    <CloseRoundedIcon fontSize="small" />
                </IconButton>
            </Stack>
            <Box
                component="pre"
                sx={{ m: 0, mt: 0.75, fontFamily: MONO, fontSize: px(t.code), lineHeight: 1.5, color: 'text.primary', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere', maxHeight: '12em', overflowY: 'auto' }}
            >
                {entry.sql}
            </Box>
            {children}
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
    saveAs,
}: {
    example: SqlExample;
    number?: number;
    accent: string;
    /** The note, with its glossary words marked. */
    note?: Prose;
    /** Where queries changed in "Try it yourself" are saved. */
    saveAs?: SqlRunBoxSave;
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
        <TryIt sql={example.sql} accent={accent} saveAs={saveAs} />
    </Box>
);

/** A button that opens the query in a run box, to change it and run it. */
const TryIt = ({ sql, accent, saveAs }: { sql: string; accent: string; saveAs?: SqlRunBoxSave }) => {
    const t = useTextSize();
    const [trying, setTrying] = useState(false);
    return trying ? (
        <Box sx={{ mt: 1.5 }}>
            <SqlRunBox initialSql={sql} accent={accent} saveAs={saveAs} />
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
export const AnswerQuery = ({
    query,
    accent,
    saveAs,
}: {
    query: Pick<SqlExample, 'sql' | 'result' | 'error'>;
    accent: string;
    saveAs?: SqlRunBoxSave;
}) => (
    <Box>
        <CodeBlock code={query.sql} language="sql" />
        <ExampleOutcome example={query} />
        <TryIt sql={query.sql} accent={accent} saveAs={saveAs} />
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
                saveAs={{ key: 'database', place: 'The practice database', restore: true }}
            />
        </Stack>
    );
};
