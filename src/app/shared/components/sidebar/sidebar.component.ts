import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface MenuItem {
  label: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  private readonly authService = inject(AuthService);

  readonly items: MenuItem[] = [
    { label: 'Dashboard',    path: '/dashboard',           icon: 'pi pi-home' },
    { label: 'Pacientes',    path: '/pacientes',            icon: 'pi pi-users' },
    { label: 'Atenciones',   path: '/atenciones',           icon: 'pi pi-clipboard' },
    { label: 'Medicamentos', path: '/medicamentos',         icon: 'pi pi-box' },
    { label: 'Inventario',   path: '/medicamentos/ajustes', icon: 'pi pi-sliders-h' },
    { label: 'Reportes',     path: '/reportes',             icon: 'pi pi-file-excel' }
  ];

  readonly adminItems: MenuItem[] = [
    { label: 'Empleados',  path: '/empleados',  icon: 'pi pi-id-card' },
    { label: 'Roles',      path: '/roles',      icon: 'pi pi-shield' },
    { label: 'Auditoría',  path: '/auditoria',  icon: 'pi pi-history' }
  ];

  get isAdmin(): boolean {
    return this.authService.getCurrentUser()?.rol === 'ADMIN';
  }
}
