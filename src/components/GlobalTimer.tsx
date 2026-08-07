import React, { useState } from 'react';
import { Box, Typography, IconButton, Popover, Fab, Tooltip, Button } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import { useTaskContext } from '../context/TaskContext';

interface PomodoroPreset {
    label: string;
    minutes: number;
}

const presets: PomodoroPreset[] = [
    { label: 'Pomodoro', minutes: 25 },
    { label: 'Pomodoro', minutes: 45 },
    { label: 'Break', minutes: 5 },
];

const GlobalTimer: React.FC = () => {
    const { pomodoroState, setPomodoroState, isTimerVisible, toggleTimerVisibility } = useTaskContext();
    const { selectedPreset, totalSeconds, secondsLeft, isRunning, isFinished } = pomodoroState;
    const activeLabel = presets[selectedPreset].label;

    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    if (!isTimerVisible) {
        return (
            <Tooltip title="Show Timer" placement="left">
                <Box
                    onClick={toggleTimerVisibility}
                    sx={{
                        position: 'fixed',
                        top: { xs: 24, md: 32 },
                        right: 0, // flush against the right edge
                        width: 24,
                        height: 48,
                        bgcolor: 'rgba(255,255,255,0.05)',
                        borderTopLeftRadius: 8,
                        borderBottomLeftRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        zIndex: 9999,
                        color: 'text.secondary',
                        transition: 'all 0.2s',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: 'primary.main',
                            width: 32,
                        }
                    }}
                >
                    <VisibilityRoundedIcon sx={{ fontSize: 16 }} />
                </Box>
            </Tooltip>
        );
    }

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    const selectPreset = (index: number) => {
        if (isRunning) return;
        const secs = presets[index].minutes * 60;
        setPomodoroState(prev => ({
            ...prev,
            selectedPreset: index,
            totalSeconds: secs,
            secondsLeft: secs,
            isFinished: false
        }));
    };

    const toggleTimer = () => {
        if (isFinished) {
            setPomodoroState(prev => ({ ...prev, secondsLeft: prev.totalSeconds, isFinished: false }));
            return;
        }
        if (!isRunning) {
            setPomodoroState(prev => ({ ...prev, endTime: Date.now() + prev.secondsLeft * 1000, isRunning: true }));
        } else {
            setPomodoroState(prev => ({ ...prev, endTime: null, isRunning: false }));
        }
    };

    const resetTimer = () => {
        setPomodoroState(prev => ({
            ...prev,
            isRunning: false,
            endTime: null,
            secondsLeft: prev.totalSeconds,
            isFinished: false
        }));
    };

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const progress = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;

    const radius = 90;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <Box
            sx={{
                position: 'fixed',
                top: { xs: 24, md: 32 },
                right: { xs: 24, md: 32 },
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                '&:hover .hide-btn': {
                    opacity: 1,
                    pointerEvents: 'auto',
                    transform: 'translateY(0)',
                }
            }}
        >
            {/* Floating Action Button */}
            <Fab
                aria-label="timer"
                onClick={handleClick}
                sx={{
                    boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                    transition: 'all 0.3s ease',
                    bgcolor: isFinished ? '#50c878 !important' : (isRunning ? 'rgba(74,144,226,0.85) !important' : 'rgba(255,255,255,0.1) !important'),
                    color: (isFinished || isRunning) ? '#fff !important' : 'rgba(255,255,255,0.7) !important',
                    opacity: isRunning && !open ? 0.7 : 1,
                    '&:hover': {
                        transform: 'scale(1.05)',
                        opacity: 1,
                        bgcolor: isFinished ? '#43a047 !important' : (isRunning ? '#4a90e2 !important' : 'rgba(255,255,255,0.2) !important'),
                    }
                }}
            >
                {(isRunning || secondsLeft !== totalSeconds) && !isFinished && (
                    <Box sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                        <svg width="100%" height="100%" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                            <circle
                                cx="28" cy="28" r="26"
                                fill="none"
                                stroke="rgba(255,255,255,0.2)"
                                strokeWidth="3"
                            />
                            <circle
                                cx="28" cy="28" r="26"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="3"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 26}
                                strokeDashoffset={2 * Math.PI * 26 * (1 - progress)}
                                style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                        </svg>
                    </Box>
                )}

                {isRunning || (secondsLeft !== totalSeconds && !isFinished) ? (
                    <Typography sx={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: 0.5, zIndex: 1 }}>
                        {minutes}:{String(seconds).padStart(2, '0')}
                    </Typography>
                ) : (
                    <TimerRoundedIcon sx={{ zIndex: 1 }} />
                )}
            </Fab>

            {/* Timer Popover */}
            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                slotProps={{ paper: { sx: { bgcolor: 'transparent', boxShadow: 'none', overflow: 'visible', mt: 2 } } }}
            >
                <Box sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 3,
                    px: 3,
                    borderRadius: 4,
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(20, 20, 25, 0.95)',
                    boxShadow: '0 24px 48px -12px rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(16px)',
                    width: '100%',
                    minWidth: 340,
                }}>
                    {/* Preset Buttons */}
                    <Box sx={{
                        display: 'flex',
                        gap: 1.5,
                        flexWrap: 'nowrap',
                        justifyContent: 'center',
                        width: '100%',
                    }}>
                        {presets.map((preset, i) => (
                            <Box
                                key={i}
                                onClick={() => selectPreset(i)}
                                sx={{
                                    cursor: isRunning ? 'default' : 'pointer',
                                    py: 0.8,
                                    px: 1.5,
                                    borderRadius: 2,
                                    border: '1px solid',
                                    borderColor: selectedPreset === i ? 'primary.main' : 'rgba(255,255,255,0.1)',
                                    bgcolor: selectedPreset === i ? 'rgba(74,144,226,0.15)' : 'transparent',
                                    transition: 'all 0.2s ease',
                                    opacity: isRunning && selectedPreset !== i ? 0.4 : 1,
                                    '&:hover': !isRunning ? { borderColor: 'rgba(74,144,226,0.4)', bgcolor: 'rgba(74,144,226,0.08)' } : {},
                                }}
                            >
                                <Typography variant="body2" sx={{
                                    color: selectedPreset === i ? '#fff' : 'rgba(255,255,255,0.5)',
                                    fontWeight: selectedPreset === i ? 600 : 400,
                                    fontSize: '0.75rem',
                                    letterSpacing: 0.5,
                                }}>
                                    {preset.label} · {preset.minutes}m
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ my: 2 }}>
                        <Typography variant="overline" sx={{ color: isFinished ? '#50c878' : 'rgba(255,255,255,0.4)', letterSpacing: 4, fontSize: '0.75rem', fontWeight: 600 }}>
                            {isFinished ? 'COMPLETED!' : activeLabel.toUpperCase()}
                        </Typography>
                    </Box>

                    {/* Circular Timer */}
                    <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, width: '100%', maxWidth: 220 }}>
                        <svg width="100%" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)', height: 'auto' }}>
                            <circle cx="100" cy="100" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                            <circle
                                cx="100" cy="100" r={radius}
                                fill="none"
                                stroke={isFinished ? '#50c878' : '#4a90e2'}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={circumference}
                                strokeDashoffset={strokeDashoffset}
                                style={{ transition: 'stroke-dashoffset 0.5s ease, stroke 0.3s ease' }}
                            />
                        </svg>
                        <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{
                                color: '#fff',
                                fontSize: '2.4rem',
                                fontWeight: 200,
                                letterSpacing: 4,
                                fontFamily: '"Inter", monospace',
                                lineHeight: 1,
                            }}>
                                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                            </Typography>
                        </Box>
                    </Box>

                    {/* Controls */}
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                        <IconButton
                            onClick={toggleTimer}
                            disableRipple
                            sx={{
                                width: 50, height: 50,
                                bgcolor: isFinished ? 'rgba(80,200,120,0.15)' : 'rgba(74,144,226,0.15)',
                                color: isFinished ? '#50c878' : '#4a90e2',
                                '&:hover': { bgcolor: isFinished ? 'rgba(80,200,120,0.25)' : 'rgba(74,144,226,0.25)', transform: 'scale(1.05)' },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            {isFinished ? <RestartAltRoundedIcon sx={{ fontSize: 26 }} /> : (isRunning ? <PauseRoundedIcon sx={{ fontSize: 26 }} /> : <PlayArrowRoundedIcon sx={{ fontSize: 26 }} />)}
                        </IconButton>
                        {(isRunning || secondsLeft !== totalSeconds) && !isFinished && (
                            <Button
                                onClick={resetTimer}
                                sx={{
                                    color: 'rgba(255,255,255,0.7)', bgcolor: 'rgba(255,255,255,0.03)',
                                    '&:hover': { color: '#fff', bgcolor: 'rgba(255,255,255,0.08)' },
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                    Reset
                                </Typography>
                            </Button>
                        )}
                    </Box>
                    </Box>
                </Popover>

                <Tooltip title="Hide Timer" placement="bottom">
                    <IconButton
                        className="hide-btn"
                        onClick={toggleTimerVisibility}
                        size="small"
                        sx={{
                            opacity: 0,
                            pointerEvents: 'none',
                            transform: 'translateY(-10px)',
                            transition: 'all 0.2s',
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: 'text.secondary',
                            '&:hover': {
                                bgcolor: 'rgba(211,47,47,0.2)',
                                color: 'error.main',
                            }
                        }}
                    >
                        <VisibilityOffRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                </Tooltip>
            </Box>
        );
    };

export default GlobalTimer;
