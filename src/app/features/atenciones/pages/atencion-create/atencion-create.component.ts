import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AtencionCreate, ConsumoMedicamentoCreate, TipoConsumo, TipoDiagnostico } from '../../../../models/atencion.model';
import { Medicamento } from '../../../../models/medicamento.model';
import { Paciente } from '../../../../models/paciente.model';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { MedicamentoService } from '../../../medicamentos/services/medicamento.service';
import { PacienteService } from '../../../pacientes/services/paciente.service';
import { AtencionService } from '../../services/atencion.service';

@Component({
  selector: 'app-atencion-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AlertMessageComponent],
  templateUrl: './atencion-create.component.html',
  styleUrl: './atencion-create.component.scss'
})
export class AtencionCreateComponent implements OnInit {
  private readonly atencionService = inject(AtencionService);
  private readonly pacienteService = inject(PacienteService);
  private readonly medicamentoService = inject(MedicamentoService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  pacientes: Paciente[] = [];
  medicamentosActivos: Medicamento[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  pacienteQuery = '';
  pacienteSuggestions: Paciente[] = [];
  pacienteSeleccionado: Paciente | null = null;
  showSuggestions = false;

  readonly tipoConsumoOptions: { value: TipoConsumo; label: string }[] = [
    { value: 'SIS', label: 'SIS' },
    { value: 'VENTA', label: 'Venta' },
    { value: 'INTERSANIDAD', label: 'Intersanidad' },
    { value: 'EXONERADO', label: 'Exonerado' },
    { value: 'SOAT', label: 'SOAT' },
    { value: 'CREDITO_HOSPITALARIO', label: 'Crédito Hospitalario' },
    { value: 'DEFUNCION_NACIMIENTO', label: 'Defunción/Nacimiento' },
    { value: 'FACTORES_PERDIDA', label: 'Factores de Pérdida' },
    { value: 'OTRO_CONVENIO', label: 'Otro Convenio' }
  ];

  readonly tipoDxOptions: { value: TipoDiagnostico; label: string }[] = [
    { value: 'PRESUNTIVO', label: 'Presuntivo' },
    { value: 'DEFINITIVO', label: 'Definitivo' },
    { value: 'REITERATIVO', label: 'Reiterativo' }
  ];

  readonly form = this.fb.nonNullable.group({
    fechaEvaluacion: [this.hoy(), Validators.required],
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

  readonly consumos = new FormArray<FormGroup>([]);

  ngOnInit(): void {
    this.isLoading = true;
    forkJoin([
      this.pacienteService.getAll(),
      this.medicamentoService.getAll()
    ]).subscribe({
      next: ([pacientes, medicamentos]) => {
        this.pacientes = pacientes;
        this.medicamentosActivos = medicamentos.filter(m => m.activo);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar los datos necesarios.';
        this.isLoading = false;
      }
    });
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  onPacienteInput(): void {
    const q = this.pacienteQuery.trim().toLowerCase();
    if (!q) {
      this.pacienteSuggestions = [];
      this.showSuggestions = false;
      return;
    }
    this.pacienteSuggestions = this.pacientes
      .filter(p =>
        p.nombresApellidos.toLowerCase().includes(q) ||
        p.nroDocumento.toLowerCase().includes(q)
      )
      .slice(0, 8);
    this.showSuggestions = this.pacienteSuggestions.length > 0;
  }

  selectPaciente(p: Paciente): void {
    this.pacienteSeleccionado = p;
    this.pacienteQuery = '';
    this.showSuggestions = false;
  }

  clearPaciente(): void {
    this.pacienteSeleccionado = null;
    this.pacienteQuery = '';
  }

  onPacienteBlur(): void {
    setTimeout(() => (this.showSuggestions = false), 150);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.showSuggestions = false;
  }

  agregarConsumo(): void {
    this.consumos.push(this.fb.group({
      medicamentoId: [null, Validators.required],
      cantidadConsumida: [1, [Validators.required, Validators.min(1)]],
      tipoConsumo: ['SIS', Validators.required]
    }));
  }

  quitarConsumo(i: number): void {
    this.consumos.removeAt(i);
  }

  consumoGroup(i: number): FormGroup {
    return this.consumos.at(i) as FormGroup;
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  consumoHasError(i: number, field: string): boolean {
    const ctrl = this.consumos.at(i).get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.pacienteSeleccionado) {
      this.errorMessage = 'Debe seleccionar un paciente.';
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.consumos.invalid) {
      this.consumos.controls.forEach(c => c.markAllAsTouched());
      return;
    }

    const raw = this.form.getRawValue();
    const payload: AtencionCreate = {
      pacienteId: this.pacienteSeleccionado.id,
      fechaEvaluacion: raw.fechaEvaluacion,
      motivo: raw.motivo.trim(),
      antecedentes: raw.antecedentes || undefined,
      inmunizaciones: raw.inmunizaciones || undefined,
      signosVitales: raw.signosVitales || undefined,
      examenFisico: raw.examenFisico || undefined,
      laboratorio: raw.laboratorio || undefined,
      diagnostico1: raw.diagnostico1 || undefined,
      cie101: raw.cie101 || undefined,
      tipoDiagnostico1: (raw.tipoDiagnostico1 as TipoDiagnostico) || undefined,
      diagnostico2: raw.diagnostico2 || undefined,
      cie102: raw.cie102 || undefined,
      tipoDiagnostico2: (raw.tipoDiagnostico2 as TipoDiagnostico) || undefined,
      diagnostico3: raw.diagnostico3 || undefined,
      cie103: raw.cie103 || undefined,
      tipoDiagnostico3: (raw.tipoDiagnostico3 as TipoDiagnostico) || undefined,
      conclusion: raw.conclusion || undefined,
      derivacion: raw.derivacion || undefined,
      observaciones: raw.observaciones || undefined,
      consumos: this.consumos.value.map((c: { medicamentoId: string | number; cantidadConsumida: number; tipoConsumo: string }): ConsumoMedicamentoCreate => ({
        medicamentoId: Number(c.medicamentoId),
        cantidadConsumida: c.cantidadConsumida,
        tipoConsumo: c.tipoConsumo as TipoConsumo
      }))
    };

    this.isSaving = true;
    this.atencionService.create(payload).subscribe({
      next: () => this.router.navigate(['/atenciones']),
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Error al registrar la atención.';
        this.isSaving = false;
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/atenciones']);
  }
}
