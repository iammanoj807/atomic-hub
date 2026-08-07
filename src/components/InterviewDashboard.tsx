import { useMemo } from 'react';
import { Box, Typography, Stack, Card, CardContent, Tooltip } from '@mui/material';
import { useTaskContext } from '../context/TaskContext';
import { getLondonDateString } from '../utils/date';
import { computeReadiness, COVERAGE_MIN_REPS, FRESHNESS_WINDOW_DAYS } from '../utils/practice';
import ColdShot from './ColdShot';
import { getTipForDate } from '../data/interviewTips';

const InterviewDashboard = () => {
    const {
        tasks,
        practiceRecords,
    } = useTaskContext();

    const today = getLondonDateString();

    // Company Questions are per-company prep, not the core story set the
    // readiness numbers are about.
    const globalTasks = useMemo(
        () => tasks.filter(t => t.category !== 'Company Questions'),
        [tasks]
    );
    
    const readiness = computeReadiness(globalTasks, practiceRecords, today);

    // Cold shot draws from all global tasks.
    const coldShotCandidates = globalTasks;

    const tip = getTipForDate(today);

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            {/* Two honest numbers. Each one can fall as well as rise. */}
            <Box sx={{ mb: 6, pb: 3, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight="bold"
                        sx={{ letterSpacing: 1.5, fontSize: '0.65rem' }}
                    >
                        PREPARATION STATUS
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={{ xs: 3, sm: 6 }} flexWrap="wrap" useFlexGap>
                    <Tooltip title={`Questions practised out loud at least ${COVERAGE_MIN_REPS} times`}>
                        <Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: 'primary.main', lineHeight: 1.1 }}>
                                {readiness.coverage}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                                COVERAGE
                            </Typography>
                        </Box>
                    </Tooltip>

                    <Tooltip title={`Questions practised in the last ${FRESHNESS_WINDOW_DAYS} days`}>
                        <Box>
                            <Typography variant="h3" fontWeight="bold" sx={{ color: '#00e5ff', lineHeight: 1.1 }}>
                                {readiness.freshness}%
                            </Typography>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                                FRESHNESS
                            </Typography>
                        </Box>
                    </Tooltip>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, opacity: 0.8 }}>
                    {readiness.practisedCount} of {readiness.totalCount} questions said out loud at least once.
                </Typography>
            </Box>

            {/* One unprepared question, cold. Trains recall under surprise. */}
            <Box sx={{ mb: 6 }}>
                <ColdShot candidates={coldShotCandidates} />
            </Box>

            {/* Tips Section - Centered card */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Card sx={{
                    maxWidth: 600,
                    width: '100%',
                    bgcolor: 'background.paper',
                    border: 1,
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: 2,
                    boxShadow: 'none',
                }}>
                    <CardContent sx={{ p: 3 }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight="bold"
                            sx={{ letterSpacing: 1.5, display: 'block', mb: 2, fontSize: '0.95rem' }}
                        >
                            INTERVIEW TIP: {tip.heading} 💡
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {tip.body}
                        </Typography>
                    </CardContent>
                </Card>
            </Box>
        </Box>
    );
}

export default InterviewDashboard;
