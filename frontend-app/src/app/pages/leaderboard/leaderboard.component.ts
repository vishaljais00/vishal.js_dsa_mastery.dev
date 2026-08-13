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
      <div class="max-w-6xl mx-auto px-4">

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

        <!-- Main Content Grid -->
        <div *ngIf="!loading" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <!-- Leaderboard Table (Main Panel) -->
          <div class="lg:col-span-2 space-y-3">
            <h2 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">🏆 Top 10 Leaders</h2>
            <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
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
                      <td colspan="4" class="text-center py-10 text-slate-400 font-mono">No active learners on the leaderboard yet.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Your Standing Card (Sidebar) -->
          <div class="lg:col-span-1 space-y-3">
            <h2 class="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider font-mono">🎯 Your Standing</h2>
            
            <div class="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col items-center text-center transition-colors">
              <div *ngIf="currentUserStats" class="w-full flex flex-col items-center">
                <img [src]="currentUserStats.avatarUrl" class="w-16 h-16 rounded-full border-2 border-indigo-500 bg-slate-100 dark:bg-slate-800 shadow-md mb-3 shrink-0">
                <h3 class="text-base font-extrabold text-slate-900 dark:text-white font-mono leading-tight mb-0.5">
                  {{ currentUserStats.username }}
                </h3>
                <span class="text-[11px] text-slate-400 dark:text-slate-500 font-mono mb-4">{{ currentUserStats.name }}</span>

                <!-- Rank Badge -->
                <div class="mb-4">
                  <span *ngIf="currentUserStats.rank === 1" class="px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-700 dark:text-amber-400 border border-amber-400/30 text-xs font-black font-mono flex items-center gap-1.5 shadow-sm">
                    🥇 Rank #1
                  </span>
                  <span *ngIf="currentUserStats.rank === 2" class="px-4 py-1.5 rounded-full bg-slate-400/20 text-slate-700 dark:text-slate-300 border border-slate-400/30 text-xs font-black font-mono flex items-center gap-1.5 shadow-sm">
                    🥈 Rank #2
                  </span>
                  <span *ngIf="currentUserStats.rank === 3" class="px-4 py-1.5 rounded-full bg-amber-700/20 text-amber-800 dark:text-amber-400 border border-amber-700/30 text-xs font-black font-mono flex items-center gap-1.5 shadow-sm">
                    🥉 Rank #3
                  </span>
                  <span *ngIf="currentUserStats.rank > 3" class="px-4 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60 text-xs font-extrabold font-mono flex items-center gap-1.5 shadow-sm">
                    Rank #{{ currentUserStats.rank }}
                  </span>
                </div>

                <!-- Stats Grid -->
                <div class="grid grid-cols-2 gap-4 w-full mt-2">
                  <div class="bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3 flex flex-col items-center">
                    <span class="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 mb-0.5">Problems</span>
                    <span class="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                      <i class="fa-solid fa-check mr-0.5"></i> {{ currentUserStats.solvedCount }}
                    </span>
                  </div>
                  <div class="bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-100 dark:border-slate-800/80 p-3 flex flex-col items-center">
                    <span class="text-[10px] uppercase font-mono text-slate-400 dark:text-slate-500 mb-0.5">Streak</span>
                    <span class="text-sm font-black font-mono text-amber-500">
                      🔥 {{ currentUserStats.loginStreak }}
                    </span>
                  </div>
                </div>

                <!-- Advice message -->
                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-4 leading-relaxed font-sans">
                  Keep solving to climb higher! You are actively ranked on the leaderboard.
                </p>
              </div>

              <!-- Unranked State -->
              <div *ngIf="!currentUserStats" class="w-full flex flex-col items-center py-4">
                <div class="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800/60 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-600 mb-3 shadow-sm">
                  <i class="fa-solid fa-user-slash text-lg"></i>
                </div>
                <h3 class="text-sm font-bold text-slate-500 dark:text-slate-400 font-mono mb-1">
                  Not Ranked
                </h3>
                <p class="text-xs text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed mb-4">
                  You have 0 solved problems or you are not logged in.
                </p>
                <a routerLink="/" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold font-mono text-xs shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5 cursor-pointer">
                  Start Solving <i class="fa-solid fa-arrow-right"></i>
                </a>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class LeaderboardComponent implements OnInit {
  users: any[] = [];
  currentUserStats: any = null;
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
        const rawUsers = res || [];
        
        // Filter out users with 0 solved counts
        const activeUsers = rawUsers.filter((u: any) => u.solvedCount > 0);
        
        // Assign continuous dynamic ranks
        activeUsers.forEach((u: any, idx: number) => {
          u.rank = idx + 1;
        });

        // Find the current logged in user stats in active users
        this.currentUserStats = activeUsers.find((u: any) => u.id === this.currentUserId) || null;

        // Slice top 10 users for the main list
        this.users = activeUsers.slice(0, 10);
        this.loading = false;
      },
      error: () => {
        this.users = [];
        this.currentUserStats = null;
        this.loading = false;
      }
    });
  }
}

