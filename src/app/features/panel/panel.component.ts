import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface ModuleCard {
  title: string; code: string; desc: string; route: string; icon: string; color: string; permission?: string;
}

@Component({
  selector: 'app-panel',
  standalone: true,
  imports: [],
  templateUrl: './panel.component.html',
  styleUrls: ['./panel.component.scss']
})
export class PanelComponent {
  auth = inject(AuthService);
  router = inject(Router);
  user = this.auth.user;
  company = this.auth.company;

  private readonly allModules: ModuleCard[] = [
    { title: 'Screen Recorder', code: 'P03', desc: 'Graba la pantalla en tiempo real con alta calidad.', route: '/dashboard/screen-recorder', icon: 'record', color: 'cyan', permission: 'tools.execute' },
    { title: 'Clic Automator', code: 'P04', desc: 'Automatiza secuencias de clics y entradas de teclado.', route: '/dashboard/clic-automator', icon: 'click', color: 'cyan', permission: 'tools.execute' },
    { title: 'Ejecución de Scripts', code: 'P05', desc: 'Ejecuta scripts en Python, Bash o PowerShell.', route: '/dashboard/scripts', icon: 'terminal', color: 'cyan', permission: 'tools.execute' },
    { title: 'Conexión SFTP', code: 'P06', desc: 'Transfiere archivos de forma segura por protocolo SFTP.', route: '/dashboard/sftp', icon: 'sftp', color: 'cyan', permission: 'tools.execute' },
    { title: 'Gestión Repositorios', code: 'P11', desc: 'Administra repositorios Git y SVN del proyecto.', route: '/dashboard/repositorios', icon: 'git', color: 'cyan', permission: 'tools.execute' },
    { title: 'Añadir Herramienta', code: 'P10', desc: 'Registra y gestiona nuevas herramientas en el sistema.', route: '/dashboard/herramientas', icon: 'tools', color: 'cyan', permission: 'tools.read' },
    { title: 'Notificaciones', code: 'P07', desc: 'Recibe y gestiona notificaciones internas del sistema.', route: '/dashboard/notificaciones', icon: 'bell', color: 'purple', permission: 'notifications.send' },
    { title: 'Historial de Acciones', code: 'P08', desc: 'Consulta el registro de todas las acciones realizadas.', route: '/dashboard/historial', icon: 'history', color: 'purple', permission: 'audit.read' },
    { title: 'Roles y Permisos', code: 'P09', desc: 'Administra usuarios, roles y permisos del sistema.', route: '/dashboard/roles', icon: 'roles', color: 'green', permission: 'roles.manage' },
  ];

  readonly modules = computed(() => this.allModules.filter(m => !m.permission || this.auth.hasPermission(m.permission)));
  navigate(route: string): void { this.router.navigate([route]); }
}
