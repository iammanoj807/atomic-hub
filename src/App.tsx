import { useState, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { TaskProvider } from './context/TaskContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { OWNER_EMAIL, signInErrorMessage } from './utils/auth';
import { Box, Toolbar, Typography, TextField, Button, AppBar, IconButton, Tooltip, CircularProgress } from '@mui/material';
import WavingHandRoundedIcon from '@mui/icons-material/WavingHandRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DailyHabitsPage from './components/DailyHabitsPage';
import InterviewDashboard from './components/InterviewDashboard';
import CategoryPage from './components/CategoryPage';
import DSAHubPage from './components/DSAHubPage';
import DSATopicDetailPage from './components/DSATopicDetailPage';
import SystemDesignPage from './components/SystemDesignPage';
import SqlPage from './components/SqlPage';
import PatternDrillPage from './components/PatternDrillPage';
import DSAPatternsPage from './components/DSAPatternsPage';
import EvidenceLogPage from './components/EvidenceLogPage';
import CoreStoriesPage from './components/CoreStoriesPage';
import IdentityBanner from './components/IdentityBanner';
import GlobalTimer from './components/GlobalTimer';
import ReactPlayer from 'react-player';

// ML Foundations carries every lesson and animation (about 1 MB), so it loads
// as its own chunk instead of making the whole app bigger. vite.config.ts
// precaches it, so the installed app still opens it offline.
const FoundationsPage = lazy(() => import('./components/FoundationsPage'));

const PageLoading = () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress aria-label="Loading" />
    </Box>
);

interface LoginScreenProps {
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
}

function LoginScreen({ isMuted, setIsMuted }: LoginScreenProps) {
    const { signIn } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    // A real form submit handler, so Enter works natively and password
    // managers recognise it. The password goes to Firebase, which checks it
    // on the server and rate-limits repeated wrong guesses.
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        try {
            // On success the auth state changes and this screen unmounts.
            await signIn(code);
        } catch (err) {
            // The page shows a friendly line; the code here is what explains it.
            console.error('❌ Sign-in failed:', (err as { code?: string })?.code, err);
            setError(signInErrorMessage(err));
            setCode('');
            setSubmitting(false);
        }
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    return (
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
                    {/* There is one account, so only the password is asked for.
                        This hidden field carries the email so iCloud Keychain and
                        other password managers save and fill the pair. */}
                    <input type="email" name="username" autoComplete="username" value={OWNER_EMAIL} readOnly hidden />
                    <TextField
                        label="Password"
                        type="password"
                        name="password"
                        autoComplete="current-password"
                        value={code}
                        onChange={(e) => {
                            setCode(e.target.value);
                            if (error) setError(null);
                        }}
                        error={!!error}
                        helperText={error ?? ""}
                        autoFocus
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={submitting}
                        sx={{ '&:focus': { outline: 'none' } }}
                    >
                        Log In
                    </Button>
                </Box>
            </Box>
        </Box>
    );
}

function MainLayout() {
    return (
        <Router>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', width: '100%' }}>
                <Sidebar />
                <Box component="main" sx={{ flexGrow: 1, minWidth: 0, pt: 4, pb: 3, px: { xs: '5%', md: '8%' } }}>
                    <Toolbar sx={{ display: { md: 'none' } }} />
                    <IdentityBanner />
                    <Routes>
                        {/* Opening the app lands on Home, the sidebar's first item. */}
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/daily-tasks" element={<DailyHabitsPage />} />
                        <Route path="/evidence" element={<EvidenceLogPage />} />
                        <Route path="/dsa" element={<DSAHubPage />} />
                        <Route path="/dsa/drill" element={<PatternDrillPage />} />
                        <Route path="/dsa/patterns" element={<DSAPatternsPage />} />
                        <Route path="/dsa/:topicId" element={<DSATopicDetailPage />} />
                        <Route path="/foundations" element={<Suspense fallback={<PageLoading />}><FoundationsPage /></Suspense>} />
                        <Route path="/system-design" element={<SystemDesignPage />} />
                        <Route path="/sql" element={<SqlPage />} />
                        {/* The 52-week plan lived under /study; old bookmarks
                            land on the roadmap that replaced it. */}
                        <Route path="/study/*" element={<Navigate to="/foundations" replace />} />
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
    );
}

function AppShell() {
    const { status } = useAuth();
    // Not remembered: the music starts muted on every visit.
    const [isMuted, setIsMuted] = useState(true);

    return (
        <Box
            sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default', position: 'relative' }}
        >
            {/* While a saved session is restoring, show nothing rather than
                flash the login page at someone who is already signed in. */}
            {status === 'signedOut' && (
                <LoginScreen isMuted={isMuted} setIsMuted={setIsMuted} />
            )}
            {status === 'signedIn' && (
                <TaskProvider isMuted={isMuted} setIsMuted={setIsMuted}>
                    <MainLayout />
                </TaskProvider>
            )}
            <ReactPlayer
                src="https://youtu.be/5DriU6n_imk"
                autoPlay={!isMuted}
                loop
                volume={1}
                width="1px"
                height="1px"
                style={{ position: 'fixed', bottom: 0, left: 0, opacity: 0, pointerEvents: 'none', zIndex: -1 }}
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
        <AuthProvider>
            <AppShell />
        </AuthProvider>
    );
}

export default App;

