import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Chip, Link, Button, IconButton, Alert } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { format, parseISO } from 'date-fns';
import { useTaskContext } from '../../context/TaskContext';
import { getLondonDateString, getLondonTimeString } from '../../utils/date';
import { getPlanPhase, getPlanWeek, getPlanWeekNumber, daysUntilPlanStart } from '../../utils/studyPlan';
import { getRoutineForDay, weekdayOf } from '../../utils/studySchedule';
import {
    resolveSlotFocus,
    slotState,
    patternForWeek,
    theoryWeeksLeft,
    isTheoryTrackWeek,
} from '../../utils/studyToday';
import {
    planWeeks,
    WEEKDAY_NAMES,
    DAY_TITLES,
    PHASE_COLORS,
    PLAN_WEEKS,
    PLAN_START_DATE,
    type Weekday,
    type RoutineSlot,
} from '../../data/studyPlan';
import { dsaCurriculum } from '../../data/dsaCurriculum';
import { subscribeToDSAProgress, type DSATopicProgress } from '../../services/firebaseService';
import WeekLogDialog from './WeekLogDialog';

/** A YYYY-MM-DD date shifted by whole days, read at UTC so nothing drifts. */
const addDays = (dateISO: string, days: number): string => {
    const date = new Date(`${dateISO}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
};

/** A week back is as far as looking back is useful. Forward is never allowed. */
const MIN_DAY_OFFSET = -6;

const problemCount = (topicId: string): number => {
    for (const phase of dsaCurriculum) {
        for (const section of phase.sections) {
            for (const topic of section.topics) {
                if (topic.id === topicId) return topic.problems.length;
            }
        }
    }
    return 0;
};

/** Minutes to a human duration — "2h 30m", "45m". */
const durationLabel = (hours: number): string => {
    const total = Math.round(hours * 60);
    const h = Math.floor(total / 60);
    const m = total % 60;
    return h === 0 ? `${m}m` : m === 0 ? `${h}h` : `${h}h ${m}m`;
};

/**
 * One slot of today, and the exact thing it asks for.
 *
 * The slot the clock is inside is the only thing emphasised. Everything that
 * has already finished is dimmed rather than hidden, because seeing the
 * morning done is half of why you open this at all.
 */
const SlotCard = ({
    slot,
    day,
    week,
    onOpenWeekLog,
    readOnly = false,
}: {
    slot: RoutineSlot;
    day: Weekday;
    week: (typeof planWeeks)[number];
    onOpenWeekLog: () => void;
    /** A past day is for looking at. Nothing on it can be logged. */
    readOnly?: boolean;
}) => {
    const navigate = useNavigate();
    // On a past day nothing is happening now, so no slot is highlighted.
    const state = readOnly ? 'past' : slotState(slot.start, slot.end, getLondonTimeString());
    const focus = resolveSlotFocus(day, slot.kind, week);
    const isNow = state === 'now';

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                bgcolor: isNow ? 'rgba(41, 121, 255, 0.07)' : 'background.paper',
                border: '1px solid',
                borderColor: isNow ? 'primary.main' : 'rgba(255,255,255,0.08)',
                borderLeft: '4px solid',
                borderLeftColor: isNow ? 'primary.main' : slot.color,
                opacity: state === 'done' ? 0.45 : 1,
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                spacing={1.5}
                flexWrap="wrap"
                useFlexGap
                sx={{ mb: 1 }}
            >
                <Typography
                    variant="body1"
                    sx={{
                        fontWeight: 800,
                        color: isNow ? 'primary.main' : 'text.primary',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {slot.start}–{slot.end}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {durationLabel(slot.hours)}
                </Typography>
                <Chip
                    label={slot.track}
                    size="small"
                    sx={{
                        height: 20,
                        fontSize: '0.6rem',
                        fontWeight: 800,
                        color: slot.color,
                        bgcolor: `${slot.color}1f`,
                    }}
                />
                {isNow && (
                    <Chip
                        label="NOW"
                        size="small"
                        sx={{
                            height: 20,
                            fontSize: '0.6rem',
                            fontWeight: 800,
                            color: 'primary.main',
                            bgcolor: 'rgba(41, 121, 255, 0.18)',
                        }}
                    />
                )}
                {state === 'done' && <CheckRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
            </Stack>

            {focus.text && (
                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                    {focus.text}
                </Typography>
            )}

            {/* The exact thing to open, when a resource backs the slot. */}
            {focus.resource && (
                <Box
                    sx={{
                        mt: 1.5,
                        p: 1.75,
                        borderRadius: 2,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid',
                        borderColor: 'rgba(255,255,255,0.07)',
                    }}
                >
                    {focus.resource.url ? (
                        <Link
                            href={focus.resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            underline="hover"
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.75,
                                color: 'text.primary',
                                fontWeight: 700,
                                lineHeight: 1.4,
                                '&:hover': { color: 'primary.main' },
                            }}
                        >
                            {focus.resource.title}
                            <OpenInNewRoundedIcon sx={{ fontSize: 14, opacity: 0.6 }} />
                        </Link>
                    ) : (
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            {focus.resource.title}
                        </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mt: 0.25 }}>
                        {focus.resource.source}
                    </Typography>
                    {focus.resource.detail && (
                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.75, lineHeight: 1.55, opacity: 0.9 }}>
                            {focus.resource.detail}
                        </Typography>
                    )}
                </Box>
            )}

            {focus.link && (
                <Button
                    size="small"
                    endIcon={<ChevronRightRoundedIcon />}
                    onClick={() => navigate(focus.link!.to)}
                    sx={{ mt: 1, px: 0, color: 'text.secondary', '&:focus': { outline: 'none' } }}
                >
                    {focus.link.label}
                </Button>
            )}

            {focus.opensWeekLog && !readOnly && (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={onOpenWeekLog}
                    sx={{
                        mt: 1.5,
                        borderColor: 'rgba(255,255,255,0.15)',
                        color: 'text.primary',
                        '&:hover': { borderColor: 'primary.main' },
                        '&:focus': { outline: 'none' },
                    }}
                >
                    Write this week down
                </Button>
            )}
        </Box>
    );
};

/**
 * What to do right now, and nothing else.
 *
 * Deliberately carries no hours summary, no 26-week strip and no logging
 * form: those live on This Week, and putting them here is what made a Today
 * page necessary in the first place.
 */
const TodayPage = () => {
    const navigate = useNavigate();
    const { currentWeekNumber, getDeepWorkDay } = useTaskContext();
    const [editingWeek, setEditingWeek] = useState<number | null>(null);
    const [dayOffset, setDayOffset] = useState(0);
    const [dsaProgress, setDsaProgress] = useState<Record<string, DSATopicProgress>>({});
    // Re-render on the minute so the active slot moves without a refresh.
    const [, setTick] = useState(0);

    useEffect(() => {
        const unsubscribe = subscribeToDSAProgress(setDsaProgress);
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setTick(t => t + 1), 60_000);
        return () => clearInterval(timer);
    }, []);

    const today = getLondonDateString();
    const phase = getPlanPhase(today);

    // 0 is today, -1 yesterday, down to a week back. Never forward: there is
    // nothing to see there, and planning ahead is This Week's job.
    const shownDate = addDays(today, dayOffset);
    const looking = dayOffset < 0;

    const weekday = weekdayOf(shownDate);
    // A day far enough back can sit in the previous plan week, so the week,
    // the stage and the resources all come from the day being shown.
    const planWeek = getPlanWeek(shownDate) ?? getPlanWeek(today) ?? planWeeks[0];
    const shownWeekNumber = getPlanWeekNumber(shownDate) ?? currentWeekNumber;
    const deepWorkDay = getDeepWorkDay(shownWeekNumber ?? 1);
    const accent = PHASE_COLORS[planWeek.phaseKey];

    // Before the plan starts, show what the first Monday will ask for.
    const shownDay: Weekday = phase === 'during' ? weekday : 'Mon';
    const slots = getRoutineForDay(shownDay, deepWorkDay);

    const pattern = patternForWeek(planWeek.week);
    const patternTotal = pattern ? problemCount(pattern.topicId) : 0;
    const patternDone = pattern
        ? (dsaProgress[pattern.topicId]?.completedProblems ?? []).length
        : 0;

    const daysToStart = daysUntilPlanStart(today);

    if (phase === 'after') {
        return (
            <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto', textAlign: 'center', py: 10 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
                    Fifty-two weeks done.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    Week 52 was the honest review. Everything you did is in the logbook.
                </Typography>
                <Button variant="contained" onClick={() => navigate('/study/logbook')} sx={{ '&:focus': { outline: 'none' } }}>
                    Read the final review
                </Button>
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 720, mx: 'auto' }}>
            {/* Header — the date, the day's job, and where in the plan you are */}
            <Box sx={{ mb: 3 }}>
                <Stack direction="row" alignItems="baseline" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <Typography
                        variant="h4"
                        sx={{ fontWeight: 800, color: 'text.primary', fontSize: { xs: '1.7rem', sm: '2rem' } }}
                    >
                        {phase === 'during'
                            ? DAY_TITLES[weekday]
                            : daysToStart === 1
                                ? 'Week 1 starts tomorrow'
                                : `Week 1 starts in ${daysToStart} days`}
                    </Typography>
                    {/* Before the plan starts, the date that matters is the one it
                        starts on. Printing today's date here read as the start date. */}
                    <Typography variant="body1" color="text.secondary">
                        {format(parseISO(phase === 'during' ? shownDate : PLAN_START_DATE), 'EEEE d MMMM')}
                    </Typography>

                    {phase === 'during' && (
                        <Stack direction="row" alignItems="center">
                            <IconButton
                                size="small"
                                aria-label="Previous day"
                                disabled={dayOffset <= MIN_DAY_OFFSET}
                                onClick={() => setDayOffset(offset => Math.max(MIN_DAY_OFFSET, offset - 1))}
                            >
                                <ChevronLeftRoundedIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                aria-label="Next day"
                                disabled={dayOffset >= 0}
                                onClick={() => setDayOffset(offset => Math.min(0, offset + 1))}
                            >
                                <ChevronRightRoundedIcon fontSize="small" />
                            </IconButton>
                        </Stack>
                    )}
                </Stack>

                <Typography
                    variant="body2"
                    sx={{ color: accent, fontWeight: 700, letterSpacing: 0.6, mt: 0.5 }}
                >
                    {phase === 'during'
                        ? `Week ${shownWeekNumber} of ${PLAN_WEEKS} · ${planWeek.phase.replace(/\*/g, '').trim()}`
                        : `Week 1 · ${planWeek.dates} · ${planWeek.phase.replace(/\*/g, '').trim()}`}
                </Typography>

                {dayOffset !== 0 && (
                    <Button
                        size="small"
                        onClick={() => setDayOffset(0)}
                        sx={{ mt: 0.5, px: 0, '&:hover': { bgcolor: 'transparent' } }}
                    >
                        Back to today
                    </Button>
                )}

                {phase === 'before' && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        This is what that Monday will ask for.
                    </Typography>
                )}
            </Box>

            {/* Looking back is for information. It is not a to-do list you
                failed, which is why this is an info note and not a warning. */}
            {looking && (
                <Alert severity="info" variant="outlined" sx={{ mb: 2.5, borderRadius: 3 }}>
                    Looking back at {WEEKDAY_NAMES[weekday]}. This is for information only — if you
                    missed it, let it go. The rule is: miss a day, skip it. Never double up.
                </Alert>
            )}

            {/* The day's slots, in clock order */}
            <Stack spacing={1.5}>
                {slots.map(slot => (
                    <SlotCard
                        key={`${slot.kind}-${slot.start}`}
                        slot={slot}
                        day={shownDay}
                        week={planWeek}
                        onOpenWeekLog={() => setEditingWeek(shownWeekNumber ?? 1)}
                        readOnly={looking}
                    />
                ))}
            </Stack>

            {/* Which stage the mornings are serving, and how much of it is
                left. Nothing takes the mornings away now — theory runs the
                whole plan — so this names the work rather than a deadline. */}
            {phase === 'during' && isTheoryTrackWeek(planWeek.week) && (
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 3, fontSize: '0.82rem', fontStyle: 'italic' }}
                >
                    {planWeek.stageName} · {theoryWeeksLeft(planWeek.week)} theory{' '}
                    {theoryWeeksLeft(planWeek.week) === 1 ? 'week' : 'weeks'} left in the plan.
                </Typography>
            )}

            {/* One line on where the 150 problems stand */}
            {pattern && (
                <Box
                    onClick={() => navigate(`/dsa/${pattern.topicId}`)}
                    sx={{
                        mt: 3,
                        py: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer',
                        borderTop: 1,
                        borderColor: 'rgba(255,255,255,0.08)',
                        '&:hover .dsa-line': { color: 'primary.main' },
                    }}
                >
                    <Typography
                        variant="body2"
                        className="dsa-line"
                        color="text.secondary"
                        sx={{ transition: 'color 0.15s' }}
                    >
                        {pattern.name} — {patternDone} of {patternTotal} done
                    </Typography>
                    <ChevronRightRoundedIcon sx={{ fontSize: 16, color: 'text.disabled' }} />
                </Box>
            )}

            <WeekLogDialog week={editingWeek} onClose={() => setEditingWeek(null)} />
        </Box>
    );
};

export default TodayPage;
