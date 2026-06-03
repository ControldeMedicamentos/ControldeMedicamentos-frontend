import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RolUsuario } from '../../../../models/auth.model';
import { Empleado, EmpleadoCreate, EmpleadoUpdate } from '../../../../models/empleado.model';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';
import { EmpleadoService } from '../../services/empleado.service';

@Component({
  selector: 'app-empleados-page',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertMessageComponent, ModalConfirmationComponent],
  templateUrl: './empleados-page.component.html'
})
export class EmpleadosPageComponent implements OnInit {
  private readonly empleadoService = inject(EmpleadoService);
  readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  empleados: Empleado[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';
  busqueda = '';
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'activos';
  page = 1;
  totalElements = 0;
  totalPages = 1;
  readonly pageSize = 10;

  showModal = false;
  modoEdicion = false;
  empleadoEditId: number | null = null;

  form: EmpleadoCreate = { nombre: '', email: '', dni: '', rol: 'MEDICO' };
  formEdit: EmpleadoUpdate = { nombre: '', email: '', dni: '', rol: 'MEDICO' };

  showConfirmToggle = false;
  empleadoToggle: Empleado | null = null;
  isSaving = false;

  readonly roles: { value: RolUsuario; label: string }[] = [
    { value: 'ADMIN',    label: 'Administrador' },
    { value: 'MEDICO',   label: 'Médico' },
    { value: 'ENFERMERA',label: 'Enfermera' }
  ];

  ngOnInit(): void { this.cargar(); }

  get filtrados(): Empleado[] {
    return this.empleados;
  }

  get paginados(): Empleado[] {
    return this.empleados;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  onFiltroChange(): void {
    this.page = 1;
    this.cargar();
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.cargar();
  }

  cargar(): void {
    this.isLoading = true;
    this.empleadoService.getPage(this.page - 1, this.pageSize, this.busqueda, this.filtroEstado).subscribe({
      next: (data) => {
        this.empleados = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = Math.max(1, data.totalPages);
        this.isLoading = false;
      },
      error: () => (this.isLoading = false)
    });
  }

  abrirCrear(): void {
    this.modoEdicion = false;
    this.form = { nombre: '', email: '', dni: '', rol: 'MEDICO' };
    this.showModal = true;
    this.clearMessages();
  }

  get empleadoCreateValido(): boolean {
    return this.form.nombre.trim().length >= 3
      && this.emailPattern.test(this.form.email.trim())
      && /^\d{8}$/.test(this.form.dni)
      && !!this.form.rol;
  }

  get empleadoEditValido(): boolean {
    return this.formEdit.nombre.trim().length >= 3
      && this.emailPattern.test(this.formEdit.email.trim())
      && /^\d{8}$/.test(this.formEdit.dni)
      && !!this.formEdit.rol;
  }

  get empleadoEditDniInvalido(): boolean {
    return !!this.formEdit.dni && !/^\d{8}$/.test(this.formEdit.dni);
  }

  onEditDniInput(): void {
    this.formEdit.dni = this.formEdit.dni.replace(/\D/g, '').slice(0, 8);
  }

  get empleadoDniInvalido(): boolean {
    return !!this.form.dni && !/^\d{8}$/.test(this.form.dni);
  }

  onEmpleadoDniInput(): void {
    this.form.dni = this.form.dni.replace(/\D/g, '').slice(0, 8);
  }

  abrirEditar(emp: Empleado): void {
    this.modoEdicion = true;
    this.empleadoEditId = emp.id;
    this.formEdit = { nombre: emp.nombre, email: emp.email, dni: emp.dni ?? '', rol: emp.rol };
    this.showModal = true;
    this.clearMessages();
  }

  guardar(): void {
    if (!this.modoEdicion && !this.empleadoCreateValido) {
      this.errorMessage = 'Completa nombre, email válido, DNI de 8 dígitos y rol.';
      return;
    }
    if (this.modoEdicion && !this.empleadoEditValido) {
      this.errorMessage = 'Completa nombre, email válido y rol.';
      return;
    }
    this.isSaving = true;
    this.clearMessages();
    if (!this.modoEdicion) {
      const payload: EmpleadoCreate = {
        nombre: this.form.nombre.trim(),
        email: this.form.email.trim().toLowerCase(),
        dni: this.form.dni,
        rol: this.form.rol
      };
      this.empleadoService.create(payload).subscribe({
        next: (emp) => {
          this.showModal = false;
          this.successMessage = `Empleado "${emp.nombre}" creado.`;
          this.isSaving = false;
          this.cargar();
        },
        error: (err) => { this.errorMessage = err?.error?.message ?? 'Error al crear empleado.'; this.isSaving = false; }
      });
    } else {
      const payload: EmpleadoUpdate = {
        nombre: this.formEdit.nombre.trim(),
        email: this.formEdit.email.trim().toLowerCase(),
        dni: this.formEdit.dni,
        rol: this.formEdit.rol
      };
      this.empleadoService.update(this.empleadoEditId!, payload).subscribe({
        next: (emp) => {
          this.showModal = false;
          this.successMessage = `Empleado "${emp.nombre}" actualizado.`;
          this.isSaving = false;
          this.cargar();
        },
        error: (err) => { this.errorMessage = err?.error?.message ?? 'Error al actualizar.'; this.isSaving = false; }
      });
    }
  }

  confirmarToggle(emp: Empleado): void {
    this.empleadoToggle = emp;
    this.showConfirmToggle = true;
  }

  ejecutarToggle(): void {
    if (!this.empleadoToggle) return;
    this.showConfirmToggle = false;
    this.empleadoService.toggleEstado(this.empleadoToggle.id).subscribe({
      next: (emp) => {
        this.successMessage = `${emp.nombre} ${emp.activo ? 'activado' : 'desactivado'}.`;
        this.empleadoToggle = null;
        this.cargar();
      },
      error: (err) => { this.errorMessage = err?.error?.message ?? 'Error al cambiar estado.'; }
    });
  }

  rolLabel(rol: RolUsuario): string {
    const map: Record<RolUsuario, string> = { ADMIN: 'Administrador', MEDICO: 'Médico', ENFERMERA: 'Enfermera' };
    return map[rol] ?? rol;
  }

  rolClass(rol: RolUsuario): string {
    const map: Record<RolUsuario, string> = {
      ADMIN: 'bg-violet-100 text-violet-700',
      MEDICO: 'bg-blue-100 text-blue-700',
      ENFERMERA: 'bg-emerald-100 text-emerald-800'
    };
    return map[rol] ?? 'bg-slate-100 text-slate-500';
  }

  private clearMessages(): void { this.successMessage = ''; this.errorMessage = ''; }
}
