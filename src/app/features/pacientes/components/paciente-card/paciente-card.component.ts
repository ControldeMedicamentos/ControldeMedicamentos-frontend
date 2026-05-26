import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Paciente } from '../../../../models/paciente.model';

@Component({
  selector: 'app-paciente-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './paciente-card.component.html',
  styleUrl: './paciente-card.component.scss'
})
export class PacienteCardComponent {
  @Input({ required: true }) paciente!: Paciente;
  @Output() verDetalle = new EventEmitter<number>();
  @Output() editar = new EventEmitter<Paciente>();

  get tipoDocLabel(): string {
    const labels: Record<string, string> = {
      DNI: 'DNI', CARNET_EXTRANJERIA: 'C.E.', PASAPORTE: 'Pasaporte'
    };
    return labels[this.paciente.tipoDocumento] ?? this.paciente.tipoDocumento;
  }
}
