// src/data/dsaContent.ts

export interface ProblemResource {
    title: string;
    url?: string;
    type: 'video' | 'article' | 'problem';
    platform?: 'leetcode' | 'neetcode' | 'other';
    priority?: 1 | 2 | 3; // 1 = Must do, 2 = Highly recommended, 3 = Optional
    leetcodeNum?: number;
}

export interface DSAContentCategory {
    categoryId: string;
    title: string;
    introduction: string;
    keyConcepts: string[];
    resources: ProblemResource[];
    commonPatterns?: {
        name: string;
        description: string;
        example: string;
    }[];
    timeComplexity?: string;
    spaceComplexity?: string;
    practiceProblems: {
        easy: ProblemResource[];
        medium: ProblemResource[];
        hard: ProblemResource[];
    };
    videoUrl?: string; // High level concept review if available
    whatItIs?: string;
    whenToUse?: string[];
    howItWorks?: string;
    exampleWalkthrough?: {
        input: string;
        steps: string[];
        result: string;
    };
    codeTemplate?: string;
    commonMistakes?: string[];
    interviewTips?: {
        howToRecognize: string;
        whatToSay: string;
        followUpPrep: string;
    };
    relatedPatterns?: {
        pattern: string;
        description: string;
    }[];
}

export type DSAProblemItem = ProblemResource;

export const getTopicContent = (id: string): DSAContentCategory | undefined => {
    return dsaTopicContent[id];
};

