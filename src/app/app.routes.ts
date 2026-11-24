import { Routes } from '@angular/router';
import { LoginComponent } from './features/login/login.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'panel', pathMatch: 'full' },
      { path: 'panel', loadComponent: () => import('./features/panel/panel.component').then(m => m.PanelComponent) },
      { path: 'screen-recorder', canActivate: [permissionGuard('tools.execute')], loadComponent: () => import('./features/screen-recorder/screen-recorder.component').then(m => m.ScreenRecorderComponent) },
      { path: 'clic-automator', canActivate: [permissionGuard('tools.execute')], loadComponent: () => import('./features/clic-automator/clic-automator.component').then(m => m.ClicAutomatorComponent) },
      { path: 'scripts', canActivate: [permissionGuard('tools.execute')], loadComponent: () => import('./features/scripts/scripts.component').then(m => m.ScriptsComponent) },
      { path: 'sftp', canActivate: [permissionGuard('tools.execute')], loadComponent: () => import('./features/sftp/sftp.component').then(m => m.SftpComponent) },
      { path: 'repositorios', canActivate: [permissionGuard('tools.execute')], loadComponent: () => import('./features/repositorios/repositorios.component').then(m => m.RepositoriosComponent) },
      { path: 'herramientas', canActivate: [permissionGuard('tools.read')], loadComponent: () => import('./features/herramientas/herramientas.component').then(m => m.HerramientasComponent) },
      { path: 'notificaciones', canActivate: [permissionGuard('notifications.send')], loadComponent: () => import('./features/notificaciones/notificaciones.component').then(m => m.NotificacionesComponent) },
      { path: 'historial', canActivate: [permissionGuard('audit.read')], loadComponent: () => import('./features/historial/historial.component').then(m => m.HistorialComponent) },
      { path: 'roles', canActivate: [permissionGuard('roles.manage')], loadComponent: () => import('./features/roles/roles.component').then(m => m.RolesComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
