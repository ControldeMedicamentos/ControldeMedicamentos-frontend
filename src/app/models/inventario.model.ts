export interface Inventario {
  id: number;
  medicamentoId: number;
  codigoSismed: string;
  descripcionSismed: string;
  stockActual: number;
  stockMinimo: number;
  lote?: string;
  fechaVencimiento?: string;
  updatedAt?: string;
}

export interface InventarioCreate {
  medicamentoId: number;
  stockActual: number;
  stockMinimo: number;
  lote?: string;
  fechaVencimiento?: string;
}
