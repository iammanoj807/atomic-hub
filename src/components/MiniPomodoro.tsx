import React from 'react';
import { Box, Typography, IconButton, Collapse } from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import PauseRoundedIcon from '@mui/icons-material/PauseRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import { useTaskContext } from '../context/TaskContext';

const MiniPomodoro: React.FC = () => {
    const { pomodoroState, setPomodoroState, isSidebarCollapsed } = useTaskContext();
    const { totalSeconds, secondsLeft, isRunning, isFinished } = pomodoroState;

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
    const radius = 16;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: 1.5,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            bgcolor: 'rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease',
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isSidebarCollapsed ? 'center' : 'space-between', width: '100%', gap: 1 }}>
                
                {/* Circular Mini Timer */}
                <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 40, height: 40, flexShrink: 0 }}>
                    <svg width="40" height="40" viewBox="0 0 40 40" style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="20" cy="20" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                        <circle
                            cx="20" cy="20" r={radius}
                            fill="none"
                            stroke={isFinished ? '#50c878' : '#4a90e2'}
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                        />
                    </svg>
                    {isSidebarCollapsed && (
                        <Box sx={{ position: 'absolute', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%' }}>
                            <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, color: isFinished ? '#50c878' : 'text.primary' }}>
                                {minutes}m
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Expanded Controls */}
                <Collapse in={!isSidebarCollapsed} orientation="horizontal">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography sx={{
                            color: '#fff',
                            fontSize: '1.2rem',
                            fontWeight: 600,
                            fontFamily: '"Inter", monospace',
                            letterSpacing: 1,
                            minWidth: 54
                        }}>
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                        </Typography>
                        
                        <IconButton
                            onClick={toggleTimer}
                            size="small"
                            sx={{
                                color: isFinished ? '#50c878' : (isRunning ? '#ff9800' : '#4a90e2'),
                                bgcolor: isFinished ? 'rgba(80,200,120,0.1)' : 'rgba(74,144,226,0.1)',
                                '&:hover': { bgcolor: isFinished ? 'rgba(80,200,120,0.2)' : 'rgba(74,144,226,0.2)' }
                            }}
                        >
                            {isFinished ? <RestartAltRoundedIcon fontSize="small" /> : (isRunning ? <PauseRoundedIcon fontSize="small" /> : <PlayArrowRoundedIcon fontSize="small" />)}
                        </IconButton>
                        
                        {(isRunning || secondsLeft !== totalSeconds) && !isFinished && (
                            <IconButton onClick={resetTimer} size="small" sx={{ color: 'text.disabled', '&:hover': { color: 'text.primary' } }}>
                                <RestartAltRoundedIcon fontSize="small" />
                            </IconButton>
                        )}
                    </Box>
                </Collapse>
            </Box>
        </Box>
    );
};

export default MiniPomodoro;
