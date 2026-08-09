import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DsaService, Problem, ExecutionResponse } from '../../core/services/dsa.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { MonacoEditorComponent } from '../../shared/monaco-editor/monaco-editor.component';

export interface ExamQuestionState {
  problem: Problem;
  userCode: string;
  isLocked: boolean;
  timeLeftSeconds: number;
  initialTimeSeconds: number;
  timerRef?: any;
  testResult?: ExecutionResponse;
  isSaved?: boolean;
}

@Component({
  selector: 'app-interview-test',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MonacoEditorComponent],
  template: `
    <div class="bg-slate-950 min-h-screen text-slate-100 py-6 transition-colors">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- PHASE 1: PRE-TEST LAUNCHER (QUESTIONS HIDDEN BEFORE START) -->
        <div *ngIf="examState === 'launcher'" class="max-w-3xl mx-auto py-10">
          <div class="bg-slate-900 rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden text-center">
            
            <div class="w-20 h-20 rounded-2xl bg-amber-500/10 text-amber-400 text-3xl flex items-center justify-center mx-auto mb-6 border border-amber-500/20 shadow-inner">
              <i class="fa-solid fa-trophy"></i>
            </div>

            <span class="inline-block px-3 py-1 rounded-full bg-amber-400/10 text-amber-400 text-xs font-mono font-bold uppercase tracking-wider mb-3 border border-amber-400/20">
              Day 30 Final Evaluation
            </span>

            <h1 class="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Real Technical Interview Simulation
            </h1>

            <p class="text-slate-400 text-sm leading-relaxed mb-8 max-w-xl mx-auto">
              Simulate a real coding interview with <strong>5 random DSA problems</strong>. Each question has its own individual countdown timer. Solve all questions in a single workspace.
            </p>

            <!-- IMPORTANT WARNING BANNER -->
            <div class="bg-amber-950/40 border border-amber-800/80 rounded-2xl p-4 text-left mb-8 max-w-xl mx-auto">
              <div class="flex gap-3">
                <i class="fa-solid fa-triangle-exclamation text-amber-400 text-lg mt-0.5"></i>
                <div>
                  <h4 class="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide m-0">Important Exam Rule</h4>
                  <p class="text-xs text-amber-200/80 m-0 mt-1">
                    Do <strong>NOT</strong> reload or leave this page during the exam. Reloading will reset your progress. Once a question's individual timer expires, that question locks automatically.
                  </p>
                </div>
              </div>
            </div>

            <!-- RANDOM QUESTIONS SHUFFLE PREVIEW -->
            <div class="bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 max-w-xl mx-auto mb-8">
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide">
                  🎲 Selected Exam Set (5 Questions)
                </span>
                <button (click)="shuffleQuestions()" class="text-xs text-indigo-400 hover:text-indigo-300 font-bold font-mono transition-all flex items-center gap-1">
                  <i class="fa-solid fa-shuffle"></i> Shuffle Questions
                </button>
              </div>

              <div class="space-y-2 text-left">
                <div *ngFor="let q of examQuestions; let i = index" class="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span class="text-xs font-bold text-slate-200">Q{{i+1}}: {{q.problem.title}}</span>
                <div class="flex items-center gap-2">
                  <span [class]="getDifficultyClass(q.problem.difficulty)">{{q.problem.difficulty}}</span>
                  <span class="text-[10px] font-mono text-amber-400 bg-slate-800 px-2 py-0.5 rounded font-bold">
                    {{formatTime(q.initialTimeSeconds)}}
                  </span>
                </div>
              </div>
            </div>

            <!-- Total Exam Time row -->
            <div class="mt-2 flex items-center justify-between px-1">
              <span class="text-[11px] font-mono text-slate-500">Total Exam Duration:</span>
              <span class="text-xs font-mono font-extrabold text-indigo-400">{{totalExamMinutes}} minutes</span>
            </div>
          </div>

            <!-- LAUNCH BUTTON -->
            <button (click)="startExam()" class="btn-primary py-4 px-10 text-base font-bold rounded-2xl shadow-xl shadow-indigo-600/20 hover:scale-105 transition-all">
              <i class="fa-solid fa-play mr-2"></i> Start Mock Exam Now
            </button>
          </div>
        </div>

        <!-- PHASE 2: ALL-IN-ONE EXAM WORKSPACE (ACTIVE EXAM) -->
        <div *ngIf="examState === 'active'" class="space-y-4">
          
          <!-- TOP WORKSPACE BAR -->
          <div class="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            <!-- Question Selector Tabs -->
            <div class="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <button 
                *ngFor="let q of examQuestions; let i = index"
                (click)="selectQuestion(i)"
                [class.bg-indigo-600]="activeQuestionIndex === i"
                [class.text-white]="activeQuestionIndex === i"
                [class.bg-slate-800]="activeQuestionIndex !== i"
                [class.text-slate-300]="activeQuestionIndex !== i"
                class="px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 border border-slate-700/60"
              >
                <span>Q{{i+1}}</span>
                <i *ngIf="q.isLocked" class="fa-solid fa-lock text-rose-400 text-[10px]"></i>
                <i *ngIf="!q.isLocked && q.isSaved" class="fa-solid fa-circle-check text-emerald-400 text-[10px]"></i>
              </button>
            </div>

            <!-- Live Per-Question Timer & Submit Action -->
            <div class="flex items-center gap-4 shrink-0 justify-between">
              
              <!-- Current Question Countdown -->
              <div class="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 flex items-center gap-3">
                <i class="fa-solid fa-stopwatch text-amber-400 text-sm"></i>
                <div>
                  <span class="text-[10px] font-mono uppercase text-slate-400 block font-bold">Q{{activeQuestionIndex + 1}} Timer</span>
                  <span 
                    [class.text-rose-400]="currentQ.timeLeftSeconds <= 120"
                    [class.text-amber-400]="currentQ.timeLeftSeconds > 120"
                    class="text-base font-extrabold font-mono"
                  >
                    {{formatTime(currentQ.timeLeftSeconds)}}
                  </span>
                </div>
              </div>

              <!-- Submit Entire Exam Button — two-step inline confirm (no browser dialog) -->
              <div class="flex items-center gap-2">
                <!-- Step 1: first click shows confirm state -->
                <ng-container *ngIf="!confirmingSubmit">
                  <button (click)="confirmSubmitExam()" class="btn-primary py-2.5 px-5 text-xs bg-emerald-600 hover:bg-emerald-500 shadow-md">
                    <i class="fa-solid fa-paper-plane mr-1.5"></i> Submit Entire Test
                  </button>
                </ng-container>

                <!-- Step 2: confirm bar replaces button -->
                <ng-container *ngIf="confirmingSubmit">
                  <span class="text-xs font-mono text-amber-300 font-bold">Submit all answers?</span>
                  <button (click)="finishExam()" class="btn-primary py-2 px-4 text-xs bg-rose-600 hover:bg-rose-500 shadow-md">
                    <i class="fa-solid fa-check mr-1"></i> Yes, Submit
                  </button>
                  <button (click)="cancelSubmit()" class="py-2 px-4 text-xs font-bold rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 transition-all">
                    Cancel
                  </button>
                </ng-container>
              </div>
            </div>

          </div>

          <!-- SPLIT-PANE IDE WORKSPACE -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <!-- LEFT PANE: PROBLEM STATEMENT -->
            <div class="lg:col-span-5 bg-slate-900 rounded-2xl p-5 border border-slate-800 max-h-[75vh] overflow-y-auto">
              
              <div class="flex items-center justify-between mb-3">
                <span class="text-xs font-mono font-bold text-indigo-400 bg-indigo-950/80 border border-indigo-800 px-2.5 py-1 rounded-md">
                  Question {{activeQuestionIndex + 1}} of 5
                </span>
                <span [class]="getDifficultyClass(currentQ.problem.difficulty)">
                  {{currentQ.problem.difficulty}}
                </span>
              </div>

              <h2 class="text-xl font-extrabold text-white mb-2">{{currentQ.problem.title}}</h2>
              <span class="text-xs font-mono text-slate-400 block mb-4">Pattern: {{currentQ.problem.patternTag}}</span>

              <div class="prose prose-invert max-w-none text-xs text-slate-300 leading-relaxed mb-6 whitespace-pre-line">
                {{currentQ.problem.description}}
              </div>

              <!-- Test Cases Examples -->
              <div class="space-y-3">
                <span class="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wide block">Sample Test Cases:</span>
                <div *ngFor="let tc of currentQ.problem.testCases; let tcIdx = index" class="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
                  <div class="text-slate-400"><strong class="text-slate-300">Input:</strong> {{tc.input}}</div>
                  <div class="text-emerald-400 mt-1"><strong class="text-emerald-300">Expected:</strong> {{tc.expectedOutput}}</div>
                </div>
              </div>

              <div *ngIf="currentQ.isLocked" class="mt-6 p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-xs text-rose-300 font-mono font-bold flex items-center gap-2">
                <i class="fa-solid fa-lock text-rose-400 text-base"></i>
                This question's timer has expired. The editor is now locked.
              </div>

            </div>

            <!-- RIGHT PANE: CODE EDITOR & RUNNER -->
            <div class="lg:col-span-7 bg-slate-900 rounded-2xl p-5 border border-slate-800 flex flex-col justify-between max-h-[75vh]">
              
              <div>
                <div class="flex items-center justify-between mb-2">
                  <span class="text-xs font-mono font-bold text-slate-400">
                    <i class="fa-solid fa-code text-indigo-400 mr-1"></i> Solution Editor (JavaScript)
                  </span>
                  <span *ngIf="currentQ.isSaved" class="text-[11px] font-mono text-emerald-400 font-bold">
                    <i class="fa-solid fa-check mr-1"></i> Code Saved
                  </span>
                </div>

                <div class="h-64 sm:h-80 rounded-xl overflow-hidden border border-slate-800 relative bg-[#0f172a]">
                  <app-monaco-editor 
                    [(value)]="currentQ.userCode" 
                    [language]="'javascript'"
                    [readOnly]="currentQ.isLocked"
                  ></app-monaco-editor>
                </div>
              </div>

              <!-- Output & Test Execution Panel -->
              <div class="mt-4 border-t border-slate-800 pt-4">
                
                <div *ngIf="currentQ.testResult" class="mb-3 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs">
                  <div class="flex items-center justify-between mb-2">
                    <span [class.text-emerald-400]="currentQ.testResult.status === 'ACCEPTED'" [class.text-rose-400]="currentQ.testResult.status !== 'ACCEPTED'" class="font-bold">
                      Status: {{currentQ.testResult.status}}
                    </span>
                    <span class="text-[10px] text-slate-400">{{currentQ.testResult.executionTimeMs}} ms</span>
                  </div>

                  <div *ngFor="let r of currentQ.testResult.testResults" class="text-[11px] text-slate-300">
                    Test case input: {{r.input}} | Expected: {{r.expected}} | Actual: <span [class.text-emerald-400]="r.passed" [class.text-rose-400]="!r.passed">{{r.actual}}</span>
                  </div>
                </div>

                <div class="flex items-center justify-between">
                  <button 
                    (click)="runTestsForCurrentQ()" 
                    [disabled]="currentQ.isLocked || executing" 
                    class="btn-primary text-xs py-2 px-4 bg-slate-800 hover:bg-slate-700 text-white"
                  >
                    <i *ngIf="!executing" class="fa-solid fa-play text-emerald-400 mr-1.5"></i>
                    <i *ngIf="executing" class="fa-solid fa-circle-notch fa-spin mr-1.5"></i>
                    Run Tests
                  </button>

                  <button 
                    (click)="saveAnswerForCurrentQ()" 
                    [disabled]="currentQ.isLocked" 
                    class="btn-primary text-xs py-2 px-4 bg-indigo-600 hover:bg-indigo-500"
                  >
                    <i class="fa-solid fa-save mr-1.5"></i> Save Answer
                  </button>
                </div>

              </div>

            </div>

          </div>

        </div>

        <!-- PHASE 3: FINAL SCORECARD & DETAILED REPORT -->
        <div *ngIf="examState === 'results'" class="max-w-4xl mx-auto py-8">
          <div class="bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl">
            
            <div class="text-center mb-8">
              <div class="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 text-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
                <i class="fa-solid fa-clipboard-check"></i>
              </div>
              <h2 class="text-3xl font-extrabold text-white mb-1">Exam Scorecard Report</h2>
              <p class="text-xs text-slate-400 font-mono">Completed in {{formatTime(totalTimeSpentSeconds)}}</p>
            </div>

            <!-- Big Score Meter -->
            <div class="bg-slate-950 p-6 rounded-2xl border border-slate-800 text-center mb-8 max-w-sm mx-auto">
              <span class="text-xs font-mono uppercase font-bold text-slate-400 block mb-1">Final Score</span>
              <span class="text-4xl font-extrabold font-mono text-emerald-400">{{score}} / 5 Accepted</span>
              <span class="text-xs font-mono text-indigo-400 block mt-2 font-bold">{{ (score / 5) * 100 }}% Accuracy Grade</span>
            </div>

            <!-- Per Question Breakdown List -->
            <div class="space-y-4 mb-8">
              <h3 class="text-xs font-mono font-bold text-slate-400 uppercase tracking-wide">Question Performance Breakdown:</h3>

              <div *ngFor="let q of examQuestions; let i = index" class="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-bold text-white">Q{{i+1}}: {{q.problem.title}}</span>
                  <span 
                    [class.bg-emerald-950]="q.testResult?.status === 'ACCEPTED'"
                    [class.text-emerald-400]="q.testResult?.status === 'ACCEPTED'"
                    [class.bg-rose-950]="q.testResult?.status !== 'ACCEPTED'"
                    [class.text-rose-400]="q.testResult?.status !== 'ACCEPTED'"
                    class="px-2.5 py-1 rounded-md text-xs font-mono font-bold"
                  >
                    {{q.testResult?.status || 'UNANSWERED'}}
                  </span>
                </div>
                <pre class="text-[11px] p-3 bg-slate-900 text-emerald-300 rounded-xl font-mono overflow-x-auto m-0 leading-relaxed">{{q.userCode}}</pre>
              </div>
            </div>

            <!-- RETAKE BUTTON -->
            <div class="text-center">
              <button (click)="retakeExam()" class="btn-primary py-3.5 px-8 text-sm font-bold rounded-2xl">
                <i class="fa-solid fa-rotate-right mr-2"></i> Take Fresh Mock Test
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  `
})
export class InterviewTestComponent implements OnInit, OnDestroy {
  examState: 'launcher' | 'active' | 'results' = 'launcher';
  
