import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { Paciente, PacienteCreate, Sexo, TipoDocumento, TipoPaciente } from '../../../../models/paciente.model';

@Component({
  selector: 'app-paciente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './paciente-form.component.html',
  styleUrl: './paciente-form.component.scss'
})
export class PacienteFormComponent implements OnChanges {
  @Input() paciente?: Paciente;
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<PacienteCreate>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  readonly tipoPacienteOptions: { label: string; value: TipoPaciente }[] = [
    { label: 'Estudiante',       value: 'ESTUDIANTE'     },
    { label: 'Docente',          value: 'DOCENTE'        },
    { label: 'Administrativo',   value: 'ADMINISTRATIVO' },
    { label: 'Invitado',         value: 'INVITADO'       }
  ];

  readonly tipoDocOptions: { label: string; value: TipoDocumento }[] = [
    { label: 'DNI',                value: 'DNI'                },
    { label: 'Carnet de Extranjería', value: 'CARNET_EXTRANJERIA' },
    { label: 'Pasaporte',          value: 'PASAPORTE'          }
  ];

  readonly sexoOptions: { label: string; value: Sexo }[] = [
    { label: 'Mujer',  value: 'MUJER'  },
    { label: 'Hombre', value: 'HOMBRE' },
    { label: 'Otro',   value: 'OTRO'   }
  ];

  readonly carreraOptions: string[] = [
    'Medicina Humana', 'Enfermería', 'Obstetricia', 'Odontología',
    'Farmacia y Bioquímica', 'Nutrición', 'Psicología', 'Administración',
    'Contabilidad', 'Derecho', 'Ingeniería de Sistemas', 'Ingeniería Civil',
    'Ingeniería Industrial', 'Arquitectura', 'Educación'
  ];

  readonly cicloOptions: string[] = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X'];

  readonly maxFechaNacimiento = new Date().toISOString().split('T')[0];
  readonly minFechaNacimiento = new Date(
    new Date().getFullYear() - 120, 0, 1
  ).toISOString().split('T')[0];

  readonly form = this.fb.nonNullable.group({
    tipoPaciente:     ['ESTUDIANTE' as TipoPaciente, Validators.required],
    tipoDocumento:    ['DNI' as TipoDocumento, Validators.required],
    nroDocumento:     ['', this.dniValidators()],
    nombresApellidos: ['', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(150),
      Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s]+$/)
    ]],
    fechaNacimiento:  [''],
    sexo:             ['MUJER' as Sexo, Validators.required],
    carreraArea:      [''],
    cicloAcademico:   [''],
    telefono:         ['', Validators.pattern(/^\d{9}$/)]
  });

  get isEditing(): boolean { return !!this.paciente; }

  get tipoPacienteActual(): TipoPaciente {
    return this.form.getRawValue().tipoPaciente;
  }

  get showCarrera(): boolean {
    return this.tipoPacienteActual !== 'INVITADO';
  }

  get showCiclo(): boolean {
    return this.tipoPacienteActual === 'ESTUDIANTE';
  }

  get carreraLabel(): string {
    const labels: Record<TipoPaciente, string> = {
      ESTUDIANTE:     'Carrera',
      DOCENTE:        'Departamento / Área',
      ADMINISTRATIVO: 'Área',
      INVITADO:       ''
    };
    return labels[this.tipoPacienteActual];
  }

  get isCarreraSelect(): boolean {
    return this.tipoPacienteActual === 'ESTUDIANTE';
  }

  get edadCalculada(): number | null {
    const fn = this.form.getRawValue().fechaNacimiento;
    if (!fn) return null;
    const hoy = new Date();
    const nac = new Date(fn + 'T00:00:00');
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) edad--;
    return edad >= 0 ? edad : null;
  }

  get nroDocLabel(): string {
    const labels: Record<string, string> = {
      DNI: 'DNI', CARNET_EXTRANJERIA: 'Carnet de Extranjería', PASAPORTE: 'Pasaporte'
    };
    return labels[this.form.getRawValue().tipoDocumento] ?? 'Nro. Documento';
  }

  get nroDocPlaceholder(): string {
    const ph: Record<string, string> = {
      DNI: 'Ej: 12345678', CARNET_EXTRANJERIA: 'Ej: 000123456', PASAPORTE: 'Ej: AB123456'
    };
    return ph[this.form.getRawValue().tipoDocumento] ?? '';
  }

  get nroDocError(): string {
    const errors: Record<string, string> = {
      DNI: 'El DNI debe tener exactamente 8 dígitos numéricos',
      CARNET_EXTRANJERIA: 'El carnet debe tener 9–12 caracteres alfanuméricos',
      PASAPORTE: 'El pasaporte debe tener 6–15 caracteres alfanuméricos'
    };
    return errors[this.form.getRawValue().tipoDocumento] ?? 'Documento inválido';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['paciente']) return;
    if (this.paciente) {
      this.setValidatorsForTipo(this.paciente.tipoDocumento);
      this.form.patchValue({
        tipoPaciente:     this.paciente.tipoPaciente     ?? 'ESTUDIANTE',
        tipoDocumento:    this.paciente.tipoDocumento,
        nroDocumento:     this.paciente.nroDocumento,
        nombresApellidos: this.paciente.nombresApellidos,
        fechaNacimiento:  this.paciente.fechaNacimiento  ?? '',
        sexo:             this.paciente.sexo,
        carreraArea:      this.paciente.carreraArea      ?? '',
        cicloAcademico:   this.paciente.cicloAcademico   ?? '',
        telefono:         this.paciente.telefono         ?? ''
      });
    } else {
      this.form.reset({
        tipoPaciente:  'ESTUDIANTE',
        tipoDocumento: 'DNI',
        sexo:          'MUJER'
      });
      this.setValidatorsForTipo('DNI');
    }
  }

  onTipoDocChange(): void {
    const tipo = this.form.getRawValue().tipoDocumento;
    this.setValidatorsForTipo(tipo);
    this.form.get('nroDocumento')!.reset('');
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: PacienteCreate = {
      tipoPaciente:     raw.tipoPaciente,
      tipoDocumento:    raw.tipoDocumento,
      nroDocumento:     raw.nroDocumento.toUpperCase().trim(),
      nombresApellidos: raw.nombresApellidos.trim(),
      fechaNacimiento:  raw.fechaNacimiento || undefined,
      sexo:             raw.sexo,
      carreraArea:      raw.carreraArea   || undefined,
      cicloAcademico:   raw.cicloAcademico || undefined,
      telefono:         raw.telefono      || undefined
    };
    this.formSubmit.emit(payload);
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  private dniValidators(): ValidatorFn[] {
    return [Validators.required, Validators.pattern(/^\d{8}$/)];
  }

  private setValidatorsForTipo(tipo: TipoDocumento): void {
    const ctrl = this.form.get('nroDocumento') as AbstractControl;
    ctrl.clearValidators();
    switch (tipo) {
      case 'DNI':
        ctrl.setValidators([Validators.required, Validators.pattern(/^\d{8}$/)]);
        break;
      case 'CARNET_EXTRANJERIA':
        ctrl.setValidators([Validators.required, Validators.pattern(/^[A-Za-z0-9]{9,12}$/)]);
        break;
      case 'PASAPORTE':
        ctrl.setValidators([Validators.required, Validators.pattern(/^[A-Za-z0-9]{6,15}$/)]);
        break;
    }
    ctrl.updateValueAndValidity();
  }
}
