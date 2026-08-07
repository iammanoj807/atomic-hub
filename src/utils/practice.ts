// Readiness maths for the Interview Hub.
//
// The old metric was completedTasks / totalTasks, where `completed` is a
// permanent checkbox. It measured content ticked off, and reading an answer
// does not make you better at saying it. These three numbers measure practice
// instead, and all three can go down — which is the point.

import type { PracticeRecord } from '../services/firebaseService';

/** A question counts as "covered" only once it has been said out loud twice. */
export const COVERAGE_MIN_REPS = 2;

/** How recently a question must have been practised to still count as fresh. */
export const FRESHNESS_WINDOW_DAYS = 7;

export interface ReadinessMetrics {
    /** % of questions marked as completed. */
    coverage: number;
    /** % of questions practised within FRESHNESS_WINDOW_DAYS. */
    freshness: number;
    /** Mean confidence (1-3) across practised questions only; 0 when none. */
    confidence: number;
    /** How many questions have been marked as completed. */
    practisedCount: number;
    totalCount: number;
}

/**
 * Whole days between two YYYY-MM-DD strings.
 * Parsed as UTC midnight so the arithmetic can't drift across a timezone
 * boundary — the strings are already London calendar days.
 */
export const daysBetween = (fromDate: string, toDate: string): number => {
    const from = Date.parse(`${fromDate}T00:00:00Z`);
    const to = Date.parse(`${toDate}T00:00:00Z`);
    if (Number.isNaN(from) || Number.isNaN(to)) return 0;
    return Math.round((to - from) / (1000 * 60 * 60 * 24));
};

export const computeReadiness = (
    tasks: { id: string; completed: boolean }[],
    records: Record<string, PracticeRecord>,
    today: string
): ReadinessMetrics => {
    const totalCount = tasks.length;

    if (totalCount === 0) {
        return { coverage: 0, freshness: 0, confidence: 0, practisedCount: 0, totalCount: 0 };
    }

    let covered = 0;
    let fresh = 0;
    let confidenceSum = 0;
    let practiceRecordsCount = 0;

    for (const task of tasks) {
        if (task.completed) {
            covered++;
        }

        const record = records[task.id];
        if (!record) continue;

        practiceRecordsCount++;
        confidenceSum += record.confidence;

        if (daysBetween(record.lastPractisedAt, today) <= FRESHNESS_WINDOW_DAYS) fresh++;
    }

    return {
        coverage: Math.round((covered / totalCount) * 100),
        freshness: Math.round((fresh / totalCount) * 100),
        // Averaged over practised questions only: unpractised questions have no
        // confidence to report, and counting them as zero would just restate coverage.
        confidence: practiceRecordsCount > 0 ? confidenceSum / practiceRecordsCount : 0,
        practisedCount: practiceRecordsCount,
        totalCount,
    };
};
