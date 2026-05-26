import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { ApiService } from '../../../core/services/api.service';
import { Atencion, AtencionCreate } from '../../../models/atencion.model';

@Injectable({ providedIn: 'root' })
export class AtencionService {
  private readonly api = inject(ApiService);
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

  create(data: AtencionCreate): Observable<Atencion> {
    return this.api.post<Atencion, AtencionCreate>(this.base, data);
  }
}
