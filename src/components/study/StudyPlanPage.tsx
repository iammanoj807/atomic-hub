import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Button,
    Chip,
    LinearProgress,
    Collapse,
    Alert,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { format, parseISO } from 'date-fns';
import { useTaskContext } from '../../context/TaskContext';
import { getLondonDateString } from '../../utils/date';
import {
    getPlanPhase,
    getPlanWeek,
    daysUntilPlanStart,
    getRoutineForDay,
    summariseHours,
    isUnderPace,
    UNDER_PACE_HOURS,
} from '../../utils/studyPlan';
import {
    planWeeks,
    projects,
    tracks,
    whyBothTracks,
    asymmetries,
    learningSteps,
    neverSkipBuild,
    timeBudgetNote,
    workPattern,
    routineRules,
    PLAN_WEEKS,
    PHASE_COLORS,
} from '../../data/studyPlan';
import StudyPageHeader from './StudyPageHeader';
import WeekCard from './WeekCard';

/** One number and what it means. Four of these sit under the header. */
const StatTile = ({
    label,
    value,
    hint,
    color,
    onClick,
}: {
    label: string;
    value: string;
    hint: string;
    color?: string;
    onClick?: () => void;
}) => (
    <Box
        onClick={onClick}
        sx={{
            p: 2.5,
            borderRadius: 3,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'rgba(255,255,255,0.08)',
            ...(onClick && {
                cursor: 'pointer',
                transition: 'border-color 0.15s, background-color 0.15s',
                '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(41, 121, 255, 0.04)',
                },
            }),
        }}
    >
        <Typography
            variant="caption"
            color="text.secondary"
            sx={{ letterSpacing: 1.2, fontSize: '0.65rem', fontWeight: 700 }}
        >
            {label}
        </Typography>
        <Typography
            variant="h4"
            sx={{ color: color ?? 'text.primary', fontWeight: 700, my: 0.5, fontVariantNumeric: 'tabular-nums' }}
        >
            {value}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
            {hint}
        </Typography>
    </Box>
);

