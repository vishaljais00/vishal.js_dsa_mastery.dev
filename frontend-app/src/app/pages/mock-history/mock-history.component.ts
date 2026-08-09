import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DsaService } from '../../core/services/dsa.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mock-history',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-slate-50 dark:bg-slate-950 min-h-screen py-10 transition-colors">
      <div class="max-w-4xl mx-auto px-4">

        <!-- Page Header -->
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/" class="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
            <i class="fa-solid fa-arrow-left text-sm"></i>
          </a>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white m-0">My Mock Exam History</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              {{ attempts.length }} attempt{{ attempts.length !== 1 ? 's' : '' }} recorded
            </p>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 gap-4">
          <i class="fa-solid fa-circle-notch fa-spin text-indigo-500 text-3xl"></i>
          <p class="text-xs font-mono text-slate-400">Loading your exam history...</p>
        </div>

        <!-- Not Logged In -->
        <div *ngIf="!loading && !isLoggedIn" class="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div class="w-14 h-14 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-500 text-xl flex items-center justify-center mx-auto mb-4">
            <i class="fa-solid fa-lock"></i>
          </div>
          <h2 class="text-lg font-extrabold text-slate-800 dark:text-white mb-2">Login Required</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">You need to be logged in to view your exam history.</p>
          <a routerLink="/" class="btn-primary text-sm inline-flex items-center gap-2">
            <i class="fa-solid fa-home"></i> Go to Home
          </a>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && isLoggedIn && attempts.length === 0" class="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
          <div class="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-500 text-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-200 dark:border-indigo-800">
            <i class="fa-solid fa-clipboard-list"></i>
          </div>
          <h2 class="text-lg font-extrabold text-slate-800 dark:text-white mb-2">No Attempts Yet</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">Take your first mock interview test to see your results here.</p>
          <a routerLink="/interview-test" class="btn-primary text-sm inline-flex items-center gap-2">
            <i class="fa-solid fa-play"></i> Start Mock Test
          </a>
        </div>

        <!-- Attempts List -->
        <div *ngIf="!loading && isLoggedIn && attempts.length > 0" class="space-y-4">
          <div
            *ngFor="let attempt of attempts; let i = index"
            class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all"
          >
            <!-- Attempt Header Row (always visible, clickable) -->
            <button
              (click)="toggleAttempt(i)"
              class="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
            >
              <div class="flex items-center gap-4">
                <!-- Attempt Index Badge -->
                <div class="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-extrabold font-mono shrink-0"
                  [class.bg-emerald-100]="getAccuracy(attempt) >= 60"
                  [class.text-emerald-700]="getAccuracy(attempt) >= 60"
                  [class.dark:bg-emerald-950]="getAccuracy(attempt) >= 60"
                  [class.dark:text-emerald-400]="getAccuracy(attempt) >= 60"
                  [class.bg-rose-100]="getAccuracy(attempt) < 60"
                  [class.text-rose-700]="getAccuracy(attempt) < 60"
                  [class.dark:bg-rose-950]="getAccuracy(attempt) < 60"
                  [class.dark:text-rose-400]="getAccuracy(attempt) < 60"
                >
                  #{{ attempts.length - i }}
                </div>

                <div>
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="text-sm font-extrabold text-slate-900 dark:text-white font-mono">
                      Score: {{ attempt.score }} / {{ attempt.totalQuestions }}
                    </span>
                    <!-- Grade Badge -->
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold"
                      [class.bg-emerald-100]="getAccuracy(attempt) >= 60"
                      [class.text-emerald-700]="getAccuracy(attempt) >= 60"
                      [class.dark:bg-emerald-950]="getAccuracy(attempt) >= 60"
                      [class.dark:text-emerald-400]="getAccuracy(attempt) >= 60"
                      [class.bg-rose-100]="getAccuracy(attempt) < 60"
                      [class.text-rose-700]="getAccuracy(attempt) < 60"
                      [class.dark:bg-rose-950]="getAccuracy(attempt) < 60"
                      [class.dark:text-rose-400]="getAccuracy(attempt) < 60"
                    >{{ getAccuracy(attempt) }}%</span>
                  </div>
                  <div class="flex items-center gap-3 mt-0.5">
                    <span class="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <i class="fa-solid fa-clock text-[9px]"></i>
                      {{ formatDuration(attempt.timeSpentSeconds) }}
                    </span>
                    <span class="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                      <i class="fa-solid fa-calendar text-[9px]"></i>
                      {{ formatDate(attempt.createdAt) }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Expand Icon -->
              <i class="fa-solid fa-chevron-down text-slate-400 text-xs transition-transform"
                [class.rotate-180]="expandedIndex === i">
              </i>
            </button>

            <!-- Expanded Answer Detail Panel -->
            <div *ngIf="expandedIndex === i" class="border-t border-slate-100 dark:border-slate-800">

              <!-- Score Progress Bar -->
              <div class="px-5 pt-4 pb-2">
                <div class="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                  <span>Accuracy</span>
                  <span class="font-bold" [class.text-emerald-500]="getAccuracy(attempt) >= 60" [class.text-rose-500]="getAccuracy(attempt) < 60">{{ getAccuracy(attempt) }}%</span>
                </div>
                <div class="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div class="h-full rounded-full transition-all"
                    [class.bg-emerald-500]="getAccuracy(attempt) >= 60"
                    [class.bg-rose-500]="getAccuracy(attempt) < 60"
                    [style.width]="getAccuracy(attempt) + '%'">
                  </div>
                </div>
              </div>

              <!-- Per-Question Answer Cards -->
              <div class="p-5 space-y-4">
                <h3 class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                  Question-by-Question Breakdown
                </h3>

                <div *ngFor="let ans of getAnswers(attempt); let qi = index"
                  class="rounded-xl border overflow-hidden"
                  [ngClass]="{
                    'border-emerald-300 dark:border-emerald-800': ans.status === 'ACCEPTED',
                    'border-rose-300 dark:border-rose-800': ans.status !== 'ACCEPTED'
                  }"
                >
                  <!-- Question Title Bar -->
                  <div class="flex items-center justify-between px-4 py-2.5"
                    [ngClass]="{
                      'bg-emerald-50 dark:bg-emerald-950/40': ans.status === 'ACCEPTED',
                      'bg-rose-50 dark:bg-rose-950/40': ans.status !== 'ACCEPTED'
                    }"
                  >
                    <span class="text-xs font-bold text-slate-800 dark:text-white">
                      Q{{ qi + 1 }}: {{ ans.title || ans.problemId }}
                    </span>
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full"
                      [ngClass]="{
                        'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300': ans.status === 'ACCEPTED',
                        'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300': ans.status !== 'ACCEPTED'
                      }"
                    >
                      <i class="fa-solid mr-1" [class.fa-check]="ans.status === 'ACCEPTED'" [class.fa-xmark]="ans.status !== 'ACCEPTED'"></i>
                      {{ ans.status || 'NOT_ATTEMPTED' }}
                    </span>
                  </div>

                  <!-- Code Block -->
                  <div class="bg-slate-950 p-4 overflow-x-auto">
                    <pre class="text-emerald-300 text-[11px] font-mono leading-relaxed m-0 whitespace-pre-wrap break-words">{{ ans.code || '// No code submitted' }}</pre>
                  </div>
                </div>

                <!-- Back to Top of List -->
                <div class="text-center pt-2">
                  <button (click)="expandedIndex = -1" class="text-xs font-mono text-slate-400 hover:text-indigo-500 transition-all flex items-center gap-1.5 mx-auto">
                    <i class="fa-solid fa-chevron-up text-[10px]"></i> Collapse
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Take Another Test CTA -->
          <div class="text-center pt-4">
            <a routerLink="/interview-test" class="btn-primary text-sm inline-flex items-center gap-2">
              <i class="fa-solid fa-rotate-right"></i> Take Another Mock Test
            </a>
          </div>
        </div>

      </div>
    </div>
  `
})
export class MockHistoryComponent implements OnInit {
  attempts: any[] = [];
  loading = true;
  expandedIndex = -1;
  isLoggedIn = false;

  constructor(
    private dsaService: DsaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserSignal();
    if (!user) {
      this.loading = false;
      this.isLoggedIn = false;
      return;
    }
    this.isLoggedIn = true;
    this.dsaService.getMockTestHistory(user.id).subscribe({
      next: (data) => {
        this.attempts = data || [];
        this.loading = false;
      },
      error: () => {
        this.attempts = [];
        this.loading = false;
      }
    });
  }

  toggleAttempt(i: number) {
    this.expandedIndex = this.expandedIndex === i ? -1 : i;
  }

  getAccuracy(attempt: any): number {
    if (!attempt.totalQuestions) return 0;
    return Math.round((attempt.score / attempt.totalQuestions) * 100);
  }

  getAnswers(attempt: any): any[] {
    try {
      // Backend already parses answersJson on the server side
      const raw = attempt.answersJson;
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string') return JSON.parse(raw);
      return [];
    } catch {
      return [];
    }
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0m 0s';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}m ${s}s`;
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' });
  }
}
