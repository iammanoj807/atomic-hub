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
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded';
import { format, parseISO } from 'date-fns';
import { useTaskContext } from '../context/TaskContext';
import { EVIDENCE_TAG_COLORS, EVIDENCE_TAG_LABELS } from '../data/evidenceTypes';
import type { EvidenceEntry } from '../services/firebaseService';

/** How many entries "Read your receipts" shows — a month of proof. */
const RECEIPTS_COUNT = 30;

/** Groups already-sorted (newest first) entries into month buckets, order preserved. */
const groupByMonth = (entries: EvidenceEntry[]): { month: string; entries: EvidenceEntry[] }[] => {
    const groups: { month: string; entries: EvidenceEntry[] }[] = [];

    for (const entry of entries) {
        const month = format(parseISO(entry.date), 'MMMM yyyy');
        const current = groups[groups.length - 1];

        if (current && current.month === month) {
            current.entries.push(entry);
        } else {
            groups.push({ month, entries: [entry] });
        }
    }

    return groups;
};

const EvidenceLogPage = () => {
    const { evidenceEntries, deleteEvidence } = useTaskContext();

    const [isReceiptsOpen, setIsReceiptsOpen] = useState(false);
    // Deleting is confirmed even though the rest of the app deletes directly:
    // the entire point of this log is that it can't be erased by a bad mood.
    const [pendingDeleteDate, setPendingDeleteDate] = useState<string | null>(null);

    const monthGroups = groupByMonth(evidenceEntries);
    const receipts = evidenceEntries.slice(0, RECEIPTS_COUNT);

    const handleConfirmDelete = async () => {
        if (pendingDeleteDate) {
            await deleteEvidence(pendingDeleteDate);
            setPendingDeleteDate(null);
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            {/* Top Status Bar */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={{ xs: 2, sm: 0 }}
                sx={{ pb: 3, mb: 4, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}
            >
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight="bold"
                        sx={{ letterSpacing: 1.5, display: 'block', mb: 0.5 }}
                    >
                        RECEIPTS
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="text.primary">
                        Evidence Log
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<AutoStoriesRoundedIcon />}
                    onClick={() => setIsReceiptsOpen(true)}
                    disabled={evidenceEntries.length === 0}
                    sx={{
                        borderColor: 'rgba(255,255,255,0.15)',
                        color: 'text.primary',
                        '&:hover': { borderColor: 'primary.main' },
                        '&:focus': { outline: 'none' },
                    }}
                >
                    Read your receipts
                </Button>
            </Stack>

            {/* Header.
                An empty log gets a different headline on purpose — a giant
                "you have shown up 0 days" is the opposite of what this is for. */}
            <Box sx={{ mb: 5 }}>
                <Typography
                    variant="h2"
                    fontWeight="bold"
                    sx={{ color: 'text.primary', mb: 1, fontSize: { xs: '2rem', sm: '3.75rem' } }}
                >
                    {evidenceEntries.length === 0 ? (
                        'Your receipts start tonight.'
                    ) : (
                        <>
                            You have shown up{' '}
                            <Box component="span" sx={{ color: 'primary.main' }}>
                                {evidenceEntries.length}
                            </Box>{' '}
                            {evidenceEntries.length === 1 ? 'day' : 'days'}.
                        </>
                    )}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    One line a night. Every line is something you actually did.
                </Typography>
            </Box>

            {evidenceEntries.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                        Nothing logged yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, opacity: 0.8 }}>
                        Write tonight's line on the Dashboard. It starts counting from there.
                    </Typography>
                </Box>
            ) : (
                monthGroups.map((group) => (
                    <Box key={group.month} sx={{ mb: 5 }}>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight="bold"
                            sx={{ letterSpacing: 1.5, display: 'block', mb: 1.5, fontSize: '0.7rem' }}
                        >
                            {group.month.toUpperCase()} · {group.entries.length}
                        </Typography>

                        <Stack spacing={0}>
                            {group.entries.map((entry, index) => (
                                <Box
                                    key={entry.date}
                                    sx={{
                                        py: 2,
                                        display: 'flex',
                                        alignItems: 'flex-start',
                                        gap: 2,
                                        borderBottom: index < group.entries.length - 1 ? 1 : 0,
                                        borderColor: 'rgba(255,255,255,0.08)',
                                    }}
                                >
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ width: 64, flexShrink: 0, pt: 0.3, fontVariantNumeric: 'tabular-nums' }}
                                    >
                                        {format(parseISO(entry.date), 'EEE d')}
                                    </Typography>

                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography
                                            variant="body1"
                                            sx={{ color: 'text.primary', lineHeight: 1.5, wordBreak: 'break-word' }}
                                        >
                                            {entry.text}
                                        </Typography>
                                        {entry.tag && (
                                            <Chip
                                                label={EVIDENCE_TAG_LABELS[entry.tag]}
                                                size="small"
                                                sx={{
                                                    mt: 1,
                                                    height: 22,
                                                    fontSize: '0.68rem',
                                                    color: EVIDENCE_TAG_COLORS[entry.tag],
                                                    bgcolor: `${EVIDENCE_TAG_COLORS[entry.tag]}22`,
                                                }}
                                            />
                                        )}
                                    </Box>

                                    <Tooltip title="Delete entry">
                                        <IconButton
                                            size="small"
                                            aria-label={`Delete the entry for ${entry.date}`}
                                            onClick={() => setPendingDeleteDate(entry.date)}
                                            sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                                        >
                                            <CloseRoundedIcon sx={{ fontSize: 18 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                ))
            )}

            {/* Read your receipts — full screen, no chrome, larger text. */}
            <Dialog
                open={isReceiptsOpen}
                onClose={() => setIsReceiptsOpen(false)}
                fullScreen
                slotProps={{ paper: { sx: { bgcolor: 'background.default', backgroundImage: 'none' } } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                    <IconButton
                        aria-label="Close receipts"
                        onClick={() => setIsReceiptsOpen(false)}
                        sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>

                <Box sx={{ maxWidth: 720, mx: 'auto', width: '100%', px: { xs: 3, sm: 4 }, pb: 8 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontStyle: 'italic',
                            color: 'primary.light',
                            opacity: 0.85,
                            mb: 5,
                            lineHeight: 1.6,
                        }}
                    >
                        "This is what you actually did. Not what you felt."
                    </Typography>

                    <Stack spacing={4}>
                        {receipts.map((entry) => (
                            <Box key={entry.date}>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ display: 'block', mb: 0.5, letterSpacing: 1, fontSize: '0.7rem' }}
                                >
                                    {format(parseISO(entry.date), 'EEEE d MMMM').toUpperCase()}
                                </Typography>
                                <Typography
                                    sx={{
                                        color: 'text.primary',
                                        fontSize: { xs: '1.35rem', sm: '1.6rem' },
                                        fontWeight: 500,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {entry.text}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            </Dialog>

            {/* Delete confirmation */}
            <Dialog open={pendingDeleteDate !== null} onClose={() => setPendingDeleteDate(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Delete this entry?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This removes the line for{' '}
                        {pendingDeleteDate && format(parseISO(pendingDeleteDate), 'EEEE d MMMM')}. It can't be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPendingDeleteDate(null)}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EvidenceLogPage;
