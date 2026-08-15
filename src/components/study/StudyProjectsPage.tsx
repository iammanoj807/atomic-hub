import { Box, Typography, Stack, Chip, Checkbox, LinearProgress } from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RadioButtonUncheckedRoundedIcon from '@mui/icons-material/RadioButtonUncheckedRounded';
import { useTaskContext } from '../../context/TaskContext';
import {
    projects,
    projectsNote,
    PROJECT_WEIGHT_LABELS,
    PROJECT_WEIGHT_COLORS,
} from '../../data/studyPlan';
import StudyPageHeader from './StudyPageHeader';

const StudyProjectsPage = () => {
    const { completedProjectIds, toggleProject, currentWeekNumber } = useTaskContext();

    const done = completedProjectIds.length;

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="PROJECTS"
                title={
                    <>
                        <Box component="span" sx={{ color: 'primary.main' }}>{done}</Box>
                        {` of ${projects.length} shipped.`}
                    </>
                }
                subtitle="What you will actually have to show in February."
            />

            <Box sx={{ mb: 5 }}>
                <LinearProgress
                    variant="determinate"
                    value={(done / projects.length) * 100}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar': { borderRadius: 3, bgcolor: 'primary.main' },
                    }}
                />
            </Box>

            <Stack spacing={1.5}>
                {projects.map(project => {
                    const isDone = completedProjectIds.includes(project.id);
                    // Only late once the week it was due has actually passed.
                    const isLate =
                        !isDone && currentWeekNumber !== null && currentWeekNumber > project.byWeek;
                    const accent = project.weight ? PROJECT_WEIGHT_COLORS[project.weight] : null;

                    return (
                        <Box
                            key={project.id}
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: 3,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: isDone ? 'rgba(102, 187, 106, 0.4)' : 'rgba(255,255,255,0.08)',
                                borderLeft: accent ? '4px solid' : '1px solid',
                                borderLeftColor: accent ?? 'rgba(255,255,255,0.08)',
                                opacity: isDone ? 0.75 : 1,
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                                <Checkbox
                                    checked={isDone}
                                    onChange={() => toggleProject(project.id)}
                                    icon={<RadioButtonUncheckedRoundedIcon />}
                                    checkedIcon={<CheckCircleRoundedIcon />}
                                    inputProps={{ 'aria-label': `Mark ${project.name} finished` }}
                                    sx={{
                                        p: 0.5,
                                        color: 'text.disabled',
                                        '&.Mui-checked': { color: '#66bb6a' },
                                        '&:focus': { outline: 'none' },
                                    }}
                                />

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                        flexWrap="wrap"
                                        useFlexGap
                                        sx={{ mb: 0.5 }}
                                    >
                                        <Typography
                                            variant="body1"
                                            sx={{
                                                fontWeight: 700,
                                                color: 'text.primary',
                                                textDecoration: isDone ? 'line-through' : 'none',
                                            }}
                                        >
                                            {project.number}. {project.name}
                                        </Typography>
                                        <Chip
                                            label={`Week ${project.byWeek}`}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.62rem',
                                                fontWeight: 700,
                                                color: isLate ? '#ff8a65' : 'text.secondary',
                                                bgcolor: isLate
                                                    ? 'rgba(255, 138, 101, 0.15)'
                                                    : 'rgba(255,255,255,0.05)',
                                            }}
                                        />
                                        {project.weight && (
                                            <Chip
                                                label={PROJECT_WEIGHT_LABELS[project.weight]}
                                                size="small"
                                                sx={{
                                                    height: 20,
                                                    fontSize: '0.62rem',
                                                    fontWeight: 700,
                                                    color: PROJECT_WEIGHT_COLORS[project.weight],
                                                    bgcolor: `${PROJECT_WEIGHT_COLORS[project.weight]}1f`,
                                                }}
                                            />
                                        )}
                                    </Stack>

                                    <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.55 }}>
                                        {project.proves}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: '0.8rem', mt: 0.5 }}
                                    >
                                        {project.where}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Box>
                    );
                })}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ mt: 4, pb: 2, lineHeight: 1.7 }}>
                {projectsNote}
            </Typography>
        </Box>
    );
};

export default StudyProjectsPage;
