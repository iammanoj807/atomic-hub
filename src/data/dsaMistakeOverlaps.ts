// The topic pages merge the new pattern guide's "common mistakes" with the
// older notes' list. Some old items say the same thing as a guide item in
// different words; these are hidden so nothing appears twice. Each entry is
// the start of an old mistake (dsaContent.ts) that a guide item already covers.

export const mistakesCoveredByGuide: Record<string, string[]> = {
    'arrays-hashing': ['Trying to use Arrays for lookups'],
    'two-pointers': ['Using a `while (left <= right)` loop'],
    'sliding-window': ['Off-by-one errors when calculating'],
    'stack': ['Forgetting to check if the stack', 'Leaving elements in the stack'],
    'binary-search': ['Messing up the `<` vs `<=`', 'Forgetting to add/subtract 1'],
    'linked-list': ['Losing the reference to the rest of the list'],
    'trees': ['Forgetting the base case'],
    'heap-priority-queue': ["Using a Max-Heap to find 'Top K Largest'"],
    'backtracking': ["Forgetting to make a 'Deep Copy'", 'Forgetting the undo step'],
    'tries': ['Forgetting to set `isEndOfWord = true`', "Confusing `search('cat')`"],
    '1-d-dynamic-programming': ['Forgetting to initialize the base cases'],
    '2-d-dynamic-programming': ['Messing up the matrix dimension sizes', 'Filling the DP table in the wrong order'],
    'greedy': ['Using Greedy when Dynamic Programming is required'],
    'intervals': ['Forgetting to sort the intervals first'],
};

/** The guide's mistakes, then the old ones it doesn't already cover. */
export const mergedMistakes = (topicId: string, guide: string[], old: string[]): string[] => {
    const covered = mistakesCoveredByGuide[topicId] ?? [];
    return [...guide, ...old.filter(mistake => !covered.some(start => mistake.startsWith(start)))];
};
