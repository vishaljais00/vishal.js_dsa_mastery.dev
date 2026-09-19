import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ThemeService } from '../../core/services/theme.service';
import { MonacoEditorComponent } from '../../shared/monaco-editor/monaco-editor.component';

interface ConsoleLog {
  type: 'log' | 'warn' | 'error' | 'info';
  message: string;
  timestamp: string;
}

@Component({
  selector: 'app-playground',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, MonacoEditorComponent],
  template: `
    <div class="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-800 dark:text-slate-100 py-6 transition-colors font-sans">
      <div class="max-w-7xl mx-auto px-4">
        
        <!-- Header Bar -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div class="flex items-center gap-2 mb-1">
              <span class="px-2.5 py-0.5 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <i class="fa-brands fa-js"></i> JS Interactive Playground
              </span>
              <span class="px-2.5 py-0.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 dark:border-indigo-500/30 text-xs font-mono font-bold flex items-center gap-1.5">
                <i class="fa-solid fa-shield-halved"></i> Sandboxed Environment
              </span>
            </div>
            <h1 class="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Online JavaScript Code Playground
            </h1>
          </div>

          <!-- Controls & Templates -->
          <div class="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select 
              [(ngModel)]="selectedTemplate" 
              (change)="loadTemplate()"
              class="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-mono px-3 py-2 rounded-xl outline-none"
            >
              <option value="custom">-- Preset JS Snippets --</option>
              <option value="async">Event Loop &amp; Promises</option>
              <option value="fetch">Fetch API &amp; Async/Await</option>
              <option value="closure">Closure &amp; Encapsulation</option>
              <option value="debounce">Custom Debounce Function</option>
              <option value="twosum">Two Sum Algorithm</option>
            </select>

            <button 
              (click)="resetCode()" 
              class="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono text-xs transition-all flex items-center gap-1.5"
            >
              <i class="fa-solid fa-rotate-left"></i> Reset
            </button>

            <button 
              (click)="runCode()" 
              [disabled]="isRunning"
              class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-mono font-extrabold text-xs transition-all flex items-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
            >
              <i [class.fa-bolt]="!isRunning" [class.fa-circle-notch]="isRunning" [class.fa-spin]="isRunning" class="fa-solid"></i>
              {{ isRunning ? 'Executing...' : '⚡ Run Code [Ctrl+Enter]' }}
            </button>
          </div>
        </div>

        <!-- Main Grid: Code Editor vs Console Output -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          <!-- Code Editor Pane -->
          <div class="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xl min-h-[550px]">
            <div class="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
              <div class="flex items-center gap-2">
                <span class="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span class="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span class="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span class="text-xs font-mono text-slate-500 dark:text-slate-400 font-bold ml-2">script.js</span>
              </div>
              <button (click)="copyCode()" class="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <i class="fa-regular fa-copy mr-1"></i> Copy
              </button>
            </div>

            <!-- Code Monaco Editor -->
            <div class="flex-1 w-full min-h-[480px]">
              <app-monaco-editor 
                [value]="code" 
                (valueChange)="code = $event" 
                [language]="'javascript'"
                [theme]="themeService.themeSignal() === 'dark' ? 'vs-dark' : 'vs-light'"
              ></app-monaco-editor>
            </div>
          </div>

          <!-- Console Output Pane -->
          <div class="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col shadow-xl min-h-[550px]">
            <div class="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
              <div class="flex items-center gap-2">
                <i class="fa-solid fa-terminal text-amber-500 text-xs"></i>
                <span class="text-xs font-mono text-slate-700 dark:text-slate-300 font-bold">Console Output</span>
                <span *ngIf="executionTimeMs !== null" class="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  {{ executionTimeMs }}ms
                </span>
              </div>

              <button (click)="clearConsole()" class="text-xs font-mono text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <i class="fa-solid fa-trash-can mr-1"></i> Clear
              </button>
            </div>

            <!-- Output Body -->
            <div class="p-4 flex-1 overflow-y-auto font-mono text-xs space-y-2 bg-slate-50/50 dark:bg-slate-950/40">
              
              <!-- Empty state -->
              <div *ngIf="logs.length === 0 && !executionError" class="h-full flex flex-col items-center justify-center py-20 text-slate-400 dark:text-slate-600">
                <i class="fa-solid fa-play text-2xl mb-2 opacity-40"></i>
                <p>Click "Run Code" to view console output here.</p>
              </div>

              <!-- Log Rows -->
              <div *ngFor="let log of logs" 
                [ngClass]="{
                  'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800': log.type === 'log',
                  'bg-amber-50/50 dark:bg-amber-950/30 border-l-2 border-amber-500': log.type === 'warn',
                  'bg-rose-50/50 dark:bg-rose-950/30 border-l-2 border-rose-500': log.type === 'error',
                  'bg-indigo-50/50 dark:bg-indigo-950/30 border-l-2 border-indigo-500': log.type === 'info'
                }"
                class="flex items-start gap-2 p-2 rounded-lg"
              >
                <span class="text-slate-400 dark:text-slate-500 shrink-0 text-[10px]">{{ log.timestamp }}</span>
                <pre class="whitespace-pre-wrap break-all text-slate-800 dark:text-slate-200" 
                  [class.text-amber-700]="log.type === 'warn' && themeService.themeSignal() === 'light'"
                  [class.text-amber-300]="log.type === 'warn' && themeService.themeSignal() === 'dark'"
                  [class.text-rose-700]="log.type === 'error' && themeService.themeSignal() === 'light'"
                  [class.text-rose-400]="log.type === 'error' && themeService.themeSignal() === 'dark'"
                  [class.text-indigo-700]="log.type === 'info' && themeService.themeSignal() === 'light'"
                  [class.text-sky-300]="log.type === 'info' && themeService.themeSignal() === 'dark'"
                >{{ log.message }}</pre>
              </div>

              <!-- Execution Error Box -->
              <div *ngIf="executionError" class="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/80 rounded-xl text-rose-700 dark:text-rose-300">
                <div class="font-bold flex items-center gap-1.5 mb-1 text-rose-800 dark:text-rose-400">
                  <i class="fa-solid fa-triangle-exclamation"></i> Execution Error / Exception
                </div>
                <pre class="whitespace-pre-wrap text-[11px] leading-relaxed">{{ executionError }}</pre>
              </div>

            </div>

            <!-- Security Footer Note -->
            <div class="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400 dark:text-slate-500 flex items-center justify-between">
              <span>Status: <strong [class.text-emerald-600]="(status === 'IDLE' || status === 'SUCCESS') && themeService.themeSignal() === 'light'" [class.text-emerald-400]="(status === 'IDLE' || status === 'SUCCESS') && themeService.themeSignal() === 'dark'" [class.text-rose-600]="status === 'ERROR' && themeService.themeSignal() === 'light'" [class.text-rose-400]="status === 'ERROR' && themeService.themeSignal() === 'dark'">{{ status }}</strong></span>
              <span>Async Execution: Up to 10s max</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  `
})
export class PlaygroundComponent implements OnInit, OnDestroy {
  code: string = '';
  selectedTemplate: string = 'async';
  logs: ConsoleLog[] = [];
  executionError: string | null = null;
  executionTimeMs: number | null = null;
  isRunning: boolean = false;
  status: 'IDLE' | 'RUNNING' | 'SUCCESS' | 'ERROR' = 'IDLE';

