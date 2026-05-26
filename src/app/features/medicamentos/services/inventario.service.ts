import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../constants/api-endpoints';
import { ApiService } from '../../../core/services/api.service';
import { Inventario, InventarioCreate } from '../../../models/inventario.model';

@Injectable({ providedIn: 'root' })
export class InventarioService {
  private readonly api = inject(ApiService);
  private readonly base = API_ENDPOINTS.inventario;

  getAll(): Observable<Inventario[]> {
    return this.api.get<Inventario[]>(this.base);
  }

  getByMedicamento(medicamentoId: number): Observable<Inventario[]> {
    return this.api.get<Inventario[]>(`${this.base}/medicine/${medicamentoId}`);
  }

  getLowStock(): Observable<Inventario[]> {
    return this.api.get<Inventario[]>(`${this.base}/low-stock`);
  }

  create(data: InventarioCreate): Observable<Inventario> {
    return this.api.post<Inventario, InventarioCreate>(this.base, data);
  }

  update(id: number, data: InventarioCreate): Observable<Inventario> {
    return this.api.put<Inventario, InventarioCreate>(`${this.base}/${id}`, data);
  }
}
