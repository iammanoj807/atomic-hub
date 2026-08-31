import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider, useTaskContext } from './context/TaskContext';
import { Box, Toolbar, Typography, TextField, Button, AppBar, IconButton, Tooltip } from '@mui/material';
import WavingHandRoundedIcon from '@mui/icons-material/WavingHandRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DailyHabitsPage from './components/DailyHabitsPage';
import InterviewDashboard from './components/InterviewDashboard';
import CategoryPage from './components/CategoryPage';
import DSAHubPage from './components/DSAHubPage';
import DSATopicDetailPage from './components/DSATopicDetailPage';
import EvidenceLogPage from './components/EvidenceLogPage';
import CoreStoriesPage from './components/CoreStoriesPage';
import TodayPage from './components/study/TodayPage';
import ThisWeekPage from './components/study/ThisWeekPage';
import JourneyPage from './components/study/JourneyPage';
import LogbookPage from './components/study/LogbookPage';
import LibraryPage from './components/study/LibraryPage';
import ReadingPage from './components/study/ReadingPage';
import ArtifactsPage from './components/study/ArtifactsPage';
import IdentityBanner from './components/IdentityBanner';
import GlobalTimer from './components/GlobalTimer';
import ReactPlayer from 'react-player';
import { getPlanPhase } from './utils/studyPlan';
import { getLondonDateString } from './utils/date';

/**
 * While the plan is running the app opens on Today, because that is the
 * question being asked at 06:00. Outside those 26 weeks there is no today to
 * show, so the dashboard remains home.
 */
function HomeRedirect() {
    const running = getPlanPhase(getLondonDateString()) === 'during';
    return <Navigate to={running ? '/study/today' : '/dashboard'} replace />;
}

