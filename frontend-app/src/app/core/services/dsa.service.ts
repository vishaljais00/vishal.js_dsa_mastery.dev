import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface TestCase {
  input: string;
  expectedOutput: string;
  hidden?: boolean;
}

export interface Problem {
  id: string;
  category?: 'DSA' | 'JS';
  dayNumber: number;
  weekNumber: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  targetGoal?: string;
  starterCode: string;
  userCode?: string;
  testCases: TestCase[];
  solutionHint?: string;
  patternTag: string;
  isSolved?: boolean;
  isNew?: boolean;
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

export interface DayPlan {
  dayNumber: number;
  weekNumber: number;
  title: string;
  isWeeklyTest?: boolean;
  isInterviewTest?: boolean;
  learnTopics: string[];
  codeSnippets?: { title: string; code: string }[];
  targetSummary?: string;
  timeLimitMinutes?: number;
  passingCriteria?: string;
  status?: 'not-started' | 'in-progress' | 'completed';
  problems: Problem[];
}

export interface ExecutionResponse {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'RUNTIME_ERROR';
  executionTimeMs: number;
  consoleLogs: string[];
  testResults: {
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    error?: string;
  }[];
  errorDetails?: string;
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

@Injectable({
  providedIn: 'root'
})
export class DsaService {
  private apiUrl = environment.apiUrl;

  public curriculumSignal = signal<DayPlan[]>([]);
  public solvedCountSignal = signal<number>(0);
  public totalProblemsSignal = signal<number>(0);

  constructor(private http: HttpClient) {}

  fetchCurriculum(userId: string = '', category: string = ''): Observable<any> {
    const url = `${this.apiUrl}/curriculum?userId=${encodeURIComponent(userId)}&category=${encodeURIComponent(category)}`;
    return this.http.get<any>(url).pipe(
      tap((res: any) => {
        if (res && res.curriculum) {
          this.curriculumSignal.set(res.curriculum);
          this.solvedCountSignal.set(res.solvedCount || 0);
          this.totalProblemsSignal.set(res.totalProblems || 0);
        }
      })
    );
  }

  getProblemById(id: string, userId: string = ''): Observable<{ dayNumber: number; problem: Problem }> {
    return this.http.get<{ dayNumber: number; problem: Problem }>(`${this.apiUrl}/problem/${id}?userId=${encodeURIComponent(userId)}`);
  }

  executeCode(payload: {
    code: string;
    testCases: TestCase[];
    problemId?: string;
    dayNumber?: number;
    userId?: string;
  }): Observable<ExecutionResponse> {
    return this.http.post<ExecutionResponse>(`${this.apiUrl}/execute`, payload).pipe(
      tap((res: ExecutionResponse) => {
        if (res.status === 'ACCEPTED' && payload.problemId && payload.userId) {
          this.solvedCountSignal.update(c => c + 1);
        }
      })
    );
  }

  saveCode(userId: string, problemId: string, code: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/save-code`, { userId, problemId, code });
  }

  updatePassword(userId: string, oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/update-password`, { userId, oldPassword, newPassword });
  }

