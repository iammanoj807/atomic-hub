// "Which pattern?" — the recognition aids shared by the DSA pages.

export interface PatternFinder {
    title: string;
    code: string;
    caption: string;
}

/** Two decision diagrams: first look at the input, then (for arrays and strings) at the question. */
export const patternFinders: PatternFinder[] = [
    {
        title: 'Step 1 · Look at the input',
        code: 'flowchart TD\n  I{"What is the input?"}\n  I -->|"a linked list"| LL["Linked List<br/>dummy node · prev/curr/next · fast & slow"]\n  I -->|"a tree"| T{"levels or \'closest\'?"}\n  T -->|"yes"| TB["Trees: BFS with a queue"]\n  T -->|"no"| TD2["Trees: DFS recursion"]\n  I -->|"[start, end] pairs"| IV["Intervals: sort by start"]\n  I -->|"a grid, or nodes and edges"| G{"edges with different costs?"}\n  G -->|"yes"| AG["Advanced Graphs: Dijkstra"]\n  G -->|"no"| GR["Graphs: DFS/BFS · topological sort · union-find"]\n  I -->|"many words, prefixes"| TR["Tries"]\n  I -->|"an array or a string"| NEXT["→ Step 2: look at the question"]',
        caption: 'Start with the shape of the input. Lists, trees, intervals, graphs and word sets almost choose the pattern for you.',
    },
    {
        title: 'Step 2 · Arrays and strings: look at the question',
        code: 'flowchart TD\n  Q{"What are they asking for?"}\n  Q -->|"every combination / permutation"| BT["Backtracking"]\n  Q -->|"number of ways, or min / max with choices"| DP{"greedy breaks on a small example?"}\n  DP -->|"yes"| DPY["Dynamic Programming"]\n  DP -->|"no, one safe best move"| GRD["Greedy"]\n  Q -->|"best contiguous subarray / substring"| SW["Sliding Window"]\n  Q -->|"a pair or triplet, sorted data"| TP["Two Pointers"]\n  Q -->|"a position or smallest value that works, O(log n)"| BS["Binary Search"]\n  Q -->|"k-th, top k, a stream"| HP["Heap"]\n  Q -->|"next greater, matching brackets"| ST["Stack"]\n  Q -->|"seen before, counts, groups"| HM["Arrays & Hashing"]\n  Q -->|"pairs cancel, single bits, no + allowed"| BIT["Bit Manipulation"]\n  Q -->|"rotate, spiral, digits"| MG["Math & Geometry"]',
        caption: 'For arrays and strings, the wording of the question is the clue. Match the phrase, then confirm with the pattern\'s 3-second gut check.',
    },
];

/** The three questions to ask before choosing a pattern. */
export const recognitionQuestions: string[] = [
    'What is the input? (list, tree, intervals, grid or graph, words, or an array or string)',
    'What exactly do they ask for? (all of them, how many, best, k-th, contiguous, a position…)',
    'What are the limits? (n ≤ 20 means exponential is fine; 10⁵ means O(n log n) or better; \'O(1) space\' or \'O(log n)\' rule out options)',
];

/** For each topic, the topics most often confused with it (used for drill answer options). */
export const lookAlikeTopics: Record<string, string[]> = {
    'arrays-hashing': ['two-pointers', 'sliding-window', 'heap-priority-queue'],
    'two-pointers': ['sliding-window', 'binary-search', 'arrays-hashing'],
    'sliding-window': ['two-pointers', 'arrays-hashing', '1-d-dynamic-programming'],
    'stack': ['two-pointers', 'heap-priority-queue', 'greedy'],
    'binary-search': ['two-pointers', 'heap-priority-queue', 'greedy'],
    'linked-list': ['two-pointers', 'arrays-hashing', 'stack'],
    'trees': ['graphs', 'backtracking', 'binary-search'],
    'heap-priority-queue': ['binary-search', 'arrays-hashing', 'greedy'],
    'backtracking': ['1-d-dynamic-programming', 'graphs', 'trees'],
    'tries': ['arrays-hashing', 'backtracking', 'trees'],
    'graphs': ['trees', 'advanced-graphs', '2-d-dynamic-programming'],
    'advanced-graphs': ['graphs', 'heap-priority-queue', '1-d-dynamic-programming'],
    '1-d-dynamic-programming': ['greedy', 'backtracking', '2-d-dynamic-programming'],
    '2-d-dynamic-programming': ['1-d-dynamic-programming', 'graphs', 'backtracking'],
    'greedy': ['1-d-dynamic-programming', 'sliding-window', 'intervals'],
    'intervals': ['greedy', 'heap-priority-queue', 'two-pointers'],
    'math-geometry': ['arrays-hashing', '2-d-dynamic-programming', 'bit-manipulation'],
    'bit-manipulation': ['math-geometry', 'arrays-hashing', 'greedy'],
};
