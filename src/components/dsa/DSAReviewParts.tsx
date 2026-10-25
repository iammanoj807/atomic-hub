import { useState } from 'react';
import { Box, Button, Link, Stack, Typography } from '@mui/material';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { dsaProblemCards } from '../../data/dsaProblemCards';
import type { DSATopicProgress } from '../../services/firebaseService';
import { saveRating, useDSAReviews } from '../../hooks/useDSAReviews';
import { getDrillProblem } from '../../utils/patternDrill';
import {
    DAILY_REVIEWS,
    dueReviews,
    gapAfter,
    inDays,
    monthlyCount,
    nextReviewDay,
    reviewedToday,
    shortDate,
    solvedWithReviews,
    type ProblemReview,
    type ReviewItem,
    type ReviewRating,
} from '../../utils/dsaReview';
import { CONFIDENT, CYAN, TAP } from '../learning/learning';

// A NeetCode problem as a question and answer, and the reviews that bring
// solved problems back: shared by the DSA hub (Review today) and each topic's
// lesson (Step 5).

const HARD = '#ffa726';
const FORGOT = '#ef9a9a';

/** The answer to a problem, behind a tap: the technique, the clue in the question, and the trick. */
export const ProblemAnswer = ({ problemId }: { problemId: string }) => {
    const [open, setOpen] = useState(false);
    const card = dsaProblemCards[problemId];
    if (!card) return null;
    const id = `answer-${problemId}`;
    return (
        <Box>
            <Button
                size="small"
                onClick={() => setOpen(value => !value)}
                aria-expanded={open}
                aria-controls={id}
                sx={{ minHeight: TAP, px: 1, ml: -1, textTransform: 'none', fontWeight: 700, color: CYAN }}
            >
                {open ? 'Hide answer' : 'Show answer'}
            </Button>
            {open && (
                <Box id={id} sx={{ mt: 0.5, p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <Stack spacing={0.75}>
                        {[
                            { label: 'TECHNIQUE', text: card.technique },
                            { label: 'THE CLUE', text: card.clue },
                            { label: 'THE TRICK', text: card.trick },
                        ].map(line => (
                            <Box key={line.label}>
                                <Typography variant="caption" sx={{ display: 'block', color: CYAN, fontWeight: 800, letterSpacing: 1 }}>
                                    {line.label}
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                    {line.text}
                                </Typography>
                            </Box>
                        ))}
                    </Stack>
                </Box>
            )}
        </Box>
    );
};

const RATINGS: { rating: ReviewRating; label: string; meaning: string; colour: string }[] = [
    { rating: 'easy', label: 'Solved it', meaning: 'Solved it on my own', colour: CONFIDENT },
    { rating: 'hard', label: 'Struggled', meaning: 'Solved, but it was hard', colour: HARD },
    { rating: 'forgot', label: "Couldn't", meaning: "Couldn't solve it", colour: FORGOT },
];

/** How a review went: three buttons side by side, each saying when the problem will come back. */
export const RateReview = ({ review, onRate, disabled = false }: { review: ProblemReview; onRate: (rating: ReviewRating) => void; disabled?: boolean }) => (
    <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 800, letterSpacing: 1, mb: 0.5 }}>
            HOW DID IT GO?
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 1, maxWidth: 480 }}>
            {RATINGS.map(({ rating, label, meaning, colour }) => {
                const when = inDays(gapAfter(review, rating));
                return (
                    <Button
                        key={rating}
                        variant="outlined"
                        disabled={disabled}
                        onClick={() => onRate(rating)}
                        aria-label={`${meaning}: back ${when}`}
                        title={meaning}
                        sx={{
                            minHeight: TAP,
                            px: 1,
                            py: 0.5,
                            flexDirection: 'column',
                            textTransform: 'none',
                            lineHeight: 1.3,
                            color: colour,
                            borderColor: `${colour}66`,
                            '&:hover': { borderColor: colour, bgcolor: `${colour}14` },
                        }}
                    >
                        <Box component="span" sx={{ fontWeight: 800 }}>{label}</Box>
                        <Box component="span" sx={{ fontSize: '0.8em', color: 'text.secondary' }}>{when}</Box>
                    </Button>
                );
            })}
        </Box>
    </Box>
);

