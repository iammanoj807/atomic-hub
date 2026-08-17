import { Box, Typography, Stack, Chip } from '@mui/material';
import {
    WEEKDAYS,
    WEEKDAY_NAMES,
    LIGHT_DAY_NOTE,
    type Weekday,
} from '../../data/studyPlan';
import {
    getRoutineForWeek,
    routineWeeklyHours,
    hoursOnDay,
    latestEndTime,
    isLightDay,
    DEFAULT_DEEP_WORK_DAY,
} from '../../utils/studySchedule';

/**
 * The week as it actually falls, once the deep work block has moved to
 * whichever day is off.
 *
 * Sunday is drawn as a light day rather than a short study day — it carries
 * the two habits and an hour of review, and reading it like any other row
 * would lose the only deliberate breather in the week.
 */
const WeekSchedule = ({
    deepWorkDay = DEFAULT_DEEP_WORK_DAY,
    today,
}: {
    deepWorkDay?: Weekday;
    today?: Weekday;
}) => {
    const week = getRoutineForWeek(deepWorkDay);

    return (
        <Stack spacing={1}>
            {WEEKDAYS.map(day => {
                const slots = week[day];
                const isToday = day === today;
                const isDeep = day === deepWorkDay;
                const isLight = isLightDay(day, deepWorkDay);

                return (
                    <Box
                        key={day}
                        sx={{
                            p: 1.75,
                            borderRadius: 3,
                            bgcolor: isToday ? 'rgba(41, 121, 255, 0.08)' : 'background.paper',
                            border: '1px solid',
                            borderColor: isToday
                                ? 'primary.main'
                                : isDeep
                                    ? 'rgba(255, 138, 101, 0.4)'
                                    : 'rgba(255,255,255,0.08)',
                            // The light day is deliberately quieter on the page too.
                            ...(isLight && { bgcolor: 'rgba(144, 164, 174, 0.06)' }),
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
                                sx={{ width: { sm: 168 }, flexShrink: 0 }}
                            >
                                <Typography
                                    variant="body2"
                                    sx={{
                                        fontWeight: 800,
                                        color: isToday ? 'primary.main' : 'text.primary',
                                        width: 40,
                                    }}
                                >
                                    {day}
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
                                {isDeep && (
                                    <Chip
                                        label="DAY OFF"
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
                                {isLight && (
                                    <Chip
                                        label="LIGHT DAY"
                                        size="small"
                                        sx={{
                                            height: 18,
                                            fontSize: '0.55rem',
                                            fontWeight: 800,
                                            color: '#90a4ae',
                                            bgcolor: 'rgba(144, 164, 174, 0.18)',
                                        }}
                                    />
                                )}
                            </Stack>

                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ flex: 1 }}>
                                {slots.map(slotItem => (
                                    <Chip
                                        key={`${day}-${slotItem.kind}-${slotItem.start}`}
                                        label={`${slotItem.start} ${slotItem.track.replace(/^[AB +]+- /, '')}`}
                                        size="small"
                                        title={`${slotItem.start}-${slotItem.end} · ${slotItem.track} · ${slotItem.what}`}
                                        sx={{
                                            height: 24,
                                            fontSize: '0.66rem',
                                            fontWeight: 700,
                                            color: slotItem.color,
                                            bgcolor: `${slotItem.color}1f`,
                                            border: '1px solid',
                                            borderColor: `${slotItem.color}33`,
                                        }}
                                    />
                                ))}
                            </Stack>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}
                            >
                                {hoursOnDay(day, deepWorkDay)}h
                            </Typography>
                        </Stack>

                        {isLight && (
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 1, fontSize: '0.78rem', fontStyle: 'italic' }}
                            >
                                {LIGHT_DAY_NOTE}
                            </Typography>
                        )}
                    </Box>
                );
            })}

            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                spacing={0.5}
                sx={{ pt: 1, px: 0.5 }}
            >
                <Typography variant="body2" color="text.secondary">
                    Deep work on {WEEKDAY_NAMES[deepWorkDay]}. Nothing runs past {latestEndTime(deepWorkDay)}.
                </Typography>
                <Typography
                    variant="body2"
                    sx={{ color: 'text.primary', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}
                >
                    {routineWeeklyHours(deepWorkDay)}h this week
                </Typography>
            </Stack>
        </Stack>
    );
};

export default WeekSchedule;