  allCurriculumProblems: Problem[] = [];
  examQuestions: ExamQuestionState[] = [];
  activeQuestionIndex = 0;
  
  executing = false;
  totalTimeSpentSeconds = 0;
  score = 0;
  overallTimerRef: any;
  confirmingSubmit = false;  // two-step submit guard
  // Admin-configured pool: { id, minutes }[] — shuffle picks ONLY from these
  configQuestions: { id: string; minutes: number }[] = [];
  defaultMinutesPerQ = 20;

  constructor(
    private dsaService: DsaService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadAllProblemsAndInitialize();
  }

  ngOnDestroy() {
    this.clearAllTimers();
  }

  loadAllProblemsAndInitialize() {
    this.dsaService.fetchCurriculum('').subscribe(() => {
      const curriculum = this.dsaService.curriculumSignal();
      const list: Problem[] = [];
      for (const day of curriculum) {
        for (const p of day.problems) {
          list.push(p);
        }
      }
      this.allCurriculumProblems = list;

      // Load admin-configured question pool with per-question time limits
      this.dsaService.getMockTestConfig().subscribe({
        next: (config) => {
          // Store the admin-saved pool (id + minutes per question)
          this.configQuestions = (config?.questions && config.questions.length > 0)
            ? config.questions
            : [];
          this.shuffleQuestions();
        },
        error: () => {
          this.configQuestions = [];
          this.shuffleQuestions();
        }
      });
    });
  }

