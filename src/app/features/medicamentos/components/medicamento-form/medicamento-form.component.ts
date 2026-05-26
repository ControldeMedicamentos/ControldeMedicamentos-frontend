import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medicamento, MedicamentoCreate } from '../../../../models/medicamento.model';

@Component({
  selector: 'app-medicamento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicamento-form.component.html',
  styleUrl: './medicamento-form.component.scss'
})
export class MedicamentoFormComponent implements OnInit {
  @Input() medicamento?: Medicamento;
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<MedicamentoCreate>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    codigoSismed: ['', [Validators.required, Validators.maxLength(20), Validators.pattern(/^[A-Za-z0-9\-_.]+$/)]],
    codigoSiga: ['', Validators.maxLength(30)],
    descripcionSismed: ['', [Validators.required, Validators.maxLength(300)]],
    descripcionCorta: ['', Validators.maxLength(120)],
    presentacionFrasco: ['', Validators.maxLength(80)],
    conversion: [1, [Validators.required, Validators.min(1), Validators.max(9999)]],
    activo: [true]
  });

  get isEditing(): boolean { return !!this.medicamento; }

  ngOnInit(): void {
    if (this.medicamento) {
      this.form.patchValue(this.medicamento);
      this.form.get('codigoSismed')!.disable();
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    this.formSubmit.emit({
      codigoSismed: raw.codigoSismed.toUpperCase().trim(),
      codigoSiga: raw.codigoSiga || undefined,
      descripcionSismed: raw.descripcionSismed.trim(),
      descripcionCorta: raw.descripcionCorta || undefined,
      presentacionFrasco: raw.presentacionFrasco || undefined,
      conversion: raw.conversion,
      activo: raw.activo
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
