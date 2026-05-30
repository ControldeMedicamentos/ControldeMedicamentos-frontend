import { RolUsuario } from './auth.model';

export interface Empleado {
  id: number;
  username: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  createdAt?: string;
}

export interface EmpleadoCreate {
  nombre: string;
  email: string;
  dni: string;
  rol: RolUsuario;
}

export interface EmpleadoUpdate {
  nombre: string;
  email: string;
  rol: RolUsuario;
}
