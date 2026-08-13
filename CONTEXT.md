# JS DSA Mastery Platform — AI Agent Context

Quick orientation for any AI agent working on this codebase. Read this before scanning files.

---

## Stack

| Layer      | Tech                                                                                                |
| ---------- | --------------------------------------------------------------------------------------------------- |
| Frontend   | Angular 17 (standalone components, signals), Tailwind CSS, Monaco Editor                            |
| Backend    | Express + TypeScript (`ts-node` dev, compiled to `dist/` for prod)                              |
| Database   | MySQL via`mysql2` — local: `js_dsa_db` (root/root/3306), prod: TiDB Cloud via `DATABASE_URL` |
| Cache      | Redis (falls back to in-memory TTL map if Redis offline)                                            |
| Deployment | Vercel — frontend SPA + serverless API via`api/index.ts` → `backend/src/server.ts`            |

---

## Repo Layout

```
/
├── api/index.ts              ← Vercel serverless entry (imports backend/src/server)
├── vercel.json               ← routes /api/* → api/index.ts, /* → index.html
├── package.json              ← root build: build:backend (tsc) + build:frontend (ng build)
│
├── backend/
│   ├── src/
│   │   ├── server.ts         ← Express app, lazy DB init middleware (ensureDbInit)
│   │   ├── config/db.ts      ← mysql2 pool, env-driven (DATABASE_URL overrides DB_HOST etc.)
│   │   ├── routes/api.routes.ts   ← ALL API routes (see route map below)
│   │   ├── services/
│   │   │   ├── mysql-storage.service.ts  ← ALL DB logic (queries, seeding, migrations)
│   │   │   ├── cache.service.ts          ← Redis/in-memory TTL cache
│   │   │   ├── execution.service.ts      ← JS code sandbox runner (vm module)
│   │   │   ├── email.service.ts          ← Nodemailer (SMTP config in .env)
│   │   │   └── logger.service.ts
│   │   └── data/
│   │       ├── curriculum.ts     ← DSA 30-day problem definitions (source of truth)
│   │       └── js-curriculum.ts  ← JS Mastery 30-day problem definitions
│   ├── .env                  ← LOCAL only (gitignored). DATABASE_URL commented = use local MySQL
│   └── .env.example
│
└── frontend-app/
    └── src/app/
        ├── app.routes.ts     ← Angular routes (see route map below)
        ├── core/services/
        │   ├── dsa.service.ts    ← ALL HTTP calls to backend + Angular signals (curriculum, guidebook, etc.)
        │   ├── auth.service.ts   ← currentUserSignal(), login/register/google OAuth
        │   ├── theme.service.ts  ← dark/light mode
        │   └── toast.service.ts  ← toast notifications
        └── pages/
            ├── roadmap/          ← Main DSA/JS roadmap (curriculum grid)
            ├── problem-view/     ← Monaco editor + code execution + community solutions
            ├── guidebook/        ← Blog-style concept guide reader (topics + subtopics)
            ├── admin/            ← Admin CMS (problems, mock test, guidebook CMS)
            ├── auth-modal/       ← Login/Register/Google modal overlay
            ├── profile-modal/    ← User profile editor
            ├── leaderboard/      ← Top users by solved count
            ├── mock-history/     ← Past mock exam results
            ├── interview-test/   ← Timed mock exam
            ├── playground/       ← Free JS sandbox
            └── cheat-sheet/      ← Quick reference sheet
```

---

## Database Schema (`js_dsa_db`)

