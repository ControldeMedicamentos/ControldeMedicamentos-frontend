export type Sexo = 'MUJER' | 'HOMBRE' | 'OTRO';

export interface Paciente {
  id: number;
  dni: string;
  nombresApellidos: string;
  edad?: number;
  sexo: Sexo;
  carreraArea?: string;
  cicloAcademico?: string;
  telefono?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PacienteCreate {
  dni: string;
  nombresApellidos: string;
  edad?: number;
  sexo: Sexo;
  carreraArea?: string;
  cicloAcademico?: string;
  telefono?: string;
}
