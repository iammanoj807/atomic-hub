import { useState, type ReactNode } from 'react';
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
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
    systemDesignPhases,
    allSystemDesignTopics,
    SD_CHECK_KEYS,
    SD_CHECK_LABELS,
    SD_CHECK_MEANINGS,
    SD_CONFIDENT_RULE,
    SD_PRIORITY_LABELS,
    SD_RESOURCE_KIND_ORDER,
    sdHowToStudy,
    type SDTopic,
    type SDDesign,
    type SDPriority,
    type SDCheckKey,
    type SDResourceKind,
} from '../data/systemDesign';
import { useSystemDesign } from '../hooks/useSystemDesign';
import {
    checksPassed,
    isTopicConfident,
    confidentCount,
    nextTopic,
    topicsInProgress,
} from '../utils/systemDesignProgress';
import type { SystemDesignProgress } from '../services/firebaseService';
import {
    CONFIDENT,
    CYAN,
    TAP,
    px,
    scrollToId,
    stepId,
    useTextSize,
    useTextSizeChoice,
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
} from './learning/LearningParts';

const MAX_IN_PROGRESS = 8;
/** "Must know" stands out from the other tags at a glance. */
const MUST = '#ffca28';
/** The marker on common mistakes. */
const WARNING = '#ffa726';
const MUTED_TAG_BG = 'rgba(255,255,255,0.06)';

const KIND_LABELS: Record<SDResourceKind, string> = {
    watch: 'WATCH',
    read: 'READ',
    code: 'CODE',
    paper: 'PAPER · OPTIONAL',
};

const DESIGN_TYPE_LABELS: Record<SDDesign['designType'], string> = { hld: 'HLD', lld: 'LLD', ml: 'AI/ML' };

const STEPS: LearningStep[] = [
    { title: 'Understand', time: 'the main lesson', label: 'STEP 1 · UNDERSTAND IT' },
    { title: 'Go further', time: 'free, optional', label: 'STEP 2 · GO FURTHER (FREE, OPTIONAL)' },
    { title: 'Practise', time: 'four exercises', label: 'STEP 3 · PRACTISE, IN THIS ORDER' },
    { title: 'Prove', time: 'next day', label: 'STEP 4 · INTERVIEW-READY, THEN PROVE IT' },
];

/** Explain first, then draw it from memory, then use it, then defend it. */
const PRACTICE_ORDER: { key: SDCheckKey; hint?: string }[] = [
    { key: 'explain' },
    { key: 'draw', hint: 'on paper, from memory' },
    { key: 'apply' },
    { key: 'tradeoffs' },
];

// ============ MODE AND FILTERS ============

type Mode = 'learn' | 'revise';
type PriorityFilter = 'all' | SDPriority;
/** A phase number, or every phase at once (Revise mode only). */
type TabValue = number | 'all';

const MODE_KEY = 'system-design-mode';

const readMode = (): Mode => {
    try {
        if (localStorage.getItem(MODE_KEY) === 'revise') return 'revise';
    } catch {
        // Blocked storage: start in Learn mode.
    }
    return 'learn';
};

const writeMode = (mode: Mode) => {
    try {
        localStorage.setItem(MODE_KEY, mode);
    } catch {
        // Not remembered, but the switch still works for this visit.
    }
};

const PRIORITY_FILTERS: { value: PriorityFilter; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'must', label: SD_PRIORITY_LABELS.must },
    { value: 'should', label: SD_PRIORITY_LABELS.should },
    { value: 'bonus', label: SD_PRIORITY_LABELS.bonus },
];

const matchesFilters = (topic: SDTopic, priority: PriorityFilter, query: string) => {
    if (priority !== 'all' && topic.priority !== priority) return false;
    const q = query.trim().toLowerCase();
    return !q || topic.name.toLowerCase().includes(q) || topic.definition.toLowerCase().includes(q);
};

