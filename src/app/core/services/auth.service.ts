import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { AuthResponse, AuthUser, LoginRequest } from '../../models/auth.model';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'control_medicamentos_token';

  constructor(
    private readonly api: ApiService,
    private readonly router: Router
  ) {}

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.api.post<AuthResponse, LoginRequest>('/auth/login', request).pipe(
      tap((response) => localStorage.setItem(this.tokenKey, response.token))
    );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
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

  private decodeToken(token: string): AuthUser | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload)) as Record<string, string | number>;
      return {
        username: String(decoded['sub']),
        rol: decoded['rol'] as AuthUser['rol'],
        nombre: decoded['nombre'] ? String(decoded['nombre']) : undefined,
        exp: Number(decoded['exp'])
      };
    } catch {
      return null;
    }
  }
}
