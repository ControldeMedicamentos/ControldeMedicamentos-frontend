export type TipoDocumento = 'DNI' | 'CARNET_EXTRANJERIA' | 'PASAPORTE';
export type Sexo = 'MUJER' | 'HOMBRE' | 'OTRO';

export interface Paciente {
  id: number;
  tipoDocumento: TipoDocumento;
  nroDocumento: string;
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
  tipoDocumento: TipoDocumento;
  nroDocumento: string;
  nombresApellidos: string;
  edad?: number;
  sexo: Sexo;
  carreraArea?: string;
  cicloAcademico?: string;
  telefono?: string;
}
