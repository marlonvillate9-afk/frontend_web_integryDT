import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { switchMap, takeWhile, timer } from 'rxjs';

interface DeviceRow {
  id: string; name: string; status: string; os: string; architecture: string; agentVersion: string; lastSeenAt: string | null;
}
interface CatalogTool {
  toolCode: string; toolName: string; gadgetCode: string; gadgetName: string; riskLevel: string; version: string; status: string;
}
interface JobStatus {
  id: string; action: string; status: string; deviceName: string; toolCode: string; gadgetCode: string; version: string;
  resultJson?: string | null; stderr?: string | null;
}
interface JobEvent { type: string; message: string; createdAt: string; }

@Component({
  selector: 'app-herramientas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './herramientas.component.html',
  styles: [`
    .page { padding:36px 40px; display:flex; flex-direction:column; gap:24px; }
    .page-header .breadcrumb { font-size:13px; color:var(--muted); display:block; margin-bottom:4px; }
    .page-header h1 { font-size:24px; font-weight:600; }
    .card { background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:22px; }
    .card-title { font-size:15px; font-weight:600; padding-bottom:14px; margin-bottom:16px; border-bottom:1px solid var(--border); }
    .controls { display:grid; grid-template-columns:1fr 1fr auto auto; gap:10px; align-items:end; }
    .field label { display:block; font-size:12px; color:var(--muted); margin-bottom:6px; }
    .select { width:100%; background:var(--bg-input); border:1px solid var(--border); border-radius:8px; padding:10px 12px; color:var(--text); }
    .status { padding:5px 9px; border-radius:999px; background:var(--bg-active); font-size:12px; }
    .online { color:#22c55e; }.offline { color:var(--muted); }
    .catalog { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
    .tool { border:1px solid var(--border); border-radius:10px; padding:14px; cursor:pointer; background:var(--bg-active); }
    .tool.selected { border-color:var(--cyan); }.tool h3 { font-size:14px; margin:0 0 6px; }.tool p { color:var(--muted); font-size:12px; margin:0; }
    .badges { display:flex; gap:6px; margin-top:10px; }.badge { font-size:11px; padding:3px 7px; border-radius:999px; background:rgba(56,189,248,.12); color:var(--cyan); }
    .job { margin-top:18px; display:grid; grid-template-columns:1fr 1fr; gap:14px; }
    .result, .timeline { background:var(--bg-active); border:1px solid var(--border); border-radius:9px; padding:14px; }
    pre { white-space:pre-wrap; overflow-wrap:anywhere; font-size:12px; }
    .event { padding:7px 0; border-bottom:1px solid var(--border); font-size:12px; }.event:last-child{border:0}.event strong{color:var(--cyan)}
    .empty { color:var(--muted); padding:18px 0; }
    @media(max-width:1000px){.controls{grid-template-columns:1fr}.catalog{grid-template-columns:1fr}.job{grid-template-columns:1fr}}
  `]
})
export class HerramientasComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly devices = signal<DeviceRow[]>([]);
  readonly catalog = signal<CatalogTool[]>([]);
  readonly currentJob = signal<JobStatus | null>(null);
  readonly events = signal<JobEvent[]>([]);
  readonly running = signal(false);
  selectedDeviceId = '';
  selectedToolCode = '';

  readonly selectedDevice = computed(() => this.devices().find(x => x.id === this.selectedDeviceId) ?? null);
  readonly selectedTool = computed(() => this.catalog().find(x => x.toolCode === this.selectedToolCode) ?? null);

  ngOnInit(): void { this.refresh(); }

  refresh(): void {
    this.http.get<DeviceRow[]>('/api/v1/devices').subscribe(rows => {
      this.devices.set(rows);
      if (!this.selectedDeviceId && rows.length) this.selectedDeviceId = rows[0].id;
    });
    this.http.get<CatalogTool[]>('/api/v1/catalog/tools').subscribe(rows => {
      this.catalog.set(rows);
      if (!this.selectedToolCode && rows.length) this.selectedToolCode = rows[0].toolCode;
    });
  }

  selectTool(toolCode: string): void { this.selectedToolCode = toolCode; }

  execute(): void {
    const tool = this.selectedTool();
    if (!this.selectedDeviceId || !tool) return;
    this.running.set(true); this.currentJob.set(null); this.events.set([]);
    const body = { deviceId: this.selectedDeviceId, toolCode: tool.toolCode, action: tool.toolCode, parameters: {} };
    this.http.post<{id:string,status:string}>('/api/v1/jobs', body).subscribe({
      next: created => {
        timer(0, 800).pipe(
          switchMap(() => this.http.get<JobStatus>(`/api/v1/jobs/${created.id}`)),
          takeWhile(job => !['success','error','cancelled','expired'].includes(job.status), true)
        ).subscribe({
          next: job => {
            this.currentJob.set(job);
            this.http.get<JobEvent[]>(`/api/v1/jobs/${created.id}/events`).subscribe(e => this.events.set(e));
            if (['success','error','cancelled','expired'].includes(job.status)) this.running.set(false);
          }, error: () => this.running.set(false)
        });
      }, error: () => this.running.set(false)
    });
  }

  formattedResult(): string {
    const raw = this.currentJob()?.resultJson;
    if (!raw) return this.currentJob()?.stderr || '';
    try { return JSON.stringify(JSON.parse(raw), null, 2); } catch { return raw; }
  }
}
