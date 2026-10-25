import { useMemo, useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Tabs,
    Tab,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    LinearProgress,
    Tooltip,
    Button,
    TextField,
    InputAdornment,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import {
    sqlPhases,
    allSqlTopics,
    sqlCheatSheet,
    sqlHowToStudy,
    SQL_CHECK_KEYS,
    SQL_CHECK_LABELS,
    SQL_CHECK_MEANINGS,
    SQL_CONFIDENT_RULE,
    SQL_DIFFICULTY_LABELS,
    SQL_PRIORITY_LABELS,
    SQL_RESOURCE_KIND_ORDER,
    type SqlCheckKey,
    type SqlLesson,
    type SqlPriority,
    type SqlProblem,
    type SqlResourceKind,
    type SqlTopic,
    type SqlTopicAnswers,
} from '../data/sql';
import { useSql } from '../hooks/useSql';
import { useSqlQueries } from '../hooks/useSqlQueries';
import { sqlGlossary } from '../utils/sqlGlossary';
import { checksPassed, confidentCount, isTopicConfident, nextTopic, topicsInProgress } from '../utils/sqlProgress';
import type { SqlProgress } from '../services/firebaseService';
import {
    CONFIDENT,
    CYAN,
    TAP,
    px,
    scrollToIdWhenSettled,
    stepId,
    useTextSize,
    useTextSizeChoice,
    readStudyMode,
    writeStudyMode,
    type LearningStep,
} from './learning/learning';
import {
    LearningPageFrame,
    TextSizeControl,
    SectionLabel,
    Tag,
    TopicResourceRow,
    CheckDots,
    StepBar,
    ReferencePanel,
    Block,
    Bullets,
    NumberedSteps,
    CodeBlock,
    QuoteBox,
    FollowUps,
    AnswerReveal,
} from './learning/LearningParts';
import { GlossaryProvider, GlossaryTopic, NewWordsBox, ProseText } from './learning/GlossaryText';
import { GlossaryDrawer } from './learning/GlossaryDrawer';
import { InterviewQuestionsView } from './learning/InterviewQuestions';
import { sqlInterviewSet } from '../data/interviewPrep/sql';
import { MermaidDiagram } from './learning/MermaidDiagram';
import { AnimatedScene } from './learning/anim/AnimatedScene';
import { useTopicAnimation } from './learning/anim/useTopicAnimation';
import { useLoaded } from './learning/useLoaded';
import { segmentSections, type Prose } from './learning/glossaryContext';
import { AnswerQuery, ExampleBlock, ExampleOutcome, MONO, PracticeDatabase, SavedQueriesPanel, SqlRunBox } from './sql/SqlParts';
import { SqlQueriesContext, SqlTopicContext } from './sql/sqlContext';

const MAX_IN_PROGRESS = 8;
/** "Must know" stands out from the other tags at a glance. */
const MUST = '#ffca28';
/** The marker on common mistakes. */
const WARNING = '#ffa726';
const MUTED_TAG_BG = 'rgba(255,255,255,0.06)';
const DIFFICULTY_COLOURS: Record<SqlProblem['difficulty'], string> = { easy: '#66bb6a', medium: '#ffca28', hard: '#ff8a65' };

const KIND_LABELS: Record<SqlResourceKind, string> = {
    watch: 'WATCH',
    read: 'READ',
    practice: 'PRACTISE',
};

const LESSON_STEPS: LearningStep[] = [
    { title: 'Understand', time: 'the lesson and examples', label: 'STEP 1 · UNDERSTAND IT' },
    { title: 'Go further', time: 'free, optional', label: 'STEP 2 · GO FURTHER (FREE, OPTIONAL)' },
    { title: 'Practise', time: 'four exercises', label: 'STEP 3 · PRACTISE, IN THIS ORDER' },
    { title: 'Prove', time: 'next day', label: 'STEP 4 · INTERVIEW-READY, THEN PROVE IT' },
];

const PROBLEM_STEPS: LearningStep[] = [
    { title: 'Solve it', time: 'try first, then look', label: 'STEP 1 · SOLVE IT YOURSELF FIRST' },
    { title: 'Go further', time: 'free, optional', label: 'STEP 2 · GO FURTHER (FREE, OPTIONAL)' },
    { title: 'Practise', time: 'four variations', label: 'STEP 3 · PRACTISE, IN THIS ORDER' },
    { title: 'Prove', time: 'next day', label: 'STEP 4 · INTERVIEW-READY, THEN PROVE IT' },
];

const PRACTICE_HINTS: Partial<Record<SqlCheckKey, string>> = {
    write: 'from a blank page, then run it',
    predict: 'say it before you run it',
};

// ============ GLOSSARY WORDS ============
//
// Only the first mention of each word in a card is underlined. These list a
// card's prose in the order it is shown, so the underline lands on the mention
// the reader meets first. SQL code, diagrams and resource titles are left out.

type Section =
    | 'definition' | 'problem' | 'idea' | 'howItWorks' | 'analogy' | 'breaks' | 'exampleNotes' | 'keyPoints' | 'dialects'
    | 'spot' | 'approach' | 'solutionNotes' | 'edgeCases'
    | 'mistakes' | 'practice' | 'interviewAnswer' | 'followUps' | 'answers';

/** Follow-ups as question, answer, question, answer… */
const followUpTexts = (topic: SqlTopic) => topic.followUps.flatMap(followUp => [followUp.q, followUp.a]);
const practiceTexts = (topic: SqlTopic) => SQL_CHECK_KEYS.map(key => topic.practice[key]);
const solutionNotes = (topic: SqlProblem) => [topic.solution, ...(topic.alternatives ?? [])].map(example => example.note ?? '');

/**
 * The lesson, practice and interview steps of a Learn card. The hidden
 * practice answers come last, so a word is never underlined only inside an
 * answer that isn't open.
 */
const learnSections = (topic: SqlTopic, answers: SqlTopicAnswers | undefined): [Section, string[]][] => [
    ['definition', [topic.definition]],
    ...(topic.kind === 'lesson'
        ? ([
            ['problem', [topic.problem]],
            ['idea', [topic.idea]],
            ['howItWorks', topic.howItWorks],
            ['analogy', [topic.analogy]],
            ['breaks', [topic.breaks]],
            ['exampleNotes', topic.examples.map(example => example.note ?? '')],
            ['keyPoints', topic.keyPoints],
            ['mistakes', topic.mistakes],
            ['dialects', topic.dialects ?? []],
        ] satisfies [Section, string[]][])
        : ([
            ['problem', [topic.problem]],
            ['spot', [topic.spot]],
            ['approach', topic.approach],
            ['solutionNotes', solutionNotes(topic)],
            ['edgeCases', topic.edgeCases],
            ['mistakes', topic.mistakes],
            ['dialects', topic.dialects ?? []],
        ] satisfies [Section, string[]][])),
    ['practice', practiceTexts(topic)],
    ['interviewAnswer', [topic.interviewAnswer]],
    ['followUps', followUpTexts(topic)],
    ['answers', SQL_CHECK_KEYS.map(key => answers?.[key].answer ?? '')],
];

/** The shorter Revise card. */
const reviseSections = (topic: SqlTopic): [Section, string[]][] => [
    ['definition', [topic.definition]],
    ...(topic.kind === 'lesson'
        ? ([
            ['exampleNotes', topic.examples.slice(0, 1).map(example => example.note ?? '')],
            ['keyPoints', topic.keyPoints],
        ] satisfies [Section, string[]][])
        : ([
            ['spot', [topic.spot]],
            ['solutionNotes', [topic.solution.note ?? '']],
            ['edgeCases', topic.edgeCases],
        ] satisfies [Section, string[]][])),
    ['mistakes', topic.mistakes],
    ['interviewAnswer', [topic.interviewAnswer]],
    ['followUps', followUpTexts(topic)],
];

type Marked = (section: Section) => Prose[];

// ============ MODE AND FILTERS ============

type Mode = 'learn' | 'revise' | 'interview';
const MODES: Mode[] = ['learn', 'revise', 'interview'];
const MODE_LABELS: Record<Mode, string> = { learn: 'Learn', revise: 'Revise', interview: 'Interview questions' };
type PriorityFilter = 'all' | SqlPriority;
/** A phase number, or every phase at once (Revise mode only). */
type TabValue = number | 'all';

const MODE_KEY = 'sql-mode';

/** The mode last used on this device, or the one a link asks for with ?mode=. */
const readMode = (): Mode => readStudyMode(MODE_KEY, MODES);

const writeMode = (mode: Mode) => writeStudyMode(MODE_KEY, mode);

const PRIORITY_FILTERS: { value: PriorityFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'must', label: SQL_PRIORITY_LABELS.must },
    { value: 'should', label: SQL_PRIORITY_LABELS.should },
    { value: 'bonus', label: SQL_PRIORITY_LABELS.bonus },
];

