import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DsaService, GuidebookTopic, GuidebookSubtopic } from '../../core/services/dsa.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-guidebook',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="bg-slate-50 dark:bg-slate-950 min-h-screen py-8 transition-colors">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Header Banner -->
        <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm mb-8 relative transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div class="flex items-center gap-2 mb-3">
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-xs font-mono font-bold text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                <i class="fa-solid fa-book-open text-xs"></i> Concept Guidebook &amp; Learning Hub
              </span>
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
              Mastery Notes &amp; Visual Explanations
            </h1>
            <p class="text-slate-600 dark:text-slate-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
              Explore blog-style topic guides, visual architecture diagrams, and interactive code examples for both DSA and JavaScript tracks.
            </p>
          </div>

          <!-- Category Track Switcher -->
          <div class="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shrink-0">
            <button 
              (click)="setCategory('JS')"
              [class.bg-amber-500]="activeCategory === 'JS'"
              [class.text-white]="activeCategory === 'JS'"
              [class.text-slate-600]="activeCategory !== 'JS'"
              [class.dark:text-slate-300]="activeCategory !== 'JS'"
              class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <i class="fa-brands fa-js text-sm"></i> JavaScript Track
            </button>
            <button 
              (click)="setCategory('DSA')"
              [class.bg-indigo-600]="activeCategory === 'DSA'"
              [class.text-white]="activeCategory === 'DSA'"
              [class.text-slate-600]="activeCategory !== 'DSA'"
              [class.dark:text-slate-300]="activeCategory !== 'DSA'"
              class="px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shadow-xs"
            >
              <i class="fa-solid fa-puzzle-piece text-sm"></i> DSA Track
            </button>
          </div>
        </div>

        <!-- Main Layout: Sidebar & Content -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <!-- Sidebar: Topics & Subtopics Accordion -->
          <div class="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm self-start transition-colors">
            <div class="flex items-center justify-between pb-4 mb-4 border-b border-slate-100 dark:border-slate-800">
              <h2 class="text-sm font-mono font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <i class="fa-solid fa-list-check text-indigo-500"></i> Learning Topics
              </h2>
              <span class="text-xs font-mono font-bold text-slate-400">
                {{ topics.length }} Topics
              </span>
            </div>

            <!-- Loading Spinner -->
            <div *ngIf="loadingTopics" class="py-8 text-center text-slate-400 text-xs font-mono">
              <i class="fa-solid fa-circle-notch fa-spin text-indigo-500 text-base mb-2"></i>
              <p>Loading Guidebook topics...</p>
            </div>

            <!-- Empty State -->
            <div *ngIf="!loadingTopics && topics.length === 0" class="py-8 text-center text-slate-400 text-xs font-mono">
              <p>No topics published for {{ activeCategory }} track yet.</p>
            </div>

            <!-- Topic Accordion List -->
            <div *ngFor="let topic of topics" class="mb-4 last:mb-0">
              <button 
                (click)="toggleTopicExpand(topic.id)"
                class="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left border border-slate-100 dark:border-slate-700/50"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs shrink-0 font-bold">
                    <i class="fa-solid fa-book"></i>
                  </div>
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                    {{ topic.title }}
                  </span>
                </div>
                <i class="fa-solid fa-chevron-down text-slate-400 text-xs transition-transform" [class.rotate-180]="expandedTopics.has(topic.id)"></i>
              </button>

              <!-- Subtopics List -->
              <div *ngIf="expandedTopics.has(topic.id)" class="mt-2 pl-3 space-y-1.5">
                <button 
                  *ngFor="let sub of topic.subtopics"
                  (click)="selectSubtopic(sub)"
                  [ngClass]="{
                    'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800': selectedSubtopic?.id === sub.id
                  }"
                  class="w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all border border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <div class="flex items-center gap-2 min-w-0 pr-2">
                    <i 
                      [class.fa-circle-check]="sub.isRead"
                      [class.text-emerald-500]="sub.isRead"
                      [class.fa-circle]="!sub.isRead"
                      [class.text-slate-300]="!sub.isRead"
                      class="fa-solid text-xs shrink-0"
                    ></i>
                    <span 
                      [class.text-indigo-600]="selectedSubtopic?.id === sub.id"
                      [class.font-bold]="selectedSubtopic?.id === sub.id"
                      class="text-xs text-slate-700 dark:text-slate-300 truncate"
                    >
                      {{ sub.title }}
                    </span>
                  </div>
                  <span *ngIf="sub.codeExample" class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 shrink-0">
                    JS Code
                  </span>
                </button>
              </div>
            </div>
          </div>

          <!-- Main Article View -->
          <div class="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm transition-colors min-h-[600px] flex flex-col justify-between">
            
            <div *ngIf="selectedSubtopic">
              <!-- Breadcrumb & Status Bar -->
              <div class="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                <div class="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span class="font-bold text-indigo-600 dark:text-indigo-400">{{ activeCategory }} Track</span>
                  <span>/</span>
                  <span class="truncate max-w-[200px]">{{ currentTopicTitle }}</span>
                </div>

                <button 
                  (click)="toggleReadStatus()"
                  [ngClass]="{
                    'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800': selectedSubtopic.isRead,
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700': !selectedSubtopic.isRead
                  }"
                  class="px-4 py-2 rounded-xl text-xs font-mono font-bold border transition-all flex items-center gap-2 shadow-xs"
                >
                  <i [class.fa-check-circle]="selectedSubtopic.isRead" [class.fa-circle]="!selectedSubtopic.isRead" class="fa-solid text-xs"></i>
                  {{ selectedSubtopic.isRead ? 'Completed' : 'Mark as Read' }}
                </button>
              </div>

              <!-- Article Header -->
              <h1 class="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-3">
                {{ selectedSubtopic.title }}
              </h1>
              
              <p *ngIf="selectedSubtopic.description" class="text-sm font-medium text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                {{ selectedSubtopic.description }}
              </p>

              <!-- Cover Image if present -->
              <div *ngIf="selectedSubtopic.coverImageUrl" class="mb-8 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm cursor-pointer group" (click)="openLightbox(selectedSubtopic.coverImageUrl!)">
                <img [src]="selectedSubtopic.coverImageUrl" [alt]="selectedSubtopic.title" class="w-full max-h-72 object-cover group-hover:scale-102 transition-transform duration-300" />
                <div class="p-2.5 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono text-slate-400 text-center flex items-center justify-center gap-2">
                  <i class="fa-solid fa-magnifying-glass-plus"></i> Click diagram image to expand high-res view
                </div>
              </div>

              <!-- Rich Markdown Content Rendered -->
              <div class="prose prose-slate dark:prose-invert max-w-none mb-8 text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed space-y-4" [innerHTML]="formatMarkdown(selectedSubtopic.contentMarkdown)">
              </div>

              <!-- Interactive Code Snippet Box -->
              <div *ngIf="selectedSubtopic.codeExample" class="mb-8 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-md">
                <div class="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span class="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
                    <span class="text-xs font-mono text-slate-400 ml-2 font-bold">Interactive Concept Code</span>
                  </div>

                  <button 
                    (click)="openInPlayground(selectedSubtopic.codeExample!)"
                    class="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-mono font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <i class="fa-solid fa-bolt"></i> ⚡ Try in Playground
                  </button>
                </div>

                <pre class="p-5 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed"><code>{{ selectedSubtopic.codeExample }}</code></pre>
              </div>

              <!-- Linked Practice Questions -->
              <div *ngIf="selectedSubtopic.linkedProblemIds && selectedSubtopic.linkedProblemIds.length > 0" class="p-5 bg-indigo-50/50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl">
                <h4 class="text-xs font-mono font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-3 flex items-center gap-2">
                  <i class="fa-solid fa-code"></i> Related Hands-on Practice Problems
                </h4>
                <div class="flex flex-wrap items-center gap-3">
                  <a 
                    *ngFor="let probId of selectedSubtopic.linkedProblemIds"
                    [routerLink]="['/problem', probId]"
                    class="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-800 hover:border-indigo-500 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300 no-underline transition-all flex items-center gap-2 shadow-xs"
                  >
                    <i class="fa-solid fa-circle-play text-indigo-500"></i> Practice: {{ probId }}
                  </a>
                </div>
              </div>

            </div>

            <!-- Empty selection state -->
            <div *ngIf="!selectedSubtopic && !loadingTopics" class="py-20 text-center text-slate-400 font-mono text-xs">
              <i class="fa-solid fa-book-open text-4xl text-slate-300 dark:text-slate-700 mb-4 block"></i>
              <p class="text-base font-bold text-slate-600 dark:text-slate-300 mb-1">Select a Subtopic to Start Reading</p>
              <p>Choose any topic from the sidebar menu to dive into visual concept notes.</p>
            </div>
          </div>

        </div>

      </div>

      <!-- Lightbox Modal -->
      <div *ngIf="lightboxImageUrl" class="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" (click)="closeLightbox()">
        <div class="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center justify-center" (click)="$event.stopPropagation()">
          <button (click)="closeLightbox()" class="absolute -top-12 right-0 text-white hover:text-slate-300 text-xl font-bold font-mono">
            <i class="fa-solid fa-xmark"></i> Close [ESC]
          </button>
          <img [src]="lightboxImageUrl" class="max-w-full max-h-[85vh] object-contain rounded-2xl border border-slate-700 shadow-2xl" />
        </div>
      </div>

    </div>
  `
})
export class GuidebookComponent implements OnInit {
  activeCategory: 'DSA' | 'JS' = 'JS';
  topics: GuidebookTopic[] = [];
  selectedSubtopic: GuidebookSubtopic | null = null;
  expandedTopics = new Set<string>();
  loadingTopics: boolean = false;
  lightboxImageUrl: string | null = null;

  constructor(
    private dsaService: DsaService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTopics();
  }

  setCategory(cat: 'DSA' | 'JS') {
    this.activeCategory = cat;
    this.selectedSubtopic = null;
    this.loadTopics();
  }

  loadTopics() {
    this.loadingTopics = true;
    const currentUser = this.authService.currentUserSignal();
    const userId = currentUser ? currentUser.id : '';

    this.dsaService.getGuidebookTopics(this.activeCategory, userId).subscribe({
      next: (data) => {
        this.topics = data;
        this.loadingTopics = false;
        if (this.topics.length > 0) {
          this.expandedTopics.add(this.topics[0].id);
          if (this.topics[0].subtopics && this.topics[0].subtopics.length > 0) {
            this.selectedSubtopic = this.topics[0].subtopics[0];
          }
        }
      },
      error: () => {
        this.loadingTopics = false;
      }
    });
  }

  toggleTopicExpand(topicId: string) {
    if (this.expandedTopics.has(topicId)) {
      this.expandedTopics.delete(topicId);
    } else {
      this.expandedTopics.add(topicId);
    }
  }

  selectSubtopic(sub: GuidebookSubtopic) {
    this.selectedSubtopic = sub;
  }

  toggleReadStatus() {
    if (!this.selectedSubtopic) return;
    const currentUser = this.authService.currentUserSignal();
    if (!currentUser) {
      alert('Please log in to save your reading progress.');
      return;
    }

    this.dsaService.toggleSubtopicProgress(currentUser.id, this.selectedSubtopic.id).subscribe({
      next: (res) => {
        if (this.selectedSubtopic) {
          this.selectedSubtopic.isRead = res.isRead;
        }
      }
    });
  }

  get currentTopicTitle(): string {
    if (!this.selectedSubtopic) return '';
    const parent = this.topics.find(t => t.id === this.selectedSubtopic?.topicId);
    return parent ? parent.title : '';
  }

  openLightbox(url: string) {
    this.lightboxImageUrl = url;
  }

  closeLightbox() {
    this.lightboxImageUrl = null;
  }

  openInPlayground(code: string) {
    sessionStorage.setItem('playground_code', code);
    this.router.navigate(['/playground']);
  }

  formatMarkdown(markdown: string): string {
    if (!markdown) return '';
    let html = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 1. Fenced code blocks — must run before inline code
    html = html.replace(/```(\w*)\r?\n([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = code.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const langLabel = lang ? `<span class="text-[10px] font-mono text-slate-400 absolute top-2 right-3">${lang}</span>` : '';
      return `<div class="relative my-5 rounded-xl overflow-hidden border border-slate-700 shadow-sm">${langLabel}<pre class="bg-slate-950 text-green-300 p-4 text-xs font-mono overflow-x-auto leading-relaxed m-0 pt-7"><code>${escaped}</code></pre></div>`;
    });

    // 2. [VIDEO](url) — render as clickable YouTube thumbnail card
    html = html.replace(/\[VIDEO\]\((https?:\/\/[^\)]+)\)/g, (_, url) => {
      const idMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?#]+)/);
      if (idMatch) {
        const videoId = idMatch[1];
        const thumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        return `<div class="my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-md relative group cursor-pointer"><img src="${thumb}" alt="Video thumbnail" class="w-full max-h-64 object-cover"/><div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-all"><div class="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-xl"><svg viewBox="0 0 24 24" fill="white" width="28" height="28"><path d="M8 5v14l11-7z"/></svg></div></div><a href="${url}" target="_blank" rel="noopener" class="absolute inset-0"></a><p class="p-2 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-400 text-center m-0">▶ Watch on YouTube</p></div>`;
      }
      return `<a href="${url}" target="_blank" rel="noopener" class="text-indigo-500 underline">${url}</a>`;
    });

    // 3. Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<div class="my-6 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm"><img src="$2" alt="$1" class="w-full max-h-80 object-cover" loading="lazy"/><p class="p-2 bg-slate-50 dark:bg-slate-800/80 text-xs font-mono text-slate-500 text-center italic m-0">$1</p></div>');

    // 4. Headings
    html = html
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-extrabold text-slate-900 dark:text-white mt-6 mb-2">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-extrabold text-slate-900 dark:text-white mt-8 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-extrabold text-slate-900 dark:text-white mt-4 mb-4">$1</h1>');

    // 5. Inline formatting
    html = html
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-slate-900 dark:text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-600 dark:text-slate-400">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-mono text-xs">$1</code>');

    // 6. Callouts & blockquotes — [!TIP] on same or next line
    html = html
      .replace(/^> \[!TIP\]\n> (.*$)/gim, '<div class="my-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-xs font-medium text-emerald-800 dark:text-emerald-200">💡 <strong>Tip:</strong> $1</div>')
      .replace(/^> \[!TIP\] (.*$)/gim, '<div class="my-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border-l-4 border-emerald-500 text-xs font-medium text-emerald-800 dark:text-emerald-200">💡 <strong>Tip:</strong> $1</div>')
      .replace(/^> (.*$)/gim, '<blockquote class="my-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-800 border-l-4 border-indigo-500 text-xs font-medium text-slate-700 dark:text-slate-300">$1</blockquote>');

    // 7. Tables
    html = html.replace(/^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/gim, (match, header, rows) => {
      const ths = header.split('|').filter((c: string) => c.trim()).map((c: string) => `<th class="px-3 py-2 text-left text-xs font-bold text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700">${c.trim()}</th>`).join('');
      const trs = rows.trim().split('\n').map((row: string) =>
        `<tr>${row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td class="px-3 py-2 text-xs text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">${c.trim()}</td>`).join('')}</tr>`
      ).join('');
      return `<div class="my-4 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700"><table class="w-full"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table></div>`;
    });

    // 8. Horizontal rules
    html = html.replace(/^---$/gim, '<hr class="my-6 border-slate-200 dark:border-slate-700"/>');

    // 9. Paragraphs — wrap remaining text blocks
    html = html.replace(/\n\n/g, '</p><p class="mb-4">');

    return `<p class="mb-4">${html}</p>`;
  }
}
