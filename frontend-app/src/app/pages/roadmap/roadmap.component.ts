import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DsaService, DayPlan } from '../../core/services/dsa.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-roadmap',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-slate-50 dark:bg-slate-950 min-h-screen py-8 transition-colors">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Hero Banner (Clean Solid Non-Gradient Professional Card) -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-sm mb-8 relative transition-colors">
          <div class="max-w-3xl relative z-10">
            <span class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 mb-4 border border-indigo-200 dark:border-indigo-800">
              <i class="fa-solid fa-graduation-cap"></i> 30-Day JavaScript DSA Masterplan
            </span>
            <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-slate-900 dark:text-white mb-4">
              Master Data Structures &amp; Algorithms in JS
            </h1>
            <p class="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed mb-6 font-medium">
              Master arrays, two pointers, sliding window, binary search, linked lists, stacks, recursion, and pattern recognition. Practice with interactive JavaScript code execution and test cases.
            </p>

            <div class="flex flex-wrap items-center gap-3">
              <a routerLink="/cheat-sheet" class="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xs transition-all flex items-center gap-2 no-underline">
                <i class="fa-solid fa-book-open"></i> Pattern Cheat Sheet
              </a>
              <a routerLink="/interview-test" class="px-5 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-900 font-bold text-sm shadow-xs transition-all flex items-center gap-2 no-underline">
                <i class="fa-solid fa-trophy"></i> Day 30 Mock Interview
              </a>
            </div>
          </div>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 mb-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          
          <!-- Category Track Switcher -->
          <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 w-full md:w-auto">
            <button 
              (click)="setTrack('DSA')"
              [class.bg-indigo-600]="selectedTrack === 'DSA'"
              [class.text-white]="selectedTrack === 'DSA'"
              [class.text-slate-600]="selectedTrack !== 'DSA'"
              [class.dark:text-slate-300]="selectedTrack !== 'DSA'"
              class="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <i class="fa-solid fa-puzzle-piece"></i> DSA Track
            </button>
            <button 
              (click)="setTrack('JS')"
              [class.bg-amber-500]="selectedTrack === 'JS'"
              [class.text-white]="selectedTrack === 'JS'"
              [class.text-slate-600]="selectedTrack !== 'JS'"
              [class.dark:text-slate-300]="selectedTrack !== 'JS'"
              class="px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5"
            >
              <i class="fa-brands fa-js"></i> JS Track
            </button>
          </div>

          <div class="relative w-full md:w-80">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search problems or patterns..."
              class="w-full bg-slate-50 dark:bg-slate-800 text-xs text-slate-800 dark:text-slate-200 pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 outline-none font-medium"
            />
          </div>

          <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
            <span class="text-xs font-mono text-slate-400 font-bold mr-1 shrink-0">Difficulty:</span>
            <button 
              *ngFor="let diff of ['ALL', 'Easy', 'Medium', 'Hard']"
              (click)="selectedDifficulty = diff"
              [class.bg-indigo-600]="selectedDifficulty === diff"
              [class.text-white]="selectedDifficulty === diff"
              [class.bg-slate-100]="selectedDifficulty !== diff"
              [class.dark:bg-slate-800]="selectedDifficulty !== diff"
              [class.text-slate-600]="selectedDifficulty !== diff"
              [class.dark:text-slate-300]="selectedDifficulty !== diff"
              class="px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border border-transparent"
            >
              {{ diff }}
            </button>
          </div>
        </div>

        <!-- Curriculum Phase Sections (Collapsible) -->
        <div *ngFor="let weekNum of [1, 2, 3, 4]" class="mb-8">

          <!-- Phase Header — click to collapse/expand -->
          <button
            (click)="togglePhase(weekNum)"
            class="w-full flex items-center justify-between mb-5 pb-3 border-b border-slate-200 dark:border-slate-800 group text-left"
          >
            <div>
              <span class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">Phase 0{{weekNum}}</span>
              <h2 class="text-2xl font-extrabold text-slate-900 dark:text-white m-0 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Week {{weekNum}} — {{getWeekTitle(weekNum)}}
              </h2>
            </div>
            <div class="flex items-center gap-3 shrink-0">
              <span class="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-3 py-1 rounded-full font-bold">
                {{ getDaysForWeek(weekNum).length }} Days
              </span>
              <span class="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950 group-hover:text-indigo-500 transition-all">
                <i class="fa-solid fa-chevron-down text-xs transition-transform"
                  [class.rotate-180]="!collapsedPhases.has(weekNum)"></i>
              </span>
            </div>
          </button>

          <!-- Day Cards Grid (collapse animation via *ngIf) -->
          <div *ngIf="!collapsedPhases.has(weekNum)" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div 
              *ngFor="let day of getDaysForWeek(weekNum)"
              [ngClass]="{
                'border-indigo-300 dark:border-indigo-800': day.isWeeklyTest || day.isInterviewTest,
                'border-slate-200/80 dark:border-slate-800': !day.isWeeklyTest && !day.isInterviewTest
              }"
              class="bg-white dark:bg-slate-900 rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <!-- Day Badge & Status -->
                <div class="flex items-center justify-between mb-3">
                  <span class="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-1 rounded-md">
                    Day {{day.dayNumber}}
                  </span>
                  <span *ngIf="day.isWeeklyTest" class="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                    🧪 Weekly Test
                  </span>
                  <span *ngIf="day.isInterviewTest" class="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                    🚨 Final Exam
                  </span>
                </div>

                <h3 class="text-xl font-extrabold text-slate-900 dark:text-white mb-3">{{day.title}}</h3>

                <!-- Learn Topics -->
                <div class="mb-4">
                  <span class="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1.5">Learn &amp; Concepts:</span>
                  <ul class="space-y-1 pl-4 m-0 text-xs text-slate-600 dark:text-slate-300 font-medium">
                    <li *ngFor="let topic of day.learnTopics">{{topic}}</li>
                  </ul>
                </div>

                <!-- Code Snippet Preview -->
                <div *ngFor="let snippet of day.codeSnippets" class="mb-4">
                  <span class="text-[10px] font-mono text-slate-400 block mb-1 font-semibold">{{snippet.title}}</span>
                  <pre class="text-[11px] p-3 bg-slate-900 dark:bg-slate-950 text-emerald-300 rounded-xl border border-slate-800 overflow-x-auto font-mono m-0 leading-relaxed">{{snippet.code}}</pre>
                </div>

                <!-- Target Summary -->
                <div *ngIf="day.targetSummary" class="bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-xl text-xs text-indigo-900 dark:text-indigo-200 font-medium mb-4 border border-indigo-100 dark:border-indigo-900">
                  <strong class="text-indigo-700 dark:text-indigo-300">Target:</strong> {{day.targetSummary}}
                </div>
              </div>

              <!-- Problems List (Collapsible) -->
              <div *ngIf="day.problems && day.problems.length > 0" class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">

                <!-- Problems toggle header -->
                <button
                  (click)="toggleDayProblems(day.dayNumber)"
                  class="w-full flex items-center justify-between mb-2 group/prob"
                >
                  <span class="text-[11px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                    <i class="fa-solid fa-list-ul text-[10px]"></i>
                    Problems ({{day.problems.length}})
                    <span *ngIf="getSolvedCount(day) > 0" class="text-emerald-500 dark:text-emerald-400">
                      · {{getSolvedCount(day)}} solved
                    </span>
                  </span>
                  <i class="fa-solid fa-chevron-down text-[10px] text-slate-400 group-hover/prob:text-indigo-500 transition-all"
                    [class.rotate-180]="!collapsedDays.has(day.dayNumber)"></i>
                </button>

                <!-- Problems list (shown when not collapsed) -->
                <div *ngIf="!collapsedDays.has(day.dayNumber)" class="space-y-2.5">
                  <div 
                    *ngFor="let prob of filterProblems(day.problems)"
                    class="flex flex-col gap-1.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60"
                  >
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2 overflow-hidden mr-2">
                        <i *ngIf="prob.isSolved" class="fa-solid fa-circle-check text-emerald-500 text-sm shrink-0"></i>
                        <i *ngIf="!prob.isSolved" class="fa-regular fa-circle text-slate-300 dark:text-slate-600 text-sm shrink-0"></i>
                        <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{{prob.title}}</span>
                      </div>

                      <div class="flex items-center gap-2 shrink-0">
                        <span [class]="getDifficultyClass(prob.difficulty)">{{prob.difficulty}}</span>
                        <a [routerLink]="['/problem', prob.id]" class="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold font-mono transition-all">
                          Solve &gt;
                        </a>
                      </div>
                    </div>

                    <!-- NEW QUESTION ADDED BADGE -->
                    <div *ngIf="prob.isNew" class="flex items-center">
                      <span class="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[10px] font-mono font-extrabold uppercase shadow-2xs animate-pulse">
                        ✨ NEW QUESTION ADDED
                      </span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>

          <!-- Collapsed summary row -->
          <div *ngIf="collapsedPhases.has(weekNum)" class="flex items-center gap-3 py-2 px-1">
            <span class="text-xs font-mono text-slate-400 dark:text-slate-500">
              {{ getDaysForWeek(weekNum).length }} days hidden —
            </span>
            <button (click)="togglePhase(weekNum)" class="text-xs font-mono font-bold text-indigo-500 hover:text-indigo-400 transition-all">
              Click header to expand
            </button>
          </div>

        </div>

      </div>
    </div>
  `
})
export class RoadmapComponent implements OnInit {
  collapsedPhases = new Set<number>();
  collapsedDays = new Set<number>();

  searchQuery: string = '';
  selectedDifficulty: string = 'ALL';
  selectedTrack: 'DSA' | 'JS' = 'DSA';

  constructor(
    public dsaService: DsaService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.loadCurriculum();
  }

  loadCurriculum() {
    const currentUser = this.authService.currentUserSignal();
    const userId = currentUser ? currentUser.id : '';
    const category = this.selectedTrack;
    this.dsaService.fetchCurriculum(userId, category).subscribe();
  }

  setTrack(track: 'DSA' | 'JS') {
    this.selectedTrack = track;
    this.loadCurriculum();
  }

  filterProblems(problems: any[]): any[] {
    if (!problems) return [];
    return problems.filter(p => {
      const matchesSearch = !this.searchQuery || 
        p.title.toLowerCase().includes(this.searchQuery.toLowerCase()) || 
        (p.patternTag && p.patternTag.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      const matchesDiff = this.selectedDifficulty === 'ALL' || p.difficulty === this.selectedDifficulty;
      const matchesTrack = (p.category || 'DSA') === this.selectedTrack;
      return matchesSearch && matchesDiff && matchesTrack;
    });
  }

  togglePhase(weekNum: number) {
    if (this.collapsedPhases.has(weekNum)) {
      this.collapsedPhases.delete(weekNum);
    } else {
      this.collapsedPhases.add(weekNum);
    }
  }

  toggleDayProblems(dayNumber: number) {
    if (this.collapsedDays.has(dayNumber)) {
      this.collapsedDays.delete(dayNumber);
    } else {
      this.collapsedDays.add(dayNumber);
    }
  }

  getDaysForWeek(weekNumber: number): DayPlan[] {
    return this.dsaService.curriculumSignal().filter(d => d.weekNumber === weekNumber);
  }

  getSolvedCount(day: DayPlan): number {
    return day.problems ? day.problems.filter(p => p.isSolved).length : 0;
  }

  getWeekTitle(weekNumber: number): string {
    switch (weekNumber) {
      case 1: return 'Fundamentals + Arrays';
      case 2: return 'Two Pointers + Sliding Window';
      case 3: return 'Binary Search + Linked List';
      case 4: return 'Stack + Queue + Recursion + Backtracking';
      default: return 'DSA Curriculum';
    }
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
