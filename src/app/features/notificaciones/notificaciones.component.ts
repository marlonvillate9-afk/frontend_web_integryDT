import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, switchMap, timer } from 'rxjs';

interface DeviceRow {
  id: string;
  name: string;
  os: string;
  architecture: string;
  agentVersion: string;
  status: string;
  lastSeenAt: string | null;
}

interface SentNotification {
  id: string;
  title: string;
  body: string;
  priority: string;
  createdAt: string;
  deviceId: string;
  deviceName: string;
  deviceStatus: string;
  jobId: string;
  deliveryStatus: string;
  startedAt: string | null;
  finishedAt: string | null;
  error: string | null;
}

@Component({
  selector: 'app-notificaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <span class="breadcrumb">Equipo / Comunicación</span>
          <h1>Notificaciones al Equipo</h1>
          <p>Envía mensajes autorizados a uno o varios PCs con Client Integry DT.</p>
        </div>
        <button class="secondary" type="button" (click)="refresh()">Actualizar</button>
      </div>

      @if (message()) {
        <div class="feedback" [class.error]="messageType() === 'error'">{{ message() }}</div>
      }

      <div class="layout">
        <section class="card composer">
          <h2>Redactar notificación</h2>
          <div class="form-group">
            <label>Título</label>
            <input class="form-control" [(ngModel)]="title" maxlength="200" placeholder="Ej. Despliegue completado">
          </div>
          <div class="form-group">
            <label>Mensaje</label>
            <textarea class="form-control body" [(ngModel)]="body" maxlength="4000" placeholder="Escribe el mensaje que verá el equipo..."></textarea>
            <small>{{ body.length }}/4000</small>
          </div>
          <div class="form-group">
            <label>Prioridad</label>
            <select class="form-control" [(ngModel)]="priority">
              <option value="low">Baja</option>
              <option value="normal">Normal</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </div>

          <div class="device-header">
            <label>Equipos destino</label>
            <button class="link" type="button" (click)="toggleAll()">{{ allSelected() ? 'Quitar todos' : 'Seleccionar todos' }}</button>
          </div>
          <div class="devices">
            @for (device of devices(); track device.id) {
              <label class="device" [class.selected]="isSelected(device.id)">
                <input type="checkbox" [checked]="isSelected(device.id)" (change)="toggleDevice(device.id)">
                <div>
                  <strong>{{ device.name }}</strong>
                  <span>{{ device.os }} · Client {{ device.agentVersion || '—' }}</span>
                </div>
                <em [class.online]="device.status === 'online'">{{ device.status }}</em>
              </label>
            }
            @if (devices().length === 0) { <div class="empty">No hay equipos enrolados para esta empresa.</div> }
          </div>

          <button class="btn-primary send" type="button" [disabled]="sending() || !canSend()" (click)="send()">
            {{ sending() ? 'Enviando...' : 'Enviar notificación' }}
          </button>
        </section>

        <section class="card history-card">
          <div class="history-title">
            <h2>Historial de entrega</h2>
            <span>{{ history().length }} registros</span>
          </div>
          <div class="history">
            @for (item of history(); track item.id) {
              <article class="notification-row">
                <div class="row-top">
                  <div>
                    <strong>{{ item.title }}</strong>
                    <span>{{ item.deviceName }}</span>
                  </div>
                  <span class="status" [class.success]="item.deliveryStatus === 'success'" [class.failed]="item.deliveryStatus === 'error'">
                    {{ statusLabel(item.deliveryStatus) }}
                  </span>
                </div>
                <p>{{ item.body }}</p>
                <div class="meta">
                  <span class="priority" [attr.data-priority]="item.priority">{{ item.priority }}</span>
                  <span>{{ item.createdAt | date:'dd/MM/yyyy HH:mm:ss' }}</span>
                  <span>Job {{ shortId(item.jobId) }}</span>
                </div>
                @if (item.error) { <pre class="error-detail">{{ item.error }}</pre> }
              </article>
            }
            @if (history().length === 0) { <div class="empty">Aún no se han enviado notificaciones.</div> }
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .page{padding:36px 40px;display:flex;flex-direction:column;gap:22px}.page-header{display:flex;justify-content:space-between;gap:20px;align-items:flex-start}.breadcrumb{font-size:13px;color:var(--muted);display:block;margin-bottom:4px}h1{font-size:24px;font-weight:600;margin:0}.page-header p{color:var(--muted);font-size:13.5px;margin-top:6px}.layout{display:grid;grid-template-columns:380px minmax(0,1fr);gap:20px;align-items:start}.card{background:var(--bg-card);border:1px solid var(--border);border-radius:12px;padding:22px}.card h2{font-size:15px;margin:0 0 18px}.form-group{margin-bottom:14px}.form-group label,.device-header label{display:block;font-size:13px;font-weight:600;margin-bottom:7px}.form-group small{color:var(--muted);font-size:11px;float:right;margin-top:4px}.body{min-height:115px;resize:vertical}.device-header{display:flex;justify-content:space-between;align-items:center;margin:18px 0 8px}.device-header label{margin:0}.link{border:0;background:none;color:var(--cyan);cursor:pointer;font:inherit;font-size:12px}.devices{display:flex;flex-direction:column;gap:8px;max-height:260px;overflow:auto}.device{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:10px 12px;border:1px solid var(--border);border-radius:9px;cursor:pointer;background:var(--bg-active)}.device.selected{border-color:var(--cyan)}.device strong{display:block;font-size:13px}.device div span{display:block;color:var(--muted);font-size:11px;margin-top:2px}.device em{font-style:normal;font-size:11px;color:var(--muted)}.device em.online{color:#22c55e}.send{width:100%;margin-top:18px}.secondary{background:var(--bg-card);border:1px solid var(--border);color:var(--text);padding:9px 15px;border-radius:8px;cursor:pointer}.feedback{padding:10px 13px;border-radius:8px;background:rgba(34,197,94,.12);color:#22c55e;font-size:13px}.feedback.error{background:var(--red-dim);color:var(--red)}.history-card{min-width:0}.history-title{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid var(--border);padding-bottom:14px;margin-bottom:12px}.history-title h2{margin:0}.history-title span{font-size:12px;color:var(--muted)}.history{display:flex;flex-direction:column;gap:10px;max-height:650px;overflow:auto}.notification-row{border:1px solid var(--border);border-radius:10px;padding:14px;background:var(--bg-active)}.row-top{display:flex;justify-content:space-between;gap:12px}.row-top strong{display:block;font-size:14px}.row-top div span{font-size:12px;color:var(--muted)}.notification-row p{font-size:13px;color:var(--muted);margin:10px 0}.status{font-size:11px;padding:4px 8px;border-radius:999px;background:rgba(148,163,184,.12);height:max-content}.status.success{color:#22c55e;background:rgba(34,197,94,.12)}.status.failed{color:var(--red);background:var(--red-dim)}.meta{display:flex;gap:10px;flex-wrap:wrap;font-size:11px;color:var(--muted)}.priority{text-transform:uppercase}.priority[data-priority='urgent'],.priority[data-priority='high']{color:var(--yellow)}.error-detail{margin-top:10px;background:rgba(239,68,68,.08);color:var(--red);padding:8px;border-radius:6px;white-space:pre-wrap;font-size:11px}.empty{text-align:center;color:var(--muted);padding:25px;font-size:13px}@media(max-width:1000px){.layout{grid-template-columns:1fr}}
  `]
})
export class NotificacionesComponent {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);
  readonly devices = signal<DeviceRow[]>([]);
  readonly history = signal<SentNotification[]>([]);
  readonly selected = signal<Set<string>>(new Set());
  readonly sending = signal(false);
  readonly message = signal('');
  readonly messageType = signal<'success' | 'error'>('success');

  title = '';
  body = '';
  priority = 'normal';

  constructor() {
    this.refresh();
    timer(3000, 3000).pipe(
      switchMap(() => this.http.get<SentNotification[]>('/api/v1/notifications/sent?limit=100')),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({ next: rows => this.history.set(rows) });
  }

  refresh(): void {
    this.http.get<DeviceRow[]>('/api/v1/devices').subscribe(rows => this.devices.set(rows));
    this.http.get<SentNotification[]>('/api/v1/notifications/sent?limit=100').subscribe(rows => this.history.set(rows));
  }

  isSelected(id: string): boolean { return this.selected().has(id); }
  toggleDevice(id: string): void {
    const next = new Set(this.selected());
    next.has(id) ? next.delete(id) : next.add(id);
    this.selected.set(next);
  }
  allSelected(): boolean { return this.devices().length > 0 && this.devices().every(d => this.selected().has(d.id)); }
  toggleAll(): void { this.selected.set(this.allSelected() ? new Set() : new Set(this.devices().map(d => d.id))); }
  canSend(): boolean { return !!this.title.trim() && !!this.body.trim() && this.selected().size > 0; }

  send(): void {
    if (!this.canSend()) return;
    this.sending.set(true); this.message.set('');
    this.http.post<{count:number}>('/api/v1/notifications/send', {
      title: this.title.trim(), body: this.body.trim(), priority: this.priority, deviceIds: [...this.selected()]
    }).pipe(finalize(() => this.sending.set(false))).subscribe({
      next: response => {
        this.messageType.set('success');
        this.message.set(`Notificación encolada para ${response.count} equipo(s).`);
        this.title = ''; this.body = ''; this.priority = 'normal'; this.selected.set(new Set());
        this.refresh();
      },
      error: err => {
        this.messageType.set('error');
        this.message.set(err?.error?.error === 'desktop_notifications_not_published'
          ? 'El gadget de notificaciones todavía no está publicado.'
          : 'No fue posible enviar la notificación.');
      }
    });
  }

  statusLabel(status: string): string {
    return ({ queued:'En cola', dispatched:'Enviado al Client', downloading_gadget:'Descargando gadget', running:'Mostrando', success:'Entregada', error:'Error', expired:'Expirada', cancelled:'Cancelada' } as Record<string,string>)[status] ?? status;
  }
  shortId(id: string): string { return id?.slice(0, 8) ?? ''; }
}
