import { Box, Typography, Stack, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTaskContext } from '../context/TaskContext';
import { CORE_STORIES } from '../data/coreStories';

/**
 * The five stories, and how each one bends.
 *
 * The point of this page is that an unexpected question is not a request for a
 * new story — it's a request to re-angle one of these. So each card leads with
 * the hook, then the memory points, then explicitly how to re-aim it.
 */
const CoreStoriesPage = () => {
    const { tasks } = useTaskContext();
    const navigate = useNavigate();

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', pb: 6 }}>
            {/* Top Status Bar */}
            <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="flex-start"
                sx={{ pb: 3, mb: 4, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}
            >
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight="bold"
                        sx={{ letterSpacing: 1.5, display: 'block', mb: 0.5 }}
                    >
                        THE MENTAL MODEL
                    </Typography>
                    <Typography variant="body1" fontWeight="medium" color="text.primary">
                        Core Stories
                    </Typography>
                </Box>
            </Stack>

            {/* Header */}
            <Box sx={{ mb: 5 }}>
                <Typography
                    variant="h2"
                    fontWeight="bold"
                    sx={{ color: 'text.primary', mb: 1.5, fontSize: { xs: '2rem', sm: '3.75rem' } }}
                >
                    You need five stories, not thirty.
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.7 }}>
                    When an unexpected question arrives, don't hunt for something new. Pick the closest
                    story and change the spotlight.
                </Typography>
            </Box>

            <Stack spacing={5}>
                {CORE_STORIES.map((story, index) => {
                    // Questions that were linked to this story in the content.
                    const linkedTasks = tasks.filter(t => t.coreStoryId === story.id);

                    return (
                        <Box
                            key={story.id}
                            sx={{
                                p: { xs: 3, sm: 4 },
                                borderRadius: 4,
                                border: '1px solid rgba(255,255,255,0.08)',
                                bgcolor: 'rgba(255,255,255,0.03)',
                                borderLeft: '4px solid',
                                borderLeftColor: story.color,
                                transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
                                '&:hover': {
                                    borderColor: `${story.color}55`,
                                    boxShadow: `0 0 24px ${story.color}15`,
                                },
                            }}
                        >
                            {/* Story number + name */}
                            <Stack direction="row" alignItems="baseline" spacing={2} sx={{ mb: 2 }}>
                                <Typography
                                    sx={{
                                        color: story.color,
                                        fontWeight: 800,
                                        fontSize: { xs: '1.8rem', sm: '2.4rem' },
                                        letterSpacing: 1,
                                        opacity: 0.7,
                                    }}
                                >
                                    {String(index + 1).padStart(2, '0')}
                                </Typography>
                                <Typography
                                    variant="h3"
                                    fontWeight="bold"
                                    sx={{ color: 'text.primary', fontSize: { xs: '1.8rem', sm: '2.4rem' } }}
                                >
                                    {story.name}
                                </Typography>
                            </Stack>

                            {/* Hook */}
                            <Typography
                                variant="h6"
                                sx={{
                                    color: story.color,
                                    mb: 3,
                                    fontStyle: 'italic',
                                    opacity: 0.95,
                                    fontSize: { xs: '1.2rem', sm: '1.4rem' },
                                    lineHeight: 1.6,
                                    fontWeight: 400,
                                }}
                            >
                                "{story.hook}"
                            </Typography>

                            {/* What it covers */}
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.2, mb: 4 }}>
                                {story.covers.map(cover => (
                                    <Chip
                                        key={cover}
                                        label={cover}
                                        sx={{
                                            height: 34,
                                            fontSize: '0.92rem',
                                            fontWeight: 500,
                                            color: story.color,
                                            bgcolor: `${story.color}1a`,
                                            border: `1px solid ${story.color}30`,
                                        }}
                                    />
                                ))}
                            </Box>

                            {/* Memory points */}
                            <Typography
                                sx={{
                                    color: '#f5a623',
                                    fontWeight: 'bold',
                                    letterSpacing: 2.5,
                                    display: 'block',
                                    mb: 2,
                                    fontSize: '0.88rem',
                                }}
                            >
                                MEMORY POINTS
                            </Typography>
                            <Box
                                sx={{
                                    borderLeft: '3px solid',
                                    borderColor: '#f5a623',
                                    bgcolor: 'rgba(245,166,35,0.04)',
                                    borderRadius: '0 10px 10px 0',
                                    p: 2.5,
                                    mb: 3.5,
                                }}
                            >
                                <Stack spacing={1.5} component="ul" sx={{ m: 0, pl: 2.5 }}>
                                    {story.memoryPoints.map((point, i) => (
                                        <Typography
                                            key={i}
                                            component="li"
                                            sx={{
                                                color: 'rgba(255,255,255,0.88)',
                                                lineHeight: 1.8,
                                                fontSize: '1.15rem',
                                            }}
                                        >
                                            {point}
                                        </Typography>
                                    ))}
                                </Stack>
                            </Box>

                            {/* Flex notes — how to re-angle it */}
                            <Typography
                                color="text.secondary"
                                fontWeight="bold"
                                sx={{ letterSpacing: 2.5, display: 'block', mb: 2, fontSize: '0.88rem' }}
                            >
                                FLEX NOTES
                            </Typography>
                            <Stack spacing={2.5} sx={{ mb: linkedTasks.length > 0 ? 3.5 : 0 }}>
                                {story.flexNotes.map((note, i) => (
                                    <Box
                                        key={i}
                                        sx={{
                                            borderLeft: '2px solid rgba(255,255,255,0.15)',
                                            pl: 2.5,
                                            py: 0.5,
                                        }}
                                    >
                                        <Typography
                                            sx={{
                                                color: 'text.primary',
                                                fontWeight: 600,
                                                mb: 0.75,
                                                fontSize: '1.1rem',
                                            }}
                                        >
                                            If they ask: {note.when}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: 'text.secondary',
                                                lineHeight: 1.8,
                                                fontSize: '1.08rem',
                                            }}
                                        >
                                            {note.how}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>

                            {/* Questions this story answers */}
                            {linkedTasks.length > 0 && (
                                <>
                                    <Typography
                                        color="text.secondary"
                                        fontWeight="bold"
                                        sx={{ letterSpacing: 2.5, display: 'block', mb: 1.5, fontSize: '0.88rem' }}
                                    >
                                        COVERS {linkedTasks.length} QUESTION{linkedTasks.length === 1 ? '' : 'S'} IN YOUR HUB
                                    </Typography>
                                    <Stack spacing={0.75}>
                                        {linkedTasks.map(task => (
                                            <Typography
                                                key={task.id}
                                                variant="body2"
                                                onClick={() =>
                                                    navigate(`/category/${encodeURIComponent(task.category)}`)
                                                }
                                                sx={{
                                                    color: 'text.secondary',
                                                    cursor: 'pointer',
                                                    fontSize: '1.08rem',
                                                    py: 0.4,
                                                    '&:hover': { color: story.color },
                                                    transition: 'color 0.2s ease',
                                                }}
                                            >
                                                → {task.title}
                                            </Typography>
                                        ))}
                                    </Stack>
                                </>
                            )}
                        </Box>
                    );
                })}
            </Stack>

            {/* The three moves, at the end where they read as a summary. */}
            <Box sx={{
                mt: 6,
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                border: '1px solid rgba(255,255,255,0.08)',
                bgcolor: 'rgba(255,255,255,0.025)',
            }}>
                <Typography
                    color="text.secondary"
                    fontWeight="bold"
                    sx={{ letterSpacing: 2.5, display: 'block', mb: 2.5, fontSize: '0.88rem' }}
                >
                    THE THREE FLEX MOVES
                </Typography>
                <Stack spacing={2.5}>
                    <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.8 }}>
                        <strong style={{ color: '#d7d2ce' }}>Change the spotlight.</strong> Same facts,
                        different emphasis. The Performance Fix is a technical story if they ask about
                        achievement, an ownership story if they ask who assigned it.
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.8 }}>
                        <strong style={{ color: '#d7d2ce' }}>Change the opening line.</strong> Start with
                        whatever they asked about. "The part I'm proudest of…" versus "Nobody actually
                        assigned me that…" — same story, instantly relevant.
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '1.1rem', lineHeight: 1.8 }}>
                        <strong style={{ color: '#d7d2ce' }}>Change the closing lesson.</strong> End with the
                        lesson that answers their question, not the one you rehearsed.
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
};

export default CoreStoriesPage;
