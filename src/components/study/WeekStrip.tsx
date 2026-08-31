import { Box, Tooltip, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { planWeeks, PHASE_COLORS, PLAN_WEEKS } from '../../data/studyPlan';

/**
 * Fifty-two squares — the whole year at a glance.
 *
 * A bar would say "12% done". This says which weeks you logged, which part
 * you are in, and how much road is left. A missed week shows as nothing:
 * there are no streaks here and no warning states, because a year is too
 * long to run on guilt.
 */
const WeekStrip = ({
    currentWeek,
    loggedWeeks,
}: {
    currentWeek: number | null;
    /** Week numbers that have hours against them. */
    loggedWeeks: Set<number>;
}) => {
    const navigate = useNavigate();

    return (
        <Box>
            <Stack
                direction="row"
                spacing={0.5}
                sx={{ flexWrap: 'wrap', gap: 0.5, rowGap: 0.75 }}
            >
                {planWeeks.map(week => {
                    const accent = PHASE_COLORS[week.phaseKey];
                    const isLogged = loggedWeeks.has(week.week);
                    const isCurrent = week.week === currentWeek;
                    const isPast = currentWeek !== null && week.week < currentWeek;

                    return (
                        <Tooltip
                            key={week.week}
                            title={`Week ${week.week} · ${week.dates} — ${week.phase.replace(/\*/g, '').trim()}${isLogged ? ' · logged' : ''}`}
                            arrow
                        >
                            <Box
                                onClick={() => navigate('/study/journey')}
                                sx={{
                                    width: 26,
                                    height: 26,
                                    borderRadius: 1.5,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.6rem',
                                    fontWeight: 800,
                                    fontVariantNumeric: 'tabular-nums',
                                    transition: 'transform 0.15s',
                                    // Logged weeks are solid, the current week is ringed,
                                    // weeks that slipped past unlogged are faint but visible.
                                    bgcolor: isLogged ? accent : `${accent}1a`,
                                    color: isLogged ? '#0B0E14' : isPast ? 'text.disabled' : accent,
                                    border: '2px solid',
                                    borderColor: isCurrent ? 'primary.main' : 'transparent',
                                    '&:hover': { transform: 'scale(1.15)' },
                                }}
                            >
                                {week.week}
                            </Box>
                        </Tooltip>
                    );
                })}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5, fontSize: '0.8rem' }}>
                {loggedWeeks.size === 0
                    ? `${PLAN_WEEKS} weeks. Log one and it fills in.`
                    : `${loggedWeeks.size} of ${PLAN_WEEKS} weeks logged. Every filled square is a week you actually did.`}
            </Typography>
        </Box>
    );
};

export default WeekStrip;
