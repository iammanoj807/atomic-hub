import React from 'react';
import { Typography } from '@mui/material';
import { getTaskWhyText } from '../../data/missionTypes';
import type { Role } from '../../data/missionTypes';

interface TaskWhyTextProps {
    role: Role;
    /** Optional custom why-text that overrides the default role-based text */
    customText?: string;
}

const TaskWhyText: React.FC<TaskWhyTextProps> = ({ role, customText }) => {
    const whyText = customText || getTaskWhyText(role);

    return (
        <Typography
            variant="body2"
            sx={{
                fontSize: { xs: '1.02rem', sm: '1.06rem' },
                color: 'primary.main',
                opacity: 0.92,
                mt: 0.75,
                mb: 0.25,
                lineHeight: 1.45,
                letterSpacing: 0.15,
                fontWeight: 600,
                transition: 'opacity 0.2s',
                '&:hover': {
                    opacity: 1,
                },
            }}
        >
            {whyText}
        </Typography>
    );
};

export default TaskWhyText;
