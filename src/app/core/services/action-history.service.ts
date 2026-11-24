import { Injectable, signal } from '@angular/core';

export interface ActionRecord {
  id: number;
  module: string;
  action: string;
  user: string;
  timestamp: Date;
  status: 'success' | 'error' | 'warning';
}

@Injectable({ providedIn: 'root' })
export class ActionHistoryService {
  private _records = signal<ActionRecord[]>([
    { id: 1, module: 'SFTP',          action: 'Conexión establecida a 192.168.1.10', user: 'admin',     timestamp: new Date('2026-11-09T08:00:00'), status: 'success' },
    { id: 2, module: 'Screen Recorder',action: 'Grabación iniciada (1920x1080)',     user: 'developer', timestamp: new Date('2026-11-09T08:15:00'), status: 'success' },
    { id: 3, module: 'Scripts',        action: 'Script "deploy.sh" ejecutado',        user: 'developer', timestamp: new Date('2026-11-09T08:30:00'), status: 'error'   },
    { id: 4, module: 'Clic Automator', action: 'Secuencia de 5 clics registrada',     user: 'admin',     timestamp: new Date('2026-11-09T09:00:00'), status: 'success' },
    { id: 5, module: 'Repositorios',   action: 'Repo "integry-backend" agregado',     user: 'admin',     timestamp: new Date('2026-11-09T09:10:00'), status: 'success' },
  ]);
  readonly records = this._records.asReadonly();
  private nextId = 6;

  add(module: string, action: string, user: string, status: ActionRecord['status'] = 'success'): void {
    this._records.update(list => [
      { id: this.nextId++, module, action, user, timestamp: new Date(), status },
      ...list
    ]);
  }
}
