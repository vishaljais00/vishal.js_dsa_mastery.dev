import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DsaService, GuidebookTopic, GuidebookSubtopic } from '../../../../core/services/dsa.service';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { MonacoEditorComponent } from '../../../../shared/monaco-editor/monaco-editor.component';

@Component({
  selector: 'app-admin-guidebook',
  standalone: true,
  imports: [CommonModule, FormsModule, MonacoEditorComponent],
  template: `
    <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h2 class="text-xl font-extrabold text-slate-900 dark:text-white m-0">Guidebook Curriculum CMS</h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Publish visual concept guides, images, code snippets, and topics for DSA and JS tracks.</p>
        </div>
        <div class="flex gap-2">
          <button (click)="openTopicModal()" class="px-4 py-2 text-xs font-mono font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-xs transition-all">
            + Create Topic
          </button>
          <button (click)="openSubtopicModal()" class="px-4 py-2 text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl shadow-xs transition-all">
            + Write Article
          </button>
        </div>
      </div>

      <!-- Filters & Topics Accordion -->
      <div class="space-y-6">
        <div class="flex items-center gap-2">
          <span class="text-xs font-mono font-bold text-slate-400">Filter category:</span>
          <button
            *ngFor="let cat of ['ALL', 'DSA', 'JS']"
            (click)="guidebookFilter = cat"
            [class.bg-slate-800]="guidebookFilter === cat"
            [class.text-white]="guidebookFilter === cat"
            [class.bg-slate-100]="guidebookFilter !== cat"
            [class.text-slate-600]="guidebookFilter !== cat"
            [class.dark:bg-slate-800]="guidebookFilter !== cat"
            [class.dark:text-slate-300]="guidebookFilter !== cat"
            class="px-3 py-1 rounded-lg text-[10px] font-mono font-bold transition-all"
          >
            {{cat}}
          </button>
        </div>

        <!-- LIST OF TOPICS -->
        <div class="space-y-4">
          <div *ngFor="let t of getFilteredTopics()" class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50/50 dark:bg-slate-900/30">
            <!-- Topic Header -->
            <div class="p-4 bg-slate-100/60 dark:bg-slate-800/40 flex items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800">
              <div class="flex items-center gap-3">
                <span class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs">
                  <i class="fa-solid fa-{{t.icon || 'book'}}"></i>
                </span>
                <div>
                  <h3 class="text-xs font-extrabold text-slate-900 dark:text-white m-0">
                    {{t.title}}
                    <span class="ml-1 text-[9px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{{t.category}}</span>
                  </h3>
                  <p class="text-[10px] text-slate-400 mt-0.5 font-medium">{{t.description}}</p>
                </div>
              </div>

              <!-- Topic Actions -->
              <div class="flex items-center gap-2">
                <button
                  *ngIf="confirmDeleteTopicId !== t.id"
                  (click)="confirmDeleteTopicId = t.id"
                  class="px-2.5 py-1 text-[10px] font-mono text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-lg transition-all"
                >
                  <i class="fa-solid fa-trash"></i> Delete
                </button>
                <div *ngIf="confirmDeleteTopicId === t.id" class="flex items-center gap-1">
                  <span class="text-[9px] text-rose-500 font-bold font-mono">Confirm?</span>
                  <button (click)="deleteTopic(t.id)" class="px-2 py-0.5 bg-rose-600 text-white rounded text-[9px] font-mono font-bold">Yes</button>
                  <button (click)="confirmDeleteTopicId = null" class="px-2 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-mono font-bold">No</button>
                </div>
              </div>
            </div>

            <!-- Subtopics List inside Topic -->
            <div class="p-4 space-y-2.5 bg-white dark:bg-slate-900/10">
              <div *ngIf="!t.subtopics || t.subtopics.length === 0" class="text-[10px] text-slate-400 italic font-mono text-center py-2">
                No articles published under this topic yet.
              </div>
              <div *ngFor="let sub of t.subtopics" class="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-xl flex items-center justify-between gap-4 transition-all hover:border-slate-300 dark:hover:border-slate-700">
                <div class="min-w-0">
                  <span class="text-xs font-bold text-slate-800 dark:text-slate-200 block">{{sub.title}}</span>
                  <span class="text-[10px] text-slate-400 block truncate mt-0.5">{{sub.description || 'No description'}}</span>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <button (click)="startEditSubtopic(sub)" class="px-2 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded font-mono font-bold text-[9px]">
                    <i class="fa-solid fa-edit"></i> Edit
                  </button>

                  <button
                    *ngIf="confirmDeleteSubtopicId !== sub.id"
                    (click)="confirmDeleteSubtopicId = sub.id"
                    class="px-2 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded font-mono font-bold text-[9px]"
                  >
                    <i class="fa-solid fa-trash"></i> Delete
                  </button>
                  <div *ngIf="confirmDeleteSubtopicId === sub.id" class="flex items-center gap-1">
                    <span class="text-[9px] text-rose-500 font-bold font-mono">Sure?</span>
                    <button (click)="deleteSubtopic(sub.id)" class="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[9px] font-mono font-bold">Yes</button>
                    <button (click)="confirmDeleteSubtopicId = null" class="px-1.5 py-0.5 bg-slate-200 text-slate-700 rounded text-[9px] font-mono font-bold">No</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== CREATE TOPIC DIALOG MODAL ===== -->
    <div *ngIf="showTopicModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white m-0 font-mono">Create New Topic Header</h3>
          <button (click)="showTopicModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>

        <div class="space-y-4 text-xs font-medium">
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Track Track</label>
            <select [(ngModel)]="newTopic.category" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
              <option value="DSA">DSA Track</option>
              <option value="JS">JS Track</option>
            </select>
          </div>

          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Topic Title *</label>
            <input type="text" [(ngModel)]="newTopic.title" placeholder="e.g. Closure &amp; Scope" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
          </div>

          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Description</label>
            <textarea [(ngModel)]="newTopic.description" rows="2" placeholder="One-line summary of this topic..." class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none resize-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">FontAwesome Icon</label>
              <input type="text" [(ngModel)]="newTopic.icon" placeholder="book, zap, code..." class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
            </div>
            <div>
              <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Order Index (Sort)</label>
              <input type="number" [(ngModel)]="newTopic.orderIndex" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
            </div>
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button (click)="showTopicModal = false" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Cancel</button>
            <button (click)="submitNewTopic()" class="px-5 py-2 rounded-xl bg-indigo-600 text-white font-extrabold font-mono hover:bg-indigo-500 transition-all">Publish Topic</button>
          </div>
        </div>
      </div>
    </div>

    <!-- ===== WRITE SUBTOPIC DIALOG MODAL ===== -->
    <div *ngIf="showSubtopicModal" class="fixed inset-0 z-50 flex items-start justify-center p-2 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full my-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white m-0 font-mono">Create Concept Guide / Article</h3>
          <button (click)="showSubtopicModal = false" class="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>

        <div class="space-y-4 text-xs font-medium">
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

            <!-- Enhanced Toolbar -->
            <div *ngIf="subtopicEditorTab === 'write'" class="flex gap-1 flex-wrap mb-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button type="button" (click)="insertAtCursor('# Heading 1\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold font-mono">H1</button>
              <button type="button" (click)="insertAtCursor('## Heading 2\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold font-mono">H2</button>
              <button type="button" (click)="insertAtCursor('### Heading 3\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold font-mono">H3</button>
              <button type="button" (click)="insertAtCursor('**bold text**')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold font-mono"><b>B</b></button>
              <button type="button" (click)="insertAtCursor('<mark>highlighted text</mark>')" class="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-slate-900 rounded text-[10px] font-bold">Highlight</button>
              <button type="button" (click)="insertTextColor(false)" class="px-2 py-0.5 bg-indigo-700 hover:bg-indigo-600 text-indigo-100 rounded text-[10px] font-bold">Text Color</button>
              <button type="button" (click)="insertAtCursor('\`inline code\`')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-mono">\`code\`</button>
              <button type="button" (click)="insertAtCursor('\`\`\`javascript\n// code here\n\`\`\`\n')" class="px-2 py-0.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded text-[10px] font-bold font-mono">&lbrace;&rbrace; Block</button>
              <button type="button" (click)="insertMediaUrl('image', false)" class="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-emerald-100 rounded text-[10px] font-bold">🖼️ Image URL</button>
              <button type="button" (click)="insertMediaUrl('video', false)" class="px-2 py-0.5 bg-red-700 hover:bg-red-600 text-red-100 rounded text-[10px] font-bold">🎬 Video URL</button>
              <button type="button" (click)="insertAtCursor('\n> blockquote\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-mono">&gt; Quote</button>
              <button type="button" (click)="insertAtCursor('\n> [!TIP]\n> tip text\n')" class="px-2 py-0.5 bg-indigo-700 hover:bg-indigo-600 text-indigo-100 rounded text-[10px] font-bold">[!TIP]</button>
              <button type="button" (click)="insertAtCursor('\n---\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-mono">— HR</button>
              <button type="button" (click)="insertAtCursor('| Col1 | Col2 |\n|---|---|\n| val1 | val2 |\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-mono">⊞ Table</button>
            </div>

            <p class="text-[10px] text-slate-400 font-mono mb-1">Mix text, 🖼️ images, 🎬 videos and code blocks freely — inline blog style.</p>
            <div class="flex items-center gap-2 mb-1.5">
              <button type="button" (click)="loadExample()" class="px-3 py-1 rounded-lg text-[10px] font-bold bg-violet-700 text-violet-100 hover:bg-violet-600 transition-all">📋 Load Full Example</button>
              <span class="text-[10px] text-slate-500">Shows all features: headings, code, image, video, table, tip</span>
            </div>
            <textarea *ngIf="subtopicEditorTab === 'write'"
              id="content-editor-textarea"
              [(ngModel)]="newSubtopic.contentMarkdown" rows="18"
              placeholder="# Your Article Title&#10;&#10;Write intro text here...&#10;&#10;![Cover Image](https://images.unsplash.com/photo-xxx)&#10;&#10;## Section&#10;&#10;More text...&#10;&#10;\`\`\`javascript&#10;// code example&#10;\`\`\`&#10;&#10;[VIDEO](https://youtube.com/watch?v=ID)&#10;&#10;More text..."
              class="w-full bg-slate-950 text-green-300 border border-slate-700 rounded-xl p-3 font-mono text-[11px] outline-none resize-y focus:border-indigo-500 leading-relaxed"></textarea>
            <div *ngIf="subtopicEditorTab === 'preview'"
              class="w-full min-h-[200px] max-h-[500px] overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-slate-800 dark:text-slate-100">
              <span class="text-slate-400 italic text-xs font-mono" *ngIf="!newSubtopic.contentMarkdown">Nothing to preview yet.</span>
              <div *ngIf="newSubtopic.contentMarkdown" [innerHTML]="renderMarkdown(newSubtopic.contentMarkdown)"></div>
            </div>
          </div>

          <!-- Interactive Code Snippet -->
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">⚡ Interactive Code Snippet (Optional — shown in playground panel)</label>
            <div class="h-[150px] border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
              <app-monaco-editor 
                [value]="newSubtopic.codeExample" 
                (valueChange)="newSubtopic.codeExample = $event" 
                [language]="'javascript'">
              </app-monaco-editor>
            </div>
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

    <!-- ===== EDIT SUBTOPIC DIALOG MODAL ===== -->
    <div *ngIf="editingSubtopic" class="fixed inset-0 z-50 flex items-start justify-center p-2 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div class="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-3xl w-full my-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-extrabold text-slate-900 dark:text-white m-0 font-mono">Edit Concept Guide / Article</h3>
          <button (click)="editingSubtopic = null" class="text-slate-400 hover:text-slate-600 text-sm font-bold">✕</button>
        </div>

        <div class="space-y-4 text-xs font-medium">
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Article Title *</label>
            <input type="text" [(ngModel)]="editingSubtopic.title" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
          </div>

          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">Subtitle / Description</label>
            <input type="text" [(ngModel)]="editingSubtopic.description" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none">
          </div>

          <!-- Editor tab buttons -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <label class="font-mono font-bold text-slate-600 dark:text-slate-400">📝 Content (Markdown)</label>
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

            <!-- Enhanced Edit Toolbar -->
            <div *ngIf="editSubtopicEditorTab === 'write'" class="flex gap-1 flex-wrap mb-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700/60">
              <button type="button" (click)="insertAtCursorEdit('# Heading 1\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold font-mono">H1</button>
              <button type="button" (click)="insertAtCursorEdit('## Heading 2\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold font-mono">H2</button>
              <button type="button" (click)="insertAtCursorEdit('### Heading 3\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold font-mono">H3</button>
              <button type="button" (click)="insertAtCursorEdit('**bold text**')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-bold font-mono"><b>B</b></button>
              <button type="button" (click)="insertAtCursorEdit('<mark>highlighted text</mark>')" class="px-2 py-0.5 bg-amber-600 hover:bg-amber-500 text-slate-900 rounded text-[10px] font-bold">Highlight</button>
              <button type="button" (click)="insertTextColor(true)" class="px-2 py-0.5 bg-indigo-700 hover:bg-indigo-600 text-indigo-100 rounded text-[10px] font-bold">Text Color</button>
              <button type="button" (click)="insertAtCursorEdit('\`inline code\`')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-mono">\`code\`</button>
              <button type="button" (click)="insertAtCursorEdit('\`\`\`javascript\n// code here\n\`\`\`\n')" class="px-2 py-0.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded text-[10px] font-bold font-mono">&lbrace;&rbrace; Block</button>
              <button type="button" (click)="insertMediaUrl('image', true)" class="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-600 text-emerald-100 rounded text-[10px] font-bold">🖼️ Image URL</button>
              <button type="button" (click)="insertMediaUrl('video', true)" class="px-2 py-0.5 bg-red-700 hover:bg-red-600 text-red-100 rounded text-[10px] font-bold">🎬 Video URL</button>
              <button type="button" (click)="insertAtCursorEdit('\n> blockquote\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-mono">&gt; Quote</button>
              <button type="button" (click)="insertAtCursorEdit('\n> [!TIP]\n> tip text\n')" class="px-2 py-0.5 bg-indigo-700 hover:bg-indigo-600 text-indigo-100 rounded text-[10px] font-bold">[!TIP]</button>
              <button type="button" (click)="insertAtCursorEdit('\n---\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-mono">— HR</button>
              <button type="button" (click)="insertAtCursorEdit('| Col1 | Col2 |\n|---|---|\n| val1 | val2 |\n')" class="px-2 py-0.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded text-[10px] font-mono">⊞ Table</button>
            </div>

            <textarea *ngIf="editSubtopicEditorTab === 'write'"
              id="edit-content-editor-textarea"
              [(ngModel)]="editingSubtopic.contentMarkdown" rows="14"
              class="w-full bg-slate-950 text-green-300 border border-slate-700 rounded-xl p-3 font-mono text-[11px] outline-none resize-y focus:border-indigo-500 leading-relaxed"></textarea>
            <div *ngIf="editSubtopicEditorTab === 'preview'"
              class="w-full min-h-[200px] max-h-[400px] overflow-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-5 text-slate-800 dark:text-slate-100">
              <span class="text-slate-400 italic text-xs font-mono" *ngIf="!editingSubtopic.contentMarkdown">Nothing to preview yet.</span>
              <div *ngIf="editingSubtopic.contentMarkdown" [innerHTML]="renderMarkdown(editingSubtopic.contentMarkdown)"></div>
            </div>
          </div>

          <!-- Interactive Code Snippet -->
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">⚡ Interactive Code Snippet (Optional — shown in playground panel)</label>
            <div class="h-[150px] border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden mb-2">
              <app-monaco-editor 
                [value]="editingSubtopic.codeExample || ''" 
                (valueChange)="editingSubtopic.codeExample = $event" 
                [language]="'javascript'">
              </app-monaco-editor>
            </div>
          </div>

          <!-- Linked Problem IDs -->
          <div>
            <label class="block font-mono font-bold text-slate-600 dark:text-slate-400 mb-1">🔗 Linked Problem IDs (comma-separated)</label>
            <input type="text" [(ngModel)]="editingSubtopic.linkedProblemIdsRaw" class="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 text-slate-900 dark:text-white outline-none font-mono">
          </div>

          <div class="flex justify-end gap-2 pt-2">
            <button (click)="editingSubtopic = null" class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">Cancel</button>
            <button (click)="saveEditedSubtopic()" class="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold font-mono transition-all">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminGuidebookComponent implements OnInit {
  guidebookTopicsList: any[] = [];
  guidebookFilter: string = 'ALL';

  showTopicModal = false;
  newTopic = { title: '', description: '', category: 'JS' as 'DSA' | 'JS', icon: 'book', orderIndex: 0 };
  confirmDeleteTopicId: string | null = null;

  showSubtopicModal = false;
  subtopicEditorTab: 'write' | 'preview' = 'write';
  newSubtopic = { topicId: '', title: '', description: '', contentMarkdown: '', codeExample: '', linkedProblemIdsRaw: '' };

  editingSubtopic: any = null;
  editSubtopicEditorTab: 'write' | 'preview' = 'write';
  confirmDeleteSubtopicId: string | null = null;

  constructor(
    private dsaService: DsaService,
    private authService: AuthService,
    private toast: ToastService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadGuidebookTopics();
  }

  loadGuidebookTopics() {
    this.dsaService.getGuidebookTopics().subscribe({
      next: (topics) => {
        this.guidebookTopicsList = topics;
      }
    });
  }

  getFilteredTopics(): any[] {
    if (this.guidebookFilter === 'ALL') {
      return this.guidebookTopicsList;
    }
    return this.guidebookTopicsList.filter(t => t.category === this.guidebookFilter);
  }

  openTopicModal() {
    const user = this.authService.currentUserSignal();
    if (!user) return;
    this.newTopic = { title: '', description: '', category: 'JS', icon: 'book', orderIndex: 0 };
    this.showTopicModal = true;
  }

  submitNewTopic() {
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin permissions required.');
      return;
    }
    if (!this.newTopic.title) {
      this.toast.error('Title is required.');
      return;
    }

    const payload = {
      adminUserId: user.id,
      ...this.newTopic
    };

    this.dsaService.addGuidebookTopic(payload).subscribe({
      next: () => {
        this.toast.success('Topic created!');
        this.showTopicModal = false;
        this.loadGuidebookTopics();
      },
      error: () => this.toast.error('Failed to create topic.')
    });
  }

  deleteTopic(id: string) {
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin permissions required.');
      return;
    }

    this.dsaService.deleteGuidebookTopic(id, user.id).subscribe({
      next: () => {
        this.toast.success('Topic deleted.');
        this.confirmDeleteTopicId = null;
        this.loadGuidebookTopics();
      },
      error: () => this.toast.error('Failed to delete topic.')
    });
  }

  openSubtopicModal() {
    if (!this.guidebookTopicsList || this.guidebookTopicsList.length === 0) {
      this.toast.error('Create a topic header first!');
      return;
    }
    this.newSubtopic = {
      topicId: this.guidebookTopicsList[0].id,
      title: '',
      description: '',
      contentMarkdown: '',
      codeExample: '',
      linkedProblemIdsRaw: ''
    };
    this.subtopicEditorTab = 'write';
    this.showSubtopicModal = true;
  }

  submitNewSubtopic() {
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin permissions required.');
      return;
    }
    if (!this.newSubtopic.title || !this.newSubtopic.contentMarkdown) {
      this.toast.error('Title and Markdown content are required.');
      return;
    }

    const linkedProblemIds = this.newSubtopic.linkedProblemIdsRaw.split(',').map(s => s.trim()).filter(Boolean);
    const payload = {
      adminUserId: user.id,
      topicId: this.newSubtopic.topicId,
      title: this.newSubtopic.title,
      description: this.newSubtopic.description,
      contentMarkdown: this.newSubtopic.contentMarkdown,
      codeExample: this.newSubtopic.codeExample,
      linkedProblemIds
    };

    this.dsaService.addGuidebookSubtopic(payload).subscribe({
      next: () => {
        this.toast.success('Article published!');
        this.showSubtopicModal = false;
        this.loadGuidebookTopics();
      },
      error: (e: any) => this.toast.error(e.error?.error || 'Failed to publish article.')
    });
  }

  startEditSubtopic(sub: any) {
    this.editingSubtopic = JSON.parse(JSON.stringify(sub));
    this.editingSubtopic.linkedProblemIdsRaw = (sub.linkedProblemIds || []).join(', ');
    this.editSubtopicEditorTab = 'write';
  }

  saveEditedSubtopic() {
    if (!this.editingSubtopic) return;
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin permissions required.');
      return;
    }

    const linkedProblemIds = this.editingSubtopic.linkedProblemIdsRaw.split(',').map((s: string) => s.trim()).filter(Boolean);
    const payload = {
      adminUserId: user.id,
      ...this.editingSubtopic,
      linkedProblemIds
    };

    this.dsaService.updateGuidebookSubtopic(this.editingSubtopic.id, payload).subscribe({
      next: () => {
        this.toast.success('Article updated!');
        this.editingSubtopic = null;
        this.loadGuidebookTopics();
      },
      error: () => this.toast.error('Failed to update article.')
    });
  }

  deleteSubtopic(id: string) {
    const user = this.authService.currentUserSignal();
    if (!user || user.role !== 'admin') {
      this.toast.error('Admin permissions required.');
      return;
    }

    this.dsaService.deleteGuidebookSubtopic(id, user.id).subscribe({
      next: () => {
        this.toast.success('Article deleted.');
        this.confirmDeleteSubtopicId = null;
        this.loadGuidebookTopics();
      },
      error: () => this.toast.error('Failed to delete article.')
    });
  }

  insertAtCursor(text: string) {
    const textarea = document.getElementById('content-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
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

  insertAtCursorEdit(text: string) {
    const textarea = document.getElementById('edit-content-editor-textarea') as HTMLTextAreaElement;
    if (!textarea) return;
    const start = textarea.selectionStart ?? textarea.value.length;
    const end = textarea.selectionEnd ?? start;
    this.editingSubtopic.contentMarkdown = this.editingSubtopic.contentMarkdown.substring(0, start) + text + this.editingSubtopic.contentMarkdown.substring(end);
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + text.length;
      textarea.focus();
    }, 0);
  }

  insertTextColor(isEditMode: boolean = false) {
    const color = prompt('Enter color name or Hex code (e.g. red, #ff0000):', '#ff0000');
    if (!color) return;
    const markdown = `<span style="color: ${color}">colored text</span>`;
    if (isEditMode) {
      this.insertAtCursorEdit(markdown);
    } else {
      this.insertAtCursor(markdown);
    }
  }

  insertMediaUrl(type: 'image' | 'video', isEditMode: boolean = false) {
    if (type === 'image') {
      const url = prompt('Enter Image URL:');
      if (!url) return;
      const caption = prompt('Enter Image Caption/Description:', 'Image description');
      const markdown = `\n![${caption || 'Image'}](${url})\n`;
      if (isEditMode) {
        this.insertAtCursorEdit(markdown);
      } else {
        this.insertAtCursor(markdown);
      }
    } else {
      const url = prompt('Enter YouTube or direct Video URL:');
      if (!url) return;
      const markdown = `\n[VIDEO](${url})\n`;
      if (isEditMode) {
        this.insertAtCursorEdit(markdown);
      } else {
        this.insertAtCursor(markdown);
      }
    }
  }

  loadExample() {
    this.newSubtopic.contentMarkdown = [
      '# JavaScript closures',
      'Closures are fundamental scope structures in JS.',
      '',
      '## Code Block example:',
      '```javascript',
      'function makeCounter(start = 0) {',
      '  let count = start; // captured in closure',
      '  return function() {',
      '    return count++;',
      '  }',
      '}',
      'const c = makeCounter(10);',
      'console.log(c()); // 10',
      'console.log(c()); // 11',
      '```',
      '',
      '🖼️ Inline Visual Guide Diagram:',
      '![Closure Scope Representation](https://images.unsplash.com/photo-1516116211223-5c359a36298a?auto=format&fit=crop&w=1000&q=80)',
      '',
      '🎬 Interactive Walkthrough:',
      '[VIDEO](https://youtube.com/watch?v=qykXgMTqT8Y)',
      '',
      '| Feature | Description |',
      '|---|---|',
      '| Private Scope | Encapsulation |',
      '| Stateful | Remembers lexical environment |',
      '',
      '> [!TIP]',
      '> Closures capture variables by reference, not by value!'
    ].join('\n');
    this.subtopicEditorTab = 'write';
  }

  renderMarkdown(markdown: string): SafeHtml {
    if (!markdown) return '';
    let html = markdown.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_: string, lang: string, code: string) => {
      const esc = code.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      const lbl = lang ? `<span style="position:absolute;top:8px;right:12px;font-size:10px;color:#94a3b8;font-family:monospace">${lang}</span>` : '';
      return `<div style="position:relative;background:#0f172a;color:#cbd5e1;padding:12px;border-radius:10px;font-family:monospace;font-size:11px;margin:12px 0;overflow-x:auto;line-height:1.5">${lbl}<pre style="margin:0">${esc}</pre></div>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background:#f1f5f9;color:#0f172a;padding:2px 5px;border-radius:4px;font-size:11px;font-family:monospace">$1</code>');

    // Video
    html = html.replace(/\[VIDEO\]\((https?:\/\/[^\)]+)\)/g, (_: string, url: string) => {
      const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\?#]+)/);
      if (m && m[1]) {
        const id = m[1];
        return `<div style="margin:16px 0;aspect-ratio:16/9;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0"><iframe src="https://www.youtube.com/embed/${id}" style="width:100%;height:100%;border:none" allowfullscreen></iframe></div>`;
      }
      return `<div style="margin:16px 0;padding:12px;background:#fff1f2;color:#e11d48;border-radius:10px;font-size:11px"><i class="fa-solid fa-play-circle mr-1"></i> <a href="${url}" target="_blank" class="font-bold underline">${url}</a> (Embedded player requires valid YouTube URL)</div>`;
    });

    // Images
    html = html.replace(/!\[(.*?)\]\((.*?)\)/g, '<div style="margin:18px 0;border-radius:14px;overflow:hidden;border:1px solid #e2e8f0"><img src="$2" alt="$1" style="width:100%;max-height:260px;object-fit:cover" loading="lazy"/><p style="margin:0;padding:7px;background:#f8fafc;font-size:11px;font-family:monospace;color:#64748b;text-align:center;font-style:italic">$1</p></div>');

    // Highlights
    html = html.replace(/<mark>([\s\S]*?)<\/mark>/gi, '<mark style="background-color: #fef08a; padding: 2px 4px; border-radius: 4px; color: #1e293b">$1</mark>');

    // Tips and Alerts
    html = html.replace(/^>\s+\[!TIP\]\r?\n([\s\S]*?)(?=\n\n|\n[^\s>])/gm, '<div style="margin:14px 0;padding:12px 14px;background:#e0e7ff;border-left:4px solid #6366f1;border-radius:8px;color:#3730a3;font-size:11px"><strong style="display:block;margin-bottom:3px">💡 TIP:</strong>$1</div>');
    html = html.replace(/^>\s+blockquote\r?\n([\s\S]*?)(?=\n\n|\n[^\s>])/gm, '<blockquote style="border-left:4px solid #cbd5e1;padding-left:12px;color:#64748b;font-style:italic;margin:12px 0">$1</blockquote>');

    // Tables
    html = html.replace(/^\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)+)/gim, (_: string, hdr: string, rows: string) => {
      const ths = hdr.split('|').filter((c: string) => c.trim()).map((c: string) => `<th style="padding:8px 10px;text-align:left;font-size:11px;font-weight:700;border-bottom:1px solid #e2e8f0;background:#f8fafc">${c.trim()}</th>`).join('');
      const trs = rows.trim().split('\n').map((row: string) => `<tr>${row.split('|').filter((c: string) => c.trim()).map((c: string) => `<td style="padding:7px 10px;font-size:11px;border-bottom:1px solid #f1f5f9">${c.trim()}</td>`).join('')}</tr>`).join('');
      return `<div style="overflow-x:auto;margin:14px 0;border:1px solid #e2e8f0;border-radius:10px"><table style="width:100%;border-collapse:collapse">${ths}<tbody>${trs}</tbody></table></div>`;
    });

    // Horizontal Rule
    html = html.replace(/^---$/gim, '<hr style="margin:20px 0;border:none;border-top:1px solid #e2e8f0"/>');

    // Wrap remaining blocks in paragraph tags
    html = '<p style="margin-bottom:12px">' + html.replace(/\n\n/g, '</p><p style="margin-bottom:12px">') + '</p>';
    
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}
