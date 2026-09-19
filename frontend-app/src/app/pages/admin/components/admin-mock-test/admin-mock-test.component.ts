import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DsaService } from '../../../../core/services/dsa.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-admin-mock-test',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm max-w-4xl mx-auto">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white mb-1">Day 30 Mock Interview Exam Controls</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">Select track category to configure DSA or JS Mock Exam questions independently.</p>
        </div>

        <!-- TRACK SWITCHER BUTTONS -->
        <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl shrink-0">
          <button
            type="button"
            (click)="setExamTrack('DSA')"
            [class.bg-white]="selectedExamTrack === 'DSA'"
            [class.dark:bg-slate-900]="selectedExamTrack === 'DSA'"
            [class.text-indigo-600]="selectedExamTrack === 'DSA'"
            [class.shadow-xs]="selectedExamTrack === 'DSA'"
            [class.text-slate-600]="selectedExamTrack !== 'DSA'"
            [class.dark:text-slate-400]="selectedExamTrack !== 'DSA'"
            class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2"
          >
            <i class="fa-solid fa-square-code"></i> DSA Track Exam
          </button>
          <button
            type="button"
            (click)="setExamTrack('JS')"
            [class.bg-white]="selectedExamTrack === 'JS'"
            [class.dark:bg-slate-900]="selectedExamTrack === 'JS'"
            [class.text-indigo-600]="selectedExamTrack === 'JS'"
            [class.shadow-xs]="selectedExamTrack === 'JS'"
            [class.text-slate-600]="selectedExamTrack !== 'JS'"
            [class.dark:text-slate-400]="selectedExamTrack !== 'JS'"
            class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2"
          >
            <i class="fa-brands fa-js"></i> JS Track Exam
          </button>
        </div>
      </div>

      <form (ngSubmit)="saveMockTest()" class="space-y-6">

        <!-- STEP 1: CATEGORY MULTISELECT FILTER -->
        <div>
          <label class="block text-xs font-mono font-bold text-slate-600 dark:text-slate-400 mb-2">
            Step 1: Choose Categories (Multi-select)
          </label>
          <div class="flex flex-wrap gap-2">
            <button
              *ngFor="let cat of availableCategories"
              type="button"
              (click)="toggleCategoryFilter(cat)"
              [class.bg-indigo-600]="selectedCategories.includes(cat)"
              [class.text-white]="selectedCategories.includes(cat)"
              [class.bg-slate-100]="!selectedCategories.includes(cat)"
              [class.dark:bg-slate-800]="!selectedCategories.includes(cat)"
              [class.text-slate-600]="!selectedCategories.includes(cat)"
              [class.dark:text-slate-300]="!selectedCategories.includes(cat)"
              class="px-3 py-1.5 rounded-xl text-[10px] font-mono font-bold border border-transparent transition-all"
            >
              {{cat}}
            </button>
          </div>
        </div>

        <!-- STEP 2: SEARCH & LIST SELECTION -->
        <div class="space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label class="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
              Step 2: Check Box to Add to {{selectedExamTrack}} Mock Exam set
            </label>
            <input
              type="text"
              [(ngModel)]="mockSearchQuery"
              name="mockSearch"
              placeholder="Search problems..."
              class="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none max-w-xs w-full"
            >
          </div>

          <!-- Problem List grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1 border border-slate-100 dark:border-slate-800 rounded-2xl p-2.5 bg-slate-50/50 dark:bg-slate-900/50">
            <div *ngFor="let p of getFilteredMockProblems()"
              [class.border-indigo-400]="isSelectedMockProblem(p.id)"
              [class.dark:border-indigo-600]="isSelectedMockProblem(p.id)"
              [class.bg-indigo-50]="isSelectedMockProblem(p.id)"
              [class.dark:bg-indigo-950]="isSelectedMockProblem(p.id)"
              class="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 transition-all shadow-3xs"
            >
              <input
                type="checkbox"
                [checked]="isSelectedMockProblem(p.id)"
                (change)="toggleMockProblem(p.id)"
                class="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 shrink-0"
              >

              <!-- Problem Name & Tag -->
              <div class="flex-1 min-w-0">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block">Day {{p.dayNumber}}: {{p.title}}</span>
                <span class="text-[10px] font-mono text-slate-400">{{p.patternTag}} · {{p.category || 'DSA'}}</span>
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
              {{selectedMockProblems.length}} Questions Selected for {{selectedExamTrack}} Exam
            </div>
            <div class="text-xs font-mono font-bold text-indigo-800 dark:text-indigo-200">
              Total Exam Time: <span class="text-indigo-600 dark:text-indigo-400 text-sm">{{totalExamMinutes}} min</span>
              <span class="text-[10px] text-slate-400 font-normal ml-1">(sum of all question timers)</span>
            </div>
          </div>
        </div>

        <button type="submit" class="btn-primary py-3 text-sm w-full justify-center">
          <i class="fa-solid fa-save mr-1"></i> Save {{selectedExamTrack}} Exam Configuration
        </button>
      </form>
    </div>
  `
})
export class AdminMockTestComponent implements OnInit {
  selectedExamTrack: 'DSA' | 'JS' = 'DSA';
  allProblemsList: any[] = [];
  availableCategories: string[] = ['HashMap', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Linked List', 'Stack', 'Recursion', 'JavaScript'];
  selectedCategories: string[] = [];
  mockSearchQuery = '';
  selectedMockProblems: { id: string; minutes: number }[] = [];

  constructor(
    private dsaService: DsaService,
    private authService: AuthService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.refreshProblems();
    this.loadTrackConfig();
  }

  setExamTrack(track: 'DSA' | 'JS') {
    this.selectedExamTrack = track;
    this.loadTrackConfig();
  }

  loadTrackConfig() {
    this.dsaService.getMockTestConfig(this.selectedExamTrack).subscribe({
      next: (config) => {
        if (config && config.questions) {
          const validIdsForTrack = new Set(
            this.allProblemsList
              .filter(p => (p.category || 'DSA').toUpperCase() === this.selectedExamTrack)
              .map(p => p.id)
          );
          if (validIdsForTrack.size > 0) {
            this.selectedMockProblems = config.questions
              .filter((q: any) => validIdsForTrack.has(q.id))
              .map((q: any) => ({ id: q.id, minutes: q.minutes || 20 }));
          } else {
            this.selectedMockProblems = config.questions.map((q: any) => ({ id: q.id, minutes: q.minutes || 20 }));
          }
        } else {
          this.selectedMockProblems = [];
        }
      }
    });
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
      this.loadTrackConfig();
    });
  }

  get totalExamMinutes(): number {
    return this.selectedMockProblems.reduce((sum, p) => sum + p.minutes, 0);
  }

  toggleCategoryFilter(cat: string) {
    const idx = this.selectedCategories.indexOf(cat);
    if (idx >= 0) {
      this.selectedCategories.splice(idx, 1);
    } else {
      this.selectedCategories.push(cat);
    }
  }

  getFilteredMockProblems(): any[] {
    let list = this.allProblemsList.filter(p =>
      (p.category || 'DSA').toUpperCase() === this.selectedExamTrack
    );
    if (this.selectedCategories.length > 0) {
      list = list.filter(p => this.selectedCategories.includes(p.patternTag));
    }
    if (this.mockSearchQuery.trim()) {
      const q = this.mockSearchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.patternTag.toLowerCase().includes(q)
      );
    }
    // Sort selected questions first
    return [...list].sort((a, b) => {
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
    return found ? found.minutes : 20;
  }

  setQuestionMinutes(id: string, event: Event) {
    const val = parseInt((event.target as HTMLInputElement).value, 10);
    const found = this.selectedMockProblems.find(p => p.id === id);
    if (found) {
      found.minutes = isNaN(val) || val < 1 ? 15 : Math.min(val, 60);
    }
  }

  toggleMockProblem(id: string) {
    const idx = this.selectedMockProblems.findIndex(p => p.id === id);
    if (idx >= 0) {
      this.selectedMockProblems.splice(idx, 1);
    } else {
      this.selectedMockProblems.push({ id, minutes: 20 });
    }
  }

  saveMockTest() {
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin actions only.');
      return;
    }
    if (this.selectedMockProblems.length === 0) {
      this.toast.error('Please select at least one question before saving.');
      return;
    }
    const loadId = this.toast.loading(`Saving ${this.selectedExamTrack} exam configuration...`);
    this.dsaService.updateMockTestConfig(this.selectedMockProblems, this.selectedExamTrack).subscribe({
      next: () => {
        this.toast.dismiss(loadId);
        this.toast.success(`${this.selectedExamTrack} Exam saved! ${this.selectedMockProblems.length} questions · ${this.totalExamMinutes} min total`);
      },
      error: () => {
        this.toast.dismiss(loadId);
        this.toast.error('Failed to save mock exam config.');
      }
    });
  }
}
