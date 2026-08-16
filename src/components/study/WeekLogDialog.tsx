import { useState, useEffect } from 'react';
import {
    Stack,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Typography,
} from '@mui/material';
import { useTaskContext } from '../../context/TaskContext';
import { planWeeks } from '../../data/studyPlan';

/** Empty box means "not logged", which is different from a logged zero. */
const toNumberOrNull = (value: string): number | null => {
    const trimmed = value.trim();
    if (trimmed === '') return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
};

/**
 * The Sunday two minutes. Shared by This Week and the Logbook so there is only
 * one way to write a week down.
 */
const WeekLogDialog = ({
    week,
    onClose,
    onSaved,
}: {
    week: number | null;
    onClose: () => void;
    /** Fired only when a week gains hours it did not have — the moment worth celebrating. */
    onSaved?: (isFirstTimeLogged: boolean) => void;
}) => {
    const { studyWeekLogs, saveWeekLog } = useTaskContext();
    const [form, setForm] = useState({ actualHours: '', dsaProblems: '', finished: '', learned: '' });
    const [isSaving, setIsSaving] = useState(false);

    const log = week !== null ? studyWeekLogs[week] : undefined;

    // Refill whenever a different week is opened.
    useEffect(() => {
        if (week === null) return;
        setForm({
            actualHours: log?.actualHours != null ? String(log.actualHours) : '',
            dsaProblems: log?.dsaProblems != null ? String(log.dsaProblems) : '',
            finished: log?.finished ?? '',
            learned: log?.learned ?? '',
        });
        // Only when the week changes — typing must not be overwritten by the
        // snapshot that arrives right after saving.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [week]);

    const planWeek = week !== null ? planWeeks[week - 1] : null;

    const handleSave = async () => {
        if (week === null) return;
        const hours = toNumberOrNull(form.actualHours);
        const wasUnlogged = log?.actualHours == null;

        setIsSaving(true);
        try {
            await saveWeekLog(week, {
                actualHours: hours,
                dsaProblems: toNumberOrNull(form.dsaProblems),
                finished: form.finished.trim(),
                learned: form.learned.trim(),
            });
            onSaved?.(wasUnlogged && hours !== null);
            onClose();
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={week !== null} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                Week {week} · {planWeek?.dates}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Target {planWeek?.targetHours}h · {planWeek?.phase.replace(/\*/g, '').trim()}
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
                <Button onClick={onClose}>Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={isSaving}>
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default WeekLogDialog;
