# Implementation Plan - Phase Three: Category-Split Mock Tests & Leaderboard

This plan details the technical steps to split the platform's Mock Test system and Leaderboard into separate tracks for **DSA** and **JavaScript (JS)**.

---

## User Review Required

> [!IMPORTANT]
> **Database Schema Changes:** 
> - We will run automatic schema migrations in the backend `initDatabase()` to add `category` column to the `mock_test_config` table (defaulting to `'DSA'`).
> - We will filter the `mock_test_results` by category. To support this cleanly, we will add a `category` column (e.g. `'DSA' | 'JS'`) to `mock_test_results`.

---

## Proposed Changes

### Database & Backend

#### [MODIFY] [mysql-storage.service.ts](file:///c:/Project/Learn/DSA/backend/src/services/mysql-storage.service.ts)
- Add schema migration checks to:
  - Add `category` column (VARCHAR(16) DEFAULT 'DSA') to `mock_test_config`.
  - Add `category` column (VARCHAR(16) DEFAULT 'DSA') to `mock_test_results`.
- Modify `getMockTestConfig(category: string)`:
  - Fetch the config matching the specific category (DSA or JS). If none exists, return a category-specific fallback default list.
- Modify `updateMockTestConfig(category: string, questions: any[])`:
  - Store configuration with the specified category.
- Modify `saveMockTestResult(data)`:
  - Save the category along with the test score.
- Modify `getLeaderboard(category: string)`:
  - Modify the SQL query to calculate `solved_count` filtering the user's solved problems matching `category` (DSA or JS).

#### [MODIFY] [api.routes.ts](file:///c:/Project/Learn/DSA/backend/src/routes/api.routes.ts)
- Update `GET /admin/mock-test`: Accept optional query param `category` (defaulting to `'DSA'`).
- Update `POST /admin/mock-test`: Accept `category` and `questions` in request body.
- Update `GET /leaderboard`: Accept optional query param `category` (defaulting to `'DSA'`).
- Update `POST /mock-test/submit`: Accept `category` in body to save correct category scope.

---

### Frontend Services & Components

#### [MODIFY] [dsa.service.ts](file:///c:/Project/Learn/DSA/frontend-app/src/app/core/services/dsa.service.ts)
- Update `getMockTestConfig(category: string)` to send the category parameter.
- Update `updateMockTestConfig(category: string, questions: any[])` to send both category and questions.
- Update `submitMockTest(...)` to include `category`.
- Update `getLeaderboard(category: string)` to request category-filtered rankings.

#### [MODIFY] [admin.component.ts](file:///c:/Project/Learn/DSA/frontend-app/src/app/pages/admin/admin.component.ts)
- Add a dropdown/tab in the Mock Test config tab to let the Admin switch between configuring the **DSA Mock Test** and the **JS Mock Test**.
- Fetch and save configuration independently based on the selected category.

#### [MODIFY] [interview-test.component.ts](file:///c:/Project/Learn/DSA/frontend-app/src/app/pages/interview-test/interview-test.component.ts)
- Create a selection screen/state (`'category-select'`) in the Launcher Phase.
- Prompt the user to select either **"DSA Mock Exam"** or **"JS Mock Exam"**.
- Fetch the appropriate exam questions and configuration based on their selection.
- Render category-specific badge and warnings.

#### [MODIFY] [leaderboard.component.ts](file:///c:/Project/Learn/DSA/frontend-app/src/app/pages/leaderboard/leaderboard.component.ts)
- Add Tabs/Toggles in the UI to switch between **DSA Leaderboard** and **JS Leaderboard**.
- Reload leaderboard data from backend with the corresponding category parameter on tab change.

---

## Verification Plan

### Automated Tests
- Build and run code check scripts to verify TS compiling:
  `npm run build`

### Manual Verification
- **Admin Panel Mock Test Management**: Verify that configuring a DSA mock test does not overwrite the JS mock test configuration, and vice versa.
- **Mock Test Page**: Verify selecting JS only launches the JS test, and selecting DSA only launches the DSA test.
- **Leaderboard**: Verify that the DSA leaderboard ranks users based on DSA solved problems, and the JS leaderboard ranks them based on JS solved problems.
