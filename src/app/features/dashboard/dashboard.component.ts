import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/sidebar/sidebar.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
  template: `
    <div class="layout">
      <app-sidebar />
      <main class="main-area">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    .layout { display: flex; height: 100vh; overflow: hidden; }
    .main-area { flex: 1; overflow-y: auto; background: var(--bg-main); }
  `]
})
export class DashboardComponent {}
