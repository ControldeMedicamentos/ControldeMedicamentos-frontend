export type TipoConsumo =
  | 'VENTA'
  | 'SIS'
  | 'INTERSANIDAD'
  | 'FACTORES_PERDIDA'
  | 'DEFUNCION_NACIMIENTO'
  | 'EXONERADO'
  | 'SOAT'
  | 'CREDITO_HOSPITALARIO'
  | 'OTRO_CONVENIO';

export type TipoDiagnostico = 'PRESUNTIVO' | 'DEFINITIVO' | 'REITERATIVO';

export interface ConsumoMedicamento {
  id: number;
  medicamentoId: number;
  codigoSismed: string;
  descripcionSismed: string;
  cantidadConsumida: number;
  tipoConsumo: TipoConsumo;
  movimientoInventarioId?: number;
  createdAt?: string;
}

export interface ConsumoMedicamentoCreate {
  medicamentoId: number;
  cantidadConsumida: number;
  tipoConsumo: TipoConsumo;
}

export interface Atencion {
  id: number;
  pacienteId: number;
  pacienteNroDocumento: string;
  pacienteNombre: string;
  fechaEvaluacion: string;
  motivo: string;
  antecedentes?: string;
  inmunizaciones?: string;
  signosVitales?: string;
  examenFisico?: string;
  laboratorio?: string;
  diagnostico1?: string;
  cie101?: string;
  tipoDiagnostico1?: TipoDiagnostico;
  diagnostico2?: string;
  cie102?: string;
  tipoDiagnostico2?: TipoDiagnostico;
  diagnostico3?: string;
  cie103?: string;
  tipoDiagnostico3?: TipoDiagnostico;
  conclusion?: string;
  derivacion?: string;
  observaciones?: string;
  usuarioRegistro: string;
  consumos: ConsumoMedicamento[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AtencionArchivo {
  id: number;
  atencionId: number;
  nombreOriginal: string;
  tipoContenido?: string;
  tamanio?: number;
  createdAt?: string;
}

export interface AtencionCreate {
  pacienteId: number;
  fechaEvaluacion: string;
  motivo: string;
  antecedentes?: string;
  inmunizaciones?: string;
  signosVitales?: string;
  examenFisico?: string;
  laboratorio?: string;
  diagnostico1?: string;
  cie101?: string;
  tipoDiagnostico1?: TipoDiagnostico;
  diagnostico2?: string;
  cie102?: string;
  tipoDiagnostico2?: TipoDiagnostico;
  diagnostico3?: string;
  cie103?: string;
  tipoDiagnostico3?: TipoDiagnostico;
  conclusion?: string;
  derivacion?: string;
  observaciones?: string;
  consumos?: ConsumoMedicamentoCreate[];
}

export interface AtencionUpdate {
  updatedAt: string;
  motivo: string;
  antecedentes: string | null;
  inmunizaciones: string | null;
  signosVitales: string | null;
  examenFisico: string | null;
  laboratorio: string | null;
  diagnostico1: string | null;
  cie101: string | null;
  tipoDiagnostico1: TipoDiagnostico | null;
  diagnostico2: string | null;
  cie102: string | null;
  tipoDiagnostico2: TipoDiagnostico | null;
  diagnostico3: string | null;
  cie103: string | null;
  tipoDiagnostico3: TipoDiagnostico | null;
  conclusion: string | null;
  derivacion: string | null;
  observaciones: string | null;
}
