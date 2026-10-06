import { useEffect, useState } from 'react';
import { subscribeToDSAProgress, type DSATopicProgress } from '../services/firebaseService';

/** Solved problems and practice dates for every NeetCode topic, live from Firestore. */
export const useDSAProgress = () => {
    const [progress, setProgress] = useState<Record<string, DSATopicProgress>>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(
        () =>
            subscribeToDSAProgress(next => {
                setProgress(next);
                setLoaded(true);
            }),
        []
    );

    return { progress, loaded };
};
