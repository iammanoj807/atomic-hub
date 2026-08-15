// Firebase Firestore Service
// Handles all CRUD operations for tasks, companies, and daily habits

import {
    collection,
    doc,
    addDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    deleteField,
    onSnapshot,
    query,
    orderBy,
    Timestamp,
} from 'firebase/firestore';
import type { QuerySnapshot, DocumentData } from 'firebase/firestore';
import { db } from '../firebase';

// Collection names
const TASKS_COLLECTION = 'tasks';
const COMPANIES_COLLECTION = 'companies';
const DAILY_HABITS_COLLECTION = 'dailyHabits';
const DAILY_LOGS_COLLECTION = 'daily_logs';

// Types
export interface FirestoreTask {
    id?: string;
    title: string;
    description: string;
    category: string;
    companyId?: string;
    tag?: string;
    completed: boolean;
    createdAt: Timestamp;
    /** 4-6 short bullets. Shown instead of the full answer by default. */
    memoryPoints?: string[];
    /** Links this question to one of the six core stories (see coreStories.ts). */
    coreStoryId?: string;
}

export interface FirestoreCompany {
    id?: string;
    name: string;
    createdAt: Timestamp;
}

export interface FirestoreDailyHabit {
    id?: string;
    title: string;
    completed: boolean;
    note: string;
    /** Optional override for UI role tags (values: ENGINEER | SCHOLAR | BUILDER | SON | CHARACTER). */
    roleTags?: string[];
    createdAt?: Timestamp;
}

export interface DailyLogData {
    habits: {
        [habitId: string]: {
            completed: boolean;
            note: string;
        }
    };
}

export interface UserStats {
    currentStreak: number;
    longestStreak: number;
    lastCompletionDate: string | null; // ISO date string YYYY-MM-DD
}

// ============ TASKS ============

export const subscribeToTasks = (
    callback: (tasks: FirestoreTask[]) => void
) => {

    const q = query(collection(db, TASKS_COLLECTION), orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {

        const tasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FirestoreTask[];
        callback(tasks);
    }, (error) => {
        console.error('❌ Tasks subscription error:', error.code, error.message);
    });
};

export const addTaskToFirestore = async (task: Omit<FirestoreTask, 'id' | 'createdAt'>) => {
    try {

        const docRef = await addDoc(collection(db, TASKS_COLLECTION), {
            ...task,
            createdAt: Timestamp.now()
        });

        return docRef.id;
    } catch (error: any) {
        console.error('❌ Failed to add task:', error.code, error.message);
        throw error;
    }
};

export const updateTaskInFirestore = async (id: string, updates: Partial<FirestoreTask>) => {
    try {

        const taskRef = doc(db, TASKS_COLLECTION, id);
        await updateDoc(taskRef, updates);

    } catch (error: any) {
        console.error('❌ Failed to update task:', error.code, error.message);
        throw error;
    }
};

export const deleteTaskFromFirestore = async (id: string) => {
    try {

        const taskRef = doc(db, TASKS_COLLECTION, id);
        await deleteDoc(taskRef);

    } catch (error: any) {
        console.error('❌ Failed to delete task:', error.code, error.message);
        throw error;
    }
};

// ============ COMPANIES ============

export const subscribeToCompanies = (
    callback: (companies: FirestoreCompany[]) => void
) => {

    const q = query(collection(db, COMPANIES_COLLECTION), orderBy('createdAt', 'asc'));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {

        const companies = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FirestoreCompany[];
        callback(companies);
    }, (error) => {
        console.error('❌ Companies subscription error:', error.code, error.message);
    });
};

export const addCompanyToFirestore = async (name: string) => {
    try {

        const docRef = await addDoc(collection(db, COMPANIES_COLLECTION), {
            name,
            createdAt: Timestamp.now()
        });

        return docRef.id;
    } catch (error: any) {
        console.error('❌ Failed to add company:', error.code, error.message);
        throw error;
    }
};

export const updateCompanyInFirestore = async (id: string, name: string) => {
    try {
        const companyRef = doc(db, COMPANIES_COLLECTION, id);
        await updateDoc(companyRef, { name });
    } catch (error: any) {
        console.error('❌ Failed to update company:', error.code, error.message);
        throw error;
    }
};

export const deleteCompanyFromFirestore = async (id: string) => {
    try {

        const companyRef = doc(db, COMPANIES_COLLECTION, id);
        await deleteDoc(companyRef);

    } catch (error: any) {
        console.error('❌ Failed to delete company:', error.code, error.message);
        throw error;
    }
};

