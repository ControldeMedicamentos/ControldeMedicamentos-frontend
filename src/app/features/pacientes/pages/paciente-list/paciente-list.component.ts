import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';
import { Paciente, PacienteCreate, TipoDocumento } from '../../../../models/paciente.model';
import { PacienteCardComponent } from '../../components/paciente-card/paciente-card.component';
import { PacienteFormComponent } from '../../components/paciente-form/paciente-form.component';
import { PacienteService } from '../../services/paciente.service';

@Component({
  selector: 'app-paciente-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AlertMessageComponent,
    ModalConfirmationComponent,
    PacienteCardComponent,
    PacienteFormComponent
  ],
  templateUrl: './paciente-list.component.html',
  styleUrl: './paciente-list.component.scss'
})
export class PacienteListComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly router = inject(Router);

  pacientes: Paciente[] = [];
  filtrados: Paciente[] = [];
  busqueda = '';
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  modalAbierto = false;
  pacienteSeleccionado?: Paciente;

  viewMode: 'grid' | 'list' = 'grid';
  page = 1;
  pageSize = 12;
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'activos';

  get modalTitulo(): string {
    return this.pacienteSeleccionado ? 'Editar paciente' : 'Nuevo paciente';
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtrados.length / this.pageSize));
  }

  get paginados(): Paciente[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filtrados.slice(start, start + this.pageSize);
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
    this.pacienteService.getAll()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => { this.pacientes = data; this.filtrar(); },
        error: () => (this.errorMessage = 'No se pudieron cargar los pacientes.')
      });
  }

  filtrar(): void {
    const termino = this.busqueda.toLowerCase().trim();
    let resultado = termino
      ? this.pacientes.filter(p =>
          p.nroDocumento.toLowerCase().includes(termino) ||
          p.nombresApellidos.toLowerCase().includes(termino))
      : [...this.pacientes];

    if (this.filtroEstado === 'activos') {
      resultado = resultado.filter(p => p.activo !== false);
    } else if (this.filtroEstado === 'inactivos') {
      resultado = resultado.filter(p => p.activo === false);
    }

    this.filtrados = resultado;
    this.page = 1;
  }

  toggleActivo(paciente: Paciente): void {
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
    this.viewMode = mode;
    this.pageSize = mode === 'grid' ? 12 : 10;
    this.page = 1;
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.page = p;
  }

  tipoDocLabel(tipo: TipoDocumento): string {
    const labels: Record<string, string> = {
      DNI: 'DNI', CARNET_EXTRANJERIA: 'C.E.', PASAPORTE: 'Pasaporte'
    };
    return labels[tipo] ?? tipo;
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
