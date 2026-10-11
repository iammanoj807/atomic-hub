// ============================================================
// The main story, and the six core stories.
// You don't need 30 stories, you need 6 that bend — and one thread
// that runs through all of them. Questions link to a story by
// `coreStoryId` so a question view can show which story it belongs
// to, and the Core Stories page can list its questions.
//
// Every number here is on the CV. If the CV changes, change it here.
// ============================================================

export type CoreStoryId =
    | 'performance-fix'
    | 'fruit-detection'
    | 'cognigraph'
    | 'planck-ai'
    | 'neuroarc'
    | 'mentoring';

/** A technical term, and how to say it to someone who isn't technical. */
export interface PlainWord {
    term: string;
    meaning: string;
}

export interface CoreStory {
    id: CoreStoryId;
    name: string;
    /** The one line that opens it. */
    hook: string;
    /** What this story can be bent to answer. */
    covers: string[];
    memoryPoints: string[];
    /** How to re-angle it: the question it answers, and the move that does it. */
    flexNotes: { when: string; how: string }[];
    /** The jargon this story uses, in plain English. */
    plainWords: PlainWord[];
    /** Accent colour, from the palette already used across the app. */
    color: string;
}

/**
 * The thread through every answer. Each story is one example of it, and
 * every answer can end by coming back to it.
 */
export const MAIN_STORY = {
    catchphrase: 'Build it, then prove it.',
    oneLiner:
        "I'm a software engineer who builds AI people can trust — and I prove it works with honest measurement, not a good-looking demo.",
    spoken:
        "I started as a software engineer at Accenture, where everything was measurable — I cut API latency by 40% because I measured before I touched anything. Then I did an MSc in AI at Aston and finished with a Distinction. What I noticed in AI is that the hard part isn't building the model, it's knowing whether it really works. So every project I built has a proof step: a fair baseline for FruitGuard, a test set I rebuilt when I caught it flattering me in CogniGraph, a grading rubric locked in Git before the first run in Planck AI, and code that checks the model's evidence in NeuroArc. That's what I bring: build it, then prove it.",
    threads: [
        {
            label: 'Engineer first',
            text: 'Accenture: production Spring Boot APIs. Measured first, then fixed — p95 850 → 510 ms.',
        },
        {
            label: 'Then AI depth',
            text: 'MSc AI, Aston — Distinction. FruitGuard, Planck AI, CogniGraph, NeuroArc. Mentored 5 students.',
        },
        {
            label: 'Always the proof',
            text: 'Fair baselines. Test sets that can\'t flatter me. Rubrics fixed before results. Code that checks the model.',
        },
    ],
    bringItBack:
        'End any answer by connecting it back: "…and that\'s really how I work — build it, then prove it with a number I trust."',
};

