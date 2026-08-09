# JS DSA Mastery Platform - Project Read Guide

This document explains what is implemented in this repository, how the pieces work together, and how to run it locally.

## 1) What this project is

A full-stack JavaScript DSA practice platform with:
- A 30-day curriculum roadmap
- Per-problem coding workspace
- Server-side JavaScript code execution and test-case checking
- Progress tracking per user
- Community solution sharing + upvotes
- Mock interview test flow with history
- Admin tools to add problems and configure mock test question pool

The stack is:
- Frontend: Angular 18 standalone app (`frontend-app`)
- Backend: Express + TypeScript (`backend`)
- Database: MySQL (`js_dsa_db`)

## 2) Actual high-level architecture

Frontend (`frontend-app`) calls REST APIs on backend (`http://localhost:3000/api`).

Backend responsibilities:
- Serve auth endpoints
- Serve curriculum/problem data
- Execute user code in a VM sandbox with timeout
- Persist progress, community solutions, and mock test history in MySQL

Database responsibilities:
- Store users, problems, progress, visits, solutions, upvotes, mock test config/results

## 3) Current folder meaning

- `backend/src/server.ts`: backend entry point and server startup
- `backend/src/config/db.ts`: MySQL pool + DB/table bootstrap
- `backend/src/routes/api.routes.ts`: all HTTP endpoints
- `backend/src/services/execution.service.ts`: JS sandbox runner + result formatter
- `backend/src/services/mysql-storage.service.ts`: business/data access layer for MySQL
- `backend/src/data/curriculum.ts`: seeded 30-day curriculum and built-in problems
- `frontend-app/src/app/app.routes.ts`: route map
- `frontend-app/src/app/core/services/*.ts`: auth, API, theme, toast services
- `frontend-app/src/app/pages/*`: feature screens

Legacy/unused path (important):
- `backend/src/services/storage.service.ts` and JSON files under `backend/data/*.json` are old file-based storage logic. The running backend currently uses MySQL service (`MysqlStorageService`) instead.

## 4) Backend behavior in detail

### Startup flow
1. `MysqlStorageService.init()` runs.
2. DB initializer creates `js_dsa_db` and tables if missing.
3. Default admin user is seeded if missing:
   - username: `admin`
   - password: `admin123`
4. Problems from `CURRICULUM_DATA` are seeded when problem count is below threshold.
5. Express starts on port `3000` (or `PORT` env override).

### Code execution flow (`/api/execute`)
1. Frontend sends code + test cases.
2. Backend extracts declared function name from code.
3. Runs code with Node `vm` in isolated context (2s timeout per run).
4. Compares actual vs expected (string/JSON-aware normalization).
5. Returns structured result:
   - `ACCEPTED`
   - `WRONG_ANSWER`
   - `TIME_LIMIT_EXCEEDED`
   - `RUNTIME_ERROR`
6. If accepted and logged-in user exists, progress is upserted.

## 5) REST API map

Auth:
- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/auth/update-password`

Curriculum/problems:
- `GET /api/curriculum?userId=...`
- `GET /api/problem/:id?userId=...`

Execution/progress:
- `POST /api/execute`
- `POST /api/save-code`

Mock test:
- `POST /api/mock-test/submit`
- `GET /api/mock-test/history/:userId`

Community:
- `GET /api/solutions/:problemId`
- `POST /api/solutions`
- `POST /api/solutions/:id/upvote`

Admin:
- `POST /api/admin/problems`
- `GET /api/admin/users-activity`
- `GET /api/admin/mock-test`
- `POST /api/admin/mock-test`

Health:
- `GET /health`

## 6) Frontend behavior in detail

### Main routes
- `/`: roadmap (30-day week/day cards)
- `/problem/:id`: problem IDE page (description + code + run/submit + community solutions)
- `/cheat-sheet`: pattern cheat sheet page
- `/interview-test`: multi-question mock test simulator
- `/mock-history`: user attempt history
- `/admin`: admin dashboard (question creation, mock config, user activity)

### Core UX/state patterns
- Uses Angular signals in services (`AuthService`, `DsaService`, `ThemeService`, `ToastService`).
- Session persistence in `localStorage`:
  - `dsa_user`
  - `dsa_theme`
- Theme is class-based (`dark` on root/body).

### Mock test implementation
- Frontend loads a configurable question pool from backend admin config.
- Shuffles and picks up to 5 questions.
- Uses per-question timers (each question can lock individually when time expires).
- Final submission evaluates all questions, computes score, and stores result.

## 7) Database schema summary

Created tables include:
- `users`
- `problems`
- `user_progress`
- `user_problem_visits`
- `community_solutions`
- `solution_upvotes`
- `mock_test_config`
- `mock_test_results`

`problems.test_cases` and mock result payloads are stored as JSON.

## 8) How to run locally

Prerequisites:
- Node.js (LTS)
- MySQL running locally
- MySQL credentials matching backend config (`root` / `root`)

Backend:
1. `cd backend`
2. `npm install`
3. `npm run dev`

Frontend:
1. `cd frontend-app`
2. `npm install`
3. `npm start`

App URLs:
- Frontend: `http://localhost:4202`
- Backend: `http://localhost:3000`

## 9) Important implementation notes (current state)

- Auth token returned from backend is not used for protected API authorization.
- Passwords are stored as plain text (`password_hash` column name exists, but no hashing is applied).
- Admin route validation is weak in backend (`adminUserId` presence check, no strict role verification in API layer).
- Frontend includes Monaco dependencies, but current problem editor is a plain `<textarea>`.
- Index HTML loads Tailwind CDN while project also includes Tailwind config/build dependencies.

These are functional but production-risk areas.

## 10) Feature completeness snapshot

Implemented now:
- Curriculum roadmap with solved/new markers
- Problem execution and result panel
- Progress persistence for logged-in users
- Community solution sharing and upvotes
- Mock exam with timed question workflow
- Mock attempt history pages
- Admin problem creation and mock config
- Basic profile modal with password update + streak display

Not implemented as hardened production system:
- Secure auth/session model
- Role-based API protection middleware
- Password hashing and security controls
- Fully sandbox-hardened execution isolation

## 11) Quick mental model

Think of this repo as:
- A learning product prototype with strong feature breadth
- A curriculum + code-runner + social-solution workflow
- Already migrated to MySQL core persistence
- Still carrying some legacy JSON-storage files and security shortcuts

If you want, I can next generate a second document with:
- exact endpoint request/response examples,
- DB table column reference,
- and a hardening checklist to move this toward production safely.
