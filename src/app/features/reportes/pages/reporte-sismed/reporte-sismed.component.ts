import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReporteSISMED } from '../../../../models/reporte.model';
import { ReporteService } from '../../services/reporte.service';

@Component({
  selector: 'app-reporte-sismed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reporte-sismed.component.html',
  styleUrl: './reporte-sismed.component.scss'
})
export class ReporteSismedComponent implements OnInit {
  private readonly reporteService = inject(ReporteService);

  selectedPeriodo = new Date().toISOString().substring(0, 7);
  reporteData: ReporteSISMED[] = [];
  isLoading = false;
  isExporting = false;
  isCerrando = false;
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

  ngOnInit(): void {
    this.generar();
  }

  onPeriodoChange(): void {
    this.reporteData = [];
    this.errorMessage = '';
    this.successMessage = '';
    this.showConfirmCierre = false;
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
        this.isCerrando = false;
      },
      error: (err) => {
        this.errorMessage = err?.error?.message ?? 'Error al cerrar el mes.';
        this.isCerrando = false;
      }
    });
  }

  get periodoEsAnterior(): boolean {
    const [anio, mes] = this.selectedPeriodo.split('-').map(Number);
    const hoy = new Date();
    return anio < hoy.getFullYear() || (anio === hoy.getFullYear() && mes < hoy.getMonth() + 1);
  }

  generar(): void {
    if (!this.selectedPeriodo) return;
    this.isLoading = true;
    this.errorMessage = '';
    this.reporteData = [];
    this.reporteService.getReporte(this.periodo6).subscribe({
      next: (data) => { this.reporteData = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Error al generar el reporte.'; this.isLoading = false; }
    });
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
    if (val < 0) return 'neg';
    if (val === 0) return 'zero';
    return '';
  }
}
