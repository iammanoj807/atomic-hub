import { useState } from 'react';
import { Box, Typography, Button, Dialog, IconButton, Stack } from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import { useTaskContext, type Task } from '../context/TaskContext';

const CONFIDENCE_OPTIONS: { value: 1 | 2 | 3; label: string; color: string }[] = [
    { value: 1, label: 'Shaky', color: '#ff9800' },
    { value: 2, label: 'Okay', color: '#4a90e2' },
    { value: 3, label: 'Solid', color: '#00e676' },
];

interface ColdShotProps {
    /** Questions eligible for a cold shot — today's three are already excluded. */
    candidates: Task[];
}

/**
 * One unprepared question, full screen, answer hidden until you ask for it.
 *
 * The point is the gap between seeing the question and seeing the answer: that
 * is where the recall happens, and recall under surprise is exactly the skill
 * nerves attack. Revealing early costs nothing except the value of the exercise.
 */
const ColdShot = ({ candidates }: ColdShotProps) => {
    const { recordPractice } = useTaskContext();
    const [isOpen, setIsOpen] = useState(false);
    const [task, setTask] = useState<Task | null>(null);
    const [isRevealed, setIsRevealed] = useState(false);

    const pickRandom = (): Task | null => {
        if (candidates.length === 0) return null;
        return candidates[Math.floor(Math.random() * candidates.length)];
    };

    const handleOpen = () => {
        setTask(pickRandom());
        setIsRevealed(false);
        setIsOpen(true);
    };

    const handleNext = () => {
        setTask(pickRandom());
        setIsRevealed(false);
    };

    const handleConfidence = async (confidence: 1 | 2 | 3) => {
        if (task) {
            await recordPractice(task.id, confidence);
            handleNext(); // Auto-advance after scoring
        }
    };

    return (
        <>
            <Button
                variant="outlined"
                startIcon={<BoltRoundedIcon />}
                onClick={handleOpen}
                disabled={candidates.length === 0}
                sx={{
                    mt: 3,
                    borderColor: 'rgba(245,166,35,0.4)',
                    color: '#f5a623',
                    '&:hover': { borderColor: '#f5a623', bgcolor: 'rgba(245,166,35,0.08)' },
                    '&:focus': { outline: 'none' },
                }}
            >
                Cold shot
            </Button>

            <Dialog
                open={isOpen}
                onClose={() => setIsOpen(false)}
                fullScreen
                slotProps={{ paper: { sx: { bgcolor: 'background.default', backgroundImage: 'none' } } }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
                    <IconButton
                        aria-label="Close cold shot"
                        onClick={() => setIsOpen(false)}
                        sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
                    >
                        <CloseRoundedIcon />
                    </IconButton>
                </Box>

                <Box
                    sx={{
                        maxWidth: 760,
                        mx: 'auto',
                        width: '100%',
                        px: { xs: 3, sm: 4 },
                        pb: 8,
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <Typography
                        variant="caption"
                        sx={{ color: '#f5a623', fontWeight: 'bold', letterSpacing: 1.5, mb: 3, fontSize: '0.7rem' }}
                    >
                        COLD SHOT · ANSWER IT BEFORE YOU LOOK
                    </Typography>

                    <Typography
                        sx={{
                            color: 'text.primary',
                            fontSize: { xs: '1.8rem', sm: '2.4rem' },
                            fontWeight: 600,
                            lineHeight: 1.35,
                            mb: 5,
                        }}
                    >
                        {task?.title}
                    </Typography>

                    {isRevealed ? (
                        <>
                            <Box
                            sx={{
                                borderLeft: '3px solid',
                                borderColor: 'primary.main',
                                bgcolor: '#0D1626',
                                borderRadius: '0 8px 8px 0',
                                p: 3,
                                mb: 3,
                            }}
                        >
                            <Typography
                                variant="body2"
                                sx={{
                                    color: 'rgba(255, 255, 255, 0.7)',
                                    whiteSpace: 'pre-wrap',
                                    lineHeight: 1.8,
                                    fontSize: '1.12rem',
                                }}
                            >
                                {task?.description || 'No notes for this question.'}
                            </Typography>
                        </Box>
                        
                        <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 4, mt: 1 }}>
                            <Typography variant="body1" color="text.secondary" sx={{ mr: 1 }}>
                                How did that feel?
                            </Typography>
                            {CONFIDENCE_OPTIONS.map(option => (
                                <Button
                                    key={option.value}
                                    variant="outlined"
                                    onClick={() => handleConfidence(option.value)}
                                    sx={{
                                        borderColor: 'rgba(255,255,255,0.15)',
                                        color: option.color,
                                        '&:hover': { borderColor: option.color, bgcolor: `${option.color}14` },
                                        '&:focus': { outline: 'none' },
                                    }}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </Stack>
                    </>
                    ) : (
                        <Box
                            onClick={() => setIsRevealed(true)}
                            role="button"
                            tabIndex={0}
                            aria-label="Reveal the answer"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') setIsRevealed(true);
                            }}
                            sx={{
                                border: '1px dashed rgba(255,255,255,0.15)',
                                borderRadius: 2,
                                py: 6,
                                textAlign: 'center',
                                cursor: 'pointer',
                                mb: 3,
                                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(255,255,255,0.02)' },
                            }}
                        >
                            <Typography variant="body1" color="text.secondary">
                                Say it out loud first. Then tap to reveal the answer.
                            </Typography>
                        </Box>
                    )}

                    <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 4 }}>
                        <Button
                            startIcon={<RefreshRoundedIcon />}
                            onClick={handleNext}
                            sx={{ color: 'text.secondary', '&:focus': { outline: 'none' } }}
                        >
                            Skip / Another one
                        </Button>
                    </Stack>
                </Box>
            </Dialog>
        </>
    );
};

export default ColdShot;
