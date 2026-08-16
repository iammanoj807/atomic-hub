import { Box, Typography, Stack, Chip, Button } from '@mui/material';
import EventAvailableRoundedIcon from '@mui/icons-material/EventAvailableRounded';
import { WEEKDAYS, WEEKDAY_NAMES, type Weekday } from '../../data/studyPlan';
import { DEFAULT_DAYS_OFF } from '../../utils/studySchedule';

/**
 * Which days are off THIS week.
 *
 * The plan was written around a fixed Friday. In practice the days move — some
 * weeks Thursday, some weeks Friday, sometimes two — and it is not known in
 * advance, so the week is only real once these are marked. Two taps, once a
 * week, and the whole schedule below reshapes itself.
 */
const DaysOffPicker = ({
    daysOff,
    onChange,
    disabled = false,
}: {
    daysOff: Weekday[];
    onChange: (days: Weekday[]) => void;
    disabled?: boolean;
}) => {
    const toggle = (day: Weekday) => {
        onChange(
            daysOff.includes(day)
                ? daysOff.filter(d => d !== day)
                : [...daysOff, day]
        );
    };

    const none = daysOff.length === 0;

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                bgcolor: none ? 'rgba(255, 213, 79, 0.06)' : 'background.paper',
                border: '1px solid',
                borderColor: none ? 'rgba(255, 213, 79, 0.35)' : 'rgba(255,255,255,0.08)',
            }}
        >
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={1}
                sx={{ mb: 1.5 }}
            >
                <Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <EventAvailableRoundedIcon sx={{ fontSize: 18, color: none ? '#ffd54f' : 'text.disabled' }} />
                        <Typography
                            variant="caption"
                            sx={{ letterSpacing: 1.3, fontWeight: 800, fontSize: '0.68rem', color: none ? '#ffd54f' : 'text.secondary' }}
                        >
                            WHICH DAYS ARE YOU OFF THIS WEEK?
                        </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.85rem' }}>
                        {none
                            ? 'The first one becomes your five-hour deep work day — the anchor of the week.'
                            : `Deep work lands on ${WEEKDAY_NAMES[[...WEEKDAYS].filter(d => daysOff.includes(d))[0]]}.`}
                    </Typography>
                </Box>

                {none && (
                    <Button
                        size="small"
                        onClick={() => onChange(DEFAULT_DAYS_OFF)}
                        disabled={disabled}
                        sx={{ color: 'text.secondary', flexShrink: 0, '&:focus': { outline: 'none' } }}
                    >
                        Same as usual (Friday)
                    </Button>
                )}
            </Stack>

            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {WEEKDAYS.map(day => {
                    const selected = daysOff.includes(day);

                    return (
                        <Chip
                            key={day}
                            label={day}
                            onClick={disabled ? undefined : () => toggle(day)}
                            aria-label={`${selected ? 'Unmark' : 'Mark'} ${WEEKDAY_NAMES[day]} as a day off`}
                            sx={{
                                minWidth: 56,
                                fontWeight: 700,
                                cursor: disabled ? 'default' : 'pointer',
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
        </Box>
    );
};

export default DaysOffPicker;
