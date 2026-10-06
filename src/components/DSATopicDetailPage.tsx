import { useState, type ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Chip,
    IconButton,
    Tooltip,
    Button,
    Checkbox,
    Link,
    Tabs,
    Tab,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { getTopicContent, type DSAProblemItem } from '../data/dsaContent';
import { dsaCurriculum, type DSAProblem } from '../data/dsaCurriculum';
import { getPatternGuide, type TracedExample } from '../data/dsaPatterns';
import { dsaProblemCards } from '../data/dsaProblemCards';
import { mergedMistakes } from '../data/dsaMistakeOverlaps';
import { toggleDSAProblemCompletion } from '../services/firebaseService';
import { useDSAProgress } from '../hooks/useDSAProgress';
import { useTaskContext } from '../context/TaskContext';
import { CONFIDENT, CYAN, TAP, px, stepId, useTextSize, useTextSizeChoice, type LearningStep } from './learning/learning';
import { LearningPageFrame, TextSizeControl, SectionLabel, StepBar, ReferencePanel } from './learning/LearningParts';
import { MermaidDiagram } from './learning/MermaidDiagram';

/** The 3-second gut check stands out from everything else on the page. */
const GUT_CHECK = '#ffca28';
/** The marker on common mistakes. */
const WARNING = '#ffa726';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const DIFFICULTY_COLOURS: Record<'Easy' | 'Medium' | 'Hard', string> = { Easy: '#43a047', Medium: '#ffa726', Hard: '#ef5350' };

const topics = dsaCurriculum.flatMap(phase => phase.sections.flatMap(section => section.topics));

// ============ SMALL PIECES ============

/** A titled part of a step. */
const Block = ({ title, children }: { title: string; children: ReactNode }) => (
    <Box>
        <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
            {title}
        </Typography>
        {children}
    </Box>
);

const Bullets = ({ items, marker = 'text.secondary', variant = 'body1' }: { items: string[]; marker?: string; variant?: 'body1' | 'body2' }) => {
    const t = useTextSize();
    return (
        <Stack component="ul" spacing={0.75} sx={{ listStyle: 'none', p: 0, m: 0 }}>
            {items.map(item => (
                <Stack key={item} component="li" direction="row" spacing={1.25} alignItems="flex-start">
                    {/* Centred on the first line of text, whatever the text size. */}
                    <Box sx={{ fontSize: px(t[variant]), width: 6, height: 6, borderRadius: '50%', bgcolor: marker, flexShrink: 0, mt: 'calc(0.85em - 3px)' }} />
                    <Typography variant={variant} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                        {item}
                    </Typography>
                </Stack>
            ))}
        </Stack>
    );
};

const Highlight = ({ colour, children }: { colour: string; children: ReactNode }) => (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${colour}14`, borderLeft: '3px solid', borderColor: colour }}>
        {children}
    </Box>
);

/** Code with a copy button that copies exactly what is shown. */
const CodeBlock = ({ code, language }: { code: string; language: 'python' | 'java' }) => {
    const t = useTextSize();
    const [copied, setCopied] = useState(false);
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy code:', error);
        }
    };
    return (
        <Box sx={{ position: 'relative', borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Tooltip title={copied ? 'Copied' : 'Copy code'} placement="left">
                <IconButton
                    onClick={copy}
                    aria-label={copied ? 'Copied' : 'Copy code'}
                    sx={{
                        position: 'absolute',
                        top: 4,
                        right: 4,
                        zIndex: 1,
                        width: TAP,
                        height: TAP,
                        color: copied ? CONFIDENT : 'text.secondary',
                        bgcolor: 'rgba(0,0,0,0.6)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' },
                    }}
                >
                    {copied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                </IconButton>
            </Tooltip>
            <SyntaxHighlighter
                language={language}
                style={vscDarkPlus}
                customStyle={{ margin: 0, padding: '14px 16px', paddingRight: 56, backgroundColor: '#000000', fontSize: px(t.code), lineHeight: 1.55 }}
            >
                {code}
            </SyntaxHighlighter>
        </Box>
    );
};

/** One traced example: the input, every step as a table row, the result and what to notice. */
const Trace = ({ label, example, fallbackCode }: { label: string; example: TracedExample; fallbackCode: string }) => {
    const t = useTextSize();
    const [showCode, setShowCode] = useState(false);
    const cell = { px: 1.5, py: 1, textAlign: 'left' as const, whiteSpace: 'nowrap' as const, borderBottom: '1px solid rgba(255,255,255,0.06)' };
    return (
        <Box>
            <Typography variant="caption" sx={{ display: 'block', color: CYAN, fontWeight: 800, letterSpacing: 1.2 }}>
                {label}
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.3, mb: 1 }}>
                {example.title}
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: MONO, fontSize: px(t.code), color: 'text.primary', mb: 1.5, overflowWrap: 'anywhere' }}>
                {example.input}
            </Typography>

            {/* Long rows scroll sideways in here, never the page. */}
            <Box sx={{ overflowX: 'auto', overscrollBehaviorX: 'contain', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)', bgcolor: 'rgba(0,0,0,0.25)' }}>
                <Box
                    component="table"
                    aria-label={`Trace: ${example.title}`}
                    sx={{ borderCollapse: 'collapse', minWidth: '100%', fontFamily: MONO, fontSize: px(t.code), color: 'text.primary' }}
                >
                    <thead>
                        <tr>
                            {example.columns.map(column => (
                                <Box key={column} component="th" scope="col" sx={{ ...cell, color: CYAN, fontWeight: 800, bgcolor: 'rgba(77,208,225,0.06)' }}>
                                    {column}
                                </Box>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {example.rows.map((row, index) => (
                            <Box component="tr" key={index} sx={{ bgcolor: index % 2 ? 'rgba(255,255,255,0.02)' : 'transparent' }}>
                                {row.map((value, column) => (
                                    <Box key={column} component="td" sx={cell}>
                                        {value}
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </tbody>
                </Box>
            </Box>

            <Typography variant="body2" sx={{ mt: 1.5, fontFamily: MONO, fontSize: px(t.code), color: CONFIDENT, overflowWrap: 'anywhere' }}>
                Result: {example.result}
            </Typography>
            <Box sx={{ mt: 1.5 }}>
                <Highlight colour={CYAN}>
                    <Typography variant="body1">
                        <strong style={{ color: CYAN }}>Notice.</strong> {example.insight}
                    </Typography>
                </Highlight>
            </Box>
            <Button
                size="small"
                onClick={() => setShowCode(value => !value)}
                aria-expanded={showCode}
                sx={{ minHeight: TAP, mt: 1, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: CYAN }}
            >
                {showCode ? 'Hide the code' : 'Show the code'}
            </Button>
            {showCode && <CodeBlock code={example.code ?? fallbackCode} language="python" />}
        </Box>
    );
};

/** One practice problem: its solved tick, a link to LeetCode, and its recognition card behind a button. */
const ProblemRow = ({
    problem,
    leetcodeNum,
    solved,
    canTick,
    onToggle,
}: {
    problem: DSAProblem;
    leetcodeNum?: number;
    solved: boolean;
    canTick: boolean;
    onToggle: () => void;
}) => {
    const [showWhy, setShowWhy] = useState(false);
    const card = dsaProblemCards[problem.id];
    const cardId = `why-${problem.id}`;
    return (
        <Box sx={{ py: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <Stack direction="row" spacing={1} alignItems="flex-start">
                <Tooltip title={canTick ? (solved ? 'Solved' : 'Mark as solved') : 'Unlock to toggle'}>
                    <span>
                        <Checkbox
                            checked={solved}
                            onChange={onToggle}
                            disabled={!canTick}
                            slotProps={{ input: { 'aria-label': `Solved: ${problem.title}` } }}
                            icon={<CheckCircleOutlineRoundedIcon />}
                            checkedIcon={<CheckCircleRoundedIcon sx={{ color: '#4caf50' }} />}
                            sx={{ width: TAP, height: TAP, color: 'rgba(255,255,255,0.25)', '&.Mui-checked': { color: '#4caf50' } }}
                        />
                    </span>
                </Tooltip>
                <Box sx={{ minWidth: 0, flex: 1, pt: 1.1 }}>
                    <Link
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: solved ? 'text.secondary' : 'text.primary', fontWeight: 600, textDecorationColor: 'rgba(255,255,255,0.3)', overflowWrap: 'anywhere' }}
                    >
                        {problem.title}
                        <OpenInNewRoundedIcon sx={{ fontSize: '0.85em', ml: 0.5, opacity: 0.5, verticalAlign: 'middle' }} />
                    </Link>
                    {leetcodeNum && (
                        <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                            #{leetcodeNum}
                        </Typography>
                    )}
                    {card && (
                        <Box>
                            <Button
                                size="small"
                                onClick={() => setShowWhy(value => !value)}
                                aria-expanded={showWhy}
                                aria-controls={cardId}
                                sx={{ minHeight: TAP, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: CYAN }}
                            >
                                {showWhy ? 'Hide' : 'Why this pattern?'}
                            </Button>
                            {showWhy && (
                                <Box id={cardId} sx={{ mt: 0.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <Stack spacing={0.75}>
                                        {[
                                            { label: 'TECHNIQUE', text: card.technique },
                                            { label: 'THE CLUE', text: card.clue },
                                            { label: 'THE TRICK', text: card.trick },
                                        ].map(line => (
                                            <Box key={line.label}>
                                                <Typography variant="caption" sx={{ display: 'block', color: CYAN, fontWeight: 800, letterSpacing: 1 }}>
                                                    {line.label}
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                                    {line.text}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Box>
                    )}
                </Box>
            </Stack>
        </Box>
    );
};

// ============ THE PAGE ============

/**
 * One NeetCode topic, taught for recognition: understand the idea, learn the
 * words that signal it, adapt the template, watch it run, then practise.
 */
const DSATopicDetailPage = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const { isAdmin } = useTaskContext();
    const { progress } = useDSAProgress();
    const { textSize, t, theme, changeTextSize } = useTextSizeChoice();
    const [language, setLanguage] = useState<'python' | 'java'>('python');

    const content = topicId ? getTopicContent(topicId) : undefined;
    const guide = topicId ? getPatternGuide(topicId) : undefined;
    const topic = topics.find(item => item.id === topicId);

    if (!topicId || !content || !guide || !topic) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">Topic not found</Typography>
                <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate('/dsa')} sx={{ mt: 2, minHeight: TAP, textTransform: 'none' }}>
                    Back to the DSA hub
                </Button>
            </Box>
        );
    }

    const solved = progress[topicId]?.completedProblems ?? [];
    const toggleSolved = (problemId: string) => {
        if (!isAdmin) return;
        void toggleDSAProblemCompletion(topicId, problemId, solved);
    };

    // The topic's problems by difficulty. The notes and the curriculum list the
    // same problems by title; the curriculum has the ids that progress is saved under.
    const byTitle = new Map(topic.problems.map(problem => [problem.title, problem]));
    const groups = (['Easy', 'Medium', 'Hard'] as const)
        .map(difficulty => ({
            difficulty,
            problems: (content.practiceProblems[difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'] ?? [])
                .map((item: DSAProblemItem) => ({ item, problem: byTitle.get(item.title) }))
                .filter((entry): entry is { item: DSAProblemItem; problem: DSAProblem } => entry.problem !== undefined),
        }))
        .filter(group => group.problems.length > 0);
    const listed = new Set(groups.flatMap(group => group.problems.map(entry => entry.problem.id)));
    const unlisted = topic.problems.filter(problem => !listed.has(problem.id));

    const mistakes = mergedMistakes(topicId, guide.mistakes, content.commonMistakes ?? []);

    const hasJava = Boolean(content.codeTemplate);
    const shownLanguage = hasJava ? language : 'python';
    const steps: LearningStep[] = [
        { title: 'Understand', time: 'the idea, in a picture', label: 'STEP 1 · UNDERSTAND IT' },
        { title: 'Recognise', time: 'spot it in a question', label: 'STEP 2 · RECOGNISE IT' },
        { title: 'Template', time: 'the code to adapt', label: 'STEP 3 · THE TEMPLATE' },
        { title: 'Watch it run', time: 'two traced examples', label: 'STEP 4 · WATCH IT RUN' },
        { title: 'Practise', time: `${topic.problems.length} problems`, label: 'STEP 5 · PRACTISE' },
    ];
    const solvedHere = topic.problems.filter(problem => solved.includes(problem.id)).length;

    return (
        <LearningPageFrame t={t} theme={theme}>
            <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto', minWidth: 0, pb: 6 }}>
                {/* ---- HEADER ---- */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                    sx={{ pb: 2.5, mb: 3, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate('/dsa')}
                        sx={{ minHeight: TAP, px: 1.5, ml: -1, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                    >
                        DSA hub
                    </Button>
                    <TextSizeControl value={textSize} onChange={changeTextSize} />
                </Stack>

                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
                    NEETCODE 150 · TOPIC {topic.number} · {solvedHere} OF {topic.problems.length} SOLVED
                </Typography>
                <Typography
                    variant="h2"
                    fontWeight="bold"
                    sx={{ color: 'text.primary', mb: 2.5, overflowWrap: 'anywhere', fontSize: { xs: `${2 * t.heading}rem`, sm: `${3 * t.heading}rem` } }}
                >
                    {content.title}
                </Typography>

                {/* ---- REMEMBER IT ---- */}
                <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, mb: 3, bgcolor: `${CYAN}14`, border: '1px solid', borderColor: `${CYAN}55` }}>
                    <Typography variant="caption" sx={{ display: 'block', color: CYAN, fontWeight: 800, letterSpacing: 1.2, mb: 0.5 }}>
                        REMEMBER IT
                    </Typography>
                    <Typography sx={{ color: 'text.primary', fontWeight: 700, fontSize: px(t.body1 * 1.2), lineHeight: 1.45 }}>
                        {guide.hook}
                    </Typography>
                </Box>

                <StepBar topicId={topicId} accent={CYAN} steps={steps} />

                {/* ---- STEP 1 ---- */}
                <SectionLabel color={CYAN} id={stepId(topicId, 1)}>{steps[0].label}</SectionLabel>
                <Stack spacing={3} sx={{ maxWidth: 760 }}>
                    <Block title="The idea">
                        <Typography variant="body1">{guide.idea}</Typography>
                    </Block>
                    <Block title="Picture it">
                        <MermaidDiagram code={guide.diagram.code} caption={guide.diagram.caption} title={content.title} />
                    </Block>
                    <Block title="Analogy">
                        <Typography variant="body1">{guide.analogy}</Typography>
                    </Block>
                    <Block title="Where the analogy breaks">
                        <Typography variant="body1" color="text.secondary">{guide.breaks}</Typography>
                    </Block>
                    <ReferencePanel title="More detail" tint="rgba(255,255,255,0.02)" border="rgba(255,255,255,0.08)">
                        <Stack spacing={2.5}>
                            {content.whatItIs && (
                                <Block title="What it is">
                                    <Typography variant="body1">{content.whatItIs}</Typography>
                                </Block>
                            )}
                            {content.whenToUse && content.whenToUse.length > 0 && (
                                <Block title="When to use it">
                                    <Bullets items={content.whenToUse} marker={CONFIDENT} />
                                </Block>
                            )}
                            {content.howItWorks && (
                                <Block title="How it works">
                                    <Typography variant="body1">{content.howItWorks}</Typography>
                                </Block>
                            )}
                            {content.exampleWalkthrough && (
                                <Block title="Example walkthrough">
                                    <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <Typography variant="body2" sx={{ fontFamily: MONO, fontSize: px(t.code), color: CYAN, mb: 1.5, overflowWrap: 'anywhere' }}>
                                            Input: {content.exampleWalkthrough.input}
                                        </Typography>
                                        <Stack component="ol" spacing={1} sx={{ pl: 2.5, m: 0 }}>
                                            {content.exampleWalkthrough.steps.map(step => (
                                                <Typography key={step} component="li" variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                                                    {step}
                                                </Typography>
                                            ))}
                                        </Stack>
                                        <Typography variant="body2" sx={{ fontFamily: MONO, fontSize: px(t.code), color: CONFIDENT, mt: 1.5, overflowWrap: 'anywhere' }}>
                                            Result: {content.exampleWalkthrough.result}
                                        </Typography>
                                    </Box>
                                </Block>
                            )}
                            {content.relatedPatterns && content.relatedPatterns.length > 0 && (
                                <Block title="Related patterns">
                                    <Stack spacing={1.25}>
                                        {content.relatedPatterns.map(related => (
                                            <Box key={related.pattern}>
                                                <Typography variant="body2" fontWeight={800} color="text.primary">{related.pattern}</Typography>
                                                <Typography variant="body2" color="text.secondary">{related.description}</Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Block>
                            )}
                        </Stack>
                    </ReferencePanel>
                </Stack>

                {/* ---- STEP 2 ---- */}
                <SectionLabel color={CYAN} id={stepId(topicId, 2)}>{steps[1].label}</SectionLabel>
                <Stack spacing={3} sx={{ maxWidth: 760 }}>
                    <Block title="Words that signal it">
                        <Bullets items={guide.signals} marker={CYAN} />
                    </Block>
                    <Block title="Don't confuse it with">
                        <Stack spacing={1.25}>
                            {guide.lookAlikes.map(lookAlike => (
                                <Box key={lookAlike.pattern} sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                    <Typography variant="body1" fontWeight={800} color="text.primary">{lookAlike.pattern}</Typography>
                                    <Typography variant="body2" color="text.secondary">{lookAlike.clue}</Typography>
                                </Box>
                            ))}
                        </Stack>
                    </Block>
                    <Highlight colour={GUT_CHECK}>
                        <Typography variant="caption" sx={{ display: 'block', color: GUT_CHECK, fontWeight: 800, letterSpacing: 1.2, mb: 0.5 }}>
                            3-SECOND GUT CHECK
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 700 }}>
                            {guide.gutCheck}
                        </Typography>
                    </Highlight>
                    {content.interviewTips?.howToRecognize && (
                        <Block title="How to recognise it (interview tip)">
                            <Typography variant="body1" color="text.secondary">{content.interviewTips.howToRecognize}</Typography>
                        </Block>
                    )}
                </Stack>

                {/* ---- STEP 3 ---- */}
                <SectionLabel color={CYAN} id={stepId(topicId, 3)}>{steps[2].label}</SectionLabel>
                <Stack spacing={3} sx={{ maxWidth: 760 }}>
                    <Box>
                        {hasJava && (
                            <Tabs
                                value={shownLanguage}
                                onChange={(_, value: 'python' | 'java') => setLanguage(value)}
                                aria-label="Template language"
                                sx={{ mb: 1, minHeight: TAP, '& .MuiTab-root': { minHeight: TAP, textTransform: 'none', fontWeight: 700, fontSize: px(t.small) } }}
                            >
                                <Tab value="python" label="Python" />
                                <Tab value="java" label="Java" />
                            </Tabs>
                        )}
                        <CodeBlock
                            key={shownLanguage}
                            code={shownLanguage === 'java' ? content.codeTemplate ?? '' : guide.template}
                            language={shownLanguage}
                        />
                    </Box>
                    {guide.extraTemplate && (
                        <Block title={guide.extraTemplate.title}>
                            <CodeBlock code={guide.extraTemplate.code} language="python" />
                        </Block>
                    )}
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                        {[
                            { label: 'TIME', value: guide.time },
                            { label: 'SPACE', value: guide.space },
                        ].map(item => (
                            <Box key={item.label} sx={{ p: 1.75, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                <Typography variant="caption" sx={{ display: 'block', color: CYAN, fontWeight: 800, letterSpacing: 1.2 }}>
                                    {item.label}
                                </Typography>
                                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                    {item.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                    <Block title="Common mistakes">
                        <Bullets items={mistakes} marker={WARNING} />
                    </Block>
                </Stack>

                {/* ---- STEP 4 ---- */}
                <SectionLabel color={CYAN} id={stepId(topicId, 4)}>{steps[3].label}</SectionLabel>
                <Stack spacing={4} sx={{ maxWidth: 760 }}>
                    <Trace label="EASY EXAMPLE" example={guide.easy} fallbackCode={guide.template} />
                    <Trace label="MEDIUM EXAMPLE" example={guide.medium} fallbackCode={guide.template} />
                </Stack>

                {/* ---- STEP 5 ---- */}
                <SectionLabel color={CYAN} id={stepId(topicId, 5)}>{steps[4].label}</SectionLabel>
                <Box sx={{ maxWidth: 760 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Before you open "Why this pattern?", name the pattern yourself and say what in the question gave it away.
                    </Typography>
                    <Stack spacing={2.5}>
                        {groups.map(group => (
                            <Box key={group.difficulty}>
                                <Chip
                                    label={group.difficulty}
                                    size="small"
                                    sx={{ mb: 0.5, fontWeight: 800, color: DIFFICULTY_COLOURS[group.difficulty], bgcolor: `${DIFFICULTY_COLOURS[group.difficulty]}1f` }}
                                />
                                {group.problems.map(({ item, problem }) => (
                                    <ProblemRow
                                        key={problem.id}
                                        problem={problem}
                                        leetcodeNum={item.leetcodeNum}
                                        solved={solved.includes(problem.id)}
                                        canTick={isAdmin}
                                        onToggle={() => toggleSolved(problem.id)}
                                    />
                                ))}
                            </Box>
                        ))}
                        {unlisted.length > 0 && (
                            <Box>
                                {unlisted.map(problem => (
                                    <ProblemRow
                                        key={problem.id}
                                        problem={problem}
                                        solved={solved.includes(problem.id)}
                                        canTick={isAdmin}
                                        onToggle={() => toggleSolved(problem.id)}
                                    />
                                ))}
                            </Box>
                        )}
                    </Stack>

                    {content.interviewTips && (
                        <Stack spacing={2.5} sx={{ mt: 4 }}>
                            <Block title="What to say in the interview">
                                <Highlight colour={CYAN}>
                                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>{content.interviewTips.whatToSay}</Typography>
                                </Highlight>
                            </Block>
                            <Block title="Follow-up prep">
                                <Typography variant="body1" color="text.secondary">{content.interviewTips.followUpPrep}</Typography>
                            </Block>
                        </Stack>
                    )}
                </Box>
            </Box>
        </LearningPageFrame>
    );
};

export default DSATopicDetailPage;