const matchesFilters = (topic: SqlTopic, priority: PriorityFilter, query: string) => {
    if (priority !== 'all' && topic.priority !== priority) return false;
    const q = query.trim().toLowerCase();
    return (
        !q ||
        topic.name.toLowerCase().includes(q) ||
        topic.definition.toLowerCase().includes(q) ||
        (topic.kind === 'problem' && topic.pattern.toLowerCase().includes(q))
    );
};

const phaseOf = (topicId: string) =>
    sqlPhases.find(phase => phase.topics.some(topic => topic.id === topicId)) ?? sqlPhases[0];

const mustTopics = allSqlTopics.filter(topic => topic.priority === 'must');

// ============ SMALL PIECES ============

const PriorityTag = ({ priority }: { priority: SqlPriority }) =>
    priority === 'must' ? (
        <Tag label={SQL_PRIORITY_LABELS.must} color={MUST} bgcolor={`${MUST}1f`} />
    ) : (
        <Tag label={SQL_PRIORITY_LABELS[priority]} color={priority === 'bonus' ? 'text.disabled' : 'text.secondary'} bgcolor={MUTED_TAG_BG} />
    );

const TopicTags = ({ topic }: { topic: SqlTopic }) => (
    <>
        <PriorityTag priority={topic.priority} />
        {topic.kind === 'problem' && (
            <Tag
                label={SQL_DIFFICULTY_LABELS[topic.difficulty]}
                color={DIFFICULTY_COLOURS[topic.difficulty]}
                bgcolor={`${DIFFICULTY_COLOURS[topic.difficulty]}1a`}
            />
        )}
    </>
);

/** The animations load as their own chunk, the first time a lesson is opened. */
const loadAnimations = () => import('../data/sqlAnimations').then(m => m.sqlAnimations);

/** The lesson's animation, once loaded. Topics without one show nothing. */
const TopicAnimation = ({ topicId, accent }: { topicId: string; accent: string }) => {
    const spec = useTopicAnimation(loadAnimations, topicId);
    if (!spec) return null;
    return (
        <Block title="Watch it happen">
            <AnimatedScene spec={spec} accent={accent} />
        </Block>
    );
};

/** The practice answers load as their own chunk, the first time a topic is opened. */
const loadAnswers = () => import('../data/sqlAnswers').then(m => m.sqlAnswers);

const PictureIt = ({ topic }: { topic: SqlTopic }) => (
    <Block title="Picture it">
        <MermaidDiagram code={topic.diagram.code} caption={topic.diagram.caption} title={topic.name} />
    </Block>
);

/** The practice tables a problem uses, in a code font. */
const TableNames = ({ names }: { names: string[] }) => (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {names.map(name => (
            <Tag key={name} label={name} color={CYAN} bgcolor={`${CYAN}14`} />
        ))}
    </Stack>
);

// ============ STEP 1: THE LESSON ============

