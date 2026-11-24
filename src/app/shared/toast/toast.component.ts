import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ToastMessage { text: string; type: 'success' | 'error' | 'info'; }

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible()) {
      <div class="toast" [class]="'toast-' + current().type">
        <span class="dot"></span>
        {{ current().text }}
      </div>
    }
  `,
  styles: [`
    .toast {
      position: fixed; bottom: 28px; right: 28px;
      padding: 13px 20px; border-radius: 10px;
      font-size: 13.5px; font-weight: 500;
      display: flex; align-items: center; gap: 10px;
      z-index: 9999; animation: slideUp .25s ease;
      font-family: 'Outfit', sans-serif;
      .dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    }
    .toast-success { background: #151f30; border: 1px solid #22c55e; color: #f1f5f9; .dot { background: #22c55e; } }
    .toast-error   { background: #151f30; border: 1px solid #e11d48; color: #f1f5f9; .dot { background: #e11d48; } }
    .toast-info    { background: #151f30; border: 1px solid #0ea5e9; color: #f1f5f9; .dot { background: #0ea5e9; } }
    @keyframes slideUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  `]
})
export class ToastComponent implements OnDestroy {
  visible = signal(false);
  current = signal<ToastMessage>({ text: '', type: 'success' });
  private timer?: ReturnType<typeof setTimeout>;

  show(msg: ToastMessage): void {
    this.current.set(msg);
    this.visible.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.visible.set(false), 3200);
  }

  ngOnDestroy(): void { clearTimeout(this.timer); }
}
