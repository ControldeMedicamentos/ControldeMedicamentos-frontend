export type RolUsuario = 'ADMIN' | 'ENFERMERA' | 'MEDICO';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  username: string;
  rol: RolUsuario;
  permisos: string[];
}

export interface AuthUser {
  username: string;
  rol: RolUsuario;
  permisos: string[];
  nombre?: string;
  exp?: number;
  mustChangePassword?: boolean;
}