  private worker: Worker | null = null;

  constructor(public themeService: ThemeService) {}

  ngOnInit() {
    const passedCode = sessionStorage.getItem('playground_code');
    if (passedCode) {
      this.code = passedCode;
      sessionStorage.removeItem('playground_code');
    } else {
      this.loadTemplate();
    }
  }

  ngOnDestroy() {
    this.terminateWorker();
  }

  loadTemplate() {
    switch (this.selectedTemplate) {
      case 'async':
        this.code = `// Event Loop & Promises Demo
console.log('1: Synchronous start');

setTimeout(() => {
  console.warn('4: Macrotask (setTimeout 2000ms)');
}, 2000);

Promise.resolve().then(() => {
  console.log('2: Microtask (Promise 1)');
}).then(() => {
  console.log('3: Microtask (Promise 2)');
});

console.log('5: Synchronous end');`;
        break;
      case 'fetch':
        this.code = `// Fetch API & Async/Await Demo
console.log('1: Dispatching HTTP GET request to JSONPlaceholder API...');

async function fetchTodo() {
  try {
    const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
    const data = await response.json();
    console.log('2: Received Todo Data from API:');
    console.log('   ID:', data.id);
    console.log('   Title:', data.title);
    console.log('   Completed:', data.completed);
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

fetchTodo();
console.log('3: Async function dispatched!');`;
        break;
      case 'closure':
        this.code = `// Closure & Private State Demo
function createCounter(initial = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count
  };
}

const counter = createCounter(10);
console.log('Initial value:', counter.getValue());
console.log('Incremented:', counter.increment());
console.log('Incremented:', counter.increment());
console.log('Decremented:', counter.decrement());`;
        break;
      case 'debounce':
        this.code = `// Custom Debounce Function Implementation
function debounce(fn, delayMs) {
  let timerId;
  return function(...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delayMs);
  };
}

const logSearch = debounce((query) => {
  console.log('API Request sent for query:', query);
}, 300);

console.log('Triggering search keypresses...');
logSearch('a');
logSearch('ap');
logSearch('app');
logSearch('apple');`;
        break;
      case 'twosum':
        this.code = `// Two Sum Algorithm Pattern
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i];
    if (map.has(diff)) {
      return [map.get(diff), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const result = twoSum([2, 7, 11, 15], 9);
console.log('Indices for Target 9:', result);`;
        break;
      default:
        this.code = `console.log('Hello from JS Playground!');`;
    }
  }

