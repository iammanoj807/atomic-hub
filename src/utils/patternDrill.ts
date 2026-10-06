import { dsaCurriculum } from '../data/dsaCurriculum';
import { dsaProblemCards } from '../data/dsaProblemCards';
import { lookAlikeTopics } from '../data/dsaRecognition';

// "Which pattern?" drill with spaced repetition (Leitner boxes).
// A card is one NeetCode problem: you read its summary and pick the pattern.
// Right answers move the card to the next box and it comes back later;
// a wrong answer sends it back to box 1, so it returns tomorrow.

/** Days until a card comes back, for boxes 1 to 5. */
export const BOX_INTERVAL_DAYS = [1, 3, 7, 14, 30] as const;
export const MAX_BOX = BOX_INTERVAL_DAYS.length;

export interface DrillCardState {
    /** 1 (new or recently missed) to 5 (well known). */
    box: number;
    /** Next review date, YYYY-MM-DD. */
    due: string;
    reviews: number;
    correct: number;
}

/** Saved progress: problem id -> card state. Cards never answered are absent. */
export type DrillState = Record<string, DrillCardState>;

export interface DrillProblem {
    id: string;
    title: string;
    url: string;
    topicId: string;
    topicTitle: string;
}

/** Every NeetCode problem, in curriculum order, with its topic. */
export const allDrillProblems: DrillProblem[] = dsaCurriculum.flatMap(phase =>
    phase.sections.flatMap(section =>
        section.topics.flatMap(topic =>
            topic.problems.map(problem => ({
                id: problem.id,
                title: problem.title,
                url: problem.url,
                topicId: topic.id,
                topicTitle: topic.title,
            }))
        )
    )
);

const problemById = new Map(allDrillProblems.map(problem => [problem.id, problem]));
export const getDrillProblem = (id: string) => problemById.get(id);

const topicTitles = new Map(
    dsaCurriculum.flatMap(phase => phase.sections.flatMap(section => section.topics.map(topic => [topic.id, topic.title] as const)))
);
export const topicTitle = (topicId: string) => topicTitles.get(topicId) ?? topicId;
export const allTopicIds = [...topicTitles.keys()];

/** Add whole days to a YYYY-MM-DD date. */
export const addDays = (date: string, days: number): string => {
    const [y, m, d] = date.split('-').map(Number);
    const result = new Date(Date.UTC(y, m - 1, d + days));
    return result.toISOString().slice(0, 10);
};

/** Cards due on or before today, oldest due date first, then lowest box. */
export const dueCards = (state: DrillState, today: string): string[] =>
    Object.entries(state)
        .filter(([id, card]) => card.due <= today && problemById.has(id))
        .sort(([, a], [, b]) => a.due.localeCompare(b.due) || a.box - b.box)
        .map(([id]) => id);

/** Problems never drilled yet, in curriculum order. */
export const unseenCards = (state: DrillState): string[] => allDrillProblems.map(p => p.id).filter(id => !state[id]);

export interface SessionOptions {
    /** Most cards in one session. */
    max?: number;
    /** New cards added per session. */
    newCards?: number;
    /** Only use problems from these topics (for example, topics already studied). */
    topicIds?: string[];
}

/** Today's session: due reviews first, then a few new cards, up to `max`. */
export const buildSession = (state: DrillState, today: string, options: SessionOptions = {}): string[] => {
    const { max = 15, newCards = 5, topicIds } = options;
    const allowed = (id: string) => !topicIds || topicIds.includes(problemById.get(id)?.topicId ?? '');
    const due = dueCards(state, today).filter(allowed).slice(0, max);
    const fresh = unseenCards(state)
        .filter(allowed)
        .slice(0, Math.max(0, Math.min(newCards, max - due.length)));
    return [...due, ...fresh];
};

/** Is this topic a correct answer for the problem? */
export const isCorrectChoice = (problemId: string, topicId: string): boolean => {
    const problem = problemById.get(problemId);
    if (!problem) return false;
    return problem.topicId === topicId || (dsaProblemCards[problemId]?.alsoAccept ?? []).includes(topicId);
};

/** Record an answer and return the new state (the old state is not changed). */
export const reviewCard = (state: DrillState, problemId: string, correct: boolean, today: string): DrillState => {
    const previous = state[problemId];
    const box = correct ? Math.min((previous?.box ?? 0) + 1, MAX_BOX) : 1;
    return {
        ...state,
        [problemId]: {
            box,
            due: addDays(today, correct ? BOX_INTERVAL_DAYS[box - 1] : 1),
            reviews: (previous?.reviews ?? 0) + 1,
            correct: (previous?.correct ?? 0) + (correct ? 1 : 0),
        },
    };
};

/** A small, repeatable random number generator, so options don't reshuffle on every render. */
const seeded = (seed: number) => () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
};
const hash = (text: string) => [...text].reduce((h, ch) => (h * 31 + ch.charCodeAt(0)) % 2147483647, 7);

/**
 * Four answer options (topic ids) for a problem: the right topic, its look-alikes
 * first (the confusions worth practising), then others. Never two correct options.
 */
export const choicesFor = (problemId: string, count = 4): string[] => {
    const problem = problemById.get(problemId);
    if (!problem) return [];
    const random = seeded(hash(problemId));
    const wrong = (topicId: string) => !isCorrectChoice(problemId, topicId);
    const lookAlikes = (lookAlikeTopics[problem.topicId] ?? []).filter(wrong);
    const others = allTopicIds.filter(id => wrong(id) && !lookAlikes.includes(id)).sort(() => random() - 0.5);
    const options = [problem.topicId, ...[...lookAlikes, ...others].slice(0, count - 1)];
    return options.sort(() => random() - 0.5);
};

export interface DrillSummary {
    /** How many cards sit in each box, 1 to 5. */
    boxes: number[];
    unseen: number;
    /** Cards in box 4 or 5. */
    mastered: number;
}

export const drillSummary = (state: DrillState): DrillSummary => {
    const boxes = Array.from({ length: MAX_BOX }, () => 0);
    for (const problem of allDrillProblems) {
        const card = state[problem.id];
        if (card) boxes[card.box - 1] += 1;
    }
    return {
        boxes,
        unseen: allDrillProblems.filter(p => !state[p.id]).length,
        mastered: boxes[3] + boxes[4],
    };
};

/** Accuracy per topic, to show which patterns you still confuse. */
export const topicAccuracy = (state: DrillState): Record<string, { reviews: number; correct: number }> => {
    const result: Record<string, { reviews: number; correct: number }> = {};
    for (const problem of allDrillProblems) {
        const card = state[problem.id];
        if (!card) continue;
        const entry = (result[problem.topicId] ??= { reviews: 0, correct: 0 });
        entry.reviews += card.reviews;
        entry.correct += card.correct;
    }
    return result;
};
