// The 26-week study plan — 17 Aug 2026 to 14 Feb 2027.
//
// This is the content of Study_Tracker.xlsx, moved into the app so the plan
// lives where the work already happens. Everything here is fixed: the schedule,
// the resources, the reasoning. What changes week to week (hours logged, papers
// read, projects finished) lives in Firestore — see firebaseService.ts.
//
// Two tracks run in parallel:
//   A — research depth (mornings + Sunday): maths, theory, papers, reproduction
//   B — engineering + DSA (evenings + weekends): LLM systems, RAG, evals, LeetCode

export const PLAN_START_DATE = '2026-08-17'; // Monday of week 1
export const PLAN_END_DATE = '2027-02-14';   // Sunday of week 26
export const PLAN_WEEKS = 26;

/** Hours a normal week asks for. The week's sessions add up to this. */
export const FULL_WEEK_TARGET_HOURS = 24;
/** Consolidation and holiday weeks are deliberately lighter. */
export const LIGHT_WEEK_TARGET_HOURS = 10;

// ============ START HERE — the strategy before the schedule ============

export const workPattern =
    'Six days on, one or two off — and which days move. Mark them each week and the plan reshapes itself.';

export interface Track {
    id: 'A' | 'B';
    name: string;
    when: string;
    what: string;
}

export const tracks: Track[] = [
    {
        id: 'A',
        name: 'Research depth',
        when: 'mornings + Sunday',
        what: 'Maths, theory, papers, reproduction. This is what gets you a PhD place.',
    },
    {
        id: 'B',
        name: 'Engineering + DSA',
        when: 'evenings + weekends',
        what: 'LLM systems, RAG, evals, deployment, LeetCode. This is what gets you an AI job in the UK.',
    },
];

export const whyBothTracks =
    'An AI engineering job in the UK would pay 2-3x your current wage, give you real ML systems ' +
    'experience, possibly sponsor a Skilled Worker visa past 2028, and make your PhD application far ' +
    'stronger. Track B is not a backup plan - it is the thing that funds and strengthens Track A.';

export interface Asymmetry {
    title: string;
    detail: string;
}

/** The honest answer to "how do I get 90% ahead": there is no trick, but there are six of these. */
export const asymmetries: Asymmetry[] = [
    {
        title: 'Build from scratch',
        detail:
            '99% of people import a library. Almost nobody writes autograd, a transformer, or a tokeniser ' +
            'themselves. Doing it once puts you ahead of most MSc graduates permanently.',
    },
    {
        title: 'Reproduce papers',
        detail:
            'Most people read abstracts. Very few implement a paper and match its numbers. This is the ' +
            'single most convincing thing on a PhD application.',
    },
    {
        title: 'Publish everything publicly',
        detail:
            'GitHub, blog, arXiv. Most people learn privately and have nothing to show. Your public work ' +
            'IS your reputation before you have a reputation.',
    },
    {
        title: 'Foundations over tools',
        detail:
            'Frameworks die every 18 months. Linear algebra, probability and optimisation do not. People ' +
            'chasing the newest framework are permanently 6 months behind; people who know the maths read ' +
            'a new paper and understand it the same day.',
    },
    {
        title: 'Learn evaluation',
        detail:
            'Nearly every senior AI engineering job asks for eval pipelines, golden datasets, LLM-as-judge. ' +
            'Almost nobody learns it because it is unglamorous. This is the biggest gap in the market right now.',
    },
    {
        title: 'Consistency',
        detail:
            'Most people quit by week 8. If you are still going in February, you are already ahead of 90% ' +
            'of the people who started with you. This is genuinely the whole secret.',
    },
];

export interface LearningStep {
    step: 'WATCH' | 'READ' | 'BUILD';
    detail: string;
}

/** Every topic in the plan follows the same three steps, in this order. */
export const learningSteps: LearningStep[] = [
    { step: 'WATCH', detail: 'Get the intuition from video first. No note-taking, just understand the shape of it.' },
    { step: 'READ', detail: 'The book chapter or article. Now the formal version makes sense because you have the picture.' },
    { step: 'BUILD', detail: 'Implement it yourself, from nothing. This is where it becomes yours.' },
];

export const neverSkipBuild =
    'Never skip BUILD. Watching and reading feel like learning but they are not. If you cannot ' +
    'implement it, you do not know it.';

export const timeBudgetNote =
    'This is a lot on top of a 6-day job. If it becomes crushing, cut the Sunday session first, then ' +
    'the Saturday session. Protect the mornings and the daily DSA above everything - those two are the ' +
    'habits that carry the whole plan.';

// ============ THE WEEK — sessions, not fixed days ============
//
// The original plan hard-coded Friday as the day off. In practice the days off
// move: sometimes Thursday, sometimes Friday, sometimes two of them, and it is
// not known in advance. So the week is defined as a set of sessions instead,
// and utils/studySchedule.ts lays them onto whichever days are actually free.

export type Weekday = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun';

