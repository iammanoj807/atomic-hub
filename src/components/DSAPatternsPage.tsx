import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { dsaCurriculum } from '../data/dsaCurriculum';
import { getPatternGuide } from '../data/dsaPatterns';
import { patternFinders, recognitionQuestions } from '../data/dsaRecognition';
import { CYAN, TAP, px, useTextSizeChoice } from './learning/learning';
import { LearningPageFrame, TextSizeControl, SectionLabel } from './learning/LearningParts';
import { MermaidDiagram } from './learning/MermaidDiagram';

const GUT_CHECK = '#ffca28';

const topics = dsaCurriculum.flatMap(phase => phase.sections.flatMap(section => section.topics));

/**
 * "Which pattern?" — a revision sheet for the night before an interview:
 * the three questions, the two decision diagrams, and one compact card per topic.
 */
const DSAPatternsPage = () => {
    const navigate = useNavigate();
    const { textSize, t, theme, changeTextSize } = useTextSizeChoice();

    return (
        <LearningPageFrame t={t} theme={theme}>
            <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto', minWidth: 0, pb: 6 }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                    sx={{ pb: 2.5, mb: 3, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }}
                >
                    <Button
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => navigate('/dsa')}
                        sx={{ minHeight: TAP, px: 1.5, ml: -1, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                    >
                        DSA hub
                    </Button>
                    <TextSizeControl value={textSize} onChange={changeTextSize} />
                </Stack>

                <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.5, display: 'block', mb: 0.5 }}>
                    NEETCODE 150 · CHEAT SHEET
                </Typography>
                <Typography variant="h2" fontWeight="bold" sx={{ color: 'text.primary', mb: 1, fontSize: { xs: `${2 * t.heading}rem`, sm: `${3 * t.heading}rem` } }}>
                    Which pattern?
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Ask three questions, follow the two diagrams, then confirm with the topic's gut check.
                </Typography>

                {/* ---- THREE QUESTIONS ---- */}
                <SectionLabel color={CYAN}>ASK THESE FIRST</SectionLabel>
                <Stack component="ol" spacing={1.25} sx={{ listStyle: 'none', p: 0, m: 0, maxWidth: 760 }}>
                    {recognitionQuestions.map((question, index) => (
                        <Stack key={question} component="li" direction="row" spacing={1.5} alignItems="flex-start">
                            <Typography sx={{ color: CYAN, fontWeight: 800, minWidth: 22, flexShrink: 0 }}>{index + 1}</Typography>
                            <Typography variant="body1" sx={{ color: 'text.primary', minWidth: 0 }}>{question}</Typography>
                        </Stack>
                    ))}
                </Stack>

                {/* ---- DECISION DIAGRAMS ---- */}
                {patternFinders.map(finder => (
                    <Box key={finder.title} sx={{ maxWidth: 760 }}>
                        <SectionLabel color={CYAN}>{finder.title.toUpperCase()}</SectionLabel>
                        <MermaidDiagram code={finder.code} caption={finder.caption} title={finder.title} />
                    </Box>
                ))}

                {/* ---- ONE CARD PER TOPIC ---- */}
                <SectionLabel color={CYAN}>EVERY PATTERN AT A GLANCE</SectionLabel>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 1.5 }}>
                    {topics.map(topic => {
                        const guide = getPatternGuide(topic.id);
                        if (!guide) return null;
                        return (
                            <Box
                                key={topic.id}
                                component="article"
                                sx={{ p: 2, borderRadius: 2, minWidth: 0, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderLeft: '3px solid', borderLeftColor: CYAN }}
                            >
                                <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.3 }}>
                                    {topic.title}
                                </Typography>
                                <Typography variant="body1" sx={{ color: CYAN, fontWeight: 700, mt: 0.5, mb: 1.25 }}>
                                    {guide.hook}
                                </Typography>
                                <Stack component="ul" spacing={0.5} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                                    {guide.signals.map(signal => (
                                        <Typography key={signal} component="li" variant="body2" color="text.secondary" sx={{ pl: 1.5, position: 'relative', '&::before': { content: '"·"', position: 'absolute', left: 0, color: CYAN, fontWeight: 800 } }}>
                                            {signal}
                                        </Typography>
                                    ))}
                                </Stack>
                                <Box sx={{ mt: 1.25, p: 1.25, borderRadius: 1.5, bgcolor: `${GUT_CHECK}12` }}>
                                    <Typography sx={{ color: GUT_CHECK, fontWeight: 800, letterSpacing: 1, fontSize: px(t.label) }}>
                                        GUT CHECK
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600 }}>
                                        {guide.gutCheck}
                                    </Typography>
                                </Box>
                                <Button
                                    onClick={() => navigate(`/dsa/${topic.id}`)}
                                    sx={{ minHeight: TAP, mt: 0.5, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: CYAN }}
                                >
                                    Learn it →
                                </Button>
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </LearningPageFrame>
    );
};

export default DSAPatternsPage;
