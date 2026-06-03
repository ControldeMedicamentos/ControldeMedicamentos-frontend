import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { ApiService } from '../../../core/services/api.service';
import { Medicamento, MedicamentoCreate } from '../../../models/medicamento.model';
import { PageResponse } from '../../../models/page-response.model';

@Injectable({ providedIn: 'root' })
export class MedicamentoService {
  private readonly api = inject(ApiService);
  private readonly base = API_ENDPOINTS.medicamentos;

  getAll(): Observable<Medicamento[]> {
    return this.api.get<Medicamento[]>(this.base);
  }

  getPage(page: number, size: number, search: string, estado: string): Observable<PageResponse<Medicamento>> {
    return this.api.get<PageResponse<Medicamento>>(`${this.base}/page`, { page, size, search, estado });
  }

  getById(id: number): Observable<Medicamento> {
    return this.api.get<Medicamento>(`${this.base}/${id}`);
  }

  create(data: MedicamentoCreate): Observable<Medicamento> {
    return this.api.post<Medicamento, MedicamentoCreate>(this.base, data);
  }

  update(id: number, data: MedicamentoCreate): Observable<Medicamento> {
    return this.api.put<Medicamento, MedicamentoCreate>(`${this.base}/${id}`, data);
  }

  toggleActivo(id: number): Observable<Medicamento> {
    return this.api.patch<Medicamento>(`${this.base}/${id}/status`);
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}`);
  }
}