export const WEEKDAYS: Weekday[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WEEKDAY_NAMES: Record<Weekday, string> = {
    Mon: 'Monday',
    Tue: 'Tuesday',
    Wed: 'Wednesday',
    Thu: 'Thursday',
    Fri: 'Friday',
    Sat: 'Saturday',
    Sun: 'Sunday',
};

export type SessionKind = 'deep' | 'theory' | 'aieng' | 'papers' | 'dsa' | 'rest';

export interface SessionTemplate {
    kind: SessionKind;
    label: string;
    hours: number;
    /** Relative, not clock-fixed — the day it lands on changes week to week. */
    when: string;
    what: string;
    why: string;
    color: string;
}

export const sessionTemplates: Record<SessionKind, SessionTemplate> = {
    deep: {
        kind: 'deep',
        label: 'DEEP WORK',
        hours: 5,
        when: 'Your day off · roughly 09:00-15:00',
        what: 'Building things from scratch. The most valuable five hours of your week.',
        why: 'Your one full day — this is the anchor the whole plan hangs on',
        color: '#ff8a65',
    },
    theory: {
        kind: 'theory',
        label: 'THEORY',
        hours: 2,
        when: 'Morning, before work · 06:30-08:30',
        what: 'Maths and theory. WATCH the video, then READ, then work problems.',
        why: 'Your brain is freshest before the shift, and never after it',
        color: '#66bb6a',
    },
    aieng: {
        kind: 'aieng',
        label: 'AI ENGINEERING',
        hours: 3.5,
        when: 'Afternoon, after the short shift',
        what: 'LLM systems, RAG, evals, deployment. Project work.',
        why: 'Track B — the half that pays and funds the rest',
        color: '#ffd54f',
    },
    papers: {
        kind: 'papers',
        label: 'PAPERS + REVIEW',
        hours: 3,
        when: 'Afternoon',
        what: 'Read papers, review the week, fill in the log, plan the next one.',
        why: 'Consolidation beats new material',
        color: '#b39ddb',
    },
    dsa: {
        kind: 'dsa',
        label: 'DSA',
        hours: 0.75,
        when: 'Evening · 45 minutes',
        what: '1 NeetCode problem. Watch the video AFTER you have tried it.',
        why: 'Puzzles work fine on a tired brain — this is the habit that proves consistency',
        color: '#4a90e2',
    },
    rest: {
        kind: 'rest',
        label: 'REST',
        hours: 0,
        when: 'After the deep work block',
        what: 'Nothing. Stop completely.',
        why: 'No rest and you quit by week 8',
        color: '#90a4ae',
    },
};

export const routineRules: string[] = [
    'Mornings are for theory. Never move it to the evening - you will be too tired and you will quit.',
    'DSA every single day, no exceptions. 45 minutes. This is the habit that proves you are consistent.',
    'Your day off is deep work, 09:00-15:00, and then you STOP. Whichever day it lands on, it is sacred.',
    'Every 4th week is CONSOLIDATION. No new material. Catch up, review, rest.',
    'Write 10 minutes in English daily about what you learned. Fixes writing AND understanding together.',
    'Miss a day? SKIP it. Never double up. Doubling up is how plans die.',
];

// ============ THE 26 WEEKS ============

/** Drives the colour each week is shown in — the phase bands from the sheet. */
export type PhaseKey =
    | 'foundations'
    | 'probability'
    | 'transformers'
    | 'reproduction'
    | 'original'
    | 'publish'
    | 'consolidation'
    | 'lighter'
    | 'review';

export interface PlanWeek {
    week: number;
    /** Human label from the sheet, e.g. '31 Aug-6 Sep'. */
    dates: string;
    /** Monday, ISO. Derived date maths uses this, never the label. */
    startDate: string;
    /** Sunday, ISO. */
    endDate: string;
    phase: string;
    phaseKey: PhaseKey;
    targetHours: number;
    /** Track A — the morning theory sessions: WATCH -> READ -> BUILD. */
    theory: string;
    /** The five-hour deep work block, on whichever day turns out to be off. */
    deepWork: string;
    /** The 3.5-hour Track B session. */
    aiEng: string;
    /** The daily NeetCode target for the week. */
    dsa: string;
    milestone?: string;
}

const LIGHT = LIGHT_WEEK_TARGET_HOURS;
const FULL = FULL_WEEK_TARGET_HOURS;

export const planWeeks: PlanWeek[] = [
    {
        week: 1, dates: '17-23 Aug', startDate: '2026-08-17', endDate: '2026-08-23',
        phase: 'PHASE 1: Foundations + Autograd', phaseKey: 'foundations', targetHours: FULL,
        theory: "WATCH 3Blue1Brown 'Essence of Linear Algebra' (full series). READ Deisenroth Ch 2. BUILD: matrix ops in NumPy by hand.",
        deepWork: 'Karpathy Video 1 - build MICROGRAD from nothing. Type every line.',
        aiEng: "WATCH Karpathy 'Intro to LLMs' (1hr). Set up GitHub, Colab, Overleaf, W&B accounts.",
        dsa: 'Arrays & Hashing (1-5)', milestone: 'GitHub set up + first commit',
    },
    {
        week: 2, dates: '24-30 Aug', startDate: '2026-08-24', endDate: '2026-08-30',
        phase: 'PHASE 1: Foundations + Autograd', phaseKey: 'foundations', targetHours: FULL,
        theory: "WATCH 3B1B 'Essence of Calculus'. READ Deisenroth Ch 3-4 (geometry, SVD). BUILD: implement SVD-based PCA yourself.",
        deepWork: 'Finish micrograd. EXTEND it: add tanh, exp, and one operation of your own design.',
        aiEng: 'HuggingFace LLM Course Ch 1-2. Run your first local model.',
        dsa: 'Arrays & Hashing (6-9)',
    },
    {
        week: 3, dates: '31 Aug-6 Sep', startDate: '2026-08-31', endDate: '2026-09-06',
        phase: 'PHASE 1: Foundations + Autograd', phaseKey: 'foundations', targetHours: FULL,
        theory: "WATCH 3B1B 'Neural Networks' series. READ Deisenroth Ch 5 (vector calculus). BUILD: derive backprop for 2-layer MLP ON PAPER.",
        deepWork: 'Karpathy Video 2 - makemore 1 (bigrams). Then rewrite it in pure NumPy.',
        aiEng: 'HuggingFace LLM Course Ch 3. Fine-tune a small model on Colab.',
        dsa: 'Two Pointers (all 5)',
    },
    {
        week: 4, dates: '7-13 Sep', startDate: '2026-09-07', endDate: '2026-09-13',
        phase: '*** CONSOLIDATION WEEK ***', phaseKey: 'consolidation', targetHours: LIGHT,
        theory: 'No new theory. Review Weeks 1-3. Redo the problems you got wrong.',
        deepWork: "WRITE + PUBLISH: 'Building an autograd engine from scratch' blog post.",
        aiEng: 'Clean up GitHub. Proper READMEs. Make repos look professional.',
        dsa: 'Review + redo weak problems', milestone: 'OUTPUT: repo + blog post',
    },
    {
        week: 5, dates: '14-20 Sep', startDate: '2026-09-14', endDate: '2026-09-20',
        phase: 'PHASE 2: Probability + Sequence Models', phaseKey: 'probability', targetHours: FULL,
        theory: 'WATCH Harvard Stat 110 Lec 1-8 (Blitzstein). READ Murphy Book 1 Ch 2. BUILD: simulate every distribution in NumPy.',
        deepWork: 'Karpathy Video 3-4 - makemore 2-3 (MLP, activations, BatchNorm internals).',
        aiEng: 'Build a simple RAG system: LangChain + a vector DB + your own documents.',
        dsa: 'Sliding Window (all 6)',
    },
    {
        week: 6, dates: '21-27 Sep', startDate: '2026-09-21', endDate: '2026-09-27',
        phase: 'PHASE 2: Probability + Sequence Models', phaseKey: 'probability', targetHours: FULL,
        theory: 'WATCH Stat 110 Lec 9-16. READ Murphy Ch 3-4. BUILD: implement MLE and Bayesian inference by hand.',
        deepWork: 'Karpathy Video 5 - makemore 4 (manual backprop through EVERYTHING).',
        aiEng: 'Add EVALUATION to your RAG: golden dataset, retrieval metrics, LLM-as-judge. Most people skip this - do not.',
        dsa: 'Stack (all 7)', milestone: 'Eval skills = biggest market gap',
    },
    {
        week: 7, dates: '28 Sep-4 Oct', startDate: '2026-09-28', endDate: '2026-10-04',
        phase: 'PHASE 2: Probability + Sequence Models', phaseKey: 'probability', targetHours: FULL,
        theory: 'WATCH MacKay lectures (Cambridge, on YouTube). READ MacKay Ch 1-4 (entropy, KL). BUILD: VAE from scratch on MNIST - derive ELBO on paper FIRST.',
        deepWork: 'Karpathy Video 6 - makemore 5 (WaveNet).',
        aiEng: 'Deploy your RAG: FastAPI + Docker + a cloud host. Make it public.',
        dsa: 'Binary Search (all 7)',
    },
    {
        week: 8, dates: '5-11 Oct', startDate: '2026-10-05', endDate: '2026-10-11',
        phase: '*** CONSOLIDATION WEEK ***', phaseKey: 'consolidation', targetHours: LIGHT,
        theory: 'Review Phases 1-2.',
        deepWork: 'Publish VAE + LaTeX derivation write-up (learn Overleaf now).',
        aiEng: '*** DECIDE YOUR SUBFIELD *** and commit. Interpretability / efficient inference / RLHF / reasoning / multimodal / diffusion.',
        dsa: 'Review + redo weak problems', milestone: 'OUTPUT: VAE + subfield chosen',
    },
    {
        week: 9, dates: '12-18 Oct', startDate: '2026-10-12', endDate: '2026-10-18',
        phase: 'PHASE 3: Transformers + Learning Theory', phaseKey: 'transformers', targetHours: FULL,
        theory: "WATCH Stanford CS336 Lec 1-3 (free on YouTube). READ 'The Annotated Transformer'. BUILD: tokeniser (BPE) from scratch.",
        deepWork: "Karpathy Video 7 - 'Let's build GPT from scratch'.",
        aiEng: 'HuggingFace Agents Course. Build an agent with real tool use.',
        dsa: 'Linked List (1-6)', milestone: 'Papers now ALL in your subfield',
    },
    {
        week: 10, dates: '19-25 Oct', startDate: '2026-10-19', endDate: '2026-10-25',
        phase: 'PHASE 3: Transformers + Learning Theory', phaseKey: 'transformers', targetHours: FULL,
        theory: 'WATCH CS336 Lec 4-6. READ Shalev-Shwartz Ch 2-6 (PAC learning, VC dimension). BUILD: implement a PAC bound empirically.',
        deepWork: 'Train your GPT on a real dataset. Get it genuinely working.',
        aiEng: 'Add evals + failure-mode analysis to your agent. Document what breaks.',
        dsa: 'Linked List (7-11)',
    },
    {
        week: 11, dates: '26 Oct-1 Nov', startDate: '2026-10-26', endDate: '2026-11-01',
        phase: 'PHASE 3: Transformers + Learning Theory', phaseKey: 'transformers', targetHours: FULL,
        theory: 'WATCH CS336 Lec 7-9. READ Shalev-Shwartz Ch 7-13 (generalisation bounds). BUILD: reproduce a double-descent curve yourself.',
        deepWork: "Karpathy - 'Let's reproduce GPT-2 (124M)'.",
        aiEng: 'WATCH CS336 systems lectures. Learn Flash Attention, KV cache, quantisation.',
        dsa: 'Trees (1-8)',
    },
    {
        week: 12, dates: '2-8 Nov', startDate: '2026-11-02', endDate: '2026-11-08',
        phase: '*** CONSOLIDATION WEEK ***', phaseKey: 'consolidation', targetHours: LIGHT,
        theory: 'Review Phase 3.',
        deepWork: '*** EMAIL YOUR MSc SUPERVISOR *** Plan + GitHub links + ask for guidance and collaboration.',
        aiEng: 'Start your literature review doc. Every paper from now goes in with YOUR notes.',
        dsa: 'Trees (9-15)', milestone: '** THE MOST IMPORTANT WEEK **',
    },
    {
        week: 13, dates: '9-15 Nov', startDate: '2026-11-09', endDate: '2026-11-15',
        phase: 'PHASE 4: Reproduction + TOEFL', phaseKey: 'reproduction', targetHours: FULL,
        theory: 'SWITCH: TOEFL prep 2h/day. Official ETS + TST Prep YouTube. Focus WRITING and SPEAKING.',
        deepWork: 'CHOOSE your reproduction paper. Recent, your subfield, runs on free GPU.',
        aiEng: 'Read the paper 5 times. Write every equation by hand.',
        dsa: 'Tries (3) + Heap (1-3)', milestone: 'TOEFL prep starts',
    },
    {
        week: 14, dates: '16-22 Nov', startDate: '2026-11-16', endDate: '2026-11-22',
        phase: 'PHASE 4: Reproduction + TOEFL', phaseKey: 'reproduction', targetHours: FULL,
        theory: 'TOEFL. Writing daily - this is your weakest area and the most fixable.',
        deepWork: 'BUILD the reproduction. Get it running end-to-end, even badly.',
        aiEng: 'Continue building. Log every experiment in W&B.',
        dsa: 'Heap (4-7)',
    },
    {
        week: 15, dates: '23-29 Nov', startDate: '2026-11-23', endDate: '2026-11-29',
        phase: 'PHASE 4: Reproduction + TOEFL', phaseKey: 'reproduction', targetHours: FULL,
        theory: 'TOEFL. *** BOOK YOUR EXAM for mid-January *** Booking makes it real.',
        deepWork: 'DEBUG until your numbers match the paper. This is where real learning happens.',
        aiEng: 'vLLM + quantisation. Serve a model efficiently. Measure latency and cost.',
        dsa: 'Backtracking (1-5)', milestone: 'TOEFL booked',
    },
    {
        week: 16, dates: '30 Nov-6 Dec', startDate: '2026-11-30', endDate: '2026-12-06',
        phase: '*** CONSOLIDATION WEEK ***', phaseKey: 'consolidation', targetHours: LIGHT,
        theory: 'Light TOEFL only. Rest.',
        deepWork: 'Write the README properly: what matched, what did not, and WHY.',
        aiEng: 'Rest. You have done 4 months - protect yourself.',
        dsa: 'Backtracking (6-9)', milestone: 'OUTPUT: working reproduction',
    },
    {
        week: 17, dates: '7-13 Dec', startDate: '2026-12-07', endDate: '2026-12-13',
        phase: 'PHASE 5: Original Contribution', phaseKey: 'original', targetHours: FULL,
        theory: 'TOEFL (1h) + newest arXiv in your subfield (1h).',
        deepWork: 'FIND YOUR EXTENSION: an ablation nobody ran, a failure mode, a simpler method, or a clean negative result.',
        aiEng: 'Build project 3: a reusable evaluation pipeline. This is the most hireable skill you can show.',
        dsa: 'Graphs (1-6)',
    },
    {
        week: 18, dates: '14-20 Dec', startDate: '2026-12-14', endDate: '2026-12-20',
        phase: 'PHASE 5: Original Contribution', phaseKey: 'original', targetHours: FULL,
        theory: 'TOEFL.',
        deepWork: 'RUN EXPERIMENTS. Log everything. Track every seed.',
        aiEng: 'Continue eval pipeline.',
        dsa: 'Graphs (7-13)',
    },
    {
        week: 19, dates: '21-27 Dec', startDate: '2026-12-21', endDate: '2026-12-27',
        phase: 'LIGHTER WEEK (Christmas)', phaseKey: 'lighter', targetHours: LIGHT,
        theory: 'TOEFL only. Call your family properly.',
        deepWork: 'Light work or rest.',
        aiEng: 'Write up results AS YOU GO. Never leave writing until the end.',
        dsa: 'Advanced Graphs (1-3)',
    },
    {
        week: 20, dates: '28 Dec-3 Jan', startDate: '2026-12-28', endDate: '2027-01-03',
        phase: '*** CONSOLIDATION WEEK ***', phaseKey: 'consolidation', targetHours: LIGHT,
        theory: 'Review the whole 5 months.',
        deepWork: 'Finish experiments. Draft in NeurIPS/ICML LaTeX template.',
        aiEng: 'Update CV and LinkedIn with all three projects.',
        dsa: 'Advanced Graphs (4-6)', milestone: 'OUTPUT: original result + draft',
    },
    {
        week: 21, dates: '4-10 Jan', startDate: '2027-01-04', endDate: '2027-01-10',
        phase: 'PHASE 6: Publish, Test, Apply', phaseKey: 'publish', targetHours: FULL,
        theory: 'FINAL TOEFL PREP.',
        deepWork: 'Polish write-up. Send to your MSc supervisor for feedback.',
        aiEng: '*** START APPLYING FOR AI ENGINEER JOBS IN THE UK *** You now have 3 real projects.',
        dsa: '1-D DP (1-6)',
    },
    {
        week: 22, dates: '11-17 Jan', startDate: '2027-01-11', endDate: '2027-01-17',
        phase: 'PHASE 6: Publish, Test, Apply', phaseKey: 'publish', targetHours: FULL,
        theory: '*** TOEFL EXAM ***',
        deepWork: 'PUBLISH: arXiv preprint (supervisor endorses) or detailed technical blog + GitHub.',
        aiEng: 'Job applications. Mock interviews. Your DSA is now 22 weeks strong.',
        dsa: '1-D DP (7-12)', milestone: 'OUTPUT: TOEFL + published work',
    },
    {
        week: 23, dates: '18-24 Jan', startDate: '2027-01-18', endDate: '2027-01-24',
        phase: 'PHASE 6: Publish, Test, Apply', phaseKey: 'publish', targetHours: FULL,
        theory: 'Build professor list: 25-30 names, their recent papers, funding, availability.',
        deepWork: 'Read 3 papers from each of your top 10 professors.',
        aiEng: 'Job applications continue.',
        dsa: '2-D DP (1-6)',
    },
    {
        week: 24, dates: '25-31 Jan', startDate: '2027-01-25', endDate: '2027-01-31',
        phase: 'PHASE 6: Publish, Test, Apply', phaseKey: 'publish', targetHours: FULL,
        theory: 'Draft Statement of Purpose.',
        deepWork: 'EMAIL PROFESSORS - 5 per week, each personalised. Never generic.',
        aiEng: 'Interviews. System design practice.',
        dsa: '2-D DP (7-11)', milestone: 'Outreach begins',
    },
    {
        week: 25, dates: '1-7 Feb', startDate: '2027-02-01', endDate: '2027-02-07',
        phase: 'PHASE 6: Publish, Test, Apply', phaseKey: 'publish', targetHours: FULL,
        theory: 'Refine SoP. Get it edited by a native speaker.',
        deepWork: '5 more professor emails.',
        aiEng: '*** REQUEST RECOMMENDATION LETTERS *** Give 3 months notice minimum.',
        dsa: 'Greedy (all 8)',
    },
    {
        week: 26, dates: '8-14 Feb', startDate: '2027-02-08', endDate: '2027-02-14',
        phase: 'REVIEW + PLAN NEXT PHASE', phaseKey: 'review', targetHours: FULL,
        theory: 'Honest review of all 6 months. What worked, what did not.',
        deepWork: 'Plan next 6 months: GRE if needed, second project, Dec 2027 applications.',
        aiEng: 'Rest. You have earned it.',
        dsa: 'Intervals (6) + Bit Manip', milestone: 'OUTPUT: SoP + letters requested',
    },
];

/** Phase accent colours — the sheet's colour bands, redrawn for a dark background. */
export const PHASE_COLORS: Record<PhaseKey, string> = {
    foundations: '#66bb6a',
    probability: '#ffca28',
    transformers: '#ff8a65',
    reproduction: '#b39ddb',
    original: '#4db6ac',
    publish: '#ffd54f',
    consolidation: '#90a4ae',
    lighter: '#90a4ae',
    review: '#64b5f6',
};

// ============ DSA — NeetCode 150, by pattern ============

export interface DSAPatternPlan {
    /** Matches a topic id in dsaCurriculum.ts, so the two stay in sync. */
    topicId: string;
    name: string;
    /** Which weeks of the plan this pattern belongs to. */
    weeks: string;
    why: string;
    /** Backtracking and both DP categories — the ones almost everybody is weak at. */
    weakSpot?: boolean;
}

export const dsaPatterns: DSAPatternPlan[] = [
    { topicId: 'arrays-hashing', name: 'Arrays & Hashing', weeks: '1-2', why: 'Foundation. Hash maps solve 30% of all problems.' },
    { topicId: 'two-pointers', name: 'Two Pointers', weeks: '3', why: 'Sorted arrays, palindromes. Very common.' },
    { topicId: 'sliding-window', name: 'Sliding Window', weeks: '4', why: 'Substrings, subarrays. Appears constantly.' },
    { topicId: 'stack', name: 'Stack', weeks: '5', why: 'Parentheses, monotonic stack, histogram problems.' },
    { topicId: 'binary-search', name: 'Binary Search', weeks: '6', why: 'Not just sorted arrays - search on ANSWER space.' },
    { topicId: 'linked-list', name: 'Linked List', weeks: '7-8', why: 'Pointer manipulation. Fast/slow pointer technique.' },
    { topicId: 'trees', name: 'Trees', weeks: '9-12', why: 'Biggest single category. DFS, BFS, recursion.' },
    { topicId: 'tries', name: 'Tries', weeks: '13', why: 'Prefix problems. Small but appears in real interviews.' },
    { topicId: 'heap-priority-queue', name: 'Heap / Priority Queue', weeks: '13', why: 'Top-K problems, median of stream, scheduling.' },
    { topicId: 'backtracking', name: 'Backtracking', weeks: '15-16', why: 'Permutations, subsets. Most people are WEAK here.', weakSpot: true },
    { topicId: 'graphs', name: 'Graphs', weeks: '17-18', why: 'BFS/DFS on grids and adjacency lists. Very common.' },
    { topicId: 'advanced-graphs', name: 'Advanced Graphs', weeks: '19-20', why: 'Dijkstra, MST, topological sort.' },
    { topicId: '1-d-dynamic-programming', name: '1-D Dynamic Programming', weeks: '21-22', why: 'The hardest category. Do 10 and it clicks.', weakSpot: true },
    { topicId: '2-d-dynamic-programming', name: '2-D Dynamic Programming', weeks: '23-24', why: 'Grids, edit distance, knapsack.', weakSpot: true },
    { topicId: 'greedy', name: 'Greedy', weeks: '25', why: 'Interval scheduling, jump game.' },
    { topicId: 'intervals', name: 'Intervals', weeks: '26', why: 'Merge, insert, meeting rooms.' },
    { topicId: 'math-geometry', name: 'Math & Geometry', weeks: '26', why: 'Matrix rotation, spiral, happy number.' },
    { topicId: 'bit-manipulation', name: 'Bit Manipulation', weeks: '26', why: 'XOR tricks, counting bits.' },
];

/** The method matters more than the problem count. */
export const dsaMethod: string[] = [
    'Try alone for 20 min.',
    "If stuck, watch NeetCode's video.",
    'Close it and code from memory.',
    'Write the PATTERN name in your notes.',
    'Redo it 1 week later.',
];

export const dsaMethodNote = 'Pattern recognition is the skill - problem count is not.';

export const dsaWeakSpotNote =
    'The two categories where almost everyone is weak: BACKTRACKING and DYNAMIC PROGRAMMING. Both feel ' +
    'impossible until you have done 10 problems, then they click. Do not skip them - that is exactly why ' +
    'most candidates fail.';

// ============ RESOURCES — watch, then read, then build ============

export type ResourceTrack = 'A - Theory' | 'B - AI Eng' | 'B - DSA' | 'Both';

export interface Resource {
    track: ResourceTrack;
    topic: string;
    watch: string;
    read: string;
    build: string;
    /** Canonical home for the topic — the course page, book site or repo. */
    url?: string;
}

export const resources: Resource[] = [
    { track: 'A - Theory', topic: 'Linear Algebra', watch: "3Blue1Brown 'Essence of Linear Algebra' (YouTube) | MIT 18.06 Strang", read: 'Maths for ML (Deisenroth) Ch 2-4  -  mml-book.github.io', build: 'Implement PCA + SVD in NumPy', url: 'https://mml-book.github.io/' },
    { track: 'A - Theory', topic: 'Calculus / Backprop', watch: "3Blue1Brown 'Essence of Calculus' + 'Neural Networks' series", read: 'Deisenroth Ch 5', build: 'Derive backprop on paper, then in NumPy', url: 'https://www.3blue1brown.com/topics/calculus' },
    { track: 'A - Theory', topic: 'Probability', watch: 'Harvard Stat 110 (Blitzstein) - full course on YouTube', read: "Murphy 'Probabilistic ML: Intro' Ch 2-4  -  probml.github.io", build: 'Simulate every distribution yourself', url: 'https://projects.iq.harvard.edu/stat110' },
    { track: 'A - Theory', topic: 'Information Theory', watch: "David MacKay's Cambridge lectures (YouTube)", read: 'MacKay Ch 1-4  -  inference.org.uk/mackay/itila', build: 'Implement entropy, KL, cross-entropy', url: 'https://www.inference.org.uk/mackay/itila/' },
    { track: 'A - Theory', topic: 'Optimisation', watch: 'Stanford EE364A (Boyd) lectures on YouTube', read: "Boyd 'Convex Optimization'  -  stanford.edu/~boyd/cvxbook", build: 'Implement SGD, Adam from scratch', url: 'https://web.stanford.edu/~boyd/cvxbook/' },
    { track: 'A - Theory', topic: 'Learning Theory', watch: 'Shalev-Shwartz lectures / Cornell CS4780 (Kilian Weinberger)', read: "'Understanding Machine Learning' Ch 2-13", build: 'Reproduce a double-descent curve', url: 'https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/' },
    { track: 'A - Theory', topic: 'Deep Learning', watch: "Karpathy 'Neural Networks: Zero to Hero' - THE most important series", read: "Bishop 'Deep Learning: Foundations & Concepts' (bishopbook.com)", build: 'micrograd, makemore, nanoGPT', url: 'https://karpathy.ai/zero-to-hero.html' },
    { track: 'A - Theory', topic: 'Transformers', watch: "Stanford CS336 'Language Modeling from Scratch' (free on YouTube)", read: "'The Annotated Transformer' - nlp.seas.harvard.edu", build: 'Build tokeniser + transformer from nothing', url: 'https://stanford-cs336.github.io/' },
    { track: 'A - Theory', topic: 'Your subfield', watch: 'Yannic Kilcher paper reviews | conference talks on YouTube', read: "Lilian Weng's blog (lilianweng.github.io) - best surveys anywhere", build: 'Reproduce one paper end to end', url: 'https://lilianweng.github.io/' },
    { track: 'B - AI Eng', topic: 'LLM Fundamentals', watch: "Karpathy 'Intro to Large Language Models' + '3h LLM deep dive'", read: 'HuggingFace LLM Course - huggingface.co/learn', build: 'Run + fine-tune a local model', url: 'https://huggingface.co/learn/llm-course' },
    { track: 'B - AI Eng', topic: 'AI Engineering', watch: 'MIT 6.S191 (introtodeeplearning.com) | DeepLearning.AI short courses', read: "Chip Huyen 'AI Engineering' (2025) - the standard text", build: '3 portfolio projects (see Projects)', url: 'https://introtodeeplearning.com/' },
    { track: 'B - AI Eng', topic: 'RAG', watch: 'LangChain / LlamaIndex official YouTube tutorials', read: 'LangChain docs + Pinecone learning centre', build: 'Build RAG over your own documents', url: 'https://python.langchain.com/docs/introduction/' },
    { track: 'B - AI Eng', topic: 'Agents', watch: 'HuggingFace Agents Course (free, hands-on)', read: "Anthropic 'Building Effective Agents' | LangGraph docs", build: 'Agent with tools + failure analysis', url: 'https://huggingface.co/learn/agents-course' },
    { track: 'B - AI Eng', topic: 'EVALUATION', watch: "DeepLearning.AI eval courses | Hamel Husain's talks", read: "Hamel Husain's blog (hamel.dev) - best eval writing online", build: 'Golden dataset + LLM-as-judge pipeline', url: 'https://hamel.dev/' },
    { track: 'B - AI Eng', topic: 'Serving / Systems', watch: 'CS336 systems lectures | vLLM official talks', read: "vLLM docs | 'Efficient LLM Inference' surveys", build: 'Deploy with vLLM + quantisation, measure cost', url: 'https://docs.vllm.ai/' },
    { track: 'B - AI Eng', topic: 'MLOps', watch: 'Full Stack Deep Learning (fullstackdeeplearning.com)', read: 'Made With ML (madewithml.com)', build: 'FastAPI + Docker + cloud deploy', url: 'https://madewithml.com/' },
    { track: 'B - DSA', topic: 'Patterns + practice', watch: 'NeetCode YouTube - video for all 150 problems', read: 'Tech Interview Handbook - techinterviewhandbook.org', build: 'neetcode.io/practice - 1 problem daily', url: 'https://neetcode.io/practice' },
    { track: 'B - DSA', topic: 'Python fluency', watch: 'Corey Schafer Python series (YouTube)', read: 'Fluent Python (Ramalho) - if you want real depth', build: 'Rewrite your old code more cleanly', url: 'https://www.youtube.com/@coreyms' },
    { track: 'Both', topic: 'TOEFL', watch: 'TST Prep (YouTube) | official ETS videos', read: 'ETS Official Guide', build: 'Write 1 essay per week from Month 4', url: 'https://www.ets.org/toefl.html' },
    { track: 'Both', topic: 'LaTeX / writing', watch: 'Overleaf official tutorials (YouTube)', read: "Overleaf docs | 'The Elements of Style'", build: 'Write every project up in LaTeX', url: 'https://www.overleaf.com/learn' },
    { track: 'Both', topic: 'Papers', watch: 'Yannic Kilcher | AI Coffee Break | conference talks', read: 'arxiv.org | paperswithcode.com | connectedpapers.com', build: '3-pass method - see the Papers Log', url: 'https://www.connectedpapers.com/' },
    { track: 'Both', topic: 'Community', watch: '-', read: '-', build: 'Fast.ai Discord | EleutherAI Discord | Leeds/Manchester ML meetups', url: 'https://www.fast.ai/' },
];

// ============ PROJECTS — what you will actually have to show in February ============

/** The sheet colour-codes these: orange = matters most for a PhD, yellow = matters most for a job. */
export type ProjectWeight = 'phd' | 'job' | null;

export interface PlanProject {
    id: string;
    number: number;
    name: string;
    /** Week number it is due by, so it can be checked against where you actually are. */
    byWeek: number;
    proves: string;
    where: string;
    weight: ProjectWeight;
}

export const projects: PlanProject[] = [
    { id: 'autograd', number: 1, name: 'Autograd engine from scratch', byWeek: 4, proves: 'You understand backprop at the level of the machine, not the API', where: 'GitHub + blog post', weight: null },
    { id: 'vae', number: 2, name: 'VAE from scratch + LaTeX derivation', byWeek: 8, proves: 'You can go from maths on paper to working code', where: 'GitHub + write-up', weight: null },
    { id: 'gpt', number: 3, name: 'GPT built from nothing (tokeniser -> trained model)', byWeek: 12, proves: 'You understand transformers completely. Very few people can do this.', where: 'GitHub', weight: null },
    { id: 'rag', number: 4, name: 'RAG system with real evaluation', byWeek: 7, proves: 'Production AI engineering + the eval skill nobody has', where: 'GitHub + deployed URL', weight: 'job' },
    { id: 'agent', number: 5, name: 'Agent with tool use + failure-mode analysis', byWeek: 10, proves: 'You can build AND critique AI systems', where: 'GitHub + blog post', weight: 'job' },
    { id: 'eval-pipeline', number: 6, name: 'Reusable evaluation pipeline', byWeek: 18, proves: 'The single most in-demand AI engineering skill in 2026', where: 'GitHub', weight: 'job' },
    { id: 'reproduction', number: 7, name: 'Paper reproduction matching published numbers', byWeek: 16, proves: 'THE strongest PhD application artifact', where: 'GitHub + write-up', weight: 'phd' },
    { id: 'extension', number: 8, name: 'Original extension of that paper', byWeek: 20, proves: 'You can do research, not just follow it', where: 'arXiv or technical blog', weight: 'phd' },
    { id: 'dsa-150', number: 9, name: '150 DSA problems, pattern-organised', byWeek: 26, proves: 'You can pass any technical interview', where: 'Your own notes repo', weight: null },
];

export const projectsNote =
    'Nine public artifacts in six months. Almost nobody applying alongside you will have this.';

export const PROJECT_WEIGHT_LABELS: Record<'phd' | 'job', string> = {
    phd: 'Matters most for the PhD',
    job: 'Matters most for the job',
};

export const PROJECT_WEIGHT_COLORS: Record<'phd' | 'job', string> = {
    phd: '#ff8a65',
    job: '#ffd54f',
};

// ============ PAPERS — 2-3 per week, ~60 over six months ============

export const PAPERS_PER_WEEK_TARGET = 2.5;

export interface PaperPass {
    pass: 1 | 2 | 3;
    time: string;
    what: string;
}

export const paperPasses: PaperPass[] = [
    { pass: 1, time: '10 min', what: 'Abstract, figures, conclusion.' },
    { pass: 2, time: '1 hr', what: 'Full read, skip proofs.' },
    { pass: 3, time: '4+ hrs', what: 're-derive every equation - do this on ONE paper per month.' },
];
