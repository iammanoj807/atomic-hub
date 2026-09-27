import { createContext, useContext, useMemo, useState } from 'react';
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
    ButtonBase,
    Checkbox,
    Link,
    LinearProgress,
    Tooltip,
    Button,
    ToggleButton,
    ToggleButtonGroup,
    ThemeProvider,
    createTheme,
    type Theme,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    foundationPhases,
    allFoundationTopics,
    allMiniBuilds,
    CHECK_KEYS,
    CHECK_LABELS,
    CHECK_MEANINGS,
    CHECK_EXAMPLES,
    CONFIDENT_RULE,
    RESOURCE_KIND_ORDER,
    RESOURCE_KIND_LABELS,
    topicLoop,
    foundationRules,
    type FoundationTopic,
    type FoundationResource,
    type TopicResource,
    type CheckKey,
} from '../data/foundations';
import { useFoundations } from '../hooks/useFoundations';
import {
    checksPassed,
    isTopicConfident,
    confidentCount,
    buildsDone,
    nextTopic,
    topicsInProgress,
} from '../utils/foundationsProgress';
import type { FoundationsProgress } from '../services/firebaseService';

const CONFIDENT = '#66bb6a';
const CYAN = '#4dd0e1';
const MAX_IN_PROGRESS = 8;
/** Every tappable thing on this page is at least this tall, so it works on a phone. */
const TAP = 44;

// ============ TEXT SIZE ============
//
// One table drives every font size on this page. The Typography variants get
// it through a nested theme; the few sizes set directly in sx (chips, code,
// small print) read the same table through TextSizeContext, so nothing on the
// page is sized by hand.

type TextSize = 'normal' | 'large' | 'xl';

interface TextSizes {
    /** Main reading text. */
    body1: number;
    /** Exercise text, resource notes, builds, questions. */
    body2: number;
    /** Sources, hints and other small print. */
    small: number;
    /** Section labels and chips. */
    label: number;
    code: number;
    /** Headings grow by this factor. */
    heading: number;
}

const TEXT_SIZES: Record<TextSize, TextSizes> = {
    normal: { body1: 17.6, body2: 14, small: 13, label: 12, code: 13.6, heading: 1 },
    large: { body1: 19, body2: 17, small: 15, label: 13.5, code: 15, heading: 1.15 },
    xl: { body1: 21, body2: 19, small: 17, label: 15, code: 17, heading: 1.3 },
};

const TEXT_SIZE_LABELS: Record<TextSize, string> = { normal: 'Normal', large: 'Large', xl: 'Extra large' };
const TEXT_SIZE_KEY = 'foundations-text-size';
const DEFAULT_TEXT_SIZE: TextSize = 'large';
const LINE_HEIGHT = 1.7;

const px = (value: number) => `${value / 16}rem`;

const readTextSize = (): TextSize => {
    try {
        const stored = localStorage.getItem(TEXT_SIZE_KEY);
        if (stored === 'normal' || stored === 'large' || stored === 'xl') return stored;
    } catch {
        // Private mode or blocked storage: fall back to the default.
    }
    return DEFAULT_TEXT_SIZE;
};

const writeTextSize = (size: TextSize) => {
    try {
        localStorage.setItem(TEXT_SIZE_KEY, size);
    } catch {
        // Not remembered, but the page still changes size for this visit.
    }
};

const TextSizeContext = createContext<TextSizes>(TEXT_SIZES[DEFAULT_TEXT_SIZE]);
const useTextSize = () => useContext(TextSizeContext);

/** The app theme with this page's text sizes laid over it. */
const pageTheme = (t: TextSizes) => (outer: Theme) =>
    createTheme(outer, {
        typography: {
            body1: { fontSize: px(t.body1), lineHeight: LINE_HEIGHT },
            body2: { fontSize: px(t.body2), lineHeight: LINE_HEIGHT },
            caption: { fontSize: px(t.label), lineHeight: 1.5 },
            button: { fontSize: px(t.small) },
            h3: { fontSize: `${3 * t.heading}rem` },
            h4: { fontSize: `${1.75 * t.heading}rem` },
            h5: { fontSize: `${1.5 * t.heading}rem` },
            h6: { fontSize: `${1.25 * t.heading}rem` },
        },
    });

