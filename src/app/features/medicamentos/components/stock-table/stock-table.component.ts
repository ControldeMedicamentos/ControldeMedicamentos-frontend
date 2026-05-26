import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { Inventario, InventarioCreate } from '../../../../models/inventario.model';
import { Medicamento } from '../../../../models/medicamento.model';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-stock-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './stock-table.component.html',
  styleUrl: './stock-table.component.scss'
})
export class StockTableComponent implements OnInit, OnChanges {
  @Input({ required: true }) medicamento!: Medicamento;
  @Output() actualizado = new EventEmitter<void>();

  private readonly inventarioService = inject(InventarioService);
  private readonly fb = inject(FormBuilder);

  inventarios: Inventario[] = [];
  isLoading = false;
  isSaving = false;
  showForm = false;
  errorMessage = '';

  readonly form = this.fb.nonNullable.group({
    lote: ['', Validators.maxLength(80)],
    fechaVencimiento: [''],
    stockActual: [0, [Validators.required, Validators.min(0)]],
    stockMinimo: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.cargar();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['medicamento'] && !changes['medicamento'].firstChange) {
      this.cargar();
    }
  }

  cargar(): void {
    this.isLoading = true;
    this.inventarioService.getByMedicamento(this.medicamento.id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({ next: (data) => (this.inventarios = data) });
  }

  get stockTotal(): number {
    return this.inventarios.reduce((sum, i) => sum + i.stockActual, 0);
  }

  getEstado(inv: Inventario): 'vencido' | 'por_vencer' | 'bajo' | 'ok' {
    if (inv.fechaVencimiento) {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const venc = new Date(inv.fechaVencimiento + 'T00:00:00');
      if (venc < hoy) return 'vencido';
      const diffDays = Math.floor((venc.getTime() - hoy.getTime()) / 86400000);
      if (diffDays <= 30) return 'por_vencer';
    }
    if (inv.stockActual <= inv.stockMinimo) return 'bajo';
    return 'ok';
  }

  getEstadoLabel(estado: string): string {
    const labels: Record<string, string> = {
      vencido: 'Vencido', por_vencer: 'Por vencer', bajo: 'Stock bajo', ok: 'OK'
    };
    return labels[estado] ?? estado;
  }

  abrirForm(): void {
    this.form.reset({ lote: '', fechaVencimiento: '', stockActual: 0, stockMinimo: 0 });
    this.showForm = true;
  }

  guardarLote(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const payload: InventarioCreate = {
      medicamentoId: this.medicamento.id,
      stockActual: raw.stockActual,
      stockMinimo: raw.stockMinimo,
      lote: raw.lote || undefined,
      fechaVencimiento: raw.fechaVencimiento || undefined
    };
    this.isSaving = true;
    this.inventarioService.create(payload)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: () => {
          this.showForm = false;
          this.cargar();
          this.actualizado.emit();
        },
        error: () => (this.errorMessage = 'Error al registrar el lote.')
      });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }
}
