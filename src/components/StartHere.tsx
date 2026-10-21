import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, ButtonBase, Stack, Typography } from '@mui/material';

// The map on the home page: what each part of Atomic Hub is for, the order a
// beginner can take, and where interview practice lives. Folded away once
// read, remembered on this device.

const HIDDEN_KEY = 'start-here-hidden';

const readHidden = () => {
    try {
        return localStorage.getItem(HIDDEN_KEY) === 'yes';
    } catch {
        return false;
    }
};

const STAGES = [
    {
        step: '1',
        title: 'Learn',
        colour: '#4dd0e1',
        text: 'Each topic is a full lesson: an animation, the idea step by step, a worked example, and exercises with hidden answers. Tap any underlined word to see what it means.',
        links: [
            { label: 'ML Foundations', to: '/foundations' },
            { label: 'SQL', to: '/sql' },
            { label: 'System Design', to: '/system-design' },
            { label: 'NeetCode 150', to: '/dsa' },
        ],
    },
    {
        step: '2',
        title: 'Practise for interviews',
        colour: '#ce93d8',
        text: 'Every study page has an Interview questions mode: say your answer out loud, then compare. The Interview Hub holds your own stories and the behavioural questions.',
        links: [
            { label: 'ML & RAG questions', to: '/foundations?mode=interview' },
            { label: 'System design scenarios', to: '/system-design?mode=interview' },
            { label: 'SQL questions', to: '/sql?mode=interview' },
            { label: 'Coding questions', to: '/dsa/interview' },
            { label: 'Interview Hub', to: '/interview-prep' },
        ],
    },
    {
        step: '3',
        title: 'Prove it',
        colour: '#66bb6a',
        text: 'The next day, with notes closed, tick each of a topic\'s four checks only if you can do it from memory. Re-test old topics every two weeks and untick what you fail. Use Revise mode the night before an interview.',
        links: [],
    },
    {
        step: '4',
        title: 'Keep the receipts',
        colour: '#ffb74d',
        text: 'One line a night in the Evidence Log about what the day really contained. On a bad day, read it back.',
        links: [{ label: 'Evidence Log', to: '/evidence' }],
    },
];

const ORDER = [
    'ML Phase 0 (the toolkit) and SQL Phases 0–3, side by side.',
    'ML Phases 1–2 (the maths, then classical ML), with System Design Phases 0–2 and NeetCode arrays, hashing and two pointers.',
    'ML Phases 3–5 (deep learning, transformers, AI engineering), with System Design Phases 3–4 and 9, and more NeetCode.',
    'ML Phases 6–7 (systems at scale, generative models and RL) when the rest feels solid.',
    'From the first week: one interview question a day, out loud.',
];

const CHECKS = [
    { page: 'ML Foundations', checks: 'Explain · Derive · Build · Break' },
    { page: 'System Design', checks: 'Explain · Draw · Apply · Trade-offs' },
    { page: 'SQL', checks: 'Explain · Write · Predict · Edge cases' },
];

/** What each part of the app is for, and the order to use it in. */
const StartHere = () => {
    const navigate = useNavigate();
    const [hidden, setHidden] = useState(readHidden);
    const toggle = () => {
        const next = !hidden;
        setHidden(next);
        try {
            localStorage.setItem(HIDDEN_KEY, next ? 'yes' : 'no');
        } catch {
            // Not remembered, but the toggle still works for this visit.
        }
    };

    return (
        <Box sx={{ width: '100%', maxWidth: 900, mx: 'auto', mt: { xs: 6, md: 10 }, p: { xs: 2, sm: 3 }, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
                <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight="bold" sx={{ letterSpacing: 1.5, display: 'block' }}>
                        START HERE
                    </Typography>
                    <Typography variant="h6" fontWeight="bold" color="text.primary">
                        From beginner to interview-ready, in one place
                    </Typography>
                </Box>
                <Button onClick={toggle} aria-expanded={!hidden} sx={{ minHeight: 44, textTransform: 'none', fontWeight: 700, flexShrink: 0 }}>
                    {hidden ? 'Show the map' : 'Hide'}
                </Button>
            </Stack>

            {!hidden && (
                <>
                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5, mt: 2.5 }}>
                        {STAGES.map(stage => (
                            <Box key={stage.step} sx={{ p: 2, borderRadius: 2, bgcolor: `${stage.colour}0f`, borderLeft: '3px solid', borderColor: stage.colour }}>
                                <Typography fontWeight={800} sx={{ color: stage.colour }}>
                                    {stage.step}. {stage.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                    {stage.text}
                                </Typography>
                                {stage.links.length > 0 && (
                                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.25 }}>
                                        {stage.links.map(link => (
                                            <ButtonBase
                                                key={link.to}
                                                onClick={() => navigate(link.to)}
                                                sx={{ minHeight: 36, px: 1.25, borderRadius: 1.5, fontSize: '0.85rem', fontWeight: 700, color: 'text.primary', bgcolor: 'rgba(255,255,255,0.06)', '&:hover': { bgcolor: 'rgba(255,255,255,0.12)' } }}
                                            >
                                                {link.label}
                                            </ButtonBase>
                                        ))}
                                    </Stack>
                                )}
                            </Box>
                        ))}
                    </Box>

                    <Typography fontWeight={800} color="text.primary" sx={{ mt: 3, mb: 1 }}>
                        A good order if you are starting out
                    </Typography>
                    <Stack component="ol" spacing={0.75} sx={{ pl: 2.5, m: 0 }}>
                        {ORDER.map(item => (
                            <Typography key={item} component="li" variant="body2" color="text.secondary">
                                {item}
                            </Typography>
                        ))}
                    </Stack>

                    <Typography fontWeight={800} color="text.primary" sx={{ mt: 3, mb: 1 }}>
                        The four checks have different names on each page
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Same idea everywhere: a topic counts as confident only when all four are ticked from memory.
                    </Typography>
                    <Stack spacing={0.5}>
                        {CHECKS.map(row => (
                            <Typography key={row.page} variant="body2">
                                <Box component="span" sx={{ fontWeight: 800, color: 'text.primary' }}>{row.page}: </Box>
                                <Box component="span" sx={{ color: 'text.secondary' }}>{row.checks}</Box>
                            </Typography>
                        ))}
                    </Stack>
                </>
            )}
        </Box>
    );
};

export default StartHere;
