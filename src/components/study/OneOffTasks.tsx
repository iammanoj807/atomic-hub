import { useState } from 'react';
import { Box, Typography, Stack, Checkbox } from '@mui/material';

const ACCENT = '#ffd54f';

const storageKey = (week: number) => `study-one-off-${week}`;

const readDone = (week: number): number[] => {
    try {
        const raw = localStorage.getItem(storageKey(week));
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
};

/**
 * The handful of things that happen once and never again — accounts, the three
 * emails, the Scholar alerts.
 *
 * They are deliberately not on the timetable: none of them belongs to a slot,
 * and putting a fifteen-minute setup task inside the 06:00 theory block would
 * make the routine lie about what the mornings are for. So they sit above the
 * week as their own short list, and disappear entirely on weeks that have none.
 *
 * The ticks live in this browser rather than in Firestore. These are errands,
 * not evidence — nothing about the year's record depends on them, and they are
 * not worth a collection or a sync.
 */
const OneOffTasks = ({ week, tasks }: { week: number; tasks: string[] }) => {
    const [done, setDone] = useState<number[]>(() => readDone(week));

    const toggle = (index: number) => {
        const next = done.includes(index)
            ? done.filter(i => i !== index)
            : [...done, index];
        setDone(next);
        try {
            localStorage.setItem(storageKey(week), JSON.stringify(next));
        } catch {
            // A private window or blocked site data. The list still works.
        }
    };

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                mb: 3,
                bgcolor: `${ACCENT}0f`,
                border: '1px solid',
                borderColor: `${ACCENT}3d`,
            }}
        >
            <Typography
                variant="caption"
                sx={{ color: ACCENT, letterSpacing: 1.5, fontWeight: 800, fontSize: '0.68rem' }}
            >
                ONCE, THIS WEEK
            </Typography>

            <Stack spacing={0.5} sx={{ mt: 1 }}>
                {tasks.map((task, index) => {
                    const isDone = done.includes(index);
                    return (
                        <Stack
                            key={task}
                            direction="row"
                            spacing={1}
                            alignItems="flex-start"
                            onClick={() => toggle(index)}
                            sx={{ cursor: 'pointer' }}
                        >
                            <Checkbox
                                checked={isDone}
                                size="small"
                                sx={{
                                    p: 0.5,
                                    mt: -0.25,
                                    color: 'rgba(255,255,255,0.3)',
                                    '&.Mui-checked': { color: ACCENT },
                                }}
                            />
                            <Typography
                                variant="body2"
                                sx={{
                                    lineHeight: 1.55,
                                    pt: 0.5,
                                    color: isDone ? 'text.disabled' : 'text.primary',
                                    textDecoration: isDone ? 'line-through' : 'none',
                                }}
                            >
                                {task}
                            </Typography>
                        </Stack>
                    );
                })}
            </Stack>
        </Box>
    );
};

export default OneOffTasks;
