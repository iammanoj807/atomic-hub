import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Button, Chip, LinearProgress, Alert } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import Confetti from 'react-confetti';
import { useTaskContext } from '../../context/TaskContext';
import { getLondonDateString } from '../../utils/date';
import {
    getPlanPhase,
    getPlanWeek,
    daysUntilPlanStart,
    summariseHours,
    getPaceState,
    UNDER_PACE_HOURS,
} from '../../utils/studyPlan';
import { weekdayOf } from '../../utils/studySchedule';
import {
    planWeeks,
    dsaPatterns,
    PLAN_WEEKS,
    PHASE_COLORS,
    type Weekday,
} from '../../data/studyPlan';
import { getWeekResources } from '../../data/studyResources';
import { projects } from '../../data/studyPlan';
import { dsaCurriculum } from '../../data/dsaCurriculum';
import { subscribeToDSAProgress, type DSATopicProgress } from '../../services/firebaseService';
import DeepWorkDayPicker from './DeepWorkDayPicker';
import WeekSchedule from './WeekSchedule';
import ResourceList from './ResourceList';
import WeekLogDialog from './WeekLogDialog';
import WeekStrip from './WeekStrip';
import StageBanner from './StageBanner';
import OneOffTasks from './OneOffTasks';
import ReadingCard from './ReadingCard';
import GateCard from './GateCard';
import ArtifactPipeline from './ArtifactPipeline';

/** The pattern this week's DSA target belongs to, matched by its plan weeks. */
const patternForWeek = (week: number) =>
    dsaPatterns.find(pattern =>
        pattern.weeks.split('-').map(Number).length === 2
            ? week >= Number(pattern.weeks.split('-')[0]) && week <= Number(pattern.weeks.split('-')[1])
            : Number(pattern.weeks) === week
    );

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

/** Changes with how far in you are — the plan's own voice, not a generic cheer. */
const encouragementFor = (week: number | null, loggedCount: number): string => {
    if (week === null) return 'Everything is set up. All that is left is to start.';
    if (week <= 3) return 'The first three weeks are the hardest to believe in. Just do the mornings.';
    if (week <= 8) return 'Most people quit around week 8. Being here at all is the whole asymmetry.';
    if (week <= 12) return 'You are past the point where most of the people who started with you stopped.';
    if (week <= 16) return 'Four months in. The reproduction is what a supervisor will actually read.';
    if (week <= 20) return 'Five months. You are doing research now, not following it.';
    if (loggedCount >= 20) return 'Twenty-plus weeks logged. That record is the application.';
    return 'The last stretch. Publish, sit the exam, send the emails.';
};

