import React from 'react';
import { Box, Typography } from '@mui/material';
import EvidencePrompt from './EvidencePrompt';

const Dashboard: React.FC = () => {
    return (
        <Box sx={{
            width: '100%',
            maxWidth: 1000,
            mx: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            minHeight: 'calc(100vh - 80px)',
            justifyContent: 'center',
            px: { xs: 2, md: 4 },
            pb: 4
        }}>
            {/* Quote */}
            <Box sx={{ mb: { xs: 6, md: 10 }, textAlign: 'center', px: { xs: 2, sm: 4 } }}>
                <Typography
                    variant="h4"
                    sx={{
                        fontStyle: 'italic',
                        fontWeight: 700,
                        opacity: 0.85,
                        color: 'primary.light',
                        letterSpacing: 0.5,
                        lineHeight: 1.5,
                        fontSize: { xs: '1.4rem', sm: '1.8rem', md: '2.4rem' },
                        maxWidth: 900,
                        mx: 'auto',
                    }}
                >
                    "The pain of discipline weighs ounces. The pain of regret weighs tonnes."
                </Typography>
            </Box>

            {/* Evidence Prompt - Massive */}
            <Box sx={{ transform: { xs: 'scale(1.05)', md: 'scale(1.25)' }, transformOrigin: 'top center', width: '100%', display: 'flex', justifyContent: 'center' }}>
                <EvidencePrompt />
            </Box>
        </Box>
    );
};

export default Dashboard;
