import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface NavItem { label: string; icon: string; route: string; permission?: string; }

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  auth = inject(AuthService);
  user = this.auth.user;
  company = this.auth.company;
  primaryRole = this.auth.primaryRole;

  private readonly allNavItems: NavItem[] = [
    { label: 'Panel Principal', icon: 'home', route: '/dashboard/panel' },
    { label: 'Screen Recorder', icon: 'record', route: '/dashboard/screen-recorder', permission: 'tools.execute' },
    { label: 'Clic Automator', icon: 'click', route: '/dashboard/clic-automator', permission: 'tools.execute' },
    { label: 'Ejecución Scripts', icon: 'terminal', route: '/dashboard/scripts', permission: 'tools.execute' },
    { label: 'Conexión SFTP', icon: 'sftp', route: '/dashboard/sftp', permission: 'tools.execute' },
    { label: 'Repositorios', icon: 'git', route: '/dashboard/repositorios', permission: 'tools.execute' },
    { label: 'Herramientas', icon: 'tools', route: '/dashboard/herramientas', permission: 'tools.read' },
    { label: 'Notificaciones', icon: 'bell', route: '/dashboard/notificaciones', permission: 'notifications.send' },
    { label: 'Historial', icon: 'history', route: '/dashboard/historial', permission: 'audit.read' },
    { label: 'Roles y Permisos', icon: 'roles', route: '/dashboard/roles', permission: 'roles.manage' },
  ];

  readonly navItems = computed(() => this.allNavItems.filter(item => !item.permission || this.auth.hasPermission(item.permission)));

  logout(): void { this.auth.logout(); }
}
