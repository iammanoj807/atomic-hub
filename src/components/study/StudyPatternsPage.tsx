import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Stack, Chip, LinearProgress, Tooltip } from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { dsaPatterns, dsaMethod, dsaMethodNote, dsaWeakSpotNote } from '../../data/studyPlan';
import { dsaCurriculum } from '../../data/dsaCurriculum';
import { subscribeToDSAProgress, type DSATopicProgress } from '../../services/firebaseService';
import StudyPageHeader from './StudyPageHeader';

/** Problem ids per topic, so a stale completion can never inflate a count. */
const problemIdsByTopic: Record<string, Set<string>> = {};
for (const phase of dsaCurriculum) {
    for (const section of phase.sections) {
        for (const topic of section.topics) {
            problemIdsByTopic[topic.id] = new Set(topic.problems.map(p => p.id));
        }
    }
}

/**
 * The DSA Tracker sheet, except the "Done" column is not a column you fill in —
 * it is the NeetCode hub's own data, so ticking a problem there is what moves
 * this. One source of truth for 150 problems.
 */
const StudyPatternsPage = () => {
    const navigate = useNavigate();
    const [progress, setProgress] = useState<Record<string, DSATopicProgress>>({});

    useEffect(() => {
        const unsubscribe = subscribeToDSAProgress(setProgress);
        return () => unsubscribe();
    }, []);

    // The sheet's "running total" column: how many of the 150 you have reached
    // by the end of each pattern. Accumulated through the list, not per row.
    const rows = dsaPatterns.reduce<
        (typeof dsaPatterns[number] & { total: number; completed: number; runningTotal: number })[]
    >((acc, pattern) => {
        const problemIds = problemIdsByTopic[pattern.topicId] ?? new Set<string>();
        const completed = (progress[pattern.topicId]?.completedProblems ?? [])
            .filter(id => problemIds.has(id)).length;

        acc.push({
            ...pattern,
            total: problemIds.size,
            completed,
            runningTotal: (acc[acc.length - 1]?.runningTotal ?? 0) + problemIds.size,
        });
        return acc;
    }, []);

    const totalProblems = rows.reduce((sum, row) => sum + row.total, 0);
    const totalDone = rows.reduce((sum, row) => sum + row.completed, 0);

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="DSA TRACKER"
                title={
                    <>
                        <Box component="span" sx={{ color: 'primary.main' }}>{totalDone}</Box>
                        {` of ${totalProblems} problems.`}
                    </>
                }
                subtitle="NeetCode 150 across the 26 weeks. Ticking a problem in the NeetCode hub moves this."
            />

            <Box sx={{ mb: 5 }}>
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
            </Box>

            {/* The method — it matters more than the problem count. */}
            <Box
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'rgba(255,255,255,0.08)',
                    mb: 4,
                }}
            >
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ letterSpacing: 1.4, fontWeight: 800, fontSize: '0.65rem' }}
                >
                    THE METHOD
                </Typography>
                <Stack spacing={1} sx={{ mt: 1.5, mb: 2 }}>
                    {dsaMethod.map((step, index) => (
                        <Box key={step} sx={{ display: 'flex', gap: 1.5 }}>
                            <Typography
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 800,
                                    width: 20,
                                    flexShrink: 0,
                                    fontVariantNumeric: 'tabular-nums',
                                }}
                            >
                                {index + 1}
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                {step}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
                <Typography variant="body2" sx={{ color: 'secondary.main', fontWeight: 600 }}>
                    {dsaMethodNote}
                </Typography>
            </Box>

            {/* Patterns */}
            <Stack spacing={1}>
                {rows.map(row => {
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
                                transition: 'border-color 0.15s, background-color 0.15s',
                                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(41, 121, 255, 0.04)' },
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
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: '0.85rem', mt: 0.25 }}
                                    >
                                        {row.why}
                                    </Typography>
                                </Box>

                                <Tooltip title={`${row.runningTotal} problems by the end of this pattern`}>
                                    <Chip
                                        label={`${row.completed}/${row.total}`}
                                        size="small"
                                        sx={{
                                            flexShrink: 0,
                                            height: 24,
                                            fontWeight: 700,
                                            fontSize: '0.7rem',
                                            fontVariantNumeric: 'tabular-nums',
                                            color: done ? '#66bb6a' : 'text.secondary',
                                            bgcolor: done ? 'rgba(102, 187, 106, 0.15)' : 'rgba(255,255,255,0.05)',
                                        }}
                                    />
                                </Tooltip>

                                <ChevronRightRoundedIcon sx={{ color: 'text.disabled', flexShrink: 0 }} />
                            </Stack>
                        </Box>
                    );
                })}
            </Stack>

            <Box
                sx={{
                    mt: 4,
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
    );
};

export default StudyPatternsPage;
