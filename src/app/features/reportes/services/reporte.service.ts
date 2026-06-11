import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { ApiService } from '../../../core/services/api.service';
import { ReporteSISMED } from '../../../models/reporte.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ReporteService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);

  getReporte(periodo: string): Observable<ReporteSISMED[]> {
    return this.api.get<ReporteSISMED[]>(`${API_ENDPOINTS.reportes}/sismed/${periodo}`);
  }

  getEstadoPeriodo(periodo: string): Observable<{ cerrado: boolean }> {
    return this.api.get<{ cerrado: boolean }>(`${API_ENDPOINTS.reportes}/sismed/${periodo}/cerrado`);
  }

  exportarExcel(periodo: string): Observable<Blob> {
    return this.http.get(`${environment.apiUrl}/reports/sismed/export`, {
      params: { period: periodo },
      responseType: 'blob'
    });
  }

  cerrarMes(periodo: string): Observable<{ periodo: string; medicamentosProcesados: number; mensaje: string }> {
    return this.api.post(`${API_ENDPOINTS.reportes}/sismed/${periodo}/cerrar`, {});
  }
}
