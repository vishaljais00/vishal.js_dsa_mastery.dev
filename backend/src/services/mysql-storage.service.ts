import { pool, initializeDatabase } from '../config/db';
import { CURRICULUM_DATA } from '../data/curriculum';
import { JS_CURRICULUM_DATA } from '../data/js-curriculum';

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
  category?: 'DSA' | 'JS';
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

export interface GuidebookTopic {
  id: string;
  category: 'DSA' | 'JS';
  title: string;
  description: string;
  icon: string;
  orderIndex: number;
  createdAt?: string;
  subtopics?: GuidebookSubtopic[];
}

export interface GuidebookSubtopic {
  id: string;
  topicId: string;
  title: string;
  description: string;
  contentMarkdown: string;
  coverImageUrl?: string;
  videoUrl?: string;
  codeExample?: string;
  isPublished: boolean;
  linkedProblemIds?: string[];
  orderIndex: number;
  isRead?: boolean;
  createdAt?: string;
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
  category?: string;
  upvotes: number;
  upvotedBy?: string[];
  createdAt: string;
}

import bcrypt from 'bcryptjs';
import { EmailService } from './email.service';

let _emailColumnExistsCache: boolean | null = null;
async function checkEmailColumnExists(): Promise<boolean> {
  if (_emailColumnExistsCache !== null) return _emailColumnExistsCache;
  try {
    const [cols]: any = await pool.query("SHOW COLUMNS FROM users LIKE 'email'");
    _emailColumnExistsCache = Boolean(cols && cols.length > 0);
  } catch {
    _emailColumnExistsCache = false;
  }
  return _emailColumnExistsCache;
}

export class MysqlStorageService {
  public static async initDatabase() {
    try {
      await pool.query('SET FOREIGN_KEY_CHECKS = 0');
    } catch (e) {}

    try {
      await pool.query("ALTER TABLE mock_test_results DROP FOREIGN KEY mock_test_results_ibfk_1");
    } catch (e) {}

    try {
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
    } catch (e: any) { console.warn('users table check:', e?.message); }

    try {
      const [cols]: any = await pool.query("SHOW COLUMNS FROM users LIKE 'email'");
      if (!cols || cols.length === 0) {
        await pool.query("ALTER TABLE users ADD COLUMN email VARCHAR(128)");
        console.log("✅ Successfully added 'email' column to MySQL users table.");
      }
      _emailColumnExistsCache = true;
      await pool.query("UPDATE users SET email = name WHERE (email IS NULL OR email = '') AND name LIKE '%@%'");
    } catch (err: any) {
      console.warn("Notice checking/adding email column in MySQL:", err?.message);
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_resets (
          email_or_username VARCHAR(128) PRIMARY KEY,
          otp_code VARCHAR(10) NOT NULL,
          expires_at TIMESTAMP NOT NULL
        )
      `);
    } catch (e: any) { console.warn('password_resets table check:', e?.message); }

    try {
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
    } catch (e: any) { console.warn('problems table check:', e?.message); }

    try {
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
    } catch (e: any) { console.warn('user_progress table check:', e?.message); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_problem_visits (
          user_id VARCHAR(64) NOT NULL,
          problem_id VARCHAR(64) NOT NULL,
          visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, problem_id)
        )
      `);
    } catch (e: any) { console.warn('user_problem_visits table check:', e?.message); }

