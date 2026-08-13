import {
  Component, Input, Output, EventEmitter,
  OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';

declare const monaco: any;

@Component({
  selector: 'app-monaco-editor',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .monaco-host { width: 100%; height: 100%; min-height: 300px; }
  `],
  template: `<div #editorHost class="monaco-host"></div>`
})
export class MonacoEditorComponent implements AfterViewInit, OnChanges, OnDestroy {
  @ViewChild('editorHost', { static: true }) editorHost!: ElementRef<HTMLDivElement>;

  @Input() value = '';
  @Input() language = 'javascript';
  @Input() readOnly = false;
  @Input() theme = 'vs-dark';
  @Output() valueChange = new EventEmitter<string>();

  private editor: any = null;
  private monacoLoaded = false;

  ngAfterViewInit() {
    this.loadMonaco();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.editor) {
      if (changes['value'] && changes['value'].currentValue !== this.editor.getValue()) {
        this.editor.setValue(changes['value'].currentValue || '');
      }
      if (changes['readOnly']) {
        this.editor.updateOptions({ readOnly: this.readOnly });
      }
      if (changes['theme'] && (window as any).monaco?.editor) {
        (window as any).monaco.editor.setTheme(changes['theme'].currentValue);
      }
    }
  }

  private loadMonaco() {
    if ((window as any).monaco) {
      this.initEditor();
      return;
    }

    const script = document.createElement('script');
    script.src = 'assets/monaco/vs/loader.js';
    script.onload = () => {
      (window as any).require.config({ paths: { vs: 'assets/monaco/vs' } });
      (window as any).require(['vs/editor/editor.main'], () => {
        this.initEditor();
      });
    };
    document.head.appendChild(script);
  }

  private initEditor() {
    if (!this.editorHost?.nativeElement) return;

    this.editor = (window as any).monaco.editor.create(this.editorHost.nativeElement, {
      value: this.value || '',
      language: this.language,
      theme: this.theme,
      readOnly: this.readOnly,
      automaticLayout: true,
      fontSize: 13,
      fontFamily: '"Fira Code", "Cascadia Code", "JetBrains Mono", monospace',
      fontLigatures: true,
      lineNumbers: 'on',
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      tabSize: 2,
      insertSpaces: true,
      formatOnPaste: true,
      suggest: { showKeywords: true },
      contextmenu: true,
      smoothScrolling: true,
      cursorBlinking: 'smooth',
      renderLineHighlight: 'gutter',
      bracketPairColorization: { enabled: true },
      padding: { top: 12, bottom: 12 }
    });

    this.editor.onDidChangeModelContent(() => {
      this.valueChange.emit(this.editor.getValue());
    });

    this.monacoLoaded = true;
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.dispose();
    }
  }
}
