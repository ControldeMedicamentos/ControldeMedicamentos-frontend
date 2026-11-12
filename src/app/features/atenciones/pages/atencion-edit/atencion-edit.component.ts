import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Atencion, AtencionUpdate, TipoDiagnostico } from '../../../../models/atencion.model';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { AtencionService } from '../../services/atencion.service';

@Component({
  selector: 'app-atencion-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, AlertMessageComponent],
  templateUrl: './atencion-edit.component.html'
})
export class AtencionEditComponent implements OnInit {
  private readonly atencionService = inject(AtencionService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  atencion?: Atencion;
  isLoading = true;
  isSaving = false;
  errorMessage = '';

  readonly tipoDxOptions: { value: TipoDiagnostico; label: string }[] = [
    { value: 'PRESUNTIVO', label: 'Presuntivo' },
    { value: 'DEFINITIVO', label: 'Definitivo' },
    { value: 'REITERATIVO', label: 'Reiterativo' }
  ];

  readonly form = this.fb.nonNullable.group({
    motivo: ['', [Validators.required, Validators.maxLength(300)]],
    antecedentes: [''],
    inmunizaciones: [''],
    signosVitales: [''],
    examenFisico: [''],
    laboratorio: [''],
    diagnostico1: ['', Validators.maxLength(150)],
    cie101: ['', Validators.maxLength(15)],
    tipoDiagnostico1: [''],
    diagnostico2: ['', Validators.maxLength(150)],
    cie102: ['', Validators.maxLength(15)],
    tipoDiagnostico2: [''],
    diagnostico3: ['', Validators.maxLength(150)],
    cie103: ['', Validators.maxLength(15)],
    tipoDiagnostico3: [''],
    conclusion: ['', Validators.maxLength(80)],
    derivacion: ['', Validators.maxLength(120)],
    observaciones: ['']
  });

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!Number.isInteger(id) || id < 1) {
      this.errorMessage = 'La atención solicitada no es válida.';
      this.isLoading = false;
      return;
    }

    this.atencionService.getById(id).subscribe({
      next: (atencion) => {
        if (!atencion.updatedAt) {
          this.errorMessage = 'No se pudo obtener la versión de la atención. Recargue la página.';
          this.isLoading = false;
          return;
        }
        this.atencion = atencion;
        this.form.patchValue({
          motivo: atencion.motivo,
          antecedentes: atencion.antecedentes ?? '',
          inmunizaciones: atencion.inmunizaciones ?? '',
          signosVitales: atencion.signosVitales ?? '',
          examenFisico: atencion.examenFisico ?? '',
          laboratorio: atencion.laboratorio ?? '',
          diagnostico1: atencion.diagnostico1 ?? '',
          cie101: atencion.cie101 ?? '',
          tipoDiagnostico1: atencion.tipoDiagnostico1 ?? '',
          diagnostico2: atencion.diagnostico2 ?? '',
          cie102: atencion.cie102 ?? '',
          tipoDiagnostico2: atencion.tipoDiagnostico2 ?? '',
          diagnostico3: atencion.diagnostico3 ?? '',
          cie103: atencion.cie103 ?? '',
          tipoDiagnostico3: atencion.tipoDiagnostico3 ?? '',
          conclusion: atencion.conclusion ?? '',
          derivacion: atencion.derivacion ?? '',
          observaciones: atencion.observaciones ?? ''
        });
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudo cargar la atención.';
        this.isLoading = false;
      }
    });
  }

  hasError(field: string): boolean {
    const control = this.form.get(field);
    return !!(control?.invalid && control.touched);
  }

  guardar(): void {
    if (!this.atencion?.updatedAt || this.isSaving) return;
    if (!this.form.controls.motivo.value.trim()) {
      this.form.markAllAsTouched();
      this.form.controls.motivo.setErrors({ required: true });
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const nullable = (value: string): string | null => value.trim() || null;
    const tipo = (value: string): TipoDiagnostico | null => (value as TipoDiagnostico) || null;
    const payload: AtencionUpdate = {
      updatedAt: this.atencion.updatedAt,
      motivo: raw.motivo.trim(),
      antecedentes: nullable(raw.antecedentes),
      inmunizaciones: nullable(raw.inmunizaciones),
      signosVitales: nullable(raw.signosVitales),
      examenFisico: nullable(raw.examenFisico),
      laboratorio: nullable(raw.laboratorio),
      diagnostico1: nullable(raw.diagnostico1),
      cie101: nullable(raw.cie101),
      tipoDiagnostico1: tipo(raw.tipoDiagnostico1),
      diagnostico2: nullable(raw.diagnostico2),
      cie102: nullable(raw.cie102),
      tipoDiagnostico2: tipo(raw.tipoDiagnostico2),
      diagnostico3: nullable(raw.diagnostico3),
      cie103: nullable(raw.cie103),
      tipoDiagnostico3: tipo(raw.tipoDiagnostico3),
      conclusion: nullable(raw.conclusion),
      derivacion: nullable(raw.derivacion),
      observaciones: nullable(raw.observaciones)
    };

    this.errorMessage = '';
    this.isSaving = true;
    this.atencionService.updateClinical(this.atencion.id, payload).subscribe({
      next: () => this.router.navigate(['/atenciones']),
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'No se pudo guardar la atención.';
        this.isSaving = false;
      }
    });
  }

  volver(): void {
    this.router.navigate(['/atenciones']);
  }
}