// ============ DAILY HABITS ============

export const subscribeToDailyHabits = (
    callback: (habits: FirestoreDailyHabit[]) => void
) => {

    return onSnapshot(collection(db, DAILY_HABITS_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {

        const habits = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        })) as FirestoreDailyHabit[];

        // Sort by createdAt ascending (oldest first, new at bottom)
        // If createdAt is missing (legacy data), treat as oldest (0)
        habits.sort((a, b) => {
            const timeA = a.createdAt?.toMillis() || 0;
            const timeB = b.createdAt?.toMillis() || 0;
            return timeA - timeB;
        });

        callback(habits);
    }, (error) => {
        console.error('❌ Habits subscription error:', error.code, error.message);
    });
};

export const addHabitToFirestore = async (
    title: string,
    roleTags?: string[]
) => {
    try {

        const data: Record<string, unknown> = {
            title,
            completed: false,
            note: '',
            createdAt: Timestamp.now()
        };
        if (roleTags && roleTags.length > 0) data.roleTags = roleTags;

        const docRef = await addDoc(collection(db, DAILY_HABITS_COLLECTION), data);

        return docRef.id;
    } catch (error: any) {
        console.error('❌ Failed to add habit:', error.code, error.message);
        throw error;
    }
};

export const updateHabitInFirestore = async (id: string, updates: Record<string, unknown>) => {
    try {

        const habitRef = doc(db, DAILY_HABITS_COLLECTION, id);
        await updateDoc(habitRef, updates as DocumentData);

    } catch (error: any) {
        console.error('❌ Failed to update habit:', error.code, error.message);
        throw error;
    }
};

export const deleteHabitFromFirestore = async (id: string) => {
    try {

        const habitRef = doc(db, DAILY_HABITS_COLLECTION, id);
        await deleteDoc(habitRef);

    } catch (error: any) {
        console.error('❌ Failed to delete habit:', error.code, error.message);
        throw error;
    }
};



// ============ DAILY LOGS (HISTORY) ============

export const subscribeToDailyLog = (
    date: string,
    callback: (log: DailyLogData | null) => void
) => {
    // docId is the date string YYYY-MM-DD
    return onSnapshot(doc(db, DAILY_LOGS_COLLECTION, date), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as DailyLogData);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('❌ Daily Log subscription error:', error.code, error.message);
    });
};

export const updateDailyLog = async (date: string, habitId: string, data: { completed?: boolean, note?: string }) => {
    try {
        const logRef = doc(db, DAILY_LOGS_COLLECTION, date);

        // We need to use updateDoc with dot notation for nested fields map access
        // habits.habitId.completed
        const updates: any = {};
        if (data.completed !== undefined) {
            updates[`habits.${habitId}.completed`] = data.completed;
        }
        if (data.note !== undefined) {
            updates[`habits.${habitId}.note`] = data.note;
        }

        // Try update first
        try {
            await updateDoc(logRef, updates);
        } catch (error: any) {
            // If doc doesn't exist, we must create it with setDoc and merge
            if (error.code === 'not-found') {
                const { setDoc } = await import('firebase/firestore');
                // Construct full object for setDoc merge
                const newLogData: any = { habits: {} };
                newLogData.habits[habitId] = {};
                if (data.completed !== undefined) newLogData.habits[habitId].completed = data.completed;
                if (data.note !== undefined) newLogData.habits[habitId].note = data.note;

                await setDoc(logRef, newLogData, { merge: true });
            } else {
                throw error;
            }
        }

    } catch (error: any) {
        console.error('❌ Failed to update daily log:', error.code, error.message);
        throw error;
    }
};



export const subscribeToHistory = (
    startDate: string,
    callback: (logs: { [date: string]: DailyLogData }) => void
) => {
    // Get logs where document ID (date) is >= startDate
    // Firestore doesn't easily allow filtering by document ID inequalities in client SDKs sometimes,
    // but we can query the collection and client-side filter or use FieldPath.documentId().
    // For simplicity: Just get all logs and filter client side.
    const q = query(collection(db, DAILY_LOGS_COLLECTION));

    return onSnapshot(q, (snapshot) => {
        const logs: { [date: string]: DailyLogData } = {};
        snapshot.forEach(doc => {
            if (doc.id >= startDate) {
                logs[doc.id] = doc.data() as DailyLogData;
            }
        });
        callback(logs);
    }, (error) => {
        console.error('❌ History subscription error:', error.code, error.message);
    });
};

