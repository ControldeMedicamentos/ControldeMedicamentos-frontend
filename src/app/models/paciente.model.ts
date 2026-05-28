export type TipoDocumento = 'DNI' | 'CARNET_EXTRANJERIA' | 'PASAPORTE';
export type Sexo = 'MUJER' | 'HOMBRE' | 'OTRO';
export type TipoPaciente = 'ESTUDIANTE' | 'DOCENTE' | 'ADMINISTRATIVO' | 'INVITADO';

export interface Paciente {
  id: number;
  tipoPaciente: TipoPaciente;
  tipoDocumento: TipoDocumento;
  nroDocumento: string;
  nombresApellidos: string;
  fechaNacimiento?: string;
  sexo: Sexo;
  carreraArea?: string;
  cicloAcademico?: string;
  telefono?: string;
  activo?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PacienteCreate {
  tipoPaciente: TipoPaciente;
  tipoDocumento: TipoDocumento;
  nroDocumento: string;
  nombresApellidos: string;
  fechaNacimiento?: string;
  sexo: Sexo;
  carreraArea?: string;
  cicloAcademico?: string;
  telefono?: string;
}
