import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { ApiService } from '../../../core/services/api.service';
import { Atencion, AtencionArchivo, AtencionCreate } from '../../../models/atencion.model';
import { PageResponse } from '../../../models/page-response.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AtencionService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly base = API_ENDPOINTS.atenciones;

  getAll(): Observable<Atencion[]> {
    return this.api.get<Atencion[]>(this.base);
  }

  getById(id: number): Observable<Atencion> {
    return this.api.get<Atencion>(`${this.base}/${id}`);
  }

  getByPaciente(pacienteId: number): Observable<Atencion[]> {
    return this.api.get<Atencion[]>(`${this.base}/patient/${pacienteId}`);
  }

  getByFecha(desde: string, hasta: string): Observable<Atencion[]> {
    return this.api.get<Atencion[]>(`${this.base}/search?desde=${desde}&hasta=${hasta}`);
  }

  getPage(desde: string, hasta: string, page: number, size: number, search: string): Observable<PageResponse<Atencion>> {
    return this.api.get<PageResponse<Atencion>>(`${this.base}/page`, { desde, hasta, page, size, search });
  }

  create(data: AtencionCreate): Observable<Atencion> {
    return this.api.post<Atencion, AtencionCreate>(this.base, data);
  }

  uploadArchivo(atencionId: number, file: File): Observable<AtencionArchivo> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<AtencionArchivo>(
      `${environment.apiUrl}${this.base}/${atencionId}/files`,
      formData
    );
  }

  getArchivos(atencionId: number): Observable<AtencionArchivo[]> {
    return this.api.get<AtencionArchivo[]>(`${this.base}/${atencionId}/files`);
  }
}