const STATS_COLLECTION = 'stats';
const DAILY_PROGRESS_DOC = 'daily_progress';

export const subscribeToStats = (
    callback: (stats: UserStats) => void
) => {

    // We use a single document 'daily_progress' for simplicity in this single-user app
    return onSnapshot(doc(db, STATS_COLLECTION, DAILY_PROGRESS_DOC), (docSnap) => {
        if (docSnap.exists()) {

            callback(docSnap.data() as UserStats);
        } else {

            callback({ currentStreak: 0, longestStreak: 0, lastCompletionDate: null });
        }
    }, (error) => {
        console.error('❌ Stats subscription error:', error.code, error.message);
    });
};

export const updateStreakInFirestore = async (stats: UserStats) => {
    try {

        // data to save
        const statsRef = doc(db, STATS_COLLECTION, DAILY_PROGRESS_DOC);

        // Use setDoc with merge to create if not exists
        const { setDoc } = await import('firebase/firestore');
        // Note: Dynamic import or adding setDoc to top imports. 
        // Let's assume setDoc is available or use updateDoc if widely used, 
        // but updateDoc fails if doc doesn't exist. setDoc is safer for singletons.
        // Actually, easier to just add setDoc to top imports.

        // For now, let's use setDoc. I need to add it to imports.
        await setDoc(statsRef, stats, { merge: true });


    } catch (error: any) {
        console.error('❌ Failed to update streak:', error.code, error.message);
        throw error;
    }
};

// ============ DSA PROGRESS ============

const DSA_PROGRESS_COLLECTION = 'dsa_progress';

export interface DSAReviewLog {
    id: string;
    date: Timestamp;
    text: string;
}

export interface DSATopicProgress {
    topicId: string;
    completed: boolean;
    completedProblems: string[]; // Array of problem IDs
    reviewLogs?: DSAReviewLog[];
    /** Maps problemId → ISO date string for the next practice date */
    practiceSchedule?: Record<string, string>;
    updatedAt: Timestamp;
}

export const addDSAReviewLog = async (topicId: string, text: string) => {
    try {
        const { getDoc, setDoc, updateDoc, arrayUnion } = await import('firebase/firestore');
        const topicRef = doc(db, DSA_PROGRESS_COLLECTION, topicId);
        const docSnap = await getDoc(topicRef);
        
        const newLog: DSAReviewLog = {
            id: crypto.randomUUID(),
            date: Timestamp.now(),
            text
        };

        if (docSnap.exists()) {
            await updateDoc(topicRef, {
                reviewLogs: arrayUnion(newLog),
                updatedAt: Timestamp.now()
            });
        } else {
            await setDoc(topicRef, {
                topicId,
                completedProblems: [],
                reviewLogs: [newLog],
                updatedAt: Timestamp.now()
            });
        }
    } catch (error: any) {
        console.error('❌ Failed to add DSA review log:', error.code, error.message);
        throw error;
    }
};

export const deleteDSAReviewLog = async (topicId: string, logId: string) => {
    try {
        const { getDoc, updateDoc } = await import('firebase/firestore');
        const topicRef = doc(db, DSA_PROGRESS_COLLECTION, topicId);
        const docSnap = await getDoc(topicRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data() as DSATopicProgress;
            if (data.reviewLogs) {
                const newLogs = data.reviewLogs.filter(log => log.id !== logId);
                await updateDoc(topicRef, {
                    reviewLogs: newLogs,
                    updatedAt: Timestamp.now()
                });
            }
        }
    } catch (error: any) {
        console.error('❌ Failed to delete DSA review log:', error.code, error.message);
        throw error;
    }
};

export const subscribeToDSAProgress = (
    callback: (progress: Record<string, DSATopicProgress>) => void
) => {
    const q = query(collection(db, DSA_PROGRESS_COLLECTION));

    return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
        const progress: Record<string, DSATopicProgress> = {};
        snapshot.docs.forEach(doc => {
            progress[doc.id] = doc.data() as DSATopicProgress;
        });
        callback(progress);
    }, (error) => {
        console.error('❌ DSA Progress subscription error:', error.code, error.message);
    });
};

