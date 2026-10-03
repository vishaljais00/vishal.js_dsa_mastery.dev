import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { DsaService, ResumeAnalysis } from '../../core/services/dsa.service';

@Component({
  selector: 'app-resume-analyzer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="mx-auto max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
      <header class="mb-7 border-b border-slate-200 pb-6 dark:border-slate-800 sm:mb-8">
        <p class="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">Career toolkit</p>
        <h1 class="mt-2 text-3xl font-extrabold text-slate-950 dark:text-white sm:text-4xl">Resume ATS Analyzer</h1>
        <p class="mt-2 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">Compare your resume with a job description and get an explainable keyword and structure score.</p>
      </header>

      <div *ngIf="!authService.currentUserSignal()" class="rounded-xl border border-amber-300 bg-amber-50 p-5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
        Please log in before analyzing a resume.
      </div>

      <div *ngIf="authService.currentUserSignal() as user" class="grid min-w-0 items-start gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)]">
        <div class="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7">
          <form (ngSubmit)="analyze(user.id)" class="space-y-5">
            <div>
              <label class="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">Resume file</label>
              <label class="group flex min-h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 p-5 text-center transition-colors hover:border-emerald-500 hover:bg-emerald-50/50 dark:border-slate-700 dark:hover:bg-emerald-950/20">
                <span class="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 transition-transform group-hover:-translate-y-0.5 dark:bg-emerald-400/10 dark:text-emerald-300">
                  <i class="fa-solid fa-file-arrow-up text-lg"></i>
                </span>
                <span class="max-w-full break-all text-sm font-bold text-slate-800 dark:text-slate-100">{{ selectedFile?.name || 'Choose PDF, DOCX, or TXT' }}</span>
                <span class="mt-1 text-xs text-slate-500 dark:text-slate-400">Maximum size: 5 MB</span>
                <input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" (change)="selectFile($event)" class="sr-only">
              </label>
            </div>

            <div>
              <label for="resume-job-title" class="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">Target job title <span class="font-normal text-slate-500">(optional)</span></label>
              <input id="resume-job-title" [(ngModel)]="jobTitle" name="jobTitle" placeholder="Frontend Developer" class="w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
            </div>

            <div>
              <label for="resume-job-description" class="mb-2 block text-xs font-bold text-slate-700 dark:text-slate-300">Job description</label>
              <textarea id="resume-job-description" [(ngModel)]="jobDescription" name="jobDescription" rows="8" placeholder="Paste the job description here..." class="min-h-48 w-full resize-y rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm leading-6 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 dark:border-slate-700 dark:bg-slate-800 dark:text-white"></textarea>
            </div>

            <div *ngIf="errorMessage" role="alert" class="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">{{ errorMessage }}</div>
            <button type="submit" [disabled]="loading" class="w-full btn-primary justify-center gap-2 py-3 disabled:cursor-wait disabled:opacity-70">
              <i *ngIf="!loading" class="fa-solid fa-magnifying-glass-chart"></i>
              <i *ngIf="loading" class="fa-solid fa-circle-notch fa-spin"></i>
              {{ loading ? 'Analyzing resume...' : 'Analyze resume' }}
            </button>
          </form>
        </div>

        <aside *ngIf="latestAnalysis as result; else emptyResult" class="min-w-0 self-start overflow-hidden rounded-xl bg-slate-950 p-5 text-white shadow-lg sm:p-6">
          <div class="grid min-w-0 grid-cols-[minmax(0,1fr)_64px] items-start gap-3">
            <div class="min-w-0">
              <p class="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300">Latest result</p>
              <h2 class="mt-2 break-words text-base font-bold leading-5 [overflow-wrap:anywhere]" [title]="result.filename">{{ result.filename }}</h2>
            </div>
            <div class="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full border-[3px] border-emerald-400" role="img" [attr.aria-label]="'Overall score: ' + result.score + ' out of 100'">
              <span class="text-xl font-extrabold leading-none">{{ result.score }}</span>
              <span class="mt-1 text-[9px] font-bold uppercase text-slate-400">score</span>
            </div>
          </div>

          <div class="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10" role="progressbar" aria-label="Overall resume score" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="result.score">
            <div class="h-full rounded-full bg-emerald-400 transition-all" [style.width.%]="result.score"></div>
          </div>

          <div class="mt-5 grid grid-cols-2 gap-2.5">
            <div class="rounded-lg bg-white/[0.07] p-3"><span class="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Keywords</span><strong class="mt-1 block text-xl">{{ result.keywordScore }}<span class="text-sm text-slate-400">%</span></strong></div>
            <div class="rounded-lg bg-white/[0.07] p-3"><span class="block text-[10px] font-medium uppercase tracking-wide text-slate-400">Sections</span><strong class="mt-1 block text-xl">{{ result.sectionScore }}<span class="text-sm text-slate-400">%</span></strong></div>
          </div>

          <div class="mt-6">
            <h3 class="text-[11px] font-bold uppercase tracking-wide text-emerald-300">Matched keywords <span class="ml-1 font-medium text-slate-400">{{ result.matchedKeywords.length }}</span></h3>
            <div *ngIf="result.matchedKeywords.length; else noMatches" class="mt-2 flex flex-wrap gap-1.5">
              <span *ngFor="let item of result.matchedKeywords" class="max-w-full break-words rounded bg-emerald-400/15 px-2 py-1 text-[11px] text-emerald-100">{{ item }}</span>
            </div>
            <ng-template #noMatches><p class="mt-2 text-xs text-slate-400">No matching keywords found.</p></ng-template>
          </div>

          <div class="mt-5" *ngIf="result.missingKeywords.length">
            <h3 class="text-[11px] font-bold uppercase tracking-wide text-amber-300">Missing keywords <span class="ml-1 font-medium text-slate-400">{{ result.missingKeywords.length }}</span></h3>
            <div class="mt-2 flex flex-wrap gap-1.5"><span *ngFor="let item of result.missingKeywords.slice(0, 12)" class="max-w-full break-words rounded bg-amber-400/15 px-2 py-1 text-[11px] text-amber-100">{{ item }}</span></div>
          </div>

          <div class="mt-5" *ngIf="result.recommendations.length">
            <h3 class="text-[11px] font-bold uppercase tracking-wide text-sky-300">Recommendations</h3>
            <ul class="mt-2 list-inside list-disc space-y-2 text-xs leading-5 text-slate-300"><li *ngFor="let item of result.recommendations">{{ item }}</li></ul>
          </div>
        </aside>
        <ng-template #emptyResult>
          <aside class="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center dark:border-slate-700 dark:bg-slate-900/60">
            <span class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300"><i class="fa-solid fa-chart-column"></i></span>
            <h2 class="text-sm font-bold text-slate-800 dark:text-slate-100">Your results will appear here</h2>
            <p class="mt-1 max-w-xs text-xs leading-5 text-slate-500 dark:text-slate-400">Upload a resume and add a job description to see your match breakdown.</p>
          </aside>
        </ng-template>
      </div>

      <div *ngIf="authService.currentUserSignal() && analyses.length" class="mt-9">
        <div class="mb-3 flex items-baseline justify-between gap-3 border-b border-slate-200 pb-3 dark:border-slate-800">
          <h2 class="text-base font-extrabold text-slate-900 dark:text-white">Previous analyses</h2>
          <span class="text-xs text-slate-500 dark:text-slate-400">{{ analyses.length }} saved</span>
        </div>
        <div class="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900">
          <div *ngFor="let item of analyses" class="flex min-w-0 items-center gap-3 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60 sm:px-4">
            <button (click)="latestAnalysis = item" class="min-w-0 flex-1 text-left">
              <span class="block truncate text-sm font-bold text-slate-800 dark:text-slate-200">{{ item.filename }}</span>
              <span class="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{{ item.jobTitle || 'General role' }} · {{ item.createdAt | date:'mediumDate' }}</span>
            </button>
            <span class="shrink-0 rounded-md bg-emerald-50 px-2 py-1 font-mono text-xs font-bold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300">{{ item.score }}/100</span>
            <button (click)="deleteAnalysis(item.id, $event)" [attr.aria-label]="'Delete analysis for ' + item.filename" title="Delete analysis" class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-300"><i class="fa-solid fa-trash"></i></button>
          </div>
        </div>
      </div>
    </section>
  `
})
export class ResumeAnalyzerComponent implements OnInit {
  selectedFile: File | null = null;
  jobTitle = '';
  jobDescription = '';
  analyses: ResumeAnalysis[] = [];
  latestAnalysis: ResumeAnalysis | null = null;
  loading = false;
  errorMessage = '';

  constructor(public authService: AuthService, private dsaService: DsaService) {}

  ngOnInit() {
    const user = this.authService.currentUserSignal();
    if (user) this.loadAnalyses(user.id);
  }

  selectFile(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] || null;
    this.errorMessage = '';
    if (file && file.size > 5 * 1024 * 1024) {
      this.errorMessage = 'Resume must be smaller than 5 MB.';
      this.selectedFile = null;
      return;
    }
    this.selectedFile = file;
  }

  analyze(userId: string) {
    this.errorMessage = '';
    if (!this.selectedFile) {
      this.errorMessage = 'Choose a resume file first.';
      return;
    }
    if (this.jobDescription.trim().length < 30) {
      this.errorMessage = 'Paste a job description of at least 30 characters.';
      return;
    }
    this.loading = true;
    this.dsaService.analyzeResume(this.selectedFile, userId, this.jobDescription.trim(), this.jobTitle.trim()).subscribe({
      next: result => {
        this.loading = false;
        this.latestAnalysis = result;
        this.analyses = [result, ...this.analyses];
      },
      error: err => {
        this.loading = false;
        this.errorMessage = err.error?.error || 'Resume analysis failed.';
      }
    });
  }

  loadAnalyses(userId: string) {
    this.dsaService.getResumeAnalyses(userId).subscribe({
      next: analyses => {
        this.analyses = analyses;
        if (!this.latestAnalysis && analyses.length) this.latestAnalysis = analyses[0];
      },
      error: () => this.errorMessage = 'Could not load previous analyses.'
    });
  }

  deleteAnalysis(id: string, event: Event) {
    event.stopPropagation();
    const user = this.authService.currentUserSignal();
    if (!user) return;
    this.dsaService.deleteResumeAnalysis(id, user.id).subscribe(() => {
      this.analyses = this.analyses.filter(item => item.id !== id);
      if (this.latestAnalysis?.id === id) this.latestAnalysis = this.analyses[0] || null;
    });
  }
}
