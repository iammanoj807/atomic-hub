import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, FormControlLabel, LinearProgress, Link, Skeleton, Stack, Switch, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { dsaProblemCards } from '../data/dsaProblemCards';
import { usePatternDrill } from '../hooks/usePatternDrill';
import { useDSAProgress } from '../hooks/useDSAProgress';
import { getLondonDateString } from '../utils/date';
import {
    MAX_BOX,
    BOX_INTERVAL_DAYS,
    allTopicIds,
    choicesFor,
    drillSummary,
    getDrillProblem,
    isCorrectChoice,
    topicAccuracy,
    topicTitle,
    type DrillState,
} from '../utils/patternDrill';
import { studiedTopicIds, todaysDrill } from '../utils/dsaStudied';
import { CONFIDENT, CYAN, TAP, px, useTextSizeChoice } from './learning/learning';
import { LearningPageFrame, TextSizeControl, SectionLabel } from './learning/LearningParts';

const WRONG = '#ef5350';
const MIN_REVIEWS_FOR_WEAKEST = 3;

interface Answer {
    problemId: string;
    picked: string;
    correct: boolean;
}

/** "Tue 8 Oct" for a YYYY-MM-DD date. */
const formatDay = (date: string) =>
    new Date(`${date}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** The next day after today that has cards due, and how many. */
const nextDue = (state: DrillState, today: string) => {
    const later = Object.values(state).map(card => card.due).filter(due => due > today).sort();
    if (later.length === 0) return null;
    return { date: later[0], count: later.filter(due => due === later[0]).length };
};

/** The three topics answered worst, with at least a few reviews each. */
const weakestTopics = (state: DrillState) =>
    Object.entries(topicAccuracy(state))
        .filter(([, entry]) => entry.reviews >= MIN_REVIEWS_FOR_WEAKEST)
        .map(([topicId, entry]) => ({ topicId, accuracy: entry.correct / entry.reviews, reviews: entry.reviews }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 3);

const Panel = ({ children }: { children: ReactNode }) => (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {children}
    </Box>
);

/**
 * The "Which pattern?" drill. Each card is a NeetCode problem described
 * without naming its pattern; pick the pattern, see why, and the card comes
 * back sooner or later depending on the answer (Leitner boxes).
 */
const PatternDrillPage = () => {
    const navigate = useNavigate();
    const { textSize, t, theme, changeTextSize } = useTextSizeChoice();
    const { cards, loaded: drillLoaded, review } = usePatternDrill();
    const { progress, loaded: progressLoaded } = useDSAProgress();
    const loaded = drillLoaded && progressLoaded;
    const today = getLondonDateString();

    const [onlyStudied, setOnlyStudied] = useState(true);
    // The session is frozen when it starts: answering changes what buildSession
    // would return, and the cards must not shift underneath you.
    const [session, setSession] = useState<string[] | null>(null);
    const [position, setPosition] = useState(0);
    const [answers, setAnswers] = useState<Answer[]>([]);

    const planned = loaded ? todaysDrill(cards, progress, today, onlyStudied) : [];
    const studied = studiedTopicIds(progress);
    const summary = drillSummary(cards);
    const weakest = weakestTopics(cards);

    const start = (ids: string[]) => {
        setSession(ids);
        setPosition(0);
        setAnswers([]);
    };

    const currentId = session && position < session.length ? session[position] : null;
    // One answer per card, in order, so the answer for this card (if any) sits at its position.
    const answered: Answer | undefined = currentId ? answers[position] : undefined;
    const choices = currentId ? choicesFor(currentId) : [];
    const finished = session !== null && position >= session.length;

    const pick = (topicId: string) => {
        if (!currentId || answered) return;
        const correct = isCorrectChoice(currentId, topicId);
        setAnswers(current => [...current, { problemId: currentId, picked: topicId, correct }]);
        void review(currentId, correct, today);
    };
    const next = () => setPosition(current => current + 1);

    // 1–4 pick an option, Enter goes on. Read through a ref so the listener is added once.
    const keys = useRef({ pick, next, choices, answered: Boolean(answered), active: Boolean(currentId) });
    useEffect(() => {
        keys.current = { pick, next, choices, answered: Boolean(answered), active: Boolean(currentId) };
    });
    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            const { pick: choose, next: goOn, choices: options, answered: done, active } = keys.current;
            if (!active || event.metaKey || event.ctrlKey || event.altKey) return;
            const target = event.target as HTMLElement | null;
            if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return;
            const number = Number(event.key);
            if (!done && number >= 1 && number <= options.length) {
                event.preventDefault();
                choose(options[number - 1]);
            } else if (done && event.key === 'Enter') {
                // Also stops a focused button from treating the same Enter as a click.
                event.preventDefault();
                goOn();
            }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    // ---- pieces ----

    const header = (
        <>
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
                NEETCODE 150 · RECOGNITION
            </Typography>
            <Typography variant="h2" fontWeight="bold" sx={{ color: 'text.primary', mb: 1, fontSize: { xs: `${2 * t.heading}rem`, sm: `${3 * t.heading}rem` } }}>
                Pattern drill
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Read what a problem asks, then name the pattern. Cards you get right come back later; cards you miss come back tomorrow.
            </Typography>
        </>
    );

    const stats = (
        <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1.5 }}>
                {summary.boxes.map((count, index) => (
                    <Box key={index} sx={{ px: 1.5, py: 1, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', minWidth: 76 }}>
                        <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', fontWeight: 700, letterSpacing: 0.8 }}>
                            BOX {index + 1} · {BOX_INTERVAL_DAYS[index]}D
                        </Typography>
                        <Typography fontWeight={800} color="text.primary" sx={{ fontSize: px(t.body1 * 1.15) }}>{count}</Typography>
                    </Box>
                ))}
            </Stack>
            <Typography variant="body2" color="text.secondary">
                <Box component="strong" sx={{ color: CONFIDENT }}>{summary.mastered}</Box> mastered (box 4 or {MAX_BOX}) ·{' '}
                <Box component="strong" sx={{ color: 'text.primary' }}>{summary.unseen}</Box> never seen
            </Typography>
            {weakest.length > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
                    Weakest:{' '}
                    {weakest.map((entry, index) => (
                        <Box component="span" key={entry.topicId}>
                            {index > 0 && ' · '}
                            <Box component="strong" sx={{ color: 'text.primary' }}>{topicTitle(entry.topicId)}</Box>{' '}
                            {Math.round(entry.accuracy * 100)}%
                        </Box>
                    ))}
                </Typography>
            )}
        </Box>
    );

    // ---- screens ----

    let body: ReactNode;

    if (!loaded) {
        body = <Skeleton variant="rounded" height={220} sx={{ bgcolor: 'rgba(255,255,255,0.06)' }} aria-label="Loading your drill" />;
    } else if (session === null) {
        // Start screen
        const nothingStudied = onlyStudied && studied.length === 0;
        const upcoming = nextDue(cards, today);
        body = (
            <Panel>
                <FormControlLabel
                    control={<Switch checked={onlyStudied} onChange={event => setOnlyStudied(event.target.checked)} />}
                    label={<Typography variant="body1" fontWeight={700}>Only topics I've studied</Typography>}
                    sx={{ minHeight: TAP, ml: -0.5 }}
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {onlyStudied
                        ? `${studied.length} of ${allTopicIds.length} topics have at least one solved problem.`
                        : `Cards can come from any of the ${allTopicIds.length} topics.`}
                </Typography>
                {planned.length > 0 ? (
                    <>
                        <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mb: 2 }}>
                            {planned.length} {planned.length === 1 ? 'card' : 'cards'} today
                        </Typography>
                        <Button variant="contained" onClick={() => start(planned)} sx={{ minHeight: TAP, px: 3, textTransform: 'none', fontWeight: 700 }}>
                            Start the drill
                        </Button>
                    </>
                ) : (
                    <>
                        <Typography variant="body1" color="text.primary" sx={{ mb: 2 }}>
                            {nothingStudied
                                ? "You haven't ticked a solved problem yet, so there's nothing to drill from your own topics. Try every topic instead — it's a good way to preview the patterns."
                                : 'Nothing is due from these topics today. Nice work.'}
                        </Typography>
                        {onlyStudied && (
                            <Button variant="outlined" onClick={() => setOnlyStudied(false)} sx={{ minHeight: TAP, px: 2.5, textTransform: 'none', fontWeight: 700 }}>
                                Use all topics
                            </Button>
                        )}
                        {!onlyStudied && upcoming && (
                            <Typography variant="body2" color="text.secondary">
                                Next cards due {formatDay(upcoming.date)} ({upcoming.count}).
                            </Typography>
                        )}
                    </>
                )}
            </Panel>
        );
    } else if (finished) {
        // End screen
        const score = answers.filter(answer => answer.correct).length;
        const mixups = answers.filter(answer => !answer.correct);
        const more = todaysDrill(cards, progress, today, onlyStudied);
        const upcoming = nextDue(cards, today);
        body = (
            <Panel>
                <Typography variant="caption" sx={{ display: 'block', color: CYAN, fontWeight: 800, letterSpacing: 1.2 }}>
                    DONE FOR NOW
                </Typography>
                <Typography variant="h3" fontWeight="bold" color="text.primary" sx={{ my: 1 }}>
                    {score} / {answers.length}
                </Typography>
                {mixups.length > 0 ? (
                    <>
                        <SectionLabel>PATTERNS YOU MIXED UP TODAY</SectionLabel>
                        <Stack spacing={1}>
                            {mixups.map(answer => {
                                const problem = getDrillProblem(answer.problemId);
                                return (
                                    <Typography key={answer.problemId} variant="body2" sx={{ color: 'text.primary' }}>
                                        <Box component="span" sx={{ color: WRONG, fontWeight: 700 }}>{topicTitle(answer.picked)}</Box>
                                        {' → '}
                                        <Box component="span" sx={{ color: CONFIDENT, fontWeight: 700 }}>{problem?.topicTitle}</Box>
                                        <Box component="span" sx={{ color: 'text.secondary' }}> · {problem?.title}</Box>
                                    </Typography>
                                );
                            })}
                        </Stack>
                    </>
                ) : (
                    <Typography variant="body1" color="text.secondary">No mix-ups today.</Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 3 }}>
                    {more.length > 0
                        ? `${more.length} more ${more.length === 1 ? 'card is' : 'cards are'} ready today.`
                        : upcoming
                            ? `Next cards due ${formatDay(upcoming.date)} (${upcoming.count}).`
                            : 'No cards are scheduled yet.'}
                </Typography>
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                    {more.length > 0 && (
                        <Button variant="contained" onClick={() => start(more)} sx={{ minHeight: TAP, px: 2.5, textTransform: 'none', fontWeight: 700 }}>
                            Another round
                        </Button>
                    )}
                    <Button variant="outlined" onClick={() => navigate('/dsa/patterns')} sx={{ minHeight: TAP, px: 2.5, textTransform: 'none', fontWeight: 700 }}>
                        Which pattern? cheat sheet
                    </Button>
                </Stack>
            </Panel>
        );
    } else if (currentId) {
        // A card
        const card = dsaProblemCards[currentId];
        const problem = getDrillProblem(currentId);
        const alsoAccept = card?.alsoAccept ?? [];
        body = (
            <Box>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={(position / session.length) * 100}
                        sx={{ flex: 1, height: 4, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.06)', '& .MuiLinearProgress-bar': { bgcolor: CYAN } }}
                    />
                    <Typography color="text.secondary" sx={{ fontSize: px(t.small), whiteSpace: 'nowrap' }}>
                        Card {position + 1} of {session.length}
                    </Typography>
                </Stack>
                <Panel>
                    <Typography variant="caption" sx={{ display: 'block', color: CYAN, fontWeight: 800, letterSpacing: 1.2, mb: 1 }}>
                        WHICH PATTERN?
                    </Typography>
                    <Typography sx={{ color: 'text.primary', fontWeight: 600, fontSize: px(t.body1 * 1.15), lineHeight: 1.5, mb: 2.5 }}>
                        {card?.summary}
                    </Typography>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1 }} role="group" aria-label="Pick a pattern">
                        {choices.map((topicId, index) => {
                            const right = isCorrectChoice(currentId, topicId);
                            const chosen = answered?.picked === topicId;
                            const colour = answered ? (right ? CONFIDENT : chosen ? WRONG : undefined) : undefined;
                            return (
                                <Button
                                    key={topicId}
                                    variant="outlined"
                                    onClick={() => pick(topicId)}
                                    aria-disabled={Boolean(answered)}
                                    startIcon={
                                        <Box component="span" sx={{ fontFamily: 'ui-monospace, Menlo, monospace', fontSize: px(t.small), opacity: 0.7 }}>
                                            {index + 1}
                                        </Box>
                                    }
                                    endIcon={answered && right ? <CheckCircleRoundedIcon /> : answered && chosen ? <CancelRoundedIcon /> : undefined}
                                    sx={{
                                        minHeight: TAP + 4,
                                        justifyContent: 'flex-start',
                                        textAlign: 'left',
                                        textTransform: 'none',
                                        fontWeight: 700,
                                        fontSize: px(t.body2),
                                        color: colour ?? 'text.primary',
                                        borderColor: colour ?? 'rgba(255,255,255,0.18)',
                                        bgcolor: colour ? `${colour}1a` : 'transparent',
                                        opacity: answered && !right && !chosen ? 0.55 : 1,
                                        pointerEvents: answered ? 'none' : 'auto',
                                        '& .MuiButton-endIcon': { ml: 'auto' },
                                    }}
                                >
                                    {topicTitle(topicId)}
                                </Button>
                            );
                        })}
                    </Box>
                    {!answered && (
                        <Typography color="text.secondary" sx={{ mt: 1.5, fontSize: px(t.small) }}>
                            Tip: press 1–4 on a keyboard.
                        </Typography>
                    )}

                    {answered && problem && card && (
                        <Box sx={{ mt: 2.5 }} aria-live="polite">
                            <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${answered.correct ? CONFIDENT : WRONG}14`, borderLeft: '3px solid', borderColor: answered.correct ? CONFIDENT : WRONG }}>
                                <Typography variant="body1" fontWeight={800} sx={{ color: answered.correct ? CONFIDENT : WRONG }}>
                                    {answered.correct ? 'Right.' : 'Not quite.'}{' '}
                                    <Box component="span" sx={{ color: 'text.primary' }}>
                                        It's {problem.topicTitle}
                                        {alsoAccept.length > 0 && ` (also accepted: ${alsoAccept.map(topicTitle).join(', ')})`}.
                                    </Box>
                                </Typography>
                            </Box>
                            <Stack spacing={1.25} sx={{ mt: 2 }}>
                                {[
                                    { label: 'TECHNIQUE', text: card.technique },
                                    { label: 'THE CLUE', text: card.clue },
                                    { label: 'THE TRICK', text: card.trick },
                                ].map(line => (
                                    <Box key={line.label}>
                                        <Typography variant="caption" sx={{ display: 'block', color: CYAN, fontWeight: 800, letterSpacing: 1 }}>
                                            {line.label}
                                        </Typography>
                                        <Typography variant="body1" sx={{ color: 'text.primary' }}>{line.text}</Typography>
                                    </Box>
                                ))}
                            </Stack>
                            <Typography variant="body2" sx={{ mt: 2 }}>
                                <Link href={problem.url} target="_blank" rel="noopener noreferrer" sx={{ color: 'text.primary', fontWeight: 700 }}>
                                    {problem.title}
                                    <OpenInNewRoundedIcon sx={{ fontSize: '0.9em', ml: 0.5, verticalAlign: 'middle', opacity: 0.6 }} />
                                </Link>
                            </Typography>
                            <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                                <Button variant="contained" onClick={next} sx={{ minHeight: TAP, px: 3, textTransform: 'none', fontWeight: 700 }}>
                                    {position + 1 < session.length ? 'Next' : 'Finish'}
                                </Button>
                                <Button
                                    onClick={() => navigate(`/dsa/${problem.topicId}`)}
                                    sx={{ minHeight: TAP, px: 1.5, textTransform: 'none', fontWeight: 700, color: CYAN }}
                                >
                                    {problem.topicTitle} pattern guide →
                                </Button>
                            </Stack>
                        </Box>
                    )}
                </Panel>
            </Box>
        );
    }

    return (
        <LearningPageFrame t={t} theme={theme}>
            <Box sx={{ width: '100%', maxWidth: 760, mx: 'auto', minWidth: 0, pb: 6 }}>
                {header}
                {loaded && session === null && stats}
                {body}
            </Box>
        </LearningPageFrame>
    );
};

export default PatternDrillPage;
