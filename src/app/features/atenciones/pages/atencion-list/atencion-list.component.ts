import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Atencion, TipoConsumo, TipoDiagnostico } from '../../../../models/atencion.model';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';
import { AtencionService } from '../../services/atencion.service';

@Component({
  selector: 'app-atencion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertMessageComponent, ModalConfirmationComponent],
  templateUrl: './atencion-list.component.html',
  styleUrl: './atencion-list.component.scss'
})
export class AtencionListComponent implements OnInit {
  private readonly atencionService = inject(AtencionService);
  private readonly router = inject(Router);

  atenciones: Atencion[] = [];
  isLoading = false;
  errorMessage = '';

  desde = this.primerDiaMes();
  hasta = this.hoy();

  page = 1;
  readonly pageSize = 15;

  showDetail = false;
  atencionDetalle?: Atencion;

  ngOnInit(): void {
    this.buscar();
  }

  private primerDiaMes(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`;
  }

  private hoy(): string {
    return new Date().toISOString().split('T')[0];
  }

  buscar(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.page = 1;
    this.atencionService.getByFecha(this.desde, this.hasta).subscribe({
      next: (data) => {
        this.atenciones = data.sort((a, b) =>
          new Date(b.fechaEvaluacion).getTime() - new Date(a.fechaEvaluacion).getTime()
        );
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar atenciones.';
        this.isLoading = false;
      }
    });
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.atenciones.length / this.pageSize));
  }

  get paginados(): Atencion[] {
    const start = (this.page - 1) * this.pageSize;
    return this.atenciones.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.page - 2);
    const end = Math.min(this.totalPages, this.page + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.page = p;
  }

  verDetalle(atencion: Atencion): void {
    this.atencionDetalle = atencion;
    this.showDetail = true;
  }

  nuevaAtencion(): void {
    this.router.navigate(['/atenciones/nueva']);
  }

  tipoDxLabel(tipo?: TipoDiagnostico): string {
    if (!tipo) return '';
    const map: Record<TipoDiagnostico, string> = {
      PRESUNTIVO: 'Presuntivo',
      DEFINITIVO: 'Definitivo',
      REITERATIVO: 'Reiterativo'
    };
    return map[tipo];
  }

  tipoConsumoLabel(tipo: TipoConsumo): string {
    const map: Record<TipoConsumo, string> = {
      VENTA: 'Venta',
      SIS: 'SIS',
      INTERSANIDAD: 'Intersanidad',
      FACTORES_PERDIDA: 'Factores de Pérdida',
      DEFUNCION_NACIMIENTO: 'Defunción/Nacimiento',
      EXONERADO: 'Exonerado',
      SOAT: 'SOAT',
      CREDITO_HOSPITALARIO: 'Crédito Hospitalario',
      OTRO_CONVENIO: 'Otro Convenio'
    };
    return map[tipo] ?? tipo;
  }
}
