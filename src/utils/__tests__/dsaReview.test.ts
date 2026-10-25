import { describe, it, expect } from 'vitest';
import {
    daysBetween,
    dueReviews,
    firstReview,
    gapAfter,
    monthlyCount,
    nextReviewDay,
    rateReview,
    reviewOf,
    reviewStatus,
    reviewedToday,
    solvedWithReviews,
    type ProblemReview,
} from '../dsaReview';

const TODAY = '2026-10-25';

describe('the review ladder', () => {
    it('brings a newly solved problem back tomorrow', () => {
        expect(firstReview(TODAY)).toEqual({ step: 0, due: '2026-10-26', reviews: 0 });
    });

    it('spaces out problems solved on your own: 3, 7, 14, 30, then every 30 days', () => {
        let review = firstReview(TODAY);
        const gaps = [];
        for (let i = 0; i < 6; i++) {
            const next = rateReview(review, 'easy', TODAY);
            gaps.push(daysBetween(TODAY, next.due));
            review = next;
        }
        expect(gaps).toEqual([3, 7, 14, 30, 30, 30]);
        expect(review.reviews).toBe(6);
        expect(review.last).toBe('easy');
        expect(review.reviewedOn).toBe(TODAY);
    });

    it('repeats the same gap for a hard one, and starts again for one forgotten', () => {
        const atSevenDays: ProblemReview = { step: 2, due: TODAY, reviews: 2 };
        expect(rateReview(atSevenDays, 'hard', TODAY)).toMatchObject({ step: 2, due: '2026-11-01' });
        expect(rateReview(atSevenDays, 'forgot', TODAY)).toMatchObject({ step: 0, due: '2026-10-26' });
    });

    it('says what each rating will do before you pick it', () => {
        const atSevenDays: ProblemReview = { step: 2, due: TODAY, reviews: 2 };
        expect(gapAfter(atSevenDays, 'easy')).toBe(14);
        expect(gapAfter(atSevenDays, 'hard')).toBe(7);
        expect(gapAfter(atSevenDays, 'forgot')).toBe(1);
    });

    it('never leaves an undefined field, which Firestore would refuse', () => {
        const values = [firstReview(TODAY), rateReview(firstReview(TODAY), 'hard', TODAY)].flatMap(Object.values);
        expect(values).not.toContain(undefined);
    });
});

describe('problems solved before reviews began', () => {
    it('keeps the date set with the old 3d or 7d buttons', () => {
        expect(reviewOf({}, 'two-sum', '2026-10-28', TODAY)).toEqual({ step: 0, due: '2026-10-28', reviews: 0 });
    });

    it('is due today when it had no date', () => {
        expect(reviewOf({}, 'two-sum', undefined, TODAY).due).toBe(TODAY);
    });

    it('uses the saved review once there is one', () => {
        const saved: ProblemReview = { step: 3, due: '2026-11-08', reviews: 3 };
        expect(reviewOf({ 'two-sum': saved }, 'two-sum', '2026-10-28', TODAY)).toBe(saved);
    });
});

describe('the review list', () => {
    const progress = {
        'arrays-hashing': { completedProblems: ['two-sum', 'contains-duplicate', 'not-a-problem'], practiceSchedule: { 'contains-duplicate': '2026-10-20' } },
        'two-pointers': { completedProblems: ['valid-palindrome', '3sum'] },
    };
    const reviews = {
        '3sum': { step: 4, due: '2026-11-20', reviews: 4, reviewedOn: '2026-10-21' },
        'valid-palindrome': { step: 1, due: '2026-10-24', reviews: 1, reviewedOn: TODAY },
    };
    const items = solvedWithReviews(progress, reviews, TODAY);

    it('lists only solved problems still in the curriculum, in curriculum order', () => {
        expect(items.map(item => item.problemId)).toEqual(['contains-duplicate', 'two-sum', 'valid-palindrome', '3sum']);
    });

    it('puts the longest overdue first and leaves out what is not due', () => {
        expect(dueReviews(items, TODAY).map(item => item.problemId)).toEqual(['contains-duplicate', 'valid-palindrome', 'two-sum']);
    });

    it('counts what was reviewed today, what comes monthly, and what is next', () => {
        expect(reviewedToday(items, TODAY)).toBe(1);
        expect(monthlyCount(items)).toBe(1);
        expect(nextReviewDay(items, TODAY)).toEqual({ date: '2026-11-20', count: 1 });
        expect(nextReviewDay([], TODAY)).toBeNull();
    });

    it('describes when a problem comes back', () => {
        expect(reviewStatus({ step: 0, due: TODAY, reviews: 0 }, TODAY)).toBe('Due for review today');
        expect(reviewStatus({ step: 0, due: '2026-10-20', reviews: 0 }, TODAY)).toBe('Due for review today');
        expect(reviewStatus({ step: 0, due: '2026-10-26', reviews: 0 }, TODAY)).toBe('Next review 26 Oct, tomorrow');
        expect(reviewStatus({ step: 2, due: '2026-11-01', reviews: 2 }, TODAY)).toBe('Next review 1 Nov, in 7 days');
    });
});
