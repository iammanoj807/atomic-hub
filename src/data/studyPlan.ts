// The 52-week study plan — 31 Aug 2026 to 29 Aug 2027.
//
// This is the content of Study_Tracker.xlsx, moved into the app so the plan
// lives where the work already happens. Everything here is fixed: the schedule,
// the resources, the reasoning. What changes week to week (hours logged, papers
// read, projects finished) lives in Firestore — see firebaseService.ts.
//
// Two tracks run in parallel:
//   A — research depth (mornings + Sunday): maths, theory, papers, reproduction
//   B — engineering + DSA (evenings + weekends): LLM systems, RAG, evals, LeetCode

export const PLAN_START_DATE = '2026-08-31'; // Monday of week 1
export const PLAN_END_DATE = '2027-08-29';   // Sunday of week 52
export const PLAN_WEEKS = 52;

/** Hours a normal week asks for. The routine below adds up to exactly this. */
export const FULL_WEEK_TARGET_HOURS = 26;
/** Consolidation and holiday weeks are deliberately lighter. */
export const LIGHT_WEEK_TARGET_HOURS = 12;

// ============ START HERE — the strategy before the schedule ============

export const workPattern =
    'Shifts 10:00-18:00 Mon, Tue, Wed, Fri. 10:00-14:00 Sat and Sun. ' +
    'Thursday off. Weekend shifts end at 14:00, so Saturday and Sunday ' +
    'afternoons are the second and third best blocks of the week after ' +
    'Thursday - they are not tired evening time.';

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
    'This is a lot on top of shift work. If it becomes crushing, cut the Saturday papers hour first, ' +
    'then the Saturday project session. Protect the mornings, the daily DSA and the daily applications ' +
    'above everything - those are the habits that carry the whole plan.';

// ============ THE WEEK — a fixed routine on a moving day off ============
//
// The plan was written around a Friday day off; the real rota gives Thursday.
// So the six ordinary days are fixed and only the deep work block travels —
// see utils/studySchedule.ts, which lays it onto whichever day is off.
//
// Two habits are never displaced by anything: the daily NeetCode problem and
// the half hour of applications after it. A broken chain costs more than a
// missed hour, so every day carries both whatever else happens to it.

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

/**
 * Each day has one job, and naming it is what stops the daily "so what am I
 * actually doing today". The names describe the day's centre of gravity, not
 * its only slot — every day still carries DSA and applications.
 */
export const DAY_TITLES: Record<Weekday, string> = {
    Mon: 'Watch day',
    Tue: 'Read day',
    Wed: 'Build day',
    Thu: 'Deep work day',
    Fri: 'Ship day',
    Sat: 'Project day',
    Sun: 'Light day',
};

/**
 * What a slot is, for logic. `track` below is what it is called on screen.
 * 'read', 'dsa' and 'job' are the ones that survive being displaced.
 */
export type SlotKind =
    | 'theory'
    | 'aieng'
    | 'papers'
    | 'read'
    | 'systems'
    | 'dsa'
    | 'job'
    | 'light'
    | 'build'
    | 'review';

export interface RoutineSlot {
    kind: SlotKind;
    /** 'HH:MM', 24-hour. Kept as start/end rather than one label so the
     *  nothing-after-21:00 rule can actually be checked instead of trusted. */
    start: string;
    end: string;
    hours: number;
    /** The track label from the plan — Track A is research, Track B is the job half. */
    track: string;
    what: string;
    color: string;
}

/** Nothing may end after this. A 06:00 start needs a 22:30 bedtime. */
export const LATEST_END_TIME = '21:00';

const SLOT_COLORS: Record<SlotKind, string> = {
    theory: '#66bb6a',
    aieng: '#ffd54f',
    papers: '#b39ddb',
    read: '#81c784',
    // Not named in the spec; indigo keeps it apart from the DSA blue beside it.
    systems: '#7986cb',
    dsa: '#4a90e2',
    job: '#4dd0e1',
    light: '#90a4ae',
    build: '#ff8a65',
    review: '#f06292',
};

const slot = (
    kind: SlotKind,
    start: string,
    end: string,
    hours: number,
    track: string,
    what: string
): RoutineSlot => ({ kind, start, end, hours, track, what, color: SLOT_COLORS[kind] });

const readSlot = () =>
    slot('read', '19:30', '19:50', 0.33, 'A - Reading', 'Daily reading ladder');

const dsaSlot = (what = 'One NeetCode problem') =>
    slot('dsa', '19:50', '20:05', 0.25, 'B - DSA', what);

const jobSlot = () =>
    slot('job', '20:05', '20:35', 0.5, 'B - Job', 'Applications and outreach');

/**
 * The four shift days are identical, so they are built rather than repeated:
 * the stage before work, then the evening ladder — read, one problem, twenty
 * minutes of Chip Huyen, twenty of DDIA.
 */
const shiftDay = (): RoutineSlot[] => [
    slot('theory', '06:00', '08:30', 2.5, 'A - Theory', 'Stage material - watch, read, build'),
    readSlot(),
    dsaSlot('One NeetCode problem (Python)'),
    slot('aieng', '20:05', '20:25', 0.33, 'B - AI Eng', 'Chip Huyen, AI Engineering'),
    slot('systems', '20:25', '20:45', 0.33, 'A - Systems', 'Designing Data-Intensive Applications'),
];

/**
 * The week as the rota actually gives it. Thursday holds only the habits here
 * because the six hours of build arrive from deepWorkSlots below — that is what
 * lets the day off move when the rota changes, without the artifact moving too.
 *
 * Saturday and Sunday start in the afternoon on purpose: the weekend shift ends
 * at 14:00, so those are real blocks rather than leftover evening.
 */
export const dailyRoutine: Record<Weekday, RoutineSlot[]> = {
    Mon: shiftDay(),
    Tue: shiftDay(),
    Wed: shiftDay(),
    Thu: [readSlot(), dsaSlot(), jobSlot()],
    Fri: shiftDay(),
    Sat: [
        slot('aieng', '16:00', '18:30', 2.5, 'B - AI Eng', 'Fruit paper with supervisor, then job project'),
        slot('papers', '18:30', '19:30', 1.0, 'A - Papers', 'Deep read - the one long read of the week'),
        readSlot(),
        dsaSlot(),
        jobSlot(),
    ],
    Sun: [
        slot('theory', '16:30', '18:30', 2.0, 'A - Theory', 'Stage catch-up, or breadth topic on even weeks'),
        slot('light', '18:30', '19:30', 1.0, 'A - Light', 'Review the week. Redo what you got wrong.'),
        readSlot(),
        dsaSlot(),
    ],
};

