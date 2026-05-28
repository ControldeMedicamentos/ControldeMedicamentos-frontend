export type TipoProducto = 'MARCA' | 'GENERICO';

export interface Medicamento {
  id: number;
  nombre: string;
  registroSanitario?: string;
  tipoProducto?: TipoProducto;
  presentacion?: string;
  fabricante?: string;
  paisFabricacion?: string;
  precioUnitario?: number;
  stockMinimo?: number;
  codigoSismed?: string;
  descripcionSismed?: string;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicamentoCreate {
  nombre: string;
  registroSanitario?: string;
  tipoProducto?: TipoProducto;
  presentacion?: string;
  fabricante?: string;
  paisFabricacion?: string;
  precioUnitario?: number;
  stockMinimo?: number;
  activo?: boolean;
}
