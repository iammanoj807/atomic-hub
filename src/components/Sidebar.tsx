import { useState } from 'react';
import {
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Box,
    Typography,
    useTheme,
    useMediaQuery,
    Toolbar,
    AppBar,
    Collapse,
    Dialog,
    DialogTitle,
    DialogContent,
    TextField,
    DialogActions,
    Button,
    Tooltip,
} from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import LockOpenRoundedIcon from '@mui/icons-material/LockOpenRounded';
import HomeRoundedIcon from '@mui/icons-material/HomeRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import RecordVoiceOverRoundedIcon from '@mui/icons-material/RecordVoiceOverRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import WorkRoundedIcon from '@mui/icons-material/WorkRounded';
import EmojiObjectsRoundedIcon from '@mui/icons-material/EmojiObjectsRounded';
import PsychologyRoundedIcon from '@mui/icons-material/PsychologyRounded';
import LeaderboardRoundedIcon from '@mui/icons-material/LeaderboardRounded';
import GroupsRoundedIcon from '@mui/icons-material/GroupsRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import MapRoundedIcon from '@mui/icons-material/MapRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import RocketLaunchRoundedIcon from '@mui/icons-material/RocketLaunchRounded';
import TimelineRoundedIcon from '@mui/icons-material/TimelineRounded';
import ArticleRoundedIcon from '@mui/icons-material/ArticleRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTaskContext, type Category } from '../context/TaskContext';

const DRAWER_WIDTH_EXPANDED = 380;
const DRAWER_WIDTH_COLLAPSED = 88;

const categoryIcons: Record<Category, React.ReactNode> = {
    'Personal Background': <PersonRoundedIcon />,
    'Career Decisions': <WorkRoundedIcon />,
    'Tech Achievements': <EmojiObjectsRoundedIcon />,
    'Problem Solving': <PsychologyRoundedIcon />,
    'Leadership': <LeaderboardRoundedIcon />,
    'Collaboration': <GroupsRoundedIcon />,
    'Failure & Learning': <SchoolRoundedIcon />,
    'Strengths-Based': <FitnessCenterRoundedIcon />,
    'Closing Strategy': <CheckCircleRoundedIcon />,
    'Company Questions': <BusinessRoundedIcon />,
};

/** The eight pages of the 26-week plan, in the order the plan itself uses them. */
const studyPages: { label: string; path: string; icon: React.ReactNode }[] = [
    { label: 'Overview', path: '/study', icon: <DashboardRoundedIcon fontSize="small" /> },
    { label: '26 Weeks', path: '/study/weeks', icon: <CalendarMonthRoundedIcon fontSize="small" /> },
    { label: 'Daily Routine', path: '/study/routine', icon: <ScheduleRoundedIcon fontSize="small" /> },
    { label: 'DSA Patterns', path: '/study/patterns', icon: <CodeRoundedIcon fontSize="small" /> },
    { label: 'Resources', path: '/study/resources', icon: <MenuBookRoundedIcon fontSize="small" /> },
    { label: 'Projects', path: '/study/projects', icon: <RocketLaunchRoundedIcon fontSize="small" /> },
    { label: 'Hours Log', path: '/study/hours', icon: <TimelineRoundedIcon fontSize="small" /> },
    { label: 'Papers Log', path: '/study/papers', icon: <ArticleRoundedIcon fontSize="small" /> },
];

