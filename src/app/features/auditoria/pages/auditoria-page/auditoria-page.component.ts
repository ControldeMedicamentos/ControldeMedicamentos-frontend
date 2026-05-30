import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuditLog } from '../../../../models/audit-log.model';
import { AuditoriaService } from '../../services/auditoria.service';

@Component({
  selector: 'app-auditoria-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria-page.component.html',
  styleUrl: './auditoria-page.component.scss'
})
export class AuditoriaPageComponent implements OnInit {
  private readonly auditoriaService = inject(AuditoriaService);

  logs: AuditLog[] = [];
  totalElements = 0;
  totalPages = 0;
  currentPage = 0;
  readonly pageSize = 20;
  isLoading = false;
  errorMessage = '';

  filtroEmail = '';
  filtroModulo = '';
  filtroAccion = '';
  filtroDesde = '';
  filtroHasta = '';

  readonly modulos = ['Seguridad', 'Empleados', 'Roles', 'Pacientes', 'Atenciones', 'Medicamentos', 'Inventario', 'Reportes'];

  readonly acciones = [
    'LOGIN_EXITOSO', 'CAMBIO_CONTRASENA',
    'CREAR_EMPLEADO', 'ACTUALIZAR_EMPLEADO', 'ACTIVAR_EMPLEADO', 'DESACTIVAR_EMPLEADO',
    'CREAR_ROL', 'ACTUALIZAR_ROL', 'ELIMINAR_ROL', 'GUARDAR_PERMISOS',
    'CONSULTAR_PACIENTES', 'CONSULTAR_DETALLE_PACIENTE',
    'CREAR_PACIENTE', 'ACTUALIZAR_PACIENTE', 'ACTIVAR_PACIENTE', 'DESACTIVAR_PACIENTE',
    'SUBIR_ARCHIVO',
    'CONSULTAR_ATENCIONES', 'CONSULTAR_ATENCIONES_PACIENTE', 'CREAR_ATENCION',
    'CREAR_MEDICAMENTO', 'ACTUALIZAR_MEDICAMENTO', 'ACTIVAR_MEDICAMENTO', 'DESACTIVAR_MEDICAMENTO', 'ELIMINAR_MEDICAMENTO',
    'INGRESO_INVENTARIO', 'AJUSTE_INVENTARIO',
    'CONSULTAR_REPORTE', 'EXPORTAR_REPORTE', 'CIERRE_MES'
  ];

  ngOnInit(): void { this.cargar(); }

  cargar(page = 0): void {
    this.isLoading = true;
    this.currentPage = page;
    this.auditoriaService.getLogs({
      email: this.filtroEmail || undefined,
      modulo: this.filtroModulo || undefined,
      accion: this.filtroAccion || undefined,
      desde: this.filtroDesde || undefined,
      hasta: this.filtroHasta || undefined,
      page,
      size: this.pageSize
    }).subscribe({
      next: (data) => {
        this.logs = data.content;
        this.totalElements = data.totalElements;
        this.totalPages = data.totalPages;
        this.isLoading = false;
        this.errorMessage = '';
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 403) {
          this.errorMessage = 'No tiene permisos para ver la auditoría. Se requiere rol ADMIN.';
        } else {
          this.errorMessage = 'Error al cargar los registros de auditoría.';
        }
      }
    });
  }

  aplicarFiltros(): void { this.cargar(0); }

  limpiarFiltros(): void {
    this.filtroEmail = '';
    this.filtroModulo = '';
    this.filtroAccion = '';
    this.filtroDesde = '';
    this.filtroHasta = '';
    this.cargar(0);
  }

  get pageNumbers(): number[] {
    const start = Math.max(0, this.currentPage - 2);
    const end = Math.min(this.totalPages - 1, this.currentPage + 2);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  accionClass(accion: string): string {
    if (accion.startsWith('LOGIN')) return 'badge-teal';
    if (accion.startsWith('CREAR')) return 'badge-green';
    if (accion.startsWith('ACTUALIZAR') || accion.startsWith('GUARDAR')) return 'badge-amber';
    if (accion.startsWith('ELIMINAR') || accion.startsWith('DESACTIVAR') || accion === 'AJUSTE_INVENTARIO') return 'badge-red';
    if (accion.startsWith('ACTIVAR') || accion.startsWith('INGRESO')) return 'badge-blue';
    if (accion === 'CAMBIO_CONTRASENA') return 'badge-purple';
    return 'badge-gray';
  }

  moduloClass(modulo: string): string {
    const map: Record<string, string> = {
      'Seguridad': 'badge-red', 'Empleados': 'badge-amber', 'Roles': 'badge-purple',
      'Pacientes': 'badge-blue', 'Atenciones': 'badge-teal', 'Medicamentos': 'badge-green',
      'Inventario': 'badge-orange', 'Reportes': 'badge-gray'
    };
    return map[modulo] ?? 'badge-gray';
  }

  formatTs(ts: string): string {
    const d = new Date(ts);
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })
      + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}
