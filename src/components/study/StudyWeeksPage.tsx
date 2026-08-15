import { useRef } from 'react';
import { Box, Typography, Stack, Button, Chip } from '@mui/material';
import MyLocationRoundedIcon from '@mui/icons-material/MyLocationRounded';
import { useTaskContext } from '../../context/TaskContext';
import { planWeeks, PHASE_COLORS, type PlanWeek } from '../../data/studyPlan';
import StudyPageHeader from './StudyPageHeader';
import WeekCard from './WeekCard';

/** Groups consecutive weeks that share a phase, preserving order. */
const groupByPhase = (weeks: PlanWeek[]): { phase: string; weeks: PlanWeek[] }[] => {
    const groups: { phase: string; weeks: PlanWeek[] }[] = [];

    for (const week of weeks) {
        const current = groups[groups.length - 1];
        if (current && current.phase === week.phase) {
            current.weeks.push(week);
        } else {
            groups.push({ phase: week.phase, weeks: [week] });
        }
    }

    return groups;
};

const StudyWeeksPage = () => {
    const { currentWeekNumber } = useTaskContext();
    const currentWeekRef = useRef<HTMLDivElement>(null);

    const groups = groupByPhase(planWeeks);

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="26 WEEK PLAN"
                title="The whole road."
                subtitle="Mornings are Track A. Friday is the anchor. Saturday is Track B. DSA is every single day."
                action={
                    currentWeekNumber !== null && (
                        <Button
                            variant="outlined"
                            startIcon={<MyLocationRoundedIcon />}
                            onClick={() =>
                                currentWeekRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                            }
                            sx={{
                                borderColor: 'rgba(255,255,255,0.15)',
                                color: 'text.primary',
                                '&:hover': { borderColor: 'primary.main' },
                                '&:focus': { outline: 'none' },
                            }}
                        >
                            Jump to week {currentWeekNumber}
                        </Button>
                    )
                }
            />

            {groups.map(group => {
                const accent = PHASE_COLORS[group.weeks[0].phaseKey];

                return (
                    <Box key={`${group.phase}-${group.weeks[0].week}`} sx={{ mb: 5 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
                            <Typography
                                variant="caption"
                                sx={{ color: accent, letterSpacing: 1.5, fontWeight: 800, fontSize: '0.7rem' }}
                            >
                                {group.phase.replace(/\*/g, '').trim().toUpperCase()}
                            </Typography>
                            <Chip
                                label={
                                    group.weeks.length === 1
                                        ? `Week ${group.weeks[0].week}`
                                        : `Weeks ${group.weeks[0].week}-${group.weeks[group.weeks.length - 1].week}`
                                }
                                size="small"
                                sx={{
                                    height: 20,
                                    fontSize: '0.65rem',
                                    color: 'text.secondary',
                                    bgcolor: 'rgba(255,255,255,0.05)',
                                }}
                            />
                        </Stack>

                        <Stack spacing={2}>
                            {group.weeks.map(week => (
                                <Box
                                    key={week.week}
                                    ref={week.week === currentWeekNumber ? currentWeekRef : undefined}
                                >
                                    <WeekCard week={week} highlighted={week.week === currentWeekNumber} />
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                );
            })}
        </Box>
    );
};

export default StudyWeeksPage;
