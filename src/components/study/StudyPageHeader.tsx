import { Box, Typography, Stack } from '@mui/material';
import type { ReactNode } from 'react';
import { PLAN_START_DATE, PLAN_END_DATE, PLAN_WEEKS } from '../../data/studyPlan';

/** '31 Aug 2026' — read at UTC so no timezone can shift the plan's own dates. */
const readable = (dateISO: string) =>
    new Date(`${dateISO}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC',
    });

/**
 * The top of every Study Plan page — an eyebrow, a headline and one line of
 * context, matching the Evidence Log's header so the app still reads as one app.
 */
const StudyPageHeader = ({
    eyebrow,
    title,
    subtitle,
    action,
}: {
    eyebrow: string;
    title: ReactNode;
    subtitle?: ReactNode;
    action?: ReactNode;
}) => (
    <Box sx={{ mb: 5 }}>
        <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={{ xs: 2, sm: 0 }}
            sx={{ pb: 3, mb: 4, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}
        >
            <Box>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="bold"
                    sx={{ letterSpacing: 1.5, display: 'block', mb: 0.5 }}
                >
                    {eyebrow}
                </Typography>
                <Typography variant="body1" fontWeight="medium" color="text.primary">
                    {readable(PLAN_START_DATE)} → {readable(PLAN_END_DATE)} · {PLAN_WEEKS} weeks
                </Typography>
            </Box>
            {action}
        </Stack>

        <Typography
            variant="h2"
            fontWeight="bold"
            sx={{ color: 'text.primary', mb: 1, fontSize: { xs: '2rem', sm: '3rem' } }}
        >
            {title}
        </Typography>
        {subtitle && (
            <Typography variant="body1" color="text.secondary">
                {subtitle}
            </Typography>
        )}
    </Box>
);

export default StudyPageHeader;
