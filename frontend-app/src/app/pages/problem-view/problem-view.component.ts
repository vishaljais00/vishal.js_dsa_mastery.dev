import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DsaService, Problem, ExecutionResponse, CommunitySolution } from '../../core/services/dsa.service';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { MonacoEditorComponent } from '../../shared/monaco-editor/monaco-editor.component';

@Component({
  selector: 'app-problem-view',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AuthModalComponent, MonacoEditorComponent],
  template: `
    <div *ngIf="loading" class="flex items-center justify-center h-96">
      <div class="text-center">
        <i class="fa-solid fa-circle-notch fa-spin text-indigo-600 text-3xl mb-3"></i>
        <p class="text-sm font-mono text-slate-500 dark:text-slate-400 font-semibold">Loading IDE Workspace...</p>
      </div>
    </div>

    <div *ngIf="!loading && problem" class="ide-container">
      
      <!-- LEFT PANE: Description vs Community Solutions Tabs -->
      <div class="bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between h-full overflow-hidden transition-colors">
        
        <!-- Tab Navigation Bar -->
        <div class="bg-slate-100 dark:bg-slate-950 p-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div class="flex items-center gap-1">
            <button 
              (click)="activeTab = 'description'"
              [class.bg-white]="activeTab === 'description'"
              [class.dark:bg-slate-800]="activeTab === 'description'"
              [class.text-indigo-700]="activeTab === 'description'"
              [class.dark:text-indigo-300]="activeTab === 'description'"
              [class.shadow-sm]="activeTab === 'description'"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2"
            >
              <i class="fa-solid fa-file-lines"></i> Problem Statement
            </button>

            <button 
              (click)="activeTab = 'community'"
              [class.bg-white]="activeTab === 'community'"
              [class.dark:bg-slate-800]="activeTab === 'community'"
              [class.text-indigo-700]="activeTab === 'community'"
              [class.dark:text-indigo-300]="activeTab === 'community'"
              [class.shadow-sm]="activeTab === 'community'"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-2"
            >
              <i class="fa-solid fa-users text-purple-500"></i> Community Methods 
              <span class="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full text-[10px] font-mono">{{communitySolutions.length}}</span>
            </button>
          </div>

          <a routerLink="/" class="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 font-mono px-2">
            <i class="fa-solid fa-arrow-left"></i> Roadmap
          </a>
        </div>

        <!-- TAB 1: PROBLEM DESCRIPTION -->
        <div *ngIf="activeTab === 'description'" class="p-6 sm:p-8 overflow-y-auto flex-1 flex flex-col justify-between">
          <div>
            <div class="flex flex-wrap items-center gap-3 mb-4">
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white m-0">{{problem.title}}</h1>
              <span [class]="getDifficultyClass(problem.difficulty)">{{problem.difficulty}}</span>
              <span class="badge-pattern">{{problem.patternTag}}</span>
            </div>

            <!-- Problem Description Text -->
            <div class="prose prose-slate max-w-none text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-6 whitespace-pre-line bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 font-medium">
              {{problem.description}}
            </div>

            <!-- Test Case Examples -->
            <div class="mb-6">
              <h3 class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Sample Test Cases:</h3>
              <div *ngFor="let test of problem.testCases; let i = index" class="mb-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
                <div class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-1.5">Example {{i + 1}}:</div>
                <div class="text-xs font-mono text-slate-800 dark:text-slate-200">
                  <strong class="text-slate-500 dark:text-slate-400">Input:</strong> <code class="bg-amber-100/80 dark:bg-amber-950 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-semibold">{{test.input}}</code>
                </div>
                <div class="text-xs font-mono text-slate-800 dark:text-slate-200 mt-1.5">
                  <strong class="text-slate-500 dark:text-slate-400">Expected Output:</strong> <code class="bg-emerald-100/80 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 px-1.5 py-0.5 rounded font-semibold">{{test.expectedOutput}}</code>
                </div>
              </div>
            </div>

            <!-- Hint Section (collapsible / revealable) -->
            <div *ngIf="problem.solutionHint" class="mb-6">
              <button 
                (click)="showHint = !showHint" 
                class="px-3.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold flex items-center gap-2 hover:bg-amber-100 transition-all"
              >
                <i class="fa-solid fa-lightbulb text-amber-500"></i>
                <span>{{ showHint ? 'Hide Hint' : '💡 Show Solution Hint' }}</span>
              </button>

              <div *ngIf="showHint" class="mt-2 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-900 p-4 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 font-medium">
                <strong class="text-indigo-700 dark:text-indigo-300">Hint:</strong> {{problem.solutionHint}}
              </div>
            </div>

            <!-- Personal Notes Section -->
            <div class="mb-6 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <i class="fa-solid fa-note-sticky text-indigo-500"></i> My Personal Notes
                </span>
                <span *ngIf="noteSavedMsg" class="text-[11px] font-mono text-emerald-500 font-bold">
                  {{ noteSavedMsg }}
                </span>
              </div>
              <textarea
                [(ngModel)]="userNote"
                rows="3"
                class="w-full bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-200 p-3 rounded-xl border border-slate-200 dark:border-slate-700 outline-none resize-none font-sans"
                placeholder="Jot down your key takeaways, time complexity, or edge cases here..."
              ></textarea>
              <div class="flex justify-end mt-2">
                <button 
                  (click)="saveNote()" 
                  [disabled]="savingNote"
                  class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition-all flex items-center gap-1"
                >
                  <i class="fa-solid fa-floppy-disk text-[10px]"></i> Save Note
                </button>
              </div>
            </div>
          </div>

          <!-- Logged Out Guest Warning vs Solved Status -->
          <div>
            <div *ngIf="!authService.currentUserSignal()" class="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 p-4 rounded-2xl flex items-center justify-between mb-2">
              <span class="text-xs text-amber-800 dark:text-amber-300 font-medium">
                <i class="fa-solid fa-lock text-amber-600 mr-1"></i> Log in to save code & track your 30-day progress.
              </span>
              <button (click)="showAuthModal = true" class="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                Log In / Register
              </button>
            </div>

            <div *ngIf="problem.isSolved && authService.currentUserSignal()" class="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 p-4 rounded-2xl flex items-center justify-between shadow-sm">
              <span class="text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-2">
                <i class="fa-solid fa-circle-check text-emerald-600 text-base"></i> Problem Solved!
              </span>
              <span class="text-[11px] font-mono text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-100 dark:bg-emerald-900 px-2.5 py-0.5 rounded-full">Saved in User Profile</span>
            </div>
          </div>
        </div>

        <!-- TAB 2: COMMUNITY SOLUTIONS & METHODS -->
        <div *ngIf="activeTab === 'community'" class="p-6 sm:p-8 overflow-y-auto flex-1">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-lg font-bold text-slate-900 dark:text-white m-0">Community Solutions & Approaches</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">See how other learners solved this problem in JavaScript.</p>
            </div>
          </div>

          <div *ngIf="upvoteErrorMsg" class="mb-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-3 rounded-xl text-xs font-medium">
            {{upvoteErrorMsg}}
          </div>

          <div *ngIf="communitySolutions.length === 0" class="text-center py-12 text-slate-400 text-xs font-mono">
            No community solutions shared yet. Log in & be the first to share your solution!
          </div>

          <div class="space-y-6">
            <div *ngFor="let sol of communitySolutions" class="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm">
              <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-3">
                  <img [src]="sol.avatarUrl" class="w-8 h-8 rounded-full border border-indigo-300">
                  <div>
                    <span class="text-xs font-bold text-slate-900 dark:text-white block font-mono">
                      {{sol.username}}
                      <span *ngIf="isOwnSolution(sol)" class="text-[10px] text-indigo-600 dark:text-indigo-400 font-normal">(You)</span>
                    </span>
                    <span class="text-[10px] text-slate-400 font-mono">⚡ {{sol.runtimeMs}} ms</span>
                  </div>
                </div>

                <button 
                  (click)="upvote(sol)"
                  [disabled]="isOwnSolution(sol) || hasAlreadyUpvoted(sol)"
                  [title]="getUpvoteTooltip(sol)"
                  [class.bg-emerald-100]="hasAlreadyUpvoted(sol)"
                  [class.dark:bg-emerald-950]="hasAlreadyUpvoted(sol)"
                  [class.text-emerald-700]="hasAlreadyUpvoted(sol)"
                  [class.dark:text-emerald-400]="hasAlreadyUpvoted(sol)"
                  [class.opacity-50]="isOwnSolution(sol)"
                  class="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs hover:scale-105"
                >
                  <i class="fa-solid fa-thumbs-up text-amber-500"></i>
                  <span>{{sol.upvotes}}</span>
                </button>
              </div>

              <!-- Solution Code Block -->
              <pre class="bg-slate-900 text-emerald-300 p-4 rounded-xl font-mono text-xs overflow-x-auto m-0 leading-relaxed border border-slate-800">{{sol.code}}</pre>

              <button (click)="code = sol.code" class="mt-3 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                <i class="fa-solid fa-copy"></i> Load code into editor
              </button>
            </div>
          </div>
        </div>

      </div>

      <!-- RIGHT PANE: Code Editor & Console Runner -->
      <div class="bg-slate-50 dark:bg-[#0f172a] flex flex-col justify-between h-full overflow-hidden transition-colors">
        
        <!-- Editor Header Actions -->
        <div class="bg-slate-100 dark:bg-[#1e293b] px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between shrink-0 transition-colors">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-rose-500"></span>
            <span class="w-3 h-3 rounded-full bg-amber-500"></span>
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span class="text-xs font-mono text-slate-700 dark:text-slate-300 font-semibold ml-2">solution.js</span>
          </div>

          <div class="flex items-center gap-2">
            <button (click)="resetCode()" class="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold border border-slate-300 dark:border-slate-600 transition-all flex items-center gap-1.5">
              <i class="fa-solid fa-rotate-left"></i> Reset Stub
            </button>
            
            <button (click)="runCode()" [disabled]="executing" class="px-3.5 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-emerald-700 dark:text-emerald-400 border border-slate-300 dark:border-slate-600 text-xs font-bold transition-all flex items-center gap-1.5">
              <i *ngIf="!executing" class="fa-solid fa-play"></i>
              <i *ngIf="executing" class="fa-solid fa-circle-notch fa-spin"></i>
              Run Tests
            </button>

            <button (click)="submitAndShare()" [disabled]="executing" class="btn-primary text-xs px-4 py-1.5">
              <i class="fa-solid fa-paper-plane"></i> Submit & Share
            </button>
          </div>
        </div>

        <!-- Interactive Monaco JS Code Editor Area -->
        <div class="flex-1 overflow-hidden bg-slate-50 dark:bg-[#0f172a] relative">
          <app-monaco-editor 
            [(value)]="code" 
            [language]="'javascript'"
            [theme]="themeService.themeSignal() === 'dark' ? 'vs-dark' : 'vs'"
          ></app-monaco-editor>
        </div>

        <!-- Console & Test Output Drawer -->
        <div class="bg-white dark:bg-[#090d16] border-t border-slate-200 dark:border-slate-800 max-h-72 overflow-y-auto p-4 transition-colors">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold text-slate-400 uppercase">Execution Output</span>
              <span *ngIf="executionResult" [class]="getStatusBadgeClass(executionResult.status)">
                {{ executionResult.status }}
              </span>
              <span *ngIf="executionResult" class="text-[11px] font-mono text-slate-400">
                ⚡ {{ executionResult.executionTimeMs }} ms
              </span>
            </div>
            
            <span *ngIf="sharedSuccessMsg" class="text-xs font-mono text-emerald-400 font-bold animate-pulse">
              {{sharedSuccessMsg}}
            </span>
          </div>

          <!-- If no run executed yet -->
          <div *ngIf="!executionResult" class="text-xs font-mono text-slate-500 py-4 text-center">
            Click "Run Tests" or "Submit & Share" to evaluate your JavaScript function.
          </div>

          <!-- Test Cases Result Breakdown -->
          <div *ngIf="executionResult">
            <div *ngIf="executionResult.errorDetails" class="bg-rose-950/60 border border-rose-800 p-3 rounded-lg text-xs font-mono text-rose-300 mb-3">
              {{ executionResult.errorDetails }}
            </div>

            <!-- Console Logs Output -->
            <div *ngIf="executionResult.consoleLogs && executionResult.consoleLogs.length > 0" class="mb-3">
              <span class="text-[11px] font-mono text-slate-400 block mb-1">Console Logs:</span>
              <div class="bg-black/60 p-3 rounded-lg font-mono text-xs text-amber-300 border border-slate-800 space-y-1">
                <div *ngFor="let log of executionResult.consoleLogs">> {{log}}</div>
              </div>
            </div>

            <!-- Test Cases Table -->
            <div class="space-y-2">
              <div 
                *ngFor="let test of executionResult.testResults; let idx = index"
                class="p-3 rounded-xl border text-xs font-mono bg-slate-900/80 border-slate-800"
              >
                <div class="flex items-center justify-between mb-1.5">
                  <span class="font-bold" [class.text-emerald-400]="test.passed" [class.text-rose-400]="!test.passed">
                    Test Case {{idx + 1}}: {{test.passed ? 'PASSED ✅' : 'FAILED ❌'}}
                  </span>
                </div>
                <div class="text-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-2 mt-1">
                  <div>Input: <span class="text-amber-300">{{test.input}}</span></div>
                  <div>Expected: <span class="text-emerald-300">{{test.expected}}</span></div>
                  <div>Actual: <span [class.text-emerald-300]="test.passed" [class.text-rose-300]="!test.passed">{{test.actual}}</span></div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>

    <!-- Auth Modal Dialog -->
    <app-auth-modal *ngIf="showAuthModal" (close)="showAuthModal = false"></app-auth-modal>
  `,
  styles: [`
    textarea {
      tab-size: 2;
    }
  `]
})
export class ProblemViewComponent implements OnInit {
  problemId: string = '';
  problem?: Problem;
  dayNumber: number = 1;
  code: string = '';
  loading: boolean = true;
  executing: boolean = false;
  executionResult?: ExecutionResponse;
  