/** The block that travels to the day off. Everything else stays where it is. */
export const deepWorkSlots: RoutineSlot[] = [
    slot('build', '09:00', '15:00', 6.0, 'A + B - Build', 'Build the artifact'),
    slot('review', '15:00', '15:15', 0.25, 'Review', 'Weekly review ritual'),
];

export const LIGHT_DAY_NOTE =
    'Re-read the week\'s notes and redo the problems you got wrong. Never new material.';

export const routineRules: string[] = [
    'Mornings are for the stage. 06:00-08:30, before anything can take them.',
    'Thursday 09:00-15:00 is the artifact. Six hours. Then you STOP.',
    'Saturday and Sunday afternoons are real blocks - the shift ends at 14:00.',
    'Twenty minutes of reading every single day. Never skipped, never doubled.',
    'Nothing ends after 21:00. A 06:00 wake needs a 22:30 bedtime.',
    'Miss a day? SKIP it. Never double up. Doubling up is how plans die.',
    'Never skip BUILD. If you cannot implement it, you do not know it.',
    'Fail a gate? Repeat the stage. A stage passed by reading is not passed.',
    'Bad week? Give back Sunday afternoon first - before mornings, before Thursday.',
    'Everything is Python. DSA, theory, artifacts, kernels (Triton), profiling. ' +
        'No C++ anywhere in this plan. If C++ is ever needed during a PhD, ' +
        'learn it then, against a real problem.',
];


/**
 * Theory runs the whole plan now — there is no week where the mornings stop
 * belonging to the stage. Kept as a number because the UI still asks how many
 * theory weeks are left, and consolidation weeks are not counted.
 */
export const THEORY_TRACK_LAST_WEEK = 52;

// ============ THE 52 WEEKS ============

/** Drives the colour each week is shown in — one per part, plus consolidation. */
export type PhaseKey =
    | 'foundations'
    | 'deeplearning'
    | 'languagemodels'
    | 'generative'
    | 'systems'
    | 'research'
    | 'consolidation';

/** Phase accent colours, redrawn for a dark background. */
export const PHASE_COLORS: Record<PhaseKey, string> = {
    foundations: '#66bb6a',
    deeplearning: '#ff8a65',
    languagemodels: '#4db6ac',
    generative: '#b39ddb',
    systems: '#ffca28',
    research: '#64b5f6',
    consolidation: '#90a4ae',
};

// ============ READING — twenty minutes a day, one ladder ============

export interface ReadingLevel {
    weeks: string;
    level: 'blogs' | 'classics' | 'modern' | 'frontier' | 'subfield';
    what: string;
    items: string[];
}

export const readingLadder: ReadingLevel[] = [
    {
        weeks: '1-9',
        level: 'blogs',
        what: 'No arXiv yet. Textbook sections and expository writing. Papers are unreadable until you can build - reading them now teaches vocabulary, not understanding.',
        items: [
            'Deisenroth, Mathematics for ML - one section daily',
            'Murphy, Probabilistic ML Intro - one section daily',
            'distill.pub - Why Momentum Really Works',
            'Chris Olah - Calculus on Computational Graphs, Understanding LSTMs',
            'Lilian Weng - lilianweng.github.io, any post',
            'Sebastian Ruder - An Overview of Gradient Descent Optimization',
        ],
    },
    {
        weeks: '10-21',
        level: 'classics',
        what: 'First real papers. Old, short, legible now that you have the maths.',
        items: [
            'Srivastava et al. - Dropout (2014)',
            'Kingma & Ba - Adam (2014)',
            'Ioffe & Szegedy - Batch Normalization (2015)',
            'Glorot & Bengio - Xavier initialisation (2010)',
            'He et al. - He initialisation / PReLU (2015)',
            'Krizhevsky et al. - AlexNet (2012)',
            'He et al. - ResNet (2015)',
            'Ba et al. - Layer Normalization (2016)',
            'Hinton et al. - Distilling the Knowledge in a Neural Network (2015)',
            'Cortes & Vapnik - Support-Vector Networks (1995)',
            'Breiman - Random Forests (2001)',
        ],
    },
    {
        weeks: '22-35',
        level: 'modern',
        what: 'The papers your subfield assumes you already know.',
        items: [
            'Zhang et al. - Rethinking generalization (2017)',
            'Frankle & Carbin - The Lottery Ticket Hypothesis (2019)',
            'Nakkiran et al. - Deep Double Descent (2019)',
            'Vaswani et al. - Attention Is All You Need (2017)',
            'Dosovitskiy et al. - ViT (2021)',
            'Liu et al. - Swin Transformer (2021)',
            'Radford et al. - GPT-2 (2019)',
            'Hoffmann et al. - Chinchilla scaling laws (2022)',
            'Su et al. - RoFormer / RoPE (2021)',
            'Hu et al. - LoRA (2021)',
            'Ouyang et al. - InstructGPT (2022)',
            'Rafailov et al. - DPO (2023)',
        ],
    },
    {
        weeks: '36-46',
        level: 'frontier',
        what: 'Current work in efficiency and systems.',
        items: [
            'Ho et al. - DDPM (2020)',
            'Schulman et al. - PPO (2017)',
            'Gu & Dao - Mamba (2023)',
            'Dao et al. - FlashAttention (2022), then FlashAttention-2',
            'Kwon et al. - PagedAttention / vLLM (SOSP 2023)',
            'Dettmers et al. - LLM.int8() (2022), then QLoRA',
            'Frantar et al. - GPTQ (2023)',
            'Xiao et al. - SmoothQuant (ICML 2023)',
            'Lin et al. - AWQ (MLSys 2024)',
            'Xiao et al. - StreamingLLM (2023)',
            'Leviathan et al. - Speculative Decoding (2023)',
            'Chen et al. - TVM (OSDI 2018)',
        ],
    },
    {
        weeks: '47-52',
        level: 'subfield',
        what: 'You now find your own. Ten researchers, three venues. Scholar alerts do the work.',
        items: [
            'MLSys proceedings - sweep the last two years cover to cover',
            'OSDI / SOSP / ASPLOS - ML systems tracks',
            'NeurIPS / ICML / ICLR - efficiency tracks only',
            'Scholar alerts: Song Han, Tianqi Chen, Zhihao Jia, Beidi Chen, Tri Dao, Joseph Gonzalez, Chris De Sa, Hao Zhang, Minjia Zhang, Xupeng Miao',
        ],
    },
];

