import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Checkbox,
    Chip,
    Collapse,
    Tooltip,
    Button,
    LinearProgress,
    TextField,
    Popover,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

import { dsaCurriculum, getTotalTopics, getTotalProblems } from '../data/dsaCurriculum';
import type { DSATopic } from '../data/dsaCurriculum';
import { dsaTopicContent } from '../data/dsaContent';
import {
    subscribeToDSAProgress,
    toggleDSAProblemCompletion,
    setPracticeDateForProblem,
    type DSATopicProgress
} from '../services/firebaseService';
import { useTaskContext } from '../context/TaskContext';

// Extract all Hard problem titles from dsaTopicContent for difficulty display
const hardProblemTitles = new Set<string>();
Object.values(dsaTopicContent).forEach(category => {
    category.practiceProblems.hard.forEach((problem: any) => {
        if (problem.title) hardProblemTitles.add(problem.title);
    });
});

// Each entry is either a single topic or a group of topics displayed as one
interface DisplayEntry {
    label: string;           // Display name
    topicIds: string[];      // One or more topic IDs from curriculum
}

const displayEntries: DisplayEntry[] = dsaCurriculum.flatMap(phase =>
    phase.sections.flatMap(sec =>
        sec.topics.map(topic => ({
            label: topic.title,
            topicIds: [topic.id]
        }))
    )
);

function findTopicById(topicId: string): DSATopic | null {
    for (const phase of dsaCurriculum) {
        for (const section of phase.sections) {
            for (const topic of section.topics) {
                if (topic.id === topicId) return topic;
            }
        }
    }
    return null;
}

function getEntryProgress(entry: DisplayEntry, progress: Record<string, DSATopicProgress>) {
    let completed = 0, total = 0;
    entry.topicIds.forEach(topicId => {
        const topic = findTopicById(topicId);
        if (!topic) return;
        const completedList = progress[topicId]?.completedProblems || [];
        const problemIds = new Set(topic.problems.map(p => p.id));
        completed += completedList.filter(id => problemIds.has(id)).length;
        total += topic.problems.length;
    });
    return { completed, total, percentage: total > 0 ? Math.round((completed / total) * 100) : 0 };
}

