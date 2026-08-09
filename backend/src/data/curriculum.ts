export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

export interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  targetGoal?: string;
  starterCode: string;
  testCases: TestCase[];
  solutionHint?: string;
  patternTag: string;
}

export interface DayPlan {
  dayNumber: number;
  weekNumber: number;
  title: string;
  isWeeklyTest?: boolean;
  isInterviewTest?: boolean;
  learnTopics: string[];
  codeSnippets?: { title: string; code: string }[];
  targetSummary?: string;
  timeLimitMinutes?: number;
  passingCriteria?: string;
  problems: Problem[];
}

export const CURRICULUM_DATA: DayPlan[] = [
  // WEEK 1
  {
    dayNumber: 1,
    weekNumber: 1,
    title: "Big O + Arrays",
    learnTopics: [
      "Time complexity & Space complexity",
      "O(1), O(log n), O(n), O(n log n), O(n²)",
      "Array traversal & basic operations",
      "push, pop, shift, unshift",
      "Basic searching algorithms"
    ],
    codeSnippets: [
      {
        title: "Array Basics & Traversals",
        code: `const arr = [10, 20, 30];\narr.push(40); // O(1)\narr.unshift(5); // O(n)\nfor (let i = 0; i < arr.length; i++) {\n  console.log(arr[i]);\n}`
      }
    ],
    targetSummary: "Understand why HashMap can turn a nested-loop solution into O(n).",
    problems: [
      {
        id: "two-sum",
        title: "Two Sum",
        difficulty: "Easy",
        patternTag: "HashMap",
        description: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
        starterCode: `/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nfunction twoSum(nums, target) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: "[2, 7, 11, 15], 9", expectedOutput: "[0,1]" },
          { input: "[3, 2, 4], 6", expectedOutput: "[1,2]" },
          { input: "[3, 3], 6", expectedOutput: "[0,1]" }
        ],
        solutionHint: "Use Map to store value -> index as you iterate."
      },
      {
        id: "contains-duplicate",
        title: "Contains Duplicate",
        difficulty: "Easy",
        patternTag: "HashMap",
        description: "Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.",
        starterCode: `/**\n * @param {number[]} nums\n * @return {boolean}\n */\nfunction containsDuplicate(nums) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: "[1, 2, 3, 1]", expectedOutput: "true" },
          { input: "[1, 2, 3, 4]", expectedOutput: "false" }
        ],
        solutionHint: "Use a Set to track visited elements in O(1) time."
      }
    ]
  },
  {
    dayNumber: 2,
    weekNumber: 1,
    title: "Array Techniques",
    learnTopics: [
      "Min/Max finding in single pass",
      "Frequency counting pattern",
      "Prefix Sum intro"
    ],
    codeSnippets: [
      {
        title: "Finding Min & Max",
        code: `let minVal = Infinity, maxVal = -Infinity;\nfor (const num of nums) {\n  if (num < minVal) minVal = num;\n  if (num > maxVal) maxVal = num;\n}`
      }
    ],
    targetSummary: "Learn greedy tracking for single-pass O(n) array traversal.",
    problems: [
      {
        id: "best-time-to-buy-sell-stock",
        title: "Best Time to Buy and Sell Stock",
        difficulty: "Easy",
        patternTag: "Greedy",
        description: "You are given an array `prices` where `prices[i]` is the price of a given stock on the i-th day.\n\nYou want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.",
        starterCode: `/**\n * @param {number[]} prices\n * @return {number}\n */\nfunction maxProfit(prices) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: "[7,1,5,3,6,4]", expectedOutput: "5" },
          { input: "[7,6,4,3,1]", expectedOutput: "0" }
        ],
        solutionHint: "Keep track of minPrice and maxProfit in a single pass."
      },
      {
        id: "maximum-subarray",
        title: "Maximum Subarray (Kadane's Algorithm)",
        difficulty: "Medium",
        patternTag: "Kadane's Algo",
        description: "Given an integer array `nums`, find the subarray with the largest sum, and return its sum.",
        starterCode: `/**\n * @param {number[]} nums\n * @return {number}\n */\nfunction maxSubArray(nums) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: "[-2,1,-3,4,-1,2,1,-5,4]", expectedOutput: "6" },
          { input: "[1]", expectedOutput: "1" }
        ]
      },
      {
        id: "running-sum-of-1d-array",
        title: "Running Sum of 1d Array",
        difficulty: "Easy",
        patternTag: "Prefix Sum",
        description: "Given an array `nums`. We define a running sum of an array as `runningSum[i] = sum(nums[0]…nums[i])`. Return the running sum of nums.",
        starterCode: `/**\n * @param {number[]} nums\n * @return {number[]}\n */\nfunction runningSum(nums) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: "[1,2,3,4]", expectedOutput: "[1,3,6,10]" }
        ]
      }
    ]
  },
  {
    dayNumber: 3,
    weekNumber: 1,
    title: "Hashing",
    learnTopics: [
      "JavaScript Map: const map = new Map()",
      "JavaScript Set: const set = new Set()",
      "Frequency map building & fast lookup O(1)",
      "Duplicate detection strategies"
    ],
    targetSummary: "Master Frequency Map lookup pattern.",
    problems: [
      {
        id: "valid-anagram",
        title: "Valid Anagram",
        difficulty: "Easy",
        patternTag: "HashMap",
        description: "Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.",
        starterCode: `function isAnagram(s, t) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: "\"anagram\", \"nagaram\"", expectedOutput: "true" },
          { input: "\"rat\", \"car\"", expectedOutput: "false" }
        ]
      },
      {
        id: "group-anagrams",
        title: "Group Anagrams",
        difficulty: "Medium",
        patternTag: "HashMap",
        description: "Given an array of strings `strs`, group the anagrams together. You can return the answer in any order.",
        starterCode: `function groupAnagrams(strs) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: "[\"eat\",\"tea\",\"tan\",\"ate\",\"nat\",\"bat\"]", expectedOutput: "[[\"eat\",\"tea\",\"ate\"],[\"tan\",\"nat\"],[\"bat\"]]" }
        ]
      },
      {
        id: "majority-element",
        title: "Majority Element",
        difficulty: "Easy",
        patternTag: "HashMap",
        description: "Given an array `nums` of size `n`, return the majority element (appears > ⌊n / 2⌋ times).",
        starterCode: `function majorityElement(nums) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: "[3,2,3]", expectedOutput: "3" }
        ]
      }
    ]
  },
  {
    dayNumber: 4,
    weekNumber: 1,
    title: "Prefix Sum",
    learnTopics: ["Prefix sum array construction", "Range sum queries in O(1)"],
    targetSummary: "Convert repeated subsegment calculations from O(n²) to O(1) or O(n).",
    problems: [
      {
        id: "subarray-sum-equals-k",
        title: "Subarray Sum Equals K",
        difficulty: "Medium",
        patternTag: "Prefix Sum",
        description: "Given an array of integers `nums` and an integer `k`, return the total number of subarrays whose sum equals to `k`.",
        starterCode: `function subarraySum(nums, k) {\n    // Write solution here\n}`,
        testCases: [{ input: "[1,1,1], 2", expectedOutput: "2" }]
      },
      {
        id: "find-pivot-index",
        title: "Find Pivot Index",
        difficulty: "Easy",
        patternTag: "Prefix Sum",
        description: "Calculate the pivot index of an array (where left sum equals right sum).",
        starterCode: `function pivotIndex(nums) {\n    // Write solution here\n}`,
        testCases: [{ input: "[1,7,3,6,5,6]", expectedOutput: "3" }]
      }
    ]
  },
  {
    dayNumber: 5,
    weekNumber: 1,
    title: "Array Revision",
    learnTopics: ["No new concept today", "Solve Product of Array Except Self in O(n) without division"],
    targetSummary: "Give yourself 40 minutes for revision.",
    problems: [
      {
        id: "product-of-array-except-self",
        title: "Product of Array Except Self",
        difficulty: "Medium",
        patternTag: "Prefix Sum",
        description: "Return an array `answer` such that `answer[i]` is equal to the product of all elements of `nums` except `nums[i]`.",
        starterCode: `function productExceptSelf(nums) {\n    // Write solution here\n}`,
        testCases: [{ input: "[1,2,3,4]", expectedOutput: "[24,12,8,6]" }]
      }
    ]
  },
  {
    dayNumber: 6,
    weekNumber: 1,
    title: "Sorting",
    learnTopics: ["Built-in JS sorting: arr.sort((a, b) => a - b)", "Comparators for numbers vs strings"],
    problems: [
      {
        id: "merge-sorted-array",
        title: "Merge Sorted Array",
        difficulty: "Easy",
        patternTag: "Two Pointers",
        description: "Merge two sorted arrays nums1 and nums2 in-place.",
        starterCode: `function merge(nums1, m, nums2, n) {\n    // Write solution here\n}`,
        testCases: [{ input: "[1,2,3,0,0,0], 3, [2,5,6], 3", expectedOutput: "[1,2,2,3,5,6]" }]
      }
    ]
  },
  {
    dayNumber: 7,
    weekNumber: 1,
    title: "WEEKLY TEST 🧪",
    isWeeklyTest: true,
    timeLimitMinutes: 90,
    learnTopics: ["90-minute timed test mode over Week 1."],
    problems: [
      {
        id: "day7-two-sum",
        title: "Two Sum (Review)",
        difficulty: "Easy",
        patternTag: "HashMap",
        description: "Return indices of two numbers adding to target.",
        starterCode: `function twoSum(nums, target) {}`,
        testCases: [{ input: "[2,7,11,15], 9", expectedOutput: "[0,1]" }]
      }
    ]
  },

  // WEEK 2
  {
    dayNumber: 8,
    weekNumber: 2,
    title: "Two Pointers",
    learnTopics: ["left ->            <- right pointer scanning", "Sorted arrays & Palindromes"],
    problems: [
      {
        id: "valid-palindrome",
        title: "Valid Palindrome",
        difficulty: "Easy",
        patternTag: "Two Pointers",
        description: "Determine if phrase is palindrome after alphanumeric filtering.",
        starterCode: `function isPalindrome(s) {\n    // Write solution here\n}`,
        testCases: [{ input: "\"A man, a plan, a canal: Panama\"", expectedOutput: "true" }]
      },
      {
        id: "two-sum-ii",
        title: "Two Sum II - Sorted Array",
        difficulty: "Medium",
        patternTag: "Two Pointers",
        description: "Find two numbers that add up to target in 1-indexed sorted array.",
        starterCode: `function twoSumTwo(numbers, target) {\n    // Write solution here\n}`,
        testCases: [{ input: "[2,7,11,15], 9", expectedOutput: "[1,2]" }]
      }
    ]
  },
  {
    dayNumber: 9,
    weekNumber: 2,
    title: "Two Pointer Problems",
    learnTopics: ["3Sum pattern", "Container With Most Water"],
    problems: [
      {
        id: "3sum",
        title: "3Sum",
        difficulty: "Medium",
        patternTag: "Two Pointers",
        description: "Find all unique zero-sum triplets.",
        starterCode: `function threeSum(nums) {\n    // Write solution here\n}`,
        testCases: [{ input: "[-1,0,1,2,-1,-4]", expectedOutput: "[[-1,-1,2],[-1,0,1]]" }]
      },
      {
        id: "container-with-most-water",
        title: "Container With Most Water",
        difficulty: "Medium",
        patternTag: "Two Pointers",
        description: "Find two lines forming container holding most water.",
        starterCode: `function maxArea(height) {\n    // Write solution here\n}`,
        testCases: [{ input: "[1,8,6,2,5,4,8,3,7]", expectedOutput: "49" }]
      }
    ]
  },
  {
    dayNumber: 10,
    weekNumber: 2,
    title: "Sliding Window",
    learnTopics: ["Fixed & Variable size window expansion"],
    problems: [
      {
        id: "longest-substring-without-repeating-characters",
        title: "Longest Substring Without Repeats",
        difficulty: "Medium",
        patternTag: "Sliding Window",
        description: "Find length of longest substring without repeating characters.",
        starterCode: `function lengthOfLongestSubstring(s) {\n    // Write solution here\n}`,
        testCases: [{ input: "\"abcabcbb\"", expectedOutput: "3" }]
      }
    ]
  },
  {
    dayNumber: 11,
    weekNumber: 2,
    title: "Sliding Window Patterns",
    learnTopics: ["Character frequency replacement limit"],
    problems: [
      {
        id: "longest-repeating-character-replacement",
        title: "Longest Repeating Character Replacement",
        difficulty: "Medium",
        patternTag: "Sliding Window",
        description: "Find longest substring containing same letter with k replacements.",
        starterCode: `function characterReplacement(s, k) {\n    // Write solution here\n}`,
        testCases: [{ input: "\"ABAB\", 2", expectedOutput: "4" }]
      }
    ]
  },
  {
    dayNumber: 12,
    weekNumber: 2,
    title: "Advanced Sliding Window",
    learnTopics: ["Minimum size subarray sum"],
    problems: [
      {
        id: "minimum-size-subarray-sum",
        title: "Minimum Size Subarray Sum",
        difficulty: "Medium",
        patternTag: "Sliding Window",
        description: "Minimal length of subarray sum >= target.",
        starterCode: `function minSubArrayLen(target, nums) {\n    // Write solution here\n}`,
        testCases: [{ input: "7, [2,3,1,2,4,3]", expectedOutput: "2" }]
      }
    ]
  },
  {
    dayNumber: 13,
    weekNumber: 2,
    title: "Mixed Practice",
    learnTopics: ["Problem recognition without topic tags"],
    problems: [
      {
        id: "contains-duplicate-ii",
        title: "Contains Duplicate II",
        difficulty: "Easy",
        patternTag: "Sliding Window",
        description: "Check if nums[i] == nums[j] and abs(i-j) <= k.",
        starterCode: `function containsNearbyDuplicate(nums, k) {\n    // Write solution here\n}`,
        testCases: [{ input: "[1,2,3,1], 3", expectedOutput: "true" }]
      }
    ]
  },
  {
    dayNumber: 14,
    weekNumber: 2,
    title: "WEEKLY TEST 🧪",
    isWeeklyTest: true,
    timeLimitMinutes: 90,
    learnTopics: ["90 minutes evaluation over Two Pointers & Sliding Window."],
    problems: [
      {
        id: "day14-palindrome",
        title: "Palindrome Review",
        difficulty: "Easy",
        patternTag: "Two Pointers",
        description: "Check if string is palindrome.",
        starterCode: `function isPalindrome(s) {}`,
        testCases: [{ input: "\"race a car\"", expectedOutput: "false" }]
      }
    ]
  },

  // WEEK 3 (PHASE 3 - POPULATED)
  {
    dayNumber: 15,
    weekNumber: 3,
    title: "Binary Search",
    learnTopics: ["Binary search loop template", "Logarithmic time O(log n)"],
    codeSnippets: [
      {
        title: "Binary Search Template",
        code: `let left = 0, right = nums.length - 1;\nwhile (left <= right) {\n  const mid = Math.floor((left + right) / 2);\n  if (nums[mid] === target) return mid;\n  if (nums[mid] < target) left = mid + 1;\n  else right = mid - 1;\n}`
      }
    ],
    targetSummary: "Master O(log n) binary search in sorted arrays.",
    problems: [
      {
        id: "binary-search",
        title: "Binary Search",
        difficulty: "Easy",
        patternTag: "Binary Search",
        description: "Search target in sorted array `nums`. Return target index if found, else -1.",
        starterCode: `function search(nums, target) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[-1,0,3,5,9,12], 9", expectedOutput: "4" },
          { input: "[-1,0,3,5,9,12], 2", expectedOutput: "-1" }
        ],
        solutionHint: "Use left and right pointers with mid calculation."
      }
    ]
  },
  {
    dayNumber: 16,
    weekNumber: 3,
    title: "Binary Search Patterns",
    learnTopics: ["Rotated Sorted Array search", "Finding Minimum in Rotated Array"],
    problems: [
      {
        id: "find-minimum-in-rotated-sorted-array",
        title: "Find Minimum in Rotated Sorted Array",
        difficulty: "Medium",
        patternTag: "Binary Search",
        description: "Find the minimum element in rotated sorted array in O(log n) time.",
        starterCode: `function findMin(nums) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[3,4,5,1,2]", expectedOutput: "1" },
          { input: "[4,5,6,7,0,1,2]", expectedOutput: "0" }
        ]
      }
    ]
  },
  {
    dayNumber: 17,
    weekNumber: 3,
    title: "Linked List Fundamentals",
    learnTopics: ["Node, Head, Tail concepts", "ListNode JS Class definition"],
    codeSnippets: [
      {
        title: "JS ListNode Definition",
        code: `class ListNode {\n  constructor(val, next = null) {\n    this.val = val;\n    this.next = next;\n  }\n}`
      }
    ],
    problems: [
      {
        id: "reverse-linked-list",
        title: "Reverse Linked List",
        difficulty: "Easy",
        patternTag: "Linked List",
        description: "Given array representation of linked list, reverse it and return array.",
        starterCode: `function reverseList(head) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[1,2,3,4,5]", expectedOutput: "[5,4,3,2,1]" }
        ]
      }
    ]
  },
  {
    dayNumber: 18,
    weekNumber: 3,
    title: "Linked List Operations",
    learnTopics: ["Middle Node finding", "Two Pointers on Linked List"],
    problems: [
      {
        id: "middle-of-the-linked-list",
        title: "Middle of the Linked List",
        difficulty: "Easy",
        patternTag: "Linked List",
        description: "Return the middle node value of linked list.",
        starterCode: `function middleNode(head) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[1,2,3,4,5]", expectedOutput: "3" },
          { input: "[1,2,3,4,5,6]", expectedOutput: "4" }
        ]
      }
    ]
  },
  {
    dayNumber: 19,
    weekNumber: 3,
    title: "Fast & Slow Pointers",
    learnTopics: ["Floyd's Tortoise and Hare Cycle Detection"],
    problems: [
      {
        id: "linked-list-cycle",
        title: "Linked List Cycle",
        difficulty: "Easy",
        patternTag: "Fast & Slow Pointers",
        description: "Determine if linked list array contains a cycle.",
        starterCode: `function hasCycle(head) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[3,2,0,-4]", expectedOutput: "false" }
        ]
      }
    ]
  },
  {
    dayNumber: 20,
    weekNumber: 3,
    title: "Advanced Linked List",
    learnTopics: ["Remove Nth Node From End"],
    problems: [
      {
        id: "remove-nth-node-from-end-of-list",
        title: "Remove Nth Node From End of List",
        difficulty: "Medium",
        patternTag: "Linked List",
        description: "Remove the Nth node from the end of linked list array.",
        starterCode: `function removeNthFromEnd(head, n) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[1,2,3,4,5], 2", expectedOutput: "[1,2,3,5]" }
        ]
      }
    ]
  },
  {
    dayNumber: 21,
    weekNumber: 3,
    title: "WEEKLY TEST 🧪",
    isWeeklyTest: true,
    timeLimitMinutes: 90,
    learnTopics: ["Binary Search & Linked List timed test."],
    problems: [
      {
        id: "day21-binary-search",
        title: "Binary Search Review",
        difficulty: "Easy",
        patternTag: "Binary Search",
        description: "Search target in sorted array.",
        starterCode: `function search(nums, target) {}`,
        testCases: [{ input: "[-1,0,3,5,9,12], 9", expectedOutput: "4" }]
      }
    ]
  },

  // WEEK 4 (PHASE 4 - POPULATED)
  {
    dayNumber: 22,
    weekNumber: 4,
    title: "Stack",
    learnTopics: ["LIFO (Last In First Out)", "Valid Parentheses Matching"],
    codeSnippets: [
      {
        title: "JS Stack Operations",
        code: `const stack = [];\nstack.push(10);\nconst top = stack.pop();`
      }
    ],
    problems: [
      {
        id: "valid-parentheses",
        title: "Valid Parentheses",
        difficulty: "Easy",
        patternTag: "Stack",
        description: "Given a string `s` of brackets '()[]{}', determine if input string is valid.",
        starterCode: `function isValid(s) {\n    // Write solution here\n}`,
        testCases: [
          { input: "\"()\"", expectedOutput: "true" },
          { input: "\"()[]{}\"", expectedOutput: "true" },
          { input: "\"(]\"", expectedOutput: "false" }
        ]
      }
    ]
  },
  {
    dayNumber: 23,
    weekNumber: 4,
    title: "Monotonic Stack",
    learnTopics: ["Daily Temperatures & Next Greater Element"],
    problems: [
      {
        id: "daily-temperatures",
        title: "Daily Temperatures",
        difficulty: "Medium",
        patternTag: "Monotonic Stack",
        description: "Return an array of days to wait for a warmer temperature.",
        starterCode: `function dailyTemperatures(temperatures) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[73,74,75,71,69,72,76,73]", expectedOutput: "[1,1,4,2,1,1,0,0]" }
        ]
      }
    ]
  },
  {
    dayNumber: 24,
    weekNumber: 4,
    title: "Queue",
    learnTopics: ["FIFO (First In First Out)", "Recent calls queue"],
    problems: [
      {
        id: "number-of-recent-calls",
        title: "Number of Recent Calls",
        difficulty: "Easy",
        patternTag: "Queue",
        description: "Count recent pings within 3000ms window.",
        starterCode: `function countRecent(pings) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[1, 100, 3001, 3002]", expectedOutput: "[1,2,3,3]" }
        ]
      }
    ]
  },
  {
    dayNumber: 25,
    weekNumber: 4,
    title: "Recursion",
    learnTopics: ["Base case vs Recursive case", "Fibonacci sequence"],
    problems: [
      {
        id: "fibonacci-number",
        title: "Fibonacci Number",
        difficulty: "Easy",
        patternTag: "Recursion",
        description: "Calculate F(n) where F(n) = F(n-1) + F(n-2).",
        starterCode: `function fib(n) {\n    // Write solution here\n}`,
        testCases: [
          { input: "2", expectedOutput: "1" },
          { input: "4", expectedOutput: "3" }
        ]
      }
    ]
  },
  {
    dayNumber: 26,
    weekNumber: 4,
    title: "Backtracking",
    learnTopics: ["Subsets & Decision Trees"],
    problems: [
      {
        id: "subsets",
        title: "Subsets",
        difficulty: "Medium",
        patternTag: "Backtracking",
        description: "Return all possible subsets (power set) of unique array.",
        starterCode: `function subsets(nums) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[1,2,3]", expectedOutput: "[[],[1],[1,2],[1,2,3],[1,3],[2],[2,3],[3]]" }
        ]
      }
    ]
  },
  {
    dayNumber: 27,
    weekNumber: 4,
    title: "Backtracking Patterns",
    learnTopics: ["Combination Sum"],
    problems: [
      {
        id: "combination-sum",
        title: "Combination Sum",
        difficulty: "Medium",
        patternTag: "Backtracking",
        description: "Return unique combinations that sum to target.",
        starterCode: `function combinationSum(candidates, target) {\n    // Write solution here\n}`,
        testCases: [
          { input: "[2,3,6,7], 7", expectedOutput: "[[2,2,3],[7]]" }
        ]
      }
    ]
  },
  {
    dayNumber: 28,
    weekNumber: 4,
    title: "Mixed Practice",
    learnTopics: ["Recursion & Stack revision"],
    problems: [
      {
        id: "day28-valid-parentheses",
        title: "Valid Parentheses Review",
        difficulty: "Easy",
        patternTag: "Stack",
        description: "Validate bracket string.",
        starterCode: `function isValid(s) {}`,
        testCases: [{ input: "\"()\"", expectedOutput: "true" }]
      }
    ]
  },
  {
    dayNumber: 29,
    weekNumber: 4,
    title: "Full Revision & DSA Cheat Sheet",
    learnTopics: ["Pattern Cheatsheet Review"],
    targetSummary: "Review your pattern cheat sheet and prepare for the Real Interview Test tomorrow.",
    problems: []
  },
  {
    dayNumber: 30,
    weekNumber: 4,
    title: "🚨 Real Interview Test",
    isInterviewTest: true,
    timeLimitMinutes: 120,
    learnTopics: ["Final Evaluation Mock Exam."],
    targetSummary: "Final evaluation test to determine what you actually need to improve.",
    problems: []
  }
];