// ============ SMALL PIECES ============

const phaseIndexOf = (topicId: string) =>
    Math.max(0, foundationPhases.findIndex(phase => phase.topics.some(topic => topic.id === topicId)));

const scrollToId = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const SectionLabel = ({ children, color = 'text.secondary', id }: { children: string; color?: string; id?: string }) => (
    <Typography
        id={id}
        variant="caption"
        sx={{ display: 'block', color, fontWeight: 800, letterSpacing: 1.2, mb: 1.5, mt: 4, scrollMarginTop: 80 }}
    >
        {children}
    </Typography>
);

const Tag = ({ label, color = 'text.secondary', bgcolor = 'rgba(255,255,255,0.06)' }: { label: string; color?: string; bgcolor?: string }) => {
    const t = useTextSize();
    return (
        <Chip
            size="small"
            label={label}
            sx={{ height: 'auto', py: 0.25, fontSize: px(t.label), fontWeight: 700, color, bgcolor }}
        />
    );
};

const PhaseResource = ({ resource, accent }: { resource: FoundationResource; accent: string }) => (
    <Box sx={{ pl: 2, py: 1, borderLeft: '3px solid', borderColor: accent }}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
            {resource.url ? (
                <Link
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontWeight: 700, color: 'text.primary' }}
                >
                    {resource.title} <LaunchRoundedIcon sx={{ fontSize: '1em', color: accent }} />
                </Link>
            ) : (
                <Typography fontWeight={700} color="text.primary">{resource.title}</Typography>
            )}
            <Tag label={resource.kind} />
            {resource.free && <Tag label="Free" color={CONFIDENT} bgcolor={`${CONFIDENT}1f`} />}
            {resource.paid && <Tag label="Paid" />}
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {resource.why}
        </Typography>
    </Box>
);

/**
 * One resource in Step 2. Numbered in the order to use them; papers are not
 * numbered at all, because they are not part of the order yet.
 */
const TopicResourceRow = ({
    resource,
    accent,
    number,
}: {
    resource: TopicResource;
    accent: string;
    /** Null for an optional paper. */
    number: number | null;
}) => {
    const t = useTextSize();
    const optional = number === null;
    return (
        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ opacity: optional ? 0.55 : 1 }}>
            <Typography
                sx={{
                    color: optional ? 'text.secondary' : accent,
                    fontWeight: 800,
                    minWidth: 22,
                    flexShrink: 0,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {optional ? '·' : number}
            </Typography>
            <Box sx={{ minWidth: 0 }}>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.25 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: optional ? 'text.secondary' : accent, fontWeight: 800, letterSpacing: 0.8 }}
                    >
                        {optional ? 'PAPER' : RESOURCE_KIND_LABELS[resource.kind]}
                    </Typography>
                    {number === 1 && <Tag label="Start here" color="#0b0f14" bgcolor={accent} />}
                    {optional && <Tag label="Optional — skip for now" />}
                </Stack>
                {resource.url ? (
                    <Link
                        href={resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'text.primary', fontWeight: 600, fontSize: px(t.body2), textDecorationColor: accent }}
                    >
                        {resource.title}
                    </Link>
                ) : (
                    <Typography component="span" sx={{ color: 'text.primary', fontWeight: 600, fontSize: px(t.body2) }}>
                        {resource.title}
                    </Typography>
                )}
                <Typography component="span" color="text.secondary" sx={{ ml: 1, fontSize: px(t.small) }}>
                    {resource.source}
                </Typography>
            </Box>
        </Stack>
    );
};

