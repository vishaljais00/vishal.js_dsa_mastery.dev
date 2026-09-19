import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DsaService } from '../../../../core/services/dsa.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MonacoEditorComponent } from '../../../../shared/monaco-editor/monaco-editor.component';

export interface AdminTestCase {
  input: string;
  expectedOutput: string;
}

@Component({
  selector: 'app-admin-add-problem',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorComponent],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-4xl mx-auto">
      <div class="mb-6 pb-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white m-0">Create &amp; Publish New Problem</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Inject a new problem directly into the 30-day DSA or JS curriculum.</p>
        </div>
        <span class="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 rounded-full font-mono text-xs font-bold">
          ✨ Authoring Mode
        </span>
      </div>

      <form (ngSubmit)="submitProblem()" class="space-y-6 text-xs font-medium">
        
        <!-- ROW 1: CATEGORY, WEEK, DAY, DIFFICULTY -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1.5">Track Category</label>
            <select [(ngModel)]="newProb.category" name="category" class="w-full bg-slate-50 dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none font-bold">
              <option value="DSA">DSA (Algorithms)</option>
              <option value="JS">JS (Language Fundamentals)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1.5">Week Number</label>
            <select [(ngModel)]="newProb.weekNumber" name="weekNumber" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none font-medium">
              <option [ngValue]="1">Week 1 (Fundamentals)</option>
              <option [ngValue]="2">Week 2 (Two Pointers &amp; Sliding Window)</option>
              <option [ngValue]="3">Week 3 (Binary Search &amp; Linked List)</option>
              <option [ngValue]="4">Week 4 (Stack, Queue, Recursion)</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1.5">Day Number (1 to 30)</label>
            <input type="number" [(ngModel)]="newProb.dayNumber" name="dayNumber" min="1" max="30" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none font-medium">
          </div>

          <div>
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1.5">Difficulty Level</label>
            <select [(ngModel)]="newProb.difficulty" name="difficulty" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none font-medium">
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <!-- ROW 2: TITLE & PATTERN TAG -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1.5">Problem Title *</label>
            <input type="text" [(ngModel)]="newProb.title" name="title" placeholder="e.g. Reverse Linked List" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none font-medium focus:border-indigo-500">
          </div>

          <div>
            <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1.5">Pattern Tag *</label>
            <input type="text" [(ngModel)]="newProb.patternTag" name="patternTag" placeholder="e.g. Two Pointers / Linked List" required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none font-medium focus:border-indigo-500">
          </div>
        </div>

        <!-- ROW 3: DESCRIPTION -->
        <div>
          <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1.5">Problem Description *</label>
          <textarea [(ngModel)]="newProb.description" name="description" rows="4" placeholder="Write detailed problem prompt, inputs, constraints, and requirements..." required class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-white outline-none font-medium resize-y focus:border-indigo-500 leading-relaxed"></textarea>
        </div>

        <!-- ROW 4: STARTER CODE (MONACO EDITOR) -->
        <div>
          <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1.5">Starter Code Template *</label>
          <div class="h-[240px] border border-slate-300 dark:border-slate-700 rounded-2xl overflow-hidden shadow-inner">
            <app-monaco-editor 
              [value]="newProb.starterCode" 
              (valueChange)="newProb.starterCode = $event" 
              [language]="'javascript'">
            </app-monaco-editor>
          </div>
        </div>

        <!-- ROW 5: DYNAMIC TEST CASES FORM BUILDER -->
        <div class="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
          <div class="flex items-center justify-between">
            <span class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wide">
              🧪 Sample Test Cases (Input &amp; Expected Output Columns)
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

        <!-- ROW 6: SOLUTION HINT -->
        <div>
          <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1.5">Solution Hint (Optional)</label>
          <input type="text" [(ngModel)]="newProb.solutionHint" name="solutionHint" placeholder="e.g. Use two pointers left and right moving towards center" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-900 dark:text-white outline-none font-medium">
        </div>

        <!-- SUBMIT BUTTON -->
        <div class="pt-2">
          <button type="submit" [disabled]="loading" class="btn-primary py-3 text-sm w-full justify-center shadow-lg">
            <i class="fa-solid fa-plus mr-1.5"></i> Publish Question to Curriculum
          </button>
        </div>
      </form>
    </div>
  `
})
export class AdminAddProblemComponent {
  loading = false;

  newProb = {
    category: 'DSA' as 'DSA' | 'JS',
    weekNumber: 1,
    dayNumber: 1,
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    title: '',
    patternTag: '',
    description: '',
    starterCode: `/**\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n    // Write solution here\n}`,
    solutionHint: ''
  };

  testCasesList: AdminTestCase[] = [
    { input: '[1, 2, 3]', expectedOutput: '[3, 2, 1]' }
  ];

  constructor(
    private dsaService: DsaService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  addTestCaseField() {
    this.testCasesList.push({ input: '', expectedOutput: '' });
  }

  removeTestCaseField(idx: number) {
    if (this.testCasesList.length > 1) {
      this.testCasesList.splice(idx, 1);
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
        this.toast.success(`"${this.newProb.title}" published successfully!`);
        this.newProb.title = '';
        this.newProb.patternTag = '';
        this.newProb.description = '';
        this.testCasesList = [{ input: '[1, 2, 3]', expectedOutput: '[3, 2, 1]' }];
        this.dsaService.fetchCurriculum('').subscribe();
      },
      error: (err) => {
        this.loading = false;
        this.toast.dismiss(loadId);
        this.toast.error(err.error?.error || 'Failed to publish problem.');
      }
    });
  }
}