| Table                       | Key columns                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| `users`                   | id, username, name, email, password_hash, role(user/admin), avatar_url, login_streak                                                             |
| `problems`                | id, category(DSA/JS), day_number, week_number, title, difficulty, pattern_tag, description, starter_code, test_cases(JSON), solution_hint        |
| `user_progress`           | user_id, problem_id, is_solved, saved_code                                                                                                       |
| `user_problem_visits`     | user_id, problem_id, visited_at                                                                                                                  |
| `community_solutions`     | id, problem_id, user_id, username, code, runtime_ms, pattern_tag, upvotes, upvoted_by(JSON)                                                      |
| `solution_upvotes`        | solution_id, user_id                                                                                                                             |
| `mock_test_config`        | id, problem_ids(JSON), time_limit_minutes                                                                                                        |
| `mock_test_results`       | id, user_id, score, total_questions, time_spent_seconds, answers_json                                                                            |
| `password_resets`         | email_or_username, otp_code, expires_at                                                                                                          |
| `guidebook_topics`        | id, category(DSA/JS), title, description, icon, order_index                                                                                      |
| `guidebook_subtopics`     | id, topic_id, title, description, content_markdown(LONGTEXT), cover_image_url, code_example, is_published, linked_problem_ids(JSON), order_index |
| `user_guidebook_progress` | user_id, subtopic_id, is_read                                                                                                                    |
| `problem_notes`           | user_id, problem_id, note_text, updated_at                                                                                                       |

**Schema migrations** run on first request via `MysqlStorageService.initDatabase()` called from `ensureDbInit()` middleware. Uses `CREATE TABLE IF NOT EXISTS` + `ALTER TABLE` guards. All in try/catch so they're non-fatal.

---

## DB Initialization & Seeding

`server.ts` has lazy init middleware:

```
every request → ensureDbInit() → MysqlStorageService.initDatabase()
  └─ creates all tables (IF NOT EXISTS)
  └─ seedDefaultData()       → seeds admin user + DSA problems (if <30 DSA) + JS problems (if <30 JS)
  └─ seedDefaultGuidebookData() → seeds 3 default topics/subtopics (if table empty)
```

Default admin: `username: admin / password: admin123`

---

## API Route Map (`/api/*`)

### Auth

| Method | Route                     | Description                      |
| ------ | ------------------------- | -------------------------------- |
| POST   | `/auth/login`           | Username+password login          |
| POST   | `/auth/register`        | New user registration            |
| POST   | `/auth/google`          | Google OAuth (verifies ID token) |
| POST   | `/auth/update-password` | Change password                  |
| POST   | `/auth/forgot-password` | Send OTP email                   |
| POST   | `/auth/reset-password`  | Reset with OTP                   |

### Curriculum / Problems

| Method | Route                             | Description                                   |
| ------ | --------------------------------- | --------------------------------------------- |
| GET    | `/curriculum?userId=&category=` | All days+problems; category filters DSA or JS |
| GET    | `/problem/:id?userId=`          | Single problem with user progress             |
| POST   | `/execute`                      | Run JS code against test cases (vm sandbox)   |
| POST   | `/save-code`                    | Save draft code without submitting            |

### Guidebook

| Method | Route                                   | Description                      |
| ------ | --------------------------------------- | -------------------------------- |
| GET    | `/guidebook/topics?category=&userId=` | All topics with nested subtopics |
| GET    | `/guidebook/subtopic/:id?userId=`     | Single subtopic with read status |
| POST   | `/guidebook/progress/toggle`          | Mark subtopic read/unread        |

### Admin (require `adminUserId` in body)

| Method   | Route                             | Description                        |
| -------- | --------------------------------- | ---------------------------------- |
| POST     | `/admin/problems`               | Create new problem                 |
| PUT      | `/admin/problems/:id`           | Edit problem                       |
| DELETE   | `/admin/problems/:id`           | Delete problem                     |
| GET      | `/admin/users-activity`         | All users with streak/solved stats |
| GET/POST | `/admin/mock-test`              | Get/set mock exam config           |
| POST     | `/admin/guidebook/topic`        | Create guidebook topic             |
| PUT      | `/admin/guidebook/topic/:id`    | Edit topic                         |
| DELETE   | `/admin/guidebook/topic/:id`    | Delete topic + all its subtopics   |
| POST     | `/admin/guidebook/subtopic`     | Create subtopic article            |
| PUT      | `/admin/guidebook/subtopic/:id` | Edit subtopic                      |
| DELETE   | `/admin/guidebook/subtopic/:id` | Delete subtopic                    |

### Other

