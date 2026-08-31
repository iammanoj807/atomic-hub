import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Tabs,
    Tab,
    Collapse,
    Checkbox,
    LinearProgress,
    Tooltip,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { useTaskContext } from '../../context/TaskContext';
import {
    planWeeks,
    projects,
    dsaPatterns,
    projectsNote,
    dsaWeakSpotNote,
    PHASE_COLORS,
    PROJECT_WEIGHT_LABELS,
    PROJECT_WEIGHT_COLORS,
    type PlanWeek,
} from '../../data/studyPlan';
import { getGateStatus } from '../../utils/studyProgress';
import { getWeekResources } from '../../data/studyResources';
import { dsaCurriculum } from '../../data/dsaCurriculum';
import { subscribeToDSAProgress, type DSATopicProgress } from '../../services/firebaseService';
import StudyPageHeader from './StudyPageHeader';
import WeekCard from './WeekCard';
import ResourceList from './ResourceList';

const problemIdsByTopic: Record<string, Set<string>> = {};
for (const phase of dsaCurriculum) {
    for (const section of phase.sections) {
        for (const topic of section.topics) {
            problemIdsByTopic[topic.id] = new Set(topic.problems.map(p => p.id));
        }
    }
}

const TAB_ORDER = ['weeks', 'projects', 'dsa'];

interface StageGroup {
    key: string;
    stage: number;
    stageName: string;
    /** Only the last week of a stage carries one, so it is lifted to the group. */
    gate?: string;
    isConsolidation: boolean;
    weeks: PlanWeek[];
}

interface PartGroup {
    part: string;
    stages: StageGroup[];
}

/**
 * The year as five parts, each a run of stages.
 *
 * Grouping is done by walking the weeks in order rather than by sorting on
 * stage number, because a consolidation week carries the number of the stage
 * it reviews and would otherwise fold back into it.
 */
const groupByPart = (weeks: PlanWeek[]): PartGroup[] => {
    const parts: PartGroup[] = [];

    for (const week of weeks) {
        let part = parts[parts.length - 1];
        if (!part || part.part !== week.part) {
            part = { part: week.part, stages: [] };
            parts.push(part);
        }

        const isConsolidation = week.phaseKey === 'consolidation';
        const key = `${week.part}-${week.stageName}`;
        let stage = part.stages[part.stages.length - 1];
        if (!stage || stage.key !== key) {
            stage = {
                key,
                stage: week.stage,
                stageName: week.stageName,
                isConsolidation,
                weeks: [],
            };
            part.stages.push(stage);
        }

        stage.weeks.push(week);
        if (week.gate) stage.gate = week.gate;
    }

    return parts;
};

/**
 * The whole year in one place: five parts of weeks, the nine things you will
 * have to show at the end, and the 150 problems. Three views of one journey
 * rather than three pages.
 */
