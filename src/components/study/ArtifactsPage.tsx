import { Box, Typography, Stack, Chip, Link, Divider } from '@mui/material';
import LaunchRoundedIcon from '@mui/icons-material/LaunchRounded';
import { useTaskContext } from '../../context/TaskContext';
import {
    projects,
    publishRule,
    projectsNote,
    PROJECT_WEIGHT_LABELS,
    PROJECT_WEIGHT_COLORS,
    ARTIFACT_STAGES,
    ARTIFACT_STAGE_LABELS,
    ARTIFACT_STAGE_NOTES,
} from '../../data/studyPlan';
import {
    getArtifactProgress,
    isArtifactComplete,
    getPublishedCount,
    getArtifactStepsDone,
} from '../../utils/studyProgress';
import StudyPageHeader from './StudyPageHeader';
import ArtifactPipeline from './ArtifactPipeline';

/**
 * The nine artifacts and their four steps each.
 *
 * The two counts at the top are deliberately different numbers: steps done
 * says how much work is in, published says how much of it anyone else can
 * see. The gap between them is the thing this page exists to make visible.
 */
const ArtifactsPage = () => {
    const { artifactProgress } = useTaskContext();

    const published = getPublishedCount(artifactProgress);
    const stepsDone = getArtifactStepsDone(artifactProgress);

    return (
        <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto' }}>
            <StudyPageHeader
                eyebrow="ARTIFACTS"
                title="Build, write, publish, post"
                subtitle={projectsNote}
            />

            <Stack direction="row" spacing={4} sx={{ mb: 4 }} flexWrap="wrap" useFlexGap>
                <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#66bb6a', lineHeight: 1 }}>
                        {published}
                        <Typography component="span" variant="h5" color="text.secondary"> / {projects.length}</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1.2, fontWeight: 700 }}>
                        PUBLISHED
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="h3" fontWeight="bold" sx={{ color: '#4dd0e1', lineHeight: 1 }}>
                        {stepsDone}
                        <Typography component="span" variant="h5" color="text.secondary"> / {projects.length * 4}</Typography>
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1.2, fontWeight: 700 }}>
                        STEPS DONE
                    </Typography>
                </Box>
            </Stack>

            <Box
                sx={{
                    p: 2.5,
                    borderRadius: 3,
                    mb: 5,
                    bgcolor: 'rgba(77,208,225,0.07)',
                    border: '1px solid rgba(77,208,225,0.25)',
                }}
            >
                <Typography variant="body1" sx={{ color: 'text.primary', lineHeight: 1.7 }}>
                    {publishRule}
                </Typography>

                {/* What each step means, said once here rather than nine times below. */}
                <Stack spacing={1} sx={{ mt: 2.5 }}>
                    {ARTIFACT_STAGES.map(stage => (
                        <Stack key={stage} direction="row" spacing={1.5} alignItems="baseline">
                            <Typography
                                variant="caption"
                                sx={{
                                    color: '#4dd0e1', fontWeight: 800, letterSpacing: 0.8,
                                    fontSize: '0.64rem', minWidth: 58, flexShrink: 0,
                                }}
                            >
                                {ARTIFACT_STAGE_LABELS[stage]}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.82rem', lineHeight: 1.55 }}>
                                {ARTIFACT_STAGE_NOTES[stage]}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </Box>

            <Stack spacing={3} sx={{ pb: 4 }}>
                {projects.map(project => {
                    const progress = getArtifactProgress(artifactProgress, project.id);
                    const complete = isArtifactComplete(artifactProgress, project.id);
                    const accent = project.weight ? PROJECT_WEIGHT_COLORS[project.weight] : '#4dd0e1';

                    return (
                        <Box
                            key={project.id}
                            sx={{
                                p: { xs: 2, sm: 3 },
                                borderRadius: 3,
                                bgcolor: complete ? 'rgba(102,187,106,0.06)' : 'rgba(255,255,255,0.02)',
                                border: '1px solid',
                                borderColor: complete ? 'rgba(102,187,106,0.35)' : 'rgba(255,255,255,0.08)',
                            }}
                        >
                            <Stack direction="row" spacing={1.5} alignItems="baseline" flexWrap="wrap" useFlexGap>
                                <Typography
                                    variant="h5"
                                    fontWeight="bold"
                                    sx={{ color: accent, fontVariantNumeric: 'tabular-nums' }}
                                >
                                    {project.number}
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" sx={{ color: 'text.primary', flex: 1 }}>
                                    {project.name}
                                </Typography>
                                <Chip
                                    size="small"
                                    label={`WEEK ${project.byWeek}`}
                                    sx={{
                                        height: 20, fontSize: '0.62rem', fontWeight: 800,
                                        letterSpacing: 0.8, color: 'text.secondary',
                                        bgcolor: 'rgba(255,255,255,0.06)',
                                    }}
                                />
                            </Stack>

                            {project.weight && (
                                <Chip
                                    size="small"
                                    label={PROJECT_WEIGHT_LABELS[project.weight]}
                                    sx={{
                                        mt: 1, height: 20, fontSize: '0.62rem', fontWeight: 800,
                                        color: PROJECT_WEIGHT_COLORS[project.weight],
                                        bgcolor: `${PROJECT_WEIGHT_COLORS[project.weight]}1f`,
                                    }}
                                />
                            )}

                            <Typography variant="body2" sx={{ color: 'text.primary', mt: 1.5, lineHeight: 1.6 }}>
                                {project.proves}
                            </Typography>

                            <Divider sx={{ my: 2 }} />

                            <ArtifactPipeline project={project} />

                            {(progress.repoUrl || progress.postUrl) && (
                                <Stack direction="row" spacing={2} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap>
                                    {progress.repoUrl && (
                                        <Link
                                            href={progress.repoUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}
                                        >
                                            Repo <LaunchRoundedIcon sx={{ fontSize: 14 }} />
                                        </Link>
                                    )}
                                    {progress.postUrl && (
                                        <Link
                                            href={progress.postUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}
                                        >
                                            Write-up <LaunchRoundedIcon sx={{ fontSize: 14 }} />
                                        </Link>
                                    )}
                                </Stack>
                            )}
                        </Box>
                    );
                })}
            </Stack>
        </Box>
    );
};

export default ArtifactsPage;
