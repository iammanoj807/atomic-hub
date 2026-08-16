import { useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Button,
    Alert,
    Tabs,
    Tab,
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
import { useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useTaskContext } from '../../context/TaskContext';
import { getLondonDateString } from '../../utils/date';
import { summariseHours, isUnderPace, UNDER_PACE_HOURS } from '../../utils/studyPlan';
import { planWeeks, PHASE_COLORS, paperPasses } from '../../data/studyPlan';
import type { StudyPaper } from '../../services/firebaseService';
import StudyPageHeader from './StudyPageHeader';
import WeekLogDialog from './WeekLogDialog';

const PASS_COLORS: Record<1 | 2 | 3, string> = { 1: '#90a4ae', 2: '#4a90e2', 3: '#66bb6a' };

const emptyPaperForm = () => ({
    id: undefined as string | undefined,
    date: getLondonDateString(),
    title: '',
    venue: '',
    pass: 1 as 1 | 2 | 3,
    mainIdea: '',
    weakness: '',
});

/**
 * Everything you have actually done: the weekly hours entry and the papers.
 * Both are the same act — writing down what happened — so they live together
 * rather than on two pages you have to remember to visit.
 */
const LogbookPage = () => {
    const { studyWeekLogs, currentWeekNumber, studyPapers, savePaper, deletePaper } = useTaskContext();

    // ?tab=papers, so "PAPERS 3" elsewhere can open the papers half directly.
    const [searchParams, setSearchParams] = useSearchParams();
    const tab = searchParams.get('tab') === 'papers' ? 1 : 0;
    const setTab = (value: number) =>
        setSearchParams(value === 1 ? { tab: 'papers' } : {}, { replace: true });

    const [editingWeek, setEditingWeek] = useState<number | null>(null);

    const [paperForm, setPaperForm] = useState(emptyPaperForm());
    const [isPaperFormOpen, setIsPaperFormOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [pendingDelete, setPendingDelete] = useState<StudyPaper | null>(null);

    const summary = summariseHours(studyWeekLogs, currentWeekNumber);
    const behind = isUnderPace(studyWeekLogs, currentWeekNumber);
    const deepReads = studyPapers.filter(paper => paper.pass === 3).length;

    const openNewPaper = () => {
        setPaperForm(emptyPaperForm());
        setIsPaperFormOpen(true);
    };

    const openExistingPaper = (paper: StudyPaper) => {
        setPaperForm({
            id: paper.id,
            date: paper.date,
            title: paper.title,
            venue: paper.venue,
            pass: paper.pass,
            mainIdea: paper.mainIdea,
            weakness: paper.weakness,
        });
        setIsPaperFormOpen(true);
    };

    const handleSavePaper = async () => {
        if (!paperForm.title.trim()) return;
        setIsSaving(true);
        try {
            await savePaper({
                id: paperForm.id,
                date: paperForm.date,
                title: paperForm.title.trim(),
                venue: paperForm.venue.trim(),
                pass: paperForm.pass,
                mainIdea: paperForm.mainIdea.trim(),
                weakness: paperForm.weakness.trim(),
            });
            setIsPaperFormOpen(false);
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

    return (
        <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="LOGBOOK"
                title={
                    <>
                        <Box component="span" sx={{ color: 'primary.main' }}>{summary.actualTotal}</Box>
                        {` hours, ${studyPapers.length} ${studyPapers.length === 1 ? 'paper' : 'papers'}.`}
                    </>
                }
                subtitle="Written down every Sunday. In February this is the only honest record of what the six months contained."
                action={
                    tab === 0
                        ? currentWeekNumber !== null && (
                            <Button
                                variant="contained"
                                startIcon={<EditRoundedIcon />}
                                onClick={() => setEditingWeek(currentWeekNumber)}
                                sx={{ '&:focus': { outline: 'none' } }}
                            >
                                Log week {currentWeekNumber}
                            </Button>
                        )
                        : (
                            <Button
                                variant="contained"
                                startIcon={<AddRoundedIcon />}
                                onClick={openNewPaper}
                                sx={{ '&:focus': { outline: 'none' } }}
                            >
                                Log a paper
                            </Button>
                        )
                }
            />

            <Tabs
                value={tab}
                onChange={(_, value) => setTab(value)}
                sx={{
                    mb: 3,
                    borderBottom: 1,
                    borderColor: 'rgba(255,255,255,0.08)',
                    '& .MuiTab-root': { textTransform: 'none', fontWeight: 700, '&:focus': { outline: 'none' } },
                }}
            >
                <Tab label={`Weeks · ${summary.weeksLogged}/${planWeeks.length}`} />
                <Tab label={`Papers · ${studyPapers.length}`} />
            </Tabs>

            {/* ---- WEEKS ---- */}
            {tab === 0 && (
                <Box>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                            gap: 2,
                            mb: 3,
                        }}
                    >
                        {[
                            { label: 'ASKED FOR SO FAR', value: `${summary.targetToDate}h`, color: undefined },
                            {
                                label: 'DIFFERENCE',
                                value: `${summary.diffToDate > 0 ? '+' : ''}${summary.diffToDate}h`,
                                color: summary.diffToDate < 0 ? '#ff8a65' : '#66bb6a',
                            },
                            { label: 'OF 540 HOURS', value: `${summary.actualTotal}`, color: undefined },
                            { label: 'DSA PROBLEMS', value: `${summary.dsaProblems}`, color: undefined },
                        ].map(stat => (
                            <Box
                                key={stat.label}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'rgba(255,255,255,0.08)',
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ letterSpacing: 1.2, fontSize: '0.62rem', fontWeight: 700 }}
                                >
                                    {stat.label}
                                </Typography>
                                <Typography
                                    variant="h4"
                                    sx={{
                                        color: stat.color ?? 'text.primary',
                                        fontWeight: 700,
                                        mt: 0.5,
                                        fontVariantNumeric: 'tabular-nums',
                                    }}
                                >
                                    {stat.value}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {behind && (
                        <Alert severity="warning" variant="outlined" sx={{ mb: 3, borderRadius: 3 }}>
                            Under {UNDER_PACE_HOURS} hours for three weeks running. Cut the papers session first,
                            then the AI engineering one. Keep the mornings and keep the daily DSA.
                        </Alert>
                    )}

                    <Stack spacing={1}>
                        {planWeeks.map(week => {
                            const log = studyWeekLogs[week.week];
                            const logged = log?.actualHours != null;
                            const diff = logged ? log.actualHours! - week.targetHours : null;
                            const isCurrent = week.week === currentWeekNumber;

                            return (
                                <Box
                                    key={week.week}
                                    onClick={() => setEditingWeek(week.week)}
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        bgcolor: isCurrent ? 'rgba(41, 121, 255, 0.06)' : 'background.paper',
                                        border: '1px solid',
                                        borderColor: isCurrent ? 'primary.main' : 'rgba(255,255,255,0.08)',
                                        borderLeft: '4px solid',
                                        borderLeftColor: PHASE_COLORS[week.phaseKey],
                                        cursor: 'pointer',
                                        '&:hover': { borderColor: 'primary.main' },
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Box sx={{ width: 96, flexShrink: 0 }}>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}
                                            >
                                                Week {week.week}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                                                {week.dates}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            {log?.finished ? (
                                                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5, wordBreak: 'break-word' }}>
                                                    {log.finished}
                                                </Typography>
                                            ) : (
                                                <Typography variant="body2" color="text.disabled">
                                                    {logged ? '—' : 'Not logged'}
                                                </Typography>
                                            )}
                                            {log?.learned && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ fontSize: '0.8rem', mt: 0.3, fontStyle: 'italic' }}
                                                >
                                                    {log.learned}
                                                </Typography>
                                            )}
                                        </Box>

                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                            {log?.daysOff && log.daysOff.length > 0 && (
                                                <Chip
                                                    label={`off ${log.daysOff.join(', ')}`}
                                                    size="small"
                                                    sx={{
                                                        height: 22,
                                                        fontSize: '0.62rem',
                                                        color: '#ff8a65',
                                                        bgcolor: 'rgba(255, 138, 101, 0.12)',
                                                    }}
                                                />
                                            )}
                                            {log?.dsaProblems != null && (
                                                <Chip
                                                    label={`${log.dsaProblems} DSA`}
                                                    size="small"
                                                    sx={{
                                                        height: 22,
                                                        fontSize: '0.65rem',
                                                        color: 'text.secondary',
                                                        bgcolor: 'rgba(255,255,255,0.05)',
                                                    }}
                                                />
                                            )}
                                            <Chip
                                                label={logged ? `${log.actualHours}/${week.targetHours}h` : `${week.targetHours}h`}
                                                size="small"
                                                sx={{
                                                    height: 24,
                                                    fontWeight: 700,
                                                    fontSize: '0.7rem',
                                                    fontVariantNumeric: 'tabular-nums',
                                                    color: diff === null ? 'text.secondary' : diff < 0 ? '#ff8a65' : '#66bb6a',
                                                    bgcolor:
                                                        diff === null
                                                            ? 'rgba(255,255,255,0.05)'
                                                            : diff < 0
                                                                ? 'rgba(255, 138, 101, 0.15)'
                                                                : 'rgba(102, 187, 106, 0.15)',
                                                }}
                                            />
                                        </Stack>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                </Box>
            )}

            {/* ---- PAPERS ---- */}
            {tab === 1 && (
                <Box>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                            gap: 2,
                            mb: 3,
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
                                    sx={{ color: PASS_COLORS[pass.pass], letterSpacing: 1.4, fontWeight: 800, fontSize: '0.66rem' }}
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
                            <Chip
                                label={`${deepReads} re-derived (pass 3)`}
                                size="small"
                                sx={{
                                    mb: 2,
                                    height: 24,
                                    fontSize: '0.7rem',
                                    color: PASS_COLORS[3],
                                    bgcolor: `${PASS_COLORS[3]}1f`,
                                }}
                            />

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
                                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
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

                                                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem', mb: 1 }}>
                                                    {format(parseISO(paper.date), 'EEE d MMM yyyy')}
                                                </Typography>

                                                {paper.mainIdea && (
                                                    <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6, mb: paper.weakness ? 1 : 0 }}>
                                                        {paper.mainIdea}
                                                    </Typography>
                                                )}
                                                {paper.weakness && (
                                                    <Typography variant="body2" sx={{ color: '#ff8a65', lineHeight: 1.6, fontSize: '0.85rem' }}>
                                                        {paper.weakness}
                                                    </Typography>
                                                )}
                                            </Box>

                                            <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        aria-label={`Edit ${paper.title}`}
                                                        onClick={() => openExistingPaper(paper)}
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
                </Box>
            )}

            <WeekLogDialog week={editingWeek} onClose={() => setEditingWeek(null)} />

            {/* Add / edit paper */}
            <Dialog open={isPaperFormOpen} onClose={() => setIsPaperFormOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{paperForm.id ? 'Edit paper' : 'Log a paper'}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <TextField
                            label="Paper"
                            value={paperForm.title}
                            onChange={(e) => setPaperForm({ ...paperForm, title: e.target.value })}
                            fullWidth
                            autoFocus
                        />
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <TextField
                                label="Venue / year"
                                placeholder="NeurIPS 2017"
                                value={paperForm.venue}
                                onChange={(e) => setPaperForm({ ...paperForm, venue: e.target.value })}
                                fullWidth
                            />
                            <TextField
                                label="Date"
                                type="date"
                                value={paperForm.date}
                                onChange={(e) => setPaperForm({ ...paperForm, date: e.target.value })}
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
                                value={paperForm.pass}
                                onChange={(_, value) => value && setPaperForm({ ...paperForm, pass: value })}
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
                            value={paperForm.mainIdea}
                            onChange={(e) => setPaperForm({ ...paperForm, mainIdea: e.target.value })}
                            multiline
                            minRows={3}
                            fullWidth
                        />
                        <TextField
                            label="Weakness + the next experiment I would run"
                            value={paperForm.weakness}
                            onChange={(e) => setPaperForm({ ...paperForm, weakness: e.target.value })}
                            multiline
                            minRows={2}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setIsPaperFormOpen(false)}>Cancel</Button>
                    <Button onClick={handleSavePaper} variant="contained" disabled={isSaving || !paperForm.title.trim()}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

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

export default LogbookPage;
