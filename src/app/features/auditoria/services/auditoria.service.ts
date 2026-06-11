import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { AuditLogPage } from '../../../models/audit-log.model';

@Injectable({ providedIn: 'root' })
export class AuditoriaService {
  private readonly api = inject(ApiService);
  private readonly base = '/admin/audit-logs';

  getLogs(params: {
    accion?: string; modulo?: string; email?: string;
    desde?: string; hasta?: string; page?: number; size?: number;
  }): Observable<AuditLogPage> {
    const query: Record<string, string | number | boolean> = { page: params.page ?? 0, size: params.size ?? 20 };
    if (params.accion) query['accion'] = params.accion;
    if (params.modulo) query['modulo'] = params.modulo;
    if (params.email) query['email'] = params.email;
    if (params.desde) query['desde'] = params.desde;
    if (params.hasta) query['hasta'] = params.hasta;
    return this.api.get<AuditLogPage>(this.base, query);
  }
}