function MainLayout() {
    const { isAdmin, verifyAdmin, isMuted, setIsMuted } = useTaskContext();
    const [code, setCode] = useState('');
    const [error, setError] = useState(false);
    const audioRef = useRef<HTMLVideoElement>(null);



    useEffect(() => {
        if (!isAdmin) {
            setCode('');
            setError(false);
        }
    }, [isAdmin]);

    // A real form submit handler, so Enter works natively and password
    // managers recognise it. The old version listened for onKeyPress, which
    // is deprecated and never fired for some input methods.
    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyAdmin(code)) {
            setError(true);
            setCode('');
        }
    };



    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    return (
        <Box
            sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', position: 'relative' }}
        >
            {/* Login Screen */}
            {!isAdmin ? (
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, md: 3 }, textAlign: 'center' }}>
                    <AppBar position="static" elevation={0} sx={{ bgcolor: 'transparent', borderBottom: '1px solid', borderColor: 'divider', py: 1, width: '100%' }}>
                        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative' }}>
                            {/* Empty box for flex spacing (left) */}
                            <Box sx={{ display: { xs: 'none', sm: 'block' }, flex: 1 }} />

                            {/* Center Title */}
                            <Box sx={{ flex: { xs: 1, sm: 'auto' }, display: 'flex', justifyContent: { xs: 'flex-start', sm: 'center' } }}>
                                <Typography variant="h4" fontWeight="bold" color="primary.main" sx={{ letterSpacing: { xs: 1, sm: 3 }, textTransform: 'uppercase', fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
                                    Atomic Hub
                                </Typography>
                            </Box>

                            {/* Music Indicator (right) */}
                            <Box sx={{ flex: { xs: 0, sm: 1 }, display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1 }}>


                                {/* Realistic Audio Wave Bars as Toggle Button */}
                                <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                                    <IconButton
                                        size="small"
                                        onClick={toggleMute}
                                        sx={{
                                            bgcolor: 'transparent',
                                            outline: 'none !important',
                                            '&:hover': {
                                                bgcolor: 'rgba(255,255,255,0.05)',
                                                transform: 'scale(1.1)'
                                            },
                                            '&:focus': { outline: 'none' },
                                            '&.MuiButtonBase-root': { outline: 'none' }
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
                                                        height: isMuted ? '4px' : undefined // Set default low height when paused if desired, but paused will just freeze it
                                                    }}
                                                />
                                            ))}
                                        </Box>
                                    </IconButton>
                                </Tooltip>
                            </Box>
                        </Toolbar>
                        <style>
                            {`
                                @keyframes audioBar0 { 0%, 100% { height: 4px; } 50% { height: 16px; } }
                                @keyframes audioBar1 { 0%, 100% { height: 8px; } 50% { height: 20px; } }
                                @keyframes audioBar2 { 0%, 100% { height: 6px; } 50% { height: 12px; } }
                                @keyframes audioBar3 { 0%, 100% { height: 10px; } 50% { height: 18px; } }
                                @keyframes audioBar4 { 0%, 100% { height: 5px; } 50% { height: 14px; } }
                            `}
                        </style>
                    </AppBar>

                    {/* Top section: Greeting */}
                    <Box sx={{ pt: 8 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, justifyContent: 'center' }}>
                            <Typography variant="h2" fontWeight="800" color="text.primary">
                                Hi, Manoj
                            </Typography>
                            <WavingHandRoundedIcon sx={{ fontSize: 56, color: '#e2a97e' }} />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.8, justifyContent: 'center' }}>
                            <PersonRoundedIcon fontSize="small" color="primary" />
                            <Typography variant="h6" color="text.secondary">
                                Personal Space
                            </Typography>
                        </Box>
                    </Box>

                    <Box sx={{ flexGrow: 0.4 }} />

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 12 }}>
                        <Box sx={{ mb: 5, maxWidth: 600, textAlign: 'center' }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontStyle: 'italic',
                                    fontWeight: 500,
                                    opacity: 0.75,
                                    color: 'primary.light',
                                    letterSpacing: 0.3,
                                    lineHeight: 1.6,
                                    fontSize: '1.55rem'
                                }}
                            >
                                "The pain of discipline weighs ounces. The pain of regret weighs tonnes."
                            </Typography>
                        </Box>

                        <Box
                            component="form"
                            onSubmit={handleLogin}
                            sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 320 }}
                        >
                            <TextField
                                label="Password"
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                value={code}
                                onChange={(e) => {
                                    setCode(e.target.value);
                                    if (error) setError(false);
                                }}
                                error={error}
                                helperText={error ? "Incorrect password" : ""}
                                autoFocus
                            />
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                sx={{ '&:focus': { outline: 'none' } }}
                            >
                                Log In
                            </Button>
                        </Box>
                    </Box>
                </Box>
            ) : (
                <Router>
                    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', width: '100%' }}>
                        <Sidebar />
                        <Box component="main" sx={{ flexGrow: 1, pt: 4, pb: 3, px: { xs: '5%', md: '8%' } }}>
                            <Toolbar sx={{ display: { md: 'none' } }} />
                            <IdentityBanner />
                            <Routes>
                                <Route path="/" element={<HomeRedirect />} />
                                <Route path="/dashboard" element={<Dashboard />} />
                                <Route path="/daily-tasks" element={<DailyHabitsPage />} />
                                <Route path="/evidence" element={<EvidenceLogPage />} />
                                <Route path="/dsa" element={<DSAHubPage />} />
                                <Route path="/dsa/:topicId" element={<DSATopicDetailPage />} />
                                <Route path="/study" element={<ThisWeekPage />} />
                                <Route path="/study/today" element={<TodayPage />} />
                                <Route path="/study/journey" element={<JourneyPage />} />
                                <Route path="/study/logbook" element={<LogbookPage />} />
                                <Route path="/study/library" element={<LibraryPage />} />
                                <Route path="/study/reading" element={<ReadingPage />} />
                                <Route path="/study/artifacts" element={<ArtifactsPage />} />
                                {/* The plan used to be eight pages; anything bookmarked
                                    from then lands on the week you are actually in. */}
                                <Route path="/study/*" element={<Navigate to="/study" replace />} />
                                <Route path="/interview-prep" element={<InterviewDashboard />} />
                                <Route path="/core-stories" element={<CoreStoriesPage />} />
                                <Route path="/category/:categoryName" element={<CategoryPage />} />
                                {/* Catch-all route for any unknown URLs */}
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </Box>
                        <GlobalTimer />
                    </Box>
                </Router>
            )}
            <ReactPlayer
                ref={audioRef}
                src="https://www.youtube.com/watch?v=hydk9hHO1Ko"
                playing={!isMuted}
                volume={1}
                width="1px"
                height="1px"
                style={{ position: 'fixed', bottom: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
                onReady={() => {
                    if (audioRef.current && audioRef.current.currentTime < 0) {
                        audioRef.current.currentTime = 0;
                    }
                }}
                onEnded={() => {
                    if (audioRef.current) {
                        audioRef.current.currentTime = 0;
                        audioRef.current.play().catch(() => {});
                    }
                }}
                config={{
                    youtube: {
                        start: 0,
                        rel: 0,
                    },
                }}
            />
        </Box>
    );
}

function App() {
    return (
        <TaskProvider>
            <MainLayout />
        </TaskProvider>
    );
}

export default App;

