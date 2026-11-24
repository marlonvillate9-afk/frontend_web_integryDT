import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible) {
      <div class="backdrop" (click)="onCancel()">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>{{ title }}</h3>
          <p>{{ message }}</p>
          <div class="actions">
            <button class="btn-cancel" (click)="onCancel()">Cancelar</button>
            <button class="btn-danger" (click)="onConfirm()">{{ confirmLabel }}</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .backdrop {
      position: fixed; inset: 0; background: rgba(0,0,0,.6);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
      animation: fadeIn .2s;
    }
    .modal {
      background: #151f30; border: 1px solid #1e2d44;
      border-radius: 12px; padding: 28px; width: 380px;
      animation: slideUp .25s ease; font-family: 'Outfit', sans-serif;
      h3 { font-size: 17px; font-weight: 600; margin-bottom: 10px; color: #f1f5f9; }
      p  { font-size: 13.5px; color: #64748b; margin-bottom: 22px; line-height: 1.6; }
    }
    .actions { display: flex; gap: 10px; }
    .btn-cancel {
      flex: 1; background: #182232; color: #f1f5f9;
      border: 1px solid #1e2d44; border-radius: 8px; padding: 11px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      font-family: 'Outfit', sans-serif;
      &:hover { background: rgba(255,255,255,.06); }
    }
    .btn-danger {
      flex: 1; background: #e11d48; color: #fff; border: none;
      border-radius: 8px; padding: 11px; font-size: 14px; font-weight: 600;
      cursor: pointer; font-family: 'Outfit', sans-serif;
      &:hover { background: #be123c; }
    }
    @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
    @keyframes slideUp { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
  `]
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() title = 'Confirmar';
  @Input() message = '¿Estás seguro?';
  @Input() confirmLabel = 'Confirmar';
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();
  onConfirm(): void { this.confirmed.emit(); }
  onCancel():  void { this.cancelled.emit(); }
}
