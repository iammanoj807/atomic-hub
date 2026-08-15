import { useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Button,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import { useTaskContext } from '../../context/TaskContext';
import { summariseHours, isUnderPace, UNDER_PACE_HOURS } from '../../utils/studyPlan';
import { planWeeks, PHASE_COLORS } from '../../data/studyPlan';
import StudyPageHeader from './StudyPageHeader';

/** Empty box means "not logged", which is different from a logged zero. */
const toNumberOrNull = (value: string): number | null => {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
};

const StudyHoursPage = () => {
    const { studyWeekLogs, currentWeekNumber, saveWeekLog } = useTaskContext();

    const [editingWeek, setEditingWeek] = useState<number | null>(null);
    const [form, setForm] = useState({ actualHours: '', dsaProblems: '', finished: '', learned: '' });
    const [isSaving, setIsSaving] = useState(false);

    const summary = summariseHours(studyWeekLogs, currentWeekNumber);
    const behind = isUnderPace(studyWeekLogs, currentWeekNumber);

    const openEditor = (week: number) => {
        const log = studyWeekLogs[week];
        setForm({
            actualHours: log?.actualHours != null ? String(log.actualHours) : '',
            dsaProblems: log?.dsaProblems != null ? String(log.dsaProblems) : '',
            finished: log?.finished ?? '',
            learned: log?.learned ?? '',
        });
        setEditingWeek(week);
    };

    const handleSave = async () => {
        if (editingWeek === null) return;
        setIsSaving(true);
        try {
            await saveWeekLog(editingWeek, {
                actualHours: toNumberOrNull(form.actualHours),
                dsaProblems: toNumberOrNull(form.dsaProblems),
                finished: form.finished.trim(),
                learned: form.learned.trim(),
            });
            setEditingWeek(null);
        } finally {
            setIsSaving(false);
        }
    };

    const editingPlanWeek = editingWeek !== null ? planWeeks[editingWeek - 1] : null;

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="HOURS LOG"
                title={
                    <>
                        <Box component="span" sx={{ color: 'primary.main' }}>{summary.actualTotal}</Box>
                        {` of ${summary.targetTotal} hours.`}
                    </>
                }
                subtitle="Fill this in every Sunday. It takes two minutes and it is the only honest record of the six months."
                action={
                    currentWeekNumber !== null && (
                        <Button
                            variant="contained"
                            startIcon={<EditRoundedIcon />}
                            onClick={() => openEditor(currentWeekNumber)}
                            sx={{ '&:focus': { outline: 'none' } }}
                        >
                            Log week {currentWeekNumber}
                        </Button>
                    )
                }
            />

            {/* The sheet's summary block. */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
                    gap: 2,
                    mb: 4,
                }}
            >
                {[
                    { label: 'ASKED FOR SO FAR', value: `${summary.targetToDate}h`, color: undefined },
                    {
                        label: 'DIFFERENCE',
                        value: `${summary.diffToDate > 0 ? '+' : ''}${summary.diffToDate}h`,
                        color: summary.diffToDate < 0 ? '#ff8a65' : '#66bb6a',
                    },
                    { label: 'WEEKS LOGGED', value: `${summary.weeksLogged}/${planWeeks.length}`, color: undefined },
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
                            sx={{ letterSpacing: 1.2, fontSize: '0.65rem', fontWeight: 700 }}
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
                <Alert severity="warning" variant="outlined" sx={{ mb: 4, borderRadius: 3 }}>
                    Under {UNDER_PACE_HOURS} hours for three weeks running. Cut the Sunday session first, then
                    Saturday. Keep the mornings and keep the daily DSA.
                </Alert>
            )}

            {/* One row per week. Click a row to log it. */}
            <Stack spacing={1}>
                {planWeeks.map(week => {
                    const log = studyWeekLogs[week.week];
                    const logged = log?.actualHours != null;
                    const diff = logged ? log.actualHours! - week.targetHours : null;
                    const isCurrent = week.week === currentWeekNumber;
                    const accent = PHASE_COLORS[week.phaseKey];

                    return (
                        <Box
                            key={week.week}
                            onClick={() => openEditor(week.week)}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                bgcolor: isCurrent ? 'rgba(41, 121, 255, 0.06)' : 'background.paper',
                                border: '1px solid',
                                borderColor: isCurrent ? 'primary.main' : 'rgba(255,255,255,0.08)',
                                borderLeft: '4px solid',
                                borderLeftColor: accent,
                                cursor: 'pointer',
                                transition: 'border-color 0.15s',
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
                                        <Typography
                                            variant="body2"
                                            sx={{ color: 'text.primary', lineHeight: 1.5, wordBreak: 'break-word' }}
                                        >
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

            <Typography variant="body2" color="text.secondary" sx={{ mt: 4, pb: 2, lineHeight: 1.7 }}>
                If you are under 16 hrs/week for 3 weeks running: cut Sunday, then Saturday. KEEP the mornings
                and KEEP the daily DSA. Those two habits are the plan.
            </Typography>

            {/* Sunday's two minutes */}
            <Dialog
                open={editingWeek !== null}
                onClose={() => setEditingWeek(null)}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    Week {editingWeek} · {editingPlanWeek?.dates}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Target {editingPlanWeek?.targetHours}h · {editingPlanWeek?.phase.replace(/\*/g, '').trim()}
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Stack spacing={2.5} sx={{ pt: 1 }}>
                        <Stack direction="row" spacing={2}>
                            <TextField
                                label="Hours actually done"
                                type="number"
                                value={form.actualHours}
                                onChange={(e) => setForm({ ...form, actualHours: e.target.value })}
                                inputProps={{ min: 0, step: 0.25 }}
                                fullWidth
                                autoFocus
                            />
                            <TextField
                                label="DSA problems done"
                                type="number"
                                value={form.dsaProblems}
                                onChange={(e) => setForm({ ...form, dsaProblems: e.target.value })}
                                inputProps={{ min: 0, step: 1 }}
                                fullWidth
                            />
                        </Stack>
                        <TextField
                            label="What I finished"
                            value={form.finished}
                            onChange={(e) => setForm({ ...form, finished: e.target.value })}
                            multiline
                            minRows={2}
                            fullWidth
                        />
                        <TextField
                            label="One thing I understand now that I didn't last week"
                            value={form.learned}
                            onChange={(e) => setForm({ ...form, learned: e.target.value })}
                            multiline
                            minRows={2}
                            fullWidth
                        />
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditingWeek(null)}>Cancel</Button>
                    <Button onClick={handleSave} variant="contained" disabled={isSaving}>
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default StudyHoursPage;
