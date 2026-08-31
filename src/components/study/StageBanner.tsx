import { Box, Typography, Stack, Chip } from '@mui/material';
import { PHASE_COLORS, type PlanWeek } from '../../data/studyPlan';

/**
 * Which part of the year this is, and which stage inside it.
 *
 * The stage is the thing the week is actually for — "week 34 of 52" says how
 * much road is left, "Stage 11, How LLMs are actually made" says what you are
 * doing — so it goes above everything else on the page.
 */
const StageBanner = ({ week }: { week: PlanWeek }) => {
    const accent = PHASE_COLORS[week.phaseKey];
    const isConsolidation = week.phaseKey === 'consolidation';

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                mb: 3,
                bgcolor: `${accent}12`,
                border: '1px solid',
                borderColor: `${accent}3d`,
            }}
        >
            <Typography
                variant="caption"
                sx={{ color: accent, letterSpacing: 1.6, fontWeight: 800, fontSize: '0.68rem' }}
            >
                {week.part}
            </Typography>

            <Stack
                direction="row"
                spacing={1.5}
                alignItems="baseline"
                flexWrap="wrap"
                useFlexGap
                sx={{ mt: 0.75 }}
            >
                {!isConsolidation && (
                    <Typography
                        variant="h4"
                        fontWeight="bold"
                        sx={{ color: accent, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}
                    >
                        {week.stage}
                    </Typography>
                )}
                <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.primary', lineHeight: 1.2 }}>
                    {isConsolidation ? week.stageName : `Stage ${week.stage} · ${week.stageName}`}
                </Typography>
                {isConsolidation && (
                    <Chip
                        size="small"
                        label="NO NEW MATERIAL"
                        sx={{
                            height: 20,
                            fontSize: '0.62rem',
                            fontWeight: 800,
                            letterSpacing: 0.8,
                            color: accent,
                            bgcolor: `${accent}1f`,
                        }}
                    />
                )}
            </Stack>
        </Box>
    );
};

export default StageBanner;
