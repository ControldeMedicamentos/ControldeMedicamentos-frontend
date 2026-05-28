import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { ApiService } from '../../../core/services/api.service';
import { Paciente, PacienteArchivo, PacienteCreate } from '../../../models/paciente.model';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly base = API_ENDPOINTS.pacientes;

  getAll(): Observable<Paciente[]> {
    return this.api.get<Paciente[]>(this.base);
  }

  getById(id: number): Observable<Paciente> {
    return this.api.get<Paciente>(`${this.base}/${id}`);
  }

  getByNroDocumento(nroDocumento: string): Observable<Paciente> {
    return this.api.get<Paciente>(`${this.base}/document/${nroDocumento}`);
  }

  create(data: PacienteCreate): Observable<Paciente> {
    return this.api.post<Paciente, PacienteCreate>(this.base, data);
  }

  update(id: number, data: PacienteCreate): Observable<Paciente> {
    return this.api.put<Paciente, PacienteCreate>(`${this.base}/${id}`, data);
  }

  toggleActivo(id: number): Observable<Paciente> {
    return this.api.patch<Paciente>(`${this.base}/${id}/status`);
  }

  getArchivos(pacienteId: number): Observable<PacienteArchivo[]> {
    return this.api.get<PacienteArchivo[]>(`${this.base}/${pacienteId}/files`);
  }

  uploadArchivo(pacienteId: number, file: File): Observable<PacienteArchivo> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PacienteArchivo>(
      `${environment.apiUrl}${this.base}/${pacienteId}/files`,
      formData
    );
  }
}