export const READING_METHOD = [
    'Twenty minutes. One item. Never more, never doubled up.',
    'Saturday 18:30 is the one deep read of the week - a full hour, three-pass method.',
    'Every entry ends with: WHAT WOULD I DO NEXT? Asked 300 times over a year, that question is where research taste comes from - and it is what your statement of purpose has to answer in 2028.',
];

/** First and last week of a ladder level, parsed once from its `weeks` label. */
const ladderRange = (level: ReadingLevel): [number, number] => {
    const [from, to] = level.weeks.split('-').map(Number);
    return [from, to];
};

/**
 * The ladder item for a week. Levels usually have fewer items than weeks, so
 * the list cycles rather than running out — in ladder order either way.
 */
export const readingForWeek = (week: number): string => {
    const level =
        readingLadder.find(l => {
            const [from, to] = ladderRange(l);
            return week >= from && week <= to;
        }) ?? readingLadder[readingLadder.length - 1];
    const [from] = ladderRange(level);
    return level.items[(week - from) % level.items.length];
};

/** The ladder level a week sits on, for colouring and filtering. */
export const readingLevelForWeek = (week: number): ReadingLevel['level'] =>
    (readingLadder.find(l => {
        const [from, to] = ladderRange(l);
        return week >= from && week <= to;
    }) ?? readingLadder[readingLadder.length - 1]).level;

// ============ STAGES — the spine the weeks hang off ============

export interface PlanStage {
    stage: number;
    name: string;
    part: string;
    phaseKey: PhaseKey;
    /** First and last week, inclusive. Consolidation weeks sit outside these. */
    from: number;
    to: number;
    /** Asked on the last week of the stage. Passing it is the only way on. */
    gate: string;
}

export const PLAN_PARTS = [
    'PART ONE - FOUNDATIONS',
    'PART TWO - DEEP LEARNING',
    'PART THREE - LANGUAGE MODELS',
    'PART FOUR - GENERATIVE AND SYSTEMS',
    'PART FIVE - RESEARCHER',
] as const;

const [P_ONE, P_TWO, P_THREE, P_FOUR, P_FIVE] = PLAN_PARTS;

export const planStages: PlanStage[] = [
    { stage: 0, name: 'Mathematical foundations', part: P_ONE, phaseKey: 'foundations', from: 1, to: 3, gate: 'Derive the gradient of x-transpose-A-x with respect to x, on paper.' },
    { stage: 1, name: 'The first learning algorithm', part: P_ONE, phaseKey: 'foundations', from: 4, to: 4, gate: 'Explain why least squares is a projection onto a column space.' },
    { stage: 2, name: 'Classification and probability', part: P_ONE, phaseKey: 'foundations', from: 5, to: 6, gate: 'Derive dL/dz for softmax + cross-entropy. No notes.' },
    { stage: 3, name: 'Why models fail', part: P_ONE, phaseKey: 'foundations', from: 8, to: 9, gate: 'Given a model with 99% accuracy, list four reasons it may be worthless.' },
    { stage: 4, name: 'The classical zoo', part: P_ONE, phaseKey: 'foundations', from: 10, to: 12, gate: 'Implement k-means and EM for a GMM from scratch.' },
    { stage: 5, name: 'Optimisation properly', part: P_ONE, phaseKey: 'foundations', from: 13, to: 14, gate: 'Explain what Adam is estimating and when it fails.' },
    { stage: 6, name: 'Neural networks from nothing', part: P_TWO, phaseKey: 'deeplearning', from: 16, to: 18, gate: 'Whiteboard backprop for a 2-layer MLP, no notes. THE gate.' },
    { stage: 7, name: 'Making deep networks train', part: P_TWO, phaseKey: 'deeplearning', from: 19, to: 21, gate: 'Manual backprop through makemore, every operation.' },
    { stage: 8, name: 'Learning theory', part: P_TWO, phaseKey: 'deeplearning', from: 23, to: 24, gate: 'Reproduce a double-descent curve on your own machine.' },
    { stage: 9, name: 'Architectures', part: P_TWO, phaseKey: 'deeplearning', from: 25, to: 27, gate: 'Implement attention in NumPy before using PyTorch.' },
    { stage: 10, name: 'Building a language model', part: P_THREE, phaseKey: 'languagemodels', from: 29, to: 32, gate: 'A GPT you built from nothing, trained, generating text.' },
    { stage: 11, name: 'How LLMs are actually made', part: P_THREE, phaseKey: 'languagemodels', from: 33, to: 35, gate: 'Fine-tune with LoRA. Explain what LoRA changes and why it works.' },
    { stage: 12, name: 'Generative models and RL', part: P_FOUR, phaseKey: 'generative', from: 37, to: 39, gate: 'Derive the ELBO on paper before writing the VAE.' },
    { stage: 13, name: 'GPUs and kernels (Python)', part: P_FOUR, phaseKey: 'systems', from: 40, to: 42, gate: 'Write a fused softmax kernel in Triton. Beat the naive version.' },
    { stage: 14, name: 'Efficiency', part: P_FOUR, phaseKey: 'systems', from: 44, to: 46, gate: 'Quantise your own GPT to INT8 by hand. Measure the tradeoff.' },
    { stage: 15, name: 'Systems at scale', part: P_FOUR, phaseKey: 'systems', from: 47, to: 49, gate: 'Profile vLLM serving your model. Explain where the time goes.' },
    { stage: 16, name: 'Research craft and the wider field', part: P_FIVE, phaseKey: 'research', from: 51, to: 52, gate: 'Your extension written up in NeurIPS format, supervisor-reviewed.' },
];

/**
 * The seven review weeks, in order. Each one belongs to the stage it has just
 * finished — it is that stage's review, so it carries that stage's number and
 * its gate stays the one you are being held to.
 */
const CONSOLIDATION_WEEKS: Record<number, number> = {
    7: 1, 15: 2, 22: 3, 28: 4, 36: 5, 43: 6, 50: 7,
};

export const stageForWeek = (week: number): PlanStage => {
    const exact = planStages.find(s => week >= s.from && week <= s.to);
    if (exact) return exact;
    // A consolidation week reviews whatever came immediately before it.
    const previous = [...planStages].reverse().find(s => s.to < week);
    return previous ?? planStages[0];
};

