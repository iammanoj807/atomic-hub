import { useState } from 'react';
import {
    Box, Typography, Stack, Button, TextField, Collapse, Chip,
} from '@mui/material';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import { useTaskContext } from '../../context/TaskContext';
import { getGateStatus, getGateAttemptCount } from '../../utils/studyProgress';

const PASSED = '#66bb6a';
const FAILED = '#ff8a65';
const WAITING = '#ffca28';

/**
 * The question at the end of a stage. Failing it is a real outcome — the plan
 * says repeat the stage — so the failed state is shown as plainly as the pass,
 * with the attempt count, rather than being quietly overwritten by the retry.
 */
const GateCard = ({
    stage,
    stageName,
    gate,
    today,
}: {
    stage: number;
    stageName: string;
    gate: string;
    today: string;
}) => {
    const { gateAttempts, saveGateAttempt } = useTaskContext();

    const status = getGateStatus(gateAttempts, stage);
    const attempts = getGateAttemptCount(gateAttempts, stage);

    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    const accent = status === 'passed' ? PASSED : status === 'failed' ? FAILED : WAITING;

    const record = async (passed: boolean) => {
        setSaving(true);
        try {
            await saveGateAttempt({ stage, date: today, passed, notes: notes.trim() });
            setNotes('');
            setOpen(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                mb: 3,
                bgcolor: `${accent}0f`,
                border: '1px solid',
                borderColor: `${accent}4d`,
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                {status === 'passed'
                    ? <CheckCircleRoundedIcon sx={{ fontSize: 18, color: accent }} />
                    : status === 'failed'
                        ? <ReplayRoundedIcon sx={{ fontSize: 18, color: accent }} />
                        : <LockRoundedIcon sx={{ fontSize: 18, color: accent }} />}
                <Typography
                    variant="caption"
                    sx={{ color: accent, letterSpacing: 1.4, fontWeight: 800, fontSize: '0.68rem' }}
                >
                    GATE · STAGE {stage}
                </Typography>
                <Box sx={{ flex: 1 }} />
                {attempts > 0 && (
                    <Chip
                        size="small"
                        label={`${attempts} attempt${attempts === 1 ? '' : 's'}`}
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, color: accent, bgcolor: `${accent}1f` }}
                    />
                )}
            </Stack>

            <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600, lineHeight: 1.5 }}>
                {gate}
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {status === 'passed'
                    ? `Stage ${stage} is done. ${stageName} is behind you.`
                    : status === 'failed'
                        ? 'Not passed yet. Repeat the stage — a stage passed by reading is not passed.'
                        : 'No progress past this until you can answer it without notes.'}
            </Typography>

            <Collapse in={open}>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                        label="How did it go? (optional)"
                        value={notes}
                        onChange={event => setNotes(event.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                        size="small"
                    />
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            onClick={() => record(true)}
                            disabled={saving}
                            size="small"
                            sx={{ bgcolor: PASSED, '&:hover': { bgcolor: PASSED } }}
                        >
                            I passed it
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => record(false)}
                            disabled={saving}
                            size="small"
                            sx={{ color: FAILED, borderColor: FAILED }}
                        >
                            Not yet
                        </Button>
                        <Button onClick={() => setOpen(false)} size="small" color="inherit">
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Collapse>

            {!open && (
                <Button
                    onClick={() => setOpen(true)}
                    size="small"
                    sx={{ mt: 1, color: accent, px: 0, '&:hover': { bgcolor: 'transparent' } }}
                >
                    {status === 'unattempted' ? 'Sit the gate' : 'Record another attempt'}
                </Button>
            )}
        </Box>
    );
};

export default GateCard;
