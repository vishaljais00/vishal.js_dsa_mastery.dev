import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DsaService } from '../../core/services/dsa.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="bg-slate-50 dark:bg-slate-950 min-h-screen py-10 transition-colors">
      <div class="max-w-4xl mx-auto px-4">

        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
          <a routerLink="/" class="w-9 h-9 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all shadow-sm">
            <i class="fa-solid fa-arrow-left text-sm"></i>
          </a>
          <div>
            <h1 class="text-2xl font-extrabold text-slate-900 dark:text-white m-0 flex items-center gap-2">
              🏆 Community Leaderboard
            </h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Ranked by total solved DSA problems &amp; active daily login streaks
            </p>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="flex flex-col items-center justify-center py-20 gap-4">
          <i class="fa-solid fa-circle-notch fa-spin text-indigo-500 text-3xl"></i>
          <p class="text-xs font-mono text-slate-400">Fetching rankings...</p>
        </div>

        <!-- Leaderboard Table -->
        <div *ngIf="!loading" class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-100/70 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <th class="py-3.5 px-6">Rank</th>
                  <th class="py-3.5 px-6">Learner</th>
                  <th class="py-3.5 px-6 text-center">Problems Solved</th>
                  <th class="py-3.5 px-6 text-right">Streak</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-300">
                <tr *ngFor="let user of users" 
                    [ngClass]="{'bg-indigo-50/40 dark:bg-indigo-950/30': user.id === currentUserId}"
                    class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  
                  <!-- Rank Badge -->
                  <td class="py-4 px-6 font-bold font-mono">
                    <span *ngIf="user.rank === 1" class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-slate-900 font-black shadow-sm">🥇</span>
                    <span *ngIf="user.rank === 2" class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black shadow-sm">🥈</span>
                    <span *ngIf="user.rank === 3" class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-700 text-white font-black shadow-sm">🥉</span>
                    <span *ngIf="user.rank > 3" class="text-slate-400 dark:text-slate-500 font-bold ml-2">#{{ user.rank }}</span>
                  </td>

                  <!-- User Profile -->
                  <td class="py-4 px-6">
                    <div class="flex items-center gap-3">
                      <img [src]="user.avatarUrl" class="w-9 h-9 rounded-full border border-indigo-200 dark:border-indigo-800 bg-slate-100 dark:bg-slate-800 shrink-0">
                      <div>
                        <div class="font-extrabold text-slate-900 dark:text-white font-mono flex items-center gap-2">
                          {{ user.username }}
                          <span *ngIf="user.id === currentUserId" class="px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-[10px] font-sans">You</span>
                        </div>
                        <span class="text-[11px] text-slate-400 font-mono block">{{ user.name }}</span>
                      </div>
                    </div>
                  </td>

                  <!-- Solved Count -->
                  <td class="py-4 px-6 text-center">
                    <span class="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 font-bold font-mono text-xs">
                      <i class="fa-solid fa-check text-[10px]"></i> {{ user.solvedCount }}
                    </span>
                  </td>

                  <!-- Streak -->
                  <td class="py-4 px-6 text-right font-mono font-bold text-slate-900 dark:text-white">
                    <span *ngIf="user.loginStreak > 0" class="text-amber-500 flex items-center justify-end gap-1">
                      🔥 {{ user.loginStreak }} days
                    </span>
                    <span *ngIf="!user.loginStreak || user.loginStreak === 0" class="text-slate-400 dark:text-slate-600 font-normal">
                      -
                    </span>
                  </td>

                </tr>

                <tr *ngIf="users.length === 0">
                  <td colspan="4" class="text-center py-10 text-slate-400 font-mono">No users found on leaderboard.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  users: any[] = [];
  loading = true;
  currentUserId = '';

  constructor(
    private dsaService: DsaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const u = this.authService.currentUserSignal();
    this.currentUserId = u ? u.id : '';

    this.dsaService.getLeaderboard().subscribe({
      next: (res) => {
        this.users = res || [];
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.loading = false;
      }
    });
  }
}