const LessonBody = ({ topic, accent, marked }: { topic: SqlLesson; accent: string; marked: Marked }) => (
    <>
        <Block title="Why you need it">
            <Typography variant="body1"><ProseText value={marked('problem')[0]} /></Typography>
        </Block>
        <TopicAnimation topicId={topic.id} accent={accent} />
        <PictureIt topic={topic} />
        <Block title="The idea">
            <Typography variant="body1"><ProseText value={marked('idea')[0]} /></Typography>
        </Block>
        {topic.syntax && (
            <Block title="The shape of it">
                <CodeBlock code={topic.syntax} language="sql" />
                <Typography color="text.secondary" variant="body2" sx={{ mt: 0.75 }}>
                    Words in CAPITALS are SQL; the lower-case words are the parts you fill in.
                </Typography>
            </Block>
        )}
        <Block title="How it works, step by step">
            <NumberedSteps items={marked('howItWorks')} accent={accent} />
        </Block>
        <Block title="Analogy">
            <Typography variant="body1"><ProseText value={marked('analogy')[0]} /></Typography>
        </Block>
        <Block title="Where the analogy breaks">
            <Typography variant="body1" color="text.secondary"><ProseText value={marked('breaks')[0]} /></Typography>
        </Block>
        <Block title={topic.examples.length === 1 ? 'Worked example' : 'Worked examples'}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Read the query, guess the result, then check it. Press "Try it yourself" to change it and run it.
            </Typography>
            <Stack spacing={3.5}>
                {topic.examples.map((example, index) => (
                    <ExampleBlock
                        key={example.title}
                        example={example}
                        number={topic.examples.length > 1 ? index + 1 : undefined}
                        accent={accent}
                        note={marked('exampleNotes')[index]}
                        saveAs={{
                            key: `example-${index + 1}`,
                            place: topic.examples.length > 1 ? `Step 1 · Example ${index + 1}: ${example.title}` : `Step 1 · Worked example: ${example.title}`,
                        }}
                    />
                ))}
            </Stack>
        </Block>
        <Block title="Must-know points">
            <Bullets items={marked('keyPoints')} marker={accent} />
        </Block>
        <Block title="Common mistakes">
            <Bullets items={marked('mistakes')} marker={WARNING} />
        </Block>
        {topic.dialects && topic.dialects.length > 0 && (
            <Block title="In other databases">
                <Bullets items={marked('dialects')} />
            </Block>
        )}
    </>
);

/** An interview problem: think it through, try it, and only then open the solution. */
const ProblemBody = ({ topic, accent, marked }: { topic: SqlProblem; accent: string; marked: Marked }) => {
    const [solutionShown, setSolutionShown] = useState(false);
    const notes = marked('solutionNotes');
    return (
        <>
            <Block title="Tables you will use">
                <TableNames names={topic.tables} />
            </Block>
            <Block title="What it really tests">
                <Typography variant="body1"><ProseText value={marked('problem')[0]} /></Typography>
            </Block>
            <Block title={`The pattern: ${topic.pattern}`}>
                <Typography variant="body1"><ProseText value={marked('spot')[0]} /></Typography>
            </Block>
            <PictureIt topic={topic} />
            <Block title="The approach, step by step">
                <NumberedSteps items={marked('approach')} accent={accent} />
            </Block>
            <SqlRunBox
                initialSql={`-- Tables: ${topic.tables.join(', ')}\n-- Write your answer here, run it, then compare with the solution.\nSELECT `}
                accent={accent}
                label="Your turn: write it before you look"
                saveAs={{ key: 'your-turn', place: 'Step 1 · Your turn', restore: true }}
            />
            {solutionShown ? (
                <Stack spacing={3}>
                    <ExampleBlock
                        example={topic.solution}
                        accent={accent}
                        note={notes[0]}
                        saveAs={{ key: 'solution', place: 'Step 1 · Solution' }}
                    />
                    {(topic.alternatives ?? []).map((example, index) => (
                        <ExampleBlock
                            key={example.title}
                            example={example}
                            accent={accent}
                            note={notes[index + 1]}
                            saveAs={{ key: `alternative-${index + 1}`, place: `Step 1 · Another way: ${example.title}` }}
                        />
                    ))}
                    <Block title="Edge cases to say out loud">
                        <Bullets items={marked('edgeCases')} marker={accent} />
                    </Block>
                    <Block title="Common mistakes">
                        <Bullets items={marked('mistakes')} marker={WARNING} />
                    </Block>
                    {topic.dialects && topic.dialects.length > 0 && (
                        <Block title="In other databases">
                            <Bullets items={marked('dialects')} />
                        </Block>
                    )}
                </Stack>
            ) : (
                <Box>
                    <Button
                        variant="outlined"
                        startIcon={<VisibilityRoundedIcon />}
                        onClick={() => setSolutionShown(true)}
                        sx={{ minHeight: TAP, px: 2, textTransform: 'none', fontWeight: 700, color: accent, borderColor: `${accent}80` }}
                    >
                        Show the solution
                    </Button>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Stuck for more than ten minutes? Open it, read it, close it, and write it again from memory.
                    </Typography>
                </Box>
            )}
        </>
    );
};

// ============ LEARN MODE: THE TOPIC CARD ============