/** Four small squares: how many checks this topic has passed, readable at a glance. */
const CheckDots = ({ passed, accent }: { passed: number; accent: string }) => (
    <Stack direction="row" spacing={0.5} aria-label={`${passed} of 4 checks passed`}>
        {CHECK_KEYS.map((key, index) => (
            <Box
                key={key}
                sx={{ width: 9, height: 9, borderRadius: 0.5, bgcolor: index < passed ? accent : 'rgba(255,255,255,0.12)' }}
            />
        ))}
    </Stack>
);

// ============ THE TOPIC CARD ============

const STEPS = [
    { title: 'Read', time: '10 min', label: 'STEP 1 · READ THE NOTE' },
    { title: 'Learn', time: 'about 1 hour', label: 'STEP 2 · LEARN FROM THESE, IN ORDER' },
    { title: 'Practise', time: 'about 1 hour', label: 'STEP 3 · PRACTISE, IN THIS ORDER' },
    { title: 'Prove', time: 'next day, 15–20 min', label: 'STEP 4 · PROVE IT (NEXT DAY)' },
];

/** Derive on paper first, so the code has something to be checked against. */
const PRACTICE_ORDER: { key: CheckKey; hint?: string }[] = [
    { key: 'derive', hint: 'on paper, before any code' },
    { key: 'build' },
    { key: 'break' },
    { key: 'explain' },
];

const stepId = (topicId: string, step: number) => `topic-${topicId}-step-${step}`;

/** The four steps across the top of an open card. Tapping one jumps to it. */
const StepBar = ({ topicId, accent }: { topicId: string; accent: string }) => {
    const t = useTextSize();
    return (
        <Box
            component="nav"
            aria-label="Steps for this topic"
            sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: 'repeat(4, 1fr)' }, gap: 1, mb: 1 }}
        >
            {STEPS.map((step, index) => (
                <ButtonBase
                    key={step.title}
                    onClick={() => scrollToId(stepId(topicId, index + 1))}
                    sx={{
                        minHeight: TAP,
                        p: 1.25,
                        borderRadius: 2,
                        justifyContent: 'flex-start',
                        textAlign: 'left',
                        border: '1px solid rgba(255,255,255,0.1)',
                        bgcolor: 'rgba(255,255,255,0.03)',
                        '&:hover': { borderColor: accent },
                    }}
                >
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                            sx={{
                                width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                                display: 'grid', placeItems: 'center',
                                bgcolor: `${accent}26`, color: accent, fontWeight: 800, fontSize: px(t.small),
                            }}
                        >
                            {index + 1}
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 800, color: 'text.primary', fontSize: px(t.small), lineHeight: 1.3 }}>
                                {step.title}
                            </Typography>
                            <Typography sx={{ color: 'text.secondary', fontSize: px(t.label), lineHeight: 1.3 }}>
                                {step.time}
                            </Typography>
                        </Box>
                    </Stack>
                </ButtonBase>
            ))}
        </Box>
    );
};

