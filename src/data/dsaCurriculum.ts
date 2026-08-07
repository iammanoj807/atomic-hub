// src/data/dsaCurriculum.ts

export interface DSAProblem {
    id: string;
    title: string;
    url: string;
}

export interface DSATopic {
    id: string;
    number: number;
    title: string;
    description: string;
    problems: DSAProblem[];
}

export interface DSASection {
    id: string;
    title: string;
    topics: DSATopic[];
}

export interface DSAPhase {
    id: string;
    title: string;
    sections: DSASection[];
}


// NeetCode 150 Official Data Layer
// Each phase represents a rough grouping of topics (though the 18 topics are flatly mapped in the UI view)
export const dsaCurriculum: DSAPhase[] = [
    {
        id: 'phase-1-fundamentals',
        title: 'Fundamentals',
        sections: [
            {
                id: 'core',
                title: 'Core Structures',
                topics: [
                    {
                        id: 'arrays-hashing',
                        number: 1,
                        title: 'Arrays & Hashing',
                        description: 'Official Neetcode Arrays & Hashing category.',
                        problems: [
                            { id: 'contains-duplicate', title: 'Contains Duplicate', url: 'https://leetcode.com/problems/contains-duplicate/' },
                            { id: 'valid-anagram', title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/' },
                            { id: 'two-sum', title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/' },
                            { id: 'group-anagrams', title: 'Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams/' },
                            { id: 'top-k-frequent-elements', title: 'Top K Frequent Elements', url: 'https://leetcode.com/problems/top-k-frequent-elements/' },
                            { id: 'encode-and-decode-strings', title: 'Encode and Decode Strings', url: 'https://leetcode.com/problems/encode-and-decode-strings/' },
                            { id: 'product-of-array-except-self', title: 'Product of Array Except Self', url: 'https://leetcode.com/problems/product-of-array-except-self/' },
                            { id: 'valid-sudoku', title: 'Valid Sudoku', url: 'https://leetcode.com/problems/valid-sudoku/' },
                            { id: 'longest-consecutive-sequence', title: 'Longest Consecutive Sequence', url: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
                        ]
                    },
                    {
                        id: 'two-pointers',
                        number: 2,
                        title: 'Two Pointers',
                        description: 'Official Neetcode Two Pointers category.',
                        problems: [
                            { id: 'valid-palindrome', title: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/' },
                            { id: 'two-sum-ii-input-array-is-sorted', title: 'Two Sum II Input Array Is Sorted', url: 'https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/' },
                            { id: '3sum', title: '3Sum', url: 'https://leetcode.com/problems/3sum/' },
                            { id: 'container-with-most-water', title: 'Container With Most Water', url: 'https://leetcode.com/problems/container-with-most-water/' },
                            { id: 'trapping-rain-water', title: 'Trapping Rain Water', url: 'https://leetcode.com/problems/trapping-rain-water/' },
                        ]
                    },
                    {
                        id: 'sliding-window',
                        number: 3,
                        title: 'Sliding Window',
                        description: 'Official Neetcode Sliding Window category.',
                        problems: [
                            { id: 'best-time-to-buy-and-sell-stock', title: 'Best Time to Buy And Sell Stock', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/' },
                            { id: 'longest-substring-without-repeating-characters', title: 'Longest Substring Without Repeating Characters', url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/' },
                            { id: 'longest-repeating-character-replacement', title: 'Longest Repeating Character Replacement', url: 'https://leetcode.com/problems/longest-repeating-character-replacement/' },
                            { id: 'permutation-in-string', title: 'Permutation In String', url: 'https://leetcode.com/problems/permutation-in-string/' },
                            { id: 'minimum-window-substring', title: 'Minimum Window Substring', url: 'https://leetcode.com/problems/minimum-window-substring/' },
                            { id: 'sliding-window-maximum', title: 'Sliding Window Maximum', url: 'https://leetcode.com/problems/sliding-window-maximum/' },
                        ]
                    },
                    {
                        id: 'stack',
                        number: 4,
                        title: 'Stack',
                        description: 'Official Neetcode Stack category.',
                        problems: [
                            { id: 'valid-parentheses', title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/' },
                            { id: 'min-stack', title: 'Min Stack', url: 'https://leetcode.com/problems/min-stack/' },
                            { id: 'evaluate-reverse-polish-notation', title: 'Evaluate Reverse Polish Notation', url: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/' },
                            { id: 'daily-temperatures', title: 'Daily Temperatures', url: 'https://leetcode.com/problems/daily-temperatures/' },
                            { id: 'car-fleet', title: 'Car Fleet', url: 'https://leetcode.com/problems/car-fleet/' },
                            { id: 'largest-rectangle-in-histogram', title: 'Largest Rectangle In Histogram', url: 'https://leetcode.com/problems/largest-rectangle-in-histogram/' },
                        ]
                    },
                    {
                        id: 'binary-search',
                        number: 5,
                        title: 'Binary Search',
                        description: 'Official Neetcode Binary Search category.',
                        problems: [
                            { id: 'binary-search', title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/' },
                            { id: 'search-a-2d-matrix', title: 'Search a 2D Matrix', url: 'https://leetcode.com/problems/search-a-2d-matrix/' },
                            { id: 'koko-eating-bananas', title: 'Koko Eating Bananas', url: 'https://leetcode.com/problems/koko-eating-bananas/' },
                            { id: 'find-minimum-in-rotated-sorted-array', title: 'Find Minimum In Rotated Sorted Array', url: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/' },
                            { id: 'search-in-rotated-sorted-array', title: 'Search In Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/' },
                            { id: 'time-based-key-value-store', title: 'Time Based Key Value Store', url: 'https://leetcode.com/problems/time-based-key-value-store/' },
                            { id: 'median-of-two-sorted-arrays', title: 'Median of Two Sorted Arrays', url: 'https://leetcode.com/problems/median-of-two-sorted-arrays/' },
                        ]
                    },
                    {
                        id: 'linked-list',
                        number: 6,
                        title: 'Linked List',
                        description: 'Official Neetcode Linked List category.',
                        problems: [
                            { id: 'reverse-linked-list', title: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/' },
                            { id: 'merge-two-sorted-lists', title: 'Merge Two Sorted Lists', url: 'https://leetcode.com/problems/merge-two-sorted-lists/' },
                            { id: 'linked-list-cycle', title: 'Linked List Cycle', url: 'https://leetcode.com/problems/linked-list-cycle/' },
                            { id: 'reorder-list', title: 'Reorder List', url: 'https://leetcode.com/problems/reorder-list/' },
                            { id: 'remove-nth-node-from-end-of-list', title: 'Remove Nth Node From End of List', url: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/' },
                            { id: 'copy-list-with-random-pointer', title: 'Copy List With Random Pointer', url: 'https://leetcode.com/problems/copy-list-with-random-pointer/' },
                            { id: 'add-two-numbers', title: 'Add Two Numbers', url: 'https://leetcode.com/problems/add-two-numbers/' },
                            { id: 'find-the-duplicate-number', title: 'Find The Duplicate Number', url: 'https://leetcode.com/problems/find-the-duplicate-number/' },
                            { id: 'lru-cache', title: 'LRU Cache', url: 'https://leetcode.com/problems/lru-cache/' },
                            { id: 'merge-k-sorted-lists', title: 'Merge K Sorted Lists', url: 'https://leetcode.com/problems/merge-k-sorted-lists/' },
                            { id: 'reverse-nodes-in-k-group', title: 'Reverse Nodes In K Group', url: 'https://leetcode.com/problems/reverse-nodes-in-k-group/' },
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'phase-2-advanced',
        title: 'Advanced Data Structures & Algorithms',
        sections: [
            {
                id: 'advanced',
                title: 'Trees & Graphs',
                topics: [
                    {
                        id: 'trees',
                        number: 7,
                        title: 'Trees',
                        description: 'Official Neetcode Trees category.',
                        problems: [
                            { id: 'invert-binary-tree', title: 'Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/' },
                            { id: 'maximum-depth-of-binary-tree', title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/' },
                            { id: 'diameter-of-binary-tree', title: 'Diameter of Binary Tree', url: 'https://leetcode.com/problems/diameter-of-binary-tree/' },
                            { id: 'balanced-binary-tree', title: 'Balanced Binary Tree', url: 'https://leetcode.com/problems/balanced-binary-tree/' },
                            { id: 'same-tree', title: 'Same Tree', url: 'https://leetcode.com/problems/same-tree/' },
                            { id: 'subtree-of-another-tree', title: 'Subtree of Another Tree', url: 'https://leetcode.com/problems/subtree-of-another-tree/' },
                            { id: 'lowest-common-ancestor-of-a-binary-search-tree', title: 'Lowest Common Ancestor of a Binary Search Tree', url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/' },
                            { id: 'binary-tree-level-order-traversal', title: 'Binary Tree Level Order Traversal', url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/' },
                            { id: 'binary-tree-right-side-view', title: 'Binary Tree Right Side View', url: 'https://leetcode.com/problems/binary-tree-right-side-view/' },
                            { id: 'count-good-nodes-in-binary-tree', title: 'Count Good Nodes In Binary Tree', url: 'https://leetcode.com/problems/count-good-nodes-in-binary-tree/' },
                            { id: 'validate-binary-search-tree', title: 'Validate Binary Search Tree', url: 'https://leetcode.com/problems/validate-binary-search-tree/' },
                            { id: 'kth-smallest-element-in-a-bst', title: 'Kth Smallest Element In a BST', url: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/' },
                            { id: 'construct-binary-tree-from-preorder-and-inorder-traversal', title: 'Construct Binary Tree From Preorder And Inorder Traversal', url: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/' },
                            { id: 'binary-tree-maximum-path-sum', title: 'Binary Tree Maximum Path Sum', url: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/' },
                            { id: 'serialize-and-deserialize-binary-tree', title: 'Serialize And Deserialize Binary Tree', url: 'https://leetcode.com/problems/serialize-and-deserialize-binary-tree/' },
                        ]
                    },
                    {
                        id: 'heap-priority-queue',
                        number: 8,
                        title: 'Heap / Priority Queue',
                        description: 'Official Neetcode Heap / Priority Queue category.',
                        problems: [
                            { id: 'kth-largest-element-in-a-stream', title: 'Kth Largest Element In a Stream', url: 'https://leetcode.com/problems/kth-largest-element-in-a-stream/' },
                            { id: 'last-stone-weight', title: 'Last Stone Weight', url: 'https://leetcode.com/problems/last-stone-weight/' },
                            { id: 'k-closest-points-to-origin', title: 'K Closest Points to Origin', url: 'https://leetcode.com/problems/k-closest-points-to-origin/' },
                            { id: 'kth-largest-element-in-an-array', title: 'Kth Largest Element In An Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/' },
                            { id: 'task-scheduler', title: 'Task Scheduler', url: 'https://leetcode.com/problems/task-scheduler/' },
                            { id: 'design-twitter', title: 'Design Twitter', url: 'https://leetcode.com/problems/design-twitter/' },
                            { id: 'find-median-from-data-stream', title: 'Find Median From Data Stream', url: 'https://leetcode.com/problems/find-median-from-data-stream/' },
                        ]
                    },
                    {
                        id: 'backtracking',
                        number: 9,
                        title: 'Backtracking',
                        description: 'Official Neetcode Backtracking category.',
                        problems: [
                            { id: 'subsets', title: 'Subsets', url: 'https://leetcode.com/problems/subsets/' },
                            { id: 'combination-sum', title: 'Combination Sum', url: 'https://leetcode.com/problems/combination-sum/' },
                            { id: 'combination-sum-ii', title: 'Combination Sum II', url: 'https://leetcode.com/problems/combination-sum-ii/' },
                            { id: 'permutations', title: 'Permutations', url: 'https://leetcode.com/problems/permutations/' },
                            { id: 'subsets-ii', title: 'Subsets II', url: 'https://leetcode.com/problems/subsets-ii/' },
                            { id: 'generate-parentheses', title: 'Generate Parentheses', url: 'https://leetcode.com/problems/generate-parentheses/' },
                            { id: 'word-search', title: 'Word Search', url: 'https://leetcode.com/problems/word-search/' },
                            { id: 'palindrome-partitioning', title: 'Palindrome Partitioning', url: 'https://leetcode.com/problems/palindrome-partitioning/' },
                            { id: 'letter-combinations-of-a-phone-number', title: 'Letter Combinations of a Phone Number', url: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/' },
                            { id: 'n-queens', title: 'N Queens', url: 'https://leetcode.com/problems/n-queens/' },
                        ]
                    },
                    {
                        id: 'tries',
                        number: 10,
                        title: 'Tries',
                        description: 'Official Neetcode Tries category.',
                        problems: [
                            { id: 'implement-trie-prefix-tree', title: 'Implement Trie Prefix Tree', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/' },
                            { id: 'design-add-and-search-words-data-structure', title: 'Design Add And Search Words Data Structure', url: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/' },
                            { id: 'word-search-ii', title: 'Word Search II', url: 'https://leetcode.com/problems/word-search-ii/' },
                        ]
                    },
                    {
                        id: 'graphs',
                        number: 11,
                        title: 'Graphs',
                        description: 'Official Neetcode Graphs category.',
                        problems: [
                            { id: 'number-of-islands', title: 'Number of Islands', url: 'https://leetcode.com/problems/number-of-islands/' },
                            { id: 'max-area-of-island', title: 'Max Area of Island', url: 'https://leetcode.com/problems/max-area-of-island/' },
                            { id: 'clone-graph', title: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph/' },
                            { id: 'walls-and-gates', title: 'Walls And Gates', url: 'https://leetcode.com/problems/walls-and-gates/' },
                            { id: 'rotting-oranges', title: 'Rotting Oranges', url: 'https://leetcode.com/problems/rotting-oranges/' },
                            { id: 'pacific-atlantic-water-flow', title: 'Pacific Atlantic Water Flow', url: 'https://leetcode.com/problems/pacific-atlantic-water-flow/' },
                            { id: 'surrounded-regions', title: 'Surrounded Regions', url: 'https://leetcode.com/problems/surrounded-regions/' },
                            { id: 'course-schedule', title: 'Course Schedule', url: 'https://leetcode.com/problems/course-schedule/' },
                            { id: 'course-schedule-ii', title: 'Course Schedule II', url: 'https://leetcode.com/problems/course-schedule-ii/' },
                            { id: 'graph-valid-tree', title: 'Graph Valid Tree', url: 'https://leetcode.com/problems/graph-valid-tree/' },
                            { id: 'number-of-connected-components-in-an-undirected-graph', title: 'Number of Connected Components In An Undirected Graph', url: 'https://leetcode.com/problems/number-of-connected-components-in-an-undirected-graph/' },
                            { id: 'redundant-connection', title: 'Redundant Connection', url: 'https://leetcode.com/problems/redundant-connection/' },
                            { id: 'word-ladder', title: 'Word Ladder', url: 'https://leetcode.com/problems/word-ladder/' },
                        ]
                    },
                    {
                        id: 'advanced-graphs',
                        number: 12,
                        title: 'Advanced Graphs',
                        description: 'Official Neetcode Advanced Graphs category.',
                        problems: [
                            { id: 'network-delay-time', title: 'Network Delay Time', url: 'https://leetcode.com/problems/network-delay-time/' },
                            { id: 'reconstruct-itinerary', title: 'Reconstruct Itinerary', url: 'https://leetcode.com/problems/reconstruct-itinerary/' },
                            { id: 'min-cost-to-connect-all-points', title: 'Min Cost to Connect All Points', url: 'https://leetcode.com/problems/min-cost-to-connect-all-points/' },
                            { id: 'swim-in-rising-water', title: 'Swim In Rising Water', url: 'https://leetcode.com/problems/swim-in-rising-water/' },
                            { id: 'alien-dictionary', title: 'Alien Dictionary', url: 'https://leetcode.com/problems/alien-dictionary/' },
                            { id: 'cheapest-flights-within-k-stops', title: 'Cheapest Flights Within K Stops', url: 'https://leetcode.com/problems/cheapest-flights-within-k-stops/' },
                        ]
                    }
                ]
            }
        ]
    },
    {
        id: 'phase-3-mastery',
        title: 'Algorithmic Mastery',
        sections: [
            {
                id: 'mastery',
                title: 'DP & Advanced Topics',
                topics: [
                    {
                        id: '1-d-dynamic-programming',
                        number: 13,
                        title: '1-D Dynamic Programming',
                        description: 'Official Neetcode 1-D Dynamic Programming category.',
                        problems: [
                            { id: 'climbing-stairs', title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/' },
                            { id: 'min-cost-climbing-stairs', title: 'Min Cost Climbing Stairs', url: 'https://leetcode.com/problems/min-cost-climbing-stairs/' },
                            { id: 'house-robber', title: 'House Robber', url: 'https://leetcode.com/problems/house-robber/' },
                            { id: 'house-robber-ii', title: 'House Robber II', url: 'https://leetcode.com/problems/house-robber-ii/' },
                            { id: 'longest-palindromic-substring', title: 'Longest Palindromic Substring', url: 'https://leetcode.com/problems/longest-palindromic-substring/' },
                            { id: 'palindromic-substrings', title: 'Palindromic Substrings', url: 'https://leetcode.com/problems/palindromic-substrings/' },
                            { id: 'decode-ways', title: 'Decode Ways', url: 'https://leetcode.com/problems/decode-ways/' },
                            { id: 'coin-change', title: 'Coin Change', url: 'https://leetcode.com/problems/coin-change/' },
                            { id: 'maximum-product-subarray', title: 'Maximum Product Subarray', url: 'https://leetcode.com/problems/maximum-product-subarray/' },
                            { id: 'word-break', title: 'Word Break', url: 'https://leetcode.com/problems/word-break/' },
                            { id: 'longest-increasing-subsequence', title: 'Longest Increasing Subsequence', url: 'https://leetcode.com/problems/longest-increasing-subsequence/' },
                            { id: 'partition-equal-subset-sum', title: 'Partition Equal Subset Sum', url: 'https://leetcode.com/problems/partition-equal-subset-sum/' },
                        ]
                    },
                    {
                        id: '2-d-dynamic-programming',
                        number: 14,
                        title: '2-D Dynamic Programming',
                        description: 'Official Neetcode 2-D Dynamic Programming category.',
                        problems: [
                            { id: 'unique-paths', title: 'Unique Paths', url: 'https://leetcode.com/problems/unique-paths/' },
                            { id: 'longest-common-subsequence', title: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/' },
                            { id: 'best-time-to-buy-and-sell-stock-with-cooldown', title: 'Best Time to Buy And Sell Stock With Cooldown', url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/' },
                            { id: 'coin-change-ii', title: 'Coin Change II', url: 'https://leetcode.com/problems/coin-change-ii/' },
                            { id: 'target-sum', title: 'Target Sum', url: 'https://leetcode.com/problems/target-sum/' },
                            { id: 'interleaving-string', title: 'Interleaving String', url: 'https://leetcode.com/problems/interleaving-string/' },
                            { id: 'longest-increasing-path-in-a-matrix', title: 'Longest Increasing Path In a Matrix', url: 'https://leetcode.com/problems/longest-increasing-path-in-a-matrix/' },
                            { id: 'distinct-subsequences', title: 'Distinct Subsequences', url: 'https://leetcode.com/problems/distinct-subsequences/' },
                            { id: 'edit-distance', title: 'Edit Distance', url: 'https://leetcode.com/problems/edit-distance/' },
                            { id: 'burst-balloons', title: 'Burst Balloons', url: 'https://leetcode.com/problems/burst-balloons/' },
                            { id: 'regular-expression-matching', title: 'Regular Expression Matching', url: 'https://leetcode.com/problems/regular-expression-matching/' },
                        ]
                    },
                    {
                        id: 'greedy',
                        number: 15,
                        title: 'Greedy',
                        description: 'Official Neetcode Greedy category.',
                        problems: [
                            { id: 'maximum-subarray', title: 'Maximum Subarray', url: 'https://leetcode.com/problems/maximum-subarray/' },
                            { id: 'jump-game', title: 'Jump Game', url: 'https://leetcode.com/problems/jump-game/' },
                            { id: 'jump-game-ii', title: 'Jump Game II', url: 'https://leetcode.com/problems/jump-game-ii/' },
                            { id: 'gas-station', title: 'Gas Station', url: 'https://leetcode.com/problems/gas-station/' },
                            { id: 'hand-of-straights', title: 'Hand of Straights', url: 'https://leetcode.com/problems/hand-of-straights/' },
                            { id: 'merge-triplets-to-form-target-triplet', title: 'Merge Triplets to Form Target Triplet', url: 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/' },
                            { id: 'partition-labels', title: 'Partition Labels', url: 'https://leetcode.com/problems/partition-labels/' },
                            { id: 'valid-parenthesis-string', title: 'Valid Parenthesis String', url: 'https://leetcode.com/problems/valid-parenthesis-string/' },
                        ]
                    },
                    {
                        id: 'intervals',
                        number: 16,
                        title: 'Intervals',
                        description: 'Official Neetcode Intervals category.',
                        problems: [
                            { id: 'insert-interval', title: 'Insert Interval', url: 'https://leetcode.com/problems/insert-interval/' },
                            { id: 'merge-intervals', title: 'Merge Intervals', url: 'https://leetcode.com/problems/merge-intervals/' },
                            { id: 'non-overlapping-intervals', title: 'Non Overlapping Intervals', url: 'https://leetcode.com/problems/non-overlapping-intervals/' },
                            { id: 'meeting-rooms', title: 'Meeting Rooms', url: 'https://leetcode.com/problems/meeting-rooms/' },
                            { id: 'meeting-rooms-ii', title: 'Meeting Rooms II', url: 'https://leetcode.com/problems/meeting-rooms-ii/' },
                            { id: 'minimum-interval-to-include-each-query', title: 'Minimum Interval to Include Each Query', url: 'https://leetcode.com/problems/minimum-interval-to-include-each-query/' },
                        ]
                    },
                    {
                        id: 'math-geometry',
                        number: 17,
                        title: 'Math & Geometry',
                        description: 'Official Neetcode Math & Geometry category.',
                        problems: [
                            { id: 'rotate-image', title: 'Rotate Image', url: 'https://leetcode.com/problems/rotate-image/' },
                            { id: 'spiral-matrix', title: 'Spiral Matrix', url: 'https://leetcode.com/problems/spiral-matrix/' },
                            { id: 'set-matrix-zeroes', title: 'Set Matrix Zeroes', url: 'https://leetcode.com/problems/set-matrix-zeroes/' },
                            { id: 'happy-number', title: 'Happy Number', url: 'https://leetcode.com/problems/happy-number/' },
                            { id: 'plus-one', title: 'Plus One', url: 'https://leetcode.com/problems/plus-one/' },
                            { id: 'pow-x-n', title: 'Pow(x, n)', url: 'https://leetcode.com/problems/powx-n/' },
                            { id: 'multiply-strings', title: 'Multiply Strings', url: 'https://leetcode.com/problems/multiply-strings/' },
                            { id: 'detect-squares', title: 'Detect Squares', url: 'https://leetcode.com/problems/detect-squares/' },
                        ]
                    },
                    {
                        id: 'bit-manipulation',
                        number: 18,
                        title: 'Bit Manipulation',
                        description: 'Official Neetcode Bit Manipulation category.',
                        problems: [
                            { id: 'single-number', title: 'Single Number', url: 'https://leetcode.com/problems/single-number/' },
                            { id: 'number-of-1-bits', title: 'Number of 1 Bits', url: 'https://leetcode.com/problems/number-of-1-bits/' },
                            { id: 'counting-bits', title: 'Counting Bits', url: 'https://leetcode.com/problems/counting-bits/' },
                            { id: 'reverse-bits', title: 'Reverse Bits', url: 'https://leetcode.com/problems/reverse-bits/' },
                            { id: 'missing-number', title: 'Missing Number', url: 'https://leetcode.com/problems/missing-number/' },
                            { id: 'sum-of-two-integers', title: 'Sum of Two Integers', url: 'https://leetcode.com/problems/sum-of-two-integers/' },
                            { id: 'reverse-integer', title: 'Reverse Integer', url: 'https://leetcode.com/problems/reverse-integer/' },
                        ]
                    }
                ]
            }
        ]
    }
];

export const getTotalTopics = () => {
    let count = 0;
    dsaCurriculum.forEach(phase => {
        phase.sections.forEach(section => {
            count += section.topics.length;
        });
    });
    return count;
};

export const getTotalProblems = () => {
    let count = 0;
    dsaCurriculum.forEach(phase => {
        phase.sections.forEach(section => {
            section.topics.forEach(topic => {
                count += topic.problems.length;
            });
        });
    });
    return count;
};