const ThisWeekPage = () => {
    const navigate = useNavigate();
    const {
        studyWeekLogs,
        currentWeekNumber,
        getDeepWorkDay,
        saveDeepWorkDay,
        getSecondDayOff,
        saveSecondDayOff,
        studyPapers,
        completedProjectIds,
    } = useTaskContext();

    const [editingWeek, setEditingWeek] = useState<number | null>(null);
    const [celebrate, setCelebrate] = useState(false);
    const [dsaProgress, setDsaProgress] = useState<Record<string, DSATopicProgress>>({});

    useEffect(() => {
        const unsubscribe = subscribeToDSAProgress(setDsaProgress);
        return () => unsubscribe();
    }, []);

    // A short burst, then it clears itself.
    useEffect(() => {
        if (!celebrate) return;
        const timer = setTimeout(() => setCelebrate(false), 6000);
        return () => clearTimeout(timer);
    }, [celebrate]);

    const today = getLondonDateString();
    const phase = getPlanPhase(today);
    const thisWeek = getPlanWeek(today);
    const featuredWeek = thisWeek ?? planWeeks[0];
    const daysToStart = daysUntilPlanStart(today);

    const hours = summariseHours(studyWeekLogs, currentWeekNumber);
    const pace = getPaceState(studyWeekLogs, currentWeekNumber);
    const loggedWeeks = new Set(
        Object.values(studyWeekLogs)
            .filter(log => log.actualHours != null)
            .map(log => log.week)
    );

    // Before the plan starts you can still set week 1's day off.
    const plannedWeek = currentWeekNumber ?? 1;
    const deepWorkDay = getDeepWorkDay(plannedWeek);
    const secondDayOff = getSecondDayOff(plannedWeek);

    const accent = PHASE_COLORS[featuredWeek.phaseKey];
    const resources = getWeekResources(featuredWeek.week);
    const pattern = patternForWeek(featuredWeek.week);
    const patternTotal = pattern ? problemCount(pattern.topicId) : 0;
    const patternDone = pattern
        ? (dsaProgress[pattern.topicId]?.completedProblems ?? []).length
        : 0;

    // The artifact this week is working towards — the first one not yet past
    // its due week, so a slipped artifact keeps its place rather than vanishing.
    const currentArtifact =
        projects.find(project => project.byWeek >= featuredWeek.week) ?? projects[projects.length - 1];

    const headline =
        phase === 'before'
            ? daysToStart === 1 ? 'Week 1 starts tomorrow.' : `Week 1 starts in ${daysToStart} days.`
            : phase === 'after'
                ? 'Fifty-two weeks done.'
                : `Week ${currentWeekNumber} of ${PLAN_WEEKS}.`;

    return (
        <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto' }}>
            {celebrate && (
                <Confetti
                    recycle={false}
                    numberOfPieces={220}
                    gravity={0.25}
                    style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 2000 }}
                />
            )}

            {/* What this week is FOR, before anything about how it is going. */}
            <StageBanner week={featuredWeek} />

            {/* Errands, not slots — they belong to the week, not to a time in it. */}
            {featuredWeek.oneOffTasks && (
                <OneOffTasks week={featuredWeek.week} tasks={featuredWeek.oneOffTasks} />
            )}

            <ReadingCard weekNumber={featuredWeek.week} today={today} />

            {featuredWeek.gate && (
                <GateCard
                    stage={featuredWeek.stage}
                    stageName={featuredWeek.stageName}
                    gate={featuredWeek.gate}
                    today={today}
                />
            )}

            {/* BUILD is a quarter of the artifact. The other three steps are
                the half anyone else ever sees, so they are on the main page. */}
            <Box
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    mb: 4,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                }}
            >
                <Typography
                    variant="caption"
                    sx={{ color: '#4dd0e1', letterSpacing: 1.4, fontWeight: 800, fontSize: '0.68rem' }}
                >
                    ARTIFACT {currentArtifact.number} · DUE WEEK {currentArtifact.byWeek}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600, mt: 0.5, mb: 1.5 }}>
                    {currentArtifact.name}
                </Typography>
                <ArtifactPipeline project={currentArtifact} compact />
                <Button
                    onClick={() => navigate('/study/artifacts')}
                    size="small"
                    endIcon={<ChevronRightRoundedIcon />}
                    sx={{ mt: 1, color: '#4dd0e1', px: 0, '&:hover': { bgcolor: 'transparent' } }}
                >
                    All nine artifacts
                </Button>
            </Box>

            {/* Hero — the phase colour is the week's identity, top to bottom */}
            <Box
                sx={{
                    p: { xs: 2.5, sm: 4 },
                    borderRadius: 4,
                    mb: 4,
                    background: `linear-gradient(135deg, ${accent}1a 0%, rgba(21,25,33,0) 70%)`,
                    border: '1px solid',
                    borderColor: `${accent}33`,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{ color: accent, letterSpacing: 1.6, fontWeight: 800, fontSize: '0.7rem' }}
                >
                    {featuredWeek.phase.replace(/\*/g, '').trim().toUpperCase()}
                </Typography>

                <Typography
                    variant="h2"
                    fontWeight="bold"
                    sx={{ color: 'text.primary', mt: 0.5, mb: 1, fontSize: { xs: '2.1rem', sm: '3rem' } }}
                >
                    {headline}
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                    {featuredWeek.dates} · {encouragementFor(currentWeekNumber, loggedWeeks.size)}
                </Typography>

                <WeekStrip currentWeek={currentWeekNumber} loggedWeeks={loggedWeeks} />

                {/* Every number opens the page that explains it — a count you
                    cannot click is a dead end. */}
                <Stack direction="row" spacing={3} sx={{ mt: 3 }} flexWrap="wrap" useFlexGap>
                    {[
                        {
                            label: 'HOURS',
                            value: `${hours.actualTotal}`,
                            of: `/ ${hours.targetToDate || 0} so far`,
                            to: '/study/logbook',
                        },
                        {
                            label: 'PAPERS',
                            value: `${studyPapers.length}`,
                            of: '/ ~120',
                            to: '/study/logbook?tab=papers',
                        },
                        {
                            label: 'PROJECTS',
                            value: `${completedProjectIds.length}`,
                            of: '/ 9',
                            to: '/study/journey?tab=projects',
                        },
                    ].map(stat => (
                        <Box
                            key={stat.label}
                            onClick={() => navigate(stat.to)}
                            role="link"
                            aria-label={`${stat.label}: ${stat.value} ${stat.of}`}
                            sx={{
                                cursor: 'pointer',
                                px: 1,
                                mx: -1,
                                borderRadius: 2,
                                transition: 'background-color 0.15s',
                                '&:hover': {
                                    bgcolor: 'rgba(41, 121, 255, 0.08)',
                                    '& .stat-value': { color: 'primary.main' },
                                },
                            }}
                        >
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ letterSpacing: 1.2, fontSize: '0.62rem', fontWeight: 700 }}
                            >
                                {stat.label}
                            </Typography>
                            <Stack direction="row" spacing={0.75} alignItems="baseline">
                                <Typography
                                    variant="h5"
                                    className="stat-value"
                                    sx={{
                                        fontWeight: 800,
                                        color: 'text.primary',
                                        fontVariantNumeric: 'tabular-nums',
                                        transition: 'color 0.15s',
                                    }}
                                >
                                    {stat.value}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {stat.of}
                                </Typography>
                            </Stack>
                        </Box>
                    ))}

                    <Box sx={{ flex: 1 }} />

                    <Button
                        variant="contained"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => setEditingWeek(plannedWeek)}
                        sx={{ alignSelf: 'center', '&:focus': { outline: 'none' } }}
                    >
                        Log week {plannedWeek}
                    </Button>
                </Stack>
            </Box>

            {pace !== 'ok' && (
                <Alert
                    severity={pace === 'act' ? 'warning' : 'info'}
                    variant="outlined"
                    sx={{ mb: 4, borderRadius: 3 }}
                >
                    {pace === 'act'
                        ? `Three weeks running under ${UNDER_PACE_HOURS} hours. Cut Saturday's papers hour
                           first, then the Saturday project. Keep the mornings, the daily DSA and the daily
                           applications — those are the habits that carry the plan.`
                        : `Two weeks under ${UNDER_PACE_HOURS} hours. Just noting it.`}
                </Alert>
            )}

            {/* Milestone — the reason this week exists */}
            {featuredWeek.milestone && (
                <Box
                    sx={{
                        p: 2.5,
                        borderRadius: 3,
                        mb: 4,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        bgcolor: `${accent}0f`,
                        border: '1px solid',
                        borderColor: `${accent}44`,
                    }}
                >
                    <FlagRoundedIcon sx={{ color: accent }} />
                    <Box>
                        <Typography variant="caption" sx={{ color: accent, fontWeight: 800, letterSpacing: 1.2, fontSize: '0.62rem' }}>
                            THIS WEEK'S MILESTONE
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 700 }}>
                            {featuredWeek.milestone.replace(/\*/g, '').trim()}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* Days off → schedule */}
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                sx={{ letterSpacing: 1.5, display: 'block', mb: 1.5, fontSize: '0.7rem' }}
            >
                YOUR WEEK
            </Typography>
            <Box sx={{ mb: 2 }}>
                <DeepWorkDayPicker
                    deepWorkDay={deepWorkDay}
                    secondDayOff={secondDayOff}
                    onChangeDeepWorkDay={(day) => saveDeepWorkDay(plannedWeek, day)}
                    onChangeSecondDayOff={(day) => saveSecondDayOff(plannedWeek, day)}
                />
            </Box>
            <Box sx={{ mb: 5 }}>
                <WeekSchedule
                    deepWorkDay={deepWorkDay}
                    secondDayOff={secondDayOff}
                    today={phase === 'during' ? (weekdayOf(today) as Weekday) : undefined}
                />
            </Box>

            {/* The material — the whole point of the week */}
            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                sx={{ letterSpacing: 1.5, display: 'block', mb: 1.5, fontSize: '0.7rem' }}
            >
                WHAT TO LEARN THIS WEEK
            </Typography>
            <Box sx={{ mb: 5 }}>
                <ResourceList resources={resources} />
            </Box>

            {/* This week's DSA, live from the NeetCode hub */}
            {pattern && (
                <>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight="bold"
                        sx={{ letterSpacing: 1.5, display: 'block', mb: 1.5, fontSize: '0.7rem' }}
                    >
                        DAILY DSA · {featuredWeek.dsa.toUpperCase()}
                    </Typography>
                    <Box
                        onClick={() => navigate(`/dsa/${pattern.topicId}`)}
                        sx={{
                            p: 2.5,
                            borderRadius: 3,
                            mb: 5,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'rgba(255,255,255,0.08)',
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main' },
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <CodeRoundedIcon sx={{ color: '#4a90e2' }} />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {pattern.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                    {pattern.why}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={patternTotal > 0 ? (patternDone / patternTotal) * 100 : 0}
                                    sx={{
                                        mt: 1.5,
                                        height: 5,
                                        borderRadius: 3,
                                        bgcolor: 'rgba(255,255,255,0.06)',
                                        '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: '#4a90e2' },
                                    }}
                                />
                            </Box>
                            <Chip
                                label={`${patternDone}/${patternTotal}`}
                                size="small"
                                sx={{
                                    height: 24,
                                    fontWeight: 700,
                                    fontSize: '0.7rem',
                                    fontVariantNumeric: 'tabular-nums',
                                    color: 'text.secondary',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                }}
                            />
                            <ChevronRightRoundedIcon sx={{ color: 'text.disabled' }} />
                        </Stack>
                    </Box>
                </>
            )}

            <WeekLogDialog
                week={editingWeek}
                onClose={() => setEditingWeek(null)}
                onSaved={(isFirstTime) => setCelebrate(isFirstTime)}
            />
        </Box>
    );
};

export default ThisWeekPage;