/** Returns ISO date string N days from now. */
function addDays(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

/** Formats an ISO date string as e.g. "Aug 10" */
function formatDate(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Returns how many days until a date. Negative = overdue. */
function daysUntil(iso: string): number {
    const target = new Date(iso + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

/** Practice buttons shown next to each problem. */
const PracticeButtons = ({
    topicId,
    problemId,
    scheduledDate,
    isAdmin,
    isCompleted,
    onCompleteProblem,
}: {
    topicId: string;
    problemId: string;
    scheduledDate?: string;
    isAdmin: boolean;
    isCompleted: boolean;
    onCompleteProblem: (topicId: string, problemId: string) => void;
}) => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [customDays, setCustomDays] = useState('');

    let activeTab = 'none';
    let remaining = 0;
    if (scheduledDate) {
        remaining = daysUntil(scheduledDate);
        if (remaining <= 4) activeTab = '3';
        else if (remaining <= 8) activeTab = '7';
        else activeTab = 'custom';
    }

    if (!isAdmin) return null;

    const handleSet = async (days: number) => {
        if (activeTab === String(days)) {
            // Already active, so toggle it off
            await setPracticeDateForProblem(topicId, problemId, null);
        } else {
            await setPracticeDateForProblem(topicId, problemId, addDays(days));
            if (!isCompleted) {
                onCompleteProblem(topicId, problemId);
            }
        }
    };

    const handleCustom = async () => {
        const d = parseInt(customDays, 10);
        if (d > 0) {
            if (activeTab === 'custom' && scheduledDate && daysUntil(scheduledDate) === d) {
                // If they set exactly the same custom days again, toggle off
                await setPracticeDateForProblem(topicId, problemId, null);
            } else {
                await setPracticeDateForProblem(topicId, problemId, addDays(d));
                if (!isCompleted) {
                    onCompleteProblem(topicId, problemId);
                }
            }
            setCustomDays('');
            setAnchorEl(null);
        }
    };



    const renderTooltip = (child: React.ReactElement, isActive: boolean) => {
        if (!isActive || !scheduledDate) return child;
        const isOverdue = remaining <= 0;
        const title = isOverdue ? 'Due now!' : `Practice: ${formatDate(scheduledDate)} (${remaining}d)`;
        return (
            <Tooltip title={title} arrow placement="top">
                {child}
            </Tooltip>
        );
    };

    return (
        <Stack direction="row" spacing={0.5} alignItems="center">
            {[3, 7].map(d => {
                const isActive = activeTab === String(d);
                return renderTooltip(
                    <Chip
                        key={d}
                        label={`${d}d`}
                        size="small"
                        onClick={() => handleSet(d)}
                        sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: isActive ? '#fff' : 'text.secondary',
                            bgcolor: isActive ? '#4caf50' : 'rgba(255,255,255,0.05)',
                            border: '1px solid',
                            borderColor: isActive ? '#388e3c' : 'rgba(255,255,255,0.1)',
                            '&:hover': { 
                                bgcolor: isActive ? '#43a047' : 'rgba(74,144,226,0.15)', 
                                borderColor: isActive ? '#388e3c' : 'primary.main', 
                                color: isActive ? '#fff' : 'primary.main' 
                            },
                            transition: 'all 0.15s',
                        }}
                    />,
                    isActive
                );
            })}
            
            {renderTooltip(
                <Chip
                    label="…"
                    size="small"
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                        height: 22,
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: activeTab === 'custom' ? '#fff' : 'text.secondary',
                        bgcolor: activeTab === 'custom' ? '#4caf50' : 'rgba(255,255,255,0.05)',
                        border: '1px solid',
                        borderColor: activeTab === 'custom' ? '#388e3c' : 'rgba(255,255,255,0.1)',
                        '&:hover': { 
                            bgcolor: activeTab === 'custom' ? '#43a047' : 'rgba(74,144,226,0.15)', 
                            borderColor: activeTab === 'custom' ? '#388e3c' : 'primary.main', 
                            color: activeTab === 'custom' ? '#fff' : 'primary.main' 
                        },
                        transition: 'all 0.15s',
                    }}
                />,
                activeTab === 'custom'
            )}
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
            >
                <Stack direction="row" spacing={1} sx={{ p: 1.5, alignItems: 'center' }}>
                    <TextField
                        size="small"
                        type="number"
                        placeholder="days"
                        value={customDays}
                        onChange={e => setCustomDays(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleCustom(); }}
                        sx={{ width: 80, '& input': { py: 0.5, fontSize: '0.85rem' } }}
                    />
                    <Button size="small" variant="contained" onClick={handleCustom} disabled={!customDays || parseInt(customDays) <= 0} sx={{ minWidth: 50, py: 0.3 }}>
                        Set
                    </Button>
                </Stack>
            </Popover>
        </Stack>
    );
};


