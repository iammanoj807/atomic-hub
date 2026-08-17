import { Box, Typography, Stack, Chip } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import { WEEKDAYS, WEEKDAY_NAMES, type Weekday } from '../../data/studyPlan';
import { DEFAULT_DEEP_WORK_DAY, hasLightDay } from '../../utils/studySchedule';

/**
 * Which day the five-hour build lands on this week.
 *
 * A row of buttons rather than a dropdown, because this gets set once a week
 * off a rota and should take one tap. Everything else in the week stays put.
 */
const DeepWorkDayPicker = ({
    deepWorkDay,
    onChange,
}: {
    deepWorkDay: Weekday;
    onChange: (day: Weekday) => void;
}) => {
    const lightDayLost = !hasLightDay(deepWorkDay);

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.08)',
            }}
        >
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <ConstructionRoundedIcon sx={{ fontSize: 18, color: '#ff8a65' }} />
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ letterSpacing: 1.3, fontWeight: 800, fontSize: '0.68rem' }}
                >
                    WHICH DAY ARE YOU OFF THIS WEEK?
                </Typography>
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                Deep work is on {WEEKDAY_NAMES[deepWorkDay]}, 09:00–15:00
                {deepWorkDay === DEFAULT_DEEP_WORK_DAY ? ' (the usual).' : '.'}
                {' '}Whatever study that day had moves to Friday, so the week still comes to the same hours.
            </Typography>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {WEEKDAYS.map(day => {
                    const selected = day === deepWorkDay;

                    return (
                        <Chip
                            key={day}
                            label={day}
                            onClick={() => onChange(day)}
                            aria-label={`Set deep work day to ${WEEKDAY_NAMES[day]}`}
                            aria-pressed={selected}
                            sx={{
                                minWidth: 56,
                                fontWeight: 700,
                                cursor: 'pointer',
                                color: selected ? '#0B0E14' : 'text.secondary',
                                bgcolor: selected ? '#ff8a65' : 'rgba(255,255,255,0.05)',
                                border: '1px solid',
                                borderColor: selected ? '#ff8a65' : 'rgba(255,255,255,0.12)',
                                '&:hover': {
                                    bgcolor: selected ? '#ff7043' : 'rgba(255,138,101,0.15)',
                                    borderColor: '#ff8a65',
                                },
                            }}
                        />
                    );
                })}
            </Stack>

            {/* Said out loud rather than hidden: Sunday is the only light day
                there is, and building on it means there isn't one. */}
            {lightDayLost && (
                <Typography
                    variant="body2"
                    sx={{ mt: 1.5, color: '#ff8a65', fontWeight: 600, fontSize: '0.85rem' }}
                >
                    No light day this week — Sunday is carrying the build. Expect to feel it by Tuesday.
                </Typography>
            )}
        </Box>
    );
};

export default DeepWorkDayPicker;
