import type { InterviewSet } from './types';

// Coding interview questions about thinking and fundamentals. The problems
// themselves are the NeetCode 150; these are what interviewers ask around them.

export const dsaInterviewSet: InterviewSet = {
    id: 'dsa',
    title: 'Coding interviews',
    blurb: 'How to approach a problem you have never seen, and the fundamentals interviewers probe while you code.',
    questions: [
        {
            id: 'dsa-approach',
            q: 'Walk me through how you approach a coding problem you have never seen before.',
            level: 'beginner',
            kind: 'concept',
            testing: 'A repeatable process and clear communication, which matter as much as the final code.',
            answer: 'I go through the same steps every time, out loud.\n\nFirst I make sure I understand it: I restate the problem, ask about the input (size, sorted or not, duplicates, negative numbers, can it be empty?) and agree what to return. Then I work through one or two small examples by hand, including an edge case.\n\nNext, a brute-force idea, said out loud with its complexity, even if it is slow, so we have a correct baseline. Then I look for the pattern: what is the brute force repeating? A hash map to remember what I have seen, two pointers on sorted data, a sliding window for contiguous ranges, BFS for shortest paths, dynamic programming when subproblems repeat. I explain the better approach and its time and space complexity before writing code.\n\nThen I code it cleanly, with good names, and test it by walking my examples through the code line by line, plus the edge cases: empty input, one element, duplicates, very large values. Finally I restate the complexity and mention what I would improve with more time.',
            analogy: 'A doctor with a new patient. They don\'t start operating: they ask questions, examine, consider the simple explanation first, then the likely ones, decide on a treatment, explain it, carry it out carefully, and check afterwards that it worked.',
            diagram: {
                code: 'flowchart LR\n  U["Understand:<br/>restate, ask"] --> E["Examples<br/>by hand"] --> B["Brute force<br/>+ complexity"] --> P["Find the pattern,<br/>optimise"] --> C["Code it<br/>cleanly"] --> T["Test: walk through,<br/>edge cases"] --> X["State final<br/>complexity"]',
                caption: 'The same seven steps for every problem. Talking through each one is part of the answer.',
            },
            strong: [
                'Asks clarifying questions before coding.',
                'States a brute force and its complexity first.',
                'Names the pattern and why it fits.',
                'Tests by walking through the code, and covers edge cases.',
            ],
            traps: [
                'Coding in silence straight away.',
                'Saying "done" without testing.',
            ],
            followUps: [
                { q: 'What if you can\'t think of anything better than brute force?', a: 'Say so, code the brute force well, and test it. A correct, clean brute force with a clear explanation beats an unfinished clever idea. Then think aloud about what it repeats, which often leads to the optimisation.' },
                { q: 'How do you pick test cases?', a: 'A normal case, the smallest cases (empty, one element), duplicates, the extremes (all the same, sorted, reversed, very large numbers) and any case the problem statement hints at.' },
            ],
            topicIds: ['arrays-hashing', 'two-pointers', 'sliding-window'],
        },
        {
            id: 'dsa-big-o',
            q: 'Explain Big O. Why is an O(n log n) sort fine for a million items, but an O(n²) algorithm is not?',
            level: 'beginner',
            kind: 'concept',
            testing: 'Whether you can reason about how an algorithm\'s cost grows, with real numbers.',
            answer: 'Big O describes how the running time (or memory) grows as the input gets bigger, ignoring constant factors and small terms. O(n) means double the input, double the work; O(n²) means double the input, four times the work.\n\nWith a million items: n log₂ n is about 1,000,000 × 20 = 20 million operations. At roughly a billion simple operations a second, that is a few hundredths of a second. n² is 10¹² operations: around 15 minutes or more. Same input, a difference of tens of thousands of times.\n\nThat is why interviews care: on small inputs everything is fast, and the difference only shows at scale. I also mention space complexity, and that Big O is about growth, so for small inputs a simple O(n²) can beat a complex O(n log n), and constant factors and memory access patterns matter in practice.',
            analogy: 'Finding a friend at a party. Walking past every guest once is O(n). Introducing every guest to every other guest is O(n²): fine for 10 people (45 introductions), impossible for a stadium. Looking someone up in an alphabetical guest list by halving it each time is O(log n): even a million names need only about 20 looks.',
            diagram: {
                code: 'xychart-beta\n  title "Operations as n grows"\n  x-axis "n" [10, 100, 1000, 10000]\n  y-axis "operations (millions)" 0 --> 100\n  line [0.0001, 0.01, 1, 100]\n  line [0.00003, 0.0007, 0.01, 0.13]',
                caption: 'n² (upper line) against n log n (lower line). At n = 10,000, n² is already 100 million operations; n log n is about 130,000.',
            },
            strong: [
                'Defines it as growth, with real numbers.',
                'Converts operations into rough seconds.',
                'Mentions space complexity and constant factors.',
            ],
            traps: [
                'Treating Big O as exact running time.',
                'Forgetting the cost of hidden loops, like `x in list` inside a loop.',
            ],
            followUps: [
                { q: 'What is the complexity of checking `if x in my_list` inside a loop over the list?', a: 'O(n²): the membership check scans the list each time. Use a set for O(1) average lookups, making it O(n) overall.' },
                { q: 'What does amortised O(1) mean, for example appending to a dynamic array?', a: 'Most appends are O(1), and occasionally the array is resized and copied, which is O(n). Because it doubles in size each time, the total over n appends is O(n), so each append costs O(1) on average.' },
            ],
            topicIds: ['arrays-hashing', 'binary-search'],
        },
        {
            id: 'dsa-hash-map',
            q: 'How does a hash map give O(1) lookups, and when is it not O(1)?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'Real understanding of the most-used data structure in coding interviews.',
            answer: 'A hash map stores key–value pairs in an array of buckets. To store or find a key, it runs the key through a hash function, which turns it into a number, and uses that number (modulo the array size) as the bucket index. So it jumps straight to the right place instead of searching, which is O(1) on average.\n\nTwo keys can land in the same bucket: a collision. Implementations handle it by keeping a small list per bucket, or by probing nearby slots. To keep those short, the map tracks its load (entries per bucket) and, when it gets too full, allocates a bigger array and moves everything over: that resize is O(n), but rare enough that inserts stay O(1) on average, amortised.\n\nIt is not O(1) when many keys collide: with a bad hash function, or keys crafted by an attacker, everything piles into a few buckets and lookups degrade towards O(n). Also, hashing a long key, such as a big string, costs time in proportion to its length, and keys must not change after insertion, which is why Python requires them to be immutable.',
            analogy: 'A cloakroom with numbered hooks. You don\'t search every hook for your coat; the ticket number tells you exactly which hook. If two coats are given the same number, they share a hook and the attendant checks both. If the cloakroom gets too full, they move to a bigger room with more hooks and re-number everything.',
            strong: [
                'Explains hashing to a bucket index.',
                'Covers collisions and resizing, and the word amortised.',
                'Knows the worst case and why keys must be immutable.',
            ],
            traps: [
                '"Hash maps are always O(1)."',
                'Using a list or tuple wrongly: a mutable key in Python raises an error for a reason.',
            ],
            followUps: [
                { q: 'Why can\'t you use a Python list as a dictionary key?', a: 'Lists are mutable. If a key changed after insertion, its hash would change, and the map would look in the wrong bucket. Tuples of immutable values are fine.' },
                { q: 'Hash map or sorted array for lookups?', a: 'A hash map for fast exact lookups. A sorted array (or a balanced tree) when you also need order: ranges, the nearest value, or the smallest and largest.' },
            ],
            topicIds: ['arrays-hashing'],
        },
        {
            id: 'dsa-array-vs-list',
            q: 'Array or linked list: what are the trade-offs?',
            level: 'beginner',
            kind: 'concept',
            testing: 'Understanding of memory layout and operation costs, not just a memorised table.',
            answer: 'An array stores elements next to each other in memory. So reading element i is O(1): the address is just start + i × size. Scanning is very fast in practice, because neighbouring elements arrive together in the CPU cache. The costs: inserting or deleting in the middle is O(n), because everything after it must shift, and a dynamic array occasionally has to grow and copy.\n\nA linked list stores each element in its own node with a pointer to the next. Inserting or removing is O(1) once you have the node, with no shifting. But finding element i is O(n), because you have to follow the pointers from the start, each node costs extra memory for the pointer, and jumping around memory is slow for the cache.\n\nIn practice arrays win most of the time. Linked lists are useful when you insert and remove a lot in the middle and already hold the node: for example in an LRU cache, a hash map points to nodes of a doubly linked list so both lookup and moving an item to the front are O(1).',
            analogy: 'An array is a row of numbered seats in a cinema: you can walk straight to seat 57, but if someone needs to sit in the middle, everyone after them must shuffle along. A linked list is a treasure hunt where each clue tells you where the next one is: adding a new clue in between is easy, but finding the 57th clue means following all 56 before it.',
            strong: [
                'Explains why: contiguous memory versus pointers.',
                'Mentions CPU cache effects.',
                'Gives a real use for linked lists (the LRU cache).',
            ],
            traps: [
                '"Linked lists are better for insertion", ignoring the O(n) to find the position.',
            ],
            followUps: [
                { q: 'How do you find the middle of a linked list in one pass?', a: 'Two pointers: a slow one moving one step and a fast one moving two. When the fast one reaches the end, the slow one is in the middle.' },
                { q: 'How do you detect a cycle in a linked list?', a: 'The same slow and fast pointers (Floyd\'s algorithm): if there is a cycle, the fast pointer eventually laps the slow one and they meet; if not, the fast one reaches the end.' },
            ],
            topicIds: ['linked-list', 'arrays-hashing'],
        },
        {
            id: 'dsa-bfs-dfs',
            q: 'BFS or DFS: when do you use each?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'Whether you choose a traversal by what the problem asks, and know their properties.',
            answer: 'Breadth-first search explores level by level, using a queue: everything one step away, then everything two steps away. So the first time BFS reaches a node, it has found the shortest path to it in an unweighted graph. I use it for shortest paths and minimum steps (word ladder, shortest path in a grid, the rotting-oranges problem), and for anything level by level, like a tree\'s levels.\n\nDepth-first search goes as deep as possible down one path before backing up, using recursion or a stack. I use it to explore everything or to check structure: counting islands or connected components, detecting cycles, topological sort, and backtracking problems such as permutations and subsets, where you build a path, explore, and undo.\n\nOther differences: BFS can use a lot of memory on wide graphs, because the whole frontier is stored; recursive DFS can hit the recursion limit on very deep graphs, so an explicit stack is safer. Both are O(V + E), and both must track visited nodes in graphs with cycles.',
            analogy: 'Looking for your keys in a house. BFS checks every room on the ground floor first, then every room on the first floor: if the keys are close, you find them by the shortest route. DFS goes all the way to the attic down one staircase, checks everything there, then comes back down and tries the next staircase: good for searching everywhere systematically.',
            diagram: {
                code: 'flowchart TD\n  A((A)) --> B((B))\n  A --> C((C))\n  B --> D((D))\n  B --> E((E))\n  C --> F((F))',
                caption: 'BFS visits A, B, C, D, E, F (level by level). DFS visits A, B, D, E, C, F (one branch fully, then the next).',
            },
            strong: [
                'Shortest path in unweighted graphs means BFS, and says why.',
                'DFS for components, cycles, topological order and backtracking.',
                'Mentions visited sets, memory differences and recursion limits.',
            ],
            traps: [
                'Using DFS for shortest paths.',
                'Forgetting the visited set and looping forever on a cycle.',
            ],
            followUps: [
                { q: 'What if the edges have different weights?', a: 'BFS no longer finds the shortest path. Use Dijkstra\'s algorithm (a priority queue ordered by distance) for non-negative weights.' },
                { q: 'How do you get the shortest path itself, not just its length, from BFS?', a: 'Store each node\'s parent when you first reach it, then walk back from the target to the start through the parents.' },
            ],
            topicIds: ['graphs', 'trees', 'backtracking', 'advanced-graphs'],
        },
        {
            id: 'dsa-dp',
            q: 'How do you recognise a dynamic programming problem, and how do you build the solution?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'A method for DP rather than memorised solutions, which is what makes new DP problems solvable.',
            answer: 'Two signs. The problem asks for an optimum or a count, such as the minimum cost, the number of ways or the longest something. And the answer can be built from answers to smaller versions of the same problem, which overlap: a naive recursion would solve the same subproblems again and again.\n\nThen four steps. Define the state: what dp[i] (or dp[i][j]) means, in words, such as "the number of ways to reach step i". Write the transition: how dp[i] comes from smaller states; for climbing stairs with 1 or 2 steps, dp[i] = dp[i−1] + dp[i−2]. Set the base cases: dp[0] = 1, dp[1] = 1. And choose the order: compute the states so that everything dp[i] needs is ready.\n\nYou can implement it top-down, as recursion with memoisation, which is often easier to get right first, or bottom-up, as a table filled in a loop, which avoids recursion limits and often lets you keep only the last row or two, reducing memory. I always test the recurrence on a tiny case by hand before coding.',
            analogy: 'Counting the ways to climb a staircase. To reach step 10, your last move came from step 9 or step 8, so the ways to reach 10 = ways to reach 9 + ways to reach 8. Instead of re-counting the ways to reach step 8 every time you need it, you write each answer on the step as you go up, and just read it.',
            strong: [
                'Names both properties: optimal substructure and overlapping subproblems.',
                'Defines the state in words before writing code.',
                'Knows top-down versus bottom-up, and space optimisation.',
            ],
            traps: [
                'Jumping to a table without defining what a cell means.',
                'Memorising solutions instead of the method.',
            ],
            followUps: [
                { q: 'What is the complexity of a DP solution?', a: 'Number of states × the work per transition. For a 1-D dp over n with O(1) transitions it is O(n); for a 2-D table over two strings of lengths m and n, O(m·n).' },
                { q: 'How is DP different from greedy?', a: 'Greedy makes the locally best choice and never revisits it, which is only correct when you can prove it (for example interval scheduling). DP considers all the relevant sub-choices through the recurrence, so it works when a greedy choice might be wrong.' },
            ],
            topicIds: ['1-d-dynamic-programming', '2-d-dynamic-programming', 'greedy'],
        },
        {
            id: 'dsa-two-pointers-window',
            q: 'When do you use two pointers, and when a sliding window?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'Pattern recognition from the wording of a problem.',
            answer: 'Both avoid an O(n²) double loop by moving pointers forward through the array, so each element is handled a constant number of times: O(n).\n\nTwo pointers, usually from both ends, work when the data is sorted, or the problem has a structure where moving one side is always the right choice: pair sums in a sorted array (if the sum is too small, move the left pointer up; too big, move the right one down), palindromes, container-with-most-water, removing duplicates in place. The wording to listen for: sorted, pair, in place, from both ends.\n\nA sliding window is for contiguous subarrays or substrings that must satisfy a condition: the longest substring without repeating characters, the smallest subarray with sum at least k, the maximum in every window of size k. Grow the window on the right; when the condition breaks, shrink it from the left. The wording: contiguous, substring, subarray, longest, shortest, at most k.\n\nThe key requirement for a variable window: the condition must be monotonic, so once a window breaks the rule, making it bigger can\'t fix it. Negative numbers in a sum problem break this, which is when you switch to prefix sums with a hash map.',
            analogy: 'Two pointers: two people searching a sorted bookshelf from both ends for two books whose page counts add up to 500; each knows which way to move. A sliding window: a magnifying glass you slide along a line of text, widening it to take in more letters and narrowing it from the back whenever it covers something not allowed.',
            strong: [
                'Gives the trigger words for each.',
                'Explains why it is O(n): each pointer only moves forward.',
                'Knows the monotonic requirement and the negative-number exception.',
            ],
            traps: [
                'Using a sliding window when elements can be negative in a sum constraint.',
                'Two pointers on unsorted data without sorting (and losing original indices).',
            ],
            followUps: [
                { q: 'Find a subarray with sum exactly k when numbers can be negative. Which pattern?', a: 'Prefix sums with a hash map: keep a running sum, and at each position check whether (running sum − k) has been seen before. O(n), and it works with negatives.' },
                { q: 'Why is a sliding window O(n) even though there is an inner loop?', a: 'The left pointer only moves forward and never past the right one, so over the whole run it moves at most n times in total, not n times per step.' },
            ],
            topicIds: ['two-pointers', 'sliding-window', 'arrays-hashing'],
        },
        {
            id: 'dsa-heap',
            q: 'When would you use a heap? How would you find the top 10 items in a stream of a billion?',
            level: 'intermediate',
            kind: 'concept',
            testing: 'Knowing the heap\'s strengths and the classic k-largest technique.',
            answer: 'A heap gives fast access to the smallest (or largest) element: peek in O(1), insert and remove the top in O(log n). I use it whenever I repeatedly need "the next best": scheduling by priority, merging k sorted lists, Dijkstra\'s shortest paths, and the median of a stream with two heaps.\n\nTop 10 of a billion: don\'t sort a billion items. Keep a min-heap of size 10 holding the 10 largest seen so far. For each new item, if it is larger than the heap\'s smallest, pop the smallest and push the new item. Each step is O(log 10), so the whole stream is O(n log k), roughly O(n), and the memory is just 10 items, which is what makes it work for a stream that doesn\'t fit in memory.\n\nIt feels backwards at first: a min-heap for the largest items, because its top is the weakest member of the current top 10, the one to kick out.',
            analogy: 'Choosing the 10 tallest people from a queue of a billion. You keep 10 chairs, and remember who is shortest among those seated. Each new person is compared only with that shortest one: if taller, they swap. You never have to line up the whole billion.',
            strong: [
                'Gives operation costs.',
                'Uses a min-heap of size k for the k largest, and explains why.',
                'Notes O(n log k) time and O(k) memory.',
            ],
            traps: [
                'Sorting everything: O(n log n) time and all n items in memory.',
                'A max-heap of all n items.',
            ],
            followUps: [
                { q: 'How do you keep the running median of a stream?', a: 'Two heaps: a max-heap for the lower half and a min-heap for the upper half, kept balanced in size. The median is the top of one, or the average of both tops.' },
                { q: 'What if you need the exact top 10 across 100 machines?', a: 'Each machine computes its own top 10, then one machine merges the 100 lists (1,000 items) and takes the top 10. The global top 10 must be in some machine\'s local top 10.' },
            ],
            topicIds: ['heap-priority-queue'],
        },
        {
            id: 'dsa-stuck',
            q: 'You are stuck in a live coding interview and the clock is running. What do you do?',
            level: 'beginner',
            kind: 'scenario',
            testing: 'Composure and communication under pressure, which interviewers are explicitly watching.',
            answer: 'First, say it out loud, calmly: "I\'m stuck on how to avoid recomputing this; let me step back." Silence is the worst option, because the interviewer can\'t help or give credit for thinking they can\'t see.\n\nThen I use tactics that usually unstick me. Go back to a small example and solve it by hand, slowly, noticing what I actually do. Solve a simpler version: smaller input, no duplicates, one dimension instead of two. Write the brute force if I haven\'t, because a working slow solution is real progress and often shows the repeated work to optimise. Run through the pattern list: could a hash map, two pointers, a sort, a heap, BFS or DP help here?\n\nIf I am still stuck after a few minutes, I ask a specific question, such as "Is it fair to assume the input fits in memory?" or "Would sorting first be acceptable?". Interviewers expect to give hints, and how you use a hint is part of what they score. Throughout, I keep the code I have clean and explain where I am going.',
            analogy: 'Getting lost while driving. Panicking and driving faster makes it worse. You pull over, look at the map from where you actually are, try the main road you know, and if you are still lost, ask someone for directions. Asking isn\'t failing; driving in circles in silence is.',
            steps: [
                'Say you are stuck, and what exactly you are stuck on.',
                'Work a small example by hand.',
                'Simplify the problem, or write the brute force.',
                'Run through the common patterns.',
                'Ask a specific clarifying question or for a hint, and use it well.',
            ],
            strong: [
                'Keeps talking and stays calm.',
                'Has concrete unsticking tactics.',
                'Asks targeted questions, not "what\'s the answer?".',
            ],
            traps: [
                'Going silent for minutes.',
                'Abandoning working code to chase a half-formed clever idea.',
            ],
            followUps: [
                { q: 'You realise halfway through that your approach is wrong. What now?', a: 'Say so immediately, explain why it fails (ideally with the example that breaks it), and propose the fix. Interviewers value catching your own bugs highly.' },
                { q: 'You finish early. What do you do?', a: 'Test more edge cases, discuss the complexity, suggest improvements or alternative approaches, and talk about how the code would change for very large inputs.' },
            ],
            topicIds: ['arrays-hashing', 'two-pointers', '1-d-dynamic-programming'],
        },
    ],
};
