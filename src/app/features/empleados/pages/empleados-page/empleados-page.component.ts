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
  templateUrl: './empleados-page.component.html',
  styleUrl: './empleados-page.component.scss'
})
export class EmpleadosPageComponent implements OnInit {
  private readonly empleadoService = inject(EmpleadoService);

  empleados: Empleado[] = [];
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  showModal = false;
  modoEdicion = false;
  empleadoEditId: number | null = null;

  form: EmpleadoCreate = { nombre: '', email: '', dni: '', rol: 'MEDICO' };
  formEdit: EmpleadoUpdate = { nombre: '', email: '', rol: 'MEDICO' };

  showConfirmToggle = false;
  empleadoToggle: Empleado | null = null;
  isSaving = false;

  readonly roles: { value: RolUsuario; label: string }[] = [
    { value: 'ADMIN',    label: 'Administrador' },
    { value: 'MEDICO',   label: 'Médico' },
    { value: 'ENFERMERA',label: 'Enfermera' }
  ];

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.isLoading = true;
    this.empleadoService.getAll().subscribe({
      next: (data) => { this.empleados = data; this.isLoading = false; },
      error: () => (this.isLoading = false)
    });
  }

  abrirCrear(): void {
    this.modoEdicion = false;
    this.form = { nombre: '', email: '', dni: '', rol: 'MEDICO' };
    this.showModal = true;
    this.clearMessages();
  }

  abrirEditar(emp: Empleado): void {
    this.modoEdicion = true;
    this.empleadoEditId = emp.id;
    this.formEdit = { nombre: emp.nombre, email: emp.email, rol: emp.rol };
    this.showModal = true;
    this.clearMessages();
  }

  guardar(): void {
    this.isSaving = true;
    this.clearMessages();
    if (!this.modoEdicion) {
      this.empleadoService.create(this.form).subscribe({
        next: (emp) => {
          this.empleados = [...this.empleados, emp].sort((a, b) => a.nombre.localeCompare(b.nombre));
          this.showModal = false;
          this.successMessage = `Empleado "${emp.nombre}" creado.`;
          this.isSaving = false;
        },
        error: (err) => { this.errorMessage = err?.error?.message ?? 'Error al crear empleado.'; this.isSaving = false; }
      });
    } else {
      this.empleadoService.update(this.empleadoEditId!, this.formEdit).subscribe({
        next: (emp) => {
          this.empleados = this.empleados.map(e => e.id === emp.id ? emp : e);
          this.showModal = false;
          this.successMessage = `Empleado "${emp.nombre}" actualizado.`;
          this.isSaving = false;
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
        this.empleados = this.empleados.map(e => e.id === emp.id ? emp : e);
        this.successMessage = `${emp.nombre} ${emp.activo ? 'activado' : 'desactivado'}.`;
        this.empleadoToggle = null;
      },
      error: (err) => { this.errorMessage = err?.error?.message ?? 'Error al cambiar estado.'; }
    });
  }

  rolLabel(rol: RolUsuario): string {
    const map: Record<RolUsuario, string> = { ADMIN: 'Administrador', MEDICO: 'Médico', ENFERMERA: 'Enfermera' };
    return map[rol] ?? rol;
  }

  private clearMessages(): void { this.successMessage = ''; this.errorMessage = ''; }
}
