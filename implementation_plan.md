# Implementation Plan - JavaScript DSA Practice & Code Execution Platform

An interactive web-based Data Structures and Algorithms (DSA) learning and practice platform built with **Angular** and **Node.js**. The application features an integrated code editor, real-time JS code execution engine, automated test case runner, progress tracking, and a built-in 30-day structured DSA curriculum.

---

## Technical Stack & System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Angular Frontend                     │
│  - 30-Day Roadmap & Curriculum Explorer                │
│  - LeetCode-style Split View (Problem/Learn & Editor)  │
│  - CodeMirror / Monaco JS Code Editor                  │
│  - Test Results, Console Log & Timer Panel             │
│  - Day 29 Cheat Sheet & Day 30 Interview Simulator     │
└───────────────────────────┬────────────────────────────┘
                            │ REST APIs / HTTP
┌───────────────────────────▼────────────────────────────┐
│                    Node.js Backend                     │
│  - Express REST API Server                             │
│  - Sandbox JS Runner (`vm` module / safe context)      │
│  - Test Case Validator & Output Sanitizer              │
│  - JSON/SQLite Problem & User Progress Store           │
└────────────────────────────────────────────────────────┘
```

### Stack Components:
1. **Frontend (Angular 18+)**:
   - **Standalone Components & Signals** for reactive state management.
   - **Monaco Editor / CodeMirror** for rich JavaScript code editing (syntax highlighting, line numbers, auto-indent).
   - **Dark Theme IDE UI** inspired by LeetCode / VS Code with modern aesthetics (glassmorphism panels, responsive split-panes).
   - **Timer & Test Simulator Component** for Day 7/14/21/28 weekly tests and Day 30 Mock Interview.

2. **Backend (Node.js + Express)**:
   - **Code Execution Engine**: Node `vm` sandboxed execution context to capture `console.log` statements, run starter functions against hidden/visible test cases, enforce execution timeouts (e.g. 2000ms limit to prevent infinite loops), and measure execution time.
   - **Curriculum API**: Delivers the 30-day course metadata, daily learning guides, JS code snippets, and problem definitions.
   - **Progress API**: Saves solved status, submission history, weekly test scores, and interview performance logs.

---

## User Review Required

> [!IMPORTANT]
> **Sandboxed Code Execution**: The Node.js backend will run user-submitted JS code in isolated `vm` execution contexts with strict timeouts (e.g., 2 seconds max) to safely handle infinite loops or recursion errors.

> [!NOTE]
> **Monaco / CodeMirror Integration**: The frontend will embed an interactive code editor with JavaScript auto-completion and syntax highlighting for an optimal coding experience.

---

## Proposed Project Structure

```
c:/Project/Learn/DSA/
├── backend/                        # Node.js API & Code Runner Service
│   ├── src/
│   │   ├── config/                 # App settings & sandbox limits
│   │   ├── controllers/            # Problem, Execution, & Progress controllers
│   │   ├── data/                   # 30-day curriculum & problem database JSON
│   │   ├── routes/                 # Express API routes
│   │   ├── services/               # Execution service (vm runner) & storage service
│   │   └── server.ts               # Express entry point
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                       # Angular App
    ├── src/
    │   ├── app/
    │   │   ├── core/               # Services (API, CodeRunner, Timer, Progress)
    │   │   ├── models/             # Problem, Day, Curriculum, Submission types
    │   │   ├── pages/
    │   │   │   ├── roadmap/        # 30-Day Curriculum Dashboard
    │   │   │   ├── problem-view/   # IDE view (Problem + Editor + Console)
    │   │   │   ├── cheat-sheet/    # Pattern Cheat Sheet (Day 29)
    │   │   │   └── interview-test/ # 2-Hour Mock Test & Scorecard (Day 30)
    │   │   ├── shared/             # Split pane, code editor, timer widget
    │   │   └── app.routes.ts
    │   └── styles.css              # IDE Dark Theme tokens & layout CSS
    ├── angular.json
    └── package.json
