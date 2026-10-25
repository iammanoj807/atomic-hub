import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Tooltip,
    Button,
    Collapse,
    LinearProgress,
    ButtonBase,
} from '@mui/material';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import StyleRoundedIcon from '@mui/icons-material/StyleRounded';
import AccountTreeRoundedIcon from '@mui/icons-material/AccountTreeRounded';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';

import { dsaCurriculum, getTotalTopics, getTotalProblems } from '../data/dsaCurriculum';
import type { DSATopic } from '../data/dsaCurriculum';
import { getPatternGuide } from '../data/dsaPatterns';
import { useTaskContext } from '../context/TaskContext';
import { useDSAProgress } from '../hooks/useDSAProgress';
import { usePatternDrill } from '../hooks/usePatternDrill';
import { todaysDrill } from '../utils/dsaStudied';
import { getLondonDateString } from '../utils/date';
import { ReviewToday } from './dsa/DSAReviewParts';

const topics = dsaCurriculum.flatMap(phase => phase.sections.flatMap(section => section.topics));

/** How to learn with this hub so it stays learnt, behind a button until asked for. */
const HOW_TO_LEARN = [
    'One topic at a time: read steps 1 to 4 of its lesson (the idea, the words that signal it, the template, the traced examples).',
    'Solve two or three of its problems, easiest first. Read the question, say the pattern and the trick out loud, and only then Show answer. Give each problem 20 to 30 minutes before you look at a solution.',
    "Tick a problem once you've solved it. It comes back in Review today tomorrow, then after 3, 7, 14 and 30 days, then every month. Each time, solve it again from a blank editor: reading your old code doesn't count.",
    "Do today's reviews before anything new. They mix topics on purpose: an interview never tells you which pattern a question is.",
    'Five minutes of the pattern drill a day keeps "which pattern is this?" quick, across every topic you have studied.',
];

