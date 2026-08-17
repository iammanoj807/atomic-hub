import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Snackbar, Alert, Box } from '@mui/material';
import type { ReactNode } from 'react';
import {
    subscribeToTasks,
    subscribeToCompanies,
    subscribeToDailyHabits,
    addTaskToFirestore,
    updateTaskInFirestore,
    deleteTaskFromFirestore,
    addCompanyToFirestore,
    updateCompanyInFirestore,
    deleteCompanyFromFirestore,
    addHabitToFirestore,
    updateHabitInFirestore,
    deleteHabitFromFirestore,
    subscribeToStats,
    updateStreakInFirestore,
    subscribeToDailyLog,
    updateDailyLog,
    subscribeToHistory,
} from '../services/firebaseService';
import type {
    UserStats,
    DailyLogData,
    EvidenceEntry,
    EvidenceTag,
    PracticeRecord,
    StudyWeekLog,
    StudyPaper,
} from '../services/firebaseService';
import { usePomodoro, type PomodoroState } from '../hooks/usePomodoro';
// Re-exported so existing imports of PomodoroState from this file keep working.
export type { PomodoroState };
import { useEvidenceLog } from '../hooks/useEvidenceLog';
import { usePractice } from '../hooks/usePractice';
import { useStudyPlan } from '../hooks/useStudyPlan';
import { deleteField } from 'firebase/firestore';
import { subDays } from 'date-fns';
import { defaultTasks } from '../data/defaultTasks';
import { MISSION_HABITS, parseRoleTags } from '../data/missionTypes';
import type { Role } from '../data/missionTypes';
import type { Weekday } from '../data/studyPlan';
import { getLondonDateString } from '../utils/date';
import { calculateStreak } from '../utils/streak';

export type Category =
    | 'Personal Background'
    | 'Career Decisions'
    | 'Tech Achievements'
    | 'Problem Solving'
    | 'Leadership'
    | 'Collaboration'
    | 'Failure & Learning'
    | 'Strengths-Based'
    | 'Closing Strategy'
    | 'Company Questions';

export interface Company {
    id: string;
    name: string;
    createdAt: string;
}

export interface Task {
    id: string;
    title: string;
    description: string;
    category: Category;
    completed: boolean;
    createdAt: string;
    companyId?: string;
    tag?: string;
    /** 4-6 short bullets — what you actually recall from, instead of reading. */
    memoryPoints?: string[];
    /** Links this question to one of the six core stories (see coreStories.ts). */
    coreStoryId?: string;
}

export interface DailyHabit {
    id: string;
    title: string;
    completed: boolean;
    note: string;
    /** When set, overrides title-based role detection for tags / why text. */
    roleTags?: Role[];
    createdAt?: string;
}

