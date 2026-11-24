import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActionHistoryService } from '../../core/services/action-history.service';

@Component({
  selector: 'app-historial',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <span class="breadcrumb">Sistema</span>
        <h1>Historial de Acciones</h1>
      </div>
      <div class="card">
        <div class="filters">
          <input class="search-input" [ngModel]="search()" (ngModelChange)="search.set($event)"
                 name="s" placeholder="Buscar módulo o acción...">
          <select class="filter-select" [ngModel]="status()" (ngModelChange)="status.set($event)" name="st">
            <option value="">Todos los estados</option>
            <option value="success">Exitoso</option>
            <option value="error">Error</option>
            <option value="warning">Advertencia</option>
          </select>
        </div>
        <div class="table-wrap">
          <table>
            <thead><tr>
              <th>Módulo</th><th>Acción</th><th>Usuario</th><th>Fecha/Hora</th><th>Estado</th>
            </tr></thead>
            <tbody>
              @for (r of filtered(); track r.id) {
                <tr>
                  <td><span class="mod-tag">{{ r.module }}</span></td>
                  <td>{{ r.action }}</td>
                  <td>{{ r.user }}</td>
                  <td class="mono">{{ r.timestamp | date:'dd/MM/yyyy HH:mm:ss' }}</td>
                  <td><span class="badge" [class]="statusClass(r.status)">{{ r.status }}</span></td>
                </tr>
              }
              @if (filtered().length === 0) {
                <tr><td colspan="5" class="empty">No se encontraron registros.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 36px 40px; display: flex; flex-direction: column; gap: 24px; height: 100%; }
    .page-header { .breadcrumb { font-size: 13px; color: var(--muted); display: block; margin-bottom: 4px; } h1 { font-size: 24px; font-weight: 600; } }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 22px; flex: 1; overflow: hidden; display: flex; flex-direction: column; }
    .filters { display: flex; gap: 10px; margin-bottom: 14px; }
    .search-input { flex: 1; background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; padding: 9px 14px; color: var(--text); font-size: 13.5px; outline: none; font-family: 'Outfit', sans-serif; &:focus { border-color: var(--cyan); } }
    .filter-select { background: var(--bg-input); border: 1px solid var(--border); border-radius: 8px; padding: 9px 14px; color: var(--text); font-size: 13.5px; outline: none; font-family: 'Outfit', sans-serif; cursor: pointer; }
    .table-wrap { overflow-y: auto; flex: 1; }
    table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    thead th { text-align: left; padding: 10px 14px; color: var(--muted); font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: .6px; border-bottom: 1px solid var(--border); }
    tbody tr { border-bottom: 1px solid var(--border); transition: background .2s; &:last-child { border-bottom: none; } &:hover { background: rgba(255,255,255,.025); } }
    tbody td { padding: 12px 14px; vertical-align: middle; }
    .mod-tag { background: var(--cyan-dim); color: var(--cyan); padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .mono { font-family: monospace; font-size: 12.5px; }
    .empty { text-align: center; color: var(--muted); padding: 32px; }
    .badge-red    { background: var(--red-dim);    color: var(--red);    }
    .badge-yellow { background: var(--yellow-dim); color: var(--yellow); }
  `]
})
export class HistorialComponent {
  svc    = inject(ActionHistoryService);
  search = signal('');
  status = signal('');

  filtered = computed(() => {
    const q = this.search().toLowerCase();
    const s = this.status();
    return this.svc.records().filter(r =>
      (r.module.toLowerCase().includes(q) || r.action.toLowerCase().includes(q)) &&
      (s ? r.status === s : true)
    );
  });

  statusClass(s: string): string {
    return { success: 'badge-on', error: 'badge-red', warning: 'badge-yellow' }[s] ?? '';
  }
}
