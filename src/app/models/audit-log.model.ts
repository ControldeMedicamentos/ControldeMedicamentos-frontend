export interface AuditLog {
  id: number;
  timestamp: string;
  userEmail: string;
  userRol: string;
  accion: string;
  modulo: string;
  detalle: string;
  ipAddress: string | null;
  requestMethod: string | null;
  requestPath: string | null;
  resultado: 'EXITOSO' | 'FALLIDO' | 'DENEGADO';
  entidadTipo: string | null;
  entidadId: string | null;
  userAgent: string | null;
}

export interface AuditLogPage {
  content: AuditLog[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