const Sidebar = () => {
    const [mobileOpen, setMobileOpen] = useState(false);
    const [interviewOpen, setInterviewOpen] = useState(false);
    const [studyOpen, setStudyOpen] = useState(false);
    // const [isCollapsed, setIsCollapsed] = useState(false); // Removed local state //
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const location = useLocation();
    const { 
        isAdmin, 
        verifyAdmin, 
        logoutAdmin, 
        isSidebarCollapsed, 
        toggleSidebar,
        isMuted,
        setIsMuted
    } = useTaskContext();

    // Use isSidebarCollapsed from context instead of local state
    // On mobile, never collapse the sidebar drawer content
    const isCollapsed = isMobile ? false : isSidebarCollapsed;

    // Admin Dialog State
    const [isAdminDialogOpen, setIsAdminDialogOpen] = useState(false);
    const [adminCode, setAdminCode] = useState('');
    const [adminError, setAdminError] = useState(false);

    const handleAdminLogin = () => {
        if (verifyAdmin(adminCode)) {
            setIsAdminDialogOpen(false);
            setAdminCode('');
            setAdminError(false);
        } else {
            setAdminError(true);
        }
    };

    const handleAdminLogout = () => {
        logoutAdmin();
    };

    const toggleMute = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsMuted(!isMuted);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleCollapseToggle = () => {
        toggleSidebar();
    };

    const handleInterviewToggle = () => {
        if (isCollapsed) {
            // If collapsed, just navigate to overview without expanding
            navigate('/interview-prep');
            return;
        }

        if (!interviewOpen) {
            navigate('/interview-prep');
        }
        setInterviewOpen(!interviewOpen);
    };

    const handleStudyToggle = () => {
        if (isCollapsed) {
            navigate('/study');
            return;
        }

        if (!studyOpen) {
            navigate('/study');
        }
        setStudyOpen(!studyOpen);
    };

    const categories: Category[] = [
        'Personal Background',
        'Career Decisions',
        'Tech Achievements',
        'Problem Solving',
        'Leadership',
        'Collaboration',
        'Failure & Learning',
        'Strengths-Based',
        'Closing Strategy',
    ];

    const handleNavigation = (path: string) => {
        navigate(path);
        // Collapse Interview Hub if navigating away from interview-related paths
        if (!path.startsWith('/interview-prep') && !path.startsWith('/category') && !path.startsWith('/core-stories')) {
            setInterviewOpen(false);
        }
        // Same for the Study Plan group — leaving the section closes it.
        if (!path.startsWith('/study')) {
            setStudyOpen(false);
        }
        if (isMobile) {
            setMobileOpen(false);
        }
    };

    const isActive = (path: string) => {
        return location.pathname + location.search === path;
    };

    const isInterviewActive = location.pathname.startsWith('/interview-prep')
        || location.pathname.startsWith('/category')
        || location.pathname.startsWith('/core-stories');
    const isDSAActive = location.pathname.startsWith('/dsa');
    const isStudyActive = location.pathname.startsWith('/study');

    const currentDrawerWidth = isCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH_EXPANDED;

    const drawerContent = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }}>
            {/* Header: Logo & Admin (Hide on mobile as it's in the top bar) */}
            {!isMobile && (
                <Box
                    sx={{
                        pt: 4,
                        px: isCollapsed ? 1 : 2,
                        pb: 3,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: isCollapsed ? 'center' : 'space-between',
                        minHeight: 88, // Ensure consistent height
                    }}
                >
                    {/* Logo - Clickable */}
                    {!isCollapsed ? (
                        <Box
                            onClick={() => handleNavigation('/dashboard')}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 },
                                flex: 1
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'primary.main',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <RecordVoiceOverRoundedIcon sx={{ color: 'common.white' }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 0.5, whiteSpace: 'nowrap' }}>
                                ATOMIC HUB
                            </Typography>
                        </Box>
                    ) : (
                        <Tooltip title="Atomic Hub" placement="right" disableHoverListener={!isCollapsed}>
                            <Box
                                onClick={() => handleNavigation('/dashboard')}
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'primary.main',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    flexShrink: 0,
                                    '&:hover': { opacity: 0.8 }
                                }}
                            >
                                <RecordVoiceOverRoundedIcon sx={{ color: 'common.white' }} />
                            </Box>
                        </Tooltip>
                    )}

                    {!isCollapsed && (
                        <>
                            <Tooltip title={isAdmin ? "Lock App" : "Unlock App"}>
                                <IconButton
                                    onClick={() => isAdmin ? logoutAdmin() : setIsAdminDialogOpen(true)}
                                    size="small"
                                    sx={{
                                        color: isAdmin ? 'success.main' : 'text.disabled',
                                        '&:hover': {
                                            color: isAdmin ? 'error.main' : 'primary.main',
                                            bgcolor: isAdmin ? 'rgba(211, 47, 47, 0.1)' : 'rgba(41, 121, 255, 0.1)',
                                        }
                                    }}
                                >
                                    {isAdmin ? <LockOpenRoundedIcon fontSize="small" /> : <LockRoundedIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                        </>
                    )}


                </Box>
            )}

            <List sx={{ px: 1 }}>
                {/* 1. HOME */}
                <ListItem disablePadding>
                    <Tooltip title="Home" placement="right" disableHoverListener={!isCollapsed}>
                        <ListItemButton
                            onClick={() => handleNavigation('/dashboard')}
                            selected={isActive('/dashboard')}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                mx: isCollapsed ? 0 : 2,
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                px: isCollapsed ? 2 : 2,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(41, 121, 255, 0.1)',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'rgba(41, 121, 255, 0.15)' },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, mr: isCollapsed ? 0 : 0, justifyContent: 'center' }}>
                                <HomeRoundedIcon />
                            </ListItemIcon>
                            {!isCollapsed && <ListItemText primary="Home" />}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>

                {/* 2. DAILY TASKS */}
                <ListItem disablePadding>
                    <Tooltip title="Daily Tasks" placement="right" disableHoverListener={!isCollapsed}>
                        <ListItemButton
                            onClick={() => handleNavigation('/daily-tasks')}
                            selected={isActive('/daily-tasks')}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                mx: isCollapsed ? 0 : 2,
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                px: isCollapsed ? 2 : 2,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(41, 121, 255, 0.1)',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'rgba(41, 121, 255, 0.15)' },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, mr: isCollapsed ? 0 : 0, justifyContent: 'center' }}>
                                <AssignmentTurnedInRoundedIcon />
                            </ListItemIcon>
                            {!isCollapsed && <ListItemText primary="Daily Tasks" />}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>

                {/* 3. EVIDENCE LOG */}
                <ListItem disablePadding>
                    <Tooltip title="Evidence Log" placement="right" disableHoverListener={!isCollapsed}>
                        <ListItemButton
                            onClick={() => handleNavigation('/evidence')}
                            selected={isActive('/evidence')}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                mx: isCollapsed ? 0 : 2,
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                px: isCollapsed ? 2 : 2,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(41, 121, 255, 0.1)',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'rgba(41, 121, 255, 0.15)' },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, mr: isCollapsed ? 0 : 0, justifyContent: 'center' }}>
                                <ReceiptLongRoundedIcon />
                            </ListItemIcon>
                            {!isCollapsed && <ListItemText primary="Evidence Log" />}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>

                {/* 4. STUDY PLAN (Collapsible) — the 26 weeks */}
                <ListItem disablePadding>
                    <Tooltip title="Study Plan" placement="right" disableHoverListener={!isCollapsed}>
                        <ListItemButton
                            onClick={handleStudyToggle}
                            selected={isStudyActive || studyOpen}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                mx: isCollapsed ? 0 : 2,
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                px: isCollapsed ? 2 : 2,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(41, 121, 255, 0.1)',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'rgba(41, 121, 255, 0.15)' },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, mr: isCollapsed ? 0 : 0, justifyContent: 'center' }}>
                                <MapRoundedIcon />
                            </ListItemIcon>
                            {!isCollapsed && <ListItemText primary="Study Plan" />}
                            {!isCollapsed && (studyOpen ? <ExpandLess /> : <ExpandMore />)}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>

                <Collapse in={studyOpen && !isCollapsed} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                        {studyPages.map((page) => (
                            <ListItemButton
                                key={page.path}
                                onClick={() => handleNavigation(page.path)}
                                selected={location.pathname === page.path}
                                sx={{
                                    borderRadius: 2,
                                    pl: 4,
                                    mb: 0.5,
                                    mx: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(41, 121, 255, 0.1)',
                                        color: 'primary.main',
                                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                    {page.icon}
                                </ListItemIcon>
                                <ListItemText primary={page.label} />
                            </ListItemButton>
                        ))}
                    </List>
                </Collapse>

                {/* 5. DSA HUB */}
                <ListItem disablePadding>
                    <Tooltip title="NeetCode 150" placement="right" disableHoverListener={!isCollapsed}>
                        <ListItemButton
                            onClick={() => handleNavigation('/dsa')}
                            selected={isDSAActive}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                mx: isCollapsed ? 0 : 2,
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                px: isCollapsed ? 2 : 2,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(41, 121, 255, 0.1)',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'rgba(41, 121, 255, 0.15)' },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, mr: isCollapsed ? 0 : 0, justifyContent: 'center' }}>
                                <CodeRoundedIcon />
                            </ListItemIcon>
                            {!isCollapsed && <ListItemText primary="NeetCode 150" />}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>

                {/* 6. INTERVIEW HUB (Collapsible) */}
                <ListItem disablePadding>
                    <Tooltip title="Interview Hub" placement="right" disableHoverListener={!isCollapsed}>
                        <ListItemButton
                            onClick={handleInterviewToggle}
                            selected={isInterviewActive || interviewOpen}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                mx: isCollapsed ? 0 : 2,
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                                px: isCollapsed ? 2 : 2,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(41, 121, 255, 0.1)',
                                    color: 'primary.main',
                                    '&:hover': { bgcolor: 'rgba(41, 121, 255, 0.15)' },
                                    '& .MuiListItemIcon-root': {
                                        color: 'primary.main',
                                    },
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: isCollapsed ? 0 : 40, mr: isCollapsed ? 0 : 0, justifyContent: 'center' }}>
                                <RecordVoiceOverRoundedIcon />
                            </ListItemIcon>
                            {!isCollapsed && <ListItemText primary="Interview Hub" />}
                            {!isCollapsed && (interviewOpen ? <ExpandLess /> : <ExpandMore />)}
                        </ListItemButton>
                    </Tooltip>
                </ListItem>

                <Collapse in={interviewOpen && !isCollapsed} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding sx={{ pl: 2 }}>
                        {/* 3a. Overview / Status */}
                        <ListItemButton
                            onClick={() => handleNavigation('/interview-prep')}
                            selected={isActive('/interview-prep')}
                            sx={{
                                borderRadius: 2,
                                pl: 4,
                                mb: 0.5,
                                mx: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(41, 121, 255, 0.1)',
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' }
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <DashboardRoundedIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Overview" />
                        </ListItemButton>

                        {/* 3a-ii. Core Stories — the mental model, above the categories
                            because it's what you read before the individual answers. */}
                        <ListItemButton
                            onClick={() => handleNavigation('/core-stories')}
                            selected={isActive('/core-stories')}
                            sx={{
                                borderRadius: 2,
                                pl: 4,
                                mb: 0.5,
                                mx: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(41, 121, 255, 0.1)',
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' }
                                },
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40 }}>
                                <AutoStoriesRoundedIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Core Stories" />
                        </ListItemButton>

                        {/* 3b. Categories */}
                        {categories.map((category) => (
                            <ListItemButton
                                key={category}
                                onClick={() => handleNavigation(`/category/${encodeURIComponent(category)}`)}
                                selected={location.pathname === `/category/${encodeURIComponent(category)}`}
                                sx={{
                                    borderRadius: 2,
                                    pl: 4,
                                    mb: 0.5,
                                    mx: 2,
                                    '&.Mui-selected': {
                                        bgcolor: 'rgba(41, 121, 255, 0.1)',
                                        color: 'primary.main',
                                        '& .MuiListItemIcon-root': { color: 'primary.main' }
                                    },
                                }}
                            >
                                <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
                                    {categoryIcons[category]}
                                </ListItemIcon>
                                <ListItemText
                                    primary={category}
                                />
                            </ListItemButton>
                        ))}

                        {/* 3c. Target Companies (Moved to end) */}
                        <ListItemButton
                            selected={location.pathname === `/category/${encodeURIComponent('Company Questions')}`}
                            onClick={() => handleNavigation(`/category/${encodeURIComponent('Company Questions')}`)}
                            sx={{
                                borderRadius: 2,
                                pl: 4,
                                mb: 0.5,
                                mx: 2,
                                '&.Mui-selected': {
                                    bgcolor: 'rgba(41, 121, 255, 0.1)',
                                    color: 'primary.main',
                                    '& .MuiListItemIcon-root': { color: 'primary.main' }
                                }
                            }}
                        >
                            <ListItemIcon sx={{ minWidth: 40, color: location.pathname === `/category/${encodeURIComponent('Company Questions')}` ? 'primary.main' : 'text.secondary' }}>
                                {categoryIcons['Company Questions']}
                            </ListItemIcon>
                            <ListItemText primary="Target Companies" />
                        </ListItemButton>
                    </List>
                </Collapse>
            </List>

            {/* Expander/Collapser Button at Bottom */}
            <Box sx={{
                mt: 'auto',
                p: 2,
                display: { xs: 'none', md: 'flex' },
                justifyContent: isCollapsed ? 'center' : 'flex-end'
            }}>
                <Tooltip title={isCollapsed ? "Expand" : "Collapse"} placement="right">
                    <IconButton aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'} onClick={handleCollapseToggle} sx={{ outline: 'none !important' }}>
                        {isCollapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Admin Login Dialog */}
            <Dialog open={isAdminDialogOpen} onClose={() => setIsAdminDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Unlock App</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
                        <TextField
                            autoFocus
                            label="Password"
                            type="password"
                            fullWidth
                            variant="outlined"
                            value={adminCode}
                            onChange={(e) => {
                                setAdminCode(e.target.value);
                                setAdminError(false);
                            }}
                            error={adminError}
                            helperText={adminError ? "Incorrect password" : ""}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAdminLogin();
                            }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsAdminDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleAdminLogin} variant="contained">Unlock</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );

    return (
        <>
            {isMobile && (
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                        bgcolor: 'background.default',
                        color: 'text.primary',
                        borderBottom: 1,
                        borderColor: 'divider',
                        zIndex: (theme) => theme.zIndex.drawer + 1
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', minHeight: 72 }}>
                        <Box
                            onClick={() => handleNavigation('/dashboard')}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1.5,
                                cursor: 'pointer',
                                '&:hover': { opacity: 0.8 },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    bgcolor: 'primary.main',
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                }}
                            >
                                <RecordVoiceOverRoundedIcon sx={{ fontSize: 24, color: 'common.white' }} />
                            </Box>
                            <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 0.5 }}>
                                ATOMIC HUB
                            </Typography>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title={isMuted ? "Unmute" : "Mute"}>
                                <IconButton
                                    size="small"
                                    onClick={toggleMute}
                                    sx={{
                                        mr: 1,
                                        bgcolor: 'transparent',
                                        outline: 'none !important',
                                        '&:hover': {
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                            transform: 'scale(1.1)'
                                        },
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
                            <Tooltip title={isAdmin ? "Lock App" : "Unlock App"}>
                                <IconButton
                                    onClick={() => isAdmin ? handleAdminLogout() : setIsAdminDialogOpen(true)}
                                    size="small"
                                    sx={{
                                        color: isAdmin ? 'success.main' : 'text.disabled',
                                        '&:hover': {
                                            color: isAdmin ? 'error.main' : 'primary.main',
                                            bgcolor: isAdmin ? 'rgba(211, 47, 47, 0.1)' : 'rgba(41, 121, 255, 0.1)',
                                        }
                                    }}
                                >
                                    {isAdmin ? <LockOpenRoundedIcon fontSize="small" /> : <LockRoundedIcon fontSize="small" />}
                                </IconButton>
                            </Tooltip>
                            <IconButton
                                edge="end"
                                onClick={handleDrawerToggle}
                                sx={{ color: 'text.primary', outline: 'none !important' }}
                            >
                                {mobileOpen ? <CloseRoundedIcon /> : <MenuRoundedIcon />}
                            </IconButton>
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
                    </Toolbar>
                </AppBar>
            )}

            <Box
                component="nav"
                sx={{
                    width: { md: currentDrawerWidth },
                    flexShrink: { md: 0 },
                    transition: theme.transitions.create('width', {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH_EXPANDED,
                            bgcolor: 'background.default',
                            backgroundImage: 'none',
                            mt: '72px', // Start below the increased header height
                            height: 'calc(100% - 72px)', // Adjust height
                        },
                    }}
                >
                    {drawerContent}
                </Drawer>

                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: currentDrawerWidth,
                            bgcolor: 'background.default',
                            borderRight: 1,
                            borderColor: 'divider',
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            overflowX: 'hidden'
                        },
                    }}
                    open
                >
                    {drawerContent}
                </Drawer>
            </Box>
        </>
    );
};

export default Sidebar;