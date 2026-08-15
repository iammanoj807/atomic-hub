import { Box, Typography, Stack } from '@mui/material';
import type { ReactNode } from 'react';

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
                    17 Aug 2026 → 14 Feb 2027 · 26 weeks
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
