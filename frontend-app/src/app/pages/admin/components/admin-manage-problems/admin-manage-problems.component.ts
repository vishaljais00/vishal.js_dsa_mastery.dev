import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DsaService } from '../../../../core/services/dsa.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MonacoEditorComponent } from '../../../../shared/monaco-editor/monaco-editor.component';

@Component({
  selector: 'app-admin-manage-problems',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorComponent],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-6xl mx-auto">
      
      <!-- Header Bar & Search / Category Filters -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white m-0">Manage Curriculum Questions</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Search, edit starter code, update descriptions, and manage curriculum questions.</p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <!-- Category Filter Pills -->
          <div class="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700/60">
            <button
              *ngFor="let cat of ['ALL', 'DSA', 'JS']"
              (click)="selectedCategory = cat"
              [class.bg-indigo-600]="selectedCategory === cat"
              [class.text-white]="selectedCategory === cat"
              [class.text-slate-600]="selectedCategory !== cat"
              [class.dark:text-slate-300]="selectedCategory !== cat"
              class="px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all"
            >
              {{cat}}
            </button>
          </div>

          <!-- Search Input -->
          <div class="relative w-full sm:w-64">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              placeholder="Search title, tag..."
              class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-indigo-500 font-medium"
            >
          </div>

          <span class="text-xs font-mono font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl">
            {{getFilteredProblems().length}} / {{allProblemsList.length}} Questions
          </span>
        </div>
      </div>

      <!-- Curriculum Questions Table -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-400">
              <th class="py-3 px-4">Title &amp; Day</th>
              <th class="py-3 px-4">Track</th>
              <th class="py-3 px-4">Difficulty</th>
              <th class="py-3 px-4">Pattern Tag</th>
              <th class="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-medium text-slate-700 dark:text-slate-200">
            <tr *ngFor="let p of getFilteredProblems()" class="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
              <td class="py-3.5 px-4">
                <span class="font-bold text-slate-900 dark:text-white block font-mono text-sm">Day {{p.dayNumber}}: {{p.title}}</span>
                <span class="text-[10px] text-slate-400 font-mono">Week {{p.weekNumber}} · ID: {{p.id}}</span>
              </td>
              <td class="py-3.5 px-4 font-mono font-bold">
                <span [class.bg-indigo-100]="p.category === 'DSA'" [class.text-indigo-800]="p.category === 'DSA'" [class.bg-amber-100]="p.category === 'JS'" [class.text-amber-800]="p.category === 'JS'" class="px-2 py-0.5 rounded text-[10px] dark:bg-slate-800 dark:text-slate-300">
                  {{p.category || 'DSA'}}
                </span>
              </td>
              <td class="py-3.5 px-4">
                <span [class]="getDifficultyClass(p.difficulty)">{{p.difficulty}}</span>
              </td>
              <td class="py-3.5 px-4 font-mono text-slate-500 dark:text-slate-400">
                {{p.patternTag}}
              </td>
              <td class="py-3.5 px-4 text-right space-x-2">
                <button (click)="startEditProblem(p)" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-mono font-bold text-xs transition-all">
                  <i class="fa-solid fa-edit mr-1"></i> Edit
                </button>
                <button (click)="deleteProblem(p)" class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 rounded-xl font-mono font-bold text-xs transition-all">
                  <i class="fa-solid fa-trash mr-1"></i> Delete
                </button>
              </td>
            </tr>
            <tr *ngIf="getFilteredProblems().length === 0">
              <td colspan="5" class="py-8 text-center text-slate-400 font-mono text-xs italic">
                No matching curriculum questions found.
              </td>
            </tr>
          </tbody>
        </table>
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
export class AdminManageProblemsComponent implements OnInit {
  allProblemsList: any[] = [];
  selectedCategory: string = 'ALL';
  searchQuery: string = '';
  editingProb: any = null;

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

  getFilteredProblems(): any[] {
    let list = this.allProblemsList;
    if (this.selectedCategory !== 'ALL') {
      list = list.filter(p => (p.category || 'DSA') === this.selectedCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        (p.patternTag || '').toLowerCase().includes(q) ||
        (p.id || '').toLowerCase().includes(q)
      );
    }
    return list;
  }

  getDifficultyClass(diff: string): string {
    switch (diff) {
      case 'Easy': return 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      case 'Medium': return 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      case 'Hard': return 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
      default: return 'px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
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