const TopicCard = ({
    topic,
    number,
    accent,
    progress,
    expanded,
    onExpand,
    onToggleCheck,
}: {
    topic: SqlTopic;
    number: number;
    accent: string;
    progress: SqlProgress;
    expanded: boolean;
    onExpand: (open: boolean) => void;
    onToggleCheck: (check: SqlCheckKey) => void;
}) => {
    const t = useTextSize();
    const passed = checksPassed(progress, topic.id);
    const confident = isTopicConfident(progress, topic.id);
    const resources = [...topic.resources].sort(
        (a, b) => SQL_RESOURCE_KIND_ORDER.indexOf(a.kind) - SQL_RESOURCE_KIND_ORDER.indexOf(b.kind)
    );
    const steps = topic.kind === 'lesson' ? LESSON_STEPS : PROBLEM_STEPS;
    const answers = useLoaded(loadAnswers, expanded)?.[topic.id];
    const where = useMemo(() => ({ topicId: topic.id, topicName: topic.name }), [topic]);
    const marked = useMemo(() => segmentSections(sqlGlossary, learnSections(topic, answers)), [topic, answers]);

    return (
        <Accordion
            id={`topic-${topic.id}`}
            expanded={expanded}
            onChange={(_, open) => onExpand(open)}
            disableGutters
            slotProps={{ transition: { unmountOnExit: true } }}
            sx={{
                bgcolor: confident ? 'rgba(102,187,106,0.06)' : 'rgba(255,255,255,0.02)',
                border: '1px solid',
                borderColor: confident ? 'rgba(102,187,106,0.35)' : 'rgba(255,255,255,0.08)',
                borderRadius: 2,
                '&:before': { display: 'none' },
                scrollMarginTop: 16,
            }}
        >
            <AccordionSummary
                expandIcon={<ExpandMoreRoundedIcon />}
                sx={{ minHeight: TAP }}
                // The open topic's title heads the section rail.
                {...(expanded && { 'data-nav': 'topic', 'data-nav-label': topic.name })}
            >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 1, minWidth: 0 }} flexWrap="wrap" useFlexGap>
                    <Typography sx={{ color: accent, fontWeight: 800, minWidth: 24, fontVariantNumeric: 'tabular-nums' }}>
                        {number}
                    </Typography>
                    <Typography fontWeight={700} color="text.primary" sx={{ flex: 1, minWidth: 160, overflowWrap: 'anywhere' }}>
                        {topic.name}
                    </Typography>
                    <TopicTags topic={topic} />
                    {confident ? (
                        <Tag label="CONFIDENT" color={CONFIDENT} bgcolor={`${CONFIDENT}1f`} />
                    ) : (
                        <CheckDots passed={passed} total={SQL_CHECK_KEYS.length} accent={accent} />
                    )}
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, pb: 3, px: { xs: 2, sm: 3 } }}>
                <SqlTopicContext.Provider value={where}>
                    <GlossaryTopic topicId={topic.id}>
                        <StepBar topicId={topic.id} accent={accent} steps={steps} />

                        {/* ---- STEP 1 ---- the lesson, or the problem to solve */}
                        <SectionLabel color={accent} id={stepId(topic.id, 1)}>{steps[0].label}</SectionLabel>
                        <Stack spacing={3} sx={{ maxWidth: 760 }}>
                            <QuoteBox accent={accent}>
                                <Typography variant="body1">
                                    <strong style={{ color: accent }}>{topic.kind === 'lesson' ? 'Definition.' : 'The question.'}</strong>{' '}
                                    <ProseText value={marked('definition')[0]} />
                                </Typography>
                            </QuoteBox>
                            <NewWordsBox topicId={topic.id} accent={accent} />
                            {topic.kind === 'lesson' ? (
                                <LessonBody topic={topic} accent={accent} marked={marked} />
                            ) : (
                                <ProblemBody topic={topic} accent={accent} marked={marked} />
                            )}
                        </Stack>

                        {/* ---- STEP 2 ---- */}
                        <SectionLabel color={accent} id={stepId(topic.id, 2)}>{steps[1].label}</SectionLabel>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.75, maxWidth: 760 }}>
                            The notes above are enough on their own. Use these for a second explanation or more practice.
                        </Typography>
                        <Stack spacing={1.75} sx={{ maxWidth: 760 }}>
                            {resources.map((resource, index) => (
                                <TopicResourceRow key={`${resource.kind}-${resource.title}`} resource={resource} accent={accent} number={index + 1} kindLabels={KIND_LABELS} />
                            ))}
                        </Stack>

                        {/* ---- STEP 3 ---- */}
                        <SectionLabel color={accent} id={stepId(topic.id, 3)}>{steps[2].label}</SectionLabel>
                        <Stack spacing={2} sx={{ maxWidth: 760 }}>
                            <Typography color="text.secondary" sx={{ fontSize: px(t.small) }}>
                                Try each one yourself first: out loud, or written and run in the practice box below, which saves every query you run.
                                Then tap Show answer to check.
                            </Typography>
                            {SQL_CHECK_KEYS.map((key, index) => (
                                <Stack key={key} direction="row" spacing={1.5} alignItems="flex-start">
                                    <Typography sx={{ color: accent, fontWeight: 800, minWidth: 22, flexShrink: 0 }}>
                                        {index + 1}
                                    </Typography>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography variant="caption" sx={{ display: 'block', color: accent, fontWeight: 800, letterSpacing: 0.8 }}>
                                            {SQL_CHECK_LABELS[key].toUpperCase()}
                                            {PRACTICE_HINTS[key] && (
                                                <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0 }}>
                                                    {' '}({PRACTICE_HINTS[key]})
                                                </Box>
                                            )}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                            <ProseText value={marked('practice')[index]} />
                                        </Typography>
                                        {answers && (
                                            <AnswerReveal id={`answer-${topic.id}-${key}`} text={marked('answers')[index]} accent={accent}>
                                                {answers[key].query && (
                                                    <AnswerQuery
                                                        query={answers[key].query}
                                                        accent={accent}
                                                        saveAs={{ key: `answer-${key}`, place: `Step 3 · ${SQL_CHECK_LABELS[key]} answer` }}
                                                    />
                                                )}
                                            </AnswerReveal>
                                        )}
                                    </Box>
                                </Stack>
                            ))}
                            <SqlRunBox
                                initialSql={'-- Write and run your answers here.\nSELECT '}
                                accent={accent}
                                label="Practice box: run your answers on the practice database"
                                saveAs={{ key: 'practice', place: 'Step 3 · Practice box', restore: true }}
                            />
                            <Typography color="text.secondary" sx={{ fontStyle: 'italic', fontSize: px(t.small) }}>
                                Yours can look different and still be right: if it returns the same rows for the same reason, it counts.
                                Not sure yours counts? Send Claude your query and "check my answer: {topic.name}".
                            </Typography>
                        </Stack>

                        {/* ---- STEP 4 ---- say it, test yourself, then tick the checks */}
                        <SectionLabel color={accent} id={stepId(topic.id, 4)}>{steps[3].label}</SectionLabel>
                        <Stack spacing={3} sx={{ maxWidth: 760 }}>
                            <Block title="Your interview answer">
                                <QuoteBox accent={accent}>
                                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>"<ProseText value={marked('interviewAnswer')[0]} />"</Typography>
                                </QuoteBox>
                                <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: px(t.small) }}>
                                    Say this out loud.
                                </Typography>
                            </Block>
                            <Block title="Follow-up questions">
                                <FollowUps topic={topic} accent={accent} marked={marked} />
                            </Block>
                            <Box>
                                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5 }}>
                                    Do this the next day with your notes closed. Tick only what you can do from memory.
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    {SQL_CHECK_KEYS.map(key => {
                                        const done = progress.checks[topic.id]?.[key] === true;
                                        const fill = confident ? CONFIDENT : accent;
                                        return (
                                            <Tooltip key={key} title={SQL_CHECK_MEANINGS[key]} arrow>
                                                <Chip
                                                    label={SQL_CHECK_LABELS[key]}
                                                    onClick={() => onToggleCheck(key)}
                                                    aria-pressed={done}
                                                    sx={{
                                                        height: TAP,
                                                        px: 1,
                                                        borderRadius: TAP / 2,
                                                        fontSize: px(t.small),
                                                        fontWeight: 700,
                                                        color: done ? '#0b0f14' : 'text.secondary',
                                                        bgcolor: done ? fill : 'rgba(255,255,255,0.05)',
                                                        border: '1px solid',
                                                        borderColor: done ? 'transparent' : 'rgba(255,255,255,0.14)',
                                                        '&:hover': { bgcolor: done ? fill : 'rgba(255,255,255,0.1)' },
                                                    }}
                                                />
                                            </Tooltip>
                                        );
                                    })}
                                </Stack>
                            </Box>
                        </Stack>
                    </GlossaryTopic>
                </SqlTopicContext.Provider>
            </AccordionDetails>
        </Accordion>
    );
};

