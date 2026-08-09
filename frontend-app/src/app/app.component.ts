import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { DsaService } from './core/services/dsa.service';
import { AuthService } from './core/services/auth.service';
import { ThemeService } from './core/services/theme.service';
import { AuthModalComponent } from './pages/auth-modal/auth-modal.component';
import { ProfileModalComponent } from './pages/profile-modal/profile-modal.component';
import { ToastComponent } from './shared/toast/toast.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, AuthModalComponent, ProfileModalComponent, ToastComponent],
  template: `
    <header class="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 transition-colors shadow-2xs">
      <div class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        <!-- Brand Logo -->
        <a routerLink="/" class="flex items-center gap-2.5 shrink-0 no-underline">
          <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-mono font-bold text-white shadow-md shadow-indigo-500/20 text-sm">
            JS
          </div>
          <div class="hidden sm:block">
            <span class="text-base font-extrabold tracking-tight text-slate-900 dark:text-white block leading-tight">JS DSA Mastery</span>
            <span class="text-[10px] text-indigo-600 dark:text-indigo-400 font-mono font-bold block leading-tight">30-Day Platform</span>
          </div>
        </a>

        <!-- Navigation Links Pill Bar -->
        <nav class="flex items-center gap-1 sm:gap-2">
          <a 
            routerLink="/" 
            routerLinkActive="bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold border-indigo-200 dark:border-indigo-800" 
            [routerLinkActiveOptions]="{exact: true}"
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 no-underline"
          >
            <i class="fa-solid fa-map text-indigo-500"></i>
            <span>Roadmap</span>
          </a>

          <a 
            routerLink="/cheat-sheet" 
            routerLinkActive="bg-purple-50 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 font-bold border-purple-200 dark:border-purple-800" 
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 no-underline"
          >
            <i class="fa-solid fa-code text-purple-500"></i>
            <span>Cheat Sheet</span>
          </a>

          <a 
            routerLink="/interview-test" 
            routerLinkActive="bg-amber-50 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold border-amber-200 dark:border-amber-800" 
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 no-underline"
          >
            <i class="fa-solid fa-stopwatch text-amber-500"></i>
            <span>Mock Test</span>
          </a>

          <a 
            routerLink="/leaderboard" 
            routerLinkActive="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border-emerald-200 dark:border-emerald-800" 
            class="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center gap-1.5 no-underline"
          >
            <i class="fa-solid fa-trophy text-emerald-500"></i>
            <span>Leaderboard</span>
          </a>

          <!-- Admin Nav Link -->
          <a 
            *ngIf="authService.currentUserSignal()?.role === 'admin'"
            routerLink="/admin" 
            routerLinkActive="bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border-amber-300 dark:border-amber-800" 
            class="px-3 py-1.5 rounded-lg text-xs font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-all flex items-center gap-1.5 no-underline font-mono"
          >
            <i class="fa-solid fa-shield-halved"></i>
            <span class="hidden md:inline">Admin</span>
          </a>
        </nav>

        <!-- Right Side Widgets -->
        <div class="flex items-center gap-2 shrink-0">
          
          <!-- Theme Toggle Button -->
          <button 
            (click)="themeService.toggleTheme()" 
            class="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-xs font-bold flex items-center gap-1"
            title="Toggle Light / Dark Theme"
          >
            <i *ngIf="themeService.themeSignal() === 'light'" class="fa-solid fa-moon text-indigo-600"></i>
            <i *ngIf="themeService.themeSignal() === 'dark'" class="fa-solid fa-sun text-amber-400"></i>
          </button>

          <!-- Solved Progress Badge -->
          <div *ngIf="authService.currentUserSignal()" class="hidden lg:flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            <i class="fa-solid fa-trophy text-amber-500 text-xs"></i>
            <span class="text-xs text-slate-700 dark:text-slate-300 font-semibold">
              <strong class="text-emerald-600 dark:text-emerald-400 font-mono">{{ dsaService.solvedCountSignal() }}</strong> / {{ dsaService.totalProblemsSignal() }}
            </span>
          </div>

          <!-- User Profile Dropdown -->
          <div *ngIf="authService.currentUserSignal() as user; else loggedOutView" class="relative">

            <!-- Avatar trigger -->
            <button
              (click)="showUserMenu = !showUserMenu"
              class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 pr-2.5 rounded-full border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 transition-all"
            >
              <img [src]="user.avatarUrl" class="w-7 h-7 rounded-full border border-indigo-300">
              <span class="text-xs font-bold text-slate-800 dark:text-slate-100 font-mono hidden sm:inline-flex items-center gap-1">
                {{user.username}}
                <span *ngIf="user.loginStreak" class="text-[10px] text-amber-500 font-bold">🔥{{user.loginStreak}}d</span>
              </span>
              <i class="fa-solid fa-chevron-down text-[9px] text-slate-400 ml-0.5 transition-transform" [class.rotate-180]="showUserMenu"></i>
            </button>

            <!-- Invisible backdrop to close menu -->
            <div *ngIf="showUserMenu" (click)="showUserMenu = false" class="fixed inset-0 z-40"></div>

            <!-- Dropdown panel -->
            <div *ngIf="showUserMenu"
              class="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 py-1.5 overflow-hidden"
            >
              <!-- User info header inside dropdown -->
              <div class="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                <p class="text-xs font-extrabold text-slate-900 dark:text-white font-mono truncate">{{user.username}}</p>
                <p class="text-[10px] text-slate-400 font-mono truncate">{{user.name}}</p>
                <div *ngIf="user.loginStreak" class="mt-1 inline-flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                  🔥 {{user.loginStreak}}-day streak
                </div>
              </div>

              <!-- Menu Items -->
              <div class="py-1">
                <!-- Mock Exam History -->
                <a routerLink="/mock-history" (click)="showUserMenu = false"
                  class="flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-700 dark:hover:text-indigo-300 transition-all no-underline cursor-pointer">
                  <span class="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[11px]">
                    <i class="fa-solid fa-clipboard-list"></i>
                  </span>
                  <div>
                    <span class="block">Mock Exam History</span>
                    <span class="text-[10px] font-mono text-slate-400">View past attempts</span>
                  </div>
                </a>

                <!-- Change Password -->
                <button (click)="showProfileModal = true; showUserMenu = false"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all text-left cursor-pointer">
                  <span class="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center text-[11px]">
                    <i class="fa-solid fa-key"></i>
                  </span>
                  <div>
                    <span class="block">Change Password</span>
                    <span class="text-[10px] font-mono text-slate-400">Account settings</span>
                  </div>
                </button>

                <div class="mx-4 my-1 border-t border-slate-100 dark:border-slate-800"></div>

                <!-- Sign Out -->
                <button (click)="logout(); showUserMenu = false"
                  class="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all text-left cursor-pointer">
                  <span class="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-500 flex items-center justify-center text-[11px]">
                    <i class="fa-solid fa-right-from-bracket"></i>
                  </span>
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          <ng-template #loggedOutView>
            <button (click)="showAuthModal = true" class="btn-primary text-xs px-3 py-1.5">
              <i class="fa-solid fa-user"></i> Login
            </button>
          </ng-template>

        </div>

      </div>
    </header>

    <main class="min-h-[calc(100vh-64px)]">
      <router-outlet></router-outlet>
    </main>

    <!-- Auth Dialog Modal -->
    <app-auth-modal *ngIf="showAuthModal" (close)="showAuthModal = false"></app-auth-modal>
    
    <!-- Profile & History Modal -->
    <app-profile-modal *ngIf="showProfileModal" (close)="showProfileModal = false"></app-profile-modal>

    <!-- Global Toast Notifications -->
    <app-toast></app-toast>
  `,
  styles: [`
    a { text-decoration: none; }
  `]
})
export class AppComponent implements OnInit {
  showAuthModal = false;
  showProfileModal = false;
  showUserMenu = false;

  constructor(
    public dsaService: DsaService,
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit() {
    const currentUser = this.authService.currentUserSignal();
    const userId = currentUser ? currentUser.id : '';
    this.dsaService.fetchCurriculum(userId).subscribe();
  }

  logout() {
    this.authService.logout();
    this.dsaService.fetchCurriculum('').subscribe();
  }
}