/** One problem due today: the question, the answer behind a tap, and how it went. */
const ReviewCard = ({ item, today, canRate, onOpenTopic }: { item: ReviewItem; today: string; canRate: boolean; onOpenTopic: (topicId: string) => void }) => {
    const problem = getDrillProblem(item.problemId);
    const card = dsaProblemCards[item.problemId];
    if (!problem) return null;
    const overdue = item.review.due < today;
    return (
        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2, bgcolor: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Stack direction="row" spacing={1} useFlexGap alignItems="flex-start">
                <Typography variant="caption" color="text.secondary" sx={{ flex: 1, minWidth: 0, pt: 0.25, fontWeight: 700, letterSpacing: 0.5 }}>
                    {problem.topicTitle.toUpperCase()} · {item.review.reviews === 0 ? 'FIRST REVIEW' : `REVIEW ${item.review.reviews + 1}`}
                    {overdue && ` · DUE ${shortDate(item.review.due).toUpperCase()}`}
                </Typography>
                {/* Pulled into the card's padding, so the tap target stays full size without making the row taller. */}
                <Button
                    size="small"
                    onClick={() => onOpenTopic(problem.topicId)}
                    sx={{ minHeight: TAP, px: 1, my: -1.25, mr: -1, flexShrink: 0, textTransform: 'none', fontWeight: 700, color: 'text.secondary' }}
                >
                    Open the lesson
                </Button>
            </Stack>
            <Link
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ color: 'text.primary', fontWeight: 800, fontSize: '1.1rem', textDecorationColor: 'rgba(255,255,255,0.3)', overflowWrap: 'anywhere' }}
            >
                {problem.title}
                <OpenInNewRoundedIcon sx={{ fontSize: '0.85em', ml: 0.5, opacity: 0.5, verticalAlign: 'middle' }} />
            </Link>
            {card && (
                <Typography variant="body1" sx={{ mt: 0.5, color: 'text.primary' }}>
                    {card.summary}
                </Typography>
            )}
            <Box sx={{ mt: 0.5 }}>
                <ProblemAnswer problemId={item.problemId} />
            </Box>
            <Box sx={{ mt: 1 }}>
                <RateReview review={item.review} onRate={rating => saveRating(item.problemId, item.review, rating, today)} disabled={!canRate} />
            </Box>
        </Box>
    );
};

/**
 * Today's reviews on the DSA hub: solved problems that are due, a few a day,
 * mixed across topics as an interview mixes them.
 */
export const ReviewToday = ({
    progress,
    progressLoaded,
    today,
    canRate,
    onOpenTopic,
}: {
    progress: Record<string, DSATopicProgress>;
    progressLoaded: boolean;
    today: string;
    canRate: boolean;
    onOpenTopic: (topicId: string) => void;
}) => {
    const { reviews, loaded } = useDSAReviews();
    const [showAll, setShowAll] = useState(false);
    if (!progressLoaded || !loaded) return null;

    const items = solvedWithReviews(progress, reviews, today);
    const due = dueReviews(items, today);
    const done = reviewedToday(items, today);
    const shown = showAll ? due : due.slice(0, Math.max(0, DAILY_REVIEWS - done));
    const waiting = due.length - shown.length;
    const next = nextReviewDay(items, today);
    const monthly = monthlyCount(items);

    let message: string;
    if (items.length === 0) {
        message = "Tick a problem solved in its topic's lesson and it comes back here tomorrow, then after 3, 7, 14 and 30 days, then every month, so it's still there when you need it.";
    } else if (shown.length > 0) {
        message = "Solve each one again from a blank editor, without your old code. Stuck for 20 minutes? Show the answer, then pick Couldn't.";
    } else if (due.length > 0) {
        message = `Done for today: ${done} solved again.`;
    } else {
        message = `Nothing to review today${done > 0 ? `: ${done} solved again` : ''}.${next ? ` Next: ${shortDate(next.date)}, ${next.count} ${next.count === 1 ? 'problem' : 'problems'}.` : ''}`;
    }

    return (
        <Box component="section" aria-label="Review today" sx={{ p: { xs: 1.5, sm: 2.5 }, mb: 3, borderRadius: 3, bgcolor: `${CONFIDENT}0d`, border: '1px solid', borderColor: `${CONFIDENT}55` }}>
            <Typography variant="caption" sx={{ display: 'block', color: CONFIDENT, fontWeight: 800, letterSpacing: 1.2 }}>
                REVIEW TODAY
            </Typography>
            <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.3 }}>
                {shown.length > 0 ? `Solve ${shown.length === 1 ? 'this' : `these ${shown.length}`} again` : 'Solve problems again, further apart each time'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {message}
                {items.length > 0 && ` ${items.length} solved ${items.length === 1 ? 'problem' : 'problems'} in review, ${monthly} at the monthly stage.`}
            </Typography>
            {shown.length > 0 && (
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                    {shown.map(item => (
                        <ReviewCard key={item.problemId} item={item} today={today} canRate={canRate} onOpenTopic={onOpenTopic} />
                    ))}
                </Stack>
            )}
            {waiting > 0 && (
                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                    <Typography variant="body2" color="text.secondary">
                        {waiting} more waiting. They keep until another day.
                    </Typography>
                    <Button size="small" onClick={() => setShowAll(true)} sx={{ minHeight: TAP, px: 1, textTransform: 'none', fontWeight: 700, color: CONFIDENT }}>
                        Do more now
                    </Button>
                </Stack>
            )}
        </Box>
    );
};
