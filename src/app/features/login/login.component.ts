import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  auth = inject(AuthService);
  router = inject(Router);

  email = 'demo@integrydt.local';
  password = 'Demo1234!';
  error = signal('');
  loading = signal(false);

  submit(): void {
    if (!this.email.trim() || !this.password) return;
    this.error.set('');
    this.loading.set(true);
    this.auth.login(this.email.trim(), this.password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: err => this.error.set(err.status === 401
          ? 'Usa las credenciales demo mostradas en pantalla.'
          : 'No fue posible iniciar el modo demo.')
      });
  }
}
