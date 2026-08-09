import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    @keyframes slideInRight {
      from { transform: translateX(110%); opacity: 0; }
      to   { transform: translateX(0);   opacity: 1; }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .toast-enter { animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards; }
    .spinner { animation: spin 0.9s linear infinite; }
  `],
  template: `
    <!-- Fixed toast stack — bottom-right, above everything -->
    <div class="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none" style="max-width:360px">
      <div
        *ngFor="let toast of toastService.toastsSignal(); trackBy: trackById"
        class="toast-enter pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl shadow-2xl border text-sm font-medium select-none cursor-default"
        [ngClass]="toastClass(toast.type)"
      >
        <!-- Icon -->
        <div class="shrink-0 mt-0.5 text-base" [ngSwitch]="toast.type">
          <i *ngSwitchCase="'success'" class="fa-solid fa-circle-check"></i>
          <i *ngSwitchCase="'error'"   class="fa-solid fa-circle-xmark"></i>
          <i *ngSwitchCase="'info'"    class="fa-solid fa-circle-info"></i>
          <i *ngSwitchCase="'loading'" class="fa-solid fa-circle-notch spinner"></i>
        </div>

        <!-- Message -->
        <span class="flex-1 leading-snug">{{ toast.message }}</span>

        <!-- Dismiss button (not shown for loading) -->
        <button
          *ngIf="toast.type !== 'loading'"
          (click)="toastService.dismiss(toast.id)"
          class="shrink-0 opacity-60 hover:opacity-100 transition-opacity text-xs mt-0.5 pointer-events-auto"
          aria-label="Dismiss"
        >
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}

  trackById(_: number, t: Toast) { return t.id; }

  toastClass(type: string): string {
    const base = 'backdrop-blur-md ';
    switch (type) {
      case 'success': return base + 'bg-emerald-950/90 border-emerald-700 text-emerald-200';
      case 'error':   return base + 'bg-rose-950/90    border-rose-700    text-rose-200';
      case 'loading': return base + 'bg-indigo-950/90  border-indigo-700  text-indigo-200';
      default:        return base + 'bg-slate-900/95   border-slate-700   text-slate-200';
    }
  }
}