interface TaskContextType {
    tasks: Task[];
    companies: Company[];
    dailyHabits: DailyHabit[];
    allDailyHabits: DailyHabit[];
    isLoading: boolean;
    // These are async in practice; typed honestly so callers can await them
    // (the content sync applies changes one at a time and needs to).
    addTask: (task: Omit<Task, 'id' | 'completed' | 'createdAt'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => void;
    toggleTaskCompletion: (id: string) => void;
    addCompany: (name: string) => void;
    updateCompany: (id: string, name: string) => void;
    deleteCompany: (id: string) => void;
    getTasksByCategory: (category: Category) => Task[];
    addHabit: (title: string, roleTags?: Role[]) => Promise<void>;
    toggleHabit: (id: string) => void;
    deleteHabit: (id: string) => void;
    updateHabit: (id: string, updates: Partial<DailyHabit>) => void;
    categories: Category[];
    userStats: UserStats;
    isAdmin: boolean;
    verifyAdmin: (code: string) => boolean;
    logoutAdmin: () => void;
    selectedDate: string;
    changeDate: (date: string) => void;
    historyData: { [date: string]: DailyLogData };
    isSidebarCollapsed: boolean;
    toggleSidebar: () => void;
    dsaStreak: number;

    // Evidence Log
    evidenceEntries: EvidenceEntry[];
    todayEvidence: EvidenceEntry | null;
    saveEvidence: (text: string, tag?: EvidenceTag, date?: string) => Promise<void>;
    deleteEvidence: (date: string) => Promise<void>;

    // Practice tracking (Interview Hub)
    practiceRecords: Record<string, PracticeRecord>;
    recordPractice: (questionId: string, confidence: 1 | 2 | 3) => Promise<void>;

    // Study Plan — the 26 weeks
    studyWeekLogs: Record<number, StudyWeekLog>;
    currentWeekNumber: number | null;
    saveWeekLog: (week: number, updates: Partial<Omit<StudyWeekLog, 'week' | 'updatedAt'>>) => Promise<void>;
    saveDeepWorkDay: (week: number, deepWorkDay: Weekday) => Promise<void>;
    getDeepWorkDay: (week: number) => Weekday;
    studyPapers: StudyPaper[];
    savePaper: (paper: Omit<StudyPaper, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
    deletePaper: (id: string) => Promise<void>;
    completedProjectIds: string[];
    toggleProject: (projectId: string) => Promise<void>;

    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;

    // Pomodoro Global State
    pomodoroState: PomodoroState;
    setPomodoroState: React.Dispatch<React.SetStateAction<PomodoroState>>;
    playNotification: () => void;
    isTimerVisible: boolean;
    toggleTimerVisibility: () => void;
}

// Soft lock, not security. It keeps the app private on a shared screen; it does
// not protect the database, because anyone can read a Vite env var out of the
// built bundle. Real protection would need Firebase Auth plus rules that check it.
const ADMIN_CODE = import.meta.env.VITE_ADMIN_CODE ?? '';
const ADMIN_STORAGE_KEY = "is_admin_authenticated";

if (!ADMIN_CODE) {
    console.error(
        '⚠️ VITE_ADMIN_CODE is not set — the app cannot be unlocked. ' +
        'Copy .env.example to .env and set it, then restart the dev server.'
    );
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const ALL_CATEGORIES: Category[] = [
    'Personal Background',
    'Career Decisions',
    'Tech Achievements',
    'Problem Solving',
    'Leadership',
    'Collaboration',
    'Failure & Learning',
    'Strengths-Based',
    'Closing Strategy',
    'Company Questions',
];

// Default habits for new users
const defaultHabits: DailyHabit[] = [
    { id: '5', title: 'Practice 3 behavioral questions', completed: false, note: '' },
    { id: '3', title: 'Learn LangChain and Springboot', completed: false, note: '' },
    { id: '2', title: 'Solve 3 DSA questions', completed: false, note: '' },
];

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [dailyHabits, setDailyHabits] = useState<DailyHabit[]>([]);
    const [userStats, setUserStats] = useState<UserStats>({
        currentStreak: 0,
        longestStreak: 0,
        lastCompletionDate: null
    });
    const [isAdmin, setIsAdmin] = useState<boolean>(() => {
        return localStorage.getItem(ADMIN_STORAGE_KEY) === 'true';
    });

    const [isLoading, setIsLoading] = useState(true);

    // Feature state that owns its own Firestore subscriptions.
    // Each hook is self-contained; the provider only shares them.
    const { evidenceEntries, todayEvidence, saveEvidence, deleteEvidence } = useEvidenceLog();
    const {
        practiceRecords,
        recordPractice,
    } = usePractice();
    const {
        studyWeekLogs,
        currentWeekNumber,
        saveWeekLog,
        saveDeepWorkDay,
        getDeepWorkDay,
        studyPapers,
        savePaper,
        deletePaper,
        completedProjectIds,
        toggleProject,
    } = useStudyPlan();

    // History State
    const [selectedDate, setSelectedDate] = useState(() => getLondonDateString());
    const [currentDailyLog, setCurrentDailyLog] = useState<DailyLogData | null>(null);
    const [historyData, setHistoryData] = useState<{ [date: string]: DailyLogData }>({});

    // Helper to change date
    const changeDate = (date: string) => {
        setSelectedDate(date);
    };

    // Derived State: Merge Definitions + Log
    // Filter habits to only show those created on or before the selected date
    const displayedHabits = dailyHabits
        .filter(habit => {
            // If no createdAt, it's a legacy habit — always show
            if (!habit.createdAt) return true;
            // Only show habit if it was created on or before the selected date
            return habit.createdAt <= selectedDate;
        })
        .map(habit => {
            const logEntry = currentDailyLog?.habits?.[habit.id];
            return {
                ...habit,
                completed: logEntry?.completed ?? false, // Default to false if no log
                note: logEntry?.note ?? '',
            };
        })
        .sort((a, b) => {
            const priority = (title: string): number => {
                const t = title.trim().toLowerCase();
                if (t.includes('light workout') || t.includes('workout')) return 0;
                if (t.includes('meditation') || t.includes('meditat')) return 1;
                if (t.includes('behavioral') || t.includes('behaviour')) return 2;
                if (t.includes('dsa') || t.includes('leetcode') || t.includes('neetcode')) return 3;
                if (t.includes('langchain') || t.includes('spring boot') || t.includes('springboot')) return 4;
                if (t.includes('job reach') || t.includes('linkedin')) return 5;
                if (t.includes('call family') || t.includes('family')) return 6;
                if (t.includes('evening reflection') || t.includes('reflection')) return 100;
                return 50;
            };
            return priority(a.title) - priority(b.title);
        });

    // Track if we've already initialized defaults to prevent duplicate seeding
    const hasSeededTasks = useRef(false);
    const hasSeededHabits = useRef(false);
    const hasSeededMissionHabits = useRef(false);

    // Subscribe to Daily Log when date changes
    useEffect(() => {
        const unsubscribe = subscribeToDailyLog(selectedDate, (log) => {
            setCurrentDailyLog(log);
        });
        return () => unsubscribe();
    }, [selectedDate]);


    // Subscribe to History (Last 365 days)
    useEffect(() => {
        // Calculate start date (365 days ago)
        const startDate = subDays(new Date(), 365).toISOString().split('T')[0];
        const unsubscribe = subscribeToHistory(startDate, (logs) => {
            setHistoryData(logs);
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to Firestore data on mount
    useEffect(() => {
        let tasksLoaded = false;
        let companiesLoaded = false;
        let habitsLoaded = false;
        let statsLoaded = false;

        const checkAllLoaded = () => {
            if (tasksLoaded && companiesLoaded && habitsLoaded && statsLoaded) {
                setIsLoading(false);
            }
        };

        // Subscribe to tasks
        const unsubscribeTasks = subscribeToTasks(async (firestoreTasks) => {
            const mappedTasks: Task[] = firestoreTasks.map(t => ({
                id: t.id!,
                title: t.title,
                description: t.description,
                category: t.category as Category,
                completed: t.completed,
                createdAt: t.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                companyId: t.companyId,
                tag: t.tag,
                memoryPoints: t.memoryPoints,
                coreStoryId: t.coreStoryId,
            }));

            // Seed default tasks if Firestore is empty and we haven't seeded yet
            if (firestoreTasks.length === 0 && !hasSeededTasks.current) {
                hasSeededTasks.current = true;

                try {
                    for (const task of defaultTasks) {
                        const taskData: any = {
                            title: task.title,
                            description: task.description,
                            category: task.category,
                            completed: false,
                        };
                        // Only include companyId if it's defined (Firestore rejects undefined)
                        if (task.companyId) {
                            taskData.companyId = task.companyId;
                        }
                        await addTaskToFirestore(taskData);
                    }

                } catch (error) {
                    console.error('❌ Error seeding tasks:', error);
                    hasSeededTasks.current = false; // Allow retry on error
                }
            } else {
                setTasks(mappedTasks);
            }

            tasksLoaded = true;
            checkAllLoaded();
        });

        // Subscribe to companies
        const unsubscribeCompanies = subscribeToCompanies((firestoreCompanies) => {
            const mappedCompanies: Company[] = firestoreCompanies.map(c => ({
                id: c.id!,
                name: c.name,
                createdAt: c.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
            }));
            setCompanies(mappedCompanies);
            companiesLoaded = true;
            checkAllLoaded();
        });

        // Subscribe to daily habits
        const unsubscribeHabits = subscribeToDailyHabits(async (firestoreHabits) => {
            // Same title (trimmed, case-insensitive): keep oldest doc only; delete extras from Firestore.
            const seenTitleKeys = new Set<string>();
            const duplicateHabitIds: string[] = [];
            for (const h of firestoreHabits) {
                const key = (h.title || '').trim().toLowerCase();
                if (!key) continue;
                if (seenTitleKeys.has(key)) duplicateHabitIds.push(h.id!);
                else seenTitleKeys.add(key);
            }
            if (duplicateHabitIds.length > 0) {
                try {
                    await Promise.all(duplicateHabitIds.map((id) => deleteHabitFromFirestore(id)));
                } catch (err) {
                    console.error('❌ Failed to delete duplicate habits:', err);
                }
            }

            const prunedHabits = firestoreHabits.filter((h) => !duplicateHabitIds.includes(h.id!));

            const mappedHabits: DailyHabit[] = prunedHabits.map(h => ({
                id: h.id!,
                title: h.title,
                completed: h.completed,
                note: h.note || '',
                roleTags: parseRoleTags((h as any).roleTags),
                createdAt: h.createdAt?.toDate?.()?.toLocaleDateString('en-CA', { timeZone: 'Europe/London' }) || undefined,
            }));

            // Seed default habits if Firestore is empty and we haven't seeded yet
            if (firestoreHabits.length === 0 && !hasSeededHabits.current) {
                hasSeededHabits.current = true;

                try {
                    for (const habit of defaultHabits) {
                        await addHabitToFirestore(habit.title);
                    }

                } catch (error) {
                    console.error('❌ Error seeding habits:', error);
                    hasSeededHabits.current = false; // Allow retry on error
                }
            } else {
                setDailyHabits(mappedHabits);

                // One-time seed: add mission habits if they don't exist yet
                if (!hasSeededMissionHabits.current && mappedHabits.length > 0) {
                    hasSeededMissionHabits.current = true;
                    const existingTitlesLower = mappedHabits.map(h => h.title.toLowerCase());
                    for (const mh of MISSION_HABITS) {
                        if (!existingTitlesLower.includes(mh.title.toLowerCase())) {
                            addHabitToFirestore(mh.title).catch(err =>
                                console.error('Failed to seed mission habit:', err)
                            );
                        }
                    }
                }
            }

            habitsLoaded = true;
            checkAllLoaded();
        });

        // Subscribe to stats
        const unsubscribeStats = subscribeToStats((stats) => {
            // Check for broken streak on load/update
            // We use London time to determine "today"
            const londonTodayStr = getLondonDateString();

            if (stats.lastCompletionDate) {
                // Determine if the last completion was yesterday or earlier in London Time
                const lastDate = new Date(stats.lastCompletionDate);
                const todayDate = new Date(londonTodayStr);

                const diffTime = todayDate.getTime() - lastDate.getTime();
                // Use Math.round for day diff
                const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

                // If diff is > 1 (e.g. 2 days ago), streak is broken. 
                if (diffDays > 1 && stats.currentStreak > 0) {

                    updateStreakInFirestore({
                        ...stats,
                        currentStreak: 0
                    });
                }
            }

            setUserStats(stats);
            statsLoaded = true;
            checkAllLoaded();
        });



        // Cleanup subscriptions on unmount
        return () => {
            unsubscribeTasks();
            unsubscribeCompanies();
            unsubscribeHabits();
            unsubscribeStats();
        };
    }, []);

    // Task operations
    const addTask = async (newTask: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
        const taskData: any = {
            title: newTask.title,
            description: newTask.description,
            category: newTask.category,
            completed: false,
        };
        // Only include companyId if it's defined (Firestore rejects undefined)
        if (newTask.companyId) {
            taskData.companyId = newTask.companyId;
        }
        if (newTask.tag) {
            taskData.tag = newTask.tag;
        }
        if (newTask.memoryPoints && newTask.memoryPoints.length > 0) {
            taskData.memoryPoints = newTask.memoryPoints;
        }
        if (newTask.coreStoryId) {
            taskData.coreStoryId = newTask.coreStoryId;
        }
        await addTaskToFirestore(taskData);
    };

    const updateTask = async (id: string, updates: Partial<Task>) => {
        // Exclude createdAt as it should not be updated and has different types
        const { createdAt: _createdAt, ...firestoreUpdates } = updates;
        await updateTaskInFirestore(id, firestoreUpdates);
    };

    const deleteTask = async (id: string) => {
        await deleteTaskFromFirestore(id);
    };

    const toggleTaskCompletion = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (task) {
            await updateTaskInFirestore(id, { completed: !task.completed });
        }
    };

    // Company operations
    const addCompany = async (name: string) => {
        await addCompanyToFirestore(name);
    };

    const updateCompany = async (id: string, name: string) => {
        await updateCompanyInFirestore(id, name);
    };

    const deleteCompany = async (id: string) => {
        // Delete company
        await deleteCompanyFromFirestore(id);
        // Delete associated tasks
        const companyTasks = tasks.filter(t => t.companyId === id);
        for (const task of companyTasks) {
            await deleteTaskFromFirestore(task.id);
        }
    };

    const getTasksByCategory = (category: Category) => {
        return tasks.filter((task) => task.category === category);
    };

    // Habit operations
    const addHabit = async (title: string, roleTags?: Role[]) => {
        await addHabitToFirestore(
            title,
            roleTags && roleTags.length > 0 ? roleTags : undefined
        );
    };

    const toggleHabit = async (id: string) => {
        // Find current status from displayedHabits
        const habit = displayedHabits.find(h => h.id === id);
        if (habit) {
            const newCompleted = !habit.completed;

            // Update the LOG for the selected date
            await updateDailyLog(selectedDate, id, { completed: newCompleted });

            // STREAK LOGIC - ONLY APPLIES TO "TODAY"
            const todayLondonStr = getLondonDateString();
            if (selectedDate !== todayLondonStr) {
                return; // Do not update streaks for past dates
            }

            // Calculate if all habits are completed (using the new state)
            const otherHabits = displayedHabits.filter(h => h.id !== id);
            const allOthersCompleted = otherHabits.every(h => h.completed);

            // If all others were completed, and we just completed this one -> All Completed
            const isAllCompletedNow = allOthersCompleted && newCompleted;

            if (isAllCompletedNow) {
                const todayLondonStr = getLondonDateString(); // YYYY-MM-DD in London

                // Check if already counted for today (London Time)
                if (userStats.lastCompletionDate === todayLondonStr) {
                    // Already counted, do nothing
                } else {
                    // Update streak
                    const newStroke = userStats.currentStreak + 1;
                    await updateStreakInFirestore({
                        currentStreak: newStroke,
                        longestStreak: Math.max(newStroke, userStats.longestStreak),
                        lastCompletionDate: todayLondonStr
                    });
                }
            } else if (!newCompleted) {
                // If we uncheck a habit, check if we previously had "All Completed" TODAY (London Time)
                const todayLondonStr = getLondonDateString();

                if (userStats.lastCompletionDate === todayLondonStr) {
                    // We lose today's streak credit within London timeframe

                    // Get yesterday's date in London
                    const todayDate = new Date(todayLondonStr);
                    todayDate.setDate(todayDate.getDate() - 1);
                    const yesterdayStr = todayDate.toISOString().split('T')[0];

                    // Only decrement if > 0
                    const newStreak = Math.max(0, userStats.currentStreak - 1);

                    await updateStreakInFirestore({
                        ...userStats,
                        currentStreak: newStreak,
                        lastCompletionDate: yesterdayStr // Revert date so we can re-complete today
                    });
                }
            }
        }
    };

    const deleteHabit = async (id: string) => {
        await deleteHabitFromFirestore(id);
    };

    const updateHabit = async (id: string, updates: Partial<DailyHabit>) => {
        // Separate Definition Updates (Title, Schedule) from Log Updates (Note/Completed)

        // Definition-level updates (stored on the habit document itself)
        const definitionUpdates: Record<string, unknown> = {};
        if (updates.title !== undefined) definitionUpdates.title = updates.title;
        if ('roleTags' in updates) {
            definitionUpdates.roleTags =
                updates.roleTags && updates.roleTags.length > 0 ? updates.roleTags : deleteField();
        }

        if (Object.keys(definitionUpdates).length > 0) {
            await updateHabitInFirestore(id, definitionUpdates);
        }

        if (updates.note !== undefined || updates.completed !== undefined) {
            await updateDailyLog(selectedDate, id, {
                note: updates.note,
                completed: updates.completed
            });
        }
    };

    const verifyAdmin = (code: string): boolean => {
        // An unset ADMIN_CODE must never match, or an empty box would unlock it.
        if (ADMIN_CODE && code === ADMIN_CODE) {
            setIsAdmin(true);
            localStorage.setItem(ADMIN_STORAGE_KEY, 'true');
            return true;
        }
        return false;
    };

    const logoutAdmin = () => {
        setIsAdmin(false);
        localStorage.removeItem(ADMIN_STORAGE_KEY);
    };

    // --- UI State ---
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });
    const [isMuted, setIsMuted] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarCollapsed((prev: boolean) => {
            const next = !prev;
            localStorage.setItem('sidebarCollapsed', JSON.stringify(next));
            return next;
        });
    };

    const [isTimerVisible, setIsTimerVisible] = useState<boolean>(() => {
        const saved = localStorage.getItem('timerVisible');
        return saved ? JSON.parse(saved) : true; // default true
    });

    const toggleTimerVisibility = () => {
        setIsTimerVisible((prev: boolean) => {
            const next = !prev;
            localStorage.setItem('timerVisible', JSON.stringify(next));
            return next;
        });
    };

    // --- Global Pomodoro Timer ---
    // Lives in its own hook; shared from here so the timer keeps running
    // while you move between pages.
    const {
        pomodoroState,
        setPomodoroState,
        playNotification,
        showNotification,
        closeNotification,
    } = usePomodoro();

    // Calculate DSA Streak dynamically based on history.
    // The walk itself now lives in utils/streak.ts, where it can be tested.
    const dsaStreak = React.useMemo(() => {
        const dsaHabit = dailyHabits.find(h => h.title.toLowerCase().includes('dsa'));
        if (!dsaHabit) return 0;

        return calculateStreak(historyData, dsaHabit.id, getLondonDateString());
    }, [historyData, dailyHabits]);

    return (
        <TaskContext.Provider
            value={{
                tasks,
                companies,
                dailyHabits: displayedHabits, // Expose the merged list
                allDailyHabits: dailyHabits, // Expose the raw list
                isLoading,
                addTask,
                updateTask,
                deleteTask,
                toggleTaskCompletion,
                addCompany,
                updateCompany,
                deleteCompany,
                getTasksByCategory,
                addHabit,
                toggleHabit,
                deleteHabit,
                updateHabit,
                categories: ALL_CATEGORIES,
                userStats,
                isAdmin,
                verifyAdmin,
                logoutAdmin,
                selectedDate,
                changeDate,
                historyData,
                isSidebarCollapsed,
                toggleSidebar,
                dsaStreak,
                evidenceEntries,
                todayEvidence,
                saveEvidence,
                deleteEvidence,
                practiceRecords,
                recordPractice,
                studyWeekLogs,
                currentWeekNumber,
                saveWeekLog,
                saveDeepWorkDay,
                getDeepWorkDay,
                studyPapers,
                savePaper,
                deletePaper,
                completedProjectIds,
                toggleProject,
                isMuted,
                setIsMuted,
                pomodoroState,
                setPomodoroState,
                playNotification,
                isTimerVisible,
                toggleTimerVisibility,
            }}
        >
            {children}
            <Snackbar
                open={showNotification}
                autoHideDuration={8000}
                onClose={closeNotification}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ mt: 6 }}
            >
                <Alert
                    onClose={closeNotification}
                    severity="success"
                    variant="filled"
                    sx={{
                        width: '100%',
                        fontSize: '1rem',
                        alignItems: 'center',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                        '& .MuiAlert-action .MuiIconButton-root': {
                            outline: 'none !important',
                        },
                        '& .MuiAlert-action .MuiIconButton-root:focus': {
                            outline: 'none',
                        },
                        '& .MuiAlert-action .MuiIconButton-root.Mui-focusVisible': {
                            outline: 'none',
                            boxShadow: 'none',
                        }
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        {pomodoroState.selectedPreset === 2 ? "Break completed!" : "Pomodoro session completed!"}
                    </Box>
                </Alert>
            </Snackbar>
        </TaskContext.Provider>
    );
};

export const useTaskContext = () => {
    const context = useContext(TaskContext);
    if (!context) {
        throw new Error('useTaskContext must be used within a TaskProvider');
    }
    return context;
};
