import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    Card,
    Checkbox,
    IconButton,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Stack,
    Collapse,
    Tooltip,
    Fab,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
} from '@mui/material';
import Confetti from 'react-confetti';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddIcon from '@mui/icons-material/Add';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import OpenInFullRoundedIcon from '@mui/icons-material/OpenInFullRounded';
import CloseFullscreenRoundedIcon from '@mui/icons-material/CloseFullscreenRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import { useTaskContext } from '../context/TaskContext';
import StreakCalendar from './StreakCalendar';
import { motivationalQuotes } from '../data/quotes';
import AffirmationVisualization from './AffirmationVisualization';

// Mission planning UI (weekly goals, role tags, people lane)
import RoleTag from './mission/RoleTag';
import TaskWhyText from './mission/TaskWhyText';
import WeeklyGoalsPanel from './mission/WeeklyGoalsPanel';
import PeopleLane from './mission/PeopleLane';

import {
    getHabitRoles,
    getTaskRoles,
    isPersonHabit,
    getWhyTextForTask,
    MISSION_STATEMENT,
    ALL_MISSION_ROLES,
    ROLE_LABELS,
} from '../data/missionTypes';
import type { Role } from '../data/missionTypes';

/** Card accents stay blue (no per-role red/yellow on daily habits). */
/** Matches visualization / ENGINEER accent (`ROLE_COLORS`). */
const HABIT_ACCENT = '#4a90e2';

// Simple hook for window size
const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowSize;
};

