import { useState, useEffect } from 'react';
import {
    subscribeToStudyWeeks,
    saveStudyWeekLog,
    saveStudyWeekSecondDayOff,
    subscribeToStudyPapers,
    saveStudyPaper,
    deleteStudyPaper,
    subscribeToStudyProjects,
    saveStudyProjects,
} from '../services/firebaseService';
import type { StudyWeekLog, StudyPaper } from '../services/firebaseService';
import { getLondonDateString } from '../utils/date';
import { getPlanWeekNumber } from '../utils/studyPlan';
import { DEFAULT_DEEP_WORK_DAY, isWeekday } from '../utils/studySchedule';
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
     * Which day the deep work block sits on in a given week. Stored on that
     * week's own log, because the rota answer is different every week and only
     * that week knows it.
     */
    const saveDeepWorkDay = async (week: number, deepWorkDay: Weekday) => {
        await saveStudyWeekLog(week, { deepWorkDay });
    };

    /** Falls back to the plan's original Friday when a week has not set one. */
    const getDeepWorkDay = (week: number): Weekday => {
        const stored = studyWeekLogs[week]?.deepWorkDay;
        return isWeekday(stored) ? stored : DEFAULT_DEEP_WORK_DAY;
    };

    /**
     * The second day off, on the weeks the rota gives one. Null is the honest
     * answer for a one-day-off week, so it is stored as a cleared field rather
     * than a day that happens to mean "none".
     */
    const saveSecondDayOff = async (week: number, secondDayOff: Weekday | null) => {
        await saveStudyWeekSecondDayOff(week, secondDayOff);
    };

    const getSecondDayOff = (week: number): Weekday | null => {
        const stored = studyWeekLogs[week]?.secondDayOff;
        return isWeekday(stored) ? stored : null;
    };

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
        saveDeepWorkDay,
        getDeepWorkDay,
        saveSecondDayOff,
        getSecondDayOff,
        studyPapers,
        savePaper,
        deletePaper,
        completedProjectIds,
        toggleProject,
    };
};
