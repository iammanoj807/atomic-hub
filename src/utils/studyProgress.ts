// Reading, gates and artifacts — the three things the plan asks you to prove.
//
// All of these are pure functions over data the service layer has already
// fetched. Firestore is not mocked anywhere in this repo, so the rules that
// decide whether a stage is passed or an artifact is finished live here, where
// a test can reach them without a network.

import type {
    ReadingEntry,
    GateAttempt,
    ArtifactProgressDoc,
} from '../services/firebaseService';
import { readingLadder, projects, type ReadingLevel } from '../data/studyPlan';

// ============ READING ============

/** Every entry logged against a given plan week, newest first. */
export const getReadingByWeek = (
    entries: ReadingEntry[],
    week: number
): ReadingEntry[] =>
    entries
        .filter(entry => entry.weekNumber === week)
        .sort((a, b) => b.date.localeCompare(a.date));

const previousDay = (dateISO: string): string => {
    const date = new Date(`${dateISO}T00:00:00Z`);
    date.setUTCDate(date.getUTCDate() - 1);
    return date.toISOString().slice(0, 10);
};

/**
 * Consecutive days read, counting back from today. Today not being logged yet
 * does not break the streak — the day is not over — so the count starts from
 * yesterday in that case rather than resetting to zero at every midnight.
 */
export const getReadingStreak = (
    entries: ReadingEntry[],
    todayISO: string
): number => {
    const dates = new Set(entries.map(entry => entry.date));
    let day = dates.has(todayISO) ? todayISO : previousDay(todayISO);
    let streak = 0;
    while (dates.has(day)) {
        streak += 1;
        day = previousDay(day);
    }
    return streak;
};

/** How many entries sit on each rung of the ladder. Zero rungs are included. */
export const getReadingCountByLevel = (
    entries: ReadingEntry[]
): Record<ReadingLevel['level'], number> => {
    const counts = Object.fromEntries(
        readingLadder.map(level => [level.level, 0])
    ) as Record<ReadingLevel['level'], number>;

    for (const entry of entries) {
        if (entry.level in counts) counts[entry.level as ReadingLevel['level']] += 1;
    }
    return counts;
};

// ============ GATES ============

export type GateStatus = 'passed' | 'failed' | 'unattempted';

/**
 * A stage is complete only when its gate has a passed attempt. Attempts after
 * a pass cannot un-pass it — you sat it and you passed it — so any pass at all
 * settles the stage, and 'failed' means tried and not yet passed.
 */
export const getGateStatus = (
    attempts: GateAttempt[],
    stage: number
): GateStatus => {
    const forStage = attempts.filter(attempt => attempt.stage === stage);
    if (forStage.length === 0) return 'unattempted';
    return forStage.some(attempt => attempt.passed) ? 'passed' : 'failed';
};

/** Stages that were attempted and not passed, lowest first. Repeat these. */
export const getFailedGates = (attempts: GateAttempt[]): number[] => {
    const stages = [...new Set(attempts.map(attempt => attempt.stage))];
    return stages
        .filter(stage => getGateStatus(attempts, stage) === 'failed')
        .sort((a, b) => a - b);
};

/** How many times a gate has been sat, pass or fail. */
export const getGateAttemptCount = (
    attempts: GateAttempt[],
    stage: number
): number => attempts.filter(attempt => attempt.stage === stage).length;

// ============ ARTIFACTS ============

/** One artifact's four ticks, defaulted so the UI never has to null-check. */
export const getArtifactProgress = (
    progress: Record<string, ArtifactProgressDoc>,
    projectId: string
): ArtifactProgressDoc => progress[projectId] ?? {
    id: projectId,
    projectId,
    build: false,
    write: false,
    publish: false,
    post: false,
};

/** An artifact is done only when all four are true. BUILD alone is not done. */
export const isArtifactComplete = (
    progress: Record<string, ArtifactProgressDoc>,
    projectId: string
): boolean => {
    const artifact = getArtifactProgress(progress, projectId);
    return artifact.build && artifact.write && artifact.publish && artifact.post;
};

/** How many of the nine are actually finished, all four steps. */
export const getPublishedCount = (
    progress: Record<string, ArtifactProgressDoc>
): number => projects.filter(project => isArtifactComplete(progress, project.id)).length;

/**
 * How many of the four steps are done across every artifact — the number that
 * shows the gap between building things and having published them.
 */
export const getArtifactStepsDone = (
    progress: Record<string, ArtifactProgressDoc>
): number =>
    projects.reduce((total, project) => {
        const artifact = getArtifactProgress(progress, project.id);
        return total
            + Number(artifact.build) + Number(artifact.write)
            + Number(artifact.publish) + Number(artifact.post);
    }, 0);
