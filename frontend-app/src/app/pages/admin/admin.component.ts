import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DsaService, Problem } from '../../core/services/dsa.service';
import { AuthService } from '../../core/services/auth.service';
import { AuthModalComponent } from '../auth-modal/auth-modal.component';
import { ToastService } from '../../core/services/toast.service';

export interface AdminTestCase {
  input: string;
  expectedOutput: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, AuthModalComponent],
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
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white m-0">Platform Curriculum & User Management</h1>
            <p class="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Add new DSA questions, configure mock test sets, and monitor user login streaks.</p>
          </div>

          <a routerLink="/" class="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 shadow-2xs">
            <i class="fa-solid fa-arrow-left mr-1"></i> Back to Roadmap
          </a>
        </div>

        <!-- Navigation Tabs -->
        <div class="flex items-center gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-2">
          <button 
            (click)="activeTab = 'add-problem'"
            [class.bg-indigo-600]="activeTab === 'add-problem'"
            [class.text-white]="activeTab === 'add-problem'"
            [class.bg-white]="activeTab !== 'add-problem'"
            [class.dark:bg-slate-900]="activeTab !== 'add-problem'"
            [class.text-slate-700]="activeTab !== 'add-problem'"
            [class.dark:text-slate-300]="activeTab !== 'add-problem'"
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
          >
            <i class="fa-solid fa-plus"></i> Add New Question
          </button>

          <button 
            (click)="activeTab = 'mock-test'"
            [class.bg-indigo-600]="activeTab === 'mock-test'"
            [class.text-white]="activeTab === 'mock-test'"
            [class.bg-white]="activeTab !== 'mock-test'"
            [class.dark:bg-slate-900]="activeTab !== 'mock-test'"
            [class.text-slate-700]="activeTab !== 'mock-test'"
            [class.dark:text-slate-300]="activeTab !== 'mock-test'"
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
          >
            <i class="fa-solid fa-sliders"></i> Control Mock Test
          </button>

          <button 
            (click)="activeTab = 'users-activity'"
            [class.bg-indigo-600]="activeTab === 'users-activity'"
            [class.text-white]="activeTab === 'users-activity'"
            [class.bg-white]="activeTab !== 'users-activity'"
            [class.dark:bg-slate-900]="activeTab !== 'users-activity'"
            [class.text-slate-700]="activeTab !== 'users-activity'"
            [class.dark:text-slate-300]="activeTab !== 'users-activity'"
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
          >
            <i class="fa-solid fa-users-gear"></i> User Activity &amp; Streaks ({{usersList.length}})
          </button>

          <button 
            (click)="activeTab = 'manage-problems'"
            [class.bg-indigo-600]="activeTab === 'manage-problems'"
            [class.text-white]="activeTab === 'manage-problems'"
            [class.bg-white]="activeTab !== 'manage-problems'"
            [class.dark:bg-slate-900]="activeTab !== 'manage-problems'"
            [class.text-slate-700]="activeTab !== 'manage-problems'"
            [class.dark:text-slate-300]="activeTab !== 'manage-problems'"
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
          >
            <i class="fa-solid fa-pen-to-square"></i> Manage Questions ({{allProblemsList.length}})
          </button>

          <button 
            (click)="activeTab = 'guidebook-cms'"
            [class.bg-amber-500]="activeTab === 'guidebook-cms'"
            [class.text-white]="activeTab === 'guidebook-cms'"
            [class.bg-white]="activeTab !== 'guidebook-cms'"
            [class.dark:bg-slate-900]="activeTab !== 'guidebook-cms'"
            [class.text-slate-700]="activeTab !== 'guidebook-cms'"
            [class.dark:text-slate-300]="activeTab !== 'guidebook-cms'"
            class="px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2"
          >
            <i class="fa-solid fa-book"></i> Guidebook CMS
          </button>
        </div>

        <!-- TAB 1: ADD NEW QUESTION -->
        <div *ngIf="activeTab === 'add-problem'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-4xl">
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Create & Assign New Problem</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Newly added questions automatically receive a prominent <span class="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">NEW QUESTION ADDED</span> tag on the roadmap.</p>

          <form (ngSubmit)="submitProblem()" class="space-y-4">

            <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Track Category</label>
                <select [(ngModel)]="newProb.category" name="category" class="w-full bg-slate-50 dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-bold">
                  <option value="DSA">🧩 DSA Track</option>
                  <option value="JS">🟨 JavaScript Track</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Week Number</label>
                <select [(ngModel)]="newProb.weekNumber" name="weekNumber" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-medium">
                  <option [ngValue]="1">Week 1 (Fundamentals)</option>
                  <option [ngValue]="2">Week 2 (Two Pointers & Sliding Window)</option>
                  <option [ngValue]="3">Week 3 (Binary Search & Linked List)</option>
                  <option [ngValue]="4">Week 4 (Stack, Queue, Recursion)</option>
                </select>
              </div>

              <div>
                <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Day Number (1 to 30)</label>
                <input type="number" [(ngModel)]="newProb.dayNumber" name="dayNumber" min="1" max="30" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-medium">
              </div>

              <div>
                <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Difficulty Level</label>
                <select [(ngModel)]="newProb.difficulty" name="difficulty" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-medium">
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Problem Title</label>
                <input type="text" [(ngModel)]="newProb.title" name="title" placeholder="e.g. Reverse String" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-medium">
              </div>

              <div>
                <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Pattern Tag</label>
                <input type="text" [(ngModel)]="newProb.patternTag" name="patternTag" placeholder="e.g. Two Pointers" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-medium">
              </div>
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Problem Description</label>
              <textarea [(ngModel)]="newProb.description" name="description" rows="4" placeholder="Write detailed problem prompt..." required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-medium"></textarea>
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Starter Code Template</label>
              <textarea [(ngModel)]="newProb.starterCode" name="starterCode" rows="4" required class="w-full bg-slate-900 text-emerald-300 font-mono text-xs p-3 rounded-xl border border-slate-800 outline-none leading-relaxed"></textarea>
            </div>

            <!-- DYNAMIC TEST CASES FORM BUILDER -->
            <div class="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div class="flex items-center justify-between">
                <span class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  🧪 Sample Test Cases (Input & Expected Output Columns)
                </span>
                <button type="button" (click)="addTestCaseField()" class="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                  + Add Test Case
                </button>
              </div>

              <div *ngFor="let tc of testCasesList; let i = index" class="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 relative">
                <div>
                  <label class="block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1">Test Case {{i + 1}} Input Column</label>
                  <input type="text" [(ngModel)]="tc.input" [name]="'tcInput_' + i" placeholder="e.g. [1, 2, 3], 4" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-900 dark:text-white outline-none">
                </div>

                <div>
                  <label class="block text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 mb-1">Test Case {{i + 1}} Expected Output Column</label>
                  <div class="flex items-center gap-2">
                    <input type="text" [(ngModel)]="tc.expectedOutput" [name]="'tcOutput_' + i" placeholder="e.g. [3, 2, 1] or true" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg p-2 text-xs font-mono text-slate-900 dark:text-white outline-none">
                    <button *ngIf="testCasesList.length > 1" type="button" (click)="removeTestCaseField(i)" class="text-rose-500 hover:text-rose-700 text-xs px-1">
                      <i class="fa-solid fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Solution Hint (Optional)</label>
              <input type="text" [(ngModel)]="newProb.solutionHint" name="solutionHint" placeholder="e.g. Use two pointers left and right" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-medium">
            </div>

            <button type="submit" [disabled]="loading" class="btn-primary py-3 text-sm">
              <i class="fa-solid fa-plus"></i> Publish Question to Curriculum
            </button>
          </form>
        </div>

        <!-- TAB 2: CONTROL MOCK TEST WITH MULTISELECT DROPDOWNS -->
        <div *ngIf="activeTab === 'mock-test'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-4xl">
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Day 30 Mock Interview Exam Controls</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Filter by Category, then select questions using the interactive multi-select selector.</p>

          <form (ngSubmit)="saveMockTest()" class="space-y-6">

            <!-- STEP 1: CATEGORY MULTISELECT FILTER -->
            <div class="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <label class="block text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide mb-2">
                Step 1: Select Problem Categories / Pattern Tags
              </label>
              <div class="flex flex-wrap gap-2">
                <button 
                  type="button"
                  *ngFor="let cat of availableCategories" 
                  (click)="toggleCategory(cat)"
                  [class.bg-indigo-600]="selectedCategories.includes(cat)"
                  [class.text-white]="selectedCategories.includes(cat)"
                  [class.bg-white]="!selectedCategories.includes(cat)"
                  [class.dark:bg-slate-900]="!selectedCategories.includes(cat)"
                  [class.text-slate-700]="!selectedCategories.includes(cat)"
                  [class.dark:text-slate-300]="!selectedCategories.includes(cat)"
                  class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold border border-slate-200 dark:border-slate-700 transition-all"
                >
                  <i *ngIf="selectedCategories.includes(cat)" class="fa-solid fa-check mr-1"></i>
                  {{cat}}
                </button>
              </div>
            </div>

            <!-- STEP 2: MULTISELECT QUESTION SELECTION WITH PER-QUESTION TIME -->
            <div class="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <div class="flex items-center justify-between mb-3">
                <label class="block text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
                  Step 2: Select Questions & Set Per-Question Time (Selected: {{selectedMockProblems.length}})
                </label>
                <span class="text-[11px] font-mono text-slate-500">Showing {{filteredMockProblems.length}} matching</span>
              </div>

              <!-- Search bar -->
              <div class="relative mb-3">
                <i class="fa-solid fa-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none"></i>
                <input
                  type="text"
                  [(ngModel)]="mockSearchQuery"
                  name="mockSearchQuery"
                  placeholder="Search by name or pattern tag..."
                  class="w-full pl-8 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-white placeholder-slate-400 outline-none focus:border-indigo-500 transition-all"
                >
                <button
                  *ngIf="mockSearchQuery"
                  type="button"
                  (click)="mockSearchQuery = ''"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>

              <div class="max-h-72 overflow-y-auto space-y-2 p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                <div *ngFor="let p of filteredMockProblems" class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all border border-slate-100 dark:border-slate-800">
                  <!-- Checkbox -->
                  <input 
                    type="checkbox" 
                    [checked]="isSelectedMockProblem(p.id)"
                    (change)="toggleMockProblem(p.id)"
                    class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
                  >

                  <!-- Problem Name & Tag -->
                  <div class="flex-1 min-w-0">
                    <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">Day {{p.dayNumber}}: {{p.title}}</span>
                    <span class="text-[10px] font-mono text-slate-400">{{p.patternTag}}</span>
                  </div>

                  <!-- Per-Question Time Input (only shown when selected) -->
                  <div *ngIf="isSelectedMockProblem(p.id)" class="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      [value]="getQuestionMinutes(p.id)"
                      (change)="setQuestionMinutes(p.id, $event)"
                      min="1"
                      max="60"
                      class="w-14 bg-slate-100 dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-lg p-1.5 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 outline-none text-center"
                    >
                    <span class="text-[10px] font-mono text-slate-400 font-bold">min</span>
                  </div>

                  <span *ngIf="!isSelectedMockProblem(p.id)" class="text-[10px] font-mono text-slate-300 dark:text-slate-600 shrink-0">-- min</span>
                </div>
              </div>

              <!-- TOTAL TIME SUMMARY BAR -->
              <div *ngIf="selectedMockProblems.length > 0" class="mt-4 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3 flex items-center justify-between">
                <div class="text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-2">
                  <i class="fa-solid fa-stopwatch"></i>
                  {{selectedMockProblems.length}} Questions Selected
                </div>
                <div class="text-xs font-mono font-bold text-indigo-800 dark:text-indigo-200">
                  Total Exam Time: <span class="text-indigo-600 dark:text-indigo-400 text-sm">{{totalExamMinutes}} min</span>
                  <span class="text-[10px] text-slate-400 font-normal ml-1">(sum of all question timers)</span>
                </div>
              </div>
            </div>

            <button type="submit" class="btn-primary py-3 text-sm">
              <i class="fa-solid fa-save"></i> Save Exam Configuration
            </button>
          </form>
        </div>

        <!-- TAB 3: USER ACTIVITY & STREAKS TABLE -->
        <div *ngIf="activeTab === 'users-activity'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white mb-4">User Activity & Login Streaks Dashboard</h2>

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
                    <span [class.bg-amber-100]="u.role === 'admin'" [class.text-amber-800]="u.role === 'admin'" [class.bg-slate-100]="u.role !== 'admin'" class="px-2 py-0.5 rounded text-[10px] font-mono font-bold">
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

        <!-- TAB 4: MANAGE & EDIT/DELETE QUESTIONS -->
        <div *ngIf="activeTab === 'manage-problems'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-extrabold text-slate-900 dark:text-white m-0">Manage Curriculum Questions</h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">Edit question descriptions, test cases, hints or remove outdated questions.</p>
            </div>
            <span class="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {{allProblemsList.length}} Questions
            </span>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-400">
                  <th class="py-3 px-4">Title &amp; Day</th>
                  <th class="py-3 px-4">Difficulty</th>
                  <th class="py-3 px-4">Pattern</th>
                  <th class="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200">
                <tr *ngFor="let p of allProblemsList" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td class="py-3 px-4">
                    <span class="font-bold text-slate-900 dark:text-white block">Day {{p.dayNumber}}: {{p.title}}</span>
                    <span class="text-[10px] text-slate-400 font-mono">Week {{p.weekNumber}}</span>
                  </td>
                  <td class="py-3 px-4">
                    <span [class]="getDifficultyClass(p.difficulty)">{{p.difficulty}}</span>
                  </td>
                  <td class="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                    {{p.patternTag}}
                  </td>
                  <td class="py-3 px-4 text-right">
                    <div class="flex items-center justify-end gap-2">
                      <button (click)="openEditModal(p)" class="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 text-xs font-mono font-bold border border-indigo-200 dark:border-indigo-800 transition-all">
                        <i class="fa-solid fa-pen-to-square"></i> Edit
                      </button>
                      <button (click)="deleteProblem(p)" class="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-mono font-bold border border-rose-200 dark:border-rose-800 transition-all">
                        <i class="fa-solid fa-trash"></i> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- TAB 5: GUIDEBOOK CMS -->
        <div *ngIf="activeTab === 'guidebook-cms'" class="space-y-6">
          <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 class="text-xl font-extrabold text-slate-900 dark:text-white m-0">Guidebook &amp; Blog Publishing CMS</h2>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Publish visual concept guides, images, code snippets, and topics for DSA and JS tracks.</p>
              </div>
              <div class="flex items-center gap-2">
                <button (click)="openTopicModal()" class="btn-primary py-2 px-4 text-xs font-mono">
                  <i class="fa-solid fa-folder-plus"></i> + Create Topic
                </button>
                <button (click)="openSubtopicModal()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs">
                  <i class="fa-solid fa-file-pen"></i> + Add Subtopic Article
                </button>
              </div>
            </div>

            <!-- Track Filter -->
            <div class="flex gap-2 mb-5 text-xs">
              <button (click)="guidebookFilter = 'ALL'" [class.bg-slate-700]="guidebookFilter==='ALL'" [class.text-white]="guidebookFilter==='ALL'" [class.bg-slate-100]="guidebookFilter!=='ALL'" [class.text-slate-700]="guidebookFilter!=='ALL'" class="px-3 py-1.5 rounded-lg font-bold transition-all">All ({{guidebookTopicsList.length}})</button>
              <button (click)="guidebookFilter = 'JS'" [class.bg-amber-500]="guidebookFilter==='JS'" [class.text-slate-950]="guidebookFilter==='JS'" [class.bg-slate-100]="guidebookFilter!=='JS'" [class.text-slate-600]="guidebookFilter!=='JS'" class="px-3 py-1.5 rounded-lg font-bold transition-all">⚡ JS Track</button>
              <button (click)="guidebookFilter = 'DSA'" [class.bg-indigo-600]="guidebookFilter==='DSA'" [class.text-white]="guidebookFilter==='DSA'" [class.bg-slate-100]="guidebookFilter!=='DSA'" [class.text-slate-600]="guidebookFilter!=='DSA'" class="px-3 py-1.5 rounded-lg font-bold transition-all">🧩 DSA Track</button>
            </div>

            <div *ngIf="filteredGuidebookTopics.length === 0" class="py-12 text-center text-slate-400 font-mono text-xs">
              <i class="fa-solid fa-book text-3xl mb-2 text-slate-300"></i>
              <p>No topics yet. Click "+ Create Topic" to get started.</p>
            </div>

            <div *ngFor="let topic of filteredGuidebookTopics" class="mb-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-5 border border-slate-200/60 dark:border-slate-800">
              <div class="flex items-center justify-between mb-3 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div class="flex items-center gap-2.5">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold"
                    [class.bg-indigo-100]="topic.category === 'DSA'" [class.text-indigo-700]="topic.category === 'DSA'"
                    [class.bg-amber-100]="topic.category === 'JS'" [class.text-amber-800]="topic.category === 'JS'">
                    {{topic.category === 'JS' ? '⚡' : '🧩'}} {{topic.category}} Track
                  </span>
                  <h3 class="text-base font-extrabold text-slate-900 dark:text-white m-0">{{topic.title}}</h3>
                </div>
                <div class="flex items-center gap-2">
                  <ng-container *ngIf="confirmDeleteTopicId !== topic.id">
                    <button (click)="confirmDeleteTopicId = topic.id" class="text-xs text-rose-500 hover:text-rose-700 font-mono font-bold">
                      <i class="fa-solid fa-trash mr-1"></i>Delete
                    </button>
                  </ng-container>
                  <ng-container *ngIf="confirmDeleteTopicId === topic.id">
                    <span class="text-[10px] text-rose-600 font-bold font-mono mr-1">Delete topic &amp; all articles?</span>
                    <button (click)="doDeleteTopic(topic.id)" class="text-[10px] bg-rose-600 text-white px-2 py-1 rounded-lg font-bold mr-1">Yes</button>
                    <button (click)="confirmDeleteTopicId = null" class="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg font-bold">No</button>
                  </ng-container>
                </div>
              </div>

              <div class="space-y-2" *ngIf="topic.subtopics?.length">
                <div *ngFor="let sub of topic.subtopics" class="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                  <div class="flex items-center gap-3">
                    <i class="fa-solid fa-file-lines text-indigo-500"></i>
                    <div>
                      <h4 class="font-bold text-slate-800 dark:text-slate-200 m-0">{{sub.title}}</h4>
                      <p class="text-[11px] text-slate-500 dark:text-slate-400 m-0 truncate max-w-md">{{sub.description}}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-2">
                    <span *ngIf="sub.coverImageUrl" class="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">🖼️ Image</span>
                    <span *ngIf="sub.videoUrl" class="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">🎬 Video</span>
                    <button (click)="openEditSubtopicModal(sub)" class="text-indigo-500 hover:text-indigo-700 text-xs px-2"><i class="fa-solid fa-pen-to-square"></i></button>
                    <ng-container *ngIf="confirmDeleteSubtopicId !== sub.id">
                      <button (click)="confirmDeleteSubtopicId = sub.id" class="text-rose-500 hover:text-rose-700 text-xs px-2"><i class="fa-solid fa-trash"></i></button>
                    </ng-container>
                    <ng-container *ngIf="confirmDeleteSubtopicId === sub.id">
                      <button (click)="doDeleteSubtopic(sub.id)" class="text-[10px] bg-rose-600 text-white px-2 py-1 rounded-lg font-bold mr-1">Delete?</button>
                      <button (click)="confirmDeleteSubtopicId = null" class="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-lg font-bold">No</button>
                    </ng-container>
                  </div>
                </div>
              </div>
              <div *ngIf="!topic.subtopics?.length" class="text-[11px] text-slate-400 italic font-mono pt-1">No articles yet — click "+ Add Subtopic Article" to publish content.</div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- Edit Problem Modal Overlay -->
    <div *ngIf="editingProb" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white m-0">Edit Problem: {{editingProb.title}}</h3>
          <button (click)="editingProb = null" class="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>

        <div class="space-y-4 text-xs font-medium">
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Title</label>
            <input type="text" [(ngModel)]="editingProb.title" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
          </div>

          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea [(ngModel)]="editingProb.description" rows="4" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none font-mono"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Difficulty</label>
              <select [(ngModel)]="editingProb.difficulty" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Pattern Tag</label>
              <input type="text" [(ngModel)]="editingProb.patternTag" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
            </div>
          </div>

          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Solution Hint</label>
            <input type="text" [(ngModel)]="editingProb.solutionHint" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
          </div>

          <div class="flex justify-end gap-2 pt-4">
            <button (click)="editingProb = null" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Cancel</button>
            <button (click)="saveEditedProblem()" class="btn-primary px-5 py-2 text-xs">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Auth Modal Dialog for Admin Login -->
    <app-auth-modal *ngIf="showAuthModal" (close)="showAuthModal = false"></app-auth-modal>

    <!-- ===== EDIT SUBTOPIC MODAL ===== -->
    <div *ngIf="editingSubtopic" class="fixed inset-0 z-50 flex items-start justify-center p-2 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full my-2">
        <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white m-0">
            <i class="fa-solid fa-pen-to-square text-indigo-500 mr-2"></i>Edit: {{editingSubtopic.title}}
          </h3>
          <button (click)="editingSubtopic = null" class="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>
        <div class="space-y-4 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Article Title *</label>
              <input type="text" [(ngModel)]="editingSubtopic.title" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500">
            </div>
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Subtitle / Description</label>
              <input type="text" [(ngModel)]="editingSubtopic.description" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-mono font-bold text-slate-600 dark:text-slate-400">📝 Content (Markdown) *</label>
              <div class="flex gap-1">
                <button type="button" (click)="editSubtopicEditorTab = 'write'"
                  [class.bg-indigo-600]="editSubtopicEditorTab === 'write'" [class.text-white]="editSubtopicEditorTab === 'write'"
                  [class.bg-slate-100]="editSubtopicEditorTab !== 'write'" [class.text-slate-700]="editSubtopicEditorTab !== 'write'"
                  class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all">Write</button>
                <button type="button" (click)="editSubtopicEditorTab = 'preview'"
                  [class.bg-indigo-600]="editSubtopicEditorTab === 'preview'" [class.text-white]="editSubtopicEditorTab === 'preview'"
                  [class.bg-slate-100]="editSubtopicEditorTab !== 'preview'" [class.text-slate-700]="editSubtopicEditorTab !== 'preview'"
                  class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all">Preview</button>
              </div>
            </div>
            <div *ngIf="editSubtopicEditorTab === 'write'" class="flex gap-1 flex-wrap mb-1.5">
              <button type="button" (click)="insertAtCursorEdit('## Heading\n')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-bold font-mono hover:bg-slate-600">H2</button>
              <button type="button" (click)="insertAtCursorEdit('### Sub-heading\n')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-bold font-mono hover:bg-slate-600">H3</button>
              <button type="button" (click)="insertAtCursorEdit('**bold**')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-bold font-mono hover:bg-slate-600"><b>B</b></button>
              <button type="button" (click)="insertAtCursorEdit('\`\`\`javascript\n// code here\n\`\`\`\n')" class="px-2 py-0.5 bg-amber-700 text-amber-100 rounded text-[10px] font-bold font-mono hover:bg-amber-600">&lbrace;&rbrace; Block</button>
              <button type="button" (click)="insertAtCursorEdit('\n![Description](https://images.unsplash.com/photo-ID?w=1000)\n')" class="px-2 py-0.5 bg-emerald-700 text-emerald-100 rounded text-[10px] font-bold hover:bg-emerald-600">🖼️ Image</button>
              <button type="button" (click)="insertAtCursorEdit('\n[VIDEO](https://youtube.com/watch?v=VIDEO_ID)\n')" class="px-2 py-0.5 bg-red-700 text-red-100 rounded text-[10px] font-bold hover:bg-red-600">🎬 Video</button>
              <button type="button" (click)="insertAtCursorEdit('\n> [!TIP]\n> tip text\n')" class="px-2 py-0.5 bg-indigo-700 text-indigo-100 rounded text-[10px] font-bold hover:bg-indigo-600">[!TIP]</button>
            </div>
            <textarea *ngIf="editSubtopicEditorTab === 'write'"
              id="edit-content-editor-textarea"
              [(ngModel)]="editingSubtopic.contentMarkdown" rows="22"
              class="w-full bg-slate-950 text-green-300 border border-slate-700 rounded-xl p-3 font-mono text-[11px] outline-none resize-y focus:border-indigo-500 leading-relaxed"></textarea>
            <div *ngIf="editSubtopicEditorTab === 'preview'"
              class="w-full min-h-[200px] max-h-[500px] overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-slate-800 dark:text-slate-100">
              <div [innerHTML]="renderMarkdown(editingSubtopic.contentMarkdown)"></div>
            </div>
          </div>
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">⚡ Interactive Code Snippet (Optional)</label>
            <textarea [(ngModel)]="editingSubtopic.codeExample" rows="4"
              class="w-full bg-slate-950 text-green-300 border border-slate-700 rounded-xl p-3 font-mono text-[11px] outline-none resize-y"></textarea>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="editingSubtopic = null" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Cancel</button>
            <button (click)="saveEditedSubtopic()" class="btn-primary px-5 py-2">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CREATE TOPIC MODAL ===== -->
    <div *ngIf="showTopicModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full">
        <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white m-0">
            <i class="fa-solid fa-folder-plus text-indigo-500 mr-2"></i>Create Guidebook Topic
          </h3>
          <button (click)="showTopicModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>
        <div class="space-y-4 text-xs">
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-2">Track *</label>
            <div class="flex gap-2">
              <button type="button" (click)="newTopic.category = 'JS'"
                [class.bg-amber-500]="newTopic.category === 'JS'" [class.text-slate-950]="newTopic.category === 'JS'"
                [class.bg-slate-100]="newTopic.category !== 'JS'" [class.dark:bg-slate-800]="newTopic.category !== 'JS'" [class.text-slate-700]="newTopic.category !== 'JS'"
                class="flex-1 py-2.5 rounded-xl font-bold font-mono transition-all">⚡ JS Track</button>
              <button type="button" (click)="newTopic.category = 'DSA'"
                [class.bg-indigo-600]="newTopic.category === 'DSA'" [class.text-white]="newTopic.category === 'DSA'"
                [class.bg-slate-100]="newTopic.category !== 'DSA'" [class.dark:bg-slate-800]="newTopic.category !== 'DSA'" [class.text-slate-700]="newTopic.category !== 'DSA'"
                class="flex-1 py-2.5 rounded-xl font-bold font-mono transition-all">🧩 DSA Track</button>
            </div>
          </div>
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Title *</label>
            <input type="text" [(ngModel)]="newTopic.title" placeholder="e.g. Asynchronous JavaScript &amp; Event Loop" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none focus:border-indigo-500">
          </div>
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Short Description</label>
            <textarea [(ngModel)]="newTopic.description" rows="2" placeholder="One-line summary of this topic..." class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Icon (lucide name)</label>
              <input type="text" [(ngModel)]="newTopic.icon" placeholder="book, zap, code..." class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
            </div>
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Order Index</label>
              <input type="number" [(ngModel)]="newTopic.orderIndex" min="0" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
            </div>
          </div>
          <div class="flex justify-end gap-2 pt-2">
            <button (click)="showTopicModal = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Cancel</button>
            <button (click)="submitNewTopic()" class="btn-primary px-5 py-2">Create Topic</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CREATE SUBTOPIC MODAL ===== -->
    <div *ngIf="showSubtopicModal" class="fixed inset-0 z-50 flex items-start justify-center p-2 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full my-2">
        <div class="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white m-0">
            <i class="fa-solid fa-file-pen text-amber-500 mr-2"></i>Add Subtopic Article
          </h3>
          <button (click)="showSubtopicModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>
        <div class="space-y-4 text-xs">

          <!-- Parent Topic -->
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Parent Topic *</label>
            <select [(ngModel)]="newSubtopic.topicId" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
              <option value="">— Select a topic —</option>
              <option *ngFor="let t of guidebookTopicsList" [value]="t.id">[{{t.category}}] {{t.title}}</option>
            </select>
          </div>

          <!-- Title + Description -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Article Title *</label>
              <input type="text" [(ngModel)]="newSubtopic.title" placeholder="e.g. Event Loop &amp; Microtask Queue" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none focus:border-amber-500">
            </div>
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Subtitle / Description</label>
              <input type="text" [(ngModel)]="newSubtopic.description" placeholder="One-line description..." class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
            </div>
          </div>

          <!-- Blog-style inline content editor with toolbar -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-mono font-bold text-slate-600 dark:text-slate-400">📝 Content (Markdown) *</label>
              <div class="flex gap-1">
                <button type="button" (click)="subtopicEditorTab = 'write'"
                  [class.bg-indigo-600]="subtopicEditorTab === 'write'" [class.text-white]="subtopicEditorTab === 'write'"
                  [class.bg-slate-100]="subtopicEditorTab !== 'write'" [class.text-slate-700]="subtopicEditorTab !== 'write'"
                  class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all">Write</button>
                <button type="button" (click)="subtopicEditorTab = 'preview'"
                  [class.bg-indigo-600]="subtopicEditorTab === 'preview'" [class.text-white]="subtopicEditorTab === 'preview'"
                  [class.bg-slate-100]="subtopicEditorTab !== 'preview'" [class.text-slate-700]="subtopicEditorTab !== 'preview'"
                  class="px-3 py-1 rounded-lg text-[10px] font-bold transition-all">Preview</button>
              </div>
            </div>

            <!-- Inline insert toolbar -->
            <div *ngIf="subtopicEditorTab === 'write'" class="flex gap-1 flex-wrap mb-1.5">
              <button type="button" (click)="insertAtCursor('## Heading\n')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-bold font-mono hover:bg-slate-600">H2</button>
              <button type="button" (click)="insertAtCursor('### Sub-heading\n')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-bold font-mono hover:bg-slate-600">H3</button>
              <button type="button" (click)="insertAtCursor('**bold text**')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-bold font-mono hover:bg-slate-600"><b>B</b></button>
              <button type="button" (click)="insertAtCursor('\`inline code\`')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-mono hover:bg-slate-600">\`code\`</button>
              <button type="button" (click)="insertAtCursor('\`\`\`javascript\n// code here\n\`\`\`\n')" class="px-2 py-0.5 bg-amber-700 text-amber-100 rounded text-[10px] font-bold font-mono hover:bg-amber-600">&lbrace;&rbrace; Block</button>
              <button type="button" (click)="insertAtCursor('\n![Description](https://images.unsplash.com/photo-ID?auto=format&fit=crop&w=1000&q=80)\n')" class="px-2 py-0.5 bg-emerald-700 text-emerald-100 rounded text-[10px] font-bold hover:bg-emerald-600">🖼️ Image</button>
              <button type="button" (click)="insertAtCursor('\n[VIDEO](https://youtube.com/watch?v=VIDEO_ID)\n')" class="px-2 py-0.5 bg-red-700 text-red-100 rounded text-[10px] font-bold hover:bg-red-600">🎬 Video</button>
              <button type="button" (click)="insertAtCursor('\n> blockquote\n')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-mono hover:bg-slate-600">&gt; Quote</button>
              <button type="button" (click)="insertAtCursor('\n> [!TIP]\n> tip text\n')" class="px-2 py-0.5 bg-indigo-700 text-indigo-100 rounded text-[10px] font-bold hover:bg-indigo-600">[!TIP]</button>
              <button type="button" (click)="insertAtCursor('\n---\n')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-mono hover:bg-slate-600">— HR</button>
              <button type="button" (click)="insertAtCursor('| Col1 | Col2 |\n|---|---|\n| val1 | val2 |\n')" class="px-2 py-0.5 bg-slate-700 text-slate-200 rounded text-[10px] font-mono hover:bg-slate-600">⊞ Table</button>
            </div>

            <p class="text-[10px] text-slate-400 font-mono mb-1">Mix text, 🖼️ images, 🎬 videos and code blocks freely — inline blog style.</p>
            <div class="flex items-center gap-2 mb-1.5">
              <button type="button" (click)="loadExample()" class="px-3 py-1 rounded-lg text-[10px] font-bold bg-violet-700 text-violet-100 hover:bg-violet-600 transition-all">📋 Load Full Example</button>
              <span class="text-[10px] text-slate-500">Shows all features: headings, code, image, video, table, tip</span>
            </div>
            <textarea *ngIf="subtopicEditorTab === 'write'"
              id="content-editor-textarea"
              [(ngModel)]="newSubtopic.contentMarkdown" rows="22"
              placeholder="# Your Article Title&#10;&#10;Write intro text here...&#10;&#10;![Cover Image](https://images.unsplash.com/photo-xxx)&#10;&#10;## Section&#10;&#10;More text...&#10;&#10;\`\`\`javascript&#10;// code example&#10;\`\`\`&#10;&#10;[VIDEO](https://youtube.com/watch?v=ID)&#10;&#10;More text..."
              class="w-full bg-slate-950 text-green-300 border border-slate-700 rounded-xl p-3 font-mono text-[11px] outline-none resize-y focus:border-indigo-500 leading-relaxed"></textarea>
            <div *ngIf="subtopicEditorTab === 'preview'"
              class="w-full min-h-[200px] max-h-[500px] overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-slate-800 dark:text-slate-100">
              <span class="text-slate-400 italic text-xs font-mono" *ngIf="!newSubtopic.contentMarkdown">Nothing to preview yet.</span>
              <div *ngIf="newSubtopic.contentMarkdown" [innerHTML]="renderMarkdown(newSubtopic.contentMarkdown)"></div>
            </div>
          </div>

          <!-- Code Example -->
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">⚡ Interactive Code Snippet (Optional — shown in playground panel)</label>
            <textarea [(ngModel)]="newSubtopic.codeExample" rows="5"
              placeholder="// Runnable code snippet&#10;console.log('Hello world');"
              class="w-full bg-slate-950 text-green-300 border border-slate-700 rounded-xl p-3 font-mono text-[11px] outline-none resize-y"></textarea>
          </div>

          <!-- Linked Problem IDs -->
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">🔗 Linked Problem IDs (comma-separated)</label>
            <input type="text" [(ngModel)]="newSubtopic.linkedProblemIdsRaw" placeholder="two-sum, valid-parentheses, binary-search" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none font-mono">
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button (click)="showSubtopicModal = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Cancel</button>
            <button (click)="submitNewSubtopic()" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold font-mono transition-all">Publish Article</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminComponent implements OnInit {
  activeTab: string = 'add-problem';
  
  usersList: any[] = [];
  allProblemsList: any[] = [];
  loading = false;
  showAuthModal = false;
  editingProb: any = null;

  newProb = {
    category: 'DSA' as 'DSA' | 'JS',
    weekNumber: 1,
    dayNumber: 1,
    title: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    patternTag: '',
    description: '',
    starterCode: `/**\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n    // Write code here\n}`,
    solutionHint: ''
  };

  testCasesList: AdminTestCase[] = [
    { input: '[1, 2, 3]', expectedOutput: '[3, 2, 1]' }
  ];

  editingSubtopic: any = null;
  editSubtopicEditorTab: 'write' | 'preview' = 'write';

  guidebookTopicsList: any[] = [];
  guidebookFilter: string = 'ALL';
  showTopicModal = false;
  newTopic = { title: '', description: '', category: 'JS' as 'DSA' | 'JS', icon: 'book', orderIndex: 0 };
  showSubtopicModal = false;
  subtopicEditorTab: 'write' | 'preview' = 'write';
  newSubtopic = { topicId: '', title: '', description: '', contentMarkdown: '', codeExample: '', linkedProblemIdsRaw: '' };
  confirmDeleteTopicId: string | null = null;
  confirmDeleteSubtopicId: string | null = null;

  get filteredGuidebookTopics(): any[] {
    if (this.guidebookFilter === 'ALL') return this.guidebookTopicsList;
    return this.guidebookTopicsList.filter(t => t.category === this.guidebookFilter);
  }

  addTestCaseField() {
    this.testCasesList.push({ input: '', expectedOutput: '' });
  }

  removeTestCaseField(index: number) {
    if (this.testCasesList.length > 1) {
      this.testCasesList.splice(index, 1);
    }
  }

  // Multiselect Mock Test Controls
  availableCategories: string[] = ['HashMap', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Linked List', 'Stack', 'Recursion'];
  selectedCategories: string[] = [];
  mockSearchQuery = '';
  // Each entry stores { id, minutes } for per-question timers
  selectedMockProblems: { id: string; minutes: number }[] = [
    { id: 'two-sum', minutes: 20 },
    { id: 'longest-substring-without-repeating-characters', minutes: 20 },
    { id: 'binary-search', minutes: 15 },
    { id: 'valid-parentheses', minutes: 15 },
    { id: '3sum', minutes: 25 }
  ];

  get selectedMockProblemIds(): string[] {
    return this.selectedMockProblems.map(p => p.id);
  }

  get totalExamMinutes(): number {
    return this.selectedMockProblems.reduce((sum, p) => sum + (p.minutes || 15), 0);
  }

  constructor(
    private dsaService: DsaService,
    public authService: AuthService,
    private toast: ToastService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadUsersActivity();
    this.loadAllProblems();
    this.loadGuidebookTopics();
  }

  loadGuidebookTopics() {
    this.dsaService.getGuidebookTopics().subscribe(topics => {
      this.guidebookTopicsList = topics;
    });
  }

  renderMarkdown(md: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(this.formatMarkdown(md));
  }

  loadExample() {
    this.newSubtopic.contentMarkdown = [
      '# JavaScript Closures — Complete Guide',
      '',
      'A **closure** is a function that retains access to its outer scope even after the outer function has returned.',
      '',
      '## How It Works',
      '',
      'When a function is defined, it captures a reference to the **Lexical Environment** where it was created.',
      '',
      '```javascript',
      'function makeCounter(start = 0) {',
      '  let count = start; // captured in closure',
      '  return {',
      '    increment: () => ++count,',
      '    value:     () => count',
      '  };',
      '}',
      '',
      'const c = makeCounter(10);',
      'console.log(c.increment()); // 11',
      'console.log(c.value());     // 11',
      '```',
      '',
      '> [!TIP]',
      '> Closures keep variables alive on the heap even after their parent function returns.',
      '',
      '## Diagram',
      '',
      '![Closure memory model](https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&w=1000&q=80)',
      '',
      '## Video Explanation',
      '',
      '[VIDEO](https://youtube.com/watch?v=vKJpN5FAeF4)',
      '',
      '## Common Patterns',
      '',
      '| Pattern | Use Case |',
      '|---|---|',
      '| Private state | `createCounter()` |',
      '| Memoization | Cache results in a `Map` |',
      '| Debounce | Retain `timerId` across calls |',
      '',
      '---',
      '',
      '> Always prefer `let` over `var` inside loops to avoid closure bugs.'
    ].join('\n');
    this.subtopicEditorTab = 'write';
  }

  // Converts markdown to styled HTML for admin preview panel
  formatMarkdown(markdown: string): string {
    if (!markdown) return '';
    let html = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    html = html.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_: string, lang: string, code: string) => {
      const esc = code.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const lbl = lang ? `<span style="position:absolute;top:8px;right:12px;font-size:10px;color:#94a3b8;font-family:monospace">${lang}</span>` : '';
      return `<div style="position:relative;margin:18px 0;border-radius:12px;overflow:hidden;border:1px solid #334155">${lbl}<pre style="background:#020617;color:#86efac;padding:${lang ? '28px' : '14px'} 14px 14px;font-size:11px;font-family:monospace;overflow-x:auto;margin:0"><code>${esc}</code></pre></div>`;
    });
    html = html.replace(/\[VIDEO\]\((https?:\/\/[^\)]+)\)/g, (_: string, url: string) => {
      const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?#]+)/);
      if (m) {
        const id = m[1];
        return `<div style="margin:20px 0;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,.08)"><div style="position:relative"><img src="https://img.youtube.com/vi/${id}/maxresdefault.jpg" style="width:100%;max-height:220px;object-fit:cover"/><div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.3)"><div style="width:52px;height:52px;background:#dc2626;border-radius:50%;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" fill="white" width="22"><path d="M8 5v14l11-7z"/></svg></div></div><a href="${url}" target="_blank" rel="noopener" style="position:absolute;inset:0"></a></div><p style="margin:0;padding:7px;background:#f8fafc;font-size:11px;font-family:monospace;color:#64748b;text-align:center">▶ Watch on YouTube</p></div>`;
      }
      return `<a href="${url}" target="_blank" style="color:#6366f1">${url}</a>`;
    });
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<div style="margin:18px 0;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0"><img src="$2" alt="$1" style="width:100%;max-height:260px;object-fit:cover" loading="lazy"/><p style="margin:0;padding:7px;background:#f8fafc;font-size:11px;font-family:monospace;color:#64748b;text-align:center;font-style:italic">$1</p></div>');
    html = html
      .replace(/^### (.*$)/gim, '<h3 style="font-size:16px;font-weight:800;margin:20px 0 8px">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 style="font-size:18px;font-weight:800;margin:24px 0 10px;padding-bottom:6px;border-bottom:1px solid #e2e8f0">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 style="font-size:21px;font-weight:800;margin:6px 0 14px">$1</h1>');
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;color:#6366f1;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:11px">$1</code>');
    html = html
      .replace(/^> \[!TIP\]\n> (.*$)/gim, '<div style="margin:14px 0;padding:10px 14px;border-radius:10px;background:#f0fdf4;border-left:4px solid #22c55e;font-size:12px;color:#166534">💡 <strong>Tip:</strong> $1</div>')
      .replace(/^> \[!TIP\] (.*$)/gim, '<div style="margin:14px 0;padding:10px 14px;border-radius:10px;background:#f0fdf4;border-left:4px solid #22c55e;font-size:12px;color:#166534">💡 <strong>Tip:</strong> $1</div>')
      .replace(/^> (.*$)/gim, '<blockquote style="margin:10px 0;padding:10px 14px;border-radius:10px;background:#f1f5f9;border-left:4px solid #6366f1;font-size:12px;color:#374151">$1</blockquote>');
    html = html.replace(/^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/gim, (_: string, hdr: string, rows: string) => {
      const ths = hdr.split('|').filter((c: string) => c.trim()).map((c: string) => `<th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;border-bottom:1px solid #e2e8f0">${c.trim()}</th>`).join('');
      const trs = rows.trim().split('\n').map((row: string) => `<tr>${row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td style="padding:7px 10px;font-size:11px;border-bottom:1px solid #f1f5f9">${c.trim()}</td>`).join('')}</tr>`).join('');
      return `<div style="margin:14px 0;overflow-x:auto;border-radius:10px;border:1px solid #e2e8f0"><table style="width:100%;border-collapse:collapse"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
    });
    html = html.replace(/^---$/gim, '<hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0"/>');
    html = html.replace(/\n\n/g, '</p><p style="margin-bottom:12px">');
    return `<p style="margin-bottom:12px;font-size:13px;line-height:1.7">${html}</p>`;
  }

  insertAtCursorEdit(text: string) {
    const textarea = document.getElementById('edit-content-editor-textarea') as HTMLTextAreaElement;
    if (!textarea || !this.editingSubtopic) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? start;
    this.editingSubtopic.contentMarkdown = this.editingSubtopic.contentMarkdown.substring(0, start) + text + this.editingSubtopic.contentMarkdown.substring(end);
    setTimeout(() => { textarea.selectionStart = textarea.selectionEnd = start + text.length; textarea.focus(); }, 0);
  }

  openEditSubtopicModal(sub: any) {
    this.editingSubtopic = JSON.parse(JSON.stringify(sub));
    this.editSubtopicEditorTab = 'write';
  }

  saveEditedSubtopic() {
    if (!this.editingSubtopic) return;
    const user = this.authService.currentUserSignal();
    if (!user) return;
    this.dsaService.updateGuidebookSubtopic(this.editingSubtopic.id, {
      adminUserId: user.id,
      title: this.editingSubtopic.title,
      description: this.editingSubtopic.description,
      contentMarkdown: this.editingSubtopic.contentMarkdown,
      codeExample: this.editingSubtopic.codeExample
    }).subscribe({
      next: () => { this.toast.success('Article updated!'); this.editingSubtopic = null; this.loadGuidebookTopics(); },
      error: (e: any) => this.toast.error(e.error?.error || 'Failed to update.')
    });
  }

  insertAtCursor(text: string) {
    const textarea = document.getElementById('content-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) { this.newSubtopic.contentMarkdown += text; return; }
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? start;
    const before = this.newSubtopic.contentMarkdown.substring(0, start);
    const after = this.newSubtopic.contentMarkdown.substring(end);
    this.newSubtopic.contentMarkdown = before + text + after;
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  }

  openTopicModal() {
    this.newTopic = { title: '', description: '', category: 'JS', icon: 'book', orderIndex: 0 };
    this.showTopicModal = true;
  }

  submitNewTopic() {
    if (!this.newTopic.title.trim()) { this.toast.error('Topic title is required.'); return; }
    const user = this.authService.currentUserSignal();
    if (!user) return;
    this.dsaService.addGuidebookTopic({ adminUserId: user.id, ...this.newTopic }).subscribe({
      next: () => { this.toast.success('Topic created!'); this.showTopicModal = false; this.loadGuidebookTopics(); },
      error: (e: any) => this.toast.error(e.error?.error || 'Failed to create topic.')
    });
  }

  openSubtopicModal() {
    if (this.guidebookTopicsList.length === 0) {
      this.toast.error('Create a topic first before adding subtopics.');
      return;
    }
    this.newSubtopic = { topicId: this.guidebookTopicsList[0].id, title: '', description: '', contentMarkdown: '', codeExample: '', linkedProblemIdsRaw: '' };
    this.subtopicEditorTab = 'write';
    this.showSubtopicModal = true;
  }

  submitNewSubtopic() {
    if (!this.newSubtopic.topicId || !this.newSubtopic.title.trim() || !this.newSubtopic.contentMarkdown.trim()) {
      this.toast.error('Topic, title and content are required.');
      return;
    }
    const user = this.authService.currentUserSignal();
    if (!user) return;
    const linkedProblemIds = this.newSubtopic.linkedProblemIdsRaw.split(',').map(s => s.trim()).filter(Boolean);
    this.dsaService.addGuidebookSubtopic({
      adminUserId: user.id,
      topicId: this.newSubtopic.topicId,
      title: this.newSubtopic.title,
      description: this.newSubtopic.description,
      contentMarkdown: this.newSubtopic.contentMarkdown,
      codeExample: this.newSubtopic.codeExample,
      linkedProblemIds
    }).subscribe({
      next: () => { this.toast.success('Article published!'); this.showSubtopicModal = false; this.loadGuidebookTopics(); },
      error: (e: any) => this.toast.error(e.error?.error || 'Failed to publish article.')
    });
  }

  doDeleteTopic(id: string) {
    const user = this.authService.currentUserSignal();
    if (!user) return;
    this.dsaService.deleteGuidebookTopic(id, user.id).subscribe({
      next: () => { this.toast.success('Topic deleted.'); this.confirmDeleteTopicId = null; this.loadGuidebookTopics(); },
      error: () => this.toast.error('Failed to delete topic.')
    });
  }

  doDeleteSubtopic(id: string) {
    const user = this.authService.currentUserSignal();
    if (!user) return;
    this.dsaService.deleteGuidebookSubtopic(id, user.id).subscribe({
      next: () => { this.toast.success('Article deleted.'); this.confirmDeleteSubtopicId = null; this.loadGuidebookTopics(); },
      error: () => this.toast.error('Failed to delete article.')
    });
  }

  isAdmin(): boolean {
    const user = this.authService.currentUserSignal();
    return user ? user.role === 'admin' : false;
  }

  loadUsersActivity() {
    this.dsaService.getUsersActivity().subscribe(users => {
      this.usersList = users;
    });
  }

  loadAllProblems() {
    this.dsaService.fetchCurriculum('').subscribe(data => {
      const curriculum = this.dsaService.curriculumSignal();
      const list: any[] = [];
      for (const day of curriculum) {
        for (const p of day.problems) {
          list.push({ ...p, dayNumber: day.dayNumber });
        }
      }
      this.allProblemsList = list;
    });
  }

  toggleCategory(cat: string) {
    const idx = this.selectedCategories.indexOf(cat);
    if (idx >= 0) {
      this.selectedCategories.splice(idx, 1);
    } else {
      this.selectedCategories.push(cat);
    }
  }

  get filteredMockProblems() {
    let list = this.allProblemsList;

    // Filter by selected categories
    if (this.selectedCategories.length > 0) {
      list = list.filter(p => this.selectedCategories.includes(p.patternTag));
    }

    // Filter by search query
    const q = this.mockSearchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.patternTag || '').toLowerCase().includes(q)
      );
    }

    // Sort: selected questions float to the top
    return list.sort((a, b) => {
      const aSelected = this.isSelectedMockProblem(a.id) ? 0 : 1;
      const bSelected = this.isSelectedMockProblem(b.id) ? 0 : 1;
      return aSelected - bSelected;
    });
  }

  isSelectedMockProblem(id: string): boolean {
    return this.selectedMockProblems.some(p => p.id === id);
  }

  getQuestionMinutes(id: string): number {
    const found = this.selectedMockProblems.find(p => p.id === id);
    return found ? found.minutes : 15;
  }

  setQuestionMinutes(id: string, event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    const found = this.selectedMockProblems.find(p => p.id === id);
    if (found) found.minutes = isNaN(val) || val < 1 ? 15 : Math.min(val, 60);
  }

  toggleMockProblem(id: string) {
    const idx = this.selectedMockProblems.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.selectedMockProblems.splice(idx, 1);
    } else {
      this.selectedMockProblems.push({ id, minutes: 20 });
    }
  }

  submitProblem() {
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin login required to publish questions.');
      return;
    }
    if (!this.newProb.title || !this.newProb.description || !this.newProb.starterCode) {
      this.toast.error('Please fill out problem title, description, and starter code.');
      return;
    }
    for (let i = 0; i < this.testCasesList.length; i++) {
      if (!this.testCasesList[i].input || !this.testCasesList[i].expectedOutput) {
        this.toast.error(`Test Case ${i + 1} is missing input or expected output.`);
        return;
      }
    }

    this.loading = true;
    const loadId = this.toast.loading('Publishing question to curriculum...');

    const payload = {
      adminUserId: user.id,
      ...this.newProb,
      testCases: this.testCasesList
    };

    this.dsaService.addAdminProblem(payload).subscribe({
      next: () => {
        this.loading = false;
        this.toast.dismiss(loadId);
        this.toast.success(`"${this.newProb.title}" published with NEW QUESTION tag! 🎉`);
        this.newProb.title = '';
        this.newProb.patternTag = '';
        this.newProb.description = '';
        this.testCasesList = [{ input: '[1, 2, 3]', expectedOutput: '[3, 2, 1]' }];
        this.dsaService.fetchCurriculum('').subscribe();
        this.loadAllProblems();
      },
      error: (err) => {
        this.loading = false;
        this.toast.dismiss(loadId);
        this.toast.error(err.error?.error || 'Failed to publish question.');
      }
    });
  }

  saveMockTest() {
    if (this.selectedMockProblems.length === 0) {
      this.toast.error('Please select at least one question before saving.');
      return;
    }
    const loadId = this.toast.loading('Saving exam configuration...');
    this.dsaService.updateMockTestConfig(this.selectedMockProblems).subscribe({
      next: () => {
        this.toast.dismiss(loadId);
        this.toast.success(`Exam saved! ${this.selectedMockProblems.length} questions · ${this.totalExamMinutes} min total`);
      },
      error: () => {
        this.toast.dismiss(loadId);
        this.toast.error('Failed to save exam configuration.');
      }
    });
  }

  openEditModal(p: any) {
    this.editingProb = JSON.parse(JSON.stringify(p));
  }

  saveEditedProblem() {
    if (!this.editingProb) return;
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin login required.');
      return;
    }

    const loadId = this.toast.loading('Updating question...');
    this.dsaService.updateAdminProblem(this.editingProb.id, {
      adminUserId: user.id,
      ...this.editingProb
    }).subscribe({
      next: () => {
        this.toast.dismiss(loadId);
        this.toast.success(`"${this.editingProb.title}" updated successfully!`);
        this.editingProb = null;
        this.loadAllProblems();
        this.dsaService.fetchCurriculum('').subscribe();
      },
      error: (err) => {
        this.toast.dismiss(loadId);
        this.toast.error(err.error?.error || 'Failed to update problem.');
      }
    });
  }

  deleteProblem(p: any) {
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin login required.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${p.title}"?`)) return;

    const loadId = this.toast.loading('Deleting question...');
    this.dsaService.deleteAdminProblem(p.id, user.id).subscribe({
      next: () => {
        this.toast.dismiss(loadId);
        this.toast.success(`"${p.title}" deleted from curriculum.`);
        this.loadAllProblems();
        this.dsaService.fetchCurriculum('').subscribe();
      },
      error: (err) => {
        this.toast.dismiss(loadId);
        this.toast.error(err.error?.error || 'Failed to delete problem.');
      }
    });
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
