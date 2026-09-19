import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DsaService, Problem } from '../../../../core/services/dsa.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MonacoEditorComponent } from '../../../../shared/monaco-editor/monaco-editor.component';

export interface AdminTestCase {
  input: string;
  expectedOutput: string;
}

@Component({
  selector: 'app-admin-problems',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorComponent],
  template: `
    <!-- TAB 1: ADD NEW QUESTION -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      <!-- Create Problem Form -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <h2 class="text-xl font-extrabold text-slate-900 dark:text-white mb-2">Create &amp; Publish New Problem</h2>
        <p class="text-xs text-slate-500 dark:text-slate-400 mb-6">Instantly inject a new problem into the core 30-day curriculum.</p>

        <form (ngSubmit)="submitProblem()" class="space-y-4 text-xs font-medium">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Track Category</label>
              <select [(ngModel)]="newProb.category" name="category" class="w-full bg-slate-50 dark:bg-slate-800 border border-indigo-300 dark:border-indigo-700 rounded-xl p-2.5 text-sm text-slate-900 dark:text-white outline-none font-bold">
                <option value="DSA">DSA (Algorithms)</option>
                <option value="JS">JS (Language Fundamentals)</option>
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
            <div class="h-[250px] border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
              <app-monaco-editor 
                [value]="newProb.starterCode" 
                (valueChange)="newProb.starterCode = $event" 
                [language]="'javascript'">
              </app-monaco-editor>
            </div>
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

          <button type="submit" [disabled]="loading" class="btn-primary py-3 text-sm w-full justify-center">
            <i class="fa-solid fa-plus mr-1"></i> Publish Question to Curriculum
          </button>
        </form>
      </div>

      <!-- Manage Curriculum Questions List -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 class="text-xl font-extrabold text-slate-900 dark:text-white m-0">Manage Curriculum Questions</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">Edit question details, test cases, and starter code.</p>
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
                  <span class="font-bold text-slate-900 dark:text-white block font-mono">Day {{p.dayNumber}}: {{p.title}}</span>
                  <span class="text-[10px] text-slate-400 font-mono">Week {{p.weekNumber}} · {{p.category}}</span>
                </td>
                <td class="py-3 px-4">
                  <span [class]="getDifficultyClass(p.difficulty)">{{p.difficulty}}</span>
                </td>
                <td class="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                  {{p.patternTag}}
                </td>
                <td class="py-3 px-4 text-right space-x-2">
                  <button (click)="startEditProblem(p)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-mono font-bold text-[10px]">
                    <i class="fa-solid fa-edit"></i> Edit
                  </button>
                  <button (click)="deleteProblem(p)" class="px-2 py-1 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded font-mono font-bold text-[10px]">
                    <i class="fa-solid fa-trash"></i> Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Edit Problem Modal Overlay -->
    <div *ngIf="editingProb" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white m-0 font-mono">Edit Problem: {{editingProb.title}}</h3>
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
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Starter Code Template</label>
            <div class="h-[200px] border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
              <app-monaco-editor 
                [value]="editingProb.starterCode || ''" 
                (valueChange)="editingProb.starterCode = $event" 
                [language]="'javascript'">
              </app-monaco-editor>
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
  `
})
export class AdminProblemsComponent implements OnInit {
  allProblemsList: any[] = [];
  loading = false;
  editingProb: any = null;

  newProb = {
    category: 'DSA' as 'DSA' | 'JS',
    weekNumber: 1,
    dayNumber: 1,
    difficulty: 'Easy' as 'Easy' | 'Medium' | 'Hard',
    title: '',
    patternTag: '',
    description: '',
    starterCode: `/**\n * @param {any} input\n * @return {any}\n */\nfunction solution(input) {\n    // Write code here\n}`,
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

  ngOnInit() {
    this.refreshProblems();
  }

  refreshProblems() {
    this.dsaService.fetchCurriculum('').subscribe(() => {
      const curriculum = this.dsaService.curriculumSignal();
      const list: any[] = [];
      for (const day of curriculum) {
        if (day.problems) {
          for (const p of day.problems) {
            list.push({ ...p, dayNumber: day.dayNumber });
          }
        }
      }
      this.allProblemsList = list;
    });
  }

  getDifficultyClass(diff: string): string {
    switch (diff) {
      case 'Easy': return 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      case 'Medium': return 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      case 'Hard': return 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
      default: return 'px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  }

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
        this.refreshProblems();
      },
      error: (err) => {
        this.loading = false;
        this.toast.dismiss(loadId);
        this.toast.error(err.error?.error || 'Failed to publish problem.');
      }
    });
  }

  startEditProblem(p: any) {
    this.editingProb = JSON.parse(JSON.stringify(p));
  }

  saveEditedProblem() {
    if (!this.editingProb) return;
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin permissions required.');
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
        this.refreshProblems();
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
      this.toast.error('Admin permissions required.');
      return;
    }
    if (!confirm(`Are you sure you want to delete "${p.title}"?`)) {
      return;
    }

    const loadId = this.toast.loading('Deleting question...');
    this.dsaService.deleteAdminProblem(p.id, user.id).subscribe({
      next: () => {
        this.toast.dismiss(loadId);
        this.toast.success('Problem deleted successfully.');
        this.refreshProblems();
      },
      error: (err) => {
        this.toast.dismiss(loadId);
        this.toast.error(err.error?.error || 'Failed to delete problem.');
      }
    });
  }
}
