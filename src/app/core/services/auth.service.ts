import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

export interface CompanySummary {
  id: string;
  name: string;
  slug: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresAtUtc: string;
  user: AuthUser;
  company: CompanySummary;
  roles: string[];
  permissions: string[];
}

interface StoredSession extends AuthResponse {}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly storageKey = 'integry_session';
  private readonly _session = signal<StoredSession | null>(this.loadSession());

  readonly session = this._session.asReadonly();
  readonly user = computed(() => this._session()?.user ?? null);
  readonly company = computed(() => this._session()?.company ?? null);
  readonly roles = computed(() => this._session()?.roles ?? []);
  readonly permissions = computed(() => this._session()?.permissions ?? []);
  readonly primaryRole = computed(() => this.roles()[0] ?? 'user');

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/login', { email, password, companyId: null }).pipe(
      tap(response => this.persist(response))
    );
  }

  switchCompany(companyId: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>('/api/v1/auth/switch-company', { companyId }).pipe(
      tap(response => this.persist(response))
    );
  }

  logout(): void {
    this._session.set(null);
    sessionStorage.removeItem(this.storageKey);
    this.router.navigate(['/login']);
  }

  token(): string | null {
    const session = this._session();
    if (!session) return null;
    if (new Date(session.expiresAtUtc).getTime() <= Date.now()) {
      this.logout();
      return null;
    }
    return session.accessToken;
  }

  isLoggedIn(): boolean { return !!this.token(); }
  hasPermission(permission: string): boolean { return this.permissions().includes(permission); }
  hasAnyPermission(...permissions: string[]): boolean { return permissions.some(p => this.hasPermission(p)); }

  private persist(response: AuthResponse): void {
    this._session.set(response);
    sessionStorage.setItem(this.storageKey, JSON.stringify(response));
  }

  private loadSession(): StoredSession | null {
    const raw = sessionStorage.getItem(this.storageKey);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StoredSession;
      if (!parsed.accessToken || new Date(parsed.expiresAtUtc).getTime() <= Date.now()) {
        sessionStorage.removeItem(this.storageKey);
        return null;
      }
      return parsed;
    } catch {
      sessionStorage.removeItem(this.storageKey);
      return null;
    }
  }
}
