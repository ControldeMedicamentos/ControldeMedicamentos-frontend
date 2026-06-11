import { RolUsuario } from '../models/auth.model';

export const ROLES: Record<RolUsuario, string> = {
  ADMIN: 'Administrador',
  ENFERMERA: 'Enfermera',
  MEDICO: 'Medico'
};