const DailyHabitsPage: React.FC = () => {
    const { dailyHabits, addHabit, toggleHabit, deleteHabit, updateHabit, userStats, isAdmin, selectedDate, dsaStreak } = useTaskContext();
    const { width, height } = useWindowSize();
    const [showConfetti, setShowConfetti] = useState(false);
    const confettiTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isAffirmationOpen, setIsAffirmationOpen] = useState(false);
    const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
    const [enteredPassword, setEnteredPassword] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [newHabitTitle, setNewHabitTitle] = useState('');
    const [newHabitRoleTags, setNewHabitRoleTags] = useState<Role[]>([]);
    const [newHabitNote, setNewHabitNote] = useState('');

    // Edit state
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
    const [editHabitTitle, setEditHabitTitle] = useState('');
    const [editHabitNote, setEditHabitNote] = useState('');
    const [editHabitRoleTags, setEditHabitRoleTags] = useState<Role[]>([]);
    // If the habit already had saved role tags in Firebase, render selection slightly differently.
    const [editHabitWasTagged, setEditHabitWasTagged] = useState(false);
    // Inferred roles are only shown lightly when no explicit tags exist.
    const [editHabitInferredRoleTags, setEditHabitInferredRoleTags] = useState<Role[]>([]);
    const [isNoteExpanded, setIsNoteExpanded] = useState(false);
    const [isAddNoteExpanded, setIsAddNoteExpanded] = useState(false);
    const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);



    const [quote, setQuote] = useState<{ text: string; author: string } | null>(null);

    useEffect(() => {
        // Load a random quote from the local data file
        const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
        setQuote(randomQuote);
    }, []);

    // Date Helpers
    const getLondonToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/London' });
    const isPast = selectedDate < getLondonToday();

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (enteredPassword === "goldengatebridge") {
            setIsPasswordDialogOpen(false);
            setEnteredPassword('');
            setPasswordError(false);
            setIsAffirmationOpen(true);
        } else {
            setPasswordError(true);
        }
    };



    const handleAddHabit = async () => {
        if (newHabitTitle.trim()) {
            const trimmedTitle = newHabitTitle.trim();
            const trimmedNote = newHabitNote.trim();
            await addHabit(
                trimmedTitle,
                newHabitRoleTags.length > 0 ? newHabitRoleTags : undefined
            );
            // If a note was entered, update the newly added habit with it
            if (trimmedNote) {
                setTimeout(() => {
                    const newHabit = dailyHabits.find(h => h.title === trimmedTitle);
                    if (newHabit) {
                        updateHabit(newHabit.id, { note: trimmedNote });
                    }
                }, 1000);
            }
            setNewHabitTitle('');
            setNewHabitRoleTags([]);
            setNewHabitNote('');
            setIsAddDialogOpen(false);
        }
    };

    const handleOpenEdit = (habit: any) => {
        setEditingHabitId(habit.id);
        setEditHabitTitle(habit.title);
        setEditHabitNote(habit.note || '');
        const wasTagged = habit.roleTags && habit.roleTags.length > 0;
        setEditHabitWasTagged(wasTagged);
        setEditHabitInferredRoleTags(getTaskRoles(habit.title));
        setEditHabitRoleTags(wasTagged ? [...habit.roleTags] : []);
        setIsNoteExpanded(false);
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (editingHabitId && editHabitTitle.trim()) {
            updateHabit(editingHabitId, {
                title: editHabitTitle.trim(),
                note: editHabitNote.trim(),
                roleTags: editHabitRoleTags,
            });
            setIsEditDialogOpen(false);
            setEditingHabitId(null);
            setEditHabitTitle('');
            setEditHabitNote('');
            setEditHabitRoleTags([]);
            setEditHabitWasTagged(false);
            setEditHabitInferredRoleTags([]);
        }
    };

    const completedCount = dailyHabits.filter(h => h.completed).length;
    const progress = dailyHabits.length > 0 ? Math.round((completedCount / dailyHabits.length) * 100) : 0;

    // Confetti: reset on date change, trigger when 100%
    useEffect(() => {
        // Always reset first
        if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
        setShowConfetti(false);

        // Small delay to let habits data settle for the new date
        const checkTimer = setTimeout(() => {
            if (progress === 100 && dailyHabits.length > 0) {
                setShowConfetti(true);
                confettiTimerRef.current = setTimeout(() => setShowConfetti(false), 15000);
            }
        }, 300);

        return () => {
            clearTimeout(checkTimer);
            if (confettiTimerRef.current) clearTimeout(confettiTimerRef.current);
        };
    }, [progress, selectedDate]);

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', pb: 10, overflowX: 'hidden' }}>
            {showConfetti && (
                <Box sx={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 9999, pointerEvents: 'none' }}>
                    <Confetti width={width} height={height} recycle={false} numberOfPieces={350} gravity={0.2} style={{ position: 'fixed', top: 0, left: 0 }} />
                </Box>
            )}

            <Box sx={{ mb: 4 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <TaskAltRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                        <Typography variant="h4" fontWeight="bold">
                            Daily Habits
                        </Typography>
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center">
                        {/* Streak Counter */}
                        <Tooltip title="Current Streak">
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 0.75,
                                transition: 'all 0.2s',
                                opacity: userStats?.currentStreak > 0 ? 1 : 0.5,
                                px: 1.5,
                                py: 0.75,
                                borderRadius: 2,
                            }}>
                                <LocalFireDepartmentRoundedIcon sx={{
                                    fontSize: 32,
                                    color: userStats?.currentStreak > 0 ? '#FF9800' : 'text.secondary',
                                    filter: userStats?.currentStreak > 0 ? 'drop-shadow(0 0 6px rgba(255, 160, 0, 0.5))' : 'none',
                                }} />
                                <Typography variant="h5" fontWeight="bold" sx={{
                                    color: userStats?.currentStreak > 0 ? 'transparent' : 'text.secondary',
                                    background: userStats?.currentStreak > 0 ? 'linear-gradient(135deg, #FFEB3B, #FF9800, #F44336)' : 'none',
                                    backgroundClip: 'text',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: userStats?.currentStreak > 0 ? 'transparent' : undefined,
                                }}>
                                    {userStats?.currentStreak || 0}
                                </Typography>
                            </Box>
                        </Tooltip>
                    </Stack>
                </Stack>

                {/* Date Navigation */}


                {quote ? (
                    <Box sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                        <Typography variant="body1" fontStyle="italic" sx={{ mb: 1, opacity: 0.9 }}>
                            {quote.text}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold">
                            — {quote.author}
                        </Typography>
                    </Box>
                ) : (
                    <Typography variant="body1" color="text.secondary">
                        Build consistency with your daily routine.
                    </Typography>
                )}

                <Button
                    variant="contained"
                    fullWidth
                    onClick={() => setIsPasswordDialogOpen(true)}
                    sx={{
                        mt: 3,
                        py: 2,
                        borderRadius: 3,
                        background: 'linear-gradient(135deg, rgba(74,144,226,0.2) 0%, rgba(74,144,226,0.05) 100%)',
                        border: '1px solid rgba(74,144,226,0.3)',
                        color: '#4a90e2',
                        fontWeight: 'bold',
                        letterSpacing: 1,
                        textTransform: 'uppercase',
                        outline: 'none !important',
                        '&:hover': {
                            background: 'linear-gradient(135deg, rgba(74,144,226,0.3) 0%, rgba(74,144,226,0.1) 100%)',
                            borderColor: 'rgba(74,144,226,0.5)',
                        },
                        '&:focus': {
                            outline: 'none !important',
                        }
                    }}
                >
                    Start Affirmation & Visualization
                </Button>

                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mt: 6, mb: 2.5 }}>
                    <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 32 }} />
                    <Typography variant="h4" fontWeight="bold">
                        My Mission Statement
                    </Typography>
                </Stack>

                <Box
                    sx={{
                        p: 2.5,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderRadius: 2,
                        borderLeft: '4px solid',
                        borderColor: 'primary.main',
                    }}
                >
                    <Typography
                        variant="body1"
                        sx={{
                            fontStyle: 'italic',
                            color: 'text.primary',
                            opacity: 0.9,
                            lineHeight: 1.8,
                            fontSize: { xs: '1.15rem', sm: '1.25rem' },
                            whiteSpace: 'pre-wrap',
                        }}
                    >
                        {MISSION_STATEMENT}
                    </Typography>
                </Box>
            </Box>

            {/* Streak Calendar - Contribution Graph */}
            <StreakCalendar />

            {/* Progress Bar */}
            <Card sx={{ p: 3, mb: 4, bgcolor: 'background.paper', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <Box
                    sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        bottom: 0,
                        width: `${progress}%`,
                        bgcolor: 'rgba(76, 175, 80, 0.1)',
                        transition: 'width 0.5s ease-in-out'
                    }}
                />
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ position: 'relative' }}>
                    <Box>
                        <Typography variant="h6" fontWeight="bold" color={progress === 100 ? 'success.main' : 'primary.main'}>
                            {progress === 100 ? 'All Done! 🎉' : `${completedCount} of ${dailyHabits.length} completed`}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {progress === 100 ? 'Great job today!' : 'Keep going!'}
                        </Typography>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" color={progress === 100 ? 'success.main' : 'primary.main'}>
                        {progress}%
                    </Typography>
                </Stack>
            </Card>


            {/* Weekly Goals Panel */}
            <WeeklyGoalsPanel />

            <PeopleLane
                habits={dailyHabits}
                renderHabitCard={(habit) => (
                    <Card
                        key={habit.id}
                        sx={{
                            p: 3,
                            mt: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: habit.completed ? 'rgba(76, 175, 80, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflow: 'visible',
                            position: 'relative',
                            '&:hover': {
                                borderColor: `${HABIT_ACCENT}80`,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 30px ${HABIT_ACCENT}18`,
                            },
                        }}
                    >
                        {/* Colored left accent bar */}
                        <Box sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            borderTopLeftRadius: 16,
                            borderBottomLeftRadius: 16,
                            background: habit.completed
                                ? 'linear-gradient(180deg, rgba(76,175,80,0.6), rgba(76,175,80,0.2))'
                                : `linear-gradient(180deg, ${HABIT_ACCENT}, ${HABIT_ACCENT}40)`,
                            transition: 'background 0.3s',
                        }} />

                        {/* Overlapping top-left tags */}
                        <Box sx={{
                            position: 'absolute',
                            top: -16,
                            left: 24,
                            display: 'flex',
                            gap: 1,
                            zIndex: 2,
                        }}>
                            <Box sx={{
                                borderRadius: '20px',
                                bgcolor: 'background.paper',
                                boxShadow: 'none',
                            }}>
                                <RoleTag role="SON" />
                            </Box>
                        </Box>

                        {/* Top-right Actions overlay (Notes, Edit, Delete) */}
                        <Box sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            display: 'flex',
                            gap: 0.5,
                            alignItems: 'center',
                        }}>
                            {/* Notes Icon Button */}
                            <Tooltip title={expandedHabitId === habit.id ? "Hide Notes" : "Show Notes"}>
                                <IconButton
                                    size="small"
                                    onClick={() => setExpandedHabitId(expandedHabitId === habit.id ? null : habit.id)}
                                    sx={{ 
                                        color: expandedHabitId === habit.id ? 'primary.main' : 'rgba(255,255,255,0.3)',
                                        bgcolor: expandedHabitId === habit.id ? 'rgba(41, 121, 255, 0.1)' : 'transparent',
                                        '&:hover': { color: 'primary.main', bgcolor: 'rgba(41, 121, 255, 0.1)' }
                                    }}
                                >
                                    {expandedHabitId === habit.id ? <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 18 }} />}
                                </IconButton>
                            </Tooltip>

                            {isAdmin && !isPast && (
                                <>
                                    <Tooltip title="Edit">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenEdit(habit)}
                                            sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: 'primary.main', bgcolor: 'rgba(255,255,255,0.05)' } }}
                                        >
                                            <EditRoundedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            size="small"
                                            onClick={() => deleteHabit(habit.id)}
                                            sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: 'error.main', bgcolor: 'rgba(255,255,255,0.05)' } }}
                                        >
                                            <CloseRoundedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </Box>

                        {/* Main Content Area */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: 1.5, pr: 12 }}>
                            <Tooltip title={!isAdmin ? (habit.completed ? "Unlock app to unmark" : "Unlock app to mark complete") : (isPast ? "Cannot edit past habits" : "")}>
                                <span>
                                    <Checkbox
                                        checked={habit.completed}
                                        onChange={() => toggleHabit(habit.id)}
                                        icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 34 }} />}
                                        checkedIcon={<CheckCircleRoundedIcon sx={{ fontSize: 34 }} />}
                                        sx={{
                                            p: 0,
                                            mr: 2.5,
                                            mt: -0.25,
                                            color: 'rgba(255,255,255,0.15)',
                                            '&.Mui-checked': { color: 'success.main' },
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'scale(1.1)' }
                                        }}
                                        disabled={!isAdmin || isPast}
                                    />
                                </span>
                            </Tooltip>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: habit.completed ? 'text.secondary' : 'text.primary',
                                        opacity: habit.completed ? 0.85 : 1,
                                        fontWeight: 700,
                                        fontSize: { xs: '1.32rem', sm: '1.4rem' },
                                        letterSpacing: -0.3,
                                        lineHeight: 1.3,
                                        mb: 0.5,
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}
                                >
                                    {habit.title}
                                </Typography>
                                <TaskWhyText role="SON" customText={getWhyTextForTask(habit.title, ['SON'])} />
                            </Box>
                        </Box>

                        {/* Expandable Notes Section */}
                        <Collapse in={expandedHabitId === habit.id}>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', wordBreak: 'break-word' }}>
                                    {habit.note || 'No notes added.'}
                                </Typography>
                            </Box>
                        </Collapse>
                    </Card>
                )}
            />

            <Stack spacing={2.5}>
                {dailyHabits.filter(h => !isPersonHabit(h)).map((habit) => {
                    const roles = getHabitRoles(habit);

                    return (
                    <Card
                        key={habit.id}
                        sx={{
                            p: 3,
                            mt: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 4,
                            border: '1px solid',
                            borderColor: habit.completed ? 'rgba(76, 175, 80, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            overflow: 'visible',
                            position: 'relative',
                            '&:hover': {
                                borderColor: `${HABIT_ACCENT}80`,
                                transform: 'translateY(-3px)',
                                boxShadow: `0 12px 30px ${HABIT_ACCENT}18`,
                            },
                        }}
                    >
                        {/* Colored left accent bar */}
                        <Box sx={{
                            position: 'absolute',
                            left: 0,
                            top: 0,
                            bottom: 0,
                            width: '4px',
                            borderTopLeftRadius: 16,
                            borderBottomLeftRadius: 16,
                            background: habit.completed
                                ? 'linear-gradient(180deg, rgba(76,175,80,0.6), rgba(76,175,80,0.2))'
                                : `linear-gradient(180deg, ${HABIT_ACCENT}, ${HABIT_ACCENT}40)`,
                            transition: 'background 0.3s',
                        }} />

                        {/* Overlapping top-left tags */}
                        <Box sx={{
                            position: 'absolute',
                            top: -16,
                            left: 24,
                            display: 'flex',
                            gap: 1,
                            zIndex: 2,
                        }}>
                            {roles.map((role) => (
                                <Box key={role} sx={{
                                    borderRadius: '20px',
                                    bgcolor: 'background.paper',
                                    boxShadow: 'none',
                                }}>
                                    <RoleTag role={role} />
                                </Box>
                            ))}
                        </Box>

                        {/* Top-right Actions overlay (Notes, Edit, Delete) */}
                        <Box sx={{
                            position: 'absolute',
                            top: 16,
                            right: 16,
                            display: 'flex',
                            gap: 0.5,
                            alignItems: 'center',
                        }}>
                            {/* Notes Icon Button */}
                            <Tooltip title={expandedHabitId === habit.id ? "Hide Notes" : "Show Notes"}>
                                <IconButton
                                    size="small"
                                    onClick={() => setExpandedHabitId(expandedHabitId === habit.id ? null : habit.id)}
                                    sx={{ 
                                        color: expandedHabitId === habit.id ? 'primary.main' : 'rgba(255,255,255,0.3)',
                                        bgcolor: expandedHabitId === habit.id ? 'rgba(41, 121, 255, 0.1)' : 'transparent',
                                        '&:hover': { color: 'primary.main', bgcolor: 'rgba(41, 121, 255, 0.1)' }
                                    }}
                                >
                                    {expandedHabitId === habit.id ? <VisibilityOffRoundedIcon sx={{ fontSize: 18 }} /> : <VisibilityRoundedIcon sx={{ fontSize: 18 }} />}
                                </IconButton>
                            </Tooltip>

                            {isAdmin && !isPast && (
                                <>
                                    <Tooltip title="Edit">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleOpenEdit(habit)}
                                            sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: 'primary.main', bgcolor: 'rgba(255,255,255,0.05)' } }}
                                        >
                                            <EditRoundedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete">
                                        <IconButton
                                            size="small"
                                            onClick={() => deleteHabit(habit.id)}
                                            sx={{ color: 'rgba(255,255,255,0.2)', '&:hover': { color: 'error.main', bgcolor: 'rgba(255,255,255,0.05)' } }}
                                        >
                                            <CloseRoundedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                </>
                            )}
                        </Box>

                        {/* Main Content Area */}
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', pt: 1.5, pr: 12 }}>
                            <Tooltip title={!isAdmin ? (habit.completed ? "Unlock app to unmark" : "Unlock app to mark complete") : (isPast ? "Cannot edit past habits" : "")}>
                                <span>
                                    <Checkbox
                                        checked={habit.completed}
                                        onChange={() => toggleHabit(habit.id)}
                                        icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 34 }} />}
                                        checkedIcon={<CheckCircleRoundedIcon sx={{ fontSize: 34 }} />}
                                        sx={{
                                            p: 0,
                                            mr: 2.5,
                                            mt: -0.25,
                                            color: 'rgba(255,255,255,0.15)',
                                            '&.Mui-checked': { color: 'success.main' },
                                            transition: 'transform 0.2s',
                                            '&:hover': { transform: 'scale(1.1)' }
                                        }}
                                        disabled={!isAdmin || isPast}
                                    />
                                </span>
                            </Tooltip>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="h5"
                                    sx={{
                                        color: habit.completed ? 'text.secondary' : 'text.primary',
                                        opacity: habit.completed ? 0.85 : 1,
                                        fontWeight: 700,
                                        fontSize: { xs: '1.32rem', sm: '1.4rem' },
                                        letterSpacing: -0.3,
                                        lineHeight: 1.3,
                                        mb: 0.5,
                                        wordBreak: 'break-word',
                                        overflowWrap: 'break-word',
                                    }}
                                >
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                        {habit.title}
                                        {habit.title.toLowerCase().includes('dsa') && dsaStreak > 0 && (
                                            <Tooltip title="DSA Daily Streak">
                                                <Box sx={{ display: 'flex', alignItems: 'center', bgcolor: 'rgba(255, 152, 0, 0.1)', px: 1, py: 0.25, borderRadius: 1.5 }}>
                                                    <LocalFireDepartmentRoundedIcon sx={{ color: '#FF9800', fontSize: 16, mr: 0.25 }} />
                                                    <Typography variant="caption" fontWeight="bold" sx={{ color: '#FF9800' }}>
                                                        {dsaStreak}
                                                    </Typography>
                                                </Box>
                                            </Tooltip>
                                        )}
                                    </Box>
                                </Typography>
                                <TaskWhyText role={roles[0]} customText={getWhyTextForTask(habit.title, roles)} />
                            </Box>
                        </Box>

                        {/* Expandable Notes Section */}
                        <Collapse in={expandedHabitId === habit.id}>
                            <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2, border: '1px dashed rgba(255,255,255,0.1)' }}>
                                <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', fontStyle: 'italic', wordBreak: 'break-word' }}>
                                    {habit.note || 'No notes added.'}
                                </Typography>
                            </Box>
                        </Collapse>
                    </Card>
                    );
                })}
            </Stack>

            {/* Daily Filter Prompt */}


            {/* Add Habit FAB (Admin Only) */}
            {
                isAdmin && (
                    <Fab
                        color="primary"
                        aria-label="add"
                        sx={{
                            position: 'fixed',
                            bottom: 32,
                            right: 32,
                            outline: 'none !important',
                        }}
                        onClick={() => setIsAddDialogOpen(true)}
                    >
                        <AddIcon />
                    </Fab>
                )
            }

            {/* Add Habit Dialog */}
            <Dialog
                open={isAddDialogOpen}
                onClose={() => {
                    setIsAddDialogOpen(false);
                    setNewHabitRoleTags([]);
                }}
                fullWidth
                maxWidth={isAddNoteExpanded ? 'md' : 'xs'}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Add Daily Habit
                    <IconButton aria-label={isAddNoteExpanded ? 'Shrink the note field' : 'Expand the note field'} onClick={() => setIsAddNoteExpanded(!isAddNoteExpanded)} size="small">
                        {isAddNoteExpanded ? <CloseFullscreenRoundedIcon fontSize="small" /> : <OpenInFullRoundedIcon fontSize="small" />}
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Habit Name"
                        fullWidth
                        variant="outlined"
                        value={newHabitTitle}
                        onChange={(e) => setNewHabitTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newHabitTitle.trim()) {
                                handleAddHabit();
                            }
                        }}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
                            Role tags
                        </Typography>
                        <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1 }}>
                            Stored in Firebase. Leave none selected to infer roles from the habit name.
                        </Typography>
                        <FormControl size="small" fullWidth>
                            <InputLabel id="add-role-tags-label">Role tags</InputLabel>
                            <Select
                                labelId="add-role-tags-label"
                                multiple
                                value={newHabitRoleTags}
                                label="Role tags"
                                renderValue={(selected) => {
                                    const roles = selected as Role[];
                                    if (roles.length === 0) return 'Auto (infer)';
                                    return roles.map(r => ROLE_LABELS[r]).join(', ');
                                }}
                                onChange={(e) => setNewHabitRoleTags(e.target.value as Role[])}
                                sx={{
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'rgba(100, 181, 246, 0.45)',
                                    },
                                }}
                            >
                                {ALL_MISSION_ROLES.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Checkbox size="small" checked={newHabitRoleTags.includes(role)} />
                                            <Typography variant="body2">{ROLE_LABELS[role]}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <TextField
                        margin="dense"
                        label="Notes (Optional)"
                        fullWidth
                        multiline
                        minRows={isAddNoteExpanded ? 15 : 3}
                        maxRows={isAddNoteExpanded ? 15 : 3}
                        variant="outlined"
                        value={newHabitNote}
                        onChange={(e) => setNewHabitNote(e.target.value)}
                        placeholder="Add details, reflection, or tracking info..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setIsAddDialogOpen(false);
                            setNewHabitRoleTags([]);
                        }}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleAddHabit} variant="contained" disabled={!newHabitTitle.trim()}>
                        Add Habit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Password Dialog for Visualization */}
            <Dialog
                open={isPasswordDialogOpen}
                onClose={() => {
                    setIsPasswordDialogOpen(false);
                    setEnteredPassword('');
                    setPasswordError(false);
                }}
                fullWidth
                maxWidth="xs"
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        p: 1
                    }
                }}
            >
                <DialogTitle sx={{ fontWeight: 'bold' }}>Visualization Journey</DialogTitle>
                <DialogContent>
                    <form onSubmit={handlePasswordSubmit}>
                        <TextField
                            autoFocus
                            fullWidth
                            type="password"
                            label="Password"
                            value={enteredPassword}
                            onChange={(e) => {
                                setEnteredPassword(e.target.value);
                                if (passwordError) setPasswordError(false);
                            }}
                            error={passwordError}
                            helperText={passwordError ? "Incorrect password" : ""}
                            variant="outlined"
                            sx={{ mt: 1 }}
                        />
                    </form>
                </DialogContent>
                <DialogActions sx={{ p: 2, pt: 0 }}>
                    <Button onClick={() => setIsPasswordDialogOpen(false)} sx={{ outline: 'none !important' }}>Cancel</Button>
                    <Button
                        onClick={handlePasswordSubmit}
                        variant="contained"
                        disabled={!enteredPassword.trim()}
                        sx={{ outline: 'none !important' }}
                    >
                        Unlock
                    </Button>
                </DialogActions>
            </Dialog>

            <AffirmationVisualization
                open={isAffirmationOpen}
                onClose={() => setIsAffirmationOpen(false)}
            />



            {/* Edit Habit Dialog */}
            <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} fullWidth maxWidth={isNoteExpanded ? 'md' : 'xs'}>
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    Edit Habit
                    <IconButton aria-label={isNoteExpanded ? 'Shrink the note field' : 'Expand the note field'} onClick={() => setIsNoteExpanded(!isNoteExpanded)} size="small">
                        {isNoteExpanded ? <CloseFullscreenRoundedIcon fontSize="small" /> : <OpenInFullRoundedIcon fontSize="small" />}
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Habit Name"
                        fullWidth
                        variant="outlined"
                        value={editHabitTitle}
                        onChange={(e) => setEditHabitTitle(e.target.value)}
                        sx={{ mb: 2 }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && editHabitTitle.trim()) {
                                handleSaveEdit();
                            }
                        }}
                    />
                    <Box sx={{ mt: 2, mb: 1 }}>
                        <Typography variant="body2" fontWeight={600} color="text.secondary" sx={{ mb: 0.5 }}>
                            Role tags
                        </Typography>
                        <Typography variant="caption" color="text.disabled" display="block" sx={{ mb: 1 }}>
                            Leave none selected to infer roles from the habit name.
                        </Typography>
                        <FormControl size="small" fullWidth>
                            <InputLabel id="edit-role-tags-label">Role tags</InputLabel>
                            <Select
                                labelId="edit-role-tags-label"
                                multiple
                                value={editHabitRoleTags}
                                label="Role tags"
                                renderValue={(selected) => {
                                    const roles = selected as Role[];
                                    if (roles.length === 0) {
                                        if (editHabitInferredRoleTags.length === 0) return 'Auto (infer)';
                                        return `Auto (infer: ${editHabitInferredRoleTags.map(r => ROLE_LABELS[r]).join(', ')})`;
                                    }
                                    return roles.map(r => ROLE_LABELS[r]).join(', ');
                                }}
                                onChange={(e) => setEditHabitRoleTags(e.target.value as Role[])}
                                sx={{
                                    bgcolor: editHabitWasTagged ? 'rgba(41, 121, 255, 0.06)' : 'rgba(41, 121, 255, 0.03)',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: editHabitWasTagged ? 'rgba(100, 181, 246, 0.85)' : 'rgba(100, 181, 246, 0.45)',
                                    },
                                }}
                            >
                                {ALL_MISSION_ROLES.map((role) => (
                                    <MenuItem key={role} value={role}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Checkbox size="small" checked={editHabitRoleTags.includes(role)} />
                                            <Typography variant="body2">{ROLE_LABELS[role]}</Typography>
                                        </Box>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                    <TextField
                        margin="dense"
                        label="Notes (Optional)"
                        fullWidth
                        multiline
                        minRows={isNoteExpanded ? 15 : 3}
                        maxRows={isNoteExpanded ? 15 : 3}
                        variant="outlined"
                        value={editHabitNote}
                        onChange={(e) => setEditHabitNote(e.target.value)}
                        placeholder="Add details, reflection, or tracking info..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveEdit} variant="contained" disabled={!editHabitTitle.trim()}>
                        Save Changes
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default DailyHabitsPage;