  activeTab: 'description' | 'community' = 'description';
  communitySolutions: CommunitySolution[] = [];
  sharedSuccessMsg: string = '';
  upvoteErrorMsg: string = '';
  showAuthModal: boolean = false;

  showHint: boolean = false;
  userNote: string = '';
  savingNote: boolean = false;
  noteSavedMsg: string = '';

  constructor(
    private route: ActivatedRoute,
    private dsaService: DsaService,
    public authService: AuthService,
    public themeService: ThemeService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.problemId = params['id'];
      this.loadProblem();
      this.loadCommunitySolutions();
      this.loadNote();
    });
  }

  loadNote() {
    const currentUser = this.authService.currentUserSignal();
    if (!currentUser || !this.problemId) return;
    this.dsaService.getNote(this.problemId, currentUser.id).subscribe({
      next: (res) => { this.userNote = res.note || ''; }
    });
  }

  saveNote() {
    const currentUser = this.authService.currentUserSignal();
    if (!currentUser) {
      this.showAuthModal = true;
      return;
    }
    this.savingNote = true;
    this.dsaService.saveNote(this.problemId, currentUser.id, this.userNote).subscribe({
      next: () => {
        this.savingNote = false;
        this.noteSavedMsg = '✓ Note Saved!';
        setTimeout(() => { this.noteSavedMsg = ''; }, 3000);
      },
      error: () => {
        this.savingNote = false;
      }
    });
  }

  loadProblem() {
    this.loading = true;
    const currentUser = this.authService.currentUserSignal();
    const userId = currentUser ? currentUser.id : '';

    this.dsaService.getProblemById(this.problemId, userId).subscribe({
      next: (data) => {
        this.problem = data.problem;
        this.dayNumber = data.dayNumber;
        this.code = data.problem.userCode || data.problem.starterCode;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  loadCommunitySolutions() {
    this.dsaService.getCommunitySolutions(this.problemId).subscribe(sols => {
      this.communitySolutions = sols;
    });
  }

  resetCode() {
    if (this.problem) {
      this.code = this.problem.starterCode;
      this.executionResult = undefined;
    }
  }

  runCode() {
    if (!this.problem) return;
    this.executing = true;
    const currentUser = this.authService.currentUserSignal();
    const userId = currentUser ? currentUser.id : '';

    this.dsaService.executeCode({
      code: this.code,
      testCases: this.problem.testCases,
      problemId: this.problem.id,
      dayNumber: this.dayNumber,
      userId
    }).subscribe({
      next: (res) => {
        this.executionResult = res;
        this.executing = false;
        if (res.status === 'ACCEPTED' && this.problem && currentUser) {
          this.problem.isSolved = true;
        }
      },
      error: (err) => {
        this.executing = false;
        this.executionResult = {
          status: 'RUNTIME_ERROR',
          executionTimeMs: 0,
          consoleLogs: [],
          testResults: [],
          errorDetails: err.message || 'Failed to connect to Code Runner API backend'
        };
      }
    });
  }

  submitAndShare() {
    const currentUser = this.authService.currentUserSignal();
    if (!currentUser) {
      this.showAuthModal = true;
      return;
    }
    if (!this.problem) return;

    this.executing = true;
    this.sharedSuccessMsg = '';

    this.dsaService.executeCode({
      code: this.code,
      testCases: this.problem.testCases,
      problemId: this.problem.id,
      dayNumber: this.dayNumber,
      userId: currentUser.id
    }).subscribe({
      next: (res) => {
        this.executionResult = res;
        this.executing = false;

        if (res.status === 'ACCEPTED' && this.problem) {
          this.problem.isSolved = true;

          // Share solution with community
          this.dsaService.shareSolution({
            problemId: this.problem.id,
            userId: currentUser.id,
            username: currentUser.username,
            avatarUrl: currentUser.avatarUrl,
            code: this.code,
            runtimeMs: res.executionTimeMs,
            patternTag: this.problem.patternTag
          }).subscribe({
            next: () => {
              this.sharedSuccessMsg = '✅ Solution Saved & Shared with Community!';
              this.loadCommunitySolutions();
            },
            error: (err) => {
              this.sharedSuccessMsg = err.error?.error || 'Failed to share solution';
            }
          });
        }
      },
      error: (err) => {
        this.executing = false;
      }
    });
  }

  upvote(sol: CommunitySolution) {
    this.upvoteErrorMsg = '';
    const currentUser = this.authService.currentUserSignal();
    if (!currentUser) {
      this.showAuthModal = true;
      return;
    }

    if (sol.userId === currentUser.id) {
      this.upvoteErrorMsg = 'You cannot upvote your own solution.';
      return;
    }

    if (sol.upvotedBy && sol.upvotedBy.includes(currentUser.id)) {
      this.upvoteErrorMsg = 'You have already upvoted this solution once.';
      return;
    }

    this.dsaService.upvoteSolution(sol.id, currentUser.id).subscribe({
      next: (updated) => {
        sol.upvotes = updated.upvotes;
        if (!sol.upvotedBy) sol.upvotedBy = [];
        sol.upvotedBy.push(currentUser.id);
      },
      error: (err) => {
        this.upvoteErrorMsg = err.error?.error || 'Could not upvote solution';
      }
    });
  }

  isOwnSolution(sol: CommunitySolution): boolean {
    const currentUser = this.authService.currentUserSignal();
    return currentUser ? sol.userId === currentUser.id : false;
  }

  hasAlreadyUpvoted(sol: CommunitySolution): boolean {
    const currentUser = this.authService.currentUserSignal();
    return currentUser && sol.upvotedBy ? sol.upvotedBy.includes(currentUser.id) : false;
  }

  getUpvoteTooltip(sol: CommunitySolution): string {
    if (this.isOwnSolution(sol)) return 'You cannot upvote your own solution';
    if (this.hasAlreadyUpvoted(sol)) return 'You have already upvoted this solution';
    return 'Upvote this solution';
  }

  getDifficultyClass(difficulty: string): string {
    switch (difficulty) {
      case 'Easy': return 'badge-easy';
      case 'Medium': return 'badge-medium';
      case 'Hard': return 'badge-hard';
      default: return 'badge-easy';
    }
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'badge-easy';
      case 'WRONG_ANSWER': return 'badge-medium';
      default: return 'badge-hard';
    }
  }
}