    try {
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
    } catch (e: any) { console.warn('mock_test_results table check:', e?.message); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS mock_test_config (
          id INT AUTO_INCREMENT PRIMARY KEY,
          problem_ids JSON NOT NULL,
          time_limit_minutes INT DEFAULT 95,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        )
      `);
    } catch (e: any) { console.warn('mock_test_config table check:', e?.message); }

    try {
      const [mcols]: any = await pool.query("SHOW COLUMNS FROM mock_test_config LIKE 'category'");
      if (!mcols || mcols.length === 0) {
        await pool.query("ALTER TABLE mock_test_config ADD COLUMN category VARCHAR(16) DEFAULT 'DSA'");
        console.log("✅ Successfully added 'category' column to MySQL mock_test_config table.");
      }
    } catch (err: any) {
      console.warn("Notice checking/adding category column in mock_test_config:", err?.message);
    }

    try {
      const [rcols]: any = await pool.query("SHOW COLUMNS FROM mock_test_results LIKE 'category'");
      if (!rcols || rcols.length === 0) {
        await pool.query("ALTER TABLE mock_test_results ADD COLUMN category VARCHAR(16) DEFAULT 'DSA'");
        console.log("✅ Successfully added 'category' column to MySQL mock_test_results table.");
      }
    } catch (err: any) {
      console.warn("Notice checking/adding category column in mock_test_results:", err?.message);
    }

    try {
      const [cols]: any = await pool.query("SHOW COLUMNS FROM problems LIKE 'category'");
      if (!cols || cols.length === 0) {
        await pool.query("ALTER TABLE problems ADD COLUMN category VARCHAR(16) DEFAULT 'DSA'");
        console.log("✅ Successfully added 'category' column to MySQL problems table.");
      }
    } catch (err: any) {
      console.warn("Notice checking/adding category column in MySQL:", err?.message);
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS guidebook_topics (
          id VARCHAR(64) PRIMARY KEY,
          category VARCHAR(16) NOT NULL DEFAULT 'JS',
          title VARCHAR(255) NOT NULL,
          description TEXT,
          icon VARCHAR(64) DEFAULT 'book',
          order_index INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log('✅ guidebook_topics table ready.');
    } catch (e: any) { console.warn('guidebook_topics table check:', e?.message); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS guidebook_subtopics (
          id VARCHAR(64) PRIMARY KEY,
          topic_id VARCHAR(64) NOT NULL,
          title VARCHAR(255) NOT NULL,
          description VARCHAR(512),
          content_markdown LONGTEXT NOT NULL,
          cover_image_url VARCHAR(512),
          video_url VARCHAR(512),
          code_example TEXT,
          is_published BOOLEAN DEFAULT TRUE,
          linked_problem_ids JSON,
          order_index INT NOT NULL DEFAULT 0,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e: any) { console.warn('guidebook_subtopics table check:', e?.message); }

    try {
      const [vcols]: any = await pool.query("SHOW COLUMNS FROM guidebook_subtopics LIKE 'video_url'");
      if (!vcols || vcols.length === 0) {
        await pool.query("ALTER TABLE guidebook_subtopics ADD COLUMN video_url VARCHAR(512) AFTER cover_image_url");
        console.log("✅ Added video_url column to guidebook_subtopics.");
      }
    } catch (e: any) { console.warn('video_url column check:', e?.message); }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS user_guidebook_progress (
          user_id VARCHAR(64) NOT NULL,
          subtopic_id VARCHAR(64) NOT NULL,
          is_read BOOLEAN DEFAULT TRUE,
          completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, subtopic_id)
        )
      `);
    } catch (e: any) { console.warn('user_guidebook_progress table check:', e?.message); }

    try {
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
          category VARCHAR(16) DEFAULT 'DSA',
          upvotes INT DEFAULT 0,
          upvoted_by JSON,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e: any) { console.warn('community_solutions table check:', e?.message); }

    try {
      const [cols]: any = await pool.query("SHOW COLUMNS FROM community_solutions LIKE 'category'");
      if (!cols || cols.length === 0) {
        await pool.query("ALTER TABLE community_solutions ADD COLUMN category VARCHAR(16) DEFAULT 'DSA'");
        console.log("✅ Successfully added 'category' column to MySQL community_solutions table.");
      }
    } catch (err: any) {
      console.warn("Notice checking/adding category column in community_solutions:", err?.message);
    }

    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS resume_analyses (
          id VARCHAR(64) PRIMARY KEY,
          user_id VARCHAR(64) NOT NULL,
          filename VARCHAR(255) NOT NULL,
          file_type VARCHAR(16) NOT NULL,
          file_size INT NOT NULL,
          job_title VARCHAR(255),
          job_description TEXT NOT NULL,
          resume_text LONGTEXT NOT NULL,
          result_json JSON NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          INDEX idx_resume_analyses_user (user_id)
        )
      `);
    } catch (e: any) { console.warn('resume_analyses table check:', e?.message); }

    try {
      await pool.query('SET FOREIGN_KEY_CHECKS = 1');
    } catch (e) {}

    await this.seedDefaultData();
    await this.seedDefaultGuidebookData();
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

    // Ensure existing JS curriculum problems in MySQL have category = 'JS'
    for (const day of JS_CURRICULUM_DATA) {
      for (const p of day.problems) {
        await pool.query("UPDATE problems SET category = 'JS' WHERE id = ?", [p.id]);
      }
    }

    for (const day of CURRICULUM_DATA) {
      for (const p of day.problems) {
        await pool.query(
          `INSERT INTO problems (id, category, day_number, week_number, title, difficulty, pattern_tag, description, starter_code, test_cases, solution_hint, created_at)
           VALUES (?, 'DSA', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE day_number = VALUES(day_number), week_number = VALUES(week_number), title = VALUES(title)`,
          [p.id, day.dayNumber, day.weekNumber, p.title, p.difficulty, p.patternTag, p.description, p.starterCode, JSON.stringify(p.testCases), p.solutionHint || '']
        );
      }
    }

    for (const day of JS_CURRICULUM_DATA) {
      for (const p of day.problems) {
        await pool.query(
          `INSERT INTO problems (id, category, day_number, week_number, title, difficulty, pattern_tag, description, starter_code, test_cases, solution_hint, created_at)
           VALUES (?, 'JS', ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())
           ON DUPLICATE KEY UPDATE category = 'JS', day_number = VALUES(day_number), week_number = VALUES(week_number), title = VALUES(title)`,
          [p.id, day.dayNumber, day.weekNumber, p.title, p.difficulty, p.patternTag, p.description, p.starterCode, JSON.stringify(p.testCases), p.solutionHint || '']
        );
      }
    }
    console.log('✅ DSA and JS curriculum problems synchronized into MySQL.');
  }

  // --- AUTH & CALENDAR-BASED STREAK METHODS ---
  public static async upsertGoogleUser(data: { id: string; username: string; name: string; email: string; avatarUrl: string }): Promise<User> {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const hasEmail = await checkEmailColumnExists();

    let query = 'SELECT * FROM users WHERE id = ? OR LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?)';
    const params: any[] = [data.id, data.username, data.email];
    if (hasEmail) {
      query += ' OR (email IS NOT NULL AND LOWER(email) = LOWER(?))';
      params.push(data.email);
    }

    const [existing]: any = await pool.query(query, params);

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

      if (hasEmail) {
        await pool.query(
          'UPDATE users SET last_login_date = ?, login_streak = ?, avatar_url = ?, email = ? WHERE id = ?',
          [todayStr, newStreak, data.avatarUrl || user.avatar_url, userEmail, user.id]
        );
      } else {
        await pool.query(
          'UPDATE users SET last_login_date = ?, login_streak = ?, avatar_url = ? WHERE id = ?',
          [todayStr, newStreak, data.avatarUrl || user.avatar_url, user.id]
        );
      }

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
      if (hasEmail) {
        await pool.query(
          `INSERT INTO users (id, username, name, email, password_hash, role, avatar_url, last_login_date, login_streak)
           VALUES (?, ?, ?, ?, ?, 'user', ?, ?, 1)`,
          [data.id, data.username, data.name || data.email, data.email, dummyPasswordHash, data.avatarUrl, todayStr]
        );
      } else {
        await pool.query(
          `INSERT INTO users (id, username, name, password_hash, role, avatar_url, last_login_date, login_streak)
           VALUES (?, ?, ?, ?, 'user', ?, ?, 1)`,
          [data.id, data.username, data.email || data.name, dummyPasswordHash, data.avatarUrl, todayStr]
        );
      }

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
    const hasEmail = await checkEmailColumnExists();

    let query = 'SELECT id FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?)';
    const params: any[] = [username, email];
    if (hasEmail) {
      query += ' OR (email IS NOT NULL AND LOWER(email) = LOWER(?))';
      params.push(email);
    }

    const [existing]: any = await pool.query(query, params);
    if (existing.length > 0) {
      throw new Error('Username or email address is already registered');
    }

    const id = `user_${Date.now()}`;
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`;
    const today = new Date().toISOString().split('T')[0];

    // Bcrypt Password Encryption
    const passwordHash = await bcrypt.hash(password, 10);

    if (hasEmail) {
      await pool.query(
        `INSERT INTO users (id, username, name, email, password_hash, role, avatar_url, last_login_date, login_streak)
         VALUES (?, ?, ?, ?, ?, 'user', ?, ?, 1)`,
        [id, username, email, email, passwordHash, avatarUrl, today]
      );
    } else {
      await pool.query(
        `INSERT INTO users (id, username, name, password_hash, role, avatar_url, last_login_date, login_streak)
         VALUES (?, ?, ?, ?, 'user', ?, ?, 1)`,
        [id, username, email, passwordHash, avatarUrl, today]
      );
    }

    // Send Welcome Email directly to user's registered email
    await EmailService.sendWelcomeEmail(email, username);

    return { id, username, name: email, email, role: 'user', avatarUrl, lastLoginDate: today, loginStreak: 1 };
  }

  public static async loginUser(usernameOrEmail: string, password: string): Promise<User> {
    const hasEmail = await checkEmailColumnExists();

    let query = 'SELECT * FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?)';
    const params: any[] = [usernameOrEmail, usernameOrEmail];
    if (hasEmail) {
      query += ' OR (email IS NOT NULL AND LOWER(email) = LOWER(?))';
      params.push(usernameOrEmail);
    }

    const [rows]: any = await pool.query(query, params);
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
      email: user.email || (user.name && user.name.includes('@') ? user.name : undefined),
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
    const hasEmail = await checkEmailColumnExists();

    let query = 'SELECT username, name' + (hasEmail ? ', email' : '') + ' FROM users WHERE LOWER(username) = LOWER(?) OR LOWER(name) = LOWER(?)';
    const params: any[] = [emailOrUsername, emailOrUsername];
    if (hasEmail) {
      query += ' OR (email IS NOT NULL AND LOWER(email) = LOWER(?))';
      params.push(emailOrUsername);
    }

    const [rows]: any = await pool.query(query, params);
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
  public static async getCurriculum(userId?: string, category?: string): Promise<any> {
    let sql = 'SELECT * FROM problems';
    const params: any[] = [];
    if (category && category !== 'ALL' && category !== 'all') {
      sql += ' WHERE category = ?';
      params.push(category);
    }
    sql += ' ORDER BY week_number, day_number, created_at';

    const [problems]: any = await pool.query(sql, params);
    
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
    const dayMap = new Map<string, any>();
    const now = new Date().getTime();

    for (const p of problems) {
      const dayNum = p.day_number;
      const cat = p.category || 'DSA';
      const mapKey = `${cat}:${dayNum}`; // composite key prevents DSA/JS day collision
      if (!dayMap.has(mapKey)) {
        const curriculumSet = cat === 'JS' ? JS_CURRICULUM_DATA : CURRICULUM_DATA;
        const templateDay: any = curriculumSet.find(d => d.dayNumber === dayNum) || {
          dayNumber: dayNum,
          weekNumber: p.week_number,
          title: `Day ${dayNum} Practice`,
          learnTopics: ['Core JavaScript Problem Solving'],
          codeSnippets: [],
          targetSummary: ''
        };

        dayMap.set(mapKey, {
          dayNumber: templateDay.dayNumber,
          weekNumber: templateDay.weekNumber,
          title: templateDay.title,
          learnTopics: templateDay.learnTopics,
          codeSnippets: templateDay.codeSnippets || [],
          targetSummary: templateDay.targetSummary || '',
          category: cat,
          problems: []
        });
      }

      const createdTime = new Date(p.created_at).getTime();
      const isLessThanSevenDaysOld = (now - createdTime) <= (7 * 24 * 60 * 60 * 1000);
      const isVisitedOrSolved = visitedSet.has(p.id) || (userProgressMap[p.id] && userProgressMap[p.id].isSolved);
      
      const isNew = isLessThanSevenDaysOld && !isVisitedOrSolved;

      dayMap.get(mapKey).problems.push({
        id: p.id,
        category: p.category || 'DSA',
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
    category?: string;
    score: number;
    totalQuestions: number;
    timeSpentSeconds: number;
    answersJson: any;
  }): Promise<any> {
    const id = `mock_${Date.now()}`;
    const category = (data.category || 'DSA').toUpperCase();
    await pool.query(
      `INSERT INTO mock_test_results (id, user_id, category, score, total_questions, time_spent_seconds, answers_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
      [id, data.userId, category, data.score, data.totalQuestions, data.timeSpentSeconds, JSON.stringify(data.answersJson)]
    );
    return { ...data, category, id, createdAt: new Date().toISOString() };
  }

  public static async getMockTestHistory(userId: string, category?: string): Promise<any[]> {
    let sql = 'SELECT * FROM mock_test_results WHERE user_id = ?';
    const params: any[] = [userId];
    if (category && category !== 'ALL') {
      sql += ' AND UPPER(category) = ?';
      params.push(category.toUpperCase());
    }
    sql += ' ORDER BY created_at DESC';

    const [rows]: any = await pool.query(sql, params);

    return rows.map((r: any) => ({
      id: r.id,
      category: r.category || 'DSA',
      score: r.score,
      totalQuestions: r.total_questions,
      timeSpentSeconds: r.time_spent_seconds,
      answersJson: typeof r.answers_json === 'string' ? JSON.parse(r.answers_json) : r.answers_json,
      createdAt: r.created_at
    }));
  }

  // --- RESUME ANALYSIS METHODS ---
  public static async saveResumeAnalysis(data: {
    userId: string;
    filename: string;
    fileType: string;
    fileSize: number;
    jobTitle?: string;
    jobDescription: string;
    resumeText: string;
    result: any;
  }): Promise<any> {
    const id = `resume_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await pool.query(
      `INSERT INTO resume_analyses
       (id, user_id, filename, file_type, file_size, job_title, job_description, resume_text, result_json)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, data.userId, data.filename, data.fileType, data.fileSize, data.jobTitle || '', data.jobDescription, data.resumeText, JSON.stringify(data.result)]
    );
    return { id, filename: data.filename, fileType: data.fileType, jobTitle: data.jobTitle || '', ...data.result, createdAt: new Date().toISOString() };
  }

  public static async getResumeAnalyses(userId: string): Promise<any[]> {
    const [rows]: any = await pool.query(
      `SELECT id, filename, file_type, file_size, job_title, result_json, created_at
       FROM resume_analyses WHERE user_id = ? ORDER BY created_at DESC`,
      [userId]
    );
    return rows.map((row: any) => ({
      id: row.id,
      filename: row.filename,
      fileType: row.file_type,
      fileSize: row.file_size,
      jobTitle: row.job_title,
      ...(typeof row.result_json === 'string' ? JSON.parse(row.result_json) : row.result_json),
      createdAt: row.created_at
    }));
  }

  public static async deleteResumeAnalysis(userId: string, id: string): Promise<boolean> {
    const [result]: any = await pool.query('DELETE FROM resume_analyses WHERE id = ? AND user_id = ?', [id, userId]);
    return result.affectedRows > 0;
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
        category: (row.category || 'DSA').toUpperCase(),
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
    category?: string;
  }): Promise<CommunitySolution> {
    let cat = (data.category || '').toUpperCase();
    if (!cat) {
      const [prows]: any = await pool.query('SELECT category FROM problems WHERE id = ?', [data.problemId]);
      cat = (prows && prows.length > 0 && prows[0].category) ? prows[0].category.toUpperCase() : 'DSA';
    }

    const [existing]: any = await pool.query(
      'SELECT id, upvotes FROM community_solutions WHERE problem_id = ? AND user_id = ?',
      [data.problemId, data.userId]
    );

    if (existing && existing.length > 0) {
      const solId = existing[0].id;
      const currentUpvotes = existing[0].upvotes || 0;
      await pool.query(
        `UPDATE community_solutions
         SET username = ?, avatar_url = ?, code = ?, runtime_ms = ?, pattern_tag = ?, category = ?, created_at = NOW()
         WHERE id = ?`,
        [data.username, data.avatarUrl, data.code, data.runtimeMs, data.patternTag, cat, solId]
      );
      return { ...data, category: cat, id: solId, upvotes: currentUpvotes, upvotedBy: [], createdAt: new Date().toISOString() };
    }

    const id = `sol_${Date.now()}`;
    await pool.query(
      `INSERT INTO community_solutions (id, problem_id, user_id, username, avatar_url, code, runtime_ms, pattern_tag, category, upvotes, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())`,
      [id, data.problemId, data.userId, data.username, data.avatarUrl, data.code, data.runtimeMs, data.patternTag, cat]
    );

    return { ...data, category: cat, id, upvotes: 0, upvotedBy: [], createdAt: new Date().toISOString() };
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
  public static async createProblem(problem: {
    category?: 'DSA' | 'JS';
    dayNumber: number;
    weekNumber: number;
    title: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    patternTag: string;
    description: string;
    starterCode: string;
    testCases: any[];
    solutionHint?: string;
  }): Promise<Problem> {
    const id = `prob_${Date.now()}`;
    const category = problem.category || 'DSA';
    await pool.query(
      `INSERT INTO problems (id, category, day_number, week_number, title, difficulty, pattern_tag, description, starter_code, test_cases, solution_hint, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
      [
        id,
        category,
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

    return { ...problem, category, id, isNew: true };
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

  public static async getMockTestConfig(category: string = 'DSA'): Promise<any> {
    const catUpper = (category || 'DSA').toUpperCase();
    const [rows]: any = await pool.query(
      'SELECT * FROM mock_test_config WHERE UPPER(category) = ? ORDER BY id DESC LIMIT 1',
      [catUpper]
    );

    if (rows.length > 0) {
      const rawIds = typeof rows[0].problem_ids === 'string' ? JSON.parse(rows[0].problem_ids) : rows[0].problem_ids;
      const questions: { id: string; minutes: number }[] = Array.isArray(rawIds)
        ? rawIds.map((item: any) =>
            typeof item === 'string'
              ? { id: item, minutes: Math.round((rows[0].time_limit_minutes || 95) / rawIds.length) }
              : { id: item.id, minutes: item.minutes || 20 }
          )
        : [];
      return { category: catUpper, questions, totalMinutes: questions.reduce((s: number, q: any) => s + q.minutes, 0) };
    }

    if (catUpper === 'JS') {
      return {
        category: 'JS',
        questions: [
          { id: 'js-execution-context', minutes: 20 },
          { id: 'js-custom-higher-order', minutes: 20 },
          { id: 'js-deep-clone', minutes: 20 },
          { id: 'js-custom-promise-all', minutes: 20 },
          { id: 'js-event-emitter', minutes: 20 }
        ],
        totalMinutes: 100
      };
    }

    return {
      category: 'DSA',
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

  public static async updateMockTestConfig(questions: { id: string; minutes: number }[], category: string = 'DSA'): Promise<any> {
    const catUpper = (category || 'DSA').toUpperCase();
    const totalMinutes = questions.reduce((s, q) => s + (q.minutes || 20), 0);
    await pool.query(
      'INSERT INTO mock_test_config (category, problem_ids, time_limit_minutes) VALUES (?, ?, ?)',
      [catUpper, JSON.stringify(questions), totalMinutes]
    );
    return { category: catUpper, questions, totalMinutes };
  }

  // --- UPDATE PROBLEM (Admin Edit) ---
  public static async updateProblem(id: string, data: {
    category?: 'DSA' | 'JS';
    title?: string; description?: string; difficulty?: string;
    patternTag?: string; solutionHint?: string; testCases?: any[];
  }): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.category !== undefined)    { fields.push('category = ?');     values.push(data.category); }
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
  public static async getLeaderboard(category: string = 'ALL'): Promise<any[]> {
    const catUpper = (category || 'ALL').toUpperCase();
    let sql: string;
    const params: any[] = [];

    if (catUpper !== 'ALL') {
      sql = `
        SELECT u.id, u.username, u.name, u.avatar_url,
               u.login_streak,
               COUNT(DISTINCT IF(pr.id IS NOT NULL, p.problem_id, NULL)) AS solved_count
        FROM users u
        LEFT JOIN user_progress p ON p.user_id = u.id AND p.is_solved = 1
        LEFT JOIN problems pr ON p.problem_id = pr.id AND UPPER(pr.category) = ?
        GROUP BY u.id
        ORDER BY solved_count DESC, u.login_streak DESC
        LIMIT 50
      `;
      params.push(catUpper);
    } else {
      sql = `
        SELECT u.id, u.username, u.name, u.avatar_url,
               u.login_streak,
               COUNT(DISTINCT p.problem_id) AS solved_count
        FROM users u
        LEFT JOIN user_progress p ON p.user_id = u.id AND p.is_solved = 1
        GROUP BY u.id
        ORDER BY solved_count DESC, u.login_streak DESC
        LIMIT 50
      `;
    }

    const [rows]: any = await pool.query(sql, params);
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

  // --- GUIDEBOOK & BLOG CMS METHODS ---
  private static async seedDefaultGuidebookData() {
    try {
      const [existing]: any = await pool.query('SELECT COUNT(*) as count FROM guidebook_topics');
      if (existing[0].count > 0) return;

      console.log('🌱 Seeding initial Guidebook Topics and Subtopics...');

      // JS Topic 1: Async JS & Event Loop
      const topicJsAsyncId = 'topic_js_async';
      await pool.query(
        `INSERT INTO guidebook_topics (id, category, title, description, icon, order_index) VALUES (?, 'JS', ?, ?, 'zap', 1)`,
        [topicJsAsyncId, 'Asynchronous JavaScript & Event Loop', 'Master call stack, task queues, microtasks, event loop mechanics, and async/await patterns.']
      );

      const subtopic1Id = 'subtopic_event_loop';
      const subtopic1Markdown = `# Deep Dive into JavaScript Event Loop & Task Queue

JavaScript is a single-threaded language, meaning it executes code one line at a time on a single call stack. However, it handles non-blocking I/O efficiently using the **Event Loop**.

## 1. The Event Loop Architecture
The browser runtime consists of:
- **Call Stack**: Where execution context stack is processed.
- **Web APIs**: Background thread handling \`setTimeout\`, DOM events, and \`fetch\`.
- **Microtask Queue**: High priority queue for \`Promise.then\`, \`queueMicrotask\`, and \`MutationObserver\`.
- **Task Queue (Macrotask Queue)**: Queue for \`setTimeout\`, \`setInterval\`, and I/O callbacks.

![JavaScript Event Loop Architecture](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80)
*Figure 1: Conceptual visualization of the JavaScript Event Loop, Web APIs, and Microtask Queues.*

## 2. Microtasks vs Macrotasks Execution Order

Microtasks **always** take precedence over Macrotasks. The event loop empties the *entire* microtask queue before rendering UI or processing the next macrotask.

\`\`\`javascript
console.log('1: Synchronous Script Start');

setTimeout(() => {
  console.log('4: Macrotask Callback (setTimeout)');
}, 0);

Promise.resolve().then(() => {
  console.log('2: Microtask Callback (Promise 1)');
}).then(() => {
  console.log('3: Microtask Callback (Promise 2)');
});

console.log('5: Synchronous Script End');
\`\`\`

### Output Trace:
\`\`\`text
1: Synchronous Script Start
5: Synchronous Script End
2: Microtask Callback (Promise 1)
3: Microtask Callback (Promise 2)
4: Macrotask Callback (setTimeout)
\`\`\`

> [!TIP]
> Always prefer \`queueMicrotask()\` when scheduling lightweight asynchronous work that must run before the next browser frame render.
`;

      await pool.query(
        `INSERT INTO guidebook_subtopics (id, topic_id, title, description, content_markdown, cover_image_url, code_example, is_published, linked_problem_ids, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, 1)`,
        [
          subtopic1Id,
          topicJsAsyncId,
          'Event Loop, Call Stack & Microtasks',
          'Learn how single-threaded JavaScript handles concurrency with event loop queues.',
          subtopic1Markdown,
          'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1000&q=80',
          `console.log('Start');\nPromise.resolve().then(() => console.log('Promise Microtask'));\nsetTimeout(() => console.log('Timeout Macrotask'), 0);\nconsole.log('End');`,
          JSON.stringify(['two-sum'])
        ]
      );

      // JS Topic 2: Closures & Lexical Scope
      const topicJsClosuresId = 'topic_js_closures';
      await pool.query(
        `INSERT INTO guidebook_topics (id, category, title, description, icon, order_index) VALUES (?, 'JS', ?, ?, 'code', 2)`,
        [topicJsClosuresId, 'Closures & Lexical Scope', 'Understand scope chain, lexical environment, private variables, and memory retainers.']
      );

      const subtopic2Id = 'subtopic_closures';
      const subtopic2Markdown = `# Closures & Lexical Scoping in JavaScript

A **closure** is the combination of a function bundled together with references to its surrounding state (lexical environment).

## 1. How Closures Work

In JavaScript, functions retain access to variables in their parent scope even after the parent function has finished executing.

\`\`\`javascript
function createCounter() {
  let count = 0; // Private state retained by closure
  return {
    increment() {
      count++;
      return count;
    },
    decrement() {
      count--;
      return count;
    },
    getValue() {
      return count;
    }
  };
}

const counter = createCounter();
console.log(counter.increment()); // 1
console.log(counter.increment()); // 2
console.log(counter.getValue());   // 2
\`\`\`

![Closure Memory Diagram](https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=1000&q=80)
*Figure 2: Memory scope chain retaining enclosed variables in heap allocation.*

## 2. Practical Use Cases
- **Data Encapsulation & Privacy**: Creating private variables without ES6 \`#private\` fields.
- **Currying & Partial Application**: Pre-filling arguments for reusable utility functions.
- **Debounce and Throttle**: Retaining timer IDs across rapid event calls.
`;

      await pool.query(
        `INSERT INTO guidebook_subtopics (id, topic_id, title, description, content_markdown, cover_image_url, code_example, is_published, linked_problem_ids, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, 1)`,
        [
          subtopic2Id,
          topicJsClosuresId,
          'Lexical Scope & Private State',
          'Learn how closures retain outer variable scopes for data encapsulation.',
          subtopic2Markdown,
          'https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?auto=format&fit=crop&w=1000&q=80',
          `function makeMultiplier(multiplier) {\n  return function(x) {\n    return x * multiplier;\n  };\n}\nconst double = makeMultiplier(2);\nconsole.log(double(5)); // 10`,
          JSON.stringify(['valid-parentheses'])
        ]
      );

      // DSA Topic 1: Two Pointers Pattern
      const topicDsaPointersId = 'topic_dsa_two_pointers';
      await pool.query(
        `INSERT INTO guidebook_topics (id, category, title, description, icon, order_index) VALUES (?, 'DSA', ?, ?, 'git-merge', 1)`,
        [topicDsaPointersId, 'Two Pointers & Sliding Window', 'Master optimal pointer patterns for array and string algorithmic challenges.']
      );

      const subtopicDsa1Id = 'subtopic_two_pointers';
      const subtopicDsa1Markdown = `# Mastering the Two Pointers Technique

The **Two Pointers** technique is a fundamental algorithmic pattern where two indices iterate across a data structure simultaneously.

## 1. Convergence Pattern (Opposite Ends)

Used primarily on **sorted arrays** to find pairs or ranges in $O(N)$ time instead of $O(N^2)$ brute force.

\`\`\`javascript
function twoSumSorted(numbers, target) {
  let left = 0;
  let right = numbers.length - 1;

  while (left < right) {
    const currentSum = numbers[left] + numbers[right];
    if (currentSum === target) {
      return [left + 1, right + 1];
    } else if (currentSum < target) {
      left++; // Need larger sum
    } else {
      right--; // Need smaller sum
    }
  }
  return [];
}
\`\`\`

![Two Pointers Convergence](https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1000&q=80)
*Figure 3: Two Pointers converging from opposite ends of a sorted array.*
`;

      await pool.query(
        `INSERT INTO guidebook_subtopics (id, topic_id, title, description, content_markdown, cover_image_url, code_example, is_published, linked_problem_ids, order_index)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE, ?, 1)`,
        [
          subtopicDsa1Id,
          topicDsaPointersId,
          'Opposite End & Fast/Slow Pointers',
          'Learn how to solve array & string problems in O(N) linear time.',
          subtopicDsa1Markdown,
          'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&w=1000&q=80',
          `let left = 0, right = arr.length - 1;\nwhile(left < right) {\n  // compare elements\n  left++; right--;\n}`,
          JSON.stringify(['two-sum', '3sum'])
        ]
      );

      console.log('✅ Guidebook Topics and Subtopics seeded successfully.');
    } catch (err: any) {
      console.error('Error seeding guidebook data:', err?.message);
    }
  }

  // --- PUBLIC & ADMIN GUIDEBOOK API METHODS ---
  public static async getGuidebookTopics(category?: 'DSA' | 'JS', userId?: string): Promise<GuidebookTopic[]> {
    let query = 'SELECT * FROM guidebook_topics';
    const params: any[] = [];
    if (category && category !== ('ALL' as any)) {
      query += ' WHERE category = ?';
      params.push(category);
    }
    query += ' ORDER BY order_index ASC, created_at ASC';
    const [topics]: any = await pool.query(query, params);

    const readSet = new Set<string>();
    if (userId && userId !== 'user_guest' && userId !== 'null') {
      const [prog]: any = await pool.query(
        'SELECT subtopic_id FROM user_guidebook_progress WHERE user_id = ? AND is_read = TRUE',
        [userId]
      );
      for (const p of prog) readSet.add(p.subtopic_id);
    }

    const result: GuidebookTopic[] = [];
    for (const t of topics) {
      const [subtopics]: any = await pool.query(
        'SELECT * FROM guidebook_subtopics WHERE topic_id = ? ORDER BY order_index ASC, created_at ASC',
        [t.id]
      );
      const parsedSubtopics = subtopics.map((sub: any) => ({
        id: sub.id,
        topicId: sub.topic_id,
        title: sub.title,
        description: sub.description,
        contentMarkdown: sub.content_markdown,
        coverImageUrl: sub.cover_image_url,
        videoUrl: sub.video_url,
        codeExample: sub.code_example,
        isPublished: !!sub.is_published,
        linkedProblemIds: typeof sub.linked_problem_ids === 'string' ? JSON.parse(sub.linked_problem_ids) : (sub.linked_problem_ids || []),
        orderIndex: sub.order_index,
        isRead: readSet.has(sub.id),
        createdAt: sub.created_at
      }));
      result.push({
        id: t.id,
        category: t.category,
        title: t.title,
        description: t.description,
        icon: t.icon,
        orderIndex: t.order_index,
        createdAt: t.created_at,
        subtopics: parsedSubtopics
      });
    }

    return result;
  }

  public static async getGuidebookSubtopic(subtopicId: string, userId?: string): Promise<GuidebookSubtopic | null> {
    const [rows]: any = await pool.query('SELECT * FROM guidebook_subtopics WHERE id = ?', [subtopicId]);
    if (rows.length === 0) return null;

    const sub = rows[0];
    let isRead = false;

    if (userId && userId !== 'user_guest' && userId !== 'null') {
      const [prog]: any = await pool.query('SELECT is_read FROM user_guidebook_progress WHERE user_id = ? AND subtopic_id = ?', [userId, subtopicId]);
      if (prog.length > 0) isRead = !!prog[0].is_read;
    }

    return {
      id: sub.id,
      topicId: sub.topic_id,
      title: sub.title,
      description: sub.description,
      contentMarkdown: sub.content_markdown,
      coverImageUrl: sub.cover_image_url,
      videoUrl: sub.video_url,
      codeExample: sub.code_example,
      isPublished: !!sub.is_published,
      linkedProblemIds: typeof sub.linked_problem_ids === 'string' ? JSON.parse(sub.linked_problem_ids) : (sub.linked_problem_ids || []),
      orderIndex: sub.order_index,
      isRead,
      createdAt: sub.created_at
    };
  }

  public static async createGuidebookTopic(data: { category: 'DSA' | 'JS'; title: string; description: string; icon?: string; orderIndex?: number }): Promise<GuidebookTopic> {
    const id = `topic_${Date.now()}`;
    await pool.query(
      `INSERT INTO guidebook_topics (id, category, title, description, icon, order_index) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.category || 'JS', data.title, data.description || '', data.icon || 'book', data.orderIndex || 0]
    );
    return { id, category: data.category, title: data.title, description: data.description, icon: data.icon || 'book', orderIndex: data.orderIndex || 0, subtopics: [] };
  }

  public static async updateGuidebookTopic(id: string, data: Partial<GuidebookTopic>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];
    if (data.category !== undefined) { fields.push('category = ?'); values.push(data.category); }
    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
    if (data.orderIndex !== undefined) { fields.push('order_index = ?'); values.push(data.orderIndex); }

    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE guidebook_topics SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  public static async deleteGuidebookTopic(id: string): Promise<void> {
    await pool.query('DELETE FROM guidebook_topics WHERE id = ?', [id]);
  }

  public static async createGuidebookSubtopic(data: {
    topicId: string;
    title: string;
    description: string;
    contentMarkdown: string;
    coverImageUrl?: string;
    videoUrl?: string;
    codeExample?: string;
    isPublished?: boolean;
    linkedProblemIds?: string[];
    orderIndex?: number;
  }): Promise<GuidebookSubtopic> {
    const id = `subtopic_${Date.now()}`;
    await pool.query(
      `INSERT INTO guidebook_subtopics (id, topic_id, title, description, content_markdown, cover_image_url, video_url, code_example, is_published, linked_problem_ids, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.topicId,
        data.title,
        data.description || '',
        data.contentMarkdown,
        data.coverImageUrl || '',
        data.videoUrl || '',
        data.codeExample || '',
        data.isPublished !== undefined ? data.isPublished : true,
        JSON.stringify(data.linkedProblemIds || []),
        data.orderIndex || 0
      ]
    );

    return {
      id,
      topicId: data.topicId,
      title: data.title,
      description: data.description,
      contentMarkdown: data.contentMarkdown,
      coverImageUrl: data.coverImageUrl,
      videoUrl: data.videoUrl,
      codeExample: data.codeExample,
      isPublished: data.isPublished !== undefined ? data.isPublished : true,
      linkedProblemIds: data.linkedProblemIds || [],
      orderIndex: data.orderIndex || 0
    };
  }

  public static async updateGuidebookSubtopic(id: string, data: Partial<GuidebookSubtopic>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.title !== undefined) { fields.push('title = ?'); values.push(data.title); }
    if (data.description !== undefined) { fields.push('description = ?'); values.push(data.description); }
    if (data.contentMarkdown !== undefined) { fields.push('content_markdown = ?'); values.push(data.contentMarkdown); }
    if (data.coverImageUrl !== undefined) { fields.push('cover_image_url = ?'); values.push(data.coverImageUrl); }
    if (data.videoUrl !== undefined) { fields.push('video_url = ?'); values.push(data.videoUrl); }
    if (data.codeExample !== undefined) { fields.push('code_example = ?'); values.push(data.codeExample); }
    if (data.isPublished !== undefined) { fields.push('is_published = ?'); values.push(data.isPublished); }
    if (data.linkedProblemIds !== undefined) { fields.push('linked_problem_ids = ?'); values.push(JSON.stringify(data.linkedProblemIds)); }
    if (data.orderIndex !== undefined) { fields.push('order_index = ?'); values.push(data.orderIndex); }

    if (fields.length === 0) return;
    values.push(id);
    await pool.query(`UPDATE guidebook_subtopics SET ${fields.join(', ')} WHERE id = ?`, values);
  }

  public static async deleteGuidebookSubtopic(id: string): Promise<void> {
    await pool.query('DELETE FROM guidebook_subtopics WHERE id = ?', [id]);
    await pool.query('DELETE FROM user_guidebook_progress WHERE subtopic_id = ?', [id]);
  }

  public static async toggleSubtopicReadStatus(userId: string, subtopicId: string): Promise<boolean> {
    if (!userId || userId === 'user_guest' || userId === 'null') return false;

    const [rows]: any = await pool.query('SELECT is_read FROM user_guidebook_progress WHERE user_id = ? AND subtopic_id = ?', [userId, subtopicId]);
    if (rows.length > 0) {
      const newStatus = !rows[0].is_read;
      await pool.query('UPDATE user_guidebook_progress SET is_read = ? WHERE user_id = ? AND subtopic_id = ?', [newStatus, userId, subtopicId]);
      return newStatus;
    } else {
      await pool.query('INSERT INTO user_guidebook_progress (user_id, subtopic_id, is_read) VALUES (?, ?, TRUE)', [userId, subtopicId]);
      return true;
    }
  }
}

