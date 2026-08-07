import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Stack,
    Paper,
    Chip,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Tooltip,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { getTopicContent } from '../data/dsaContent';
import type { DSAProblemItem } from '../data/dsaContent';

const DSATopicDetailPage = () => {
    const { topicId } = useParams<{ topicId: string }>();
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const content = topicId ? getTopicContent(topicId) : undefined;

    const handleCopy = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy code: ', err);
        }
    };

    if (!content) {
        return (
            <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography color="text.secondary">Topic not found</Typography>
                <IconButton aria-label="Back to the DSA hub" onClick={() => navigate('/dsa')} sx={{ mt: 2 }}>
                    <ArrowBackRoundedIcon /> Back to DSA Hub
                </IconButton>
            </Box>
        );
    }

    const difficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'success';
            case 'Medium': return 'warning';
            case 'Hard': return 'error';
            default: return 'default';
        }
    };

    const renderProblems = (problems: DSAProblemItem[], difficulty: string) => (
        problems.length > 0 && (
            <Box sx={{ mb: 2 }}>
                <Chip
                    label={difficulty}
                    size="small"
                    color={difficultyColor(difficulty) as 'success' | 'warning' | 'error'}
                    sx={{ mb: 1, fontWeight: 'bold' }}
                />
                <Stack spacing={0.5}>
                    {problems.map((problem, idx) => (
                        <Box
                            key={idx}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                py: 0.5
                            }}
                        >
                            <CheckCircleOutlineRoundedIcon sx={{ fontSize: 20, color: 'text.disabled' }} />
                            <Typography variant="body1" color="text.primary">
                                {problem.title}
                                {problem.leetcodeNum && (
                                    <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                                        #{problem.leetcodeNum}
                                    </Typography>
                                )}
                            </Typography>
                        </Box>
                    ))}
                </Stack>
            </Box>
        )
    );

    return (
        <Box sx={{ width: '100%', maxWidth: 1000, mx: 'auto', pb: 4, px: { xs: 1, sm: 0 }, overflowX: 'hidden' }}>
            {/* Back Button & Header */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 4, width: '100%', maxWidth: '100%', overflow: 'hidden' }}
            >
                <IconButton
                    onClick={() => navigate('/dsa')}
                    sx={{
                        bgcolor: 'rgba(255,255,255,0.05)',
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                    }}
                >
                    <ArrowBackRoundedIcon />
                </IconButton>
                <Box sx={{ minWidth: 0, width: '100%' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1.5, display: 'block' }}>
                        DSA LEARNING
                    </Typography>
                    <Typography
                        variant="h3"
                        fontWeight="bold"
                        sx={{
                            fontSize: { xs: '1.75rem', sm: '2.5rem', md: '3rem' },
                            wordBreak: 'break-word',
                            overflowWrap: 'break-word',
                            lineHeight: 1.2
                        }}
                    >
                        {content.title}
                    </Typography>
                </Box>
            </Stack>

            {/* What It Is */}
            {content.whatItIs && (
                <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                    <Typography variant="overline" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                        What It Is
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            mt: 1,
                            lineHeight: 2.0,
                            fontSize: { xs: '1rem', sm: '1.15rem' },
                            wordBreak: 'break-word',
                            overflowWrap: 'anywhere'
                        }}
                    >
                        {content.whatItIs}
                    </Typography>
                </Paper>
            )}

            {/* When to Use */}
            {content.whenToUse && content.whenToUse.length > 0 && (
                <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                    <Typography variant="overline" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                        When to Use It
                </Typography>
                <List dense sx={{ mt: 1 }}>
                    {content.whenToUse.map((item, idx) => (
                        <ListItem key={idx} sx={{ py: 0.5, alignItems: 'flex-start' }}>
                            <ListItemIcon sx={{ minWidth: 32, mt: 0.5 }}>
                                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 20, color: 'success.main' }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={item}
                                primaryTypographyProps={{
                                    fontSize: { xs: '1rem', sm: '1.1rem' },
                                    lineHeight: 1.6,
                                    sx: { wordBreak: 'break-word', overflowWrap: 'anywhere' }
                                }}
                            />
                        </ListItem>
                    ))}
                </List>
                </Paper>
            )}

            {/* How It Works + Example */}
            {content.howItWorks && (
            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Typography variant="overline" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                    How It Works
                </Typography>
                <Typography
                    variant="body1"
                    sx={{
                        mt: 1,
                        mb: 3,
                        lineHeight: 2.0,
                        fontSize: { xs: '1rem', sm: '1.15rem' },
                        wordBreak: 'break-word',
                        overflowWrap: 'anywhere'
                    }}
                >
                    {content.howItWorks}
                </Typography>

                <Box sx={{ bgcolor: 'rgba(0,0,0,0.3)', p: 2.5, borderRadius: 1, border: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                    <Typography variant="h6" color="text.secondary" fontWeight="bold" sx={{ mb: 1.5, fontSize: '1.25rem' }}>
                        Example Walkthrough
                    </Typography>
                    <Typography variant="body1" fontFamily="monospace" color="primary.light" sx={{ mb: 2, wordBreak: 'break-word', overflowWrap: 'anywhere', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        Input: {content.exampleWalkthrough?.input}
                    </Typography>
                    {content.exampleWalkthrough?.steps.map((step: string, idx: number) => (
                        <Typography key={idx} variant="body1" sx={{ mb: 1.2, pl: 2, fontSize: { xs: '0.95rem', sm: '1.05rem' }, lineHeight: 1.6, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                            {idx + 1}. {step}
                        </Typography>
                    ))}
                    <Typography variant="body1" fontFamily="monospace" color="success.main" sx={{ mt: 2, wordBreak: 'break-word', fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                        Result: {content.exampleWalkthrough?.result}
                    </Typography>
                </Box>
            </Paper>
            )}

            {/* Code Template */}
            {content.codeTemplate && (
            <Paper sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Typography variant="overline" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' }, mb: 1, display: 'block' }}>
                    Code Template (Java)
                </Typography>
                <Box
                    sx={{
                        position: 'relative',
                        borderRadius: 1,
                        border: 1,
                        borderColor: 'rgba(255,255,255,0.1)',
                        display: 'grid', // Creates a new formatting context that handles overflow better
                        maxWidth: '100%',
                    }}
                >
                    <Box sx={{ overflowX: 'auto', maxWidth: '100%', display: 'block' }}>
                        <Tooltip title={copied ? "Copied" : "Copy Code"} placement="left">
                            <IconButton
                                className="copy-button"
                                onClick={() => handleCopy(content.codeTemplate || '')}
                                sx={{
                                    position: 'absolute',
                                    top: 8,
                                    right: 8,
                                    bgcolor: copied ? 'success.main' : 'rgba(255,255,255,0.05)',
                                    color: 'white',
                                    border: '1px solid',
                                    borderColor: copied ? 'success.main' : 'rgba(255,255,255,0.1)',
                                    '&:hover': {
                                        bgcolor: copied ? 'success.dark' : 'rgba(255,255,255,0.15)',
                                        borderColor: copied ? 'success.dark' : 'rgba(255,255,255,0.4)',
                                        opacity: 1
                                    },
                                    zIndex: 1,
                                    opacity: copied ? 1 : 0.4,
                                    transition: 'all 0.3s ease',
                                    width: 28,
                                    height: 28
                                }}
                            >
                                {copied ? <CheckRoundedIcon sx={{ fontSize: '0.9rem' }} /> : <ContentCopyRoundedIcon sx={{ fontSize: '0.9rem' }} />}
                            </IconButton>
                        </Tooltip>
                        <SyntaxHighlighter
                            language="java"
                            style={vscDarkPlus}
                            customStyle={{
                                margin: 0,
                                padding: '16px',
                                backgroundColor: '#000000',
                                fontSize: '0.9rem',
                                lineHeight: 1.4,
                            }}
                        >
                            {content.codeTemplate}
                        </SyntaxHighlighter>
                    </Box>
                </Box>
            </Paper>
            )}

            {/* Complexity */}
            {(content.timeComplexity || content.spaceComplexity) && (
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                <Paper sx={{ flex: 1, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <TimerRoundedIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '1.15rem' }}>Time Complexity</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        {content.timeComplexity}
                    </Typography>
                </Paper>
                <Paper sx={{ flex: 1, p: 2, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                        <MemoryRoundedIcon sx={{ color: 'primary.main' }} />
                        <Typography variant="subtitle2" color="text.secondary" sx={{ fontSize: '1.15rem' }}>Space Complexity</Typography>
                    </Stack>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                        {content.spaceComplexity}
                    </Typography>
                </Paper>
            </Stack>
            )}

            {/* Practice Problems */}
            <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Typography variant="overline" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                    Practice Problems
                </Typography>
                <Box sx={{ mt: 2 }}>
                    {renderProblems(content.practiceProblems?.easy || [], 'Easy')}
                    {renderProblems(content.practiceProblems?.medium || [], 'Medium')}
                    {renderProblems(content.practiceProblems?.hard || [], 'Hard')}
                </Box>
            </Paper>

            {/* Common Mistakes */}
            {content.commonMistakes && content.commonMistakes.length > 0 && (
            <Paper sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, bgcolor: 'rgba(255,200,100,0.05)', borderRadius: 2, border: 1, borderColor: 'rgba(255,200,100,0.2)' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <WarningAmberRoundedIcon sx={{ color: 'warning.main' }} />
                    <Typography variant="overline" color="warning.main" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                        Common Mistakes to Avoid
                    </Typography>
                </Stack>
                {content.commonMistakes.map((mistake, idx) => (
                    <Typography key={idx} variant="body1" sx={{ mb: 1.5, pl: 3, lineHeight: 1.6, fontSize: { xs: '1rem', sm: '1rem' }, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                        • {mistake}
                    </Typography>
                ))}
            </Paper>
            )}

            {/* Interview Tips */}
            {content.interviewTips && (
            <Paper sx={{ p: { xs: 2.5, sm: 3 }, mb: 3, bgcolor: 'rgba(100,200,255,0.05)', borderRadius: 2, border: 1, borderColor: 'rgba(100,200,255,0.2)' }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <LightbulbRoundedIcon sx={{ color: 'info.main' }} />
                    <Typography variant="overline" color="info.main" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                        Interview Tips
                    </Typography>
                </Stack>

                <Typography variant="subtitle2" sx={{ mt: 2, mb: 0.5, fontSize: '1.15rem' }}>How to Recognize:</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6, fontSize: { xs: '1rem', sm: '1rem' }, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {content.interviewTips.howToRecognize}
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '1.15rem' }}>What to Say:</Typography>
                <Typography variant="body1" color="text.secondary" fontStyle="italic" sx={{ mb: 2, lineHeight: 1.6, fontSize: { xs: '1rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                    {content.interviewTips.whatToSay}
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 0.5, fontSize: '1.15rem' }}>Follow-up Prep:</Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6, fontSize: { xs: '1rem', sm: '1rem' }, wordBreak: 'break-word' }}>
                    {content.interviewTips.followUpPrep}
                </Typography>
            </Paper>
            )}

            {/* Related Patterns */}
            {content.relatedPatterns && content.relatedPatterns.length > 0 && (
            <Paper sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: 'rgba(255,255,255,0.03)', borderRadius: 2 }}>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <LinkRoundedIcon sx={{ color: 'primary.main' }} />
                    <Typography variant="overline" color="primary.main" fontWeight="bold" sx={{ fontSize: { xs: '0.9rem', sm: '1.1rem' } }}>
                        Related Patterns
                    </Typography>
                </Stack>
                {content.relatedPatterns.map((related, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold" sx={{ fontSize: '1.15rem' }}>
                            {related.pattern}
                        </Typography>
                        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {related.description}
                        </Typography>
                        {idx < (content.relatedPatterns?.length || 0) - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                ))}
            </Paper>
            )}
        </Box>
    );
};

export default DSATopicDetailPage;