| Method | Route                          | Description                       |
| ------ | ------------------------------ | --------------------------------- |
| GET    | `/leaderboard`               | Top 20 users by solved count      |
| GET    | `/solutions/:problemId`      | Community solutions for a problem |
| POST   | `/solutions`                 | Share a solution                  |
| POST   | `/solutions/:id/upvote`      | Upvote a solution                 |
| GET    | `/notes/:problemId?userId=`  | Get user's note for a problem     |
| POST   | `/notes/:problemId`          | Save/update user's note           |
| GET    | `/mock-test/history/:userId` | User's past mock exam history     |
| GET    | `/mock-history/:userId`      | Alias for mock history            |
| GET    | `/health`                    | Health check                      |

---

## Angular Frontend Routes

| Path                | Component              | Description                           |
| ------------------- | ---------------------- | ------------------------------------- |
| `/`               | RoadmapComponent       | DSA/JS 30-day curriculum grid         |
| `/problem/:id`    | ProblemViewComponent   | Monaco editor + execution + solutions |
| `/guidebook`      | GuidebookComponent     | Blog-style concept guide reader       |
| `/playground`     | PlaygroundComponent    | Free JS sandbox                       |
| `/cheat-sheet`    | CheatSheetComponent    | Quick reference                       |
| `/interview-test` | InterviewTestComponent | Timed mock exam                       |
| `/mock-history`   | MockHistoryComponent   | Past exam results                     |
| `/leaderboard`    | LeaderboardComponent   | Top users                             |
| `/admin`          | AdminComponent         | Admin CMS (role-gated)                |

---

## Key Service: `dsa.service.ts`

Holds all HTTP calls + Angular signals:

- `curriculumSignal()` — cached curriculum days array
- `fetchCurriculum(userId, category?)` — loads curriculum into signal
- `currentProblemSignal()` — active problem in problem-view
- All guidebook, admin, auth-related API calls

---

## Key Service: `MysqlStorageService` (backend)

Single static class with all DB logic. Important methods:

- `initDatabase()` — creates tables + seeds data
- `getCurriculum(userId?)` — groups problems by `category:dayNumber` key (avoids DSA/JS day collision)
- `getGuidebookTopics(category?, userId?)` — returns topics + nested subtopics + read status
- `seedDefaultData()` — separately checks DSA count (<30) and JS count (<30) before seeding

---

## Environment Variables (`.env` in `backend/`)

```
DATABASE_URL=mysql://...  # TiDB Cloud for prod. Comment out to use local MySQL.
DB_HOST=localhost
DB_USER=root
DB_PASS=root
DB_NAME=js_dsa_db
DB_PORT=3306
REDIS_HOST=127.0.0.1
SMTP_HOST / SMTP_USER / SMTP_PASS   # Gmail SMTP for OTP emails
GOOGLE_CLIENT_ID                    # Google OAuth
```

**Local dev**: comment out `DATABASE_URL` → uses localhost MySQL.
**Vercel prod**: `DATABASE_URL` set in Vercel dashboard env vars (not in `.env`).

---

## Dev Commands

```bash
# Backend (port 3000)
cd backend && npm run dev        # ts-node src/server.ts

# Frontend (port 4202)
cd frontend-app && ng serve --port 4202

# Build all (for Vercel)
npm run build                    # build:backend (tsc) + build:frontend (ng build)
```

---

## Known Patterns / Gotchas

- **Lazy DB init**: Tables are created on the FIRST HTTP request, not at startup.
- **Cache invalidation**: Curriculum cache key is `curriculum:{userId}:{category}`. Invalidated on code submit/save.
- **Category collision bug (fixed)**: Old `getCurriculum` used `day_number` as map key — DSA Day 1 and JS Day 1 conflated. Fixed to use `category:dayNumber` composite key.
- **Seeding guard**: Uses `COUNT(*) WHERE category=X < 30` per-category, not total count.
- **Admin auth**: Routes check `adminUserId` in request body — no JWT middleware, relies on frontend sending the user's id. Role check done by looking up user in DB.
- **Code execution**: Runs in Node.js `vm` module sandbox (synchronous). No Docker/subprocess isolation.
- **Guidebook subtopics**: `content_markdown` is LONGTEXT. `linked_problem_ids` is JSON array of problem IDs.
- **`.env` is gitignored** — Vercel uses its own env vars panel for production secrets.
