import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { AuthResponse, AuthUser, LoginRequest } from '../../models/auth.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'control_medicamentos_token';
  private readonly permisosSubject = new BehaviorSubject<string[]>([]);
  readonly permisos$ = this.permisosSubject.asObservable();

  private readonly protectedPaths = [
    '/medicamentos/ajustes',
    '/dashboard',
    '/pacientes',
    '/atenciones',
    '/medicamentos',
    '/reportes',
    '/empleados',
    '/roles',
    '/auditoria'
  ];

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {
    const user = this.getCurrentUser();
    if (user) this.permisosSubject.next(user.permisos);
  }

  refreshPermisos(): void {
    if (!this.isAuthenticated()) return;
    const user = this.getCurrentUser();
    if (!user || user.rol === 'ADMIN') return;
    this.api.get<{ permisos: string[] }>('/auth/me').subscribe({
      next: (res) => this.permisosSubject.next(res.permisos),
      error: () => {}
    });
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse, LoginRequest>('/auth/login', request).pipe(
      tap((response) => {
        localStorage.setItem(this.tokenKey, response.token);
        const user = this.decodeToken(response.token);
        if (user) this.permisosSubject.next(user.permisos);
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    this.permisosSubject.next([]);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    const user = this.getCurrentUser();
    if (!user?.exp) {
      return false;
    }
    return user.exp * 1000 > Date.now();
  }

  getCurrentUser(): AuthUser | null {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    return this.decodeToken(token);
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.rol === 'ADMIN';
  }

  canReadPath(path: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.rol === 'ADMIN' || user.permisos.includes('*')) return true;
    const cleanPath = path.split('?')[0].split('#')[0];
    const matched = this.protectedPaths.find(p => cleanPath === p || cleanPath.startsWith(p + '/'));
    if (!matched) return true;
    return this.permisosSubject.value.includes(matched);
  }

  canWrite(path: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.rol === 'ADMIN' || this.permisosSubject.value.includes('*')) return true;
    return this.permisosSubject.value.includes(path + ':w');
  }

  canEdit(path: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.rol === 'ADMIN' || this.permisosSubject.value.includes('*')) return true;
    return this.permisosSubject.value.includes(path + ':e');
  }

  canDelete(path: string): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.rol === 'ADMIN' || this.permisosSubject.value.includes('*')) return true;
    return this.permisosSubject.value.includes(path + ':d');
  }

  firstAccessiblePath(): string {
    const user = this.getCurrentUser();
    if (!user || user.rol === 'ADMIN' || user.permisos.includes('*')) return '/dashboard';
    return this.protectedPaths.find(path => user.permisos.includes(path)) ?? '/cambiar-contrasena';
  }

  decodeToken(token: string): AuthUser | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload)) as Record<string, unknown>;
      return {
        username: String(decoded['sub']),
        rol: decoded['rol'] as AuthUser['rol'],
        permisos: Array.isArray(decoded['permisos']) ? decoded['permisos'].map(String) : [],
        nombre: decoded['nombre'] ? String(decoded['nombre']) : undefined,
        exp: Number(decoded['exp']),
        mustChangePassword: decoded['mustChangePassword'] === true
      };
    } catch {
      return null;
    }
  }
}
