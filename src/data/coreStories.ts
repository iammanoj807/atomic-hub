// ============================================================
// The six core stories.
// You don't need 30 stories, you need 6 that bend. Questions link
// to one of these by `coreStoryId` so a question view can show which
// story it belongs to, and the Core Stories page can list its questions.
// ============================================================

export type CoreStoryId =
    | 'performance-fix'
    | 'fruit-detection'
    | 'cognigraph'
    | 'planck-ai'
    | 'automated-testing';

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
    /** Accent colour, from the palette already used across the app. */
    color: string;
}

export const CORE_STORIES: CoreStory[] = [
    {
        id: 'performance-fix',
        name: 'Performance Fix',
        hook: '8-second pages to under 2 seconds at Accenture.',
        covers: ['Technical achievement', 'Debugging production', 'Ownership', 'Measurable impact'],
        memoryPoints: [
            '8-second pages, users dropping off',
            'Profiled first — did not guess',
            'Two causes: unnecessary joins + no indexes, so full table scans',
            'Fixed: rewrote queries, compound indexes, fewer round trips',
            'Unit tests, then staging load test — 40% faster, 8s to under 2s',
        ],
        flexNotes: [
            {
                when: 'Debug a critical production issue',
                how: 'Open with the pressure: "This one was live and affecting real users, so I couldn\'t experiment in production." Emphasise method over outcome. Close on: under pressure the instinct is to guess and patch; profiling first felt slower and was actually faster.',
            },
            {
                when: 'Took ownership / went beyond your remit',
                how: 'Open with "Nobody handed me a root cause — I was handed a symptom." Then stress that you owned the investigation end to end, including testing and safe rollout, rather than fixing the first thing you found.',
            },
        ],
        color: '#4a90e2',
    },
    {
        id: 'fruit-detection',
        name: 'Fruit Detection',
        hook: '207 images, 95% less data, 73 FPS.',
        covers: ['Hardest problem', 'Decision without full information', 'Above and beyond', 'Proud moment'],
        memoryPoints: [
            'Two problems: only 207 images, and badly unbalanced classes',
            'Small data → transfer learning (big dataset first, then fine-tune)',
            'Imbalance → inverse frequency weighting',
            'Proof → proper baseline, one change at a time',
            'Better on the rare fruits, and 73 FPS against a 30 FPS requirement',
        ],
        flexNotes: [
            {
                when: 'A decision with incomplete information',
                how: 'Spotlight the metric choice. A missed fruit is cheap; grabbing a leaf costs a real wasted action. So you optimised for precision, documented why, and set a baseline so it could be revisited. Close: when information is incomplete, the best anchor is the real cost of each type of mistake.',
            },
            {
                when: 'Went above and beyond',
                how: 'Spotlight that you did not stop at the model — ONNX conversion, 73 FPS, live demo. "The brief was a model. What was actually useful was something a robot could run."',
            },
        ],
        color: '#00e676',
    },
    {
        id: 'cognigraph',
        name: 'CogniGraph',
        hook: 'RAG that grounds every answer in the real document.',
        covers: ['Customer focus', 'Failure or mistake', 'Quality', 'Trust'],
        memoryPoints: [
            'Tuned on clean documents — looked finished',
            'Real PDFs: scans, broken layouts — it fell apart',
            'The mistake was an assumption, not a bug: I tested the data I wanted',
            'Fix: messy test set, one change at a time, graceful fallbacks',
            'Rule now: find the ugliest real input first',
        ],
        flexNotes: [
            {
                when: 'Customer focus / put the user first',
                how: 'Same facts, different spotlight: the point was people trusting AI answers. Grounding every answer in the source, showing where it came from, fallbacks so messy documents still gave something useful. End on the person on the other end of a wrong answer.',
            },
            {
                when: 'Quality / doing the right thing',
                how: 'Spotlight traceability — every answer traceable to a real source, and degrading gracefully instead of failing silently.',
            },
        ],
        color: '#00e5ff',
    },
    {
        id: 'planck-ai',
        name: 'Planck AI / LangGraph',
        hook: 'Learned LangGraph in a week, redesigned it as a stateful graph.',
        covers: ['Resilience', 'Learning fast', 'Curiosity', 'Agent depth'],
        memoryPoints: [
            'Failing subtly — losing track, repeating steps',
            'Could have settled for something simpler; did not',
            'Redesigned as a stateful graph, every step an inspectable checkpoint',
            'Never used LangGraph before — one week to productive',
            'Method: get the mental model, build the smallest thing, learn each concept by needing it',
        ],
        flexNotes: [
            {
                when: 'Kept going when it was hard',
                how: 'Use the resilience version. The spotlight is on iterating through subtle failures until it was reliable — "actually works, not half-works".',
            },
            {
                when: 'Learned something new quickly',
                how: 'Use the learning version. Day one is the core mental model only: nodes do work, edges decide what happens next. Then build immediately and let real problems drive what you study. Close on the method transferring to any new tool.',
            },
        ],
        color: '#7c4dff',
    },
    {
        id: 'automated-testing',
        name: 'Automated Testing',
        hook: 'Nobody owned it — I proved the value instead of arguing.',
        covers: ['Initiative', 'Collaboration', 'Disagreement', 'Influence without authority'],
        memoryPoints: [
            'Bugs slipping through, constant manual retesting, nobody owned it',
            'Started small — the module that broke most often, cost the team nothing',
            'Those tests caught a real bug before production',
            'Adoption became a shared decision, not my campaign',
            'Initiative is making the value visible, not announcing the idea',
        ],
        flexNotes: [
            {
                when: 'Disagreement or conflict',
                how: 'Use the version where the team pushed back on having time to write tests. The move: you understood the real concern (time), did not argue in the meeting, and ran a small experiment instead. Evidence beats debate.',
            },
            {
                when: 'Already used for collaboration this interview',
                how: 'Switch to the backup: the teammate who wanted to hardcode logic to hit a deadline. Shared goal, both options with trade-offs, middle path — core built properly, extras deferred.',
            },
        ],
        color: '#ff9800',
    },
];

export const getCoreStory = (id?: string): CoreStory | undefined =>
    CORE_STORIES.find(story => story.id === id);
