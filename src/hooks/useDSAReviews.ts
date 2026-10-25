import { useEffect, useState } from 'react';
import { saveDSAReview, subscribeToDSAReviews } from '../services/firebaseService';
import { rateReview, type ProblemReview, type ProblemReviews, type ReviewRating } from '../utils/dsaReview';

/**
 * When each solved problem comes back to be solved again, live from Firestore.
 * `loaded` stays false until the first snapshot arrives: rating a review before
 * that would treat a well-known problem as new and send it back to the start.
 */
export const useDSAReviews = () => {
    const [reviews, setReviews] = useState<ProblemReviews>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(
        () =>
            subscribeToDSAReviews(next => {
                setReviews(next);
                setLoaded(true);
            }),
        []
    );

    return { reviews, loaded };
};

/** Save how a review went. A failed save is logged, and the problem simply stays due. */
export const saveRating = (problemId: string, review: ProblemReview, rating: ReviewRating, today: string) => {
    saveDSAReview(problemId, rateReview(review, rating, today)).catch(() => {});
};
