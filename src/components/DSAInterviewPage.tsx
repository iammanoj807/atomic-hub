import { useNavigate } from 'react-router-dom';
import { Box, Button, Stack } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { dsaCurriculum } from '../data/dsaCurriculum';
import { dsaInterviewSet } from '../data/interviewPrep/dsa';
import { CYAN, TAP, useTextSizeChoice } from './learning/learning';
import { LearningPageFrame, TextSizeControl } from './learning/LearningParts';
import { InterviewQuestionsView } from './learning/InterviewQuestions';

const topicNames = new Map(
    dsaCurriculum.flatMap(phase => phase.sections.flatMap(section => section.topics.map(topic => [topic.id, topic.title] as const)))
);

/** The coding-interview questions, with links back to each NeetCode topic. */
const DSAInterviewPage = () => {
    const navigate = useNavigate();
    const { textSize, t, theme, changeTextSize } = useTextSizeChoice();

    return (
        <LearningPageFrame t={t} theme={theme}>
            <Box sx={{ width: '100%', maxWidth: 940, mx: 'auto', minWidth: 0 }}>
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
                <InterviewQuestionsView
                    sets={[dsaInterviewSet]}
                    accent={CYAN}
                    topicName={id => topicNames.get(id)}
                    openTopic={id => navigate(`/dsa/${id}`)}
                />
            </Box>
        </LearningPageFrame>
    );
};

export default DSAInterviewPage;