  resetCode() {
    this.loadTemplate();
    this.clearConsole();
  }

  clearConsole() {
    this.logs = [];
    this.executionError = null;
    this.executionTimeMs = null;
    this.status = 'IDLE';
  }

  copyCode() {
    navigator.clipboard.writeText(this.code);
  }

  private sanitizeCode(code: string): string | null {
    const forbiddenPatterns = [
      /\bprocess\b/i,
      /\bglobal\b/i,
      /\bglobalThis\b/i,
      /\bimportScripts\b/i,
      /\bpostMessage\b/i,
      /\bonmessage\b/i,
      /\bclose\s*\(/i,
      /\brequire\s*\(/i,
      /\bimport\s*\(/i,
      /\bimport\s+/i,
      /\bchild_process\b/i,
      /\bfs\b/i,
      /\bmodule\b/i,
      /\bmainModule\b/i,
      /\b__dirname\b/i,
      /\b__filename\b/i,
      /\bconstructor\s*\.\s*constructor\b/i,
      /\bnew\s+Function\b/i,
      /\bFunction\s*\(/,
      /\beval\s*\(/i,
      /\bReflect\b/i,
      /\bProxy\b/i,
      /\b__proto__\b/i
    ];

    for (const pattern of forbiddenPatterns) {
      if (pattern.test(code)) {
        return `Security Violation: Forbidden keyword or escape pattern detected (${pattern.source})`;
      }
    }
    return null;
  }

  runCode() {
    this.terminateWorker();
    this.clearConsole();

    // Security check: pre-sanitize playground code before execution
    const securityViolation = this.sanitizeCode(this.code);
    if (securityViolation) {
      const nowStr = new Date().toLocaleTimeString();
      this.logs.push({
        type: 'error',
        message: `[SECURITY_ALERT] ${securityViolation}`,
        timestamp: nowStr
      });
      this.executionError = securityViolation;
      this.status = 'ERROR';
      return;
    }

    this.isRunning = true;
    this.status = 'RUNNING';

    const startTime = performance.now();

    // Isolated Web Worker Script string with security scope stripping & console interception
    const workerScript = `
      self.onmessage = function(e) {
        const code = e.data;
        
        // Security: Redefine/disable unsafe DOM/Node globals while exposing safe Web API fetch
        const window = undefined;
        const document = undefined;
        const fetch = typeof self.fetch === 'function' ? self.fetch.bind(self) : undefined;
        const XMLHttpRequest = undefined;
        const WebSocket = undefined;
        const localStorage = undefined;
        const location = undefined;

        // Custom Console interceptor
        let logCount = 0;
        const MAX_LOGS = 500;
        const customConsole = {
          log: (...args) => {
            logCount++;
            if (logCount > MAX_LOGS) {
              throw new Error('Console log limit exceeded. Possible infinite loop.');
            }
            self.postMessage({ type: 'log', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
          },
          warn: (...args) => {
            logCount++;
            if (logCount > MAX_LOGS) {
              throw new Error('Console log limit exceeded. Possible infinite loop.');
            }
            self.postMessage({ type: 'warn', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
          },
          error: (...args) => {
            logCount++;
            if (logCount > MAX_LOGS) {
              throw new Error('Console log limit exceeded. Possible infinite loop.');
            }
            self.postMessage({ type: 'error', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
          },
          info: (...args) => {
            logCount++;
            if (logCount > MAX_LOGS) {
              throw new Error('Console log limit exceeded. Possible infinite loop.');
            }
            self.postMessage({ type: 'info', message: args.map(a => typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)).join(' ') });
          }
        };

        try {
          const runFn = new Function('console', '"use strict";\\n' + code);
          runFn(customConsole);
          self.postMessage({ type: 'DONE' });
        } catch(err) {
          self.postMessage({ type: 'ERROR', error: err.message || String(err) });
        }
      };
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const workerUrl = URL.createObjectURL(blob);
    this.worker = new Worker(workerUrl);

    // 1. Sync Infinite Loop Guard (3 seconds max for synchronous execution to finish)
    let syncTimeoutTimer: any = setTimeout(() => {
      if (this.status === 'RUNNING') {
        this.executionError = 'Execution Error: Maximum Time Limit Exceeded (3000ms). Infinite loop detected.';
        this.status = 'ERROR';
        this.isRunning = false;
        this.terminateWorker();
      }
    }, 3000);

    // 2. Overall Max Async Lifespan (10 seconds max for async setTimeouts / delayed callbacks)
    let maxAsyncTimer: any = setTimeout(() => {
      this.terminateWorker();
    }, 10000);

    // 3. Idle Worker Cleanup (Terminates 3.5s after the LAST log message arrives)
    let idleTimer: any = null;
    const resetIdleTimer = () => {
      if (idleTimer) clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        this.terminateWorker();
      }, 3500);
    };

    this.worker.onmessage = (event) => {
      const data = event.data;
      const nowStr = new Date().toLocaleTimeString();

      if (data.type === 'log' || data.type === 'warn' || data.type === 'error' || data.type === 'info') {
        this.logs.push({ type: data.type, message: data.message, timestamp: nowStr });
        resetIdleTimer();
      } else if (data.type === 'DONE') {
        clearTimeout(syncTimeoutTimer);
        this.executionTimeMs = Math.round(performance.now() - startTime);
        if (this.status === 'RUNNING') {
          this.status = 'SUCCESS';
        }
        this.isRunning = false;
        resetIdleTimer();
      } else if (data.type === 'ERROR') {
        clearTimeout(syncTimeoutTimer);
        clearTimeout(maxAsyncTimer);
        if (idleTimer) clearTimeout(idleTimer);
        this.executionError = data.error;
        this.status = 'ERROR';
        this.isRunning = false;
        this.terminateWorker();
      }
    };

    this.worker.onerror = (err) => {
      clearTimeout(syncTimeoutTimer);
      clearTimeout(maxAsyncTimer);
      if (idleTimer) clearTimeout(idleTimer);
      this.executionError = err.message || 'Worker execution error';
      this.status = 'ERROR';
      this.isRunning = false;
      this.terminateWorker();
    };

    this.worker.postMessage(this.code);
  }

  private terminateWorker() {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
  }
}
