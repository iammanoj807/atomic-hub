import { Box, Typography, Stack, Chip } from '@mui/material';
import WbTwilightRoundedIcon from '@mui/icons-material/WbTwilightRounded';
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import CodeRoundedIcon from '@mui/icons-material/CodeRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import { PHASE_COLORS, type PlanWeek } from '../../data/studyPlan';

/** One row of a week: the icon, what the slot is, and what it asks for. */
const WeekLine = ({
    icon,
    label,
    text,
}: {
    icon: React.ReactNode;
    label: string;
    text: string;
}) => (
    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
        <Box sx={{ color: 'text.disabled', display: 'flex', pt: '2px' }}>{icon}</Box>
        <Box sx={{ minWidth: 0 }}>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{ letterSpacing: 1.2, fontSize: '0.65rem', fontWeight: 700, display: 'block' }}
            >
                {label}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.55 }}>
                {text}
            </Typography>
        </Box>
    </Box>
);

/**
 * A single week of the plan. Used both as the "this week" hero on the overview
 * and as a row in the 26-week list, so the same week never reads two ways.
 */
const WeekCard = ({
    week,
    highlighted = false,
}: {
    week: PlanWeek;
    highlighted?: boolean;
}) => {
    const accent = PHASE_COLORS[week.phaseKey];

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 3 },
                borderRadius: 3,
                bgcolor: highlighted ? 'rgba(41, 121, 255, 0.06)' : 'background.paper',
                border: '1px solid',
                borderColor: highlighted ? 'primary.main' : 'rgba(255,255,255,0.08)',
                borderLeft: '4px solid',
                borderLeftColor: accent,
            }}
        >
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                spacing={2}
                sx={{ mb: 2 }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: accent, letterSpacing: 1.4, fontWeight: 800, fontSize: '0.68rem' }}
                    >
                        WEEK {week.week} · {week.dates.toUpperCase()}
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, lineHeight: 1.3 }}>
                        {week.phase.replace(/\*/g, '').trim()}
                    </Typography>
                </Box>
                <Chip
                    label={`${week.targetHours}h`}
                    size="small"
                    sx={{
                        flexShrink: 0,
                        height: 24,
                        fontWeight: 700,
                        fontSize: '0.7rem',
                        color: accent,
                        bgcolor: `${accent}1f`,
                        fontVariantNumeric: 'tabular-nums',
                    }}
                />
            </Stack>

            <Stack spacing={1.75}>
                <WeekLine icon={<WbTwilightRoundedIcon sx={{ fontSize: 18 }} />} label="MORNINGS · THEORY" text={week.theory} />
                <WeekLine icon={<ConstructionRoundedIcon sx={{ fontSize: 18 }} />} label="DEEP WORK 5H · YOUR DAY OFF" text={week.deepWork} />
                <WeekLine icon={<HubRoundedIcon sx={{ fontSize: 18 }} />} label="AI ENGINEERING 3.5H" text={week.aiEng} />
                <WeekLine icon={<CodeRoundedIcon sx={{ fontSize: 18 }} />} label="DAILY DSA" text={week.dsa} />
            </Stack>

            {week.milestone && (
                <Box
                    sx={{
                        mt: 2.5,
                        pt: 2,
                        borderTop: 1,
                        borderColor: 'rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <FlagRoundedIcon sx={{ fontSize: 18, color: accent }} />
                    <Typography variant="body2" sx={{ color: accent, fontWeight: 700 }}>
                        {week.milestone.replace(/\*/g, '').trim()}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

export default WeekCard;
