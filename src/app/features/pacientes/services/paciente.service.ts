import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { ApiService } from '../../../core/services/api.service';
import { Paciente, PacienteCreate } from '../../../models/paciente.model';

@Injectable({ providedIn: 'root' })
export class PacienteService {
  private readonly api = inject(ApiService);
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
}
