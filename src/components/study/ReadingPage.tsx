import { Box, Typography, Stack, Chip, Divider } from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import { useTaskContext } from '../../context/TaskContext';
import { getLondonDateString } from '../../utils/date';
import { getPlanWeekNumber } from '../../utils/studyPlan';
import { getReadingStreak, getReadingCountByLevel } from '../../utils/studyProgress';
import { readingLadder, READING_METHOD, readingLevelForWeek } from '../../data/studyPlan';
import StudyPageHeader from './StudyPageHeader';

const ACCENT = '#81c784';

const LEVEL_COLORS: Record<string, string> = {
    blogs: '#81c784',
    classics: '#4db6ac',
    modern: '#64b5f6',
    frontier: '#b39ddb',
    subfield: '#ffca28',
};

/**
 * The ladder, the streak, and every entry you have written.
 *
 * The entries are shown by their "what would I do next" answer rather than by
 * their notes, because that is the line that will still be worth something in
 * 2028 and the notes mostly will not.
 */
const ReadingPage = () => {
    const { readingEntries } = useTaskContext();

    const today = getLondonDateString();
    const currentWeek = getPlanWeekNumber(today);
    const currentLevel = currentWeek ? readingLevelForWeek(currentWeek) : null;

    const streak = getReadingStreak(readingEntries, today);
    const counts = getReadingCountByLevel(readingEntries);

    return (
        <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="READING LADDER"
                title="Twenty minutes a day"
                subtitle="One item. Never more, never doubled up."
            />

            <Stack direction="row" spacing={3} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
                <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: ACCENT, lineHeight: 1 }}>
                        {streak}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1.2, fontWeight: 700 }}>
                        DAY STREAK
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: 'text.primary', lineHeight: 1 }}>
                        {readingEntries.length}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1.2, fontWeight: 700 }}>
                        ENTRIES
                    </Typography>
                </Box>
            </Stack>

            <Stack spacing={1} sx={{ mb: 5 }}>
                {READING_METHOD.map(rule => (
                    <Typography key={rule} variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                        {rule}
                    </Typography>
                ))}
            </Stack>

            {/* The five rungs. The one you are on is lit; the rest are the road. */}
            <Stack spacing={2.5} sx={{ mb: 5 }}>
                {readingLadder.map(level => {
                    const colour = LEVEL_COLORS[level.level] ?? ACCENT;
                    const isCurrent = level.level === currentLevel;

                    return (
                        <Box
                            key={level.level}
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: 3,
                                bgcolor: isCurrent ? `${colour}12` : 'rgba(255,255,255,0.02)',
                                border: '1px solid',
                                borderColor: isCurrent ? `${colour}5c` : 'rgba(255,255,255,0.07)',
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                                <Typography
                                    variant="caption"
                                    sx={{ color: colour, letterSpacing: 1.4, fontWeight: 800, fontSize: '0.7rem' }}
                                >
                                    {level.level.toUpperCase()}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                    WEEKS {level.weeks}
                                </Typography>
                                {isCurrent && (
                                    <Chip
                                        size="small"
                                        label="YOU ARE HERE"
                                        sx={{
                                            height: 20, fontSize: '0.62rem', fontWeight: 800,
                                            letterSpacing: 0.8, color: colour, bgcolor: `${colour}1f`,
                                        }}
                                    />
                                )}
                                <Box sx={{ flex: 1 }} />
                                <Typography variant="caption" color="text.secondary">
                                    {counts[level.level]} logged
                                </Typography>
                            </Stack>

                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                                {level.what}
                            </Typography>

                            <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                                {level.items.map(item => (
                                    <Typography
                                        key={item}
                                        variant="body2"
                                        sx={{ color: 'text.primary', fontSize: '0.85rem', lineHeight: 1.5 }}
                                    >
                                        · {item}
                                    </Typography>
                                ))}
                            </Stack>
                        </Box>
                    );
                })}
            </Stack>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', mb: 2 }}>
                Every entry
            </Typography>

            {readingEntries.length === 0 ? (
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ py: 4 }}>
                    <MenuBookRoundedIcon sx={{ color: 'text.disabled' }} />
                    <Typography variant="body2" color="text.secondary">
                        Nothing logged yet. Twenty minutes tonight and this fills in.
                    </Typography>
                </Stack>
            ) : (
                <Stack spacing={2} sx={{ pb: 4 }}>
                    {readingEntries.map(entry => {
                        const colour = LEVEL_COLORS[entry.level] ?? ACCENT;
                        return (
                            <Box
                                key={entry.id}
                                sx={{
                                    p: 2,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255,255,255,0.02)',
                                    borderLeft: '3px solid',
                                    borderLeftColor: colour,
                                }}
                            >
                                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                        {entry.date}
                                    </Typography>
                                    <Typography variant="caption" color="text.disabled">
                                        Week {entry.weekNumber}
                                    </Typography>
                                </Stack>

                                <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, fontWeight: 500 }}>
                                    {entry.item}
                                </Typography>

                                {entry.notes && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, lineHeight: 1.6 }}>
                                        {entry.notes}
                                    </Typography>
                                )}

                                {entry.whatWouldIDoNext && (
                                    <Box sx={{ mt: 1.5 }}>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: colour, letterSpacing: 1.2, fontWeight: 800, fontSize: '0.64rem' }}
                                        >
                                            WHAT WOULD I DO NEXT
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.25, fontStyle: 'italic' }}>
                                            {entry.whatWouldIDoNext}
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
};

export default ReadingPage;