  shuffleQuestions() {
    // Build the pool: only problems that the admin has saved in mock test config
    let pool: { problem: Problem; minutes: number }[] = [];

    if (this.configQuestions.length > 0) {
      // Map curriculum problems by id for fast lookup
      const byId = new Map(this.allCurriculumProblems.map(p => [p.id, p]));

      for (const cfg of this.configQuestions) {
        const prob = byId.get(cfg.id);
        if (prob) pool.push({ problem: prob, minutes: cfg.minutes });
      }
    }

    // Fallback: if admin config is empty or no matches, use all curriculum problems
    if (pool.length === 0) {
      pool = this.allCurriculumProblems.map(p => ({ problem: p, minutes: this.defaultMinutesPerQ }));
    }

    // Shuffle and pick up to 5 from the admin-curated pool
    const shuffled = pool.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(5, shuffled.length));

    this.examQuestions = selected.map(({ problem: p, minutes }) => {
      const timeSecs = minutes * 60;
      return {
        problem: p,
        userCode: p.starterCode,
        isLocked: false,
        timeLeftSeconds: timeSecs,
        initialTimeSeconds: timeSecs
      };
    });
  }

  get totalExamMinutes(): number {
    return this.examQuestions.reduce((sum, q) => sum + Math.ceil(q.initialTimeSeconds / 60), 0);
  }

  startExam() {
    this.examState = 'active';
    this.activeQuestionIndex = 0;
    this.totalTimeSpentSeconds = 0;

    // Start Question 1 timer
    this.startQuestionTimer(0);

    // Overall test timer
    this.overallTimerRef = setInterval(() => {
      this.totalTimeSpentSeconds++;
    }, 1000);
  }

  selectQuestion(index: number) {
    if (index === this.activeQuestionIndex) return;

    // Pause timer of current question if not locked
    if (this.currentQ && this.currentQ.timerRef) {
      clearInterval(this.currentQ.timerRef);
    }

    this.activeQuestionIndex = index;
    
    // Start timer for newly selected question if not locked
    if (!this.currentQ.isLocked) {
      this.startQuestionTimer(index);
    }
  }

  get currentQ(): ExamQuestionState {
    return this.examQuestions[this.activeQuestionIndex];
  }

  startQuestionTimer(index: number) {
    const q = this.examQuestions[index];
    if (q.timerRef) clearInterval(q.timerRef);

    q.timerRef = setInterval(() => {
      if (q.timeLeftSeconds > 0) {
        q.timeLeftSeconds--;
      } else {
        q.isLocked = true;
        clearInterval(q.timerRef);
      }
    }, 1000);
  }

  runTestsForCurrentQ() {
    if (this.currentQ.isLocked) return;

    this.executing = true;
    const loadId = this.toast.loading('Running test cases...');
    this.dsaService.executeCode({
      code: this.currentQ.userCode,
      testCases: this.currentQ.problem.testCases
    }).subscribe({
      next: (res) => {
        this.executing = false;
        this.currentQ.testResult = res;
        this.toast.dismiss(loadId);
        if (res.status === 'ACCEPTED') {
          this.toast.success('All test cases passed! ✅');
        } else {
          this.toast.error(`${res.status} — check your output and try again.`);
        }
      },
      error: () => {
        this.executing = false;
        this.toast.dismiss(loadId);
        this.toast.error('Execution failed. Check your code for syntax errors.');
      }
    });
  }

  saveAnswerForCurrentQ() {
    if (this.currentQ.isLocked) return;
    this.currentQ.isSaved = true;
    this.toast.success(`Q${this.activeQuestionIndex + 1} answer saved! ✔`);
    this.runTestsForCurrentQ();
  }

  confirmSubmitExam() {
    const unanswered = this.examQuestions.filter(q => !q.isSaved && !q.isLocked).length;
    if (unanswered > 0) {
      this.toast.info(`${unanswered} question(s) not yet saved. Review or confirm submit.`, 4000);
    }
    this.confirmingSubmit = true;
  }

  cancelSubmit() {
    this.confirmingSubmit = false;
  }

  finishExam() {
    this.confirmingSubmit = false;
    this.clearAllTimers();
    this.examState = 'results';

    const loadId = this.toast.loading('Evaluating all answers and saving results...');

    // Run all questions through executor in parallel — wait for ALL before scoring
    const evalObservables = this.examQuestions.map(q =>
      this.dsaService.executeCode({ code: q.userCode, testCases: q.problem.testCases })
    );

    forkJoin(evalObservables).subscribe({
      next: (results) => {
        let acceptedCount = 0;
        results.forEach((res, idx) => {
          this.examQuestions[idx].testResult = res;
          if (res.status === 'ACCEPTED') acceptedCount++;
        });
        this.score = acceptedCount;

        this.toast.dismiss(loadId);
        this.toast.success(`Test submitted! Score: ${acceptedCount}/${this.examQuestions.length} 🎉`);

        // Save to backend with correct score
        const user = this.authService.currentUserSignal();
        const userId = user ? user.id : 'user_guest';

        const saveId = this.toast.loading('Saving exam report to your profile...');
        this.dsaService.submitMockTest({
          userId,
          score: acceptedCount,
          totalQuestions: this.examQuestions.length,
          timeSpentSeconds: this.totalTimeSpentSeconds,
          answersJson: this.examQuestions.map((q, i) => ({
            problemId: q.problem.id,
            title: q.problem.title,
            code: q.userCode,
            status: results[i]?.status || 'SUBMITTED'
          }))
        }).subscribe({
          next: () => {
            this.toast.dismiss(saveId);
            this.toast.success('Results saved to your profile!');
          },
          error: () => {
            this.toast.dismiss(saveId);
            this.toast.error('Could not save to profile (you may be a guest).');
          }
        });
      },
      error: () => {
        this.toast.dismiss(loadId);
        this.toast.error('Evaluation failed. Please check your connection.');
      }
    });
  }

  retakeExam() {
    this.clearAllTimers();
    this.shuffleQuestions();
    this.examState = 'launcher';
  }

  clearAllTimers() {
    if (this.overallTimerRef) clearInterval(this.overallTimerRef);
    for (const q of this.examQuestions) {
      if (q.timerRef) clearInterval(q.timerRef);
    }
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'Easy': return 'badge-easy';
      case 'Medium': return 'badge-medium';
      case 'Hard': return 'badge-hard';
      default: return 'badge-easy';
    }
  }
}
