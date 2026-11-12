export interface ReporteSISMED {
  periodo: string;
  codigoSismed: string;
  descripcionSismed: string;
  precioUnitario: number;
  saldoInicial: number;
  ingresos: number;
  reingresos: number;
  venta: number;
  sis: number;
  intersanidad: number;
  factoresPerdida: number;
  defuncionNacimiento: number;
  exonerado: number;
  soat: number;
  creditoHospitalario: number;
  otroConvenio: number;
  consumos: number;
  devoluciones: number;
  vencidos: number;
  merma: number;
  distribucion: number;
  transferencia: number;
  stockFinal: number;
}

export interface ConciliacionDetalle {
  codigoSismed: string;
  descripcionSismed: string;
  stockSistema: number;
  stockFisico: number;
  diferencia: number;
}

export interface ConciliacionMensual {
  id: number;
  periodo: string;
  resultado: 'CUADRADO' | 'CON_DIFERENCIAS';
  observacion?: string;
  usuarioRegistro: string;
  updatedAt: string;
  detalles: ConciliacionDetalle[];
}

export interface ConciliacionRequest {
  conteos: Array<{ codigoSismed: string; stockFisico: number }>;
  observacion?: string;
}
