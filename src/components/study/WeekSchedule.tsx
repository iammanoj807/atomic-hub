import { Box, Typography, Stack, Chip } from '@mui/material';
import { WEEKDAY_NAMES, type Weekday } from '../../data/studyPlan';
import { buildWeekSchedule } from '../../utils/studySchedule';

/**
 * This week's seven days, generated from the days marked off.
 *
 * Nothing here is hard-coded to a weekday — the same sessions get dealt onto
 * whichever days are actually free, so a week where Thursday is off reads
 * exactly as clearly as one where Friday is.
 */
const WeekSchedule = ({
    daysOff,
    today,
}: {
    daysOff: Weekday[];
    today?: Weekday;
}) => {
    const schedule = buildWeekSchedule(daysOff);

    return (
        <Stack spacing={1}>
            {schedule.days.map(day => {
                const isToday = day.day === today;

                return (
                    <Box
                        key={day.day}
                        sx={{
                            p: 1.75,
                            borderRadius: 3,
                            bgcolor: isToday ? 'rgba(41, 121, 255, 0.08)' : 'background.paper',
                            border: '1px solid',
                            borderColor: isToday ? 'primary.main' : 'rgba(255,255,255,0.08)',
                            opacity: day.sessions.length === 0 ? 0.6 : 1,
                        }}
                    >
                        <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            spacing={{ xs: 1, sm: 2 }}
                            alignItems={{ xs: 'flex-start', sm: 'center' }}
                        >
                            <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{ width: { sm: 150 }, flexShrink: 0 }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 800,
                                        color: isToday ? 'primary.main' : 'text.primary',
                                        width: 40,
                                    }}
                                >
                                    {day.day}
                                </Typography>
                                {isToday && (
                                    <Chip
                                        label="TODAY"
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.55rem',
                                            fontWeight: 800,
                                            color: 'primary.main',
                                            bgcolor: 'rgba(41, 121, 255, 0.15)',
                                        }}
                                    />
                                )}
                                {day.isOff && (
                                    <Chip
                                        label="OFF"
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.55rem',
                                            fontWeight: 800,
                                            color: '#ff8a65',
                                            bgcolor: 'rgba(255, 138, 101, 0.15)',
                                        }}
                                    />
                                )}
                            </Stack>

                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
                                {day.sessions.map(session => (
                                    <Chip
                                        key={`${day.day}-${session.kind}`}
                                        label={
                                            session.hours > 0
                                                ? `${session.label} · ${session.hours}h`
                                                : session.label
                                        }
                                        size="small"
                                        title={`${session.when} — ${session.what}`}
                                        sx={{
                                            height: 24,
                                            fontSize: '0.66rem',
                                            fontWeight: 700,
                                            color: session.color,
                                            bgcolor: `${session.color}1f`,
                                            border: '1px solid',
                                            borderColor: `${session.color}33`,
                                        }}
                                    />
                                ))}
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
                            >
                                {day.hours}h
                            </Typography>
                        </Stack>
                    </Box>
                );
            })}

            <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, px: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                    {schedule.deepWorkDay
                        ? `Deep work on ${WEEKDAY_NAMES[schedule.deepWorkDay]}, then stop.`
                        : 'No day off marked — the five-hour block has nowhere to go.'}
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: 'text.primary', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                >
                    {schedule.totalHours}h this week
                </Typography>
            </Stack>
        </Stack>
    );
};

export default WeekSchedule;
