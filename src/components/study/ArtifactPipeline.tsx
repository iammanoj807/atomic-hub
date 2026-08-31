import { Box, Typography, Stack, Checkbox, Tooltip, LinearProgress } from '@mui/material';
import { useTaskContext } from '../../context/TaskContext';
import {
    ARTIFACT_STAGES,
    ARTIFACT_STAGE_LABELS,
    type PlanProject,
} from '../../data/studyPlan';
import { getArtifactProgress, isArtifactComplete } from '../../utils/studyProgress';

const ACCENT = '#4dd0e1';

/**
 * The four steps of one artifact.
 *
 * BUILD sits first and counts for exactly as much as the other three, which is
 * the point: a repo nobody can run and nobody has read is not a finished
 * artifact, and a row of four boxes says that more plainly than a paragraph.
 */
const ArtifactPipeline = ({
    project,
    compact = false,
}: {
    project: PlanProject;
    /** On This Week the pipeline is a strip; on the Artifacts page it is a card. */
    compact?: boolean;
}) => {
    const { artifactProgress, toggleArtifactStage } = useTaskContext();

    const progress = getArtifactProgress(artifactProgress, project.id);
    const done = ARTIFACT_STAGES.filter(stage => progress[stage]).length;
    const complete = isArtifactComplete(artifactProgress, project.id);

    return (
        <Box>
            {!compact && (
                <LinearProgress
                    variant="determinate"
                    value={(done / ARTIFACT_STAGES.length) * 100}
                    sx={{
                        height: 4,
                        borderRadius: 2,
                        mb: 2,
                        bgcolor: 'rgba(255,255,255,0.06)',
                        '& .MuiLinearProgress-bar': { bgcolor: complete ? '#66bb6a' : ACCENT },
                    }}
                />
            )}

            <Stack
                direction="row"
                spacing={{ xs: 0.5, sm: 1.5 }}
                flexWrap="wrap"
                useFlexGap
            >
                {ARTIFACT_STAGES.map(stage => (
                    <Tooltip key={stage} title={project.pipeline[stage]} arrow>
                        <Stack
                            direction="row"
                            alignItems="center"
                            spacing={0.25}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => toggleArtifactStage(project.id, stage)}
                        >
                            <Checkbox
                                checked={progress[stage]}
                                size="small"
                                sx={{
                                    p: 0.5,
                                    color: 'rgba(255,255,255,0.3)',
                                    '&.Mui-checked': { color: ACCENT },
                                }}
                            />
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: 0.8,
                                    fontSize: '0.66rem',
                                    color: progress[stage] ? ACCENT : 'text.secondary',
                                }}
                            >
                                {ARTIFACT_STAGE_LABELS[stage]}
                            </Typography>
                        </Stack>
                    </Tooltip>
                ))}
            </Stack>

            {!compact && (
                <Stack spacing={1} sx={{ mt: 2 }}>
                    {ARTIFACT_STAGES.map(stage => (
                        <Box key={stage}>
                            <Typography
                                variant="caption"
                                sx={{
                                    fontWeight: 800,
                                    letterSpacing: 0.8,
                                    fontSize: '0.64rem',
                                    color: progress[stage] ? ACCENT : 'text.disabled',
                                }}
                            >
                                {ARTIFACT_STAGE_LABELS[stage]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                {project.pipeline[stage]}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            )}
        </Box>
    );
};

export default ArtifactPipeline;