const phaseOf = (topicId: string) =>
    systemDesignPhases.find(phase => phase.topics.some(topic => topic.id === topicId)) ?? systemDesignPhases[0];

const mustTopics = allSystemDesignTopics.filter(topic => topic.priority === 'must');

// ============ SMALL PIECES ============

const PriorityTag = ({ priority }: { priority: SDPriority }) =>
    priority === 'must' ? (
        <Tag label={SD_PRIORITY_LABELS.must} color={MUST} bgcolor={`${MUST}1f`} />
    ) : (
        <Tag label={SD_PRIORITY_LABELS[priority]} color={priority === 'bonus' ? 'text.disabled' : 'text.secondary'} bgcolor={MUTED_TAG_BG} />
    );

const TopicTags = ({ topic }: { topic: SDTopic }) => (
    <>
        <PriorityTag priority={topic.priority} />
        {topic.kind === 'design' && <Tag label={DESIGN_TYPE_LABELS[topic.designType]} color={CYAN} bgcolor={`${CYAN}1a`} />}
    </>
);

/** A titled part of the lesson in Step 1. */
const Block = ({ title, children }: { title: string; children: ReactNode }) => (
    <Box>
        <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
            {title}
        </Typography>
        {children}
    </Box>
);

const Bullets = ({
    items,
    marker = 'text.secondary',
    mono = false,
    variant = 'body1',
}: {
    items: string[];
    marker?: string;
    mono?: boolean;
    variant?: 'body1' | 'body2';
}) => {
    const t = useTextSize();
    const fontSize = px(mono ? t.code : t[variant]);
    return (
        <Stack component="ul" spacing={0.75} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {items.map((item, index) => (
                <Stack key={index} component="li" direction="row" spacing={1.25} alignItems="flex-start">
                    {/* Centred on the first line of text, whatever the text size. */}
                    <Box sx={{ fontSize, width: 6, height: 6, borderRadius: '50%', bgcolor: marker, flexShrink: 0, mt: 'calc(0.85em - 3px)' }} />
                    <Typography
                        variant={variant}
                        sx={{
                            minWidth: 0,
                            overflowWrap: 'anywhere',
                            ...(mono && { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace', fontSize, lineHeight: 1.7 }),
                        }}
                    >
                        {item}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
};

/**
 * A numbered list. The evolution steps already start with "Version 1:",
 * "Version 2:" and so on, so those show as V1, V2 instead of being numbered twice.
 */
const NumberedSteps = ({ items, accent, variant = 'body1' }: { items: string[]; accent: string; variant?: 'body1' | 'body2' }) => (
    <Stack component="ol" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0 }}>
        {items.map((item, index) => {
            const version = item.match(/^Version (\d+):\s*/);
            const marker = version ? `V${version[1]}` : `${index + 1}`;
            const text = version ? item.slice(version[0].length) : item;
            return (
                <Stack key={index} component="li" direction="row" spacing={1.5} alignItems="flex-start">
                    <Typography sx={{ color: accent, fontWeight: 800, minWidth: 26, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                        {marker}
                    </Typography>
                    <Typography variant={variant} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        {text}
                    </Typography>
                </Stack>
            );
        })}
    </Stack>
);

const CodeBlock = ({ code, language }: { code: string; language?: string }) => {
    const t = useTextSize();
    return (
        <Box sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <SyntaxHighlighter
                language={language ?? 'python'}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '14px 16px', backgroundColor: '#000000', fontSize: px(t.code), lineHeight: 1.55 }}
            >
                {code}
            </SyntaxHighlighter>
        </Box>
    );
};

const QuoteBox = ({ accent, children }: { accent: string; children: ReactNode }) => (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${accent}14`, borderLeft: '3px solid', borderColor: accent }}>
        {children}
    </Box>
);

/** Each question visible, each answer hidden until asked for, so it can be a self-test. */
const FollowUps = ({ topic, accent }: { topic: SDTopic; accent: string }) => {
    const [shown, setShown] = useState<Set<number>>(() => new Set());
    const toggle = (index: number) =>
        setShown(current => {
            const next = new Set(current);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });

    return (
        <Stack spacing={1.5}>
            {topic.followUps.map((followUp, index) => {
                const open = shown.has(index);
                const answerId = `followup-${topic.id}-${index}`;
                return (
                    <Box key={followUp.q} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {followUp.q}
                        </Typography>
                        <Button
                            size="small"
                            onClick={() => toggle(index)}
                            aria-expanded={open}
                            aria-controls={answerId}
                            sx={{ minHeight: TAP, mt: 0.5, px: 1, textTransform: 'none', fontWeight: 700, color: accent }}
                        >
                            {open ? 'Hide answer' : 'Show answer'}
                        </Button>
                        {open && (
                            <Typography id={answerId} variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {followUp.a}
                            </Typography>
                        )}
                    </Box>
                );
            })}
        </Stack>
    );
};

// ============ STEP 1: THE LESSON ============

const ConceptLesson = ({ topic, accent }: { topic: Extract<SDTopic, { kind: 'concept' }>; accent: string }) => (
    <>
        <Block title="The problem it solves">
            <Typography variant="body1">{topic.problem}</Typography>
        </Block>
        <Block title="The idea">
            <Typography variant="body1">{topic.idea}</Typography>
        </Block>
        <Block title="How it works, step by step">
            <NumberedSteps items={topic.howItWorks} accent={accent} />
        </Block>
        <Block title="Analogy">
            <Typography variant="body1">{topic.analogy}</Typography>
        </Block>
        <Block title="Where the analogy breaks">
            <Typography variant="body1" color="text.secondary">{topic.breaks}</Typography>
        </Block>
        <Block title="Example">
            <Typography variant="body1">{topic.example}</Typography>
        </Block>
        <Block title="Must-know points">
            <Bullets items={topic.keyPoints} marker={accent} />
        </Block>
        <Block title="Common mistakes">
            <Bullets items={topic.mistakes} marker={WARNING} />
        </Block>
        {topic.tradeOffs && topic.tradeOffs.length > 0 && (
            <Block title="Trade-offs">
                <Bullets items={topic.tradeOffs} />
            </Block>
        )}
    </>
);

const DesignLesson = ({ topic, accent }: { topic: SDDesign; accent: string }) => (
    <>
        <Block title="Why interviewers ask this">
            <Typography variant="body1">{topic.problem}</Typography>
        </Block>
        <Block title="Requirements">
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: accent, fontWeight: 800, letterSpacing: 0.8, mb: 0.5 }}>
                        FUNCTIONAL
                    </Typography>
                    <Bullets items={topic.functional} marker={accent} variant="body2" />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="caption" sx={{ display: 'block', color: accent, fontWeight: 800, letterSpacing: 0.8, mb: 0.5 }}>
                        NON-FUNCTIONAL
                    </Typography>
                    <Bullets items={topic.nonFunctional} marker={accent} variant="body2" />
                </Box>
            </Box>
        </Block>
        {topic.estimates && topic.estimates.length > 0 && (
            <Block title="Estimates">
                <Bullets items={topic.estimates} />
            </Block>
        )}
        {topic.api && topic.api.length > 0 && (
            <Block title="API">
                <Bullets items={topic.api} mono />
            </Block>
        )}
        {topic.dataModel && topic.dataModel.length > 0 && (
            <Block title="Data model">
                <Bullets items={topic.dataModel} />
            </Block>
        )}
        {topic.classes && topic.classes.length > 0 && (
            <Block title="Classes">
                <Bullets items={topic.classes} />
            </Block>
        )}
        {topic.patterns && topic.patterns.length > 0 && (
            <Block title="Patterns used">
                <Bullets items={topic.patterns} />
            </Block>
        )}
        <Block title="Start simple, then scale">
            <NumberedSteps items={topic.evolution} accent={accent} />
        </Block>
        <Block title="The design, step by step">
            <NumberedSteps items={topic.design} accent={accent} />
        </Block>
        <Block title="Deep dives">
            <Bullets items={topic.deepDives} marker={accent} />
        </Block>
        <Block title="Common mistakes">
            <Bullets items={topic.mistakes} marker={WARNING} />
        </Block>
    </>
);

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
    topic: SDTopic;
    number: number;
    accent: string;
    progress: SystemDesignProgress;
    expanded: boolean;
    onExpand: (open: boolean) => void;
    onToggleCheck: (check: SDCheckKey) => void;
}) => {
    const t = useTextSize();
    const passed = checksPassed(progress, topic.id);
    const confident = isTopicConfident(progress, topic.id);
    const sorted = [...topic.resources].sort(
        (a, b) => SD_RESOURCE_KIND_ORDER.indexOf(a.kind) - SD_RESOURCE_KIND_ORDER.indexOf(b.kind)
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
                        <CheckDots passed={passed} total={SD_CHECK_KEYS.length} accent={accent} />
                    )}
                </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0, pb: 3, px: { xs: 2, sm: 3 } }}>
                <StepBar topicId={topic.id} accent={accent} steps={STEPS} />

                {/* ---- STEP 1 ---- the main lesson */}
                <SectionLabel color={accent} id={stepId(topic.id, 1)}>{STEPS[0].label}</SectionLabel>
                <Stack spacing={3} sx={{ maxWidth: 760 }}>
                    <QuoteBox accent={accent}>
                        <Typography variant="body1">
                            <strong style={{ color: accent }}>Definition.</strong> {topic.definition}
                        </Typography>
                    </QuoteBox>
                    {topic.kind === 'concept' ? (
                        <ConceptLesson topic={topic} accent={accent} />
                    ) : (
                        <DesignLesson topic={topic} accent={accent} />
                    )}
                    {topic.code && <CodeBlock code={topic.code} language={topic.codeLanguage} />}
                </Stack>

                {/* ---- STEP 2 ---- */}
                <SectionLabel color={accent} id={stepId(topic.id, 2)}>{STEPS[1].label}</SectionLabel>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.75, maxWidth: 760 }}>
                    The notes above are enough on their own. Use these for a second explanation or extra practice.
                </Typography>
                <Stack spacing={1.75} sx={{ maxWidth: 760 }}>
                    {core.map((resource, index) => (
                        <TopicResourceRow key={`${resource.kind}-${resource.title}`} resource={resource} accent={accent} number={index + 1} kindLabels={KIND_LABELS} />
                    ))}
                    {papers.map(resource => (
                        <TopicResourceRow key={`${resource.kind}-${resource.title}`} resource={resource} accent={accent} number={null} kindLabels={KIND_LABELS} />
                    ))}
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
                                    {SD_CHECK_LABELS[key].toUpperCase()}
                                    {hint && (
                                        <Box component="span" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0 }}>
                                            {' '}({hint})
                                        </Box>
                                    )}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                    {topic.practice[key]}
                                </Typography>
                            </Box>
                        </Stack>
                    ))}
                    <Box sx={{ pt: 0.5 }}>
                        <Typography color="text.secondary" sx={{ fontStyle: 'italic', fontSize: px(t.small) }}>
                            No answers here, on purpose. Try first, then send Claude: "check my answer: {topic.name}".
                        </Typography>
                    </Box>
                </Stack>

                {/* ---- STEP 4 ---- say it, test yourself, then tick the checks */}
                <SectionLabel color={accent} id={stepId(topic.id, 4)}>{STEPS[3].label}</SectionLabel>
                <Stack spacing={3} sx={{ maxWidth: 760 }}>
                    <Block title="Your interview answer">
                        <QuoteBox accent={accent}>
                            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>"{topic.interviewAnswer}"</Typography>
                        </QuoteBox>
                        <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: px(t.small) }}>
                            Say this out loud.
                        </Typography>
                    </Block>
                    <Block title="Follow-up questions">
                        <FollowUps topic={topic} accent={accent} />
                    </Block>
                    <Box>
                        <Typography variant="body2" sx={{ color: 'text.primary', mb: 1.5 }}>
                            Do this the next day with your notes closed. Tick only what you can do from memory.
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {SD_CHECK_KEYS.map(key => {
                                const done = progress.checks[topic.id]?.[key] === true;
                                const fill = confident ? CONFIDENT : accent;
                                return (
                                    <Tooltip key={key} title={SD_CHECK_MEANINGS[key]} arrow>
                                        <Chip
                                            label={SD_CHECK_LABELS[key]}
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
            </AccordionDetails>
        </Accordion>
    );
};

// ============ REVISE MODE: THE COMPACT CARD ============

const ReviseCard = ({ topic, accent, onOpen }: { topic: SDTopic; accent: string; onOpen: () => void }) => (
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
            {topic.definition}
        </Typography>

        {topic.kind === 'concept' ? (
            <>
                <SectionLabel color={accent}>MUST-KNOW POINTS</SectionLabel>
                <Bullets items={topic.keyPoints} marker={accent} variant="body2" />
            </>
        ) : (
            <>
                <SectionLabel color={accent}>THE DESIGN, STEP BY STEP</SectionLabel>
                <NumberedSteps items={topic.design} accent={accent} variant="body2" />
                <SectionLabel color={accent}>DEEP DIVES</SectionLabel>
                <Bullets items={topic.deepDives} marker={accent} variant="body2" />
            </>
        )}

        <SectionLabel color={WARNING}>COMMON MISTAKES</SectionLabel>
        <Bullets items={topic.mistakes} marker={WARNING} variant="body2" />

        <SectionLabel color={accent}>INTERVIEW ANSWER</SectionLabel>
        <QuoteBox accent={accent}>
            <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.primary' }}>"{topic.interviewAnswer}"</Typography>
        </QuoteBox>

        <SectionLabel color={accent}>FOLLOW-UP QUESTIONS</SectionLabel>
        <Stack spacing={1.25}>
            {topic.followUps.map(followUp => (
                <Box key={followUp.q}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                        {followUp.q}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {followUp.a}
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
);

// ============ THE PAGE ============

/**
 * System Design: high-level, low-level and AI/ML system design.
 *
 * Learn mode works one topic at a time through the same four steps as ML
 * Foundations: understand the lesson, optionally go further, practise, and
 * prove it the next day with the four checks. Revise mode lays the interview
 * notes out flat for a fast read before an interview.
 */
const SystemDesignPage = () => {
    const { progress, toggleCheck } = useSystemDesign();
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
    const matches = (topic: SDTopic) => matchesFilters(topic, priority, query);

    // Until a tab is chosen, Learn follows the next topic and Revise shows every
    // phase. "All phases" only exists in Revise, so Learn falls back from it.
    const [chosenTab, setChosenTab] = useState<TabValue | null>(null);
    const nextPhase = next ? phaseOf(next.id).number : 0;
    const tab: TabValue =
        mode === 'learn'
            ? (chosenTab === null || chosenTab === 'all' ? nextPhase : chosenTab)
            : (chosenTab ?? 'all');
    const [expanded, setExpanded] = useState<string | null>(null);

    const openTopic = (topicId: string) => {
        const topic = allSystemDesignTopics.find(item => item.id === topicId);
        // A filter that hides the topic would leave nothing to open.
        if (topic && !matches(topic)) {
            setPriority('all');
            setQuery('');
        }
        changeMode('learn');
        setChosenTab(phaseOf(topicId).number);
        setExpanded(topicId);
        // Wait for the tab to render before scrolling to the card.
        window.setTimeout(() => scrollToId(`topic-${topicId}`), 120);
    };

    const clearFilters = () => {
        setPriority('all');
        setQuery('');
    };

    const confident = confidentCount(progress, allSystemDesignTopics);
    const checksDone = allSystemDesignTopics.reduce((sum, topic) => sum + checksPassed(progress, topic.id), 0);
    const mustConfident = confidentCount(progress, mustTopics);

    const visiblePhases = tab === 'all' ? systemDesignPhases : systemDesignPhases.filter(phase => phase.number === tab);
    const phase = visiblePhases[0];
    const phaseConfident = confidentCount(progress, phase.topics);

    const topicChip = (topic: SDTopic) => (
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
                                SYSTEM DESIGN
                            </Typography>
                            <Typography variant="body1" fontWeight="medium" color="text.primary">
                                Self-paced · {systemDesignPhases.length} phases · {allSystemDesignTopics.length} topics
                            </Typography>
                        </Box>
                        <TextSizeControl value={textSize} onChange={changeTextSize} />
                    </Stack>
                    <Typography
                        variant="h2"
                        fontWeight="bold"
                        sx={{ color: 'text.primary', mb: 1, fontSize: { xs: `${2 * t.heading}rem`, sm: `${3 * t.heading}rem` } }}
                    >
                        Design it, explain it, defend it
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        High-level design, low-level design and AI/ML system design — from the basics to interview-ready.
                    </Typography>
                </Box>

                {/* ---- MODE ---- */}
                <ToggleButtonGroup
                    exclusive
                    value={mode}
                    onChange={(_, value: Mode | null) => changeMode(value)}
                    aria-label="Mode"
                    sx={{ mb: 3 }}
                >
                    {(['learn', 'revise'] as Mode[]).map(value => (
                        <ToggleButton
                            key={value}
                            value={value}
                            sx={{ minHeight: TAP, px: 3, textTransform: 'none', fontWeight: 700, '&:focus': { outline: 'none' } }}
                        >
                            {value === 'learn' ? 'Learn' : 'Revise'}
                        </ToggleButton>
                    ))}
                </ToggleButtonGroup>

                {/* ---- STATS ---- */}
                <Stack direction="row" spacing={4} sx={{ mb: 3 }} flexWrap="wrap" useFlexGap>
                    {[
                        { value: confident, total: allSystemDesignTopics.length, label: 'TOPICS CONFIDENT', color: CONFIDENT },
                        { value: checksDone, total: allSystemDesignTopics.length * SD_CHECK_KEYS.length, label: 'CHECKS PASSED', color: CYAN },
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

                {/* ---- HOW TO STUDY ---- said once, and closed once read */}
                <Box sx={{ mb: 3 }}>
                    <ReferencePanel title="How to study system design (read once)" tint="rgba(77,208,225,0.07)" border="rgba(77,208,225,0.25)">
                        <Stack component="ol" spacing={1} sx={{ pl: 2.5, m: 0 }}>
                            {sdHowToStudy.map(line => (
                                <Typography key={line} component="li" variant="body2" sx={{ color: 'text.primary' }}>
                                    {line}
                                </Typography>
                            ))}
                        </Stack>
                        <Typography variant="body1" sx={{ color: 'text.primary', mt: 2.5 }}>
                            {SD_CONFIDENT_RULE}
                        </Typography>
                        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 2.5 }}>
                            {SD_CHECK_KEYS.map((key, index) => (
                                <Box key={key} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)' }}>
                                    <Typography variant="body2" fontWeight={800} color="text.primary">
                                        {index + 1}. {SD_CHECK_LABELS[key]}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                        {SD_CHECK_MEANINGS[key]}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </ReferencePanel>
                </Box>

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
                            htmlInput: { 'aria-label': 'Search topics by name or definition' },
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
                    {systemDesignPhases.map(p => (
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
            </Box>
        </LearningPageFrame>
    );
};

export default SystemDesignPage;
