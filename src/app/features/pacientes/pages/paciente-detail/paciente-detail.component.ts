import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';
import { Paciente, PacienteCreate } from '../../../../models/paciente.model';
import { PacienteFormComponent } from '../../components/paciente-form/paciente-form.component';
import { PacienteService } from '../../services/paciente.service';

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [
    CommonModule,
    AlertMessageComponent,
    ModalConfirmationComponent,
    PacienteFormComponent
  ],
  templateUrl: './paciente-detail.component.html',
  styleUrl: './paciente-detail.component.scss'
})
export class PacienteDetailComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  paciente?: Paciente;
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  modalAbierto = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPaciente(id);
  }

  cargarPaciente(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.pacienteService.getById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => (this.paciente = data),
        error: () => (this.errorMessage = 'No se encontró el paciente.')
      });
  }

  guardar(data: PacienteCreate): void {
    if (!this.paciente) return;
    this.isSaving = true;
    this.pacienteService.update(this.paciente.id, data)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (updated) => {
          this.paciente = updated;
          this.modalAbierto = false;
        },
        error: () => (this.errorMessage = 'Error al actualizar el paciente.')
      });
  }

  volver(): void {
    this.router.navigate(['/pacientes']);
  }
}
