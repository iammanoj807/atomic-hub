import { format } from 'date-fns';
import { dsaCurriculum } from '../data/dsaCurriculum';
import { BOX_INTERVAL_DAYS, addDays } from './patternDrill';

// Solving problems again on a schedule, so they are still there in a month.
// A problem joins the reviews when it is first ticked solved and comes back
// the next day. Solved again on your own, the gap grows: 1, 3, 7, 14, then
// 30 days, and every 30 days after that. A hard one comes back after the same
// gap again; one you couldn't do starts again tomorrow.

/** Days between reviews: the same ladder as the pattern drill. */
const REVIEW_GAPS = BOX_INTERVAL_DAYS;
const LAST_STEP = REVIEW_GAPS.length - 1;

/** Re-solving a problem takes 15 to 40 minutes, so a day's list stops here; the rest wait their turn. */
export const DAILY_REVIEWS = 3;

export type ReviewRating = 'easy' | 'hard' | 'forgot';

export interface ProblemReview {
    /** The rung on the ladder: the gap after it is REVIEW_GAPS[step]. 0 for a new or forgotten problem. */
    step: number;
    /** Next review, YYYY-MM-DD. */
    due: string;
    /** Reviews done so far. */
    reviews: number;
    last?: ReviewRating;
    /** The day of the last review, YYYY-MM-DD. */
    reviewedOn?: string;
}

/** Saved reviews: problem id -> review. Problems never solved have none; an unticked one keeps its own. */
export type ProblemReviews = Record<string, ProblemReview>;

/** A problem solved for the first time: back tomorrow. */
export const firstReview = (today: string): ProblemReview => ({ step: 0, due: addDays(today, REVIEW_GAPS[0]), reviews: 0 });

/** The rung a rating moves to: up one when easy, the same when hard, the bottom when forgotten. */
const nextStep = (step: number, rating: ReviewRating) =>
    rating === 'easy' ? Math.min(step + 1, LAST_STEP) : rating === 'hard' ? step : 0;

/** Days until the next review after this rating. */
export const gapAfter = (review: ProblemReview, rating: ReviewRating) => REVIEW_GAPS[nextStep(review.step, rating)];

/** Record a review and return the new one (the old one is not changed). */
export const rateReview = (review: ProblemReview, rating: ReviewRating, today: string): ProblemReview => {
    const step = nextStep(review.step, rating);
    return { step, due: addDays(today, REVIEW_GAPS[step]), reviews: review.reviews + 1, last: rating, reviewedOn: today };
};

/**
 * A solved problem's review. One solved before reviews began has none saved:
 * it is due on the date its old practice reminder (3d, 7d) was set for, or today.
 */
export const reviewOf = (reviews: ProblemReviews, problemId: string, practiceDate: string | undefined, today: string): ProblemReview =>
    reviews[problemId] ?? { step: 0, due: practiceDate ?? today, reviews: 0 };

/** Solved problems and old practice dates per topic, as saved in dsa_progress. */
export type DSAProgressByTopic = Record<string, { completedProblems?: string[]; practiceSchedule?: Record<string, string> } | undefined>;

export interface ReviewItem {
    problemId: string;
    topicId: string;
    review: ProblemReview;
}

const curriculumProblems = dsaCurriculum.flatMap(phase =>
    phase.sections.flatMap(section => section.topics.flatMap(topic => topic.problems.map(problem => ({ problemId: problem.id, topicId: topic.id }))))
);

/** Every solved problem still in the curriculum, with its review, in curriculum order. */
export const solvedWithReviews = (progress: DSAProgressByTopic, reviews: ProblemReviews, today: string): ReviewItem[] =>
    curriculumProblems
        .filter(({ problemId, topicId }) => progress[topicId]?.completedProblems?.includes(problemId))
        .map(({ problemId, topicId }) => ({
            problemId,
            topicId,
            review: reviewOf(reviews, problemId, progress[topicId]?.practiceSchedule?.[problemId], today),
        }));

/** Problems due by today: longest overdue first, then the lowest rung, then curriculum order. */
export const dueReviews = (items: ReviewItem[], today: string): ReviewItem[] =>
    items
        .filter(item => item.review.due <= today)
        .sort((a, b) => a.review.due.localeCompare(b.review.due) || a.review.step - b.review.step);

/** How many problems were reviewed today, which counts towards the day's list. */
export const reviewedToday = (items: ReviewItem[], today: string) => items.filter(item => item.review.reviewedOn === today).length;

/** The next day anything is due after today, and how many problems are due then. */
export const nextReviewDay = (items: ReviewItem[], today: string): { date: string; count: number } | null => {
    const upcoming = items.map(item => item.review.due).filter(due => due > today).sort();
    if (upcoming.length === 0) return null;
    return { date: upcoming[0], count: upcoming.filter(due => due === upcoming[0]).length };
};

/** Problems at the top of the ladder, coming back once a month. */
export const monthlyCount = (items: ReviewItem[]) => items.filter(item => item.review.step === LAST_STEP).length;

/** Whole days from one YYYY-MM-DD date to another; negative when it has passed. */
export const daysBetween = (from: string, to: string) => Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);

/** "3 Nov" */
export const shortDate = (date: string) => format(new Date(`${date}T00:00:00`), 'd MMM');

export const inDays = (days: number) => (days === 1 ? 'tomorrow' : `in ${days} days`);

/** "Due for review today", or "Next review 3 Nov, in 7 days". */
export const reviewStatus = (review: ProblemReview, today: string) => {
    const days = daysBetween(today, review.due);
    return days <= 0 ? 'Due for review today' : `Next review ${shortDate(review.due)}, ${inDays(days)}`;
};
