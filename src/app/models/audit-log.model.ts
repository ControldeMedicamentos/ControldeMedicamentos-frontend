export interface AuditLog {
  id: number;
  timestamp: string;
  userEmail: string;
  userRol: string;
  accion: string;
  modulo: string;
  detalle: string;
}

export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
