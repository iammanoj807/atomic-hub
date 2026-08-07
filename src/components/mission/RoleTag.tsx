import React from 'react';
import { Box, Typography } from '@mui/material';
import { ROLE_LABELS, ROLE_ICONS } from '../../data/missionTypes';
import type { Role } from '../../data/missionTypes';

/** Single blue palette for tags (no per-role red/yellow/orange). */
const TAG_BLUE = '#64b5f6';

interface RoleTagProps {
    role: Role;
    /** Compact mode hides the label text, showing only the icon */
    compact?: boolean;
}

const RoleTag: React.FC<RoleTagProps> = ({ role, compact = false }) => {
    const label = ROLE_LABELS[role];
    const icon = ROLE_ICONS[role];

    return (
        <Box
            sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: compact ? 0.75 : 1,
                py: 0.25,
                borderRadius: '20px',
                bgcolor: 'rgba(41, 121, 255, 0.12)',
                border: '1px solid rgba(100, 181, 246, 0.45)',
                flexShrink: 0,
                transition: 'background-color 0.2s ease, border-color 0.2s ease',
                '&:hover': {
                    bgcolor: 'rgba(41, 121, 255, 0.2)',
                    borderColor: 'rgba(100, 181, 246, 0.65)',
                },
            }}
        >
            <Typography
                component="span"
                sx={{ fontSize: compact ? '0.85rem' : '0.95rem', lineHeight: 1 }}
            >
                {icon}
            </Typography>
            {!compact && (
                <Typography
                    variant="caption"
                    sx={{
                        color: TAG_BLUE,
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {label}
                </Typography>
            )}
        </Box>
    );
};

export default RoleTag;
