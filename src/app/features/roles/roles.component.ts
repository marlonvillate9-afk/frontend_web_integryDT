import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

interface MemberRow {
  id: string;
  email: string;
  displayName: string;
  status: string;
  roles: string | null;
}

interface RoleRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissions: string | null;
}

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <span class="breadcrumb">Administración</span>
        <h1>Gestión de Roles y Permisos</h1>
      </div>

      @if (error()) { <div class="alert-error">{{ error() }}</div> }

      <div class="grid">
        <div class="card">
          <h2 class="card-title">Roles del Tenant</h2>
          <div class="roles-list">
            @for (role of roles(); track role.id) {
              <div class="role-item">
                <div><strong>{{ role.name }}</strong><span class="badge badge-tool">{{ role.code }}</span></div>
                <p>{{ role.description || 'Sin descripción' }}</p>
                <small>{{ role.permissions || 'Sin permisos asignados' }}</small>
              </div>
            }
          </div>
        </div>

        <div class="card">
          <h2 class="card-title">Usuarios del Sistema</h2>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Usuario</th><th>Email</th><th>Rol</th><th>Estado</th></tr></thead>
              <tbody>
                @for (u of users(); track u.id) {
                  <tr>
                    <td><strong>{{ u.displayName }}</strong></td>
                    <td>{{ u.email }}</td>
                    <td><span class="badge badge-tool">{{ u.roles || 'Sin rol' }}</span></td>
                    <td><span class="badge" [class]="u.status === 'active' ? 'badge-on' : 'badge-off'">{{ u.status }}</span></td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { padding: 36px 40px; display: flex; flex-direction: column; gap: 24px; height: 100%; }
    .page-header { .breadcrumb { font-size: 13px; color: var(--muted); display: block; margin-bottom: 4px; } h1 { font-size: 24px; font-weight: 600; } }
    .grid { display: grid; grid-template-columns: 360px 1fr; gap: 20px; flex: 1; overflow: hidden; }
    .card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 22px; display: flex; flex-direction: column; overflow: hidden; }
    .card-title { font-size: 15px; font-weight: 600; padding-bottom: 14px; margin-bottom: 16px; border-bottom: 1px solid var(--border); }
    .roles-list { overflow-y:auto; display:flex; flex-direction:column; gap:12px; }
    .role-item { border:1px solid var(--border); border-radius:10px; padding:14px; }
    .role-item div { display:flex; align-items:center; justify-content:space-between; gap:8px; }
    .role-item p { color:var(--muted); margin:8px 0; font-size:13px; }
    .role-item small { color:var(--muted); line-height:1.5; }
    .table-wrap { overflow-y: auto; flex: 1; }
    table { width: 100%; border-collapse: collapse; font-size: 13.5px; }
    thead th { text-align: left; padding: 10px 14px; color: var(--muted); font-weight: 600; font-size: 11.5px; text-transform: uppercase; letter-spacing: .6px; border-bottom: 1px solid var(--border); }
    tbody tr { border-bottom: 1px solid var(--border); }
    tbody td { padding: 12px 14px; vertical-align: middle; }
    .alert-error { padding:10px 12px; border-radius:8px; background:var(--red-dim); color:var(--red); }
  `]
})
export class RolesComponent {
  private readonly http = inject(HttpClient);
  users = signal<MemberRow[]>([]);
  roles = signal<RoleRow[]>([]);
  error = signal('');

  constructor() {
    this.http.get<MemberRow[]>('/api/v1/admin/members').subscribe({
      next: rows => this.users.set(rows),
      error: () => this.error.set('No fue posible cargar los usuarios del tenant.')
    });
    this.http.get<RoleRow[]>('/api/v1/admin/roles').subscribe({
      next: rows => this.roles.set(rows),
      error: () => this.error.set('No fue posible cargar los roles y permisos.')
    });
  }
}
