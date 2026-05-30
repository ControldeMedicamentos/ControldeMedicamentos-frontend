import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AtencionResumen, DashboardStats } from '../../../../models/dashboard.model';
import { Inventario } from '../../../../models/inventario.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html',
  styleUrl: './dashboard-home.component.scss'
})
export class DashboardHomeComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  stats?: DashboardStats;
  isLoading = false;
  errorMessage = '';

  readonly mesActual = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' })
    .format(new Date());

  ngOnInit(): void {
    this.cargar();
  }

  cargar(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.dashboardService.getStats().subscribe({
      next: (data) => { this.stats = data; this.isLoading = false; },
      error: () => { this.errorMessage = 'Error al cargar el dashboard.'; this.isLoading = false; }
    });
  }

  barHeight(cantidad: number): number {
    const max = Math.max(...(this.stats?.atencionesPorDia ?? []).map(d => d.cantidad), 1);
    return Math.round((cantidad / max) * 100);
  }

  hbarWidth(total: number): number {
    const max = Math.max(...(this.stats?.topConsumos ?? []).map(d => d.total), 1);
    return Math.round((total / max) * 100);
  }

  diaLabel(fecha: string): string {
    const d = new Date(fecha + 'T00:00:00');
    return String(d.getDate());
  }

  nombreCorto(nombre: string): string {
    return nombre.length > 22 ? nombre.substring(0, 22) + '…' : nombre;
  }

  estadoInventario(inv: Inventario): 'vencido' | 'por_vencer' | 'bajo' {
    if (inv.fechaVencimiento) {
      const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
      const venc = new Date(inv.fechaVencimiento + 'T00:00:00');
      if (venc < hoy) return 'vencido';
      const diff = Math.floor((venc.getTime() - hoy.getTime()) / 86400000);
      if (diff <= 30) return 'por_vencer';
    }
    return 'bajo';
  }

  estadoLabel(estado: string): string {
    const map: Record<string, string> = {
      vencido: 'Vencido', por_vencer: 'Por vencer', bajo: 'Stock bajo'
    };
    return map[estado] ?? estado;
  }

  irANuevaAtencion(): void { this.router.navigate(['/atenciones/nueva']); }
  irAPacientes(): void { this.router.navigate(['/pacientes']); }
  irAMedicamentos(): void { this.router.navigate(['/medicamentos']); }
  irAAtenciones(): void { this.router.navigate(['/atenciones']); }

  accionColor(accion: string): string {
    if (accion.startsWith('LOGIN')) return 'dot-teal';
    if (accion.startsWith('CREAR') || accion.startsWith('INGRESO')) return 'dot-green';
    if (accion.startsWith('ACTUALIZAR') || accion.startsWith('GUARDAR')) return 'dot-amber';
    if (accion.startsWith('ELIMINAR') || accion.startsWith('DESACTIVAR')) return 'dot-red';
    if (accion === 'CAMBIO_CONTRASENA') return 'dot-purple';
    return 'dot-blue';
  }

  accionBadgeClass(accion: string): string {
    if (accion.startsWith('LOGIN')) return 'ab-teal';
    if (accion.startsWith('CREAR') || accion.startsWith('INGRESO')) return 'ab-green';
    if (accion.startsWith('ACTUALIZAR') || accion.startsWith('GUARDAR') || accion.startsWith('AJUSTE')) return 'ab-amber';
    if (accion.startsWith('ELIMINAR') || accion.startsWith('DESACTIVAR')) return 'ab-red';
    if (accion === 'CAMBIO_CONTRASENA') return 'ab-purple';
    return 'ab-blue';
  }

  formatTs(ts: string): string {
    const d = new Date(ts);
    const hoy = new Date();
    if (d.toDateString() === hoy.toDateString()) {
      return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    }
    return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit' })
      + ' ' + d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
  }
}
