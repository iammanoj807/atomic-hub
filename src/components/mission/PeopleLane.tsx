import React from 'react';
import { Box, Stack } from '@mui/material';
import type { DailyHabit } from '../../context/TaskContext';
import { isPersonHabit } from '../../data/missionTypes';

interface PeopleLaneProps {
    habits: DailyHabit[];
    renderHabitCard: (habit: DailyHabit) => React.ReactNode;
}

const PeopleLane: React.FC<PeopleLaneProps> = ({ habits, renderHabitCard }) => {
    const peopleHabits = habits.filter((h) => isPersonHabit(h));

    // Don't render the section at all if there are no people habits
    if (peopleHabits.length === 0) return null;

    return (
        <Box sx={{ mt: 4, mb: 2 }}>
            <Stack spacing={2}>{peopleHabits.map((habit) => renderHabitCard(habit))}</Stack>
        </Box>
    );
};

export default PeopleLane;
