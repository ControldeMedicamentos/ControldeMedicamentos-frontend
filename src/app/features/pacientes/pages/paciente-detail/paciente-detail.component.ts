import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AlertMessageComponent } from '../../../../shared/components/alert-message/alert-message.component';
import { ModalConfirmationComponent } from '../../../../shared/components/modal-confirmation/modal-confirmation.component';
import { Atencion } from '../../../../models/atencion.model';
import { Paciente, PacienteArchivo, PacienteCreate, TipoPaciente } from '../../../../models/paciente.model';
import { AtencionService } from '../../../atenciones/services/atencion.service';
import { PacienteFormComponent } from '../../components/paciente-form/paciente-form.component';
import { PacienteService } from '../../services/paciente.service';
import { environment } from '../../../../../environments/environment';

interface PreviewFile {
  url: string;
  safeUrl?: SafeResourceUrl;
  nombre: string;
  tipo?: string;
}

@Component({
  selector: 'app-paciente-detail',
  standalone: true,
  imports: [
    CommonModule,
    AlertMessageComponent,
    ModalConfirmationComponent,
    PacienteFormComponent
  ],
  templateUrl: './paciente-detail.component.html',
  styleUrl: './paciente-detail.component.scss'
})
export class PacienteDetailComponent implements OnInit {
  private readonly pacienteService = inject(PacienteService);
  private readonly atencionService = inject(AtencionService);
  private readonly http = inject(HttpClient);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  paciente?: Paciente;
  atenciones: Atencion[] = [];
  archivos: PacienteArchivo[] = [];

  isLoading = false;
  isLoadingAtenciones = false;
  isLoadingArchivos = false;
  isSaving = false;
  isUploading = false;
  errorMessage = '';
  modalAbierto = false;

  preview: PreviewFile | null = null;

  readonly ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
  readonly MAX_FILE_SIZE = 20 * 1024 * 1024;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.cargarPaciente(id);
  }

  cargarPaciente(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.pacienteService.getById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (data) => {
          this.paciente = data;
          this.cargarAtenciones(data.id);
          this.cargarArchivos(data.id);
        },
        error: () => (this.errorMessage = 'No se encontró el paciente.')
      });
  }

  cargarAtenciones(pacienteId: number): void {
    this.isLoadingAtenciones = true;
    this.atencionService.getByPaciente(pacienteId)
      .pipe(finalize(() => (this.isLoadingAtenciones = false)))
      .subscribe({
        next: (data) => {
          this.atenciones = data.sort((a, b) =>
            new Date(b.fechaEvaluacion).getTime() - new Date(a.fechaEvaluacion).getTime()
          );
        },
        error: () => {}
      });
  }

  cargarArchivos(pacienteId: number): void {
    this.isLoadingArchivos = true;
    this.pacienteService.getArchivos(pacienteId)
      .pipe(finalize(() => (this.isLoadingArchivos = false)))
      .subscribe({
        next: (data) => (this.archivos = data),
        error: () => {}
      });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length || !this.paciente) return;
    const file = input.files[0];
    if (!this.ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage = `Tipo no permitido: solo imágenes y PDF.`;
      return;
    }
    if (file.size > this.MAX_FILE_SIZE) {
      this.errorMessage = `Archivo demasiado grande. Máximo 20 MB.`;
      return;
    }
    this.isUploading = true;
    this.errorMessage = '';
    this.pacienteService.uploadArchivo(this.paciente.id, file).subscribe({
      next: (nuevo) => {
        this.archivos = [...this.archivos, nuevo];
        this.isUploading = false;
      },
      error: () => {
        this.errorMessage = 'Error al subir el archivo.';
        this.isUploading = false;
      }
    });
    input.value = '';
  }

  abrirPreview(archivo: PacienteArchivo): void {
    const url = `${environment.apiUrl}/patients/files/${archivo.id}/download`;
    this.http.get(url, { responseType: 'blob' }).subscribe(blob => {
      const objectUrl = URL.createObjectURL(blob);
      const safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl(objectUrl);
      this.preview = { url: objectUrl, safeUrl, nombre: archivo.nombreOriginal, tipo: archivo.tipoContenido };
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

  guardar(data: PacienteCreate): void {
    if (!this.paciente) return;
    this.isSaving = true;
    this.pacienteService.update(this.paciente.id, data)
      .pipe(finalize(() => (this.isSaving = false)))
      .subscribe({
        next: (updated) => { this.paciente = updated; this.modalAbierto = false; },
        error: () => (this.errorMessage = 'Error al actualizar el paciente.')
      });
  }

  tipoPacienteLabel(tipo: TipoPaciente): string {
    const labels: Record<TipoPaciente, string> = {
      ESTUDIANTE: 'Estudiante', DOCENTE: 'Docente',
      ADMINISTRATIVO: 'Administrativo', INVITADO: 'Invitado'
    };
    return labels[tipo] ?? '';
  }

  volver(): void { this.router.navigate(['/pacientes']); }
  irANuevaAtencion(): void { this.router.navigate(['/atenciones/nueva']); }
}
