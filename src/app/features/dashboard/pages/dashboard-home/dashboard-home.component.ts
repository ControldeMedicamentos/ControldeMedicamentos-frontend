import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AtencionResumen, DashboardStats } from '../../../../models/dashboard.model';
import { Inventario } from '../../../../models/inventario.model';
import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard-home.component.html'
})
export class DashboardHomeComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  stats?: DashboardStats;
  isLoading = false;
  errorMessage = '';

  readonly mesActual = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' })
    .format(new Date());

  ngOnInit(): void {
    this.cargar();
  }

  get isAdmin(): boolean {
    return this.auth.isAdmin();
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

  estadoInventarioClass(estado: string): string {
    const map: Record<string, string> = {
      vencido: 'bg-red-100 text-red-600',
      por_vencer: 'bg-yellow-50 text-yellow-800',
      bajo: 'bg-orange-50 text-orange-700'
    };
    return map[estado] ?? 'bg-slate-100 text-slate-500';
  }

  irANuevaAtencion(): void { this.router.navigate(['/atenciones/nueva']); }
  irAPacientes(): void { this.router.navigate(['/pacientes']); }
  irAMedicamentos(): void { this.router.navigate(['/medicamentos']); }
  irAAtenciones(): void { this.router.navigate(['/atenciones']); }

  accionColor(accion: string): string {
    if (accion.startsWith('LOGIN')) return 'bg-teal-600';
    if (accion.startsWith('CREAR') || accion.startsWith('INGRESO')) return 'bg-green-600';
    if (accion.startsWith('ACTUALIZAR') || accion.startsWith('GUARDAR')) return 'bg-amber-600';
    if (accion.startsWith('ELIMINAR') || accion.startsWith('DESACTIVAR')) return 'bg-red-600';
    if (accion === 'CAMBIO_CONTRASENA') return 'bg-purple-600';
    return 'bg-primary-600';
  }

  accionBadgeClass(accion: string): string {
    if (accion.startsWith('LOGIN')) return 'bg-teal-50 border-teal-200 text-teal-700';
    if (accion.startsWith('CREAR') || accion.startsWith('INGRESO')) return 'bg-green-50 border-green-200 text-green-700';
    if (accion.startsWith('ACTUALIZAR') || accion.startsWith('GUARDAR') || accion.startsWith('AJUSTE')) return 'bg-amber-50 border-amber-200 text-amber-800';
    if (accion.startsWith('ELIMINAR') || accion.startsWith('DESACTIVAR')) return 'bg-red-50 border-red-200 text-red-600';
    if (accion === 'CAMBIO_CONTRASENA') return 'bg-purple-50 border-purple-200 text-purple-700';
    return 'bg-blue-50 border-blue-200 text-blue-700';
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
