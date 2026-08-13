import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DsaService } from '../../core/services/dsa.service';

@Component({
  selector: 'app-profile-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl relative transition-colors max-h-[90vh] overflow-y-auto">
        
        <!-- Close Button -->
        <button (click)="close.emit()" class="absolute top-5 right-5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 text-lg">
          <i class="fa-solid fa-xmark"></i>
        </button>

        <!-- User Profile Header -->
        <div *ngIf="authService.currentUserSignal() as user" class="text-center mb-6">
          <img [src]="user.avatarUrl" class="w-16 h-16 rounded-full border-2 border-indigo-500 mx-auto mb-3 shadow-md">
          <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white m-0 flex items-center justify-center gap-2">
            {{user.name}}
            <span *ngIf="user.role === 'admin'" class="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">ADMIN</span>
          </h2>
          <p class="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-bold mt-1">&#64;{{user.username}}</p>
          <p *ngIf="user.email || (user.name && user.name.includes('@'))" class="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium mt-1">
            <i class="fa-solid fa-envelope mr-1 text-slate-400"></i>{{user.email || user.name}}
          </p>

          <!-- Login Streak Display Card -->
          <div class="mt-4 bg-gradient-to-r from-amber-500 to-rose-600 text-white p-4 rounded-2xl shadow-lg flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-3xl">🔥</span>
              <div class="text-left">
                <span class="text-[10px] font-mono uppercase font-bold tracking-widest text-amber-100 block">Current Login Streak</span>
                <span class="text-xl font-extrabold font-mono">{{user.loginStreak || 1}} Days Active</span>
              </div>
            </div>
            <span class="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-mono font-bold">Keep it up!</span>
          </div>
        </div>

        <!-- MOCK EXAM HISTORY SECTION -->
        <div class="border-t border-slate-200 dark:border-slate-800 pt-5 mt-4">
          <h3 class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center justify-between">
            <span><i class="fa-solid fa-trophy text-amber-500 mr-1.5"></i> My Mock Exam History</span>
            <span class="text-[10px] font-mono font-normal">({{mockHistory.length}} Attempts)</span>
          </h3>

          <div *ngIf="mockHistory.length === 0" class="text-center py-4 text-xs text-slate-400 font-mono">
            No past mock exam records found yet. Take your first test on Day 30!
          </div>

          <div *ngIf="mockHistory.length > 0" class="space-y-2.5 max-h-48 overflow-y-auto pr-1">
            <div 
              *ngFor="let attempt of mockHistory" 
              (click)="selectedAttempt = attempt"
              class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/70 hover:border-indigo-500 cursor-pointer transition-all flex items-center justify-between"
            >
              <div>
                <div class="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                  <span>Score: <strong class="text-emerald-600 dark:text-emerald-400 font-mono">{{attempt.score}} / {{attempt.totalQuestions}}</strong></span>
                  <span class="text-[10px] font-mono bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded font-bold">
                    {{ (attempt.score / attempt.totalQuestions) * 100 }}%
                  </span>
                </div>
                <span class="text-[10px] font-mono text-slate-400 block mt-0.5">
                  Time: {{formatTime(attempt.timeSpentSeconds)}} | {{attempt.createdAt | date:'short'}}
                </span>
              </div>
              <span class="text-xs text-indigo-600 dark:text-indigo-400 font-bold font-mono">View Details &gt;</span>
            </div>
          </div>
        </div>

        <!-- DETAILED SCORECARD MODAL POPUP -->
        <div *ngIf="selectedAttempt" class="mt-4 p-4 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <span class="text-xs font-mono font-bold text-amber-400">Exam Details ({{selectedAttempt.createdAt | date:'short'}})</span>
            <button (click)="selectedAttempt = null" class="text-xs text-slate-400 hover:text-white">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </div>

          <div *ngFor="let ans of selectedAttempt.answersJson; let idx = index" class="p-2.5 bg-slate-950 rounded-xl text-xs space-y-1">
            <div class="flex items-center justify-between">
              <strong class="text-slate-200">Q{{idx+1}}: {{ans.title || ans.problemId}}</strong>
              <span [class.text-emerald-400]="ans.status === 'ACCEPTED'" [class.text-rose-400]="ans.status !== 'ACCEPTED'" class="font-mono font-bold text-[10px]">
                {{ans.status}}
              </span>
            </div>
            <pre class="text-[10px] p-2 bg-slate-900 text-emerald-300 rounded font-mono overflow-x-auto m-0 leading-relaxed">{{ans.code}}</pre>
          </div>
        </div>

        <!-- PASSWORD CHANGE FORM -->
        <div class="border-t border-slate-200 dark:border-slate-800 pt-5 mt-4">
          <h3 class="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
            <i class="fa-solid fa-key text-indigo-500 mr-1"></i> Change Account Password
          </h3>

          <div *ngIf="successMsg" class="mb-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 p-2.5 rounded-xl text-xs font-medium">
            {{successMsg}}
          </div>
          <div *ngIf="errorMsg" class="mb-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 p-2.5 rounded-xl text-xs font-medium">
            {{errorMsg}}
          </div>

          <form (ngSubmit)="updatePassword()" class="space-y-3">
            <div>
              <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Current Password</label>
              <input 
                type="password" 
                [(ngModel)]="oldPassword" 
                name="oldPassword"
                placeholder="••••••••"
                required
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-sm text-slate-900 dark:text-white outline-none font-medium"
              >
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">New Password</label>
              <input 
                type="password" 
                [(ngModel)]="newPassword" 
                name="newPassword"
                placeholder="••••••••"
                required
                class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2 text-sm text-slate-900 dark:text-white outline-none font-medium"
              >
            </div>

            <button type="submit" [disabled]="loading" class="btn-primary w-full justify-center py-2 text-xs mt-1">
              <i *ngIf="!loading" class="fa-solid fa-shield-halved"></i>
              <i *ngIf="loading" class="fa-solid fa-circle-notch fa-spin"></i>
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  `
})
export class ProfileModalComponent implements OnInit {
  @Output() close = new EventEmitter<void>();

  mockHistory: any[] = [];
  selectedAttempt: any = null;

  oldPassword = '';
  newPassword = '';
  loading = false;
  successMsg = '';
  errorMsg = '';

  constructor(
    public authService: AuthService,
    private dsaService: DsaService
  ) {}

  ngOnInit() {
    this.loadMockHistory();
  }

  loadMockHistory() {
    const user = this.authService.currentUserSignal();
    if (user) {
      this.dsaService.getMockTestHistory(user.id).subscribe(history => {
        this.mockHistory = history;
      });
    }
  }

  updatePassword() {
    this.successMsg = '';
    this.errorMsg = '';
    const user = this.authService.currentUserSignal();
    if (!user) return;

    if (!this.oldPassword || !this.newPassword) {
      this.errorMsg = 'Please enter both current and new password.';
      return;
    }

    this.loading = true;
    this.dsaService.updatePassword(user.id, this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.successMsg = '✅ Password updated successfully!';
        this.oldPassword = '';
        this.newPassword = '';
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error || 'Failed to update password.';
      }
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
}
