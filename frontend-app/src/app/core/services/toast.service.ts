import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number; // ms, 0 = stay until manually removed
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _counter = 0;
  toastsSignal = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration = 3500): number {
    const id = ++this._counter;
    this.toastsSignal.update(list => [...list, { id, type, message, duration }]);
    if (duration > 0) {
      setTimeout(() => this.dismiss(id), duration);
    }
    return id;
  }

  success(message: string, duration = 3500) { return this.show(message, 'success', duration); }
  error(message: string, duration = 5000)   { return this.show(message, 'error', duration); }
  info(message: string, duration = 3500)    { return this.show(message, 'info', duration); }
  loading(message: string): number          { return this.show(message, 'loading', 0); }

  dismiss(id: number) {
    this.toastsSignal.update(list => list.filter(t => t.id !== id));
  }
}
