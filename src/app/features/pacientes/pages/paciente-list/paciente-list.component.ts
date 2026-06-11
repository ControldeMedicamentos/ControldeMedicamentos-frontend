import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';
import { Paciente, PacienteCreate, TipoDocumento } from '../../../../models/paciente.model';
import { PacienteFormComponent } from '../../components/paciente-form/paciente-form.component';
import { PacienteService } from '../../services/paciente.service';
import { PacienteUiStateService } from '../../services/paciente-ui-state.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AlertMessageComponent,
    ModalConfirmationComponent,
    PacienteFormComponent
  ],
  templateUrl: './paciente-list.component.html'
})
export class PacienteListComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly uiState = inject(PacienteUiStateService);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  pacientes: Paciente[] = [];
  filtrados: Paciente[] = [];
  totalElements = 0;
  totalPages = 1;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  modalAbierto = false;
  pacienteSeleccionado?: Paciente;
  showConfirmToggle = false;
  pacienteParaToggle?: Paciente;

  get viewMode(): 'grid' | 'list' { return this.uiState.viewMode; }
  get filtroEstado(): 'todos' | 'activos' | 'inactivos' { return this.uiState.filtroEstado; }
  set filtroEstado(v: 'todos' | 'activos' | 'inactivos') { this.uiState.filtroEstado = v; }
  get busqueda(): string { return this.uiState.busqueda; }
  set busqueda(v: string) { this.uiState.busqueda = v; }
  get page(): number { return this.uiState.page; }
  set page(v: number) { this.uiState.page = v; }

  pageSize = 10;

  get modalTitulo(): string {
    return this.pacienteSeleccionado ? 'Editar paciente' : 'Nuevo paciente';
  }

  get paginados(): Paciente[] {
    return this.filtrados;
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.page;
    const range = 2;
    const pages: number[] = [];
    for (let i = Math.max(1, current - range); i <= Math.min(total, current + range); i++) {
      pages.push(i);
    }
    return pages;
  }

  ngOnInit(): void {
    this.cargarPacientes();
  }

  cargarPacientes(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.pacienteService.getPage(this.page - 1, this.pageSize, this.busqueda, this.filtroEstado)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.pacientes = data.content;
          this.filtrados = data.content;
          this.totalElements = data.totalElements;
          this.totalPages = Math.max(1, data.totalPages);
        },
        error: () => (this.errorMessage = 'No se pudieron cargar los pacientes.')
      });
  }

  filtrar(): void {
    this.page = 1;
    this.cargarPacientes();
  }

  toggleActivo(paciente: Paciente): void {
    if (paciente.activo) {
      this.pacienteParaToggle = paciente;
      this.showConfirmToggle = true;
    } else {
      this.ejecutarToggle(paciente);
    }
  }

  confirmarDesactivar(): void {
    if (!this.pacienteParaToggle) return;
    this.ejecutarToggle(this.pacienteParaToggle);
    this.showConfirmToggle = false;
    this.pacienteParaToggle = undefined;
  }

  private ejecutarToggle(paciente: Paciente): void {
    this.pacienteService.toggleActivo(paciente.id).subscribe({
      next: (updated) => {
        const idx = this.pacientes.findIndex(p => p.id === paciente.id);
        if (idx !== -1) this.pacientes[idx] = updated;
        this.filtrar();
      },
      error: () => (this.errorMessage = 'Error al cambiar el estado del paciente.')
    });
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.uiState.viewMode = mode;
    this.pageSize = 10;
    this.page = 1;
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.cargarPacientes();
  }

  tipoDocLabel(tipo: TipoDocumento): string {
    const labels: Record<string, string> = {
      DNI: 'DNI', CARNET_EXTRANJERIA: 'C.E.', PASAPORTE: 'Pasaporte'
    };
    return labels[tipo] ?? tipo;
  }

  tipoPacienteLabel(tipo: string): string {
    const labels: Record<string, string> = {
      ESTUDIANTE: 'Estudiante', DOCENTE: 'Docente',
      ADMINISTRATIVO: 'Administrativo', INVITADO: 'Invitado'
    };
    return labels[tipo] ?? tipo;
  }

  tipoPacienteClass(tipo: string): string {
    const classes: Record<string, string> = {
      ESTUDIANTE: 'bg-blue-100 text-blue-800',
      DOCENTE: 'bg-violet-100 text-violet-700',
      ADMINISTRATIVO: 'bg-emerald-100 text-emerald-800',
      INVITADO: 'bg-orange-50 text-orange-700'
    };
    return classes[tipo] ?? 'bg-slate-100 text-slate-500';
  }

  abrirModalNuevo(): void {
    this.pacienteSeleccionado = undefined;
    this.modalAbierto = true;
  }

  abrirModalEditar(paciente: Paciente): void {
    this.pacienteSeleccionado = paciente;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.pacienteSeleccionado = undefined;
  }

  guardar(data: PacienteCreate): void {
    this.isSaving = true;
    const operacion = this.pacienteSeleccionado
      ? this.pacienteService.update(this.pacienteSeleccionado.id, data)
      : this.pacienteService.create(data);

    operacion.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => { this.cerrarModal(); this.cargarPacientes(); },
      error: () => (this.errorMessage = 'Error al guardar el paciente.')
    });
  }

  verDetalle(id: number): void {
    this.router.navigate(['/pacientes', id]);
  }
}
