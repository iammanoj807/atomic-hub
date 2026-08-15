import { useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Button,
    IconButton,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { format, parseISO } from 'date-fns';
import { useTaskContext } from '../../context/TaskContext';
import { getLondonDateString } from '../../utils/date';
import { paperPasses } from '../../data/studyPlan';
import type { StudyPaper } from '../../services/firebaseService';
import StudyPageHeader from './StudyPageHeader';

const PASS_COLORS: Record<1 | 2 | 3, string> = {
    1: '#90a4ae',
    2: '#4a90e2',
    3: '#66bb6a',
};

const emptyForm = () => ({
    id: undefined as string | undefined,
    date: getLondonDateString(),
    title: '',
    venue: '',
    pass: 1 as 1 | 2 | 3,
    mainIdea: '',
    weakness: '',
});

const StudyPapersPage = () => {
    const { studyPapers, savePaper, deletePaper } = useTaskContext();

    const [form, setForm] = useState(emptyForm());
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<StudyPaper | null>(null);

    const openNew = () => {
        setForm(emptyForm());
        setIsFormOpen(true);
    };

    const openExisting = (paper: StudyPaper) => {
        setForm({
            id: paper.id,
            date: paper.date,
            title: paper.title,
            venue: paper.venue,
            pass: paper.pass,
            mainIdea: paper.mainIdea,
            weakness: paper.weakness,
        });
        setIsFormOpen(true);
    };

    const handleSave = async () => {
        if (!form.title.trim()) return;
        setIsSaving(true);
        try {
            await savePaper({
                id: form.id,
                date: form.date,
                title: form.title.trim(),
                venue: form.venue.trim(),
                pass: form.pass,
                mainIdea: form.mainIdea.trim(),
                weakness: form.weakness.trim(),
            });
            setIsFormOpen(false);
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (pendingDelete) {
            await deletePaper(pendingDelete.id);
            setPendingDelete(null);
        }
    };

    // Pass 3 is the one that actually changes you — worth counting separately.
    const deepReads = studyPapers.filter(paper => paper.pass === 3).length;

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="PAPERS LOG"
                title={
                    studyPapers.length === 0 ? (
                        'No papers logged yet.'
                    ) : (
                        <>
                            <Box component="span" sx={{ color: 'primary.main' }}>{studyPapers.length}</Box>
                            {` ${studyPapers.length === 1 ? 'paper' : 'papers'} read.`}
                        </>
                    )
                }
                subtitle="2-3 per week, around 60 over six months. Write the main idea in your own words or it did not happen."
                action={
                    <Button
                        variant="contained"
                        startIcon={<AddRoundedIcon />}
                        onClick={openNew}
                        sx={{ '&:focus': { outline: 'none' } }}
                    >
                        Log a paper
                    </Button>
                }
            />

            {/* The three-pass method */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                    mb: 5,
                }}
            >
                {paperPasses.map(pass => (
                    <Box
                        key={pass.pass}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'rgba(255,255,255,0.08)',
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{ color: PASS_COLORS[pass.pass], letterSpacing: 1.4, fontWeight: 800, fontSize: '0.68rem' }}
                        >
                            PASS {pass.pass} · {pass.time.toUpperCase()}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, lineHeight: 1.5 }}>
                            {pass.what}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {studyPapers.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        The first one is a pass 1
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.8 }}>
                        Ten minutes: abstract, figures, conclusion. That already counts.
                    </Typography>
                </Box>
            ) : (
                <>
                    <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                        <Chip
                            label={`${deepReads} re-derived (pass 3)`}
                            size="small"
                            sx={{
                                height: 24,
                                fontSize: '0.7rem',
                                color: PASS_COLORS[3],
                                bgcolor: `${PASS_COLORS[3]}1f`,
                            }}
                        />
                    </Stack>

                    <Stack spacing={1.5}>
                        {studyPapers.map(paper => (
                            <Box
                                key={paper.id}
                                sx={{
                                    p: { xs: 2, sm: 2.5 },
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'rgba(255,255,255,0.08)',
                                    borderLeft: '4px solid',
                                    borderLeftColor: PASS_COLORS[paper.pass],
                                }}
                            >
                                <Stack direction="row" alignItems="flex-start" spacing={1.5}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Stack
                                            direction="row"
                                            spacing={1}
                                            alignItems="center"
                                            flexWrap="wrap"
                                            useFlexGap
                                            sx={{ mb: 0.5 }}
                                        >
                                            <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                                {paper.title}
                                            </Typography>
                                            {paper.venue && (
                                                <Typography variant="body2" color="text.secondary">
                                                    {paper.venue}
                                                </Typography>
                                            )}
                                            <Chip
                                                label={`Pass ${paper.pass}`}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.62rem',
                                                    fontWeight: 700,
                                                    color: PASS_COLORS[paper.pass],
                                                    bgcolor: `${PASS_COLORS[paper.pass]}1f`,
                                                }}
                                            />
                                        </Stack>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ fontSize: '0.75rem', mb: 1 }}
                                        >
                                            {format(parseISO(paper.date), 'EEE d MMM yyyy')}
                                        </Typography>

                                        {paper.mainIdea && (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: 'text.primary', lineHeight: 1.6, mb: paper.weakness ? 1 : 0 }}
                                            >
                                                {paper.mainIdea}
                                            </Typography>
                                        )}
                                        {paper.weakness && (
                                            <Typography
                                                variant="body2"
                                                sx={{ color: '#ff8a65', lineHeight: 1.6, fontSize: '0.85rem' }}
                                            >
                                                {paper.weakness}
                                            </Typography>
                                        )}
                                    </Box>

                                    <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                        <Tooltip title="Edit">
                                            <IconButton
                                                size="small"
                                                aria-label={`Edit ${paper.title}`}
                                                onClick={() => openExisting(paper)}
                                                sx={{ color: 'text.disabled', '&:hover': { color: 'primary.main' } }}
                                            >
                                                <EditRoundedIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Delete">
                                            <IconButton
                                                size="small"
                                                aria-label={`Delete ${paper.title}`}
                                                onClick={() => setPendingDelete(paper)}
                                                sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                                            >
                                                <CloseRoundedIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Tooltip>
                                    </Stack>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </>
            )}

            {/* Add / edit */}
            <Dialog open={isFormOpen} onClose={() => setIsFormOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{form.id ? 'Edit paper' : 'Log a paper'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <TextField
                            label="Paper"
                            value={form.title}
                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                            fullWidth
                            autoFocus
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Venue / year"
                                placeholder="NeurIPS 2017"
                                value={form.venue}
                                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Date"
                                type="date"
                                value={form.date}
                                onChange={(e) => setForm({ ...form, date: e.target.value })}
                                slotProps={{ inputLabel: { shrink: true } }}
                                fullWidth
                            />
                        </Stack>

                        <Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                                Which pass?
                            </Typography>
                            <ToggleButtonGroup
                                exclusive
                                value={form.pass}
                                onChange={(_, value) => value && setForm({ ...form, pass: value })}
                                size="small"
                                fullWidth
                            >
                                {paperPasses.map(pass => (
                                    <ToggleButton
                                        key={pass.pass}
                                        value={pass.pass}
                                        sx={{ '&:focus': { outline: 'none' }, textTransform: 'none' }}
                                    >
                                        Pass {pass.pass} · {pass.time}
                                    </ToggleButton>
                                ))}
                            </ToggleButtonGroup>
                        </Box>

                        <TextField
                            label="Main idea IN MY OWN WORDS"
                            value={form.mainIdea}
                            onChange={(e) => setForm({ ...form, mainIdea: e.target.value })}
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <TextField
                            label="Weakness + the next experiment I would run"
                            value={form.weakness}
                            onChange={(e) => setForm({ ...form, weakness: e.target.value })}
                            multiline
                            minRows={2}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsFormOpen(false)}>Cancel</Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={isSaving || !form.title.trim()}
                    >
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog open={pendingDelete !== null} onClose={() => setPendingDelete(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete this paper?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This removes "{pendingDelete?.title}" and your notes on it. It can't be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPendingDelete(null)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudyPapersPage;
