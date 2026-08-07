import { useState, useEffect } from 'react';
import { Box, Typography, Avatar, IconButton, Tooltip } from '@mui/material';
import { useTaskContext } from '../context/TaskContext';

// Identity-based statements inspired by Atomic Habits
// "The most effective way to change your habits is to focus not on what you want to achieve,
//  but on who you wish to become." — James Clear
const identityStatements = [
    'I am a software engineer who sharpens their skills daily.',
    'I am an AI developer who learns something new every morning.',
    'I am someone who thinks deeply about system design.',
    'I am a confident communicator who handles technical and behavioural interviews with clarity, honesty, and calm.',
];

const IdentityBanner = () => {
    const { isMuted, setIsMuted } = useTaskContext();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % identityStatements.length);
                setFade(true);
            }, 400);
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    return (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                mb: 3,
                py: 1.5,
                minHeight: 90,
                maxWidth: 1000,
                mx: 'auto',
                width: '100%'
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                <Avatar
                    src="/manoj-thapa.png"
                    alt="Manoj Thapa"
                    sx={{
                        width: 44,
                        height: 44,
                        flexShrink: 0,
                    }}
                />
                <Typography
                    variant="body2"
                    sx={{
                        color: 'primary.light',
                        fontStyle: 'italic',
                        fontWeight: 500,
                        fontSize: '1.05rem',
                        letterSpacing: 0.3,
                        lineHeight: 1.5,
                        opacity: fade ? 1 : 0,
                        transition: 'opacity 0.4s ease-in-out',
                        minWidth: 0,
                    }}
                >
                    {identityStatements[currentIndex]}
                </Typography>
            </Box>

            {/* Music Indicator as Toggle Button */}
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    ml: 'auto',
                    flexShrink: 0
                }}
            >
                <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                    <IconButton 
                        size="small" 
                        onClick={() => setIsMuted(!isMuted)} 
                        sx={{ 
                            bgcolor: 'transparent',
                            outline: 'none !important',
                            '&:focus': { outline: 'none' },
                            '&:hover': { 
                                bgcolor: 'rgba(255,255,255,0.05)',
                                transform: 'scale(1.1)' 
                            }
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: 20 }}>
                            {[0.3, 0.5, 0.2, 0.7, 0.4].map((delay, i) => (
                                <Box
                                    key={i}
                                    sx={{
                                        width: 3,
                                        borderRadius: '2px',
                                        bgcolor: isMuted ? 'text.disabled' : 'primary.main',
                                        animation: `audioBar${i} ${0.8 + delay}s ease-in-out infinite`,
                                        animationPlayState: isMuted ? 'paused' : 'running',
                                        height: isMuted ? '4px' : undefined
                                    }}
                                />
                            ))}
                        </Box>
                    </IconButton>
                </Tooltip>
            </Box>
            <style>
                {`
                    @keyframes audioBar0 { 0%, 100% { height: 4px; } 50% { height: 16px; } }
                    @keyframes audioBar1 { 0%, 100% { height: 8px; } 50% { height: 20px; } }
                    @keyframes audioBar2 { 0%, 100% { height: 6px; } 50% { height: 12px; } }
                    @keyframes audioBar3 { 0%, 100% { height: 10px; } 50% { height: 18px; } }
                    @keyframes audioBar4 { 0%, 100% { height: 5px; } 50% { height: 14px; } }
                `}
            </style>
        </Box>
    );
};

export default IdentityBanner;
