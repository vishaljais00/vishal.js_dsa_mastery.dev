import { DayPlan } from './curriculum';

export const JS_CURRICULUM_DATA: DayPlan[] = [
  // WEEK 1 — JS Core & Deep Fundamentals
  {
    dayNumber: 1,
    weekNumber: 1,
    title: "JS Execution Context, Hoisting & TDZ",
    learnTopics: [
      "var vs let vs const scoping",
      "Global vs Function Execution Context",
      "Hoisting mechanics & Lexical Environment",
      "Temporal Dead Zone (TDZ)",
      "Strict mode rules ('use strict')"
    ],
    codeSnippets: [
      {
        title: "Hoisting & TDZ Example",
        code: `console.log(a); // undefined (hoisted)\nvar a = 10;\n// console.log(b); // ReferenceError: Cannot access 'b' before initialization (TDZ)\nlet b = 20;`
      }
    ],
    targetSummary: "Understand execution context creation and execution phases in JS engines.",
    problems: [
      {
        id: "js-execution-context",
        title: "Simulate Variable Scope & Hoisting Resolver",
        difficulty: "Easy",
        patternTag: "JS Core",
        description: "Write a function `resolveVariableScope(scopeMap, varName)` that searches a scope chain (array of scope objects from inner to outer) for `varName`. Return `{ found: true, value, depth }` if found, or `{ found: false }` if not found.",
        starterCode: `/**\n * @param {Object[]} scopeChain\n * @param {string} varName\n * @return {Object}\n */\nfunction resolveVariableScope(scopeChain, varName) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '[{ a: 10 }, { b: 20 }], "a"', expectedOutput: '{"found":true,"value":10,"depth":0}' },
          { input: '[{ a: 10 }, { b: 20 }], "b"', expectedOutput: '{"found":true,"value":20,"depth":1}' },
          { input: '[{ a: 10 }], "c"', expectedOutput: '{"found":false}' }
        ],
        solutionHint: "Iterate through the array of scope objects in order (inner to outer) checking `in` operator."
      }
    ]
  },
  {
    dayNumber: 2,
    weekNumber: 1,
    title: "Functions, Parameters & Higher-Order Functions",
    learnTopics: [
      "Function Declarations vs Expressions",
      "Arrow Functions & Implicit Returns",
      "Default Parameters, Rest & Spread",
      "First-Class Functions & Higher-Order Functions (HOF)"
    ],
    codeSnippets: [
      {
        title: "Higher Order Functions",
        code: `const multiplyBy = (factor) => (num) => num * factor;\nconst double = multiplyBy(2);\nconsole.log(double(5)); // 10`
      }
    ],
    targetSummary: "Master functions as first-class citizens and composing higher-order utilities.",
    problems: [
      {
        id: "js-custom-higher-order",
        title: "Implement Custom HOF `mapWithFilter`",
        difficulty: "Easy",
        patternTag: "JS Functions",
        description: "Write a higher-order function `mapWithFilter(arr, predicateFn, mapperFn)` that filters an array by `predicateFn` and then maps remaining elements using `mapperFn` in a single pass.",
        starterCode: `/**\n * @param {Array} arr\n * @param {Function} predicateFn\n * @param {Function} mapperFn\n * @return {Array}\n */\nfunction mapWithFilter(arr, predicateFn, mapperFn) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '[1, 2, 3, 4], x => x % 2 === 0, x => x * 10', expectedOutput: '[20, 40]' },
          { input: '["apple", "banana", "kiwi"], s => s.length > 4, s => s.toUpperCase()', expectedOutput: '["BANANA"]' }
        ],
        solutionHint: "Iterate over the array, check predicate condition, apply mapper function if true."
      }
    ]
  },
  {
    dayNumber: 3,
    weekNumber: 1,
    title: "Objects, Destructuring & Deep Copying",
    learnTopics: [
      "Object Literals & Computed Properties",
      "Object Destructuring & Rest Syntax",
      "Object.keys(), Object.values(), Object.entries()",
      "Shallow Copy (Object.assign, Spread) vs Deep Copy (structuredClone, JSON)"
    ],
    codeSnippets: [
      {
        title: "Deep Copy in JS",
        code: `const original = { a: 1, b: { c: 2 } };\nconst deepCopy = JSON.parse(JSON.stringify(original));`
      }
    ],
    targetSummary: "Master object manipulation, property iteration, and immutability.",
    problems: [
      {
        id: "js-deep-clone",
        title: "Deep Clone Object Implementation",
        difficulty: "Medium",
        patternTag: "JS Objects",
        description: "Implement a deep clone function `deepClone(obj)` that handles nested objects, arrays, primitives, and null without mutating the original object.",
        starterCode: `/**\n * @param {any} obj\n * @return {any}\n */\nfunction deepClone(obj) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '{"a": 1, "b": {"c": 2}}', expectedOutput: '{"a":1,"b":{"c":2}}' },
          { input: '[1, [2, 3], {"x": 4}]', expectedOutput: '[1,[2,3],{"x":4}]' }
        ],
        solutionHint: "Use recursion for nested objects/arrays while checking primitive type conditions."
      }
    ]
  },
  {
    dayNumber: 4,
    weekNumber: 1,
    title: "Functional Array Methods: Map, Filter, Reduce & Flat",
    learnTopics: [
      "Array.prototype.map & Array.prototype.filter",
      "Array.prototype.reduce & Accumulator pattern",
      "some, every, find, findIndex",
      "Array.prototype.flat & flatMap"
    ],
    codeSnippets: [
      {
        title: "Reduce Array Aggregation",
        code: `const nums = [1, 2, 3, 4];\nconst sum = nums.reduce((acc, curr) => acc + curr, 0);`
      }
    ],
    targetSummary: "Master functional declarative array processing and data transformations.",
    problems: [
      {
        id: "js-array-transformations",
        title: "Group Array & Flatten Nested Arrays",
        difficulty: "Easy",
        patternTag: "JS Arrays",
        description: "Write a function `flattenAndSum(nestedArray)` that takes an array containing integers and nested arrays of integers of arbitrary depth, flattens it, and returns the total sum.",
        starterCode: `/**\n * @param {Array} nestedArray\n * @return {number}\n */\nfunction flattenAndSum(nestedArray) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '[1, [2, [3, 4]], 5]', expectedOutput: '15' },
          { input: '[[10], [20, [30]]]', expectedOutput: '60' }
        ],
        solutionHint: "Use `Array.prototype.flat(Infinity)` and then `reduce()` to sum elements."
      }
    ]
  },
  {
    dayNumber: 5,
    weekNumber: 1,
    title: "Closures, Lexical Environment & Private State",
    learnTopics: [
      "Lexical Scope vs Dynamic Scope",
      "Outer variable environment retention in heap",
      "Encapsulating private variables",
      "Function factories & Module pattern"
    ],
    codeSnippets: [
      {
        title: "Private Counter via Closure",
        code: `function createCounter() {\n  let count = 0;\n  return () => ++count;\n}\nconst next = createCounter();`
      }
    ],
    targetSummary: "Master closures for state encapsulation and private variable protection.",
    problems: [
      {
        id: "js-private-counter-closure",
        title: "Create Encapsulated Counter Closure",
        difficulty: "Easy",
        patternTag: "JS Closures",
        description: "Create a function `createEncapsulatedCounter(initVal)` that returns an object with methods `increment()`, `decrement()`, `reset()`, and `getValue()`. Private state should not be directly accessible.",
        starterCode: `/**\n * @param {number} initVal\n * @return {Object}\n */\nfunction createEncapsulatedCounter(initVal = 0) {\n    // Write your solution here\n    // Return an object with increment(), decrement(), reset(), getValue() methods\n    \n}`,
        testCases: [
          { input: '5', expectedOutput: '{"increment":6,"decrement":5,"reset":5,"getValue":5}' }
        ],
        solutionHint: "Return an object of arrow functions bound to `val` variable in parent function scope."
      }
    ]
  },
  {
    dayNumber: 6,
    weekNumber: 1,
    title: "The `this` Keyword, Binding & Call/Apply/Bind",
    learnTopics: [
      "`this` in regular functions vs Arrow functions",
      "Implicit binding (Object method call)",
      "Explicit binding (`call`, `apply`, `bind`)",
      "Constructor function `new` operator binding"
    ],
    codeSnippets: [
      {
        title: "Explicit Binding",
        code: `function greet() { return 'Hello ' + this.name; }\nconst person = { name: 'Alice' };\nconsole.log(greet.call(person));`
      }
    ],
    targetSummary: "Master execution context `this` resolution rules across all invocation scenarios.",
    problems: [
      {
        id: "js-custom-bind",
        title: "Implement Custom Polyfill for `Function.prototype.bind`",
        difficulty: "Medium",
        patternTag: "JS Context",
        description: "Write a function `myBind(fn, context, ...boundArgs)` that acts as a polyfill for `fn.bind(context, ...boundArgs)`. Returning a new bound function.",
        starterCode: `/**\n * @param {Function} fn\n * @param {Object} context\n * @param {...any} boundArgs\n * @return {Function}\n */\nfunction myBind(fn, context, ...boundArgs) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '(function(a, b) { return this.x + a + b; }), {x: 10}, 5', expectedOutput: 'Function bound correctly' }
        ],
        solutionHint: "Return a wrapper function that calls `fn.apply(context, [...boundArgs, ...args])`."
      }
    ]
  },
  {
    dayNumber: 7,
    weekNumber: 1,
    title: "Week 1 Project: Expense Tracker Engine",
    isWeeklyTest: true,
    learnTopics: [
      "Integrating Closures, HOFs & Object methods",
      "Data Filtering, Aggregation & Grouping",
      "Immutability & State Management"
    ],
    targetSummary: "Build a complete mini Expense Tracker data calculation and filtering engine.",
    problems: [
      {
        id: "js-expense-tracker-engine",
        title: "Expense Tracker Calculation & Filter Engine",
        difficulty: "Medium",
        patternTag: "JS Project",
        description: "Write an `ExpenseManager` class/function that supports `addExpense({ id, title, amount, category })`, `deleteExpense(id)`, `getTotal()`, `getExpensesByCategory(category)`, and `getSummary()`. Returning total spent per category.",
        starterCode: `/**\n * Expense Tracker Engine\n */\nfunction createExpenseManager() {\n    // Write your solution here\n    // Return an object with: addExpense(expense), deleteExpense(id),\n    // getTotal(), getExpensesByCategory(category), getSummary()\n    \n}`,
        testCases: [
          { input: '[{"id":1,"amount":100,"category":"Food"},{"id":2,"amount":50,"category":"Travel"}]', expectedOutput: 'Total: 150' }
        ],
        solutionHint: "Use array methods `reduce` and `filter` to compute categories and totals."
      }
    ]
  },

  // WEEK 2 — Advanced JS & Async Programming
  {
    dayNumber: 8,
    weekNumber: 2,
    title: "Prototypes, Prototypal Inheritance & ES6 Classes",
    learnTopics: [
      "Prototype chain (`__proto__` vs `prototype`)",
      "Constructor functions & Prototype extension",
      "ES6 `class`, `constructor`, `super`, `extends`",
      "Static methods & Private class fields (`#field`)"
    ],
    codeSnippets: [
      {
        title: "ES6 Class Inheritance",
        code: `class Animal { constructor(name) { this.name = name; } }\nclass Dog extends Animal { speak() { return this.name + ' barks'; } }`
      }
    ],
    targetSummary: "Understand prototypal object inheritance and modern class syntax.",
    problems: [
      {
        id: "js-prototype-inheritance",
        title: "Prototypal Class Inheritance Model",
        difficulty: "Easy",
        patternTag: "JS OOP",
        description: "Create a `Shape` class with method `getArea()` and a subclass `Rectangle` that inherits from `Shape` with properties `width` and `height` and overrides `getArea()`.",
        starterCode: `class Shape {\n    // Write your solution here\n    getArea() { return 0; }\n}\n\nclass Rectangle extends Shape {\n    constructor(width, height) {\n        super();\n        // Write your solution here\n    }\n    getArea() {\n        // Write your solution here\n    }\n}`,
        testCases: [
          { input: '5, 10', expectedOutput: '50' }
        ],
        solutionHint: "Use `extends` keyword and call `super()` inside constructor."
      }
    ]
  },
  {
    dayNumber: 9,
    weekNumber: 2,
    title: "ES6+ Deep Dive & Safe Property Accessors",
    learnTopics: [
      "Optional Chaining (`?.`) & Nullish Coalescing (`??`)",
      "Destructuring Aliases & Nested Destructuring",
      "Template Literals & Tagged Templates",
      "ES Modules (`import` / `export`)"
    ],
    codeSnippets: [
      {
        title: "Optional Chaining & Nullish Coalescing",
        code: `const street = user?.address?.street ?? 'Unknown';`
      }
    ],
    targetSummary: "Write safe, clean ES6+ JavaScript preventing null pointer TypeError exceptions.",
    problems: [
      {
        id: "js-es6-object-safeguard",
        title: "Safe Deep Property Path Resolver",
        difficulty: "Easy",
        patternTag: "JS ES6+",
        description: "Write a function `getDeepProperty(obj, path, fallback)` that safely resolves nested properties given a dot-separated string path (e.g. `'user.profile.name'`). Return `fallback` if path does not exist or resolves to null/undefined.",
        starterCode: `/**\n * @param {Object} obj\n * @param {string} path\n * @param {any} fallback\n * @return {any}\n */\nfunction getDeepProperty(obj, path, fallback = null) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '{"user": {"name": "Alice"}}, "user.name", "N/A"', expectedOutput: '"Alice"' },
          { input: '{"user": {}}, "user.profile.age", 18', expectedOutput: '18' }
        ],
        solutionHint: "Split path by dot, iterate through object keys checking existence."
      }
    ]
  },
  {
    dayNumber: 10,
    weekNumber: 2,
    title: "Asynchronous JavaScript & Event Loop Mechanics",
    learnTopics: [
      "Call Stack & Execution Context stack",
      "Web APIs (Browser APIs / Node APIs)",
      "Microtask Queue vs Macrotask Queue (Task Queue)",
      "Event Loop event-polling cycle"
    ],
    codeSnippets: [
      {
        title: "Event Loop Queue Priority",
        code: `console.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);\n// Output: 1, 4, 3, 2`
      }
    ],
    targetSummary: "Understand microtask vs macrotask execution timing in single-threaded JS runtime.",
    problems: [
      {
        id: "js-event-loop-scheduler",
        title: "Task Priority Queue Simulator",
        difficulty: "Medium",
        patternTag: "JS Async",
        description: "Write a simulator `simulateEventLoop(tasks)` that sorts an array of scheduled task objects `{ id, type: 'sync' | 'microtask' | 'macrotask' }` into their exact execution order.",
        starterCode: `/**\n * @param {Array} tasks - each task: { id, type: 'sync' | 'microtask' | 'macrotask' }\n * @return {Array} - task ids in execution order\n */\nfunction simulateEventLoop(tasks) {\n    // Write your solution here\n    // Order: sync → microtask → macrotask\n    \n}`,
        testCases: [
          { input: '[{"id":"t1","type":"macrotask"},{"id":"t2","type":"sync"},{"id":"t3","type":"microtask"}]', expectedOutput: '["t2","t3","t1"]' }
        ],
        solutionHint: "Sync tasks execute first, followed by microtasks, then macrotasks."
      }
    ]
  },
  {
    dayNumber: 11,
    weekNumber: 2,
    title: "Promises, Chaining & Polyfills",
    learnTopics: [
      "Promise States: Pending, Fulfilled, Rejected",
      "`.then()`, `.catch()`, `.finally()` chaining",
      "Promise error propagation & recovery",
      "Creating Promises from scratch"
    ],
    codeSnippets: [
      {
        title: "Promise Chaining",
        code: `fetchUser(id)\n  .then(user => fetchOrders(user.id))\n  .catch(err => console.error(err));`
      }
    ],
    targetSummary: "Master Promise state transitions, chaining, and error handling.",
    problems: [
      {
        id: "js-custom-promise",
        title: "Custom Simple Promise Implementation",
        difficulty: "Hard",
        patternTag: "JS Promises",
        description: "Implement a simplified Promise class `SimplePromise` that supports constructor `(executor)` with `resolve` and `reject` functions, and a `.then(onFulfilled)` callback handler.",
        starterCode: `class SimplePromise {\n    constructor(executor) {\n        // Write your solution here\n        // Implement: state, value, callbacks, resolve function\n    }\n    then(onFulfilled) {\n        // Write your solution here\n    }\n}`,
        testCases: [
          { input: 'res => res(42)', expectedOutput: '42' }
        ],
        solutionHint: "Maintain pending/fulfilled state, value, and array of callbacks to execute on resolve."
      }
    ]
  },
  {
    dayNumber: 12,
    weekNumber: 2,
    title: "Async/Await & Parallel Promise Concurrency",
    learnTopics: [
      "`async` functions & `await` expression keyword",
      "Error handling using `try/catch/finally` blocks",
      "Sequential vs Parallel Async execution",
      "`Promise.all`, `Promise.allSettled`, `Promise.race`, `Promise.any`"
    ],
    codeSnippets: [
      {
        title: "Parallel Concurrency with Promise.all",
        code: `const [users, posts] = await Promise.all([fetchUsers(), fetchPosts()]);`
      }
    ],
    targetSummary: "Master asynchronous workflow control and concurrent API request handling.",
    problems: [
      {
        id: "js-async-parallel-runner",
        title: "Parallel Async Task Runner with Limit",
        difficulty: "Hard",
        patternTag: "JS Concurrency",
        description: "Write a function `runConcurrentTasks(tasks, limit)` that executes an array of async task functions `() => Promise` in parallel, keeping at most `limit` tasks running concurrently.",
        starterCode: `/**\n * @param {Function[]} tasks - array of () => Promise functions\n * @param {number} limit - max concurrent tasks\n * @return {Promise<Array>}\n */\nasync function runConcurrentTasks(tasks, limit) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '[() => 1, () => 2], 2', expectedOutput: '[1, 2]' }
        ],
        solutionHint: "Use `Promise.all` combined with `Promise.race` to cap active executing pool size."
      }
    ]
  },
  {
    dayNumber: 13,
    weekNumber: 2,
    title: "Browser DOM Events, Delegation & Storage",
    learnTopics: [
      "DOM Traversal & Manipulation",
      "Event Bubbling vs Event Capturing phases",
      "Event Delegation pattern",
      "LocalStorage & SessionStorage APIs"
    ],
    codeSnippets: [
      {
        title: "Event Delegation",
        code: `document.getElementById('list').addEventListener('click', (e) => {\n  if (e.target.matches('li')) console.log(e.target.textContent);\n});`
      }
    ],
    targetSummary: "Master browser event delegation and client-side storage persistence.",
    problems: [
      {
        id: "js-event-emitter",
        title: "Custom PubSub Event Emitter Class",
        difficulty: "Medium",
        patternTag: "JS Architecture",
        description: "Design a `EventEmitter` class with methods `on(event, listener)`, `off(event, listener)`, and `emit(event, ...args)`. Allowing components to subscribe and publish custom events.",
        starterCode: `class EventEmitter {\n    constructor() {\n        // Write your solution here\n    }\n    on(event, listener) {\n        // Write your solution here\n    }\n    off(event, listener) {\n        // Write your solution here\n    }\n    emit(event, ...args) {\n        // Write your solution here\n    }\n}`,
        testCases: [
          { input: '"click", data => data', expectedOutput: 'Event Emitted' }
        ],
        solutionHint: "Maintain an object map of event names to arrays of listener functions."
      }
    ]
  },
  {
    dayNumber: 14,
    weekNumber: 2,
    title: "Week 2 Project: GitHub User Search Processor",
    isWeeklyTest: true,
    learnTopics: [
      "Integrating Async/Await, Fetch API simulation",
      "Error handling, loading states, and pagination",
      "Data Caching in memory"
    ],
    targetSummary: "Build a robust GitHub search & pagination data processing engine.",
    problems: [
      {
        id: "js-github-search-processor",
        title: "GitHub User & Repo Search Filter Engine",
        difficulty: "Medium",
        patternTag: "JS Project",
        description: "Write a function `processGitHubSearchResponse(users, repos, minStars)` that takes array of user objects and repository objects, filters repos with stars >= `minStars`, and joins user profiles with their top starred repos.",
        starterCode: `/**\n * @param {Array} users\n * @param {Array} repos\n * @param {number} minStars\n * @return {Array}\n */\nfunction processGitHubSearchResponse(users, repos, minStars = 10) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '[{"id":1,"name":"Alice"}], [{"id":100,"owner_id":1,"stargazers_count":50}], 10', expectedOutput: '[{"id":1,"name":"Alice","topRepos":[{"id":100,"owner_id":1,"stargazers_count":50}]}]' }
        ],
        solutionHint: "Filter repos by stargazers_count then map users joining matching repos by owner_id."
      }
    ]
  },

  // WEEK 3 — DSA + JavaScript Problem Solving
  {
    dayNumber: 15,
    weekNumber: 3,
    title: "Algorithmic Complexity & Array Operations",
    learnTopics: [
      "Big O Notation (Time vs Space complexity)",
      "In-place array mutations vs Immutable copies",
      "Two Pointers vs Hash Table tradeoffs"
    ],
    codeSnippets: [
      {
        title: "Move Zeroes In-Place O(N)",
        code: `let writeIdx = 0;\nfor (let readIdx = 0; readIdx < nums.length; readIdx++) {\n  if (nums[readIdx] !== 0) nums[writeIdx++] = nums[readIdx];\n}`
      }
    ],
    targetSummary: "Solve array manipulation problems in O(N) linear time and O(1) space.",
    problems: [
      {
        id: "js-move-zeroes",
        title: "Move Zeroes to End",
        difficulty: "Easy",
        patternTag: "Arrays",
        description: "Given an integer array `nums`, move all `0`'s to the end of it while maintaining the relative order of the non-zero elements in-place.",
        starterCode: `/**\n * @param {number[]} nums\n * @return {number[]}\n */\nfunction moveZeroes(nums) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '[0, 1, 0, 3, 12]', expectedOutput: '[1, 3, 12, 0, 0]' },
          { input: '[0]', expectedOutput: '[0]' }
        ],
        solutionHint: "Use a write pointer that advances only when encountering non-zero numbers."
      }
    ]
  },
  {
    dayNumber: 16,
    weekNumber: 3,
    title: "String Algorithmic Patterns",
    learnTopics: [
      "String immutability in JavaScript",
      "Character frequency maps",
      "Palindromes & Substrings"
    ],
    codeSnippets: [
      {
        title: "Character Frequency Map",
        code: `const counts = {};\nfor (let char of str) counts[char] = (counts[char] || 0) + 1;`
      }
    ],
    targetSummary: "Master string character counting and pointer traversal patterns.",
    problems: [
      {
        id: "js-first-unique-character",
        title: "First Unique Character in a String",
        difficulty: "Easy",
        patternTag: "Strings",
        description: "Given a string `s`, find the first non-repeating character in it and return its index. If it does not exist, return `-1`.",
        starterCode: `/**\n * @param {string} s\n * @return {number}\n */\nfunction firstUniqChar(s) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '"leetcode"', expectedOutput: '0' },
          { input: '"loveleetcode"', expectedOutput: '2' },
          { input: '"aabb"', expectedOutput: '-1' }
        ],
        solutionHint: "Build a frequency map first, then scan string to find first char with count 1."
      }
    ]
  },
  {
    dayNumber: 17,
    weekNumber: 3,
    title: "Hash Maps & Sets in JavaScript",
    learnTopics: [
      "Map vs Object vs Set",
      "O(1) average lookup times",
      "Grouping & Frequency Counting"
    ],
    codeSnippets: [
      {
        title: "Map vs Object",
        code: `const map = new Map();\nmap.set('a', 1);\nconsole.log(map.has('a')); // true`
      }
    ],
    targetSummary: "Master Hash Maps and Sets for fast lookup and grouping algorithms.",
    problems: [
      {
        id: "js-group-anagrams",
        title: "Group Anagrams",
        difficulty: "Medium",
        patternTag: "HashMap",
        description: "Given an array of strings `strs`, group the anagrams together. Return the answer in any order.",
        starterCode: `/**\n * @param {string[]} strs\n * @return {string[][]}\n */\nfunction groupAnagrams(strs) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '["eat","tea","tan","ate","nat","bat"]', expectedOutput: '[["eat","tea","ate"],["tan","nat"],["bat"]]' }
        ],
        solutionHint: "Use sorted character strings as unique map keys to group matching anagrams."
      }
    ]
  },
  {
    dayNumber: 18,
    weekNumber: 3,
    title: "Two Pointers Technique",
    learnTopics: [
      "Opposite end pointers (converging)",
      "Fast & Slow pointers (Floyd's Cycle Detection)",
      "Optimizing $O(N^2)$ to $O(N)$"
    ],
    codeSnippets: [
      {
        title: "Two Pointer Converging Loop",
        code: `let left = 0, right = arr.length - 1;\nwhile(left < right) { left++; right--; }`
      }
    ],
    targetSummary: "Master converging pointers for sorted array search and container area maximization.",
    problems: [
      {
        id: "js-container-with-most-water",
        title: "Container With Most Water",
        difficulty: "Medium",
        patternTag: "Two Pointers",
        description: "Given `n` non-negative integers `height` where each represents a point at coordinate `(i, height[i])`, find two lines that together with the x-axis forms a container that holds the most water.",
        starterCode: `/**\n * @param {number[]} height\n * @return {number}\n */\nfunction maxArea(height) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '[1, 8, 6, 2, 5, 4, 8, 3, 7]', expectedOutput: '49' },
          { input: '[1, 1]', expectedOutput: '1' }
        ],
        solutionHint: "Move the pointer pointing to the shorter line inward at each iteration."
      }
    ]
  },
  {
    dayNumber: 19,
    weekNumber: 3,
    title: "Sliding Window Pattern",
    learnTopics: [
      "Fixed size sliding window",
      "Dynamic size sliding window",
      "Substring and subarray optimal range search"
    ],
    codeSnippets: [
      {
        title: "Sliding Window Substring",
        code: `let left = 0;\nfor (let right = 0; right < s.length; right++) {\n  // expand right, shrink left when invalid\n}`
      }
    ],
    targetSummary: "Master sliding window range expansion and contraction algorithms.",
    problems: [
      {
        id: "js-longest-substring-distinct",
        title: "Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        patternTag: "Sliding Window",
        description: "Given a string `s`, find the length of the longest substring without repeating characters.",
        starterCode: `/**\n * @param {string} s\n * @return {number}\n */\nfunction lengthOfLongestSubstring(s) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '"abcabcbb"', expectedOutput: '3' },
          { input: '"bbbbb"', expectedOutput: '1' },
          { input: '"pwwkew"', expectedOutput: '3' }
        ],
        solutionHint: "Use a Set to maintain active window characters, shrinking left index when duplicate found."
      }
    ]
  },
  {
    dayNumber: 20,
    weekNumber: 3,
    title: "Stacks & Queues Data Structures",
    learnTopics: [
      "Stack LIFO (Last In First Out)",
      "Queue FIFO (First In First Out)",
      "Monotonic Stack pattern"
    ],
    codeSnippets: [
      {
        title: "Stack Matching",
        code: `const stack = [];\nstack.push('(');\nconst top = stack.pop();`
      }
    ],
    targetSummary: "Master Stack and Queue operations for parenthetical syntax matching and buffer management.",
    problems: [
      {
        id: "js-valid-parentheses",
        title: "Valid Parentheses Syntax Matcher",
        difficulty: "Easy",
        patternTag: "Stack",
        description: "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.",
        starterCode: `/**\n * @param {string} s\n * @return {boolean}\n */\nfunction isValid(s) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '"()"', expectedOutput: 'true' },
          { input: '"()[]{}"', expectedOutput: 'true' },
          { input: '"(]"', expectedOutput: 'false' }
        ],
        solutionHint: "Push open brackets to stack, pop and verify matching pair on closing bracket."
      }
    ]
  },
  {
    dayNumber: 21,
    weekNumber: 3,
    title: "Week 3 Challenge: DSA Mastery Test",
    isWeeklyTest: true,
    learnTopics: [
      "Combining Arrays, Strings, HashMaps, Two Pointers & Stacks",
      "Evaluating Time & Space Complexity",
      "Edge case verification"
    ],
    targetSummary: "Solve complex string math evaluation problem using Stacks.",
    problems: [
      {
        id: "js-dsa-mastery-challenge",
        title: "Evaluate Math Expression String",
        difficulty: "Hard",
        patternTag: "Stack DSA",
        description: "Given a string `s` representing a basic math expression containing non-negative integers and `+`, `-`, `*`, `/` operators, evaluate and return its integer value.",
        starterCode: `/**\n * @param {string} s\n * @return {number}\n */\nfunction calculate(s) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '"3+2*2"', expectedOutput: '7' },
          { input: '" 3/2 "', expectedOutput: '1' }
        ],
        solutionHint: "Use a stack to process multiplication/division immediately while pushing addition/subtraction."
      }
    ]
  },

  // WEEK 4 — Real-World JS & Node.js Production
  {
    dayNumber: 22,
    weekNumber: 4,
    title: "Node.js Internals, Modules & Environment",
    learnTopics: [
      "Node.js V8 runtime vs Browser runtime",
      "CommonJS (`require`) vs ES Modules (`import`)",
      "Node.js Event Loop phases (Timers, Poll, Check)",
      "`process.env`, file paths (`path`, `fs`)"
    ],
    codeSnippets: [
      {
        title: "Node.js Env & Path",
        code: `const path = require('path');\nconst PORT = process.env.PORT || 3000;`
      }
    ],
    targetSummary: "Understand Node.js runtime environment, module resolution, and process env.",
    problems: [
      {
        id: "js-node-path-resolver",
        title: "Config Path Resolver & Env Extractor",
        difficulty: "Easy",
        patternTag: "Node.js",
        description: "Write a function `parseEnvConfig(envString)` that parses a `.env` file content string into a key-value JavaScript object, stripping comments (`#`) and whitespace.",
        starterCode: `/**\n * @param {string} envString\n * @return {Object}\n */\nfunction parseEnvConfig(envString) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '"PORT=5000\\n# DB Comment\\nDB_HOST=localhost"', expectedOutput: '{"PORT":"5000","DB_HOST":"localhost"}' }
        ],
        solutionHint: "Split by newline, ignore empty/comment lines, split key=value pairs."
      }
    ]
  },
  {
    dayNumber: 23,
    weekNumber: 4,
    title: "Express.js REST APIs & Middleware Pipeline",
    learnTopics: [
      "Express Application & Route handling",
      "Middleware pipeline pattern (`req, res, next`)",
      "Request body parsing & query parameters",
      "HTTP Status codes & Error Handling Middleware"
    ],
    codeSnippets: [
      {
        title: "Express Middleware",
        code: `app.use((req, res, next) => {\n  console.log(req.method, req.url);\n  next();\n});`
      }
    ],
    targetSummary: "Master Express.js middleware chain execution and REST API routing.",
    problems: [
      {
        id: "js-express-middleware-runner",
        title: "Express-Style Middleware Pipeline",
        difficulty: "Medium",
        patternTag: "Express.js",
        description: "Write a `MiddlewareRunner` class with `.use(fn)` and `.execute(context)` that sequentially executes async middleware functions passing `context` and `next()` callback.",
        starterCode: `class MiddlewareRunner {\n    constructor() {\n        // Write your solution here\n    }\n    use(fn) {\n        // Write your solution here\n    }\n    async execute(context) {\n        // Write your solution here\n    }\n}`,
        testCases: [
          { input: 'ctx => { ctx.a = 1; }', expectedOutput: '{"a":1}' }
        ],
        solutionHint: "Use index pointer and recursive `next()` function call."
      }
    ]
  },
  {
    dayNumber: 24,
    weekNumber: 4,
    title: "Database Integration, Pagination & Filtering",
    learnTopics: [
      "Connection pooling & query execution",
      "SQL LIMIT / OFFSET pagination",
      "Filtering, Sorting, and Indexing strategies",
      "Preventing SQL / NoSQL Injection attacks"
    ],
    codeSnippets: [
      {
        title: "Pagination Formula",
        code: `const offset = (page - 1) * limit;\nconst query = 'SELECT * FROM users LIMIT ? OFFSET ?';`
      }
    ],
    targetSummary: "Master database query pagination, filtering, and query performance optimization.",
    problems: [
      {
        id: "js-db-pagination-engine",
        title: "Database Query Paginator & Filter Engine",
        difficulty: "Easy",
        patternTag: "Database",
        description: "Write a function `paginateRecords(records, page, limit, sortBy, sortOrder)` that returns a paginated result `{ data, page, totalPages, totalCount }`.",
        starterCode: `/**\n * @param {Array} records\n * @param {number} page\n * @param {number} limit\n * @param {string} sortBy\n * @param {string} sortOrder - 'asc' | 'desc'\n * @return {{ data, page, totalPages, totalCount }}\n */\nfunction paginateRecords(records, page = 1, limit = 10, sortBy = 'id', sortOrder = 'asc') {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '[{"id":2},{"id":1}], 1, 1, "id", "asc"', expectedOutput: '{"data":[{"id":1}],"page":1,"totalPages":2,"totalCount":2}' }
        ],
        solutionHint: "Sort array by key, slice by `(page-1)*limit` to `page*limit` range."
      }
    ]
  },
  {
    dayNumber: 25,
    weekNumber: 4,
    title: "Authentication, Hashing & JWT Security",
    learnTopics: [
      "Password hashing (bcrypt salted hashes)",
      "JSON Web Tokens (Header, Payload, Signature)",
      "Access Token vs Refresh Token architecture",
      "Authentication middleware & Route protection"
    ],
    codeSnippets: [
      {
        title: "JWT Structure",
        code: `const token = jwt.sign({ id: user.id }, SECRET, { expiresIn: '1h' });`
      }
    ],
    targetSummary: "Understand user auth workflows, password hashing, and JWT token protection.",
    problems: [
      {
        id: "js-jwt-auth-verifier",
        title: "JWT Payload Sign & Verification Simulator",
        difficulty: "Medium",
        patternTag: "Security",
        description: "Write a function `createAndVerifyToken(payload, secret)` that encodes payload into Base64 token string and verifies token decoding.",
        starterCode: `/**\n * @param {Object} payload\n * @param {string} secret\n * @return {Object}\n */\nfunction createAndVerifyToken(payload, secret) {\n    // Write your solution here\n    // Encode: use btoa(JSON.stringify(...))\n    // Return: { token, decodedPayload }\n    \n}`,
        testCases: [
          { input: '{"id": "user_123"}, "secret123"', expectedOutput: '{"id":"user_123"}' }
        ],
        solutionHint: "Base64 encode JSON strings with `btoa` and decode with `atob`."
      }
    ]
  },
  {
    dayNumber: 26,
    weekNumber: 4,
    title: "Production JS: Logging, Rate Limiting & CORS",
    learnTopics: [
      "Rate Limiting (Fixed Window / Token Bucket algorithm)",
      "CORS headers & Origin protection",
      "Input Sanitization & XSS Prevention",
      "Structured JSON Logging"
    ],
    codeSnippets: [
      {
        title: "Rate Limiter Logic",
        code: `if (requestsInWindow > MAX_REQUESTS) res.status(429).send('Too Many Requests');`
      }
    ],
    targetSummary: "Build production rate limiting and security headers for API resilience.",
    problems: [
      {
        id: "js-rate-limiter-token-bucket",
        title: "Token Bucket Rate Limiter",
        difficulty: "Medium",
        patternTag: "JS Security",
        description: "Implement a `RateLimiter` class with `allowRequest(ip)` method that caps requests per IP address to `maxRequests` per `windowMs` time window.",
        starterCode: `class RateLimiter {\n    constructor(maxRequests = 5, windowMs = 60000) {\n        // Write your solution here\n    }\n    allowRequest(ip) {\n        // Write your solution here\n        // Return true if allowed, false if rate limit exceeded\n    }\n}`,
        testCases: [
          { input: '"127.0.0.1"', expectedOutput: 'true' }
        ],
        solutionHint: "Filter timestamp logs older than windowMs, check array length."
      }
    ]
  },
  {
    dayNumber: 27,
    weekNumber: 4,
    title: "Performance Optimization: Debounce, Throttle & Memoize",
    learnTopics: [
      "Debouncing (Delayed execution after quiet period)",
      "Throttling (Capped execution frequency)",
      "Memoization & Cache Invalidation",
      "Memory Leaks & V8 Garbage Collection"
    ],
    codeSnippets: [
      {
        title: "Memoize HOF",
        code: `function memoize(fn) {\n  const cache = new Map();\n  return (arg) => cache.has(arg) ? cache.get(arg) : cache.set(arg, fn(arg)).get(arg);\n}`
      }
    ],
    targetSummary: "Master debouncing, throttling, and memoization optimization techniques.",
    problems: [
      {
        id: "js-memoize-with-ttl",
        title: "Memoize Function with TTL Expiry",
        difficulty: "Medium",
        patternTag: "Performance",
        description: "Write a function `memoizeWithTTL(fn, ttlMs)` that caches function call results, returning cached value unless cached entry is older than `ttlMs`.",
        starterCode: `/**\n * @param {Function} fn\n * @param {number} ttlMs\n * @return {Function}\n */\nfunction memoizeWithTTL(fn, ttlMs = 5000) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: 'x => x * 2, 1000', expectedOutput: 'Function memoized with TTL' }
        ],
        solutionHint: "Store object with value and timestamp in Map cache."
      }
    ]
  },
  {
    dayNumber: 28,
    weekNumber: 4,
    title: "JavaScript Design Patterns",
    learnTopics: [
      "Creational: Factory Pattern & Singleton Pattern",
      "Behavioral: Observer Pattern & Strategy Pattern",
      "Structural: Adapter Pattern & Repository Pattern"
    ],
    codeSnippets: [
      {
        title: "Singleton Pattern",
        code: `class Database { constructor() { if (!Database.instance) Database.instance = this; return Database.instance; } }`
      }
    ],
    targetSummary: "Master software design patterns for scalable JavaScript applications.",
    problems: [
      {
        id: "js-observer-pattern-store",
        title: "State Management Observer Store Pattern",
        difficulty: "Medium",
        patternTag: "Design Patterns",
        description: "Implement a `CreateStore` class with `getState()`, `setState(newState)`, and `subscribe(listener)` that notifies listeners whenever state changes.",
        starterCode: `class CreateStore {\n    constructor(initialState) {\n        // Write your solution here\n    }\n    getState() {\n        // Write your solution here\n    }\n    setState(newState) {\n        // Write your solution here - merge and notify listeners\n    }\n    subscribe(listener) {\n        // Write your solution here - return unsubscribe function\n    }\n}`,
        testCases: [
          { input: '{"count": 0}', expectedOutput: 'Store initialized' }
        ],
        solutionHint: "Maintain state object and array of subscriber listeners triggered on `setState`."
      }
    ]
  },

  // DAYS 29–30 — Final Projects & Mastery Exam
  {
    dayNumber: 29,
    weekNumber: 4,
    title: "Days 29–30 Final Project: AI Resume Analyzer Engine",
    isWeeklyTest: true,
    learnTopics: [
      "Full-stack Application Architecture Integration",
      "Text Parsing, Keyword Extraction & ATS Scoring Algorithm",
      "Skill Gap Analysis & Matcher"
    ],
    targetSummary: "Build an AI Resume Parser, Skill Matcher & ATS Score Calculator Engine.",
    problems: [
      {
        id: "js-ai-resume-analyzer",
        title: "AI Resume Parser & ATS Score Engine",
        difficulty: "Hard",
        patternTag: "Cap Project",
        description: "Write an `analyzeResume(resumeText, targetKeywords)` function that parses resume text, calculates ATS match percentage score (0-100), extracts missing required skills, and generates recommendations.",
        starterCode: `/**\n * @param {string} resumeText\n * @param {string[]} targetKeywords\n * @return {{ atsScore, foundSkills, missingSkills, status }}\n */\nfunction analyzeResume(resumeText, targetKeywords) {\n    // Write your solution here\n    \n}`,
        testCases: [
          { input: '"Experienced JavaScript Node.js Developer proficient in React and SQL", ["JavaScript", "Node.js", "React", "Docker"]', expectedOutput: '{"atsScore":75,"foundSkills":["JavaScript","Node.js","React"],"missingSkills":["Docker"],"status":"EXCELLENT"}' }
        ],
        solutionHint: "Search target keywords in lowercase resume text to compute match percentage."
      }
    ]
  },
  {
    dayNumber: 30,
    weekNumber: 4,
    title: "Day 30 Final Exam: Full-Stack & DSA Mastery Challenge",
    isInterviewTest: true,
    learnTopics: [
      "Complete Synthesis of JS Core, Async, Node, REST APIs, and DSA",
      "30-Day Platform Graduation Exam"
    ],
    targetSummary: "Comprehensive 30-Day Graduation Challenge synthesizing full-stack JS and DSA.",
    problems: [
      {
        id: "js-mastery-final-exam",
        title: "Full-Stack API & Algorithm Synthesizer",
        difficulty: "Hard",
        patternTag: "Graduation Exam",
        description: "Implement a `FullStackEngine` class that integrates `UserAuth`, `RateLimiting`, `DataCaching`, and `DSASolver` in a unified pipeline.",
        starterCode: `/**\n * 30-Day Graduation Final Exam\n */\nclass FullStackEngine {\n    constructor() {\n        // Write your solution here\n    }\n    processRequest(user, query) {\n        // Write your solution here\n        // Handle: auth check, cache lookup, execute, cache store\n    }\n}`,
        testCases: [
          { input: '{"id": 1}, "hello"', expectedOutput: '{"status":200,"data":"olleh","cached":false}' }
        ],
        solutionHint: "Check user authorization, consult cache Map, execute reverse string logic."
      }
    ]
  }
];