const StudyPlanPage = () => {
    const navigate = useNavigate();
    const { studyWeekLogs, currentWeekNumber, studyPapers, completedProjectIds } = useTaskContext();
    const [showStrategy, setShowStrategy] = useState(false);

    const today = getLondonDateString();
    const phase = getPlanPhase(today);
    const thisWeek = getPlanWeek(today);
    const daysToStart = daysUntilPlanStart(today);

    const hours = summariseHours(studyWeekLogs, currentWeekNumber);
    const behind = isUnderPace(studyWeekLogs, currentWeekNumber);

    // Before the plan starts there is no "this week" — week 1 is shown instead,
    // because what you want two days out is to see what is coming.
    const featuredWeek = thisWeek ?? planWeeks[0];
    const weeksDone = currentWeekNumber ? currentWeekNumber - 1 : 0;

    const todayName = format(parseISO(today), 'EEEE');
    const todaySlots = getRoutineForDay(todayName);

    const headline =
        phase === 'before'
            ? daysToStart === 1 ? 'Week 1 starts tomorrow.' : `Week 1 starts in ${daysToStart} days.`
            : phase === 'after'
                ? '26 weeks done.'
                : `Week ${currentWeekNumber} of ${PLAN_WEEKS}.`;

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="STUDY PLAN"
                title={headline}
                subtitle={workPattern}
                action={
                    <Button
                        variant="outlined"
                        startIcon={<CalendarMonthRoundedIcon />}
                        onClick={() => navigate('/study/weeks')}
                        sx={{
                            borderColor: 'rgba(255,255,255,0.15)',
                            color: 'text.primary',
                            '&:hover': { borderColor: 'primary.main' },
                            '&:focus': { outline: 'none' },
                        }}
                    >
                        All 26 weeks
                    </Button>
                }
            />

            {/* Where you are in the 26 weeks */}
            <Box sx={{ mb: 4 }}>
                <LinearProgress
                    variant="determinate"
                    value={(weeksDone / PLAN_WEEKS) * 100}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'primary.main' },
                    }}
                />
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                    gap: 2,
                    mb: 5,
                }}
            >
                <StatTile
                    label="WEEKS DONE"
                    value={`${weeksDone}/${PLAN_WEEKS}`}
                    hint={phase === 'before' ? 'Not started yet' : `${PLAN_WEEKS - weeksDone} to go`}
                    onClick={() => navigate('/study/weeks')}
                />
                <StatTile
                    label="HOURS LOGGED"
                    value={`${hours.actualTotal}`}
                    hint={`${hours.targetToDate}h asked for so far`}
                    color={hours.diffToDate < 0 ? '#ff8a65' : '#66bb6a'}
                    onClick={() => navigate('/study/hours')}
                />
                <StatTile
                    label="PAPERS READ"
                    value={`${studyPapers.length}`}
                    hint="~60 over six months"
                    onClick={() => navigate('/study/papers')}
                />
                <StatTile
                    label="PROJECTS"
                    value={`${completedProjectIds.length}/${projects.length}`}
                    hint="Public artifacts by February"
                    onClick={() => navigate('/study/projects')}
                />
            </Box>

            {/* The sheet's own instruction, fired automatically instead of
                waiting for you to notice it on a Sunday. */}
            {behind && (
                <Alert
                    severity="warning"
                    variant="outlined"
                    sx={{ mb: 4, borderRadius: 3, alignItems: 'center' }}
                >
                    Three weeks running under {UNDER_PACE_HOURS} hours. Cut the Sunday session first, then
                    Saturday. Keep the mornings and keep the daily DSA — those two habits are the plan.
                </Alert>
            )}

            {/* This week */}
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                sx={{ letterSpacing: 1.5, display: 'block', mb: 1.5, fontSize: '0.7rem' }}
            >
                {phase === 'during' ? 'THIS WEEK' : phase === 'before' ? 'FIRST WEEK' : 'LAST WEEK'}
            </Typography>
            <Box sx={{ mb: 5 }}>
                <WeekCard week={featuredWeek} highlighted />
            </Box>

            {/* Today's slots, straight from the routine */}
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                sx={{ letterSpacing: 1.5, display: 'block', mb: 1.5, fontSize: '0.7rem' }}
            >
                {todayName.toUpperCase()}
            </Typography>
            <Stack spacing={0} sx={{ mb: 5 }}>
                {todaySlots.map((slot, index) => (
                    <Box
                        key={`${slot.day}-${slot.time}`}
                        sx={{
                            py: 2,
                            display: 'flex',
                            gap: 2,
                            alignItems: 'flex-start',
                            borderBottom: index < todaySlots.length - 1 ? 1 : 0,
                            borderColor: 'rgba(255,255,255,0.08)',
                        }}
                    >
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ width: 100, flexShrink: 0, fontVariantNumeric: 'tabular-nums', pt: 0.2 }}
                        >
                            {slot.time}
                        </Typography>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
                                {slot.what}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.3, fontSize: '0.85rem' }}>
                                {slot.track} · {slot.why}
                            </Typography>
                        </Box>
                    </Box>
                ))}
            </Stack>

            {/* The strategy behind the schedule — collapsed, because you read it
                once in August and then you just need the week. */}
            <Button
                onClick={() => setShowStrategy(!showStrategy)}
                endIcon={showStrategy ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                sx={{ color: 'text.secondary', px: 0, mb: 2, '&:focus': { outline: 'none' } }}
            >
                {showStrategy ? 'Hide the strategy' : 'Read the strategy'}
            </Button>

            <Collapse in={showStrategy} timeout="auto" unmountOnExit>
                <Box sx={{ pb: 4 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        Two tracks, one person
                    </Typography>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {tracks.map(track => (
                            <Box
                                key={track.id}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'rgba(255,255,255,0.08)',
                                }}
                            >
                                <Chip
                                    label={`TRACK ${track.id}`}
                                    size="small"
                                    sx={{
                                        height: 22,
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        mb: 1,
                                        color: track.id === 'A' ? PHASE_COLORS.foundations : PHASE_COLORS.publish,
                                        bgcolor: `${track.id === 'A' ? PHASE_COLORS.foundations : PHASE_COLORS.publish}1f`,
                                    }}
                                />
                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {track.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {track.when}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.55 }}>
                                    {track.what}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                        {whyBothTracks}
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Six real asymmetries
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        There is no trick. But almost nobody does these.
                    </Typography>
                    <Stack spacing={2} sx={{ mb: 4 }}>
                        {asymmetries.map((item, index) => (
                            <Box key={item.title} sx={{ display: 'flex', gap: 2 }}>
                                <Typography
                                    sx={{
                                        color: 'primary.main',
                                        fontWeight: 800,
                                        width: 24,
                                        flexShrink: 0,
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {index + 1}
                                </Typography>
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        {item.detail}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        How you learn
                    </Typography>
                    <Stack spacing={1.5} sx={{ mb: 2 }}>
                        {learningSteps.map(step => (
                            <Box key={step.step} sx={{ display: 'flex', gap: 2, alignItems: 'baseline' }}>
                                <Typography
                                    sx={{
                                        color: 'secondary.main',
                                        fontWeight: 800,
                                        letterSpacing: 1,
                                        width: 72,
                                        flexShrink: 0,
                                        fontSize: '0.8rem',
                                    }}
                                >
                                    {step.step}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                                    {step.detail}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                    <Typography variant="body2" sx={{ color: '#ff8a65', fontWeight: 600, mb: 4, lineHeight: 1.6 }}>
                        {neverSkipBuild}
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        The rules
                    </Typography>
                    <Stack spacing={1.25} sx={{ mb: 4 }}>
                        {routineRules.map((rule, index) => (
                            <Box key={rule} sx={{ display: 'flex', gap: 2 }}>
                                <Typography
                                    color="text.disabled"
                                    sx={{ width: 20, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {index + 1}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                                    {rule}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                            ~24 hours per week.{' '}
                        </Box>
                        {timeBudgetNote}
                    </Typography>
                </Box>
            </Collapse>
        </Box>
    );
};

export default StudyPlanPage;
