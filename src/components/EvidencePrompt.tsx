import { useState } from 'react';
import { Box, Typography, TextField, Button, Chip, IconButton, Stack, Tooltip } from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { getLondonDateString } from '../utils/date';
import {
    ALL_EVIDENCE_TAGS,
    EVIDENCE_TAG_COLORS,
    EVIDENCE_TAG_LABELS,
    getPlaceholderForDate,
} from '../data/evidenceTypes';
import type { EvidenceTag } from '../services/firebaseService';

const MAX_EVIDENCE_LENGTH = 200;

/**
 * The nightly prompt: one line about what today actually contained.
 *
 * Deliberately says nothing about missed days. There is no streak here and no
 * warning state — a gap in the log is just a gap, and the only job of this card
 * is to make tonight's line easy to write.
 */
const EvidencePrompt = () => {
    const { todayEvidence, evidenceEntries, saveEvidence } = useTaskContext();
    const navigate = useNavigate();

    const [isEditing, setIsEditing] = useState(false);
    const [text, setText] = useState('');
    const [tag, setTag] = useState<EvidenceTag | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);

    const today = getLondonDateString();
    // Show the form when there is nothing logged yet, or when editing on purpose.
    const showForm = !todayEvidence || isEditing;

    const handleSave = async () => {
        if (!text.trim() || isSaving) return;

        setIsSaving(true);
        try {
            await saveEvidence(text, tag);
            setIsEditing(false);
            // Cleared so tomorrow's prompt opens empty rather than pre-filled.
            setText('');
            setTag(undefined);
        } finally {
            setIsSaving(false);
        }
    };

    const handleStartEdit = () => {
        setText(todayEvidence?.text ?? '');
        setTag(todayEvidence?.tag);
        setIsEditing(true);
    };

    return (
        <Box
            sx={{
                width: '100%',
                maxWidth: 500,
                mx: 'auto',
                mt: 4,
                mb: 6,
                p: { xs: 2.5, sm: 3 },
                borderRadius: { xs: 3, sm: 4 },
                border: '1px solid rgba(255,255,255,0.08)',
                bgcolor: 'rgba(255,255,255,0.03)',
            }}
        >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                    sx={{ letterSpacing: 1.5, fontSize: '0.7rem' }}
                >
                    TONIGHT'S EVIDENCE
                </Typography>
                <Tooltip title="Evidence Log">
                    <IconButton
                        size="small"
                        aria-label="Open the Evidence Log"
                        onClick={() => navigate('/evidence')}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    >
                        <ReceiptLongRoundedIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Tooltip>
            </Stack>

            {showForm ? (
                <>
                    <TextField
                        fullWidth
                        variant="outlined"
                        size="small"
                        value={text}
                        onChange={(e) => setText(e.target.value.slice(0, MAX_EVIDENCE_LENGTH))}
                        placeholder={getPlaceholderForDate(today)}
                        inputProps={{ maxLength: MAX_EVIDENCE_LENGTH, 'aria-label': "Tonight's evidence" }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                        }}
                        sx={{ mb: 1.5 }}
                    />

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 2 }}>
                        {ALL_EVIDENCE_TAGS.map((t) => {
                            const isSelected = tag === t;
                            return (
                                <Chip
                                    key={t}
                                    label={EVIDENCE_TAG_LABELS[t]}
                                    size="small"
                                    // Tapping a selected tag clears it — the tag is always optional.
                                    onClick={() => setTag(isSelected ? undefined : t)}
                                    sx={{
                                        fontSize: '0.72rem',
                                        color: isSelected ? EVIDENCE_TAG_COLORS[t] : 'text.secondary',
                                        borderColor: isSelected ? EVIDENCE_TAG_COLORS[t] : 'rgba(255,255,255,0.12)',
                                        bgcolor: isSelected ? `${EVIDENCE_TAG_COLORS[t]}22` : 'transparent',
                                        border: '1px solid',
                                        '&:hover': {
                                            bgcolor: `${EVIDENCE_TAG_COLORS[t]}18`,
                                        },
                                    }}
                                />
                            );
                        })}
                    </Box>

                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleSave}
                            disabled={!text.trim() || isSaving}
                            sx={{ '&:focus': { outline: 'none' } }}
                        >
                            Save
                        </Button>
                        {isEditing && (
                            <Button size="small" onClick={() => setIsEditing(false)} sx={{ color: 'text.secondary' }}>
                                Cancel
                            </Button>
                        )}
                    </Stack>
                </>
            ) : (
                <Stack direction="row" alignItems="flex-start" spacing={1}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="body1"
                            sx={{ color: 'text.primary', lineHeight: 1.5, wordBreak: 'break-word' }}
                        >
                            {todayEvidence?.text}
                        </Typography>
                        {todayEvidence?.tag && (
                            <Chip
                                label={EVIDENCE_TAG_LABELS[todayEvidence.tag]}
                                size="small"
                                sx={{
                                    mt: 1,
                                    fontSize: '0.7rem',
                                    color: EVIDENCE_TAG_COLORS[todayEvidence.tag],
                                    bgcolor: `${EVIDENCE_TAG_COLORS[todayEvidence.tag]}22`,
                                }}
                            />
                        )}
                    </Box>
                    <Tooltip title="Edit tonight's line">
                        <IconButton
                            size="small"
                            aria-label="Edit tonight's evidence"
                            onClick={handleStartEdit}
                            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                        >
                            <EditRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                    </Tooltip>
                </Stack>
            )}

            {evidenceEntries.length > 0 && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 2, fontSize: '0.75rem' }}
                >
                    You have shown up <strong>{evidenceEntries.length}</strong>{' '}
                    {evidenceEntries.length === 1 ? 'day' : 'days'}.
                </Typography>
            )}
        </Box>
    );
};

export default EvidencePrompt;
