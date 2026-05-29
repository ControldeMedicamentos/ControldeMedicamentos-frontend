import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AjusteInventario, Inventario, TipoAjuste } from '../../../../models/inventario.model';
import { Medicamento } from '../../../../models/medicamento.model';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';
import { MedicamentoService } from '../../services/medicamento.service';
import { InventarioService } from '../../services/inventario.service';

@Component({
  selector: 'app-ajustes-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, AlertMessageComponent, ModalConfirmationComponent],
  templateUrl: './ajustes-inventario.component.html',
  styleUrl: './ajustes-inventario.component.scss'
})
export class AjustesInventarioComponent implements OnInit {
  private readonly medicamentoService = inject(MedicamentoService);
  private readonly inventarioService = inject(InventarioService);
  private readonly fb = inject(FormBuilder);

  medicamentos: Medicamento[] = [];
  medicamentoSeleccionado: Medicamento | null = null;
  lotes: Inventario[] = [];
  loteSeleccionado: Inventario | null = null;
  lotesVencidosPendientes: Inventario[] = [];
  vencidosExpanded = true;
  pendingLoteId: number | null = null;

  medQuery = '';
  medSuggestions: Medicamento[] = [];
  showSuggestions = false;

  isLoadingLotes = false;
  isSaving = false;
  successMessage = '';
  errorMessage = '';
  showConfirmAjuste = false;

  readonly tiposAjuste: { value: TipoAjuste; label: string; icon: string; desc: string; suma: boolean }[] = [
    { value: 'REINGRESO',  label: 'Reingreso',   icon: 'pi-arrow-circle-down', desc: 'Paciente devuelve medicamento no utilizado', suma: true  },
    { value: 'DEVOLUCION', label: 'Devolución',  icon: 'pi-arrow-up-right',    desc: 'Devolución al nivel superior (DIRESA/DIGEMID)', suma: false },
    { value: 'VENCIDO',    label: 'Vencidos',    icon: 'pi-calendar-times',    desc: 'Medicamentos con fecha de vencimiento expirada', suma: false },
    { value: 'MERMA',      label: 'Merma',       icon: 'pi-exclamation-triangle', desc: 'Pérdida por daño, rotura o contaminación', suma: false }
  ];

  get esReingreso(): boolean {
    return this.form.get('tipoAjuste')?.value === 'REINGRESO';
  }

  readonly form = this.fb.nonNullable.group({
    tipoAjuste:  ['' as TipoAjuste | '', Validators.required],
    cantidad:    [1, [Validators.required, Validators.min(1)]],
    observacion: ['', Validators.maxLength(200)]
  });

  ngOnInit(): void {
    this.medicamentoService.getAll().subscribe({
      next: (data) => (this.medicamentos = data.filter(m => m.activo))
    });
    this.cargarVencidosPendientes();
    this.form.get('tipoAjuste')!.valueChanges.subscribe(tipo => {
      if (tipo === 'VENCIDO' && this.loteSeleccionado && this.estadoLote(this.loteSeleccionado) === 'vencido') {
        this.form.patchValue({ cantidad: this.loteSeleccionado.stockActual });
      }
    });
  }

  onMedInput(): void {
    const q = this.medQuery.trim().toLowerCase();
    if (!q) { this.medSuggestions = []; this.showSuggestions = false; return; }
    this.medSuggestions = this.medicamentos
      .filter(m => m.nombre.toLowerCase().includes(q) || (m.registroSanitario ?? '').toLowerCase().includes(q))
      .slice(0, 8);
    this.showSuggestions = this.medSuggestions.length > 0;
  }

  selectMedicamento(med: Medicamento): void {
    this.medicamentoSeleccionado = med;
    this.medQuery = '';
    this.showSuggestions = false;
    this.loteSeleccionado = null;
    this.lotes = [];
    this.clearMessages();
    this.cargarLotes(med.id);
  }

  clearMedicamento(): void {
    this.medicamentoSeleccionado = null;
    this.lotes = [];
    this.loteSeleccionado = null;
    this.clearMessages();
  }