export interface PlanWeek {
    week: number;
    /** Human label, e.g. '31 Aug-6 Sep'. Derived, never hand-typed. */
    dates: string;
    /** Monday, ISO. Derived date maths uses this, never the label. */
    startDate: string;
    /** Sunday, ISO. */
    endDate: string;
    phase: string;
    phaseKey: PhaseKey;
    targetHours: number;
    /** Which stage this week belongs to; consolidation weeks review the last one. */
    stage: number;
    stageName: string;
    part: string;
    /** Set only on the last week of a stage. No gate, no progress. */
    gate?: string;
    /** The day's reading ladder item for this week. */
    reading: string;
    /** Track A — the morning sessions: WATCH -> READ -> BUILD. */
    theory: string;
    /** The six-hour deep work block, on whichever day turns out to be off. */
    deepWork: string;
    /** The Saturday afternoon Track B session. */
    aiEng: string;
    /** The daily NeetCode target for the week. */
    dsa: string;
    milestone?: string;
}

const LIGHT = LIGHT_WEEK_TARGET_HOURS;
const FULL = FULL_WEEK_TARGET_HOURS;

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const isoOf = (date: Date): string => date.toISOString().slice(0, 10);

/**
 * Week N starts PLAN_START_DATE + (N-1)*7 days. Computed rather than typed out
 * because 104 hand-written dates is 104 chances to be one day wrong, and the
 * whole app's date maths hangs off these.
 */
const datesForWeek = (week: number) => {
    const start = new Date(`${PLAN_START_DATE}T00:00:00Z`);
    start.setUTCDate(start.getUTCDate() + (week - 1) * 7);
    const end = new Date(start.getTime() + 6 * DAY_MS);
    const startMonth = MONTHS[start.getUTCMonth()];
    const endMonth = MONTHS[end.getUTCMonth()];
    const label =
        startMonth === endMonth
            ? `${start.getUTCDate()}-${end.getUTCDate()} ${endMonth}`
            : `${start.getUTCDate()} ${startMonth}-${end.getUTCDate()} ${endMonth}`;
    return { dates: label, startDate: isoOf(start), endDate: isoOf(end) };
};

/** What the week actually asks of you. Everything else on PlanWeek is derived. */
interface WeekContent {
    theory: string;
    deepWork: string;
    aiEng: string;
    dsa: string;
    milestone?: string;
}

const CONSOLIDATION_CONTENT = (n: number, stage: PlanStage): WeekContent => ({
    theory: `CONSOLIDATION ${n}. No new material. Re-read the notes from stage ${stage.stage} and redo every problem you got wrong.`,
    deepWork: 'Finish the artifact you are carrying: WRITE the README, PUBLISH the repo, POST the write-up. The half others see.',
    aiEng: 'Catch up on whatever slipped. If nothing slipped, rest properly - that is the point of the week.',
    dsa: 'Redo the problems you failed first time. No new problems.',
});

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
    { topicId: 'heap-priority-queue', name: 'Heap / Priority Queue', weeks: '13-14', why: 'Top-K problems, median of stream, scheduling.' },
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

/**
 * Saturday afternoon belongs to one thing at a time. The fruit paper owns it
 * until it is submitted, because that is the artifact with a letter attached;
 * after that it is the job portfolio, then the reproduction.
 */
const AI_ENG_BLOCKS: { to: number; what: string }[] = [
    { to: 20, what: 'Fruit detection paper with your supervisor. This owns Saturdays until it is submitted - it is the only artifact that comes with a recommendation letter.' },
    { to: 26, what: 'RAG system and its evaluation harness. Golden dataset, LLM-as-judge, numbers you would defend.' },
    { to: 32, what: 'Job portfolio: an agent with tools, and an honest write-up of how it fails.' },
    { to: 39, what: 'Reusable evaluation pipeline. The single most in-demand engineering skill you can show.' },
    { to: 46, what: 'Paper reproduction. Choose it, build it, debug until your numbers match the published ones.' },
    { to: 52, what: 'Your original extension: experiments, seeds, ablations, and the write-up.' },
];

const aiEngForWeek = (week: number): string =>
    (AI_ENG_BLOCKS.find(b => week <= b.to) ?? AI_ENG_BLOCKS[AI_ENG_BLOCKS.length - 1]).what;

/**
 * NeetCode 150 by pattern over the first 26 weeks, then the same ladder again
 * without the videos. A pattern you can only solve with the hint is a pattern
 * you have not learned, and the second pass is where that shows up.
 */
const patternNamesForWeek = (week: number): string =>
    dsaPatterns
        .filter(p => {
            const [from, to] = p.weeks.split('-').map(Number);
            return week >= from && week <= (to ?? from);
        })
        .map(p => p.name)
        .join(', ');

const dsaForWeek = (week: number): string => {
    if (week <= 26) {
        const names = patternNamesForWeek(week);
        return names ? `${names}. One problem a day, the NeetCode method.` : 'One problem a day, the NeetCode method.';
    }
    const names = patternNamesForWeek(week - 26);
    return names
        ? `SECOND PASS: ${names}. Fifteen minutes, no video, no notes. If you cannot, mark it and come back.`
        : 'SECOND PASS. Fifteen minutes, no video, no notes.';
};

/**
 * Stage content for weeks 1-39 was written here rather than lifted from
 * the-full-curriculum.md, which is not in this repo — see the note in the
 * README. Stages 13-16 are the specified text, verbatim.
 */