export const CORE_STORIES: CoreStory[] = [
    {
        id: 'performance-fix',
        name: 'Performance Fix',
        hook: 'p95 latency from 850 ms to 510 ms across 18 endpoints at Accenture.',
        covers: ['Technical achievement', 'Debugging production', 'Ownership', 'Measurable impact'],
        memoryPoints: [
            'Accenture, 7-engineer team, Java Spring Boot, 2-week sprints',
            'I owned the business logic + data-access layer (PostgreSQL/MySQL)',
            'Measured first: slowest 5% of requests ~850 ms',
            'Cause: 6 N+1 query sites — one database trip per row',
            'Rewrote the SQL to fetch in one go → p95 510 ms, 18 endpoints, 40% faster',
        ],
        flexNotes: [
            {
                when: 'Debug a critical production issue',
                how: 'Spotlight the method: measure before you touch anything, find the real cause (N+1), fix it, then re-measure the same way. Close on: the slow part is rarely where you\'d guess.',
            },
            {
                when: 'Took ownership',
                how: 'Open with "I owned the data-access layer, so slow data access was my problem to solve." Stress that you fixed every one of the six sites, not just the first one, and proved it with before-and-after numbers.',
            },
        ],
        plainWords: [
            { term: 'p95 latency', meaning: 'Line up every response time. p95 is the time 95% of requests beat — it shows what your slowest users feel, which an average hides.' },
            { term: 'N+1 query', meaning: 'Getting a list with 1 database query, then 1 more query for every item. 50 rows = 51 trips to the database instead of 1 or 2.' },
            { term: 'Data-access layer', meaning: 'The part of the code whose only job is talking to the database.' },
            { term: 'Spring Boot', meaning: 'A popular Java framework for building web services (APIs).' },
        ],
        color: '#4a90e2',
    },
    {
        id: 'fruit-detection',
        name: 'FruitGuard AI',
        hook: '207 images, 96.3% accuracy, 73 FPS — 34x less labelled data.',
        covers: ['Proudest project', 'Hardest problem', 'Leading a project', 'Above and beyond'],
        memoryPoints: [
            'MSc dissertation: fruit detection for a harvesting robot (needs 30+ FPS)',
            'Two problems: only 207 labelled images + imbalanced classes',
            'Two-phase transfer learning: 7,108 images first, then my 207 (34x less)',
            'Imbalance → inverse frequency weighting; proof → fair COCO baseline',
            '96.3% (52/54), +6.03 pp mAP, +3.12 pp precision',
            'ONNX Runtime → 73 FPS, live Hugging Face demo',
        ],
        flexNotes: [
            {
                when: 'A decision with incomplete information',
                how: 'Spotlight the metric choice. For a robot arm, grabbing a leaf is a wasted action every time, so precision mattered most — you tracked it against a fair baseline and it went up 3.12 points.',
            },
            {
                when: 'Went above and beyond',
                how: 'Spotlight that you didn\'t stop at a trained model — ONNX conversion, 73 FPS, a live demo. "The brief was a model. What was actually useful was something a robot could run."',
            },
        ],
        plainWords: [
            { term: 'YOLOv8', meaning: 'A fast, well-known model that finds and labels objects in an image in one pass.' },
            { term: 'Transfer learning', meaning: 'Start from a model that already learned from lots of similar images, then teach it your specific task with a few examples — like a chef learning one new dish.' },
            { term: 'Fine-tuning', meaning: 'The second step: a short extra round of training on your own small dataset.' },
            { term: 'Inverse frequency weighting', meaning: 'Mistakes on rare classes count more, so the model can\'t just ignore them and still look good.' },
            { term: 'COCO baseline', meaning: 'The same model starting from standard general-purpose weights — the fair "before" to compare against.' },
            { term: 'mAP@0.5:0.95', meaning: 'The standard score for object detection: how well the model finds objects and how tightly its boxes fit. Higher is better.' },
            { term: 'Precision', meaning: 'Of everything the model said was fruit, how much really was fruit.' },
            { term: 'ONNX Runtime', meaning: 'A fast engine for running a trained model in production, separate from the training code.' },
            { term: 'FPS', meaning: 'Frames per second — how many camera images it can process each second. 73 is real-time.' },
        ],
        color: '#00e676',
    },
    {
        id: 'cognigraph',
        name: 'CogniGraph',
        hook: 'My own test questions overstated accuracy by 35 points — so I rebuilt the test.',
        covers: ['Failure or mistake', 'Incomplete information', 'Quality and honesty', 'Evaluation'],
        memoryPoints: [
            'Graph RAG app: documents (even scanned, via OCR) → 3D knowledge graph',
            'Answers only from passages retrieved from ChromaDB',
            'Mistake: I wrote the test questions myself → 90% looked great',
            'Rebuilt the test set honestly → real score 55% (35 points lower)',
            'Same honest set: 95% hit@3 vs 80% for a keyword baseline',
            'Chunk size: embedding model cuts text at ~1,400 chars → chose 1,000',
        ],
        flexNotes: [
            {
                when: 'Failure or mistake',
                how: 'Spotlight the 35-point drop. The mistake was mine — I wrote questions I already knew the system could answer. Close on: now I make sure my test can\'t flatter me.',
            },
            {
                when: 'Decision with incomplete information',
                how: 'Use the chunk-size version: an experiment said 2,000 characters was best, but the comparison was unfair (different corpus sizes) and the model silently ignored text after ~1,400 characters. You chose 1,000 — the largest size that fits.',
            },
        ],
        plainWords: [
            { term: 'RAG', meaning: 'Retrieval-Augmented Generation: before the AI answers, it looks up the relevant passages in your documents and answers from those — like an open-book exam.' },
            { term: 'Knowledge graph', meaning: 'A map of the people, places and ideas in the documents and how they connect.' },
            { term: 'OCR', meaning: 'Optical character recognition — turning a scanned image of a page into real text.' },
            { term: 'Vector database (ChromaDB)', meaning: 'A database that finds passages by meaning rather than exact words.' },
            { term: 'Embedding', meaning: 'A list of numbers that captures what a piece of text means, so similar meanings sit close together.' },
            { term: 'hit@1 / hit@3', meaning: 'Did the right passage come back first (hit@1) or in the top three (hit@3)?' },
            { term: 'Chunk size', meaning: 'How long each piece of a document is when you cut it up for search.' },
            { term: 'Confounded', meaning: 'The comparison wasn\'t fair — something else changed at the same time, so you can\'t tell what caused the result.' },
        ],
        color: '#00e5ff',
    },
    {
        id: 'planck-ai',
        name: 'Planck AI',
        hook: 'An agent built without a framework — 30/30 tasks with its main AI provider switched off.',
        covers: ['Most complex project', 'Resilience', 'Learning fast', 'Agent depth'],
        memoryPoints: [
            'Research agent in Python, no agent framework — I wanted to understand every step',
            '4 tools: web search, code in 7 languages, PDF/URL reading, image analysis',
            'Plans up to 8 steps before answering',
            'Failover across Groq, Gemini and NVIDIA behind one interface',
            'Fault injection: main provider off on every call → still 30/30',
            'Rubric committed to Git before first run: 80% tool choice, 2.7 s median, 0 wrong of 20',
        ],
        flexNotes: [
            {
                when: 'Kept going when it was hard',
                how: 'Spotlight the provider failures: a run could be halfway through when a provider hit a limit and all the work was lost. You didn\'t retry and hope — you built failover and then tried to break it on purpose.',
            },
            {
                when: 'Learned something new quickly',
                how: 'Spotlight building the agent loop yourself: by writing tool calling from scratch you learned what frameworks like LangGraph actually do underneath, so new tools are quick to pick up.',
            },
        ],
        plainWords: [
            { term: 'LLM agent', meaning: 'An AI that doesn\'t just answer — it decides which tool to use (search, run code, read a file), looks at the result, and repeats until it can answer.' },
            { term: 'Tool calling', meaning: 'The AI asks for a tool by name with inputs; my code runs it and hands back the result.' },
            { term: 'Agent framework', meaning: 'A library like LangGraph that handles the agent loop for you. I wrote that loop myself.' },
            { term: 'Failover', meaning: 'If one AI provider fails or hits its limit, the request automatically moves to the next one.' },
            { term: 'OpenAI-compatible interface', meaning: 'One standard way of talking to all three providers, so swapping between them is one line.' },
            { term: 'Fault injection', meaning: 'Breaking things on purpose to prove the system survives — here, switching off the main provider.' },
            { term: 'Golden set', meaning: 'A fixed list of test questions with agreed correct answers.' },
            { term: 'Median latency', meaning: 'The typical response time — half are faster, half are slower.' },
        ],
        color: '#7c4dff',
    },
    {
        id: 'neuroarc',
        name: 'NeuroArc',
        hook: 'The model was inventing evidence — so my code checks every quote.',
        covers: ['Superpower', 'Quality and trust', 'Customer focus', 'Spotting a hidden risk'],
        memoryPoints: [
            'AI job assistant: reads CVs (PDF/DOCX, OCR fallback), live UK jobs from Reed',
            'Scores CV–job fit and exports a tailored CV as PDF',
            'Risk: the model claimed evidence that wasn\'t in the CV',
            'Fix: it must quote the CV for each requirement, as structured JSON',
            'Code checks each quote is really in the CV — if not, it\'s thrown out before scoring',
        ],
        flexNotes: [
            {
                when: 'Customer focus / put the user first',
                how: 'Spotlight the person using it: a job seeker who trusts an inflated score sends a weak application. The fix protects them, not the demo.',
            },
            {
                when: 'Quality / doing the right thing',
                how: 'Spotlight "don\'t trust the model\'s word — check it in code". A prompt asks the model to be honest; code makes it impossible to cheat.',
            },
        ],
        plainWords: [
            { term: 'Structured JSON output', meaning: 'Making the AI answer in a fixed, machine-readable format instead of free text, so code can check it.' },
            { term: 'Hallucination', meaning: 'When an AI states something confidently that isn\'t true.' },
            { term: 'Weighted score', meaning: 'An overall score where more important requirements count for more.' },
            { term: 'API', meaning: 'A way for one program to ask another for data — here, live job listings from Reed.' },
        ],
        color: '#ff4081',
    },
    {
        id: 'mentoring',
        name: 'Mentoring',
        hook: 'Five MSc students, every week — and the same three blockers.',
        covers: ['Initiative', 'Disagreement', 'Difficult feedback', 'Working with different people'],
        memoryPoints: [
            'Mentored 5 MSc AI students, one-to-one, every week (Aug 2025 – Jan 2026)',
            'Python and machine learning, mixed backgrounds',
            'Spotted the same 3 blockers recurring across students',
            '1) Python environments  2) training that won\'t converge  3) baseline before complex model',
            'Built sessions around those 3 — explain simply, let them drive',
        ],
        flexNotes: [
            {
                when: 'Disagreement',
                how: 'Use the baseline version: a student wanted to jump to a complex model; you believed a simple baseline should come first. You didn\'t argue — you suggested a quick experiment, and the result settled it.',
            },
            {
                when: 'Working with someone different / explaining simply',
                how: 'Spotlight that the five came from different backgrounds, so the same explanation didn\'t work for everyone. You checked understanding by having them explain it back in their own words.',
            },
        ],
        plainWords: [
            { term: 'Python environment', meaning: 'A separate, clean set of installed libraries for one project, so projects don\'t break each other.' },
            { term: 'Training loop not converging', meaning: 'The model trains but never gets better — usually a bug, a wrong setting, or bad data.' },
            { term: 'Baseline', meaning: 'The simplest reasonable model. If a complex model can\'t beat it, the complexity isn\'t helping.' },
        ],
        color: '#ff9800',
    },
];

export const getCoreStory = (id?: string): CoreStory | undefined =>
    CORE_STORIES.find(story => story.id === id);
