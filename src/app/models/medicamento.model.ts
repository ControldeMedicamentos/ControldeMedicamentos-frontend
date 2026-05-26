export interface Medicamento {
  id: number;
  codigoSismed: string;
  codigoSiga?: string;
  descripcionSismed: string;
  presentacionFrasco?: string;
  descripcionCorta?: string;
  conversion: number;
  activo: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicamentoCreate {
  codigoSismed: string;
  codigoSiga?: string;
  descripcionSismed: string;
  presentacionFrasco?: string;
  descripcionCorta?: string;
  conversion?: number;
  activo?: boolean;
}
