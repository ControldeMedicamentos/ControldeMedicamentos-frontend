export interface Inventario {
  id: number;
  medicamentoId: number;
  nombreMedicamento: string;
  stockActual: number;
  stockMinimo: number;
  lote?: string;
  fechaIngreso?: string;
  fechaVencimiento?: string;
  updatedAt?: string;
}

export type TipoMovimiento = 'INGRESO' | 'REINGRESO' | 'CONSUMO' | 'DEVOLUCION' | 'VENCIDO' | 'MERMA' | 'DISTRIBUCION' | 'TRANSFERENCIA' | 'SALDO_INICIAL';
export type TipoAjuste = 'DEVOLUCION' | 'VENCIDO' | 'MERMA' | 'REINGRESO';

export interface MovimientoInventario {
  id: number;
  medicamentoId: number;
  nombreMedicamento: string;
  atencionId?: number;
  tipoMovimiento: TipoMovimiento;
  cantidad: number;
  periodo?: string;
  observacion?: string;
  usuarioRegistro: string;
  createdAt?: string;
}

export interface AjusteInventario {
  inventarioId: number;
  tipoAjuste: TipoAjuste;
  cantidad: number;
  observacion?: string;
}

export interface InventarioCreate {
  medicamentoId: number;
  stockActual: number;
  lote?: string;
  fechaIngreso?: string;
  fechaVencimiento?: string;
}
