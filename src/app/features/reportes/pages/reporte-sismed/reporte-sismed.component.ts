import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, forkJoin, of, throwError } from 'rxjs';
import { AuthService } from '../../../../core/services/auth.service';
import { ConciliacionMensual, ReporteSISMED } from '../../../../models/reporte.model';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-reporte-sismed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-sismed.component.html'
})
export class ReporteSismedComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);
  private readonly authService = inject(AuthService);

  selectedPeriodo = new Date().toISOString().substring(0, 7);
  reporteData: ReporteSISMED[] = [];
  isLoading = false;
  isExporting = false;
  isCerrando = false;
  isConciliando = false;
  periodoCerrado = false;
  conciliacion: ConciliacionMensual | null = null;
  conteosFisicos: Record<string, number | null> = {};
  observacionConciliacion = '';
  errorMessage = '';
  successMessage = '';
  showConfirmCierre = false;

  get periodo6(): string {
    return this.selectedPeriodo.replace('-', '');
  }

  get periodoLabel(): string {
    const [anio, mes] = this.selectedPeriodo.split('-');
    return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' })
      .format(new Date(+anio, +mes - 1));
  }

  get periodoEsAnterior(): boolean {
    const [anio, mes] = this.selectedPeriodo.split('-').map(Number);
    const hoy = new Date();
    return anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1);
  }

  get canModifyReports(): boolean {
    return this.authService.canEdit('/reportes');
  }

  get conteoCompleto(): boolean {
    return this.reporteData.length > 0 && this.reporteData.every((reporte) => {
      const value = this.conteosFisicos[reporte.codigoSismed];
      return value !== null && value !== undefined && Number.isInteger(value) && value >= 0;
    });
  }

  ngOnInit(): void {
    this.cargarPeriodo();
  }

  onPeriodoChange(): void {
    this.reporteData = [];
    this.errorMessage = '';
    this.successMessage = '';
    this.showConfirmCierre = false;
    this.periodoCerrado = false;
    this.conciliacion = null;
    this.conteosFisicos = {};
    this.observacionConciliacion = '';
    this.cargarPeriodo();
  }

  cargarPeriodo(): void {
    if (!this.selectedPeriodo) return;
    this.isLoading = true;
    this.errorMessage = '';
    forkJoin({
      estado: this.reporteService.getEstadoPeriodo(this.periodo6),
      data:   this.reporteService.getReporte(this.periodo6),
      conciliacion: this.reporteService.getConciliacion(this.periodo6).pipe(
        catchError((err) => err?.status === 404 ? of(null) : throwError(() => err))
      )
    }).subscribe({
      next: ({ estado, data, conciliacion }) => {
        this.periodoCerrado = estado.cerrado;
        this.reporteData = data;
        this.conciliacion = conciliacion;
        this.observacionConciliacion = conciliacion?.observacion ?? '';
        this.conteosFisicos = Object.fromEntries(
          data.map((reporte) => [
            reporte.codigoSismed,
            conciliacion?.detalles.find((detalle) => detalle.codigoSismed === reporte.codigoSismed)?.stockFisico ?? null
          ]));
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar el período.';
        this.isLoading = false;
      }
    });
  }

  confirmarCierre(): void { this.showConfirmCierre = true; }
  cancelarCierre(): void  { this.showConfirmCierre = false; }

  cerrarMes(): void {
    this.isCerrando = true;
    this.showConfirmCierre = false;
    this.errorMessage = '';
    this.reporteService.cerrarMes(this.periodo6).subscribe({
      next: (res) => {
        this.successMessage = res.mensaje;
        this.periodoCerrado = true;
        this.isCerrando = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Error al cerrar el mes.';
        this.isCerrando = false;
      }
    });
  }

  guardarConciliacion(): void {
    if (!this.conteoCompleto || !this.canModifyReports || this.periodoCerrado) return;
    this.isConciliando = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.reporteService.guardarConciliacion(this.periodo6, {
      conteos: this.reporteData.map((reporte) => ({
        codigoSismed: reporte.codigoSismed,
        stockFisico: Number(this.conteosFisicos[reporte.codigoSismed])
      })),
      observacion: this.observacionConciliacion.trim() || undefined
    }).subscribe({
      next: (conciliacion) => {
        this.conciliacion = conciliacion;
        this.successMessage = conciliacion.resultado === 'CUADRADO'
          ? 'Conciliación guardada: el stock físico coincide con el reporte SISMED.'
          : 'Conciliación guardada con diferencias pendientes de regularizar.';
        this.isConciliando = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Error al guardar la conciliación.';
        this.isConciliando = false;
      }
    });
  }

  diferencia(reporte: ReporteSISMED): number | null {
    const stockFisico = this.conteosFisicos[reporte.codigoSismed];
    if (stockFisico === null || stockFisico === undefined) return null;
    return Number(stockFisico) - reporte.stockFinal;
  }

  totalStockFisico(): number {
    return this.reporteData.reduce(
      (total, reporte) => total + Number(this.conteosFisicos[reporte.codigoSismed] ?? 0), 0);
  }

  totalDiferencia(): number {
    return this.reporteData.reduce((total, reporte) => total + (this.diferencia(reporte) ?? 0), 0);
  }

  exportar(): void {
    this.isExporting = true;
    this.reporteService.exportarExcel(this.periodo6).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte-sismed-${this.periodo6}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        this.isExporting = false;
      },
      error: () => { this.isExporting = false; }
    });
  }

  total(key: keyof ReporteSISMED): number {
    return this.reporteData.reduce((acc, r) => acc + ((r[key] as number) ?? 0), 0);
  }

  stockFinalColor(val: number): string {
    if (val < 0) return 'text-red-600';
    if (val === 0) return 'text-slate-400';
    return 'text-text';
  }
}