  onMedBlur(): void {
    setTimeout(() => (this.showSuggestions = false), 150);
  }

  cargarLotes(medicamentoId: number): void {
    this.isLoadingLotes = true;
    this.inventarioService.getByMedicamento(medicamentoId).subscribe({
      next: (data) => {
        this.lotes = data.filter(l => l.stockActual > 0);
        this.isLoadingLotes = false;
        if (this.pendingLoteId !== null) {
          const lote = this.lotes.find(l => l.id === this.pendingLoteId);
          if (lote) {
            this.loteSeleccionado = lote;
            this.form.patchValue({ tipoAjuste: 'VENCIDO', cantidad: lote.stockActual });
          }
          this.pendingLoteId = null;
        }
      },
      error: () => (this.isLoadingLotes = false)
    });
  }

  cargarVencidosPendientes(): void {
    this.inventarioService.getVencidosPendientes().subscribe({
      next: (data) => (this.lotesVencidosPendientes = data)
    });
  }

  irALoteVencido(lote: Inventario): void {
    const med = this.medicamentos.find(m => m.id === lote.medicamentoId);
    if (!med) return;
    this.pendingLoteId = lote.id;
    this.selectMedicamento(med);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  get loteVencidoSeleccionado(): boolean {
    return !!(this.loteSeleccionado
      && this.estadoLote(this.loteSeleccionado) === 'vencido'
      && this.form.get('tipoAjuste')?.value === 'VENCIDO');
  }

  selectLote(lote: Inventario): void {
    this.loteSeleccionado = lote;
    this.form.patchValue({ cantidad: 1 });
    this.clearMessages();
  }

  get stockDisponible(): number {
    return this.loteSeleccionado?.stockActual ?? 0;
  }

  get cantidadMax(): number { return this.esReingreso ? 9999 : this.stockDisponible; }

  solicitarConfirmacion(): void {
    if (this.form.invalid || !this.loteSeleccionado) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    if (raw.cantidad > this.stockDisponible) {
      this.errorMessage = `La cantidad (${raw.cantidad}) supera el stock disponible (${this.stockDisponible}).`;
      return;
    }
    this.showConfirmAjuste = true;
  }

  guardar(): void {
    this.showConfirmAjuste = false;
    if (!this.loteSeleccionado) return;
    const raw = this.form.getRawValue();
    const payload: AjusteInventario = {
      inventarioId: this.loteSeleccionado.id,
      tipoAjuste:   raw.tipoAjuste as TipoAjuste,
      cantidad:     raw.cantidad,
      observacion:  raw.observacion || undefined
    };
    this.isSaving = true;
    this.clearMessages();
    this.inventarioService.ajustar(payload).subscribe({
      next: () => {
        this.successMessage = 'Ajuste registrado correctamente.';
        this.isSaving = false;
        this.form.reset({ tipoAjuste: '', cantidad: 1, observacion: '' });
        this.loteSeleccionado = null;
        this.cargarLotes(this.medicamentoSeleccionado!.id);
        this.cargarVencidosPendientes();
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Error al registrar el ajuste.';
        this.isSaving = false;
      }
    });
  }

  hasError(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl.touched);
  }

  get tipoAjusteLabel(): string {
    const tipo = this.form.get('tipoAjuste')?.value;
    return this.tiposAjuste.find(t => t.value === tipo)?.label ?? '';
  }

  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  estadoLote(lote: Inventario): 'vencido' | 'por_vencer' | 'bajo' | 'ok' {
    if (lote.fechaVencimiento) {
      const hoy = new Date(); hoy.setHours(0,0,0,0);
      const venc = new Date(lote.fechaVencimiento + 'T00:00:00');
      if (venc < hoy) return 'vencido';
      if ((venc.getTime() - hoy.getTime()) / 86400000 <= 30) return 'por_vencer';
    }
    return lote.stockActual <= (this.medicamentoSeleccionado?.stockMinimo ?? 0) ? 'bajo' : 'ok';
  }
}
