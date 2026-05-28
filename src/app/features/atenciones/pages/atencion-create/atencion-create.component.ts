import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { AtencionCreate, ConsumoMedicamentoCreate, TipoConsumo, TipoDiagnostico } from '../../../../models/atencion.model';
import { Medicamento } from '../../../../models/medicamento.model';
import { Paciente } from '../../../../models/paciente.model';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { MedicamentoService } from '../../../medicamentos/services/medicamento.service';
import { PacienteService } from '../../../pacientes/services/paciente.service';
import { AtencionDraftService } from '../../services/atencion-draft.service';
import { AtencionService } from '../../services/atencion.service';

interface Step {
  num: number;
  label: string;
  icon: string;
}

interface MedUiState {
  query: string;
  suggestions: import('../../../../models/medicamento.model').Medicamento[];
  showSuggestions: boolean;
  selected: import('../../../../models/medicamento.model').Medicamento | null;
}

@Component({
  selector: 'app-atencion-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, AlertMessageComponent],
  templateUrl: './atencion-create.component.html',
  styleUrl: './atencion-create.component.scss'
})
export class AtencionCreateComponent implements OnInit, OnDestroy {
  private readonly atencionService = inject(AtencionService);
  private readonly pacienteService = inject(PacienteService);
  private readonly medicamentoService = inject(MedicamentoService);
  private readonly draftService = inject(AtencionDraftService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  private submitted = false;
  private cancelled = false;

  pacientes: Paciente[] = [];
  medicamentosActivos: Medicamento[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';
  stepError = '';

  archivosSeleccionados: File[] = [];
  medUiStates: MedUiState[] = [];

  readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  readonly MAX_FILE_SIZE = 20 * 1024 * 1024;

  currentStep = 1;

  readonly steps: Step[] = [
    { num: 1, label: 'Paciente',     icon: 'pi-user'         },
    { num: 2, label: 'Evaluación',   icon: 'pi-clipboard'    },
    { num: 3, label: 'Diagnósticos', icon: 'pi-tag'          },
    { num: 4, label: 'Plan',         icon: 'pi-check-square' },
    { num: 5, label: 'Medicamentos', icon: 'pi-box'          }
  ];

  pacienteQuery = '';
  pacienteSuggestions: Paciente[] = [];
  pacienteSeleccionado: Paciente | null = null;
  showSuggestions = false;

  readonly tipoConsumoOptions: { value: TipoConsumo; label: string }[] = [
    { value: 'SIS',                  label: 'SIS'                  },
    { value: 'VENTA',                label: 'Venta'                },
    { value: 'INTERSANIDAD',         label: 'Intersanidad'         },
    { value: 'EXONERADO',            label: 'Exonerado'            },
    { value: 'SOAT',                 label: 'SOAT'                 },
    { value: 'CREDITO_HOSPITALARIO', label: 'Crédito Hospitalario' },
    { value: 'DEFUNCION_NACIMIENTO', label: 'Defunción/Nacimiento' },
    { value: 'FACTORES_PERDIDA',     label: 'Factores de Pérdida'  },
    { value: 'OTRO_CONVENIO',        label: 'Otro Convenio'        }
  ];

  readonly tipoDxOptions: { value: TipoDiagnostico; label: string }[] = [
    { value: 'PRESUNTIVO',  label: 'Presuntivo'  },
    { value: 'DEFINITIVO',  label: 'Definitivo'  },
    { value: 'REITERATIVO', label: 'Reiterativo' }
  ];

  readonly form = this.fb.nonNullable.group({
    fechaEvaluacion:  [this.hoy(), Validators.required],
    motivo:           ['', [Validators.required, Validators.maxLength(300)]],
    antecedentes:     [''],
    inmunizaciones:   [''],
    signosVitales:    [''],
    examenFisico:     [''],
    laboratorio:      [''],
    diagnostico1:     ['', Validators.maxLength(150)],
    cie101:           ['', Validators.maxLength(15)],
    tipoDiagnostico1: [''],
    diagnostico2:     ['', Validators.maxLength(150)],
    cie102:           ['', Validators.maxLength(15)],
    tipoDiagnostico2: [''],
    diagnostico3:     ['', Validators.maxLength(150)],
    cie103:           ['', Validators.maxLength(15)],
    tipoDiagnostico3: [''],
    conclusion:       ['', Validators.maxLength(80)],
    derivacion:       ['', Validators.maxLength(120)],
    observaciones:    ['']
  });

  readonly consumos = new FormArray<FormGroup>([]);

  ngOnInit(): void {
    this.isLoading = true;
    forkJoin([
      this.pacienteService.getAll(),
      this.medicamentoService.getAll()
    ]).subscribe({
      next: ([pacientes, medicamentos]) => {
        this.pacientes = pacientes.filter(p => p.activo !== false);
        this.medicamentosActivos = medicamentos.filter(m => m.activo);
        this.isLoading = false;
        this.restoreDraft();
      },
      error: () => {
        this.errorMessage = 'Error al cargar los datos necesarios.';
        this.isLoading = false;
      }
    });
  }

  ngOnDestroy(): void {
    if (this.submitted || this.cancelled) return;
    const hasData = this.pacienteSeleccionado !== null
      || Object.values(this.form.getRawValue()).some(v => v !== '' && v !== null);
    if (!hasData) return;
    this.draftService.save({
      formValues: this.form.getRawValue() as Record<string, unknown>,
      paciente: this.pacienteSeleccionado,
      currentStep: this.currentStep,
      hasFiles: this.archivosSeleccionados.length > 0
    });
  }

  private restoreDraft(): void {
    const draft = this.draftService.load();
    if (!draft) return;
    this.form.patchValue(draft.formValues);
    this.pacienteSeleccionado = draft.paciente;
    this.currentStep = draft.currentStep;
  }

  hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  onPacienteInput(): void {
    const q = this.pacienteQuery.trim().toLowerCase();
    if (!q) { this.pacienteSuggestions = []; this.showSuggestions = false; return; }
    this.pacienteSuggestions = this.pacientes
      .filter(p => p.nombresApellidos.toLowerCase().includes(q) || p.nroDocumento.toLowerCase().includes(q))
      .slice(0, 8);
    this.showSuggestions = this.pacienteSuggestions.length > 0;
  }

  selectPaciente(p: Paciente): void {
    this.pacienteSeleccionado = p;
    this.pacienteQuery = '';
    this.showSuggestions = false;
    this.stepError = '';
  }

  clearPaciente(): void {
    this.pacienteSeleccionado = null;
    this.pacienteQuery = '';
  }

  onPacienteBlur(): void {
    setTimeout(() => (this.showSuggestions = false), 150);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void { this.showSuggestions = false; }

  goTo(step: number): void {
    if (step < this.currentStep) this.currentStep = step;
  }

  siguiente(): void {
    this.stepError = '';
    if (this.currentStep === 1) {
      if (!this.pacienteSeleccionado) { this.stepError = 'Seleccione un paciente para continuar.'; return; }
      const fecha = this.form.get('fechaEvaluacion');
      if (fecha?.invalid) { fecha.markAsTouched(); this.stepError = 'Indique la fecha de evaluación.'; return; }
    }
    if (this.currentStep === 2) {
      const motivo = this.form.get('motivo');
      if (motivo?.invalid) { motivo.markAsTouched(); this.stepError = 'El motivo de consulta es requerido.'; return; }
    }
    if (this.currentStep < this.steps.length) this.currentStep++;
  }

  anterior(): void {
    this.stepError = '';
    if (this.currentStep > 1) this.currentStep--;
  }

  agregarConsumo(): void {
    this.consumos.push(this.fb.group({
      medicamentoId:     [null, Validators.required],
      cantidadConsumida: [1,    [Validators.required, Validators.min(1)]]
    }));
    this.medUiStates.push({ query: '', suggestions: [], showSuggestions: false, selected: null });
  }

  quitarConsumo(i: number): void {
    this.consumos.removeAt(i);
    this.medUiStates.splice(i, 1);
  }

  onMedInput(i: number): void {
    const q = this.medUiStates[i].query.trim().toLowerCase();
    if (!q) { this.medUiStates[i].suggestions = []; this.medUiStates[i].showSuggestions = false; return; }
    this.medUiStates[i].suggestions = this.medicamentosActivos
      .filter(m => m.nombre.toLowerCase().includes(q) || (m.registroSanitario ?? '').toLowerCase().includes(q))
      .slice(0, 8);
    this.medUiStates[i].showSuggestions = this.medUiStates[i].suggestions.length > 0;
  }

  selectMed(i: number, med: Medicamento): void {
    this.medUiStates[i].selected = med;
    this.medUiStates[i].query = '';
    this.medUiStates[i].showSuggestions = false;
    this.consumos.at(i).get('medicamentoId')!.setValue(med.id);
  }

  clearMed(i: number): void {
    this.medUiStates[i].selected = null;
    this.medUiStates[i].query = '';
    this.consumos.at(i).get('medicamentoId')!.setValue(null);
  }

  onMedBlur(i: number): void {
    setTimeout(() => { if (this.medUiStates[i]) this.medUiStates[i].showSuggestions = false; }, 150);
  }

  consumoGroup(i: number): FormGroup { return this.consumos.at(i) as FormGroup; }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  consumoHasError(i: number, field: string): boolean {
    const ctrl = this.consumos.at(i).get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const nuevos = Array.from(input.files).filter(f => {
      if (!this.ALLOWED_TYPES.includes(f.type)) {
        this.stepError = `Tipo no permitido: ${f.name}. Solo imágenes y PDF.`;
        return false;
      }
      if (f.size > this.MAX_FILE_SIZE) {
        this.stepError = `Archivo demasiado grande: ${f.name}. Máximo 20 MB.`;
        return false;
      }
      return true;
    });
    this.archivosSeleccionados = [...this.archivosSeleccionados, ...nuevos];
    input.value = '';
  }

  removeArchivo(index: number): void {
    this.archivosSeleccionados = this.archivosSeleccionados.filter((_, i) => i !== index);
  }

  formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  isImage(file: File): boolean {
    return file.type.startsWith('image/');
  }

  submit(): void {
    this.errorMessage = '';
    if (!this.pacienteSeleccionado) { this.currentStep = 1; this.stepError = 'Seleccione un paciente.'; return; }
    if (this.form.get('motivo')?.invalid) { this.currentStep = 2; this.form.get('motivo')?.markAsTouched(); return; }
    if (this.consumos.invalid) { this.consumos.controls.forEach(c => c.markAllAsTouched()); return; }

    const raw = this.form.getRawValue();
    const payload: AtencionCreate = {
      pacienteId:       this.pacienteSeleccionado.id,
      fechaEvaluacion:  raw.fechaEvaluacion,
      motivo:           raw.motivo.trim(),
      antecedentes:     raw.antecedentes     || undefined,
      inmunizaciones:   raw.inmunizaciones   || undefined,
      signosVitales:    raw.signosVitales    || undefined,
      examenFisico:     raw.examenFisico     || undefined,
      laboratorio:      raw.laboratorio      || undefined,
      diagnostico1:     raw.diagnostico1     || undefined,
      cie101:           raw.cie101           || undefined,
      tipoDiagnostico1: (raw.tipoDiagnostico1 as TipoDiagnostico) || undefined,
      diagnostico2:     raw.diagnostico2     || undefined,
      cie102:           raw.cie102           || undefined,
      tipoDiagnostico2: (raw.tipoDiagnostico2 as TipoDiagnostico) || undefined,
      diagnostico3:     raw.diagnostico3     || undefined,
      cie103:           raw.cie103           || undefined,
      tipoDiagnostico3: (raw.tipoDiagnostico3 as TipoDiagnostico) || undefined,
      conclusion:       raw.conclusion       || undefined,
      derivacion:       raw.derivacion       || undefined,
      observaciones:    raw.observaciones    || undefined,
      consumos: this.consumos.value.map((c: { medicamentoId: string | number; cantidadConsumida: number }): ConsumoMedicamentoCreate => ({
        medicamentoId:     Number(c.medicamentoId),
        cantidadConsumida: c.cantidadConsumida
      }))
    };

    this.isSaving = true;
    this.atencionService.create(payload).pipe(
      switchMap(atencion => {
        if (this.archivosSeleccionados.length === 0) return of(atencion);
        const uploads = this.archivosSeleccionados.map(f => this.atencionService.uploadArchivo(atencion.id, f));
        return forkJoin(uploads);
      })
    ).subscribe({
      next: () => {
        this.submitted = true;
        this.draftService.clear();
        this.router.navigate(['/atenciones']);
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Error al registrar la atención.';
        this.isSaving = false;
      }
    });
  }

  cancelar(): void {
    this.cancelled = true;
    this.router.navigate(['/atenciones']);
  }
}
