import { useState, useEffect } from 'react';
import {
    subscribeToStudyWeeks,
    saveStudyWeekLog,
    subscribeToStudyPapers,
    saveStudyPaper,
    deleteStudyPaper,
    subscribeToStudyProjects,
    saveStudyProjects,
} from '../services/firebaseService';
import type { StudyWeekLog, StudyPaper } from '../services/firebaseService';
import { getLondonDateString } from '../utils/date';
import { getPlanWeekNumber } from '../utils/studyPlan';
import type { Weekday } from '../data/studyPlan';

/**
 * The moving parts of the 26-week plan: the Sunday hours entry, the papers
 * log, and the project ticks. The plan content itself is static and imported
 * directly by the pages that show it.
 *
 * Like the evidence log, this owns its own subscriptions and never blocks the
 * app's loading gate — nothing else on screen should wait for it.
 */
export const useStudyPlan = () => {
    const [studyWeekLogs, setStudyWeekLogs] = useState<Record<number, StudyWeekLog>>({});
    const [studyPapers, setStudyPapers] = useState<StudyPaper[]>([]);
    const [completedProjectIds, setCompletedProjectIds] = useState<string[]>([]);

    useEffect(() => {
        const unsubscribers = [
            subscribeToStudyWeeks(setStudyWeekLogs),
            subscribeToStudyPapers(setStudyPapers),
            subscribeToStudyProjects(setCompletedProjectIds),
        ];
        return () => unsubscribers.forEach(unsubscribe => unsubscribe());
    }, []);

    /** Which week of the plan today falls in — null before it starts and after it ends. */
    const currentWeekNumber = getPlanWeekNumber(getLondonDateString());

    const saveWeekLog = async (
        week: number,
        updates: Partial<Omit<StudyWeekLog, 'week' | 'updatedAt'>>
    ) => {
        await saveStudyWeekLog(week, updates);
    };

    /**
     * Which days were off in a given week. Stored on the week's own log,
     * because the answer is different every week and only that week knows it.
     */
    const saveDaysOff = async (week: number, daysOff: Weekday[]) => {
        await saveStudyWeekLog(week, { daysOff });
    };

    const getDaysOff = (week: number): Weekday[] =>
        (studyWeekLogs[week]?.daysOff ?? []) as Weekday[];

    const savePaper = async (paper: Omit<StudyPaper, 'id' | 'createdAt'> & { id?: string }) => {
        const existing = paper.id ? studyPapers.find(p => p.id === paper.id) : undefined;

        await saveStudyPaper({
            ...paper,
            id: paper.id ?? crypto.randomUUID(),
            // Editing a paper keeps the moment it was first logged.
            createdAt: existing?.createdAt ?? new Date().toISOString(),
        });
    };

    const deletePaper = async (id: string) => {
        await deleteStudyPaper(id);
    };

    const toggleProject = async (projectId: string) => {
        const next = completedProjectIds.includes(projectId)
            ? completedProjectIds.filter(id => id !== projectId)
            : [...completedProjectIds, projectId];

        await saveStudyProjects(next);
    };

    return {
        studyWeekLogs,
        currentWeekNumber,
        saveWeekLog,
        saveDaysOff,
        getDaysOff,
        studyPapers,
        savePaper,
        deletePaper,
        completedProjectIds,
        toggleProject,
    };
};