// ============ REVISE MODE: THE COMPACT CARD ============

const ReviseCard = ({ topic, accent, onOpen }: { topic: SqlTopic; accent: string; onOpen: () => void }) => {
    const marked = useMemo(() => segmentSections(sqlGlossary, reviseSections(topic)), [topic]);
    const example = topic.kind === 'lesson' ? topic.examples[0] : topic.solution;
    return (
        <GlossaryTopic topicId={topic.id}>
            <Box
                component="article"
                sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid', borderLeftColor: accent }}
            >
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ flex: 1, minWidth: 180, overflowWrap: 'anywhere', lineHeight: 1.3 }}>
                        {topic.name}
                    </Typography>
                    <TopicTags topic={topic} />
                </Stack>
                <Typography variant="body1" sx={{ color: 'text.primary' }}>
                    <ProseText value={marked('definition')[0]} />
                </Typography>

                {topic.kind === 'lesson' ? (
                    <>
                        {topic.syntax && (
                            <>
                                <SectionLabel color={accent}>THE SHAPE OF IT</SectionLabel>
                                <CodeBlock code={topic.syntax} language="sql" />
                            </>
                        )}
                        <SectionLabel color={accent}>MUST-KNOW POINTS</SectionLabel>
                        <Bullets items={marked('keyPoints')} marker={accent} variant="body2" />
                    </>
                ) : (
                    <>
                        <SectionLabel color={accent}>{`PATTERN: ${topic.pattern.toUpperCase()}`}</SectionLabel>
                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                            <ProseText value={marked('spot')[0]} />
                        </Typography>
                    </>
                )}

                <SectionLabel color={accent}>{topic.kind === 'lesson' ? 'EXAMPLE' : 'SOLUTION'}</SectionLabel>
                <CodeBlock code={example.sql} language="sql" />
                <ExampleOutcome example={example} />
                {example.note && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.primary' }}>
                        <ProseText value={marked(topic.kind === 'lesson' ? 'exampleNotes' : 'solutionNotes')[0]} />
                    </Typography>
                )}

                {topic.kind === 'problem' && (
                    <>
                        <SectionLabel color={accent}>EDGE CASES</SectionLabel>
                        <Bullets items={marked('edgeCases')} marker={accent} variant="body2" />
                    </>
                )}

                <SectionLabel color={WARNING}>COMMON MISTAKES</SectionLabel>
                <Bullets items={marked('mistakes')} marker={WARNING} variant="body2" />

                <SectionLabel color={accent}>INTERVIEW ANSWER</SectionLabel>
                <QuoteBox accent={accent}>
                    <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                        "<ProseText value={marked('interviewAnswer')[0]} />"
                    </Typography>
                </QuoteBox>

                <SectionLabel color={accent}>FOLLOW-UP QUESTIONS</SectionLabel>
                <Stack spacing={1.25}>
                    {topic.followUps.map((followUp, index) => (
                        <Box key={followUp.q}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                <ProseText value={marked('followUps')[2 * index]} />
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <ProseText value={marked('followUps')[2 * index + 1]} />
                            </Typography>
                        </Box>
                    ))}
                </Stack>

                <Button
                    size="small"
                    onClick={onOpen}
                    sx={{ minHeight: TAP, mt: 1.5, px: 1, textTransform: 'none', fontWeight: 700, color: accent }}
                >
                    Open in Learn mode →
                </Button>
            </Box>
        </GlossaryTopic>
    );
};

