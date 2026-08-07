import React, { useMemo, useState, useEffect, useRef } from 'react';
import { useTaskContext } from '../../context/TaskContext';
import {
    Box,
    Typography,
    Checkbox,
    IconButton,
    TextField,
    Stack,
    Collapse,
    Divider,
    Tooltip,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';

import {
    subscribeToWeeklyGoals,
    saveWeeklyGoals,
} from '../../services/firebaseService';
import type { WeeklyGoal } from '../../services/firebaseService';

// ── Helpers ──────────────────────────────────────────────────

const getLocalYmd = () => new Date().toLocaleDateString('en-CA');

/** Sunday YYYY-MM-DD of the Sun–Sat week that contains `ymd`. */
const getSundayForWeek = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number);
    const anchor = new Date(Date.UTC(y, m - 1, d, 12));
    const dow = anchor.getUTCDay();
    const sunday = new Date(anchor);
    sunday.setUTCDate(anchor.getUTCDate() - dow);
    const yy = sunday.getUTCFullYear();
    const mm = String(sunday.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(sunday.getUTCDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
};

/** Format YYYY-MM-DD to readable "Jun 1" */
const formatShortDate = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number);
    const date = new Date(Date.UTC(y, m - 1, d, 12));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
};

/** Get Saturday date string from a Sunday start */
const getSaturdayFromSunday = (sundayYmd: string) => {
    const [y, m, d] = sundayYmd.split('-').map(Number);
    const anchor = new Date(Date.UTC(y, m - 1, d, 12));
    anchor.setUTCDate(anchor.getUTCDate() + 6);
    const yy = anchor.getUTCFullYear();
    const mm = String(anchor.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(anchor.getUTCDate()).padStart(2, '0');
    return `${yy}-${mm}-${dd}`;
};

const ACCENT = '#4a90e2';
const SUCCESS = '#4caf50';

// ── Component ────────────────────────────────────────────────

const WeeklyGoalsPanel: React.FC = () => {
    const { selectedDate, isAdmin } = useTaskContext();

    // Week derivation from selected date
    const weekStart = useMemo(() => getSundayForWeek(selectedDate), [selectedDate]);
    const realWeekStart = useMemo(() => getSundayForWeek(getLocalYmd()), []);

    // Is this the current (real) week?
    const isCurrentWeek = weekStart === realWeekStart;
    // Is this a past week? (week start is before the real current week start)
    const isPastWeek = weekStart < realWeekStart;

    // State
    const [goals, setGoals] = useState<WeeklyGoal[]>([]);
    const [isExpanded, setIsExpanded] = useState(false);

    // Add goal (only for current week)
    const [isAdding, setIsAdding] = useState(false);
    const [newGoalText, setNewGoalText] = useState('');
    const addInputRef = useRef<HTMLInputElement>(null);

    // Edit goal (only for current week)
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    // Error
    const [saveError, setSaveError] = useState<string | null>(null);

    // Subscribe to the week's goals
    useEffect(() => {
        const unsubscribe = subscribeToWeeklyGoals(weekStart, (data) => {
            setGoals(data?.goals ?? []);
        });
        // Reset editing states when week changes
        setIsAdding(false);
        setNewGoalText('');
        setEditingId(null);
        setEditText('');
        return () => unsubscribe();
    }, [weekStart]);

    // Auto-focus add input
    useEffect(() => {
        if (isAdding && addInputRef.current) {
            addInputRef.current.focus();
        }
    }, [isAdding]);

    const persistGoals = (updatedGoals: WeeklyGoal[]) => {
        setSaveError(null);
        saveWeeklyGoals(weekStart, updatedGoals).catch((e) => {
            console.error(e);
            setSaveError('Failed to save. Check your connection.');
        });
    };

    // ── Actions (only available for current week) ────────────

    const handleAddGoal = () => {
        if (!newGoalText.trim() || !isCurrentWeek) return;
        const newGoal: WeeklyGoal = {
            id: crypto.randomUUID(),
            text: newGoalText.trim(),
            completed: false,
        };
        const updated = [...goals, newGoal];
        setGoals(updated);
        persistGoals(updated);
        setNewGoalText('');
        setIsAdding(false);
    };

    const handleToggleGoal = (id: string) => {
        const updated = goals.map((g) => (g.id === id ? { ...g, completed: !g.completed } : g));
        setGoals(updated);
        persistGoals(updated);
    };

    const handleDeleteGoal = (id: string) => {
        if (!isCurrentWeek) return;
        const updated = goals.filter((g) => g.id !== id);
        setGoals(updated);
        persistGoals(updated);
    };

    const startEdit = (goal: WeeklyGoal) => {
        if (!isCurrentWeek) return;
        setEditingId(goal.id);
        setEditText(goal.text);
    };

    const saveEdit = () => {
        if (!editingId || !editText.trim() || !isCurrentWeek) {
            setEditingId(null);
            setEditText('');
            return;
        }
        const updated = goals.map((g) => (g.id === editingId ? { ...g, text: editText.trim() } : g));
        setGoals(updated);
        persistGoals(updated);
        setEditingId(null);
        setEditText('');
    };

    const completedCount = goals.filter((g) => g.completed).length;
    const weekRange = `${formatShortDate(weekStart)} – ${formatShortDate(getSaturdayFromSunday(weekStart))}`;

    return (
        <Box sx={{ mb: 4 }}>
            <Box
                sx={{
                    borderRadius: 4,
                    overflow: 'hidden',
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: isPastWeek ? 'rgba(255, 255, 255, 0.06)' : 'rgba(255, 255, 255, 0.08)',
                    boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
                    opacity: isPastWeek ? 0.85 : 1,
                    transition: 'opacity 0.3s',
                }}
            >
                {/* Header */}
                <Box
                    onClick={() => setIsExpanded(!isExpanded)}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        px: 3,
                        py: 2.5,
                        cursor: 'pointer',
                        '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.03)' },
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box
                            sx={{
                                width: 44,
                                height: 44,
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: isPastWeek ? 'rgba(255, 255, 255, 0.05)' : 'rgba(74, 144, 226, 0.1)',
                                border: `1px solid ${isPastWeek ? 'rgba(255, 255, 255, 0.1)' : 'rgba(74, 144, 226, 0.2)'}`,
                                boxShadow: '0 4px 14px rgba(0,0,0,0.1)',
                            }}
                        >
                            <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>🎯</Typography>
                        </Box>
                        <Box>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: '1.15rem', sm: '1.2rem' },
                                        letterSpacing: 0.5,
                                        color: isPastWeek ? 'rgba(255,255,255,0.6)' : 'white',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    Weekly Goals
                                </Typography>
                                {isPastWeek && (
                                    <Tooltip title="Past week — read only">
                                        <LockRoundedIcon sx={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }} />
                                    </Tooltip>
                                )}
                            </Stack>
                            <Typography
                                variant="caption"
                                sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem', fontWeight: 500 }}
                            >
                                {weekRange}
                                {goals.length > 0 && ` · ${completedCount}/${goals.length} completed`}
                            </Typography>
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        {/* Add button — only for current week */}
                        {isAdmin && isCurrentWeek && (
                            <Tooltip title="Add Goal">
                                <IconButton
                                    size="small"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsAdding(!isAdding);
                                        setIsExpanded(true);
                                    }}
                                    sx={{
                                        color: isAdding ? ACCENT : 'rgba(255,255,255,0.4)',
                                        bgcolor: isAdding ? `${ACCENT}15` : 'transparent',
                                        '&:hover': { color: ACCENT, bgcolor: `${ACCENT}15` },
                                        '&:focus': { outline: 'none' },
                                    }}
                                >
                                    <AddRoundedIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                        <IconButton
                            size="small"
                            sx={{ color: 'rgba(255,255,255,0.4)', '&:focus': { outline: 'none' } }}
                            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
                        >
                            {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                        </IconButton>
                    </Stack>
                </Box>

                {/* Save Error */}
                {saveError && (
                    <Box sx={{ px: 3, pb: 1.5 }}>
                        <Typography variant="caption" sx={{ color: 'rgba(244, 67, 54, 0.95)', fontWeight: 700 }}>
                            {saveError}
                        </Typography>
                    </Box>
                )}

                {/* Content */}
                <Collapse in={isExpanded}>
                    <Box sx={{ px: 3, pb: 3 }}>
                        {/* Past week info banner */}
                        {isPastWeek && goals.length > 0 && (
                            <Box
                                sx={{
                                    mb: 2,
                                    px: 2,
                                    py: 1.25,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                                    border: '1px solid rgba(255, 255, 255, 0.06)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                }}
                            >
                                <LockRoundedIcon sx={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }} />
                                <Typography
                                    variant="caption"
                                    sx={{ color: 'rgba(255,255,255,0.4)', fontWeight: 500, fontSize: '0.82rem' }}
                                >
                                    This week has passed. Goals are read-only.
                                </Typography>
                            </Box>
                        )}

                        {/* Add goal input — current week only */}
                        {isCurrentWeek && (
                            <Collapse in={isAdding}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                        mb: 2,
                                        p: 1.5,
                                        borderRadius: 3,
                                        bgcolor: 'rgba(74, 144, 226, 0.05)',
                                        border: `1px solid ${ACCENT}30`,
                                    }}
                                >
                                    <TextField
                                        inputRef={addInputRef}
                                        size="small"
                                        placeholder="What's your goal this week?"
                                        value={newGoalText}
                                        onChange={(e) => setNewGoalText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && newGoalText.trim()) handleAddGoal();
                                            if (e.key === 'Escape') { setIsAdding(false); setNewGoalText(''); }
                                        }}
                                        variant="standard"
                                        fullWidth
                                        sx={{
                                            '& .MuiInput-input': {
                                                fontSize: '0.95rem',
                                                color: 'white',
                                                py: 0.5,
                                            },
                                            '& .MuiInput-underline:before': { borderBottom: 'none' },
                                            '& .MuiInput-underline:hover:before': { borderBottom: 'none' },
                                            '& .MuiInput-underline:after': { borderBottom: `2px solid ${ACCENT}` },
                                        }}
                                    />
                                    <IconButton
                                        size="small"
                                        onClick={handleAddGoal}
                                        disabled={!newGoalText.trim()}
                                        sx={{
                                            color: newGoalText.trim() ? SUCCESS : 'rgba(255,255,255,0.2)',
                                            '&:focus': { outline: 'none' },
                                        }}
                                    >
                                        <CheckRoundedIcon sx={{ fontSize: 20 }} />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        onClick={() => { setIsAdding(false); setNewGoalText(''); }}
                                        sx={{ color: 'rgba(255,255,255,0.3)', '&:focus': { outline: 'none' } }}
                                    >
                                        <CloseRoundedIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </Box>
                            </Collapse>
                        )}

                        {/* Goals list */}
                        {goals.length === 0 ? (
                            <Box sx={{ py: 3, textAlign: 'center' }}>
                                <Typography
                                    variant="body2"
                                    sx={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontSize: '0.9rem' }}
                                >
                                    {isPastWeek
                                        ? 'No goals were set for this week.'
                                        : isCurrentWeek
                                            ? 'No goals set for this week yet. Tap the + to add your first goal.'
                                            : 'No goals set for this week yet.'}
                                </Typography>
                            </Box>
                        ) : (
                            <Stack spacing={1.5}>
                                {goals.map((goal) => {
                                    const isEditing = editingId === goal.id;

                                    return (
                                        <Box
                                            key={goal.id}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: 1.5,
                                                px: 2,
                                                py: 1.5,
                                                borderRadius: 3,
                                                bgcolor: goal.completed ? 'rgba(76, 175, 80, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                                border: '1px solid',
                                                borderColor: goal.completed ? 'rgba(76, 175, 80, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                                '&:hover': {
                                                    borderColor: goal.completed ? 'rgba(76, 175, 80, 0.5)' : `${ACCENT}80`,
                                                    transform: isCurrentWeek ? 'translateY(-2px)' : 'none',
                                                    boxShadow: isCurrentWeek ? '0 8px 24px rgba(0,0,0,0.12)' : 'none',
                                                },
                                            }}
                                        >
                                            <Checkbox
                                                checked={goal.completed}
                                                onChange={() => handleToggleGoal(goal.id)}
                                                icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 28 }} />}
                                                checkedIcon={<CheckCircleRoundedIcon sx={{ fontSize: 28 }} />}
                                                disabled={!isAdmin}
                                                sx={{
                                                    p: 0,
                                                    color: 'rgba(255,255,255,0.15)',
                                                    '&.Mui-checked': { color: 'success.main' },
                                                    transition: 'transform 0.2s',
                                                    '&:hover': { transform: 'scale(1.1)', bgcolor: 'transparent' },
                                                }}
                                            />

                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                {isEditing ? (
                                                    <Stack direction="row" spacing={1} alignItems="center">
                                                        <TextField
                                                            size="small"
                                                            value={editText}
                                                            onChange={(e) => setEditText(e.target.value)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') setEditingId(null);
                                                            }}
                                                            autoFocus
                                                            variant="standard"
                                                            fullWidth
                                                            sx={{ '& .MuiInput-input': { fontSize: '1.2rem', color: 'white', py: 0.5 } }}
                                                        />
                                                        <IconButton aria-label="Save goal" size="small" onClick={saveEdit} sx={{ color: 'success.main', p: 0.5, '&:focus': { outline: 'none' } }}>
                                                            <CheckRoundedIcon sx={{ fontSize: 18 }} />
                                                        </IconButton>
                                                    </Stack>
                                                ) : (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{
                                                            fontSize: '1.2rem',
                                                            fontWeight: 600,
                                                            color: goal.completed ? 'text.secondary' : 'rgba(255,255,255,0.9)',
                                                            opacity: goal.completed ? 0.85 : 1,
                                                            lineHeight: 1.45,
                                                            wordBreak: 'break-word',
                                                            transition: 'all 0.2s',
                                                        }}
                                                    >
                                                        {goal.text}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Actions — current week only */}
                                            {isAdmin && isCurrentWeek && !isEditing && (
                                                <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                                    <Tooltip title="Edit">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => startEdit(goal)}
                                                            sx={{
                                                                color: 'rgba(255,255,255,0.12)',
                                                                '&:hover': { color: 'primary.main' },
                                                                '&:focus': { outline: 'none' },
                                                                p: 0.3,
                                                            }}
                                                        >
                                                            <EditRoundedIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Remove">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleDeleteGoal(goal.id)}
                                                            sx={{
                                                                color: 'rgba(255,255,255,0.12)',
                                                                '&:hover': { color: 'error.main' },
                                                                '&:focus': { outline: 'none' },
                                                                p: 0.3,
                                                            }}
                                                        >
                                                            <CloseRoundedIcon sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Stack>
                                            )}

                                            {/* Completed check for past weeks */}
                                            {isPastWeek && goal.completed && (
                                                <Typography sx={{ fontSize: '1rem', opacity: 0.7 }}>✅</Typography>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Stack>
                        )}

                        {/* Completion summary */}
                        {completedCount === goals.length && goals.length > 0 && (
                            <Box
                                sx={{
                                    mt: 2,
                                    p: 1.5,
                                    borderRadius: 2,
                                    background: 'linear-gradient(135deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.03) 100%)',
                                    border: '1px solid rgba(76,175,80,0.2)',
                                    textAlign: 'center',
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 700, color: SUCCESS, fontSize: '0.95rem' }}>
                                    {isPastWeek ? '🎉 All goals were completed this week!' : '🏆 All weekly goals completed!'}
                                </Typography>
                            </Box>
                        )}

                        {/* Empty current week prompt */}
                        {isCurrentWeek && goals.length === 0 && (
                            <Box sx={{ mt: 1 }}>
                                <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)', mb: 2 }} />
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'rgba(255,255,255,0.45)',
                                        fontSize: '0.88rem',
                                        fontWeight: 500,
                                        textAlign: 'center',
                                    }}
                                >
                                    Set your goals for the week ahead 🎯
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Collapse>
            </Box>
        </Box>
    );
};

export default WeeklyGoalsPanel;
