// This Week answers one question: what do I owe by Sunday?
//
//   Today     = the next hour.
//   This week = what I owe by Sunday.
//   Journey   = where I am in the year.
//
// If a component answers a different one of those three questions than the
// page it sits on, it is on the wrong page. The 52-square strip and the
// year-to-date totals used to live here; they answer the third question, so
// they moved to Journey.

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
    getPaceState,
    UNDER_PACE_HOURS,
} from '../../utils/studyPlan';
import { weekdayOf } from '../../utils/studySchedule';
import {
    planWeeks,
    dsaPatterns,
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
import StudyPageHeader from './StudyPageHeader';
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

const ThisWeekPage = () => {
    const navigate = useNavigate();
    const {
        studyWeekLogs,
        currentWeekNumber,
        getDeepWorkDay,
        saveDeepWorkDay,
        getSecondDayOff,
        saveSecondDayOff,
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

    const pace = getPaceState(studyWeekLogs, currentWeekNumber);

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

            <StudyPageHeader
                eyebrow="THIS WEEK"
                title={`Week ${featuredWeek.week} · ${featuredWeek.stageName}`}
                subtitle="What you owe by Sunday. Open this Monday morning and Thursday morning."
                action={
                    <Button
                        variant="contained"
                        startIcon={<EditRoundedIcon />}
                        onClick={() => setEditingWeek(plannedWeek)}
                        sx={{ '&:focus': { outline: 'none' } }}
                    >
                        Log week {plannedWeek}
                    </Button>
                }
            />

            {/* One line on what the week is actually being measured against. */}
            <Typography variant="body1" sx={{ color: 'text.primary', mb: 3, lineHeight: 1.65 }}>
                {featuredWeek.gate
                    ? <>Gate week. You do not move on until you can: <Box component="span" sx={{ fontWeight: 700 }}>{featuredWeek.gate}</Box></>
                    : `No gate this week. Build toward artifact ${currentArtifact.number}, due week ${currentArtifact.byWeek}.`}
            </Typography>

            {/* What this week is FOR, before anything about how it is going. */}
            <StageBanner week={featuredWeek} />

            {/* Errands, not slots — they belong to the week, not to a time in it. */}
            {featuredWeek.oneOffTasks && (
                <OneOffTasks week={featuredWeek.week} tasks={featuredWeek.oneOffTasks} />
            )}

            {/* The gate is the week's real test, so it sits above the habits. */}
            {featuredWeek.gate && (
                <GateCard
                    stage={featuredWeek.stage}
                    stageName={featuredWeek.stageName}
                    gate={featuredWeek.gate}
                    today={today}
                />
            )}

            <ReadingCard weekNumber={featuredWeek.week} today={today} />

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