export const updateDSATopicProgress = async (
    topicId: string,
    updates: Partial<Omit<DSATopicProgress, 'topicId' | 'updatedAt'>>
) => {
    try {
        const { setDoc } = await import('firebase/firestore');
        const topicRef = doc(db, DSA_PROGRESS_COLLECTION, topicId);
        await setDoc(topicRef, {
            topicId,
            ...updates,
            updatedAt: Timestamp.now()
        }, { merge: true });
    } catch (error: any) {
        console.error('❌ Failed to update DSA progress:', error.code, error.message);
        throw error;
    }
};

export const toggleDSAProblemCompletion = async (
    topicId: string,
    problemId: string,
    currentCompletedProblems: string[]
) => {
    const isCompleted = currentCompletedProblems.includes(problemId);
    let newCompletedProblems: string[];

    try {
        const { getDoc, setDoc, updateDoc } = await import('firebase/firestore');
        const topicRef = doc(db, DSA_PROGRESS_COLLECTION, topicId);
        const docSnap = await getDoc(topicRef);

        if (docSnap.exists()) {
            const updates: any = {};

            if (isCompleted) {
                newCompletedProblems = currentCompletedProblems.filter(id => id !== problemId);
                updates['completedProblems'] = newCompletedProblems;
            } else {
                newCompletedProblems = [...currentCompletedProblems, problemId];
                updates['completedProblems'] = newCompletedProblems;
            }

            updates['updatedAt'] = Timestamp.now();
            await updateDoc(topicRef, updates);
        } else {
            if (isCompleted) {
                return { completed: [] };
            }

            newCompletedProblems = [problemId];

            await setDoc(topicRef, {
                topicId,
                completedProblems: newCompletedProblems,
                updatedAt: Timestamp.now()
            });
        }

        return { completed: newCompletedProblems };
    } catch (error: any) {
        console.error('❌ Failed to toggle DSA problem:', error.code, error.message);
        throw error;
    }
};

/**
 * Set or clear a practice date for a specific problem.
 * @param dateISO Pass an ISO date string to set, or null to clear.
 */
export const setPracticeDateForProblem = async (
    topicId: string,
    problemId: string,
    dateISO: string | null
) => {
    try {
        const { getDoc, setDoc, updateDoc } = await import('firebase/firestore');
        const topicRef = doc(db, DSA_PROGRESS_COLLECTION, topicId);
        const docSnap = await getDoc(topicRef);

        const fieldKey = `practiceSchedule.${problemId}`;

        if (docSnap.exists()) {
            if (dateISO) {
                await updateDoc(topicRef, { [fieldKey]: dateISO, updatedAt: Timestamp.now() });
            } else {
                await updateDoc(topicRef, { [fieldKey]: deleteField(), updatedAt: Timestamp.now() });
            }
        } else {
            await setDoc(topicRef, {
                topicId,
                completedProblems: [],
                practiceSchedule: dateISO ? { [problemId]: dateISO } : {},
                updatedAt: Timestamp.now(),
            });
        }
    } catch (error: any) {
        console.error('❌ Failed to set practice date:', error.code, error.message);
        throw error;
    }
};

// ============ JOB OUTREACH TRACKER ============

const JOB_OUTREACH_COLLECTION = 'job_outreach_logs';

export interface OutreachEntry {
    name: string;
    note: string;
    type: 'linkedin' | 'company';
}

export interface DailyOutreachLog {
    entries: OutreachEntry[];
    updatedAt?: Timestamp;
}

export const subscribeToDailyOutreach = (
    date: string,
    callback: (log: DailyOutreachLog | null) => void
) => {
    const docRef = doc(db, JOB_OUTREACH_COLLECTION, date);

    return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as DailyOutreachLog);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('❌ Outreach subscription error:', error.code, error.message);
    });
};

export const saveDailyOutreach = async (date: string, entries: OutreachEntry[]) => {
    try {
        const docRef = doc(db, JOB_OUTREACH_COLLECTION, date);
        await setDoc(docRef, {
            entries,
            updatedAt: Timestamp.now(),
        }, { merge: true });
    } catch (error: any) {
        console.error('❌ Failed to save outreach:', error.code, error.message);
        throw error;
    }
};

// ============ PRACTICE RECORDS ============

const PRACTICE_RECORDS_COLLECTION = 'practiceRecords';

export interface PracticeRecord {
    questionId: string;      // also the document id
    reps: number;            // total times practised out loud
    lastPractisedAt: string; // YYYY-MM-DD (London)
    confidence: 1 | 2 | 3;   // 1 shaky, 2 okay, 3 solid — set after each rep
}