const WEEK_CONTENT: Record<number, Pick<WeekContent, 'theory' | 'deepWork'> & { milestone?: string }> = {
    1: {
        theory: "WATCH 3Blue1Brown 'Essence of Linear Algebra', the whole series. READ Deisenroth Ch 2. BUILD: matrix multiply, transpose and inverse in NumPy by hand - no np.linalg.",
        deepWork: 'Set the year up: repo, environment, the notebook habit. Then implement Gaussian elimination and solve Ax=b yourself.',
    },
    2: {
        theory: 'READ Deisenroth Ch 3-4: norms, inner products, orthogonality, eigendecomposition, SVD. BUILD: PCA from the SVD, on real data, no sklearn.',
        deepWork: 'PCA end to end. Reconstruct images at k components and plot the error curve. Explain the elbow.',
    },
    3: {
        theory: "WATCH 3B1B 'Essence of Calculus'. READ Deisenroth Ch 5 - vector calculus, Jacobians, the chain rule in matrix form. BUILD: derive gradients, then check them numerically.",
        deepWork: 'Matrix calculus drills on paper until the identities are automatic. Verify every one numerically in NumPy.',
    },
    4: {
        theory: 'READ Deisenroth Ch 9 - linear regression. The normal equations, and why the solution is a projection. BUILD: least squares three ways - normal equations, QR, gradient descent.',
        deepWork: 'Linear regression from nothing. Plot the residual orthogonal to the column space until the projection is obvious.',
    },
    5: {
        theory: 'WATCH Harvard Stat 110 Lec 1-8. READ Murphy Ch 2 - probability, distributions, expectation. BUILD: simulate every distribution in NumPy and check the moments.',
        deepWork: 'Logistic regression from scratch with gradient descent. Derive the gradient on paper first.',
    },
    6: {
        theory: 'WATCH Stat 110 Lec 9-16. READ Murphy Ch 3-4 - MLE, MAP, Bayes. BUILD: softmax regression on MNIST, deriving dL/dz yourself before you write it.',
        deepWork: 'A multiclass classifier from nothing. No autograd, no framework - your own backward pass.',
    },
    8: {
        theory: 'READ Murphy Ch 5 - decision theory, bias and variance. BUILD: plot train and test error against capacity and find the overfitting point yourself.',
        deepWork: 'Build a deliberately leaking evaluation, then catch the leak. Write down exactly how you caught it.',
    },
    9: {
        theory: 'Class imbalance, base rates, and why accuracy lies. READ the precision/recall/ROC material in Murphy. BUILD: one model, scored four different ways.',
        deepWork: 'Cross-validation properly: nested CV, and a held-out set you touch exactly once.',
    },
    10: {
        theory: 'READ Murphy Ch 18 - trees, bagging, boosting. BUILD: a decision tree from scratch, then a random forest over it.',
        deepWork: 'Implement gradient boosting on your own trees. Compare against the forest and explain the difference.',
    },
    11: {
        theory: 'SVMs and kernels. READ Murphy Ch 17 and the Cortes & Vapnik paper. BUILD: the dual, the kernel trick, an SVM on data that is not separable.',
        deepWork: 'Implement an SVM with SMO. Then show the same decision boundary from the kernel view.',
    },
    12: {
        theory: 'Unsupervised learning: k-means, mixture models, EM. READ Murphy Ch 21. BUILD: both, from scratch, no library.',
        deepWork: 'k-means and EM for a GMM, written by you. Show EM improving the likelihood every step.',
    },
    13: {
        theory: 'READ Boyd Ch 1-5. Convexity, duality, KKT. WATCH Stanford EE364A. BUILD: gradient descent on a convex problem, then on one that is not.',
        deepWork: 'Implement line search and see what a badly conditioned problem does to plain gradient descent.',
    },
    14: {
        theory: 'SGD, momentum, RMSProp, Adam. READ the Adam paper and the Ruder overview. BUILD: implement all four and race them on the same problem.',
        deepWork: 'Reproduce distill.pub Why Momentum Really Works. Then find a case where Adam is worse than SGD.',
    },
    16: {
        theory: 'WATCH Karpathy Zero to Hero video 1. READ Bishop Ch 6. BUILD: micrograd, typing every line yourself.',
        deepWork: 'Karpathy Video 1 - build MICROGRAD from nothing. Type every line.',
    },
    17: {
        theory: 'Backprop as reverse-mode autodiff. READ Chris Olah, Calculus on Computational Graphs. BUILD: extend micrograd with tanh, exp, and one operation of your own design.',
        deepWork: 'Finish micrograd. Put a real MLP on top of it and train the thing.',
    },
    18: {
        theory: 'Whiteboard drill: backprop through a 2-layer MLP, no notes, until it is automatic. This is the gate that everything after assumes.',
        deepWork: 'ARTIFACT 1: the autograd engine. BUILD is done - now WRITE, PUBLISH and POST it.',
        milestone: '** ARTIFACT 1 DUE - autograd engine **',
    },
    19: {
        theory: 'WATCH Karpathy video 2-3. Initialisation: Xavier and He, and what actually goes wrong without them. BUILD: makemore, bigram then MLP.',
        deepWork: 'makemore in pure NumPy. Watch the activation histograms and fix them by hand.',
    },
    20: {
        theory: 'BatchNorm and LayerNorm - what each one normalises, and why the placement matters. READ both papers.',
        deepWork: 'ARTIFACT 2: the fruit detection paper. Finish it and SUBMIT it.',
        milestone: '** ARTIFACT 2 DUE - fruit paper SUBMITTED. The only one with a letter attached. **',
    },
    21: {
        theory: 'Activations, dead units, vanishing and exploding gradients. READ Dropout. BUILD: break a deep net on purpose, then fix it.',
        deepWork: 'Karpathy video 4 - manual backprop through makemore, every single operation.',
    },
    23: {
        theory: 'READ Shalev-Shwartz Ch 2-6 - PAC learning, VC dimension. BUILD: measure a hypothesis class capacity empirically.',
        deepWork: 'Implement a PAC bound and check it holds on data you generate yourself.',
    },
    24: {
        theory: 'READ Shalev-Shwartz Ch 7-13, then Zhang et al. Rethinking Generalization and Nakkiran Deep Double Descent.',
        deepWork: 'Reproduce a double-descent curve on your own machine. Multiple seeds, error bars, honest axes.',
    },
    25: {
        theory: 'CNNs: convolution, pooling, receptive fields, why weight sharing works. READ AlexNet, then ResNet.',
        deepWork: 'Implement convolution and backprop through it in NumPy. Then a small ResNet in PyTorch.',
    },
    26: {
        theory: 'Sequence models: RNNs, LSTMs, and where they break. READ Chris Olah, Understanding LSTMs.',
        deepWork: 'ARTIFACT 3: RAG system with a real evaluation harness. Golden dataset, LLM-as-judge, numbers you would defend.',
        milestone: '** ARTIFACT 3 DUE - RAG with a real eval harness **',
    },
    27: {
        theory: 'Attention from first principles. READ The Annotated Transformer alongside Attention Is All You Need.',
        deepWork: 'Implement attention in NumPy. Only once it works may you touch PyTorch.',
    },
    29: {
        theory: 'WATCH Stanford CS336 Lec 1-3. Tokenisation: BPE, properly, and what it does to your vocabulary.',
        deepWork: 'Build a BPE tokeniser from nothing. Train it on your own corpus.',
    },
    30: {
        theory: 'CS336 Lec 4-6. The transformer block in full: residual stream, norm placement, MLP ratio, RoPE.',
        deepWork: "Karpathy - 'Let's build GPT from scratch'. Every line, no copying.",
    },
    31: {
        theory: 'CS336 Lec 7-9. Training dynamics: LR schedules, warmup, gradient clipping, mixed precision.',
        deepWork: 'Train your GPT on a real dataset. Get it genuinely working, not nearly working.',
    },
    32: {
        theory: 'Sampling: temperature, top-k, nucleus. Why greedy decoding sounds wrong.',
        deepWork: 'ARTIFACT 4: a GPT from nothing, tokeniser to trained model, generating text. WRITE, PUBLISH, POST.',
        milestone: '** ARTIFACT 4 DUE - a GPT you built from nothing **',
    },
    33: {
        theory: 'Pretraining data: collection, dedup, filtering, contamination. Scaling laws - READ Chinchilla properly.',
        deepWork: 'Build the data pipeline for your own small pretraining run. Measure what filtering removes.',
    },
    34: {
        theory: 'Instruction tuning and alignment. READ InstructGPT, then DPO. What RLHF is actually optimising.',
        deepWork: 'Run SFT on your own model with a small instruction set. Compare before and after, honestly.',
    },
    35: {
        theory: 'Parameter-efficient fine-tuning. READ LoRA, then QLoRA. Understand why a low rank update is enough.',
        deepWork: 'Fine-tune with LoRA. Measure it against full fine-tuning on the same task and budget.',
    },
    37: {
        theory: 'Latent variable models. Derive the ELBO on paper before you write any code. READ Kingma & Welling.',
        deepWork: 'VAE on MNIST from scratch. Show the latent space and explain what the KL term is doing.',
    },
    38: {
        theory: 'Diffusion. READ DDPM and the Lilian Weng post. The forward and reverse process, and why the loss simplifies.',
        deepWork: 'Implement DDPM on a small dataset. Watch the noise schedule change what it learns.',
    },
    39: {
        theory: 'RL: policy gradients, actor-critic, PPO. WATCH Spinning Up. READ the PPO paper.',
        deepWork: 'ARTIFACT 5: VAE from scratch plus the LaTeX derivation. Learn Overleaf now, you will need it in week 51.',
        milestone: '** ARTIFACT 5 DUE - VAE + derivation **',
    },
    40: {
        theory: 'GPU architecture in Python: SMs, warps, memory hierarchy - registers, shared, L2, HBM. WORK THROUGH Sasha Rush GPU Puzzles (github.com/srush/GPU-Puzzles) - Numba, pure Python. WATCH GPU MODE lectures.',
        deepWork: 'Triton tutorials 1-2: vector add, fused softmax.',
    },
    41: {
        theory: 'The roofline model. Arithmetic intensity. Compute-bound vs memory-bound vs overhead-bound. READ Horace He, Making Deep Learning Go Brrrr From First Principles. Coalescing, occupancy, warp divergence - all via GPU Puzzles.',
        deepWork: 'Triton tutorial 3: matmul. Benchmark vs torch.matmul, explain the gap.',
    },
    42: {
        theory: 'Operator fusion, graph optimisation, torch.compile internals. How TVM and XLA work conceptually. READ the Triton paper.',
        deepWork: 'Triton tutorial 6: fused attention. Compare to FlashAttention.',
    },
    44: {
        theory: 'Quantisation: symmetric vs asymmetric, per-channel vs per-tensor, PTQ vs QAT, INT8 and INT4 arithmetic. READ LLM.int8() and GPTQ.',
        deepWork: 'Implement INT8 quantisation by hand in NumPy. No library.',
    },
    45: {
        theory: 'The outlier problem in LLM quantisation. How SmoothQuant and AWQ each solve it. READ both properly - third pass.',
        deepWork: 'Quantise your own GPT. Accuracy and latency at FP16, INT8, INT4. Plot the tradeoff curve.',
    },
    46: {
        theory: 'Pruning: structured vs unstructured, magnitude vs gradient. Lottery tickets. Distillation: logit and feature matching. NAS, Once-for-All.',
        deepWork: 'Prune your GPT. Magnitude vs random at matched sparsity. Write up what surprised you.',
        milestone: '** ARTIFACT 7 DUE - quantisation study **',
    },
    47: {
        theory: 'FlashAttention: IO-awareness, tiling, why it is exact not approximate. PagedAttention and vLLM - READ THE PYTHON SOURCE: vllm/core/scheduler.py, vllm/core/block_manager.py, vllm/engine/llm_engine.py. The design decisions are in Python; the CUDA kernel is the mechanical part.',
        deepWork: 'Serve your GPT with vLLM. End to end.',
    },
    48: {
        theory: 'Continuous vs static batching. Prefill vs decode: compute-bound vs memory-bound. TTFT and TPOT. Speculative decoding: draft models, acceptance rate, EAGLE, Medusa.',
        deepWork: 'Profile it with torch.profiler. Where does time go at prefill and at decode?',
    },
    49: {
        theory: 'Parallelism: data, tensor, pipeline, sequence, expert - when each applies. ZeRO stages, FSDP, gradient checkpointing. All-reduce, ring vs tree, overlapping communication.',
        deepWork: 'Implement speculative decoding with a small draft model. Measure acceptance rate and real speedup.',
        milestone: '** ARTIFACT 8 DUE - paper reproduction matching published numbers **',
    },
    51: {
        theory: 'Experimental design: baselines, ablations, controls, multiple seeds. Statistical rigour: error bars, significance, spotting cherry-picking. Scientific writing: abstract structure, positioning against related work, honest limitations.',
        deepWork: 'Write up your original extension in the NeurIPS LaTeX template.',
    },
    52: {
        theory: 'AWARENESS WEEK, read only. Alignment and RLHF limits. Interpretability: probing, circuits, sparse autoencoders. Fairness metrics and their incompatibility. Differential privacy. Adversarial robustness, jailbreaks, red-teaming.',
        deepWork: 'Revise on supervisor feedback. Post it. Then plan Sept 2027 to Dec 2028: second research cycle, IELTS, professor list, applications.',
        milestone: '** ARTIFACT 9 DUE - original extension + preprint **',
    },
};

