import { useParams } from 'react-router-dom';
import { Box, Typography, Stack, LinearProgress, Fab, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Grid, Card, CardActionArea, IconButton, Tooltip } from '@mui/material';
import { useTaskContext, type Category } from '../context/TaskContext';
import { getCoreStory } from '../data/coreStories';
import { computeReadiness } from '../utils/practice';
import { getLondonDateString } from '../utils/date';

import AddIcon from '@mui/icons-material/Add';

import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import { useState, useEffect } from 'react';

import TaskItem from './TaskItem';
import QuestionDialog from './QuestionDialog';


const CategoryPage = () => {
    const { categoryName } = useParams<{ categoryName: string }>();

    const {
        tasks,
        companies,
        addTask,
        updateTask,
        deleteTask,
        addCompany,
        updateCompany,
        deleteCompany,
        toggleTaskCompletion,
        practiceRecords,
        isAdmin
    } = useTaskContext();

    // UI State
    const [expandedTask, setExpandedTask] = useState<string | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isAddCompanyDialogOpen, setIsAddCompanyDialogOpen] = useState(false);

    const [isEditCompanyDialogOpen, setIsEditCompanyDialogOpen] = useState(false);
    const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
    const [editCompanyName, setEditCompanyName] = useState('');

    // Form State
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskAnswer, setNewTaskAnswer] = useState('');
    const [newTaskTag, setNewTaskTag] = useState<string | null>(null);
    // Edited as one bullet per line — much faster to type than a list editor.
    const [newTaskMemory, setNewTaskMemory] = useState('');

    // Practice mode hides every answer until asked for, across the category.
    const [practiceMode, setPracticeMode] = useState(false);

    // Validation State
    const [titleError, setTitleError] = useState(false);
    const [answerError, setAnswerError] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');

    // Edit State
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState('');
    const [editTaskAnswer, setEditTaskAnswer] = useState('');
    const [editTaskTag, setEditTaskTag] = useState<string | null>(null);
    const [editTaskMemory, setEditTaskMemory] = useState('');

    // Expand State for Inputs
    const [isAddExpanded, setIsAddExpanded] = useState(false);
    const [isEditExpanded, setIsEditExpanded] = useState(false);

    // Navigation State
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

    const category = decodeURIComponent(categoryName || '') as Category;
    const isCompanyCategory = category === 'Company Questions';

    // Reset selection when category changes
    useEffect(() => {
        if (!isCompanyCategory) {
            setSelectedCompanyId(null);
        }
    }, [category, isCompanyCategory]);



    // Derived Data
    const getDisplayTasks = () => {
        if (isCompanyCategory) {
            if (selectedCompanyId) {
                return tasks.filter(t => t.companyId === selectedCompanyId);
            }
            return []; // Should not happen in list view
        }
        return tasks.filter(t => t.category === category);
    };

    const categoryTasks = getDisplayTasks();

    // Progress here means practice, not ticked-off content — the same change
    // made to the Interview Hub headline. Company Questions keep the
    // completion-based bars below, where "have I prepared this" is the question.
    const today = getLondonDateString();
    const categoryProgress = computeReadiness(categoryTasks, practiceRecords, today).coverage;

    const globalTasks = tasks.filter(t => t.category !== 'Company Questions');
    const globalProgress = computeReadiness(globalTasks, practiceRecords, today).coverage;

    // Company Global Progress (Isolated)
    const companyGlobalTasks = tasks.filter(t => t.category === 'Company Questions');
    const companyGlobalCompleted = companyGlobalTasks.filter(t => t.completed).length;
    const companyGlobalTotal = companyGlobalTasks.length;
    const companyGlobalProgress = companyGlobalTotal > 0 ? Math.round((companyGlobalCompleted / companyGlobalTotal) * 100) : 0;

    // Category Index Display
    let categoryIndex = ['Personal Background', 'Career Decisions', 'Tech Achievements', 'Problem Solving', 'Leadership', 'Collaboration', 'Failure & Learning', 'Closing Strategy'].indexOf(category) + 1;
    if (isCompanyCategory) categoryIndex = 1;

    /** One bullet per line, blanks dropped. Strips leading bullets (-, *, •) so they don't double-render. */
    const parseMemoryPoints = (raw: string): string[] =>
        raw.split('\n')
           .map(line => line.replace(/^[\s•\-*]+/, '').trim())
           .filter(Boolean);

    // Handlers
    const toggleExpand = (taskId: string) => {
        setExpandedTask(expandedTask === taskId ? null : taskId);
    };

    const handleAddTask = () => {
        const isTitleValid = newTaskTitle.trim().length > 0;
        const isAnswerValid = newTaskAnswer.trim().length > 0;

        setTitleError(!isTitleValid);
        setAnswerError(!isAnswerValid);

        if (isTitleValid && isAnswerValid) {
            const taskData: any = {
                title: newTaskTitle,
                description: newTaskAnswer,
                category: category,
            };

            if (isCompanyCategory && selectedCompanyId) {
                taskData.companyId = selectedCompanyId;
            }

            if (newTaskTag) {
                taskData.tag = newTaskTag;
            }

            const memoryPoints = parseMemoryPoints(newTaskMemory);
            if (memoryPoints.length > 0) {
                taskData.memoryPoints = memoryPoints;
            }

            addTask(taskData);
            setNewTaskTitle('');
            setNewTaskAnswer('');
            setNewTaskTag(null);
            setNewTaskMemory('');
            setTitleError(false);
            setAnswerError(false);
            setIsAddDialogOpen(false);
        }
    };

    const handleAddCompany = () => {
        if (newCompanyName.trim()) {
            addCompany(newCompanyName.trim());
            setNewCompanyName('');
            setIsAddCompanyDialogOpen(false);
        }
    };

    const handleDeleteTask = (taskId: string) => {
        deleteTask(taskId);
    };

    const handleOpenEdit = (task: any) => {
        setEditingTaskId(task.id);
        setEditTaskTitle(task.title);
        setEditTaskAnswer(task.description || '');
        setEditTaskTag(task.tag || null);
        
        // Load the effective memory points (including inherited core story points) so the form isn't empty
        const directMemoryPoints = task.memoryPoints ?? [];
        const coreStory = task.coreStoryId ? getCoreStory(task.coreStoryId) : undefined;
        const coreStoryMemoryPoints = coreStory?.memoryPoints ?? [];
        const effectiveMemoryPoints = directMemoryPoints.length > 0 ? directMemoryPoints : coreStoryMemoryPoints;
        
        // Prepend bullets for easy editing
        setEditTaskMemory(effectiveMemoryPoints.map((p: string) => `• ${p}`).join('\n'));
        setIsEditExpanded(false);
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = () => {
        if (editingTaskId && editTaskTitle.trim()) {
            updateTask(editingTaskId, {
                title: editTaskTitle.trim(),
                description: editTaskAnswer.trim(),
                ...(editTaskTag ? { tag: editTaskTag } : { tag: '' }),
                // Always written, so clearing the box actually clears the points.
                memoryPoints: parseMemoryPoints(editTaskMemory),
            });
            setIsEditDialogOpen(false);
            setEditingTaskId(null);
            setEditTaskTitle('');
            setEditTaskAnswer('');
            setEditTaskMemory('');
        }
    };

    const handleOpenEditCompany = (company: { id: string, name: string }) => {
        setEditingCompanyId(company.id);
        setEditCompanyName(company.name);
        setIsEditCompanyDialogOpen(true);
    };

    const handleSaveEditCompany = () => {
        if (editingCompanyId && editCompanyName.trim()) {
            updateCompany(editingCompanyId, editCompanyName.trim());
            setIsEditCompanyDialogOpen(false);
            setEditingCompanyId(null);
            setEditCompanyName('');
        }
    };


    // Render Company List View
    if (isCompanyCategory && !selectedCompanyId) {
        return (
            <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
                {/* Header (Simplified for Company List) */}
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={{ xs: 2, sm: 0 }}
                    sx={{
                        mb: 4,
                        pb: 3,
                        borderBottom: 1,
                        borderColor: 'rgba(255,255,255,0.1)'
                    }}
                >
                    <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
                            INTERVIEW PREPARATION
                        </Typography>
                        <Typography
                            variant="h4"
                            fontWeight="bold"
                            color="text.primary"
                            sx={{ fontSize: { xs: '1.75rem', sm: '2.125rem' } }}
                        >
                            Target Companies
                        </Typography>
                    </Box>
                    {/* Company Global Progress */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                        <Typography
                            variant="body2"
                            color="primary.main"
                            fontWeight="bold"
                            sx={{ whiteSpace: 'nowrap' }}
                        >
                            {companyGlobalProgress}% Readiness
                        </Typography>
                        <Box sx={{ width: { xs: '100%', sm: 100 }, flex: { xs: 1, sm: 'none' } }}>
                            <LinearProgress
                                variant="determinate"
                                value={companyGlobalProgress}
                                sx={{
                                    height: 4,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.1)'
                                }}
                            />
                        </Box>
                    </Box>
                </Stack >

                <Grid container spacing={4}>
                    {companies.map((company) => {
                        const companyTasks = tasks.filter(t => t.companyId === company.id);
                        const companyTaskCount = companyTasks.length;
                        const companyCompletedInfo = companyTasks.filter(t => t.completed).length;
                        const companyProgress = companyTaskCount > 0 ? (companyCompletedInfo / companyTaskCount) * 100 : 0;

                        return (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={company.id}>
                                <Card
                                    sx={{
                                        bgcolor: 'rgba(255,255,255,0.03)',
                                        borderRadius: 3,
                                        border: 1,
                                        borderColor: 'rgba(255,255,255,0.08)',
                                        transition: 'all 0.2s',
                                        aspectRatio: '1 / 1', // Perfect square regardless of width
                                        display: 'flex',
                                        flexDirection: 'column',
                                        position: 'relative', // For absolute positioning of delete icon
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            borderColor: 'primary.main',
                                            bgcolor: 'rgba(255,255,255,0.05)',
                                        }
                                    }}
                                >
                                    {/* Delete Button - Admin Only */}
                                    {isAdmin && (
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="medium"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteCompany(company.id);
                                                }}
                                                sx={{
                                                    position: 'absolute',
                                                    top: 12,
                                                    right: 12,
                                                    zIndex: 10,
                                                    color: 'text.disabled',
                                                    '&:hover': { color: 'error.main', bgcolor: 'rgba(211, 47, 47, 0.1)' },
                                                }}
                                            >
                                                <CloseRoundedIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}

                                    <CardActionArea
                                        onClick={() => setSelectedCompanyId(company.id)}
                                        sx={{ p: 4, height: '100%', alignItems: 'flex-start', justifyContent: 'flex-start' }}
                                    >
                                        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                            {/* Top: Company Name */}
                                            <Box sx={{ width: '100%', overflow: 'hidden' }}>
                                                <Typography
                                                    variant="h4"
                                                    fontWeight="bold"
                                                    color="text.primary"
                                                    onClick={(e) => {
                                                        if (isAdmin) {
                                                            e.stopPropagation();
                                                            handleOpenEditCompany(company);
                                                        }
                                                    }}
                                                    sx={{
                                                        mb: 0,
                                                        lineHeight: 1.2,
                                                        wordBreak: 'break-word',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 3,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        cursor: isAdmin ? 'pointer' : 'default',
                                                        fontSize: { xs: '1.5rem', md: '2.125rem' } // Responsive font size
                                                    }}
                                                >
                                                    {company.name}
                                                </Typography>
                                            </Box>

                                            {/* Bottom: Progress Info */}
                                            <Box sx={{ width: '100%' }}>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                                                    <BusinessRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                                    <Typography variant="body1" color="text.secondary" noWrap>
                                                        {companyTaskCount} Questions
                                                    </Typography>
                                                </Stack>
                                                {/* Card Progress Bar */}
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={companyProgress}
                                                    sx={{
                                                        height: 4,
                                                        borderRadius: 2,
                                                        bgcolor: 'rgba(255,255,255,0.1)',
                                                        '& .MuiLinearProgress-bar': {
                                                            bgcolor: companyProgress === 100 ? 'success.main' : 'primary.main'
                                                        }
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                    </CardActionArea>
                                </Card>
                            </Grid>
                        );
                    })}

                    {/* Add Company Card - Admin Only */}
                    {isAdmin && (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card
                                sx={{
                                    bgcolor: 'transparent',
                                    boxShadow: 'none', // Ensure no shadow
                                    borderRadius: 3,
                                    border: 'none', // No border as requested
                                    cursor: 'pointer',
                                    aspectRatio: '1 / 1', // Matching perfect square
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    transition: 'all 0.2s',
                                    '&:hover': {
                                        transform: 'scale(1.02)',
                                        // No background change on hover
                                    }
                                }}
                                onClick={() => setIsAddCompanyDialogOpen(true)}
                            >
                                <Stack alignItems="center" spacing={2} sx={{ p: 4 }}>
                                    <AddIcon sx={{ fontSize: 64, color: 'primary.main', opacity: 0.8 }} />
                                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                                        Add Company
                                    </Typography>
                                </Stack>
                            </Card>
                        </Grid>
                    )}
                </Grid>

                {/* Add Company Dialog */}
                <Dialog open={isAddCompanyDialogOpen} onClose={() => setIsAddCompanyDialogOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle>Add Target Company</DialogTitle>
                    <DialogContent>
                        <TextField
                            label="Company Name"
                            placeholder="e.g. Google, Amazon, Meta"
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 1 }}
                            value={newCompanyName}
                            onChange={(e) => {
                                if (e.target.value.length <= 20) {
                                    setNewCompanyName(e.target.value);
                                }
                            }}
                            inputProps={{ maxLength: 20 }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && newCompanyName.trim()) {
                                    handleAddCompany();
                                }
                            }}
                        />

                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsAddCompanyDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddCompany} variant="contained" disabled={!newCompanyName.trim()}>
                            Add Company
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Company Dialog */}
                <Dialog open={isEditCompanyDialogOpen} onClose={() => setIsEditCompanyDialogOpen(false)} fullWidth maxWidth="xs">
                    <DialogTitle>Edit Company Name</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            label="Company Name"
                            fullWidth
                            variant="outlined"
                            sx={{ mt: 1 }}
                            value={editCompanyName}
                            onChange={(e) => {
                                if (e.target.value.length <= 20) {
                                    setEditCompanyName(e.target.value);
                                }
                            }}
                            inputProps={{ maxLength: 20 }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && editCompanyName.trim()) {
                                    handleSaveEditCompany();
                                }
                            }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setIsEditCompanyDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveEditCompany} variant="contained" disabled={!editCompanyName.trim()}>
                            Save Changes
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box >
        );
    }

    // Render Task List View (Company Detail OR Standard Category)
    const selectedCompany = isCompanyCategory ? companies.find(c => c.id === selectedCompanyId) : null;
    const pageTitle = isCompanyCategory ? selectedCompany?.name : category;
    const pageSubtitle = isCompanyCategory ? 'Company Questions' : `Category ${categoryIndex}`;

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            {/* Top Status Bar */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, sm: 0 }}
                sx={{
                    pb: 3,
                    mb: 4,
                    borderBottom: 1,
                    borderColor: 'rgba(255,255,255,0.1)'
                }}
            >
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
                        PREPARATION STATUS
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="text.primary">
                        {isCompanyCategory ? 'Target Companies' : category}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: { xs: '100%', sm: 'auto' } }}>
                    <Typography
                        variant="body2"
                        color="primary.main"
                        fontWeight="bold"
                        sx={{ whiteSpace: 'nowrap' }}
                    >
                        {isCompanyCategory
                            ? `${companyGlobalProgress}% Readiness`
                            : `${globalProgress}% Coverage`}
                    </Typography>
                    <Box sx={{ width: { xs: '100%', sm: 120 }, flex: { xs: 1, sm: 'none' } }}>
                        <LinearProgress
                            variant="determinate"
                            value={isCompanyCategory ? companyGlobalProgress : globalProgress}
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.1)',
                            }}
                        />
                    </Box>
                </Box>
            </Stack>

            {/* Header */}
            <Box sx={{ mb: 5 }}>
                <Box sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 2,
                    flexWrap: 'wrap',
                    '@media (max-width: 465px)': {
                        flexDirection: 'column',
                    },
                }}>
                    {isCompanyCategory && (
                        <IconButton aria-label="Back to all companies" onClick={() => setSelectedCompanyId(null)} sx={{ mt: { xs: 0.5, sm: 1.5 }, border: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                            <ArrowBackRoundedIcon />
                        </IconButton>
                    )}
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            sx={{
                                color: 'text.primary',
                                mb: 1,
                                fontSize: { xs: '2rem', sm: '3.75rem' },
                                wordBreak: 'break-word',
                            }}
                        >
                            {pageTitle}
                        </Typography>
                        <Typography variant="body1" color="text.secondary">
                            {pageSubtitle}
                        </Typography>
                    </Box>
                    <Box sx={{
                        flexShrink: 0,
                        textAlign: 'right',
                        '@media (max-width: 465px)': {
                            textAlign: 'left',
                        },
                    }}>
                        <Typography
                            variant="h2"
                            fontWeight="bold"
                            color="primary.main"
                            sx={{ fontSize: { xs: '2rem', sm: '3.75rem' } }}
                        >
                            {categoryProgress}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                            {isCompanyCategory ? 'COMPANY PROGRESS' : 'CATEGORY COVERAGE'}
                        </Typography>
                    </Box>
                </Box>
            </Box>

            {/* Practice mode — how you actually drill: question first, nothing else. */}
            {categoryTasks.length > 0 && (
                <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button
                        size="small"
                        onClick={() => {
                            setPracticeMode(!practiceMode);
                            setExpandedTask(null);
                        }}
                        startIcon={<SchoolRoundedIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            color: practiceMode ? '#f5a623' : 'text.secondary',
                            '&:focus': { outline: 'none' },
                        }}
                    >
                        {practiceMode ? 'Practice mode on' : 'Practice mode'}
                    </Button>
                </Box>
            )}

            {/* Tasks List */}
            <Stack spacing={0} sx={{ mb: 4 }}>
                {categoryTasks.map((task, index) => (
                    <TaskItem
                        key={task.id}
                        task={task}
                        index={index}
                        totalTasks={categoryTasks.length}
                        isAdmin={isAdmin}
                        isExpanded={expandedTask === task.id}
                        practiceMode={practiceMode}
                        toggleTaskCompletion={toggleTaskCompletion}
                        toggleExpand={toggleExpand}
                        handleOpenEdit={handleOpenEdit}
                        handleDeleteTask={handleDeleteTask}
                    />
                ))}
            </Stack>

            {categoryTasks.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        No stories {isCompanyCategory ? 'for this company' : 'in this category'} yet
                    </Typography>
                </Box>
            )}

            {/* Add Question FAB (Admin Only) */}
            {isAdmin && (isCompanyCategory ? selectedCompanyId : true) && (
                <>
                    <Fab
                        color="primary"
                        aria-label="add"
                        sx={{
                            position: 'fixed',
                            bottom: 32,
                            right: 32,
                            outline: 'none !important',
                        }}
                        onClick={() => {
                            setIsAddExpanded(false);
                            setIsAddDialogOpen(true);
                        }}
                    >
                        <AddIcon />
                    </Fab>

                    <QuestionDialog
                        open={isAddDialogOpen}
                        heading={isCompanyCategory
                            ? `Add New Question for ${selectedCompany?.name}`
                            : `Add New Question to ${category}`}
                        submitLabel="Add Question"
                        values={{
                            title: newTaskTitle,
                            answer: newTaskAnswer,
                            memoryPoints: newTaskMemory,
                            tag: newTaskTag,
                        }}
                        onChange={(v) => {
                            setNewTaskTitle(v.title);
                            if (v.title.trim()) setTitleError(false);
                            setNewTaskAnswer(v.answer);
                            if (v.answer.trim()) setAnswerError(false);
                            setNewTaskMemory(v.memoryPoints);
                            setNewTaskTag(v.tag);
                        }}
                        onClose={() => setIsAddDialogOpen(false)}
                        onSubmit={handleAddTask}
                        showTagPicker={isCompanyCategory}
                        isExpanded={isAddExpanded}
                        onToggleExpanded={() => setIsAddExpanded(!isAddExpanded)}
                        titleError={titleError}
                        answerError={answerError}
                        submitOnTitleEnter
                    />
                </>
            )}

            <QuestionDialog
                open={isEditDialogOpen}
                heading="Edit Question"
                submitLabel="Save Changes"
                values={{
                    title: editTaskTitle,
                    answer: editTaskAnswer,
                    memoryPoints: editTaskMemory,
                    tag: editTaskTag,
                }}
                onChange={(v) => {
                    setEditTaskTitle(v.title);
                    setEditTaskAnswer(v.answer);
                    setEditTaskMemory(v.memoryPoints);
                    setEditTaskTag(v.tag);
                }}
                onClose={() => setIsEditDialogOpen(false)}
                onSubmit={handleSaveEdit}
                showTagPicker={isCompanyCategory}
                isExpanded={isEditExpanded}
                onToggleExpanded={() => setIsEditExpanded(!isEditExpanded)}
            />
        </Box>
    );
};

export default CategoryPage;
