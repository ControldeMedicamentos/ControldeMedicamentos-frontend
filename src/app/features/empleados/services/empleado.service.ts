import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Empleado, EmpleadoCreate, EmpleadoUpdate } from '../../../models/empleado.model';

@Injectable({ providedIn: 'root' })
export class EmpleadoService {
  private readonly api = inject(ApiService);
  private readonly base = '/admin/empleados';

  getAll(): Observable<Empleado[]> {
    return this.api.get<Empleado[]>(this.base);
  }

  create(data: EmpleadoCreate): Observable<Empleado> {
    return this.api.post<Empleado, EmpleadoCreate>(this.base, data);
  }

  update(id: number, data: EmpleadoUpdate): Observable<Empleado> {
    return this.api.put<Empleado, EmpleadoUpdate>(`${this.base}/${id}`, data);
  }

  toggleEstado(id: number): Observable<Empleado> {
    return this.api.patch<Empleado>(`${this.base}/${id}/estado`);
  }
}