/** Artifacts that land on a consolidation week, where the finishing steps live. */
const CONSOLIDATION_MILESTONES: Record<number, string> = {
    43: '** ARTIFACT 6 DUE - Triton kernel suite, benchmarked **',
};

export const planWeeks: PlanWeek[] = Array.from({ length: PLAN_WEEKS }, (_, index) => {
    const week = index + 1;
    const stage = stageForWeek(week);
    const consolidation = CONSOLIDATION_WEEKS[week];
    const content = consolidation
        ? { ...CONSOLIDATION_CONTENT(consolidation, stage), milestone: CONSOLIDATION_MILESTONES[week] }
        : { ...WEEK_CONTENT[week], aiEng: aiEngForWeek(week), dsa: dsaForWeek(week) };

    return {
        week,
        ...datesForWeek(week),
        phase: stage.part,
        phaseKey: consolidation ? 'consolidation' : stage.phaseKey,
        targetHours: consolidation ? LIGHT : FULL,
        stage: stage.stage,
        stageName: consolidation ? `Consolidation ${consolidation}` : stage.name,
        part: stage.part,
        // The gate is asked on the last week of the stage, and nowhere else.
        gate: !consolidation && week === stage.to ? stage.gate : undefined,
        reading: readingForWeek(week),
        theory: content.theory,
        deepWork: content.deepWork,
        aiEng: content.aiEng,
        dsa: content.dsa,
        milestone: content.milestone,
    };
});

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