/** Keyed by questionId so lookups during scoring are O(1). */
export const subscribeToPracticeRecords = (
    callback: (records: Record<string, PracticeRecord>) => void
) => {
    return onSnapshot(collection(db, PRACTICE_RECORDS_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {
        const records: Record<string, PracticeRecord> = {};
        snapshot.docs.forEach(doc => {
            records[doc.id] = { ...(doc.data() as PracticeRecord), questionId: doc.id };
        });
        callback(records);
    }, (error) => {
        console.error('❌ Practice records subscription error:', error.code, error.message);
    });
};

export const savePracticeRecord = async (record: PracticeRecord) => {
    try {
        const docRef = doc(db, PRACTICE_RECORDS_COLLECTION, record.questionId);
        await setDoc(docRef, record, { merge: true });
    } catch (error: any) {
        console.error('❌ Failed to save practice record:', error.code, error.message);
        throw error;
    }
};



// ============ EVIDENCE LOG ============

const EVIDENCE_LOG_COLLECTION = 'evidenceLog';

export type EvidenceTag =
    | 'applied'
    | 'built'
    | 'practised'
    | 'networked'
    | 'interview'
    | 'showed-up';

export interface EvidenceEntry {
    date: string;        // YYYY-MM-DD — also the document id, so one line per day
    text: string;        // one line, capped at ~200 chars by the input
    tag?: EvidenceTag;
    createdAt: string;   // ISO string, set once when the entry is first written
}

/**
 * Subscribes to the whole collection rather than a single date.
 * Every view of this feature — tonight's prompt, the month list, the receipts
 * screen, the "N days" count — needs the same data, and a year of entries is
 * ~365 tiny documents, so one snapshot is cheaper than four subscriptions.
 */
export const subscribeToEvidenceLog = (
    callback: (entries: EvidenceEntry[]) => void
) => {
    return onSnapshot(collection(db, EVIDENCE_LOG_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {
        const entries = snapshot.docs.map(doc => ({
            ...(doc.data() as EvidenceEntry),
            date: doc.id, // the document id is the authority on which day this is
        }));

        // Newest first — every screen reads recent days first.
        entries.sort((a, b) => b.date.localeCompare(a.date));

        callback(entries);
    }, (error) => {
        console.error('❌ Evidence log subscription error:', error.code, error.message);
    });
};

export const saveEvidenceEntry = async (entry: EvidenceEntry) => {
    try {
        const docRef = doc(db, EVIDENCE_LOG_COLLECTION, entry.date);
        await setDoc(docRef, {
            date: entry.date,
            text: entry.text,
            // Firestore rejects undefined, and editing an entry to remove its
            // tag has to actually clear the stored field.
            tag: entry.tag ?? deleteField(),
            createdAt: entry.createdAt,
        }, { merge: true });
    } catch (error: any) {
        console.error('❌ Failed to save evidence entry:', error.code, error.message);
        throw error;
    }
};

export const deleteEvidenceEntry = async (date: string) => {
    try {
        const docRef = doc(db, EVIDENCE_LOG_COLLECTION, date);
        await deleteDoc(docRef);
    } catch (error: any) {
        console.error('❌ Failed to delete evidence entry:', error.code, error.message);
        throw error;
    }
};

// ============ STUDY PLAN ============
//
// The 26-week plan itself is static content (data/studyPlan.ts). What lives
// here is only what changes: the Sunday hours entry, the papers read, and
// which of the nine projects are finished.

const STUDY_WEEKS_COLLECTION = 'study_weeks';
const STUDY_PAPERS_COLLECTION = 'study_papers';
const STUDY_PROGRESS_COLLECTION = 'study_progress';
const STUDY_PROJECTS_DOC = 'projects';

export interface StudyWeekLog {
    week: number;             // 1-26
    actualHours: number | null;
    dsaProblems: number | null;
    finished: string;         // "What I finished"
    learned: string;          // "One thing I understand now that I didn't last week"
    updatedAt: Timestamp;
}

/** Zero-padded so document ids sort the same way the weeks run. */
const studyWeekDocId = (week: number) => `week-${String(week).padStart(2, '0')}`;

/** Keyed by week number — every screen looks weeks up by number, never by id. */
export const subscribeToStudyWeeks = (
    callback: (logs: Record<number, StudyWeekLog>) => void
) => {
    return onSnapshot(collection(db, STUDY_WEEKS_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {
        const logs: Record<number, StudyWeekLog> = {};
        snapshot.docs.forEach(doc => {
            const data = doc.data() as StudyWeekLog;
            if (typeof data.week === 'number') logs[data.week] = data;
        });
        callback(logs);
    }, (error) => {
        console.error('❌ Study weeks subscription error:', error.code, error.message);
    });
};

export const saveStudyWeekLog = async (
    week: number,
    updates: Partial<Omit<StudyWeekLog, 'week' | 'updatedAt'>>
) => {
    try {
        const docRef = doc(db, STUDY_WEEKS_COLLECTION, studyWeekDocId(week));
        await setDoc(docRef, {
            week,
            ...updates,
            updatedAt: Timestamp.now(),
        }, { merge: true });
    } catch (error) {
        console.error('❌ Failed to save study week:', error);
        throw error;
    }
};

export interface StudyPaper {
    id: string;          // also the document id
    date: string;        // YYYY-MM-DD
    title: string;
    venue: string;       // "NeurIPS 2017"
    pass: 1 | 2 | 3;     // the three-pass method
    mainIdea: string;    // in my own words — the point of the whole log
    weakness: string;    // weakness + the next experiment I would run
    createdAt: string;   // ISO, set once
}

export const subscribeToStudyPapers = (
    callback: (papers: StudyPaper[]) => void
) => {
    return onSnapshot(collection(db, STUDY_PAPERS_COLLECTION), (snapshot: QuerySnapshot<DocumentData>) => {
        const papers = snapshot.docs.map(doc => ({
            ...(doc.data() as StudyPaper),
            id: doc.id,
        }));

        // Newest read first.
        papers.sort((a, b) => b.date.localeCompare(a.date));

        callback(papers);
    }, (error) => {
        console.error('❌ Study papers subscription error:', error.code, error.message);
    });
};

export const saveStudyPaper = async (paper: StudyPaper) => {
    try {
        const docRef = doc(db, STUDY_PAPERS_COLLECTION, paper.id);
        await setDoc(docRef, paper, { merge: true });
    } catch (error) {
        console.error('❌ Failed to save paper:', error);
        throw error;
    }
};

export const deleteStudyPaper = async (id: string) => {
    try {
        await deleteDoc(doc(db, STUDY_PAPERS_COLLECTION, id));
    } catch (error) {
        console.error('❌ Failed to delete paper:', error);
        throw error;
    }
};

/** Which of the nine portfolio projects are done. One tiny document. */
export const subscribeToStudyProjects = (
    callback: (completedIds: string[]) => void
) => {
    return onSnapshot(doc(db, STUDY_PROGRESS_COLLECTION, STUDY_PROJECTS_DOC), (docSnap) => {
        callback(docSnap.exists() ? (docSnap.data().completedIds ?? []) : []);
    }, (error) => {
        console.error('❌ Study projects subscription error:', error.code, error.message);
    });
};

export const saveStudyProjects = async (completedIds: string[]) => {
    try {
        const docRef = doc(db, STUDY_PROGRESS_COLLECTION, STUDY_PROJECTS_DOC);
        await setDoc(docRef, { completedIds, updatedAt: Timestamp.now() }, { merge: true });
    } catch (error) {
        console.error('❌ Failed to save study projects:', error);
        throw error;
    }
};

// ============ WEEKLY GOALS ============

const WEEKLY_GOALS_COLLECTION = 'weekly_goals';

export interface WeeklyGoal {
    id: string;
    text: string;
    completed: boolean;
}

export interface WeeklyGoalsDoc {
    weekStartDate: string; // doc ID: Sunday YYYY-MM-DD
    goals: WeeklyGoal[];
    updatedAt: Timestamp;
}

export const subscribeToWeeklyGoals = (
    weekDate: string,
    callback: (data: WeeklyGoalsDoc | null) => void
) => {
    return onSnapshot(doc(db, WEEKLY_GOALS_COLLECTION, weekDate), (docSnap) => {
        if (docSnap.exists()) {
            callback(docSnap.data() as WeeklyGoalsDoc);
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('❌ Weekly goals subscription error:', error.code, error.message);
    });
};

export const saveWeeklyGoals = async (
    weekDate: string,
    goals: WeeklyGoal[]
) => {
    try {
        const docRef = doc(db, WEEKLY_GOALS_COLLECTION, weekDate);
        await setDoc(docRef, {
            weekStartDate: weekDate,
            goals,
            updatedAt: Timestamp.now(),
        }, { merge: true });
    } catch (error: any) {
        console.error('❌ Failed to save weekly goals:', error.code, error.message);
        throw error;
    }
};