export const dsaTopicContent: Record<string, DSAContentCategory> = {
    'arrays-hashing': {
        categoryId: 'arrays-hashing',
        title: 'Arrays & Hashing',
        introduction: 'Study guide and resource list for Arrays & Hashing.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Think of Arrays and Hashing as your foundation. An array is just a contiguous block of memory where you store items in a row, like parking spots in a lot. Hashing (using a HashMap or HashSet) is a magical tool that lets you answer the question 'Have I seen this before?' or 'Where is this item?' in exactly 1 step (O(1) time). When you combine them, you get the absolute best of both worlds: checking if things exist instantly, while keeping track of all items.",
        whenToUse: [
            "When you need to count how many times an element appears.",
            "When you need to look up an element instantly O(1) without looping through the array again.",
            "When you need to map a specific key to a specific value.",
            "When the problem asks for pairs, duplicates, or missing numbers."
        ],
        howItWorks: "Usually, you loop through an array from left to right. As you look at each item, you ask your Hash Map a question (e.g., 'Have I seen your pair before?'). If the answer is yes, you're done! If no, you simply throw that current item into the Hash Map and move on to the next one.",
        exampleWalkthrough: {
            input: "nums = [2, 7, 11, 15], target = 9",
            steps: [
                "Look at 2. Ask Map: Do you have 9-2 (7)? Map says no. Add 2 to Map.",
                "Look at 7. Ask Map: Do you have 9-7 (2)? Map says YES! We found our pair."
            ],
            result: "[0, 1]"
        },
        codeTemplate: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        Map<Integer, Integer> map = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int complement = target - nums[i];\n            if (map.containsKey(complement)) {\n                return new int[] { map.get(complement), i };\n            }\n            map.put(nums[i], i);\n        }\n        return new int[]{};\n    }\n}`,
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        commonMistakes: [
            "Forgetting that Hash Maps use more memory (Space Complexity becomes O(N)).",
            "Trying to use Arrays for lookups instead of HashSets, which makes your code O(N^2) instead of O(N)."
        ],
        interviewTips: {
            howToRecognize: "The prompt mentions 'pairs', 'duplicates', or 'frequency/counting'.",
            whatToSay: "'I can immediately optimize the O(N^2) brute force solution to O(N) by trading space for time using a HashMap.'",
            followUpPrep: "Be ready to explain how Hash Collisions work."
        },
        relatedPatterns: [
            { pattern: "Prefix Sum", description: "Often combined with HashMaps to remember running totals." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Contains Duplicate', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Valid Anagram', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Two Sum', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Group Anagrams', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Top K Frequent Elements', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Encode and Decode Strings', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Product of Array Except Self', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Valid Sudoku', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Longest Consecutive Sequence', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [

            ]
        }
    },
    'two-pointers': {
        categoryId: 'two-pointers',
        title: 'Two Pointers',
        introduction: 'Study guide and resource list for Two Pointers.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Imagine you and a friend are searching a library. Instead of you searching the whole library alone, you start at the front door, and your friend starts at the back door. You walk towards each other until you meet in the middle. That's the Two Pointer technique! It's a strategy where you use two variables (pointers) to iterate through an array or string simultaneously, usually from opposite ends or moving at different speeds.",
        whenToUse: [
            "When dealing with sorted arrays or string palindromes.",
            "When searching for pairs that sum up to a target (if sorted).",
            "When reversing an array or string completely in-place."
        ],
        howItWorks: "You initialize a `left` pointer at index 0, and a `right` pointer at the last index. You run a `while (left < right)` loop. Depending on the condition, you either move the left pointer forward `left++` or the right pointer backward `right--` until they meet.",
        exampleWalkthrough: {
            input: 's = "racecar"',
            steps: [
                "left='r', right='r'. They match. Move pointers inward (left++, right--).",
                "left='a', right='a'. They match. Move inward.",
                "left='c', right='c'. They match.",
                "left and right cross paths at 'e'. It's a valid Palindrome!"
            ],
            result: "true"
        },
        codeTemplate: `class Solution {\n    public boolean isPalindrome(String s) {\n        int left = 0, right = s.length() - 1;\n        while (left < right) {\n            if (s.charAt(left) != s.charAt(right)) {\n                return false;\n            }\n            left++;\n            right--;\n        }\n        return true;\n    }\n}`,
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        commonMistakes: [
            "Using a `while (left <= right)` loop when it should technically be `left < right` (which might cause double inner swaps).",
            "Forgetting to actually increment or decrement the pointers inside the loop, causing an infinite loop crash!"
        ],
        interviewTips: {
            howToRecognize: "The array is explicitly SORTED, or you need to find a combination of elements at opposite ends.",
            whatToSay: "'Since the array is sorted, we can avoid O(N) extra space by using two pointers from opposite ends.'",
            followUpPrep: "What if there are duplicates in the sorted array? (You might have to skip them)."
        },
        relatedPatterns: [
            { pattern: "Sliding Window", description: "A variation of Two Pointers where the pointers move in the same direction." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Valid Palindrome', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Two Sum II Input Array Is Sorted', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: '3Sum', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Container With Most Water', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Trapping Rain Water', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'sliding-window': {
        categoryId: 'sliding-window',
        title: 'Sliding Window',
        introduction: 'Study guide and resource list for Sliding Window.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Think of a Sliding Window as taking a rectangular frame and dragging it across a long picture. Instead of examining the entire picture at once, you only process what fits inside your frame at any given exact moment. As the frame slides to the right, one new item comes into view, and one old item drops out. This is incredibly powerful for analyzing sub-arrays.",
        whenToUse: [
            "When asked to find the longest/shortest 'substring' or 'subarray'.",
            "When looking for a continuous sequence that meets a certain condition.",
            "When finding the max/min sum of a specific window size 'K'."
        ],
        howItWorks: "You use two forward-moving pointers, `left` and `right`. The `right` pointer expands the window by moving forward in the loop. If the window ever becomes invalid (e.g., getting too large or containing duplicates), you smoothly shrink it by moving the `left` pointer forward until it's valid again.",
        exampleWalkthrough: {
            input: 's = "abcabc" (Find longest without dupes)',
            steps: [
                "Right='a'. Window='a'. Max=1.",
                "Right='b'. Window='ab'. Max=2.",
                "Right='c'. Window='abc'. Max=3.",
                "Right='a' (duplicate detected!). Shrink left to drop the old 'a'. Window='bca'. Max=3."
            ],
            result: "3"
        },
        codeTemplate: `class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Set<Character> window = new HashSet<>();\n        int left = 0, maxLength = 0;\n        for (int right = 0; right < s.length(); right++) {\n            while (window.contains(s.charAt(right))) {\n                window.remove(s.charAt(left));\n                left++;\n            }\n            window.add(s.charAt(right));\n            maxLength = Math.max(maxLength, right - left + 1);\n        }\n        return maxLength;\n    }\n}`,
        timeComplexity: "O(N)",
        spaceComplexity: "O(K)",
        commonMistakes: [
            "Growing the right pointer before shrinking the left pointer correctly.",
            "Using O(N^2) nested loops when a sliding window makes it beautiful O(N).",
            "Off-by-one errors when calculating the mathematical window size using `right - left + 1`."
        ],
        interviewTips: {
            howToRecognize: "The prompt explicitly uses the words 'contiguous', 'substring', 'subarray', or 'window'.",
            whatToSay: "'Since we need a contiguous subarray, we can maintain a sliding window to keep our time complexity strictly linear.'",
            followUpPrep: "Can you do this if the array has negative numbers? (Hint: usually sliding window fails for sums with negatives, use prefix arrays instead)."
        },
        relatedPatterns: [
            { pattern: "Two Pointers", description: "Sliding window literally uses two pointers, just constrained differently." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Best Time to Buy And Sell Stock', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Longest Substring Without Repeating Characters', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Longest Repeating Character Replacement', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Permutation In String', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Minimum Window Substring', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Sliding Window Maximum', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'stack': {
        categoryId: 'stack',
        title: 'Stack',
        introduction: 'Study guide and resource list for Stack.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Imagine a stack of dinner plates. You can only put a new plate on the very top, and when you need a plate, you can only grab the one from the very top. You can't magically pull one from the middle! This is a Stack data structure. It operates strictly on the Last-In, First-Out (LIFO) principle. Whatever goes in last is the absolute first thing that comes out.",
        whenToUse: [
            "When you need to remember previous states and return to them in reverse order.",
            "When parsing brackets, tags, or mathematical expressions (like `([{ }])`).",
            "When dealing with 'Next Greater Element' or 'Previous Smaller Element' problems.",
            "When implementing Undo features or browsing history."
        ],
        howItWorks: "You create a Stack (often just a dynamic array or built-in Stack class). You `push()` elements onto the top of the stack as you process them. When you need to backtrack or match a previous element, you `pop()` from the top. You can also `peek()` to just look at the top element without removing it.",
        exampleWalkthrough: {
            input: 's = "()[]{}"',
            steps: [
                "See '('. It's an opening bracket, push to stack.",
                "See ')'. It's closing. Does it match the top of the stack '('? Yes! Pop it.",
                "See '['. Push.",
                "See ']'. Matches top. Pop.",
                "See '{'. Push.",
                "See '}'. Matches top. Pop. Stack is empty, so it's valid!"
            ],
            result: "true"
        },
        codeTemplate: `class Solution {\n    public boolean isValid(String s) {\n        Stack<Character> stack = new Stack<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '{' || c == '[') {\n                stack.push(c);\n            } else {\n                if (stack.isEmpty()) return false;\n                char top = stack.pop();\n                if (c == ')' && top != '(') return false;\n                if (c == '}' && top != '{') return false;\n                if (c == ']' && top != '[') return false;\n            }\n        }\n        return stack.isEmpty();\n    }\n}`,
        timeComplexity: "O(N)",
        spaceComplexity: "O(N)",
        commonMistakes: [
            "Forgetting to check if the stack `isEmpty()` before calling `.pop()` or `.peek()`, causing a sudden crash.",
            "Leaving elements in the stack at the end and mistakenly assuming the string is valid without checking `return stack.isEmpty()`."
        ],
        interviewTips: {
            howToRecognize: "The problem involves 'matching' elements, 'nearest', 'undo', or checking if things are 'validly nested'.",
            whatToSay: "'Because we need to evaluate the most recently seen items first, I'll use a Stack to enforce Last-In-First-Out processing.'",
            followUpPrep: "How would you implement a Stack using only Queues?"
        },
        relatedPatterns: [
            { pattern: "Monotonic Stack", description: "A special stack where elements are forced to be entirely increasing or decreasing. Extremely useful for 'Next Greater Element' problems." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Valid Parentheses', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Min Stack', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Evaluate Reverse Polish Notation', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Daily Temperatures', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Car Fleet', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Largest Rectangle In Histogram', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'binary-search': {
        categoryId: 'binary-search',
        title: 'Binary Search',
        introduction: 'Study guide and resource list for Binary Search.',
        keyConcepts: [],
        resources: [],
        whatItIs: "If you're looking for the word 'Elephant' in a physical dictionary, you don't start at page 1 and read every single word. You open the book to the exact middle. If you see 'Monkey', you know 'Elephant' must be in the left half, so you rip the book in half and throw away the right side. You repeat this until you find it! Binary Search is the algorithmic version of this: it dramatically cuts the search space in half with every single step.",
        whenToUse: [
            "When the array is ALREADY SORTED.",
            "When the problem asks for an O(log N) runtime explicitly.",
            "When you are searching for a specific target value or condition.",
            "When the problem involves a continuous range of numbers (e.g., 'find the minimum capacity')."
        ],
        howItWorks: "You set `left = 0` and `right = array.length - 1`. You enter a loop `while (left <= right)`. You calculate the exact middle index (`mid = left + (right - left) / 2`). If `array[mid]` is exactly what you want, you win! If `array[mid]` is too small, you search the right half (`left = mid + 1`). If it's too big, you search the left half (`right = mid - 1`).",
        exampleWalkthrough: {
            input: "nums = [-1,0,3,5,9,12], target = 9",
            steps: [
                "left=0, right=5. mid=2 (nums[2] is 3). 3 is less than 9. Throw away left half. left=3.",
                "left=3, right=5. mid=4 (nums[4] is 9). 9 equals target! We found it at index 4."
            ],
            result: "4"
        },
        codeTemplate: `class Solution {\n    public int search(int[] nums, int target) {\n        int left = 0, right = nums.length - 1;\n        while (left <= right) {\n            int mid = left + (right - left) / 2;\n            if (nums[mid] == target) {\n                return mid;\n            } else if (nums[mid] < target) {\n                left = mid + 1;\n            } else {\n                right = mid - 1;\n            }\n        }\n        return -1;\n    }\n}`,
        timeComplexity: "O(log N)",
        spaceComplexity: "O(1)",
        commonMistakes: [
            "Calculating mid as `(left + right) / 2`, which can cause a serious integer overflow if the array is massive. Always use `left + (right - left) / 2`.",
            "Messing up the `<` vs `<=` in the while loop condition.",
            "Forgetting to add/subtract 1 (`left = mid + 1`) and causing an infinite loop."
        ],
        interviewTips: {
            howToRecognize: "The input array is explicitly marked 'sorted' and requires 'Fast', 'Optimized', or 'O(log N)' search.",
            whatToSay: "'Because the array is already sorted, I can optimize the search from O(N) to O(log N) by using Binary Search.'",
            followUpPrep: "Can you use Binary Search on a Rotated Array?"
        },
        relatedPatterns: [
            { pattern: "Two Pointers", description: "Binary Search literally uses two pointers to represent the search boundaries." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Binary Search', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Search a 2D Matrix', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Koko Eating Bananas', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Find Minimum In Rotated Sorted Array', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Search In Rotated Sorted Array', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Time Based Key Value Store', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Median of Two Sorted Arrays', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'linked-list': {
        categoryId: 'linked-list',
        title: 'Linked List',
        introduction: 'Study guide and resource list for Linked List.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Imagine you are following a treasure hunt where each clue tells you where to find the next one. Each clue card has two parts: the message on it (the data) and the directions to the next clue (the pointer). A linked list works in the same way: every node stores some data and a reference that leads you to the next node in the chain. If you want to reach the 5th clue, you cannot teleport to it; you must start at the first card and follow the trail one clue at a time. Linked lists behave like that too: to reach the 5th node, you begin at the head and move through each node in order, unlike an array where you can directly jump to any element using its index.",
        whenToUse: [
            "When you need fast O(1) insertions or deletions at the ends.",
            "When you do NOT need random access (like `array[5]`).",
            "When building Stacks, Queues, or LRU Caches."
        ],
        howItWorks: "You always start by holding the `head` node. To traverse the list, you use a loop: `while(curr != null)` and simply jump to the next item via `curr = curr.next;`. When modifying the list (like insertions/deletions), you carefully rearrange the `.next` pointers before deleting anything so you don't lose the rest of the chain!",
        exampleWalkthrough: {
            input: "head = [1,2,3], reverse it",
            steps: [
                "Node 1: Point next to null. Prev=1, Curr=2",
                "Node 2: Point next to 1. Prev=2, Curr=3",
                "Node 3: Point next to 2. Prev=3, Curr=null",
                "Curr is null, loop ends. New head is 3! Return [3,2,1]"
            ],
            result: "[3, 2, 1]"
        },
        codeTemplate: `class Solution {\n    public ListNode reverseList(ListNode head) {\n        ListNode prev = null;\n        ListNode curr = head;\n        while (curr != null) {\n            ListNode nextTemp = curr.next; // Save the rest of the list\n            curr.next = prev;              // Reverse the pointer\n            prev = curr;                   // Move prev forward\n            curr = nextTemp;               // Move curr forward\n        }\n        return prev;\n    }\n}`,
        timeComplexity: "O(N)",
        spaceComplexity: "O(1) (Usually performed strictly in-place)",
        commonMistakes: [
            "Losing the reference to the rest of the list! Always save `curr.next` into a temporary variable before mutating `curr`.",
            "Null Pointer Exceptions. You must constantly check `if (curr != null && curr.next != null)` before accessing properties.",
            "Forgetting to handle edge cases like empty lists (`head == null`)."
        ],
        interviewTips: {
            howToRecognize: "The input provides a `ListNode` or explicitly mentions 'Linked List'.",
            whatToSay: "'I'll use a dummy node at the beginning to gracefully handle edge cases where the head of the list might change or be deleted.'",
            followUpPrep: "How do you detect if a Linked List goes in a circle forever? (Hint: Fast & Slow pointers)."
        },
        relatedPatterns: [
            { pattern: "Fast & Slow Pointers", description: "Using two pointers moving at different speeds (e.g. 1 step vs 2 steps) to find the middle or detect cycles." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Reverse Linked List', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Merge Two Sorted Lists', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Linked List Cycle', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Reorder List', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Remove Nth Node From End of List', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Copy List With Random Pointer', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Add Two Numbers', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Find The Duplicate Number', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'LRU Cache', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Merge K Sorted Lists', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Reverse Nodes In K Group', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'trees': {
        categoryId: 'trees',
        title: 'Trees',
        introduction: 'Study guide and resource list for Trees.',
        keyConcepts: [],
        resources: [],
        whatItIs: "A Tree is just like a Linked List, but instead of one 'next' pointer, a node can have multiple pointers (like 'left' and 'right'). It branches out exactly like a real tree! The most common type is a Binary Tree, where each node has at most two children. The very top node is called the 'root', and nodes with no children are called 'leaves'. Trees are incredible for representing hierarchical data, like file systems, company org charts, or family trees.",
        whenToUse: [
            "When data is naturally hierarchical.",
            "When you need to perform fast O(log N) searches, insertions, and deletions (using a Binary Search Tree).",
            "When you need to traverse data in a specific order (In-order, Pre-order, Post-order)."
        ],
        howItWorks: "Because trees are recursive by nature (every child is the 'root' of its own smaller subtree), the most elegant way to work with them is using Recursion! You write a function that does something to the current node, and then simply calls itself on the `left` child and the `right` child. You'll almost always use Depth-First Search (DFS) with recursion, or Breadth-First Search (BFS) using a Queue to go level-by-level.",
        exampleWalkthrough: {
            input: "root = [4,2,7,1,3], invert it",
            steps: [
                "At root 4: swap left (2) and right (7). Recursively call invert(2) and invert(7).",
                "At 2: swap 1 and 3.",
                "At 7: swap null and null.",
                "All subtrees inverted. The whole tree is now a mirror image!"
            ],
            result: "[4,7,2,null,null,3,1]"
        },
        codeTemplate: `class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        // Swap the children\n        TreeNode temp = root.left;\n        root.left = root.right;\n        root.right = temp;\n        // Recursively do the same for the rest of the tree\n        invertTree(root.left);\n        invertTree(root.right);\n        return root;\n    }\n}`,
        timeComplexity: "O(N)",
        spaceComplexity: "O(H) where H is the height of the tree (due to the recursive call stack)",
        commonMistakes: [
            "Forgetting the base case `if (root == null) return null;`, causing a StackOverflow exception.",
            "Not trusting the recursion! Beginners often try to manually track tree depth with complicated loops instead of just letting the call stack do the work."
        ],
        interviewTips: {
            howToRecognize: "The input is a `TreeNode`. The problem asks about 'depth', 'lowest common ancestor', or 'level order'.",
            whatToSay: "'Because trees are inherently recursive structures, I will use Depth-First Search to elegantly traverse the nodes in O(N) time.'",
            followUpPrep: "Do you know the difference between Pre-Order, In-Order, and Post-Order traversals?"
        },
        relatedPatterns: [
            { pattern: "Depth-First Search (DFS)", description: "The standard recursive way to go deep into a tree before coming back up." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Invert Binary Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Maximum Depth of Binary Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Diameter of Binary Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Balanced Binary Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Same Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Subtree of Another Tree', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Lowest Common Ancestor of a Binary Search Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Binary Tree Level Order Traversal', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Binary Tree Right Side View', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Count Good Nodes In Binary Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Validate Binary Search Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Kth Smallest Element In a BST', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Construct Binary Tree From Preorder And Inorder Traversal', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Binary Tree Maximum Path Sum', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Serialize And Deserialize Binary Tree', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'heap-priority-queue': {
        categoryId: 'heap-priority-queue',
        title: 'Heap / Priority Queue',
        introduction: 'Study guide and resource list for Heap / Priority Queue.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Imagine a VIP line at a club. Normal queues are 'First Come, First Served'. But in a Priority Queue (which is usually built using a Heap), the 'most important' person always gets pulled to the front immediately, no matter when they arrived! A Heap is a magical tree structure where the smallest (Min-Heap) or largest (Max-Heap) element is ALWAYS sitting perfectly at the very top, ready to be grabbed.",
        whenToUse: [
            "When you need to repeatedly find the minimum or maximum element in a dynamically changing dataset.",
            "When a problem asks for the 'Top K' or 'Kth Largest/Smallest' elements.",
            "When implementing advanced algorithms like Dijkstra's Shortest Path."
        ],
        howItWorks: "Under the hood, a Heap is just an array disguised as a Binary Tree. When you `add()` a new item, it's placed at the bottom and 'bubbles up' to its correct spot depending on its priority. When you `poll()` (remove) the top item, the bottom item is moved to the top and 'bubbles down'. Both operations take exactly O(log N) time, which is much faster than re-sorting an entire array every time!",
        exampleWalkthrough: {
            input: "nums = [3,2,1,5,6,4], k = 2 (Find 2nd largest)",
            steps: [
                "Create Min-Heap of size 2.",
                "Insert 3, then 2. Heap=[2, 3].",
                "Insert 1. Heap=[1, 2, 3]. Size > 2, so pop smallest (1). Heap=[2, 3].",
                "Insert 5, pop 2. Heap=[3, 5].",
                "Insert 6, pop 3. Heap=[5, 6].",
                "Insert 4, pop 4. Heap=[5, 6]. Done! Top of heap is 5, which is the 2nd largest!"
            ],
            result: "5"
        },
        codeTemplate: `class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        // Min-Heap keeps exactly k largest elements seen so far\n        PriorityQueue<Integer> minHeap = new PriorityQueue<>();\n        for (int num : nums) {\n            minHeap.add(num);\n            if (minHeap.size() > k) {\n                minHeap.poll(); // Kick out the smallest guy\n            }\n        }\n        return minHeap.peek(); // The k-th largest is sitting at the absolute top\n    }\n}`,
        timeComplexity: "O(N log K)",
        spaceComplexity: "O(K)",
        commonMistakes: [
            "Using a Max-Heap to find 'Top K Largest' elements (which forces O(N) space and slower runtime) instead of a Min-Heap of size K.",
            "Forgetting that `PriorityQueue` in Java is a Min-Heap by default, not a Max-Heap!"
        ],
        interviewTips: {
            howToRecognize: "The problem literally uses the words 'Top K', 'K Closest', or 'Kth Largest'.",
            whatToSay: "'Sorting takes O(N log N). Since we only care about the top K elements, I can use a Min-Heap of size K to optimize this to O(N log K).'",
            followUpPrep: "How do you make a Max-Heap in Java? (Hint: `Collections.reverseOrder()`)."
        },
        relatedPatterns: [
            { pattern: "Two Heaps", description: "Using a Min-Heap and Max-Heap together to instantly find the Median of a data stream." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Kth Largest Element In a Stream', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Last Stone Weight', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'K Closest Points to Origin', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Kth Largest Element In An Array', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Task Scheduler', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Design Twitter', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Find Median From Data Stream', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'backtracking': {
        categoryId: 'backtracking',
        title: 'Backtracking',
        introduction: 'Study guide and resource list for Backtracking.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Imagine trying to find your way out of a physical maze. You pick a path, and if you hit a dead end, you physically turn around, walk back to the last intersection, and try a different path. This is Backtracking! It's a brute-force method where you exhaustively try to build a solution piece by piece. The moment you realize your current path is invalid (or you've found a full answer), you 'backtrack' (undo your last step) and try another option.",
        whenToUse: [
            "When a problem asks for ALL valid combinations, permutations, or subsets.",
            "When solving puzzles with specific constraints (like Sudoku or N-Queens).",
            "When the input size is inherently small (N < 20)."
        ],
        howItWorks: "You write a recursive function. You make a 'choice' (e.g. adding a number to a temporary list). You dive deeper by calling the recursive function. Wait for it to finish. Then, you absolutely must UNDO the choice you just made (remove the number from the list). This resets your state so you can safely try the next choice in the loop!",
        exampleWalkthrough: {
            input: "nums = [1,2,3], find all subsets",
            steps: [
                "Start empty [].",
                "Add 1 -> [1]. Recurse.",
                "Add 2 -> [1, 2]. Recurse.",
                "Add 3 -> [1, 2, 3]. Recurse. (Save this solution!)",
                "Backtrack: remove 3 -> [1, 2].",
                "Backtrack: remove 2 -> [1]. Add 3 -> [1, 3]... and so on."
            ],
            result: "[[], [1], [2], [1, 2], [3], [1, 3], [2, 3], [1, 2, 3]]"
        },
        codeTemplate: `class Solution {\n    public List<List<Integer>> subsets(int[] nums) {\n        List<List<Integer>> result = new ArrayList<>();\n        backtrack(result, new ArrayList<>(), nums, 0);\n        return result;\n    }\n    \n    private void backtrack(List<List<Integer>> result, List<Integer> current, int[] nums, int start) {\n        // Deep copy the current list and add it to our final results\n        result.add(new ArrayList<>(current));\n        \n        for (int i = start; i < nums.length; i++) {\n            current.add(nums[i]);                  // Make a choice\n            backtrack(result, current, nums, i + 1); // Explore further\n            current.remove(current.size() - 1);    // Undo the choice (Backtrack!)\n        }\n    }\n}`,
        timeComplexity: "O(2^N) or O(N!)",
        spaceComplexity: "O(N)",
        commonMistakes: [
            "Forgetting to make a 'Deep Copy' of the temporary list when adding it to the final result (`result.add(new ArrayList<>(current))`). If you just add `current`, your final answer will be full of empty lists because of the undo steps!",
            "Forgetting the undo step Entirely! (`current.remove(...)`)."
        ],
        interviewTips: {
            howToRecognize: "The problem wants 'all possible combinations', 'subsets', 'permutations', or specifically mentions finding paths on a board.",
            whatToSay: "'Because we need all combinations, the time complexity will naturally be exponential. I will use backtracking to explore the state-space tree.'",
            followUpPrep: "How do you avoid duplicate subsets if the input array has duplicate numbers?"
        },
        relatedPatterns: [
            { pattern: "Depth-First Search (DFS)", description: "Backtracking is fundamentally just DFS on an imaginary tree of decisions." }
        ],
        practiceProblems: {
            easy: [

            ],
            medium: [
                { title: 'Subsets', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Combination Sum', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Combination Sum II', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Permutations', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Subsets II', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Generate Parentheses', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Word Search', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Palindrome Partitioning', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Letter Combinations of a Phone Number', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'N Queens', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'tries': {
        categoryId: 'tries',
        title: 'Tries',
        introduction: 'Study guide and resource list for Tries.',
        keyConcepts: [],
        resources: [],
        whatItIs: "A Trie (pronounced 'try') is a special kind of tree specifically designed to store strings. Each node in the tree represents a single character. If you follow a path from the root down to a leaf, the characters along the way spell out a complete word! It's the ultimate data structure for Auto-Complete and Spell Checkers.",
        whenToUse: [
            "When you need to store a dictionary of words.",
            "When building Auto-Complete features (e.g., 'Find all words starting with `cat`').",
            "When searching for strings character-by-character."
        ],
        howItWorks: "Instead of a standard `left` and `right` pointer, a TrieNode usually holds a HashMap or an array of 26 pointers (one for each letter of the alphabet). You also need a boolean flag `isEndOfWord` at each node to know if the path you've traveled actually forms a complete word, or is just a prefix.",
        exampleWalkthrough: {
            input: 'insert("cat"), insert("car"), search("cat")',
            steps: [
                "Insert 'cat': Root -> 'c' -> 'a' -> 't' (mark 't' as End).",
                "Insert 'car': Root -> 'c' -> 'a' -> 'r' (mark 'r' as End). Notice they effortlessly share the 'c' -> 'a' branch!",
                "Search 'cat': Follow 'c', follow 'a', follow 't'. Is 't' marked as End? Yes! Return true."
            ],
            result: "true"
        },
        codeTemplate: `class TrieNode {\n    TrieNode[] children = new TrieNode[26];\n    boolean isEndOfWord = false;\n}\n\nclass Trie {\n    private TrieNode root = new TrieNode();\n\n    public void insert(String word) {\n        TrieNode curr = root;\n        for (char c : word.toCharArray()) {\n            if (curr.children[c - 'a'] == null) {\n                curr.children[c - 'a'] = new TrieNode();\n            }\n            curr = curr.children[c - 'a'];\n        }\n        curr.isEndOfWord = true;\n    }\n}`,
        timeComplexity: "O(L) where L is the length of the specific word.",
        spaceComplexity: "O(N * L) where N is the number of words. However, sharing prefixes saves tremendous space!",
        commonMistakes: [
            "Forgetting to set `isEndOfWord = true` manually at the very end of the `insert` loop.",
            "Confusing `search('cat')` (must end exactly at 't' with `isEndOfWord==true`) vs `startsWith('cat')` (just needs to reach 't', doesn't matter if it's the end)."
        ],
        interviewTips: {
            howToRecognize: "The problem talks about 'Words', 'Dictionaries', 'Prefixes', or 'Auto-Complete'.",
            whatToSay: "'Since we have many words that share the same starting letters, a Trie will drastically optimize our prefix matching from O(N*L) searching down to just O(L).'!",
            followUpPrep: "How do you delete a word from a Trie without deleting shared prefixes?"
        },
        relatedPatterns: [
            { pattern: "Trees", description: "A Trie is literally just an N-ary tree." }
        ],
        practiceProblems: {
            easy: [

            ],
            medium: [
                { title: 'Implement Trie Prefix Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Design Add And Search Words Data Structure', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Word Search II', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'graphs': {
        categoryId: 'graphs',
        title: 'Graphs',
        introduction: 'Study guide and resource list for Graphs.',
        keyConcepts: [],
        resources: [],
        whatItIs: "A pure Graph is like a roadmap. Unlike Trees (where data strictly flows top-down), Graph nodes (called vertices) can be connected to ANY other node, creating loops, cycles, and massive webs of data! Think of Facebook: You are a node, and your friends are nodes connected to you. There is no 'root' person.",
        whenToUse: [
            "When modeling real-world networks (Cities & Roads, Social Networks, the Internet).",
            "When asked to find if two things are connected or grouped together.",
            "When finding the shortest path (in terms of steps, not distance)."
        ],
        howItWorks: "To represent a graph in code, we almost always use an 'Adjacency List' (a HashMap where the key is a node, and the value is a list of its neighbors). To traverse it, we use BFS (finding the shortest path via a Queue) or DFS (exploring deep via Recursion). BUT, because graphs can have loops, you MUST use a `visited` set to avoid running in circles forever!",
        exampleWalkthrough: {
            input: "nodes=[A,B,C], edges=[[A,B], [B,C]] - find if A is connected to C",
            steps: [
                "Build Adjacency List: A->[B], B->[A,C], C->[B].",
                "Start DFS at A. Mark A visited. Neighbors of A is [B].",
                "DFS at B. Mark B visited. Neighbors of B are [A, C]. A is visited, skip. Go to C.",
                "DFS at C. Found target C! Return true."
            ],
            result: "true"
        },
        codeTemplate: `class Solution {\n    public boolean validPath(int n, int[][] edges, int start, int end) {\n        Map<Integer, List<Integer>> adj = new HashMap<>();\n        for (int[] edge : edges) {\n            adj.computeIfAbsent(edge[0], k -> new ArrayList<>()).add(edge[1]);\n            adj.computeIfAbsent(edge[1], k -> new ArrayList<>()).add(edge[0]);\n        }\n        Set<Integer> visited = new HashSet<>();\n        return dfs(adj, start, end, visited);\n    }\n    private boolean dfs(Map<Integer, List<Integer>> adj, int curr, int target, Set<Integer> visited) {\n        if (curr == target) return true;\n        if (!visited.add(curr)) return false; // Found a cycle / already been here!\n        for (int neighbor : adj.getOrDefault(curr, new ArrayList<>())) {\n            if (dfs(adj, neighbor, target, visited)) return true;\n        }\n        return false;\n    }\n}`,
        timeComplexity: "O(V + E) where V is vertices (nodes) and E is edges (connections).",
        spaceComplexity: "O(V + E) to build the Adjacency List.",
        commonMistakes: [
            "Forgetting the `visited` HashSet. You WILL get an infinite loop.",
            "Trying to build an Adjacency Matrix (a 2D Array) instead of an Adjacency List when the graph is sparse. It wastes huge amounts of memory."
        ],
        interviewTips: {
            howToRecognize: "The input gives you `edges[][]` instead of an array. The prompt talks about 'islands', 'connections', 'components', or 'paths'.",
            whatToSay: "'Because this input models relationships that could contain cycles, I'll represent it using an Adjacency List and traverse it with a visited HashSet.'",
            followUpPrep: "Can you perform a Topological Sort?"
        },
        relatedPatterns: [
            { pattern: "Breadth-First Search (BFS)", description: "The only way to guarantee the shortest path in an unweighted graph." }
        ],
        practiceProblems: {
            easy: [

            ],
            medium: [
                { title: 'Number of Islands', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Max Area of Island', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Clone Graph', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Walls And Gates', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Rotting Oranges', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Pacific Atlantic Water Flow', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Surrounded Regions', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Course Schedule', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Course Schedule II', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Graph Valid Tree', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Number of Connected Components In An Undirected Graph', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Redundant Connection', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Word Ladder', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'advanced-graphs': {
        categoryId: 'advanced-graphs',
        title: 'Advanced Graphs',
        introduction: 'Study guide and resource list for Advanced Graphs.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Advanced Graphs tackle problems where all paths are NOT created equal. Instead of just seeing if A connects to B, what if the road from A to B costs $10, but the road from A to C costs $5? Now we're dealing with *Weighted Cost* networks, *Directed* rules, or *Disjoint Sets*.",
        whenToUse: [
            "When finding the Absolute Cheapest/Shortest path in a Weighted Graph (Dijkstra's Algorithm).",
            "When determining if a Directed Graph has a cycle (Course Schedule problems).",
            "When grouping highly separate islands rapidly (Union-Find).",
            "When finding the cheapest way to connect everything (Minimum Spanning Tree)."
        ],
        howItWorks: "There are 3 major magic spells here:\\n1. **Dijkstra's**: It's just BFS, but instead of a standard Queue, you use a PriorityQueue (Min-Heap) so it always explores the cheapest available path first!\\n2. **Topological Sort**: Used to determine the valid order of tasks when 'Task A' must be completed before 'Task B'.\\n3. **Union-Find**: An incredibly fast way to group components into separate 'sets' and check if two nodes belong to the same set.",
        exampleWalkthrough: {
            input: "edges=[[0,1,cost:10], [0,2,cost:1], [2,1,cost:2]]. Find cheapest 0 to 1.",
            steps: [
                "Start 0 cost 0. MinHeap=[(cost 0, Node 0)].",
                "Pop 0. Neighbors: Node 1 cost 10, Node 2 cost 1. MinHeap=[(1, Node 2), (10, Node 1)].",
                "Pop (1, Node 2). Neighbors: 2 gets to 1 for cost 2. Total cost = 1 (from 0->2) + 2 (from 2->1) = 3. Add to Heap. MinHeap=[(3, Node 1), (10, Node 1)].",
                "Pop (3, Node 1). Reached Target 1! Total Cost is 3. (We completely ignored the expensive 10 cost path!)"
            ],
            result: "3"
        },
        codeTemplate: `class Solution {\n    // Union-Find (Disjoint Set) Template\n    int[] parent;\n    public int find(int i) {\n        // Find root and compress path\n        if (parent[i] == i) return i;\n        return parent[i] = find(parent[i]); \n    }\n    public boolean union(int i, int j) {\n        int rootI = find(i), rootJ = find(j);\n        if (rootI == rootJ) return false; // Already connected! (CYCLE FOUND)\n        parent[rootI] = rootJ; // Connect them\n        return true;\n    }\n}`,
        timeComplexity: "O(E log V) for Dijkstra's, nearly O(1) for Union Find path compression.",
        spaceComplexity: "O(V + E)",
        commonMistakes: [
            "Confusing Dijkstra's algorithm (Weighted Shortest Path) with standard BFS (Unweighted Shortest Path).",
            "Forgetting to initialize the Parent array to `parent[i] = i` in a Union-Find object."
        ],
        interviewTips: {
            howToRecognize: "The problem talks about 'Prerequisites', 'Cheapest network', 'Connecting all points', or gives an `edges` array WITH a third weight value.",
            whatToSay: "'Because the edges have weights (or strict prerequisites), standard BFS is insufficient. I'll need to use Dijkstra's Algorithm (or Union-Find) to solve this optimally.'",
            followUpPrep: "Can Dijkstra's handle negative weights? (No, you'd need Bellman-Ford)."
        },
        relatedPatterns: [
            { pattern: "Heap / Priority Queue", description: "Dijkstra's is essentially useless without a highly efficient PriorityQueue." }
        ],
        practiceProblems: {
            easy: [

            ],
            medium: [
                { title: 'Network Delay Time', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Min Cost to Connect All Points', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Cheapest Flights Within K Stops', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Reconstruct Itinerary', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Swim In Rising Water', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Alien Dictionary', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    '1-d-dynamic-programming': {
        categoryId: '1-d-dynamic-programming',
        title: '1-D Dynamic Programming',
        introduction: 'Study guide and resource list for 1-D Dynamic Programming.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Dynamic Programming (DP) sounds terrifying, but it's actually just one simple idea: 'Don't do the same work twice!' Imagine I ask you to calculate 1+1+1+1. You say '4'. Then I add another '+1' to the end. Do you recount everything from the start? No! You just remember your last answer (4) and add 1 to get 5. That's exactly what DP is: saving the answers to smaller sub-problems exactly once so you can instantly lookup that answer later when solving a bigger problem.",
        whenToUse: [
            "When a problem asks for the 'minimum', 'maximum', 'longest', or 'total ways' to do something.",
            "When you notice that a recursive solution calculates the exact same branches multiple times (Overlapping Subproblems)."
        ],
        howItWorks: "There are two ways to do DP.\\n1. **Top-Down (Memoization)**: You write a standard recursive function, but you add a HashMap or Array to 'cache' the result before returning. Next time the function is called with those same arguments, you return the cached result instantly.\\n2. **Bottom-Up (Tabulation)**: You build an array (usually 1-Dimensional here) starting from index 0. You solve the smallest piece of the puzzle first, then use a `for-loop` to build up to the final answer.",
        exampleWalkthrough: {
            input: "Climbing Stairs: N=3 (can take 1 or 2 steps)",
            steps: [
                "Step 0 or 1: 1 way. dp=[1, 1].",
                "Step 2: Can be reached from step 1 or step 0. So dp[2] = dp[1] + dp[0] = 2. dp=[1,1,2].",
                "Step 3: Can be reached from step 2 or step 1. So dp[3] = dp[2] + dp[1] = 2+1 = 3. dp=[1,1,2,3].",
                "Answer is dp[3], which is 3!"
            ],
            result: "3"
        },
        codeTemplate: `class Solution {\n    // Bottom-Up approach for Climbing Stairs\n    public int climbStairs(int n) {\n        if (n <= 2) return n;\n        int[] dp = new int[n + 1];\n        dp[1] = 1;\n        dp[2] = 2;\n        for (int i = 3; i <= n; i++) {\n            dp[i] = dp[i - 1] + dp[i - 2];\n        }\n        return dp[n];\n    }\n}`,
        timeComplexity: "O(N) because we only calculate each step exactly once.",
        spaceComplexity: "O(N) to store the DP array. (Often optimizable to O(1) if you only need the last two values!)",
        commonMistakes: [
            "Forgetting to initialize the base cases properly before starting the `for` loop.",
            "Using recursion without a cache, resulting in O(2^N) time limit exceeded errors."
        ],
        interviewTips: {
            howToRecognize: "The problem talks about finding 'Max/Min/Longest', 'Number of ways', or involves jumping/taking steps.",
            whatToSay: "'Since this problem exhibits overlapping subproblems, a naive recursive approach will TLE. I will use Dynamic Programming to cache previous results.'",
            followUpPrep: "Can you optimize the space complexity from O(N) to O(1) by simply keeping track of the last two variables?"
        },
        relatedPatterns: [
            { pattern: "Backtracking", description: "DP is just backtracking with a super-powered memory cache!" }
        ],
        practiceProblems: {
            easy: [
                { title: 'Climbing Stairs', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Min Cost Climbing Stairs', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'House Robber', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'House Robber II', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Longest Palindromic Substring', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Palindromic Substrings', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Decode Ways', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Coin Change', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Maximum Product Subarray', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Word Break', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Longest Increasing Subsequence', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Partition Equal Subset Sum', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [

            ]
        }
    },
    '2-d-dynamic-programming': {
        categoryId: '2-d-dynamic-programming',
        title: '2-D Dynamic Programming',
        introduction: 'Study guide and resource list for 2-D Dynamic Programming.',
        keyConcepts: [],
        resources: [],
        whatItIs: "2-D DP is the exact same concept as 1-D DP, but your 'state' depends on TWO variables instead of one. Imagine you are navigating a grid from the top-left to the bottom-right. The number of ways to reach a specific cell depends on the cell *above* it AND the cell to its *left*. Therefore, instead of a 1D array to remember answers, you need a full 2D array (a matrix)!",
        whenToUse: [
            "When dealing with grids or matrices (e.g., 'Unique Paths' or 'Longest Common Subsequence').",
            "When the subproblem state requires tracking two distinct indices simultaneously (like taking items from Two different strings at the same time).",
            "When dealing with classic Knapsack problems."
        ],
        howItWorks: "You create a `int[][] dp = new int[rows][cols]`. You carefully initialize the base cases—often the first row and the first column. Then, you use nested `for-loops` to iterate through every cell. For each cell, the answer is calculated by looking at the immediately neighboring cells that have ALREADY been computed (e.g., `dp[r][c] = dp[r-1][c] + dp[r][c-1]`).",
        exampleWalkthrough: {
            input: "grid 2x2. Find paths from 0,0 to 1,1. Right/Down only.",
            steps: [
                "Create 2x2 DP matrix.",
                "Initialize first row to 1 (only 1 way to go straight right).",
                "Initialize first col to 1 (only 1 way to go straight down).",
                "Calculate cell (1,1). It's the sum of the cell above (1) and left (1). Thus dp[1][1] = 2.",
                "Target cell is 2. Return 2!"
            ],
            result: "2"
        },
        codeTemplate: `class Solution {\n    public int uniquePaths(int m, int n) {\n        int[][] dp = new int[m][n];\n        // Fill the first row\n        for (int i = 0; i < n; i++) dp[0][i] = 1;\n        // Fill the first col\n        for (int i = 0; i < m; i++) dp[i][0] = 1;\n        \n        // Fill the rest of the matrix\n        for (int r = 1; r < m; r++) {\n            for (int c = 1; c < n; c++) {\n                dp[r][c] = dp[r - 1][c] + dp[r][c - 1];\n            }\n        }\n        return dp[m - 1][n - 1];\n    }\n}`,
        timeComplexity: "O(M * N) since you process every cell exactly once.",
        spaceComplexity: "O(M * N) to store the DP grid (often optimizable to O(M) or O(N) by saving only the previous row).",
        commonMistakes: [
            "Messing up the matrix dimension sizes, resulting in `ArrayIndexOutOfBoundsException`.",
            "Filling the DP table in the wrong order so you accidentally try to query a cell that hasn't been computed yet!"
        ],
        interviewTips: {
            howToRecognize: "The problem literally gives you a 2D grid, asks you to compare TWO different strings, or presents a 'Knapsack' choice.",
            whatToSay: "'Because our state depends on two varying constraints, I will build a 2D tabulation matrix to calculate the answers bottom-up.'",
            followUpPrep: "Can you optimize the space? (Hint: You usually only need to remember the *previous row*, not the entire matrix!)"
        },
        relatedPatterns: [
            { pattern: "1-D Dynamic Programming", description: "Literally the exact same thing but with an extra inner loop." }
        ],
        practiceProblems: {
            easy: [

            ],
            medium: [
                { title: 'Unique Paths', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Longest Common Subsequence', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Best Time to Buy And Sell Stock With Cooldown', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Coin Change II', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Target Sum', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Interleaving String', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Edit Distance', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Longest Increasing Path In a Matrix', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Distinct Subsequences', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Burst Balloons', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Regular Expression Matching', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'greedy': {
        categoryId: 'greedy',
        title: 'Greedy',
        introduction: 'Study guide and resource list for Greedy.',
        keyConcepts: [],
        resources: [],
        whatItIs: "A Greedy algorithm is like a person who always grabs the biggest piece of cake available RIGHT NOW, without thinking about tomorrow. At every single step, a Greedy algorithm makes the most optimal, locally 'best' choice possible, hoping that all these small optimal choices suddenly magically combine into the global best solution! It's much faster than Dynamic Programming because it refuses to look backward or reconsider.",
        whenToUse: [
            "When making a localized optimal choice guarantees a global optimal outcome (The Greedy Choice Property).",
            "When the problem asks for the 'minimum', 'maximum', or 'longest' and involves jumping, intervals, or making a series of absolute choices."
        ],
        howItWorks: "Greedy algorithms don't have a strict universal template because the 'greedy choice' entirely depends on the problem. Usually, it involves **sorting** the data first (e.g., sorting by cost, or end time), and then looping through it once, greedily taking the best option at that exact moment while keeping a running tally.",
        exampleWalkthrough: {
            input: "Jump Game: nums = [2,3,1,1,4]. Can you reach the end?",
            steps: [
                "Set your 'Goal' to the absolute last index (index 4).",
                "Look strictly at the index before it (Index 3). Can Index 3 jump to the Goal? (nums[3] = 1. 3+1 = 4. Yes!).",
                "Greedy choice: Move the Goal post closer to index 3! We now only need to reach 3.",
                "Index 2 can reach 3! Goal is now 2.",
                "Index 1 can reach 2! Goal is now 1.",
                "Index 0 can reach 1! Goal is now 0. We made it!"
            ],
            result: "true"
        },
        codeTemplate: `class Solution {\n    public boolean canJump(int[] nums) {\n        // Start the goalpost at the absolute ending index\n        int goal = nums.length - 1;\n        \n        // Work backwards greedily\n        for (int i = nums.length - 2; i >= 0; i--) {\n            if (i + nums[i] >= goal) {\n                goal = i; // Move the goalpost closer!\n            }\n        }\n        \n        // If the goalpost successfully reached the start, we win.\n        return goal == 0;\n    }\n}`,
        timeComplexity: "O(N) (or O(N log N) if sorting is required first).",
        spaceComplexity: "O(1)",
        commonMistakes: [
            "Using Greedy when Dynamic Programming is required! Greedy only works if taking the *current best* choice doesn't ruin future choices. Often, a Greedy algorithm will fail complex edge cases that DP solves perfectly.",
            "Forgetting to Sort the input data before making greedy decisions."
        ],
        interviewTips: {
            howToRecognize: "The problem talks about 'Jumping max distance', 'Minimizing coin usage', or 'Scheduling the most activities'.",
            whatToSay: "'I noticed that making the locally optimal choice doesn't penalize future decisions. Therefore, I can bypass DP and use a strictly O(N) Greedy algorithm.'",
            followUpPrep: "Can you prove why your Greedy choice doesn't fail? (Interviewer might ask you to justify why DP isn't needed)."
        },
        relatedPatterns: [
            { pattern: "Intervals", description: "Interval problems almost always rely on sorting and then a Greedy pass to merge them." }
        ],
        practiceProblems: {
            easy: [

            ],
            medium: [
                { title: 'Maximum Subarray', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Jump Game', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Jump Game II', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Gas Station', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Hand of Straights', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Merge Triplets to Form Target Triplet', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Partition Labels', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Valid Parenthesis String', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [

            ]
        }
    },
    'intervals': {
        categoryId: 'intervals',
        title: 'Intervals',
        introduction: 'Study guide and resource list for Intervals.',
        keyConcepts: [],
        resources: [],
        whatItIs: "An Interval is simply a start time and an end time (like a meeting from `[1:00 to 2:00]`). The 'Intervals' category of problems focuses entirely on giving you a massive list of these start/end times and asking you to find overlaps, merge them, or find free time. It's the exact logic used behind Google Calendar and hotel booking systems!",
        whenToUse: [
            "When the input is an array of pairs like `[[start1, end1], [start2, end2]]`.",
            "When finding overlapping schedules, meeting rooms, or merging data ranges."
        ],
        howItWorks: "There is a universal 2-step trick to almost every Interval problem.\\n1. **Sort the array:** You MUST sort the intervals by their `start` time. Without sorting, it's impossible to efficiently check overlaps.\\n2. **Iterate and Merge:** After sorting, you simply loop through the intervals. If the `start` time of the *current* interval is strictly less than or equal to the `end` time of the *previous* interval, they overlap! You merge them by taking the `max()` of their end times.",
        exampleWalkthrough: {
            input: "[[1,3],[2,6],[8,10]]",
            steps: [
                "Sort by start: Already sorted [[1,3], [2,6], [8,10]].",
                "Add [1,3] to our answer list.",
                "Look at [2,6]. The start (2) is less than the previous end (3). OVERLAP! Merge them by taking max(3, 6). Answer list changes to [[1,6]].",
                "Look at [8,10]. The start (8) is greater than previous end (6). No overlap. Just add it. Answer list: [[1,6], [8,10]]"
            ],
            result: "[[1,6], [8,10]]"
        },
        codeTemplate: `class Solution {\n    public int[][] merge(int[][] intervals) {\n        if (intervals.length <= 1) return intervals;\n        // Step 1: Sort by starting time\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        \n        List<int[]> result = new ArrayList<>();\n        int[] currentInterval = intervals[0];\n        result.add(currentInterval);\n        \n        // Step 2: Iterate and check for overlaps\n        for (int[] interval : intervals) {\n            int currentEnd = currentInterval[1];\n            int nextStart = interval[0];\n            int nextEnd = interval[1];\n            \n            if (nextStart <= currentEnd) { // Overlap detected!\n                currentInterval[1] = Math.max(currentEnd, nextEnd);\n            } else { // No overlap\n                currentInterval = interval;\n                result.add(currentInterval);\n            }\n        }\n        return result.toArray(new int[result.size()][]);\n    }\n}`,
        timeComplexity: "O(N log N) solely because of the initial sorting step.",
        spaceComplexity: "O(N) to store the result list.",
        commonMistakes: [
            "Forgetting to sort the intervals first. The merging logic falls apart entirely if the input is `[[8,10], [1,3]]`.",
            "Trying to merge arrays blindly without updating the reference pointer correctly in Java."
        ],
        interviewTips: {
            howToRecognize: "Input is an array of pairs representing `[start, end]` ranges.",
            whatToSay: "'Because we need to identify overlapping sets, I will first sort the intervals by their start times to guarantee a linear left-to-right sweep.'",
            followUpPrep: "Can you solve this if you are given a stream of intervals one by one? (Hint: Use a TreeMap)."
        },
        relatedPatterns: [
            { pattern: "Greedy", description: "Merging intervals is actually a textbook Greedy approach: you optimally merge the current interval before moving on." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Meeting Rooms', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Insert Interval', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Merge Intervals', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Non Overlapping Intervals', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Meeting Rooms II', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [
                { title: 'Minimum Interval to Include Each Query', type: 'problem', platform: 'leetcode', priority: 1 },
            ]
        }
    },
    'math-geometry': {
        categoryId: 'math-geometry',
        title: 'Math & Geometry',
        introduction: 'Study guide and resource list for Math & Geometry.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Math and Geometry problems are the wildcards of coding interviews. They don't usually require a specific 'Data Structure' like a Tree or a Graph. Instead, they require identifying a mathematical pattern, formula, or geometric property (like grid manipulation) to solve the problem efficiently.",
        whenToUse: [
            "When rotating matrices or grids 90 degrees.",
            "When dealing with purely numerical operations (checking prime numbers, reversing integers, matrix multiplication).",
            "When returning purely geometric calculations (points, lines, overlaps)."
        ],
        howItWorks: "This heavily completely depends on the problem! But some common tricks include:\\n- **Matrix Rotation**: Transpose the matrix first (swap rows and cols), then reverse each row individually.\\n- **Modulo Arithmetic**: Use `% 10` to grab the last digit of a number, and `/ 10` to shave off the last digit.\\n- **Greatest Common Divisor**: Used for fraction simplification.",
        exampleWalkthrough: {
            input: "Reverse Integer 123",
            steps: [
                "123 % 10 = 3 (push to result). 123 / 10 = 12.",
                "12 % 10 = 2 (push 2). 12 / 10 = 1.",
                "1 % 10 = 1 (push 1). 1 / 10 = 0. Stop.",
                "Result is 321."
            ],
            result: "321"
        },
        codeTemplate: `class Solution {\n    // Reversing an integer safely without string conversion\n    public int reverse(int x) {\n        long result = 0;\n        while (x != 0) {\n            int lastDigit = x % 10;\n            result = (result * 10) + lastDigit;\n            x = x / 10;\n        }\n        if (result > Integer.MAX_VALUE || result < Integer.MIN_VALUE) {\n            return 0; // Handle 32-bit overflow\n        }\n        return (int) result;\n    }\n}`,
        timeComplexity: "O(log(X)) or O(N) depending on the dimensions.",
        spaceComplexity: "O(1) usually, because math manipulation happens in-place or via primitive variables.",
        commonMistakes: [
            "Forgetting about 32-bit Integer Overflow! Mathematical operations on huge integers can wrap around and turn negative unexpectedly.",
            "Using expensive String conversions (like `String.valueOf(number)`) when basic `% 10` modulo math is infinitely faster."
        ],
        interviewTips: {
            howToRecognize: "The problem is extremely simple to state (e.g. 'Rotate Image', 'Pow(x, n)') but feels impossible to do cleanly without extra space.",
            whatToSay: "'I need to ensure my mathematical operations check against Integer.MAX_VALUE to prevent nasty overflow bugs.'",
            followUpPrep: "Review how modulo arithmetic works with negative numbers!"
        },
        relatedPatterns: [
            { pattern: "Bit Manipulation", description: "Math algorithms often dip into binary operations for extreme speed." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Happy Number', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Plus One', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Rotate Image', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Spiral Matrix', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Set Matrix Zeroes', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Pow(x, n)', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Multiply Strings', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Detect Squares', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [

            ]
        }
    },
    'bit-manipulation': {
        categoryId: 'bit-manipulation',
        title: 'Bit Manipulation',
        introduction: 'Study guide and resource list for Bit Manipulation.',
        keyConcepts: [],
        resources: [],
        whatItIs: "Deep down, computers don't understand 'Numbers' or 'Strings'. They solely understand 1s and 0s (voltage 'ON' and voltage 'OFF'). Bit Manipulation is the art of bypassing high-level code and directly hacking those raw binary digits! It is insanely fast and requires almost zero memory.",
        whenToUse: [
            "When asked to find a 'Single Number' in an array of duplicates.",
            "When counting the number of '1' bits in an integer.",
            "When reversing the binary representation of a number.",
            "When doing highly-optimized sets and masks."
        ],
        howItWorks: "You use special binary operators:\\n- `&` (AND): Returns 1 only if BOTH bits are 1.\\n- `|` (OR): Returns 1 if AT LEAST ONE bit is 1.\\n- `^` (XOR): Returns 1 if bits are DIFFERENT. (Crucial rule: `X ^ X = 0`).\\n- `<<` / `>>` (Shifts): literally slides all bits to the left or right, effectively multiplying/dividing by 2.",
        exampleWalkthrough: {
            input: "nums = [4,1,2,1,2]. Find the number that doesn't repeat.",
            steps: [
                "Start with 0.",
                "0 XOR 4 = 4",
                "4 XOR 1 = 5",
                "5 XOR 2 = 7",
                "7 XOR 1 = 6",
                "6 XOR 2 = 4.",
                "Because X ^ X = 0, all the duplicate numbers perfectly canceled each other out! The only number left standing is 4."
            ],
            result: "4"
        },
        codeTemplate: `class Solution {\n    public int singleNumber(int[] nums) {\n        int result = 0;\n        for (int num : nums) {\n            result ^= num; // XOR magically cancels out any duplicates!\n        }\n        return result;\n    }\n}`,
        timeComplexity: "O(N)",
        spaceComplexity: "O(1)",
        commonMistakes: [
            "Confusing `&&` (Logical AND for booleans) with `&` (Bitwise AND for bits) in your if-statements.",
            "Assuming bitwise operations are readable! They look like gibberish if you don't add comments."
        ],
        interviewTips: {
            howToRecognize: "The prompt explicitly mentions '32-bit integers', 'Constant space O(1)', or 'Find the missing/single number'.",
            whatToSay: "'Since we have a rigid space limitation and are dealing with pairing logic, I can use the XOR operator to cancel out duplicate binary flags.'",
            followUpPrep: "How do you check if a number is a power of 2 using only bitwise? (Hint: `(n & (n - 1)) == 0`)."
        },
        relatedPatterns: [
            { pattern: "Math & Geometry", description: "Bit manipulation is just math performed in base-2." }
        ],
        practiceProblems: {
            easy: [
                { title: 'Single Number', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Number of 1 Bits', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Counting Bits', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Reverse Bits', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Missing Number', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            medium: [
                { title: 'Sum of Two Integers', type: 'problem', platform: 'leetcode', priority: 1 },
                { title: 'Reverse Integer', type: 'problem', platform: 'leetcode', priority: 1 },
            ],
            hard: [

            ]
        }
    },
};
