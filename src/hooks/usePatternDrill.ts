import { useEffect, useState } from 'react';
import { subscribeToPatternDrill, savePatternDrillCard } from '../services/firebaseService';
import { reviewCard, type DrillState } from '../utils/patternDrill';

/**
 * The "Which pattern?" drill's saved cards, and a way to record an answer.
 * `loaded` stays false until the first snapshot arrives: answering before that
 * would treat a well-known card as new and send it back to the start.
 */
export const usePatternDrill = () => {
    const [cards, setCards] = useState<DrillState>({});
    const [loaded, setLoaded] = useState(false);

    useEffect(
        () =>
            subscribeToPatternDrill(next => {
                setCards(next);
                setLoaded(true);
            }),
        []
    );

    /** Record an answer: move the card between boxes and save just that card. */
    const review = async (problemId: string, correct: boolean, today: string) => {
        const next = reviewCard(cards, problemId, correct, today);
        setCards(next);
        await savePatternDrillCard(problemId, next[problemId]);
    };

    return { cards, loaded, review };
};
