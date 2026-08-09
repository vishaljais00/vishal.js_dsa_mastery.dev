import mysql from 'mysql2/promise';

const DB_HOST = process.env['DB_HOST'] || 'localhost';
const DB_USER = process.env['DB_USER'] || 'root';
const DB_PASS = process.env['DB_PASS'] || 'root';
const DB_NAME = process.env['DB_NAME'] || 'js_dsa_db';
const DB_PORT = Number(process.env['DB_PORT']) || 3306;

const DB_SSL = process.env['DB_SSL'] === 'true' || process.env['NODE_ENV'] === 'production';

export const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASS,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: DB_SSL ? { rejectUnauthorized: false } : undefined
});

export async function initializeDatabase() {
  // If database already exists or connected, handle initialization
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      user: DB_USER,
      password: DB_PASS,
      port: DB_PORT,
      ssl: DB_SSL ? { rejectUnauthorized: false } : undefined
    });

    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.end();
  } catch (err: any) {
    console.warn(`⚠️ [DB Initialization Notice] Could not create database directly: ${err.message}. Assuming table initialization via pool.`);
  }

  // Create tables in js_dsa_db
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(64) PRIMARY KEY,
      username VARCHAR(64) NOT NULL UNIQUE,
      name VARCHAR(128) NOT NULL,
      password_hash VARCHAR(256) NOT NULL,
      role ENUM('user', 'admin') DEFAULT 'user',
      avatar_url VARCHAR(512),
      last_login_date DATE,
      login_streak INT DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS problems (
      id VARCHAR(64) PRIMARY KEY,
      day_number INT NOT NULL,
      week_number INT NOT NULL,
      title VARCHAR(256) NOT NULL,
      difficulty ENUM('Easy', 'Medium', 'Hard') DEFAULT 'Easy',
      pattern_tag VARCHAR(128),
      description TEXT NOT NULL,
      starter_code TEXT NOT NULL,
      test_cases JSON NOT NULL,
      solution_hint TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_progress (
      user_id VARCHAR(64) NOT NULL,
      problem_id VARCHAR(64) NOT NULL,
      is_solved BOOLEAN DEFAULT FALSE,
      saved_code TEXT,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, problem_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_problem_visits (
      user_id VARCHAR(64) NOT NULL,
      problem_id VARCHAR(64) NOT NULL,
      visited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, problem_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS community_solutions (
      id VARCHAR(64) PRIMARY KEY,
      problem_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      username VARCHAR(128) NOT NULL,
      avatar_url VARCHAR(512),
      code TEXT NOT NULL,
      runtime_ms INT DEFAULT 0,
      pattern_tag VARCHAR(128),
      upvotes INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS solution_upvotes (
      solution_id VARCHAR(64) NOT NULL,
      user_id VARCHAR(64) NOT NULL,
      PRIMARY KEY (solution_id, user_id),
      FOREIGN KEY (solution_id) REFERENCES community_solutions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mock_test_config (
      id INT AUTO_INCREMENT PRIMARY KEY,
      problem_ids JSON NOT NULL,
      time_limit_minutes INT DEFAULT 120,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS mock_test_results (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(64) NOT NULL,
      score INT NOT NULL,
      total_questions INT NOT NULL,
      time_spent_seconds INT NOT NULL,
      answers_json JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('✅ MySQL Database & Tables initialized successfully.');
}
