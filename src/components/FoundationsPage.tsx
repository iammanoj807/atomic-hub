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
    Checkbox,
    Link,
    LinearProgress,
    Tooltip,
    Button,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
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
import { foundationsGlossary } from '../utils/foundationsGlossary';
import { CONFIDENT, CYAN, TAP, px, scrollToIdWhenSettled, stepId, useTextSize, useTextSizeChoice } from './learning/learning';
import {
    LearningPageFrame,
    TextSizeControl,
    SectionLabel,
    Tag,
    TopicResourceRow,
    CheckDots,
    StepBar,
    ReferencePanel,
} from './learning/LearningParts';
import { GlossaryProvider, GlossaryTopic, NewWordsBox, ProseText } from './learning/GlossaryText';
import { GlossaryDrawer } from './learning/GlossaryDrawer';
import { MermaidDiagram } from './learning/MermaidDiagram';
import { segmentSections } from './learning/glossaryContext';

const MAX_IN_PROGRESS = 8;

// ============ SMALL PIECES ============

const phaseIndexOf = (topicId: string) =>
    Math.max(0, foundationPhases.findIndex(phase => phase.topics.some(topic => topic.id === topicId)));

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

type Section = 'idea' | 'analogy' | 'breaks' | 'example' | 'practice';

/**
 * The card's prose in the order it is shown, so only the first mention of each
 * word is underlined. Code, names, labels and resource titles are left out.
 */
const cardSections = (topic: FoundationTopic): [Section, string[]][] => [
    ['idea', [topic.note.idea]],
    ['analogy', [topic.note.analogy]],
    ['breaks', [topic.note.breaks]],
    ['example', topic.note.example ? [topic.note.example] : []],
    ['practice', PRACTICE_ORDER.map(({ key }) => topic.practice[key])],
];

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
    const { note } = topic;
    const sorted = [...topic.resources].sort(
        (a, b) => RESOURCE_KIND_ORDER.indexOf(a.kind) - RESOURCE_KIND_ORDER.indexOf(b.kind)
    );
    const core = sorted.filter(resource => resource.kind !== 'paper');
    const papers = sorted.filter(resource => resource.kind === 'paper');
    const marked = useMemo(() => segmentSections(foundationsGlossary, cardSections(topic)), [topic]);

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
                        <CheckDots passed={passed} total={CHECK_KEYS.length} accent={accent} />
                    )}
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, pb: 3, px: { xs: 2, sm: 3 } }}>
                <GlossaryTopic topicId={topic.id}>
                    <StepBar topicId={topic.id} accent={accent} steps={STEPS} />

                    {/* ---- STEP 1 ---- */}
                    <SectionLabel color={accent} id={stepId(topic.id, 1)}>{STEPS[0].label}</SectionLabel>
                    <Stack spacing={1.5} sx={{ maxWidth: 760 }}>
                        <NewWordsBox topicId={topic.id} accent={accent} />
                        <Typography variant="body1">
                            <strong>The idea.</strong> <ProseText value={marked('idea')[0]} />
                        </Typography>
                        <Box sx={{ py: 1 }}>
                            <Typography variant="body1" sx={{ mb: 1 }}>
                                <strong>Picture it.</strong>
                            </Typography>
                            <MermaidDiagram code={topic.diagram.code} caption={topic.diagram.caption} title={topic.name} />
                        </Box>
                        <Typography variant="body1">
                            <strong>Analogy.</strong> <ProseText value={marked('analogy')[0]} />
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            <strong>Where the analogy breaks.</strong> <ProseText value={marked('breaks')[0]} />
                        </Typography>
                        {note.example && (
                            <Typography variant="body1">
                                <strong>Example.</strong> <ProseText value={marked('example')[0]} />
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
                            <TopicResourceRow key={`${resource.kind}-${resource.title}`} resource={resource} accent={accent} number={index + 1} kindLabels={RESOURCE_KIND_LABELS} />
                        ))}
                        {papers.map(resource => (
                            <TopicResourceRow key={`${resource.kind}-${resource.title}`} resource={resource} accent={accent} number={null} kindLabels={RESOURCE_KIND_LABELS} />
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
                                        <ProseText value={marked('practice')[index]} />
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
                </GlossaryTopic>
            </AccordionDetails>
        </Accordion>
    );
};

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

    const { textSize, t, theme, changeTextSize } = useTextSizeChoice();

    // Until a tab is chosen, follow the next topic, so the page opens where the work is.
    const [chosenTab, setChosenTab] = useState<number | null>(null);
    const tab = chosenTab ?? (next ? phaseIndexOf(next.id) : 0);
    const [expanded, setExpanded] = useState<string | null>(null);
    const [glossaryOpen, setGlossaryOpen] = useState(false);

    const openTopic = (topicId: string) => {
        setChosenTab(phaseIndexOf(topicId));
        setExpanded(topicId);
        // Wait for the tab to render, and any card above to finish closing, before scrolling.
        window.setTimeout(() => scrollToIdWhenSettled(`topic-${topicId}`), 120);
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
        <LearningPageFrame t={t} theme={theme}>
            <GlossaryProvider source={foundationsGlossary} openTopic={openTopic}>
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
                            <Stack direction="row" spacing={1.5} alignItems="flex-end" flexWrap="wrap" useFlexGap>
                                <TextSizeControl value={textSize} onChange={changeTextSize} />
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
                        </Stack>
                        <GlossaryDrawer open={glossaryOpen} onClose={() => setGlossaryOpen(false)} onOpenTopic={openTopic} />
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
            </GlossaryProvider>
        </LearningPageFrame>
    );
};

export default FoundationsPage;