/**
 * Free unless the topic says otherwise, and only two things in the year are
 * not. Everything here is Python: there is no C++ resource in this list on
 * purpose, because there is no C++ anywhere in the plan.
 */
export const resources: Resource[] = [
    { track: 'A - Theory', topic: 'Maths', watch: "3Blue1Brown - 'Essence of Linear Algebra' and 'Essence of Calculus' | Harvard Stat 110 (Blitzstein)", read: 'Deisenroth, Mathematics for Machine Learning - mml-book.github.io', build: 'PCA and SVD in NumPy. Simulate every distribution and check the moments.', url: 'https://mml-book.github.io/' },
    { track: 'A - Theory', topic: 'Classical ML', watch: 'Cornell CS4780 (Kilian Weinberger) for the lectures that match the book', read: 'Murphy, Probabilistic ML: An Introduction - probml.github.io', build: 'Trees, forests, SVM, k-means and EM - all from scratch, no sklearn.', url: 'https://probml.github.io/pml-book/' },
    { track: 'A - Theory', topic: 'Learning theory', watch: 'Shalev-Shwartz lectures on YouTube', read: 'Shalev-Shwartz & Ben-David, Understanding Machine Learning', build: 'Reproduce a double-descent curve on your own machine.', url: 'https://www.cs.huji.ac.il/~shais/UnderstandingMachineLearning/' },
    { track: 'A - Theory', topic: 'Deep neural networks', watch: "Karpathy 'Neural Networks: Zero to Hero' - the most important series in the plan", read: 'Bishop, Deep Learning: Foundations and Concepts - bishopbook.com', build: 'micrograd, makemore, then a GPT.', url: 'https://karpathy.ai/zero-to-hero.html' },
    { track: 'A - Theory', topic: 'LLMs', watch: "Stanford CS336 'Language Modeling from Scratch' - free on YouTube", read: "'The Annotated Transformer' - nlp.seas.harvard.edu", build: 'BPE tokeniser, then the transformer, then train it.', url: 'https://stanford-cs336.github.io/' },
    { track: 'A - Theory', topic: 'Optimisation', watch: 'Stanford EE364A (Boyd) on YouTube', read: 'Boyd, Convex Optimization Ch 1-5 - stanford.edu/~boyd/cvxbook', build: 'SGD, momentum, RMSProp and Adam, implemented and raced.', url: 'https://web.stanford.edu/~boyd/cvxbook/' },
    { track: 'A - Theory', topic: 'Reinforcement learning', watch: 'David Silver, UCL RL lectures', read: 'OpenAI Spinning Up - spinningup.openai.com', build: 'Policy gradients, then PPO, on a small environment.', url: 'https://spinningup.openai.com/' },
    { track: 'A - Theory', topic: 'Diffusion', watch: 'Conference tutorials on denoising diffusion', read: "Lilian Weng - 'What are Diffusion Models?' (lilianweng.github.io)", build: 'DDPM on a small dataset. Change the noise schedule and see what happens.', url: 'https://lilianweng.github.io/' },
    { track: 'B - AI Eng', topic: 'GPUs (Python)', watch: 'GPU MODE lectures (YouTube)', read: "Horace He - 'Making Deep Learning Go Brrrr From First Principles'", build: 'Sasha Rush GPU Puzzles, all of them - Numba, pure Python.', url: 'https://github.com/srush/GPU-Puzzles' },
    { track: 'B - AI Eng', topic: 'Kernels', watch: 'Triton conference talks', read: 'The Triton paper, then the official tutorials - triton-lang.org', build: 'Vector add, fused softmax, matmul, fused attention. Benchmark every one.', url: 'https://triton-lang.org/main/getting-started/tutorials/index.html' },
    { track: 'B - AI Eng', topic: 'Serving', watch: 'vLLM official talks', read: 'The vLLM Python source: core/scheduler.py, core/block_manager.py, engine/llm_engine.py', build: 'Serve your own GPT with vLLM, then profile where the time goes.', url: 'https://github.com/vllm-project/vllm' },
    { track: 'B - DSA', topic: 'Python', watch: 'mCoding (YouTube)', read: 'Ramalho, Fluent Python', build: 'Rewrite your own old code until it reads like the book.', url: 'https://www.youtube.com/@mCoding' },
    { track: 'B - DSA', topic: 'DSA', watch: 'NeetCode YouTube - a video for all 150 problems', read: 'Tech Interview Handbook - techinterviewhandbook.org', build: 'NeetCode 150 in Python. One problem a day, then a second pass without the videos.', url: 'https://neetcode.io/practice' },
    { track: 'Both', topic: 'IELTS', watch: 'IELTS Liz | E2 IELTS (YouTube)', read: 'Cambridge IELTS practice tests', build: 'One writing task a week once the exam is booked.', url: 'https://www.ielts.org/' },
    { track: 'A - Theory', topic: 'LLM from scratch (PAID ~GBP 40)', watch: "Sebastian Raschka's companion repo walkthroughs", read: 'Sebastian Raschka, Build a Large Language Model (From Scratch)', build: 'Follow along, every component. Buy before Stage 10.', url: 'https://www.manning.com/books/build-a-large-language-model-from-scratch' },
    { track: 'Both', topic: 'Compute (PAID ~GBP 20/month from wk 40)', watch: '-', read: 'Colab Pro, or pay-as-you-go RunPod / Vast.ai', build: 'You cannot do the reproduction without a GPU.', url: 'https://www.runpod.io/' },
];

export const resourcesNote =
    'Total under GBP 300 for the year, and only two paid items in it. Skip the courses - you have an ' +
    'MSc, you need artifacts not certificates.';

// ============ ARTIFACTS — build, write, publish, post ============

/** The four steps every artifact goes through. BUILD is only the first. */
export type ArtifactStage = 'build' | 'write' | 'publish' | 'post';

