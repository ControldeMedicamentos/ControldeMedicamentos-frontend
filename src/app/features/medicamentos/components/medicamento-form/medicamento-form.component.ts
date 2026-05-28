import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Medicamento, MedicamentoCreate, TipoProducto } from '../../../../models/medicamento.model';

@Component({
  selector: 'app-medicamento-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './medicamento-form.component.html',
  styleUrl: './medicamento-form.component.scss'
})
export class MedicamentoFormComponent implements OnChanges {
  @Input() medicamento?: Medicamento;
  @Input() isLoading = false;
  @Output() formSubmit = new EventEmitter<MedicamentoCreate>();
  @Output() cancelled = new EventEmitter<void>();

  private readonly fb = inject(FormBuilder);

  readonly tipoProductoOptions: { value: TipoProducto; label: string }[] = [
    { value: 'MARCA',    label: 'Marca'    },
    { value: 'GENERICO', label: 'Genérico' }
  ];

  readonly form = this.fb.nonNullable.group({
    nombre:           ['', [Validators.required, Validators.maxLength(200)]],
    registroSanitario:['', Validators.maxLength(30)],
    tipoProducto:     ['' as TipoProducto | ''],
    presentacion:     ['', Validators.maxLength(120)],
    fabricante:       ['', Validators.maxLength(150)],
    paisFabricacion:  ['', Validators.maxLength(80)],
    precioUnitario:   [null as number | null],
    stockMinimo:      [0, [Validators.required, Validators.min(0)]],
    activo:           [true]
  });

  get isEditing(): boolean { return !!this.medicamento; }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['medicamento']) {
      if (this.medicamento) {
        this.form.patchValue({
          nombre:            this.medicamento.nombre,
          registroSanitario: this.medicamento.registroSanitario ?? '',
          tipoProducto:      this.medicamento.tipoProducto ?? '',
          presentacion:      this.medicamento.presentacion ?? '',
          fabricante:        this.medicamento.fabricante ?? '',
          paisFabricacion:   this.medicamento.paisFabricacion ?? '',
          precioUnitario:    this.medicamento.precioUnitario ?? null,
          stockMinimo:       this.medicamento.stockMinimo ?? 0,
          activo:            this.medicamento.activo
        });
      } else {
        this.form.reset({ activo: true, tipoProducto: '' });
      }
    }
  }

  submit(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const raw = this.form.getRawValue();
    this.formSubmit.emit({
      nombre:            raw.nombre.trim(),
      registroSanitario: raw.registroSanitario || undefined,
      tipoProducto:      (raw.tipoProducto as TipoProducto) || undefined,
      presentacion:      raw.presentacion || undefined,
      fabricante:        raw.fabricante || undefined,
      paisFabricacion:   raw.paisFabricacion || undefined,
      precioUnitario:    raw.precioUnitario ?? undefined,
      stockMinimo:       raw.stockMinimo,
      activo:            raw.activo
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
