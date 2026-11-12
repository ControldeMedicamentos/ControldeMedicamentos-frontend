import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rol, RolVistaPermiso } from '../../../../models/role.model';
import { RoleService } from '../../services/role.service';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertMessageComponent],
  templateUrl: './roles-page.component.html'
})
export class RolesPageComponent implements OnInit {
  private readonly roleService = inject(RoleService);

  rolesSistema: Rol[] = [];
  rolSeleccionado: Rol | null = null;
  permisos: RolVistaPermiso[] = [];
  busqueda = '';

  isLoadingRoles = false;
  isLoadingPermisos = false;
  isSaving = false;
  permisosModificados = false;

  successMessage = '';
  errorMessage = '';

  readonly CAMPOS: { key: keyof RolVistaPermiso; label: string }[] = [
    { key: 'leer',     label: 'VER' },
    { key: 'escribir', label: 'CREAR' },
    { key: 'modificar',label: 'EDITAR' },
    { key: 'eliminar', label: 'ELIMINAR' }
  ];

  ngOnInit(): void {
    this.cargarRoles();
  }

  cargarRoles(): void {
    this.isLoadingRoles = true;
    this.roleService.getSystemRoles().subscribe({
      next: (data) => {
        this.rolesSistema = data;
        this.isLoadingRoles = false;
        if (data.length > 0) this.selectRol(data[0]);
      },
      error: () => (this.isLoadingRoles = false)
    });
  }

  get rolesFiltrados(): Rol[] {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return this.rolesSistema;
    return this.rolesSistema.filter(r =>
      this.roleLabel(r.name).toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      (r.descripcion ?? '').toLowerCase().includes(q)
    );
  }

  get isAdminSelected(): boolean {
    return this.rolSeleccionado?.name === 'ROLE_ADMIN';
  }

  selectRol(rol: Rol): void {
    this.rolSeleccionado = rol;
    this.permisosModificados = false;
    this.clearMessages();
    this.cargarPermisos(rol.id);
  }

  cargarPermisos(roleId: number): void {
    this.isLoadingPermisos = true;
    this.roleService.getVistas(roleId).subscribe({
      next: (data) => { this.permisos = data; this.isLoadingPermisos = false; },
      error: () => (this.isLoadingPermisos = false)
    });
  }

  get grupos(): string[] {
    return [...new Set(this.permisos.map(p => p.grupo))];
  }

  vistasPorGrupo(grupo: string): RolVistaPermiso[] {
    return this.permisos.filter(p => p.grupo === grupo);
  }

  togglePermiso(vista: RolVistaPermiso, campo: keyof RolVistaPermiso): void {
    if (this.isAdminSelected) return;
    const idx = this.permisos.findIndex(p => p.vistaId === vista.vistaId);
    if (idx === -1) return;
    (this.permisos[idx] as any)[campo] = !(this.permisos[idx] as any)[campo];
    if (campo === 'leer' && !(this.permisos[idx] as any)['leer']) {
      this.permisos[idx].escribir = false;
      this.permisos[idx].modificar = false;
      this.permisos[idx].eliminar = false;
    }
    this.permisosModificados = true;
  }

  guardarPermisos(): void {
    if (!this.rolSeleccionado || this.isAdminSelected) return;
    this.isSaving = true;
    this.clearMessages();
    this.roleService.saveVistas(this.rolSeleccionado.id, this.permisos).subscribe({
      next: (data) => {
        this.permisos = data;
        this.permisosModificados = false;
        this.isSaving = false;
        this.successMessage = 'Permisos guardados correctamente.';
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Error al guardar permisos.';
        this.isSaving = false;
      }
    });
  }

  descartarPermisos(): void {
    if (this.rolSeleccionado) this.cargarPermisos(this.rolSeleccionado.id);
    this.permisosModificados = false;
  }

  roleLabel(name: string): string {
    return name.startsWith('ROLE_')
      ? name.substring(5).replace(/_/g, ' ')
      : name;
  }

  getPermiso(vista: RolVistaPermiso, campo: string): boolean {
    return (vista as any)[campo] ?? false;
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}