  // --- MOCK TEST APIs ---
  submitMockTest(payload: {
    userId: string;
    score: number;
    totalQuestions: number;
    timeSpentSeconds: number;
    answersJson: any;
  }): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/mock-test/submit`, payload);
  }

  getMockTestHistory(userId: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/mock-test/history/${encodeURIComponent(userId)}`);
  }

  // Returns { questions: [{id, minutes}] } from backend
  getMockTestConfig(): Observable<{ questions: { id: string; minutes: number }[] }> {
    return this.http.get<{ questions: { id: string; minutes: number }[] }>(`${this.apiUrl}/admin/mock-test`);
  }

  // Saves per-question config to backend
  updateMockTestConfig(questions: { id: string; minutes: number }[]): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/mock-test`, { questions });
  }

  getCommunitySolutions(problemId: string): Observable<CommunitySolution[]> {
    return this.http.get<CommunitySolution[]>(`${this.apiUrl}/solutions/${problemId}`);
  }

  shareSolution(payload: {
    problemId: string;
    userId: string;
    username: string;
    avatarUrl: string;
    code: string;
    runtimeMs: number;
    patternTag: string;
  }): Observable<CommunitySolution> {
    return this.http.post<CommunitySolution>(`${this.apiUrl}/solutions`, payload);
  }

  upvoteSolution(solutionId: string, userId: string): Observable<CommunitySolution> {
    return this.http.post<CommunitySolution>(`${this.apiUrl}/solutions/${solutionId}/upvote`, { userId });
  }

  // --- ADMIN APIs ---
  addAdminProblem(payload: any): Observable<Problem> {
    return this.http.post<Problem>(`${this.apiUrl}/admin/problems`, payload);
  }

  updateAdminProblem(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/problems/${id}`, payload);
  }

  deleteAdminProblem(id: string, adminUserId: string): Observable<any> {
    return this.http.request<any>('delete', `${this.apiUrl}/admin/problems/${id}`, {
      body: { adminUserId }
    });
  }

  getUsersActivity(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/admin/users-activity`);
  }

  updateMockTest(problemIds: string[], timeLimitMinutes: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/admin/mock-test`, { problemIds, timeLimitMinutes });
  }

  // --- LEADERBOARD & NOTES APIs ---
  getLeaderboard(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/leaderboard`);
  }

  getNote(problemId: string, userId: string): Observable<{ note: string }> {
    return this.http.get<{ note: string }>(`${this.apiUrl}/notes/${problemId}?userId=${userId}`);
  }

  saveNote(problemId: string, userId: string, note: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/notes/${problemId}`, { userId, note });
  }

  // --- GUIDEBOOK APIs ---
  getGuidebookTopics(category?: 'DSA' | 'JS', userId: string = ''): Observable<GuidebookTopic[]> {
    let url = `${this.apiUrl}/guidebook/topics?userId=${encodeURIComponent(userId)}`;
    if (category) url += `&category=${encodeURIComponent(category)}`;
    return this.http.get<GuidebookTopic[]>(url);
  }

  getGuidebookSubtopic(id: string, userId: string = ''): Observable<GuidebookSubtopic> {
    return this.http.get<GuidebookSubtopic>(`${this.apiUrl}/guidebook/subtopic/${id}?userId=${encodeURIComponent(userId)}`);
  }

  toggleSubtopicProgress(userId: string, subtopicId: string): Observable<{ success: boolean; isRead: boolean }> {
    return this.http.post<{ success: boolean; isRead: boolean }>(`${this.apiUrl}/guidebook/progress/toggle`, { userId, subtopicId });
  }

  addGuidebookTopic(payload: { adminUserId: string; category: 'DSA' | 'JS'; title: string; description?: string; icon?: string; orderIndex?: number }): Observable<GuidebookTopic> {
    return this.http.post<GuidebookTopic>(`${this.apiUrl}/admin/guidebook/topic`, payload);
  }

  updateGuidebookTopic(id: string, payload: { adminUserId: string; category?: 'DSA' | 'JS'; title?: string; description?: string; icon?: string; orderIndex?: number }): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/guidebook/topic/${id}`, payload);
  }

  deleteGuidebookTopic(id: string, adminUserId: string): Observable<any> {
    return this.http.request<any>('delete', `${this.apiUrl}/admin/guidebook/topic/${id}`, { body: { adminUserId } });
  }

  addGuidebookSubtopic(payload: {
    adminUserId: string;
    topicId: string;
    title: string;
    description?: string;
    contentMarkdown: string;
    coverImageUrl?: string;
    videoUrl?: string;
    codeExample?: string;
    isPublished?: boolean;
    linkedProblemIds?: string[];
    orderIndex?: number;
  }): Observable<GuidebookSubtopic> {
    return this.http.post<GuidebookSubtopic>(`${this.apiUrl}/admin/guidebook/subtopic`, payload);
  }

  updateGuidebookSubtopic(id: string, payload: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/admin/guidebook/subtopic/${id}`, payload);
  }

  deleteGuidebookSubtopic(id: string, adminUserId: string): Observable<any> {
    return this.http.request<any>('delete', `${this.apiUrl}/admin/guidebook/subtopic/${id}`, { body: { adminUserId } });
  }
}
