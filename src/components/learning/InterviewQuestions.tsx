import { useMemo, useState } from 'react';
import { Box, Button, Chip, Stack, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import {
    INTERVIEW_LEVELS,
    INTERVIEW_LEVEL_LABELS,
    type InterviewLevel,
    type InterviewQuestion,
    type InterviewSet,
} from '../../data/interviewPrep/types';
import { TAP, px, useTextSize } from './learning';
import { Block, Bullets, FollowUps, NumberedSteps, QuoteBox, SectionLabel, Tag } from './LearningParts';
import { ProseText } from './GlossaryText';
import { MermaidDiagram } from './MermaidDiagram';
import { segmentSections, type PageGlossary, type Prose } from './glossaryContext';

// The Interview mode of a study page: questions an interviewer asks across
// the lessons, each answer hidden until you have said yours out loud.

/** Bullet colour for traps, as for common mistakes on the lessons. */
const WARNING = '#ffa726';
const SCENARIO = '#ce93d8';

type Filter = 'all' | InterviewLevel | 'scenario';
type Part = 'answer' | 'analogy' | 'steps' | 'strong' | 'traps' | 'followUps';

const matchesFilter = (question: InterviewQuestion, filter: Filter) =>
    filter === 'all' || (filter === 'scenario' ? question.kind === 'scenario' : question.level === filter);

/** The answer, opened. Its words are only marked once someone asks to see it. */
const InterviewAnswer = ({
    question,
    glossary,
    accent,
    topicName,
    openTopic,
}: {
    question: InterviewQuestion;
    glossary?: PageGlossary;
    accent: string;
    topicName: (topicId: string) => string | undefined;
    openTopic: (topicId: string) => void;
}) => {
    const t = useTextSize();
    const steps = question.steps ?? [];
    const marked = useMemo(() => {
        const sections: [Part, string[]][] = [
            ['answer', [question.answer]],
            ['analogy', [question.analogy]],
            ['steps', question.steps ?? []],
            ['strong', question.strong],
            ['traps', question.traps],
            ['followUps', question.followUps.flatMap(item => [item.q, item.a])],
        ];
        if (glossary) return segmentSections(glossary, sections);
        // A page with no glossary (DSA): plain text, nothing underlined.
        const plain = new Map(sections);
        return (part: Part): Prose[] => plain.get(part) ?? [];
    }, [glossary, question]);
    const lessons = question.topicIds.flatMap(id => {
        const name = topicName(id);
        return name ? [{ id, name }] : [];
    });

    return (
        <Stack spacing={2.5} sx={{ mt: 1.5 }}>
            <Typography color="text.secondary" sx={{ fontSize: px(t.small) }}>
                <Box component="span" sx={{ color: accent, fontWeight: 800 }}>They are checking: </Box>
                {question.testing}
            </Typography>
            <Block title="Say this">
                <QuoteBox accent={accent}>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                        <ProseText value={marked('answer')[0]} />
                    </Typography>
                </QuoteBox>
            </Block>
            <Block title="In simple words">
                <Typography variant="body1"><ProseText value={marked('analogy')[0]} /></Typography>
            </Block>
            {question.diagram && (
                <Block title="Picture it">
                    <MermaidDiagram code={question.diagram.code} caption={question.diagram.caption} title={question.q} />
                </Block>
            )}
            {steps.length > 0 && (
                <Block title={question.kind === 'scenario' ? 'Work through it in this order' : 'The answer, part by part'}>
                    <NumberedSteps items={marked('steps')} accent={accent} />
                </Block>
            )}
            <Block title="What makes it a strong answer">
                <Bullets items={marked('strong')} marker={accent} />
            </Block>
            <Block title="Traps to avoid">
                <Bullets items={marked('traps')} marker={WARNING} />
            </Block>
            {question.followUps.length > 0 && (
                <Block title="Follow-up questions">
                    <Typography color="text.secondary" sx={{ mb: 1.25, fontSize: px(t.small) }}>
                        The interviewer's next question. Answer it first, then tap.
                    </Typography>
                    <FollowUps topic={{ id: question.id, followUps: question.followUps }} accent={accent} marked={() => marked('followUps')} />
                </Block>
            )}
            {lessons.length > 0 && (
                <Box>
                    <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
                        Couldn't explain part of it? Learn it here
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {lessons.map(lesson => (
                            <Chip
                                key={lesson.id}
                                label={lesson.name}
                                onClick={() => openTopic(lesson.id)}
                                sx={{
                                    height: 'auto',
                                    minHeight: TAP,
                                    fontSize: px(t.small),
                                    fontWeight: 600,
                                    '& .MuiChip-label': { whiteSpace: 'normal', py: 0.75 },
                                    bgcolor: `${accent}1f`,
                                    border: '1px solid',
                                    borderColor: `${accent}55`,
                                }}
                            />
                        ))}
                    </Stack>
                </Box>
            )}
        </Stack>
    );
};

const InterviewCard = ({
    question,
    number,
    ...answerProps
}: {
    question: InterviewQuestion;
    number: number;
    glossary?: PageGlossary;
    accent: string;
    topicName: (topicId: string) => string | undefined;
    openTopic: (topicId: string) => void;
}) => {
    const [open, setOpen] = useState(false);
    const { accent } = answerProps;
    const answerId = `interview-${question.id}`;
    return (
        <Box
            id={`question-${question.id}`}
            sx={{
                p: { xs: 1.75, sm: 2.25 },
                borderRadius: 2,
                bgcolor: open ? `${accent}0d` : 'rgba(255,255,255,0.02)',
                border: '1px solid',
                borderColor: open ? `${accent}55` : 'rgba(255,255,255,0.08)',
                scrollMarginTop: 16,
            }}
        >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
                <Typography sx={{ color: accent, fontWeight: 800, minWidth: 24, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                    {number}
                </Typography>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={0.75} sx={{ mb: 0.75 }} flexWrap="wrap" useFlexGap>
                        <Tag label={INTERVIEW_LEVEL_LABELS[question.level]} />
                        {question.kind === 'scenario' && <Tag label="Scenario" color={SCENARIO} bgcolor={`${SCENARIO}1f`} />}
                    </Stack>
                    <Typography variant="body1" sx={{ fontWeight: 700, color: 'text.primary', whiteSpace: 'pre-line' }}>
                        {question.q}
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => setOpen(current => !current)}
                        aria-expanded={open}
                        aria-controls={answerId}
                        sx={{ minHeight: TAP, mt: 0.5, ml: -1, px: 1, textTransform: 'none', fontWeight: 700, color: accent }}
                    >
                        {open ? 'Hide answer' : 'Show answer'}
                    </Button>
                    {open && (
                        <Box id={answerId}>
                            <InterviewAnswer question={question} {...answerProps} />
                        </Box>
                    )}
                </Box>
            </Stack>
        </Box>
    );
};

/**
 * Every set of questions for one study page, with a filter by level. Each
 * answer links back to the lessons it is built on.
 */
export const InterviewQuestionsView = ({
    sets,
    glossary,
    accent,
    topicName,
    openTopic,
}: {
    sets: InterviewSet[];
    /** The page's tap-to-explain words. Pages without a glossary leave it out. */
    glossary?: PageGlossary;
    accent: string;
    /** A lesson's name, or undefined if this page has no such lesson. */
    topicName: (topicId: string) => string | undefined;
    /** Leave Interview mode and open the lesson. */
    openTopic: (topicId: string) => void;
}) => {
    const t = useTextSize();
    const [filter, setFilter] = useState<Filter>('all');
    const total = sets.reduce((sum, set) => sum + set.questions.length, 0);
    const shown = sets.reduce((sum, set) => sum + set.questions.filter(q => matchesFilter(q, filter)).length, 0);

    return (
        <Box sx={{ pb: 6, maxWidth: 820 }}>
            <Typography variant="h4" fontWeight="bold" color="text.primary" sx={{ mb: 1 }}>
                Interview questions
            </Typography>
            <Typography variant="body1" color="text.secondary">
                The questions interviewers ask across these lessons, including the "it broke, what do you do?" kind. {total} questions, beginner to advanced.
            </Typography>
            <Box sx={{ mt: 2.5, p: 2, borderRadius: 2, bgcolor: `${accent}14`, borderLeft: '3px solid', borderColor: accent }}>
                <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.75 }}>
                    How to practise
                </Typography>
                <NumberedSteps
                    variant="body2"
                    accent={accent}
                    items={[
                        'Read the question and say your answer out loud, as if the interviewer were listening. Aim for 30 to 60 seconds.',
                        'Tap Show answer and compare. Look for the ideas you missed, not for the same words.',
                        'Answer the follow-up questions before you open them: real interviews keep digging.',
                        'If you couldn\'t explain part of it, tap the lesson under the answer and learn that part. Then come back and say it again.',
                    ]}
                />
            </Box>

            <ToggleButtonGroup
                exclusive
                size="small"
                value={filter}
                onChange={(_, value: Filter | null) => value && setFilter(value)}
                aria-label="Show questions by level"
                sx={{ mt: 3, flexWrap: 'wrap' }}
            >
                {(['all', ...INTERVIEW_LEVELS, 'scenario'] as Filter[]).map(value => (
                    <ToggleButton
                        key={value}
                        value={value}
                        sx={{ minHeight: TAP, px: 1.5, textTransform: 'none', fontWeight: 700, fontSize: px(t.small), '&:focus': { outline: 'none' } }}
                    >
                        {value === 'all' ? 'All' : value === 'scenario' ? 'Scenarios' : INTERVIEW_LEVEL_LABELS[value]}
                    </ToggleButton>
                ))}
            </ToggleButtonGroup>
            {filter !== 'all' && (
                <Typography color="text.secondary" sx={{ mt: 1, fontSize: px(t.small) }}>
                    Showing {shown} of {total}.
                </Typography>
            )}

            {sets.map(set => {
                const questions = set.questions.filter(q => matchesFilter(q, filter));
                if (questions.length === 0) return null;
                return (
                    <Box key={set.id}>
                        <SectionLabel color={accent}>{set.title.toUpperCase()}</SectionLabel>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: -0.75, mb: 1.75 }}>
                            {set.blurb}
                        </Typography>
                        <Stack spacing={1.25}>
                            {questions.map(question => (
                                <InterviewCard
                                    key={question.id}
                                    question={question}
                                    number={set.questions.indexOf(question) + 1}
                                    glossary={glossary}
                                    accent={accent}
                                    topicName={topicName}
                                    openTopic={openTopic}
                                />
                            ))}
                        </Stack>
                    </Box>
                );
            })}
        </Box>
    );
};
