import { useState } from 'react';
import {
    Box, Typography, Stack, Button, TextField, Chip, Collapse,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { useTaskContext } from '../../context/TaskContext';
import { readingForWeek, readingLevelForWeek } from '../../data/studyPlan';
import { getReadingStreak } from '../../utils/studyProgress';

const ACCENT = '#81c784';

/**
 * Today's twenty minutes, and the one question that makes it worth logging.
 *
 * The notes field is optional and "what would I do next?" is not — asked three
 * hundred times over a year, that question is the whole point of the ladder,
 * so it is the field that gets the space.
 */
const ReadingCard = ({
    weekNumber,
    today,
}: {
    weekNumber: number;
    today: string;
}) => {
    const { readingEntries, saveReading } = useTaskContext();

    const item = readingForWeek(weekNumber);
    const level = readingLevelForWeek(weekNumber);
    const logged = readingEntries.find(entry => entry.date === today);
    const streak = getReadingStreak(readingEntries, today);

    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState(logged?.notes ?? '');
    const [next, setNext] = useState(logged?.whatWouldIDoNext ?? '');
    const [saving, setSaving] = useState(false);

    const save = async () => {
        setSaving(true);
        try {
            await saveReading({
                date: today,
                weekNumber,
                item,
                level,
                notes: notes.trim(),
                whatWouldIDoNext: next.trim(),
                minutes: 20,
            });
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
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid',
                borderColor: logged ? `${ACCENT}4d` : 'rgba(255,255,255,0.08)',
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <MenuBookRoundedIcon sx={{ fontSize: 18, color: ACCENT }} />
                <Typography
                    variant="caption"
                    sx={{ color: ACCENT, letterSpacing: 1.4, fontWeight: 800, fontSize: '0.68rem' }}
                >
                    TODAY'S READING · 20 MIN
                </Typography>
                <Box sx={{ flex: 1 }} />
                {streak > 0 && (
                    <Chip
                        size="small"
                        label={`${streak} day${streak === 1 ? '' : 's'}`}
                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, color: ACCENT, bgcolor: `${ACCENT}1f` }}
                    />
                )}
            </Stack>

            <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 500, lineHeight: 1.5 }}>
                {item}
            </Typography>

            {logged && !open && (
                <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mt: 1.5 }}>
                    <CheckCircleRoundedIcon sx={{ fontSize: 17, color: ACCENT, mt: 0.2 }} />
                    <Box>
                        <Typography variant="body2" color="text.secondary">
                            Logged today.
                        </Typography>
                        {logged.whatWouldIDoNext && (
                            <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontStyle: 'italic' }}>
                                “{logged.whatWouldIDoNext}”
                            </Typography>
                        )}
                    </Box>
                </Stack>
            )}

            <Collapse in={open}>
                <Stack spacing={2} sx={{ mt: 2 }}>
                    <TextField
                        label="Notes (optional)"
                        value={notes}
                        onChange={event => setNotes(event.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="What would I do next?"
                        placeholder="The question that becomes your statement of purpose in 2028."
                        value={next}
                        onChange={event => setNext(event.target.value)}
                        multiline
                        minRows={2}
                        fullWidth
                        size="small"
                    />
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" onClick={save} disabled={saving} size="small">
                            {logged ? 'Update' : 'Log it'}
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
                    sx={{ mt: 1.5, color: ACCENT, px: 0, '&:hover': { bgcolor: 'transparent' } }}
                >
                    {logged ? 'Edit entry' : 'Log today’s reading'}
                </Button>
            )}
        </Box>
    );
};

export default ReadingCard;
