import { useState } from 'react';
import {
    Box,
    Typography,
    Stack,
    Chip,
    Link,
    Collapse,
    Button,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ExpandLessRoundedIcon from '@mui/icons-material/ExpandLessRounded';
import { useTaskContext } from '../../context/TaskContext';
import {
    resources,
    learningSteps,
    neverSkipBuild,
    tracks,
    whyBothTracks,
    asymmetries,
    routineRules,
    timeBudgetNote,
    planWeeks,
    PHASE_COLORS,
    type ResourceTrack,
} from '../../data/studyPlan';
import { getWeekResources } from '../../data/studyResources';
import StudyPageHeader from './StudyPageHeader';
import ResourceList from './ResourceList';

const TRACK_COLORS: Record<ResourceTrack, string> = {
    'A - Theory': '#66bb6a',
    'B - AI Eng': '#ffd54f',
    'B - DSA': '#4a90e2',
    Both: '#b39ddb',
};

const TRACK_ORDER: ResourceTrack[] = ['A - Theory', 'B - AI Eng', 'B - DSA', 'Both'];

const STEP_COLORS: Record<string, string> = {
    WATCH: '#00e5ff',
    READ: '#b39ddb',
    BUILD: '#ff8a65',
};

/**
 * Everything worth learning, in two shapes: by topic when you want to master a
 * subject, and by week when you want to know what today's two hours are for.
 *
 * Titles are shown as the headline rather than the URL, because a title stays
 * searchable long after a link has moved.
 */
const LibraryPage = () => {
    const { currentWeekNumber } = useTaskContext();
    const [view, setView] = useState<'topic' | 'week'>('topic');
    const [showStrategy, setShowStrategy] = useState(false);
    const [openWeek, setOpenWeek] = useState<number>(currentWeekNumber ?? 1);

    return (
        <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="LIBRARY"
                title="Watch, then read, then build."
                subtitle="Every source here is the best free one that exists for its subject. Nothing filler, nothing paid unless it is the standard text."
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                    gap: 2,
                    mb: 3,
                }}
            >
                {learningSteps.map(step => (
                    <Box
                        key={step.step}
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'rgba(255,255,255,0.08)',
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{ color: STEP_COLORS[step.step], letterSpacing: 1.4, fontWeight: 800, fontSize: '0.68rem' }}
                        >
                            {step.step}
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.primary', mt: 0.5, lineHeight: 1.5 }}>
                            {step.detail}
                        </Typography>
                    </Box>
                ))}
            </Box>

            <ToggleButtonGroup
                exclusive
                size="small"
                value={view}
                onChange={(_, value) => value && setView(value)}
                sx={{ mb: 4 }}
            >
                <ToggleButton value="topic" sx={{ textTransform: 'none', px: 2, '&:focus': { outline: 'none' } }}>
                    By subject
                </ToggleButton>
                <ToggleButton value="week" sx={{ textTransform: 'none', px: 2, '&:focus': { outline: 'none' } }}>
                    Week by week
                </ToggleButton>
            </ToggleButtonGroup>

            {/* ---- BY SUBJECT: the mastery path ---- */}
            {view === 'topic' && TRACK_ORDER.map(track => {
                const rows = resources.filter(resource => resource.track === track);
                if (rows.length === 0) return null;

                return (
                    <Box key={track} sx={{ mb: 5 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: TRACK_COLORS[track],
                                letterSpacing: 1.5,
                                fontWeight: 800,
                                fontSize: '0.7rem',
                                display: 'block',
                                mb: 1.5,
                            }}
                        >
                            {track.toUpperCase()}
                        </Typography>

                        <Stack spacing={1.5}>
                            {rows.map(resource => (
                                <Box
                                    key={`${track}-${resource.topic}`}
                                    sx={{
                                        p: { xs: 2, sm: 2.5 },
                                        borderRadius: 3,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'rgba(255,255,255,0.08)',
                                    }}
                                >
                                    {resource.url ? (
                                        <Link
                                            href={resource.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            underline="hover"
                                            sx={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: 0.75,
                                                color: 'text.primary',
                                                fontWeight: 700,
                                                fontSize: '1.05rem',
                                                mb: 1.5,
                                                '&:hover': { color: 'primary.main' },
                                            }}
                                        >
                                            {resource.topic}
                                            <OpenInNewRoundedIcon sx={{ fontSize: 15, opacity: 0.6 }} />
                                        </Link>
                                    ) : (
                                        <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}>
                                            {resource.topic}
                                        </Typography>
                                    )}

                                    <Stack spacing={1.25}>
                                        {([
                                            ['WATCH', resource.watch],
                                            ['READ', resource.read],
                                            ['BUILD', resource.build],
                                        ] as const).map(([step, text]) => (
                                            <Box
                                                key={step}
                                                sx={{
                                                    display: 'flex',
                                                    flexDirection: { xs: 'column', sm: 'row' },
                                                    gap: { xs: 0.25, sm: 2 },
                                                }}
                                            >
                                                <Chip
                                                    label={step}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        width: 62,
                                                        flexShrink: 0,
                                                        fontSize: '0.6rem',
                                                        fontWeight: 800,
                                                        color: STEP_COLORS[step],
                                                        bgcolor: `${STEP_COLORS[step]}1f`,
                                                        alignSelf: 'flex-start',
                                                    }}
                                                />
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: text === '-' ? 'text.disabled' : 'text.primary',
                                                        lineHeight: 1.55,
                                                    }}
                                                >
                                                    {text}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Stack>
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                );
            })}

            {/* ---- WEEK BY WEEK ---- */}
            {view === 'week' && (
                <Box sx={{ mb: 5 }}>
                    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5, mb: 3 }}>
                        {planWeeks.map(week => {
                            const accent = PHASE_COLORS[week.phaseKey];
                            const selected = week.week === openWeek;

                            return (
                                <Box
                                    key={week.week}
                                    onClick={() => setOpenWeek(week.week)}
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1.5,
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.7rem',
                                        fontWeight: 800,
                                        fontVariantNumeric: 'tabular-nums',
                                        bgcolor: selected ? accent : `${accent}1a`,
                                        color: selected ? '#0B0E14' : accent,
                                        border: '2px solid',
                                        borderColor: week.week === currentWeekNumber ? 'primary.main' : 'transparent',
                                        '&:hover': { transform: 'scale(1.1)' },
                                        transition: 'transform 0.15s',
                                    }}
                                >
                                    {week.week}
                                </Box>
                            );
                        })}
                    </Stack>

                    <Typography
                        variant="caption"
                        sx={{
                            color: PHASE_COLORS[planWeeks[openWeek - 1].phaseKey],
                            letterSpacing: 1.5,
                            fontWeight: 800,
                            fontSize: '0.7rem',
                            display: 'block',
                            mb: 1.5,
                        }}
                    >
                        WEEK {openWeek} · {planWeeks[openWeek - 1].dates.toUpperCase()} ·{' '}
                        {planWeeks[openWeek - 1].phase.replace(/\*/g, '').trim().toUpperCase()}
                    </Typography>

                    <ResourceList resources={getWeekResources(openWeek)} />
                </Box>
            )}

            <Typography variant="body2" sx={{ color: '#ff8a65', fontWeight: 600, mb: 4, lineHeight: 1.7 }}>
                {neverSkipBuild}
            </Typography>

            {/* Why any of this — read once in August, then rarely. */}
            <Button
                onClick={() => setShowStrategy(!showStrategy)}
                endIcon={showStrategy ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
                sx={{ color: 'text.secondary', px: 0, mb: 2, '&:focus': { outline: 'none' } }}
            >
                {showStrategy ? 'Hide the strategy' : 'Why this material, and why both tracks'}
            </Button>

            <Collapse in={showStrategy} timeout="auto" unmountOnExit>
                <Box sx={{ pb: 4 }}>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 2,
                            mb: 2,
                        }}
                    >
                        {tracks.map(track => (
                            <Box
                                key={track.id}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'rgba(255,255,255,0.08)',
                                }}
                            >
                                <Chip
                                    label={`TRACK ${track.id}`}
                                    size="small"
                                    sx={{
                                        height: 22,
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        mb: 1,
                                        color: track.id === 'A' ? '#66bb6a' : '#ffd54f',
                                        bgcolor: track.id === 'A' ? 'rgba(102,187,106,0.12)' : 'rgba(255,213,79,0.12)',
                                    }}
                                />
                                <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                    {track.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                    {track.when}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.55 }}>
                                    {track.what}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 4, lineHeight: 1.7 }}>
                        {whyBothTracks}
                    </Typography>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                        Six real asymmetries
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        There is no trick. But almost nobody does these.
                    </Typography>
                    <Stack spacing={2} sx={{ mb: 4 }}>
                        {asymmetries.map((item, index) => (
                            <Box key={item.title} sx={{ display: 'flex', gap: 2 }}>
                                <Typography
                                    sx={{ color: 'primary.main', fontWeight: 800, width: 24, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {index + 1}
                                </Typography>
                                <Box>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary' }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                                        {item.detail}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Stack>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                        The rules
                    </Typography>
                    <Stack spacing={1.25} sx={{ mb: 4 }}>
                        {routineRules.map((rule, index) => (
                            <Box key={rule} sx={{ display: 'flex', gap: 2 }}>
                                <Typography color="text.disabled" sx={{ width: 20, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                                    {index + 1}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.6 }}>
                                    {rule}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>

                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                        {timeBudgetNote}
                    </Typography>
                </Box>
            </Collapse>
        </Box>
    );
};

export default LibraryPage;
