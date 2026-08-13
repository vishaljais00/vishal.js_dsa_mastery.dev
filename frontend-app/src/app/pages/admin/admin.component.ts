import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
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
        </div>

        <!-- TAB 1: ADD NEW QUESTION -->
        <div *ngIf="activeTab === 'add-problem'" class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-4xl">
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Create & Assign New Problem</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Newly added questions automatically receive a prominent <span class="bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded font-mono font-bold">NEW QUESTION ADDED</span> tag on the roadmap.</p>


          <form (ngSubmit)="submitProblem()" class="space-y-4">

            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
    weekNumber: 1,
    dayNumber: 1,
    title: '',
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    patternTag: '',
    description: '',
    starterCode: `/**\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n    // Write code here\n}`,
    solutionHint: ''
  };

  // Dynamic test cases builder
  testCasesList: AdminTestCase[] = [
    { input: '[1, 2, 3]', expectedOutput: '[3, 2, 1]' }
  ];

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
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadUsersActivity();
    this.loadAllProblems();
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

  addTestCaseField() {
    this.testCasesList.push({ input: '', expectedOutput: '' });
  }

  removeTestCaseField(index: number) {
    if (this.testCasesList.length > 1) {
      this.testCasesList.splice(index, 1);
    }
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
