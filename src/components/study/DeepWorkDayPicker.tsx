import { Box, Typography, Stack, Chip } from '@mui/material';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import WeekendRoundedIcon from '@mui/icons-material/WeekendRounded';
import { WEEKDAYS, WEEKDAY_NAMES, type Weekday } from '../../data/studyPlan';
import { DEFAULT_DEEP_WORK_DAY, hasLightDay } from '../../utils/studySchedule';

/** One row of seven day buttons. Set from a rota, so it has to be one tap. */
const DayRow = ({
    selected,
    onPick,
    accent,
    disabledDay,
}: {
    selected: Weekday | null;
    onPick: (day: Weekday) => void;
    accent: string;
    /** The day already taken by the other pick — you cannot be off twice on one day. */
    disabledDay?: Weekday;
}) => (
    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {WEEKDAYS.map(day => {
            const isSelected = day === selected;
            const isTaken = day === disabledDay;

            return (
                <Chip
                    key={day}
                    label={day}
                    onClick={isTaken ? undefined : () => onPick(day)}
                    aria-pressed={isSelected}
                    sx={{
                        minWidth: 56,
                        fontWeight: 700,
                        cursor: isTaken ? 'not-allowed' : 'pointer',
                        opacity: isTaken ? 0.35 : 1,
                        color: isSelected ? '#0B0E14' : 'text.secondary',
                        bgcolor: isSelected ? accent : 'rgba(255,255,255,0.05)',
                        border: '1px solid',
                        borderColor: isSelected ? accent : 'rgba(255,255,255,0.12)',
                        '&:hover': isTaken
                            ? {}
                            : { bgcolor: isSelected ? accent : `${accent}26`, borderColor: accent },
                    }}
                />
            );
        })}
    </Stack>
);

/**
 * The rota, set once a week.
 *
 * The first day off is the one that matters to the plan: it carries the
 * five-hour build. The second is recorded but deliberately changes nothing —
 * being off does not delete the 45 minutes of DSA or the morning's theory, and
 * silently dropping slots would make the week's hours lie.
 */
const DeepWorkDayPicker = ({
    deepWorkDay,
    secondDayOff,
    onChangeDeepWorkDay,
    onChangeSecondDayOff,
}: {
    deepWorkDay: Weekday;
    secondDayOff: Weekday | null;
    onChangeDeepWorkDay: (day: Weekday) => void;
    onChangeSecondDayOff: (day: Weekday | null) => void;
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
            {/* First day off — the one the build follows */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                <ConstructionRoundedIcon sx={{ fontSize: 18, color: '#ff8a65' }} />
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ letterSpacing: 1.3, fontWeight: 800, fontSize: '0.68rem' }}
                >
                    FIRST DAY OFF · DEEP WORK
                </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                The build is on {WEEKDAY_NAMES[deepWorkDay]}, 09:00–15:00
                {deepWorkDay === DEFAULT_DEEP_WORK_DAY ? ' (the usual).' : '.'}
                {' '}Whatever study that day had moves to Friday, so the week still comes to the same hours.
            </Typography>
            <DayRow
                selected={deepWorkDay}
                onPick={onChangeDeepWorkDay}
                accent="#ff8a65"
                disabledDay={secondDayOff ?? undefined}
            />

            {lightDayLost && (
                <Typography
                    variant="body2"
                    sx={{ mt: 1.5, color: '#ff8a65', fontWeight: 600, fontSize: '0.85rem' }}
                >
                    No light day this week — Sunday is carrying the build. Expect to feel it by Tuesday.
                </Typography>
            )}

            {/* Second day off — recorded, not scheduled */}
            <Box sx={{ mt: 3, pt: 2.5, borderTop: 1, borderColor: 'rgba(255,255,255,0.08)' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <WeekendRoundedIcon sx={{ fontSize: 18, color: '#4dd0e1' }} />
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ letterSpacing: 1.3, fontWeight: 800, fontSize: '0.68rem' }}
                    >
                        SECOND DAY OFF · OPTIONAL
                    </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.85rem' }}>
                    {secondDayOff
                        ? `Also off ${WEEKDAY_NAMES[secondDayOff]}. Its slots stay as they are — a free day is time you gain, not study you lose.`
                        : 'Only set this on the weeks the rota gives you two. Tap it again to clear it.'}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <DayRow
                        selected={secondDayOff}
                        // Tapping the day that is already set clears it.
                        onPick={(day) => onChangeSecondDayOff(day === secondDayOff ? null : day)}
                        accent="#4dd0e1"
                        disabledDay={deepWorkDay}
                    />
                </Stack>
            </Box>
        </Box>
    );
};

export default DeepWorkDayPicker;
