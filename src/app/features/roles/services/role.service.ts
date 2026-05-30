import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';
import { Rol, RolVistaPermiso } from '../../../models/role.model';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private readonly api = inject(ApiService);
  private readonly base = '/admin/roles';

  getSystemRoles(): Observable<Rol[]> {
    return this.api.get<Rol[]>(`${this.base}/system`);
  }

  getEmpresaRoles(): Observable<Rol[]> {
    return this.api.get<Rol[]>(`${this.base}/empresa`);
  }

  create(name: string, descripcion?: string): Observable<Rol> {
    return this.api.post<Rol, { name: string; descripcion?: string }>(this.base, { name, descripcion });
  }

  update(id: number, name: string, descripcion?: string): Observable<Rol> {
    return this.api.put<Rol, { name: string; descripcion?: string }>(`${this.base}/${id}`, { name, descripcion });
  }

  delete(id: number): Observable<void> {
    return this.api.delete<void>(`${this.base}/${id}`);
  }

  getVistas(roleId: number): Observable<RolVistaPermiso[]> {
    return this.api.get<RolVistaPermiso[]>(`${this.base}/${roleId}/vistas`);
  }

  saveVistas(roleId: number, permisos: RolVistaPermiso[]): Observable<RolVistaPermiso[]> {
    return this.api.put<RolVistaPermiso[], RolVistaPermiso[]>(`${this.base}/${roleId}/vistas`, permisos);
  }
}
