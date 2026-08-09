import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  username: string;
  name: string;
  passwordHash: string;
  avatarUrl: string;
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
  upvotedBy: string[]; // List of user IDs who upvoted
  createdAt: string;
}

export interface UserProgressData {
  solvedProblems: string[];
  savedCode: { [problemId: string]: string };
  dayStatus: { [dayNumber: number]: 'not-started' | 'in-progress' | 'completed' };
  testScores: {
    [dayNumber: number]: {
      score: number;
      total: number;
      timeSpentSeconds: number;
      dateCompleted: string;
    };
  };
}

const DATA_DIR = path.join(__dirname, '../../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PROGRESS_FILE = path.join(DATA_DIR, 'progress_multi.json');
const SOLUTIONS_FILE = path.join(DATA_DIR, 'community_solutions.json');

export class StorageService {
  private static ensureDataDirExists() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
    }

    if (!fs.existsSync(SOLUTIONS_FILE)) {
      const initialSolutions: CommunitySolution[] = [
        {
          id: 'sol_1',
          problemId: 'two-sum',
          userId: 'user_sample1',
          username: 'dsa_pro',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pro',
          code: `function twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
          runtimeMs: 2,
          patternTag: 'HashMap (Single Pass)',
          upvotes: 12,
          upvotedBy: [],
          createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ];
      fs.writeFileSync(SOLUTIONS_FILE, JSON.stringify(initialSolutions, null, 2));
    }

    if (!fs.existsSync(PROGRESS_FILE)) {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify({}, null, 2));
    }
  }

  // User Auth Methods
  public static getUsers(): User[] {
    this.ensureDataDirExists();
    try {
      return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch {
      return [];
    }
  }

  public static findUserByUsername(username: string): User | undefined {
    return this.getUsers().find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  public static registerUser(username: string, name: string, password: string): User {
    this.ensureDataDirExists();
    const users = this.getUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error('Username already exists');
    }

    const newUser: User = {
      id: `user_${Date.now()}`,
      username,
      name,
      passwordHash: password,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`
    };

    users.push(newUser);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    return newUser;
  }

  // Multi-User Progress Methods
  public static getAllProgress(): { [userId: string]: UserProgressData } {
    this.ensureDataDirExists();
    try {
      return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
    } catch {
      return {};
    }
  }

  public static getUserProgress(userId: string): UserProgressData {
    if (!userId || userId === 'user_guest' || userId === 'null') {
      return { solvedProblems: [], savedCode: {}, dayStatus: {}, testScores: {} };
    }
    const all = this.getAllProgress();
    if (!all[userId]) {
      all[userId] = {
        solvedProblems: [],
        savedCode: {},
        dayStatus: {},
        testScores: {}
      };
    }
    return all[userId];
  }

  public static saveUserProgress(userId: string, progress: UserProgressData): void {
    if (!userId || userId === 'user_guest' || userId === 'null') return;
    this.ensureDataDirExists();
    const all = this.getAllProgress();
    all[userId] = progress;
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(all, null, 2));
  }

  public static markProblemSolved(userId: string, problemId: string, dayNumber: number, code: string): UserProgressData {
    const progress = this.getUserProgress(userId);
    if (!progress.solvedProblems.includes(problemId)) {
      progress.solvedProblems.push(problemId);
    }
    progress.savedCode[problemId] = code;
    progress.dayStatus[dayNumber] = 'in-progress';
    this.saveUserProgress(userId, progress);
    return progress;
  }

  public static saveUserCode(userId: string, problemId: string, code: string): UserProgressData {
    const progress = this.getUserProgress(userId);
    progress.savedCode[problemId] = code;
    this.saveUserProgress(userId, progress);
    return progress;
  }

  // Community Solutions Methods
  public static getCommunitySolutions(problemId: string): CommunitySolution[] {
    this.ensureDataDirExists();
    try {
      const all: CommunitySolution[] = JSON.parse(fs.readFileSync(SOLUTIONS_FILE, 'utf8'));
      return all
        .filter(s => s.problemId === problemId)
        .sort((a, b) => b.upvotes - a.upvotes);
    } catch {
      return [];
    }
  }

  public static addCommunitySolution(solution: Omit<CommunitySolution, 'id' | 'upvotes' | 'upvotedBy' | 'createdAt'>): CommunitySolution {
    this.ensureDataDirExists();
    const all: CommunitySolution[] = JSON.parse(fs.readFileSync(SOLUTIONS_FILE, 'utf8'));

    const newSol: CommunitySolution = {
      ...solution,
      id: `sol_${Date.now()}`,
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date().toISOString()
    };

    all.push(newSol);
    fs.writeFileSync(SOLUTIONS_FILE, JSON.stringify(all, null, 2));
    return newSol;
  }

  public static upvoteSolution(solutionId: string, userId: string): CommunitySolution {
    this.ensureDataDirExists();
    const all: CommunitySolution[] = JSON.parse(fs.readFileSync(SOLUTIONS_FILE, 'utf8'));
    const target = all.find(s => s.id === solutionId);
    
    if (!target) {
      throw new Error('Solution not found');
    }
    if (target.userId === userId) {
      throw new Error('You cannot upvote your own solution');
    }
    if (target.upvotedBy && target.upvotedBy.includes(userId)) {
      throw new Error('You have already upvoted this solution');
    }

    if (!target.upvotedBy) target.upvotedBy = [];
    target.upvotedBy.push(userId);
    target.upvotes += 1;

    fs.writeFileSync(SOLUTIONS_FILE, JSON.stringify(all, null, 2));
    return target;
  }
}