/** The shapes worth knowing by heart, on one screen. */
const CheatSheet = () => {
    const t = useTextSize();
    return (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            {sqlCheatSheet.map(item => (
                <Box key={item.title} sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={800} color="text.primary" sx={{ mb: 0.75 }}>
                        {item.title}
                    </Typography>
                    <Box
                        component="pre"
                        sx={{
                            m: 0,
                            p: 1.5,
                            borderRadius: 2,
                            overflowX: 'auto',
                            bgcolor: '#000',
                            border: '1px solid rgba(255,255,255,0.08)',
                            fontFamily: MONO,
                            fontSize: px(t.code),
                            lineHeight: 1.55,
                            color: 'text.primary',
                        }}
                    >
                        {item.code}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

// ============ THE PAGE ============

/**
 * SQL: from the first SELECT to interview problems.
 *
 * Learn mode works one topic at a time through the same four steps as the
 * other study pages, with every example runnable on the practice database.
 * Revise mode lays the notes out flat for a fast read before an interview.
 */
const SqlPage = () => {
    const { progress, toggleCheck } = useSql();
    const savedQueries = useSqlQueries();
    const savedCount = Object.keys(savedQueries.queries).length;
    const next = nextTopic(progress);
    const inProgress = topicsInProgress(progress).filter(topic => topic.id !== next?.id);
    const { textSize, t, theme, changeTextSize } = useTextSizeChoice();

    const [mode, setMode] = useState<Mode>(readMode);
    const changeMode = (value: Mode | null) => {
        if (!value) return;
        setMode(value);
        writeMode(value);
    };

    const [priority, setPriority] = useState<PriorityFilter>('all');
    const [query, setQuery] = useState('');
    const matches = (topic: SqlTopic) => matchesFilters(topic, priority, query);

    // Until a tab is chosen, Learn follows the next topic and Revise shows every
    // phase. "All phases" only exists in Revise, so Learn falls back from it.
    const [chosenTab, setChosenTab] = useState<TabValue | null>(null);
    const nextPhase = next ? phaseOf(next.id).number : 0;
    const tab: TabValue =
        mode === 'learn'
            ? (chosenTab === null || chosenTab === 'all' ? nextPhase : chosenTab)
            : (chosenTab ?? 'all');
    const [expanded, setExpanded] = useState<string | null>(null);
    const [glossaryOpen, setGlossaryOpen] = useState(false);

    const openTopic = (topicId: string) => {
        const topic = allSqlTopics.find(item => item.id === topicId);
        // A filter that hides the topic would leave nothing to open.
        if (topic && !matches(topic)) {
            setPriority('all');
            setQuery('');
        }
        changeMode('learn');
        setChosenTab(phaseOf(topicId).number);
        setExpanded(topicId);
        // Wait for the tab to render before scrolling to the card.
        window.setTimeout(() => scrollToIdWhenSettled(`topic-${topicId}`), 120);
    };

    const clearFilters = () => {
        setPriority('all');
        setQuery('');
    };

    const confident = confidentCount(progress, allSqlTopics);
    const checksDone = allSqlTopics.reduce((sum, topic) => sum + checksPassed(progress, topic.id), 0);
    const mustConfident = confidentCount(progress, mustTopics);
    const problemCount = allSqlTopics.filter(topic => topic.kind === 'problem').length;

    const visiblePhases = tab === 'all' ? sqlPhases : sqlPhases.filter(phase => phase.number === tab);
    const phase = visiblePhases[0];
    const phaseConfident = confidentCount(progress, phase.topics);

    const topicChip = (topic: SqlTopic) => (
        <Chip
            key={topic.id}
            label={topic.name}
            onClick={() => openTopic(topic.id)}
            sx={{
                height: 'auto',
                minHeight: TAP,
                fontSize: px(t.small),
                '& .MuiChip-label': { whiteSpace: 'normal', py: 0.75 },
                bgcolor: 'rgba(255,255,255,0.06)',
            }}
        />
    );

    const noMatches = (
        <Box sx={{ p: 2.5, borderRadius: 2, border: '1px dashed rgba(255,255,255,0.15)' }}>
            <Typography variant="body2" color="text.secondary">
                No topics here match these filters.
            </Typography>
            <Button onClick={clearFilters} sx={{ minHeight: TAP, mt: 1, px: 1, textTransform: 'none', fontWeight: 700 }}>
                Clear filters
            </Button>
        </Box>
    );

    return (
        <LearningPageFrame t={t} theme={theme}>
            <SqlQueriesContext.Provider value={savedQueries}>
                <GlossaryProvider source={sqlGlossary} openTopic={openTopic}>
                    <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto', minWidth: 0 }}>
                        {/* ---- HEADER ---- */}
                        <Box sx={{ mb: 3 }}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                spacing={2}
                                sx={{ pb: 3, mb: 4, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                            >
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
                                        SQL
                                    </Typography>
                                    <Typography variant="body1" fontWeight="medium" color="text.primary">
                                        Self-paced · {sqlPhases.length} phases · {allSqlTopics.length - problemCount} lessons · {problemCount} interview problems
                                    </Typography>
                                </Box>
                                <TextSizeControl value={textSize} onChange={changeTextSize} />
                            </Stack>
                            <Typography
                                variant="h2"
                                fontWeight="bold"
                                sx={{ color: 'text.primary', mb: 1, fontSize: { xs: `${2 * t.heading}rem`, sm: `${3 * t.heading}rem` } }}
                            >
                                Ask the data anything
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                SQL from your first SELECT to interview problems — one small step at a time, with every example runnable right here.
                            </Typography>
                        </Box>

                        {/* ---- MODE, AND THE GLOSSARY ---- */}
                        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                            <ToggleButtonGroup
                                exclusive
                                value={mode}
                                onChange={(_, value: Mode | null) => changeMode(value)}
                                aria-label="Mode"
                            >
                                {MODES.map(value => (
                                    <ToggleButton
                                        key={value}
                                        value={value}
                                        sx={{ minHeight: TAP, px: 3, textTransform: 'none', fontWeight: 700, '&:focus': { outline: 'none' } }}
                                    >
                                        {MODE_LABELS[value]}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                            <Button
                                variant="outlined"
                                startIcon={<MenuBookRoundedIcon />}
                                onClick={() => setGlossaryOpen(true)}
                                aria-haspopup="dialog"
                                sx={{ minHeight: TAP, px: 2, textTransform: 'none', fontWeight: 700, color: 'text.primary', borderColor: 'rgba(255,255,255,0.2)' }}
                            >
                                Glossary
                            </Button>
                        </Stack>
                        <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} onOpenTopic={openTopic} />

                        {mode === 'interview' ? (
                            <InterviewQuestionsView
                                sets={[sqlInterviewSet]}
                                glossary={sqlGlossary}
                                accent={CYAN}
                                topicName={id => allSqlTopics.find(topic => topic.id === id)?.name}
                                openTopic={openTopic}
                            />
                        ) : (
                            <>
                            {/* ---- STATS ---- */}
                            <Stack direction="row" spacing={4} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
                                {[
                                    { value: confident, total: allSqlTopics.length, label: 'TOPICS CONFIDENT', color: CONFIDENT },
                                    { value: checksDone, total: allSqlTopics.length * SQL_CHECK_KEYS.length, label: 'CHECKS PASSED', color: CYAN },
                                    { value: mustConfident, total: mustTopics.length, label: 'MUST-KNOW CONFIDENT', color: MUST },
                                ].map(stat => (
                                    <Box key={stat.label}>
                                        <Typography variant="h3" fontWeight="bold" sx={{ color: stat.color, lineHeight: 1 }}>
                                            {stat.value}
                                            <Typography component="span" variant="h5" color="text.secondary"> / {stat.total}</Typography>
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1.2, fontWeight: 700 }}>
                                            {stat.label}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>

                            {/* ---- NEXT UP ---- Learn mode only */}
                            {mode === 'learn' && (
                                <Box sx={{ p: 2.5, borderRadius: 3, mb: 3, bgcolor: 'rgba(102,187,106,0.06)', border: '1px solid rgba(102,187,106,0.3)' }}>
                                    {next ? (
                                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="caption" sx={{ display: 'block', color: CONFIDENT, fontWeight: 800, letterSpacing: 1.2 }}>
                                                    NEXT UP · PHASE {phaseOf(next.id).number}
                                                </Typography>
                                                <Typography variant="h6" fontWeight="bold" color="text.primary">
                                                    {next.name}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {checksPassed(progress, next.id)} of 4 checks passed
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.primary', mt: 1 }}>
                                                    Open the topic and follow Steps 1 → 4.
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                onClick={() => openTopic(next.id)}
                                                sx={{ minHeight: TAP, px: 2.5, textTransform: 'none', fontWeight: 700 }}
                                            >
                                                Open topic
                                            </Button>
                                        </Stack>
                                    ) : (
                                        <Typography variant="body1" color="text.primary" fontWeight={700}>
                                            Every topic is confident. Keep re-testing old ones every two weeks, and untick any you fail.
                                        </Typography>
                                    )}
                                    {inProgress.length > 0 && (
                                        <>
                                            <Typography variant="body2" color="text.secondary" sx={{ mt: 2.5, mb: 1 }}>
                                                Also started, not finished:
                                            </Typography>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                {inProgress.slice(0, MAX_IN_PROGRESS).map(topicChip)}
                                                {inProgress.length > MAX_IN_PROGRESS && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ alignSelf: 'center' }}>
                                                        and {inProgress.length - MAX_IN_PROGRESS} more
                                                    </Typography>
                                                )}
                                            </Stack>
                                        </>
                                    )}
                                </Box>
                            )}

                            {/* ---- REFERENCE ---- how to study, the practice tables, the cheat sheet */}
                            <Stack spacing={1.5} sx={{ mb: 3 }}>
                                <ReferencePanel title="How to study SQL (read once)" tint="rgba(77,208,225,0.07)" border="rgba(77,208,225,0.25)">
                                    <Stack component="ol" spacing={1} sx={{ pl: 2.5, m: 0 }}>
                                        {sqlHowToStudy.map(line => (
                                            <Typography key={line} component="li" variant="body2" sx={{ color: 'text.primary' }}>
                                                {line}
                                            </Typography>
                                        ))}
                                    </Stack>
                                    <Typography variant="body1" sx={{ color: 'text.primary', mt: 2.5 }}>
                                        {SQL_CONFIDENT_RULE}
                                    </Typography>
                                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 2.5 }}>
                                        {SQL_CHECK_KEYS.map((key, index) => (
                                            <Box key={key} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                                                <Typography variant="body2" fontWeight={800} color="text.primary">
                                                    {index + 1}. {SQL_CHECK_LABELS[key]}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                                    {SQL_CHECK_MEANINGS[key]}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </ReferencePanel>
                                <ReferencePanel title="The practice database: six tables, and a box to run any query" tint="rgba(255,202,40,0.06)" border="rgba(255,202,40,0.25)">
                                    <PracticeDatabase accent={MUST} />
                                </ReferencePanel>
                                <ReferencePanel title={`My saved queries (${savedCount})`} tint="rgba(102,187,106,0.05)" border="rgba(102,187,106,0.25)">
                                    <SavedQueriesPanel accent={CONFIDENT} openTopic={openTopic} />
                                </ReferencePanel>
                                <ReferencePanel title="SQL cheat sheet: the shapes to know by heart" tint="rgba(255,255,255,0.03)" border="rgba(255,255,255,0.12)">
                                    <CheatSheet />
                                </ReferencePanel>
                            </Stack>

                            {/* ---- FILTERS ---- */}
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                spacing={1.5}
                                alignItems={{ xs: 'stretch', sm: 'center' }}
                                justifyContent="space-between"
                                sx={{ mb: 2 }}
                                useFlexGap
                            >
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap role="group" aria-label="Filter by priority">
                                    {PRIORITY_FILTERS.map(filter => {
                                        const selected = priority === filter.value;
                                        const color = filter.value === 'must' ? MUST : CYAN;
                                        return (
                                            <Chip
                                                key={filter.value}
                                                label={filter.label}
                                                onClick={() => setPriority(filter.value)}
                                                aria-pressed={selected}
                                                sx={{
                                                    height: TAP,
                                                    px: 0.5,
                                                    borderRadius: TAP / 2,
                                                    fontSize: px(t.small),
                                                    fontWeight: 700,
                                                    color: selected ? '#0b0f14' : 'text.secondary',
                                                    bgcolor: selected ? color : 'rgba(255,255,255,0.05)',
                                                    border: '1px solid',
                                                    borderColor: selected ? 'transparent' : 'rgba(255,255,255,0.14)',
                                                    '&:hover': { bgcolor: selected ? color : 'rgba(255,255,255,0.1)' },
                                                }}
                                            />
                                        );
                                    })}
                                </Stack>
                                <TextField
                                    type="search"
                                    value={query}
                                    onChange={event => setQuery(event.target.value)}
                                    placeholder="Search topics"
                                    sx={{ width: { xs: '100%', sm: 280 }, '& .MuiInputBase-root': { minHeight: TAP } }}
                                    slotProps={{
                                        htmlInput: { 'aria-label': 'Search topics by name, definition or pattern' },
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchRoundedIcon sx={{ color: 'text.secondary' }} />
                                                </InputAdornment>
                                            ),
                                        },
                                    }}
                                />
                            </Stack>

                            {/* ---- PHASES ---- */}
                            <Tabs
                                value={tab}
                                onChange={(_, value: TabValue) => { setChosenTab(value); setExpanded(null); }}
                                variant="scrollable"
                                scrollButtons="auto"
                                allowScrollButtonsMobile
                                sx={{
                                    mb: 3,
                                    borderBottom: 1,
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    '& .MuiTab-root': { minHeight: TAP, textTransform: 'none', fontWeight: 700, fontSize: px(t.small), '&:focus': { outline: 'none' } },
                                }}
                            >
                                {mode === 'revise' && <Tab value="all" label="All phases" />}
                                {sqlPhases.map(p => (
                                    <Tab key={p.id} value={p.number} label={`${p.number} ${p.short} · ${confidentCount(progress, p.topics)}/${p.topics.length}`} />
                                ))}
                            </Tabs>

                            {mode === 'learn' ? (
                                <Box sx={{ pb: 6 }}>
                                    {/* Title and goal */}
                                    <Typography variant="caption" sx={{ color: phase.accent, fontWeight: 800, letterSpacing: 1.2 }}>
                                        PHASE {phase.number}
                                    </Typography>
                                    <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mt: 0.5, mb: 1 }}>
                                        {phase.title}
                                    </Typography>
                                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760 }}>
                                        {phase.goal}
                                    </Typography>

                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2.5, maxWidth: 760 }}>
                                        <LinearProgress
                                            variant="determinate"
                                            value={(phaseConfident / phase.topics.length) * 100}
                                            sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { bgcolor: CONFIDENT } }}
                                        />
                                        <Typography color="text.secondary" sx={{ whiteSpace: 'nowrap', fontSize: px(t.small) }}>
                                            {phaseConfident} of {phase.topics.length} confident
                                        </Typography>
                                    </Stack>

                                    {/* Big picture */}
                                    <Box sx={{ mt: 3, p: 2, borderRadius: 2, maxWidth: 760, bgcolor: `${phase.accent}14`, borderLeft: '3px solid', borderColor: phase.accent }}>
                                        <Typography variant="body1">
                                            <strong style={{ color: phase.accent }}>The big picture.</strong> {phase.bigPicture}
                                        </Typography>
                                    </Box>

                                    {/* Topics */}
                                    <SectionLabel>TOPICS, IN ORDER</SectionLabel>
                                    {phase.topics.some(matches) ? (
                                        <Stack spacing={1.25}>
                                            {phase.topics.map((topic, index) =>
                                                matches(topic) && (
                                                    <TopicCard
                                                        key={topic.id}
                                                        topic={topic}
                                                        number={index + 1}
                                                        accent={phase.accent}
                                                        progress={progress}
                                                        expanded={expanded === topic.id}
                                                        onExpand={open => setExpanded(open ? topic.id : null)}
                                                        onToggleCheck={check => { void toggleCheck(topic.id, check); }}
                                                    />
                                                )
                                            )}
                                        </Stack>
                                    ) : (
                                        noMatches
                                    )}
                                </Box>
                            ) : (
                                <Box sx={{ pb: 6 }}>
                                    {visiblePhases.some(p => p.topics.some(matches)) ? (
                                        visiblePhases.map(p => {
                                            const shown = p.topics.filter(matches);
                                            if (shown.length === 0) return null;
                                            return (
                                                <Box key={p.id} sx={{ mb: 4 }}>
                                                    <Typography variant="caption" sx={{ display: 'block', color: p.accent, fontWeight: 800, letterSpacing: 1.2 }}>
                                                        PHASE {p.number}
                                                    </Typography>
                                                    <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mt: 0.25, mb: 2 }}>
                                                        {p.title}
                                                    </Typography>
                                                    <Stack spacing={2}>
                                                        {shown.map(topic => (
                                                            <ReviseCard key={topic.id} topic={topic} accent={p.accent} onOpen={() => openTopic(topic.id)} />
                                                        ))}
                                                    </Stack>
                                                </Box>
                                            );
                                        })
                                    ) : (
                                        noMatches
                                    )}
                                </Box>
                            )}
                            </>
                        )}
                    </Box>
                </GlossaryProvider>
            </SqlQueriesContext.Provider>
        </LearningPageFrame>
    );
};

export default SqlPage;
