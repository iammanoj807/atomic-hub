import React, { useState, useEffect } from 'react';
import { Box, Typography, Card, IconButton, Tooltip } from '@mui/material';
import { useTaskContext } from '../context/TaskContext';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameDay,
    isSameMonth,
    addMonths,
    subMonths,
    isAfter,
    startOfDay,
    parseISO,
    isBefore
} from 'date-fns';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// start date: February 11, 2026
const START_DATE_STR = '2026-02-11';

const StreakCalendar: React.FC = () => {
    const { historyData, changeDate, selectedDate, allDailyHabits } = useTaskContext();
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const today = startOfDay(new Date());
    const startDate = startOfDay(parseISO(START_DATE_STR));

    const handlePrevMonth = () => {
        const nextMonth = subMonths(currentMonth, 1);
        setCurrentMonth(nextMonth);
        if (isSameMonth(nextMonth, today)) {
            changeDate(format(today, 'yyyy-MM-dd'));
        }
    };

    const handleNextMonth = () => {
        const nextMonth = addMonths(currentMonth, 1);
        setCurrentMonth(nextMonth);
        if (isSameMonth(nextMonth, today)) {
            changeDate(format(today, 'yyyy-MM-dd'));
        }
    };

    // Generate days for the grid
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const dateStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const dateEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const calendarDays = eachDayOfInterval({ start: dateStart, end: dateEnd });

    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Get habits that existed on a given date (filter by createdAt)
    const getHabitsForDate = (dateStr: string) => {
        return allDailyHabits.filter(habit => {
            // Legacy habits without createdAt are always included
            if (!habit.createdAt) return true;
            // Only include habits created on or before this date
            return habit.createdAt <= dateStr;
        });
    };

    const isAllCompleted = (dateStr: string) => {
        const log = historyData[dateStr];
        // If no log at all, definitely not all done
        if (!log || !log.habits) return false;

        const habitsForDate = getHabitsForDate(dateStr);
        if (habitsForDate.length === 0) return false;

        // Count how many of the *habits for this date* are actually completed in the log
        const completedCount = habitsForDate.filter(h => log.habits[h.id]?.completed).length;

        return completedCount > 0 && completedCount >= habitsForDate.length;
    };

    const getCompletionInfo = (dateStr: string, isToday: boolean): string => {
        const log = historyData[dateStr];
        const habitsForDate = getHabitsForDate(dateStr);
        const total = habitsForDate.length;
        if (total === 0) return 'No habits set';

        const completed = habitsForDate.filter(h => log?.habits?.[h.id]?.completed).length;

        if (completed >= total) return 'All Done';
        if (completed === 0) {
            return isToday ? 'In Progress' : 'Habit Incomplete';
        }
        // Some completed but not all
        return isToday
            ? `In Progress — ${completed}/${total} completed`
            : `${completed}/${total} completed`;
    };

    return (
        <Card sx={{
            mb: 4,
            bgcolor: 'background.paper', // Match theme
            borderRadius: 4,
            color: 'text.primary',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' } // Responsive split
        }}>
            {/* LEFT SIDE: CALENDAR */}
            <Box sx={{
                p: 3,
                flex: 1,
                maxWidth: { md: 400 },
                borderRight: { md: '1px solid rgba(255,255,255,0.05)' }
            }}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, px: 1 }}>
                    <Typography variant="h6" fontWeight="bold">
                        {format(currentMonth, 'MMMM yyyy')}
                    </Typography>
                    <Box>
                        <IconButton aria-label="Previous month" onClick={handlePrevMonth} size="small" sx={{ color: 'text.secondary', p: 0.5 }}>
                            <ArrowBackIosNewRoundedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton aria-label="Next month" onClick={handleNextMonth} size="small" sx={{ color: 'text.secondary', p: 0.5 }}>
                            <ArrowForwardIosRoundedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Box>
                </Box>

                {/* Grid */}
                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                    {weekDays.map((day, index) => (
                        <Box key={index} sx={{ textAlign: 'center', pb: 1 }}>
                            <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ fontSize: '0.75rem' }}>
                                {day}
                            </Typography>
                        </Box>
                    ))}

                    {calendarDays.map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isCurrentMonth = isSameMonth(date, currentMonth);
                        const isSelected = selectedDate === dateStr;
                        const isTodayDate = isSameDay(date, today);
                        const allDone = isAllCompleted(dateStr);
                        const isFuture = isAfter(date, today);
                        const isBeforeStart = isBefore(date, startDate);

                        // Disable interaction if Future, Before Start Date, or not in Current Month
                        const isDisabled = isFuture || isBeforeStart || !isCurrentMonth;

                        return (
                            <Tooltip key={dateStr} title={isFuture ? 'Future' : isBeforeStart ? 'Before Start Date' : !isCurrentMonth ? '' : `${format(date, 'MMM d')}: ${getCompletionInfo(dateStr, isTodayDate)}`} arrow>
                                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                    <Box
                                        onClick={() => !isDisabled && changeDate(dateStr)}
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: '50%',
                                            flexShrink: 0,
                                            bgcolor: allDone
                                                ? 'rgba(76, 175, 80, 0.2)'
                                                : 'transparent',
                                            color: isDisabled
                                                ? 'text.disabled' // Dim disabled dates
                                                : allDone
                                                    ? '#4caf50'
                                                    : isCurrentMonth ? 'text.primary' : 'text.disabled',
                                            border: isSelected
                                                ? '2px solid #2196f3'
                                                : isTodayDate
                                                    ? '1px solid rgba(255,255,255,0.3)'
                                                    : '1px solid transparent',
                                            cursor: isDisabled ? 'default' : 'pointer',
                                            pointerEvents: isDisabled ? 'none' : 'auto',
                                            opacity: (isBeforeStart || !isCurrentMonth) ? 0.3 : 1, // Extra dim for before start or other months
                                            transition: 'all 0.2s',
                                            '&:hover': isDisabled ? {} : {
                                                bgcolor: allDone ? 'rgba(76, 175, 80, 0.3)' : 'action.hover',
                                                transform: 'scale(1.1)'
                                            }
                                        }}
                                    >
                                        <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.9rem', lineHeight: 1 }}>
                                            {format(date, 'd')}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Tooltip>
                        );
                    })}
                </Box>
            </Box>

            {/* RIGHT SIDE: TIME & LOCATION */}
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                bgcolor: 'rgba(0,0,0,0.2)', // Slightly darker/different shade
                background: 'linear-gradient(135deg, rgba(30,30,30,0) 0%, rgba(0,0,0,0.2) 100%)'
            }}>
                <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h2" fontWeight="bold" sx={{ mb: 1, letterSpacing: 2 }}>
                        {format(currentTime, 'h:mm')}
                        <Typography component="span" variant="h5" sx={{ ml: 1, color: 'text.secondary', fontWeight: 'light' }}>
                            {format(currentTime, 'a')}
                        </Typography>
                    </Typography>

                    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3, letterSpacing: 1 }}>
                        {format(currentTime, 'EEEE, MMMM do')}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, opacity: 0.7 }}>
                        <LocationOnIcon fontSize="small" color="primary" />
                        <Typography variant="body2" fontWeight="medium">
                            Birmingham, UK
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Card>
    );
};

export default StreakCalendar;
