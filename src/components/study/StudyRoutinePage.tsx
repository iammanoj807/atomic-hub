import { Box, Typography, Stack, Chip } from '@mui/material';
import { format, parseISO } from 'date-fns';
import { getLondonDateString } from '../../utils/date';
import { routineWeeklyHours } from '../../utils/studyPlan';
import { dailyRoutine, routineRules, workPattern, timeBudgetNote } from '../../data/studyPlan';
import StudyPageHeader from './StudyPageHeader';

/** Track colours, so a glance tells you whether a slot is theory, DSA or rest. */
const TRACK_COLORS: Record<string, string> = {
    'A - Theory': '#66bb6a',
    'A - Papers': '#66bb6a',
    'B - DSA': '#4a90e2',
    'B - AI Eng': '#ffd54f',
    'A + B - BUILD': '#ff8a65',
    REST: '#90a4ae',
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'FRIDAY', 'Saturday', 'Sunday'];

const StudyRoutinePage = () => {
    const today = format(parseISO(getLondonDateString()), 'EEEE');

    const days = DAY_ORDER.map(day => ({
        day,
        isToday: day.toLowerCase() === today.toLowerCase(),
        slots: dailyRoutine.filter(slot => slot.day === day),
    }));

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="DAILY ROUTINE"
                title={`${routineWeeklyHours()} hours a week.`}
                subtitle={workPattern}
            />

            <Stack spacing={2} sx={{ mb: 5 }}>
                {days.map(({ day, isToday, slots }) => (
                    <Box
                        key={day}
                        sx={{
                            p: { xs: 2, sm: 2.5 },
                            borderRadius: 3,
                            bgcolor: isToday ? 'rgba(41, 121, 255, 0.06)' : 'background.paper',
                            border: '1px solid',
                            borderColor: isToday ? 'primary.main' : 'rgba(255,255,255,0.08)',
                        }}
                    >
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1.5 }}>
                            <Typography
                                variant="body1"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: 0.5,
                                    color: isToday ? 'primary.main' : 'text.primary',
                                }}
                            >
                                {day.toUpperCase()}
                            </Typography>
                            {isToday && (
                                <Chip
                                    label="TODAY"
                                    size="small"
                                    sx={{
                                        height: 20,
                                        fontSize: '0.6rem',
                                        fontWeight: 800,
                                        color: 'primary.main',
                                        bgcolor: 'rgba(41, 121, 255, 0.15)',
                                    }}
                                />
                            )}
                            <Box sx={{ flex: 1 }} />
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontVariantNumeric: 'tabular-nums' }}
                            >
                                {slots.reduce((sum, slot) => sum + (slot.hours ?? 0), 0)}h
                            </Typography>
                        </Stack>

                        <Stack spacing={0}>
                            {slots.map((slot, index) => {
                                const color = TRACK_COLORS[slot.track] ?? '#90a4ae';

                                return (
                                    <Box
                                        key={slot.time}
                                        sx={{
                                            py: 1.5,
                                            display: 'flex',
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            gap: { xs: 0.75, sm: 2 },
                                            borderTop: index > 0 ? 1 : 0,
                                            borderColor: 'rgba(255,255,255,0.06)',
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            spacing={1.5}
                                            alignItems="center"
                                            sx={{ width: { sm: 220 }, flexShrink: 0 }}
                                        >
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'text.primary',
                                                    fontWeight: 600,
                                                    width: 96,
                                                    fontVariantNumeric: 'tabular-nums',
                                                }}
                                            >
                                                {slot.time}
                                            </Typography>
                                            <Chip
                                                label={slot.track}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.62rem',
                                                    fontWeight: 700,
                                                    color,
                                                    bgcolor: `${color}1f`,
                                                }}
                                            />
                                        </Stack>

                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
                                                {slot.what}
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ fontSize: '0.8rem', mt: 0.25 }}
                                            >
                                                {slot.why}
                                            </Typography>
                                        </Box>
                                    </Box>
                                );
                            })}
                        </Stack>
                    </Box>
                ))}
            </Stack>

            <Typography
                variant="caption"
                color="text.secondary"
                fontWeight="bold"
                sx={{ letterSpacing: 1.5, display: 'block', mb: 2, fontSize: '0.7rem' }}
            >
                THE RULES
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 5 }}>
                {routineRules.map((rule, index) => (
                    <Box key={rule} sx={{ display: 'flex', gap: 2 }}>
                        <Typography
                            sx={{
                                color: 'primary.main',
                                fontWeight: 800,
                                width: 24,
                                flexShrink: 0,
                                fontVariantNumeric: 'tabular-nums',
                            }}
                        >
                            {index + 1}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                            {rule}
                        </Typography>
                    </Box>
                ))}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, pb: 2 }}>
                {timeBudgetNote}
            </Typography>
        </Box>
    );
};

export default StudyRoutinePage;
