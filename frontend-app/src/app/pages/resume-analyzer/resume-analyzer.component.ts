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
    <section class="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <div class="mb-8">
        <p class="text-xs font-mono font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">Career toolkit</p>
        <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white mt-2">Resume ATS Analyzer</h1>
        <p class="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-2xl">Compare your resume with a job description and get an explainable keyword and structure score.</p>
      </div>

      <div *ngIf="!authService.currentUserSignal()" class="rounded-2xl border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900 p-5 text-sm text-amber-800 dark:text-amber-200">
        Please log in before analyzing a resume.
      </div>

      <div *ngIf="authService.currentUserSignal() as user" class="grid lg:grid-cols-[minmax(0,1fr)_360px] gap-6">
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-7 shadow-sm">
          <form (ngSubmit)="analyze(user.id)" class="space-y-5">
            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Resume file</label>
              <label class="flex flex-col items-center justify-center min-h-36 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500 transition-colors p-5 text-center">
                <i class="fa-solid fa-file-arrow-up text-2xl text-emerald-500 mb-2"></i>
                <span class="text-sm font-bold text-slate-700 dark:text-slate-200">{{ selectedFile?.name || 'Choose PDF, DOCX, or TXT' }}</span>
                <span class="text-xs text-slate-400 mt-1">Maximum size: 5 MB</span>
                <input type="file" accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain" (change)="selectFile($event)" class="hidden">
              </label>
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Target job title <span class="font-normal text-slate-400">(optional)</span></label>
              <input [(ngModel)]="jobTitle" name="jobTitle" placeholder="Frontend Developer" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:border-emerald-500">
            </div>

            <div>
              <label class="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-2">Job description</label>
              <textarea [(ngModel)]="jobDescription" name="jobDescription" rows="9" placeholder="Paste the job description here..." class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 resize-y"></textarea>
            </div>

            <div *ngIf="errorMessage" class="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 p-3 text-xs text-rose-700 dark:text-rose-300">{{ errorMessage }}</div>
            <button type="submit" [disabled]="loading" class="w-full btn-primary justify-center py-3">
              <i *ngIf="!loading" class="fa-solid fa-magnifying-glass-chart"></i>
              <i *ngIf="loading" class="fa-solid fa-circle-notch fa-spin"></i>
              {{ loading ? 'Analyzing resume...' : 'Analyze resume' }}
            </button>
          </form>
        </div>

        <aside *ngIf="latestAnalysis as result" class="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg self-start">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold">Latest result</p>
              <h2 class="text-lg font-extrabold mt-1 truncate">{{ result.filename }}</h2>
            </div>
            <div class="w-16 h-16 rounded-full border-4 border-emerald-400 flex items-center justify-center shrink-0">
              <span class="text-xl font-extrabold">{{ result.score }}</span>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3 mt-6">
            <div class="bg-white/10 rounded-xl p-3"><span class="text-[10px] text-slate-400 block">Keywords</span><strong>{{ result.keywordScore }}%</strong></div>
            <div class="bg-white/10 rounded-xl p-3"><span class="text-[10px] text-slate-400 block">Sections</span><strong>{{ result.sectionScore }}%</strong></div>
          </div>
          <div class="mt-6">
            <h3 class="text-xs font-bold text-emerald-300 uppercase tracking-wide">Matched keywords</h3>
            <div class="flex flex-wrap gap-1.5 mt-2"><span *ngFor="let item of result.matchedKeywords" class="text-[10px] bg-emerald-400/15 text-emerald-200 rounded px-2 py-1">{{ item }}</span></div>
          </div>
          <div class="mt-5" *ngIf="result.missingKeywords.length">
            <h3 class="text-xs font-bold text-amber-300 uppercase tracking-wide">Missing keywords</h3>
            <div class="flex flex-wrap gap-1.5 mt-2"><span *ngFor="let item of result.missingKeywords.slice(0, 12)" class="text-[10px] bg-amber-400/15 text-amber-200 rounded px-2 py-1">{{ item }}</span></div>
          </div>
          <div class="mt-5" *ngIf="result.recommendations.length">
            <h3 class="text-xs font-bold text-sky-300 uppercase tracking-wide">Recommendations</h3>
            <ul class="mt-2 space-y-2 text-xs text-slate-300"><li *ngFor="let item of result.recommendations">{{ item }}</li></ul>
          </div>
        </aside>
      </div>

      <div *ngIf="authService.currentUserSignal() && analyses.length" class="mt-8">
        <h2 class="text-lg font-extrabold text-slate-900 dark:text-white mb-3">Previous analyses</h2>
        <div class="space-y-2">
          <div *ngFor="let item of analyses" class="flex items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3">
            <button (click)="latestAnalysis = item" class="text-left min-w-0 flex-1">
              <span class="block text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{{ item.filename }}</span>
              <span class="text-xs text-slate-400">{{ item.jobTitle || 'General role' }} · {{ item.createdAt | date:'mediumDate' }}</span>
            </button>
            <span class="font-mono font-bold text-emerald-600 dark:text-emerald-400">{{ item.score }}/100</span>
            <button (click)="deleteAnalysis(item.id, $event)" title="Delete analysis" class="text-slate-400 hover:text-rose-500 px-2"><i class="fa-solid fa-trash"></i></button>
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
