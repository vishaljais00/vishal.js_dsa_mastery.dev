import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { AdminAddProblemComponent } from './components/admin-add-problem/admin-add-problem.component';
import { AdminManageProblemsComponent } from './components/admin-manage-problems/admin-manage-problems.component';
import { AdminMockTestComponent } from './components/admin-mock-test/admin-mock-test.component';
import { AdminGuidebookComponent } from './components/admin-guidebook/admin-guidebook.component';
import { AdminUserStreaksComponent } from './components/admin-user-streaks/admin-user-streaks.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AuthModalComponent,
    AdminAddProblemComponent,
    AdminManageProblemsComponent,
    AdminMockTestComponent,
    AdminGuidebookComponent,
    AdminUserStreaksComponent
  ],
  template: `
    <!-- ACCESS DENIED VIEW IF NOT LOGGED IN AS ADMIN -->
    <div *ngIf="!isAdmin()" class="min-h-[80vh] flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 transition-colors">
      <div class="bg-white dark:bg-slate-900 p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full text-center">
        <div class="w-16 h-16 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 text-2xl flex items-center justify-center mx-auto mb-4 border border-rose-300 dark:border-rose-800">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white mb-2">Admin Access Required</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          You must be logged in as an <strong class="text-slate-800 dark:text-slate-200">Admin Account</strong> to access problem creation, mock exam configuration, and user streak monitoring.
        </p>

        <div class="space-y-3">
          <button (click)="showAuthModal = true" class="btn-primary w-full justify-center py-3 text-sm">
            <i class="fa-solid fa-user-shield"></i> Log In as Admin
          </button>
          <a routerLink="/" class="text-xs font-mono font-semibold text-slate-500 hover:text-indigo-600 block">
            Return to Roadmap
          </a>
        </div>
      </div>
    </div>

    <!-- MAIN ADMIN PANEL (ONLY FOR ADMIN USERS) -->
    <div *ngIf="isAdmin()" class="bg-slate-50 dark:bg-slate-950 min-h-screen py-8 transition-colors">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-mono font-bold border border-amber-300 dark:border-amber-800 mb-2">
              🛡️ Admin Control Panel
            </span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white m-0">Platform Curriculum &amp; User Management</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Add new DSA questions, manage existing curriculum problems, configure mock tests, and monitor user streaks.</p>
          </div>

          <a routerLink="/" class="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
            <i class="fa-solid fa-arrow-left mr-1"></i> Back to Roadmap
          </a>
        </div>

        <!-- Dynamic Admin Tabs Grid Navigation -->
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-8 bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <button 
            (click)="activeTab = 'add-problem'"
            [class.bg-indigo-600]="activeTab === 'add-problem'"
            [class.text-white]="activeTab === 'add-problem'"
            [class.text-slate-600]="activeTab !== 'add-problem'"
            [class.dark:text-slate-300]="activeTab !== 'add-problem'"
            class="px-3 py-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-square-plus"></i> Add New Question
          </button>

          <button 
            (click)="activeTab = 'manage-problems'"
            [class.bg-indigo-600]="activeTab === 'manage-problems'"
            [class.text-white]="activeTab === 'manage-problems'"
            [class.text-slate-600]="activeTab !== 'manage-problems'"
            [class.dark:text-slate-300]="activeTab !== 'manage-problems'"
            class="px-3 py-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-list-check"></i> Manage Curriculum
          </button>
          
          <button 
            (click)="activeTab = 'mock-test'"
            [class.bg-indigo-600]="activeTab === 'mock-test'"
            [class.text-white]="activeTab === 'mock-test'"
            [class.text-slate-600]="activeTab !== 'mock-test'"
            [class.dark:text-slate-300]="activeTab !== 'mock-test'"
            class="px-3 py-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-sliders"></i> Control Mock Test
          </button>

          <button 
            (click)="activeTab = 'guidebook'"
            [class.bg-indigo-600]="activeTab === 'guidebook'"
            [class.text-white]="activeTab === 'guidebook'"
            [class.text-slate-600]="activeTab !== 'guidebook'"
            [class.dark:text-slate-300]="activeTab !== 'guidebook'"
            class="px-3 py-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-book-open"></i> Guidebook CMS
          </button>

          <button 
            (click)="activeTab = 'users-activity'"
            [class.bg-indigo-600]="activeTab === 'users-activity'"
            [class.text-white]="activeTab === 'users-activity'"
            [class.text-slate-600]="activeTab !== 'users-activity'"
            [class.dark:text-slate-300]="activeTab !== 'users-activity'"
            class="px-3 py-3 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-2"
          >
            <i class="fa-solid fa-users"></i> Activity &amp; Streaks
          </button>
        </div>

        <!-- Render active subcomponent dynamically -->
        <div class="space-y-6">
          <app-admin-add-problem *ngIf="activeTab === 'add-problem'"></app-admin-add-problem>
          <app-admin-manage-problems *ngIf="activeTab === 'manage-problems'"></app-admin-manage-problems>
          <app-admin-mock-test *ngIf="activeTab === 'mock-test'"></app-admin-mock-test>
          <app-admin-guidebook *ngIf="activeTab === 'guidebook'"></app-admin-guidebook>
          <app-admin-user-streaks *ngIf="activeTab === 'users-activity'"></app-admin-user-streaks>
        </div>
      </div>
    </div>

    <!-- Auth Modal Dialog for Admin Login -->
    <app-auth-modal *ngIf="showAuthModal" (close)="showAuthModal = false"></app-auth-modal>
  `
})
export class AdminComponent implements OnInit {
  activeTab: string = 'add-problem';
  showAuthModal = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {}

  isAdmin(): boolean {
    const user = this.authService.currentUserSignal();
    return user?.role === 'admin';
  }
}

