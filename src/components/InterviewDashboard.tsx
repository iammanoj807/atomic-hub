import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Card, CardContent, Tooltip, ButtonBase } from '@mui/material';
import { useTaskContext } from '../context/TaskContext';
import { getLondonDateString } from '../utils/date';
import { computeReadiness, COVERAGE_MIN_REPS, FRESHNESS_WINDOW_DAYS } from '../utils/practice';
import ColdShot from './ColdShot';
import { getTipForDate } from '../data/interviewTips';
import { genAiInterviewSet } from '../data/interviewPrep/genai';
import { mlInterviewSet } from '../data/interviewPrep/ml';
import { sqlInterviewSet } from '../data/interviewPrep/sql';
import { systemDesignInterviewSet } from '../data/interviewPrep/systemDesign';
import { dsaInterviewSet } from '../data/interviewPrep/dsa';

/** The technical questions live on each study page, in its Interview mode. */
const TECHNICAL = [
    { to: '/foundations?mode=interview', title: 'ML, LLMs and RAG', count: genAiInterviewSet.questions.length + mlInterviewSet.questions.length, colour: '#b39ddb' },
    { to: '/system-design?mode=interview', title: 'System design', count: systemDesignInterviewSet.questions.length, colour: '#4dd0e1' },
    { to: '/sql?mode=interview', title: 'SQL', count: sqlInterviewSet.questions.length, colour: '#ffb74d' },
    { to: '/dsa/interview', title: 'Coding (DSA)', count: dsaInterviewSet.questions.length, colour: '#81c784' },
];

const InterviewDashboard = () => {
    const navigate = useNavigate();
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

            {/* Technical questions: answer out loud, then compare. */}
            <Box sx={{ mb: 6 }}>
                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.5, fontSize: '0.65rem', display: 'block', mb: 0.5 }}>
                    TECHNICAL INTERVIEW QUESTIONS
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    The behavioural questions are below. The technical ones, with answers, analogies, diagrams and the "it broke, what do you do?" scenarios, are here:
                </Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                    {TECHNICAL.map(item => (
                        <ButtonBase
                            key={item.to}
                            onClick={() => navigate(item.to)}
                            sx={{
                                minHeight: 72, p: 1.75, borderRadius: 2, justifyContent: 'flex-start', textAlign: 'left',
                                bgcolor: `${item.colour}12`, border: '1px solid', borderColor: `${item.colour}55`,
                                '&:hover': { bgcolor: `${item.colour}22` },
                            }}
                        >
                            <Box>
                                <Typography fontWeight={800} color="text.primary" sx={{ lineHeight: 1.3 }}>{item.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{item.count} questions</Typography>
                            </Box>
                        </ButtonBase>
                    ))}
                </Box>
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