const TopicCard = ({
    topic,
    number,
    accent,
    progress,
    expanded,
    onExpand,
    onToggleCheck,
}: {
    topic: FoundationTopic;
    number: number;
    accent: string;
    progress: FoundationsProgress;
    expanded: boolean;
    onExpand: (open: boolean) => void;
    onToggleCheck: (check: CheckKey) => void;
}) => {
    const t = useTextSize();
    const passed = checksPassed(progress, topic.id);
    const confident = isTopicConfident(progress, topic.id);
    const { note, practice } = topic;
    const sorted = [...topic.resources].sort(
        (a, b) => RESOURCE_KIND_ORDER.indexOf(a.kind) - RESOURCE_KIND_ORDER.indexOf(b.kind)
    );
    const core = sorted.filter(resource => resource.kind !== 'paper');
    const papers = sorted.filter(resource => resource.kind === 'paper');

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
            <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ minHeight: TAP }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%', pr: 1 }} flexWrap="wrap" useFlexGap>
                    <Typography sx={{ color: accent, fontWeight: 800, minWidth: 24, fontVariantNumeric: 'tabular-nums' }}>
                        {number}
                    </Typography>
                    <Typography fontWeight={700} color="text.primary" sx={{ flex: 1, minWidth: 160 }}>
                        {topic.name}
                    </Typography>
                    {confident ? (
                        <Tag label="CONFIDENT" color={CONFIDENT} bgcolor={`${CONFIDENT}1f`} />
                    ) : (
                        <CheckDots passed={passed} accent={accent} />
                    )}
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, pb: 3, px: { xs: 2, sm: 3 } }}>
                <StepBar topicId={topic.id} accent={accent} />

                {/* ---- STEP 1 ---- */}
                <SectionLabel color={accent} id={stepId(topic.id, 1)}>{STEPS[0].label}</SectionLabel>
                <Stack spacing={1.5} sx={{ maxWidth: 760 }}>
                    <Typography variant="body1">
                        <strong>The idea.</strong> {note.idea}
                    </Typography>
                    <Typography variant="body1">
                        <strong>Analogy.</strong> {note.analogy}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        <strong>Where the analogy breaks.</strong> {note.breaks}
                    </Typography>
                    {note.example && (
                        <Typography variant="body1">
                            <strong>Example.</strong> {note.example}
                        </Typography>
                    )}
                    {note.code && (
                        <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                            <SyntaxHighlighter
                                language={note.codeLanguage ?? 'python'}
                                style={vscDarkPlus}
                                customStyle={{ margin: 0, padding: '14px 16px', backgroundColor: '#000000', fontSize: px(t.code), lineHeight: 1.55 }}
                            >
                                {note.code}
                            </SyntaxHighlighter>
                        </Box>
                    )}
                </Stack>

                {/* ---- STEP 2 ---- */}
                <SectionLabel color={accent} id={stepId(topic.id, 2)}>{STEPS[1].label}</SectionLabel>
                <Stack spacing={1.75} sx={{ maxWidth: 760 }}>
                    {core.map((resource, index) => (
                        <TopicResourceRow key={`${resource.kind}-${resource.title}`} resource={resource} accent={accent} number={index + 1} />
                    ))}
                    {papers.map(resource => (
                        <TopicResourceRow key={`${resource.kind}-${resource.title}`} resource={resource} accent={accent} number={null} />
                    ))}
                    <Typography color="text.secondary" sx={{ fontStyle: 'italic', pt: 0.5, fontSize: px(t.small) }}>
                        Watch first, then read, then code along. For a full lesson, ask Claude "teach me {topic.name.toLowerCase()}".
                    </Typography>
                </Stack>

                {/* ---- STEP 3 ---- */}
                <SectionLabel color={accent} id={stepId(topic.id, 3)}>{STEPS[2].label}</SectionLabel>
                <Stack spacing={2} sx={{ maxWidth: 760 }}>
                    {PRACTICE_ORDER.map(({ key, hint }, index) => (
                        <Stack key={key} direction="row" spacing={1.5} alignItems="flex-start">
                            <Typography sx={{ color: accent, fontWeight: 800, minWidth: 22, flexShrink: 0 }}>
                                {index + 1}
                            </Typography>
                            <Box sx={{ minWidth: 0 }}>
                                <Typography variant="caption" sx={{ display: 'block', color: accent, fontWeight: 800, letterSpacing: 0.8 }}>
                                    {CHECK_LABELS[key].toUpperCase()}
                                    {hint && (
                                        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0 }}>
                                            {' '}({hint})
                                        </Box>
                                    )}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                    {practice[key]}
                                </Typography>
                            </Box>
                        </Stack>
                    ))}
                    <Box sx={{ pt: 0.5 }}>
                        <Typography color="text.secondary" sx={{ fontStyle: 'italic', fontSize: px(t.small) }}>
                            No answers here, on purpose. Try each one yourself first.
                        </Typography>
                        <Typography color="text.secondary" sx={{ fontStyle: 'italic', fontSize: px(t.small) }}>
                            Then send Claude: "check my answer: {topic.name}".
                        </Typography>
                    </Box>
                </Stack>

                {/* ---- STEP 4 ---- the checks live here, at the end of the work */}
                <SectionLabel color={accent} id={stepId(topic.id, 4)}>{STEPS[3].label}</SectionLabel>
                <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5, maxWidth: 760 }}>
                    Do this the next day with your notes closed. Tick only what you can do from memory.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {CHECK_KEYS.map(key => {
                        const done = progress.checks[topic.id]?.[key] === true;
                        const fill = confident ? CONFIDENT : accent;
                        return (
                            <Tooltip key={key} title={CHECK_MEANINGS[key]} arrow>
                                <Chip
                                    label={CHECK_LABELS[key]}
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
            </AccordionDetails>
        </Accordion>
    );
};

/** A closed-by-default panel for reference material, in the page's own style. */
const ReferencePanel = ({
    title,
    tint,
    border,
    children,
}: {
    title: string;
    tint: string;
    border: string;
    children: React.ReactNode;
}) => (
    <Accordion
        disableGutters
        slotProps={{ transition: { unmountOnExit: true } }}
        sx={{ bgcolor: tint, border: '1px solid', borderColor: border, borderRadius: 3, '&:before': { display: 'none' } }}
    >
        <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ minHeight: TAP }}>
            <Typography fontWeight={700} color="text.primary">{title}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ pt: 0, pb: 2.5, px: { xs: 2, sm: 2.5 } }}>{children}</AccordionDetails>
    </Accordion>
);

