import { pool, initializeDatabase } from '../config/db';
import { CURRICULUM_DATA } from '../data/curriculum';

export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  role: 'user' | 'admin';
  avatarUrl: string;
  lastLoginDate?: string;
  loginStreak: number;
  createdAt?: string;
}

export interface Problem {
  id: string;
  dayNumber: number;
  weekNumber: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  patternTag: string;
  description: string;
  starterCode: string;
  testCases: any[];
  solutionHint?: string;
  createdAt?: string;
  isNew?: boolean;
  isSolved?: boolean;
  savedCode?: string;
}

export interface CommunitySolution {
  id: string;
  problemId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  code: string;
  runtimeMs: number;
  patternTag: string;
  upvotes: number;
  upvotedBy?: string[];
  createdAt: string;
}

import bcrypt from 'bcryptjs';
import { EmailService } from './email.service';

export class MysqlStorageService {
  public static async initDatabase() {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(64) PRIMARY KEY,
        username VARCHAR(64) NOT NULL UNIQUE,
        name VARCHAR(128) NOT NULL,
        email VARCHAR(128),
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(16) DEFAULT 'user',
        avatar_url TEXT,
        last_login_date DATE,
        login_streak INT DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      await pool.query('ALTER TABLE users ADD COLUMN email VARCHAR(128)');
    } catch {
      // Column already exists
    }


    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_resets (
        email_or_username VARCHAR(128) PRIMARY KEY,
        otp_code VARCHAR(10) NOT NULL,
        expires_at TIMESTAMP NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS problems (
        id VARCHAR(64) PRIMARY KEY,
        day_number INT NOT NULL,
        week_number INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        difficulty VARCHAR(16) DEFAULT 'Easy',
        pattern_tag VARCHAR(64),
        description TEXT,
        starter_code TEXT,
        test_cases JSON,
        solution_hint TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_progress (
        user_id VARCHAR(64) NOT NULL,
        problem_id VARCHAR(64) NOT NULL,
        is_solved BOOLEAN DEFAULT FALSE,
        saved_code TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, problem_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_problem_visits (
        user_id VARCHAR(64) NOT NULL,
        problem_id VARCHAR(64) NOT NULL,
        visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, problem_id)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS mock_test_results (
        id VARCHAR(64) PRIMARY KEY,
        user_id VARCHAR(64) NOT NULL,
        score INT NOT NULL,
        total_questions INT NOT NULL,
        time_spent_seconds INT NOT NULL,
        answers_json JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS mock_test_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        problem_ids JSON NOT NULL,
        time_limit_minutes INT DEFAULT 95,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_solutions (
        id VARCHAR(64) PRIMARY KEY,
        problem_id VARCHAR(64) NOT NULL,
        user_id VARCHAR(64) NOT NULL,
        username VARCHAR(64) NOT NULL,
        avatar_url TEXT,
        code TEXT NOT NULL,
        runtime_ms INT DEFAULT 0,
        pattern_tag VARCHAR(64) DEFAULT 'JavaScript Solution',
        upvotes INT DEFAULT 0,
        upvoted_by JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await this.seedDefaultData();
  }

  private static async seedDefaultData() {
    const [users]: any = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
    if (users.length === 0) {
      const hashedAdminPass = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (id, username, name, password_hash, role, avatar_url, login_streak) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['user_admin', 'admin', 'Admin Manager', hashedAdminPass, 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', 1]
      );
      console.log('✅ Default Admin user created (username: admin / password: admin123)');
    }

    const [probs]: any = await pool.query('SELECT COUNT(*) as count FROM problems');
    if (probs[0].count < 25) {
      await pool.query('TRUNCATE TABLE problems');
      for (const day of CURRICULUM_DATA) {
        for (const p of day.problems) {
          await pool.query(
            `INSERT IGNORE INTO problems (id, day_number, week_number, title, difficulty, pattern_tag, description, starter_code, test_cases, solution_hint, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [
              p.id,
              day.dayNumber,
              day.weekNumber,
              p.title,
              p.difficulty,
              p.patternTag,
              p.description,
              p.starterCode,
              JSON.stringify(p.testCases),
              p.solutionHint || ''
            ]
          );
        }
      }
      console.log('✅ All Phase 1, 2, 3 & 4 curriculum problems seeded into MySQL.');
    }
  }

  // --- AUTH & CALENDAR-BASED STREAK METHODS ---
  public static async upsertGoogleUser(data: { id: string; username: string; name: string; email: string; avatarUrl: string }): Promise<User> {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    // Account Linking: Check if user exists by google_id OR registered email / username
    const [existing]: any = await pool.query(
      `SELECT * FROM users 
       WHERE id = ? 
          OR (email IS NOT NULL AND LOWER(email) = LOWER(?))
          OR LOWER(name) = LOWER(?)
          OR LOWER(username) = LOWER(?)`,
      [data.id, data.email, data.email, data.username]
    );

    if (existing.length > 0) {
      const user = existing[0];
      let newStreak = user.login_streak || 1;

      if (user.last_login_date) {
        const lastLoginObj = new Date(user.last_login_date);
        const lastDateStr = `${lastLoginObj.getFullYear()}-${String(lastLoginObj.getMonth() + 1).padStart(2, '0')}-${String(lastLoginObj.getDate()).padStart(2, '0')}`;
        if (lastDateStr !== todayStr) {
          const dToday = new Date(todayStr).getTime();
          const dLast = new Date(lastDateStr).getTime();
          const diffCalendarDays = Math.round((dToday - dLast) / (1000 * 60 * 60 * 24));
          newStreak = diffCalendarDays === 1 ? (user.login_streak || 1) + 1 : 1;
        }
      }

      const userEmail = data.email || user.email || (user.name && user.name.includes('@') ? user.name : '');

      await pool.query(
        'UPDATE users SET last_login_date = ?, login_streak = ?, avatar_url = ?, email = ? WHERE id = ?',
        [todayStr, newStreak, data.avatarUrl || user.avatar_url, userEmail, user.id]
      );

      return {
        id: user.id,
        username: user.username,
        name: user.name,
        email: userEmail,
        role: user.role || 'user',
        avatarUrl: data.avatarUrl || user.avatar_url,
        lastLoginDate: todayStr,
        loginStreak: newStreak
      };
    } else {
      // New Google User
      const dummyPasswordHash = await bcrypt.hash(`google_${Date.now()}_${Math.random()}`, 10);
      await pool.query(
        `INSERT INTO users (id, username, name, email, password_hash, role, avatar_url, last_login_date, login_streak)
         VALUES (?, ?, ?, ?, ?, 'user', ?, ?, 1)`,
        [data.id, data.username, data.name || data.email, data.email, dummyPasswordHash, data.avatarUrl, todayStr]
      );

      if (data.email && data.email.includes('@')) {
        await EmailService.sendWelcomeEmail(data.email, data.username);
      }

      return {
        id: data.id,
        username: data.username,
        name: data.name || data.email,
        email: data.email,
        role: 'user',
        avatarUrl: data.avatarUrl,
        lastLoginDate: todayStr,
        loginStreak: 1
      };
    }
  }


  public static async registerUser(username: string, email: string, password: string): Promise<User> {
    const [existing]: any = await pool.query(
      'SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?) OR (email IS NOT NULL AND LOWER(email) = LOWER(?))',
      [username, email, email]
    );
    if (existing.length > 0) {
      throw new Error('Username or email address is already registered');
    }

    const id = `user_${Date.now()}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
    const today = new Date().toISOString().split('T')[0];

    // Bcrypt Password Encryption
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users (id, username, name, email, password_hash, role, avatar_url, last_login_date, login_streak)
       VALUES (?, ?, ?, ?, ?, 'user', ?, ?, 1)`,
      [id, username, email, email, passwordHash, avatarUrl, today]
    );

    // Send Welcome Email directly to user's registered email
    await EmailService.sendWelcomeEmail(email, username);

    return { id, username, name: email, email, role: 'user', avatarUrl, lastLoginDate: today, loginStreak: 1 };
  }

  public static async loginUser(usernameOrEmail: string, password: string): Promise<User> {
    const [rows]: any = await pool.query(
      'SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?) OR (email IS NOT NULL AND LOWER(email) = LOWER(?))',
      [usernameOrEmail, usernameOrEmail, usernameOrEmail]
    );
    if (rows.length === 0) {
      throw new Error('Invalid username/email or password');
    }


    const user = rows[0];

    // Bcrypt Password Verification & Legacy Auto-migration
    let passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches && user.password_hash === password) {
      // Legacy plaintext password matches! Auto-upgrade to bcrypt hash
      passwordMatches = true;
      const newHash = await bcrypt.hash(password, 10);
      await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
    }

    if (!passwordMatches) {
      throw new Error('Invalid username or password');
    }

    // --- CALENDAR-BASED STREAK LOGIC ---
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    let newStreak = user.login_streak || 1;

    if (!user.last_login_date) {
      // Rule 1: No previous streak data -> start at 1
      newStreak = 1;
    } else {
      // Format last_login_date to YYYY-MM-DD
      const lastLoginObj = new Date(user.last_login_date);
      const lastDateStr = `${lastLoginObj.getFullYear()}-${String(lastLoginObj.getMonth() + 1).padStart(2, '0')}-${String(lastLoginObj.getDate()).padStart(2, '0')}`;

      if (lastDateStr === todayStr) {
        // Rule 2: Same calendar day -> streak count remains unchanged (do NOT increment)
        newStreak = user.login_streak || 1;
      } else {
        // Calculate calendar day difference
        const dToday = new Date(todayStr).getTime();
        const dLast = new Date(lastDateStr).getTime();
        const diffCalendarDays = Math.round((dToday - dLast) / (1000 * 60 * 60 * 24));

        if (diffCalendarDays === 1) {
          // Rule 3: Exact previous day -> increment count by +1
          newStreak = (user.login_streak || 1) + 1;
        } else {
          // Rule 4: Older than yesterday -> reset streak to 1
          newStreak = 1;
        }
      }
    }

    await pool.query(
      'UPDATE users SET last_login_date = ?, login_streak = ? WHERE id = ?',
      [todayStr, newStreak, user.id]
    );

    return {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatar_url,
      lastLoginDate: todayStr,
      loginStreak: newStreak
    };
  }

  public static async updatePassword(userId: string, oldPass: string, newPass: string): Promise<void> {
    const [rows]: any = await pool.query('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (rows.length === 0) {
      throw new Error('User not found');
    }

    const currentHash = rows[0].password_hash;
    let oldMatches = await bcrypt.compare(oldPass, currentHash);
    if (!oldMatches && currentHash === oldPass) oldMatches = true;

    if (!oldMatches) {
      throw new Error('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(newPass, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);
  }

  // --- FORGOT PASSWORD OTP METHODS ---
  public static async createPasswordResetOTP(emailOrUsername: string): Promise<void> {
    const [rows]: any = await pool.query(
      'SELECT username, name, email FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?) OR (email IS NOT NULL AND LOWER(email) = LOWER(?))',
      [emailOrUsername, emailOrUsername, emailOrUsername]
    );
    if (rows.length === 0) {
      throw new Error('No account registered with that username or email address');
    }

    const user = rows[0];
    const targetEmail = (user.email && user.email.includes('@')) ? user.email : (user.name && user.name.includes('@') ? user.name : `${user.username}@user.jsdsamastery.dev`);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await pool.query(
      `INSERT INTO password_resets (email_or_username, otp_code, expires_at)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE otp_code = VALUES(otp_code), expires_at = VALUES(expires_at)`,
      [emailOrUsername.toLowerCase(), otpCode, expiresAt]
    );

    await EmailService.sendPasswordResetOTP(
      targetEmail,
      user.username,
      otpCode
    );
  }


  public static async resetPasswordWithOTP(emailOrUsername: string, otpCode: string, newPass: string): Promise<void> {
    const [rows]: any = await pool.query(
      'SELECT * FROM password_resets WHERE LOWER(email_or_username) = LOWER(?) AND otp_code = ?',
      [emailOrUsername, otpCode]
    );

    if (rows.length === 0) {
      throw new Error('Invalid OTP code or username/email');
    }

    const resetReq = rows[0];
    if (new Date() > new Date(resetReq.expires_at)) {
      throw new Error('OTP code has expired. Please request a new one.');
    }

    const [userRows]: any = await pool.query(
      'SELECT id, username, name as email FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?)',
      [emailOrUsername, emailOrUsername]
    );
    if (userRows.length === 0) {
      throw new Error('User not found');
    }

    const user = userRows[0];
    const targetEmail = user.email && user.email.includes('@') ? user.email : `${user.username}@user.jsdsamastery.dev`;

    const newHash = await bcrypt.hash(newPass, 10);
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, user.id]);
    await pool.query('DELETE FROM password_resets WHERE LOWER(email_or_username) = LOWER(?)', [emailOrUsername]);

    // Send confirmation email to user's registered email
    await EmailService.sendPasswordResetConfirmation(targetEmail, user.username);
  }

  // --- CURRICULUM & PROBLEM METHODS ---
  public static async getCurriculum(userId?: string): Promise<any> {
    const [problems]: any = await pool.query('SELECT * FROM problems ORDER BY week_number, day_number, created_at');
    
    let userProgressMap: { [probId: string]: { isSolved: boolean; savedCode: string } } = {};
    let visitedSet = new Set<string>();

    if (userId && userId !== 'user_guest' && userId !== 'null') {
      const [progRows]: any = await pool.query('SELECT problem_id, is_solved, saved_code FROM user_progress WHERE user_id = ?', [userId]);
      for (const row of progRows) {
        userProgressMap[row.problem_id] = { isSolved: !!row.is_solved, savedCode: row.saved_code };
      }

      const [visitRows]: any = await pool.query('SELECT problem_id FROM user_problem_visits WHERE user_id = ?', [userId]);
      for (const v of visitRows) {
        visitedSet.add(v.problem_id);
      }
    }

    // Group problems by day
    const dayMap = new Map<number, any>();
    const now = new Date().getTime();

    for (const p of problems) {
      const dayNum = p.day_number;
      if (!dayMap.has(dayNum)) {
        const templateDay = CURRICULUM_DATA.find(d => d.dayNumber === dayNum) || {
          dayNumber: dayNum,
          weekNumber: p.week_number,
          title: `Day ${dayNum} Practice`,
          learnTopics: ['Core JavaScript Problem Solving']
        };

        dayMap.set(dayNum, {
          ...templateDay,
          problems: []
        });
      }

      const createdTime = new Date(p.created_at).getTime();
      const isLessThanSevenDaysOld = (now - createdTime) <= (7 * 24 * 60 * 60 * 1000);
      const isVisitedOrSolved = visitedSet.has(p.id) || (userProgressMap[p.id] && userProgressMap[p.id].isSolved);
      
      const isNew = isLessThanSevenDaysOld && !isVisitedOrSolved;

      dayMap.get(dayNum).problems.push({
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        patternTag: p.pattern_tag,
        description: p.description,
        starterCode: p.starter_code,
        testCases: typeof p.test_cases === 'string' ? JSON.parse(p.test_cases) : p.test_cases,
        solutionHint: p.solution_hint,
        createdAt: p.created_at,
        isNew,
        isSolved: userProgressMap[p.id]?.isSolved || false,
        savedCode: userProgressMap[p.id]?.savedCode || p.starter_code
      });
    }

    const curriculum = Array.from(dayMap.values()).sort((a, b) => a.dayNumber - b.dayNumber);
    const solvedCount = Object.values(userProgressMap).filter(p => p.isSolved).length;

    return {
      curriculum,
      solvedCount,
      totalProblems: problems.length
    };
  }

  public static async getProblem(problemId: string, userId?: string): Promise<any> {
    const [rows]: any = await pool.query('SELECT * FROM problems WHERE id = ?', [problemId]);
    if (rows.length === 0) throw new Error('Problem not found');

    const p = rows[0];
    let isSolved = false;
    let savedCode = p.starter_code;

    if (userId && userId !== 'user_guest' && userId !== 'null') {
      await pool.query('INSERT IGNORE INTO user_problem_visits (user_id, problem_id) VALUES (?, ?)', [userId, problemId]);

      const [prog]: any = await pool.query('SELECT is_solved, saved_code FROM user_progress WHERE user_id = ? AND problem_id = ?', [userId, problemId]);
      if (prog.length > 0) {
        isSolved = !!prog[0].is_solved;
        savedCode = prog[0].saved_code;
      }
    }

    return {
      dayNumber: p.day_number,
      problem: {
        id: p.id,
        title: p.title,
        difficulty: p.difficulty,
        patternTag: p.pattern_tag,
        description: p.description,
        starterCode: p.starter_code,
        testCases: typeof p.test_cases === 'string' ? JSON.parse(p.test_cases) : p.test_cases,
        solutionHint: p.solution_hint,
        isSolved,
        userCode: savedCode
      }
    };
  }

  // --- UPSERT SAVED CODE & PROGRESS ---
  public static async upsertProgress(userId: string, problemId: string, isSolved: boolean, code: string): Promise<void> {
    if (!userId || userId === 'user_guest' || userId === 'null') return;

    await pool.query(
      `INSERT INTO user_progress (user_id, problem_id, is_solved, saved_code)
       VALUES (?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         is_solved = IF(VALUES(is_solved), TRUE, is_solved),
         saved_code = VALUES(saved_code),
         updated_at = CURRENT_TIMESTAMP`,
      [userId, problemId, isSolved, code]
    );
  }

  // --- MOCK TEST EXAM HISTORY METHODS ---
  public static async saveMockTestResult(data: {
    userId: string;
    score: number;
    totalQuestions: number;
    timeSpentSeconds: number;
    answersJson: any;
  }): Promise<any> {
    const id = `mock_${Date.now()}`;
    await pool.query(
      `INSERT INTO mock_test_results (id, user_id, score, total_questions, time_spent_seconds, answers_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [id, data.userId, data.score, data.totalQuestions, data.timeSpentSeconds, JSON.stringify(data.answersJson)]
    );
    return { ...data, id, createdAt: new Date().toISOString() };
  }

  public static async getMockTestHistory(userId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM mock_test_results WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );

    return rows.map((r: any) => ({
      id: r.id,
      score: r.score,
      totalQuestions: r.total_questions,
      timeSpentSeconds: r.time_spent_seconds,
      answersJson: typeof r.answers_json === 'string' ? JSON.parse(r.answers_json) : r.answers_json,
      createdAt: r.created_at
    }));
  }

  // --- COMMUNITY SOLUTIONS & UPVOTES ---
  public static async getCommunitySolutions(problemId: string): Promise<CommunitySolution[]> {
    const [rows]: any = await pool.query(
      'SELECT * FROM community_solutions WHERE problem_id = ? ORDER BY upvotes DESC, created_at DESC',
      [problemId]
    );

    const result: CommunitySolution[] = [];
    for (const row of rows) {
      const [upvotesRows]: any = await pool.query('SELECT user_id FROM solution_upvotes WHERE solution_id = ?', [row.id]);
      const upvotedBy = upvotesRows.map((u: any) => u.user_id);

      result.push({
        id: row.id,
        problemId: row.problem_id,
        userId: row.user_id,
        username: row.username,
        avatarUrl: row.avatar_url,
        code: row.code,
        runtimeMs: row.runtime_ms,
        patternTag: row.pattern_tag,
        upvotes: row.upvotes,
        upvotedBy,
        createdAt: row.created_at
      });
    }

    return result;
  }

  public static async addCommunitySolution(data: {
    problemId: string;
    userId: string;
    username: string;
    avatarUrl: string;
    code: string;
    runtimeMs: number;
    patternTag: string;
  }): Promise<CommunitySolution> {
    const id = `sol_${Date.now()}`;
    await pool.query(
      `INSERT INTO community_solutions (id, problem_id, user_id, username, avatar_url, code, runtime_ms, pattern_tag, upvotes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [id, data.problemId, data.userId, data.username, data.avatarUrl, data.code, data.runtimeMs, data.patternTag]
    );

    return { ...data, id, upvotes: 0, upvotedBy: [], createdAt: new Date().toISOString() };
  }

  public static async upvoteSolution(solutionId: string, userId: string): Promise<CommunitySolution> {
    const [rows]: any = await pool.query('SELECT * FROM community_solutions WHERE id = ?', [solutionId]);
    if (rows.length === 0) throw new Error('Solution not found');
    const sol = rows[0];

    if (sol.user_id === userId) {
      throw new Error('You cannot upvote your own solution');
    }

    const [upvoteCheck]: any = await pool.query(
      'SELECT * FROM solution_upvotes WHERE solution_id = ? AND user_id = ?',
      [solutionId, userId]
    );

    if (upvoteCheck.length > 0) {
      throw new Error('You have already upvoted this solution');
    }

    await pool.query('INSERT INTO solution_upvotes (solution_id, user_id) VALUES (?, ?)', [solutionId, userId]);
    await pool.query('UPDATE community_solutions SET upvotes = upvotes + 1 WHERE id = ?', [solutionId]);

    const [updatedRows]: any = await pool.query('SELECT * FROM community_solutions WHERE id = ?', [solutionId]);
    const updatedSol = updatedRows[0];

    const [upvotesRows]: any = await pool.query('SELECT user_id FROM solution_upvotes WHERE solution_id = ?', [solutionId]);
    const upvotedBy = upvotesRows.map((u: any) => u.user_id);

    return {
      id: updatedSol.id,
      problemId: updatedSol.problem_id,
      userId: updatedSol.user_id,
      username: updatedSol.username,
      avatarUrl: updatedSol.avatar_url,
      code: updatedSol.code,
      runtimeMs: updatedSol.runtime_ms,
      patternTag: updatedSol.pattern_tag,
      upvotes: updatedSol.upvotes,
      upvotedBy,
      createdAt: updatedSol.created_at
    };
  }

  // --- ADMIN PANEL METHODS ---
  public static async addProblemByAdmin(problem: {
    title: string;
    dayNumber: number;
    weekNumber: number;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    patternTag: string;
    description: string;
    starterCode: string;
    testCases: any[];
    solutionHint?: string;
  }): Promise<Problem> {
    const id = `prob_${Date.now()}`;
    await pool.query(
      `INSERT INTO problems (id, day_number, week_number, title, difficulty, pattern_tag, description, starter_code, test_cases, solution_hint, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        problem.dayNumber,
        problem.weekNumber,
        problem.title,
        problem.difficulty,
        problem.patternTag,
        problem.description,
        problem.starterCode,
        JSON.stringify(problem.testCases),
        problem.solutionHint || ''
      ]
    );

    return { ...problem, id, isNew: true };
  }

  public static async getAllUsersActivity(): Promise<any[]> {
    const [users]: any = await pool.query(
      `SELECT u.id, u.username, u.name, u.role, u.avatar_url, u.last_login_date, u.login_streak, u.created_at,
              COUNT(p.problem_id) as solved_count
       FROM users u
       LEFT JOIN user_progress p ON u.id = p.user_id AND p.is_solved = 1
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    );

    return users.map((u: any) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      avatarUrl: u.avatar_url,
      lastLoginDate: u.last_login_date,
      loginStreak: u.login_streak,
      solvedCount: u.solved_count,
      createdAt: u.created_at
    }));
  }

  public static async getMockTestConfig(): Promise<any> {
    const [rows]: any = await pool.query('SELECT * FROM mock_test_config ORDER BY id DESC LIMIT 1');
    if (rows.length > 0) {
      const rawIds = typeof rows[0].problem_ids === 'string' ? JSON.parse(rows[0].problem_ids) : rows[0].problem_ids;
      // Support legacy format (array of strings) and new format (array of {id, minutes})
      const questions: { id: string; minutes: number }[] = Array.isArray(rawIds)
        ? rawIds.map((item: any) =>
            typeof item === 'string'
              ? { id: item, minutes: Math.round((rows[0].time_limit_minutes || 120) / rawIds.length) }
              : { id: item.id, minutes: item.minutes || 20 }
          )
        : [];
      return { questions, totalMinutes: questions.reduce((s: number, q: any) => s + q.minutes, 0) };
    }
    // Default config
    return {
      questions: [
        { id: 'two-sum', minutes: 20 },
        { id: 'longest-substring-without-repeating-characters', minutes: 20 },
        { id: 'binary-search', minutes: 15 },
        { id: 'valid-parentheses', minutes: 15 },
        { id: '3sum', minutes: 25 }
      ],
      totalMinutes: 95
    };
  }

  public static async updateMockTestConfig(questions: { id: string; minutes: number }[]): Promise<any> {
    const totalMinutes = questions.reduce((s, q) => s + (q.minutes || 20), 0);
    await pool.query(
      'INSERT INTO mock_test_config (problem_ids, time_limit_minutes) VALUES (?, ?)',
      [JSON.stringify(questions), totalMinutes]
    );
    return { questions, totalMinutes };
  }

  // --- UPDATE PROBLEM (Admin Edit) ---
  public static async updateProblem(id: string, data: {
    title?: string; description?: string; difficulty?: string;
    patternTag?: string; solutionHint?: string; testCases?: any[];
  }): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined)       { fields.push('title = ?');        values.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?');  values.push(data.description); }
    if (data.difficulty !== undefined)  { fields.push('difficulty = ?');   values.push(data.difficulty); }
    if (data.patternTag !== undefined)  { fields.push('pattern_tag = ?');  values.push(data.patternTag); }
    if (data.solutionHint !== undefined){ fields.push('solution_hint = ?');values.push(data.solutionHint); }
    if (data.testCases !== undefined)   { fields.push('test_cases = ?');   values.push(JSON.stringify(data.testCases)); }

    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE problems SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  // --- DELETE PROBLEM (Admin) ---
  public static async deleteProblem(id: string): Promise<void> {
    await pool.query('DELETE FROM problems WHERE id = ?', [id]);
    await pool.query('DELETE FROM user_progress WHERE problem_id = ?', [id]);
  }

  // --- LEADERBOARD ---
  public static async getLeaderboard(): Promise<any[]> {
    const [rows]: any = await pool.query(`
      SELECT u.id, u.username, u.name, u.avatar_url,
             u.login_streak,
             COUNT(DISTINCT p.problem_id) AS solved_count
      FROM users u
      LEFT JOIN user_progress p ON p.user_id = u.id AND p.is_solved = 1
      WHERE u.role != 'admin'
      GROUP BY u.id
      ORDER BY solved_count DESC, u.login_streak DESC
      LIMIT 50
    `);
    return rows.map((r: any, idx: number) => ({
      rank: idx + 1,
      id: r.id,
      username: r.username,
      name: r.name,
      avatarUrl: r.avatar_url,
      loginStreak: r.login_streak || 0,
      solvedCount: Number(r.solved_count) || 0
    }));
  }

  // --- NOTES ---
  public static async ensureNotesTable(): Promise<void> {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS problem_notes (
        user_id VARCHAR(64) NOT NULL,
        problem_id VARCHAR(64) NOT NULL,
        note_text TEXT DEFAULT '',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, problem_id)
      )
    `);
  }

  public static async getNote(userId: string, problemId: string): Promise<string> {
    await this.ensureNotesTable();
    const [rows]: any = await pool.query(
      'SELECT note_text FROM problem_notes WHERE user_id = ? AND problem_id = ?',
      [userId, problemId]
    );
    return rows.length > 0 ? rows[0].note_text : '';
  }

  public static async saveNote(userId: string, problemId: string, noteText: string): Promise<void> {
    await this.ensureNotesTable();
    await pool.query(
      `INSERT INTO problem_notes (user_id, problem_id, note_text)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE note_text = VALUES(note_text), updated_at = CURRENT_TIMESTAMP`,
      [userId, problemId, noteText]
    );
  }
}

