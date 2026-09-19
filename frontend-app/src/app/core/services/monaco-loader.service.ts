import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MonacoLoaderService {
  private loadingPromise: Promise<void> | null = null;
  private isLoaded = false;

  constructor() {
    this.preload();
  }

  preload(): Promise<void> {
    if (this.isLoaded) {
      return Promise.resolve();
    }
    if (this.loadingPromise) {
      return this.loadingPromise;
    }

    this.loadingPromise = new Promise<void>((resolve) => {
      if ((window as any).monaco) {
        this.isLoaded = true;
        resolve();
        return;
      }

      let script = document.querySelector('script[src*="loader.js"]') as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.src = 'assets/monaco/vs/loader.js';
        document.head.appendChild(script);
      }

      const checkAndLoad = () => {
        if ((window as any).require) {
          (window as any).require.config({ paths: { vs: 'assets/monaco/vs' } });
          (window as any).require(['vs/editor/editor.main'], () => {
            this.isLoaded = true;
            resolve();
          });
        } else {
          setTimeout(checkAndLoad, 50);
        }
      };

      script.onload = () => {
        checkAndLoad();
      };
    });

    return this.loadingPromise;
  }

  isMonacoLoaded(): boolean {
    return this.isLoaded || !!(window as any).monaco;
  }
}
