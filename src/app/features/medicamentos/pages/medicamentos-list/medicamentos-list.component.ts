import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Inventario, MovimientoInventario } from '../../../../models/inventario.model';
import { Medicamento, MedicamentoCreate } from '../../../../models/medicamento.model';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';
import { MedicamentoFormComponent } from '../../components/medicamento-form/medicamento-form.component';
import { StockTableComponent } from '../../components/stock-table/stock-table.component';
import { InventarioService } from '../../services/inventario.service';
import { MedicamentoService } from '../../services/medicamento.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-medicamentos-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AlertMessageComponent,
    ModalConfirmationComponent,
    MedicamentoFormComponent,
    StockTableComponent
  ],
  templateUrl: './medicamentos-list.component.html'
})
export class MedicamentosListComponent implements OnInit {
  private readonly medicamentoService = inject(MedicamentoService);
  private readonly inventarioService = inject(InventarioService);
  readonly auth = inject(AuthService);

  medicamentos: Medicamento[] = [];
  inventarios: Inventario[] = [];
  isLoading = false;
  isSaving = false;
  errorMessage = '';

  searchText = '';
  filtroEstado: 'todos' | 'activos' | 'inactivos' = 'activos';
  page = 1;
  totalElements = 0;
  totalPages = 1;
  readonly pageSize = 15;