const JourneyPage = () => {
    const navigate = useNavigate();
    const {
        currentWeekNumber, studyWeekLogs, completedProjectIds, toggleProject, gateAttempts,
    } = useTaskContext();

    // ?tab=projects / ?tab=dsa, so a number elsewhere in the app can link
    // straight to the view that explains it. An unrecognised value falls back
    // to the first tab rather than leaving the page with nothing rendered.
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedTab = TAB_ORDER.indexOf(searchParams.get('tab') ?? 'weeks');
    const tab = requestedTab === -1 ? 0 : requestedTab;
    const setTab = (value: number) =>
        setSearchParams(value === 0 ? {} : { tab: TAB_ORDER[value] }, { replace: true });

    const [openWeek, setOpenWeek] = useState<number | null>(currentWeekNumber);
    const [dsaProgress, setDsaProgress] = useState<Record<string, DSATopicProgress>>({});
    const currentWeekRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribe = subscribeToDSAProgress(setDsaProgress);
        return () => unsubscribe();
    }, []);

    const loggedWeeks = new Set(
        Object.values(studyWeekLogs).filter(log => log.actualHours != null).map(log => log.week)
    );

    const patternRows = dsaPatterns.reduce<
        (typeof dsaPatterns[number] & { total: number; completed: number })[]
    >((acc, pattern) => {
        const ids = problemIdsByTopic[pattern.topicId] ?? new Set<string>();
        acc.push({
            ...pattern,
            total: ids.size,
            completed: (dsaProgress[pattern.topicId]?.completedProblems ?? []).filter(id => ids.has(id)).length,
        });
        return acc;
    }, []);

    const totalDone = patternRows.reduce((sum, row) => sum + row.completed, 0);
    const totalProblems = patternRows.reduce((sum, row) => sum + row.total, 0);

    return (
        <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="THE JOURNEY"
                title={
                    currentWeekNumber
                        ? <>You are <Box component="span" sx={{ color: 'primary.main' }}>{Math.round(((currentWeekNumber - 1) / planWeeks.length) * 100)}%</Box> through.</>
                        : 'A year, laid out.'
                }
                subtitle="Every week, everything you have to show for it, and the 150 problems underneath."
            />

            <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                sx={{
                    mb: 3,
                    borderBottom: 1,
                    borderColor: 'rgba(255,255,255,0.08)',
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, '&:focus': { outline: 'none' } },
                }}
            >
                <Tab label={`${planWeeks.length} weeks`} />
                <Tab label={`Projects · ${completedProjectIds.length}/${projects.length}`} />
                <Tab label={`DSA · ${totalDone}/${totalProblems}`} />
            </Tabs>

            {/* ---- WEEKS ---- */}
            {tab === 0 && (
                <Box>
                    {groupByPart(planWeeks).map(part => (
                        <Box key={part.part} sx={{ mb: 5 }}>
                            <Typography
                                variant="h6"
                                fontWeight="bold"
                                sx={{
                                    color: 'text.primary',
                                    letterSpacing: 1.2,
                                    fontSize: '0.95rem',
                                    pb: 1,
                                    mb: 2.5,
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                }}
                            >
                                {part.part}
                            </Typography>

                            {part.stages.map(stageGroup => {
                                const accent = PHASE_COLORS[stageGroup.weeks[0].phaseKey];
                                const status = stageGroup.isConsolidation
                                    ? null
                                    : getGateStatus(gateAttempts, stageGroup.stage);
                                // A stage is only done when its gate is passed.
                                // Logging the hours is not the same as knowing it.
                                const stageComplete = status === 'passed';

                                return (
                                    <Box key={stageGroup.key} sx={{ mb: 4 }}>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1.5}
                                            sx={{ mb: 1 }}
                                            flexWrap="wrap"
                                            useFlexGap
                                        >
                                            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accent }} />
                                            <Typography
                                                variant="caption"
                                                sx={{ color: accent, letterSpacing: 1.5, fontWeight: 800, fontSize: '0.7rem' }}
                                            >
                                                {stageGroup.isConsolidation
                                                    ? stageGroup.stageName.toUpperCase()
                                                    : `STAGE ${stageGroup.stage} · ${stageGroup.stageName.toUpperCase()}`}
                                            </Typography>

                                            {status === 'passed' && (
                                                <Chip
                                                    size="small"
                                                    icon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
                                                    label="PASSED"
                                                    sx={{
                                                        height: 20, fontSize: '0.6rem', fontWeight: 800,
                                                        color: '#66bb6a', bgcolor: 'rgba(102,187,106,0.14)',
                                                        '& .MuiChip-icon': { color: '#66bb6a' },
                                                    }}
                                                />
                                            )}
                                            {status === 'failed' && (
                                                <Chip
                                                    size="small"
                                                    icon={<ReplayRoundedIcon sx={{ fontSize: 14 }} />}
                                                    label="REPEAT THE STAGE"
                                                    sx={{
                                                        height: 20, fontSize: '0.6rem', fontWeight: 800,
                                                        color: '#ff8a65', bgcolor: 'rgba(255,138,101,0.14)',
                                                        '& .MuiChip-icon': { color: '#ff8a65' },
                                                    }}
                                                />
                                            )}
                                            {status === 'unattempted' && (
                                                <Chip
                                                    size="small"
                                                    icon={<LockRoundedIcon sx={{ fontSize: 14 }} />}
                                                    label="GATE NOT SAT"
                                                    sx={{
                                                        height: 20, fontSize: '0.6rem', fontWeight: 800,
                                                        color: 'text.disabled', bgcolor: 'rgba(255,255,255,0.06)',
                                                        '& .MuiChip-icon': { color: 'inherit' },
                                                    }}
                                                />
                                            )}
                                        </Stack>

                                        {stageGroup.gate && (
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: stageComplete ? 'text.secondary' : 'text.primary',
                                                    fontStyle: 'italic',
                                                    mb: 1.5,
                                                    pl: 2.5,
                                                    lineHeight: 1.55,
                                                }}
                                            >
                                                {stageGroup.gate}
                                            </Typography>
                                        )}

                                        <Stack spacing={1}>
                                            {stageGroup.weeks.map(week => {
                                                const isOpen = openWeek === week.week;
                                                const isCurrent = week.week === currentWeekNumber;
                                                const isLogged = loggedWeeks.has(week.week);
                                                // Hours logged fills the square; only a passed
                                                // gate fills it in the stage's own colour.
                                                const solid = isLogged && (stageComplete || stageGroup.isConsolidation);

                                                return (
                                                    <Box
                                                        key={week.week}
                                                        ref={isCurrent ? currentWeekRef : undefined}
                                                    >
                                                        <Box
                                                            onClick={() => setOpenWeek(isOpen ? null : week.week)}
                                                            sx={{
                                                                p: 1.75,
                                                                borderRadius: 3,
                                                                cursor: 'pointer',
                                                                bgcolor: isCurrent ? 'rgba(41, 121, 255, 0.06)' : 'background.paper',
                                                                border: '1px solid',
                                                                borderColor: isCurrent ? 'primary.main' : 'rgba(255,255,255,0.08)',
                                                                borderLeft: '4px solid',
                                                                borderLeftColor: accent,
                                                                '&:hover': { borderColor: 'primary.main' },
                                                            }}
                                                        >
                                                            <Stack direction="row" alignItems="center" spacing={2}>
                                                                <Box
                                                                    sx={{
                                                                        width: 30,
                                                                        height: 30,
                                                                        borderRadius: 1.5,
                                                                        flexShrink: 0,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        justifyContent: 'center',
                                                                        fontSize: '0.72rem',
                                                                        fontWeight: 800,
                                                                        fontVariantNumeric: 'tabular-nums',
                                                                        bgcolor: solid ? accent : `${accent}1a`,
                                                                        color: solid ? '#0B0E14' : accent,
                                                                        border: isLogged && !solid ? '1px dashed' : 'none',
                                                                        borderColor: `${accent}80`,
                                                                    }}
                                                                >
                                                                    {week.week}
                                                                </Box>

                                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.4 }}
                                                                        noWrap={!isOpen}
                                                                    >
                                                                        {week.theory}
                                                                    </Typography>
                                                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                                        {week.dates} · {week.targetHours}h · {week.reading}
                                                                    </Typography>
                                                                </Box>

                                                                {week.milestone && (
                                                                    <Tooltip title={week.milestone.replace(/\*/g, '').trim()}>
                                                                        <FlagRoundedIcon sx={{ fontSize: 18, color: accent, flexShrink: 0 }} />
                                                                    </Tooltip>
                                                                )}
                                                                {isOpen
                                                                    ? <ExpandLessRoundedIcon sx={{ color: 'text.disabled' }} />
                                                                    : <ExpandMoreRoundedIcon sx={{ color: 'text.disabled' }} />}
                                                            </Stack>
                                                        </Box>

                                                        <Collapse in={isOpen} timeout="auto" unmountOnExit>
                                                            <Stack spacing={2} sx={{ mt: 1.5, mb: 2, pl: { sm: 2 } }}>
                                                                <WeekCard week={week} />
                                                                <ResourceList resources={getWeekResources(week.week)} />
                                                            </Stack>
                                                        </Collapse>
                                                    </Box>
                                                );
                                            })}
                                        </Stack>
                                    </Box>
                                );
                            })}
                        </Box>
                    ))}
                </Box>
            )}

            {/* ---- PROJECTS ---- */}
            {tab === 1 && (
                <Box>
                    <Stack spacing={1.5}>
                        {projects.map(project => {
                            const isDone = completedProjectIds.includes(project.id);
                            const isLate = !isDone && currentWeekNumber !== null && currentWeekNumber > project.byWeek;
                            const accent = project.weight ? PROJECT_WEIGHT_COLORS[project.weight] : null;

                            return (
                                <Box
                                    key={project.id}
                                    sx={{
                                        p: { xs: 2, sm: 2.5 },
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: isDone ? 'rgba(102, 187, 106, 0.4)' : 'rgba(255,255,255,0.08)',
                                        borderLeft: accent ? '4px solid' : '1px solid',
                                        borderLeftColor: accent ?? 'rgba(255,255,255,0.08)',
                                        opacity: isDone ? 0.75 : 1,
                                    }}
                                >
                                    <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                        <Checkbox
                                            checked={isDone}
                                            onChange={() => toggleProject(project.id)}
                                            icon={<RadioButtonUncheckedRoundedIcon />}
                                            checkedIcon={<CheckCircleRoundedIcon />}
                                            inputProps={{ 'aria-label': `Mark ${project.name} finished` }}
                                            sx={{
                                                p: 0.5,
                                                color: 'text.disabled',
                                                '&.Mui-checked': { color: '#66bb6a' },
                                                '&:focus': { outline: 'none' },
                                            }}
                                        />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{
                                                        fontWeight: 700,
                                                        color: 'text.primary',
                                                        textDecoration: isDone ? 'line-through' : 'none',
                                                    }}
                                                >
                                                    {project.number}. {project.name}
                                                </Typography>
                                                <Chip
                                                    label={`Week ${project.byWeek}`}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.62rem',
                                                        fontWeight: 700,
                                                        color: isLate ? '#ff8a65' : 'text.secondary',
                                                        bgcolor: isLate ? 'rgba(255, 138, 101, 0.15)' : 'rgba(255,255,255,0.05)',
                                                    }}
                                                />
                                                {project.weight && (
                                                    <Chip
                                                        label={PROJECT_WEIGHT_LABELS[project.weight]}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: '0.62rem',
                                                            fontWeight: 700,
                                                            color: PROJECT_WEIGHT_COLORS[project.weight],
                                                            bgcolor: `${PROJECT_WEIGHT_COLORS[project.weight]}1f`,
                                                        }}
                                                    />
                                                )}
                                            </Stack>
                                            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.55 }}>
                                                {project.proves}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                                                {project.pipeline.publish}
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ mt: 3, pb: 2, lineHeight: 1.7 }}>
                        {projectsNote}
                    </Typography>
                </Box>
            )}

            {/* ---- DSA ---- */}
            {tab === 2 && (
                <Box>
                    <Box sx={{ mb: 3 }}>
                        <LinearProgress
                            variant="determinate"
                            value={totalProblems > 0 ? (totalDone / totalProblems) * 100 : 0}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                bgcolor: 'rgba(255,255,255,0.06)',
                                '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'primary.main' },
                            }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: '0.8rem' }}>
                            Ticking a problem in the NeetCode hub is what moves this — there is no second checklist.
                        </Typography>
                    </Box>

                    <Stack spacing={1}>
                        {patternRows.map(row => {
                            const done = row.total > 0 && row.completed === row.total;

                            return (
                                <Box
                                    key={row.topicId}
                                    onClick={() => navigate(`/dsa/${row.topicId}`)}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: done ? 'rgba(102, 187, 106, 0.4)' : 'rgba(255,255,255,0.08)',
                                        cursor: 'pointer',
                                        '&:hover': { borderColor: 'primary.main' },
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ width: 56, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                                        >
                                            Wk {row.weeks}
                                        </Typography>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" alignItems="center" spacing={1}>
                                                <Typography
                                                    variant="body1"
                                                    sx={{ fontWeight: 700, color: done ? '#66bb6a' : 'text.primary' }}
                                                >
                                                    {row.name}
                                                </Typography>
                                                {row.weakSpot && (
                                                    <Tooltip title="Almost everyone is weak here. Do not skip it.">
                                                        <WarningAmberRoundedIcon sx={{ fontSize: 16, color: '#ff8a65' }} />
                                                    </Tooltip>
                                                )}
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                                                {row.why}
                                            </Typography>
                                        </Box>
                                        <Chip
                                            label={`${row.completed}/${row.total}`}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                fontWeight: 700,
                                                fontSize: '0.7rem',
                                                fontVariantNumeric: 'tabular-nums',
                                                color: done ? '#66bb6a' : 'text.secondary',
                                                bgcolor: done ? 'rgba(102, 187, 106, 0.15)' : 'rgba(255,255,255,0.05)',
                                            }}
                                        />
                                        <ChevronRightRoundedIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>

                    <Box
                        sx={{
                            mt: 3,
                            mb: 2,
                            p: 2.5,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'rgba(255, 138, 101, 0.35)',
                            bgcolor: 'rgba(255, 138, 101, 0.06)',
                        }}
                    >
                        <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                            {dsaWeakSpotNote}
                        </Typography>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default JourneyPage;