export const ARTIFACT_STAGES: ArtifactStage[] = ['build', 'write', 'publish', 'post'];

export const ARTIFACT_STAGE_LABELS: Record<ArtifactStage, string> = {
    build: 'BUILD',
    write: 'WRITE',
    publish: 'PUBLISH',
    post: 'POST',
};

export const ARTIFACT_STAGE_NOTES: Record<ArtifactStage, string> = {
    build: 'Make it work. Thursday hours.',
    write: 'README saying WHAT and WHY - and honestly what did not work. The failures are the credible part.',
    publish: 'GitHub. Clean repo, MIT licence, pinned requirements, one command to reproduce. A stranger must be able to run it.',
    post: 'Blog or LinkedIn write-up linking the repo. 300 words minimum. This is the step that compounds.',
};

/** Orange = matters most for a PhD, yellow = matters most for a job. */
export type ProjectWeight = 'phd' | 'job' | null;

export interface PlanProject {
    id: string;
    number: number;
    name: string;
    /** Week number it is due by, so it can be checked against where you actually are. */
    byWeek: number;
    proves: string;
    weight: ProjectWeight;
    /** What each of the four steps means for this particular artifact. */
    pipeline: Record<ArtifactStage, string>;
}

export const projects: PlanProject[] = [
    {
        id: 'autograd', number: 1, name: 'Autograd engine (micrograd + your own operation)', byWeek: 18,
        proves: 'You understand backprop at the level of the machine, not the API.',
        weight: null,
        pipeline: {
            build: 'micrograd from nothing, plus tanh, exp and one operation you designed yourself.',
            write: 'README deriving the backward pass. Say which operation fought you and why.',
            publish: 'GitHub, MIT, pinned requirements, one command to train the demo MLP.',
            post: 'Building an autograd engine from scratch - what the chain rule looks like as code.',
        },
    },
    {
        id: 'fruit-paper', number: 2, name: 'Fruit detection paper, SUBMITTED', byWeek: 20,
        proves: 'The highest-value artifact in the plan. The only one that comes with a recommendation letter. Saturdays belong to it until it is gone.',
        weight: 'phd',
        pipeline: {
            build: 'Finish the experiments with your supervisor. Every number reproducible.',
            write: 'The paper itself, in the venue template. Limitations section written honestly.',
            publish: 'SUBMIT it. Then the code, cleaned, with the data pipeline included.',
            post: 'A plain-language write-up of what the paper found and what you would do next.',
        },
    },
    {
        id: 'rag', number: 3, name: 'RAG system with a real evaluation harness', byWeek: 26,
        proves: 'Production AI engineering, plus the evaluation skill almost nobody has.',
        weight: 'job',
        pipeline: {
            build: 'Retrieval, generation, and a golden dataset with LLM-as-judge scoring.',
            write: 'README with the eval numbers, including the queries it fails on.',
            publish: 'GitHub plus a deployed URL a stranger can actually try.',
            post: 'Why most RAG demos have no evaluation, and what mine measures.',
        },
    },
    {
        id: 'gpt', number: 4, name: 'GPT from nothing (tokeniser to trained model)', byWeek: 32,
        proves: 'You understand transformers completely. Very few people can do this.',
        weight: null,
        pipeline: {
            build: 'BPE tokeniser, transformer, training loop, sampling. All yours.',
            write: 'README with loss curves, the hyperparameters and what you got wrong first.',
            publish: 'GitHub with a checkpoint and one command to generate text.',
            post: 'Building a GPT from nothing - the parts the tutorials skip.',
        },
    },
    {
        id: 'vae', number: 5, name: 'VAE from scratch + LaTeX derivation', byWeek: 39,
        proves: 'You can go from maths on paper to working code, and show the working.',
        weight: null,
        pipeline: {
            build: 'VAE on MNIST, written after the ELBO derivation, not before.',
            write: 'The derivation in LaTeX, typeset properly, alongside the code.',
            publish: 'GitHub with the PDF in the repo and the latent space plots.',
            post: 'The ELBO, derived slowly - the write-up you wish you had found.',
        },
    },
    {
        id: 'triton', number: 6, name: 'Triton kernel suite, benchmarked', byWeek: 43,
        proves: 'You can write the kernels, not just call them. In Python.',
        weight: 'phd',
        pipeline: {
            build: 'Vector add, fused softmax, matmul, fused attention. All in Triton.',
            write: 'README with roofline analysis and the gap to torch, explained.',
            publish: 'GitHub with the benchmark harness and the hardware it was run on.',
            post: 'Beating naive softmax in Triton, and what the profiler actually said.',
        },
    },
    {
        id: 'quantisation', number: 7, name: 'Quantisation study on your own GPT', byWeek: 46,
        proves: 'You can measure a tradeoff instead of quoting one.',
        weight: 'phd',
        pipeline: {
            build: 'INT8 by hand in NumPy, then FP16/INT8/INT4 on your own GPT.',
            write: 'The tradeoff curve, with accuracy and latency on the same axes.',
            publish: 'GitHub with the quantisation code and the raw measurements.',
            post: 'What INT4 costs you, measured on a model I built myself.',
        },
    },
    {
        id: 'reproduction', number: 8, name: 'Paper reproduction matching published numbers', byWeek: 49,
        proves: 'The strongest single PhD application artifact there is.',
        weight: 'phd',
        pipeline: {
            build: 'The paper, reproduced, until your numbers match theirs.',
            write: 'README saying what matched, what did not, and why. That gap is the interesting part.',
            publish: 'GitHub with seeds, configs and one command per figure.',
            post: 'Reproducing X - what the paper left out and what it cost me.',
        },
    },
    {
        id: 'extension', number: 9, name: 'Original extension + preprint', byWeek: 52,
        proves: 'You can do research, not just follow it.',
        weight: 'phd',
        pipeline: {
            build: 'The ablation nobody ran, or the clean negative result. Multiple seeds.',
            write: 'NeurIPS LaTeX template, supervisor-reviewed, limitations included.',
            publish: 'arXiv preprint with your supervisor endorsing, plus the code.',
            post: 'Post it. Then answer the question the plan has been asking all year: what would you do next?',
        },
    },
];

export const publishRule =
    'An artifact is not finished when the code runs. It is finished when '
    + 'a stranger can clone it, run it, and read why it exists. BUILD is '
    + 'half the work. WRITE, PUBLISH and POST are the half others see.';

export const projectsNote =
    'Nine public artifacts in a year. Almost nobody applying alongside you will have this.';

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
