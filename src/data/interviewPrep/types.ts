// Interview questions for the study pages (ML Foundations, SQL, System Design,
// DSA), with answers to compare yours against.
//
// The lessons teach one idea at a time; these are the questions an interviewer
// asks across them, many of them "it broke, what do you do?" scenarios. Every
// question names the lessons its answer is built on (topicIds), so you can go
// back and learn the part you couldn't explain. A test checks every id exists.
//
// Fixed content only, never synced to Firestore: these are not Interview Hub
// questions and don't count towards its readiness numbers.

export type InterviewLevel = 'beginner' | 'intermediate' | 'advanced';

export const INTERVIEW_LEVELS: InterviewLevel[] = ['beginner', 'intermediate', 'advanced'];

export const INTERVIEW_LEVEL_LABELS: Record<InterviewLevel, string> = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
};

export interface InterviewFollowUp {
    q: string;
    a: string;
}

export interface InterviewQuestion {
    /** Stable id, unique across every set. */
    id: string;
    q: string;
    level: InterviewLevel;
    /** "What is…" and "why…" questions, or "it broke, what do you do?" ones. */
    kind: 'concept' | 'scenario';
    /** What the interviewer is really checking with this question. */
    testing: string;
    /** The answer to say out loud, in about 30 to 60 seconds. */
    answer: string;
    /** The same idea in everyday words, for when it doesn't click yet. */
    analogy: string;
    diagram?: { code: string; caption: string };
    /** Scenarios: what to check, in order, and how to prove the cause. Concepts: the answer's parts, in order. */
    steps?: string[];
    /** What turns a good answer into a strong one. */
    strong: string[];
    /** What weak answers say. */
    traps: string[];
    followUps: InterviewFollowUp[];
    /** The lessons the answer is built on, in the order to revise them. */
    topicIds: string[];
}

export interface InterviewSet {
    id: string;
    title: string;
    /** One line: what this set covers. */
    blurb: string;
    questions: InterviewQuestion[];
}
