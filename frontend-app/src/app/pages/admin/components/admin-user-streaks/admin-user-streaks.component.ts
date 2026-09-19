import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DsaService } from '../../../../core/services/dsa.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-admin-user-streaks',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-5xl mx-auto">
      <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white m-0">User Activity &amp; Login Streaks Dashboard</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Monitor active platform users, streaks, and completed problem counts.</p>
        </div>
        <span class="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
          {{usersList.length}} Users
        </span>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-400">
              <th class="py-3 px-4">User</th>
              <th class="py-3 px-4">Role</th>
              <th class="py-3 px-4">Login Streak</th>
              <th class="py-3 px-4">Solved Count</th>
              <th class="py-3 px-4">Last Login</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200">
            <tr *ngFor="let u of usersList">
              <td class="py-3 px-4 flex items-center gap-3">
                <img [src]="u.avatarUrl" class="w-8 h-8 rounded-full border border-indigo-300">
                <div>
                  <span class="font-bold text-slate-900 dark:text-white block font-mono">{{u.username}}</span>
                  <span class="text-[10px] text-slate-400">{{u.email || u.name}}</span>
                </div>
              </td>
              <td class="py-3 px-4">
                <span [class.bg-amber-100]="u.role === 'admin'" [class.text-amber-800]="u.role === 'admin'" [class.bg-slate-100]="u.role !== 'admin'" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold dark:bg-amber-950/60 dark:text-amber-300">
                  {{u.role | uppercase}}
                </span>
              </td>
              <td class="py-3 px-4 font-mono font-bold text-amber-600 dark:text-amber-400">
                🔥 {{u.loginStreak || 1}} Days
              </td>
              <td class="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {{u.solvedCount || 0}} Solved
              </td>
              <td class="py-3 px-4 font-mono text-slate-400">
                {{u.lastLoginDate || 'Today'}}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class AdminUserStreaksComponent implements OnInit {
  usersList: any[] = [];

  constructor(
    private dsaService: DsaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.currentUserSignal();
    if (user && user.role === 'admin') {
      this.dsaService.getUsersActivity().subscribe({
        next: (users) => {
          this.usersList = users;
        }
      });
    }
  }
}
