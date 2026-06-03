import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Paciente } from '../../../../models/paciente.model';

@Component({
  selector: 'app-paciente-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente-card.component.html'
})
export class PacienteCardComponent {
  @Input({ required: true }) paciente!: Paciente;
  @Output() verDetalle = new EventEmitter<number>();
  @Output() editar = new EventEmitter<Paciente>();
  @Output() toggleActivo = new EventEmitter<Paciente>();

  get tipoDocLabel(): string {
    const labels: Record<string, string> = {
      DNI: 'DNI', CARNET_EXTRANJERIA: 'C.E.', PASAPORTE: 'Pasaporte'
    };
    return labels[this.paciente.tipoDocumento] ?? this.paciente.tipoDocumento;
  }

  get tipoPacienteLabel(): string {
    const labels: Record<string, string> = {
      ESTUDIANTE: 'Estudiante', DOCENTE: 'Docente',
      ADMINISTRATIVO: 'Administrativo', INVITADO: 'Invitado'
    };
    return labels[this.paciente.tipoPaciente] ?? '';
  }

  get tipoPacienteClass(): string {
    const classes: Record<string, string> = {
      ESTUDIANTE: 'bg-blue-100 text-blue-800',
      DOCENTE: 'bg-violet-100 text-violet-700',
      ADMINISTRATIVO: 'bg-emerald-100 text-emerald-800',
      INVITADO: 'bg-orange-50 text-orange-700'
    };
    return classes[this.paciente.tipoPaciente] ?? 'bg-slate-100 text-slate-500';
  }
}
