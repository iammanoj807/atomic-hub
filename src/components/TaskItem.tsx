import React, { useState } from 'react';
import {
    Box,
    Checkbox,
    IconButton,
    Typography,
    Stack,
    Collapse,
    Button,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { type Task } from '../context/TaskContext';
import { getCoreStory } from '../data/coreStories';

interface TaskItemProps {
    task: Task;
    index: number;
    totalTasks: number;
    isAdmin: boolean;
    isExpanded: boolean;
    /** Category-level practice mode: title only until you ask for more. */
    practiceMode: boolean;
    toggleTaskCompletion: (id: string) => void;
    toggleExpand: (id: string) => void;
    handleOpenEdit: (task: Task) => void;
    handleDeleteTask: (id: string) => void;
}

/** The bullets, styled the same wherever they appear. */
const MemoryPoints = ({ points }: { points: string[] }) => (
    <Box
        sx={{
            borderLeft: '3px solid',
            borderColor: '#f5a623',
            bgcolor: 'rgba(245,166,35,0.05)',
            borderRadius: '0 8px 8px 0',
            p: 3,
        }}
    >
        <Typography
            variant="caption"
            sx={{ color: '#f5a623', fontWeight: 'bold', letterSpacing: 1.5, display: 'block', mb: 1.5, fontSize: '0.65rem' }}
        >
            MEMORY POINTS
        </Typography>
        <Stack spacing={1.2} component="ul" sx={{ m: 0, pl: 2.5 }}>
            {points.map((point, i) => (
                <Typography
                    key={i}
                    component="li"
                    variant="body2"
                    sx={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.6, fontSize: '1.05rem' }}
                >
                    {point}
                </Typography>
            ))}
        </Stack>
    </Box>
);

// Answer format (see data/defaultTasks.ts): paragraphs separated by a blank
// line. A paragraph may open with one of the labels below followed by " — ".
//   SITUATION / TASK / ACTION / RESULT — a STAR part. Read as a plain
//     paragraph; the part name only shows when you hover (or tap) it.
//   IN SHORT — what the whole answer is saying, in one simple line.
//   IN PLAIN WORDS — "• term — meaning" lines for the technical words.
//   CHECK — a reminder to confirm a detail before using the answer.
// Any other text renders as-is, so answers you wrote yourself look unchanged.
const STAR_PARTS = ['SITUATION', 'TASK', 'ACTION', 'RESULT'] as const;
const LABELS = [...STAR_PARTS, 'IN SHORT', 'IN PLAIN WORDS', 'CHECK'];
const LABELLED = new RegExp(`^(${LABELS.join('|')}) — ?([\\s\\S]*)$`);

const parseParagraph = (paragraph: string) => {
    const match = paragraph.match(LABELLED);
    return match
        ? { label: match[1], body: match[2].trim() }
        : { label: undefined, body: paragraph };
};

const answerTextSx = {
    color: 'rgba(255, 255, 255, 0.78)',
    whiteSpace: 'pre-wrap',
    lineHeight: 1.8,
    fontSize: '1.12rem',
} as const;

const SideBox = ({ title, color, children }: { title: string; color: string; children: React.ReactNode }) => (
    <Box sx={{ p: 2, borderRadius: 2, bgcolor: `${color}0d`, border: `1px solid ${color}33` }}>
        <Typography
            variant="caption"
            sx={{ display: 'block', mb: 0.75, fontWeight: 'bold', letterSpacing: 1.5, fontSize: '0.68rem', color }}
        >
            {title}
        </Typography>
        {children}
    </Box>
);

