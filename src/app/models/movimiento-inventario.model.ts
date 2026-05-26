import { TipoConsumo } from './atencion.model';

export type TipoMovimientoInventario =
  | 'SALDO_INICIAL'
  | 'INGRESO'
  | 'REINGRESO'
  | 'CONSUMO'
  | 'DEVOLUCION'
  | 'VENCIDO'
  | 'MERMA'
  | 'DISTRIBUCION'
  | 'TRANSFERENCIA'
  | 'AJUSTE';

export interface MovimientoInventario {
  id: number;
  medicamentoId: number;
  codigoSismed: string;
  descripcionSismed: string;
  atencionId?: number;
  tipoMovimiento: TipoMovimientoInventario;
  tipoConsumo?: TipoConsumo;
  cantidad: number;
  periodo: string;
  observacion?: string;
  usuarioRegistro: string;
  createdAt?: string;
}
