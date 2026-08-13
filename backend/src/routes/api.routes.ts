import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import { ExecutionService } from '../services/execution.service';
import { MysqlStorageService } from '../services/mysql-storage.service';
import { CacheService } from '../services/cache.service';

const googleOAuthClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || '305407856293-5gdm6e769q8jdphd1tmq6c18gmfa9cio.apps.googleusercontent.com');

const router = Router();

// --- RATE LIMITERS ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per 15 minutes
  message: { error: 'Too many requests from this IP. Please try again after 15 minutes.' }
});

const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 15, // limit auth/execute attempts to 15 per minute
  message: { error: 'Too many login or execution requests. Please wait a minute before retrying.' }
});

// Apply global rate limiter to all API endpoints
router.use(globalLimiter);

// --- AUTH ROUTES ---
router.post('/auth/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await MysqlStorageService.loginUser(username, password);
    res.json({ token: `token_${user.id}`, user });
  } catch (err: any) {
    res.status(401).json({ error: err.message });
  }
});

router.post('/auth/register', authLimiter, async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }
    const user = await MysqlStorageService.registerUser(username, email, password);
    res.json({ token: `token_${user.id}`, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/auth/google', authLimiter, async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Google ID token is required' });
    }

    const ticket = await googleOAuthClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID || '305407856293-5gdm6e769q8jdphd1tmq6c18gmfa9cio.apps.googleusercontent.com'
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(400).json({ error: 'Invalid Google token payload' });
    }

    const { sub: googleId, email, name, picture } = payload;
    const username = email ? email.split('@')[0] : `user_${googleId.slice(0, 8)}`;

    const user = await MysqlStorageService.upsertGoogleUser({
      id: `google_${googleId}`,
      username,
      name: name || username,
      email: email || '',
      avatarUrl: picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`
    });

    res.json({ token: `token_${user.id}`, user });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Google authentication failed' });
  }
});


router.post('/auth/update-password', async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    if (!userId || !oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required password fields' });
    }
    await MysqlStorageService.updatePassword(userId, oldPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- FORGOT PASSWORD OTP ROUTES ---
router.post('/auth/forgot-password', authLimiter, async (req, res) => {
  try {
    const { emailOrUsername } = req.body;
    if (!emailOrUsername) {
      return res.status(400).json({ error: 'Username or Email is required' });
    }
    await MysqlStorageService.createPasswordResetOTP(emailOrUsername);
    res.json({ success: true, message: 'Password reset OTP code sent to your registered email.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/auth/reset-password', authLimiter, async (req, res) => {
  try {
    const { emailOrUsername, otpCode, newPassword } = req.body;
    if (!emailOrUsername || !otpCode || !newPassword) {
      return res.status(400).json({ error: 'All fields (username, OTP code, new password) are required.' });
    }
    await MysqlStorageService.resetPasswordWithOTP(emailOrUsername, otpCode, newPassword);
    res.json({ success: true, message: 'Password reset successful! You can now log in with your new password.' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- CURRICULUM & PROBLEM ROUTES (CACHED) ---
router.get('/curriculum', async (req, res) => {
  try {
    const userId = (req.query.userId as string) || '';
    const category = (req.query.category as string) || '';
    const cacheKey = `curriculum:${userId || 'guest'}:${category || 'all'}`;

    // Check cache
    const cachedData = await CacheService.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const result = await MysqlStorageService.getCurriculum(userId);
    // If category specified, filter returned problems
    if (category && category !== 'ALL') {
      result.curriculum = result.curriculum.map((day: any) => ({
        ...day,
        problems: day.problems.filter((p: any) => (p.category || 'DSA') === category)
      })).filter((day: any) => day.problems.length > 0);
    }

    await CacheService.set(cacheKey, JSON.stringify(result), 300); // 5 min TTL
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/problem/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || '';
    const result = await MysqlStorageService.getProblem(id, userId);
    res.json(result);
  } catch (err: any) {
    res.status(404).json({ error: err.message });
  }
});

// --- CODE EXECUTION & UPSERT SAVE ROUTES ---
router.post('/execute', authLimiter, async (req, res) => {
  try {
    const { code, testCases, problemId, dayNumber, userId } = req.body;
    if (!code) {
      return res.status(400).json({ error: 'Code is required' });
    }

    const casesToRun = testCases && testCases.length > 0 ? testCases : [];
    const result = ExecutionService.runCode(code, casesToRun);

    const isSolved = result.status === 'ACCEPTED';

    // Upsert code into MySQL database
    if (userId && userId !== 'user_guest' && userId !== 'null' && problemId) {
      await MysqlStorageService.upsertProgress(userId, problemId, isSolved, code);
      // Invalidate user curriculum cache on progress update
      await CacheService.del(`curriculum:${userId}`);
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/save-code', async (req, res) => {
  try {
    const { userId, problemId, code } = req.body;
    if (!userId || userId === 'user_guest') {
      return res.status(401).json({ error: 'User must be logged in to save code' });
    }
    await MysqlStorageService.upsertProgress(userId, problemId, false, code);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- MOCK TEST RESULTS ROUTES ---
router.post('/mock-test/submit', async (req, res) => {
  try {
    const { userId, score, totalQuestions, timeSpentSeconds, answersJson } = req.body;
    if (!userId || userId === 'user_guest') {
      return res.status(401).json({ error: 'Log in to save mock exam results' });
    }
    const result = await MysqlStorageService.saveMockTestResult({
      userId,
      score: score || 0,
      totalQuestions: totalQuestions || 5,
      timeSpentSeconds: timeSpentSeconds || 0,
      answersJson: answersJson || {}
    });
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/mock-test/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const history = await MysqlStorageService.getMockTestHistory(userId);
    res.json(history);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- COMMUNITY SOLUTIONS ROUTES ---
router.get('/solutions/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const solutions = await MysqlStorageService.getCommunitySolutions(problemId);
    res.json(solutions);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/solutions', async (req, res) => {
  try {
    const { problemId, userId, username, avatarUrl, code, runtimeMs, patternTag } = req.body;
    if (!userId || userId === 'user_guest') {
      return res.status(401).json({ error: 'You must be logged in to share solutions' });
    }
    const newSol = await MysqlStorageService.addCommunitySolution({
      problemId,
      userId,
      username: username || 'Learner',
      avatarUrl: avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Learner',
      code,
      runtimeMs: runtimeMs || 0,
      patternTag: patternTag || 'JavaScript Solution'
    });
    res.json(newSol);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/solutions/:id/upvote', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    if (!userId || userId === 'user_guest') {
      return res.status(401).json({ error: 'You must be logged in to upvote solutions' });
    }
    const updated = await MysqlStorageService.upvoteSolution(id, userId);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- ADMIN PANEL ROUTES ---
router.post('/admin/problems', async (req, res) => {
  try {
    const { adminUserId, category, title, dayNumber, weekNumber, difficulty, patternTag, description, starterCode, testCases, solutionHint } = req.body;
    if (!adminUserId) {
      return res.status(403).json({ error: 'Access Denied: Admin authorization required' });
    }
    if (!title || !dayNumber || !weekNumber || !starterCode || !testCases || testCases.length === 0) {
      return res.status(400).json({ error: 'Missing required problem parameters' });
    }
    const newProb = await MysqlStorageService.createProblem({
      category: category || 'DSA',
      title,
      dayNumber: Number(dayNumber),
      weekNumber: Number(weekNumber),
      difficulty: difficulty || 'Easy',
      patternTag: patternTag || 'General',
      description: description || '',
      starterCode,
      testCases: testCases || [],
      solutionHint: solutionHint || ''
    });
    res.json(newProb);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/admin/users-activity', async (req, res) => {
  try {
    const users = await MysqlStorageService.getAllUsersActivity();
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/admin/mock-test', async (req, res) => {
  try {
    const config = await MysqlStorageService.getMockTestConfig();
    res.json(config); // Returns { questions: [{id, minutes}], totalMinutes }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/admin/mock-test', async (req, res) => {
  try {
    const { questions } = req.body;
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'questions array is required' });
    }
    const updated = await MysqlStorageService.updateMockTestConfig(questions);
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- ADMIN: EDIT PROBLEM ---
router.put('/admin/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUserId, category, title, description, difficulty, patternTag, solutionHint, testCases } = req.body;
    if (!adminUserId) return res.status(403).json({ error: 'Admin authorization required' });
    await MysqlStorageService.updateProblem(id, { category, title, description, difficulty, patternTag, solutionHint, testCases });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- ADMIN: DELETE PROBLEM ---
router.delete('/admin/problems/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUserId } = req.body;
    if (!adminUserId) return res.status(403).json({ error: 'Admin authorization required' });
    await MysqlStorageService.deleteProblem(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- PUBLIC GUIDEBOOK ROUTES ---
router.get('/guidebook/topics', async (req, res) => {
  try {
    const category = (req.query.category as any) || undefined;
    const userId = (req.query.userId as string) || '';
    const topics = await MysqlStorageService.getGuidebookTopics(category, userId);
    res.json(topics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/guidebook/subtopic/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.query.userId as string) || '';
    const subtopic = await MysqlStorageService.getGuidebookSubtopic(id, userId);
    if (!subtopic) return res.status(404).json({ error: 'Subtopic not found' });
    res.json(subtopic);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/guidebook/progress/toggle', async (req, res) => {
  try {
    const { userId, subtopicId } = req.body;
    if (!userId || userId === 'user_guest') {
      return res.status(401).json({ error: 'Log in to track reading progress' });
    }
    const isRead = await MysqlStorageService.toggleSubtopicReadStatus(userId, subtopicId);
    res.json({ success: true, isRead });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- ADMIN GUIDEBOOK CMS ROUTES ---
router.post('/admin/guidebook/topic', async (req, res) => {
  try {
    const { adminUserId, category, title, description, icon, orderIndex } = req.body;
    if (!adminUserId) return res.status(403).json({ error: 'Admin authorization required' });
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const topic = await MysqlStorageService.createGuidebookTopic({
      category: category || 'JS',
      title,
      description: description || '',
      icon: icon || 'book',
      orderIndex: Number(orderIndex || 0)
    });
    res.json(topic);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/admin/guidebook/topic/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUserId, category, title, description, icon, orderIndex } = req.body;
    if (!adminUserId) return res.status(403).json({ error: 'Admin authorization required' });

    await MysqlStorageService.updateGuidebookTopic(id, { category, title, description, icon, orderIndex: orderIndex !== undefined ? Number(orderIndex) : undefined });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/admin/guidebook/topic/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUserId } = req.body;
    if (!adminUserId) return res.status(403).json({ error: 'Admin authorization required' });

    await MysqlStorageService.deleteGuidebookTopic(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/admin/guidebook/subtopic', async (req, res) => {
  try {
    const { adminUserId, topicId, title, description, contentMarkdown, coverImageUrl, videoUrl, codeExample, isPublished, linkedProblemIds, orderIndex } = req.body;
    if (!adminUserId) return res.status(403).json({ error: 'Admin authorization required' });
    if (!topicId || !title || !contentMarkdown) {
      return res.status(400).json({ error: 'Topic ID, Title, and Content Markdown are required' });
    }

    const subtopic = await MysqlStorageService.createGuidebookSubtopic({
      topicId,
      title,
      description: description || '',
      contentMarkdown,
      coverImageUrl: coverImageUrl || '',
      videoUrl: videoUrl || '',
      codeExample: codeExample || '',
      isPublished: isPublished !== undefined ? isPublished : true,
      linkedProblemIds: linkedProblemIds || [],
      orderIndex: Number(orderIndex || 0)
    });
    res.json(subtopic);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/admin/guidebook/subtopic/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUserId, title, description, contentMarkdown, coverImageUrl, videoUrl, codeExample, isPublished, linkedProblemIds, orderIndex } = req.body;
    if (!adminUserId) return res.status(403).json({ error: 'Admin authorization required' });

    await MysqlStorageService.updateGuidebookSubtopic(id, {
      title,
      description,
      contentMarkdown,
      coverImageUrl,
      videoUrl,
      codeExample,
      isPublished,
      linkedProblemIds,
      orderIndex: orderIndex !== undefined ? Number(orderIndex) : undefined
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/admin/guidebook/subtopic/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminUserId } = req.body;
    if (!adminUserId) return res.status(403).json({ error: 'Admin authorization required' });

    await MysqlStorageService.deleteGuidebookSubtopic(id);
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- LEADERBOARD (CACHED) ---
router.get('/leaderboard', async (req, res) => {
  try {
    const cacheKey = 'leaderboard';
    const cached = await CacheService.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    const data = await MysqlStorageService.getLeaderboard();
    await CacheService.set(cacheKey, JSON.stringify(data), 60); // 60s TTL
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- NOTES (per user per problem) ---
router.get('/notes/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = (req.query.userId as string) || '';
    if (!userId || userId === 'user_guest') return res.json({ note: '' });
    const note = await MysqlStorageService.getNote(userId, problemId);
    res.json({ note });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/notes/:problemId', async (req, res) => {
  try {
    const { problemId } = req.params;
    const { userId, note } = req.body;
    if (!userId || userId === 'user_guest') return res.status(401).json({ error: 'Login required to save notes' });
    await MysqlStorageService.saveNote(userId, problemId, note || '');
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- MOCK TEST HISTORY ---
router.get('/mock-history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const data = await MysqlStorageService.getMockTestHistory(userId);
    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