const FullAnswer = ({ text }: { text: string }) => {
    const parts = (text || 'No notes for this question.').split(/\n\s*\n/).map(parseParagraph);
    const spoken = parts.filter(p => !p.label || (STAR_PARTS as readonly string[]).includes(p.label));
    const isStar = spoken.some(p => p.label);
    const inShort = parts.find(p => p.label === 'IN SHORT');
    const plainWords = parts.find(p => p.label === 'IN PLAIN WORDS');
    const checks = parts.filter(p => p.label === 'CHECK');

    return (
        <Box
            sx={{
                borderLeft: '3px solid',
                borderColor: 'primary.main',
                bgcolor: '#0D1626',
                borderRadius: '0 8px 8px 0',
                p: 3,
            }}
        >
            <Stack spacing={2}>
                {spoken.map((part, i) => (
                    <Typography
                        key={i}
                        variant="body2"
                        tabIndex={part.label ? 0 : undefined}
                        sx={{
                            ...answerTextSx,
                            ...(part.label && {
                                mx: -1,
                                px: 1,
                                borderRadius: 1,
                                outline: 'none',
                                transition: 'background-color 0.2s',
                                '& .star-part': { opacity: 0, transition: 'opacity 0.2s' },
                                '&:hover, &:focus': { bgcolor: 'rgba(41,121,255,0.06)' },
                                '&:hover .star-part, &:focus .star-part': { opacity: 1 },
                            }),
                        }}
                    >
                        {part.body}
                        {part.label && (
                            <Box
                                component="span"
                                className="star-part"
                                sx={{ ml: 1, fontSize: '0.7rem', fontWeight: 'bold', letterSpacing: 1.2, color: 'primary.main', whiteSpace: 'nowrap' }}
                            >
                                · {part.label}
                            </Box>
                        )}
                    </Typography>
                ))}

                {isStar && (
                    <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.4)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                        STAR answer — hover over a paragraph to see if it's the Situation, Task, Action or Result.
                        Learn the order, but never say those words out loud.
                    </Typography>
                )}

                {checks.map((check, i) => (
                    <Typography key={i} variant="caption" sx={{ color: '#f5a623', fontStyle: 'italic', fontSize: '0.85rem' }}>
                        ⚠ {check.body}
                    </Typography>
                ))}

                {inShort && (
                    <SideBox title="IN SHORT" color="#00e676">
                        <Typography sx={{ color: 'rgba(255,255,255,0.82)', lineHeight: 1.7, fontSize: '1rem' }}>
                            {inShort.body}
                        </Typography>
                    </SideBox>
                )}

                {plainWords && (
                    <SideBox title="IN PLAIN WORDS — WHAT THE TECHNICAL WORDS MEAN" color="#00e5ff">
                        <Stack spacing={1}>
                            {plainWords.body.split('\n').filter(Boolean).map((line, i) => {
                                const [term, ...rest] = line.replace(/^•\s*/, '').split(' — ');
                                return (
                                    <Typography key={i} sx={{ color: 'rgba(255,255,255,0.72)', lineHeight: 1.7, fontSize: '1rem' }}>
                                        {rest.length > 0 ? (
                                            <>
                                                <strong style={{ color: '#e0e0e0' }}>{term}</strong> — {rest.join(' — ')}
                                            </>
                                        ) : line}
                                    </Typography>
                                );
                            })}
                        </Stack>
                    </SideBox>
                )}
            </Stack>
        </Box>
    );
};

