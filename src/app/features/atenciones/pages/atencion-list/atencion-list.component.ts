import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Atencion, AtencionArchivo, TipoConsumo, TipoDiagnostico } from '../../../../models/atencion.model';
import { environment } from '../../../../../environments/environment';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';
import { AtencionDraft, AtencionDraftService } from '../../services/atencion-draft.service';
import { AtencionService } from '../../services/atencion.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-atencion-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AlertMessageComponent, ModalConfirmationComponent],
  templateUrl: './atencion-list.component.html'
})
export class AtencionListComponent implements OnInit {
  private readonly atencionService = inject(AtencionService);
  private readonly draftService = inject(AtencionDraftService);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);

  atenciones: Atencion[] = [];
  isLoading = false;
  errorMessage = '';

  desde = this.primerDiaMes();
  hasta = this.hoy();
  busquedaPaciente = '';

  page = 1;
  totalElements = 0;
  totalPages = 1;
  readonly pageSize = 15;

  showDetail = false;
  atencionDetalle?: Atencion;
  archivosDetalle: AtencionArchivo[] = [];
  isLoadingArchivos = false;

  preview: { url: string; safeUrl?: SafeResourceUrl; nombre: string; tipo?: string } | null = null;

  draft: AtencionDraft | null = null;
  showConfirmDescartar = false;

  ngOnInit(): void {
    this.draft = this.draftService.load();
    this.buscar();
  }

  continuarDraft(): void {
    this.router.navigate(['/atenciones/nueva']);
  }

  descartarDraft(): void {
    this.showConfirmDescartar = true;
  }

  confirmarDescartar(): void {
    this.draftService.clear();
    this.draft = null;
    this.showConfirmDescartar = false;
  }

  get draftPacienteNombre(): string {
    return this.draft?.paciente?.nombresApellidos ?? 'Sin paciente seleccionado';
  }

  get draftStepLabel(): string {
    const labels = ['', 'Paciente', 'Evaluación', 'Diagnósticos', 'Plan', 'Medicamentos'];
    const step = this.draft?.currentStep ?? 1;
    return `Paso ${step}: ${labels[step] ?? ''}`;
  }

  get draftTiempo(): string {
    return this.draft ? this.draftService.tiempoGuardado(this.draft.savedAt) : '';
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
    this.cargarPagina();
  }

  private cargarPagina(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.atencionService.getPage(this.desde, this.hasta, this.page - 1, this.pageSize, this.busquedaPaciente).subscribe({
      next: (data) => {
        this.atenciones = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = Math.max(1, data.totalPages);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Error al cargar atenciones.';
        this.isLoading = false;
      }
    });
  }

  get filtrados(): Atencion[] {
    return this.atenciones;
  }

  onBusquedaChange(): void {
    this.page = 1;
    this.cargarPagina();
  }

  get paginados(): Atencion[] {
    return this.atenciones;
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
    this.cargarPagina();
  }

  verDetalle(atencion: Atencion): void {
    this.atencionDetalle = atencion;
    this.archivosDetalle = [];
    this.showDetail = true;
    this.isLoadingArchivos = true;
    this.atencionService.getArchivos(atencion.id).subscribe({
      next: (a) => { this.archivosDetalle = a; this.isLoadingArchivos = false; },
      error: () => (this.isLoadingArchivos = false)
    });
  }

  abrirArchivo(fileId: number, nombre: string, tipo?: string): void {
    this.http.get(`${environment.apiUrl}/appointments/files/${fileId}/download`, { responseType: 'blob' })
      .subscribe(blob => {
        const url = URL.createObjectURL(blob);
        const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.preview = { url, safeUrl, nombre, tipo };
      });
  }

  cerrarPreview(): void {
    if (this.preview?.url) URL.revokeObjectURL(this.preview.url);
    this.preview = null;
  }

  isImagen(tipo?: string): boolean { return !!tipo?.startsWith('image/'); }
  isPDF(tipo?: string): boolean { return tipo === 'application/pdf'; }

  formatSize(bytes?: number): string {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
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