  showFormModal = false;
  showStockModal = false;
  showDeleteConfirm = false;
  showConfirmToggle = false;
  showHistorialModal = false;
  medicamentoSeleccionado?: Medicamento;
  medicamentoParaToggle?: Medicamento;
  historialMovimientos: MovimientoInventario[] = [];
  isLoadingHistorial = false;

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin([
      this.medicamentoService.getPage(this.page - 1, this.pageSize, this.searchText, this.filtroEstado),
      this.inventarioService.getAll()
    ]).subscribe({
      next: ([medPage, invs]) => {
        this.medicamentos = medPage.content;
        this.totalElements = medPage.totalElements;
        this.totalPages = Math.max(1, medPage.totalPages);
        this.inventarios = invs;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar medicamentos.';
        this.isLoading = false;
      }
    });
  }

  get filtrados(): Medicamento[] {
    return this.medicamentos;
  }

  tipoProductoLabel(tipo?: string): string {
    if (tipo === 'MARCA') return 'Marca';
    if (tipo === 'GENERICO') return 'Genérico';
    return '';
  }

  tipoProductoClass(tipo?: string): string {
    if (tipo === 'MARCA') return 'bg-violet-100 text-violet-700';
    if (tipo === 'GENERICO') return 'bg-sky-100 text-sky-700';
    return 'bg-slate-100 text-slate-500';
  }

  stockClass(medicamentoId: number): string {
    const stock = this.getStockTotal(medicamentoId);
    if (stock === 0) return 'bg-slate-100 text-slate-400';
    if (this.isLowStock(medicamentoId)) return 'bg-orange-50 text-orange-700';
    return 'bg-green-100 text-green-800';
  }

  get paginados(): Medicamento[] {
    return this.medicamentos;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  setPage(p: number): void {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.cargar();
  }

  onSearch(): void {
    this.page = 1;
    this.cargar();
  }

  onFiltroEstadoChange(): void {
    this.page = 1;
    this.cargar();
  }

  getStockTotal(medicamentoId: number): number {
    return this.inventarios
      .filter(i => i.medicamentoId === medicamentoId)
      .reduce((sum, i) => sum + i.stockActual, 0);
  }

  isLowStock(medicamentoId: number): boolean {
    const lotes = this.inventarios.filter(i => i.medicamentoId === medicamentoId);
    if (lotes.length === 0) return false;
    return lotes.some(i => i.stockActual <= i.stockMinimo);
  }

  abrirNuevo(): void {
    this.medicamentoSeleccionado = undefined;
    this.errorMessage = '';
    this.showFormModal = true;
  }

  abrirEditar(med: Medicamento): void {
    this.medicamentoSeleccionado = med;
    this.errorMessage = '';
    this.showFormModal = true;
  }

  abrirStock(med: Medicamento): void {
    this.medicamentoSeleccionado = med;
    this.showStockModal = true;
  }

  cerrarFormModal(): void {
    this.showFormModal = false;
    this.isSaving = false;
  }

  cerrarStockModal(): void {
    this.showStockModal = false;
  }

  guardar(data: MedicamentoCreate): void {
    this.isSaving = true;
    const op = this.medicamentoSeleccionado
      ? this.medicamentoService.update(this.medicamentoSeleccionado.id, data)
      : this.medicamentoService.create(data);

    op.subscribe({
      next: () => {
        this.cerrarFormModal();
        this.cargar();
      },
      error: () => {
        this.errorMessage = 'Error al guardar el medicamento.';
        this.isSaving = false;
      }
    });
  }

  toggleActivo(med: Medicamento): void {
    if (med.activo) {
      this.medicamentoParaToggle = med;
      this.showConfirmToggle = true;
    } else {
      this.ejecutarToggleMed(med);
    }
  }

  confirmarDesactivarMed(): void {
    if (!this.medicamentoParaToggle) return;
    this.ejecutarToggleMed(this.medicamentoParaToggle);
    this.showConfirmToggle = false;
    this.medicamentoParaToggle = undefined;
  }

  private ejecutarToggleMed(med: Medicamento): void {
    this.medicamentoService.toggleActivo(med.id).subscribe({
      next: (updated) => {
        const idx = this.medicamentos.findIndex(m => m.id === med.id);
        if (idx !== -1) this.medicamentos[idx] = updated;
      },
      error: () => (this.errorMessage = 'Error al cambiar el estado.')
    });
  }

  onStockActualizado(): void {
    this.inventarioService.getAll().subscribe({
      next: (invs) => (this.inventarios = invs)
    });
  }

  abrirHistorial(med: Medicamento): void {
    this.medicamentoSeleccionado = med;
    this.historialMovimientos = [];
    this.showHistorialModal = true;
    this.isLoadingHistorial = true;
    this.inventarioService.getMovimientos(med.id).subscribe({
      next: (data) => { this.historialMovimientos = data; this.isLoadingHistorial = false; },
      error: () => (this.isLoadingHistorial = false)
    });
  }

  tipoMovLabel(tipo: string): string {
    const labels: Record<string, string> = {
      INGRESO: 'Ingreso', REINGRESO: 'Reingreso', CONSUMO: 'Consumo',
      DEVOLUCION: 'Devolución', VENCIDO: 'Vencido', MERMA: 'Merma',
      DISTRIBUCION: 'Distribución', TRANSFERENCIA: 'Transferencia', SALDO_INICIAL: 'Saldo inicial'
    };
    return labels[tipo] ?? tipo;
  }

  tipoMovClass(tipo: string): string {
    if (['INGRESO','REINGRESO','SALDO_INICIAL'].includes(tipo)) return 'bg-green-100 text-green-800';
    if (tipo === 'CONSUMO') return 'bg-violet-100 text-violet-700';
    return 'bg-red-50 text-red-600';
  }

  abrirEliminar(med: Medicamento): void {
    this.medicamentoSeleccionado = med;
    this.showDeleteConfirm = true;
  }

  confirmarEliminar(): void {
    if (!this.medicamentoSeleccionado) return;
    this.medicamentoService.delete(this.medicamentoSeleccionado.id).subscribe({
      next: () => {
        this.showDeleteConfirm = false;
        this.medicamentoSeleccionado = undefined;
        this.cargar();
      },
      error: () => {
        this.errorMessage = 'No se puede eliminar: el medicamento tiene consumos registrados.';
        this.showDeleteConfirm = false;
      }
    });
  }
}