const DSAHubPage = () => {
    const navigate = useNavigate();
    const { isAdmin, dsaStreak } = useTaskContext();
    const { progress, loaded: progressLoaded } = useDSAProgress();
    const { cards: drillCards, loaded: drillLoaded } = usePatternDrill();
    const today = getLondonDateString();
    // Counted exactly as the drill counts its default session, so the two always agree.
    const drillToday = progressLoaded && drillLoaded ? todaysDrill(drillCards, progress, today).length : null;
    const [showHow, setShowHow] = useState(false);

    const openTopic = (topicId: string) => navigate(`/dsa/${topicId}`);

    // Only count completions for problems that still exist in the curriculum
    const solvedIn = (topic: DSATopic) => {
        const solved = progress[topic.id]?.completedProblems ?? [];
        return topic.problems.filter(problem => solved.includes(problem.id)).length;
    };
    const totalTopics = getTotalTopics();
    const totalProblems = getTotalProblems();
    const completedProblemsCount = topics.reduce((sum, topic) => sum + solvedIn(topic), 0);
    const overallProgress = totalProblems > 0
        ? Math.round((completedProblemsCount / totalProblems) * 100)
        : 0;

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', pb: 4, px: { xs: 1, sm: 0 }, overflowX: 'hidden' }}>
            {/* Header */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
            >
                <Stack direction="row" alignItems="center" spacing={1}>
                    <SchoolRoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
                    <Typography variant="h4" fontWeight="bold" color="text.primary">
                        NeetCode 150
                    </Typography>
                    {dsaStreak > 0 && (
                        <Tooltip title="DSA Daily Streak">
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.75,
                                ml: 2,
                                px: 1.5,
                                py: 0.75,
                                borderRadius: 2,
                            }}>
                                <LocalFireDepartmentRoundedIcon sx={{
                                    fontSize: 32,
                                    color: '#FF9800',
                                    filter: 'drop-shadow(0 0 6px rgba(255, 160, 0, 0.5))',
                                }} />
                                <Typography variant="h5" fontWeight="bold" sx={{
                                    color: 'transparent',
                                    background: 'linear-gradient(135deg, #FFEB3B, #FF9800, #F44336)',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}>
                                    {dsaStreak}
                                </Typography>
                            </Box>
                        </Tooltip>
                    )}
                </Stack>
                <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">
                        {overallProgress}%
                    </Typography>
                </Box>
            </Stack>

            {/* Solved problems coming back to be solved again */}
            <ReviewToday progress={progress} progressLoaded={progressLoaded} today={today} canRate={isAdmin} onOpenTopic={openTopic} />

            {/* How to learn it so it stays learnt */}
            <Box sx={{ mb: 2, mt: -1.5 }}>
                <Button
                    onClick={() => setShowHow(open => !open)}
                    aria-expanded={showHow}
                    endIcon={showHow ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                    sx={{ minHeight: 44, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                >
                    The best way to learn DSA here
                </Button>
                <Collapse in={showHow}>
                    <Stack component="ol" spacing={1} sx={{ m: 0, mt: 0.5, pl: 3, maxWidth: 760 }}>
                        {HOW_TO_LEARN.map(step => (
                            <Typography key={step} component="li" variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                                {step}
                            </Typography>
                        ))}
                    </Stack>
                </Collapse>
            </Box>

            {/* Recognition: the drill and the cheat sheet */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 1.5, mb: 3 }}>
                {[
                    {
                        to: '/dsa/drill',
                        icon: <StyleRoundedIcon />,
                        title: drillToday === null ? 'Pattern drill' : `Pattern drill — ${drillToday} cards today`,
                        note: 'Read a problem, name the pattern. Five minutes a day.',
                        colour: '#4dd0e1',
                    },
                    {
                        to: '/dsa/patterns',
                        icon: <AccountTreeRoundedIcon />,
                        title: 'Which pattern? cheat sheet',
                        note: 'Three questions, two diagrams, every pattern at a glance.',
                        colour: '#ffca28',
                    },
                    {
                        to: '/dsa/interview',
                        icon: <RecordVoiceOverRoundedIcon />,
                        title: 'Coding interview questions',
                        note: 'How to approach any problem, and the fundamentals they ask, with answers.',
                        colour: '#ce93d8',
                    },
                ].map(link => (
                    <ButtonBase
                        key={link.to}
                        onClick={() => navigate(link.to)}
                        sx={{
                            minHeight: 64,
                            p: 2,
                            borderRadius: 2,
                            justifyContent: 'flex-start',
                            textAlign: 'left',
                            gap: 1.5,
                            bgcolor: `${link.colour}12`,
                            border: '1px solid',
                            borderColor: `${link.colour}55`,
                            '&:hover': { bgcolor: `${link.colour}22` },
                        }}
                    >
                        <Box sx={{ color: link.colour, display: 'flex', flexShrink: 0 }}>{link.icon}</Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography fontWeight={800} color="text.primary" sx={{ fontSize: '1.05rem', lineHeight: 1.3 }}>
                                {link.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {link.note}
                            </Typography>
                        </Box>
                    </ButtonBase>
                ))}
            </Box>

            {/* Stats Summary */}
            <Box
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: 1,
                    borderColor: 'rgba(255,255,255,0.08)',
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: 2,
                }}
            >
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">{totalProblems}</Typography>
                    <Typography variant="caption" color="text.secondary">Problems</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">{totalTopics}</Typography>
                    <Typography variant="caption" color="text.secondary">Topics</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="success.main">{completedProblemsCount}</Typography>
                    <Typography variant="caption" color="text.secondary">Solved</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold" color="primary.main">{overallProgress}%</Typography>
                    <Typography variant="caption" color="text.secondary">Progress</Typography>
                </Box>
            </Box>

            {/* Topic List: each opens its lesson, where its problems are */}
            <Box sx={{
                borderRadius: 3,
                border: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                bgcolor: 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
            }}>
                {topics.map(topic => {
                    const completed = solvedIn(topic);
                    const total = topic.problems.length;
                    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
                    const isComplete = percentage === 100 && total > 0;
                    const hook = getPatternGuide(topic.id)?.hook;

                    return (
                        <ButtonBase
                            key={topic.id}
                            onClick={() => openTopic(topic.id)}
                            sx={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                textAlign: 'left',
                                py: { xs: 1.5, sm: 2 },
                                px: { xs: 1.5, sm: 3 },
                                borderBottom: '1px solid rgba(255,255,255,0.06)',
                                transition: 'background 0.15s',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.035)' },
                            }}
                        >
                            <Box sx={{ flex: 1, minWidth: 0, pr: 1 }}>
                                <Typography
                                    sx={{
                                        fontWeight: 700,
                                        color: isComplete ? 'success.main' : 'text.primary',
                                        fontSize: { xs: '1.1rem', sm: '1.3rem' },
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    {topic.title}
                                </Typography>
                                {hook && (
                                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.8rem', sm: '0.85rem' }, lineHeight: 1.4 }}>
                                        {hook}
                                    </Typography>
                                )}
                            </Box>
                            <Typography
                                sx={{
                                    color: isComplete ? 'success.main' : 'text.secondary',
                                    fontWeight: 700,
                                    mr: { xs: 1.5, sm: 3 },
                                    fontSize: { xs: '0.9rem', sm: '1rem' },
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                {completed} / {total}
                            </Typography>
                            <Box sx={{ width: { xs: 60, sm: 180 }, flexShrink: 0 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={percentage}
                                    sx={{
                                        height: 7,
                                        borderRadius: 4,
                                        bgcolor: 'rgba(255,255,255,0.08)',
                                        '& .MuiLinearProgress-bar': {
                                            borderRadius: 4,
                                            bgcolor: isComplete ? '#4caf50' : '#ff9800',
                                        },
                                    }}
                                />
                            </Box>
                            <ChevronRightRoundedIcon sx={{ color: 'text.secondary', ml: { xs: 0.5, sm: 1.5 }, flexShrink: 0 }} />
                        </ButtonBase>
                    );
                })}
            </Box>
        </Box>
    );
};

export default DSAHubPage;