const DSAHubPage = () => {
    const navigate = useNavigate();
    const { isAdmin } = useTaskContext();
    const [progress, setProgress] = useState<Record<string, DSATopicProgress>>({});
    const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());

    const toggleTopic = (topicId: string) => {
        setExpandedTopics(prev => {
            const next = new Set(prev);
            if (next.has(topicId)) next.delete(topicId);
            else next.add(topicId);
            return next;
        });
    };

    // Subscribe to progress updates
    useEffect(() => {
        const unsubscribe = subscribeToDSAProgress(setProgress);
        return () => unsubscribe();
    }, []);

    // Calculate stats
    const totalTopics = getTotalTopics();
    const dynamicTotalProblems = getTotalProblems();

    // Only count completions for problems that still exist in the curriculum
    let completedProblemsCount = 0;
    dsaCurriculum.forEach(phase => {
        phase.sections.forEach(section => {
            section.topics.forEach(topic => {
                const completedList = progress[topic.id]?.completedProblems || [];
                const topicProblemIds = new Set(topic.problems.map(p => p.id));
                completedProblemsCount += completedList.filter(id => topicProblemIds.has(id)).length;
            });
        });
    });
    const overallProgress = dynamicTotalProblems > 0
        ? Math.round((completedProblemsCount / dynamicTotalProblems) * 100)
        : 0;

    // Handle problem toggle (Complete/Incomplete)
    const handleProblemToggle = async (topicId: string, problemId: string) => {
        if (!isAdmin) return;
        const currentCompleted = progress[topicId]?.completedProblems || [];
        await toggleDSAProblemCompletion(topicId, problemId, currentCompleted);
    };

    const { dsaStreak } = useTaskContext();

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
                    <Typography variant="h6" fontWeight="bold" color="text.primary">{getTotalProblems()}</Typography>
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

            {/* Topic List */}
            <Box sx={{
                borderRadius: 3,
                border: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                bgcolor: 'rgba(255,255,255,0.02)',
                overflow: 'hidden',
            }}>
                {displayEntries.map(entry => {
                    const prog = getEntryProgress(entry, progress);
                    const isExpanded = expandedTopics.has(entry.label);
                    const isComplete = prog.percentage === 100 && prog.total > 0;

                    return (
                        <Box key={entry.label}>
                            {/* Topic Header */}
                            <Box
                                onClick={() => toggleTopic(entry.label)}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    py: { xs: 1.5, sm: 2 },
                                    px: { xs: 1.5, sm: 3 },
                                    cursor: 'pointer',
                                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                                    transition: 'background 0.15s',
                                    '&:hover': { bgcolor: 'rgba(255,255,255,0.035)' },
                                }}
                            >
                                <Box sx={{ color: 'text.secondary', mr: { xs: 1, sm: 2 }, display: 'flex', alignItems: 'center' }}>
                                    {isExpanded
                                        ? <ExpandLessRoundedIcon sx={{ fontSize: 24 }} />
                                        : <ExpandMoreRoundedIcon sx={{ fontSize: 24 }} />
                                    }
                                </Box>
                                <Typography
                                    sx={{
                                        flex: 1,
                                        fontWeight: 700,
                                        color: isComplete ? 'success.main' : 'text.primary',
                                        fontSize: { xs: '1.1rem', sm: '1.3rem' },
                                        letterSpacing: '-0.01em',
                                    }}
                                >
                                    {entry.label}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: isComplete ? 'success.main' : 'text.secondary',
                                        fontWeight: 700,
                                        mr: { xs: 1.5, sm: 3 },
                                        fontSize: { xs: '0.9rem', sm: '1rem' },
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    {prog.completed} / {prog.total}
                                </Typography>
                                <Box sx={{ width: { xs: 70, sm: 180 }, flexShrink: 0 }}>
                                    <LinearProgress
                                        variant="determinate"
                                        value={prog.percentage}
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
                            </Box>

                            {/* Expanded Problem Table */}
                            <Collapse in={isExpanded}>
                                <Box sx={{ bgcolor: 'rgba(0,0,0,0.12)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                                    <Box sx={{ px: { xs: 2, sm: 3.5 }, pt: 1.5, pb: 0.5, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                        {entry.topicIds.map(topicId => {
                                            const topic = findTopicById(topicId);
                                            if (!topic) return null;
                                            return (
                                                <Button
                                                    key={topicId}
                                                    size="small"
                                                    variant="outlined"
                                                    startIcon={<MenuBookRoundedIcon />}
                                                    onClick={() => navigate(`/dsa/${topicId}`)}
                                                    sx={{
                                                        borderColor: 'rgba(255,255,255,0.15)',
                                                        color: 'text.secondary',
                                                        textTransform: 'none',
                                                        fontSize: '0.8rem',
                                                        borderRadius: 2,
                                                        '&:hover': { borderColor: 'primary.main', color: 'primary.main', bgcolor: 'rgba(33, 150, 243, 0.06)' },
                                                    }}
                                                >
                                                    Learn: {topic.title}
                                                </Button>
                                            );
                                        })}
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', px: { xs: 2, sm: 3.5 }, py: 1, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                        <Typography variant="caption" color="text.secondary" sx={{ width: 44, fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Status</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontWeight: 700, pl: 1, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Problem</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ width: 80, textAlign: 'center', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Difficulty</Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ width: { xs: 80, sm: 140 }, textAlign: 'center', fontWeight: 700, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>Practice</Typography>
                                    </Box>
                                    {entry.topicIds.flatMap(topicId => {
                                        const topic = findTopicById(topicId);
                                        if (!topic) return [];
                                        return topic.problems.map(problem => ({ topicId, problem }));
                                    })
                                        .map(({ topicId, problem }, idx) => {
                                            const isCompleted = progress[topicId]?.completedProblems?.includes(problem.id) || false;
                                            const scheduledDate = progress[topicId]?.practiceSchedule?.[problem.id];
                                            let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
                                            const contentKey = topicId as keyof typeof dsaTopicContent;
                                            if (dsaTopicContent[contentKey]) {
                                                const cat = dsaTopicContent[contentKey];
                                                if (cat.practiceProblems.easy.some((p: any) => p.title === problem.title)) difficulty = 'Easy';
                                                else if (cat.practiceProblems.hard.some((p: any) => p.title === problem.title)) difficulty = 'Hard';
                                            }
                                            const diffColor = difficulty === 'Easy' ? '#43a047' : difficulty === 'Hard' ? '#ef5350' : '#ffa726';
                                            return (
                                                <Box
                                                    key={problem.id}
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        px: { xs: 2, sm: 3.5 },
                                                        py: { xs: 0.7, sm: 0.8 },
                                                        bgcolor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.015)',
                                                        transition: 'background 0.1s',
                                                        '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
                                                    }}
                                                >
                                                    <Box sx={{ width: 44, display: 'flex', justifyContent: 'center' }}>
                                                        <Tooltip title={!isAdmin ? 'Unlock to toggle' : (isCompleted ? (scheduledDate ? `Practice: ${formatDate(scheduledDate)}` : 'Completed') : 'Mark as complete')}>
                                                            <span>
                                                                <Checkbox
                                                                    checked={isCompleted}
                                                                    onChange={() => handleProblemToggle(topicId, problem.id)}
                                                                    disabled={!isAdmin}
                                                                    icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 22 }} />}
                                                                    checkedIcon={<CheckCircleRoundedIcon sx={{ fontSize: 22, color: '#4caf50' }} />}
                                                                    sx={{ p: 0.3, color: 'rgba(255,255,255,0.2)', '&.Mui-checked': { color: '#4caf50' } }}
                                                                />
                                                            </span>
                                                        </Tooltip>
                                                    </Box>
                                                    <Typography
                                                        component="a"
                                                        href={problem.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        sx={{
                                                            flex: 1,
                                                            pl: 1,
                                                            color: isCompleted ? 'text.secondary' : 'text.primary',
                                                            opacity: isCompleted ? 0.55 : 1,
                                                            fontSize: { xs: '1rem', sm: '1.12rem' },
                                                            fontWeight: 500,
                                                            textDecoration: 'none',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 0.5,
                                                            transition: 'color 0.15s',
                                                            '&:hover': {
                                                                color: isCompleted ? 'text.secondary' : '#4caf50',
                                                            },
                                                        }}
                                                    >
                                                        {problem.title}
                                                        <OpenInNewRoundedIcon sx={{ fontSize: 14, opacity: 0.4 }} />
                                                    </Typography>
                                                    <Box sx={{ width: 80, textAlign: 'center' }}>
                                                        <Typography sx={{ color: diffColor, fontWeight: 700, fontSize: '0.78rem' }}>
                                                            {difficulty}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ width: { xs: 80, sm: 140 }, display: 'flex', justifyContent: 'center' }}>
                                                        <PracticeButtons
                                                            topicId={topicId}
                                                            problemId={problem.id}
                                                            scheduledDate={scheduledDate}
                                                            isAdmin={isAdmin}
                                                            isCompleted={isCompleted}
                                                            onCompleteProblem={handleProblemToggle}
                                                        />
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    <Box sx={{ height: 10 }} />
                                </Box>
                            </Collapse>
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
};

export default DSAHubPage;