```

---

## Core Features & Curriculum Roadmap Integration

### 1. Structured 30-Day Curriculum Data Engine
Curriculum seeded directly with the provided plan:
- **Week 1 (Days 1–7)**: Fundamentals, Arrays, Hashing, Prefix Sum, Sorting, Day 7 Weekly Test.
- **Week 2 (Days 8–14)**: Two Pointers, Sliding Window, Mixed Practice, Day 14 Weekly Test.
- **Week 3 (Days 15–21)**: Binary Search, Linked List, Fast/Slow Pointers, Day 21 Weekly Test.
- **Week 4 (Days 22–30)**: Stack, Monotonic Stack, Queue, Recursion, Backtracking, Cheat Sheet (Day 29), Real 2-Hour Mock Test (Day 30).

Every day card will display:
- **Learn Section**: Concepts, JS code examples (`Map`, `Set`, `arr.sort()`, `ListNode`), time/space target.
- **Problems List**: Status badge (Unsolved/Passed/Failed), difficulty (Easy/Medium/Hard), link to IDE workspace.
- **Target / Strategy Note**.

### 2. Full-Featured Code Workspace (IDE)
- **Problem Statement & Theory Tab**: Description, examples, constraints, concept guide.
- **Code Editor**: JavaScript starter template pre-populated with function signatures.
- **Action Toolbar**: "Run Code" (against sample tests), "Submit Code" (against all test cases), "Reset Code".
- **Execution Output Drawer**:
  - Test case results table (Input, Expected Output, Actual Output, Status ✅/❌).
  - Console logs viewer (`console.log(...)` output rendered cleanly).
  - Runtime duration in ms and memory status.

### 3. Node.js JS Code Execution Engine (`runner.service.ts`)
- Executes user script in a safe `vm.createContext()` with custom standard library helpers (e.g. `ListNode` implementation for linked list problems).
- Runs code against multiple test inputs.
- Captures standard console logs.
- Detects infinite loops with `timeout: 2000` ms enforcement.
- Returns structured JSON execution responses:
  ```json
  {
    "status": "ACCEPTED" | "WRONG_ANSWER" | "TIME_LIMIT_EXCEEDED" | "RUNTIME_ERROR",
    "testResults": [
      { "input": "[2,7,11,15], 9", "expected": "[0,1]", "actual": "[0,1]", "passed": true }
    ],
    "consoleLogs": ["HashMap state: Map(2) { 2 => 0, 7 => 1 }"],
    "executionTimeMs": 14
  }
```

### 4. Day 29 Interactive DSA Cheat Sheet
Interactive reference table filtering by pattern (HashMap, Two Pointers, Sliding Window, Binary Search, Fast/Slow Pointers, Stack, Recursion/Backtracking) with:
- When to use
- Typical time & space complexities
- Boilerplate JavaScript code snippets.

### 5. Day 30 Real Interview Test Simulator
- 2-Hour active countdown timer.
- Selects 5 random problems from the curriculum.
- Hides topic tags, difficulty levels, and hints.
- Records completion status, completion time, selected pattern tag per problem.
- Displays summary scorecard with improvement recommendations (e.g., 5/5 Excellent, 3-4/5 Good, <3 Revise).

---

## Verification & Execution Plan

### Phase 1: Backend Setup (Node.js & Code Runner Engine)
1. Initialize Node.js Express project with TypeScript.
2. Build `vm`-based JS code sandbox runner with timeout protection and test-case evaluator.
3. Build JSON data provider API for 30-Day curriculum and problems.
4. Verify backend execution using unit tests for sample problems (e.g., Two Sum, Valid Anagram).

### Phase 2: Frontend Setup (Angular 18 Workspace)
1. Create Angular app with standalone components and routing.
2. Implement modern split-pane dark IDE theme (CSS Design System).
3. Build Roadmap & Daily View components.
4. Build Code Editor component with syntax highlighting & execution console drawer.

### Phase 3: Test & Mock Interview Modules
1. Implement Day 29 Cheat Sheet view.
2. Implement Day 30 2-Hour Mock Test simulator with scorecard summary.
3. Verify progress persistence (saving solved states per problem).

---

## Steps to Execute Project
When ready to implement, we will execute:
1. `npm init` backend app and install dependencies (`express`, `cors`, `typescript`, `@types/node`).
2. `npx @angular/cli new frontend` or setup Angular frontend app.
3. Wire up API calls between Angular service and Node.js execution server.
4. Launch backend and frontend development servers.