const TaskItem: React.FC<TaskItemProps> = ({
    task,
    index,
    totalTasks,
    isAdmin,
    isExpanded,
    practiceMode,
    toggleTaskCompletion,
    toggleExpand,
    handleOpenEdit,
    handleDeleteTask,
}) => {
    const directMemoryPoints = task.memoryPoints ?? [];
    const coreStory = task.coreStoryId ? getCoreStory(task.coreStoryId) : undefined;
    const coreStoryMemoryPoints = coreStory?.memoryPoints ?? [];
    const memoryPoints = directMemoryPoints.length > 0 ? directMemoryPoints : coreStoryMemoryPoints;
    const hasMemoryPoints = memoryPoints.length > 0;

    // Reveal is per-question and local: how far you've opened this one up.
    // 0 = title only, 1 = memory points, 2 = full answer.
    const [stage, setStage] = useState(0);

    // Toggling practice mode, or opening/closing the row, resets the reveal —
    // otherwise you come back to an answer already showing, which defeats it.
    // Adjusted during render rather than in an effect, so the row never paints
    // one frame with the previous question's answer still open.
    const [lastToggles, setLastToggles] = useState({ practiceMode, isExpanded });
    if (lastToggles.practiceMode !== practiceMode || lastToggles.isExpanded !== isExpanded) {
        setLastToggles({ practiceMode, isExpanded });
        setStage(0);
    }

    // A question with no memory points yet goes straight to the answer,
    // rather than opening onto an empty box.
    const firstStageContent = hasMemoryPoints ? 1 : 2;

    return (
        <Box
            sx={{
                borderBottom: index < totalTasks - 1 ? 1 : 0,
                borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
        >
            {/* Main Row */}
            <Box sx={{ py: 2.5, display: 'flex', alignItems: 'flex-start' }}>
                {/* Checkbox — kept working, but it no longer feeds any metric. */}
                <Checkbox
                    checked={task.completed}
                    onChange={() => toggleTaskCompletion(task.id)}
                    inputProps={{ 'aria-label': `Mark "${task.title}" as covered` }}
                    icon={<CheckCircleOutlineRoundedIcon sx={{ fontSize: 28 }} />}
                    checkedIcon={<CheckCircleRoundedIcon sx={{ fontSize: 28 }} />}
                    sx={{
                        p: 0,
                        mr: 2,
                        mt: 0.3,
                        color: 'rgba(255,255,255,0.3)',
                        '&.Mui-checked': {
                            color: 'success.main',
                        }
                    }}
                />

                {/* Title + reveal control */}
                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="body1"
                        onClick={() => (practiceMode ? undefined : toggleExpand(task.id))}
                        sx={{
                            color: '#e0e0e0',
                            fontWeight: 500,
                            fontSize: '1.3rem',
                            lineHeight: 1.4,
                            cursor: practiceMode ? 'default' : 'pointer',
                            transition: 'color 0.2s',
                            '&:hover': {
                                color: practiceMode ? '#e0e0e0' : 'primary.main',
                            },
                        }}
                    >
                        {task.title}
                    </Typography>

                    {coreStory && (
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.75,
                                color: 'text.secondary',
                                mt: 0.5,
                                mb: 0.5,
                                fontSize: '0.7rem',
                                letterSpacing: 0.5,
                                fontWeight: 600,
                            }}
                        >
                            <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: coreStory.color, display: 'inline-block' }} />
                            CORE STORY · {coreStory.name.toUpperCase()}
                        </Typography>
                    )}

                    {practiceMode ? (
                        // Practice mode: nothing is showing until you ask for it.
                        <Box sx={{ mt: 1 }}>
                            {stage === 0 && (
                                <Button
                                    size="small"
                                    onClick={() => setStage(firstStageContent)}
                                    sx={{ color: '#f5a623', pl: 0, '&:focus': { outline: 'none' } }}
                                >
                                    {hasMemoryPoints ? 'Reveal memory points' : 'Reveal answer'}
                                </Button>
                            )}
                            {stage === 1 && (
                                <Button
                                    size="small"
                                    onClick={() => setStage(2)}
                                    sx={{ color: 'primary.main', pl: 0, '&:focus': { outline: 'none' } }}
                                >
                                    Reveal full answer
                                </Button>
                            )}
                            {stage > 0 && (
                                <Button
                                    size="small"
                                    onClick={() => setStage(0)}
                                    sx={{ color: 'text.secondary', pl: 0, ml: stage === 2 ? 0 : 1, '&:focus': { outline: 'none' } }}
                                >
                                    Hide
                                </Button>
                            )}
                        </Box>
                    ) : (
                        <Box
                            onClick={() => toggleExpand(task.id)}
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 0.5,
                                cursor: 'pointer',
                                mt: 0.5,
                            }}
                        >
                            {isExpanded ? (
                                <VisibilityOffRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            ) : (
                                <VisibilityRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                            )}
                            <Typography
                                variant="caption"
                                sx={{
                                    color: 'primary.main',
                                    fontWeight: 'bold',
                                    letterSpacing: 0.5,
                                    fontSize: '0.7rem',
                                }}
                            >
                                {isExpanded ? 'HIDE ANSWER' : 'REVIEW STORY'}
                            </Typography>
                        </Box>
                    )}
                </Box>

                {/* Action Icons */}
                {isAdmin && (
                    <Stack direction="row" spacing={0.5} sx={{ ml: 1 }}>
                        <IconButton
                            size="small"
                            aria-label={`Edit "${task.title}"`}
                            onClick={() => handleOpenEdit(task)}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'primary.main' },
                            }}
                        >
                            <EditRoundedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                        <IconButton
                            size="small"
                            aria-label={`Delete "${task.title}"`}
                            onClick={() => handleDeleteTask(task.id)}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { color: 'error.main' },
                            }}
                        >
                            <CloseRoundedIcon sx={{ fontSize: 20 }} />
                        </IconButton>
                    </Stack>
                )}
            </Box>

            {/* Revealed content.
                Normal mode: answer + memory points together in one click.
                Practice mode: staged reveal — memory points first, then full answer. */}
            <Collapse in={practiceMode ? stage > 0 : isExpanded}>
                <Box sx={{ pl: 6, pr: 2, pb: 3 }}>
                    {practiceMode ? (
                        // Practice mode: staged reveal
                        <>
                            {stage === 1 && (
                                <MemoryPoints points={memoryPoints} />
                            )}
                            {stage >= 2 && (
                                <Stack spacing={2}>
                                    <FullAnswer text={task.description} />
                                    {hasMemoryPoints && <MemoryPoints points={memoryPoints} />}
                                </Stack>
                            )}
                        </>
                    ) : (
                        // Normal mode: answer first, then memory points below
                        <Stack spacing={2}>
                            <FullAnswer text={task.description} />
                            {hasMemoryPoints && <MemoryPoints points={memoryPoints} />}
                        </Stack>
                    )}
                </Box>
            </Collapse>
        </Box>
    );
};

export default TaskItem;
