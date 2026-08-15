import { Box, Typography, Stack, Chip } from '@mui/material';
import { resources, learningSteps, neverSkipBuild, type ResourceTrack } from '../../data/studyPlan';
import StudyPageHeader from './StudyPageHeader';

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

const StudyResourcesPage = () => (
    <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
        <StudyPageHeader
            eyebrow="RESOURCES"
            title="Watch, then read, then build."
            subtitle="Everything here is free."
        />

        {/* The three steps, restated once at the top — the columns below are them. */}
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
                gap: 2,
                mb: 5,
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

        {TRACK_ORDER.map(track => {
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
                                <Typography
                                    variant="body1"
                                    sx={{ fontWeight: 700, color: 'text.primary', mb: 1.5 }}
                                >
                                    {resource.topic}
                                </Typography>

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

        <Typography variant="body2" sx={{ color: '#ff8a65', fontWeight: 600, pb: 2, lineHeight: 1.7 }}>
            {neverSkipBuild}
        </Typography>
    </Box>
);

export default StudyResourcesPage;
