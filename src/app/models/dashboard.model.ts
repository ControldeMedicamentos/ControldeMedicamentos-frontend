import { Inventario } from './inventario.model';

export interface AtencionResumen {
  id: number;
  pacienteNombre: string;
  pacienteNroDocumento: string;
  fechaEvaluacion: string;
  motivo: string;
  cantidadConsumos: number;
}

export interface AtencionesPorDia {
  fecha: string;
  cantidad: number;
}

export interface TopConsumo {
  nombre: string;
  total: number;
}

export interface DashboardStats {
  totalPacientesActivos: number;
  atencionesMes: number;
  medicamentosConBajoStock: number;
  inventariosAlertaVencimiento: number;
  totalMedicamentosActivos: number;
  atencioneRecientes: AtencionResumen[];
  stockAlertas: Inventario[];
  atencionesPorDia: AtencionesPorDia[];
  topConsumos: TopConsumo[];
}