// ============ THE PAGE ============

/**
 * ML Foundations: the self-paced roadmap, taken in order.
 *
 * Every topic is worked in four steps: read the note, learn from its
 * resources, practise its exercises, and the next day prove it with the four
 * checks. A topic only counts once all four are ticked, and ticks can come off
 * again — the re-test rule depends on it.
 *
 * Self-paced: no dates, no weeks. The next thing to do is simply the first
 * topic that is not yet confident.
 */
const FoundationsPage = () => {
    const { progress, toggleCheck, toggleBuild } = useFoundations();
    const next = nextTopic(progress);
    const inProgress = topicsInProgress(progress).filter(topic => topic.id !== next?.id);

    const [textSize, setTextSize] = useState<TextSize>(readTextSize);
    const t = TEXT_SIZES[textSize];
    const theme = useMemo(() => pageTheme(t), [t]);
    const changeTextSize = (size: TextSize | null) => {
        if (!size) return;
        setTextSize(size);
        writeTextSize(size);
    };

    // Until a tab is chosen, follow the next topic, so the page opens where the work is.
    const [chosenTab, setChosenTab] = useState<number | null>(null);
    const tab = chosenTab ?? (next ? phaseIndexOf(next.id) : 0);
    const [expanded, setExpanded] = useState<string | null>(null);

    const openTopic = (topicId: string) => {
        setChosenTab(phaseIndexOf(topicId));
        setExpanded(topicId);
        // Wait for the tab to render before scrolling to the card.
        window.setTimeout(() => scrollToId(`topic-${topicId}`), 120);
    };

    const confident = confidentCount(progress, allFoundationTopics);
    const checksDone = allFoundationTopics.reduce((sum, topic) => sum + checksPassed(progress, topic.id), 0);
    const builds = buildsDone(progress, foundationPhases);
    const phase = foundationPhases[tab];
    const phaseConfident = confidentCount(progress, phase.topics);

    const topicChip = (topic: FoundationTopic) => (
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

    return (
        <TextSizeContext.Provider value={t}>
            <ThemeProvider theme={theme}>
                <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto' }}>
                    {/* ---- HEADER ---- */}
                    <Box sx={{ mb: 4 }}>
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                            spacing={2}
                            sx={{ pb: 3, mb: 4, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                        >
                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
                                    ML FOUNDATIONS
                                </Typography>
                                <Typography variant="body1" fontWeight="medium" color="text.primary">
                                    Self-paced · {foundationPhases.length} phases · {allFoundationTopics.length} topics · in order
                                </Typography>
                            </Box>
                            <Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700, letterSpacing: 1 }}>
                                    TEXT SIZE
                                </Typography>
                                <ToggleButtonGroup
                                    exclusive
                                    size="small"
                                    value={textSize}
                                    onChange={(_, value: TextSize | null) => changeTextSize(value)}
                                    aria-label="Text size"
                                >
                                    {(Object.keys(TEXT_SIZE_LABELS) as TextSize[]).map(size => (
                                        <ToggleButton
                                            key={size}
                                            value={size}
                                            sx={{ minHeight: TAP, px: 1.5, textTransform: 'none', fontWeight: 700, '&:focus': { outline: 'none' } }}
                                        >
                                            {TEXT_SIZE_LABELS[size]}
                                        </ToggleButton>
                                    ))}
                                </ToggleButtonGroup>
                            </Box>
                        </Stack>
                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            sx={{ color: 'text.primary', mb: 1, fontSize: { xs: `${2 * t.heading}rem`, sm: `${3 * t.heading}rem` } }}
                        >
                            Learn it, practise it, prove it
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            AI and ML from scratch. Every topic has a plain-English note, its own resources, and one exercise for each check.
                        </Typography>
                    </Box>

                    {/* ---- NEXT UP ---- the first topic in order that is not yet confident */}
                    <Box sx={{ p: 2.5, borderRadius: 3, mb: 3, bgcolor: 'rgba(102,187,106,0.06)', border: '1px solid rgba(102,187,106,0.3)' }}>
                        {next ? (
                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Typography variant="caption" sx={{ display: 'block', color: CONFIDENT, fontWeight: 800, letterSpacing: 1.2 }}>
                                        NEXT UP · PHASE {phaseIndexOf(next.id)}
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

                    {/* ---- STATS ---- */}
                    <Stack direction="row" spacing={4} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
                        {[
                            { value: confident, total: allFoundationTopics.length, label: 'TOPICS CONFIDENT', color: CONFIDENT },
                            { value: checksDone, total: allFoundationTopics.length * CHECK_KEYS.length, label: 'CHECKS PASSED', color: CYAN },
                            { value: builds, total: allMiniBuilds.length, label: 'MINI-BUILDS', color: 'text.primary' },
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

                    {/* ---- HOW TO LEARN A TOPIC ---- said once, and closed once read */}
                    <Box sx={{ mb: 5 }}>
                        <ReferencePanel title="How to learn a topic (read once)" tint="rgba(77,208,225,0.07)" border="rgba(77,208,225,0.25)">
                            <Typography variant="body1" sx={{ color: 'text.primary' }}>
                                {CONFIDENT_RULE}
                            </Typography>
                            <Stack spacing={1.25} sx={{ mt: 2.5 }}>
                                {topicLoop.map((step, index) => (
                                    <Stack key={step.step} direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0.25, sm: 1.5 }} alignItems="baseline">
                                        <Typography variant="caption" sx={{ color: CYAN, fontWeight: 800, letterSpacing: 0.8, minWidth: 110, flexShrink: 0 }}>
                                            STEP {index + 1} · {step.step}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {step.detail}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 3 }}>
                                {CHECK_KEYS.map((key, index) => (
                                    <Box key={key} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                                        <Typography variant="body2" fontWeight={800} color="text.primary">
                                            {index + 1}. {CHECK_LABELS[key]}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                            {CHECK_MEANINGS[key]}
                                        </Typography>
                                        <Typography sx={{ mt: 0.75, fontSize: px(t.small), color: CYAN }}>
                                            e.g. {CHECK_EXAMPLES[key]}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </ReferencePanel>
                    </Box>

                    {/* ---- PHASES ---- */}
                    <Tabs
                        value={tab}
                        onChange={(_, value) => { setChosenTab(value); setExpanded(null); }}
                        variant="scrollable"
                        scrollButtons="auto"
                        allowScrollButtonsMobile
                        sx={{
                            mb: 3,
                            borderBottom: 1,
                            borderColor: 'rgba(255,255,255,0.08)',
                            '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, fontSize: px(t.small), '&:focus': { outline: 'none' } },
                        }}
                    >
                        {foundationPhases.map(p => (
                            <Tab key={p.id} label={`${p.number} ${p.short} · ${confidentCount(progress, p.topics)}/${p.topics.length}`} />
                        ))}
                    </Tabs>

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
                        <Stack spacing={1.25}>
                            {phase.topics.map((topic, index) => (
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
                            ))}
                        </Stack>

                        {/* Mini-builds */}
                        <SectionLabel>MINI-BUILDS</SectionLabel>
                        <Stack spacing={1}>
                            {phase.builds.map(build => {
                                const done = progress.builds[build.id] === true;
                                return (
                                    <Stack
                                        key={build.id}
                                        component="label"
                                        direction="row"
                                        spacing={1}
                                        alignItems="flex-start"
                                        sx={{
                                            p: 1.25, minHeight: TAP, borderRadius: 2, cursor: 'pointer',
                                            border: '1px solid',
                                            borderColor: done ? 'rgba(102,187,106,0.35)' : 'rgba(255,255,255,0.08)',
                                            bgcolor: done ? 'rgba(102,187,106,0.06)' : 'transparent',
                                        }}
                                    >
                                        <Checkbox
                                            checked={done}
                                            onChange={() => { void toggleBuild(build.id); }}
                                            sx={{ p: 0.25, color: 'text.secondary', '&.Mui-checked': { color: CONFIDENT } }}
                                        />
                                        <Typography variant="body2" sx={{ pt: 0.25 }}>
                                            {build.text}
                                        </Typography>
                                    </Stack>
                                );
                            })}
                        </Stack>

                        {/* Ready questions */}
                        <SectionLabel>READY WHEN YOU CAN ANSWER</SectionLabel>
                        <Stack component="ul" spacing={0.75} sx={{ pl: 2.5, m: 0, maxWidth: 760 }}>
                            {phase.ready.map(question => (
                                <Typography key={question} component="li" variant="body2">
                                    {question}
                                </Typography>
                            ))}
                        </Stack>

                        {/* Phase books and courses — reference, not the path */}
                        <Box sx={{ mt: 4 }}>
                            <ReferencePanel
                                key={phase.id}
                                title="Phase books and courses (for reference)"
                                tint="rgba(255,255,255,0.02)"
                                border="rgba(255,255,255,0.08)"
                            >
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 760 }}>
                                    The main courses and books for this whole phase. Each topic above already lists its own exact chapters and videos.
                                </Typography>
                                <SectionLabel>PHASE BACKBONE RESOURCES</SectionLabel>
                                <Stack spacing={1.5}>
                                    {phase.main.map(resource => <PhaseResource key={resource.title} resource={resource} accent={phase.accent} />)}
                                </Stack>
                                {phase.deeper.length > 0 && (
                                    <>
                                        <SectionLabel>GO DEEPER (OPTIONAL)</SectionLabel>
                                        <Stack spacing={1.5}>
                                            {phase.deeper.map(resource => <PhaseResource key={resource.title} resource={resource} accent="rgba(255,255,255,0.15)" />)}
                                        </Stack>
                                    </>
                                )}
                            </ReferencePanel>
                        </Box>

                        {/* Rules */}
                        <SectionLabel>RULES</SectionLabel>
                        <Stack component="ol" spacing={0.75} sx={{ pl: 2.5, m: 0, maxWidth: 760 }}>
                            {foundationRules.map(rule => (
                                <Typography key={rule} component="li" variant="body2" color="text.secondary">
                                    {rule}
                                </Typography>
                            ))}
                        </Stack>
                    </Box>
                </Box>
            </ThemeProvider>
        </TextSizeContext.Provider>
    );
};

export default FoundationsPage;
