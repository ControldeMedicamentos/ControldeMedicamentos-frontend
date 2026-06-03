import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Rol, RolVistaPermiso } from '../../../../models/role.model';
import { RoleService } from '../../services/role.service';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';

type Seccion = 'sistema' | 'empresa';

@Component({
  selector: 'app-roles-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertMessageComponent, ModalConfirmationComponent],
  templateUrl: './roles-page.component.html'
})
export class RolesPageComponent implements OnInit {
  private readonly roleService = inject(RoleService);

  seccion: Seccion = 'empresa';
  rolesSistema: Rol[] = [];
  rolesEmpresa: Rol[] = [];
  rolSeleccionado: Rol | null = null;
  permisos: RolVistaPermiso[] = [];
  busqueda = '';

  isLoadingRoles = false;
  isLoadingPermisos = false;
  isSaving = false;
  permisosModificados = false;

  successMessage = '';
  errorMessage = '';

  showCreateModal = false;
  newRoleName = '';
  newRoleDesc = '';

  showConfirmEliminar = false;
  rolAEliminar: Rol | null = null;

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
      next: (data) => (this.rolesSistema = data)
    });
    this.roleService.getEmpresaRoles().subscribe({
      next: (data) => { this.rolesEmpresa = data; this.isLoadingRoles = false; },
      error: () => (this.isLoadingRoles = false)
    });
  }

  get rolesActivos(): Rol[] {
    return this.seccion === 'sistema' ? this.rolesSistema : this.rolesEmpresa;
  }

  get rolesFiltrados(): Rol[] {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return this.rolesActivos;
    return this.rolesActivos.filter(r =>
      this.roleLabel(r.name).toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      (r.descripcion ?? '').toLowerCase().includes(q)
    );
  }

  setSeccion(s: Seccion): void {
    this.seccion = s;
    this.busqueda = '';
    this.rolSeleccionado = null;
    this.permisos = [];
    this.permisosModificados = false;
    this.clearMessages();
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
    if (!this.rolSeleccionado) return;
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

  abrirCrearModal(): void {
    this.newRoleName = '';
    this.newRoleDesc = '';
    this.showCreateModal = true;
    this.clearMessages();
  }

  crearRol(): void {
    if (!this.newRoleName.trim()) return;
    this.showCreateModal = false;
    this.roleService.create(this.newRoleName.trim(), this.newRoleDesc.trim() || undefined).subscribe({
      next: (rol) => {
        this.rolesEmpresa = [...this.rolesEmpresa, rol];
        this.selectRol(rol);
        this.successMessage = `Rol "${this.roleLabel(rol.name)}" creado.`;
      },
      error: (err) => (this.errorMessage = err?.error?.message ?? 'Error al crear el rol.')
    });
  }

  confirmarEliminar(rol: Rol): void {
    this.rolAEliminar = rol;
    this.showConfirmEliminar = true;
  }

  eliminarRol(): void {
    if (!this.rolAEliminar) return;
    this.showConfirmEliminar = false;
    this.roleService.delete(this.rolAEliminar.id).subscribe({
      next: () => {
        this.rolesEmpresa = this.rolesEmpresa.filter(r => r.id !== this.rolAEliminar!.id);
        if (this.rolSeleccionado?.id === this.rolAEliminar!.id) {
          this.rolSeleccionado = null;
          this.permisos = [];
        }
        this.successMessage = `Rol eliminado.`;
        this.rolAEliminar = null;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Error al eliminar el rol.';
        this.rolAEliminar = null;
      }
    });
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
